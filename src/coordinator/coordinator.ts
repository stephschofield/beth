/**
 * Patch Queue Coordinator
 *
 * The main coordinator loop that serializes concurrent agent changes.
 *
 * Flow:
 *   1. Acquire lock (only one coordinator at a time)
 *   2. Poll queue/ for pending patches
 *   3. Dequeue the next patch (move to applying/)
 *   4. Apply the patch to the target branch
 *   5. On success → move to applied/, push
 *   6. On conflict → move to rejected/ (agent retries)
 *   7. Repeat until stopped
 *
 * The coordinator runs as a long-lived process (beth patch serve)
 * or can process one batch (beth patch apply-all).
 */

import type {
  ResolvedConfig,
  CoordinatorConfig,
  CoordinatorStatus,
  ApplyResult,
  PatchEnvelope,
} from './types.js';
import { CoordinatorError } from './types.js';
import {
  resolveConfig,
  initQueue,
  dequeue,
  markApplied,
  markRejected,
  acquireLock,
  releaseLock,
  getQueueCounts,
  getHeadSha,
  git,
} from './queue.js';
import { applyPatch } from './apply.js';

// =============================================================================
// Coordinator Observer
// =============================================================================

/**
 * Callbacks for observing coordinator events.
 * Useful for logging, CLI output, and monitoring.
 */
export interface CoordinatorObserver {
  onStart?: () => void;
  onStop?: () => void;
  onPatchDequeued?: (patch: PatchEnvelope) => void;
  onPatchApplied?: (result: ApplyResult) => void;
  onPatchRejected?: (patch: PatchEnvelope, reason: string) => void;
  onPushComplete?: (branch: string, sha: string) => void;
  onError?: (error: Error) => void;
  onIdle?: () => void;
}

// =============================================================================
// Coordinator
// =============================================================================

/**
 * The Patch Queue Coordinator.
 *
 * Manages the lifecycle of the coordination loop:
 * - Acquires an exclusive lock so only one coordinator runs
 * - Polls the queue for patches
 * - Applies patches one at a time to the target branch
 * - Pushes after each successful apply
 * - Rejects patches that conflict
 *
 * @example
 * ```typescript
 * const coordinator = new PatchCoordinator({
 *   repoRoot: '/path/to/repo',
 *   targetBranch: 'main',
 * });
 *
 * // Run continuously (Ctrl+C to stop)
 * await coordinator.serve();
 *
 * // Or process all pending patches once
 * const results = await coordinator.applyAll();
 * ```
 */
export class PatchCoordinator {
  private readonly config: ResolvedConfig;
  private readonly observer: CoordinatorObserver;
  private running = false;
  private appliedCount = 0;
  private rejectedCount = 0;

  constructor(config: CoordinatorConfig, observer?: CoordinatorObserver) {
    this.config = resolveConfig(config);
    this.observer = observer ?? {};
  }

  /**
   * Initialize the queue directory structure.
   */
  async init(): Promise<void> {
    await initQueue(this.config);
  }

  /**
   * Process all pending patches once, then return.
   *
   * @param push - Whether to push after each successful apply (default: true)
   * @returns Array of apply results
   */
  async applyAll(push = true): Promise<ApplyResult[]> {
    const locked = await acquireLock(this.config);
    if (!locked) {
      throw new CoordinatorError('Another coordinator is running', 'QUEUE_LOCKED');
    }

    try {
      const results: ApplyResult[] = [];

      while (true) {
        const patch = await dequeue(this.config);
        if (!patch) break; // Queue empty

        this.observer.onPatchDequeued?.(patch);

        // Check if patch is expired
        if (this.isPatchExpired(patch)) {
          const headSha = await getHeadSha(this.config);
          await markRejected(this.config, patch, 'Patch expired (too old or too many retries)', headSha);
          this.rejectedCount++;
          this.observer.onPatchRejected?.(patch, 'expired');
          continue;
        }

        const result = await applyPatch(this.config, patch);
        results.push(result);

        if (result.success) {
          await markApplied(this.config, patch, result.commitSha!);
          this.appliedCount++;
          this.observer.onPatchApplied?.(result);

          if (push) {
            await this.pushTarget();
          }
        } else {
          const headSha = await getHeadSha(this.config);
          await markRejected(this.config, patch, result.error ?? 'Unknown conflict', headSha);
          this.rejectedCount++;
          this.observer.onPatchRejected?.(patch, result.error ?? 'Unknown conflict');
        }
      }

      return results;

    } finally {
      await releaseLock(this.config);
    }
  }

  /**
   * Run the coordinator as a long-lived polling loop.
   *
   * Acquires the lock and continuously polls for patches.
   * Call stop() to terminate gracefully.
   *
   * @param push - Whether to push after each successful apply (default: true)
   */
  async serve(push = true): Promise<void> {
    const locked = await acquireLock(this.config);
    if (!locked) {
      throw new CoordinatorError('Another coordinator is running', 'QUEUE_LOCKED');
    }

    this.running = true;
    this.observer.onStart?.();

    try {
      while (this.running) {
        const patch = await dequeue(this.config);

        if (!patch) {
          this.observer.onIdle?.();
          await sleep(this.config.pollIntervalMs);
          continue;
        }

        this.observer.onPatchDequeued?.(patch);

        // Check if patch is expired
        if (this.isPatchExpired(patch)) {
          const headSha = await getHeadSha(this.config);
          await markRejected(this.config, patch, 'Patch expired', headSha);
          this.rejectedCount++;
          this.observer.onPatchRejected?.(patch, 'expired');
          continue;
        }

        const result = await applyPatch(this.config, patch);

        if (result.success) {
          await markApplied(this.config, patch, result.commitSha!);
          this.appliedCount++;
          this.observer.onPatchApplied?.(result);

          if (push) {
            await this.pushTarget();
          }
        } else {
          const headSha = await getHeadSha(this.config);
          await markRejected(this.config, patch, result.error ?? 'Unknown conflict', headSha);
          this.rejectedCount++;
          this.observer.onPatchRejected?.(patch, result.error ?? 'Unknown conflict');
        }
      }

    } finally {
      this.running = false;
      await releaseLock(this.config);
      this.observer.onStop?.();
    }
  }

  /**
   * Stop the coordinator loop gracefully.
   */
  stop(): void {
    this.running = false;
  }

  /**
   * Get the current status of the coordinator.
   */
  async status(): Promise<CoordinatorStatus> {
    const counts = await getQueueCounts(this.config);
    const headSha = await getHeadSha(this.config);
    return {
      running: this.running,
      queuedCount: counts.queued,
      appliedCount: this.appliedCount,
      rejectedCount: this.rejectedCount,
      headSha,
      targetBranch: this.config.targetBranch,
    };
  }

  // ===========================================================================
  // Private
  // ===========================================================================

  /**
   * Push the target branch to origin.
   */
  private async pushTarget(): Promise<void> {
    const branch = this.config.targetBranch;
    await git(this.config, ['push', 'origin', branch]);
    const sha = await getHeadSha(this.config);
    this.observer.onPushComplete?.(branch, sha);
  }

  /**
   * Check if a patch has expired (age or retry count).
   */
  private isPatchExpired(patch: PatchEnvelope): boolean {
    const age = Date.now() - new Date(patch.submittedAt).getTime();
    if (age > this.config.maxPatchAgeMs) return true;
    if (patch.retryCount >= this.config.maxRetries) return true;
    return false;
  }
}

// =============================================================================
// Helpers
// =============================================================================

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

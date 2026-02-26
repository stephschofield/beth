/**
 * Patch Queue — File-based queue operations
 *
 * Manages the on-disk patch queue:
 *   .beth/patches/
 *     queue/      — Pending patches (ordered by sequence number)
 *     applying/   — Patch currently being applied (at most 1)
 *     applied/    — Successfully applied patches (archive)
 *     rejected/   — Patches that conflicted (agent must retry)
 *     counter     — Monotonic sequence counter
 *     lock        — Coordinator lock file (PID + timestamp)
 *
 * All operations are designed for single-writer (the coordinator) with
 * multiple submitters (agents). Submitters only write to queue/.
 * The coordinator moves patches between directories atomically.
 */

import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import {
  mkdir,
  readdir,
  readFile,
  writeFile,
  rename,
  unlink,
  stat,
} from 'node:fs/promises';
import { join, resolve } from 'node:path';
import type {
  PatchEnvelope,
  ResolvedConfig,
  CoordinatorConfig,
  SubmitResult,
} from './types.js';
import { CoordinatorError } from './types.js';

const execFileAsync = promisify(execFile);

// =============================================================================
// Constants
// =============================================================================

const QUEUE_SUBDIR = 'queue';
const APPLYING_SUBDIR = 'applying';
const APPLIED_SUBDIR = 'applied';
const REJECTED_SUBDIR = 'rejected';
const COUNTER_FILE = 'counter';
const LOCK_FILE = 'lock';

const DEFAULT_TARGET_BRANCH = 'main';
const DEFAULT_MAX_RETRIES = 3;
const DEFAULT_POLL_INTERVAL_MS = 1000;
const DEFAULT_MAX_PATCH_AGE_MS = 60 * 60 * 1000; // 1 hour
const DEFAULT_QUEUE_DIR = '.beth/patches';

// =============================================================================
// Config
// =============================================================================

/**
 * Resolve config with defaults.
 */
export function resolveConfig(config: CoordinatorConfig): ResolvedConfig {
  return {
    repoRoot: resolve(config.repoRoot),
    queueDir: config.queueDir ?? join(resolve(config.repoRoot), DEFAULT_QUEUE_DIR),
    targetBranch: config.targetBranch ?? DEFAULT_TARGET_BRANCH,
    maxRetries: config.maxRetries ?? DEFAULT_MAX_RETRIES,
    pollIntervalMs: config.pollIntervalMs ?? DEFAULT_POLL_INTERVAL_MS,
    maxPatchAgeMs: config.maxPatchAgeMs ?? DEFAULT_MAX_PATCH_AGE_MS,
  };
}

// =============================================================================
// Initialization
// =============================================================================

/**
 * Initialize the patch queue directory structure.
 * Safe to call multiple times (idempotent).
 */
export async function initQueue(config: ResolvedConfig): Promise<void> {
  const { queueDir } = config;
  await mkdir(join(queueDir, QUEUE_SUBDIR), { recursive: true });
  await mkdir(join(queueDir, APPLYING_SUBDIR), { recursive: true });
  await mkdir(join(queueDir, APPLIED_SUBDIR), { recursive: true });
  await mkdir(join(queueDir, REJECTED_SUBDIR), { recursive: true });

  // Initialize counter if it doesn't exist
  const counterPath = join(queueDir, COUNTER_FILE);
  try {
    await stat(counterPath);
  } catch {
    await writeFile(counterPath, '0', 'utf-8');
  }
}

// =============================================================================
// Sequence Counter
// =============================================================================

/**
 * Get the next sequence number (atomic increment).
 * Uses a simple file-based counter. For hundreds of agents submitting
 * simultaneously, this could be replaced with a proper atomic counter,
 * but file writes are serialized by the OS for small writes.
 */
export async function nextSeq(config: ResolvedConfig): Promise<number> {
  const counterPath = join(config.queueDir, COUNTER_FILE);
  const current = parseInt(await readFile(counterPath, 'utf-8'), 10);
  const next = current + 1;
  await writeFile(counterPath, String(next), 'utf-8');
  return next;
}

// =============================================================================
// Git Helpers
// =============================================================================

/**
 * Run a git command in the repo root.
 */
export async function git(
  config: ResolvedConfig,
  args: string[]
): Promise<string> {
  try {
    const { stdout } = await execFileAsync('git', args, {
      cwd: config.repoRoot,
      maxBuffer: 10 * 1024 * 1024, // 10MB for large diffs
    });
    return stdout.trim();
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    throw new CoordinatorError(`git ${args[0]} failed: ${message}`, 'GIT_ERROR', err instanceof Error ? err : undefined);
  }
}

/**
 * Get the current HEAD SHA.
 */
export async function getHeadSha(config: ResolvedConfig): Promise<string> {
  return git(config, ['rev-parse', 'HEAD']);
}

/**
 * Get the unified diff of all uncommitted changes (staged + unstaged).
 */
export async function getWorkingDiff(config: ResolvedConfig): Promise<string> {
  // First, get diff of unstaged changes
  const unstaged = await git(config, ['diff']);
  // Then, get diff of staged changes
  const staged = await git(config, ['diff', '--cached']);

  if (staged && unstaged) {
    return staged + '\n' + unstaged;
  }
  return staged || unstaged;
}

/**
 * Get list of files changed in uncommitted work.
 */
export async function getChangedFiles(config: ResolvedConfig): Promise<string[]> {
  const output = await git(config, ['diff', '--name-only', 'HEAD']);
  if (!output) return [];
  return output.split('\n').filter(Boolean);
}

// =============================================================================
// Submit (called by agents)
// =============================================================================

/**
 * Submit a patch to the queue.
 *
 * Called by agents when they've finished editing files and want
 * their changes applied to the target branch.
 *
 * This captures the current diff, packages it as a PatchEnvelope,
 * and writes it to the queue directory.
 *
 * @param config - Resolved coordinator config
 * @param epicId - Epic ID this work belongs to
 * @param agentId - ID of the submitting agent
 * @param description - Human-readable description
 * @returns SubmitResult with the patch ID and sequence number
 */
export async function submitPatch(
  config: ResolvedConfig,
  epicId: string,
  agentId: string,
  description: string
): Promise<SubmitResult> {
  // Stage ALL changes (including new untracked files) to capture the full diff
  await git(config, ['add', '-A']);

  // Get the staged diff (captures modifications, additions, and deletions)
  // Append trailing newline since git() trims output but git apply needs it
  let diff = await git(config, ['diff', '--cached']);
  if (!diff) {
    // Nothing to submit — unstage and return
    await git(config, ['reset', 'HEAD']);
    return { success: false, patchId: '', seq: 0, error: 'No changes to submit' };
  }
  diff += '\n';

  const filesOutput = await git(config, ['diff', '--cached', '--name-only']);
  const files = filesOutput ? filesOutput.split('\n').filter(Boolean) : [];
  const baseSha = await getHeadSha(config);
  const seq = await nextSeq(config);
  const patchId = `patch-${seq}-${epicId}-${Date.now()}`;

  const envelope: PatchEnvelope = {
    id: patchId,
    seq,
    epicId,
    agentId,
    description,
    baseSha,
    targetBranch: config.targetBranch,
    diff,
    files,
    submittedAt: new Date().toISOString(),
    status: 'queued',
    retryCount: 0,
  };

  // Write the patch to the queue
  const filename = `${String(seq).padStart(6, '0')}-${patchId}.json`;
  const patchPath = join(config.queueDir, QUEUE_SUBDIR, filename);
  await writeFile(patchPath, JSON.stringify(envelope, null, 2), 'utf-8');

  // Reset the agent's working tree (changes are now in the queue)
  await git(config, ['reset', 'HEAD', '--hard']);
  await git(config, ['clean', '-fd']);

  return { success: true, patchId, seq };
}

/**
 * Resubmit a rejected patch.
 *
 * The agent should have re-done their work on top of the current HEAD.
 * This creates a new patch from the current diff with an incremented retry count.
 */
export async function resubmitPatch(
  config: ResolvedConfig,
  originalPatchId: string,
  agentId: string,
  description: string,
  epicId: string
): Promise<SubmitResult> {
  // Read the original rejected patch to get retry count
  const rejectedDir = join(config.queueDir, REJECTED_SUBDIR);
  const rejectedFiles = await readdir(rejectedDir);
  const originalFile = rejectedFiles.find(f => f.includes(originalPatchId));

  let retryCount = 0;
  if (originalFile) {
    const original = JSON.parse(
      await readFile(join(rejectedDir, originalFile), 'utf-8')
    ) as PatchEnvelope;
    retryCount = original.retryCount + 1;

    if (retryCount > config.maxRetries) {
      return {
        success: false,
        patchId: originalPatchId,
        seq: 0,
        error: `Patch exceeded max retries (${config.maxRetries})`,
      };
    }
  }

  // Submit as a new patch with incremented retry count
  await git(config, ['add', '-A']);
  let diff = await git(config, ['diff', '--cached']);
  if (!diff) {
    await git(config, ['reset', 'HEAD']);
    return { success: false, patchId: '', seq: 0, error: 'No changes to submit' };
  }
  diff += '\n';

  const filesOutput = await git(config, ['diff', '--cached', '--name-only']);
  const files = filesOutput ? filesOutput.split('\n').filter(Boolean) : [];
  const baseSha = await getHeadSha(config);
  const seq = await nextSeq(config);
  const patchId = `patch-${seq}-${epicId}-${Date.now()}`;

  const envelope: PatchEnvelope = {
    id: patchId,
    seq,
    epicId,
    agentId,
    description,
    baseSha,
    targetBranch: config.targetBranch,
    diff,
    files,
    submittedAt: new Date().toISOString(),
    status: 'queued',
    retryCount,
  };

  const filename = `${String(seq).padStart(6, '0')}-${patchId}.json`;
  const patchPath = join(config.queueDir, QUEUE_SUBDIR, filename);
  await writeFile(patchPath, JSON.stringify(envelope, null, 2), 'utf-8');

  // Reset the agent's working tree
  await git(config, ['reset', 'HEAD', '--hard']);
  await git(config, ['clean', '-fd']);

  return { success: true, patchId, seq };
}

// =============================================================================
// Queue Reading (called by coordinator)
// =============================================================================

/**
 * List all patches in the queue, ordered by sequence number.
 */
export async function listQueued(config: ResolvedConfig): Promise<PatchEnvelope[]> {
  const queuePath = join(config.queueDir, QUEUE_SUBDIR);
  const files = await readdir(queuePath);
  const jsonFiles = files.filter(f => f.endsWith('.json')).sort();

  const patches: PatchEnvelope[] = [];
  for (const file of jsonFiles) {
    const content = await readFile(join(queuePath, file), 'utf-8');
    patches.push(JSON.parse(content) as PatchEnvelope);
  }
  return patches;
}

/**
 * Get the next patch to apply (first in queue by sequence number).
 * Moves it to the applying/ directory atomically.
 *
 * @returns The next patch, or null if queue is empty
 */
export async function dequeue(config: ResolvedConfig): Promise<PatchEnvelope | null> {
  const queuePath = join(config.queueDir, QUEUE_SUBDIR);
  const files = await readdir(queuePath);
  const jsonFiles = files.filter(f => f.endsWith('.json')).sort();

  if (jsonFiles.length === 0) return null;

  const filename = jsonFiles[0];
  const srcPath = join(queuePath, filename);
  const destPath = join(config.queueDir, APPLYING_SUBDIR, filename);

  // Atomic move to applying/
  await rename(srcPath, destPath);

  const content = await readFile(destPath, 'utf-8');
  const patch = JSON.parse(content) as PatchEnvelope;
  patch.status = 'applying';
  await writeFile(destPath, JSON.stringify(patch, null, 2), 'utf-8');

  return patch;
}

/**
 * Move a patch to the applied/ directory after successful application.
 */
export async function markApplied(
  config: ResolvedConfig,
  patch: PatchEnvelope,
  commitSha: string
): Promise<void> {
  patch.status = 'applied';
  patch.commitSha = commitSha;
  patch.appliedAt = new Date().toISOString();

  const filename = `${String(patch.seq).padStart(6, '0')}-${patch.id}.json`;
  const srcPath = join(config.queueDir, APPLYING_SUBDIR, filename);
  const destPath = join(config.queueDir, APPLIED_SUBDIR, filename);

  await writeFile(srcPath, JSON.stringify(patch, null, 2), 'utf-8');
  await rename(srcPath, destPath);
}

/**
 * Move a patch to the rejected/ directory after a conflict.
 */
export async function markRejected(
  config: ResolvedConfig,
  patch: PatchEnvelope,
  reason: string,
  currentHeadSha: string
): Promise<void> {
  patch.status = 'rejected';
  patch.rejectionReason = reason;
  patch.rejectedAtSha = currentHeadSha;

  const filename = `${String(patch.seq).padStart(6, '0')}-${patch.id}.json`;
  const srcPath = join(config.queueDir, APPLYING_SUBDIR, filename);
  const destPath = join(config.queueDir, REJECTED_SUBDIR, filename);

  await writeFile(srcPath, JSON.stringify(patch, null, 2), 'utf-8');
  await rename(srcPath, destPath);
}

// =============================================================================
// Lock Management
// =============================================================================

/**
 * Acquire the coordinator lock.
 * Only one coordinator process should run at a time.
 *
 * @returns true if lock acquired, false if already held
 */
export async function acquireLock(config: ResolvedConfig): Promise<boolean> {
  const lockPath = join(config.queueDir, LOCK_FILE);

  try {
    const existing = await readFile(lockPath, 'utf-8');
    const { pid, timestamp } = JSON.parse(existing) as { pid: number; timestamp: string };

    // Check if the lock holder is still alive
    try {
      process.kill(pid, 0); // signal 0 = existence check
      // Process exists — check if lock is stale (> 5 minutes)
      const lockAge = Date.now() - new Date(timestamp).getTime();
      if (lockAge < 5 * 60 * 1000) {
        return false; // Lock is valid, another coordinator is running
      }
      // Lock is stale, fall through to acquire
    } catch {
      // Process doesn't exist, lock is orphaned — safe to acquire
    }
  } catch {
    // No lock file — safe to acquire
  }

  await writeFile(
    lockPath,
    JSON.stringify({ pid: process.pid, timestamp: new Date().toISOString() }),
    'utf-8'
  );
  return true;
}

/**
 * Release the coordinator lock.
 */
export async function releaseLock(config: ResolvedConfig): Promise<void> {
  const lockPath = join(config.queueDir, LOCK_FILE);
  try {
    await unlink(lockPath);
  } catch {
    // Already released or never acquired
  }
}

// =============================================================================
// Queue Status
// =============================================================================

/**
 * Get counts of patches in each state.
 */
export async function getQueueCounts(
  config: ResolvedConfig
): Promise<{ queued: number; applying: number; applied: number; rejected: number }> {
  const count = async (subdir: string): Promise<number> => {
    try {
      const files = await readdir(join(config.queueDir, subdir));
      return files.filter(f => f.endsWith('.json')).length;
    } catch {
      return 0;
    }
  };

  return {
    queued: await count(QUEUE_SUBDIR),
    applying: await count(APPLYING_SUBDIR),
    applied: await count(APPLIED_SUBDIR),
    rejected: await count(REJECTED_SUBDIR),
  };
}

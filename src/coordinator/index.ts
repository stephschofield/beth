/**
 * Patch Queue Coordinator — Barrel Exports
 *
 * The coordinator serializes concurrent agent changes through a
 * file-based patch queue, preventing merge conflicts at scale.
 *
 * @example
 * ```typescript
 * import { PatchCoordinator, submitPatch, resolveConfig } from './coordinator';
 *
 * // Agent submits work
 * const config = resolveConfig({ repoRoot: '/path/to/repo' });
 * await submitPatch(config, 'beth-abc123', 'developer-1', 'Add auth flow');
 *
 * // Coordinator applies patches
 * const coordinator = new PatchCoordinator({ repoRoot: '/path/to/repo' });
 * await coordinator.init();
 * await coordinator.serve();
 * ```
 */

// Types
export type {
  PatchEnvelope,
  PatchStatus,
  CoordinatorConfig,
  ResolvedConfig,
  SubmitResult,
  ApplyResult,
  CoordinatorStatus,
  CoordinatorErrorCode,
} from './types.js';
export { CoordinatorError } from './types.js';

// Queue operations (used by agents)
export {
  resolveConfig,
  initQueue,
  submitPatch,
  resubmitPatch,
  listQueued,
  getQueueCounts,
  getHeadSha,
} from './queue.js';

// Patch application (used by coordinator)
export { applyPatch } from './apply.js';

// Coordinator (main entry point)
export { PatchCoordinator } from './coordinator.js';
export type { CoordinatorObserver } from './coordinator.js';

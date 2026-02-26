/**
 * Patch Queue Coordinator — Types
 *
 * Type definitions for the patch queue system that serializes
 * concurrent agent changes into a clean commit history.
 *
 * Flow:
 *   Agent edits files → submits patch → queue/ → coordinator applies → applied/ or rejected/
 */

// =============================================================================
// Patch Envelope
// =============================================================================

/**
 * Status of a patch in the queue.
 */
export type PatchStatus = 'queued' | 'applying' | 'applied' | 'rejected' | 'expired';

/**
 * A patch envelope wrapping a git diff with metadata.
 * This is what gets serialized to disk in the queue.
 */
export interface PatchEnvelope {
  /** Unique patch ID (monotonic counter + timestamp) */
  id: string;

  /** Sequence number for ordering (monotonic) */
  seq: number;

  /** Epic ID this patch belongs to */
  epicId: string;

  /** Agent that produced this patch */
  agentId: string;

  /** Human-readable description of the change */
  description: string;

  /** Git SHA the patch was generated against */
  baseSha: string;

  /** Target branch to apply this patch to */
  targetBranch: string;

  /** The unified diff content (output of git diff) */
  diff: string;

  /** Files touched by this patch (for conflict detection) */
  files: string[];

  /** ISO timestamp when the patch was submitted */
  submittedAt: string;

  /** Current status */
  status: PatchStatus;

  /** Number of times this patch has been retried */
  retryCount: number;

  /** If rejected, the SHA of HEAD when rejection occurred */
  rejectedAtSha?: string;

  /** If rejected, the error message */
  rejectionReason?: string;

  /** If applied, the resulting commit SHA */
  commitSha?: string;

  /** If applied, ISO timestamp */
  appliedAt?: string;
}

// =============================================================================
// Queue Configuration
// =============================================================================

/**
 * Configuration for the patch queue coordinator.
 */
export interface CoordinatorConfig {
  /** Root directory of the repository */
  repoRoot: string;

  /** Directory for the patch queue (default: .beth/patches) */
  queueDir?: string;

  /** Target branch to apply patches to (default: main) */
  targetBranch?: string;

  /** Maximum retry count before a patch is expired (default: 3) */
  maxRetries?: number;

  /** Poll interval in ms for the coordinator loop (default: 1000) */
  pollIntervalMs?: number;

  /** Maximum patch age in ms before expiry (default: 1 hour) */
  maxPatchAgeMs?: number;
}

/** Resolved config with all defaults applied */
export interface ResolvedConfig {
  repoRoot: string;
  queueDir: string;
  targetBranch: string;
  maxRetries: number;
  pollIntervalMs: number;
  maxPatchAgeMs: number;
}

// =============================================================================
// Operation Results
// =============================================================================

/**
 * Result of submitting a patch to the queue.
 */
export interface SubmitResult {
  /** Whether the submission was accepted */
  success: boolean;

  /** The assigned patch ID */
  patchId: string;

  /** Sequence number in the queue */
  seq: number;

  /** Error message if submission failed */
  error?: string;
}

/**
 * Result of applying a single patch.
 */
export interface ApplyResult {
  /** Whether the patch applied cleanly */
  success: boolean;

  /** The patch that was processed */
  patchId: string;

  /** Resulting commit SHA if successful */
  commitSha?: string;

  /** Error/conflict description if failed */
  error?: string;

  /** Files that conflicted (if any) */
  conflictFiles?: string[];

  /** Current HEAD SHA (so agent can rebase) */
  currentHeadSha?: string;
}

/**
 * Status snapshot of the coordinator.
 */
export interface CoordinatorStatus {
  /** Whether the coordinator is running */
  running: boolean;

  /** Number of patches in the queue */
  queuedCount: number;

  /** Number of patches applied this session */
  appliedCount: number;

  /** Number of patches rejected this session */
  rejectedCount: number;

  /** Current HEAD of the target branch */
  headSha: string;

  /** Target branch name */
  targetBranch: string;
}

// =============================================================================
// Coordinator Errors
// =============================================================================

/**
 * Error codes for coordinator operations.
 */
export type CoordinatorErrorCode =
  | 'QUEUE_LOCKED'       // Another coordinator instance holds the lock
  | 'INVALID_PATCH'      // Patch envelope is malformed
  | 'APPLY_CONFLICT'     // Patch conflicts with current state
  | 'GIT_ERROR'          // Git command failed
  | 'QUEUE_FULL'         // Too many pending patches
  | 'PATCH_EXPIRED'      // Patch exceeded max age or retries
  | 'NOT_INITIALIZED';   // Queue directory not set up

/**
 * Custom error for coordinator operations.
 */
export class CoordinatorError extends Error {
  readonly code: CoordinatorErrorCode;
  readonly cause?: Error;

  constructor(message: string, code: CoordinatorErrorCode, cause?: Error) {
    super(message);
    this.name = 'CoordinatorError';
    this.code = code;
    this.cause = cause;
  }
}

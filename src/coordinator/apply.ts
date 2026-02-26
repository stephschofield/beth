/**
 * Patch Applicator
 *
 * Applies a single patch to the target branch.
 *
 * Strategy:
 *   1. Ensure we're on the target branch with a clean worktree
 *   2. Try `git apply --check` (dry run) to detect conflicts
 *   3. If clean: apply the patch, stage, commit
 *   4. If conflict: reject the patch with details
 *
 * The applicator never forces anything. If a patch doesn't apply
 * cleanly, it gets rejected and the agent is expected to redo
 * their work on top of the current HEAD.
 */

import type { PatchEnvelope, ApplyResult, ResolvedConfig } from './types.js';
import { CoordinatorError } from './types.js';
import { git, getHeadSha } from './queue.js';

// =============================================================================
// Apply
// =============================================================================

/**
 * Apply a single patch to the target branch.
 *
 * @param config - Resolved coordinator config
 * @param patch - The patch envelope to apply
 * @returns ApplyResult indicating success or failure
 */
export async function applyPatch(
  config: ResolvedConfig,
  patch: PatchEnvelope
): Promise<ApplyResult> {
  const currentHead = await getHeadSha(config);

  // Step 1: Verify we're on the target branch with clean worktree
  await ensureCleanWorktree(config);
  await ensureOnBranch(config, patch.targetBranch);

  // Step 2: Write the diff to a temp file for git apply
  const { writeFile, unlink } = await import('node:fs/promises');
  const { join } = await import('node:path');
  const patchFile = join(config.queueDir, `_applying_${patch.id}.patch`);

  try {
    await writeFile(patchFile, patch.diff, 'utf-8');

    // Step 3: Dry-run check
    const checkResult = await tryGitApply(config, patchFile, true);
    if (!checkResult.success) {
      return {
        success: false,
        patchId: patch.id,
        error: checkResult.error,
        conflictFiles: checkResult.conflictFiles,
        currentHeadSha: currentHead,
      };
    }

    // Step 4: Apply for real
    const applyResult = await tryGitApply(config, patchFile, false);
    if (!applyResult.success) {
      // Shouldn't happen if dry-run passed, but handle it
      await git(config, ['checkout', '--', '.']);
      return {
        success: false,
        patchId: patch.id,
        error: applyResult.error,
        conflictFiles: applyResult.conflictFiles,
        currentHeadSha: currentHead,
      };
    }

    // Step 5: Stage and commit
    await git(config, ['add', '-A']);

    const commitMessage = `${patch.epicId}: ${patch.description}\n\nPatch-ID: ${patch.id}\nAgent: ${patch.agentId}\nBase-SHA: ${patch.baseSha}`;
    await git(config, ['commit', '-m', commitMessage]);

    const commitSha = await getHeadSha(config);

    return {
      success: true,
      patchId: patch.id,
      commitSha,
      currentHeadSha: commitSha,
    };

  } finally {
    // Clean up temp file
    try {
      await unlink(patchFile);
    } catch {
      // Ignore cleanup errors
    }
  }
}

// =============================================================================
// Helpers
// =============================================================================

/**
 * Ensure the worktree is clean (no uncommitted changes).
 */
async function ensureCleanWorktree(config: ResolvedConfig): Promise<void> {
  const status = await git(config, ['status', '--porcelain']);
  if (status) {
    throw new CoordinatorError(
      'Worktree is not clean. The coordinator requires a clean worktree to apply patches.',
      'GIT_ERROR'
    );
  }
}

/**
 * Ensure we're on the correct branch.
 */
async function ensureOnBranch(config: ResolvedConfig, branch: string): Promise<void> {
  const current = await git(config, ['branch', '--show-current']);
  if (current !== branch) {
    await git(config, ['checkout', branch]);
  }
}

/**
 * Try to apply a patch file. Returns success/failure with details.
 *
 * @param config - Config
 * @param patchFile - Path to the .patch file
 * @param dryRun - If true, only check (--check), don't modify files
 */
async function tryGitApply(
  config: ResolvedConfig,
  patchFile: string,
  dryRun: boolean
): Promise<{ success: boolean; error?: string; conflictFiles?: string[] }> {
  const args = ['apply', '--verbose'];
  if (dryRun) {
    args.push('--check');
  }
  args.push(patchFile);

  try {
    await git(config, args);
    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);

    // Parse conflict files from git apply error output
    const conflictFiles = parseConflictFiles(message);

    return {
      success: false,
      error: `Patch does not apply cleanly: ${message}`,
      conflictFiles,
    };
  }
}

/**
 * Parse file names from git apply error output.
 */
function parseConflictFiles(errorOutput: string): string[] {
  const files: string[] = [];
  // git apply errors look like: "error: patch failed: src/foo.ts:42"
  const patchFailedRegex = /error: patch failed: ([^:]+):/g;
  let match;
  while ((match = patchFailedRegex.exec(errorOutput)) !== null) {
    if (match[1]) {
      files.push(match[1]);
    }
  }
  return files;
}

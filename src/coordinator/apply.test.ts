/**
 * Patch Applicator Tests
 *
 * Tests applying patches to a git repo via git apply.
 * Uses real temp directories with git repos.
 */

import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert';
import { mkdtempSync, rmSync, writeFileSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { execSync } from 'node:child_process';
import { applyPatch } from './apply.js';
import { resolveConfig, initQueue, getHeadSha } from './queue.js';
import type { ResolvedConfig, PatchEnvelope } from './types.js';

/**
 * Create a temporary git repo with initial commit and .gitignore.
 */
function createTempRepo(): string {
  const dir = mkdtempSync(join(tmpdir(), 'beth-apply-test-'));
  execSync('git init -b main', { cwd: dir, stdio: 'pipe' });
  execSync('git config user.email "test@test.com"', { cwd: dir, stdio: 'pipe' });
  execSync('git config user.name "Test"', { cwd: dir, stdio: 'pipe' });
  writeFileSync(join(dir, '.gitignore'), '.beth/\n');
  writeFileSync(join(dir, 'README.md'), '# test repo\n');
  execSync('git add -A && git commit -m "initial"', { cwd: dir, stdio: 'pipe' });
  return dir;
}

/**
 * Generate a valid unified diff for adding a new file.
 */
function newFileDiff(filename: string, content: string): string {
  const lines = content.split('\n');
  // Remove trailing empty line for diff
  const diffLines = lines.filter((_, i) => i < lines.length - 1 || lines[i] !== '');
  const body = diffLines.map(l => `+${l}`).join('\n');
  return [
    `diff --git a/${filename} b/${filename}`,
    `new file mode 100644`,
    `--- /dev/null`,
    `+++ b/${filename}`,
    `@@ -0,0 +1,${diffLines.length} @@`,
    body,
    '',
  ].join('\n');
}

/**
 * Generate a unified diff for modifying an existing file.
 * Captures a simple replacement of the full content.
 */
function modifyFileDiff(filename: string, oldContent: string, newContent: string): string {
  const oldLines = oldContent.split('\n').filter((_, i, a) => i < a.length - 1 || a[i] !== '');
  const newLines = newContent.split('\n').filter((_, i, a) => i < a.length - 1 || a[i] !== '');
  const removals = oldLines.map(l => `-${l}`).join('\n');
  const additions = newLines.map(l => `+${l}`).join('\n');
  return [
    `diff --git a/${filename} b/${filename}`,
    `--- a/${filename}`,
    `+++ b/${filename}`,
    `@@ -1,${oldLines.length} +1,${newLines.length} @@`,
    removals,
    additions,
    '',
  ].join('\n');
}

/**
 * Create a minimal PatchEnvelope for testing.
 */
function makePatch(
  overrides: Partial<PatchEnvelope> & { diff: string; files: string[] }
): PatchEnvelope {
  return {
    id: overrides.id ?? `patch-1-test-${Date.now()}`,
    seq: overrides.seq ?? 1,
    epicId: overrides.epicId ?? 'beth-test',
    agentId: overrides.agentId ?? 'dev-1',
    description: overrides.description ?? 'test patch',
    baseSha: overrides.baseSha ?? 'abc123',
    targetBranch: overrides.targetBranch ?? 'main',
    diff: overrides.diff,
    files: overrides.files,
    submittedAt: overrides.submittedAt ?? new Date().toISOString(),
    status: overrides.status ?? 'applying',
    retryCount: overrides.retryCount ?? 0,
  };
}

describe('applyPatch', () => {
  let repoDir: string;
  let config: ResolvedConfig;

  beforeEach(async () => {
    repoDir = createTempRepo();
    config = resolveConfig({ repoRoot: repoDir });
    await initQueue(config);
  });

  afterEach(() => {
    rmSync(repoDir, { recursive: true, force: true });
  });

  describe('new file patches', () => {
    it('should apply a patch that adds a new file', async () => {
      const diff = newFileDiff('hello.ts', 'export const greeting = "hello";\n');
      const patch = makePatch({
        diff,
        files: ['hello.ts'],
        epicId: 'beth-feat1',
        description: 'Add greeting module',
      });

      const result = await applyPatch(config, patch);
      assert.ok(result.success, `Expected success but got: ${result.error}`);
      assert.ok(result.commitSha);
      assert.strictEqual(result.patchId, patch.id);

      // Verify file was created
      const content = readFileSync(join(repoDir, 'hello.ts'), 'utf-8');
      assert.strictEqual(content, 'export const greeting = "hello";\n');
    });

    it('should create a commit with the correct message format', async () => {
      const diff = newFileDiff('test.ts', 'const x = 1;\n');
      const patch = makePatch({
        diff,
        files: ['test.ts'],
        epicId: 'beth-abc123',
        agentId: 'developer-1',
        description: 'Add test module',
      });

      await applyPatch(config, patch);

      // Check commit subject
      const subject = execSync('git log -1 --format=%s', {
        cwd: repoDir,
        encoding: 'utf-8',
      }).trim();
      assert.strictEqual(subject, 'beth-abc123: Add test module');

      // Check commit body includes metadata
      const body = execSync('git log -1 --format=%b', {
        cwd: repoDir,
        encoding: 'utf-8',
      }).trim();
      assert.ok(body.includes(`Patch-ID: ${patch.id}`));
      assert.ok(body.includes('Agent: developer-1'));
    });

    it('should advance HEAD after applying', async () => {
      const headBefore = await getHeadSha(config);

      const diff = newFileDiff('new.ts', 'content\n');
      const patch = makePatch({ diff, files: ['new.ts'] });

      const result = await applyPatch(config, patch);
      assert.ok(result.success);

      const headAfter = await getHeadSha(config);
      assert.notStrictEqual(headBefore, headAfter);
      assert.strictEqual(headAfter, result.commitSha);
    });
  });

  describe('modify file patches', () => {
    it('should apply a patch that modifies an existing file', async () => {
      const diff = modifyFileDiff('README.md', '# test repo\n', '# updated repo\n');
      const patch = makePatch({
        diff,
        files: ['README.md'],
        description: 'Update README',
      });

      const result = await applyPatch(config, patch);
      assert.ok(result.success, `Expected success but got: ${result.error}`);

      const content = readFileSync(join(repoDir, 'README.md'), 'utf-8');
      assert.strictEqual(content, '# updated repo\n');
    });
  });

  describe('conflict detection', () => {
    it('should reject a patch that conflicts with current state', async () => {
      // First, change README in the repo
      writeFileSync(join(repoDir, 'README.md'), '# changed by someone else\n');
      execSync('git add -A && git commit -m "someone else changed readme"', {
        cwd: repoDir,
        stdio: 'pipe',
      });

      // Now try to apply a patch based on the ORIGINAL content
      const diff = modifyFileDiff('README.md', '# test repo\n', '# my version\n');
      const patch = makePatch({
        diff,
        files: ['README.md'],
        description: 'Conflicting change',
      });

      const result = await applyPatch(config, patch);
      assert.ok(!result.success, 'Should have failed due to conflict');
      assert.ok(result.error);
      assert.ok(result.currentHeadSha);
    });

    it('should leave worktree clean after a rejected patch', async () => {
      // Create a conflict situation
      writeFileSync(join(repoDir, 'README.md'), '# changed\n');
      execSync('git add -A && git commit -m "change"', { cwd: repoDir, stdio: 'pipe' });

      const diff = modifyFileDiff('README.md', '# test repo\n', '# conflict\n');
      const patch = makePatch({ diff, files: ['README.md'] });

      await applyPatch(config, patch);

      // Worktree should be clean after rejection
      const status = execSync('git status --porcelain', {
        cwd: repoDir,
        encoding: 'utf-8',
      }).trim();
      assert.strictEqual(status, '', 'Worktree should be clean after rejection');
    });
  });

  describe('branch enforcement', () => {
    it('should ensure we are on the target branch', async () => {
      // Create and switch to a different branch
      execSync('git checkout -b feature-branch', { cwd: repoDir, stdio: 'pipe' });

      const diff = newFileDiff('test.ts', 'content\n');
      const patch = makePatch({
        diff,
        files: ['test.ts'],
        targetBranch: 'main',
      });

      // applyPatch should switch to main before applying
      const result = await applyPatch(config, patch);
      assert.ok(result.success, `Expected success but got: ${result.error}`);

      // Should be on main after apply
      const currentBranch = execSync('git branch --show-current', {
        cwd: repoDir,
        encoding: 'utf-8',
      }).trim();
      assert.strictEqual(currentBranch, 'main');
    });
  });

  describe('dirty worktree', () => {
    it('should reject if worktree has uncommitted changes', async () => {
      // Create uncommitted changes (not in .gitignore)
      writeFileSync(join(repoDir, 'dirty.txt'), 'uncommitted\n');

      const diff = newFileDiff('test.ts', 'content\n');
      const patch = makePatch({ diff, files: ['test.ts'] });

      await assert.rejects(
        () => applyPatch(config, patch),
        (err: unknown) => {
          assert.ok(err instanceof Error);
          assert.ok(err.message.includes('clean'));
          return true;
        }
      );
    });
  });
});

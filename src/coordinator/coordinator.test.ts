/**
 * Patch Coordinator Integration Tests
 *
 * Tests the full coordinator flow: submit → dequeue → apply → commit.
 * Uses real git repos in temp directories.
 */

import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert';
import { mkdtempSync, rmSync, writeFileSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { execSync } from 'node:child_process';
import { PatchCoordinator } from './coordinator.js';
import {
  resolveConfig,
  initQueue,
  submitPatch,
  getQueueCounts,
} from './queue.js';
import type { ResolvedConfig, ApplyResult, PatchEnvelope } from './types.js';
import { CoordinatorError } from './types.js';

/**
 * Create a temporary git repo with initial commit and .gitignore.
 * Ensures .beth/ is ignored so it doesn't appear as uncommitted changes.
 */
function createTempRepo(): string {
  const dir = mkdtempSync(join(tmpdir(), 'beth-coord-test-'));
  execSync('git init -b main', { cwd: dir, stdio: 'pipe' });
  execSync('git config user.email "test@test.com"', { cwd: dir, stdio: 'pipe' });
  execSync('git config user.name "Test"', { cwd: dir, stdio: 'pipe' });
  writeFileSync(join(dir, '.gitignore'), '.beth/\n');
  writeFileSync(join(dir, 'README.md'), '# test\n');
  execSync('git add -A && git commit -m "initial"', { cwd: dir, stdio: 'pipe' });
  return dir;
}

describe('PatchCoordinator', () => {
  let repoDir: string;
  let config: ResolvedConfig;
  let coordinator: PatchCoordinator;

  beforeEach(async () => {
    repoDir = createTempRepo();
    config = resolveConfig({ repoRoot: repoDir });
    await initQueue(config);
    coordinator = new PatchCoordinator({ repoRoot: repoDir });
    await coordinator.init();
  });

  afterEach(() => {
    rmSync(repoDir, { recursive: true, force: true });
  });

  describe('init', () => {
    it('should initialize without error', async () => {
      const counts = await getQueueCounts(config);
      assert.strictEqual(counts.queued, 0);
      assert.strictEqual(counts.applied, 0);
      assert.strictEqual(counts.rejected, 0);
    });
  });

  describe('applyAll', () => {
    it('should return empty array for empty queue', async () => {
      const results = await coordinator.applyAll(false);
      assert.strictEqual(results.length, 0);
    });

    it('should apply a single patch successfully', async () => {
      writeFileSync(join(repoDir, 'feature.ts'), 'export const hello = "world";\n');
      await submitPatch(config, 'beth-epic1', 'dev-1', 'Add feature');

      const results = await coordinator.applyAll(false);
      assert.strictEqual(results.length, 1);
      assert.ok(results[0].success);
      assert.ok(results[0].commitSha);

      // Verify the file was applied to the working tree
      const content = readFileSync(join(repoDir, 'feature.ts'), 'utf-8');
      assert.strictEqual(content, 'export const hello = "world";\n');

      // Verify commit message includes epic ID
      const log = execSync('git log -1 --format=%s', { cwd: repoDir, encoding: 'utf-8' }).trim();
      assert.ok(log.includes('beth-epic1'), `Commit message should include epic ID: ${log}`);
    });

    it('should apply multiple non-conflicting patches in order', async () => {
      // First patch: add file a.ts
      writeFileSync(join(repoDir, 'a.ts'), 'const a = 1;\n');
      await submitPatch(config, 'beth-epic1', 'dev-1', 'Add file A');

      // Second patch: add file b.ts
      writeFileSync(join(repoDir, 'b.ts'), 'const b = 2;\n');
      await submitPatch(config, 'beth-epic1', 'dev-2', 'Add file B');

      const results = await coordinator.applyAll(false);
      assert.strictEqual(results.length, 2);
      assert.ok(results[0].success, 'First patch should succeed');
      assert.ok(results[1].success, 'Second patch should succeed');

      // Both files should exist
      assert.strictEqual(readFileSync(join(repoDir, 'a.ts'), 'utf-8'), 'const a = 1;\n');
      assert.strictEqual(readFileSync(join(repoDir, 'b.ts'), 'utf-8'), 'const b = 2;\n');

      // initial + 2 patches = 3 commits
      const commitCount = parseInt(
        execSync('git rev-list --count HEAD', { cwd: repoDir, encoding: 'utf-8' }).trim()
      );
      assert.strictEqual(commitCount, 3);
    });

    it('should update queue counts after processing', async () => {
      writeFileSync(join(repoDir, 'test.ts'), 'const x = 1;\n');
      await submitPatch(config, 'beth-epic1', 'dev-1', 'Add test');

      const before = await getQueueCounts(config);
      assert.strictEqual(before.queued, 1);

      await coordinator.applyAll(false);

      const after = await getQueueCounts(config);
      assert.strictEqual(after.queued, 0);
      assert.strictEqual(after.applied, 1);
    });

    it('should reject an expired patch', async () => {
      // Create coordinator with very short max age so patch is immediately expired
      const shortLived = new PatchCoordinator(
        { repoRoot: repoDir, maxPatchAgeMs: 1 },
        {}
      );
      await shortLived.init();

      writeFileSync(join(repoDir, 'test.ts'), 'const x = 1;\n');
      await submitPatch(config, 'beth-epic1', 'dev-1', 'test');

      // Wait a moment for the patch to expire
      await new Promise(r => setTimeout(r, 10));

      const results = await shortLived.applyAll(false);
      // Expired patches are rejected but not returned in results (they're skipped)
      assert.strictEqual(results.length, 0);

      const counts = await getQueueCounts(config);
      assert.strictEqual(counts.rejected, 1);
    });
  });

  describe('status', () => {
    it('should report current state', async () => {
      const status = await coordinator.status();
      assert.strictEqual(status.running, false);
      assert.strictEqual(status.queuedCount, 0);
      assert.strictEqual(status.appliedCount, 0);
      assert.strictEqual(status.rejectedCount, 0);
      assert.ok(status.headSha);
      assert.strictEqual(status.targetBranch, 'main');
    });

    it('should reflect applied count after processing', async () => {
      writeFileSync(join(repoDir, 'test.ts'), 'x\n');
      await submitPatch(config, 'beth-epic1', 'dev-1', 'test');

      await coordinator.applyAll(false);

      const status = await coordinator.status();
      assert.strictEqual(status.appliedCount, 1);
    });
  });

  describe('observer callbacks', () => {
    it('should fire onPatchDequeued and onPatchApplied for success', async () => {
      const events: string[] = [];

      const observed = new PatchCoordinator(
        { repoRoot: repoDir },
        {
          onPatchDequeued: (_patch: PatchEnvelope) => events.push('dequeued'),
          onPatchApplied: (_result: ApplyResult) => events.push('applied'),
        }
      );
      await observed.init();

      writeFileSync(join(repoDir, 'test.ts'), 'hello\n');
      await submitPatch(config, 'beth-epic1', 'dev-1', 'test');

      await observed.applyAll(false);
      assert.deepStrictEqual(events, ['dequeued', 'applied']);
    });

    it('should fire onPatchRejected for expired patches', async () => {
      const events: string[] = [];

      const observed = new PatchCoordinator(
        { repoRoot: repoDir, maxPatchAgeMs: 1 },
        {
          onPatchDequeued: () => events.push('dequeued'),
          onPatchRejected: () => events.push('rejected'),
        }
      );
      await observed.init();

      writeFileSync(join(repoDir, 'test.ts'), 'hello\n');
      await submitPatch(config, 'beth-epic1', 'dev-1', 'test');

      await new Promise(r => setTimeout(r, 10));
      await observed.applyAll(false);

      assert.ok(events.includes('dequeued'));
      assert.ok(events.includes('rejected'));
    });
  });

  describe('locking', () => {
    it('should allow sequential coordinators after lock release', async () => {
      const coord1 = new PatchCoordinator({ repoRoot: repoDir });
      await coord1.init();

      // coord1 processes (acquires and releases lock)
      await coord1.applyAll(false);

      // coord2 should acquire after coord1 releases
      const coord2 = new PatchCoordinator({ repoRoot: repoDir });
      await coord2.init();
      await coord2.applyAll(false);
    });

    it('should throw QUEUE_LOCKED when another coordinator holds the lock', async () => {
      // Manually acquire lock via queue module
      const { acquireLock } = await import('./queue.js');
      const locked = await acquireLock(config);
      assert.ok(locked);

      // Another coordinator should fail to acquire
      const coord2 = new PatchCoordinator({ repoRoot: repoDir });
      await coord2.init();

      await assert.rejects(
        () => coord2.applyAll(false),
        (err: unknown) => {
          assert.ok(err instanceof CoordinatorError);
          assert.strictEqual(err.code, 'QUEUE_LOCKED');
          return true;
        }
      );

      // Clean up lock
      const { releaseLock } = await import('./queue.js');
      await releaseLock(config);
    });
  });
});

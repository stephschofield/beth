/**
 * Patch Queue Operations Tests
 *
 * Tests the file-based queue: init, config resolution, submit, dequeue,
 * mark applied/rejected, locking, and status.
 *
 * Uses real temp directories with git repos to test the full flow.
 */

import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert';
import { mkdtempSync, rmSync, writeFileSync, readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { execSync } from 'node:child_process';
import {
  resolveConfig,
  initQueue,
  nextSeq,
  submitPatch,
  listQueued,
  dequeue,
  markApplied,
  markRejected,
  acquireLock,
  releaseLock,
  getQueueCounts,
  getHeadSha,
  git,
} from './queue.js';
import type { ResolvedConfig, PatchEnvelope } from './types.js';

/**
 * Create a temporary git repo with an initial commit.
 */
function createTempRepo(): string {
  const dir = mkdtempSync(join(tmpdir(), 'beth-queue-test-'));
  execSync('git init -b main', { cwd: dir, stdio: 'pipe' });
  execSync('git config user.email "test@test.com"', { cwd: dir, stdio: 'pipe' });
  execSync('git config user.name "Test"', { cwd: dir, stdio: 'pipe' });
  writeFileSync(join(dir, '.gitignore'), '.beth/\n');
  writeFileSync(join(dir, 'README.md'), '# test\n');
  execSync('git add -A && git commit -m "initial"', { cwd: dir, stdio: 'pipe' });
  return dir;
}

describe('coordinator queue', () => {
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

  describe('resolveConfig', () => {
    it('should apply defaults', () => {
      const c = resolveConfig({ repoRoot: '/tmp/repo' });
      assert.strictEqual(c.targetBranch, 'main');
      assert.strictEqual(c.maxRetries, 3);
      assert.strictEqual(c.pollIntervalMs, 1000);
      assert.strictEqual(c.maxPatchAgeMs, 3600000);
      assert.ok(c.queueDir.includes('.beth/patches'));
    });

    it('should respect overrides', () => {
      const c = resolveConfig({
        repoRoot: '/tmp/repo',
        targetBranch: 'develop',
        maxRetries: 5,
        pollIntervalMs: 500,
      });
      assert.strictEqual(c.targetBranch, 'develop');
      assert.strictEqual(c.maxRetries, 5);
      assert.strictEqual(c.pollIntervalMs, 500);
    });
  });

  describe('initQueue', () => {
    it('should create queue subdirectories', () => {
      assert.ok(existsSync(join(config.queueDir, 'queue')));
      assert.ok(existsSync(join(config.queueDir, 'applying')));
      assert.ok(existsSync(join(config.queueDir, 'applied')));
      assert.ok(existsSync(join(config.queueDir, 'rejected')));
    });

    it('should create counter file', () => {
      const counter = readFileSync(join(config.queueDir, 'counter'), 'utf-8');
      assert.strictEqual(counter, '0');
    });

    it('should be idempotent', async () => {
      await initQueue(config); // second call
      assert.ok(existsSync(join(config.queueDir, 'queue')));
    });
  });

  describe('nextSeq', () => {
    it('should increment monotonically', async () => {
      const seq1 = await nextSeq(config);
      const seq2 = await nextSeq(config);
      const seq3 = await nextSeq(config);
      assert.strictEqual(seq1, 1);
      assert.strictEqual(seq2, 2);
      assert.strictEqual(seq3, 3);
    });
  });

  describe('git helpers', () => {
    it('should get HEAD sha', async () => {
      const sha = await getHeadSha(config);
      assert.ok(sha.length > 0);
      assert.match(sha, /^[0-9a-f]+$/);
    });

    it('should run git status', async () => {
      const status = await git(config, ['status', '--porcelain']);
      // .beth directory should be untracked but that's fine
      assert.ok(typeof status === 'string');
    });
  });

  describe('submitPatch', () => {
    it('should reject when no changes', async () => {
      const result = await submitPatch(config, 'beth-test', 'dev-1', 'no changes');
      assert.ok(!result.success);
      assert.ok(result.error?.includes('No changes'));
    });

    it('should submit when there are changes', async () => {
      writeFileSync(join(repoDir, 'test.txt'), 'hello world\n');

      const result = await submitPatch(config, 'beth-epic1', 'dev-1', 'Add test file');
      assert.ok(result.success);
      assert.ok(result.patchId.includes('beth-epic1'));
      assert.strictEqual(result.seq, 1);
    });

    it('should reset working tree after submit', async () => {
      writeFileSync(join(repoDir, 'test.txt'), 'hello\n');

      await submitPatch(config, 'beth-epic1', 'dev-1', 'test');

      // Working tree should be clean
      const status = execSync('git status --porcelain', { cwd: repoDir, encoding: 'utf-8' }).trim();
      assert.strictEqual(status, '');
    });

    it('should write patch envelope to queue directory', async () => {
      writeFileSync(join(repoDir, 'test.txt'), 'content\n');

      const result = await submitPatch(config, 'beth-epic1', 'dev-1', 'test patch');

      const { readdirSync } = await import('node:fs');
      const queueFiles = readdirSync(join(config.queueDir, 'queue')).filter(f => f.endsWith('.json'));
      assert.ok(queueFiles.length > 0, 'Should have at least one patch file');
      assert.ok(queueFiles[0].includes(result.patchId));

      // Read and verify the envelope
      const envelope = JSON.parse(
        readFileSync(join(config.queueDir, 'queue', queueFiles[0]), 'utf-8')
      ) as PatchEnvelope;
      assert.strictEqual(envelope.epicId, 'beth-epic1');
      assert.strictEqual(envelope.agentId, 'dev-1');
      assert.strictEqual(envelope.status, 'queued');
      assert.ok(envelope.diff.length > 0);
      assert.ok(envelope.files.includes('test.txt'));
    });
  });

  describe('listQueued', () => {
    it('should return empty array for empty queue', async () => {
      const patches = await listQueued(config);
      assert.strictEqual(patches.length, 0);
    });

    it('should return patches in order', async () => {
      writeFileSync(join(repoDir, 'a.txt'), 'first\n');
      await submitPatch(config, 'beth-epic1', 'dev-1', 'first');

      writeFileSync(join(repoDir, 'b.txt'), 'second\n');
      await submitPatch(config, 'beth-epic1', 'dev-2', 'second');

      const patches = await listQueued(config);
      assert.strictEqual(patches.length, 2);
      assert.ok(patches[0].seq < patches[1].seq);
    });
  });

  describe('dequeue', () => {
    it('should return null for empty queue', async () => {
      const patch = await dequeue(config);
      assert.strictEqual(patch, null);
    });

    it('should dequeue first patch and move to applying', async () => {
      writeFileSync(join(repoDir, 'test.txt'), 'content\n');
      await submitPatch(config, 'beth-epic1', 'dev-1', 'test');

      const before = await getQueueCounts(config);
      assert.strictEqual(before.queued, 1);

      const patch = await dequeue(config);
      assert.ok(patch);
      assert.strictEqual(patch.status, 'applying');

      const after = await getQueueCounts(config);
      assert.strictEqual(after.queued, 0);
      assert.strictEqual(after.applying, 1);
    });
  });

  describe('markApplied / markRejected', () => {
    it('should move patch from applying to applied', async () => {
      writeFileSync(join(repoDir, 'test.txt'), 'content\n');
      await submitPatch(config, 'beth-epic1', 'dev-1', 'test');

      const patch = await dequeue(config);
      assert.ok(patch);

      await markApplied(config, patch, 'sha-abc123');

      const counts = await getQueueCounts(config);
      assert.strictEqual(counts.applying, 0);
      assert.strictEqual(counts.applied, 1);
    });

    it('should move patch from applying to rejected', async () => {
      writeFileSync(join(repoDir, 'test.txt'), 'content\n');
      await submitPatch(config, 'beth-epic1', 'dev-1', 'test');

      const patch = await dequeue(config);
      assert.ok(patch);

      await markRejected(config, patch, 'conflict in test.txt', 'sha-def456');

      const counts = await getQueueCounts(config);
      assert.strictEqual(counts.applying, 0);
      assert.strictEqual(counts.rejected, 1);
    });
  });

  describe('lock management', () => {
    it('should acquire lock', async () => {
      const acquired = await acquireLock(config);
      assert.ok(acquired);
      await releaseLock(config);
    });

    it('should prevent double acquisition', async () => {
      const first = await acquireLock(config);
      assert.ok(first);

      const second = await acquireLock(config);
      assert.ok(!second); // Same PID, fresh timestamp — locked

      await releaseLock(config);
    });

    it('should release and re-acquire', async () => {
      await acquireLock(config);
      await releaseLock(config);

      const acquired = await acquireLock(config);
      assert.ok(acquired);
      await releaseLock(config);
    });
  });

  describe('getQueueCounts', () => {
    it('should return all zeros for empty queue', async () => {
      const counts = await getQueueCounts(config);
      assert.strictEqual(counts.queued, 0);
      assert.strictEqual(counts.applying, 0);
      assert.strictEqual(counts.applied, 0);
      assert.strictEqual(counts.rejected, 0);
    });
  });
});

/**
 * Patch Queue Types Tests
 */

import { describe, it } from 'node:test';
import assert from 'node:assert';
import { CoordinatorError } from './types.js';
import type {
  PatchEnvelope,
  PatchStatus,
  CoordinatorConfig,
  SubmitResult,
  ApplyResult,
  CoordinatorStatus,
  CoordinatorErrorCode,
} from './types.js';

describe('coordinator types', () => {
  describe('PatchStatus', () => {
    it('should support all valid statuses', () => {
      const statuses: PatchStatus[] = ['queued', 'applying', 'applied', 'rejected', 'expired'];
      assert.strictEqual(statuses.length, 5);
    });
  });

  describe('PatchEnvelope', () => {
    it('should construct a valid envelope', () => {
      const envelope: PatchEnvelope = {
        id: 'patch-1-beth-abc123-1234567890',
        seq: 1,
        epicId: 'beth-abc123',
        agentId: 'developer-1',
        description: 'Add auth flow',
        baseSha: 'abc123def456',
        targetBranch: 'main',
        diff: 'diff --git a/foo.ts b/foo.ts\n+hello',
        files: ['foo.ts'],
        submittedAt: '2026-02-26T12:00:00Z',
        status: 'queued',
        retryCount: 0,
      };
      assert.strictEqual(envelope.id, 'patch-1-beth-abc123-1234567890');
      assert.strictEqual(envelope.seq, 1);
      assert.strictEqual(envelope.epicId, 'beth-abc123');
      assert.strictEqual(envelope.status, 'queued');
      assert.strictEqual(envelope.retryCount, 0);
      assert.deepStrictEqual(envelope.files, ['foo.ts']);
    });

    it('should support optional rejection fields', () => {
      const envelope: PatchEnvelope = {
        id: 'patch-2-beth-abc123-1234567890',
        seq: 2,
        epicId: 'beth-abc123',
        agentId: 'developer-1',
        description: 'conflicting change',
        baseSha: 'abc123',
        targetBranch: 'main',
        diff: 'diff content',
        files: ['bar.ts'],
        submittedAt: '2026-02-26T12:00:00Z',
        status: 'rejected',
        retryCount: 1,
        rejectedAtSha: 'def456',
        rejectionReason: 'Patch does not apply cleanly',
      };
      assert.strictEqual(envelope.status, 'rejected');
      assert.strictEqual(envelope.rejectedAtSha, 'def456');
      assert.ok(envelope.rejectionReason?.includes('apply'));
    });

    it('should support optional applied fields', () => {
      const envelope: PatchEnvelope = {
        id: 'patch-3-beth-abc123-1234567890',
        seq: 3,
        epicId: 'beth-abc123',
        agentId: 'developer-1',
        description: 'applied change',
        baseSha: 'abc123',
        targetBranch: 'main',
        diff: 'diff content',
        files: ['baz.ts'],
        submittedAt: '2026-02-26T12:00:00Z',
        status: 'applied',
        retryCount: 0,
        commitSha: 'commit-sha-123',
        appliedAt: '2026-02-26T12:01:00Z',
      };
      assert.strictEqual(envelope.status, 'applied');
      assert.strictEqual(envelope.commitSha, 'commit-sha-123');
      assert.ok(envelope.appliedAt);
    });
  });

  describe('CoordinatorConfig', () => {
    it('should accept minimal config', () => {
      const config: CoordinatorConfig = {
        repoRoot: '/tmp/repo',
      };
      assert.strictEqual(config.repoRoot, '/tmp/repo');
      assert.strictEqual(config.targetBranch, undefined);
    });

    it('should accept full config', () => {
      const config: CoordinatorConfig = {
        repoRoot: '/tmp/repo',
        queueDir: '/tmp/repo/.beth/patches',
        targetBranch: 'develop',
        maxRetries: 5,
        pollIntervalMs: 2000,
        maxPatchAgeMs: 3600000,
      };
      assert.strictEqual(config.targetBranch, 'develop');
      assert.strictEqual(config.maxRetries, 5);
    });
  });

  describe('SubmitResult', () => {
    it('should represent a successful submission', () => {
      const result: SubmitResult = {
        success: true,
        patchId: 'patch-1-epic-123',
        seq: 1,
      };
      assert.ok(result.success);
      assert.strictEqual(result.seq, 1);
    });

    it('should represent a failed submission', () => {
      const result: SubmitResult = {
        success: false,
        patchId: '',
        seq: 0,
        error: 'No changes to submit',
      };
      assert.ok(!result.success);
      assert.ok(result.error);
    });
  });

  describe('ApplyResult', () => {
    it('should represent a successful apply', () => {
      const result: ApplyResult = {
        success: true,
        patchId: 'patch-1',
        commitSha: 'sha-abc',
        currentHeadSha: 'sha-abc',
      };
      assert.ok(result.success);
      assert.strictEqual(result.commitSha, 'sha-abc');
    });

    it('should represent a conflict', () => {
      const result: ApplyResult = {
        success: false,
        patchId: 'patch-1',
        error: 'conflict in foo.ts',
        conflictFiles: ['foo.ts', 'bar.ts'],
        currentHeadSha: 'sha-def',
      };
      assert.ok(!result.success);
      assert.deepStrictEqual(result.conflictFiles, ['foo.ts', 'bar.ts']);
    });
  });

  describe('CoordinatorStatus', () => {
    it('should expose all status fields', () => {
      const status: CoordinatorStatus = {
        running: true,
        queuedCount: 5,
        appliedCount: 12,
        rejectedCount: 2,
        headSha: 'sha-123',
        targetBranch: 'main',
      };
      assert.ok(status.running);
      assert.strictEqual(status.queuedCount, 5);
    });
  });

  describe('CoordinatorError', () => {
    it('should have correct name', () => {
      const err = new CoordinatorError('test', 'QUEUE_LOCKED');
      assert.strictEqual(err.name, 'CoordinatorError');
    });

    it('should have correct code', () => {
      const err = new CoordinatorError('test', 'APPLY_CONFLICT');
      assert.strictEqual(err.code, 'APPLY_CONFLICT');
    });

    it('should include message', () => {
      const err = new CoordinatorError('Lock is held by PID 1234', 'QUEUE_LOCKED');
      assert.strictEqual(err.message, 'Lock is held by PID 1234');
    });

    it('should preserve cause', () => {
      const cause = new Error('git failed');
      const err = new CoordinatorError('git error', 'GIT_ERROR', cause);
      assert.strictEqual(err.cause, cause);
    });

    it('should be an instance of Error', () => {
      const err = new CoordinatorError('test', 'INVALID_PATCH');
      assert.ok(err instanceof Error);
    });

    it('should support all error codes', () => {
      const codes: CoordinatorErrorCode[] = [
        'QUEUE_LOCKED',
        'INVALID_PATCH',
        'APPLY_CONFLICT',
        'GIT_ERROR',
        'QUEUE_FULL',
        'PATCH_EXPIRED',
        'NOT_INITIALIZED',
      ];
      assert.strictEqual(codes.length, 7);
      for (const code of codes) {
        const err = new CoordinatorError('test', code);
        assert.strictEqual(err.code, code);
      }
    });
  });
});

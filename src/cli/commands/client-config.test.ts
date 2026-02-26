/**
 * Unit tests for client-config module.
 * Run with: node --test dist/cli/commands/client-config.test.js
 */

import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert';
import { existsSync, mkdirSync, mkdtempSync, writeFileSync, rmSync, readFileSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import {
  persistClientConfig,
  detectClientConfig,
  CLIENT_CONFIG_FILE,
  CLIENT_CONFIG_DIR,
  type ClientSelection,
} from './client-config.js';

describe('client-config', () => {
  let testDir: string;

  beforeEach(() => {
    testDir = mkdtempSync(join(tmpdir(), 'beth-client-config-'));
  });

  afterEach(() => {
    if (existsSync(testDir)) {
      rmSync(testDir, { recursive: true, force: true });
    }
  });

  describe('persistClientConfig', () => {
    it('should write config file to .github/.beth-client.json', () => {
      const selection: ClientSelection = { vscode: true, copilotCli: false, claudeCode: false };
      persistClientConfig(testDir, selection);

      const filePath = join(testDir, CLIENT_CONFIG_DIR, CLIENT_CONFIG_FILE);
      assert.ok(existsSync(filePath), 'config file should exist');

      const content = JSON.parse(readFileSync(filePath, 'utf-8'));
      assert.deepStrictEqual(content, selection);
    });

    it('should create .github directory if it does not exist', () => {
      const selection: ClientSelection = { vscode: false, copilotCli: true, claudeCode: false };
      persistClientConfig(testDir, selection);

      assert.ok(existsSync(join(testDir, CLIENT_CONFIG_DIR)), '.github dir should exist');
    });

    it('should overwrite existing config file', () => {
      const first: ClientSelection = { vscode: true, copilotCli: false, claudeCode: false };
      const second: ClientSelection = { vscode: false, copilotCli: false, claudeCode: true };

      persistClientConfig(testDir, first);
      persistClientConfig(testDir, second);

      const filePath = join(testDir, CLIENT_CONFIG_DIR, CLIENT_CONFIG_FILE);
      const content = JSON.parse(readFileSync(filePath, 'utf-8'));
      assert.deepStrictEqual(content, second);
    });
  });

  describe('detectClientConfig — round-trip', () => {
    it('should round-trip vscode-only config', () => {
      const selection: ClientSelection = { vscode: true, copilotCli: false, claudeCode: false };
      persistClientConfig(testDir, selection);
      assert.deepStrictEqual(detectClientConfig(testDir), selection);
    });

    it('should round-trip copilotCli-only config', () => {
      const selection: ClientSelection = { vscode: false, copilotCli: true, claudeCode: false };
      persistClientConfig(testDir, selection);
      assert.deepStrictEqual(detectClientConfig(testDir), selection);
    });

    it('should round-trip claudeCode-only config', () => {
      const selection: ClientSelection = { vscode: false, copilotCli: false, claudeCode: true };
      persistClientConfig(testDir, selection);
      assert.deepStrictEqual(detectClientConfig(testDir), selection);
    });

    it('should round-trip multiple clients selected', () => {
      const selection: ClientSelection = { vscode: true, copilotCli: false, claudeCode: true };
      persistClientConfig(testDir, selection);
      assert.deepStrictEqual(detectClientConfig(testDir), selection);
    });

    it('should round-trip all clients selected', () => {
      const selection: ClientSelection = { vscode: true, copilotCli: true, claudeCode: true };
      persistClientConfig(testDir, selection);
      assert.deepStrictEqual(detectClientConfig(testDir), selection);
    });
  });

  describe('detectClientConfig — marker fallback', () => {
    it('should detect vscode from .github/agents/ directory', () => {
      mkdirSync(join(testDir, '.github', 'agents'), { recursive: true });
      const result = detectClientConfig(testDir);
      assert.strictEqual(result.vscode, true);
    });

    it('should detect claudeCode from CLAUDE.md', () => {
      writeFileSync(join(testDir, 'CLAUDE.md'), '# Claude');
      const result = detectClientConfig(testDir);
      assert.strictEqual(result.claudeCode, true);
    });

    it('should detect copilotCli from copilot-instructions.md without agents dir', () => {
      mkdirSync(join(testDir, '.github'), { recursive: true });
      writeFileSync(join(testDir, '.github', 'copilot-instructions.md'), '# Instructions');
      const result = detectClientConfig(testDir);
      assert.strictEqual(result.copilotCli, true);
      assert.strictEqual(result.vscode, false);
    });

    it('should NOT detect copilotCli when agents dir also exists', () => {
      mkdirSync(join(testDir, '.github', 'agents'), { recursive: true });
      writeFileSync(join(testDir, '.github', 'copilot-instructions.md'), '# Instructions');
      const result = detectClientConfig(testDir);
      assert.strictEqual(result.copilotCli, false);
      assert.strictEqual(result.vscode, true);
    });

    it('should detect both vscode and claudeCode from markers', () => {
      mkdirSync(join(testDir, '.github', 'agents'), { recursive: true });
      writeFileSync(join(testDir, 'CLAUDE.md'), '# Claude');
      const result = detectClientConfig(testDir);
      assert.strictEqual(result.vscode, true);
      assert.strictEqual(result.claudeCode, true);
      assert.strictEqual(result.copilotCli, false);
    });

    it('should default to vscode when nothing detected', () => {
      const result = detectClientConfig(testDir);
      assert.deepStrictEqual(result, { vscode: true, copilotCli: false, claudeCode: false });
    });
  });

  describe('detectClientConfig — invalid config file', () => {
    it('should fall back to markers when JSON is invalid', () => {
      mkdirSync(join(testDir, CLIENT_CONFIG_DIR), { recursive: true });
      writeFileSync(join(testDir, CLIENT_CONFIG_DIR, CLIENT_CONFIG_FILE), 'not json{{{');
      mkdirSync(join(testDir, '.github', 'agents'), { recursive: true });

      const result = detectClientConfig(testDir);
      assert.strictEqual(result.vscode, true);
    });

    it('should fall back to markers when config has wrong shape', () => {
      mkdirSync(join(testDir, CLIENT_CONFIG_DIR), { recursive: true });
      writeFileSync(
        join(testDir, CLIENT_CONFIG_DIR, CLIENT_CONFIG_FILE),
        JSON.stringify({ vscode: 'yes', copilotCli: 0 }),
      );
      writeFileSync(join(testDir, 'CLAUDE.md'), '# Claude');

      const result = detectClientConfig(testDir);
      assert.strictEqual(result.claudeCode, true);
    });

    it('should fall back to defaults when config is invalid and no markers exist', () => {
      mkdirSync(join(testDir, CLIENT_CONFIG_DIR), { recursive: true });
      writeFileSync(join(testDir, CLIENT_CONFIG_DIR, CLIENT_CONFIG_FILE), '{}');

      const result = detectClientConfig(testDir);
      assert.deepStrictEqual(result, { vscode: true, copilotCli: false, claudeCode: false });
    });
  });
});

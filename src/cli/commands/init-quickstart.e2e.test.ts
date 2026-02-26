/**
 * E2E tests for the init → quickstart pipeline.
 *
 * Verifies that running `init --client <mode>` persists the correct
 * `.github/.beth-client.json` and that `quickstart` reads it to show
 * client-specific getting-started guidance.
 *
 * Run with: node --test dist/cli/commands/init-quickstart.e2e.test.js
 */

import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert';
import { execSync } from 'child_process';
import {
  existsSync,
  mkdirSync,
  rmSync,
  readFileSync,
  writeFileSync,
} from 'fs';
import { join, resolve } from 'path';
import { tmpdir } from 'os';

const CLI_PATH = resolve(join(import.meta.dirname, '..', '..', '..', 'bin', 'cli.js'));

// Check if beads CLI is available — quickstart requires it
function isBeadsInstalled(): boolean {
  try {
    execSync('bd --version', { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

const BEADS_AVAILABLE = isBeadsInstalled();
const SKIP_NO_BEADS = !BEADS_AVAILABLE ? 'beads CLI not installed' : false;

/**
 * Run a CLI command in a directory.
 */
function runCli(
  cwd: string,
  command: string,
  flags: string[] = []
): { stdout: string; stderr: string; code: number } {
  const argStr = flags.length > 0 ? ` ${flags.join(' ')}` : '';
  try {
    const stdout = execSync(`node "${CLI_PATH}" ${command}${argStr}`, {
      cwd,
      encoding: 'utf-8',
      env: { ...process.env, NO_COLOR: '1', FORCE_COLOR: '0' },
      stdio: ['pipe', 'pipe', 'pipe'],
    });
    return { stdout, stderr: '', code: 0 };
  } catch (error: unknown) {
    const e = error as { stdout?: string; stderr?: string; status?: number };
    return { stdout: e.stdout || '', stderr: e.stderr || '', code: e.status || 1 };
  }
}

/**
 * Ensure the project has .github/agents/ with a minimal agent file
 * so quickstart's `isBethInitialized` check passes.
 * (Non-vscode init modes don't create this directory.)
 */
function ensureAgentsDir(dir: string): void {
  const agentsDir = join(dir, '.github', 'agents');
  if (!existsSync(agentsDir)) {
    mkdirSync(agentsDir, { recursive: true });
    writeFileSync(
      join(agentsDir, 'beth.agent.md'),
      `---\nname: Beth\ndescription: Orchestrator\nmodel: gpt-4\ntools:\n  - readFile\n---\n\n# Beth\n`
    );
  }
}

/**
 * Simulate beads initialization so quickstart doesn't try to run `bd init`.
 */
function simulateBeadsInit(dir: string): void {
  const beadsDir = join(dir, '.beads');
  if (!existsSync(beadsDir)) {
    mkdirSync(beadsDir, { recursive: true });
    writeFileSync(join(beadsDir, 'config.json'), JSON.stringify({ version: '1.0' }));
  }
}



// ═══════════════════════════════════════════════════════════════════════════════
//  .beth-client.json PERSISTENCE
// ═══════════════════════════════════════════════════════════════════════════════

describe('init persists .github/.beth-client.json', () => {
  let testDir: string;

  beforeEach(() => {
    testDir = join(tmpdir(), `beth-iq-persist-${Date.now()}-${Math.random().toString(36).slice(2)}`);
    mkdirSync(testDir, { recursive: true });
  });

  afterEach(() => {
    if (existsSync(testDir)) {
      rmSync(testDir, { recursive: true, force: true });
    }
  });

  it('--client vscode writes valid .beth-client.json with vscode: true', () => {
    const result = runCli(testDir, 'init', ['--client', 'vscode', '--force', '--skip-beads']);
    assert.strictEqual(result.code, 0, `Init failed: ${result.stdout}`);

    const configPath = join(testDir, '.github', '.beth-client.json');
    assert.ok(existsSync(configPath), '.github/.beth-client.json should exist');

    const config = JSON.parse(readFileSync(configPath, 'utf-8'));
    assert.strictEqual(config.vscode, true, 'vscode should be true');
    assert.strictEqual(config.copilotCli, false, 'copilotCli should be false');
    assert.strictEqual(config.claudeCode, false, 'claudeCode should be false');
  });

  it('--client claude-code writes valid .beth-client.json with claudeCode: true', () => {
    const result = runCli(testDir, 'init', ['--client', 'claude-code', '--force', '--skip-beads']);
    assert.strictEqual(result.code, 0, `Init failed: ${result.stdout}`);

    const configPath = join(testDir, '.github', '.beth-client.json');
    assert.ok(existsSync(configPath), '.github/.beth-client.json should exist');

    const config = JSON.parse(readFileSync(configPath, 'utf-8'));
    assert.strictEqual(config.vscode, false, 'vscode should be false');
    assert.strictEqual(config.copilotCli, false, 'copilotCli should be false');
    assert.strictEqual(config.claudeCode, true, 'claudeCode should be true');
  });

  it('--client copilot-cli writes valid .beth-client.json with copilotCli: true', () => {
    const result = runCli(testDir, 'init', ['--client', 'copilot-cli', '--force', '--skip-beads']);
    assert.strictEqual(result.code, 0, `Init failed: ${result.stdout}`);

    const configPath = join(testDir, '.github', '.beth-client.json');
    assert.ok(existsSync(configPath), '.github/.beth-client.json should exist');

    const config = JSON.parse(readFileSync(configPath, 'utf-8'));
    assert.strictEqual(config.vscode, false, 'vscode should be false');
    assert.strictEqual(config.copilotCli, true, 'copilotCli should be true');
    assert.strictEqual(config.claudeCode, false, 'claudeCode should be false');
  });

  it('--client all writes valid .beth-client.json with all flags true', () => {
    const result = runCli(testDir, 'init', ['--client', 'all', '--force', '--skip-beads']);
    assert.strictEqual(result.code, 0, `Init failed: ${result.stdout}`);

    const configPath = join(testDir, '.github', '.beth-client.json');
    assert.ok(existsSync(configPath), '.github/.beth-client.json should exist');

    const config = JSON.parse(readFileSync(configPath, 'utf-8'));
    assert.strictEqual(config.vscode, true, 'vscode should be true');
    assert.strictEqual(config.copilotCli, true, 'copilotCli should be true');
    assert.strictEqual(config.claudeCode, true, 'claudeCode should be true');
  });

  it('.beth-client.json is valid JSON with expected schema', () => {
    runCli(testDir, 'init', ['--client', 'vscode', '--force', '--skip-beads']);

    const configPath = join(testDir, '.github', '.beth-client.json');
    const raw = readFileSync(configPath, 'utf-8');

    let config: unknown;
    assert.doesNotThrow(() => {
      config = JSON.parse(raw);
    }, '.beth-client.json should be valid JSON');

    const obj = config as Record<string, unknown>;
    assert.strictEqual(typeof obj.vscode, 'boolean', 'vscode field should be boolean');
    assert.strictEqual(typeof obj.copilotCli, 'boolean', 'copilotCli field should be boolean');
    assert.strictEqual(typeof obj.claudeCode, 'boolean', 'claudeCode field should be boolean');
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
//  INIT → QUICKSTART: CLIENT-SPECIFIC GUIDANCE
// ═══════════════════════════════════════════════════════════════════════════════

describe('init → quickstart pipeline: client-specific guidance', () => {
  let testDir: string;

  beforeEach(() => {
    testDir = join(tmpdir(), `beth-iq-guide-${Date.now()}-${Math.random().toString(36).slice(2)}`);
    mkdirSync(testDir, { recursive: true });
  });

  afterEach(() => {
    if (existsSync(testDir)) {
      rmSync(testDir, { recursive: true, force: true });
    }
  });

  it('--client vscode → quickstart shows VS Code / Copilot Chat guidance', { skip: SKIP_NO_BEADS }, () => {
    // Step 1: Run init
    const initResult = runCli(testDir, 'init', ['--client', 'vscode', '--force', '--skip-beads']);
    assert.strictEqual(initResult.code, 0, `Init failed: ${initResult.stdout}`);

    // Step 2: Prepare for quickstart (beads dir)
    simulateBeadsInit(testDir);

    // Step 3: Run quickstart
    const qsResult = runCli(testDir, 'quickstart');

    // Step 4: Verify VS Code guidance
    assert.ok(
      qsResult.stdout.includes('Copilot Chat'),
      `Quickstart should mention Copilot Chat for vscode client. Output:\n${qsResult.stdout}`
    );
    assert.ok(
      qsResult.stdout.includes('@Beth'),
      `Quickstart should mention @Beth for vscode client.`
    );
  });

  it('--client claude-code → quickstart shows Claude Code guidance', { skip: SKIP_NO_BEADS }, () => {
    // Step 1: Run init
    const initResult = runCli(testDir, 'init', ['--client', 'claude-code', '--force', '--skip-beads']);
    assert.strictEqual(initResult.code, 0, `Init failed: ${initResult.stdout}`);

    // Step 2: Ensure agents dir exists (claude-code init doesn't create it)
    ensureAgentsDir(testDir);
    simulateBeadsInit(testDir);

    // Step 3: Run quickstart
    const qsResult = runCli(testDir, 'quickstart');

    // Step 4: Verify Claude Code guidance
    assert.ok(
      qsResult.stdout.includes('CLAUDE.md'),
      `Quickstart should mention CLAUDE.md for claude-code client. Output:\n${qsResult.stdout}`
    );
    assert.ok(
      qsResult.stdout.includes('Claude Code'),
      `Quickstart should show Claude Code section.`
    );
  });

  it('--client copilot-cli → quickstart shows Copilot CLI guidance', { skip: SKIP_NO_BEADS }, () => {
    // Step 1: Run init
    const initResult = runCli(testDir, 'init', ['--client', 'copilot-cli', '--force', '--skip-beads']);
    assert.strictEqual(initResult.code, 0, `Init failed: ${initResult.stdout}`);

    // Step 2: Ensure agents dir exists (copilot-cli init doesn't create it)
    ensureAgentsDir(testDir);
    simulateBeadsInit(testDir);

    // Step 3: Run quickstart
    const qsResult = runCli(testDir, 'quickstart');

    // Step 4: Verify Copilot CLI guidance
    assert.ok(
      qsResult.stdout.includes('copilot-instructions.md'),
      `Quickstart should mention copilot-instructions.md for copilot-cli client. Output:\n${qsResult.stdout}`
    );
    assert.ok(
      qsResult.stdout.includes('Copilot CLI'),
      `Quickstart should show Copilot CLI section.`
    );
  });

  it('--client all → quickstart shows all three client sections', { skip: SKIP_NO_BEADS }, () => {
    // Step 1: Run init
    const initResult = runCli(testDir, 'init', ['--client', 'all', '--force', '--skip-beads']);
    assert.strictEqual(initResult.code, 0, `Init failed: ${initResult.stdout}`);

    // Step 2: Prepare for quickstart
    simulateBeadsInit(testDir);

    // Step 3: Run quickstart
    const qsResult = runCli(testDir, 'quickstart');

    // Step 4: Verify all three sections appear
    assert.ok(
      qsResult.stdout.includes('Copilot Chat'),
      `Quickstart should show VS Code / Copilot Chat section for --client all. Output:\n${qsResult.stdout}`
    );
    assert.ok(
      qsResult.stdout.includes('Copilot CLI'),
      `Quickstart should show Copilot CLI section for --client all.`
    );
    assert.ok(
      qsResult.stdout.includes('Claude Code'),
      `Quickstart should show Claude Code section for --client all.`
    );
  });

  it('quickstart reads .beth-client.json written by init (not marker fallback)', { skip: SKIP_NO_BEADS }, () => {
    // Run init --client claude-code
    runCli(testDir, 'init', ['--client', 'claude-code', '--force', '--skip-beads']);

    // Ensure quickstart prereqs
    ensureAgentsDir(testDir);
    simulateBeadsInit(testDir);

    // Verify the config file exists and quickstart uses it
    const configPath = join(testDir, '.github', '.beth-client.json');
    assert.ok(existsSync(configPath), '.beth-client.json should have been written by init');

    const config = JSON.parse(readFileSync(configPath, 'utf-8'));
    assert.strictEqual(config.claudeCode, true, 'Config should have claudeCode: true');

    const qsResult = runCli(testDir, 'quickstart');

    // Should show Claude Code guidance (proves config was read, not marker fallback)
    assert.ok(
      qsResult.stdout.includes('Claude Code'),
      'Quickstart should use persisted config, not fallback to marker detection'
    );
    // Should NOT show VS Code guidance (marker fallback sees .github/agents/ → vscode)
    assert.ok(
      !qsResult.stdout.includes('Copilot Chat'),
      'Quickstart should NOT show VS Code guidance for claude-code config'
    );
  });
});

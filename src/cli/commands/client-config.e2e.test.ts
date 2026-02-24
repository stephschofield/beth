/**
 * E2E tests for each Beth client configuration.
 *
 * Tests the three supported client modes:
 *   - VS Code GitHub Copilot Chat (--client vscode)
 *   - GitHub Copilot CLI (--client copilot-cli)
 *   - Claude Code (--client claude-code)
 *
 * Each configuration installs a different set of files. These tests verify
 * that each mode installs exactly what it should — and nothing extra.
 *
 * Run with: node --test dist/cli/commands/client-config.e2e.test.js
 */

import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert';
import { execSync } from 'child_process';
import {
  existsSync,
  mkdirSync,
  rmSync,
  readFileSync,
  readdirSync,
  writeFileSync,
} from 'fs';
import { join, resolve } from 'path';
import { tmpdir } from 'os';

const CLI_PATH = resolve(join(import.meta.dirname, '..', '..', '..', 'bin', 'cli.js'));

// Expected template contents
const EXPECTED_AGENTS = [
  'beth.agent.md',
  'developer.agent.md',
  'product-manager.agent.md',
  'researcher.agent.md',
  'security-reviewer.agent.md',
  'tester.agent.md',
  'ux-designer.agent.md',
];

const EXPECTED_SKILLS = [
  'framer-components',
  'prd',
  'security-analysis',
  'shadcn-ui',
  'vercel-react-best-practices',
  'web-design-guidelines',
];

/**
 * Run the CLI init command with a specific --client flag.
 */
function runInit(
  cwd: string,
  clientMode: string,
  extraFlags: string[] = []
): { stdout: string; stderr: string; code: number } {
  const flags = ['--skip-beads', '--client', clientMode, ...extraFlags];
  const command = `node "${CLI_PATH}" init ${flags.join(' ')}`;
  try {
    const stdout = execSync(command, {
      cwd,
      encoding: 'utf-8',
      env: { ...process.env, NO_COLOR: '1' },
      stdio: ['pipe', 'pipe', 'pipe'],
    });
    return { stdout, stderr: '', code: 0 };
  } catch (error: unknown) {
    const e = error as { stdout?: string; stderr?: string; status?: number };
    return { stdout: e.stdout || '', stderr: e.stderr || '', code: e.status || 1 };
  }
}

/**
 * Run the CLI doctor command.
 */
function runDoctor(cwd: string): { stdout: string; stderr: string; code: number } {
  try {
    const stdout = execSync(`node "${CLI_PATH}" doctor`, {
      cwd,
      encoding: 'utf-8',
      env: { ...process.env, NO_COLOR: '1' },
      stdio: ['pipe', 'pipe', 'pipe'],
    });
    return { stdout, stderr: '', code: 0 };
  } catch (error: unknown) {
    const e = error as { stdout?: string; stderr?: string; status?: number };
    return { stdout: e.stdout || '', stderr: e.stderr || '', code: e.status || 1 };
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
//  VS CODE + GITHUB COPILOT CHAT
// ═══════════════════════════════════════════════════════════════════════════════

describe('--client vscode (VS Code + GitHub Copilot Chat)', () => {
  let testDir: string;

  beforeEach(() => {
    testDir = join(tmpdir(), `beth-vscode-${Date.now()}-${Math.random().toString(36).slice(2)}`);
    mkdirSync(testDir, { recursive: true });
  });

  afterEach(() => {
    if (existsSync(testDir)) {
      rmSync(testDir, { recursive: true, force: true });
    }
  });

  describe('installed file structure', () => {
    it('should exit 0', () => {
      const result = runInit(testDir, 'vscode');
      assert.strictEqual(result.code, 0, `Init failed: ${result.stdout}\n${result.stderr}`);
    });

    it('should install all 7 agent definition files', () => {
      runInit(testDir, 'vscode');

      const agentsDir = join(testDir, '.github', 'agents');
      assert.ok(existsSync(agentsDir), '.github/agents/ should exist');

      const files = readdirSync(agentsDir).filter(f => f.endsWith('.agent.md')).sort();
      assert.deepStrictEqual(files, EXPECTED_AGENTS, 'Should have all 7 agents');
    });

    it('should install all 6 skill directories with SKILL.md or AGENTS.md', () => {
      runInit(testDir, 'vscode');

      const skillsDir = join(testDir, '.github', 'skills');
      assert.ok(existsSync(skillsDir), '.github/skills/ should exist');

      const dirs = readdirSync(skillsDir)
        .filter(f => {
          const skillMd = join(skillsDir, f, 'SKILL.md');
          const agentsMd = join(skillsDir, f, 'AGENTS.md');
          return existsSync(skillMd) || existsSync(agentsMd);
        })
        .sort();
      assert.deepStrictEqual(dirs, EXPECTED_SKILLS, 'Should have all 6 skills');
    });

    it('should install copilot-instructions.md', () => {
      runInit(testDir, 'vscode');

      const filepath = join(testDir, '.github', 'copilot-instructions.md');
      assert.ok(existsSync(filepath), '.github/copilot-instructions.md should exist');

      const content = readFileSync(filepath, 'utf-8');
      assert.ok(content.includes('Agent'), 'copilot-instructions.md should reference agents');
    });

    it('should install .vscode/settings.json with required settings', () => {
      runInit(testDir, 'vscode');

      const settingsPath = join(testDir, '.vscode', 'settings.json');
      assert.ok(existsSync(settingsPath), '.vscode/settings.json should exist');

      const content = readFileSync(settingsPath, 'utf-8');
      // Strip JSONC comments
      const stripped = content.replace(/\/\/.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '');
      const settings = JSON.parse(stripped);

      assert.strictEqual(
        settings['chat.customAgentInSubagent.enabled'],
        true,
        'Should enable subagent delegation'
      );
      assert.strictEqual(
        settings['chat.agent.enabled'],
        true,
        'Should enable agent mode'
      );
    });

    it('should install .vscode/mcp.json with MCP server definitions', () => {
      runInit(testDir, 'vscode');

      const mcpPath = join(testDir, '.vscode', 'mcp.json');
      assert.ok(existsSync(mcpPath), '.vscode/mcp.json should exist');

      const mcp = JSON.parse(readFileSync(mcpPath, 'utf-8'));
      assert.ok(mcp.servers, 'mcp.json should have servers object');
      assert.ok(mcp.servers.shadcn, 'Should have shadcn MCP server configured');
    });

    it('should install AGENTS.md in project root', () => {
      runInit(testDir, 'vscode');
      assert.ok(existsSync(join(testDir, 'AGENTS.md')), 'AGENTS.md should exist');
    });

    it('should install Backlog.md in project root', () => {
      runInit(testDir, 'vscode');
      assert.ok(existsSync(join(testDir, 'Backlog.md')), 'Backlog.md should exist');
    });

    it('should NOT install CLAUDE.md (VS Code mode is not Claude Code)', () => {
      runInit(testDir, 'vscode');
      assert.strictEqual(
        existsSync(join(testDir, 'CLAUDE.md')),
        false,
        'CLAUDE.md should NOT exist for vscode mode'
      );
    });
  });

  describe('agent frontmatter validation', () => {
    it('all agent files should have valid YAML frontmatter with name field', () => {
      runInit(testDir, 'vscode');

      const agentsDir = join(testDir, '.github', 'agents');
      const files = readdirSync(agentsDir).filter(f => f.endsWith('.agent.md'));

      for (const file of files) {
        const content = readFileSync(join(agentsDir, file), 'utf-8');
        assert.ok(content.startsWith('---'), `${file} should start with frontmatter delimiter`);
        assert.ok(content.includes('name:'), `${file} should have name field`);
        assert.ok(content.includes('description:'), `${file} should have description field`);
        assert.ok(content.includes('tools:'), `${file} should have tools field`);
      }
    });

    it('beth.agent.md should have runSubagent tool and handoffs', () => {
      runInit(testDir, 'vscode');

      const content = readFileSync(join(testDir, '.github', 'agents', 'beth.agent.md'), 'utf-8');
      assert.ok(content.includes('runSubagent'), 'Beth agent should have runSubagent tool');
      assert.ok(content.includes('handoffs:'), 'Beth agent should define handoffs');
      assert.ok(content.includes('infer: true'), 'Beth agent should be inferable as subagent');
    });

    it('developer.agent.md should have editing tools', () => {
      runInit(testDir, 'vscode');

      const content = readFileSync(join(testDir, '.github', 'agents', 'developer.agent.md'), 'utf-8');
      assert.ok(content.includes('editFiles'), 'Developer should have editFiles tool');
      assert.ok(content.includes('readFile'), 'Developer should have readFile tool');
    });
  });

  describe('init → doctor pipeline', () => {
    it('doctor should recognize all agents installed by init --client vscode', () => {
      runInit(testDir, 'vscode');

      const doctorResult = runDoctor(testDir);
      assert.ok(
        doctorResult.stdout.includes('7 agents'),
        `Doctor should find 7 agents. Output:\n${doctorResult.stdout}`
      );
    });

    it('doctor should recognize all skills installed by init --client vscode', () => {
      runInit(testDir, 'vscode');

      const doctorResult = runDoctor(testDir);
      assert.ok(
        doctorResult.stdout.includes('6 skills'),
        `Doctor should find 6 skills. Output:\n${doctorResult.stdout}`
      );
    });
  });

  describe('--skip-mcp flag', () => {
    it('should not install .vscode/mcp.json when --skip-mcp is used', () => {
      runInit(testDir, 'vscode', ['--skip-mcp']);

      assert.strictEqual(
        existsSync(join(testDir, '.vscode', 'mcp.json')),
        false,
        '.vscode/mcp.json should NOT exist with --skip-mcp'
      );
    });

    it('should still install .vscode/settings.json when --skip-mcp is used', () => {
      runInit(testDir, 'vscode', ['--skip-mcp']);

      assert.ok(
        existsSync(join(testDir, '.vscode', 'settings.json')),
        '.vscode/settings.json should still exist with --skip-mcp'
      );
    });
  });

  describe('--force flag', () => {
    it('should overwrite existing agent files with --force', () => {
      // First init
      runInit(testDir, 'vscode');

      // Corrupt an agent
      const bethAgent = join(testDir, '.github', 'agents', 'beth.agent.md');
      writeFileSync(bethAgent, 'corrupted');

      // Re-init with force
      runInit(testDir, 'vscode', ['--force']);

      const content = readFileSync(bethAgent, 'utf-8');
      assert.ok(content.startsWith('---'), 'Forced re-init should restore valid agent file');
      assert.ok(content.includes('name: Beth'), 'Forced re-init should restore Beth agent');
    });
  });

  describe('output messaging', () => {
    it('should mention VS Code in the output', () => {
      const result = runInit(testDir, 'vscode');
      assert.ok(
        result.stdout.includes('VS Code') || result.stdout.includes('vscode') || result.stdout.includes('Copilot'),
        'Output should reference VS Code or Copilot'
      );
    });

    it('should report configuring for VS Code', () => {
      const result = runInit(testDir, 'vscode');
      assert.ok(
        result.stdout.includes('Configuring for') || result.stdout.includes('Installing'),
        'Output should confirm which client is being configured'
      );
    });
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
//  GITHUB COPILOT CLI
// ═══════════════════════════════════════════════════════════════════════════════

describe('--client copilot-cli (GitHub Copilot CLI)', () => {
  let testDir: string;

  beforeEach(() => {
    testDir = join(tmpdir(), `beth-copilot-cli-${Date.now()}-${Math.random().toString(36).slice(2)}`);
    mkdirSync(testDir, { recursive: true });
  });

  afterEach(() => {
    if (existsSync(testDir)) {
      rmSync(testDir, { recursive: true, force: true });
    }
  });

  describe('installed file structure', () => {
    it('should exit 0', () => {
      const result = runInit(testDir, 'copilot-cli');
      assert.strictEqual(result.code, 0, `Init failed: ${result.stdout}\n${result.stderr}`);
    });

    it('should install copilot-instructions.md', () => {
      runInit(testDir, 'copilot-cli');

      const filepath = join(testDir, '.github', 'copilot-instructions.md');
      assert.ok(existsSync(filepath), '.github/copilot-instructions.md should exist');

      const content = readFileSync(filepath, 'utf-8');
      assert.ok(content.includes('Agent'), 'copilot-instructions.md should reference agents');
    });

    it('should install all 6 skill directories (shared knowledge)', () => {
      runInit(testDir, 'copilot-cli');

      const skillsDir = join(testDir, '.github', 'skills');
      assert.ok(existsSync(skillsDir), '.github/skills/ should exist');

      const dirs = readdirSync(skillsDir)
        .filter(f => {
          const skillMd = join(skillsDir, f, 'SKILL.md');
          const agentsMd = join(skillsDir, f, 'AGENTS.md');
          return existsSync(skillMd) || existsSync(agentsMd);
        })
        .sort();
      assert.deepStrictEqual(dirs, EXPECTED_SKILLS, 'Should have all 6 skills');
    });

    it('should install AGENTS.md in project root', () => {
      runInit(testDir, 'copilot-cli');
      assert.ok(existsSync(join(testDir, 'AGENTS.md')), 'AGENTS.md should exist');
    });

    it('should install Backlog.md in project root', () => {
      runInit(testDir, 'copilot-cli');
      assert.ok(existsSync(join(testDir, 'Backlog.md')), 'Backlog.md should exist');
    });

    it('should NOT install .github/agents/ (no VS Code agent frontmatter needed)', () => {
      runInit(testDir, 'copilot-cli');
      assert.strictEqual(
        existsSync(join(testDir, '.github', 'agents')),
        false,
        '.github/agents/ should NOT exist for copilot-cli mode'
      );
    });

    it('should NOT install .vscode/ directory', () => {
      runInit(testDir, 'copilot-cli');
      assert.strictEqual(
        existsSync(join(testDir, '.vscode')),
        false,
        '.vscode/ should NOT exist for copilot-cli mode'
      );
    });

    it('should NOT install CLAUDE.md', () => {
      runInit(testDir, 'copilot-cli');
      assert.strictEqual(
        existsSync(join(testDir, 'CLAUDE.md')),
        false,
        'CLAUDE.md should NOT exist for copilot-cli mode'
      );
    });
  });

  describe('output messaging', () => {
    it('should mention Copilot CLI in the output', () => {
      const result = runInit(testDir, 'copilot-cli');
      assert.ok(
        result.stdout.includes('Copilot CLI') || result.stdout.includes('copilot-cli'),
        'Output should reference Copilot CLI'
      );
    });
  });

  describe('skip flags work in copilot-cli mode', () => {
    it('should not install Backlog.md with --skip-backlog', () => {
      runInit(testDir, 'copilot-cli', ['--skip-backlog']);
      assert.strictEqual(
        existsSync(join(testDir, 'Backlog.md')),
        false,
        'Backlog.md should not exist with --skip-backlog'
      );
    });
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
//  CLAUDE CODE
// ═══════════════════════════════════════════════════════════════════════════════

describe('--client claude-code (Claude Code)', () => {
  let testDir: string;

  beforeEach(() => {
    testDir = join(tmpdir(), `beth-claude-${Date.now()}-${Math.random().toString(36).slice(2)}`);
    mkdirSync(testDir, { recursive: true });
  });

  afterEach(() => {
    if (existsSync(testDir)) {
      rmSync(testDir, { recursive: true, force: true });
    }
  });

  describe('installed file structure', () => {
    it('should exit 0', () => {
      const result = runInit(testDir, 'claude-code');
      assert.strictEqual(result.code, 0, `Init failed: ${result.stdout}\n${result.stderr}`);
    });

    it('should install CLAUDE.md in project root', () => {
      runInit(testDir, 'claude-code');

      const claudeMd = join(testDir, 'CLAUDE.md');
      assert.ok(existsSync(claudeMd), 'CLAUDE.md should exist');

      const content = readFileSync(claudeMd, 'utf-8');
      assert.ok(content.includes('Beth'), 'CLAUDE.md should reference Beth');
      assert.ok(
        content.includes('Seven') || content.includes('agent') || content.includes('Role'),
        'CLAUDE.md should describe the agent roles'
      );
    });

    it('should install all 6 skill directories (shared knowledge)', () => {
      runInit(testDir, 'claude-code');

      const skillsDir = join(testDir, '.github', 'skills');
      assert.ok(existsSync(skillsDir), '.github/skills/ should exist');

      const dirs = readdirSync(skillsDir)
        .filter(f => {
          const skillMd = join(skillsDir, f, 'SKILL.md');
          const agentsMd = join(skillsDir, f, 'AGENTS.md');
          return existsSync(skillMd) || existsSync(agentsMd);
        })
        .sort();
      assert.deepStrictEqual(dirs, EXPECTED_SKILLS, 'Should have all 6 skills');
    });

    it('should install AGENTS.md in project root', () => {
      runInit(testDir, 'claude-code');
      assert.ok(existsSync(join(testDir, 'AGENTS.md')), 'AGENTS.md should exist');
    });

    it('should install Backlog.md in project root', () => {
      runInit(testDir, 'claude-code');
      assert.ok(existsSync(join(testDir, 'Backlog.md')), 'Backlog.md should exist');
    });

    it('should NOT install .github/agents/ (no VS Code frontmatter agents)', () => {
      runInit(testDir, 'claude-code');
      assert.strictEqual(
        existsSync(join(testDir, '.github', 'agents')),
        false,
        '.github/agents/ should NOT exist for claude-code mode'
      );
    });

    it('should NOT install .vscode/ directory', () => {
      runInit(testDir, 'claude-code');
      assert.strictEqual(
        existsSync(join(testDir, '.vscode')),
        false,
        '.vscode/ should NOT exist for claude-code mode'
      );
    });

    it('should NOT install copilot-instructions.md', () => {
      runInit(testDir, 'claude-code');
      assert.strictEqual(
        existsSync(join(testDir, '.github', 'copilot-instructions.md')),
        false,
        'copilot-instructions.md should NOT exist for claude-code mode'
      );
    });
  });

  describe('CLAUDE.md content validation', () => {
    it('should contain Beth personality and role descriptions', () => {
      runInit(testDir, 'claude-code');

      const content = readFileSync(join(testDir, 'CLAUDE.md'), 'utf-8');
      assert.ok(content.includes('Beth'), 'Should reference Beth');
      assert.ok(content.includes('Developer') || content.includes('developer'), 'Should mention developer role');
      assert.ok(content.includes('Tester') || content.includes('tester'), 'Should mention tester role');
    });

    it('should contain skill references', () => {
      runInit(testDir, 'claude-code');

      const content = readFileSync(join(testDir, 'CLAUDE.md'), 'utf-8');
      assert.ok(content.includes('skills'), 'Should reference skills system');
      assert.ok(content.includes('SKILL.md'), 'Should reference SKILL.md files');
    });

    it('should contain beads integration instructions', () => {
      runInit(testDir, 'claude-code');

      const content = readFileSync(join(testDir, 'CLAUDE.md'), 'utf-8');
      assert.ok(content.includes('beads') || content.includes('bd'), 'Should reference beads/bd');
    });
  });

  describe('output messaging', () => {
    it('should mention Claude Code in the output', () => {
      const result = runInit(testDir, 'claude-code');
      assert.ok(
        result.stdout.includes('Claude') || result.stdout.includes('claude'),
        'Output should reference Claude Code'
      );
    });
  });

  describe('skip flags work in claude-code mode', () => {
    it('should not install Backlog.md with --skip-backlog', () => {
      runInit(testDir, 'claude-code', ['--skip-backlog']);
      assert.strictEqual(
        existsSync(join(testDir, 'Backlog.md')),
        false,
        'Backlog.md should not exist with --skip-backlog'
      );
    });
  });

  describe('--force flag', () => {
    it('should overwrite existing CLAUDE.md with --force', () => {
      writeFileSync(join(testDir, 'CLAUDE.md'), 'ORIGINAL');

      runInit(testDir, 'claude-code');
      let content = readFileSync(join(testDir, 'CLAUDE.md'), 'utf-8');
      assert.strictEqual(content, 'ORIGINAL', 'Should not overwrite without --force');

      runInit(testDir, 'claude-code', ['--force']);
      content = readFileSync(join(testDir, 'CLAUDE.md'), 'utf-8');
      assert.notStrictEqual(content, 'ORIGINAL', 'Should overwrite with --force');
      assert.ok(content.includes('Beth'), 'Restored CLAUDE.md should contain Beth');
    });
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
//  CROSS-CONFIGURATION TESTS
// ═══════════════════════════════════════════════════════════════════════════════

describe('cross-configuration behavior', () => {
  let testDir: string;

  beforeEach(() => {
    testDir = join(tmpdir(), `beth-cross-${Date.now()}-${Math.random().toString(36).slice(2)}`);
    mkdirSync(testDir, { recursive: true });
  });

  afterEach(() => {
    if (existsSync(testDir)) {
      rmSync(testDir, { recursive: true, force: true });
    }
  });

  describe('--client all installs everything', () => {
    it('should install VS Code agents, Claude Code CLAUDE.md, and copilot-instructions', () => {
      runInit(testDir, 'all');

      // VS Code files
      assert.ok(existsSync(join(testDir, '.github', 'agents')), 'agents/ should exist for --client all');
      assert.ok(existsSync(join(testDir, '.vscode', 'settings.json')), 'settings.json should exist');
      assert.ok(existsSync(join(testDir, '.vscode', 'mcp.json')), 'mcp.json should exist');

      // Copilot CLI files
      assert.ok(
        existsSync(join(testDir, '.github', 'copilot-instructions.md')),
        'copilot-instructions.md should exist'
      );

      // Claude Code files
      assert.ok(existsSync(join(testDir, 'CLAUDE.md')), 'CLAUDE.md should exist');

      // Shared files
      assert.ok(existsSync(join(testDir, '.github', 'skills')), 'skills/ should exist');
      assert.ok(existsSync(join(testDir, 'AGENTS.md')), 'AGENTS.md should exist');
      assert.ok(existsSync(join(testDir, 'Backlog.md')), 'Backlog.md should exist');
    });

    it('should install all 7 agents', () => {
      runInit(testDir, 'all');

      const agentsDir = join(testDir, '.github', 'agents');
      const files = readdirSync(agentsDir).filter(f => f.endsWith('.agent.md')).sort();
      assert.deepStrictEqual(files, EXPECTED_AGENTS, 'All mode should install all 7 agents');
    });

    it('should install all 6 skills', () => {
      runInit(testDir, 'all');

      const skillsDir = join(testDir, '.github', 'skills');
      const dirs = readdirSync(skillsDir)
        .filter(f => {
          const skillMd = join(skillsDir, f, 'SKILL.md');
          const agentsMd = join(skillsDir, f, 'AGENTS.md');
          return existsSync(skillMd) || existsSync(agentsMd);
        })
        .sort();
      assert.deepStrictEqual(dirs, EXPECTED_SKILLS, 'All mode should install all 6 skills');
    });
  });

  describe('shared files are consistent across modes', () => {
    it('skills/ content should be identical regardless of client mode', () => {
      // Install for each mode in separate directories
      const vsDir = join(testDir, 'vscode');
      const cliDir = join(testDir, 'copilot-cli');
      const claudeDir = join(testDir, 'claude-code');

      mkdirSync(vsDir, { recursive: true });
      mkdirSync(cliDir, { recursive: true });
      mkdirSync(claudeDir, { recursive: true });

      runInit(vsDir, 'vscode');
      runInit(cliDir, 'copilot-cli');
      runInit(claudeDir, 'claude-code');

      // Each should have the same skills
      const vsSkills = readdirSync(join(vsDir, '.github', 'skills')).sort();
      const cliSkills = readdirSync(join(cliDir, '.github', 'skills')).sort();
      const claudeSkills = readdirSync(join(claudeDir, '.github', 'skills')).sort();

      assert.deepStrictEqual(vsSkills, cliSkills, 'VS Code and CLI skills should match');
      assert.deepStrictEqual(cliSkills, claudeSkills, 'CLI and Claude skills should match');
    });

    it('AGENTS.md should be identical regardless of client mode', () => {
      const vsDir = join(testDir, 'vscode');
      const cliDir = join(testDir, 'copilot-cli');
      const claudeDir = join(testDir, 'claude-code');

      mkdirSync(vsDir, { recursive: true });
      mkdirSync(cliDir, { recursive: true });
      mkdirSync(claudeDir, { recursive: true });

      runInit(vsDir, 'vscode');
      runInit(cliDir, 'copilot-cli');
      runInit(claudeDir, 'claude-code');

      const vsContent = readFileSync(join(vsDir, 'AGENTS.md'), 'utf-8');
      const cliContent = readFileSync(join(cliDir, 'AGENTS.md'), 'utf-8');
      const claudeContent = readFileSync(join(claudeDir, 'AGENTS.md'), 'utf-8');

      assert.strictEqual(vsContent, cliContent, 'VS Code and CLI AGENTS.md should match');
      assert.strictEqual(cliContent, claudeContent, 'CLI and Claude AGENTS.md should match');
    });
  });

  describe('mode exclusivity', () => {
    it('vscode mode should NOT produce claude-code or copilot-cli exclusive files', () => {
      runInit(testDir, 'vscode');

      // CLAUDE.md is claude-code exclusive
      assert.strictEqual(existsSync(join(testDir, 'CLAUDE.md')), false, 'No CLAUDE.md in vscode mode');
    });

    it('copilot-cli mode should NOT produce vscode or claude-code exclusive files', () => {
      runInit(testDir, 'copilot-cli');

      // .github/agents/ is vscode exclusive
      assert.strictEqual(existsSync(join(testDir, '.github', 'agents')), false, 'No agents/ in copilot-cli mode');
      // .vscode/ is vscode exclusive
      assert.strictEqual(existsSync(join(testDir, '.vscode')), false, 'No .vscode/ in copilot-cli mode');
      // CLAUDE.md is claude-code exclusive
      assert.strictEqual(existsSync(join(testDir, 'CLAUDE.md')), false, 'No CLAUDE.md in copilot-cli mode');
    });

    it('claude-code mode should NOT produce vscode or copilot-cli exclusive files', () => {
      runInit(testDir, 'claude-code');

      // .github/agents/ is vscode exclusive
      assert.strictEqual(existsSync(join(testDir, '.github', 'agents')), false, 'No agents/ in claude-code mode');
      // .vscode/ is vscode exclusive
      assert.strictEqual(existsSync(join(testDir, '.vscode')), false, 'No .vscode/ in claude-code mode');
      // copilot-instructions.md is vscode/copilot-cli exclusive
      assert.strictEqual(
        existsSync(join(testDir, '.github', 'copilot-instructions.md')),
        false,
        'No copilot-instructions.md in claude-code mode'
      );
    });
  });

  describe('sequential init with different clients', () => {
    it('should layer vscode on top of claude-code without conflict', () => {
      // First: Claude Code
      runInit(testDir, 'claude-code');
      assert.ok(existsSync(join(testDir, 'CLAUDE.md')), 'CLAUDE.md from first init');
      assert.strictEqual(existsSync(join(testDir, '.github', 'agents')), false, 'No agents yet');

      // Second: VS Code (without force — should add its files)
      runInit(testDir, 'vscode');
      assert.ok(existsSync(join(testDir, 'CLAUDE.md')), 'CLAUDE.md preserved from first init');
      assert.ok(existsSync(join(testDir, '.github', 'agents')), 'agents/ added by second init');
      assert.ok(existsSync(join(testDir, '.vscode', 'settings.json')), 'settings.json added by second init');
    });

    it('should layer claude-code on top of vscode without conflict', () => {
      // First: VS Code
      runInit(testDir, 'vscode');
      assert.ok(existsSync(join(testDir, '.github', 'agents')), 'agents/ from first init');

      // Second: Claude Code
      runInit(testDir, 'claude-code');
      assert.ok(existsSync(join(testDir, '.github', 'agents')), 'agents/ preserved from first init');
      assert.ok(existsSync(join(testDir, 'CLAUDE.md')), 'CLAUDE.md added by second init');
    });

    it('doctor should pass after layering vscode + claude-code', () => {
      runInit(testDir, 'vscode');
      runInit(testDir, 'claude-code');

      // Simulate beads init
      mkdirSync(join(testDir, '.beads'), { recursive: true });

      const doctorResult = runDoctor(testDir);
      assert.ok(
        doctorResult.stdout.includes('7 agents'),
        `Doctor should find 7 agents after layered init. Output:\n${doctorResult.stdout}`
      );
    });
  });

  describe('invalid --client value', () => {
    it('should reject invalid client values', () => {
      const result = runInit(testDir, 'invalid-client');
      assert.notStrictEqual(result.code, 0, 'Should exit non-zero for invalid client');
      assert.ok(
        result.stdout.includes('Invalid client') || result.stderr.includes('Invalid client'),
        'Should report invalid client'
      );
    });
  });
});

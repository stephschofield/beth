/**
 * Client Configuration Persistence and Detection
 *
 * Persists the user's AI client selection (VS Code, Copilot CLI, Claude Code)
 * to `.github/.beth-client.json` so other commands can detect which client
 * was chosen during `init`.
 *
 * Falls back to marker file detection when no config file exists.
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

export interface ClientSelection {
  vscode: boolean;
  copilotCli: boolean;
  claudeCode: boolean;
}

export const CLIENT_CONFIG_FILE = '.beth-client.json';
export const CLIENT_CONFIG_DIR = '.github';

/**
 * Persist the client selection to `.github/.beth-client.json`.
 * Creates the `.github/` directory if it doesn't exist.
 * Overwrites any existing config file.
 */
export function persistClientConfig(cwd: string, clients: ClientSelection): void {
  const dir = join(cwd, CLIENT_CONFIG_DIR);
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
  const filePath = join(dir, CLIENT_CONFIG_FILE);
  writeFileSync(filePath, JSON.stringify(clients, null, 2) + '\n', 'utf-8');
}

/**
 * Detect the client configuration.
 *
 * 1. Tries to read `.github/.beth-client.json`
 * 2. Falls back to marker file detection if config is missing or invalid
 * 3. Defaults to `{ vscode: true, copilotCli: false, claudeCode: false }` if nothing detected
 */
export function detectClientConfig(cwd: string): ClientSelection {
  // Try reading persisted config first
  const filePath = join(cwd, CLIENT_CONFIG_DIR, CLIENT_CONFIG_FILE);
  if (existsSync(filePath)) {
    try {
      const raw = readFileSync(filePath, 'utf-8');
      const parsed: unknown = JSON.parse(raw);
      if (isValidClientSelection(parsed)) {
        return parsed;
      }
    } catch {
      // Invalid JSON — fall through to marker detection
    }
  }

  // Marker file detection
  return detectFromMarkers(cwd);
}

function isValidClientSelection(value: unknown): value is ClientSelection {
  if (typeof value !== 'object' || value === null) return false;
  const obj = value as Record<string, unknown>;
  return (
    typeof obj.vscode === 'boolean' &&
    typeof obj.copilotCli === 'boolean' &&
    typeof obj.claudeCode === 'boolean'
  );
}

function detectFromMarkers(cwd: string): ClientSelection {
  const hasAgentsDir = existsSync(join(cwd, '.github', 'agents'));
  const hasClaudeMd = existsSync(join(cwd, 'CLAUDE.md'));
  const hasCopilotInstructions = existsSync(join(cwd, '.github', 'copilot-instructions.md'));

  const vscode = hasAgentsDir;
  const claudeCode = hasClaudeMd;
  const copilotCli = hasCopilotInstructions && !hasAgentsDir;

  // If nothing detected, default to vscode
  if (!vscode && !copilotCli && !claudeCode) {
    return { vscode: true, copilotCli: false, claudeCode: false };
  }

  return { vscode, copilotCli, claudeCode };
}

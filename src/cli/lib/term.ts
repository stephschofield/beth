/**
 * Terminal colors shared by the CLI commands.
 *
 * Every command file previously declared its own subset of this palette with
 * identical escape codes; this is the single source.
 */
export const COLORS = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

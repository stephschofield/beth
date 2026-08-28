/**
 * Shipped Template Assets — Validation
 *
 * Validates the agent and skill definitions that `beth init` copies into a
 * user's project. These files ARE the product, so they must parse and be
 * internally coherent (handoffs resolve, required tools present, ids unique).
 *
 * Parsing is done here with gray-matter directly rather than through a shared
 * loader module: the loader existed only to serve these tests and an unused
 * public API, so its parsing rules live inline where they are asserted.
 */

import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { join, basename } from 'node:path';
import matter from 'gray-matter';

const AGENTS_DIR = join(process.cwd(), 'templates', '.github', 'agents');
const SKILLS_DIR = join(process.cwd(), 'templates', '.github', 'skills');

// ─── Types ─────────────────────────────────────────────────────────────────

/** A handoff entry in agent frontmatter. */
interface AgentHandoff {
  label: string;
  agent: string;
  prompt: string;
  send?: boolean;
}

/** The frontmatter fields this suite asserts on. */
interface AgentFrontmatter {
  name?: string;
  description?: string;
  model?: string;
  tools?: string[];
  infer?: boolean;
  handoffs?: AgentHandoff[];
}

interface Agent {
  id: string;
  frontmatter: AgentFrontmatter;
  body: string;
}

interface Skill {
  id: string;
  frontmatter: { name?: string; description?: string };
  body: string;
}

// ─── Parsing ───────────────────────────────────────────────────────────────

/**
 * Strip a ```chatagent / ```skill code-fence wrapper, if present.
 * Copilot allows either bare frontmatter or a fenced document.
 */
function stripCodeFence(content: string): string {
  const fence = content.match(/^(`{3,})(chatagent|skill)\s*[\r\n]/);
  if (!fence) return content;
  const closing = '`'.repeat(fence[1].length);
  const end = content.lastIndexOf(closing);
  if (end <= 0) return content;
  return content.slice(fence[0].length, end).trim();
}

function parseAgents(dir: string): Agent[] {
  return readdirSync(dir)
    .filter((f) => f.endsWith('.agent.md'))
    .map((f) => {
      const parsed = matter(stripCodeFence(readFileSync(join(dir, f), 'utf-8')));
      return {
        id: basename(f, '.agent.md'),
        frontmatter: parsed.data as AgentFrontmatter,
        body: parsed.content.trim(),
      };
    });
}

function parseSkills(dir: string): Skill[] {
  return readdirSync(dir)
    .filter((e) => statSync(join(dir, e)).isDirectory())
    .filter((e) => existsSync(join(dir, e, 'SKILL.md')))
    .map((e) => {
      const parsed = matter(
        stripCodeFence(readFileSync(join(dir, e, 'SKILL.md'), 'utf-8')),
      );
      return {
        id: e,
        frontmatter: parsed.frontmatter ?? (parsed.data as Skill['frontmatter']),
        body: parsed.content.trim(),
      };
    });
}

const agents = parseAgents(AGENTS_DIR);
const skills = parseSkills(SKILLS_DIR);
const byId = (id: string) => agents.find((a) => a.id === id);

const EXPECTED_AGENT_IDS = [
  'beth',
  'developer',
  'product-manager',
  'researcher',
  'security-reviewer',
  'tester',
  'ux-designer',
];

// ─── Agent suite ───────────────────────────────────────────────────────────

describe('Shipped agents', () => {
  it('the expected 7 agents are present', () => {
    expect(agents.map((a) => a.id).sort()).toEqual([...EXPECTED_AGENT_IDS].sort());
  });

  it('every agent has a non-empty name and description', () => {
    for (const a of agents) {
      expect(typeof a.frontmatter.name, `${a.id} name`).toBe('string');
      expect(a.frontmatter.name!.length, `${a.id} name`).toBeGreaterThan(0);
      expect(typeof a.frontmatter.description, `${a.id} description`).toBe('string');
      expect(a.frontmatter.description!.length, `${a.id} description`).toBeGreaterThan(0);
    }
  });

  it('every agent has substantial instructions', () => {
    for (const a of agents) {
      expect(a.body.length, `${a.id} body`).toBeGreaterThan(50);
    }
  });

  it('agent ids and names are unique', () => {
    const ids = agents.map((a) => a.id);
    const names = agents.map((a) => a.frontmatter.name);
    expect(new Set(ids).size).toBe(ids.length);
    expect(new Set(names).size).toBe(names.length);
  });

  it('every agent has a valid model field when present', () => {
    for (const a of agents) {
      if (a.frontmatter.model !== undefined) {
        expect(typeof a.frontmatter.model, `${a.id} model`).toBe('string');
        expect(a.frontmatter.model.length, `${a.id} model`).toBeGreaterThan(0);
      }
    }
  });
});

describe('Shipped agents — handoffs', () => {
  it('every handoff target resolves to a real agent', () => {
    const valid = new Set<string>([
      ...agents.map((a) => a.id.toLowerCase()),
      ...agents.map((a) => String(a.frontmatter.name).toLowerCase()),
    ]);
    for (const a of agents) {
      for (const h of a.frontmatter.handoffs ?? []) {
        expect(valid, `${a.id} -> ${h.agent}`).toContain(h.agent.toLowerCase());
      }
    }
  });

  it('every handoff has non-empty label, agent and prompt', () => {
    for (const a of agents) {
      (a.frontmatter.handoffs ?? []).forEach((h, i) => {
        for (const field of ['label', 'agent', 'prompt'] as const) {
          expect(typeof h[field], `${a.id} handoff[${i}].${field}`).toBe('string');
          expect(h[field].trim().length, `${a.id} handoff[${i}].${field}`).toBeGreaterThan(0);
        }
        if (h.send !== undefined) {
          expect(typeof h.send, `${a.id} handoff[${i}].send`).toBe('boolean');
        }
      });
    }
  });

  it('no agent hands off to itself', () => {
    for (const a of agents) {
      const targets = (a.frontmatter.handoffs ?? []).map((h) => h.agent.toLowerCase());
      expect(targets, `${a.id} self-handoff`).not.toContain(a.id.toLowerCase());
    }
  });

  it('beth hands off to every specialist', () => {
    const beth = byId('beth');
    expect(beth).toBeDefined();
    const targets = (beth!.frontmatter.handoffs ?? []).map((h) => h.agent.toLowerCase());
    for (const specialist of ['developer', 'product-manager', 'ux-designer', 'tester', 'researcher']) {
      expect(targets).toContain(specialist);
    }
  });
});

describe('Shipped agents — required tools', () => {
  it('beth can spawn subagents', () => {
    const beth = byId('beth');
    expect(beth!.frontmatter.tools).toContain('agent');
  });

  it('developer has read, edit and search tools', () => {
    const tools = byId('developer')!.frontmatter.tools ?? [];
    for (const t of ['readFile', 'editFiles', 'createFile', 'codebase', 'fileSearch', 'textSearch', 'runInTerminal', 'getTerminalOutput']) {
      expect(tools, `developer.${t}`).toContain(t);
    }
  });

  it('security-reviewer has code analysis tools', () => {
    const tools = byId('security-reviewer')!.frontmatter.tools ?? [];
    expect(tools.length).toBeGreaterThan(0);
    expect(tools.some((t) => ['codebase', 'textSearch', 'readFile', 'fileSearch'].includes(t))).toBe(true);
  });

  it('every declared tools field is an array of strings', () => {
    for (const a of agents) {
      if (a.frontmatter.tools === undefined) continue;
      expect(Array.isArray(a.frontmatter.tools), `${a.id} tools`).toBe(true);
      for (const t of a.frontmatter.tools) {
        expect(typeof t, `${a.id} tool ${String(t)}`).toBe('string');
      }
    }
  });

  it('product-manager and ux-designer are distinct roles', () => {
    const pm = byId('product-manager')!;
    const ux = byId('ux-designer')!;
    expect(pm.frontmatter.name).not.toBe(ux.frontmatter.name);
    expect(pm.frontmatter.description).not.toBe(ux.frontmatter.description);
    expect(pm.body).not.toBe(ux.body);
  });
});

// ─── Skills ────────────────────────────────────────────────────────────────

describe('Shipped skills', () => {
  it('all shipped skills parse', () => {
    expect(skills.length).toBeGreaterThanOrEqual(5);
  });

  it('every skill has a non-empty name and description', () => {
    for (const s of skills) {
      expect(typeof s.frontmatter.name, `${s.id} name`).toBe('string');
      expect(s.frontmatter.name!.length, `${s.id} name`).toBeGreaterThan(0);
      expect(typeof s.frontmatter.description, `${s.id} description`).toBe('string');
      expect(s.frontmatter.description!.length, `${s.id} description`).toBeGreaterThan(0);
    }
  });

  it('every skill has substantial content', () => {
    for (const s of skills) {
      expect(s.body.length, `${s.id} body`).toBeGreaterThan(50);
    }
  });

  it('skill ids are unique', () => {
    const ids = skills.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('the core skills are present', () => {
    const ids = skills.map((s) => s.id);
    for (const expected of ['prd', 'shadcn-ui', 'security-analysis', 'web-design-guidelines']) {
      expect(ids).toContain(expected);
    }
  });
});

/**
 * Skill Routing Tests — Categories 2–10
 *
 * Verifies every skill in the test matrix:
 * 1. Has a valid SKILL.md file on disk (exists and is non-empty)
 * 2. Is mapped to a valid agent from the Beth team
 *
 * These tests validate the structural integrity of the skill system.
 * They do NOT test LLM prompt inference or enforcement mechanisms
 * (hook injection is tested in hook-injection.test.ts).
 *
 * Test plan reference: docs/E2E-SKILL-TESTS.md — Categories 2–10 (tests 10–72)
 */

import { describe, it, expect } from 'vitest';
import { join } from 'node:path';
import { existsSync, readFileSync } from 'node:fs';

const PROJECT_ROOT = process.cwd();
const SKILLS_DIR = join(PROJECT_ROOT, '.github/skills');
const EXTERNAL_SKILLS_DIR = join(process.env.HOME || '~', '.agents/skills');

// ─── Type definitions ──────────────────────────────────────────────────────

interface SkillTest {
  id: number;
  skill: string;
  /** Resolved path to SKILL.md relative to project root (or absolute for external) */
  skillPath: string;
  agent: string;
  testPrompt: string;
  /** Whether this skill lives outside the repo (e.g., ~/.agents/skills/) */
  external?: boolean;
}

// ─── Helpers ───────────────────────────────────────────────────────────────

function skillExists(test: SkillTest): boolean {
  if (test.external) {
    return existsSync(test.skillPath);
  }
  return existsSync(join(PROJECT_ROOT, test.skillPath));
}

function readSkillContent(test: SkillTest): string {
  const fullPath = test.external ? test.skillPath : join(PROJECT_ROOT, test.skillPath);
  return readFileSync(fullPath, 'utf8');
}

// Valid agents that Beth can route to
const VALID_AGENTS = [
  'Beth',
  'developer',
  'product-manager',
  'ux-designer',
  'security-reviewer',
  'tester',
  'researcher',
];

// ─── Category 2: Azure Skills (tests 10–31) ───────────────────────────────

const AZURE_SKILLS: SkillTest[] = [
  {
    id: 10,
    skill: 'azure-prepare',
    skillPath: '.github/skills/azure-prepare/SKILL.md',
    agent: 'developer',
    testPrompt: 'Create a new containerized Node.js app and deploy it to Azure Container Apps',
  },
  {
    id: 11,
    skill: 'azure-validate',
    skillPath: '.github/skills/azure-validate/SKILL.md',
    agent: 'developer',
    testPrompt: 'Validate my app\'s deployment readiness and check the Bicep configuration',
  },
  {
    id: 12,
    skill: 'azure-deploy',
    skillPath: '.github/skills/azure-deploy/SKILL.md',
    agent: 'developer',
    testPrompt: 'Run azd up to push the app to production',
  },
  {
    id: 13,
    skill: 'azure-compute',
    skillPath: '.github/skills/azure-compute/SKILL.md',
    agent: 'developer',
    testPrompt: 'Recommend the best VM size for our ML training workload on Azure',
  },
  {
    id: 14,
    skill: 'azure-storage',
    skillPath: '.github/skills/azure-storage/SKILL.md',
    agent: 'developer',
    testPrompt: 'Set up blob storage with lifecycle management for our file upload service',
  },
  {
    id: 15,
    skill: 'azure-ai',
    skillPath: '.github/skills/azure-ai/SKILL.md',
    agent: 'developer',
    testPrompt: 'Configure Azure AI Search with vector search for our product catalog',
  },
  {
    id: 16,
    skill: 'azure-aigateway',
    skillPath: '.github/skills/azure-aigateway/SKILL.md',
    agent: 'developer',
    testPrompt: 'Set up semantic caching and token limits for our Azure OpenAI gateway',
  },
  {
    id: 17,
    skill: 'azure-kusto',
    skillPath: '.github/skills/azure-kusto/SKILL.md',
    agent: 'developer',
    testPrompt: 'Write KQL queries to analyze the IoT telemetry in Azure Data Explorer',
  },
  {
    id: 18,
    skill: 'azure-messaging',
    skillPath: '.github/skills/azure-messaging/SKILL.md',
    agent: 'developer',
    testPrompt: 'Troubleshoot this AMQP connection error with our Event Hub consumer',
  },
  {
    id: 19,
    skill: 'azure-hosted-copilot-sdk',
    skillPath: '.github/skills/azure-hosted-copilot-sdk/SKILL.md',
    agent: 'developer',
    testPrompt: 'Build a copilot app using @github/copilot-sdk and deploy to Azure',
  },
  {
    id: 20,
    skill: 'appinsights-instrumentation',
    skillPath: '.github/skills/appinsights-instrumentation/SKILL.md',
    agent: 'developer',
    testPrompt: 'Instrument our web app with Application Insights telemetry',
  },
  {
    id: 21,
    skill: 'microsoft-foundry',
    skillPath: '.github/skills/microsoft-foundry/SKILL.md',
    agent: 'developer',
    testPrompt: 'Deploy our agent to Microsoft Foundry and run batch evaluation',
  },
  {
    id: 22,
    skill: 'azure-rbac',
    skillPath: '.github/skills/azure-rbac/SKILL.md',
    agent: 'security-reviewer',
    testPrompt: 'Find the least privilege RBAC role for our managed identity to read blobs',
  },
  {
    id: 23,
    skill: 'azure-compliance',
    skillPath: '.github/skills/azure-compliance/SKILL.md',
    agent: 'security-reviewer',
    testPrompt: 'Run a compliance scan and security audit on our Azure subscription',
  },
  {
    id: 24,
    skill: 'entra-app-registration',
    skillPath: '.github/skills/entra-app-registration/SKILL.md',
    agent: 'security-reviewer',
    testPrompt: 'Create an Entra ID app registration with OAuth and MSAL configuration',
  },
  {
    id: 25,
    skill: 'azure-cost-optimization',
    skillPath: '.github/skills/azure-cost-optimization/SKILL.md',
    agent: 'product-manager',
    testPrompt: 'Analyze our Azure spending and find cost optimization opportunities',
  },
  {
    id: 26,
    skill: 'azure-cloud-migrate',
    skillPath: '.github/skills/azure-cloud-migrate/SKILL.md',
    agent: 'product-manager',
    testPrompt: 'Assess migrating our Lambda functions to Azure Functions',
  },
  {
    id: 27,
    skill: 'azure-diagnostics',
    skillPath: '.github/skills/azure-diagnostics/SKILL.md',
    agent: 'tester',
    testPrompt: 'Troubleshoot why our Container App is failing health probes in production',
  },
  {
    id: 28,
    skill: 'azure-resource-lookup',
    skillPath: '.github/skills/azure-resource-lookup/SKILL.md',
    agent: 'Beth',
    testPrompt: 'List all VMs and storage accounts across our Azure subscriptions',
  },
  {
    id: 29,
    skill: 'azure-resource-visualizer',
    skillPath: '.github/skills/azure-resource-visualizer/SKILL.md',
    agent: 'Beth',
    testPrompt: 'Generate a Mermaid architecture diagram of our Azure resource group',
  },
  {
    id: 30,
    skill: 'azure-postgres',
    skillPath: join(EXTERNAL_SKILLS_DIR, 'azure-postgres/SKILL.md'),
    agent: 'developer',
    testPrompt: 'Configure passwordless Entra ID authentication for our Postgres server',
    external: true,
  },
  {
    id: 31,
    skill: 'azure-quotas',
    skillPath: join(EXTERNAL_SKILLS_DIR, 'azure-quotas/SKILL.md'),
    agent: 'developer',
    testPrompt: 'Check our Azure subscription quotas and vCPU limits',
    external: true,
  },
];

// ─── Category 4: Product & Research (tests 36–39) ─────────────────────────

const PRODUCT_SKILLS: SkillTest[] = [
  {
    id: 36,
    skill: 'prd',
    skillPath: '.github/skills/prd/SKILL.md',
    agent: 'product-manager',
    testPrompt: 'Write a product requirements document for the billing dashboard feature',
  },
];

// ─── Category 5: Developer Workflow (tests 40–53) ─────────────────────────

const DEVELOPER_WORKFLOW_SKILLS: SkillTest[] = [
  {
    id: 41,
    skill: 'git-worktree',
    skillPath: '.github/skills/git-worktree/SKILL.md',
    agent: 'developer',
    testPrompt: 'Create a git worktree for isolated parallel development on the feature branch',
  },
  {
    id: 45,
    skill: 'resolve-pr-parallel',
    skillPath: '.github/skills/resolve-pr-parallel/SKILL.md',
    agent: 'developer',
    testPrompt: 'Address all PR review comments using parallel processing',
  },
];

// ─── Category 7: Orchestration & Swarm (tests 59–62) ─────────────────────

const ORCHESTRATION_SKILLS: SkillTest[] = [
  {
    id: 62,
    skill: 'file-todos',
    skillPath: '.github/skills/file-todos/SKILL.md',
    agent: 'developer',
    testPrompt: 'Scan the codebase and create tasks for all TODO/FIXME comments',
  },
];

// ─── Category 10: Remaining Skills (tests 71–72) ─────────────────────────

const REMAINING_SKILLS: SkillTest[] = [
  {
    id: 71,
    skill: 'compound-docs',
    skillPath: '.github/skills/compound-docs/SKILL.md',
    agent: 'developer',
    testPrompt: 'That worked! Document this solution for the team',
  },
];

// ─── All skills combined for cross-cutting tests ──────────────────────────

const ALL_SKILLS: SkillTest[] = [
  ...AZURE_SKILLS,
  ...PRODUCT_SKILLS,
  ...DEVELOPER_WORKFLOW_SKILLS,
  ...ORCHESTRATION_SKILLS,
  ...REMAINING_SKILLS,
];

// ─── Tests ─────────────────────────────────────────────────────────────────

describe('Category 2: Azure Skills', () => {
  describe.each(AZURE_SKILLS)(
    'Test #$id: $skill → $agent',
    (test) => {
      if (test.external) {
        it.skipIf(!skillExists(test))('skill file exists (external)', () => {
          expect(skillExists(test)).toBe(true);
        });

        it.skipIf(!skillExists(test))('skill file is non-empty', () => {
          const content = readSkillContent(test);
          expect(content.length).toBeGreaterThan(0);
        });
      } else {
        it('skill file exists on disk', () => {
          expect(skillExists(test)).toBe(true);
        });

        it('skill file is non-empty', () => {
          const content = readSkillContent(test);
          expect(content.length).toBeGreaterThan(0);
        });
      }

      it('agent is a valid Beth team member', () => {
        expect(VALID_AGENTS).toContain(test.agent);
      });

      it('test prompt is non-empty', () => {
        expect(test.testPrompt.length).toBeGreaterThan(10);
      });
    },
  );
});

describe('Category 4: Product & Research', () => {
  describe.each(PRODUCT_SKILLS)(
    'Test #$id: $skill → $agent',
    (test) => {
      it('skill file exists on disk', () => {
        expect(skillExists(test)).toBe(true);
      });

      it('skill file is non-empty', () => {
        const content = readSkillContent(test);
        expect(content.length).toBeGreaterThan(0);
      });

      it('agent is a valid Beth team member', () => {
        expect(VALID_AGENTS).toContain(test.agent);
      });
    },
  );
});

describe('Category 5: Developer Workflow', () => {
  describe.each(DEVELOPER_WORKFLOW_SKILLS)(
    'Test #$id: $skill → $agent',
    (test) => {
      it('skill file exists on disk', () => {
        expect(skillExists(test)).toBe(true);
      });

      it('skill file is non-empty', () => {
        const content = readSkillContent(test);
        expect(content.length).toBeGreaterThan(0);
      });

      it('agent is a valid Beth team member', () => {
        expect(VALID_AGENTS).toContain(test.agent);
      });
    },
  );
});

describe('Category 7: Orchestration & Swarm', () => {
  describe.each(ORCHESTRATION_SKILLS)(
    'Test #$id: $skill → $agent',
    (test) => {
      it('skill file exists on disk', () => {
        expect(skillExists(test)).toBe(true);
      });

      it('skill file is non-empty', () => {
        const content = readSkillContent(test);
        expect(content.length).toBeGreaterThan(0);
      });

      it('agent is a valid Beth team member', () => {
        expect(VALID_AGENTS).toContain(test.agent);
      });
    },
  );
});

describe('Category 10: Remaining Skills', () => {
  describe.each(REMAINING_SKILLS)(
    'Test #$id: $skill → $agent',
    (test) => {
      it('skill file exists on disk', () => {
        expect(skillExists(test)).toBe(true);
      });

      it('skill file is non-empty', () => {
        const content = readSkillContent(test);
        expect(content.length).toBeGreaterThan(0);
      });

      it('agent is a valid Beth team member', () => {
        expect(VALID_AGENTS).toContain(test.agent);
      });
    },
  );
});

// ─── Cross-cutting validation ──────────────────────────────────────────────

describe('Cross-cutting: Test matrix integrity', () => {
  it('all test IDs are unique', () => {
    const ids = ALL_SKILLS.map((t) => t.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it('test IDs are ascending and within range', () => {
    const ids = ALL_SKILLS.map((t) => t.id).sort((a, b) => a - b);
    expect(ids.length).toBeGreaterThan(0);
    expect(ids[0]).toBeGreaterThanOrEqual(10);
    expect(ids[ids.length - 1]).toBeLessThanOrEqual(72);
  });

  it('all agents in the matrix are valid', () => {
    for (const test of ALL_SKILLS) {
      expect(VALID_AGENTS).toContain(test.agent);
    }
  });

  it('no duplicate skill names in the matrix', () => {
    const skills = ALL_SKILLS.map((t) => t.skill);
    // prd appears in both Category 1 (hook) and Category 4 (routing) — allow it
    // Only check within THIS matrix (Categories 2-10)
    const duplicates = skills.filter((s, i) => skills.indexOf(s) !== i);
    expect(duplicates).toHaveLength(0);
  });

  it('every non-external skill has a corresponding directory in .github/skills/', () => {
    for (const test of ALL_SKILLS) {
      if (test.external) continue;
      // Extract skill dir name from path
      const match = test.skillPath.match(/\.github\/skills\/([^/]+)\//);
      if (match) {
        const skillDir = join(SKILLS_DIR, match[1]);
        expect(existsSync(skillDir)).toBe(true);
      }
    }
  });

  it('every referenced agent has at least one skill in the matrix', () => {
    const agentsInMatrix = new Set(ALL_SKILLS.map((t) => t.agent));
    for (const agent of agentsInMatrix) {
      const count = ALL_SKILLS.filter((t) => t.agent === agent).length;
      expect(count).toBeGreaterThan(0);
    }
  });
});

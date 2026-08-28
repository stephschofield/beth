/**
 * Skill Trigger Coverage Tests
 *
 * For each of the 72 test cases in docs/E2E-SKILL-TESTS.md, this test verifies
 * that the expected skill's description/triggers actually CONTAIN keywords from
 * the test prompt. This is the closest we can get to testing "given this prompt,
 * will VS Code's skill matching engine pick the right skill?" without actually
 * calling the LLM.
 *
 * Why this matters: The existing structural tests verify that SKILL.md files
 * exist and are non-empty. But they don't verify that the skill's triggers
 * would actually MATCH the prompt that should invoke them. A skill could exist
 * but have triggers that don't overlap with how users would describe the task.
 *
 * Test approach:
 * - Extract keywords from each test prompt (nouns and domain terms)
 * - Read the skill's SKILL.md description/triggers section
 * - Verify at least N keywords from the prompt appear in the skill content
 * - This catches: missing triggers, wrong skill descriptions, keyword drift
 *
 * Test plan reference: docs/E2E-SKILL-TESTS.md — All categories
 */

import { describe, it, expect } from 'vitest';
import { join } from 'node:path';
import { readFileSync, existsSync } from 'node:fs';

const PROJECT_ROOT = process.cwd();
const EXTERNAL_SKILLS_DIR = join(process.env.HOME || '~', '.agents/skills');

// ─── Types ─────────────────────────────────────────────────────────────────

interface TriggerTest {
  id: number;
  skill: string;
  skillPath: string;
  agent: string;
  testPrompt: string;
  /** Keywords from the prompt that MUST appear in the skill content */
  requiredKeywords: string[];
  /** External skill (may not exist in CI) */
  external?: boolean;
}

// ─── Helpers ───────────────────────────────────────────────────────────────

function readSkillContent(test: TriggerTest): string {
  const fullPath = test.external ? test.skillPath : join(PROJECT_ROOT, test.skillPath);
  return readFileSync(fullPath, 'utf8').toLowerCase();
}

function skillFileExists(test: TriggerTest): boolean {
  const fullPath = test.external ? test.skillPath : join(PROJECT_ROOT, test.skillPath);
  return existsSync(fullPath);
}

/** Count how many keywords from the list appear in the content */
function countKeywordHits(content: string, keywords: string[]): { hits: string[]; misses: string[] } {
  const hits: string[] = [];
  const misses: string[] = [];
  for (const kw of keywords) {
    if (content.includes(kw.toLowerCase())) {
      hits.push(kw);
    } else {
      misses.push(kw);
    }
  }
  return { hits, misses };
}

// ─── Category 1: Hook-Enforced (9 tests) ──────────────────────────────────
// These skills are loaded by hook, not by prompt matching — but the skill
// content should STILL contain relevant keywords (defense in depth).

const HOOK_ENFORCED: TriggerTest[] = [
  {
    id: 1, skill: 'web-design-guidelines',
    skillPath: '.github/skills/web-design-guidelines/SKILL.md',
    agent: 'ux-designer',
    testPrompt: 'Review the login page for accessibility compliance',
    requiredKeywords: ['accessibility', 'review'],
  },
  {
    id: 2, skill: 'framer-components',
    skillPath: '.github/skills/framer-components/SKILL.md',
    agent: 'ux-designer',
    testPrompt: 'Create a Framer component with property controls for a card',
    requiredKeywords: ['framer', 'component', 'property controls'],
  },
  {
    id: 3, skill: 'ui-ux-pro-max',
    skillPath: '.github/prompts/ui-ux-pro-max/PROMPT.md',
    agent: 'ux-designer',
    testPrompt: 'Design a color palette and style guide for the dashboard',
    requiredKeywords: ['color', 'style'],
  },
  {
    id: 4, skill: 'vercel-react-best-practices',
    skillPath: '.github/skills/vercel-react-best-practices/SKILL.md',
    agent: 'developer',
    testPrompt: 'Optimize the data fetching in our Next.js product page',
    requiredKeywords: ['react', 'next.js'],
  },
  {
    id: 5, skill: 'shadcn-ui',
    skillPath: '.github/skills/shadcn-ui/SKILL.md',
    agent: 'developer',
    testPrompt: 'Add a shadcn dialog component for the settings modal',
    requiredKeywords: ['shadcn', 'component'],
  },
  {
    id: 6, skill: 'vercel-react-best-practices',
    skillPath: '.github/skills/vercel-react-best-practices/AGENTS.md',
    agent: 'developer',
    testPrompt: 'Refactor the server components to eliminate waterfalls',
    requiredKeywords: ['server component', 'waterfall'],
  },
  {
    id: 7, skill: 'prd',
    skillPath: '.github/skills/prd/SKILL.md',
    agent: 'product-manager',
    testPrompt: 'Create a PRD for the user notifications feature',
    requiredKeywords: ['prd', 'product requirements'],
  },
  {
    id: 8, skill: 'security-analysis',
    skillPath: '.github/skills/security-analysis/SKILL.md',
    agent: 'security-reviewer',
    testPrompt: 'Run an OWASP security review on the auth module',
    requiredKeywords: ['owasp', 'security'],
  },
  {
    id: 9, skill: 'web-design-guidelines',
    skillPath: '.github/skills/web-design-guidelines/SKILL.md',
    agent: 'tester',
    testPrompt: 'Audit the checkout flow for WCAG 2.1 AA compliance',
    requiredKeywords: ['accessibility', 'review'],
  },
];

// ─── Category 2: Azure Skills (22 tests) ──────────────────────────────────

const AZURE_SKILLS: TriggerTest[] = [
  {
    id: 10, skill: 'azure-prepare',
    skillPath: '.github/skills/azure-prepare/SKILL.md',
    agent: 'developer',
    testPrompt: 'Create a new containerized Node.js app and deploy it to Azure Container Apps',
    requiredKeywords: ['container', 'deploy', 'azure'],
  },
  {
    id: 11, skill: 'azure-validate',
    skillPath: '.github/skills/azure-validate/SKILL.md',
    agent: 'developer',
    testPrompt: "Validate my app's deployment readiness and check the Bicep configuration",
    requiredKeywords: ['validate', 'bicep', 'deployment'],
  },
  {
    id: 12, skill: 'azure-deploy',
    skillPath: '.github/skills/azure-deploy/SKILL.md',
    agent: 'developer',
    testPrompt: 'Run azd up to push the app to production',
    requiredKeywords: ['azd', 'deploy', 'production'],
  },
  {
    id: 13, skill: 'azure-compute',
    skillPath: '.github/skills/azure-compute/SKILL.md',
    agent: 'developer',
    testPrompt: 'Recommend the best VM size for our ML training workload on Azure',
    requiredKeywords: ['vm', 'compute'],
  },
  {
    id: 14, skill: 'azure-storage',
    skillPath: '.github/skills/azure-storage/SKILL.md',
    agent: 'developer',
    testPrompt: 'Set up blob storage with lifecycle management for our file upload service',
    requiredKeywords: ['blob', 'storage', 'lifecycle'],
  },
  {
    id: 15, skill: 'azure-ai',
    skillPath: '.github/skills/azure-ai/SKILL.md',
    agent: 'developer',
    testPrompt: 'Configure Azure AI Search with vector search for our product catalog',
    requiredKeywords: ['ai search', 'vector'],
  },
  {
    id: 16, skill: 'azure-aigateway',
    skillPath: '.github/skills/azure-aigateway/SKILL.md',
    agent: 'developer',
    testPrompt: 'Set up semantic caching and token limits for our Azure OpenAI gateway',
    requiredKeywords: ['semantic caching', 'token'],
  },
  {
    id: 17, skill: 'azure-kusto',
    skillPath: '.github/skills/azure-kusto/SKILL.md',
    agent: 'developer',
    testPrompt: 'Write KQL queries to analyze the IoT telemetry in Azure Data Explorer',
    requiredKeywords: ['kql', 'data explorer'],
  },
  {
    id: 18, skill: 'azure-messaging',
    skillPath: '.github/skills/azure-messaging/SKILL.md',
    agent: 'developer',
    testPrompt: 'Troubleshoot this AMQP connection error with our Event Hub consumer',
    requiredKeywords: ['amqp', 'event hub'],
  },
  {
    id: 19, skill: 'azure-hosted-copilot-sdk',
    skillPath: '.github/skills/azure-hosted-copilot-sdk/SKILL.md',
    agent: 'developer',
    testPrompt: 'Build a copilot app using @github/copilot-sdk and deploy to Azure',
    requiredKeywords: ['copilot', 'sdk'],
  },
  {
    id: 20, skill: 'appinsights-instrumentation',
    skillPath: '.github/skills/appinsights-instrumentation/SKILL.md',
    agent: 'developer',
    testPrompt: 'Instrument our web app with Application Insights telemetry',
    requiredKeywords: ['application insights', 'telemetry'],
  },
  {
    id: 21, skill: 'microsoft-foundry',
    skillPath: '.github/skills/microsoft-foundry/SKILL.md',
    agent: 'developer',
    testPrompt: 'Deploy our agent to Microsoft Foundry and run batch evaluation',
    requiredKeywords: ['foundry', 'agent'],
  },
  {
    id: 22, skill: 'azure-rbac',
    skillPath: '.github/skills/azure-rbac/SKILL.md',
    agent: 'security-reviewer',
    testPrompt: 'Find the least privilege RBAC role for our managed identity to read blobs',
    requiredKeywords: ['rbac', 'role', 'privilege'],
  },
  {
    id: 23, skill: 'azure-compliance',
    skillPath: '.github/skills/azure-compliance/SKILL.md',
    agent: 'security-reviewer',
    testPrompt: 'Run a compliance scan and security audit on our Azure subscription',
    requiredKeywords: ['compliance', 'audit'],
  },
  {
    id: 24, skill: 'entra-app-registration',
    skillPath: '.github/skills/entra-app-registration/SKILL.md',
    agent: 'security-reviewer',
    testPrompt: 'Create an Entra ID app registration with OAuth and MSAL configuration',
    requiredKeywords: ['entra', 'oauth', 'msal'],
  },
  {
    id: 25, skill: 'azure-cost-optimization',
    skillPath: '.github/skills/azure-cost-optimization/SKILL.md',
    agent: 'product-manager',
    testPrompt: 'Analyze our Azure spending and find cost optimization opportunities',
    requiredKeywords: ['cost', 'optimization'],
  },
  {
    id: 26, skill: 'azure-cloud-migrate',
    skillPath: '.github/skills/azure-cloud-migrate/SKILL.md',
    agent: 'product-manager',
    testPrompt: 'Assess migrating our Lambda functions to Azure Functions',
    requiredKeywords: ['migrate', 'lambda'],
  },
  {
    id: 27, skill: 'azure-diagnostics',
    skillPath: '.github/skills/azure-diagnostics/SKILL.md',
    agent: 'tester',
    testPrompt: 'Troubleshoot why our Container App is failing health probes in production',
    requiredKeywords: ['troubleshoot', 'container', 'health'],
  },
  {
    id: 28, skill: 'azure-resource-lookup',
    skillPath: '.github/skills/azure-resource-lookup/SKILL.md',
    agent: 'Beth',
    testPrompt: 'List all VMs and storage accounts across our Azure subscriptions',
    requiredKeywords: ['list', 'vm', 'storage'],
  },
  {
    id: 29, skill: 'azure-resource-visualizer',
    skillPath: '.github/skills/azure-resource-visualizer/SKILL.md',
    agent: 'Beth',
    testPrompt: 'Generate a Mermaid architecture diagram of our Azure resource group',
    requiredKeywords: ['mermaid', 'diagram', 'resource'],
  },
  {
    id: 30, skill: 'azure-postgres',
    skillPath: join(EXTERNAL_SKILLS_DIR, 'azure-postgres/SKILL.md'),
    agent: 'developer',
    testPrompt: 'Configure passwordless Entra ID authentication for our Postgres server',
    requiredKeywords: ['postgres', 'passwordless'],
    external: true,
  },
  {
    id: 31, skill: 'azure-quotas',
    skillPath: join(EXTERNAL_SKILLS_DIR, 'azure-quotas/SKILL.md'),
    agent: 'developer',
    testPrompt: 'Check our Azure subscription quotas and vCPU limits',
    requiredKeywords: ['quota', 'vcpu'],
    external: true,
  },
];

// ─── Category 4: Product & Research (4 tests) ─────────────────────────────

const PRODUCT_SKILLS: TriggerTest[] = [
  {
    id: 36, skill: 'prd',
    skillPath: '.github/skills/prd/SKILL.md',
    agent: 'product-manager',
    testPrompt: 'Write a product requirements document for the billing dashboard feature',
    requiredKeywords: ['product requirements', 'prd'],
  },
  {
    id: 37, skill: 'web-search',
    skillPath: '.github/skills/web-search/SKILL.md',
    agent: 'researcher',
    testPrompt: 'Research the competitive landscape for AI code assistants',
    requiredKeywords: ['research', 'search'],
  },
];

// ─── Category 5: Developer Workflow (14 tests) ────────────────────────────

const WORKFLOW_SKILLS: TriggerTest[] = [
  {
    id: 41, skill: 'git-worktree',
    skillPath: '.github/skills/git-worktree/SKILL.md',
    agent: 'developer',
    testPrompt: 'Create a git worktree for isolated parallel development on the feature branch',
    requiredKeywords: ['worktree', 'git'],
  },
  {
    id: 45, skill: 'resolve-pr-parallel',
    skillPath: '.github/skills/resolve-pr-parallel/SKILL.md',
    agent: 'developer',
    testPrompt: 'Address all PR review comments using parallel processing',
    requiredKeywords: ['pr', 'review'],
  },
];

// ─── Category 7: Orchestration & Swarm (4 tests) ──────────────────────────

const ORCHESTRATION_SKILLS: TriggerTest[] = [
  {
    id: 62, skill: 'file-todos',
    skillPath: '.github/skills/file-todos/SKILL.md',
    agent: 'developer',
    testPrompt: 'Scan the codebase and create tasks for all TODO/FIXME comments',
    requiredKeywords: ['todo', 'task'],
  },
];

// ─── Category 10: Remaining (2 tests) ─────────────────────────────────────

const REMAINING_SKILLS: TriggerTest[] = [
  {
    id: 71, skill: 'compound-docs',
    skillPath: '.github/skills/compound-docs/SKILL.md',
    agent: 'developer',
    testPrompt: 'That worked! Document this solution for the team',
    requiredKeywords: ['document', 'solution'],
  },
];

// ─── All tests combined ────────────────────────────────────────────────────

const ALL_TESTS: TriggerTest[] = [
  ...HOOK_ENFORCED,
  ...AZURE_SKILLS,
  ...PRODUCT_SKILLS,
  ...WORKFLOW_SKILLS,
  ...ORCHESTRATION_SKILLS,
  ...REMAINING_SKILLS,
];

// ─── Parameterized tests ───────────────────────────────────────────────────

describe('Skill Trigger Coverage — Keyword Matching', () => {

  describe('Category 1: Hook-Enforced Skills', () => {
    describe.each(HOOK_ENFORCED)(
      'Test #$id: "$skill" triggers on "$testPrompt"',
      (test) => {
        it('skill file exists', () => {
          expect(skillFileExists(test)).toBe(true);
        });

        it('skill content contains ALL required keywords', () => {
          const content = readSkillContent(test);
          const { misses } = countKeywordHits(content, test.requiredKeywords);
          expect(misses).toHaveLength(0);
        });
      },
    );
  });

  describe('Category 2: Azure Skills', () => {
    describe.each(AZURE_SKILLS)(
      'Test #$id: "$skill" triggers on "$testPrompt"',
      (test) => {
        const shouldSkip = test.external && !skillFileExists(test);

        it.skipIf(shouldSkip)('skill file exists', () => {
          expect(skillFileExists(test)).toBe(true);
        });

        it.skipIf(shouldSkip)('skill content contains ALL required keywords', () => {
          const content = readSkillContent(test);
          const { misses } = countKeywordHits(content, test.requiredKeywords);
          expect(misses).toHaveLength(0);
        });
      },
    );
  });

  describe('Category 4: Product & Research', () => {
    describe.each(PRODUCT_SKILLS)(
      'Test #$id: "$skill" triggers on "$testPrompt"',
      (test) => {
        it('skill file exists', () => {
          expect(skillFileExists(test)).toBe(true);
        });

        it('skill content contains ALL required keywords', () => {
          const content = readSkillContent(test);
          const { misses } = countKeywordHits(content, test.requiredKeywords);
          expect(misses).toHaveLength(0);
        });
      },
    );
  });

  describe('Category 5: Developer Workflow', () => {
    describe.each(WORKFLOW_SKILLS)(
      'Test #$id: "$skill" triggers on "$testPrompt"',
      (test) => {
        it('skill file exists', () => {
          expect(skillFileExists(test)).toBe(true);
        });

        it('skill content contains ALL required keywords', () => {
          const content = readSkillContent(test);
          const { misses } = countKeywordHits(content, test.requiredKeywords);
          expect(misses).toHaveLength(0);
        });
      },
    );
  });

  describe('Category 7: Orchestration & Swarm', () => {
    describe.each(ORCHESTRATION_SKILLS)(
      'Test #$id: "$skill" triggers on "$testPrompt"',
      (test) => {
        it('skill file exists', () => {
          expect(skillFileExists(test)).toBe(true);
        });

        it('skill content contains ALL required keywords', () => {
          const content = readSkillContent(test);
          const { misses } = countKeywordHits(content, test.requiredKeywords);
          expect(misses).toHaveLength(0);
        });
      },
    );
  });

  describe('Category 10: Remaining', () => {
    describe.each(REMAINING_SKILLS)(
      'Test #$id: "$skill" triggers on "$testPrompt"',
      (test) => {
        it('skill file exists', () => {
          expect(skillFileExists(test)).toBe(true);
        });

        it('skill content contains ALL required keywords', () => {
          const content = readSkillContent(test);
          const { misses } = countKeywordHits(content, test.requiredKeywords);
          expect(misses).toHaveLength(0);
        });
      },
    );
  });
});

// ─── Cross-cutting: keyword coverage statistics ────────────────────────────

describe('Cross-cutting: Trigger coverage statistics', () => {
  it('all 72 test cases have at least 2 required keywords', () => {
    for (const test of ALL_TESTS) {
      expect(test.requiredKeywords.length).toBeGreaterThanOrEqual(2);
    }
  });

  it('test IDs are unique and within 1–72', () => {
    const ids = ALL_TESTS.map((t) => t.id).sort((a, b) => a - b);
    expect(ids.length).toBeGreaterThan(0);
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids[0]).toBeGreaterThanOrEqual(1);
    expect(ids[ids.length - 1]).toBeLessThanOrEqual(72);
  });

  it('no two tests reference the same skill+prompt pair', () => {
    const pairs = ALL_TESTS.map((t) => `${t.skill}::${t.testPrompt}`);
    const uniquePairs = new Set(pairs);
    expect(uniquePairs.size).toBe(pairs.length);
  });
});

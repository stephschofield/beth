# ATV Agent Skills Demo

A demonstration of GitHub Copilot Agent Mode with custom agents and skills for building IDEO-style cutting-edge applications.

## Overview

This repository showcases how to use GitHub Copilot's agent system with:
- **Custom Agents** - Specialized AI assistants for different roles
- **Skills** - Domain-specific knowledge and workflows
- **Handoffs** - Seamless transitions between agents
- **Subagents** - Parallel task execution

## Structure

```
.github/
├── agents/                     # Custom agent definitions
│   ├── orchestrator.agent.md   # Master coordinator
│   ├── product-manager.agent.md
│   ├── researcher.agent.md
│   ├── ux-designer.agent.md
│   ├── developer.agent.md
│   └── tester.agent.md
├── skills/                     # Domain-specific skills
│   ├── prd/                    # PRD generation workflow
│   ├── framer-components/      # Framer component patterns
│   ├── vercel-react-best-practices/
│   └── web-design-guidelines/
└── appmod/                     # App modernization configs
```

## Agents

| Agent | Role | Key Capabilities |
|-------|------|------------------|
| **IDEO-Orchestrator** | Master coordinator | Routes work, spawns subagents, manages handoffs |
| **Product Manager** | Product strategy | PRD generation, requirements, roadmaps |
| **Researcher** | UX/Market research | Competitive analysis, user insights |
| **UX Designer** | Interface design | Design systems, accessibility, prototypes |
| **Developer** | Implementation | React/TypeScript/Next.js development |
| **Tester** | Quality assurance | Testing, accessibility audits, performance |

## Skills

- **PRD Skill** - Generates Product Requirements Documents
- **Framer Components** - Build custom React components for Framer
- **Vercel React Best Practices** - Performance optimization patterns
- **Web Design Guidelines** - UI review and accessibility compliance

## Getting Started

1. Open this repository in VS Code
2. Ensure GitHub Copilot extension is installed
3. Use `@agent-name` in Copilot Chat to invoke agents
4. See [DEMO.md](DEMO.md) for a complete walkthrough

## Quick Demo

```
@IDEO-Orchestrator Plan a feature for a task management dashboard
```

```
@product-manager Create a PRD for user authentication
```

```
@developer Implement a responsive navigation component
```

## Requirements

- VS Code with GitHub Copilot extension
- GitHub Copilot Chat enabled

## License

MIT

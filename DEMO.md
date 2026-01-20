# IDEO Agents Demo: Building a Task Management Dashboard

This guide walks through a complete demonstration of the IDEO agent system, showing how agents, subagents, handoffs, and skills work together to build a feature from concept to implementation.

## Prerequisites

Ensure you have:
- VS Code with GitHub Copilot extension
- The `.github/agents/` folder with all 6 agent files
- The `.github/skills/` folder with PRD and Framer skills

## Demo Overview

**Use Case**: Build a Task Management Dashboard with:
- Task list with drag-and-drop
- Priority tagging
- Due date calendar view
- Real-time collaboration

**Agents Involved**:
1. **IDEO-Orchestrator** → Coordinates the workflow
2. **Product Manager** → Defines requirements (uses PRD skill)
3. **Researcher** → Validates user needs
4. **UX Designer** → Designs the interface
5. **Developer** → Implements in React/Next.js
6. **Tester** → Ensures quality

---

## Step-by-Step Demo Workflow

### Phase 1: Project Kickoff with Orchestrator

**Open Copilot Chat and select `@IDEO-Orchestrator`**

```
User: I want to build a task management dashboard for our team. 
      It should have task lists, priorities, due dates, and real-time updates.
      Help me coordinate the team to build this.
```

**Expected Orchestrator Response**:
- Analyzes the request
- Identifies which disciplines are needed
- Proposes a workflow sequence
- Shows handoff buttons

**Handoff buttons will appear**:
```
[Product Strategy] [User Research] [UX Design] [Development] [Quality Assurance]
```

---

### Phase 2: Product Requirements (PRD Skill Demo)

**Click the `[Product Strategy]` handoff button**

This switches to `@product-manager` with context.

```
User: Create a PRD for the task management dashboard feature.
```

**Expected PM Response**:
- Loads the PRD skill from `.github/skills/prd/SKILL.md`
- Asks clarifying questions (or uses defaults)
- Generates a complete PRD document

**Sample PRD Output**:
```markdown
# Product Requirements Document: Task Management Dashboard

## Overview
A collaborative task management interface enabling teams to organize, 
prioritize, and track work in real-time.

## User Personas
- **Project Manager**: Needs visibility across all team tasks
- **Team Member**: Needs to manage personal task queue
- **Stakeholder**: Needs high-level progress view

## Requirements

### Functional Requirements
1. **Task CRUD**: Create, read, update, delete tasks
2. **Drag-and-Drop**: Reorder tasks between columns
3. **Priority Levels**: Critical, High, Medium, Low
4. **Due Dates**: Calendar picker with reminders
5. **Real-time Sync**: WebSocket updates across users

### Non-Functional Requirements
- LCP < 2.5s
- Offline-capable with sync
- WCAG 2.1 AA accessible

## Success Metrics
- Task completion rate increase by 20%
- Time-to-find-task reduced by 50%
```

**Handoff buttons appear**:
```
[User Research] [Design Handoff] [Technical Feasibility]
```

---

### Phase 3: User Research Validation

**Click `[User Research]` handoff button**

Switches to `@researcher` with PRD context.

```
User: Validate these requirements with competitive analysis and user needs research.
```

**Expected Researcher Response**:
- Conducts competitive analysis (Asana, Trello, Linear, Monday)
- Identifies user pain points
- Validates/challenges PRD assumptions
- Returns insights

**Sample Research Output**:
```markdown
## Competitive Analysis: Task Management

| Feature | Our Plan | Asana | Trello | Linear |
|---------|----------|-------|--------|--------|
| Drag-drop | ✅ | ✅ | ✅ | ✅ |
| Real-time | ✅ | ✅ | ❌ | ✅ |
| Keyboard nav | ❓ | ⭐⭐⭐ | ⭐ | ⭐⭐⭐⭐ |
| Offline | ✅ | ❌ | ❌ | ❌ |

## Key Insights
1. **Keyboard shortcuts are differentiator** - Linear users cite this as top reason for switching
2. **Offline is unique** - No major competitor has robust offline
3. **Risk: Real-time complexity** - WebSocket infrastructure significant

## Recommendations
- Add keyboard shortcuts to PRD (high impact, low effort)
- Validate offline requirement with users (high effort)
```

**Handoff buttons**:
```
[Product Synthesis] [Design Implications]
```

---

### Phase 4: UX Design

**Click `[Design Implications]` or return to orchestrator and click `[UX Design]`**

Switches to `@ux-designer` with research context.

```
User: Design the task board interface with drag-and-drop columns and priority indicators.
```

**Expected UX Designer Response**:
- Creates component specifications
- Defines interaction patterns
- Specifies accessibility requirements
- Uses design tokens

**Sample Design Output**:
```markdown
## Component: TaskCard

### Anatomy
┌─────────────────────────────────────┐
│ ● Priority  │  Task Title          │
│ [tag] [tag] │  Due: Jan 25         │
│             │  Assignee: @avatar   │
└─────────────────────────────────────┘

### States
- **Default**: White background
- **Hover**: Subtle shadow elevation
- **Dragging**: Opacity 0.8, rotate 2deg
- **Drop Target**: Blue border highlight

### Accessibility
- Role: `listitem` within `list`
- Draggable via keyboard: Space to grab, arrows to move
- Focus: 2px blue outline
- Screen reader: "Task: [title], Priority: [level], Due: [date]"

### React Interface
```typescript
interface TaskCardProps {
  id: string;
  title: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  dueDate?: Date;
  assignee?: User;
  tags?: string[];
  onDragStart?: () => void;
  onDragEnd?: () => void;
}
```

**Handoff buttons**:
```
[Development Handoff] [Usability Validation] [Product Alignment]
```

---

### Phase 5: Implementation

**Click `[Development Handoff]`**

Switches to `@developer` with design specs.

```
User: Implement the TaskCard component and the drag-and-drop board.
```

**Expected Developer Response**:
- Implements React component
- Uses TypeScript strictly
- Follows Next.js patterns
- Includes accessibility

**Sample Implementation**:
```typescript
// components/TaskCard/TaskCard.tsx
'use client';

import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { cva } from 'class-variance-authority';

const priorityStyles = cva('rounded-full w-2 h-2', {
  variants: {
    priority: {
      critical: 'bg-red-500',
      high: 'bg-orange-500',
      medium: 'bg-yellow-500',
      low: 'bg-green-500',
    },
  },
});

interface TaskCardProps {
  id: string;
  title: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  dueDate?: Date;
  assignee?: { name: string; avatar: string };
}

export function TaskCard({ id, title, priority, dueDate, assignee }: TaskCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    opacity: isDragging ? 0.8 : 1,
    rotate: isDragging ? '2deg' : '0deg',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      role="listitem"
      aria-label={`Task: ${title}, Priority: ${priority}${dueDate ? `, Due: ${dueDate.toLocaleDateString()}` : ''}`}
      className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow focus:outline-none focus:ring-2 focus:ring-blue-500"
    >
      <div className="flex items-center gap-2 mb-2">
        <span className={priorityStyles({ priority })} aria-hidden />
        <span className="font-medium">{title}</span>
      </div>
      {dueDate && (
        <p className="text-sm text-gray-500">
          Due: {dueDate.toLocaleDateString()}
        </p>
      )}
      {assignee && (
        <div className="flex items-center gap-2 mt-2">
          <img src={assignee.avatar} alt="" className="w-6 h-6 rounded-full" />
          <span className="text-sm">{assignee.name}</span>
        </div>
      )}
    </div>
  );
}
```

**Handoff buttons**:
```
[Quality Assurance] [Design Review] [Technical Feasibility]
```

---

### Phase 6: Testing & QA

**Click `[Quality Assurance]`**

Switches to `@tester` with implementation details.

```
User: Test the TaskCard component for functionality, accessibility, and performance.
```

**Expected Tester Response**:
- Writes unit tests
- Performs accessibility audit
- Checks performance impact
- Documents findings

**Sample Test Output**:
```typescript
// components/TaskCard/TaskCard.test.tsx
import { render, screen } from '@testing-library/react';
import { axe } from 'jest-axe';
import { TaskCard } from './TaskCard';

describe('TaskCard', () => {
  const defaultProps = {
    id: '1',
    title: 'Complete documentation',
    priority: 'high' as const,
  };

  it('renders task title', () => {
    render(<TaskCard {...defaultProps} />);
    expect(screen.getByText('Complete documentation')).toBeInTheDocument();
  });

  it('has correct aria-label for screen readers', () => {
    render(<TaskCard {...defaultProps} />);
    expect(screen.getByRole('listitem')).toHaveAttribute(
      'aria-label',
      expect.stringContaining('Task: Complete documentation')
    );
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<TaskCard {...defaultProps} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('shows due date when provided', () => {
    render(<TaskCard {...defaultProps} dueDate={new Date('2026-01-25')} />);
    expect(screen.getByText(/Due:/)).toBeInTheDocument();
  });
});
```

**Test Report**:
```markdown
## Test Report: TaskCard Component

### Summary
| Category | Status |
|----------|--------|
| Functional | ✅ Pass (5/5 tests) |
| Accessibility | ✅ Pass (0 violations) |
| Performance | ✅ Pass (< 1ms render) |

### Accessibility Checklist
- [x] Keyboard accessible
- [x] Screen reader labels
- [x] Focus visible
- [x] Color contrast OK

### Recommendation
✅ Ready for release
```

---

## Subagent Demo: Parallel Research

The orchestrator can run subagents in parallel for efficiency.

**In `@IDEO-Orchestrator`**:

```
User: I need quick research on drag-and-drop libraries AND accessibility patterns for task boards. Run both in parallel.
```

**Orchestrator uses subagents**:
```typescript
// Internally, the orchestrator does:
const [dndResearch, a11yResearch] = await Promise.all([
  runSubagent({
    agentName: "researcher",
    prompt: "Research the best React drag-and-drop libraries. Compare @dnd-kit, react-beautiful-dnd, and react-dnd. Return a recommendation.",
    description: "DnD library research"
  }),
  runSubagent({
    agentName: "researcher", 
    prompt: "Research accessibility best practices for drag-and-drop task boards. Focus on WCAG requirements and keyboard support.",
    description: "A11y patterns research"
  })
]);
```

**Returns combined results** without user needing to manually switch agents.

---

## Skills Demo: PRD Generation

When you ask the Product Manager to create a PRD, it automatically loads the skill.

**In `@product-manager`**:

```
User: Create a PRD for adding a calendar view to the task dashboard.
```

**What happens internally**:
1. Agent detects "create a PRD" trigger
2. Reads `.github/skills/prd/SKILL.md`
3. Follows the structured workflow
4. Asks the right questions
5. Generates formatted PRD

---

## Quick Demo Commands

Copy-paste these to quickly demo each agent:

### Orchestrator
```
@IDEO-Orchestrator Plan a feature for adding Slack notifications when tasks are overdue.
```

### Product Manager (PRD Skill)
```
@product-manager Create a PRD for a mobile-responsive task view.
```

### Researcher
```
@researcher What are the top 3 task management apps and their key differentiators?
```

### UX Designer
```
@ux-designer Design a priority selector dropdown component with 4 levels.
```

### Developer
```
@developer Implement a useTaskSubscription hook that listens for real-time task updates via WebSocket.
```

### Tester
```
@tester Write Playwright E2E tests for the drag-and-drop task reordering flow.
```

---

## Workflow Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                        USER REQUEST                                  │
│            "Build a task management dashboard"                       │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      @IDEO-Orchestrator                              │
│  • Analyzes request                                                  │
│  • Plans workflow                                                    │
│  • Can spawn subagents for parallel work                            │
└─────────────────────────────────────────────────────────────────────┘
           │              │              │              │
           ▼              ▼              ▼              ▼
    ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐
    │  @PM     │   │@researcher│  │@ux-designer│ │@developer│
    │          │   │          │   │          │   │          │
    │ PRD Skill│   │ Analysis │   │ Framer   │   │ Framer   │
    │ loaded   │   │          │   │ Skill    │   │ Skill    │
    └────┬─────┘   └────┬─────┘   └────┬─────┘   └────┬─────┘
         │              │              │              │
         └──────────────┴──────┬───────┴──────────────┘
                               ▼
                        ┌──────────┐
                        │ @tester  │
                        │          │
                        │ Quality  │
                        │ Gate     │
                        └────┬─────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │  RELEASE READY  │
                    └─────────────────┘
```

---

## Troubleshooting

### Agent not appearing in dropdown
- Ensure file is in `.github/agents/`
- Ensure extension is `.agent.md`
- Reload VS Code window

### Handoff buttons not showing
- Check `handoffs:` syntax in frontmatter
- Verify `agent:` name matches exactly
- Ensure `send:` is boolean (`true`/`false`)

### Skill not loading
- Verify skill path in agent body
- Ensure trigger words match user input
- Check skill file exists at path

### Subagent not working
- Ensure `infer: true` in target agent
- Check agent name is exact match
- Verify target agent has required tools

---

## Files Reference

```
.github/
├── agents/
│   ├── orchestrator.agent.md    # Master coordinator
│   ├── product-manager.agent.md # PRD skill integrated
│   ├── researcher.agent.md      # UX/market research
│   ├── ux-designer.agent.md     # Framer skill integrated
│   ├── developer.agent.md       # Framer skill integrated
│   └── tester.agent.md          # QA and testing
└── skills/
    ├── prd/
    │   └── SKILL.md             # PRD generation workflow
    └── framer-components/
        └── SKILL.md             # Framer component patterns
```

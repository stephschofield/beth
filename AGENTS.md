# Agent Instructions

This project uses a **dual tracking system**:

| Tool | Audience | Purpose |
|------|----------|---------|
| [beads](https://github.com/steveyegge/beads) (`bd`) | Agents | Active work, dependencies, blockers, structured memory |
| [Backlog.md](Backlog.md) | Humans | Completed work archive, decisions, readable changelog |

**The rule:** beads is always current. Backlog.md gets updated when work completes.

## Quick Setup

```bash
# Install beads CLI
npm install -g @beads/bd
# Or: brew install beads
# Or: curl -fsSL https://raw.githubusercontent.com/steveyegge/beads/main/scripts/install.sh | bash

# Install beads MCP server (for VS Code agent integration)
uv tool install beads-mcp
# Or: pip install beads-mcp

# Initialize in your project
bd init

# Run doctor to verify setup
bd doctor
```

## Quick Reference

```bash
# Simple task
bd create "Issue title" --description="What needs to be done" -l in_progress

# Epic for complex work
bd create "Feature name" --type epic -p 1

# Subtask with parent
bd create "Subtask" --parent <epic-id>

# Task with dependency
bd create "Blocked task" --deps "<blocker-id>"

# List issues / see what's ready
bd list
bd ready

# View dependencies
bd dep tree <id>

# Close an issue
bd close <id>
```

## Workflow

### Simple Tasks
1. `bd create "Task" -l in_progress`
2. Do the work
3. `bd close <id>`
4. Update Backlog.md if significant
5. Commit and push

### Complex Work (Multi-Agent)
1. `bd create "Feature" --type epic -p 1`
2. **Create/checkout** the epic branch: `git checkout -b epic/<epic-id>` from main
3. Break into subtasks with `--parent` and `--deps`
4. `bd ready` to find unblocked work
5. Route to specialists with issue IDs **and branch name**
6. Close subtasks as they complete
7. `bd epic close-eligible` when all children done
8. Update Backlog.md with summary
9. Push the epic branch and create PR

## Branch Discipline

All non-trivial work happens on **epic branches**. This prevents conflicts when multiple agents or Beth instances work simultaneously.

### Rules

1. **Epic branch naming:** `epic/<epic-id>` (e.g., `epic/beth-abc123`)
2. **One epic, one branch.** Never mix work from different epics on the same branch.
3. **Verify before committing.** Run `git branch --show-current` and confirm it matches `epic/<epic-id>`.
4. **Commit prefix:** All commits include the epic ID: `<epic-id>: description`
5. **Pull before push.** Always `git pull origin epic/<epic-id> --rebase` before pushing.
6. **Never force-push** unless you are the only one on the branch and certain.
7. **Subagents inherit the branch.** When Beth or any agent spawns a subagent, the epic ID and branch name are included in the prompt. The subagent MUST verify the branch before making changes.

### Switching Epics

If you need to switch to a different epic mid-session:

```bash
git stash --include-untracked -m "auto-stash before switching to epic/<new-epic-id>"
git checkout "epic/<new-epic-id>"
git pull origin "epic/<new-epic-id>" --rebase
```

### Conflict Resolution

If `git pull --rebase` produces conflicts:

```bash
# Option 1: Stash and retry
git rebase --abort
git stash
git pull origin "epic/<epic-id>" --rebase
git stash pop
# Resolve any conflicts, then commit

# Option 2: If another agent pushed, fetch and rebase
git fetch origin
git rebase origin/"epic/<epic-id>"
```

## Landing the Plane (Session Completion)

**When ending a work session**, you MUST complete ALL steps below. Work is NOT complete until `git push` succeeds.

**MANDATORY WORKFLOW:**

1. **Verify branch** - `git branch --show-current` must match your epic branch
2. **Close beads issues** - `bd close <id>` for completed work
3. **Create follow-up issues** - `bd create` for any remaining work
4. **Update Backlog.md** - Add summary to Completed section for significant work
5. **Run quality gates** (if code changed) - Tests, linters, builds
6. **PUSH TO EPIC BRANCH** - This is MANDATORY:

   ```bash
   git add -A
   git commit -m "<epic-id>: description of work"
   git pull origin "epic/<epic-id>" --rebase
   git push origin "epic/<epic-id>"
   git status  # MUST show "up to date with origin"
   ```

7. **Verify** - All changes committed AND pushed to the correct epic branch
8. **Hand off** - Provide context for next session including the epic ID and branch

**CRITICAL RULES:**

- Work is NOT complete until `git push` succeeds
- NEVER stop before pushing - that leaves work stranded locally
- NEVER say "ready to push when you are" - YOU must push
- If push fails, resolve and retry until it succeeds

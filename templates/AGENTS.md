# Agent Instructions

This project uses [beads](https://github.com/steveyegge/beads) (`bd`) for issue tracking.

## Quick Setup

```bash
# Install beads
curl -fsSL https://raw.githubusercontent.com/steveyegge/beads/main/scripts/install.sh | bash

# Initialize in your project
bd init

# Run doctor to verify setup
bd doctor
```

## Quick Reference

```bash
# Create an issue
bd create "Issue title" --description="What needs to be done"

# List issues
bd list

# Show ready work (no blockers)
bd ready

# Show issue details
bd show <id>

# Close an issue
bd close <id>
```

## Workflow

1. Check available work: `bd ready` or `bd list`
2. Claim work: `bd update <id> -l in_progress`
3. Do the work
4. Complete: `bd close <id>`
5. Commit and push

## Landing the Plane (Session Completion)

**When ending a work session**, you MUST complete ALL steps below. Work is NOT complete until `git push` succeeds.

**MANDATORY WORKFLOW:**

1. **Update beads** - Close completed issues with `bd close <id>`, create new issues for follow-up work
2. **Run quality gates** (if code changed) - Tests, linters, builds
3. **PUSH TO REMOTE** - This is MANDATORY:
   ```bash
   git add -A
   git commit -m "description of work"
   git pull --rebase
   git push
   git status  # MUST show "up to date with origin"
   ```
4. **Verify** - All changes committed AND pushed
5. **Hand off** - Provide context for next session

**CRITICAL RULES:**
- Work is NOT complete until `git push` succeeds
- NEVER stop before pushing - that leaves work stranded locally
- NEVER say "ready to push when you are" - YOU must push
- If push fails, resolve and retry until it succeeds

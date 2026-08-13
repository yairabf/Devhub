---
name: feature
description: Manage the current feature workflow — load, start, review, test, explain, or complete. Use when the user runs the feature skill with an action, or asks to load/start/review/test/explain/complete the current feature tracked in context/current-feature.md.
---

# Feature Workflow

Manages the full lifecycle of a feature from spec to merge.

## Working File

Read `context/current-feature.md` — this is the working file for the active feature.

### File Structure

`current-feature.md` has these sections:

- `# Current Feature` — H1 heading with feature name when active
- `## Status` — Not Started | In Progress | Complete
- `## Goals` — Bullet points of what success looks like
- `## Notes` — Additional context, constraints, or details from spec
- `## History` — Completed features (append only)

## Task

The user invokes this skill with an action argument, e.g. `$feature start`. Determine the requested
action from the user's message and execute it.

| Action | Description |
|--------|-------------|
| `load` | Load a feature spec or inline description |
| `start` | Begin implementation, create branch |
| `review` | Check goals met, code quality |
| `test` | Check for testable logic (server actions, utilities) and add unit tests |
| `explain` | Document what changed and why |
| `complete` | Commit, merge, reset |

For the detailed steps of each action, **read the matching file** under
`.agents/skills/feature/references/actions/<action>.md` (e.g. `references/actions/start.md`) and follow it exactly.

If no action is provided, explain the available options above.

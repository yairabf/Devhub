---
name: cleanup
description: Project housekeeping — scan for cleanup tasks (console.logs, unused imports, stale TODOs, orphaned files, drifted context/env). Use when the user runs `$cleanup` (report only) or `$cleanup run` / `$cleanup fix` (report, then fix only what the user selects).
---

# Cleanup

Review the codebase for cleanup tasks:

1. Make sure that the history in `context/current-feature.md` is in order from oldest to newest
2. Find unnecessary `console.log` statements in `src/`
3. Find unused imports
4. Check for stale TODO comments
5. Find orphaned/unused files
6. Check that context files match actual project state
7. Check if `.env.production` has the same variables (not always the same value) as `.env`. If something is missing, report it.
8. Find `@ts-ignore` comments that might be stale

## Mode

The user passes a mode argument (`check`, `run`, or `fix`).

**If no argument or the argument is `check`:**

- Only report findings, don't modify anything
- List what WOULD be cleaned up

**If the argument is `run` or `fix`:**

- First, report all findings with numbered items
- Then ask: "Which items would you like me to fix? (enter numbers like 1,3,5 or 'all' or 'none')"
- Wait for the user's response before making any changes
- Only fix the items the user specifies
- Report what you changed

# AI Interaction Guidelines

## Communication

- Be concise and direct
- Explain non-obvious decisions briefly
- Ask before large refactors or architectural changes
- Don't add features not in the project spec
- Never delete files without clarification

## Workflow

This is the common workflow that we will use for every single feature/fix:

1. **Document** - Document the feature in @context/current-feature.md.
2. **Branch** - Create new branch for feature, fix, etc
3. **Implement** - Implement the feature/fix that I create in @context/current-feature.md
4. **Test** - Verify it works in the browser. Add or update unit tests for any utility, `lib/db`, or server-action logic you touched, and run `npm test`. Run `npm run build` and fix any errors.
5. **Iterate** - Iterate and change things if needed
6. **Commit** - Only after build passes, tests pass, and everything works
7. **Merge** - Merge to main
8. **Delete Branch** - Delete branch after merge
9. **Review** - Review AI-generated code periodically and on demand.
10. Mark as completed in @context/current-feature.md and add to history

Do NOT commit without permission and until the build and tests pass. If the build or tests fail, fix the issues first.

## Testing

We use **Vitest** for unit tests. Scope is **server-side logic and utilities only** — not React components.

- Test what we test: pure utilities (`src/lib/*`), `lib/db` data-shaping helpers (mock the Prisma singleton with `vi.mock("@/lib/prisma", ...)`), server actions, and — when added — API route handlers.
- Don't test: React components (no jsdom / React Testing Library), thin pass-through wrappers with no logic.
- Test files are **colocated** next to their source as `*.test.ts` (e.g. `src/lib/format.test.ts`).
- Run `npm test` (single run), `npm run test:watch` (watch mode), or `npm run test:coverage` (with coverage).

## Branching

We will create a new branch for every feature/fix. Name branch **feature/[feature]** or **fix[fix]**, etc. Ask to delete the branch once merged.

## Commits

- Ask before committing (don't auto-commit)
- Use conventional commit messages (feat:, fix:, chore:, etc.)
- Keep commits focused (one feature/fix per commit)
- Never put "Generated With Claude" in the commit messages

## When Stuck

- If something isn't working after 2-3 attempts, stop and explain the issue
- Don't keep trying random fixes
- Ask for clarification if requirements are unclear

## Code Changes

- Make minimal changes to accomplish the task
- Don't refactor unrelated code unless asked
- Don't add "nice to have" features
- Preserve existing patterns in the codebase

## Code Review

Review AI-generated code periodically, especially for:

- Security (auth checks, input validation)
- Performance (unnecessary re-renders, N+1 queries)
- Logic errors (edge cases)
- Patterns (matches existing codebase?)
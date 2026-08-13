---
name: implement-feature
description: Open a new branch and implement the active feature described in context/current-feature.md, following the project workflow. Use when the user runs `$implement-feature` or asks to start implementing the current feature. Stops before committing.
---

# Implement Feature

Open a new branch and implement the feature described in `context/current-feature.md`.

Follow the project workflow defined in `context/ai-interaction.md`:

1. **Read** `context/current-feature.md` to understand the feature name, status, goals, and notes. If the file has no active feature (empty title/goals), stop and tell the user.
2. **Branch** — create a new branch off `main` named `feature/<short-kebab-name>` (or `fix/<name>` if it's a fix). Derive the name from the feature title. Confirm the branch name with the user before creating it if ambiguous.
3. **Implement** the feature per the goals and notes. Respect `context/coding-standards.md` (TypeScript strict, server components by default, Tailwind v4 CSS config, Prisma for DB, etc.).
4. **Verify** — run `npm run build` and fix any type/lint errors before reporting completion.
5. **Do NOT commit** — wait for the user's explicit approval before any `git commit` or merge (per `context/ai-interaction.md`).

When done, summarize what changed, what was verified, and what still needs review.

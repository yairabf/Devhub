---
description: Open a new branch and implement the current feature from context/current_feature.md
---

Open a new branch and implement the feature described in @context/current_feature.md.

Follow the project workflow defined in `context/ai-interaction.md`:

1. **Read** `context/current_feature.md` to understand the feature name, status, goals, and notes. If the file has no active feature (empty title/goals), stop and tell me.
2. **Branch** — create a new branch off `main` named `feature/<short-kebab-name>` (or `fix/<name>` if it's a fix). Derive the name from the feature title. Confirm the branch name with me before creating it if ambiguous.
3. **Implement** the feature per the goals and notes. Respect `context/coding-standards.md` (TypeScript strict, server components by default, Tailwind v4 CSS config, Prisma for DB, etc.).
4. **Verify** — run `npm run build` and fix any type/lint errors before reporting completion.
5. **Do NOT commit** — wait for my explicit approval before any `git commit` or merge (per `context/ai-interaction.md`).

When done, summarize what changed, what was verified, and what still needs my review.

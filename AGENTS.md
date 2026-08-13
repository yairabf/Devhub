<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# DevStash

A developer knowledge hub for snippets, commands, prompts, notes, files, images, links and custom types. Stack: Next.js 16 / React 19 / TypeScript, Tailwind CSS v4, ShadCN UI, Prisma ORM + PostgreSQL (Neon), NextAuth v5.

## Project Context Files

These hold the full project context. Read them when relevant — Codex does not auto-load them:

- `context/project-overview.md` — vision, data model, tech stack, monetization
- `context/coding-standards.md` — full coding conventions
- `context/ai-interaction.md` — workflow and communication rules
- `context/current-feature.md` — the active feature spec + history log

## Commands

- **Dev server**: `npm run dev` (http://localhost:3000)
- **Build**: `npm run build`
- **Production server**: `npm run start`
- **Lint**: `npm run lint`
- **Test**: `npm test` (unit tests via Vitest; `npm run test:coverage` for coverage)

**IMPORTANT:** Do not add Codex/Claude/AI attribution to any commit messages.

## Workflow

Common workflow for every feature/fix:

1. **Document** the feature in `context/current-feature.md`.
2. **Branch** — new branch named `feature/<name>` or `fix/<name>`.
3. **Implement** per the spec.
4. **Test** — verify in the browser. Add/update unit tests for any utility, `lib/db`, or server-action logic you touched, and run `npm test`. Run `npm run build` and fix errors.
5. **Iterate** if needed.
6. **Commit** — only after build passes, tests pass, and everything works. Ask before committing. Use conventional commits (`feat:`, `fix:`, `chore:`).
7. **Merge** to main.
8. **Delete branch** after merge.
9. **Review** AI-generated code periodically.

Do NOT commit without permission and until build + tests pass.

## Coding Standards (highlights)

- **TypeScript**: strict mode; no `any` (use proper typing or `unknown`); interfaces for all props/API/data models.
- **React**: functional components + hooks only; one job per component.
- **Next.js**: server components by default; `'use client'` only when needed (interactivity, hooks, browser APIs); Server Actions for form submissions / simple mutations; API routes for webhooks, uploads, long-running ops, specific HTTP semantics, external integrations.
- **Tailwind CSS v4 (CRITICAL)**: CSS-based config via `@theme` in `src/app/globals.css`. **Do NOT** create `tailwind.config.ts`/`.js` (those are v3). No JS-based config.
- **Database**: Prisma ORM; always `prisma migrate dev` (never `db push`); run `prisma migrate status` before committing; production runs `prisma migrate deploy`.
- **Data fetching**: server components fetch directly with Prisma; client components use Server Actions; validate all inputs with Zod.
- **Error handling**: try/catch in Server Actions; return `{ success, data, error }`; user-friendly toasts.
- **Testing (Vitest, `environment: "node"`)**: server-side logic and utilities only — not React components. Test `src/lib/*`, `lib/db` helpers (mock the Prisma singleton with `vi.mock("@/lib/prisma", ...)`), server actions, API route handlers. Colocate as `*.test.ts`. Explicit imports (`import { describe, it, expect, vi } from "vitest"`) — no globals.
- **File organization**: components `src/components/[feature]/ComponentName.tsx`; pages `src/app/[route]/page.tsx`; server actions `src/actions/[feature].ts`; types `src/types/[feature].ts`; utils `src/lib/[utility].ts`.
- **Naming**: Components PascalCase; functions camelCase; constants SCREAMING_SNAKE_CASE; types/interfaces PascalCase.
- Make minimal changes; don't refactor unrelated code; don't add unrequested features; never delete files without clarification.

## Neon MCP

When using the Neon MCP, always target this project and branch unless told otherwise:

- **Project:** `DevHub` (projectId: `cold-queen-29287494`)
- **Branch:** `dev` (branchId: `br-broad-shape-alpvm6ee`)

Rules:
- Pass `projectId: "cold-queen-29287494"` to every Neon MCP tool that accepts it.
- Pass `branchId: "br-broad-shape-alpvm6ee"` to every Neon MCP tool that accepts it (e.g. `run_sql`, `get_database_tables`, `describe_branch`).
- Do **not** run queries/mutations against the `production` branch (`br-long-lake-alidq7t6`) unless explicitly asked.
- Do **not** call `list_projects` or prompt to pick a project — the target is fixed.
- If "the database" / "the dev DB" is referenced without specifics, assume DevHub/dev.
- If a tool call would hit a different project or branch, stop and confirm first.

## Codex Skills & Agents

- Project skills live in `.agents/skills/<name>/SKILL.md` — invoke with `$skill-name` (e.g. `$feature start`).
- Project subagents live in `.codex/agents/<name>.toml` — `auth-auditor`, `nextjs-codebase-auditor`.

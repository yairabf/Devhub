# DevStash

A developer knowledge hub for snippets, commands, prompts, notes, files, images, links and custom types.

## Context Files

Read the following to get the full context of the project:

- @context/project-overview.md
- @context/coding-standards.md
- @context/ai-interaction.md
- @context/current-feature.md

## Commands

- **Dev server**: `npm run dev` (runs on http://localhost:3000)
- **Build**: `npm run build`
- **Production server**: `npm run start`
- **Lint**: `npm run lint`

**IMPORTANT:** Do not add Claude to any commit messages

## Neon MCP

When using the Neon MCP, always target this project and branch unless I explicitly say otherwise:

- **Project:** `DevHub` (projectId: `cold-queen-29287494`)
- **Branch:** `dev` (branchId: `br-broad-shape-alpvm6ee`)

Rules:
- Pass `projectId: "cold-queen-29287494"` to every Neon MCP tool that accepts it.
- Pass `branchId: "br-broad-shape-alpvm6ee"` to every Neon MCP tool that accepts it (e.g. `run_sql`, `get_database_tables`, `describe_branch`).
- Do **not** run queries or mutations against the `production` branch (`br-long-lake-alidq7t6`) unless I explicitly ask.
- Do **not** call `list_projects` or prompt me to pick a project — the target is fixed.
- If I reference "the database," "the dev DB," or similar without specifying, assume DevHub/dev.
- If a tool call would hit a different project or branch, stop and confirm with me first.
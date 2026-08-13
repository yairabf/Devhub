---
name: research
description: Run a research task from a prompt file to generate documentation only. Use when the user runs the research skill with a prompt name to investigate the codebase/database and write findings to a docs output file — never modifies source code, branches, or commits.
---

# Research

## Task

Execute a research task. The user provides a prompt name, e.g. `$research content-types`.

## Instructions

1. If no prompt name is provided, error: "Usage: `$research <prompt-name>`"
2. Look for the prompt file at `context/research/{prompt-name}.md`
3. If not found, error: "Prompt file not found at `context/research/{prompt-name}.md`"
4. Read the prompt file, which should contain:
   - **Output**: Where to write results (e.g., `context/content-types.md`)
   - **Research**: What to investigate
   - **Include**: Specific details to capture
   - **Sources**: What files/tools to use
5. Execute the research using appropriate tools:
   - Read files (Prisma schema, constants, components)
   - Query the database via the Neon MCP if needed (target DevHub/dev — see AGENTS.md)
   - Search the codebase for patterns
6. Write findings to the specified output location
7. Summarize what was discovered

## Rules

- This skill produces DOCUMENTATION only
- Do NOT modify source code files
- Do NOT create branches or commits
- Output should go to `/docs/` unless otherwise specified
- Delegate to a subagent for thorough exploration if needed

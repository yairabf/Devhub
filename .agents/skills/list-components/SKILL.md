---
name: list-components
description: List the project's React component files, optionally filtered to a subdirectory. Use when the user runs `$list-components [subdirectory]` and wants an inventory of components under the components folder.
---

# List Components

## Task

List all React component files (`.tsx`, `.ts`, `.jsx`, `.js`) in the components folder.

If the user provides a subdirectory argument, only list files in that subdirectory.

## Output Format

- Numbered list of files with relative paths
- Brief one-line description of each (infer from filename)
- Summary count at the end

If no files found, say "No components found."

# Complete Action

1. Stage all changes and commit with a descriptive message
2. Switch to main and merge the feature branch (no push yet)
3. **Delete the local feature branch. This step is not optional — do not defer it or leave it for the user.**
   - `git branch -d <feature-branch>` — plain `-d`, never `-D`, so git refuses if anything is unmerged
   - Verify it is gone: `git branch --list '<feature-branch>'` must print nothing. If it still lists the branch, the delete did not happen — fix that before moving on.
   - If `-d` refuses because the branch is unmerged, stop and report it. Do not force-delete.
4. Reset `context/current-feature.md`:
   - Change H1 back to `# Current Feature`
   - Clear Goals and Notes sections (keep placeholder comments)
   - Add feature summary to the END of History
5. Commit the reset: `chore: reset current-feature.md after completing [feature]`
6. Push main to origin ONCE (single push with all changes)
7. Delete the branch from origin if it was ever pushed:
   - Check: `git ls-remote --heads origin <feature-branch>`
   - If present: `git push origin --delete <feature-branch>`
   - If absent, say so rather than silently skipping the step.

## Done means

No `feature/*` branch for this feature remains, locally or on origin. Report both, and name the branch you deleted — "merged and cleaned up" without the branch name is not a confirmation.

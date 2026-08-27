# Dark Theme: Charcoal Background & Cursor Dot Field

## Overview

Redesign the dark theme's background from the current near-black flat color to a lighter, single-color charcoal, and add a living, cursor-reactive dot field behind the main dashboard surfaces — inspired by antigravity.google's mouse-interactive dot background, recolored with DevHub's own item-type accent palette.

## Status

**Preview only — not yet approved for real implementation.** Verified as a standalone, throwaway mockup at `.scratch/dark-theme-preview.html` (not part of the app, not linked from anywhere, safe to delete). No code in `src/` has changed. This spec documents what was designed and verified in that mockup so it can be implemented for real later, if approved.

---

## Background Color

- Single flat background color — no gradients, blobs, or tonal shape variation across the surface.
- Current: `--background: oklch(0.145 0 0)` → `#262626`
- Proposed: `oklch(0.205 0 0)` → `#333333` (one step lighter on the same neutral scale)
- Every surface that currently layers above `--background` (card, popover, muted, secondary, accent, sidebar) shifts up by roughly the same step, so existing layering/contrast relationships are preserved — only the neutral scale moves, not the accent or border colors.

---

## Idle State: Orbiting Dot Grid

- An evenly spaced grid of small, low-opacity monochrome dots (not colored) drawn on a canvas layer behind the main content.
- Each dot is anchored to a fixed home position but continuously circles it in a small, slow orbit — this is the idle "alive" state, distinct from a static texture.
- Grid spacing ~24px, orbit radius ~2px, dot radius ~1px, dot color a faint white (~9% opacity) so it reads as texture, not decoration.
- Must be genuinely animating frame to frame (verified via pixel diff in the mockup), not a single static paint.

## Cursor Interaction: Colored Spark Particles

- As the pointer moves across the panel, short colored dash-shaped particles spawn near the cursor's path.
- Particle count spawned per movement scales with pointer travel distance (more particles for faster/longer movement, none while the pointer is still).
- Particles drift a short distance in the direction of travel, then fade out and are removed — lifespan ~0.75s (46 frames at 60fps), capped at a max live-particle count (~140) to bound cost.
- Particle color is drawn from DevHub's existing item-type accent palette (`src/lib/type-colors.ts`), not a new or borrowed palette:
  - `#3b82f6` (Snippet / blue)
  - `#a855f7` (Prompt / purple)
  - `#f97316` (Command / orange)
  - `#facc15` (Note / yellow)
  - `#10b981` (Link / emerald)
  - `#ec4899` (Image / pink)
- This is explicitly **not** a flashlight/spotlight effect and **not** a drifting-blob background — both were tried and rejected in favor of this dot-field approach.

---

## Motion & Performance Rules

- Single `requestAnimationFrame` loop drives both the dot orbit and the particle simulation.
- `devicePixelRatio`-aware canvas sizing (capped at 2x) for sharp rendering without excessive cost.
- Resize is debounced and re-seeds the dot grid to the new dimensions.
- Loop pauses on `visibilitychange` (tab hidden) and resumes when visible again.
- `prefers-reduced-motion: reduce` — render the dot grid once at rest (no orbit motion) and never spawn particles, regardless of pointer movement.

---

## Where This Would Apply (If Approved)

- Real target: the `.dark` block in `src/app/globals.css` for the background token change, plus a new canvas-based component layered behind dashboard content for the dot field/particles — this spec does not yet scope exactly which surfaces get the canvas (whole app shell vs. just the main content area).
- Would need to follow the project's standard workflow: branch → implement → verify in browser across both themes → build/tests pass → commit only with explicit approval (per `context/ai-interaction.md`).

## Open Questions

- Should the canvas render behind the whole app shell (topbar + sidebar + main), or only the main content region?
- Light theme equivalent, or is this dark-mode only?
- Performance on lower-end devices / mobile has not been tested — the mockup was only verified on desktop viewport sizes.
- Should the effect have an explicit on/off setting independent of `prefers-reduced-motion` (e.g., a user preference), or is respecting reduced-motion sufficient?

## Reference

- Mockup: `.scratch/dark-theme-preview.html` (side-by-side Current vs. Proposed panels; move the mouse over the "Proposed" panel to see the effect). This file is scratch/throwaway and should not be treated as a source of truth once this feature is actually implemented.

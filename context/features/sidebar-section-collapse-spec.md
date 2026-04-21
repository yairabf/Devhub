# Sidebar Section Collapse Spec

## Overview

Add the ability to collapse and expand individual sections in the dashboard sidebar (Favorites, Recent, Types). Top Nav (All Items / Favorites / Recent page links) is always visible. Collapse state persists across page reloads via `localStorage`.

## Requirements

- Collapsible sections: Favorites, Recent, Types. Top Nav is NOT collapsible.
- Section header becomes a `<button>` that toggles the section. The full header area (title + chevron) is clickable.
- Chevron indicates state: pointing down when expanded, pointing right when collapsed.
- Default state on first visit: all three sections expanded.
- Persist per-section state in `localStorage` under key `devstash:sidebar:sections`, shape `{ favorites: boolean; recent: boolean; types: boolean }` where `true` means collapsed.
- When the whole sidebar is in icon-only mode (existing outer collapsed state), per-section collapse is ignored — icons render as today. Per-section state still persists for when the sidebar is expanded again.
- The "View all collections" link stays inside the Recent section and collapses with it.
- Accessibility: header button uses `aria-expanded` and `aria-controls`; the hidden panel uses a matching `id`.
- SSR-safe: initial render assumes all expanded; `localStorage` is read in `useEffect` after mount (acceptable flash since sections are below the primary nav).
- No animation in this iteration (conditional render).

## Implementation Notes

- New hook `src/components/dashboard/useCollapsedSections.ts` owns the `localStorage` read/write and returns `[state, toggle(sectionId)]`.
- Update `src/components/dashboard/SidebarSection.tsx` to accept `sectionId`, `collapsed`, `onToggle`, and `sidebarCollapsed` props; render the toggle UI only when `sidebarCollapsed` is false.
- Update `src/components/dashboard/Sidebar.tsx` to wire the hook and pass state/toggle handlers into each `SidebarSection`.
- No database, server-component, or layout changes.

## Out of Scope

- Animated expand/collapse transitions.
- Collapse state for the top Nav.
- Per-user server-persisted preferences (everything stays client-side via `localStorage`).

## References

- `src/components/dashboard/Sidebar.tsx`
- `src/components/dashboard/SidebarSection.tsx`

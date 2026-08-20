# UI Review Fixes

## Overview

Fix the defects and craft issues found in the 2026-08-20 browser-driven UI review of `/` (signed out + signed in), `/dashboard`, `/items/[type]`, `/collections`, `/favorites`, and the item drawer — reviewed at 1440 / 768 / 600 / 390px in both themes.

This is a fix-list spec, not a new feature. Requirements are tiered; **P1 and P2 are the recommended scope for one pass.** P3–P5 can ship together later or be split off.

## Decision (2026-08-20)

**The homepage pricing CTAs branch on `isPro`** (finding 1). A signed-in **free** user still sees "Go Pro", preserving the upgrade path; a signed-in **Pro** user gets a dashboard link instead. `src/app/page.tsx` therefore threads both `isSignedIn` and `isPro`, not just `isSignedIn`. Non-pricing CTAs (hero, closing CTA, footer auth links) point at `/dashboard` for any signed-in visitor.

Findings marked **[verified]** were confirmed against source during triage and cite a file:line. Findings marked **[reported]** come from the browser review only and should be reproduced before fixing — do not trust the stated cause.

---

## P1 — Verified defects

### 1. Homepage body CTAs are not session-aware **[verified]**

`src/app/page.tsx:27` passes the session to `SiteNav` and nothing else, so a signed-in visitor is invited to create an account five times on one page.

- Every body CTA is hardcoded `/register`: `HeroSection.tsx:49`, `PricingSection.tsx:35`, `PricingToggle.tsx:104`, `CtaSection.tsx:16`, plus the footer's "Sign in" / "Create account" (`src/lib/home-content.ts:164-165`)
- Thread `isSignedIn` from `page.tsx` to every CTA surface, not just the nav
- Signed-in copy/target: point at `/dashboard` and change the label away from signup wording — except the pricing CTAs, which branch on `isPro` per the decision above
- Footer auth links should collapse to a single dashboard link when signed in
- This is the same class of bug as the signed-out nav defect fixed during Homepage — one surface made session-aware and the rest missed. Prefer a single shared derivation over per-component conditionals

### 2. Sidebar "Recent" link 404s **[verified]**

`src/components/dashboard/SidebarNav.tsx:11` points at `/dashboard/recent`; no such route exists (`src/app/dashboard/` has only `error/layout/loading/page`).

- Lands on Next's default unstyled 404 — white page, no app chrome, no way back — a full-screen white flash in a dark-themed app
- Next prefetches the dead href on every render of any page carrying the sidebar, producing a console 404 per page load (~20 per session) and one per sidebar collapse/expand
- **Recommended for this pass: remove the link.** Building `/dashboard/recent` means a new route, a new `lib/db` query, and pagination decisions — that is a feature, not a fix, and it would blow the P1 scope. File the route as a separate backlog item if "Recent" is wanted as primary nav
- Audit the other `SidebarNav` entries for the same problem while in there

### 3. Homepage nav has no mobile menu **[verified]**

`src/components/home/SiteNav.tsx:36` is `hidden … md:flex`, so Features and Pricing disappear below 768px with no hamburger and no substitute.

- Only fallback is the footer, ~6,469px down the page at 390
- The dashboard TopBar already solves this with a hamburger + `Sheet`; the marketing nav should not be the one surface that drops nav entirely
- Applies at 600 and 390

### 4. Item card content preview clips text mid-glyph **[verified symptom, cause unconfirmed]**

Highest user-visible impact — `ItemCard` is the most-repeated component in the app. The bottom half of a line of glyphs is sliced by the box edge instead of ellipsing. Confirmed on `/dashboard` Pinned + Recent and 3 of 4 cards on `/items/snippets`.

- Element is the `<pre>` at `src/components/dashboard/ItemCard.tsx:64`: `line-clamp-3 … px-3 py-2 font-mono text-xs whitespace-pre-wrap`
- **Root cause, confirmed in the browser 2026-08-20 — the review was right and this spec's original triage note was wrong.** Measuring the `<pre>` itself (not its wrapper) gives `display: flow-root` with `-webkit-line-clamp: 3` set, so the clamp really is inert. Setting `display: -webkit-box` *inline* still computes to `flow-root` in Chrome 151, even though `CSS.supports('display','-webkit-box')` returns true — the legacy value is accepted at parse and then dropped. `line-clamp` (the standardised property) is not supported either (`CSS.supports` false)
- With the clamp inert the element was simply cropped by `overflow: hidden` at `clientHeight` 64 = three 16px lines plus its own `py-2`. Lines 1–3 filled 8–56px and a fourth line ran 56–72px, so the crop at 64px cut it through the middle of its glyphs
- Fix applied: the padding moved to a wrapper `div` (which now carries `rounded-md bg-muted px-3 py-2`) and the `<pre>` crops at `max-h-12` — exactly 3 × 16px, so the cut always lands on a line boundary. `line-clamp-3` is kept for engines that do honour it; it clamps to the same three lines and adds an ellipsis
- Verified: all four previews on `/items/snippets` report `clientHeight` 48 with `padding: 0`, in both themes
- `CollectionCard.tsx:41` and `ItemCard.tsx:59` (`line-clamp-2`, no padding) were checked and are unaffected — they crop on a line boundary already, which is exactly why the review saw them as clean. Note the wider implication: **every `line-clamp-*` in the app is currently decorative in this browser**, so any future clamp must not rely on it for the crop

---

## P2 — Accessibility

### 5. Collapsed sidebar links have no accessible name **[verified]**

`src/components/dashboard/SidebarLink.tsx:31` renders the label only when `!collapsed`. The collapsed branch wraps the link in a `Tooltip` (lines 43-47) whose content is not associated with the anchor.

- Result: 17 anonymous links. Mouse users get a hover tooltip; keyboard and screen-reader users get nothing. WCAG 2.4.4 / 4.1.2
- **Note the structure before fixing:** `TooltipTrigger` at line 44 is `render={<span className="block" />}` — a span *wrapping* the anchor, not the anchor itself. base-ui puts its aria wiring on the trigger element, so it lands on the span and never reaches the link. Adding `aria-label` to the anchor alone closes the WCAG violation but leaves that structure wrong
- Pick one and state it in the commit: either make the tooltip trigger render *as* the anchor so its aria wiring associates correctly, or put a visually-hidden label on the anchor and accept that the tooltip is decorative for sighted mouse users only
- Compounding visual issue (craft, not blocking): five collections reduce to five 8px dots, two of them the same green

### 6. Raw database ids leak into the UI **[verified]**

`src/components/dashboard/CollectionCard.tsx:53-54` sets `aria-label={typeId}` and `title={typeId}`, so seven elements announce and hover-tooltip as `type_prompt` / `type_snippet` / `type_command` / `type_link`.

- Use the human type name. `TypeDot.tsx` already does the right thing (`aria-hidden`) — follow that or supply a real name

### 7. Theme switch announces a contradictory state **[verified]**

`src/components/theme/ThemeToggle.tsx:42-44` combines `role="switch"` + `aria-checked={isDark}` + `aria-label={isDark ? "Switch to light theme" : …}`, which reads as "Switch to light theme, switch, **on**" while the app is in dark mode.

- A switch's name must describe what it controls, not the action. Name it "Dark mode" and let `aria-checked` carry the state — or drop `role="switch"` and keep the action-named button

### 8. Designed focus rings are inconsistent **[reported]**

The 3px ring appears on TopBar controls and the main homepage buttons; the sidebar logo, "Collapse sidebar", "All Items", and the homepage logo / Features / Pricing / billing toggle fall back to Chrome's `1px auto`.

- Focus *order* is correct throughout and every dashboard control has a name — this is purely the indicator
- Fix at the shared level (a global `:focus-visible` rule or the shared button/link classes) rather than per component

### 9. Duplicate accessible name in the item drawer **[reported]**

Two buttons in the same dialog are both named "Copy snippet" — the action-bar copy and the code-editor header copy. Disambiguate one.

### 10. Read-only Monaco announces as editable **[reported]**

The drawer's read-only content exposes `textbox "useDebounce Hook content"`. Screen-reader users are told they can edit it. Set the appropriate read-only/`aria-readonly` semantics on the surface.

### 11. Mobile nav drawer has no close button and no accessible name **[reported]**

At 390 the drawer opens with the full, correctly-labelled sidebar (finding 5 does **not** recur there), but there is no "Close" control and no `aria-labelledby` — unlike the item drawer, which has both. Closing requires the ~150px backdrop strip or Escape.

### 12. Heading level skip **[reported]**

Homepage footer skips h2 → h4.

---

## P3 — Responsive / layout

### 13. Hero dashboard-preview titles truncate at 768px **[reported]**

All six card titles cut to a 44px allotment: `useDebounce.ts` needs 87px, `Deploy runbook` 84, `Code Reviewer` 80, `Tailwind docs` 73, `arch-diagram` 72, `docker prune` 71. Renders as "useD…", "docke…".

- Note the inversion: at **390 the panel stacks and all six render in full**, so tablet is worse than phone
- The preview's job is showing what the product looks like; at tablet width it shows ellipses

### 14. `/favorites` row titles truncate 69–85% at 390px **[reported]**

"React Patterns" shows 18px of 118px needed — roughly one letter plus an ellipsis. "AI Workflows" 18/101. "Senior Code Review" 47/151. "useDebounce Hook" 40/134.

- Meanwhile the redundant "Collection" badge (78px), the `upd 2026-08-19` date (90px) and the star all keep full width
- No document overflow — this is priority inversion in the flex layout. The title should win the space contest
- Clean at 600 / 768 / 1440

### 15. "COMMAND" eyebrow overruns its box at 768px **[reported]**

Needs 54px in a 44px box with `overflow: visible`; the parent is only 11px wider, so the orange label runs into the card's right padding edge. The other five eyebrows fit at exactly 44px.

### 16. Mobile stats grid is reflowed, not designed **[reported]**

At 390 the four stat cards stack full-width at ~110px each — 440px, the entire first screen, is counts before any content. 2×2 recovers it. The rest of the 390 dashboard layout is good.

### 17. ⌘K chip at touch widths **[reported]**

At 390 the search button shrinks to ~100px, roughly half of it the ⌘K keycap with "Search…" truncated — on a device with no Cmd key. In light mode the chip is `#737373` on `#f5f5f5` = **4.35:1** against the 4.5:1 AA threshold for normal text — the only sub-AA text in the dashboard chrome (the other sub-AA samples in finding 21 are on the homepage). Drop the chip below `sm`.

### 18. Last item type hidden at 1440×900 **[reported]**

With all three sidebar sections expanded, `/items/snippets` sits 33px below the scroll area (`scrollHeight` 757 vs `clientHeight` 712). It scrolls, but there is no scrollbar, fade, or any affordance — so "Snippet", arguably the most-used type in a dev tool, is silently invisible.

---

## P4 — Visual craft

### 19. No visually distinct primary action on the marketing page **[reported]**

Primary fill `#262626` on page `#0a0a0a` = 1.31:1; primary vs. secondary = **1.09:1**. Weight rides entirely on the border, and the borders invert the intent — the ghost carries `rgba(255,255,255,0.15)` while the primary carries a dimmer mid-grey.

- Net effect in pricing: the **Free** card's "Get Started" reads stronger than "Go Pro" on the card badged MOST POPULAR
- The graphite palette was a deliberate decision during Homepage (replacing the blue brand colour). Revisit the contrast between variants without reintroducing a brand hue, if that constraint still holds

### 20. Light theme has no surface hierarchy **[reported]**

`body`, `<aside>`, `<main>`, `<header>` and collection cards **all compute to `#ffffff`**, separated only by `#e5e5e5` hairlines. Dark has a real step (sidebar `#000000` vs. body `#0a0a0a`).

- Related inversion: "New Item" is a proper black filled primary in light but graphite-on-near-black in dark — emphasis is *stronger* in light than dark, the opposite of a dark-first product

### 21. Sub-AA contrast in decorative mockups **[reported]**

Purple "PROMPT" badge 8.5px bold on `#171717` = 4.35:1; purple "performance" tag 11.5px on `#262626` = 3.67:1; blue "react" tag = 4.02:1. Decorative, but these are the real type-system colours and purple is the weakest of the seven. The other 39 samples pass.

### 22. Miscellaneous craft notes **[reported]**

- Heading case is inconsistent — sentence case for "Everything in one place" / "Simple pricing", Title Case for the hero "Developer Knowledge" and "Ready to Organize Your Knowledge?"
- Homepage footer columns sit left-of-centre with ~700px of empty space to their right at 1440
- 8.5px type badges and 9px chaos labels are below a comfortable floor even for decoration
- Chaos-field icons occlude each other's labels (Slack over notes.txt, notes.txt rendering "Termina"). Overlap is the metaphor; the labels are what make the icons legible as sources. Bounce logic itself is sound — max wall excursion 2px over 12 sampled frames
- Sidebar uses two icon languages for one entity: FAVORITES renders collections with a bookmark glyph, RECENT renders the same collections with a coloured dot, adjacent on screen
- Every FAVORITES row carries a gold star though membership already means favorited; the user-menu popup repeats "Demo User / demo@devstash.io" directly above the trigger showing the same two lines
- `/favorites` is a stylistic outlier — the only monospace terminal-row list, and its content ("Senior Code Review", "AI Workflows") is prose, not code. Also: `upd` is not a word; collection rows show a folder glyph twice; item titles are type-coloured but collection titles are plain white; rows span 1145px with ~700px of empty gutter at 1440
- Item drawer: macOS traffic-light dots are inert decoration and the only red/yellow/green in the app; short items leave ~300px of empty drawer above the pinned footer
- Command palette reserves a 48px empty `role="status"` region above the first result — the "no results" element renders unconditionally, leaving a visible dead band under the input

---

## P5 — Search quality

### 23. Tags are not searchable **[verified]**

`src/lib/search.ts:87` scores items on `` `${item.title} ${item.preview}` ``, and `preview` is built from `description ?? content ?? url`. Tags are absent from the index entirely.

- Symptom: searching "react" does not surface "useDebounce Hook" despite its visible `react` tag, while "Refactoring Assistant" ranks first
- The review guessed "title-only matching" — that is the wrong description of a real gap
- Fix by including tags in the indexed string (`getSearchableItems` in `src/lib/db/items.ts` would need to select them). The existing ranking tradeoff between "Refactoring Assistant" and "shadcn/ui" is pinned by a unit test as intentional and is **not** in scope

---

## Out of scope

- The free-tier 50-item / 3-collection limits (still unenforced, unrelated)
- Retuning the fuzzy scorer beyond adding tags to the index
- `prototypes/homepage/` — the superseded static duplicate; do not update it
- Rewriting `/favorites` away from its terminal-row style. Fix the truncation (14) and the specific nits in 22; the overall direction was a deliberate spec decision
- **Do not add an `IntersectionObserver` feature check to `Reveal`.** Every homepage section is `opacity-0 translate-y-6` by default and reveals on scroll; the review confirmed all four sections reveal correctly at all four widths. The failure mode if the observer ever does not fire is a blank page rather than an unanimated one — this is a known and accepted limitation recorded when Homepage shipped. Raise it for discussion rather than silently "fixing" it while working P3

## Verification

- Reproduce each finding in the browser before fixing it, and re-check at the width and theme recorded above. Several findings only appear at one breakpoint
- Re-check the two historical regression bands: hero preview cards at <640, dashboard horizontal overflow at <563. Both are currently clean — keep them that way
- Confirm zero document overflow at 1440 / 768 / 600 / 390 in both themes after the layout changes
- Console must stay clean. The only recurring error today is the `/dashboard/recent` prefetch 404 from finding 2 — that count should go to zero
- The pre-existing baseline noise (one dev-build CSS chunk 404, two `woff2 … preloaded but not used` warnings) is not in scope
- Unit tests for any `src/lib/*` change (finding 23 touches `search.ts` / `lib/db/items.ts`); no component tests, per project scope
- `npm test`, `npm run build`, `npm run lint` before commit. Run the e2e suite on a **freshly restarted** dev server — findings 4, 5 and 23 touch markup and search behaviour that existing specs locate against

## Notes

- Review was read-only against the seeded demo user (`demo@devstash.io`); no seed data was mutated and dashboard counts are unchanged (18 items / 5 collections / 2 favorite items / 2 favorite collections)
- Screenshots at all four widths are in `.playwright-mcp/` (gitignored)
- Not visited during the review, so unreviewed rather than clean: `/profile`, `/settings`, `/collections/[id]`'s action bar, `/register`, `/forgot-password`, and `/sign-in` as a screen. Pagination, loading skeletons, and error states were unreachable under the read-only constraint

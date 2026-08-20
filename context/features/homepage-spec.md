# Homepage

## Overview

Turn the static prototype in `prototypes/homepage/` into the real app homepage at `/`, replacing the current `src/app/page.tsx` stub. Same content and layout as the mockup, rebuilt with Tailwind v4 + ShadCN primitives and split into server/client components.

## Route & Layout

- Lives at `src/app/page.tsx` — public, **not** protected by `src/proxy.ts`

- No `DashboardShell` / sidebar / TopBar — this is the one page that does not mirror the dashboard layout

- Export page-level `metadata` (title: `DevStash — Stop Losing Your Developer Knowledge`)

- Components under `src/components/home/`

## Component Structure

Server components (default — no `"use client"`):

- `SiteFooter` — includes the copyright year via `new Date().getFullYear()` (server-rendered; do not port the prototype's JS year script)

- `HeroText`, `DashboardPreview`, `FeaturesSection`, `AiSection`, `PricingSection`, `CtaSection`

Client components (only these four need interactivity):

- `SiteNav` — scroll listener toggling the opaque/blurred state

- `Reveal` — a single reusable `IntersectionObserver` wrapper used by every fading section; not one observer per section

- `PricingToggle` — owns monthly/yearly state and renders the toggle plus the pricing grid, since the switch and the Pro price/period/note sit in different layout slots but move together. The static Free card is passed in as a server-rendered slot rather than re-implemented client-side

- `ChaosField` — the `requestAnimationFrame` drift/bounce/repel animation

`ChaosField` requirements:

- Particle state in `useRef`, never `useState` — write positions straight to the DOM with `el.style.setProperty("--tx", …)` as the prototype does. A state-driven port would re-render at 60fps

- Port the existing `pointermove` / `pointerleave` / `blur` / debounced `resize` handling and the `dt` cap

- Preserve the `prefers-reduced-motion` gate: skip the rAF loop and show revealed sections immediately (the prototype already does both)

- Clean up listeners and cancel the frame on unmount

## Content & DRY

- Feature cards, pricing tiers, checklist rows, footer columns, and chaos icons come from typed arrays/consts rendered by one `.map()` each — no repeated markup

- One shared `SectionHeading` (title + gradient span + subtitle) used by Features / Pricing

- One shared `CheckItem` used by the AI checklist and both pricing feature lists

- Brand SVGs (Notion, GitHub, Slack, VS Code) have no Lucide equivalent — extract to `src/components/home/chaos-icons.tsx`. Use Lucide for the generic four (terminal, text file, bookmark, browser tabs)

- CTAs are links, not buttons: use a plain `next/link` styled with `buttonVariants()`. Do **not** use `Button render={<Link/>}` — it emits a console warning by overriding the anchor's semantics (see Favorites Page)

- Use existing `Badge` / `Card` primitives where they fit; don't add new UI primitives for this page

## Link Targets

- Nav "Sign In" → `/sign-in`; nav "Get Started", hero CTA, pricing Free CTA, bottom CTA → `/register`

- Pricing Pro CTA → `/register` (no checkout exists yet)

- Nav "Features" / "Pricing" and hero "See Features" → in-page anchors `#features` / `#pricing`

- Footer: keep only links that resolve (Features, Pricing, Sign In, Register). Drop Changelog, Roadmap, Documentation, API Reference, Import Guide, Blog, About, Privacy, Terms, Contact rather than shipping `href="#"`

- No `href="#"` anywhere in the finished page

## Styling

- Tailwind v4 utilities only — no `tailwind.config.*`, no inline `style` attributes for color

- The prototype's per-card `style="--c:var(--snippet)"` pattern is replaced by the existing helpers in `src/lib/type-colors.ts` (`getTypeTextClass`, `getTypeBadgeClass`, `getTypeDotClass`, `getTypeLeftBorderClass`) keyed by `type_snippet` / `type_prompt` / etc.

- Page-specific decorative CSS that has no Tailwind equivalent (gradient headline, ambient background glow, arrow pulse keyframes) goes in a scoped block in `src/app/globals.css`, following the existing `.markdown-preview` precedent

- Responsive per the mockup: chaos → arrow → dashboard row stacks vertically on mobile with the arrow rotated 90°, grids collapse to one column

## Decisions

- **Palette: the app wins.** The mockup's hexes diverge from `type-colors.ts` on five of seven types — prompt (amber vs purple), command (cyan vs orange), note (green vs yellow), link/URL (indigo vs emerald), file (slate vs gray); only snippet and image match. Use the app's existing type colors so marketing and product agree. This deliberately reverses `homepage-mockup-spec.md`. Introduce no new hex values.

- **Signed-in visitors:** `/` stays public and is never redirected. `page.tsx` calls `auth()`; when a session exists the nav CTAs collapse to a single "Open Dashboard" → `/dashboard`.

- **Theme:** the page follows the app's own theme rather than being forced dark. A route-scoped `dark` wrapper was rejected: the root layout's inline script sets `colorScheme` on `<html>` from `localStorage`, which a wrapper `div` cannot reach, so a light-mode visitor would get a light scrollbar and overscroll gutter against a dark page. Instead the page is built on theme tokens (`bg-background`, `bg-card`, `border-border`, `text-muted-foreground`) with fixed type accents, so it reads correctly in both modes. Logged-out visitors have no stored theme and still default to dark.

## Verification

- No server actions or `lib/db` helpers are added, so per the project's testing scope no Vitest tests are warranted — unless a pure helper is extracted (e.g. the pricing lookup), in which case colocate a `*.test.ts`

- `npm run build` and `npm run lint` clean

- Browser check at desktop and mobile widths: chaos animation and cursor repulsion, reduced-motion fallback, scroll reveal, nav opacity, pricing toggle, every CTA/anchor landing on the right route, console clean

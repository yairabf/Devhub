/**
 * Everything the listing pages need to turn a `?page=` query param into a
 * database window and a set of page links. Pure and framework-free so it can
 * be unit-tested — the rendering component is not, per the project's testing
 * scope.
 */

/** How many numbered links to show before eliding with an ellipsis. */
export const MAX_PAGE_LINKS = 7;

/**
 * One window of a paginated listing, ready to spread into a Prisma query.
 * Both fields are optional because the unpaginated callers (dashboard
 * sections, the search index) pass nothing and expect every row.
 */
export interface PageWindow {
  skip?: number;
  take?: number;
}

export interface Pagination {
  /** The resolved current page, always within `1..pageCount`. */
  page: number;
  /** Always at least 1, so an empty listing still reads as "page 1 of 1". */
  pageCount: number;
  /** Ready to hand to Prisma. */
  skip: number;
  take: number;
  hasPrev: boolean;
  hasNext: boolean;
}

/**
 * `searchParams` hands back a string, an array (when the key is repeated), or
 * nothing. Anything that isn't a positive whole number — including `0`, `-3`,
 * `1.5`, `"abc"` and `Infinity` — falls back to page 1 rather than erroring:
 * a hand-edited URL should show the first page, not a crash.
 */
export function parsePageParam(raw: string | string[] | undefined): number {
  // A repeated `?page=2&page=5` is ambiguous; take the first, matching how
  // the first forwarded hop is taken in `getClientIp`.
  const value = Array.isArray(raw) ? raw[0] : raw;
  if (!value) return 1;

  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1) return 1;
  return parsed;
}

/**
 * Resolves a requested page against a known total. A page past the end clamps
 * to the last page instead of rendering an empty grid — deleting the only
 * item on page 3 should show page 2, not nothing.
 */
export function getPagination(
  requestedPage: number,
  total: number,
  perPage: number,
): Pagination {
  const pageCount = Math.max(1, Math.ceil(total / perPage));
  const page = Math.min(Math.max(1, requestedPage), pageCount);

  return {
    page,
    pageCount,
    skip: (page - 1) * perPage,
    take: perPage,
    hasPrev: page > 1,
    hasNext: page < pageCount,
  };
}

/** An elided gap between two page links. */
export const PAGE_GAP = "gap" as const;

export type PageLink = number | typeof PAGE_GAP;

/**
 * The windowed page numbers to render: always the first and last page, the
 * current page and its neighbours, and a `PAGE_GAP` marker wherever a stretch
 * was skipped. At or below `MAX_PAGE_LINKS` pages every number is shown, so
 * short listings never render an ellipsis.
 *
 * The budget is fixed rather than a parameter — every listing renders the
 * same pager, and an unused knob is a branch no test would cover.
 */
export function getPageLinks(page: number, pageCount: number): PageLink[] {
  if (pageCount <= MAX_PAGE_LINKS) {
    return Array.from({ length: pageCount }, (_, i) => i + 1);
  }

  // Budget: first, last, and up to two gap markers are fixed overhead, so
  // what's left is the window of middle pages centred on the current one.
  const windowSize = MAX_PAGE_LINKS - 4;
  let start = Math.max(2, page - Math.floor(windowSize / 2));
  let end = Math.min(pageCount - 1, start + windowSize - 1);
  // Re-anchor when the window hit the right edge, so it keeps its width
  // instead of collapsing on the last few pages.
  start = Math.max(2, Math.min(start, end - windowSize + 1));

  // A gap hiding a single page is wasted space — it takes the same room as
  // the number it replaces. Absorb that page into the window instead, which
  // costs no extra slot because the gap gives one up.
  if (start === 3) start = 2;
  if (end === pageCount - 2) end = pageCount - 1;

  const links: PageLink[] = [1];
  if (start > 2) links.push(PAGE_GAP);
  for (let n = start; n <= end; n++) links.push(n);
  if (end < pageCount - 1) links.push(PAGE_GAP);
  links.push(pageCount);

  return links;
}

/**
 * Builds the href for a page link. Page 1 gets a bare path so the canonical
 * URL of a listing has no query string.
 */
export function pageHref(basePath: string, page: number): string {
  return page <= 1 ? basePath : `${basePath}?page=${page}`;
}

// `SearchableItem` is `getSearchableItems`' return type, so it lives with the
// query that produces it — same as `SidebarItemType` / `CollectionOption`.
// A type-only import erases at compile time, so this never drags Prisma into
// the client bundle that renders the palette.
import type { SearchableItem } from "@/lib/db/items";

export type { SearchableItem };

/**
 * Unlike items, no db function returns this shape — the layouts project it out
 * of `CollectionCardData` — so it is declared here, with its consumer.
 */
export interface SearchableCollection {
  id: string;
  name: string;
  itemCount: number;
}

export interface SearchIndex {
  items: SearchableItem[];
  collections: SearchableCollection[];
}

/** Results are a filtered index, so they share its shape by construction. */
export type SearchResults = SearchIndex;

const MAX_RESULTS_PER_GROUP = 8;

/**
 * Subsequence match, case-insensitive: every character of `query` must
 * appear in `text` in order, though not necessarily contiguously (so "gsr"
 * matches "Global Search"). Returns a score where lower is a better match —
 * gaps between matched characters and a late first match both add to it —
 * or `null` when `query` does not match at all.
 */
function fuzzyScore(query: string, text: string): number | null {
  const q = query.toLowerCase();
  const t = text.toLowerCase();

  let qi = 0;
  let firstMatchIndex = -1;
  let lastMatchIndex = -1;
  let score = 0;

  for (let ti = 0; ti < t.length && qi < q.length; ti++) {
    if (t[ti] !== q[qi]) continue;

    if (firstMatchIndex === -1) firstMatchIndex = ti;
    if (lastMatchIndex !== -1) score += ti - lastMatchIndex - 1;
    lastMatchIndex = ti;
    qi++;
  }

  if (qi < q.length) return null;
  return score + firstMatchIndex;
}

function rank<T>(
  entries: T[],
  query: string,
  toText: (entry: T) => string,
): T[] {
  const scored: { entry: T; score: number }[] = [];
  for (const entry of entries) {
    const score = fuzzyScore(query, toText(entry));
    if (score !== null) scored.push({ entry, score });
  }
  scored.sort((a, b) => a.score - b.score);
  return scored.map(({ entry }) => entry);
}

/**
 * Searches the pre-fetched index client-side — no server round-trip per
 * keystroke. An empty (or whitespace-only) query returns no results rather
 * than the whole index, so the palette opens without dumping every item.
 */
export function searchIndex(index: SearchIndex, query: string): SearchResults {
  const trimmed = query.trim();
  if (!trimmed) {
    return { items: [], collections: [] };
  }

  return {
    items: rank(
      index.items,
      trimmed,
      item => `${item.title} ${item.preview}`,
    ).slice(0, MAX_RESULTS_PER_GROUP),
    collections: rank(
      index.collections,
      trimmed,
      collection => collection.name,
    ).slice(0, MAX_RESULTS_PER_GROUP),
  };
}

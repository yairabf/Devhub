import type { FavoriteCollectionData } from "@/lib/db/collections";
import type { FavoriteItemData } from "@/lib/db/items";

export type FavoritesSortKey = "date" | "name" | "type";
export type FavoritesSortDirection = "asc" | "desc";

export const FAVORITES_SORT_OPTIONS: { value: FavoritesSortKey; label: string }[] = [
  { value: "date", label: "Date" },
  { value: "name", label: "Name" },
  { value: "type", label: "Item Type" },
];

/** The direction each sort key opens in — newest-first for date, A→Z for name/type. */
export const DEFAULT_SORT_DIRECTION: Record<FavoritesSortKey, FavoritesSortDirection> = {
  date: "desc",
  name: "asc",
  type: "asc",
};

function applyDirection(comparison: number, direction: FavoritesSortDirection): number {
  return direction === "asc" ? comparison : -comparison;
}

export function sortFavoriteItems(
  items: FavoriteItemData[],
  sortKey: FavoritesSortKey,
  direction: FavoritesSortDirection = DEFAULT_SORT_DIRECTION[sortKey],
): FavoriteItemData[] {
  const sorted = [...items];
  if (sortKey === "name") {
    sorted.sort((a, b) => applyDirection(a.title.localeCompare(b.title), direction));
  } else if (sortKey === "type") {
    sorted.sort((a, b) =>
      applyDirection(
        a.itemTypeName.localeCompare(b.itemTypeName) || a.title.localeCompare(b.title),
        direction,
      ),
    );
  } else {
    sorted.sort((a, b) =>
      applyDirection(a.updatedAt.getTime() - b.updatedAt.getTime(), direction),
    );
  }
  return sorted;
}

/**
 * Collections have no item type, so "type" is a no-op here — sorting is
 * scoped to the Items section and the Collections section keeps its
 * existing (date-desc, from the query) order.
 */
export function sortFavoriteCollections(
  collections: FavoriteCollectionData[],
  sortKey: FavoritesSortKey,
  direction: FavoritesSortDirection = DEFAULT_SORT_DIRECTION[sortKey],
): FavoriteCollectionData[] {
  const sorted = [...collections];
  if (sortKey === "name") {
    sorted.sort((a, b) => applyDirection(a.name.localeCompare(b.name), direction));
  } else if (sortKey === "date") {
    sorted.sort((a, b) =>
      applyDirection(a.updatedAt.getTime() - b.updatedAt.getTime(), direction),
    );
  }
  return sorted;
}

/** Human-readable label for the direction toggle button, tailored to the active sort key. */
export function getSortDirectionLabel(
  sortKey: FavoritesSortKey,
  direction: FavoritesSortDirection,
): string {
  if (sortKey === "date") {
    return direction === "desc" ? "Newest first" : "Oldest first";
  }
  return direction === "asc" ? "A to Z" : "Z to A";
}

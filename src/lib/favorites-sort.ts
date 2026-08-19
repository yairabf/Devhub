import type { FavoriteCollectionData } from "@/lib/db/collections";
import type { FavoriteItemData } from "@/lib/db/items";

export type FavoritesSortKey = "date" | "name" | "type";

export const FAVORITES_SORT_OPTIONS: { value: FavoritesSortKey; label: string }[] = [
  { value: "date", label: "Date" },
  { value: "name", label: "Name" },
  { value: "type", label: "Item Type" },
];

export function sortFavoriteItems(
  items: FavoriteItemData[],
  sortKey: FavoritesSortKey,
): FavoriteItemData[] {
  const sorted = [...items];
  if (sortKey === "name") {
    sorted.sort((a, b) => a.title.localeCompare(b.title));
  } else if (sortKey === "type") {
    sorted.sort(
      (a, b) => a.itemTypeName.localeCompare(b.itemTypeName) || a.title.localeCompare(b.title),
    );
  } else {
    sorted.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
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
): FavoriteCollectionData[] {
  const sorted = [...collections];
  if (sortKey === "name") {
    sorted.sort((a, b) => a.name.localeCompare(b.name));
  } else if (sortKey === "date") {
    sorted.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
  }
  return sorted;
}

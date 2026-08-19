"use client";

import { useMemo, useState } from "react";

import { FavoriteCollectionRow } from "@/components/dashboard/FavoriteCollectionRow";
import { FavoriteItemRow } from "@/components/dashboard/FavoriteItemRow";
import { ItemCardTrigger } from "@/components/dashboard/ItemCardTrigger";
import { Select } from "@/components/ui/select";
import type { FavoriteCollectionData } from "@/lib/db/collections";
import type { FavoriteItemData } from "@/lib/db/items";
import {
  FAVORITES_SORT_OPTIONS,
  sortFavoriteCollections,
  sortFavoriteItems,
  type FavoritesSortKey,
} from "@/lib/favorites-sort";

const ROW_TRIGGER_CLASS =
  "block cursor-pointer outline-none focus-visible:ring-1 focus-visible:ring-ring/50";

interface FavoritesListProps {
  items: FavoriteItemData[];
  collections: FavoriteCollectionData[];
}

function FavoritesSection({
  title,
  count,
  children,
}: {
  title: string;
  count: number;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="mb-2 flex items-baseline gap-2 text-sm font-semibold text-foreground">
        {title}
        <span className="font-mono text-xs font-normal text-muted-foreground">
          ({count})
        </span>
      </h2>
      <div className="font-mono">{children}</div>
    </section>
  );
}

/** Owns the sort state so `/favorites` can stay a server component for the initial fetch. */
export function FavoritesList({ items, collections }: FavoritesListProps) {
  const [sortKey, setSortKey] = useState<FavoritesSortKey>("date");

  const sortedItems = useMemo(() => sortFavoriteItems(items, sortKey), [items, sortKey]);
  const sortedCollections = useMemo(
    () => sortFavoriteCollections(collections, sortKey),
    [collections, sortKey],
  );

  const isEmpty = items.length === 0 && collections.length === 0;

  if (isEmpty) {
    return (
      <p className="text-sm text-muted-foreground">
        No favorites yet — star an item or collection to see it here.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-end gap-2">
        <label htmlFor="favorites-sort" className="text-xs font-medium text-muted-foreground">
          Sort by
        </label>
        <Select
          id="favorites-sort"
          className="w-auto"
          value={sortKey}
          onChange={event => setSortKey(event.target.value as FavoritesSortKey)}
        >
          {FAVORITES_SORT_OPTIONS.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
      </div>

      <div className="space-y-8">
        {sortedItems.length > 0 && (
          <FavoritesSection title="Items" count={sortedItems.length}>
            {sortedItems.map(item => (
              <ItemCardTrigger
                key={item.id}
                itemId={item.id}
                title={item.title}
                className={ROW_TRIGGER_CLASS}
              >
                <FavoriteItemRow item={item} />
              </ItemCardTrigger>
            ))}
          </FavoritesSection>
        )}

        {sortedCollections.length > 0 && (
          <FavoritesSection title="Collections" count={sortedCollections.length}>
            {sortedCollections.map(collection => (
              <FavoriteCollectionRow key={collection.id} collection={collection} />
            ))}
          </FavoritesSection>
        )}
      </div>
    </div>
  );
}

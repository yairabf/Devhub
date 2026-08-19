"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import {
  ItemDrawer,
  type ItemDrawerErrorState,
} from "@/components/dashboard/ItemDrawer";
import { ItemDrawerContextProvider } from "@/components/dashboard/ItemDrawerContext";
import type { CollectionOption } from "@/lib/db/collections";
import type { ItemDetailData, ItemFlagPatch } from "@/lib/db/items";

const GENERIC_ERROR: ItemDrawerErrorState = {
  title: "Something went wrong",
  message: "Could not load this item.",
};

/**
 * A 404 here is usually a card the user just deleted whose list has not
 * re-rendered yet, so it gets its own copy rather than the failure wording.
 */
const MISSING_ERROR: ItemDrawerErrorState = {
  title: "Item unavailable",
  message: "This item no longer exists — it may have been deleted.",
};

/** Shape of the `GET /api/items/[id]` envelope. */
interface ItemDetailResponse {
  success: boolean;
  item?: ItemDetailData;
  error?: string;
}

interface ItemDrawerProviderProps {
  children: React.ReactNode;
  /** The user's collections, threaded to the edit form's Collections picker. */
  collectionOptions: CollectionOption[];
}

export function ItemDrawerProvider({
  children,
  collectionOptions,
}: ItemDrawerProviderProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [item, setItem] = useState<ItemDetailData | null>(null);
  const [error, setError] = useState<ItemDrawerErrorState | null>(null);
  const [editing, setEditing] = useState(false);

  // Details already fetched this session — reopening an item is instant.
  const cache = useRef(new Map<string, ItemDetailData>());
  // Id of the item the drawer is currently showing; guards against a slow
  // response for item A landing after the user has already opened item B.
  const currentId = useRef<string | null>(null);

  const fetchDetail = useCallback(async (itemId: string) => {
    try {
      const response = await fetch(
        `/api/items/${encodeURIComponent(itemId)}`,
      );
      // Re-checked after every await: each one is a fresh chance for the user
      // to have opened a different item in the meantime.
      if (currentId.current !== itemId) return;

      // Before parsing: the 404 path never reads the body, and a 404 from
      // somewhere other than this route may not carry JSON at all.
      if (response.status === 404) {
        setError(MISSING_ERROR);
        return;
      }

      const payload = (await response.json()) as ItemDetailResponse;
      if (currentId.current !== itemId) return;

      if (!response.ok || !payload.item) {
        setError(
          payload.error
            ? { ...GENERIC_ERROR, message: payload.error }
            : GENERIC_ERROR,
        );
        return;
      }

      cache.current.set(itemId, payload.item);
      setItem(payload.item);
    } catch {
      if (currentId.current !== itemId) return;
      setError(GENERIC_ERROR);
    }
  }, []);

  const openItem = useCallback(
    (itemId: string) => {
      currentId.current = itemId;
      setError(null);
      setEditing(false);
      setOpen(true);

      const cached = cache.current.get(itemId);
      if (cached) {
        setItem(cached);
        return;
      }

      setItem(null);
      void fetchDetail(itemId);
    },
    [fetchDetail],
  );

  const handleOpenChange = useCallback((next: boolean) => {
    setOpen(next);
    if (!next) {
      currentId.current = null;
      setEditing(false);
    }
    // The item is intentionally kept so the closing animation doesn't flash empty.
  }, []);

  const handleSaved = useCallback(
    (updated: ItemDetailData) => {
      // Replace the cache entry too, or reopening would show pre-edit values.
      cache.current.set(updated.id, updated);
      setItem(updated);
      setEditing(false);
      // Refresh the server-rendered card lists behind the drawer.
      router.refresh();
    },
    [router],
  );

  /**
   * A favorite/pin toggle mutates one boolean behind the drawer's back. Patch it
   * into both copies of the detail rather than evicting: the toggle button owns
   * its own optimistic state only while mounted, and `ItemViewMode` unmounts
   * entirely while editing — so on cancel the action bar remounts straight from
   * `item`, and a stale flag there would offer to pin an already-pinned item.
   * Patching fixes that and keeps the cached reopen instant.
   *
   * Published on the context rather than passed down, so a toggle from a card or
   * a `/favorites` row reaches it too. Those are server components and cannot
   * hand a callback to the star they render.
   */
  const handleFlagToggled = useCallback(
    (itemId: string, patch: ItemFlagPatch) => {
      const cached = cache.current.get(itemId);
      if (cached) cache.current.set(itemId, { ...cached, ...patch });
      // Id-guarded: the user may have opened a different item by now.
      setItem(current =>
        current?.id === itemId ? { ...current, ...patch } : current,
      );
    },
    [],
  );

  const handleDeleted = useCallback(
    (itemId: string) => {
      // Evict, don't replace: a stale cache entry would let openItem render a
      // ghost of the deleted item without ever refetching.
      cache.current.delete(itemId);
      currentId.current = null;
      setEditing(false);
      setOpen(false);
      // Refresh the server-rendered card lists behind the drawer.
      router.refresh();
    },
    [router],
  );

  // Stable value: otherwise every card trigger re-renders when the drawer opens.
  // Both callbacks are `useCallback`'d with stable deps, so it holds.
  const contextValue = useMemo(
    () => ({ openItem, notifyFlagToggled: handleFlagToggled }),
    [openItem, handleFlagToggled],
  );

  return (
    <ItemDrawerContextProvider value={contextValue}>
      {children}
      <ItemDrawer
        open={open}
        onOpenChange={handleOpenChange}
        item={item}
        error={error}
        editing={editing}
        collectionOptions={collectionOptions}
        onEdit={() => setEditing(true)}
        onCancelEdit={() => setEditing(false)}
        onSaved={handleSaved}
        onDeleted={handleDeleted}
      />
    </ItemDrawerContextProvider>
  );
}

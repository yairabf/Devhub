"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";

import {
  ItemDrawer,
  type ItemDrawerErrorState,
} from "@/components/dashboard/ItemDrawer";
import type { ItemDetailData } from "@/lib/db/items";

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

interface ItemDrawerContextValue {
  openItem: (itemId: string) => void;
}

/** Shape of the `GET /api/items/[id]` envelope. */
interface ItemDetailResponse {
  success: boolean;
  item?: ItemDetailData;
  error?: string;
}

const ItemDrawerContext = createContext<ItemDrawerContextValue | null>(null);

export function useItemDrawer(): ItemDrawerContextValue {
  const context = useContext(ItemDrawerContext);
  if (!context) {
    throw new Error("useItemDrawer must be used inside an ItemDrawerProvider");
  }
  return context;
}

export function ItemDrawerProvider({ children }: { children: React.ReactNode }) {
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
  const contextValue = useMemo(() => ({ openItem }), [openItem]);

  return (
    <ItemDrawerContext.Provider value={contextValue}>
      {children}
      <ItemDrawer
        open={open}
        onOpenChange={handleOpenChange}
        item={item}
        error={error}
        editing={editing}
        onEdit={() => setEditing(true)}
        onCancelEdit={() => setEditing(false)}
        onSaved={handleSaved}
        onDeleted={handleDeleted}
      />
    </ItemDrawerContext.Provider>
  );
}

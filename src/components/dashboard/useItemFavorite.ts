"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { toggleItemFavorite } from "@/actions/items";
import type { ItemFlagPatch } from "@/lib/db/items";

/**
 * Optimistic favorite toggle for an item, shared by the card grid and the
 * drawer. Resyncs from `isFavorite` whenever it changes — e.g. a
 * `router.refresh()` triggered by a toggle elsewhere landing on this live
 * instance — via the render-time "adjust state" pattern rather than an
 * effect, since this is deriving state from a prop, not synchronizing with
 * an external system.
 *
 * `onToggled` lets the drawer fold the new value into the detail it is holding,
 * so neither reopening nor cancelling an edit replays a pre-toggle
 * `isFavorite` prop.
 */
export function useItemFavorite(
  itemId: string,
  isFavorite: boolean,
  onToggled?: (itemId: string, patch: ItemFlagPatch) => void,
) {
  const router = useRouter();
  const [favorite, setFavorite] = useState(isFavorite);
  const [prevIsFavorite, setPrevIsFavorite] = useState(isFavorite);
  const [pending, startTransition] = useTransition();

  if (isFavorite !== prevIsFavorite) {
    setPrevIsFavorite(isFavorite);
    setFavorite(isFavorite);
  }

  function toggle() {
    const next = !favorite;
    setFavorite(next);

    startTransition(async () => {
      const result = await toggleItemFavorite(itemId);
      if (!result.success) {
        setFavorite(!next);
        toast.error(result.error);
        return;
      }
      setFavorite(result.data.isFavorite);
      onToggled?.(itemId, {
        isFavorite: result.data.isFavorite,
        updatedAt: result.data.updatedAt,
      });
      router.refresh();
    });
  }

  return { favorite, toggle, pending };
}

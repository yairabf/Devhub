"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { toggleItemFavorite } from "@/actions/items";
import { useItemFlagSync } from "@/components/dashboard/ItemDrawerContext";

/**
 * Optimistic favorite toggle for an item, shared by the card grid and the
 * drawer. Resyncs from `isFavorite` whenever it changes — e.g. a
 * `router.refresh()` triggered by a toggle elsewhere landing on this live
 * instance — via the render-time "adjust state" pattern rather than an
 * effect, since this is deriving state from a prop, not synchronizing with
 * an external system.
 *
 * The drawer's flag sync comes from context, not a prop: it lets the drawer fold
 * the new value into the detail it is holding, so neither reopening nor
 * cancelling an edit replays a pre-toggle `isFavorite`. It has to be context
 * because `ItemCard` and `FavoriteItemRow` are server components — they render
 * the star but cannot hand it a callback.
 */
export function useItemFavorite(itemId: string, isFavorite: boolean) {
  const router = useRouter();
  const notifyFlagToggled = useItemFlagSync();
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
      notifyFlagToggled?.(itemId, {
        isFavorite: result.data.isFavorite,
        updatedAt: result.data.updatedAt,
      });
      router.refresh();
    });
  }

  return { favorite, toggle, pending };
}

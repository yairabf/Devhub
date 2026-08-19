"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { toggleCollectionFavorite } from "@/actions/collections";

/**
 * Optimistic favorite toggle for a collection, shared by the card, the card's
 * dropdown menu, and the detail page header. Resyncs from `isFavorite`
 * whenever it changes — e.g. a `router.refresh()` triggered by a toggle on
 * any of those surfaces landing on this live instance — via the render-time
 * "adjust state" pattern rather than an effect, since this is deriving state
 * from a prop, not synchronizing with an external system.
 */
export function useCollectionFavorite(collectionId: string, isFavorite: boolean) {
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
      const result = await toggleCollectionFavorite(collectionId);
      if (!result.success) {
        setFavorite(!next);
        toast.error(result.error);
        return;
      }
      setFavorite(result.data.isFavorite);
      router.refresh();
    });
  }

  return { favorite, toggle, pending };
}

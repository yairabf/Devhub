"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { toggleItemPin } from "@/actions/items";
import { useItemFlagSync } from "@/components/dashboard/ItemDrawerContext";

/**
 * Optimistic pin toggle for an item. Shaped like `useItemFavorite`, with one
 * deliberate difference: it toasts on success as well as failure, per the
 * feature spec. Favorite is silent on success; pinning moves the item to the top
 * of listings the user may not be looking at, so the confirmation earns its
 * keep.
 *
 * It shares the drawer's flag sync from context, which folds the new value into
 * the detail the drawer is holding. Without it, both closing/reopening and
 * cancelling an edit replay a pre-toggle `isPinned` prop, and the adjust-state
 * path below flips the icon back.
 */
export function useItemPin(itemId: string, isPinned: boolean) {
  const router = useRouter();
  const notifyFlagToggled = useItemFlagSync();
  const [pinned, setPinned] = useState(isPinned);
  const [prevIsPinned, setPrevIsPinned] = useState(isPinned);
  const [pending, startTransition] = useTransition();

  // Resync from the prop when it changes — e.g. a `router.refresh()` from a
  // toggle elsewhere landing on this live instance. Render-time "adjust state"
  // rather than an effect, since this derives state from a prop.
  if (isPinned !== prevIsPinned) {
    setPrevIsPinned(isPinned);
    setPinned(isPinned);
  }

  function toggle() {
    const next = !pinned;
    setPinned(next);

    startTransition(async () => {
      const result = await toggleItemPin(itemId);
      if (!result.success) {
        setPinned(!next);
        toast.error(result.error);
        return;
      }
      setPinned(result.data.isPinned);
      toast.success(result.data.isPinned ? "Item pinned" : "Item unpinned");
      notifyFlagToggled?.(itemId, {
        isPinned: result.data.isPinned,
        updatedAt: result.data.updatedAt,
      });
      router.refresh();
    });
  }

  return { pinned, toggle, pending };
}

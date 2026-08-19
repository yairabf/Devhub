"use client";

import { createContext, useContext } from "react";

import type { ItemFlagPatch } from "@/lib/db/items";

export interface ItemDrawerContextValue {
  openItem: (itemId: string) => void;
  /**
   * Folds a flag mutation made outside the drawer into the detail the provider
   * is holding — both the live state and the session cache.
   */
  notifyFlagToggled: (itemId: string, patch: ItemFlagPatch) => void;
}

/**
 * Lives in its own module rather than beside the provider to keep the import
 * graph acyclic: `ItemDrawerProvider` renders `ItemDrawer`, which renders the
 * flag buttons, whose hooks need this context. Importing it from the provider
 * would close that loop. (Same reason `ItemFlagPatch` sits in `lib/db/items`.)
 */
const ItemDrawerContext = createContext<ItemDrawerContextValue | null>(null);

export const ItemDrawerContextProvider = ItemDrawerContext.Provider;

/** Throws outside a provider: opening an item with no drawer is a wiring bug. */
export function useItemDrawer(): ItemDrawerContextValue {
  const context = useContext(ItemDrawerContext);
  if (!context) {
    throw new Error("useItemDrawer must be used inside an ItemDrawerProvider");
  }
  return context;
}

/**
 * The flag-sync callback, or `undefined` when there is no drawer to keep in
 * sync. Deliberately non-throwing, unlike `useItemDrawer`: a favourite star is
 * a self-contained control that must keep working on a surface rendered outside
 * `DashboardShell`. There is simply nothing to patch there.
 */
export function useItemFlagSync():
  | ItemDrawerContextValue["notifyFlagToggled"]
  | undefined {
  return useContext(ItemDrawerContext)?.notifyFlagToggled;
}

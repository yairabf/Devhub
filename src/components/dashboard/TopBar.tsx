"use client";

import { Menu, Search, Star } from "lucide-react";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { NewCollectionDialog } from "@/components/dashboard/NewCollectionDialog";
import { NewItemDialog } from "@/components/dashboard/NewItemDialog";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import type { CollectionOption } from "@/lib/db/collections";
import type { SidebarItemType } from "@/lib/db/items";
import { cn } from "@/lib/utils";

interface TopBarProps {
  onOpenDrawer: () => void;
  onOpenSearch: () => void;
  itemTypes: SidebarItemType[];
  collectionOptions: CollectionOption[];
}

export function TopBar({
  onOpenDrawer,
  onOpenSearch,
  itemTypes,
  collectionOptions,
}: TopBarProps) {
  return (
    <header className="flex items-center justify-between gap-4 border-b border-border bg-background px-4 py-3 md:px-6">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={onOpenDrawer}
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </Button>
        <button
          type="button"
          onClick={onOpenSearch}
          className="relative flex w-full max-w-sm items-center rounded-md border border-input bg-transparent py-2 pl-9 pr-2 text-sm text-muted-foreground shadow-xs transition-colors hover:border-ring/50 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
        >
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <span className="flex-1 truncate text-left">Search...</span>
          <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px] font-medium text-muted-foreground">
            ⌘K
          </kbd>
        </button>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {/*
          A styled <Link>, not a <Button render={<Link/>}>: base-ui's useButton
          merges role="button" onto whatever it renders, which would override the
          anchor's link role and hide the fact that this navigates.
        */}
        <Link
          href="/favorites"
          aria-label="Favorites"
          title="Favorites"
          className={cn(
            buttonVariants({ variant: "ghost", size: "icon" }),
            "text-muted-foreground hover:text-foreground",
          )}
        >
          <Star className="h-4 w-4" />
        </Link>
        <ThemeToggle />
        <NewCollectionDialog />
        <NewItemDialog itemTypes={itemTypes} collectionOptions={collectionOptions} />
      </div>
    </header>
  );
}

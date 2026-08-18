"use client";

import { useEffect, useState } from "react";
import { CommandPalette } from "./CommandPalette";
import { ItemDrawerProvider } from "./ItemDrawerProvider";
import { TopBar } from "./TopBar";
import { Sidebar, type SidebarData } from "./Sidebar";
import type { UserMenuUser } from "./UserMenu";
import type { CollectionOption } from "@/lib/db/collections";
import type { SearchIndex } from "@/lib/search";

interface DashboardShellProps {
  children: React.ReactNode;
  sidebarData: SidebarData;
  /** The user's collections, threaded to the New Item dialog and edit form pickers. */
  collectionOptions: CollectionOption[];
  /** Pre-fetched items + collections, searched client-side by the command palette. */
  searchIndex: SearchIndex;
  user: UserMenuUser;
}

export function DashboardShell({
  children,
  sidebarData,
  collectionOptions,
  searchIndex,
  user,
}: DashboardShellProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);

  // Capture phase so this beats Monaco's own Cmd+K chord handling.
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key.toLowerCase() !== "k" || !(event.metaKey || event.ctrlKey)) {
        return;
      }
      event.preventDefault();
      setPaletteOpen(true);
    }
    document.addEventListener("keydown", handleKeyDown, true);
    return () => document.removeEventListener("keydown", handleKeyDown, true);
  }, []);

  return (
    <ItemDrawerProvider collectionOptions={collectionOptions}>
      <div className="flex h-full flex-col">
        <TopBar
          onOpenDrawer={() => setDrawerOpen(true)}
          onOpenSearch={() => setPaletteOpen(true)}
          itemTypes={sidebarData.itemTypes}
          collectionOptions={collectionOptions}
        />
        <div className="flex flex-1 overflow-hidden">
          <Sidebar
            collapsed={collapsed}
            drawerOpen={drawerOpen}
            onDrawerOpenChange={setDrawerOpen}
            onToggleCollapsed={() => setCollapsed(c => !c)}
            data={sidebarData}
            user={user}
          />
          <main className="flex-1 overflow-auto bg-background p-6">
            {children}
          </main>
        </div>
      </div>
      <CommandPalette
        open={paletteOpen}
        onOpenChange={setPaletteOpen}
        searchIndex={searchIndex}
      />
    </ItemDrawerProvider>
  );
}

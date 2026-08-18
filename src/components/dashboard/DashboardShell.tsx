"use client";

import { useState } from "react";
import { ItemDrawerProvider } from "./ItemDrawerProvider";
import { TopBar } from "./TopBar";
import { Sidebar, type SidebarData } from "./Sidebar";
import type { UserMenuUser } from "./UserMenu";
import type { CollectionOption } from "@/lib/db/collections";

interface DashboardShellProps {
  children: React.ReactNode;
  sidebarData: SidebarData;
  /** The user's collections, threaded to the New Item dialog and edit form pickers. */
  collectionOptions: CollectionOption[];
  user: UserMenuUser;
}

export function DashboardShell({
  children,
  sidebarData,
  collectionOptions,
  user,
}: DashboardShellProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <ItemDrawerProvider collectionOptions={collectionOptions}>
      <div className="flex h-full flex-col">
        <TopBar
          onOpenDrawer={() => setDrawerOpen(true)}
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
    </ItemDrawerProvider>
  );
}

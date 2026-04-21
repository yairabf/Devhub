"use client";

import { useState } from "react";
import { TopBar } from "./TopBar";
import { Sidebar, type SidebarData } from "./Sidebar";
import type { UserMenuUser } from "./UserMenu";

interface DashboardShellProps {
  children: React.ReactNode;
  sidebarData: SidebarData;
  user: UserMenuUser;
}

export function DashboardShell({ children, sidebarData, user }: DashboardShellProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div className="flex h-full flex-col">
      <TopBar onOpenDrawer={() => setDrawerOpen(true)} />
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
  );
}

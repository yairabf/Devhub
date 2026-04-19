"use client";

import { Clock, Heart, LayoutGrid } from "lucide-react";
import { SidebarLink } from "./SidebarLink";

interface SidebarNavProps {
  collapsed: boolean;
}

const NAV_ITEMS = [
  { href: "/dashboard", icon: <LayoutGrid className="h-4 w-4" />, label: "All Items" },
  { href: "/dashboard/favorites", icon: <Heart className="h-4 w-4" />, label: "Favorites" },
  { href: "/dashboard/recent", icon: <Clock className="h-4 w-4" />, label: "Recent" },
] as const;

export function SidebarNav({ collapsed }: SidebarNavProps) {
  return (
    <div className="space-y-0.5">
      {NAV_ITEMS.map(item => (
        <SidebarLink key={item.href} {...item} collapsed={collapsed} />
      ))}
    </div>
  );
}

import { Heart, LayoutGrid } from "lucide-react";
import { SidebarLink } from "./SidebarLink";

interface SidebarNavProps {
  collapsed: boolean;
}

/**
 * Every href here must resolve. A dead entry is not just a broken click: Next
 * prefetches it on every render of any page carrying the sidebar, so a "Recent"
 * link pointing at the non-existent /dashboard/recent produced a console 404 per
 * page load. Building that route is tracked separately.
 */
const NAV_ITEMS = [
  { href: "/dashboard", icon: <LayoutGrid className="h-4 w-4" />, label: "All Items" },
  { href: "/favorites", icon: <Heart className="h-4 w-4" />, label: "Favorites" },
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

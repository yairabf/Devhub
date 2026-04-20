"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface SidebarLinkProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  collapsed: boolean;
  trailingIcon?: React.ReactNode;
}

export function SidebarLink({ href, icon, label, collapsed, trailingIcon }: SidebarLinkProps) {
  const pathname = usePathname();
  const isActive = pathname === href;

  const linkEl = (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-1.5 text-sm transition-colors",
        "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
        isActive && "bg-sidebar-accent text-sidebar-accent-foreground font-medium",
        collapsed && "justify-center"
      )}
    >
      <span className="shrink-0 leading-none">{icon}</span>
      {!collapsed && (
        <>
          <span className="flex-1 truncate">{label}</span>
          {trailingIcon}
        </>
      )}
    </Link>
  );

  if (!collapsed) return linkEl;

  return (
    <Tooltip>
      <TooltipTrigger render={<span className="block" />}>
        {linkEl}
      </TooltipTrigger>
      <TooltipContent side="right">{label}</TooltipContent>
    </Tooltip>
  );
}

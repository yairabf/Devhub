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
      {/*
        Always rendered — visually hidden when collapsed rather than dropped.
        It is the link's only accessible name in that state, and the tooltip
        cannot supply one: a tooltip contributes a *description*, and base-ui
        puts its aria wiring on the trigger element, not on this anchor.
      */}
      <span className={cn("flex-1 truncate", collapsed && "sr-only")}>
        {label}
      </span>
      {!collapsed && trailingIcon}
    </Link>
  );

  if (!collapsed) return linkEl;

  // The trigger renders *as* the anchor, so the tooltip's aria wiring lands on
  // the link instead of on a wrapper span that nothing else refers to.
  return (
    <Tooltip>
      <TooltipTrigger render={linkEl} />
      <TooltipContent side="right">{label}</TooltipContent>
    </Tooltip>
  );
}

"use client";

import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CollapsibleSectionId } from "./useCollapsedSections";

interface SidebarSectionProps {
  sectionId: CollapsibleSectionId;
  title: string;
  sidebarCollapsed: boolean;
  collapsed: boolean;
  onToggle: (sectionId: CollapsibleSectionId) => void;
  children: React.ReactNode;
}

export function SidebarSection({
  sectionId,
  title,
  sidebarCollapsed,
  collapsed,
  onToggle,
  children,
}: SidebarSectionProps) {
  if (sidebarCollapsed) {
    return <div className="space-y-0.5">{children}</div>;
  }

  const panelId = `sidebar-section-${sectionId}`;
  const expanded = !collapsed;

  return (
    <div className="space-y-0.5">
      <button
        type="button"
        onClick={() => onToggle(sectionId)}
        aria-expanded={expanded}
        aria-controls={panelId}
        className="flex w-full items-center justify-between gap-2 px-3 pb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-sidebar-foreground transition-colors"
      >
        <span>{title}</span>
        <ChevronRight
          className={cn(
            "h-3.5 w-3.5 transition-transform duration-200 ease-out",
            expanded && "rotate-90"
          )}
        />
      </button>
      <div
        id={panelId}
        inert={!expanded}
        className={cn(
          "grid transition-[grid-template-rows] duration-200 ease-out",
          expanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        )}
      >
        <div className="overflow-hidden">{children}</div>
      </div>
    </div>
  );
}

"use client";

import { Settings } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { CURRENT_USER } from "@/lib/mock-data";
import { getInitials } from "@/lib/format";
import { cn } from "@/lib/utils";

interface UserMenuProps {
  collapsed: boolean;
}

export function UserMenu({ collapsed }: UserMenuProps) {
  const initials = getInitials(CURRENT_USER.name);

  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-lg px-2 py-2 text-sm transition-colors hover:bg-sidebar-accent cursor-pointer",
        collapsed && "justify-center"
      )}
    >
      <Avatar size="sm">
        <AvatarFallback>{initials}</AvatarFallback>
      </Avatar>
      {!collapsed && (
        <>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sidebar-foreground truncate">{CURRENT_USER.name}</p>
            <p className="text-xs text-muted-foreground truncate">{CURRENT_USER.email}</p>
          </div>
          <Settings className="h-4 w-4 text-muted-foreground shrink-0" />
        </>
      )}
    </div>
  );
}

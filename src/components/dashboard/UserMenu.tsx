"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronUp, LogOut, User } from "lucide-react";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";
import { UserAvatar } from "./UserAvatar";

export interface UserMenuUser {
  name: string | null;
  email: string | null;
  image?: string | null;
}

interface UserMenuProps {
  collapsed: boolean;
  user: UserMenuUser;
}

export function UserMenu({ collapsed, user }: UserMenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative">
      {/* Dropdown menu — opens upward */}
      {open && (
        <div className="absolute bottom-full left-0 right-0 mb-1 rounded-lg border border-sidebar-border bg-sidebar shadow-lg z-50">
          <div className="px-3 py-2 border-b border-sidebar-border">
            <p className="text-sm font-medium text-sidebar-foreground truncate">
              {user.name ?? "User"}
            </p>
            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
          </div>
          <div className="p-1">
            <Link
              href="/profile"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
            >
              <User className="h-4 w-4" />
              Profile
            </Link>
            <button
              onClick={() => signOut({ callbackUrl: "/sign-in" })}
              className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm text-destructive hover:bg-destructive/10 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </div>
        </div>
      )}

      {/* Trigger row */}
      <button
        onClick={() => setOpen(o => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        className={cn(
          "flex w-full items-center gap-3 rounded-lg px-2 py-2 text-sm transition-colors hover:bg-sidebar-accent",
          collapsed && "justify-center"
        )}
      >
        <UserAvatar name={user.name} image={user.image} size="sm" />
        {!collapsed && (
          <>
            <div className="flex-1 min-w-0 text-left">
              <p className="font-medium text-sidebar-foreground truncate">
                {user.name ?? "User"}
              </p>
              <p className="text-xs text-muted-foreground truncate">{user.email}</p>
            </div>
            <ChevronUp
              className={cn(
                "h-4 w-4 text-muted-foreground shrink-0 transition-transform duration-150",
                !open && "rotate-180"
              )}
            />
          </>
        )}
      </button>
    </div>
  );
}

"use client";

import { FolderPlus, Menu, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface TopBarProps {
  onOpenDrawer: () => void;
}

export function TopBar({ onOpenDrawer }: TopBarProps) {
  return (
    <header className="flex items-center justify-between gap-4 border-b border-border bg-background px-4 py-3 md:px-6">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={onOpenDrawer}
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </Button>
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search..." className="pl-9" />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="outline" className="hidden sm:inline-flex">
          <FolderPlus className="mr-2 h-4 w-4" />
          New Collection
        </Button>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New Item
        </Button>
      </div>
    </header>
  );
}

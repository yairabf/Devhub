"use client";

import { Menu } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import type { HomeViewer } from "@/lib/home-cta";
import { NAV_LINKS } from "@/lib/home-content";

/**
 * Below `md` the desktop nav is hidden, which previously left Features and
 * Pricing with no route to them at all — the only remaining copies were in the
 * footer, thousands of pixels down the page.
 */
export function MobileNav({ viewer }: { viewer: HomeViewer }) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden"
        aria-label="Open menu"
        onClick={() => setOpen(true)}
      >
        <Menu className="h-5 w-5" />
      </Button>
      {/* `!w-64`: the primitive's own `data-[side=right]:w-3/4` otherwise wins,
          same override Sidebar uses for its drawer. */}
      <SheetContent side="right" className="!w-64 gap-0">
        <SheetHeader>
          <SheetTitle>Menu</SheetTitle>
        </SheetHeader>
        <nav className="flex flex-col px-4 pb-4">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="rounded-md px-2 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
          {!viewer.isSignedIn && (
            <Link
              href="/sign-in"
              onClick={() => setOpen(false)}
              className="rounded-md px-2 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              Sign In
            </Link>
          )}
        </nav>
      </SheetContent>
    </Sheet>
  );
}

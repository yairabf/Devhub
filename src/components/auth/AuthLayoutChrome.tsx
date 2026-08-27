"use client";

import { useSelectedLayoutSegment } from "next/navigation";

import { SiteNav } from "@/components/home/SiteNav";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import type { HomeViewer } from "@/lib/home-cta";

const NAV_ROUTES = new Set(["sign-in", "register"]);

interface AuthLayoutChromeProps {
  children: React.ReactNode;
  viewer: HomeViewer;
}

export function AuthLayoutChrome({ children, viewer }: AuthLayoutChromeProps) {
  const segment = useSelectedLayoutSegment();

  if (!segment || !NAV_ROUTES.has(segment)) {
    return (
      <div className="relative flex min-h-full items-center justify-center bg-background px-4 py-12">
        {/*
          forgot-password / reset-password / verify-email don't carry the full
          marketing nav (no Features/Pricing/Sign In context makes sense here),
          but a visitor stuck on these pages still needs a way to change theme.
        */}
        <div className="absolute top-4 right-4">
          <ThemeToggle />
        </div>
        {children}
      </div>
    );
  }

  return (
    <div className="home-root min-h-full bg-background">
      <SiteNav viewer={viewer} />
      <main className="flex min-h-full items-center justify-center px-4 py-24">
        {children}
      </main>
    </div>
  );
}

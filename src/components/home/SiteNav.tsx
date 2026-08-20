"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { CtaLink } from "@/components/home/CtaLink";
import { Logo } from "@/components/home/Logo";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { label: "Features", href: "#features" },
  { label: "Pricing", href: "#pricing" },
];

export function SiteNav({ isSignedIn }: { isSignedIn: boolean }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const sync = () => setScrolled(window.scrollY > 24);
    sync();
    window.addEventListener("scroll", sync, { passive: true });
    return () => window.removeEventListener("scroll", sync);
  }, []);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 border-b border-transparent backdrop-blur-sm transition-all duration-300",
        scrolled
          ? "border-border bg-background/90 shadow-lg shadow-black/20 backdrop-blur-xl"
          : "bg-background/35",
      )}
    >
      <div className="mx-auto flex h-16 w-full max-w-[1180px] items-center gap-7 px-4 sm:px-6">
        <Logo />
        <nav className="mr-auto ml-3 hidden gap-6 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-2.5 md:ml-0">
          {isSignedIn ? (
            <CtaLink href="/dashboard">Open Dashboard</CtaLink>
          ) : (
            <>
              <CtaLink href="/sign-in" variant="ghost">
                Sign In
              </CtaLink>
              <CtaLink href="/register">Get Started</CtaLink>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

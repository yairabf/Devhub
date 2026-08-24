import Link from "next/link";
import { Folder } from "lucide-react";

import { PRIMARY_SURFACE } from "@/components/home/CtaLink";
import { cn } from "@/lib/utils";

export function LogoMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "grid size-7 shrink-0 place-items-center rounded-lg border",
        PRIMARY_SURFACE,
        className,
      )}
    >
      <Folder className="size-4" aria-hidden />
    </span>
  );
}

export function Logo({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      className={cn(
        "inline-flex items-center gap-2 font-bold tracking-tight",
        className,
      )}
    >
      {/* The mark wears the same surface as the primary action, not its own hue. */}
      <LogoMark />
      {/* Tonal wordmark — the emphasis step matches the headings, no accent colour. */}
      <span className="text-[17px] text-foreground">
        Dev<span className="text-muted-foreground">Hub</span>
      </span>
    </Link>
  );
}

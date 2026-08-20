import Link from "next/link";

import { PRIMARY_SURFACE } from "@/components/home/CtaLink";
import { cn } from "@/lib/utils";

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
      <span
        className={cn(
          "grid size-7 place-items-center rounded-lg border font-mono text-[11px] font-bold",
          PRIMARY_SURFACE,
        )}
      >
        &lt;/&gt;
      </span>
      {/* Tonal wordmark — the emphasis step matches the headings, no accent colour. */}
      <span className="text-[17px] text-foreground">
        Dev<span className="text-muted-foreground">Hub</span>
      </span>
    </Link>
  );
}

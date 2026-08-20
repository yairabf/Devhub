import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * The one graphite surface every primary affordance shares — CTAs, the logo mark,
 * the pricing badge. Shared so they cannot drift into separate accent colours.
 */
export const PRIMARY_SURFACE =
  "border-neutral-700/60 bg-neutral-900 text-neutral-50 dark:border-neutral-600/70 dark:bg-neutral-800";

/**
 * Each CTA style sits on the matching `buttonVariants` variant, not on one shared
 * base — basing everything on `outline` leaked its border and background onto the
 * ghost link, so the signed-out "Sign In" rendered as an outlined button.
 */
const CTA_BASE_VARIANT = {
  primary: "default",
  outline: "outline",
  ghost: "ghost",
} as const;

const CTA_DECORATION = {
  primary: cn(
    PRIMARY_SURFACE,
    "shadow-lg shadow-black/25 hover:bg-neutral-800 dark:hover:bg-neutral-700",
  ),
  outline: "hover:border-foreground/30",
  ghost: "text-muted-foreground",
} as const;

const CTA_SIZES = {
  default: "h-9 px-4 text-sm",
  lg: "h-11 px-6 text-[15px]",
} as const;

interface CtaLinkProps {
  href: string;
  children: React.ReactNode;
  variant?: keyof typeof CTA_BASE_VARIANT;
  size?: keyof typeof CTA_SIZES;
  className?: string;
}

/**
 * A link that looks like a button. Deliberately a plain `next/link` styled with
 * `buttonVariants` — `<Button render={<Link/>}>` overrides the anchor's semantics
 * with `role="button"` and warns in the console.
 */
export function CtaLink({
  href,
  children,
  variant = "primary",
  size = "default",
  className,
}: CtaLinkProps) {
  return (
    <Link
      href={href}
      className={cn(
        buttonVariants({ variant: CTA_BASE_VARIANT[variant] }),
        "font-semibold transition-transform hover:-translate-y-0.5",
        CTA_DECORATION[variant],
        CTA_SIZES[size],
        className,
      )}
    >
      {children}
    </Link>
  );
}

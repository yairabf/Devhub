import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { PAGE_GAP, getPageLinks, pageHref } from "@/lib/pagination";
import { cn } from "@/lib/utils";

interface PaginationProps {
  page: number;
  pageCount: number;
  /** The listing's own path, e.g. `/items/snippets` — no query string. */
  basePath: string;
}

const CONTROL_CLASS =
  "flex h-9 min-w-9 items-center justify-center gap-1 rounded-md border border-border px-2 text-sm";

/**
 * Prev/next plus numbered page links, shared by every paginated listing.
 * A server component: these are plain links, so there is nothing to hydrate.
 *
 * Unavailable prev/next render as `<span aria-disabled>` rather than a
 * disabled anchor — there is no such thing as a disabled `<a>`, and an anchor
 * without an `href` is not focusable, so a greyed-out control that still took
 * a tab stop would be the worse of both.
 */
export function Pagination({ page, pageCount, basePath }: PaginationProps) {
  if (pageCount <= 1) return null;

  const links = getPageLinks(page, pageCount);

  return (
    <nav
      aria-label="Pagination"
      className="flex items-center justify-center gap-1 pt-2"
    >
      <PageStep
        direction="prev"
        page={page - 1}
        basePath={basePath}
        enabled={page > 1}
      />

      {links.map((link, index) =>
        link === PAGE_GAP ? (
          <span
            // Position is the only stable identity a gap has.
            key={`gap-${index}`}
            aria-hidden="true"
            className="flex h-9 min-w-9 items-center justify-center text-sm text-muted-foreground"
          >
            …
          </span>
        ) : (
          <Link
            key={link}
            href={pageHref(basePath, link)}
            aria-label={`Page ${link}`}
            aria-current={link === page ? "page" : undefined}
            className={cn(
              CONTROL_CLASS,
              "transition-colors hover:bg-muted",
              link === page &&
                "border-transparent bg-primary font-medium text-primary-foreground hover:bg-primary",
            )}
          >
            {link}
          </Link>
        ),
      )}

      <PageStep
        direction="next"
        page={page + 1}
        basePath={basePath}
        enabled={page < pageCount}
      />
    </nav>
  );
}

function PageStep({
  direction,
  page,
  basePath,
  enabled,
}: {
  direction: "prev" | "next";
  page: number;
  basePath: string;
  enabled: boolean;
}) {
  const isPrev = direction === "prev";
  const label = isPrev ? "Previous page" : "Next page";
  const content = (
    <>
      {isPrev && <ChevronLeft className="h-4 w-4" />}
      <span className="hidden sm:inline">{isPrev ? "Previous" : "Next"}</span>
      {!isPrev && <ChevronRight className="h-4 w-4" />}
    </>
  );

  if (!enabled) {
    return (
      <span
        aria-disabled="true"
        aria-label={label}
        className={cn(
          CONTROL_CLASS,
          "cursor-not-allowed text-muted-foreground opacity-50",
        )}
      >
        {content}
      </span>
    );
  }

  return (
    <Link
      href={pageHref(basePath, page)}
      aria-label={label}
      className={cn(CONTROL_CLASS, "transition-colors hover:bg-muted")}
    >
      {content}
    </Link>
  );
}

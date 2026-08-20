import Link from "next/link";

import { Logo } from "@/components/home/Logo";
import { getFooterColumns, type HomeViewer } from "@/lib/home-cta";

export function SiteFooter({ viewer }: { viewer: HomeViewer }) {
  // Server-rendered: no need for the prototype's client-side year script.
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-card/40 px-4 pt-14 pb-8 sm:px-6">
      <div className="mx-auto w-full max-w-[1180px]">
        <div className="grid gap-10 md:grid-cols-[1.4fr_2fr]">
          <div>
            <Logo />
            <p className="mt-3.5 max-w-xs text-sm text-muted-foreground">
              Notion + Raycast + an AI memory layer — built specifically for
              developers.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-7 sm:grid-cols-3">
            {getFooterColumns(viewer).map((column) => (
              <div key={column.heading} className="flex flex-col gap-2.5">
                {/* h2, not h4: the footer is a top-level landmark with no
                    intervening heading, so h4 skipped two levels. */}
                <h2 className="mb-1 text-[13px] font-bold tracking-widest uppercase">
                  {column.heading}
                </h2>
                {column.links.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            ))}
          </div>
        </div>

        <div className="mt-11 flex flex-wrap justify-between gap-3.5 border-t border-border pt-6 text-[13px] text-muted-foreground">
          <p>© {year} DevHub. All rights reserved.</p>
          <p>Built for developers who are tired of losing things.</p>
        </div>
      </div>
    </footer>
  );
}

import { PREVIEW_CARDS, PREVIEW_NAV } from "@/lib/home-content";
import {
  getTypeDotClass,
  getTypeLeftBorderClass,
  getTypeTextClass,
} from "@/lib/type-colors";
import { cn } from "@/lib/utils";

/** A hand-built impression of the real dashboard — not the live UI. */
export function DashboardPreview() {
  return (
    <div className="grid h-auto grid-cols-1 overflow-hidden rounded-lg bg-background sm:grid-cols-[116px_1fr] md:h-[330px]">
      <aside className="hidden flex-col border-r border-border p-3 sm:flex">
        <div className="mb-3.5 flex items-center gap-1.5 text-[11.5px] font-bold">
          <span className="size-2 rounded-sm bg-neutral-500" />
          DevHub
        </div>
        <ul className="flex flex-col gap-0.5">
          {PREVIEW_NAV.map((entry) => (
            <li
              key={entry.label}
              className={cn(
                "flex items-center gap-1.5 rounded-md px-1.5 py-1.5 text-[10.5px]",
                entry.active
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground",
              )}
            >
              <span
                className={cn(
                  "size-1.5 shrink-0 rounded-full",
                  getTypeDotClass(entry.dotTypeId),
                )}
              />
              {entry.label}
            </li>
          ))}
        </ul>
      </aside>

      <div className="flex min-w-0 flex-col gap-3 p-3">
        <div className="flex items-center justify-between rounded-md border border-border bg-card px-2.5 py-1.5 text-[10.5px] text-muted-foreground">
          <span>Search everything...</span>
          <kbd className="rounded border border-border px-1.5 font-mono text-[9px]">
            ⌘K
          </kbd>
        </div>
        <div className="grid flex-1 auto-rows-fr grid-cols-2 gap-2">
          {PREVIEW_CARDS.map((card) => (
            <div
              key={card.typeId}
              className={cn(
                "flex min-w-0 flex-col gap-0.5 rounded-md border border-border border-l-4 bg-card px-2.5 py-2",
                getTypeLeftBorderClass(card.typeId),
              )}
            >
              <span
                className={cn(
                  "text-[8.5px] font-bold tracking-widest uppercase",
                  getTypeTextClass(card.typeId),
                )}
              >
                {card.typeName}
              </span>
              <strong className="truncate text-[11px] font-semibold">
                {card.title}
              </strong>
              <span className="text-[9px] text-muted-foreground">{card.meta}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

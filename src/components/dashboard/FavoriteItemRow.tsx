import { ItemFavoriteButton } from "@/components/dashboard/ItemFavoriteButton";
import { Badge } from "@/components/ui/badge";
import type { FavoriteItemData } from "@/lib/db/items";
import { formatIsoDate } from "@/lib/format";
import { TypeGlyph } from "@/lib/type-icons";
import { getTypeBadgeClass, getTypeTextClass } from "@/lib/type-colors";
import { cn } from "@/lib/utils";

interface FavoriteItemRowProps {
  item: FavoriteItemData;
}

/**
 * The row's own layout/hover styling — kept here (server) rather than on the
 * `ItemCardTrigger` wrapper, since the trigger only needs to contribute
 * click/keyboard behavior for the favorites list. Every row here is
 * favorited by definition (the page only lists favorites), so
 * `ItemFavoriteButton` is always seeded `isFavorite`; unfavoriting removes
 * the row on the next `router.refresh()` rather than updating in place.
 */
export function FavoriteItemRow({ item }: FavoriteItemRowProps) {
  return (
    <div className="flex items-center gap-3 border-b border-border/50 px-2 py-1.5 text-sm transition-colors hover:bg-muted/40">
      <TypeGlyph
        typeId={item.itemTypeId}
        className={cn("size-4 shrink-0", getTypeTextClass(item.itemTypeId))}
      />
      <span
        className={cn(
          "min-w-0 flex-1 truncate font-medium",
          getTypeTextClass(item.itemTypeId)
        )}
      >
        {item.title}
      </span>
      <ItemFavoriteButton itemId={item.id} isFavorite className="shrink-0" />
      <Badge
        variant="outline"
        className={cn("shrink-0", getTypeBadgeClass(item.itemTypeId))}
      >
        <TypeGlyph typeId={item.itemTypeId} className="size-3.5" />
        {item.itemTypeName}
      </Badge>
      <span className="w-28 shrink-0 text-right text-xs text-muted-foreground">
        upd {formatIsoDate(item.updatedAt.toISOString())}
      </span>
    </div>
  );
}

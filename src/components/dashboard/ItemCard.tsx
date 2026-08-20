import { Pin } from "lucide-react";

import { CopyButton } from "@/components/dashboard/CopyButton";
import { ItemFavoriteButton } from "@/components/dashboard/ItemFavoriteButton";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { ItemCardData } from "@/lib/db/items";
import { TypeGlyph } from "@/lib/type-icons";
import { getTypeLeftBorderClass } from "@/lib/type-colors";
import { cn } from "@/lib/utils";

interface ItemCardProps {
  item: ItemCardData;
  /**
   * Off for the dashboard's "Pinned Items" section, where every card is pinned
   * by definition — the badge adds nothing there, and it would make each card
   * announce "Pinned" inside a heading that already says so.
   */
  showPinIndicator?: boolean;
}

export function ItemCard({ item, showPinIndicator = true }: ItemCardProps) {
  const borderClass = getTypeLeftBorderClass(item.itemTypeId);
  const copyValue = item.content ?? item.url;

  return (
    <Card
      className={cn(
        "flex h-full flex-col border-l-4 transition-colors hover:bg-muted/40",
        borderClass
      )}
    >
      <CardHeader className="flex-row items-start justify-between gap-2">
        <CardTitle className="leading-tight">{item.title}</CardTitle>
        <div className="flex shrink-0 items-center gap-1">
          {item.isPinned && showPinIndicator && (
            // Indicator only — pinning is done from the item drawer. No Button
            // wrapper, so it needs to carry its own accessible name.
            <Pin
              role="img"
              aria-label="Pinned"
              className="size-3.5 shrink-0 fill-foreground text-foreground"
            />
          )}
          {copyValue && (
            <CopyButton value={copyValue} label={`Copy ${item.itemTypeName.toLowerCase()}`} />
          )}
          <ItemFavoriteButton itemId={item.id} isFavorite={item.isFavorite} />
        </div>
      </CardHeader>
      <CardContent className="space-y-3 pt-0">
        {item.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {item.description}
          </p>
        )}
        {item.content ? (
          /*
            The padding lives on the wrapper, never on the clipped element.
            `-webkit-line-clamp` is inert in current Chrome (`display:-webkit-box`
            computes to `flow-root`, even set inline), so this <pre> is really
            just cropped by `overflow:hidden`. With padding on the <pre> itself
            the crop landed 8px past the third line, so a fourth line rendered
            into the bottom padding and was sliced through the middle of its
            glyphs. Cropping at exactly 3 x 16px instead keeps the cut on a line
            boundary. `line-clamp-3` stays for engines that do honour it — it
            clamps to the same three lines and adds an ellipsis.
          */
          <div className="rounded-md bg-muted px-3 py-2">
            <pre className="line-clamp-3 max-h-12 overflow-hidden font-mono text-xs leading-4 whitespace-pre-wrap text-foreground/90">
              {item.content}
            </pre>
          </div>
        ) : item.url ? (
          <p className="truncate rounded-md bg-muted px-3 py-2 font-mono text-xs text-muted-foreground">
            {item.url}
          </p>
        ) : null}
      </CardContent>
      <CardFooter className="mt-auto">
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1">
          {item.tags.map(tag => (
            <Badge key={tag.id} variant="secondary">
              #{tag.name}
            </Badge>
          ))}
        </div>
        <Badge variant="outline" className="shrink-0">
          <TypeGlyph typeId={item.itemTypeId} className="size-3.5" />
          {item.itemTypeName}
        </Badge>
      </CardFooter>
    </Card>
  );
}

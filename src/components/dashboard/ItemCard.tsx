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
}

export function ItemCard({ item }: ItemCardProps) {
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
          <pre className="line-clamp-3 rounded-md bg-muted px-3 py-2 font-mono text-xs whitespace-pre-wrap text-foreground/90">
            {item.content}
          </pre>
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

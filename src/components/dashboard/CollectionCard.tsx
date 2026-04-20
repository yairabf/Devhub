import { Star } from "lucide-react";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { type Collection, getItemsByCollection } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

interface CollectionCardProps {
  collection: Collection;
}

export function CollectionCard({ collection }: CollectionCardProps) {
  const items = getItemsByCollection(collection.id);
  const uniqueTypes = Array.from(
    new Map(items.map(item => [item.itemType.id, item.itemType])).values()
  );

  return (
    <Card className="flex flex-col">
      <CardHeader className="flex-row items-start justify-between gap-2">
        <CardTitle className="leading-tight">{collection.name}</CardTitle>
        <Star
          className={cn(
            "size-4 shrink-0",
            collection.isFavorite
              ? "fill-yellow-400 text-yellow-400"
              : "text-muted-foreground"
          )}
        />
      </CardHeader>
      {collection.description && (
        <CardContent className="pt-0">
          <p className="text-sm text-muted-foreground line-clamp-2">
            {collection.description}
          </p>
        </CardContent>
      )}
      <CardFooter className="mt-auto">
        <div className="flex flex-wrap items-center gap-1.5">
          {uniqueTypes.map(type => (
            <span
              key={type.id}
              aria-label={type.name}
              title={type.name}
              className="flex size-6 items-center justify-center rounded-md bg-muted text-sm"
            >
              {type.icon}
            </span>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">{items.length} items</p>
      </CardFooter>
    </Card>
  );
}

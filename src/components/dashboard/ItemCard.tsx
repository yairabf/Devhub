import { Star } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Item } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

interface ItemCardProps {
  item: Item;
}

export function ItemCard({ item }: ItemCardProps) {
  return (
    <Card className="flex flex-col">
      <CardHeader className="flex-row items-start justify-between gap-2">
        <CardTitle className="leading-tight">{item.title}</CardTitle>
        <Star
          className={cn(
            "size-4 shrink-0",
            item.isFavorite ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"
          )}
        />
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
        <div className="flex flex-wrap items-center gap-1">
          {item.tags.map(tag => (
            <Badge key={tag.id} variant="secondary">
              #{tag.name}
            </Badge>
          ))}
        </div>
        <Badge variant="outline">
          <span aria-hidden>{item.itemType.icon}</span>
          {item.itemType.name}
        </Badge>
      </CardFooter>
    </Card>
  );
}

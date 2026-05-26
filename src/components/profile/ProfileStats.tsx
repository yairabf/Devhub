import { FileText, FolderOpen } from "lucide-react";

import { Card } from "@/components/ui/card";
import { StatCard } from "@/components/dashboard/StatCard";
import { getTypeDotClass } from "@/lib/type-colors";
import { getTypeIcon } from "@/lib/type-icons";
import { capitalize } from "@/lib/format";
import type { ItemTypeBreakdown } from "@/lib/db/items";

interface Props {
  itemsCount: number;
  collectionsCount: number;
  breakdown: ItemTypeBreakdown[];
}

export function ProfileStats({
  itemsCount,
  collectionsCount,
  breakdown,
}: Props) {
  return (
    <section className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <StatCard label="Items" value={itemsCount} icon={FileText} />
        <StatCard label="Collections" value={collectionsCount} icon={FolderOpen} />
      </div>

      <Card className="p-6">
        <h2 className="text-sm font-medium text-foreground">By type</h2>
        <ul className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
          {breakdown.map((row) => {
            const Icon = getTypeIcon(row.id);
            return (
              <li
                key={row.id}
                className="flex items-center justify-between rounded-md border border-border bg-background/50 px-3 py-2"
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`size-2 rounded-full ${getTypeDotClass(row.id)}`}
                    aria-hidden
                  />
                  <Icon className="size-4 text-muted-foreground" aria-hidden />
                  <span className="text-sm text-foreground">
                    {capitalize(row.name)}
                  </span>
                </div>
                <span className="font-mono text-sm tabular-nums text-muted-foreground">
                  {row.count}
                </span>
              </li>
            );
          })}
        </ul>
      </Card>
    </section>
  );
}

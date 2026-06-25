import { notFound } from "next/navigation";

import { ItemCard } from "@/components/dashboard/ItemCard";
import { DEMO_USER_ID } from "@/lib/constants";
import { getItemsByType, getSystemItemTypes } from "@/lib/db/items";
import { capitalize, getTypeSlug } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function ItemsByTypePage({
  params,
}: {
  params: Promise<{ type: string }>;
}) {
  const { type: slug } = await params;

  const itemTypes = await getSystemItemTypes();
  const itemType = itemTypes.find(type => getTypeSlug(type.name) === slug);
  if (!itemType) notFound();

  const items = await getItemsByType(DEMO_USER_ID, itemType.id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">
          {capitalize(itemType.name)}s
        </h1>
        <p className="text-sm text-muted-foreground">
          {items.length} {items.length === 1 ? "item" : "items"}
        </p>
      </div>

      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No {itemType.name} items yet.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {items.map(item => (
            <ItemCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}

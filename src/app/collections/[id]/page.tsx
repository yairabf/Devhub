import { notFound, redirect } from "next/navigation";

import { auth } from "@/auth";
import { CollectionDetailHeader } from "@/components/dashboard/CollectionDetailHeader";
import { ItemCard } from "@/components/dashboard/ItemCard";
import { ItemCardTrigger } from "@/components/dashboard/ItemCardTrigger";
import { getCollectionById } from "@/lib/db/collections";
import { getItemsByCollection } from "@/lib/db/items";

export const dynamic = "force-dynamic";

export default async function CollectionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const session = await auth();
  if (!session?.user?.id) {
    redirect(`/sign-in?callbackUrl=/collections/${id}`);
  }

  const collection = await getCollectionById(session.user.id, id);
  if (!collection) notFound();

  const items = await getItemsByCollection(session.user.id, id);

  return (
    <div className="space-y-6">
      <CollectionDetailHeader collection={collection} itemCount={items.length} />

      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No items in this collection yet.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {items.map(item => (
            <ItemCardTrigger key={item.id} itemId={item.id} title={item.title}>
              <ItemCard item={item} />
            </ItemCardTrigger>
          ))}
        </div>
      )}
    </div>
  );
}

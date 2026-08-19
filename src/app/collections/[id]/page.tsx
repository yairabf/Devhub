import { notFound, redirect } from "next/navigation";

import { auth } from "@/auth";
import { CollectionDetailHeader } from "@/components/dashboard/CollectionDetailHeader";
import { ItemCard } from "@/components/dashboard/ItemCard";
import { ItemCardTrigger } from "@/components/dashboard/ItemCardTrigger";
import { Pagination } from "@/components/dashboard/Pagination";
import { ITEMS_PER_PAGE } from "@/lib/constants";
import { getCollectionById } from "@/lib/db/collections";
import { countItemsByCollection, getItemsByCollection } from "@/lib/db/items";
import { getPagination, parsePageParam } from "@/lib/pagination";

export const dynamic = "force-dynamic";

export default async function CollectionDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ page?: string | string[] }>;
}) {
  const { id } = await params;

  const session = await auth();
  if (!session?.user?.id) {
    redirect(`/sign-in?callbackUrl=/collections/${id}`);
  }

  // `getCollectionById` returns metadata only, so the item total is its own
  // query. The two don't depend on each other, so they go together rather
  // than costing two serial round-trips — the count is owner-scoped, so on
  // the notFound path below it simply returns 0 and is discarded.
  const [collection, total, { page: rawPage }] = await Promise.all([
    getCollectionById(session.user.id, id),
    countItemsByCollection(session.user.id, id),
    searchParams,
  ]);
  if (!collection) notFound();

  // The total has to land before the window can be resolved: it decides the
  // page count, which is what a `?page=` past the end clamps against.
  const { page, pageCount, skip, take } = getPagination(
    parsePageParam(rawPage),
    total,
    ITEMS_PER_PAGE,
  );

  const items = await getItemsByCollection(session.user.id, id, { skip, take });

  return (
    <div className="space-y-6">
      {/* The header reports the collection's whole size, not this page's. */}
      <CollectionDetailHeader collection={collection} itemCount={total} />

      {total === 0 ? (
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

      <Pagination
        page={page}
        pageCount={pageCount}
        basePath={`/collections/${id}`}
      />
    </div>
  );
}

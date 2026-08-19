import { notFound, redirect } from "next/navigation";

import { auth } from "@/auth";
import { ItemCard } from "@/components/dashboard/ItemCard";
import { ItemCardTrigger } from "@/components/dashboard/ItemCardTrigger";
import { Pagination } from "@/components/dashboard/Pagination";
import { ITEMS_PER_PAGE } from "@/lib/constants";
import { countItemsByType, getItemsByType, getSystemItemTypes } from "@/lib/db/items";
import { capitalize, getTypeSlug } from "@/lib/format";
import { getPagination, parsePageParam } from "@/lib/pagination";

export const dynamic = "force-dynamic";

export default async function ItemsByTypePage({
  params,
  searchParams,
}: {
  params: Promise<{ type: string }>;
  searchParams: Promise<{ page?: string | string[] }>;
}) {
  const { type: slug } = await params;

  const session = await auth();
  if (!session?.user?.id) {
    redirect(`/sign-in?callbackUrl=/items/${slug}`);
  }

  const [itemTypes, { page: rawPage }] = await Promise.all([
    getSystemItemTypes(),
    searchParams,
  ]);
  const itemType = itemTypes.find(type => getTypeSlug(type.name) === slug);
  if (!itemType) notFound();

  // The count can only run once the slug has resolved to a type id, and the
  // total has to land before the window: it decides the page count, which is
  // what a `?page=` past the end clamps against.
  const total = await countItemsByType(session.user.id, itemType.id);
  const { page, pageCount, skip, take } = getPagination(
    parsePageParam(rawPage),
    total,
    ITEMS_PER_PAGE,
  );

  const items = await getItemsByType(session.user.id, itemType.id, {
    skip,
    take,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">
          {capitalize(itemType.name)}s
        </h1>
        <p className="text-sm text-muted-foreground">
          {total} {total === 1 ? "item" : "items"}
          {pageCount > 1 && ` · page ${page} of ${pageCount}`}
        </p>
      </div>

      {total === 0 ? (
        <p className="text-sm text-muted-foreground">
          No {itemType.name} items yet.
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
        basePath={`/items/${slug}`}
      />
    </div>
  );
}

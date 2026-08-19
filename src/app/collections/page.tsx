import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { CollectionCard } from "@/components/dashboard/CollectionCard";
import { CollectionCardTrigger } from "@/components/dashboard/CollectionCardTrigger";
import { Pagination } from "@/components/dashboard/Pagination";
import { COLLECTIONS_PER_PAGE } from "@/lib/constants";
import { getCollections, getCollectionsCount } from "@/lib/db/collections";
import { getPagination, parsePageParam } from "@/lib/pagination";

export const dynamic = "force-dynamic";

export default async function CollectionsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string | string[] }>;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/sign-in?callbackUrl=/collections");
  }

  const [total, { page: rawPage }] = await Promise.all([
    getCollectionsCount(session.user.id),
    searchParams,
  ]);

  // The total has to land before the window: it decides the page count, which
  // is what a `?page=` past the end clamps against.
  const { page, pageCount, skip, take } = getPagination(
    parsePageParam(rawPage),
    total,
    COLLECTIONS_PER_PAGE,
  );

  const collections = await getCollections(session.user.id, { skip, take });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Collections</h1>
        <p className="text-sm text-muted-foreground">
          {total} {total === 1 ? "collection" : "collections"}
          {pageCount > 1 && ` · page ${page} of ${pageCount}`}
        </p>
      </div>

      {total === 0 ? (
        <p className="text-sm text-muted-foreground">No collections yet.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {collections.map(collection => (
            <CollectionCardTrigger
              key={collection.id}
              collectionId={collection.id}
              name={collection.name}
            >
              <CollectionCard collection={collection} />
            </CollectionCardTrigger>
          ))}
        </div>
      )}

      <Pagination page={page} pageCount={pageCount} basePath="/collections" />
    </div>
  );
}

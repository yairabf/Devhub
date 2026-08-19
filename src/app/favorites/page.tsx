import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { FavoriteCollectionRow } from "@/components/dashboard/FavoriteCollectionRow";
import { FavoriteItemRow } from "@/components/dashboard/FavoriteItemRow";
import { ItemCardTrigger } from "@/components/dashboard/ItemCardTrigger";
import { getFavoriteCollectionsList } from "@/lib/db/collections";
import { getFavoriteItems } from "@/lib/db/items";

export const dynamic = "force-dynamic";

const ROW_TRIGGER_CLASS =
  "block cursor-pointer outline-none focus-visible:ring-1 focus-visible:ring-ring/50";

function FavoritesSection({
  title,
  count,
  children,
}: {
  title: string;
  count: number;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="mb-2 flex items-baseline gap-2 text-sm font-semibold text-foreground">
        {title}
        <span className="font-mono text-xs font-normal text-muted-foreground">
          ({count})
        </span>
      </h2>
      <div className="font-mono">{children}</div>
    </section>
  );
}

export default async function FavoritesPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/sign-in?callbackUrl=/favorites");
  }
  const userId = session.user.id;

  const [items, collections] = await Promise.all([
    getFavoriteItems(userId),
    getFavoriteCollectionsList(userId),
  ]);

  const isEmpty = items.length === 0 && collections.length === 0;

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold text-foreground">Favorites</h1>

      {isEmpty ? (
        <p className="text-sm text-muted-foreground">
          No favorites yet — star an item or collection to see it here.
        </p>
      ) : (
        <>
          {items.length > 0 && (
            <FavoritesSection title="Items" count={items.length}>
              {items.map(item => (
                <ItemCardTrigger
                  key={item.id}
                  itemId={item.id}
                  title={item.title}
                  className={ROW_TRIGGER_CLASS}
                >
                  <FavoriteItemRow item={item} />
                </ItemCardTrigger>
              ))}
            </FavoritesSection>
          )}

          {collections.length > 0 && (
            <FavoritesSection title="Collections" count={collections.length}>
              {collections.map(collection => (
                <FavoriteCollectionRow key={collection.id} collection={collection} />
              ))}
            </FavoritesSection>
          )}
        </>
      )}
    </div>
  );
}

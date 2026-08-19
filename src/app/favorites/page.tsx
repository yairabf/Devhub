import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { FavoritesList } from "@/components/dashboard/FavoritesList";
import { getFavoriteCollectionsList } from "@/lib/db/collections";
import { getFavoriteItems } from "@/lib/db/items";

export const dynamic = "force-dynamic";

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

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold text-foreground">Favorites</h1>
      <FavoritesList items={items} collections={collections} />
    </div>
  );
}

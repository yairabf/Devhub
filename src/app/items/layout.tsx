import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import {
  getCollectionOptions,
  getFavoriteCollections,
  getCollections,
} from "@/lib/db/collections";
import { getSearchableItems, getSystemItemTypes } from "@/lib/db/items";
import { getEditorPreferences } from "@/lib/db/user";

export const dynamic = "force-dynamic";

export default async function ItemsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/sign-in?callbackUrl=/items");
  }
  const userId = session.user.id;

  const user = {
    name: session.user.name ?? null,
    email: session.user.email ?? null,
    image: session.user.image ?? null,
  };

  const [
    favoriteCollections,
    collections,
    itemTypes,
    collectionOptions,
    searchableItems,
    editorPreferences,
  ] = await Promise.all([
    getFavoriteCollections(userId),
    getCollections(userId),
    getSystemItemTypes(),
    getCollectionOptions(userId),
    getSearchableItems(userId),
    getEditorPreferences(userId),
  ]);

  return (
    <DashboardShell
      sidebarData={{
        favoriteCollections,
        recentCollections: collections.slice(0, 5),
        itemTypes,
      }}
      collectionOptions={collectionOptions}
      searchIndex={{
        items: searchableItems,
        collections: collections.map(collection => ({
          id: collection.id,
          name: collection.name,
          itemCount: collection.itemCount,
        })),
      }}
      editorPreferences={editorPreferences}
      user={user}
    >
      {children}
    </DashboardShell>
  );
}

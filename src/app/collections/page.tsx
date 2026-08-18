import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { CollectionCard } from "@/components/dashboard/CollectionCard";
import { CollectionCardTrigger } from "@/components/dashboard/CollectionCardTrigger";
import { getCollections } from "@/lib/db/collections";

export const dynamic = "force-dynamic";

export default async function CollectionsPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/sign-in?callbackUrl=/collections");
  }

  const collections = await getCollections(session.user.id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Collections</h1>
        <p className="text-sm text-muted-foreground">
          {collections.length} {collections.length === 1 ? "collection" : "collections"}
        </p>
      </div>

      {collections.length === 0 ? (
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
    </div>
  );
}

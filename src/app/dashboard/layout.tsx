import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import {
  getCollectionOptions,
  getFavoriteCollections,
  getCollections,
} from "@/lib/db/collections";
import { getSystemItemTypes } from "@/lib/db/items";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/sign-in?callbackUrl=/dashboard");
  }
  const userId = session.user.id;

  const user = {
    name: session.user.name ?? null,
    email: session.user.email ?? null,
    image: session.user.image ?? null,
  };

  const [favoriteCollections, recentCollections, itemTypes, collectionOptions] =
    await Promise.all([
      getFavoriteCollections(userId),
      getCollections(userId, 5),
      getSystemItemTypes(),
      getCollectionOptions(userId),
    ]);

  return (
    <DashboardShell
      sidebarData={{ favoriteCollections, recentCollections, itemTypes }}
      collectionOptions={collectionOptions}
      user={user}
    >
      {children}
    </DashboardShell>
  );
}

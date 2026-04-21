import { auth } from "@/auth";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { DEMO_USER_ID } from "@/lib/constants";
import {
  getFavoriteCollections,
  getRecentCollections,
} from "@/lib/db/collections";
import { getSystemItemTypes } from "@/lib/db/items";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const user = {
    name: session?.user?.name ?? null,
    email: session?.user?.email ?? null,
    image: session?.user?.image ?? null,
  };

  const [favoriteCollections, recentCollections, itemTypes] = await Promise.all([
    getFavoriteCollections(DEMO_USER_ID),
    getRecentCollections(DEMO_USER_ID, 5),
    getSystemItemTypes(),
  ]);

  return (
    <DashboardShell
      sidebarData={{ favoriteCollections, recentCollections, itemTypes }}
      user={user}
    >
      {children}
    </DashboardShell>
  );
}

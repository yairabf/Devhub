import { DashboardShell } from "@/components/dashboard/DashboardShell";
import {
  getFavoriteCollections,
  getRecentCollections,
} from "@/lib/db/collections";
import { getSystemItemTypes } from "@/lib/db/items";

const DEMO_USER_ID = "user_demo";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [favoriteCollections, recentCollections, itemTypes] = await Promise.all([
    getFavoriteCollections(DEMO_USER_ID),
    getRecentCollections(DEMO_USER_ID, 5),
    getSystemItemTypes(),
  ]);

  return (
    <DashboardShell
      sidebarData={{ favoriteCollections, recentCollections, itemTypes }}
    >
      {children}
    </DashboardShell>
  );
}

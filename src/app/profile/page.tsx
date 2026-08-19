import { redirect } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
  getItemsCount,
  getItemsCountByType,
} from "@/lib/db/items";
import { getCollectionsCount } from "@/lib/db/collections";

import { ProfileUserInfo } from "@/components/profile/ProfileUserInfo";
import { ProfileStats } from "@/components/profile/ProfileStats";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/sign-in?callbackUrl=/profile");
  }
  const userId = session.user.id;

  const [user, itemsCount, collectionsCount, breakdown] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        createdAt: true,
      },
    }),
    getItemsCount(userId),
    getCollectionsCount(userId),
    getItemsCountByType(userId),
  ]);

  if (!user) {
    redirect("/sign-in");
  }

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6 px-4 py-8 sm:py-12">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        <ChevronLeft className="size-3.5" />
        Back to dashboard
      </Link>

      <header>
        <h1 className="text-2xl font-semibold text-foreground">Profile</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Review your account details and usage.
        </p>
      </header>

      <ProfileUserInfo
        name={user.name}
        email={user.email}
        image={user.image}
        createdAt={user.createdAt}
      />

      <ProfileStats
        itemsCount={itemsCount}
        collectionsCount={collectionsCount}
        breakdown={breakdown}
      />
    </div>
  );
}

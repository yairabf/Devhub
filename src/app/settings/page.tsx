import { redirect } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

import { ChangePasswordForm } from "@/components/settings/ChangePasswordForm";
import { DeleteAccountDialog } from "@/components/settings/DeleteAccountDialog";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/sign-in?callbackUrl=/settings");
  }
  const userId = session.user.id;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      email: true,
      password: true,
    },
  });

  if (!user) {
    redirect("/sign-in");
  }

  const hasPassword = !!user.password;

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
        <h1 className="text-2xl font-semibold text-foreground">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your account security.
        </p>
      </header>

      {hasPassword && <ChangePasswordForm />}

      <DeleteAccountDialog email={user.email} />
    </div>
  );
}

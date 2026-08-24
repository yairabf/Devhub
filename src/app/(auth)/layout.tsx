import { auth } from "@/auth";
import { AuthLayoutChrome } from "@/components/auth/AuthLayoutChrome";
import type { HomeViewer } from "@/lib/home-cta";

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const viewer: HomeViewer = {
    isSignedIn: Boolean(session?.user?.id),
    isPro: false,
  };

  return (
    <AuthLayoutChrome viewer={viewer}>{children}</AuthLayoutChrome>
  );
}

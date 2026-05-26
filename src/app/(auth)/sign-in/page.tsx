import Link from "next/link";
import { SignInForm } from "@/components/auth/SignInForm";

interface Props {
  searchParams: Promise<{
    registered?: string;
    verified?: string;
    password_reset?: string;
    verify_error?: string;
  }>;
}

type Banner = { text: string; tone: "success" | "error" } | null;

function resolveBanner(params: Awaited<Props["searchParams"]>): Banner {
  if (params.registered === "1") {
    return { text: "Account created! You can now sign in.", tone: "success" };
  }
  if (params.verified === "1") {
    return { text: "Email verified! You can now sign in.", tone: "success" };
  }
  if (params.password_reset === "1") {
    return { text: "Password updated! You can now sign in.", tone: "success" };
  }
  if (params.verify_error === "expired") {
    return { text: "Verification link expired. Please register again.", tone: "error" };
  }
  if (params.verify_error === "invalid") {
    return { text: "Invalid verification link.", tone: "error" };
  }
  return null;
}

export default async function SignInPage({ searchParams }: Props) {
  const params = await searchParams;
  const banner = resolveBanner(params);

  return (
    <div className="w-full max-w-sm">
      <div className="mb-8 text-center">
        <span className="font-mono text-xl font-semibold tracking-tight text-foreground">
          DevStash
        </span>
        <p className="mt-1 text-sm text-muted-foreground">Sign in to your account</p>
      </div>

      <div className="rounded-xl border border-border bg-card px-6 py-8 shadow-lg">
        <div className="mb-6 h-px bg-gradient-to-r from-[oklch(0.488_0.243_264.376)] via-[oklch(0.488_0.243_264.376)/50%] to-transparent" />
        {banner && (
          <div
            role="status"
            className={
              banner.tone === "success"
                ? "mb-4 rounded-md border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-400"
                : "mb-4 rounded-md bg-destructive/10 px-3 py-2 text-xs text-destructive"
            }
          >
            {banner.text}
          </div>
        )}
        <SignInForm />
      </div>

      <p className="mt-5 text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{" "}
        <Link
          href="/register"
          className="font-medium text-foreground underline underline-offset-4 hover:text-foreground/80 transition-colors"
        >
          Create one
        </Link>
      </p>
    </div>
  );
}

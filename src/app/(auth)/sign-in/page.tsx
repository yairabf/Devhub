import Link from "next/link";
import { SignInForm } from "@/components/auth/SignInForm";

export default function SignInPage() {
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

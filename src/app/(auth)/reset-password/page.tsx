import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";

interface Props {
  searchParams: Promise<{ token?: string }>;
}

export default async function ResetPasswordPage({ searchParams }: Props) {
  const { token } = await searchParams;

  const invalid = !token || !(await isValidResetToken(token));

  return (
    <div className="w-full max-w-sm">
      <div className="mb-8 text-center">
        <span className="font-mono text-xl font-semibold tracking-tight text-foreground">
          DevStash
        </span>
        <p className="mt-1 text-sm text-muted-foreground">
          {invalid ? "Invalid reset link" : "Set a new password"}
        </p>
      </div>

      <div className="rounded-xl border border-border bg-card px-6 py-8 shadow-lg">
        <div className="mb-6 h-px bg-gradient-to-r from-[oklch(0.488_0.243_264.376)] via-[oklch(0.488_0.243_264.376)/50%] to-transparent" />
        {invalid ? (
          <div className="space-y-4 text-center">
            <p className="text-sm text-muted-foreground">
              This reset link is invalid or has expired.
            </p>
            <Link
              href="/forgot-password"
              className="block text-sm font-medium text-foreground underline underline-offset-4 hover:text-foreground/80 transition-colors"
            >
              Request a new link
            </Link>
          </div>
        ) : (
          <ResetPasswordForm token={token!} />
        )}
      </div>

      {!invalid && (
        <p className="mt-5 text-center text-sm text-muted-foreground">
          Remember your password?{" "}
          <Link
            href="/sign-in"
            className="font-medium text-foreground underline underline-offset-4 hover:text-foreground/80 transition-colors"
          >
            Sign in
          </Link>
        </p>
      )}
    </div>
  );
}

async function isValidResetToken(token: string): Promise<boolean> {
  const record = await prisma.verificationToken.findUnique({ where: { token } });
  return !!record && record.identifier.startsWith("reset:") && record.expires > new Date();
}

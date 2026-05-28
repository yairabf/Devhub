"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, MailCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function RegisterForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [resendStatus, setResendStatus] = useState<
    { kind: "idle" } | { kind: "loading" } | { kind: "success" } | { kind: "error"; message: string }
  >({ kind: "idle" });

  async function handleResend() {
    setResendStatus({ kind: "loading" });
    try {
      const res = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json() as { success: boolean; error?: string };
      if (!data.success) {
        setResendStatus({ kind: "error", message: data.error ?? "Failed to resend." });
        return;
      }
      setResendStatus({ kind: "success" });
    } catch {
      setResendStatus({ kind: "error", message: "Something went wrong. Please try again." });
    }
  }

  async function handleSubmit(e: { preventDefault(): void }) {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, confirmPassword }),
      });
      const data = await res.json() as {
        success: boolean;
        error?: string;
        verificationEmailSent?: boolean;
      };
      if (!data.success) {
        setError(data.error ?? "Registration failed.");
        return;
      }
      if (data.verificationEmailSent) {
        setSent(true);
      } else {
        router.push("/sign-in?registered=1");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <div className="flex flex-col items-center gap-3 py-4 text-center">
        <MailCheck className="h-10 w-10 text-primary" />
        <p className="font-medium text-foreground">Check your inbox</p>
        <p className="text-sm text-muted-foreground">
          We sent a verification link to <span className="font-medium text-foreground">{email}</span>.
          Click it to activate your account.
        </p>
        <p className="text-xs text-muted-foreground">The link expires in 24 hours.</p>

        <div className="mt-2 flex flex-col items-center gap-2">
          <button
            type="button"
            onClick={handleResend}
            disabled={resendStatus.kind === "loading" || resendStatus.kind === "success"}
            className="text-xs text-muted-foreground underline underline-offset-4 hover:text-foreground transition-colors disabled:cursor-not-allowed disabled:opacity-60"
          >
            {resendStatus.kind === "loading" ? "Resending…" : "Didn't get the email? Resend"}
          </button>
          {resendStatus.kind === "success" && (
            <p className="text-xs text-muted-foreground">Verification email sent.</p>
          )}
          {resendStatus.kind === "error" && (
            <p className="rounded-md bg-destructive/10 px-3 py-1.5 text-xs text-destructive">
              {resendStatus.message}
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <label htmlFor="name" className="block font-mono text-xs font-medium text-muted-foreground">
          NAME
        </label>
        <Input
          id="name"
          type="text"
          autoComplete="name"
          required
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Your name"
          disabled={loading}
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="email" className="block font-mono text-xs font-medium text-muted-foreground">
          EMAIL
        </label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="you@example.com"
          disabled={loading}
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="password" className="block font-mono text-xs font-medium text-muted-foreground">
          PASSWORD
        </label>
        <Input
          id="password"
          type="password"
          autoComplete="new-password"
          required
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="Min. 8 characters"
          disabled={loading}
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="confirm-password" className="block font-mono text-xs font-medium text-muted-foreground">
          CONFIRM PASSWORD
        </label>
        <Input
          id="confirm-password"
          type="password"
          autoComplete="new-password"
          required
          value={confirmPassword}
          onChange={e => setConfirmPassword(e.target.value)}
          placeholder="••••••••"
          disabled={loading}
        />
      </div>

      {error && (
        <p className="rounded-md bg-destructive/10 px-3 py-2 text-xs text-destructive">
          {error}
        </p>
      )}

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Creating account…
          </>
        ) : (
          "Create account"
        )}
      </Button>
    </form>
  );
}

"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogClose,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface Props {
  email: string;
}

export function DeleteAccountDialog({ email }: Props) {
  const [open, setOpen] = useState(false);
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const matches = confirm.trim().toLowerCase() === email.trim().toLowerCase();

  async function handleDelete() {
    setError("");
    setLoading(true);
    try {
      const response = await fetch("/api/auth/delete-account", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirm }),
      });
      const data: { success: boolean; error?: string } = await response.json();
      if (data.success) {
        await signOut({ callbackUrl: "/sign-in" });
      } else {
        setError(data.error ?? "Something went wrong. Please try again.");
        setLoading(false);
      }
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  return (
    <Card className="p-6">
      <h2 className="text-sm font-medium text-foreground">Delete account</h2>
      <p className="mt-1 text-xs text-muted-foreground">
        Permanently remove your account and everything in it. This cannot be
        undone.
      </p>

      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogTrigger
          render={
            <Button variant="destructive" className="mt-4">
              Delete account
            </Button>
          }
        />
        <AlertDialogContent>
          <AlertDialogTitle>Delete your account?</AlertDialogTitle>
          <AlertDialogDescription>
            All of your items, collections, custom types, and sessions will be
            deleted. This cannot be undone.
          </AlertDialogDescription>

          <div className="mt-5 space-y-1.5">
            <label
              htmlFor="confirmEmail"
              className="block font-mono text-xs font-medium text-muted-foreground"
            >
              TYPE YOUR EMAIL TO CONFIRM
            </label>
            <Input
              id="confirmEmail"
              type="text"
              autoComplete="off"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder={email}
              disabled={loading}
            />
          </div>

          {error && (
            <p className="mt-3 rounded-md bg-destructive/10 px-3 py-2 text-xs text-destructive">
              {error}
            </p>
          )}

          <div className="mt-6 flex justify-end gap-2">
            <AlertDialogClose
              render={
                <Button variant="outline" disabled={loading}>
                  Cancel
                </Button>
              }
            />
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={!matches || loading}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Deleting…
                </>
              ) : (
                "Delete account"
              )}
            </Button>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}

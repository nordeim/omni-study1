"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/views/shared";
import { apiSend, ApiError } from "@/lib/api";
import { AuthShell, InlineError, InlineStatus } from "../auth-shell";

// The 30-minute one-shot token consumption: reset → success copy → /login.
function ResetPasswordPageInner() {
  const params = useSearchParams();
  const token = params.get("token") ?? "";
  const [password, setPassword] = React.useState("");
  const [confirm, setConfirm] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [done, setDone] = React.useState(false);
  const [error, setError] = React.useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    if (password !== confirm) {
      setError("The passwords do not match.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      await apiSend("POST", "/api/auth/reset-password", { token, password });
      setDone(true);
    } catch (err: unknown) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthShell
      title="Choose a new password"
      subtitle="Your reset link is valid for 30 minutes and works once."
    >
      {done ? (
        <div className="flex flex-col gap-4">
          <InlineStatus message="Your password has been updated. You can sign in with it now." />
          <Link
            href="/login"
            className="rounded-md px-3 py-1.5 text-center text-sm font-medium text-sf-primary-strong outline-none focus-visible:ring-2 focus-visible:ring-sf-primary/40 dark:text-sf-primary-strong-dark"
          >
            Go to sign in
          </Link>
        </div>
      ) : (
        <form onSubmit={submit} className="flex flex-col gap-4" noValidate>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="reset-password">New password</Label>
            <Input
              id="reset-password"
              type="password"
              autoComplete="new-password"
              placeholder="At least 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="reset-confirm">Confirm new password</Label>
            <Input
              id="reset-confirm"
              type="password"
              autoComplete="new-password"
              placeholder="Repeat the new password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
            />
          </div>
          {error && <InlineError message={error} />}
          <Button
            type="submit"
            variant="gradient"
            className="sf-gradient-shadow h-9 w-full"
            disabled={busy || !token}
          >
            {busy ? (
              <>
                <Spinner className="size-4" />
                Updating…
              </>
            ) : (
              "Update password"
            )}
          </Button>
        </form>
      )}
    </AuthShell>
  );
}

// useSearchParams requires a Suspense boundary during static prerender.
export default function ResetPasswordPage() {
  return (
    <React.Suspense fallback={null}>
      <ResetPasswordPageInner />
    </React.Suspense>
  );
}

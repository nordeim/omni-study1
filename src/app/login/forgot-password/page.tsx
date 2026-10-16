"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/views/shared";
import { apiSend, ApiError } from "@/lib/api";
import { AuthShell, DevDelivery, InlineError, InlineStatus } from "../auth-shell";

// The 3-state reset request: ALWAYS-200 (no enumeration) — the reset URL
// rides the response as the no-SMTP delivery.
type ForgotResponse = { resetUrl?: string };

export default function ForgotPasswordPage() {
  const [email, setEmail] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [done, setDone] = React.useState(false);
  const [resetUrl, setResetUrl] = React.useState("");
  const [error, setError] = React.useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      const res = await apiSend<ForgotResponse>("POST", "/api/auth/forgot-password", { email });
      setResetUrl(res?.resetUrl ?? "");
      setDone(true);
    } catch (err: unknown) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthShell
      title="Forgot your password?"
      subtitle="We'll send a reset link to your email address."
    >
      {done ? (
        <div className="flex flex-col gap-4">
          <InlineStatus message="If an account exists for that email, a reset link is on its way." />
          {resetUrl && (
            <DevDelivery>
              <a
                href={resetUrl}
                className="font-medium text-sf-primary-strong underline dark:text-sf-primary-strong-dark"
              >
                Open your password reset link
              </a>
            </DevDelivery>
          )}
        </div>
      ) : (
        <form onSubmit={submit} className="flex flex-col gap-4" noValidate>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="forgot-email">Email address</Label>
            <Input
              id="forgot-email"
              type="email"
              autoComplete="email"
              placeholder="you@school.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          {error && <InlineError message={error} />}
          <Button
            type="submit"
            variant="gradient"
            className="sf-gradient-shadow h-9 w-full"
            disabled={busy}
          >
            {busy ? (
              <>
                <Spinner className="size-4" />
                Sending…
              </>
            ) : (
              "Send reset link"
            )}
          </Button>
        </form>
      )}
    </AuthShell>
  );
}

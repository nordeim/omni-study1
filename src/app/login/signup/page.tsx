"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/views/shared";
import { apiSend, ApiError } from "@/lib/api";
import { AuthShell, DevDelivery, InlineError } from "../auth-shell";

// Registration creates an UNVERIFIED account + a 6-digit code (S15/ADR-013 —
// no auto-login). With no SMTP the code is surfaced in the response and shown
// in the Dev delivery block.
function SignupPageInner() {
  const router = useRouter();
  const params = useSearchParams();
  const [fullName, setFullName] = React.useState("");
  const [email, setEmail] = React.useState(params.get("email") ?? "");
  const [password, setPassword] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState("");
  const [devCode, setDevCode] = React.useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      const res = await apiSend<{ devVerificationCode?: string }>(
        "POST",
        "/api/auth/register",
        { fullName, email, password },
      );
      const target = `/login/verify?email=${encodeURIComponent(email)}`;
      if (res?.devVerificationCode) {
        setDevCode(res.devVerificationCode);
        // Hand the code to the verify surface through the URL-less path:
        // sessionStorage (never localStorage — it is a one-shot secret).
        try {
          sessionStorage.setItem("sf-verify-code", res.devVerificationCode);
        } catch {
          // private mode — the verify page simply shows no prefilled code
        }
      }
      setBusy(false);
      router.push(target);
    } catch (err: unknown) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
      setBusy(false);
    }
  };

  return (
    <AuthShell
      title="Create your account"
      subtitle="Your study companion — tasks, schedule, notes, and focus."
    >
      <form onSubmit={submit} className="flex flex-col gap-4" noValidate>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="signup-name">Full name (optional)</Label>
          <Input
            id="signup-name"
            autoComplete="name"
            placeholder="Alex Student"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="signup-email">Email address</Label>
          <Input
            id="signup-email"
            type="email"
            autoComplete="email"
            placeholder="you@school.edu"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="signup-password">Password</Label>
          <Input
            id="signup-password"
            type="password"
            autoComplete="new-password"
            placeholder="At least 8 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            aria-describedby="signup-password-hint"
          />
          <p id="signup-password-hint" className="text-xs text-slate-400">
            Minimum 8 characters.
          </p>
        </div>

        {error && <InlineError message={error} />}
        {devCode && <DevDelivery>Verification code: {devCode}</DevDelivery>}

        <Button
          type="submit"
          variant="gradient"
          className="sf-gradient-shadow h-9 w-full"
          disabled={busy}
        >
          {busy ? (
            <>
              <Spinner className="size-4" />
              Creating account…
            </>
          ) : (
            "Create account"
          )}
        </Button>
      </form>
    </AuthShell>
  );
}

// useSearchParams requires a Suspense boundary during static prerender.
export default function SignupPage() {
  return (
    <React.Suspense fallback={null}>
      <SignupPageInner />
    </React.Suspense>
  );
}

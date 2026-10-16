"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/views/shared";
import { apiSend, ApiError } from "@/lib/api";
import { AuthShell, InlineError, InlineStatus } from "../auth-shell";

// The OTP step: match the latest unexpired 15-minute code → verified + signed
// in (the verify endpoint sets the session cookie on success).
function VerifyPageInner() {
  const params = useSearchParams();
  const [email, setEmail] = React.useState(params.get("email") ?? "");
  const [code, setCode] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [resent, setResent] = React.useState(false);
  const [error, setError] = React.useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      await apiSend("POST", "/api/auth/verify-email", { email, code });
      window.location.replace("/");
    } catch (err: unknown) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
      setBusy(false);
    }
  };

  const resend = async () => {
    if (busy) return;
    setError("");
    try {
      await apiSend("POST", "/api/auth/resend-verification", { email });
      setResent(true);
    } catch {
      // uniform-200 endpoint — never an error surface
      setResent(true);
    }
  };

  return (
    <AuthShell
      title="Verify your email"
      subtitle="Enter the 6-digit code to finish setting up your account."
    >
      <form onSubmit={submit} className="flex flex-col gap-4" noValidate>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="verify-email">Email address</Label>
          <Input
            id="verify-email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="verify-code">Verification code</Label>
          <Input
            id="verify-code"
            inputMode="numeric"
            maxLength={6}
            placeholder="000000"
            className="text-center font-mono text-lg tracking-widest"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            required
          />
        </div>

        {error && <InlineError message={error} />}
        {resent && (
          <InlineStatus message="If that account needs verification, a new code is on its way." />
        )}

        <Button
          type="submit"
          variant="gradient"
          className="sf-gradient-shadow h-9 w-full"
          disabled={busy}
        >
          {busy ? (
            <>
              <Spinner className="size-4" />
              Verifying…
            </>
          ) : (
            "Verify and sign in"
          )}
        </Button>
        <Button type="button" variant="ghost" className="h-9 w-full" onClick={resend}>
          Resend code
        </Button>
      </form>
    </AuthShell>
  );
}

// useSearchParams requires a Suspense boundary during static prerender.
export default function VerifyPage() {
  return (
    <React.Suspense fallback={null}>
      <VerifyPageInner />
    </React.Suspense>
  );
}

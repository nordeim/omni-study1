"use client";

// ---------------------------------------------------------------------------
// The reference-parity login card (S4-D measured chrome): centered card on
// the canvas, 44px gradient brand chip, Google button (explicitly disabled —
// the reference's OAuth has no local counterpart), inline role="alert"
// errors surfaced verbatim from the API (rate-limit + unverified copy).
// Full reload on success — the boot script re-defaults the theme for the
// authenticated shell.
// ---------------------------------------------------------------------------

import * as React from "react";
import Link from "next/link";
import { Chrome, GraduationCap } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/views/shared";
import { apiSend, ApiError } from "@/lib/api";

export default function LoginPage() {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      await apiSend("POST", "/api/auth/login", { email, password });
      window.location.replace("/");
    } catch (err: unknown) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Something went wrong. Please try again.",
      );
      setBusy(false);
    }
  };

  return (
    <div className="sf-canvas flex min-h-dvh items-center justify-center p-4">
      <div className="w-full max-w-sm rounded-2xl border border-slate-100 bg-card p-8 shadow-sm dark:border-slate-800">
        <div className="flex flex-col items-center text-center">
          <span
            className="sf-print-exact flex h-11 w-11 items-center justify-center rounded-xl text-white"
            style={{
              backgroundImage:
                "linear-gradient(to right, rgb(var(--sf-primary)), rgb(var(--sf-primary-gradient-to)))",
            }}
          >
            <GraduationCap className="size-6" strokeWidth={2} />
          </span>
          <h1 className="mt-4 text-2xl font-bold text-slate-800 dark:text-slate-100">
            StudyFlow
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Welcome back — sign in to your study companion.
          </p>
        </div>

        <Button
          type="button"
          variant="outline"
          className="mt-6 h-9 w-full"
          disabled
          title="Google sign-in is not available in this deployment"
        >
          <Chrome className="size-4" strokeWidth={2} />
          Continue with Google
        </Button>

        <div className="my-5 flex items-center gap-3" aria-hidden>
          <span className="h-px flex-1 bg-slate-100 dark:bg-slate-800" />
          <span className="text-xs text-slate-400">or</span>
          <span className="h-px flex-1 bg-slate-100 dark:bg-slate-800" />
        </div>

        <form onSubmit={submit} className="flex flex-col gap-4" noValidate>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="login-email">Email address</Label>
            <Input
              id="login-email"
              type="email"
              autoComplete="email"
              placeholder="you@school.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="login-password">Password</Label>
            <Input
              id="login-password"
              type="password"
              autoComplete="current-password"
              placeholder="Your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && (
            <div
              role="alert"
              className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-200"
            >
              {error}
            </div>
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
                Signing in…
              </>
            ) : (
              "Sign in"
            )}
          </Button>
        </form>

        <div className="mt-5 flex items-center justify-between text-sm">
          <Link
            href="/login/signup"
            className="font-medium text-sf-primary-strong outline-none focus-visible:ring-2 focus-visible:ring-sf-primary/40 dark:text-sf-primary-strong-dark"
          >
            Create an account
          </Link>
          <Link
            href="/login/forgot-password"
            className="font-medium text-sf-primary-strong outline-none focus-visible:ring-2 focus-visible:ring-sf-primary/40 dark:text-sf-primary-strong-dark"
          >
            Forgot password?
          </Link>
        </div>
      </div>
    </div>
  );
}

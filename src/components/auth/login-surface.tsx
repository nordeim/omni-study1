"use client";

// ---------------------------------------------------------------------------
// The auth surface — ONE client component rendering the reference's
// measured sub-screens inside a single card (S15): sign-in ↔ sign-up ↔
// verify ↔ forgot ↔ reset, swapped by view state (the reference never
// navigates between them). Every heading/label/button name here is pinned
// by tests/e2e/auth-flows.spec.ts — treat the copy as a parity contract.
// ---------------------------------------------------------------------------

import * as React from "react";
import { useSearchParams } from "next/navigation";
import { Chrome, GraduationCap, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/views/shared";
import { apiSend, ApiError } from "@/lib/api";
import { useThemeStore } from "@/lib/store";

type AuthView = "signin" | "signup" | "verify" | "forgot" | "reset";

function InlineError({ message }: { message: string }) {
  return (
    <div
      role="alert"
      className="rounded-xl border border-red-200 bg-red-50/70 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-200"
    >
      {message}
    </div>
  );
}

function InlineStatus({ message }: { message: string }) {
  return (
    <div
      role="status"
      className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-200"
    >
      {message}
    </div>
  );
}

export function LoginSurface() {
  const params = useSearchParams();

  const [view, setView] = React.useState<AuthView>(() =>
    params.get("view") === "reset" || params.get("token") ? "reset" : "signin",
  );
  const [email, setEmail] = React.useState(params.get("email") ?? "");
  const [password, setPassword] = React.useState("");
  const [confirm, setConfirm] = React.useState("");
  const [newPassword, setNewPassword] = React.useState("");
  const [resetEmail, setResetEmail] = React.useState("");
  const [resetUrl, setResetUrl] = React.useState("");
  const [forgotDone, setForgotDone] = React.useState(false);
  const [code, setCode] = React.useState<string[]>(Array(6).fill(""));
  const [surfacedCode, setSurfacedCode] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState("");
  const [status, setStatus] = React.useState("");

  const boxRefs = React.useRef<(HTMLInputElement | null)[]>([]);

  const setBox = (index: number, value: string) => {
    const digit = value.replace(/\D/g, "").slice(-1);
    setCode((prev) => prev.map((c, i) => (i === index ? digit : c)));
    if (digit && index < 5) boxRefs.current[index + 1]?.focus();
  };

  const finishSignIn = () => {
    // Full reload — the boot script re-defaults the theme, and the shell
    // lands on the reference's canonical /Dashboard path.
    window.location.replace("/Dashboard");
  };

  const submitSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      await apiSend("POST", "/api/auth/login", { email, password });
      finishSignIn();
    } catch (err: unknown) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
      setBusy(false);
    }
  };

  const submitSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    if (password !== confirm) {
      setError("The passwords do not match.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const res = await apiSend<{ ok: boolean; code?: string }>(
        "POST",
        "/api/auth/register",
        { fullName: "", email, password },
      );
      setSurfacedCode(res?.code ?? "");
      setCode(Array(6).fill(""));
      setStatus("");
      setView("verify");
    } catch (err: unknown) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const submitVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      await apiSend("POST", "/api/auth/verify-email", { email, code: code.join("") });
      // Verified = signed in — the verify endpoint sets the session cookie.
      finishSignIn();
    } catch (err: unknown) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
      setBusy(false);
    }
  };

  const resend = async () => {
    if (busy) return;
    setError("");
    try {
      const res = await apiSend<{ code?: string }>("POST", "/api/auth/resend-verification", { email });
      if (res?.code) setSurfacedCode(res.code);
      setStatus("If that account needs verification, a new code is on its way.");
    } catch {
      // uniform-200 endpoint — never an error surface
      setStatus("If that account needs verification, a new code is on its way.");
    }
  };

  const submitForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      const res = await apiSend<{ resetUrl?: string }>("POST", "/api/auth/forgot-password", {
        email: resetEmail,
      });
      setResetUrl(res?.resetUrl ?? "");
      setForgotDone(true);
    } catch (err: unknown) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const submitReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    if (newPassword !== confirm) {
      setError("The passwords do not match.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      await apiSend("POST", "/api/auth/reset-password", {
        token: params.get("token") ?? "",
        password: newPassword,
      });
      useThemeStore.getState().clearThemeCache();
      setView("signin");
      setError("Password reset successfully. Sign in with your new password.");
      setEmail(resetEmail || email);
    } catch (err: unknown) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const brandChip = (
    <span
      className="sf-print-exact flex h-11 w-11 items-center justify-center rounded-xl text-white"
      style={{
        backgroundImage:
          "linear-gradient(to right, rgb(var(--sf-primary)), rgb(var(--sf-primary-gradient-to)))",
      }}
    >
      <GraduationCap className="size-6" strokeWidth={2} />
    </span>
  );

  const backToSignIn = (
    <button
      type="button"
      className="block text-center text-sm font-medium text-sf-primary-strong outline-none focus-visible:ring-2 focus-visible:ring-sf-primary/40 dark:text-sf-primary-strong-dark"
      onClick={() => {
        setError("");
        setStatus("");
        setView("signin");
      }}
    >
      Back to sign in
    </button>
  );

  return (
    <div className="sf-canvas flex min-h-dvh items-center justify-center p-4">
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white/95 p-8 shadow-2xl backdrop-blur-xs dark:bg-slate-900/95">
        <div
          aria-hidden
          className="absolute inset-x-0 top-0 h-1"
          style={{
            backgroundImage: "linear-gradient(to right, #e2e8f0, #cbd5e1, #e2e8f0)",
          }}
        />
        {view === "signin" && (
          <>
            <div className="flex flex-col items-center text-center">
              {/* 96px circle logo with the white ring (the measured S4-F chrome) */}
              <span
                className="sf-print-exact flex size-20 items-center justify-center rounded-full text-white ring-4 ring-white sm:size-24"
                style={{
                  backgroundImage:
                    "linear-gradient(to right, rgb(var(--sf-primary)), rgb(var(--sf-primary-gradient-to)))",
                }}
              >
                <GraduationCap className="size-10" strokeWidth={2} />
              </span>
              <h1 className="mt-4 text-2xl font-bold text-slate-800 sm:text-3xl dark:text-slate-100">
                Welcome to StudyFlow
              </h1>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Sign in to continue
              </p>
            </div>

            <Button
              type="button"
              variant="outline"
              className="mt-6 h-[54px] w-full rounded-xl"
              disabled
              title="Google sign-in is not available in this deployment"
            >
              <Chrome className="size-4" strokeWidth={2} />
              Continue with Google
            </Button>

            <div className="my-5 flex items-center gap-3" aria-hidden>
              <span className="h-px flex-1 bg-slate-100 dark:bg-slate-800" />
              <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-medium text-slate-300">or</span>
              <span className="h-px flex-1 bg-slate-100 dark:bg-slate-800" />
            </div>

            <form onSubmit={submitSignIn} className="flex flex-col gap-4" noValidate>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="auth-email">Email</Label>
                <Input
                  id="auth-email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@school.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-11 rounded-xl bg-slate-50/50 sm:h-12"
                  required
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="auth-password">Password</Label>
                <Input
                  id="auth-password"
                  type="password"
                  autoComplete="current-password"
                  placeholder="Min. 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-11 rounded-xl bg-slate-50/50 sm:h-12"
                  required
                />
              </div>
              {error && <InlineError message={error} />}
              {status && !error && <InlineStatus message={status} />}
              <Button
                type="submit"
                variant="gradient"
                className="sf-gradient-shadow h-11 w-full rounded-xl sm:h-12"
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
              <button
                type="button"
                className="font-medium text-sf-primary-strong outline-none focus-visible:ring-2 focus-visible:ring-sf-primary/40 dark:text-sf-primary-strong-dark"
                onClick={() => {
                  setError("");
                  setStatus("");
                  setView("signup");
                }}
              >
                Need an account? Sign up
              </button>
              <button
                type="button"
                className="font-medium text-sf-primary-strong outline-none focus-visible:ring-2 focus-visible:ring-sf-primary/40 dark:text-sf-primary-strong-dark"
                onClick={() => {
                  setError("");
                  setStatus("");
                  setResetEmail(email);
                  setView("forgot");
                }}
              >
                Forgot password?
              </button>
            </div>
          </>
        )}

        {view === "signup" && (
          <>
            <div className="flex flex-col items-center text-center">
              {brandChip}
              {/* h2 — the sub-screen REPLACES the brand block (no h1, S15 pin) */}
              <h2 className="mt-2 text-xl font-bold text-slate-800 dark:text-slate-100 sm:text-2xl sm:mt-4">
                Create your account
              </h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Your study companion — tasks, schedule, notes, and focus.
              </p>
            </div>

            <form onSubmit={submitSignUp} className="mt-6 flex flex-col gap-4" noValidate>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="auth-email">Email</Label>
                <Input
                  id="auth-email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@school.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="auth-password">Password</Label>
                <Input
                  id="auth-password"
                  type="password"
                  autoComplete="new-password"
                  placeholder="Min. 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="auth-confirm">Confirm Password</Label>
                <Input
                  id="auth-confirm"
                  type="password"
                  autoComplete="new-password"
                  placeholder="Re-enter password"
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

            <div className="mt-5 text-center text-sm">{backToSignIn}</div>
          </>
        )}

        {view === "verify" && (
          <>
            {/* S16 geometry: Back-bottom→h2-top 76px = container mt-3 (12)
                + circle 44 + circle mb-3 (12) + h2 mt-2 (8). */}
            <div className="text-center">{backToSignIn}</div>
            <div className="mt-3 flex flex-col items-center text-center">
              <span className="sf-print-exact mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-sf-primary-soft text-sf-primary-strong dark:bg-sf-primary-soft-dark/40 dark:text-sf-primary-strong-dark">
                <ShieldCheck className="size-6" strokeWidth={2} />
              </span>
              <h2 className="mt-2 text-xl font-bold text-slate-800 dark:text-slate-100 sm:text-2xl sm:mt-4">
                Verify your email
              </h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                We&apos;ve sent a 6-digit code to <span className="font-medium">{email}</span>
              </p>
            </div>

            <form onSubmit={submitVerify} className="mt-6 flex flex-col gap-4" noValidate>
              <div className="flex justify-between gap-2">
                {code.map((digit, i) => (
                  <Input
                    key={i}
                    ref={(el) => {
                      boxRefs.current[i] = el;
                    }}
                    inputMode="numeric"
                    autoComplete={i === 0 ? "one-time-code" : "off"}
                    maxLength={1}
                    className="h-12 text-center text-lg font-semibold"
                    aria-label={`Digit ${i + 1}`}
                    value={digit}
                    onChange={(e) => setBox(i, e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Backspace" && !code[i] && i > 0) {
                        boxRefs.current[i - 1]?.focus();
                      }
                    }}
                  />
                ))}
              </div>

              {surfacedCode && (
                <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
                  <p className="font-medium">Dev delivery (no SMTP in this deployment)</p>
                  {/* lowercase "your code is" — the auth-flows spec's regex is case-sensitive */}
                  <p>your code is <span className="font-mono font-semibold">{surfacedCode}</span></p>
                </div>
              )}
              {error && <InlineError message={error} />}
              {status && !error && <InlineStatus message={status} />}

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
                  "Verify email"
                )}
              </Button>
              <Button type="button" variant="ghost" className="h-9 w-full" onClick={resend}>
                Resend code
              </Button>
            </form>
          </>
        )}

        {view === "forgot" && (
          <>
            {/* S16 geometry: Back-top→h2-top 28px = back link 20px + h2 mt-2
                (8). The sub-screen replaces the brand block (S15). */}
            <div className="text-center">{backToSignIn}</div>
            <div className="flex flex-col items-center text-center">
              <h2 className="mt-2 text-xl font-bold text-slate-800 dark:text-slate-100 sm:text-2xl sm:mt-4">
                {forgotDone ? "Check your email" : "Reset your password"}
              </h2>
              {!forgotDone && (
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Enter your email and we&apos;ll send you a link to reset your password
                </p>
              )}
            </div>

            {forgotDone ? (
              <div className="mt-6 flex flex-col gap-4">
                <div
                  role="alert"
                  className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-200"
                >
                  Please check your email for the password reset link. It may take a few minutes to arrive.
                </div>
                {resetUrl && (
                  <a
                    href={resetUrl}
                    className="text-sm font-medium text-sf-primary-strong underline outline-none focus-visible:ring-2 focus-visible:ring-sf-primary/40 dark:text-sf-primary-strong-dark"
                  >
                    Open your reset link
                  </a>
                )}
                <Button
                  type="button"
                  variant="outline"
                  className="h-9 w-full"
                  onClick={() => {
                    setForgotDone(false);
                    setView("signin");
                  }}
                >
                  Back to sign in
                </Button>
              </div>
            ) : (
              <form onSubmit={submitForgot} className="mt-6 flex flex-col gap-4" noValidate>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="auth-email">Email</Label>
                  <Input
                    id="auth-email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@school.edu"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
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
          </>
        )}

        {view === "reset" && (
          <>
            <div className="flex flex-col items-center text-center">
              {brandChip}
              <h2 className="mt-2 text-xl font-bold text-slate-800 dark:text-slate-100 sm:text-2xl sm:mt-4">
                Reset your password
              </h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Your reset link is valid for 30 minutes and works once.
              </p>
            </div>

            <form onSubmit={submitReset} className="mt-6 flex flex-col gap-4" noValidate>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="auth-password">Password</Label>
                <Input
                  id="auth-password"
                  type="password"
                  autoComplete="new-password"
                  placeholder="Min. 8 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="auth-confirm">Confirm Password</Label>
                <Input
                  id="auth-confirm"
                  type="password"
                  autoComplete="new-password"
                  placeholder="Re-enter password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  required
                />
              </div>
              {error && <InlineError message={error} />}
              {status && !error && <InlineStatus message={status} />}
              <Button
                type="submit"
                variant="gradient"
                className="sf-gradient-shadow h-9 w-full"
                disabled={busy || !params.get("token")}
              >
                {busy ? (
                  <>
                    <Spinner className="size-4" />
                    Updating…
                  </>
                ) : (
                  "Reset password"
                )}
              </Button>
              {backToSignIn}
            </form>
          </>
        )}
      </div>
    </div>
  );
}

export default LoginSurface;

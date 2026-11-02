"use client";

// ---------------------------------------------------------------------------
// The auth surface — ONE client component rendering the reference's
// measured sub-screens inside a single card (S15): sign-in ↔ sign-up ↔
// verify ↔ forgot ↔ reset, swapped by view state (the reference never
// navigates between them). Every heading/label/button name here is pinned
// by tests/e2e/auth-flows.spec.ts — treat the copy as a parity contract.
// ---------------------------------------------------------------------------

import * as React from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { Chrome, GraduationCap, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/views/shared";
import { apiSend, ApiError, isTimeoutError } from "@/lib/api";
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
      className="sf-alert-emerald rounded-xl px-3 py-2 text-sm"
    >
      {message}
    </div>
  );
}

export function LoginSurface() {
  const params = useSearchParams();
  const pathname = usePathname();

  // S129/CD6a: the route-aware default. Pre-fix the initial view keyed ONLY
  // on query params, so a user whose email client stripped the token off
  // /reset-password?token=… landed on the SIGN-IN form at the /reset-password
  // URL — the CA11 missing-token explanation was reachable only via
  // /login?view=reset, never on the route it was written for. The route
  // defaults to "reset" regardless of query; /login keeps the param-keyed
  // behavior (the e2e pins for /login?view=… are untouched).
  const [view, setView] = React.useState<AuthView>(() =>
    pathname === "/reset-password" ||
    params.get("view") === "reset" ||
    params.get("token")
      ? "reset"
      : "signin",
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
  // The status channel (role="status", emerald) — the resend hint's own
  // state; S120/BU17d routes the reset SUCCESS through it too (it rode the
  // red role="alert" error channel since S15).
  const [status, setStatus] = React.useState("");

  const boxRefs = React.useRef<(HTMLInputElement | null)[]>([]);

  // S126/CA4: the incoming screen's heading receives focus on every view
  // CHANGE. The pre-fix swap unmounted the trigger button, so focus fell to
  // <body> with no announcement (WCAG 2.4.3/4.1.3 — axe cannot catch the
  // class). The initial mount is skipped: the signin h1 must not steal the
  // email input's focus on first paint.
  const headingRef = React.useRef<HTMLHeadingElement | null>(null);
  const initialView = React.useRef(true);
  React.useEffect(() => {
    if (initialView.current) {
      initialView.current = false;
      return;
    }
    headingRef.current?.focus();
  }, [view]);

  const setBox = (index: number, value: string) => {
    const digit = value.replace(/\D/g, "").slice(-1);
    setCode((prev) => prev.map((c, i) => (i === index ? digit : c)));
    if (digit && index < 5) boxRefs.current[index + 1]?.focus();
  };

  // S122/BW9: a pasted code distributes across the boxes. The pre-fix
  // setBox clipped a paste to ONE character (browsers honor maxLength=1)
  // — yet the in-band delivery surfaces the code right above the inputs,
  // so paste is the dominant entry path. Digits fill left-to-right from
  // the focused box; focus lands on the next empty box.
  const onBoxPaste = (index: number, event: React.ClipboardEvent<HTMLInputElement>) => {
    const digits = event.clipboardData.getData("text/plain").replace(/\D/g, "");
    if (!digits) return; // a non-digit paste falls through to the default clip
    event.preventDefault();
    const fill = digits.slice(0, 6 - index);
    setCode((prev) => {
      const next = [...prev];
      for (let i = 0; i < fill.length; i++) next[index + i] = fill.charAt(i);
      return next;
    });
    boxRefs.current[Math.min(index + fill.length, 5)]?.focus();
  };

  const finishSignIn = () => {
    // Full reload — the boot script re-defaults the theme, and the shell
    // lands on the reference's canonical /Dashboard path.
    window.location.replace("/Dashboard");
  };

  // S130/CE1: the honest timeout copy for the auth surface — a stalled
  // auth POST (now bounded at 20 s) rejecting with a TimeoutError would
  // otherwise surface the generic "Something went wrong"; the deadline
  // fired, and the copy should say so (the rum-panel precedent).
  const authErrorMessage = (err: unknown): string =>
    isTimeoutError(err)
      ? "That took too long. Check your connection and try again."
      : err instanceof ApiError
        ? err.message
        : "Something went wrong. Please try again.";

  const submitSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      // S129/CD6c: the 20 s deadline on every auth POST (the CC7 class on
      // the app's one unauthenticated surface — a stalled connection held
      // the disabled-busy button forever with the inline error channel
      // unreachable).
      await apiSend("POST", "/api/auth/login", { email, password }, { timeoutMs: 20_000 });
      finishSignIn();
    } catch (err: unknown) {
      setError(authErrorMessage(err));
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
        { timeoutMs: 20_000 },
      );
      setSurfacedCode(res?.code ?? "");
      setCode(Array(6).fill(""));
      setStatus("");
      setView("verify");
    } catch (err: unknown) {
      setError(authErrorMessage(err));
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
      await apiSend("POST", "/api/auth/verify-email", { email, code: code.join("") }, { timeoutMs: 20_000 });
      // Verified = signed in — the verify endpoint sets the session cookie.
      finishSignIn();
    } catch (err: unknown) {
      setError(authErrorMessage(err));
      setBusy(false);
    }
  };

  const [resending, setResending] = React.useState(false);

  const resend = async () => {
    if (busy || resending) return;
    // S126/CA10: the in-flight guard — the old shape checked `busy` but
    // never set it, so rapid clicks fired duplicate POSTs against the
    // 10/IP resend limiter (a 429 for a click the user made once).
    setResending(true);
    setError("");
    try {
      const res = await apiSend<{ code?: string }>("POST", "/api/auth/resend-verification", { email }, { timeoutMs: 20_000 });
      if (res?.code) setSurfacedCode(res.code);
      setStatus("If that account needs verification, a new code is on its way.");
    } catch {
      // uniform-200 endpoint — never an error surface
      setStatus("If that account needs verification, a new code is on its way.");
    } finally {
      setResending(false);
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
      }, { timeoutMs: 20_000 });
      setResetUrl(res?.resetUrl ?? "");
      setForgotDone(true);
    } catch (err: unknown) {
      setError(authErrorMessage(err));
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
      }, { timeoutMs: 20_000 });
      useThemeStore.getState().clearThemeCache();
      // S126/CA11: the consumed token leaves the URL (a refresh used to
      // re-land the user on the reset screen with a spent token).
      window.history.replaceState({}, "", "/login");
      setView("signin");
      setError("");
      setStatus("Password reset successfully. Sign in with your new password.");
      setEmail(resetEmail || email);
    } catch (err: unknown) {
      setError(authErrorMessage(err));
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
    // main, not div — the auth surface is a standalone page (no shell) and
    // needs the one-main landmark (Lighthouse landmark-one-main, session 61).
    <main className="sf-canvas flex min-h-dvh items-center justify-center p-4">
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
              <h1 ref={headingRef} tabIndex={-1} className="mt-4 text-2xl font-bold text-slate-800 sm:text-3xl dark:text-slate-100 outline-none">
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
            >
              <Chrome className="size-4" strokeWidth={2} />
              Continue with Google
            </Button>
            {/* S126/CA9: the unavailability explanation as persistent text —
                the old title-only tooltip could never display (a disabled
                button with disabled:pointer-events-none neither hovers nor
                focuses). */}
            <p className="mt-2 text-center text-xs text-slate-500 dark:text-slate-400">
              Google sign-in is not available in this deployment
            </p>

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
              <h2 ref={headingRef} tabIndex={-1} className="mt-2 text-xl font-bold text-slate-800 dark:text-slate-100 sm:text-2xl sm:mt-4 outline-none">
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
              <h2 ref={headingRef} tabIndex={-1} className="mt-2 text-xl font-bold text-slate-800 dark:text-slate-100 sm:text-2xl sm:mt-4 outline-none">
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
                    // S129/CD6g: select-on-focus — typing over an existing
                    // digit now replaces it (maxLength=1 otherwise blocks
                    // the insert; correction needed a Backspace first). The
                    // BW9 paste path is untouched.
                    onFocus={(e) => e.target.select()}
                    onChange={(e) => setBox(i, e.target.value)}
                    onPaste={(e) => onBoxPaste(i, e)}
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
              <Button type="button" variant="ghost" className="h-9 w-full" onClick={resend} disabled={busy || resending}>
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
              <h2 ref={headingRef} tabIndex={-1} className="mt-2 text-xl font-bold text-slate-800 dark:text-slate-100 sm:text-2xl sm:mt-4 outline-none">
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
                  // S129/CD6b: role="status" (the surface's own success
                  // channel — its InlineStatus; role="alert" is the ERROR
                  // channel and interrupts assertively for a confirmation).
                  role="status"
                  className="sf-alert-emerald rounded-xl px-3 py-2 text-sm"
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
              <h2 ref={headingRef} tabIndex={-1} className="mt-2 text-xl font-bold text-slate-800 dark:text-slate-100 sm:text-2xl sm:mt-4 outline-none">
                Reset your password
              </h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Your reset link is valid for 30 minutes and works once.
              </p>
            </div>

            {/* S126/CA11: a reset screen without its token is explained,
                not a silent dead end (email clients that strip query
                strings used to land users on a permanently-disabled submit
                with no reason). */}
            {!params.get("token") && (
              <InlineError message="This reset link is missing its token — request a new one." />
            )}
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
    </main>
  );
}


"use client";

// Shared chrome for the auth sub-surfaces (signup/verify/forgot/reset):
// the same centered card + brand chip as /login with a back link.

import * as React from "react";
import Link from "next/link";
import { GraduationCap } from "lucide-react";

export function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
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
            {title}
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>
        </div>
        <div className="mt-6">{children}</div>
        <div className="mt-5 text-center text-sm">
          <Link
            href="/login"
            className="font-medium text-sf-primary-strong outline-none focus-visible:ring-2 focus-visible:ring-sf-primary/40 dark:text-sf-primary-strong-dark"
          >
            Back to sign in
          </Link>
        </div>
      </div>
    </div>
  );
}

export function InlineError({ message }: { message: string }) {
  return (
    <div
      role="alert"
      className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-200"
    >
      {message}
    </div>
  );
}

export function InlineStatus({ message }: { message: string }) {
  return (
    <div
      role="status"
      className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-200"
    >
      {message}
    </div>
  );
}

/** The no-SMTP "Dev delivery" block — a surfaced code or reset URL. */
export function DevDelivery({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
      <p className="font-medium">Dev delivery (no SMTP in this deployment)</p>
      <div className="mt-1 break-all">{children}</div>
    </div>
  );
}

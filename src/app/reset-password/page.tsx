"use client";

import * as React from "react";
import { GraduationCap } from "lucide-react";

// The measured auth surface (sub-screens swap client-side — see
// src/components/auth/login-surface.tsx). useSearchParams requires a
// Suspense boundary during static prerender; the fallback renders the
// brand shell so the prerendered HTML is never empty.
import { LoginSurface } from "@/components/auth/login-surface";

function AuthFallback() {
  return (
    <main className="sf-canvas flex min-h-dvh items-center justify-center p-4">
      <div className="flex w-full max-w-sm flex-col items-center rounded-2xl border border-slate-100 bg-card p-8 shadow-2xl dark:border-slate-800">
        <span
          className="sf-print-exact flex h-11 w-11 animate-pulse items-center justify-center rounded-xl text-white"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgb(var(--sf-primary)), rgb(var(--sf-primary-gradient-to)))",
          }}
        >
          <GraduationCap className="size-6" strokeWidth={2} />
        </span>
      </div>
    </main>
  );
}

export default function AuthRoutePage() {
  return (
    <React.Suspense fallback={<AuthFallback />}>
      <LoginSurface />
    </React.Suspense>
  );
}

"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// The zustand toaster — a tiny store + stack (AGENTS.md: "toast (zustand
// toaster)"). Views call useToast().toast.error(err.message) — never alert().
// The stack is an aria-live region (the S14 AI-accessibility convention).
// ---------------------------------------------------------------------------

import { create } from "zustand";

export type ToastKind = "info" | "success" | "error";
export type ToastItem = { id: number; kind: ToastKind; message: string };

type ToastStore = {
  items: ToastItem[];
  push: (kind: ToastKind, message: string) => void;
  dismiss: (id: number) => void;
};

// S128/CC8: deterministic identity + a bounded stack. The pre-CC8 store
// minted ids with `Date.now() + Math.floor(Math.random() * 1000)` (same-tick
// pushes collide ~1/1000 — duplicate React keys, one dismiss kills both —
// and the ids are non-monotonic), scheduled the auto-dismiss timer INSIDE
// the `set` reducer (purity smell), and never capped the stack (an error
// loop piles toasts, each living its 5s). A module counter owns identity,
// the timer is scheduled outside `set`, and the stack keeps the newest 5.
let nextToastId = 1;
const TOAST_STACK_CAP = 5;

function autoDismiss(id: number): void {
  setTimeout(() => {
    useToastStore.setState((s) => ({ items: s.items.filter((t) => t.id !== id) }));
  }, 5000);
}

export const useToastStore = create<ToastStore>((set) => ({
  items: [],
  push: (kind, message) => {
    const id = nextToastId;
    nextToastId += 1;
    // Auto-dismiss after 5s without leaving orphans behind.
    autoDismiss(id);
    set((state) => {
      const items = [...state.items, { id, kind, message }];
      return { items: items.slice(Math.max(0, items.length - TOAST_STACK_CAP)) };
    });
  },
  dismiss: (id) =>
    set((state) => ({ items: state.items.filter((t) => t.id !== id) })),
}));

export function useToast() {
  const push = useToastStore((s) => s.push);
  return React.useMemo(
    () => ({
      toast: {
        info: (message: string) => push("info", message),
        success: (message: string) => push("success", message),
        error: (message: string) => push("error", message),
      },
    }),
    [push],
  );
}

export function Toaster() {
  const items = useToastStore((s) => s.items);
  const dismiss = useToastStore((s) => s.dismiss);
  return (
    <div
      role="region"
      aria-live="polite"
      aria-label="Notifications"
      className="pointer-events-none fixed bottom-4 right-4 z-[60] flex w-80 flex-col gap-2"
    >
      {items.map((t) => (
        <button
          key={t.id}
          type="button"
          onClick={() => dismiss(t.id)}
          className={cn(
            "pointer-events-auto w-full rounded-lg border px-4 py-3 text-left text-sm shadow-lg transition-all",
            t.kind === "error" && "sf-alert-red",
            t.kind === "success" && "sf-alert-emerald",
            t.kind === "info" &&
              "border-slate-200 bg-white text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200",
          )}
        >
          {t.message}
        </button>
      ))}
    </div>
  );
}

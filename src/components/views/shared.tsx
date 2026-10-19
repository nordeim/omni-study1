"use client";

// ---------------------------------------------------------------------------
// The shared view primitives — the single sources the 20 views consume
// (AGENTS.md: "Views orchestrate; shared.tsx owns the patterns"). Every
// measurement here is reference-derived; do not improvise values.
// ---------------------------------------------------------------------------

import * as React from "react";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

// ---- ViewHeader -------------------------------------------------------------

type ViewHeaderProps = {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  /** size="lg" → the 30px MyDay/FocusTimer titles. */
  size?: "default" | "lg";
  actions?: React.ReactNode;
};

/** h1 text-2xl font-bold text-slate-800 + optional 24px accent icon + 16px
 *  subtitle with the reference's exact per-view wording. Tasks/MyDay/Calendar
 *  pass no icon (reference-measured). */
export function ViewHeader({ title, subtitle, icon: Icon, size = "default", actions }: ViewHeaderProps) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <h1
          className={cn(
            "flex items-center gap-2 font-bold text-slate-800 dark:text-slate-100",
            size === "lg" ? "text-3xl" : "text-2xl",
          )}
        >
          {Icon && <Icon className="size-6 shrink-0 text-sf-primary" strokeWidth={2} />}
          {title}
        </h1>
        {subtitle && (
          <p className="mt-1 text-base text-slate-500 dark:text-slate-400">{subtitle}</p>
        )}
      </div>
      {actions}
    </div>
  );
}

// ---- StatCard -----------------------------------------------------------------

type StatCardProps = {
  icon: LucideIcon;
  label: string;
  value: React.ReactNode;
  hint?: string;
  iconClassName?: string;
  /** Inline sRGB gradient for the icon block (S4-K, the v4 trap-5 path). */
  iconBackground?: string;
};

/** KPI card — the reference anatomy (S3-A/S4-B): label (14px/500 slate-500,
 *  mb-1) → value heading (30px/700, normal tracking) → hint (14px, mt-1)
 *  stacked left; a 48px solid chip with a 24px WHITE glyph top-right; a soft
 *  wash blob clipped by the rounded-2xl card. The label/hint are DOM
 *  SIBLINGS of the value heading (the e2e reads
 *  previousElementSibling/nextElementSibling). The value renders as h2 and
 *  the hint as slate-500 — one conscious visual deviation each, both
 *  Lighthouse-driven (session 61): the stat h3s under the greeting h1
 *  tripped heading-order, and the reference's slate-400 hint fails WCAG AA
 *  on white (2.56:1; slate-500 = 4.76:1). Dark keeps the reference value. */
export function StatCard({ icon: Icon, label, value, hint, iconClassName, iconBackground }: StatCardProps) {
  return (
    <div className="sf-card relative overflow-hidden rounded-2xl p-6">
      <span
        aria-hidden
        className="pointer-events-none absolute -right-8 -top-8 size-28 rounded-full opacity-70"
        style={{
          backgroundImage:
            "linear-gradient(to bottom right, rgb(var(--sf-primary-empty-from)), rgb(var(--sf-primary-empty-to)))",
        }}
      />
      <div className="relative flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="mb-1 text-sm font-medium text-slate-500 dark:text-slate-400">{label}</p>
          <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100">{value}</h2>
          <p className="mt-1 text-sm text-slate-500">{hint ?? label}</p>
        </div>
        <span
          className={cn(
            "flex size-12 shrink-0 items-center justify-center rounded-xl sf-print-exact",
            iconClassName ?? "bg-violet-500 dark:bg-violet-500",
          )}
          style={iconBackground ? { backgroundImage: iconBackground } : undefined}
        >
          <Icon className="size-6 text-white" strokeWidth={2} />
        </span>
      </div>
    </div>
  );
}

// ---- SectionCard -----------------------------------------------------------------

type SectionCardProps = {
  title?: string;
  icon?: LucideIcon;
  action?: React.ReactNode;
  flush?: boolean;
  className?: string;
  bodyClassName?: string;
  children: React.ReactNode;
};

/** Card with an h2 header row; flush = edge-to-edge divide-y rows (S8). */
export function SectionCard({ title, icon: Icon, action, flush = false, className, bodyClassName, children }: SectionCardProps) {
  return (
    <section className={cn("sf-card overflow-hidden", className)}>
      {title && (
        <div className="flex items-center justify-between gap-3 p-6 pb-4">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-800 dark:text-slate-100">
            {Icon && <Icon className="size-5 text-sf-primary" strokeWidth={2} />}
            {title}
          </h2>
          {action}
        </div>
      )}
      <div className={cn(flush ? "divide-y divide-slate-50 dark:divide-slate-800" : "p-6 pt-0", title && !flush && "pt-0", bodyClassName)}>
        {children}
      </div>
    </section>
  );
}

// ---- Empty states ---------------------------------------------------------------

type EmptyStateProps = {
  icon: LucideIcon;
  title: string;
  hint: string;
  cta?: React.ReactNode;
};

/** The ONE empty-state design (S4): 80px rounded-2xl gradient block
 *  (empty-from → empty-to), 40px accent icon, 20px/600 h3, 16px hint. */
export function EmptyState({ icon: Icon, title, hint, cta }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      <div
        className="flex size-20 items-center justify-center rounded-2xl"
        style={{
          backgroundImage:
            "linear-gradient(to bottom right, rgb(var(--sf-primary-empty-from)), rgb(var(--sf-primary-empty-to)))",
        }}
      >
        <Icon className="size-10 text-sf-primary" strokeWidth={2} />
      </div>
      <h2 className="mt-4 text-xl font-semibold text-slate-800 dark:text-slate-100">{title}</h2>
      <p className="mt-1 text-base text-slate-500 dark:text-slate-400">{hint}</p>
      {cta && <div className="mt-6">{cta}</div>}
    </div>
  );
}

/** The slim inline empty (dashboard sections inside flush cards — S9-R). */
export function SimpleEmptyState({ icon: Icon, message }: { icon: LucideIcon; message: string }) {
  return (
    <div className="p-8 text-center text-slate-500 dark:text-slate-400">
      <Icon className="mx-auto mb-3 h-12 w-12 text-slate-300 dark:text-slate-600" strokeWidth={2} />
      <p className="text-sm text-slate-500 dark:text-slate-400">{message}</p>
    </div>
  );
}

// ---- SubjectChip -----------------------------------------------------------------

export function SubjectChip({ name, color }: { name?: string | null; color?: string | null }) {
  if (!name) return null;
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
      <span
        aria-hidden
        className="size-2 rounded-full"
        style={{ backgroundColor: color ?? "rgb(var(--sf-primary))" }}
      />
      {name}
    </span>
  );
}

// ---- Task row primitives (S6) ------------------------------------------------------

export const PRIORITY_BORDER: Record<string, string> = {
  none: "border-slate-300 dark:border-slate-600",
  low: "border-sky-400",
  medium: "border-amber-400",
  high: "border-red-400",
};

/** A 24px ROUND checkbox whose 2px border IS the priority color (S6 pin). */
export function PriorityCheckbox({
  checked,
  priority,
  onToggle,
  label,
}: {
  checked: boolean;
  priority: string;
  onToggle: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-label={label}
      onClick={onToggle}
      className={cn(
        "flex size-6 shrink-0 items-center justify-center rounded-full border-2 bg-white transition-colors dark:bg-slate-900",
        PRIORITY_BORDER[priority] ?? PRIORITY_BORDER.none,
        checked && "border-sf-primary bg-sf-primary text-sf-primary-foreground",
      )}
    >
      {checked && (
        <svg viewBox="0 0 12 12" className="size-3" fill="none" aria-hidden>
          <path d="M2 6.5 4.5 9 10 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </button>
  );
}

export function DuePill({ label, overdue }: { label: string; overdue?: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium",
        overdue
          // red-700 not the reference's red-600 — 5.32:1 on red-100 vs 3.95
          // (WCAG AA at the pill's 12px); Lighthouse session 61.
          ? "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300"
          : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
      )}
    >
      {label}
    </span>
  );
}

export function RepeatPill({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center rounded-full bg-violet-100 px-2.5 py-0.5 text-xs font-medium text-violet-600 dark:bg-violet-950 dark:text-violet-300">
      {label}
    </span>
  );
}

// ---- helpers -----------------------------------------------------------------------

/** First latin letter of userName || email — the avatar's initial fallback. */
export function initialFor(userName: string, email: string): string {
  const source = (userName || email || "").trim();
  for (const ch of source) {
    if (/[a-zA-Z]/.test(ch)) return ch.toUpperCase();
  }
  return "S";
}

/** Today's " HH:MM" time suffix for exam/datetime lines ("9:00 AM"). */
export function formatClockShort(date: Date): string {
  let hours = date.getHours() % 12;
  if (hours === 0) hours = 12;
  const minutes = date.getMinutes().toString().padStart(2, "0");
  return `${hours}:${minutes} ${date.getHours() < 12 ? "AM" : "PM"}`;
}

export function Spinner({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        "inline-block size-4 animate-spin rounded-full border-2 border-current border-t-transparent",
        className,
      )}
    />
  );
}

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
};

/** KPI card: 40px soft icon chip + big 30px value + caption. */
export function StatCard({ icon: Icon, label, value, hint, iconClassName }: StatCardProps) {
  return (
    <div className="sf-card overflow-hidden p-6">
      <div className="flex items-center gap-4">
        <div
          className={cn(
            "flex size-10 shrink-0 items-center justify-center rounded-xl",
            iconClassName ?? "bg-sf-primary-soft dark:bg-sf-primary-soft-dark/40",
          )}
        >
          <Icon className="size-5 text-sf-primary-strong dark:text-sf-primary-strong-dark" strokeWidth={2} />
        </div>
        <div className="min-w-0">
          <h3 className="truncate text-3xl font-bold text-slate-800 dark:text-slate-100">{value}</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">{hint ?? label}</p>
        </div>
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
      <h3 className="mt-4 text-xl font-semibold text-slate-800 dark:text-slate-100">{title}</h3>
      <p className="mt-1 text-base text-slate-500 dark:text-slate-400">{hint}</p>
      {cta && <div className="mt-6">{cta}</div>}
    </div>
  );
}

/** The slim inline empty (dashboard sections inside flush cards — S9-R). */
export function SimpleEmptyState({ icon: Icon, message }: { icon: LucideIcon; message: string }) {
  return (
    <div className="p-8 text-center">
      <Icon className="mx-auto mb-3 size-12 text-slate-300 dark:text-slate-600" strokeWidth={2} />
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
          ? "bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-300"
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

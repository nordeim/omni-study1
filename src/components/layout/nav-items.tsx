"use client";

// ---------------------------------------------------------------------------
// The ONE nav-item markup source (AGENTS.md) — consumed by BOTH the desktop
// sidebar and the mobile drawer; never re-implement the item markup.
// Icon set is reference-measured (S8-A): Calendar/Timetable share `calendar`,
// Events is calendar-days, Notes reuses book-open, Files is folder-open,
// Math Solver reuses calculator, Tasks is square-check-big, Analytics is
// chart-column.
// ---------------------------------------------------------------------------

import {
  BookOpen,
  Bot,
  Calculator,
  Calendar,
  CalendarDays,
  CalendarRange,
  ChartColumn,
  ClipboardList,
  Clock,
  FileText,
  FolderOpen,
  GraduationCap,
  LayoutDashboard,
  ListChecks,
  Layers,
  Settings,
  SquareCheckBig,
  Sun,
  Users,
  type LucideIcon,
} from "lucide-react";

import { NAV_ACTIVE_GRADIENT_STOPS } from "@/lib/theme";
import { NAV_ITEMS } from "@/lib/router";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/lib/store";
import type { ViewId } from "@/lib/router";

export const NAV_ICONS: Record<ViewId, LucideIcon> = {
  dashboard: LayoutDashboard,
  myday: Sun,
  tasks: SquareCheckBig,
  calendar: Calendar,
  events: CalendarDays,
  timetable: CalendarRange,
  assignments: ClipboardList,
  exams: GraduationCap,
  notes: BookOpen,
  flashcards: Layers,
  practicetests: FileText,
  studygroups: Users,
  gradetracker: ListChecks,
  analytics: ChartColumn,
  files: FolderOpen,
  calculator: Calculator,
  mathsolver: Calculator,
  aiassistant: Bot,
  focustimer: Clock,
  settings: Settings,
};

type NavItemLinkProps = {
  view: ViewId;
  collapsed?: boolean;
  onNavigate?: () => void;
  className?: string;
  /** "drawer" → light link colors on the dark panel (S10 drawer pin). */
  tone?: "default" | "drawer";
};

/**
 * Icon + label + trailing dot; active = 10% gradient tint (primary →
 * avatarTo, the measured S8-A stops) + strong text + aria-current.
 */
export function NavItemLink({ view, collapsed = false, onNavigate, className, tone = "default" }: NavItemLinkProps) {
  const item = NAV_ITEMS.find((n) => n.id === view);
  const active = useAppStore((s) => s.view) === view;
  const navigate = useAppStore((s) => s.navigate);
  if (!item) return null;
  const Icon = NAV_ICONS[view];

  return (
    <a
      href={item.path}
      aria-current={active ? "page" : undefined}
      aria-label={collapsed ? item.label : undefined}
      title={collapsed ? item.label : undefined}
      onClick={(e) => {
        e.preventDefault();
        navigate(view);
        onNavigate?.();
      }}
      className={cn(
        "group flex py-3 outline-none transition-colors focus-visible:ring-2 focus-visible:ring-sf-primary/40",
        collapsed ? "px-0" : "px-4",
        active
          ? "text-sf-primary-strong dark:text-sf-primary-strong-dark"
          : "text-slate-600 dark:text-slate-300",
        tone === "drawer" && "dark:text-zinc-50",
        className,
      )}
    >
      {/* The tinted tile the e2e pins measure (navigation.spec: the first
          span of the active link carries the 10% gradient + violet-600 text,
          span.rounded-xl reads 12px, the trailing dot carries ml-auto). The
          <a> is the hit area; this span is the visual chip. */}
      <span
        className={cn(
          "flex flex-1 items-center rounded-xl transition-colors",
          collapsed
            ? "px-4" // S52-C: collapsed icons sit LEFT-ALIGNED at x=32 (nav p-4 + span px-4)
            : "gap-3 hover:bg-slate-100/70 dark:hover:bg-slate-800/60",
        )}
        style={
          active
            ? {
                backgroundImage: `linear-gradient(to right, rgb(var(--sf-primary) / ${NAV_ACTIVE_GRADIENT_STOPS.alpha}), rgb(var(--sf-primary-${NAV_ACTIVE_GRADIENT_STOPS.toCssVar}) / ${NAV_ACTIVE_GRADIENT_STOPS.alpha}))`,
              }
            : undefined
        }
      >
        <Icon
          className={cn(
            "h-5 w-5 shrink-0",
            active && "text-sf-primary dark:text-sf-primary-strong-dark",
          )}
          strokeWidth={2}
        />
        {!collapsed && (
          <span className={cn("flex-1 truncate text-base", active && "font-medium")}>{item.label}</span>
        )}
        {!collapsed && active && (
          <span
            aria-hidden
            className="ml-auto size-2 shrink-0 rounded-full bg-sf-primary"
          />
        )}
      </span>
    </a>
  );
}

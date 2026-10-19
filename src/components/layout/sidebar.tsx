"use client";

// ---------------------------------------------------------------------------
// The desktop chrome (§5): a fixed glass rail — `hidden lg:flex`, w-[260px]
// expanded / w-20 collapsed (S52 re-measure). Everything below lg goes
// through the mobile drawer; `main` carries the lg:ml offset (page.tsx).
//
// Measured anatomy: brand chip 40px gradient (primary → gradient-to, the
// S4-G indigo-600 end), a live clock chip (violet-50 → indigo-50 to bottom
// right, 2-digit-hour 12h time + "Tue, Oct 6" date), the shared NavItemLink
// list, and a footer with the 36px avatar + identity. Collapsed: brand and
// footer unmount, the chevron toggle survives in the header row in BOTH
// states (ONE ChevronLeft glyph, rotate-180 when collapsed), and the nav
// icons sit LEFT-ALIGNED at px-4 (svg x=32).
// ---------------------------------------------------------------------------

import * as React from "react";
import { ChevronLeft, GraduationCap } from "lucide-react";

import { NavItemLink } from "@/components/layout/nav-items";
import { UserAvatar } from "@/components/layout/user-avatar";
import { NAV_ITEMS } from "@/lib/router";
import { formatShortWithYear, formatTime12h } from "@/lib/date";
import { useAppStore, useThemeStore } from "@/lib/store";
import { cn } from "@/lib/utils";

/** Ticking clock — 1s interval, cleaned up on unmount. Mounted only after
 *  auth (client-only), so the first render never races SSR hydration. */
function useNow(): Date {
  const [now, setNow] = React.useState(() => new Date());
  React.useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);
  return now;
}

export function Sidebar() {
  const collapsed = useAppStore((s) => s.sidebarCollapsed);
  const toggleSidebar = useAppStore((s) => s.toggleSidebar);
  const userName = useThemeStore((s) => s.userName);
  const email = useThemeStore((s) => s.email);
  const now = useNow();

  return (
    <aside
      className={cn(
        "glass fixed bottom-0 left-0 top-0 z-30 hidden flex-col transition-[width] duration-200 lg:flex",
        collapsed ? "w-20" : "w-[260px]",
      )}
    >
      {/* Header row: brand + collapse toggle (the toggle renders in BOTH
          states — S52; the brand chip unmounts when collapsed). */}
      <div
        className={cn(
          "flex h-16 shrink-0 items-center px-4",
          collapsed ? "justify-center" : "justify-between",
        )}
      >
        {!collapsed && (
          <div className="flex items-center gap-3">
            <span
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white sf-print-exact"
              style={{
                backgroundImage:
                  "linear-gradient(to right, rgb(var(--sf-primary)), rgb(var(--sf-primary-gradient-to)))",
              }}
            >
              <GraduationCap className="h-5 w-5" strokeWidth={2} />
            </span>
            <div className="min-w-0">
              {/* Reference (measured s67): h1.text-lg — v4 defaults render
                  18px/28px; the old leading-tight crushed the lh to 22.5. */}
              <p className="text-lg font-bold text-slate-800 dark:text-slate-100">
                StudyFlow
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Your study companion
              </p>
            </div>
          </div>
        )}
        <button
          type="button"
          onClick={toggleSidebar}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className={cn(
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-500 outline-none transition-colors hover:bg-slate-100/70 focus-visible:ring-2 focus-visible:ring-sf-primary/40 dark:text-slate-400 dark:hover:bg-slate-800/60",
            collapsed && "mx-auto",
          )}
        >
          <ChevronLeft
            className={cn("h-5 w-5 transition-transform", collapsed && "rotate-180")}
            strokeWidth={2}
          />
        </button>
      </div>

      {/* The ONE nav-item source — NavItemLink for every NAV_ITEM. */}
      <nav
        aria-label="Primary"
        className="sf-scroll flex flex-1 flex-col gap-1 overflow-y-auto p-4"
      >
        {NAV_ITEMS.map((item) => (
          <NavItemLink key={item.id} view={item.id} collapsed={collapsed} />
        ))}
      </nav>

      {/* Footer = the aside's LAST child (S52): clock chip + identity when
          expanded; completely EMPTY when collapsed (stays mounted, zero
          children, zero height — S52-D). */}
      {/* A DIV (not <footer>): the S52-A locator reads :scope > div:last-child. */}
      <div className="shrink-0">
        {!collapsed && (
          <>
            {/* Live clock chip — violet-50 → indigo-50 (S3-B), deep time
                text (S3-C). */}
            <div className="px-4 pb-2">
              <div className="sf-clock-chip sf-print-exact rounded-xl p-2">
                <p className="sf-clock-time whitespace-nowrap text-sm font-semibold">
                  {formatTime12h(now)}
                </p>
                <p className="sf-clock-date truncate text-xs">{formatShortWithYear(now)}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 pt-0">
              <UserAvatar size="sm" />
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-slate-700 dark:text-slate-200">
                  {userName || "StudyFlow user"}
                </p>
                <p className="truncate text-xs text-slate-500 dark:text-slate-400">{email}</p>
              </div>
            </div>
          </>
        )}
      </div>
    </aside>
  );
}

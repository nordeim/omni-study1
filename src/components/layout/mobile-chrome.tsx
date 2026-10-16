"use client";

// ---------------------------------------------------------------------------
// The below-lg chrome (§5): a fixed h-16 glass app bar (hamburger + 32px
// gradient brand chip + "StudyFlow" + a live clock — NEVER the view title)
// and the slide-in navigation drawer. Reference-measured drawer geometry the
// e2e suite pins: a full-viewport dialog over a bg-black/20 backdrop-blur-xs
// backdrop button, a 288px (w-72) white panel (dark: slate-950) with the
// 40px-chip brand header + "Your study companion" + all 20 shared
// NavItemLinks and NO footer; Esc and backdrop-tap close it; body scroll is
// locked while open.
//
// Trap 4: the nav list is flex flex-col gap-* — never space-y-* with mt-*/
// mb-* children (v4's :where() rewrite flips the specificity outcome).
// ---------------------------------------------------------------------------

import * as React from "react";
import { GraduationCap, Menu, X } from "lucide-react";

import { NavItemLink } from "@/components/layout/nav-items";
import { NAV_ITEMS } from "@/lib/router";
import { formatTime12h } from "@/lib/date";
import { useAppStore } from "@/lib/store";

/** Ticking clock — 1s interval, cleaned up on unmount (client-only mount). */
function useNow(): Date {
  const [now, setNow] = React.useState(() => new Date());
  React.useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);
  return now;
}

export function MobileChrome() {
  const mobileMenuOpen = useAppStore((s) => s.mobileMenuOpen);
  const setMobileMenu = useAppStore((s) => s.setMobileMenu);
  const sidebarCollapsed = useAppStore((s) => s.sidebarCollapsed);
  const now = useNow();
  const close = React.useCallback(() => setMobileMenu(false), [setMobileMenu]);

  // While the drawer is open: lock body scroll, close on Escape, and close
  // if the viewport crosses into lg (the app bar itself disappears there).
  React.useEffect(() => {
    if (!mobileMenuOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);

    const desktop = window.matchMedia("(min-width: 1024px)");
    const onBreakpoint = () => {
      if (desktop.matches) close();
    };
    desktop.addEventListener("change", onBreakpoint);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKey);
      desktop.removeEventListener("change", onBreakpoint);
    };
  }, [mobileMenuOpen, close]);

  return (
    <>
      {/* App bar (the page's banner): brand + clock on BOTH sides of the
          hamburger — the reference never swaps in the view title. */}
      <header className="glass fixed left-0 right-0 top-0 z-30 flex h-16 items-center justify-between px-4 lg:hidden">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            aria-label="Open navigation menu"
            aria-expanded={mobileMenuOpen}
            onClick={() => setMobileMenu(true)}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-600 outline-none transition-colors hover:bg-slate-100/70 focus-visible:ring-2 focus-visible:ring-sf-primary/40 dark:text-slate-300 dark:hover:bg-slate-800/60"
          >
            <Menu className="h-5 w-5" strokeWidth={2} />
          </button>
          <span
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-white sf-print-exact"
            style={{
              backgroundImage:
                "linear-gradient(to right, rgb(var(--sf-primary)), rgb(var(--sf-primary-gradient-to)))",
            }}
          >
            <GraduationCap className="h-4 w-4" strokeWidth={2} />
          </span>
          <span className="text-lg font-bold text-slate-800 dark:text-slate-100">
            StudyFlow
          </span>
        </div>
        <p className="shrink-0 text-sm font-semibold text-slate-700 dark:text-slate-200">
          {formatTime12h(now)}
        </p>
      </header>

      {/* The slide-in drawer — mounted only while open. */}
      {mobileMenuOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Navigation menu"
          className="fixed inset-0 z-50"
        >
          <button
            type="button"
            aria-label="Close navigation menu"
            onClick={close}
            className="absolute inset-0 bg-black/20 backdrop-blur-xs"
          />
          <div className="sf-slide-in absolute inset-y-0 left-0 flex w-72 max-w-[85vw] flex-col bg-white shadow-2xl dark:bg-slate-950">
            <div className="flex shrink-0 items-start justify-between gap-3 p-6 pb-4">
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
                <div>
                  <p className="text-lg font-bold leading-tight text-slate-800 dark:text-slate-100">
                    StudyFlow
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Your study companion
                  </p>
                </div>
              </div>
              <button
                type="button"
                aria-label="Close menu"
                onClick={close}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-500 outline-none transition-colors hover:bg-slate-100/70 focus-visible:ring-2 focus-visible:ring-sf-primary/40 dark:text-slate-400 dark:hover:bg-slate-800/60"
              >
                <X className="h-5 w-5" strokeWidth={2} />
              </button>
            </div>
            {/* Shares the sidebar's collapsed state (icon-only links when the
                rail is collapsed — the reference's own drawer behavior). */}
            <nav
              aria-label="Primary"
              className="sf-scroll flex flex-1 flex-col gap-1 overflow-y-auto p-4"
            >
              {NAV_ITEMS.map((item) => (
                <NavItemLink
                  key={item.id}
                  view={item.id}
                  collapsed={sidebarCollapsed}
                  onNavigate={close}
                />
              ))}
            </nav>
          </div>
        </div>
      )}
    </>
  );
}

"use client";

// ---------------------------------------------------------------------------
// The below-lg chrome (§5): a fixed h-16 glass app bar (hamburger + 32px
// gradient brand chip + "StudyFlow" + a live clock — NEVER the view title)
// and the navigation drawer. Reference-measured drawer geometry the e2e
// suite pins: a full-viewport dialog over a bg-black/20 backdrop-blur-xs
// backdrop button, a 288px (w-72) white panel (dark: slate-950) with the
// 40px-chip brand header + "Your study companion" + all 20 shared
// NavItemLinks and NO footer; Esc and backdrop-tap close it; body scroll is
// locked while open. The panel opens INSTANTLY — the reference's own
// measured behavior (transition: all 0s; S118/Q1 — the inert sf-slide-in
// class and its keyframes were removed as dead code).
// S118/BS4 — the focus lifecycle: opening moves focus INTO the dialog (the
// panel's close button), Tab is contained to the dialog's focusables while
// aria-modal is announced, and closing restores focus to the opener (the
// hamburger) — the WCAG 2.2 AA modal contract the role/aria already claimed.
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

  // While the drawer is open: lock body scroll, close on Escape, close
  // if the viewport crosses into lg (the app bar itself disappears there),
  // and run the modal focus lifecycle (S118/BS4): focus-in on open, Tab
  // contained, focus restored to the opener on close.
  React.useEffect(() => {
    if (!mobileMenuOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // BS4: the opener (the hamburger, normally) gets focus back on close.
    const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const dialog = document.querySelector<HTMLElement>('[role="dialog"][aria-label="Navigation menu"]');
    const focusables = () =>
      dialog
        ? Array.from(
            dialog.querySelectorAll<HTMLElement>(
              'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
            ),
          ).filter((el) => el.offsetParent !== null)
        : [];

    // BS4: land focus on the panel's own close button — a real control at
    // the top of the announced modal (never the panel container).
    dialog?.querySelector<HTMLElement>('button[aria-label="Close menu"]')?.focus();

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        close();
        return;
      }
      if (event.key !== "Tab") return;
      const items = focusables();
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement;
      if (!dialog?.contains(active)) {
        // Focus escaped the dialog (an async re-render reclaim) — pull it
        // back inside rather than letting Tab walk the background.
        event.preventDefault();
        (event.shiftKey ? last : first).focus();
        return;
      }
      if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
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
      // BS4: hand focus back to the opener (the hamburger) — the modal's
      // exit contract. The opener may be gone (a view unmount); guard it.
      if (opener && document.contains(opener)) opener.focus();
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
          <span className="text-base font-bold text-slate-800 dark:text-slate-100">
            StudyFlow
          </span>
        </div>
        {/* S3-L part 1 (measured s68): the reference app-bar clock reads
            14px/500 slate-600 — the old 600/slate-700 read a step heavier. */}
        <p className="shrink-0 text-sm font-medium text-slate-600 dark:text-slate-200">
          {formatTime12h(now)}
        </p>
      </header>

      {/* The navigation drawer — mounted only while open (instant open: the
          reference's measured behavior; S118/Q1). */}
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
          <div className="absolute inset-y-0 left-0 flex w-72 max-w-[85vw] flex-col bg-white shadow-2xl dark:bg-slate-950">
            {/* S3-L (measured s68): the reference brand block is p-6 with a
                border-b divider (89px tall) — the old p-6 pb-4 (80px, no
                divider) dropped the line the reference draws under it. */}
            <div className="flex shrink-0 items-start justify-between gap-3 border-b border-slate-100 p-6 dark:border-slate-800">
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
                  <p className="text-base font-bold text-slate-800 dark:text-slate-100">
                    StudyFlow
                  </p>
                  {/* S3-L note (measured s68): the reference renders this
                      subtitle text-slate-400 (2.56:1 — an axe failure); the
                      clone keeps slate-500 (4.76:1) — the documented
                      a11y-superset deviation. */}
                  <p className="text-xs text-slate-500 dark:text-slate-400">
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
              className="sf-scroll flex flex-1 flex-col overflow-y-auto p-4"
            >
              {NAV_ITEMS.map((item) => (
                <NavItemLink
                  key={item.id}
                  view={item.id}
                  collapsed={sidebarCollapsed}
                  onNavigate={close}
                  tone="drawer"
                />
              ))}
            </nav>
          </div>
        </div>
      )}
    </>
  );
}

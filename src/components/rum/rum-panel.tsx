"use client";

// ---------------------------------------------------------------------------
// RumPanel (ADR-017/ADR-018) — the /rum diagnostics panel: the five CWV at
// p75 with rating badges re-derived from the VALUE via the pure seam
// (classifyP75), the accent-themed sparklines (buildSparklinePoints), and the
// CSV export anchor (GET /api/rum/export). Display logic lives in the pinned
// seam — the panel only renders + refreshes. Themes through the production
// path (boot script + loadFromUser via /api/auth/me).
// ---------------------------------------------------------------------------

import * as React from "react";

import { Button } from "@/components/ui/button";
import { apiGet, isTimeoutError } from "@/lib/api";
import {
  buildPanelRows,
  buildSparklinePoints,
  type RumAggregate,
} from "@/lib/rum-diagnostics";
import { useThemeStore, type AppUser } from "@/lib/store";
import { cn } from "@/lib/utils";

const REFRESH_INTERVAL_MS = 30_000;

const RATING_BADGE_CLASSES: Record<string, string> = {
  good: "bg-emerald-100 text-emerald-700",
  "needs-improvement": "bg-amber-100 text-amber-700",
  poor: "bg-red-100 text-red-700",
};

const RATING_LABELS: Record<string, string> = {
  good: "Good",
  "needs-improvement": "Needs improvement",
  poor: "Poor",
};

function errorMessage(err: unknown, fallback: string): string {
  return err instanceof Error && err.message ? err.message : fallback;
}

export function RumPanel() {
  const [aggregate, setAggregate] = React.useState<RumAggregate | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [refreshing, setRefreshing] = React.useState(false);

  const load = React.useCallback(async () => {
    try {
      const data = await apiGet<RumAggregate>("/api/rum");
      setAggregate(data);
      setError(null);
    } catch (err: unknown) {
      setError(
        isTimeoutError(err)
          ? "The diagnostics request took too long. Try again."
          : errorMessage(err, "Could not load the RUM aggregates."),
      );
    } finally {
      setRefreshing(false);
    }
  }, []);

  // Refresh affordance (button/interval context — never the effect body):
  // the spinner flips on BEFORE the fetch, load() itself only settles it.
  const refresh = React.useCallback(() => {
    setRefreshing(true);
    void load();
  }, [load]);

  // Optional ambient refresh — one interval, cleaned up.
  React.useEffect(() => {
    const id = window.setInterval(() => {
      refresh();
    }, REFRESH_INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [load]);

  // The production theme path: the boot script pre-paints; the store
  // hydrates the accent vars from /api/auth/me exactly like the shell.
  React.useEffect(() => {
    let cancelled = false;
    apiGet<{ user: AppUser }>("/api/auth/me")
      .then((response) => {
        if (!cancelled) useThemeStore.getState().loadFromUser(response.user);
      })
      .catch(() => {
        // an anonymous visitor never reaches this panel (the server gate)
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const rows = aggregate ? buildPanelRows(aggregate) : null;

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 p-6 pt-10">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">RUM diagnostics</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Field performance (p75) for your sessions.
          </p>
          <p className="mt-0.5 text-xs text-slate-400 dark:text-slate-500">
            Linked from nowhere — owners navigate directly.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={refresh} disabled={refreshing}>
            {refreshing ? "Refreshing…" : "Refresh"}
          </Button>
          <Button variant="outline" asChild>
            <a href="/api/rum/export" download>
              Export CSV
            </a>
          </Button>
        </div>
      </header>

      {error && (
        <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-950 dark:text-red-300">
          {error}
        </p>
      )}

      {!rows ? (
        <p className="py-16 text-center text-sm text-slate-500">Loading the field metrics…</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {rows.cards.map((card) => {
            const points = buildSparklinePoints(card.points, 100, 32);
            return (
              <section key={card.metric} className="sf-card p-6">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h2 className="font-mono text-sm font-semibold text-slate-800 dark:text-slate-100">
                      {card.metric}
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{card.label}</p>
                  </div>
                  {card.rating && (
                    <span
                      className={cn(
                        "rounded-full px-2.5 py-0.5 text-xs font-semibold",
                        RATING_BADGE_CLASSES[card.rating] ?? "bg-slate-100 text-slate-600",
                      )}
                    >
                      {RATING_LABELS[card.rating] ?? card.rating}
                    </span>
                  )}
                </div>
                <p className="mt-3 text-3xl font-bold tabular-nums text-slate-800 dark:text-slate-100">
                  {card.formatted ?? "—"}
                </p>
                <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                  {card.sampled ? `${card.points.length} recent samples` : "No samples yet"}
                </p>
                {points.length > 0 && (
                  <svg
                    viewBox="0 0 100 32"
                    preserveAspectRatio="none"
                    className="mt-3 h-8 w-full"
                    aria-hidden
                  >
                    <polyline
                      points={points.map((p) => `${p.x},${p.y}`).join(" ")}
                      fill="none"
                      stroke="rgb(var(--sf-primary))"
                      strokeWidth="2"
                      vectorEffect="non-scaling-stroke"
                      strokeLinejoin="round"
                      strokeLinecap="round"
                    />
                  </svg>
                )}
              </section>
            );
          })}
        </div>
      )}
    </main>
  );
}

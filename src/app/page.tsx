"use client";

// ---------------------------------------------------------------------------
// The WHOLE app (§5): one page — auth gate → shell → view switcher. The 20
// PascalCase paths are rewritten onto / by next.config.ts; the store syncs
// the view with the pathname (hydrate()).
//
// Load-stability contract (ADR-014): the ACTIVE view's initial collections
// pre-warm IN PARALLEL with /api/auth/me and the Splash flips only when BOTH
// settle — first paint renders with final geometry (dashboard CLS 0.00). A
// failed pre-warm never blocks the shell (the background loadAll retries).
// A 401 leaves through window.location.replace("/login") — a FULL reload, so
// the theme boot script re-defaults before the login surface paints.
// ---------------------------------------------------------------------------

import * as React from "react";

import { ConnectivityBanner } from "@/components/layout/connectivity-banner";
import { MobileChrome } from "@/components/layout/mobile-chrome";
import { RumBeacon } from "@/components/layout/rum-beacon";
import { Sidebar } from "@/components/layout/sidebar";
import { GraduationCap } from "lucide-react";
import { apiGet, ApiError } from "@/lib/api";
import { useDataStore } from "@/lib/data";
import { INITIAL_COLLECTIONS } from "@/lib/view-collections";
import type { ViewId } from "@/lib/router";
import {
  useAppStore,
  useThemeStore,
  type AppUser,
} from "@/lib/store";
import { cn } from "@/lib/utils";

import { AIAssistantView } from "@/components/views/aiassistant-view";
import { AnalyticsView } from "@/components/views/analytics-view";
import { AssignmentsView } from "@/components/views/assignments-view";
import { CalendarView } from "@/components/views/calendar-view";
import { CalculatorView } from "@/components/views/calculator-view";
import { DashboardView } from "@/components/views/dashboard-view";
import { EventsView } from "@/components/views/events-view";
import { ExamsView } from "@/components/views/exams-view";
import { FilesView } from "@/components/views/files-view";
import { FlashcardsView } from "@/components/views/flashcards-view";
import { FocusTimerView } from "@/components/views/focustimer-view";
import { GradeTrackerView } from "@/components/views/gradetracker-view";
import { MathSolverView } from "@/components/views/mathsolver-view";
import { MyDayView } from "@/components/views/myday-view";
import { NotesView } from "@/components/views/notes-view";
import { PracticeTestsView } from "@/components/views/practicetests-view";
import { SettingsView } from "@/components/views/settings-view";
import { StudyGroupsView } from "@/components/views/studygroups-view";
import { TasksView } from "@/components/views/tasks-view";
import { TimetableView } from "@/components/views/timetable-view";

/**
 * Sets data-app-hydrated on the shell commit — the e2e gate that proves
 * the authed chrome (sidebar nav) has actually rendered. The --sf-primary
 * wait alone resolves pre-paint via the boot script (S8-A lesson).
 */
function HydrationMarker() {
  React.useEffect(() => {
    document.documentElement.dataset.appHydrated = "true";
  }, []);
  return null;
}

/** The static view registry — one component per NAV_ITEM view id. */
const VIEW_COMPONENTS: Record<ViewId, React.ComponentType> = {
  dashboard: DashboardView,
  myday: MyDayView,
  tasks: TasksView,
  calendar: CalendarView,
  events: EventsView,
  timetable: TimetableView,
  assignments: AssignmentsView,
  exams: ExamsView,
  notes: NotesView,
  flashcards: FlashcardsView,
  practicetests: PracticeTestsView,
  studygroups: StudyGroupsView,
  gradetracker: GradeTrackerView,
  analytics: AnalyticsView,
  files: FilesView,
  calculator: CalculatorView,
  mathsolver: MathSolverView,
  aiassistant: AIAssistantView,
  focustimer: FocusTimerView,
  settings: SettingsView,
};

type GateStatus = "loading" | "ready" | "error";

function Splash({ error, onRetry }: { error?: string; onRetry?: () => void }) {
  return (
    <div className="sf-canvas flex min-h-dvh flex-col items-center justify-center gap-4">
      <span
        className="sf-print-exact flex h-14 w-14 animate-pulse items-center justify-center rounded-2xl text-white"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgb(var(--sf-primary)), rgb(var(--sf-primary-gradient-to)))",
        }}
      >
        <GraduationCap className="h-7 w-7" strokeWidth={2} />
      </span>
      {error && (
        <div className="flex flex-col items-center gap-2 text-center">
          <p className="text-sm text-slate-500 dark:text-slate-400">{error}</p>
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="rounded-md px-3 py-1.5 text-sm font-medium text-sf-primary-strong outline-none focus-visible:ring-2 focus-visible:ring-sf-primary/40 dark:text-sf-primary-strong-dark"
            >
              Try again
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default function Home() {
  const [status, setStatus] = React.useState<GateStatus>("loading");
  const [gateError, setGateError] = React.useState<string>("");
  const [attempt, setAttempt] = React.useState(0);
  const view = useAppStore((s) => s.view);
  const sidebarCollapsed = useAppStore((s) => s.sidebarCollapsed);

  React.useEffect(() => {
    let cancelled = false;

    const boot = async () => {
      setStatus("loading");
      setGateError("");
      // The view comes from the URL, not the render closure (AP-59 family).
      useAppStore.getState().hydrate();
      const activeView = useAppStore.getState().view;

      // The pre-warm rides IN PARALLEL with the auth round-trip and never
      // blocks the shell on failure (the view's own loadAll retries).
      const prewarm = useDataStore
        .getState()
        .loadCollections(INITIAL_COLLECTIONS[activeView])
        .catch(() => {});

      try {
        const { user } = await apiGet<{ user: AppUser }>("/api/auth/me");
        if (cancelled) return;

        const theme = useThemeStore.getState();
        theme.loadFromUser(user);
        theme.installSystemThemeTracking();

        await prewarm;
        if (cancelled) return;

        setStatus("ready");
        // The full background refresh: pre-warmed collections stay, the
        // rest of the cache fills without gating the first paint. S118/BS9:
        // a failed fetch must never reject into an unhandled rejection —
        // the offline state surfaces through the connectivity banner and
        // heals on the first view switch's loadCollections (the pre-warm's
        // own .catch convention).
        void useDataStore.getState().loadAll().catch(() => {});
      } catch (err: unknown) {
        if (cancelled) return;
        if (err instanceof ApiError && err.status === 401) {
          // FULL reload — the boot script re-defaults the theme on /login.
          window.location.replace("/login");
          return;
        }
        setGateError(
          err instanceof Error
            ? err.message
            : "Something went wrong while loading your workspace.",
        );
        setStatus("error");
      }
    };

    void boot();
    return () => {
      cancelled = true;
    };
  }, [attempt]);

  if (status !== "ready") {
    return (
      <>
        <a href="#main-content" className="sf-skip-link">
          Skip to main content
        </a>
        <Splash
          error={status === "error" ? gateError : undefined}
          onRetry={status === "error" ? () => setAttempt((n) => n + 1) : undefined}
        />
      </>
    );
  }

  const ActiveView = VIEW_COMPONENTS[view] ?? VIEW_COMPONENTS.dashboard;

  return (
    <>
      <a href="#main-content" className="sf-skip-link">
        Skip to main content
      </a>
      <Sidebar />
      <HydrationMarker />
      <MobileChrome />
      <ConnectivityBanner />
      <RumBeacon />
      <main
        id="main-content"
        tabIndex={-1}
        className={cn(
          // duration-200 matches the rail (S118/BS10): the margin transition
          // otherwise rides the 150 ms default and finishes early.
          "p-4 pt-20 outline-none transition-[margin] duration-200 lg:p-8 lg:pt-8",
          sidebarCollapsed ? "lg:ml-20" : "lg:ml-[260px]",
        )}
      >
        <ActiveView />
      </main>
    </>
  );
}

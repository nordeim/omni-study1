"use client";

// ---------------------------------------------------------------------------
// DashboardView (S9-A/R + S6-D + S8-B) — greeting header, the conditional
// overdue alert banner, 4 KPI stat cards and the flush divide-y section
// cards (Today's Tasks bare rows, Upcoming Exams, Upcoming Assignments).
// ---------------------------------------------------------------------------

import * as React from "react";
import {
  ArrowRight,
  BookOpen,
  Calendar,
  CircleAlert,
  Clock,
  Flame,
  GraduationCap,
  Sparkles,
  SquareCheckBig,
  Target,
} from "lucide-react";

import { useToast } from "@/components/ui/toast";
import { mutations, useDataStore } from "@/lib/data";
import {
  dayBucketLabel,
  daysUntil,
  formatFocusHours,
  formatLongDateWithWeekday,
  formatShortWithYear,
  isSameDay,
  isSameMonth,
  startOfDay,
} from "@/lib/date";
import { currentGreeting, type ViewId } from "@/lib/router";
import { Button } from "@/components/ui/button";
import { useAppStore, useThemeStore } from "@/lib/store";
import {
  SectionCard,
  SimpleEmptyState,
  Spinner,
  StatCard,
  PRIORITY_BORDER,
} from "@/components/views/shared";

function firstNameOf(userName: string): string {
  const first = userName.trim().split(/\s+/)[0];
  return first || "there";
}

// S4-Q (measured s70, probes #2/#3): all three section headers share the
// reference's anchor>button anatomy — <a href href>
// <button text-xs font-medium text-sf-primary-strong (violet-600,
// rgb(124,58,237)) h-8>label<ArrowRight/></button></a>. The anchor is
// unstyled on the reference; the focus ring is the clone's documented a11y
// superset. The s69 probe had read the anchor's inherited 16px neutral-950
// — the visible text is the button's (AP-108 re-measure). Module scope per
// the static-components rule (a component declared in render resets state).
function SectionLink({ href, view, label, onNavigate }: { href: string; view: ViewId; label: string; onNavigate: (v: ViewId) => void }) {
  return (
    <a
      href={href}
      onClick={(e) => {
        e.preventDefault();
        onNavigate(view);
      }}
      className="rounded-md outline-none focus-visible:ring-2 focus-visible:ring-sf-primary/40"
    >
      <button
        type="button"
        // S83/AJ6: the nested button is its OWN tab stop (a focusable
        // inside a focusable) — it must carry its own focus-visible ring;
        // the anchor's ring never renders when the button holds focus.
        className="inline-flex h-8 items-center justify-center gap-2 whitespace-nowrap px-3.5 text-xs font-medium text-sf-primary-strong transition-colors outline-none focus-visible:ring-2 focus-visible:ring-sf-primary/40 dark:text-sf-primary-strong-dark"
      >
        {label}
        <ArrowRight className="size-4" strokeWidth={2} aria-hidden />
      </button>
    </a>
  );
}

export function DashboardView() {
  const { toast } = useToast();
  const tasks = useDataStore((s) => s.tasks);
  const exams = useDataStore((s) => s.exams);
  const assignments = useDataStore((s) => s.assignments);
  const subjects = useDataStore((s) => s.subjects);
  const focusSessions = useDataStore((s) => s.focusSessions);
  const loading = useDataStore((s) => s.loading);
  const userName = useThemeStore((s) => s.userName);
  const navigate = useAppStore((s) => s.navigate);

  const today = startOfDay(new Date());

  const run = React.useCallback(
    (promise: Promise<void>, fallback: string) => {
      promise.catch((err: unknown) =>
        toast.error(err instanceof Error && err.message ? err.message : fallback),
      );
    },
    [toast],
  );

  // ---- KPI figures ----------------------------------------------------------
  const todayScope = tasks.filter(
    (t) => t.myDay || (t.dueDate !== null && isSameDay(new Date(t.dueDate), today)),
  );
  const doneToday = todayScope.filter((t) => t.completed).length;
  const pendingCount = tasks.filter((t) => !t.completed).length;
  const dueSoonCount = tasks.filter((t) => {
    if (t.completed || !t.dueDate) return false;
    const diff = daysUntil(new Date(t.dueDate), today);
    return diff >= 0 && diff <= 7;
  }).length;
  const focusSeconds = focusSessions
    // S4-K (measured s68): the reference's Focus Time stat is MONTH-scoped
    // ("0h" + hint "this month") — not today-minutes.
    .filter((s) => isSameMonth(new Date(s.startedAt), today))
    .reduce((acc, s) => acc + s.durationSeconds, 0);

  // ---- overdue banner (S9-A) -------------------------------------------------
  const overdue = tasks.filter(
    (t) => !t.completed && t.dueDate !== null && daysUntil(new Date(t.dueDate), today) < 0,
  );

  // ---- section data ----------------------------------------------------------
  const subjectColor = React.useCallback(
    (id: string | null) => subjects.find((s) => s.id === id)?.color ?? null,
    [subjects],
  );

  const upcomingExams = exams
    .filter((e) => daysUntil(new Date(e.date), today) >= 0)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const activeAssignments = assignments
    .filter((a) => a.progress < 100)
    .sort((a, b) => {
      const aTime = a.dueDate ? new Date(a.dueDate).getTime() : Number.MAX_SAFE_INTEGER;
      const bTime = b.dueDate ? new Date(b.dueDate).getTime() : Number.MAX_SAFE_INTEGER;
      return aTime - bTime;
    });

  const dashboardTaskActions = {
    onToggle: (id: string) =>
      void run(mutations.toggleTask(id), "Could not update the task."),
  };

  // (SectionLink lives at module scope — the static-components rule;
  // onNavigate is threaded per call site below.)

  return (
    // S4-S (measured s70): the root stack is the reference's 32px rhythm
    // (space-y-8) — the old gap-6 rendered 24px and sat the stat row 8px
    // high (y=120 vs 128).
    <div className="flex flex-col gap-8">
      {/* ---- greeting header ---- */}
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">
            {/* the greeting reads the LIVE clock (reference parity — a
                midnight-anchored `today` froze it at "Good morning";
                Family G pins the bucket with a fake clock). */}
            {currentGreeting()}, {firstNameOf(userName)} 👋
          </h1>
          <p className="mt-1 text-base text-slate-500 dark:text-slate-400">
            {formatLongDateWithWeekday(today)}
          </p>
        </div>
        <Button
          variant="gradient"
          className="sf-gradient-shadow h-9 w-fit self-start"
          asChild
        >
          {/* S4-K (measured s68): the reference's hero CTA is an ANCHOR (the
              overdue View All pattern) carrying a sparkles icon. */}
          <a
            href="/MyDay"
            onClick={(e) => {
              e.preventDefault();
              navigate("myday");
            }}
          >
            <Sparkles className="size-4" strokeWidth={2} aria-hidden />
            Start My Day
          </a>
        </Button>
      </header>

      {/* ---- conditional overdue alert (S9-A) ---- */}
      {overdue.length > 0 && (
        <div role="group"
          aria-label="Overdue alert"
          className="sf-overdue-banner flex items-center gap-4 rounded-2xl p-4"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-100 dark:bg-red-950">
            <CircleAlert className="size-5 text-red-500" strokeWidth={2} />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="font-semibold text-red-700 dark:text-red-300">
              You have {overdue.length} overdue item{overdue.length === 1 ? "" : "s"}
            </h2>
            <p className="text-sm text-red-600 dark:text-red-400">
              Don't forget to complete them!
            </p>
          </div>
          <a
            href="/Tasks"
            onClick={(e) => {
              e.preventDefault();
              navigate("tasks");
            }}
            className="flex shrink-0 items-center gap-1 rounded-md text-sm font-medium text-sf-primary-strong outline-none focus-visible:ring-2 focus-visible:ring-sf-primary/40 dark:text-sf-primary-strong-dark"
          >
            View All
            <ArrowRight className="size-4" strokeWidth={2} aria-hidden />
          </a>
        </div>
      )}

      {/* ---- KPI cards ---- */}
      {loading && tasks.length === 0 ? (
        <div className="flex justify-center py-16 text-sf-primary">
          <Spinner className="size-6" />
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {/* S4-K (measured s68): the hints and the icon-block gradients are
              the reference's measured values (inline sRGB gradients — the v4
              oklab-interpolation trap); the Focus Time value is month-hours. */}
          <StatCard
            icon={Target}
            label="Today's Progress"
            value={`${doneToday}/${todayScope.length}`}
            hint="tasks completed"
            iconBackground="linear-gradient(to right bottom, rgb(139, 92, 246), rgb(79, 70, 229))"
          />
          <StatCard
            icon={SquareCheckBig}
            label="Pending Tasks"
            value={pendingCount}
            hint="to be done"
            iconBackground="linear-gradient(to right bottom, rgb(59, 130, 246), rgb(8, 145, 178))"
          />
          <StatCard
            icon={BookOpen}
            label="Due Soon"
            value={dueSoonCount}
            hint="assignments"
            iconBackground="linear-gradient(to right bottom, rgb(249, 115, 22), rgb(217, 119, 6))"
          />
          <StatCard
            icon={Flame}
            label="Focus Time"
            value={formatFocusHours(focusSeconds / 60)}
            hint="this month"
            iconBackground="linear-gradient(to right bottom, rgb(236, 72, 153), rgb(225, 29, 72))"
          />
        </div>
      )}

      {/* ---- flush section cards (S8-B; the 3-track row + the section
              icons/copy are the s69 re-measure; the bordered headers + the
              anchor>button actions are the s70 re-measure, S4-Q/T) ---- */}
      <div className="grid gap-6 lg:grid-cols-3">
        <SectionCard
          title="Today's Tasks"
          icon={SquareCheckBig}
          flush
          borderedHeader
          className="lg:col-span-2"
          action={<SectionLink href="/MyDay" view="myday" label="View All" onNavigate={navigate} />}
        >
          {todayScope.length === 0 ? (
            <SimpleEmptyState icon={SquareCheckBig} message="No tasks for today. Add some from My Day!" />
          ) : (
            <ul aria-label="Today's tasks">
              {todayScope.map((task) => (
                <li key={task.id} className="flex items-center gap-4 p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  {/* the dashboard's own 20px round checkbox (S6-D) */}
                  <button
                    type="button"
                    role="checkbox"
                    aria-checked={task.completed}
                    aria-label={`Mark "${task.title}" complete`}
                    onClick={() => dashboardTaskActions.onToggle(task.id)}
                    className={
                      "flex size-5 shrink-0 items-center justify-center rounded-full border-2 bg-white dark:bg-slate-900 " +
                      (PRIORITY_BORDER[task.priority] ?? PRIORITY_BORDER.none) +
                      (task.completed
                        ? " border-sf-primary bg-sf-primary text-sf-primary-foreground"
                        : "")
                    }
                  >
                    {task.completed && (
                      <svg viewBox="0 0 12 12" className="size-3" fill="none" aria-hidden>
                        <path
                          d="M2 6.5 4.5 9 10 3"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </button>
                  <p
                    className={
                      "min-w-0 flex-1 truncate font-medium text-slate-700 dark:text-slate-200 " +
                      (task.completed ? "text-slate-400 line-through dark:text-slate-500" : "")
                    }
                  >
                    {task.title}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </SectionCard>

        <SectionCard
          title="Upcoming Exams"
          icon={GraduationCap}
          flush
          borderedHeader
          action={<SectionLink href="/Exams" view="exams" label="All" onNavigate={navigate} />}
        >
          {upcomingExams.length === 0 ? (
            <SimpleEmptyState icon={GraduationCap} message="No upcoming exams" />
          ) : (
            <ul aria-label="Upcoming exams">
              {upcomingExams.map((exam) => {
                const diff = daysUntil(new Date(exam.date), today);
                const label = diff === 0 ? "Today" : diff === 1 ? "Tomorrow" : `${diff}d`;
                return (
                  <li
                    key={exam.id}
                    className="flex items-center justify-between gap-3 p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                  >
                    <div className="min-w-0">
                      <h3 className="truncate font-medium text-slate-700 dark:text-slate-200">
                        {exam.title}
                      </h3>
                      <p className="mt-0.5 flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400">
                        <Calendar className="size-3.5 shrink-0" strokeWidth={2} aria-hidden />
                        {formatShortWithYear(new Date(exam.date))}
                      </p>
                    </div>
                    <span className="sf-pill-red shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium">
                      {label}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </SectionCard>
      </div>

      {/* S4-R (measured s70, probes #3/#4): the assignments card is a
          SIBLING of the section grid (a direct child of the root flow), so
          it renders full-width — the ref's DOM path is space-y-8 >
          div[3].bg-white.rounded-2xl, OUTSIDE the grid. The old placement
          (grid item, row 2 track 1) rendered a 1/3-width card. */}
      <SectionCard
        title="Upcoming Assignments"
        icon={BookOpen}
        flush
        borderedHeader
        action={<SectionLink href="/Assignments" view="assignments" label="View All" onNavigate={navigate} />}
      >
        {activeAssignments.length === 0 ? (
          <SimpleEmptyState icon={BookOpen} message="No upcoming assignments" />
        ) : (
          <ul aria-label="Upcoming assignments">
            {activeAssignments.map((assignment) => {
              const color = subjectColor(assignment.subjectId);
              return (
                <li
                  key={assignment.id}
                  className="flex items-center gap-3 p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                >
                  <span
                    aria-hidden
                    className="h-12 w-1 shrink-0 rounded-full"
                    style={{ backgroundColor: color ?? "rgb(var(--sf-primary))" }}
                  />
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate font-medium text-slate-700 dark:text-slate-200">
                      {assignment.title}
                    </h3>
                    <p className="mt-0.5 flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400">
                      <Clock className="size-3.5 shrink-0" strokeWidth={2} aria-hidden />
                      {assignment.dueDate
                        ? `Due ${dayBucketLabel(new Date(assignment.dueDate), today)}`
                        : "No due date"}
                    </p>
                  </div>
                  <span className="sf-pill-yellow shrink-0 rounded-full px-2 py-0.5 text-xs font-medium capitalize">
                    {assignment.priority}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </SectionCard>
    </div>
  );
}

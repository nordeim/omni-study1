"use client";

// ---------------------------------------------------------------------------
// DashboardView (S9-A/R + S6-D + S8-B) — greeting header, the conditional
// overdue alert banner, 4 KPI stat cards and the flush divide-y section
// cards (Today's Tasks bare rows, Upcoming Exams, Upcoming Assignments).
// ---------------------------------------------------------------------------

import * as React from "react";
import {
  Calendar,
  CircleAlert,
  ClipboardList,
  Clock,
  GraduationCap,
  ListTodo,
  Sun,
  Target,
  Timer,
} from "lucide-react";

import { useToast } from "@/components/ui/toast";
import { mutations, useDataStore } from "@/lib/data";
import {
  dayBucketLabel,
  daysUntil,
  formatLongDate,
  formatMinutes,
  formatShortWithYear,
  isSameDay,
  startOfDay,
} from "@/lib/date";
import { greetingForHour } from "@/lib/router";
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
    .filter((s) => isSameDay(new Date(s.startedAt), today))
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

  return (
    <div className="flex flex-col gap-6">
      {/* ---- greeting header ---- */}
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">
            {greetingForHour(today.getHours())}, {firstNameOf(userName)} 👋
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {formatLongDate(today)}
          </p>
        </div>
        <Button
          type="button"
          variant="gradient"
          className="sf-gradient-shadow h-9 w-fit self-start"
          onClick={() => navigate("myday")}
        >
          Start My Day
        </Button>
      </header>

      {/* ---- conditional overdue alert (S9-A) ---- */}
      {overdue.length > 0 && (
        <div
          aria-label="Overdue alert"
          className="sf-overdue-banner flex items-center gap-4 rounded-2xl p-4"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-100 dark:bg-red-950">
            <CircleAlert className="size-5 text-red-500" strokeWidth={2} />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-red-700 dark:text-red-300">
              You have {overdue.length} overdue item{overdue.length === 1 ? "" : "s"}
            </h3>
            <p className="text-sm text-red-600 dark:text-red-400">
              Some tasks slipped past their due date.
            </p>
          </div>
          <a
            href="/Tasks"
            onClick={(e) => {
              e.preventDefault();
              navigate("tasks");
            }}
            className="shrink-0 rounded-md text-sm font-medium text-sf-primary-strong outline-none focus-visible:ring-2 focus-visible:ring-sf-primary/40 dark:text-sf-primary-strong-dark"
          >
            View All
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
          <StatCard
            icon={Target}
            label="Today's Progress"
            value={`${doneToday}/${todayScope.length}`}
            hint="Today's Progress"
            iconClassName="bg-violet-100 dark:bg-violet-900/40"
          />
          <StatCard
            icon={ListTodo}
            label="Pending Tasks"
            value={pendingCount}
            hint="Pending Tasks"
            iconClassName="bg-blue-100 dark:bg-blue-900/40"
          />
          <StatCard
            icon={Clock}
            label="Due Soon"
            value={dueSoonCount}
            hint="Due Soon"
            iconClassName="bg-orange-100 dark:bg-orange-900/40"
          />
          <StatCard
            icon={Timer}
            label="Focus Time"
            value={formatMinutes(focusSeconds / 60)}
            hint="Focus Time"
            iconClassName="bg-green-100 dark:bg-green-900/40"
          />
        </div>
      )}

      {/* ---- flush section cards (S8-B) ---- */}
      <div className="grid gap-6 lg:grid-cols-2">
        <SectionCard
          title="Today's Tasks"
          icon={Sun}
          flush
          action={
            <button
              type="button"
              onClick={() => navigate("myday")}
              className="text-sm font-medium text-sf-primary-strong outline-none focus-visible:ring-2 focus-visible:ring-sf-primary/40 dark:text-sf-primary-strong-dark"
            >
              View All
            </button>
          }
        >
          {todayScope.length === 0 ? (
            <SimpleEmptyState icon={Sun} message="No tasks for today. Add some from My Day!" />
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

        <SectionCard title="Upcoming Exams" icon={GraduationCap} flush>
          {upcomingExams.length === 0 ? (
            <SimpleEmptyState icon={GraduationCap} message="No upcoming exams." />
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
                    <span className="shrink-0 rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-600 dark:bg-red-950 dark:text-red-300">
                      {label}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </SectionCard>

        <SectionCard title="Upcoming Assignments" icon={ClipboardList} flush>
          {activeAssignments.length === 0 ? (
            <SimpleEmptyState icon={ClipboardList} message="No active assignments." />
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
                    <span className="shrink-0 rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium capitalize text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300">
                      {assignment.priority}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </SectionCard>
      </div>
    </div>
  );
}

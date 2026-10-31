"use client";

// ---------------------------------------------------------------------------
// AnalyticsView (S8-I + S9-K) — the icon-block stat cards (fraction values,
// zero-data renders 0/0 — never an EmptyState, the S17 fresh-user contract)
// and the hand-rolled SVG charts with axes: 7-day area charts (Task Activity
// slate-200 area; Focus Time violet line over the focusGradient area), the
// assignment-status donut, the subject workload bar list, the priority chip
// card, and the grade-trend line superset. No chart library, no gradient CTA.
// ---------------------------------------------------------------------------

import * as React from "react";
import {
  BookOpen,
  ChartColumn,
  Clock,
  Flame,
  GraduationCap,
  LineChart,
  SquareCheckBig,
  Target,
  TrendingUp,
} from "lucide-react";

import { useDataStore } from "@/lib/data";
import { addDays, formatMinutes, isSameDay, startOfDay } from "@/lib/date";
import { SectionCard, ViewHeader } from "@/components/views/shared";
import { cn } from "@/lib/utils";

// ---- the 7-day chart frame ----------------------------------------------------------

const W = 320;
const H = 180;
const PAD_L = 34;
const PAD_R = 10;
const PAD_T = 10;
const PAD_B = 26;

function niceMax(max: number): number {
  if (max <= 4) return 4;
  return Math.ceil(max / 4) * 4;
}

function xAt(i: number, count: number): number {
  if (count <= 1) return PAD_L;
  return PAD_L + (i * (W - PAD_L - PAD_R)) / (count - 1);
}

function yAt(value: number, max: number): number {
  const inner = H - PAD_T - PAD_B;
  return PAD_T + inner - (Math.min(value, max) / max) * inner;
}

type AreaChartProps = {
  data: number[];
  labels: string[];
  variant: "slate" | "focus";
};

/** The S9-K measured frame: day labels (12px #666), Y ticks, dashed
 *  gridlines; the slate variant fills #e2e8f0, the focus variant draws the
 *  #8b5cf6 line over the violet gradient area. */
function AreaChart({ data, labels, variant, title = "7-day chart" }: AreaChartProps & { title?: string }) {
  const count = data.length;
  const max = niceMax(Math.max(...data, 0));
  const baseline = yAt(0, max);

  const linePoints = data.map((v, i) => `${xAt(i, count)},${yAt(v, max)}`).join(" ");
  const areaPath =
    count > 0
      ? `M ${xAt(0, count)} ${baseline} L ${linePoints.split(" ").join(" L ")} L ${xAt(count - 1, count)} ${baseline} Z`
      : "";

  const ticks = [0, 1, 2, 3, 4].map((t) => (max / 4) * t);

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="h-[220px] w-full"
      role="img"
      aria-label={title}
    >
      {variant === "focus" && (
        <defs>
          <linearGradient id="focusGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.02" />
          </linearGradient>
        </defs>
      )}
      {/* gridlines + Y ticks */}
      {ticks.map((tick) => (
        <g key={tick}>
          <line
            x1={PAD_L}
            x2={W - PAD_R}
            y1={yAt(tick, max)}
            y2={yAt(tick, max)}
            stroke="#e2e8f0"
            strokeDasharray="3 3"
            className="dark:stroke-slate-800"
          />
          <text
            x={PAD_L - 6}
            y={yAt(tick, max) + 3}
            textAnchor="end"
            fontSize="10"
            fill="#666"
            className="dark:fill-slate-400"
          >
            {variant === "focus"
              ? `${(tick / 60) % 1 === 0 ? tick / 60 : (tick / 60).toFixed(1)}h`
              : max >= 100
                ? Math.round(tick)
                : Number.isInteger(tick)
                  ? tick
                  : tick.toFixed(1)}
          </text>
        </g>
      ))}
      {/* X axis + day labels */}
      <line
        x1={PAD_L}
        x2={W - PAD_R}
        y1={baseline}
        y2={baseline}
        stroke="#cbd5e1"
        className="dark:stroke-slate-700"
      />
      {labels.map((label, i) => (
        <text
          key={`${label}-${i}`}
          x={xAt(i, count)}
          y={H - 8}
          textAnchor="middle"
          fontSize="12"
          fill="#666"
          className="dark:fill-slate-400"
        >
          {label}
        </text>
      ))}
      {/* the data */}
      {variant === "slate" ? (
        <path d={areaPath} fill="#e2e8f0" className="dark:fill-slate-800" />
      ) : (
        <>
          <path d={areaPath} fill="url(#focusGradient)" />
          <path
            d={`M ${linePoints.split(" ").join(" L ")}`}
            fill="none"
            stroke="#8b5cf6"
            strokeWidth="2"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        </>
      )}
    </svg>
  );
}

// ---- the grade-trend line chart ------------------------------------------------------

function GradeTrendChart({ values }: { values: number[] }) {
  const count = values.length;
  const baseline = yAt(0, 100);
  const linePoints = values.map((v, i) => `${xAt(i, count)},${yAt(v, 100)}`).join(" ");

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-[220px] w-full" role="img" aria-label="Grade trend">
      {[0, 25, 50, 75, 100].map((tick) => (
        <g key={tick}>
          <line
            x1={PAD_L}
            x2={W - PAD_R}
            y1={yAt(tick, 100)}
            y2={yAt(tick, 100)}
            stroke="#e2e8f0"
            strokeDasharray="3 3"
            className="dark:stroke-slate-800"
          />
          <text
            x={PAD_L - 6}
            y={yAt(tick, 100) + 3}
            textAnchor="end"
            fontSize="10"
            fill="#666"
            className="dark:fill-slate-400"
          >
            {tick}
          </text>
        </g>
      ))}
      <line
        x1={PAD_L}
        x2={W - PAD_R}
        y1={baseline}
        y2={baseline}
        stroke="#cbd5e1"
        className="dark:stroke-slate-700"
      />
      {count > 1 && (
        <polyline
          points={linePoints}
          fill="none"
          stroke="#8b5cf6"
          strokeWidth="2"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      )}
      {values.map((v, i) => (
        <circle
          key={i}
          cx={xAt(i, count)}
          cy={yAt(v, 100)}
          r="3.5"
          fill="#8b5cf6"
        />
      ))}
    </svg>
  );
}

// ---- the donut -------------------------------------------------------------------------

const DONUT_SECTORS = [
  { key: "notStarted", label: "Not started", color: "#94a3b8" },
  { key: "inProgress", label: "In progress", color: "#3b82f6" },
  { key: "completed", label: "Completed", color: "#10b981" },
] as const;

function AssignmentDonut({ counts }: { counts: Record<(typeof DONUT_SECTORS)[number]["key"], number> }) {
  const total = DONUT_SECTORS.reduce((acc, s) => acc + counts[s.key], 0);
  const radius = 62;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  return (
    <div className="flex items-center justify-center gap-8">
      <div className="relative">
        <svg viewBox="0 0 160 160" className="h-[250px] w-[250px] -rotate-90" role="img" aria-label="Assignment status chart">
          <circle cx="80" cy="80" r={radius} fill="none" stroke="#f1f5f9" strokeWidth="20" className="dark:stroke-slate-800" />
          {total > 0 &&
            DONUT_SECTORS.map((sector) => {
              const fraction = counts[sector.key] / total;
              const dash = fraction * circumference;
              const el = (
                <circle
                  key={sector.key}
                  cx="80"
                  cy="80"
                  r={radius}
                  fill="none"
                  stroke={sector.color}
                  strokeWidth="20"
                  strokeDasharray={`${dash} ${circumference - dash}`}
                  strokeDashoffset={-offset}
                />
              );
              offset += dash;
              return el;
            })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold text-slate-800 dark:text-slate-100">{total}</span>
          <span className="text-xs text-slate-500 dark:text-slate-400">assignments</span>
        </div>
      </div>
      <ul className="flex flex-col gap-2">
        {DONUT_SECTORS.map((sector) => (
          <li key={sector.key} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
            <span aria-hidden className="size-2.5 rounded-full" style={{ backgroundColor: sector.color }} />
            {sector.label}
            <span className="font-semibold text-slate-800 dark:text-slate-100">{counts[sector.key]}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ---- the view ----------------------------------------------------------------------

type StatBlockProps = {
  icon: typeof Clock;
  iconClasses: string;
  value: string;
  label: string;
  sub: string;
};

function StatBlock({ icon: Icon, iconClasses, value, label, sub }: StatBlockProps) {
  return (
    <div className="rounded-xl border-0 bg-white p-6 shadow-sm dark:bg-card">
      <div className={cn("flex h-12 w-12 items-center justify-center rounded-xl", iconClasses)}>
        <Icon className="size-6" strokeWidth={2} aria-hidden />
      </div>
      <h2 className="mt-4 text-3xl font-bold text-slate-800 dark:text-slate-100">{value}</h2>
      <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
      <p className="text-xs text-slate-500 dark:text-slate-400">{sub}</p>
    </div>
  );
}

export function AnalyticsView() {
  const tasks = useDataStore((s) => s.tasks);
  const assignments = useDataStore((s) => s.assignments);
  const exams = useDataStore((s) => s.exams);
  const grades = useDataStore((s) => s.grades);
  const focusSessions = useDataStore((s) => s.focusSessions);
  const subjects = useDataStore((s) => s.subjects);

  const today = startOfDay(new Date());

  const week = React.useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDays(today, i - 6)),
    [today],
  );
  const dayLabels = week.map((d) => d.toLocaleDateString("en-US", { weekday: "short" }));

  // ---- stat figures -----------------------------------------------------------
  const completedTasks = tasks.filter((t) => t.completed).length;
  const taskRate = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;
  const completedAssignments = assignments.filter((a) => a.progress >= 100).length;
  const assignmentRate =
    assignments.length > 0 ? Math.round((completedAssignments / assignments.length) * 100) : 0;
  const focusSecondsWeek = focusSessions
    .filter((s) => week.some((d) => isSameDay(new Date(s.startedAt), d)))
    .reduce((acc, s) => acc + s.durationSeconds, 0);
  const upcomingExams = exams.filter((e) => {
    const diff = Math.round(
      (startOfDay(new Date(e.date)).getTime() - today.getTime()) / 86_400_000,
    );
    return diff >= 0;
  }).length;

  // ---- 7-day buckets ------------------------------------------------------------
  const taskActivity = week.map(
    (day) => tasks.filter((t) => t.completed && isSameDay(new Date(t.updatedAt), day)).length,
  );
  const focusByDay = week.map(
    (day) =>
      focusSessions
        .filter((s) => isSameDay(new Date(s.startedAt), day))
        .reduce((acc, s) => acc + s.durationSeconds, 0) / 60,
  );

  // ---- donut counts ---------------------------------------------------------------
  const assignmentCounts = {
    notStarted: assignments.filter((a) => a.progress <= 0).length,
    inProgress: assignments.filter((a) => a.progress > 0 && a.progress < 100).length,
    completed: completedAssignments,
  };

  // ---- subject workload -------------------------------------------------------------
  const workload = subjects
    .map((subject) => ({
      name: subject.name,
      color: subject.color,
      count:
        tasks.filter((t) => t.subjectId === subject.id && !t.completed).length +
        assignments.filter((a) => a.subjectId === subject.id && a.progress < 100).length,
    }))
    .sort((a, b) => b.count - a.count);
  const workloadMax = Math.max(...workload.map((w) => w.count), 1);

  // ---- priority chips -----------------------------------------------------------------
  const priorityCounts = [
    { key: "high", label: "High priority", color: "#ef4444", count: tasks.filter((t) => !t.completed && t.priority === "high").length },
    { key: "medium", label: "Medium priority", color: "#f59e0b", count: tasks.filter((t) => !t.completed && t.priority === "medium").length },
    { key: "low", label: "Low priority", color: "#3b82f6", count: tasks.filter((t) => !t.completed && t.priority === "low").length },
  ];

  // ---- grade trend -----------------------------------------------------------------------
  const gradePercents = [...grades]
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
    .map((g) => (g.maxScore > 0 ? (g.score / g.maxScore) * 100 : 0));

  return (
    <div className="flex flex-col gap-6">
      <ViewHeader title="Analytics" subtitle="Insights across your study activity" icon={ChartColumn} />
      {/* ---- stat cards (icon-block, S8-I) ---- */}
      <div role="group" className="grid grid-cols-2 gap-4 lg:grid-cols-4" aria-label="Analytics stats">
        <StatBlock
          icon={SquareCheckBig}
          iconClasses="bg-violet-100 dark:bg-violet-900/50"
          value={`${completedTasks}/${tasks.length}`}
          label="Tasks Completed"
          sub={`${taskRate}% completion rate`}
        />
        <StatBlock
          icon={BookOpen}
          iconClasses="bg-blue-100 dark:bg-blue-900/50"
          value={`${completedAssignments}/${assignments.length}`}
          label="Assignments"
          sub={`${assignmentRate}% avg progress`}
        />
        <StatBlock
          icon={Clock}
          iconClasses="bg-green-100 dark:bg-green-900/50"
          value={formatMinutes(focusSecondsWeek / 60)}
          label="Focus Time"
          sub={`${Math.round(focusSecondsWeek / 3600)} total study hours`}
        />
        <StatBlock
          icon={GraduationCap}
          iconClasses="bg-orange-100 dark:bg-orange-900/50"
          value={String(upcomingExams)}
          label="Upcoming Exams"
          sub={`${upcomingExams} exams scheduled`}
        />
      </div>

      {/* ---- 7-day area charts ---- */}
      <div className="grid gap-4 lg:grid-cols-2">
        <SectionCard title="Task Activity (Last 7 Days)" icon={TrendingUp}>
          <AreaChart data={taskActivity} labels={dayLabels} variant="slate" title="Task activity chart" />
        </SectionCard>
        <SectionCard title="Focus Time (Last 7 Days)" icon={Clock}>
          <AreaChart data={focusByDay} labels={dayLabels} variant="focus" title="Focus time chart" />
        </SectionCard>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <SectionCard title="Assignment Status" icon={BookOpen}>
          <AssignmentDonut counts={assignmentCounts} />
        </SectionCard>

        <SectionCard title="Subject Workload" icon={Target}>
          <div role="group" aria-label="Subject workload chart" className="h-[250px] overflow-y-auto sf-scroll">
            {workload.length === 0 ? (
              <p className="py-10 text-center text-sm text-slate-500">No subject data yet</p>
            ) : (
              <div className="flex flex-col gap-3">
                {workload.map((row) => (
                  <div key={row.name} className="flex flex-col gap-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-slate-700 dark:text-slate-200">{row.name}</span>
                      <span className="text-slate-500 dark:text-slate-400">{row.count}</span>
                    </div>
                    <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${Math.round((row.count / workloadMax) * 100)}%`,
                          backgroundColor: row.color,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </SectionCard>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <SectionCard title="Active Items by Priority" icon={Flame}>
          <div role="group" className="flex flex-wrap gap-2" aria-label="Priority chips">
            {priorityCounts.map((chip) => (
              <div
                key={chip.key}
                className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-600 dark:bg-slate-800 dark:text-slate-300"
              >
                <span aria-hidden className="size-2 rounded-full" style={{ backgroundColor: chip.color }} />
                <span className="font-semibold text-slate-800 dark:text-slate-100">{chip.count}</span>
                {chip.label}
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Grade Trend" icon={LineChart}>
          {gradePercents.length === 0 ? (
            <p className="py-10 text-center text-sm text-slate-500">
              Log grades in the Grade Tracker to see the trend.
            </p>
          ) : (
            <GradeTrendChart values={gradePercents} />
          )}
        </SectionCard>
      </div>
    </div>
  );
}

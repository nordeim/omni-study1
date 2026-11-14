"use client";

// ---------------------------------------------------------------------------
// Calendar (S8-C/S9-E): a SIMPLE rounded-2xl month card — Sunday-first grid,
// exactly two ghost chevrons (no Today button), SELECTED = solid accent fill
// + TODAY = 100-level tint (both hover-stripped), 4-color event dots, and a
// day-detail card with border-l-4 rows. monthGrid() sizes dynamically
// (35/42 cells).
// ---------------------------------------------------------------------------

import * as React from "react";
import {
  CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Grid3x3,
  List,
  SquareCheckBig,
} from "lucide-react";

import { PriorityCheckbox, Spinner } from "@/components/views/shared";
import { Button } from "@/components/ui/button";
import { mutations, useDataStore } from "@/lib/data";
import {
  addMonths,
  CALENDAR_WEEKDAYS,
  formatLongDate,
  formatLongDateWithWeekday,
  formatHHMMRange,
  isSameDay,
  isoWeekday,
  monthGrid,
} from "@/lib/date";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/toast";

// S127/CB5: the month grid renders per-CATEGORY presence dots (measured
// live on the reference 2026-11-02: the Nov 12 exam cell carried exactly
// one w-1.5 h-1.5 rounded-full bg-red-500, and EVENTS ARE DOTLESS — the
// legend's four categories are the only dot sources). One dot per PRESENT
// category, in legend order; the selected cell renders its dots white
// (the reference's own convention — bg-white on the accent fill).
const CATEGORY_DOTS = [
  { key: "tasks", className: "bg-blue-500" },
  { key: "assignments", className: "bg-amber-500" },
  { key: "exams", className: "bg-red-500" },
  { key: "classes", className: "bg-emerald-500" },
] as const;

export function CalendarView() {
  const tasks = useDataStore((s) => s.tasks);
  const events = useDataStore((s) => s.events);
  const assignments = useDataStore((s) => s.assignments);
  const exams = useDataStore((s) => s.exams);
  const timetable = useDataStore((s) => s.timetable);
  // S132/CG6: the CE3 loading gate — both empty messages ("No events this
  // month" / "No events for this day") must not render on in-flight data
  // (the s130 sweep missed the Calendar; a slow transport at boot painted
  // false empties over the day/timeline the collections were filling).
  const loading = useDataStore((s) => s.loading);
  const toggleTask = mutations.toggleTask;
  const { toast } = useToast();

  const [cursor, setCursor] = React.useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });
  const [selected, setSelected] = React.useState(() => new Date());
  // The S5-G/S9-F segmented switch: month grid or the vertical timeline.
  const [mode, setMode] = React.useState<"calendar" | "timeline">("calendar");

  const cells = React.useMemo(
    () => monthGrid(cursor.year, cursor.month),
    [cursor],
  );
  const today = new Date();

  const eventsFor = React.useCallback(
    (day: Date) =>
      events.filter((e) => isSameDay(new Date(e.startDate), day)),
    [events],
  );
  const tasksFor = React.useCallback(
    (day: Date) =>
      tasks.filter((t) => t.dueDate && isSameDay(new Date(t.dueDate), day)),
    [tasks],
  );
  // S127/CB5: the three remaining dot sources — assignments due that day,
  // exams dated that day, and the recurring weekday timetable classes (the
  // ISO weekday convention the timetable grid uses).
  const assignmentsFor = React.useCallback(
    (day: Date) =>
      assignments.filter((a) => a.dueDate && isSameDay(new Date(a.dueDate), day)),
    [assignments],
  );
  const examsFor = React.useCallback(
    (day: Date) => exams.filter((e) => isSameDay(new Date(e.date), day)),
    [exams],
  );
  const classesFor = React.useCallback(
    (day: Date) => timetable.filter((c) => c.dayOfWeek === isoWeekday(day)),
    [timetable],
  );

  // S136/CK7 (audit B-M6): the by-day presence map — ONE pass over each
  // collection bucketing rows by calendar day, replacing the grid's
  // per-cell × per-collection filter sweeps (~42 cells × 4 filters × full
  // collection scans on EVERY render at the documented 500-item windows).
  // The dot presence only needs booleans; the day-detail panel keeps the
  // single-day callbacks above (5 reads, not the hot path). Behavior-
  // preserving: the same isSameDay/isoWeekday equivalence, bucketed once.
  const dayKey = (d: Date) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
  const presence = React.useMemo(() => {
    const map = new Map<
      string,
      { tasks: boolean; assignments: boolean; exams: boolean; classes: boolean }
    >();
    const ensure = (d: Date) => {
      const key = dayKey(d);
      let entry = map.get(key);
      if (!entry) {
        entry = { tasks: false, assignments: false, exams: false, classes: false };
        map.set(key, entry);
      }
      return entry;
    };
    for (const t of tasks) {
      if (t.dueDate) ensure(new Date(t.dueDate)).tasks = true;
    }
    for (const a of assignments) {
      if (a.dueDate) ensure(new Date(a.dueDate)).assignments = true;
    }
    for (const e of exams) {
      ensure(new Date(e.date)).exams = true;
    }
    // The recurring weekday classes: a per-weekday bucket set, consumed
    // per cell through the ISO weekday (the same equivalence classesFor
    // uses — no date bucketing possible for recurrence).
    const classWeekdays = new Set(timetable.map((c) => c.dayOfWeek));
    return { map, classWeekdays };
  }, [tasks, assignments, exams, timetable]);

  const shift = (delta: number) => {
    const next = addMonths(new Date(cursor.year, cursor.month, 1), delta);
    setCursor({ year: next.getFullYear(), month: next.getMonth() });
  };

  const selectedEvents = eventsFor(selected);
  const selectedTasks = tasksFor(selected);
  const selectedAssignments = assignmentsFor(selected);
  const selectedExams = examsFor(selected);
  const selectedClasses = classesFor(selected);
  const dayEmpty =
    selectedEvents.length === 0 &&
    selectedTasks.length === 0 &&
    selectedAssignments.length === 0 &&
    selectedExams.length === 0 &&
    selectedClasses.length === 0;
  const monthLabel = new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
  }).format(new Date(cursor.year, cursor.month, 1));

  // Timeline mode: the month's days that actually carry events/tasks.
  const timelineDays = React.useMemo(() => {
    const days: { date: Date; eventCount: number; taskCount: number }[] = [];
    const dim = new Date(cursor.year, cursor.month + 1, 0).getDate();
    for (let d = 1; d <= dim; d++) {
      const date = new Date(cursor.year, cursor.month, d);
      const ev = eventsFor(date);
      const tk = tasksFor(date);
      if (ev.length > 0 || tk.length > 0) {
        days.push({ date, eventCount: ev.length, taskCount: tk.length });
      }
    }
    return days;
  }, [cursor, eventsFor, tasksFor]);

  return (
    <div className="flex flex-col gap-6">
      {/* S186/EJ-C: the measured stacking family (probed 2026-11-15). */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
          Calendar
        </h1>
        {/* S5-G/S9-F: the bordered segmented control — white p-1 rounded-lg,
            h-8 tabs, grid3x3/list icons, solid-violet active tab. */}
        <div role="group"
          aria-label="Calendar mode"
          className="inline-flex rounded-lg border border-slate-200 bg-white p-1 dark:border-slate-800 dark:bg-slate-900"
        >
          <button
            type="button"
            aria-pressed={mode === "calendar"}
            onClick={() => setMode("calendar")}
            className={cn(
              "flex h-8 items-center gap-1.5 rounded-md px-3 text-xs font-medium transition-colors",
              mode === "calendar"
                ? "sf-selected-tint text-white"
                : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800",
            )}
          >
            <Grid3x3 className="size-3.5" strokeWidth={2} aria-hidden />
            Calendar
          </button>
          <button
            type="button"
            aria-pressed={mode === "timeline"}
            onClick={() => setMode("timeline")}
            className={cn(
              "flex h-8 items-center gap-1.5 rounded-md px-3 text-xs font-medium transition-colors",
              mode === "timeline"
                ? "sf-selected-tint text-white"
                : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800",
            )}
          >
            <List className="size-3.5" strokeWidth={2} aria-hidden />
            Timeline
          </button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {mode === "timeline" ? (
        <section aria-label="Timeline" className="sf-card p-6 lg:col-span-2">
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">
            {monthLabel}
          </h2>
          {/* S140/CO4b (Audit A L-2): the timeline renders EVENTS AND TASKS
              (timelineDays below) — the OR-form gate covers both sources
              (the S138/CM2 doctrine: any primary source empty while
              loading owns the row; the events-only gate let a
              mixed-landing state render a task-less timeline). S162/DK4:
              the gate announces itself (role="status" — the
              calculator-view precedent). */}
          {loading && (events.length === 0 || tasks.length === 0) ? (
            <div className="flex justify-center py-8 text-sf-primary" role="status" aria-label="Loading calendar">
              <Spinner className="size-6" />
            </div>
          ) : timelineDays.length === 0 ? (
            <p className="py-8 text-center text-slate-500 dark:text-slate-400">
              No events this month
            </p>
          ) : (
            <ol className="mt-4 flex flex-col gap-4">
              {timelineDays.map(({ date, eventCount, taskCount }) => {
                const isSelected = isSameDay(date, selected);
                const isToday = isSameDay(date, today);
                return (
                  <li key={date.toISOString()}>
                    <button
                      type="button"
                      onClick={() => setSelected(date)}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-lg border-l-4 bg-slate-50 p-3 text-left transition-colors dark:bg-slate-800/60",
                        isSelected ? "border-l-sf-primary" : "border-l-transparent",
                      )}
                    >
                      <span
                        className={cn(
                          "flex size-10 shrink-0 flex-col items-center justify-center rounded-lg text-xs font-bold",
                          isToday
                            ? "sf-today-tint text-sf-primary-strong dark:text-sf-primary-strong-dark"
                            : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
                        )}
                      >
                        {date.getDate()}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block font-medium text-slate-700 dark:text-slate-200">
                          {formatLongDate(date)}
                        </span>
                        <span className="block text-xs text-slate-500 dark:text-slate-400">
                          {eventCount} event{eventCount === 1 ? "" : "s"} · {taskCount} task
                          {taskCount === 1 ? "" : "s"}
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ol>
          )}
        </section>
        ) : (
        <section className="sf-card sf-print-exact p-6 lg:col-span-2" aria-label="Calendar month">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">
              {monthLabel}
            </h2>
            <div className="flex gap-1">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-lg"
                aria-label="Previous month"
                onClick={() => shift(-1)}
              >
                <ChevronLeft className="size-4" strokeWidth={2} />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-lg"
                aria-label="Next month"
                onClick={() => shift(1)}
              >
                <ChevronRight className="size-4" strokeWidth={2} />
              </Button>
            </div>
          </div>

          <div role="group" aria-label="Calendar weekdays" className="mb-2 grid grid-cols-7 gap-1">
            {CALENDAR_WEEKDAYS.map((d) => (
              <span
                key={d}
                className="py-2 text-center text-sm font-medium text-slate-500 dark:text-slate-400"
              >
                {d}
              </span>
            ))}
          </div>
          <div role="group"
            aria-label="Calendar days"
            className="mt-1 grid grid-cols-7 gap-1"
          >
            {cells.map((cell) => {
              // S127/CB5: the category-presence computation (events are
              // dotless by design — the reference measured it). S136/CK7:
              // the by-day map read replaces the 4 per-cell filter sweeps.
              const entry = presence.map.get(dayKey(cell.date));
              const present: Record<string, boolean> = {
                tasks: entry?.tasks ?? false,
                assignments: entry?.assignments ?? false,
                exams: entry?.exams ?? false,
                classes: presence.classWeekdays.has(isoWeekday(cell.date)),
              };
              const dotCount = CATEGORY_DOTS.filter((c) => present[c.key]).length;
              const isSelected = isSameDay(cell.date, selected);
              const isToday = isSameDay(cell.date, today);
              return (
                <button
                  key={cell.date.toISOString()}
                  type="button"
                  aria-pressed={isSelected}
                  aria-label={formatLongDate(cell.date)}
                  data-today={isToday ? "true" : undefined}
                  onClick={() => setSelected(cell.date)}
                  className={cn(
                    "relative flex aspect-square flex-col items-center justify-center gap-1 rounded-lg text-sm font-medium transition-colors",
                    !cell.inMonth && "text-slate-500 dark:text-slate-600",
                    cell.inMonth &&
                      !isSelected &&
                      !isToday &&
                      "text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800",
                    // SELECTED and TODAY strip the hover class (S8-C pin).
                    isToday && !isSelected && "sf-today-cell-tint text-sf-primary-strong dark:text-sf-primary-strong-dark",
                    isSelected && "sf-selected-tint text-white",
                  )}
                >
                  {/* The day number carries its own color (no transition of
                      its own) so the dark tint lands instantly (S10-4). */}
                  <span
                    className={cn(
                      isToday && !isSelected && "text-sf-primary-strong dark:text-sf-primary-strong-dark",
                      isToday && isSelected && "font-semibold",
                    )}
                  >
                    {cell.date.getDate()}
                  </span>
                  {cell.inMonth && dotCount > 0 && (
                    // The reference's dot row: a plain flex gap-0.5 strip
                    // of w-1.5 h-1.5 rounded-full category dots (the
                    // button's own gap-1 provides the vertical offset).
                    <span className="flex items-center gap-0.5" aria-hidden>
                      {CATEGORY_DOTS.filter((c) => present[c.key]).map((c) => (
                        <span
                          key={c.key}
                          className={cn(
                            "size-1.5 rounded-full",
                            isSelected ? "bg-white" : c.className,
                          )}
                        />
                      ))}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </section>
        )}

        <div role="group"
          aria-label="Calendar legend"
          className="flex flex-wrap items-center gap-4 text-sm text-slate-600 dark:text-slate-300"
        >
          <span className="inline-flex items-center gap-1.5">
            <span className="size-2.5 rounded-full bg-blue-500" aria-hidden /> Tasks
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="size-2.5 rounded-full bg-amber-500" aria-hidden /> Assignments
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="size-2.5 rounded-full bg-red-500" aria-hidden /> Exams
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="size-2.5 rounded-full bg-emerald-500" aria-hidden /> Classes
          </span>
        </div>

        <section className="sf-card p-6" aria-label="Day detail">
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">
            {formatLongDateWithWeekday(selected)}
          </h3>

          {/* S140/CO4b (Audit A L-2): the day detail renders FIVE collections
              (events/tasks/assignments/exams/classes — see dayEmpty) — the
              OR-form gate covers them all. S162/DK4: the gate announces
              itself (role="status" — the calculator-view precedent). */}
          {loading &&
          (events.length === 0 ||
            tasks.length === 0 ||
            assignments.length === 0 ||
            exams.length === 0 ||
            timetable.length === 0) ? (
            <div className="flex justify-center py-8 text-sf-primary" role="status" aria-label="Loading day details">
              <Spinner className="size-6" />
            </div>
          ) : dayEmpty ? (
            <p className="py-8 text-center text-slate-500 dark:text-slate-400">
              No events for this day
            </p>
          ) : (
            /* S127/CB5: the reference's grouped day detail (measured live
               2026-11-02 on its Nov 12 exam day): an uppercase category
               label per present group — text-xs font-semibold uppercase —
               over a gap-2 stack of tinted p-3 border-l-4 rows; the groups
               themselves gap-4 apart. The clone keeps its task rows'
               checkbox superset (the S6-G pin) and appends the Events
               group the reference's calendar does not carry. */
            <div className="mt-4 flex flex-col gap-4">
              {selectedTasks.length > 0 && (
                <div className="flex flex-col gap-2">
                  <p className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">
                    Tasks
                  </p>
                  <div className="flex flex-col gap-2">
                    {selectedTasks.map((t) => (
                      <div
                        key={t.id}
                        className="flex items-center gap-3 rounded-lg border-l-4 border-l-blue-500 bg-blue-50 p-3 dark:bg-slate-800/60"
                      >
                        <PriorityCheckbox
                          checked={t.completed}
                          priority={t.priority}
                          label={`Mark "${t.title}" ${t.completed ? "incomplete" : "complete"}`}
                          onToggle={() =>
                            toggleTask(t.id).catch((err: unknown) =>
                              toast.error(
                                err instanceof Error ? err.message : "Update failed",
                              ),
                            )
                          }
                        />
                        <p
                          className={cn(
                            "text-sm font-medium text-slate-700 dark:text-slate-200",
                            t.completed && "line-through text-slate-400",
                          )}
                        >
                          {t.title}
                        </p>
                        <SquareCheckBig className="ml-auto size-4 text-slate-300" strokeWidth={2} />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedAssignments.length > 0 && (
                <div className="flex flex-col gap-2">
                  <p className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">
                    Assignments
                  </p>
                  <div className="flex flex-col gap-2">
                    {selectedAssignments.map((a) => (
                      <div
                        key={a.id}
                        className="rounded-lg border-l-4 border-l-amber-500 bg-amber-50 p-3 dark:bg-slate-800/60"
                      >
                        <p className="font-medium text-slate-700 dark:text-slate-200">
                          {a.title}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedExams.length > 0 && (
                <div className="flex flex-col gap-2">
                  <p className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">
                    Exams
                  </p>
                  <div className="flex flex-col gap-2">
                    {selectedExams.map((e) => (
                      <div
                        key={e.id}
                        className="rounded-lg border-l-4 border-l-red-500 bg-red-50 p-3 dark:bg-slate-800/60"
                      >
                        <p className="font-medium text-slate-700 dark:text-slate-200">
                          {e.title}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedClasses.length > 0 && (
                <div className="flex flex-col gap-2">
                  <p className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">
                    Classes
                  </p>
                  <div className="flex flex-col gap-2">
                    {selectedClasses.map((c) => (
                      <div
                        key={c.id}
                        className="rounded-lg border-l-4 border-l-emerald-500 bg-emerald-50 p-3 dark:bg-slate-800/60"
                      >
                        <p className="font-medium text-slate-700 dark:text-slate-200">
                          {c.name}
                        </p>
                        <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                          {formatHHMMRange(c.startTime, c.endTime)}
                          {c.room ? ` · ${c.room}` : ""}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedEvents.length > 0 && (
                <div className="flex flex-col gap-2">
                  <p className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">
                    Events
                  </p>
                  <div className="flex flex-col gap-2">
                    {selectedEvents.map((e) => (
                      <article
                        key={e.id}
                        className="rounded-lg border-l-4 bg-slate-50 p-3 dark:bg-slate-800/60"
                        style={{ borderLeftColor: e.color }}
                      >
                        <p className="font-medium text-slate-700 dark:text-slate-200">
                          {e.title}
                        </p>
                        <p className="mt-0.5 flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                          <CalendarIcon className="size-3" strokeWidth={2} />
                          {e.allDay
                            ? "All day"
                            : new Date(e.startDate).toLocaleTimeString("en-US", {
                                hour: "numeric",
                                minute: "2-digit",
                              })}
                          {e.location ? ` · ${e.location}` : ""}
                        </p>
                      </article>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

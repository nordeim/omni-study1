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

import { PriorityCheckbox } from "@/components/views/shared";
import { Button } from "@/components/ui/button";
import { mutations, useDataStore } from "@/lib/data";
import {
  addMonths,
  CALENDAR_WEEKDAYS,
  formatLongDate,
  isSameDay,
  monthGrid,
} from "@/lib/date";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/toast";

const EVENT_DOT_COLORS = 3; // max dots before the "+N" overflow chip

export function CalendarView() {
  const tasks = useDataStore((s) => s.tasks);
  const events = useDataStore((s) => s.events);
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

  const shift = (delta: number) => {
    const next = addMonths(new Date(cursor.year, cursor.month, 1), delta);
    setCursor({ year: next.getFullYear(), month: next.getMonth() });
  };

  const selectedEvents = eventsFor(selected);
  const selectedTasks = tasksFor(selected);
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
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
          Calendar
        </h1>
        {/* S5-G/S9-F: the bordered segmented control — white p-1 rounded-lg,
            h-8 tabs, grid3x3/list icons, solid-violet active tab. */}
        <div
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
          {timelineDays.length === 0 ? (
            <p className="py-8 text-center text-slate-400 dark:text-slate-500">
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
        <section className="sf-card sf-print-exact p-6 lg:col-span-2">
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

          <div
            aria-label="Calendar days"
            className="mt-4 grid grid-cols-7 gap-1"
          >
            {CALENDAR_WEEKDAYS.map((d) => (
              <div
                key={d}
                className="py-2 text-center text-sm font-medium text-slate-500 dark:text-slate-400"
              >
                {d}
              </div>
            ))}
            {cells.map((cell) => {
              const dayEvents = eventsFor(cell.date);
              const isSelected = isSameDay(cell.date, selected);
              const isToday = isSameDay(cell.date, today);
              return (
                <button
                  key={cell.date.toISOString()}
                  type="button"
                  aria-pressed={isSelected}
                  aria-label={formatLongDate(cell.date)}
                  data-today={isToday ? "" : undefined}
                  onClick={() => setSelected(cell.date)}
                  className={cn(
                    "relative flex aspect-square flex-col items-center justify-center gap-1 rounded-lg text-sm font-medium transition-colors",
                    !cell.inMonth && "text-slate-300 dark:text-slate-600",
                    cell.inMonth &&
                      !isSelected &&
                      !isToday &&
                      "text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800",
                    // SELECTED and TODAY strip the hover class (S8-C pin).
                    isToday && !isSelected && "sf-today-tint text-sf-primary-strong dark:text-sf-primary-strong-dark",
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
                  {cell.inMonth && dayEvents.length > 0 && (
                    <span className="flex items-center gap-0.5" aria-hidden>
                      {dayEvents.slice(0, EVENT_DOT_COLORS).map((e) => (
                        <span
                          key={e.id}
                          className={cn(
                            "size-1.5 rounded-full",
                            isSelected && "bg-white/90",
                          )}
                          style={
                            isSelected
                              ? undefined
                              : { backgroundColor: e.color }
                          }
                        />
                      ))}
                      {dayEvents.length > EVENT_DOT_COLORS && (
                        <span
                          className={cn(
                            "text-[9px] leading-none",
                            isSelected ? "text-white/90" : "text-slate-400",
                          )}
                        >
                          +{dayEvents.length - EVENT_DOT_COLORS}
                        </span>
                      )}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </section>
        )}

        <section className="sf-card p-6">
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">
            {formatLongDate(selected)}
          </h3>

          {selectedEvents.length === 0 && selectedTasks.length === 0 ? (
            <p className="py-8 text-center text-slate-400 dark:text-slate-500">
              No events this day
            </p>
          ) : (
            <div className="mt-4 flex flex-col gap-3">
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
              {selectedTasks.map((t) => (
                <article
                  key={t.id}
                  className="flex items-center gap-3 rounded-lg border-l-4 border-l-sf-primary bg-slate-50 p-3 dark:bg-slate-800/60"
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
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

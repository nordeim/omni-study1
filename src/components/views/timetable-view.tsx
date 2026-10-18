"use client";

// ---------------------------------------------------------------------------
// Timetable (S7/S8-E): a grid-cols-8 week time table — time column + 7 day
// heads (full day names + text-lg dates), 60px hour rows labelled "7 AM",
// min-w-[900px] inside overflow-x-auto, the TODAY tint on the COLUMN HEADER
// cell only, and a md:hidden mobile day accordion. Column→ISO mapping is
// (col + 6) % 7 (Sunday-first display vs 0=Monday storage).
// ---------------------------------------------------------------------------

import * as React from "react";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/toast";
import { EmptyState } from "@/components/views/shared";
import { mutations, useDataStore, type TimetableClassInput, type TimetableClassRow } from "@/lib/data";
import { addDays, formatHHMMRange, formatLongDate, formatWeekdayMonthDay, formatShortWithYear, startOfDay } from "@/lib/date";
import { apiSend, ApiError } from "@/lib/api";
import { cn } from "@/lib/utils";

const DAY_NAMES = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];
const HOURS = Array.from({ length: 12 }, (_, i) => i + 7); // 7 AM … 6 PM

/** Sunday-first display column → ISO weekday (0=Monday). */
const columnToIso = (col: number): number => (col + 6) % 7;

const WEEK_TYPE_LABELS: Record<string, string> = {
  ALL: "All Weeks",
  A: "Week A",
  B: "Week B",
};

export function TimetableView() {
  const classes = useDataStore((s) => s.timetable);
  const subjects = useDataStore((s) => s.subjects);
  const createTimetableClass = mutations.createTimetableClass;
  const updateTimetableClass = mutations.updateTimetableClass;
  const deleteTimetableClass = mutations.deleteTimetableClass;
  const { toast } = useToast();

  const today = startOfDay(new Date());
  // The week containing today, SUNDAY-first (session-63 Batch T: the
  // reference's week runs Sun→Sat — "Oct 18 - Oct 24" with today in the
  // FIRST column). The old Monday-first range under Sunday-first labels
  // misaligned every head's date by one day ("Sunday 12" for a Monday).
  const sundayOffset = today.getDay();
  const [weekStart, setWeekStart] = React.useState(() => addDays(today, -sundayOffset));
  const [weekType, setWeekType] = React.useState<"ALL" | "A" | "B">("ALL");
  const [builder, setBuilder] = React.useState(false);
  // The mobile accordion opens on today's COLUMN (Sunday-first display:
  // column === getDay()). The old ISO-index math pointed one column off
  // under the Sunday-first heads — part of the session-63 misalignment.
  const [openDay, setOpenDay] = React.useState<number | null>(today.getDay());
  const [dialog, setDialog] = React.useState<{ open: boolean; editing: TimetableClassRow | null }>({
    open: false,
    editing: null,
  });
  const [form, setForm] = React.useState({
    name: "",
    dayOfWeek: 0,
    startTime: "09:00",
    endTime: "10:30",
    subjectId: "",
    room: "",
    weekType: "ALL" as "ALL" | "A" | "B",
  });
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState("");

  const weekDays = React.useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)),
    [weekStart],
  );

  const visible = React.useMemo(
    () => classes.filter((c) => weekType === "ALL" || c.weekType === "ALL" || c.weekType === weekType),
    [classes, weekType],
  );

  const classesAt = (isoDay: number, hour: number) =>
    visible.filter((c) => {
      if (c.dayOfWeek !== isoDay) return false;
      const [h] = c.startTime.split(":").map(Number);
      return h === hour;
    });

  const subjectOf = (id: string | null) => subjects.find((s) => s.id === id) ?? null;

  const openCreate = (day?: number) => {
    setForm({
      name: "",
      dayOfWeek: day ?? 0,
      startTime: "09:00",
      endTime: "10:30",
      subjectId: "",
      room: "",
      weekType: "ALL",
    });
    setError("");
    setDialog({ open: true, editing: null });
  };

  const openEdit = (row: TimetableClassRow) => {
    setForm({
      name: row.name,
      dayOfWeek: row.dayOfWeek,
      startTime: row.startTime,
      endTime: row.endTime,
      subjectId: row.subjectId ?? "",
      room: row.room,
      weekType: row.weekType,
    });
    setError("");
    setDialog({ open: true, editing: row });
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError("");
    const payload: TimetableClassInput = {
      name: form.name,
      dayOfWeek: form.dayOfWeek,
      startTime: form.startTime,
      endTime: form.endTime,
      subjectId: form.subjectId,
      room: form.room,
      weekType: form.weekType,
    };
    try {
      if (dialog.editing) {
        await updateTimetableClass(dialog.editing.id, payload);
        toast.success("Class updated.");
      } else {
        await createTimetableClass(payload);
        toast.success("Class added.");
      }
      setDialog({ open: false, editing: null });
    } catch (err: unknown) {
      setError(err instanceof ApiError ? err.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  };

  const remove = async (id: string) => {
    try {
      await deleteTimetableClass(id);
      toast.success("Class removed.");
    } catch (err: unknown) {
      toast.error(err instanceof ApiError ? err.message : "Delete failed.");
    }
  };

  const weekLabel = `${new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(weekDays[0])} - ${new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(weekDays[6])}`;

  const isThisWeek = weekDays.some((d) => d.toDateString() === today.toDateString());

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
            Timetable
          </h1>
          <p className="mt-1 text-base text-slate-500 dark:text-slate-400">
            Manage your class schedule
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-lg"
            aria-label="Previous week"
            onClick={() => setWeekStart((w) => addDays(w, -7))}
          >
            <ChevronLeft className="size-4" strokeWidth={2} />
          </Button>
          <span className="min-w-32 text-center text-sm font-medium text-slate-600 dark:text-slate-300">
            {weekLabel}
          </span>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-lg"
            aria-label="Next week"
            onClick={() => setWeekStart((w) => addDays(w, 7))}
          >
            <ChevronRight className="size-4" strokeWidth={2} />
          </Button>
          <Select
            value={weekType}
            onValueChange={(v) => setWeekType(v as "ALL" | "A" | "B")}
          >
            <SelectTrigger className="h-9 w-32" aria-label="Week filter">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Weeks</SelectItem>
              <SelectItem value="A">Week A</SelectItem>
              <SelectItem value="B">Week B</SelectItem>
            </SelectContent>
          </Select>
          <Button
            type="button"
            variant="outline"
            aria-pressed={builder}
            onClick={() => setBuilder((b) => !b)}
          >
            Grid Builder
          </Button>
          <Button type="button" variant="gradient" className="sf-gradient-shadow" onClick={() => openCreate()}>
            <Plus className="size-4" strokeWidth={2} />
            Add Class
          </Button>
        </div>
      </div>

      {classes.length === 0 ? (
        <div className="sf-card">
          <EmptyState
            icon={Clock}
            title="No classes yet"
            hint="Add your first class to build your weekly timetable."
            cta={
              <Button type="button" variant="gradient" className="sf-gradient-shadow-lg" onClick={() => openCreate()}>
                <Plus className="size-4" strokeWidth={2} />
                Add Class
              </Button>
            }
          />
        </div>
      ) : (
        <>
          {/* Desktop week grid */}
          <section className="sf-card overflow-hidden p-6 max-md:hidden">
            <div className="sf-timetable-canvas min-w-[900px] overflow-x-auto" aria-label="Week grid">
              <div className="grid grid-cols-8" data-builder={builder ? "true" : undefined} aria-label="Week header">
                <div />
                {weekDays.map((day, col) => {
                  const isTodayCol = isThisWeek && day.toDateString() === today.toDateString();
                  return (
                    <div
                      key={day.toISOString()}
                      data-today-header={isTodayCol ? "" : undefined}
                      className={cn(
                        "border-l border-slate-100 p-3 text-center dark:border-slate-800",
                        isTodayCol && "rounded-lg sf-today-tint",
                      )}
                    >
                      <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
                        {DAY_NAMES[columnToIso(col)]}
                      </p>
                      <p className="text-lg font-bold text-slate-800 dark:text-sf-primary-strong-dark">
                        {day.getDate()}
                      </p>
                    </div>
                  );
                })}
              </div>
              <div className="grid grid-cols-8" aria-label="Hour cells">
                {HOURS.map((hour) => (
                  <React.Fragment key={hour}>
                    <div className="border-b border-slate-50 pr-2 pt-1 text-right text-xs text-slate-500 dark:border-slate-800">
                      {hour === 12 ? "12 PM" : hour > 12 ? `${hour - 12} PM` : `${hour} AM`}
                    </div>
                    {weekDays.map((day, col) => {
                      const isoDay = columnToIso(col);
                      const cellClasses = classesAt(isoDay, hour);
                      return (
                        <div
                          key={`${day.toISOString()}-${hour}`}
                          className="relative min-h-[60px] border-b border-l border-slate-50 dark:border-slate-800"
                        >
                          {cellClasses.map((c, idx) => {
                            const subject = subjectOf(c.subjectId);
                            const color = subject?.color ?? "rgb(var(--sf-primary))";
                            const startHour = Number(c.startTime.split(":")[0]);
                            const endHour = Number(c.endTime.split(":")[0]);
                            const span = Math.max(1, endHour - startHour);
                            return (
                              <button
                                key={c.id}
                                type="button"
                                onClick={() => openEdit(c)}
                                className="group absolute inset-x-1 rounded-lg border-l-4 p-2 text-left text-xs outline-none focus-visible:ring-2 focus-visible:ring-sf-primary/40"
                                style={{
                                  top: 2 + idx * 4,
                                  height: `calc(${span} * 60px - 8px)`,
                                  left: `${2 + idx * 10}%`,
                                  right: `${2 + idx * 10}%`,
                                  backgroundColor: `${color}1a`,
                                  borderLeftColor: color,
                                  zIndex: 1,
                                }}
                              >
                                <p className="font-medium text-slate-700 dark:text-slate-200">
                                  {c.name}
                                </p>
                                <p className="text-[10px] text-slate-600 dark:text-slate-400">
                                  {c.startTime}–{c.endTime}
                                  {c.room ? ` · ${c.room}` : ""}
                                </p>
                                <span className="mt-1 hidden gap-1 group-hover:flex">
                                  <Pencil
                                    role="img"
                                    aria-label={`Edit ${c.name}`}
                                    className="size-3 text-slate-400"
                                    strokeWidth={2}
                                  />
                                  <Trash2
                                    role="img"
                                    aria-label={`Delete ${c.name}`}
                                    className="size-3 text-slate-400"
                                    strokeWidth={2}
                                  />
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      );
                    })}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </section>

          {/* Mobile day accordion */}
          <section className="sf-card p-4 md:hidden">
            {/* The S11 mobile today chip (a real div with the literal soft
                class — the S11 locator reads it at 390px). */}
            <div className="sf-chip-dark mb-2 flex items-center justify-between rounded-lg bg-sf-primary-soft px-3 py-2 text-sm font-medium text-sf-primary-strong dark:text-sf-primary-strong-dark">
              <span>Today</span>
              <span>{formatShortWithYear(today)}</span>
            </div>
            <div className="flex flex-col gap-2">
              {weekDays.map((day, col) => {
                const isoDay = columnToIso(col);
                const dayClasses = visible.filter((c) => c.dayOfWeek === isoDay);
                const isTodayCol = isThisWeek && day.toDateString() === today.toDateString();
                const open = openDay === col;
                return (
                  <div key={day.toISOString()} className="rounded-xl border border-slate-100 dark:border-slate-800">
                    <button
                      type="button"
                      aria-expanded={open}
                      onClick={() => setOpenDay(open ? null : col)}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-xl p-3 text-left",
                        isTodayCol && "sf-today-tint",
                      )}
                    >
                      <span
                        className={cn(
                          "flex size-10 items-center justify-center rounded-xl text-sm font-bold",
                          isTodayCol
                            ? "sf-selected-tint text-white"
                            : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
                        )}
                      >
                        {day.getDate()}
                      </span>
                      <span className="flex-1">
                        <span className="block font-medium text-slate-700 dark:text-slate-200">
                          {DAY_NAMES[isoDay]}
                        </span>
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                          {dayClasses.length} {dayClasses.length === 1 ? "class" : "classes"}
                        </span>
                      </span>
                      <ChevronDown
                        className={cn("size-4 text-slate-400 transition-transform", open && "rotate-180")}
                        strokeWidth={2}
                      />
                    </button>
                    {open && (
                      <div className="flex flex-col gap-2 px-3 pb-3">
                        {dayClasses.length === 0 ? (
                          <p className="py-2 text-sm text-slate-500">No classes this day.</p>
                        ) : (
                          dayClasses.map((c) => {
                            const subject = subjectOf(c.subjectId);
                            const color = subject?.color ?? "rgb(var(--sf-primary))";
                            return (
                              <div
                                key={c.id}
                                className="flex items-center gap-3 rounded-lg border-l-4 p-3"
                                style={{ backgroundColor: `${color}1a`, borderLeftColor: color }}
                              >
                                <div className="min-w-0 flex-1">
                                  <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                                    {c.name}
                                  </p>
                                  <p className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                                    {c.startTime}–{c.endTime}
                                    {c.room && (
                                      <span className="inline-flex items-center gap-1">
                                        <MapPin className="size-3" strokeWidth={2} />
                                        {c.room}
                                      </span>
                                    )}
                                  </p>
                                </div>
                                <button
                                  type="button"
                                  aria-label={`Edit ${c.name}`}
                                  onClick={() => openEdit(c)}
                                  className="flex size-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                                >
                                  <Pencil className="size-4" strokeWidth={2} />
                                </button>
                              </div>
                            );
                          })
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        </>
      )}

      {/* My Classes */}
      {classes.length > 0 && (
        <section className="sf-card p-6">
          <div className="flex items-center justify-between" aria-label="My Classes header">
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">My Classes</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">{formatWeekdayMonthDay(today)}</p>
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {visible.slice(0, 9).map((c) => {
              const subject = subjectOf(c.subjectId);
              const color = subject?.color ?? "rgb(var(--sf-primary))";
              return (
                <article key={c.id} className="overflow-hidden rounded-xl border border-slate-100 dark:border-slate-800">
                  <div className="h-2" style={{ backgroundColor: color }} />
                  <div className="p-4">
                    <h3 className="font-semibold text-slate-800 dark:text-slate-100">{c.name}</h3>
                    <p className="mt-1 flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                      <Clock className="size-3" strokeWidth={2} />
                      {formatHHMMRange(c.startTime, c.endTime)}
                      {c.room && (
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="size-3" strokeWidth={2} />
                          {c.room}
                        </span>
                      )}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {DAY_NAMES[c.dayOfWeek]} · {WEEK_TYPE_LABELS[c.weekType]}
                    </p>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      )}

      <Dialog open={dialog.open} onOpenChange={(open) => !open && setDialog({ open: false, editing: null })}>
        <DialogContent className="max-w-md rounded-lg">
          <DialogHeader>
            <DialogTitle>{dialog.editing ? "Edit Class" : "Add Class"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={submit} className="flex flex-col gap-4" noValidate>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="class-name">Class name</Label>
              <Input
                id="class-name"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="Calculus II"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="class-day">Day</Label>
                <Select
                  value={String(form.dayOfWeek)}
                  onValueChange={(v) => setForm((f) => ({ ...f, dayOfWeek: Number(v) }))}
                >
                  <SelectTrigger id="class-day" className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DAY_NAMES.map((name, i) => (
                      <SelectItem key={name} value={String(i)}>
                        {name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="class-week">Week</Label>
                <Select
                  value={form.weekType}
                  onValueChange={(v) => setForm((f) => ({ ...f, weekType: v as "ALL" | "A" | "B" }))}
                >
                  <SelectTrigger id="class-week" className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Weeks</SelectItem>
                    <SelectItem value="A">Week A</SelectItem>
                    <SelectItem value="B">Week B</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="class-start">Starts</Label>
                <Input
                  id="class-start"
                  type="time"
                  value={form.startTime}
                  onChange={(e) => setForm((f) => ({ ...f, startTime: e.target.value }))}
                  required
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="class-end">Ends</Label>
                <Input
                  id="class-end"
                  type="time"
                  value={form.endTime}
                  onChange={(e) => setForm((f) => ({ ...f, endTime: e.target.value }))}
                  required
                />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="class-subject">Subject (optional)</Label>
              <Select
                value={form.subjectId || "none"}
                onValueChange={(v) => setForm((f) => ({ ...f, subjectId: v === "none" ? "" : v }))}
              >
                <SelectTrigger id="class-subject" className="h-9">
                  <SelectValue placeholder="No subject" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No subject</SelectItem>
                  {subjects.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="class-room">Room (optional)</Label>
              <Input
                id="class-room"
                value={form.room}
                onChange={(e) => setForm((f) => ({ ...f, room: e.target.value }))}
                placeholder="M201"
              />
            </div>
            {error && (
              <div
                role="alert"
                className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-200"
              >
                {error}
              </div>
            )}
            <DialogFooter>
              <Button type="submit" variant="gradient" className="sf-gradient-shadow" disabled={busy}>
                {dialog.editing ? "Save changes" : "Add class"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

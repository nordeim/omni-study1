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
import { Spinner } from "@/components/views/shared";
import { mutations, useDataStore, type TimetableClassInput, type TimetableClassRow } from "@/lib/data";
import { addDays, formatHHMMRange, formatWeekdayMonthDay, formatShortDate, startOfDay } from "@/lib/date";
import { ApiError } from "@/lib/api";
// S165/DN3: the WEEK_TYPES single source joins the import (the DK2
// events-REPEATS port's map-over-the-import form) — the view had
// hard-coded the ALL/A/B triple in two Selects + the state type + the
// label-map keys beside validation.ts:123's S133/CH2-promoted source
// (the DM3 census-blind-spot class: a future schema value would be
// accepted by the API but un-selectable in the UI — the CB9 drift
// class). The census's sixth site pins the import.
import { normalizeHhmmForInput, WEEK_TYPES } from "@/lib/validation";
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
// S127/CB6: FOURTEEN rows — 7 AM … 8 PM (measured live on the reference
// 2026-11-02: its desktop week grid renders 14 hour rows; the clone
// rendered 12, cutting the 7 PM and 8 PM bands).
const HOURS = Array.from({ length: 14 }, (_, i) => i + 7); // 7 AM … 8 PM

/** Sunday-first display column → ISO weekday (0=Monday). */
const columnToIso = (col: number): number => (col + 6) % 7;

// S165/DN3: the derived alias — typed OFF the imported single source (it
// cannot fork; the census's no-local-twin leg guards the const form).
type WeekType = (typeof WEEK_TYPES)[number];

// S165/DN3: the label map typed off the source — a future vocabulary value
// FAILS TYPECHECK until the map covers it (the machine guard the hard-coded
// triple never had). The labels are the reference-measured copy.
const WEEK_TYPE_LABELS: Record<WeekType, string> = {
  ALL: "All Weeks",
  A: "Week A",
  B: "Week B",
};

export function TimetableView() {
  const classes = useDataStore((s) => s.timetable);
  // S130/CE3: the loading gate (the tasks-view idiom — the background
  // loadAll window must not render the false "No classes yet").
  const loading = useDataStore((s) => s.loading);
  const subjects = useDataStore((s) => s.subjects);
  const createTimetableClass = mutations.createTimetableClass;
  const updateTimetableClass = mutations.updateTimetableClass;
  const { toast } = useToast();

  const today = startOfDay(new Date());
  // The week containing today, SUNDAY-first (session-63 Batch T: the
  // reference's week runs Sun→Sat — "Oct 18 - Oct 24" with today in the
  // FIRST column). The old Monday-first range under Sunday-first labels
  // misaligned every head's date by one day ("Sunday 12" for a Monday).
  const sundayOffset = today.getDay();
  const [weekStart, setWeekStart] = React.useState(() => addDays(today, -sundayOffset));
  const [weekType, setWeekType] = React.useState<WeekType>("ALL");
  // S138/CM6 (audit FE-2): the Grid Builder's toggle state, pressed
  // semantics, and dead canvas attribute produced NO functional or
  // visible change — a control announcing a state that does not exist
  // (WCAG 4.1.2). The reference's own button (measured live, S138) is a
  // no-op with no pressed semantics; the honest clone form is the
  // parity-pinned outline button, stateless.
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
    weekType: "ALL" as WeekType,
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
      // S123/BX1: legacy rows can carry UNPADDED hours ("9:00" — written
      // past the Zod boundary by the pre-BX1 seed) — <input type="time">
      // BLANKS a non-HH:MM value, so the raw populate opened the edit
      // dialog with an empty start field.
      startTime: normalizeHhmmForInput(row.startTime),
      endTime: normalizeHhmmForInput(row.endTime),
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
    // S152/DA2 (the S151 audit's B-L6): the hand-guard — the noValidate
    // form's empty required fields answer HERE with human copy (the
    // S127/CB17 files-view pattern), never the server's raw Zod issue
    // text. The time inputs carry dialog defaults ("09:00"/"10:30") but
    // are clearable — all three required fields guard. Before setBusy:
    // an early return must not strand the busy latch.
    if (!form.name.trim()) {
      setError("Please enter a name.");
      return;
    }
    if (!form.startTime) {
      setError("Please pick a start time.");
      return;
    }
    if (!form.endTime) {
      setError("Please pick an end time.");
      return;
    }
    // S161/DJ2 (the s161 audit B/F-2): the band hand-guard. The S127/CB6b
    // min/max attributes never bound the TYPED path — this form carries
    // noValidate, which disables ALL interactive constraint validation on
    // submission, so a typed 06:30 start submitted cleanly and the class
    // then matched no HOURS row (7..20) — it silently VANISHED from the
    // desktop week grid, the exact perceived-data-loss class the CB6b
    // comment claimed the native constraint prevented. The hand-guard
    // owns the band now (the DA2 position — before setBusy, no stranded
    // latch). The end time keeps no band by design: an end past 20:59
    // renders a taller card (cosmetic, the class still renders at its
    // start hour's row) — the documented residual; the end-before-start
    // ordering stays the server schema's check.
    const startHour = Number(form.startTime.split(":")[0]);
    if (startHour < 7 || startHour > 20) {
      setError("Classes must start between 7 AM and 8 PM.");
      return;
    }
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

  // S119/BT9: the dead `remove()` is gone — the reference's Timetable has NO
  // delete affordance in any measured state (its class cells carry a single
  // edit action; its button census shows no delete control), so this
  // never-called path (and the decorative Trash2 glyph that polluted the
  // edit button's accessible name with a nonexistent "Delete X" action) was
  // dead code, not a missing feature. A delete affordance remains an
  // ADR-level superset decision if ever wanted.

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
        {/* flex-wrap (S78/AE12): the All Weeks + Grid Builder + Add Class row
            exceeds 390px unwrapped (measured 402; the ref itself reads 395 —
            its own bug family). At ≥sm the row fits one line. */}
        <div className="flex flex-wrap items-center gap-2">
          <Select
            value={weekType}
            onValueChange={(v) => setWeekType(v as WeekType)}
          >
            <SelectTrigger className="h-9 w-32" aria-label="Week filter">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {/* S165/DN3: the options render from validation.ts's WEEK_TYPES
                  single source (the census's sixth site —
                  tests/enum-single-source.test.ts). */}
              {WEEK_TYPES.map((w) => (
                <SelectItem key={w} value={w}>
                  {WEEK_TYPE_LABELS[w]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button type="button" variant="outline">
            Grid Builder
          </Button>
          <Button type="button" variant="gradient" className="sf-gradient-shadow" onClick={() => openCreate()}>
            <Plus className="size-4" strokeWidth={2} />
            Add Class
          </Button>
        </div>
      </div>

      {loading && classes.length === 0 ? (
        <div
          className="sf-card flex justify-center py-16 text-sf-primary"
          role="status"
          aria-label="Loading timetable"
          /* S165/DN2 (the s165 audit B/L-1): the CE3 loading gate announces
             itself (role="status" — the DM2 assignments/DL2 exams/DK4
             events-calendar precedent; the Spinner itself is aria-hidden, so
             the unlabeled div was silent to assistive tech during the
             in-flight window). This OUTER gate owns the whole in-flight
             window — see the day-detail note below. */
        >
          <Spinner className="size-6" />
        </div>
      ) : (
        <>
          {/* S184/EH (measured): the reference renders the FULL GRID at
              zero subjects — the grid skeleton always renders (empty cells,
              no class blocks); the zero-state surface is the slim empty
              in the My Classes panel below, not a family EmptyState. The
              pre-port EmptyState branch retires; the toolbar's Add Class
              (measured) keeps the create path. */}
          {/* Session-64 Batch U: the reference's centered month/week banner
              sits between the header and the grid — a white card carrying
              [‹] [month-year + range] [›]; the week nav lives HERE (the ref
              chevrons are unnamed, at the card's padding edges). The h2
              reads the week's FIRST-DAY month (measured: the spanning week
              Sep 27 - Oct 3 renders "September 2026"). */}
          <div
            role="group"
            aria-label="Week banner"
            className="flex items-center justify-between rounded-xl border border-slate-100 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-card"
          >
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-md"
              aria-label="Previous week"
              onClick={() => setWeekStart((w) => addDays(w, -7))}
            >
              <ChevronLeft className="size-4" strokeWidth={2} />
            </Button>
            <div className="text-center">
              <h2 className="font-semibold text-slate-700 dark:text-slate-200">
                {new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" }).format(weekStart)}
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">{weekLabel}</p>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-md"
              aria-label="Next week"
              onClick={() => setWeekStart((w) => addDays(w, 7))}
            >
              <ChevronRight className="size-4" strokeWidth={2} />
            </Button>
          </div>

          {/* Desktop week grid */}
          <section className="sf-card overflow-hidden p-6 max-md:hidden">
            <div role="group" className="sf-timetable-canvas min-w-[900px] overflow-x-auto" aria-label="Week grid">
              <div role="group" className="grid grid-cols-8" aria-label="Week header">
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
              <div role="group" className="grid grid-cols-8" aria-label="Hour cells">
                {HOURS.map((hour) => (
                  <React.Fragment key={hour}>
                    <div className="border-b border-slate-50 pr-2 pt-1 text-right text-xs text-slate-500 dark:text-slate-400 dark:border-slate-800">
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
                                  // The documented z-map's ONE inline
                                  // exception (S124/BY15): a local
                                  // same-cell overlap tweak inside an
                                  // absolutely-positioned block — not a
                                  // chrome layer, outside the 30/50/60/70
                                  // scale on purpose.
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
                                  {/* S119/BT9: the pencil is decorative; the
                                      action word is visually hidden. The
                                      accessible name comes FROM the content
                                      (Label in Name: an aria-label cannot
                                      contain the whole visible text — the
                                      name + time + room — so the grid cell
                                      never takes one). */}
                                  <Pencil
                                    aria-hidden
                                    className="size-3 text-slate-400"
                                    strokeWidth={2}
                                  />
                                </span>
                                <span className="sr-only">Edit class</span>
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
              <span>{formatShortDate(today)}</span>
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
                        {/* S165/DN2: the S130/CE3 day-detail gate is GONE — it
                            was UNREACHABLE dead code (the calendar-pattern
                            copy landed inside the has-classes ternary branch,
                            which guarantees classes.length > 0 whenever this
                            accordion renders, so `loading && classes.length
                            === 0` could never hold here). The OUTER gate at
                            the top of the view owns the in-flight window; a
                            settled-empty day is the honest "No classes this
                            day." */}
                        {dayClasses.length === 0 ? (
                          <p className="py-2 text-sm text-slate-500 dark:text-slate-400">No classes this day.</p>
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

      {/* My Classes — rendered ALWAYS (S184/EH: the measured zero-state
          lives HERE — the slim empty in the panel, not a grid-replacing
          EmptyState); the copy is clone-accurate (the reference's own
          "No subjects added yet" derives from ITS subject-based model —
          data-shaped, not portable; the clone's TimetableClass creates
          through the toolbar's Add Class). */}
      <section className="sf-card p-6">
        <div role="group" className="flex items-center justify-between" aria-label="My Classes header">
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">My Classes</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">{formatWeekdayMonthDay(today)}</p>
        </div>
        {visible.length === 0 ? (
          <p className="py-8 text-center text-slate-400 dark:text-slate-500">
            No classes yet. Use Add Class to build your weekly timetable.
          </p>
        ) : (
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {/* S140/CO4c (Audit A L-3): the silent 9-card cap is gone —
                it hid user data with no affordance and no measured
                reference basis (the reference renders its empty state
                here; chrome-level parity is unaffected). The 3-col grid
                handles the domain scale (a real timetable carries
                ~10-20 classes). */}
            {visible.map((c) => {
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
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                      {DAY_NAMES[c.dayOfWeek]} · {WEEK_TYPE_LABELS[c.weekType]}
                    </p>
                  </div>
                </article>
              );
            })}
          </div>
        )}
        </section>

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
                  onValueChange={(v) => setForm((f) => ({ ...f, weekType: v as WeekType }))}
                >
                  <SelectTrigger id="class-week" className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {/* S165/DN3: the dialog's week options render from the
                        same WEEK_TYPES single source as the filter above. */}
                    {WEEK_TYPES.map((w) => (
                      <SelectItem key={w} value={w}>
                        {WEEK_TYPE_LABELS[w]}
                      </SelectItem>
                    ))}
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
                  // S127/CB6b → S161/DJ2: the band guard's picker half —
                  // a class whose start hour falls outside the rendered
                  // band (7 AM…8 PM) matched no row and silently VANISHED
                  // from the desktop grid after save (perceived data loss
                  // on the primary surface; the mobile accordion and My
                  // Classes cards still showed it). HONESTY (S161/DJ2):
                  // these min/max attributes bound ONLY the picker UI —
                  // the form's noValidate kills them on the TYPED submit
                  // path — the submit() hand-guard owns the band now;
                  // legacy/imported out-of-band rows still render in the
                  // accordion + cards.
                  min="07:00"
                  max="20:59"
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
                className="sf-alert-red rounded-lg px-3 py-2 text-sm"
              >
                {error}
              </div>
            )}
            <DialogFooter>
              {/* S120/BU9 (measured): the reference's Add Class dialog
                  carries an explicit Cancel beside the submit. */}
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialog({ open: false, editing: null })}
              >
                Cancel
              </Button>
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

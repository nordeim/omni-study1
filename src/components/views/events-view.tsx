"use client";

// ---------------------------------------------------------------------------
// Events (S5): a DARK slate-900 terminal panel — intentionally dark in BOTH
// themes; no dark: overrides inside. The header is a DAY-FOCUS carousel
// (session-64 Batch U, measured on the reference): four controls (‹ ○ › ∨)
// step the focused day; the big date, the weekday abbrev and the
// "Oct 2026 CW <referenceWeekNumber>" line all track it, and the 7-day list
// re-anchors to the focused day while the Today/Tomorrow labels stay
// anchored to the REAL today. Recurring events expand occurrences in-window.
// ---------------------------------------------------------------------------

import * as React from "react";
import {
  Calendar,
  CalendarDays,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Circle,
  Clock,
  MapPin,
  Pencil,
  Repeat,
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/toast";
import { mutations, useDataStore, type EventInput, type EventRow } from "@/lib/data";
import { addDays, daysUntil, formatWeekdayMonthDay, referenceWeekNumber, startOfDay } from "@/lib/date";
import { apiSend, ApiError } from "@/lib/api";
import { cn } from "@/lib/utils";

const EVENT_COLORS = [
  "#8b5cf6",
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#ec4899",
  "#14b8a6",
  "#64748b",
];

const REMINDER_CHOICES = [15, 30, 60];

type DialogState =
  | { open: false }
  | { open: true; editing: EventRow | null };

function expandOccurrences(event: EventRow, windowDays: Date[]): Date[] {
  const start = startOfDay(new Date(event.startDate));
  const hits: Date[] = [];
  for (const day of windowDays) {
    const d = startOfDay(day);
    const diffDays = Math.round((d.getTime() - start.getTime()) / 86_400_000);
    if (diffDays < 0) continue;
    switch (event.repeat) {
      case "daily":
        hits.push(day);
        break;
      case "weekly":
        if (diffDays % 7 === 0) hits.push(day);
        break;
      case "monthly":
        if (d.getDate() === start.getDate()) hits.push(day);
        break;
      default:
        if (diffDays === 0) hits.push(day);
    }
  }
  return hits;
}

export function EventsView() {
  const events = useDataStore((s) => s.events);
  const createEvent = mutations.createEvent;
  const updateEvent = mutations.updateEvent;
  const deleteEvent = mutations.deleteEvent;
  const { toast } = useToast();

  const [dialog, setDialog] = React.useState<DialogState>({ open: false });
  const [form, setForm] = React.useState({
    title: "",
    startDate: "",
    endDate: "",
    allDay: false,
    color: EVENT_COLORS[0],
    location: "",
    repeat: "none",
    description: "",
  });
  const [reminders, setReminders] = React.useState<number[]>([]);
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState("");

  // The day-focus carousel state (Batch U): the header + list track the
  // FOCUSED day; the relative Today/Tomorrow labels never do (they read
  // the real clock inside dayLabel).
  const [focused, setFocused] = React.useState(() => startOfDay(new Date()));
  const [listOpen, setListOpen] = React.useState(true);

  const windowDays = React.useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDays(focused, i)),
    [focused],
  );

  const openCreate = () => {
    setForm({
      title: "",
      startDate: "",
      endDate: "",
      allDay: false,
      color: EVENT_COLORS[0],
      location: "",
      repeat: "none",
      description: "",
    });
    setReminders([]);
    setError("");
    setDialog({ open: true, editing: null });
  };

  const openEdit = (event: EventRow) => {
    setForm({
      title: event.title,
      startDate: event.startDate.slice(0, 16),
      endDate: event.endDate ? event.endDate.slice(0, 16) : "",
      allDay: event.allDay,
      color: event.color,
      location: event.location,
      repeat: event.repeat,
      description: event.description ?? "",
    });
    try {
      const parsed: unknown = JSON.parse(event.reminders);
      setReminders(Array.isArray(parsed) ? parsed.filter((n): n is number => typeof n === "number") : []);
    } catch {
      setReminders([]);
    }
    setError("");
    setDialog({ open: true, editing: event });
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError("");
    const payload: EventInput = {
      title: form.title,
      startDate: form.startDate,
      endDate: form.endDate,
      allDay: form.allDay,
      color: form.color,
      location: form.location,
      repeat: form.repeat as EventInput["repeat"],
      reminders: JSON.stringify(reminders),
      description: form.description,
    };
    try {
      if (dialog.open && dialog.editing) {
        await updateEvent(dialog.editing.id, payload);
        toast.success("Event updated.");
      } else {
        await createEvent(payload);
        toast.success("Event created.");
      }
      setDialog({ open: false });
    } catch (err: unknown) {
      setError(err instanceof ApiError ? err.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  };

  const remove = async (id: string) => {
    try {
      await deleteEvent(id);
      toast.success("Event deleted.");
    } catch (err: unknown) {
      toast.error(err instanceof ApiError ? err.message : "Delete failed.");
    }
  };

  const toggleReminder = (minutes: number) =>
    setReminders((prev) =>
      prev.includes(minutes)
        ? prev.filter((m) => m !== minutes)
        : [...prev, minutes].sort((a, b) => a - b),
    );

  // The measured rule (Batch U probe): relative labels belong to the REAL
  // today/tomorrow — an index-based rule mislabels the re-anchored list
  // (the ref rendered "Saturday, October 17" for yesterday, then "Today").
  const dayLabel = (day: Date) => {
    const diff = daysUntil(day, startOfDay(new Date()));
    if (diff === 0) return "Today";
    if (diff === 1) return "Tomorrow";
    // The reference's measured format: full weekday + full month, no year
    // ("Tuesday, October 20" — session-63 Batch T).
    return formatWeekdayMonthDay(day);
  };

  const focusControls = [
    { label: "Previous day", icon: ChevronLeft, action: () => setFocused((f) => addDays(f, -1)) },
    { label: "Jump to today", icon: Circle, action: () => setFocused(startOfDay(new Date())) },
    { label: "Next day", icon: ChevronRight, action: () => setFocused((f) => addDays(f, 1)) },
  ] as const;

  return (
    <div className="flex flex-col gap-6">
      {/* Measured Batch U: the reference's page header carries ONLY the
          title + subtitle — its New Event CTA lives INSIDE the dark panel
          (full-width cyan row); the old gradient CTA here was invented. */}
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-800 dark:text-slate-100">
          <CalendarDays className="size-6 text-sf-primary" strokeWidth={2} />
          Events &amp; Reminders
        </h1>
        <p className="mt-1 text-base text-slate-500 dark:text-slate-400">
          Manage your events with custom reminders
        </p>
      </div>

      {/* Session-66 re-measure: the strip is DATE-driven, not data-driven —
          the reference at zero still shows the full panel (controls, big
          date, CW line, the 7-day list reading "No events" per day) and
          renders NO empty card; the old early return replaced the whole
          panel with an invented EmptyState (S17-W).
          S5-V2 (measured s69): the panel itself is p-0 + overflow-hidden;
          the strip carries its own px-4 paddings (no border-b); the day
          rows are full-width slate-800/50 bands with slate-300 labels. */}
      <section className="sf-print-exact overflow-hidden rounded-2xl bg-slate-900 shadow-2xl" aria-label="Events panel">
          {/* Header strip (measured Batch U + s69): overline + controls /
              big date / full-width left-aligned cyan New Event. */}
          <div className="px-4 pb-4 pt-6">
            <div className="flex items-center justify-between">
              <p className="text-xs uppercase tracking-wider text-slate-400">Events</p>
              <div className="flex items-center gap-1">
                {focusControls.map(({ label, icon: Icon, action }) => (
                  <button
                    key={label}
                    type="button"
                    aria-label={label}
                    onClick={action}
                    className="inline-flex size-6 items-center justify-center rounded-md text-slate-400 outline-none hover:bg-slate-800 hover:text-white focus-visible:ring-2 focus-visible:ring-cyan-400/40"
                  >
                    <Icon className="size-4" strokeWidth={2} />
                  </button>
                ))}
                <button
                  type="button"
                  aria-label="Toggle day list"
                  aria-expanded={listOpen}
                  onClick={() => setListOpen((o) => !o)}
                  className="inline-flex size-6 items-center justify-center rounded-md text-slate-400 outline-none hover:bg-slate-800 hover:text-white focus-visible:ring-2 focus-visible:ring-cyan-400/40"
                >
                  <ChevronDown
                    className={cn("size-4 transition-transform", !listOpen && "-rotate-90")}
                    strokeWidth={2}
                  />
                </button>
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-4xl font-bold text-white">{focused.getDate()}</span>
              <div>
                <span className="text-lg font-medium text-white">
                  {new Intl.DateTimeFormat("en-US", { weekday: "short" }).format(focused)}
                </span>
                <p className="text-sm text-slate-400">
                  {new Intl.DateTimeFormat("en-US", { month: "short", year: "numeric" }).format(focused)}{" "}
                  <span>
                    {/* the reference's OWN week convention — US Sunday-start
                        (measured CW 43 on Sun 2026-10-18 where ISO reads 42;
                        session-63 Batch T) — tracking the FOCUSED day. */}
                    CW {referenceWeekNumber(focused)}
                  </span>
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={openCreate}
              className="mt-4 flex h-9 w-full items-center justify-start gap-2 rounded-md px-4 text-sm font-medium text-cyan-400 outline-none hover:bg-slate-800 hover:text-cyan-300 focus-visible:ring-2 focus-visible:ring-cyan-400/40"
            >
              <Calendar className="size-4" strokeWidth={2} />
              New Event
            </button>
          </div>

          {listOpen && (
          <div className="flex flex-col">
            {windowDays.map((day) => {
              const dayEvents = events.flatMap((e) =>
                expandOccurrences(e, [day]).map(() => e),
              );
              return (
                <div key={day.toISOString()}>
                  {/* S5-V2 (measured s69): the day label sits in a full-width
                      slate-800/50 band, slate-300/600 at 14px. */}
                  <div className="bg-slate-800/50 px-4 py-2">
                    <h2 className="text-sm font-semibold text-slate-300">
                      {dayLabel(day)}
                    </h2>
                  </div>
                  {dayEvents.length === 0 ? (
                    <div className="px-4 py-2">
                      {/* slate-400, not the reference's slate-500 — the
                          reference's 3.48:1 on slate-900 fails WCAG AA at
                          14px; the Batch-R/S/Y a11y-wins precedent (S5-V2). */}
                      <p className="my-3 text-sm text-slate-400">No events</p>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2 px-4 py-3">
                      {dayEvents.map((e) => (
                        <article
                          key={`${e.id}-${day.toISOString()}`}
                          className="group flex items-stretch gap-3 rounded-lg bg-slate-800/60 p-4"
                        >
                          <span
                            aria-hidden
                            className="w-1 shrink-0 rounded-full"
                            style={{ backgroundColor: e.color }}
                          />
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-slate-100">{e.title}</p>
                            <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400">
                              <span className="inline-flex items-center gap-1">
                                <Clock className="size-3" strokeWidth={2} />
                                {e.allDay
                                  ? "All day"
                                  : new Date(e.startDate).toLocaleTimeString("en-US", {
                                      hour: "numeric",
                                      minute: "2-digit",
                                    })}
                              </span>
                              {e.location && (
                                <span className="inline-flex items-center gap-1">
                                  <MapPin className="size-3" strokeWidth={2} />
                                  {e.location}
                                </span>
                              )}
                              {e.repeat !== "none" && (
                                <span className="inline-flex items-center gap-1 capitalize">
                                  <Repeat className="size-3" strokeWidth={2} />
                                  {e.repeat}
                                </span>
                              )}
                            </p>
                          </div>
                          <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
                            <button
                              type="button"
                              aria-label={`Edit ${e.title}`}
                              onClick={() => openEdit(e)}
                              className="flex size-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-700 hover:text-white"
                            >
                              <Pencil className="size-4" strokeWidth={2} />
                            </button>
                            <button
                              type="button"
                              aria-label={`Delete ${e.title}`}
                              onClick={() => remove(e.id)}
                              className="flex size-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-700 hover:text-red-400"
                            >
                              <Trash2 className="size-4" strokeWidth={2} />
                            </button>
                          </div>
                        </article>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          )}
        </section>

      <Dialog open={dialog.open} onOpenChange={(open) => !open && setDialog({ open: false })}>
        <DialogContent className="max-w-md rounded-lg">
          <DialogHeader>
            <DialogTitle>{dialog.open && dialog.editing ? "Edit Event" : "New Event"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={submit} className="flex flex-col gap-4" noValidate>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="event-title">Title *</Label>
              <Input
                id="event-title"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                placeholder="Study group — calculus"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="event-start">Start</Label>
                <Input
                  id="event-start"
                  type="datetime-local"
                  value={form.startDate}
                  onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))}
                  required
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="event-end">End</Label>
                <Input
                  id="event-end"
                  type="datetime-local"
                  value={form.endDate}
                  onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))}
                />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="event-allday">All day</Label>
              <Switch
                id="event-allday"
                checked={form.allDay}
                onCheckedChange={(checked) => setForm((f) => ({ ...f, allDay: checked }))}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Color</Label>
              <div className="flex gap-2">
                {EVENT_COLORS.map((hex) => (
                  <button
                    key={hex}
                    type="button"
                    aria-label={`Choose color ${hex}`}
                    aria-pressed={form.color === hex}
                    onClick={() => setForm((f) => ({ ...f, color: hex }))}
                    className={cn(
                      "size-7 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-sf-primary/40",
                      form.color === hex && "ring-2 ring-slate-900 ring-offset-2 dark:ring-white",
                    )}
                    style={{ backgroundColor: hex }}
                  />
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="event-location">Location / Link</Label>
              <Input
                id="event-location"
                value={form.location}
                onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
                placeholder="Room 210 or https://…"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="event-description">Description</Label>
              <Textarea
                id="event-description"
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                rows={3}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="event-repeat">Repeat</Label>
              <Select
                value={form.repeat}
                onValueChange={(v) => setForm((f) => ({ ...f, repeat: v }))}
              >
                <SelectTrigger id="event-repeat" className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No repeat</SelectItem>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Reminders</Label>
              <div className="flex gap-2">
                {REMINDER_CHOICES.map((m) => (
                  <button
                    key={m}
                    type="button"
                    aria-pressed={reminders.includes(m)}
                    onClick={() => toggleReminder(m)}
                    className={cn(
                      "rounded-full border px-3 py-1 text-xs font-medium outline-none focus-visible:ring-2 focus-visible:ring-sf-primary/40",
                      reminders.includes(m)
                        ? "border-sf-primary bg-sf-primary-soft text-sf-primary-strong dark:text-sf-primary-strong-dark"
                        : "border-gray-200 text-slate-600 dark:border-slate-700 dark:text-slate-300",
                    )}
                  >
                    {m} min
                  </button>
                ))}
              </div>
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
              <Button
                type="submit"
                variant="gradient"
                className="sf-gradient-shadow"
                disabled={busy}
              >
                {dialog.open && dialog.editing ? "Save changes" : "Create event"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

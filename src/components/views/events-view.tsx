"use client";

// ---------------------------------------------------------------------------
// Events (S5): a DARK slate-900 terminal panel — intentionally dark in BOTH
// themes; no dark: overrides inside. Day sections run 7 days from today with
// year-less labels; the header carries the CW<calendar week> label and the
// cyan New Event link. Recurring events expand occurrences in-window.
// ---------------------------------------------------------------------------

import * as React from "react";
import {
  CalendarDays,
  Clock,
  MapPin,
  Pencil,
  Plus,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/toast";
import { EmptyState } from "@/components/views/shared";
import { mutations, useDataStore, type EventInput, type EventRow } from "@/lib/data";
import { addDays, isoWeekNumber, startOfDay } from "@/lib/date";
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
  });
  const [reminders, setReminders] = React.useState<number[]>([]);
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState("");

  const windowDays = React.useMemo(() => {
    const today = startOfDay(new Date());
    return Array.from({ length: 7 }, (_, i) => addDays(today, i));
  }, []);

  const openCreate = () => {
    setForm({
      title: "",
      startDate: "",
      endDate: "",
      allDay: false,
      color: EVENT_COLORS[0],
      location: "",
      repeat: "none",
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

  const dayLabel = (day: Date, index: number) => {
    const base = new Intl.DateTimeFormat("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    }).format(day);
    return index === 0 ? `${base} (Today)` : base;
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-800 dark:text-slate-100">
            <CalendarDays className="size-6 text-sf-primary" strokeWidth={2} />
            Events &amp; Reminders
          </h1>
          <p className="mt-1 text-base text-slate-500 dark:text-slate-400">
            Manage your events with custom reminders
          </p>
        </div>
        <Button
          type="button"
          variant="gradient"
          className="sf-gradient-shadow"
          onClick={openCreate}
        >
          <Plus className="size-4" strokeWidth={2} />
          New Event
        </Button>
      </div>

      {events.length === 0 ? (
        <div className="sf-card">
          <EmptyState
            icon={CalendarDays}
            title="No events yet"
            hint="Create your first event to see your week come alive."
            cta={
              <Button type="button" variant="gradient" className="sf-gradient-shadow-lg" onClick={openCreate}>
                <Plus className="size-4" strokeWidth={2} />
                New Event
              </Button>
            }
          />
        </div>
      ) : (
        <section className="sf-print-exact rounded-2xl bg-slate-900 p-6 shadow-2xl">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-400">
              {new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" }).format(new Date())}
            </p>
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-cyan-400">
                CW {isoWeekNumber(new Date())}
              </span>
              <button
                type="button"
                onClick={openCreate}
                className="flex items-center gap-1 text-sm font-medium text-cyan-400 outline-none hover:text-cyan-300 focus-visible:ring-2 focus-visible:ring-cyan-400/40"
              >
                <Plus className="size-4" strokeWidth={2} />
                New Event
              </button>
            </div>
          </div>

          <div className="mt-4 flex flex-col gap-5">
            {windowDays.map((day, index) => {
              const dayEvents = events.flatMap((e) =>
                expandOccurrences(e, [day]).map(() => e),
              );
              return (
                <div key={day.toISOString()}>
                  <h3 className="text-sm font-semibold text-cyan-400">
                    {dayLabel(day, index)}
                  </h3>
                  {dayEvents.length === 0 ? (
                    <p className="mt-1 text-sm text-slate-600">No events.</p>
                  ) : (
                    <div className="mt-2 flex flex-col gap-2">
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
        </section>
      )}

      <Dialog open={dialog.open} onOpenChange={(open) => !open && setDialog({ open: false })}>
        <DialogContent className="max-w-md rounded-lg">
          <DialogHeader>
            <DialogTitle>{dialog.open && dialog.editing ? "Edit Event" : "New Event"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={submit} className="flex flex-col gap-4" noValidate>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="event-title">Title</Label>
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
                <Label htmlFor="event-start">Starts</Label>
                <Input
                  id="event-start"
                  type="datetime-local"
                  value={form.startDate}
                  onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))}
                  required
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="event-end">Ends (optional)</Label>
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
              <Label>Reminders (minutes before)</Label>
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
                className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-200"
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

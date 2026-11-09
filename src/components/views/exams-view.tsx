"use client";

// ---------------------------------------------------------------------------
// Exams (S6-F/S9-J/S76-AC): a 3-column card grid — h-2 subject color strip,
// the measured S76 anatomy: text-lg title + urgency pill ("Tomorrow" orange
// at +1, "N days" yellow at ≥2 — the S9-J/S6-F pins), the accent subject
// chip, the full weekday date ("Wednesday, Oct 28, 2026"), the time row
// with the slate-400 "· N min" suffix, the 📍 location row (when set), the
// "Topics to study:" chip block (when set), and a border-t type footer.
// ---------------------------------------------------------------------------

import * as React from "react";
import {
  CalendarIcon,
  Clock,
  GraduationCap,
  MapPin,
  Pencil,
  Plus,
  Search,
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
import { EmptyState, Spinner, SubjectTagChip } from "@/components/views/shared";
import { mutations, parseExamTopics, useDataStore, type ExamInput, type ExamRow } from "@/lib/data";
import { ApiError } from "@/lib/api";
import { EXAM_TYPES } from "@/lib/validation";
import { daysUntil, fromDatetimeLocalInput, toDatetimeLocalValue } from "@/lib/date";
import { cn } from "@/lib/utils";

// S161/DJ3 (the s161 audit B/F-3): the type vocabulary imports
// validation.ts's single source — the local value-equal twin was the exact
// S127/CB9 drift class (the assignments twin missed "worksheet" and
// blanked the Edit select on seeded rows; a future schema value would 400
// from this dialog while the server accepts it). Machine-guarded by the
// tests/enum-single-source.test.ts census.

function urgency(row: ExamRow): { text: string; className: string } {
  const diff = daysUntil(new Date(row.date), new Date());
  if (diff < 0) return { text: "Past", className: "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400" };
  if (diff === 0) return { text: "Today", className: "sf-pill-red" };
  if (diff === 1)
    return { text: "Tomorrow", className: "sf-pill-orange" };
  // S120/BU8 (re-measured): the ≥2 bucket reads "N days" on the BLUE
  // family — the live reference DRIFTED from the S76-measured yellow
  // (rgb(254,249,195)/rgb(161,98,7)) to blue-100/blue-600 (measured
  // 2026-11-01 on an 11-day exam). The clone follows the CURRENT
  // reference; the pill carries blue-700 text (5.49:1 — the reference's
  // own blue-600 measures 4.24:1, the one-step-darker AA precedent).
  // S92/AS1: the family rides the sf-pill-blue utility.
  return {
    text: `${diff} days`,
    className: "sf-pill-blue",
  };
}

export function ExamsView() {
  const exams = useDataStore((s) => s.exams);
  // S130/CE3: the loading gate (the tasks-view idiom — a stale empty list
  // is NOT an empty account; the background loadAll window must not
  // render the false "No exams found").
  const loading = useDataStore((s) => s.loading);
  const subjects = useDataStore((s) => s.subjects);
  const createExam = mutations.createExam;
  const updateExam = mutations.updateExam;
  const deleteExam = mutations.deleteExam;
  const { toast } = useToast();

  const [dialog, setDialog] = React.useState<{ open: boolean; editing: ExamRow | null }>({
    open: false,
    editing: null,
  });
  const [search, setSearch] = React.useState("");
  // The reference's status filter (measured 2026-10-18, session-63):
  // All Exams / Upcoming / Past, defaulting to Upcoming.
  const [statusFilter, setStatusFilter] = React.useState<"all" | "upcoming" | "past">("upcoming");
  // S123/BX9: duration is a STRING in form state — the number-typed state
  // coerced mid-keystroke (clearing snapped the field to 60 instantly,
  // interrupting typing). The parse happens on submit only.
  const [form, setForm] = React.useState({
    title: "",
    date: "",
    type: "test",
    duration: "60",
    subjectId: "",
    topics: [] as string[],
    location: "",
  });
  const [topicInput, setTopicInput] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState("");
  // S152/DA1 (the S151 audit's B-L5): the delete double-fire latch (the
  // events-view twin — the per-row in-flight set; the finally removal
  // keeps retry honest).
  const [deletingIds, setDeletingIds] = React.useState<ReadonlySet<string>>(new Set());

  // The subtitle's live counts read the FULL list (the reference reported
  // "0 upcoming · 0 this week" while its Upcoming filter was active).
  const counts = React.useMemo(() => {
    let upcoming = 0;
    let week = 0;
    for (const e of exams) {
      const diff = daysUntil(new Date(e.date), new Date());
      if (diff >= 0) {
        upcoming += 1;
        if (diff <= 6) week += 1;
      }
    }
    return { upcoming, week };
  }, [exams]);

  const sorted = React.useMemo(
    () =>
      [...exams]
        .filter((e) => {
          const diff = daysUntil(new Date(e.date), new Date());
          if (statusFilter === "upcoming") return diff >= 0;
          if (statusFilter === "past") return diff < 0;
          return true;
        })
        .filter((e) => {
          const q = search.trim().toLowerCase();
          return q ? e.title.toLowerCase().includes(q) : true;
        })
        .sort(
          (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
        ),
    [exams, search, statusFilter],
  );

  const subjectOf = (id: string | null) => subjects.find((s) => s.id === id) ?? null;

  const openCreate = () => {
    setForm({ title: "", date: "", type: "test", duration: "60", subjectId: "", topics: [], location: "" });
    setTopicInput("");
    setError("");
    setDialog({ open: true, editing: null });
  };

  const openEdit = (row: ExamRow) => {
    // S163/DL3: the promoted seam (data.ts's parseExamTopics) — the twin
    // lived byte-identical here and in the card render; the single source
    // keeps the dialog and the card from drifting.
    const topics = parseExamTopics(row.topics);
    setForm({
      title: row.title,
      // S123/BX3: the stored instant rendered in the USER's wall-clock —
      // never the raw UTC slice (the per-save drift class).
      date: toDatetimeLocalValue(row.date),
      type: row.type,
      duration: String(row.duration),
      subjectId: row.subjectId ?? "",
      topics,
      location: row.location ?? "",
    });
    setTopicInput("");
    setError("");
    setDialog({ open: true, editing: row });
  };

  const addTopic = () => {
    const value = topicInput.trim();
    if (!value) return;
    setForm((f) => ({ ...f, topics: [...f.topics, value] }));
    setTopicInput("");
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    // S152/DA2 (the S151 audit's B-L6): the hand-guard — the noValidate
    // form's empty required fields answer HERE with human copy (the
    // S127/CB17 files-view pattern), never the server's raw Zod issue
    // text. Before setBusy: an early return must not strand the busy
    // latch.
    if (!form.title.trim()) {
      setError("Please enter a title.");
      return;
    }
    if (!form.date) {
      setError("Please pick an exam date.");
      return;
    }
    setBusy(true);
    setError("");
    const payload: ExamInput = {
      title: form.title,
      date: fromDatetimeLocalInput(form.date),
      type: form.type as ExamInput["type"],
      // S130/CE9: the clamp mirrors the schema atom (5..600 — a 1..4 value
        // submitted a payload the server always 400'd).
        duration: Math.min(600, Math.max(5, Math.round(Number(form.duration) || 60))),
      subjectId: form.subjectId,
      topics: JSON.stringify(form.topics),
      location: form.location,
    };
    try {
      if (dialog.editing) {
        await updateExam(dialog.editing.id, payload);
        toast.success("Exam updated.");
      } else {
        await createExam(payload);
        toast.success("Exam added.");
      }
      setDialog({ open: false, editing: null });
    } catch (err: unknown) {
      setError(err instanceof ApiError ? err.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  };

  const remove = async (id: string) => {
    if (deletingIds.has(id)) return;
    setDeletingIds((prev) => new Set(prev).add(id));
    try {
      await deleteExam(id);
      toast.success("Exam deleted.");
    } catch (err: unknown) {
      toast.error(err instanceof ApiError ? err.message : "Delete failed.");
    } finally {
      setDeletingIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Exams</h1>
          <p className="mt-1 text-base text-slate-500 dark:text-slate-400">
            {/* the reference's live-count subtitle (measured on its empty
                account: "0 upcoming · 0 this week" — session-63 Batch T). */}
            {counts.upcoming} upcoming · {counts.week} this week
          </p>
        </div>
        {/* flex-wrap (S78/AE9): the search + filter + Add Exam row exceeds
            390px unwrapped (measured 584) — at ≥sm it fits one line, so the
            wrap never fires there. */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search
              aria-hidden
              className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400"
              strokeWidth={2}
            />
            <Input
              aria-label="Search exams"
              placeholder="Search exams..."
              className="h-9 w-48 pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select
            value={statusFilter}
            onValueChange={(v) => setStatusFilter(v as "all" | "upcoming" | "past")}
          >
            <SelectTrigger aria-label="Exam filter" className="h-9 w-[130px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Exams</SelectItem>
              <SelectItem value="upcoming">Upcoming</SelectItem>
              <SelectItem value="past">Past</SelectItem>
            </SelectContent>
          </Select>
          <Button type="button" variant="gradient" className="sf-gradient-shadow" onClick={openCreate}>
            <Plus className="size-4" strokeWidth={2} />
            Add Exam
          </Button>
        </div>
      </div>

      {loading && exams.length === 0 ? (
        <div
          className="sf-card flex justify-center py-16 text-sf-primary"
          role="status"
          aria-label="Loading exams"
          /* S163/DL2 (the s163 audit B/L-1): the CE3 loading gate announces
             itself (role="status" — the calculator-view/events-view
             precedent; the Spinner itself is aria-hidden, so the unlabeled
             div was silent to assistive tech during the in-flight window). */
        >
          <Spinner className="size-6" />
        </div>
      ) : sorted.length === 0 ? (
        <div className="sf-card">
          <EmptyState
            icon={GraduationCap}
            title="No exams found"
            hint="Add your exams to start tracking"
            cta={
              <Button type="button" variant="gradient" className="sf-gradient-shadow-lg" onClick={openCreate}>
                <Plus className="size-4" strokeWidth={2} />
                Add Exam
              </Button>
            }
          />
        </div>
      ) : (
        <div role="group" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-label="Exam cards">
          {sorted.map((exam) => {
            const subject = subjectOf(exam.subjectId);
            const urgencyBadge = urgency(exam);
            const date = new Date(exam.date);
            // S163/DL3: the promoted seam — the card render and openEdit
            // share the single parseExamTopics source.
            const topics = parseExamTopics(exam.topics);
            return (
              <div key={exam.id} className="group sf-card overflow-hidden">
                <div
                  role="img"
                  className="h-2"
                  aria-label="Subject color strip"
                  style={{ backgroundColor: subject?.color ?? "rgb(var(--sf-primary))" }}
                />
                <div className="p-6">
                  <div className="flex items-start justify-between gap-2">
                    {/* S76/AC9 (measured): text-lg 18px/600 — the ref's card title. */}
                    <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
                      {exam.title}
                    </h2>
                    <span
                      className={cn(
                        "shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold",
                        urgencyBadge.className,
                      )}
                    >
                      {urgencyBadge.text}
                    </span>
                  </div>
                  {/* S76/AC4 (measured): the accent subject chip between the
                   * title row and the detail rows (the ref's mb-3 wrapper). */}
                  {subject && (
                    <div className="mb-3 mt-3">
                      <SubjectTagChip name={subject.name} color={subject.color} />
                    </div>
                  )}
                  <div className="flex flex-col gap-1.5 text-sm text-slate-600 dark:text-slate-300">
                    <p className="flex items-center gap-2">
                      <CalendarIcon className="size-4 text-slate-400" strokeWidth={2} />
                      {/* S76/AC3 (measured): "Wednesday, Oct 28, 2026" —
                       * weekday LONG + month SHORT + day + year. */}
                      {date.toLocaleDateString("en-US", {
                        weekday: "long",
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                    <p className="flex items-center gap-2">
                      <Clock className="size-4 text-slate-400" strokeWidth={2} />
                      {date.toLocaleTimeString("en-US", {
                        hour: "numeric",
                        minute: "2-digit",
                      })}{" "}
                      {/* S76/AC3 (measured): the "· N min" suffix rides its own
                       * slate-400 span — the clone takes the TEXT one step
                       * darker (slate-500, the documented a11y-win family:
                       * the ref's slate-400 reads 2.56:1 on white). */}
                      <span className="text-slate-500 dark:text-slate-400">· {exam.duration} min</span>
                    </p>
                    {/* S76/AC5 (measured): the 📍 row renders only when the
                     * location is set. */}
                    {exam.location && (
                      <p className="flex items-center gap-2">
                        <MapPin className="size-4 text-slate-400" strokeWidth={2} />
                        {exam.location}
                      </p>
                    )}
                    {/* S76/AC6 (measured positive case): "Topics to study:"
                     * label + dark chips — NOT the count row. */}
                    {topics.length > 0 && (
                      <div className="mt-2">
                        <p className="mb-2 text-xs font-medium text-slate-500 dark:text-slate-400">
                          Topics to study:
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {topics.map((topic, i) => (
                            <span
                              // S140/CO4a (Audit A L-1): the value-index
                              // composite key — duplicate topics are
                              // schema-legal (user/import JSON, no dedupe on
                              // addTopic), and the bare-topic key collides.
                              // The dialog's own chips (the practicetests
                              // precedent) already key this way.
                              key={`${topic}-${i}`}
                              // S83/AJ5: the near-black topic chip carries
                              // near-white text — an essential background
                              // under the S12-C2 convention (it must print).
                              className="rounded-md border border-transparent bg-neutral-800 px-2.5 py-0.5 text-xs font-semibold text-neutral-50 dark:bg-neutral-700 dark:text-neutral-100 sf-print-exact"
                            >
                              {topic}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-between border-t border-slate-100 px-6 py-3 dark:border-slate-800">
                  <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium capitalize text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                    {exam.type}
                  </span>
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
                      <button
                        type="button"
                        aria-label={`Edit ${exam.title}`}
                        onClick={() => openEdit(exam)}
                        className="flex size-7 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
                      >
                        <Pencil className="size-3.5" strokeWidth={2} />
                      </button>
                      <button
                        type="button"
                        aria-label={`Delete ${exam.title}`}
                        onClick={() => remove(exam.id)}
                        disabled={deletingIds.has(exam.id)}
                        className="flex size-7 items-center justify-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-500 disabled:opacity-50 dark:hover:bg-red-950"
                      >
                        <Trash2 className="size-3.5" strokeWidth={2} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Dialog open={dialog.open} onOpenChange={(open) => !open && setDialog({ open: false, editing: null })}>
        <DialogContent className="max-w-md rounded-lg">
          <DialogHeader>
            <DialogTitle>{dialog.editing ? "Edit Exam" : "Add Exam"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={submit} className="flex flex-col gap-4" noValidate>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="exam-title">Title</Label>
              <Input
                id="exam-title"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                placeholder="Calculus II Midterm"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="exam-date">Date &amp; time</Label>
                <Input
                  id="exam-date"
                  type="datetime-local"
                  value={form.date}
                  onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                  required
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="exam-duration">Duration (min)</Label>
                <Input
                  id="exam-duration"
                  type="number"
                  min={5}
                  max={600}
                  value={form.duration}
                  onChange={(e) => setForm((f) => ({ ...f, duration: e.target.value }))}
                  required
                />
              </div>
              {/* S76/AC5 (measured): the ref dialog's Location input. */}
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="exam-location">Location</Label>
                <Input
                  id="exam-location"
                  value={form.location}
                  onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
                  placeholder="e.g., Room 101, Hall A"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="exam-type">Type</Label>
                <Select value={form.type} onValueChange={(v) => setForm((f) => ({ ...f, type: v }))}>
                  <SelectTrigger id="exam-type" className="h-9 capitalize">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {EXAM_TYPES.map((t) => (
                      <SelectItem key={t} value={t} className="capitalize">
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="exam-subject">Subject</Label>
                <Select
                  value={form.subjectId || "none"}
                  onValueChange={(v) => setForm((f) => ({ ...f, subjectId: v === "none" ? "" : v }))}
                >
                  <SelectTrigger id="exam-subject" className="h-9">
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
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="exam-topics">Topics</Label>
              {form.topics.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {form.topics.map((topic, i) => (
                    <button
                      key={`${topic}-${i}`}
                      type="button"
                      onClick={() =>
                        setForm((f) => ({
                          ...f,
                          topics: f.topics.filter((_, index) => index !== i),
                        }))
                      }
                      className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
                      aria-label={`Remove topic ${topic}`}
                    >
                      {topic} ×
                    </button>
                  ))}
                </div>
              )}
              <div className="flex gap-2">
                <Input
                  id="exam-topics"
                  value={topicInput}
                  onChange={(e) => setTopicInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addTopic();
                    }
                  }}
                  placeholder="Integration by parts"
                />
                <Button type="button" variant="outline" className="h-9" onClick={addTopic}>
                  Add
                </Button>
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
              {/* S120/BU9 (measured): the reference's Add Exam dialog
                  carries an explicit Cancel beside the submit. */}
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialog({ open: false, editing: null })}
              >
                Cancel
              </Button>
              <Button type="submit" variant="gradient" className="sf-gradient-shadow" disabled={busy}>
                {dialog.editing ? "Save changes" : "Add exam"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

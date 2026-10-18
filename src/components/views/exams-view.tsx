"use client";

// ---------------------------------------------------------------------------
// Exams (S6-F/S9-J): a 3-column card grid — h-2 subject color strip, amber
// urgency badge ("Tomorrow" reads orange-100/orange-600), icon detail rows,
// and a border-t type footer (date + time·duration ONLY).
// ---------------------------------------------------------------------------

import * as React from "react";
import {
  BookOpen,
  CalendarIcon,
  Clock,
  GraduationCap,
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
import { EmptyState, SubjectChip } from "@/components/views/shared";
import { mutations, useDataStore, type ExamInput, type ExamRow } from "@/lib/data";
import { daysUntil } from "@/lib/date";
import { apiSend, ApiError } from "@/lib/api";
import { cn } from "@/lib/utils";

const EXAM_TYPES = ["test", "quiz", "midterm", "final", "oral", "practical"];

function urgency(row: ExamRow): { text: string; className: string } {
  const diff = daysUntil(new Date(row.date), new Date());
  if (diff < 0) return { text: "Past", className: "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400" };
  if (diff === 0) return { text: "Today", className: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300" };
  if (diff === 1)
    return { text: "Tomorrow", className: "bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300" };
  return {
    text: `in ${diff} days`,
    className: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  };
}

export function ExamsView() {
  const exams = useDataStore((s) => s.exams);
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
  const [form, setForm] = React.useState({
    title: "",
    date: "",
    type: "test",
    duration: 60,
    subjectId: "",
    topics: [] as string[],
  });
  const [topicInput, setTopicInput] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState("");

  const sorted = React.useMemo(
    () =>
      [...exams]
        .filter((e) => {
          const q = search.trim().toLowerCase();
          return q ? e.title.toLowerCase().includes(q) : true;
        })
        .sort(
          (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
        ),
    [exams, search],
  );

  const subjectOf = (id: string | null) => subjects.find((s) => s.id === id) ?? null;

  const openCreate = () => {
    setForm({ title: "", date: "", type: "test", duration: 60, subjectId: "", topics: [] });
    setTopicInput("");
    setError("");
    setDialog({ open: true, editing: null });
  };

  const openEdit = (row: ExamRow) => {
    let topics: string[] = [];
    try {
      const parsed: unknown = JSON.parse(row.topics);
      topics = Array.isArray(parsed) ? parsed.filter((t): t is string => typeof t === "string") : [];
    } catch {
      topics = [];
    }
    setForm({
      title: row.title,
      date: row.date.slice(0, 16),
      type: row.type,
      duration: row.duration,
      subjectId: row.subjectId ?? "",
      topics,
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
    setBusy(true);
    setError("");
    const payload: ExamInput = {
      title: form.title,
      date: form.date,
      type: form.type as ExamInput["type"],
      duration: form.duration,
      subjectId: form.subjectId,
      topics: JSON.stringify(form.topics),
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
    try {
      await deleteExam(id);
      toast.success("Exam deleted.");
    } catch (err: unknown) {
      toast.error(err instanceof ApiError ? err.message : "Delete failed.");
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Exams</h1>
          <p className="mt-1 text-base text-slate-500 dark:text-slate-400">
            Your upcoming exams and assessments.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search
              aria-hidden
              className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400"
              strokeWidth={2}
            />
            <Input
              aria-label="Search exams"
              placeholder="Search exams…"
              className="h-9 w-48 pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button type="button" variant="gradient" className="sf-gradient-shadow" onClick={openCreate}>
            <Plus className="size-4" strokeWidth={2} />
            Add Exam
          </Button>
        </div>
      </div>

      {sorted.length === 0 ? (
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
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-label="Exam cards">
          {sorted.map((exam) => {
            const subject = subjectOf(exam.subjectId);
            const urgencyBadge = urgency(exam);
            const date = new Date(exam.date);
            let topics: string[] = [];
            try {
              const parsed: unknown = JSON.parse(exam.topics);
              topics = Array.isArray(parsed) ? parsed.filter((t): t is string => typeof t === "string") : [];
            } catch {
              topics = [];
            }
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
                    <h2 className="font-semibold text-slate-800 dark:text-slate-100">
                      {exam.title}
                    </h2>
                    <span
                      className={cn(
                        "shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium",
                        urgencyBadge.className,
                      )}
                    >
                      {urgencyBadge.text}
                    </span>
                  </div>
                  <div className="mt-3 flex flex-col gap-1.5 text-sm text-slate-600 dark:text-slate-300">
                    <p className="flex items-center gap-2">
                      <CalendarIcon className="size-4 text-slate-400" strokeWidth={2} />
                      {date.toLocaleDateString("en-US", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                    <p className="flex items-center gap-2">
                      <Clock className="size-4 text-slate-400" strokeWidth={2} />
                      {date.toLocaleTimeString("en-US", {
                        hour: "numeric",
                        minute: "2-digit",
                      })}{" "}
                      · {exam.duration} min
                    </p>
                    {topics.length > 0 && (
                      <p className="flex items-center gap-2">
                        <BookOpen className="size-4 text-slate-400" strokeWidth={2} />
                        {topics.length} {topics.length === 1 ? "topic" : "topics"}
                      </p>
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
                        className="flex size-7 items-center justify-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950"
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
                  onChange={(e) =>
                    setForm((f) => ({ ...f, duration: Number(e.target.value) || 60 }))
                  }
                  required
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
                className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-200"
              >
                {error}
              </div>
            )}
            <DialogFooter>
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

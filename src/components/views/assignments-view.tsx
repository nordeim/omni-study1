"use client";

// ---------------------------------------------------------------------------
// Assignments (S6-E/S9-I/S76-AC): rows with an interactive progress slider
// (onValueCommit PATCHes), the due pill INLINE with the title, and the
// measured meta row — subject chip + bell priority + type pill; the status
// filter defaults to "Active".
// Session-64 Batch U (reference-measured): the header is TWO rows —
// [h1 + subtitle | Add Assignment] then [search flex-1 | status SELECT
// (All/Active/Completed, that order) | subject SELECT ("All Subjects" +
// the user's subjects)].
// Session-76 Batch AC (computed-style measured 2026-10-21): the due pill
// rides the TITLE line (blue-50/blue-600 "N days"; amber for due-today);
// the meta row = accent subject chip (dot + name) + yellow bell priority
// + slate type; the dialog gains the Subject select (the ref's dialog
// carries one — without it the chip is un-settable).
// ---------------------------------------------------------------------------

import * as React from "react";
import {
  Bell,
  ClipboardList,
  MoreHorizontal,
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/components/ui/toast";
import { EmptyState, SubjectTagChip } from "@/components/views/shared";
import {
  mutations,
  useDataStore,
  type AssignmentInput,
  type AssignmentRow,
} from "@/lib/data";
import { daysUntil, startOfDay } from "@/lib/date";
import { apiSend, ApiError } from "@/lib/api";
import { cn } from "@/lib/utils";

const TYPES = ["homework", "essay", "project", "reading", "lab", "presentation", "other"];
const PRIORITIES = ["low", "medium", "high", "urgent"];

type StatusFilter = "all" | "active" | "completed";

export function AssignmentsView() {
  const assignments = useDataStore((s) => s.assignments);
  const subjects = useDataStore((s) => s.subjects);
  const createAssignment = mutations.createAssignment;
  const updateAssignment = mutations.updateAssignment;
  const deleteAssignment = mutations.deleteAssignment;
  const { toast } = useToast();

  const [status, setStatus] = React.useState<StatusFilter>("active");
  const [subjectId, setSubjectId] = React.useState<string>("all");
  const [search, setSearch] = React.useState("");
  const [dialog, setDialog] = React.useState<{ open: boolean; editing: AssignmentRow | null }>({
    open: false,
    editing: null,
  });
  const [form, setForm] = React.useState({
    title: "",
    type: "homework",
    priority: "medium",
    progress: 0,
    dueDate: "",
    subjectId: "",
  });
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState("");

  const filtered = React.useMemo(() => {
    const today = startOfDay(new Date());
    const q = search.trim().toLowerCase();
    return assignments
      .filter((a) => (q ? a.title.toLowerCase().includes(q) : true))
      .filter((a) => (subjectId === "all" ? true : a.subjectId === subjectId))
      .filter((a) => {
        if (status === "active") return a.progress < 100;
        if (status === "completed") return a.progress >= 100;
        return true;
      })
      .sort((a, b) => {
        const aDue = a.dueDate ? daysUntil(new Date(a.dueDate), today) : Number.MAX_SAFE_INTEGER;
        const bDue = b.dueDate ? daysUntil(new Date(b.dueDate), today) : Number.MAX_SAFE_INTEGER;
        return aDue - bDue;
      });
  }, [assignments, status, subjectId, search]);

  const openCreate = () => {
    setForm({ title: "", type: "homework", priority: "medium", progress: 0, dueDate: "", subjectId: "" });
    setError("");
    setDialog({ open: true, editing: null });
  };

  const openEdit = (row: AssignmentRow) => {
    setForm({
      title: row.title,
      type: row.type,
      priority: row.priority,
      progress: row.progress,
      dueDate: row.dueDate ? row.dueDate.slice(0, 10) : "",
      subjectId: row.subjectId ?? "",
    });
    setError("");
    setDialog({ open: true, editing: row });
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError("");
    const payload: AssignmentInput = {
      title: form.title,
      type: form.type as AssignmentInput["type"],
      priority: form.priority as AssignmentInput["priority"],
      progress: form.progress,
      dueDate: form.dueDate,
      subjectId: form.subjectId,
    };
    try {
      if (dialog.editing) {
        await updateAssignment(dialog.editing.id, payload);
        toast.success("Assignment updated.");
      } else {
        await createAssignment(payload);
        toast.success("Assignment added.");
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
      await deleteAssignment(id);
      toast.success("Assignment deleted.");
    } catch (err: unknown) {
      toast.error(err instanceof ApiError ? err.message : "Delete failed.");
    }
  };

  /* S76/AC1 (computed-style measured): the ref renders the due pill INLINE
   * with the title — "N days" on blue-50/blue-600 (500 weight, 12px) for
   * future rows. Honest-label deviations, documented in the remediation
   * plan: the ref's due-today slot reads "Tomorrow" (its own off-by-one)
   * and its +1 slot reads "1 days" — the clone ships the honest "Today"
   * (amber-50/amber-600, the ref's tint for the same data) and "Tomorrow"
   * (blue). Overdue stays the red "Overdue by Nd" superset (unmeasurable
   * on the ref — its picker disables past dates). */
  const dueLabel = (row: AssignmentRow): { text: string; className: string } => {
    if (!row.dueDate) return { text: "No due date", className: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300" };
    const diff = daysUntil(new Date(row.dueDate), new Date());
    if (diff < 0)
      return {
        text: `Overdue by ${Math.abs(diff)}d`,
        className: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300",
      };
    if (diff === 0)
      return {
        text: "Today",
        className: "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
      };
    if (diff === 1)
      return {
        text: "Tomorrow",
        className: "bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-300",
      };
    return {
      text: `${diff} days`,
      className: "bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-300",
    };
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Row 1 (measured Batch U): title + subtitle | Add Assignment. */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
            Assignments
          </h1>
          <p className="mt-1 text-base text-slate-500 dark:text-slate-400">
            {/* the reference's measured subtitle (session-63 Batch T — the
                invented "Track your coursework and progress." replaced). */}
            Track your homework and projects
          </p>
        </div>
        <Button type="button" variant="gradient" className="sf-gradient-shadow" onClick={openCreate}>
          <Plus className="size-4" strokeWidth={2} />
          Add Assignment
        </Button>
      </div>

      {/* Row 2 (measured Batch U): search flex-1 | status | subject. */}
      <div className="flex flex-col gap-4 md:flex-row">
        <div className="relative flex-1">
          <Search
            aria-hidden
            className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400"
            strokeWidth={2}
          />
          <Input
            aria-label="Search assignments"
            placeholder="Search assignments..."
            className="h-9 pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={status} onValueChange={(v) => setStatus(v as StatusFilter)}>
          <SelectTrigger
            aria-label={`Filter assignments by status: ${
              status === "active" ? "Active" : status === "completed" ? "Completed" : "All"
            }`}
            className="h-9 w-full md:w-40"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {/* Reference-measured option order: All, Active, Completed. */}
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>
        <Select value={subjectId} onValueChange={setSubjectId}>
          <SelectTrigger aria-label="Subject filter" className="h-9 w-full md:w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Subjects</SelectItem>
            {subjects.map((s) => (
              <SelectItem key={s.id} value={s.id}>
                {s.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <div className="sf-card">
          <EmptyState
            icon={ClipboardList}
            title="No assignments yet"
            hint="Add your first assignment to start tracking"
            cta={
              <Button type="button" variant="gradient" className="sf-gradient-shadow-lg" onClick={openCreate}>
                <Plus className="size-4" strokeWidth={2} />
                Add Assignment
              </Button>
            }
          />
        </div>
      ) : (
        <div className="flex flex-col gap-3" aria-label="Assignment rows">
          {filtered.map((a) => {
            const due = dueLabel(a);
            const subject = subjects.find((s) => s.id === a.subjectId) ?? null;
            return (
              <article
                key={a.id}
                className="group rounded-xl border border-slate-200 bg-white p-4 transition-shadow hover:shadow-md dark:border-slate-700 dark:bg-card"
              >
                <div className="flex items-center gap-3">
                  <div className="min-w-0 flex-1">
                    {/* S76/AC1 (measured): the due pill rides the TITLE line. */}
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="truncate font-semibold text-slate-700 dark:text-slate-200">
                        {a.title}
                      </h2>
                      <span
                        className={cn(
                          "shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium",
                          due.className,
                        )}
                      >
                        {due.text}
                      </span>
                    </div>
                    {/* S76/AC2 (measured): subject chip + bell priority + type. */}
                    <div className="mb-3 mt-1.5 flex flex-wrap items-center gap-2">
                      <SubjectTagChip name={subject?.name} color={subject?.color} />
                      <span
                        className={cn(
                          "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium capitalize",
                          // yellow-700 not the reference's yellow-500 — the
                          // ref's 1.9:1 fails AA at 12px; the documented
                          // a11y-win precedent (Lighthouse session 61 family).
                          "bg-yellow-50 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300",
                        )}
                      >
                        <Bell className="size-3" strokeWidth={2} aria-hidden />
                        {a.priority}
                      </span>
                      <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium capitalize text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                        {a.type}
                      </span>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        type="button"
                        aria-label={`Actions for ${a.title}`}
                        className="flex size-8 items-center justify-center rounded-lg text-slate-400 opacity-0 outline-none transition-opacity hover:bg-slate-100 hover:text-slate-600 focus-visible:opacity-100 group-hover:opacity-100 dark:hover:bg-slate-800"
                      >
                        <MoreHorizontal className="size-4" strokeWidth={2} />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => openEdit(a)}>
                        <Pencil className="size-4" strokeWidth={2} />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-red-600 focus:text-red-600"
                        onClick={() => remove(a.id)}
                      >
                        <Trash2 className="size-4" strokeWidth={2} />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <div className="mt-3 flex items-center gap-3">
                  <Slider
                    value={[a.progress]}
                    max={100}
                    step={1}
                    aria-label={`Progress for ${a.title}`}
                    onValueCommit={(value) =>
                      updateAssignment(a.id, { progress: value[0] ?? a.progress }).catch(
                        (err: unknown) =>
                          toast.error(
                            err instanceof ApiError ? err.message : "Progress update failed.",
                          ),
                      )
                    }
                  />
                  <span className="w-12 text-right text-sm font-medium text-sf-primary-strong dark:text-sf-primary-strong-dark">
                    {a.progress}%
                  </span>
                </div>
              </article>
            );
          })}
        </div>
      )}

      <Dialog open={dialog.open} onOpenChange={(open) => !open && setDialog({ open: false, editing: null })}>
        <DialogContent className="max-w-md rounded-lg">
          <DialogHeader>
            <DialogTitle>{dialog.editing ? "Edit Assignment" : "Add Assignment"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={submit} className="flex flex-col gap-4" noValidate>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="assignment-title">Title</Label>
              <Input
                id="assignment-title"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                placeholder="Problem set 7 — integrals"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="assignment-type">Type</Label>
                <Select value={form.type} onValueChange={(v) => setForm((f) => ({ ...f, type: v }))}>
                  <SelectTrigger id="assignment-type" className="h-9 capitalize">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TYPES.map((t) => (
                      <SelectItem key={t} value={t} className="capitalize">
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="assignment-priority">Priority</Label>
                <Select
                  value={form.priority}
                  onValueChange={(v) => setForm((f) => ({ ...f, priority: v }))}
                >
                  <SelectTrigger id="assignment-priority" className="h-9 capitalize">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PRIORITIES.map((p) => (
                      <SelectItem key={p} value={p} className="capitalize">
                        {p}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="assignment-due">Due date</Label>
                <Input
                  id="assignment-due"
                  type="date"
                  value={form.dueDate}
                  onChange={(e) => setForm((f) => ({ ...f, dueDate: e.target.value }))}
                />
              </div>
              {/* S76/AC2: the ref's dialog carries a Subject select — without
               * it the row's new subject chip is un-settable. */}
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="assignment-subject">Subject</Label>
                <Select
                  value={form.subjectId || "none"}
                  onValueChange={(v) => setForm((f) => ({ ...f, subjectId: v === "none" ? "" : v }))}
                >
                  <SelectTrigger id="assignment-subject" className="h-9">
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
                <Label htmlFor="assignment-progress">Progress (%)</Label>
                <Input
                  id="assignment-progress"
                  type="number"
                  min={0}
                  max={100}
                  value={form.progress}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      progress: Math.max(0, Math.min(100, Number(e.target.value) || 0)),
                    }))
                  }
                />
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
                {dialog.editing ? "Save changes" : "Add assignment"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

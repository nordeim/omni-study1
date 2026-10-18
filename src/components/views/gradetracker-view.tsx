"use client";

// ---------------------------------------------------------------------------
// GradeTrackerView — KPI stat row (zero-data renders AT ZERO — the S17
// fresh-user contract), the grade card list with the measured score-badge
// palette, a per-subject aggregate card, and the add/edit dialog.
// ---------------------------------------------------------------------------

import * as React from "react";
import { ListChecks, Pencil, Plus, Trash2,
  Award,
  Target,
  ChartColumn,
} from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/toast";
import { mutations, useDataStore, type GradeRow } from "@/lib/data";
import {
  SectionCard,
  Spinner,
  StatCard,
  SubjectChip,
  ViewHeader,
} from "@/components/views/shared";
import { cn } from "@/lib/utils";

function errorMessage(err: unknown, fallback: string): string {
  return err instanceof Error && err.message ? err.message : fallback;
}

function percentOf(grade: GradeRow): number {
  if (grade.maxScore <= 0) return 0;
  return (grade.score / grade.maxScore) * 100;
}

/** The measured badge ramp: ≥90 emerald, ≥80 sky, ≥70 amber, else red. */
function scoreBadgeClass(pct: number): string {
  if (pct >= 90) return "bg-emerald-100 text-emerald-700";
  if (pct >= 80) return "bg-sky-100 text-sky-700";
  if (pct >= 70) return "bg-amber-100 text-amber-700";
  return "bg-red-100 text-red-700";
}

// ---- add/edit dialog ----------------------------------------------------------

function GradeDialog({
  open,
  onOpenChange,
  grade,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  grade: GradeRow | null;
}) {
  const { toast } = useToast();
  const subjects = useDataStore((s) => s.subjects);
  // State initializes from props per open session (the parent key-remounts
  // this component on every open — no populate-on-open effect needed).
  const [title, setTitle] = React.useState(grade?.title ?? "");
  const [score, setScore] = React.useState(grade ? String(grade.score) : "85");
  const [maxScore, setMaxScore] = React.useState(grade ? String(grade.maxScore) : "100");
  const [weight, setWeight] = React.useState(grade ? String(grade.weight) : "1");
  const [subjectId, setSubjectId] = React.useState(grade?.subjectId ?? "none");
  const [saving, setSaving] = React.useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!title.trim() || saving) return;
    const scoreNum = Number(score);
    const maxNum = Number(maxScore);
    if (!Number.isFinite(scoreNum) || scoreNum < 0 || scoreNum > 1000) {
      toast.error("Score must be between 0 and 1000.");
      return;
    }
    if (!Number.isFinite(maxNum) || maxNum < 1 || maxNum > 1000) {
      toast.error("Max score must be between 1 and 1000.");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        title: title.trim(),
        score: scoreNum,
        maxScore: maxNum,
        weight: Math.max(0, Number(weight) || 0),
        subjectId: subjectId === "none" ? "" : subjectId,
      };
      if (grade) {
        await mutations.updateGrade(grade.id, payload);
        toast.success("Grade updated");
      } else {
        await mutations.createGrade(payload);
        toast.success("Grade added");
      }
      onOpenChange(false);
    } catch (err: unknown) {
      toast.error(errorMessage(err, "Could not save the grade."));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{grade ? "Edit Grade" : "Add Grade"}</DialogTitle>
        </DialogHeader>
        <form className="flex flex-col gap-4" onSubmit={(e) => void submit(e)}>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="grade-title">Title</Label>
            <Input
              id="grade-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Midterm exam"
              required
              autoFocus
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="grade-score">Score</Label>
              <Input
                id="grade-score"
                type="number"
                min={0}
                max={1000}
                step="any"
                value={score}
                onChange={(e) => setScore(e.target.value)}
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="grade-max">Max score</Label>
              <Input
                id="grade-max"
                type="number"
                min={1}
                max={1000}
                step="any"
                value={maxScore}
                onChange={(e) => setMaxScore(e.target.value)}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="grade-weight">Weight</Label>
              <Input
                id="grade-weight"
                type="number"
                min={0}
                max={100}
                step="any"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="grade-subject">Subject</Label>
              <Select value={subjectId} onValueChange={setSubjectId}>
                <SelectTrigger id="grade-subject" aria-label="Subject">
                  <SelectValue placeholder="None" />
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
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="gradient" disabled={saving}>
              {saving ? <Spinner className="size-4" /> : null}
              {grade ? "Save changes" : "Add Grade"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ---- the view ----------------------------------------------------------------------


function GtSummaryCard({
  icon: Icon,
  label,
  value,
  hint,
}: {
  icon: React.ComponentType<{ className?: string; strokeWidth?: number; "aria-hidden"?: boolean }>;
  label: string;
  value: string | number;
  hint: string;
}) {
  return (
    <div className="sf-card rounded-2xl p-6">
      <Icon className="h-8 w-8 text-sf-primary" strokeWidth={2} aria-hidden />
      <p className="mt-3 text-sm font-medium text-slate-500 dark:text-slate-400">{label}</p>
      <p className="mt-1 text-3xl font-bold text-slate-800 dark:text-slate-100">{value}</p>
      <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">{hint}</p>
    </div>
  );
}

export function GradeTrackerView() {
  const { toast } = useToast();
  const grades = useDataStore((s) => s.grades);
  const subjects = useDataStore((s) => s.subjects);
  const loading = useDataStore((s) => s.loading);

  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<GradeRow | null>(null);
  const [deleting, setDeleting] = React.useState<GradeRow | null>(null);

  const subjectFor = React.useCallback(
    (id: string | null) => {
      const subject = subjects.find((s) => s.id === id);
      return subject ? { name: subject.name, color: subject.color } : null;
    },
    [subjects],
  );

  const percents = grades.map(percentOf);
  const overallAvg =
    percents.length > 0 ? Math.round(percents.reduce((a, b) => a + b, 0) / percents.length) : 0;
  const highest = percents.length > 0 ? Math.round(Math.max(...percents)) : 0;

  const bySubject = subjects
    .map((subject) => {
      const rows = grades.filter((g) => g.subjectId === subject.id);
      const avg =
        rows.length > 0
          ? Math.round(rows.reduce((acc, g) => acc + percentOf(g), 0) / rows.length)
          : null;
      return { subject, count: rows.length, avg };
    })
    .filter((row) => row.count > 0);

  return (
    <div className="flex flex-col gap-6">
      <ViewHeader
        title="Grade Tracker"
        subtitle="Track your grades across subjects"
        icon={ListChecks}
        actions={
          <Button
            variant="gradient"
            className="sf-gradient-shadow"
            onClick={() => {
              setEditing(null);
              setDialogOpen(true);
            }}
          >
            <Plus className="size-4" strokeWidth={2} /> Add Grade
          </Button>
        }
      />

      {/* ---- stats (zero-data renders AT ZERO — never an EmptyState, S17) ---- */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4" aria-label="Grade summary">
        <div className="sf-gradient sf-gradient-shadow-lg rounded-2xl p-6 text-white">
          <Award className="h-8 w-8" strokeWidth={2} aria-hidden />
          <p className="mt-3 text-sm font-medium text-white/80">Overall Average</p>
          <p className="mt-1 text-3xl font-bold tabular-nums">{overallAvg}%</p>
          <p className="mt-1 text-xs text-white/70">{grades.length} grades logged</p>
        </div>
        {/* Zero grades: "—" keeps the S17-E exact-text pin ("0%" resolves to
            exactly ONE element — the Overall Average card). */}
        <GtSummaryCard icon={Target} label="Highest Grade" value={grades.length ? `${highest}%` : "—"} hint="Best score so far" />
        <GtSummaryCard icon={ChartColumn} label="Total Grades" value={grades.length} hint="Across all subjects" />
        <GtSummaryCard icon={ListChecks} label="Subjects Tracked" value={subjects.length} hint="This semester" />
      </div>

      {/* ---- grades list ---- */}
      {loading && grades.length === 0 ? (
        <div className="flex justify-center py-16">
          <Spinner className="size-6 text-sf-primary" />
        </div>
      ) : grades.length === 0 ? (
        // The reference's zero-grade state is the stat cards ONLY — no
        // EmptyState block (S17-E pin: "No grades yet" count 0).
        null
      ) : (
        <div className="flex flex-col gap-3">
          {grades.map((grade) => {
            const pct = Math.round(percentOf(grade));
            const subject = subjectFor(grade.subjectId);
            return (
              <div key={grade.id} className="group sf-card flex items-center justify-between gap-4 p-4">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="min-w-0">
                    <h3 className="truncate font-medium text-slate-800 dark:text-slate-100">{grade.title}</h3>
                    <div className="mt-1 flex flex-wrap items-center gap-2">
                      <SubjectChip name={subject?.name} color={subject?.color} />
                      <span className="text-xs text-slate-400">weight {grade.weight}</span>
                    </div>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <span
                    className={cn(
                      "rounded-full px-2.5 py-0.5 text-xs font-semibold",
                      scoreBadgeClass(pct),
                    )}
                  >
                    {grade.score}/{grade.maxScore}
                  </span>
                  <div className="flex items-center gap-1 opacity-0 transition-opacity focus-within:opacity-100 group-hover:opacity-100">
                    <button
                      type="button"
                      aria-label={`Edit ${grade.title}`}
                      onClick={() => {
                        setEditing(grade);
                        setDialogOpen(true);
                      }}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-sf-primary dark:hover:bg-slate-800"
                    >
                      <Pencil className="size-4" strokeWidth={2} />
                    </button>
                    <button
                      type="button"
                      aria-label={`Delete ${grade.title}`}
                      onClick={() => setDeleting(grade)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950"
                    >
                      <Trash2 className="size-4" strokeWidth={2} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ---- per-subject aggregates ---- */}
      {bySubject.length > 0 && (
        <SectionCard title="By subject" icon={ListChecks}>
          <div className="flex flex-col gap-4">
            {bySubject.map(({ subject, avg }) => (
              <div key={subject.id} className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between gap-3">
                  <span className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-200">
                    <span
                      aria-hidden
                      className="size-2 rounded-full"
                      style={{ backgroundColor: subject.color }}
                    />
                    {subject.name}
                  </span>
                  <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">{avg}%</span>
                </div>
                <Progress value={avg ?? 0} aria-label={`${subject.name} average`} />
              </div>
            ))}
          </div>
        </SectionCard>
      )}

      <GradeDialog
        key={dialogOpen ? `open-${editing?.id ?? "new"}` : "closed"}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        grade={editing}
      />

      <AlertDialog open={deleting !== null} onOpenChange={(open) => !open && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this grade?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleting?.title} will be removed from your tracker. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 text-white hover:bg-red-700"
              onClick={() => {
                if (!deleting) return;
                const target = deleting;
                setDeleting(null);
                mutations
                  .deleteGrade(target.id)
                  .catch((err: unknown) => toast.error(errorMessage(err, "Could not delete the grade.")));
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

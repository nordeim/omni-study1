"use client";

// ---------------------------------------------------------------------------
// GradeTrackerView — KPI stat row (zero-data renders AT ZERO — the S17
// fresh-user contract), the measured per-subject cards (Batch AB, s72:
// chip + avg + "Progress to A (90%)" row + Recent Grades pills, 2-col grid —
// the ref renders NO "By subject" wrapper and NO grade detail rows), and the
// add/edit dialog. The grade rows below the cards are the documented
// superset extension (they carry the edit/delete entry points).
// ---------------------------------------------------------------------------

import * as React from "react";
import { Pencil, Plus, Trash2, TrendingUp,
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

/** The measured badge ramp: ≥90 emerald, ≥80 sky, ≥70 amber, else red.
 *  S80/AG4: the dark halves follow the house dark-pill family
 *  (the sf-pill-* utilities — S92/AS1, the dashboard Today-pill /
 *  assignments / exams precedent) — the light pills were un-themed
 *  flashbulbs on the dark canvas (the ref account has no grades, so its
 *  dark rendering is unmeasurable; the clone's superset dark theme owns
 *  the values). */
function scoreBadgeClass(pct: number): string {
  if (pct >= 90) return "sf-pill-emerald";
  if (pct >= 80) return "sf-pill-sky";
  if (pct >= 70) return "sf-pill-amber";
  return "sf-pill-red";
}

/** The per-subject card's avg text ramp (Batch AB: the ref renders the avg
 *  as large colored text — red on the probe subject's 50; the same
 *  thresholds as the badge ramp, as text tones). */
function avgTextClass(pct: number): string {
  if (pct >= 90) return "text-emerald-600 dark:text-emerald-400";
  if (pct >= 80) return "text-sky-600 dark:text-sky-400";
  if (pct >= 70) return "text-amber-600 dark:text-amber-400";
  return "text-red-600 dark:text-red-400";
}

/** The measured progress logic: progress toward an A is avg/90 (50 → 56%). */
function progressToA(avg: number): number {
  return Math.min(100, Math.round((avg / 90) * 100));
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
  iconClass = "text-sf-primary",
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string; strokeWidth?: number; "aria-hidden"?: boolean }>;
  iconClass?: string;
  label: string;
  value: string | number;
}) {
  return (
    <div className="sf-card rounded-2xl p-6">
      <Icon className={cn("mb-3 h-8 w-8", iconClass)} strokeWidth={2} aria-hidden />
      <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
      <p className="mt-2 text-4xl font-bold text-slate-800 dark:text-slate-100">{value}</p>
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

  const bySubject = subjects
    .map((subject) => {
      const rows = grades.filter((g) => g.subjectId === subject.id);
      const avg =
        rows.length > 0
          ? Math.round(rows.reduce((acc, g) => acc + percentOf(g), 0) / rows.length)
          : null;
      return { subject, count: rows.length, avg, rows };
    })
    .filter((row) => row.count > 0);

  return (
    <div className="flex flex-col gap-6">
      <ViewHeader
        title="Grade Tracker"
        subtitle="Monitor your academic performance"
        // S3-M (measured s69): the reference's header icon is trending-up
        // (the Batch-Y nav fix never reached this call site).
        icon={TrendingUp}
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

      {/* ---- stats (zero-data renders AT ZERO — never an EmptyState, S17) ----
          Session-65 re-measure: the reference's row is THREE cards
          (grid md:grid-cols-3 gap-4) — no Highest Grade card and no
          sub-captions; the white-card icons are emerald-500/blue-500. */}
      <div role="group" className="grid gap-4 md:grid-cols-3" aria-label="Grade summary">
        <div className="sf-gradient sf-gradient-shadow-lg rounded-2xl p-6 text-white">
          <Award className="mb-3 h-8 w-8 opacity-80" strokeWidth={2} aria-hidden />
          <p className="text-sm opacity-90">Overall Average</p>
          <p className="mt-2 text-4xl font-bold">{overallAvg}%</p>
        </div>
        {/* Zero grades: "—" keeps the S17-E exact-text pin ("0%" resolves to
            exactly ONE element — the Overall Average card). Session-65: the
            reference's zero state shows the same three cards at 0/0/0 — the
            hints and the Highest Grade card were clone inventions. */}
        <GtSummaryCard icon={Target} iconClass="text-emerald-500" label="Total Grades" value={grades.length} />
        <GtSummaryCard icon={ChartColumn} iconClass="text-blue-500" label="Subjects Tracked" value={subjects.length} />
      </div>

      {/* ---- per-subject cards (Batch AB, measured on the populated ref:
          bare cards in a 2-col grid — chip + avg, the Progress-to-A row,
          and the Recent Grades pills; NO "By subject" wrapper heading) ---- */}
      {bySubject.length > 0 && (
        <div role="group" className="grid gap-4 sm:grid-cols-2" aria-label="Subject breakdown">
          {bySubject.map(({ subject, avg, rows }) => (
            <div
              key={subject.id}
              data-testid="gt-subject-card"
              className="sf-card flex flex-col gap-4 rounded-2xl p-6"
            >
              <div className="flex items-center justify-between gap-3">
                <SubjectChip name={subject.name} color={subject.color} />
                <span
                  data-testid="gt-subject-avg"
                  className={cn("text-2xl font-bold", avgTextClass(avg ?? 0))}
                >
                  {avg}%
                </span>
              </div>
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className="text-slate-600 dark:text-slate-300">Progress to A (90%)</span>
                  <span className="text-slate-500 dark:text-slate-400">{progressToA(avg ?? 0)}%</span>
                </div>
                <Progress value={progressToA(avg ?? 0)} aria-label={`${subject.name} progress to A`} />
              </div>
              <div className="flex flex-col gap-2 border-t border-slate-100 pt-3 dark:border-slate-800">
                <p className="text-sm text-slate-600 dark:text-slate-300">Recent Grades</p>
                <div className="flex flex-wrap gap-2">
                  {[...rows]
                    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                    .slice(0, 5)
                    .map((g) => (
                      <span
                        key={g.id}
                        className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                      >
                        {Math.round(percentOf(g))}%
                      </span>
                    ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ---- grades list (the documented superset extension: the ref
          renders NO per-grade rows — these carry edit/delete) ---- */}
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
                    <h2 className="truncate font-medium text-slate-800 dark:text-slate-100">{grade.title}</h2>
                    <div className="mt-1 flex flex-wrap items-center gap-2">
                      <SubjectChip name={subject?.name} color={subject?.color} />
                      <span className="text-xs text-slate-500">weight {grade.weight}</span>
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

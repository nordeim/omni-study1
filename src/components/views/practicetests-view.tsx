"use client";

// ---------------------------------------------------------------------------
// PracticeTestsView — the practice-test library with an in-view runner:
// question-by-question panel (progress + countdown timer), a results screen
// with per-question review, and the create/edit dialog with a question
// builder. Questions persist as the practiceTestSchema's JSON string.
// ---------------------------------------------------------------------------

import * as React from "react";
import {
  Clock,
  FileText,
  Pencil,
  Play,
  Plus,
  Trash2,
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
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/toast";
import {
  mutations,
  useDataStore,
  type PracticeTestRow,
} from "@/lib/data";
import {
  EmptyState,
  Spinner,
  SubjectChip,
  ViewHeader,
} from "@/components/views/shared";
import { cn } from "@/lib/utils";

// ---- question model -----------------------------------------------------------

type QuestionType = "multiple_choice" | "true_false" | "short_answer";

type TestQuestion = {
  question: string;
  type: QuestionType;
  options?: string[];
  correctAnswer: string;
};

type DraftQuestion = {
  question: string;
  type: QuestionType;
  options: string; // comma list for multiple_choice
  correctAnswer: string;
};

const QUESTION_TYPES: QuestionType[] = ["multiple_choice", "true_false", "short_answer"];

const QUESTION_TYPE_LABELS: Record<QuestionType, string> = {
  multiple_choice: "Multiple choice",
  true_false: "True / False",
  short_answer: "Short answer",
};

function parseQuestions(json: string): TestQuestion[] {
  try {
    const parsed: unknown = JSON.parse(json);
    if (!Array.isArray(parsed)) return [];
    return parsed.flatMap((item) => {
      if (typeof item !== "object" || item === null) return [];
      const rec = item as Record<string, unknown>;
      const question = typeof rec.question === "string" ? rec.question : "";
      const type = rec.type as QuestionType;
      if (!question || !QUESTION_TYPES.includes(type)) return [];
      const options = Array.isArray(rec.options)
        ? rec.options.filter((o): o is string => typeof o === "string")
        : undefined;
      const correctAnswer = typeof rec.correctAnswer === "string" ? rec.correctAnswer : "";
      return [{ question, type, options, correctAnswer }];
    });
  } catch {
    return [];
  }
}

function errorMessage(err: unknown, fallback: string): string {
  return err instanceof Error && err.message ? err.message : fallback;
}

function formatClock(totalSeconds: number): string {
  const m = Math.floor(Math.max(0, totalSeconds) / 60);
  const s = Math.max(0, totalSeconds) % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

function normalizeAnswer(answer: string): string {
  return answer.trim().toLowerCase();
}

function isCorrect(question: TestQuestion, answer: string): boolean {
  if (question.type === "short_answer") {
    return normalizeAnswer(answer) !== "" && normalizeAnswer(answer) === normalizeAnswer(question.correctAnswer);
  }
  return normalizeAnswer(answer) === normalizeAnswer(question.correctAnswer);
}

// ---- create/edit dialog ----------------------------------------------------------

function TestDialog({
  open,
  onOpenChange,
  test,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  test: PracticeTestRow | null;
}) {
  const { toast } = useToast();
  const subjects = useDataStore((s) => s.subjects);
  // State initializes from props per open session (parent key-remount).
  const [title, setTitle] = React.useState(test?.title ?? "");
  const [duration, setDuration] = React.useState(test ? String(test.durationMinutes) : "30");
  const [subjectId, setSubjectId] = React.useState(test?.subjectId ?? "none");
  const [drafts, setDrafts] = React.useState<DraftQuestion[]>(
    test
      ? parseQuestions(test.questions).map((q) => ({
          question: q.question,
          type: q.type,
          options: (q.options ?? []).join(", "),
          correctAnswer: q.correctAnswer,
        }))
      : [],
  );
  const [saving, setSaving] = React.useState(false);

  const updateDraft = (index: number, patch: Partial<DraftQuestion>) => {
    setDrafts((list) => list.map((d, i) => (i === index ? { ...d, ...patch } : d)));
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!title.trim() || saving) return;
    if (drafts.length === 0) {
      toast.error("Add at least one question.");
      return;
    }
    const questions: TestQuestion[] = [];
    for (const [i, draft] of drafts.entries()) {
      if (!draft.question.trim()) {
        toast.error(`Question ${i + 1} needs text.`);
        return;
      }
      if (draft.type === "multiple_choice") {
        const options = draft.options
          .split(",")
          .map((o) => o.trim())
          .filter((o) => o !== "");
        if (options.length < 2) {
          toast.error(`Question ${i + 1} needs at least two options (comma-separated).`);
          return;
        }
        if (!options.includes(draft.correctAnswer.trim())) {
          toast.error(`Question ${i + 1}'s correct answer must match one of its options.`);
          return;
        }
        questions.push({
          question: draft.question.trim(),
          type: draft.type,
          options,
          correctAnswer: draft.correctAnswer.trim(),
        });
        continue;
      }
      if (!draft.correctAnswer.trim()) {
        toast.error(`Question ${i + 1} needs a correct answer.`);
        return;
      }
      questions.push({
        question: draft.question.trim(),
        type: draft.type,
        correctAnswer: draft.correctAnswer.trim(),
      });
    }

    setSaving(true);
    try {
      const payload = {
        title: title.trim(),
        durationMinutes: Math.max(1, Math.round(Number(duration) || 1)),
        questions: JSON.stringify(questions),
        subjectId: subjectId === "none" ? "" : subjectId,
      };
      if (test) {
        await mutations.updatePracticeTest(test.id, payload);
        toast.success("Practice test updated");
      } else {
        await mutations.createPracticeTest(payload);
        toast.success("Practice test created");
      }
      onOpenChange(false);
    } catch (err: unknown) {
      toast.error(errorMessage(err, "Could not save the practice test."));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{test ? "Edit Practice Test" : "Create Test"}</DialogTitle>
        </DialogHeader>
        <form className="flex flex-col gap-4" onSubmit={(e) => void submit(e)}>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="test-title">Title</Label>
            <Input
              id="test-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Algebra Chapter 4 Quiz"
              required
              autoFocus
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="test-duration">Duration (minutes)</Label>
              <Input
                id="test-duration"
                type="number"
                min={1}
                max={600}
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="test-subject">Subject</Label>
              <Select value={subjectId} onValueChange={setSubjectId}>
                <SelectTrigger id="test-subject" aria-label="Subject">
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

          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <Label>Questions</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  setDrafts((list) => [
                    ...list,
                    { question: "", type: "multiple_choice", options: "", correctAnswer: "" },
                  ])
                }
              >
                <Plus className="size-4" strokeWidth={2} /> Add question
              </Button>
            </div>
            {drafts.map((draft, index) => (
              <div key={index} className="flex flex-col gap-2 rounded-xl border border-slate-200 p-3 dark:border-slate-700">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-400">Q{index + 1}</span>
                  <Select
                    value={draft.type}
                    onValueChange={(value) => updateDraft(index, { type: value as QuestionType })}
                  >
                    <SelectTrigger className="h-8 flex-1" aria-label={`Question ${index + 1} type`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {QUESTION_TYPES.map((t) => (
                        <SelectItem key={t} value={t}>
                          {QUESTION_TYPE_LABELS[t]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <button
                    type="button"
                    aria-label={`Remove question ${index + 1}`}
                    onClick={() => setDrafts((list) => list.filter((_, i) => i !== index))}
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950"
                  >
                    <Trash2 className="size-4" strokeWidth={2} />
                  </button>
                </div>
                <Textarea
                  value={draft.question}
                  onChange={(e) => updateDraft(index, { question: e.target.value })}
                  placeholder="Question text"
                  aria-label={`Question ${index + 1} text`}
                  className="min-h-[60px]"
                />
                {draft.type === "multiple_choice" && (
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor={`q-${index}-options`} className="text-xs text-slate-500">
                      Options (comma-separated)
                    </Label>
                    <Input
                      id={`q-${index}-options`}
                      value={draft.options}
                      onChange={(e) => updateDraft(index, { options: e.target.value })}
                      placeholder="4, 6, 8, 10"
                    />
                  </div>
                )}
                {draft.type === "true_false" ? (
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor={`q-${index}-correct`} className="text-xs text-slate-500">
                      Correct answer
                    </Label>
                    <Select
                      value={draft.correctAnswer || "True"}
                      onValueChange={(value) => updateDraft(index, { correctAnswer: value })}
                    >
                      <SelectTrigger id={`q-${index}-correct`} aria-label={`Question ${index + 1} correct answer`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="True">True</SelectItem>
                        <SelectItem value="False">False</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                ) : (
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor={`q-${index}-correct`} className="text-xs text-slate-500">
                      Correct answer
                    </Label>
                    <Input
                      id={`q-${index}-correct`}
                      value={draft.correctAnswer}
                      onChange={(e) => updateDraft(index, { correctAnswer: e.target.value })}
                      placeholder={draft.type === "short_answer" ? "Model answer" : "Option text"}
                    />
                  </div>
                )}
              </div>
            ))}
            {drafts.length === 0 && (
              <p className="text-sm text-slate-500">No questions yet — add the first one.</p>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="gradient" disabled={saving}>
              {saving ? <Spinner className="size-4" /> : null}
              {test ? "Save changes" : "Create Test"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ---- the runner ------------------------------------------------------------------

function QuestionRunner({
  test,
  onExit,
}: {
  test: PracticeTestRow;
  onExit: () => void;
}) {
  const questions = React.useMemo(() => parseQuestions(test.questions), [test.questions]);
  const [index, setIndex] = React.useState(0);
  const [answers, setAnswers] = React.useState<Record<number, string>>({});
  const [secondsLeft, setSecondsLeft] = React.useState(test.durationMinutes * 60);
  const [finished, setFinished] = React.useState(false);

  const finish = React.useCallback(() => setFinished(true), []);

  // Countdown — one interval, cleaned up on unmount; auto-submits at zero.
  React.useEffect(() => {
    if (finished) return;
    const id = window.setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          window.clearInterval(id);
          finish();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [finished, finish]);

  const total = questions.length;
  const correctCount = React.useMemo(
    () => questions.reduce((acc, q, i) => acc + (isCorrect(q, answers[i] ?? "") ? 1 : 0), 0),
    [questions, answers],
  );
  const score = total > 0 ? Math.round((correctCount / total) * 100) : 0;

  if (finished) {
    return (
      <div className="flex flex-col gap-6">
        <div className="sf-card p-6 text-center">
          <p className="text-sm font-medium text-slate-500">Your score</p>
          <p className="text-6xl font-bold text-slate-800 dark:text-slate-100">{score}%</p>
          <p className="mt-1 text-sm text-slate-500">
            {correctCount} of {total} correct · {test.title}
          </p>
        </div>
        <div className="flex flex-col gap-3">
          {questions.map((q, i) => {
            const given = answers[i] ?? "";
            const ok = isCorrect(q, given);
            return (
              <div
                key={i}
                className={cn(
                  "sf-card p-4",
                  ok ? "border-emerald-200 dark:border-emerald-800" : "border-red-200 dark:border-red-800",
                )}
              >
                <div className="flex items-start gap-2">
                  <span
                    aria-hidden
                    className={cn(
                      "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white",
                      ok ? "bg-emerald-500" : "bg-red-500",
                    )}
                  >
                    {ok ? "✓" : "✕"}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-slate-800 dark:text-slate-100">{q.question}</p>
                    <p className="mt-1 text-sm text-slate-500">
                      Your answer: <span className={ok ? "text-emerald-600" : "text-red-600"}>{given || "—"}</span>
                      {!ok && q.correctAnswer !== "" && (
                        <>
                          {" · "}Correct: <span className="text-emerald-600">{q.correctAnswer}</span>
                        </>
                      )}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <div className="flex justify-center">
          <Button variant="gradient" className="sf-gradient-shadow" onClick={onExit}>
            Back to tests
          </Button>
        </div>
      </div>
    );
  }

  const question = questions[index];

  return (
    <div className="flex flex-col gap-6">
      <div className="sf-card p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">{test.title}</h2>
            <p className="text-sm text-slate-500">
              Question {index + 1} of {total}
            </p>
          </div>
          <span
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-semibold tabular-nums",
              secondsLeft <= 60
                ? "bg-red-100 text-red-600"
                : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
            )}
          >
            <Clock className="size-4" strokeWidth={2} aria-hidden />
            {formatClock(secondsLeft)}
          </span>
        </div>
        <Progress value={total > 0 ? ((index + 1) / total) * 100 : 0} className="mt-4" aria-label="Test progress" />
      </div>

      {question && (
        <div className="sf-card p-6">
          <p className="font-medium text-slate-800 dark:text-slate-100">{question.question}</p>
          {question.type === "multiple_choice" && (
            <div className="mt-4 flex flex-col gap-2" role="radiogroup" aria-label="Answer options">
              {(question.options ?? []).map((option) => (
                <label
                  key={option}
                  className={cn(
                    "flex cursor-pointer items-center gap-3 rounded-xl border p-3 text-sm transition-colors",
                    answers[index] === option
                      ? "border-sf-primary bg-sf-primary/5"
                      : "border-slate-200 hover:border-slate-300 dark:border-slate-700",
                  )}
                >
                  <input
                    type="radio"
                    name={`question-${index}`}
                    className="size-4 accent-[rgb(var(--sf-primary))]"
                    checked={answers[index] === option}
                    onChange={() => setAnswers((prev) => ({ ...prev, [index]: option }))}
                  />
                  {option}
                </label>
              ))}
            </div>
          )}
          {question.type === "true_false" && (
            <div className="mt-4 flex gap-2" role="radiogroup" aria-label="True or false">
              {["True", "False"].map((option) => (
                <Button
                  key={option}
                  type="button"
                  variant={answers[index] === option ? "default" : "outline"}
                  aria-pressed={answers[index] === option}
                  onClick={() => setAnswers((prev) => ({ ...prev, [index]: option }))}
                >
                  {option}
                </Button>
              ))}
            </div>
          )}
          {question.type === "short_answer" && (
            <Textarea
              value={answers[index] ?? ""}
              onChange={(e) => setAnswers((prev) => ({ ...prev, [index]: e.target.value }))}
              placeholder="Type your answer…"
              aria-label="Your answer"
              className="mt-4"
            />
          )}
        </div>
      )}

      <div className="flex items-center justify-between">
        <Button variant="outline" disabled={index === 0} onClick={() => setIndex((i) => Math.max(0, i - 1))}>
          Previous
        </Button>
        {index < total - 1 ? (
          <Button variant="gradient" className="sf-gradient-shadow" onClick={() => setIndex((i) => i + 1)}>
            Next
          </Button>
        ) : (
          <Button variant="gradient" className="sf-gradient-shadow" onClick={finish}>
            Submit test
          </Button>
        )}
      </div>
      <div className="flex justify-center">
        <Button variant="ghost" size="sm" onClick={onExit}>
          Exit test
        </Button>
      </div>
    </div>
  );
}

// ---- the view ----------------------------------------------------------------------

export function PracticeTestsView() {
  const { toast } = useToast();
  const tests = useDataStore((s) => s.practiceTests);
  const subjects = useDataStore((s) => s.subjects);
  const loading = useDataStore((s) => s.loading);

  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<PracticeTestRow | null>(null);
  const [deleting, setDeleting] = React.useState<PracticeTestRow | null>(null);
  const [running, setRunning] = React.useState<PracticeTestRow | null>(null);

  const subjectFor = React.useCallback(
    (id: string | null) => {
      const subject = subjects.find((s) => s.id === id);
      return subject ? { name: subject.name, color: subject.color } : null;
    },
    [subjects],
  );

  if (running) {
    return <QuestionRunner test={running} onExit={() => setRunning(null)} />;
  }

  return (
    <div className="flex flex-col gap-6">
      <ViewHeader
        title="Practice Tests"
        subtitle="Build and take practice tests"
        icon={FileText}
        actions={
          <Button
            variant="gradient"
            className="sf-gradient-shadow"
            onClick={() => {
              setEditing(null);
              setDialogOpen(true);
            }}
          >
            <Plus className="size-4" strokeWidth={2} /> Create Test
          </Button>
        }
      />

      {loading && tests.length === 0 ? (
        <div className="flex justify-center py-16">
          <Spinner className="size-6 text-sf-primary" />
        </div>
      ) : tests.length === 0 ? (
        <div className="sf-card">
          <EmptyState
            icon={FileText}
            title="No practice tests"
            hint="Build your first test to sharpen your recall before the exam."
            cta={
              <Button
                variant="gradient"
                className="sf-gradient-shadow-lg"
                onClick={() => {
                  setEditing(null);
                  setDialogOpen(true);
                }}
              >
                <Plus className="size-4" strokeWidth={2} /> Create Test
              </Button>
            }
          />
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {tests.map((test) => {
            const subject = subjectFor(test.subjectId);
            const questions = parseQuestions(test.questions);
            return (
              <div key={test.id} className="group sf-card flex flex-col justify-between gap-4 p-6">
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-medium text-slate-800 dark:text-slate-100">{test.title}</h3>
                    <div className="flex shrink-0 items-center gap-1 opacity-0 transition-opacity focus-within:opacity-100 group-hover:opacity-100">
                      <button
                        type="button"
                        aria-label={`Edit ${test.title}`}
                        onClick={() => {
                          setEditing(test);
                          setDialogOpen(true);
                        }}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-sf-primary dark:hover:bg-slate-800"
                      >
                        <Pencil className="size-4" strokeWidth={2} />
                      </button>
                      <button
                        type="button"
                        aria-label={`Delete ${test.title}`}
                        onClick={() => setDeleting(test)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950"
                      >
                        <Trash2 className="size-4" strokeWidth={2} />
                      </button>
                    </div>
                  </div>
                  <p className="mt-2 flex items-center gap-1.5 text-sm text-slate-500">
                    <Clock className="size-4" strokeWidth={2} aria-hidden />
                    {test.durationMinutes} min · {questions.length} questions
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <SubjectChip name={subject?.name} color={subject?.color} />
                    <span className="text-xs text-slate-400">
                      {new Date(test.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                </div>
                <Button
                  variant="outline"
                  disabled={questions.length === 0}
                  onClick={() => setRunning(test)}
                >
                  <Play className="size-4" strokeWidth={2} /> Start Test
                </Button>
              </div>
            );
          })}
        </div>
      )}

      <TestDialog
        key={dialogOpen ? `open-${editing?.id ?? "new"}` : "closed"}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        test={editing}
      />

      <AlertDialog open={deleting !== null} onOpenChange={(open) => !open && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this practice test?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleting?.title} and its questions will be permanently removed. This cannot be undone.
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
                mutations.deletePracticeTest(target.id).catch((err: unknown) =>
                  toast.error(errorMessage(err, "Could not delete the practice test.")),
                );
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

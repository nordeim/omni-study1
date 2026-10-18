"use client";

// ---------------------------------------------------------------------------
// MyDayView (S8-D/S9-B/Q + S6-C) — the 56px amber-gradient header, the
// quick-add row (input + More Options ONLY — Enter submits), the myDay task
// rows, the collapsed Completed section, the amber greeting empty state and
// the bare Suggestions toggle.
// ---------------------------------------------------------------------------

import * as React from "react";
import {
  ChevronDown,
  Circle,
  Plus,
  Sparkles,
  Sun,
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
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { mutations, useDataStore, type TaskRow } from "@/lib/data";
import { formatWeekdayMonthDay, startOfDay } from "@/lib/date";
import { greetingForHour } from "@/lib/router";
import { cn } from "@/lib/utils";
import { Spinner } from "@/components/views/shared";
import {
  TaskDialog,
  TaskRowCard,
  type TaskRowActions,
} from "@/components/views/tasks-view";

const STUDY_TIPS: string[] = [
  "Break big tasks into 25-minute focus blocks.",
  "Review yesterday's notes for two minutes first — recall beats re-reading.",
  "Do the hardest task while your energy is highest.",
  "Drink water before your next session — hydration is focus fuel.",
];

function errorMessage(err: unknown, fallback: string): string {
  return err instanceof Error && err.message ? err.message : fallback;
}

export function MyDayView() {
  const { toast } = useToast();
  const tasks = useDataStore((s) => s.tasks);
  const subjects = useDataStore((s) => s.subjects);
  const loading = useDataStore((s) => s.loading);

  const [quickAdd, setQuickAdd] = React.useState("");
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [dialogMyDay, setDialogMyDay] = React.useState(false);
  const [editing, setEditing] = React.useState<TaskRow | null>(null);
  const [showCompleted, setShowCompleted] = React.useState(false);
  const [showSuggestions, setShowSuggestions] = React.useState(false);
  const suggestedTasks = React.useMemo(
    () => tasks.filter((t) => !t.myDay && !t.completed).slice(0, 5),
    [tasks],
  );
  const [pendingDelete, setPendingDelete] = React.useState<TaskRow | null>(null);

  const today = startOfDay(new Date());

  const run = React.useCallback(
    (promise: Promise<void>, fallback: string) => {
      promise.catch((err: unknown) => toast.error(errorMessage(err, fallback)));
    },
    [toast],
  );

  const subjectName = React.useCallback(
    (id: string | null) => subjects.find((s) => s.id === id)?.name ?? null,
    [subjects],
  );

  const active = tasks.filter((t) => t.myDay && !t.completed);
  const completed = tasks.filter((t) => t.myDay && t.completed);

  const actions: TaskRowActions = React.useMemo(
    () => ({
      onToggle: (id) => void run(mutations.toggleTask(id), "Could not update the task."),
      onToggleMyDay: (task) =>
        void run(
          mutations.updateTask(task.id, { myDay: !task.myDay }),
          "Could not update the task.",
        ),
      onToggleImportant: (task) =>
        void run(
          mutations.updateTask(task.id, { important: !task.important }),
          "Could not update the task.",
        ),
      onEdit: (task) => {
        setEditing(task);
        setDialogMyDay(false);
        setDialogOpen(true);
      },
      onDelete: (task) => setPendingDelete(task),
    }),
    [run],
  );

  const quickAddSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const title = quickAdd.trim();
    if (!title) return;
    try {
      await mutations.createTask({ title, myDay: true });
      setQuickAdd("");
      toast.success("Added to My Day");
    } catch (err: unknown) {
      toast.error(errorMessage(err, "Could not add the task."));
    }
  };

  // The amber greeting empty (S9-B) replaces the whole view at zero tasks.
  if (!loading && tasks.length === 0) {
    const bucket = greetingForHour(today.getHours()).replace("Good ", "").toLowerCase();
    return (
      <div className="flex flex-col items-center py-12 text-center">
        <div className="sf-amber-card flex size-20 items-center justify-center rounded-2xl">
          <Sun className="size-10 text-amber-500" strokeWidth={2} />
        </div>
        <h3 className="mt-4 text-xl font-semibold text-slate-700 dark:text-slate-200">
          Good {bucket}!
        </h3>
        <p className="mt-1 text-base text-slate-500 dark:text-slate-400">
          What would you like to accomplish today?
        </p>
        <div className="mt-6">
          <Button
            variant="gradient"
            className="sf-amber-cta sf-gradient-shadow-lg"
            onClick={() => {
              setEditing(null);
              setDialogMyDay(true);
              setDialogOpen(true);
            }}
          >
            <Plus className="size-4" strokeWidth={2} />
            Add Your First Task
          </Button>
        </div>
        <TaskDialog
          key={dialogOpen ? `open-new` : "closed"}
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          task={null}
          defaultMyDay={dialogMyDay}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* ---- header: 56px amber-gradient sun block + text-3xl greeting (S8-D) ---- */}
      <header className="flex items-center gap-4">
        <div
          role="img"
          aria-label="My Day header block"
          className="flex size-14 shrink-0 items-center justify-center rounded-2xl"
          style={{
            backgroundImage: "linear-gradient(to bottom right, #fbbf24, #f97316)",
            boxShadow: "0 10px 15px -3px rgb(245 158 11 / 0.3), 0 4px 6px -4px rgb(245 158 11 / 0.3)",
          }}
        >
          <Sun className="size-7 text-white" strokeWidth={2} />
        </div>
        <div className="min-w-0">
          <h1 className="truncate text-3xl font-bold text-slate-800 dark:text-slate-100">
            My Day
          </h1>
          <p className="text-base text-slate-500 dark:text-slate-400">
            {formatWeekdayMonthDay(today)}
          </p>
        </div>
      </header>

      {/* ---- quick-add row: input + More Options ONLY — Enter submits (S9-Q) ---- */}
      <form className="flex gap-2" onSubmit={(e) => void quickAddSubmit(e)}>
        <div className="relative flex-1">
          <Input
            value={quickAdd}
            onChange={(e) => setQuickAdd(e.target.value)}
            placeholder="Add a task for today..."
            aria-label="Add a task for today"
            className="h-12 rounded-xl pr-10"
          />
          <Plus
            aria-hidden
            className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-slate-400"
            strokeWidth={2}
          />
        </div>
        <Button
          type="button"
          variant="outline"
          className="h-12 rounded-xl bg-white dark:bg-card"
          onClick={() => {
            setEditing(null);
            setDialogMyDay(true);
            setDialogOpen(true);
          }}
        >
          More Options
        </Button>
      </form>

      {/* ---- today's progress (S6-C measured amber card) ---- */}
      <section aria-label="Today progress" className="sf-progress-card rounded-2xl p-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-amber-700 dark:text-amber-400">Today&apos;s Progress</p>
            <p className="mt-1 text-2xl font-bold text-slate-800 dark:text-slate-100">
              {completed.length}/{active.length + completed.length}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">tasks completed today</p>
          </div>
          <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-900/40">
            <Sun className="size-6 text-amber-600 dark:text-amber-300" strokeWidth={2} />
          </div>
        </div>
      </section>

      {/* ---- task rows ---- */}
      <div className="sf-scroll flex-1 space-y-3 overflow-y-auto pr-1" aria-label="My Day tasks">
        {loading && tasks.length === 0 ? (
          <div className="flex justify-center py-16 text-sf-primary">
            <Spinner className="size-6" />
          </div>
        ) : active.length === 0 ? (
          <p className="py-10 text-center text-sm text-slate-500 dark:text-slate-400">
            All done for today — add another task above.
          </p>
        ) : (
          active.map((task) => (
            <TaskRowCard
              key={task.id}
              task={task}
              today={today}
              subjectName={subjectName(task.subjectId)}
              actions={actions}
            />
          ))
        )}
      </div>

      {/* ---- collapsed completed section ---- */}
      {completed.length > 0 && (
        <div>
          <button
            type="button"
            aria-expanded={showCompleted}
            onClick={() => setShowCompleted((v) => !v)}
            className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-600 dark:text-slate-400"
          >
            <ChevronDown
              className={cn("size-4 transition-transform", showCompleted && "rotate-180")}
              strokeWidth={2}
            />
            Completed ({completed.length})
          </button>
          {showCompleted && (
            <div className="mt-3 space-y-3">
              {completed.map((task) => (
                <TaskRowCard
                  key={task.id}
                  task={task}
                  today={today}
                  subjectName={subjectName(task.subjectId)}
                  actions={actions}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ---- bare suggestions toggle (S8-D: sparkles + rotating chevron) ---- */}
      <div>
        <button
          type="button"
          aria-controls="my-day-suggestions"
          aria-expanded={showSuggestions}
          onClick={() => setShowSuggestions((v) => !v)}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-600 dark:text-slate-400"
        >
          <Sparkles className="size-4" strokeWidth={2} />
          <span className="text-sm font-medium">Suggestions</span>
          <ChevronDown
            className={cn("size-4 transition-transform", showSuggestions && "rotate-180")}
            strokeWidth={2}
          />
        </button>
        {showSuggestions && (
          <div id="my-day-suggestions" aria-label="Suggested tasks" className="mt-3 flex flex-col gap-2">
            {suggestedTasks.length === 0 ? (
              <p className="py-4 text-center text-sm text-slate-400 dark:text-slate-500">
                Nothing to suggest — every task is already in My Day.
              </p>
            ) : (
              suggestedTasks.map((t) => (
                <div
                  key={t.id}
                  className="flex items-center gap-2.5 rounded-xl bg-slate-50 p-3 dark:bg-slate-800/50"
                >
                  <Circle className="size-4 shrink-0 text-sf-primary" strokeWidth={2} />
                  <p className="min-w-0 flex-1 truncate text-sm text-slate-600 dark:text-slate-300">
                    {t.title}
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      void run(mutations.updateTask(t.id, { myDay: true }), "Could not add the task.");
                    }}
                  >
                    Add
                  </Button>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      <TaskDialog
        key={dialogOpen ? `open-${editing?.id ?? "new"}` : "closed"}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        task={editing}
        defaultMyDay={dialogMyDay}
      />

      {/* delete confirm (pattern shared with TasksView) */}
      <DeleteConfirm
        task={pendingDelete}
        onClosed={() => setPendingDelete(null)}
        onConfirm={(task) => {
          void run(mutations.deleteTask(task.id), "Could not delete the task.");
          setPendingDelete(null);
        }}
      />
    </div>
  );
}

function DeleteConfirm({
  task,
  onClosed,
  onConfirm,
}: {
  task: TaskRow | null;
  onClosed: () => void;
  onConfirm: (task: TaskRow) => void;
}) {
  return (
    <AlertDialog
      open={task !== null}
      onOpenChange={(open) => {
        if (!open) onClosed();
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete this task?</AlertDialogTitle>
          <AlertDialogDescription>
            {task ? `"${task.title}" will be permanently removed.` : "This task will be permanently removed."}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            className="bg-red-600 text-white hover:bg-red-700"
            onClick={() => {
              if (task) onConfirm(task);
            }}
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

"use client";

// ---------------------------------------------------------------------------
// TasksView (S6-A/S8-F/S9-C/D/Q) — the full-height two-pane task manager.
//
// This file also owns the TaskRowCard + TaskDialog patterns consumed by
// MyDayView (AGENTS.md: "Tasks + MyDay consume it") — they are exported for
// the sibling view; page.tsx only ever imports TasksView itself.
// ---------------------------------------------------------------------------

import * as React from "react";
import {
  Ellipsis,
  Filter,
  List,
  ListTodo,
  Pencil,
  Plus,
  Search,
  Star,
  Sun,
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
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/toast";
import { mutations, useDataStore, type TaskPriority, type TaskRow } from "@/lib/data";
import { cn } from "@/lib/utils";
import {
  daysUntil,
  formatDueDateShort,
  startOfDay,
} from "@/lib/date";
import {
  DuePill,
  EmptyState,
  PriorityCheckbox,
  RepeatPill,
  SimpleEmptyState,
  SubjectChip,
  Spinner,
} from "@/components/views/shared";

// ---- shared helpers ----------------------------------------------------------

type Subtask = { id: string; title: string; done: boolean };

export function parseSubtasks(json: string): Subtask[] {
  try {
    const parsed: unknown = JSON.parse(json);
    if (!Array.isArray(parsed)) return [];
    return parsed.flatMap((item) => {
      if (typeof item !== "object" || item === null) return [];
      const { id, title, done } = item as Record<string, unknown>;
      if (typeof id !== "string" || typeof title !== "string") return [];
      return [{ id, title, done: done === true }];
    });
  } catch {
    return [];
  }
}

/** Local-date → yyyy-mm-dd for <input type="date">. */
function toDateInputValue(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const month = (d.getMonth() + 1).toString().padStart(2, "0");
  const day = d.getDate().toString().padStart(2, "0");
  return `${d.getFullYear()}-${month}-${day}`;
}

/** yyyy-mm-dd → a local-noon ISO stamp (safe against timezone drift). */
function fromDueDateInput(value: string): string {
  if (!value) return "";
  return new Date(`${value}T12:00:00`).toISOString();
}

function errorMessage(err: unknown, fallback: string): string {
  return err instanceof Error && err.message ? err.message : fallback;
}

// ---- TaskRowCard (S6-A: standalone bordered card rows) -----------------------

export type TaskRowActions = {
  onToggle: (id: string) => void;
  onToggleMyDay: (task: TaskRow) => void;
  onToggleImportant: (task: TaskRow) => void;
  onEdit: (task: TaskRow) => void;
  onDelete: (task: TaskRow) => void;
};

export function TaskRowCard({
  task,
  today,
  subjectName,
  actions,
}: {
  task: TaskRow;
  today: Date;
  subjectName?: string | null;
  actions: TaskRowActions;
}) {
  const due = task.dueDate ? new Date(task.dueDate) : null;
  const overdue = due !== null && daysUntil(due, today) <= 0;
  return (
    <div className="group rounded-xl border border-slate-200 bg-white shadow-sm transition-all hover:border-violet-200 hover:shadow-md dark:border-slate-700 dark:bg-card dark:hover:border-violet-800">
      <div className="flex items-center gap-3 p-4">
        <PriorityCheckbox
          checked={task.completed}
          priority={task.priority}
          onToggle={() => actions.onToggle(task.id)}
          label={`Mark "${task.title}" complete`}
        />
        <div className="min-w-0 flex-1">
          <p
            className={cn(
              "truncate font-medium text-slate-700 dark:text-slate-200",
              task.completed && "text-slate-400 line-through dark:text-slate-500",
            )}
          >
            {task.title}
          </p>
          {(due || task.repeat !== "none" || subjectName) && (
            <div className="mt-1 flex flex-wrap items-center gap-2">
              {due && (
                <DuePill
                  /* S76/AC8 (measured on the reference): the task pill is
                   * ALWAYS the date form — "Oct 20", month-short + day, no
                   * weekday, no Today/Tomorrow labels — with the leading
                   * calendar glyph; red when due today/past, slate when
                   * future. */
                  label={formatDueDateShort(due)}
                  overdue={overdue}
                  withIcon
                />
              )}
              {task.repeat !== "none" && <RepeatPill label={task.repeat} />}
              <SubjectChip name={subjectName} />
            </div>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-1 opacity-0 transition-opacity focus-within:opacity-100 group-hover:opacity-100">
          <button
            type="button"
            onClick={() => actions.onToggleMyDay(task)}
            aria-label={`Toggle My Day for ${task.title}`}
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800",
              task.myDay ? "text-sf-primary" : "text-slate-400",
            )}
          >
            <Sun className={cn("size-4", task.myDay && "fill-sf-primary")} strokeWidth={2} />
          </button>
          <button
            type="button"
            onClick={() => actions.onToggleImportant(task)}
            aria-label={`Toggle important for ${task.title}`}
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800",
              task.important ? "text-sf-primary" : "text-slate-400",
            )}
          >
            <Star className={cn("size-4", task.important && "fill-sf-primary")} strokeWidth={2} />
          </button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                aria-label={`Task menu for ${task.title}`}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <Ellipsis className="size-4" strokeWidth={2} />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onSelect={() => actions.onEdit(task)}>
                <Pencil className="size-4" strokeWidth={2} /> Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-red-600 focus:text-red-600 dark:text-red-400"
                onSelect={() => actions.onDelete(task)}
              >
                <Trash2 className="size-4" strokeWidth={2} /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}

// ---- the switch-style dialog toggles (S6-B: they are BUTTONS) ----------------

function ToggleRow({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (next: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      aria-pressed={checked}
      className="flex h-9 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 text-sm text-foreground shadow-sm"
    >
      <span>{label}</span>
      <span
        aria-hidden
        className={cn(
          "flex h-5 w-9 items-center rounded-full border border-transparent transition-colors",
          checked ? "bg-sf-primary" : "bg-gray-200 dark:bg-slate-700",
        )}
      >
        <span
          className={cn(
            "block size-4 rounded-full bg-white shadow-sm transition-transform",
            checked ? "translate-x-4" : "translate-x-0.5",
          )}
        />
      </span>
    </button>
  );
}

// ---- TaskDialog (create/edit — S6-B field set) -------------------------------

export function TaskDialog({
  open,
  onOpenChange,
  task,
  defaultMyDay = false,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: TaskRow | null;
  defaultMyDay?: boolean;
}) {
  const { toast } = useToast();
  const subjects = useDataStore((s) => s.subjects);
  // State initializes from props per open session (the parent key-remounts
  // this component on every open — no populate-on-open effect needed).
  const [title, setTitle] = React.useState(task?.title ?? "");
  const [notes, setNotes] = React.useState(task?.notes ?? "");
  const [myDay, setMyDay] = React.useState(task ? task.myDay : defaultMyDay);
  const [important, setImportant] = React.useState(task ? task.important : false);
  const [dueDate, setDueDate] = React.useState(toDateInputValue(task?.dueDate ?? null));
  const [subjectId, setSubjectId] = React.useState(task?.subjectId ?? "none");
  const [priority, setPriority] = React.useState<TaskPriority>(task?.priority ?? "none");
  const [repeat, setRepeat] = React.useState<TaskRow["repeat"]>(task?.repeat ?? "none");
  const [subtasks, setSubtasks] = React.useState<Subtask[]>(parseSubtasks(task?.subtasks ?? "[]"));
  const [subtaskInput, setSubtaskInput] = React.useState("");
  const [saving, setSaving] = React.useState(false);

  const addSubtask = () => {
    const value = subtaskInput.trim();
    if (!value) return;
    setSubtasks((list) => [...list, { id: crypto.randomUUID(), title: value, done: false }]);
    setSubtaskInput("");
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!title.trim()) return;
    setSaving(true);
    try {
      const payload = {
        title: title.trim(),
        notes,
        subjectId: subjectId === "none" ? "" : subjectId,
        dueDate: fromDueDateInput(dueDate),
        priority,
        repeat,
        myDay,
        important,
        subtasks: JSON.stringify(subtasks),
      };
      if (task) {
        await mutations.updateTask(task.id, payload);
        toast.success("Task updated");
      } else {
        await mutations.createTask(payload);
        toast.success("Task created");
      }
      onOpenChange(false);
    } catch (err: unknown) {
      toast.error(errorMessage(err, "Could not save the task."));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{task ? "Edit Task" : "Create Task"}</DialogTitle>
        </DialogHeader>
        <form className="flex flex-col gap-4" onSubmit={(e) => void submit(e)}>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="task-title">Title</Label>
            <Input
              id="task-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Task name"
              required
              autoFocus
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <ToggleRow label="My Day" checked={myDay} onChange={setMyDay} />
            <ToggleRow label="Important" checked={important} onChange={setImportant} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="task-due">Due date</Label>
              <Input
                id="task-due"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="task-subject">Subject</Label>
              <Select value={subjectId} onValueChange={setSubjectId}>
                <SelectTrigger id="task-subject" aria-label="Subject">
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
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="task-priority">Priority</Label>
              <Select
                value={priority}
                onValueChange={(v) => setPriority(v as TaskPriority)}
              >
                <SelectTrigger id="task-priority" aria-label="Priority">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="task-repeat">Repeat</Label>
              <Select
                value={repeat}
                onValueChange={(v) => setRepeat(v as TaskRow["repeat"])}
              >
                <SelectTrigger id="task-repeat" aria-label="Repeat">
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
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Subtasks</Label>
            {subtasks.length > 0 && (
              <div className="flex flex-col gap-1.5">
                {subtasks.map((st) => (
                  <div key={st.id} className="flex items-center gap-2">
                    <button
                      type="button"
                      role="checkbox"
                      aria-checked={st.done}
                      aria-label={`Toggle subtask ${st.title}`}
                      onClick={() =>
                        setSubtasks((list) =>
                          list.map((x) => (x.id === st.id ? { ...x, done: !x.done } : x)),
                        )
                      }
                      className={cn(
                        "flex size-4 shrink-0 items-center justify-center rounded-full border-2",
                        st.done
                          ? "border-sf-primary bg-sf-primary text-sf-primary-foreground"
                          : "border-slate-300 dark:border-slate-600",
                      )}
                    >
                      {st.done && (
                        <svg viewBox="0 0 12 12" className="size-2.5" fill="none" aria-hidden>
                          <path
                            d="M2 6.5 4.5 9 10 3"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      )}
                    </button>
                    <span
                      className={cn(
                        "flex-1 truncate text-sm text-slate-600 dark:text-slate-300",
                        st.done && "text-slate-400 line-through",
                      )}
                    >
                      {st.title}
                    </span>
                    <button
                      type="button"
                      aria-label={`Remove subtask ${st.title}`}
                      onClick={() => setSubtasks((list) => list.filter((x) => x.id !== st.id))}
                      className="flex h-6 w-6 items-center justify-center rounded-md text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      <Trash2 className="size-3.5" strokeWidth={2} />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <div className="flex gap-2">
              <Input
                value={subtaskInput}
                onChange={(e) => setSubtaskInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addSubtask();
                  }
                }}
                placeholder="Add a subtask..."
                aria-label="Add a subtask"
              />
              <Button type="button" variant="outline" onClick={addSubtask}>
                Add
              </Button>
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="task-notes">Notes</Label>
            <Textarea
              id="task-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add notes..."
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="gradient" className="sf-gradient-shadow" disabled={saving || !title.trim()}>
              {saving ? <Spinner className="text-sf-primary-foreground" /> : null}
              {task ? "Save Changes" : "Create Task"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ---- the view -----------------------------------------------------------------

type StatusFilter = "all" | "active" | "completed";
type AsideFilter = { kind: "all" } | { kind: "important" } | { kind: "list"; id: string };

const STATUS_LABELS: Record<StatusFilter, string> = {
  all: "All",
  active: "Active",
  completed: "Completed",
};

export function TasksView() {
  const { toast } = useToast();
  const tasks = useDataStore((s) => s.tasks);
  const taskLists = useDataStore((s) => s.taskLists);
  const subjects = useDataStore((s) => s.subjects);
  const loading = useDataStore((s) => s.loading);

  const [aside, setAside] = React.useState<AsideFilter>({ kind: "all" });
  const [status, setStatus] = React.useState<StatusFilter>("active");
  const [search, setSearch] = React.useState("");
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<TaskRow | null>(null);

  const today = startOfDay(new Date());

  const run = React.useCallback(
    (promise: Promise<void>, fallback: string) => {
      promise.catch((err: unknown) => toast.error(errorMessage(err, fallback)));
    },
    [toast],
  );

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
        setDialogOpen(true);
      },
      onDelete: (task) =>
        void run(mutations.deleteTask(task.id), "Could not delete the task."),
    }),
    [run],
  );

  const subjectName = React.useCallback(
    (id: string | null) => subjects.find((s) => s.id === id)?.name ?? null,
    [subjects],
  );

  const matchesAside = React.useCallback(
    (task: TaskRow) => {
      if (aside.kind === "important") return task.important;
      if (aside.kind === "list") return task.listId === aside.id;
      return true;
    },
    [aside],
  );

  const visible = tasks.filter((task) => {
    if (!matchesAside(task)) return false;
    if (status === "active" && task.completed) return false;
    if (status === "completed" && !task.completed) return false;
    if (search && !task.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const activeLabel =
    aside.kind === "all"
      ? "All Tasks"
      : aside.kind === "important"
        ? "Important"
        : taskLists.find((l) => l.id === aside.id)?.name ?? "List";

  const countFor = (filter: AsideFilter) =>
    tasks.filter((task) =>
      filter.kind === "important"
        ? task.important
        : filter.kind === "list"
          ? task.listId === filter.id
          : true,
    ).length;

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-6">
      {/* ---- aside: status filters + My Lists (S6-A/S8-F, no empty placeholder — S9-D) ---- */}
      <aside
        aria-label="Task views"
        className="hidden w-64 shrink-0 flex-col overflow-y-auto sf-scroll border-r border-slate-100 pr-6 dark:border-slate-800 md:flex"
      >
        {/* No heading here (S79/AF2, measured on the ref at 768): the
            reference's aside opens directly with the All Tasks/Important
            rows + the "MY LISTS" divider — no "Lists" heading exists on
            the ref (the scaffold h2 was clone-only drift that survived
            until the mid-band/landscape sweeps re-ran). */}
        <div className="flex flex-col gap-1">
          <AsideRow
            icon={<List className="size-5 shrink-0" strokeWidth={2} />}
            label="All Tasks"
            count={countFor({ kind: "all" })}
            active={aside.kind === "all"}
            onClick={() => setAside({ kind: "all" })}
          />
          <AsideRow
            icon={<Star className="size-5 shrink-0" strokeWidth={2} />}
            label="Important"
            count={countFor({ kind: "important" })}
            active={aside.kind === "important"}
            onClick={() => setAside({ kind: "important" })}
          />
        </div>
        <div className="mt-4 border-t border-slate-100 pt-4 dark:border-slate-800">
          <p className="pb-2 text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            My Lists
          </p>
          <div className="flex flex-col gap-1">
            {taskLists.map((list) => (
              <AsideRow
                key={list.id}
                icon={<ListTodo className="size-5 shrink-0" strokeWidth={2} />}
                label={list.name}
                count={countFor({ kind: "list", id: list.id })}
                active={aside.kind === "list" && aside.id === list.id}
                onClick={() => setAside({ kind: "list", id: list.id })}
              />
            ))}
          </div>
        </div>
      </aside>

      {/* ---- main pane ---- */}
      <section className="flex min-w-0 flex-1 flex-col">
        {/* No sm:min-w-0 (S79/AF2b, unmasked by the Lists-h2 removal): with
            it, the flex-1 title div collapsed to width 0 at the md band
            (768: the search+filter+Add Task row consumed the whole line —
            the truncate h1 went INVISIBLE; pre-existing, masked by the
            aside h2 being the sweep's first visible heading). Dropping it
            restores the min-content floor: the header WRAPS (the ref's own
            title block wraps at 74px there — measured; the ref instead
            overflows to 826, its own bug family) and the h1 stays visible
            through the band. Desktop: the row fits one line and flex-grow
            distributes identically for TYPICAL labels. S80/AG7 note (the
            s80 audit, L7): a long user-named list label now wraps the
            header row instead of ellipsizing — the ref's own wrap shape
            (the h1's truncate can never engage at sm+ under a wrapping
            flex row; kept as harmless dead styling). */}
        <div role="group" aria-label="Tasks header" className="flex flex-wrap items-center gap-3 pb-4">
          <div className="w-full sm:w-auto sm:flex-1">
            <div className="flex items-baseline gap-2">
              <h1 className="truncate text-2xl font-bold text-slate-800 dark:text-slate-100">
                {activeLabel}
              </h1>
              <span className="text-sm text-slate-500 dark:text-slate-400">
                {visible.length} tasks
              </span>
            </div>
          </div>
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400"
              strokeWidth={2}
              aria-hidden
            />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search tasks..."
              aria-label="Search tasks"
              className="w-48 pl-9"
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" aria-label={`Filter tasks: ${STATUS_LABELS[status]}`} className="bg-white dark:bg-card">
                <Filter className="size-4 text-slate-500" strokeWidth={2} />
                {STATUS_LABELS[status]}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {(["all", "active", "completed"] as StatusFilter[]).map((value) => (
                <DropdownMenuItem
                  key={value}
                  onSelect={() => setStatus(value)}
                  className={cn(status === value && "bg-slate-50 font-medium dark:bg-slate-800")}
                >
                  {STATUS_LABELS[value]}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <Button
            variant="gradient"
            className="sf-gradient-shadow"
            onClick={() => {
              setEditing(null);
              setDialogOpen(true);
            }}
          >
            <Plus className="size-4" strokeWidth={2} />
            Add Task
          </Button>
        </div>

        <div role="group" aria-label="Task rows" className="sf-scroll flex-1 space-y-3 overflow-y-auto pr-1">
          {loading && tasks.length === 0 ? (
            <div className="flex justify-center py-16 text-sf-primary">
              <Spinner className="size-6" />
            </div>
          ) : visible.length === 0 ? (
            <EmptyState
              icon={ListTodo}
              title="No tasks yet"
              hint={
                search || aside.kind !== "all"
                  ? "Try changing the filters or search term."
                  : "Create your first task to get started"
              }
              cta={
                <Button
                  variant="gradient"
                  className="sf-gradient-shadow-lg"
                  onClick={() => {
                    setEditing(null);
                    setDialogOpen(true);
                  }}
                >
                  <Plus className="size-4" strokeWidth={2} />
                  Add Task
                </Button>
              }
            />
          ) : (
            visible.map((task) => (
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
      </section>

      <TaskDialog
        key={dialogOpen ? `open-${editing?.id ?? "new"}` : "closed"}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        task={editing}
      />
    </div>
  );
}

function AsideRow({
  icon,
  label,
  count,
  active,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-base transition-colors",
        // S80/AG5: the active pair moved from the inline style to the
        // sf-aside-active utility — light computed values are BYTE-IDENTICAL
        // (the S6-A pins guard them; the utility emits the same rgb() forms),
        // and the .dark & branch can now re-theme (an inline style beats any
        // class specificity, so the dark override could never reach it).
        active && "sf-aside-active",
        !active && "text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800/60",
      )}
    >
      {icon}
      <span className="flex-1 truncate font-medium">{label}</span>
      <span className={cn("text-sm", !active && "text-slate-500 dark:text-slate-400")}>{count}</span>
    </button>
  );
}

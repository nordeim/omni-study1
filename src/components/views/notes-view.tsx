"use client";

// ---------------------------------------------------------------------------
// Notes (S8-G): TWO-PANE — a w-80 border-r left pane (the view h1 + icon
// INSIDE, flanked by a 36px gradient dropdown: New note / New notebook; icon
// search; notebook filter) and a BARE right pane holding the centered empty
// state or the editor (editor keeps sf-card chrome).
// ---------------------------------------------------------------------------

import * as React from "react";
import {
  BookOpen,
  FileText,
  MoreVertical,
  Notebook,
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
import { useToast } from "@/components/ui/toast";
import { EmptyState } from "@/components/views/shared";
import {
  mutations,
  useDataStore,
  type NoteInput,
  type NoteRow,
  type NotebookRow,
} from "@/lib/data";
import { formatShortWithYear } from "@/lib/date";
import { apiSend, ApiError } from "@/lib/api";
import { cn } from "@/lib/utils";

type DialogState =
  | { open: false }
  | { open: true; kind: "note"; editing: NoteRow | null }
  | { open: true; kind: "notebook"; editing: NotebookRow | null };

export function NotesView() {
  const notes = useDataStore((s) => s.notes);
  const notebooks = useDataStore((s) => s.notebooks);
  const createNote = mutations.createNote;
  const updateNote = mutations.updateNote;
  const deleteNote = mutations.deleteNote;
  const createNotebook = mutations.createNotebook;
  const deleteNotebook = mutations.deleteNotebook;
  const { toast } = useToast();

  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [query, setQuery] = React.useState("");
  const [notebookFilter, setNotebookFilter] = React.useState("all");
  const [dialog, setDialog] = React.useState<DialogState>({ open: false });
  const [name, setName] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState("");

  const filtered = React.useMemo(
    () =>
      notes
        .filter((n) => notebookFilter === "all" || n.notebookId === notebookFilter)
        .filter((n) => {
          if (!query.trim()) return true;
          const q = query.toLowerCase();
          return (
            n.title.toLowerCase().includes(q) ||
            n.content.toLowerCase().includes(q)
          );
        })
        .sort(
          (a, b) =>
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
        ),
    [notes, notebookFilter, query],
  );

  // Render-derived selection: a missing/stale id falls back to the first
  // note — no auto-select effect (the set-state-in-effect lint contract).
  const effectiveNoteId =
    selectedId && notes.some((n) => n.id === selectedId)
      ? selectedId
      : (filtered[0]?.id ?? null);
  const selected = notes.find((n) => n.id === effectiveNoteId) ?? null;

  const openNewNote = () => {
    setName("");
    setError("");
    setDialog({ open: true, kind: "note", editing: null });
  };

  const openNewNotebook = () => {
    setName("");
    setError("");
    setDialog({ open: true, kind: "notebook", editing: null });
  };

  const openEditNotebook = (row: NotebookRow) => {
    setName(row.name);
    setError("");
    setDialog({ open: true, kind: "notebook", editing: row });
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy || !dialog.open) return;
    setBusy(true);
    setError("");
    try {
      if (dialog.kind === "note") {
        if (dialog.editing) {
          await updateNote(dialog.editing.id, { title: name });
        } else {
          const created = await createNote({ title: name, content: "", notebookId: notebookFilter === "all" ? "" : notebookFilter });
          setSelectedId(created ?? null);
        }
      } else {
        if (dialog.editing) {
          // Notebooks ride the generic API through apiSend — the store keeps
          // notebooks only as create; rename is a direct PATCH.
          await apiSend("PATCH", `/api/notebooks/${dialog.editing.id}`, { name });
          await useDataStore.getState().loadCollections(["notebooks"]);
        } else {
          await createNotebook({ name });
        }
      }
      setDialog({ open: false });
    } catch (err: unknown) {
      setError(err instanceof ApiError ? err.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  };

  const removeNote = async (id: string) => {
    try {
      await deleteNote(id);
      toast.success("Note deleted.");
    } catch (err: unknown) {
      toast.error(err instanceof ApiError ? err.message : "Delete failed.");
    }
  };

  const removeNotebook = async (row: NotebookRow) => {
    try {
      await deleteNotebook(row.id);
      toast.success("Notebook deleted. Its notes are kept.");
    } catch (err: unknown) {
      toast.error(err instanceof ApiError ? err.message : "Delete failed.");
    }
  };

  const patchSelected = async (patch: Partial<NoteInput>) => {
    if (!selected) return;
    try {
      await updateNote(selected.id, patch);
    } catch (err: unknown) {
      toast.error(err instanceof ApiError ? err.message : "Save failed.");
    }
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-6">
      {/* Left pane */}
      <aside className="hidden w-80 shrink-0 flex-col border-r border-slate-100 pr-6 md:flex dark:border-slate-800">
        <div className="flex items-center gap-3">
          <h1 className="flex flex-1 items-center gap-2 text-2xl font-bold text-slate-800 dark:text-slate-100">
            <BookOpen className="size-6 text-sf-primary" strokeWidth={2} />
            Notes
          </h1>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                aria-label="New note or notebook"
                className="sf-gradient sf-gradient-shadow flex size-9 items-center justify-center rounded-xl text-white outline-none focus-visible:ring-2 focus-visible:ring-sf-primary/40"
              >
                <Plus className="size-4" strokeWidth={2} />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={openNewNote}>
                <FileText className="size-4" strokeWidth={2} />
                New note
              </DropdownMenuItem>
              <DropdownMenuItem onClick={openNewNotebook}>
                <Notebook className="size-4" strokeWidth={2} />
                New notebook
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="relative mt-4">
          <Search
            aria-hidden
            className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400"
            strokeWidth={2}
          />
          <Input
            aria-label="Search notes"
            placeholder="Search notes…"
            className="pl-9"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        <div className="mt-3">
          <Select value={notebookFilter} onValueChange={setNotebookFilter}>
            <SelectTrigger className="h-9" aria-label="Filter by notebook">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All notebooks</SelectItem>
              {notebooks.map((nb) => (
                <SelectItem key={nb.id} value={nb.id}>
                  {nb.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="sf-scroll mt-3 flex-1 space-y-2 overflow-y-auto">
          {filtered.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-400">
              {notes.length === 0 ? "No notes yet." : "No notes match."}
            </p>
          ) : (
            filtered.map((note) => {
              const notebook = notebooks.find((nb) => nb.id === note.notebookId);
              return (
                <button
                  key={note.id}
                  type="button"
                  onClick={() => setSelectedId(note.id)}
                  className={cn(
                    "block w-full rounded-xl border-2 p-4 text-left outline-none transition-colors focus-visible:ring-2 focus-visible:ring-sf-primary/40",
                    effectiveNoteId === note.id
                      ? "border-sf-primary/30 bg-violet-50 dark:bg-slate-800"
                      : "border-transparent bg-slate-50 hover:border-slate-200 dark:bg-slate-800/50 dark:hover:border-slate-700",
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="truncate text-sm font-medium text-slate-700 dark:text-slate-200">
                      {note.title}
                    </h3>
                  </div>
                  <p className="mt-1 truncate text-xs text-slate-500 dark:text-slate-400">
                    {note.content.replace(/[#*\n]/g, " ").slice(0, 60) || "Empty note"}
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    {notebook ? `${notebook.name} · ` : ""}
                    {formatShortWithYear(new Date(note.updatedAt))}
                  </p>
                </button>
              );
            })
          )}
        </div>
      </aside>

      {/* Right pane — BARE (no card wrapper) */}
      <div className="flex min-w-0 flex-1 flex-col">
        {notes.length === 0 ? (
          <div className="sf-card flex flex-1 flex-col justify-center">
            <EmptyState
              icon={BookOpen}
              title="No notes yet"
              hint="Create your first note to start capturing ideas."
              cta={
                <Button type="button" variant="gradient" className="sf-gradient-shadow-lg" onClick={openNewNote}>
                  <Plus className="size-4" strokeWidth={2} />
                  New note
                </Button>
              }
            />
          </div>
        ) : !selected ? (
          <div className="flex flex-1 items-center justify-center">
            <p className="text-sm text-slate-400">Select a note from the list.</p>
          </div>
        ) : (
          <div className="flex min-h-0 flex-1 flex-col">
            <div className="flex items-center gap-2">
              <Input
                aria-label="Note title"
                value={selected.title}
                onChange={(e) => updateNote(selected.id, { title: e.target.value }).catch(() => {})}
                className="border-none bg-transparent text-xl font-semibold shadow-none focus-visible:ring-0 dark:bg-transparent"
              />
              <div className="flex shrink-0 items-center gap-1">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      type="button"
                      aria-label="Note actions"
                      className="flex size-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      <MoreVertical className="size-4" strokeWidth={2} />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {notebooks.length > 0 && (
                      <div className="px-2 py-1.5">
                        <p className="mb-1 text-xs font-medium text-slate-400">Move to notebook</p>
                        <Select
                          value={selected.notebookId ?? "none"}
                          onValueChange={(v) =>
                            patchSelected({ notebookId: v === "none" ? "" : v })
                          }
                        >
                          <SelectTrigger className="h-8 w-44">
                            <SelectValue placeholder="No notebook" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">No notebook</SelectItem>
                            {notebooks.map((nb) => (
                              <SelectItem key={nb.id} value={nb.id}>
                                {nb.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                    <DropdownMenuItem onClick={() => removeNote(selected.id)} className="text-red-600 focus:text-red-600">
                      <Trash2 className="size-4" strokeWidth={2} />
                      Delete note
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            <p className="mt-1 text-xs text-slate-400">
              Last updated {formatShortWithYear(new Date(selected.updatedAt))}
            </p>
            <div className="sf-card mt-3 flex min-h-0 flex-1 flex-col p-4">
              <textarea
                aria-label="Note content"
                value={selected.content}
                onChange={(e) => {
                  // Local echo keeps typing smooth; persist on blur.
                  useDataStore.getState().updateRow("notes", selected.id, {
                    content: e.target.value,
                  });
                }}
                onBlur={(e) => patchSelected({ content: e.target.value })}
                placeholder="Start writing…"
                className="sf-scroll min-h-0 flex-1 resize-none border-none bg-transparent text-sm leading-relaxed text-slate-700 outline-none dark:text-slate-200"
              />
            </div>
          </div>
        )}
      </div>

      {/* Mobile create button (two-pane is md+) */}
      <Button
        type="button"
        variant="gradient"
        className="sf-gradient-shadow fixed bottom-20 right-4 z-30 size-14 rounded-full md:hidden"
        aria-label="New note"
        onClick={openNewNote}
      >
        <Plus className="size-5" strokeWidth={2} />
      </Button>

      <Dialog open={dialog.open} onOpenChange={(open) => !open && setDialog({ open: false })}>
        <DialogContent className="max-w-md rounded-lg">
          <DialogHeader>
            <DialogTitle>
              {!dialog.open
                ? "New note"
                : dialog.kind === "note"
                  ? dialog.editing
                    ? "Rename note"
                    : "New note"
                  : dialog.editing
                    ? "Rename notebook"
                    : "New notebook"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={submit} className="flex flex-col gap-4" noValidate>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="note-name">Name</Label>
              <Input
                id="note-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={dialog.open && dialog.kind === "notebook" ? "Lecture Notes" : "Integration techniques"}
                required
                autoFocus
              />
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
                {busy ? "Saving…" : "Save"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Notebook list management (edit/delete) lives in a compact dropdown below the filter on md+ */}
      {notebooks.length > 0 && (
        <div className="hidden md:block">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="mt-2 flex items-center gap-1 text-xs font-medium text-slate-400 outline-none hover:text-slate-600 focus-visible:ring-2 focus-visible:ring-sf-primary/40"
              >
                <Pencil className="size-3" strokeWidth={2} />
                Manage notebooks
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              {notebooks.map((nb) => (
                <DropdownMenuItem key={nb.id} className="gap-2">
                  <span className="flex-1">{nb.name}</span>
                  <button
                    type="button"
                    aria-label={`Rename ${nb.name}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      openEditNotebook(nb);
                    }}
                    className="rounded p-1 text-slate-400 hover:text-slate-600"
                  >
                    <Pencil className="size-3" strokeWidth={2} />
                  </button>
                  <button
                    type="button"
                    aria-label={`Delete ${nb.name}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      removeNotebook(nb);
                    }}
                    className="rounded p-1 text-slate-400 hover:text-red-500"
                  >
                    <Trash2 className="size-3" strokeWidth={2} />
                  </button>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
    </div>
  );
}

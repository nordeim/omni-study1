"use client";

// ---------------------------------------------------------------------------
// Notes (S8-G + S77/AD): TWO-PANE — a w-80 border-r left pane (the view h1
// + icon INSIDE, flanked by a 36px gradient dropdown: New note / New
// notebook; icon search; notebook + tag filters) and a BARE right pane
// holding the centered empty state or the editor.
//
// Session-77 Batch AD (computed-style measured 2026-10-21): the editor is
// the reference's own anatomy — title row (14px/700 input + black actions
// button + gradient Save), Font row ("Font:" label + typeface select + the
// black Divider button), tag row (dark pills + "Add tag..." input), then the
// white rounded-2xl card wrapping the FUNCTIONAL Quill snow editor (content
// persisted as HTML). The list row: violet-50 + 2px violet-200 selected,
// p-3, h3 16px/600 + 12px slate-500 preview + tag pill — no notebook/date
// line (measured). Honest deviations: readable text everywhere (the ref
// renders its typed title/editor text white-on-white — its own bug), Save
// text white (the ref's yellow-on-gradient quirk), autosave KEPT alongside
// Save (superset — the ref silently discards unsaved content).
// ---------------------------------------------------------------------------

import * as React from "react";
import {
  BookOpen,
  FileText,
  Minus,
  MoreVertical,
  Notebook,
  Pencil,
  Plus,
  Save,
  Search,
  Trash2,
  Folder,
  Tag,
  X,
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
  QuillEditor,
  type EditorFont,
  type QuillEditorHandle,
} from "@/components/views/quill-editor";
import {
  mutations,
  useDataStore,
  type NoteInput,
  type NoteRow,
  type NotebookRow,
} from "@/lib/data";
import { apiSend, ApiError } from "@/lib/api";
import { stripHtmlPreview } from "@/lib/text";
import { cn } from "@/lib/utils";

type DialogState =
  | { open: false }
  | { open: true; kind: "note"; editing: NoteRow | null }
  | { open: true; kind: "notebook"; editing: NotebookRow | null };

/** The NoteRow.tags JSON contract → a sorted unique list (safe parse). */
function parseNoteTags(raw: string): string[] {
  try {
    const parsed: unknown = JSON.parse(raw || "[]");
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((t): t is string => typeof t === "string" && t.length > 0);
  } catch {
    return [];
  }
}

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
  const [tagFilter, setTagFilter] = React.useState("all");
  const [dialog, setDialog] = React.useState<DialogState>({ open: false });
  const [name, setName] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState("");
  // S77/AD: the editor's measured chrome state — the Font row typeface and
  // the tag-row draft.
  const [font, setFont] = React.useState<EditorFont>("sans");
  const [tagDraft, setTagDraft] = React.useState("");
  const editorRef = React.useRef<QuillEditorHandle | null>(null);

  const allTags = React.useMemo(() => {
    const set = new Set<string>();
    for (const n of notes) {
      try {
        const parsed: unknown = JSON.parse(n.tags);
        if (Array.isArray(parsed)) {
          for (const t of parsed) if (typeof t === "string" && t) set.add(t);
        }
      } catch {
        // unparseable tags — skip
      }
    }
    return Array.from(set).sort();
  }, [notes]);

  const filtered = React.useMemo(
    () =>
      notes
        .filter((n) => notebookFilter === "all" || n.notebookId === notebookFilter)
        .filter((n) => {
          if (tagFilter === "all") return true;
          try {
            const parsed: unknown = JSON.parse(n.tags);
            return Array.isArray(parsed) && parsed.includes(tagFilter);
          } catch {
            return false;
          }
        })
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
    [notes, notebookFilter, tagFilter, query],
  );

  // Render-derived selection: a missing/stale id falls back to the first
  // note — no auto-select effect (the set-state-in-effect lint contract).
  // No auto-select - the reference's editor pane stays bare (Select a
  // note from the list.) until the user picks a note (S8-G).
  const effectiveNoteId =
    selectedId && notes.some((n) => n.id === selectedId) ? selectedId : null;
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

  // ---- S77/AD: the editor's tag row + Save ----
  // parseNoteTags is a trivial JSON.parse — no memo (the React Compiler
  // rejects the optional-chained dependency, and the cost is nil).
  const selectedTags = selected ? parseNoteTags(selected.tags) : [];

  const saveTags = (next: string[]) => {
    void patchSelected({ tags: JSON.stringify(next) });
  };

  const addTag = () => {
    const tag = tagDraft.trim().replace(/^#/, "");
    setTagDraft("");
    if (!tag || tag.length > 24 || selectedTags.includes(tag)) return;
    saveTags([...selectedTags, tag]);
  };

  const removeTag = (tag: string) => {
    saveTags(selectedTags.filter((t) => t !== tag));
  };

  // The Quill wrapper debounces its own change events (autosave superset);
  // Save flushes immediately with the live editor content.
  const onContentChange = (html: string) => {
    if (!selected) return;
    updateNote(selected.id, { content: html }).catch(() => {});
  };

  const saveNow = async () => {
    if (!selected) return;
    const html = editorRef.current?.getContent() ?? selected.content;
    try {
      await updateNote(selected.id, { content: html });
      toast.success("Note saved.");
    } catch (err: unknown) {
      toast.error(err instanceof ApiError ? err.message : "Save failed.");
    }
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-6">
      {/* Left pane */}
      <aside
        aria-label="Notes list pane"
        className="hidden w-80 shrink-0 flex-col border-r border-slate-100 pr-6 md:flex dark:border-slate-800"
      >
        <div className="flex items-center gap-3">
          <h1 className="flex flex-1 items-center gap-2 text-2xl font-bold text-slate-800 dark:text-slate-100">
            <BookOpen className="size-6 text-sf-primary" strokeWidth={2} />
            Notes
          </h1>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                aria-label="New note menu"
                className="sf-gradient sf-gradient-shadow flex size-9 items-center justify-center rounded-xl text-white outline-none focus-visible:ring-2 focus-visible:ring-sf-primary/40"
              >
                <Plus className="size-4" strokeWidth={2} />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={openNewNote}>
                <FileText className="size-4" strokeWidth={2} />
                New Note
              </DropdownMenuItem>
              <DropdownMenuItem onClick={openNewNotebook}>
                <Notebook className="size-4" strokeWidth={2} />
                New Notebook
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
              <Folder className="size-4 text-slate-400" strokeWidth={2} aria-hidden />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Notebooks</SelectItem>
              {notebooks.map((nb) => (
                <SelectItem key={nb.id} value={nb.id}>
                  {nb.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="mt-3">
          <Select value={tagFilter} onValueChange={setTagFilter}>
            <SelectTrigger className="h-9" aria-label="Filter by tag">
              <Tag className="size-4 text-slate-400" strokeWidth={2} aria-hidden />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Tags</SelectItem>
              {allTags.map((t) => (
                <SelectItem key={t} value={t}>
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="sf-scroll mt-3 flex-1 space-y-2 overflow-y-auto">
          {filtered.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-500">
              {notes.length === 0 ? "No notes yet." : "No notes match."}
            </p>
          ) : (
            filtered.map((note) => {
              const tags = parseNoteTags(note.tags);
              return (
                <button
                  key={note.id}
                  type="button"
                  onClick={() => setSelectedId(note.id)}
                  className={cn(
                    "block w-full rounded-xl border-2 p-3 text-left outline-none transition-colors focus-visible:ring-2 focus-visible:ring-sf-primary/40",
                    effectiveNoteId === note.id
                      ? "border-violet-200 bg-violet-50 dark:border-violet-900 dark:bg-slate-800"
                      : "border-transparent bg-slate-50 hover:border-slate-200 dark:bg-slate-800/50 dark:hover:border-slate-700",
                  )}
                >
                  {/* S77/AD7 (measured): 16px/600 slate-800 title — the ref
                      renders H3 here (its own heading-order laxity; axe flags
                      h1→h3), so the clone ships the a11y-clean H2 with the
                      identical computed styling. 12px slate-500 preview via
                      stripHtmlPreview; tag pill after the preview; NO
                      notebook/date line. */}
                  <h2 className="truncate text-base font-semibold text-slate-800 dark:text-slate-100">
                    {note.title}
                  </h2>
                  <p className="mt-1 truncate text-xs text-slate-500 dark:text-slate-400">
                    {stripHtmlPreview(note.content) || "Empty note"}
                  </p>
                  {tags.length > 0 && (
                    <p className="mt-1.5 flex flex-wrap gap-1">
                      {tags.map((tag) => (
                        <span
                          key={tag}
                          data-note-tag={tag}
                          className="rounded bg-slate-100 px-1.5 py-0.5 text-xs text-slate-600 dark:bg-slate-700 dark:text-slate-300"
                        >
                          {tag}
                        </span>
                      ))}
                    </p>
                  )}
                </button>
              );
            })
          )}
        </div>
      </aside>

      {/* Right pane — BARE (no card wrapper) */}
      <div className="flex min-w-0 flex-1 flex-col" aria-label="Note editor pane">
        {/* Mobile-only heading — the h1 lives in the desktop-only left pane
            (hidden md:flex), so the drawer flow still finds a "Notes" heading
            at 390px (S52-F) in EVERY notes-present state. Level 2 keeps the
            desktop h1 count pin intact. */}
        {notes.length > 0 && (
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 md:hidden">Notes</h2>
        )}
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
            <p className="text-sm text-slate-500">Select a note from the list.</p>
          </div>
        ) : (
          <div className="flex min-h-0 flex-1 flex-col">
            {/* Title row (S77/AD3 measured): 14px/700 title + the black
                square actions button + the gradient Save. */}
            <div className="flex items-center gap-2">
              <Input
                aria-label="Note title"
                placeholder="Note title..."
                value={selected.title}
                onChange={(e) => updateNote(selected.id, { title: e.target.value }).catch(() => {})}
                className="h-9 flex-1 border-none bg-transparent text-sm font-bold shadow-none focus-visible:ring-0 dark:bg-transparent"
              />
              <div className="flex shrink-0 items-center gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      type="button"
                      aria-label="Note actions"
                      className="flex size-9 items-center justify-center rounded-md bg-neutral-950 text-neutral-50 transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-sf-primary/40 focus-visible:outline-none dark:bg-neutral-800"
                    >
                      <MoreVertical className="size-4" strokeWidth={2} />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {notebooks.length > 0 && (
                      <div className="px-2 py-1.5">
                        <p className="mb-1 text-xs font-medium text-slate-500">Move to notebook</p>
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
                {/* S77/AD4 (measured): the ref's explicit Save — gradient +
                    floppy icon. Text stays WHITE (the ref's yellow-on-
                    gradient is its platform quirk); autosave keeps running
                    (superset — the ref discards unsaved content). */}
                <Button
                  type="button"
                  variant="gradient"
                  className="sf-gradient-shadow h-9 px-4"
                  onClick={saveNow}
                >
                  <Save className="size-4" strokeWidth={2} />
                  Save
                </Button>
              </div>
            </div>

            {/* Font row (S77/AD5 measured): "Font:" 12px/500 slate-500 +
                typeface select + the black Divider button (h-8, 6px radius). */}
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Font:</span>
              <Select value={font} onValueChange={(v) => setFont(v as EditorFont)}>
                <SelectTrigger className="h-7 w-28 text-xs" aria-label="Editor font">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sans">Sans</SelectItem>
                  <SelectItem value="serif">Serif</SelectItem>
                  <SelectItem value="mono">Mono</SelectItem>
                </SelectContent>
              </Select>
              <button
                type="button"
                onClick={() => editorRef.current?.insertDivider()}
                className="flex h-8 items-center gap-1 rounded-md bg-neutral-950 px-3 text-xs font-medium text-neutral-50 transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-sf-primary/40 focus-visible:outline-none dark:bg-neutral-800"
              >
                <Minus className="size-3" strokeWidth={2} />
                Divider
              </button>
            </div>

            {/* Tag row (S77/AD6 measured): dark pills (neutral-800 +
                neutral-50, 6px radius, 12px) + the "Add tag..." input. */}
            <div className="mt-2 flex flex-wrap items-center gap-2" aria-label="Note tags">
              {selectedTags.map((tag) => (
                <span
                  key={tag}
                  data-note-tag={tag}
                  className="inline-flex h-6 items-center gap-1 rounded-md bg-neutral-800 px-2 text-xs text-neutral-50 dark:bg-neutral-700"
                >
                  {tag}
                  <button
                    type="button"
                    aria-label={`Remove tag ${tag}`}
                    onClick={() => removeTag(tag)}
                    className="rounded-sm p-0.5 text-neutral-400 hover:text-neutral-50 focus-visible:ring-2 focus-visible:ring-sf-primary/40 focus-visible:outline-none"
                  >
                    <X className="size-3" strokeWidth={2} />
                  </button>
                </span>
              ))}
              <input
                aria-label="Add tag"
                placeholder="Add tag..."
                value={tagDraft}
                onChange={(e) => setTagDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addTag();
                  }
                }}
                className="h-7 w-32 rounded-md border border-neutral-800 bg-transparent px-2 text-sm text-slate-700 outline-none placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-sf-primary/40 dark:border-neutral-700 dark:text-slate-200"
              />
            </div>

            {/* The editor card (S77/AD2 measured): white rounded-2xl + 1px
                slate-200 — wraps the Quill toolbar strip + editor body. The
                sf-note-editor class scopes the measured Quill surface CSS
                (wins the cascade over Quill's own snow stylesheet). */}
            <div className="sf-note-editor mt-3 flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
              <QuillEditor
                key={selected.id}
                ref={editorRef}
                value={selected.content}
                onChange={onContentChange}
                font={font}
                className="min-h-0 flex-1"
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
                className="mt-2 flex items-center gap-1 text-xs font-medium text-slate-500 outline-none hover:text-slate-600 focus-visible:ring-2 focus-visible:ring-sf-primary/40"
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

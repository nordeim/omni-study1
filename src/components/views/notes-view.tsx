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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
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
import { EmptyState, Spinner } from "@/components/views/shared";
import {
  QuillEditor,
  type EditorFont,
  type QuillEditorHandle,
} from "@/components/views/quill-editor";
import {
  mutations,
  parseNoteTags,
  useDataStore,
  type NoteInput,
  type NotebookRow,
} from "@/lib/data";
import { ApiError } from "@/lib/api";
import { stripHtmlPreview } from "@/lib/text";
import { cn } from "@/lib/utils";

// S125/BZ14: the note leg carries no `editing` — the dead "Rename note"
// variant. All three setDialog sites were enumerated before narrowing:
// only {kind:"note", editing:null} (new note), {kind:"notebook",
// editing:null} (new notebook) and {kind:"notebook", editing:row} (rename
// notebook) ever fired; note titles edit through the debounced inline
// input (S122/BW3), so the unreachable updateNote branch is gone.
type DialogState =
  | { open: false }
  | { open: true; kind: "note" }
  | { open: true; kind: "notebook"; editing: NotebookRow | null };

// (parseNoteTags moved to src/lib/data.ts at S151/CZ1 — the single source
// the view rows AND the tags chain share; imported above.)

// S122/BW3 — the debounced note-title input. Owned as a KEY-REMOUNTED child
// (by note id, the BU1 pattern) so the draft resets naturally on note
// switch with NO set-state-in-effect; the pending PATCH flushes on unmount
// (the note-switch path — the QuillEditor's unmount-flush symmetry) and on
// an explicit Save (the imperative flush()). The pre-fix input PATCHed on
// EVERY keystroke with a full-collection refetch, on an input controlled
// only by store state — interleaved refetches snapped the visible text back
// mid-typing (and the reference persists the title on Save only, measured
// live: zero saves during 10+ s of typing).
interface NoteTitleInputHandle {
  /** Fire the pending PATCH immediately (the Save path). */
  flush(): void;
}

const TITLE_DEBOUNCE_MS = 600; // the editor's own autosave rhythm

const NoteTitleInput = React.forwardRef<NoteTitleInputHandle, {
  noteId: string;
  initialTitle: string;
  onPatch: (noteId: string, title: string) => void;
}>(function NoteTitleInput({ noteId, initialTitle, onPatch }, forwarded) {
  const [draft, setDraft] = React.useState(initialTitle);
  const timerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingRef = React.useRef<{ id: string; title: string } | null>(null);
  // The latest onPatch for the flush closures (a ref write in an effect —
  // the AH1 lint contract; the unmount flush must route through the
  // parent's CURRENT patchTitle, not a stale closure).
  const onPatchRef = React.useRef(onPatch);
  React.useEffect(() => {
    onPatchRef.current = onPatch;
  }, [onPatch]);

  const flush = React.useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    const pending = pendingRef.current;
    pendingRef.current = null;
    if (pending) onPatchRef.current(pending.id, pending.title);
  }, []);

  React.useImperativeHandle(forwarded, () => ({ flush }), [flush]);

  // The unmount flush — a note switch (the key change) or view exit must
  // not lose the last debounced edit.
  React.useEffect(() => () => flush(), [flush]);

  return (
    <Input
      aria-label="Note title"
      placeholder="Note title..."
      value={draft}
      onChange={(e) => {
        const value = e.target.value;
        setDraft(value);
        if (timerRef.current) clearTimeout(timerRef.current);
        pendingRef.current = { id: noteId, title: value };
        timerRef.current = setTimeout(() => {
          timerRef.current = null;
          flush();
        }, TITLE_DEBOUNCE_MS);
      }}
      className="h-9 flex-1 border-none bg-transparent text-sm font-bold shadow-none focus-visible:ring-0 dark:bg-transparent"
    />
  );
});

export function NotesView() {
  const notes = useDataStore((s) => s.notes);
  const notebooks = useDataStore((s) => s.notebooks);
  // S130/CE3: the loading gate — the shell pre-warms only the ACTIVE
  // view's collections; loadAll runs in the BACKGROUND, so navigating to
  // Notes mid-flight rendered "No notes yet" on in-flight data (the false
  // empty state). The tasks-view idiom (the 8 gated views' pattern).
  const loading = useDataStore((s) => s.loading);
  const createNote = mutations.createNote;
  const updateNote = mutations.updateNote;
  const deleteNote = mutations.deleteNote;
  const createNotebook = mutations.createNotebook;
  const updateNotebook = mutations.updateNotebook;
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
  // S152/DA1 (the S151 audit's B-L5): the delete double-fire latch — the
  // per-row in-flight set for BOTH delete handlers (notes + notebooks);
  // the Popover action sites close on click, so the handler latch alone
  // covers them; the finally removal keeps retry honest.
  const [deletingIds, setDeletingIds] = React.useState<ReadonlySet<string>>(new Set());
  // S77/AD: the editor's measured chrome state — the Font row typeface and
  // the tag-row draft.
  const [font, setFont] = React.useState<EditorFont>("sans");
  const [tagDraft, setTagDraft] = React.useState("");
  const editorRef = React.useRef<QuillEditorHandle | null>(null);
  // S78/AE2: one failure toast per autosave failure STREAK — the flag
  // resets on the first successful PATCH, so a sustained-offline typing
  // session toasts once instead of once per debounced burst.
  const autosaveFailedRef = React.useRef(false);
  // S80/AG6 (the s80 audit, M1): the streak is scoped to the note — this
  // ref mirrors the CURRENT selection (updated at every selection change:
  // selectNote + createNote, the only setSelectedId call sites) so a late
  // rejection from a note the user already left is ignored instead of
  // latching the flag and swallowing the NEXT note's first failure (the
  // AF3 symptom resurfacing through ordering) or toasting a lie ("the
  // note is still open" — it is not). Event-handler writes only, never
  // render-time mutation (the react-hooks lint contract).
  const selectedIdRef = React.useRef<string | null>(null);

  // S122/BW3: the title input is a KEY-REMOUNTED child component (by note
  // id) that owns its own draft + 600 ms debounce — the per-keystroke
  // PATCH + full-collection refetch on a store-controlled input snapped
  // the visible text back mid-typing (and the reference persists the
  // title on Save only, measured live). The child flushes its pending
  // PATCH on unmount (the note-switch path, the QuillEditor's symmetry)
  // and exposes flush() for the explicit Save. See NoteTitleInput below.
  const titleInputRef = React.useRef<NoteTitleInputHandle | null>(null);

  // The BT11 failed-rename streak contract (the settle branches keep the
  // AG6 selection-mirror gates — a departed note's rejection is ignored
  // outright, its success resets the streak only for the still-open note).
  const patchTitle = React.useCallback(
    (noteId: string, title: string) => {
      updateNote(noteId, { title })
        .then(() => {
          if (selectedIdRef.current === noteId) {
            autosaveFailedRef.current = false;
          }
        })
        .catch((err: unknown) => {
          if (selectedIdRef.current !== noteId) return;
          if (!autosaveFailedRef.current) {
            autosaveFailedRef.current = true;
            toast.error(
              err instanceof ApiError
                ? err.message
                : "Title not saved — check your connection and edit again.",
            );
          }
        });
    },
    // S129/CD3: `updateNote` joins the deps (the stable mutations member —
    // `const updateNote = mutations.updateNote` above; naming it is the
    // exhaustive-deps truth, no identity churn).
    [updateNote, toast],
  );

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

  // S81/AH1 (the s81 audit, M1): settle the selection mirror when the
  // selected note DEPARTS the collection (delete removes it — the
  // render-derived selection above falls back to null, but the mirror
  // kept the deleted id, so the departed note's late PATCH rejection
  // passed the AG6 guard, toasting the "still open" lie and re-latching
  // the streak flag). The delete flow mutates the collection, not the
  // selection — no event-handler write site exists, so the settlement
  // rides an effect. A ref write in an effect is allowed by the lint
  // contract (no set-state-in-effect).
  //
  // S82/AI2 (the s82 audit, L1): settle UNCONDITIONALLY. The S81 form
  // only ever CLEARED — a stale-closure clear (effectiveNoteId === null
  // from the prior commit, flushed after a newer handler write set the
  // ref to the just-clicked note) was never healed: the effect's
  // condition never re-fires for a non-null id, so every guard then saw
  // ref(null) !== selectedNote until the next selection change — the
  // actively-edited note's toasts were silently swallowed. The
  // unconditional settle keeps the AH1 clear semantics exactly (null →
  // null) AND re-syncs the mirror on every dep change, so the dep-change
  // re-run heals any stale clear that landed after a newer handler write.
  //
  // S83/AJ4 (the s83 audit, L1 — the honest acceptance): the HEAL itself
  // (a stale clear landing after a newer handler write, then healed by
  // the dep-change re-run) has NO deterministic pin — passive-effect
  // flush interleaving is not controllable from Playwright, and no unit
  // seam exists for an in-component ref mirror. The standing guard is the
  // PRESERVATION family (AH1a/AH2a/AH2b in parity-session7.spec.ts): the
  // departed-clear, departed-Save, and streak semantics must stay green
  // through any change here. A regression to a conditional settle would
  // pass those pins silently — this comment is the contract's record.
  React.useEffect(() => {
    selectedIdRef.current = effectiveNoteId;
  }, [effectiveNoteId]);

  const openNewNote = () => {
    setName("");
    setError("");
    setDialog({ open: true, kind: "note" });
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
    // S152/DA2 (the S151 audit's B-L6): the hand-guard — the noValidate
    // form's empty required field answers HERE with human copy (the
    // S127/CB17 files-view pattern), never the server's raw Zod issue
    // text. Both dialog kinds ride the same required name field (the
    // note title / the notebook name). Before setBusy: an early return
    // must not strand the busy latch.
    if (!name.trim()) {
      setError("Please enter a name.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      if (dialog.kind === "note") {
        // S125/BZ14: the note dialog is CREATE-only (titles rename via the
        // debounced inline input — the dead updateNote branch removed).
        const created = await createNote({ title: name, content: "", notebookId: notebookFilter === "all" ? "" : notebookFilter });
        setSelectedId(created ?? null);
        // S79/AF3: a freshly created note starts with a clean streak.
        // S80/AG6: …and owns the selection mirror from birth.
        selectedIdRef.current = created ?? null;
        autosaveFailedRef.current = false;
      } else {
        if (dialog.editing) {
          // S130/CE9: the rename rides the mutation seam
          // (mutations.updateNotebook — the BW8 single-source doctrine;
          // the inline twin duplicated it while the seam sat dead).
          await updateNotebook(dialog.editing.id, { name });
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
    if (deletingIds.has(id)) return;
    setDeletingIds((prev) => new Set(prev).add(id));
    try {
      await deleteNote(id);
      toast.success("Note deleted.");
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

  const removeNotebook = async (row: NotebookRow) => {
    if (deletingIds.has(row.id)) return;
    setDeletingIds((prev) => new Set(prev).add(row.id));
    try {
      await deleteNotebook(row.id);
      toast.success("Notebook deleted. Its notes are kept.");
    } catch (err: unknown) {
      toast.error(err instanceof ApiError ? err.message : "Delete failed.");
    } finally {
      setDeletingIds((prev) => {
        const next = new Set(prev);
        next.delete(row.id);
        return next;
      });
    }
  };

  const patchSelected = async (patch: Partial<NoteInput>) => {
    if (!selected) return;
    // S134/CI7b (audit B-L4, the AG6/AH2 surface-lie class): capture the
    // note id — a PATCH that settles after the user switched notes must
    // not toast onto the NEW note's surface (the title/content/Save
    // siblings already mirror through selectedIdRef).
    const noteId = selected.id;
    try {
      await updateNote(noteId, patch);
    } catch (err: unknown) {
      if (selectedIdRef.current !== noteId) return;
      toast.error(err instanceof ApiError ? err.message : "Save failed.");
    }
  };

  // ---- S77/AD: the editor's tag row + Save ----
  // parseNoteTags is a trivial JSON.parse — no memo (the React Compiler
  // rejects the optional-chained dependency, and the cost is nil).
  const selectedTags = selected ? parseNoteTags(selected.tags) : [];

  const addTag = () => {
    // The pane renders only with a selection; the guard satisfies the
    // type (the patchSelected idiom) and keeps the handler a no-op on a
    // departed note (nothing was lost).
    if (!selected) return;
    const tag = tagDraft.trim().replace(/^#/, "");
    setTagDraft("");
    if (!tag) return;
    // S150/CY3 (the S149/B-I4 honesty rider): the two real drops speak —
    // the draft was cleared BEFORE these guards, so a >24-char or
    // duplicate tag used to vanish with zero feedback (the "input
    // cleared, nothing happened, no reason" class). The empty case stays
    // a no-op (nothing was lost). Both toasts announce through the
    // aria-live stack (the S14 contract).
    if (tag.length > 24) {
      toast.error("Tags are limited to 24 characters.");
      return;
    }
    if (selectedTags.includes(tag)) {
      toast.error("That tag is already on this note.");
      return;
    }
    // S151/CZ1 (audit B-M1): the tags ride the per-note chain — the
    // updater form (the CX2 doctrine): this handler declares the effect
    // (add), the chain supplies the fresh POST-SETTLE base (the
    // render-snapshot absolute-array PATCH this replaces lost a rapid
    // second op — the remove computed from the pre-add base). The updater
    // is idempotent (the belt-and-braces dedupe): a double-Enter on the
    // same tag inside the window appends nothing when the fresh base
    // already carries it.
    // S161/DJ1 (the s161 audit B/F-1): and the transport failure speaks
    // too — the S151/CZ1 rewire dropped the pre-CZ error catch:
    // setNoteTags REJECTS to the caller by design (data.ts — "the CALLER
    // still gets the real rejection"), so an offline/flaky PATCH discarded
    // the rejection entirely — the draft was already cleared, nothing
    // landed in the store, no toast fired (the exact "input cleared,
    // nothing happened, no reason" class S150/CY3 fixed for these
    // handlers' validation guards, plus an unhandled promise rejection —
    // the S118/BS9 class). Both tag mutations now route through
    // mutateTags — the patchSelected shape (the AG6 departed-note guard):
    // the id is captured before the async op and the toast only lands if
    // the user hasn't switched notes.
    void mutateTags(selected.id, (tags) =>
      tags.includes(tag) ? tags : [...tags, tag]);
  };

  const removeTag = (tag: string) => {
    if (!selected) return; // the addTag guard's twin
    // S161/DJ1: the remove twin rides the same catch (see addTag).
    void mutateTags(selected.id, (tags) => tags.filter((t) => t !== tag));
  };

  const mutateTags = async (
    noteId: string,
    update: (tags: string[]) => string[],
  ) => {
    try {
      await mutations.setNoteTags(noteId, update);
    } catch (err: unknown) {
      // The AG6/AH2 surface-lie guard: a rejection that settles after the
      // user switched notes must not toast onto the NEW note's surface.
      if (selectedIdRef.current !== noteId) return;
      toast.error(err instanceof ApiError ? err.message : "Tag not saved — check your connection.");
    }
  };

  // The Quill wrapper debounces its own change events (autosave superset);
  // Save flushes immediately with the live editor content.
  const onContentChange = (html: string) => {
    if (!selected) return;
    // S80/AG6: capture the note this PATCH belongs to — the rejection (or
    // success) is only allowed to touch the streak if that note is STILL
    // the selected one when the promise settles (a mid-flight switch or
    // the unmount flush of a departed editor must not speak for the note
    // the user is now editing).
    const noteId = selected.id;
    updateNote(noteId, { content: html })
      .then(() => {
        if (selectedIdRef.current === noteId) autosaveFailedRef.current = false;
      })
      .catch((err: unknown) => {
        // S78/AE2: never swallow — a hung offline state must not let the
        // user believe the autosave superset persisted. One toast per
        // failure streak (the content stays in the editor as the retry
        // affordance — the S13 doctrine). S79/AF3 (the s79 audit, F2):
        // the streak flag resets on SELECTION CHANGE too — see
        // selectNote — so the next note's first failure always toasts.
        // S80/AG6 (the s80 audit, M1): a rejection for a DEPARTED note is
        // ignored outright — its editor (and the Save affordance with it)
        // is gone; it must neither latch the flag (swallowing the next
        // note's first failure) nor toast the "still open" lie.
        if (selectedIdRef.current !== noteId) return;
        if (!autosaveFailedRef.current) {
          autosaveFailedRef.current = true;
          toast.error(err instanceof ApiError ? err.message : "Autosave failed — the note is still open; use Save to retry.");
        }
      });
  };

  // S79/AF3: every selection change resets the autosave streak flag — a
  // different note's first failure must toast even while the previous
  // note's streak is still failing (the pre-fix flag latched across the
  // switch and silently swallowed the second note's failures).
  // S80/AG6: the selection mirror rides the same sites.
  const selectNote = (id: string) => {
    setSelectedId(id);
    selectedIdRef.current = id;
    autosaveFailedRef.current = false;
  };

  const saveNow = async () => {
    if (!selected) return;
    // S122/BW3: an explicit Save flushes the pending title FIRST — the
    // reference's Save persists the whole note, and a pending debounced
    // title must not be lost to a same-click content PATCH racing it.
    titleInputRef.current?.flush();
    // getContent() is null during the Quill load window — the ?? fallback
    // then carries the STORED content (S78/AE1: never PATCH "" over a
    // populated note from a Save raced against the dynamic import).
    const html = editorRef.current?.getContent() ?? selected.content;
    // S81/AH2 (the s81 audit, the departed-Save family): capture the note
    // this Save belongs to — BOTH settle branches are gated on the
    // selection mirror (a Save whose note the user already left must
    // neither toast onto the next note's surface nor unlatch ITS failure
    // streak: the late success branch toasting "Note saved." was a
    // surface lie, and its flag reset re-armed the departed swallow).
    const noteId = selected.id;
    try {
      await updateNote(noteId, { content: html });
      if (selectedIdRef.current !== noteId) return;
      // S80/AG6 (the s80 audit, L2): a successful explicit Save breaks the
      // failure streak too — the next autosave failure must toast again
      // (pre-fix only an autosave success or a note switch reset it).
      autosaveFailedRef.current = false;
      toast.success("Note saved.");
    } catch (err: unknown) {
      if (selectedIdRef.current !== noteId) return;
      toast.error(err instanceof ApiError ? err.message : "Save failed.");
    }
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-6">
      {/* Left pane */}
      <aside
        aria-label="Notes list pane"
        className="flex w-80 shrink-0 flex-col border-r border-slate-100 pr-6 dark:border-slate-800"
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
              <DropdownMenuItem onSelect={openNewNote}>
                <FileText className="size-4" strokeWidth={2} />
                New Note
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={openNewNotebook}>
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
        {/* S119/BT10 — notebook list management (edit/delete): the compact
            dropdown BELOW THE NOTEBOOK FILTER (its documented placement — it
            was previously a stray third flex child of the root row, a 130px
            orphan column at the view's right edge squeezing the editor
            pane). Shown on md+ (the aside itself is md-only chrome on
            mobile the drawer pattern owns the surface). */}
        {notebooks.length > 0 && (
          <div className="hidden md:block">
            {/* S125/BZ3: the notebook rows now live in a Popover, not a
                DropdownMenu. The old menu nested the Rename/Delete buttons
                inside role="menuitem" (a WAI-ARIA nested-interactive
                violation): menu arrow-keys focused the ITEM and Tab CLOSED
                the menu — both actions were mouse-only. The Popover keeps
                the menu's exact geometry (content classes mirror
                DropdownMenuContent's) while the actions become real tab
                stops; Escape closes and restores focus to the trigger. */}
            <Popover>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  // S130/CE9: the dark hover pair (the myday pair's twin).
                  className="mt-2 flex items-center gap-1 text-xs font-medium text-slate-500 dark:text-slate-400 outline-none hover:text-slate-600 dark:hover:text-slate-300 focus-visible:ring-2 focus-visible:ring-sf-primary/40"
                >
                  <Pencil className="size-3" strokeWidth={2} />
                  Manage notebooks
                </button>
              </PopoverTrigger>
              <PopoverContent
                align="start"
                className="flex w-auto min-w-[8rem] flex-col gap-0 overflow-hidden rounded-md border-border p-1 shadow-md data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95"
              >
                {notebooks.map((nb) => (
                  <div
                    key={nb.id}
                    className="flex items-center gap-2 rounded-sm px-2 py-1.5 text-sm"
                  >
                    <span className="flex-1">{nb.name}</span>
                    <button
                      type="button"
                      aria-label={`Rename ${nb.name}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        openEditNotebook(nb);
                      }}
                      className="rounded p-1 text-slate-400 outline-none hover:text-slate-600 focus-visible:ring-2 focus-visible:ring-sf-primary/40"
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
                      className="rounded p-1 text-slate-400 outline-none hover:text-red-500 focus-visible:ring-2 focus-visible:ring-sf-primary/40"
                    >
                      <Trash2 className="size-3" strokeWidth={2} />
                    </button>
                  </div>
                ))}
              </PopoverContent>
            </Popover>
          </div>
        )}
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
          {/* S130/CE3: the in-flight window renders the spinner, never the
              false "No notes yet." (a stale empty list is NOT an empty
              account). */}
          {loading && notes.length === 0 ? (
            <div className="flex justify-center py-8 text-sf-primary">
              <Spinner className="size-6" />
            </div>
          ) : filtered.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-500 dark:text-slate-400">
              {notes.length === 0 ? "No notes yet." : "No notes match."}
            </p>
          ) : (
            filtered.map((note) => {
              const tags = parseNoteTags(note.tags);
              return (
                <button
                  key={note.id}
                  type="button"
                  onClick={() => selectNote(note.id)}
                  className={cn(
                    "block w-full rounded-xl border-2 p-3 text-left outline-none transition-colors focus-visible:ring-2 focus-visible:ring-sf-primary/40",
                    effectiveNoteId === note.id
                      ? "border-sf-primary-edge bg-sf-primary-softest dark:border-sf-primary-edge-dark dark:bg-slate-800"
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
      <div role="group" className="flex min-w-0 flex-1 flex-col" aria-label="Note editor pane">
        {/* S78/AE6: the list pane now renders at ALL widths (measured on
            the ref at 390×844: the w-80 list + a squeezed right pane) — the
            h1 is reachable at every breakpoint, so the drawer-flow heading
            contract holds without the mobile-only h2 it previously needed. */}
        {/* S130/CE3: the main pane's own gate (the e2e pin holds BOTH
            empty-state sites). */}
        {loading && notes.length === 0 ? (
          <div className="sf-card flex flex-1 items-center justify-center text-sf-primary">
            <Spinner className="size-6" />
          </div>
        ) : notes.length === 0 ? (
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
            <p className="text-sm text-slate-500 dark:text-slate-400">Select a note from the list.</p>
          </div>
        ) : (
          <div className="flex min-h-0 flex-1 flex-col">
            {/* Title row (S77/AD3 measured): 14px/700 title + the black
                square actions button + the gradient Save. */}
            <div className="flex items-center gap-2">
              <NoteTitleInput
                ref={titleInputRef}
                key={selected.id}
                noteId={selected.id}
                initialTitle={selected.title}
                onPatch={patchTitle}
              />
              <div className="flex shrink-0 items-center gap-2">
                {/* S142/CQ3 (audit B-M1): the actions surface is a Popover,
                    not a DropdownMenu. The S140-era menu nested the
                    notebook-mover Select inside role="menu" — Radix
                    roving-focus only reaches DropdownMenuItem-family
                    elements and Tab closes the menu, so the mover was
                    keyboard-unreachable (a WCAG 2.1.1 Level A failure on a
                    real affordance) — the exact S125/BZ3 nested-interactive
                    class the notebooks-manage sweep caught, missed here.
                    The Popover keeps the menu's geometry (content classes
                    mirror DropdownMenuContent's) while the mover and the
                    Delete action become real tab stops; Escape closes and
                    restores focus to the trigger. */}
                <Popover>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      aria-label="Note actions"
                      className="flex size-9 items-center justify-center rounded-md bg-neutral-950 text-neutral-50 transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-sf-primary/40 focus-visible:outline-none dark:bg-neutral-800"
                    >
                      <MoreVertical className="size-4" strokeWidth={2} />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent
                    align="end"
                    className="flex w-auto min-w-[10rem] flex-col gap-1 overflow-hidden rounded-md border-border p-1 shadow-md data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-in-95"
                  >
                    {notebooks.length > 0 && (
                      <div className="px-2 py-1.5">
                        <p className="mb-1 text-xs font-medium text-slate-500 dark:text-slate-400">Move to notebook</p>
                        <Select
                          value={selected.notebookId ?? "none"}
                          onValueChange={(v) =>
                            patchSelected({ notebookId: v === "none" ? "" : v })
                          }
                        >
                          {/* S143/CR3: the mover is the one unlabeled combobox
                              in the tree (the sibling Selects carry aria-labels
                              or Label htmlFor pairs) — the exact surface CQ3
                              made keyboard-reachable gets its accessible name
                              (WCAG 4.1.2); the CQ3 e2e leg pins it by name. */}
                          <SelectTrigger
                            className="h-8 w-44"
                            aria-label="Move note to notebook"
                          >
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
                    <button
                      type="button"
                      onClick={() => removeNote(selected.id)}
                      className="relative flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm text-red-600 outline-none transition-colors hover:bg-accent focus-visible:ring-2 focus-visible:ring-sf-primary/40 focus-visible:outline-none dark:text-red-400"
                    >
                      <Trash2 className="size-4 shrink-0" strokeWidth={2} />
                      Delete note
                    </button>
                  </PopoverContent>
                </Popover>
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
            <div role="group" className="mt-2 flex flex-wrap items-center gap-2" aria-label="Note tags">
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

      {/* Mobile create FAB — the superset quick-action (S79/AF6: the
          comment below described the pre-AE6 reality; the list pane now
          renders at ALL widths and carries its own "New note menu" — the
          FAB remains as the one-tap affordance over the squeezed mobile
          editor pane). */}
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
                  ? "New note"
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
                className="sf-alert-red rounded-lg px-3 py-2 text-sm"
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

    </div>
  );
}

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
  Code,
  FileText,
  Minus,
  Notebook,
  Palette,
  Paperclip,
  Pencil,
  Pin,
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
import { Textarea } from "@/components/ui/textarea";
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
  type NoteAttachmentRow,
  type NoteInput,
  type NoteRow,
  type NotebookRow,
} from "@/lib/data";
import { ApiError } from "@/lib/api";
// S179/EC1: the note feature vocabularies ride validation.ts's single
// source (the enum-single-source census guards the import — the CA14/
// DI3 doctrine; the measured palette/kind/language values).
import {
  NOTE_COLORS,
  NOTE_KINDS,
  NOTE_LANGUAGES,
} from "@/lib/validation";
import { htmlToText, stripHtmlPreview } from "@/lib/text";
// S178/EB1: the view-mode prose gate (the S140/CO1 policy module — the
// same client-side sanitizeNoteHtmlDom the QuillEditor mount path uses;
// the legacy-row gate + the plain-text shape probe).
import { looksLikeHtml, sanitizeNoteHtmlDom } from "@/lib/note-html";
import { cn } from "@/lib/utils";

// S125/BZ14 + S177/EA1: the NOTE dialog is GONE — the reference's create
// flow (measured 2026-11-12, computed DOM) opens the INLINE DRAFT editor
// directly: no dialog, no POST until the explicit Save, the X discards.
// The dialog survives for the NOTEBOOK family only (create + rename,
// their own measured lineage). Note titles edit through the debounced
// inline input (S122/BW3).
type DialogState =
  | { open: false }
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
      // S182/EF2 (measured): px-0 kills the base's px-3 (the reference's
      // computed px 0 — the old 12px text-position drift) + text-xl
      // md:text-sm gives the reference's mobile 20px bold title (the
      // measured override tail).
      className="h-9 min-w-0 flex-1 border-none bg-transparent px-0 text-xl font-bold shadow-none focus-visible:ring-0 md:text-sm dark:bg-transparent"
    />
  );
});

// S179/EC1 — the CODING-note edit body: the measured textarea surface
// ("Write your code notes here...", no Quill, no Font row). Owned as a
// KEY-REMOUNTED child (by note id — the NoteTitleInput pattern) so the
// body resets naturally on note switch with NO set-state-in-effect; the
// pending debounced content PATCH flushes on unmount and on an explicit
// Save (the imperative flush() — the BW3 symmetry). The clone's autosave
// superset rides (the EB3 record: the reference's X exits LOCAL-only;
// the clone's content is already server-current).
interface CodeBodyHandle {
  /** Fire the pending content PATCH immediately (the Save path). */
  flush(): void;
}

const CodeBodyTextarea = React.forwardRef<CodeBodyHandle, {
  noteId: string;
  initialContent: string;
  onPatch: (noteId: string, content: string) => void;
}>(function CodeBodyTextarea({ noteId, initialContent, onPatch }, forwarded) {
  const [body, setBody] = React.useState(initialContent);
  const timerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingRef = React.useRef<{ id: string; content: string } | null>(null);
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
    if (pending) onPatchRef.current(pending.id, pending.content);
  }, []);

  React.useImperativeHandle(forwarded, () => ({ flush }), [flush]);

  React.useEffect(() => () => flush(), [flush]);

  return (
    <Textarea
      aria-label="Code note body"
      placeholder="Write your code notes here..."
      value={body}
      onChange={(e) => {
        const value = e.target.value;
        setBody(value);
        if (timerRef.current) clearTimeout(timerRef.current);
        pendingRef.current = { id: noteId, content: value };
        timerRef.current = setTimeout(() => {
          timerRef.current = null;
          flush();
        }, TITLE_DEBOUNCE_MS);
      }}
      className="min-h-0 flex-1 resize-none border-0 bg-transparent p-6 font-mono text-sm shadow-none outline-none focus-visible:ring-0 dark:bg-transparent"
    />
  );
});

// S179/EC1 — the note feature vocabulary types (validation.ts's const
// arrays are the single source; the local aliases keep the prop types
// readable without re-declaring the values).
type NoteColor = (typeof NOTE_COLORS)[number];
type NoteKind = (typeof NOTE_KINDS)[number];

// S179/EC2 (measured live 2026-11-13, computed DOM): the palette swatch
// hexes — the reference's 7-swatch popover (32×32 rounded-full buttons,
// inline background-color styles). The white default swatch carries
// #FFFFFF; the six tints are the measured hexes. The LIST ROW and the
// BODY CARD render the tint as the same inline style (the white default
// renders NO inline style — the class bg shows, measured).
const NOTE_COLOR_HEX: Record<NoteColor, string> = {
  white: "#FFFFFF",
  yellow: "#FEF3C7",
  red: "#FECACA",
  pink: "#FBCFE8",
  violet: "#DDD6FE",
  blue: "#BFDBFE",
  emerald: "#A7F3D0",
};

// S179/EC2: the shared palette trigger + popover — ONE component riding
// all three surfaces (the view toolbar, the edit toolbar, the draft
// toolbar — the reference carries the same 36px lucide-palette trigger
// and the same 7-swatch popover on each). The measured selection state:
// the CURRENT color's swatch carries border-violet-500 + scale-110 (the
// reference's own utility classes — unlike the S176 events-dialog
// inline-style measurement); the rest border-slate-200.
function NoteColorButton({
  value,
  onPick,
  label,
}: {
  value: string;
  onPick: (color: NoteColor) => void;
  label: string;
}) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={label}
          className="flex size-9 items-center justify-center rounded-md text-slate-500 outline-none transition-colors hover:bg-slate-100 hover:text-slate-600 focus-visible:ring-2 focus-visible:ring-sf-primary/40 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-300"
        >
          <Palette className="size-4" strokeWidth={2} />
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-auto p-2">
        <div role="group" aria-label="Note colors" className="flex items-center gap-2">
          {NOTE_COLORS.map((color) => (
            <button
              key={color}
              type="button"
              aria-label={`${color} note color`}
              onClick={() => onPick(color)}
              style={{ backgroundColor: NOTE_COLOR_HEX[color] }}
              className={cn(
                "size-8 rounded-full border-2 outline-none transition-transform focus-visible:ring-2 focus-visible:ring-sf-primary/40",
                value === color ? "border-violet-500 scale-110" : "border-slate-200",
              )}
            />
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}

// S180/ED (measured live 2026-11-13, the reference's Attach-File probe — the
// plan §3.3): the shared Attach row — ONE component riding the draft and
// the edit surface (the reference renders the identical anatomy on each).
// The measured shape: a `flex items-center gap-2 mb-4 flex-wrap` row whose
// FIRST child is a label-wrapped outline affordance (the paperclip icon +
// "Attach File", the hidden single-file input — NO `multiple`, NO
// `accept`), followed by the picked chips: the badge-family div
// (`inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs
// font-semibold text-foreground gap-1`) carrying `a.hover:underline`
// (target=_blank to the derived download url) and the X-remove. The
// reference's X is a BARE cursor-pointer svg (its own a11y laxity); the
// clone ships the aria-label BUTTON superset (the S178 lesson-4 posture).
function NoteAttachRow({
  attachments,
  onPick,
  onRemove,
  disabled,
}: {
  attachments: NoteAttachmentRow[];
  onPick: (file: File) => void;
  onRemove: (id: string) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex items-center gap-2 mb-4 flex-wrap">
      <label className="cursor-pointer">
        <span
          className="inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sf-primary/40 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-8 rounded-md px-3 text-xs text-foreground"
          aria-label="Attach file"
        >
          <Paperclip className="w-4 h-4 mr-2" strokeWidth={2} />
          Attach File
        </span>
        {/* The measured hidden single-file input: no `multiple`, no `accept`. */}
        <input
          type="file"
          className="hidden"
          disabled={disabled}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onPick(file);
            // Reset so re-picking the SAME file re-fires the change.
            e.target.value = "";
          }}
        />
      </label>
      {attachments.map((att) => (
        <div
          key={att.id}
          data-note-attachment={att.name}
          className="inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors text-foreground gap-1"
        >
          <a
            href={att.url}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline"
          >
            {att.name}
          </a>
          <button
            type="button"
            aria-label={`Remove attachment ${att.name}`}
            onClick={() => onRemove(att.id)}
            className="rounded-sm p-0.5 text-slate-400 outline-none hover:text-slate-600 focus-visible:ring-2 focus-visible:ring-sf-primary/40 dark:text-slate-500 dark:hover:text-slate-300"
          >
            <X className="w-3 h-3 cursor-pointer" strokeWidth={2} />
          </button>
        </div>
      ))}
    </div>
  );
}

// S179/EC1: the list row — extracted so the sectioned list (the Pinned /
// All Notes sections) renders ONE row component per note (the measured
// anatomy: the coding row's lucide-code lead, the pinned row's
// violet-filled lucide-pin on the right, the inline color tint, and the
// S77/AD7 certified title/preview/tags body).
function NoteListRow({
  note,
  selected,
  onSelect,
}: {
  note: NoteRow;
  selected: boolean;
  onSelect: (id: string) => void;
}) {
  const tags = parseNoteTags(note.tags);
  const tint = note.color !== "white" ? { backgroundColor: NOTE_COLOR_HEX[note.color as NoteColor] } : undefined;
  return (
    <button
      type="button"
      onClick={() => onSelect(note.id)}
      style={tint}
      className={cn(
        "block w-full rounded-xl border-2 p-3 text-left outline-none transition-colors focus-visible:ring-2 focus-visible:ring-sf-primary/40",
        selected
          ? "border-sf-primary-edge bg-sf-primary-softest dark:border-sf-primary-edge-dark dark:bg-slate-800"
          : "border-transparent bg-slate-50 hover:border-slate-200 dark:bg-slate-800/50 dark:hover:border-slate-700",
      )}
    >
      {/* S77/AD7 (measured): 16px/600 slate-800 title — the ref
          renders H3 here (its own heading-order laxity; axe flags
          h1→h3), so the clone ships the a11y-clean H2 with the
          identical computed styling. 12px slate-500 preview via
          stripHtmlPreview; tag pill after the preview; NO
          notebook/date line. S179/EC1: the coding row leads with the
          lucide-code icon (w-3 h-3 text-slate-400 — measured) and the
          pinned row carries the violet-filled pin on the right. */}
      <div className="flex items-start justify-between">
        <div className="flex min-w-0 items-center gap-2">
          {note.kind === "coding" && (
            <Code className="size-3 shrink-0 text-slate-400" strokeWidth={2} />
          )}
          <h2 className="truncate text-base font-semibold text-slate-800 dark:text-slate-100">
            {note.title}
          </h2>
        </div>
        {note.pinned && (
          <Pin className="size-4 shrink-0 fill-violet-500 text-violet-500" strokeWidth={2} />
        )}
      </div>
      <p className="mt-1 truncate text-xs text-slate-500 dark:text-slate-400">
        {stripHtmlPreview(note.content) || "Empty note"}
      </p>
      {tags.length > 0 && (
        <p className="flex flex-wrap gap-1 mt-2">
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
}

export function NotesView() {
  const notes = useDataStore((s) => s.notes);
  const notebooks = useDataStore((s) => s.notebooks);
  // S130/CE3: the loading gate — the shell pre-warms only the ACTIVE
  // view's collections; loadAll runs in the BACKGROUND, so navigating to
  // Notes mid-flight rendered "No notes yet" on in-flight data (the false
  // empty state). The tasks-view idiom (the 8 gated views' pattern).
  const loading = useDataStore((s) => s.loading);
  const createNote = mutations.createNote;
  // S180/ED: the staged upload mutation (the pick's immediate POST — the
  // reference's own measured posture).
  const uploadNoteAttachment = mutations.uploadNoteAttachment;
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
  // S177/EA1 — the inline-draft create state (the reference's measured
  // flow: "New Note" renders the draft editor INLINE — no dialog, no POST
  // until the explicit Save, the X discards, no row until the Save lands).
  // Pure client state; the wire's createNote POST rides the Save only.
  // draftSeq keys the Quill remount so a discarded-then-reopened draft
  // starts from a BLANK editor, not the prior draft's leftover instance.
  // S179/EC1: the draft carries the feature columns — kind (text/coding),
  // language (the coding draft's own JavaScript initial — the UI owns the
  // default, the reference's select default), and color (the draft
  // toolbar's palette pick; white renders no tint).
  const [draft, setDraft] = React.useState<{
    title: string;
    content: string;
    tags: string[];
    notebookId: string;
    kind: NoteKind;
    language: (typeof NOTE_LANGUAGES)[number];
    color: NoteColor;
    // S180/ED: the draft's STAGED attachments — the pick uploads
    // immediately (the staged row + its derived url); the Save POST
    // binds the list; the X removes LOCALLY (the measured zero-network
    // posture — the removal persists through the Save's array).
    attachments: NoteAttachmentRow[];
  } | null>(null);
  const [draftSeq, setDraftSeq] = React.useState(0);
  const [draftError, setDraftError] = React.useState("");
  // S178/EB — the view/edit MODE SPLIT (the s178 measured port: the
  // reference's existing-note editor opens in VIEW mode — the disabled
  // title + the [Edit][trash] row + the read-only prose body; "Edit"
  // switches to the edit toolbar; the X exits back to view; the Save
  // returns to view). Pure client state — every selection change and
  // every successful Save re-opens VIEW (the measured per-note default);
  // the draft never touches it (the draft overlays; X restores the
  // prior pane state).
  const [editing, setEditing] = React.useState(false);
  // S180/ED: the EDIT surface's working attachment list — seeded from the
  // note's bound rows on the Edit click; the pick stages NEW rows; the X
  // removes LOCALLY (the measured zero-network posture); the Save PATCH
  // binds the whole list (the removal leg rides the authoritative array).
  // Null = not editing (the working list exists only inside the edit
  // session; the next Edit re-seeds from the fresh store row).
  const [editStaged, setEditStaged] = React.useState<NoteAttachmentRow[] | null>(null);
  // S152/DA1 (the S151 audit's B-L5): the delete double-fire latch — the
  // per-row in-flight set for BOTH delete handlers (notes + notebooks);
  // the Popover action sites close on click, so the handler latch alone
  // covers them; the finally removal keeps retry honest.
  const [deletingIds, setDeletingIds] = React.useState<ReadonlySet<string>>(new Set());
  // S77/AD: the editor's measured chrome state — the Font row typeface and
  // the tag-row draft.
  const [font, setFont] = React.useState<EditorFont>("default");
  const [tagDraft, setTagDraft] = React.useState("");
  const editorRef = React.useRef<QuillEditorHandle | null>(null);
  // S177/EA1: the DRAFT's own editor handle (the Divider button's
  // insert-divider source — the draft's Quill instance, kept separate
  // from the selected note's editorRef).
  const draftEditorRef = React.useRef<QuillEditorHandle | null>(null);
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
  // S179/EC1: the coding note's debounced textarea handle (the BW3
  // symmetry — saveNow flushes the pending content PATCH on the explicit
  // Save; the unmount flush covers the note-switch path).
  const codeBodyRef = React.useRef<CodeBodyHandle | null>(null);

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
          // S166/DP3 (the s166 audit B/L-2): the content leg matches the
          // RENDERED text (the preview contract — what the row shows is
          // what the query matches), never the raw Quill HTML: the
          // raw-source search false-matched tag names ("strong") and
          // the single letter "p" inside every <p> wrapper. Plain-text
          // notes pass through htmlToText byte-identically, so the
          // legacy/seeded behavior is unchanged. The reference's own
          // search is title-only (measured s166, the residue-zero
          // probe) — this title+rendered-content form is the kept
          // SUPERSET.
          return (
            n.title.toLowerCase().includes(q) ||
            htmlToText(n.content).toLowerCase().includes(q)
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

  // S177/EA1: the reference's create affordance — the INLINE DRAFT (the
  // measured no-dialog flow). The notebook defaulting the dialog carried
  // rides: the active notebook filter pre-selects the draft's notebook
  // (the reference's "None" select — the empty-filter equivalent).
  // S179/EC1: the draft carries the feature columns — the kind rides the
  // entry point (the header dropdown's New Note / New Coding Note items,
  // the reference's measured A-1 order); the coding draft's language
  // starts at the reference's own select default (JavaScript — the UI
  // owns the initial); color starts at the white default (no tint).
  const openDraft = (kind: NoteKind = "text") => {
    setDraft({
      title: "",
      content: "",
      tags: [],
      notebookId: notebookFilter === "all" ? "" : notebookFilter,
      kind,
      language: "JavaScript",
      color: "white",
      // S180/ED: every draft session starts with NO staged rows.
      attachments: [],
    });
    setDraftSeq((n) => n + 1);
    setDraftError("");
  };

  // S179/EC1: the view-toolbar pin toggle (the measured instant toggle —
  // the reference fires the PATCH on the click; the refetch re-renders
  // the sections). The superset aria-label pair rides the unlabeled
  // icon-only reference (the S178 lesson-4 posture).
  const togglePin = (note: NoteRow) => {
    void updateNote(note.id, { pinned: !note.pinned }).catch((err: unknown) => {
      if (selectedIdRef.current !== note.id) return;
      toast.error(err instanceof ApiError ? err.message : "Pin not saved — check your connection.");
    });
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
    // text. The notebook dialog rides the required name field. Before
    // setBusy: an early return must not strand the busy latch.
    if (!name.trim()) {
      setError("Please enter a name.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      // S177/EA1: the note branch is GONE (the draft owns note creation
      // now); the notebook family keeps the dialog — create + rename.
      if (dialog.editing) {
        // S130/CE9: the rename rides the mutation seam
        // (mutations.updateNotebook — the BW8 single-source doctrine;
        // the inline twin duplicated it while the seam sat dead).
        await updateNotebook(dialog.editing.id, { name });
      } else {
        await createNotebook({ name });
      }
      setDialog({ open: false });
    } catch (err: unknown) {
      setError(err instanceof ApiError ? err.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  };

  // S177/EA1 — the draft's Save: the ONLY persistence point of the create
  // flow (the measured no-autosave-during-draft contract: no POST fires
  // until this handler runs).
  const saveDraft = async () => {
    if (busy || !draft) return;
    // S152/DA2 lineage (the EA1c pin owns the record): the empty-title
    // Save answers HERE with the human copy — the reference's measured
    // behavior is a SILENT no-op (the adjudicated superset, never a POST).
    if (!draft.title.trim()) {
      setDraftError("Please enter a name.");
      return;
    }
    setBusy(true);
    setDraftError("");
    try {
      // S179/EC1: the feature columns ride the create POST — kind +
      // language (the coding draft's select state) + color (the draft
      // toolbar's palette pick; white is the schema default anyway — the
      // explicit ride keeps the draft's picked tint truthful).
      // S180/ED: the staged attachments ride the SAME POST — the measured
      // wire carries attachments: [{name, url}] on the Save (the bind
      // sets the noteId on the staged rows).
      const created = await createNote({
        title: draft.title,
        content: draft.content,
        tags: JSON.stringify(draft.tags),
        notebookId: draft.notebookId,
        kind: draft.kind,
        ...(draft.kind === "coding" ? { language: draft.language } : {}),
        ...(draft.color !== "white" ? { color: draft.color } : {}),
        attachments: draft.attachments.map(({ name, url }) => ({ name, url })),
      });
      setDraft(null);
      setSelectedId(created ?? null);
      // S79/AF3: a freshly created note starts with a clean streak.
      // S80/AG6: …and owns the selection mirror from birth.
      selectedIdRef.current = created ?? null;
      autosaveFailedRef.current = false;
      // S178/EB: the created note opens in VIEW mode (the measured
      // post-Save state — the editor continues on the saved note in
      // its read-only form).
      setEditing(false);
    } catch (err: unknown) {
      setDraftError(err instanceof ApiError ? err.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  };

  // S177/EA1 — the draft's tag row (the measured "Add tag..." idiom; the
  // tags land in the create POST — the wire's JSON string, the PATCH
  // path's own format).
  const addDraftTag = () => {
    const t = tagDraft.trim().replace(/^#/, "");
    if (!t || !draft || draft.tags.includes(t)) {
      setTagDraft("");
      return;
    }
    setDraft((d) => (d ? { ...d, tags: [...d.tags, t] } : d));
    setTagDraft("");
  };

  const removeDraftTag = (tag: string) => {
    setDraft((d) => (d ? { ...d, tags: d.tags.filter((x) => x !== tag) } : d));
  };

  // ---- S180/ED: the Attach-File handlers --------------------------------
  //
  // The pick uploads IMMEDIATELY (the measured wire: the reference POSTs
  // on the pick; the staged row answers {id, name, url}) and appends to
  // the target list. One toast per failure (the upload rejection names
  // the file's failure, not the note's — the draft's list and the edit's
  // working list are the two targets, the same handler serving each).
  const pickNoteAttachment = async (
    target: "draft" | "edit",
    file: File,
  ) => {
    try {
      const staged = await uploadNoteAttachment(file);
      if (target === "draft") {
        setDraft((d) =>
          d ? { ...d, attachments: [...d.attachments, staged] } : d);
      } else {
        setEditStaged((list) => [...(list ?? []), staged]);
      }
    } catch (err: unknown) {
      toast.error(
        err instanceof ApiError
          ? err.message
          : "Upload failed — check your connection and try again.",
      );
    }
  };

  // The X-remove is LOCAL (the measured zero-network posture — the S178
  // local-state family): the removal persists through the Save's
  // authoritative array, never on the click.
  const removeDraftAttachment = (id: string) => {
    setDraft((d) =>
      d ? { ...d, attachments: d.attachments.filter((a) => a.id !== id) } : d);
  };

  const removeEditAttachment = (id: string) => {
    setEditStaged((list) => (list ?? []).filter((a) => a.id !== id));
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

  // S178/EB1: the view-mode prose body — the stored content through the
  // S140/CO1 client gate (the same sanitizeNoteHtmlDom the QuillEditor
  // mount path rides — the legacy-row render gate), then the shape probe:
  // HTML rows render as the sanitized innerHTML (the reference's
  // .prose.prose-slate.note-content anatomy), plain-text rows (the seed's
  // legacy form) render as a React-escaped whitespace-pre-wrap paragraph.
  // Computed for the VIEW branch only — the edit branch mounts Quill.
  // NO memo — the React Compiler rejects the derived-selection dependency
  // (the parseNoteTags precedent two lines up); the S140 walk is O(content)
  // and runs only on this component's own re-renders.
  const viewBody = (() => {
    if (!selected) return { html: "", text: "" };
    const clean = sanitizeNoteHtmlDom(selected.content);
    return { html: looksLikeHtml(clean) ? clean : "", text: clean };
  })();

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
    // S178/EB: every selection change re-opens VIEW (the measured
    // per-note default — the reference's editor opens each note in
    // view mode).
    setEditing(false);
  };

  const saveNow = async () => {
    if (!selected) return;
    // S122/BW3: an explicit Save flushes the pending title FIRST — the
    // reference's Save persists the whole note, and a pending debounced
    // title must not be lost to a same-click content PATCH racing it.
    titleInputRef.current?.flush();
    // S81/AH2 (the s81 audit, the departed-Save family): capture the note
    // this Save belongs to — BOTH settle branches are gated on the
    // selection mirror (a Save whose note the user already left must
    // neither toast onto the next note's surface nor unlatch ITS failure
    // streak: the late success branch toasting "Note saved." was a
    // surface lie, and its flag reset re-armed the departed swallow).
    const noteId = selected.id;
    try {
      if (selected.kind === "coding") {
        // S179/EC1: the coding note's debounced textarea flush carries
        // the latest content (the BW3 symmetry); the coding Save rides
        // the flush's PATCH — its own content PATCH would race the flush
        // with a STALE store read (the refetch lands after the flush).
        // With nothing pending the flush is a no-op and the content is
        // already server-current (the autosave superset, the EB3 record).
        codeBodyRef.current?.flush();
      } else {
        // getContent() is null during the Quill load window — the ??
        // fallback then carries the STORED content (S78/AE1: never PATCH
        // "" over a populated note from a Save raced against the dynamic
        // import).
        const html = editorRef.current?.getContent() ?? selected.content;
        await updateNote(noteId, { content: html });
      }
      // S180/ED: the working attachment list rides the Save (BOTH kinds —
      // a SEPARATE leg after the content, because the coding flush owns
      // the content PATCH): the authoritative array binds — new staged
      // rows join, locally-removed rows leave (the measured X-remove
      // posture persists HERE, never on the click). Null (the not-editing
      // guard) never reaches here — saveNow only runs from the edit
      // surface.
      if (editStaged !== null) {
        await updateNote(noteId, {
          attachments: editStaged.map(({ name, url }) => ({ name, url })),
        });
      }
      if (selectedIdRef.current !== noteId) return;
      // S80/AG6 (the s80 audit, L2): a successful explicit Save breaks the
      // failure streak too — the next autosave failure must toast again
      // (pre-fix only an autosave success or a note switch reset it).
      autosaveFailedRef.current = false;
      // S178/EB2: a successful Save returns to VIEW (the measured
      // Save→view contract — the reference's editor lands in its
      // read-only form after the PUT). A FAILURE stays in edit — the
      // retry affordance (the reference's failure path is unmeasured;
      // the error toast is the existing pinned superset).
      setEditing(false);
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
              <DropdownMenuItem onSelect={() => openDraft("text")}>
                <FileText className="size-4" strokeWidth={2} />
                New Note
              </DropdownMenuItem>
              {/* S179/EC1 (measured A-1): the dropdown's MIDDLE item —
                  the coding-note entry (the 14-option Language select +
                  the textarea body + the code badge). */}
              <DropdownMenuItem onSelect={() => openDraft("coding")}>
                <Code className="size-4" strokeWidth={2} />
                New Coding Note
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

        {/* S179/EC1 (measured A-5): the SECTIONED list — the reference's
            scroll container renders a "Pinned" section (only when pinned
            notes exist) above the "All Notes" section; each section header
            is the 12px/600 slate-500 UPPERCASE label and each section body
            is its own space-y-2. */}
        <div className="sf-scroll mt-3 flex-1 space-y-4 overflow-y-auto">
          {/* S130/CE3: the in-flight window renders the spinner, never the
              false "No notes yet." (a stale empty list is NOT an empty
              account). */}
          {loading && notes.length === 0 ? (
            <div
              className="flex justify-center py-8 text-sf-primary"
              role="status"
              aria-label="Loading notes"
              /* S166/DP2 (the s166 audit B/L-1): the CE3 loading gate
                 announces itself (role="status" — the DM2 assignments/DL2
                 exams/DK4 events-calendar/DN2 timetable precedent; the
                 Spinner itself is aria-hidden, so the unlabeled div was
                 silent to assistive tech during the in-flight window).
                 The label distinguishes this LIST-pane region from the
                 main-pane gate below (the calendar's two-gate
                 precedent — both gates can render simultaneously during
                 the initial in-flight window). */
            >
              <Spinner className="size-6" />
            </div>
          ) : notes.length === 0 ? (
            /* S177/EA3 — the measured placement: the reference's empty
               state lives in the LIST pane (the 80×80 gradient tile +
               "No notes yet" + the measured SHORT hint + the "New Note"
               gradient CTA); the right pane carries its own no-selection
               state. The shared EmptyState idiom renders it — the h2
               over the reference's h3 is the recorded heading-laxity
               deviation (the S77/AD7 precedent class), the geometry and
               copy are the measured values. */
            <EmptyState
              icon={BookOpen}
              title="No notes yet"
              hint="Create your first note"
              cta={
                <Button type="button" variant="gradient" className="sf-gradient-shadow-lg" onClick={() => openDraft("text")}>
                  <Plus className="size-4" strokeWidth={2} />
                  New Note
                </Button>
              }
            />
          ) : filtered.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-500 dark:text-slate-400">
              No notes match.
            </p>
          ) : (
            <React.Fragment>
              {/* S179/EC1 (measured A-5): pinned-first — the pinned rows
                  render in their own section ABOVE the rest (each section
                  keeps the updatedAt-desc order the filtered memo sorts);
                  the "Pinned" section disappears when no note is pinned. */}
              {filtered.some((n) => n.pinned) && (
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">
                    Pinned
                  </p>
                  <div className="space-y-2">
                    {filtered
                      .filter((n) => n.pinned)
                      .map((note) => (
                        <NoteListRow
                          key={note.id}
                          note={note}
                          selected={effectiveNoteId === note.id}
                          onSelect={selectNote}
                        />
                      ))}
                  </div>
                </div>
              )}
              <div>
                <p className="mb-2 text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">
                  All Notes
                </p>
                <div className="space-y-2">
                  {filtered
                    .filter((n) => !n.pinned)
                    .map((note) => (
                      <NoteListRow
                        key={note.id}
                        note={note}
                        selected={effectiveNoteId === note.id}
                        onSelect={selectNote}
                      />
                    ))}
                </div>
              </div>
            </React.Fragment>
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
          <div
            className="sf-card flex flex-1 items-center justify-center text-sf-primary"
            role="status"
            aria-label="Loading note editor"
            /* S166/DP2 (the s166 audit B/L-1): the MAIN-pane gate's own
               aria contract (the DM2/DL2/DK4/DN2 precedent shape — the
               sibling list-pane gate above carries "Loading notes";
               the differentiated label distinguishes the two
               simultaneously-renderable status regions). */
          >
            <Spinner className="size-6" />
          </div>
        ) : draft ? (
          /* S177/EA1 — the INLINE DRAFT (the reference's measured create
             flow: no dialog, no POST until the explicit Save, the X
             discards). The draft overlays the selection state — X
             restores whatever was underneath (the measured discard
             returns the pane to its prior state). */
          <div className="flex min-h-0 flex-1 flex-col">
            {/* Header row (S182/EF1 measured): the reference's ONE row —
                `flex items-center justify-between mb-4` — the title input
                LEFT (flex-1), [notebook select][palette][Save][X] RIGHT
                (shrink-0); the row's mb-4 IS the 16px gap to the Font row
                (the s181 probes' titleRow leg walked up looking for
                flex-wrap and found nothing — the header row never carried
                it; the S182 probe family records the full ancestor chain). */}
            <div className="flex items-center justify-between mb-4">
              {/* S182/EF2 (measured): the reference's title input is its
                  platform's shared Input base (py-1, text-foreground,
                  placeholder:text-muted-foreground) with the override tail
                  `text-xl font-bold border-0 px-0 focus-visible:ring-0
                  flex-1 min-w-0 md:text-sm` — px 0 (no horizontal padding),
                  14px/700 at ≥md, 20px/700 below md (text-xl). The bespoke
                  slate tokens + placeholder:font-normal drop (the reference
                  renders the bold placeholder; its colors are the base
                  tokens — the dark-mode computed rgb(250,250,250)
                  verified identical). */}
              <Input
                type="text"
                aria-label="Note title"
                placeholder="Note title..."
                value={draft.title}
                onChange={(e) =>
                  setDraft((d) => (d ? { ...d, title: e.target.value } : d))
                }
                className="min-w-0 flex-1 border-0 px-0 text-xl font-bold focus-visible:ring-0 md:text-sm"
              />
              <div className="flex shrink-0 items-center gap-2">
                {/* S179/EC1 (measured A-2): the CODING draft's Language
                    select (w-32, the 14-option vocabulary, JavaScript
                    initial — the UI owns the default) — FIRST in the
                    toolbar, before the notebook select. */}
                {draft.kind === "coding" && (
                  <Select
                    value={draft.language}
                    onValueChange={(v) =>
                      setDraft((d) => (d ? { ...d, language: v as (typeof NOTE_LANGUAGES)[number] } : d))
                    }
                  >
                    <SelectTrigger className="h-9 w-32" aria-label="New coding note language">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {NOTE_LANGUAGES.map((lang) => (
                        <SelectItem key={lang} value={lang}>
                          {lang}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                {/* The measured notebook select (w-32, "None" default) —
                    the draft's notebook assignment; the a11y label is the
                    clone's superset over the reference's unlabeled
                    combobox (the CQ3/CR3 precedent class). */}
                <Select
                  value={draft.notebookId || "none"}
                  onValueChange={(v) =>
                    setDraft((d) => (d ? { ...d, notebookId: v === "none" ? "" : v } : d))
                  }
                >
                  <SelectTrigger className="h-9 w-32" aria-label="New note notebook">
                    <SelectValue placeholder="None" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {notebooks.map((nb) => (
                      <SelectItem key={nb.id} value={nb.id}>
                        {nb.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {/* S179/EC2 (measured A-3): the draft toolbar's palette —
                    the shared 36px trigger + the 7-swatch popover (the
                    pick rides the draft's own color; the Save POSTs it). */}
                <NoteColorButton
                  value={draft.color}
                  onPick={(color) => setDraft((d) => (d ? { ...d, color } : d))}
                  label="New note color"
                />
                <Button
                  type="button"
                  variant="gradient"
                  className="sf-gradient-shadow h-9 px-4"
                  disabled={busy}
                  onClick={saveDraft}
                >
                  {/* S182/EF3 (measured): the reference's Save icon carries
                      its OWN mr-2 on top of the Button base's gap-2 —
                      98 = px-4 (16×2) + icon 16 + mr-2 8 + gap-2 8 +
                      "Save" 34. The pre-port clone computed 90. */}
                  <Save className="mr-2 size-4" strokeWidth={2} />
                  {busy ? "Saving…" : "Save"}
                </Button>
                {/* S182/EF4 (measured): the X is the reference's GHOST
                    anatomy — borderless (the S178-era "icon-only outline"
                    record is superseded by the 2026-11-13 live measurement:
                    border 0px, px-4 py-2, 14px/500, 48×36), no background.
                    The aria-label stays (the clone's a11y superset over the
                    reference's unlabeled icon button). */}
                <Button
                  type="button"
                  variant="ghost"
                  className="h-9 px-4"
                  aria-label="Discard new note"
                  onClick={() => setDraft(null)}
                >
                  <X className="size-4" strokeWidth={2} />
                </Button>
              </div>
            </div>
            {draftError && (
              <div role="alert" className="sf-alert-red mt-2 rounded-lg px-3 py-2 text-sm">
                {draftError}
              </div>
            )}
            {/* Font row (S77/AD5 lineage, B-8 re-measured 2026-11-13 —
                the reference's strip anatomy): the bg-slate-50 rounded-lg
                strip with gap-3, the "Font:" label + the w-32 h-8 select
                inside a gap-2 wrapper, the h-6 w-px bg-slate-200 separator,
                and the shadcn OUTLINE Divider (the S77 "black" record was
                the dark-mode computed artifact — corrected by the
                light-mode measurement). S179/EC1 (measured A-2): the CODING
                draft carries NO Font row, NO Divider — the reference's
                coding editor is the textarea surface only. */}
            {draft.kind === "text" && (
              <div className="flex items-center gap-3 mb-4 p-3 bg-slate-50 rounded-lg flex-wrap dark:bg-slate-800/50">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500 font-medium dark:text-slate-400">Font:</span>
                  <Select value={font} onValueChange={(v) => setFont(v as EditorFont)}>
                    <SelectTrigger className="h-8 w-32" aria-label="Editor font">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="default">Default</SelectItem>
                      <SelectItem value="serif">Serif</SelectItem>
                      <SelectItem value="sans">Sans-serif</SelectItem>
                      <SelectItem value="mono">Monospace</SelectItem>
                      <SelectItem value="cursive">Cursive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="h-6 w-px bg-slate-200 dark:bg-slate-600" aria-hidden />
                <Button
                  type="button"
                  variant="outline"
                  className="h-8 rounded-md px-3 text-xs gap-1"
                  onClick={() => draftEditorRef.current?.insertDivider()}
                >
                  <Minus className="size-4" strokeWidth={2} />
                  Divider
                </Button>
              </div>
            )}
            {/* Tag row (S181/EE — the B-8-family port, measured
                2026-11-13): the reference's wrapper `flex flex-wrap
                items-center gap-2 mb-4` (the mb-4 axis — the editor pane is
                a flex column so margins ADD; the old mt-2 axis computed the
                24px font→tag gap and the 0px tag→attach flush) + the
                Badge-secondary pill anatomy + the shadcn Input (w-24 h-7,
                border-input) + the ghost add button (the measured
                functional gap — the click path alongside Enter). */}
            <div role="group" className="flex flex-wrap items-center gap-2 mb-4" aria-label="New note tags">
              {draft.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center rounded-md border border-transparent gap-1 bg-neutral-800 px-2.5 py-0.5 text-xs font-semibold text-neutral-50"
                >
                  {tag}
                  <button
                    type="button"
                    aria-label={`Remove tag ${tag}`}
                    onClick={() => removeDraftTag(tag)}
                    className="rounded-sm p-0.5 text-neutral-400 hover:text-neutral-50 focus-visible:ring-2 focus-visible:ring-sf-primary/40 focus-visible:outline-none"
                  >
                    <X className="size-3" strokeWidth={2} />
                  </button>
                </span>
              ))}
              {/* S181/EE (measured): the input-group `flex items-center
                  gap-1` — the shadcn Input (w-24 h-7, border-input — the
                  S5 form-control palette) + the ghost add button (h-7,
                  Plus size-4 — the reference's own [&_svg]:size-4 override
                  wins its w-3 class, so the icon renders 16px and the
                  button computes 40px). The Enter path stays; the button
                  ADDS the click path. */}
              <div className="flex items-center gap-1">
                <Input
                  aria-label="Add tag"
                  placeholder="Add tag..."
                  value={tagDraft}
                  onChange={(e) => setTagDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addDraftTag();
                    }
                  }}
                  className="w-24 h-7"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-7"
                  aria-label="Add tag button"
                  disabled={!tagDraft.trim()}
                  onClick={addDraftTag}
                >
                  <Plus className="size-4" strokeWidth={2} />
                </Button>
              </div>
            </div>
            {/* S180/ED (measured draft row order): the Attach row AFTER the
                tag row, BEFORE the editor card — the label-wrapped outline
                affordance + the staged chips; the pick POSTs immediately;
                the Save's create POST binds the list. */}
            <NoteAttachRow
              attachments={draft.attachments}
              onPick={(file) => void pickNoteAttachment("draft", file)}
              onRemove={removeDraftAttachment}
            />
            {/* The editor card (the measured white rounded-2xl card wrapping
                the body) — keyed by the draft sequence so every draft
                session starts BLANK. onChange writes the draft content
                (the Save's POST source — the measured no-autosave contract:
                no POST fires while typing). S179/EC1/EC2 (measured A-2/A-7):
                the CODING draft's body is the plain textarea (no Quill, no
                toolbar strip); a picked palette color tints the card inline
                (white — the default — renders no tint, measured). */}
            <div
              className="sf-note-editor flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900"
              style={draft.color !== "white" ? { backgroundColor: NOTE_COLOR_HEX[draft.color] } : undefined}
            >
              {draft.kind === "coding" ? (
                <Textarea
                  aria-label="Code note body"
                  placeholder="Write your code notes here..."
                  value={draft.content}
                  onChange={(e) =>
                    setDraft((d) => (d ? { ...d, content: e.target.value } : d))
                  }
                  className="min-h-0 flex-1 resize-none border-0 bg-transparent p-6 font-mono text-sm shadow-none outline-none focus-visible:ring-0 dark:bg-transparent"
                />
              ) : (
                <QuillEditor
                  key={`draft-${draftSeq}`}
                  ref={draftEditorRef}
                  value=""
                  onChange={(html) => setDraft((d) => (d ? { ...d, content: html } : d))}
                  font={font}
                  className="min-h-0 flex-1"
                />
              )}
            </div>
          </div>
        ) : !selected ? (
          /* S177/EA3 — the measured no-selection state: the reference's
             right pane carries its OWN affordance (the same 80×80 tile +
             "Select a note" + "Choose a note from the sidebar or create a
             new one"), rendered BARE (no sf-card — the measured pane; the
             S8 pin's bg/border contract). The old 0-notes branch retired
             with the empty state's move to the list pane.
             S177/EA3b — the mobile-squeeze guard: at 390 the two-pane
             contract squeezes this pane to ~14px (the S78/AE6 measured
             w-80 list + squeezed right pane) and the tile's fixed 80px
             min-content pushed documentElement.scrollWidth to 431 — the
             reference itself overflows to 416 there (its own bug); the
             clone's no-overflow posture is the pinned superset (the
             S78/AE9-13 family). Below md the compact text-only form
             renders (the pre-S77 shape, measured-fit); md+ carries the
             full measured affordance. */
          <div className="flex min-w-0 flex-1 items-center justify-center">
            <div className="hidden min-w-0 flex-col items-center justify-center px-6 py-16 text-center md:flex">
              <div
                className="flex size-20 items-center justify-center rounded-2xl"
                style={{
                  backgroundImage:
                    "linear-gradient(to bottom right, rgb(var(--sf-primary-empty-from)), rgb(var(--sf-primary-empty-to)))",
                }}
              >
                <BookOpen className="size-10 text-sf-primary" strokeWidth={2} />
              </div>
              <h2 className="mt-4 text-xl font-semibold text-slate-800 dark:text-slate-100">
                Select a note
              </h2>
              <p className="mt-1 max-w-sm text-base text-slate-500 dark:text-slate-400">
                Choose a note from the sidebar or create a new one
              </p>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 md:hidden">
              Select a note from the list.
            </p>
          </div>
        ) : !editing ? (
          /* S178/EB1 — the VIEW mode (the s178 measured port: the
             reference's existing-note editor opens in VIEW mode — the
             title input DISABLED showing the stored title + the
             [Edit outline][trash outline-red] action row + the
             read-only prose body rendering the stored HTML; NO Font row,
             NO tag row, NO Save, NO Quill. The trash deletes DIRECTLY (the
             measured no-confirm); the clone's superset aria-label rides
             the S177 lesson-2 unlabeled-control class.
             S179/EC1/EC2 (measured A-4): the action row leads with the
             [pin 36px][palette 36px] pair (the pin is VIEW-MODE ONLY —
             measured in both modes) and the CODING note renders the
             language badge BEFORE the disabled title. */
          <div className="flex min-h-0 flex-1 flex-col">
            {/* Title row: the measured disabled title (14px/700, the same
                placeholder + the editor title's exact className — the
                S7-F/AD3/mobile pins hold untouched on it). S179/EC1: the
                coding note's language badge (the measured shadcn-badge
                anatomy + the lucide-code icon) sits before the title. */}
            <div className="flex items-center gap-2">
              {selected.kind === "coding" && (
                <div className="inline-flex shrink-0 items-center gap-1 rounded-md border px-2.5 py-0.5 text-xs font-semibold text-foreground">
                  <Code className="size-3" strokeWidth={2} aria-hidden />
                  {selected.language ?? "JavaScript"}
                </div>
              )}
              <input
                type="text"
                disabled
                readOnly
                aria-label="Note title"
                placeholder="Note title..."
                value={selected.title}
                className="h-9 min-w-0 flex-1 rounded-md border-0 bg-transparent px-0 text-sm font-bold text-slate-900 outline-none placeholder:font-normal placeholder:text-slate-400 disabled:cursor-default dark:text-slate-100 dark:placeholder:text-slate-500"
              />
              <div className="flex shrink-0 items-center gap-2">
                {/* S179/EC1 (measured A-4/A-5): the pin toggle — 36px
                    icon-only, the violet-50 fill in the toolbar's pinned
                    state (the list row's pin carries the stronger
                    violet-500 tint — both measured); the superset
                    aria-label pair rides the unlabeled reference. */}
                <button
                  type="button"
                  aria-label={selected.pinned ? "Unpin note" : "Pin note"}
                  onClick={() => togglePin(selected)}
                  className={cn(
                    "flex size-9 items-center justify-center rounded-md text-slate-500 outline-none transition-colors hover:bg-slate-100 hover:text-slate-600 focus-visible:ring-2 focus-visible:ring-sf-primary/40 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-300",
                    selected.pinned && "fill-violet-50 text-violet-600 dark:text-violet-400",
                  )}
                >
                  <Pin className="size-4" strokeWidth={2} />
                </button>
                {/* S179/EC2 (measured A-6): the palette — the shared
                    trigger + popover; the pick PATCHes the note. */}
                <NoteColorButton
                  value={selected.color}
                  onPick={(color) => void patchSelected({ color })}
                  label="Note color"
                />
                <Button
                  type="button"
                  variant="outline"
                  className="h-9 px-4"
                  onClick={() => {
                    // S180/ED: the Edit click SEEDS the working attachment
                    // list from the note's bound rows (the fresh store row;
                    // every edit session starts from the persisted truth).
                    setEditStaged(selected.attachments ?? []);
                    setEditing(true);
                  }}
                >
                  <Pencil className="size-4" strokeWidth={2} />
                  Edit
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  aria-label="Delete note"
                  className="h-9 px-4 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                  disabled={deletingIds.has(selected.id)}
                  onClick={() => removeNote(selected.id)}
                >
                  <Trash2 className="size-4" strokeWidth={2} />
                </Button>
              </div>
            </div>
            {/* The measured body: the read-only prose container (the
                reference's class anatomy — the clone's site-local
                note-content CSS delivers the 16px/24px typography, no
                typography plugin). The S140/CO1 gate renders the stored
                HTML (or the React-escaped plain-text fallback for the
                seed's legacy rows). S179/EC1/EC2 (measured A-7/A-8): the
                CODING note's body is the pre.font-mono surface (the
                stored code, React-escaped) and a picked color tints the
                card inline (white — the default — renders no tint). */}
            <div
              className="prose prose-slate max-w-none note-content sf-scroll mt-3 min-h-0 flex-1 overflow-y-auto rounded-2xl border border-slate-200 bg-white px-6 py-4 dark:border-slate-700 dark:bg-slate-900"
              style={selected.color !== "white" ? { backgroundColor: NOTE_COLOR_HEX[selected.color as NoteColor] } : undefined}
            >
              {selected.kind === "coding" ? (
                <pre className="m-0 whitespace-pre-wrap font-mono text-sm">
                  {selected.content || "Empty note"}
                </pre>
              ) : viewBody.html ? (
                <div dangerouslySetInnerHTML={{ __html: viewBody.html }} />
              ) : viewBody.text ? (
                <p className="m-0 whitespace-pre-wrap">{viewBody.text}</p>
              ) : (
                <p className="m-0 text-slate-400 dark:text-slate-500">Empty note</p>
              )}
            </div>
            {/* S180/ED (measured, BOTH kinds — the coding view's section
                sibling is the pre.font-mono body): the Attachments section
                BELOW the body — the border-t strip + the slate-500 heading
                + the bg-slate-100 paperclip pills (target=_blank to the
                derived download url). Renders ONLY at ≥ 1 attachment
                (zero-attachment notes carry no section — measured). */}
            {(selected.attachments?.length ?? 0) > 0 && (
              <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
                <p className="text-sm font-medium text-slate-500 mb-2 dark:text-slate-400">
                  Attachments
                </p>
                {selected.attachments.map((att) => (
                  <a
                    key={att.id}
                    href={att.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-3 py-2 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors dark:bg-slate-800 dark:hover:bg-slate-700"
                  >
                    <Paperclip className="w-4 h-4 text-slate-400" strokeWidth={2} />
                    <span className="text-sm text-slate-700 dark:text-slate-200">{att.name}</span>
                  </a>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* S178/EB2 — the EDIT mode (the measured edit toolbar: the
             title ENABLED + [the notebook select w-32 — the CQ3/CR3
             named-combobox mover, now INLINE where the reference
             measures it][the gradient Save — the S77/AD4 explicit
             save][the X outline — the measured 48×36 exit]). The
             MoreVertical popover RETIRES: its mover (the inline select)
             and its Delete (the view-mode trash) both moved home. The
             Font row + the tag row + the editor card (the S77/AD5/AD6
             measured anatomy) ride below unchanged. */
          <div className="flex min-h-0 flex-1 flex-col">
            {/* Header row (S182/EF5 measured): the reference's ONE row —
                `flex items-center justify-between mb-4` — the row's mb-4
                IS the 16px gap to the Font row (the s181 probes' walk-up
                fix, applied to both surfaces). */}
            <div className="flex items-center justify-between mb-4">
              <NoteTitleInput
                ref={titleInputRef}
                key={selected.id}
                noteId={selected.id}
                initialTitle={selected.title}
                onPatch={patchTitle}
              />
              <div className="flex shrink-0 items-center gap-2">
                {/* S179/EC1 (measured A-9): the CODING note's Language
                    select (w-32) — FIRST in the edit toolbar, before the
                    notebook mover; a legacy null-language coding note
                    shows the JavaScript initial (the pick PATCHes). */}
                {selected.kind === "coding" && (
                  <Select
                    value={
                      selected.language && (NOTE_LANGUAGES as readonly string[]).includes(selected.language)
                        ? (selected.language as (typeof NOTE_LANGUAGES)[number])
                        : "JavaScript"
                    }
                    onValueChange={(v) => void patchSelected({ language: v as (typeof NOTE_LANGUAGES)[number] })}
                  >
                    <SelectTrigger className="h-9 w-32" aria-label="Code note language">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {NOTE_LANGUAGES.map((lang) => (
                        <SelectItem key={lang} value={lang}>
                          {lang}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                {/* The inline notebook mover (the measured w-32 select —
                    the draft's own idiom on the existing note; the CQ3
                    keyboard-reachability is now by construction — an
                    inline Radix Select is a real tab stop). S143/CR3: the
                    named combobox keeps its accessible name (WCAG
                    4.1.2); the CQ3 e2e leg pins it by name. */}
                <Select
                  value={selected.notebookId ?? "none"}
                  onValueChange={(v) =>
                    patchSelected({ notebookId: v === "none" ? "" : v })
                  }
                >
                  <SelectTrigger className="h-9 w-32" aria-label="Move note to notebook">
                    <SelectValue placeholder="None" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {notebooks.map((nb) => (
                      <SelectItem key={nb.id} value={nb.id}>
                        {nb.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {/* S179/EC2 (measured A-9): the edit toolbar's palette —
                    the shared trigger + popover; the pick PATCHes the
                    note (the measured edit-mode 36px icon is the
                    palette; the pin is view-mode only). */}
                <NoteColorButton
                  value={selected.color}
                  onPick={(color) => void patchSelected({ color })}
                  label="Note color"
                />
                {/* S77/AD4 (measured): the ref's explicit Save — gradient +
                    floppy icon. Text stays WHITE (the ref's yellow-on-
                    gradient is its platform quirk); the toast is the
                    pinned superset (the reference shows none — the AH3b
                    record); a successful Save returns to VIEW (EB2). */}
                <Button
                  type="button"
                  variant="gradient"
                  className="sf-gradient-shadow h-9 px-4"
                  onClick={saveNow}
                >
                  {/* S182/EF3 (measured): the icon's OWN mr-2 on top of the
                      base gap-2 — the measured 98px (the pre-port 90). */}
                  <Save className="mr-2 size-4" strokeWidth={2} />
                  Save
                </Button>
                {/* S178/EB2: the X exit. The reference's X is the measured
                    LOCAL-only exit (the net probe: 0 PUTs — the edited
                    content survives in view from local state); the clone's X
                    rides its autosave — the content is already server-
                    current (the network-measured SUPERSET — the S77/AD4
                    record upgraded from reasoned to measured; the EB3 pin
                    owns the divergence). The unmount-flush fires the
                    pending title PATCH (the BW3 mechanism). S182/EF4
                    (measured): the outline variant ports to the reference's
                    current GHOST anatomy (borderless, 48×36, 14px/500 —
                    the S178 "icon-only outline" record superseded by the
                    2026-11-13 live measurement). */}
                <Button
                  type="button"
                  variant="ghost"
                  aria-label="Exit edit mode"
                  className="h-9 px-4"
                  onClick={() => setEditing(false)}
                >
                  <X className="size-4" strokeWidth={2} />
                </Button>
              </div>
            </div>

            {/* Font row (S77/AD5 lineage, B-8 re-measured 2026-11-13 —
                the reference's strip anatomy, the draft's twin):
                the bg-slate-50 rounded-lg strip with gap-3, the "Font:"
                label + the w-32 h-8 select inside a gap-2 wrapper, the
                h-6 w-px bg-slate-200 separator, and the shadcn OUTLINE
                Divider. S179/EC1 (measured A-9): the CODING edit mode
                carries NO Font row, NO Divider — the textarea surface
                only. */}
            {selected.kind === "text" && (
              <div className="flex items-center gap-3 mb-4 p-3 bg-slate-50 rounded-lg flex-wrap dark:bg-slate-800/50">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500 font-medium dark:text-slate-400">Font:</span>
                  <Select value={font} onValueChange={(v) => setFont(v as EditorFont)}>
                    <SelectTrigger className="h-8 w-32" aria-label="Editor font">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="default">Default</SelectItem>
                      <SelectItem value="serif">Serif</SelectItem>
                      <SelectItem value="sans">Sans-serif</SelectItem>
                      <SelectItem value="mono">Monospace</SelectItem>
                      <SelectItem value="cursive">Cursive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="h-6 w-px bg-slate-200 dark:bg-slate-600" aria-hidden />
                <Button
                  type="button"
                  variant="outline"
                  className="h-8 rounded-md px-3 text-xs gap-1"
                  onClick={() => editorRef.current?.insertDivider()}
                >
                  <Minus className="size-4" strokeWidth={2} />
                  Divider
                </Button>
              </div>
            )}

            {/* Tag row (S181/EE — the B-8-family port, measured
                2026-11-13): the draft's twin — the reference's wrapper
                `flex flex-wrap items-center gap-2 mb-4` + the
                Badge-secondary pills + the shadcn Input (w-24 h-7) + the
                ghost add button (the S181/EE3 click path). */}
            <div role="group" className="flex flex-wrap items-center gap-2 mb-4" aria-label="Note tags">
              {selectedTags.map((tag) => (
                <span
                  key={tag}
                  data-note-tag={tag}
                  className="inline-flex items-center rounded-md border border-transparent gap-1 bg-neutral-800 px-2.5 py-0.5 text-xs font-semibold text-neutral-50"
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
              {/* S181/EE (measured): the edit surface's twin of the draft's
                  input-group — the shadcn Input (w-24 h-7) + the ghost add
                  button (the click path alongside Enter). */}
              <div className="flex items-center gap-1">
                <Input
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
                  className="w-24 h-7"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-7"
                  aria-label="Add tag button"
                  disabled={!tagDraft.trim()}
                  onClick={addTag}
                >
                  <Plus className="size-4" strokeWidth={2} />
                </Button>
              </div>
            </div>

            {/* S180/ED (measured edit row order): the Attach row AFTER the
                tag row, BEFORE the editor card — the working list seeded
                from the note's bound rows on the Edit click; the pick
                stages NEW rows; the X removes locally; the Save PATCHes
                the authoritative array. */}
            <NoteAttachRow
              attachments={editStaged ?? []}
              onPick={(file) => void pickNoteAttachment("edit", file)}
              onRemove={removeEditAttachment}
            />

            {/* The editor card (S77/AD2 measured): white rounded-2xl + 1px
                slate-200 — wraps the Quill toolbar strip + editor body. The
                sf-note-editor class scopes the measured Quill surface CSS
                (wins the cascade over Quill's own snow stylesheet).
                S179/EC1/EC2 (measured A-7/A-9): the CODING edit body is
                the debounced textarea (the NoteTitleInput pattern — the
                pending content PATCH flushes on unmount + on Save); a
                picked color tints the card inline (white — the default —
                renders no tint). */}
            <div
              className="sf-note-editor flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900"
              style={selected.color !== "white" ? { backgroundColor: NOTE_COLOR_HEX[selected.color as NoteColor] } : undefined}
            >
              {selected.kind === "coding" ? (
                <CodeBodyTextarea
                  key={selected.id}
                  ref={codeBodyRef}
                  noteId={selected.id}
                  initialContent={selected.content}
                  onPatch={(noteId, content) => {
                    updateNote(noteId, { content })
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
                              : "Autosave failed — the note is still open; use Save to retry.",
                          );
                        }
                      });
                  }}
                />
              ) : (
                <QuillEditor
                  key={selected.id}
                  ref={editorRef}
                  value={selected.content}
                  onChange={onContentChange}
                  font={font}
                  className="min-h-0 flex-1"
                />
              )}
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
        onClick={() => openDraft("text")}
      >
        <Plus className="size-5" strokeWidth={2} />
      </Button>

      <Dialog open={dialog.open} onOpenChange={(open) => !open && setDialog({ open: false })}>
        <DialogContent className="max-w-md rounded-lg">
          <DialogHeader>
            {/* S177/EA1: the note branch is gone (the draft owns note
                creation) — the dialog is the notebook family's surface. */}
            <DialogTitle>
              {dialog.open && dialog.editing ? "Rename notebook" : "New notebook"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={submit} className="flex flex-col gap-4" noValidate>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="note-name">Name</Label>
              <Input
                id="note-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Lecture Notes"
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

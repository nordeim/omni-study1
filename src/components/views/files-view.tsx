"use client";

// ---------------------------------------------------------------------------
// FilesView — folders + files grids, breadcrumb navigation, the 2 MiB-guarded
// multipart upload (the ONE bare-fetch site in the app — apiSend is JSON-only)
// and link files. Own collections: the view fetches its slices itself.
// ---------------------------------------------------------------------------

import * as React from "react";
import {
  ChevronRight,
  Download,
  Eye,
  File as FileIcon,
  FileText,
  Folder,
  FolderOpen,
  Grid3x3,
  Home,
  Image as ImageIcon,
  Link2,
  List,
  MoreHorizontal,
  MoveRight,
  Pencil,
  Plus,
  Search,
  Trash2,
  Upload,
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
import { useToast } from "@/components/ui/toast";
import { apiGet, apiSend } from "@/lib/api";
import { FILE_TYPE_OPTIONS, classifyFileType, type FileTypeFilter } from "@/lib/file-types";
import { buildBreadcrumbChain } from "@/lib/folder-tree";
import { formatFileDate } from "@/lib/date";
import { EmptyState, Spinner, ViewHeader } from "@/components/views/shared";
import { cn } from "@/lib/utils";

const MAX_UPLOAD_BYTES = 2 * 1024 * 1024; // 2 MiB — mirrors the server guard

type FileFolderRow = {
  id: string;
  userId: string;
  name: string;
  parentId: string | null;
  createdAt: string;
  updatedAt: string;
};

type FileItemRow = {
  id: string;
  userId: string;
  name: string;
  mime: string;
  size: number;
  // S81/AH13: the LIST response carries metadata only — the base64 `data`
  // column is absent (downloads go through the per-file endpoint). Kept
  // optional for the POST-created row shape consumers may encounter.
  data?: string | null;
  url: string | null;
  folderId: string | null;
  createdAt: string;
  updatedAt: string;
};

function errorMessage(err: unknown, fallback: string): string {
  return err instanceof Error && err.message ? err.message : fallback;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  return `${Math.round(bytes / 1024)} KB`;
}

function mimeIconClass(mime: string): typeof FileIcon {
  if (mime.startsWith("image/")) return ImageIcon;
  if (mime === "application/pdf") return FileText;
  return FileIcon;
}

// ---- folder create / rename dialog ------------------------------------------------

function FolderDialog({
  open,
  onOpenChange,
  folder,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  folder: FileFolderRow | null;
  onSaved: () => void;
}) {
  const { toast } = useToast();
  // State initializes from props per open session (parent key-remount).
  const [name, setName] = React.useState(folder?.name ?? "");
  const [saving, setSaving] = React.useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    const trimmed = name.trim();
    if (!trimmed || saving) return;
    setSaving(true);
    try {
      if (folder) {
        await apiSend("PATCH", `/api/files/folders/${folder.id}`, { name: trimmed });
        toast.success("Folder renamed");
      } else {
        await apiSend("POST", "/api/files/folders", { name: trimmed });
        toast.success("Folder created");
      }
      onOpenChange(false);
      onSaved();
    } catch (err: unknown) {
      toast.error(errorMessage(err, "Could not save the folder."));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{folder ? "Rename Folder" : "New Folder"}</DialogTitle>
        </DialogHeader>
        <form className="flex flex-col gap-4" onSubmit={(e) => void submit(e)}>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="folder-name">Name</Label>
            <Input
              id="folder-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Lecture slides"
              required
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="gradient" disabled={saving}>
              {saving ? <Spinner className="size-4" /> : null}
              {folder ? "Save" : "Create Folder"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ---- the view ----------------------------------------------------------------------

export function FilesView() {
  const { toast } = useToast();
  const [folders, setFolders] = React.useState<FileFolderRow[]>([]);
  const [files, setFiles] = React.useState<FileItemRow[]>([]);
  const [currentFolderId, setCurrentFolderId] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);
  // S151/CZ2 (audit B-L1): the failed-initial-load surface — the CX5
  // settings pattern. Files is the one view with a private loader (not
  // store-backed, so the shell's BootDataFailureBar doesn't cover it): a
  // failed initial GET used to fire only the TRANSIENT toast, then the
  // finally flipped loading false and the render settled into the
  // permanent "No files yet" EmptyState — a false claim of an empty
  // account, no retry (the CG5/CX5 class, one view over). loadFailed is
  // first-class state now: the alert + Retry render INSTEAD of the false
  // empty branch, and a successful retry clears it.
  const [loadFailed, setLoadFailed] = React.useState(false);
  const [retryCount, setRetryCount] = React.useState(0);
  const [uploading, setUploading] = React.useState(false);
  const [folderDialogOpen, setFolderDialogOpen] = React.useState(false);
  const [viewMode, setViewMode] = React.useState<"grid" | "list">("grid");
  const [linkDialogOpen, setLinkDialogOpen] = React.useState(false);
  // S127/CB17: the Add Link dialog's inline required error.
  const [linkError, setLinkError] = React.useState("");
  const [linkName, setLinkName] = React.useState("");
  const [linkUrl, setLinkUrl] = React.useState("");
  const [linkBusy, setLinkBusy] = React.useState(false);
  const [renamingFolder, setRenamingFolder] = React.useState<FileFolderRow | null>(null);
  const [deletingFolder, setDeletingFolder] = React.useState<FileFolderRow | null>(null);
  const [deletingFile, setDeletingFile] = React.useState<FileItemRow | null>(null);
  // S183/EG (the measured reference toolbar): the type filter + the name
  // search — both FILE-scoped (folders are immune to both, measured live)
  // and both LOCAL state (a reload resets them, measured).
  const [typeFilter, setTypeFilter] = React.useState<FileTypeFilter>("all");
  const [searchQuery, setSearchQuery] = React.useState("");
  // S183/EG: the move dialog + the preview ("View") dialog — both measured
  // reference surfaces the clone lacked entirely.
  const [movingFile, setMovingFile] = React.useState<FileItemRow | null>(null);
  const [viewingFile, setViewingFile] = React.useState<FileItemRow | null>(null);

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // S125/BZ16: the request pair is ONE loader shared by refresh() and the
  // mount effect (the pair was duplicated verbatim — a divergence risk on
  // every future edit). The effect still inlines the loader CALL with its
  // setStates after the await (the set-state-in-effect lint contract).
  const loadFileRows = React.useCallback(
    () =>
      Promise.all([
        apiGet<FileFolderRow[]>("/api/files/folders"),
        apiGet<FileItemRow[]>("/api/files"),
      ]),
    [],
  );

  // S136/CK2 (audit B-H1): the sequence ticket — the fetchSeq idiom of
  // S119/BT8, ported to the private loader. refresh() fires after EVERY
  // mutation (delete/rename/upload), and overlapping refreshes had no
  // order discipline: an older in-flight GET settling after a newer one
  // clobbered fresher state (a just-deleted row resurrects; the retry
  // 404s). Capture ++seq BEFORE the GET pair; apply only when still
  // latest. A ref (not a module variable) — the ticket is component-
  // instance-scoped, the React idiom for the store's module-level seq.
  const fileRowsSeq = React.useRef(0);

  const refresh = React.useCallback(async () => {
    const ticket = ++fileRowsSeq.current;
    try {
      const [folderRows, fileRows] = await loadFileRows();
      if (fileRowsSeq.current !== ticket) return; // a newer GET superseded this one
      setFolders(folderRows);
      setFiles(fileRows);
    } catch (err: unknown) {
      if (fileRowsSeq.current === ticket) {
        toast.error(errorMessage(err, "Could not load your files."));
      }
    } finally {
      if (fileRowsSeq.current === ticket) {
        setLoading(false);
      }
    }
    // S129/CD3: `toast` joins the deps (the useToast object — stable via its
    // useMemo over the store's push, so the identity never churns; naming it
    // is the exhaustive-deps truth, not a behavior change).
  }, [loadFileRows, toast]);

  // Initial fetch is INLINED in the effect (setStates run after the await —
  // the set-state-in-effect lint contract flags wrapped loaders).
  // S151/CZ2: retryCount joins the deps — the Retry button re-runs this
  // effect (the CX5 shape); the ticket + cancelled discipline below already
  // covers supersession (a superseded retry never lands).
  React.useEffect(() => {
    let cancelled = false;
    // S136/CK2: the ticket applies here too — a mount GET superseded by a
    // mutation refresh never lands (`cancelled` covers UNMOUNT; the ticket
    // covers SUPERSESSION — both settle paths discipline the pair).
    const ticket = ++fileRowsSeq.current;
    (async () => {
      try {
        const [folderRows, fileRows] = await loadFileRows();
        if (cancelled || fileRowsSeq.current !== ticket) return;
        setFolders(folderRows);
        setFiles(fileRows);
        // S151/CZ2: a successful load clears the failure state (the retry
        // lands — the alert goes with it).
        setLoadFailed(false);
      } catch (err: unknown) {
        if (!cancelled && fileRowsSeq.current === ticket) {
          toast.error(errorMessage(err, "Could not load your files."));
          // S151/CZ2: the persistent surface — the toast announces (the
          // aria-live stack), the alert + Retry STAY until a successful
          // reload (never a false "No files yet" on a failed load).
          setLoadFailed(true);
        }
      } finally {
        if (!cancelled && fileRowsSeq.current === ticket) {
          setLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
    // S129/CD3: `toast` joins the deps (the stable useToast memo — the
    // exhaustive-deps truth; no re-run churn). S151/CZ2: `retryCount` joins
    // (the Retry re-run trigger).
  }, [loadFileRows, toast, retryCount]);

  // Breadcrumb: walk parents from the current folder to the root (the
  // pure seam — S84/AK1: the visited-set guard bounds the walk over ANY
  // row set, so a cycled/pre-poisoned tree renders a bounded breadcrumb
  // instead of wedging the renderer).
  const breadcrumb = React.useMemo(
    () => buildBreadcrumbChain(folders, currentFolderId),
    [folders, currentFolderId],
  );

  const visibleFolders = folders.filter((f) => (f.parentId ?? null) === currentFolderId);
  const visibleFiles = files.filter((f) => (f.folderId ?? null) === currentFolderId);

  // S183/EG: the filter + the search apply to FILES ONLY (the folders stay
  // visible under both — measured live on the reference). The search is a
  // case-insensitive name substring (measured).
  const filteredFiles = visibleFiles.filter((file) => {
    if (typeFilter !== "all" && classifyFileType(file.mime, file.name) !== typeFilter) return false;
    const q = searchQuery.trim().toLowerCase();
    if (q && !file.name.toLowerCase().includes(q)) return false;
    return true;
  });

  const onPickFile = () => fileInputRef.current?.click();

  const onFileSelected = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = ""; // allow re-picking the same file
    if (!file) return;
    // Client-side volume guard — reject BEFORE any outbound request.
    if (file.size > MAX_UPLOAD_BYTES) {
      toast.error("Files are limited to 2 MiB.");
      return;
    }
    setUploading(true);
    try {
      // Multipart upload — apiSend is JSON-only, so this is the one bare fetch.
      const form = new FormData();
      form.append("file", file);
      if (currentFolderId) form.append("folderId", currentFolderId);
      // S130/CE1: the upload deadline — a bare fetch rides NO apiSend default,
      // so a stalled upload (2 MiB body over a slow uplink) latched the
      // disabled Upload button forever. 120 s: the AI-family budget for a
      // body-capped transfer (the import POST's precedent).
      const res = await fetch("/api/files", {
        method: "POST",
        body: form,
        signal: AbortSignal.timeout(120_000),
      });
      if (!res.ok) {
        let message = `Upload failed (${res.status})`;
        try {
          const body: unknown = await res.json();
          if (typeof body === "object" && body !== null && "error" in body) {
            const candidate = (body as { error?: unknown }).error;
            if (typeof candidate === "string") message = candidate;
          }
        } catch {
          // non-JSON error body — keep the generic message
        }
        throw new Error(message);
      }
      toast.success(`${file.name} uploaded`);
      await refresh();
    } catch (err: unknown) {
      toast.error(errorMessage(err, "The upload failed. Try again."));
    } finally {
      setUploading(false);
    }
  };

  const submitLink = async () => {
    if (linkBusy) return;
    // S127/CB17: the form's noValidate kills the native constraint
    // validation, so BOTH required attributes were dead — an empty submit
    // round-tripped to the server's 400 and surfaced as a raw toast. The
    // guard owns the contract by hand: trim + non-empty, inline error,
    // no wasted request.
    const name = linkName.trim();
    const url = linkUrl.trim();
    if (!name || !url) {
      setLinkError("Name and URL are both required.");
      return;
    }
    setLinkError("");
    setLinkBusy(true);
    try {
      await apiSend("POST", "/api/files", {
        name,
        url,
        ...(currentFolderId ? { folderId: currentFolderId } : {}),
      });
      toast.success(`${name} added`);
      setLinkDialogOpen(false);
      await refresh();
    } catch (err: unknown) {
      toast.error(errorMessage(err, "The link could not be saved. Try again."));
    } finally {
      setLinkBusy(false);
    }
  };

  // S81/AH13: url is set ONLY on link-files (stored uploads carry
  // url: null) — the data column no longer rides the list, so the
  // distinction is decided by url alone.
  const isLinkFile = (file: FileItemRow): boolean => file.url !== null;

  // S183/EG: the move — the reference's click-moves dialog (the destination
  // click IS the move; no confirm step — measured). PATCH /api/files/{id}
  // with the nullable folderId (null = the root).
  const moveFile = async (file: FileItemRow, folderId: string | null) => {
    try {
      await apiSend("PATCH", `/api/files/${file.id}`, { folderId });
      toast.success(`${file.name} moved`);
      setMovingFile(null);
      await refresh();
    } catch (err: unknown) {
      toast.error(errorMessage(err, "Could not move the file."));
    }
  };

  // S183/EG: the list row's meta line names the CONTAINING folder — the
  // reference's root pseudo-folder is named "General" (the move dialog's
  // "General (Root)" is the same name — measured).
  const folderNameFor = (file: FileItemRow): string => {
    if (!file.folderId) return "General";
    return folders.find((f) => f.id === file.folderId)?.name ?? "General";
  };

  return (
    <div className="flex flex-col gap-6">
      <ViewHeader
        stack
        title="Files"
        // S182/EF6 (measured 2026-11-13, probe s182-rows5): the reference's
        // live subtitle copy — the S131-era "Your study materials" record
        // superseded (the reference's 44+ recorded copy drift cycles).
        subtitle="Store and organize your documents"
        icon={FolderOpen}
        actions={
          // S183/EG: the reference's action group is [New Folder][Upload]
          // — the view-mode toggle MOVED OUT to the toolbar row (measured:
          // the toggle lives beside the search + the type filter, not in
          // the header). flex-wrap (S78/AE10) stays. The Add Link icon
          // button is the clone's superset (S5-K pins its place).
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="icon"
              aria-label="Add link"
              onClick={() => {
                setLinkName("");
                setLinkUrl("");
                setLinkError("");
                setLinkDialogOpen(true);
              }}
            >
              <Link2 className="size-4" strokeWidth={2} aria-hidden />
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setRenamingFolder(null);
                setFolderDialogOpen(true);
              }}
            >
              <Plus className="size-4" strokeWidth={2} /> New Folder
            </Button>
            <Button variant="gradient" className="sf-gradient-shadow" onClick={onPickFile} disabled={uploading}>
              {uploading ? <Spinner className="size-4" /> : <Upload className="size-4" strokeWidth={2} />}
              Upload
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              aria-label="Upload a file"
              onChange={(e) => void onFileSelected(e)}
            />
          </div>
        }
      />

      {/* ---- breadcrumb (S183/EG: the reference's crumb row — the violet is
          the HOVER accent only, the active crumb reads slate-800, the
          separator is the chevron, and the folder crumbs are PLAIN text
          buttons — the pills and the "/" separators are retired) ---- */}
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <button
          type="button"
          onClick={() => setCurrentFolderId(null)}
          className={cn(
            "flex items-center gap-1 transition-colors hover:text-violet-600 dark:hover:text-violet-400",
            currentFolderId === null
              ? "font-medium text-slate-800 dark:text-slate-100"
              : "text-slate-500 dark:text-slate-400",
          )}
        >
          <Home className="size-4" strokeWidth={2} aria-hidden />
          All Files
        </button>
        {breadcrumb.map((folder) => (
          <React.Fragment key={folder.id}>
            <ChevronRight className="size-4 text-slate-400 dark:text-slate-500" strokeWidth={2} aria-hidden />
            <button
              type="button"
              onClick={() => setCurrentFolderId(folder.id)}
              className={cn(
                "flex items-center gap-1 transition-colors hover:text-violet-600 dark:hover:text-violet-400",
                folder.id === currentFolderId
                  ? "font-medium text-slate-800 dark:text-slate-100"
                  : "text-slate-500 dark:text-slate-400",
              )}
            >
              {folder.name}
            </button>
          </React.Fragment>
        ))}
      </div>

      {/* ---- the toolbar row (S183/EG: the reference's flex-col md:flex-row
          row — the search + the type filter + the view-mode toggle, between
          the breadcrumb and the content) ---- */}
      <div className="flex flex-col gap-4 md:flex-row">
        <div className="relative flex-1">
          <Search
            className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400 dark:text-slate-500"
            strokeWidth={2}
            aria-hidden
          />
          <Input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search files..."
            className="pl-10 text-base md:text-sm"
          />
        </div>
        <Select value={typeFilter} onValueChange={(value) => setTypeFilter(value as FileTypeFilter)}>
          {/* S183/EG: the explicit label — the codebase's convention for
              always-rendered toolbar selects (the Timetable's "Week
              filter" / the notes-view's "Filter by notebook"): the a11y
              sweep's axe button-name rule fails the Radix trigger without
              one, whatever the visible SelectValue text (the S183 cert
              finding — the dialog selects pass unlabelled only because
              they unmount with the closed dialog). */}
          <SelectTrigger className="w-40" aria-label="Filter files by type">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {FILE_TYPE_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div
          role="group"
          aria-label="View mode"
          className="flex overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700"
        >
          <button
            type="button"
            aria-label="Grid view"
            aria-pressed={viewMode === "grid"}
            onClick={() => setViewMode("grid")}
            className={cn(
              "flex h-9 w-9 items-center justify-center outline-none transition-colors focus-visible:ring-2 focus-visible:ring-sf-primary/40",
              viewMode === "grid"
                ? "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200"
                : "text-slate-500 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800",
            )}
          >
            <Grid3x3 className="size-4" strokeWidth={2} aria-hidden />
          </button>
          <button
            type="button"
            aria-label="List view"
            aria-pressed={viewMode === "list"}
            onClick={() => setViewMode("list")}
            className={cn(
              "flex h-9 w-9 items-center justify-center outline-none transition-colors focus-visible:ring-2 focus-visible:ring-sf-primary/40",
              viewMode === "list"
                ? "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200"
                : "text-slate-500 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800",
            )}
          >
            <List className="size-4" strokeWidth={2} aria-hidden />
          </button>
        </div>
      </div>

      {/* S175/DY2: the in-flight window is announced (the DM2/DL2/DK4
          precedent, the family-wide port COMPLETED this cycle — the
          files family's local-state gate). */}
      {loading ? (
        <div role="status" aria-label="Loading files" className="flex justify-center py-16">
          <Spinner className="size-6 text-sf-primary" />
        </div>
      ) : loadFailed ? (
        // S151/CZ2 (audit B-L1): the failed-load leg — BEFORE the empty
        // branch (ordered): a failed GET never renders the false "No files
        // yet" claim. The CX5 idiom: the red role="alert" card + a real
        // Retry that re-runs the initial-load effect.
        <div className="sf-card">
          <div
            role="alert"
            className="sf-alert-red flex flex-wrap items-center gap-3 rounded-lg px-3 py-2 text-sm"
          >
            <span>Couldn&apos;t load your files.</span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setRetryCount((count) => count + 1)}
            >
              Retry
            </Button>
          </div>
        </div>
      ) : (
        // S183/EG: the reference's SECTIONED layout — the Folders block
        // (label + grid, only when folders exist; folders are immune to
        // the filter/search) above the Files block (the label ALWAYS
        // renders; the grid at rows, the shared EmptyState at none —
        // unwrapped, the reference's bare form). The empty-state CTA
        // drops with the port (the reference's empty state carries icon
        // + title + hint only — measured).
        <>
          {visibleFolders.length > 0 && (
            <div>
              <p className="mb-3 text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">Folders</p>
              <div className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-6">
                {visibleFolders.map((folder) => {
                  // The reference's count label says FILES — the direct
                  // file children only, never singularized ("0 files",
                  // "1 files" — both measured).
                  const fileCount = files.filter((f) => f.folderId === folder.id).length;
                  return (
                    // The reference's folder card is a <button> wrapping
                    // the ellipsis <button> — its own nested-button bug
                    // (invalid HTML), NOT ported: the clone keeps the
                    // div shell + the open button (byte-equivalent
                    // visuals, valid HTML — the same posture as the
                    // reference's own file card).
                    <div
                      key={folder.id}
                      className="group flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 text-left transition-all hover:shadow-md dark:border-slate-700 dark:bg-card"
                    >
                      <button
                        type="button"
                        onClick={() => setCurrentFolderId(folder.id)}
                        className="flex min-w-0 flex-1 items-center gap-3 text-left"
                        aria-label={`Open folder ${folder.name}`}
                      >
                        <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-sf-primary-soft text-sf-primary dark:bg-sf-primary-soft-dark/40 dark:text-sf-primary-strong-dark">
                          <Folder className="size-5" strokeWidth={2} aria-hidden />
                        </span>
                        <span className="min-w-0">
                          <span className="block truncate font-medium text-slate-800 dark:text-slate-100">
                            {folder.name}
                          </span>
                          <span className="block text-xs text-slate-400 dark:text-slate-500">{fileCount} files</span>
                        </span>
                      </button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            type="button"
                            variant="ghost"
                            className="h-8 w-8 shrink-0 opacity-0 group-hover:opacity-100"
                            aria-label={`Folder options for ${folder.name}`}
                          >
                            <MoreHorizontal className="size-4" strokeWidth={2} aria-hidden />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {/* The reference's folder menu is Delete-only;
                              Rename is the clone's superset (the BU1
                              rename-prefill contract keeps its home). */}
                          <DropdownMenuItem
                            onClick={() => {
                              setRenamingFolder(folder);
                              setFolderDialogOpen(true);
                            }}
                          >
                            <Pencil className="size-4" strokeWidth={2} aria-hidden /> Rename
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-red-600 focus:text-red-600 dark:text-red-400 dark:focus:text-red-400"
                            onClick={() => setDeletingFolder(folder)}
                          >
                            <Trash2 className="size-4" strokeWidth={2} aria-hidden /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div>
            <p className="mb-3 text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">Files</p>
            {filteredFiles.length === 0 ? (
              <EmptyState
                icon={FolderOpen}
                title="No files yet"
                hint="Upload your first file to get started"
              />
            ) : viewMode === "list" ? (
              // S183/EG: the LIST branch — the viewMode state finally
              // branches (it was a visual no-op before this port). The
              // reference's row: the icon tile, the name, the folder •
              // size • date meta line, and the four hover controls (the
              // eye, the download ANCHOR, the move, the red trash).
              <div className="flex flex-col gap-3">
                {filteredFiles.map((file) => {
                  const link = isLinkFile(file);
                  const Icon = link ? Link2 : mimeIconClass(file.mime);
                  return (
                    <div
                      key={file.id}
                      className="group flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 transition-shadow hover:shadow-md dark:border-slate-700 dark:bg-card"
                    >
                      <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800">
                        <Icon className="size-5 text-slate-500 dark:text-slate-400" strokeWidth={2} aria-hidden />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium text-slate-800 dark:text-slate-100">
                          {link ? (
                            <a
                              href={file.url ?? "#"}
                              target="_blank"
                              rel="noreferrer"
                              className="hover:text-sf-primary hover:underline"
                            >
                              {file.name}
                            </a>
                          ) : (
                            file.name
                          )}
                        </p>
                        <p className="text-xs text-slate-400 dark:text-slate-500">
                          {folderNameFor(file)} • {formatSize(file.size)} • {formatFileDate(new Date(file.createdAt))}
                        </p>
                      </div>
                      <div className="flex shrink-0 gap-2 opacity-0 transition-opacity focus-within:opacity-100 group-hover:opacity-100">
                        <Button
                          type="button"
                          variant="ghost"
                          className="h-9 w-9"
                          aria-label={`View ${file.name}`}
                          onClick={() => setViewingFile(file)}
                        >
                          <Eye className="size-4" strokeWidth={2} aria-hidden />
                        </Button>
                        {!link && (
                          <Button type="button" variant="ghost" className="h-9 w-9" asChild>
                            <a
                              href={`/api/files/${file.id}`}
                              download={file.name}
                              target="_blank"
                              rel="noreferrer"
                              aria-label={`Download ${file.name}`}
                            >
                              <Download className="size-4" strokeWidth={2} aria-hidden />
                            </a>
                          </Button>
                        )}
                        {!link && (
                          <Button
                            type="button"
                            variant="ghost"
                            className="h-9 w-9"
                            aria-label={`Move ${file.name} to a folder`}
                            onClick={() => setMovingFile(file)}
                          >
                            <MoveRight className="size-4" strokeWidth={2} aria-hidden />
                          </Button>
                        )}
                        <Button
                          type="button"
                          variant="ghost"
                          className="h-9 w-9 text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300"
                          aria-label={`Delete ${file.name}`}
                          onClick={() => setDeletingFile(file)}
                        >
                          <Trash2 className="size-4" strokeWidth={2} aria-hidden />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              // The GRID branch — the reference's card: the ellipsis row
              // above the aspect-square preview tile, then the name + size.
              <div className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-6">
                {filteredFiles.map((file) => {
                  const link = isLinkFile(file);
                  const Icon = link ? Link2 : mimeIconClass(file.mime);
                  const isImage = !link && file.mime.startsWith("image/");
                  return (
                    <div
                      key={file.id}
                      className="group flex flex-col rounded-xl border border-slate-200 bg-white p-4 transition-shadow hover:shadow-md dark:border-slate-700 dark:bg-card"
                    >
                      <div className="mb-2 flex justify-end">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              type="button"
                              variant="ghost"
                              className="h-7 w-7 opacity-0 group-hover:opacity-100"
                              aria-label={`File options for ${file.name}`}
                            >
                              <MoreHorizontal className="size-4" strokeWidth={2} aria-hidden />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setViewingFile(file)}>
                              <Eye className="size-4" strokeWidth={2} aria-hidden /> View
                            </DropdownMenuItem>
                            {!link && (
                              <DropdownMenuItem asChild>
                                <a href={`/api/files/${file.id}`} download={file.name}>
                                  <Download className="size-4" strokeWidth={2} aria-hidden /> Download
                                </a>
                              </DropdownMenuItem>
                            )}
                            {!link && (
                              <DropdownMenuItem onClick={() => setMovingFile(file)}>
                                <FolderOpen className="size-4" strokeWidth={2} aria-hidden /> Move to Folder
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem
                              className="text-red-600 focus:text-red-600 dark:text-red-400 dark:focus:text-red-400"
                              onClick={() => setDeletingFile(file)}
                            >
                              <Trash2 className="size-4" strokeWidth={2} aria-hidden /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      <button
                        type="button"
                        onClick={() => setViewingFile(file)}
                        aria-label={`Preview ${file.name}`}
                        className={cn(
                          "group/file relative mb-3 flex aspect-square cursor-pointer items-center justify-center overflow-hidden rounded-lg",
                          isImage
                            ? "bg-slate-100 dark:bg-slate-800"
                            : "bg-slate-50 dark:bg-slate-800/60",
                        )}
                      >
                        {isImage ? (
                          <>
                            {/* S183/EG: the ?inline=1 guarded mode — the
                                attachment disposition would 0 the
                                decode (the previewHeaders seam). */}
                            <img
                              src={`/api/files/${file.id}?inline=1`}
                              alt={file.name}
                              className="h-full w-full object-cover"
                              loading="lazy"
                            />
                            <span className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover/file:opacity-100">
                              <Eye className="size-6 text-white" strokeWidth={2} aria-hidden />
                            </span>
                          </>
                        ) : (
                          <Icon className="size-12 text-slate-400 dark:text-slate-500" strokeWidth={2} aria-hidden />
                        )}
                      </button>
                      <p className="truncate text-sm font-medium text-slate-800 dark:text-slate-100">
                        {link ? (
                          <a
                            href={file.url ?? "#"}
                            target="_blank"
                            rel="noreferrer"
                            className="hover:text-sf-primary hover:underline"
                          >
                            {file.name}
                          </a>
                        ) : (
                          file.name
                        )}
                      </p>
                      <p className="text-xs text-slate-400 dark:text-slate-500">{formatSize(file.size)}</p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}

      <Dialog open={linkDialogOpen} onOpenChange={setLinkDialogOpen}>
        <DialogContent className="max-w-md rounded-lg">
          <DialogHeader>
            <DialogTitle>Add Link</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void submitLink();
            }}
            className="flex flex-col gap-4"
            noValidate
          >
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="link-name">Name</Label>
              <Input id="link-name" value={linkName} onChange={(e) => setLinkName(e.target.value)} required />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="link-url">URL</Label>
              <Input id="link-url" type="url" value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} placeholder="https://…" required />
            </div>
            {linkError ? <p role="alert" className="text-sm text-red-600 dark:text-red-400">{linkError}</p> : null}
            <Button type="submit" variant="gradient" className="sf-gradient-shadow" disabled={linkBusy}>
              {linkBusy ? <Spinner className="size-4" /> : <Link2 className="size-4" strokeWidth={2} />}
              Save Link
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* ---- the preview dialog (S183/EG: the reference's "View" — the name,
          the inline image (or the mime icon), the Open in New Tab + Download
          anchors, the built-in Close X) ---- */}
      <Dialog open={viewingFile !== null} onOpenChange={(open) => !open && setViewingFile(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="truncate pr-8">{viewingFile?.name}</DialogTitle>
          </DialogHeader>
          {viewingFile && !isLinkFile(viewingFile) ? (
            <div className="flex h-72 w-full items-center justify-center p-4 md:h-96">
              {viewingFile.mime.startsWith("image/") ? (
                // The ?inline=1 bytes — the attachment disposition would
                // block the decode (the previewHeaders seam).
                <img
                  src={`/api/files/${viewingFile.id}?inline=1`}
                  alt={viewingFile.name}
                  className="max-h-full max-w-full rounded-lg object-contain shadow-lg"
                />
              ) : (() => {
                const Icon = mimeIconClass(viewingFile.mime);
                return <Icon className="size-12 text-slate-400 dark:text-slate-500" strokeWidth={2} aria-hidden />;
              })()}
            </div>
          ) : null}
          <div className="flex flex-wrap items-center justify-center gap-2">
            {viewingFile && isLinkFile(viewingFile) ? (
              <Button type="button" variant="outline" asChild>
                <a href={viewingFile.url ?? "#"} target="_blank" rel="noreferrer">
                  Open Link
                </a>
              </Button>
            ) : viewingFile ? (
              <>
                <Button type="button" variant="outline" asChild>
                  <a href={`/api/files/${viewingFile.id}?inline=1`} target="_blank" rel="noreferrer">
                    Open in New Tab
                  </a>
                </Button>
                <Button type="button" variant="outline" asChild>
                  <a href={`/api/files/${viewingFile.id}`} download={viewingFile.name}>
                    Download
                  </a>
                </Button>
              </>
            ) : null}
          </div>
        </DialogContent>
      </Dialog>

      {/* ---- the move dialog (S183/EG: the reference's click-moves list —
          General (Root) first, then every folder; the destination click IS
          the move, no confirm step — measured) ---- */}
      <Dialog open={movingFile !== null} onOpenChange={(open) => !open && setMovingFile(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Move to Folder</DialogTitle>
          </DialogHeader>
          <div className="mt-4 space-y-2">
            <button
              type="button"
              onClick={() => movingFile && void moveFile(movingFile, null)}
              className="flex w-full items-center gap-3 rounded-lg border border-slate-200 p-3 text-left transition-colors hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
            >
              <Home className="size-5 text-slate-400 dark:text-slate-500" strokeWidth={2} aria-hidden />
              <span>General (Root)</span>
            </button>
            {folders.map((folder) => (
              <button
                key={folder.id}
                type="button"
                onClick={() => movingFile && void moveFile(movingFile, folder.id)}
                className="flex w-full items-center gap-3 rounded-lg border border-slate-200 p-3 text-left transition-colors hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
              >
                <Folder className="size-5 text-sf-primary" strokeWidth={2} aria-hidden />
                <span className="truncate">{folder.name}</span>
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* S120/BU1: the key-remount the dialog's own state-initializer
          contract always claimed — without it the useState(folder?.name)
          captured the FIRST mount's props forever and the Rename dialog
          opened with the PREVIOUS session's name (verified live: create A,
          create B, Rename A showed B). The sibling idiom (tasks-view:775). */}
      <FolderDialog
        key={folderDialogOpen ? `open-${renamingFolder?.id ?? "new"}` : "closed"}
        open={folderDialogOpen}
        onOpenChange={setFolderDialogOpen}
        folder={renamingFolder}
        onSaved={() => void refresh()}
      />

      {/* ---- folder delete ---- */}
      <AlertDialog open={deletingFolder !== null} onOpenChange={(open) => !open && setDeletingFolder(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this folder?</AlertDialogTitle>
            <AlertDialogDescription>
              {/* S137/CL5 (audit A-L1): the honest SetNull outcome — the schema's
                  onDelete: SetNull (FileItem.folderId + FileFolder.parentId)
                  moves contained files AND child subfolders to ROOT (All
                  Files), not to the deleted folder's parent. (The reference
                  measurement: it ships no confirm dialog at all — the clone's
                  dialog is superset, its copy is clone-territory.) */}
              {deletingFolder?.name} will be removed. Files and subfolders inside are kept and
              move to All Files. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 text-white hover:bg-red-700"
              onClick={() => {
                if (!deletingFolder) return;
                const target = deletingFolder;
                setDeletingFolder(null);
                if (currentFolderId === target.id) setCurrentFolderId(target.parentId ?? null);
                apiSend("DELETE", `/api/files/folders/${target.id}`)
                  .then(() => {
                    toast.success("Folder deleted");
                    return refresh();
                  })
                  .catch((err: unknown) => toast.error(errorMessage(err, "Could not delete the folder.")));
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ---- file delete ---- */}
      <AlertDialog open={deletingFile !== null} onOpenChange={(open) => !open && setDeletingFile(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this file?</AlertDialogTitle>
            <AlertDialogDescription>
              {deletingFile?.name} will be permanently removed. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 text-white hover:bg-red-700"
              onClick={() => {
                if (!deletingFile) return;
                const target = deletingFile;
                setDeletingFile(null);
                apiSend("DELETE", `/api/files/${target.id}`)
                  .then(() => {
                    toast.success("File deleted");
                    return refresh();
                  })
                  .catch((err: unknown) => toast.error(errorMessage(err, "Could not delete the file.")));
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

"use client";

// ---------------------------------------------------------------------------
// FilesView — folders + files grids, breadcrumb navigation, the 2 MiB-guarded
// multipart upload (the ONE bare-fetch site in the app — apiSend is JSON-only)
// and link files. Own collections: the view fetches its slices itself.
// ---------------------------------------------------------------------------

import * as React from "react";
import {
  Download,
  File as FileIcon,
  FileText,
  Folder,
  FolderOpen,
  Home,
  Grid3x3,
  Image as ImageIcon,
  Link2,
  List,
  Pencil,
  Plus,
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/toast";
import { apiGet, apiSend } from "@/lib/api";
import { buildBreadcrumbChain } from "@/lib/folder-tree";
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
  const [uploading, setUploading] = React.useState(false);
  const [folderDialogOpen, setFolderDialogOpen] = React.useState(false);
  const [viewMode, setViewMode] = React.useState<"grid" | "list">("grid");
  const [linkDialogOpen, setLinkDialogOpen] = React.useState(false);
  const [linkName, setLinkName] = React.useState("");
  const [linkUrl, setLinkUrl] = React.useState("");
  const [linkBusy, setLinkBusy] = React.useState(false);
  const [renamingFolder, setRenamingFolder] = React.useState<FileFolderRow | null>(null);
  const [deletingFolder, setDeletingFolder] = React.useState<FileFolderRow | null>(null);
  const [deletingFile, setDeletingFile] = React.useState<FileItemRow | null>(null);

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const refresh = React.useCallback(async () => {
    try {
      const [folderRows, fileRows] = await Promise.all([
        apiGet<FileFolderRow[]>("/api/files/folders"),
        apiGet<FileItemRow[]>("/api/files"),
      ]);
      setFolders(folderRows);
      setFiles(fileRows);
    } catch (err: unknown) {
      toast.error(errorMessage(err, "Could not load your files."));
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Initial fetch is INLINED in the effect (setStates run after the await —
  // the set-state-in-effect lint contract flags wrapped loaders).
  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [folderRows, fileRows] = await Promise.all([
          apiGet<FileFolderRow[]>("/api/files/folders"),
          apiGet<FileItemRow[]>("/api/files"),
        ]);
        if (cancelled) return;
        setFolders(folderRows);
        setFiles(fileRows);
      } catch (err: unknown) {
        if (!cancelled) toast.error(errorMessage(err, "Could not load your files."));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

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
      const res = await fetch("/api/files", { method: "POST", body: form });
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
    setLinkBusy(true);
    try {
      await apiSend("POST", "/api/files", {
        name: linkName,
        url: linkUrl,
        ...(currentFolderId ? { folderId: currentFolderId } : {}),
      });
      toast.success(`${linkName} added`);
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

  return (
    <div className="flex flex-col gap-6">
      <ViewHeader
        title="Files"
        subtitle="Your study materials"
        icon={FolderOpen}
        actions={
          // flex-wrap (S78/AE10): the view-mode + New Folder + Upload row
          // exceeds 390px unwrapped (measured 499). At ≥sm it fits.
          <div className="flex flex-wrap items-center gap-2">
            <div
              role="group"
              aria-label="View mode"
              className="flex items-center rounded-lg border border-slate-200 p-0.5 dark:border-slate-700"
            >
              <button
                type="button"
                aria-label="Grid view"
                aria-pressed={viewMode === "grid"}
                onClick={() => setViewMode("grid")}
                className={cn(
                  "flex size-8 items-center justify-center rounded-md outline-none focus-visible:ring-2 focus-visible:ring-sf-primary/40",
                  viewMode === "grid"
                    ? "bg-sf-primary-soft text-sf-primary-strong"
                    : "text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800",
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
                  "flex size-8 items-center justify-center rounded-md outline-none focus-visible:ring-2 focus-visible:ring-sf-primary/40",
                  viewMode === "list"
                    ? "bg-sf-primary-soft text-sf-primary-strong"
                    : "text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800",
                )}
              >
                <List className="size-4" strokeWidth={2} aria-hidden />
              </button>
            </div>
            <Button
              type="button"
              variant="outline"
              size="icon"
              aria-label="Add link"
              onClick={() => {
                setLinkName("");
                setLinkUrl("");
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

      {/* ---- breadcrumb ---- */}
      <div className="flex flex-wrap items-center gap-1.5 text-sm">
        <button
          type="button"
          onClick={() => setCurrentFolderId(null)}
          className={cn(
            "flex items-center gap-1 text-sm font-medium transition-colors",
            currentFolderId === null
              ? "text-sf-primary-strong"
              : "text-slate-600 hover:text-sf-primary dark:text-slate-300",
          )}
        >
          <Home className="size-3.5" strokeWidth={2} aria-hidden />
          All Files
        </button>
        {breadcrumb.map((folder) => (
          <React.Fragment key={folder.id}>
            <span aria-hidden className="text-slate-300">/</span>
            <button
              type="button"
              onClick={() => setCurrentFolderId(folder.id)}
              className={cn(
                "rounded-full px-3 py-1 text-sm font-medium transition-colors",
                folder.id === currentFolderId
                  ? "bg-sf-primary-soft text-sf-primary-strong"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300",
              )}
            >
              {folder.name}
            </button>
          </React.Fragment>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Spinner className="size-6 text-sf-primary" />
        </div>
      ) : visibleFolders.length === 0 && visibleFiles.length === 0 ? (
        <div className="sf-card">
          <EmptyState
            icon={FolderOpen}
            title="No files yet"
            hint="Upload your first file to get started"
            cta={
              <Button variant="gradient" className="sf-gradient-shadow-lg" onClick={onPickFile}>
                <Upload className="size-4" strokeWidth={2} /> Upload a file
              </Button>
            }
          />
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {visibleFolders.length > 0 && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {visibleFolders.map((folder) => {
                const itemCount =
                  folders.filter((f) => f.parentId === folder.id).length +
                  files.filter((f) => f.folderId === folder.id).length;
                return (
                  <div key={folder.id} className="group sf-card flex items-center gap-3 p-4">
                    <button
                      type="button"
                      onClick={() => setCurrentFolderId(folder.id)}
                      className="flex min-w-0 flex-1 items-center gap-3 text-left"
                      aria-label={`Open folder ${folder.name}`}
                    >
                      <span className="rounded-lg bg-amber-100 p-2 text-amber-600">
                        <Folder className="size-5" strokeWidth={2} aria-hidden />
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate font-medium text-slate-800 dark:text-slate-100">
                          {folder.name}
                        </span>
                        <span className="block text-xs text-slate-500">{itemCount} items</span>
                      </span>
                    </button>
                    <div className="flex shrink-0 items-center gap-1 opacity-0 transition-opacity focus-within:opacity-100 group-hover:opacity-100">
                      <button
                        type="button"
                        aria-label={`Rename ${folder.name}`}
                        onClick={() => {
                          setRenamingFolder(folder);
                          setFolderDialogOpen(true);
                        }}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-sf-primary dark:hover:bg-slate-800"
                      >
                        <Pencil className="size-4" strokeWidth={2} />
                      </button>
                      <button
                        type="button"
                        aria-label={`Delete ${folder.name}`}
                        onClick={() => setDeletingFolder(folder)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950"
                      >
                        <Trash2 className="size-4" strokeWidth={2} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {visibleFiles.length > 0 && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {visibleFiles.map((file) => {
                const link = isLinkFile(file);
                const Icon = link ? Link2 : mimeIconClass(file.mime);
                return (
                  <div key={file.id} className="group sf-card flex items-center gap-3 p-4">
                    <span className="flex shrink-0 rounded-lg bg-sf-primary-soft p-2 text-sf-primary-strong dark:bg-sf-primary-soft-dark/40 dark:text-sf-primary-strong-dark">
                      <Icon className="size-5" strokeWidth={2} aria-hidden />
                    </span>
                    <div className="min-w-0 flex-1">
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
                      <p className="text-xs text-slate-500">{formatSize(file.size)}</p>
                    </div>
                    <div className="flex shrink-0 items-center gap-1 opacity-0 transition-opacity focus-within:opacity-100 group-hover:opacity-100">
                      {!link && (
                        <a
                          href={`/api/files/${file.id}`}
                          download={file.name}
                          aria-label={`Download ${file.name}`}
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-sf-primary dark:hover:bg-slate-800"
                        >
                          <Download className="size-4" strokeWidth={2} />
                        </a>
                      )}
                      <button
                        type="button"
                        aria-label={`Delete ${file.name}`}
                        onClick={() => setDeletingFile(file)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950"
                      >
                        <Trash2 className="size-4" strokeWidth={2} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
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
            <Button type="submit" variant="gradient" className="sf-gradient-shadow" disabled={linkBusy}>
              {linkBusy ? <Spinner className="size-4" /> : <Link2 className="size-4" strokeWidth={2} />}
              Save Link
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <FolderDialog
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
              {deletingFolder?.name} will be removed. Files inside are kept and move to the enclosing
              folder. This cannot be undone.
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

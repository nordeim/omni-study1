"use client";

// ---------------------------------------------------------------------------
// The /export panel (S21 + S23): the count grid ("What's included"), the
// Download JSON anchor, and the Restore card — a real file picker that POSTs
// the chosen envelope to /api/import/data and renders the upsert summary.
// The panel carries no chrome beyond its own cards; the page is a
// server-gated owner surface linked from nowhere.
// ---------------------------------------------------------------------------

import * as React from "react";

import { apiSend } from "@/lib/api";
import { Spinner } from "@/components/views/shared";

type ImportSummary = {
  created: number;
  updated: number;
  total: number;
};

function errorMessage(err: unknown, fallback: string): string {
  return err instanceof Error && err.message ? err.message : fallback;
}

/** Human collection names for the count grid (the pinned chip labels). */
const COLLECTION_LABELS: Record<string, string> = {
  subjects: "Subjects",
  taskLists: "Task Lists",
  tasks: "Tasks",
  assignments: "Assignments",
  exams: "Exams",
  events: "Events",
  timetableClasses: "Classes",
  notebooks: "Notebooks",
  notes: "Notes",
  decks: "Decks",
  cards: "Flashcards",
  practiceTests: "Practice Tests",
  studyGroups: "Study Groups",
  grades: "Grades",
  focusSessions: "Focus Sessions",
  folders: "Folders",
  files: "Files",
  chatMessages: "Chat Messages",
  calcHistory: "Calculations",
  holidays: "Holidays",
};

export function ExportPanel({
  counts,
  email,
}: {
  counts: Array<{ name: string; count: number }>;
  email: string;
}) {
  const [file, setFile] = React.useState<File | null>(null);
  const [busy, setBusy] = React.useState(false);
  const [result, setResult] = React.useState<ImportSummary | null>(null);
  const [error, setError] = React.useState("");

  const onImport = async () => {
    if (!file || busy) return;
    setBusy(true);
    setError("");
    setResult(null);
    try {
      const text = await file.text();
      const envelope: unknown = JSON.parse(text);
      const summary = await apiSend<ImportSummary>("POST", "/api/import/data", envelope);
      setResult(summary);
    } catch (err: unknown) {
      setError(errorMessage(err, "The import failed. Check the file and try again."));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
          Export Your Data
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Download a complete, portable copy of your workspace, or restore one.
        </p>
      </header>

      <section aria-label="What's included" className="sf-card p-6">
        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">
          What&apos;s included
        </h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          {counts.length} collections for <span className="font-medium">{email}</span> — rows
          keep their ids, so a restore updates in place instead of duplicating.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {counts.map(({ name, count }) => (
            <span
              key={name}
              className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300"
            >
              <span>{COLLECTION_LABELS[name] ?? name}</span>
              <span className="rounded-full bg-white px-1.5 text-[10px] font-semibold text-slate-500 dark:bg-slate-900 dark:text-slate-400">
                {count}
              </span>
            </span>
          ))}
        </div>
      </section>

      <section aria-label="Download" className="sf-card p-6">
        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">Download</h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          A single JSON envelope — every collection, versioned and id-stable.
        </p>
        <a
          href="/api/export/data"
          download
          className="mt-4 inline-flex h-9 items-center justify-center rounded-md bg-sf-primary px-4 text-sm font-medium text-sf-primary-foreground transition-colors hover:bg-sf-primary-strong"
        >
          Download JSON
        </a>
      </section>

      <section aria-label="Restore" className="sf-card p-6">
        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">Restore</h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Import a previous export. Rows upsert by id — created rows are new,
          updated rows already existed. Nothing is deleted.
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <input
            type="file"
            accept="application/json,.json"
            aria-label="Choose a backup file"
            onChange={(e) => {
              const picked = e.target.files?.[0] ?? null;
              // S118/BS11 — reject an oversized backup BEFORE reading it
              // into memory (the server's 10 MiB cap answers 413 after the
              // full upload; this is the fast path with the same limit).
              if (picked && picked.size > 10 * 1024 * 1024) {
                setFile(null);
                setResult(null);
                setError("That backup is too large. The import cap is 10 MiB.");
                e.target.value = "";
                return;
              }
              setFile(picked);
              setResult(null);
              setError("");
            }}
            className="text-sm text-slate-600 dark:text-slate-300"
          />
          <button
            type="button"
            onClick={() => void onImport()}
            disabled={!file || busy}
            className="inline-flex h-9 items-center justify-center rounded-md bg-sf-primary px-4 text-sm font-medium text-sf-primary-foreground transition-colors hover:bg-sf-primary-strong disabled:pointer-events-none disabled:opacity-50"
          >
            {busy ? <Spinner className="size-4" /> : null}
            Import
          </button>
        </div>
        {result && (
          <p
            role="status"
            className="sf-alert-emerald mt-4 rounded-lg px-3 py-2 text-sm"
          >
            Import complete — {result.created} created, {result.updated} updated
            ({result.total} total).
          </p>
        )}
        {error && (
          <p
            role="alert"
            className="sf-alert-red mt-4 rounded-lg px-3 py-2 text-sm"
          >
            {error}
          </p>
        )}
      </section>
    </div>
  );
}

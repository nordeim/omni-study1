// ---------------------------------------------------------------------------
// The data-import seam (S23/ADR-021). Pure — unit-pinned by
// tests/data-import.test.ts. parseImportEnvelope turns a downloaded (or
// hand-crafted) export file into normalized rows ready for the route's
// upsert-by-id transaction — or an actionable error naming the first
// offender. Pre-validating here matters because Prisma enforces FKs on
// SQLite (P2003): a dangling optional FK must be NULLED at the seam (the
// schema's own SetNull semantics) and a dangling REQUIRED cards.deckId is
// a corrupt envelope that must never reach the database mid-transaction.
// ---------------------------------------------------------------------------

import {
  DATA_EXPORT_FORMAT,
  DATA_EXPORT_VERSION,
  EXPORT_COLLECTIONS,
  type ExportCollection,
} from "./data-export";

/** The documented 10 MiB body cap (5× the largest realistic envelope). */
export const IMPORT_MAX_BYTES = 10 * 1024 * 1024;

/** The import-side secret guard — the file never speaks for the account:
 *  passwordHash and userId are stripped from every row (the importer's own
 *  id is re-attached by the route, never by the file). */
export const NEVER_IMPORT_FIELDS = ["passwordHash", "userId"] as const;

export type ImportFkSpec = {
  field: string;
  target: ExportCollection;
  required?: boolean;
};

/**
 * Every collection's FK edges, keyed by manifest collection name. The
 * completeness pin in the unit suite fails a new collection without an
 * entry. cards.deckId is the ONLY required FK (Flashcard carries no
 * userId — it is scoped through its deck); every other FK is nullable
 * (SetNull in the schema, null-at-the-seam on import).
 */
export const IMPORT_FK_MAP: Record<ExportCollection, ImportFkSpec[]> = {
  subjects: [],
  taskLists: [],
  tasks: [
    { field: "listId", target: "taskLists" },
    { field: "subjectId", target: "subjects" },
  ],
  assignments: [{ field: "subjectId", target: "subjects" }],
  exams: [{ field: "subjectId", target: "subjects" }],
  events: [],
  timetableClasses: [{ field: "subjectId", target: "subjects" }],
  notebooks: [],
  notes: [
    { field: "notebookId", target: "notebooks" },
    { field: "subjectId", target: "subjects" },
  ],
  decks: [{ field: "subjectId", target: "subjects" }],
  cards: [{ field: "deckId", target: "decks", required: true }],
  practiceTests: [{ field: "subjectId", target: "subjects" }],
  studyGroups: [{ field: "subjectId", target: "subjects" }],
  grades: [{ field: "subjectId", target: "subjects" }],
  focusSessions: [{ field: "subjectId", target: "subjects" }],
  folders: [{ field: "parentId", target: "folders" }],
  files: [{ field: "folderId", target: "folders" }],
  chatMessages: [],
  calcHistory: [],
  holidays: [],
};

export type ImportRow = Record<string, unknown>;
export type ImportRows = Record<ExportCollection, ImportRow[]>;

export type ImportParseResult =
  | { ok: true; rows: ImportRows; totalRows: number }
  | { ok: false; error: string };

const KNOWN_COLLECTIONS = new Set<string>(EXPORT_COLLECTIONS);

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function stripSecrets(row: ImportRow): ImportRow {
  const out: ImportRow = {};
  for (const [key, value] of Object.entries(row)) {
    if ((NEVER_IMPORT_FIELDS as readonly string[]).includes(key)) continue;
    out[key] = value;
  }
  return out;
}

/**
 * Topologically sort folder rows so parents import before their children
 * (a hand-crafted child-first order would die P2003 mid-transaction).
 * Detached parents (parentId nulled by the FK pass) are roots. A parentId
 * CYCLE is rejected — it must never reach the tree renderer or the DB.
 */
function sortFoldersParentsFirst(folders: ImportRow[]): ImportRow[] | string {
  const byId = new Map<string, ImportRow>();
  for (const row of folders) byId.set(String(row.id), row);

  // children[parent] = rows whose parent is that id (resolvable only).
  const childrenOf = new Map<string, string[]>();
  let hasRoot = false;
  for (const row of folders) {
    const parentId = row.parentId;
    if (typeof parentId === "string" && byId.has(parentId)) {
      const list = childrenOf.get(parentId) ?? [];
      list.push(String(row.id));
      childrenOf.set(parentId, list);
    } else {
      hasRoot = true; // null or nulled dangling parent — a root row
    }
  }

  // Kahn's algorithm over the parent → children edges. Rows whose parent
  // chain is entirely present get emitted after their parent; anything
  // left un-emitted is on (or below) a cycle.
  const emitted = new Set<string>();
  const queue: string[] = [];
  const inDegree = new Map<string, number>();

  for (const row of folders) {
    const id = String(row.id);
    const parentId = row.parentId;
    const parentResolvable =
      typeof parentId === "string" && byId.has(parentId);
    inDegree.set(id, parentResolvable ? 1 : 0);
    if (!parentResolvable) queue.push(id);
  }

  const ordered: ImportRow[] = [];
  while (queue.length > 0) {
    const id = queue.shift() as string;
    if (emitted.has(id)) continue;
    emitted.add(id);
    const row = byId.get(id);
    if (row) ordered.push(row);
    for (const childId of childrenOf.get(id) ?? []) {
      const next = (inDegree.get(childId) ?? 0) - 1;
      inDegree.set(childId, next);
      if (next === 0) queue.push(childId);
    }
  }

  if (ordered.length !== folders.length || (!hasRoot && folders.length > 0)) {
    const offenders = folders
      .map((row) => String(row.id))
      .filter((id) => !emitted.has(id));
    return `folders contains a parentId cycle involving: ${offenders.join(", ")}. Fix the folder tree in the source account and re-export.`;
  }
  return ordered;
}

/** Parse + normalize an import envelope, or name the first offender. */
export function parseImportEnvelope(
  input: unknown,
): ImportParseResult {
  if (!isPlainObject(input)) {
    return {
      ok: false,
      error:
        "This file is not a StudyFlow data export (expected a JSON object envelope).",
    };
  }

  if (input.format !== DATA_EXPORT_FORMAT) {
    return {
      ok: false,
      error: `This file is not a ${DATA_EXPORT_FORMAT} envelope. Export your data from StudyFlow and import that file.`,
    };
  }

  const version = input.version;
  if (typeof version !== "number" || !Number.isInteger(version)) {
    return {
      ok: false,
      error: "The export envelope has no readable version number.",
    };
  }
  if (version > DATA_EXPORT_VERSION) {
    return {
      ok: false,
      error: `This export was written by a newer version of StudyFlow (v${version}); this app understands v${DATA_EXPORT_VERSION}. Update the app and try again.`,
    };
  }
  if (version < DATA_EXPORT_VERSION) {
    return {
      ok: false,
      error: `This export is from an unsupported older version (v${version}).`,
    };
  }

  const rawData = input.data;
  if (rawData === undefined) {
    return finish({} as Record<string, unknown>);
  }
  if (!isPlainObject(rawData)) {
    return { ok: false, error: 'The envelope\'s "data" block must be an object keyed by collection.' };
  }
  return finish(rawData);
}

function finish(rawData: Record<string, unknown>): ImportParseResult {
  // Unknown collections are rejected BY NAME before any row is read.
  for (const key of Object.keys(rawData)) {
    if (!KNOWN_COLLECTIONS.has(key)) {
      return {
        ok: false,
        error: `Unknown collection "${key}" in the export file. This app imports exactly: ${EXPORT_COLLECTIONS.join(", ")}.`,
      };
    }
  }

  const rows = {} as ImportRows;
  let totalRows = 0;

  for (const collection of EXPORT_COLLECTIONS) {
    const raw = rawData[collection];
    if (raw === undefined) {
      rows[collection] = [];
      continue;
    }
    if (!Array.isArray(raw)) {
      return { ok: false, error: `Collection "${collection}" must be an array of rows.` };
    }

    const seen = new Set<string>();
    const normalized: ImportRow[] = [];
    for (const row of raw) {
      if (!isPlainObject(row)) {
        return { ok: false, error: `Collection "${collection}" contains a row that is not an object.` };
      }
      const id = row.id;
      if (typeof id !== "string" || id.length === 0) {
        return { ok: false, error: `Collection "${collection}" contains a row without a usable string id.` };
      }
      if (seen.has(id)) {
        return {
          ok: false,
          error: `Collection "${collection}" contains duplicate rows for id "${id}". Re-export your data and try again.`,
        };
      }
      seen.add(id);
      normalized.push(stripSecrets(row));
    }
    rows[collection] = normalized;
    totalRows += normalized.length;
  }

  // ---- FK pre-emption (before anything reaches Prisma) --------------------
  const idSets = new Map<ExportCollection, Set<string>>();
  for (const collection of EXPORT_COLLECTIONS) {
    idSets.set(
      collection,
      new Set(rows[collection].map((row) => String(row.id))),
    );
  }

  for (const collection of EXPORT_COLLECTIONS) {
    const specs = IMPORT_FK_MAP[collection];
    if (specs.length === 0) continue;
    for (const row of rows[collection]) {
      for (const spec of specs) {
        const value = row[spec.field];
        if (value === undefined) continue;
        if (value === null) continue; // already null — stays null
        const resolvable = idSets.get(spec.target)?.has(String(value)) ?? false;
        if (resolvable) continue;
        if (spec.required) {
          return {
            ok: false,
            error: `Collection "${collection}" row "${String(row.id)}" references a ${spec.target} (${spec.field}: "${String(value)}") that is not in this export. The file is incomplete or corrupted.`,
          };
        }
        // Dangling OPTIONAL FK → the schema's own SetNull semantics.
        row[spec.field] = null;
      }
    }
  }

  // ---- the folders topological sort (self-referential FK) ------------------
  const sorted = sortFoldersParentsFirst(rows.folders);
  if (typeof sorted === "string") {
    return { ok: false, error: sorted };
  }
  rows.folders = sorted;

  return { ok: true, rows, totalRows };
}

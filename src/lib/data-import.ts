import {
  ASSIGNMENT_PRIORITIES,
  ASSIGNMENT_TYPES,
  CARD_DIFFICULTIES,
  CHAT_ROLES,
  CHAT_SURFACES,
  hhmmMinutes,
  preferencesSchema,
  REPEATS,
  TASK_PRIORITIES,
} from "./validation";

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

/** The documented body cap. S124/BY3: 10 → 25 MiB — the export emits base64
 *  file payloads INLINE (a 2 MiB upload inflates ×4/3), so the old cap
 *  rejected the user's OWN backup once ~4-5 max-size files landed (~13 MiB):
 *  the "own your data" round-trip downloaded a file the in-app restore then
 *  413'd. 25 MiB covers the realistic round-trip ADR-019 promises (~18
 *  max-size files' base64 + content). */
export const IMPORT_MAX_BYTES = 25 * 1024 * 1024;

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

/**
 * S122/BW8 — the OPERATIVE route FK maps, derived from IMPORT_FK_MAP (the
 * single source). The import route consumed its own hand-maintained twins
 * for 100+ sessions while this seam's map carried the unit-pinned copy —
 * two map families that could drift apart silently (a new FK-bearing
 * collection would fail the completeness pin while shipping with no
 * route-side pre-emption). The derivation is mechanical; the SEMANTIC
 * split stays where it belongs: this seam's parseImportEnvelope resolves
 * FKs ENVELOPE-ONLY (a self-contained validator), the ROUTE resolves
 * envelope ∪ the owner's live rows (knownIds — the account-aware
 * semantics). A same-collection target renders as "self" (folders.
 * parentId) exactly as the route's resolution loop expects.
 */
export const IMPORT_REQUIRED_FKS: Partial<
  Record<ExportCollection, Record<string, ExportCollection>>
> = deriveRequiredFks();

export const IMPORT_OPTIONAL_FKS: Partial<
  Record<ExportCollection, Record<string, ExportCollection | "self">>
> = deriveOptionalFks();

function deriveRequiredFks() {
  const out: Partial<Record<ExportCollection, Record<string, ExportCollection>>> = {};
  for (const [collection, specs] of Object.entries(IMPORT_FK_MAP) as [
    ExportCollection,
    ImportFkSpec[],
  ][]) {
    for (const spec of specs) {
      if (!spec.required) continue;
      (out[collection] ??= {})[spec.field] = spec.target;
    }
  }
  return out;
}

function deriveOptionalFks() {
  const out: Partial<Record<ExportCollection, Record<string, ExportCollection | "self">>> = {};
  for (const [collection, specs] of Object.entries(IMPORT_FK_MAP) as [
    ExportCollection,
    ImportFkSpec[],
  ][]) {
    for (const spec of specs) {
      if (spec.required) continue;
      const target: ExportCollection | "self" =
        spec.target === collection ? "self" : spec.target;
      (out[collection] ??= {})[spec.field] = target;
    }
  }
  return out;
}

export type ImportRow = Record<string, unknown>;
export type ImportRows = Record<ExportCollection, ImportRow[]>;

export type ImportParseResult =
  | { ok: true; rows: ImportRows; totalRows: number }
  | { ok: false; error: string };

const KNOWN_COLLECTIONS = new Set<string>(EXPORT_COLLECTIONS);

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** S126/CA2 — the ONE row-id validator (the s126 persistence audit's B-M2).
 * The import route's inline copy checked only `typeof id === "string"` while
 * this seam rejected empty ids — twin validators that had drifted, and the
 * ROUTE (the production path) was the lenient one: an `id: ""` row imported
 * and minted a row with an empty-string primary key no
 * /api/[collection]/[id] route can ever address. Both call sites now share
 * THIS function (the BW8 single-source doctrine, extended from the FK maps
 * to the row-id rule). Returns the rejection message or null. */
export function importRowIdError(collection: string, row: unknown): string | null {
  if (!isPlainObject(row)) {
    return `Collection "${collection}" contains a row that is not an object.`;
  }
  const id = row.id;
  if (typeof id !== "string" || id.length === 0) {
    return `Collection "${collection}" contains a row without a usable string id.`;
  }
  // S130/CE7: the id-length atom (idField's own 64) — every interactive
  // boundary bounds ids at 64; the third entry point must not mint a
  // 1 M-char primary key (every index entry and FK probe carries it).
  if (id.length > 64) {
    return `Collection "${collection}" contains a row whose id exceeds 64 characters — the app's own boundary for ids.`;
  }
  return null;
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
 * S117/BR1: exported for the import route (the S23 contract's parents-first
 * restore order — the seam's unit pins cover it end-to-end).
 */
export function sortFoldersParentsFirst(folders: ImportRow[]): ImportRow[] | string {
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
      // S126/CA2: the shared validator (the route's loop calls the same
      // function — one rule, no drift).
      const idError = importRowIdError(collection, row);
      if (idError !== null) return { ok: false, error: idError };
      const id = (row as ImportRow).id as string;
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

// ---------------------------------------------------------------------------
// S119/BT1b — the per-row guard. The write loop historically persisted
// envelope fields VERBATIM (only passwordHash/userId stripped), making the
// import the unguarded THIRD entry point to several route-enforced rules:
// a hand-edited "backup" could store a javascript: link URL (files-view
// renders href={file.url} target=_blank — script execution in the app
// origin on click), wrong field TYPES surfaced as PrismaClientValidationError
// → HTTP 500 (violating the 400-bad-input contract), and unbounded strings
// rode the body cap (10 MiB at the time — 25 MiB since S124/BY3) straight into SQLite. The guard runs BEFORE the
// write loop: every value must be a primitive (the export format's own
// serialization contract — Date → ISO, JSON columns → strings), strings are
// capped (generously — the caps stop abuse, never legitimate backups), and
// the files rows additionally satisfy the BR4 http(s)-only URL rule and the
// BS5 name/shape rules, exactly like both interactive entry points.
// ---------------------------------------------------------------------------

/** The generic per-field cap. 1M chars — 100× the largest real field (a
 *  2000-char card face), far below anything that could abuse a row. */
export const IMPORT_FIELD_MAX_CHARS = 1_000_000;

/** The files.data cap: ≈ the 2 MiB binary ceiling as base64 (the upload
 *  route's own MAX_UPLOAD_BYTES contract). */
export const IMPORT_FILE_DATA_MAX_CHARS = 2_800_000;

// S130/CE7 — the per-field length registry: validation.ts's own atoms,
// mirrored at the third entry point (a hand-edited backup must not
// persist rows the interactive routes would 400 — a 900-K-char
// tasks.notes bloats every list read). Keyed `collection.field`; unknown
// fields keep the generic 1 M default below. The consistency census in
// tests/data-import.test.ts pins the key set; the atom VALUES are the
// validation.ts single source (title/name 200, notes 5000, description
// 1000 or 5000 per collection, front/back 2000, tags 2000, room 100,
// location 200, the JSON-blob columns 100k).
export const IMPORT_FIELD_LENGTHS: Record<string, number> = {
  "subjects.name": 200,
  "taskLists.name": 200,
  "tasks.title": 200,
  "tasks.notes": 5_000,
  "tasks.subtasks": 100_000,
  "assignments.title": 200,
  "assignments.description": 5_000,
  "exams.title": 200,
  "exams.location": 200,
  "exams.topics": 100_000,
  "events.title": 200,
  "events.location": 200,
  "events.description": 1_000,
  "events.reminders": 100_000,
  "timetableClasses.name": 200,
  "timetableClasses.room": 100,
  "notebooks.name": 200,
  "notes.title": 200,
  "notes.content": 100_000,
  "notes.tags": 2_000,
  "flashcardDecks.name": 200,
  "flashcardDecks.description": 1_000,
  "cards.front": 2_000,
  "cards.back": 2_000,
  "practiceTests.title": 200,
  "practiceTests.questions": 100_000,
  "studyGroups.name": 200,
  "grades.title": 200,
};

const IMPORT_FILE_URL_MAX_CHARS = 2000;
const IMPORT_FILE_NAME_MAX_CHARS = 200;

/** The guard's rejection — names the collection and row index so the
 *  operator can find the offender in their backup file. */
export class ImportRowError extends Error {
  constructor(collection: string, index: number, detail: string) {
    super(`Invalid ${collection}[${index}] row: ${detail}`);
    this.name = "ImportRowError";
  }
}

function fieldCapFor(collection: string, field: string): number {
  // S130/CE7: the registry first (the validation.ts atom), then the files
  // special case, then the generic 1 M default.
  const registered = IMPORT_FIELD_LENGTHS[`${collection}.${field}`];
  if (registered !== undefined) return registered;
  if (collection === "files" && field === "data") {
    return IMPORT_FILE_DATA_MAX_CHARS;
  }
  return IMPORT_FIELD_MAX_CHARS;
}

// ---- S126/CA14: the import's domain caps -------------------------------------
// The per-row guard historically checked ONLY primitive types, string caps,
// and the files rules — a hand-edited "backup" stored rows that violated
// every route-enforced invariant (grades 900/100 rendering 900%, maxScore 0
// feeding NaN into the GPA math, progress 500, dayOfWeek 99, out-of-
// vocabulary enums breaking the badge/color meta maps, non-JSON strings in
// the JSON columns throwing in the client parse). The caps below are the
// CHEAP time-independent invariants — everything with no clock/state
// dependence — and the vocabularies come from validation.ts's single
// source (the enums the routes themselves enforce).

/** Enum vocabularies keyed by collection.field (validation.ts's own sets). */
const ENUM_VOCABULARIES: Record<string, readonly string[]> = {
  "tasks.priority": TASK_PRIORITIES,
  "tasks.repeat": REPEATS,
  "assignments.type": ASSIGNMENT_TYPES,
  "assignments.priority": ASSIGNMENT_PRIORITIES,
  "cards.difficulty": CARD_DIFFICULTIES,
  "chatMessages.role": CHAT_ROLES,
  "chatMessages.surface": CHAT_SURFACES,
};

/** The JSON-string columns (the schema's `// JSON ...` family) — the
 *  client JSON.parses every one of them. */
const JSON_STRING_FIELDS: Record<string, readonly string[]> = {
  tasks: ["subtasks"],
  practiceTests: ["questions", "topics"],
  events: ["reminders"],
  notes: ["tags"],
  studyGroups: ["members"],
};

function checkDomainCaps(collection: string, row: ImportRow, index: number): void {
  // The grades pair (the BZ6 route guard, shared by the third entry point):
  // an absent maxScore means the CREATE default 100 (the honest row state —
  // a bare 150 is honestly "150 of the default 100" and rejected).
  if (collection === "grades") {
    const score = row.score;
    const maxScore = row.maxScore;
    if (typeof score === "number" && score < 0) {
      throw new ImportRowError(collection, index, 'field "score" must be 0 or greater.');
    }
    if (maxScore !== undefined && maxScore !== null) {
      if (typeof maxScore !== "number" || maxScore <= 0) {
        throw new ImportRowError(
          collection,
          index,
          'field "maxScore" must be a number greater than 0 (the Grade Tracker divides by it).',
        );
      }
      if (typeof score === "number" && score > maxScore) {
        throw new ImportRowError(
          collection,
          index,
          'field "score" cannot be higher than "maxScore" (the same guard every create route enforces).',
        );
      }
    } else if (typeof score === "number" && score > 100) {
      throw new ImportRowError(
        collection,
        index,
        'field "score" cannot be higher than the default maxScore of 100.',
      );
    }
  }

  if (collection === "assignments") {
    const progress = row.progress;
    if (progress !== undefined && progress !== null) {
      if (typeof progress !== "number" || progress < 0 || progress > 100) {
        throw new ImportRowError(
          collection,
          index,
          'field "progress" must be a number between 0 and 100.',
        );
      }
    }
  }

  if (collection === "timetableClasses") {
    const dayOfWeek = row.dayOfWeek;
    if (dayOfWeek !== undefined && dayOfWeek !== null) {
      if (typeof dayOfWeek !== "number" || dayOfWeek < 0 || dayOfWeek > 6) {
        throw new ImportRowError(
          collection,
          index,
          'field "dayOfWeek" must be a number between 0 (Monday) and 6 (Sunday).',
        );
      }
    }
  }

  // S127/CB11: the CA14 contract completed — the remaining cheap,
  // time-independent invariants every route's Zod boundary enforces, so
  // the third entry point can no longer store rows the interactive ones
  // reject (each cap mirrors its route's atom verbatim).
  if (collection === "exams") {
    const duration = row.duration;
    if (duration !== undefined && duration !== null) {
      if (typeof duration !== "number" || !Number.isInteger(duration) || duration < 5 || duration > 600) {
        throw new ImportRowError(
          collection,
          index,
          'field "duration" must be a whole number of minutes between 5 and 600.',
        );
      }
    }
  }

  if (collection === "practiceTests") {
    const durationMinutes = row.durationMinutes;
    if (durationMinutes !== undefined && durationMinutes !== null) {
      if (
        typeof durationMinutes !== "number" ||
        !Number.isInteger(durationMinutes) ||
        durationMinutes < 1 ||
        durationMinutes > 600
      ) {
        throw new ImportRowError(
          collection,
          index,
          'field "durationMinutes" must be a whole number between 1 and 600.',
        );
      }
    }
  }

  if (collection === "focusSessions") {
    const durationSeconds = row.durationSeconds;
    if (durationSeconds !== undefined && durationSeconds !== null) {
      if (
        typeof durationSeconds !== "number" ||
        !Number.isInteger(durationSeconds) ||
        durationSeconds < 1 ||
        durationSeconds > 86_400
      ) {
        throw new ImportRowError(
          collection,
          index,
          'field "durationSeconds" must be a whole number between 1 and 86400 (it feeds every focus stat).',
        );
      }
    }
  }

  if (collection === "grades") {
    const weight = row.weight;
    if (weight !== undefined && weight !== null) {
      if (typeof weight !== "number" || weight < 0 || weight > 100) {
        throw new ImportRowError(
          collection,
          index,
          'field "weight" must be a number between 0 and 100 (it feeds the weighted average).',
        );
      }
    }
  }

  if (collection === "events") {
    const startDate = row.startDate;
    const endDate = row.endDate;
    if (typeof startDate === "string" && typeof endDate === "string") {
      // The BU22 ordering guard: Date.parse values, never raw string
      // ordering (the BV10 mixed-offset lesson).
      const startMs = Date.parse(startDate);
      const endMs = Date.parse(endDate);
      if (
        !Number.isNaN(startMs) &&
        !Number.isNaN(endMs) &&
        endMs < startMs
      ) {
        throw new ImportRowError(
          collection,
          index,
          'field "endDate" must be after "startDate" (the same guard every events route enforces).',
        );
      }
    }
  }

  if (collection === "timetableClasses") {
    const startTime = row.startTime;
    const endTime = row.endTime;
    if (startTime !== undefined && startTime !== null) {
      if (typeof startTime !== "string" || hhmmMinutes(startTime) === null) {
        throw new ImportRowError(
          collection,
          index,
          'field "startTime" must be a HH:MM time (the route atom admits padded or unpadded hours, 00:00-23:59).',
        );
      }
    }
    if (endTime !== undefined && endTime !== null) {
      if (typeof endTime !== "string" || hhmmMinutes(endTime) === null) {
        throw new ImportRowError(
          collection,
          index,
          'field "endTime" must be a HH:MM time (the route atom admits padded or unpadded hours, 00:00-23:59).',
        );
      }
    }
    if (
      typeof startTime === "string" &&
      typeof endTime === "string" &&
      hhmmMinutes(startTime) !== null &&
      hhmmMinutes(endTime) !== null &&
      (hhmmMinutes(endTime) as number) <= (hhmmMinutes(startTime) as number)
    ) {
      throw new ImportRowError(
        collection,
        index,
        'field "endTime" must be after "startTime" (the BW7/BX1 minutes compare — never raw strings).',
      );
    }
  }

  for (const [field, vocabulary] of Object.entries(ENUM_VOCABULARIES)) {
    const [owner, key] = field.split(".");
    if (owner !== collection) continue;
    const value = row[key];
    if (value === undefined || value === null) continue;
    if (typeof value !== "string" || !vocabulary.includes(value)) {
      throw new ImportRowError(
        collection,
        index,
        `field "${key}" must be one of: ${vocabulary.join(", ")}.`,
      );
    }
  }

  const jsonFields = JSON_STRING_FIELDS[collection];
  if (jsonFields) {
    for (const field of jsonFields) {
      const value = row[field];
      if (value === undefined || value === null) continue;
      if (typeof value !== "string") {
        throw new ImportRowError(
          collection,
          index,
          `field "${field}" must be a JSON string (the export format serializes the array).`,
        );
      }
      let parsed: unknown;
      try {
        parsed = JSON.parse(value);
      } catch {
        throw new ImportRowError(
          collection,
          index,
          `field "${field}" is not valid JSON — re-export a fresh backup and try again.`,
        );
      }
      // S127/CB11: the studyGroups members array cap (<= 50, the route's
      // own bound) — the JSON-parse check alone admitted a 10^4-member
      // group the view then rendered wholesale.
      if (collection === "studyGroups" && field === "members") {
        if (!Array.isArray(parsed) || parsed.length > 50) {
          throw new ImportRowError(
            collection,
            index,
            'field "members" must be a JSON array of at most 50 members.',
          );
        }
      }
    }
  }
}

// ---------------------------------------------------------------------------
// S127/CB19 — the envelope's user profile block, restored. The export
// deliberately carries a hashless publicUser block; the import route never
// read it, so school, grade level, study goal, theme, accent, avatar, and
// notifications silently dropped on restore — a quiet violation of the
// ADR-019 "own your data" round-trip. The patch extracts ONLY the
// preference fields (identity — id, email, name — never rides); a garbage
// or absent block stays ignored (the pre-CB19 tolerance contract).
// ---------------------------------------------------------------------------

// S128/CC1: the WHITELIST — only these seven preference keys ride the
// patch. preferencesSchema legitimately carries a `displayName` leg (the
// Settings alias for the fullName COLUMN), but the User model has no
// displayName field: the pre-CC1 copy-everything loop put it in the
// tx.user.update data, PrismaClientValidationError rolled back the ENTIRE
// all-or-nothing restore with a misleading "row whose fields do not match"
// 400, and a name-shaped field rode a seam whose contract says identity
// never rides. The whitelist makes the declared return type the enforced
// truth (displayName, id, email, name are all silently dropped).
const PROFILE_PATCH_KEYS = [
  "themeMode",
  "accentColor",
  "avatarEmoji",
  "notificationsEnabled",
  "schoolName",
  "gradeLevel",
  "studyGoalHours",
] as const;

export function importProfilePatch(
  user: unknown,
): Partial<{
  themeMode: "light" | "dark" | "system";
  accentColor: string;
  avatarEmoji: string;
  notificationsEnabled: boolean;
  schoolName: string;
  gradeLevel: string;
  studyGoalHours: number;
}> | null {
  if (typeof user !== "object" || user === null) return null;
  const parsed = preferencesSchema.safeParse(user);
  if (!parsed.success) return null;
  // Strip undefined legs — the patch carries only what the envelope set,
  // through the closed whitelist above.
  const patch: Record<string, unknown> = {};
  for (const key of PROFILE_PATCH_KEYS) {
    const value = (parsed.data as Record<string, unknown>)[key];
    if (value !== undefined) patch[key] = value;
  }
  return Object.keys(patch).length > 0 ? patch : null;
}

/** Validate one imported row against the export format's primitive-value
 *  contract + the files-specific link rules. Throws ImportRowError (the
 *  route maps it to a 400 with the message as the actionable copy). */
export function sanitizeImportRow(
  collection: string,
  row: ImportRow,
  index = 0,
): ImportRow {
  checkDomainCaps(collection, row, index);
  for (const [field, value] of Object.entries(row)) {
    if (value === null) continue;
    const kind = typeof value;
    if (kind !== "string" && kind !== "number" && kind !== "boolean") {
      throw new ImportRowError(
        collection,
        index,
        `field "${field}" must be a string, number, boolean, or null — the export format serializes every value to a primitive.`,
      );
    }
    if (typeof value === "string") {
      const cap = fieldCapFor(collection, field);
      if (value.length > cap) {
        throw new ImportRowError(
          collection,
          index,
          `field "${field}" is ${value.length} characters — the import caps it at ${cap.toLocaleString("en-US")}.`,
        );
      }
    }
  }

  if (collection === "files") {
    const name = row.name;
    if (
      typeof name !== "string" ||
      name.trim().length < 1 ||
      name.length > IMPORT_FILE_NAME_MAX_CHARS
    ) {
      throw new ImportRowError(
        collection,
        index,
        `field "name" must be a non-empty string of at most ${IMPORT_FILE_NAME_MAX_CHARS} characters.`,
      );
    }
    const url = row.url;
    if (url !== undefined && url !== null) {
      if (typeof url !== "string" || url.length > IMPORT_FILE_URL_MAX_CHARS) {
        throw new ImportRowError(
          collection,
          index,
          `field "url" must be a string of at most ${IMPORT_FILE_URL_MAX_CHARS} characters.`,
        );
      }
      let parsed: URL;
      try {
        parsed = new URL(url);
      } catch {
        throw new ImportRowError(
          collection,
          index,
          `field "url" must be a valid URL.`,
        );
      }
      if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
        throw new ImportRowError(
          collection,
          index,
          `field "url" must be an http(s) link — "${parsed.protocol}" URLs are rejected by every file-link entry point.`,
        );
      }
    }
    const data = row.data;
    if (
      data !== undefined &&
      data !== null &&
      (typeof data !== "string" || data.length > IMPORT_FILE_DATA_MAX_CHARS)
    ) {
      throw new ImportRowError(
        collection,
        index,
        `field "data" must be base64 text of at most ${IMPORT_FILE_DATA_MAX_CHARS.toLocaleString("en-US")} characters (the 2 MiB upload ceiling).`,
      );
    }
  }

  return row;
}

import {
  ASSIGNMENT_PRIORITIES,
  ASSIGNMENT_TYPES,
  CALCULATOR_MODES,
  CARD_DIFFICULTIES,
  CHAT_ROLES,
  CHAT_SURFACES,
  EXAM_TYPES,
  FOCUS_SESSION_MODES,
  GRADE_TYPES,
  HOLIDAY_TYPES,
  hhmmMinutes,
  NOTE_COLORS,
  NOTE_KINDS,
  NOTE_LANGUAGES,
  preferencesSchema,
  REPEATS,
  TASK_PRIORITIES,
  WEEK_TYPES,
} from "./validation";

// ---------------------------------------------------------------------------
// The data-import seam (S23/ADR-021). Pure — unit-pinned by
// tests/data-import.test.ts. validateImportEnvelope is the PRODUCTION-
// consumed stage (the route's single source — CH4): the envelope identity,
// the shape rules, and the required-FK null/non-string rejection. The
// richer parseImportEnvelope wrapper is the unit-pinned REFERENCE parser
// (envelope-only FK nulling, secret strip, topo sort) — the route consumes
// the stateless stages + its own account-aware twins instead (a pure seam
// cannot see the database; S135/CJ8 reworded this header after the audit's
// I-1 found it overstating the wrapper's role). Pre-validating here matters
// because Prisma enforces FKs on SQLite (P2003): a dangling optional FK
// must be NULLED at the seam (the schema's own SetNull semantics) and a
// dangling REQUIRED cards.deckId is a corrupt envelope that must never
// reach the database mid-transaction.
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
 *  413'd. S137/CL2: 25 → 64 MiB — the BY3-era "~18 max-size files at
 *  25 MiB" arithmetic was ~2× off (one 2 MiB upload inflates to
 *  ceil(2,097,152/3)×4 = 2,796,204 base64 chars, so 25 MiB covers only
 *  ~9.4 files — a user with 10+ near-cap files, achievable inside ONE
 *  15-min upload budget of 20, downloaded a backup their own restore then
 *  413'd — the exact BY3 class at 2× the documented threshold). 64 MiB
 *  covers ~23 max-size files — the realistic round-trip promise with
 *  margin. The arithmetic is machine-pinned in tests/data-import.test.ts
 *  (the floor(cap / inflation) >= 18 leg) so the next re-size reconciles
 *  with the REAL bound, not a prose claim. */
export const IMPORT_MAX_BYTES = 64 * 1024 * 1024;

/** S144/CS5 (audit B-L2) — the documented ROW ceiling. The byte cap bounds
 *  the BODY, not the parsed object tree: a 64 MiB envelope of minimal rows
 *  parses into ~10⁶ row objects — several hundred MB of resident memory
 *  per hostile request with no deadline (the parse-memory amplification;
 *  auth-gated and rate-limited, but one request inside the budget
 *  suffices). 100,000 rows is comfortably above any real account (the
 *  volume-stress profile tops out in the hundreds) and far below the ~10⁶
 *  the byte cap admits — the amplification bound without touching the
 *  all-or-nothing ADR-021 shape. The CHECK lives in the route (the
 *  byte-cap precedent: cap constants in the seam, checks at the door);
 *  the value and its reconciliation with IMPORT_MAX_BYTES are
 *  machine-pinned in tests/data-import.test.ts, the route wiring
 *  census-pinned in tests/script-conventions.test.ts. */
export const IMPORT_MAX_ROWS = 100_000;

/** The import-side secret guard — the file never speaks for the account:
 *  passwordHash and userId are stripped from every row (the importer's own
 *  id is re-attached by the route, never by the file). */
export const NEVER_IMPORT_FIELDS = ["passwordHash", "userId"] as const;

/** S137/CL6 — the system-timestamp sanity band (audit B-L1, the
 *  window-poison vector): createdAt/updatedAt must parse inside
 *  [2000-01-01, now + 24h] or the row rejects BEFORE the transaction with
 *  the named copy. The floor admits every real account (the app's own
 *  epoch is far later); the 24 h ceiling admits a clock-skewed client;
 *  the poison vectors (9999 / 1900) reject. */
const IMPORT_DATE_FLOOR_MS = Date.parse("2000-01-01T00:00:00.000Z");
const IMPORT_DATE_CEILING_MS = 24 * 60 * 60 * 1000;

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
/**
 * S135/CJ2 (audit A-M1): the canonical restore order, exported from the seam.
 * Previously route-local — a collection dropped from the route's copy
 * compiled clean and its rows were silently ignored on restore (the route's
 * `parsed` map is only populated inside the `for (const collection of
 * IMPORT_ORDER)` loop). The order is seam knowledge (referents before
 * referees — folders before files, decks before cards, subjects before
 * everything subject-tagged); the manifest-consistency census pins
 * set-equality against EXPORT_COLLECTIONS so a dropped or added collection
 * fails BOTH directions.
 */
export const IMPORT_ORDER = [
  "subjects",
  "taskLists",
  "folders",
  "notebooks",
  "decks",
  "tasks",
  "assignments",
  "exams",
  "events",
  "timetableClasses",
  "notes",
  "cards",
  "practiceTests",
  "studyGroups",
  "grades",
  "focusSessions",
  "files",
  "chatMessages",
  "calcHistory",
  "holidays",
] as const;

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

// ---------------------------------------------------------------------------
// S141/CP3 — the restore-availability pre-flight helpers (the A-M3 +
// A-I1 family). The S140 route scanned ALL 20 collections with
// unconditional full-table findMany calls (O(account) per import — pure
// waste for absent collections, and the heaviest table per import was
// the CARDS deck-join) and then ran findFirst → update|create (2
// queries/row) INSIDE one 60 s interactive transaction, holding the
// single-node SQLite RESERVED lock while interleaving reads and the
// notes sanitize CPU. The S141 restructure probes ONLY what the
// envelope touches with IN-lists at O(envelope) cost and hoists every
// read + all CPU out of the transaction (the all-or-nothing contract
// itself is PRESERVED — see the route's restructured write loop).
// ---------------------------------------------------------------------------

/**
 * S141/CP3 — the id-chunk size for the IN-probes. SQLite 3.46 (the
 * repo's engine, probed) carries the 32 766-variable class; the IN-list
 * was verified working at 20 000 ids — 5 000 leaves 6× headroom while
 * keeping probe counts low.
 */
export const IMPORT_PROBE_CHUNK = 5_000;

/**
 * S141/CP3 — the row-chunk size for createMany writes. The widest import
 * row carries ~20 fields → 10 000 bound parameters per 500-row call,
 * 3× under the ceiling (createMany binding verified at 1 000 rows × 5
 * fields empirically).
 */
export const IMPORT_CREATE_CHUNK = 500;

/**
 * S141/CP3 (A-I1 closed) — the DB-probe target set: every collection
 * that carries envelope rows, PLUS every FK target of a collection that
 * does (a cards-only envelope still needs decks knownIds for the
 * required-FK resolution contract — the pinned s23 case; folders
 * self-parenting rides the same derivation). Derived from
 * IMPORT_FK_MAP (the single source — a new FK-bearing collection extends
 * the probe set mechanically). Collections OUTSIDE the set are never
 * queried: the pre-S141 route's 20 unconditional full-table scans cost
 * O(account) per import regardless of backup size.
 */
export function importProbeTargets(collectionsWithRows: readonly string[]): ExportCollection[] {
  const withRows = new Set(collectionsWithRows);
  const targets = new Set<ExportCollection>();
  for (const collection of withRows) {
    targets.add(collection as ExportCollection);
  }
  for (const [source, specs] of Object.entries(IMPORT_FK_MAP) as [
    ExportCollection,
    ImportFkSpec[],
  ][]) {
    if (!withRows.has(source)) continue;
    for (const spec of specs) targets.add(spec.target);
  }
  // IMPORT_ORDER filters AND orders (referents before referees — the
  // same topo order the write loop honors).
  return IMPORT_ORDER.filter((collection) => targets.has(collection));
}

/**
 * S141/CP3 — chunk an id list at the probe size (the IN-probe's
 * parameter-bounded shape). Order-preserving; the empty list yields
 * zero chunks (an absent collection is never queried at all).
 */
export function chunkImportIds<T>(ids: readonly T[]): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < ids.length; i += IMPORT_PROBE_CHUNK) {
    chunks.push(ids.slice(i, i + IMPORT_PROBE_CHUNK) as T[]);
  }
  return chunks;
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

/** S137/CL11 (audit A-I3): exported — the route's byte-identical private
 *  twin (stripNeverImportFields) deleted; BOTH sites consume THIS loop
 *  over NEVER_IMPORT_FIELDS (the BW8 single-source doctrine's last inch —
 *  a future edit to one copy would have drifted silently). */
export function stripSecrets(row: ImportRow): ImportRow {
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
  // S144/CS2 (audit B-M1): the CURSOR dequeue — the previous
  // `queue.shift()` was O(n) per call, O(n²) over the loop (measured on
  // this Node: 27 ms at 2×10⁴ rows → 2,842 ms at 2×10⁵ — 25x rows,
  // 104x time; ~12 minutes projected at the byte cap's ~10⁶ minimal-row
  // ceiling), and the topo sort is the only superlinear PRE-TX stage on
  // an otherwise-linear path, so a single hostile envelope pinned the
  // single-threaded event loop sitewide. The queue only ever GROWS
  // during iteration (children are pushed on the in-degree
  // decrement-to-zero, never removed; an id is pushed exactly once —
  // the init push happens only for unresolvable parents, whose
  // in-degree stays 0 so the decrement path cannot re-push them), so a
  // cursor preserves the FIFO/BFS emission order and the
  // emitted-set/cycle-rejection semantics exactly — at O(n).
  for (let qi = 0; qi < queue.length; qi += 1) {
    const id = queue[qi] as string;
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
    // S133/CH6: the offender list is attacker-controlled — a max-size
    // cyclic folder envelope (IMPORT_MAX_BYTES — never a bare number
    // here) would otherwise echo every un-emitted id back in the 400
    // body (a ~30 MB error string at the old cap, worse at 64 MiB).
    // First 10 + the count; the operator still finds the cycle in
    // their file.
    const shown = offenders.slice(0, 10);
    const rest =
      offenders.length > shown.length
        ? ` …and ${offenders.length - shown.length} more`
        : "";
    return `folders contains a parentId cycle involving: ${shown.join(", ")}${rest}. Fix the folder tree in the source account and re-export.`;
  }
  return ordered;
}

/** S133/CH4 — the stateless envelope validator, THE single source the
 * production route consumes (the S126 lesson-2 hazard closed: the
 * pre-CH4 seam's parseImportEnvelope had ZERO production callers while
 * the route ran a drifted inline twin — the seam tolerated a missing
 * data block and split the version 400s differently). The messages and
 * behaviors are the ROUTE's shipped contract (the e2e-visible behavior
 * wins): a missing data block 400s, a non-integer version folds into
 * the newer-version 400, unknown collections reject by name, and every
 * declared collection must be an array. The account-aware halves (the
 * FK resolution against envelope ∪ owned-existing rows, the secrets
 * re-attachment) stay route-side BY DESIGN — a pure seam cannot see the
 * database. */
export type ImportEnvelopeCheck =
  | { ok: true; data: Record<string, unknown> }
  | { ok: false; error: string };

export function validateImportEnvelope(
  input: unknown,
): ImportEnvelopeCheck {
  if (!isPlainObject(input)) {
    return { ok: false, error: `Expected a ${DATA_EXPORT_FORMAT} envelope.` };
  }
  if (input.format !== DATA_EXPORT_FORMAT) {
    return {
      ok: false,
      error: `Unrecognized export format — expected "${DATA_EXPORT_FORMAT}".`,
    };
  }
  // The route's folding: a non-number, non-integer, or future version all
  // answer the actionable newer-version 400 (a garbled version is
  // indistinguishable from an incompatible one at the restore boundary).
  const version = input.version;
  if (
    typeof version !== "number" ||
    !Number.isInteger(version) ||
    version > DATA_EXPORT_VERSION
  ) {
    return {
      ok: false,
      error: `This export was written by a newer version of StudyFlow (version ${String(
        version,
      )} > ${DATA_EXPORT_VERSION}). Update the app before restoring it.`,
    };
  }
  if (version < DATA_EXPORT_VERSION) {
    return {
      ok: false,
      error: `This export is from an unsupported older version (v${String(version)}).`,
    };
  }
  if (!isPlainObject(input.data)) {
    return { ok: false, error: "The envelope carries no data object." };
  }
  // Unknown collections are rejected BY NAME (S117/BR1).
  for (const key of Object.keys(input.data)) {
    if (!KNOWN_COLLECTIONS.has(key)) {
      return {
        ok: false,
        error: `Unknown collection "${key}" in the export file. This app imports exactly: ${EXPORT_COLLECTIONS.join(", ")}.`,
      };
    }
  }
  // Every declared collection must be an array.
  for (const collection of EXPORT_COLLECTIONS) {
    const rows = input.data[collection];
    if (rows === undefined) continue;
    if (!Array.isArray(rows)) {
      return {
        ok: false,
        error: `The "${collection}" collection must be an array.`,
      };
    }
  }
  // S135/CJ4 (audit A-L2): a REQUIRED FK can never be null or a non-string
  // in ANY branch — pre-fix those rows sailed the seam (the FK loop's
  // undefined/null early-continues + the route's typeof-string guard) and
  // died at the Prisma write as the GENERIC "fields do not match" 400, the
  // ADR-021 actionable-message contract silently degraded for one
  // hand-crafted shape. undefined (absent) stays legal here: the UPDATE
  // branch's untouched case — the route owns the create-branch rejection
  // via its knownIds census.
  for (const collection of EXPORT_COLLECTIONS) {
    const specs = IMPORT_FK_MAP[collection].filter((s) => s.required);
    if (specs.length === 0) continue;
    const rows = input.data[collection];
    if (!Array.isArray(rows)) continue;
    for (const row of rows) {
      if (!isPlainObject(row)) continue;
      for (const spec of specs) {
        const value = row[spec.field];
        if (value === undefined) continue;
        if (value === null || typeof value !== "string") {
          return {
            ok: false,
            error: `Collection "${collection}" row "${String(row.id)}" carries a ${spec.field} that is not a string id — a required reference can never be null or a non-string value.`,
          };
        }
      }
    }
  }
  // S159/DH1 (audit B/L-1): the CJ4 mirror at the OPTIONAL boundary. A
  // non-string non-null optional FK previously sailed BOTH validators —
  // this validator's own finish() nulling loop String()-coerced it into
  // the SetNull branch (clean import through the unit-pinned reference
  // parser), while the route's twin guard SKIPPED it
  // (`typeof value !== "string" → continue`) and the raw value rode to
  // Prisma → PrismaClientValidationError → the GENERIC "fields do not
  // match" 400 — the same actionable-message degradation CJ4 closed for
  // the required twin, on the optional boundary, with the unit pins
  // describing unreachable production behavior (the CH4 doctrine). null
  // stays legal (the SetNull semantics — a dangling optional FK still
  // nulls downstream); undefined stays legal (the update branch's
  // untouched case).
  for (const collection of EXPORT_COLLECTIONS) {
    const specs = IMPORT_FK_MAP[collection].filter((s) => !s.required);
    if (specs.length === 0) continue;
    const rows = input.data[collection];
    if (!Array.isArray(rows)) continue;
    for (const row of rows) {
      if (!isPlainObject(row)) continue;
      for (const spec of specs) {
        const value = row[spec.field];
        if (value === undefined || value === null) continue;
        if (typeof value !== "string") {
          return {
            ok: false,
            error: `Collection "${collection}" row "${String(row.id)}" carries a ${spec.field} that is not a string id — an optional reference can never be a non-string value.`,
          };
        }
      }
    }
  }
  return { ok: true, data: input.data };
}

/** S133/CH4 — the ONE duplicate-id message (the route's shipped phrasing,
 * previously the second half of the twin: the seam said "Collection "X"
 * contains duplicate rows…" while the route said "X: duplicate id …").
 * Both callers now share this. */
export function duplicateIdError(collection: string, id: string): string {
  return `${collection}: duplicate id "${id}" — every row needs a unique id.`;
}

/**
 * S135/CJ5 (audit A-L5): the colon-safe parse of the import race message
 * (`import-p2002:<collection>:<id>`). The route's handler previously
 * destructured `message.split(":")` as [, collection, id] — an id
 * containing ":" (legal to 64 arbitrary chars) truncated at the first
 * colon, cutting off the operator's only pointer to the racing row.
 * Everything after the SECOND colon is the id.
 */
export function parseImportRaceMessage(
  message: string,
): { collection: string; id: string } {
  const prefix = "import-p2002:";
  const rest = message.startsWith(prefix) ? message.slice(prefix.length) : message;
  const firstColon = rest.indexOf(":");
  if (firstColon === -1) return { collection: "", id: rest };
  return {
    collection: rest.slice(0, firstColon),
    id: rest.slice(firstColon + 1),
  };
}

/** Parse + normalize an import envelope, or name the first offender.
 * S133/CH4: the stateless stages delegate to validateImportEnvelope (the
 * production-consumed single source above); this wrapper keeps the richer
 * row normalization + envelope-only FK pre-emption that the unit pins
 * exercise (the account-aware FK resolution is route-side by design —
 * see the seam header). */
export function parseImportEnvelope(
  input: unknown,
): ImportParseResult {
  const check = validateImportEnvelope(input);
  if (!check.ok) {
    return { ok: false, error: check.error };
  }
  return finish(check.data);
}

function finish(rawData: Record<string, unknown>): ImportParseResult {
  // S135/CJ8: the unknown-collection rejection loop that used to open this
  // function was unreachable dead code — parseImportEnvelope delegates to
  // validateImportEnvelope FIRST (CH4's single source), which rejects
  // unknown collections BY NAME with the identical message; finish() only
  // ever receives an already-validated data block.

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
        // S133/CH4: the shared message (the route's shipped phrasing).
        return { ok: false, error: duplicateIdError(collection, id) };
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
        // S159/DH1: validateImportEnvelope rejects non-string FK values
        // upstream, so String() here is the identity on a string — the
        // coercion stays as belt-and-suspenders typing, never behavior.
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
// rode the body cap (10 MiB at the time — IMPORT_MAX_BYTES since S124/BY3,
// 64 MiB since S137/CL2) straight into SQLite. The guard runs BEFORE the
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
  // S133/CH1: keyed by the MANIFEST collection name ("decks" — the name
  // the route iterates) — the pre-CH1 "flashcardDecks.*" keys were dead
  // their whole life (fieldCapFor looked up "decks.name", missed, and
  // fell to the 1 M generic default — the deck caps were INERT while the
  // census pin machine-enforced the wrong key list).
  "decks.name": 200,
  "decks.description": 1_000,
  "cards.front": 2_000,
  "cards.back": 2_000,
  "practiceTests.title": 200,
  "practiceTests.questions": 100_000,
  "studyGroups.name": 200,
  // S171/DU2b: the ported description field (the reference's own —
  // measured live at the s171 gated write-path probe), bounded at 500 in
  // validation.ts's studyGroupSchema (the deck family's 1_000-char
  // description the precedent family).
  "studyGroups.description": 500,
  "grades.title": 200,
  // S133/CH2: the four atoms the parity contract was missing.
  "holidays.name": 200,
  "folders.name": 200,
  "calcHistory.expression": 500,
  "calcHistory.result": 500,
  "chatMessages.content": 100_000,
  // S139/CN1: the files mime cap — the interactive upload stores the
  // browser's entry.type (realistically < 100 chars), but the import
  // guard's generic default is 1 M chars, and a poisoned oversized mime
  // rides FILE_METADATA into EVERY files list GET (the CE7 bloat class:
  // a 900-K-char field bloats every list read of the family).
  "files.mime": 100,
};

const IMPORT_FILE_URL_MAX_CHARS = 2000;
const IMPORT_FILE_NAME_MAX_CHARS = 200;
// S139/CN1: the files size ceiling — a seam-local MIRROR of
// src/lib/server/http.ts's MAX_UPLOAD_BYTES (2 MiB). The mirror (not the
// import) is the established pattern: this seam must stay client-safe
// (export-panel.tsx imports IMPORT_MAX_BYTES from it) and the server
// http module is server-side. The files-view.tsx client twin documents
// the same mirror convention. A bare number would re-seed the exact
// stale-cap drift class CL2/CM5 machine-censured — if the upload ceiling
// moves, THIS constant moves in the same commit (the census pins the
// relationship by value).
const IMPORT_FILE_SIZE_MAX_BYTES = 2 * 1024 * 1024;

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

/** Enum vocabularies keyed by collection.field (validation.ts's own sets).
 * S133/CH2: exported for the manifest-consistency census; the five
 * missing fields added — every route-enforced enum now mirrored (the
 * vocabularies themselves single-sourced in validation.ts). */
export const ENUM_VOCABULARIES: Record<string, readonly string[]> = {
  "tasks.priority": TASK_PRIORITIES,
  "tasks.repeat": REPEATS,
  "assignments.type": ASSIGNMENT_TYPES,
  "assignments.priority": ASSIGNMENT_PRIORITIES,
  "cards.difficulty": CARD_DIFFICULTIES,
  "chatMessages.role": CHAT_ROLES,
  "chatMessages.surface": CHAT_SURFACES,
  "events.repeat": REPEATS,
  "exams.type": EXAM_TYPES,
  // S173/DW2: the ported grade type (the measured reference vocabulary —
  // the CA14 doctrine: the import seam mirrors validation.ts's array).
  "grades.type": GRADE_TYPES,
  // S174/DX4: the ported holiday type (the measured Holiday/Break/No
  // School selector — the CA14 doctrine).
  "holidays.type": HOLIDAY_TYPES,
  // S179/EC1: the note feature vocabularies (the CA14 doctrine — the
  // measured 7-swatch palette names, the text/coding kind split, and
  // the 14-option coding-note Language select). An out-of-vocabulary
  // color/kind/language in a hand-edited backup rejects exactly like
  // the interactive routes would 400 (the BT1b third-entry-point
  // doctrine); ABSENT fields pass (the enum check skips undefined/null
  // — a pre-S179 backup imports with the column defaults). The enum
  // vocabulary IS the language bound (no IMPORT_FIELD_LENGTHS entry —
  // the tasks.priority precedent: enum fields carry vocabulary entries,
  // never length atoms).
  "notes.color": NOTE_COLORS,
  "notes.kind": NOTE_KINDS,
  "notes.language": NOTE_LANGUAGES,
  "timetableClasses.weekType": WEEK_TYPES,
  "focusSessions.mode": FOCUS_SESSION_MODES,
  "calcHistory.mode": CALCULATOR_MODES,
};

/** The JSON-string columns (the schema's `// JSON ...` family) — the
 *  client JSON.parses every one of them.
 *  S133/CH5: the phantom practiceTests.topics dropped (PracticeTest's
 *  only JSON column is questions), the real exams.topics added, and the
 *  check itself now enforces the jsonArray atom's ARRAY-ness contract
 *  below. Exported for the registry census. */
export const JSON_STRING_FIELDS: Record<string, readonly string[]> = {
  tasks: ["subtasks"],
  practiceTests: ["questions"],
  exams: ["topics"],
  events: ["reminders"],
  notes: ["tags"],
  studyGroups: ["members"],
};

/** S133/CH2: the hexColor atoms (validation.ts's `^#[0-9a-fA-F]{6}$`
 * regex) — the four color columns every interactive route validates.
 * Keyed collection.field; a present non-null string must match. */
export const HEX_COLOR_FIELDS: ReadonlySet<string> = new Set([
  "subjects.color",
  "events.color",
  "decks.color",
  "studyGroups.color",
]);

/** S133/CH2: the min-1 atoms (validation.ts's `.min(1)` on the
 * title/name family — CH8 tightens them to trim().min(1), and this
 * registry mirrors the trim-aware blank check: a whitespace-ONLY value
 * rejects, a padded-but-nonblank value imports VERBATIM (no silent
 * trim-mutation of the user's backup rows — the parity contract is "no
 * row the interactive routes would REJECT", not "store what they would
 * have transformed"). */
export const IMPORT_FIELD_MIN_LENGTHS: Record<string, number> = {
  "subjects.name": 1,
  "taskLists.name": 1,
  "tasks.title": 1,
  "assignments.title": 1,
  "exams.title": 1,
  "events.title": 1,
  "timetableClasses.name": 1,
  "notebooks.name": 1,
  "notes.title": 1,
  "decks.name": 1,
  "cards.front": 1,
  "cards.back": 1,
  "practiceTests.title": 1,
  "studyGroups.name": 1,
  "grades.title": 1,
  "holidays.name": 1,
  "folders.name": 1,
  "calcHistory.expression": 1,
  "calcHistory.result": 1,
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
    // S133/CH2: the atom's own ceiling (validation.ts bounds score and
    // maxScore at 1000) — the pre-CH2 import only checked the pair
    // ordering, so a 99999/99999 grade imported and fed the GPA math.
    if (typeof score === "number" && score > 1000) {
      throw new ImportRowError(
        collection,
        index,
        'field "score" cannot be higher than 1000 (the same ceiling every grade route enforces).',
      );
    }
    if (maxScore !== undefined && maxScore !== null) {
      // S139/CN1: the route atom is z.number().min(1) — a Float 0.5 passed
      // the old `<= 0` leg and PERSISTED (the column has no Prisma
      // backstop), violating the family's own CB11/CA14 contract.
      if (typeof maxScore !== "number" || maxScore < 1) {
        throw new ImportRowError(
          collection,
          index,
          'field "maxScore" must be a number greater than or equal to 1 (the Grade Tracker divides by it).',
        );
      }
      if (maxScore > 1000) {
        throw new ImportRowError(
          collection,
          index,
          'field "maxScore" cannot be higher than 1000 (the same ceiling every grade route enforces).',
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
      // S139/CN1: the route atom is z.number().int().min(0).max(100) — a
      // non-integer (12.5) passed this guard and died at Prisma as the
      // GENERIC "fields do not match" 400 (the CJ4 actionable-copy
      // degradation, the exact class this parity contract exists to close).
      if (
        typeof progress !== "number" ||
        !Number.isInteger(progress) ||
        progress < 0 ||
        progress > 100
      ) {
        throw new ImportRowError(
          collection,
          index,
          'field "progress" must be a whole number between 0 and 100.',
        );
      }
    }
  }

  if (collection === "timetableClasses") {
    const dayOfWeek = row.dayOfWeek;
    if (dayOfWeek !== undefined && dayOfWeek !== null) {
      // S139/CN1: same — the route atom is z.number().int().min(0).max(6).
      if (
        typeof dayOfWeek !== "number" ||
        !Number.isInteger(dayOfWeek) ||
        dayOfWeek < 0 ||
        dayOfWeek > 6
      ) {
        throw new ImportRowError(
          collection,
          index,
          'field "dayOfWeek" must be a whole number between 0 (Monday) and 6 (Sunday).',
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
      (hhmmMinutes(endTime) as number) < (hhmmMinutes(startTime) as number)
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

  // S133/CH2: the hexColor atoms — the four color columns every
  // interactive route validates through validation.ts's regex (an
  // out-of-pattern color breaks the badge/color meta maps exactly like
  // an out-of-vocabulary enum).
  for (const field of HEX_COLOR_FIELDS) {
    const [owner, key] = field.split(".");
    if (owner !== collection) continue;
    const value = row[key];
    if (value === undefined || value === null) continue;
    if (typeof value !== "string" || !/^#[0-9a-fA-F]{6}$/.test(value)) {
      throw new ImportRowError(
        collection,
        index,
        `field "${key}" must be a 6-digit hex color like "#8b5cf6" (the same format every route enforces).`,
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
      // S133/CH5: the jsonArray atom's contract generalized — every JSON
      // column must parse to an ARRAY (the pre-CH5 check only proved it
      // parsed, so `'{"a":1}'` rode a column the client JSON.parses and
      // then iterated as a list).
      if (!Array.isArray(parsed)) {
        throw new ImportRowError(
          collection,
          index,
          `field "${field}" must be a JSON array (the same shape every route's JSON column enforces).`,
        );
      }
      // S127/CB11: the studyGroups members array cap (<= 50, the route's
      // own bound) — the JSON-parse check alone admitted a 10^4-member
      // group the view then rendered wholesale.
      if (collection === "studyGroups" && field === "members") {
        if (parsed.length > 50) {
          throw new ImportRowError(
            collection,
            index,
            'field "members" must be a JSON array of at most 50 members.',
          );
        }
        // S139/CN1: the ITEM shape — the interactive atom is
        // z.object({ name: trim().min(1).max(100), email: trim().email()
        // .max(200) }); the import's string bound for the whole column was
        // the 1 M generic, so garbage items persisted (the read-side
        // normalizeMembers drops blank names, but the write side owed the
        // parity contract the shape). NO email-FORMAT check here — a
        // stricter import regex than the atom risks rejecting legal
        // exports (the round-trip contract outranks the nicety, and the
        // read side renders email as text, never a link).
        for (const item of parsed) {
          if (
            typeof item !== "object" ||
            item === null ||
            Array.isArray(item) ||
            typeof (item as Record<string, unknown>).name !== "string" ||
            ((item as Record<string, unknown>).name as string).trim().length < 1 ||
            ((item as Record<string, unknown>).name as string).length > 100 ||
            typeof (item as Record<string, unknown>).email !== "string" ||
            ((item as Record<string, unknown>).email as string).length > 200
          ) {
            throw new ImportRowError(
              collection,
              index,
              'field "members" items must each be an object with a name (1-100 characters) and an email (at most 200 characters).',
            );
          }
        }
      }
      // S154/DC2 (audit B L1 — the members precedent's missed twin): the
      // ITEM shape — the interactive atom (practiceTestSchema.questions)
      // refines every item: an object with a question string and a type
      // in the three-member vocabulary. The import's array-ness check
      // alone admitted '["garbage"]' (a row every interactive route
      // would 400 — the CB11/CA14 parity contract). The predicates
      // mirror the ATOM verbatim (never stricter — the round-trip
      // contract outranks the nicety); no per-item length bounds
      // because the atom carries none (the whole-blob 100k-char field
      // cap already governs).
      if (collection === "practiceTests" && field === "questions") {
        for (const item of parsed) {
          if (
            typeof item !== "object" ||
            item === null ||
            typeof (item as Record<string, unknown>).question !== "string" ||
            !["multiple_choice", "true_false", "short_answer"].includes(
              String((item as Record<string, unknown>).type),
            )
          ) {
            throw new ImportRowError(
              collection,
              index,
              'field "questions" items must each be an object with a question and a type (multiple_choice, true_false, or short_answer).',
            );
          }
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

// ---------------------------------------------------------------------------
// S154/DC1 (audit B B-L2's contract-preserving answer) · the no-op update
// elision diff. The S141 condition ("stage-2 if measurement shows a
// residual window") answered by probe: the sequential per-row update loop
// measures 0.32 ms/row on this build (32 s at the IMPORT_MAX_ROWS cap —
// 1.9× headroom inside the 60 s timeout), so the chunked-sub-tx stage-2
// stays deferred ON MEASUREMENT and the cycle ships the elision instead:
// the route's pre-tx pass reads the full stored rows for the
// update-branch ids and drops every write whose planned payload already
// holds (the dominant heavy case — the idempotent re-import over a
// mostly-unchanged account — collapses from N lock-held writes to ~0 at
// read-cost). This pure seam is the diff.
//
// The semantics (the load-bearing choices):
//  - Diff over PLANNED keys only — exactly Prisma's update semantics
//    (absent keys never ride the write), so "the update would change
//    nothing" is proven iff every planned key already holds its value.
//  - CONSERVATIVE failure direction: any doubt (a key missing from the
//    stored row, a typeof mismatch, null-vs-value, an unparseable date,
//    an object value) keeps the write — the write is today's behavior,
//    the skip is the optimization. A false "not equal" costs one
//    redundant write; a false "equal" is impossible by construction
//    (equality is proven key-by-key, never assumed).
//  - Date↔ISO: the stored row's DateTime fields are Date objects, the
//    envelope's are ISO strings; the export's serialize → JSON.parse
//    round-trip recovers the exact millisecond, so an untouched
//    updatedAt/createdAt/dueDate compares equal (a row TOUCHED since the
//    export keeps its write).
//  - No Json columns exist in the schema (JSON columns are String-typed
//    both sides), so any object value is a doubt — never equal.
// ---------------------------------------------------------------------------
export function plannedUpdateIsNoOp(
  stored: Record<string, unknown>,
  planned: Record<string, unknown>,
): boolean {
  for (const [key, value] of Object.entries(planned)) {
    // Prisma's skip semantics: an undefined value never rides the update,
    // so it can never make the update non-no-op.
    if (value === undefined) continue;
    const current = stored[key];
    // Not carried by the stored row — equality cannot be proven.
    if (current === undefined) return false;
    if (current === null || value === null) {
      // null vs value writes (either direction); null vs null holds.
      if (current !== value) return false;
      continue;
    }
    if (current instanceof Date) {
      if (typeof value !== "string") return false;
      const t = Date.parse(value);
      if (Number.isNaN(t) || t !== current.getTime()) return false;
      continue;
    }
    if (typeof current !== typeof value) return false;
    if (typeof current === "object") return false;
    if (current !== value) return false;
  }
  return true;
}

/** Validate one imported row against the export format's primitive-value
 *  contract + the files-specific link rules. Throws ImportRowError (the
 *  route maps it to a 400 with the message as the actionable copy). */

/** S133/CH6: the raw JSON key rides several error messages verbatim — cap
 *  the interpolation so a hand-edited 100k-char key cannot amplify the
 *  400 body (the idField bound is 64; real field names are ~20). */
function capFieldName(field: string): string {
  return field.length > 64 ? `${field.slice(0, 64)}…` : field;
}

/** S133/CH2: JSON object keys are bounded at the idField length (64) —
 *  the longest real field name is ~20 chars; a longer key is garbage no
 *  Prisma column answers, previously dying only as an opaque
 *  PrismaClientValidationError deep in the transaction. */
const IMPORT_KEY_MAX_CHARS = 64;

export function sanitizeImportRow(
  collection: string,
  row: ImportRow,
  index = 0,
): ImportRow {
  checkDomainCaps(collection, row, index);
  for (const [field, value] of Object.entries(row)) {
    if (field.length > IMPORT_KEY_MAX_CHARS) {
      throw new ImportRowError(
        collection,
        index,
        `field names are capped at ${IMPORT_KEY_MAX_CHARS} characters — "${capFieldName(field)}" is ${field.length}.`,
      );
    }
    if (value === null) continue;
    const kind = typeof value;
    if (kind !== "string" && kind !== "number" && kind !== "boolean") {
      throw new ImportRowError(
        collection,
        index,
        `field "${capFieldName(field)}" must be a string, number, boolean, or null — the export format serializes every value to a primitive.`,
      );
    }
    if (typeof value === "string") {
      const cap = fieldCapFor(collection, field);
      if (value.length > cap) {
        throw new ImportRowError(
          collection,
          index,
          `field "${capFieldName(field)}" is ${value.length} characters — the import caps it at ${cap.toLocaleString("en-US")}.`,
        );
      }
      // S133/CH2: the min-1 atoms — a whitespace-ONLY value rejects (the
      // CH8 trim-before-check mirror: the interactive boundary rejects
      // blank titles, so the import must too); a padded-but-nonblank value
      // imports VERBATIM (documented in IMPORT_FIELD_MIN_LENGTHS above).
      const min = IMPORT_FIELD_MIN_LENGTHS[`${collection}.${field}`];
      if (min !== undefined && value.trim().length < min) {
        throw new ImportRowError(
          collection,
          index,
          `field "${field}" must be a non-empty string (whitespace-only is rejected by every route).`,
        );
      }
      // S137/CL6 (audit B-L1): the system-timestamp sanity band. The seam
      // accepted ARBITRARY createdAt/updatedAt strings — a hand-edited
      // far-future timestamp (9999) rode the row into the DB and
      // permanently poisoned the newest-500 windows (every collection GET
      // ranks it above every real row; with >=500 poisoned rows all real
      // data vanishes from every in-app list). The band covers ONLY the
      // two system-minted timestamps: [2000-01-01, now + 24h] — an old
      // account imports clean, a clock-skewed near-future imports clean,
      // the poison vectors reject with the named copy BEFORE the
      // transaction. User-facing date fields (dueDate, exam/event dates —
      // legitimately years out) are deliberately NOT banded; garbage
      // NON-date strings keep their existing graceful path (the route's
      // PrismaClientValidationError → the CJ5 400).
      if (field === "createdAt" || field === "updatedAt") {
        const ts = Date.parse(value);
        if (
          Number.isNaN(ts) ||
          ts < IMPORT_DATE_FLOOR_MS ||
          ts > Date.now() + IMPORT_DATE_CEILING_MS
        ) {
          throw new ImportRowError(
            collection,
            index,
            `field "${field}" is outside the importable date range — the export format carries real timestamps between 2000 and now + 1 day.`,
          );
        }
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
    // S139/CN1: the mime and size legs — the interactive upload stores the
    // browser's entry.type (mime) and entry.size (a real byte count under
    // the 2 MiB ceiling); the import guard previously checked NEITHER, so
    // a poisoned 1 M-char mime rode FILE_METADATA into every files list
    // GET (the CE7 bloat class) and a negative or fractional size
    // persisted (the column has no backstop).
    const mime = row.mime;
    if (
      mime !== undefined &&
      mime !== null &&
      (typeof mime !== "string" || mime.length > 100)
    ) {
      throw new ImportRowError(
        collection,
        index,
        'field "mime" must be a string of at most 100 characters (the browser-provided type the upload stores).',
      );
    }
    // S144/CS4 (audit B-L1, probed): the CHARSET leg — the guard was
    // length-only, so a hand-crafted "text/html\r\nSet-Cookie: pwn=1"
    // (≤100 chars) imported clean, persisted, then threw TypeError at
    // the download door's `new NextResponse(headers)` on EVERY GET of
    // that row (Node/undici rejects CR/LF header VALUES — the 500-on-
    // read taxonomy break; the throw fails closed so no header
    // injection — hostile-self-import only, the row stays deletable).
    // The admitted set is exactly what browsers emit for entry.type:
    // printable ASCII — empty still passes (the unknown-type "" shape
    // must keep importing; a legit mime is never non-ASCII per the
    // type/subtype grammar). The downloadHeaders clamp is the
    // belt-and-suspenders for pre-fix stored rows.
    if (
      mime !== undefined &&
      mime !== null &&
      typeof mime === "string" &&
      !/^[\x20-\x7E]*$/.test(mime)
    ) {
      throw new ImportRowError(
        collection,
        index,
        'field "mime" must be printable ASCII (a browser-provided type like "text/plain") — control characters and non-ASCII text cannot be stored as a file type.',
      );
    }
    const size = row.size;
    if (
      size !== undefined &&
      size !== null &&
      (typeof size !== "number" ||
        !Number.isInteger(size) ||
        size < 0 ||
        size > IMPORT_FILE_SIZE_MAX_BYTES)
    ) {
      throw new ImportRowError(
        collection,
        index,
        `field "size" must be a whole number of bytes between 0 and ${IMPORT_FILE_SIZE_MAX_BYTES.toLocaleString("en-US")} (the 2 MiB upload ceiling).`,
      );
    }
  }

  return row;
}

/**
 * S143/CR6 (audit A-M1) — the import catch's error→response mapping,
 * extracted as a PURE seam (route files cannot export shared symbols —
 * Next's route-type validation — so the mapping lives here, unit-pinned
 * behaviorally in tests/data-import.test.ts; the source-text censuses
 * stay as the marker backstop).
 *
 * Returns the import-specific {status, message} for the four named legs,
 * or null when the error belongs to the shared mapper (toErrorResponse —
 * the route falls through to it, so the ValidationError/NotFound/known-
 * request-error families keep their single source).
 */
export function importRestoreError(err: unknown): { status: number; message: string } | null {
  // S119/BT1b: a Prisma validation error from the write loop is a
  // malformed-envelope condition (the guard above catches the known
  // shapes; anything left is an exotic field-shape mismatch) — the
  // 400-bad-input contract, never a 500.
  if (err instanceof Error && err.name === "PrismaClientValidationError") {
    return {
      status: 400,
      message:
        "That backup contains a row whose fields do not match the app's data model. Re-export a fresh backup and try again.",
    };
  }
  // S130/CE7: the concurrent-create race surfaced from the transaction —
  // the named 409 with the actionable message (see the write loop).
  if (err instanceof Error && err.name === "ImportConcurrentCreateError") {
    // S135/CJ5: the colon-safe parse — ids legally contain ":" and the
    // bare split(":") truncated them at the first colon. The bulk form
    // (a createMany P2002 — the specific row is not recoverable from the
    // bulk statement) parses to the collection-level copy.
    const { collection, id } = parseImportRaceMessage(err.message);
    if (id === "bulk") {
      return {
        status: 409,
        message: `That ${collection} collection contains a row that collides with an existing record — either it was created while this import ran, or this backup's ids already belong to another account. Edit the backup's ids or restore into the original account.`,
      };
    }
    // S137/CL10 (audit A-I1): the copy names BOTH collision causes — the
    // CE7 concurrent-create race AND the dominant real trigger, a
    // cross-account global-PK collision.
    return {
      status: 409,
      message: `That ${collection} row (id "${id}") collides with an existing record — either it was created while this import ran, or this backup's ids already belong to another account. Edit the backup's ids or restore into the original account.`,
    };
  }
  // S137/CL10 (audit A-L2) + S138/CM4: P2028 — the 60 s window expired
  // mid-restore (a legal many-rows envelope; the many-rows tail). The
  // rollback HOLDS. The route-local copy (not the shared mapper's
  // source-neutral one) because the remedy here is specifically "split
  // the backup".
  if (typeof err === "object" && err !== null && "code" in err && (err as { code?: unknown }).code === "P2028") {
    return {
      status: 413,
      message:
        "That backup was too large or slow to restore in one pass and was fully rolled back. Try again, or split the backup and retry the halves.",
    };
  }
  // S142/CQ4 (audit A-L1): P2025 — a row the CP3 probe classified as
  // "existing" was DELETED between the probe and the write (the
  // read-hoist widened that window; S140's in-tx read would have
  // re-created it, this shape rolls back). The named-409 family's
  // concurrent-modification leg — the generic 404 ("That record does
  // not exist.") answered a taxonomy question with the wrong family.
  if (typeof err === "object" && err !== null && "code" in err && (err as { code?: unknown }).code === "P2025") {
    return {
      status: 409,
      message: "That backup contains a row that was deleted while this import ran — it was fully rolled back. Retry the import.",
    };
  }
  return null;
}

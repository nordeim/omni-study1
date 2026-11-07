// ---------------------------------------------------------------------------
// The data-export seam (S21/ADR-019). Pure — unit-pinned by
// tests/data-export.test.ts. Owns the portability envelope's identity and
// assembly: the stable 20-collection manifest, the row normalizer (userId
// dropped, Date → ISO, ids/FKs passed through), and the SECRET GUARD
// (passwordHash can never ride an export — enforced here AND by the route's
// explicit select, which never reads the column in the first place).
//
// S156/DE1 — the streaming fragment driver (the I-A peak-memory fix;
// docs/remediation-plan-session156.md §2): `buildExportFragments` assembles
// the SAME envelope as `buildDataExport` but as per-row scaffold FRAGMENTS,
// reading the collections SEQUENTIALLY through an injected reader (the
// S124/BY2 explicit-args doctrine — one collection's rows in memory at a
// time, so the build-time peak drops from ~3-4x the body [all 20 row sets
// + the normalized copy + the whole-body string + the length-encode,
// simultaneously] to ~1x the body as retained fragments + one collection).
// `buildDataExport` STAYS as the executable reference: the unit oracle
// welds the two forms byte-for-byte (the streaming path must never drift
// from the object form's serialization). Browser-safe module — the export
// panel imports from it: TextEncoder, never Buffer.
// ---------------------------------------------------------------------------

export const DATA_EXPORT_FORMAT = "studyflow-data-export";
export const DATA_EXPORT_VERSION = 1;

/**
 * The 20 content collections in the stable export order. EXCLUDED by
 * decision (ADR-019): VerificationToken / PasswordResetToken (secrets),
 * RumEvent (telemetry — /api/rum/export covers it), and the User table
 * itself (it rides the envelope's `user` field, hashless).
 */
export const EXPORT_COLLECTIONS = [
  "subjects",
  "taskLists",
  "tasks",
  "assignments",
  "exams",
  "events",
  "timetableClasses",
  "notebooks",
  "notes",
  "decks",
  "cards",
  "practiceTests",
  "studyGroups",
  "grades",
  "focusSessions",
  "folders",
  "files",
  "chatMessages",
  "calcHistory",
  "holidays",
] as const;

export type ExportCollection = (typeof EXPORT_COLLECTIONS)[number];

/** Fields the seam strips from every row (the export-side secret guard). */
export const NEVER_EXPORT_FIELDS = ["passwordHash", "userId"] as const;

export type ExportRow = Record<string, unknown>;
export type ExportRows = Partial<Record<ExportCollection, ExportRow[]>>;

export type DataExportEnvelope = {
  format: string;
  version: number;
  exportedAt: string;
  user: ExportRow;
  counts: Record<string, number>;
  data: Record<string, ExportRow[]>;
};

function isDate(value: unknown): value is Date {
  return value instanceof Date;
}

/** Strip the never-exported fields and convert Date values to ISO strings.
 *  Everything else (ids, FKs, nulls, content) passes through untouched. */
export function serializeExportRow(row: ExportRow): ExportRow {
  const out: ExportRow = {};
  for (const [key, value] of Object.entries(row)) {
    if ((NEVER_EXPORT_FIELDS as readonly string[]).includes(key)) continue;
    out[key] = isDate(value) ? value.toISOString() : value;
  }
  return out;
}

/**
 * Assemble the versioned envelope: format + version + exportedAt, the
 * hashless profile, every manifest collection key ALWAYS present (empty →
 * [] + count 0 — the caller never branches on key presence), rows
 * serialized through the normalizer, counts re-derived from the data.
 */
export function buildDataExport(
  user: ExportRow,
  rows: ExportRows,
  exportedAt: Date,
): DataExportEnvelope {
  const data: Record<string, ExportRow[]> = {};
  const counts: Record<string, number> = {};

  for (const collection of EXPORT_COLLECTIONS) {
    const present = rows[collection] ?? [];
    data[collection] = present.map(serializeExportRow);
    counts[collection] = data[collection].length;
  }

  return {
    format: DATA_EXPORT_FORMAT,
    version: DATA_EXPORT_VERSION,
    exportedAt: exportedAt.toISOString(),
    user: serializeExportRow(user),
    counts,
    data,
  };
}

/**
 * S141/CP4 — the human size line for the /export panel's Download card
 * (the export/import asymmetry's detection half: the unbounded export can
 * exceed the 64 MiB restore cap, and the panel warns when it does). The
 * WARNING threshold itself is the raw byte comparison against
 * IMPORT_MAX_BYTES (data-import.ts) — this helper is display-only, so a
 * rounding edge at the cap boundary never gates the warning.
 */
export function formatExportBytes(bytes: number): string {
  const KIB = 1024;
  const MIB = 1024 * 1024;
  if (bytes < MIB) {
    return `${Math.round(bytes / KIB)} KB`;
  }
  return `${Math.round((bytes / MIB) * 10) / 10} MB`;
}

// S142/CQ2 · exportByteSize — REMOVED at S156/DE2: the whole-body
// encode-for-length (a full body-sized Uint8Array allocated just to read
// .length) is structurally gone — the S156/DE1 driver counts its own
// per-fragment encodes, where every encoded fragment is RETAINED payload
// (the F2 finding). The A-M2 doctrine (bytes, never UTF-16 code units)
// carries in the driver's `bytes`, pinned against the TextEncoder byte
// count of the whole body on the multi-byte fixture (— · 👋).

// ---- S148/CW2: the export byte ceiling (audit B-L3) ---------------------------
//
// The export was the one UNBOUNDED read family in the API surface (20
// findMany calls with no take, assembled + serialized unconditionally
// for both consumers — the download route and the /export page's size
// signal), while the import door legally admits 64 MiB envelopes
// REPEATEDLY (the caps are per-request, not per-account): a legit
// account can grow to multi-GB and every export GET then materializes
// the full read set + the JSON string on the single worker. The
// over-cap WARNING existed only client-side (the panel's amber alert —
// about the RESTORE cap, a different concern). The ceiling bounds the
// SERVED BODY honestly:
//
// - 256 MiB = 4x the IMPORT_MAX_BYTES restore cap — high enough to
//   keep ADR-019 ("own your data") honest for the merely-large account
//   that outgrew the restore cap through repeated imports, low enough
//   to bound the multi-GB tail. The database file itself remains the
//   full-fidelity backup path past the ceiling (DEPLOYMENT.md §4).
// - The predicate (not a raw comparison at the consumers) is the
//   nodeEnvCasingWarning pattern: the gate is named, unit-pinnable
//   logic; the display helpers stay display-only.
// - The gate lives in the shared renderExportEnvelope seam
//   (server/export-build.ts) — the BW8 single-source doctrine: the
//   route's 413 and the page's over-ceiling panel can never drift.
//
// At-cap is the last ALLOWED byte count (the S137/CL2 boundary
// doctrine every byte cap in the family carries): the first rejected
// count is EXPORT_MAX_BYTES + 1.

export const EXPORT_MAX_BYTES = 256 * 1024 * 1024;

/** S148/CW2: the export ceiling gate — true when the serialized
 * envelope exceeds EXPORT_MAX_BYTES bytes (the honest refusal band;
 * under it the export serves byte-identically to the pre-ceiling
 * shape). */
export function exportOverCeiling(bytes: number): boolean {
  return bytes > EXPORT_MAX_BYTES;
}

// ---- S156/DE1: the streaming fragment driver (the I-A fix) --------------------
//
// The recorded I-A residual (S148's audit, ten cycles recorded): the
// materializing form held ALL 20 findMany sets + the envelope's normalized
// copy + the whole-body JSON string + the byte-size encode SIMULTANEOUSLY
// (~3-4x the serialized body), and the 256 MiB gate fired only AFTER the
// peak — a multi-GB account was fully materialized before being refused.
// The driver replaces it:
//
// - SEQUENTIAL reads through the injected reader (the explicit-args
//   doctrine) — one collection's rows live at a time; each row
//   serializes through the SAME normalizer (serializeExportRow) as the
//   object form, so the concatenation is BYTE-IDENTICAL to
//   JSON.stringify(buildDataExport(...)) — compositional JSON.stringify
//   over plain values, and the scaffold reproduces the object literal's
//   insertion order (format → version → exportedAt → user → counts →
//   data; collections in EXPORT_COLLECTIONS order; counts keyed in the
//   same loop). The unit oracle pins the weld; buildDataExport stays as
//   the executable reference.
// - PER-FRAGMENT byte counting (every encoded fragment is RETAINED
//   payload, never a length-only allocation — the S156/F2 finding closed
//   structurally); `bytes` is the exact UTF-8 total (the A-M2 doctrine).
// - RETAIN-WHILE-UNDER: once the running total crosses the ceiling the
//   pass stops retaining (keeps counting) — a multi-GB account is
//   refused at ≤ ceiling + head + one piece, and ExportTooLargeError
//   still carries the EXACT total (the page renders it).
// - The error class lives HERE (moved from server/http.ts at S156/DE1):
//   the ceiling family — EXPORT_MAX_BYTES + exportOverCeiling + the
//   throw — is reunited in the pure seam, and the driver can throw it
//   without importing server/ code (http.ts re-exports it for the
//   existing consumers; this module stays import-free).

/** S148/CW2 → S156/DE1 (moved from server/http.ts): the typed error the
 * driver throws past the 256 MiB ceiling. Carries `bytes` (the exact
 * serialized size) so the consumers (the /export page's over-ceiling
 * panel render) can show the computed size without re-serializing, and
 * `counts` (the COMPLETE per-collection record — S157/DF1) so the
 * over-ceiling /export render keeps its chip grid: the driver always
 * holds the full record when it throws (the throw is post-loop — every
 * collection read + counted, retention stopped or not), so the payload
 * is REQUIRED at the constructor — any future construction site must
 * answer "what does the grid show?". NOT a ValidationError (the body
 * was never read from the client — this is a response-size refusal);
 * http.ts's toErrorResponse maps it to the 413 family with the
 * database-file remedy. */
export class ExportTooLargeError extends Error {
  constructor(
    public readonly bytes: number,
    public readonly counts: Record<string, number>,
    message = "That export is too large to build in one pass (over 256 MB).",
  ) {
    super(message);
    this.name = "ExportTooLargeError";
  }
}

/** The S158/DG1 driver's paged collection reader — one page per call.
 * `after` is the last row of the previous page (the keyset anchor — the
 * RAW row object; the server wiring builds its keyset cursor from the
 * row's unique id, with the orderBy pair carrying the order semantics);
 * the reader owns the page size; `hasMore:
 * false` (or an empty page — the driver's defensive terminal) ends the
 * collection. The S156/DE1 form read each collection through ONE
 * unbounded call: a dominant collection fully materialized as row
 * objects (measured 3.04–3.12× the envelope's own bytes at 50k rows vs
 * 1.51× spread — scripts/measure-export-heap-s158.mjs); the paged form
 * keeps ONE BATCH's row objects live at a time. The server wiring
 * injects the Prisma readers (export-build.ts's READERS map + pageAfter);
 * the unit layer injects in-memory fakes (the oracle legs). */
export type ExportCollectionPage = { rows: ExportRow[]; hasMore: boolean };
export type ExportCollectionReader = (
  collection: ExportCollection,
  after?: ExportRow,
) => Promise<ExportCollectionPage>;

/** The assembled export: the ordered body fragments (their concatenation
 * is byte-identical to the object form's JSON.stringify) + the exact
 * UTF-8 byte total (the X-Export-Bytes header, the /export page prop,
 * and the ceiling gate all read this one number) + the STRUCTURED counts
 * record (S157/DF1 grid-from-envelope — the same loop-local record the
 * head fragment serializes; insertion order = EXPORT_COLLECTIONS, so the
 * /export page's chip grid rides it byte-identically to the hand-written
 * literal it replaces, and the grid + the size signal derive from ONE
 * read pass — the page-internal skew class eliminated). */
export type RenderedExport = {
  fragments: Uint8Array[];
  bytes: number;
  counts: Record<string, number>;
};

/** One page's row fragments: the per-row serializations joined by `,`
 * — and each NON-FIRST page's first row carries its own leading `,`
 * (the separator-across-batches correctness, the piece the single-array
 * form got for free; `first` is the collection's first page). Per-ROW
 * fragmentation (not per-collection) so the counting can cross the
 * ceiling mid-collection — the bounded-refusal property. Every manifest
 * name is interpolation-safe (unit-pinned: ^[A-Za-z]+$ — no JSON
 * escaping ever needed). */
function* rowFragments(rows: readonly ExportRow[], first: boolean): Generator<string> {
  for (let i = 0; i < rows.length; i++) {
    if (i > 0 || !first) yield ",";
    yield JSON.stringify(serializeExportRow(rows[i]));
  }
}

/** The envelope head: everything before the first collection. Built
 * AFTER the reads (counts are complete then — the retain-then-serve
 * design frees the emission order from the read order; the response is
 * assembled from retained fragments, never streamed live out of the
 * reads). Key order matches buildDataExport's literal exactly. */
function headFragment(user: ExportRow, counts: Record<string, number>, exportedAt: Date): string {
  return (
    `{"format":${JSON.stringify(DATA_EXPORT_FORMAT)}` +
    `,"version":${JSON.stringify(DATA_EXPORT_VERSION)}` +
    `,"exportedAt":${JSON.stringify(exportedAt.toISOString())}` +
    `,"user":${JSON.stringify(serializeExportRow(user))}` +
    `,"counts":${JSON.stringify(counts)}` +
    `,"data":{`
  );
}

/** S156/DE1 → S158/DG1 — the streaming assembly, keyset-batched. Reads
 * the 20 collections SEQUENTIALLY through `readCollection` — and, since
 * DG1, one PAGE at a time (the reader answers { rows, hasMore }; the
 * continuation anchor is the previous page's last row): one batch's row
 * objects live at a time, never a whole collection's. Serializes each
 * row through the normalizer, encodes each scaffold piece (retaining
 * while at-or-under the ceiling), and answers the ordered fragments +
 * the exact byte total. Throws ExportTooLargeError past EXPORT_MAX_BYTES
 * with the exact total. */
export async function buildExportFragments(
  user: ExportRow,
  readCollection: ExportCollectionReader,
  exportedAt: Date,
): Promise<RenderedExport> {
  const encoder = new TextEncoder();
  const perCollection: Uint8Array[][] = [];
  const counts: Record<string, number> = {};
  let bytes = 0;
  let retaining = true;

  const encode = (piece: string): Uint8Array => {
    const encoded = encoder.encode(piece);
    bytes += encoded.byteLength;
    return encoded;
  };

  // Pass 1 — the collections, one PAGE at a time. The S158/DG1 batch
  // loop: a single collection's rows no longer all materialize at once
  // (the measured 3× dominant-collection peak → ~1.2×; the probe record
  // in scripts/measure-export-heap-s158.mjs). The read-skew window
  // stretches with the serialization time (the accepted F3 class,
  // documented in export-build.ts's header — the export never writes,
  // and the import resolves FKs against envelope ∪ owned rows).
  for (const collection of EXPORT_COLLECTIONS) {
    counts[collection] = 0;
    const pieces: Uint8Array[] = [];
    let first = true;
    let anchor: ExportRow | undefined;
    for (;;) {
      const page = await readCollection(collection, anchor);
      // The defensive terminal: an empty page ends the collection
      // regardless of hasMore (a reader answering empty+hasMore would
      // otherwise loop forever on an undefined anchor).
      if (page.rows.length === 0) break;
      if (first && retaining) pieces.push(encode(`"${collection}":[`));
      for (const piece of rowFragments(page.rows, first)) {
        const encoded = encode(piece);
        // Retain-while-under: the first piece past the ceiling is the last
        // retained one; the pass keeps COUNTING (never retaining) so the
        // thrown bytes stay the exact total. At-cap is the last ALLOWED
        // count (the CL2 boundary doctrine — at-cap fragments are all
        // retained, and the gate below does not refuse them).
        if (retaining) pieces.push(encoded);
        if (exportOverCeiling(bytes)) retaining = false;
      }
      counts[collection] += page.rows.length;
      first = false;
      if (!page.hasMore) break;
      anchor = page.rows[page.rows.length - 1];
    }
    // An empty collection still rides its scaffold (the "name":[] shape);
    // a non-empty collection already pushed its "[" before page one. The
    // pushes stay retention-conditional (the retain-while-under contract:
    // past the ceiling nothing new is retained — only counted).
    if (first && retaining) pieces.push(encode(`"${collection}":[`));
    if (retaining) pieces.push(encode("]"));
    perCollection.push(pieces);
  }

  // Pass 2 — the head (counts complete) + the assembly in envelope
  // order. Loop-push, never spread: a 100k-row account holds 200k+
  // fragments and `push(...arr)` would blow the call stack.
  const fragments: Uint8Array[] = [encode(headFragment(user, counts, exportedAt))];
  for (let i = 0; i < EXPORT_COLLECTIONS.length; i++) {
    if (i > 0) fragments.push(encode(","));
    for (const piece of perCollection[i]) fragments.push(piece);
  }
  fragments.push(encode("}}"));

  if (exportOverCeiling(bytes)) {
    throw new ExportTooLargeError(bytes, counts);
  }
  return { fragments, bytes, counts };
}

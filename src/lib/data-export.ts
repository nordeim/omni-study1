// ---------------------------------------------------------------------------
// The data-export seam (S21/ADR-019). Pure — unit-pinned by
// tests/data-export.test.ts. Owns the portability envelope's identity and
// assembly: the stable 20-collection manifest, the row normalizer (userId
// dropped, Date → ISO, ids/FKs passed through), and the SECRET GUARD
// (passwordHash can never ride an export — enforced here AND by the route's
// explicit select, which never reads the column in the first place).
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

/**
 * S142/CQ2 — the envelope's UTF-8 BYTE size. The S141 signal consumed
 * `json.length` (UTF-16 code units) while every cap in the family counts
 * real bytes: the import route's body reader (http.ts, `byteLength`),
 * the panel's file-picker pre-check (`picked.size`), IMPORT_MAX_BYTES
 * itself. A non-ASCII account (the seed's own — / · / 👋) under-reports
 * by up to 3x under code units — an export straddling the 64 MiB cap
 * showed NO warning. One derivation, consumed by the seam → the route
 * header, the /export page prop, and the panel threshold alike.
 *
 * TextEncoder (NOT Buffer): this seam is client-imported by the export
 * panel — Buffer is a node global the browser bundle must never depend
 * on. TextEncoder.encode().length is the same UTF-8 byte count, a web
 * standard available in every runtime the seam loads in.
 */
export function exportByteSize(json: string): number {
  return new TextEncoder().encode(json).length;
}

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

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

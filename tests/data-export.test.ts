// S21 — the data-export seam (docs/remediation-plan-session21.md).
//
// The full-data export ("own your data" portability): the envelope is
// built by a PURE function so the unit layer can pin it end-to-end — the
// format identity (version + format string), the stable collection
// manifest (every key always present, empty → [] + count 0), the row
// normalizer (userId dropped, Date → ISO, ids/FKs passed through), and
// the SECRET GUARD (passwordHash can never ride the export).
import { describe, expect, it } from "vitest";
import {
  DATA_EXPORT_FORMAT,
  DATA_EXPORT_VERSION,
  EXPORT_COLLECTIONS,
  buildDataExport,
  serializeExportRow,
} from "../src/lib/data-export";

const WHEN = new Date("2026-10-09T08:00:00.000Z");

describe("EXPORT_COLLECTIONS (the manifest contract)", () => {
  it("declares the 20 content collections in the stable export order", () => {
    expect(EXPORT_COLLECTIONS).toEqual([
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
    ]);
  });

  it("never includes the excluded families (tokens, telemetry, the user table)", () => {
    // ADR-019: VerificationToken / PasswordResetToken (secrets),
    // RumEvent (re-collectable telemetry — the RUM CSV covers it), and
    // the User (it rides the envelope's `user` field, hashless) are NOT
    // collections.
    expect(EXPORT_COLLECTIONS).not.toContain("verificationTokens");
    expect(EXPORT_COLLECTIONS).not.toContain("passwordResetTokens");
    expect(EXPORT_COLLECTIONS).not.toContain("rumEvents");
    expect(EXPORT_COLLECTIONS).not.toContain("user");
  });
});

describe("serializeExportRow (the row normalizer)", () => {
  it("drops userId (single-user implied) and passes content fields through", () => {
    const row = serializeExportRow({
      id: "task-1",
      userId: "user-1",
      title: "Read chapter 4 — vectors",
      completed: false,
      priority: "none",
    });
    expect(row).toEqual({
      id: "task-1",
      title: "Read chapter 4 — vectors",
      completed: false,
      priority: "none",
    });
  });

  it("converts Date values to ISO strings (createdAt, dueDate, …)", () => {
    const row = serializeExportRow({
      id: "task-2",
      userId: "user-1",
      dueDate: WHEN,
      createdAt: WHEN,
    });
    expect(row.dueDate).toBe("2026-10-09T08:00:00.000Z");
    expect(row.createdAt).toBe("2026-10-09T08:00:00.000Z");
  });

  it("keeps foreign-key fields and null dates intact (cross-referencing)", () => {
    const row = serializeExportRow({
      id: "task-3",
      listId: null,
      subjectId: "subject-9",
      dueDate: null,
      updatedAt: WHEN,
    });
    expect(row.listId).toBeNull();
    expect(row.subjectId).toBe("subject-9");
    expect(row.dueDate).toBeNull();
    expect(row.updatedAt).toBe("2026-10-09T08:00:00.000Z");
  });
});

describe("buildDataExport (the envelope builder)", () => {
  const user = {
    id: "user-1",
    email: "demo@studyflow.app",
    name: "Demo Student",
    avatarEmoji: "🎓",
    themeMode: "system",
    accentColor: "violet",
    emailVerified: true,
    schoolName: "",
    gradeLevel: "",
    studyGoalHours: 4,
    notificationsEnabled: true,
    createdAt: WHEN,
    updatedAt: WHEN,
  };

  it("builds the versioned envelope (format, version, exportedAt, user)", () => {
    const envelope = buildDataExport(user, {}, WHEN);
    expect(envelope.format).toBe(DATA_EXPORT_FORMAT);
    expect(envelope.format).toBe("studyflow-data-export");
    expect(envelope.version).toBe(DATA_EXPORT_VERSION);
    expect(envelope.version).toBe(1);
    expect(envelope.exportedAt).toBe("2026-10-09T08:00:00.000Z");
    expect(envelope.user.email).toBe("demo@studyflow.app");
    expect(envelope.user.studyGoalHours).toBe(4);
  });

  // S135/CJ7 (audit A-I4) — the user block's Date→ISO conversion was
  // unpinned (email/studyGoalHours asserted, the Date branch not — the
  // fixture's createdAt rode the seam unasserted). publicUser
  // pre-stringifies in production; this leg pins the seam's own Date
  // branch on the user block so a serializer regression cannot ship green.
  it("S135/CJ7: the user block's Date fields serialize to ISO strings", () => {
    const envelope = buildDataExport(user, {}, WHEN);
    expect(envelope.user.createdAt).toBe("2026-10-09T08:00:00.000Z");
  });

  it("presents EVERY manifest collection key — empty input yields [] + count 0", () => {
    const envelope = buildDataExport(user, {}, WHEN);
    expect(Object.keys(envelope.data)).toEqual(EXPORT_COLLECTIONS);
    expect(Object.keys(envelope.counts)).toEqual(EXPORT_COLLECTIONS);
    for (const name of EXPORT_COLLECTIONS) {
      expect(envelope.data[name]).toEqual([]);
      expect(envelope.counts[name]).toBe(0);
    }
  });

  it("serializes the rows (userId dropped, dates ISO) and counts them", () => {
    const envelope = buildDataExport(
      user,
      {
        tasks: [
          { id: "task-1", userId: "user-1", title: "Read chapter 4 — vectors", createdAt: WHEN },
          { id: "task-2", userId: "user-1", title: "Lab report: pendulum experiment", createdAt: WHEN },
        ],
        subjects: [{ id: "subject-1", userId: "user-1", name: "Mathematics", color: "#8b5cf6", createdAt: WHEN }],
      },
      WHEN,
    );
    expect(envelope.data.tasks).toEqual([
      { id: "task-1", title: "Read chapter 4 — vectors", createdAt: "2026-10-09T08:00:00.000Z" },
      { id: "task-2", title: "Lab report: pendulum experiment", createdAt: "2026-10-09T08:00:00.000Z" },
    ]);
    expect(envelope.data.subjects).toEqual([
      { id: "subject-1", name: "Mathematics", color: "#8b5cf6", createdAt: "2026-10-09T08:00:00.000Z" },
    ]);
    expect(envelope.counts.tasks).toBe(2);
    expect(envelope.counts.subjects).toBe(1);
    // Untouched collections stay present (empty + zero).
    expect(envelope.counts.holidays).toBe(0);
    expect(envelope.data.holidays).toEqual([]);
  });

  it("THE SECRET GUARD: passwordHash can never ride the export", () => {
    // The user row is fed WITH a hash (the route must never select it,
    // and the seam must never leak it if one slips through anyway).
    const leakyUser = { ...user, passwordHash: "scrypt:deadbeef" };
    const envelope = buildDataExport(
      leakyUser,
      {
        tasks: [{ id: "task-1", userId: "user-1", title: "x", passwordHash: "scrypt:cafebabe", createdAt: WHEN }],
      },
      WHEN,
    );
    const json = JSON.stringify(envelope);
    expect(json).not.toContain("passwordHash");
    expect(json).not.toContain("scrypt:");
    expect(json).not.toContain("deadbeef");
    expect(json).not.toContain("cafebabe");
  });
});

// ---------------------------------------------------------------------------
// S141/CP4 — the export size signal (Audit B F2, the export/import
// asymmetry's detection half). The unbounded export could silently exceed
// the 64 MiB restore cap: an account past ~23 max-size files downloads a
// backup the in-app restore will ALWAYS 413 at the body read, with no
// in-app signal and each blind retry burning import budget. The fix: the
// /export page renders the exact envelope size (the shared server seam)
// and the panel warns when it exceeds IMPORT_MAX_BYTES. These pins own
// the pure formatting helper the panel consumes.
// ---------------------------------------------------------------------------
describe("S141/CP4 · formatExportBytes (the size-signal formatting)", () => {
  it("is exported from the export seam", async () => {
    const mod = await import("../src/lib/data-export");
    expect(typeof mod.formatExportBytes).toBe("function");
  });

  it("formats the MB band with one decimal", async () => {
    const { formatExportBytes } = await import("../src/lib/data-export");
    expect(formatExportBytes(0)).toBe("0 KB");
    expect(formatExportBytes(13 * 1024 * 1024)).toBe("13 MB");
    expect(formatExportBytes(12.4 * 1024 * 1024)).toBe("12.4 MB");
    expect(formatExportBytes(64 * 1024 * 1024 + 1)).toBe("64 MB");
  });

  it("formats the sub-MB band in KB (the small-backup case reads honestly)", async () => {
    const { formatExportBytes } = await import("../src/lib/data-export");
    expect(formatExportBytes(980 * 1024)).toBe("980 KB");
    expect(formatExportBytes(1023 * 1024)).toBe("1023 KB");
  });
});

describe("S142/CQ2 · exportByteSize (the byte-based size signal)", () => {
  // The A-M2 defect: the S141 size signal consumed json.length — UTF-16
  // CODE UNITS — while the import cap (http.ts's byte counter) and the
  // panel's file-picker (picked.size) count real UTF-8 bytes. A non-ASCII
  // account straddling the 64 MiB cap got NO warning (the code-unit count
  // under-reports by up to 3x). The signal must be byte-based end-to-end.
  it("computes the UTF-8 byte size, not the UTF-16 code-unit count", async () => {
    const { exportByteSize } = await import("../src/lib/data-export");
    // ASCII: bytes === code units.
    expect(exportByteSize("")).toBe(0);
    expect(exportByteSize("abc")).toBe(3);
    // Multi-byte divergence — the seed's own em-dash/middot class.
    expect(exportByteSize("—")).toBe(3);
    expect(exportByteSize("·")).toBe(2);
    expect(exportByteSize("—")).not.toBe("—".length);
    const body = "Read chapter 4 — vectors";
    expect(exportByteSize(body)).toBe(Buffer.byteLength(body));
    expect(exportByteSize(body)).toBeGreaterThan(body.length);
  });

  it("matches Buffer.byteLength on a representative envelope fragment", async () => {
    const { exportByteSize } = await import("../src/lib/data-export");
    const fragment = JSON.stringify({
      title: "Read chapter 4 — vectors",
      note: "Q&A — R&D · 5 < 6",
      emoji: "👋",
    });
    expect(exportByteSize(fragment)).toBe(Buffer.byteLength(fragment));
  });
});

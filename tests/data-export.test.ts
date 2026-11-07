// S21 — the data-export seam (docs/remediation-plan-session21.md).
//
// The full-data export ("own your data" portability): the envelope is
// built by a PURE function so the unit layer can pin it end-to-end — the
// format identity (version + format string), the stable collection
// manifest (every key always present, empty → [] + count 0), the row
// normalizer (userId dropped, Date → ISO, ids/FKs passed through), and
// the SECRET GUARD (passwordHash can never ride the export).
import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";
import {
  DATA_EXPORT_FORMAT,
  DATA_EXPORT_VERSION,
  EXPORT_COLLECTIONS,
  EXPORT_MAX_BYTES,
  ExportTooLargeError,
  buildDataExport,
  exportOverCeiling,
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

// S142/CQ2 · exportByteSize — REMOVED at S156/DE2 (the streaming cycle):
// the function had no consumer left after the driver's own per-fragment
// counting replaced the whole-body encode-for-length (the F2 audit
// finding: a full body-sized Uint8Array allocated just to read .length).
// The A-M2 lesson (bytes, never UTF-16 code units) carries into the
// S156/DE1 driver legs below — `bytes` is pinned against the
// TextEncoder byte count of the whole body on a fixture that carries
// the multi-byte divergence class (— · 👋).

// S148/CW2 — the export byte ceiling (audit B-L3, the s148 data-layer
// rotation; docs/remediation-plan-session148.md).
//
// The export was the one UNBOUNDED read family in the API surface: 20
// findMany calls with no take, assembled + JSON.stringify'd
// unconditionally for both consumers (the download route + the /export
// page's size signal), while the import door legally admits 64 MiB
// envelopes REPEATEDLY — a legit account can grow to multi-GB and every
// export GET then materializes the full read set + the string on the
// single worker. The over-cap WARNING existed only client-side (the
// panel's amber alert at >IMPORT_MAX_BYTES — the RESTORE cap, a
// different concern). The ceiling bounds the served body honestly:
// EXPORT_MAX_BYTES (4x the restore cap) + the exportOverCeiling
// predicate (the nodeEnvCasingWarning pattern — the gate is named
// logic, the display helpers stay display-only) + the typed
// ExportTooLargeError thrown by the PURE DRIVER (buildExportFragments —
// S156/DE1 moved the throw into the seam; the server wiring delegates)
// (the BW8 single-source doctrine: neither consumer owns the ceiling),
// mapped by toErrorResponse to the 413 family (the CU3 discrimination
// precedent). No e2e leg BY DESIGN (the CV1 runtime-split precedent):
// driving the ceiling honestly means an account holding >256 MiB of
// rows — seeding that per-run is prohibitive, and an
// env-configurable test ceiling is an unrequested knob. The predicate
// legs drive the pure seam; the census legs pin the four wirings; the
// s21 export legs re-certify the under-ceiling surface.
describe("S148/CW2: the export byte ceiling (EXPORT_MAX_BYTES + exportOverCeiling)", () => {
  it("EXPORT_MAX_BYTES pins the 256 MiB ceiling (the value the panel copy + the route remedy both name)", () => {
    // 4x the 64 MiB IMPORT_MAX_BYTES restore cap: a legit account can
    // outgrow the restore cap through repeated imports (the caps are
    // per-request, not per-account), so the ceiling sits above it to
    // keep ADR-019 honest for the merely-large — while still bounding
    // the multi-GB tail the audit measured.
    expect(EXPORT_MAX_BYTES).toBe(256 * 1024 * 1024);
  });

  it("an empty account sits far under the ceiling (zero bytes never trips)", () => {
    expect(exportOverCeiling(0)).toBe(false);
  });

  it("at-cap is the last ALLOWED byte count (the boundary every byte cap in the family carries)", () => {
    // The S137/CL2 IMPORT_MAX_BYTES boundary doctrine: the cap value
    // itself is allowed (a body of exactly cap bytes is served); the
    // first rejected count is cap + 1.
    expect(exportOverCeiling(EXPORT_MAX_BYTES)).toBe(false);
  });

  it("one-past-cap trips (the first rejected count)", () => {
    expect(exportOverCeiling(EXPORT_MAX_BYTES + 1)).toBe(true);
  });

  it("the multi-GB tail trips (the audit's amplification account)", () => {
    // A repeated-import account (10x the ceiling) is refused — the
    // honest 413 with the database-file remedy, never a multi-GB
    // body materialized per request.
    expect(exportOverCeiling(EXPORT_MAX_BYTES * 10)).toBe(true);
  });

  // ---- the wiring census (the CV1 precedent: four files, four pins) ----

  it("the census: the shared seam throws the typed error at the ceiling (S156/DE1 re-anchor: the gate lives in the PURE DRIVER — data-export.ts — and the server wiring delegates to it)", () => {
    const driver = readFileSync(
      path.resolve(process.cwd(), "src/lib/data-export.ts"),
      "utf8",
    );
    expect(driver).toContain("exportOverCeiling");
    expect(driver).toContain("ExportTooLargeError");
    expect(driver).toContain("buildExportFragments");
    const seam = readFileSync(
      path.resolve(process.cwd(), "src/lib/server/export-build.ts"),
      "utf8",
    );
    expect(seam).toContain("buildExportFragments");
  });

  it("the census: toErrorResponse maps ExportTooLargeError to the 413 family (http.ts, the CU3 precedent)", () => {
    const src = readFileSync(
      path.resolve(process.cwd(), "src/lib/server/http.ts"),
      "utf8",
    );
    expect(src).toContain("instanceof ExportTooLargeError");
    // The remedy copy names the ceiling + the database-file path (the
    // honest actionable remedy, never the opaque 500).
    const branch = src.slice(
      src.indexOf("instanceof ExportTooLargeError"),
      src.indexOf("instanceof ExportTooLargeError") + 700,
    );
    expect(branch).toContain("413");
  });

  it("the census: the /export page catches the typed error (the over-ceiling render flows through the same panel prop)", () => {
    const src = readFileSync(
      path.resolve(process.cwd(), "src/app/export/page.tsx"),
      "utf8",
    );
    expect(src).toContain("ExportTooLargeError");
  });

  it("the census: the panel derives the over-ceiling state from the predicate (export-panel.tsx)", () => {
    const src = readFileSync(
      path.resolve(process.cwd(), "src/components/export/export-panel.tsx"),
      "utf8",
    );
    expect(src).toContain("exportOverCeiling");
  });
});

// ---------------------------------------------------------------------------
// S156/DE1 · buildExportFragments (the streaming assembly — the I-A
// peak-memory fix; docs/remediation-plan-session156.md §2).
//
// The driver takes the collection reader AS A PARAMETER (the S124/BY2
// explicit-args doctrine), reads the 20 collections SEQUENTIALLY (one
// collection's rows in memory at a time — the mechanism that drops the
// build-time peak from ~3-4x the body to ~1x + one collection), and emits
// the envelope as per-row scaffold fragments whose concatenation is
// BYTE-IDENTICAL to JSON.stringify(buildDataExport(...)). THE ORACLE legs
// below are the weld: buildDataExport stays in the tree as the executable
// reference the streaming form must never drift from (any scaffold/key-
// order/normalizer divergence fails the oracle, not the e2e).
// ---------------------------------------------------------------------------
describe("S156/DE1 · buildExportFragments (the streaming assembly)", () => {
  const USER = {
    id: "user_1",
    email: "demo@studyflow.app",
    name: "Demo",
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    userId: "user_1", // stripped by the normalizer (the fixture proves it)
  };

  // The edge fixture: unicode (the seed's own — · 👋 class), null, Date,
  // number, boolean, FK fields — every value shape a Prisma row carries —
  // plus a NON-manifest key both forms must ignore.
  const rowsFixture = () => ({
    subjects: [
      { id: "s1", name: "Math — vectors", color: "#2563eb", createdAt: WHEN, userId: "user_1" },
    ],
    tasks: [
      { id: "t1", title: "Read chapter 4 — vectors", done: false, priority: 2, dueDate: null, createdAt: WHEN },
      { id: "t2", title: "👋 emoji row", done: true, priority: 1, dueDate: new Date("2026-11-01T09:30:00.000Z"), createdAt: WHEN },
    ],
    holidays: [{ id: "h1", name: "Labor Day · the middot", date: new Date("2026-05-01T00:00:00.000Z") }],
    rumEvents: [{ id: "x1" }], // never a manifest member — ignored by both forms
  });

  const readerOver =
    (rows: Record<string, Array<Record<string, unknown>>>, calls?: string[]) =>
    async (collection: string) => {
      calls?.push(collection);
      return rows[collection] ?? [];
    };

  const concatBytes = (chunks: Uint8Array[]): Uint8Array => {
    const total = chunks.reduce((n, c) => n + c.byteLength, 0);
    const out = new Uint8Array(total);
    let offset = 0;
    for (const c of chunks) {
      out.set(c, offset);
      offset += c.byteLength;
    }
    return out;
  };

  it("THE ORACLE (empty account): the fragments concatenate to exactly JSON.stringify(buildDataExport(...))", async () => {
    const { buildExportFragments } = await import("../src/lib/data-export");
    const { fragments } = await buildExportFragments(USER, readerOver({}), WHEN);
    const text = new TextDecoder().decode(concatBytes(fragments));
    expect(text).toBe(JSON.stringify(buildDataExport(USER, {}, WHEN)));
    // The empty shape: every manifest key present as [] (never absent).
    expect(text).toContain('"subjects":[]');
    expect(text).toContain('"holidays":[]');
    expect(text.endsWith("}}")).toBe(true);
  });

  it("THE ORACLE (populated edge fixture): byte-identical to the object form — unicode, null, Date, number, boolean, non-manifest keys", async () => {
    const { buildExportFragments } = await import("../src/lib/data-export");
    const rows = rowsFixture();
    const { fragments } = await buildExportFragments(USER, readerOver(rows), WHEN);
    const text = new TextDecoder().decode(concatBytes(fragments));
    expect(text).toBe(JSON.stringify(buildDataExport(USER, rows, WHEN)));
    // The welded properties, spot-checked through the parsed form:
    const parsed = JSON.parse(text) as {
      counts: Record<string, number>;
      data: Record<string, Array<Record<string, unknown>>>;
    };
    expect(parsed.data.subjects[0]).toEqual({ id: "s1", name: "Math — vectors", color: "#2563eb", createdAt: WHEN.toISOString() });
    expect(parsed.data.tasks[1]?.dueDate).toBe("2026-11-01T09:30:00.000Z");
    expect(parsed.data.tasks[0]?.dueDate).toBeNull();
    expect(parsed.data.rumEvents).toBeUndefined();
  });

  it("reads the collections in EXPORT_COLLECTIONS order (the stable wire order)", async () => {
    const { buildExportFragments } = await import("../src/lib/data-export");
    const calls: string[] = [];
    await buildExportFragments(USER, readerOver(rowsFixture(), calls), WHEN);
    expect(calls).toEqual([...EXPORT_COLLECTIONS]);
  });

  it("reads SEQUENTIALLY — reader N+1 is not called until N resolves (the one-collection-at-a-time mechanism)", async () => {
    const { buildExportFragments } = await import("../src/lib/data-export");
    // Deferred readers: each returns a promise the test controls. If the
    // driver fired reads concurrently (the old Promise.all shape), reader
    // 2 would be invoked before reader 1's release and `started` would
    // record both — the mechanism pin for the I-A fix.
    const started: string[] = [];
    const gates: Array<() => void> = [];
    const reader = async (collection: string) => {
      started.push(collection);
      const gate = new Promise<void>((resolve) => gates.push(resolve));
      await gate;
      return collection === "tasks" ? [{ id: "t1", title: "gated", createdAt: WHEN }] : [];
    };
    const pending = buildExportFragments(USER, reader, WHEN);
    // Let the microtask queue settle: only the FIRST reader may have started.
    await new Promise((r) => setTimeout(r, 5));
    expect(started).toEqual([EXPORT_COLLECTIONS[0]]);
    // Releasing one-by-one walks the whole manifest strictly in order.
    for (let i = 0; i < EXPORT_COLLECTIONS.length; i++) {
      gates[i]();
      await new Promise((r) => setTimeout(r, 5));
      const expectedSoFar = EXPORT_COLLECTIONS.slice(0, i + 2);
      expect(started).toEqual(expectedSoFar.slice(0, EXPORT_COLLECTIONS.length));
    }
    const done = await pending;
    expect(done.bytes).toBeGreaterThan(0);
  });

  it("the parsed envelope's counts equal the per-reader row counts (the head's counts block)", async () => {
    const { buildExportFragments } = await import("../src/lib/data-export");
    const rows: Record<string, Array<Record<string, unknown>>> = rowsFixture();
    const { fragments } = await buildExportFragments(USER, readerOver(rows), WHEN);
    const parsed = JSON.parse(new TextDecoder().decode(concatBytes(fragments))) as {
      counts: Record<string, number>;
    };
    for (const name of EXPORT_COLLECTIONS) {
      expect(parsed.counts[name]).toBe((rows[name] ?? []).length);
    }
  });

  it("bytes is the exact UTF-8 byte count of the whole body (the A-M2 carry-over: bytes, never code units)", async () => {
    const { buildExportFragments } = await import("../src/lib/data-export");
    const rows = rowsFixture(); // carries — · 👋 (multi-byte divergence)
    const { fragments, bytes } = await buildExportFragments(USER, readerOver(rows), WHEN);
    const text = new TextDecoder().decode(concatBytes(fragments));
    expect(bytes).toBe(new TextEncoder().encode(text).length);
    // The oracle string is the same body — both derivations agree, and
    // neither is the code-unit count (the fixture guarantees divergence).
    expect(bytes).toBe(new TextEncoder().encode(JSON.stringify(buildDataExport(USER, rows, WHEN))).length);
    expect(bytes).toBeGreaterThan(text.length);
  });

  it("every manifest name is interpolation-safe (^[A-Za-z]+$ — the \"${name}\" scaffold needs no JSON escaping)", () => {
    for (const name of EXPORT_COLLECTIONS) {
      expect(name).toMatch(/^[A-Za-z]+$/);
    }
  });

  it("the user block rides serialized (userId stripped, Date → ISO) through the driver's head", async () => {
    const { buildExportFragments } = await import("../src/lib/data-export");
    const { fragments } = await buildExportFragments(USER, readerOver({}), WHEN);
    const parsed = JSON.parse(new TextDecoder().decode(concatBytes(fragments))) as {
      user: Record<string, unknown>;
    };
    expect(parsed.user).toEqual({
      id: "user_1",
      email: "demo@studyflow.app",
      name: "Demo",
      createdAt: "2026-01-01T00:00:00.000Z",
    });
    expect(parsed.user).not.toHaveProperty("userId");
  });

  it("the exportedAt param rides the head verbatim (the injectable point-in-time stamp)", async () => {
    const { buildExportFragments } = await import("../src/lib/data-export");
    const { fragments } = await buildExportFragments(USER, readerOver({}), WHEN);
    const parsed = JSON.parse(new TextDecoder().decode(concatBytes(fragments))) as {
      exportedAt: string;
    };
    expect(parsed.exportedAt).toBe(WHEN.toISOString());
  });
});

// ---------------------------------------------------------------------------
// S157/DF1 — the leaner /export page family (grid-from-envelope;
// docs/remediation-plan-session157.md §3). The driver's return grows the
// STRUCTURED counts record (the same loop-local headFragment serializes
// into fragment[0] — the structured twin of the head's counts block), and
// the over-ceiling error carries the COMPLETE record so the page's grid
// survives both states. The page drops its own 20-count query family and
// rides the envelope (one read pass feeds the grid AND the size signal —
// the CP4 single-source doctrine completed; the page-internal skew class
// eliminated; the L-1 manifest-completeness gap closed structurally).
// ---------------------------------------------------------------------------
describe("S157/DF1 · the structured counts return (grid-from-envelope)", () => {
  const USER = {
    id: "user_1",
    email: "demo@studyflow.app",
    name: "Demo",
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    userId: "user_1",
  };
  const rowsFixture = (): Record<string, Array<Record<string, unknown>>> => ({
    subjects: [
      { id: "s1", name: "Math — vectors", color: "#2563eb", createdAt: WHEN },
    ],
    tasks: [
      { id: "t1", title: "Read chapter 4 — vectors", done: false, priority: 2, dueDate: null, createdAt: WHEN },
      { id: "t2", title: "👋 emoji row", done: true, priority: 1, dueDate: new Date("2026-11-01T09:30:00.000Z"), createdAt: WHEN },
    ],
    holidays: [{ id: "h1", name: "Labor Day · the middot", date: new Date("2026-05-01T00:00:00.000Z") }],
  });
  const readerOver =
    (rows: Record<string, Array<Record<string, unknown>>>) =>
    async (collection: string) =>
      rows[collection] ?? [];
  const concatBytes = (chunks: Uint8Array[]): Uint8Array => {
    const total = chunks.reduce((n, c) => n + c.byteLength, 0);
    const out = new Uint8Array(total);
    let offset = 0;
    for (const c of chunks) {
      out.set(c, offset);
      offset += c.byteLength;
    }
    return out;
  };

  it("the counts weld: the returned counts record equals the parsed envelope's counts block AND the per-reader row counts (the structured-vs-serialized weld)", async () => {
    const { buildExportFragments } = await import("../src/lib/data-export");
    const rows = rowsFixture();
    const { fragments, counts } = await buildExportFragments(USER, readerOver(rows), WHEN);
    // The head's own counts block — the serialized twin.
    const parsed = JSON.parse(new TextDecoder().decode(concatBytes(fragments))) as {
      counts: Record<string, number>;
    };
    expect(counts).toEqual(parsed.counts);
    // The per-reader truth — the grid the /export page renders.
    for (const name of EXPORT_COLLECTIONS) {
      expect(counts[name]).toBe((rows[name] ?? []).length);
    }
    // Insertion order = EXPORT_COLLECTIONS loop order (the page's chip
    // order derives from Object.entries — the panel renders
    // byte-identically to the hand-written literal it replaces).
    expect(Object.keys(counts)).toEqual([...EXPORT_COLLECTIONS]);
  });

  it("the over-ceiling error carries the COMPLETE counts record (the over-ceiling page grid source; the required-arg constructor)", async () => {
    // The driver always holds the complete record when it throws (the
    // throw is post-loop — every collection read + counted, retention
    // stopped or not), so the payload is REQUIRED at the constructor:
    // any future construction site must answer "what does the grid
    // show?" — the over-ceiling /export render keeps its grid.
    const counts: Record<string, number> = {};
    for (const name of EXPORT_COLLECTIONS) counts[name] = name === "tasks" ? 2 : 0;
    const err = new ExportTooLargeError(EXPORT_MAX_BYTES + 1, counts);
    expect(err).toBeInstanceOf(ExportTooLargeError);
    expect(err.bytes).toBe(EXPORT_MAX_BYTES + 1);
    expect(err.counts).toEqual(counts);
    expect(Object.keys(err.counts)).toEqual([...EXPORT_COLLECTIONS]);
    // The census twin (the CW2 pattern — the driver passes the real
    // record at the throw site; driving a real >256 MiB fixture account
    // stays impractical, the S148 decision unchanged).
    const driver = readFileSync(
      path.resolve(process.cwd(), "src/lib/data-export.ts"),
      "utf8",
    );
    expect(driver).toContain("throw new ExportTooLargeError(bytes, counts)");
  });
});

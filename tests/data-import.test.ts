// S23 — the data-import seam (docs/remediation-plan-session23.md).
//
// The restore half of the portability promise: parseImportEnvelope turns a
// downloaded (or hand-crafted) export file into normalized rows ready for
// the upsert-by-id transaction — or an actionable error naming the first
// offender. The seam is PURE (explicit args, zero imports beyond the
// export seam's shared constants) so the unit layer pins it end-to-end:
//
//  - the envelope identity (format + version — shared with the export seam)
//  - the shape rules (known collections only, rows are objects with ids)
//  - the SECRET GUARD (passwordHash/userId stripped — the import-side
//    mirror of NEVER_EXPORT_FIELDS; the importer's own id is re-attached
//    by the route, never by the file)
//  - the FK pre-emption (dangling OPTIONAL FKs nulled — the schema's own
//    SetNull semantics, empirically mandated: Prisma enforces FKs on
//    SQLite [P2003], so the seam MUST pre-validate or the import dies
//    mid-transaction with an opaque error; a dangling REQUIRED FK
//    [cards.deckId] is a corrupt envelope)
//  - the folders topological sort (parents before children — a
//    hand-crafted child-before-parent order would hit P2003; the same
//    pass detects cycles, which must never reach the tree renderer)
//  - IMPORT_FK_MAP completeness (every collection has an entry — a new
//    collection without one fails this test, the INITIAL_COLLECTIONS
//    pattern)
import { describe, expect, it } from "vitest";
import {
  IMPORT_FK_MAP,
  IMPORT_MAX_BYTES,
  IMPORT_OPTIONAL_FKS,
  IMPORT_REQUIRED_FKS,
  ImportRowError,
  importProfilePatch,
  importRowIdError,
  parseImportEnvelope,
  sanitizeImportRow,
} from "../src/lib/data-import";
import { EXPORT_COLLECTIONS } from "../src/lib/data-export";

// A minimal valid envelope helper — every test starts from a shape the
// export itself could have produced.
function validEnvelope(): Record<string, unknown> {
  return {
    format: "studyflow-data-export",
    version: 1,
    exportedAt: "2026-10-01T00:00:00.000Z",
    user: { id: "u-exporter", email: "old@account.dev", name: "Old" },
    counts: { subjects: 1, tasks: 1 },
    data: {
      subjects: [{ id: "s1", name: "Math", color: "#8b5cf6", createdAt: "2026-09-01T00:00:00.000Z" }],
      tasks: [{ id: "t1", title: "Read", subjectId: "s1", createdAt: "2026-09-02T00:00:00.000Z" }],
    },
  };
}

describe("the envelope identity (shared with the export seam)", () => {
  it("accepts a valid envelope and normalizes every present collection", () => {
    const res = parseImportEnvelope(validEnvelope());
    expect(res.ok).toBe(true);
    if (!res.ok) return;
    expect(res.rows.subjects).toHaveLength(1);
    expect(res.rows.subjects[0]).toEqual({
      id: "s1",
      name: "Math",
      color: "#8b5cf6",
      createdAt: "2026-09-01T00:00:00.000Z",
    });
    expect(res.rows.tasks).toHaveLength(1);
    expect(res.totalRows).toBe(2);
  });

  it("treats a MISSING data key and missing collection keys as empty (the never-branch-on-presence promise)", () => {
    const res = parseImportEnvelope({ format: "studyflow-data-export", version: 1 });
    expect(res.ok).toBe(true);
    if (!res.ok) return;
    expect(res.rows.subjects).toEqual([]);
    expect(res.rows.holidays).toEqual([]);
    expect(res.totalRows).toBe(0);
  });

  it("rejects a wrong format identity", () => {
    const env = validEnvelope() as Record<string, unknown>;
    env.format = "someone-elses-export";
    const res = parseImportEnvelope(env);
    expect(res.ok).toBe(false);
    if (res.ok) return;
    expect(res.error).toContain("studyflow-data-export");
  });

  it("rejects a future version with the actionable message", () => {
    const env = validEnvelope() as Record<string, unknown>;
    env.version = 2;
    const res = parseImportEnvelope(env);
    expect(res.ok).toBe(false);
    if (res.ok) return;
    expect(res.error).toContain("newer version");
  });

  it("rejects a non-object envelope", () => {
    const res = parseImportEnvelope("not an envelope");
    expect(res.ok).toBe(false);
  });
});

describe("the collection shape rules", () => {
  it("rejects an UNKNOWN collection key, naming it", () => {
    const env = validEnvelope() as { data: Record<string, unknown> };
    env.data.passwordResetTokens = [{ id: "x" }];
    const res = parseImportEnvelope(env);
    expect(res.ok).toBe(false);
    if (res.ok) return;
    expect(res.error).toContain("passwordResetTokens");
  });

  it("rejects a non-array collection", () => {
    const env = validEnvelope() as { data: Record<string, unknown> };
    env.data.subjects = { id: "s1" };
    const res = parseImportEnvelope(env);
    expect(res.ok).toBe(false);
    if (res.ok) return;
    expect(res.error).toContain("subjects");
  });

  it("rejects a row that is not an object", () => {
    const env = validEnvelope() as { data: Record<string, unknown> };
    env.data.subjects = ["just a string"];
    const res = parseImportEnvelope(env);
    expect(res.ok).toBe(false);
  });

  it("rejects a row without an id, naming the collection", () => {
    const env = validEnvelope() as { data: Record<string, unknown> };
    env.data.subjects = [{ name: "no id" }];
    const res = parseImportEnvelope(env);
    expect(res.ok).toBe(false);
    if (res.ok) return;
    expect(res.error).toContain("subjects");
  });

  it("rejects a row with an empty or non-string id", () => {
    const env = validEnvelope() as { data: Record<string, unknown> };
    env.data.subjects = [{ id: "" }];
    expect(parseImportEnvelope(env).ok).toBe(false);
    const env2 = validEnvelope() as { data: Record<string, unknown> };
    env2.data.subjects = [{ id: 42 }];
    expect(parseImportEnvelope(env2).ok).toBe(false);
  });

  it("rejects duplicate ids within one collection (a corrupt envelope)", () => {
    const env = validEnvelope() as { data: Record<string, unknown> };
    env.data.subjects = [
      { id: "s1", name: "A" },
      { id: "s1", name: "B" },
    ];
    const res = parseImportEnvelope(env);
    expect(res.ok).toBe(false);
    if (res.ok) return;
    expect(res.error).toContain("s1");
    expect(res.error).toContain("subjects");
  });
});

describe("the import-side secret guard", () => {
  it("strips passwordHash and userId from every row (the file never speaks for the account)", () => {
    const env = validEnvelope() as { data: Record<string, Array<Record<string, unknown>>> };
    env.data.subjects[0].passwordHash = "stolen-hash";
    env.data.subjects[0].userId = "someone-else";
    env.data.tasks[0].userId = "attacker";
    const res = parseImportEnvelope(env);
    expect(res.ok).toBe(true);
    if (!res.ok) return;
    expect(res.rows.subjects[0]).not.toHaveProperty("passwordHash");
    expect(res.rows.subjects[0]).not.toHaveProperty("userId");
    expect(res.rows.tasks[0]).not.toHaveProperty("userId");
    expect(res.rows.tasks[0]).toHaveProperty("subjectId", "s1");
  });
});

describe("the FK pre-emption (Prisma enforces FKs — P2003 — the seam pre-validates)", () => {
  it("NULLS a dangling optional FK (tasks.subjectId — the schema's own SetNull semantics)", () => {
    const env = validEnvelope() as { data: Record<string, Array<Record<string, unknown>>> };
    env.data.tasks[0].subjectId = "no-such-subject";
    const res = parseImportEnvelope(env);
    expect(res.ok).toBe(true);
    if (!res.ok) return;
    expect(res.rows.tasks[0]).toHaveProperty("subjectId", null);
  });

  it("NULLS a dangling tasks.listId and notes.notebookId", () => {
    const env = validEnvelope() as { data: Record<string, Array<Record<string, unknown>>> };
    env.data.tasks[0].listId = "no-such-list";
    env.data.notes = [{ id: "n1", title: "Note", notebookId: "no-such-notebook" }];
    const res = parseImportEnvelope(env);
    expect(res.ok).toBe(true);
    if (!res.ok) return;
    expect(res.rows.tasks[0]).toHaveProperty("listId", null);
    expect(res.rows.notes[0]).toHaveProperty("notebookId", null);
  });

  it("NULLS a dangling folders.parentId and files.folderId", () => {
    const env = validEnvelope() as { data: Record<string, Array<Record<string, unknown>>> };
    env.data.folders = [{ id: "f1", name: "Orphan", parentId: "no-such-folder" }];
    env.data.files = [{ id: "file1", name: "a.txt", folderId: "no-such-folder" }];
    const res = parseImportEnvelope(env);
    expect(res.ok).toBe(true);
    if (!res.ok) return;
    expect(res.rows.folders[0]).toHaveProperty("parentId", null);
    expect(res.rows.files[0]).toHaveProperty("folderId", null);
  });

  it("KEEPS a resolvable FK untouched (the happy path)", () => {
    const res = parseImportEnvelope(validEnvelope());
    expect(res.ok).toBe(true);
    if (!res.ok) return;
    expect(res.rows.tasks[0]).toHaveProperty("subjectId", "s1");
  });

  it("REJECTS a dangling REQUIRED FK (cards.deckId), naming the collection and row", () => {
    const env = validEnvelope() as { data: Record<string, Array<Record<string, unknown>>> };
    env.data.cards = [{ id: "c1", front: "f", back: "b", deckId: "no-such-deck" }];
    const res = parseImportEnvelope(env);
    expect(res.ok).toBe(false);
    if (res.ok) return;
    expect(res.error).toContain("cards");
    expect(res.error).toContain("c1");
    expect(res.error).toContain("deckId");
  });

  it("nulls a NULL-valued FK harmlessly (already null stays null)", () => {
    const env = validEnvelope() as { data: Record<string, Array<Record<string, unknown>>> };
    env.data.tasks[0].subjectId = null;
    const res = parseImportEnvelope(env);
    expect(res.ok).toBe(true);
    if (!res.ok) return;
    expect(res.rows.tasks[0]).toHaveProperty("subjectId", null);
  });
});

describe("the folders topological sort (self-referential FK)", () => {
  it("reorders child-before-parent rows so parents import first", () => {
    const env = validEnvelope() as { data: Record<string, Array<Record<string, unknown>>> };
    // Child FIRST — a hand-crafted order the DB would reject (P2003).
    env.data.folders = [
      { id: "child", name: "Child", parentId: "parent" },
      { id: "parent", name: "Parent", parentId: null },
    ];
    const res = parseImportEnvelope(env);
    expect(res.ok).toBe(true);
    if (!res.ok) return;
    expect(res.rows.folders.map((f) => f.id)).toEqual(["parent", "child"]);
  });

  it("sorts a three-deep chain scrambled", () => {
    const env = validEnvelope() as { data: Record<string, Array<Record<string, unknown>>> };
    env.data.folders = [
      { id: "g", name: "G", parentId: "top" },
      { id: "top", name: "Top", parentId: null },
      { id: "m", name: "M", parentId: "top" },
    ];
    const res = parseImportEnvelope(env);
    expect(res.ok).toBe(true);
    if (!res.ok) return;
    const ids = res.rows.folders.map((f) => f.id);
    expect(ids.indexOf("top")).toBeLessThan(ids.indexOf("m"));
    expect(ids.indexOf("top")).toBeLessThan(ids.indexOf("g"));
  });

  it("REJECTS a parentId cycle (must never reach the tree renderer)", () => {
    const env = validEnvelope() as { data: Record<string, Array<Record<string, unknown>>> };
    env.data.folders = [
      { id: "a", name: "A", parentId: "b" },
      { id: "b", name: "B", parentId: "a" },
    ];
    const res = parseImportEnvelope(env);
    expect(res.ok).toBe(false);
    if (res.ok) return;
    expect(res.error).toContain("cycle");
  });
});

describe("the informational fields (tolerated, never trusted)", () => {
  it("ignores a stale counts block (rows are re-derived from data)", () => {
    const env = validEnvelope() as Record<string, unknown>;
    env.counts = { subjects: 999, tasks: 999 };
    const res = parseImportEnvelope(env);
    expect(res.ok).toBe(true);
  });

  it("ignores the user block entirely (content only, never identity)", () => {
    const env = validEnvelope() as Record<string, unknown>;
    env.user = "garbage-not-even-an-object";
    const res = parseImportEnvelope(env);
    expect(res.ok).toBe(true);
  });

  it("tolerates a missing exportedAt", () => {
    const env = validEnvelope() as Record<string, unknown>;
    delete env.exportedAt;
    const res = parseImportEnvelope(env);
    expect(res.ok).toBe(true);
  });

  it("passes ISO date strings through untouched (Prisma accepts them as-is)", () => {
    const env = validEnvelope() as { data: Record<string, Array<Record<string, unknown>>> };
    env.data.tasks[0].dueDate = "2026-11-01T12:00:00.000Z";
    const res = parseImportEnvelope(env);
    expect(res.ok).toBe(true);
    if (!res.ok) return;
    expect(res.rows.tasks[0]).toHaveProperty("dueDate", "2026-11-01T12:00:00.000Z");
  });

  it("keeps unknown content fields untouched (forward-compat: the DB validates content)", () => {
    const env = validEnvelope() as { data: Record<string, Array<Record<string, unknown>>> };
    env.data.tasks[0].someFutureField = "v2 adds fields — v1 imports keep them";
    const res = parseImportEnvelope(env);
    expect(res.ok).toBe(true);
    if (!res.ok) return;
    expect(res.rows.tasks[0]).toHaveProperty("someFutureField");
  });
});

describe("IMPORT_FK_MAP (the completeness pin — the INITIAL_COLLECTIONS pattern)", () => {
  it("covers EXACTLY the export manifest — a new collection without an entry fails here", () => {
    expect(Object.keys(IMPORT_FK_MAP).sort()).toEqual([...EXPORT_COLLECTIONS].sort());
  });

  it("declares cards.deckId as the only REQUIRED FK", () => {
    const required = Object.entries(IMPORT_FK_MAP).flatMap(([collection, specs]) =>
      (specs as { field: string; required?: boolean }[])
        .filter((s) => s.required)
        .map((s) => `${collection}.${s.field}`),
    );
    expect(required).toEqual(["cards.deckId"]);
  });

  it("declares every FK target as a manifest collection (no dangling map entries)", () => {
    const manifest = new Set<string>(EXPORT_COLLECTIONS);
    for (const specs of Object.values(IMPORT_FK_MAP)) {
      for (const spec of specs as { target: string }[]) {
        expect(manifest.has(spec.target)).toBe(true);
      }
    }
  });
});

describe("IMPORT_MAX_BYTES (the documented body cap)", () => {
  it("is 10 MiB — 5x the largest realistic single-user envelope", () => {
    // S124/BY3: 10 → 25 MiB — the export/import reconciliation (the export
    // emits base64 file payloads inline; ~4-5 max-size uploads made the
    // user's own backup unrestorable under the old cap).
    expect(IMPORT_MAX_BYTES).toBe(25 * 1024 * 1024);
  });
});

describe("the derived route FK maps (S122/BW8 — the drift-hazard close)", () => {
  // The import ROUTE consumed its own hand-maintained REQUIRED_FKS/
  // OPTIONAL_FKS twins for 100+ sessions while this seam's IMPORT_FK_MAP
  // carried the unit-pinned copy — two map families that could drift
  // apart silently (a new FK-bearing collection would fail THIS file's
  // completeness pin while shipping with no route-side pre-emption).
  // BW8 moves the operative maps INTO the seam (derived from
  // IMPORT_FK_MAP, single source) — these pins hold the derivation.
  it("derives REQUIRED exactly: cards.deckId → decks", () => {
    expect(IMPORT_REQUIRED_FKS).toEqual({ cards: { deckId: "decks" } });
  });

  it("derives OPTIONAL with the self-target for folders.parentId and no required leakage", () => {
    expect(IMPORT_OPTIONAL_FKS).toEqual({
      tasks: { subjectId: "subjects", listId: "taskLists" },
      assignments: { subjectId: "subjects" },
      exams: { subjectId: "subjects" },
      timetableClasses: { subjectId: "subjects" },
      notes: { subjectId: "subjects", notebookId: "notebooks" },
      decks: { subjectId: "subjects" },
      practiceTests: { subjectId: "subjects" },
      studyGroups: { subjectId: "subjects" },
      grades: { subjectId: "subjects" },
      focusSessions: { subjectId: "subjects" },
      files: { folderId: "folders" },
      folders: { parentId: "self" },
    });
  });
});

// ---------------------------------------------------------------------------
// S126/CA2 · the shared row-id validator (the s126 persistence audit's
// B-M2): the import route's inline validator checked only
// `typeof id === "string"` while the seam rejected empty ids — twin
// validators that had drifted (the route minted rows with empty-string
// primary keys no detail route can address). CA2 exports ONE validator from
// the seam; these pins hold its contract at both call sites' shared shape.
// ---------------------------------------------------------------------------
describe("S126/CA2 · the shared row-id validator", () => {
  it("accepts a normal string id", () => {
    expect(importRowIdError("tasks", { id: "t1" })).toBeNull();
  });

  it("rejects a missing id", () => {
    expect(importRowIdError("tasks", { title: "no id" })).toMatch(/string id/);
  });

  it("rejects an EMPTY string id — the route's pre-CA2 gap (RED pre-fix: the export did not exist)", () => {
    expect(importRowIdError("tasks", { id: "", title: "empty" })).toMatch(/string id/);
  });

  it("rejects a non-string id", () => {
    expect(importRowIdError("tasks", { id: 42 })).toMatch(/string id/);
  });

  it("the seam's envelope parse rejects an empty-id row (the contract the route now shares)", () => {
    const env = validEnvelope();
    (env.data as Record<string, unknown[]>).tasks = [{ id: "", title: "empty" }];
    const res = parseImportEnvelope(env);
    expect(res.ok).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// S126/CA14 · the import's domain caps (the s126 persistence audit's
// B-L3): the per-row guard checked primitive types + string caps + the
// files rules but NO domain constraints — a hand-edited backup stored
// rows that violated every route-enforced invariant (grades 900/100 →
// 900% renders, maxScore 0 → NaN in the GPA math, progress 500,
// dayOfWeek 99, out-of-vocabulary enums breaking the badge meta maps,
// non-JSON strings in the JSON columns throwing in the client parse).
// ---------------------------------------------------------------------------
describe("S126/CA14 · the import domain caps", () => {
  it("rejects a grade with score above maxScore (the BZ6 route guard, now shared by the third entry point)", () => {
    expect(() =>
      sanitizeImportRow("grades", { id: "g1", score: 900, maxScore: 100 }, 0),
    ).toThrow(ImportRowError);
  });

  it("rejects a grade with a bare score above the default 100 denominator (the create-schema semantics)", () => {
    expect(() =>
      sanitizeImportRow("grades", { id: "g1", score: 150 }, 0),
    ).toThrow(ImportRowError);
  });

  it("rejects a negative score", () => {
    expect(() =>
      sanitizeImportRow("grades", { id: "g1", score: -50, maxScore: 100 }, 0),
    ).toThrow(ImportRowError);
  });

  it("rejects a zero maxScore (division by zero in the GPA math)", () => {
    expect(() =>
      sanitizeImportRow("grades", { id: "g1", score: 10, maxScore: 0 }, 0),
    ).toThrow(ImportRowError);
  });

  it("accepts a legal grade pair", () => {
    expect(() =>
      sanitizeImportRow("grades", { id: "g1", score: 90, maxScore: 100 }, 0),
    ).not.toThrow();
  });

  it("rejects an assignment progress outside 0..100", () => {
    expect(() =>
      sanitizeImportRow("assignments", { id: "a1", progress: 500 }, 0),
    ).toThrow(ImportRowError);
  });

  it("rejects a timetable dayOfWeek outside 0..6", () => {
    expect(() =>
      sanitizeImportRow("timetableClasses", { id: "c1", dayOfWeek: 99 }, 0),
    ).toThrow(ImportRowError);
  });

  it("rejects an out-of-vocabulary assignment priority", () => {
    expect(() =>
      sanitizeImportRow("assignments", { id: "a1", priority: "bogus" }, 0),
    ).toThrow(ImportRowError);
  });

  it("rejects an out-of-vocabulary card difficulty", () => {
    expect(() =>
      sanitizeImportRow("cards", { id: "c1", difficulty: "impossible" }, 0),
    ).toThrow(ImportRowError);
  });

  it("rejects an out-of-vocabulary chat role", () => {
    expect(() =>
      sanitizeImportRow("chatMessages", { id: "m1", role: "system" }, 0),
    ).toThrow(ImportRowError);
  });

  it("rejects a non-JSON subtasks string (the client JSON.parse would throw)", () => {
    expect(() =>
      sanitizeImportRow("tasks", { id: "t1", subtasks: "not json" }, 0),
    ).toThrow(ImportRowError);
  });

  it("rejects a non-JSON study-group members string", () => {
    expect(() =>
      sanitizeImportRow("studyGroups", { id: "g1", members: "{oops" }, 0),
    ).toThrow(ImportRowError);
  });

  it("accepts a legal JSON subtasks string", () => {
    expect(() =>
      sanitizeImportRow("tasks", { id: "t1", subtasks: '[{"title":"a","done":false}]' }, 0),
    ).not.toThrow();
  });
});

// ---------------------------------------------------------------------------
// S127/CB11 · the import domain caps completed (the s127 server audit's
// M-9): the CA14 contract covers "the CHEAP time-independent invariants" —
// several route-enforced ones were still missing, so a hand-edited backup
// persisted rows every interactive route rejects. Each cap below mirrors
// its route's Zod bound verbatim.
// ---------------------------------------------------------------------------
describe("S127/CB11 · the completed import domain caps", () => {
  it("rejects an exam duration outside 5..600 (the route's atom)", () => {
    expect(() =>
      sanitizeImportRow("exams", { id: "e1", duration: 601 }, 0),
    ).toThrow(ImportRowError);
    expect(() =>
      sanitizeImportRow("exams", { id: "e1", duration: 4 }, 0),
    ).toThrow(ImportRowError);
  });

  it("accepts the exam duration boundaries (5, 600) and the absent leg", () => {
    expect(() => sanitizeImportRow("exams", { id: "e1", duration: 5 }, 0)).not.toThrow();
    expect(() => sanitizeImportRow("exams", { id: "e1", duration: 600 }, 0)).not.toThrow();
    expect(() => sanitizeImportRow("exams", { id: "e1" }, 0)).not.toThrow();
  });

  it("rejects a practice-test durationMinutes outside 1..600", () => {
    expect(() =>
      sanitizeImportRow("practiceTests", { id: "p1", durationMinutes: 0 }, 0),
    ).toThrow(ImportRowError);
    expect(() =>
      sanitizeImportRow("practiceTests", { id: "p1", durationMinutes: 601 }, 0),
    ).toThrow(ImportRowError);
  });

  it("rejects a focus-session durationSeconds outside 1..86400 (it feeds every focus stat)", () => {
    expect(() =>
      sanitizeImportRow("focusSessions", { id: "f1", durationSeconds: 0 }, 0),
    ).toThrow(ImportRowError);
    expect(() =>
      sanitizeImportRow("focusSessions", { id: "f1", durationSeconds: 86401 }, 0),
    ).toThrow(ImportRowError);
    expect(() =>
      sanitizeImportRow("focusSessions", { id: "f1", durationSeconds: 86400 }, 0),
    ).not.toThrow();
  });

  it("rejects a study-group members array beyond the 50-member cap", () => {
    const members = JSON.stringify(
      Array.from({ length: 51 }, (_, i) => ({ name: `M${i}`, email: `m${i}@x.y` })),
    );
    expect(() =>
      sanitizeImportRow("studyGroups", { id: "g1", members }, 0),
    ).toThrow(ImportRowError);
    const fifty = JSON.stringify(
      Array.from({ length: 50 }, (_, i) => ({ name: `M${i}`, email: `m${i}@x.y` })),
    );
    expect(() =>
      sanitizeImportRow("studyGroups", { id: "g1", members: fifty }, 0),
    ).not.toThrow();
  });

  it("rejects a grade weight outside 0..100 (it feeds the weighted mean)", () => {
    expect(() =>
      sanitizeImportRow("grades", { id: "g1", score: 50, weight: 101 }, 0),
    ).toThrow(ImportRowError);
    expect(() =>
      sanitizeImportRow("grades", { id: "g1", score: 50, weight: -0.5 }, 0),
    ).toThrow(ImportRowError);
    expect(() =>
      sanitizeImportRow("grades", { id: "g1", score: 50, weight: 100 }, 0),
    ).not.toThrow();
  });

  it("rejects an event whose endDate precedes its startDate (the BU22 guard)", () => {
    expect(() =>
      sanitizeImportRow("events", {
        id: "v1",
        startDate: "2031-03-15T14:00:00.000Z",
        endDate: "2031-03-15T13:00:00.000Z",
      }, 0),
    ).toThrow(ImportRowError);
    expect(() =>
      sanitizeImportRow("events", {
        id: "v1",
        startDate: "2031-03-15T13:00:00.000Z",
        endDate: "2031-03-15T14:00:00.000Z",
      }, 0),
    ).not.toThrow();
  });

  it("rejects a malformed timetable hhmm leg (the atom's own shape)", () => {
    expect(() =>
      sanitizeImportRow("timetableClasses", { id: "c1", startTime: "banana" }, 0),
    ).toThrow(ImportRowError);
    expect(() =>
      sanitizeImportRow("timetableClasses", { id: "c1", startTime: "25:00" }, 0),
    ).toThrow(ImportRowError);
  });

  it("rejects an inverted timetable span (minutes compare, never raw strings)", () => {
    expect(() =>
      sanitizeImportRow("timetableClasses", { id: "c1", startTime: "10:00", endTime: "09:00" }, 0),
    ).toThrow(ImportRowError);
  });

  it("accepts the legacy unpadded hour (the atom admits '9:00')", () => {
    expect(() =>
      sanitizeImportRow("timetableClasses", { id: "c1", startTime: "9:00", endTime: "10:30" }, 0),
    ).not.toThrow();
  });
});

// ---------------------------------------------------------------------------
// S127/CB19 · the export/import profile round-trip (the s127 server
// audit's L-5): the export envelope deliberately carries a hashless
// publicUser block, but the import route never read it — school, grade
// level, study goal, theme, accent, avatar, and notifications silently
// dropped on restore (a quiet violation of the ADR-019 "own your data"
// round-trip). importProfilePatch extracts the validated preference
// fields; identity (email, name, id) NEVER rides the patch; a garbage
// block stays ignored (the existing tolerance contract).
// ---------------------------------------------------------------------------
describe("S127/CB19 · the envelope user-profile patch", () => {
  it("extracts the validated preference fields from a publicUser-shaped block", () => {
    const patch = importProfilePatch({
      id: "u1",
      email: "someone@example.com",
      name: "Someone",
      emailVerified: true,
      createdAt: "2031-01-01T00:00:00.000Z",
      updatedAt: "2031-01-01T00:00:00.000Z",
      themeMode: "dark",
      accentColor: "violet",
      avatarEmoji: "",
      notificationsEnabled: false,
      schoolName: "Springfield High",
      gradeLevel: "11th Grade",
      studyGoalHours: 6,
    });
    expect(patch).toEqual({
      themeMode: "dark",
      accentColor: "violet",
      avatarEmoji: "",
      notificationsEnabled: false,
      schoolName: "Springfield High",
      gradeLevel: "11th Grade",
      studyGoalHours: 6,
    });
    // Identity NEVER rides the patch.
    expect(patch).not.toHaveProperty("id");
    expect(patch).not.toHaveProperty("email");
    expect(patch).not.toHaveProperty("name");
  });

  it("ignores a garbage block (the tolerance contract holds)", () => {
    expect(importProfilePatch("garbage")).toBeNull();
    expect(importProfilePatch({ themeMode: "neon" })).toBeNull();
    expect(importProfilePatch({ studyGoalHours: 99 })).toBeNull();
  });

  it("returns null for an absent block (the pre-CB19 behavior)", () => {
    expect(importProfilePatch(undefined)).toBeNull();
    expect(importProfilePatch(null)).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// S128/CC1 · the profile-patch whitelist (the s128 client-layer audit's M-1).
//
// The CB19 seam parsed the envelope's user block with preferencesSchema and
// copied EVERY defined parsed key into the tx.user.update patch — but that
// schema legitimately carries a `displayName` leg (the Settings alias for
// the fullName column), and the User model has NO displayName column: a
// hand-edited envelope carrying it triggered PrismaClientValidationError
// inside the all-or-nothing transaction, rolling back the ENTIRE restore
// with the misleading "row whose fields do not match" 400. The fix is a
// WHITELIST: only the seven preference keys ride the patch — displayName
// is name-shaped identity and never rides (the seam's own contract).
// ---------------------------------------------------------------------------
describe("S128/CC1 · the profile-patch whitelist (displayName never rides)", () => {
  it("a displayName-bearing block produces a patch WITHOUT it (the preferences still ride)", () => {
    const patch = importProfilePatch({
      name: "Someone",
      displayName: "Spliced Name",
      themeMode: "dark",
      accentColor: "blue",
      schoolName: "Springfield High",
    });
    // Pre-fix: displayName rode the patch verbatim (the nonexistent column).
    expect(patch).not.toHaveProperty("displayName");
    expect(patch).toEqual({
      themeMode: "dark",
      accentColor: "blue",
      schoolName: "Springfield High",
    });
  });

  it("a displayName-ONLY block yields null (nothing applicable to restore)", () => {
    expect(importProfilePatch({ displayName: "Just A Name" })).toBeNull();
  });

  it("the seven-key vocabulary is closed — no key outside it can ever ride", () => {
    const patch = importProfilePatch({
      themeMode: "system",
      accentColor: "violet",
      avatarEmoji: "🦊",
      notificationsEnabled: true,
      schoolName: "S",
      gradeLevel: "",
      studyGoalHours: 4,
      // Every other preferencesSchema-legal or envelope-carried key:
      displayName: "X",
      id: "u1",
      email: "e@example.com",
      name: "N",
      emailVerified: true,
      createdAt: "2031-01-01T00:00:00.000Z",
      updatedAt: "2031-01-01T00:00:00.000Z",
    });
    expect(Object.keys(patch as object).sort()).toEqual([
      "accentColor",
      "avatarEmoji",
      "gradeLevel",
      "notificationsEnabled",
      "schoolName",
      "studyGoalHours",
      "themeMode",
    ]);
  });
});

// ---------------------------------------------------------------------------
// S130/CE7 · the import length caps (docs/remediation-plan-session130.md).
//
// The s130 server audit's L2/L3: importRowIdError bounded the row id to
// NON-EMPTY ONLY (every interactive boundary bounds ids at 64 — idField),
// and the per-field cap was a flat 1 M catch-all — validation.ts's 41
// per-field length atoms (title 200, notes 5000, front/back 2000, tags
// 2000, room 100, description 1000/5000 ...) were NOT mirrored at the
// third entry point, so a hand-edited backup could persist rows the
// interactive routes would 400 (a 900-K-char tasks.notes row bloats every
// list read; a 64+-char id bloats every index entry and FK probe).
// The registry (IMPORT_FIELD_LENGTHS) mirrors the validation.ts atoms;
// the flat 1 M cap remains the UNKNOWN-field default.
// ---------------------------------------------------------------------------
describe("S130/CE7 · the import length caps", () => {
  it("rejects a row id longer than 64 chars (the idField atom, shared by the third entry point)", () => {
    expect(importRowIdError("tasks", { id: "x".repeat(65) })).toContain("id");
    expect(importRowIdError("tasks", { id: "x".repeat(64) })).toBeNull();
  });

  it("rejects a tasks.title beyond the 200-char atom", () => {
    expect(() =>
      sanitizeImportRow("tasks", { id: "t1", title: "x".repeat(201) }, 0),
    ).toThrow(ImportRowError);
  });

  it("accepts a tasks.title at exactly the atom boundary (200)", () => {
    expect(() =>
      sanitizeImportRow("tasks", { id: "t1", title: "x".repeat(200) }, 0),
    ).not.toThrow();
  });

  it("rejects a cards.front beyond the 2,000-char atom (the message names the cap)", () => {
    expect(() =>
      sanitizeImportRow("cards", { id: "c1", front: "x".repeat(2_001) }, 0),
    ).toThrow(/2,000/);
  });

  it("rejects a notes.tags beyond the 2,000-char atom and an events.description beyond 1,000", () => {
    expect(() =>
      sanitizeImportRow("notes", { id: "n1", title: "T", tags: "x".repeat(2_001) }, 0),
    ).toThrow(ImportRowError);
    expect(() =>
      sanitizeImportRow("events", { id: "e1", title: "T", startDate: "2026-09-01T09:00:00.000Z", description: "x".repeat(1_001) }, 0),
    ).toThrow(ImportRowError);
  });

  it("an UNKNOWN field keeps the 1 M generic default (the registry caps only the mirrored atoms)", () => {
    expect(() =>
      sanitizeImportRow("focusSessions", { id: "f1", mode: "x".repeat(500) }, 0),
    ).not.toThrow();
  });

  it("the registry covers every documented atom key (a dropped entry falls back to the 1 M default silently — this census fails loudly)", async () => {
    const { IMPORT_FIELD_LENGTHS } = await import("../src/lib/data-import");
    const keys = Object.keys(IMPORT_FIELD_LENGTHS).sort();
    expect(keys).toEqual([
      "assignments.description",
      "assignments.title",
      "cards.back",
      "cards.front",
      "events.description",
      "events.location",
      "events.reminders",
      "events.title",
      "exams.location",
      "exams.title",
      "exams.topics",
      "flashcardDecks.description",
      "flashcardDecks.name",
      "grades.title",
      "notebooks.name",
      "notes.content",
      "notes.tags",
      "notes.title",
      "practiceTests.questions",
      "practiceTests.title",
      "studyGroups.name",
      "subjects.name",
      "taskLists.name",
      "tasks.notes",
      "tasks.subtasks",
      "tasks.title",
      "timetableClasses.name",
      "timetableClasses.room",
    ]);
    // Spot-assert the atom values (the full mirror is the provenance
    // comment's contract — validation.ts is the single source).
    expect(IMPORT_FIELD_LENGTHS["tasks.notes"]).toBe(5_000);
    expect(IMPORT_FIELD_LENGTHS["notes.content"]).toBe(100_000);
    expect(IMPORT_FIELD_LENGTHS["timetableClasses.room"]).toBe(100);
  });
});

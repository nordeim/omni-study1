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
import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  IMPORT_FK_MAP,
  IMPORT_MAX_BYTES,
  IMPORT_MAX_ROWS,
  IMPORT_OPTIONAL_FKS,
  IMPORT_REQUIRED_FKS,
  ImportRowError,
  importProfilePatch,
  importRowIdError,
  parseImportEnvelope,
  sanitizeImportRow,
  sortFoldersParentsFirst,
} from "../src/lib/data-import";
import { EXPORT_COLLECTIONS } from "../src/lib/data-export";
import { importRestoreError } from "@/lib/data-import";
import { ValidationError } from "@/lib/server/http";

function ValidationErrorCtor(): new (msg: string) => Error {
  return ValidationError as unknown as new (msg: string) => Error;
}

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

  // S133/CH4 re-anchor: the pre-CH4 seam TOLERATED a missing data key
  // (imported zero rows, ok:true) while the production route 400'd — the
  // drifted twin this cycle closed. The envelope validator now REJECTS the
  // missing data block with the route's shipped message; missing
  // COLLECTION keys inside a present data object still import as empty.
  it("rejects a MISSING data key with the route's shipped 400 (the drifted tolerance removed)", () => {
    const res = parseImportEnvelope({ format: "studyflow-data-export", version: 1 });
    expect(res.ok).toBe(false);
    if (res.ok) return;
    expect(res.error).toContain("no data object");
  });

  it("treats missing collection keys as empty (the never-branch-on-presence promise)", () => {
    const res = parseImportEnvelope({
      format: "studyflow-data-export",
      version: 1,
      data: { subjects: [{ id: "s1", name: "Math" }] },
    });
    expect(res.ok).toBe(true);
    if (!res.ok) return;
    expect(res.rows.subjects).toHaveLength(1);
    expect(res.rows.holidays).toEqual([]);
    expect(res.totalRows).toBe(1);
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

  it("rejects an OLDER version with the actionable message (S139/CN2 — the floor half of the documented version contract, never pinned)", () => {
    const env = validEnvelope() as Record<string, unknown>;
    env.version = 0;
    const res = parseImportEnvelope(env);
    expect(res.ok).toBe(false);
    if (res.ok) return;
    expect(res.error).toContain("older version");
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

  // S144/CS2 (audit B-M1, the class RE-MEASURED on this Node — the
  // reproduce-before-trusting doctrine): the dequeue was Array.shift()
  // — O(n) per call, O(n²) over the loop. This Node's measured curve:
  // 27 ms at 2×10⁴ → 449 ms at 8×10⁴ → 2,842 ms at 2×10⁵ (25x rows →
  // 104x time — the quadratic confirmed; the audit's ~13 s at 10⁵
  // constant did NOT reproduce here, ~10x smaller on this build), which
  // projects ~12 MINUTES of event-loop pinning at the 64 MiB byte cap's
  // ~10⁶ minimal-row ceiling — the sitewide freeze class holds at the
  // cap tier even though the 10⁵-tier constant is sub-second. The topo
  // sort is the ONLY superlinear pre-tx stage on an otherwise-linear
  // path (sanitize + IN-probes are linear). The cursor form (the queue
  // only ever GROWS during iteration — children are pushed, never
  // removed) runs ~125 ms at the 250k probe size: 16x margin on the
  // bound below; the shift form measures ~4.4 s there — 2.2x OVER the
  // bound, the designed RED. The 60 s test timeout lets the pre-fix RED
  // fail the ASSERTION (the elapsed bound), never a runner timeout.
  it("S144/CS2: sorts a 250k-folder star inside the linear budget (the O(n²) shift dequeue was the hostile-envelope event-loop freeze class)", () => {
    // The STAR, not the chain: a linear chain keeps the live queue at
    // ≤2 elements (every shift is trivially cheap — the degenerate easy
    // case this leg's first draft accidentally picked); the star — one
    // root, 249,999 children — pushes the whole sibling set onto the
    // queue at the root's pop, so EVERY subsequent shift() moves the
    // ~2.5×10⁵-element tail (the honest worst case for an O(n)-per-
    // shift dequeue: ~3×10¹⁰ element moves). 250k rows is ROUTE-
    // REACHABLE pre-fix (~9 MB of minimal rows, well under the 64 MiB
    // byte cap) and stays a legitimate seam input post-cap (the CS5
    // ceiling bounds the ROUTE, not this exported pure function — the
    // linearity contract is the pin, at any size).
    const folders = Array.from({ length: 250_000 }, (_, i) => ({
      id: `f${i}`,
      name: "F",
      parentId: i === 0 ? null : "f0",
    }));
    const t0 = performance.now();
    const result = sortFoldersParentsFirst(folders);
    const elapsed = performance.now() - t0;
    expect(typeof result).not.toBe("string"); // no cycle in a star
    if (typeof result === "string") return;
    const ordered = result;
    expect(ordered).toHaveLength(250_000);
    // parents-first holds at scale: the star's root emits FIRST.
    expect(ordered[0]?.id).toBe("f0");
    expect(elapsed).toBeLessThan(2_000);
  }, 60_000);
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

  it("keeps unknown content fields untouched at the SEAM level (parse-only — the route's Prisma write still rejects a genuinely unknown column with the fields-do-not-match 400; a future version's new fields import only after a schema upgrade)", () => {
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
  it("is 64 MiB — the S137/CL2 arithmetic reconciliation (25 MiB covered only ~9 max-size files, not the documented ~18)", () => {
    // S124/BY3: 10 → 25 MiB (the export emits base64 file payloads inline,
    // so ~4-5 max-size uploads made the user's own backup unrestorable
    // under the old 10 MiB cap). S137/CL2: 25 → 64 MiB — the BY3-era
    // "~18 max-size files at 25 MiB" claim was ~2× off: a 2 MiB upload
    // inflates to ceil(2,097,152/3)*4 = 2,796,204 base64 chars, so 25 MiB
    // covers ~9.4 files. 64 MiB covers ~23 — the realistic round-trip
    // promise (~18 max-size files' base64 + content) with margin.
    expect(IMPORT_MAX_BYTES).toBe(64 * 1024 * 1024);
  });

  it("covers the documented realistic round-trip (~18 max-size files' base64) — the machine-checked arithmetic (S137/CL2)", () => {
    // The honest bound: floor(cap / one max-size file's base64 inflation).
    // The next re-size of IMPORT_MAX_BYTES must reconcile with THIS leg,
    // not with a prose claim — the S137 lesson (the ~18 claim rotted at
    // 25 MiB for four sessions because nothing machine-checked it).
    const ONE_MAX_FILE_BASE64 = Math.ceil((2 * 1024 * 1024) / 3) * 4; // 2,796,204
    expect(Math.floor(IMPORT_MAX_BYTES / ONE_MAX_FILE_BASE64)).toBeGreaterThanOrEqual(18);
  });
});

describe("IMPORT_MAX_ROWS (the S144/CS5 parse-memory amplification bound)", () => {
  // The byte cap bounds the BODY, not the parsed object tree: a 64 MiB
  // envelope of minimal rows parses into ~10⁶ row objects (several
  // hundred MB resident per hostile request, no deadline). The row
  // ceiling bounds the amplification — comfortably above any real
  // account (the volume-stress profile tops out in the hundreds), far
  // below the ~10⁶ the byte cap admits. The cap constant lives in the
  // seam (beside IMPORT_MAX_BYTES); the CHECK lives in the route (the
  // byte-cap precedent) — the route-side wiring is census-pinned in
  // tests/script-conventions.test.ts.
  it("is 100,000 — the S144/CS5 ceiling (the machine-checked value, not a prose claim)", () => {
    expect(IMPORT_MAX_ROWS).toBe(100_000);
  });

  it("stays ≤ the byte cap's minimal-row ceiling (the two caps reconcile — the IMPORT_MAX_BYTES re-size family)", () => {
    // The minimal serialized folder row (~30-42 bytes) puts ~10⁶ rows
    // inside the 64 MiB byte cap; the row cap must stay the binding
    // constraint for the amplification class it exists to close. The
    // next re-size of EITHER cap must reconcile with THIS leg.
    const MINIMAL_ROW_BYTES = 30;
    expect(IMPORT_MAX_ROWS).toBeLessThanOrEqual(
      Math.floor(IMPORT_MAX_BYTES / MINIMAL_ROW_BYTES),
    );
    // And comfortably above the documented realistic profile (the
    // S42/S43 volume stress runs 300/200/250 — every collection far
    // below the ceiling).
    expect(IMPORT_MAX_ROWS).toBeGreaterThan(1_000);
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

  it("accepts the EQUAL-times span — the app's own creatable shape (S137/CL1, the round-trip contract)", () => {
    // S137/CL1 (audit B-M1): the interactive boundary (hhmmEndBeforeStart)
    // rejects only endMin < startMin — a zero-length 09:00–09:00 class is
    // creatable through the UI/API and persists. The import seam rejected
    // endTime <= startTime, so ONE such row in an export bricked the
    // ENTIRE all-or-nothing restore with a message blaming a row the app
    // itself minted. The import mirrors the interactive boundary: strict
    // inversion rejects, equal times import clean.
    expect(() =>
      sanitizeImportRow("timetableClasses", { id: "c1", startTime: "09:00", endTime: "09:00" }, 0),
    ).not.toThrow();
  });

  it("accepts the legacy unpadded hour (the atom admits '9:00')", () => {
    expect(() =>
      sanitizeImportRow("timetableClasses", { id: "c1", startTime: "9:00", endTime: "10:30" }, 0),
    ).not.toThrow();
  });
});

// ---------------------------------------------------------------------------
// S139/CN1 (audit A-M1) · the import parity integrality sextet. The
// hand-crafted-envelope parity contract (ADR-021: the import validates
// what the app itself can mint) still missed six cheap invariants the
// interactive routes enforce: progress/dayOfWeek admitted non-integers
// (12.5 passed the guard, died at Prisma as the GENERIC "fields do not
// match" 400 — the CJ4 actionable-copy degradation); grades.maxScore
// admitted 0.5 (a Float column — no Prisma backstop — while the route
// atom is min(1)); files.mime rode the generic 1 M-char default (a
// poisoned row inflates EVERY files list GET — FILE_METADATA carries
// mime — the CE7 bloat class); files.size admitted negatives and
// non-integers; studyGroups.members item shapes were unvalidated (the
// 1 M generic vs the ~15 K interactive reality).
// ---------------------------------------------------------------------------
describe("S139/CN1 · the import parity integrality sextet", () => {
  it("rejects a non-integer assignment progress (the route atom is int — 12.5 currently dies at Prisma as the generic 400)", () => {
    expect(() =>
      sanitizeImportRow("assignments", { id: "a1", progress: 12.5 }, 0),
    ).toThrow(/whole number/);
  });

  it("rejects a non-integer timetable dayOfWeek (the route atom is int)", () => {
    expect(() =>
      sanitizeImportRow("timetableClasses", { id: "c1", dayOfWeek: 3.5 }, 0),
    ).toThrow(/whole number/);
  });

  it("rejects a fractional grades maxScore below 1 (0.5 currently PERSISTS — the Float column has no Prisma backstop)", () => {
    expect(() =>
      sanitizeImportRow("grades", { id: "g1", title: "G", score: 0.4, maxScore: 0.5 }, 0),
    ).toThrow(/greater than or equal to 1/);
  });

  it("rejects an oversized files mime (a poisoned 1 M-char mime rides FILE_METADATA into every files list GET)", () => {
    expect(() =>
      sanitizeImportRow("files", { id: "f1", name: "n", mime: "x".repeat(101) }, 0),
    ).toThrow(/mime/);
  });

  // S144/CS4 (audit B-L1, probed): the guard was LENGTH-only — a
  // hand-crafted "text/html\r\nSet-Cookie: pwn=1" (≤100 chars)
  // imported clean, persisted, then threw TypeError at the download
  // door's `new NextResponse(headers)` on EVERY GET of that row
  // (Node/undici rejects CR/LF header VALUES — the 500-on-read taxonomy
  // break; the throw fails closed, so no header injection — hostile-
  // self-import only, the row stays deletable). The charset leg admits
  // exactly what browsers emit for entry.type (printable ASCII; empty
  // still passes — the unknown-type "" shape must keep importing).
  it("S144/CS4: rejects a files mime containing control characters or non-ASCII (a stored CRLF mime 500s that file's download forever)", () => {
    expect(() =>
      sanitizeImportRow("files", { id: "f1", name: "n", mime: "text/html\r\nSet-Cookie: pwn=1" }, 0),
    ).toThrow(/mime/);
    expect(() =>
      sanitizeImportRow("files", { id: "f2", name: "n", mime: "text/plain\u001b[31m" }, 0),
    ).toThrow(/mime/);
    expect(() =>
      sanitizeImportRow("files", { id: "f3", name: "n", mime: "text/pla\u00efn" }, 0),
    ).toThrow(/mime/);
    // The browser-real shapes still import (the boundary-exact set).
    expect(() =>
      sanitizeImportRow("files", { id: "f4", name: "n", mime: "" }, 0),
    ).not.toThrow();
    expect(() =>
      sanitizeImportRow("files", { id: "f5", name: "n", mime: "text/html; charset=utf-8" }, 0),
    ).not.toThrow();
  });

  it("rejects a negative and a non-integer files size, and an over-cap size (the upload ceiling mirror)", () => {
    expect(() =>
      sanitizeImportRow("files", { id: "f1", name: "n", size: -5 }, 0),
    ).toThrow(/size/);
    expect(() =>
      sanitizeImportRow("files", { id: "f1", name: "n", size: 1.5 }, 0),
    ).toThrow(/size/);
    expect(() =>
      sanitizeImportRow("files", { id: "f1", name: "n", size: 2 * 1024 * 1024 + 1 }, 0),
    ).toThrow(/size/);
    expect(() =>
      sanitizeImportRow("files", { id: "f1", name: "n", size: 2 * 1024 * 1024 }, 0),
    ).not.toThrow();
  });

  it("rejects a study-group members item with a bad shape (a non-object item; a blank name; an oversized email)", () => {
    expect(() =>
      sanitizeImportRow("studyGroups", { id: "g1", members: JSON.stringify(["not-an-object"]) }, 0),
    ).toThrow(/members/);
    expect(() =>
      sanitizeImportRow("studyGroups", { id: "g1", members: JSON.stringify([{ name: " ", email: "m@x.y" }]) }, 0),
    ).toThrow(/members/);
    expect(() =>
      sanitizeImportRow("studyGroups", { id: "g1", members: JSON.stringify([{ name: "M", email: "x".repeat(201) }]) }, 0),
    ).toThrow(/members/);
    expect(() =>
      sanitizeImportRow("studyGroups", { id: "g1", members: JSON.stringify([{ name: "M", email: "m@x.y" }]) }, 0),
    ).not.toThrow();
  });
});

// ---------------------------------------------------------------------------
// S137/CL6 (audit B-L1) · the import date sanity band. The seam accepted
// ARBITRARY createdAt/updatedAt strings: a hand-edited far-future
// timestamp (9999) rode the row into the DB and permanently poisoned the
// newest-500 windows (every collection GET ranks it above every real row;
// with >=500 poisoned rows all real data vanishes from every in-app
// list). The band: the two SYSTEM-minted timestamps must parse inside
// [2000-01-01, now + 24h] — old-but-real accounts import clean, a
// clock-skewed near-future imports clean, the poison vectors reject
// BEFORE the transaction with the named copy. User-facing date fields
// (dueDate, exam dates — legitimately years out) are deliberately NOT
// banded.
// ---------------------------------------------------------------------------
describe("S137/CL6 · the import date sanity band (the window-poison vector)", () => {
  it("rejects a far-future createdAt (the 9999 poison)", () => {
    expect(() =>
      sanitizeImportRow("tasks", {
        id: "cl6-future",
        title: "T",
        createdAt: "9999-12-31T00:00:00.000Z",
      }, 0),
    ).toThrow(/date range/);
  });

  it("rejects a pre-2000 createdAt (the garbage-past poison)", () => {
    expect(() =>
      sanitizeImportRow("tasks", {
        id: "cl6-past",
        title: "T",
        createdAt: "1900-01-01T00:00:00.000Z",
      }, 0),
    ).toThrow(/date range/);
  });

  it("rejects a far-future updatedAt too (both system timestamps banded)", () => {
    expect(() =>
      sanitizeImportRow("subjects", {
        id: "cl6-future2",
        name: "S",
        color: "#8b5cf6",
        createdAt: "2026-01-01T00:00:00.000Z",
        updatedAt: "9999-12-31T00:00:00.000Z",
      }, 0),
    ).toThrow(/date range/);
  });

  it("accepts an old-but-legit timestamp (a 2015 account imports clean)", () => {
    expect(() =>
      sanitizeImportRow("tasks", {
        id: "cl6-old",
        title: "T",
        createdAt: "2015-06-15T12:00:00.000Z",
      }, 0),
    ).not.toThrow();
  });

  it("leaves user-facing date fields un-banded (a 2031 event startDate is legal)", () => {
    // The band covers ONLY createdAt/updatedAt — user-facing dates are
    // user-intent and legitimately years in the future (the existing
    // inverted-span legs' own 2031 events prove the shape).
    expect(() =>
      sanitizeImportRow("events", {
        id: "cl6-evt",
        startDate: "2031-03-15T13:00:00.000Z",
        endDate: "2031-03-15T14:00:00.000Z",
        createdAt: "2026-01-01T00:00:00.000Z",
      }, 0),
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
    // S133/CH2 re-anchor: the leg used focusSessions.mode as its "unknown"
    // example — mode is now a mirrored enum+vocabulary field, so the
    // contract moves to a genuinely unknown field name.
    expect(() =>
      sanitizeImportRow("focusSessions", { id: "f1", nickname: "x".repeat(500) }, 0),
    ).not.toThrow();
  });

  it("the registry covers every documented atom key (a dropped entry falls back to the 1 M default silently — this census fails loudly)", async () => {
    const { IMPORT_FIELD_LENGTHS } = await import("../src/lib/data-import");
    const keys = Object.keys(IMPORT_FIELD_LENGTHS).sort();
    // S133/CH1+CH2 re-anchor: the dead "flashcardDecks.*" keys renamed to
    // the manifest name ("decks.*"), and the four parity-contract atoms
    // added (calcHistory.expression/result, holidays.name, folders.name,
    // chatMessages.content).
    // S139/CN1 re-anchor: files.mime joined (the CE7 bloat class — the
    // mime rode the 1 M generic default into every files list GET).
    expect(keys).toEqual([
      "assignments.description",
      "assignments.title",
      "calcHistory.expression",
      "calcHistory.result",
      "cards.back",
      "cards.front",
      "chatMessages.content",
      "decks.description",
      "decks.name",
      "events.description",
      "events.location",
      "events.reminders",
      "events.title",
      "exams.location",
      "exams.title",
      "exams.topics",
      "files.mime",
      "folders.name",
      "grades.title",
      "holidays.name",
      "notebooks.name",
      "notes.content",
      "notes.tags",
      "notes.title",
      "practiceTests.questions",
      "practiceTests.title",
      "studyGroups.description",
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
    expect(IMPORT_FIELD_LENGTHS["decks.name"]).toBe(200);
    expect(IMPORT_FIELD_LENGTHS["calcHistory.expression"]).toBe(500);
    expect(IMPORT_FIELD_LENGTHS["chatMessages.content"]).toBe(100_000);
  });
});

// ---------------------------------------------------------------------------
// S133/CH1 — the registry keys ride the MANIFEST collection names.
// The CE7 entry shipped `"flashcardDecks.name"/"flashcardDecks.description"`
// while the import route iterates the MANIFEST name "decks" (IMPORT_ORDER /
// EXPORT_COLLECTIONS carry "decks", never "flashcardDecks") — fieldCapFor
// looks up `${collection}.${field}` with the manifest name, so the two keys
// were dead their whole life and the deck caps were INERT (a hand-edited
// backup stored a 999,999-char deck name every interactive route 400s at
// 200). Worse, the census pin above machine-enforced the WRONG key list.
// ---------------------------------------------------------------------------
describe("S133/CH1 · the registry keys ride the manifest collection names", () => {
  it("the deck caps are keyed by the manifest name \"decks\" — the flashcardDecks.* twins are gone", async () => {
    const { IMPORT_FIELD_LENGTHS } = await import("../src/lib/data-import");
    expect(IMPORT_FIELD_LENGTHS["decks.name"]).toBe(200);
    expect(IMPORT_FIELD_LENGTHS["decks.description"]).toBe(1_000);
    expect(IMPORT_FIELD_LENGTHS["flashcardDecks.name"]).toBeUndefined();
    expect(IMPORT_FIELD_LENGTHS["flashcardDecks.description"]).toBeUndefined();
  });

  it("a deck name beyond the 200-char atom is rejected (the cap the dead key never enforced)", () => {
    expect(() =>
      sanitizeImportRow("decks", { id: "d1", name: "x".repeat(201) }, 0),
    ).toThrow(ImportRowError);
    expect(() =>
      sanitizeImportRow("decks", { id: "d1", description: "y".repeat(1_001) }, 0),
    ).toThrow(ImportRowError);
    expect(() =>
      sanitizeImportRow("decks", { id: "d1", name: "x".repeat(200) }, 0),
    ).not.toThrow();
  });

  it("the manifest-consistency census: every registry key's collection prefix is a real manifest collection", async () => {
    const mod = await import("../src/lib/data-import");
    const manifest = new Set<string>(EXPORT_COLLECTIONS);
    const registries: Array<[string, string[] | null]> = [
      ["IMPORT_FIELD_LENGTHS", mod.IMPORT_FIELD_LENGTHS ? Object.keys(mod.IMPORT_FIELD_LENGTHS) : null],
      ["ENUM_VOCABULARIES", mod.ENUM_VOCABULARIES ? Object.keys(mod.ENUM_VOCABULARIES) : null],
      ["JSON_STRING_FIELDS", mod.JSON_STRING_FIELDS ? Object.keys(mod.JSON_STRING_FIELDS) : null],
      ["HEX_COLOR_FIELDS", mod.HEX_COLOR_FIELDS ? [...mod.HEX_COLOR_FIELDS] : null],
      ["IMPORT_FIELD_MIN_LENGTHS", mod.IMPORT_FIELD_MIN_LENGTHS ? Object.keys(mod.IMPORT_FIELD_MIN_LENGTHS) : null],
    ];
    const offenders: string[] = [];
    for (const [name, keys] of registries) {
      if (!keys) throw new Error(`${name} is not exported — the census cannot run`);
      for (const key of keys) {
        const prefix = key.includes(".") ? key.split(".")[0] : key;
        if (!manifest.has(prefix)) offenders.push(`${name}: "${key}"`);
      }
    }
    expect(
      offenders,
      `registry keys whose collection prefix is not a manifest collection (the CH1 class — the key can never match at the call site): ${offenders.join(", ")}`,
    ).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// S171/DU2b — the studygroups description import cap (the CH1 idiom on the
// new family field): the reference's StudyGroup model carries a description
// (measured live at the s171 gated write-path probe — the create dialog's
// "What's this group about?" textarea + the POST round-trip), and the clone
// ports it bounded at 500 (the bounded-everything posture; the deck
// family's 1_000-char description is the precedent). The registry key rides
// the MANIFEST collection name ("studyGroups"), and the parity-contract
// census above maps it to its validation.ts source atom.
// ---------------------------------------------------------------------------
describe("S171/DU2b · the studygroups description import cap", () => {
  it("the cap is keyed by the manifest name and set to the schema's 500", async () => {
    const { IMPORT_FIELD_LENGTHS } = await import("../src/lib/data-import");
    expect(IMPORT_FIELD_LENGTHS["studyGroups.description"]).toBe(500);
  });

  it("a description beyond the 500-char atom is rejected; at the atom it passes", () => {
    expect(() =>
      sanitizeImportRow("studyGroups", { id: "sg1", description: "d".repeat(501) }, 0),
    ).toThrow(ImportRowError);
    expect(() =>
      sanitizeImportRow("studyGroups", { id: "sg1", description: "d".repeat(500) }, 0),
    ).not.toThrow();
  });
});

// ---------------------------------------------------------------------------
// S133/CH2 — the import parity contract completed (the CA14 doctrine's
// missing atoms): the five unmirrored enum vocabularies, the four hexColor
// fields, the four missing length atoms, the grades 1000 ceiling, the
// min-1 lengths, and the JSON key bound.
// ---------------------------------------------------------------------------
describe("S133/CH2 · the import parity contract completed", () => {
  it("rejects an out-of-vocabulary events.repeat", () => {
    expect(() =>
      sanitizeImportRow("events", { id: "e1", title: "T", repeat: "hourly" }, 0),
    ).toThrow(ImportRowError);
  });

  it("rejects an out-of-vocabulary exams.type", () => {
    expect(() =>
      sanitizeImportRow("exams", { id: "x1", title: "T", type: "viva" }, 0),
    ).toThrow(ImportRowError);
  });

  it("rejects an out-of-vocabulary timetableClasses.weekType (the Z-week class invisible in every week view)", () => {
    expect(() =>
      sanitizeImportRow("timetableClasses", { id: "c1", name: "N", weekType: "Z" }, 0),
    ).toThrow(ImportRowError);
  });

  it("rejects an out-of-vocabulary focusSessions.mode (the row the focus stats drop)", () => {
    expect(() =>
      sanitizeImportRow("focusSessions", { id: "f1", durationSeconds: 60, mode: "nap" }, 0),
    ).toThrow(ImportRowError);
  });

  it("rejects an out-of-vocabulary calcHistory.mode", () => {
    expect(() =>
      sanitizeImportRow("calcHistory", { id: "h1", expression: "1+1", result: "2", mode: "programmer" }, 0),
    ).toThrow(ImportRowError);
  });

  it("accepts the legal vocabulary members on every new field (the boundary legs)", () => {
    expect(() =>
      sanitizeImportRow("events", { id: "e1", title: "T", repeat: "weekly" }, 0),
    ).not.toThrow();
    expect(() =>
      sanitizeImportRow("exams", { id: "x1", title: "T", type: "midterm" }, 0),
    ).not.toThrow();
    expect(() =>
      sanitizeImportRow("timetableClasses", { id: "c1", name: "N", weekType: "B" }, 0),
    ).not.toThrow();
    expect(() =>
      sanitizeImportRow("focusSessions", { id: "f1", durationSeconds: 60, mode: "long-break" }, 0),
    ).not.toThrow();
    expect(() =>
      sanitizeImportRow("calcHistory", { id: "h1", expression: "1+1", result: "2", mode: "gpa" }, 0),
    ).not.toThrow();
  });

  // S179/EC1: the note feature vocabularies join the enum parity contract
  // (the plan §2 — the BT1b third-entry-point doctrine: a hand-edited
  // backup must not persist a row the interactive routes would 400 — an
  // out-of-vocabulary color/kind/language breaks the palette map, the
  // kind-split surfaces, and the language badge exactly like an
  // out-of-vocabulary priority breaks the badge meta maps).
  it("rejects an out-of-vocabulary notes.color / notes.kind / notes.language (the S179 vocabulary legs)", () => {
    expect(() =>
      sanitizeImportRow("notes", { id: "n1", title: "T", color: "purple" }, 0),
    ).toThrow(ImportRowError);
    expect(() =>
      sanitizeImportRow("notes", { id: "n1", title: "T", kind: "rich" }, 0),
    ).toThrow(ImportRowError);
    expect(() =>
      sanitizeImportRow("notes", { id: "n1", title: "T", language: "Perl" }, 0),
    ).toThrow(ImportRowError);
  });

  it("accepts the legal S179 vocabulary members and the absent-field legacy rows (the boundary legs)", () => {
    // The legal members (the measured 7-swatch palette + the kind split +
    // the 14-option language vocabulary).
    expect(() =>
      sanitizeImportRow("notes", { id: "n1", title: "T", color: "emerald", kind: "coding", language: "HTML/CSS" }, 0),
    ).not.toThrow();
    // A pre-S179 backup (no feature fields) imports untouched — the enum
    // check skips absent fields and the column defaults apply.
    expect(() =>
      sanitizeImportRow("notes", { id: "n2", title: "Legacy" }, 0),
    ).not.toThrow();
    // A null language is legal (the clear leg — text notes carry null).
    expect(() =>
      sanitizeImportRow("notes", { id: "n3", title: "T", language: null }, 0),
    ).not.toThrow();
  });

  it("rejects a subjects.color that is not a 6-digit hex string", () => {
    expect(() =>
      sanitizeImportRow("subjects", { id: "s1", name: "Math", color: "violet" }, 0),
    ).toThrow(ImportRowError);
    expect(() =>
      sanitizeImportRow("subjects", { id: "s1", name: "Math", color: "#8b5c" }, 0),
    ).toThrow(ImportRowError);
    expect(() =>
      sanitizeImportRow("subjects", { id: "s1", name: "Math", color: "#8b5cf6" }, 0),
    ).not.toThrow();
  });

  it("rejects a bad hex on the events/decks/studyGroups color fields too", () => {
    expect(() =>
      sanitizeImportRow("events", { id: "e1", title: "T", color: "red" }, 0),
    ).toThrow(ImportRowError);
    expect(() =>
      sanitizeImportRow("decks", { id: "d1", name: "D", color: "#12345" }, 0),
    ).toThrow(ImportRowError);
    expect(() =>
      sanitizeImportRow("studyGroups", { id: "g1", name: "G", color: "rainbow" }, 0),
    ).toThrow(ImportRowError);
    expect(() =>
      sanitizeImportRow("decks", { id: "d1", name: "D", color: "#abcdef" }, 0),
    ).not.toThrow();
  });

  it("rejects a calcHistory.expression/result beyond the 500-char atom", () => {
    expect(() =>
      sanitizeImportRow("calcHistory", { id: "h1", expression: "x".repeat(501), result: "2" }, 0),
    ).toThrow(ImportRowError);
    expect(() =>
      sanitizeImportRow("calcHistory", { id: "h1", expression: "1+1", result: "y".repeat(501) }, 0),
    ).toThrow(ImportRowError);
    expect(() =>
      sanitizeImportRow("calcHistory", { id: "h1", expression: "x".repeat(500), result: "y".repeat(500) }, 0),
    ).not.toThrow();
  });

  it("rejects a holidays.name / folders.name / chatMessages.content beyond their atoms", () => {
    expect(() =>
      sanitizeImportRow("holidays", { id: "hol1", name: "h".repeat(201) }, 0),
    ).toThrow(ImportRowError);
    expect(() =>
      sanitizeImportRow("folders", { id: "fo1", name: "f".repeat(201) }, 0),
    ).toThrow(ImportRowError);
    expect(() =>
      sanitizeImportRow("chatMessages", { id: "m1", role: "user", surface: "assistant", content: "c".repeat(100_001) }, 0),
    ).toThrow(ImportRowError);
    expect(() =>
      sanitizeImportRow("folders", { id: "fo1", name: "f".repeat(200) }, 0),
    ).not.toThrow();
  });

  it("rejects a grade score or maxScore above the 1000 ceiling (the atom's own bound)", () => {
    expect(() =>
      sanitizeImportRow("grades", { id: "g1", title: "T", score: 99999, maxScore: 99999 }, 0),
    ).toThrow(ImportRowError);
    expect(() =>
      sanitizeImportRow("grades", { id: "g1", title: "T", score: 100, maxScore: 1001 }, 0),
    ).toThrow(ImportRowError);
    expect(() =>
      sanitizeImportRow("grades", { id: "g1", title: "T", score: 1000, maxScore: 1000 }, 0),
    ).not.toThrow();
  });

  it("rejects a whitespace-only or empty title/name (the trim-before-check mirror of CH8)", () => {
    expect(() =>
      sanitizeImportRow("tasks", { id: "t1", title: "   " }, 0),
    ).toThrow(ImportRowError);
    expect(() =>
      sanitizeImportRow("tasks", { id: "t1", title: "" }, 0),
    ).toThrow(ImportRowError);
    expect(() =>
      sanitizeImportRow("subjects", { id: "s1", name: " " }, 0),
    ).toThrow(ImportRowError);
    expect(() =>
      sanitizeImportRow("folders", { id: "fo1", name: "   " }, 0),
    ).toThrow(ImportRowError);
  });

  it("accepts a padded-but-nonblank title VERBATIM (no silent trim-mutation of the backup rows)", () => {
    const row = sanitizeImportRow("tasks", { id: "t1", title: " padded " }, 0);
    expect(row.title).toBe(" padded ");
  });

  it("rejects a row whose JSON key exceeds the 64-char idField bound", () => {
    const longKey = "k".repeat(65);
    expect(() =>
      sanitizeImportRow("tasks", { id: "t1", title: "T", [longKey]: 1 }, 0),
    ).toThrow(ImportRowError);
    expect(() =>
      sanitizeImportRow("tasks", { id: "t1", title: "T", ["k".repeat(64)]: 1 }, 0),
    ).not.toThrow();
  });
});

// ---------------------------------------------------------------------------
// S133/CH5 — the JSON-column registry corrected (exams.topics unguarded,
// the phantom practiceTests.topics, the missing array-ness).
// ---------------------------------------------------------------------------
describe("S133/CH5 · the JSON-column registry corrected + the array-ness mirrored", () => {
  it("rejects a non-JSON exams.topics string (the real column the registry missed)", () => {
    expect(() =>
      sanitizeImportRow("exams", { id: "x1", title: "T", topics: "not json" }, 0),
    ).toThrow(ImportRowError);
  });

  it("rejects an exams.topics that parses to a non-array (the jsonArray atom's contract)", () => {
    expect(() =>
      sanitizeImportRow("exams", { id: "x1", title: "T", topics: '{"a":1}' }, 0),
    ).toThrow(ImportRowError);
    expect(() =>
      sanitizeImportRow("exams", { id: "x1", title: "T", topics: '["Algebra"]' }, 0),
    ).not.toThrow();
  });

  it("rejects a tasks.subtasks / events.reminders that parses to a non-array", () => {
    expect(() =>
      sanitizeImportRow("tasks", { id: "t1", title: "T", subtasks: "{}" }, 0),
    ).toThrow(ImportRowError);
    expect(() =>
      sanitizeImportRow("events", { id: "e1", title: "T", reminders: '{"a":1}' }, 0),
    ).toThrow(ImportRowError);
    expect(() =>
      sanitizeImportRow("tasks", { id: "t1", title: "T", subtasks: "[]" }, 0),
    ).not.toThrow();
  });

  it("the registry census: the phantom practiceTests.topics is gone, exams.topics present", async () => {
    const { JSON_STRING_FIELDS } = await import("../src/lib/data-import");
    expect(JSON_STRING_FIELDS).toEqual({
      tasks: ["subtasks"],
      practiceTests: ["questions"],
      exams: ["topics"],
      events: ["reminders"],
      notes: ["tags"],
      studyGroups: ["members"],
    });
  });
});

// ---------------------------------------------------------------------------
// S133/CH6 — the 400-body echo bounded: the folder-cycle offender list and
// the ImportRowError field-name interpolation are attacker-controlled
// strings that rode the 400 body verbatim (a 25 MiB cyclic-folder envelope
// amplified into a ~30 MB error body).
// ---------------------------------------------------------------------------
describe("S133/CH6 · the 400-body echo bounded", () => {
  it("a 15-folder cycle lists the first 10 offenders + \"and N more\"", () => {
    const folders = Array.from({ length: 15 }, (_, i) => ({
      id: `cycle-folder-${String(i).padStart(4, "0")}`,
      name: `F${i}`,
      parentId: `cycle-folder-${String((i + 1) % 15).padStart(4, "0")}`,
    }));
    const res = sortFoldersParentsFirst(folders);
    expect(typeof res).toBe("string");
    const message = res as string;
    expect(message).toContain("and 5 more");
    expect(message).not.toContain("cycle-folder-0014, ");
    expect(message.length).toBeLessThan(1_000);
  });

  it("a row error's field-name interpolation caps at 64 chars", () => {
    const longKey = "f".repeat(100);
    let message = "";
    try {
      sanitizeImportRow("tasks", { id: "t1", title: "T", [longKey]: [] }, 0);
    } catch (err: unknown) {
      message = err instanceof Error ? err.message : "";
    }
    expect(message).toContain("f".repeat(64));
    expect(message).not.toContain("f".repeat(65));
  });
});

// ---------------------------------------------------------------------------
// S133/CH4 — the envelope-validator twin closed: the stateless stages move
// into the seam (aligned to the route's SHIPPED contract — the e2e-visible
// behavior wins), and the route consumes validateImportEnvelope so the
// unit pins guard production behavior.
// ---------------------------------------------------------------------------
describe("S133/CH4 · the envelope validator twin closed (the route consumes the seam)", () => {
  it("validateImportEnvelope rejects a non-object input with the route's message", async () => {
    const { validateImportEnvelope } = await import("../src/lib/data-import");
    const res = validateImportEnvelope("not an envelope");
    expect(res.ok).toBe(false);
    if (res.ok) return;
    expect(res.error).toContain("studyflow-data-export envelope");
  });

  it("validateImportEnvelope rejects a missing data object (the drifted tolerance removed)", async () => {
    const { validateImportEnvelope } = await import("../src/lib/data-import");
    const res = validateImportEnvelope({ format: "studyflow-data-export", version: 1 });
    expect(res.ok).toBe(false);
    if (res.ok) return;
    expect(res.error).toContain("no data object");
  });

  it("validateImportEnvelope folds a non-integer version into the newer-version 400 (the route's folding)", async () => {
    const { validateImportEnvelope } = await import("../src/lib/data-import");
    const res = validateImportEnvelope({
      format: "studyflow-data-export",
      version: "one",
      data: {},
    });
    expect(res.ok).toBe(false);
    if (res.ok) return;
    expect(res.error).toContain("newer version");
  });

  it("validateImportEnvelope accepts a valid envelope and returns the data block", async () => {
    const { validateImportEnvelope } = await import("../src/lib/data-import");
    const res = validateImportEnvelope(validEnvelope());
    expect(res.ok).toBe(true);
    if (!res.ok) return;
    expect(res.data.subjects).toHaveLength(1);
  });

  it("parseImportEnvelope folds a non-integer version into the newer-version 400 too (the twin reconciled)", () => {
    const res = parseImportEnvelope({
      format: "studyflow-data-export",
      version: "one",
      data: {},
    });
    expect(res.ok).toBe(false);
    if (res.ok) return;
    expect(res.error).toContain("newer version");
  });
});

// ---------------------------------------------------------------------------
// S135/CJ4 (audit A-L2) — the required-FK null/non-string rejection. The
// seam's FK loop early-continued on undefined/null BEFORE the spec.required
// rejection, and the route's twin guard skipped non-strings — a cards row
// with deckId null (or a number) sailed both layers and died as
// PrismaClientValidationError → the GENERIC "fields do not match" 400. The
// ADR-021 actionable-message contract degrades silently for that one
// hand-crafted shape. The seam now rejects it with the named-field message;
// undefined (absent) stays seam-legal — the UPDATE branch's untouched case
// (the route owns the create-branch rejection via its knownIds census).
// ---------------------------------------------------------------------------
describe("S135/CJ4 · the required-FK null and non-string rejection", () => {
  const cardsEnvelope = (deckId: unknown): Record<string, unknown> => ({
    format: "studyflow-data-export",
    version: 1,
    exportedAt: "2026-11-01T00:00:00.000Z",
    user: { id: "u-cj4", email: "cj4@account.dev", name: "CJ4" },
    counts: { decks: 1, cards: 1 },
    data: {
      decks: [{ id: "d1", name: "Deck", createdAt: "2026-10-01T00:00:00.000Z" }],
      cards: [
        {
          id: "c1",
          deckId,
          front: "front",
          back: "back",
          createdAt: "2026-10-01T00:00:00.000Z",
        },
      ],
    },
  });

  it("rejects a cards row with deckId null — the actionable message, not the generic Prisma fallback (RED pre-fix: ok)", async () => {
    const { validateImportEnvelope } = await import("../src/lib/data-import");
    const res = validateImportEnvelope(cardsEnvelope(null));
    expect(res.ok).toBe(false);
    if (res.ok) return;
    expect(res.error).toContain("cards");
    expect(res.error).toContain("deckId");
    expect(res.error).toContain("c1");
  });

  it("rejects a cards row with a non-string deckId (a number sails both guards pre-fix)", async () => {
    const { validateImportEnvelope } = await import("../src/lib/data-import");
    const res = validateImportEnvelope(cardsEnvelope(42));
    expect(res.ok).toBe(false);
    if (res.ok) return;
    expect(res.error).toContain("deckId");
  });

  it("still ACCEPTS an absent deckId at the seam — the update branch's untouched case (the route owns create-branch rejection)", async () => {
    const { validateImportEnvelope } = await import("../src/lib/data-import");
    const res = validateImportEnvelope(cardsEnvelope(undefined));
    expect(res.ok).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// S135/CJ2 (audit A-M1) — the import order joins the seam. IMPORT_ORDER was
// route-local (import/data/route.ts): dropping a collection from it
// compiled clean and the route silently ignored that family's rows — the
// exact drift class the manifest byte-pin guards on the seam side but
// nothing guarded on the route side. The order is seam knowledge (the
// parents-first topological order); it moves beside IMPORT_FK_MAP and the
// manifest-consistency census extends to set-equality.
// ---------------------------------------------------------------------------
describe("S135/CJ2 · IMPORT_ORDER rides the seam and covers the manifest", () => {
  it("is exported from src/lib/data-import (RED pre-fix: the route-local const is invisible here)", async () => {
    const mod = await import("../src/lib/data-import");
    expect(Array.isArray(mod.IMPORT_ORDER)).toBe(true);
  });

  it("covers EXACTLY the export manifest — a dropped or added collection fails both directions", async () => {
    const { IMPORT_ORDER } = await import("../src/lib/data-import");
    expect([...IMPORT_ORDER].sort()).toEqual([...EXPORT_COLLECTIONS].sort());
  });

  it("imports folders before files and decks before cards (the parents-first shape survives the move)", async () => {
    const { IMPORT_ORDER } = await import("../src/lib/data-import");
    const order = [...IMPORT_ORDER];
    expect(order.indexOf("folders")).toBeLessThan(order.indexOf("files"));
    expect(order.indexOf("decks")).toBeLessThan(order.indexOf("cards"));
    expect(order.indexOf("subjects")).toBeLessThan(order.indexOf("tasks"));
  });
});

// ---------------------------------------------------------------------------
// S135/CJ5 (audit A-L5) — the colon-safe 409 race-message parse. The route's
// handler destructured `err.message.split(":")` as [, collection, id] — an
// id containing ":" (legal to 64 arbitrary chars) truncated at the first
// colon. The parse moves to a pure seam helper: everything after the SECOND
// colon is the id.
// ---------------------------------------------------------------------------
describe("S135/CJ5 · parseImportRaceMessage (the colon-safe 409 assembly)", () => {
  it("is exported from the seam (S136/CK6 retitle — the split semantics live in the two sibling legs below)", async () => {
    const mod = await import("../src/lib/data-import");
    expect(typeof mod.parseImportRaceMessage).toBe("function");
  });

  it("an id containing colons survives the parse intact (RED pre-fix: not a function)", async () => {
    const { parseImportRaceMessage } = await import("../src/lib/data-import");
    const parsed = parseImportRaceMessage("import-p2002:cards:weird:id:with:colons");
    expect(parsed).toEqual({ collection: "cards", id: "weird:id:with:colons" });
  });

  it("the plain shapes parse as before", async () => {
    const { parseImportRaceMessage } = await import("../src/lib/data-import");
    expect(parseImportRaceMessage("import-p2002:tasks:t-123")).toEqual({
      collection: "tasks",
      id: "t-123",
    });
  });
});

// ---------------------------------------------------------------------------
// S141/CP3 — the restore-availability pre-flight helpers (the A-M3 +
// A-I1 family). The S140 route scanned ALL 20 collections with full-table
// findMany calls (O(account) per import — pure waste for absent
// collections) and then ran 2 queries/row INSIDE one 60 s interactive
// transaction (the SQLite RESERVED lock held sitewide). The S141
// restructure probes ONLY the collections the envelope touches (plus
// their FK targets — a cards-only envelope still needs decks knownIds)
// with IN-lists at O(envelope) cost, and hoists every read + all CPU out
// of the transaction. These pins own the pure derivation + chunk math.
// ---------------------------------------------------------------------------
describe("S141/CP3 · importProbeTargets (the FK-aware probe-set derivation)", () => {
  it("is exported from the seam", async () => {
    const mod = await import("../src/lib/data-import");
    expect(typeof mod.importProbeTargets).toBe("function");
  });

  it("a cards-only envelope probes cards AND decks (the required-FK target — nothing else)", async () => {
    const { importProbeTargets } = await import("../src/lib/data-import");
    expect(importProbeTargets(["cards"])).toEqual(["decks", "cards"]);
  });

  it("a tasks-only envelope probes tasks + its FK targets (taskLists, subjects) — nothing else", async () => {
    const { importProbeTargets } = await import("../src/lib/data-import");
    expect(importProbeTargets(["tasks"])).toEqual(["subjects", "taskLists", "tasks"]);
  });

  it("a folders-only envelope probes folders (the self-FK rides the derivation)", async () => {
    const { importProbeTargets } = await import("../src/lib/data-import");
    expect(importProbeTargets(["folders"])).toEqual(["folders"]);
  });

  it("a subjects+files envelope probes subjects, files, AND folders (files' FK target)", async () => {
    const { importProbeTargets } = await import("../src/lib/data-import");
    expect(importProbeTargets(["subjects", "files"])).toEqual([
      "subjects",
      "folders",
      "files",
    ]);
  });

  it("the probe set stays in IMPORT_ORDER (referents before referees)", async () => {
    const { importProbeTargets, IMPORT_ORDER } = await import("../src/lib/data-import");
    const probed = importProbeTargets(["files", "cards", "tasks"]);
    const order = [...IMPORT_ORDER];
    let last = -1;
    for (const c of probed) {
      const idx = order.indexOf(c);
      expect(idx).toBeGreaterThan(last);
      last = idx;
    }
  });
});

describe("S141/CP3 · the probe/write chunk constants + chunkImportIds", () => {
  it("the constants hold the verified values (SQLite 3.46: IN verified at 20 000; createMany verified at 1 000 rows)", async () => {
    const mod = await import("../src/lib/data-import");
    expect(mod.IMPORT_PROBE_CHUNK).toBe(5_000);
    expect(mod.IMPORT_CREATE_CHUNK).toBe(500);
  });

  it("chunkImportIds splits at the probe size and preserves order", async () => {
    const { chunkImportIds, IMPORT_PROBE_CHUNK } = await import("../src/lib/data-import");
    const ids = Array.from({ length: IMPORT_PROBE_CHUNK * 2 + 7 }, (_, i) => `id-${i}`);
    const chunks = chunkImportIds(ids);
    expect(chunks.length).toBe(3);
    expect(chunks[0].length).toBe(IMPORT_PROBE_CHUNK);
    expect(chunks[2].length).toBe(7);
    expect(chunks.flat()).toEqual(ids);
    // The empty case: zero chunks, not one empty chunk.
    expect(chunkImportIds([])).toEqual([]);
  });
});

// S143/CR6 (audit A-M1): the import catch's named-409/413 legs (P2025,
// P2028) and the BT1b PrismaClientValidationError→400 leg were pinned
// only by source-text censuses — a catch-leg reordering that shadows
// P2025 (or a copy change) passed green. The mapping extracts to the
// PURE importRestoreError seam (the route file cannot export shared
// symbols — Next's route-type validation — so it lives here); these
// legs pin every branch behaviorally.
describe("S143/CR6 · importRestoreError (the catch's error→response mapping, behavioral)", () => {
  const p2028 = Object.assign(new Error("A transaction failed..."), {
    code: "P2028",
  });
  const p2025 = Object.assign(new Error("An operation failed..."), {
    code: "P2025",
  });
  const prismaValidation = Object.assign(
    new Error("Unknown argument `wibble`"),
    { name: "PrismaClientValidationError" },
  );

  it("maps P2025 to the named 409 (the deleted-while-import-ran family — pre-seam: census-only)", () => {
    const out = importRestoreError(p2025);
    if (out === null) throw new Error("P2025 must map to the named 409 leg (got the null delegation)");
    expect(out.status).toBe(409);
    expect(out.message).toContain("deleted while this import ran");
    expect(out.message).toContain("fully rolled back");
  });

  it("maps P2028 to the named 413 (the too-large-or-slow family)", () => {
    const out = importRestoreError(p2028);
    if (out === null) throw new Error("P2028 must map to the named 413 leg (got the null delegation)");
    expect(out.status).toBe(413);
    expect(out.message).toContain("fully rolled back");
    expect(out.message).toContain("split the backup");
  });

  it("maps PrismaClientValidationError to 400 (the BT1b leg, now shared)", () => {
    const out = importRestoreError(prismaValidation);
    if (out === null) throw new Error("PrismaClientValidationError must map to the 400 leg (got the null delegation)");
    expect(out.status).toBe(400);
  });

  it("delegates the shared-mapper families (ValidationError → null: toErrorResponse owns them, pinned in http-body)", () => {
    const out = importRestoreError(new (ValidationErrorCtor())("bad body"));
    expect(out).toBeNull();
  });

  it("delegates an unknown error (null — the route falls through to toErrorResponse's 500, never a silent family)", () => {
    expect(importRestoreError(new Error("boom"))).toBeNull();
  });

  it("a P2025-shaped racing error (ImportConcurrentCreateError name) stays 409-family copy-stable", () => {
    const race = new Error("import-p2002:cards:bulk");
    race.name = "ImportConcurrentCreateError";
    const out = importRestoreError(race);
    if (out === null) throw new Error("the racing error must map to the 409 leg (got the null delegation)");
    expect(out.status).toBe(409);
    expect(out.message).toContain("collides with an existing record");
  });
});

// ---------------------------------------------------------------------------
// S154/DC2 (audit B L1) · the practiceTests questions item-shape mirror —
// the members precedent's missed twin. The interactive atom refines EVERY
// item (object + question string + the three-member type vocabulary,
// validation.ts practiceTestSchema); the import's JSON_STRING_FIELDS pass
// checked string-ness + parse + array-ness only, so '["garbage"]' persisted
// a practiceTests row every interactive route would 400 (the CB11/CA14
// parity contract). studyGroups.members got its item-shape mirror at
// S139/CN1; questions waited 15 cycles.
// ---------------------------------------------------------------------------
describe("S154/DC2 · the practiceTests questions item-shape mirror (the members twin)", () => {
  it("rejects a questions item with a bad shape (a non-object item; a wrong type vocabulary) — the valid shapes pass", () => {
    expect(() =>
      sanitizeImportRow("practiceTests", { id: "pt1", questions: JSON.stringify(["garbage"]) }, 0),
    ).toThrow(/questions/);
    expect(() =>
      sanitizeImportRow("practiceTests", { id: "pt1", questions: JSON.stringify([{ question: "Q", type: "essay" }]) }, 0),
    ).toThrow(/questions/);
    expect(() =>
      sanitizeImportRow("practiceTests", { id: "pt1", questions: JSON.stringify([{ question: "Q" }]) }, 0),
    ).toThrow(/questions/);
    expect(() =>
      sanitizeImportRow(
        "practiceTests",
        {
          id: "pt1",
          questions: JSON.stringify([
            { question: "Solve for x.", type: "multiple_choice" },
            { question: "The sky is blue.", type: "true_false" },
            { question: "Name the theorem.", type: "short_answer" },
          ]),
        },
        0,
      ),
    ).not.toThrow();
  });
});

// ---------------------------------------------------------------------------
// S154/DC1 (audit B B-L2's contract-preserving answer) · the no-op update
// elision diff — plannedUpdateIsNoOp. The S141 condition ("stage-2 if
// measurement shows a residual window") answered by probe: the sequential
// update loop measures 0.32 ms/row (32 s at the 100k cap — 1.9× headroom
// inside the 60 s timeout), so the chunked sub-tx stays deferred ON
// MEASUREMENT and the cycle ships the elision: the pre-tx pass reads the
// full stored rows for the update-branch ids and drops every write whose
// planned payload already holds — the dominant heavy case (the idempotent
// re-import over a mostly-unchanged account) collapses from N lock-held
// writes to ~0 at read-cost. The diff is CONSERVATIVE: any doubt keeps the
// write (the write is today's behavior, the skip is the optimization).
// ---------------------------------------------------------------------------
describe("S154/DC1 · the no-op update elision diff (plannedUpdateIsNoOp)", () => {
  it("an identical row is a no-op (DateTime columns as ISO strings against stored Dates, nulls, primitives — the re-import shape)", async () => {
    const { plannedUpdateIsNoOp } = await import("../src/lib/data-import");
    const stored = {
      title: "Chapter 4 review",
      notes: "redo the odd problems",
      completed: false,
      important: true,
      dueDate: new Date("2026-03-04T05:06:07.000Z"),
      createdAt: new Date("2026-01-02T03:04:05.000Z"),
      updatedAt: new Date("2026-01-02T03:04:05.000Z"),
      listId: null,
      subjectId: "subj-1",
      userId: "u1",
      subtasks: '[{"id":"st-1","title":"a","done":false}]',
      priority: "medium",
      repeat: "none",
      myDay: false,
    };
    const planned = {
      title: "Chapter 4 review",
      notes: "redo the odd problems",
      completed: false,
      important: true,
      dueDate: "2026-03-04T05:06:07.000Z",
      createdAt: "2026-01-02T03:04:05.000Z",
      updatedAt: "2026-01-02T03:04:05.000Z",
      listId: null,
      subjectId: "subj-1",
      userId: "u1",
      subtasks: '[{"id":"st-1","title":"a","done":false}]',
      priority: "medium",
      repeat: "none",
      myDay: false,
    };
    expect(plannedUpdateIsNoOp(stored, planned)).toBe(true);
  });

  it("a changed value is never a no-op (a string field; a date field moved; a number; a boolean)", async () => {
    const { plannedUpdateIsNoOp } = await import("../src/lib/data-import");
    const stored = {
      title: "T",
      score: 89.5,
      completed: false,
      updatedAt: new Date("2026-01-02T03:04:05.000Z"),
    };
    expect(plannedUpdateIsNoOp(stored, { ...stored, updatedAt: "2026-01-02T03:04:05.001Z", title: "T", score: 89.5, completed: false })).toBe(false);
    expect(plannedUpdateIsNoOp(stored, { title: "T2", score: 89.5, completed: false, updatedAt: "2026-01-02T03:04:05.000Z" })).toBe(false);
    expect(plannedUpdateIsNoOp(stored, { title: "T", score: 90, completed: false, updatedAt: "2026-01-02T03:04:05.000Z" })).toBe(false);
    expect(plannedUpdateIsNoOp(stored, { title: "T", score: 89.5, completed: true, updatedAt: "2026-01-02T03:04:05.000Z" })).toBe(false);
  });

  it("every doubt keeps the write (a key missing from the stored row; a typeof mismatch; null vs value; an unparseable date; an object value)", async () => {
    const { plannedUpdateIsNoOp } = await import("../src/lib/data-import");
    // A key the stored row does not carry — cannot prove equality.
    expect(plannedUpdateIsNoOp({ title: "T" }, { title: "T", room: "201" })).toBe(false);
    // A typeof mismatch (the write would 400 at Prisma — today's behavior).
    expect(plannedUpdateIsNoOp({ score: 89.5 }, { score: "89.5" })).toBe(false);
    // null vs a value (either direction writes).
    expect(plannedUpdateIsNoOp({ listId: null }, { listId: "l1" })).toBe(false);
    expect(plannedUpdateIsNoOp({ listId: "l1" }, { listId: null })).toBe(false);
    // null vs null is equal (no write needed).
    expect(plannedUpdateIsNoOp({ listId: null }, { listId: null })).toBe(true);
    // A stored Date against a non-string planned value.
    expect(plannedUpdateIsNoOp({ dueDate: new Date("2026-01-02T03:04:05.000Z") }, { dueDate: 1767337445000 })).toBe(false);
    // An unparseable date string (conservative: keep the write; Prisma answers).
    expect(plannedUpdateIsNoOp({ dueDate: new Date("2026-01-02T03:04:05.000Z") }, { dueDate: "not-a-date" })).toBe(false);
    // An object value (the schema carries no Json columns — any object is a doubt).
    expect(plannedUpdateIsNoOp({ meta: {} }, { meta: { a: 1 } })).toBe(false);
    // An undefined planned value rides Prisma's skip semantics (never part of the write).
    expect(plannedUpdateIsNoOp({ title: "T", x: 1 }, { title: "T", x: undefined })).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// S159/DH1 (audit B/L-1) — the optional-FK non-string rejection. The CJ4
// mirror at the OPTIONAL boundary: the seam's reference parser String()-
// coerced a non-string optional FK into the SetNull branch (data-import.ts's
// nulling loop) while the production route's twin guard SKIPPED it
// (`typeof value !== "string" → continue`) and the raw number rode to
// Prisma → PrismaClientValidationError → the GENERIC "fields do not match"
// 400. A hand-crafted `subjectId: 42` imported CLEAN through the unit-pinned
// parser and 400'd generically through production — the pins described
// unreachable production behavior (the CH4 doctrine). The seam now rejects
// the shape at validateImportEnvelope (the route consumes its error
// verbatim); null stays legal (the SetNull semantics); undefined stays
// legal (the update branch's untouched case).
// ---------------------------------------------------------------------------
describe("S159/DH1 · the optional-FK non-string rejection (the CJ4 mirror)", () => {
  const tasksEnvelope = (subjectId: unknown): Record<string, unknown> => ({
    format: "studyflow-data-export",
    version: 1,
    exportedAt: "2026-11-07T00:00:00.000Z",
    user: { id: "u-dh1", email: "dh1@account.dev", name: "DH1" },
    counts: { tasks: 1 },
    data: {
      tasks: [
        {
          id: "t-dh1",
          title: "Task",
          subjectId,
          createdAt: "2026-10-01T00:00:00.000Z",
        },
      ],
    },
  });

  it("rejects a tasks row with a NUMBER subjectId — the named message, not the generic Prisma fallback (RED pre-fix: ok:true)", async () => {
    const { validateImportEnvelope } = await import("../src/lib/data-import");
    const res = validateImportEnvelope(tasksEnvelope(42));
    expect(res.ok).toBe(false);
    if (res.ok) return;
    expect(res.error).toContain("tasks");
    expect(res.error).toContain("subjectId");
    expect(res.error).toContain("t-dh1");
    expect(res.error).toContain("not a string id");
  });

  it("rejects the non-string non-null shape family (a boolean and an object subjectId — every non-string rides the same door)", async () => {
    const { validateImportEnvelope } = await import("../src/lib/data-import");
    for (const bad of [true, { id: "s1" }]) {
      const res = validateImportEnvelope(tasksEnvelope(bad));
      expect(res.ok).toBe(false);
      if (res.ok) continue;
      expect(res.error).toContain("subjectId");
    }
  });

  it("still ACCEPTS a null subjectId — the SetNull semantics preserved (the dangling-optional nulling path untouched)", async () => {
    const { validateImportEnvelope } = await import("../src/lib/data-import");
    expect(validateImportEnvelope(tasksEnvelope(null)).ok).toBe(true);
  });

  it("still ACCEPTS an absent subjectId — the update branch's untouched case", async () => {
    const { validateImportEnvelope } = await import("../src/lib/data-import");
    expect(validateImportEnvelope(tasksEnvelope(undefined)).ok).toBe(true);
  });

  it("parseImportEnvelope rejects the same shape — the reference parser can no longer describe the unreachable nulling (the delegation leg)", async () => {
    const res = parseImportEnvelope(tasksEnvelope(42));
    expect(res.ok).toBe(false);
    if (res.ok) return;
    expect(res.error).toContain("subjectId");
  });
});

// ---------------------------------------------------------------------------
// S159/DH2 (audit B/L-2) — the import↔interactive length-cap VALUE parity
// census. The key-set parity was machine-pinned (S133/CH1/CH2) but the atom
// VALUES were hand-mirrored: IMPORT_FIELD_LENGTHS copies the inline Zod
// literals (boundedTitle 200, notes 5000, description 1000/5000, front/back
// 2000, tags 2000, room 100, the JSON-blob 100k atoms, calc 500, chat
// 100k, mime 100) that live in validation.ts, the folders route, ai.ts,
// and http.ts. A future relaxation in ANY source silently made the import
// STRICTER than the app — one row the app itself minted then bricked the
// ENTIRE all-or-nothing restore with a message blaming the user's backup
// (the S137/CL1 lesson class). This census makes the mirror self-guarding
// the script-conventions way: read the source, extract the atom, assert
// the registry agrees. The parser FAILS LOUDLY when it cannot extract (a
// renamed schema/atom/field is a parity question, never a silent pass).
// ---------------------------------------------------------------------------
describe("S159/DH2 · the length-cap VALUE parity census (the mirror made self-guarding)", () => {
  const VALIDATION_TS = path.resolve(process.cwd(), "src/lib/validation.ts");
  const validationSource = readFileSync(VALIDATION_TS, "utf8");

  const num = (s: string) => Number(s.replace(/_/g, ""));
  // A function DECLARATION with the explicit never return type — the only
  // form TS's control-flow analysis accepts for never-call narrowing (a
  // const-inferred arrow leaves every `if (!m) die(...)` site un-narrowed).
  function die(what: string): never {
    throw new Error(`the DH2 census could not extract ${what} — the parity source moved; re-anchor the census`);
  }

  // The shared atoms (boundedTitle / jsonArray) — extracted once.
  function atomMax(atom: string): number {
    const m = validationSource.match(new RegExp(`const ${atom} = [^;]*?\\.max\\((\\d[\\d_]*)\\)`, "s"));
    if (!m) die(`the ${atom} atom's .max() from validation.ts`);
    return num(m[1]);
  }

  // A schema's z.object({...}) block — brace-counted (practiceTestSchema's
  // questions refine carries nested braces; a first-`});` scan would
  // truncate the block and silently miss later fields).
  function schemaBlock(schema: string): string {
    const head = validationSource.match(new RegExp(`export const ${schema} = z\\.object\\(`));
    if (!head || head.index === undefined) die(`the ${schema} block head from validation.ts`);
    const open = validationSource.indexOf("{", head.index);
    let depth = 0;
    for (let i = open; i < validationSource.length; i++) {
      if (validationSource[i] === "{") depth += 1;
      else if (validationSource[i] === "}") {
        depth -= 1;
        if (depth === 0) return validationSource.slice(open, i + 1);
      }
    }
    return die(`the ${schema} block's balanced close from validation.ts`);
  }

  // The first .max() on a field's chain is the string-length atom the
  // registry mirrors (every mapped field is a string field with exactly
  // one length bound; numeric caps like progress/duration are unmapped).
  // The chain may span MULTIPLE lines (practiceTestSchema.questions
  // breaks its .string()/.max()/.refine() across lines with comments) —
  // capture from the field name until the NEXT 2-space field line.
  function resolveCap(schema: string, field: string): number {
    const block = schemaBlock(schema);
    const start = block.match(new RegExp(`^ {2}${field}:\\s*`, "m"));
    if (!start || start.index === undefined) die(`the ${schema}.${field} field line from validation.ts`);
    const rest = block.slice(start.index + start[0].length);
    const nextField = rest.match(/^ {2}[A-Za-z]/m);
    const chain = nextField && nextField.index !== undefined ? rest.slice(0, nextField.index) : rest;
    if (/\bboundedTitle\b/.test(chain)) return atomMax("boundedTitle");
    if (/\bjsonArray\b/.test(chain)) return atomMax("jsonArray");
    const cap = chain.match(/\.max\((\d[\d_]*)\)/);
    if (!cap) die(`the ${schema}.${field} .max() literal from validation.ts`);
    return num(cap[1]);
  }

  // The 31 validation.ts-sourced atoms (schema, field) per registry key.
  const VALIDATION_TS_MAP: Record<string, [string, string]> = {
    "subjects.name": ["subjectSchema", "name"],
    "taskLists.name": ["taskListSchema", "name"],
    "tasks.title": ["taskSchema", "title"],
    "tasks.notes": ["taskSchema", "notes"],
    "tasks.subtasks": ["taskSchema", "subtasks"],
    "assignments.title": ["assignmentSchema", "title"],
    "assignments.description": ["assignmentSchema", "description"],
    "exams.title": ["examSchema", "title"],
    "exams.location": ["examSchema", "location"],
    "exams.topics": ["examSchema", "topics"],
    "events.title": ["eventSchema", "title"],
    "events.location": ["eventSchema", "location"],
    "events.description": ["eventSchema", "description"],
    "events.reminders": ["eventSchema", "reminders"],
    "timetableClasses.name": ["timetableClassSchema", "name"],
    "timetableClasses.room": ["timetableClassSchema", "room"],
    "notebooks.name": ["notebookSchema", "name"],
    "notes.title": ["noteSchema", "title"],
    "notes.content": ["noteSchema", "content"],
    "notes.tags": ["noteSchema", "tags"],
    "decks.name": ["flashcardDeckSchema", "name"],
    "decks.description": ["flashcardDeckSchema", "description"],
    "cards.front": ["flashcardSchema", "front"],
    "cards.back": ["flashcardSchema", "back"],
    "practiceTests.title": ["practiceTestSchema", "title"],
    "practiceTests.questions": ["practiceTestSchema", "questions"],
    "studyGroups.name": ["studyGroupSchema", "name"],
    "studyGroups.description": ["studyGroupSchema", "description"],
    "grades.title": ["gradeSchema", "title"],
    "holidays.name": ["holidaySchema", "name"],
    "calcHistory.expression": ["calculatorHistorySchema", "expression"],
    "calcHistory.result": ["calculatorHistorySchema", "result"],
  };

  // The 3 atoms whose interactive twin lives OUTSIDE validation.ts (a
  // route-local schema, a server-side persist cap, an upload-door cap).
  const OTHER_SOURCE_MAP: Array<{ key: string; file: string; re: RegExp }> = [
    { key: "folders.name", file: "src/app/api/files/folders/route.ts", re: /name:\s*z\.string\(\)\.trim\(\)\.min\(1\)\.max\((\d[\d_]*)\)/ },
    { key: "chatMessages.content", file: "src/lib/server/ai.ts", re: /PERSISTED_CONTENT_MAX = (\d[\d_]*)/ },
    { key: "files.mime", file: "src/lib/server/http.ts", re: /UPLOAD_MIME_MAX_CHARS = (\d[\d_]*)/ },
  ];

  it("the census maps cover the registry EXACTLY — a new registry key without a parity source fails loudly, and a map entry without its registry key fails too", async () => {
    const { IMPORT_FIELD_LENGTHS } = await import("../src/lib/data-import");
    const registryKeys = new Set(Object.keys(IMPORT_FIELD_LENGTHS));
    const mappedKeys = new Set([...Object.keys(VALIDATION_TS_MAP), ...OTHER_SOURCE_MAP.map((s) => s.key)]);
    // every registry key is mapped (a dropped mapping = the 1 M default drift class)
    for (const key of registryKeys) expect(mappedKeys.has(key), `unmapped registry key: ${key}`).toBe(true);
    // every map entry exists in the registry (a stale map entry = a lie)
    for (const key of mappedKeys) expect(registryKeys.has(key), `stale map entry: ${key}`).toBe(true);
    // the maps are disjoint (a double-mapped key is an ambiguity)
    for (const source of OTHER_SOURCE_MAP) {
      expect(VALIDATION_TS_MAP[source.key], `double-mapped key: ${source.key}`).toBeUndefined();
    }
  });

  it("every validation.ts-sourced registry value equals its extracted schema atom (the future relaxation trips THIS leg)", async () => {
    const { IMPORT_FIELD_LENGTHS } = await import("../src/lib/data-import");
    for (const [key, [schema, field]] of Object.entries(VALIDATION_TS_MAP)) {
      const source = resolveCap(schema, field);
      expect(source, `${key}: the census extracted ${source}, the registry says ${IMPORT_FIELD_LENGTHS[key]}`).toBe(IMPORT_FIELD_LENGTHS[key]);
    }
  });

  it("the three non-validation.ts atoms equal their own sources (the folders route atom, the persist cap, the upload mime cap)", async () => {
    const { IMPORT_FIELD_LENGTHS } = await import("../src/lib/data-import");
    for (const { key, file, re } of OTHER_SOURCE_MAP) {
      const src = readFileSync(path.resolve(process.cwd(), file), "utf8");
      const m = src.match(re);
      if (!m) die(`the ${key} atom from ${file}`);
      expect(num(m[1]), `${key}: the census extracted ${m[1]}, the registry says ${IMPORT_FIELD_LENGTHS[key]}`).toBe(IMPORT_FIELD_LENGTHS[key]);
    }
  });
});

import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

// S128/CC10 — the factory-list index census (the s128 test-layer audit's
// L-tier, promoted: the win is MEASURED, not assumed).
//
// Every collection GET runs `where {userId}, orderBy [createdAt desc,
// id desc], take: 500` (the CA5 newest-window form). Backed by the bare
// @@index([userId]) alone, SQLite resolves the WHERE through the index but
// must fetch and temp-b-tree-sort EVERY owned row before the LIMIT —
// measured at 100k rows (the import envelope's documented mint volume):
// 34.6 ms median per GET, vs 0.27 ms under the composite
// [userId, createdAt, id] (128x; the composite covers the full ORDER BY,
// and its leftmost column keeps every existing userId-prefixed lookup
// backed — a REPLACE, not an addition, so the per-table index count and
// write amplification class are unchanged).
//
// This census is the guard: the 19 factory-listed models carry the
// composite; PasswordResetToken (lookup-by-token, never listed) keeps the
// bare index; Flashcard (deck-scoped, no userId column) and RumEvent (the
// CA19 deliberate removal — the upsert-hot table) are out of scope by
// design.
const SCHEMA = readFileSync(
  path.resolve(process.cwd(), "prisma", "schema.prisma"),
  "utf8",
);

const FACTORY_LISTED_MODELS = [
  "TaskList",
  "Subject",
  "Task",
  "Assignment",
  "Exam",
  "Event",
  "TimetableClass",
  "Notebook",
  "Note",
  "FlashcardDeck",
  "PracticeTest",
  "StudyGroup",
  "Grade",
  "FocusSession",
  "FileFolder",
  "FileItem",
  "AiChatMessage",
  "CalculatorHistoryEntry",
  "Holiday",
] as const;

function modelBody(name: string): string {
  const start = SCHEMA.indexOf(`model ${name} {`);
  expect(start, `model ${name} exists in schema.prisma`).toBeGreaterThan(-1);
  const end = SCHEMA.indexOf("\n}", start);
  return SCHEMA.slice(start, end);
}

// S133/CH3: every model in the schema, derived from the text itself — a
// new model joins the FK-column census automatically (no hand-maintained
// list to drift; the FACTORY_LISTED_MODELS lesson).
const ALL_MODELS = [...SCHEMA.matchAll(/^model ([A-Za-z0-9_]+) \{/gm)].map(
  (m) => m[1],
);

describe("the factory-list index census (S128/CC10)", () => {
  it("censused the factory-listed family — 19 models, all present in the schema", () => {
    expect(FACTORY_LISTED_MODELS.length).toBe(19);
  });

  it("every factory-listed model carries the [userId, createdAt, id] composite", () => {
    const missing: string[] = [];
    for (const model of FACTORY_LISTED_MODELS) {
      const body = modelBody(model);
      if (!body.includes("@@index([userId, createdAt, id])")) missing.push(model);
    }
    expect(
      missing,
      `models missing the composite index (the 100k-row list GET sorts every owned row without it): ${missing.join(", ")}`,
    ).toEqual([]);
  });

  it("no factory-listed model still carries the bare [userId] index (the composite REPLACED it)", () => {
    const stale: string[] = [];
    for (const model of FACTORY_LISTED_MODELS) {
      const body = modelBody(model);
      if (/@@index\(\[userId\]\)/.test(body)) stale.push(model);
    }
    expect(stale, `models still carrying the redundant bare index: ${stale.join(", ")}`).toEqual([]);
  });

  it("PasswordResetToken keeps the bare index (lookup-by-token table — never factory-listed)", () => {
    const body = modelBody("PasswordResetToken");
    expect(body).toContain("@@index([userId])");
    expect(body).not.toContain("@@index([userId, createdAt, id])");
  });

  // S130/CE9 — the parentId index (the only FK column whose parent-DELETE
  // SetNull scan had no covering index; every sibling FK — Task.listId,
  // Note.notebookId, FileItem.folderId, Flashcard.deckId — carries one).
  it("FileFolder carries the [parentId] index (the sibling-FK convention)", () => {
    const body = modelBody("FileFolder");
    expect(body).toContain("@@index([parentId])");
  });

  // S133/CH3 — the FK-column index census (the CE9 "every sibling FK
  // carries one" claim, machine-checked for EVERY relation column in the
  // schema instead of hand-asserted). A parent-DELETE SetNull/Cascade scan
  // is `UPDATE ... SET fk = NULL WHERE fk = ?` — backed only by an index
  // whose LEFTMOST column is the FK. The ten subjectId columns shipped
  // unindexed (the CE9 class 10x wider): every Subject DELETE ran ten
  // full-table scans. userId rides the composites (leftmost) everywhere
  // except RumEvent, whose user-scoped @@unique([userId, sessionId,
  // metric]) serves the same leftmost-prefix scans (the CA19 removal's own
  // documented rationale).
  it("every FK relation column is the leftmost column of an index or unique (the SetNull/Cascade scan family)", () => {
    // Comment lines are stripped first — the schema carries documented
    // REMOVED-index comments (the CA19 RumEvent note) that would otherwise
    // satisfy the census as phantom coverage.
    const FK_FIELD_RE = /@relation\((?:[^)]*?\s)?fields:\s*\[([A-Za-z0-9_]+)\]/g;
    const FIRST_COL_RE = /@@(?:index|unique)\(\[([A-Za-z0-9_]+)/g;
    const missing: string[] = [];

    for (const model of ALL_MODELS) {
      const body = modelBody(model)
        .split("\n")
        .filter((line) => !line.trimStart().startsWith("//"))
        .join("\n");
      const firstColumns = new Set<string>();
      for (const m of body.matchAll(FIRST_COL_RE)) firstColumns.add(m[1]);
      for (const m of body.matchAll(FK_FIELD_RE)) {
        if (!firstColumns.has(m[1])) missing.push(`${model}.${m[1]}`);
      }
    }
    expect(
      missing,
      `FK columns with no leftmost index coverage (every parent-DELETE SetNull/Cascade scan on these is a full-table scan): ${missing.join(", ")}`,
    ).toEqual([]);
  });

  // S139/CN3 (audit B-M1) — the CL3 cards window's ORDER BY covering
  // index. The cards list runs `orderBy [{createdAt desc}, {id desc}]
  // take 5000` through the `deck: { userId }` JOIN; with only the bare
  // [deckId] index, SQLite temp-b-tree-sorts EVERY owned card on every
  // cards GET (the class CC10 measured at 34.6 ms/100k and closed with
  // composites on the 19 factory-listed models — the CL3 window
  // re-opened it for the family's newest query). The [createdAt, id]
  // covering index lets SQLite walk newest-first and stop at 5000
  // MATCHING rows (the common single-user case; the sparse-user
  // adversarial case is no worse than the sort). [deckId] stays — the
  // FK/deck-delete-cascade lookup index. The complete fix (denormalized
  // userId + the family composite) is the documented upgrade path, not
  // taken this cycle.
  it("Flashcard carries the [createdAt, id] covering index for the CL3 window's ORDER BY (the CC10 class, re-opened then closed)", () => {
    const body = modelBody("Flashcard");
    expect(body).toContain("@@index([createdAt, id])");
    expect(body).toContain("@@index([deckId])");
  });
});

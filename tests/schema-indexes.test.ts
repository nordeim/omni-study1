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
});

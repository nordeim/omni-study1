// S121/BV7 — the owned-FK census.
//
// makeOwnedDelegate wrote parsed FK ids (subjectId/listId/notebookId)
// verbatim — a row referencing ANOTHER user's subject/list/notebook
// satisfied the Prisma FK and persisted (reads stay userId-scoped: an
// owner-view dangling FK, not a read leak). The hand-written routes already
// own this check (files/folders ×4, ai/generate ×2 — the 404 "That X does
// not exist." convention); the factory now carries an `ownedFks` config and
// every FK-bearing delegate declares it. This census is the guard: a NEW
// FK-bearing delegate that ships unwired fails here.
import { describe, expect, it } from "vitest";

import { OWNED_FKS } from "@/lib/server/entities";

describe("the ownedFks census (S121/BV7)", () => {
  it("every FK-bearing delegate declares its owned FK targets", () => {
    expect(Object.keys(OWNED_FKS).sort()).toEqual([
      "assignment",
      "deck",
      "exam",
      "focusSession",
      "grade",
      "note",
      "practiceTest",
      "studyGroup",
      "task",
      "timetable",
    ]);
  });

  it("each declared FK carries a model + a human label (the 404 message fragment)", () => {
    for (const [delegate, fks] of Object.entries(OWNED_FKS)) {
      expect(Object.keys(fks).length, `${delegate} declares at least one FK`).toBeGreaterThan(0);
      for (const [field, cfg] of Object.entries(fks)) {
        expect(cfg?.model, `${delegate}.${field} model`).toBeDefined();
        expect(typeof cfg?.label, `${delegate}.${field} label`).toBe("string");
        expect(cfg?.label.length ?? 0, `${delegate}.${field} label non-empty`).toBeGreaterThan(0);
      }
    }
  });

  it("the field names match the schema FK vocabulary", () => {
    expect(Object.keys(OWNED_FKS.task).sort()).toEqual(["listId", "subjectId"]);
    expect(Object.keys(OWNED_FKS.note).sort()).toEqual(["notebookId", "subjectId"]);
    expect(Object.keys(OWNED_FKS.assignment)).toEqual(["subjectId"]);
    expect(Object.keys(OWNED_FKS.exam)).toEqual(["subjectId"]);
    expect(Object.keys(OWNED_FKS.deck)).toEqual(["subjectId"]);
    expect(Object.keys(OWNED_FKS.practiceTest)).toEqual(["subjectId"]);
    expect(Object.keys(OWNED_FKS.studyGroup)).toEqual(["subjectId"]);
    expect(Object.keys(OWNED_FKS.grade)).toEqual(["subjectId"]);
    expect(Object.keys(OWNED_FKS.focusSession)).toEqual(["subjectId"]);
    expect(Object.keys(OWNED_FKS.timetable)).toEqual(["subjectId"]);
  });
});

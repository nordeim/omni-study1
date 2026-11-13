import { beforeEach, describe, expect, it, vi } from "vitest";

// ---------------------------------------------------------------------------
// S180/ED · the note-attachments seam (docs/remediation-plan-session180.md
// §3.1): the Attach-File wire feature — the staged upload (the pick POSTs
// immediately, the reference's measured posture), the derived download url
// (never stored — no drift hazard), the ownership-verified bind (the Save's
// attachments array is the authoritative desired list: staged rows join the
// note, rows no longer listed leave it), and the include reads (the note
// GETs carry the rows with derived urls).
//
// The seam's DB surface is pinned through a CAPTURED mock (the data-store
// pattern) — the transaction callback resolves against the same mock, so the
// bind's three legs (the ownership read, the staged bind, the removal
// delete) assert at the exact Prisma call shapes.
// ---------------------------------------------------------------------------

const dbMock = vi.hoisted(() => ({
  note: {
    findMany: vi.fn(),
    findFirst: vi.fn(),
  },
  noteAttachment: {
    findMany: vi.fn(),
    findFirst: vi.fn(),
    create: vi.fn(),
    updateMany: vi.fn(),
    deleteMany: vi.fn(),
  },
  $transaction: vi.fn(async (cb: (tx: unknown) => Promise<unknown>) => cb(dbMock)),
}));
vi.mock("@/lib/db", () => ({ db: dbMock }));

import {
  attachmentIdFromUrl,
  bindNoteAttachments,
  listNotesWithAttachments,
  noteAttachmentUrl,
  NOTE_ATTACHMENT_METADATA,
  readNoteWithAttachments,
} from "@/lib/server/note-attachments";
import { NOTE_ATTACHMENT_URL_PREFIX } from "@/lib/validation";

const PREFIX = NOTE_ATTACHMENT_URL_PREFIX;
const ref = (id: string) => ({ name: `${id}.txt`, url: noteAttachmentUrl(id) });

describe("S180/ED · the derived download url", () => {
  it("round-trips: url(id) → attachmentIdFromUrl(url) === id", () => {
    const id = "ckv123abc";
    const url = noteAttachmentUrl(id);
    expect(url).toBe(`${PREFIX}${id}`);
    expect(attachmentIdFromUrl(url)).toBe(id);
  });

  it("rejects a foreign-prefix url, an empty id, and an over-64 id (the 400 family)", () => {
    expect(() => attachmentIdFromUrl("https://evil.example/x")).toThrow();
    expect(() => attachmentIdFromUrl(PREFIX)).toThrow();
    expect(() => attachmentIdFromUrl(`${PREFIX}x`.repeat(6) + "y")).toThrow();
  });
});

describe("S180/ED · the metadata select (the AH13 doctrine — data never rides a JSON body)", () => {
  it("selects id + name + createdAt, NEVER the base64 data column", () => {
    expect(Object.keys(NOTE_ATTACHMENT_METADATA).sort()).toEqual([
      "createdAt",
      "id",
      "name",
    ]);
    expect(NOTE_ATTACHMENT_METADATA).not.toHaveProperty("data");
  });
});

describe("S180/ED · bindNoteAttachments (the ownership-verified bind)", () => {
  beforeEach(() => {
    dbMock.noteAttachment.findMany.mockReset();
    dbMock.noteAttachment.updateMany.mockReset();
    dbMock.noteAttachment.deleteMany.mockReset();
    dbMock.$transaction.mockClear();
  });

  it("binds the listed STAGED rows to the note and deletes the note's rows no longer listed", async () => {
    dbMock.noteAttachment.findMany.mockResolvedValue([
      { id: "a1", noteId: null },
      { id: "a2", noteId: null },
    ]);
    await bindNoteAttachments("user1", "note1", [ref("a1"), ref("a2")]);

    // the ownership read: the listed ids, scoped to the OWNER.
    expect(dbMock.noteAttachment.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: { in: ["a1", "a2"] }, userId: "user1" },
      }),
    );
    // the staged bind: noteId null → the note.
    expect(dbMock.noteAttachment.updateMany).toHaveBeenCalledWith({
      where: { id: { in: ["a1", "a2"] }, userId: "user1", noteId: null },
      data: { noteId: "note1" },
    });
    // the removal leg: the note's rows NOT in the list.
    expect(dbMock.noteAttachment.deleteMany).toHaveBeenCalledWith({
      where: { noteId: "note1", userId: "user1", id: { notIn: ["a1", "a2"] } },
    });
    expect(dbMock.$transaction).toHaveBeenCalledTimes(1);
  });

  it("an EMPTY list deletes every row of the note (the authoritative-desired-list contract)", async () => {
    dbMock.noteAttachment.findMany.mockResolvedValue([]);
    await bindNoteAttachments("user1", "note1", []);
    expect(dbMock.noteAttachment.updateMany).not.toHaveBeenCalled();
    expect(dbMock.noteAttachment.deleteMany).toHaveBeenCalledWith({
      where: { noteId: "note1", userId: "user1", id: { notIn: [] } },
    });
  });

  it("rejects a MISSING/foreign row (the ownership verification — the 400 family)", async () => {
    dbMock.noteAttachment.findMany.mockResolvedValue([{ id: "a1", noteId: null }]);
    await expect(
      bindNoteAttachments("user1", "note1", [ref("a1"), ref("foreign")]),
    ).rejects.toThrow();
    expect(dbMock.noteAttachment.updateMany).not.toHaveBeenCalled();
  });

  it("rejects a row already bound to ANOTHER note (the CN10 owned-FK re-point posture)", async () => {
    dbMock.noteAttachment.findMany.mockResolvedValue([
      { id: "a1", noteId: "someone-elses-note" },
    ]);
    await expect(
      bindNoteAttachments("user1", "note1", [ref("a1")]),
    ).rejects.toThrow();
    expect(dbMock.noteAttachment.updateMany).not.toHaveBeenCalled();
    expect(dbMock.noteAttachment.deleteMany).not.toHaveBeenCalled();
  });

  it("accepts a row already bound to THIS note (the idempotent re-list)", async () => {
    dbMock.noteAttachment.findMany.mockResolvedValue([
      { id: "a1", noteId: "note1" },
    ]);
    await expect(
      bindNoteAttachments("user1", "note1", [ref("a1")]),
    ).resolves.toBeUndefined();
    expect(dbMock.noteAttachment.deleteMany).toHaveBeenCalledWith({
      where: { noteId: "note1", userId: "user1", id: { notIn: ["a1"] } },
    });
  });

  it("rejects a bad-prefix url before any DB call (the atom's mirror at the seam)", async () => {
    await expect(
      bindNoteAttachments("user1", "note1", [
        { name: "x", url: "https://evil.example/x" },
      ]),
    ).rejects.toThrow();
    expect(dbMock.$transaction).not.toHaveBeenCalled();
  });
});

describe("S180/ED · the include reads", () => {
  beforeEach(() => {
    dbMock.note.findMany.mockReset();
    dbMock.note.findFirst.mockReset();
  });

  it("listNotesWithAttachments: the newest-500 window, reversed, with DERIVED urls", async () => {
    dbMock.note.findMany.mockResolvedValue([
      { id: "n1", title: "A", attachments: [{ id: "a1", name: "f.txt", createdAt: new Date() }] },
      { id: "n2", title: "B", attachments: [] },
    ]);
    const rows = await listNotesWithAttachments("user1");
    expect(dbMock.note.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { userId: "user1" },
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
        take: 500,
      }),
    );
    // reversed (the factory's asc presentation) + the derived url on every row.
    expect(rows.map((r: { id: string }) => r.id)).toEqual(["n2", "n1"]);
    expect(rows[1].attachments[0].url).toBe(noteAttachmentUrl("a1"));
  });

  it("readNoteWithAttachments: the ownership read returns null for a foreign/missing note", async () => {
    dbMock.note.findFirst.mockResolvedValue(null);
    expect(await readNoteWithAttachments("user1", "note1")).toBeNull();
    expect(dbMock.note.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: "note1", userId: "user1" } }),
    );
  });
});

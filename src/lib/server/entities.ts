// ---------------------------------------------------------------------------
// The entity delegates (ADR-006): one configuration object per owned model,
// consumed by the makeCollectionRoutes/makeItemRoutes factories. Every query
// is scoped where:{userId} — ownership by construction; updates/removes
// verify ownership BEFORE mutating (an unscoped query cannot be written
// through this seam). Every payload passes its Zod schema first.
//
// Two special delegates: study-groups (the members JSON column — array at
// the boundary, JSON.stringify on write, JSON.parse on read) and flashcard
// cards (Flashcard carries NO userId — ownership scopes through the deck,
// with a deck-ownership guard on create/update).
// ---------------------------------------------------------------------------

import type { ZodType } from "zod";

import { db } from "../db";
import {
  assignmentSchema,
  examSchema,
  eventSchema,
  flashcardDeckSchema,
  flashcardSchema,
  focusSessionSchema,
  gradeSchema,
  holidaySchema,
  noteSchema,
  notebookSchema,
  practiceTestSchema,
  studyGroupSchema,
  subjectSchema,
  taskListSchema,
  taskSchema,
  timetableClassSchema,
} from "../validation";
import {
  NotFoundError,
  parseWith,
  ValidationError,
  type EntityDelegate,
} from "./http";

// ---- the minimal structural Prisma model --------------------------------------

/**
 * The slice of a Prisma delegate this seam needs. Prisma's generated model
 * delegates are structurally compatible (methods compare bivariantly; the
 * concrete args/returns are always assignable both ways for these shapes).
 */
type OwnedModel = {
  findMany(args: {
    where: { userId: string };
    orderBy?: { createdAt: "asc" | "desc" };
  }): Promise<unknown[]>;
  findFirst(args: { where: Record<string, unknown> }): Promise<unknown>;
  create(args: { data: unknown }): Promise<unknown>;
  update(args: { where: { id: string }; data: unknown }): Promise<unknown>;
  delete(args: { where: { id: string } }): Promise<unknown>;
};

type Row = Record<string, unknown>;

// ---- the owned-delegate factory -------------------------------------------------

type OwnedConfig = {
  model: OwnedModel;
  createSchema: ZodType<Row>;
  updateSchema: ZodType<Row>;
  /** Columns carrying date-time strings at the boundary → Date on write. */
  dateFields?: readonly string[];
  /** Post-read normalizer (e.g. the study-groups members JSON column). */
  fromRow?: (row: unknown) => unknown;
  /** Pre-write normalizer applied after the date conversion. */
  writeTransform?: (data: Row) => Row;
  orderBy?: "asc" | "desc";
};

function datesOnWrite(data: Row, dateFields: readonly string[]): Row {
  const out: Row = {};
  for (const [key, value] of Object.entries(data)) {
    out[key] =
      dateFields.includes(key) && typeof value === "string"
        ? new Date(value)
        : value;
  }
  return out;
}

/**
 * S82/AI1 (the AH8 sent-keys filter extracted, and extended to the
 * sixteenth write site): zod@4's `.partial()` does NOT suppress
 * create-time `.default()` — `noteSchema.partial().parse({title})`
 * materializes `{title, content: "", tags: "[]"}` (verified empirically
 * in S81), so writing the parsed object verbatim resets EVERY defaulted
 * field on every partial PATCH. Absent keys are NOT writes: keep only
 * the keys the caller actually sent, INTERSECTED with the keys the
 * schema actually parsed (S82/AI5: `writes` then only ever contains
 * schema-validated keys — an unknown sent key is dropped here by
 * contract, not by Prisma's implicit skip-undefined semantics). An
 * explicitly-sent undefined is indistinguishable from an absent key and
 * is not a meaningful write either way.
 *
 * The S81 lesson, generalized: EVERY partial-PATCH write site needs this
 * filter — the factory's fifteen delegates, the hand-written flashcard
 * card delegate (Flashcard carries no userId; ownership rides the deck
 * join, which is why it was never routed through the factory), AND the
 * folder delegate (S83/AJ1 — the seventeenth site, routed through this
 * helper so the convention admits no hand-written exceptions).
 */
export const sentKeysPatch = (
  input: unknown,
  parsed: Row,
): Row => {
  const source = (input ?? {}) as Row;
  const writes: Row = {};
  for (const key of Object.keys(source)) {
    if (source[key] === undefined) continue;
    if (!(key in parsed)) continue; // S82/AI5: schema-validated keys only
    writes[key] = parsed[key];
  }
  return writes;
};

function makeOwnedDelegate(config: OwnedConfig): EntityDelegate {
  const { model, createSchema, updateSchema, fromRow, writeTransform } = config;
  const dateFields = config.dateFields ?? [];
  const orderBy = config.orderBy ?? "asc";

  const normalize = (row: unknown): unknown => (fromRow ? fromRow(row) : row);
  const toWrite = (data: Row): Row => {
    const withDates = datesOnWrite(data, dateFields);
    return writeTransform ? writeTransform(withDates) : withDates;
  };

  return {
    list: (userId) =>
      model
        .findMany({ where: { userId }, orderBy: { createdAt: orderBy } })
        .then((rows) => rows.map(normalize)),

    create: async (userId, input) => {
      const parsed = parseWith(createSchema, input);
      const row = await model.create({
        data: { ...toWrite(parsed), userId },
      });
      return normalize(row);
    },

    update: async (userId, id, input) => {
      const existing = await model.findFirst({ where: { id, userId } });
      if (!existing) throw new NotFoundError();
      const parsed = parseWith(updateSchema, input);
      // S81/AH8 → S82/AI1: the sent-keys filter (see sentKeysPatch) —
      // one shared helper covers the factory's fifteen delegates and the
      // flashcard card delegate below.
      const writes = sentKeysPatch(input, parsed);
      if (Object.keys(writes).length === 0) {
        // An empty patch is a no-op — short-circuit to the existing row
        // (S83/AJ2, verified against Prisma 6.11: an update with an empty
        // data object is ACCEPTED as a no-op — the row returns unchanged
        // and @updatedAt is NOT bumped — so the short-circuit exists to
        // avoid the pointless write and to normalize behavior across the
        // three write-site families, not to dodge a client rejection).
        return normalize(existing);
      }
      const row = await model.update({
        where: { id },
        data: toWrite(writes as Row),
      });
      return normalize(row);
    },

    remove: async (userId, id) => {
      const existing = await model.findFirst({ where: { id, userId } });
      if (!existing) throw new NotFoundError();
      await model.delete({ where: { id } });
      return { ok: true };
    },
  };
}

// ---- the members JSON column (study-groups) ----------------------------------------

type GroupMember = { name: string; email: string };

/** The API boundary carries members as an ARRAY; the column is a JSON
 *  string. Corrupt/absent JSON normalizes to [] (never throws to the view). */
function membersFromRow(row: unknown): unknown {
  if (typeof row !== "object" || row === null) return row;
  const record = row as { members?: unknown };
  if (typeof record.members !== "string") {
    record.members = [];
    return record;
  }
  try {
    const parsed: unknown = JSON.parse(record.members);
    record.members = Array.isArray(parsed) ? parsed : [];
  } catch {
    record.members = [];
  }
  return record;
}

function membersToWrite(data: Row): Row {
  const out: Row = { ...data };
  if (Array.isArray(out.members)) {
    out.members = JSON.stringify(out.members as GroupMember[]);
  }
  return out;
}

// ---- the sixteen delegates -----------------------------------------------------------

export const taskListDelegate = makeOwnedDelegate({
  model: db.taskList as unknown as OwnedModel,
  createSchema: taskListSchema,
  updateSchema: taskListSchema.partial(),
});

export const taskDelegate = makeOwnedDelegate({
  model: db.task as unknown as OwnedModel,
  createSchema: taskSchema,
  updateSchema: taskSchema.partial(),
  dateFields: ["dueDate"],
});

export const subjectDelegate = makeOwnedDelegate({
  model: db.subject as unknown as OwnedModel,
  createSchema: subjectSchema,
  updateSchema: subjectSchema.partial(),
});

export const assignmentDelegate = makeOwnedDelegate({
  model: db.assignment as unknown as OwnedModel,
  createSchema: assignmentSchema,
  updateSchema: assignmentSchema.partial(),
  dateFields: ["dueDate"],
});

export const examDelegate = makeOwnedDelegate({
  model: db.exam as unknown as OwnedModel,
  createSchema: examSchema,
  updateSchema: examSchema.partial(),
  dateFields: ["date"],
});

export const eventDelegate = makeOwnedDelegate({
  model: db.event as unknown as OwnedModel,
  createSchema: eventSchema,
  updateSchema: eventSchema.partial(),
  dateFields: ["startDate", "endDate"],
});

export const timetableDelegate = makeOwnedDelegate({
  model: db.timetableClass as unknown as OwnedModel,
  createSchema: timetableClassSchema,
  updateSchema: timetableClassSchema.partial(),
});

export const notebookDelegate = makeOwnedDelegate({
  model: db.notebook as unknown as OwnedModel,
  createSchema: notebookSchema,
  updateSchema: notebookSchema.partial(),
});

export const noteDelegate = makeOwnedDelegate({
  model: db.note as unknown as OwnedModel,
  createSchema: noteSchema,
  updateSchema: noteSchema.partial(),
});

export const flashcardDeckDelegate = makeOwnedDelegate({
  model: db.flashcardDeck as unknown as OwnedModel,
  createSchema: flashcardDeckSchema,
  updateSchema: flashcardDeckSchema.partial(),
});

export const practiceTestDelegate = makeOwnedDelegate({
  model: db.practiceTest as unknown as OwnedModel,
  createSchema: practiceTestSchema,
  updateSchema: practiceTestSchema.partial(),
});

export const studyGroupDelegate = makeOwnedDelegate({
  model: db.studyGroup as unknown as OwnedModel,
  createSchema: studyGroupSchema,
  updateSchema: studyGroupSchema.partial(),
  fromRow: membersFromRow,
  writeTransform: membersToWrite,
});

export const gradeDelegate = makeOwnedDelegate({
  model: db.grade as unknown as OwnedModel,
  createSchema: gradeSchema,
  updateSchema: gradeSchema.partial(),
});

export const focusSessionDelegate = makeOwnedDelegate({
  model: db.focusSession as unknown as OwnedModel,
  createSchema: focusSessionSchema,
  updateSchema: focusSessionSchema.partial(),
  dateFields: ["startedAt"],
});

export const holidayDelegate = makeOwnedDelegate({
  model: db.holiday as unknown as OwnedModel,
  createSchema: holidaySchema,
  updateSchema: holidaySchema.partial(),
  dateFields: ["date"],
});

/**
 * Flashcard cards: Flashcard carries NO userId — every access scopes
 * through the deck relation, and the deck-ownership guard re-checks the
 * target deck on create (and on a deckId-changing update).
 */
export const flashcardCardDelegate: EntityDelegate = {
  list: (userId) =>
    db.flashcard.findMany({
      where: { deck: { userId } },
      orderBy: { createdAt: "asc" },
    }),

  create: async (userId, input) => {
    const parsed = parseWith(flashcardSchema, input);
    if (!parsed.deckId) {
      throw new ValidationError("deckId: A flashcard needs a deck.");
    }
    const deck = await db.flashcardDeck.findFirst({
      where: { id: parsed.deckId, userId },
    });
    if (!deck) throw new NotFoundError("That deck does not exist.");
    return db.flashcard.create({
      data: {
        front: parsed.front,
        back: parsed.back,
        difficulty: parsed.difficulty,
        mastered: parsed.mastered,
        deckId: parsed.deckId,
      },
    });
  },

  update: async (userId, id, input) => {
    const card = await db.flashcard.findFirst({
      where: { id, deck: { userId } },
    });
    if (!card) throw new NotFoundError();
    const parsed = parseWith(flashcardSchema.partial(), input);
    // S82/AI1: the sixteenth write site — the SAME sent-keys filter as
    // the factory (this delegate is hand-written because Flashcard
    // carries no userId, which is also why the S81 factory fix missed
    // it). Pre-fix: `{...parsed}` wrote the FULL defaulted object, so a
    // study rating ({mastered:true}) reset a hard card's difficulty to
    // "medium" and a card edit ({front,back,difficulty}) un-mastered a
    // mastered card.
    const data = sentKeysPatch(input, parsed) as Row & { deckId?: string };
    if (typeof data.deckId === "string" && data.deckId !== card.deckId) {
      const deck = await db.flashcardDeck.findFirst({
        where: { id: data.deckId, userId },
      });
      if (!deck) throw new NotFoundError("That deck does not exist.");
    } else {
      // Not sent, or a same-value re-send — not a write.
      delete data.deckId;
    }
    if (Object.keys(data).length === 0) {
      // An empty patch is a no-op (S83/AJ2, verified against Prisma 6.11:
      // an update with an empty data object is ACCEPTED as a no-op — the
      // short-circuit avoids the pointless write, matching the factory).
      return card;
    }
    return db.flashcard.update({ where: { id }, data });
  },

  remove: async (userId, id) => {
    const card = await db.flashcard.findFirst({
      where: { id, deck: { userId } },
    });
    if (!card) throw new NotFoundError();
    await db.flashcard.delete({ where: { id } });
    return { ok: true };
  },
};

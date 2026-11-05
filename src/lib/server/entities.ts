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

import { normalizeMembers, type GroupMember } from "../group-members";
import { db } from "../db";
import {
  GRADE_SCORE_ABOVE_MAX,
  assignmentSchema,
  examSchema,
  eventCreateSchema,
  eventUpdateSchema,
  flashcardDeckSchema,
  flashcardSchema,
  focusSessionSchema,
  gradeCreateSchema,
  gradeSchema,
  holidaySchema,
  noteSchema,
  notebookSchema,
  practiceTestSchema,
  studyGroupSchema,
  subjectSchema,
  taskListSchema,
  taskSchema,
  timetableClassCreateSchema,
  timetableClassUpdateSchema,
  hhmmMinutes,
} from "../validation";

// S140/CO1: the server-only note-HTML sanitizer (the A-L3 closure — never
// re-exported through this module's client-reachable surface; the seam
// lives at src/lib/server/note-html.ts).
import { sanitizeNoteHtml } from "./note-html";
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
    // S125/BZ13 added take; S126/CA5 widened orderBy to the tiebreak
    // array form (createdAt + id, the BZ10 class) — every concrete
    // Prisma delegate accepts both the single and array shapes.
    orderBy?:
      | { createdAt: "asc" | "desc" }
      | Array<{ createdAt: "asc" | "desc" } | { id: "asc" | "desc" }>;
    take?: number;
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
  /** S130/CE5: the Prisma client property name — REQUIRED when beforeWrite
   * is set: the transactional update path resolves the tx-scoped delegate
   * by this name for the re-read inside db.$transaction (SQLite serializes
   * interactive transactions, so the re-read is authoritative — the BZ7
   * folder-cycle doctrine). Checked at construction: a guarded delegate
   * without the name fails at import, loud. */
  txModelName?: string;
  createSchema: ZodType<Row>;
  updateSchema: ZodType<Row>;
  /** Columns carrying date-time strings at the boundary → Date on write. */
  dateFields?: readonly string[];
  /** Post-read normalizer (e.g. the study-groups members JSON column). */
  fromRow?: (row: unknown) => unknown;
  /** Pre-write normalizer applied after the date conversion. */
  writeTransform?: (data: Row) => Row;
  /** S121/BV1: cross-field guard run on UPDATE with the STORED row + the
   * sent writes (a single-leg PATCH that inverts against the stored row —
   * the events end≥start merge). Throw ValidationError/NotFoundError. */
  beforeWrite?: (existing: Row, writes: Row) => void;
  /** S121/BV7: FK fields whose sent values must reference rows OWNED by the
   * caller (the files/folders + ai/generate convention: 404 "That <label>
   * does not exist." on a foreign or missing target). */
  ownedFks?: Partial<Record<string, { model: OwnedModel; label: string }>>;
};

/** S121/BV7: the owned-FK registry — the census `tests/owned-fks.test.ts`
 * pins, so a NEW FK-bearing delegate cannot ship unwired. */
export const OWNED_FKS: Record<
  string,
  Partial<Record<string, { model: OwnedModel; label: string }>>
> = {};

/** S121/BV7: verify every non-null sent FK references an owned row. */
async function assertOwnedFks(
  ownedFks: NonNullable<OwnedConfig["ownedFks"]>,
  userId: string,
  writes: Row,
): Promise<void> {
  for (const [field, cfg] of Object.entries(ownedFks)) {
    const value = writes[field];
    if (value === undefined || value === null || value === "") continue;
    const target = await cfg?.model.findFirst({ where: { id: String(value), userId } });
    if (!target) throw new NotFoundError(`That ${cfg?.label} does not exist.`);
  }
}

/**
 * S121/BV1 — the events single-leg ordering merge. BU22's update schema
 * validates the end≥start ordering only when BOTH legs arrive together;
 * a single-leg PATCH (`{"endDate": …}` alone) must be compared against
 * the STORED row's other leg — this seam is that merge. Comparisons use
 * Date.parse values (S121/BV10: a mixed-offset ISO string can sort later
 * lexicographically while being EARLIER in time). A NaN on either side
 * skips the comparison (the dateAtom refine already rejected unparseable
 * strings at the schema boundary).
 */
export function checkEventOrderingMerge(existing: Row, writes: Row): void {
  const startSent = "startDate" in writes;
  const endSent = "endDate" in writes;
  // Both legs arriving together are the UPDATE SCHEMA's contract (the
  // .check() on eventUpdateSchema); neither leg is the delegate's no-op.
  if (startSent === endSent) return;
  const startDate = startSent ? writes.startDate : existing.startDate;
  const endDate = endSent ? writes.endDate : existing.endDate;
  if (startDate === null || endDate === null) return; // a three-state clear
  // The STORED row arrives from Prisma as a Date; the sent write is a
  // string — normalize both (the first live probe caught the string-only
  // form silently skipping on the Date side).
  const startMs = epochMs(startDate);
  const endMs = epochMs(endDate);
  if (Number.isNaN(startMs) || Number.isNaN(endMs)) return;
  if (endMs < startMs) {
    throw new ValidationError("End date must be after the start date");
  }
}

/** S121/BV1: a leg is an ISO string (the wire) or a Date (the stored row). */
function epochMs(value: unknown): number {
  if (typeof value === "string") return Date.parse(value);
  if (value instanceof Date) return value.getTime();
  return Number.NaN;
}

/**
 * S125/BZ6 — the grade range merge (the events BV1 pattern on the numeric
 * score/maxScore pair, with one structural difference): the grades UPDATE
 * path owns NO schema-side .check() — zod@4's .partial() injects the
 * maxScore default into every parsed payload, so a schema-side compare
 * would read the injected denominator instead of the stored one (the
 * sent-keys filter runs after parse, outside the schema's reach). This
 * seam therefore owns EVERY combination through one unified compare over
 * the EFFECTIVE pair (sent leg wins, stored leg fills): both-legs-sent,
 * score-only, and maxScore-only all funnel into the same comparison —
 * the BX1 "normalized at EVERY enforcement site" doctrine. A non-numeric
 * stored leg skips (the legacy-seed defense, the BW7 hhmm lesson).
 */
export function checkGradeRangeMerge(existing: Row, writes: Row): void {
  const scoreSent = "score" in writes;
  const maxSent = "maxScore" in writes;
  if (!scoreSent && !maxSent) return;
  const score = scoreSent ? writes.score : existing.score;
  const maxScore = maxSent ? writes.maxScore : existing.maxScore;
  if (typeof score !== "number" || typeof maxScore !== "number") return;
  if (score > maxScore) {
    throw new ValidationError(GRADE_SCORE_ABOVE_MAX);
  }
}

/**
 * S122/BW7 — the timetable single-leg ordering merge (the events BV1
 * pattern on the hhmm atoms). The update schema's .check() fires only
 * when BOTH legs arrive together; a single-leg PATCH
 * (`{"endTime": …}` alone) is compared against the STORED row's other
 * leg here. Comparisons are MINUTES-SINCE-MIDNIGHT, never raw strings:
 * the SEED writes unpadded hours ("9:00" — Prisma directly, past the
 * Zod boundary), and "11:00" < "9:00" lexicographically — a legacy row
 * would reject every legal move (the live probe caught exactly this). A
 * missing stored leg skips (legacy defense); a null leg cannot occur
 * (hhmm is required, not nullable — no three-state clear).
 */
export function checkTimetableOrderingMerge(existing: Row, writes: Row): void {
  const startSent = "startTime" in writes;
  const endSent = "endTime" in writes;
  // Both legs arriving together are the UPDATE SCHEMA's contract; neither
  // leg is the delegate's no-op.
  if (startSent === endSent) return;
  const startTime = startSent ? writes.startTime : existing.startTime;
  const endTime = endSent ? writes.endTime : existing.endTime;
  if (typeof startTime !== "string" || typeof endTime !== "string") return;
  const startMin = hhmmMinutes(startTime);
  const endMin = hhmmMinutes(endTime);
  if (startMin === null || endMin === null) return; // a malformed legacy leg skips
  if (endMin < startMin) {
    throw new ValidationError("End time must be after the start time");
  }
}

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
    // S82/AI5: schema-validated keys only — and S143/CR1: the membership
    // test must be OWN-keys. `key in parsed` walks the prototype chain,
    // so a hostile PATCH body carrying `toString`/`constructor`/`valueOf`/
    // `hasOwnProperty` (inherited Object.prototype members Zod strip-mode
    // never emits as own keys) passed the gate and injected the inherited
    // FUNCTIONS into the write data — PrismaClientValidationError → the
    // shared mapper's 500 on a reachable interactive path (the 400-family
    // taxonomy's one reachable violation, probed empirically pre-fix).
    if (!Object.prototype.hasOwnProperty.call(parsed, key)) continue;
    writes[key] = parsed[key];
  }
  return writes;
};

function makeOwnedDelegate(config: OwnedConfig): EntityDelegate {
  const { model, createSchema, updateSchema, fromRow, writeTransform } = config;
  const dateFields = config.dateFields ?? [];
  const ownedFks = config.ownedFks;
  const beforeWrite = config.beforeWrite;
  // S130/CE5: the guarded-delegate construction contract (see txModelName).
  const txModelName = config.txModelName;
  if (beforeWrite && !txModelName) {
    throw new Error(
      "S130/CE5: every beforeWrite delegate must declare txModelName (the transactional re-read resolves the tx delegate by name).",
    );
  }
  // S139/CN11 (audit B-L3): the name must also RESOLVE on the client at
  // construction — a typo previously surfaced as a 500 at the FIRST
  // guarded PATCH instead of failing loudly at startup (the
  // loud-at-construction doctrine CE5's own comment states, completed).
  // (The non-null assertion is safe: the CE5 check above already threw
  // on every beforeWrite delegate without a name.)
  if (beforeWrite && !(txModelName! in db)) {
    throw new Error(
      `S139/CN11: the beforeWrite delegate's txModelName "${String(txModelName)}" does not resolve on the Prisma client — the transactional re-read would throw at the first guarded PATCH.`,
    );
  }

  const normalize = (row: unknown): unknown => (fromRow ? fromRow(row) : row);
  const toWrite = (data: Row): Row => {
    const withDates = datesOnWrite(data, dateFields);
    return writeTransform ? writeTransform(withDates) : withDates;
  };

  return {
    list: (userId) =>
      model
        .findMany({
          where: { userId },
          // S126/CA5: the newest-window selection (the s126 persistence
          // audit's B-M1 note generalized to the family). The BZ13
          // `asc + take: 500` bounded the response but selected the OLDEST
          // window — past 500 rows the newest rows vanished from every
          // collection GET. The calculator/messages form: fetch desc + take
          // (the newest 500), then reverse to the configured asc
          // presentation. The id tiebreak makes same-millisecond ties
          // deterministic (the BZ10 class).
          // S139/CN11 (audit B-L2): the dead `orderBy: "desc"` config
          // branch is deleted — no delegate ever selected desc (grep-
          // verified; the cards delegate below owns its own raw-query
          // ordering); every delegate reverses to asc.
          orderBy: [{ createdAt: "desc" }, { id: "desc" }],
          take: 500,
        })
        .then((rows) => rows.reverse().map(normalize)),

    create: async (userId, input) => {
      const parsed = parseWith(createSchema, input);
      // S121/BV7: a sent FK must reference a row the CALLER owns (a foreign
      // subject/list/notebook id satisfies the Prisma FK but dangles from
      // the owner's view once the other account deletes it).
      if (ownedFks) await assertOwnedFks(ownedFks, userId, parsed as Row);
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
        // (S83/AJ2, verified against the resolved Prisma runtime (6.19.3 at the S84 re-probe; the ^6.11.1 range): an update with an empty
        // data object is ACCEPTED as a no-op — the row returns unchanged
        // and @updatedAt is NOT bumped — so the short-circuit exists to
        // avoid the pointless write and to normalize behavior across the
        // three write-site families, not to dodge a client rejection).
        return normalize(existing);
      }
      // S121/BV7: the sent FKs must reference owned rows (PATCH too —
      // re-pointing a task at a foreign subject is the same hazard).
      if (ownedFks) await assertOwnedFks(ownedFks, userId, writes);
      if (beforeWrite && txModelName) {
        // S130/CE5: the transactional merge guard — the cross-field guard
        // reads the AUTHORITATIVE row INSIDE the transaction. Pre-fix the
        // guard validated against the PRE-WRITE snapshot: two concurrent
        // single-leg PATCHes (events {startDate} vs {endDate}, grades
        // {score} vs stored {maxScore}, timetable {endTime} vs stored
        // {startTime}) each passed against the old partner leg and could
        // commit an interleaved row no single request would accept — the
        // corrupted row then LOCKS the inversion in (the next legitimate
        // single-leg PATCH fails its guard against the corrupt stored
        // leg). The BZ7 folder-cycle pattern, now the guarded family's.
        const row = await db.$transaction(async (tx) => {
          const scoped = (tx as unknown as Record<string, OwnedModel>)[txModelName];
          const current = await scoped.findFirst({ where: { id, userId } });
          if (!current) throw new NotFoundError();
          beforeWrite(current as Row, writes);
          return scoped.update({ where: { id }, data: toWrite(writes as Row) });
        });
        return normalize(row);
      }
      // No merge guard: the plain ownership-checked write (the pre-CE5
      // shape — unchanged for the thirteen unguarded delegates).
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

// GroupMember is the seam's exported interface (src/lib/group-members.ts) —
// AM4 (the s86 audit's I3): one type for both sides of the boundary, not a
// local twin that can silently drift from the client's shape.

/** The API boundary carries members as an ARRAY; the column is a JSON
 *  string. Corrupt/absent JSON normalizes to [] (never throws to the view).
 *  Exported for the S88/AO3 unit pins (the sentKeysPatch precedent — the
 *  pure seam is directly pinnable; see tests/group-members.test.ts).
 *
 *  S88/AO3 — the server READ symmetry (the s88 audit's Info 1, the S87
 *  lesson-4 question): the read now routes through the SAME normalizeMembers
 *  the client seam applies — trim + blank-drop + shape validation. Pre-fix
 *  this JSON.parsed the legacy column and returned the array VERBATIM, so
 *  an API consumer reading a legacy pre-AM1 padded row saw padded values
 *  until the row's first re-write; both boundaries of the boundary now
 *  agree. The array-input tolerance (a non-string members value was wiped
 *  to [] pre-fix) matches the client seam's alternate-boundary doctrine. */
export function membersFromRow(row: unknown): unknown {
  if (typeof row !== "object" || row === null) return row;
  const record = row as { members?: unknown };
  record.members = normalizeMembers(record.members);
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

// S121/BV7: the owned-FK registry — the census pins every FK-bearing
// delegate (tests/owned-fks.test.ts); a new one that ships unwired fails.
OWNED_FKS.task = {
  listId: { model: db.taskList as unknown as OwnedModel, label: "list" },
  subjectId: { model: db.subject as unknown as OwnedModel, label: "subject" },
};
OWNED_FKS.assignment = { subjectId: { model: db.subject as unknown as OwnedModel, label: "subject" } };
OWNED_FKS.exam = { subjectId: { model: db.subject as unknown as OwnedModel, label: "subject" } };
OWNED_FKS.note = {
  notebookId: { model: db.notebook as unknown as OwnedModel, label: "notebook" },
  subjectId: { model: db.subject as unknown as OwnedModel, label: "subject" },
};
OWNED_FKS.deck = { subjectId: { model: db.subject as unknown as OwnedModel, label: "subject" } };
OWNED_FKS.practiceTest = { subjectId: { model: db.subject as unknown as OwnedModel, label: "subject" } };
OWNED_FKS.studyGroup = { subjectId: { model: db.subject as unknown as OwnedModel, label: "subject" } };
OWNED_FKS.grade = { subjectId: { model: db.subject as unknown as OwnedModel, label: "subject" } };
OWNED_FKS.focusSession = { subjectId: { model: db.subject as unknown as OwnedModel, label: "subject" } };
OWNED_FKS.timetable = { subjectId: { model: db.subject as unknown as OwnedModel, label: "subject" } };

export const taskDelegate = makeOwnedDelegate({
  model: db.task as unknown as OwnedModel,
  createSchema: taskSchema,
  updateSchema: taskSchema.partial(),
  dateFields: ["dueDate"],
  ownedFks: OWNED_FKS.task,
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
  ownedFks: OWNED_FKS.assignment,
});

export const examDelegate = makeOwnedDelegate({
  model: db.exam as unknown as OwnedModel,
  createSchema: examSchema,
  updateSchema: examSchema.partial(),
  dateFields: ["date"],
  ownedFks: OWNED_FKS.exam,
});

export const eventDelegate = makeOwnedDelegate({
  model: db.event as unknown as OwnedModel,
  // S130/CE5: the transactional merge guard's tx delegate name.
  txModelName: "event",
  // S120/BU22: the ordering-checked shapes (the pure eventSchema stays
  // partial()-able for the base — see validation.ts). S121/BV1: the
  // beforeWrite merge guards the SINGLE-LEG PATCH against the stored row
  // (the schema's .check() only fires when both legs arrive together).
  createSchema: eventCreateSchema,
  updateSchema: eventUpdateSchema,
  dateFields: ["startDate", "endDate"],
  beforeWrite: checkEventOrderingMerge,
});

export const timetableDelegate = makeOwnedDelegate({
  model: db.timetableClass as unknown as OwnedModel,
  // S130/CE5: the transactional merge guard's tx delegate name.
  txModelName: "timetableClass",
  // S122/BW7: the ordering-checked shapes + the single-leg merge — the
  // events family (BU22/BV1) applied to the hhmm atoms.
  createSchema: timetableClassCreateSchema,
  updateSchema: timetableClassUpdateSchema,
  ownedFks: OWNED_FKS.timetable,
  beforeWrite: checkTimetableOrderingMerge,
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
  ownedFks: OWNED_FKS.note,
  // S140/CO1 (the A-L3 deferral, closed): the note-HTML sanitize gate on
  // the API door. Both write paths (create + update) flow through the
  // factory's toWrite, so ONE writeTransform sanitizes every note body
  // the direct route accepts — the allowlist seam lives in
  // src/lib/server/note-html.ts (sanitize-html is server-only:
  // validation.ts is client-imported, so the schema itself must stay
  // dependency-free). The IMPORT door writes through the raw Prisma tx
  // client (the import route bypasses this hook by design) and applies
  // the same sanitizer in its own loop; the quill-editor mount gate
  // covers pre-fix legacy rows with the DOM walk from the same policy.
  writeTransform: sanitizeNoteContent,
});

/** S140/CO1: strip note HTML to Quill's authoring vocabulary (the
 *  tracking-pixel / remote-iframe / handler class dies here; plain text
 *  passes through byte-identically — the demo seed's note bodies). */
function sanitizeNoteContent(data: Row): Row {
  const content = data.content;
  if (typeof content !== "string" || content === "") return data;
  return { ...data, content: sanitizeNoteHtml(content) };
}

export const flashcardDeckDelegate = makeOwnedDelegate({
  model: db.flashcardDeck as unknown as OwnedModel,
  createSchema: flashcardDeckSchema,
  updateSchema: flashcardDeckSchema.partial(),
  ownedFks: OWNED_FKS.deck,
});

export const practiceTestDelegate = makeOwnedDelegate({
  model: db.practiceTest as unknown as OwnedModel,
  createSchema: practiceTestSchema,
  updateSchema: practiceTestSchema.partial(),
  ownedFks: OWNED_FKS.practiceTest,
});

export const studyGroupDelegate = makeOwnedDelegate({
  model: db.studyGroup as unknown as OwnedModel,
  createSchema: studyGroupSchema,
  updateSchema: studyGroupSchema.partial(),
  fromRow: membersFromRow,
  writeTransform: membersToWrite,
  ownedFks: OWNED_FKS.studyGroup,
});

export const gradeDelegate = makeOwnedDelegate({
  model: db.grade as unknown as OwnedModel,
  // S130/CE5: the transactional merge guard's tx delegate name.
  txModelName: "grade",
  // S125/BZ6: the ordering-checked create shape (the events delegate's
  // createSchema pattern); beforeWrite owns the PATCH legs (see
  // checkGradeRangeMerge — the update schema stays .check()-free by
  // design: zod@4's .partial() injects the maxScore default).
  createSchema: gradeCreateSchema,
  updateSchema: gradeSchema.partial(),
  beforeWrite: checkGradeRangeMerge,
  ownedFks: OWNED_FKS.grade,
});

export const focusSessionDelegate = makeOwnedDelegate({
  model: db.focusSession as unknown as OwnedModel,
  createSchema: focusSessionSchema,
  updateSchema: focusSessionSchema.partial(),
  dateFields: ["startedAt"],
  ownedFks: OWNED_FKS.focusSession,
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
    db.flashcard
      .findMany({
        where: { deck: { userId } },
        // S137/CL3 (audit B-M2): BOUNDED — the deck-completeness window.
        // Every sibling collection GET runs the CA5 newest-500 window, but
        // this list had NO take ("the take would hide cards") while the
        // import route can mint ~10^5 cards in one envelope — the exact
        // growth vector CA5/CB10 cited when bounding the file-family GETs
        // — after which every boot transferred the entire card table. The
        // BZ13 sibling form (desc + take, reversed to the configured asc
        // presentation) at 5000: the deck-completeness contract (study
        // mode runs a deck's full card set; the deck counts are honest
        // BELOW the window — S138/CM5: the window is global-across-decks,
        // not per-deck, so past a user's 5000th card the oldest silently
        // leave every deck's study set and count exactly like the sibling
        // newest-500 doctrine) keeps the bound 10× the sibling window. The
        // id tiebreak keeps same-millisecond ties deterministic (BZ10).
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
        take: 5000,
      })
      .then((rows) => rows.reverse()),

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
      // An empty patch is a no-op (S83/AJ2, verified against the resolved Prisma runtime (6.19.3 at the S84 re-probe; the ^6.11.1 range):
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

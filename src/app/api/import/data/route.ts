// ---------------------------------------------------------------------------
// POST /api/import/data — the data import / restore (S23/ADR-019, hardened
// S117/BR1). The exact inverse of GET /api/export/data: the versioned
// envelope validates (format identity, version floor+ceiling, known
// collections only, duplicate ids, FK integrity), then every row upserts BY
// ID inside ONE transaction — an import never duplicates and never deletes,
// and a rejected envelope rolls back completely.
//
// FK semantics: a dangling OPTIONAL FK imports NULLED (the SetNull family);
// a dangling REQUIRED FK (cards.deckId) is a 400 with the actionable
// collection.field message. Resolution is ACCOUNT-AWARE: a FK is resolvable
// if it points at a row in this envelope OR at an existing row the importer
// already owns (knownIds = imported ∪ existing).
//
// S117/BR1 (the cards fix + the documented-contract restoration): cards
// (Flashcard — no userId column) scope EVERY ownership probe through the
// deck relation, including the write loop's findFirst (the pre-S117 loop
// probed `{ id, userId }` on the flashcard delegate → PrismaClientValidationError
// → the whole transaction rolled back → HTTP 500 on ANY envelope containing
// cards — the export→import round-trip was broken for every account with
// flashcards). The body is capped at IMPORT_MAX_BYTES (413), the S23 seam's
// NEVER_IMPORT_FIELDS are stripped from every row, unknown collections are
// rejected BY NAME, and folders import parents-first (the seam's topo sort —
// a child-first hand-crafted order would die P2003 mid-transaction).
// The 10/15min per-user budget matches the spec's documented envelope.
// ---------------------------------------------------------------------------

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import type { PrismaClient } from "@prisma/client";
import { Prisma } from "@prisma/client";

import { checkRateLimit } from "@/lib/auth";
// S133/CH4: the envelope constants moved behind the seam —
// validateImportEnvelope owns the format/version/collection identity.
import {
  IMPORT_MAX_BYTES,
  IMPORT_ORDER,
  IMPORT_OPTIONAL_FKS,
  IMPORT_REQUIRED_FKS,
  ImportRowError,
  duplicateIdError,
  importProfilePatch,
  importRowIdError,
  parseImportRaceMessage,
  sanitizeImportRow,
  sortFoldersParentsFirst,
  stripSecrets,
  validateImportEnvelope,
} from "@/lib/data-import";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/server/auth";
import {
  checkEventOrderingMerge,
  checkGradeRangeMerge,
  checkTimetableOrderingMerge,
} from "@/lib/server/entities";
import {
  assertJsonContentType,
  errorResponse,
  rateLimitedResponse,
  readBodyCapped,
  toErrorResponse,
} from "@/lib/server/http";

type Row = Record<string, unknown>;

// S130/CE7 — the single-leg merge guards at the third entry point: the
// same validation.ts→entities.ts seams the factory's beforeWrite runs. A
// one-leg update (a hand-crafted `{score: 80}` against a stored
// `maxScore: 50`, or a single events/timetable date leg) must not
// persist an inverted row every interactive route would reject (the
// CB11 "the import is a first-class citizen" doctrine). The stored
// partner legs ride the probe's select.
const IMPORT_MERGE_GUARDS: Record<
  string,
  { guard: (existing: Row, writes: Row) => void; select: Row }
> = {
  events: {
    guard: checkEventOrderingMerge,
    select: { startDate: true, endDate: true },
  },
  grades: {
    guard: checkGradeRangeMerge,
    select: { score: true, maxScore: true },
  },
  timetableClasses: {
    guard: checkTimetableOrderingMerge,
    select: { startTime: true, endTime: true },
  },
};

// S135/CJ2 (audit A-M1): IMPORT_ORDER rides the seam (exported beside
// IMPORT_FK_MAP) — the route-local copy could silently drop a collection's
// rows on restore with a green typecheck. The seam's manifest-consistency
// census pins set-equality; the script-conventions census pins this import.
type Collection = (typeof IMPORT_ORDER)[number];

const MODEL: Record<Collection, keyof PrismaClient> = {
  subjects: "subject",
  taskLists: "taskList",
  folders: "fileFolder",
  notebooks: "notebook",
  decks: "flashcardDeck",
  tasks: "task",
  assignments: "assignment",
  exams: "exam",
  events: "event",
  timetableClasses: "timetableClass",
  notes: "note",
  cards: "flashcard",
  practiceTests: "practiceTest",
  studyGroups: "studyGroup",
  grades: "grade",
  focusSessions: "focusSession",
  files: "fileItem",
  chatMessages: "aiChatMessage",
  calcHistory: "calculatorHistoryEntry",
  holidays: "holiday",
};

/** REQUIRED FKs — a dangling reference is a 400 (the row cannot exist).
 * S122/BW8: DERIVED from the seam's IMPORT_FK_MAP (the single source —
 * the hand-maintained twin maps drifted hazard for 100+ sessions; the
 * unit pins in tests/data-import.test.ts hold the derivation). */

/** OPTIONAL FKs — a dangling reference imports NULLED (SetNull semantics). */

// S137/CL11 (audit A-I3): the route's private stripNeverImportFields twin
// DELETED — the write loop consumes the seam's exported stripSecrets (the
// BW8 single-source doctrine: the field LIST was already single-sourced
// via NEVER_IMPORT_FIELDS, but the LOOP itself was duplicated; a future
// edit to one copy would have drifted silently).

export const POST = async (request: NextRequest) => {
  try {
    const user = await requireUser();

    const limit = checkRateLimit(`import:${user.id}`, 10);
    if (!limit.ok) {
      return rateLimitedResponse(limit.retryAfterSec, "Too many import attempts");
    }

    // ---- S119/BT1a: the BR5 Content-Type gate, shared with readJson ------
    // A cross-site form POST (text/plain or multipart — native HTML form
    // encodings) must not reach this JSON parser: sameSite=lax cookies ride
    // top-level form navigations, the exact CSRF class BR5 closed at readJson.
    // The app's own client and every e2e POST send application/json.
    try {
      assertJsonContentType(request);
    } catch {
      return errorResponse(400, "Upload the backup as a JSON file.");
    }

    // ---- the 25 MiB body cap (S117/BR1 — the documented 413 contract;
    // S124/BY3 moved it 10 → 25 MiB, the export/import reconciliation) ------
    // S119/BT2: the capped read now walks the stream chunk-by-chunk (the
    // declared-length pre-read lives inside readBodyCapped) so a chunked
    // body is counted AS it is read, never buffered past the cap.
    let text: string;
    try {
      text = await readBodyCapped(request, IMPORT_MAX_BYTES);
    } catch {
      return errorResponse(
        413,
        `That backup is too large. The import cap is ${IMPORT_MAX_BYTES / (1024 * 1024)} MiB.`,
      );
    }
    let raw: unknown;
    try {
      raw = text.length === 0 ? null : (JSON.parse(text) as unknown);
    } catch {
      raw = null;
    }

    // ---- S133/CH4: the stateless envelope stages ride the SEAM -------------
    // (the S126 lesson-2 hazard closed: this inline twin had drifted from
    // the unit-pinned parseImportEnvelope — the seam tolerated a missing
    // data block, split the version 400s, and carried a second copy of
    // every message. validateImportEnvelope is now the single source; the
    // messages below are byte-identical to the pre-CH4 shipped contract,
    // so the s23 e2e legs stay green untouched.)
    const envelopeCheck = validateImportEnvelope(raw);
    if (!envelopeCheck.ok) {
      return errorResponse(400, envelopeCheck.error);
    }
    const data = envelopeCheck.data;

    // ---- per-collection validation -------------------------------------
    // S126/CA2: the row-id rule rides the SEAM's shared validator (the
    // BW8 single-source doctrine — the route's inline twin had dropped the
    // empty-id guard and minted rows no detail route could address), and a
    // `null` collection is rejected like the seam's contract (the
    // array-ness itself is already guaranteed by validateImportEnvelope
    // above — this loop keeps the per-row id + duplicate rules).
    const parsed = new Map<Collection, Row[]>();
    for (const collection of IMPORT_ORDER) {
      const rows = data[collection];
      if (rows === undefined) continue;
      if (!Array.isArray(rows)) {
        return errorResponse(400, `The "${collection}" collection must be an array.`);
      }
      const seen = new Set<string>();
      for (const row of rows) {
        const idError = importRowIdError(collection, row);
        if (idError !== null) {
          return errorResponse(400, idError);
        }
        const id = (row as Row).id as string;
        if (seen.has(id)) {
          // S133/CH4: the shared message (the seam's helper).
          return errorResponse(400, duplicateIdError(collection, id));
        }
        seen.add(id);
      }
      parsed.set(collection, rows as Row[]);
    }

    // Known ids per collection = imported ids ∪ the owner's existing rows.
    const knownIds = new Map<Collection, Set<string>>();
    // S135/CJ4: existingIds keeps the DB-ONLY half of the census — knownIds
    // unions the envelope's own ids (the FK-resolution contract), which
    // would make every imported row look "existing" to a create-branch
    // discriminator.
    const existingIds = new Map<Collection, Set<string>>();
    for (const collection of IMPORT_ORDER) {
      const ids = new Set<string>((parsed.get(collection) ?? []).map((r) => r.id as string));
      const model = MODEL[collection];
      // cards are deck-scoped (no userId column) — ownership rides the deck.
      const where =
        collection === "cards"
          ? { deck: { userId: user.id } }
          : { userId: user.id };

      const existing = await (db[model] as any).findMany({
        where,
        select: { id: true },
      });
      const dbIds = new Set<string>();
      for (const row of existing) {
        ids.add(row.id);
        dbIds.add(row.id);
      }
      knownIds.set(collection, ids);
      existingIds.set(collection, dbIds);
    }

    // FK integrity: required → 400; optional → nulled.
    // S135/CJ4 (audit A-L2): the missing-on-CREATE case joins the named-400
    // family — the seam (validateImportEnvelope) rejects null/non-string
    // required values, and undefined (absent) is the UPDATE branch's
    // untouched case; but a NEW row (id not in existingIds — the DB-only
    // census, NOT knownIds which unions the envelope's own ids) without its
    // required FK previously sailed to the Prisma write and answered the
    // GENERIC "fields do not match" 400.
    for (const [collection, fks] of Object.entries(IMPORT_REQUIRED_FKS) as [
      Collection,
      Record<string, Collection>,
    ][]) {
      for (const row of parsed.get(collection) ?? []) {
        for (const [field, refCollection] of Object.entries(fks)) {
          const value = row[field];
          if (
            typeof value === "string" &&
            !knownIds.get(refCollection)?.has(value)
          ) {
            return errorResponse(
              400,
              `${collection}: row "${row.id as string}" references a missing ${field} "${value}" — restore the ${refCollection} rows first.`,
            );
          }
          if (
            value === undefined &&
            !existingIds.get(collection)?.has(row.id as string)
          ) {
            return errorResponse(
              400,
              `${collection}: row "${row.id as string}" is missing its required ${field} — a new row must reference an existing ${refCollection.replace(/s$/, "")} in this backup.`,
            );
          }
        }
      }
    }
    for (const [collection, fks] of Object.entries(IMPORT_OPTIONAL_FKS) as [
      Collection,
      Record<string, Collection | "self">,
    ][]) {
      for (const row of parsed.get(collection) ?? []) {
        for (const [field, ref] of Object.entries(fks)) {
          const value = row[field];
          if (typeof value !== "string") continue;
          const refs = ref === "self" ? knownIds.get(collection) : knownIds.get(ref);
          if (!refs?.has(value)) row[field] = null;
        }
      }
    }

    // Folders import parents-first (S117/BR1 — the seam's topo sort; a
    // hand-crafted child-first order would die P2003 mid-transaction. A
    // parentId pointing at an EXISTING owned folder (not in this envelope)
    // sorts as a root — its FK was already validated above).
    if (parsed.has("folders")) {
      const sorted = sortFoldersParentsFirst(parsed.get("folders") as Row[]);
      if (typeof sorted === "string") {
        return errorResponse(400, sorted);
      }
      parsed.set("folders", sorted);
    }

    // ---- S119/BT1b: the per-row guard, BEFORE any write -----------------
    // Every row must satisfy the export format's primitive-value contract
    // (a wrong type would otherwise surface as PrismaClientValidationError
    // → HTTP 500) and the files rows additionally satisfy the BR4/BS5 link
    // rules (a stored javascript: URL renders as href target=_blank in the
    // Files view — the unguarded third entry point, now guarded).
    for (const collection of parsed.keys()) {
      const rows = parsed.get(collection) as Row[];
      for (let i = 0; i < rows.length; i += 1) {
        try {
          sanitizeImportRow(collection, rows[i], i);
        } catch (err: unknown) {
          if (err instanceof ImportRowError) {
            return errorResponse(400, err.message);
          }
          throw err;
        }
      }
    }

    // ---- the all-or-nothing write --------------------------------------
    const imported: Record<string, { created: number; updated: number }> = {};
    let created = 0;
    let updated = 0;

    // S122/BW4: the documented 60 s timeout, EXPLICIT. Prisma's interactive
    // default is 5 s — a legitimate large envelope (the seam allows ~1 M-char
    // fields; many small rows) could exceed it → P2028 → the shared mapper's
    // 500, violating this route's own 400-contract for bad input (the
    // rollback itself was always correct — only the timeout was missing).
    await db.$transaction(
      async (tx) => {
      for (const collection of IMPORT_ORDER) {
        const rows = parsed.get(collection);
        if (!rows || rows.length === 0) continue;
        const model = MODEL[collection] as keyof PrismaClient;

        // tx omits $connect/$disconnect/$on/$transaction/$extends, so a
        // `keyof PrismaClient` cannot index it without a cast (the delegate
        // is used as `any` throughout — the pre-S117 shape, now explicit
        // under noImplicitAny).
        const delegate = (tx as any)[model];
        let c = 0;
        let u = 0;
        for (const row of rows) {
          const { id, ...rawFields } = row;
          const fields = stripSecrets(rawFields);
          // cards carry no userId column — ownership rides the deck relation,
          // so EVERY probe (including this write loop's findFirst, the S117
          // fix) scopes through { deck: { userId } }, exactly like the
          // knownIds loop above. Envelope userId never reaches Prisma: it is
          // stripped (NEVER_IMPORT_FIELDS) and re-attached from the session.
          const data =
            collection === "cards" ? fields : { ...fields, userId: user.id };
          const probe =
            collection === "cards"
              ? { id: id as string, deck: { userId: user.id } }
              : { id: id as string, userId: user.id };
          const mergeGuard = IMPORT_MERGE_GUARDS[collection];
          const existing = await delegate.findFirst({
            where: probe,
            select: mergeGuard ? { id: true, ...mergeGuard.select } : { id: true },
          });
          if (existing) {
            // S130/CE7: the update branch runs the merge guard against the
            // STORED partner leg (the factory's beforeWrite parity — see
            // IMPORT_MERGE_GUARDS above).
            if (mergeGuard) {
              mergeGuard.guard(existing as Row, fields as Row);
            }
            await delegate.update({ where: { id: id as string }, data });
            u += 1;
          } else {
            try {
              await delegate.create({ data: { ...data, id } as Row });
            } catch (err: unknown) {
              // S130/CE7: the concurrent-create race — the probe found no
              // row but a concurrent write minted the id between the probe
              // and the create. The throw propagates OUT of the transaction
              // (the all-or-nothing rollback holds); the route's outer
              // catch maps it to the named 409 — never the generic 500
              // (the route's 400-class contract for bad input).
              if (
                err instanceof Prisma.PrismaClientKnownRequestError &&
                err.code === "P2002"
              ) {
                const race = new Error(
                  `import-p2002:${collection}:${id}`,
                );
                race.name = "ImportConcurrentCreateError";
                throw race;
              }
              throw err;
            }
            c += 1;
          }
        }
        imported[collection] = { created: c, updated: u };
        created += c;
        updated += u;
      }

      // S127/CB19: the envelope's user profile block — the export
      // deliberately carries a hashless publicUser, and the pre-CB19
      // import silently dropped it (the ADR-019 "own your data" round-trip
      // restored content but lost the profile). The patch rides the SAME
      // all-or-nothing transaction; identity (email, name, id) never
      // rides; a garbage or absent block stays ignored.
      // S133/CH4: validateImportEnvelope proved raw is a plain object —
      // the user block reads off it directly.
      const profilePatch = importProfilePatch((raw as { user?: unknown }).user);
      if (profilePatch) {
        await tx.user.update({ where: { id: user.id }, data: profilePatch });
      }
      },
      { timeout: 60_000 },
    );

    return NextResponse.json({
      imported,
      created,
      updated,
      total: created + updated,
    });
  } catch (err: unknown) {
    // S119/BT1b: a Prisma validation error from the write loop is a
    // malformed-envelope condition (the guard above catches the known
    // shapes; anything left is an exotic field-shape mismatch) — the
    // 400-bad-input contract, never a 500.
    if (err instanceof Error && err.name === "PrismaClientValidationError") {
      return errorResponse(
        400,
        "That backup contains a row whose fields do not match the app's data model. Re-export a fresh backup and try again.",
      );
    }
    // S130/CE7: the concurrent-create race surfaced from the transaction —
    // the named 409 with the actionable message (see the write loop).
    if (err instanceof Error && err.name === "ImportConcurrentCreateError") {
      // S135/CJ5: the colon-safe parse — ids legally contain ":" and the
      // bare split(":") truncated them at the first colon.
      const { collection, id } = parseImportRaceMessage(err.message);
      // S137/CL10 (audit A-I1): the copy names BOTH collision causes —
      // the CE7 concurrent-create race AND the dominant real trigger, a
      // cross-account global-PK collision (ids are GLOBAL primary keys,
      // so a backup restored into a different account hits P2002 on the
      // first shared id — the s128 e2e comment documents exactly this).
      // The old "Re-export a fresh backup" advice could never help THAT
      // case (ids are stable by design).
      return errorResponse(
        409,
        `That ${collection} row (id "${id}") collides with an existing record — either it was created while this import ran, or this backup's ids already belong to another account. Edit the backup's ids or restore into the original account.`,
      );
    }
    return toErrorResponse(err);
  }
};

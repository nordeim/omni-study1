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
// deck relation, including the write loop's probes (the pre-S117 loop
// probed `{ id, userId }` on the flashcard delegate → PrismaClientValidationError
// → the whole transaction rolled back → HTTP 500 on ANY envelope containing
// cards — the export→import round-trip was broken for every account with
// flashcards). The body is capped at IMPORT_MAX_BYTES (413), the S23 seam's
// NEVER_IMPORT_FIELDS are stripped from every row, unknown collections are
// rejected BY NAME, and folders import parents-first (the seam's topo sort —
// a child-first hand-crafted order would die P2003 mid-transaction).
// The 10/15min per-user budget matches the spec's documented envelope.
//
// S141/CP3 (A-M3 + A-I1 — the restore-availability restructure,
// contract-preserving): the S140 shape interleaved findFirst reads and the
// notes sanitize CPU INSIDE one 60 s interactive transaction — the
// single-node SQLite RESERVED lock (journal_mode=delete, busy_timeout
// 5 000, probed) was held sitewide for the whole 2N+1-query loop, and the
// pre-flight scanned ALL 20 collections unconditionally (O(account) per
// import regardless of backup size). The S141 shape:
//   1. the IN-probe pre-flight (importProbeTargets + chunkImportIds from
//      the seam) — O(envelope) reads that yield the create/update
//      discriminator, the FK-resolution knownIds, AND the merge-guard
//      partner legs in one pass;
//   2. EVERY read + all CPU (the notes sanitize) hoisted OUT of the
//      transaction — the tx is WRITE-ONLY: per-row updates + chunked
//      createMany + the profile patch;
//   3. a cross-account collision pre-flight answers the dominant-409
//      (a global PK owned by another account) PRE-WRITE, with the named
//      copy and zero writes;
//   4. the transaction options are explicit (timeout AND maxWait — the
//      5 s default maxWait P2028s an unrelated user write at slot
//      acquisition under a concurrent restore).
// The ALL-OR-NOTHING contract is preserved (one transaction, upsert-by-id,
// never-deletes, full rollback on any throw — the e2e rollback and
// idempotence pins ride untouched). The read-hoist TOCTOU is the accepted
// equivalence class: the S140 in-tx findFirst+update pair carried the same
// concurrent-PATCH/concurrent-delete race between its own two queries
// (reads do not hold the RESERVED lock until the first write).
// ---------------------------------------------------------------------------

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import type { PrismaClient } from "@prisma/client";
import { Prisma } from "@prisma/client";

import { checkRateLimit } from "@/lib/auth";
// S133/CH4: the envelope constants moved behind the seam —
// validateImportEnvelope owns the format/version/collection identity.
// S141/CP3: the probe-set derivation + the id-chunker ride the same seam.
import {
  IMPORT_CREATE_CHUNK,
  IMPORT_FK_MAP,
  IMPORT_MAX_BYTES,
  IMPORT_ORDER,
  IMPORT_OPTIONAL_FKS,
  IMPORT_REQUIRED_FKS,
  ImportRowError,
  chunkImportIds,
  duplicateIdError,
  importProfilePatch,
  importProbeTargets,
  importRowIdError,
  importRestoreError,
  sanitizeImportRow,
  sortFoldersParentsFirst,
  stripSecrets,
  validateImportEnvelope,
} from "@/lib/data-import";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/server/auth";
// S140/CO1: the import door's note-HTML sanitizer (the raw-tx write loop
// bypasses the delegate writeTransform — see the pre-tx sanitize pass).
// S141/CP3: the pass now runs BEFORE the transaction (the CPU out of the
// lock window) on the same per-row shape.
import { sanitizeNoteHtml } from "@/lib/server/note-html";
import {
  checkEventOrderingMerge,
  checkGradeRangeMerge,
  checkTimetableOrderingMerge,
} from "@/lib/server/entities";
import {
  assertJsonContentType,
  BodyTooLargeError,
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

/** S143/CR4 — the generic-restore delegate lookup, narrowed through ONE
 * documented cast. The three call sites previously cast the client to
 * `any` inline before indexing it by the model key: Prisma's per-model
 * delegates have heterogeneous findMany/update/createMany signatures TS
 * cannot unify across the `keyof PrismaClient` union, but the generic
 * restore uses EXACTLY these three ops with Row-shaped args (the
 * dynamic-envelope design — the route's own doc block above). The
 * interface narrows the contract; the single index cast is the honest
 * boundary of the dynamic lookup (tx omits $connect/$disconnect/$on/
 * $transaction/$extends, so a `keyof PrismaClient` cannot index it
 * without a cast). The inline any-casts are gone (census-pinned). */
interface ImportDelegateOps {
  findMany(args: { where: Record<string, unknown>; select?: Record<string, unknown> }): Promise<Array<Record<string, unknown>>>;
  update(args: { where: { id: string }; data: Record<string, unknown> }): Promise<Record<string, unknown>>;
  createMany(args: { data: Array<Record<string, unknown>> }): Promise<{ count: number }>;
}

function importDelegateOps(
  client: PrismaClient | Prisma.TransactionClient,
  model: keyof PrismaClient,
): ImportDelegateOps {
  return (client as unknown as Record<string, ImportDelegateOps>)[model as string];
}

/** The ownership scope for a probe/write on a collection (cards ride the
 * deck relation — the S117 fix's scope, applied at every query site). */
function ownershipScope(collection: Collection, userId: string): Row {
  return collection === "cards" ? { deck: { userId } } : { userId };
}

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

    // ---- the IMPORT_MAX_BYTES body cap (S117/BR1 — the documented 413
    // contract; the cap's full 10 → 25 → 64 MiB history and arithmetic
    // live at the seam's own doc block — the size is never re-stated
    // here, S138/CM5's machine census holds every other site to that) ------
    // S119/BT2: the capped read now walks the stream chunk-by-chunk (the
    // declared-length pre-read lives inside readBodyCapped) so a chunked
    // body is counted AS it is read, never buffered past the cap.
    let text: string;
    try {
      text = await readBodyCapped(request, IMPORT_MAX_BYTES);
    } catch (err: unknown) {
      // S139/CN6 (audit A-L1): discriminate the TYPED over-cap error from
      // transport failures — the bare catch answered a confident 413 for
      // ANY read failure (a client abort mid-stream or a proxy hiccup is
      // not "too large", and the size-remediation advice cannot help it).
      // Only the genuine BodyTooLargeError (S129/CD4's typed seam class)
      // answers 413; everything else propagates to the honest 500 handler.
      if (err instanceof BodyTooLargeError) {
        return errorResponse(
          413,
          `That backup is too large. The import cap is ${IMPORT_MAX_BYTES / (1024 * 1024)} MiB.`,
        );
      }
      throw err;
    }
    let raw: unknown;
    try {
      raw = text.length === 0 ? null : (JSON.parse(text) as unknown);
    } catch {
      raw = null;
    }

    // ---- S133/CH4: the stateless envelope stages ride the SEAM -------------
    const envelopeCheck = validateImportEnvelope(raw);
    if (!envelopeCheck.ok) {
      return errorResponse(400, envelopeCheck.error);
    }
    const data = envelopeCheck.data;

    // ---- per-collection validation -------------------------------------
    // S126/CA2: the row-id rule rides the SEAM's shared validator, and a
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

    // ---- S141/CP3: the IN-probe pre-flight (A-I1 closed) ------------------
    // Replaces the S140 20-unconditional-full-table-scan loop. The probe set
    // is FK-AWARE (importProbeTargets from the seam — a cards-only envelope
    // still probes decks for the required-FK resolution; folders
    // self-parenting rides the same derivation). Per target collection the
    // probe ids are: the envelope's own rows' ids (the create/update
    // discriminator + the merge-guard partner legs) ∪ the FK values other
    // collections reference (the FK-resolution census) — every consumer of
    // the old full-table knownIds reads only FK-field values from envelope
    // rows, so the IN-probe on exactly those values is equivalent.
    const knownIds = new Map<Collection, Set<string>>();
    // S135/CJ4: existingIds keeps the DB-ONLY half of the census — knownIds
    // unions the envelope's own ids (the FK-resolution contract), which
    // would make every imported row look "existing" to a create-branch
    // discriminator.
    const existingIds = new Map<Collection, Set<string>>();
    // The merge-guard partner legs for the UPDATE set (the S130/CE7 seam
    // guards — hoisted out of the transaction with every other read).
    const guardLegs = new Map<Collection, Map<string, Row>>();

    // The referenced FK values per target (collected BEFORE resolution —
    // the resolution consumes the probe results). The "self" target form
    // (folders.parentId → folders) mirrors the resolution loop's shape.
    const referencedIds = new Map<Collection, Set<string>>();
    for (const [source, specs] of Object.entries(IMPORT_FK_MAP) as [
      Collection,
      Array<{ field: string; target: Collection }>,
    ][]) {
      for (const row of parsed.get(source) ?? []) {
        for (const { field, target } of specs) {
          const value = row[field];
          if (typeof value !== "string") continue;
          const targetCollection = target === source ? source : target;
          let bucket = referencedIds.get(targetCollection);
          if (!bucket) {
            bucket = new Set<string>();
            referencedIds.set(targetCollection, bucket);
          }
          bucket.add(value);
        }
      }
    }

    for (const collection of importProbeTargets([...parsed.keys()])) {
      const model = MODEL[collection];
      const scope = ownershipScope(collection, user.id);
      const mergeGuard = IMPORT_MERGE_GUARDS[collection];
      const select: Row = mergeGuard ? { id: true, ...mergeGuard.select } : { id: true };

      const ids = new Set<string>(referencedIds.get(collection) ?? []);
      if (parsed.has(collection)) {
        for (const row of parsed.get(collection) as Row[]) ids.add(row.id as string);
      }

      const dbIds = new Set<string>();
      const legs = new Map<string, Row>();
      // The deck-scoped cards probe (the S117 scope) applies here too.
      const delegate = importDelegateOps(db, model);
      for (const chunk of chunkImportIds([...ids])) {
        const found = await delegate.findMany({
          where: { id: { in: chunk }, ...scope },
          select,
        });
        for (const row of found as Row[]) {
          dbIds.add(row.id as string);
          legs.set(row.id as string, row);
        }
      }
      // knownIds = the envelope's own ids ∪ the probed referenced-existing
      // rows (the account-aware resolution contract, at O(envelope) cost).
      const union = new Set<string>(dbIds);
      for (const row of parsed.get(collection) ?? []) union.add(row.id as string);
      knownIds.set(collection, union);
      existingIds.set(collection, dbIds);
      if (mergeGuard) guardLegs.set(collection, legs);
    }

    // FK integrity: required → 400; optional → nulled.
    // S135/CJ4 (audit A-L2): the missing-on-CREATE case joins the named-400
    // family — the seam rejects null/non-string required values, and
    // undefined (absent) is the UPDATE branch's untouched case; but a NEW
    // row (id not in existingIds — the DB-only census) without its
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

    // ---- S119/BT1b: the per-row guard, BEFORE any write -----------------
    // S139/CN7 (audit A-L2): this loop runs BEFORE the folders topo sort
    // below — the rejection copy names the row index, and the sort reorders
    // rows (an operator editing per the message landed on the wrong line).
    // sanitizeImportRow is VERIFIED validate-only (no row mutation).
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

    // ---- S141/CP3: the pre-tx payload preparation -------------------------
    // Every read and every CPU-bound pass now happens BEFORE the transaction
    // (the lock window holds writes only). This stage derives, per
    // collection: the update set (id ∈ existingIds — the probe's DB-only
    // census) and the create set (id ∉ existingIds), with the exact write
    // payloads (stripSecrets + the userId re-attach + the S140/CO1 notes
    // sanitize — the raw-tx write loop bypasses the delegate writeTransform,
    // so this is the import door's one server-side write seam) and the
    // S130/CE7 merge guards against the probe's stored partner legs (the
    // factory's beforeWrite parity — TOCTOU-equivalent to the S140 in-tx
    // read: reads never held the RESERVED lock before the first write
    // either).
    type WritePlan = { updates: Array<{ id: string; data: Row }>; creates: Row[] };
    const plans = new Map<Collection, WritePlan>();
    for (const collection of IMPORT_ORDER) {
      const rows = parsed.get(collection);
      if (!rows || rows.length === 0) continue;
      const mergeGuard = IMPORT_MERGE_GUARDS[collection];
      const legs = guardLegs.get(collection);
      const plan: WritePlan = { updates: [], creates: [] };
      for (const row of rows) {
        const { id, ...rawFields } = row;
        const fields = stripSecrets(rawFields);
        // S141/CP3: the pre-tx notes sanitize pass (the S140/CO1 door —
        // moved OUT of the transaction: sanitize-html's parse+serialize on
        // up-to-1 M-char bodies is pure CPU that previously lengthened the
        // SQLite RESERVED-lock window without issuing a single query).
        if (
          collection === "notes" &&
          typeof fields.content === "string" &&
          fields.content !== ""
        ) {
          fields.content = sanitizeNoteHtml(fields.content);
        }
        // cards carry no userId column — ownership rides the deck relation;
        // envelope userId never reaches Prisma: it is stripped
        // (NEVER_IMPORT_FIELDS) and re-attached from the session.
        const data =
          collection === "cards" ? fields : { ...fields, userId: user.id };
        const existing = existingIds.get(collection)?.has(id as string);
        if (existing) {
          // S130/CE7: the update branch runs the merge guard against the
          // STORED partner leg (the probe's select — the hoisted read).
          if (mergeGuard) {
            const leg = legs?.get(id as string);
            if (leg) mergeGuard.guard(leg, data);
          }
          plan.updates.push({ id: id as string, data });
        } else {
          plan.creates.push({ ...data, id } as Row);
        }
      }
      plans.set(collection, plan);
    }

    // ---- S141/CP3: the cross-account collision pre-flight -----------------
    // ids are GLOBAL primary keys: the DOMINANT 409 trigger is a backup
    // restored into a different account colliding on the first shared id
    // (the s128 e2e comment documents exactly this). The S140 shape burned
    // the whole transaction to the P2002 and answered post-rollback; the
    // pre-flight answers the SAME named copy PRE-WRITE (zero writes, no
    // 60 s budget burned). The residual CE7 concurrent-create race (a write
    // landing between the probe and the transaction) still rides the P2002
    // catch below — the all-or-nothing rollback holds either way.
    for (const [collection, plan] of plans) {
      if (plan.creates.length === 0) continue;
      const model = MODEL[collection];
      const delegate = importDelegateOps(db, model);
      for (const chunk of chunkImportIds(plan.creates.map((r) => r.id as string))) {
        // Unscoped by ownership — ANY owner of the id blocks the create
        // (the global-PK collision); the S135/CJ5 copy names both causes.
        const collisions = await delegate.findMany({
          where: { id: { in: chunk } },
          select: { id: true },
        });
        for (const hit of collisions as Row[]) {
          return errorResponse(
            409,
            `That ${collection} row (id "${hit.id as string}") collides with an existing record — either it was created while this import ran, or this backup's ids already belong to another account. Edit the backup's ids or restore into the original account.`,
          );
        }
      }
    }

    // ---- the all-or-nothing write (WRITE-ONLY since S141/CP3) ------------
    const imported: Record<string, { created: number; updated: number }> = {};
    let created = 0;
    let updated = 0;

    // S122/BW4: the documented 60 s timeout, EXPLICIT (Prisma's interactive
    // default is 5 s). S141/CP3: maxWait is now EXPLICIT too — the 2 s
    // default P2028s an unrelated user write at transaction-slot
    // acquisition under a concurrent restore (census-pinned as a pair).
    // S138/CM4: the shared mapper's P2028 copy went SOURCE-NEUTRAL — THIS
    // route's catch owns the backup-specific remedy below.
    await db.$transaction(
      async (tx) => {
      for (const collection of IMPORT_ORDER) {
        const plan = plans.get(collection);
        if (!plan) continue;
        const model = MODEL[collection] as keyof PrismaClient;

        // tx omits $connect/$disconnect/$on/$transaction/$extends, so a
        // `keyof PrismaClient` cannot index it without a cast (the delegate
        // is used as `any` throughout — the pre-S117 shape, now explicit
        // under noImplicitAny).
        const delegate = importDelegateOps(tx, model);
        let c = 0;
        let u = 0;

        // The UPDATE set: per-row writes (Prisma has no bulk
        // distinct-payload update; the probe-hoist already removed the
        // per-row findFirst read — these are fast indexed-PK writes with
        // zero read-awaits inside the lock window).
        for (const { id, data } of plan.updates) {
          await delegate.update({ where: { id }, data });
          u += 1;
        }

        // The CREATE set: chunked createMany (IMPORT_CREATE_CHUNK rows per
        // call — the 32 766-parameter ceiling verified empirically at 5 000+
        // params; folders' parents-first order is preserved within the
        // chunk array — SQLite checks FKs per statement row).
        for (let i = 0; i < plan.creates.length; i += IMPORT_CREATE_CHUNK) {
          const chunkRows = plan.creates.slice(i, i + IMPORT_CREATE_CHUNK);
          try {
            await delegate.createMany({ data: chunkRows });
          } catch (err: unknown) {
            // S130/CE7 residual + the pre-flight's after-guard race: a
            // concurrent write minted an id between the probe and this
            // create. The throw propagates OUT of the transaction (the
            // all-or-nothing rollback holds); the route's outer catch maps
            // it to the named 409 family — never the generic 500.
            if (
              err instanceof Prisma.PrismaClientKnownRequestError &&
              err.code === "P2002"
            ) {
              const race = new Error(
                `import-p2002:${collection}:bulk`,
              );
              race.name = "ImportConcurrentCreateError";
              throw race;
            }
            throw err;
          }
          c += chunkRows.length;
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
      const profilePatch = importProfilePatch((raw as { user?: unknown }).user);
      if (profilePatch) {
        await tx.user.update({ where: { id: user.id }, data: profilePatch });
      }
      },
      { timeout: 60_000, maxWait: 5_000 },
    );

    return NextResponse.json({
      imported,
      created,
      updated,
      total: created + updated,
    });
  } catch (err: unknown) {
    // S143/CR6 (audit A-M1): the catch's four named legs (BT1b
    // PrismaClientValidationError→400, the CE7/CJ5 concurrent-create
    // 409 pair, the CL10/CM4 P2028→413, the CQ4 P2025→409) extracted to
    // the PURE importRestoreError seam in src/lib/data-import.ts —
    // unit-pinned BEHAVIORALLY now (the source-text censuses were the
    // only pins pre-CR6; a leg reordering that shadowed P2025 passed
    // green). The seam returns null for the shared-mapper families —
    // toErrorResponse stays the single source for those.
    const named = importRestoreError(err);
    if (named !== null) {
      return errorResponse(named.status, named.message);
    }
    return toErrorResponse(err);
  }
};

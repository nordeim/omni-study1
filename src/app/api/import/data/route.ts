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

import { checkRateLimit } from "@/lib/auth";
import { DATA_EXPORT_FORMAT, DATA_EXPORT_VERSION, EXPORT_COLLECTIONS } from "@/lib/data-export";
import {
  IMPORT_MAX_BYTES,
  ImportRowError,
  NEVER_IMPORT_FIELDS,
  sanitizeImportRow,
  sortFoldersParentsFirst,
} from "@/lib/data-import";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/server/auth";
import {
  assertJsonContentType,
  errorResponse,
  rateLimitedResponse,
  readBodyCapped,
  toErrorResponse,
} from "@/lib/server/http";

type Row = Record<string, unknown>;

/** Restore order: referents before referees (folders before files, decks
 * before cards, subjects before everything subject-tagged). */
const IMPORT_ORDER = [
  "subjects",
  "taskLists",
  "folders",
  "notebooks",
  "decks",
  "tasks",
  "assignments",
  "exams",
  "events",
  "timetableClasses",
  "notes",
  "cards",
  "practiceTests",
  "studyGroups",
  "grades",
  "focusSessions",
  "files",
  "chatMessages",
  "calcHistory",
  "holidays",
] as const;

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

/** REQUIRED FKs — a dangling reference is a 400 (the row cannot exist). */
const REQUIRED_FKS: Partial<Record<Collection, Record<string, Collection>>> = {
  cards: { deckId: "decks" },
};

/** OPTIONAL FKs — a dangling reference imports NULLED (SetNull semantics). */
const OPTIONAL_FKS: Partial<Record<Collection, Record<string, Collection | "self">>> = {
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
};

/** The import-side secret guard (the S23 seam's list): the file never speaks
 * for the account — passwordHash and userId are stripped from every row
 * (the importer's own id is re-attached by the route, never by the file). */
function stripNeverImportFields(row: Row): Row {
  const out: Row = {};
  for (const [key, value] of Object.entries(row)) {
    if ((NEVER_IMPORT_FIELDS as readonly string[]).includes(key)) continue;
    out[key] = value;
  }
  return out;
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

    // ---- the 10 MiB body cap (S117/BR1 — the documented 413 contract) ------
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
    if (typeof raw !== "object" || raw === null) {
      return errorResponse(400, `Expected a ${DATA_EXPORT_FORMAT} envelope.`);
    }
    const envelope = raw as {
      format?: unknown;
      version?: unknown;
      data?: unknown;
    };

    // Format identity.
    if (envelope.format !== DATA_EXPORT_FORMAT) {
      return errorResponse(
        400,
        `Unrecognized export format — expected "${DATA_EXPORT_FORMAT}".`,
      );
    }

    // Version floor + ceiling (S117/BR1 — the floor restored with the seam's copy).
    if (
      typeof envelope.version !== "number" ||
      !Number.isInteger(envelope.version) ||
      envelope.version > DATA_EXPORT_VERSION
    ) {
      return errorResponse(
        400,
        `This export was written by a newer version of StudyFlow (version ${String(
          envelope.version,
        )} > ${DATA_EXPORT_VERSION}). Update the app before restoring it.`,
      );
    }
    if (envelope.version < DATA_EXPORT_VERSION) {
      return errorResponse(
        400,
        `This export is from an unsupported older version (v${String(envelope.version)}).`,
      );
    }

    if (typeof envelope.data !== "object" || envelope.data === null) {
      return errorResponse(400, "The envelope carries no data object.");
    }
    const data = envelope.data as Record<string, unknown>;

    // Unknown collections are rejected BY NAME (S117/BR1 — the seam's copy).
    const knownCollections = new Set<string>(EXPORT_COLLECTIONS);
    for (const key of Object.keys(data)) {
      if (!knownCollections.has(key)) {
        return errorResponse(
          400,
          `Unknown collection "${key}" in the export file. This app imports exactly: ${EXPORT_COLLECTIONS.join(", ")}.`,
        );
      }
    }

    // ---- per-collection validation -------------------------------------
    const parsed = new Map<Collection, Row[]>();
    for (const collection of IMPORT_ORDER) {
      const rows = data[collection];
      if (rows === undefined || rows === null) continue;
      if (!Array.isArray(rows)) {
        return errorResponse(400, `The "${collection}" collection must be an array.`);
      }
      const seen = new Set<string>();
      for (const row of rows) {
        if (typeof row !== "object" || row === null || typeof (row as Row).id !== "string") {
          return errorResponse(400, `Every "${collection}" row needs a string id.`);
        }
        const id = (row as Row).id as string;
        if (seen.has(id)) {
          return errorResponse(
            400,
            `${collection}: duplicate id "${id}" — every row needs a unique id.`,
          );
        }
        seen.add(id);
      }
      parsed.set(collection, rows as Row[]);
    }

    // Known ids per collection = imported ids ∪ the owner's existing rows.
    const knownIds = new Map<Collection, Set<string>>();
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
      for (const row of existing) ids.add(row.id);
      knownIds.set(collection, ids);
    }

    // FK integrity: required → 400; optional → nulled.
    for (const [collection, fks] of Object.entries(REQUIRED_FKS) as [
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
        }
      }
    }
    for (const [collection, fks] of Object.entries(OPTIONAL_FKS) as [
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

    await db.$transaction(async (tx) => {
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
          const fields = stripNeverImportFields(rawFields);
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
          const existing = await delegate.findFirst({
            where: probe,
            select: { id: true },
          });
          if (existing) {
            await delegate.update({ where: { id: id as string }, data });
            u += 1;
          } else {
            await delegate.create({ data: { ...data, id } as Row });
            c += 1;
          }
        }
        imported[collection] = { created: c, updated: u };
        created += c;
        updated += u;
      }
    });

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
    return toErrorResponse(err);
  }
};

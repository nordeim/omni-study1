// ---------------------------------------------------------------------------
// POST /api/import/data — the data import / restore (S23/ADR-019). The exact
// inverse of GET /api/export/data: the versioned envelope validates (format
// identity, version ceiling, duplicate ids, FK integrity), then every row
// upserts BY ID inside ONE transaction — an import never duplicates and
// never deletes, and a rejected envelope rolls back completely.
//
// FK semantics: a dangling OPTIONAL FK imports NULLED (the SetNull family);
// a dangling REQUIRED FK (cards.deckId) is a 400 with the actionable
// collection.field message. The 10/15min per-user budget matches the spec's
// documented 8-POST envelope.
// ---------------------------------------------------------------------------

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import type { PrismaClient } from "@prisma/client";

import { checkRateLimit } from "@/lib/auth";
import { DATA_EXPORT_FORMAT, DATA_EXPORT_VERSION } from "@/lib/data-export";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/server/auth";
import {
  errorResponse,
  rateLimitedResponse,
  toErrorResponse,
} from "@/lib/server/http";

type Row = Record<string, unknown>;

/** Restore order: referents before referees (folders before files, decks
 *  before cards, subjects before everything subject-tagged). */
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

export const POST = async (request: NextRequest) => {
  try {
    const user = await requireUser();

    const limit = checkRateLimit(`import:${user.id}`, 10);
    if (!limit.ok) {
      return rateLimitedResponse(limit.retryAfterSec, "Too many import attempts");
    }

    const raw: unknown = await request.json().catch(() => null);
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

    // Version ceiling.
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

    if (typeof envelope.data !== "object" || envelope.data === null) {
      return errorResponse(400, "The envelope carries no data object.");
    }
    const data = envelope.data as Record<string, unknown>;

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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

    // ---- the all-or-nothing write --------------------------------------
    const imported: Record<string, { created: number; updated: number }> = {};
    let created = 0;
    let updated = 0;

    await db.$transaction(async (tx) => {
      for (const collection of IMPORT_ORDER) {
        const rows = parsed.get(collection);
        if (!rows || rows.length === 0) continue;
        const model = MODEL[collection] as keyof PrismaClient;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const delegate = tx[model] as any;
        let c = 0;
        let u = 0;
        for (const row of rows) {
          const { id, ...fields } = row;
          // cards carry no userId column — deckId ownership is validated
          // against the user's decks above (transitive).
          const data = (
            collection === "cards" ? fields : { ...fields, userId: user.id }
          ) as Row;
          const existing = await delegate.findFirst({
            where: { id: id as string, userId: user.id },
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
    return toErrorResponse(err);
  }
};

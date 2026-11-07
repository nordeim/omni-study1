// ---------------------------------------------------------------------------
// S141/CP4 — the shared export assembly seam (the BW8 single-source
// doctrine applied to the export surface). The route (the download) and
// the /export page (the size signal) both ride renderExportEnvelope: one
// source, two consumers — the download and the warning can never drift.
//
// S156/DE1 — the streaming re-architecture (the I-A peak-memory fix;
// docs/remediation-plan-session156.md §2). The S140-S155 form read all 20
// collections through one Promise.all, built the full envelope object,
// and JSON.stringify'd it whole — every term simultaneously live (all 20
// row sets + the normalized copy + the whole-body string + the byte-size
// encode ≈ 3-4x the serialized body), with the 256 MiB gate firing only
// AFTER the peak. THIS form is the thin server wiring around the pure
// driver (data-export.ts buildExportFragments): the READERS map below +
// the delegate. The driver reads the collections SEQUENTIALLY (one
// collection's rows in memory at a time), serializes per-row through the
// same normalizer, counts per-fragment, retains while at-or-under the
// ceiling, and throws the typed error with the exact total — the
// byte-identity with the object form is pinned by the unit oracle
// (tests/data-export.test.ts), and the wire is pinned by the s21 raw-body
// leg + the s14/S139-CN2 live round-trip.
//
// Read-skew honesty (the accepted F3 class, MEASURED at S157/DF2): the
// sequential reads stretch the cross-collection skew window from ~the
// Promise.all spread to ~the serialization duration (seconds for a large
// account). The export never writes; the envelope's internal counts/data
// stay consistent by construction (both derive from the same per-collection
// arrays); and the import resolves FKs against envelope ∪ owned-existing
// rows (the S117 e2e-proven tolerance — a fresh-account restore answers
// the actionable required-FK 400 on the hard edge). A $transaction
// snapshot was the recorded F3 candidate and is REJECTED ON MEASUREMENT
// (S157/DF2, scripts/measure-export-lock-s157.mjs — the throwaway-db
// lock probe): an open read $transaction delays every concurrent
// writer's COMMIT by the full read+serialize window (measured: a 2435 ms
// wait against a 2500 ms hold; a 1332 ms wait in the 20-read export
// rehearsal — the journal_mode=delete SHARED-blocks-EXCLUSIVE-commit
// tail), and past the 5 s busy_timeout concurrent writes fail outright
// (SQLITE_BUSY → P2028) — exactly the large accounts the snapshot would
// serve. The skew class stays accepted-and-documented (the
// honest-failing posture); S157/DF1 additionally eliminated the
// PAGE-INTERNAL skew component (the /export grid now derives from the
// envelope's own counts — one read pass).
//
// Cost honesty (unchanged): the page renders the envelope per view — the
// same work the download does, on a linked-from-nowhere owner surface;
// the export: rate limit does NOT apply to the page (the budget guards
// the route's network egress; the page rides its own exportPage: key).
// ---------------------------------------------------------------------------

import { db } from "@/lib/db";
import { publicUser } from "@/lib/server/auth";
import {
  buildExportFragments,
  type ExportCollection,
  type ExportRow,
  type RenderedExport,
} from "@/lib/data-export";

export type { RenderedExport };

export type ExportUser = Awaited<ReturnType<typeof publicUser>>;

// S156/DE1: the 20 collection readers — userId-scoped, chronological (the
// S140 order contract: createdAt asc, id asc), cards deck-scoped
// (Flashcard has NO userId — the deck relation scopes it). The
// Record<ExportCollection, …> key type makes an omitted collection a
// COMPILE error (stronger than the old destructuring literal), and the
// exactly-20 findMany census (script-conventions) survives verbatim.
// Each reader's result set lives only for its own driver turn — the
// one-collection-at-a-time mechanism (the I-A fix).
const READERS: Record<ExportCollection, (userId: string) => Promise<ExportRow[]>> = {
  subjects: (userId) => db.subject.findMany({ where: { userId }, orderBy: [{ createdAt: "asc" }, { id: "asc" }] }),
  taskLists: (userId) => db.taskList.findMany({ where: { userId }, orderBy: [{ createdAt: "asc" }, { id: "asc" }] }),
  tasks: (userId) => db.task.findMany({ where: { userId }, orderBy: [{ createdAt: "asc" }, { id: "asc" }] }),
  assignments: (userId) => db.assignment.findMany({ where: { userId }, orderBy: [{ createdAt: "asc" }, { id: "asc" }] }),
  exams: (userId) => db.exam.findMany({ where: { userId }, orderBy: [{ createdAt: "asc" }, { id: "asc" }] }),
  events: (userId) => db.event.findMany({ where: { userId }, orderBy: [{ createdAt: "asc" }, { id: "asc" }] }),
  timetableClasses: (userId) => db.timetableClass.findMany({ where: { userId }, orderBy: [{ createdAt: "asc" }, { id: "asc" }] }),
  notebooks: (userId) => db.notebook.findMany({ where: { userId }, orderBy: [{ createdAt: "asc" }, { id: "asc" }] }),
  notes: (userId) => db.note.findMany({ where: { userId }, orderBy: [{ createdAt: "asc" }, { id: "asc" }] }),
  decks: (userId) => db.flashcardDeck.findMany({ where: { userId }, orderBy: [{ createdAt: "asc" }, { id: "asc" }] }),
  cards: (userId) => db.flashcard.findMany({ where: { deck: { userId } }, orderBy: [{ createdAt: "asc" }, { id: "asc" }] }),
  practiceTests: (userId) => db.practiceTest.findMany({ where: { userId }, orderBy: [{ createdAt: "asc" }, { id: "asc" }] }),
  studyGroups: (userId) => db.studyGroup.findMany({ where: { userId }, orderBy: [{ createdAt: "asc" }, { id: "asc" }] }),
  grades: (userId) => db.grade.findMany({ where: { userId }, orderBy: [{ createdAt: "asc" }, { id: "asc" }] }),
  focusSessions: (userId) => db.focusSession.findMany({ where: { userId }, orderBy: [{ createdAt: "asc" }, { id: "asc" }] }),
  folders: (userId) => db.fileFolder.findMany({ where: { userId }, orderBy: [{ createdAt: "asc" }, { id: "asc" }] }),
  files: (userId) => db.fileItem.findMany({ where: { userId }, orderBy: [{ createdAt: "asc" }, { id: "asc" }] }),
  chatMessages: (userId) => db.aiChatMessage.findMany({ where: { userId }, orderBy: [{ createdAt: "asc" }, { id: "asc" }] }),
  calcHistory: (userId) => db.calculatorHistoryEntry.findMany({ where: { userId }, orderBy: [{ createdAt: "asc" }, { id: "asc" }] }),
  holidays: (userId) => db.holiday.findMany({ where: { userId }, orderBy: [{ createdAt: "asc" }, { id: "asc" }] }),
};

/** Read the 20 collections (userId-scoped, chronological; cards scoped
 * through their deck), assemble the versioned envelope as ordered
 * fragments, and answer the exact UTF-8 byte total. S141/CP4: the CALLER
 * owns auth (the route's requireUser + budget check; the page's
 * getCurrentUser + redirect gate) — the seam never re-authenticates, so
 * the S140 route's requireUser → limiter ordering is preserved
 * byte-for-byte. S156/DE1: the assembly + the ceiling gate live in the
 * pure driver (data-export.ts buildExportFragments — unit-oracle-welded
 * to buildDataExport); the route streams the fragments as the response
 * body; the page reads `bytes` for the size signal. */
export async function renderExportEnvelope(user: ExportUser): Promise<RenderedExport> {
  return buildExportFragments(
    user,
    (collection) => READERS[collection](user.id),
    new Date(),
  );
}

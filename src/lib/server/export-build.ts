// ---------------------------------------------------------------------------
// S141/CP4 — the shared export assembly seam (the BW8 single-source
// doctrine applied to the export surface). The S140 route carried the 20
// parallel findMany reads + the buildDataExport assembly + the
// JSON.stringify inline; the /export page (the owner surface) needs the
// SAME work to answer one question the download cannot: how big is the
// envelope (the export/import asymmetry's detection half — an export
// past IMPORT_MAX_BYTES can never be restored in-app, and the panel now
// warns BEFORE the user learns it by a 413). Extracting the assembly
// verbatim means the route (the download) and the page (the size signal)
// can never drift: one source, two consumers.
//
// Cost honesty: the page now renders the envelope per view — the same
// work the download already does, on a linked-from-nowhere owner surface
// that already runs 20 count queries per view. Accepted and documented
// (the streaming half of the asymmetry stays deferred with the A-M3
// stage-2 family — reads hold no SQLite write lock, so the page's cost
// is CPU/memory only, and the export: rate limit does NOT apply to the
// page — the budget guards the route's network egress).
// ---------------------------------------------------------------------------

import { db } from "@/lib/db";
import { publicUser } from "@/lib/server/auth";
import { buildDataExport } from "@/lib/data-export";

export type ExportUser = Awaited<ReturnType<typeof publicUser>>;

export type RenderedExport = {
  /** The serialized envelope — byte-identical to the route's response body. */
  json: string;
};

/** Read all 20 collections (userId-scoped, chronological; cards scoped
 * through their deck), assemble the versioned envelope, serialize it.
 * S141/CP4: the CALLER owns auth (the route's requireUser + budget check;
 * the page's getCurrentUser + redirect gate) — the seam never
 * re-authenticates, so the S140 route's requireUser → limiter ordering is
 * preserved byte-for-byte. The route answers `json` as the download; the
 * /export page reads `json.length` for the size signal. */
export async function renderExportEnvelope(user: ExportUser): Promise<RenderedExport> {

  const [
    subjects,
    taskLists,
    tasks,
    assignments,
    exams,
    events,
    timetableClasses,
    notebooks,
    notes,
    decks,
    cards,
    practiceTests,
    studyGroups,
    grades,
    focusSessions,
    folders,
    files,
    chatMessages,
    calcHistory,
    holidays,
  ] = await Promise.all([
    db.subject.findMany({ where: { userId: user.id }, orderBy: [{ createdAt: "asc" }, { id: "asc" }] }),
    db.taskList.findMany({ where: { userId: user.id }, orderBy: [{ createdAt: "asc" }, { id: "asc" }] }),
    db.task.findMany({ where: { userId: user.id }, orderBy: [{ createdAt: "asc" }, { id: "asc" }] }),
    db.assignment.findMany({ where: { userId: user.id }, orderBy: [{ createdAt: "asc" }, { id: "asc" }] }),
    db.exam.findMany({ where: { userId: user.id }, orderBy: [{ createdAt: "asc" }, { id: "asc" }] }),
    db.event.findMany({ where: { userId: user.id }, orderBy: [{ createdAt: "asc" }, { id: "asc" }] }),
    db.timetableClass.findMany({ where: { userId: user.id }, orderBy: [{ createdAt: "asc" }, { id: "asc" }] }),
    db.notebook.findMany({ where: { userId: user.id }, orderBy: [{ createdAt: "asc" }, { id: "asc" }] }),
    db.note.findMany({ where: { userId: user.id }, orderBy: [{ createdAt: "asc" }, { id: "asc" }] }),
    db.flashcardDeck.findMany({ where: { userId: user.id }, orderBy: [{ createdAt: "asc" }, { id: "asc" }] }),
    // Flashcard has NO userId — the deck relation scopes it.
    db.flashcard.findMany({
      where: { deck: { userId: user.id } },
      orderBy: [{ createdAt: "asc" }, { id: "asc" }],
    }),
    db.practiceTest.findMany({ where: { userId: user.id }, orderBy: [{ createdAt: "asc" }, { id: "asc" }] }),
    db.studyGroup.findMany({ where: { userId: user.id }, orderBy: [{ createdAt: "asc" }, { id: "asc" }] }),
    db.grade.findMany({ where: { userId: user.id }, orderBy: [{ createdAt: "asc" }, { id: "asc" }] }),
    db.focusSession.findMany({ where: { userId: user.id }, orderBy: [{ createdAt: "asc" }, { id: "asc" }] }),
    db.fileFolder.findMany({ where: { userId: user.id }, orderBy: [{ createdAt: "asc" }, { id: "asc" }] }),
    db.fileItem.findMany({ where: { userId: user.id }, orderBy: [{ createdAt: "asc" }, { id: "asc" }] }),
    db.aiChatMessage.findMany({ where: { userId: user.id }, orderBy: [{ createdAt: "asc" }, { id: "asc" }] }),
    db.calculatorHistoryEntry.findMany({ where: { userId: user.id }, orderBy: [{ createdAt: "asc" }, { id: "asc" }] }),
    db.holiday.findMany({ where: { userId: user.id }, orderBy: [{ createdAt: "asc" }, { id: "asc" }] }),
  ]);

  const envelope = buildDataExport(
    user,
    {
      subjects,
      taskLists,
      tasks,
      assignments,
      exams,
      events,
      timetableClasses,
      notebooks,
      notes,
      decks,
      cards,
      practiceTests,
      studyGroups,
      grades,
      focusSessions,
      folders,
      files,
      chatMessages,
      calcHistory,
      holidays,
    },
    new Date(),
  );

  return { json: JSON.stringify(envelope) };
}

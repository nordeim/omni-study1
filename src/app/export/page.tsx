import type { Metadata } from "next";

import { redirect } from "next/navigation";

import { ExportPanel } from "@/components/export/export-panel";
import { db } from "@/lib/db";
import { getCurrentUser, publicUser } from "@/lib/server/auth";
import { renderExportEnvelope } from "@/lib/server/export-build";

export const metadata: Metadata = { title: "Export Your Data" };

// The /export gate (ADR-019): a SERVER component — an anonymous visit
// redirects to /login and never renders panel chrome. Linked from nowhere
// by design (the zero-nav-linkage guard); owners navigate directly.
export default async function ExportPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  // The count grid is server-rendered from the owner's live rows.
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
    db.subject.count({ where: { userId: user.id } }),
    db.taskList.count({ where: { userId: user.id } }),
    db.task.count({ where: { userId: user.id } }),
    db.assignment.count({ where: { userId: user.id } }),
    db.exam.count({ where: { userId: user.id } }),
    db.event.count({ where: { userId: user.id } }),
    db.timetableClass.count({ where: { userId: user.id } }),
    db.notebook.count({ where: { userId: user.id } }),
    db.note.count({ where: { userId: user.id } }),
    db.flashcardDeck.count({ where: { userId: user.id } }),
    db.flashcard.count({ where: { deck: { userId: user.id } } }),
    db.practiceTest.count({ where: { userId: user.id } }),
    db.studyGroup.count({ where: { userId: user.id } }),
    db.grade.count({ where: { userId: user.id } }),
    db.focusSession.count({ where: { userId: user.id } }),
    db.fileFolder.count({ where: { userId: user.id } }),
    db.fileItem.count({ where: { userId: user.id } }),
    db.aiChatMessage.count({ where: { userId: user.id } }),
    db.calculatorHistoryEntry.count({ where: { userId: user.id } }),
    db.holiday.count({ where: { userId: user.id } }),
  ]);

  const counts = {
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
  };

  // S141/CP4: the size signal — the page renders the SAME envelope the
  // download answers (the shared export-build seam), so the panel's warning
  // can never drift from what the route actually serves. Cost honesty: this
  // doubles the page's per-view work (the counts above + the full envelope
  // assembly) on the linked-from-nowhere owner surface; accepted (the
  // asymmetry's detection half — an export past the restore cap must be
  // knowable BEFORE the user collects a 413 on restore, and each blind
  // retry burns import budget).
  const { bytes } = await renderExportEnvelope(publicUser(user));
  const exportBytes = bytes;

  return (
    <main className="mx-auto w-full max-w-3xl p-6 pt-10">
      <ExportPanel
        counts={Object.entries(counts).map(([name, count]) => ({ name, count }))}
        email={user.email}
        exportBytes={exportBytes}
      />
    </main>
  );
}

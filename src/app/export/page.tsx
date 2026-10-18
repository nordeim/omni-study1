import type { Metadata } from "next";

import { redirect } from "next/navigation";

import { ExportPanel } from "@/components/export/export-panel";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/server/auth";

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

  return (
    <main className="mx-auto w-full max-w-3xl p-6 pt-10">
      <ExportPanel
        counts={Object.entries(counts).map(([name, count]) => ({ name, count }))}
        email={user.email}
      />
    </main>
  );
}

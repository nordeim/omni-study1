// ---------------------------------------------------------------------------
// GET /api/export/data — the full-data export (S21/ADR-019). The 20 content
// collections read in parallel (userId-scoped, chronological; cards scoped
// through their deck), assembled by the pure data-export seam into the
// versioned envelope, answered as a JSON attachment under the S13/S14
// download contract. The user block comes from requireUser's hashless
// session select — passwordHash is never read, and the seam strips it
// anyway (the double guard).
// ---------------------------------------------------------------------------

import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { buildDataExport } from "@/lib/data-export";
import { publicUser, requireUser } from "@/lib/server/auth";
import { downloadHeaders, toErrorResponse } from "@/lib/server/http";

export const GET = async () => {
  try {
    const user = await requireUser();

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
      db.subject.findMany({ where: { userId: user.id }, orderBy: { createdAt: "asc" } }),
      db.taskList.findMany({ where: { userId: user.id }, orderBy: { createdAt: "asc" } }),
      db.task.findMany({ where: { userId: user.id }, orderBy: { createdAt: "asc" } }),
      db.assignment.findMany({ where: { userId: user.id }, orderBy: { createdAt: "asc" } }),
      db.exam.findMany({ where: { userId: user.id }, orderBy: { createdAt: "asc" } }),
      db.event.findMany({ where: { userId: user.id }, orderBy: { createdAt: "asc" } }),
      db.timetableClass.findMany({ where: { userId: user.id }, orderBy: { createdAt: "asc" } }),
      db.notebook.findMany({ where: { userId: user.id }, orderBy: { createdAt: "asc" } }),
      db.note.findMany({ where: { userId: user.id }, orderBy: { createdAt: "asc" } }),
      db.flashcardDeck.findMany({ where: { userId: user.id }, orderBy: { createdAt: "asc" } }),
      // Flashcard has NO userId — the deck relation scopes it.
      db.flashcard.findMany({
        where: { deck: { userId: user.id } },
        orderBy: { createdAt: "asc" },
      }),
      db.practiceTest.findMany({ where: { userId: user.id }, orderBy: { createdAt: "asc" } }),
      db.studyGroup.findMany({ where: { userId: user.id }, orderBy: { createdAt: "asc" } }),
      db.grade.findMany({ where: { userId: user.id }, orderBy: { createdAt: "asc" } }),
      db.focusSession.findMany({ where: { userId: user.id }, orderBy: { createdAt: "asc" } }),
      db.fileFolder.findMany({ where: { userId: user.id }, orderBy: { createdAt: "asc" } }),
      db.fileItem.findMany({ where: { userId: user.id }, orderBy: { createdAt: "asc" } }),
      db.aiChatMessage.findMany({ where: { userId: user.id }, orderBy: { createdAt: "asc" } }),
      db.calculatorHistoryEntry.findMany({ where: { userId: user.id }, orderBy: { createdAt: "asc" } }),
      db.holiday.findMany({ where: { userId: user.id }, orderBy: { createdAt: "asc" } }),
    ]);

    const envelope = buildDataExport(
      publicUser(user),
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

    const stamp = new Date().toISOString().slice(0, 10);
    return new NextResponse(JSON.stringify(envelope), {
      status: 200,
      headers: downloadHeaders(`studyflow-data-${stamp}.json`, "application/json"),
    });
  } catch (err: unknown) {
    return toErrorResponse(err);
  }
};

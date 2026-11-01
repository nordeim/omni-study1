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
import { checkRateLimit } from "@/lib/auth";
import { publicUser, requireUser } from "@/lib/server/auth";
import { downloadHeaders, rateLimitedResponse, toErrorResponse } from "@/lib/server/http";

export const GET = async () => {
  try {
    const user = await requireUser();

    // S124/BY5: the heaviest enumeration in the app (20 tables + base64
    // file payloads + the full in-memory JSON.stringify) answers a budgeted
    // 10/15-min — the S14 posture every other enumeration family already
    // carries. ONE shared `export:${user.id}` key covers both export GETs
    // (the ai: shared-key precedent): exhausting one route 429s the sibling.
    const limit = checkRateLimit(`export:${user.id}`, 10);
    if (!limit.ok) {
      return rateLimitedResponse(limit.retryAfterSec, "Too many export requests");
    }

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

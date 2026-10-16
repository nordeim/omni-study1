// ---------------------------------------------------------------------------
// POST /api/ai/chat — the study assistant. Server-side SDK only (the import
// lives in this route file and nowhere client-reachable). Order matters:
// requireUser → the per-user budget (20/15 min, BEFORE validation — the
// S14-C1 pin) → the Zod schema → the SDK call under the 120s deadline →
// persist BOTH transcript rows → answer with the assistant message.
//
// The assistant speaks six study modes (the system prompt covers them and
// the latest user message's ask picks the specialist variant: explain,
// quiz, summarize, plan, encourage, or the general default).
// ---------------------------------------------------------------------------

import { NextResponse } from "next/server";
import ZAI from "z-ai-web-dev-sdk";

import { checkRateLimit } from "@/lib/auth";
import { db } from "@/lib/db";
import { aiChatSchema } from "@/lib/validation";
import { requireUser } from "@/lib/server/auth";
import {
  errorResponse,
  parseWith,
  rateLimitedResponse,
  readJson,
  toErrorResponse,
  withUser,
} from "@/lib/server/http";
import {
  AI_DEADLINE_MS,
  extractAssistantContent,
  withDeadline,
} from "@/lib/server/ai";

// ---- the six study-mode system prompts -------------------------------------------

const MODE_PROMPTS: Array<{ id: string; match: RegExp; prompt: string }> = [
  {
    id: "explain",
    match: /\b(explain|why|how does|what is|difference between|confus)/i,
    prompt:
      "You are StudyFlow's study assistant in EXPLAIN mode. Break the concept down step by step, define every term the student will meet on the way, use a concrete example, and finish with a one-sentence takeaway they could write on a flashcard.",
  },
  {
    id: "quiz",
    match: /\b(quiz|test me|flash ?cards|question me|practice questions|drill)/i,
    prompt:
      "You are StudyFlow's study assistant in QUIZ mode. Produce a short set of practice questions on the topic (mix recall and application), ask them one at a time, wait for the student's answer, then grade it kindly and explain the correct reasoning.",
  },
  {
    id: "summarize",
    match: /\b(summar|tl;?dr|condense|key points|main idea|shorten)/i,
    prompt:
      "You are StudyFlow's study assistant in SUMMARIZE mode. Compress the material into tight bullet points a student can revise from, keep every technical term exact, and flag the two or three facts most likely to be examined.",
  },
  {
    id: "plan",
    match: /\b(plan|schedule|timetable|organize|when should|study for|revision)/i,
    prompt:
      "You are StudyFlow's study assistant in PLANNER mode. Turn the ask into a concrete, dated study plan with realistic session lengths and breaks, ordered by urgency and difficulty, and say what the very next action is.",
  },
  {
    id: "encourage",
    match: /\b(stress|anxious|overwhelm|procrastinat|can'?t focus|burn(out|t)|motivat|tired)/i,
    prompt:
      "You are StudyFlow's study assistant in ENCOURAGE mode. Acknowledge the feeling in one line without being saccharine, then give a tiny, immediately doable next step and a simple structure for the rest of the session. Be warm, brief, and practical.",
  },
];

const GENERAL_PROMPT =
  "You are StudyFlow's study assistant — a focused, encouraging tutor for a student using their study planner. You operate in six study modes (explain, quiz, summarize, plan, encourage, and general help); match the student's ask to the right one. Prefer concrete examples, keep answers tight, and when a task fits the app suggest which view it belongs in (Tasks, Calendar, Flashcards, Practice Tests, Notes, Grade Tracker).";

function systemPromptFor(conversation: Array<{ role: string; content: string }>): string {
  const lastUser = [...conversation].reverse().find((m) => m.role === "user");
  if (!lastUser) return GENERAL_PROMPT;
  const hit = MODE_PROMPTS.find((mode) => mode.match.test(lastUser.content));
  return hit ? hit.prompt : GENERAL_PROMPT;
}

// ---- the route -----------------------------------------------------------------

export const POST = withUser(async (user, request) => {
  try {
    // The budget sits BEFORE validation: invalid payloads consume it too
    // (the S14-C1 pin — 20 valid-or-invalid POSTs, then 429).
    const limit = checkRateLimit(`ai:${user.id}`, 20);
    if (!limit.ok) {
      return rateLimitedResponse(limit.retryAfterSec, "Too many AI requests");
    }

    const body = parseWith(aiChatSchema, await readJson(request));

    // The SDK is constructed per request (cheap config read; stateless).
    const zai = await ZAI.create();
    const response = await withDeadline(
      zai.chat.completions.create({
        messages: [
          { role: "system", content: systemPromptFor(body.messages) },
          ...body.messages,
        ],
        timeoutMs: AI_DEADLINE_MS,
      }),
      AI_DEADLINE_MS,
    );

    const content = extractAssistantContent(response);
    if (!content) {
      return errorResponse(502, "The assistant returned an empty reply. Try again.");
    }

    // The transcript persists BOTH rows — but only on a successful reply
    // (a failed send bounces the composer text back; no orphan rows).
    const lastUserMessage = [...body.messages]
      .reverse()
      .find((m) => m.role === "user");
    const created = await db.$transaction([
      db.aiChatMessage.create({
        data: {
          userId: user.id,
          role: "user",
          content: lastUserMessage ? lastUserMessage.content : "",
          surface: body.surface,
        },
      }),
      db.aiChatMessage.create({
        data: {
          userId: user.id,
          role: "assistant",
          content,
          surface: body.surface,
        },
      }),
    ]);
    const assistantRow = created[1];

    return NextResponse.json({
      message: {
        id: assistantRow.id,
        role: assistantRow.role,
        content: assistantRow.content,
        createdAt: assistantRow.createdAt.toISOString(),
      },
    });
  } catch (err: unknown) {
    if (err instanceof Error && err.name === "AiDeadlineError") {
      return errorResponse(504, "The assistant took too long to respond. Try again.");
    }
    // Config missing / provider down → a graceful, human failure.
    console.error("[ai/chat] generation failed:", err instanceof Error ? err.message : err);
    return toErrorResponse(err);
  }
});

// ---------------------------------------------------------------------------
// POST /api/ai/generate-questions — AI practice-test question generation
// (the S7-B superset). Same per-user budget. The LLM answers with a JSON
// array of {question, type} in the app's own three types
// (multiple_choice | true_false | short_answer); the reply is parsed
// defensively and persisted as ONE PracticeTest whose questions column is
// the JSON string the PracticeTests view renders.
// ---------------------------------------------------------------------------

import { NextResponse } from "next/server";
import { z } from "zod";
import ZAI from "z-ai-web-dev-sdk";

import { checkRateLimit } from "@/lib/auth";
import { db } from "@/lib/db";
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
  extractJsonBlock,
  withDeadline,
} from "@/lib/server/ai";

const QUESTION_TYPES = ["multiple_choice", "true_false", "short_answer"] as const;

const generateQuestionsSchema = z.object({
  title: z.string().min(1).max(200),
  subjectId: z
    .string()
    .min(1)
    .nullish()
    .transform((v) => (v === "" ? null : v)),
  count: z.number().int().min(1).max(20).optional().default(10),
  topics: z.string().max(2000).optional().default(""),
  // persist=false: draft-only generation for the Create Test dialog (the
  // caller saves the test itself — no double row).
  persist: z.boolean().optional().default(true),
});

const questionDraftSchema = z.object({
  question: z.string().min(1).max(2000),
  type: z.enum(QUESTION_TYPES),
});
const questionDraftListSchema = z.array(questionDraftSchema).min(1).max(20);

export const POST = withUser(async (user, request) => {
  try {
    const limit = checkRateLimit(`ai:${user.id}`, 20);
    if (!limit.ok) {
      return rateLimitedResponse(limit.retryAfterSec, "Too many AI requests");
    }

    const { title, subjectId, count, topics, persist } = parseWith(
      generateQuestionsSchema,
      await readJson(request),
    );

    if (subjectId) {
      const subject = await db.subject.findFirst({
        where: { id: subjectId, userId: user.id },
        select: { id: true },
      });
      if (!subject) return errorResponse(404, "That subject does not exist.");
    }

    const zai = await ZAI.create();
    const response = await withDeadline(
      zai.chat.completions.create({
        messages: [
          {
            role: "system",
            content:
              'You generate practice-test questions. Reply with ONLY a JSON array — no prose, no code fences — of objects shaped {"question": string, "type": "multiple_choice" | "true_false" | "short_answer"}. For multiple_choice, append the options as "A) … B) …" lines and do NOT include the answer key.',
          },
          {
            role: "user",
            content: `Write ${count} practice-test questions titled "${title}"${
              topics ? ` covering: ${topics}` : ""
            }. Mix the three types.`,
          },
        ],
        timeoutMs: AI_DEADLINE_MS,
      }),
      AI_DEADLINE_MS,
    );

    const content = extractAssistantContent(response);
    if (!content) {
      return errorResponse(502, "The assistant returned an empty reply. Try again.");
    }
    const parsed = questionDraftListSchema.safeParse(extractJsonBlock(content));
    if (!parsed.success) {
      return errorResponse(502, "The assistant's reply was not usable question data. Try again.");
    }

    const test = persist
      ? await db.practiceTest.create({
          data: {
            userId: user.id,
            title,
            durationMinutes: Math.max(count * 2, 10),
            questions: JSON.stringify(parsed.data),
            subjectId: subjectId ?? null,
          },
        })
      : null;

    return NextResponse.json({ test, questions: parsed.data }, { status: 201 });
  } catch (err: unknown) {
    if (err instanceof Error && err.name === "AiDeadlineError") {
      return errorResponse(504, "The assistant took too long to respond. Try again.");
    }
    console.error("[ai/generate-questions] generation failed:", err instanceof Error ? err.message : err);
    return toErrorResponse(err);
  }
});

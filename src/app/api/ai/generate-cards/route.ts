// ---------------------------------------------------------------------------
// POST /api/ai/generate-cards — AI flashcard generation for an owned deck
// (the S7-A superset). Same per-user budget as the other AI routes. The LLM
// answers with a JSON array of {front, back}; the reply is parsed
// defensively and persisted as real Flashcard rows the deck view reads.
// ---------------------------------------------------------------------------

import { NextResponse } from "next/server";
import { z } from "zod";
import ZAI from "z-ai-web-dev-sdk";

import { checkRateLimit } from "@/lib/auth";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/server/auth";
import { idField } from "@/lib/validation";
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

// S119/BT4: the shared idField bound on deckId (was unbounded).
const generateCardsSchema = z.object({
  deckId: idField,
  topic: z.string().max(500).optional().default(""),
  count: z.number().int().min(1).max(20).optional().default(8),
});

const cardDraftSchema = z.object({
  front: z.string().min(1).max(2000),
  back: z.string().min(1).max(2000),
});
const cardDraftListSchema = z.array(cardDraftSchema).min(1).max(20);

export const POST = withUser(async (user, request) => {
  try {
    const limit = checkRateLimit(`ai:${user.id}`, 20);
    if (!limit.ok) {
      return rateLimitedResponse(limit.retryAfterSec, "Too many AI requests");
    }

    const { deckId, topic, count } = parseWith(
      generateCardsSchema,
      await readJson(request),
    );

    const deck = await db.flashcardDeck.findFirst({
      where: { id: deckId, userId: user.id },
      select: { id: true, name: true, description: true },
    });
    if (!deck) return errorResponse(404, "That deck does not exist.");

    const zai = await ZAI.create();
    const response = await withDeadline(
      zai.chat.completions.create({
        messages: [
          {
            role: "system",
            content:
              "You generate study flashcards. Reply with ONLY a JSON array — no prose, no code fences — of objects shaped {\"front\": string, \"back\": string}. The front is a short question or term; the back is a complete but concise answer.",
          },
          {
            role: "user",
            content: `Create ${count} flashcards for the deck "${deck.name}"${
              deck.description ? ` (${deck.description})` : ""
            }${topic ? ` focused on: ${topic}` : ""}.`,
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
    const parsed = cardDraftListSchema.safeParse(extractJsonBlock(content));
    if (!parsed.success) {
      return errorResponse(502, "The assistant's reply was not usable card data. Try again.");
    }

    const created = await db.$transaction(
      parsed.data.map((card) =>
        db.flashcard.create({
          data: {
            deckId: deck.id,
            front: card.front,
            back: card.back,
            difficulty: "medium",
            mastered: false,
          },
        }),
      ),
    );

    return NextResponse.json({ cards: created }, { status: 201 });
  } catch (err: unknown) {
    if (err instanceof Error && err.name === "AiDeadlineError") {
      return errorResponse(504, "The assistant took too long to respond. Try again.");
    }
    console.error("[ai/generate-cards] generation failed:", err instanceof Error ? err.message : err);
    return toErrorResponse(err);
  }
});

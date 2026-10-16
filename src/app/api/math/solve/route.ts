// ---------------------------------------------------------------------------
// POST /api/math/solve — the math solver (text via the chat completion,
// photographed problems via the vision endpoint). Same per-user budget as
// the AI routes (the four routes share `ai:<uid>`). Vision model
// "glm-4.5v" — verified against the SDK's .d.ts (the vision body type
// REQUIRES an explicit model; there is no default).
// ---------------------------------------------------------------------------

import { NextResponse } from "next/server";
import ZAI from "z-ai-web-dev-sdk";

import { checkRateLimit } from "@/lib/auth";
import { mathSolveSchema } from "@/lib/validation";
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

const SOLVER_SYSTEM_PROMPT =
  "You are StudyFlow's math solver. Solve the given problem step by step, showing the key intermediate lines, then state the final answer clearly on its own last line. Keep notation plain-text friendly.";

export const POST = withUser(async (user, request) => {
  try {
    // The shared AI budget (math/solve counts against ai:<uid>, 20/15 min).
    const limit = checkRateLimit(`ai:${user.id}`, 20);
    if (!limit.ok) {
      return rateLimitedResponse(limit.retryAfterSec, "Too many AI requests");
    }

    const { problem, image } = parseWith(mathSolveSchema, await readJson(request));

    const zai = await ZAI.create();
    const response = await withDeadline(
      image
        ? zai.chat.completions.createVision({
            model: "glm-4.5v",
            messages: [
              { role: "system", content: SOLVER_SYSTEM_PROMPT },
              {
                role: "user",
                content: [
                  { type: "text", text: problem },
                  { type: "image_url", image_url: { url: image } },
                ],
              },
            ],
          })
        : zai.chat.completions.create({
            messages: [
              { role: "system", content: SOLVER_SYSTEM_PROMPT },
              { role: "user", content: problem },
            ],
            timeoutMs: AI_DEADLINE_MS,
          }),
      AI_DEADLINE_MS,
    );

    const solution = extractAssistantContent(response);
    if (!solution) {
      return errorResponse(502, "The solver returned an empty solution. Try again.");
    }

    return NextResponse.json({ solution });
  } catch (err: unknown) {
    if (err instanceof Error && err.name === "AiDeadlineError") {
      return errorResponse(504, "The solver took too long to respond. Try again.");
    }
    console.error("[math/solve] solve failed:", err instanceof Error ? err.message : err);
    return toErrorResponse(err);
  }
});

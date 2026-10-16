// ---------------------------------------------------------------------------
// The AI routes' shared helpers. NO SDK import here — z-ai-web-dev-sdk is
// imported only inside src/app/api/{ai,math}/route.ts files (security rule
// #8). This module owns the 120-second deadline mechanism and the defensive
// response extraction.
//
// SDK surface (verified against node_modules/z-ai-web-dev-sdk dist .d.ts):
//   - default export `ZAI`, `await ZAI.create()` (config from .z-ai-config)
//   - `zai.chat.completions.create({ messages, model?, stream? })` → any
//     (OpenAI-style JSON: choices[0].message.content)
//   - `zai.chat.completions.createVision({ model, messages })` — `model` is
//     REQUIRED by the vision body type; the solver passes "glm-4.5v".
//   - The SDK uses a bare fetch with NO client-side timeout — its
//     completion-body type tolerates extra keys, but `timeoutMs` is NOT
//     implemented client-side. The 120s deadline is therefore enforced HERE
//     (Promise.race) — the routes still pass `{ timeoutMs: 120_000 }` in the
//     body so a future SDK build that honors it composes unchanged.
// ---------------------------------------------------------------------------

export const AI_DEADLINE_MS = 120_000;

/** Thrown when the deadline beats the SDK call; mapped to a 504 by the
 *  AI routes' catch. */
export class AiDeadlineError extends Error {
  constructor() {
    super("The AI request exceeded its 120-second deadline.");
    this.name = "AiDeadlineError";
  }
}

/** Race the SDK promise against the deadline. The losing SDK promise is
 *  left to settle unobserved (its rejection is caught and dropped — no
 *  unhandled-rejection noise). */
export function withDeadline<T>(promise: Promise<T>, ms: number = AI_DEADLINE_MS): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_resolve, reject) => {
    timer = setTimeout(() => reject(new AiDeadlineError()), ms);
  });
  // A late SDK rejection must never surface as an unhandled rejection.
  promise.catch(() => undefined);
  return Promise.race([promise, timeout]).finally(() => {
    if (timer !== undefined) clearTimeout(timer);
  });
}

/** Safely read the assistant's text out of an OpenAI-style completion
 *  response (the SDK's return type is `any` — never trusted blindly). */
export function extractAssistantContent(response: unknown): string | null {
  if (typeof response !== "object" || response === null) return null;
  const choices = (response as { choices?: unknown }).choices;
  if (!Array.isArray(choices) || choices.length === 0) return null;
  const first = choices[0];
  if (typeof first !== "object" || first === null) return null;
  const message = (first as { message?: unknown }).message;
  if (typeof message !== "object" || message === null) return null;
  const content = (message as { content?: unknown }).content;
  if (typeof content !== "string" || content.trim().length === 0) return null;
  return content;
}

/** Best-effort JSON extraction from an LLM reply: strip the usual markdown
 *  code fences, then take the outermost array or object literal. */
export function extractJsonBlock(text: string): unknown {
  const cleaned = text.replace(/```(?:json)?/gi, "```").trim();
  const fenced = cleaned.match(/```([\s\S]*?)```/);
  const candidate = (fenced ? fenced[1] : cleaned).trim();
  try {
    return JSON.parse(candidate) as unknown;
  } catch {
    // Fall through: find the first balanced-looking [ ... ] block.
    const start = candidate.search(/[[{]/);
    if (start === -1) return null;
    const openChar = candidate[start];
    const closeChar = openChar === "[" ? "]" : "}";
    const end = candidate.lastIndexOf(closeChar);
    if (end <= start) return null;
    try {
      return JSON.parse(candidate.slice(start, end + 1)) as unknown;
    } catch {
      return null;
    }
  }
}

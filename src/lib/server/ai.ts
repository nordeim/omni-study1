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

/**
 * S122/BW6: the persisted-content bound — every other field at the AI
 * write boundaries is schema-bounded (the user leg ≤10 k, cards ≤2 k,
 * questions ≤2 k); the assistant leg trusted the provider. A runaway
 * reply (or a compromised provider response) must not write an
 * unbounded row the GET then serves 500 of. 100_000 is the note-content
 * precedent. Truncation (not rejection) keeps the conversation — the
 * trust boundary is the provider, not the requester.
 */
export const PERSISTED_CONTENT_MAX = 100_000;

export function capPersistedContent(content: string, max: number = PERSISTED_CONTENT_MAX): string {
  return content.length > max ? content.slice(0, max) : content;
}

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

// ---------------------------------------------------------------------------
// S126/CA1 — the transcript pair write + the retention trim (the s126
// persistence audit's B-M1 + B-L1). Two defects shared by both write sites
// (chat + math/solve): (1) the pair was written with schema-default
// createdAt — two sub-millisecond inserts inside ONE transaction share a
// millisecond, so any createdAt-only ordering could render the reply ABOVE
// its question; (2) nothing trimmed aiChatMessage, so the table grew
// unboundedly while the GET's take: 500 only ever surfaced the OLDEST
// window (fixed at the route). The helper owns both: explicit pair
// timestamps (the assistant row +1 ms — deterministic under ANY tiebreak)
// and the calculator-history retention trim (BZ10's transactional,
// id-tiebroken form). Both call sites are successful-reply-only (the S13
// doctrine: a failed send bounces the composer, no orphan rows).
// ---------------------------------------------------------------------------

import type { Prisma } from "@prisma/client";
import type { PrismaClient } from "@prisma/client";

/** The transcript retention window — mirrors calculator history's
 *  HISTORY_WINDOW (BW5): the newest 500 rows persist, older rows trim. */
export const TRANSCRIPT_WINDOW = 500;

type TranscriptTx = Prisma.TransactionClient | PrismaClient;

/** Write the user+assistant pair with deterministic ordering, then trim the
 *  account's transcript to the newest TRANSCRIPT_WINDOW rows. Returns the
 *  assistant row (the chat route answers with it). */
export async function persistTranscriptPair(
  tx: TranscriptTx,
  userId: string,
  input: { userContent: string; assistantContent: string; surface: string },
): Promise<{ id: string; role: string; content: string; createdAt: Date }> {
  // Explicit pair timestamps: the user row at `base`, the assistant row at
  // base + 1 ms — same-millisecond ties are impossible for the pair, so
  // every ordering (with or without an id tiebreak) renders the question
  // above its answer.
  const base = new Date();
  await tx.aiChatMessage.create({
    data: {
      userId,
      role: "user",
      content: input.userContent,
      surface: input.surface,
      createdAt: base,
    },
  });
  const created = await tx.aiChatMessage.create({
    data: {
      userId,
      role: "assistant",
      content: input.assistantContent,
      surface: input.surface,
      createdAt: new Date(base.getTime() + 1),
    },
  });
  // The retention trim (the BZ10 calculator form): count → skip → delete
  // inside the SAME transaction, id-tiebroken so same-millisecond ties trim
  // deterministically (an older twin never outlives a newer one).
  const total = await tx.aiChatMessage.count({ where: { userId } });
  if (total > TRANSCRIPT_WINDOW) {
    const stale = await tx.aiChatMessage.findMany({
      where: { userId },
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      skip: TRANSCRIPT_WINDOW,
      // S130/CE9: the stale-select is BOUNDED per write (an unbounded
      // skip-select inside the default 5 s interactive transaction is the
      // BW4 class — a large imported tail P2028'd the first post-import
      // chat; converging over successive writes is the honest shape).
      take: 1000,
      select: { id: true },
    });
    if (stale.length > 0) {
      await tx.aiChatMessage.deleteMany({
        where: { userId, id: { in: stale.map((row) => row.id) } },
      });
    }
  }
  return created;
}

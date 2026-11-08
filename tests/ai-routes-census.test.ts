import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

// S160/DI3 — the AI-routes source census (the s160 audit B's L-1 + L-3
// closes; the script-conventions source-census precedent applied to the
// route family). The audit's finding: the AI family's cross-route
// conventions lived only in prose + the chat route's e2e pins —
//   L-1: generate-cards' $transaction rode Prisma's 5 s interactive
//        default while BOTH siblings carried the explicit
//        { timeout: 15_000 } (the S130/CE9 doctrine) — fixed as DI1,
//        machine-guarded here;
//   L-3: the shared `ai:${user.id}`, 20 budget form was enforced in all
//        four routes but pinned ONLY through the s14 C1 e2e leg, which
//        exhausts via /api/ai/chat — a refactor forking ONE route's
//        key/limit tripped nothing.
// The census reads the four route files and asserts BOTH conventions per
// route — a future fork (a different budget key, a dropped tx timeout)
// fails the unit layer BEFORE the convention silently drifts.

const ROUTES_DIR = path.resolve(process.cwd(), "src/app/api");

// The AI family's route files (the four POST routes that share the
// per-user AI budget; the messages GET/DELETE is the transcript store,
// not an LLM route — its write budget rides the shared write: bucket).
const AI_ROUTE_FILES = [
  "ai/chat/route.ts",
  "ai/generate-cards/route.ts",
  "ai/generate-questions/route.ts",
  "math/solve/route.ts",
] as const;

// The tx-carrying subset (chat + solve persist the transcript pair;
// generate-cards persists the drafted cards — the three routes whose
// $transaction calls the CE9 timeout convention governs).
const TX_ROUTE_FILES = [
  "ai/chat/route.ts",
  "ai/generate-cards/route.ts",
  "math/solve/route.ts",
] as const;

function routeSource(rel: string): string {
  return readFileSync(path.join(ROUTES_DIR, rel), "utf8");
}

function countOccurrences(source: string, needle: string): number {
  return source.split(needle).length - 1;
}

describe("the AI-routes source census (S160/DI3)", () => {
  it("every AI POST route carries the exact shared ai-budget form — checkRateLimit(`ai:${user.id}`, 20)", () => {
    // The exact-key/shared-limit contract (AGENTS.md's security-hardening
    // contract): one budget across all four routes — a forked key
    // (per-route budgets) or a drifted limit changes the documented
    // exhaustion arithmetic (the s14 C1 pin's 20x-400-then-429) on the
    // OTHER routes silently.
    for (const rel of AI_ROUTE_FILES) {
      const source = routeSource(rel);
      expect(
        source.includes("checkRateLimit(`ai:${user.id}`, 20)"),
        `${rel} must carry the exact shared ai-budget form`,
      ).toBe(true);
    }
  });

  it("every tx-carrying AI route pairs each $transaction with the explicit CE9 { timeout: 15_000 } option", () => {
    // The S130/CE9 doctrine: Prisma's interactive-transaction default is
    // 5 s; the AI routes' pair/card writes carry up to 20 sequential
    // creates (generate-cards) or the trim-bounded pair write (chat,
    // solve) — every $transaction call is paired with the explicit
    // timeout option. RED pre-DI1 on generate-cards (0 timeout options
    // vs 1 transaction); the count-equality form also catches a future
    // route adding a SECOND bare $transaction.
    for (const rel of TX_ROUTE_FILES) {
      const source = routeSource(rel);
      const txCount = countOccurrences(source, "$transaction(");
      const timeoutCount = countOccurrences(source, "timeout: 15_000");
      expect(txCount, `${rel} must carry at least one $transaction`).toBeGreaterThan(0);
      expect(
        timeoutCount,
        `${rel}: every $transaction must pair the CE9 { timeout: 15_000 } option`,
      ).toBe(txCount);
    }
  });
});

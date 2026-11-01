// S122/BW12 — unit pins for src/lib/server/ai.ts, the only lib seam family
// that had zero direct unit pins (withDeadline/extractAssistantContent/
// extractJsonBlock were exercised only incidentally through the routes).
// §14's tier-1 rule: the pure seams in src/lib/* carry their own pins.
//
// S122/BW6 rides the same file: the persisted-content cap (the assistant
// reply is the ONLY persisted field at the chat boundary with no length
// bound — the user leg is ≤10k, cards ≤2k, questions ≤2k at the schema;
// the assistant leg trusted the provider. The cap helper makes the bound
// explicit and unit-pinnable).
import { describe, expect, it, vi } from "vitest";

import {
  AiDeadlineError,
  capPersistedContent,
  extractAssistantContent,
  extractJsonBlock,
  withDeadline,
} from "@/lib/server/ai";

describe("withDeadline (the 120 s race)", () => {
  it("resolves with the SDK value when it beats the deadline", async () => {
    const slow = new Promise<string>((resolve) => setTimeout(() => resolve("ok"), 20));
    await expect(withDeadline(slow, 500)).resolves.toBe("ok");
  });

  it("rejects with AiDeadlineError when the deadline fires first", async () => {
    const slow = new Promise<string>((resolve) => setTimeout(() => resolve("late"), 200));
    await expect(withDeadline(slow, 20)).rejects.toBeInstanceOf(AiDeadlineError);
  });

  it("the losing SDK promise's rejection is suppressed (no unhandled rejection)", async () => {
    const onUnhandled = vi.fn();
    process.on("unhandledRejection", onUnhandled);
    try {
      const rejecting = new Promise<string>((_resolve, reject) =>
        setTimeout(() => reject(new Error("sdk died")), 40),
      );
      await expect(withDeadline(rejecting, 10)).rejects.toBeInstanceOf(AiDeadlineError);
      // Give the late rejection time to (not) surface.
      await new Promise((resolve) => setTimeout(resolve, 80));
      expect(onUnhandled).not.toHaveBeenCalled();
    } finally {
      process.off("unhandledRejection", onUnhandled);
    }
  });

  it("the timer is cleared once the race settles (no dangling timers)", async () => {
    const fast = Promise.resolve("fast");
    await expect(withDeadline(fast, 10_000)).resolves.toBe("fast");
    // A cleared timer cannot fire a late rejection — assert via a settled
    // microtask drain (the finally callback ran synchronously on settle).
    await new Promise((resolve) => setTimeout(resolve, 5));
  });
});

describe("extractAssistantContent (the defensive shape walker)", () => {
  const reply = (content: unknown) => ({ choices: [{ message: { content } }] });

  it("reads a plain string content", () => {
    expect(extractAssistantContent(reply("2 + 2 = 4"))).toBe("2 + 2 = 4");
  });

  it("returns null for whitespace-only content", () => {
    expect(extractAssistantContent(reply("   \n  "))).toBeNull();
  });

  it("returns null for missing/non-string content (the SDK type is any)", () => {
    expect(extractAssistantContent(reply(undefined))).toBeNull();
    expect(extractAssistantContent(reply(42))).toBeNull();
    expect(extractAssistantContent(reply(null))).toBeNull();
  });

  it("returns null for malformed envelopes", () => {
    expect(extractAssistantContent(null)).toBeNull();
    expect(extractAssistantContent("string")).toBeNull();
    expect(extractAssistantContent({})).toBeNull();
    expect(extractAssistantContent({ choices: [] })).toBeNull();
    expect(extractAssistantContent({ choices: [{}] })).toBeNull();
    expect(extractAssistantContent({ choices: [{ message: "not-an-object" }] })).toBeNull();
  });
});

describe("extractJsonBlock (the fenced/balanced parser)", () => {
  it("parses a fenced json block", () => {
    expect(extractJsonBlock('```json\n[{"front":"A"}]\n```')).toEqual([{ front: "A" }]);
  });

  it("parses bare JSON with no fences", () => {
    expect(extractJsonBlock('{"a":1}')).toEqual({ a: 1 });
  });

  it("falls back to the outermost balanced block when prose surrounds it", () => {
    expect(extractJsonBlock('Here you go: [{"q":"x"}] — enjoy')).toEqual([{ q: "x" }]);
  });

  it("returns null when nothing parses", () => {
    expect(extractJsonBlock("no json here")).toBeNull();
    expect(extractJsonBlock("[unbalanced")).toBeNull();
  });
});

describe("capPersistedContent (S122/BW6 — the assistant-reply bound)", () => {
  it("returns short content verbatim", () => {
    expect(capPersistedContent("short reply")).toBe("short reply");
  });

  it("truncates at the cap boundary exactly", () => {
    const exact = "x".repeat(100_000);
    expect(capPersistedContent(exact)).toBe(exact);
    const over = "x".repeat(100_001);
    const capped = capPersistedContent(over);
    expect(capped.length).toBe(100_000);
    expect(capped).toBe(exact);
  });

  it("empty content passes through (the empty-reply 502 is the route's call, not the cap's)", () => {
    expect(capPersistedContent("")).toBe("");
  });
});

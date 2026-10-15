import { describe, expect, it, vi } from "vitest";

import { apiSend, isTimeoutError } from "@/lib/api";

// S13-A2: the AI surfaces need a request deadline. apiSend gains an optional
// { timeoutMs } opt (implemented with AbortSignal.timeout) so a hung backend
// can never disable the composer forever. The MECHANISM is pinned here with a
// short timeout against a stubbed hanging fetch — never the production
// constant (120 s, ~2-4x the worst observed LLM completion).

describe("apiSend timeoutMs", () => {
  // A fetch stub that honors the abort signal like the real implementation
  // (rejects with the signal's reason when it fires).
  const hangingFetch = () =>
    vi.fn(
      (_path: string | URL | Request, init?: RequestInit) =>
        new Promise<Response>((_, reject) => {
          init?.signal?.addEventListener("abort", () => reject(init.signal!.reason), { once: true });
        }),
    );

  it("rejects a hung request once timeoutMs elapses", async () => {
    const hang = hangingFetch();
    vi.stubGlobal("fetch", hang);
    try {
      const sent = apiSend("POST", "/api/test", { a: 1 }, { timeoutMs: 25 });
      await expect(sent).rejects.toThrow();
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it("flags the timeout rejection via isTimeoutError (not a plain TypeError)", async () => {
    const hang = hangingFetch();
    vi.stubGlobal("fetch", hang);
    try {
      let caught: unknown = null;
      await apiSend("POST", "/api/test", undefined, { timeoutMs: 25 }).catch(
        (err: unknown) => {
          caught = err;
        },
      );
      expect(caught).not.toBeNull();
      expect(isTimeoutError(caught)).toBe(true);
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it("does NOT time out when no timeoutMs is passed (a hanging fetch stays pending)", async () => {
    const hang = vi.fn(() => new Promise<Response>(() => {}));
    vi.stubGlobal("fetch", hang);
    try {
      let rejected = false;
      const sent = apiSend("POST", "/api/test").catch(() => {
        rejected = true;
      });
      // Give any (wrongly installed) default timeout ample time to fire.
      await new Promise((r) => setTimeout(r, 150));
      expect(rejected).toBe(false);
      void sent;
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it("isTimeoutError rejects ordinary errors", () => {
    expect(isTimeoutError(new TypeError("fetch failed"))).toBe(false);
    expect(isTimeoutError(new Error("boom"))).toBe(false);
    expect(isTimeoutError(null)).toBe(false);
  });
});

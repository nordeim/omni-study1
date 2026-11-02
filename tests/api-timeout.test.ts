import { describe, expect, it, vi } from "vitest";

import { apiGet, apiSend, isTimeoutError } from "@/lib/api";

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

  // S130/CE1 REMOVED (the documented correction the source change demands):
  // the pre-CE1 leg "does NOT time out when no timeoutMs is passed" pinned
  // the patient-default premise that CE1 inverts BY DESIGN — apiSend now
  // installs DEFAULT_WRITE_TIMEOUT_MS (30 s) when the caller passes no
  // options. The replacement legs below pin the new contract structurally
  // (the captured init carries a live AbortSignal) — a 30 s behavioral
  // wait would dominate the suite's runtime for zero discrimination.
  it("isTimeoutError rejects ordinary errors", () => {
    expect(isTimeoutError(new TypeError("fetch failed"))).toBe(false);
    expect(isTimeoutError(new Error("boom"))).toBe(false);
    expect(isTimeoutError(null)).toBe(false);
  });
});

// S130/CE1 — the DEFAULT deadline family (docs/remediation-plan-session130.md).
//
// The s130 FE audit's M1: the timeoutMs infrastructure existed (CD wired
// collection GETs, CC the auth POSTs, S13 the AI surfaces) but EVERY
// mutation write path rode no deadline — all ~50 apiSend calls in
// data.ts's mutations plus the view-level twins. A stalled write (accepted
// TCP, no response — no offline event fires) latched every busy state
// (dialog Save spinners, the delete-account button, the upload button)
// with no error branch reachable until reload. The fix installs defaults
// INSIDE the seam: apiSend → DEFAULT_WRITE_TIMEOUT_MS (30 s), apiGet →
// DEFAULT_GET_TIMEOUT_MS (20 s — the CD2 collection constant's value);
// an explicit timeoutMs still wins. Pinned structurally: the captured
// init carries a LIVE AbortSignal (installed, un-aborted) — the behavioral
// rejection legs above already pin the mechanism, and waiting 30 s here
// would add runtime without discrimination.
describe("apiSend/apiGet default deadlines (S130/CE1)", () => {
  // A holder object + a reader function — direct `captured.init?.signal`
  // reads narrow to `never` (the test body's `= undefined` assignments
  // are visible to control flow; the stub's assignment is not), so the
  // read goes through a function boundary where the union stays honest.
  const captured: { init?: RequestInit } = {};
  const signalOf = (c: { init?: RequestInit }): AbortSignal | null | undefined =>
    c.init?.signal;
  const capturingFetch = () =>
    vi.fn(
      (_path: string | URL | Request, init?: RequestInit) =>
        new Promise<Response>(() => {
          captured.init = init;
        }),
    );

  it("apiSend installs a live default-write deadline when no options ride", async () => {
    captured.init = undefined;
    const hang = capturingFetch();
    vi.stubGlobal("fetch", hang);
    try {
      const sent = apiSend("POST", "/api/test", { a: 1 });
      await new Promise((r) => setTimeout(r, 25));
      expect(signalOf(captured)).toBeInstanceOf(AbortSignal);
      expect(signalOf(captured)?.aborted).toBe(false);
      void sent;
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it("apiGet installs a live default-get deadline when no options ride", async () => {
    captured.init = undefined;
    const hang = capturingFetch();
    vi.stubGlobal("fetch", hang);
    try {
      const got = apiGet("/api/health");
      await new Promise((r) => setTimeout(r, 25));
      expect(signalOf(captured)).toBeInstanceOf(AbortSignal);
      expect(signalOf(captured)?.aborted).toBe(false);
      void got;
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it("an explicit timeoutMs still wins over the default (the caller's signal timing governs)", async () => {
    captured.init = undefined;
    const hang = capturingFetch();
    vi.stubGlobal("fetch", hang);
    try {
      const sent = apiSend("POST", "/api/test", undefined, { timeoutMs: 25 });
      await new Promise((r) => setTimeout(r, 60));
      // The explicit 25 ms deadline has FIRED by now — the default (30 s)
      // would not have. This is the override discriminating leg.
      expect(signalOf(captured)?.aborted).toBe(true);
      void sent;
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it("the default constants are the documented values (30 s write / 20 s get — the CD2 collection constant's value)", async () => {
    const api = await import("@/lib/api");
    expect(api.DEFAULT_WRITE_TIMEOUT_MS).toBe(30_000);
    expect(api.DEFAULT_GET_TIMEOUT_MS).toBe(20_000);
  });
});

// S128/CC7: the apiGet mirror — the S13 deadline seam existed ONLY on
// apiSend, so the boot gate's `await apiGet("/api/auth/me")` could hold the
// Splash spinner for the browser's own connection timeout (minutes) on a
// stalled connection (accepted TCP, no response — no `offline` event fires,
// and the retry affordance lives in the gate's error branch).
describe("apiGet timeoutMs (S128/CC7)", () => {
  const hangingFetch = () =>
    vi.fn(
      (_path: string | URL | Request, init?: RequestInit) =>
        new Promise<Response>((_, reject) => {
          init?.signal?.addEventListener("abort", () => reject(init.signal!.reason), { once: true });
        }),
    );

  it("rejects a hung GET once timeoutMs elapses", async () => {
    const hang = hangingFetch();
    vi.stubGlobal("fetch", hang);
    try {
      const got = apiGet("/api/auth/me", { timeoutMs: 25 });
      await expect(got).rejects.toThrow();
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it("flags the timeout via isTimeoutError (the gate's error branch is reachable)", async () => {
    const hang = hangingFetch();
    vi.stubGlobal("fetch", hang);
    try {
      let caught: unknown = null;
      await apiGet("/api/auth/me", { timeoutMs: 25 }).catch((err: unknown) => {
        caught = err;
      });
      expect(caught).not.toBeNull();
      expect(isTimeoutError(caught)).toBe(true);
    } finally {
      vi.unstubAllGlobals();
    }
  });

  // S130/CE1 REMOVED (the apiGet twin of the apiSend tombstone above — the
  // patient-default premise this leg pinned is inverted by design; the
  // structural default-install legs in the S130/CE1 describe replace it).
});

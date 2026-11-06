import { describe, expect, it, vi } from "vitest";

import { apiGet, apiSend, ApiError, isTimeoutError } from "@/lib/api";

// S14-A0b: a real transport failure (offline / DNS / connection refused)
// surfaces in Chromium as fetch rejecting with a TypeError ("Failed to
// fetch") — raw browser text the views then toast verbatim. The client seam
// maps it to a human message. The MECHANISM is pinned here with a stubbed
// global fetch; the timeout classification (S13) must keep precedence.

describe("api transport-failure mapping (offline)", () => {
  it("maps a TypeError fetch rejection to the human offline message", async () => {
    const offlineFetch = vi.fn(() => Promise.reject(new TypeError("Failed to fetch")));
    vi.stubGlobal("fetch", offlineFetch);
    try {
      let caught: unknown = null;
      await apiSend("POST", "/api/tasks", { title: "x" }).catch((err: unknown) => {
        caught = err;
      });
      expect(caught).toBeInstanceOf(ApiError);
      expect((caught as ApiError).message).toContain("offline");
      expect((caught as ApiError).message).not.toContain("Failed to fetch");
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it("apiGet maps the same way (all three helpers ride the seam)", async () => {
    const offlineFetch = vi.fn(() => Promise.reject(new TypeError("Failed to fetch")));
    vi.stubGlobal("fetch", offlineFetch);
    try {
      let caught: unknown = null;
      await apiGet("/api/tasks").catch((err: unknown) => {
        caught = err;
      });
      expect(caught).toBeInstanceOf(ApiError);
      expect((caught as ApiError).message).toContain("offline");
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it("keeps the timeout classification intact (TimeoutError is NOT remapped)", async () => {
    const timeoutFetch = vi.fn(() =>
      Promise.reject(new DOMException("The operation timed out.", "TimeoutError")),
    );
    vi.stubGlobal("fetch", timeoutFetch);
    try {
      let caught: unknown = null;
      await apiSend("POST", "/api/ai/chat", { messages: [] }).catch((err: unknown) => {
        caught = err;
      });
      expect(isTimeoutError(caught)).toBe(true);
      // The timeout error propagates untouched (NOT wrapped in ApiError) so
      // the call sites' isTimeoutError branches keep working.
      expect(caught).not.toBeInstanceOf(ApiError);
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it("passes non-transport rejections through untouched", async () => {
    const weird = new Error("something else entirely");
    const weirdFetch = vi.fn(() => Promise.reject(weird));
    vi.stubGlobal("fetch", weirdFetch);
    try {
      let caught: unknown = null;
      await apiSend("POST", "/api/tasks", { title: "x" }).catch((err: unknown) => {
        caught = err;
      });
      expect(caught).toBe(weird);
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it("successful responses are unaffected by the mapping", async () => {
    const okFetch = vi.fn(() =>
      Promise.resolve(new Response(JSON.stringify({ ok: true }), { status: 200 })),
    );
    vi.stubGlobal("fetch", okFetch);
    try {
      const res = await apiSend<{ ok: boolean }>("POST", "/api/tasks", { title: "x" });
      expect(res.ok).toBe(true);
    } finally {
      vi.unstubAllGlobals();
    }
  });

  // S148/CW3 (audit B-I2, the s148 data-layer rotation;
  // docs/remediation-plan-session148.md): a 2xx body that fails res.json()
  // threw ApiError carrying the SUCCESS status — cosmetic today (no caller
  // branches on a 2xx error), dishonest to any future status-branching
  // consumer. The malformed-success family now surfaces 502: the status
  // finally says what happened (the server answered garbage), never a
  // pretend-200.
  it("a malformed 2xx body surfaces ApiError 502, never the pretend-success status (S148/CW3)", async () => {
    const garbageFetch = vi.fn(() =>
      Promise.resolve(new Response("not json at all", { status: 200 })),
    );
    vi.stubGlobal("fetch", garbageFetch);
    try {
      let caught: unknown = null;
      await apiGet("/api/tasks").catch((err: unknown) => {
        caught = err;
      });
      expect(caught).toBeInstanceOf(ApiError);
      const apiErr = caught as ApiError;
      expect(apiErr.status).toBe(502);
      expect(apiErr.status).not.toBe(200);
      // The human message is unchanged (the malformed-response copy).
      expect(apiErr.message).toContain("malformed");
    } finally {
      vi.unstubAllGlobals();
    }
  });
});

// S119/BT2 — the bounded-read seam (docs/remediation-plan-session119.md).
//
// The BS2 cap checked the DECLARED Content-Length before the read and the
// actual length after — but `await request.text()` buffers the whole body
// first, so a `Transfer-Encoding: chunked` request (no Content-Length)
// fully buffered before rejection. The counting reader closes that class:
// the body's ReadableStream is read chunk-by-chunk with a running byte
// count and an ABORT at the cap — chunked bodies are counted AS they are
// read, never buffered past the cap. The seam is PURE over the WHATWG
// Request (explicit args, zero app imports), so the unit layer pins it
// with synthetic streaming bodies — including the PULL-COUNT proof that
// the reader stops at the cap, and the multi-byte split-codepoint decode
// that a naive per-chunk TextDecoder would mojibake.
import { describe, expect, it } from "vitest";

import {
  assertJsonContentType,
  readBodyCapped,
  ValidationError,
} from "@/lib/server/http";

/** A pull-based streaming Request with NO Content-Length (the chunked
 *  shape). Each pull() enqueues exactly one chunk and increments the
 *  counter — the count proves how far the reader walked. */
function streamingRequest(
  chunks: string[],
  pulls: { count: number },
): Request {
  const encoder = new TextEncoder();
  let i = 0;
  const stream = new ReadableStream<Uint8Array>({
    pull(controller) {
      pulls.count += 1;
      if (i < chunks.length) {
        controller.enqueue(encoder.encode(chunks[i]));
        i += 1;
      } else {
        controller.close();
      }
    },
  });
  return new Request("http://localhost/x", {
    method: "POST",
    body: stream,
    // Node's undici requires duplex:"half" for streaming bodies.
    duplex: "half",
  } as RequestInit);
}

/** A body whose bytes split a multi-byte codepoint across chunks. */
function splitSnowmanRequest(): Request {
  const encoder = new TextEncoder();
  const whole = encoder.encode("a☃b");
  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      // whole = [0x61, 0xE2, 0x98, 0x83, 0x62] — split inside the snowman.
      controller.enqueue(whole.slice(0, 3));
      controller.enqueue(whole.slice(3));
      controller.close();
    },
  });
  return new Request("http://localhost/x", {
    method: "POST",
    body: stream,
    duplex: "half",
  } as RequestInit);
}

describe("readBodyCapped (S119/BT2 — the counting reader)", () => {
  it("reads a small chunked body back byte-identical (no Content-Length)", async () => {
    const pulls = { count: 0 };
    const request = streamingRequest(["hello ", "chunked ", "world"], pulls);
    expect(request.headers.get("content-length")).toBeNull();
    await expect(readBodyCapped(request, 10_000)).resolves.toBe(
      "hello chunked world",
    );
  });

  it("rejects an over-cap chunked body at the cap — never reads past it", async () => {
    const chunk = "x".repeat(1000);
    const pulls = { count: 0 };
    // 10 chunks of 1000 bytes against a 2500-byte cap: the reader must
    // stop within chunk 3 — the pull count proves the early exit.
    const request = streamingRequest(Array(10).fill(chunk), pulls);
    await expect(readBodyCapped(request, 2500)).rejects.toBeInstanceOf(
      ValidationError,
    );
    expect(pulls.count).toBeLessThanOrEqual(4);
  });

  it("accepts a body exactly at the cap (the boundary is inclusive)", async () => {
    const pulls = { count: 0 };
    const request = streamingRequest(["ab", "cd"], pulls);
    await expect(readBodyCapped(request, 4)).resolves.toBe("abcd");
  });

  it("decodes multi-byte UTF-8 split across chunks correctly (streaming decoder)", async () => {
    await expect(readBodyCapped(splitSnowmanRequest(), 100)).resolves.toBe(
      "a☃b",
    );
  });

  it("rejects an empty-cap body with the same ValidationError family", async () => {
    const pulls = { count: 0 };
    const request = streamingRequest(["abc"], pulls);
    await expect(readBodyCapped(request, 2)).rejects.toThrow(
      /too large/i,
    );
  });
});

describe("assertJsonContentType (S119/BT1a — the BR5 policy as a shared seam)", () => {
  it("passes when no Content-Type header exists (a bodyless POST — undici auto-sets text/plain on string bodies, so only a bodyless request carries no header)", () => {
    const request = new Request("http://localhost/x", {
      method: "POST",
    });
    expect(request.headers.get("content-type")).toBeNull();
    expect(() => assertJsonContentType(request)).not.toThrow();
  });

  it("passes application/json and application/json; charset=utf-8", () => {
    const a = new Request("http://localhost/x", {
      method: "POST",
      body: "{}",
      headers: { "content-type": "application/json" },
    });
    const b = new Request("http://localhost/x", {
      method: "POST",
      body: "{}",
      headers: { "content-type": "application/json; charset=utf-8" },
    });
    expect(() => assertJsonContentType(a)).not.toThrow();
    expect(() => assertJsonContentType(b)).not.toThrow();
  });

  it("rejects text/plain — the cross-site form-POST smuggling shape", () => {
    const request = new Request("http://localhost/x", {
      method: "POST",
      body: "{}",
      headers: { "content-type": "text/plain" },
    });
    expect(() => assertJsonContentType(request)).toThrow(ValidationError);
    expect(() => assertJsonContentType(request)).toThrow(/valid JSON/i);
  });

  it("rejects multipart/form-data — the native HTML form encoding", () => {
    const request = new Request("http://localhost/x", {
      method: "POST",
      body: "x",
      headers: { "content-type": "multipart/form-data; boundary=x" },
    });
    expect(() => assertJsonContentType(request)).toThrow(ValidationError);
  });
});

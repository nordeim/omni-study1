// S120/BU15 — the session-cookie Secure-flag derivation.
//
// The shipped routes derive `secure` from request.nextUrl.protocol — behind a
// TLS-terminating reverse proxy (the documented Docker posture) the upstream
// request is plain HTTP and the cookie ships WITHOUT Secure over the public
// HTTPS origin. DEPLOYMENT.md:28 tells operators to forward
// X-Forwarded-Proto — but no code read it (the documented mitigation did
// nothing). This seam makes the instruction true: the proxy header wins when
// present; otherwise the request protocol (the shipped behavior).
import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";

import { secureCookieFlag } from "@/lib/auth";

describe("secureCookieFlag (S120/BU15)", () => {
  it("a proxied https request sets Secure even when the upstream protocol is http", () => {
    expect(secureCookieFlag("https", "http:")).toBe(true);
  });

  it("a proxied http request does NOT set Secure (the proxy saw plain HTTP)", () => {
    expect(secureCookieFlag("http", "http:")).toBe(false);
  });

  it("no proxy header + a direct https request sets Secure (the shipped behavior)", () => {
    expect(secureCookieFlag(null, "https:")).toBe(true);
  });

  it("no proxy header + a direct http request does not set Secure (local dev)", () => {
    expect(secureCookieFlag(null, "http:")).toBe(false);
  });

  it("the header is case- and whitespace-tolerant", () => {
    expect(secureCookieFlag("  HTTPS ", "http:")).toBe(true);
    expect(secureCookieFlag("Http", "http:")).toBe(false);
  });

  it("an empty proxy header is treated as absent (falls back to the protocol)", () => {
    expect(secureCookieFlag("", "https:")).toBe(true);
    expect(secureCookieFlag("", "http:")).toBe(false);
  });
});

// S121/BV12 — the comma-joined proxy header.
//
// `headers.get()` JOINS duplicate headers ("https, https" behind a double
// proxy); the strict `=== "https"` comparison fails the joined form and the
// Secure flag is silently dropped. The FIRST comma-separated value is the
// client-most hop's protocol — the comparison reads it.
describe("secureCookieFlag comma-joined headers (S121/BV12)", () => {
  it("a duplicated https header still sets Secure", () => {
    expect(secureCookieFlag("https, https", "http:")).toBe(true);
  });

  it("a joined header whose first value is http does NOT set Secure", () => {
    expect(secureCookieFlag("http, https", "http:")).toBe(false);
  });

  it("a joined header with inner whitespace is normalized before the comparison", () => {
    expect(secureCookieFlag(" HTTPS ,http", "http:")).toBe(true);
    expect(secureCookieFlag("http , https", "http:")).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// S134/CI6b (audit A-L3) — the session-TTL lockstep. The cookie seam's
// SESSION_TTL_SECONDS was a hand-mirrored literal ("mirrors SESSION_TTL_MS"
// in prose only): a future TTL change editing one literal desyncs the cookie
// maxAge from the token exp (cookie outliving token → dead-cookie
// "logged out" confusion; token outliving cookie → silently shorter
// sessions) with no failing test. The fix derives the seconds from the
// milliseconds (the single source) — this pin holds the derivation.
// ---------------------------------------------------------------------------
describe("SESSION_TTL lockstep (S134/CI6b — the cookie maxAge derives from the token TTL)", () => {
  it("SESSION_TTL_SECONDS is derived from SESSION_TTL_MS (never a re-mirrored literal)", async () => {
    const { SESSION_TTL_SECONDS } = await import("@/lib/server/auth");
    const { SESSION_TTL_MS } = await import("@/lib/auth");
    expect(SESSION_TTL_SECONDS).toBe(SESSION_TTL_MS / 1000);
    expect(SESSION_TTL_SECONDS).toBe(7 * 24 * 60 * 60); // the shipped 7-day TTL
  });

  it("the derivation is structural (server/auth re-exports the pure seam's constant, not a twin)", async () => {
    const serverAuth = readFileSync(
      path.resolve(process.cwd(), "src/lib/server/auth.ts"),
      "utf8",
    );
    expect(serverAuth).toMatch(/SESSION_TTL_SECONDS\s*=\s*SESSION_TTL_MS\s*\/\s*1000/);
    expect(serverAuth).not.toMatch(/SESSION_TTL_SECONDS\s*=\s*7\s*\*\s*24/);
  });
});

// ---------------------------------------------------------------------------
// S136/CK3 (audit A-M1) — the SET-path attribute family, previously
// unpinned: setSessionCookie correctly ships httpOnly + sameSite=lax +
// path=/ + the TTL maxAge, but NO test asserted any of them (a regression
// dropping httpOnly — the session readable by any future XSS — or flipping
// sameSite to none shipped with every gate green). The behavioral form
// follows the clear-cookie precedent (NextResponse + the live seam).
// ---------------------------------------------------------------------------
import { NextResponse } from "next/server";
import { setSessionCookie, SESSION_COOKIE_NAME, SESSION_TTL_SECONDS } from "@/lib/server/auth";

describe("setSessionCookie's SET-path attributes (S136/CK3)", () => {
  it("the session cookie ships httpOnly (never document.cookie-readable)", () => {
    const res = setSessionCookie(NextResponse.json({ ok: true }), "user-1");
    expect(res.cookies.get(SESSION_COOKIE_NAME)?.httpOnly).toBe(true);
  });

  it("the session cookie ships SameSite=Lax (the CSRF posture the JSON Content-Type gate completes)", () => {
    const res = setSessionCookie(NextResponse.json({ ok: true }), "user-1");
    expect(res.cookies.get(SESSION_COOKIE_NAME)?.sameSite).toBe("lax");
  });

  it("the session cookie ships Path=/ (scoped to the whole app origin)", () => {
    const res = setSessionCookie(NextResponse.json({ ok: true }), "user-1");
    expect(res.cookies.get(SESSION_COOKIE_NAME)?.path).toBe("/");
  });

  it("the session cookie's maxAge rides the TTL single-source (the 7-day lockstep, on the SET path)", () => {
    const res = setSessionCookie(NextResponse.json({ ok: true }), "user-1");
    expect(res.cookies.get(SESSION_COOKIE_NAME)?.maxAge).toBe(SESSION_TTL_SECONDS);
    expect(SESSION_TTL_SECONDS).toBe(7 * 24 * 60 * 60);
  });
});

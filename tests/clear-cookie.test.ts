// S121/BV2 — the logout-side Secure-flag derivation.
//
// BU15 made the SET path proxy-aware (secureCookieFlag) but the CLEAR path
// still derived `secure` from NODE_ENV: on the documented plain-HTTP Docker
// posture a logout answered `Set-Cookie: sf_session=; Secure; Max-Age=0`,
// which browsers on a non-secure origin DROP (RFC 6265bis) — the 7-day
// stateless session cookie SURVIVED "logout". The fix mirrors setSessionCookie:
// clearSessionCookie accepts `{ secure }` and the logout/delete-account
// routes pass the same proxy-aware derivation they use when setting.
import { NextResponse } from "next/server";

import { describe, expect, it } from "vitest";

import { clearSessionCookie, SESSION_COOKIE_NAME } from "@/lib/server/auth";

describe("clearSessionCookie (S121/BV2)", () => {
  it("honors an explicit secure: true (the proxied-https logout clears a Secure cookie)", () => {
    const res = clearSessionCookie(NextResponse.json({ ok: true }), { secure: true });
    const cookie = res.cookies.get(SESSION_COOKIE_NAME);
    expect(cookie).toBeDefined();
    expect(String(res.headers.get("set-cookie"))).toMatch(/secure/i);
    expect(cookie?.maxAge).toBe(0);
  });

  it("honors an explicit secure: false (the plain-HTTP logout clears WITHOUT Secure — the dropped-cookie hazard)", () => {
    const res = clearSessionCookie(NextResponse.json({ ok: true }), { secure: false });
    expect(res.cookies.get(SESSION_COOKIE_NAME)?.maxAge).toBe(0);
    expect(String(res.headers.get("set-cookie"))).not.toMatch(/secure/i);
  });

  it("the optionless form keeps the documented NODE_ENV default (the backward-compatible signature)", () => {
    const res = clearSessionCookie(NextResponse.json({ ok: true }));
    expect(res.cookies.get(SESSION_COOKIE_NAME)?.maxAge).toBe(0);
    // The test process runs NODE_ENV=test — the legacy default is non-secure.
    expect(String(res.headers.get("set-cookie"))).not.toMatch(/secure/i);
  });
});

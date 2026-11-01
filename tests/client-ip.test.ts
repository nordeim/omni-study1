// S120/BU3 — the declared proxy-hop contract for client-IP extraction.
//
// The shipped clientIp() trusts the raw FIRST x-forwarded-for hop — the PAD
// §6.4 documents the reopen trigger ("an Internet-facing deployment behind a
// reverse proxy must adopt a declared proxy-hop depth") and this seam IS that
// declaration. The pure extraction keeps the legacy first-hop posture when
// TRUSTED_PROXY_HOPS is unset (every e2e XFF pin rides untouched), honors an
// explicit depth (the Nth hop FROM THE RIGHT — the client-supplied left side
// is never trusted), and fails CLOSED (no header trust) when the declaration
// is unparsable or the header is shorter than the declared depth.
import { describe, expect, it } from "vitest";

import { clientIpFromForwarded, parseTrustedProxyHops } from "@/lib/auth";

describe("parseTrustedProxyHops (S120/BU3)", () => {
  it("undefined → undefined (the legacy first-hop posture)", () => {
    expect(parseTrustedProxyHops(undefined)).toBeUndefined();
  });

  it("empty string → undefined (the .env.example placeholder shape)", () => {
    expect(parseTrustedProxyHops("")).toBeUndefined();
  });

  it("'0' → 0 (never trust the header)", () => {
    expect(parseTrustedProxyHops("0")).toBe(0);
  });

  it("'2' → 2 (two trusted reverse proxies)", () => {
    expect(parseTrustedProxyHops("2")).toBe(2);
  });

  it("an unparsable declaration FAILS CLOSED to 0 (header never trusted)", () => {
    expect(parseTrustedProxyHops("two")).toBe(0);
    expect(parseTrustedProxyHops("-1")).toBe(0);
  });
});

describe("clientIpFromForwarded (S120/BU3)", () => {
  it("legacy (undefined): the FIRST hop — the shipped posture, byte-identical", () => {
    expect(clientIpFromForwarded("203.0.113.9, 10.0.0.1", undefined)).toBe("203.0.113.9");
  });

  it("legacy: a missing header falls through (null → the caller's fallback)", () => {
    expect(clientIpFromForwarded(null, undefined)).toBeNull();
  });

  it("legacy: a bare IP (no commas) is the first hop", () => {
    expect(clientIpFromForwarded("198.51.100.7", undefined)).toBe("198.51.100.7");
  });

  it("hops=0: the header is NEVER trusted, even when present", () => {
    expect(clientIpFromForwarded("203.0.113.9, 10.0.0.1", 0)).toBeNull();
  });

  it("hops=1: the LAST hop (the reverse proxy's addition — the client side is untrusted)", () => {
    expect(clientIpFromForwarded("203.0.113.9, 10.0.0.1", 1)).toBe("10.0.0.1");
  });

  it("hops=2: the second hop from the right", () => {
    expect(clientIpFromForwarded("203.0.113.9, 10.0.0.1, 10.0.0.2", 2)).toBe("10.0.0.1");
  });

  it("a header SHORTER than the declared depth fails closed (null)", () => {
    expect(clientIpFromForwarded("10.0.0.1", 2)).toBeNull();
  });

  it("a spoofed LONGER header still yields the declared hop (left-side forgery is inert)", () => {
    expect(clientIpFromForwarded("1.1.1.1, 2.2.2.2, 203.0.113.9, 10.0.0.1", 1)).toBe(
      "10.0.0.1",
    );
  });

  it("whitespace around hops is trimmed", () => {
    expect(clientIpFromForwarded("203.0.113.9 , 10.0.0.1", 1)).toBe("10.0.0.1");
  });
});

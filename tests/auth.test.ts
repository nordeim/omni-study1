import { describe, expect, it } from "vitest";
import {
  checkRateLimit,
  createSessionToken,
  DUMMY_LOGIN_HASH,
  generateResetToken,
  generateVerificationCode,
  hashPassword,
  hashResetToken,
  normalizeVerificationCode,
  readSessionToken,
  resetRateLimit,
  verifyLoginCredentials,
  verifyPassword,
} from "@/lib/auth";

describe("password hashing (scrypt)", () => {
  it("hashes and verifies round-trip", () => {
    const hash = hashPassword("Demo1234!");
    expect(hash).toMatch(/^scrypt\$[0-9a-f]{32}\$[0-9a-f]{128}$/);
    expect(verifyPassword("Demo1234!", hash)).toBe(true);
    expect(verifyPassword("WrongPassword", hash)).toBe(false);
  });

  it("salts every hash (two hashes of the same password differ)", () => {
    expect(hashPassword("same")).not.toBe(hashPassword("same"));
  });

  it("rejects malformed stored hashes without throwing", () => {
    expect(verifyPassword("x", "not-a-hash")).toBe(false);
    expect(verifyPassword("x", "scrypt$only")).toBe(false);
  });
});

describe("session tokens (HMAC)", () => {
  it("round-trips a valid token", () => {
    const token = createSessionToken("user-123");
    const payload = readSessionToken(token);
    expect(payload?.uid).toBe("user-123");
    expect(payload?.exp).toBeGreaterThan(Date.now());
  });

  it("rejects tampered payloads", () => {
    const token = createSessionToken("user-123");
    const [body, mac] = token.split(".");
    const forged = Buffer.from(JSON.stringify({ uid: "attacker", iat: 0, exp: 9e15 })).toString("base64url");
    expect(readSessionToken(`${forged}.${mac}`)).toBeNull();
    expect(readSessionToken(`${body}.deadbeef`)).toBeNull();
  });

  it("rejects structurally invalid tokens", () => {
    expect(readSessionToken("")).toBeNull();
    expect(readSessionToken("no-dot")).toBeNull();
    expect(readSessionToken("a.b.c.d")).toBeNull();
    expect(readSessionToken(`${Buffer.from("not json").toString("base64url")}.x`)).toBeNull();
  });

  it("honors a different AUTH_SECRET (tokens do not survive a key change)", () => {
    const token = createSessionToken("user-123");
    const previous = process.env.AUTH_SECRET;
    process.env.AUTH_SECRET = "a-completely-different-key";
    try {
      expect(readSessionToken(token)).toBeNull();
    } finally {
      if (previous === undefined) delete process.env.AUTH_SECRET;
      else process.env.AUTH_SECRET = previous;
    }
  });
});

describe("login rate limiting", () => {
  const ip = "203.0.113.99";
  it("allows up to the budget then blocks with a retry window", () => {
    resetRateLimit(ip);
    for (let i = 0; i < 10; i++) {
      expect(checkRateLimit(ip).ok).toBe(true);
    }
    const blocked = checkRateLimit(ip);
    expect(blocked.ok).toBe(false);
    expect(blocked.retryAfterSec).toBeGreaterThan(0);
    expect(blocked.retryAfterSec).toBeLessThanOrEqual(900);
  });

  it("counts IPs independently", () => {
    resetRateLimit(ip);
    const other = "198.51.100.7";
    resetRateLimit(other);
    for (let i = 0; i < 10; i++) checkRateLimit(ip);
    expect(checkRateLimit(ip).ok).toBe(false);
    expect(checkRateLimit(other).ok).toBe(true);
    resetRateLimit(other);
  });

  it("resetRateLimit clears the window", () => {
    resetRateLimit(ip);
    for (let i = 0; i < 10; i++) checkRateLimit(ip);
    resetRateLimit(ip);
    expect(checkRateLimit(ip).ok).toBe(true);
  });
});

// S14-C1: the AI routes get a per-user budget. The limiter generalizes to
// checkRateLimit(key, max = MAX_ATTEMPTS) — login/register keep the default
// 10/15 min; the AI routes pass 20. Pinned: the custom max, key isolation,
// and the unchanged default.
describe("checkRateLimit custom budget (S14-C1)", () => {
  const aiKey = "ai:test-user-s14";
  const otherKey = "ai:other-user-s14";
  const loginKey = "login-ip-s14";

  it("honors a custom max (20 requests, the 21st blocked)", () => {
    resetRateLimit(aiKey);
    for (let i = 0; i < 20; i++) {
      expect(checkRateLimit(aiKey, 20).ok).toBe(true);
    }
    const blocked = checkRateLimit(aiKey, 20);
    expect(blocked.ok).toBe(false);
    expect(blocked.retryAfterSec).toBeGreaterThan(0);
    expect(blocked.retryAfterSec).toBeLessThanOrEqual(900);
    resetRateLimit(aiKey);
  });

  it("keys are isolated (an exhausted AI budget does not touch another user or login)", () => {
    resetRateLimit(aiKey);
    resetRateLimit(otherKey);
    resetRateLimit(loginKey);
    for (let i = 0; i < 20; i++) checkRateLimit(aiKey, 20);
    expect(checkRateLimit(aiKey, 20).ok).toBe(false);
    expect(checkRateLimit(otherKey, 20).ok).toBe(true);
    expect(checkRateLimit(loginKey).ok).toBe(true);
    resetRateLimit(aiKey);
    resetRateLimit(otherKey);
    resetRateLimit(loginKey);
  });

  it("the default budget is unchanged when no max is passed (11th blocked)", () => {
    resetRateLimit(loginKey);
    for (let i = 0; i < 10; i++) {
      expect(checkRateLimit(loginKey).ok).toBe(true);
    }
    expect(checkRateLimit(loginKey).ok).toBe(false);
    resetRateLimit(loginKey);
  });
});

// ---------------------------------------------------------------------------
// S15 seams — email-verification + password-reset primitives (the auth-flow
// depth iteration). Pure functions so the routes stay thin shells.
// ---------------------------------------------------------------------------

describe("generateVerificationCode (S15)", () => {
  it("returns exactly 6 digits (leading zeros allowed)", () => {
    for (let i = 0; i < 200; i++) {
      const code = generateVerificationCode();
      expect(code).toMatch(/^\d{6}$/);
    }
  });

  it("covers the full zero-padded range (crypto random, not string-sliced floats)", () => {
    // 2000 samples must include at least one code < 100000 (i.e. a leading
    // zero) — a naive Math.random().toString().slice(2, 8) implementation
    // can never produce one.
    const codes = Array.from({ length: 2000 }, () => Number(generateVerificationCode()));
    expect(codes.some((c) => c < 100000)).toBe(true);
    expect(Math.min(...codes)).toBeGreaterThanOrEqual(0);
    expect(Math.max(...codes)).toBeLessThanOrEqual(999999);
  });

  it("is not constant (actually random)", () => {
    const codes = new Set(Array.from({ length: 50 }, () => generateVerificationCode()));
    expect(codes.size).toBeGreaterThan(1);
  });
});

describe("generateResetToken (S15)", () => {
  it("returns 48 lowercase hex characters (24 random bytes)", () => {
    for (let i = 0; i < 20; i++) {
      expect(generateResetToken()).toMatch(/^[0-9a-f]{48}$/);
    }
  });

  it("never repeats (24 bytes of entropy)", () => {
    const tokens = new Set(Array.from({ length: 200 }, () => generateResetToken()));
    expect(tokens.size).toBe(200);
  });
});

describe("normalizeVerificationCode (S15)", () => {
  it("passes a clean 6-digit code through unchanged", () => {
    expect(normalizeVerificationCode("123456")).toBe("123456");
  });

  it("tolerates pasted formatting (spaces, dashes, dots)", () => {
    expect(normalizeVerificationCode(" 123 456 ")).toBe("123456");
    expect(normalizeVerificationCode("123-456")).toBe("123456");
    expect(normalizeVerificationCode("123.456")).toBe("123456");
  });

  it("rejects non-digit garbage, wrong lengths, and empty input", () => {
    expect(normalizeVerificationCode("12a456")).toBeNull();
    expect(normalizeVerificationCode("12345")).toBeNull();
    expect(normalizeVerificationCode("1234567")).toBeNull();
    expect(normalizeVerificationCode("")).toBeNull();
    expect(normalizeVerificationCode(null)).toBeNull();
    expect(normalizeVerificationCode(undefined)).toBeNull();
  });
});

// S117/BR3 — the login timing equalizer. The miss branch (no such user) must
// burn the SAME scrypt work as the wrong-password branch, or the uniform 401
// leaks a remotely measurable enumeration oracle. The mutant this family
// guards: an early `if (!user) return false` before any scrypt call (the
// pre-S117 login route shape) — the DUMMY_LOGIN_HASH shape pin is what fails
// for it (the dummy must be a real scrypt hash so the burn actually happens).
describe("verifyLoginCredentials (S117/BR3 — the timing equalizer)", () => {
  it("returns true only for the matching password", () => {
    const hash = hashPassword("Demo1234!");
    expect(verifyLoginCredentials({ passwordHash: hash }, "Demo1234!")).toBe(true);
    expect(verifyLoginCredentials({ passwordHash: hash }, "WrongPassword")).toBe(false);
  });

  it("burns the same scrypt work when the user does not exist (no timing oracle)", () => {
    expect(verifyLoginCredentials(null, "anything")).toBe(false);
    expect(verifyLoginCredentials(undefined, "anything")).toBe(false);
  });

  it("DUMMY_LOGIN_HASH is a real scrypt-format hash — the miss branch's burn is genuine", () => {
    // The mutant "dummy = a malformed/empty string" fails here: verifyPassword
    // would early-return false WITHOUT running scrypt, silently reinstating
    // the timing oracle while keeping the helper's boolean contract green.
    expect(DUMMY_LOGIN_HASH).toMatch(/^scrypt\$[0-9a-f]{32}\$[0-9a-f]{128}$/);
    expect(verifyPassword("not-the-dummy-password", DUMMY_LOGIN_HASH)).toBe(false);
  });
});

// S117/BR6 — reset tokens are hashed at rest. The raw 48-hex token rides the
// reset URL (and only the URL); the PasswordResetToken row stores its SHA-256
// digest — a DB read (backup leak, file access) must never yield a live token.
describe("hashResetToken (S117/BR6 — hashed at rest)", () => {
  it("maps any raw token to a deterministic 64-char lowercase hex digest", () => {
    const raw = generateResetToken();
    expect(hashResetToken(raw)).toMatch(/^[0-9a-f]{64}$/);
    expect(hashResetToken(raw)).toBe(hashResetToken(raw));
  });

  it("digests differ from the raw token and between tokens", () => {
    const raw = generateResetToken();
    const digest = hashResetToken(raw);
    expect(digest).not.toBe(raw);
    expect(digest).not.toContain(raw);
    expect(hashResetToken(generateResetToken())).not.toBe(digest);
  });
});

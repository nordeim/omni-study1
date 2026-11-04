import { describe, expect, it, vi } from "vitest";

// S134/CI1 — the scrypt burn census instrument. The mock wraps the REAL
// scryptSync (behavior identical, every other node:crypto export passes
// through untouched) and records each invocation's N — the module-load
// DUMMY mint included (each census pin resets the array first). This is
// the machine guard for the transition equalizer: every login attempt
// must burn EXACTLY one 2^14-scrypt and one 2^17-scrypt, on every branch
// (a dropped complement burn — the naive-migration mutant that reopens
// the ~8× timing account-existence oracle — fails the census).
const scryptBurns = vi.hoisted(() => [] as number[]);
vi.mock("node:crypto", async (importOriginal) => {
  const actual = await importOriginal<typeof import("node:crypto")>();
  return {
    ...actual,
    scryptSync: (
      password: unknown,
      salt: unknown,
      keylen: number,
      options?: { N?: number },
    ) => {
      scryptBurns.push(options?.N ?? 16384);
      return actual.scryptSync(password as never, salt as never, keylen, options);
    },
  };
});

import { scryptSync, createHmac } from "node:crypto";
import {
  needsRehash,
  burnLoginScryptWork,
  SCRYPT_N,
  SCRYPT_R,
  SCRYPT_P,
  checkRateLimit,
  decrementRateLimit,
  rateLimitBucketCount,
  resetAllRateLimits,
  createSessionToken,
  DUMMY_LOGIN_HASH,
  generateResetToken,
  generateVerificationCode,
  hashOtpCode,
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
    // S134/CI1: the 6-part parameter-carrying form — scrypt$N$r$p$salt$key.
    // The round-trip at N=2^17 is ALSO the maxmem regression pin: without
    // the explicit cap both Node and Bun THROW (verified — 128·N·r exceeds
    // the 32 MiB default), so a dropped maxmem fails this pin loudly.
    expect(hash).toMatch(/^scrypt\$131072\$8\$1\$[0-9a-f]{32}\$[0-9a-f]{128}$/);
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

  // S134/CI2 (audit A-M1): the expiry branch was unpinned at every layer —
  // a regression in `if (exp <= Date.now()) return null` (inverted,
  // dropped, off-by-sign) would ship immortal session tokens with a fully
  // green gate. The 7-day TTL is the session-lifecycle guarantee; these
  // pins forge VALIDLY-SIGNED tokens with expired payloads (the tampered-
  // payload technique — the MAC covers the forged body because we sign it
  // ourselves with the same secret, so ONLY the expiry check can reject).
  it("rejects a validly-signed token whose exp is in the past (S134/CI2)", () => {
    const previous = process.env.AUTH_SECRET;
    process.env.AUTH_SECRET = "expiry-pin-secret";
    try {
      const body = Buffer.from(
        JSON.stringify({ uid: "user-123", iat: 0, exp: Date.now() - 1000, v: 0 }),
      ).toString("base64url");
      const mac = createHmac("sha256", "expiry-pin-secret").update(body).digest("base64url");
      expect(readSessionToken(`${body}.${mac}`)).toBeNull();
    } finally {
      if (previous === undefined) delete process.env.AUTH_SECRET;
      else process.env.AUTH_SECRET = previous;
    }
  });

  it("rejects at the exact boundary (exp === now — `<=`, not `<`) (S134/CI2)", () => {
    const previous = process.env.AUTH_SECRET;
    process.env.AUTH_SECRET = "expiry-pin-secret";
    try {
      const body = Buffer.from(
        JSON.stringify({ uid: "user-123", iat: 0, exp: Date.now(), v: 0 }),
      ).toString("base64url");
      const mac = createHmac("sha256", "expiry-pin-secret").update(body).digest("base64url");
      expect(readSessionToken(`${body}.${mac}`)).toBeNull();
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
    // S134/CI1 re-anchor: the dummy rides the 6-part current-parameter form.
    expect(DUMMY_LOGIN_HASH).toMatch(
      /^scrypt\$131072\$8\$1\$[0-9a-f]{32}\$[0-9a-f]{128}$/,
    );
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

// S118/BS1 — the session-version family: the token carries v so a password
// reset can revoke every session issued before it (getCurrentUser compares
// the token's v against the user's sessionVersion column).
describe("session tokens carry the session version (S118/BS1)", () => {
  it("embeds the given version and reads it back", () => {
    const payload = readSessionToken(createSessionToken("user-123", 3));
    expect(payload?.uid).toBe("user-123");
    expect(payload?.v).toBe(3);
  });

  it("defaults the version to 0 (pre-BS1 cookies keep working across the deploy)", () => {
    const payload = readSessionToken(createSessionToken("user-123"));
    expect(payload?.v).toBe(0);
  });

  it("signs different versions into different tokens", () => {
    expect(createSessionToken("user-123", 1)).not.toBe(createSessionToken("user-123", 2));
  });
});

// S120/BU6 — the limiter bucket eviction. The module-level `buckets` Map was
// never swept: every distinct key (every client IP — and under a forged
// X-FF, every spoofed string) created a PERMANENT entry, a remotely-driven
// unbounded memory leak. The fix: a lazy sweep at the size cap — expired
// buckets are deleted before a new key inserts (bounded memory, no timers,
// and live-window buckets always survive). The observable:
// rateLimitBucketCount() (the resetRateLimit kin — a test/ops probe).
describe("rate-limiter bucket eviction (S120/BU6)", () => {
  it("an expired mass is swept at the cap (bounded memory across distinct keys)", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-11-01T10:00:00Z"));
    resetAllRateLimits();
    try {
      for (let i = 0; i < 2100; i++) checkRateLimit(`evict-old-${i}`, 5);
      // Advance past the 15-minute window: every bucket above is expired.
      vi.setSystemTime(new Date("2026-11-01T10:20:00Z"));
      // The next insert trips the cap sweep — the expired mass is gone
      // and the Map holds only the new key (pre-fix: 2101 and growing).
      checkRateLimit("evict-old-trigger", 5);
      expect(rateLimitBucketCount()).toBe(1);
      // The aged key re-arms fresh (its expired bucket was swept, not kept).
      const reArmed = checkRateLimit("evict-old-7", 5);
      expect(reArmed.ok).toBe(true);
    } finally {
      resetAllRateLimits();
      vi.useRealTimers();
    }
  });

  it("live-window buckets are NEVER swept (the cap does not evict fresh state)", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-11-01T10:00:00Z"));
    resetAllRateLimits();
    try {
      for (let i = 0; i < 2100; i++) checkRateLimit(`evict-mix-old-${i}`, 5);
      // 14 minutes later: still inside the window — nothing is expired.
      vi.setSystemTime(new Date("2026-11-01T10:14:00Z"));
      for (let i = 0; i < 50; i++) checkRateLimit(`evict-mix-live-${i}`, 5);
      // 2 more minutes: the first 2100 expire, the 50 stay live.
      vi.setSystemTime(new Date("2026-11-01T10:16:00Z"));
      checkRateLimit("evict-mix-trigger", 5);
      // The sweep kept exactly the 50 live buckets + the trigger key.
      expect(rateLimitBucketCount()).toBe(51);
      // A live bucket still enforces its own window.
      for (let i = 0; i < 4; i++) checkRateLimit("evict-mix-live-7", 5);
      expect(checkRateLimit("evict-mix-live-7", 5).ok).toBe(false);
    } finally {
      resetAllRateLimits();
      vi.useRealTimers();
    }
  });
});

// S121/BV9 — the limiter's HARD cap.
//
// BU6's sweep only deletes EXPIRED windows: ≥2048 distinct LIVE keys within
// one 15-minute window (per-request forged X-Forwarded-For under the legacy
// first-hop posture) free nothing and the Map still grows at request rate.
// The hard cap: when the sweep at capacity frees nothing, the OLDEST live
// bucket (min windowStart) is evicted before the insert — bounded memory
// even under an all-live flood. The evicted key re-arms a fresh window (the
// limiter fails open for that one key — the documented single-node
// trade-off).
describe("rate-limiter hard cap under an all-live flood (S121/BV9)", () => {
  it("the map never exceeds MAX_BUCKETS when the sweep frees nothing (the oldest live bucket is evicted)", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-11-01T10:00:00Z"));
    resetAllRateLimits();
    try {
      // Exactly the cap: 2048 distinct live keys, all inside the window.
      for (let i = 0; i < 2048; i++) checkRateLimit(`flood-live-${i}`, 5);
      expect(rateLimitBucketCount()).toBe(2048);
      // One more distinct key: the sweep finds NOTHING expired — the oldest
      // bucket is evicted and the size stays at the cap (pre-fix: 2049).
      checkRateLimit("flood-next", 5);
      expect(rateLimitBucketCount()).toBe(2048);
      // The EVICTED key (flood-live-0, the oldest windowStart) re-arms fresh.
      expect(checkRateLimit("flood-live-0", 5).ok).toBe(true);
      // The newest keys are untouched — a mid-flood key still enforces.
      for (let i = 0; i < 4; i++) checkRateLimit("flood-live-1000", 5);
      expect(checkRateLimit("flood-live-1000", 5).ok).toBe(false);
    } finally {
      resetAllRateLimits();
      vi.useRealTimers();
    }
  });
});

// S137/CL8 (Mode-C audit F2) — the global-bucket eviction exemption. The
// containment budgets (`loginGlobal:`, `registerGlobal:`) lived in the
// shared 2048-cap bucket map with NO key protection: a distinct-key flood
// on the per-IP-only routes (verify/resend/forgot with rotated XFF —
// cheap, no scrypt burn, unlimited distinct live keys) fills the map, and
// the oldest-first eviction can delete a GLOBAL bucket mid-flood,
// restarting its count at 1 — the CK1 CPU-DoS bound quietly re-arms. The
// fix: evictOldestBucket skips the fixed process-wide budget keys (the
// `Global:` family — a tiny, always-live, attacker-unreachable set of at
// most 2 keys; the eviction always finds a non-global oldest). The map's
// bound stays MAX_BUCKETS: the exemption only chooses the eviction
// VICTIM, it never skips the eviction itself.
describe("the global-bucket eviction exemption (S137/CL8)", () => {
  it("a loginGlobal: bucket SURVIVES a distinct-key flood past the cap (pre-fix: evicted as the oldest live entry)", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-11-01T10:00:00Z"));
    resetAllRateLimits();
    try {
      // The containment bucket, spent to its budget of 1 — the oldest
      // live entry in the map (inserted first under frozen fake time).
      expect(checkRateLimit("loginGlobal:", 1).ok).toBe(true);
      // The cross-route pressure shape: 2100 distinct live keys (past
      // MAX_BUCKETS=2048 — the sweep frees nothing, the eviction path
      // fires repeatedly). Pre-fix the loginGlobal: bucket (the oldest)
      // was the FIRST eviction victim.
      for (let i = 0; i < 2100; i++) checkRateLimit(`cl8-flood-${i}`, 5);
      // The exemption: the containment bucket survived WITH its spend —
      // the next check is still blocked. Pre-fix: the bucket was evicted
      // and this call re-created it fresh → ok: true (the RED state).
      expect(checkRateLimit("loginGlobal:", 1).ok).toBe(false);
      // The map's bound held (the eviction still ran — non-global
      // victims only; the exemption never skips the eviction).
      expect(rateLimitBucketCount()).toBeLessThanOrEqual(2048);
    } finally {
      resetAllRateLimits();
      vi.useRealTimers();
    }
  });
});

// S138/CM1 (audits AI-1 + Mode-C F1 — the CL8 residual) — the exemption's
// crafted-key hardening. The S137/CL8 exemption shipped as a SUBSTRING
// test (`key.includes("Global:")`) over key material whose per-IP half
// embeds the RAW, forgeable first x-forwarded-for entry under the default
// (unset TRUSTED_PROXY_HOPS) posture: a forged `X-Forwarded-For:
// Global:<unique>` mints `verify:Global:<unique>` / `resend:` / `forgot:`
// / `reset:` buckets on the four unauthenticated per-IP-only routes —
// every one eviction-exempt. Once the live map is all-exempt the eviction
// deletes NOTHING and the unconditional insert grows the map past the
// S121/BV9 hard cap (the documented "bounded at MAX_BUCKETS even under
// the flood" invariant was FALSE under this shape; the CL8 pin's
// `cl8-flood-${i}` keys never contained the substring, so the hole was
// unpinned). The fix: the exemption is an EXACT-KEY whitelist of the two
// real process-wide budget keys (loginGlobal:, registerGlobal: — the only
// two Global: mint sites in the tree), so client-derived material can
// never manufacture an exempt key.
describe("the exemption exact-key whitelist (S138/CM1)", () => {
  it("a CRAFTED-key flood ('Global:' inside forged per-IP keys) cannot grow the map past the cap — the crafted keys evict like any other (pre-fix: every one exempt, unbounded)", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-11-01T10:00:00Z"));
    resetAllRateLimits();
    try {
      // The real containment bucket, spent to its budget of 1.
      expect(checkRateLimit("loginGlobal:", 1).ok).toBe(true);
      // The attacker's shape: 2100 distinct keys that each CONTAIN the
      // exempt substring (the exact forged-XFF form
      // `verify:Global:<i>`). Pre-fix all 2100 were exemption-matched →
      // the eviction never found a victim → the map grew past 2048.
      for (let i = 0; i < 2100; i++) checkRateLimit(`verify:Global:${i}`, 5);
      // The S121/BV9 bound RESTORED: the crafted keys are not the two
      // real budget keys, so they evict each other like any flood.
      expect(rateLimitBucketCount()).toBeLessThanOrEqual(2048);
      // The exemption's INTENT survives: the real loginGlobal: bucket
      // kept its spend through the crafted-key pressure.
      expect(checkRateLimit("loginGlobal:", 1).ok).toBe(false);
    } finally {
      resetAllRateLimits();
      vi.useRealTimers();
    }
  });
});

// S138/CM3 (audit AI-2) — the loginGlobal: success DECREMENT. The login
// route's success path fully DELETED the aggregate global bucket
// (resetRateLimit): under the default ADR-013 in-band posture (open
// registration + the OTP in the response) valid credentials are
// scriptable, so a credentialed attacker alternating 39 failed logins + 1
// successful one reset the S136/CK1 process-wide CPU containment to zero
// forever — the exact single-worker-starvation threat CK1 was built to
// bound. The fix: an aggregate budget's reset must not be grantable by
// ONE of its many requesters — a success proves THAT requester is
// legitimate, not that the window's other 39 spends were. Successes now
// DECREMENT the global (net-of-successes progressive model: only failed
// logins accumulate); the per-IP and per-account buckets still fully
// reset (their key material IS the proven requester).
describe("decrementRateLimit (S138/CM3 — the aggregate-budget seam)", () => {
  it("decrements a spent bucket without re-arming its window", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-11-01T10:00:00Z"));
    resetAllRateLimits();
    try {
      checkRateLimit("loginGlobal:", 40);
      checkRateLimit("loginGlobal:", 40);
      checkRateLimit("loginGlobal:", 40);
      decrementRateLimit("loginGlobal:");
      // count 3 → 2: the bucket still enforces at its budget, and the
      // window NEVER re-arms (the reset form would delete the bucket and
      // re-create it fresh on the next check — the exact defeat shape).
      expect(checkRateLimit("loginGlobal:", 3).ok).toBe(true);
      expect(checkRateLimit("loginGlobal:", 3).ok).toBe(false);
      expect(rateLimitBucketCount()).toBe(1);
    } finally {
      resetAllRateLimits();
      vi.useRealTimers();
    }
  });

  it("floors at zero — a success-heavy window never re-arms the budget from below", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-11-01T10:00:00Z"));
    resetAllRateLimits();
    try {
      checkRateLimit("loginGlobal:", 40);
      decrementRateLimit("loginGlobal:");
      decrementRateLimit("loginGlobal:");
      decrementRateLimit("loginGlobal:");
      // count floored at 0: the next check re-inserts at count 1, never a
      // negative count (a negative floor would make the budget DEEPER
      // than fresh — the inverted containment).
      expect(checkRateLimit("loginGlobal:", 1).ok).toBe(true);
      expect(checkRateLimit("loginGlobal:", 1).ok).toBe(false);
    } finally {
      resetAllRateLimits();
      vi.useRealTimers();
    }
  });

  it("is a no-op on a missing key (an expired-or-never-minted bucket never throws)", () => {
    resetAllRateLimits();
    expect(() => decrementRateLimit("loginGlobal:")).not.toThrow();
    expect(rateLimitBucketCount()).toBe(0);
  });
});

// S131/CF7 — the OTP digest family (docs/remediation-plan-session131.md).
//
// The BR6 posture extended to the OTP: a DB read must never yield a live
// sign-in credential, and a correct code SIGNS THE CALLER IN
// (verify-email sets the session cookie). hashResetToken (the existing
// SHA-256 seam) now digests codes at rest; these pins hold the digest
// family's behavior on the OTP shape.
describe("the OTP digest family (S131/CF7)", () => {
  it("digests a 6-digit code deterministically to the 64-hex form (the BR6 shape)", () => {
    const code = generateVerificationCode();
    expect(code).toMatch(/^\d{6}$/);
    const digest = hashResetToken(code);
    expect(digest).toMatch(/^[0-9a-f]{64}$/);
    expect(hashResetToken(code)).toBe(digest); // deterministic (DB-matchable)
    const normalized = normalizeVerificationCode(` ${code} `);
    expect(normalized).toBe(code); // the whitespace-tolerant intake
    expect(hashResetToken(normalized as string)).toBe(digest); // the normalize-then-digest pipeline verifies
  });

  it("two different codes never collide in digest space (the 6-digit space stays distinguishable)", () => {
    const a = generateVerificationCode();
    let b = generateVerificationCode();
    if (a === b) b = a === "000000" ? "000001" : "000000";
    expect(hashResetToken(a)).not.toBe(hashResetToken(b));
  });
});

// S132/CG2 — the PEPPERED OTP digest family
// (docs/remediation-plan-session132.md).
//
// The s132 crypto audit's M2: hashResetToken is unkeyed SHA-256, and the
// 6-digit OTP space (10^6) is exhaustively hashed offline in under a
// second — CF7's "a DB read must never yield a live sign-in credential"
// guarantee was mathematically void for the OTP family (it holds for the
// 24-byte reset token, whose entropy makes the offline search
// infeasible). The peppered seam HMACs the code with the session secret:
// offline brute force now requires AUTH_SECRET, which a DB read does not
// include. Deterministic per-process so the DB lookups still match.
describe("the peppered OTP digest family (S132/CG2)", () => {
  it("digests a 6-digit code deterministically to the 64-hex form (the BR6 shape, DB-matchable)", () => {
    const code = generateVerificationCode();
    const digest = hashOtpCode(code);
    expect(digest).toMatch(/^[0-9a-f]{64}$/);
    expect(hashOtpCode(code)).toBe(digest); // deterministic
    const normalized = normalizeVerificationCode(` ${code} `);
    expect(normalized).toBe(code); // the whitespace-tolerant intake
    expect(hashOtpCode(normalized as string)).toBe(digest); // the normalize-then-digest pipeline verifies
  });

  it("is PEPPERED — never equal to the unkeyed reset-token digest of the same input", () => {
    const code = "042981";
    expect(hashOtpCode(code)).not.toBe(hashResetToken(code));
  });

  it("changes with the secret (offline brute force requires AUTH_SECRET — the brute-force-resistance property)", () => {
    const code = "042981";
    const withA = hashOtpCode(code, "a".repeat(32));
    const withB = hashOtpCode(code, "b".repeat(32));
    expect(withA).not.toBe(withB);
    expect(withA).toMatch(/^[0-9a-f]{64}$/);
    expect(withB).toMatch(/^[0-9a-f]{64}$/);
  });

  it("two different codes never collide in digest space under one secret", () => {
    const secret = "c".repeat(32);
    const a = "000000";
    const b = "000001";
    expect(hashOtpCode(a, secret)).not.toBe(hashOtpCode(b, secret));
  });
});

// ---------------------------------------------------------------------------
// S134/CI1 — the scrypt KDF parameter/versioning migration (B-L3, deferred
// the sixth time — this cycle is its measured availability close).
//
// The pre-migration seam used Node's scryptSync DEFAULTS (N=16384/2^14,
// r=8, p=1 — 16 MiB) — 8× below the OWASP Password Storage Cheat Sheet
// floor (N >= 2^17 = 128 MiB) — and the stored format carried NO parameter
// discriminator, so a silent N-raise would lock out every pre-migration
// row (byte-shape-identical hashes, no parse error). The migration: the
// 6-part parameter-carrying format (scrypt$N$r$p$salt$key), dual-verify of
// the legacy 3-part form at the Node-default set, rehash-on-login as the
// drain, the explicit maxmem at every call site (verified: both Node 24 and
// Bun 1.3.14 THROW at N=2^17 without it — 128·N·r exceeds the 32 MiB
// default), and the TRANSITION EQUALIZER: while legacy rows drain, every
// login attempt burns exactly ONE 2^14-scrypt and ONE 2^17-scrypt so the
// {no-user, legacy-row, current-row} branches stay timing-identical (the
// naive migration would reopen the ~8× account-existence oracle the
// S117/BR3 + S132/CG1 lineage closed).
// ---------------------------------------------------------------------------

/** The pre-S134 mint shape, hand-built at the Node-default parameter set —
 *  exactly what the 3-part legacy rows in an aged deployment carry. */
function legacyHash(password: string): string {
  const salt = Buffer.from("a1b2c3d4e5f60718a1b2c3d4e5f60718", "hex"); // 16 bytes
  const derived = scryptSync(password, salt, 64); // no options — the defaults
  return `scrypt$${salt.toString("hex")}$${derived.toString("hex")}`;
}

describe("the S134/CI1 scrypt KDF migration", () => {
  it("exports the current OWASP-floor parameter set (N=2^17, r=8, p=1)", () => {
    expect(SCRYPT_N).toBe(131072);
    expect(SCRYPT_R).toBe(8);
    expect(SCRYPT_P).toBe(1);
  });

  it("hashPassword embeds its parameters in the 6-part form (the discriminator a silent N-raise needs)", () => {
    const hash = hashPassword("Demo1234!");
    const parts = hash.split("$");
    expect(parts).toHaveLength(6);
    expect(parts[0]).toBe("scrypt");
    expect(Number(parts[1])).toBe(SCRYPT_N);
    expect(Number(parts[2])).toBe(SCRYPT_R);
    expect(Number(parts[3])).toBe(SCRYPT_P);
    // the legacy mint never carried params — the two forms are distinguishable
    expect(legacyHash("Demo1234!").split("$")).toHaveLength(3);
  });

  it("verifies a LEGACY 3-part hash at the Node-default set (dual-verify — the migration never locks out aged rows)", () => {
    const stored = legacyHash("AgedPassword1!");
    expect(verifyPassword("AgedPassword1!", stored)).toBe(true);
    expect(verifyPassword("WrongPassword", stored)).toBe(false);
  });

  it("needsRehash: the legacy form upgrades, the current form does not, malformed rows fail safe", () => {
    expect(needsRehash(legacyHash("x"))).toBe(true);
    expect(needsRehash(hashPassword("x"))).toBe(false);
    expect(needsRehash("not-a-hash")).toBe(true);
    expect(needsRehash("scrypt$only")).toBe(true);
  });

  it("fails CLOSED on 6-part rows whose parameters are not the shipped current set (hostile/corrupt rows cannot induce oversized allocs)", () => {
    const minted = hashPassword("Demo1234!");
    const parts = minted.split("$");
    const rebuild = (n: string, r: string, p: string) =>
      ["scrypt", n, r, p, parts[4], parts[5]].join("$");
    // legacy numbers inside the 6-part form (never minted that way)
    expect(verifyPassword("Demo1234!", rebuild("16384", "8", "1"))).toBe(false);
    // a future/hypothetical raise, not yet accepted by this build
    expect(verifyPassword("Demo1234!", rebuild("262144", "8", "1"))).toBe(false);
    // parameter drift on r/p
    expect(verifyPassword("Demo1234!", rebuild("131072", "16", "1"))).toBe(false);
    expect(verifyPassword("Demo1234!", rebuild("131072", "8", "2"))).toBe(false);
    // non-numeric / non-hex / wrong-length payloads
    expect(verifyPassword("Demo1234!", rebuild("notanumber", "8", "1"))).toBe(false);
    expect(verifyPassword("Demo1234!", ["scrypt", "131072", "8", "1", "zzzz", parts[5]].join("$"))).toBe(false);
    expect(verifyPassword("Demo1234!", ["scrypt", "131072", "8", "1", parts[4], "a1b2c3d4"].join("$"))).toBe(false);
    // 4- and 5-part shapes (neither form)
    expect(verifyPassword("Demo1234!", ["scrypt", parts[4], parts[5], "extra"].join("$"))).toBe(false);
  });

  it("the burn census: a login attempt against a CURRENT-hash user burns exactly one 2^17 verify + one 2^14 complement (the transition equalizer)", () => {
    scryptBurns.length = 0;
    const stored = hashPassword("census-password");
    scryptBurns.length = 0; // the mint's burn excluded — the ATTEMPT is the unit
    expect(verifyLoginCredentials({ passwordHash: stored }, "census-password")).toBe(true);
    expect(scryptBurns).toEqual([131072, 16384]);
    scryptBurns.length = 0;
    expect(verifyLoginCredentials({ passwordHash: stored }, "wrong-password")).toBe(false);
    expect(scryptBurns).toEqual([131072, 16384]);
  });

  it("the burn census: a login attempt against a LEGACY-hash user burns the mirrored pair (2^14 verify + 2^17 complement) — the SAME total", () => {
    const stored = legacyHash("legacy-census");
    scryptBurns.length = 0;
    expect(verifyLoginCredentials({ passwordHash: stored }, "legacy-census")).toBe(true);
    expect(scryptBurns).toEqual([16384, 131072]);
    scryptBurns.length = 0;
    expect(verifyLoginCredentials({ passwordHash: stored }, "wrong-password")).toBe(false);
    expect(scryptBurns).toEqual([16384, 131072]);
  });

  it("the burn census: the no-user miss branch burns the dummy's current pair — identical totals across the branch matrix (no reopened oracle)", () => {
    scryptBurns.length = 0;
    expect(verifyLoginCredentials(null, "anything")).toBe(false);
    expect(scryptBurns).toEqual([131072, 16384]);
    scryptBurns.length = 0;
    expect(verifyLoginCredentials(undefined, "anything")).toBe(false);
    expect(scryptBurns).toEqual([131072, 16384]);
  });

  it("the burn census: a MALFORMED stored row still burns the full pair (verify burns nothing parseable — the complement burns both sets)", () => {
    scryptBurns.length = 0;
    expect(verifyLoginCredentials({ passwordHash: "corrupt-row" }, "anything")).toBe(false);
    expect(scryptBurns).toEqual([16384, 131072]);
  });

  it("burnLoginScryptWork (the exhausted-account branch's burn, S132/CG1 upgraded) costs the same pair as every other login attempt", () => {
    scryptBurns.length = 0;
    burnLoginScryptWork("probe-password");
    expect(scryptBurns).toEqual([131072, 16384]);
  });
});

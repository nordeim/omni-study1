// ---------------------------------------------------------------------------
// Auth primitives: scrypt password hashing, HMAC session tokens, the shared
// in-memory rate limiter, and the S15 verification/reset seam functions.
// Pure — unit-pinned by tests/auth.test.ts. The cookie/server helpers that
// need next/headers live in src/lib/server/auth.ts (documented layering).
// ---------------------------------------------------------------------------

import {
  createHash,
  createHmac,
  randomBytes,
  randomInt,
  randomFillSync,
  scryptSync,
  timingSafeEqual,
} from "node:crypto";

import { DEV_FALLBACK_SECRET } from "./env-check";

export { DEV_FALLBACK_SECRET };

const SCRYPT_KEYLEN = 64;
export const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

// ---- password hashing (scrypt) ----------------------------------------------

/** Format: scrypt$<16-byte salt hex>$<64-byte derived key hex> */
export function hashPassword(password: string): string {
  const salt = randomBytes(16);
  const derived = scryptSync(password, salt, SCRYPT_KEYLEN);
  return `scrypt$${salt.toString("hex")}$${derived.toString("hex")}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const parts = stored.split("$");
  if (parts.length !== 3 || parts[0] !== "scrypt") return false;
  const salt = Buffer.from(parts[1], "hex");
  const expected = Buffer.from(parts[2], "hex");
  if (salt.length !== 16 || expected.length !== SCRYPT_KEYLEN) return false;
  const derived = scryptSync(password, salt, SCRYPT_KEYLEN);
  return timingSafeEqual(derived, expected);
}

// ---- login timing equalizer (S117/BR3) ---------------------------------------

/** A real scrypt hash of an unknowable random password — the stand-in burned
 * by the login miss branch so "no such user" costs the same scrypt work as
 * "wrong password" (no remotely measurable enumeration oracle under the
 * uniform 401). Unit-pinned by tests/auth.test.ts (the shape pin is what
 * fails the "dummy = malformed string" mutant that would silently restore
 * the oracle while keeping the boolean contract green). */
export const DUMMY_LOGIN_HASH: string = hashPassword(generateResetToken());

/** The login credential check WITH the timing equalizer: the scrypt burn
 * happens for every attempt (real hash or the dummy); the result is true
 * only when the user exists AND the password matches. */
export function verifyLoginCredentials(
  user: { passwordHash: string } | null | undefined,
  password: string,
): boolean {
  const ok = verifyPassword(password, user?.passwordHash ?? DUMMY_LOGIN_HASH);
  return ok && user != null;
}

// ---- session tokens (HMAC over { uid, iat, exp, v }) ------------------------

function sessionSecret(): string {
  return process.env.AUTH_SECRET?.trim() || DEV_FALLBACK_SECRET;
}

function b64url(input: Buffer | string): string {
  return Buffer.from(input).toString("base64url");
}

/** The session-version embedding (S118/BS1): the token carries the user's
 * sessionVersion at issue time so a password reset (the possible-attacker
 * path — anyone can request a reset for any address under the documented
 * in-response delivery) revokes every session issued before it. A token
 * with no v reads as 0 — cookies issued before this change keep working
 * across the deploy. */
export function createSessionToken(userId: string, sessionVersion: number = 0): string {
  const payload = { uid: userId, iat: Date.now(), exp: Date.now() + SESSION_TTL_MS, v: sessionVersion };
  const body = b64url(JSON.stringify(payload));
  const mac = createHmac("sha256", sessionSecret()).update(body).digest("base64url");
  return `${body}.${mac}`;
}

export function readSessionToken(token: string): { uid: string; iat: number; exp: number; v: number } | null {
  const parts = token.split(".");
  if (parts.length !== 2 || !parts[0] || !parts[1]) return null;
  const [body, mac] = parts;
  const expected = createHmac("sha256", sessionSecret()).update(body).digest();
  let given: Buffer;
  try {
    given = Buffer.from(mac, "base64url");
  } catch {
    return null;
  }
  if (given.length !== expected.length || !timingSafeEqual(given, expected)) return null;
  try {
    const payload: unknown = JSON.parse(Buffer.from(body, "base64url").toString());
    if (typeof payload !== "object" || payload === null) return null;
    const { uid, iat, exp } = payload as Record<string, unknown>;
    if (typeof uid !== "string" || typeof iat !== "number" || typeof exp !== "number") return null;
    if (exp <= Date.now()) return null;
    // Missing v (a pre-S118 token) reads as 0 — the deploy-compat shape.
    const v = typeof (payload as Record<string, unknown>).v === "number" ? (payload as { v: number }).v : 0;
    return { uid, iat, exp, v };
  } catch {
    return null;
  }
}

// ---- rate limiting (in-memory; single instance only — documented) --------------

export const MAX_ATTEMPTS = 10;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes

type Bucket = { count: number; windowStart: number };
const buckets = new Map<string, Bucket>();

export type RateLimitResult = { ok: boolean; retryAfterSec: number };

export function checkRateLimit(key: string, max: number = MAX_ATTEMPTS): RateLimitResult {
  const now = Date.now();
  const bucket = buckets.get(key);
  if (!bucket || now - bucket.windowStart >= WINDOW_MS) {
    if (buckets.size >= MAX_BUCKETS) {
      sweepExpiredBuckets(now);
      // S121/BV9: the HARD cap — when the sweep frees nothing (an all-live
      // flood: ≥2048 distinct keys inside one window, per-request forged
      // X-Forwarded-For under the legacy posture), evict the OLDEST live
      // bucket before inserting. The map is bounded at MAX_BUCKETS even
      // under the flood; the evicted key re-arms a fresh window (the
      // limiter fails open for that one key — the documented single-node
      // trade-off, strictly better than unbounded growth).
      if (buckets.size >= MAX_BUCKETS) evictOldestBucket();
    }
    buckets.set(key, { count: 1, windowStart: now });
    return { ok: true, retryAfterSec: 0 };
  }
  if (bucket.count >= max) {
    const retryAfterSec = Math.max(1, Math.ceil((bucket.windowStart + WINDOW_MS - now) / 1000));
    return { ok: false, retryAfterSec: Math.min(retryAfterSec, 900) };
  }
  bucket.count += 1;
  return { ok: true, retryAfterSec: 0 };
}

export function resetRateLimit(key: string): void {
  buckets.delete(key);
}

/** S120/BU6: the size observable — the eviction contract's test/ops probe. */
export function rateLimitBucketCount(): number {
  return buckets.size;
}

/** S120/BU6: the test/ops drain — clears every bucket (the eviction pins
 *  assert exact sizes, so each pin starts from a drained map). */
export function resetAllRateLimits(): void {
  buckets.clear();
}

// S120/BU6 — the eviction. The buckets Map was never swept: every distinct
// key (every client IP — and under a forged X-Forwarded-For, every spoofed
// string) created a PERMANENT entry, a remotely-driven unbounded memory
// leak. The fix is a lazy sweep at the cap: before inserting a NEW key when
// the map is at capacity, every expired-window bucket is deleted (bounded
// memory, no timers, live-window buckets always survive).
const MAX_BUCKETS = 2048;

function sweepExpiredBuckets(now: number): void {
  for (const [key, bucket] of buckets) {
    if (now - bucket.windowStart >= WINDOW_MS) buckets.delete(key);
  }
}

/** S121/BV9: the hard-cap eviction — the oldest live bucket (min
 * windowStart) is removed so a distinct-key flood can never grow the map
 * past the cap. Deterministic: ties break on first-insertion order (the
 * Map iteration order), the same order windowStart monotonicity gives. */
function evictOldestBucket(): void {
  let oldestKey: string | null = null;
  let oldestStart = Infinity;
  for (const [key, bucket] of buckets) {
    if (bucket.windowStart < oldestStart) {
      oldestStart = bucket.windowStart;
      oldestKey = key;
    }
  }
  if (oldestKey !== null) buckets.delete(oldestKey);
}

// ---- S15 seams: verification codes + reset tokens -------------------------------

/** Exactly 6 digits, full zero-padded range (crypto random, not string
 * floats). S126/CA17: randomInt replaces the getUint32 % 1_000_000 form —
 * the modulo had a +0.023% relative bias toward codes 0-967,295 (2^32 is
 * not a multiple of 10^6); rejection-quality sampling is free and the
 * attempt caps make it moot in practice anyway. */
export function generateVerificationCode(): string {
  const value = randomInt(0, 1_000_000);
  return value.toString().padStart(6, "0");
}

/** 48 lowercase hex characters (24 random bytes). */
export function generateResetToken(): string {
  return randomBytes(24).toString("hex");
}

/** SHA-256 digest of a reset token — the AT-REST form (S117/BR6). The raw
 * 48-hex token rides the reset URL and is never persisted; the
 * PasswordResetToken row stores this digest so a DB read (backup leak, file
 * access) cannot yield a live account-takeover token. Lookup hashes the
 * presented token before touching the index. */
export function hashResetToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

/** Tolerate pasted formatting; reject non-digit garbage and wrong lengths. */
export function normalizeVerificationCode(
  input: string | null | undefined,
): string | null {
  if (typeof input !== "string") return null;
  const cleaned = input.replace(/[\s.-]/g, "");
  return /^\d{6}$/.test(cleaned) ? cleaned : null;
}

// ---- S120/BU3: the declared proxy-hop contract ------------------------------------
//
// clientIp() trusted the raw FIRST x-forwarded-for hop — every per-IP budget
// was bypassable with a per-request forged header (the PAD §6.4 documented
// reopen trigger). TRUSTED_PROXY_HOPS declares the reverse-proxy depth:
//   unset  → the legacy first-hop posture (single-node dev/demo — the e2e
//            suite's own XFF pins keep their semantics);
//   0      → the header is never trusted (direct-exposure posture);
//   N >= 1 → the Nth hop FROM THE RIGHT (the client-supplied left side is
//            never trusted); a header shorter than the declared depth fails
//            CLOSED (null — the caller falls back to the direct address);
//   unparsable → 0 (fail closed: the skill §16 "unparsable fails closed").

export function parseTrustedProxyHops(raw: string | undefined): number | undefined {
  if (raw === undefined || raw.trim() === "") return undefined; // legacy posture
  const n = Number(raw.trim());
  if (!Number.isInteger(n) || n < 0) return 0; // fail closed
  return n;
}

/** Extract the client IP from an x-forwarded-for value under a declared
 *  proxy-hop policy. Returns null when the policy says "do not trust the
 *  header" (hops=0) or the header cannot satisfy the declared depth —
 *  the caller then falls back to its direct-connection key. */
export function clientIpFromForwarded(
  headerValue: string | null,
  trustedHops: number | undefined,
): string | null {
  if (trustedHops === 0) return null;
  if (!headerValue) return null;
  const hops = headerValue.split(",").map((h) => h.trim()).filter((h) => h.length > 0);
  if (hops.length === 0) return null;
  if (trustedHops === undefined) return hops[0]; // legacy first hop
  if (hops.length < trustedHops) return null; // fail closed (short header)
  return hops[hops.length - trustedHops];
}

// ---- S120/BU15: the session-cookie Secure-flag derivation -------------------------
//
// The routes derived `secure` from request.nextUrl.protocol — behind a
// TLS-terminating proxy the upstream request is plain HTTP and the cookie
// shipped without Secure over the public HTTPS origin (DEPLOYMENT.md told
// operators to forward X-Forwarded-Proto, which no code read). The proxy
// header wins when present; otherwise the request protocol (the shipped
// behavior).

export function secureCookieFlag(xForwardedProto: string | null, requestProtocol: string): boolean {
  // S121/BV12: headers.get() JOINS duplicate headers ("https, https"
  // behind a double proxy) — read the FIRST comma-separated value (the
  // client-most hop's protocol), then the existing case/whitespace
  // normalization.
  const header = xForwardedProto?.split(",")[0]?.trim().toLowerCase();
  if (header) return header === "https";
  return requestProtocol === "https:";
}

// ---- misc -----------------------------------------------------------------------

/** Cryptographically fill a buffer (shared helper for one-shot seams). */
export function secureRandomBytes(size: number): Buffer {
  const buf = Buffer.alloc(size);
  randomFillSync(buf);
  return buf;
}

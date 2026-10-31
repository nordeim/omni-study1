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

// ---- session tokens (HMAC over { uid, iat, exp }) -----------------------------

function sessionSecret(): string {
  return process.env.AUTH_SECRET?.trim() || DEV_FALLBACK_SECRET;
}

function b64url(input: Buffer | string): string {
  return Buffer.from(input).toString("base64url");
}

export function createSessionToken(userId: string): string {
  const payload = { uid: userId, iat: Date.now(), exp: Date.now() + SESSION_TTL_MS };
  const body = b64url(JSON.stringify(payload));
  const mac = createHmac("sha256", sessionSecret()).update(body).digest("base64url");
  return `${body}.${mac}`;
}

export function readSessionToken(token: string): { uid: string; iat: number; exp: number } | null {
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
    return { uid, iat, exp };
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

// ---- S15 seams: verification codes + reset tokens -------------------------------

/** Exactly 6 digits, full zero-padded range (crypto random, not string floats). */
export function generateVerificationCode(): string {
  const bytes = randomBytes(4);
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const value = view.getUint32(0) % 1_000_000;
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

// ---- misc -----------------------------------------------------------------------

/** Cryptographically fill a buffer (shared helper for one-shot seams). */
export function secureRandomBytes(size: number): Buffer {
  const buf = Buffer.alloc(size);
  randomFillSync(buf);
  return buf;
}

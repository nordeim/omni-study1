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
  scryptSync,
  timingSafeEqual,
} from "node:crypto";

import { DEV_FALLBACK_SECRET, parseTrustedProxyHops } from "./env-check";

export { DEV_FALLBACK_SECRET };
// S132/CG4: parseTrustedProxyHops relocated to env-check (the single source
// for the proxy-hop contract — the direct-exposure warning and the limiter
// key derivation read the SAME parse). Re-exported here so server/auth.ts
// and tests/client-ip.test.ts keep their existing @/lib/auth imports.
export { parseTrustedProxyHops };

const SCRYPT_KEYLEN = 64;
export const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

// ---- password hashing (scrypt) ----------------------------------------------
//
// S134/CI1 — the parameter/versioning migration (B-L3, deferred the sixth
// time; this cycle is its measured availability close). The pre-S134 seam
// used scryptSync's DEFAULTS (N=16384/2^14, r=8, p=1 — 16 MiB), 8× below
// the OWASP Password Storage Cheat Sheet floor (N ≥ 2^17 = 128 MiB), and
// the stored format carried NO parameter discriminator. The migration:
//
//   • the 6-part form `scrypt$<N>$<r>$<p>$<salt-hex>$<key-hex>` — the
//     discriminator a parameter raise needs (the legacy 3-part form is
//     byte-shape-identical under any N, so a silent raise would lock out
//     every pre-migration row with no parse error);
//   • the legacy 3-part form still VERIFIES at the Node-default set (the
//     dual-verify window) and upgrades in place on the next successful
//     login (needsRehash + the login route's rehash drain);
//   • every call site passes an explicit maxmem — VERIFIED on Node 24 and
//     Bun 1.3.14: at N=2^17 the 128·N·r working set exceeds the 32 MiB
//     default and BOTH runtimes throw ("memory limit exceeded");
//   • cross-runtime byte-equality VERIFIED (Node and Bun derive identical
//     scrypt bytes for both parameter sets — the seed writes under Bun,
//     dev/e2e verify under either);
//   • the transition equalizer (below) keeps the login branch matrix
//     timing-identical while legacy rows drain.
//
// The measured availability record (this machine): legacy burn ~63 ms
// (Node) / ~98 ms (Bun); current burn ~537 ms / ~857 ms; a login attempt
// (one of each — the equalizer) ~0.6–0.95 s; register/change-password/
// reset burn once. All imperceptible interactively and bounded by the
// 10/IP/15-min + 10/account/15-min budgets.

/** The current parameter set — the OWASP floor (N=2^17, r=8, p=1). */
export const SCRYPT_N = 131_072;
export const SCRYPT_R = 8;
export const SCRYPT_P = 1;

/** maxmem sized for the parameter set it accompanies: 128·N·r + slack. */
const SCRYPT_MAXMEM = 128 * SCRYPT_N * SCRYPT_R + 64 * 1024 * 1024;

/** The pre-S134 parameter set (the scryptSync defaults the legacy 3-part
 *  rows were minted under — still VERIFIED, upgraded on login). */
const LEGACY_SCRYPT_N = 16_384;
const LEGACY_SCRYPT_R = 8;
const LEGACY_SCRYPT_P = 1;
const LEGACY_SCRYPT_MAXMEM = 128 * LEGACY_SCRYPT_N * LEGACY_SCRYPT_R + 64 * 1024 * 1024;

type ScryptCall = { N: number; r: number; p: number; maxmem: number };

const CURRENT_CALL: ScryptCall = {
  N: SCRYPT_N,
  r: SCRYPT_R,
  p: SCRYPT_P,
  maxmem: SCRYPT_MAXMEM,
};
const LEGACY_CALL: ScryptCall = {
  N: LEGACY_SCRYPT_N,
  r: LEGACY_SCRYPT_R,
  p: LEGACY_SCRYPT_P,
  maxmem: LEGACY_SCRYPT_MAXMEM,
};

function scryptAt(password: string, salt: Buffer, call: ScryptCall): Buffer {
  return scryptSync(password, salt, SCRYPT_KEYLEN, {
    N: call.N,
    r: call.r,
    p: call.p,
    maxmem: call.maxmem,
  });
}

/** Format: `scrypt$<N>$<r>$<p>$<16-byte salt hex>$<64-byte derived key hex>`
 *  (S134/CI1 — the parameter-carrying form; the legacy 3-part form
 *  `scrypt$<salt>$<key>` carried none). */
export function hashPassword(password: string): string {
  const salt = randomBytes(16);
  const derived = scryptAt(password, salt, CURRENT_CALL);
  return `scrypt$${SCRYPT_N}$${SCRYPT_R}$${SCRYPT_P}$${salt.toString("hex")}$${derived.toString("hex")}`;
}

type StoredFormat = { call: ScryptCall; legacy: boolean; salt: Buffer; expected: Buffer };

/** The single parser for both shipped forms. The accepted set is EXACTLY
 *  the two: the legacy 3-part form (the Node-default set) and the 6-part
 *  form carrying the CURRENT parameters — a 6-part row with any other
 *  N/r/p fails CLOSED (a hostile or corrupt row can never induce an
 *  oversized allocation; future raises widen the accepted set explicitly,
 *  never silently). */
function parseStoredFormat(stored: string): StoredFormat | null {
  const parts = stored.split("$");
  if (parts[0] !== "scrypt") return null;
  let call: ScryptCall;
  let legacy = false;
  if (parts.length === 3) {
    call = LEGACY_CALL;
    legacy = true;
  } else if (
    parts.length === 6 &&
    parts[1] === String(SCRYPT_N) &&
    parts[2] === String(SCRYPT_R) &&
    parts[3] === String(SCRYPT_P)
  ) {
    call = CURRENT_CALL;
  } else {
    return null; // unknown arity or a non-shipped parameter set — fail closed
  }
  const salt = Buffer.from(parts[parts.length - 2], "hex");
  const expected = Buffer.from(parts[parts.length - 1], "hex");
  if (salt.length !== 16 || expected.length !== SCRYPT_KEYLEN) return null;
  return { call, legacy, salt, expected };
}

export function verifyPassword(password: string, stored: string): boolean {
  const parsed = parseStoredFormat(stored);
  if (!parsed) return false;
  const derived = scryptAt(password, parsed.salt, parsed.call);
  return timingSafeEqual(derived, parsed.expected);
}

/** S134/CI1 — the rehash drain's decision: a stored hash minted before the
 *  migration (or a malformed row — harmless: the drain only runs after a
 *  SUCCESSFUL verify) upgrades to the current parameter set on the next
 *  successful login. */
export function needsRehash(stored: string): boolean {
  const parsed = parseStoredFormat(stored);
  return parsed === null || parsed.legacy;
}

// ---- login timing equalizer (S117/BR3) ---------------------------------------

/** A real scrypt hash of an unknowable random password — the stand-in burned
 * by the login miss branch so "no such user" costs the same scrypt work as
 * "wrong password" (no remotely measurable enumeration oracle under the
 * uniform 401). Unit-pinned by tests/auth.test.ts (the shape pin is what
 * fails the "dummy = malformed string" mutant that would silently restore
 * the oracle while keeping the boolean contract green). S134/CI1: minted
 * at the CURRENT parameter set (auto-follows hashPassword — one ~0.5–0.9 s
 * burn at module load, per process). */
export const DUMMY_LOGIN_HASH: string = hashPassword(generateResetToken());

/** S134/CI1 — the transition equalizer's complement salt (per-process,
 * unknowable — the DUMMY pattern). */
const COMPLEMENT_SALT = randomBytes(16);

/** S134/CI1 — the transition equalizer. While legacy-format rows drain
 * (rehash-on-login), a login attempt against a LEGACY stored hash would
 * burn 2^14 work while the no-user miss branch burns the dummy's 2^17 —
 * an ~8× remotely measurable account-existence oracle, the exact BX4/CG1
 * class REOPENED BY the migration itself. The complement burn closes it:
 * every login attempt burns exactly ONE 2^14-scrypt and ONE 2^17-scrypt,
 * identically across {no-user, legacy-row, current-row, malformed-row} ×
 * {right, wrong} — the branch matrix's totals are invariant. The census
 * (tests/auth.test.ts, the scryptBurns instrument) machine-guards it: a
 * dropped complement burn fails loudly. */
function burnComplement(password: string, stored: string): void {
  const parsed = parseStoredFormat(stored);
  if (parsed && !parsed.legacy) {
    // a current-format row: the verify already burned 2^17 — burn the 2^14
    scryptAt(password, COMPLEMENT_SALT, LEGACY_CALL);
  } else if (parsed) {
    // a legacy row: the verify already burned 2^14 — burn the 2^17
    scryptAt(password, COMPLEMENT_SALT, CURRENT_CALL);
  } else {
    // a malformed row: the verify burned nothing — burn BOTH halves so even
    // the corrupt-row branch pays the full uniform pair
    scryptAt(password, COMPLEMENT_SALT, LEGACY_CALL);
    scryptAt(password, COMPLEMENT_SALT, CURRENT_CALL);
  }
}

/** S134/CI1 — the uniform login scrypt burn (the verify + the complement):
 * the single idiom every login-attempt branch consumes so the 401/200
 * responses cost identical scrypt work. The login route's exhausted-account
 * branch (S132/CG1) calls this with NO stored hash — the dummy stands in. */
export function burnLoginScryptWork(
  password: string,
  stored: string | null | undefined = null,
): boolean {
  const hash = stored ?? DUMMY_LOGIN_HASH;
  const ok = verifyPassword(password, hash);
  burnComplement(password, hash);
  return ok;
}

/** The login credential check WITH the timing equalizer: the scrypt burn
 * happens for every attempt (real hash or the dummy); the result is true
 * only when the user exists AND the password matches. S134/CI1: the burn
 * rides burnLoginScryptWork — the full 2^14+2^17 pair on every branch. */
export function verifyLoginCredentials(
  user: { passwordHash: string } | null | undefined,
  password: string,
): boolean {
  const ok = burnLoginScryptWork(password, user?.passwordHash);
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

// S153/DB1 (audit B-M1, the corrected mechanics): the per-window discharge
// ceiling for the AGGREGATE budgets. Under the S138/CM3 net-of-successes
// model a success nets 0 — checkRateLimit's +1 then the decrement's −1 —
// so a SUCCESS-ONLY loop (scriptable own credentials under the default
// in-band posture: open registration + the OTP in the response) burned
// the full synchronous scrypt pair per request with NOTHING binding it:
// the aggregate never tripped, and login's success path even RESET both
// per-keys. (The S152 plan's stated alternation mechanics were wrong —
// a self-success's −1 lands on its OWN +1, never a prior fail's — the
// audit's direct-read correction; the real door was the free success.)
// The ceiling bounds every discharge-bearing aggregate at M+D = 60
// admitted requests per window (40 + 20): successes 1-20 net 0, every
// success past the ceiling nets +1, and the loop trips. Sizing: D = 2×
// the per-IP budget (10) = M/2 — and measured above the e2e chunk-5
// login-success count (13/boot: auth.setup 1 + auth.spec 3 + auth-flows
// 5 + s24 2 + s25 0 + s26 2), so the cert's per-boot global count stays
// byte-identical (52 posts − 13 discharged = 39/40 — the cap only binds
// when a window's successes exceed 20; chunk 5's never do).
export const MAX_DISCHARGES_PER_WINDOW = 20;

type Bucket = { count: number; windowStart: number; discharges: number };
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
    buckets.set(key, { count: 1, windowStart: now, discharges: 0 });
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

/** S138/CM3: the AGGREGATE-budget discharge — a success decrements the
 *  window's spend by one instead of deleting the bucket. The login route
 *  calls this for `loginGlobal:` (its per-IP and per-account keys still
 *  fully reset — their key material IS the proven requester); the GLOBAL
 *  aggregates every requester, so ONE requester's success must not
 *  discharge the other spends (the S136/CK1 CPU containment was
 *  resettable to zero by any credentialed caller under the default
 *  in-band posture — 39 fails + 1 scripted success, forever). The
 *  net-of-successes model: only FAILED logins accumulate; consecutive
 *  successes oscillate just under the budget and never trip. No-op on a
 *  missing/expired key; never re-arms a window; floors at zero.
 *
 *  S153/DB1 (audit B-M1, the corrected mechanics): the discharge is
 *  CAPPED per window (MAX_DISCHARGES_PER_WINDOW). The CM3 shape made a
 *  success NET 0 (the check's +1, this decrement's −1) — so a
 *  SUCCESS-ONLY loop of scriptable own credentials burned the
 *  synchronous scrypt pair per request with nothing binding it (the
 *  aggregate never tripped; login's success path even resets both
 *  per-keys; ~24-37× the intended containment). The ceiling bounds the
 *  loop at M+D admitted requests per window: the first D successes net
 *  0, every success past the ceiling nets +1, and the loop trips. A
 *  fresh window (the rollover mints a fresh bucket) re-arms the
 *  allowance — the legitimate co-tenant story: a new window starts
 *  clean. The −1 always lands on the SUCCESS'S OWN +1 (its check
 *  incremented the same bucket first) — never on a prior fail's spend,
 *  so the CM3 anti-reset property is untouched. */
export function decrementRateLimit(key: string): void {
  const bucket = buckets.get(key);
  if (bucket && bucket.count > 0 && bucket.discharges < MAX_DISCHARGES_PER_WINDOW) {
    bucket.count -= 1;
    bucket.discharges += 1;
  }
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
 * Map iteration order), the same order windowStart monotonicity gives.
 * S137/CL8 (Mode-C audit F2): the fixed process-wide CONTAINMENT budgets
 * (the `Global:` keys — loginGlobal:, registerGlobal:) are EXEMPT — the
 * containment must not be evictable by cross-route distinct-key pressure
 * (a rotated-XFF flood on the per-IP-only routes — verify/resend/forgot —
 * fills the map and the eviction would delete a global bucket mid-flood,
 * restarting its count at 1: the CK1 CPU-DoS bound quietly re-arming).
 * S138/CM1 (audits AI-1 + Mode-C F1 — the CL8 residual): the exemption
 * is an EXACT-KEY whitelist of the two real budget keys, NOT a substring
 * test — the per-IP key material embeds the raw, forgeable first
 * x-forwarded-for entry under the default (unset TRUSTED_PROXY_HOPS)
 * posture, and `key.includes("Global:")` let a forged
 * `X-Forwarded-For: Global:<unique>` mint `verify:Global:<unique>`-shaped
 * buckets that were ALL eviction-exempt: once the live map was all-exempt
 * the eviction found no victim and the unconditional insert grew the map
 * past this cap without bound (the S121/BV9 invariant itself). The exact
 * set restores the bound mathematically: at most 3 exempt keys can ever
 * be live (the two CK1 aggregates + the S140 authed-scrypt aggregate), so
 * the eviction always finds a non-global victim; an EXPIRED
 * global is swept by sweepExpiredBuckets before this runs. */
const PROTECTED_BUCKETS = new Set([
  "loginGlobal:",
  "registerGlobal:",
  // S140/CO2: the authed-scrypt aggregate (change-password / change-email /
  // delete-account / reset-password) joins the exact-key whitelist — the
  // CK1 containment family fully swept.
  "authBurnGlobal:",
]);

function evictOldestBucket(): void {
  let oldestKey: string | null = null;
  let oldestStart = Infinity;
  for (const [key, bucket] of buckets) {
    if (PROTECTED_BUCKETS.has(key)) continue; // the exact-key exemption (S138/CM1)
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

/** S132/CG2: the PEPPERED OTP digest — HMAC-SHA-256 over the 6-digit code,
 *  keyed by the session secret (AUTH_SECRET; the dev fallback outside
 *  production). The unkeyed hashResetToken form was fine for the 24-byte
 *  reset token (offline search over 2^192 is infeasible) but WRONG for the
 *  10^6 OTP space: any DB read yields the whole space in under a second,
 *  voiding CF7's "a DB read must never yield a live sign-in credential"
 *  guarantee — a correct code both verifies AND signs the caller in. The
 *  HMAC form moves the offline brute force behind AUTH_SECRET, which a DB
 *  read does not include. Deterministic per-process (DB-matchable); the
 *  explicit `secret` parameter keeps the seam unit-pinnable (the
 *  env-check precedent). The 24-byte reset token KEEPS hashResetToken —
 *  its entropy needs no pepper. */
export function hashOtpCode(code: string, secret: string = sessionSecret()): string {
  return createHmac("sha256", secret).update(code).digest("hex");
}

/** S131/CF7: the timing-safe string compare — the codebase's ONE idiom for
 *  comparing secret material (verifyPassword and the session-MAC check each
 *  dance this inline; the OTP digest compare was the last plaintext
 *  short-circuit). Length-mismatched inputs answer false WITHOUT feeding
 *  timingSafeEqual (it throws on unequal lengths). */
export function timingSafeEqualBuffer(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  return timingSafeEqual(Buffer.from(a), Buffer.from(b));
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
// (The contract's parse seam lives in env-check since S132/CG4 — see its
// comment there for the full posture table; re-exported above.)

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
// (S134/CI6a: the secureRandomBytes helper was RETIRED — zero callers since
// its introduction; a dead export in the most security-sensitive module is
// exactly the surface the dependency-discipline doctrine retires.)

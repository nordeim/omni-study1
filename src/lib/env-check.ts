// ---------------------------------------------------------------------------
// The S22 boot-guard seam (ADR-020). Pure, explicit args, zero imports —
// unit-pinned by tests/env-check.test.ts. src/instrumentation.ts's register()
// owns the env and acts on the returned status.
// ---------------------------------------------------------------------------

/** The historical dev fallback (single source — src/lib/auth.ts imports THIS). */
export const DEV_FALLBACK_SECRET = "dev-only-insecure-session-secret";

export type BootStatus = {
  level: "ok" | "warn" | "fatal";
  message?: string;
};

const REMEDY = "Generate one with `openssl rand -hex 32` and set AUTH_SECRET in the environment.";

/**
 * Decide what a server boot should do with the configured AUTH_SECRET.
 * - production: missing/blank/the public dev fallback is FATAL (exit);
 *   a present-but-short secret boots with a warn — EXCEPT the forgeable
 *   band: under 16 chars is FATAL in production (S119/BT5 — an
 *   offline-brute-forceable HMAC signing key must never ship silently;
 *   16–31 chars stays the documented warn band, 32+ is ok).
 * - non-production: nothing is fatal — a missing secret warns about the
 *   dev-only fallback; a real secret is OK.
 */
export function authSecretBootStatus(
  nodeEnv: string | undefined,
  authSecret: string | undefined,
): BootStatus {
  const secret = authSecret?.trim();
  const isProduction = nodeEnv === "production";

  if (isProduction) {
    if (!secret) {
      return {
        level: "fatal",
        message: `AUTH_SECRET is required in production — refusing to sign session cookies with an absent secret. ${REMEDY}`,
      };
    }
    if (secret === DEV_FALLBACK_SECRET) {
      return {
        level: "fatal",
        message: `AUTH_SECRET is required in production — refusing to sign session cookies with the public dev fallback constant. ${REMEDY}`,
      };
    }
    if (secret.length < 16) {
      // S119/BT5: the forgeable band. A <16-char HMAC key is brute-forceable
      // offline from any observed cookie's mac — a fail-fast, exactly like
      // the missing/dev-fallback cases above it.
      return {
        level: "fatal",
        message: `AUTH_SECRET is required in production — a ${secret.length}-char secret is too short to sign session cookies safely. ${REMEDY}`,
      };
    }
    if (secret.length < 32) {
      return {
        level: "warn",
        message: `AUTH_SECRET looks weak (${secret.length} chars; 32+ recommended). ${REMEDY}`,
      };
    }
    return { level: "ok" };
  }

  if (!secret) {
    return {
      level: "warn",
      message:
        "AUTH_SECRET is unset — sessions are signed with the dev-only fallback secret. Never run production this way.",
    };
  }
  return { level: "ok" };
}

// ---- S120/BU2: the in-band delivery off-switches --------------------------------
//
// The PAD §6.4 documents the in-response OTP/reset delivery posture with the
// reopen trigger "a multi-user deployment needs real mail transport +
// off-switches" — this seam IS that off-switch. When a gate is on, the auth
// routes omit the `code` / `resetPath` + `resetUrl` from their responses
// (the no-enumeration {ok:true} shape). Unset (or empty — the
// .env.example placeholder) keeps the shipped single-user dev/demo posture
// byte-identical; only "1"/"true" (case-insensitive) gate a kind.

export type DeliveryKind = "otp" | "reset";

export function inAppDeliveryGates(env: {
  DISABLE_IN_APP_OTP?: string;
  DISABLE_IN_APP_RESET?: string;
  // The index signature accepts the whole ProcessEnv at the route call
  // sites (a weak-type-only parameter would reject it — TS2559).
  [key: string]: string | undefined;
}): { otp: boolean; reset: boolean } {
  const on = (v: string | undefined): boolean => v === "1" || v?.toLowerCase() === "true";
  return { otp: on(env.DISABLE_IN_APP_OTP), reset: on(env.DISABLE_IN_APP_RESET) };
}

// ---- S127/CB14: the in-band delivery production warning posture ---------------
//
// The s127 server audit's C-1, adjudicated against ADR-013: with the gates
// unset (the default), forgot-password returns the live one-shot takeover
// link IN the response body to any caller who knows the email, and the
// OTP-family routes return the code — the documented single-user no-SMTP
// posture (there is no mail transport to flip the default TO), but one an
// internet-facing deployment must opt OUT of consciously. The BT5
// precedent (the weak-secret warn band) applies: production boots WARN
// while either channel delivers in-band, pointing at the two env gates.
// The body shape is also an account-state oracle in this posture (a code
// present ⟺ an unverified account exists; a resetUrl ⟺ any account
// exists) — inherent to in-band delivery, stated honestly in the routes.

export function inBandDeliveryProdWarning(
  // The index signature accepts the whole ProcessEnv at the instrumentation
  // call site (a weak-type-only parameter would reject it — TS2559, the
  // inAppDeliveryGates precedent).
  env: { NODE_ENV?: string; [key: string]: string | undefined },
  gates: { DISABLE_IN_APP_OTP?: string; DISABLE_IN_APP_RESET?: string; [key: string]: string | undefined },
): boolean {
  if (env.NODE_ENV !== "production") return false;
  const g = inAppDeliveryGates(gates);
  return !g.otp || !g.reset;
}

// ---- S131/CF2: the direct-exposure production warning --------------------------
//
// The s131 crypto-core audit's M1: clientIp() returns the constant "local"
// whenever the XFF policy yields no usable header — under the EXPLICIT
// TRUSTED_PROXY_HOPS=0 posture (and under any posture when no proxy fronts
// the app), every such request shares ONE bucket per auth family
// (login:local, register:local, …), so 10 anonymous requests sitewide-lock
// out the auth families for 15-minute windows. The per-ACCOUNT budgets
// (CB12/BX2) contain the guessing-critical halves; the availability half
// is this posture's inherent bound — the App Router exposes no
// socket/remote-address accessor (verified against Next 16's NextRequest
// typings; request.ip was removed upstream after the 15.x deprecation), so
// the honest remediation is the boot warning (the CB14 precedent), not a
// silent key that pretends to be per-connection.
//
// S132/CG4: the decision rides parseTrustedProxyHops (below) — the RAW
// string compare answered "0" but silently missed " 0", "00", "-1", and
// every other string the parser maps to the direct-exposure posture
// (exactly the operators most in need of the shared-bucket caution). The
// warning and the limiter's key derivation now read the SAME parse.

export function directExposureProdWarning(
  env: { NODE_ENV?: string; TRUSTED_PROXY_HOPS?: string; [key: string]: string | undefined },
): boolean {
  if (env.NODE_ENV !== "production") return false;
  // Only the EXPLICIT direct-exposure posture warns: the unset default is
  // ambiguous at boot (a proxy setting XFF may front the app — the legacy
  // first-hop posture reads it), and N>=1 declares a trusted proxy chain.
  // S132/CG4: decided through the parser — every posture-0 spelling warns
  // ("0", " 0", "00", "-1", "two" — unparsable fails closed to 0).
  return parseTrustedProxyHops(env.TRUSTED_PROXY_HOPS) === 0;
}

/** S134/CI6c (audit A-L4) — the over-declared hop depth made loud. With
 *  TRUSTED_PROXY_HOPS=10 behind a real 2-hop chain, EVERY request's
 *  x-forwarded-for is shorter than the declared depth, clientIpFromForwarded
 *  fails closed to null, and ALL clients collapse into the ONE shared
 *  "local" bucket — the exact CF2 sitewide-lockout posture — while the boot
 *  warning above stays silent because the parse returned 10, not 0. The
 *  operator most likely to misconfigure (declaring more hops than the chain
 *  has) gets precisely the availability failure the warning exists to make
 *  loud. Real proxy chains are 1-3 hops; anything beyond 4 is almost
 *  certainly a misconfiguration. The runtime fail-closed behavior is
 *  UNCHANGED (the documented safe posture — a short XFF chain under an
 *  over-declared depth must not fall back to the forgeable first hop). */
export function overdeclaredProxyHopsWarning(
  env: { NODE_ENV?: string; TRUSTED_PROXY_HOPS?: string; [key: string]: string | undefined },
): boolean {
  if (env.NODE_ENV !== "production") return false;
  const hops = parseTrustedProxyHops(env.TRUSTED_PROXY_HOPS);
  // undefined = the legacy first-hop posture (not a declaration); 0 owns
  // its own direct-exposure warning above; 1-4 are plausible chains.
  return hops !== undefined && hops > 4;
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
//
// S132/CG4 relocated this from src/lib/auth.ts so env-check is the single
// source for the whole proxy-hop contract (the warning above and the
// limiter key derivation in server/auth.ts read the SAME parse — the drift
// class this closes). auth.ts re-exports it for its existing importers.

export function parseTrustedProxyHops(raw: string | undefined): number | undefined {
  if (raw === undefined || raw.trim() === "") return undefined; // legacy posture
  const n = Number(raw.trim());
  if (!Number.isInteger(n) || n < 0) return 0; // fail closed
  return n;
}

// ---- S147/CV1: the NODE_ENV casing boot warning ---------------------------------
//
// The s147 FE/auth-rotation audit's named rider (carried from the s145/s146
// deferrals): every production-keyed guard in this app reads the value
// EXACTLY — the isProduction core above (the AUTH_SECRET fatal gate), the
// three prod-gated warnings (CB14 in-band delivery, CF2 direct exposure,
// CI6c over-declared hops), server/auth.ts's Secure-cookie fallbacks, db.ts's
// Prisma log config, db-path, instrumentation. A host exporting
// NODE_ENV=Production (or PRODUCTION, " production", staging, "") degrades
// SILENTLY to the dev posture: the AUTH_SECRET fatal gate never fires (a
// missing secret boots on the public dev fallback), every production warning
// stays silent, the cookie fallback is non-Secure, Prisma logs queries.
//
// REACHABILITY (the S146 runtime-split doctrine — probe which runtime can
// even deliver the miscased value): the standalone server.js FORCES
// process.env.NODE_ENV = 'production' at its line 5 BEFORE requiring next;
// next dev/start force their own canonical values; the Dockerfile sets ENV
// NODE_ENV=production (canonical); compose/.env.example never set it — so
// the miscased value reaches the guards ONLY through a hand-rolled custom
// server (an operator importing next programmatically with a host-exported
// NODE_ENV). This warning is exactly the overdeclaredProxyHopsWarning class
// of misconfigured-host defense-in-depth, and it is structurally silent on
// every documented posture (all three canonical values + unset never warn —
// zero false positives, probed at plan time).

export function nodeEnvCasingWarning(
  env: { NODE_ENV?: string; [key: string]: string | undefined },
): boolean {
  const v = env.NODE_ENV;
  if (v === undefined) return false;
  return v !== "production" && v !== "development" && v !== "test";
}

// ---- S120/BU21: the demo-seed gate ------------------------------------------
//
// The documented Docker first-run (`init` profile) seeds the
// demo@studyflow.app / Demo1234! account (emailVerified: true) into the
// production /data volume with no off-switch — an operator following
// DEPLOYMENT.md ships a live public-credentials login. SEED_DEMO is that
// off-switch: unset or empty keeps the default ON (every documented flow —
// the dev quickstart, the e2e global-setup, the Docker init profile — is
// unchanged); "0"/"false"/"no" (case-insensitive) skip the demo account.
// The contract is FAIL-SAFE: any unrecognized value reads as OFF — a typo
// never ships the public-credentials account (the opposite default of the
// DISABLE_ gates above, because the protective directions are opposite).
export function shouldSeedDemo(env: {
  SEED_DEMO?: string;
  [key: string]: string | undefined;
}): boolean {
  const v = env.SEED_DEMO;
  if (v === undefined || v === "") return true; // the documented default
  const lower = v.toLowerCase();
  return lower === "1" || lower === "true";
}

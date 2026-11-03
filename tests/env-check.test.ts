import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";

import {
  authSecretBootStatus,
  DEV_FALLBACK_SECRET,
  directExposureProdWarning,
  inBandDeliveryProdWarning,
  parseTrustedProxyHops,
} from "@/lib/env-check";

// The S22 boot-guard seam (ADR-020): production boots refuse to sign
// session cookies with the public dev fallback — the actionable fail-fast
// message tells the owner exactly how to fix it. Pure function, explicit
// args (never reads process.env itself — the instrumentation hook owns
// the env), so every boundary is pinnable.

describe("authSecretBootStatus", () => {
  // ---- the fatal family: production without a real secret ----------------

  it("is FATAL in production when AUTH_SECRET is undefined", () => {
    const r = authSecretBootStatus("production", undefined);
    expect(r.level).toBe("fatal");
    expect(r.message).toContain("AUTH_SECRET is required in production");
    expect(r.message).toContain("openssl rand -hex 32");
  });

  it("is FATAL in production when AUTH_SECRET is empty", () => {
    const r = authSecretBootStatus("production", "");
    expect(r.level).toBe("fatal");
    expect(r.message).toContain("AUTH_SECRET is required in production");
  });

  it("is FATAL in production when AUTH_SECRET is whitespace-only", () => {
    const r = authSecretBootStatus("production", "   \t  ");
    expect(r.level).toBe("fatal");
  });

  it("is FATAL in production when AUTH_SECRET equals the public dev fallback constant", () => {
    const r = authSecretBootStatus("production", DEV_FALLBACK_SECRET);
    expect(r.level).toBe("fatal");
    // The pasted-constant case points at the same remedy.
    expect(r.message).toContain("openssl rand -hex 32");
  });

  it("is FATAL in production when AUTH_SECRET is the dev fallback wrapped in whitespace", () => {
    const r = authSecretBootStatus("production", `  ${DEV_FALLBACK_SECRET}  `);
    expect(r.level).toBe("fatal");
  });

  // ---- the ok family: production with a real secret -----------------------

  it("is OK in production with a 64-hex-char secret (the openssl shape)", () => {
    const r = authSecretBootStatus(
      "production",
      "4f9c1d2e8a7b6c5d4e3f2a1b0c9d8e7f6a5b4c3d2e1f0a9b8c7d6e5f4a3b2c1",
    );
    expect(r.level).toBe("ok");
  });

  it("is OK at the 32-char boundary (warn starts strictly below it)", () => {
    const r = authSecretBootStatus(
      "production",
      "0123456789012345678901234567890a",
    );
    expect(r.level).toBe("ok");
  });

  // ---- S119/BT5: the forgeable-key band — production secrets under 16 ----
  // ---- chars are FATAL (an offline-brute-forceable HMAC signing key must --
  // ---- never ship silently; 16–31 stays the documented warn band) ---------

  it("is FATAL in production when AUTH_SECRET is 15 chars (a brute-forceable HMAC key)", () => {
    const r = authSecretBootStatus("production", "012345678901234");
    expect(r.level).toBe("fatal");
    expect(r.message).toContain("openssl rand -hex 32");
  });

  it("is FATAL in production when AUTH_SECRET is a single character", () => {
    const r = authSecretBootStatus("production", "x");
    expect(r.level).toBe("fatal");
  });

  it("WARNS (not fatal) at the 16-char boundary of the fatal band", () => {
    const r = authSecretBootStatus("production", "0123456789012345");
    expect(r.level).toBe("warn");
    expect(r.message).toContain("openssl rand -hex 32");
  });

  // ---- the warn family: weak-but-present, or the dev fallback -------------

  it("WARNS in production one char under the boundary (31 chars)", () => {
    const r = authSecretBootStatus(
      "production",
      "0123456789012345678901234567890",
    );
    expect(r.level).toBe("warn");
    expect(r.message).toContain("openssl rand -hex 32");
  });

  it("WARNS in production on a short hand-made secret", () => {
    const r = authSecretBootStatus("production", "hunter2hunter2hunter2!!");
    expect(r.level).toBe("warn");
  });

  it("WARNS (never blocks) outside production when the secret is unset — the documented dev fallback", () => {
    const r = authSecretBootStatus("development", undefined);
    expect(r.level).toBe("warn");
    expect(r.message).toContain("dev-only fallback");
  });

  it("WARNS on a test node_env with an empty secret too (same non-production family)", () => {
    const r = authSecretBootStatus("test", "");
    expect(r.level).toBe("warn");
  });

  it("is OK outside production when a real secret is set", () => {
    const r = authSecretBootStatus(
      "development",
      "4f9c1d2e8a7b6c5d4e3f2a1b0c9d8e7f6a5b4c3d2e1f0a9b8c7d6e5f4a3b2c1",
    );
    expect(r.level).toBe("ok");
  });

  it("treats an undefined nodeEnv as non-production (nothing is fatal before NODE_ENV is set)", () => {
    const r = authSecretBootStatus(undefined, undefined);
    expect(r.level).toBe("warn");
  });
});

describe("DEV_FALLBACK_SECRET (the single-source pin)", () => {
  it("keeps the exact historical value — auth.ts imports THIS constant", () => {
    // If this value ever changes, src/lib/auth.ts's import keeps the two in
    // lockstep by construction; the pin documents the historical contract.
    expect(DEV_FALLBACK_SECRET).toBe("dev-only-insecure-session-secret");
  });
});

// ---------------------------------------------------------------------------
// S127/CB14 — the in-band delivery production warning posture (the s127
// server audit's C-1, adjudicated against ADR-013): with the delivery
// off-switches unset (the default), forgot-password returns the live
// one-shot takeover link in the response body to any caller who knows the
// email — the documented single-user no-SMTP posture, but one an
// internet-facing deployment must opt OUT of consciously. ADR-013 stands
// (no default flip — there is no mail transport to flip TO), but the BT5
// precedent applies: the boot guard now WARNS in production when either
// in-band channel is enabled, pointing at the two env gates.
// ---------------------------------------------------------------------------
describe("S127/CB14 · inBandDeliveryProdWarning (the BT5 posture precedent)", () => {
  it("warns in production when in-band delivery is enabled", () => {
    expect(
      inBandDeliveryProdWarning({ NODE_ENV: "production" }, {}),
    ).toBe(true);
  });

  it("still warns while ANY channel stays in-band (one gate is not both)", () => {
    expect(
      inBandDeliveryProdWarning(
        { NODE_ENV: "production" },
        { DISABLE_IN_APP_RESET: "1" },
      ),
    ).toBe(true);
  });

  it("is silent when both gates are set", () => {
    expect(
      inBandDeliveryProdWarning(
        { NODE_ENV: "production" },
        { DISABLE_IN_APP_RESET: "1", DISABLE_IN_APP_OTP: "1" },
      ),
    ).toBe(false);
  });

  it("is silent outside production (the dev/test quickstart posture)", () => {
    expect(inBandDeliveryProdWarning({ NODE_ENV: "development" }, {})).toBe(false);
    expect(inBandDeliveryProdWarning({}, {})).toBe(false);
  });
});

// S131/CF2 — the direct-exposure production warning
// (docs/remediation-plan-session131.md).
//
// The s131 crypto-core audit's M1: clientIp() returns the constant "local"
// whenever the XFF policy yields no usable header (TRUSTED_PROXY_HOPS=0,
// absent header, or a short header under N>=1) — every such request shares
// ONE bucket per auth family (login:local, register:local, ...), so 10
// anonymous requests sitewide-lockout the auth families for 15-minute
// windows. The per-ACCOUNT budgets (CB12/BX2) contain the guessing-critical
// halves; the availability half is the direct-exposure posture's inherent
// bound. The App Router exposes no socket/remote-address accessor
// (verified against Next 16's NextRequest typings — request.ip was removed
// upstream after the 15.x deprecation), so the honest remediation is the
// audit's own alternative: the boot warning (the CB14 precedent).
describe("S131/CF2 · directExposureProdWarning (the shared-bucket posture made loud)", () => {
  it("warns in production under the explicit direct-exposure posture (TRUSTED_PROXY_HOPS=0)", () => {
    expect(
      directExposureProdWarning({ NODE_ENV: "production", TRUSTED_PROXY_HOPS: "0" }),
    ).toBe(true);
  });

  it("is silent in production under any other hop posture (unset or N>=1 — a proxy may front the app)", () => {
    expect(
      directExposureProdWarning({ NODE_ENV: "production" }),
    ).toBe(false);
    expect(
      directExposureProdWarning({ NODE_ENV: "production", TRUSTED_PROXY_HOPS: "1" }),
    ).toBe(false);
    expect(
      directExposureProdWarning({ NODE_ENV: "production", TRUSTED_PROXY_HOPS: "" }),
    ).toBe(false);
  });

  it("is silent outside production (the dev/LAN posture is the documented default)", () => {
    expect(
      directExposureProdWarning({ NODE_ENV: "development", TRUSTED_PROXY_HOPS: "0" }),
    ).toBe(false);
    expect(directExposureProdWarning({ TRUSTED_PROXY_HOPS: "0" })).toBe(false);
  });

  it("the boot wiring carries the warning (the instrumentation call site)", () => {
    const src = readFileSync(
      path.resolve(process.cwd(), "src/instrumentation.ts"),
      "utf8",
    );
    expect(src).toMatch(/directExposureProdWarning/);
    expect(src).toMatch(/TRUSTED_PROXY_HOPS/i);
  });
});

// S132/CG4 — the warning/posture parse-seam unification
// (docs/remediation-plan-session132.md).
//
// The s132 audit's L4: directExposureProdWarning compared the RAW string
// (env.TRUSTED_PROXY_HOPS === "0"), so " 0", "00", and "-1" all silently
// parsed to the direct-exposure posture WITHOUT the warning — the exact
// operators most in need of the shared-bucket caution got none. CG4 moves
// the decision through parseTrustedProxyHops (relocated to env-check, the
// single source; auth.ts re-exports it for its existing importers): every
// string the PARSER maps to 0 now warns.
describe("S132/CG4 · directExposureProdWarning decides through the parse seam (the raw-string compare closed)", () => {
  it("warns on every production value that PARSES to posture 0 — whitespace, zero-padded, negative, and non-numeric all fail closed to the warning", () => {
    expect(
      directExposureProdWarning({ NODE_ENV: "production", TRUSTED_PROXY_HOPS: " 0" }),
    ).toBe(true);
    expect(
      directExposureProdWarning({ NODE_ENV: "production", TRUSTED_PROXY_HOPS: "00" }),
    ).toBe(true);
    expect(
      directExposureProdWarning({ NODE_ENV: "production", TRUSTED_PROXY_HOPS: "-1" }),
    ).toBe(true);
    expect(
      directExposureProdWarning({ NODE_ENV: "production", TRUSTED_PROXY_HOPS: "two" }),
    ).toBe(true);
  });

  it("stays silent on N>=1 and unset — the honest rows of the truth table are unchanged", () => {
    expect(
      directExposureProdWarning({ NODE_ENV: "production", TRUSTED_PROXY_HOPS: "1" }),
    ).toBe(false);
    // " 1" parses to 1 (a declared proxy chain) — silent, same as "1".
    expect(
      directExposureProdWarning({ NODE_ENV: "production", TRUSTED_PROXY_HOPS: " 1" }),
    ).toBe(false);
    expect(
      directExposureProdWarning({ NODE_ENV: "production", TRUSTED_PROXY_HOPS: "" }),
    ).toBe(false);
    expect(directExposureProdWarning({ NODE_ENV: "production" })).toBe(false);
  });

  it("parseTrustedProxyHops is sourced from env-check (the relocation) and auth.ts re-exports it (no importer churn)", () => {
    // The relocation makes env-check the single source for the whole
    // proxy-hop contract — the warning and the limiter key derivation read
    // the SAME parse (the drift class this closes).
    const envCheck = readFileSync(
      path.resolve(process.cwd(), "src/lib/env-check.ts"),
      "utf8",
    );
    expect(envCheck).toMatch(/export function parseTrustedProxyHops/);
    const auth = readFileSync(
      path.resolve(process.cwd(), "src/lib/auth.ts"),
      "utf8",
    );
    // auth.ts IMPORTS the seam from env-check (the existing dependency
    // direction — no cycle) and re-exports it so server/auth.ts and
    // tests/client-ip.test.ts keep working unchanged.
    expect(auth).toMatch(/parseTrustedProxyHops/);
    expect(auth).not.toMatch(/export function parseTrustedProxyHops/);
  });

  it("the parse seam's own truth table holds at the relocation (the S120/BU3 behavior pins, re-run at the new home)", () => {
    expect(parseTrustedProxyHops(undefined)).toBeUndefined();
    expect(parseTrustedProxyHops("")).toBeUndefined();
    expect(parseTrustedProxyHops("0")).toBe(0);
    expect(parseTrustedProxyHops(" 0")).toBe(0);
    expect(parseTrustedProxyHops("00")).toBe(0);
    expect(parseTrustedProxyHops("-1")).toBe(0);
    expect(parseTrustedProxyHops("two")).toBe(0);
    expect(parseTrustedProxyHops("2")).toBe(2);
    expect(parseTrustedProxyHops(" 2 ")).toBe(2);
  });
});

import { execSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

// The re-tag script-class runner-convention census (S98/AY1 — the s97
// audit's L1): every script in the capture-evidence / ref-resweep re-tag
// lineages that documents a Usage line must document the NODE runner. The
// S97/AX2 finding established the class convention (node ≥ 23.6; bun
// INCOMPATIBLE for the playwright request-API script class — the
// `_parseSetCookieHeader` crash on the verify-email POST), and the AX
// commit itself left capture-s96's own usage line saying `bun` — the
// convention lived in the resweep lineage and the s97 capture while TEN
// capture scripts (s87–s96) still said `bun`. This census makes the whole
// class self-guarding: a future re-tag copied from a stale template (or a
// hand-edited usage line) fails the unit layer BEFORE it misleads the
// next operator into a bun crash.
//
// S99/AZ2 (the s98 audit's I1): the census widened from the two-lineage
// PROXY to the TRUE class the AX2 convention governs — every script that
// imports playwright (the runner crash is a playwright-core behavior;
// 213 importers, 129 outside the lineages, 94 carrying Usage lines — the
// blind spot was demonstrated live: a planted bun line in z-probe-s70.mjs
// left the lineage-scoped pin GREEN). The lineage sanity legs stay (they
// prove the re-tag lineage census ran); the new sanity leg proves the
// playwright-class census ran.
//
// Scope honesty (the S93 machine-guard doctrine): files WITHOUT a Usage
// line are the pre-s87 historical era (39 capture scripts) — out of scope
// by design; the pin guards every line that EXISTS. Scripts that import
// NO playwright may document any runner (none currently do — the frozen
// historical-era doctrine, S99/AZ4).

const SCRIPTS_DIR = path.resolve(process.cwd(), "scripts");

function reTagScriptClass(): string[] {
  return readdirSync(SCRIPTS_DIR).filter(
    (f) => /^capture-s\d+-evidence\.mjs$/.test(f) || /^ref-resweep-s\d+\.mjs$/.test(f),
  );
}

// S99/AZ2: the TRUE convention class — every script importing playwright
// (the runner crash is a playwright-core behavior, so the convention
// governs every playwright carrier, not just the re-tag lineages).
function playwrightCarryingScripts(): string[] {
  return readdirSync(SCRIPTS_DIR).filter(
    (f) =>
      f.endsWith(".mjs") &&
      /from\s+["']playwright(-core)?["']/.test(readFileSync(path.join(SCRIPTS_DIR, f), "utf8")),
  );
}

function usageLine(file: string): string | undefined {
  const lines = readFileSync(path.join(SCRIPTS_DIR, file), "utf8").split("\n");
  return lines.find((l) => l.trim().startsWith("// Usage:"));
}

describe("the re-tag script-class runner convention (S98/AY1)", () => {
  it("censused the re-tag script class — both lineages present and non-trivial", () => {
    const files = reTagScriptClass();
    const captures = files.filter((f) => f.startsWith("capture-")).length;
    const resweeps = files.filter((f) => f.startsWith("ref-resweep-")).length;
    expect(captures, "the capture-evidence lineage census ran").toBeGreaterThan(40);
    expect(resweeps, "the ref-resweep lineage census ran").toBeGreaterThan(25);
  });

  it("censused the playwright-carrying class — the TRUE convention class (S99/AZ2, the s98 audit's I1)", () => {
    const carriers = playwrightCarryingScripts().length;
    expect(
      carriers,
      "the playwright-class census ran (213 importers at S99; a count below this threshold means the import-shape regex stopped matching — widen it)",
    ).toBeGreaterThan(200);
  });

  it("every Usage line in the playwright-carrying class documents the node runner — never bun (the S97/AX2 convention, widened S99/AZ2 from the lineage proxy to the true class)", () => {
    const stale: string[] = [];
    const documented: string[] = [];
    for (const file of playwrightCarryingScripts()) {
      const line = usageLine(file);
      if (line === undefined) continue; // the pre-s87 historical era carries no usage line
      documented.push(file);
      if (!line.includes("node scripts/") || line.includes("bun scripts/")) {
        stale.push(`${file}: ${line.trim()}`);
      }
    }
    expect(
      documented.length,
      "the convention census found documented scripts (the Usage-line carriers)",
    ).toBeGreaterThan(40);
    expect(
      stale,
      `scripts whose Usage line still names bun (or names no runner) — the S97/AX2 class convention is node ≥ 23.6; fix the usage line: ${stale.join(" | ")}`,
    ).toEqual([]);
  });
});

// S128/CC2 — the cert-script truth pair (the s128 test-layer audit's M-tier).
//
// (a) The chunked cert runner's header is the operator's census anchor —
//     the CB cycle's +21 pins (538 → 559) never re-tagged it, the exact
//     stale-header class the file's own S118 re-tag note repairs. This pin
//     ties the header to the CURRENT census so the re-tag discipline is
//     machine-enforced: a cycle that adds pins without re-tagging fails
//     here BEFORE the operator certifies against a wrong expectation.
// (b) The runner must PROPAGATE a failing chunk's exit code — the pre-CC2
//     loop (`set -uo pipefail`, no -e, no accumulation) discarded every
//     chunk pipeline's status and the trailing echo returned 0
//     unconditionally: a cert script that cannot fail is the resweep-gate
//     trap class (tests/resweep-gate.test.ts) reborn at the cert layer.
describe("the chunked cert runner's truth contract (S128/CC2)", () => {
  const CERT_SCRIPT = path.join(SCRIPTS_DIR, "e2e-chunked-cert.sh");
  const certSource = readFileSync(CERT_SCRIPT, "utf8");

  it("parses as bash (syntax integrity)", () => {
    execSync(`bash -n ${JSON.stringify(CERT_SCRIPT)}`);
  });

  it("names the CURRENT per-chunk census in its header (the re-tag tripwire)", () => {
    // The topmost Expected line — re-tagged by every census-changing cycle.
    // S138/CM: chunk 3 81 → 82 (the S138/CM2 dashboard KPI OR-form
    // held-route leg) — 596 → 597.
    // S139/CN: chunk 2 184 → 185 (the S139/CN2 export→import round-trip
    // witness, relocated out of chunk 3's BY5-spent export budget) +
    // chunk 3 82 → 87 (the CN2 tolerance pair, the cross-account 409,
    // the CN4 card-delegate 404s, the CN10 owned-FK re-point) — 597 → 603.
    // S144/CS: chunk 3 87 → 89 (the CS1 appearance-picker sequence-CAS
    // leg + the CS5 row-cap 413 leg) + chunk 5 87 → 88 (the CS3
    // merge-guard wiring leg) — 606 → 609.
    expect(certSource).toContain("Expected: 150 + 187 + 89 + 95 + 88 = 609");
  });

  it("propagates a failing chunk's exit code (never a green cert on a red run)", () => {
    // The rc accumulation + terminal exit — the resweep-gate doctrine.
    expect(certSource).toMatch(/rc=\$\(\(rc \|/);
    expect(certSource).toMatch(/exit "\$rc"/);
  });
});

// S129/CD8 — the api-route dynamic census (docs/remediation-plan-session129.md).
//
// The audit's L2: `export const dynamic = "force-dynamic"` is declared on
// exactly 1 of 61 route files (health). Every data route is
// dynamic-by-construction — 33 files route through the makeCollectionRoutes/
// makeItemRoutes factories (→ requireUser → cookies()), 8 use requireUser
// directly, and the auth family sets/reads cookies through the server auth
// seam — and Next 15+ does not cache route handlers by default, so this is
// a letter-of-rubric gap, not a live bug. Rather than a 60-file mechanical
// sweep, the census pins the INVARIANT: every route file must either
// declare force-dynamic or import one of the dynamic-by-construction seams
// (the http factories, the server auth seam, the crypto/limiter seam, or
// next/headers itself). A future route that dodges every seam — the exact
// shape that could silently gain a static-cache posture — fails here before
// it ships.
describe("the api-route dynamic census (S129/CD8)", () => {
  const API_DIR = path.resolve(process.cwd(), "src/app/api");

  function routeFiles(): string[] {
    const out: string[] = [];
    const walk = (dir: string) => {
      for (const entry of readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) walk(full);
        else if (entry.name === "route.ts") out.push(full);
      }
    };
    walk(API_DIR);
    return out.sort();
  }

  // The dynamic-by-construction seams: importing any of these makes the
  // route per-request (cookies() is a dynamic API).
  const DYNAMIC_SEAMS = [
    'from "@/lib/server/http"',
    'from "@/lib/server/auth"',
    'from "@/lib/auth"',
    'from "next/headers"',
  ];

  it("censused the route tree (a shrinking count means the walk broke)", () => {
    expect(routeFiles().length).toBeGreaterThan(50);
  });

  it("every api route declares force-dynamic or routes through a dynamic-by-construction seam", () => {
    const offenders: string[] = [];
    for (const file of routeFiles()) {
      const src = readFileSync(file, "utf8");
      const dynamic =
        src.includes('export const dynamic = "force-dynamic"') ||
        DYNAMIC_SEAMS.some((seam) => src.includes(seam));
      if (!dynamic) offenders.push(path.relative(process.cwd(), file));
    }
    expect(
      offenders,
      "routes with neither force-dynamic nor a dynamic seam — an authenticated payload could silently gain a cache posture: " +
        offenders.join(" | "),
    ).toEqual([]);
  });
});

// S130/CE6 — the write-route budget census (docs/remediation-plan-session130.md).
//
// The s130 server audit's M4: the AGENTS.md census covered the factory
// routes (write: 600/15-min via makeCollectionRoutes/makeItemRoutes) and
// the upload family (upload: 20/15-min), but six hand-written write routes
// rode NO budget — which wrapper a route used decided its budget, an
// accident rather than a decision. CE6 budgets five (files/folders POST →
// upload:, files/[id] DELETE + ai/messages DELETE + calculator/history
// DELETE + settings/preferences PATCH → write:) and documents auth/logout
// as the exemption (no DB write). The census machine-guards the posture:
// every route file exporting a write method must call checkRateLimit, ride
// the factories, or carry the documented exemption marker.
describe("the write-route budget census (S130/CE6)", () => {
  const API_DIR = path.resolve(process.cwd(), "src/app/api");
  const WRITE_EXPORT = /export\s+(?:async\s+)?(?:function|const)\s+(POST|PATCH|PUT|DELETE)\b/;

  function routeFiles(): string[] {
    const out: string[] = [];
    const walk = (dir: string) => {
      for (const entry of readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) walk(full);
        else if (entry.name === "route.ts") out.push(full);
      }
    };
    walk(API_DIR);
    return out.sort();
  }

  it("censused the write-route class (a shrinking count means the walk broke)", () => {
    const writers = routeFiles().filter((f) =>
      WRITE_EXPORT.test(readFileSync(f, "utf8")),
    );
    expect(writers.length, "the write-route census ran").toBeGreaterThan(20);
  });

  it("every write route rides a budget (checkRateLimit or the factories) or carries the documented exemption", () => {
    const offenders: string[] = [];
    for (const file of routeFiles()) {
      const src = readFileSync(file, "utf8");
      if (!WRITE_EXPORT.test(src)) continue;
      const budgeted =
        src.includes("checkRateLimit(") ||
        src.includes("makeCollectionRoutes") ||
        src.includes("makeItemRoutes");
      const exempt = src.includes("S130/CE6-EXEMPT");
      if (!budgeted && !exempt) {
        offenders.push(`${path.relative(process.cwd(), file)} [${[...src.matchAll(WRITE_EXPORT)].map((m) => m[1]).join("+")}]`);
      }
    }
    expect(
      offenders,
      "write routes with neither a rate budget nor the documented exemption — every table-writing route must ride a budget (the BZ5/CB7 posture): " +
        offenders.join(" | "),
    ).toEqual([]);
  });
});

// S130/CE5 — the transactional merge-guard census (docs/remediation-plan-session130.md).
//
// The s130 server audit's M2: the factory update ran findFirst →
// beforeWrite(existing, writes) → update with NO transaction, so the three
// cross-field merge guards (events/grades/timetable ordering) validated
// against a PRE-WRITE snapshot — two concurrent single-leg PATCHes could
// each pass against the old partner leg and commit an interleaved row no
// single request would accept (the corrupted row then locks the inversion
// in). CE5 wraps the guarded delegates' update path in db.$transaction
// with the re-read inside (the BZ7 folder pattern). The census pins the
// invariant: the guarded update paths route through $transaction. (The
// hand-written card delegate does NOT — by design: it has no cross-field
// invariant, and a deck-change TOCTOU resolves as P2003 → 400; the
// S135/CJ6 correction of a claim this census never asserted.)
describe("the transactional merge-guard census (S130/CE5)", () => {
  const ENTITIES = path.resolve(process.cwd(), "src/lib/server/entities.ts");

  it("the guarded update family routes through $transaction (the BZ7 re-read-inside pattern)", () => {
    const src = readFileSync(ENTITIES, "utf8");
    // Pre-CE5: entities.ts had NO $transaction (the BZ7 precedent lived in
    // the folder route file only) — this assertion is the RED discriminator.
    expect(src).toMatch(/\$transaction/);
    // The three merge-guard seams are threaded (validation.ts's own
    // guards — the single source).
    expect(src).toMatch(/checkEventOrderingMerge/);
    expect(src).toMatch(/checkGradeRangeMerge/);
    expect(src).toMatch(/checkTimetableOrderingMerge/);
    // The guarded delegates each declare the tx delegate name (the
    // construction contract — a beforeWrite delegate without txModelName
    // fails at import; this census catches a future fourth guard wired
    // without the name's documentation).
    for (const name of ["eventDelegate", "timetableDelegate", "gradeDelegate"]) {
      const idx = src.indexOf(`export const ${name}`);
      expect(idx, `${name} exists`).toBeGreaterThan(-1);
      const block = src.slice(idx, src.indexOf("});", idx));
      expect(block, `${name} declares txModelName`).toMatch(/txModelName:\s*"/);
      expect(block, `${name} carries a merge guard`).toMatch(/beforeWrite:/);
    }
  });
});

// S131/CF1 — the per-email auth budget census (docs/remediation-plan-session131.md).
//
// The s131 shell/auth audit's M1: register + resend were gated ONLY by the
// forgeable per-IP key (a rotated x-forwarded-for mints a fresh key per
// request under the legacy posture) while EVERY register branch burns
// scryptSync — a rotated-XFF flood was a single-worker CPU DoS plus
// unbounded unauthenticated User/VerificationToken growth. CF1 adds the
// per-EMAIL budgets (the CB12/BX2 per-account pattern keyed by the request
// PAYLOAD — a 429 answers identically for known and unknown emails, no
// enumeration oracle), checked BEFORE any DB work or scrypt burn.
describe("the per-email auth budget census (S131/CF1)", () => {
  const REGISTER = path.resolve(process.cwd(), "src/app/api/auth/register/route.ts");
  const RESEND = path.resolve(
    process.cwd(),
    "src/app/api/auth/resend-verification/route.ts",
  );

  it("register carries the per-email budget, checked before the first scrypt burn and the user lookup", () => {
    const src = readFileSync(REGISTER, "utf8");
    // Pre-CF1: no registerAcct key existed — this is the RED discriminator.
    expect(src).toMatch(/registerAcct:\$\{/);
    const budgetAt = src.indexOf("registerAcct:");
    const firstBurn = Math.min(
      ...["verifyPassword(", "hashPassword(", "findUnique("]
        .map((needle) => src.indexOf(needle))
        .filter((i) => i !== -1),
    );
    expect(
      budgetAt,
      "the per-email check precedes every scrypt burn and the DB lookup (the no-oracle + no-burn-on-budget shape)",
    ).toBeLessThan(firstBurn);
  });

  it("resend carries the per-email budget, checked before the user lookup", () => {
    const src = readFileSync(RESEND, "utf8");
    // Pre-CF1: no resendAcct key existed — this is the RED discriminator.
    expect(src).toMatch(/resendAcct:\$\{/);
    const budgetAt = src.indexOf("resendAcct:");
    const lookupAt = src.indexOf("findUnique(");
    expect(
      budgetAt,
      "the per-email check precedes the user lookup (a 429 must not depend on DB state — the anti-enumeration shape)",
    ).toBeLessThan(lookupAt);
  });

  it("both Acct keys normalize the email the same way (the lowercased payload, the schema's own form)", () => {
    const register = readFileSync(REGISTER, "utf8");
    const resend = readFileSync(RESEND, "utf8");
    expect(register).toMatch(/registerAcct:\$\{normalizedEmail\}/);
    expect(resend).toMatch(/resendAcct:\$\{email\.toLowerCase\(\)\}/);
  });
});

// S131/CF7 — the OTP digest-at-rest census (docs/remediation-plan-session131.md).
//
// The s131 crypto-core audit's L1/L2: VerificationToken.code stored the
// live 6-digit code verbatim while PasswordResetToken stores a SHA-256
// digest (BR6: "a DB read must never yield a live account-takeover
// credential" — and a correct code both verifies AND signs the caller
// in), and the compare was the one secret compare in the codebase that
// was not timing-safe. CF7 stores hashResetToken(code) at both create
// sites and compares digests via timingSafeEqual.
describe("the OTP digest-at-rest census (S131/CF7)", () => {
  const REGISTER = path.resolve(process.cwd(), "src/app/api/auth/register/route.ts");
  const RESEND = path.resolve(
    process.cwd(),
    "src/app/api/auth/resend-verification/route.ts",
  );
  const VERIFY = path.resolve(process.cwd(), "src/app/api/auth/verify-email/route.ts");
  const SCHEMA = path.resolve(process.cwd(), "prisma/schema.prisma");

  it("every token-minting route persists the digest, never the raw code", () => {
    for (const file of [REGISTER, RESEND]) {
      const src = readFileSync(file, "utf8");
      expect(
        src.match(/verificationToken\.create\(/g)?.length ?? 0,
        `${path.basename(path.dirname(file))} mints a token`,
      ).toBeGreaterThan(0);
      // Post-CG2 the mint shape is `code: hashOtpCode(code)` — the
      // S132/CG2 peppered seam (HMAC-SHA-256 keyed by AUTH_SECRET; offline
      // brute force of the 10^6 OTP space now requires the secret, which a
      // DB read does not include — CF7's guarantee made real). Register
      // rides a tokenData object, resend an inline create — the file-level
      // census covers both. Pre-CF1 the shorthand `code,` rode the data.
      expect(
        src,
        `${file} persists the PEPPERED digest (hashOtpCode), never the plaintext shorthand`,
      ).toMatch(/code:\s*hashOtpCode\(code\)/);
      expect(src, `${file} carries no bare code shorthand into storage`).not.toMatch(
        /[{,]\s*code\s*,/,
      );
      // The unkeyed seam is gone from the mint sites (the CG2 flip — a
      // regression to hashResetToken here silently reopens the <1 s offline
      // brute force).
      expect(src).not.toMatch(/code:\s*hashResetToken\(code\)/);
    }
  });

  it("verify-email compares the presented code through hashOtpCode + timingSafeEqual — never the raw !==", () => {
    const src = readFileSync(VERIFY, "utf8");
    // Pre-CF7: `token.code !== normalized` — the short-circuit compare.
    expect(src).not.toMatch(/token\.code\s*!==\s*normalized/);
    // Post-CG2: the presented side digests through the PEPPERED seam — the
    // same function that minted the row (an HMAC digest only matches under
    // the same process secret).
    expect(src).toMatch(/hashOtpCode\(normalized\)/);
    expect(src).not.toMatch(/hashResetToken\(normalized\)/);
    expect(src).toMatch(/timingSafeEqual/);
  });

  it("the schema documents the digest contract on the code column", () => {
    const src = readFileSync(SCHEMA, "utf8");
    const colAt = src.indexOf("code      String");
    expect(colAt).toBeGreaterThan(-1);
    // The contract rides the column's OWN line (an inline prisma comment) —
    // the CE9(5) re-anchoring lesson: line-scoped, not window-scoped.
    const line = src.slice(colAt, src.indexOf("\n", colAt));
    expect(line).toMatch(/digest/i);
  });
});

// S131/CF4+CF5 — the e2e posture + always-cold censuses
// (docs/remediation-plan-session131.md).
//
// CF4 (the s131 test-infra audit's L5): the playwright webServer env
// spread ...process.env with only AUTH_SECRET pinned — an operator who
// exports SEED_DEMO=0 or the in-band gates or TRUSTED_PROXY_HOPS=0
// red-hazed the suite with no diagnosis. The four posture vars are pinned
// now (the AP2/AUTH_SECRET precedent). CF5 (L6): global-setup never reset
// db/e2e.db — the ALWAYS-COLD doctrine (AGENTS.md S46) was cert-path-only;
// the default runner now carries the same port-guard + unlink.
describe("the e2e posture + always-cold censuses (S131/CF4+CF5)", () => {
  const PW_CONFIG = path.resolve(process.cwd(), "playwright.config.ts");
  const GLOBAL_SETUP = path.resolve(process.cwd(), "tests/e2e/global-setup.ts");

  it("the webServer env pins every posture var the suite's green depends on", () => {
    const src = readFileSync(PW_CONFIG, "utf8");
    for (const pin of [
      'SEED_DEMO: "1"',
      'DISABLE_IN_APP_OTP: ""',
      'DISABLE_IN_APP_RESET: ""',
      'TRUSTED_PROXY_HOPS: ""',
    ]) {
      expect(src, `playwright.config.ts must pin ${pin}`).toContain(pin);
    }
  });

  it("the always-cold reset rides the pre-boot seam: the cold-reset script, chained into test:e2e (the design correction — Playwright boots the webServer BEFORE globalSetup)", () => {
    // The reset MUST NOT live in global-setup (it would race the live
    // listener it just watched boot); it MUST precede playwright itself.
    const coldReset = path.resolve(process.cwd(), "scripts/e2e-cold-reset.sh");
    const script = readFileSync(coldReset, "utf8");
    // The cert-script port-guard procedure (kill by port, health-verify,
    // SIGKILL escalation) + the cold deletion.
    expect(script).toMatch(/api\/health/);
    expect(script).toMatch(/kill -9/);
    expect(script).toMatch(/rm -f db\/e2e\.db/);

    // package.json chains it BEFORE playwright test.
    const pkg = JSON.parse(readFileSync(path.resolve(process.cwd(), "package.json"), "utf8"));
    expect(pkg.scripts["test:e2e"]).toContain("e2e-cold-reset.sh");
    expect(pkg.scripts["test:e2e"]).toMatch(/e2e-cold-reset\.sh && playwright test/);

    // And global-setup keeps only the safe half (push + seed + the SEED_DEMO
    // posture pin — no rm, no port kill: the first CF5 shape killed the
    // suite's own server).
    const setup = readFileSync(GLOBAL_SETUP, "utf8");
    expect(setup).toMatch(/SEED_DEMO:\s*"1"/);
    expect(setup).not.toMatch(/rmSync\(/);
    expect(setup).not.toMatch(/SIGKILL/);
  });
});

// S131/CF6 — the cert-script truth pair, extended: the per-chunk runner
// must stay census-identical to the chunked cert script (the same CHUNKS
// arrays, the same Expected header) and must exit on the PLAYWRIGHT
// status, never a downstream grep's (a no-match grep false-REDs a green
// run; PIPESTATUS[0] is the honest exit).
describe("the per-chunk cert-runner truth pair (S131/CF6)", () => {
  const MAIN = path.resolve(process.cwd(), "scripts/e2e-chunked-cert.sh");
  const RUNNER = path.resolve(process.cwd(), "scripts/run-cert-chunk.sh");

  function chunksArray(src: string): string {
    const at = src.indexOf("declare -a CHUNKS=(");
    expect(at).toBeGreaterThan(-1);
    const end = src.indexOf(")", at);
    return src.slice(at, end);
  }

  it("the runner's CHUNKS array is byte-identical to the censused cert script's", () => {
    const main = chunksArray(readFileSync(MAIN, "utf8"));
    const runner = chunksArray(readFileSync(RUNNER, "utf8"));
    expect(runner).toBe(main);
  });

  it("the runner exits on the playwright status (PIPESTATUS), never the trailing grep's", () => {
    const src = readFileSync(RUNNER, "utf8");
    expect(src).toMatch(/PIPESTATUS\[0\]/);
    expect(src).toMatch(/exit "\$rc"/);
  });
});

// S132/CG — the Batch CG auth-hardening census (docs/remediation-plan-session132.md).
//
// The s132 rotated audits' three auth M/L findings, machine-guarded at the
// source level (the CF1/CF7 precedent — a census pin fails BEFORE the next
// cycle certifies against a silently-regressed posture):
//   CG1  login's exhausted per-account bucket answered the uniform 401 with
//        ZERO scrypt work while the no-user branch burned DUMMY_LOGIN_HASH —
//        a ~30-36 ms timing account-existence oracle (the BX4 class reopened
//        on the CB12 account bucket).
//   CG3  forgot-password rode NO per-email budget while its two siblings
//        (register/resend) got CF1's *Acct: keys — a rotated-XFF flood
//        superseded the victim's just-issued reset link (each request
//        deleteMany's it) plus unauthenticated write churn.
//   CG11 register's CF1 containment comment overstated: distinct-email
//        floods passed every budget (one scrypt burn + two rows per request
//        from a single host). The global registerGlobal: bucket is the
//        honest bound; the comment now states the residual.
describe("the Batch CG auth-hardening census (S132/CG1+CG3+CG11)", () => {
  const LOGIN = path.resolve(process.cwd(), "src/app/api/auth/login/route.ts");
  const FORGOT = path.resolve(process.cwd(), "src/app/api/auth/forgot-password/route.ts");
  const REGISTER = path.resolve(process.cwd(), "src/app/api/auth/register/route.ts");
  const VERIFY = path.resolve(process.cwd(), "src/app/api/auth/verify-email/route.ts");

  it("login's exhausted loginAcct branch burns scrypt BEFORE the uniform 401 (the timing equalizer on the account bucket)", () => {
    const src = readFileSync(LOGIN, "utf8");
    const exhaustedAt = src.indexOf("loginAcct:");
    expect(exhaustedAt, "the CB12 per-account key exists").toBeGreaterThan(-1);
    const returnAt = src.indexOf("errorResponse(401", exhaustedAt);
    expect(returnAt, "the exhausted branch answers the uniform 401").toBeGreaterThan(-1);
    const branch = src.slice(exhaustedAt, returnAt);
    // Pre-CG1 the branch returned with ZERO scrypt work — the RED
    // discriminator was the dummy-hash burn INSIDE the branch. S134/CI1
    // re-anchors the pin to the upgraded idiom: the branch now burns
    // burnLoginScryptWork(password) — the dummy verify PLUS the transition
    // complement — so the exhausted 401 costs EXACTLY the same scrypt work
    // as every other login attempt (the raw verifyPassword+DUMMY form would
    // burn one parameter set short of the credential branch's pair).
    expect(
      branch,
      "the exhausted branch burns burnLoginScryptWork(password) before the return (the S134/CI1 uniform pair)",
    ).toMatch(/burnLoginScryptWork\(password\)/);
    expect(
      branch,
      "the exhausted branch no longer burns the raw single-set form (the S134/CI1 re-anchor)",
    ).not.toMatch(/verifyPassword\(password,\s*DUMMY_LOGIN_HASH\)/);
  });

  it("forgot carries the forgotAcct per-email budget, checked before the user lookup (the CF1 pattern completed across the three siblings)", () => {
    const src = readFileSync(FORGOT, "utf8");
    // Pre-CG3: no forgotAcct key existed — the RED discriminator.
    expect(src).toMatch(/forgotAcct:\$\{email\.toLowerCase\(\)\}/);
    const budgetAt = src.indexOf("forgotAcct:");
    const lookupAt = src.indexOf("findUnique(");
    expect(
      budgetAt,
      "the per-email check precedes the user lookup (an over-budget ask reads nothing — the no-oracle shape)",
    ).toBeLessThan(lookupAt);
  });

  it("forgot's exhausted branch answers the HONEST 429 — the CF1 siblings' shape (the plan §2's uniform-{ok:true} was the honest correction, recorded in §5)", () => {
    const src = readFileSync(FORGOT, "utf8");
    const budgetAt = src.indexOf("forgotAcct:");
    const branch = src.slice(budgetAt, src.indexOf("findUnique(", budgetAt));
    // The honest 429 with the route's own copy — the registerAcct:/resendAcct:
    // precedent (and the CF8 "resend 429 honesty" doctrine: never a success
    // shape on a rejected request). The budget keys the REQUEST PAYLOAD, so
    // the 429 fires identically for known and unknown emails (the e2e pin's
    // known+unknown legs) — no enumeration either way.
    expect(branch, "the exhausted branch answers the honest 429").toMatch(
      /rateLimitedResponse\(\s*emailLimit\.retryAfterSec,\s*"Too many reset requests\. Try again shortly\."/,
    );
  });

  it("register carries the registerGlobal containment budget BEFORE the per-IP key (the honest CF1 residual bound)", () => {
    const src = readFileSync(REGISTER, "utf8");
    // Pre-CG11: no registerGlobal key existed — the RED discriminator.
    expect(src).toMatch(/checkRateLimit\("registerGlobal:", 40\)/);
    const globalAt = src.indexOf("registerGlobal:");
    const ipKeyAt = src.indexOf("register:${ip}");
    expect(
      globalAt,
      "the global bucket precedes the per-IP key (a distinct-email flood trips the containment bucket FIRST)",
    ).toBeLessThan(ipKeyAt);
  });

  it("login carries the loginGlobal containment budget BEFORE the per-IP key (S136/CK1 — the A-H1 fix: every login burns the full synchronous scrypt pair, and a rotated-XFF flood of non-existent emails skipped every budget — the per-IP key is the forgeable first hop, the per-account bucket only fires when the user exists)", () => {
    const src = readFileSync(LOGIN, "utf8");
    // Pre-CK1: no loginGlobal key existed — the RED discriminator (the
    // registerGlobal doctrine of S132/CG11, never applied to login).
    expect(src).toMatch(/checkRateLimit\("loginGlobal:", 40\)/);
    const globalAt = src.indexOf("loginGlobal:");
    const ipKeyAt = src.indexOf("login:${ip}");
    expect(
      globalAt,
      "the global bucket precedes the per-IP key (a rotated-XFF flood trips the containment bucket FIRST — the CPU-DoS shape the register route already bounds)",
    ).toBeLessThan(ipKeyAt);
    // The 429 copy stays IDENTICAL to the per-IP limit's — no distinguishable
    // global-vs-per-IP response shape (no new oracle, the CG11 doctrine).
    const globalBlock = src.slice(globalAt, src.indexOf("}", src.indexOf("if (!globalLimit.ok)")));
    expect(globalBlock).toContain("Too many login attempts. Try again shortly.");
    // The SUCCESS-DISCHARGE: the progressive model on the global budget
    // (the mid-run correction — an interleaved legitimate burst never
    // inherits a flood's spend one-for-one). S138/CM3: the discharge is a
    // DECREMENT, never a reset — the bucket is an aggregate across every
    // requester, and one scripted success must not erase the window's
    // other spends (the wire census + the auth seam pins own the shape).
    expect(src).toMatch(/decrementRateLimit\("loginGlobal:"\)/);
  });

  it("verify-email re-checks emailVerified BEFORE consuming the token (S136/CK10 — the A-L5 resend/verify race edge: a resend whose user read raced a concurrent verification can leave one live token on a now-verified account)", () => {
    const src = readFileSync(VERIFY, "utf8");
    // Pre-CK10: no emailVerified guard existed — the RED discriminator.
    const guardAt = src.indexOf("user.emailVerified");
    expect(guardAt, "the guard exists in the verify route").toBeGreaterThan(-1);
    const tokenLookupAt = src.indexOf("verificationToken.findFirst");
    expect(
      guardAt,
      "the guard precedes the token lookup (an already-verified account never consumes a stale token — defense-in-depth under the hardened delivery posture)",
    ).toBeLessThan(tokenLookupAt);
  });
});

// ---------------------------------------------------------------------------
// S133/CH4 — the import-route caller census: the stateless envelope
// validator (validateImportEnvelope) lives in the seam, and the ROUTE must
// consume it. The pre-CH4 shape — a unit-pinned parseImportEnvelope with
// ZERO production callers while the route ran a drifted inline twin — is
// the AGENTS.md S126 lesson-2 hazard class (the tests gave false assurance
// about code that never ran). This census is the machine guard: the seam
// can never silently go dead again.
// ---------------------------------------------------------------------------
describe("the import-route envelope-validator caller census (S133/CH4)", () => {
  const IMPORT_ROUTE = path.resolve(process.cwd(), "src/app/api/import/data/route.ts");

  it("the import route consumes the seam's validateImportEnvelope (no inline twin)", () => {
    const src = readFileSync(IMPORT_ROUTE, "utf8");
    expect(src).toContain("validateImportEnvelope(");
  });

  it("the route no longer carries the inline format-identity twin (the drifted stage)", () => {
    const src = readFileSync(IMPORT_ROUTE, "utf8");
    // The inline stage's signature: a direct `envelope.format !==` compare
    // that duplicates the seam's check. Post-CH4 the route delegates; the
    // seam's own compare lives in data-import.ts.
    expect(src).not.toMatch(/envelope\.format\s*!==\s*DATA_EXPORT_FORMAT/);
  });
});

// ---------------------------------------------------------------------------
// S133/CH9 — the route-file shared-symbol census: Next validates route
// module exports (the S125/BZ8 lesson — FILE_METADATA moved OUT of
// files/route.ts for exactly this rule, and login/route.ts cites it too),
// yet files/route.ts still exported MAX_UPLOAD_BYTES. The census: no
// route.ts under src/app/api may export anything beyond the Next
// handler/config surface.
// ---------------------------------------------------------------------------
describe("the route-file shared-symbol census (S133/CH9)", () => {
  const API_DIR = path.resolve(process.cwd(), "src/app/api");
  // The Next App Router route-module surface: HTTP method handlers + the
  // recognized segment config exports. Anything else exported from a
  // route.ts is a shared symbol living where the runtime validates
  // exports — the S125/BZ8 rule.
  const ALLOWED_EXPORTS =
    /^(GET|POST|PATCH|PUT|DELETE|HEAD|OPTIONS|dynamic|revalidate|runtime|preferredRegion|maxDuration|fetchCache|dynamicParams|generateStaticParams)$/;

  function routeFiles(): string[] {
    const out: string[] = [];
    const walk = (dir: string) => {
      for (const entry of readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) walk(full);
        else if (entry.name === "route.ts") out.push(full);
      }
    };
    walk(API_DIR);
    return out.sort();
  }

  it("no route file exports a symbol beyond the Next handler/config surface", () => {
    const offenders: string[] = [];
    const EXPORT_RE = /^export\s+(?:async\s+)?(?:function|const|let|var)\s+([A-Za-z0-9_]+)/gm;
    for (const file of routeFiles()) {
      const src = readFileSync(file, "utf8")
        .split("\n")
        .filter((line) => !line.trimStart().startsWith("//"))
        .join("\n");
      for (const m of src.matchAll(EXPORT_RE)) {
        if (!ALLOWED_EXPORTS.test(m[1])) {
          offenders.push(`${path.relative(process.cwd(), file)}: export ${m[1]}`);
        }
      }
    }
    expect(
      offenders,
      "route files exporting shared symbols (the S125/BZ8 rule — route modules are the runtime's export surface, shared constants live in lib): " +
        offenders.join(" | "),
    ).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// S134/CI1 — the KDF migration's route-side censuses. The login route owns
// two of the migration's three route-side obligations: (1) the rehash drain
// — a successful login on a legacy-format hash upgrades the stored row to
// the current parameter set in place (the standard rehash-on-login
// migration; without it, legacy rows would ride the dual-verify path
// forever); (2) the exhausted-account branch's upgraded burn (re-anchored
// above). The reset route owns (3): the mint hoisted ABOVE the
// $transaction — at the current parameter set the burn is ~0.5-0.9 s, and
// inside the transaction it would hold the SQLite write lock (and inflate
// the S119/BT3 replay-pair window) for its whole duration.
// ---------------------------------------------------------------------------
describe("the S134/CI1 KDF-migration route censuses", () => {
  const LOGIN = path.resolve(process.cwd(), "src/app/api/auth/login/route.ts");
  const RESET = path.resolve(process.cwd(), "src/app/api/auth/reset-password/route.ts");

  it("login rehashes a legacy-format hash after a successful credential check (the drain)", () => {
    const src = readFileSync(LOGIN, "utf8");
    // The drain seam: the needsRehash guard + the in-place update.
    expect(src, "the needsRehash guard exists").toMatch(/needsRehash\(user\.passwordHash\)/);
    expect(src, "the upgrade write mints at the current parameter set").toMatch(
      /passwordHash:\s*hashPassword\(password\)/,
    );
    const guardAt = src.indexOf("needsRehash(user.passwordHash)");
    const updateAt = src.indexOf("passwordHash: hashPassword(password)");
    expect(guardAt, "the guard precedes the update").toBeLessThan(updateAt);
    // The drain runs AFTER the credentials check (a wrong password never
    // rehashes — the guard sits below the uniform-401 early return).
    const credsAt = src.indexOf("verifyLoginCredentials(user, password)");
    expect(credsAt, "the drain sits after the credential check").toBeLessThan(guardAt);
    // ...and BEFORE the unverified gate is fine either way, but the session
    // response must still embed the CURRENT sessionVersion (the rehash
    // never bumps the version — it is not a rotation).
    expect(src).toMatch(/sessionVersion:\s*user\.sessionVersion/);
  });

  it("reset-password mints the new hash OUTSIDE the transaction (the write lock is never held across the KDF burn)", () => {
    const src = readFileSync(RESET, "utf8");
    const mintAt = src.indexOf("hashPassword(password)");
    const txAt = src.indexOf("db.$transaction");
    expect(mintAt, "the mint exists").toBeGreaterThan(-1);
    expect(txAt, "the transaction exists").toBeGreaterThan(-1);
    expect(
      mintAt,
      "the mint is hoisted above the $transaction (the S134/CI1 leg of audit A-L1: the ~0.5-0.9 s burn must not hold the SQLite write lock)",
    ).toBeLessThan(txAt);
    // the transaction's user.update consumes the pre-computed value, not a
    // nested hashPassword call — the body spans to the consumption guard
    // (the first "});" closes the inner updateMany, not the transaction)
    const txBody = src.slice(txAt, src.indexOf("if (!consumed)", txAt));
    expect(txBody, "the transaction body carries the pre-computed hash").toMatch(
      /passwordHash:\s*(newPasswordHash|upgradedHash)/,
    );
    expect(txBody, "no KDF burn inside the transaction body").not.toMatch(/hashPassword\(/);
  });
});

// ---------------------------------------------------------------------------
// S135/CJ2 (audit A-M1) — the route-side 20-collection censuses. The seam's
// manifest is byte-pinned, but the ROUTE wiring was prose-only: the export
// route builds the literal by hand against the seam's
// Partial<Record<ExportCollection, ExportRow[]>> (an omitted key compiles
// clean and silently exports [] + count 0 — every user's backup minus that
// family, green gates all the way down), and the import route's
// IMPORT_ORDER was route-local (a dropped collection's rows silently
// ignored on restore). The exact drift class the repo machine-guards
// everywhere else (INITIAL_COLLECTIONS, OWNED_FKS, the rate-limit census,
// the CH1 registry-key census) — now closed on both route sides.
// ---------------------------------------------------------------------------
describe("the S135/CJ2 route-side collection censuses", () => {
  // S141/CP4 re-anchor: the 20-read assembly moved to the shared server seam
  // (src/lib/server/export-build.ts) — the route and the /export page both
  // consume it (the BW8 single-source doctrine; the size-signal fix). The
  // findMany census and the buildDataExport literal census follow the seam.
  const EXPORT_BUILD = path.resolve(process.cwd(), "src/lib/server/export-build.ts");
  const IMPORT_ROUTE = path.resolve(process.cwd(), "src/app/api/import/data/route.ts");

  it("the export assembly reads EXACTLY 20 collections (the findMany count — a deleted read fails)", () => {
    const src = readFileSync(EXPORT_BUILD, "utf8");
    const reads = src.match(/\.findMany\(/g) ?? [];
    expect(reads.length, "the export seam must carry exactly 20 findMany reads (the manifest census)").toBe(20);
  });

  it("the export assembly hands every manifest collection to buildDataExport (an omitted literal key fails)", async () => {
    const src = readFileSync(EXPORT_BUILD, "utf8");
    const { EXPORT_COLLECTIONS } = await import("../src/lib/data-export");
    const missing: string[] = [];
    for (const name of EXPORT_COLLECTIONS) {
      // The literal's shorthand form: a line that is exactly the key + comma
      // (the destructure block carries them inline — "name, " — so the
      // whole-line match discriminates the literal from the destructure).
      const literalKey = new RegExp(`^\\s*${name},\\s*$`, "m");
      if (!literalKey.test(src)) missing.push(name);
    }
    expect(
      missing,
      `manifest collections absent from the export seam's buildDataExport literal (a Partial-key omission silently exports an empty family): ${missing.join(", ")}`,
    ).toEqual([]);
  });

  it("S141/CP4: BOTH export consumers ride the shared seam (the route downloads it; the page sizes from it — no inline twin)", () => {
    const route = readFileSync(
      path.resolve(process.cwd(), "src/app/api/export/data/route.ts"),
      "utf8",
    );
    const page = readFileSync(path.resolve(process.cwd(), "src/app/export/page.tsx"), "utf8");
    expect(route).toContain("renderExportEnvelope");
    expect(page).toContain("renderExportEnvelope");
    // The route's own body never re-declares the reads (the twin-drift guard).
    expect((route.match(/\.findMany\(/g) ?? []).length).toBe(0);
  });

  it("the import route IMPORT_ORDER rides the seam (no route-local re-declaration — RED pre-fix: the const lives in the route)", () => {
    const src = readFileSync(IMPORT_ROUTE, "utf8");
    expect(src).not.toContain("const IMPORT_ORDER");
    expect(src).toMatch(/IMPORT_ORDER/);
    expect(src).toMatch(/from\s+"@\/lib\/data-import"/);
  });
});

// ---------------------------------------------------------------------------
// S137/CL — the cycle's source censuses (the import-symmetry + cap-sizing +
// cards-bound + honest-copy set).
// ---------------------------------------------------------------------------
describe("the S137/CL source censuses", () => {
  const ENTITIES = path.resolve(process.cwd(), "src/lib/server/entities.ts");
  const FILES_VIEW = path.resolve(process.cwd(), "src/components/views/files-view.tsx");
  const IMPORT_ROUTE = path.resolve(process.cwd(), "src/app/api/import/data/route.ts");

  it("the cards list is BOUNDED — the deck-completeness 5000 window (S137/CL3, the family's only unbounded read)", () => {
    // S137/CL3 (audit B-M2): every sibling collection GET runs the CA5
    // newest-500 window, but the card list had NO take ("the take would
    // hide cards") while the import route can mint ~10^5 cards in one
    // envelope — after which every boot transferred the entire card
    // table. The bound: the BZ13 sibling form (desc + take, reversed to
    // the asc presentation) at 5000 — the deck-completeness contract
    // (study mode runs a deck's full set; deck counts stay honest) keeps
    // it 10x the sibling window; past 5000 the newest-window applies
    // exactly like every sibling collection.
    const src = readFileSync(ENTITIES, "utf8");
    const idx = src.indexOf("export const flashcardCardDelegate");
    expect(idx, "the card delegate exists").toBeGreaterThan(-1);
    const listBlock = src.slice(idx, src.indexOf("create:", idx));
    expect(
      listBlock,
      "the cards list carries the bounded window (RED pre-fix: the unbounded findMany)",
    ).toMatch(/take:\s*5000/);
  });

  it("the folder-delete dialog copy states the SetNull outcome honestly (S137/CL5 — 'All Files', never 'the enclosing folder')", () => {
    // S137/CL5 (audit A-L1): the schema's onDelete: SetNull moves contained
    // files AND child subfolders to ROOT (All Files), not to the deleted
    // folder's parent — the dialog mispredicted a destructive action's
    // data outcome. The reference measurement (this cycle, live): the
    // reference has NO confirm dialog at all (immediate delete), so the
    // clone's dialog is superset territory and its copy is
    // clone-territory (the honest-copy doctrine, not a parity contract).
    const src = readFileSync(FILES_VIEW, "utf8");
    expect(src).toContain("move to All Files");
    expect(src).not.toContain("move to the enclosing folder");
  });

  it("the import 409 collision copy names BOTH causes honestly (S137/CL10 — the cross-account case the old 're-export' advice could never help)", () => {
    // S137/CL10 (audit A-I1): the dominant real trigger of the P2002 409
    // is a cross-account global-PK collision (the s128 e2e comment
    // documents exactly this) — for which "Re-export a fresh backup and
    // try again" was advice that could never help (ids are stable by
    // design). The copy now names both: the concurrent-create race AND
    // the already-taken-id case, with the remedy that fits each.
    const src = readFileSync(IMPORT_ROUTE, "utf8");
    expect(src).toContain("already belong to another account");
    expect(src).not.toContain("was created elsewhere while the import ran. Re-export");
  });
});

// ---------------------------------------------------------------------------
// S138/CM source censuses (the audit-driven hardening cycle — the
// exemption-hardening + containment-decrement + honest-form set).
// ---------------------------------------------------------------------------
describe("the S138/CM source censuses", () => {
  const LOGIN = path.resolve(process.cwd(), "src/app/api/auth/login/route.ts");
  const IMPORT_ROUTE = path.resolve(process.cwd(), "src/app/api/import/data/route.ts");
  const EXPORT_PANEL = path.resolve(process.cwd(), "src/components/export/export-panel.tsx");
  const ANALYTICS_VIEW = path.resolve(process.cwd(), "src/components/views/analytics-view.tsx");
  const TIMETABLE_VIEW = path.resolve(process.cwd(), "src/components/views/timetable-view.tsx");
  const ENTITIES = path.resolve(process.cwd(), "src/lib/server/entities.ts");
  const DOCKERFILE = path.resolve(process.cwd(), "Dockerfile");
  const NEXT_CONFIG = path.resolve(process.cwd(), "next.config.ts");
  const PACKAGE_JSON = path.resolve(process.cwd(), "package.json");
  const SRC_ROOT = path.resolve(process.cwd(), "src");
  const UI_DIR = path.resolve(process.cwd(), "src/components/ui");

  it("the login success path DECREMENTS the aggregate global budget, never resets it (S138/CM3 — the CK1 containment wire)", () => {
    // S138/CM3 (audit AI-2): resetRateLimit("loginGlobal:") fully deleted
    // the aggregate bucket on every success — under the default in-band
    // posture a credentialed attacker alternated 39 fails + 1 success and
    // kept the process-wide CPU containment at zero forever. The wire now
    // rides decrementRateLimit for the GLOBAL (aggregate) key while the
    // per-IP and per-account keys still reset (their key material IS the
    // proven requester).
    const src = readFileSync(LOGIN, "utf8");
    expect(src).toContain('decrementRateLimit("loginGlobal:")');
    expect(src).not.toContain('resetRateLimit("loginGlobal:")');
    // The requester-scoped resets survive (the progressive model's other
    // half — a legitimate user never inherits their own spent buckets).
    expect(src).toContain("resetRateLimit(`login:${ip}`)");
    expect(src).toContain("resetRateLimit(`loginAcct:${user.id}`)");
  });

  it("the import P2028 backup-specific copy lives with the import seam (S138/CM4 — source-neutral shared mapper; S143/CR6 — the catch's legs moved to importRestoreError)", () => {
    // S138/CM4 (Mode-C F2 + AI-6): the shared toErrorResponse emitted
    // "split the backup and retry the halves" for EVERY P2028 source,
    // including the ai/math/rum/calculator retention-trim transactions.
    // The import-specific remedy now lives in the importRestoreError
    // seam (src/lib/data-import.ts — S143/CR6 extracted the catch's
    // mapping for BEHAVIORAL pins); the shared mapper's copy is
    // source-neutral (pinned in http-body).
    const seam = readFileSync(path.resolve(process.cwd(), "src/lib/data-import.ts"), "utf8");
    expect(seam).toContain("split the backup and retry the halves");
    const route = readFileSync(IMPORT_ROUTE, "utf8");
    expect(route).toContain("importRestoreError");
  });

  it("NO stale '25 MiB' prose outside the cap's own doc block (S138/CM5 — the recurring stale-cap class gets its machine check)", () => {
    // S137/CL2 moved the cap 25 → 64 MiB and re-seeded stale "25 MiB"
    // prose in the SAME commit (five sites — the audit's two plus three
    // more the census walk itself surfaced: the route comment, the export
    // panel, the CH6 attack narrative, and two "25 MiB since S124/BY3"
    // current-cap claims in the seam's own guard comments). The machine
    // line: the 25 MiB ERA may be narrated in exactly ONE place — the
    // IMPORT_MAX_BYTES doc block (the cap's own history, where the
    // 10→25→64 arithmetic lives) — and NOWHERE else: every other site
    // references IMPORT_MAX_BYTES or 64 MiB, never the bare old boundary.
    const SEAM = readFileSync(path.resolve(process.cwd(), "src/lib/data-import.ts"), "utf8");
    const blockStart = SEAM.indexOf("/** The documented body cap.");
    expect(blockStart, "the IMPORT_MAX_BYTES doc block exists").toBeGreaterThan(-1);
    const blockEnd = SEAM.indexOf("*/", blockStart);
    const seamOutsideBlock = SEAM.slice(0, blockStart) + SEAM.slice(blockEnd + 2);
    expect(
      seamOutsideBlock.includes("25 MiB"),
      "data-import.ts outside the cap's doc block still narrates the old boundary",
    ).toBe(false);
    // And every OTHER src file is clean of it too.
    const walk = (dir: string): string[] =>
      readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
        e.isDirectory() ? walk(path.join(dir, e.name)) : [path.join(dir, e.name)],
      );
    const offenders = walk(SRC_ROOT)
      .filter((f) => /\.(ts|tsx|css)$/.test(f))
      .filter((f) => !f.endsWith("src/lib/data-import.ts"))
      .filter((f) => readFileSync(f, "utf8").includes("25 MiB"));
    expect(offenders, `stale '25 MiB' prose in: ${offenders.join(", ")}`).toEqual([]);
    // The two known cap consumers reference the symbol, not a number.
    expect(readFileSync(IMPORT_ROUTE, "utf8")).toContain("IMPORT_MAX_BYTES");
    expect(readFileSync(EXPORT_PANEL, "utf8")).toContain("IMPORT_MAX_BYTES");
  });

  it("the analytics loading-const comment matches the OR/six-family gate it sits above (S138/CM5 — the CG6 comment was still the AND/three-family form)", () => {
    // S137/CL7 fixed the gate to the OR-form over six families; the older
    // CG6 comment 90 lines up still documented "loading AND every stat
    // source is still empty (tasks + grades + subjects — the three stat
    // families' sources)" — the mis-describing-comment half of the MC-F4
    // finding CL7 was meant to close.
    const src = readFileSync(ANALYTICS_VIEW, "utf8");
    expect(src).not.toContain("the three stat families' sources");
  });

  it("the cards 5000-window comment states its contract honestly — honest BELOW the window (S138/CM5 — 'deck counts stay honest' overstated past it)", () => {
    // Mode-C F5: the window is global-across-decks, not per-deck; past a
    // user's 5000th card the oldest silently leave every deck's study set
    // and count. The comment now owns the boundary instead of claiming
    // unconditional honesty.
    const src = readFileSync(ENTITIES, "utf8");
    expect(src).not.toContain("deck counts stay honest");
  });

  it("the timetable Grid Builder carries no lying pressed-state or dead attribute (S138/CM6 — the reference's own button is a no-op; behavior parity holds)", () => {
    // S138/CM6 (audit FE-2): `builder` state + aria-pressed + data-builder
    // produced NO functional or visible change while announcing a state
    // that does not exist (a WCAG 4.1.2 state-vs-actual mismatch). The
    // reference's own Grid Builder (measured live this cycle) is a no-op
    // with no pressed semantics — the honest clone form is the pinned
    // outline button with no state.
    const src = readFileSync(TIMETABLE_VIEW, "utf8");
    expect(src).toContain("Grid Builder");
    expect(src).not.toContain("aria-pressed");
    expect(src).not.toContain("data-builder");
    expect(src).not.toContain("setBuilder");
  });

  it("the ui/ directory is exactly the 14 CONSUMED primitives (S138/CM7 — seven scaffold-dead files deleted)", () => {
    // S138/CM7 (audit FE-3): card/skeleton/avatar/checkbox/tooltip/badge/
    // separator had ZERO consumers repo-wide (every view uses the sf-card
    // utility and hand-rolled checkboxes); their five Radix deps were
    // equally dead (radio-group/scroll-area had no component file at
    // all). The S125/BZ14 dead-code doctrine applies.
    const files = readdirSync(UI_DIR)
      .filter((f) => f.endsWith(".tsx"))
      .sort();
    expect(files).toEqual([
      "alert-dialog.tsx",
      "button.tsx",
      "dialog.tsx",
      "dropdown-menu.tsx",
      "input.tsx",
      "label.tsx",
      "popover.tsx",
      "progress.tsx",
      "select.tsx",
      "slider.tsx",
      "switch.tsx",
      "tabs.tsx",
      "textarea.tsx",
      "toast.tsx",
    ]);
    // And the five dead Radix deps are gone from the manifest.
    const pkg = readFileSync(PACKAGE_JSON, "utf8");
    expect(pkg).not.toContain("@radix-ui/react-avatar");
    expect(pkg).not.toContain("@radix-ui/react-checkbox");
    expect(pkg).not.toContain("@radix-ui/react-tooltip");
    expect(pkg).not.toContain("@radix-ui/react-radio-group");
    expect(pkg).not.toContain("@radix-ui/react-scroll-area");
  });

  it("the Docker runtime stage drops to a non-root user (S138/CM8 — no USER directive shipped root; the census tightened to the bun identity at S139/CN9)", () => {
    // S138/CM8 (audit AI-3): the runtime stage ran as root with write
    // access to /data and the app tree. The bun base image ships a
    // non-root `bun` user; the runtime now chowns /data and drops to it
    // before the CMD. S139/CN9 (Mode-C L-2): the first census accepted
    // ANY `USER` line — a regression to `USER root` kept it green; the
    // regex now pins the bun identity exactly.
    const src = readFileSync(DOCKERFILE, "utf8");
    expect(src).toMatch(/^USER bun$/m);
    expect(src).toContain("chown");
  });

  it("a conservative Content-Security-Policy ships on every route (S138/CM9 — the undocumented omission, unlike HSTS)", () => {
    // S138/CM9 (audit AI-4): HSTS is deliberately deferred to the TLS
    // terminator (documented at BU16); CSP had no such note and no
    // header. The conservative profile (matched to the verified
    // same-origin resource surface) blocks external script/style/img/
    // font/connect vectors, plugins, and framing while allowing Next's
    // inline bootstrap + the theme boot script + inline styles.
    const src = readFileSync(NEXT_CONFIG, "utf8");
    expect(src).toContain("Content-Security-Policy");
    expect(src).toContain("default-src 'self'");
    expect(src).toContain("object-src 'none'");
    expect(src).toContain("frame-ancestors 'none'");
  });
});

describe("the S139/CN source censuses", () => {
  const LOGIN = path.resolve(process.cwd(), "src/app/api/auth/login/route.ts");
  const REGISTER = path.resolve(process.cwd(), "src/app/api/auth/register/route.ts");
  const IMPORT_ROUTE = path.resolve(process.cwd(), "src/app/api/import/data/route.ts");
  const FOLDERS_ROUTE = path.resolve(process.cwd(), "src/app/api/files/folders/[id]/route.ts");
  const EXPORT_PANEL = path.resolve(process.cwd(), "src/components/export/export-panel.tsx");
  const HTTP = path.resolve(process.cwd(), "src/lib/server/http.ts");
  const ENTITIES = path.resolve(process.cwd(), "src/lib/server/entities.ts");
  const DOCKERFILE = path.resolve(process.cwd(), "Dockerfile");
  const REPO_ROOT = process.cwd();

  it("the folder re-parent cycle guard reads the ANCESTOR CHAIN, never the user's whole folder table (S139/CN5 — the guard was the family's own unbounded read)", () => {
    // S139/CN5 (audit B-M3): the cycle guard ran
    // tx.fileFolder.findMany({ where: { userId } }) inside the default-5s
    // transaction on EVERY re-parent — the user's ENTIRE folder table per
    // PATCH, while the folders GET is bounded at 500 precisely because
    // the import route can mint ~10^5 folders in one envelope. The
    // bounded form walks the ancestor chain with one findFirst per hop
    // (the visited set terminates pre-existing imported cycles) and feeds
    // the unchanged wouldCreateCycle seam.
    const src = readFileSync(FOLDERS_ROUTE, "utf8");
    expect(src).not.toContain("fileFolder.findMany");
    expect(src).toContain("tx.fileFolder.findFirst");
    expect(src).toContain("wouldCreateCycle");
  });

  it("the import body-read catch discriminates the typed over-cap error from transport failures (S139/CN6 — a client abort mid-stream is not 'too large')", () => {
    // S139/CN6 (audit A-L1): the bare catch answered a confident 413 for
    // ANY readBodyCapped failure — a transport/stream error mislabeled
    // with size remediation advice that cannot help. The typed
    // BodyTooLargeError (S129/CD4) exists and is now used here: only the
    // genuine over-cap read answers 413; everything else propagates to
    // the honest 500 handler.
    const src = readFileSync(IMPORT_ROUTE, "utf8");
    expect(src).toContain("instanceof BodyTooLargeError");
  });

  it("the per-row sanitize loop runs BEFORE the folders topo-sort (S139/CN7 — rejection copy names the backup file's true row index)", () => {
    // S139/CN7 (audit A-L2): folders were topo-sorted BEFORE the sanitize
    // loop, so 'Invalid folders[3]' named the SORTED position — an
    // operator editing their backup per the message landed on the wrong
    // line. sanitizeImportRow is VERIFIED validate-only (no row mutation
    // anywhere in its body), so the reorder is behavior-neutral for valid
    // envelopes; only the rejection copy changes.
    const src = readFileSync(IMPORT_ROUTE, "utf8");
    const sanitizeAt = src.indexOf("sanitizeImportRow(collection, rows[i], i)");
    const sortAt = src.indexOf("sortFoldersParentsFirst(");
    expect(sanitizeAt).toBeGreaterThan(-1);
    expect(sortAt).toBeGreaterThan(-1);
    expect(sanitizeAt).toBeLessThan(sortAt);
  });

  it("the export panel classifies the import timeout with friendly copy (S139/CN8 — the CE1 doctrine every auth surface already carries)", () => {
    // S139/CN8 (audit A-L4): a 120 s AbortSignal.timeout rejection
    // (DOMException 'signal timed out') rendered verbatim in the alert —
    // user-hostile copy on the exact large-restore timeout the deadline
    // exists for. The isTimeoutError branch (src/lib/api.ts, the CE1
    // seam) now maps it the way every auth surface already does.
    const src = readFileSync(EXPORT_PANEL, "utf8");
    expect(src).toContain("isTimeoutError");
  });

  it("the login route no longer narrates the overturned SUCCESS-RESET doctrine (S139/CN9 — the stale paragraph 100 lines above the decrement)", () => {
    // S139/CN9 (Mode-C L-1): the pre-CM3 paragraph still taught "the
    // SUCCESS-RESET below … only FAILED logins accumulate (the attack
    // shape never succeeds)" — contradicted by the CM3 decrement wired
    // 100 lines below it (a success no longer discharges the window's
    // other 39 spends; the in-band posture makes scripted successes the
    // attack's own shape). The exact stale-prose class CM5 swept.
    const src = readFileSync(LOGIN, "utf8");
    expect(src).not.toContain("SUCCESS-RESET");
  });

  it("the register route documents the deliberate discharge asymmetry (S139/CN9 — a future symmetry pass must not reopen the AI-2 defeat here)", () => {
    // S139/CN9 (Mode-C I-2): login decrements loginGlobal: on success;
    // register never discharges registerGlobal: — CORRECT (a register
    // "success" is credential-free and scriptable under the in-band
    // posture), but nothing documented WHY the siblings differ. The
    // comment now owns the asymmetry deliberately.
    const src = readFileSync(REGISTER, "utf8");
    expect(src).toContain("deliberately NEVER discharge");
  });

  it("the Dockerfile init-profile comment matches the compose reality (S139/CN9 — the init service has no user: override, so it runs as the image user)", () => {
    // S139/CN9 (Mode-C M-1): the comment claimed the compose init
    // profile "still runs as root" — but the init service carries no
    // user: override, so after the image-level USER bun it runs as bun
    // (the named-volume path still works because the image chowns /data;
    // a BIND-MOUNTED /data owned by root now fails the SQLite open —
    // documented in DEPLOYMENT.md §8).
    const src = readFileSync(DOCKERFILE, "utf8");
    expect(src).toContain("runs as the image user");
    expect(src).not.toContain("still runs as root");
  });

  it("the route-param id honors the 64-char bound the body atoms enforce (S139/CN11 — a 65-char URL id answered the delegate verbatim)", () => {
    // S139/CN11 (audit B-L1): body ids cap at idField's 64 chars, but
    // withUserParams passed context.params.id into findFirst verbatim —
    // an 8 KB path segment reached the query (Prisma parameterizes, so
    // no injection; purely the inconsistency). The bound now 404s (the
    // no-oracle posture — a >64-char id cannot exist).
    const src = readFileSync(HTTP, "utf8");
    expect(src).toContain("id.length > 64");
  });

  it("the dead orderBy config branch is gone (S139/CN11 — no delegate ever selected desc; the branch was a reader trap)", () => {
    // S139/CN11 (audit B-L2): `orderBy?: "asc" | "desc"` config + the
    // `orderBy === "desc" ? rows : rows.reverse()` branch was dead across
    // all sixteen delegates — grep-verified no delegate passes orderBy,
    // and the cards delegate owns its own raw-query ordering. Deleted,
    // not commented.
    const src = readFileSync(ENTITIES, "utf8");
    expect(src).not.toContain('orderBy === "desc"');
    expect(src).not.toContain('orderBy?: "asc" | "desc"');
  });

  it("a beforeWrite delegate whose txModelName does not resolve fails AT CONSTRUCTION (S139/CN11 — the loud-at-construction doctrine, completed)", () => {
    // S139/CN11 (audit B-L3): txModelName presence was checked but not
    // RESOLUTION — a typo surfaced as a 500 at the first guarded PATCH,
    // not at startup. The construction check now resolves the name
    // against the client.
    const src = readFileSync(ENTITIES, "utf8");
    expect(src).toContain("does not resolve");
  });

  it("no stale npm lockfile rides the repo root (S139/CN11 — package-lock.json still pinned five CM7-removed Radix deps)", () => {
    // S139/CN11 (Mode-C I-3): the npm lock predates the bun toolchain
    // switch and drifted (it still carried the CM7-deleted Radix deps
    // and the long-removed tailwindcss-animate). The bun toolchain, the
    // Dockerfile (package.json + bun.lock only), and every documented
    // command ignore it — deleted as pure confusion surface.
    expect(existsSync(path.resolve(REPO_ROOT, "package-lock.json"))).toBe(false);
    expect(existsSync(path.resolve(REPO_ROOT, "bun.lock"))).toBe(true);
  });
});

// S140/CO2 (Audit B M-1) — the authed-scrypt aggregate containment route
// census: the four sibling routes (change-password, change-email,
// delete-account, reset-password) each burn the same synchronous scrypt
// pair login does, and the CK1 process-wide containment family was never
// swept across them. The census keeps the family swept: every route file
// carries the authBurnGlobal: check + the CM3 decrement-on-success.
describe("the authBurnGlobal route census (S140/CO2)", () => {
  const AUTHED_ROUTES = [
    "change-password",
    "change-email",
    "delete-account",
    "reset-password",
  ].map((r) => path.resolve(process.cwd(), `src/app/api/auth/${r}/route.ts`));

  it("all four authed scrypt-burning routes carry the shared authBurnGlobal: containment check", () => {
    for (const file of AUTHED_ROUTES) {
      const src = readFileSync(file, "utf8");
      expect(src, `${file} must check the authBurnGlobal: aggregate before the scrypt burn`).toContain(
        "checkRateLimit(\"authBurnGlobal:\", 40)",
      );
    }
  });

  it("all four routes discharge the aggregate with the CM3 decrement on legitimate success (never resetRateLimit)", () => {
    for (const file of AUTHED_ROUTES) {
      const src = readFileSync(file, "utf8");
      expect(src, `${file} must decrement the authBurnGlobal: aggregate on success`).toContain(
        'decrementRateLimit("authBurnGlobal:")',
      );
      // The AI-2 defeat shape: a success must NEVER fully reset the
      // aggregate (one requester's success discharges only their own
      // spend — the S138/CM3 doctrine, now pinned per-route).
      expect(src).not.toContain('resetRateLimit("authBurnGlobal:")');
    }
  });
});

// S140/CO5 (Audit B L-1) — the AGENTS.md auth summary contract line: the
// top-level line still taught the overturned S136 success-RESET while the
// route has shipped the CM3 success-DECREMENT for two sessions. A future
// implementer working from the most-read contract line could reintroduce
// resetRateLimit("loginGlobal:") — reopening the documented AI-2
// containment defeat. The CN9 login-route-file pin generalized to the
// contract line itself.
describe("the AGENTS.md auth contract line (S140/CO5)", () => {
  it("the top-level loginGlobal summary documents the success-DECREMENT (the CM3 form), not the overturned reset", () => {
    const agents = readFileSync(path.resolve(process.cwd(), "AGENTS.md"), "utf8");
    const summaryLine = agents.split("\n")[141]; // the Auth bullet (line 142, 1-indexed)
    expect(summaryLine).toContain("loginGlobal:");
    expect(summaryLine).toContain("success-decrement");
    expect(summaryLine).not.toContain("success-reset");
  });
});

// S140/CO1 (Audit C F1) — the note-HTML sanitize route census: both entry
// points must apply the server sanitizer — the delegate door via
// writeTransform (pinned in the entities census below) and the import
// door in the route's own write loop (the route writes through the RAW
// Prisma tx client, so the delegate's hook never fires there).
describe("the note-HTML sanitize census (S140/CO1)", () => {
  const IMPORT_ROUTE = path.resolve(process.cwd(), "src/app/api/import/data/route.ts");
  const ENTITIES = path.resolve(process.cwd(), "src/lib/server/entities.ts");

  it("the import route sanitizes notes content in its write loop (the raw-tx door the delegate hook cannot reach)", () => {
    const src = readFileSync(IMPORT_ROUTE, "utf8");
    expect(src).toContain("sanitizeNoteHtml");
  });

  it("the note delegate carries the writeTransform sanitize hook (the API door)", () => {
    const src = readFileSync(ENTITIES, "utf8");
    expect(src).toContain("sanitizeNoteContent");
  });
});

// S141/CP3 (the A-M3 + A-I1 family) — the restore-availability route
// census: the restructured import route must keep the transaction
// WRITE-ONLY. The S140 shape interleaved findFirst reads and the notes
// sanitize CPU inside one 60 s interactive transaction (the SQLite
// RESERVED lock held sitewide) and paid 20 unconditional full-table
// scans before it; the S141 shape hoists every read + all CPU out
// (IN-probe pre-flight at O(envelope)) and writes via per-row updates +
// chunked createMany. These substring censuses pin the shape markers so
// a regression to the lock-holding N+1 loop fails a test.
describe("the restore-availability census (S141/CP3)", () => {
  const IMPORT_ROUTE = path.resolve(process.cwd(), "src/app/api/import/data/route.ts");

  it("the transaction options are EXPLICIT and complete (timeout AND maxWait — the 5 s default maxWait P2028s unrelated writes under load)", () => {
    const src = readFileSync(IMPORT_ROUTE, "utf8");
    expect(src).toContain("maxWait: 5_000");
    expect(src).toContain("timeout: 60_000");
  });

  it("the knownIds pre-flight rides the FK-aware probe-set derivation (no unconditional 20-collection scans)", () => {
    const src = readFileSync(IMPORT_ROUTE, "utf8");
    expect(src).toContain("importProbeTargets");
    expect(src).toContain("chunkImportIds");
  });

  it("the create set writes through chunked createMany (the bulk path — 2 queries/row → writes only)", () => {
    const src = readFileSync(IMPORT_ROUTE, "utf8");
    expect(src).toContain("createMany");
  });

  it("the notes sanitize pass runs BEFORE the transaction (the CPU out of the lock window)", () => {
    const src = readFileSync(IMPORT_ROUTE, "utf8");
    expect(src).toContain("S141/CP3: the pre-tx notes sanitize pass");
  });

  it("the cross-account collision pre-flight answers the named 409 pre-write (the dominant P2002 trigger, caught with zero writes)", () => {
    const src = readFileSync(IMPORT_ROUTE, "utf8");
    expect(src).toContain("S141/CP3: the cross-account collision pre-flight");
  });
});

// ---------------------------------------------------------------------------
// S142/CQ — the cycle's source censuses (the unwrap-depth + byte-signal +
// named-P2025 + count-gate + CAS-rollback + mint-freshness set).
// ---------------------------------------------------------------------------
describe("the S142/CQ source censuses", () => {
  const IMPORT_ROUTE = path.resolve(process.cwd(), "src/app/api/import/data/route.ts");
  const EXPORT_SEAM = path.resolve(process.cwd(), "src/lib/server/export-build.ts");
  const EXPORT_ROUTE = path.resolve(process.cwd(), "src/app/api/export/data/route.ts");
  const EXPORT_PAGE = path.resolve(process.cwd(), "src/app/export/page.tsx");
  const DATA_EXPORT = path.resolve(process.cwd(), "src/lib/data-export.ts");
  const AGENTS = path.resolve(process.cwd(), "AGENTS.md");
  const CERT_SCRIPT = path.resolve(process.cwd(), "scripts/e2e-chunked-cert.sh");
  const SETTINGS_VIEW = path.resolve(process.cwd(), "src/components/views/settings-view.tsx");
  const VERIFY_EMAIL = path.resolve(process.cwd(), "src/app/api/auth/verify-email/route.ts");
  const NOTE_HTML = path.resolve(process.cwd(), "src/lib/note-html.ts");

  it("CQ1: the unwrap path increments depth (the disallowed-chain cap is live)", () => {
    const src = readFileSync(NOTE_HTML, "utf8");
    expect(src).toContain("for (const m of moved) processElement(m, depth + 1);");
    // The collapse is recursion-free (the explicit-stack collector) — the
    // mechanism that saves the editor must not itself be the thrower.
    expect(src).toContain("function subtreeText(");
    expect(src).not.toContain("child.replaceWith(child.textContent");
  });

  it("CQ2: the export size signal is byte-based end-to-end (the seam derives it once)", () => {
    const seam = readFileSync(EXPORT_SEAM, "utf8");
    const route = readFileSync(EXPORT_ROUTE, "utf8");
    const page = readFileSync(EXPORT_PAGE, "utf8");
    const pure = readFileSync(DATA_EXPORT, "utf8");
    // The pure derivation exists and is TextEncoder-based (client-imported
    // seam — Buffer is a node global the browser bundle must never need).
    expect(pure).toContain("export function exportByteSize(");
    expect(pure).toContain("new TextEncoder().encode(json).length");
    expect(pure).not.toContain("Buffer.byteLength");
    // The seam returns bytes; both consumers read `.bytes` — never
    // `json.length` (the A-M2 code-unit under-report).
    expect(seam).toContain("bytes: exportByteSize(json)");
    expect(route).toContain("String(bytes)");
    expect(page).toContain("const { bytes } = await renderExportEnvelope");
    expect(route).not.toContain("String(json.length)");
    expect(page).not.toContain("json.length");
  });

  it("CQ4: the import catch carries the P2025 named-409 leg (the concurrent-delete taxonomy) — S143/CR6 re-anchor: the leg lives in the importRestoreError seam (behaviorally pinned in data-import.test.ts; this census is the marker backstop)", () => {
    const seam = readFileSync(path.resolve(process.cwd(), "src/lib/data-import.ts"), "utf8");
    expect(seam).toContain('"P2025"');
    expect(seam).toContain("was deleted while this import ran");
    const route = readFileSync(IMPORT_ROUTE, "utf8");
    expect(route).toContain("importRestoreError(err)");
  });

  it("CQ6: AGENTS.md's e2e census row agrees with the cert script's expected map (the count-claims machine gate)", () => {
    // The S140/S141 cycles both missed the e2e row while updating the unit
    // row (603 vs the actual 605 for two cycles) — this leg makes the
    // drift fail loudly instead of rotting silently.
    const agents = readFileSync(AGENTS, "utf8");
    const cert = readFileSync(CERT_SCRIPT, "utf8");
    const agentsMatch = agents.match(/(\d+) tests across the 5-chunk cold map — (\d+)\+(\d+)\+(\d+)\+(\d+)\+(\d+)/);
    const certMatch = cert.match(/Expected: (\d+) \+ (\d+) \+ (\d+) \+ (\d+) \+ (\d+) = (\d+)/);
    expect(agentsMatch).not.toBeNull();
    expect(certMatch).not.toBeNull();
    const agentsChunks = (agentsMatch as RegExpMatchArray).slice(2, 7).map(Number);
    const agentsTotal = Number((agentsMatch as RegExpMatchArray)[1]);
    const certChunks = (certMatch as RegExpMatchArray).slice(1, 6).map(Number);
    const certTotal = Number((certMatch as RegExpMatchArray)[6]);
    expect(agentsChunks).toEqual(certChunks);
    expect(agentsTotal).toBe(certTotal);
    expect(agentsChunks.reduce((a: number, b: number) => a + b, 0)).toBe(agentsTotal);
  });

  it("CQ7: the three appearance rollbacks are CAS-guarded — S143/CR5 re-anchor: the sequence-ticket form (the value-compare ABA closed; the pure seam unit-pinned in fetch-seq.test.ts)", () => {
    const src = readFileSync(SETTINGS_VIEW, "utf8");
    expect(src).toContain("if (themeSeq.isCurrent(ticket)) setMode(prev);");
    expect(src).toContain("if (accentSeq.isCurrent(ticket)) setAccent(prev);");
    expect(src).toContain("if (avatarSeq.isCurrent(ticket)) setAvatar(prev);");
    expect(src).toContain("createFetchSeq()");
    // The old value-compare shape is gone (the ABA's signature).
    expect(src).not.toContain("useThemeStore.getState().mode === next");
  });

  it("CQ8: verify-email mints the cookie from the transaction's fresh row (not the pre-tx read) + S143/CR7: the pre-tx select no longer fetches the dead sessionVersion column", () => {
    const src = readFileSync(VERIFY_EMAIL, "utf8");
    expect(src).toContain("sessionVersion: verifiedUser.sessionVersion");
    expect(src).not.toContain("sessionVersion: user.sessionVersion");
    // S143/CR7: the dead column left behind by the CQ8 re-anchor (only
    // id/emailVerified are read from the pre-tx row) — the select shape
    // is pinned too, so the dead read cannot come back silently.
    expect(src).toContain("select: { id: true, emailVerified: true }");
    expect(src).not.toContain("sessionVersion: true");
  });
});

// ---------------------------------------------------------------------------
// S143/CR — the cycle's source censuses (the own-keys guard + the
// non-text-tag door policy + the typed import-delegate seam + the
// sequence-ticket CAS markers).
// ---------------------------------------------------------------------------
describe("the S143/CR source censuses", () => {
  const IMPORT_ROUTE = path.resolve(process.cwd(), "src/app/api/import/data/route.ts");
  const NOTE_HTML = path.resolve(process.cwd(), "src/lib/note-html.ts");
  const SERVER_NOTE_HTML = path.resolve(process.cwd(), "src/lib/server/note-html.ts");
  const SETTINGS_VIEW = path.resolve(process.cwd(), "src/components/views/settings-view.tsx");
  const NOTES_VIEW = path.resolve(process.cwd(), "src/components/views/notes-view.tsx");

  it("CR1: the sentKeysPatch membership test is own-keys (the prototype-chain walk closed)", () => {
    const src = readFileSync(
      path.resolve(process.cwd(), "src/lib/server/entities.ts"),
      "utf8",
    );
    expect(src).toContain("Object.prototype.hasOwnProperty.call(parsed, key)");
    expect(src).not.toContain("!(key in parsed)");
  });

  it("CR1: the shared mapper carries the PrismaClientValidationError leg (the import route's local BT1b, now shared)", () => {
    const src = readFileSync(
      path.resolve(process.cwd(), "src/lib/server/http.ts"),
      "utf8",
    );
    expect(src).toContain('err.name === "PrismaClientValidationError"');
    expect(src).toContain("That request contained fields the server could not accept");
  });

  it("CR2: the shared NOTE_HTML_NON_TEXT_TAGS constant feeds BOTH doors (the five-tag set)", () => {
    const dom = readFileSync(NOTE_HTML, "utf8");
    expect(dom).toContain("export const NOTE_HTML_NON_TEXT_TAGS");
    expect(dom).toContain("NOTE_HTML_NON_TEXT_TAGS.includes(child.tagName.toLowerCase())");
    expect(dom).toContain("NOTE_HTML_NON_TEXT_TAGS.includes((node as Element).tagName.toLowerCase())");
    const server = readFileSync(SERVER_NOTE_HTML, "utf8");
    expect(server).toContain("nonTextTags: [...NOTE_HTML_NON_TEXT_TAGS]");
  });

  it("CR4: the import route carries NO inline any-casts — the typed importDelegateOps seam owns the one documented index cast", () => {
    const src = readFileSync(IMPORT_ROUTE, "utf8");
    expect(src).toContain("function importDelegateOps(");
    expect(src).toContain("const delegate = importDelegateOps(db, model);");
    expect(src).toContain("const delegate = importDelegateOps(tx, model);");
    expect(src).not.toContain("as any");
  });

  it("CR5: the three pickers ride the sequence-ticket CAS (the createFetchSeq seam) — S144/CS1 re-anchor: the INSTANCE-SCOPED form", () => {
    const src = readFileSync(SETTINGS_VIEW, "utf8");
    expect(src).toContain('from "@/lib/fetch-seq"');
    expect(src).toContain("const ticket = themeSeq.begin();");
    expect(src).toContain("const ticket = accentSeq.begin();");
    expect(src).toContain("const ticket = avatarSeq.begin();");
    // S144/CS1 (audit A-M1): the function-body instantiation minted a
    // FRESH seq per render — every pick's ticket was 1 on its own
    // instance, isCurrent degraded to always-true, and the guard was the
    // unconditional rollback again (the ABA open, the S142 different-
    // value protection regressed). The useRef form holds the guard for
    // the component's lifetime (the files-view idiom). A census cannot
    // see instantiation SCOPE — that is exactly how A-M1 shipped — but
    // it holds the shape against drift; the behavioral e2e leg in
    // resilience.spec.ts pins the semantics.
    expect(src).toContain("const themeSeq = React.useRef(createFetchSeq()).current;");
    expect(src).toContain("const accentSeq = React.useRef(createFetchSeq()).current;");
    expect(src).toContain("const avatarSeq = React.useRef(createFetchSeq()).current;");
    // The per-render instantiation shape is gone (the A-M1 signature).
    expect(src).not.toContain("const themeSeq = createFetchSeq();");
    expect(src).not.toContain("const accentSeq = createFetchSeq();");
    expect(src).not.toContain("const avatarSeq = createFetchSeq();");
  });

  // S144/CS3 (audit B-M2): the import route's IMPORT_MERGE_GUARDS wiring
  // — the UPDATE-branch merge guards (the B-I1 mitigation) — was pinned
  // by NOTHING (zero test references; deleting the guard call or
  // dropping a collection shipped green through the whole suite). The
  // seam functions are unit-pinned and the interactive delegates are
  // census-pinned; this closes the unpinned third site. The wiring is
  // correct today (verified by direct read) — this is the missing-pin
  // class, green-on-arrival (the S137/CL9 precedent), pinned against
  // drift; the behavioral e2e leg in s23-import.spec.ts carries the
  // semantics.
  it("S144/CS3: the import route runs the merge guards on the UPDATE branch (the IMPORT_MERGE_GUARDS wiring — the unpinned third site)", () => {
    const src = readFileSync(IMPORT_ROUTE, "utf8");
    expect(src).toContain("IMPORT_MERGE_GUARDS");
    expect(src).toContain("mergeGuard.guard(leg, data);");
    expect(src).toContain("checkGradeRangeMerge");
    expect(src).toContain("checkEventOrderingMerge");
    expect(src).toContain("checkTimetableOrderingMerge");
  });

  // S144/CS5 (audit B-L2): the row-count ceiling's route-side wiring —
  // the cap constant lives in the seam (pinned in data-import.test.ts),
  // the CHECK lives in the route (the byte-cap precedent), and this
  // census holds the wiring against drift.
  it("S144/CS5: the import route enforces the row-count ceiling (the parse-memory amplification bound)", () => {
    const src = readFileSync(IMPORT_ROUTE, "utf8");
    expect(src).toContain("IMPORT_MAX_ROWS");
    expect(src).toContain("too many rows");
  });

  it("CR3: the notebook mover carries its accessible name (the CQ3 surface's WCAG 4.1.2 name)", () => {
    const src = readFileSync(NOTES_VIEW, "utf8");
    expect(src).toContain('aria-label="Move note to notebook"');
  });
});
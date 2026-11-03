import { execSync } from "node:child_process";
import { readdirSync, readFileSync } from "node:fs";
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
    expect(certSource).toContain("Expected: 149 + 179 + 74 + 94 + 79 = 575");
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
// invariant: the guarded update paths (and the hand-written card
// delegate's) route through $transaction.
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

  it("login's exhausted loginAcct branch burns scrypt BEFORE the uniform 401 (the timing equalizer on the account bucket)", () => {
    const src = readFileSync(LOGIN, "utf8");
    const exhaustedAt = src.indexOf("loginAcct:");
    expect(exhaustedAt, "the CB12 per-account key exists").toBeGreaterThan(-1);
    const returnAt = src.indexOf("errorResponse(401", exhaustedAt);
    expect(returnAt, "the exhausted branch answers the uniform 401").toBeGreaterThan(-1);
    const branch = src.slice(exhaustedAt, returnAt);
    // Pre-CG1 the branch returned with ZERO scrypt work — the RED
    // discriminator is the dummy-hash burn INSIDE the branch.
    expect(
      branch,
      "the exhausted branch burns verifyPassword(password, DUMMY_LOGIN_HASH) before the return",
    ).toMatch(/verifyPassword\(password,\s*DUMMY_LOGIN_HASH\)/);
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
});

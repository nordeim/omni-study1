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
    // S145/CT: chunk 3 89 → 91 (the CT1 focus-timer completion-window
    // pair — the phantom/double-log leg + the settle-CAS leg) + chunk 5
    // 88 → 89 (the CT3 gradient-CTA leg) — 609 → 612.
    // S146/CU: chunk 2 187 → 189 (the CU1 multipart-mime pair — the
    // derivation tripwire + the clean .pdf round-trip) — 612 → 614.
    // S153/DB: chunk 1 150 → 152 (the DB1 success-loop trip pin in
    // parity-session8 [the new terminal] + the DB2 export-page budget pin
    // in navigation [relocated from its first s21 home on the measured
    // 40/40 chunk-5 registerGlobal boundary]) — 614 → 616.
    // S160/DI: chunk 1 152 → 154 (the DI5 CB8 solver/flashcards twins in
    // parity-session8) + chunk 3 91 → 92 (the DI6 generate-cards pre-LLM
    // wire pin in resilience) — 616 → 619.
    // S161/DJ: chunk 2 189 → 192 (the DJ1 notes tag-failure toast + the
    // DJ2 timetable band hand-guard in parity-session7 + the DJ4 dark-edge
    // accent leg in theme-system) + chunk 3 92 → 93 (the DJ5 slider
    // resync pageerror-free pin in resilience) — 619 → 623.
    // S162/DK: chunk 3 93 → 94 (the DK1 events CB8 failure-domain split
    // pin in parity-session5 — a committed create + an aborted refresh
    // answers the success toast) — 623 → 624.
    // S163/DL: chunk 1 154 → 155 (the DL1 exams CB8 failure-domain split
    // pin in parity-session8 — the DK1 events port to the second family
    // of the recorded family-wide port; a committed create + an aborted
    // refresh answers the success toast) — 624 → 625.
    // S164/DM: chunk 2 192 → 193 (the DM1 assignments CB8
    // failure-domain split pin in parity-session9 — the DK1/DL1
    // events/exams ports to the third family of the recorded
    // family-wide port; a committed create + an aborted refresh answers
    // the success toast; the cycle also carries the count-neutral DM4
    // test-honesty fix — the DJ5 leg's route glob `**/api/assignments*`
    // → `**`, Playwright's single star never crossed `/`) — 625 → 626.
    // S165/DN: chunk 2 193 → 194 (the DN1 timetable CB8 failure-domain
    // split pin in parity-session9 — the DK1/DL1/DM1 events/exams/
    // assignments ports to the FOURTH family of the recorded
    // family-wide port; a committed create + an aborted refresh answers
    // the success toast) — 626 → 627.
    // S166/DP: chunk 2 194 → 196 (the DP1 notes-family CB8
    // failure-domain split pin in parity-session9 — the DK1/DL1/DM1/DN1
    // ports to the FIFTH family of the recorded family-wide port; a
    // committed create + an aborted refresh answers the CLOSED dialog,
    // never the false "Something went wrong." + the DP3 notes-search
    // rendered-text pin in parity-session7 — a tag-name query never
    // matches a formatted note, the visible word always does) —
    // 627 → 629.
    // S167/DQ: chunk 1 155 → 156 (the DQ1 flashcards-family CB8
    // failure-domain split pin in parity-session8 — the DK1/DL1/DM1/
    // DN1/DP1 ports to the SIXTH family of the recorded family-wide
    // port; a committed deck create + an aborted refresh answers the
    // "Deck created." success toast + the CLOSED dialog, never the
    // false "Something went wrong.") — 629 → 630.
    // S168/DR: chunk 2 196 → 197 (the DR1 tasks-family CB8
    // failure-domain split pin in tasks.spec — the DK1/DL1/DM1/DN1/
    // DP1/DQ1 events/exams/assignments/timetable/notes/flashcards
    // ports to the SEVENTH family of the recorded family-wide port;
    // a committed task create + an aborted refresh answers the
    // "Task created" success toast + the CLOSED dialog, never the
    // false "Could not save the task.") — 630 → 631.
    // S169/DS: chunk 3 94 → 95 (the DS1 subjects-family CB8
    // failure-domain split pin in resilience — the DK1/DL1/DM1/DN1/
    // DP1/DQ1/DR1 events/exams/assignments/timetable/notes/flashcards/
    // tasks ports to the EIGHTH family of the recorded family-wide
    // port, the first of the eight remaining seams the S168 close's
    // ledger names; a committed subject create + an aborted refresh
    // answers the "Subject created" success toast + the CLOSED
    // dialog, never the false "Could not save the subject.") —
    // 631 → 632.
    // S170/DT: chunk 1 156 → 158 (the two DT2 chrome-parity pins —
    // the DT2a desktop-sidebar leg in navigation [border-x hairlines
    // + the xl shadow geometry + z-40 + transition-all 0.3s + the
    // border-box 260/258 width contract] and the DT2b mobile app-bar
    // leg in mobile-navigation [border-b hairline + the sm shadow +
    // z-40] — the reference's post-S169 shell-chrome deployment +
    // the longstanding mobile-bar miss, both measured live and pinned
    // as computed-style ground truth; the DT1 task-lists CB8 port
    // carries NO e2e leg — the family has no view consumer, the unit
    // pair set pins the contract) — 632 → 634.
    // S171/DU: chunk 2 197 → 199 (the S171/DU2 studygroups dialog
    // parity pair in parity-session7 — the measured title/placeholders/
    // footer pin + the description round-trip leg, the ported field);
    // chunk 3 95 → 96 (the S171/DU1 studygroups-family CB8 pin in
    // resilience — the committed create + aborted refresh answers the
    // success toast + the closed dialog; the TENTH family, the
    // ledger-corrected third of the eight remaining seams) —
    // 634 → 637.
    // S172/DV: chunk 2 199 → 200 (the S172/DV2 practiceTests create-dialog
    // parity pin in parity-session7 — the measured "Create Practice Test"
    // title + "Test Title *" label + "e.g., Biology Chapter 5 Review"
    // placeholder + the [Create Test][Close] footer order); chunk 3
    // 96 → 97 (the S172/DV1 practiceTests-family CB8 pin in resilience —
    // the committed create + aborted refresh answers the success toast +
    // the closed dialog; the ELEVENTH family, the fourth of the eight
    // remaining seams — after it: grades / focusSessions / holidays +
    // the calculatorHistory observation) — 637 → 639.
    // S173/DW: chunk 2 200 → 201 (the S173/DW2 grades create-dialog
    // parity pin + type/date field port in parity-session7 — the measured
    // "Add New Grade" title + "Max Score" label + "Weight (optional,
    // default 1)" hint + the Type select's "Homework" default + the
    // native date input + the [Cancel][Add Grade] footer order); chunk 3
    // 97 → 98 (the S173/DW1 grades-family CB8 pin in resilience — the
    // committed create + aborted refresh answers the "Grade added"
    // success toast + the closed dialog; the TWELFTH family, the fifth
    // of the eight remaining seams — after it: focusSessions / holidays
    // + the calculatorHistory observation) — 639 → 641.
    // S174/DX: chunk 2 201 → 202 (the S174/DX4 holidays create-dialog
    // parity pin + start/end/type field port in parity-session7 — the
    // measured "Start Date"/"End Date" native inputs + the
    // Holiday/Break/No School type selector + the "e.g., Winter Break"
    // placeholder + the [Cancel][Add Holiday] footer order; the
    // reference's own create flow answers 403, a reference-side data
    // bug recorded not ported); chunk 3 98 → 101 (the S174/DX1
    // focusSessions + holidays + calculatorHistory CB8 legs in
    // resilience — the committed write + aborted refresh answers each
    // family's own success surface, never the false save-failure; the
    // THIRTEENTH + FOURTEENTH + FIFTEENTH families, the recorded
    // family-wide port COMPLETE; the DX1c calculator leg's observable
    // is the SINGLE-SHOT toast count at +600ms after the refresh
    // dispatch — the retrying toHaveCount(0) passed vacuously through
    // the 5s auto-dismiss, the s174 pin-correction lesson) —
    // 641 → 645.
    // S175/DY: chunk 2 202 → 207 (the S175/DY1 subject create-dialog
    // parity pin + teacher/room field port in parity-session7 — the
    // measured "Subject Name *" label + the "e.g., Mathematics"
    // placeholder + the SEVENTEEN-swatch 32px/rounded-lg palette with
    // the violet #8b5cf6 pristine default + the "Teacher (optional)"
    // + "Room (optional)" fields + the [Cancel][Add Subject] footer
    // order, the write path verified live with zero residue; + the
    // four S175/DY4 gradetracker/settings-CRUD + AlertDialog-confirm
    // legs — the grade edit round-trip, the grade delete confirm, the
    // subject create-with-fields → row metadata → edit round-trip,
    // the subject delete SetNull-consequences confirm;
    // green-on-arrival coverage) — 645 → 650.
    // S176/DZ re-tag: 650 → 654, chunk 2 +4 (the S176/DZ events/
    // studygroups/tasks dialog catch-up pins in parity-session7 — see
    // docs/remediation-plan-session176.md).
    expect(certSource).toContain("Expected: 158 + 211 + 101 + 95 + 89 = 654");
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
    // SIGKILL escalation) + the cold deletion. S176/DZ5: the scratch db
    // moved to /dev/shm (tmpfs — the IO-freeze cure; see playwright.config
    // .ts's S176/DZ5 comment) — the deletion globs the tmpfs scratch file.
    expect(script).toMatch(/api\/health/);
    expect(script).toMatch(/kill -9/);
    expect(script).toMatch(/rm -f .*e2e\.db\*/);

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

  it("the export assembly hands every manifest collection to a READERS entry (an omitted reader fails)", async () => {
    const src = readFileSync(EXPORT_BUILD, "utf8");
    const { EXPORT_COLLECTIONS } = await import("../src/lib/data-export");
    const missing: string[] = [];
    for (const name of EXPORT_COLLECTIONS) {
      // S158/DG1 re-anchor: the reader became the paged form — every
      // reader rides the keyset page wrapper (pageAfter), the whole-line
      // key form still discriminating the map entry from any
      // comment/prose mention.
      const readerKey = new RegExp(`^\\s*${name}: \\(userId, after\\) => pageAfter\\(`, "m");
      if (!readerKey.test(src)) missing.push(name);
    }
    expect(
      missing,
      `manifest collections absent from the export seam's READERS map (an omitted reader silently exports an empty family): ${missing.join(", ")}`,
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

  it("S156/DE1: the route STREAMS the fragments (the wire shape — the body never joins into a second full-body string)", () => {
    const route = readFileSync(
      path.resolve(process.cwd(), "src/app/api/export/data/route.ts"),
      "utf8",
    );
    // The stream construction + the ordered enqueue loop + the close.
    expect(route).toContain("new ReadableStream");
    expect(route).toContain("controller.enqueue(chunk)");
    expect(route).toContain("controller.close()");
    // The fragments (never a joined json string) are the response body.
    expect(route).toContain("fragments");
    expect(route).not.toContain("fragments.join");
    expect(route).not.toContain("const json");
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

  it("S154/DC4: the transaction is WRITE-ONLY — no findFirst CALL form anywhere in the import route (the CP3 property, negatively pinned)", () => {
    const src = readFileSync(IMPORT_ROUTE, "utf8");
    // The CALL is the property (`.findFirst(`); the route's comments may
    // legitimately NAME the removed read (the S141/CP3 provenance). A
    // regression that re-interleaves a per-row read inside the
    // $transaction callback ships RED here even with every
    // presence-marker above intact.
    expect(src).not.toMatch(/\.\s*findFirst\s*\(/);
  });

  it("S154/DC1: the no-op update elision rides the pre-tx pass (the full-row read + the conservative diff + the counted-as-updated wire)", () => {
    const src = readFileSync(IMPORT_ROUTE, "utf8");
    expect(src).toContain("S154/DC1: the no-op update elision");
    expect(src).toContain("plannedUpdateIsNoOp");
    // The counted-as-updated wire: the elided rows join the `updated`
    // counter (the idempotence pin's updated: N on a re-import where
    // every row is a no-op — the wire shape unchanged by construction).
    expect(src).toMatch(/updated: u \+ /);
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

  it("CQ2/S156-DE1: the export size signal is byte-based end-to-end (the driver derives it once, per fragment)", () => {
    const seam = readFileSync(EXPORT_SEAM, "utf8");
    const route = readFileSync(EXPORT_ROUTE, "utf8");
    const page = readFileSync(EXPORT_PAGE, "utf8");
    const pure = readFileSync(DATA_EXPORT, "utf8");
    // S156/DE1 re-anchor: the whole-body encode-for-length is GONE — the
    // pure driver counts its own per-fragment encodes (every encoded
    // fragment is RETAINED payload, never a length-only allocation — the
    // F2 finding closed structurally). The pure seam stays TextEncoder-
    // based (client-imported module — Buffer is a node global the browser
    // bundle must never need).
    expect(pure).toContain("export async function buildExportFragments(");
    expect(pure).toContain("bytes += encoded.byteLength");
    expect(pure).not.toContain("Buffer.byteLength");
    expect(pure).not.toContain("export function exportByteSize(");
    // The driver returns the fragments + the exact byte total + the
    // STRUCTURED counts record (S157/DF1 grid-from-envelope: the /export
    // page's chip grid rides the envelope's own counts — one read pass
    // feeds the grid AND the size signal). The return shape is pinned
    // DELIBERATELY (the S156 lesson: a load-bearing seam shape carries
    // its WHY here) — the forbidden shapes are the materializing
    // `{ json, bytes }` form and any counts-free form (the page would
    // have to re-query); both consumers read `.bytes` — never
    // `json.length` (the A-M2 code-unit under-report).
    expect(pure).toContain("return { fragments, bytes, counts }");
    expect(seam).toContain("buildExportFragments");
    expect(route).toContain("String(bytes)");
    expect(page).toContain(".bytes");
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

// S145/CT source censuses — the s145 audit's M/L set. The census legs hold
// the SHAPE against drift; the behavioral semantics ride the e2e legs in
// resilience.spec.ts (CT1) and s21-data-export.spec.ts (CT3).
describe("the S145/CT source censuses", () => {
  // S145/CT1 (audit B-M1): the focus timer's completion window re-armed
  // from its own terminal state — remaining===0 && mode==="focus"
  // persisted through the in-flight save (and forever after a failed
  // save), the Start button stayed enabled, and complete() had no saving
  // guard, so a Play press at 00:00 POSTed a phantom full-duration
  // session (a double-log inside the window); the late .then/.catch
  // state writes clobbered newer mode picks (the S142-S144 ABA family,
  // this file's own settle path). The fix set: the saving latch + the
  // disabled affordance + the failure re-latch + the settle-CAS (the
  // CS1 instance-scoped idiom). A census cannot see wiring SCOPE (the
  // A-M1 lesson) — the two behavioral e2e legs carry the semantics —
  // but it holds the markers against drift.
  it("S145/CT1: the focus timer's completion window is guarded (the saving latch + the settle-CAS)", () => {
    const src = readFileSync(
      path.resolve(process.cwd(), "src/components/views/focustimer-view.tsx"),
      "utf8",
    );
    expect(src).toContain('from "@/lib/fetch-seq"');
    // The instance-scoped settle seq (the CS1 idiom — never per-render).
    expect(src).toContain("const settleSeq = React.useRef(createFetchSeq()).current;");
    // The ticket pair: minted at POST time, checked by the settle branches.
    expect(src).toContain("const settle = settleSeq.begin();");
    expect(src).toContain("settleSeq.isCurrent(settle)");
    // The saving latch: a second fire while a save is in flight is a no-op.
    expect(src).toContain("if (saving) {");
    // The affordance: BOTH control buttons disable during the save (the
    // Start button gained it — RED marker: exactly two occurrences).
    expect((src.match(/disabled=\{saving\}/g) ?? []).length).toBe(2);
    // The newer-interaction invalidators (every timer state owner mints).
    expect(src).toContain("settleSeq.begin(); // a newer timer interaction");
  });

  // S145/CT2 (audit B-L1): the forgot-password supersede pair ran as two
  // un-transacted awaits — a concurrent same-account race interleaves
  // delete/delete/create/create and leaves TWO live one-shot tokens,
  // breaking the route's own documented invariant ("exactly one live
  // link per account", the S121/BV11b comment). The batch $transaction
  // form closes the window (the BZ7/CE5 family). The census pins the
  // wiring; a behavioral concurrency pin is not externally drivable —
  // the forgot-flow e2e legs re-prove the flow itself.
  it("S145/CT2: the forgot-password supersede pair runs in ONE transaction (the one-live-link invariant)", () => {
    const src = readFileSync(
      path.resolve(process.cwd(), "src/app/api/auth/forgot-password/route.ts"),
      "utf8",
    );
    expect(src).toContain("db.$transaction([");
    expect(src).toContain("passwordResetToken.deleteMany");
    expect(src).toContain("passwordResetToken.create");
  });

  // S145/CT4 (audit A-L1): the demo-import-budget census the s144 commit
  // re-anchored was MIS-COUNTED — the s23 header claimed "exactly 9"
  // while the file makes 10 demo-session POSTs (9 fixture + 1 in-app
  // panel journey), i.e. 10/10 ZERO HEADROOM at the import limiter's
  // 10/15-min cap; the resilience cross-reference claimed 5 while the
  // file carries 9 (8 fixture + 1 demo.request). This census counts the
  // census-visible POST call sites per file and pins the header text
  // claims alongside them (the count-the-things doctrine; the next
  // budget-consuming commit re-anchors docs + census together).
  it("S145/CT4: the demo-session import POST counts match the documented budgets (the A-L1 recount)", () => {
    const s23 = readFileSync(path.resolve(process.cwd(), "tests/e2e/s23-import.spec.ts"), "utf8");
    const resilience = readFileSync(
      path.resolve(process.cwd(), "tests/e2e/resilience.spec.ts"),
      "utf8",
    );
    // The fixture form only — `request.post(` NOT preceded by a member
    // dot (page.request/demo.request ride other contexts by design).
    const fixture = (src: string) =>
      (src.match(/(?<![.\w])request\.post\("\/api\/import\/data"/g) ?? []).length;
    const demoCtx = (src: string) =>
      (src.match(/demo\.request\.post\("\/api\/import\/data"/g) ?? []).length;
    // s23: 9 fixture POSTs + the in-app panel-journey POST = 10/10.
    expect(fixture(s23)).toBe(9);
    expect(demoCtx(s23)).toBe(0);
    // resilience: 8 fixture + 1 demo.request = 9/10 (one slot free).
    expect(fixture(resilience)).toBe(8);
    expect(demoCtx(resilience)).toBe(1);
    // The header's present-tense claims are re-anchored to the recount.
    expect(s23).toContain("exactly 10 DEMO-user");
    expect(s23).toContain("zero headroom");
    expect(s23).toContain("resilience.spec.ts carries 9 demo-user");
  });
});
// S146/CU1 + CU2 + CU3 (the s146 audits' M/L set): the multipart mime
// guard wiring at the files POST door, the OTP re-issue transactional set
// at the register/re-send auth family (the S142-carried standing
// deferral landing — the CT2 batch-tx pattern extended to its siblings),
// and the body-read catch discrimination at the files door (the CN6
// shape the import route adopted at S139). The census pins the wiring;
// the behavioral legs ride the unit predicate (CU1) and the auth-flows
// register/resend journeys (CU2 — the interleave is not externally
// drivable, the CT2 doctrine); CU3's mid-stream abort is likewise not
// drivable from the Playwright API (the CN6 precedent was census-pinned
// for the same reason).
describe("S146/CU1-CU3: the upload mime guard + the OTP re-issue transactions + the files 413 discrimination", () => {
  const FILES_ROUTE = path.resolve(process.cwd(), "src/app/api/files/route.ts");
  const REGISTER = path.resolve(process.cwd(), "src/app/api/auth/register/route.ts");
  const RESEND = path.resolve(
    process.cwd(),
    "src/app/api/auth/resend-verification/route.ts",
  );

  it("S146/CU1: the files POST multipart door guards the mime before write (the import door's admitted set at the interactive door)", () => {
    // S146/CU1 (audit B-M1): `mime: entry.type` verbatim stored a
    // client-controlled part Content-Type with no length/charset bound —
    // the import door caps the identical column ("files.mime": 100 +
    // printable-ASCII, the CE7 bloat class riding every list GET). The
    // route now rejects a non-empty over-long or non-printable mime with
    // 400 before the write; the unknown-type "" shape keeps the
    // octet-stream fallback.
    const src = readFileSync(FILES_ROUTE, "utf8");
    expect(src).toContain("isPrintableAsciiMime");
    expect(src).toContain("UPLOAD_MIME_MAX_CHARS");
  });

  it("S146/CU2a: the register re-issue triple runs in ONE transaction (the existing-unverified branch)", () => {
    // S146/CU2 (audits A-L1 + B-L1): the deleteMany → user.update →
    // token.create triple ran as three sequential awaits — a concurrent
    // same-account re-register interleaves delete/delete/update/update/
    // create/create and leaves TWO live 15-min OTP codes (the older
    // inert by the findFirst-desc verify path, but the same BZ7/CE5
    // interleave family CT2 closed at the forgot-password sibling).
    const src = readFileSync(REGISTER, "utf8");
    expect(src).toContain("db.$transaction([");
    expect(src).toContain("verificationToken.deleteMany");
    expect(src).toContain("user.update");
    expect(src).toContain("verificationToken.create");
  });

  it("S146/CU2b: the register fresh-account pair runs in ONE interactive transaction (the P2002 loser stores nothing)", () => {
    // The fresh branch's user.create → token.create pair: the token data
    // depends on the created row's id, so the batch form cannot express
    // it — the interactive $transaction (the folders/[id] precedent).
    // The S125/BZ9 P2002 catch moves around the WHOLE tx: the unique
    // violation rolls the pair back identically (the loser's token was
    // never stored — the uniform {ok:true} shape unchanged).
    const src = readFileSync(REGISTER, "utf8");
    expect(src).toContain("db.$transaction(async (tx)");
    expect(src).toContain("tx.user.create");
    expect(src).toContain("tx.verificationToken.create");
  });

  it("S146/CU2c: the resend supersede pair runs in ONE transaction (the CT2 mirror)", () => {
    // The resend-verification sibling — the deleteMany + create pair,
    // the exact shape the forgot-password route closed at S145/CT2.
    const src = readFileSync(RESEND, "utf8");
    expect(src).toContain("db.$transaction([");
    expect(src).toContain("verificationToken.deleteMany");
    expect(src).toContain("verificationToken.create");
  });

  it("S146/CU3: the files body-read catch discriminates the typed over-cap error from transport failures (the CN6 shape)", () => {
    // S146/CU3 (audit B-L2): the files multipart branch answered a
    // confident 413 for ANY readBytesCapped failure — a mid-stream client
    // abort or proxy hiccup is not "too large" (the S139/CN6 lesson the
    // import route adopted; the files POST never did). Only the genuine
    // BodyTooLargeError answers 413; everything else propagates to the
    // honest 500 handler.
    const src = readFileSync(FILES_ROUTE, "utf8");
    expect(src).toContain("instanceof BodyTooLargeError");
  });
});

// S148/CW1 — the calculator-history POST budget census (audit B-L1, the
// s148 data-layer rotation; docs/remediation-plan-session148.md).
//
// The S130/CE6 census guards at FILE granularity: a route file passes the
// walk when ANY method in it rides checkRateLimit — which is exactly how
// the calculator-history POST escaped. Its DELETE twin gained the shared
// `write:${user.id}` 600/15-min budget at CE6, and the file has satisfied
// the census ever since while the POST (1 INSERT + the retention-trim
// interactive transaction per call) rode NO budget — the S122/BW5 comment
// had conflated storage-boundedness (the 500-row trim) with
// rate-boundedness. A scripted authenticated flood churned the
// single-node SQLite writer at line rate through the one write verb the
// BZ5/CB7 posture missed. The per-method census redesign stays the named
// B-I deferral; THIS leg is the focused per-method pin for the gap the
// audit actually found (the CV1 wiring-census precedent: slice the POST
// block, assert its own budget).
describe("S148/CW1: the calculator-history POST rides the shared write budget", () => {
  const CALC_ROUTE = path.resolve(
    process.cwd(),
    "src/app/api/calculator/history/route.ts",
  );

  it("the POST block itself carries checkRateLimit (the per-file census cannot see method gaps)", () => {
    const src = readFileSync(CALC_ROUTE, "utf8");
    // Slice the POST handler block: from its export line to the next
    // export (the DELETE twin) or EOF — the budget must live INSIDE the
    // POST block, not just somewhere in the file.
    const start = src.indexOf("export const POST");
    expect(start, "the POST export exists").toBeGreaterThan(-1);
    const nextExport = src.indexOf("export const", start + 1);
    const postBlock = src.slice(start, nextExport === -1 ? undefined : nextExport);
    expect(
      postBlock,
      "the calculator-history POST must call checkRateLimit (audit B-L1: the one authenticated write verb outside the shared BZ5/CB7 write budget)",
    ).toContain("checkRateLimit(");
  });
});

// ---------------------------------------------------------------------------
// S149/Batch CX — the FE/views-axis wiring censuses (the s149 audits' L-tier
// riders: the resend transport branch, the calculator save guards, the
// settings me-fetch failure surface). The CV1 wiring-census precedent: the
// behavioral seams live in components (no component-test infra), so the
// census pins the branch markers the fixes land.
// ---------------------------------------------------------------------------

describe("S149/CX3: the resend transport-failure branch (B-L1 — the auth surface)", () => {
  const LOGIN_SURFACE = path.resolve(
    process.cwd(),
    "src/components/auth/login-surface.tsx",
  );

  it("the resend catch distinguishes TRANSPORT failures (timeout + offline) from account state", () => {
    const src = readFileSync(LOGIN_SURFACE, "utf8");
    // Slice the resend handler: from its const declaration to the finally.
    const resendAt = src.indexOf("const resend = async () => {");
    expect(resendAt, "the resend handler exists").toBeGreaterThan(-1);
    const resendBody = src.slice(resendAt, src.indexOf("  };", resendAt));
    // The transport branch: the deadline classifier AND the offline status
    // both render their honest copy — never the uniform "a new code is on
    // its way" line for a request that never left the browser.
    expect(resendBody).toMatch(/isTimeoutError\(err\)/);
    expect(resendBody).toMatch(/status === 0/);
    // The CF8 no-enumeration line stays for every ACCOUNT-state failure.
    expect(resendBody).toContain("If that account needs verification, a new code is on its way.");
  });
});

describe("S149/CX4: the calculator history-save guards (B-L2)", () => {
  const CALC_VIEW = path.resolve(
    process.cwd(),
    "src/components/views/calculator-view.tsx",
  );

  it("the '=' branch no-ops a re-press right after an evaluation (no derived noise row)", () => {
    const src = readFileSync(CALC_VIEW, "utf8");
    // Slice the '=' branch: from its if to the justEvaluated digit branch.
    const eqAt = src.indexOf('if (token === "=") {');
    expect(eqAt, "the '=' branch exists").toBeGreaterThan(-1);
    const eqBody = src.slice(eqAt, src.indexOf("justEvaluated.current && /[0-9.]/", eqAt));
    // The re-press guard: a second '=' immediately after an evaluation is a
    // no-op (the display already holds the result; the derived "5 = 5" row
    // was pure noise). RED pre-fix: no justEvaluated guard inside the branch.
    expect(eqBody).toMatch(/justEvaluated\.current\) return;/);
  });

  it("the GPA Save button carries an in-flight disable (the CI4 pattern)", () => {
    const src = readFileSync(CALC_VIEW, "utf8");
    expect(src).toContain("savingGpa");
    // The Save button itself must be disabled while the POST is in flight
    // (the disable rides the same Button element as the onClick — window
    // spans both sides of the handler reference).
    const gpaSaveAt = src.indexOf("void saveGpaToHistory()");
    expect(gpaSaveAt, "the GPA Save onClick exists").toBeGreaterThan(-1);
    const gpaButton = src.slice(Math.max(0, gpaSaveAt - 220), gpaSaveAt + 120);
    expect(gpaButton).toMatch(/disabled=\{savingGpa\}/);
  });

  it("the unit Save-to-history button carries an in-flight disable (the CI4 pattern)", () => {
    const src = readFileSync(CALC_VIEW, "utf8");
    expect(src).toContain("savingUnit");
    const unitSaveAt = src.indexOf("void saveUnitToHistory()");
    expect(unitSaveAt, "the unit Save onClick exists").toBeGreaterThan(-1);
    const unitButton = src.slice(Math.max(0, unitSaveAt - 260), unitSaveAt + 120);
    expect(unitButton).toMatch(/disabled=\{savingUnit\}/);
  });
});

describe("S149/CX5: the Settings me-fetch failure surface (B-L3)", () => {
  const SETTINGS_VIEW = path.resolve(
    process.cwd(),
    "src/components/views/settings-view.tsx",
  );

  it("a non-401 me-fetch failure surfaces an alert + Retry (never a stuck loading line)", () => {
    const src = readFileSync(SETTINGS_VIEW, "utf8");
    // Slice the SettingsView body: from its export to the Tabs render.
    const viewAt = src.indexOf("export function SettingsView()");
    expect(viewAt, "the SettingsView export exists").toBeGreaterThan(-1);
    const viewBody = src.slice(viewAt, src.indexOf("return (", viewAt));
    // The failure state + the retry re-run (the BootDataFailureBar idiom).
    expect(viewBody).toContain("loadFailed");
    expect(viewBody).toMatch(/setLoadFailed\(true\)/);
    expect(viewBody).toMatch(/setRetryCount/);
    // The render: the failed card never claims "Loading your account…" —
    // the honest failure copy + the alert + the Retry affordance. (The
    // email-line ternary carries the short copy; the ALERT carries the
    // "...information." long copy — anchor on it, in the JSX entity form
    // the source spells it.)
    expect(src).toContain("Couldn't load your account.");
    expect(src).toContain('role="alert"');
    const alertAt = src.indexOf("Couldn&apos;t load your account information.");
    expect(alertAt, "the alert copy exists").toBeGreaterThan(-1);
    const alertBlock = src.slice(Math.max(0, alertAt - 500), alertAt);
    expect(alertBlock).toMatch(/sf-alert-red/);
  });
});

// ---------------------------------------------------------------------------
// S150/CY1 (audit B-L1): the multipart folderId joins the 64-char id bound
// — the S118/BS2 idField + S139/CN11 route-param convention. The raw form
// value reached db.fileFolder.findFirst VERBATIM: the one id atom the
// schemas never owned (Prisma parameterizes, so no injection — purely the
// boundary inconsistency; a ~2.1 MB parameter could reach SQLite per
// upload request inside the 2 MiB+64 KiB multipart envelope). A >64-char
// id cannot exist, so the honest status is the no-oracle 404, byte-
// identical to the missing-row branch it precedes.
// ---------------------------------------------------------------------------
describe("S150/CY1: the multipart folderId 64-char bound (B-L1)", () => {
  const FILES_ROUTE = path.resolve(process.cwd(), "src/app/api/files/route.ts");

  it("guards the folderId length BEFORE the ownership query (the CN11 route-param convention)", () => {
    const src = readFileSync(FILES_ROUTE, "utf8");
    // The multipart branch: the raw form read.
    const rawAt = src.indexOf('const rawFolder = form.get("folderId")');
    expect(rawAt, "the multipart folderId read exists").toBeGreaterThan(-1);
    const branch = src.slice(rawAt, rawAt + 900);
    const guardAt = branch.indexOf("rawFolder.length > 64");
    expect(guardAt, "the 64-char guard exists in the multipart branch").toBeGreaterThan(-1);
    const queryAt = branch.indexOf("fileFolder.findFirst");
    expect(queryAt, "the ownership query exists in the multipart branch").toBeGreaterThan(-1);
    // Ordered: the guard fires BEFORE the query — an impossible id never
    // reaches Prisma.
    expect(guardAt).toBeLessThan(queryAt);
    // The no-oracle copy: the impossible id answers exactly like the
    // missing row (never a new status class).
    expect(branch).toContain("That folder does not exist.");
  });
});

// ---------------------------------------------------------------------------
// S150/CY3 (the S149/B-I4 honesty rider): the note-tag silent drop. addTag
// cleared the draft BEFORE the guards, then silently returned on the
// >24-char and duplicate cases — the user's text was destroyed with zero
// feedback (the "input cleared, nothing happened, no reason" class). The
// empty case stays a no-op (nothing was lost); the two real drops now
// speak through the aria-live toast stack (the S14 announcement contract).
// ---------------------------------------------------------------------------
describe("S150/CY3: the note-tag honest feedback (S149/B-I4)", () => {
  const NOTES_VIEW = path.resolve(process.cwd(), "src/components/views/notes-view.tsx");

  it("addTag names the two real drop reasons (the length cap + the duplicate)", () => {
    const src = readFileSync(NOTES_VIEW, "utf8");
    const addAt = src.indexOf("const addTag = () => {");
    expect(addAt, "the addTag handler exists").toBeGreaterThan(-1);
    const block = src.slice(addAt, src.indexOf("};", addAt));
    // The honest markers, in the toast copy family ("Files are limited to
    // 2 MiB.").
    expect(block).toContain("Tags are limited to 24 characters.");
    expect(block).toContain("That tag is already on this note.");
    // Both drops announce through the toast seam (the aria-live stack) —
    // not a silent return.
    expect(block).toMatch(/toast\.error\(/);
  });
});

// ---------------------------------------------------------------------------
// S151/CZ1 (audit B-M1): the notes tags wiring census — the CX2 updater-form
// chain on the tags field. The view's addTag/removeTag PATCHed ABSOLUTE
// arrays computed from the render-snapshot selectedTags (saveTags([...
// selectedTags, tag]) / saveTags(selectedTags.filter(...))), so two tag ops
// inside one PATCH+refetch window computed from the same stale base and
// silently dropped the first (the exact BX10/CX2 class, one field over).
// The handlers must now declare effects through the chained
// mutations.setNoteTags(selected.id, updater) — the chain supplies the
// post-settle base; the view-level guards (the 24-char cap + the duplicate
// toast) stay the caller's job, and the add updater stays idempotent (the
// belt-and-braces dedupe — a double-Enter inside the window must not
// append a duplicate when the fresh base already carries the tag).
// ---------------------------------------------------------------------------
describe("S151/CZ1: the notes tags wiring census (B-M1 — the updater-form chain)", () => {
  const NOTES_VIEW = path.resolve(process.cwd(), "src/components/views/notes-view.tsx");

  it("addTag/removeTag ride mutations.setNoteTags (the absolute-array snapshot PATCHes are gone)", () => {
    const src = readFileSync(NOTES_VIEW, "utf8");
    // Slice the tag handlers: addTag through removeTag's close (the next
    // `return (` after removeTag ends the handler pair).
    const addAt = src.indexOf("const addTag = () => {");
    expect(addAt, "the addTag handler exists").toBeGreaterThan(-1);
    const removeAt = src.indexOf("const removeTag = (tag: string) => {", addAt);
    expect(removeAt, "the removeTag handler exists").toBeGreaterThan(-1);
    const handlersEnd = src.indexOf("\n  return (", removeAt);
    const handlers = src.slice(addAt, handlersEnd === -1 ? undefined : handlersEnd);
    // S161/DJ1 rewire: the handlers declare their effects through the
    // guarded mutateTags wrapper (the patchSelected shape — the id is
    // captured for the departed-note guard) which rides the chained
    // mutations.setNoteTags(noteId, update) — the caller still declares
    // the effect; the chain still supplies the post-settle base.
    expect(handlers).toContain("mutateTags(selected.id, (tags) =>");
    expect(handlers).toContain("await mutations.setNoteTags(noteId, update);");
    // S161/DJ1: the rejection surfaces — the wrapper's catch toasts through
    // the aria-live stack behind the AG6 departed-note guard (the pre-DJ1
    // shape discarded the chain's designed caller rejection).
    expect(handlers).toContain("if (selectedIdRef.current !== noteId) return;");
    expect(handlers).toContain("Tag not saved — check your connection.");
    // The absolute-array shapes are GONE (the render-snapshot PATCHes).
    expect(handlers).not.toContain("saveTags(");
    // The idempotent add updater: the fresh-base dedupe (a double-Enter on
    // the same tag inside the window appends nothing when the base already
    // carries it).
    expect(handlers).toMatch(/tags\.includes\(tag\) \? tags : \[\.\.\.tags, tag\]/);
    // The view-level guards stay (the CY3 honest toasts ride the caller).
    expect(handlers).toContain("Tags are limited to 24 characters.");
    expect(handlers).toContain("That tag is already on this note.");
  });

  it("the saveTags absolute-array helper is retired (no consumer remains)", () => {
    const src = readFileSync(NOTES_VIEW, "utf8");
    expect(src).not.toContain("const saveTags = ");
  });
});

// ---------------------------------------------------------------------------
// S151/CZ2 (audit B-L1): the files failed-initial-load surface — the one
// view with a private loader (the shell's BootDataFailureBar cannot cover
// it). A failed initial GET fired only the TRANSIENT toast, then the
// finally flipped loading false and the render settled into the permanent
// "No files yet" EmptyState — a false claim of an empty account with no
// retry (the CG5/CX5 class, one view over). The CX5 pattern: loadFailed +
// retryCount state, the alert + Retry render leg BEFORE the false-empty
// branch, the success retry clearing the alert.
// ---------------------------------------------------------------------------
describe("S151/CZ2: the files failed-load surface (B-L1 — the false-empty branch)", () => {
  const FILES_VIEW = path.resolve(process.cwd(), "src/components/views/files-view.tsx");

  it("a failed initial load surfaces the alert + Retry (never a false 'No files yet')", () => {
    const src = readFileSync(FILES_VIEW, "utf8");
    // The failure state + the retry re-run + the success clear (the CX5
    // shape).
    expect(src).toContain("loadFailed");
    expect(src).toMatch(/setLoadFailed\(true\)/);
    expect(src).toMatch(/setLoadFailed\(false\)/);
    expect(src).toMatch(/setRetryCount/);
    // The initial-load effect's catch carries the failure state write
    // (beside the transient toast — the immediate announcement). Anchor
    // INSIDE the initial-load effect: the `refresh` callback above carries
    // its own toast with the same copy (the list-refresh path — transient
    // only, by design), so the toast copy alone is ambiguous.
    const effectAt = src.indexOf("// Initial fetch is INLINED in the effect");
    expect(effectAt, "the initial-load effect exists").toBeGreaterThan(-1);
    const catchAt = src.indexOf("Could not load your files.", effectAt);
    expect(catchAt, "the initial-load toast copy exists").toBeGreaterThan(effectAt);
    const finallyAt = src.indexOf("} finally {", catchAt);
    expect(finallyAt, "the initial-load finally exists").toBeGreaterThan(catchAt);
    const catchBlock = src.slice(catchAt, finallyAt);
    expect(catchBlock).toMatch(/setLoadFailed\(true\)/);
    // The render: the error leg precedes the false-empty branch (ordered —
    // the EmptyState can no longer render on a failed load).
    const errorAt = src.indexOf("Couldn&apos;t load your files.");
    expect(errorAt, "the files alert copy exists").toBeGreaterThan(-1);
    const emptyAt = src.indexOf('title="No files yet"');
    expect(emptyAt, "the empty-state title exists").toBeGreaterThan(-1);
    expect(errorAt).toBeLessThan(emptyAt);
    // The alert is the red role="alert" family + a real Retry (the CX5
    // idiom).
    const alertBlock = src.slice(Math.max(0, errorAt - 500), errorAt);
    expect(alertBlock).toContain('role="alert"');
    expect(alertBlock).toMatch(/sf-alert-red/);
    const retryBlock = src.slice(errorAt, errorAt + 400);
    expect(retryBlock).toMatch(/setRetryCount\(\(count\) => count \+ 1\)/);
  });
});

// ---------------------------------------------------------------------------
// S151/CZ3 (audit B-L3): the phantom-session gate. The Complete button
// gated only on `saving`, so a stray click on a NEVER-STARTED timer
// computed Math.max(1, durations.focus - remaining) = max(1, 0) = 1 and
// minted a phantom 1-second completed session (stats +1, a spurious saved
// row, an auto-switch to Short Break). The gate: a real interval exists
// iff the timer ran (running) or any time came off the preset (remaining
// < durations[mode]) — the state after every mount/switchMode/applyPreset/
// reset is exactly the gated one.
// ---------------------------------------------------------------------------
describe("S151/CZ3: the phantom-session gate (B-L3 — the never-started Complete)", () => {
  const TIMER_VIEW = path.resolve(process.cwd(), "src/components/views/focustimer-view.tsx");

  it("the complete handler gates the never-started timer BEFORE the session POST", () => {
    const src = readFileSync(TIMER_VIEW, "utf8");
    const completeAt = src.indexOf("const complete = React.useCallback(() => {");
    expect(completeAt, "the complete handler exists").toBeGreaterThan(-1);
    const handler = src.slice(completeAt, src.indexOf("  }, [", completeAt));
    const gateAt = handler.indexOf("!running && remaining >= durations[mode]");
    expect(gateAt, "the never-started gate exists in the handler").toBeGreaterThan(-1);
    const postAt = handler.indexOf("createFocusSession");
    expect(postAt, "the session POST exists in the handler").toBeGreaterThan(-1);
    // Ordered: the gate fires BEFORE the POST — a never-started complete
    // never mints a session row.
    expect(gateAt).toBeLessThan(postAt);
    // The gate speaks (a stray click gets its reason — the S14 contract).
    expect(handler).toMatch(/toast\.info\(/);
    // `running` joins the useCallback deps (the CD3 discipline — the gate
    // reads it).
    const depsAt = src.indexOf("  }, [", completeAt);
    const deps = src.slice(depsAt, src.indexOf("]);", depsAt));
    expect(deps).toContain("running");
    expect(deps).toContain("saving");
  });
});

// ---------------------------------------------------------------------------
// S151/CZ4 (audit B-L4): the unit-save success feedback. saveUnitToHistory
// toasted only on error while its GPA twin toasts "GPA saved to history" —
// the user could not tell whether a conversion was recorded (especially
// with the history panel closed). The one-line mirror: the success toast
// after the createCalculatorEntry await.
// ---------------------------------------------------------------------------
describe("S151/CZ4: the unit-save success feedback (B-L4 — the GPA twin's mirror)", () => {
  const CALC_VIEW = path.resolve(process.cwd(), "src/components/views/calculator-view.tsx");

  it("saveUnitToHistory announces the saved row (the success branch speaks)", () => {
    const src = readFileSync(CALC_VIEW, "utf8");
    const saveAt = src.indexOf("const saveUnitToHistory = async () => {");
    expect(saveAt, "the unit save handler exists").toBeGreaterThan(-1);
    const handler = src.slice(saveAt, src.indexOf("  };", saveAt));
    const entryAt = handler.indexOf("createCalculatorEntry");
    expect(entryAt, "the history POST exists in the handler").toBeGreaterThan(-1);
    const toastAt = handler.indexOf("Conversion saved to history");
    expect(toastAt, "the success toast exists in the handler").toBeGreaterThan(-1);
    // Ordered: the toast fires for the SAVED row (after the POST).
    expect(toastAt).toBeGreaterThan(entryAt);
    expect(handler).toMatch(/toast\.success\(/);
  });
});

// ---------------------------------------------------------------------------
// S152/DA1 (the S151 audit's B-L5): the seven-site delete double-fire
// latch. The seven fire-and-forget delete handlers (events, exams,
// assignments, flashcards deck+card, notes note+notebook) carried no
// in-flight guard — a double-click fired the second DELETE into the
// first's PATCH window and toasted its 404 as an error ("Delete failed."
// on a delete that SUCCEEDED). The latch: a per-view deletingIds Set —
// the handler guards on membership, adds on start, and removes in the
// finally (a FAILED delete re-arms for retry; a successful one removes
// the row through the store refresh). The four confirm-gated deletes
// (grades/subjects/holidays/groups) already latch via the
// setDeleting(null) pre-call pattern and are out of scope by design.
// ---------------------------------------------------------------------------
describe("S152/DA1: the delete double-fire latch (B-L5 — the seven fire-and-forget sites)", () => {
  const VIEWS_DIR = path.resolve(process.cwd(), "src/components/views");

  type Site = { file: string; handler: string; marker: string };
  const SITES: Site[] = [
    { file: "events-view.tsx", handler: "const remove = async (id: string) => {", marker: "deleteEvent(id)" },
    { file: "exams-view.tsx", handler: "const remove = async (id: string) => {", marker: "deleteExam(id)" },
    { file: "assignments-view.tsx", handler: "const remove = async (id: string) => {", marker: "deleteAssignment(id)" },
    { file: "flashcards-view.tsx", handler: "const removeDeck = async (deck: FlashcardDeckRow) => {", marker: "deleteFlashcardDeck(deck.id)" },
    { file: "flashcards-view.tsx", handler: "const removeCard = async (id: string) => {", marker: "deleteFlashcard(id)" },
    { file: "notes-view.tsx", handler: "const removeNote = async (id: string) => {", marker: "deleteNote(id)" },
    { file: "notes-view.tsx", handler: "const removeNotebook = async (row: NotebookRow) => {", marker: "deleteNotebook(row.id)" },
  ];

  it.each(SITES.map((s) => [s.file, s.handler] as const))(
    "%s :: %s carries the in-flight latch",
    (file, handlerSig) => {
      const src = readFileSync(path.resolve(VIEWS_DIR, file), "utf8");
      const site = SITES.find((s) => s.file === file && s.handler === handlerSig)!;
      const handlerAt = src.indexOf(handlerSig);
      expect(handlerAt, `the handler exists in ${file}`).toBeGreaterThan(-1);
      const handler = src.slice(handlerAt, src.indexOf("\n  };", handlerAt));
      // The latch: the membership guard BEFORE the delete call.
      const guardAt = handler.indexOf("deletingIds.has(");
      expect(guardAt, "the membership guard exists").toBeGreaterThan(-1);
      const deleteAt = handler.indexOf(site.marker);
      expect(deleteAt, `the delete call (${site.marker}) exists`).toBeGreaterThan(-1);
      expect(guardAt, "the guard fires BEFORE the delete").toBeLessThan(deleteAt);
      // The add on start (the latch arms) + the finally removal (retry
      // stays honest — a failed delete re-arms).
      expect(handler).toMatch(/setDeletingIds\(\(prev\) => new Set\(prev\)\.add\(/);
      const finallyAt = handler.indexOf("} finally {");
      expect(finallyAt, "the finally block exists").toBeGreaterThan(deleteAt);
      const finallyBlock = handler.slice(finallyAt);
      expect(finallyBlock).toMatch(/next\.delete\(/);
      // The view owns the state the latch rides.
      expect(src).toMatch(/const \[deletingIds, setDeletingIds\] = React\.useState/);
    },
  );
});

// ---------------------------------------------------------------------------
// S152/DA2 (the S151 audit's B-L6): the noValidate hand-guard copy sweep.
// Seven dialogs (events, assignments, exams, notes, timetable, flashcards
// deck + card) rode noValidate forms whose empty-required-field submit
// went to the SERVER and surfaced Zod's raw library copy through the
// dialog's setError (formatZodError passes the default issue message —
// "title: Too small: expected string to have >=1 characters"). The
// S127/CB17 files-view precedent ("Name and URL are both required.")
// generalized: each submit gains the required-field guard AFTER the busy
// guard and BEFORE the try, with the copy naming the FIELD (never the
// library). The server's Zod boundary stays (the API door keeps its
// validation — the guard is the dialog's hand-copy mirror).
// ---------------------------------------------------------------------------
describe("S152/DA2: the noValidate hand-guard sweep (B-L6 — the seven dialogs)", () => {
  const VIEWS_DIR = path.resolve(process.cwd(), "src/components/views");

  type Guard = { file: string; handler: string; copy: string };
  const GUARDS: Guard[] = [
    { file: "events-view.tsx", handler: "const submit = async (e: React.FormEvent) => {", copy: "Please enter a title." },
    { file: "assignments-view.tsx", handler: "const submit = async (e: React.FormEvent) => {", copy: "Please enter a title." },
    { file: "exams-view.tsx", handler: "const submit = async (e: React.FormEvent) => {", copy: "Please enter a title." },
    { file: "notes-view.tsx", handler: "const submit = async (e: React.FormEvent) => {", copy: "Please enter a name." },
    { file: "timetable-view.tsx", handler: "const submit = async (e: React.FormEvent) => {", copy: "Please enter a name." },
    { file: "flashcards-view.tsx", handler: "const submitDeck = async (e: React.FormEvent) => {", copy: "Please enter a deck name." },
    { file: "flashcards-view.tsx", handler: "const submitCard = async (e: React.FormEvent) => {", copy: "Please enter the card front." },
  ];

  it.each(GUARDS.map((g) => [g.file, g.handler] as const))(
    "%s :: %s guards the empty required fields with human copy",
    (file, handlerSig) => {
      const src = readFileSync(path.resolve(VIEWS_DIR, file), "utf8");
      const guard = GUARDS.find((g) => g.file === file && g.handler === handlerSig)!;
      const handlerAt = src.indexOf(handlerSig);
      expect(handlerAt, `the handler exists in ${file}`).toBeGreaterThan(-1);
      // The \n-anchored close: the handler's own two-space `};` (a nested
      // `    };` — e.g. a payload object — must not end the slice early).
      const handler = src.slice(handlerAt, src.indexOf("\n  };", handlerAt));
      // The hand-guard copy exists INSIDE the handler.
      const guardAt = handler.indexOf(guard.copy);
      expect(guardAt, `the guard copy (${guard.copy}) exists`).toBeGreaterThan(-1);
      // The guard fires BEFORE the first await (no network round-trip for
      // an empty form — the round-trip is where the raw Zod copy came
      // from).
      const tryAt = handler.indexOf("try {");
      expect(tryAt, "the try block exists").toBeGreaterThan(-1);
      expect(guardAt).toBeLessThan(tryAt);
      // The guard speaks through the dialog's existing error slot (the
      // same a11y path the ApiError branch rides).
      expect(handler.slice(guardAt - 200, guardAt + 200)).toMatch(/setError\(/);
    },
  );
});

// ---------------------------------------------------------------------------
// S152/DA3 (the S151 audit's B-L2, the product decision adjudicated):
// the AI-generate replace-confirm. The practice-test editor's Generate
// button silently REPLACED the whole drafts list (setDrafts(drafts) at
// :220) — an editing user's pre-populated questions vanished with no
// confirmation. The adjudication: replace semantics KEPT (the reference
// behavior), gated by an AlertDialog confirm when drafts exist — the
// app's delete-confirm family pattern; the confirm sits BEFORE the AI
// call so a cancel never burns the ai: budget; the fresh-test path (an
// empty editor) generates directly.
// ---------------------------------------------------------------------------
describe("S152/DA3: the AI-generate replace-confirm (B-L2 — the adjudicated product decision)", () => {
  const VIEW = path.resolve(process.cwd(), "src/components/views/practicetests-view.tsx");

  it("the Generate click gates on existing drafts (the confirm state opens, the AI call does not)", () => {
    const src = readFileSync(VIEW, "utf8");
    // The confirm state exists.
    expect(src).toMatch(/const \[replaceConfirmOpen, setReplaceConfirmOpen\] = React\.useState\(false\)/);
    // The gate: the button's onClick routes through a gate that opens the
    // confirm when drafts exist.
    const gateAt = src.indexOf("drafts.length > 0");
    expect(gateAt, "the drafts.length gate exists").toBeGreaterThan(-1);
    const gateBlock = src.slice(gateAt - 300, gateAt + 300);
    expect(gateBlock).toMatch(/setReplaceConfirmOpen\(true\)/);
    // The generate flow itself stays intact (the s127-CB3 API twin + the
    // generating latch unchanged).
    const generateAt = src.indexOf("const generateQuestions = async () => {");
    expect(generateAt, "the generate flow exists").toBeGreaterThan(-1);
  });

  it("the confirm dialog's Replace action runs the generate (replace semantics kept, confirmed)", () => {
    const src = readFileSync(VIEW, "utf8");
    // The AlertDialog wiring: the open state + the Replace action.
    const dialogAt = src.indexOf("open={replaceConfirmOpen}");
    expect(dialogAt, "the confirm dialog rides the state").toBeGreaterThan(-1);
    const dialogBlock = src.slice(dialogAt, dialogAt + 1600);
    expect(dialogBlock).toMatch(/AlertDialogTitle/);
    const actionAt = dialogBlock.indexOf("void generateQuestions()");
    expect(actionAt, "the Replace action runs the generate").toBeGreaterThan(-1);
    // The dialog names the destruction (the count of questions replaced).
    expect(dialogBlock).toMatch(/Replace current questions\?/);
  });
});

// ---------------------------------------------------------------------------
// S152/DA4 (Audit B B-L1): the withUserParams 401-order. The item-route
// wrapper applied the CN11 id bound BEFORE requireUser() — an
// unauthenticated request with a malformed (>64-char) id answered 404,
// not the documented 401 envelope (http.ts's own "unauthenticated
// requests still 401" contract, false on that path). The reorder:
// requireUser() FIRST, then the id bound — the no-oracle 404 semantics
// for authed callers unchanged (a >64-char id still cannot exist).
// ---------------------------------------------------------------------------
describe("S152/DA4: the withUserParams 401-order (B-L1 — auth precedes the id bound)", () => {
  const HTTP = path.resolve(process.cwd(), "src/lib/server/http.ts");

  it("requireUser() precedes the CN11 id bound (unauthenticated malformed-id calls answer 401)", () => {
    const src = readFileSync(HTTP, "utf8");
    const wrapperAt = src.indexOf("export function withUserParams(handler: AuthedItemHandler) {");
    expect(wrapperAt, "the withUserParams wrapper exists").toBeGreaterThan(-1);
    const wrapper = src.slice(wrapperAt, src.indexOf("    } catch (err: unknown) {", wrapperAt));
    const authAt = wrapper.indexOf("const user = await requireUser();");
    expect(authAt, "the auth gate exists in the wrapper").toBeGreaterThan(-1);
    const boundAt = wrapper.indexOf("id.length > 64");
    expect(boundAt, "the CN11 id bound exists in the wrapper").toBeGreaterThan(-1);
    // Ordered: the auth gate fires FIRST — the 401 envelope answers
    // every unauthenticated path, malformed id included.
    expect(authAt).toBeLessThan(boundAt);
  });
});

// ---------------------------------------------------------------------------
// S152/DA6 (the Audit A doc-census drift): the count-claims machine gate,
// the CQ6 cross-read family extended to the README + SKILL prose sites
// that rotted while every machine-pinned anchor stayed green (README:108
// + :167 carried an S146-era "1513"; README:184 carried a pre-CL2 "10
// MiB" import cap while IMPORT_MAX_BYTES has been 64 MiB since S137;
// SKILL:630 carried the S150 figures under an S151 label; SKILL:138
// carried a "1449+605" census four cycles stale). The pins are
// SELF-ANCHORING: each derives the expected value from the same source
// the docs cite (the vitest header, the cert script's expected map,
// IMPORT_MAX_BYTES itself) — the next count change forces the doc
// update in the same commit or the leg fails.
// ---------------------------------------------------------------------------
describe("S152/DA6: the doc-counts cross-read pins (the CQ6 family, self-anchoring)", () => {
  const README = path.resolve(process.cwd(), "README.md");
  const SKILL = path.resolve(process.cwd(), "omni-study1_SKILL.md");
  const VITEST_CONFIG = path.resolve(process.cwd(), "vitest.config.ts");
  const CERT_SCRIPT = path.resolve(process.cwd(), "scripts/e2e-chunked-cert.sh");
  const DATA_IMPORT = path.resolve(process.cwd(), "src/lib/data-import.ts");

  function vitestHeaderCounts(): { files: number; tests: number } {
    const src = readFileSync(VITEST_CONFIG, "utf8");
    const m = src.match(/(\d+) files \/ (\d+) tests/);
    expect(m, "the vitest header count line exists").not.toBeNull();
    return { files: Number(m![1]), tests: Number(m![2]) };
  }

  function certTotal(): number {
    const src = readFileSync(CERT_SCRIPT, "utf8");
    const m = src.match(/Expected: (\d+) \+ (\d+) \+ (\d+) \+ (\d+) \+ (\d+) = (\d+)/);
    expect(m, "the cert script expected map exists").not.toBeNull();
    return Number(m![6]);
  }

  it("README's two unit-count prose sites agree with the vitest header (the tree diagram + the testing section)", () => {
    const header = vitestHeaderCounts();
    const readme = readFileSync(README, "utf8");
    const tree = readme.match(/Vitest unit layer \((\d+) tests, (\d+) files\)/);
    expect(tree, "the tree-diagram unit-count site exists").not.toBeNull();
    expect(Number(tree![1]), "the tree-diagram test count agrees").toBe(header.tests);
    expect(Number(tree![2]), "the tree-diagram file count agrees").toBe(header.files);
    const testing = readme.match(/Vitest — (\d+) unit tests/);
    expect(testing, "the testing-section unit-count site exists").not.toBeNull();
    expect(Number(testing![1]), "the testing-section count agrees").toBe(header.tests);
  });

  it("README's import-cap prose agrees with IMPORT_MAX_BYTES (the CL2 64 MiB, not the S124-era figure)", () => {
    const importSrc = readFileSync(DATA_IMPORT, "utf8");
    // The constant is a byte EXPRESSION (64 * 1024 * 1024) — evaluate the
    // multiplicative expression, not a bare integer.
    const capMatch = importSrc.match(/IMPORT_MAX_BYTES = ([\d*\s]+);/);
    expect(capMatch, "the IMPORT_MAX_BYTES constant exists").not.toBeNull();
    const capBytes = capMatch![1]
      .split("*")
      .map((part) => Number(part.trim()))
      .reduce((a: number, b: number) => a * b, 1);
    const capMiB = capBytes / (1024 * 1024);
    const readme = readFileSync(README, "utf8");
    // The CURRENT-STATE import-cap prose sites: the feature-table row (the
    // Data portability row's Restore card) + the API-table row. Historical
    // session-row narratives record their own era (S117/S118 rows cite the
    // then-current caps; the readJson 10 MiB body cap is a DIFFERENT
    // still-current constant) — out of scope by design.
    const featureRow = readme.match(/Restore from a backup[^\n]*?(\d+) MiB cap/);
    expect(featureRow, "the feature-row cap prose exists").not.toBeNull();
    expect(Number(featureRow![1]), "the feature-row cap agrees").toBe(capMiB);
    const apiRow = readme.match(/\/api\/import\/data[^\n]*?(\d+) MiB body cap/);
    expect(apiRow, "the API-table cap prose exists").not.toBeNull();
    expect(Number(apiRow![1]), "the API-table cap agrees with the seam constant").toBe(capMiB);
  });

  it("SKILL's green-state line agrees with the vitest header + the cert total (the §11 site that rotted under an S151 label)", () => {
    const header = vitestHeaderCounts();
    const e2e = certTotal();
    const skill = readFileSync(SKILL, "utf8");
    const green = skill.match(/(\d+) unit ✓ · build ✓[^\n]*· (\d+) e2e ✓ \((\d+) green\)/);
    expect(green, "the SKILL green-state line exists").not.toBeNull();
    expect(Number(green![1]), "the unit count agrees with the vitest header").toBe(header.tests);
    expect(Number(green![2]), "the e2e count agrees with the cert map").toBe(e2e);
    expect(Number(green![3]), "the census total is the sum").toBe(header.tests + e2e);
  });

  it("SKILL's CD3-posture prose census agrees with the same derived pair (the \"N+M test suites\" site)", () => {
    const header = vitestHeaderCounts();
    const e2e = certTotal();
    const skill = readFileSync(SKILL, "utf8");
    const prose = skill.match(/the (\d+)\+(\d+) test\s+suites/);
    expect(prose, "the CD3-posture census prose exists").not.toBeNull();
    expect(Number(prose![1]), "the prose unit count agrees").toBe(header.tests);
    expect(Number(prose![2]), "the prose e2e count agrees").toBe(e2e);
  });
});

// ---------------------------------------------------------------------------
// S153/DB1 (the rate-limit-model cycle, the corrected B-M1 mechanics): the
// aggregate discharge is CAPPED per window. Under the CM3 net-of-successes
// model a success nets 0 (the check's +1, the decrement's −1), so a
// SUCCESS-ONLY loop — scriptable own credentials under the default
// in-band posture — burned the synchronous scrypt pair per request with
// nothing binding it (the aggregate never trips; login's success path
// even resets both per-keys). The seam's per-window discharge ceiling
// (MAX_DISCHARGES_PER_WINDOW = 20 — 2× the per-IP budget, sized above the
// e2e chunk-5 login-success count of 13 so the cert arithmetic stays
// byte-identical) bounds every discharge-bearing aggregate at M+D = 60
// admitted requests per window. The structural pin: the constant exists,
// the Bucket carries the counter, and the decrement guards on it.
// ---------------------------------------------------------------------------
describe("S153/DB1: the capped aggregate discharge (B-M1 — the success-only loop bound)", () => {
  const AUTH = path.resolve(process.cwd(), "src/lib/auth.ts");

  it("auth.ts declares MAX_DISCHARGES_PER_WINDOW = 20 and the decrement guards on it", () => {
    const src = readFileSync(AUTH, "utf8");
    expect(src, "the constant is declared").toMatch(/MAX_DISCHARGES_PER_WINDOW = 20/);
    expect(src, "the Bucket shape carries the per-window counter").toMatch(/discharges: number/);
    // The guard: the discharge applies only while the window's
    // discharges sit under the ceiling (a fresh bucket starts at 0 —
    // the rollover IS the allowance reset).
    expect(src).toMatch(/bucket\.discharges < MAX_DISCHARGES_PER_WINDOW/);
    expect(src).toMatch(/discharges: 0/);
  });
});

// ---------------------------------------------------------------------------
// S153/DB2 (the export-page budget, the B-L2-audit close) · re-anchored
// S157/DF1 (grid-from-envelope): the /export page renders the full
// envelope per view (the 20-findMany serialize — byte-identical work to
// the budgeted download) while its route twin rode export:${user.id}
// 10/15-min. The page carries its OWN dedicated per-user budget AFTER the
// auth gate (the DA4 doctrine — the anon redirect stays budget-free) and
// BEFORE the ONE work call (the rate-limited render is the cheap path by
// construction). S157/DF1: the page's own 20-count query family is GONE —
// the grid rides the envelope's structured counts (one read pass; the
// L-1 manifest-completeness gap closed structurally: the grid derives
// from EXPORT_COLLECTIONS through the seam, never hand-listed at the
// page). The structural pin: the key, the sizing, the ordering, the
// count-free posture, and the honest rate-limited render all exist at
// the page.
// ---------------------------------------------------------------------------
describe("S153/DB2: the /export page carries its own per-user budget before the envelope work", () => {
  const PAGE = path.resolve(process.cwd(), "src/app/export/page.tsx");

  it("the page checks exportPage:${user.id} (10/15-min) before the ONE envelope render (S157/DF1 grid-from-envelope), with the honest rate-limited render", () => {
    const src = readFileSync(PAGE, "utf8");
    expect(src, "the dedicated page budget key exists").toMatch(/checkRateLimit\(`exportPage:\$\{user\.id\}`, 10\)/);
    // Ordered: the budget sits after the auth gate (the redirect) and
    // before the expensive work — the ONE envelope render (S157/DF1:
    // the grid + the size signal both ride it; the page's own count
    // query family is gone). The envelope anchor is the CALL (the bare
    // name also matches the import at the file head).
    const redirectAt = src.indexOf("redirect(\"/login\")");
    const budgetAt = src.indexOf("exportPage:");
    const envelopeAt = src.indexOf("renderExportEnvelope(publicUser(user))");
    expect(redirectAt, "the auth gate exists").toBeGreaterThan(-1);
    expect(envelopeAt, "the envelope build exists").toBeGreaterThan(-1);
    expect(redirectAt).toBeLessThan(budgetAt);
    expect(budgetAt).toBeLessThan(envelopeAt);
    // S157/DF1 — grid-from-envelope, pinned structurally: the page runs
    // NO count query of its own (the grid rides the envelope's counts;
    // a re-introduced db.*.count here would re-open the L-1
    // hand-maintained-literal drift class + the page-internal skew) and
    // holds NO db client at all (the unused-import guard, made
    // deliberate).
    expect(src).not.toMatch(/db\.[a-zA-Z]+\.count\(/);
    expect(src).not.toContain('from "@/lib/db"');
    // The honest rate-limited render (a page cannot answer 429 — the
    // amber alert is the documented shape, cheap by construction).
    expect(src).toContain("Too many export page views");
    expect(src).toMatch(/role="alert"/);
    expect(src).toMatch(/sf-alert-amber/);
  });
});

// ---------------------------------------------------------------------------
// S155/DD1 — the db-path module-anchor census pair (the S154/DC4 family
// precedent): the percent-decode fix is structurally pinned so a regression
// back to the raw `.pathname` form ships RED here, not silently in
// production under a spaced checkout path.
// ---------------------------------------------------------------------------
describe("the S155/DD1 db-path module-anchor censuses", () => {
  const DB_PATH = path.resolve(process.cwd(), "src/lib/db-path.ts");

  it("S155/DD1: the module anchor converts through the DIRECT fileURLToPath call (the import + the inline form + the marker)", () => {
    const src = readFileSync(DB_PATH, "utf8");
    // The sanctioned conversion: imported from node:url and CALLED DIRECTLY
    // on import.meta.url inside candidateRoots — the measured-design record:
    // a helper-wrapped form is opaque to Turbopack's file tracer and grew
    // the standalone output 144M → 699M, so the census pins the DIRECT form
    // (a regression back to either the raw .pathname or an opaque wrapper
    // ships RED in one of this pair).
    expect(src).toMatch(/import \{ fileURLToPath \} from "node:url"/);
    expect(src).toContain("S155/DD1");
    expect(src).toMatch(/const self = fileURLToPath\(import\.meta\.url\)/);
  });

  it("S155/DD1: the raw pathname form is GONE from db-path.ts (the B-I3 defect, negatively pinned)", () => {
    const src = readFileSync(DB_PATH, "utf8");
    // The CALL is the property (the DC4 precedent): no ASSIGNMENT deriving
    // the module path from the raw pathname form may survive. The module's
    // own comment block legitimately MENTIONS the removed form verbatim
    // (the provenance convention), so the pin anchors on the assignment
    // shape — `= new URL(import.meta.url).pathname` — which exists only in
    // code.
    expect(src).not.toMatch(/=\s*new URL\(import\.meta\.url\)\.pathname/);
  });
});

// ---------------------------------------------------------------------------
// S158/DG source censuses (the keyset-batched export reads + the scoped
// import updates + the panel input reset — the audit-driven hardening
// cycle; docs/remediation-plan-session158.md §3–§5).
// ---------------------------------------------------------------------------
describe("the S158/DG source censuses", () => {
  const DRIVER = path.resolve(process.cwd(), "src/lib/data-export.ts");
  const EXPORT_BUILD = path.resolve(process.cwd(), "src/lib/server/export-build.ts");
  const IMPORT_ROUTE = path.resolve(process.cwd(), "src/app/api/import/data/route.ts");
  const EXPORT_PANEL = path.resolve(process.cwd(), "src/components/export/export-panel.tsx");

  it("S158/DG1: the driver loops PAGES (the paged contract + the accumulation + the defensive terminal + the separator scaffolding)", () => {
    const src = readFileSync(DRIVER, "utf8");
    // The paged reader contract is exported (the server wiring + the unit
    // fakes both ride it).
    expect(src).toContain("export type ExportCollectionPage");
    // The accumulation: counts page-sum across batches (a count that
    // ASSIGNS page.rows.length would lose every page after the first).
    expect(src).toMatch(/counts\[collection\] \+= page\.rows\.length/);
    // The defensive terminal: an empty page ends the collection regardless
    // of hasMore (a reader answering empty+hasMore would otherwise loop
    // forever on an undefined anchor).
    expect(src).toMatch(/if \(page\.rows\.length === 0\) break;/);
    // The separator-across-batches shape: the per-page generator takes the
    // first-page flag (each non-first page's first row carries its own
    // leading "," — the byte-identity oracle pins the output).
    expect(src).toMatch(/rowFragments\(page\.rows, first\)/);
  });

  it("S158/DG1: the server wiring rides the keyset page wrapper (BATCH+1, the compound ARRAY cursor — createdAt-primary)", async () => {
    const src = readFileSync(EXPORT_BUILD, "utf8");
    const { EXPORT_COLLECTIONS } = await import("../src/lib/data-export");
    // The one-extra-row page: take BATCH+1, answer the first BATCH rows +
    // the hasMore bit (no empty roundtrip per collection).
    expect(src).toContain("EXPORT_BATCH_ROWS + 1");
    expect(src).toMatch(/hasMore: rows\.length > EXPORT_BATCH_ROWS/);
    // The unique-id cursor + skip 1 — the documented Prisma keyset idiom:
    // the orderBy pair (createdAt, id) is a total order, so positioning at
    // the unique anchor row and stepping past it continues the SAME order
    // losslessly (the compound-array-cursor form is unnecessary when the
    // cursor field is itself unique).
    expect(src).toContain("cursor: { id: after.id as string }");
    expect(src).toContain("skip: 1");
    // The keyset is a TOTAL order on every collection (unique id) — the
    // pagination is lossless by construction.
    expect(src).toContain("EXPORT_ORDER");
    // Every reader is paged (the READERS census twin — belt and braces
    // with the CJ2 re-anchor, same site, same shape).
    const paged = (src.match(/^\s*[a-zA-Z]+: \(userId, after\) => pageAfter\(/gm) ?? []).length;
    expect(paged, "all 20 readers ride the keyset page wrapper").toBe(EXPORT_COLLECTIONS.length);
  });

  it("S158/DG2: the import tx's update writes are OWNERSHIP-SCOPED for the userId-carrying collections (cards excepted — no userId column)", () => {
    const src = readFileSync(IMPORT_ROUTE, "utf8");
    // The scoped where: an id owned by the importer at probe time but
    // deleted + re-created by ANOTHER account inside the probe→tx window
    // would otherwise be overwritten AND its ownership flipped (the
    // payload re-attaches userId). The scoped form throws P2025 → the
    // existing named-409 leg (the CQ4 family) on every vanished/foreign
    // shape — behavior-compatible on every current path.
    expect(src).toMatch(/where: collection === "cards" \? \{ id \} : \{ id, userId: user\.id \}/);
    // The cards exception is documented at the site (the residual: a
    // one-row content re-parent with NO ownership column to flip).
    expect(src).toContain("S158/DG2");
  });

  it("S158/DG3: the Restore card's file input resets its value on EVERY pick (the stale-snapshot guard — both branches)", () => {
    const src = readFileSync(EXPORT_PANEL, "utf8");
    // The oversized branch reset pre-dates this cycle; the SUCCESS branch
    // now matches: re-picking the same (edited) file after a failed
    // import fires no change event while the value is unchanged, and the
    // Import button would re-send the ORIGINAL File snapshot.
    const resets = src.match(/e\.target\.value = ""/g) ?? [];
    expect(resets.length, "both pick branches reset the input value (oversized + success)").toBe(2);
    expect(src).toContain("S158/DG3");
  });
});

// ---------------------------------------------------------------------------
// S175/DY3 (the CLAUDE.md straggler + the tripwire-coverage close): the
// S174 cycle's doc-chain lockstep updated every machine-pinned site —
// README, AGENTS, the SKILL, the vitest header, the cert runner — but
// CLAUDE.md's e2e census line kept the S173 map ("641 —
// 158+201+98+95+89") because the CQ6 cross-read family reads CLAUDE.md
// ZERO times. The recurring straggler class the worklog names finally
// bit: the one doc with no pin is the one that rotted. This pin extends
// the CQ6 self-anchoring family to the LAST unpinned doc — CLAUDE.md's
// test-pyramid census pair (the Unit line + the E2E line) now derives
// its expectations from the same sources every other count site derives
// from (the vitest header + the cert script's Expected map) — the next
// count change forces the CLAUDE.md update in the same commit or this
// leg fails.
// ---------------------------------------------------------------------------
describe("S175/DY3: the CLAUDE.md census cross-read pins (the CQ6 family extended to the last unpinned doc)", () => {
  const CLAUDE = path.resolve(process.cwd(), "CLAUDE.md");
  const VITEST_CONFIG = path.resolve(process.cwd(), "vitest.config.ts");
  const CERT_SCRIPT = path.resolve(process.cwd(), "scripts/e2e-chunked-cert.sh");

  function vitestHeaderCounts(): { files: number; tests: number } {
    const src = readFileSync(VITEST_CONFIG, "utf8");
    const m = src.match(/(\d+) files \/ (\d+) tests/);
    expect(m, "the vitest header count line exists").not.toBeNull();
    return { files: Number(m![1]), tests: Number(m![2]) };
  }

  function certMap(): { chunks: number[]; total: number } {
    const src = readFileSync(CERT_SCRIPT, "utf8");
    const m = src.match(/Expected: (\d+) \+ (\d+) \+ (\d+) \+ (\d+) \+ (\d+) = (\d+)/);
    expect(m, "the cert script expected map exists").not.toBeNull();
    const chunks = m!.slice(1, 6).map(Number);
    return { chunks, total: Number(m![6]) };
  }

  it("CLAUDE.md's Unit census line agrees with the vitest header (the S174 site that stayed current)", () => {
    const header = vitestHeaderCounts();
    const claude = readFileSync(CLAUDE, "utf8");
    const unit = claude.match(/\*\*Unit \(Vitest, (\d+) tests\)\*\*/);
    expect(unit, "the CLAUDE.md unit census line exists").not.toBeNull();
    expect(Number(unit![1]), "the CLAUDE.md unit count agrees with the vitest header").toBe(header.tests);
  });

  it("CLAUDE.md's E2E census line agrees with the cert script's expected map (total + the per-chunk figures)", () => {
    const map = certMap();
    const claude = readFileSync(CLAUDE, "utf8");
    // The live-tense site (the Test Pyramid's E2E bullet); historical
    // session-row narratives record their own era and stay out of scope
    // by design (the DA6 pins' standing scope rule).
    const e2e = claude.match(
      /\*\*E2E \(Playwright, (\d+) tests across the 5-chunk cold map — (\d+)\+(\d+)\+(\d+)\+(\d+)\+(\d+)\)\*\*/,
    );
    expect(e2e, "the CLAUDE.md e2e census line exists").not.toBeNull();
    expect(Number(e2e![1]), "the CLAUDE.md e2e total agrees with the cert map").toBe(map.total);
    const chunks = e2e!.slice(2, 7).map(Number);
    expect(chunks, "the CLAUDE.md per-chunk map agrees with the cert script").toEqual(map.chunks);
  });
});

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
    expect(certSource).toContain("Expected: 146 + 179 + 72 + 93 + 77 = 567");
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

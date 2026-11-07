// S155/DD1 — the live spaced-path probe (the cycle's before/after record).
// The B-I3 class, demonstrated live: the REAL db-path module copied into a
// fixture repo checked out under a path WITH SPACES, then imported from a
// FOREIGN cwd. The copy's own import.meta.url then carries the
// percent-encoded spaced path — exactly the production trigger.
//
//   Pre-fix  (the raw `.pathname` form): the module anchor is silently
//            dropped (existsSync fails on "%20") and resolution falls back
//            to the CWD rule — the WRONG database (<cwd>/db/custom.db).
//   Post-fix (fileURLToPath, S155/DD1): the anchor decodes and resolution
//            lands inside the spaced repo — the documented "regardless of
//            the process working directory" invariant restored.
//
// Usage: node scripts/probe-dbpath-spaced-s155.mjs   (runnable from anywhere)
import { mkdirSync, writeFileSync, rmSync, copyFileSync, readFileSync } from "node:fs";
import path from "node:path";

const REPO = path.resolve(import.meta.dirname, "..");
const FIXTURE = "/tmp/s155 My Repo"; // the B-I3 trigger: spaces in the path
const FOREIGN_CWD = "/tmp";

// Build the minimal anchor-able fixture repo: the REAL module (copied, so
// its import.meta.url is the fixture's own percent-encoded path) + the
// schema probe target + the db/ dir.
rmSync(FIXTURE, { recursive: true, force: true });
mkdirSync(`${FIXTURE}/src/lib`, { recursive: true });
mkdirSync(`${FIXTURE}/prisma`, { recursive: true });
mkdirSync(`${FIXTURE}/db`, { recursive: true });
writeFileSync(`${FIXTURE}/prisma/schema.prisma`, 'datasource db { provider = "sqlite" }');
writeFileSync(`${FIXTURE}/db/custom.db`, "");
copyFileSync(`${REPO}/src/lib/db-path.ts`, `${FIXTURE}/src/lib/db-path.ts`);

// A foreign CWD that is NOT itself a repo (no prisma/schema.prisma).
process.chdir(FOREIGN_CWD);

// Pin the env to the documented relative posture (the §3 discipline — a
// shell-inherited absolute DATABASE_URL would ride the passthrough branch
// and mask the anchor chain entirely; the probe must exercise the anchors).
process.env.DATABASE_URL = "file:../db/custom.db";

const { resolveProcessDatabaseUrl, candidateRoots } = await import(
  `${FIXTURE}/src/lib/db-path.ts`
);

const resolved = resolveProcessDatabaseUrl();
const roots = candidateRoots();

// The verdict: the resolved URL must land INSIDE the spaced fixture
// (decoded, exists) — not under the foreign CWD.
const expected = `file:${FIXTURE}/db/custom.db`;
const anchorPresent = roots.some((r) => r === FIXTURE);
const verdict = {
  fixture: FIXTURE,
  foreignCwd: FOREIGN_CWD,
  candidateRoots: roots,
  resolved,
  expected,
  moduleAnchorDecoded: anchorPresent,
  landedInsideSpacedRepo: resolved === expected,
  ok: anchorPresent && resolved === expected,
};

console.log(JSON.stringify(verdict, null, 2));

// Also record the raw form evidence (what the pre-fix code produced).
const self = new URL(import.meta.url).pathname;
console.log(
  JSON.stringify({
    note: "the raw .pathname form (pre-fix) on this same class of URL",
    rawPathnameOfProbeUrl: new URL(`file://${FIXTURE}/src/lib/db-path.ts`).pathname,
    decodedForComparison: `file://${FIXTURE}/src/lib/db-path.ts`,
  }),
);

rmSync(FIXTURE, { recursive: true, force: true });
process.exit(verdict.ok ? 0 : 1);

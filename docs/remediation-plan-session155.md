# Remediation Plan — Session 155 (Cycle 105, Batch DD)

> Status: PLANNED (pre-change record — the immutable plan; the as-executed
> close lives in §6). Written before any source change, per the standing
> doctrine ("write the cycle plan into docs/remediation-plan-sessionN.md
> BEFORE any source change").
>
> Operator directive: refresh the workspace, re-read the doc chain
> (AGENTS/CLAUDE/README/PAD/SKILL + session_181/182 +
> remediation-plan-session154 + worklog), validate against the codebase,
> audit with the repo-included skills (skills/web-application/SKILL.md the
> primary; the skills catalog for the rotation), iterate toward
> visual/functional parity with omni-study1.base44.app (live reference
> login, mobile-nav attention, the Tailwind v4 bug watch), keep `.env` at
> `DATABASE_URL="file:../db/custom.db"` + the repo-root `db/`, validate the
> vitest/playwright suites, remediate TDD-first, capture evidence frames,
> update the doc chain, push via the SSH wrapper. The repo's `skills/`
> folder stays excluded from code checking, testing, and compilation.
> Proceed with best judgement on the remaining open questions (the
> operator's standing instruction).

## §0 Scope, method, cold baseline, live parity

**Workspace (warm — the previous session's clone, `git pull` fast-forward
`32c2221..2c4b5f4` bringing only `docs/session_182.md`; the environment
intact: `.env` at the documented dev posture, `db/` at the repo root with
`custom.db` + the aged `e2e.db`, node_modules, the Playwright chromium
cache).**

**Cold baseline (before any work): lint ✓ · tsc ✓ · the full Vitest run
1588/1588 (48 files — the documented S154 final state exactly) · the dev
daemon preflight GREEN (hydrated, navigation-stable) · the drawer check
GREEN (the 70th consecutive no-Tailwind-v4-mobile-nav-bug confirmation —
backdrop oklab(0 0 0 / 0.2) + blur(4px); 288px white panels; 20 links; no
footer; Escape-close superset) · the desktop chrome probe MATCH (all five
formal checks, live reference login — sidebar 260/20 links/first-links/
mainX 260/mainWidth 1180).** Baseline noise: none.

**The fix scope (the S154 close's named candidates, adjudicated).** The
S154 close named the **db-path percent-decode family** ("the db-path
percent-decode stays recorded for the db-path-family cycle") and the
export streaming residual. Adjudication (the operator's standing
best-judgement instruction): the db-path family is the cycle core — the
S150 B-I3 finding is now nine cycles old, the family has never been swept
as an axis, and CLAUDE.md itself names db-path "the repo's most fragile
invariant" (the right surface for a careful, measurement-preceded fix);
the export streaming residual (the I-A peak-memory O(account) class)
stays deferred (recorded — it needs a streaming serialization design, not
a rider). The audit B findings below are the cycle's fix set.

## §1 The audits (Mode-C; every L finding re-verified by direct read by the orchestrator)

### Audit A — the Batch DC recent-changes axis (the `32c2221` diff)

**0C / 0H / 0M / 0L / 0I — clean.** All four DC claims verified DELIVERED
at the source level: DC1's elision pass in the import route (the pre-tx
full-row read after the collision pre-flight — chunked, ownership-scoped
`findMany` per collection + the `plannedUpdateIsNoOp` filter + the
counted-as-updated wire `updated: u + elided` at both the per-collection
report and the top-level counter) + the pure seam
(`plannedUpdateIsNoOp` with the full S154/DC1 semantics header); DC2's
questions item-shape mirror at data-import.ts:1184 (the atom's predicates
verbatim — object + question string + the three-member type vocabulary);
DC4's census pair in script-conventions.test.ts:1310-1330 (the WRITE-ONLY
negative pin `expect(src).not.toMatch(/\.\s*findFirst\s*\(/)` + the
elision census markers) with the route carrying ZERO `.findFirst(`
occurrences; and the doc census machine-verified: README badge 2204 ✓ ·
AGENTS 1588 ✓ · CLAUDE 1588 ✓ · PAD v1.3.62 ✓ · the vitest header
(48 files / 1588) ✓ · the cert runner re-tag (Expected 616) ✓ — zero
stale sites.

### Audit B — the db-path / database-resolution family (the fix surfaces, never swept as a family; the S150 B-I3 rotation)

The axis read dispatched to a read-only subagent against the
web-application skill's §3/§4/§6/§16/§17 rubric: the db-path seam + db.ts
+ the seed + the db-path fixture tests + the package.json db:* discipline
+ the e2e db isolation chain (playwright.config + cold-reset +
global-setup + the chunked cert) + the Docker posture + `.env.example`'s
contract text + DEPLOYMENT.md's db sections + a repo-wide grep for every
DATABASE_URL read / PrismaClient construction. **Verdict: 0C / 0H / 0M /
5L / 4I.** The core discipline HOLDS (one sanctioned read site in src/
[db-path.ts:130, the seam] · one PrismaClient site in src/ [db.ts:26] ·
the seed routes through the seam · the e2e/docker/.env.example triangle
mutually consistent). The findings:

- **L1 (Verified — the cycle core, the S150 B-I3 confirmed empirically
  by the subagent against a `/tmp` fixture):** `db-path.ts:117` does not
  percent-decode `import.meta.url` — `new URL(import.meta.url).pathname`
  keeps `%20`/`%C3%A9`, so a repo checked out under a path with spaces or
  non-ASCII fails the `existsSync(self)` self-check and the module anchor
  is silently DROPPED (roots degenerate to `[cwd]`). The documented
  invariant "regardless of the process working directory"
  (.env.example:10-11, DEPLOYMENT.md §4) then breaks for every
  foreign-CWD invocation: SQLite error 14, or — if the foreign CWD is
  itself a repo checkout — silently the WRONG database. Dev-only (the
  production absolute-URL posture passes through untouched). The
  subagent's empirical probe: a module at `/tmp/b-i3/My Repo/src/lib/…`
  → pathname `/tmp/b-i3/My%20Repo/...` → `existsSync = false`;
  `fileURLToPath` → decoded, `existsSync = true`.
  **The fix is §2 (DD1).**
- **L2 (Reasoned — no Windows host in the sandbox):** the same line's
  Windows form — `new URL(...).pathname` yields the leading-slash
  pseudo-path `/C:/…` on Windows where Node documents `fileURLToPath` as
  the conversion; the DATABASE_URL value side already supports drive
  letters (db-path.ts:62, test-pinned), the module-anchor side is the
  asymmetry. **The fix is §2 (DD1 — the same `fileURLToPath` move).**
- **L3 (Verified):** DEPLOYMENT.md §4 (`:84`) describes `db:seed` as
  "(wipes domain tables)" — FALSE: prisma/seed.ts:45-52 early-returns
  when the demo user exists ("nothing to do"); wiping is `db:reset`. An
  operator following §4 to refresh demo data gets a silent no-op.
  **The fix is §3 (DD2a).**
- **L4 (Verified):** DEPLOYMENT.md §6 (`:123`) references
  `./scripts/smoke-test.sh` — the script DOES NOT EXIST (pre-clone
  scaffold residue, per the SKILL's own AP-74 historical note); the §6
  checklist carries a command that fails with "No such file".
  **The fix is §3 (DD2b).**
- **L5 (Reasoned):** the documented single-file e2e debug workflow
  (AGENTS.md:82 — `bunx playwright test tests/e2e/tasks.spec.ts`) bypasses
  the cold reset, which rides ONLY the `test:e2e` chain
  (package.json:18); the S45 day-boundary + S46 fixed-id classes make
  ANY run against an aged `db/e2e.db` fail deterministically — the
  direct invocation is a documented trap. **The fix is §3 (DD3).**
- **I-1 (Verified):** db-path.ts's header anchor-order comment (module →
  standalone → cwd) contradicts the code's actual push order
  (standalone detector FIRST, then module, then cwd — the inline comments
  correct, the header stale). Rides §2 (DD1's same-file comment pass).
- **I-2 (Reasoned):** the cold reset removes only `db/e2e.db` — a
  crash-left `-journal` survives (hot-journal recovery against the fresh
  push), and `db/*.db-wal`/`db/*.db-shm` are neither ignored nor removed.
  **The fix is §4 (DD4).**
- **I-3 (Verified, documented deliberate — no action):** the seam's
  `nodeEnv` default reads `process.env.NODE_ENV` (the S124/BY2 explicit-
  args doctrine, both branches test-pinned with the third arg).
- **I-4 (Verified, working as designed — no action):** the traced
  `db/custom.db` + `.env` copies inside `.next/standalone/` are
  neutralized by the standalone detector (the repo root outranks the
  standalone CWD) + structurally excluded from the Docker image
  (.dockerignore + the Dockerfile rm guard).

**The standing deferrals (re-adjudicated, unchanged):** the A-M3 stage-2
chunked sub-tx + resume token — deferred ON MEASUREMENT (the S154 probe:
0.32 ms/row, 32 s at cap, 1.9× headroom); the raw-SQL bulk upsert (the
changed-rows tail, IF profiling ever presses the 60 s budget); the export
streaming (the I-A peak-memory residual — needs a streaming design, not a
rider); the N1 re-order alternative (rejected, DEPLOYMENT.md).

## §2 DD1 — the module-anchor percent-decode (L1+L2, the cycle core)

> **As-executed note (see §6):** this section is the immutable
> pre-change design record. The helper-seam shape below was the FIRST
> design; the build measurement rejected it (Turbopack's file tracer
> cannot see through a wrapper around `fileURLToPath(import.meta.url)`
> — the standalone output measured 699M vs the pre-fix 144M,
> whole-project tracing). The SHIPPED form is the direct call inside
> `candidateRoots` with the unit layer re-architected to integration
> legs. §2's semantics (percent-decode, conservative direction,
> null-on-malformed never-a-crash, Windows form) all shipped as
> designed — only the seam SHAPE changed.

**The design.** A new pure, fixture-testable seam function beside the
existing exports:

```ts
import { fileURLToPath } from "node:url";

// S155/DD1: the module anchor's URL→path conversion — pure +
// fixture-testable. fileURLToPath (NOT `new URL(...).pathname`):
// percent-DECODES the URL, so a repo checked out under a path with spaces
// or non-ASCII ("My Repo", "café") KEEPS its module anchor (the S150 B-I3
// class: the raw .pathname kept "%20" and the existsSync self-check
// silently dropped the anchor, falling back to the CWD rule — breaking
// the documented "regardless of the process working directory" invariant
// for every percent-encodable checkout path), and it carries Node's
// documented Windows drive-letter conversion (the pathname side's
// asymmetry with the value side's own drive-letter support). Malformed
// input (a raw "%" in a bundler-synthesized import.meta.url value — the
// standalone chunk's shimmed getter) throws URIError: caught, answered
// null — the anchor is skipped exactly as today, never a crash.
export function moduleAnchorPath(url: string): string | null {
  try {
    return fileURLToPath(url);
  } catch {
    return null;
  }
}
```

`candidateRoots()`'s module-anchor block becomes:

```ts
  try {
    // 2. This module's own repo root (src/lib → ../../) — covers next dev
    //    and next build, which execute modules from source. Validated by
    //    the source file existing on disk: the standalone runtime's virtual
    //    mapping fails this check and is skipped. S155/DD1: the URL→path
    //    conversion percent-DECODES (fileURLToPath) — a spaced/non-ASCII
    //    checkout path keeps its anchor (the S150 B-I3 class) — and a
    //    malformed shimmed value answers null (the skip, never a crash).
    const self = moduleAnchorPath(import.meta.url);
    if (self !== null && existsSync(self)) {
      roots.push(path.resolve(path.dirname(self), "..", ".."));
    }
  } catch {
    // import.meta unavailable in this context — remaining anchors apply.
  }
```

**The semantics (the load-bearing choices).**
- **`fileURLToPath`, not hand-rolled decode:** Node's own documented
  conversion for file URLs — percent-decodes AND carries the Windows
  drive-letter form; the raw `.pathname` form is the documented-wrong
  shape for both defects (L1+L2) in one move.
- **Null-on-malformed, never a crash:** `decodeURIComponent` and
  `fileURLToPath` throw the SAME `URIError` on malformed sequences
  (verified: `%zz`, a trailing `%`); the genuine runtime module URL is
  well-formed, but the STANDALONE build shims `import.meta.url` through
  a bundler-synthesized getter — a raw `%` is not impossible in principle.
  The catch answers null → the anchor is skipped → the CWD fallback,
  byte-identical to today's degraded path. The outer try/catch (the
  import.meta-unavailable guard) stays — smallest safe diff.
- **Conservative direction preserved:** the existsSync self-check is
  UNCHANGED — the anchor is only trusted when the decoded path actually
  exists on disk; a wrong decode that doesn't exist skips the anchor
  (today's fallback), never picks a wrong root.
- **Pure seam, fixture-tested:** the helper takes the url as an argument
  (the S124/BY2 explicit-args doctrine — the same shape as
  `resolveDatabaseUrl`/`standaloneRepoRoot`); `candidateRoots` itself
  stays un-injectable exactly as today (its behavior is proven by the
  live spaced-path probe + the e2e boot family).
- **No wire change anywhere:** for every non-percent-encodable path
  (including this repo's own, the e2e runner's, and Docker's) the decoded
  path is byte-identical to the pathname form — the resolution result is
  unchanged by construction; only the previously-broken class (spaced /
  non-ASCII / Windows-form paths) changes behavior, from wrong to right.
- **The I-1 rider:** the module header's stale anchor-order list
  (module → standalone → cwd) is reordered to match the code's actual
  push order (standalone detector → module → cwd) in the same comment
  pass.

## §3 DD2 + DD3 — the doc riders (L3, L4, L5)

- **DD2a — DEPLOYMENT.md §4's seed line:** "(wipes domain tables)" →
  the honest early-return language ("early-returns if the demo user
  exists — delete `db/custom.db` + re-push to reseed"), citing the
  S155/DD2a reconciliation.
- **DD2b — DEPLOYMENT.md §6's checklist:** drop the nonexistent
  `./scripts/smoke-test.sh` line (the §6 checklist already carries
  `bun run test:e2e` — the residue line is pure noise; the AP-74 class).
- **DD3 — AGENTS.md:82's single-file e2e row:** gains the cold-reset
  caveat — the reset rides only the `test:e2e` chain, so a direct
  `bunx playwright test …` invocation against an aged `db/e2e.db` fails
  deterministically (the S45/S46 classes); run
  `bash scripts/e2e-cold-reset.sh` first.

## §4 DD4 — the sidecar hygiene (I-2) + the census pair

- **DD4a — `scripts/e2e-cold-reset.sh`:** `rm -f db/e2e.db` →
  `rm -f db/e2e.db*` (the glob catches the crash-left `-journal` and the
  theoretical `-wal`/`-shm` sidecars; nothing else matches the glob) +
  the S155/DD4 comment line.
- **DD4b — `.gitignore`:** the db block gains `db/*.db-wal` +
  `db/*.db-shm` beside the existing `db/*.db` + `db/*.db-journal`.
- **DD4c — the census pair** (script-conventions.test.ts, the S154/DC4
  family precedent): (1) the POSITIVE census — db-path.ts imports
  `fileURLToPath` from `node:url`, calls `moduleAnchorPath`, and carries
  the S155/DD1 marker; (2) the NEGATIVE census — db-path.ts contains no
  raw `new URL(import.meta.url).pathname` form (the CALL is the
  property; comment mentions may survive) — a regression back to the
  pathname form ships RED here.

## §5 Scoping, deferrals, the e2e interplay study

- **The RED inventory (planned): +8 unit legs, +0 e2e legs.**
  - db-path.test.ts +6 (the moduleAnchorPath family, dynamic-import form
    — the S139/:1095 precedent — so each RED fails on the missing export
    at its own leg, not a file-load error): (1) the percent-decode leg —
    `file:///tmp/My%20Repo/src/lib/db-path.ts` → `/tmp/My Repo/...`;
    (2) the non-ASCII leg — `file:///caf%C3%A9/...` → `/café/...`;
    (3) the malformed mid-sequence leg — `%zz` → null (never a throw);
    (4) the trailing bare-percent leg — `%/` → null; (5) the plain-ASCII
    identity leg (today's behavior preserved); (6) the Windows
    drive-letter leg, platform-aware (`win32` → `C:\...`, POSIX →
    `/C:/...` — the conversion contract pinned on whichever platform
    runs the suite).
  - script-conventions.test.ts +2 (the DD4c census pair): the positive
    census (fileURLToPath import + the moduleAnchorPath call + the
    S155/DD1 marker) + the negative census (no raw pathname form).
  - **No e2e legs BY DESIGN** (the CV1 runtime-split precedent): the fix
    is wire-invisible by construction for every e2e-runner path (the
    decoded path is byte-identical where the pathname form worked);
    the behavioral proof rides the unit family + the LIVE spaced-path
    probe (§6's evidence: a fixture repo at a spaced path, the module
    imported from a foreign CWD, pre-fix wrong vs post-fix right) + the
    full 5-chunk cert (every chunk boots the standalone server through
    db-path).
- **Unit census 1588 → 1596 (+8) · e2e census 616 (unchanged) · census
  2204 → 2212.** The vitest header re-anchors; the doc chain (README
  badge + the Session-155 row, AGENTS census + the :82 row rider [DD3] +
  the S155 lessons, CLAUDE, PAD v1.3.63, SKILL census) follows. The cert
  runner needs NO re-tag (the e2e census is unchanged).
- **The targeted e2e: chunk 1 (navigation — 152 legs, the widest
  surface; every chunk boots the standalone server through db-path, so
  chunk 1 doubles as the boot-family behavioral leg) — then the full
  5-chunk cold cert** (the standing map; the budget arithmetic
  untouched — no new register or import POSTs anywhere).
- **The dev-tree re-confirmation discipline:** after the fix, the dev
  daemon restarts (the S9/S31 stale-Turbopack discipline) and the drawer
  check + the desktop parity probe re-run GREEN on the remediated tree
  before any capture.
- **Deferred (recorded, with reasons):** the export streaming (the I-A
  peak-memory residual — a streaming serialization design, its own
  cycle); the A-M3 stage-2 (ON MEASUREMENT, unchanged); the raw-SQL bulk
  upsert (unchanged); the standalone-output `db/` strip (I-4 — working
  as designed, an optional build-script nicety); the playwright pre-hook
  migration for the direct-run cold reset (L5's alternative answer —
  rejected this cycle: Playwright starts the webServer before
  globalSetup, so a config-native reset CANNOT cover the class; the
  honest fix is the documented caveat [DD3]).
- **The `.env.example` contract:** no env-var reads change this cycle —
  re-verified at close.

## §6 As-executed close

**Executed as planned, with ONE mid-cycle design correction (the
cycle's load-bearing finding, recorded honestly).** The RED
inventory: the unit REDs **6/6** (the db-path family + the census
pair — first in the helper form, then re-run RED after the
re-architecture into the integration form; each leg at its own
designed failure, not a file-load error).

**The mid-cycle design correction (MEASURED, not assumed).** The
first DD1 design was the §2 helper seam (`moduleAnchorPath`, the
S124/BY2 explicit-args doctrine) — the two touched files green, lint
✓ tsc ✓. The BUILD then measured the standalone output at **699M
against the pre-fix 144M** (verified by a stash-and-rebuild A/B):
Turbopack's file tracer statically evaluates
`fileURLToPath(import.meta.url)` (the bundler knows import.meta.url)
yet cannot see through a wrapper function around it — the opaque
form trips whole-project tracing ("dynamic filesystem access causes
tracing of the whole project"). The shipped form is the **DIRECT
call inside candidateRoots** (the URIError caught by the existing
try/catch — verified: fileURLToPath throws URIError on `%zz` and a
trailing `%`), and the unit layer was re-architected to INTEGRATION
legs: fixture-repo copies imported through their own percent-encoded
import.meta.url — the spaced leg, the non-ASCII leg ("café"), the
plain-ASCII identity leg, and the mutated-copy malformed-URL leg
(the copy's call site patched to a malformed literal — the exact
production guard). **Shipped build: 144M byte-identical to pre-fix;
7 warnings (the 6 documented + the new `node:url` Edge-Runtime
advisory — the same server-only false-positive class as the
node:fs/node:path warnings beside it).**

**The census legs proven LIVE:** a temporary regression of db-path.ts
back to the raw pathname form made BOTH census legs RED (the
positive — no direct call; the negative — the assignment form
present); the restored fix made both GREEN. A pin that cannot fail
is worthless — this pair can.

**The authoring traps hit and closed (both in the test layer, both
now S155 lessons).** (1) The malformed-URL leg's first draft used a
bare substring replace — which hit the module's own COMMENT block
(the provenance convention names the removed form verbatim) and left
the code intact; re-anchored on the `const self =` code shape. (2)
The negative census's first regex matched the comment's mention of
the removed form; re-anchored on the assignment shape — the DC4
call-not-comment precedent, sharpened to cover source MUTATIONS as
well as censuses.

**The live spaced-path probe** (`scripts/probe-dbpath-spaced-s155.mjs`
— the REAL module copied into `/tmp/s155 My Repo`, imported from the
foreign cwd /tmp, the documented relative DATABASE_URL pinned; the
probe pins its own env because this sandbox shell carries an ambient
absolute DATABASE_URL — the §3 shell-inheritance hazard, live):
BEFORE — `candidateRoots: ["/tmp"]`, resolution
`file:/tmp/db/custom.db` (the anchor dropped, the WRONG database);
AFTER — `candidateRoots: ["/tmp/s155 My Repo", "/tmp"]`, resolution
`file:/tmp/s155 My Repo/db/custom.db` (the anchor decoded). The
before/after pair + the build-measurement table (144M / 699M / 144M)
preserved as `docs/screenshots/155-dbpath-percent-decode-evidence.json`.

**Gates.** lint ✓ · tsc ✓ · unit **1594/1594** (48 files, +6 exactly
as designed after the re-architecture: db-path +4, script-conventions
+2) · build ✓ (exit 0; 7 warnings; the standalone output 144M
byte-identical to pre-fix) · the targeted e2e: chunk 1 **152/152
first-pass** cold (navigation — the widest surface; every chunk boots
the standalone through db-path) · the 5-chunk cold cert: chunk 1
**152/152** · chunk 2 **189/189** · chunk 3 **90/91** (ONE failure —
the resilience files-upload leg, root-caused by the three-signal
protocol as the documented P1008 machine-load class: the ambient
Prisma socket-timeout signature present in the cert log, the
same-shape siblings passing in the same run, and the clean re-run)
· chunk 4 **95/95** · chunk 5 **89/89** — the chunk-3
identical-combo cold re-run **91/91 first-pass clean** — the cert
tally **616/616** (the e2e census unchanged by design) · **census
2210 green** (was 2204).

**Evidence.** The `docs/screenshots/155-clone-*.png` frames (the
standing desktop 241 KiB + the standing mobile drawer 66 KiB — the
71st drawer-GREEN companion), self-verifying (the capture script's
JSON verdict ok:true; dimensions machine-checked 1440x900 / 390x844)
+ the `155-dbpath-percent-decode-evidence.json` before/after record.
The DD1 decode is UI-invisible by construction for this repo's own
path (the decoded path is byte-identical where the pathname form
worked) — the proof rides the integration legs + the censuses + the
live probe + the cert (the CW2 runtime-split precedent).

**Docs.** README badge/census (2204 → 2210) + the unit-count prose
sites + the Session-155 row; AGENTS census (1588 → 1594) + the :82
row's cold-reset caveat (DD3) + the S155 lessons block (four
lessons); CLAUDE counts; PAD v1.3.63 (the revision block); the SKILL
census (all three sites); the vitest header re-anchor (the
integration-form note); `docs/session_183.md`; the worklog
Session-166 entry; this close; the `.env.example` contract
re-verified (no env-var reads changed this cycle — .env and
.env.example byte-identical at the documented dev posture).

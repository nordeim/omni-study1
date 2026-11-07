# Session 183 — the S155 cycle (Batch DD)

The workspace was a WARM CONTINUATION at `2c4b5f4` on `main` (the
Batch DC fix `32c2221` + the operator's session_182 transcript commit —
`git pull` fast-forwarded one file; the environment was intact: `.env`
at the documented dev posture, `db/` at the repo root, node_modules,
the Playwright chromium cache).

Cold baseline (before any work): lint ✓ · tsc ✓ · the full Vitest run
**1588/1588 (48 files — the documented S154 final state exactly)** ·
the dev daemon preflight GREEN · the drawer check GREEN (**the 70th
consecutive no-Tailwind-v4-mobile-nav-bug confirmation** — backdrop
oklab(0 0 0 / 0.2) + blur(4px); 288px white panels; 20 links; no
footer; Escape-close superset) · the desktop chrome probe **MATCH**
(all five formal checks, live reference login — sidebar 260/20
links/first-links/mainX 260/mainWidth 1180). Baseline noise: none.

The audits (Mode-C; every L finding re-verified by direct read by the
orchestrator):

- **Audit A — the Batch DC recent-changes axis** (the `32c2221` diff):
  **0C / 0H / 0M / 0L / 0I — clean.** All four DC claims verified
  DELIVERED at the source level (the elision pass after the collision
  pre-flight + the `plannedUpdateIsNoOp` seam + the counted-as-updated
  `updated: u + elided` wire at both counters; the questions item-shape
  mirror at data-import.ts:1184; the census pair at
  script-conventions.test.ts:1310-1330 with ZERO `.findFirst(`
  occurrences in the route) and the doc census machine-verified
  (README badge 2204 ✓ · AGENTS 1588 ✓ · CLAUDE 1588 ✓ · PAD v1.3.62 ✓
  · the vitest header ✓ · the cert re-tag Expected 616 ✓) — zero stale
  sites.

- **Audit B — the db-path / database-resolution family** (the fix
  surfaces, never swept as a family; the nine-cycles-old S150 B-I3
  rotation). The axis read dispatched to a read-only subagent against
  the web-application skill's §3/§4/§6/§16/§17 rubric: the db-path seam
  + db.ts + the seed + the fixture tests + the package.json db:*
  discipline + the e2e isolation chain + the Docker posture +
  `.env.example` + DEPLOYMENT.md + a repo-wide DATABASE_URL/
  PrismaClient census.

  **Verdict: 0C / 0H / 0M / 5L / 4I.** The core discipline HOLDS (one
  sanctioned DATABASE_URL read site in src/ [db-path.ts:159, the seam]
  · one PrismaClient site [db.ts:26] · the seed routed through the seam
  · the e2e/docker/.env.example triangle mutually consistent). The
  findings: **L1** the module anchor does not percent-decode
  `import.meta.url` (empirically confirmed against a /tmp spaced
  fixture — the S150 B-I3 class, nine cycles recorded); **L2** the
  Windows drive-letter asymmetry (the same line); **L3**
  DEPLOYMENT.md §4's seed line promised a wipe the idempotent seed
  never performs (prisma/seed.ts early-returns since S122/BW13);
  **L4** §6's checklist carried the nonexistent `scripts/smoke-test.sh`
  (pre-clone scaffold residue); **L5** the documented single-file e2e
  row invites the direct invocation the cold-reset chain-lock forbids.
  The Is: I-1 the module header's stale anchor-order list; I-2 the
  cold-reset's bare `rm -f db/e2e.db` (the crash-left -journal class);
  I-3 the seam's documented nodeEnv default (deliberate, no action);
  I-4 the traced standalone artifacts (working as designed, no action).

The plan (`docs/remediation-plan-session155.md`) written BEFORE any
source change and validated against the codebase (every anchor
re-read; the RED inventory sized +8 unit legs, +0 e2e legs by design —
the CV1 runtime-split precedent: the decode is wire-invisible for
every non-percent-encodable runner path).

**The RED inventory (as it ran): the unit REDs 6/6** — the db-path
family + the census pair (the helper-form legs first, then re-run RED
after the mid-cycle design correction below re-architected them into
the integration form — each leg at its own designed failure, not a
file-load error).

**The mid-cycle design correction (the cycle's load-bearing finding,
measured):** the first DD1 design extracted a `moduleAnchorPath` helper
(the S124/BY2 explicit-args doctrine) — lint ✓ tsc ✓ unit ✓ — but the
BUILD measured the standalone output at **699M against the pre-fix
144M**: Turbopack's file tracer statically evaluates
`fileURLToPath(import.meta.url)` (the bundler knows import.meta.url)
yet cannot see through a wrapper function around it, and the opaque
form trips whole-project tracing. The shipped form is the DIRECT call
inside candidateRoots (the URIError caught by the existing try/catch —
verified: fileURLToPath throws URIError on `%zz`/`%/`), with the unit
layer re-architected to INTEGRATION legs: fixture-repo copies imported
through their own percent-encoded import.meta.url (the spaced leg, the
non-ASCII leg, the plain-ASCII identity leg, the mutated-copy
malformed-URL leg). **Shipped build: 144M — byte-identical to pre-fix;
7 warnings (the 6 documented + the new node:url Edge-Runtime advisory,
the same server-only false-positive class as node:fs/node:path).**

**The S155 fixes:** DD1 the module-anchor percent-decode — the direct
`fileURLToPath(import.meta.url)` call (NOT the raw
`new URL(...).pathname` form), percent-DECODED so a repo checked out
under a spaced or non-ASCII path keeps its anchor (the S150 B-I3
class: the raw form kept "%20" and the existsSync self-check silently
dropped the anchor, falling back to the CWD rule — breaking the
documented "regardless of the process working directory" invariant,
`.env.example`'s own promise); the Windows drive-letter conversion
carried by the same call; the header anchor-order list reconciled to
the code's actual push order (the I-1 rider). DD2 the DEPLOYMENT.md
pair (the honest seed early-return language + the dropped residue
line). DD3 the AGENTS.md single-file e2e row's cold-reset caveat.
DD4 the sidecar hygiene (`rm -f db/e2e.db*` + the .gitignore
-wal/-shm patterns).

**The live spaced-path probe** (`scripts/probe-dbpath-spaced-s155.mjs`
— the REAL module copied into `/tmp/s155 My Repo`, imported from the
foreign cwd /tmp, the documented relative DATABASE_URL pinned): BEFORE
the fix, the anchor dropped (`candidateRoots: ["/tmp"]`) and
resolution fell to `file:/tmp/db/custom.db` (the WRONG database — the
foreign-CWD rule); AFTER, the anchor decoded
(`candidateRoots: ["/tmp/s155 My Repo", "/tmp"]`) and resolution
landed at `file:/tmp/s155 My Repo/db/custom.db` — the invariant
restored. The before/after pair preserved as
`docs/screenshots/155-dbpath-percent-decode-evidence.json` with the
build-measurement table (144M / 699M / 144M).

**The authoring traps hit and closed (both in the test layer, both
documented as the S155 lessons):** (1) the malformed-URL leg's first
draft mutated the fixture copy with a bare substring replace — which
hit the module's own COMMENT block (the provenance convention names
the removed form verbatim) and left the code intact, so the leg
"passed" against an unmutated module; re-anchored on the
`const self =` code shape. (2) The negative census's first regex
matched the comment's mention of the removed raw form; re-anchored on
the assignment shape (`= new URL(import.meta.url).pathname`) — the
DC4 call-not-comment precedent, sharpened to cover mutations as well
as censuses.

**Interim + final gates: lint ✓ · tsc ✓ · the two touched files green
under the first (helper, +8-leg) design, re-architected to the
shipped direct-call design — the FULL suite 1594/1594** (48 files;
+6 exactly as designed after the re-architecture: db-path +4
integration legs, script-conventions +2 census legs — both census
legs proven LIVE by a temporary regression to the raw pathname form,
RED on the mutated tree, GREEN on the fix) **· build ✓ (exit 0; 7
warnings; the standalone output 144M byte-identical to pre-fix — the
tracing regression caught and designed away).**

**The targeted e2e + the cert.** Chunk 1 (navigation — the widest
surface; every chunk boots the standalone through db-path) **152/152
first-pass** cold. The 5-chunk cold cert: chunk 1 **152/152** · chunk
2 **189/189** · chunk 3 **90/91** (ONE failure — the resilience
files-upload leg, the documented P1008 machine-load class: the ambient
Prisma socket-timeout signature present in the cert log, the
same-shape siblings passing, closed by the three-signal protocol)
· chunk 4 **95/95** · chunk 5 **89/89** — then the chunk-3
identical-combo cold re-run **91/91 first-pass clean** — the cert
tally **616/616** (the e2e census unchanged by design) · **census
2210 green** (was 2204).

**Evidence:** the `docs/screenshots/155-clone-*.png` frames (the
standing desktop 241 KiB + the standing mobile drawer 66 KiB [the
71st drawer-GREEN companion frame]), self-verifying (the capture
script's JSON verdict ok:true; dimensions machine-checked 1440x900 /
390x844) + the `155-dbpath-percent-decode-evidence.json` before/after
record (the probe pair + the build-measurement table). The DD1
decode's proof rides the integration legs + the censuses + the live
probe + the cert (the CW2 runtime-split precedent — UI-invisible by
construction for this repo's own path).

**Docs:** README badge/census (2204 → 2210) + the unit-count prose
sites + the Session-155 row; AGENTS census (1588 → 1594) + the :82
row's cold-reset caveat (DD3) + the S155 lessons block (four lessons);
CLAUDE counts; PAD v1.3.63 (the revision block); the SKILL census
(all three sites); the vitest header re-anchor (+6 with the
integration-form note); `docs/session_183.md` (this log); the worklog
Session-166 entry; the plan §6 as-executed close; the `.env.example`
contract re-verified (no env-var reads changed this cycle — .env and
.env.example byte-identical at the documented dev posture).

**Next cycle:** the rotation continues — the export streaming (the
I-A peak-memory O(account) residual, the import family's recorded
candidate — needs a streaming serialization design, its own cycle);
the raw-SQL bulk upsert (IF profiling ever presses the 60 s budget);
the A-M3 stage-2 stays deferred ON MEASUREMENT (re-measure only if
the hardware or the row cap changes).

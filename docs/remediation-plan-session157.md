# Remediation Plan — Session 157 (Cycle 107, Batch DF)

> Status: PLANNED (pre-change record — the immutable plan; the as-executed
> close lives in §6). Written before any source change, per the standing
> doctrine ("write the cycle plan into docs/remediation-plan-sessionN.md
> BEFORE any source change").
>
> Operator directive: refresh the workspace, re-read the doc chain
> (AGENTS/CLAUDE/README/PAD/SKILL + session_185/186 +
> remediation-plan-session156 + worklog), validate against the codebase,
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

**Workspace (warm — the previous session's tree, `git pull` fast-forward
`cf1fb4d..6befbab` bringing only `docs/session_186.md`; the environment
intact: `.env` at the documented dev posture [byte-identical to
`.env.example`], `db/` at the repo root with `custom.db` + the aged
`e2e.db`, node_modules, the Playwright chromium cache, bun 1.3.14).**

**Cold baseline (before any work): lint ✓ · tsc ✓ · the full Vitest run
1602/1602 (48 files — the documented S156 final state exactly) · the dev
daemon preflight GREEN (hydrated, navigation-stable) · the drawer check
GREEN (the 74th consecutive no-Tailwind-v4-mobile-nav-bug confirmation —
backdrop oklab(0 0 0 / 0.2) + blur(4px); 288px white panels; 20 links; no
footer; Escape-close superset) · the desktop chrome probe MATCH (all five
formal checks, live reference login — sidebar-outer 260 / 20 links /
first-links / mainX 260 / mainWidth 1180, the S142 outer-footprint probe;
the s141 probe's 258px navWidth is the KNOWN inner-nav artifact, the
session-158 record).** Baseline noise: none.

**The fix scope (the S156 close's named candidates, adjudicated).** The
S156 close records three deferred families: F3's $transaction snapshot
("its own measurement cycle" — the lock-behavior measurement against the
import's 60 s write-tx family), F5's page-grid-from-envelope + the
count-only page consumption (the phase-2 leaner page), and the
single-collection cursor pagination. Adjudication (the operator's standing
best-judgement instruction + the S154 lesson — "whenever a deferral's
rationale contains a measurable condition, the next session's first act on
that family is the MEASUREMENT, not the design"): **the F3 measurement
runs FIRST (§2), and its outcome decides the cycle** — the measurement
REJECTS the snapshot design (the write-commit blocking it measured), which
promotes **F5's grid-from-envelope to the cycle core (§3, DF1)** — the
phase-2 residual that IS actionable, and the one that structurally closes
the audit's new L-1 census gap in the same commit. The cursor family stays
deferred (unchanged); the raw-SQL bulk upsert + A-M3 stage-2 stay deferred
on their recorded measurement conditions (unchanged).

## §1 The audits (Mode-C; every L+ finding re-verified by direct read by the orchestrator)

### Audit A — the Batch DE recent-changes axis (the `cf1fb4d` diff)

**0C / 0H / 0M / 0L / 0I — clean.** All five DE claims verified DELIVERED
at the source level: DE1's pure driver (`buildExportFragments` in
data-export.ts — the injected reader + per-row fragments +
retain-while-under-ceiling + the post-loop throw; the byte-identity
architecture exactly as planned) + the READERS-map wiring (the
`Record<ExportCollection, …>` key type, 20 literal findMany sites) + the
ReadableStream route (enqueue loop + close, `String(bytes)` header);
DE2's exportByteSize retirement (zero call sites — only the comment
records + the negative census pin); DE3's s21 raw-body pin
(`Buffer.byteLength(raw)` against the actual served bytes,
s21-data-export.spec.ts:46+86); the census chain green (the CQ2
return-shape pin, the route-streaming census, the READERS-key census,
the CW2 re-anchor); the doc census machine-verified (README badge 2218 ✓
· AGENTS 1602 ✓ · CLAUDE 1602 ✓ · PAD v1.3.64 ✓ · the SKILL census ✓ ·
the vitest header 48/1602 ✓ · the cert runner Expected 616 ✓) — zero
stale count sites.

### Audit B — the export/import data-portability family (the rotation axis, swept as a family)

The axis read dispatched to a read-only subagent against the
web-application skill's §3/§4/§6/§16/§17 rubric: the driver + the READERS
wiring + the route + the page + the client panel + the http.ts seams +
the import counterpart's lock doctrine + every unit/e2e/census pin + a
whole-src consumer grep. **Verdict: 0C / 0H / 1M / 2L / 6I.** The family
remains coherent, well-pinned, and secure (authz on both consumers, the
triple secret guard, the budget ordering, the byte-based accounting, the
round-trip reconciliation — all re-verified clean). The findings:

- **M-1 (M — Verified by direct read):** the repo's own query-engine
  binary carries `BEGIN IMMEDIATE` (×2) and NOT `BEGIN DEFERRED` — the
  F3 wrap's recorded premise ("holds a read transaction open") may
  understate the cost: a Prisma SQLite interactive `$transaction` may
  take a lock at BEGIN that starves sitewide writers. The F3 measurement
  (§2) must probe the ACTUAL lock mode empirically before any design.
  **Rides §2 — the probe ran; see its verdict.**
- **L-1 (L — Verified by direct read):** the /export page's 20-count grid
  has NO manifest-completeness census — the DB2 census anchors only
  `db.subject.count` existence (script-conventions:2396-2402), while the
  assembly side's READERS map is machine-guarded per-collection. A
  dropped collection ships a 19-chip grid with every gate green.
  **Rides §3 — DF1 closes it STRUCTURALLY (the grid derives from
  EXPORT_COLLECTIONS through the seam, never hand-listed).**
- **L-2 (L — Verified by direct read):** AGENTS.md:107 (the living
  export row) still says the 20 collections "read in parallel" — stale
  since S156/DE1's sequential driver. **Rides §4 (the doc rider).**
- **I-1 (I):** the import tx's update writes are unscoped
  (`where: { id }`) — the accepted read-hoist TOCTOU carries a narrow
  cross-account flavor (contrived; no confidentiality breach). No
  action; the accepted-TOCTOU note gains the cross-account wording in a
  future family cycle.
- **I-2 (I):** no `force-dynamic` on the export route/page (the repo
  posture — cookie-reading auth makes both implicitly dynamic; the SKILL
  §6 idiom diverges but the repo is internally consistent). No action.
- **I-3 (I):** the driver's Pass-2 encodes the head/separators/tail
  unconditionally after retention stops (a few KB, bounded, matches the
  documented refusal bound). No action.
- **I-4 (I — the pin-comment riders):** tests/data-export.test.ts:253
  ("thrown by the shared renderExportEnvelope seam" — the throw lives in
  the pure driver) + tests/e2e/s23-import.spec.ts:567 ("re-runs the
  page's 20 db counts" — re-words under DF1). **Ride §3/§4.**
- **I-5 (confirmation):** F3 and F5 stand exactly as recorded, open; F7's
  cosmetic edges (the UTC stamp, the 429-through-the-anchor) unchanged.
- **I-6 (confirmation):** the census integrity clean (README 2218 ·
  AGENTS 1602 · vitest header 1602 · cert 616 · CLAUDE 1602 — zero stale
  count sites; the one drift is L-2, a prose claim).

**Question A (the F5 shape, answered):** the drop-in design is
**grid-from-envelope — never count-only**. The driver's return shape
exposes no counts today (the counts record is a loop-local consumed by
headFragment; `RenderedExport = { fragments, bytes }`), so the fix grows
the return shape; the panel consumes `Array<{name, count}>` (order =
array order; `COLLECTION_LABELS[name] ?? name` fallback) — the envelope's
counts (keyed in EXPORT_COLLECTIONS loop order) are drop-in compatible.
The page's count-query family is pinned at exactly one census
(script-conventions:2396-2402 — the DB2 ordering anchors); the
`.bytes`/no-`json.length` pins (1392-1394) and the s21/s23/navigation e2e
legs all survive grid-from-envelope BY CONSTRUCTION (verified by direct
read). The count-only half of the phase-2 candidate conflicts with the
S141/CP4 size signal (the exact bytes are only knowable from the full
serialization) — rejected; the single-path doctrine holds.

**Question B (the F3 measurement facts, answered):** 14 `$transaction`
sites in src/ (the import's 60 s/5 s write-only family is the collision
target; every other read-in-tx precedent is sub-second); no PRAGMA
anywhere (journal_mode=delete + busy_timeout 5000 are SQLite defaults,
documented-as-probed); NO long-held-read-tx precedent exists (the S141/CP3
doctrine is the opposite — hoist every read out of the lock window); the
measurement model exists (`scripts/measure-import-window-s154.mjs`).

## §2 DF2 — the F3 measurement (the lock-behavior probe; the measurement-first doctrine)

**The probe** (`scripts/measure-export-lock-s157.mjs`, committed — the
measure-import-window-s154 precedent; run against a THROWAWAY
`db/measure.db`, never custom.db, never e2e.db; two PrismaClient
connections — A the export-shaped reader, B the concurrent writer):

- **P1 — which lock does an open read-only interactive $transaction
  hold?** A opens `A.$transaction` (first read lands), holds 2500 ms
  (the serialization-CPU stand-in); B concurrently writes (implicit tx)
  and reads. **Measured: B's write SUCCEEDS in 2435 ms — blocked for
  the full remaining hold (the journal_mode=delete SHARED-blocks-
  EXCLUSIVE-commit tail: B's write acquires nothing that lets it commit
  until A releases); B's read coexists (2 ms); after A closes, B's next
  write lands in 1 ms (clean release).**
- **P2 — the reverse posture:** B holds an open write tx (post-first-
  write, uncommitted); **A's read coexists (2 ms)** — reads never block
  under a RESERVED holder pre-commit.
- **P3 — the export-shaped rehearsal:** A opens the tx (20 sequential
  collection reads — the driver's real shape), then a 1500 ms
  serialization hold; B fires 5 writes at 250 ms spacing. **Measured:
  write 0 SUCCEEDS in 1332 ms (the hold remainder); writes 1-4 land in
  1-2 ms each (post-close, no residual blocking).**

**The verdict — the snapshot is REJECTED ON MEASUREMENT.** A $transaction
export snapshot would hold a lock that **delays every concurrent writer's
COMMIT by the full read+serialize window** (all sitewide writes —
unrelated users' task toggles, the import's own write-tx slot
acquisition, the AI transcript persists). Within the 5 s busy_timeout
writers queue-and-succeed (measured); PAST it they fail outright
(SQLITE_BUSY → P2028) — and the large accounts the snapshot would serve
are exactly the ones whose serialization window crosses 5 s (the S154
sibling measurement: 0.32 ms/row at the write side — a 100k-row export
serializes for seconds; the skew the snapshot would close only matters
on the multi-collection concurrent-write window that only large accounts
exercise). **The S154 lesson repeats verbatim: the next session's first
act is the measurement, and the measurement chose a different answer
than the deferred design** — F3's deferral converts from cautionary to
MEASURED-REJECTED; the read-skew class stays accepted-and-documented
(the honest-failing posture confirmed correct: the export never writes,
the envelope's internal counts/data stay consistent by construction, and
the import resolves FKs against envelope ∪ owned rows — the S117
e2e-proven tolerance).

**The rider:** export-build.ts's read-skew honesty header re-words — the
"its own measurement cycle" deferral sentence becomes the measured record
(the probe's numbers + the rejection + the script's path). The probe
script + its output record land in the commit (the evidence chain).

## §3 DF1 — the leaner /export page (grid-from-envelope; the F5 close, the cycle core)

**The architecture (one read pass feeds the grid AND the size signal —
the S141/CP4 single-source doctrine completed):**

1. **The driver's return grows the structured counts.**
   `RenderedExport = { fragments: Uint8Array[]; bytes: number; counts:
   Record<string, number> }` (data-export.ts) — the SAME loop-local
   record `headFragment` serializes into fragment[0] (insertion order =
   EXPORT_COLLECTIONS loop order — the structured twin of the head's
   counts block; nothing new is computed). The return literal becomes
   `return { fragments, bytes, counts };`.

2. **ExportTooLargeError grows a REQUIRED counts payload.** The driver
   always holds the complete 20-key record when it throws (the throw is
   post-loop — every collection was read + counted, retention-stopped or
   not), so the constructor becomes `constructor(bytes: number, counts:
   Record<string, number>, message = …)` — the throw site
   `throw new ExportTooLargeError(bytes, counts);`. The over-ceiling
   page render keeps its grid (the panel needs counts in BOTH states).
   No other construction site exists (grep-verified); the message stays
   third with its default; http.ts's `instanceof` mapping is untouched.

3. **The page drops its own count family.** The 20 `db.*.count()` calls
   + the hand-written `counts` literal + the `db` import are REMOVED;
   the single `renderExportEnvelope` call feeds everything:
   happy path `const { bytes, counts } = await
   renderExportEnvelope(publicUser(user))`; the narrow catch reads
   `err.bytes` + `err.counts` (the over-ceiling state); the panel prop
   wiring `Object.entries(counts).map(...)` is unchanged (the
   entry-order = EXPORT_COLLECTIONS = today's literal order — verified
   identical by direct read; the panel renders byte-identically).
   The `noUnusedLocals` machine guard enforces the `db` import removal.

4. **The properties.** Per-view query count HALVES (20 count() + 20
   findMany → 20 findMany); the page-internal skew class (F3's
   page-internal component — the grid's counts read before the
   envelope's reads) is ELIMINATED (one pass — the grid and the size
   signal can no longer disagree); **L-1 closes STRUCTURALLY** (the
   grid derives from EXPORT_COLLECTIONS through the seam — a 21st
   collection or a dropped one is a READERS compile error, never a
   19-chip grid); the budget ordering is untouched (the exportPage:
   check stays after the auth gate, before the ONE work call).

5. **The census re-anchors (same-commit, deliberate):**
   - script-conventions CQ2: `return { fragments, bytes }` →
     `return { fragments, bytes, counts }` (the pinned-shape contract —
     the S156 lesson's comment records WHY the shape is pinned);
   - script-conventions CW2 family: the throw-site pin grows the counts
     form (`throw new ExportTooLargeError(bytes, counts)`);
   - script-conventions DB2: the `countsAt` anchor is REMOVED (the
     count grid no longer exists at the page); NEW negative censuses —
     the page contains NO `db.*.count(` call and NO `@/lib/db` import
     (the grid-from-envelope posture pinned structurally); the
     budget-before-envelope ordering survives; the DB2 header comment +
     the navigation DB2 comment block re-word;
   - the vitest header + the doc chain (README badge/counts, AGENTS
     census + the export row [L-2's "read in parallel" fix rides] +
     the S157 lessons block, CLAUDE counts, PAD v1.3.65, the SKILL
     census).

## §4 The riders

- **L-2:** AGENTS.md:107 — "read in parallel" → the sequential-reader
  truth (S156/DE1); the same row's COUNT-snapshot wording re-anchors to
  grid-from-envelope.
- **I-4:** the two stale pin comments (data-export.test.ts:253 — the
  throw lives in the pure driver; s23-import.spec.ts:567 — "re-runs the
  page's envelope render" under DF1).
- **AGENTS.md lesson-3 wording (the S153/DB2-era "20 counts + the
  complete serialize per view" prose)** — re-anchored to the one-pass
  shape where it appears in the living rows.

## §5 Scoping, deferrals, the e2e interplay, the RED inventory

- **The RED inventory (planned): +2 unit legs, +0 e2e legs.**
  - data-export.test.ts — the new `S157/DF1` describe: (1) **the counts
    weld** — `buildExportFragments(...)`'s returned `counts`
    deep-equals BOTH the parsed envelope's `counts` block (the
    structured-vs-serialized weld) AND the per-reader row counts (on
    the populated edge fixture); (2) **the error-carry shape** — the
    class field reads back (`new ExportTooLargeError(n, counts).counts`
    deep-equals; the required-arg constructor form) — the CW2 pattern
    (predicate + census + under-ceiling behavioral legs; driving a real
    256 MiB fixture account stays impractical, the S148 decision
    unchanged).
  - script-conventions.test.ts — the census edits (count-neutral):
    the CQ2 return-shape re-anchor; the CW2 throw-site extension; the
    DB2 page census rewrite (countsAt removed; the two negative
    censuses added; the ordering re-anchored to the ONE envelope call).
  - **No e2e legs BY DESIGN** (the CV1 runtime-split precedent): the
    three live consumers re-certify the wire — s21's page leg (the grid
    region + the Tasks chip + the size signal + the raw-body pin),
    s23's CH7 refresh leg (the Tasks chip 0→1 flip — `router.refresh()`
    re-runs the page's ONE envelope render), navigation's DB2 twin
    (the page budget + the Download JSON presence). The s23:567
    comment re-words (I-4).
- **Unit census: +2 net → 1602 becomes 1604 · e2e census 616 (unchanged
  — no cert re-tag) · census 2218 → 2220.** The vitest header
  re-anchors; the doc chain (README badge + the Session-157 row, AGENTS
  census + the export row + the S157 lessons, CLAUDE, PAD v1.3.65, the
  SKILL census) follows.
- **The targeted e2e: chunk 5 (89 legs — s21 + s23, the direct page
  consumers) AND chunk 1 (152 legs — navigation's page-budget twin) —
  then the full 5-chunk cold cert** (the standing map; the budget
  arithmetic untouched — no new register or import POSTs).
- **The dev-tree re-confirmation discipline:** after the fix, the dev
  daemon restarts (the S9/S31 stale-Turbopack discipline) and the
  drawer check + the desktop parity probe re-run GREEN on the
  remediated tree before any capture.
- **The build measurement (the S155 lesson, standing):** the standalone
  output must stay 144M + 7 warnings — the diff only REMOVES an import
  (the page's `db`) and adds no new ones (no tracing risk by
  construction; verified by measurement).
- **The `db/measure.db` scratch file** is deleted after the measurement
  is recorded (the s154 precedent); the probe script is committed.
- **Deferred (recorded, with reasons):** F3 REJECTED ON MEASUREMENT
  (§2 — the skew class stays accepted-and-documented; the probe record
  is the artifact); the single-collection cursor pagination (a >memory
  single collection still materializes — census-breaking, its own
  cycle); F7's cosmetic edges (the UTC stamp, the 429-download UX);
  I-1's cross-account TOCTOU note (documentation-only, a future family
  cycle); the raw-SQL bulk upsert + the A-M3 stage-2 (unchanged from
  the S156 close — measurement-gated).
- **The `.env.example` contract:** no env-var reads change this cycle —
  re-verified at close.

## §6 As-executed close

**Executed as planned — no mid-cycle design corrections.** The RED
inventory: the unit REDs **4/4** on their designed markers (the
counts-weld leg + the over-ceiling-counts leg in the new S157/DF1
describe + the CQ2 return-shape re-anchor + the DB2 page census
rewrite with its two negative censuses). The §3 architecture shipped
exactly as designed: the structured counts return
(`RenderedExport = { fragments, bytes, counts }`), the required-arg
`ExportTooLargeError(bytes, counts)`, the page's count-family
retirement (one `renderExportEnvelope` call feeding the grid AND the
size signal), the measured-record header (§2), and the riders (L-2,
I-4, the DB2 comment blocks).

**The one honest mid-run correction (the flake ledger):** the targeted
chunk-1 run recorded **151/152** — parity-session8's BZ3
popover-keyboard leg failed once under the concurrent doc-edit + cert
machine load, then passed **standalone-cold 68/68 first-pass** (the
S139 machine-load class; the leg itself untouched by this cycle's
diff). The full cert's own chunk 1 then passed **152/152 first-pass**
with the flake unrecurring — recorded here honestly, not elided.

**The build measurement (the S155 lesson, standing):** the standalone
output **144M byte-identical to pre-fix; 7 warnings — the documented
set, nothing new** (the diff only REMOVES the page's `db` import —
no new imports, no fs, no import.meta wrappers; the tracing risk
designed away by construction, verified by measurement).

**The live page probe** (`scripts/probe-export-page-s157.mjs`, the dev
tree): the /export page renders **20 chips in EXPORT_COLLECTIONS
order**; the grid counts **MATCH the API envelope's own counts** (the
cross-check through GET /api/export/data — one source: the seam); the
size signal renders (19 KB); **X-Export-Bytes 19832 === the actual
received body bytes**; the secret guard holds.

**The remediated-tree re-confirmation:** the daemon restart (the
S9/S31 stale-Turbopack discipline) → preflight GREEN · the drawer
check GREEN (**the 75th consecutive**) · the desktop parity probe
**MATCH** (all five checks, live reference login).

**Gates.** lint ✓ · tsc ✓ · unit **1604/1604** (48 files, +2 exactly
as designed) · build ✓ (exit 0; 7 warnings; 144M byte-identical) · the
targeted e2e: chunk 5 **89/89 first-pass** cold (s21 + s23 — the
direct page consumers) + chunk 1 151/152 with the one machine-load
flake (BZ3 standalone-cold 68/68 first-pass, unrecurring) · the
5-chunk cold cert: chunk 1 **152/152** · chunk 2 **189/189** · chunk 3
**91/91** · chunk 4 **95/95** · chunk 5 **89/89** — **all five chunks
FIRST-PASS CLEAN** — the cert tally **616/616** (the e2e census
unchanged by design; the three live export consumers re-certified) ·
**census 2220 green** (was 2218).

**Evidence.** The `docs/screenshots/157-clone-*.png` frames (the
standing desktop 241 KiB + the standing mobile drawer 66 KiB — the
75th drawer-GREEN companion — + **the cycle's surface: the remediated
/export page 226 KiB, 20 chips machine-counted by the capture
script**), self-verifying (ok:true; dimensions machine-checked
1440x900 / 390x844) + the live page-probe record. The DF1 proof rides
the unit counts-weld leg + the re-anchored censuses + the live probe +
the cert; the DF2 proof rides the committed probe script +
`measure-export-lock-s157.mjs`'s recorded numbers (the plan §2 record,
reproduced verbatim in the seam header).

**Docs.** README badge/census (2218 → 2220) + the unit-count prose
sites + the data-portability row extension + the Session-157 row;
AGENTS census (1602 → 1604) + the export row re-anchor (the L-2 fix) +
the S157 lessons block (three lessons: the rejection-is-the-deliverable
doctrine, the return-the-producer's-value rule, the
error-payload-carries-the-degraded-render lesson); CLAUDE counts; PAD
v1.3.65 (the revision block); the SKILL census (all five sites); the
vitest header re-anchor (+2 with the no-e2e-by-design note);
`docs/session_187.md`; the worklog Session-168 entry; this close; the
`.env.example` contract re-verified (no env-var reads changed this
cycle — .env and .env.example byte-identical at the documented dev
posture).

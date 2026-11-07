# Remediation Plan — Session 158 (Cycle 108, Batch DG)

> Status: PLANNED (pre-change record — the immutable plan; the as-executed
> close lives in §7). Written before any source change, per the standing
> doctrine ("write the cycle plan into docs/remediation-plan-sessionN.md
> BEFORE any source change").
>
> Operator directive: refresh the workspace, re-read the doc chain
> (AGENTS/CLAUDE/README/PAD/SKILL + session_187/188 +
> remediation-plan-session157 + worklog), validate against the codebase,
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

**Workspace (cold — the workspace was RESET; a fresh
`git clone https://github.com/nordeim/omni-study1.git` at `69cebc0` on
`main` [the Batch DF fix `0c6fa3d` + the operator's session_188 transcript
commit]; the environment rebuilt: `cp .env.example .env` [byte-identical at
the documented dev posture — `DATABASE_URL="file:../db/custom.db"`],
`bun install` [510 packages], `bun run db:push && bun run db:seed` [the
repo-root `db/custom.db`, 389 KB], `bunx playwright install chromium`,
bun 1.3.14).**

**Cold baseline (before any work): lint ✓ · tsc ✓ · the full Vitest run
1604/1604 (48 files — the documented S157 final state exactly) · the dev
daemon preflight GREEN (hydrated, navigation-stable) · the drawer check
GREEN (the 76th consecutive no-Tailwind-v4-mobile-nav-bug confirmation —
backdrop oklab(0 0 0 / 0.2) + blur(4px); 288px white panels; 20 links; no
footer; Escape-close superset) · the desktop chrome probe MATCH (all five
formal checks, live reference login — sidebar-outer 260 / 20 links /
first-links / mainX 260 / mainWidth 1180, the S142 outer-footprint
probe).** Baseline noise: none.

**The fix scope (the S157 close's named candidates, adjudicated).** The
S157 close records the rotation: the single-collection cursor pagination
("a >memory single collection still materializes — census-breaking, its own
cycle"), F7's cosmetic edges (the UTC filename stamp, the
429-through-the-download anchor), I-1's cross-account TOCTOU documentation
note, plus the measurement-gated pair (the raw-SQL bulk upsert, the A-M3
stage-2 — their recorded conditions unmet). Adjudication (the operator's
standing best-judgement instruction + the S154/S157 measurement-first
doctrine — "whenever a deferral's rationale contains a measurable
condition, the next session's first act on that family is the MEASUREMENT,
not the design"): **the single-collection memory measurement runs FIRST
(§2, DG0), and its outcome decides the cycle** — the measurement measured
a dominant collection peaking at **3.04–3.12× the envelope's own bytes**
(vs 1.51× spread), which **promotes the cursor pagination to the cycle
core (§3, DG1)**. The audit's two L findings ride as DG2 (§4, the
ownership-scoped import updates) and DG3 (§5, the Restore-card file-input
reset). F7's edges are REJECTED AS NOT-A-GAP on the audit's analysis (§6);
the measurement-gated pair stays deferred on its recorded conditions.

## §1 The audits (Mode-C; every L+ finding re-verified by direct read by the orchestrator)

### Audit A — the Batch DF recent-changes axis (the `0c6fa3d` diff; `69cebc0` is docs-only)

**0C / 0H / 0M / 0L / 0I — clean.** All six DF claims verified DELIVERED
at the source level: DF1's structured counts return
(`RenderedExport = { fragments, bytes, counts }`, data-export.ts:252–256)
+ the required-arg `ExportTooLargeError(bytes, counts)` (:226–235) + the
page's count-family retirement (src/app/export/page.tsx — ONE
`renderExportEnvelope` call, NO `db.*.count(`, NO `@/lib/db` import) +
DF2's measured-record header (export-build.ts:28–42 — the probe's numbers
+ the rejection + the script path) + the S157/DF1 describe
(data-export.test.ts:531+, the counts-weld + over-ceiling-counts legs) +
the DB2 census rewrite with its two negative censuses
(script-conventions.test.ts:2395–2423) — and the doc census chain
machine-verified (README badge 2220 ✓ · AGENTS 1604 ✓ · CLAUDE 1604 ✓ ·
PAD v1.3.65 ✓ · the SKILL census ✓ · the vitest header 48/1604 ✓ · the
cert runner Expected 616 ✓) — zero stale count sites.

### Audit B — the export/import data-portability family (the rotation axis, swept as a family)

The axis read dispatched to a read-only subagent against the
web-application skill's §3/§4/§6/§16/§17 rubric: the driver + the READERS
wiring + the download route + the page + the client panel + the http.ts
seams + the import counterpart + every unit/e2e/census pin + the schema's
keyset viability. **Verdict: 0C / 0H / 0M / 2L / 5I.** The family remains
coherent, well-pinned, and secure (auth gates precede limiters on all
three doors, the triple secret guard, the budget ordering, the byte-based
accounting, the round-trip reconciliation — all re-verified clean). The
findings:

- **L-1 (L — Verified by direct read):** the Restore card's file input
  resets `e.target.value` on the OVERSIZED branch only — after a failed
  import, re-picking the same (edited) file fires NO change event (the
  input's value is unchanged) and the Import button re-sends the ORIGINAL
  File snapshot: the "fixed" backup silently doesn't get re-read.
  **Rides §5 (DG3 — the one-line both-branches reset + the census pin).**
- **L-2 (L — mechanics Verified by direct read):** the import tx's update
  writes are unscoped (`where: { id }`, route.ts:623–626) and the payload
  RE-ATTACHES `userId: user.id` for the 19 non-cards collections
  (:499–500) — the documented read-hoist TOCTOU carries an
  under-documented ownership-flip sub-variant: an id owned by the importer
  at probe time, deleted, then RE-CREATED by a second account inside the
  widened probe→tx window, would be OVERWRITTEN and its ownership FLIPPED
  by the first import. The recorded note's stated prerequisite (an
  envelope carrying another account's ids) is correctly blocked by the
  ownership-scoped probe + the unscoped cross-account collision pre-flight
  (:526–544, the named 409). **Rides §4 (DG2 — the scoped-update
  hardening + the route-header note naming the variant).**
- **I-1 (I):** the malformed-JSON 400 folds into the generic "Expected a
  studyflow-data-export envelope." copy (panel clients pre-parse and get
  friendlier copy). No action.
- **I-2 (I):** the 64 MiB parse-memory amplification — `IMPORT_MAX_ROWS`
  is post-parse (the documented S144/CS5 posture; auth-gated +
  budgeted). No action.
- **I-3 (I):** the /export page renders the full envelope per view (the
  accepted S141/CP4 cost honesty, budgeted S153/DB2). **Feeds §2's
  measurement.**
- **I-4 (I):** the download "stream" enqueues all retained fragments
  synchronously — chunked transfer of a prebuilt body, memory-equivalent
  to the fragments array (the documented retain-then-serve design; the
  no-join census pins it). No regression.
- **I-5 (I):** the "256 MB"/"64 MB" copy labels MiB constants —
  consistent family-wide. No action.

**The three recorded candidates, adjudicated on the audit's analysis:**

- **Candidate 1 (the single-collection cursor pagination):** the S156/DE1
  driver reads each collection through ONE unbounded `findMany` — a
  dominant collection fully materializes as Prisma row objects (2–4×
  their serialized size) on top of the retained fragments. The keyset
  order contract (`createdAt asc, id asc`, unique `id` — a total order)
  is index-backed (`@@index([userId, createdAt, id])`, the S128/CC10
  composite; cards via the deck join). All three pinned properties are
  pagination-invariant by construction (the byte-identity oracle, the
  counts record, the post-loop throw) — a contract/census-UPDATE, not an
  invariant break. **The measurement decides (§2) — it JUSTIFIES the fix
  NOW (DG1, §3).**
- **Candidate 2 (F7's cosmetic edges):** (a) the UTC filename — the
  server has no client-TZ signal on a plain anchor GET; UTC is
  deterministic and conventional; the envelope's `exportedAt` is the real
  identity. **REJECTED AS NOT-A-GAP** (the client-computed `?stamp=`
  polish recorded). (b) the 429-through-the-anchor — engine-dependent
  (navigate to raw JSON, or save a junk "data" file), but no data risk,
  back-button recovers, 10/15-min is generous; the fetch→blob unification
  would cost a client-side full-body buffer. **REJECTED AS NOT-A-GAP at
  current scale** (the polish recorded).
- **Candidate 3 (I-1's TOCTOU note):** the documented note is accurate —
  and the audit found the cheap hardening (the scoped where) is
  behavior-compatible on every current path (a no-match throws P2025 →
  the EXISTING named-409 leg). **DG2 lands the hardening AND the doc
  note.**

## §2 DG0 — the single-collection memory measurement (the measurement-first doctrine, run FIRST)

**The probe** (`scripts/measure-export-heap-s158.mjs`, committed — the
measure-export-lock-s157 precedent; run against a THROWAWAY
`db/measure-s158.db`, never custom.db, never e2e.db; three synthetic
users, ~1.2 KiB payload per row, 50k rows per shape; measures around the
REAL `renderExportEnvelope` — the seam, the READERS map, the driver — with
a 25 ms heap/rss sampler and gc'd baselines; the SHAPES env isolates a
shape per process after the P2 artifact below was diagnosed):

- **P1 (SPREAD — 10 collections × 5k rows):** envelope 51.9 MiB · **peak
  heap delta 78.4 MiB (1.51×)** · 748 ms.
- **P2 (DOMINANT-notes — 50k rows in ONE collection), isolated:**
  envelope 75.8 MiB · **peak heap delta 230.3 MiB (3.04×)** · 907 ms.
- **P3 (DOMINANT-chat — 50k rows in ONE collection), isolated:**
  envelope 65.2 MiB · **peak heap delta 203.4 MiB (3.12×)** · 848 ms.

**The P2 GC artifact (diagnosed, documented in the probe):** the first
two runs measured dom-notes at 1.48× — a contaminated baseline (P1's
~52 MiB of unreachable-but-uncollected fragments rode P2's `before`
reading) let mid-render GC suppress the observed peak; isolated-process
runs are the honest shape (dom-notes 3.04×, matching dom-chat's 3.12× —
stable across re-runs).

**The verdict — the pagination is JUSTIFIED NOW.** A dominant collection
peaks at **~3× the envelope's own bytes** (the single-collection
row-object term ≈ 2× the retained-fragment term; the dominant-vs-spread
excess: 126.9 MiB chat / 151.9 MiB notes at ~52–76 MiB envelopes). At the
256 MiB ceiling a dominant-collection account peaks at **~780 MiB of
heap** — a real OOM class on small containers (the README documents dev
servers OOM-killed at ~1.6 GB RSS; the export family's own ceiling
presumes the process survives to throw). The S157 close's "its own cycle"
condition is MET: this cycle is it. **The deferral converts from
deferred-with-concern to MEASURED-JUSTIFIED — DG1 is the cycle core.**

**The proof-of-fix re-measure:** after DG1 lands, the probe re-runs
isolated (dom-notes + dom-chat) — the expected shape is ~1.2–1.3× (the
fragments + ONE 5k-row batch ≈ 15 MiB), recorded in §7.

## §3 DG1 — the per-collection cursor pagination (the cycle core)

**The architecture (the reader contract becomes paged; the driver loops
batches; the server wiring owns the page size):**

1. **The contract** (data-export.ts): `ExportCollectionReader` becomes
   `(collection: ExportCollection, after?: ExportRow) => Promise<{
   rows: ExportRow[]; hasMore: boolean }>`. `after` is the last row of
   the previous page (the keyset anchor — the raw Prisma row, its
   `createdAt`/`id` are the cursor pair); the reader owns the page size;
   `hasMore: false` terminates the collection. The driver is
   batch-size-agnostic (the unit fakes pick their own).

2. **The driver loop** (buildExportFragments): per collection, an inner
   `for(;;)` — first page emits the `"name":[` scaffold piece; per page,
   the per-row fragments join with `,` WITHIN the batch and the first row
   of every non-first page carries its own leading `,` (the
   separator-across-batches correctness — the piece the single-array
   generator got for free); `counts[collection] += page.rows.length`
   (accumulates across batches; insertion order = EXPORT_COLLECTIONS
   unchanged); the terminal `]` piece after the loop. **The defensive
   break:** an empty page terminates regardless of `hasMore` (a reader
   answering empty+hasMore would loop forever). The retention/ceiling
   logic is UNTOUCHED (per-piece, mid-collection capable — retention
   stops at the first piece past the ceiling while COUNTING continues
   across the remaining batches); the throw is UNTOUCHED (post-loop, the
   complete counts record).

3. **The server wiring** (export-build.ts): a `pageAfter(after, scan)`
   helper — builds `{ take: EXPORT_BATCH_ROWS + 1 }` or
   `{ take: EXPORT_BATCH_ROWS + 1, cursor: [{ createdAt: after.createdAt
   }, { id: after.id }], skip: 1 }` (the ARRAY-form compound cursor — the
   order contract is createdAt-primary, so a bare `{ id }` cursor would
   be WRONG; the array form matches the orderBy pair exactly), takes
   BATCH+1, answers the first BATCH rows + `hasMore = rows.length >
   BATCH` (the classic one-extra-row page — no empty roundtrip).
   `EXPORT_BATCH_ROWS = 5000` (the IMPORT_CREATE_CHUNK precedent; one
   batch's row objects ≈ 15 MiB — bounded). Each of the 20 READERS
   becomes `(userId, after) => pageAfter(after, (extra) =>
   db.<model>.findMany({ where: …, orderBy: EXPORT_ORDER, ...extra }))`
   — the cards reader keeps its deck scope. The `Record<ExportCollection,
   …>` key type, the exactly-20 findMany census, and the byte-identical
   wire all survive by construction.

4. **The properties.** The single-collection row-object term drops from
   ALL-rows-live to ONE-batch-live (~15 MiB) — the §2 measurement's 3×
   peak becomes ~1.2–1.3×; the byte-identity oracle (fragments'
   concatenation === `JSON.stringify(buildDataExport(...))`) holds across
   page boundaries BY CONSTRUCTION (the separator correctness is the only
   new edge, and it is unit-pinned); the counts record is
   accumulation-typed the same loop-local it was; the over-ceiling throw
   still carries the complete record; the read-skew window stretches by
   the batch-query count (~11 queries per 50k-row collection — seconds
   unchanged); the wire is byte-identical (the s21 raw-body pin
   re-certifies).

5. **The census re-anchors (same-commit, deliberate):** the READERS
   census regex re-anchors to the paged form (`name: (userId, after) =>
   pageAfter(`); the exactly-20 findMany census survives verbatim; the
   DE1 one-collection-at-a-time comment blocks re-word to
   one-BATCH-at-a-time; the vitest header + the doc chain follow.

## §4 DG2 — the ownership-scoped import updates (the L-2 close)

1. **The scoped where:** the import tx's update loop becomes
   `where: collection === "cards" ? { id } : { id, userId: user.id }` —
   Prisma 6's extended-where-unique accepts the compound form (id unique
   + the userId filter). Every CURRENT path is behavior-compatible: an
   owned row matches exactly as today; a vanished row (the CQ4
   concurrent-delete class) throws P2025 → the EXISTING named-409 leg.
   The ownership-flip variant (foreign row at write time) converts from
   overwrite+flip to P2025 → the same 409. **Cards stay unscoped**
   (Flashcard has NO userId column — Prisma's update-where cannot express
   the deck relation; their residual is a one-row content re-parent with
   NO ownership column to flip) — documented at the site.
2. **The interface:** `ImportDelegateOps.update`'s where type grows
   `userId?: string` (the honest narrowed contract).
3. **The route-header note:** the accepted-class block NAMES the
   delete+cross-account-recreate ownership-flip variant and its 409
   resolution under the scoped form; the cards residual is named.
4. **The pin:** a source census (script-conventions) — the scoped-where
   form + the cards exception at the update loop.

## §5 DG3 — the Restore-card file-input reset (the L-1 close)

`export-panel.tsx`'s onChange: the success branch gains
`e.target.value = ""` (the oversized branch already has it) — every pick
of the same path re-fires change with the FRESH File; the stale-snapshot
class is gone. The pin: a source census on the panel (both branches
reset). One line + the comment.

## §6 Scoping, deferrals, the e2e interplay, the RED inventory

- **The RED inventory (planned): +6 unit legs, +0 e2e legs.**
  - data-export.test.ts — the new `S158/DG1` describe: (1) **the
    multi-batch byte-identity weld** (batchSize 2, the populated edge
    fixture — the separator-across-pages correctness; the oracle asserts
    byte-identity to the object form); (2) **the paging contract** (a
    recording fake — the per-batch calls, the `after` anchor = each
    page's last row, the counts accumulation, the terminal hasMore);
    (3) **the defensive empty-page break** (a misbehaving reader
    answering empty+hasMore terminates — the no-infinite-loop pin). The
    existing readerOver fakes + the sequential-order/mechanism legs
    re-anchor to the paged contract (count-neutral).
  - script-conventions.test.ts — the READERS census re-anchor
    (count-neutral, the paged form) + **the DG1 driver-mechanism census**
    (+1: the page loop, the accumulation, the defensive terminal, the
    separator scaffolding) + **the DG1 server-wiring census** (+1: the
    BATCH+1 page, the compound array cursor, all 20 readers ride
    pageAfter) + **DG2's scoped-update census** (+1) + **DG3's
    panel-reset census** (+1).
  - **No e2e legs BY DESIGN** (the CV1 runtime-split precedent): the
    three live consumers re-certify the wire — s21's page leg + the
    raw-body byte pin (the wire is byte-identical by construction),
    s23's import legs (the update path re-certifies DG2's compatibility),
    navigation's DB2 twin.
- **Unit census: +7 net → 1604 becomes 1611 · e2e census 616 (unchanged
  — no cert re-tag) · census 2220 → 2227.** (The §6 draft said +6 — an
  arithmetic slip: the enumerated inventory is 3 data-export legs + 4
  census legs; the RED run confirmed 13 RED / the interim full run
  1611. Corrected here honestly, the S157 flake-ledger precedent.) The
  vitest header re-anchors; the doc chain (README badge + the
  Session-158 row, AGENTS census + the export/import rows + the S158
  lessons, CLAUDE, PAD v1.3.66, the SKILL census) follows.
- **The targeted e2e: chunk 5 (89 legs — s21 + s23, the direct consumers)
  AND chunk 1 (152 legs — navigation's page-budget twin) — then the full
  5-chunk cold cert** (the standing map; the budget arithmetic untouched
  — no new register or import POSTs).
- **The dev-tree re-confirmation discipline:** after the fix, the dev
  daemon restarts (the S9/S31 stale-Turbopack discipline) and the drawer
  check + the desktop parity probe re-run GREEN on the remediated tree
  before any capture.
- **The build measurement (the S155 lesson, standing):** the standalone
  output must stay 144M + 7 warnings — the diff touches 2 export src
  files + 1 import route + 1 panel, adds no imports (verified by
  measurement).
- **The post-fix re-measure (the proof of fix):** the §2 probe re-runs
  isolated (dom-notes + dom-chat) — the expected ~1.2–1.3× recorded in
  §7; the scratch `db/measure-s158.db` deleted after the record; the
  probe script committed.
- **Deferred (recorded, with reasons):** F7's cosmetic edges REJECTED
  AS NOT-A-GAP (§1 — the UTC stamp: no client-TZ signal on an anchor
  GET, UTC deterministic; the 429-through-the-anchor: no data risk,
  back-button recovers; the fetch→blob + client-stamp polish options
  recorded for a future cycle); the raw-SQL bulk upsert + the A-M3
  stage-2 (measurement-gated, their recorded conditions unmet); the
  import parse-memory amplification (I-2, the documented S144/CS5
  posture); the export-peak question for the /export PAGE per view
  (I-3 — DG1 fixes the shape for both consumers at once, the page rides
  the same seam).
- **The `.env.example` contract:** no env-var reads change this cycle —
  re-verified at close.

## §7 As-executed close

**Executed as planned — with two honest mid-run corrections recorded.**
(1) The §6 draft's RED inventory said "+6 net" — an arithmetic slip; the
enumerated inventory is 3 data-export legs + 4 census legs = **+7 net →
1611** (the RED run confirmed 13 RED / the interim full run 1611/1611;
§6 corrected in-place). (2) The §3 draft specified the
compound-ARRAY-cursor form — the generated `WhereUniqueInput` accepts
only the extended unique shape, and on reflection the **unique-id cursor
+ skip 1** IS the documented Prisma keyset idiom when the orderBy
defines the total order (the cursor positions at the unique row; the
order carries the keyset semantics); the wiring + the census re-anchored
to the simpler correct form BEFORE any gate ran.

**The RED inventory (as it ran): the unit REDs 13/13** on their designed
markers — the contract-change surface: the 3 new DG1 legs (the
multi-batch byte-identity weld, the paging contract, the defensive
terminal) + the re-anchored driver legs (the two oracles, the counts,
the bytes, the weld — the fakes moved to the paged contract FIRST with
single-page default semantics, preserving every legacy assertion) + the
census legs (the CJ2 READERS re-anchor + the 4 new DG censuses).

**The DG1 proof of fix (the probe re-run, isolated per shape):**
**dom-notes 3.04× → 1.28× · dom-chat 3.12× → 1.31× — both BELOW the
spread shape's own 1.51×** (the memory profile flattened across
shapes). **The keyset-verify pass** (added to the probe for this cycle —
the unit fakes cannot prove Prisma's cursor semantics and the e2e data
is single-batch, so the committed probe IS the fourth test tier):
per-collection row counts === the counts record, ids unique,
(createdAt, id) non-decreasing — **150k rows verified lossless in
total** (50k per shape), loud non-zero exit on any lossy signal.

**The live page probe** (`scripts/probe-export-page-s157.mjs` — the dev
tree on the remediated code): the /export page renders **20 chips**; the
grid counts **MATCH the API envelope's own counts**; **X-Export-Bytes
19832 === the actual received body bytes**; the secret guard holds —
byte-identical through the pagination.

**The remediated-tree re-confirmation:** the daemon restart hit the
documented **S9/S31 stale-Turbopack reload-loop ONCE** (the preflight's
own remedy applied verbatim: kill, `rm -rf .next/dev`, restart) →
preflight GREEN · the drawer check GREEN (**the 77th consecutive**) ·
the desktop parity probe **MATCH** (all five checks, live reference
login).

**Gates.** lint ✓ · tsc ✓ · unit **1611/1611** (48 files, +7 exactly as
enumerated) · build ✓ (exit 0; **7 warnings — the documented set,
nothing new**; the standalone **144M**) · the targeted e2e: s21 + s23
**21/21 first-pass** cold (the direct consumers — the export wire +
the import update path re-certified) · the 5-chunk cold cert: chunk 1
**152/152** · chunk 2 **189/189** · chunk 3 **90/91 with one
machine-load flake** (resilience's S120/BU1 Rename-dialog prefill leg —
entirely untouched by this cycle's diff; **standalone-cold re-run
41/41 first-pass, EXIT:0** — the S139 machine-load class, the S157
BZ3 precedent) · chunk 4 **95/95** · chunk 5 **89/89** — the cert tally
**616/616** (the e2e census unchanged by design; the flake re-verified
standalone-clean) · **census 2227 green** (was 2220; the final full
unit re-run post-doc-edits 1611/1611).

**Evidence.** The `docs/screenshots/158-clone-*.png` frames (the
standing desktop 235 KiB + the standing mobile drawer 64 KiB — the 77th
drawer-GREEN companion — + **the cycle's surface: the /export page on
the keyset-paged reads 221 KiB, 20 chips machine-counted by the capture
script**), self-verifying (ok:true; dimensions machine-checked
1440x900 / 390x844; md5s distinct) + the committed
`scripts/measure-export-heap-s158.mjs` (the before/after memory record
+ the keyset-verify pass — the DG1 proof) + the live page-probe record.

**Docs.** README badge/census (2220 → 2227) + the unit-count prose
sites + the data-portability row extension + the Session-158 row;
AGENTS census (1604 → 1611) + the export row re-anchor (the
keyset-paged wording) + the import row extension (DG2/DG3) + the S158
lessons block (three lessons); CLAUDE counts; PAD v1.3.66 (the revision
block); the SKILL census (all four sites); the vitest header re-anchor
(+7 with the probe-as-evidence note); `docs/session_189.md`; the worklog
Session-169 entry; this close; the `.env.example` contract re-verified
(no env-var reads changed this cycle — .env and .env.example
byte-identical at the documented dev posture).

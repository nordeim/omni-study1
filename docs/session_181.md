# Session 181 — the S154 cycle (Batch DC)

The workspace was a FRESH CLONE at `b6df05f` on `main` (the Batch DB fix
`2914f0d` + the operator's session_180 transcript commit; the sandbox
had reset, so the environment was re-provisioned from zero: `.env`
copied from `.env.example` at the documented dev posture, `db/` created
at the repo root + `db:push` + `db:seed`, `bun install` (510 packages),
the Playwright chromium cache re-provisioned — the S103 lesson-1 class,
`bunx playwright install chromium`).

Cold baseline (before any work): lint ✓ · tsc ✓ · the full Vitest run
**1582/1582 (48 files — the documented S153 final state exactly)** ·
the dev daemon preflight GREEN · the drawer check GREEN (**the 69th
consecutive no-Tailwind-v4-mobile-nav-bug confirmation** — backdrop
oklab(0 0 0 / 0.2) + blur(4px); 288px white panels; 20 links; no
footer; Escape-close superset) · the desktop chrome probe **MATCH**
(all five formal checks, live reference login — sidebar 260/20
links/first-links/mainX 260/mainWidth 1180). Baseline noise: none.

The audits (Mode-C; every M/L finding re-verified by direct read by the
orchestrator):

- **Audit A — the Batch DB recent-changes axis** (the `2914f0d` diff):
  **0C / 0H / 0M / 0L / 0I — clean.** All four DB claims verified
  DELIVERED at the source level (DB1's cap — `MAX_DISCHARGES_PER_WINDOW
  = 20` + the `Bucket.discharges` counter + the ceiling guard + all
  five call sites verbatim; DB2's export-page budget after the auth
  gate; DB3's net-0 drift sweep; DB4's N1 note) and the doc census
  machine-verified (README badge 2198 ✓ · AGENTS/CLAUDE 1582 ✓ · PAD
  v1.3.61 ✓ · the vitest header ✓ · the cert re-tag 616 ✓ · the
  hue-tokens register entry ✓ · the register route's measured 40/40
  comment ✓) — zero stale sites; both e2e pins verified at their
  relocated homes.

- **Audit B — the data-portability / import-restore rotation** (the fix
  surfaces, swept at S148 and six cycles grown). The axis read
  dispatched to a read-only subagent against the web-application
  skill's §4/§6/§7/§16/§17 rubric: the import route + the data-import
  seam + export-build + both export routes + the export page + the
  export panel + the unit pins + the s21/s23 e2e contracts.

  **Verdict: 0C / 0H / 0M / 4L / 2I.** No injection, authz,
  secret-handling, or enumeration defect in the axis. The findings:
  the standing **B-L2** (the sequential per-row updates inside the 60 s
  write-only transaction — re-verified, and now MEASURED, below); **L1**
  the practiceTests.questions item-shape parity gap (the members
  precedent's missed twin — the atom refines every item, the import
  checked array-ness only); **L2** ADR-021's Decision text stale on two
  counts (the 25 MiB cap; the per-row findFirst shape); **L3**
  AGENTS.md's import row stale on three counts (the cap, the
  write-loop shape, the false "exactly 9 POSTs / no other spec"
  budget claim); **L4** the write-only-tx property pinned only by
  presence-markers (no negative pin); **I-A** the export peak-memory
  O(account) residual (the streaming family); **I-B** the two
  verified non-gaps (the unscoped update-where gated by the
  ownership-scoped probe; the parse-before-row-cap trade-off). The
  S153 informational notes closed: N3 (the verifyEmailSchema
  reference-atom comment still accurate) + N4 (data-import.ts a pure
  seam outside server/, its imports nothing server-only).

**The measurement (the cycle's first duty — the S141 condition
answered).** The S141 deferral made the A-M3 stage-2 conditional:
"Stage-2 remains the named candidate **if measurement shows a residual
window**." A scratch probe (the exact tx shape — sequential per-row
updates + chunked createMany inside `$transaction({ timeout: 60_000,
maxWait: 5_000 })` — against a throwaway `db/measure.db`) measured the
loop **0.32 ms/row on this build, linear: 1k rows = 430 ms · 10k =
3.5 s · 50k = 16.0 s · 100k = 32.0 s** — the cap-sized all-updates
envelope fits the 60 s timeout with **1.9× headroom** (the S141-era
0.6 ms/row estimate was 2× pessimistic). The full-row probe (the
elision's read cost) measured **2.1 s at the same cap — 15× cheaper
than the writes it can elide**. Adjudication (the operator's standing
best-judgement instruction): the stage-2 chunked sub-tx + resume token
stays deferred — now ON MEASUREMENT, not on caution; the cycle ships
the contract-preserving move the measurement does justify.

The plan (`docs/remediation-plan-session154.md`) written BEFORE any
source change and validated against the codebase (every anchor
re-read; the RED inventory sized +6 unit legs, +0 e2e legs by design —
the CV1 runtime-split precedent: the elision is wire-invisible by
construction, the s23 idempotent re-import pin IS the behavioral leg).

**The RED inventory (as it ran): the unit REDs 4/4** — the DC2
questions-mirror leg failing on the no-throw pre-fix shape (the garbage
questions array persisted) + the DC1 diff trio failing on the missing
export (the dynamic-import form, the :1095 precedent — each leg at its
own failure, not a file-load error) — **+ the elision census RED** (the
absent markers) **+ the DC4 write-only negative census GREEN-on-arrival
by design** (the route already carries no `.findFirst(` call form —
the CS3/CL9 precedent, the pin documents the existing-good property).

**The S154 fixes:** DC1 the no-op update elision — the pre-tx pass
(after the collision pre-flight, immediately before the transaction)
reads the full stored rows for the update-branch ids (chunked,
ownership-scoped, the cards deck-scope included) and drops every write
whose planned payload already holds; the diff is the pure seam's
`plannedUpdateIsNoOp` (diff over PLANNED keys only — exactly Prisma's
update semantics; CONSERVATIVE — any doubt keeps the write; Date↔ISO
exact-millisecond comparison; no Json columns so any object is a
doubt); the elided rows still count in `updated` (the wire shape
UNCHANGED by construction); a row vanishing in the pass→tx window
joins the documented accepted read-hoist TOCTOU class, and the P2025 →
named-409 door stays open for changed rows. DC2 the questions item-
shape mirror (the atom's predicates verbatim — object + question
string + the three-member type vocabulary; never stricter than the
atom). DC3 the doc-reconciliation pair (ADR-021's Decision + AGENTS.md
import row). DC4 the write-only negative census (`.findFirst(` absent
— the CALL form) + the elision census markers.

**Interim gates: lint ✓ · tsc ✓ · unit 1588/1588 (48 files, +6 exactly
as designed: data-import +4, script-conventions +2) · build ✓ (exit 0;
the 6 documented warnings; the elision verified shipped in the
standalone chunk — the minified `Date.parse`/`getTime` diff guard
found by pattern).**

**The operational traps hit and closed (both self-inflicted, both
documented):** (1) the first backgrounded chunk-3 run was REAPED
mid-flight — the subshell-waiting form keeps the descendant alive (the
S110 lesson: the reaper kills by DESCENT; only an orphan escapes), so
the chunk re-ran in the FOREGROUND clean (91/91 first-pass); (2) **the
S153 edit-the-runner-during-a-run lesson RE-OFFENDED** — the cert
header note was inserted at the top of `e2e-chunked-cert.sh` WHILE bash
was executing chunk 2 (the in-place write shifted the post-loop byte
offsets under the running fd 255). Caught within the repair window:
the insertion REVERTED to the byte-identical original (`git diff`
empty) while the loop still held chunks 3-5 in memory, so the
post-loop read landed correctly and the cert completed with its DONE
line and exit code intact; the header note re-applied AFTER the run.
The lesson's sharpening: the S153 form of the rule ("never edit the
runner during a run") needs its RECOVERY recipe next to it — an
in-place edit under a running bash is recoverable IF the file is
restored byte-identical before the parser reads past its buffered
position (verify with `git diff` + the fd's inode).

**The targeted e2e + the cert:** chunk 3 **91/91 first-pass** cold
(resilience — the import 413/409 family + the CL1 equal-times round-
trip, the elision's second behavioral leg) · chunk 5 **89/89
first-pass** cold (s23-import — the round-trip, the idempotent
re-import [created=0, updated=3 with all three writes elided — the
elision's primary behavioral proof], the 400 family + rollback, the
merge guards; + the auth family untouched) · the cold 5-chunk cert:
chunk 1 **152/152** · chunk 2 **189/189** · chunk 3 **91/91 on the
identical-combo cold re-run** (the cert-run attempt carried TWO
failures root-caused as the documented P1008 machine-load class —
the Prisma socket-timeout signature ambient in every chunk's
WebServer log, the files-upload legs; closed by the clean first-pass
re-run, the three-signal protocol) · chunk 4 **95/95** · chunk 5
**89/89** — **616/616** (the e2e census unchanged by design) ·
**census 2204 green** (was 2198).

**Evidence:** the `docs/screenshots/154-clone-*.png` frames (the
standing desktop 239 KiB + the standing mobile drawer [the 69th
drawer-GREEN companion frame] + the Restore card's completed re-import
result — the elision's user-visible wire proof), self-verifying (the
capture script's JSON verdict ok:true; dimensions machine-checked
1440x900 / 390x844) + the measurement record. The DC1 diff's proof
rides the unit trio + the censuses + the s23/resilience re-cert (the
CW2 runtime-split precedent).

**Docs:** README badge/census (2198 → 2204) + the unit/e2e prose sites
+ the Data-portability feature row's elision note + the Session-154
row; AGENTS census (1582 → 1588) + the import row's three-count
reconciliation + the S154 lessons block (four lessons); CLAUDE counts;
PAD v1.3.62 (the revision block + the ADR-021 Decision reconciliation);
the SKILL census (all three sites); the vitest header re-anchor (+6
with the no-e2e-by-design note); the cert runner re-tag (applied
post-run); `docs/session_181.md` (this log); the worklog Session-165
entry; the plan §6 as-executed close; the `.env.example` contract
re-verified (no env-var reads changed this cycle).

**Next cycle:** the rotation continues — the raw-SQL bulk upsert (the
changed-rows tail's next step IF profiling ever shows the 60 s budget
pressed — the hand-rolled type-marshalling risk documented) and the
export streaming (the I-A peak-memory residual) stay the import
family's recorded candidates; the db-path percent-decode stays recorded
for the db-path-family cycle; the A-M3 stage-2 stays deferred ON
MEASUREMENT (re-measure if the hardware or the row cap changes).

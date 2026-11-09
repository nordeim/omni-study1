# Remediation Plan — Session 164 (Cycle 114, Batch DM)

> Status: PLANNED (pre-change record — the immutable plan; the as-executed
> close lives in §9). Written before any source change, per the standing
> doctrine ("write the cycle plan into docs/remediation-plan-sessionN.md
> BEFORE any source change").
>
> Operator directive: refresh the workspace, re-read the doc chain
> (AGENTS/CLAUDE/README/PAD/SKILL + session_199/200 +
> remediation-plan-session163 + worklog), validate against the codebase,
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
>
> Session note: the prior attempt at this cycle (same operator directive)
> was lost to a sandbox reset BEFORE its commit — its completed work
> (DM1-DM4 designed, RED proven, GREEN applied, docs lockstep done, cert
> chunks 1/2/5 clean) never reached the remote. This cycle RE-EXECUTES the
> same plan from a fresh clone at `9729ea4`; every surface below was
> re-verified by direct read in THIS session before this plan was written.

## §0 Scope, method, cold baseline, live parity

**Workspace (FRESH CLONE at `9729ea4` on `main` — the S163/Batch DL fix
`b66d4a1` + the two session-log docs commits `b025e7e`/`69a6e83`; the
prior session's sandbox was reset, so the workspace was rebuilt from
scratch: `bun install` (510 packages), the repo-root `db/` re-created,
`prisma db push` + `db:seed` re-run (demo account ready), `.env` copied
byte-identical from `.env.example` at the documented dev posture
(`DATABASE_URL="file:../db/custom.db"`)).**

Cold baseline (before any work): lint ✓ · tsc ✓ · the full Vitest run
**1657/1657 (51 files — the documented S163 final state exactly)**.
Baseline noise: none. The config posture re-validated for the operator's
standing ask: the vitest include matches `src/**/*.test.ts` +
`tests/**/*.test.ts` only; the playwright testDir is `tests/e2e` with
the production-build webServer on `db/e2e.db`; tsconfig excludes
`skills`; eslint ignores `skills` — the repo-included `skills/` folder
is excluded from code checking, testing, and compilation on every axis.

## §1 The audits (Mode-C; every H/L finding re-verified by direct read by the orchestrator)

### Audit A — the Batch DL recent-changes axis (the `b66d4a1` fix commit; `b025e7e`/`69a6e83`/`9729ea4` docs-only): **0C / 0H / 0M / 0L / 0I — clean.**

All three DL claims verified DELIVERED at the source anchors: DL1's
three contained catches (`fetchAndSet("exams").catch(() => undefined)`
at data.ts:647/651/655 with the CB8 doctrine comment block at 631-644)
and its pin set (tests/data-store.test.ts:598-643, the four-leg pair
set); DL2's exams loading-gate aria contract (exams-view.tsx:297-308,
`role="status"` + `aria-label="Loading exams"`); DL3's promoted
`parseExamTopics` seam (src/lib/data.ts, the DL3 pin set at
tests/data-store.test.ts:656-683) — and the doc census chain
machine-verified (README badge 2282 ✓ · AGENTS 1657 + the 625 e2e map ✓
· CLAUDE 1657 ✓ · PAD v1.3.71 ✓ · the SKILL census 2282 ✓ · the vitest
header 51/1657 ✓ · the cert runner re-tag 625 ✓) — zero stale count
sites.

### Audit B — the assignments family (the rotation's fresh axis: the S163 close's own "Next cycle" list NAMED this axis — "the family-wide CB8 port's REMAINING families (assignments/timetable/notes/flashcards/tasks … each family gets its own rotation-axis audit + pin set)" — the assignments family is FIRST in the recorded order; the family's point-fixes rode S127/CB2 [local-noon due dates], S127/CB9 [ASSIGNMENT_TYPES], S123/BX9 [string progress state], S130/CE3 [the loading gate], S134/CI7d + S161/DJ5 [the slider rollback resync], S152/DA1-2 [delete latch + hand-guard] — but the family was never deep-swept as an axis). The axis read against the web-application skill's §4/§9/§12/§13/§16/§17 rubric: assignments-view.tsx + the assignments API routes (the delegate factory + withUser/withUserParams wrappers) + the seams they consume (validation.ts's assignmentSchema + ASSIGNMENT_TYPES/ASSIGNMENT_PRIORITIES, the assignments mutations in data.ts, view-collections.ts, date.ts) + the round-trip verification against the route/factory wire contracts.

**Verdict: 0C / 1H / 0M / 2L / 1I.** The family remains in good shape
(ownership in the WHERE clause by construction — the delegate factory
scopes every query; Zod at both boundaries with the sentKeysPatch PATCH
shape; the BX9 string-progress form state; the CI7d/DJ5 rollback resync
with the contained rejection; the DA1 delete latch + the DA2 hand-guard;
the CB2 local-noon round-trip; the CB9 single-sourced TYPES with the
census guard; `take: 500` bounded reads; zero `useEffect`; zero
`space-y/x` containers; icon-only buttons carry aria-labels; the row
list is `role="group"`; the error box is `role="alert"`). The findings
(each re-verified by direct read):

- **H-1 (H — Verified by direct read, the full chain):** the
  assignments mutations REJECT on the refresh leg after a COMMITTED
  write — `createAssignment`/`updateAssignment`/`deleteAssignment` are
  `await apiSend(...)` then `await fetchAndSet("assignments")`
  (data.ts:618-629), and `fetchAndSet` REJECTS when its GET fails (the
  CD2 20 s deadline): a write that COMMITTED server-side followed by a
  flaky refresh rejected the WHOLE mutation — the view's catch showed
  "Something went wrong." in the STILL-OPEN dialog
  (assignments-view.tsx:187-188), fired NO success toast, and kept the
  form armed, so a RETRY re-POSTed and created a DUPLICATE assignment
  (the CB8 letter: a false mutation-failure claim on a committed row).
  The events twin (DK1, data.ts:671-682) and the exams twin (DL1,
  data.ts:645-656) sit BELOW it, BOTH fixed — the assignments trio
  above them is the NEXT unfixed family of the recorded family-wide
  port. **Rides DM1.** Severity H (not M) because the slider's
  `onValueCommit` leg (assignments-view.tsx:406) ALSO routes through
  `updateAssignment` — a flaky refresh after a COMMITTED progress drag
  rejects the mutation and fires the error toast on a SAVED row (the
  user re-drags → a second PATCH; benign for progress but the false
  failure is user-visible on the family's MOST-used control).
- **L-1 (L — Verified by direct read):** the assignments loading gate
  (assignments-view.tsx:310-313, the CE3 idiom `loading &&
  assignments.length === 0`) renders the aria-hidden `Spinner` inside
  an unlabeled div — zero `role="status"` occurrences in the view
  (grep-verified); the DL2/DK4 precedent family closed this for exams
  (S163), events + calendar (S162); the assignments gate is the
  remaining sibling. **Rides DM2.**
- **L-2 (L — Verified by direct read):** the view's `PRIORITIES` is a
  LOCAL 4-value twin (assignments-view.tsx:71) beside
  validation.ts:101's exported `ASSIGNMENT_PRIORITIES` single source
  (which assignmentSchema's `z.enum` consumes at :280) — value-equal
  today, so no live bug, but the EXACT S127/CB9 drift class the
  DJ3 census exists to guard (a future schema value the view twin
  misses blanks the Priority select on Edit — the census's four sites
  guard TYPES twins; the PRIORITIES form fell outside it because the
  twin is aliased, not same-named). **Rides DM3.**
- **I-1 (I — Verified by direct read):** the view's Delete
  DropdownMenuItem uses `onClick` (:391) where the Edit sibling uses
  the Radix-idiomatic `onSelect` (:385) — both fire today (Radix
  forwards both); the exams/events siblings use the same mixed pair.
  No live driver; declined at §8 (the surgical-diff doctrine).

### Audit C — the mid-cycle discovery (DM4; found by the DM1 RED→GREEN bisect, re-derived this session)

The S161/DJ5 e2e leg (tests/e2e/resilience.spec.ts:1719-1751, "the
slider rollback resync surfaces no unhandled rejection") routes
`page.route("**/api/assignments*", …)` and its comment claims "the
trailing-star pattern covers the collection path AND the per-id path" —
but Playwright's glob `*` does NOT cross `/`: the pattern matches the
collection GET `/api/assignments` but NEVER the per-id PATCH
`/api/assignments/<id>`. The leg's designed condition ("abort the PATCH
AND the GET") never fired — the PATCH sailed through with a 200 while
only the GET aborted, i.e. the leg exercised *committed PATCH + failed
refresh*: the EXACT CB8 false-failure condition DM1 closes. The leg was
GREEN by pinning the CB8 bug as correct behavior: pre-DM1 the mutation
rejected on the (un-designed) refresh failure and the toast fired, so
the assertions held for the wrong reason. Post-DM1 the same glob makes
the leg FAIL (the committed write + contained refresh answers NO toast
— the honest new behavior), which is how the dishonesty surfaced in the
prior session's bisect (fails 3/3 on the DM1 build, passes on the
pre-DM1 rebuild, the instrumented probe showed the PATCH 200ing through
the "aborting" route). **Rides DM4** — the test-honesty fix: `**` (the
directory-crossing star) on BOTH the route and the `finally` unroute.

## §2 DM1 — the assignments mutation CB8 split (the H-1 close)

The DK1/DL1 fix ported VERBATIM to the third family: the three
`fetchAndSet("assignments")` refresh legs gain `.catch(() => undefined)`
(the write leg keeps rejecting honestly), with the doctrine comment
block re-tagged S164/DM1. The unit pin set (tests/data-store.test.ts,
the DK1/DL1 pair-set template): create/update/delete resolve through a
failed refresh (apiSend resolves + apiGet rejects → the mutation
RESOLVES — RED pre-fix, all three reject) + the failed-write guard
(apiSend rejects → the mutation still rejects — GREEN-on-arrival, the
honest save-failure contract the dialog catch depends on). The e2e pin
(tests/e2e/parity-session9.spec.ts, after the CB9 describe — the
DK1/DL1 leg template): the collection GET aborts, the POST continues —
a committed create answers the SUCCESS toast ("Assignment added.") +
the closed dialog, never the false save-failure that armed the
duplicate-creating retry; zero-residue cleanup in a finally (the CC4/AR3
convention).

## §3 DM2 — the assignments loading gate gains the aria contract (the L-1 close)

The DL2 shape verbatim: the loading-gate div gains `role="status"` +
`aria-label="Loading assignments"` + the doctrine comment (the Spinner
itself is aria-hidden, so the unlabeled div was silent to assistive
tech during the in-flight window).

## §4 DM3 — the PRIORITIES single-source alias + the census site (the L-2 close)

The view's local twin (assignments-view.tsx:71) becomes the alias
`const PRIORITIES = ASSIGNMENT_PRIORITIES;` (the TYPES-at-:70 shape)
with the import extended; the DJ3 census gains its FIFTH site
(`assignments-view.tsx` / `ASSIGNMENT_PRIORITIES`) — the import leg
(RED pre-fix: the view imports no such name) + the no-local-twin leg
(GREEN-on-arrival: the twin is aliased `PRIORITIES`, not
`ASSIGNMENT_PRIORITIES` — the leg still guards the future fork).

## §5 The RED inventory (as designed)

- **DM1 unit** (data-store.test.ts): the resolve trio RED (3 failed) +
  the failed-write guard GREEN-on-arrival (1 passed) — designed marker:
  `3 failed | 1 passed`.
- **DM3 unit** (enum-single-source.test.ts): the import leg RED (1
  failed) + the no-local-twin leg GREEN-on-arrival (1 passed).
- **DM1 e2e** (parity-session9, pre-fix standalone build): the success
  toast never fires — the mutation rejects on the aborted refresh, the
  dialog stays open with the error. RED on the designed marker.
- **DM4 e2e** (resilience, DM1-applied build): the DJ5 leg FAILS with
  the OLD glob (no toast — the committed write + contained refresh is
  the honest new behavior) and PASSES with the corrected `**` glob (the
  PATCH genuinely aborts → the toast fires → zero pageerrors). The
  bisect pair IS the fix's proof.

## §6 The GREEN implementations (as designed)

- data.ts:618-629 — the three contained catches + the S164/DM1 doctrine
  comment (the DK1/DL1 text re-tagged).
- assignments-view.tsx:310-313 — the `role="status"` +
  `aria-label="Loading assignments"` gate.
- assignments-view.tsx:71 — `const PRIORITIES = ASSIGNMENT_PRIORITIES;`
  + the import; the S164/DM3 comment.
- resilience.spec.ts:1732/1748 — `**/api/assignments*` →
  `**/api/assignments**` (route + unroute) + the corrected comment.

## §7 The gates (as designed)

lint ✓ · tsc ✓ · unit **1663/1663** (51 files, +6 exactly: data-store
+4, enum-single-source +2) · build ✓ · the touched e2e spec files clean
(parity-session9 39/39 [+1]; resilience — the DJ5 leg GREEN under the
corrected glob) · the 5-chunk cold cert: chunk 1 155/155 · chunk 2
**193/193** (+1, the DM1 leg) · chunk 3 94/94 · chunk 4 95/95 · chunk 5
89/89 — the cert tally **626/626** = **census 2289 green** (was 2282;
1663 unit + 626 e2e) · the drawer check GREEN (the 89th consecutive
no-Tailwind-v4-mobile-nav-bug) · the desktop parity probe MATCH · the
evidence frames under docs/screenshots/164-*.png.

## §8 The adjudications (the rejected/documented findings)

- **I-1 (the onClick/onSelect mix on the assignments Delete item):**
  DECLINED — no live driver (Radix forwards both on DropdownMenuItem;
  both fire today), and the fix would touch the same line shape in the
  exams/events siblings for zero behavioral delta (the surgical-diff
  doctrine: one logical change per commit; the family-wide
  event-name harmonization, if ever wanted, is its own documented
  cycle).
- **The `.env` posture:** UNCHANGED — `.env` is byte-identical to
  `.env.example` at `DATABASE_URL="file:../db/custom.db"` (the
  repo-root `db/`, git-ignored); no env-var reads change this cycle,
  so `.env.example` needs no edit (re-verified against the diff).

## §9 The as-executed close

Executed as designed, as the recovery cycle (the prior session's
identical plan was lost to the sandbox reset before its commit; every
RED below was re-derived FRESH this session — nothing trusted from the
lost session's claims):

- **Workspace**: fresh clone at `9729ea4`; environment rebuilt
  (bun install 510 packages, the repo-root `db/` re-created +
  `db:push` + `db:seed`, `.env` copied from `.env.example` at the
  documented dev posture, playwright chromium 1243 re-provisioned).
- **Cold baseline**: lint ✓ · tsc ✓ · unit **1657/1657** (51 files —
  the documented S163 final state exactly).
- **RED proofs (all on their designed markers)**: the DM1 unit resolve
  trio RED (3 failed exactly) + the failed-write guard green-on-arrival
  (the pair `3 failed | 1 passed`); the DM3 import leg RED (1 failed) +
  the no-local-twin leg green-on-arrival; the DM1 e2e leg RED against
  the rebuilt pre-fix standalone — failing exactly at the designed
  assertion (`expect(page.getByText("Assignment added.")).toBeVisible()`
  — "element(s) not found"; the write committed, the toast never fired).
- **GREEN**: DM1 (the three contained catches at data.ts:634-645 with
  the doctrine comment), DM2 (`role="status"` + `aria-label="Loading
  assignments"` at assignments-view.tsx:314-325), DM3 (the
  `ASSIGNMENT_PRIORITIES` import + the alias at :64-75), DM4 (the
  `**/api/assignments**` glob at resilience.spec.ts:1741/1757 + the
  corrected comment).
- **The DM4 bisect pair**: the DJ5 leg under the OLD glob fails on the
  DM1 build (the committed write + contained refresh answers no toast)
  and passes with the corrected glob — plus the latent single-star
  sweep (CG5 + the tasks leg verified benign by direct read). The
  e2e GREEN sequence: DM1 leg 1.9 s; DJ5 leg 2.7 s; full
  parity-session9 **38/38**; full resilience **42/43** (the S120/BU1
  files-view Rename-prefill leg — the documented P1008 machine-load
  class, 2.1 s cold in isolation, diff-untouched).
- **Gates**: lint ✓ · tsc ✓ · unit **1663/1663** (51 files, +6 exactly
  as designed) · build ✓ (the "Ecmascript file had an error" lines
  verified PRE-EXISTING on the pre-fix tree by a stash-build-unstash
  check — toolchain noise, not the diff) · the 5-chunk cold cert:
  chunk 1 **155/155** (the first-run BU7 dashboard-badges failure was
  the P1008 class — socket-timeout signature co-occurring, the cold
  re-run clean) · chunk 2 **193/193** (the first-run 2 theme-system
  failures the same class — the cold re-run clean; +1 the DM1 leg) ·
  chunk 3 **94/94** (first-pass clean — the DM4-corrected DJ5 leg
  GREEN at 2.3 s on the authoritative run) · chunk 4 **95/95** ·
  chunk 5 **89/89** — the cert tally **626/626** = **census 2289
  green** · the drawer check GREEN (**the 89th consecutive**
  no-Tailwind-v4-mobile-nav-bug) · the desktop parity probe **MATCH**
  (all five formal checks, live reference login).
- **Evidence**: `docs/screenshots/164-clone-desktop.png` (45.9%
  non-white) · `164-clone-mobile-drawer.png` (34.5%) ·
  `164-clone-assignments.png` (39.3%) — captured by
  `scripts/capture-s164-evidence.mjs`, self-verifying (ok: true, md5s
  distinct).
- **Docs lockstep**: README badge/census (2282 → 2289) + prose sites +
  the Session-164 row; AGENTS census + e2e map + the S164 lessons
  block; CLAUDE counts (1663 + 626); PAD v1.3.72; the SKILL census
  (all sites); the vitest header (+6); the cert runner re-tag (both
  scripts, machine-pinned by the script-conventions leg);
  `docs/session_201.md`; the worklog Session-175 entry; this §9.
- **`.env.example`**: re-verified — no env-var reads changed this
  cycle; `.env` and `.env.example` byte-identical at the documented
  dev posture.

## §10 The execution checklist

- [x] DM1 unit pair set (data-store.test.ts) — RED trio proven (3 failed exactly)
- [x] DM3 census site (enum-single-source.test.ts) — RED import leg proven
- [x] DM1 e2e leg (parity-session9) — RED on the pre-fix build (the toast assertion)
- [x] DM1 GREEN (data.ts contained catches)
- [x] DM2 GREEN (the loading-gate aria contract)
- [x] DM3 GREEN (the PRIORITIES alias + import)
- [x] DM4 (the DJ5 glob fix + comment) with the bisect pair
- [x] lint · tsc · unit 1663/1663
- [x] build + the touched spec files clean (the P1008 legs triaged per the documented order)
- [x] the 5-chunk cold cert 626/626 (chunks 1/2 cold re-runs clean after the machine-load first-run failures)
- [x] drawer check + desktop parity re-confirmation (the 89th consecutive GREEN · MATCH)
- [x] evidence frames docs/screenshots/164-*.png (self-verifying + the pixel ratios)
- [x] docs lockstep: README badge/census/prose + Session-164 row ·
      AGENTS census + e2e map + the S164 lessons block · CLAUDE counts ·
      PAD v1.3.72 · the SKILL census · the vitest header · the cert
      runner re-tag (both scripts) + the script-conventions pin ·
      docs/session_201.md · the worklog Session-175 entry · this §9/§10
- [ ] git commit (main only) + push via the SSH wrapper

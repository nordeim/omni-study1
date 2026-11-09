# Remediation Plan — Session 163 (Cycle 113, Batch DL)

> Status: PLANNED (pre-change record — the immutable plan; the as-executed
> close lives in §9). Written before any source change, per the standing
> doctrine ("write the cycle plan into docs/remediation-plan-sessionN.md
> BEFORE any source change").
>
> Operator directive: refresh the workspace, re-read the doc chain
> (AGENTS/CLAUDE/README/PAD/SKILL + session_197/198 +
> remediation-plan-session162 + worklog), validate against the codebase,
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

**Workspace (WARM at `b025e7e` on `main` — the S162/Batch DK fix
`9a2da4d` + the operator's session_198 transcript commit `b025e7e`;
`git pull` verified up-to-date (the pull itself delivered session_198.md,
97 lines), working tree clean). Environment verified from the prior
session's quickstart state: `.env` byte-identical to `.env.example` at
the documented dev posture (`DATABASE_URL="file:../db/custom.db"`), the
repo-root `db/custom.db` (392 KB) + `db/e2e.db` (404 KB) present, bun
1.3.14, node v24.22.2 (node_modules pre-installed — no install needed).**

Cold baseline (before any work): lint ✓ · tsc ✓ · the full Vitest run
**1648/1648 (51 files — the documented S162 final state exactly)** ·
the dev daemon booted with the S9/S31 stale-cache remedy (`rm -rf
.next/dev` before boot; the reaper-proof python double-fork launcher —
`[boot] studyflow up — node_env=development
db=file:/home/z/my-project/omni-study1/db/custom.db`) · the preflight
GREEN (hydrated, navigation-stable) · the drawer check GREEN (**the 86th
consecutive no-Tailwind-v4-mobile-nav-bug confirmation** — backdrop
oklab(0 0 0 / 0.2) + blur(4px); 288px white panel; 20 links; no footer;
Escape-close superset) · the desktop chrome probe **MATCH** (all five
formal checks, live reference login — sidebar-outer 260 / 20 links /
first-links / mainX 260 / mainWidth 1180, the S142 outer-footprint
probe). Baseline noise: none. The config posture re-validated for the
operator's standing ask: the vitest include matches `src/**/*.test.ts` +
`tests/**/*.test.ts` only; the playwright testDir is `tests/e2e` with
the production-build webServer on `db/e2e.db`; tsconfig excludes
`skills`; eslint ignores `skills` — the repo-included `skills/` folder
is excluded from code checking, testing, and compilation on every axis.

## §1 The audits (Mode-C; every M/L finding re-verified by direct read by the orchestrator)

### Audit A — the Batch DK recent-changes axis (the `9a2da4d` diff; `108956e`/`b025e7e` docs-only): **0C / 0H / 0M / 0L / 0I — clean.**

All six DK claims verified DELIVERED at the source anchors: DK1's three
contained catches (`fetchAndSet("events").catch(() => undefined)` at
data.ts:642/646/650 with the CB8 doctrine comment block at 627-639);
DK2's REPEATS import (events-view.tsx:54) + the SelectItems render from
it (:529); DK3's four `referenceWeekNumber` doc-site reconciliations
(date.ts:53/75, date.test.ts:29, AGENTS.md's Events entry, SKILL.md's
Events entry — `isoWeekNumber` stays the pinned no-caller ISO contrast);
DK4's three loading-gate aria contracts (events-view.tsx:340,
calendar-view.tsx:236 + :428, all `role="status"` + aria-label); DK5's
promoted `src/lib/events.ts` seam (the verbatim body + the structural
param type + the doctrine comment) with tests/events.test.ts (10 legs);
DK6's calendar pre-warm drop (view-collections.ts:29 — exactly five
keys) — and the doc census chain machine-verified (README badge 2272 ✓ ·
AGENTS 1648 + the 624 e2e map ✓ · CLAUDE 1648 ✓ · PAD v1.3.70 ✓ · the
SKILL census 2272 ✓ · the vitest header 51/1648 ✓ · the cert runner
re-tag 624 ✓) — zero stale count sites.

### Audit B — the exams family (the rotation's fresh axis: the S162 close's own "Next cycle" list NAMED this axis — "the family-wide CB8 port (exams/assignments/timetable/notes/flashcards/tasks share the M-1 shape — each family gets its own rotation-axis audit + pin set, the events pin set is the template)" — the exams family is FIRST in the recorded order; the family's point-fixes rode S161/DJ3 [EXAM_TYPES] but the family was never deep-swept as an axis). The axis read dispatched to a read-only subagent against the web-application skill's §4/§9/§12/§13/§16/§17 rubric: exams-view.tsx + the exams API routes (the delegate factory + withUser/withUserParams wrappers) + the seams they consume (validation.ts's examSchema + EXAM_TYPES, the exams mutations in data.ts, view-collections.ts, date.ts) + the round-trip verification against the route/factory wire contracts.

**Verdict: 0C / 0H / 1M / 1L / 3I.** The family remains in good shape
(ownership in the WHERE clause by construction — the delegate factory
scopes every query; Zod at both boundaries with the sentKeysPatch PATCH
shape; the BX3 datetime round-trip pair; the 600/15-min write budget;
`take: 500` bounded reads with the composite index; zero `useEffect`;
zero `space-y/x` containers; icon-only buttons carry aria-labels; the
grid is `role="group"`; the error box is `role="alert"`; EXAM_TYPES
single-sourced with the census guard). The findings (each re-verified by
direct read):

- **M-1 (M — Verified by direct read, the full chain):** the exams
  mutations REJECT on the refresh leg after a COMMITTED write —
  `createExam`/`updateExam`/`deleteExam` are `await apiSend(...)` then
  `await fetchAndSet("exams")` (data.ts:614-625), and `fetchAndSet`
  rejects when its GET fails (the CD2 20 s deadline). The view's catch
  then shows "Something went wrong." in the STILL-OPEN dialog
  (exams-view.tsx:229), fires NO success toast, and keeps the form
  armed — a RETRY re-POSTs and creates a DUPLICATE exam: the CB8 letter
  violated, the EXACT shape the S162/DK1 fix closed for events (the
  events twin sits eleven lines below at data.ts:640-651, fixed; the
  exams trio above it, unfixed — the family-wide port the S162 close
  recorded, this cycle executes its first family). **Rode DL1.**
- **L-1 (L — Verified by direct read):** the exams loading gate
  (exams-view.tsx:301-304, the CE3 idiom `loading && exams.length ===
  0`) renders the aria-hidden `Spinner` inside an unlabeled div —
  zero `role="status"` occurrences in the view (grep-verified); the
  S162/DK4 pattern (events + calendar + calculator) unapplied to the
  fourth view. **Rode DL2.**
- **I-1 (I — Verified by direct read):** the topics safe-parse twin —
  byte-identical blocks in `openEdit` (exams-view.tsx:160-166,
  `JSON.parse(row.topics)`) and the card render (:325-331,
  `JSON.parse(exam.topics)`) — the exact duplication class the
  S151/CZ1 fix removed for notes (`parseNoteTags` promoted to
  data.ts:484-492); a future edit to one copy drifts the dialog vs the
  card. The file also carries a duplicated `@/lib/date` import pair
  (lines 44 + 47 — two import statements from one module). **Rode
  DL3.**

I-2–I-3 informational: the unchecked `as` cast on `form.type` with the
free-string Prisma column (the residual blanked-select class — no live
vector: the API boundary, the import door, and the seed all enforce the
EXAM_TYPES vocabulary; **declined at §8**); the per-card
`subjects.find` + per-comparison `new Date()` micro-perf (negligible
under `take: 500`; **declined at §8**).

**Point 8 (the client ↔ store ↔ api round-trip verdict): COMPATIBLE,
no field drift** — the view's payload sends exactly the 7 examSchema
keys 1:1 (title/date/subjectId/type/duration/topics/location); the
duration clamp mirrors the schema atom (5..600); the `subjectId: ""` →
`nullableId` → null boundary; the BX3 zone-safe edit round-trip; the
store's ExamRow mirrors the Prisma Exam model; `OWNED_FKS.exam = {
subjectId → subject }` pinned by tests/owned-fks.test.ts. The M-1 gap
is error-path plumbing, not shape drift.

**The test census the family rides today:** unit ≈ 20 assertions
(validation ≈ 5, enum-single-source 2, date/BX3 5, data-import ≈ 6,
view-collections 3, owned-fks 2, plus the hue-tokens/script-conventions/
schema-indexes censuses); e2e ≈ 19-20 test-level pins (parity-session8
× 11, parity-session6 × 1, parity-session9 × 1, navigation × 1,
accessibility × 2, resilience × 1, s17-fresh-user × 1, a11y-sweep +
mobile-navigation entries). **No pin covers the exams mutation
failure-domain seam (M-1) or the exams loading-gate aria contract
(L-1)** — both gain their pins this cycle.

## §2 DL1 — the exams mutation CB8 split (the M-1 close)

The three exams mutations contain the refresh rejection at the seam
(`await fetchAndSet("exams").catch(() => undefined)` — the DK1/DJ5
doctrine comment, ported verbatim from the events block): the WRITE leg
keeps rejecting honestly (the view's dialog catch still sees real save
failures — exams-view.tsx:229's "Something went wrong." is then always
true); a committed write + a failed refresh RESOLVES (the "Exam
added."/"Exam updated."/"Exam deleted." toast + the dialog close
proceed; the stale slice self-heals through the S16 view-switch pre-warm
+ the next mutation's own refresh — the DK1 doctrine, family-port
verbatim).

The soft-refresh-toast variant was REJECTED at S162/§8 for the events
family and stays rejected here (the same reasoning carries: the toast
store lives above the lib/components layer boundary; the view-side
split would break "every mutation refreshes the touched collections"
for the 48 remaining sibling sites).

**Unit pins (+4 — the CZ1 mock shape, the DK1 pair set ported):** in
tests/data-store.test.ts, a new describe "S163/DL1: the exams mutation
CB8 split (B-M1 — committed write + failed refresh)": createExam /
updateExam / deleteExam each RESOLVE on apiSend-resolved +
apiGet-rejected (RED pre-fix: each rejects with "offline" — the false
save-failure on a committed row) + the failed-write-still-rejects guard
(createExam on apiSend-rejected still rejects — the honest save-failure
contract). The examInput fixture mirrors the form's payload shape
(title/date/type/duration/subjectId/topics/location).

**E2e pin (+1 — the CB8-twin network-mock, the DK1 leg ported):** in
tests/e2e/parity-session8.spec.ts (the exams family spec; rides chunk 1
of the cold map), a new describe "S163/DL1 · the exams CB8
failure-domain split (Batch DL)": route `**/api/exams**` — the GET
aborts (the flaky-refresh condition), the POST continues (the write
lands server-side); create an exam through the real dialog (Add Exam →
`#exam-title` + `#exam-date` fill → the "Add exam" submit); assert the
"Exam added." success toast lands, the dialog CLOSES, and "Something
went wrong." never appears. RED pre-fix (against the pre-fix standalone
build): no toast, the dialog open with the false-failure copy, the form
armed for the duplicate-creating retry.

## §3 DL2 — the exams loading gate gains the aria contract (the L-1 close)

`role="status"` + `aria-label="Loading exams"` on the exams-view gate
(exams-view.tsx:301-304 — the DK4 precedent shape from
events-view.tsx:340/calculator-view.tsx:431). Rides the diff review
(the calculator precedent's own gate carries no pin; the DK4 gates rode
the same way).

## §4 DL3 — the parseExamTopics promotion (the I-1 close)

The topics safe-parse block moves VERBATIM from the two exams-view
sites to `src/lib/data.ts` as `parseExamTopics(raw: string): string[]`
(beside `parseNoteTags` — the S151/CZ1 precedent): the helper owns the
try/catch + the Array.isArray guard + the `typeof t === "string"`
filter (the EXAMS twins' semantics preserved exactly — no `t.length >
0` guard editorialized in, the parseNoteTags difference is deliberate
and documented); the `raw || "[]"` empty-string guard is behavior-
identical to the twins' catch path (JSON.parse("") throws → []).
Both sites consume the helper (`openEdit` + the card render); the
duplicated `@/lib/date` import pair (lines 44 + 47) merges into one
statement (the lint-clean no-op — ESLint's import/no-duplicates is not
enabled in this config, so the twin was silent; the merge is hygiene
that rides the diff).

**Unit pins (+5):** in tests/data-store.test.ts, a new describe
"S163/DL3: parseExamTopics (the promoted topics seam)": a valid JSON
string array parses; non-string entries filter out (the mixed array); a
non-array JSON payload (a JSON object) → []; invalid JSON → []; the
empty string → []. RED pre-fix: the module export does not exist (the
suite fails on the import — the missing-module marker, the DK5 RED
shape).

## §5 The RED inventory (as designed)

1. **DL1 unit RED (×4):** the resolve trio + the failed-write guard —
   each of the three resolve legs REDs on the pre-fix refresh-leg
   rejection ("offline"); the failed-write guard is green-on-arrival
   (the pre-fix mutation already rejects — the guard pins the contract
   the fix must NOT break).
2. **DL3 unit RED (×5):** the missing-export marker — the whole
   describe fails on the import (the module lacks `parseExamTopics`).
3. **DL1 e2e RED (×1):** proven against the pre-fix standalone build
   (the compile-blocking unit RED file set aside for the pre-fix build,
   then restored — the stash mechanics' equivalent): the leg fails on
   the absent success toast (`getByText('Exam added.')` — element(s)
   not found; the pre-fix mutation rejected on the aborted refresh).

## §6 The GREEN implementations (as designed)

1. **DL1:** the three contained catches in data.ts (the exams block
   gains the CB8 doctrine comment, ported from the events block).
2. **DL2:** the aria contract on the exams gate.
3. **DL3:** the `parseExamTopics` export in data.ts + the two view
   sites consume it + the `@/lib/date` import merge.

## §7 The gates (as designed)

lint ✓ · tsc ✓ · unit **1657/1657** (51 files, +9 exactly as designed:
data-store +9 — the DL1 pair set ×4 + the DL3 helper set ×5) · build ✓
· the 5-chunk cold cert: chunk 1 **155/155** (+1, the DL1 leg) ·
chunks 2-5 unchanged (**192/192 · 94/94 · 95/95 · 89/89**) — the cert
tally **625/625** (the e2e census 624 → 625) = **census 2282 green**
(was 2272; 1657 unit + 625 e2e). The remediated-tree re-confirmation:
the daemon restart with the S9/S31 remedy → preflight GREEN · the
drawer check GREEN (**the 87th consecutive**) · the desktop parity
probe **MATCH** (all five checks, live reference login).

## §8 The adjudications (the rejected/documented findings)

- **I-2 (the `as` cast on `form.type` — DECLINED):** no live vector —
  the API boundary (`z.enum(EXAM_TYPES)`), the import door
  (sanitizeImportRow rejects off-enum values, pinned at
  data-import.test.ts:1223/1250), and the seed all enforce the
  vocabulary; the guard would be dead code against a hand-edited DB
  row. The S162 §8 doctrine: declining a guard with zero reachable
  trigger keeps the diff surgical. Recorded here for the next
  exams-family cycle to re-derive.
- **I-3 (the per-card `subjects.find` + per-comparison `new Date()`
  micro-perf — DECLINED):** negligible under the server's `take: 500`
  bound (500 × subjects finds per render is sub-millisecond); no N+1
  (a single server-side findMany). The memo would add machinery to a
  parity-pinned surface with no behavioral driver. The DK5 §8
  precedent (no render churn without a driver) carries.
- **The family-wide CB8 port beyond exams (the remaining five
  families: assignments/timetable/notes/flashcards/tasks + the
  subject/taskList/notebook/deck/studyGroup/practiceTest seams) —
  DEFERRED, the recorded rotation:** the S162 close's own list stands;
  each family gets its own rotation-axis audit + pin set (the events
  pin set is the template; this cycle's exams port is the second
  family). The audit rotation itself is the trigger (the S162 lesson
  3: a deferral named by rotation axis needs no register).
- **The remaining S162-close deferrals stand:** the files
  refresh-failure toast copy harmonization (the F-8 candidate); the
  S160 close's ledger (the A-M3 stage-2 triggers; the update-side
  raw-SQL bulk upsert; the I-4 parse posture; the M-1 LLM-side
  residual); the gradetracker/studygroups/settings-CRUD and
  AlertDialog-confirm e2e gaps.

## §9 The as-executed close

Executed exactly as planned. The RED proofs ran in the designed order:
the DL1 resolve trio RED on the pre-fix refresh-leg rejection (3 failed
| 1 passed — the failed-write guard green-on-arrival); the DL3 suite
RED on the missing export (`TypeError: parseExamTopics is not a
function`, 5 legs); the e2e leg RED against the pre-fix standalone
build (the compile-blocking unit RED file set aside via `git checkout`
+ the /tmp copy restored after; the "Exam added." toast never fired —
element(s) not found). All three GREEN implementations landed in the
designed shapes (the three contained catches with the DK1 doctrine
comment ported verbatim; the aria contract on the CE3 gate; the
parseExamTopics promotion beside parseNoteTags with the twins'
semantics preserved and both view sites + the import merge).

**Gates (as executed):** lint ✓ · tsc ✓ · unit **1657/1657** (51
files, +9 exactly as designed: data-store +9) · build ✓ · the full
touched spec file 70/71 — the BZ3 notebooks popover leg flaked once on
the documented P1008 machine-load class (passes in isolation in 6.9 s;
the cert's own chunk-1 run of the same spec passed clean; my diff
touches nothing in that surface — the triage recorded in the S163
lessons block) · the 5-chunk cold cert: chunk 1 **155/155** (+1, the
DL1 leg) · chunk 2 **192/192** · chunk 3 **94/94** · chunk 4 **95/95**
· chunk 5 **89/89** — **the cert tally 625/625** (the e2e census 624 →
625) = **census 2282 green**. The remediated-tree re-confirmation:
preflight GREEN · drawer GREEN (**the 87th consecutive**) · parity
**MATCH** (all five checks, live reference login).

**Evidence (as executed):** the `docs/screenshots/163-clone-*.png`
frames — the standing desktop + the mobile drawer (the 87th
drawer-GREEN companion) + the cycle's Exams surface (the seeded cards
with their topic chips, the DL3 promoted seam's render path) —
self-verifying (ok: true; md5s distinct; the non-blank pixel ratios
45.9% / 34.5% / 58.3%), captured by `scripts/capture-s163-evidence.mjs`
(node ≥ 23.6, the S162 precedent).

**Docs lockstep (as executed):** the README badge/census (2272 → 2282)
+ the count prose sites + the Session-163 row; the AGENTS census (1648
→ 1657) + the e2e map (624 → 625) + the S163 lessons block (three
lessons); the CLAUDE counts (1657 + 625); PAD v1.3.71 (the revision
block); the SKILL census (both sites re-anchored to 2282/1657/625);
the vitest header re-anchor (+9); the cert runner re-tag (624 → 625,
chunk 1 154 → 155 — machine-pinned by the script-conventions leg);
`docs/session_199.md` (the cycle log); the worklog Session-174 entry;
this §9; the `.env.example` contract re-verified (no env-var reads
changed this cycle — .env and .env.example remain byte-identical at
the documented dev posture).

## §10 The execution checklist

- [x] RED: the DL1 unit pair set (+4 legs) — the resolve trio REDs on
      the pre-fix refresh-leg rejection (3 failed | 1 passed)
- [x] RED: the DL3 helper set (+5 legs) — the missing-export marker
- [x] RED: the DL1 e2e leg — proven against the pre-fix standalone
      build (the success toast never fired pre-fix)
- [x] GREEN: DL1 — the three contained catches in data.ts
- [x] GREEN: DL2 — the aria contract on the exams gate
- [x] GREEN: DL3 — the parseExamTopics export + the two view sites +
      the import merge
- [x] Gates: lint ✓ · tsc ✓ · unit 1657/1657 (+9) · build ✓ · the
      5-chunk cold cert 625/625 (chunk 1 +1) · the re-confirmation
      (preflight / drawer 87th / parity MATCH)
- [x] Evidence: `docs/screenshots/163-clone-*.png` (the standing
      desktop + the mobile drawer + the cycle's Exams surface),
      self-verifying (ok:true · dimensions · md5s · the non-blank
      pixel ratios)
- [x] Docs lockstep: README badge/census + the Session-163 row ·
      AGENTS census + the e2e map + the S163 lessons block · CLAUDE
      counts · PAD v1.3.71 · the SKILL census · the vitest header
      (+9) · the cert runner re-tag (624 → 625, chunk 1 154 → 155) ·
      `docs/session_199.md` · the worklog Session-174 entry · this
      plan §9 · the `.env.example` contract re-verified (no env-var
      reads change — byte-identical stands)
- [ ] Commit (Conventional Commit, main only) + push via the SSH
      wrapper; the operator key shredded after use

# Session 199 — the S163 cycle (Batch DL)

The workspace was WARM at `b025e7e` on `main` (the S162/Batch DK fix
`9a2da4d` + the operator's session_198 transcript commit). `git pull`
verified up-to-date (the pull itself delivered session_198.md, 97
lines, docs-only); the environment was verified from the prior
session's quickstart state: `.env` byte-identical to `.env.example` at
the documented dev posture (`DATABASE_URL="file:../db/custom.db"`),
the repo-root `db/custom.db` (392 KB) + `db/e2e.db` present, bun
1.3.14, node v24.22.2 (node_modules pre-installed).

Cold baseline (before any work): lint ✓ · tsc ✓ · the full Vitest run
**1648/1648 (51 files — the documented S162 final state exactly)** ·
the dev daemon booted with the S9/S31 stale-cache remedy (`rm -rf
.next/dev` before boot, through the reaper-proof python double-fork
launcher `scripts/launch-dev-s163.py` — the S110/AGENTS.md lesson
applied; `[boot] studyflow up — node_env=development
db=file:/home/z/my-project/omni-study1/db/custom.db`) · the preflight
GREEN (hydrated, navigation-stable) · the drawer check GREEN (**the
86th consecutive no-Tailwind-v4-mobile-nav-bug confirmation** —
backdrop oklab(0 0 0 / 0.2) + blur(4px); 288px white panel; 20 links;
no footer; Escape-close superset) · the desktop chrome probe **MATCH**
(all five formal checks, live reference login — sidebar-outer 260 / 20
links / first-links / mainX 260 / mainWidth 1180, the S142
outer-footprint probe). Baseline noise: none. The config posture
re-validated for the operator's standing ask: the vitest include
matches `src/**/*.test.ts` + `tests/**/*.test.ts` only; the playwright
testDir is `tests/e2e` with the production-build webServer on
`db/e2e.db`; tsconfig excludes `skills`; eslint ignores `skills` — the
repo-included `skills/` folder is excluded from code checking,
testing, and compilation on every axis.

The audits (Mode-C; every M/L finding re-verified by direct read by the
orchestrator):

- **Audit A — the Batch DK recent-changes axis** (the `9a2da4d` diff;
  `108956e`/`b025e7e` docs-only): **0C / 0H / 0M / 0L / 0I — clean.**
  All six DK claims verified DELIVERED at the source anchors: DK1's
  three contained catches (`fetchAndSet("events").catch(() =>
  undefined)` at data.ts:642/646/650 with the CB8 doctrine comment
  block); DK2's REPEATS import (events-view.tsx:54) + the SelectItems
  render from it (:529); DK3's four `referenceWeekNumber` doc-site
  reconciliations (date.ts, date.test.ts, AGENTS.md's Events entry,
  SKILL.md's Events entry); DK4's three loading-gate aria contracts
  (events-view.tsx:340, calendar-view.tsx:236 + :428); DK5's promoted
  `src/lib/events.ts` seam with tests/events.test.ts (10 legs); DK6's
  calendar pre-warm drop (view-collections.ts:29 — exactly five keys)
  — and the doc census chain machine-verified (README badge 2272 ✓ ·
  AGENTS 1648 + the 624 e2e map ✓ · CLAUDE 1648 ✓ · PAD v1.3.70 ✓ ·
  the SKILL census 2272 ✓ · the vitest header 51/1648 ✓ · the cert
  runner re-tag 624 ✓) — zero stale count sites.

- **Audit B — the exams family** (the rotation's fresh axis — the S162
  close's own "Next cycle" list NAMED this axis: "the family-wide CB8
  port (exams/assignments/timetable/notes/flashcards/tasks share the
  M-1 shape — each family gets its own rotation-axis audit + pin set,
  the events pin set is the template)" — the exams family FIRST in the
  recorded order; the family's point-fixes rode S161/DJ3 [EXAM_TYPES]
  but the family was never deep-swept as an axis). The axis read
  dispatched to a read-only subagent against the web-application
  skill's §4/§9/§12/§13/§16/§17 rubric: exams-view.tsx + the exams API
  routes (the delegate factory + the withUser/withUserParams wrappers)
  + the seams they consume (validation.ts's examSchema + EXAM_TYPES,
  the exams mutations in data.ts, view-collections.ts, date.ts) + the
  round-trip verification against the route/factory wire contracts.

  **Verdict: 0C / 0H / 1M / 1L / 3I.** The family remains in good
  shape (ownership in the WHERE clause by construction — the delegate
  factory scopes every query; Zod at both boundaries with the
  sentKeysPatch PATCH shape; the BX3 datetime round-trip pair; the
  600/15-min write budget; `take: 500` bounded reads with the
  composite index; zero `useEffect`; zero `space-y/x` containers;
  icon-only buttons carry aria-labels; the grid is `role="group"`;
  the error box is `role="alert"`; EXAM_TYPES single-sourced with the
  census guard). The findings (each re-verified by direct read):

  - **M-1 (M — Verified by direct read, the full chain):** the exams
    mutations REJECT on the refresh leg after a COMMITTED write —
    `createExam`/`updateExam`/`deleteExam` are `await apiSend(...)`
    then `await fetchAndSet("exams")` (data.ts:614-625), and
    `fetchAndSet` rejects when its GET fails (the CD2 20 s deadline).
    The view's catch then shows "Something went wrong." in the
    STILL-OPEN dialog (exams-view.tsx:229), fires NO success toast,
    and keeps the form armed — a RETRY re-POSTs and creates a
    DUPLICATE exam: the CB8 letter violated, the EXACT shape the
    S162/DK1 fix closed for events (the fixed events twin sits eleven
    lines below at data.ts:640-651; the audits' 51-site
    `fetchAndSet` census: 48 unfixed sites, this cycle closes 3).
    **Rode DL1.**
  - **L-1 (L — Verified by direct read):** the exams loading gate
    (exams-view.tsx:301-304, the CE3 idiom) renders the aria-hidden
    `Spinner` inside an unlabeled div — zero `role="status"`
    occurrences in the view; the S162/DK4 pattern (events + calendar +
    calculator) unapplied to the fourth view. **Rode DL2.**
  - **I-1 (I — Verified by direct read):** the topics safe-parse twin
    — byte-identical blocks in `openEdit` (exams-view.tsx:160-166) and
    the card render (:325-331) — the duplication class the S151/CZ1
    fix removed for notes (`parseNoteTags` promoted to data.ts); plus
    a duplicated `@/lib/date` import pair (lines 44 + 47). **Rode
    DL3.**

  I-2–I-3 informational: the unchecked `as` cast on `form.type` with
  the free-string Prisma column (no live vector — the API boundary,
  the import door, and the seed all enforce the EXAM_TYPES vocabulary;
  DECLINED at the plan §8); the per-card `subjects.find` +
  per-comparison `new Date()` micro-perf (negligible under `take:
  500`; DECLINED at the plan §8).

  **Point 8 (the client ↔ store ↔ api round-trip verdict): COMPATIBLE,
  no field drift** — the view's payload sends exactly the 7 examSchema
  keys 1:1; the duration clamp mirrors the schema atom (5..600); the
  `subjectId: ""` → `nullableId` → null boundary; the BX3 zone-safe
  edit round-trip; the store's ExamRow mirrors the Prisma Exam model;
  `OWNED_FKS.exam = { subjectId → subject }` pinned by
  tests/owned-fks.test.ts. The M-1 gap is error-path plumbing, not
  shape drift.

The plan (`docs/remediation-plan-session163.md`) written BEFORE any
source change and validated against the codebase (the CZ1 mock shape
for the DL1 unit legs, the examSchema fixture keys, the dialog surface
for the DL1 e2e leg [the "Add Exam" trigger, `#exam-title` +
`#exam-date`, the "Add exam" submit, the "Exam added." toast], the
parseNoteTags placement for the DL3 promotion, the chunk-1 home of the
parity-session8 spec for the e2e leg).

**The RED inventory (as it ran): the unit REDs on their designed
markers** — the DL1 resolve trio RED on the pre-fix refresh-leg
rejection (3 failed | 1 passed: the failed-write guard
green-on-arrival, exactly the DK1 shape); the DL3 suite RED on the
missing export (`TypeError: parseExamTopics is not a function` — the
runtime form of the missing-module marker, 5 legs). **The e2e RED:
proven against the pre-fix standalone build** (the compile-blocking
unit RED file set aside for the pre-fix build — `git checkout` + the
/tmp copy restored after — then the build + the leg run): the DL1 leg
failed on the absent success toast (`getByText('Exam added.')` —
element(s) not found; the pre-fix mutation rejected on the aborted
refresh).

**The S163 fixes:**

- **DL1 — the exams mutation CB8 split (the M-1 close; the
  family-wide port's first family).** The three exams mutations contain
  the refresh rejection at the seam (`await fetchAndSet("exams")
  .catch(() => undefined)` — the DK1/DJ5 doctrine comment ported
  verbatim): the WRITE leg keeps rejecting honestly (the view's dialog
  catch still sees real save failures); a committed write + a failed
  refresh RESOLVES (the "Exam added."/"Exam updated."/"Exam deleted."
  toast + the dialog close proceed; the stale slice self-heals through
  the S16 view-switch pre-warm + the next mutation's own refresh).
  Unit pins: the data-store pair set (+4 — the CZ1 mock shape: the
  resolve trio + the failed-write-still-rejects guard). E2e pin: the
  CB8-twin network-mock — the POST continues, the GET aborts, a
  committed create answers the success toast + the closed dialog.
- **DL2 — the exams loading gate gains the aria contract (the L-1
  close).** `role="status"` + `aria-label="Loading exams"` on the CE3
  gate (the DK4 precedent shape). Rides the diff review (the
  calculator precedent's own gate carries no pin).
- **DL3 — the parseExamTopics promotion EXECUTED (the I-1 close).**
  The topics safe-parse block moved VERBATIM from the two exams-view
  sites to `src/lib/data.ts` beside `parseNoteTags` (the S151/CZ1
  precedent) — the helper preserves the TWINS' semantics exactly
  (every string passes; NO `t.length > 0` guard — parseNoteTags'
  length guard is the NOTES twins' semantics, deliberately different,
  documented in the helper's doc comment; the `raw || "[]"` guard is
  behavior-identical to the twins' catch path). Both view sites consume
  the single source; the duplicated `@/lib/date` import pair merges.
  Unit pins: the 5-leg set (valid-array / mixed-array-filter [keeps
  "also-ok" — a length-guard regression would fail it] / non-array /
  invalid-JSON / empty-string).

**The remediated-tree re-confirmation:** the daemon restart applied the
documented S9/S31 stale-Turbopack remedy → preflight GREEN · the drawer
check GREEN (**the 87th consecutive**) · the desktop parity probe
**MATCH** (all five checks, live reference login).

**Gates.** lint ✓ · tsc ✓ · unit **1657/1657** (51 files, +9 exactly
as designed: data-store +9 — the DL1 pair set ×4 + the DL3 helper set
×5) · build ✓ · the full touched spec file 70/71 (the BZ3 notebooks
popover leg flaked once on the documented P1008 machine-load class —
passes in isolation in 6.9 s; the cert's own chunk-1 run of the same
spec passed clean; my diff touches nothing in that surface) · the
5-chunk cold cert: chunk 1 **155/155** (+1, the DL1 leg) · chunk 2
**192/192** · chunk 3 **94/94** · chunk 4 **95/95** · chunk 5
**89/89** — **the cert tally 625/625** (the e2e census 624 → 625) =
**census 2282 green** (was 2272; 1657 unit + 625 e2e).

**Evidence.** The `docs/screenshots/163-clone-*.png` frames (the
standing desktop + the mobile drawer [the 87th drawer-GREEN companion]
+ the cycle's Exams surface — the seeded cards with their topic chips,
the DL3 promoted seam's render path), self-verifying (ok: true;
dimensions machine-checked; md5s distinct; the non-blank pixel ratios
verified: 45.9% / 34.5% / 58.3%), captured by
`scripts/capture-s163-evidence.mjs` (the S162 precedent, node ≥ 23.6).

**Docs.** README badge/census (2272 → 2282) + the count prose sites +
the Session-163 row; AGENTS census (1648 → 1657; the e2e map 624 →
625) + the S163 lessons block (three lessons: the family-port's proof
port; the promoted helper's semantics-from-the-twins rule; the P1008
flake triage order); CLAUDE counts (1648 → 1657, 624 → 625); PAD
v1.3.71 (the revision block); the SKILL census (both sites); the
vitest header re-anchor (+9); the cert runner's re-tag (624 → 625,
chunk 1 154 → 155 — machine-pinned by the script-conventions leg);
`docs/session_199.md` (this log); the worklog Session-174 entry; the
plan §9 as-executed close; the `.env.example` contract re-verified (no
env-var reads changed this cycle — .env and .env.example remain
byte-identical at the documented dev posture).

**Next cycle:** the rotation continues — the recorded deferrals: the
family-wide CB8 port's REMAINING families (assignments/timetable/
notes/flashcards/tasks + the subject/taskList/notebook/deck/
studyGroup/practiceTest seams — each family gets its own
rotation-axis audit + pin set; the events and exams pin sets are the
templates); the files refresh-failure toast copy harmonization (the
F-8 candidate); the S160 close's ledger (the A-M3 stage-2 triggers;
the update-side raw-SQL bulk upsert; the I-4 parse posture; the M-1
LLM-side residual); the gradetracker/studygroups/settings-CRUD and
AlertDialog-confirm e2e gaps.

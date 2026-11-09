# Session 201 — the S164 cycle (Batch DM)

The workspace was FRESH-CLONED at `9729ea4` on `main` — the prior
session's S164 attempt was fully green (DM1-DM4 applied, docs lockstep
done, cert chunks 1/2/5 clean) when the tool infrastructure failed and
the sandbox reset BEFORE the commit; the workspace came back empty, so
this cycle RE-EXECUTED the same plan from a fresh clone (the S164
lesson-3: the plan document is the checkpoint — nothing was trusted
from the lost session's claims, every RED was re-derived fresh).
Environment rebuilt from scratch: `bun install` (510 packages), the
repo-root `db/` re-created, `prisma db push` + `db:seed` re-run (demo
account ready), `.env` copied byte-identical from `.env.example` at the
documented dev posture (`DATABASE_URL="file:../db/custom.db"`), the
playwright chromium re-provisioned (1243).

Cold baseline (before any work): lint ✓ · tsc ✓ · the full Vitest run
**1657/1657 (51 files — the documented S163 final state exactly)**.
Baseline noise: none. The config posture re-validated for the
operator's standing ask: the vitest include matches
`src/**/*.test.ts` + `tests/**/*.test.ts` only; the playwright testDir
is `tests/e2e` with the production-build webServer on `db/e2e.db`;
tsconfig excludes `skills`; eslint ignores `skills` — the repo-included
`skills/` folder is excluded from code checking, testing, and
compilation on every axis.

The audits (Mode-C; every H/L finding re-verified by direct read):

- **A — the Batch DL recent-changes axis** (`b66d4a1` fix;
  `b025e7e`/`69a6e83`/`9729ea4` docs-only): **0C / 0H / 0M / 0L / 0I —
  clean.** All three DL claims verified at the source anchors (the
  three contained catches at data.ts:647/651/655 + the pair set; the
  DL2 aria gate at exams-view.tsx:297-308; the DL3 promoted
  parseExamTopics seam + its pin set) — and the doc census chain
  machine-verified (README badge 2282 ✓ · AGENTS 1657 + the 625 e2e
  map ✓ · CLAUDE 1657 ✓ · PAD v1.3.71 ✓ · the SKILL census 2282 ✓ ·
  the vitest header 51/1657 ✓ · the cert runner re-tag 625 ✓) — zero
  stale count sites.

- **B — the assignments family** (the rotation's fresh axis — the S163
  close's own "Next cycle" list NAMED this axis; the family's
  point-fixes rode S127/CB2 + CB9, S123/BX9, S130/CE3, S134/CI7d +
  S161/DJ5, S152/DA1-2 — but the family was never deep-swept as an
  axis): **0C / 1H / 0M / 2L / 1I.** The family coherent (ownership in
  the WHERE clause by construction; Zod at both boundaries with the
  sentKeysPatch PATCH shape; the BX9 string-progress state; the
  CI7d/DJ5 rollback resync; the DA1/DA2 latch + hand-guard; the CB2
  local-noon round-trip; the CB9 single-sourced TYPES; take:500
  bounded reads; zero useEffect; zero space-y/x; aria-labels on the
  icon-only controls). The findings: **H-1** the assignments mutations
  rejected on the refresh leg after a COMMITTED write — a flaky
  refresh GET showed "Something went wrong." in the still-open dialog,
  no success toast, the form armed: a RETRY duplicated the assignment
  (and the slider's onValueCommit leg routes through the same
  updateAssignment — the false failure fired on the family's MOST-used
  control); **L-1** the loading gate carried no aria contract (the
  DK4/DL2 precedent family reached events/calendar/exams but not
  assignments); **L-2** the PRIORITIES local 4-value twin beside
  validation.ts's ASSIGNMENT_PRIORITIES single source — value-equal,
  the ALIASED-twin form the DJ3 census's four same-named sites never
  guarded; **I-1** the Delete DropdownMenuItem's `onClick` beside the
  Edit sibling's `onSelect` — no live driver, declined at the plan §8
  (the surgical-diff doctrine).

- **C — the mid-cycle discovery (DM4):** the S161/DJ5 e2e leg's route
  glob `**/api/assignments*` never matched the per-id PATCH
  (Playwright's glob `*` does NOT cross `/`) — the leg's designed
  PATCH-abort never fired, and the leg had been green by pinning the
  CB8 false-failure (committed PATCH + failed refresh) as correct
  behavior. The DM1 split exposed it mechanically (the committed write
  + contained refresh answers NO toast — the leg failed 3/3), and the
  bisect pair (fails on the DM1 build, passes on the pre-DM1 rebuild)
  located the dishonesty in the TEST, not the fix.

Fixed TDD-first — every RED re-derived fresh this session (the unit
REDs on their designed markers: the DM1 resolve trio ×3 RED + the
failed-write guard green-on-arrival, the DM3 import leg RED + the
no-local-twin leg green-on-arrival; the DM1 e2e leg RED-proven against
a rebuilt pre-fix standalone — the "Assignment added." toast never
fired, failing exactly at the designed assertion):

- **DM1** the assignments mutation CB8 split (the three mutations
  contain the refresh rejection at the seam —
  `fetchAndSet("assignments").catch(() => undefined)`, the DK1/DL1
  doctrine comment re-tagged; the WRITE leg keeps rejecting honestly;
  the stale slice self-heals through the S16 pre-warm + the next
  mutation's refresh; unit +4 the CZ1 pair set, e2e +1 the CB8-twin
  network-mock leg in parity-session9 — the POST continues, the
  collection GET aborts, the success toast + the closed dialog).
- **DM2** the assignments loading gate gains `role="status"` +
  `aria-label="Loading assignments"` (the DL2 precedent shape, rides
  the diff review).
- **DM3** the PRIORITIES single-source alias (the local twin becomes
  `const PRIORITIES = ASSIGNMENT_PRIORITIES;` — the TYPES-at-:70
  shape; the DJ3 census gains its FIFTH site; unit +2 the pair).
- **DM4** the DJ5 leg's route glob `**/api/assignments*` →
  `**/api/assignments**` (route + finally unroute + the corrected
  comment) — count-neutral, the test-honesty fix.

The e2e DM4 bisect pair was executed as designed: the DJ5 leg fails
3/3 on the DM1 build with the OLD glob (no toast — the honest new
behavior), passes with the corrected glob (the PATCH genuinely aborts
→ the toast fires → zero pageerrors). The latent single-star sweep
found the two other usages benign (CG5's handler-side pathname
discrimination with no per-id requests in its window; the tasks leg
deliberately holds only the collection GET while the per-id PATCHes
pass).

Gates. lint ✓ · tsc ✓ · unit **1663/1663** (51 files, +6 exactly as
designed: data-store +4, enum-single-source +2) · build ✓ (the
"Ecmascript file had an error" lines verified PRE-EXISTING on the
pre-fix tree — toolchain noise, not the diff) · the full touched spec
files: parity-session9 **38/38** (+1, the DM1 leg) · resilience
**42/43** (the S120/BU1 files-view Rename-prefill leg — the documented
P1008 machine-load class, passing 2.1 s cold in isolation; my diff
touches nothing in the files surface) · the 5-chunk cold cert
(as-executed, see §9 of the plan).

Evidence. The `docs/screenshots/164-clone-*.png` frames (the standing
desktop + the mobile drawer [the drawer-GREEN companion] + the cycle's
Assignments surface — the seeded rows with their priority pills + the
DM3 alias's render path), captured by `scripts/capture-s164-evidence.mjs`
(the S163 precedent).

Docs. README badge/census (2282 → 2289) + the count prose sites + the
Session-164 row; AGENTS census + the e2e map re-tag + the S164 lessons
block (three lessons: the route-glob-is-part-of-the-proof lesson; the
aliased-twin census blind-spot lesson; the sandbox-reset recovery
lesson); CLAUDE counts (1663 + 626); PAD v1.3.72 (the revision block);
the SKILL census (all sites); the vitest header re-anchor (+6); the
cert runner re-tag (both scripts, 625 → 626, chunk 2 192 → 193,
machine-pinned by the script-conventions leg); this log; the worklog
Session-175 entry; the plan §9 as-executed close; the `.env.example`
contract re-verified (no env-var reads changed this cycle — .env and
.env.example byte-identical at the documented dev posture).

Next cycle. The rotation continues — the recorded deferrals: the
family-wide CB8 port's REMAINING families (timetable/notes/flashcards/
tasks + the subject/taskList/notebook/deck/studyGroup/practiceTest
seams — each family gets its own rotation-axis audit + pin set; the
events/exams/assignments pin sets are the templates); the files
refresh-failure toast copy harmonization (the F-8 candidate); the
S160 close's ledger (the A-M3 stage-2 triggers; the update-side raw-SQL
bulk upsert; the I-4 parse posture; the M-1 LLM-side residual); the
gradetracker/studygroups/settings-CRUD and AlertDialog-confirm e2e
gaps.

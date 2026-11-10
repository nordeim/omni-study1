# Remediation Plan — Session 168 (Cycle 118, Batch DR)

> Status: PLANNED (pre-change record — the immutable plan; the as-executed
> close lives in §8). Written before any source change, per the standing
> doctrine ("write the cycle plan into docs/remediation-plan-sessionN.md
> BEFORE any source change").
>
> Operator directive: refresh the workspace, re-read the doc chain
> (AGENTS/CLAUDE/README/PAD/SKILL + session_206 +
> remediation-plan-session167 + worklog + session_207), validate against
> the codebase, audit with the repo-included skills
> (skills/web-application/SKILL.md the primary; the skills catalog for the
> rotation), iterate toward visual/functional parity with
> omni-study1.base44.app (live reference login, mobile-nav attention, the
> Tailwind v4 bug watch), keep `.env` at
> `DATABASE_URL="file:../db/custom.db"` + the repo-root `db/`, validate the
> vitest/playwright suites, remediate TDD-first, capture evidence frames,
> update the doc chain, push via the SSH wrapper. The repo's `skills/`
> folder stays excluded from code checking, testing, and compilation.
> Proceed with best judgement on the remaining open questions (the
> operator's standing instruction).
>
> Session note: this cycle continues the rotation from the S167/Batch DQ
> close (`8d25d9a` pushed + remote-verified; `bdf0352` ticked the plan's
> final checklist item; `848c0bf` committed the operator's session_207
> transcript). The workspace was COLD — a fresh `git clone` at `848c0bf`
> on `main`; the environment REBUILT from scratch (`bun install` 510
> packages, the repo-root `db/` recreated by `db:push` + `db:seed` with
> the demo account re-seeded, `.env` copied from `.env.example` and
> byte-identical at the documented dev posture, the Playwright chromium
> v1243 cache reinstalled — the fresh clone's bundled playwright wanted
> build 1243, the machine cache carried only 1200). Every surface below
> was verified by direct read in THIS session before this plan was
> written.

## §0 Scope, method, cold baseline, live parity

**Workspace (cold — a fresh `git clone` at `848c0bf` on `main`; the
S167/Batch DQ fix `8d25d9a` + the plan-tick `bdf0352` + the operator's
session_207 transcript `848c0bf` all pulled in the clone; the environment
rebuilt: node_modules installed, the repo-root `db/` carrying custom.db,
`.env` copied from `.env.example` — byte-identical at the documented dev
posture `DATABASE_URL="file:../db/custom.db"`, the standalone production
build compiled, the dev daemon answering 200 on :3000/login).**

Cold baseline (before any work): lint ✓ · tsc ✓ · the full Vitest run
**1686/1686 (51 files — the documented S167 final state exactly)** ·
dev-server preflight GREEN · **the drawer check GREEN (the 96th
consecutive** no-Tailwind-v4-mobile-nav-bug confirmation — backdrop
oklab(0 0 0 / 0.2)+blur(4px) match, 288px white panel, 20 links both
hosts, no footer, Escape-close superset) · the desktop parity probe
**MATCH** (all five formal checks — sidebar shell 260, nav-link count 20,
first-links sequence, mainX 260, mainWidth 1180; live reference login
through the s142 formal probe). Baseline noise: none. The config posture
re-validated for the operator's standing ask: the vitest include matches
`src/**/*.test.ts` + `tests/**/*.test.ts` only; the playwright testDir is
`tests/e2e` with the production-build webServer on `db/e2e.db`; tsconfig
excludes `skills`; eslint ignores `skills` — the repo-included `skills/`
folder is excluded from code checking, testing, and compilation on every
axis.

## §1 The audits (Mode-C; every H/L finding re-verified by direct read by the orchestrator)

### Audit A — the Batch DQ recent-changes axis (the `8d25d9a` fix commit; `bdf0352`/`848c0bf` docs-only): **0C / 0H / 0M / 0L / 0I — clean.**

All three DQ claims verified at the source anchors: **DQ1** — the six
contained catches at data.ts:813-860 (the deck trio + the card trio, the
doctrine comment re-tagged S167/DQ1, the sixth family — the
deleteFlashcardDeck double refresh catches BOTH legs); **DQ2** —
`role="status"` + `aria-label="Loading decks"` on the deck-list pane gate
(flashcards-view.tsx:521) + `role="status"` + `aria-label="Loading deck
details"` on the deck-detail pane gate (:676); the test anchors — the DQ1
unit pair set (data-store.test.ts:965-1023, seven legs) + the DQ1 e2e leg
(parity-session8.spec.ts:1844). The doc census chain machine-verified
consistent at 1686 + 630 = 2316: README badge `2316 green` + the
Session-167 row; AGENTS 1686 + 630 + the S167 lessons block; CLAUDE 1686
+ 630; PAD v1.3.75; SKILL (all four sites); the vitest header
(vitest.config.ts:4, re-anchored S167/DQ); the cert runner re-tag (both
scripts: 630, chunk 1 156 — machine-pinned by the script-conventions
tripwire at tests/script-conventions.test.ts:178). The commit diff is
surgical (no skills/ files touched). The root scratch sweep: clean (no
`cert-s167.log` left behind — the S167 lesson held; the only root log is
the gitignored `dev.log`).

### Audit B — the tasks family (the rotation's fresh axis: the S167 close's own "Next cycle" list NAMED this axis — "tasks is NEXT in the S165 close's recorded order"; the family's point-fixes rode S6-A/S8-F/S9-C/D/Q (the measured chrome: the standalone bordered card rows, the switch-style dialog toggles that are BUTTONS, the reference field set), S76/AC8 (the task pill is ALWAYS the date form — measured), S79/AF2+AF2b (the aside opens with no heading; the h1 band survival), S80/AG5+AG7 (the sf-aside-active utility; the header wrap shape), S121/BV7 (the owned-FK guards — the actionable 404s on foreign/nonexistent subjectId/listId), S125-era/BX-family (the blank-title guard), S127/CB16 (the per-id toggle chain — the BX10 stale-base kill), S128/CC5 (the chain-map eviction), S134/CI4 (the MyDay quick-add in-flight guard), S149/CX1 (the sibling myDay/important chains), S136/CK4 (the MyDay loading branch) — but the family was never deep-swept as a CB8 axis). The axis read against the web-application skill's §4/§7/§8/§9/§13/§16/§17 rubric: tasks-view.tsx (791 lines, the family's primary surface — it also OWNS the TaskRowCard + TaskDialog patterns MyDay consumes) + myday-view.tsx / dashboard-view.tsx / calendar-view.tsx (the sibling consumers — toggle/create/update/delete rides the SAME seam) + the tasks API routes (the delegate factory) + the seams they consume (validation.ts's taskSchema :256-268, the six mutations in data.ts:514-587, the taskDelegate at entities.ts:457 via makeOwnedDelegate with OWNED_FKS.task, the PATHS map :44) + the round-trip verification against the route/factory wire contracts. **Verdict: 0C / 1H / 0M / 1L / 0I.**

The family is coherent on every other axis (re-verified by direct read):

- **Ownership** — in the WHERE clause by construction (the delegate
  factory: taskDelegate via makeOwnedDelegate with OWNED_FKS.task; the
  owned-FK guards e2e-pinned by the BV7 legs — the actionable 404 copy on
  foreign/nonexistent subjectId/listId).
- **Zod at both boundaries** — the route factory parses with the
  delegate's schemas (boundedTitle, notes ≤ 5000, nullableId ×2, the
  enum'd priority/repeat with defaults, the optional booleans, jsonArray
  subtasks; updateSchema = taskSchema.partial()).
- **The toggle chains** — the CB16 per-id chain + the CX1 sibling
  extension + the CC5 eviction: every toggle re-reads the store AFTER the
  previous settle (the BX10 stale-base kill), and the chain entry never
  poisons the map on rejection.
- **The quick-add guard** — the CI4 in-flight busy guard stands the
  second Enter down (e2e-pinned).
- **The blank-title guard** — the CH8 whitespace-only 400 (e2e-pinned).
- **The delete parity posture** — Tasks itself is INSTANT-delete BY
  PARITY (the S120 reference measurement: the reference confirms no task
  delete); MyDay's confirm dialog is the clone's documented superset
  choice.
- **The a11y surface** — labeled controls throughout (the per-row
  aria-labels — toggle My Day/important/task menu, the per-subtask
  toggles, the PriorityCheckbox label, the Search tasks input, the Filter
  tasks button, the Task views aside, the Tasks header/rows groups), the
  focus-visible rings, the aside's aria-pressed rows.
- **The chrome** — the measured AC8 pill form, the AF2/AG5/AG7 band
  shapes, all e2e-pinned by the parity-session6 legs (chunk 2).

The findings:

- **H-1 (DR1)** — the tasks family mutations reject on the refresh leg
  after a COMMITTED write (data.ts:514-587, the pre-CB8 shape): all SIX
  mutations ride the uncaught `await fetchAndSet("tasks")` — createTask
  (:514-517), updateTask (:518-521), toggleTask (:529-551 — the refresh
  INSIDE the chained closure, so a flaky refresh rejects `await chained`
  and the caller's catch fires), toggleTaskMyDay (:552-571), 
  toggleTaskImportant (:572-590), and deleteTask (:584-587) — and
  fetchAndSet REJECTS when its GET fails (the CD2 20 s deadline). A write
  that COMMITTED server-side followed by a flaky refresh rejected the
  WHOLE mutation. The failure surfaces then LIE on committed rows: the
  TaskDialog submit catch (tasks-view.tsx:299-300) toasts "Could not
  save the task." with the dialog STILL OPEN and the form armed (a RETRY
  re-POSTs and DUPLICATES the task — the myday quick-add catch :117-119
  the same shape); the row-action catches (tasks-view :528-541, myday
  :90-97/:340/:370, dashboard :155, calendar :460-464) toast "Could not
  update the task." / "Could not delete the task." after the toggle or
  the delete already COMMITTED (the CB8 letter: a false
  mutation-failure claim on a committed row — the exact shape the
  S162/DK1, S163/DL1, S164/DM1, S165/DN1, S166/DP1, and S167/DQ1 audits
  found and fixed on the events/exams/assignments/timetable/notes/
  flashcards families; the recorded family-wide port's SEVENTH family).
- **L-1 (DR2)** — the tasks loading gate carries no aria contract
  (tasks-view.tsx:705-708): the list-pane gate renders `<Spinner>` inside
  an unlabeled div with no `role="status"` (the DM2 assignments / DL2
  exams / DK4 events-calendar / DN2 timetable / DP2 notes / DQ2
  flashcards precedent closed this on every prior CB8-ported family — the
  Spinner is aria-hidden, so the in-flight window is silent to assistive
  tech; the gate IS live at list level [the `loading && tasks.length ===
  0` shape], and the S166 gate census counted tasks ×1 in the unannounced
  remainder — this cycle closes it inside the CB8-ported family set, as
  each prior CB8-family cycle did its own gates).

### Audit C — the standing gates re-verified this session (no new findings)

The drawer check (the 96th consecutive GREEN), the desktop parity probe
(MATCH, live reference login — the s142 formal probe), the dev-server
preflight (GREEN). The `skills/` exclusion posture re-verified (tsconfig
excludes, eslint ignores, the vitest include). The `.env` /
`.env.example` contract re-verified byte-identical at the documented dev
posture.

## §2 DR1 — the tasks family mutation CB8 split (the H-1 close)

The DK1/DL1/DM1/DN1/DP1/DQ1 doctrine ported verbatim to the seventh
family of the recorded family-wide port. The fix is contained AT THE SEAM
(data.ts:514-587): each mutation's refresh leg gains
`.catch(() => undefined)` — the create/update/delete trio AND the three
chained toggles (the toggle refreshes sit INSIDE the chained closures;
each gains its own contained catch, so a flaky refresh neither rejects
`await chained` nor poisons the chain — the chain-map entry already
swallows via `stored`, the CALLER contract is what CB8 fixes). The WRITE
legs keep rejecting honestly (a failed PATCH still rejects through
`await chained`; a failed POST/DELETE still rejects at the mutation). The
stale slice self-heals on the next successful load (the S16 view-switch
pre-warm + the next mutation's own refresh — the DJ5 doctrine).

- **Unit (the DR1 pair set, tests/data-store.test.ts — the DQ1 pair set
  the template, appended after the DQ1 describe at :965-1023)**: seven
  legs — the resolve set (createTask/updateTask/toggleTask/
  toggleTaskMyDay/toggleTaskImportant/deleteTask: `apiSendMock` resolves
  + `apiGetMock` rejects → the mutation RESOLVES; RED pre-fix ×6 — the
  three toggle legs seed the store with the task row first, the CX1
  taskRow template, so the chain's store read finds its base) + the
  failed-write guard (createTask: `apiSendMock` rejects → the mutation
  REJECTS; green-on-arrival — the honest failure reaches the caller).
  The toggle legs use fresh unique ids (no cross-test chain-map residue;
  the CC5 eviction settles each entry anyway).
- **E2e (the DR1 CB8 leg, tests/e2e/tasks.spec.ts — the tasks family's
  spec home, appended after the CI4 describe at the file tail)**: hold
  `**/api/tasks` (collection-only — the glob ends at the collection URL,
  the per-id PATCH/DELETE URLs pass unrouted; the DM4/DN1/DP1/DQ1 lesson
  re-derived: the pattern's trailing boundary is part of the proof — and
  the CI4 leg in the same file already rides the same collection glob as
  a hold) with GET-abort/POST-continue discrimination; a committed task
  create through the TaskDialog (the POST 201 witnessed) + the aborted
  refresh must answer the "Task created" SUCCESS TOAST + the CLOSED
  dialog and NEVER the false "Could not save the task." error toast. RED
  pre-fix on the pre-fix build: the dialog stays open, the error toast
  fires, the success toast never lands. Zero residue via the finally
  DELETE (the CC4/AR3 convention; the per-id URL passes unrouted).

## §3 DR2 — the tasks loading gate gains the aria contract (the L-1 close)

- The LIST-pane gate (tasks-view.tsx:705-708) gains `role="status"` +
  `aria-label="Loading tasks"` + the S168/DR2 comment (the
  DM2/DL2/DK4/DN2/DP2/DQ2 precedent shape, rides the diff review).

No test (the DN2/DP2/DQ2 precedent: the aria contract rides the diff
review — the gate's in-flight window is not deterministically reachable
from Playwright against the seeded slice). No hue-tokens census re-anchor
needed: the tasks-view pinned sites (:115, the row-card hover border's
light + dark halves) sit ABOVE the gate's :705 region.

## §4 The RED inventory (as designed)

1. **DR1 unit resolve set** — data-store.test.ts, the DR1 pair set:
   RED ×6 pre-fix (the six mutations reject with "offline" on the
   committed-write + failed-refresh shape).
2. **DR1 unit failed-write guard** — green-on-arrival (the write leg
   rejects today and must keep rejecting).
3. **DR1 e2e leg** — tasks.spec.ts: RED on the pre-fix build at the
   designed marker (the "Task created" toast never becomes visible while
   the POST 201 was witnessed: the dialog stays open, the false "Could
   not save the task." toast rendered).

## §5 The GREEN implementations (as designed)

1. **DR1** — data.ts:514-587: the six contained catches (the three
   plain mutations + the three chained toggles' in-closure refreshes) +
   the doctrine comment (the DQ1 comment shape, re-tagged S168/DR1, the
   seventh family).
2. **DR2** — tasks-view.tsx:705-708: the gate's aria contract
   (`role="status"` + `aria-label="Loading tasks"`).

## §6 The gates (as designed)

- lint ✓ · tsc ✓.
- **Unit 1686 → 1693 (+7 exactly**: data-store +7 [the DR1 pair set]).
- Build ✓ (the standalone production build; the known "Ecmascript file
  had an error" toolchain noise is PRE-EXISTING — verified on the
  pre-fix tree by the S164 stash-build-unstash check, re-witnessed on
  this cycle's cold baseline build).
- The touched spec file: tasks.spec **+1 spec test** (the DR1 leg; the
  full-file run green with its setup legs — 12 listed legs + the DR1
  leg).
- The 5-chunk cold cert (the authoritative gate): **156 + 197 + 94 +
  95 + 89 = 631** (chunk 2 +1 — the DR1 leg rides a chunk-2 spec). The
  machine-pinned tripwire updated in lockstep
  (tests/script-conventions.test.ts: the Expected line 156 + 196 + 94 +
  95 + 89 = 630 → 156 + 197 + 94 + 95 + 89 = 631 + the S168/DR re-tag
  comment) + both cert runner scripts re-tagged
  (scripts/e2e-chunked-cert.sh's Expected header + the new
  scripts/launch-cert-s168.py wrapper).
- The drawer check re-run GREEN after the source changes (the 97th).
- The desktop parity probe re-run MATCH after the source changes.

## §7 The adjudications (the rejected/documented findings)

- **The tasks family is measured-reference territory** — the S6/S9/S76/
  S79/S80 chrome measurements were taken on the LIVE reference tasks
  surface; neither DR1 nor DR2 changes any reference-measured visual or
  behavioral surface (the CB8 split only changes behavior UNDER a failed
  refresh — a network-fault window the reference cannot be probed for
  deterministically; the aria gate adds assistive-tech announcements
  invisible to sighted parity). No reference probe this cycle — the DP
  lesson's "measure before adjudicating a superset surface" does not
  trigger: no divergence is suspected, none was found.
- **The MyDay sibling gates stay deferred** (myday ×3 in the S166 gate
  census — the myday-view's own loading gates, e.g. the CK4 outer gate
  at myday-view.tsx:196): the one-family-per-cycle doctrine the rotation
  has followed since S162 — the myday family gets its own rotation-axis
  cycle. The DR1 seam fix benefits MyDay's mutation calls today; the
  view's own gates are a separate family's ledger.
- **The remaining unported CB8 seams** (the
  subject/taskList/deck/studyGroup/practiceTest/grades/focusSessions/
  holidays families): the recorded rotation continues — the tasks port
  closes the LAST of the six view-mutation families the S165 close's
  order named ("notes/flashcards/tasks" — notes S166, flashcards S167,
  tasks S168); the eight remaining seams are the recorded next rotation.
- **The standing deferrals** (the S167 close's ledger): the files
  refresh-failure toast copy harmonization (the F-8 candidate); the S160
  close's ledger (the A-M3 stage-2 triggers; the update-side raw-SQL
  bulk upsert; the I-4 parse posture; the M-1 LLM-side residual); the
  gradetracker/studygroups/settings-CRUD and AlertDialog-confirm e2e
  gaps; the unannounced loading-gate families
  (focustimer/gradetracker/dashboard/myday/studygroups/practicetests/
  analytics/settings — the S166 gate census minus the flashcards ×2
  [S167] and the tasks ×1 [this cycle]).

## §8 The as-executed close

Executed as designed (the cold-workspace cycle — the environment
rebuilt from scratch; every surface re-verified by direct read before
the plan was written):

- **Workspace**: cold — a fresh `git clone` at `848c0bf` on `main`
  (the S167/Batch DQ fix `8d25d9a` + the plan-tick `bdf0352` + the
  operator's session_207 transcript `848c0bf`); the environment
  rebuilt (node_modules, the repo-root `db/` with custom.db,
  `.env` byte-identical to `.env.example` at the documented dev
  posture, the standalone build compiled, the Playwright chromium
  v1243 cache re-provisioned — the machine cache carried only 1200,
  the provisioning doctrine re-derived at the preflight gate).
- **Cold baseline**: lint ✓ · tsc ✓ · unit **1686/1686** (51 files —
  the documented S167 final state exactly) · preflight GREEN · the
  drawer check GREEN (the **96th** consecutive) · the desktop parity
  probe MATCH (live reference login — the s142 formal probe).
- **RED proofs (all on their designed markers)**: the DR1 unit resolve
  set RED (6 failed exactly — the pair `6 failed | 1 passed` with the
  failed-write guard green-on-arrival; the three toggle legs seeded
  the store rows first so the chains found their bases); the DR1 e2e
  leg RED against the pre-fix standalone — failing exactly at the
  designed assertion (the "Task created" toast never became visible
  while the POST 201 was witnessed: the dialog stayed open, the false
  "Could not save the task." fired).
- **GREEN**: DR1 (the six contained catches at data.ts:534-607 with
  the doctrine comment re-tagged S168/DR1, the seventh family — the
  three in-closure toggle refreshes each caught, so a flaky refresh
  neither rejects `await chained` nor poisons the CB16/CX1 chains),
  DR2 (`role="status"` + `aria-label="Loading tasks"` on the tasks
  list-pane gate). No hue-tokens census re-anchor (the tasks-view
  pinned sites :115 sit above the gate).
- **Gates**: lint ✓ · tsc ✓ · unit **1693/1693** (51 files, +7
  exactly as designed) · build ✓ · the full touched spec file:
  tasks.spec **13/13 on the first full-file run** (the 12 prior legs
  + the DR1 leg) · the 5-chunk cold cert: chunk 1 **156/156** ·
  chunk 2 **197/197** (+1, the DR1 leg; one socket-timeout signature
  logged, zero failures) · chunk 3 **94/94** cold · chunk 4 **95/95**
  cold · chunk 5 **89/89** — every chunk FIRST-PASS, zero triage
  needed — the cert tally **631/631** = **census 2324 green** (the
  e2e census 630 → 631) · the drawer check GREEN on the remediated
  tree (**the 97th consecutive** no-Tailwind-v4-mobile-nav-bug
  confirmation) · the desktop parity probe **MATCH** (all five
  formal checks, live reference login).
- **Evidence**: `docs/screenshots/168-clone-desktop.png` (not-pure-white
  45.87% — the live-clock surface; the S166/S167 pair measured
  45.93%, the sub-0.1pp delta is the header clock chip's pixels) ·
  `168-clone-mobile-drawer.png` (34.50% — byte-for-byte the S166/S167
  drawer ratio, the unchanged static surface) · `168-clone-tasks.png`
  (47.84% — the seeded task rows + the All Tasks/Important/My Lists
  aside + the search input + the Add Task button, the DR1/DR2
  surfaces) — captured by `scripts/capture-s168-evidence.mjs`,
  self-verifying (ok: true, md5s distinct) + the pixel-ratio
  verification. The capture script's first run tripped its own
  settled-anchor check (the aside's `uppercase` class is visual-only
  — textContent carries "My Lists" title-case); the anchor corrected,
  the frame captured clean.
- **Docs lockstep**: README badge/census (2316 → 2324) + the count
  prose sites + the Session-168 row; AGENTS census + the e2e map
  re-tag + the S168 lessons block (two lessons: grep the prior
  cycle's re-tag block before inserting yours — the cert script's
  block placement drifted across cycles and a head-assumed insert
  corrupted the merge, caught by the diff read-back before anything
  rode the tree; a fresh-clone cycle re-derives the chromium build
  before the standing gates — the preflight's browserType.launch
  failure is provisioning, not regression); CLAUDE counts (1693 +
  631); PAD v1.3.76 (the revision block); the SKILL census (all four
  sites); the vitest header re-anchor (+7); the cert runner re-tag
  (both scripts + the script-conventions tripwire — the CQ6/DA6
  count-claims gates verified GREEN after the re-anchor: 136/136);
  `docs/session_208.md`; the worklog Session-179 entry; this §8; the
  `.env.example` contract re-verified (no env-var reads changed this
  cycle — .env and .env.example byte-identical at the documented dev
  posture); the cert-s168.log scratch swept before the commit (the
  tracked artifact is the launcher script).
- **The mid-cycle doc-edit incident (recorded for the ledger)**: the
  first cert-script re-tag edit ASSUMED the newest re-tag block sat
  at the file head (the S166-era layout) and replaced the head line —
  but the S167 cycle had placed its block adjacent to the Expected
  header, so the edit produced an orphaned `# (S167/DQ re-tag …`
  header whose body was the S166/DP text (a corrupted merge). Caught
  by reading the diff back immediately; repaired to the surgical
  single-block insert adjacent to the Expected line (the S167
  precedent), `bash -n` verified, the tripwire chain then green. The
  lesson recorded in the AGENTS S168 block: the insertion contract is
  ADJACENCY, not position — grep the prior cycle's block first.

## §9 The execution checklist

- [x] DR1 unit pair set (data-store.test.ts) — RED set proven (6 failed exactly)
- [x] DR1 e2e leg (tasks.spec.ts) — RED on the pre-fix build (the designed marker)
- [x] DR1 GREEN (data.ts contained catches ×6, the seventh family)
- [x] DR2 GREEN (the tasks loading-gate aria contract)
- [x] Transition gates: lint · tsc · unit 1693/1693 · build
- [x] The touched spec file green (tasks.spec full-file run — 13/13 first run)
- [x] The 5-chunk cold cert 631/631 (every chunk first-pass — zero triage needed)
- [x] The drawer check (97th) + the desktop parity probe re-run (MATCH)
- [x] Evidence frames (docs/screenshots/168-clone-* — the standing desktop + mobile drawer + the cycle's Tasks surface, the DR1/DR2 surfaces)
- [x] Docs lockstep: README badge/census (2316 → 2324) + prose + the Session-168 row; AGENTS census + e2e map + the S168 lessons block; CLAUDE counts; PAD v1.3.76; the SKILL census; the vitest header (+7); the cert runner re-tag (both scripts + the script-conventions tripwire); docs/session_208.md; the worklog Session-179 entry; this §8; the `.env.example` contract re-verified
- [x] Commit to main + push via the SSH wrapper + remote verify (071a084 pushed + remote-verified: refs/heads/main @ 071a084 == local HEAD; the wrapper's default remote overridden with --remote git@github.com:nordeim/omni-study1.git — the S166 catch, re-checked at the dry-run gate)

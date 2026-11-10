# Remediation Plan — Session 170 (Cycle 120, Batch DT)

> Status: PLANNED (pre-change record — the immutable plan; the as-executed
> close lives in §8). Written before any source change, per the standing
> doctrine ("write the cycle plan into docs/remediation-plan-sessionN.md
> BEFORE any source change").
>
> Operator directive: refresh the workspace, re-read the doc chain
> (AGENTS/CLAUDE/README/PAD/SKILL + session_210 +
> remediation-plan-session169 + worklog + session_211), validate against the
> codebase, audit with the repo-included skills
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
> Session note: this cycle continues the rotation from the S169/Batch DS
> close (`2ed1512` pushed + remote-verified; `5699d1b` ticked the plan's
> final checklist item; `5d6258f` — pulled this session — committed the
> operator's session_211 raw transcript, docs-only). The workspace was COLD
> (a fresh `git clone` — node_modules re-derived, chromium re-derived at
> revision 1243 per the S103/S166 doctrine, `db/custom.db` re-pushed +
> re-seeded, `.env` re-created byte-identical to `.env.example` at the
> documented dev posture). Every surface below was verified by direct read
> in THIS session before this plan was written.

## §0 Scope, method, cold baseline, live parity

**Workspace (cold — `git clone` at `5d6258f` on `main`; the working tree
clean).** The `.env` re-created from `.env.example` (diff clean) at the
documented dev posture `DATABASE_URL="file:../db/custom.db"`; the repo-root
`db/` carries the freshly pushed + seeded custom.db. `bun install` ✓ (510
packages); `bunx playwright install chromium` ✓ (headless-shell v1243 — the
locked pin; the machine cache question does not arise on a cold workspace).

Cold baseline (before any work): lint ✓ · tsc ✓ · the full Vitest run
**1697/1697 (51 files — the documented S169 final state exactly)** ·
dev-server preflight GREEN (the :3000 daemon answering, hydrated,
navigation-stable) · **the drawer check GREEN (the 100th consecutive**
no-Tailwind-v4-mobile-nav-bug confirmation — backdrop oklab(0 0 0 / 0.2) +
blur(4px), 288px white panel, 20 links, no footer, Escape-close superset) ·
**the desktop parity probe DIVERGENCE on navWidthMatch** — the FIRST
standing-probe divergence since the program's parity gates were instituted,
root-caused this session (see Audit C / DT2). Baseline noise: none. The
config posture re-validated for the operator's standing ask: the vitest
include matches `src/**/*.test.ts` + `tests/**/*.test.ts` only; the
playwright testDir is `tests/e2e` with the production-build webServer on
`db/e2e.db`; tsconfig excludes `skills`; eslint ignores `skills` — the
repo-included `skills/` folder is excluded from code checking, testing, and
compilation on every axis.

**The parity DIVERGENCE, root-caused at the source (the s170 probes,
scripts/probe-sidebar-geometry-s170.mjs + probe-sidebar-styles-s170.mjs +
probe-ref-shell-s170.mjs):** the LIVE reference re-deployed its shell chrome
between the S169 close and this session — measured TODAY at 1440×900 and
390×844, both hosts logged in:

- The desktop sidebar `aside`: the reference now carries `border-x`
  (1px per side, `rgba(255, 255, 255, 0.5)` — the same border-color the
  `glass` utility already declares) + `shadow-xl shadow-slate-200/50`
  (computed `rgba(226, 232, 240, 0.5) 0px 20px 25px -5px, … 0px 8px 10px
  -6px`) + `z-40` + `transition-all duration-300`. The S169 session's
  probe MATCHED at navWidth 260 on both hosts — impossible under the
  bordered form (the inner nav reads 258 today) — so the border-x is a
  POST-S169 reference deployment (the shadow/z cannot be dated from probe
  history; they are part of the same measured catch-up).
- The mobile app-bar `header`: the reference measures `border-b` (1px,
  the glass border-color) + `shadow-sm` + `z-40` — and the CLONE has
  carried `z-30` with NO border and NO shadow since the initial scaffold
  (the mobile-navigation spec's own header comment, written at the initial
  measurement era, documents the reference's `glass z-40 … shadow-sm` —
  a longstanding miss the cycle's DIVERGENCE pass newly converted into a
  finding).
- The collapse behavior is UNCHANGED on the reference (260 ↔ 80, mainX
  follows) — verified by driving the reference's (now UNLABELED — an
  a11y regression on their side; the clone's aria-label stays, a
  documented superset) chevron. The mobile drawer is UNCHANGED (the
  standing drawer check GREEN on both hosts).
- The dashboard structure matches (4 KPI stat cards, same labels, the
  `grid grid-cols-2 lg:grid-cols-4 gap-4` map, the section headings) —
  the probe's `statCards 6 vs 4` reads a CROSS-GRID count on the
  reference (4 stat cards + 2 more grid-children elsewhere), not drift.

## §1 The audits (Mode-C; every H/L finding re-verified by direct read by the orchestrator)

### Audit A — the Batch DS recent-changes axis (the `2ed1512` fix commit; `5699d1b`/`5d6258f` docs-only): **0C / 0H / 0M / 0L / 0I — clean.**

All three DS claims verified at the source anchors: **DS1** — the three
contained catches at data.ts:634-645 (the doctrine comment re-tagged
S169/DS1 at :609, the eighth family — the create/update pair + the ONE
catch on deleteSubject's whole eleven-collection `Promise.all`); **DS2** —
`role="status"` + `aria-label="Loading subjects"` on the SubjectsTab gate
(settings-view.tsx, the S169/DS2 comment); the test anchors — the DS1 unit
pair set (data-store.test.ts:1118-1171, four legs) + the DS1 e2e leg
(resilience.spec.ts:1263-1356, the collection-glob route hold with the
finally DELETE). The doc census chain machine-verified consistent at
1697 + 632 = 2329: README badge `2329 green` + the count prose + the
Session-169 row; AGENTS 1697 + 632 + the S169 lessons block; CLAUDE
(1697 :103 + 632); PAD v1.3.77 (header + the revision block); SKILL (all
four sites); the vitest header (vitest.config.ts:4-8, re-anchored
S169/DS); the cert runner re-tag (both scripts: the Expected line 156 +
197 + 95 + 95 + 89 = 632 — machine-pinned by the script-conventions
tripwire). The commit diff is surgical (20 files, no skills/ files
touched). The root scratch sweep: clean (the only root log the gitignored
`dev.log`; no cert-s169.log left behind).

### Audit B — the task lists family (the rotation's fresh axis: the S169 close's own "Next cycle" list NAMED this axis — "the remaining seven CB8 seams (the taskList/deck/studyGroup/practiceTest/grades/focusSessions/holidays families)" — taskList FIRST in the recorded order; the family rode no prior deep-sweep — its mutations predate the CB8 doctrine and no view consumes them today). The axis read against the web-application skill's §4/§7/§8/§9/§13/§16/§17 rubric: the three mutations in data.ts:648-660 + the taskList API routes (the delegate factory: makeCollectionRoutes + makeItemRoutes over taskListDelegate) + the seams they consume (validation.ts's taskListSchema :252-254 [boundedTitle name], the taskListDelegate at entities.ts:432 via makeOwnedDelegate with NO ownedFks — task lists carry no owned FKs; they are the SetNull TARGET for Task.listId [schema.prisma:161, the `@@index([listId])` at :172], not an FK carrier) + the round-trip verification against the route/factory wire contracts + the consumer census (tasks-view.tsx:507/573/617 — the READ-ONLY aside "My Lists" navigation; NO view invokes the three mutations; the producers are the seed [prisma/seed.ts:78-90, the three seeded lists] and the import route [server-side bulk]). **Verdict: 0C / 1H / 0M / 0L / 0I.**

The family is coherent on every other axis (re-verified by direct read):

- **Ownership** — in the WHERE clause by construction (the delegate
  factory: taskListDelegate via makeOwnedDelegate; every query scoped
  `where: { userId }`; task lists carry no owned FKs to guard — they are
  the SetNull TARGET the `[fetchAndSet("taskLists"), fetchAndSet("tasks")]`
  refresh exists to reconcile).
- **Zod at both boundaries** — the route factory parses with the
  delegate's schemas (boundedTitle name; updateSchema =
  taskListSchema.partial()).
- **The API surface** — /api/task-lists + /api/task-lists/[id] via the
  factory (the ownership-scoped collection + item routes; nothing to add).

The finding:

- **H-1 (DT1)** — the task lists family mutations reject on the refresh
  leg after a COMMITTED write (data.ts:648-660, the pre-CB8 shape, the
  NINTH family of the recorded port): createTaskList (:649-651) and
  updateTaskList (:652-655) ride the uncaught `await
  fetchAndSet("taskLists")`; deleteTaskList (:656-659) rides the uncaught
  `await Promise.all([fetchAndSet("taskLists"), fetchAndSet("tasks")])` —
  the TWO-collection SetNull reconciliation set (Task.listId → null on a
  deleted list), so EITHER failed refresh GET rejects the whole delete on
  a row the server deleted. fetchAndSet REJECTS when its GET fails (the
  CD2 20 s deadline). A write that COMMITTED server-side followed by a
  flaky refresh rejects the WHOLE mutation — the mutation CONTRACT lies
  to any caller (the exact shape the S162/DK1 → S169/DS1 audits found
  and fixed on the events/exams/assignments/timetable/notes/flashcards/
  tasks/subjects families). **No view consumer exists today** (the
  tasks-view aside is read-only navigation; the TaskDialog carries no
  list picker — verified against the LIVE reference this session: the
  reference's task dialog fields are Title/My Day/Important/Due date/
  Priority/Repeat/Subtasks/Notes, NO list picker, and the reference's
  Tasks aside carries NO create-list affordance) — so the failure
  surface is the contract itself, pinned by the unit pair set; the e2e
  leg is NOT derivable without inventing UI the reference does not have
  (the §7 adjudication).

### Audit C — the standing gates re-verified this session (the parity DIVERGENCE root-caused; one finding)

The drawer check GREEN (the **100th** consecutive — the Tailwind v4
mobile-nav watch: backdrop oklab(0 0 0 / 0.2) + blur(4px), the 288px white
panel, 20 links, no footer, Escape-close superset). The dev-server
preflight GREEN. The `skills/` exclusion posture re-verified (tsconfig
excludes, eslint ignores, the vitest include). The `.env` /
`.env.example` contract re-verified byte-identical at the documented dev
posture. **The desktop parity probe DIVERGENCE on navWidthMatch** — the
reference's inner nav reads 258px (the bordered aside's content box) vs
the clone's 260px (unbordered): root-caused by the s170 computed-style
probes to the reference's post-S169 chrome deployment (the §0 record).
The reference's mobile app-bar z-40 + shadow-sm + border-b vs the clone's
z-30 bare form: a longstanding miss the divergence pass surfaced (the
mobile-navigation spec's own initial-era comment documents the reference's
measured classes). The hue-pairs / hue-tokens registers carry no
sidebar.tsx or mobile-chrome.tsx sites (verified — no census re-anchor
needed for DT2); the e2e pins on the chrome are width/collapse-geometry
only (navigation.spec :90-92, s52-sidebar-collapse.spec — the border-box
aside keeps its 260/80 computed width under border-x, so no pin moves);
the drawer legs ride the drawer panel, not the app-bar box.

## §2 DT1 — the task lists family mutation CB8 split (the H-1 close)

The DK1/DL1/DM1/DN1/DP1/DQ1/DR1/DS1 doctrine ported verbatim to the ninth
family of the recorded family-wide port. The fix is contained AT THE SEAM
(data.ts:648-660): createTaskList's and updateTaskList's refresh legs each
gain `.catch(() => undefined)`; deleteTaskList's TWO-collection
`Promise.all` refresh gains ONE contained catch on the whole `Promise.all`
expression — the multi-collection refresh is ONE failure domain (the
S169/DS1 lesson, the SetNull reconciliation), and the per-collection
fetchAndSet calls already isolate their own supersession (`fetchSeq`
ticketing). The WRITE legs keep rejecting honestly (a failed
POST/PATCH/DELETE still rejects at the mutation). The stale slices
self-heal on the next successful load (the S16 view-switch pre-warm + the
next mutation's own refresh — the DJ5 doctrine). The doctrine comment
re-tagged S170/DT1 (the ninth family, the second of the eight remaining
seams — the S169 close's ledger order).

- **Unit (the DT1 pair set, tests/data-store.test.ts — the DS1 pair set
  the template, appended after the DS1 describe at :1118-1171)**: four
  legs — the resolve set (createTaskList/updateTaskList/deleteTaskList:
  `apiSendMock` resolves + `apiGetMock` rejects → the mutation RESOLVES;
  RED pre-fix ×3 — the deleteTaskList leg's `mockRejectedValueOnce`
  rejects ONE of the TWO parallel refresh GETs, which is sufficient:
  `Promise.all` rejects on its first rejection, exactly the
  flaky-refresh condition) + the failed-write guard (createTaskList:
  `apiSendMock` rejects → the mutation REJECTS; green-on-arrival — the
  honest failure reaches the caller).
- **E2e: NONE — the §7 adjudication** (no view consumer drives the
  family's mutations; the reference itself carries no list-CRUD surface;
  inventing one is out of scope for a CB8 seam cycle).

## §3 DT2 — the shell chrome catch-up (the parity DIVERGENCE close; the reference's post-S169 deployment + the longstanding mobile-bar miss)

Two class-level edits, no DOM changes, no aria changes:

- **DT2a — the desktop sidebar (src/components/layout/sidebar.tsx:37-41):**
  the aside's className gains `border-x` + `shadow-xl
  shadow-slate-200/50`; `z-30` → `z-40`; `transition-[width] duration-200`
  → `transition-all duration-300` — the reference's measured classes
  (this session, 1440×900, computed styles captured in §0). The
  border-color arrives from the `glass` utility (light
  `rgb(255 255 255 / 0.5)`, dark `rgb(51 65 85 / 0.5)`) — byte-identical
  to the reference's border-color. The border-box aside keeps its
  computed 260px/80px width (the navigation + collapse pins hold); the
  main offset is unchanged (the aside's right edge stays at 260).
- **DT2b — the mobile app-bar (src/components/layout/mobile-chrome.tsx:131):**
  the header's className gains `border-b` + `shadow-sm`; `z-30` → `z-40`
  — the reference's measured classes (this session, 390×844). The
  border-color arrives from the same `glass` utility.

Stacking safety (verified): the desktop aside renders at lg+ only; the
mobile app-bar at <lg only; the drawer backdrop/dialog (z-50), the
connectivity pill (z-[70]), and the Radix overlays (z-50) all stay ABOVE
z-40; nothing at lg+ sits between 30 and 40.

- **E2e (the DT2 pin pair — the computed-style ground-truth doctrine,
  the navigation.spec pin idiom)**:
  - **DT2a leg (tests/e2e/navigation.spec.ts**, appended at the file's
    tail**): desktop viewport — the aside computes `border-left-width:
    1px` + `border-right-width: 1px`, `border-left-color:
    rgba(255, 255, 255, 0.5)`, a boxShadow containing the xl geometry
    (`0px 20px 25px -5px`), `z-index: 40`, and `transition-property:
    all` + `transition-duration: 0.3s`; the computed width stays
    `260px` (the border-box contract).
  - **DT2b leg (tests/e2e/mobile-navigation.spec.ts**, appended at the
    file's tail**): 390×844 — the banner computes `border-bottom-width:
    1px`, `border-bottom-color: rgba(255, 255, 255, 0.5)`, a boxShadow
    containing the sm geometry (`0px 1px 2px`), and `z-index: 40`.
  - Both legs RED on the pre-fix build (the chrome lacks the
    borders/shadows/z today), GREEN after the class edits.

## §4 The RED inventory (as designed)

1. **DT1 unit resolve set** — data-store.test.ts, the DT1 pair set: RED
   ×3 pre-fix (the three mutations reject with "offline" on the
   committed-write + failed-refresh shape; the delete leg on ONE rejected
   refresh among the two).
2. **DT1 unit failed-write guard** — green-on-arrival (the write leg
   rejects today and must keep rejecting).
3. **DT2a e2e leg** — navigation.spec.ts: RED on the pre-fix build (the
   aside computes 0px borders, no shadow, z-30, width-only transition).
4. **DT2b e2e leg** — mobile-navigation.spec.ts: RED on the pre-fix
   build (the banner computes 0px border-bottom, no shadow, z-30).

## §5 The GREEN implementations (as designed)

1. **DT1** — data.ts:648-660: the three contained catches (the
   create/update pair + the one catch on deleteTaskList's whole
   Promise.all) + the doctrine comment (the DS1 comment shape, re-tagged
   S170/DT1, the ninth family).
2. **DT2a** — sidebar.tsx: the aside's className
   (`border-x shadow-xl shadow-slate-200/50 z-40 transition-all
   duration-300`, replacing `z-30 transition-[width] duration-200`) +
   the S170/DT2a comment.
3. **DT2b** — mobile-chrome.tsx: the header's className (`border-b
   shadow-sm z-40`, replacing `z-30`) + the S170/DT2b comment.

## §6 The gates (as designed)

- lint ✓ · tsc ✓.
- **Unit 1697 → 1701 (+4 exactly**: data-store +4 [the DT1 pair set]).
- Build ✓ (the standalone production build; the known "Ecmascript file
  had an error" toolchain noise is PRE-EXISTING — verified on the
  pre-fix tree by the S164 stash-build-unstash check, re-witnessed on
  the S168/S169 cycles' cold baseline builds).
- The touched spec files: navigation.spec **+1** (the DT2a leg) +
  mobile-navigation.spec **+1** (the DT2b leg) — the full-file runs
  green with their prior legs.
- The 5-chunk cold cert (the authoritative gate): **158 + 197 + 95 + 95
  + 89 = 634** (chunk 1 +2 — both DT2 legs ride chunk-1 specs). The
  machine-pinned tripwire updated in lockstep
  (tests/script-conventions.test.ts: the Expected line 156 + 197 + 95 +
  95 + 89 = 632 → 158 + 197 + 95 + 95 + 89 = 634 + the S170/DT re-tag
  comment) + both cert runner scripts re-tagged
  (scripts/e2e-chunked-cert.sh's Expected header + the new
  scripts/launch-cert-s170.py wrapper).
- The drawer check re-run GREEN after the source changes (the 101st —
  the app-bar edit must not disturb the drawer legs).
- The desktop parity probe re-run **MATCH** after the source changes
  (navWidth 258 = 258 — the bordered content box on BOTH hosts; the
  other three formal checks hold).

## §7 The adjudications (the rejected/documented findings)

- **The DT1 e2e leg is NOT derivable this cycle** — no view consumer
  drives the task lists mutations (the tasks-view aside is read-only;
  the TaskDialog carries no list picker — verified against the LIVE
  reference: their dialog fields are Title/My Day/Important/Due date/
  Priority/Repeat/Subtasks/Notes, and their Tasks aside carries no
  create-list affordance; their demo account holds no lists at all).
  Inventing a list-CRUD UI (or a list picker) would be NEW product
  surface beyond the reference — not the "superset of the reference"
  the program targets (the clone's subject picker is the documented
  S6-era superset precedent on a SHARED surface; a new management
  surface is a different class). The unit pair set pins the mutation
  CONTRACT; the e2e leg arrives when/if a list surface ships. The
  recorded deferral.
- **The reference's chevron aria-label regression is NOT followed** —
  the reference's collapse toggle lost its accessible name (an
  icon-only unlabeled button today); the clone's
  "Collapse sidebar"/"Expand sidebar" aria-labels STAY (the documented
  superset posture — the reference's a11y regressions are never ports).
- **The dark-mode shadow tint is left as the light token** — the
  reference has no dark mode (the clone's own superset); `shadow-slate-
  200/50` on a dark background is barely visible and harmless; a
  dark:shadow variant would be clone-only invention (no reference
  counterpart to match). Documented, not fixed.
- **The transition-property change (width-only → all)** follows the
  reference's measured `transition-all duration-300` exactly; the
  collapse animation slows 200ms → 300ms to match. No pin asserts the
  timing (verified — s52-sidebar-collapse.spec pins widths/margins
  only; Playwright's auto-retrying assertions ride the 300ms).
- **The remaining unported CB8 seams** (the
  deck/studyGroup/practiceTest/grades/focusSessions/holidays families):
  the recorded rotation continues — the task lists port closes the
  SECOND of the eight seams the S168 close's ledger names; the six
  remaining seams are the recorded next rotations.
- **The standing deferrals** (the S169 close's ledger): the unannounced
  loading-gate families (focustimer/gradetracker/dashboard/myday/
  studygroups/practicetests/analytics/settings-holidays); the files
  refresh-failure toast copy harmonization (the F-8 candidate); the
  S160 close's ledger (the A-M3 stage-2 triggers; the update-side
  raw-SQL bulk upsert; the I-4 parse posture; the M-1 LLM-side
  residual); the gradetracker/studygroups/settings-CRUD (edit/delete
  journeys + holidays) and AlertDialog-confirm e2e gaps.

## §8 The as-executed close

Executed as designed (the cold-workspace cycle — the environment rebuilt
from the documented quickstart; every surface re-verified by direct read
before the plan was written):

- **Workspace**: cold — `git clone` at `5d6258f` on `main` (the
  session_211 transcript, docs-only); the environment rebuilt (bun
  install 510 packages; the Playwright chromium re-derived at the
  locked v1243 pin; `db:push && db:seed` — the repo-root `db/custom.db`;
  `.env` from `.env.example`, byte-identical at the documented dev
  posture). The pre-fix standalone built at 07:41 on the clean
  S169-final tree — the TRUSTED pre-fix binary for the DT2 e2e RED
  proofs.
- **Cold baseline**: lint ✓ · tsc ✓ · unit **1697/1697** (51 files —
  the documented S169 final state exactly) · preflight GREEN · the
  drawer check GREEN (the **100th** consecutive) · the desktop parity
  probe **DIVERGENCE on navWidthMatch** — the first standing-probe
  divergence since the parity gates were instituted, root-caused this
  session to the reference's post-S169 chrome deployment (the §0
  record; the s170 probe scripts captured the computed styles).
- **RED proofs (all on their designed markers)**: the DT1 unit resolve
  set RED (3 failed exactly — the pair `3 failed | 1 passed` with the
  failed-write guard green-on-arrival; the delete leg rejecting ONE
  GET among the two); the DT2a e2e leg RED against the pre-fix
  standalone — failing exactly at the border-left-width assertion; the
  DT2b e2e leg RED against the pre-fix standalone — failing exactly at
  the border-bottom-width assertion.
- **GREEN**: DT1 (the three contained catches at data.ts:670-681 with
  the doctrine comment re-tagged S170/DT1, the ninth family — ONE
  catch on deleteTaskList's whole Promise.all), DT2a (the sidebar
  chrome classes: border-x + shadow-xl shadow-slate-200/50 + z-40 +
  transition-all duration-300), DT2b (the app-bar chrome classes:
  border-b + shadow-sm + z-40). The DT2a pin's shadow assertion was
  corrected during the GREEN proof (the trap-7 oklab lesson: v4's
  color-mix(in oklab) serializes oklab even on the hex-pinned
  slate-200 step; the pin asserts the GEOMETRY + the 0.5 alpha and
  accepts either serialization — the first run failed on the rgba-only
  expectation, the corrected pin GREEN).
- **Gates**: lint ✓ · tsc ✓ · unit **1701/1701** (51 files, +4 exactly
  as designed) · build ✓ (the pre-existing "Ecmascript file had an
  error" toolchain noise re-witnessed) · the touched spec files green
  (navigation 67/67 + mobile-navigation 21/21, full-file runs) · the
  5-chunk cold cert: chunk 1 **158/158** (first-pass clean — both DT2
  legs included) · chunk 2 **197/197** cold · chunk 3 **94 passed + 1
  triaged** (the AK1c files-upload leg — the documented P1008
  machine-load class, the same AK1 family that flaked in S162/S165/
  S168/S169; isolate-rerun GREEN at 1.2 s; the chunk cold-re-ran to
  **95/95 CLEAN**, every leg first-pass — the re-run itself needed
  three attempts under this session's machine-load profile, two
  intermediate runs each flaking a different AK1 sibling before the
  clean pass) · chunk 4 **94 passed + 1 triaged** (the a11y red-700
  overdue-badge contrast leg — isolate-rerun GREEN at 1.7 s; the chunk
  cold-re-ran to **95/95 CLEAN** with one Socket timeout signature
  logged and zero failures) · chunk 5 **89/89** cold — the cert tally
  **634/634** = **census 2335 green** (the e2e census 632 → 634) · the
  drawer check GREEN on the remediated tree (**the 101st** consecutive
  no-Tailwind-v4-mobile-nav-bug confirmation) · the desktop parity
  probe **MATCH** (all four formal checks — navWidth 258 = 258, the
  bordered content box on BOTH hosts; nav-link count 20; the
  first-links sequence; mainX 260 — live reference login) with the
  probe itself HARDENED (the post-login chrome wait + bounded
  re-read retry: the login page's own `<main>` false-positived the
  old wait and the fixed 1.5s settle raced the reference's slow
  mounts under load — the probe read all-nulls and reported DIVERGENCE
  on a healthy app; the hardening converts the reference dependency
  from a fixed settle into a bounded convergence).
- **Evidence**: `docs/screenshots/170-clone-desktop.png` (the standing
  desktop dashboard — now carrying the DT2a chrome) ·
  `170-clone-mobile-drawer.png` (the 101st drawer-GREEN companion; the
  DT2b app-bar above it) · `170-clone-sidebar.png` (the cycle's
  surface — the desktop sidebar close-up, the DT2a border-x +
  xl-shadow chrome) — captured by `scripts/capture-s170-evidence.mjs`,
  self-verifying (ok: true, md5s distinct) + the not-pure-white
  pixel-ratio verification.
- **Docs lockstep**: README badge/census (2329 → 2335) + the count
  prose sites (the tree diagram + the test-command block) + the
  Session-170 row; AGENTS census (1701 + 634) + the S170 lessons block
  (three lessons: a standing-probe divergence on a clean tree is a
  reference-side finding — probe the reference at the source and sweep
  the whole chrome family while in there; a gate script must wait for
  the POST-LOGIN chrome, never any `<main>` — a settle constant is a
  race against every slower environment; v4 alpha shadows serialize
  oklab even on hex-pinned steps — pin the geometry + the alpha,
  accept either color form); CLAUDE counts (1701 + 634); PAD v1.3.78
  (the revision block); the SKILL census (all four sites — the
  chromium-spec figure re-derived 624 → 629, a pre-existing small
  drift the re-anchor caught); the vitest header re-anchor (+4); the
  cert runner re-tag (both scripts + the script-conventions tripwire —
  the CQ6/DA6 count-claims gates verified GREEN after the re-anchor:
  136/136); `docs/session_212.md`; the worklog Session-181 entry;
  this §8; the `.env.example` contract re-verified (no env-var reads
  changed this cycle — .env and .env.example byte-identical at the
  documented dev posture); the cert-s170.log scratch swept before the
  commit (the tracked artifact is the launcher script); the four
  exploratory probe scripts swept (probe-ref-buttons / probe-ref-
  collapse2 / probe-ref-dashboard / diag-ref-login — their findings
  live in this plan and the session log; the six decisive probes
  tracked: probe-sidebar-geometry / probe-sidebar-styles /
  probe-ref-shell / probe-ref-collapse / probe-ref-tasks /
  probe-ref-dialog).

## §9 The execution checklist

- [x] DT1 unit pair set (data-store.test.ts) — RED set proven (3 failed exactly)
- [x] DT2a e2e leg (navigation.spec.ts) — RED on the pre-fix build (the designed marker)
- [x] DT2b e2e leg (mobile-navigation.spec.ts) — RED on the pre-fix build (the designed marker)
- [x] DT1 GREEN (data.ts contained catches ×3, the ninth family)
- [x] DT2a GREEN (the sidebar chrome classes)
- [x] DT2b GREEN (the app-bar chrome classes)
- [x] Transition gates: lint · tsc · unit 1701/1701 · build
- [x] The touched spec files green (navigation 67/67 + mobile-navigation 21/21 full-file runs)
- [x] The 5-chunk cold cert 634/634 (chunk 3 + chunk 4 each triaged per the P1008 protocol: isolate-reruns GREEN + the chunks cold-re-run CLEAN — 95/95 both)
- [x] The drawer check (101st) + the desktop parity probe re-run (MATCH — with the probe hardening)
- [x] Evidence frames (docs/screenshots/170-clone-*)
- [x] Docs lockstep: README badge/census (2329 → 2335) + prose + the Session-170 row; AGENTS census + the S170 lessons block; CLAUDE counts; PAD v1.3.78; the SKILL census; the vitest header (+4); the cert runner re-tag (both scripts + the script-conventions tripwire); docs/session_212.md; the worklog Session-181 entry; this §8; the `.env.example` contract re-verified
- [ ] Commit to main + push via the SSH wrapper + remote verify

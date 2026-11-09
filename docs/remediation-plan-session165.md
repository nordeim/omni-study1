# Remediation Plan — Session 165 (Cycle 115, Batch DN)

> Status: PLANNED (pre-change record — the immutable plan; the as-executed
> close lives in §9). Written before any source change, per the standing
> doctrine ("write the cycle plan into docs/remediation-plan-sessionN.md
> BEFORE any source change").
>
> Operator directive: refresh the workspace, re-read the doc chain
> (AGENTS/CLAUDE/README/PAD/SKILL + session_201/202 +
> remediation-plan-session164 + worklog), validate against the codebase,
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
> Session note: this cycle continues the rotation from the S164/Batch DM
> close (`e3fc2f8` pushed + remote-verified; `7926ff8` docs-only adds
> docs/session_202.md). The workspace was NOT reset this time — the
> environment survived (node_modules, the repo-root `db/`, `.env`
> byte-identical to `.env.example`, the dev daemon still serving :3000);
> the workspace was refreshed with `git pull` to `7926ff8` and every
> surface below was verified by direct read in THIS session before this
> plan was written.

## §0 Scope, method, cold baseline, live parity

**Workspace (pulled to `7926ff8` on `main` — the S164/Batch DM fix
`e3fc2f8` + the session-log docs commit `7926ff8`; the environment was
INTACT from the prior session: node_modules present, the repo-root `db/`
with `custom.db` + `e2e.db`, `.env` verified byte-identical to
`.env.example` at the documented dev posture
(`DATABASE_URL="file:../db/custom.db"`), the dev daemon alive on :3000).**

Cold baseline (before any work): lint ✓ · tsc ✓ · the full Vitest run
**1663/1663 (51 files — the documented S164 final state exactly)** ·
dev-server preflight GREEN · **the drawer check GREEN (the 90th
consecutive** no-Tailwind-v4-mobile-nav-bug confirmation — backdrop
oklab(0 0 0 / 0.2)+blur(4px) match, 288px white panel, 20 links both
hosts, no footer, Escape-close superset) · the desktop parity probe
**MATCH** (all five formal checks — sidebar shell 260, nav-link count 20,
first-links sequence, mainX 260, mainWidth 1180; live reference login).
Baseline noise: none. The config posture re-validated for the operator's
standing ask: the vitest include matches `src/**/*.test.ts` +
`tests/**/*.test.ts` only; the playwright testDir is `tests/e2e` with
the production-build webServer on `db/e2e.db`; tsconfig excludes
`skills`; eslint ignores `skills` — the repo-included `skills/` folder
is excluded from code checking, testing, and compilation on every axis.

## §1 The audits (Mode-C; every H/L finding re-verified by direct read by the orchestrator)

### Audit A — the Batch DM recent-changes axis (the `e3fc2f8` fix commit; `7926ff8` docs-only: docs/session_202.md, no source): **0C / 0H / 0M / 0L / 0I — clean.**

All four DM claims verified at the source anchors: **DM1** — the three
contained catches at data.ts:703-712 region (`await
fetchAndSet("assignments").catch(() => undefined)` on
create/update/delete, the doctrine comment at :616-633); **DM2** — the
`role="status"` + `aria-label="Loading assignments"` on the assignments
loading gate (assignments-view.tsx:317-318); **DM3** — the
`ASSIGNMENT_PRIORITIES` import + the `const PRIORITIES =
ASSIGNMENT_PRIORITIES` alias (assignments-view.tsx:64-75); **DM4** — the
`**/api/assignments**` corrected glob at resilience.spec.ts:1741/1757
(+ the corrected comment at :1731-1734). The test anchors: the DM1 unit
pair set (data-store.test.ts:709-754), the DM3 census site
(enum-single-source.test.ts:53-57, the FIFTH site), the DM1 e2e leg
(parity-session9.spec.ts:739-776). The doc census chain
machine-verified: README badge `2289 green` + the Session-164 row;
AGENTS 1663 + 626; CLAUDE 1663 + 626; PAD v1.3.72 (1663 ×2 + 2289);
SKILL (1663 ×3 + 2289 ×2); the vitest header (1663 current; the 1657
sites are the prior re-anchor's historical notation, correct);
the cert runner re-tag (both scripts: 626, chunk 2 193 — machine-pinned
by tests/script-conventions.test.ts:158-159). The commit diff is
surgical (24 files: 3 source + 3 test + the doc chain + evidence +
tooling; no skills/ files touched).

### Audit B — the timetable family (the rotation's fresh axis: the S164 close's own "Next cycle" list NAMED this axis — "the family-wide CB8 port's REMAINING families (timetable/notes/flashcards/tasks … each family gets its own rotation-axis audit + pin set; the events/exams/assignments pin sets are the templates)" — the timetable family is FIRST in the recorded order; the family's point-fixes rode S7/S8-E [the grid layout], session-63 Batch T [the Sunday-first week], S119/BT9 [the dead remove() removed], S120/BU9 [the explicit Cancel], S122/BW7 + S123/BX1 [the minutes-since-midnight ordering guard], S123/BX1 [the hhmm edit normalize], S127/CB6 [fourteen hour rows], S127/CB6b → S161/DJ2 [the band hand-guard], S130/CE3 [the loading gate], S133/CH2 [the WEEK_TYPES promotion], S138/CM6 [the stateless Grid Builder], S140/CO4c [the 9-card cap removed], S152/DA2 [the required-field hand-guard], S78/AE12 [flex-wrap] — but the family was never deep-swept as an axis). The axis read against the web-application skill's §4/§9/§12/§13/§16/§17 rubric: timetable-view.tsx + the timetable API routes (the delegate factory + withUser/withUserParams wrappers) + the seams they consume (validation.ts's timetableClassSchema + WEEK_TYPES at :123, the timetable mutations in data.ts:700-712, the calendar-view's timetable-slice read at :55, date.ts) + the round-trip verification against the route/factory wire contracts. **Verdict: 0C / 1H / 0M / 2L / 0I.**

The family is coherent on every other axis (re-verified by direct read):

- **Ownership** — in the WHERE clause by construction (the delegate
  factory; timetableDelegate at entities.ts:501-511 with the
  BW7 ordering-checked create/update schemas + the owned-FK map + the
  transactional merge guard).
- **Zod at both boundaries** — the route factory parses with the
  delegate's schemas; the view builds `TimetableClassInput`
  (z.input of timetableClassSchema, data.ts:442).
- **take:500** — the CA5 newest-500 window on the collection GET
  (entities.ts:305-313, the family default).
- **Zero useEffect** — the view is a pure render of the store slice +
  local dialog state; the slice refresh rides the mutation seams.
- **The toast copy** — "Class added." / "Class updated."
  (timetable-view.tsx:217/220), the AX-family copy shape.
- **The a11y surface** — labeled controls (Label htmlFor on every
  field), aria-labels on the icon-only chrome (the week chevrons, the
  Week filter), the focus-visible ring on the grid cells, the
  dialog's Escape-close, the sr-only "Edit class" on the pencil.

The findings:

- **H-1 (DN1)** — the timetable mutations reject on the refresh leg
  after a COMMITTED write (data.ts:700-712, the pre-CB8 shape): the
  three mutations are `await apiSend(...)` then
  `await fetchAndSet("timetable")`, and fetchAndSet REJECTS when its
  GET fails (the CD2 20 s deadline) — a write that COMMITTED
  server-side followed by a flaky refresh rejected the WHOLE mutation.
  The view's catch (timetable-view.tsx:223-224) showed "Something went
  wrong." in the still-open dialog, fired no success toast, and kept
  the form armed, so a RETRY re-POSTed and DUPLICATED the class (the
  CB8 letter: a false mutation-failure claim on a committed row — the
  exact shape the S163/DL1, S162/DK1, and S164/DM1 audits found and
  fixed on the exams/events/assignments families; the recorded
  family-wide port's fourth family).
- **L-1 (DN2)** — the loading gate is silent to assistive tech AND the
  day-detail gate is provably dead code: the main gate
  (timetable-view.tsx:280-283) renders `<Spinner>` inside an unlabeled
  div with no `role="status"` (the DM2/DL2/DK4 precedent closed this
  on the assignments/exams/events-calendar families — the Spinner is
  aria-hidden, so the in-flight window is silent); AND the mobile
  day-detail gate (:491-499, `{loading && classes.length === 0 ? …}`)
  sits inside the has-classes ternary branch (:298) — the enclosing
  structure guarantees `classes.length > 0` whenever the accordion
  renders, so the branch is UNREACHABLE while its S130/CE3 comment
  claims a live protection ("an in-flight timetable must not read 'No
  classes this day.'") that the OUTER gate at :280 already owns. Dead
  code + a misleading comment (the copy-paste artifact of the calendar
  day-detail pattern, whose gate lives at list level outside any
  empty-guarding ternary).
- **L-2 (DN3)** — the WEEK_TYPES vocabulary is an inline twin in the
  view: validation.ts:123 exports `WEEK_TYPES = ["ALL", "A", "B"]`
  (the S133/CH2 promotion) and the schema enums off it
  (validation.ts:354), but timetable-view.tsx hard-codes the triple in
  FOUR places — the filter Select options (:264-268), the dialog week
  Select options (:633-637), the `weekType` state type
  (`"ALL" | "A" | "B"`, :87 + :109), and the WEEK_TYPE_LABELS map keys
  (:64-68) — value-equal today, the DM3 census-blind-spot class (the
  S164 lesson: "enumerate the consumed vocabularies, not the exported
  names"). A future schema value (the family's own CH2 promotion
  precedent) would be accepted by the API but un-selectable in the UI
  (the CB9 blanked-select drift class).

### Audit C — the standing gates re-verified this session (no new findings)

The drawer check (the 90th consecutive GREEN), the desktop parity
probe (MATCH, live reference login), the dev-server preflight (GREEN).
The `skills/` exclusion posture re-verified (tsconfig excludes,
eslint ignores, the vitest include). The `.env` / `.env.example`
contract re-verified byte-identical at the documented dev posture.

## §2 DN1 — the timetable mutation CB8 split (the H-1 close)

The DK1/DL1/DM1 doctrine ported verbatim to the fourth family of the
recorded family-wide port. The fix is contained AT THE SEAM
(data.ts:700-712): each mutation's refresh leg gains
`.catch(() => undefined)`; the WRITE leg keeps rejecting honestly (the
view's dialog catch still sees real save failures — the honest
save-failure contract). The stale slice self-heals on the next
successful load (the S16 view-switch pre-warm + the next mutation's
own refresh — the DJ5 doctrine: the write's own success toast is the
surfacing; a second toast for the same offline window is noise).

- **Unit (the DN1 pair set, tests/data-store.test.ts — the DM1 pair
  set the template, appended after the DM1 describe)**: four legs —
  the resolve trio (create/update/delete: `apiSendMock` resolves +
  `apiGetMock` rejects → the mutation RESOLVES; RED pre-fix ×3) + the
  failed-write guard (create: `apiSendMock` rejects → the mutation
  REJECTS; green-on-arrival — the honest failure reaches the caller).
  The probe input mirrors the wire shape (`subjectId: null` accepted
  by nullableId's `""`→null transform, `weekType: "ALL"`).
- **E2e (the DN1 CB8-twin leg, tests/e2e/parity-session9.spec.ts —
  appended after the DM1 describe)**: hold `**/api/timetable`
  (collection-only — the glob ends at the collection URL, no per-id
  leg involved; the DM4 lesson re-derived: the pattern's trailing
  boundary is part of the proof) with GET-abort/POST-continue
  discrimination; a committed create (the POST 201 witnessed) + the
  aborted refresh must answer `getByText("Class added.")` + the
  closed dialog, never the false save-failure. RED pre-fix on the
  pre-fix build: the toast never fires. Zero residue via the finally
  DELETE (the CC4/AR3 convention).

## §3 DN2 — the loading gate gains the aria contract + the dead day-detail gate is removed (the L-1 close)

- The MAIN gate (timetable-view.tsx:280-283) gains `role="status"` +
  `aria-label="Loading timetable"` + the S165/DN2 comment (the
  DM2/DL2/DK4 precedent shape, rides the diff review).
- The DEAD day-detail gate (:491-499) is REMOVED — the
  `{loading && classes.length === 0 ? <Spinner/> :}` branch is
  unreachable by the enclosing structure (the accordion renders only
  in the has-classes ternary branch); the honest comment documents
  the ownership (the OUTER gate owns the in-flight window; the CE3
  inner gate was the calendar-pattern copy that landed inside a scope
  where its condition can never hold). Behavior-preserving by
  construction (the branch never rendered); no runtime pin can see
  the removal (the dead branch had no observable behavior to pin).

## §4 DN3 — the WEEK_TYPES single-source port + the census's sixth site (the L-2 close)

The DK2 events-REPEATS inline-twin template (the map-over-the-import
form) + the DM3 typing discipline:

- `import { WEEK_TYPES, normalizeHhmmForInput } from "@/lib/validation";`
  (the existing import line extended).
- `type WeekType = (typeof WEEK_TYPES)[number];` — the derived alias
  (NOT a const twin; it cannot fork — the census's no-local-twin leg
  checks the `const WEEK_TYPES =` form, the alias derives from the
  import).
- `const WEEK_TYPE_LABELS: Record<WeekType, string> = { ALL: "All
  Weeks", A: "Week A", B: "Week B" };` — the label map typed off the
  source: a future vocabulary value FAILS TYPECHECK until the map
  covers it (the machine guard).
- Both Selects render from `{WEEK_TYPES.map((w) => …
  WEEK_TYPE_LABELS[w])}` (the filter :264-268 + the dialog :633-637) —
  identical labels/values, chrome-identical.
- The state types derive: `useState<WeekType>("ALL")` (:87) + the
  form field `weekType: "ALL" as WeekType` (:109) + the
  `onValueChange` casts.
- The census (tests/enum-single-source.test.ts) gains its SIXTH site —
  the import leg RED pre-fix, the no-local-twin leg green-on-arrival
  (unit +2).

## §5 The RED inventory (as designed)

1. **DN1 unit resolve trio** — data-store.test.ts, the DN1 pair set:
   RED ×3 pre-fix (the mutations reject with "offline" on the
   committed-write + failed-refresh shape).
2. **DN1 unit failed-write guard** — green-on-arrival (the write leg
   rejects today and must keep rejecting).
3. **DN3 census import leg** — enum-single-source.test.ts, the sixth
   site: RED pre-fix (timetable-view.tsx does not import WEEK_TYPES).
4. **DN3 census no-local-twin leg** — green-on-arrival (no
   `const WEEK_TYPES =` in the view today).
5. **DN1 e2e leg** — parity-session9.spec.ts: RED on the pre-fix
   build at the designed marker (`getByText("Class added.")` — the
   element is not found; the write committed, the toast never fired,
   the dialog stayed open with the false failure).

## §6 The GREEN implementations (as designed)

1. **DN1** — data.ts:700-712: the three contained catches + the
   doctrine comment (the DM1 comment shape, re-tagged S165/DN1, the
   fourth family).
2. **DN2** — timetable-view.tsx: the main gate's aria contract + the
   dead day-detail branch removed with the honest comment.
3. **DN3** — timetable-view.tsx: the WEEK_TYPES import + the derived
   alias + the typed label map + both Selects mapped + the state
   types derived.

## §7 The gates (as designed)

- lint ✓ · tsc ✓ (the DN3 alias/form typing must typecheck).
- **Unit 1663 → 1669 (+6 exactly**: data-store +4 [the DN1 pair set],
  enum-single-source +2 [the sixth site's two legs]).
- Build ✓ (the standalone production build; the known "Ecmascript file
  had an error" toolchain noise is PRE-EXISTING — verified on the
  pre-fix tree by the S164 stash-build-unstash check).
- The touched spec file: parity-session9 **38 → 39** (the DN1 leg).
- The 5-chunk cold cert (the authoritative gate): **155 + 194 + 94 +
  95 + 89 = 627** (chunk 2 +1 — the DN1 leg rides parity-session9).
  The machine-pinned tripwire updated in lockstep
  (tests/script-conventions.test.ts: the Expected line 155 + 193 + 94
  + 95 + 89 = 626 → 155 + 194 + 94 + 95 + 89 = 627 + the S165/DN
  re-tag comment) + both cert runner scripts re-tagged.
- The drawer check re-run GREEN after the source changes (the 91st).
- The desktop parity probe re-run MATCH after the source changes.

## §8 The adjudications (the rejected/documented findings)

- **The span/hour-card height math** (`span = Math.max(1, endHour -
  startHour)` — a 90-minute class renders a 1-row-tall card): the
  long-standing parity-pinned rendering (the S7/S8-E + session-63
  lineage); no measured reference divergence and no live driver —
  declined at the surgical-diff doctrine (an I-class nit with no
  active driver).
- **The WEEK_TYPE_LABELS undefined-render on an unexpected legacy
  weekType** (renders "Monday · " with a dangling separator): the Zod
  boundary guards writes (z.enum(WEEK_TYPES) + .default("ALL")) and
  the Prisma seed conforms — no reachable input; the DN3 typing makes
  the label map exhaustive-by-construction. No separate fix.
- **The calendar-view timetable-slice read** (:55): the CB8 port does
  not change the slice contract (fetchAndSet still refreshes on
  success; only the rejection is contained) — no calendar-side change
  needed; the calendar's own family audit rides a future rotation
  (the recorded deferral list).
- **The remaining unported families** (notes/flashcards/tasks +
  subject/taskList/notebook/deck/studyGroup/practiceTest/grades/
  focusSessions/holidays seams): the recorded rotation continues —
  each family gets its own cycle; NOT bundled into this one (the
  one-family-per-cycle doctrine the rotation has followed since
  S162).

## §9 The as-executed close

Executed as designed (the warm-workspace cycle — the environment
survived the session handoff; every surface re-verified by direct
read before the plan was written):

- **Workspace**: pulled to `7926ff8` on `main`; the environment
  intact (node_modules, the repo-root `db/` with custom.db + e2e.db,
  `.env` byte-identical to `.env.example`, the dev daemon alive).
- **Cold baseline**: lint ✓ · tsc ✓ · unit **1663/1663** (51 files —
  the documented S164 final state exactly) · preflight GREEN · the
  drawer check GREEN (the **90th** consecutive) · the desktop parity
  probe MATCH (live reference login).
- **RED proofs (all on their designed markers)**: the DN1 unit
  resolve trio RED (3 failed exactly) + the failed-write guard
  green-on-arrival (the pair `3 failed | 1 passed`); the DN3 census
  import leg RED (1 failed) + the no-local-twin leg green-on-arrival;
  the DN1 e2e leg RED against the pre-fix standalone — failing
  exactly at the designed assertion
  (`expect(page.getByText("Class added.")).toBeVisible()` — not
  found; the POST 201 was witnessed, the toast never fired, the
  dialog stayed open with the false failure).
- **GREEN**: DN1 (the three contained catches at data.ts:714-725 with
  the doctrine comment), DN2 (`role="status"` +
  `aria-label="Loading timetable"` on the main gate + the dead
  day-detail branch removed with the honest ownership comment), DN3
  (the WEEK_TYPES import + the derived `WeekType` alias + the
  exhaustively-typed label map + both Selects mapped + the state
  types derived).
- **The mid-edit regression the gates caught**: the DN3 import edit
  accidentally rewrote `@/lib/date` as `@lib/date` — tsc failed
  within the minute (TS2307 + the TS7006 pair on the setWeekStart
  callbacks); fixed immediately, the lesson recorded in the AGENTS
  S165 block.
- **Gates**: lint ✓ · tsc ✓ · unit **1669/1669** (51 files, +6
  exactly as designed) · build ✓ · the full touched spec file
  parity-session9 **39/39** (+1, the DN1 leg) · the 5-chunk cold
  cert: chunk 1 **155/155** · chunk 2 **194/194** (+1; one
  socket-timeout signature logged, zero failures) · chunk 3 **94/94
  on the cold re-run** (the first run's single AI6 files-upload leg —
  the documented P1008 machine-load class: a diff-untouched surface,
  1.2 s clean in isolation, the full chunk clean cold; the
  DM4-corrected DJ5 leg GREEN at 2.5 s throughout) · chunk 4
  **95/95** · chunk 5 **89/89** — the cert tally **627/627** =
  **census 2296 green** · the drawer check GREEN on the remediated
  tree (**the 91st consecutive** no-Tailwind-v4-mobile-nav-bug) ·
  the desktop parity probe **MATCH** (all five formal checks, live
  reference login).
- **Evidence**: `docs/screenshots/165-clone-desktop.png` (non-white
  14.96%) · `165-clone-mobile-drawer.png` (33.56%) ·
  `165-clone-timetable.png` (8.65%) — captured by
  `scripts/capture-s165-evidence.mjs`, self-verifying (ok: true,
  md5s distinct) + the pixel-ratio verification.
- **Docs lockstep**: README badge/census (2289 → 2296) + the count
  prose sites + the Session-165 row; AGENTS census + the e2e map
  re-tag + the S165 lessons block (two lessons); CLAUDE counts
  (1669 + 627); PAD v1.3.73; the SKILL census (all four sites); the
  vitest header (+6); the cert runner re-tag (both scripts +
  the script-conventions tripwire — the DA6/CQ6 count-claims gates
  re-verified GREEN after the re-anchor: 136/136);
  `docs/session_203.md`; the worklog Session-176 entry; this §9.
- **`.env.example`**: re-verified — no env-var reads changed this
  cycle; `.env` and `.env.example` byte-identical at the documented
  dev posture.

## §10 The execution checklist

- [x] DN1 unit pair set (data-store.test.ts) — RED trio proven (3 failed exactly)
- [x] DN3 census sixth site (enum-single-source.test.ts) — RED import leg proven
- [x] DN1 e2e leg (parity-session9) — RED on the pre-fix build (the toast assertion)
- [x] DN1 GREEN (data.ts contained catches, the fourth family)
- [x] DN2 GREEN (the loading-gate aria contract + the dead day-detail gate removed)
- [x] DN3 GREEN (the WEEK_TYPES port + the typed label map + both Selects mapped)
- [x] Transition gates: lint · tsc · unit 1669/1669 · build
- [x] The touched spec file green (parity-session9 39/39)
- [x] The 5-chunk cold cert 627/627 (chunk 3's single AI6 flake triaged per the documented order: isolation clean 1.2 s + the cold re-run 94/94)
- [x] The drawer check (91st) + the desktop parity probe re-run (MATCH)
- [x] Evidence frames (docs/screenshots/165-clone-*)
- [x] Docs lockstep: README badge/census (2289 → 2296) + prose + the Session-165 row; AGENTS census + e2e map + the S165 lessons block; CLAUDE counts; PAD v1.3.73; the SKILL census; the vitest header (+6); the cert runner re-tag (both scripts + the script-conventions tripwire); docs/session_203.md; the worklog Session-176 entry; this §9; the `.env.example` contract re-verified
- [x] Commit to main + push via the SSH wrapper + remote verify

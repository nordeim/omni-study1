# Remediation Plan — Session 169 (Cycle 119, Batch DS)

> Status: PLANNED (pre-change record — the immutable plan; the as-executed
> close lives in §8). Written before any source change, per the standing
> doctrine ("write the cycle plan into docs/remediation-plan-sessionN.md
> BEFORE any source change").
>
> Operator directive: refresh the workspace, re-read the doc chain
> (AGENTS/CLAUDE/README/PAD/SKILL + session_208 +
> remediation-plan-session168 + worklog + session_209), validate against the
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
> Session note: this cycle continues the rotation from the S168/Batch DR
> close (`071a084` pushed + remote-verified; `c828182` ticked the plan's
> final checklist item; `848c0bf` committed the operator's session_207
> transcript; `cc936fc` — pulled this session — committed the operator's
> session_209 raw transcript, docs-only). The workspace was WARM (the S168
> session's tree: node_modules present, the repo-root `db/` carrying
> custom.db + the e2e scratch, `.env` byte-identical to `.env.example` at
> the documented dev posture, the post-S168 standalone build compiled at
> 02:34 — verified fresh against every source mtime, so it stands as the
> pre-DS1 build for the e2e RED proof). Every surface below was verified
> by direct read in THIS session before this plan was written.

## §0 Scope, method, cold baseline, live parity

**Workspace (warm — `git pull` fast-forwarded `c828182` → `cc936fc` on
`main`; the only delta the operator's session_209 transcript, docs-only;
the working tree clean).** The `.env` / `.env.example` contract re-verified
byte-identical (diff clean) at the documented dev posture
`DATABASE_URL="file:../db/custom.db"`; the repo-root `db/` carries
custom.db (401 KB, seeded) + the gitignored e2e scratch.

Cold baseline (before any work): lint ✓ · tsc ✓ · the full Vitest run
**1693/1693 (51 files — the documented S168 final state exactly)** ·
dev-server preflight GREEN (the :3000 daemon answering, hydrated,
navigation-stable) · **the drawer check GREEN (the 98th consecutive**
no-Tailwind-v4-mobile-nav-bug confirmation) · the desktop parity probe
**MATCH** (all five formal checks — sidebar shell 260, nav-link count 20,
first-links sequence, mainX 260, mainWidth 1180; live reference login
through the s142 formal probe with the operator-provided credentials).
Baseline noise: none. The config posture re-validated for the operator's
standing ask: the vitest include matches `src/**/*.test.ts` +
`tests/**/*.test.ts` only; the playwright testDir is `tests/e2e` with the
production-build webServer on `db/e2e.db`; tsconfig excludes `skills`;
eslint ignores `skills` — the repo-included `skills/` folder is excluded
from code checking, testing, and compilation on every axis.

## §1 The audits (Mode-C; every H/L finding re-verified by direct read by the orchestrator)

### Audit A — the Batch DR recent-changes axis (the `071a084` fix commit; `c828182`/`848c0bf`/`cc936fc` docs-only): **0C / 0H / 0M / 0L / 0I — clean.**

All three DR claims verified at the source anchors: **DR1** — the six
contained catches at data.ts:512-613 (the doctrine comment re-tagged
S168/DR1 at :513, the seventh family — the create/update/delete trio +
the three in-closure toggle refreshes, each caught); **DR2** —
`role="status"` + `aria-label="Loading tasks"` on the tasks list-pane
gate (tasks-view.tsx:706-709); the test anchors — the DR1 unit pair set
(data-store.test.ts:1025-1116, seven legs) + the DR1 e2e leg
(tasks.spec.ts:248-312, the collection-glob route hold with the finally
DELETE). The doc census chain machine-verified consistent at 1693 + 631 =
2324: README badge `2324 green` + the count prose + the Session-168 row;
AGENTS 1693 + 631 + the S168 lessons block; CLAUDE 1693 (:103) + 631;
PAD v1.3.76 (header + the revision block); SKILL (all four sites: :28,
:138, :631, :637); the vitest header (vitest.config.ts:4-8, re-anchored
S168/DR); the cert runner re-tag (both scripts: the Expected line 156 +
197 + 94 + 95 + 89 = 631 — machine-pinned by the script-conventions
tripwire at tests/script-conventions.test.ts:185). The commit diff is
surgical (20 files, no skills/ files touched). The root scratch sweep:
clean (the only root log is the gitignored `dev.log`; no cert-s168.log
left behind — the S167 lesson held).

### Audit B — the subjects family (the rotation's fresh axis: the S168 close's own "Next cycle" list NAMED this axis — "the rotation continues into the remaining CB8 seams (the subject/taskList/deck/studyGroup/practiceTest/grades/focusSessions/holidays families)" — subject FIRST in the recorded order; the family's point-fixes rode S130/CE3 (the Settings-tab loading gate itself), S132/CG6 (the Settings pre-warm false-empty pin in resilience), the S15/S17-era dialogs — but the family was never deep-swept as a CB8 axis). The axis read against the web-application skill's §4/§7/§8/§9/§13/§16/§17 rubric: settings-view.tsx's SubjectsTab + SubjectDialog (:694-899, the family's sole mutation consumer — verified no other view touches the subjects mutations) + the subjects API routes (the delegate factory: makeCollectionRoutes + makeItemRoutes over subjectDelegate) + the seams they consume (validation.ts's subjectSchema :247-250 [boundedTitle name + hexColor color with the #8b5cf6 default], the three mutations in data.ts:609-621, the subjectDelegate at entities.ts:465 via makeOwnedDelegate with NO ownedFks — subjects are the FK TARGET, the 11 SetNull children, not an FK carrier — the PATHS map) + the round-trip verification against the route/factory wire contracts. **Verdict: 0C / 1H / 0M / 1L / 0I.**

The family is coherent on every other axis (re-verified by direct read):

- **Ownership** — in the WHERE clause by construction (the delegate
  factory: subjectDelegate via makeOwnedDelegate; every query scoped
  `where: { userId }`; subjects carry no owned FKs to guard — they are
  the SetNull TARGET the SUBJECT_TOUCHED refresh exists to reconcile).
- **Zod at both boundaries** — the route factory parses with the
  delegate's schemas (boundedTitle name, hexColor with the violet
  default; updateSchema = subjectSchema.partial()); the dialog's custom
  color input is `<input type="color">` (browser-guaranteed #rrggbb).
- **The dialog contract** — remount-via-key
  (`key={dialogOpen ? open-${editing?.id ?? "new"} : "closed"}`),
  state-from-props at mount, the saving busy-guard, the client blank-name
  guard (`if (!name.trim() || saving) return;` + `required`), the server
  boundedTitle backstop.
- **The a11y surface** — per-row `Edit ${name}` / `Delete ${name}`
  aria-labels, the color swatch buttons with aria-label + aria-pressed,
  the labeled Name input, the Custom color input's aria-label, the
  focus-visible rings.
- **The delete confirm** — the AlertDialog with the SetNull-consequences
  copy ("every task, exam, and note in it becomes unassigned"); the
  action closes the dialog BEFORE the mutation fires (no double-fire).
- **The loading gate behavior** — the S132/CG6 CE3 gate
  (`loading && subjects.length === 0`) is e2e-pinned in resilience.spec
  (the held pre-warm leg).

The findings:

- **H-1 (DS1)** — the subjects family mutations reject on the refresh
  leg after a COMMITTED write (data.ts:609-621, the pre-CB8 shape, the
  EIGHTH family of the recorded port): createSubject (:610-613) and
  updateSubject (:614-617) ride the uncaught `await
  fetchAndSet("subjects")`; deleteSubject (:618-621) rides the uncaught
  `await Promise.all(SUBJECT_TOUCHED.map((key) => fetchAndSet(key)))` —
  the WIDEST refresh blast radius in the codebase (ELEVEN collections:
  subjects/tasks/assignments/exams/timetable/flashcardDecks/
  practiceTests/studyGroups/grades/focusSessions/notes — the SetNull FK
  reconciliation set), so ANY one of the eleven refresh GETs failing
  rejects the whole delete. fetchAndSet REJECTS when its GET fails (the
  CD2 20 s deadline). A write that COMMITTED server-side followed by a
  flaky refresh rejected the WHOLE mutation. The failure surfaces then
  LIE on committed rows: the SubjectDialog submit catch
  (settings-view.tsx:722-723) toasts "Could not save the subject." with
  the dialog STILL OPEN and the form armed (a RETRY re-POSTs and
  DUPLICATES the subject — the create leg; the update leg re-PATCHes
  harmlessly but the false claim stands); the AlertDialogAction delete
  catch (:887-889) toasts "Could not delete the subject." after the
  delete already COMMITTED — the dialog is already closed
  (`setDeleting(null)` ran before the mutation) and the next load shows
  the subject gone, so the toast claims failure on a row the server
  deleted (the CB8 letter: a false mutation-failure claim on a committed
  row — the exact shape the S162/DK1 → S168/DR1 audits found and fixed
  on the events/exams/assignments/timetable/notes/flashcards/tasks
  families; the recorded family-wide port's EIGHTH family, the FIRST of
  the eight remaining seams the S168 close's ledger names).
- **L-1 (DS2)** — the SubjectsTab loading gate carries no aria contract
  (settings-view.tsx:820-823): the gate renders `<Spinner>` inside an
  unlabeled div with no `role="status"` (the DM2 assignments / DL2 exams
  / DK4 events-calendar / DN2 timetable / DP2 notes / DQ2 flashcards /
  DR2 tasks precedent closed this on every prior CB8-ported family — the
  Spinner is aria-hidden, so the in-flight window is silent to assistive
  tech; settings is in the S166 gate census's unannounced remainder —
  this cycle closes the SUBJECTS gate inside the CB8-ported family set,
  as each prior CB8-family cycle did its own gates; the HolidaysTab twin
  (:973-975, "the SubjectsTab twin" comment) stays deferred to the
  holidays family per the one-family-per-cycle doctrine).

### Audit C — the standing gates re-verified this session (no new findings)

The drawer check (the 98th consecutive GREEN), the desktop parity probe
(MATCH, live reference login — the s142 formal probe), the dev-server
preflight (GREEN). The `skills/` exclusion posture re-verified (tsconfig
excludes, eslint ignores, the vitest include). The `.env` /
`.env.example` contract re-verified byte-identical at the documented dev
posture. The hue-tokens line-pinned register carries no settings-view
sites (the RESIDUALS register: login-surface :28, dashboard-view :210,
rum-panel :143) — the DS2 edit needs no census re-anchor.

## §2 DS1 — the subjects family mutation CB8 split (the H-1 close)

The DK1/DL1/DM1/DN1/DP1/DQ1/DR1 doctrine ported verbatim to the eighth
family of the recorded family-wide port. The fix is contained AT THE SEAM
(data.ts:609-621): createSubject's and updateSubject's refresh legs each
gain `.catch(() => undefined)`; deleteSubject's eleven-collection
`Promise.all` refresh gains ONE contained catch on the whole `Promise.all`
expression — the multi-collection refresh is ONE failure domain (the
SetNull reconciliation), and the per-collection fetchAndSet calls already
isolate their own supersession (`fetchSeq` ticketing). The WRITE legs
keep rejecting honestly (a failed POST/PATCH/DELETE still rejects at the
mutation). The stale slices self-heal on the next successful load (the
S16 view-switch pre-warm + the next mutation's own refresh — the DJ5
doctrine).

- **Unit (the DS1 pair set, tests/data-store.test.ts — the DR1 pair set
  the template, appended after the DR1 describe at :1034-1116)**: four
  legs — the resolve set (createSubject/updateSubject/deleteSubject:
  `apiSendMock` resolves + `apiGetMock` rejects → the mutation RESOLVES;
  RED pre-fix ×3 — the deleteSubject leg's `mockRejectedValueOnce`
  rejects ONE of the eleven parallel refresh GETs, which is sufficient:
  `Promise.all` rejects on its first rejection, exactly the flaky-refresh
  condition) + the failed-write guard (createSubject: `apiSendMock`
  rejects → the mutation REJECTS; green-on-arrival — the honest failure
  reaches the caller).
- **E2e (the DS1 CB8 leg, tests/e2e/resilience.spec.ts — the Settings
  surface's spec home, the S132/CG6 Settings leg's file, appended after
  the CG6 describe at :1232-1269)**: hold `**/api/subjects`
  (collection-only — the glob ends at the collection URL, the per-id
  PATCH/DELETE URLs pass unrouted; the DM4/DN1/DP1/DQ1/DR1 lesson
  re-derived: the pattern's trailing boundary is part of the proof — and
  the CG6 leg in the same file already rides the same collection URL as
  a hold) with GET-abort/POST-continue discrimination; a committed
  subject create through the SubjectDialog (the POST 201 witnessed) +
  the aborted refresh must answer the "Subject created" SUCCESS TOAST +
  the CLOSED dialog and NEVER the false "Could not save the subject."
  error toast. RED pre-fix on the pre-fix build (the post-S168
  standalone, verified fresh against every source mtime — only test
  files change before the GREEN): the dialog stays open, the error toast
  fires, the success toast never lands. Zero residue via the finally
  DELETE (the CC4/AR3 convention; the per-id URL passes unrouted).

## §3 DS2 — the SubjectsTab loading gate gains the aria contract (the L-1 close)

- The list gate (settings-view.tsx:820-823) gains `role="status"` +
  `aria-label="Loading subjects"` + the S169/DS2 comment (the
  DM2/DL2/DK4/DN2/DP2/DQ2/DR2 precedent shape, rides the diff review).

No test (the DN2/DP2/DQ2/DR2 precedent: the aria contract rides the diff
review — the gate's in-flight window is not deterministically reachable
from Playwright against the seeded slice without the 20 s held-pre-warm
dance the CG6 leg already pays for its own behavioral claim; the CG6
leg's `.animate-spin` assertion is unaffected by the added attributes).
No hue-tokens census re-anchor: the register carries no settings-view
line-pinned sites (verified — the RESIDUALS register holds
login-surface/dashboard-view/rum-panel only).

## §4 The RED inventory (as designed)

1. **DS1 unit resolve set** — data-store.test.ts, the DS1 pair set: RED
   ×3 pre-fix (the three mutations reject with "offline" on the
   committed-write + failed-refresh shape; the delete leg on ONE rejected
   refresh among the eleven).
2. **DS1 unit failed-write guard** — green-on-arrival (the write leg
   rejects today and must keep rejecting).
3. **DS1 e2e leg** — resilience.spec.ts: RED on the pre-fix build at the
   designed marker (the "Subject created" toast never becomes visible
   while the POST 201 was witnessed: the dialog stays open, the false
   "Could not save the subject." toast rendered).

## §5 The GREEN implementations (as designed)

1. **DS1** — data.ts:609-621: the three contained catches (the
   create/update pair + the one catch on deleteSubject's whole
   Promise.all) + the doctrine comment (the DR1 comment shape, re-tagged
   S169/DS1, the eighth family).
2. **DS2** — settings-view.tsx:820-823: the gate's aria contract
   (`role="status"` + `aria-label="Loading subjects"`).

## §6 The gates (as designed)

- lint ✓ · tsc ✓.
- **Unit 1693 → 1697 (+4 exactly**: data-store +4 [the DS1 pair set]).
- Build ✓ (the standalone production build; the known "Ecmascript file
  had an error" toolchain noise is PRE-EXISTING — verified on the
  pre-fix tree by the S164 stash-build-unstash check, re-witnessed on
  the S168 cycle's cold baseline build).
- The touched spec file: resilience.spec **+1 spec test** (the DS1 leg;
  the full-file run green with its prior legs).
- The 5-chunk cold cert (the authoritative gate): **156 + 197 + 95 + 95
  + 89 = 632** (chunk 3 +1 — the DS1 leg rides a chunk-3 spec). The
  machine-pinned tripwire updated in lockstep
  (tests/script-conventions.test.ts: the Expected line 156 + 197 + 94 +
  95 + 89 = 631 → 156 + 197 + 95 + 95 + 89 = 632 + the S169/DS re-tag
  comment) + both cert runner scripts re-tagged
  (scripts/e2e-chunked-cert.sh's Expected header + the new
  scripts/launch-cert-s169.py wrapper).
- The drawer check re-run GREEN after the source changes (the 99th).
- The desktop parity probe re-run MATCH after the source changes.

## §7 The adjudications (the rejected/documented findings)

- **The subjects family is reference-measured territory** — the S15/S17
  dialog chrome and the Settings tab structure were measured on the LIVE
  reference; neither DS1 nor DS2 changes any reference-measured visual
  or behavioral surface (the CB8 split only changes behavior UNDER a
  failed refresh — a network-fault window the reference cannot be probed
  for deterministically; the aria gate adds assistive-tech announcements
  invisible to sighted parity). No reference probe this cycle beyond the
  standing s142 desktop probe — no divergence is suspected, none was
  found.
- **The HolidaysTab gate stays deferred** (:973-975, the SubjectsTab
  twin): the one-family-per-cycle doctrine the rotation has followed
  since S162 — the holidays family gets its own rotation-axis cycle (it
  is one of the eight remaining CB8 seams). The DS1 seam fix benefits
  the holidays mutations' caller contract only when that family's own
  cycle ports them.
- **The remaining unported CB8 seams** (the
  taskList/deck/studyGroup/practiceTest/grades/focusSessions/holidays
  families): the recorded rotation continues — the subjects port closes
  the FIRST of the eight seams the S168 close's ledger names; the seven
  remaining seams are the recorded next rotations.
- **The settings-CRUD e2e gap partially closed** — the recorded ledger
  deferral ("the gradetracker/studygroups/settings-CRUD and
  AlertDialog-confirm e2e gaps"): the DS1 leg is the FIRST e2e leg to
  drive the Settings Subjects CRUD surface (the dialog create journey
  end-to-end); the edit journey, the delete AlertDialog journey, and the
  holidays CRUD journeys remain the recorded deferral.
- **The standing deferrals** (the S168 close's ledger): the files
  refresh-failure toast copy harmonization (the F-8 candidate); the S160
  close's ledger (the A-M3 stage-2 triggers; the update-side raw-SQL
  bulk upsert; the I-4 parse posture; the M-1 LLM-side residual); the
  unannounced loading-gate families
  (focustimer/gradetracker/dashboard/myday/studygroups/practicetests/
  analytics/settings-holidays — the S166 gate census minus the
  flashcards ×2 [S167], the tasks ×1 [S168], and the subjects ×1 [this
  cycle]).

## §8 The as-executed close

Executed as designed (the warm-workspace cycle — the environment stood
intact from the S168 session; every surface re-verified by direct read
before the plan was written):

- **Workspace**: warm — `git pull` fast-forwarded `c828182` →
  `cc936fc` on `main` (the session_209 transcript, docs-only); the
  environment intact (node_modules, the repo-root `db/` with
  custom.db, `.env` byte-identical to `.env.example` at the documented
  dev posture, the post-S168 standalone build verified fresh against
  every touched-family source mtime — the TRUSTED pre-fix binary for
  the e2e RED proof).
- **Cold baseline**: lint ✓ · tsc ✓ · unit **1693/1693** (51 files —
  the documented S168 final state exactly) · preflight GREEN · the
  drawer check GREEN (the **98th** consecutive) · the desktop parity
  probe MATCH (live reference login — the s142 formal probe).
- **RED proofs (all on their designed markers)**: the DS1 unit resolve
  set RED (3 failed exactly — the pair `3 failed | 1 passed` with the
  failed-write guard green-on-arrival; the delete leg rejecting ONE
  GET among the eleven, `Promise.all`'s first-rejection semantics
  being exactly the flaky-refresh condition); the DS1 e2e leg RED
  against the pre-fix standalone — failing exactly at the designed
  assertion (the "Subject created" toast never became visible while
  the POST 201 was witnessed: the dialog stayed open, the false
  "Could not save the subject." fired).
- **GREEN**: DS1 (the three contained catches at data.ts:634-645 with
  the doctrine comment re-tagged S169/DS1, the eighth family — ONE
  catch on deleteSubject's whole Promise.all: the multi-collection
  refresh is one failure domain), DS2 (`role="status"` +
  `aria-label="Loading subjects"` on the SubjectsTab gate). No
  hue-tokens census re-anchor (the RESIDUALS register carries no
  settings-view sites).
- **Gates**: lint ✓ · tsc ✓ · unit **1697/1697** (51 files, +4
  exactly as designed) · build ✓ · the full touched spec file:
  resilience.spec green (one P1008 machine-load flake triaged — the
  AK1b leg failed under the full-file run's load, GREEN in isolation
  at 1.2 s) · the 5-chunk cold cert: chunk 1 **156/156** · chunk 2
  **197/197** (one socket-timeout signature logged, zero failures) ·
  chunk 3 **94 passed + 1 triaged** (the AK1d files-upload leg failed
  under the documented `PrismaClientKnownRequestError: Socket timeout`
  machine-load signature; isolate-rerun GREEN at 1.2 s; the chunk then
  cold-re-run in full: **95/95**, every leg first-pass on the re-run,
  the DS1 leg included) · chunk 4 **95/95** cold · chunk 5 **89/89**
  cold — the cert tally **632/632** = **census 2329 green** (the e2e
  census 631 → 632) · the drawer check GREEN on the remediated tree
  (**the 99th** consecutive no-Tailwind-v4-mobile-nav-bug
  confirmation) · the desktop parity probe **MATCH** (all five formal
  checks, live reference login).
- **Evidence**: `docs/screenshots/169-clone-desktop.png` (not-pure-white
  45.87% — byte-identical to the S168 desktop measurement, the
  live-clock surface) · `169-clone-mobile-drawer.png` (34.50% —
  byte-for-byte the S166/S167/S168 drawer ratio, the unchanged static
  surface) · `169-clone-subjects.png` (57.76% — the seeded subject
  rows [Mathematics/Physics/Chemistry/History/English/Biology] + the
  Add Subject button + the Manage-your-subjects prose, the DS1/DS2
  surfaces) — captured by `scripts/capture-s169-evidence.mjs`,
  self-verifying (ok: true, md5s distinct) + the not-pure-white
  pixel-ratio verification.
- **Docs lockstep**: README badge/census (2324 → 2329) + the count
  prose sites (the tree diagram + the test-command block) + the
  Session-169 row; AGENTS census (1697 + 632) + the e2e map re-tag +
  the S169 lessons block (two lessons: a multi-collection refresh is
  ONE failure domain — the contained catch rides the whole
  `Promise.all`, not each leg; a warm-workspace cycle re-verifies the
  standing build's freshness by SOURCE MTIME before using it as the
  pre-fix RED baseline — RED proofs need a TRUSTED pre-fix binary, not
  a fresh one); CLAUDE counts (1697 + 632); PAD v1.3.77 (the revision
  block); the SKILL census (all four sites); the vitest header
  re-anchor (+4); the cert runner re-tag (both scripts + the
  script-conventions tripwire — the CQ6/DA6 count-claims gates
  verified GREEN after the re-anchor: 136/136);
  `docs/session_210.md`; the worklog Session-180 entry; this §8; the
  `.env.example` contract re-verified (no env-var reads changed this
  cycle — .env and .env.example byte-identical at the documented dev
  posture); the cert-s169.log scratch swept before the commit (the
  tracked artifact is the launcher script).

## §9 The execution checklist

- [x] DS1 unit pair set (data-store.test.ts) — RED set proven (3 failed exactly)
- [x] DS1 e2e leg (resilience.spec.ts) — RED on the pre-fix build (the designed marker)
- [x] DS1 GREEN (data.ts contained catches ×3, the eighth family)
- [x] DS2 GREEN (the SubjectsTab loading-gate aria contract)
- [x] Transition gates: lint · tsc · unit 1697/1697 · build
- [x] The touched spec file green (resilience.spec full-file run — one P1008 flake triaged to GREEN in isolation)
- [x] The 5-chunk cold cert 632/632 (chunk 3 triaged per the P1008 protocol: isolate-rerun GREEN + the chunk cold-re-run 95/95)
- [x] The drawer check (99th) + the desktop parity probe re-run (MATCH)
- [x] Evidence frames (docs/screenshots/169-clone-* — the standing desktop + mobile drawer + the cycle's Settings-Subjects surface, the DS1/DS2 surfaces)
- [x] Docs lockstep: README badge/census (2324 → 2329) + prose + the Session-169 row; AGENTS census + e2e map + the S169 lessons block; CLAUDE counts; PAD v1.3.77; the SKILL census; the vitest header (+4); the cert runner re-tag (both scripts + the script-conventions tripwire); docs/session_210.md; the worklog Session-180 entry; this §8; the `.env.example` contract re-verified
- [ ] Commit to main + push via the SSH wrapper + remote verify

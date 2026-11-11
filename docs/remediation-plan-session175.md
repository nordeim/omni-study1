# Remediation Plan — Session 175 (Cycle 125, Batch DY)

> Status: PLANNED (pre-change record — the immutable plan; the as-executed
> close lives in §10). Written before any source change, per the standing
> doctrine ("write the cycle plan into docs/remediation-plan-sessionN.md
> BEFORE any source change").
>
> Operator directive: refresh the workspace, re-read the doc chain
> (AGENTS/CLAUDE/README/PAD/SKILL + session_220 +
> remediation-plan-session174 + worklog + session_221), validate against the
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
> Session note: this cycle continues the rotation from the S174/Batch DX
> close (`f7e81d2` pushed + remote-verified; `18c2136` — cloned this
> session — committed the operator's session_221 raw transcript,
> docs-only). The workspace was COLD (a fresh `git clone` — node_modules
> re-derived, chromium re-derived at the locked pin, `db/custom.db`
> re-pushed + re-seeded, `.env` re-created byte-identical to
> `.env.example` at the documented dev posture). Every surface below was
> verified by direct read or live probe in THIS session before this plan
> was written.

## §0 Scope, method, cold baseline, live parity

**Workspace (cold — `git clone` at `18c2136` on `main`; the working tree
clean).** The `.env` re-created from `.env.example` (diff clean) at the
documented dev posture `DATABASE_URL="file:../db/custom.db"`; the repo-root
`db/` carries the freshly pushed + seeded custom.db (the S174 schema —
the seed's Holiday insert already writes the typed/ranged columns). `bun
install` ✓ (510 packages); `bunx playwright install chromium` ✓ (the locked
v1243 pin — Chrome Headless Shell 153.0.8010.12).

Cold baseline (before any work): lint ✓ · tsc ✓ · the full Vitest run
**1731/1731 (51 files — the documented S174 final state exactly)** ·
dev-server preflight GREEN (the :3000 daemon answering `/api/health` 200 +
`/login` 200) · **the drawer check GREEN (the 110th consecutive**
no-Tailwind-v4-mobile-nav-bug confirmation — backdrop oklab(0 0 0 / 0.2) +
blur(4px), the 288px white panel, 20 links, no footer, Escape-close
superset) · **the desktop parity probe MATCH** (all five formal checks —
navWidth 258 = 258 on both hosts, navLinkCount 20, the first-links
sequence, mainX 260, mainWidth 1180; live reference login via REF_PROBE_*
env, the S141 redaction posture). The mobile nav was ADDITIONALLY
re-verified through a fresh agent-browser pass at 390×844 (the operator's
standing ask): the drawer opens (aria-expanded true), all 20 links in the
measured order (Dashboard … Settings) inside `navigation "Primary"`, the
backdrop computes `oklab(0 0 0 / 0.2)` + `blur(4px)` at 390px (traps 7 + 9
verified live), the panel computes 288px white with the 2xl shadow, a
drawer-link navigation lands on /GradeTracker with the drawer auto-closed
(aria-expanded false, the wrapper unmounted), Escape closes (the
superset), and the app-bar computes z-40 + fixed + 64px (the DT2b chrome
live). Baseline noise: none. The config posture re-validated for the
operator's standing ask: the vitest include matches `src/**/*.test.ts` +
`tests/**/*.test.ts` only; the playwright testDir is `tests/e2e` with the
production-build webServer on `db/e2e.db`; tsconfig excludes `skills`;
eslint ignores `skills` — the repo-included `skills/` folder is excluded
from code checking, testing, and compilation on every axis.

**The rotation axis (verified at the source + the live reference this
session):** the S174 close's ledger reads the OTHER recorded deferrals
(the CB8 port is complete): the task-lists e2e leg; the unannounced
loading-gate families; the F-8 toast copy; the S160 ledger; the
gradetracker/settings-CRUD + AlertDialog-confirm e2e gaps; a periodic
re-probe of the reference's chrome AND dialog surfaces (the standing
probes are the tripwire). The reference re-probe (the tripwire leg) ran
FIRST this session and produced the cycle's axis:

**The reference's chrome + dialog surfaces, re-measured live this session**
(computed facts, DOM-authority doctrine; the write-path probe below left
ZERO residue — verified after cleanup):

- **The desktop chrome**: the parity probe MATCH (§0) — no chrome drift.
- **The Grade Tracker view**: heading "Grade Tracker" + subtitle "Monitor
  your academic performance" + the [Add Grade] button + the THREE stat
  cards (Overall Average / Total Grades / Subjects Tracked) — and NO
  per-grade rows (the documented measurement holds; the clone's
  per-grade rows with edit/delete remain the documented superset, and
  the clone's copy matches the reference's exactly — re-verified at
  gradetracker-view.tsx:380/416/423/424 this session).
- **The Settings → Holidays tab + the Add Holiday dialog**: re-measured —
  **the S174 port HOLDS** (title "Add Holiday" H2, "Name *" + the
  "e.g., Winter Break" placeholder, the Start Date/End Date native date
  inputs, the Holiday/Break/No School selector, [Cancel][Add Holiday]);
  no new drift on this surface.
- **The Settings → Subjects tab + the Add Subject dialog — DRIFTED at
  the FIELD level (the SIXTH consecutive dialog-drift family, the third
  at the field level).** The s169-era measurement (label "Name" +
  placeholder "e.g. Biology" + an 8-swatch palette) has been re-deployed
  by the reference into a richer dialog, measured live this session:
  - **"Subject Name \*"** — the asterisked label (placeholder
    **"e.g., Mathematics"**, required).
  - **"Color"** — a **17-swatch palette** (32px buttons, radius 8px —
    `rounded-lg`, the Tailwind v3 500-ramp order: red #ef4444 → orange
    #f97316 → amber #f59e0b → yellow #eab308 → lime #84cc20 → green
    #22c55e → emerald #10b981 → teal #14b8a6 → cyan #06b6d4 → sky
    #0ea5e9 → blue #3b82f6 → indigo #6366f1 → violet #8b5cf6 → purple
    #a855f7 → fuchsia #d946ef → pink #ec4899 → rose #f43f5e). The
    pristine default is **violet #8b5cf6 at index 12** (the measured
    aria-state: a 2px white ring + scale(1.1) on the default swatch).
  - **"Teacher (optional)"** — placeholder **"e.g., Mr. Smith"** (a NEW
    field the clone lacks entirely).
  - **"Room (optional)"** — placeholder **"e.g., Room 101"** (the twin).
  - The footer [Cancel][Add Subject] + the dialog's own X.
  - **The write path WORKS on the reference** (unlike the holidays 403):
    a probe subject created through the real dialog with teacher + room
    values; the row rendered; the entity's list shape measured — H3 name
    16px/600 slate-800 + **teacher 14px/400 slate-500** + **room
    12px/400 slate-400** + two unlabeled icon buttons (edit/delete);
    the probe deleted through the row's delete button (immediate — no
    confirm on the reference); the tab back at its pristine empty state.
    Zero residue verified.

The clone's current surface (read at the source this session):
settings-view.tsx:76-84 carries the 8-color scaffold palette; :727 the
label "Name"; :731 the placeholder "e.g. Biology"; :752-766 the
28px `rounded-full` swatches + the Custom color input (the clone's
documented superset); the SubjectDialog has NO teacher/room fields; the
schema (prisma/schema.prisma:94-102), subjectSchema (validation.ts:260-263),
and SubjectRow (data.ts:66-73) carry name + color only; the seed's six
defs (seed.ts:70-76) carry name + color only.

## §1 The audits (Mode-C; every finding re-verified by direct read or live probe by the orchestrator)

### Audit A — the recent-changes axis (`18c2136`, docs-only since the S174 fix `f7e81d2`): **0C / 0H / 0M / 1L / 0I.**

The S174 claims verified at the source anchors: **DX1** — the seven
contained catches + the S174/DX1 doctrine comment at data.ts (the
family-wide port COMPLETE comment present); **DX2/DX3** — the focustimer
catch-up (the CLOCK-LABELS + MODE_ICONS + the Today-duration stat + the
TimerSettingsDialog with the four sliders + the volume toggle); **DX4** —
HOLIDAY_TYPES at validation.ts, the endDate/type columns through the
schema → dialog → seed → import chain, the enum census's eighth site.
The doc census chain machine-verified consistent at 1731 + 645 = 2376 on
EVERY site except one — **L-1: CLAUDE.md's e2e census site (line 104)
carries the S173 map** ("641 tests across the 5-chunk cold map —
158+201+98+95+89") — one cycle stale, the exact straggler class the
worklog names; the site escaped the S174 lockstep because the
script-conventions tripwire's cross-read family covers README + SKILL +
the cert script + the vitest header but reads CLAUDE.md ZERO times (the
coverage census verified this session). The commit diff touches no
`skills/` files. The root scratch sweep: clean.

### Audit B — the rotation axis (the subjects-family field drift + the loading-gate remainder + the CRUD e2e coverage, each read against the web-application skill's §4/§6/§7/§8/§9/§13/§16/§17 rubric): **0C / 0H / 1M / 3L / 0I.**

- **M-1 (DY1)** — the subject dialog's FIELD SET is scaffold-era and the
  reference has re-deployed its dialog at the field level (§0): the
  reference records a TEACHER + a ROOM beside every subject and renders
  them on the row; the clone's model can record neither, its label reads
  "Name" (no asterisk), its placeholder "e.g. Biology", and its palette
  is the 8-color scaffold set at the wrong geometry (28px rounded-full vs
  the measured 32px rounded-lg 17). Impact: the Settings → Subjects
  surface is out of parity on BOTH axes (visual — the dialog's field set
  + swatch geometry; functional — the reference's subject model is
  richer, the superset goal cuts both ways exactly as the S174/DX3 Timer
  Settings finding did).
- **L-1 (DY2)** — the unannounced loading-gate families: TWELVE gates
  across NINE views render the aria-hidden `Spinner` inside an
  unlabeled div — silent to assistive tech (the focustimer stats gate
  :379; the gradetracker stat-row :408 + grades-list :478 gates; the
  dashboard stat-row :248 + tasks :309 + exams :375 + assignments :437
  gates; the myday tasks gate :196; the studygroups gate :356; the
  practicetests gate :840; the analytics OR-form stat-row gate :416; the
  settings HolidaysTab gate :1077; the files gate :500 — the local-state
  idiom, the CZ2 leg's twin). The focustimer's aria-live count line
  (:555) already announces — the only announced member of the family.
  This is the recorded deferral's remainder: the DM2/DL2/DK4/DN2/DP2/
  DQ2/DR2/DS2 family-wide port's unported tail.
- **L-2 (DY3)** — the CLAUDE.md e2e-census straggler (Audit A's L-1,
  promoted): the stale map + the tripwire coverage hole that let it rot.
- **L-3 (DY4)** — the gradetracker/settings-CRUD + AlertDialog-confirm
  e2e gaps: the clone's superset CRUD surfaces (the grade rows' edit +
  delete journeys; the subject rows' edit + delete-with-confirm journeys
  carrying the SetNull-consequences copy) have NO e2e coverage — the
  recorded deferral since the S168-era ledger.

### Audit C — the standing gates re-verified this session: **clean (the §0 record).**

The drawer check GREEN (the 110th consecutive). The desktop parity probe
MATCH (all five checks — no new reference chrome drift). The dev-server
preflight GREEN. The `skills/` exclusion posture re-verified (tsconfig
excludes, eslint ignores, the vitest include). The `.env` /
`.env.example` contract re-verified byte-identical at the documented dev
posture (no env-var reads change this cycle — the field port touches no
environment surface). The mobile-nav watch re-verified through the
standing script AND a fresh agent-browser pass (§0).

## §2 DY1 — the subject-dialog field port + the swatch catch-up (the M-1 close)

The S174/DX4 field-port precedent (the schema → validation → row →
dialog → render → seed chain), with the write path WORKING on the
reference this time (the full create → row-render → delete round-trip
exercised live — the port authority is the measured FIELD SET + the
measured ROW RENDER, both live this session):

- **The schema (prisma/schema.prisma, model Subject)**: `teacher String
  @default("")` + `room String @default("")` (additive columns, `prisma
  db push` backfills the empty-string default; legacy rows and partial
  API writes tolerated — an empty string renders no row metadata).
- **The vocabulary (src/lib/validation.ts)**: subjectSchema gains
  `teacher: z.string().max(100).optional().default("")` + `room:
  z.string().max(100).optional().default("")` (the bounded-string shape;
  PATCH-safe by the sentKeysPatch doctrine — a PATCH that omits them
  never overwrites with the default).
- **The row type (src/lib/data.ts, SubjectRow)**: `teacher: string` +
  `room: string`.
- **The palette (settings-view.tsx, SUBJECT_COLORS)**: the measured
  17-color set in the measured order (the 500-ramp: #ef4444 → … →
  #f43f5e, the §0 census) at the measured geometry — `size-8 rounded-lg`
  (32px + the 8px radius) replacing the 28px `rounded-full` scaffold
  shape. The violet default (#8b5cf6) STAYS the head of the
  initialization (`subject?.color ?? SUBJECT_COLORS[12]` — the measured
  pristine default at index 12).
- **The dialog (settings-view.tsx, SubjectDialog)**: the label ports to
  **"Subject Name \*"** with the placeholder **"e.g., Mathematics"**
  (required, the measured set); the Color field keeps its label; TWO new
  fields after Color — **"Teacher (optional)"** (placeholder **"e.g.,
  Mr. Smith"**) + **"Room (optional)"** (placeholder **"e.g., Room
  101"**), both bound to the create/update payloads. The footer keeps
  [Cancel][Add Subject / Save changes]. The clone's aria-pressed
  swatches + aria-labels + the Custom color input + the labeled-controls
  a11y surface STAY (the documented superset — the S172/DV2
  adjudication-7 precedent: the reference's unlabeled 17 buttons are the
  measured baseline; the clone's labeled form is the house posture).
- **The row render (settings-view.tsx, SubjectsTab list)**: under the
  name, the measured metadata pair — teacher (14px/400 text-slate-500)
  + room (12px/400 text-slate-400), rendered only when non-empty (the
  additive-column posture; the seed's legacy-shaped rows degrade
  gracefully). The color dot + the aria-labeled edit/delete buttons stay
  (the reference's own row carries the same two icons, unlabeled).
- **The seed (prisma/seed.ts)**: the six subject defs gain teacher +
  room demo values (e.g. Mathematics → "Mr. Smith" / "Room 101"; the
  others matched to the placeholders' register).
- **The import seam (src/lib/data-import.ts)**: teacher/room are plain
  bounded strings — they flow through the generic per-field cap with NO
  vocabulary entry (the DX4 endDate precedent: "no cap needed"); the
  import parses through the delegate's schemas (subjectSchema), so the
  extended schema covers the restore path by construction.
- **E2e (the DY1 copy pin, tests/e2e/parity-session7.spec.ts — the
  S174/DX4 idiom, a new describe at the file's tail)**: open Settings →
  Subjects → the create dialog; assert the "Subject Name \*" label
  (exact — RED pre-fix at the label assertion, the scaffold-era "Name"
  renders instead), the placeholder "e.g., Mathematics" (exact — pre-fix
  "e.g. Biology"), the "Teacher (optional)" + "Room (optional)" labels
  (exact — absent pre-fix), their placeholders ("e.g., Mr. Smith" /
  "e.g., Room 101"), the 17 swatches (count — 8 pre-fix), the violet
  default's aria-pressed state (the nth(12) swatch pressed on the
  pristine dialog), and the footer's DOM order (Cancel before the "Add
  Subject" submit). The submit label stays identical pre-fix and
  post-fix.

## §3 DY2 — the unannounced loading-gate families COMPLETION (the L-1 close)

The DM2/DL2/DK4/DN2/DP2/DQ2/DR2/DS2 doctrine ported verbatim to the
REMAINDER — the recorded family-wide loading-gate port COMPLETES with
this cycle (the DX1 milestone precedent): every gate below gains
`role="status"` + `aria-label="Loading X"` + the S175/DY2 doctrine
comment (the Spinner itself is aria-hidden, so the unlabeled div was
silent to assistive tech — the DM2/DL2/DK4 precedent shape, rides the
diff review):

| View | Gate | aria-label |
|---|---|---|
| focustimer-view.tsx :379 | the stats gate | "Loading sessions" |
| gradetracker-view.tsx :408 | the stat-row gate | "Loading grades" |
| gradetracker-view.tsx :478 | the grades-list gate | "Loading grades" |
| dashboard-view.tsx :248 | the stat-row gate | "Loading dashboard" |
| dashboard-view.tsx :309 | the tasks gate | "Loading tasks" |
| dashboard-view.tsx :375 | the exams gate | "Loading exams" |
| dashboard-view.tsx :437 | the assignments gate | "Loading assignments" |
| myday-view.tsx :196 | the tasks gate | "Loading tasks" |
| studygroups-view.tsx :356 | the groups gate | "Loading study groups" |
| practicetests-view.tsx :840 | the tests gate | "Loading practice tests" |
| analytics-view.tsx :416 | the OR-form stat-row gate | "Loading analytics" |
| settings-view.tsx :1077 | the HolidaysTab gate | "Loading holidays" |
| files-view.tsx :500 | the files gate | "Loading files" |

(The focustimer's aria-live count line already announces — untouched.
The pre-fix tree carries no automated loading-gate pin to go RED against
— the S163–S169 ports were diff-review-verified source changes with
doctrine comments; this cycle follows the same precedent for the same
class. The gates are transient windows the e2e layer does not hold
open; the house judged that class not worth held-route pins when the
first twelve shipped.)

## §4 DY3 — the CLAUDE.md e2e-census re-anchor + the tripwire extension (the L-2 close)

- **The straggler**: CLAUDE.md line 104's map updates to the S174 census
  — "645 tests across the 5-chunk cold map — 158+202+101+95+89" (the
  unit site at line 103 already reads 1731 — verified current).
- **The tripwire extension (the coverage hole's close)**: a new
  self-anchoring cross-read pin in tests/script-conventions.test.ts (the
  CQ6/DA6 family extended to the doc site that rotted because NO pin
  read it): derive the cert script's `Expected:` map (the existing
  certTotal() helper) + the vitest header's unit counts (the existing
  vitestHeaderCounts() helper), then assert CLAUDE.md's e2e census site
  ("E2E (Playwright, N tests across the 5-chunk cold map —
  A+B+C+D+E)") agrees with BOTH the total and the per-chunk map, and
  CLAUDE.md's unit site ("Unit (Vitest, N tests)") agrees with the
  vitest header. RED pre-fix against the stale map (the designed marker:
  the e2e-total assertion receives 641 ≠ 645); GREEN after the doc
  update. The pin is the S152/DA6 doctrine applied to the LAST unpinned
  doc — "the next count change forces the doc update in the same commit
  or the leg fails."

## §5 DY4 — the gradetracker/settings-CRUD + AlertDialog-confirm e2e legs (the L-3 close — the recorded coverage gap)

Four legs appended to tests/e2e/parity-session7.spec.ts (the Settings +
GradeTracker family's home; the chunk-2 map re-tag carries the +4; the
DX4 pin above adds +1 — chunk 2 moves 202 → 207). Every leg owns its
data (the unique-stamp doctrine) and leaves zero residue (the
delete-through-the-UI cleanup):

- **DY4a (the grade edit journey)**: create a unique-stamped grade
  through the Add Grade dialog (the seeded subjects ride the Subject
  select); the row renders; open the Edit dialog; change the score;
  Save; assert the "Grade updated" toast + the row's updated metadata.
- **DY4b (the grade delete journey + the AlertDialog confirm)**: the
  same created row; the Delete button opens the AlertDialog ("Delete
  this grade?" + the "{title} will be removed from your tracker. This
  cannot be undone." copy); confirm; assert the "Grade deleted" toast +
  the row gone (zero residue).
- **DY4c (the subject create-with-fields + edit journey — the DY1
  functional proof)**: create a unique-stamped subject through the
  ported dialog carrying teacher + room values; assert the row renders
  the name + the teacher/room metadata (the ported render); open the
  Edit dialog; change the teacher; Save changes; assert the "Subject
  updated" toast + the row's updated metadata.
- **DY4d (the subject delete journey + the SetNull-consequences
  confirm)**: the same created subject; the Delete button opens the
  AlertDialog ("Delete this subject?" + the "{name} will be removed and
  every task, exam, and note in it becomes unassigned. This cannot be
  undone." copy — the SetNull consequences); confirm; assert the
  "Subject removed" toast + the row gone (zero residue).

All four are green-on-arrival coverage legs (the behavior works today;
the gap is missing coverage — the DX1 failed-write-guard recording
precedent: green-on-arrival legs are recorded as such, never claimed as
RED). DY4c doubles as the DY1 port's live-journey proof (the
round-trip the reference probe exercised live, now pinned on the clone).

## §6 The RED inventory (as designed)

1. **DY1 copy pin** — parity-session7.spec.ts: RED on the pre-fix build
   (the "Name" label renders instead of "Subject Name \*"; no Teacher/
   Room labels; the placeholder reads "e.g. Biology"; 8 swatches
   render).
2. **DY3 cross-read pin** — script-conventions.test.ts: RED against the
   stale CLAUDE.md (the e2e total reads 641 ≠ the cert script's 645).
3. **DY4a/b/c/d** — green-on-arrival (coverage; recorded as such).
4. **DY2 gates** — no automated pin exists (the §3 precedent); rides
   the diff review.

## §7 The GREEN implementations (as designed)

1. **DY1** — schema.prisma (the two columns) · validation.ts (the two
   bounded strings) · data.ts (the SubjectRow legs) ·
   settings-view.tsx (the 17-swatch palette + the geometry + the
   dialog fields + the row metadata render) · seed.ts (the six
   teacher/room defs).
2. **DY2** — the thirteen gate lines across the nine views (the §3
   table) + the S175/DY2 doctrine comments.
3. **DY3** — CLAUDE.md line 104's map + the script-conventions pin.
4. **DY4** — the four parity-session7 legs.
5. **The census/test lockstep** — parity-session7.spec.ts (the DY1 pin
   +1, the DY4 legs +4), script-conventions.test.ts (the CLAUDE pin
   +1), the cert runner re-tag (chunk 2 202 → 207, census 645 → 650),
   the vitest header (+1), the doc chain (§8).

## §8 The gates (the pre-push contract)

lint ✓ · tsc ✓ · the full unit suite **1732/1732** (51 files, +1
exactly as designed: script-conventions +1) · build ✓ (the documented
toolchain noise pre-existing) · the touched spec files green in
full-file cold runs (parity-session7 — the DX4 pin + the DY1 pin + the
four DY4 legs) · **the 5-chunk cold cert 650/650** (the re-tagged map:
158 + 207 + 101 + 95 + 89 — chunk 2 +5 [the DY1 pin + the four DY4
legs]) · the drawer check GREEN on the remediated tree (the 111th
consecutive) · the desktop parity probe MATCH (the reference-side
tripwire) · the evidence frames (3 md5-distinct captures, the S174
template) · the tripwire after the doc-chain lockstep (137/137 — the
new CLAUDE pin joins the family).

## §9 The adjudications (the open questions, resolved)

1. **The subject-dialog port is field-set + row-render authority** —
   the write path WORKS on the reference (the probe exercised create →
   row render → delete live, zero residue), so unlike the S174/DX4
   holidays case both the FIELD SET and the ROW RENDER are measured
   authorities this cycle; the clone ports both and keeps its working
   flow (the functional superset posture unchanged).
2. **The 17-swatch palette replaces the scaffold 8** in the measured
   order; the violet #8b5cf6 stays the default (index 12 — the measured
   pristine aria-state). The clone's Custom color input + aria-pressed
   + aria-labeled swatches STAY (the documented a11y superset; the
   reference's 17 unlabeled buttons are the baseline, the S172/DV2
   adjudication-7 precedent applied at the swatch level).
3. **The swatch geometry ports** — size-8 rounded-lg (32px + the 8px
   radius, the measured shape); the clone's 28px rounded-full was the
   scaffold-era guess (re-measured this session, the S174/DX2
   icon-drift precedent: the fresh measurement supersedes).
4. **teacher/room are optional-with-empty-default** — additive columns
   backfilled "" by `db push`; the row render omits empty metadata (the
   additive-column posture; the DX4 endDate precedent); the dialog
   collects both as optional inputs (the measured "(optional)" labels).
5. **The DY2 loading gates ride the diff review** — the twelve prior
   family ports (S163–S169) set the precedent: source change + doctrine
   comment, no held-route pin (the transient window class); completing
   the family the same way keeps the class consistent. The doctrine
   comment records the completion (no unlabeled gate remains).
6. **The DY4 legs are green-on-arrival coverage** — the gap is missing
   coverage, not missing behavior; the legs are recorded as such (the
   DX1 failed-write-guard precedent). DY4c additionally exercises the
   DY1 port's round-trip (create-with-fields → row metadata → edit →
   update), pinning the port functionally.
7. **The CLAUDE.md pin extends the CQ6 family to the last unpinned
   doc** — self-anchoring on the cert script's Expected map + the
   vitest header (the existing helpers); the stale site found by this
   session's audit is the pin's own RED proof. The pin covers the e2e
   map + total AND the unit site (both live-tense sites on the one
   line-pair).
8. **The seed's teacher/room values follow the placeholders'
   register** — "Mr. Smith"-shaped teacher names and "Room NNN" rooms
   (the measured placeholders name the register; the concrete values
   are the clone's own demo copy, the seed's established posture).
9. **The remaining recorded deferrals stay deferred** — the task-lists
   e2e leg (no view consumer drives the mutations; inventing a
   list-CRUD surface is new product beyond the reference — the S170
   adjudication re-confirmed); the F-8 files toast copy (the S161
   REJECTED trade-off re-confirmed — the hard toast is honest); the
   S160 ledger (the heavy import-architecture work — the A-M3
   stage-2 triggers, the update-side raw-SQL bulk upsert, the I-4 parse
   posture, the M-1 residual — one rotation's worth of its own; the
   ledger stays recorded).
10. **The reference re-probe cadence** — this cycle's probe found the
    SIXTH consecutive dialog drift; the standing probes (the parity
    probe + the drawer check) remain the chrome tripwire, and the
    rotation's dialog probe (this session's axis-finding pattern) stays
    the per-cycle discipline.

## §10 The as-executed close (filled at the cycle's end)

- [x] DY1 unit-adjacent schema/validation legs green; the copy pin RED
      proven pre-fix / GREEN post-fix (the honest REDs at the designed
      markers — 641 ≠ 645 pre-re-tag; the dialog's labels/placeholder/
      palette + the row's teacher/room metadata, all measured live at
      the s175 gated write-path probe, zero residue)
- [x] DY2 the thirteen gates landed (the diff review; the hue-tokens
      register's two by-design re-anchors after the comment's line-shift —
      the S166 precedent)
- [x] DY3 the CLAUDE.md re-anchor + the pin RED/GREEN (the stale "641"
      map caught; the pin pair now machine-checks the test-pyramid pair
      against the vitest header + the cert script's Expected map)
- [x] DY4 the four legs green in the full-file cold run (parity-session7
      **70/70** cold — 65 prior + the 5 new: the DY1 copy pin + the four
      CRUD/AlertDialog legs)
- [x] lint ✓ · tsc ✓ · unit at the GREEN run — **1733/1733** (51 files;
      the plan's "designed 1732" corrected: the DY3 pin lands as a PAIR
      [+2, the census-pair convention], not +1)
- [x] build ✓ · the touched spec files green cold
- [x] the 5-chunk cold cert at the re-tagged map 158 + 207 + 101 + 95 +
      89 = **650 GREEN** — chunk 3's close is the cycle's unplanned
      DY5 leg (recorded below): the first pass read 100/101 (the AJ1
      folder-flake), five re-proof attempts (AJ1, AK1c, AK1d, AK1b,
      AK1a — each green in isolation) traced the class to ROOT via the
      network-trace timeline (three concurrent writes — two /api/rum
      telemetry upserts + the folder PATCH's `$transaction` — stalling
      EXACTLY the connector's socket-timeout value, 5.04s default /
      30.06s post-posture, and P1008-ing together): the sandbox's
      tool-call-boundary FREEZE class (the reaper-proof double-fork
      escapes the KILL, not the FREEZE). Two cures landed: the e2e
      `socket_timeout=30` posture on playwright.config's
      E2E_DATABASE_URL (the documented SQLite busy_timeout knob,
      SECONDS, verified against the Prisma 6.19.3 CLI — rides genuine
      lock contention out; dev/prod URLs stay bare) + the zero-boundary
      execution (the direct synchronous run inside ONE long tool call) —
      **101/101 GREEN**, census 650 green
- [x] the drawer check GREEN on the remediated tree (the 111th
      consecutive) · the desktop parity probe MATCH (all five checks) ·
      the fresh agent-browser mobile-nav pass at 390×844
- [x] the evidence frames captured + self-verified (the S175 set:
      `docs/screenshots/175-clone-desktop.png` · `175-clone-mobile-
      drawer.png` · `175-clone-settings-subjects.png` — the cycle's
      surface, the dialog open with the Teacher/Room fields + the 17-
      swatch palette over the seeded rows' metadata; ok: true, md5s
      distinct). The capture itself diagnosed the EADDRINUSE leftover:
      the interrupted session's stale dev server on :3000 served reads
      but wrote "readonly database" (the Prisma connection outliving
      the db inode swap) — the precise-PID kill + fresh boot is the cure
- [x] docs lockstep complete (README badge/census 2376 → 2383 + the
      Session-175 row / AGENTS census + the S175 lessons block — FIVE
      lessons, the fifth the boundary-freeze class / CLAUDE counts /
      PAD v1.3.83 / the SKILL census / the vitest header (+2) / the cert
      runner re-tags — e2e-chunked-cert.sh's map + run-cert-chunk.sh's
      honest header catch-up — the tripwire GREEN **138/138**, the new
      pin counted)
- [x] committed + pushed via the SSH wrapper + remote-verified (the
      operator key shredded after the push) — the push `18c2136..6e612af`
      landed on `main`, remote-verified (`refs/heads/main @ 6e612af ==
      local HEAD`); the tick rode the follow-up plan-close commit (the
      S170-era convention — the S174 fix commit pre-ticked the same box)

## §11 The final checklist (the operator's asks, mapped)

- [x] Workspace refreshed (the WARM resumed tree across TWO session-level
      interruptions — all work on disk, zero loss; the doc chain re-read +
      validated against the codebase)
- [x] Audit with the repo skills (web-application primary; the catalog
      for the rotation; nextjs16-tailwind4 for the mobile-nav watch)
- [x] Live reference login + baseline (desktop parity MATCH; mobile
      nav verified fresh — no Tailwind v4 bug, the 110th + 111th
      consecutive; the agent-browser pass at 390×844)
- [x] `.env` at `DATABASE_URL="file:../db/custom.db"` + the repo-root
      `db/` (byte-identical to `.env.example`; pushed + seeded — the
      DY1 teacher/room values present in the live dev db)
- [x] The vitest/playwright suites validated (configs re-verified; the
      unit layer 1731/1731 cold at baseline → 1733/1733 GREEN; the e2e
      cert re-tagged + re-run to the 650 census GREEN)
- [x] The remediation plan executed TDD-first (this document)
- [x] The evidence screenshots under docs/screenshots/ (the S175 set,
      self-verifying)
- [x] `.env.example` verified matching the codebase (no env changes
      this cycle; the e2e socket_timeout posture is a playwright-config
      env, not a .env change)
- [x] The doc chain updated for alignment
- [x] The worklog updated + committed (the Session-186 entry rides
      `6e612af`)
- [x] Pushed to main via the SSH wrapper, remote-verified (the paramiko
      shim on PATH — no OpenSSH binary in the sandbox; the wrapper's own
      temp key + the operator's `/tmp` key both shredded after)

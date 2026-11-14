# The S187 remediation plan — the filter-row separation + the sf-card border token + the Tasks search width (Batch EK)

The axis: the S186 close's named candidates — "the auth sub-screen filter-row
separation (the reference's Assignments/Exams selects render in a separate row
BELOW the header, not bundled in the toolbar — the §6.6 recorded drift)" plus
"the sf-card border token family (the clone's #e2e8f0 vs the reference's
slate-100)" and "the Tasks search width (the reference's 107px mobile collapse
vs the clone's w-48 inside the wrap superset — §6.7)". The measurement pass
(THREE reference probes + one clone-side probe, 2026-11-15, zero residue on
the operator account — every popover Escape-closed before any submit) measured
all three surfaces at BOTH viewports and surfaced the search-input
padding/font-size family as a rider. This cycle ports all of them.

## §0 The context and the baseline

- The workspace: a fresh clone at `8606cb2` on `main` (the S186 close
  `001ffca` + the operator's session_245 transcript commit; the sandbox reset
  between operator messages). The environment re-derived per the standing
  recipe: bun install (510 pkgs), `.env` from `.env.example` at
  `DATABASE_URL="file:../db/custom.db"` with `db/` at the repo root
  (push + seed — the demo account ready), the pinned chromium v1243
  re-provisioned (the fresh sandbox carried only v1200).
- The cold baseline reproduced the S186 close EXACTLY: lint ✓ · tsc ✓ · unit
  **1795/1795 (55 files)** · build ✓.
- The standing chrome at the open: the drawer check GREEN (**the 133rd
  consecutive** — no Tailwind v4 mobile-nav bug; the backdrop's
  `oklab(0 0 0 / 0.2)` is the documented trap-7 serialization, blur(4px),
  288px panel, 20 links, no footer, Escape + navigate auto-close) · the
  desktop parity probe MATCH (all five structural checks, both hosts:
  sidebar 260, 20 links, mainX 260, mainWidth 1180).
- The skills audit refreshed: the web-application rubric (§14 testing law —
  the production build is the e2e vehicle; §15 the gate order), the tdd loop
  rules (red before green, one slice at a time), the clone-app-pat-pro
  doctrine (computed styles = ground truth), the agent-browser/catalog
  conventions; `skills/` excluded from all checking/testing/compilation
  throughout.
- The reference account at the open: **in DARK mode** (the owner's persisted
  state — html.dark, body rgb(10,10,10); every probe records the mode it
  rode, the S186 constraint). All three probed surfaces carry STATIC classes
  (mode-independent): the filter rows, the card borders, the search inputs.

## §1 The measured reference inventory (three probes, 2026-11-15)

The evidence: `scripts/ref-probe-s187-{filters1,cards2,filters3}.mjs` —
JSON at `docs/probe-evidence/s187/`.

### 1.1 The filter-row family (Assignments + Exams, probes 1 + 3)

- **The header rows** (both views): `flex flex-col md:flex-row md:items-center
  justify-between gap-4` carrying ONLY the h1 block + the Add button (2 kids;
  the S186/EJ port already at parity — the "no-toolbar" census entry).
- **The filter row** (the sibling BELOW the header, 24px below via the view
  container's gap-6): **`flex flex-col md:flex-row gap-4`** — row + gap 16px
  at desktop, **column + gap 16px at mobile** (the selects NEVER go
  full-width at mobile).
  - Assignments (3 kids): the search wrapper **`relative flex-1`** (764 at
    desktop / 358 full-width at mobile) + the status trigger **w-40 (160px at
    BOTH viewports** — "Active", the default, options All/Active/Completed)
    + the subject trigger w-40 ("All Subjects").
  - Exams (2 kids): the search wrapper `relative flex-1` (940 / 358) + ONE
    status trigger w-40 ("Upcoming", the default, options All
    Exams/Upcoming/Past). NO subject select.
- **The search input anatomy** (both views + Tasks): the shadcn base
  (`flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1
  text-base shadow-sm …`) with **pl 40px (pl-10)** — the lucide-search icon
  `absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400` (12px
  inset, 16px glyph) — and the **responsive font pair text-base md:text-sm**
  (16px at mobile / 14px at desktop — the S183 Files search convention,
  now measured on all three views).

### 1.2 The card-border family (probes 2/4/5 — the COMPLETE census, 15 measured surfaces)

The reference's card families split **BY VIEW**:
- **The slate-100 family** (+ shadow-sm): the Dashboard stat cards
  `bg-white rounded-2xl p-6 shadow-sm border border-slate-100` (r16, 4
  measured) + the Timetable trio (the week-strip card `bg-white rounded-xl
  p-4 shadow-sm border border-slate-100` r12 + the grid card `bg-white
  rounded-2xl shadow-sm border border-slate-100 overflow-hidden` r16 + the
  My Classes panel `bg-white rounded-2xl shadow-sm border border-slate-100
  p-6` r16) + the FocusTimer cards (3× `bg-white rounded-xl p-4 text-center
  border border-slate-100` r12 + the timer card `bg-white rounded-3xl p-8
  shadow-xl border border-slate-100` r24).
- **The slate-200 family** (NO shadow): the Calendar cards (`lg:col-span-2
  bg-white rounded-2xl border border-slate-200 p-6` + the day detail —
  the S8-era record RE-CONFIRMED live, probes 4/5) + the GradeTracker stat
  cards (`bg-white rounded-2xl p-6 border border-slate-200`).
- The notes-editor card (`flex-1 bg-white rounded-2xl border
  border-slate-200 overflow-hidden` — the S181 record) and the file-grid
  cards (`bg-white rounded-xl border border-slate-200 p-4` — the S183
  record) — likewise slate-200 component surfaces.
- The clone's `sf-card` utility renders `#e2e8f0` (slate-200 = rgb(226,
  232, 240)) and its CONSUMERS span both reference families (the
  Dashboard/Timetable/FocusTimer counterparts measured slate-100; the
  Calendar's three sections + the GT stat cards measured slate-200
  no-shadow) — the first-cut census (probe 2 alone) covered only the
  slate-100 side; the cert map's chunk-1 catch drove the follow-up probes
  4/5 and the corrected boundary (§3.1b).

### 1.3 The Tasks search (probes 1 + 3 — the §6.7 record confirmed)

- The wrapper: **`relative flex-1 md:w-64`** — 256px at desktop, **the
  flex-1 collapse at mobile** (107px measured — the reference's own toolbar
  fits one line at 390: 256 → 107 as the search cedes the line to the
  101px filter + the 126px Add Task + the two 12px gaps).
- The input: the same pl-10 (40px) + text-base md:text-sm (16/14) family.
- The clone (pre-change): `w-48 pl-9` (192px FIXED) inside
  `flex flex-wrap items-center gap-3` — at 390 the toolbar WRAPS to two
  lines (h 84 measured, the search 192 + filter 101 + Add Task 118 exceed
  358; post-port arithmetic: 358 − 101 − 118 − 24 = **115px**, the clone's
  Add Task is 8px narrower than the reference's 126).

## §2 The clone's drift (the gap table)

| # | Surface | Reference (measured) | Clone (pre-change) | Class |
|---|---|---|---|---|
| F1 | Exams header | 2 kids: h1 block + Add Exam ONLY | h1 block + toolbar (search + select + Add Exam bundled in `flex flex-wrap items-center gap-2`) | visual (structural) |
| F2 | Exams filter row | `flex flex-col md:flex-row gap-4` below the header: search `relative flex-1` + 1 select w-40 | none (the controls live in the header) | visual (structural) |
| F3 | Exams select width | w-40 = 160px at both viewports | w-[130px] | visual |
| F4 | Assignments select widths | w-40 = 160px at mobile too | `w-full md:w-40` (358px full-width at mobile) | visual |
| F5 | The search inputs (Assignments + Exams + Tasks) | pl-10 (40px) + text-base md:text-sm (16/14) | pl-9 (36px) + text-sm (14 fixed) | visual |
| C1 | The sf-card border | the families split BY VIEW: slate-100 + shadow-sm on Dashboard/Timetable/FocusTimer; slate-200 NO shadow on Calendar/GT | `#e2e8f0` (slate-200) on the whole utility | visual (family-wide) |
| T1 | The Tasks search width | `relative flex-1 md:w-64` (256 desktop / ~107 mobile collapse; one-line toolbar) | `w-48` fixed (192); toolbar wraps to 2 lines (h 84) at mobile | visual |

## §3 The port design (the superset mapping)

1. **§3.1 The sf-card border token** (`src/app/globals.css`): `border: 1px
   solid #e2e8f0` → `border: 1px solid #f1f5f9` (slate-100 — the measured
   majority family; the hex is the v3-pinned `--color-slate-100`,
   byte-identical to the reference's computed rgb(241,245,249)). The
   `.dark &` override (hsl(var(--border))) stays — the clone's dark
   superset. The OTHER #e2e8f0 sites in globals.css (the Quill toolbar's
   border-bottom, the hr) are the notes-editor family — measured
   slate-200 — untouched.
   **§3.1b (the cert-map correction)**: the Calendar's three sections
   (Timeline/month/day-detail) + the GradeTracker stat cards re-port OFF
   the utility onto their measured component classes — `rounded-2xl border
   border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-card` —
   with the shadow DROPPED (the reference measures none on this family;
   the utility's shadow-sm was unmeasured drift). The GT grade rows + the
   other unmeasurable-content surfaces (StudyGroups/PracticeTests/Notes/
   Files panels) ride the utility's slate-100 — the measured-majority
   default.
2. **§3.2 The Exams restructure** (`src/components/views/exams-view.tsx`):
   the header keeps the measured 2-kid form (the h1 block + the Add Exam
   button, the stacking family already correct); the search + the status
   select move OUT of the header toolbar into a new row below —
   `flex flex-col md:flex-row gap-4`, the search wrapper
   `relative flex-1` with the input `pl-10 text-base md:text-sm`, the
   select trigger `h-9 w-40`. The view container keeps its gap-6 (the
   measured 24px header→filter spacing).
3. **§3.3 The Assignments rider** (`src/components/views/
   assignments-view.tsx`): both select triggers `h-9 w-full md:w-40` →
   `h-9 w-40`; the search input `h-9 pl-9` → `pl-10 text-base md:text-sm`
   (the redundant h-9 retires — the Input base carries it).
4. **§3.4 The Tasks search** (`src/components/views/tasks-view.tsx`): the
   wrapper `relative` → `relative flex-1 md:w-64`; the input
   `w-48 pl-9` → `pl-10 text-base md:text-sm`. The toolbar keeps its
   `flex flex-wrap` (the no-overflow superset — the wrap simply never
   fires at mobile any more: the search cedes the line, exactly the
   reference's own one-line behavior).

## §4 The TDD plan (the honest RED first — the EK pins)

All pins run against the pre-change standalone build FIRST and fail at
their designed markers (the §5.4 RED run):

- **EK1** (parity-session7.spec.ts): the Exams header row carries exactly
  TWO kids and exactly ONE button (Add Exam) — no input, no combobox inside
  the header. (Pre-change RED: 3 controls — the search input + the filter
  select + Add Exam.)
- **EK2**: the Exams filter row (the first sibling below the header)
  computes flexDirection column at 390 + row at 1280 + gap 16px, carrying
  the search wrapper + ONE combobox. (Pre-change RED: the first sibling is
  the exam-card GRID — no combobox.)
- **EK3**: the Exams select trigger computes width 160px at BOTH 390 and
  1280. (Pre-change RED: 130px.)
- **EK4**: the Assignments select triggers compute 160px at 390 (not
  full-width). (Pre-change RED: 358px.)
- **EK5**: the search inputs on Assignments + Exams + Tasks compute
  paddingLeft 40px + fontSize 16px at 390 and 14px at 1280 (the
  text-base md:text-sm family). (Pre-change RED: 36px / 14px-both.)
- **EK6** (re-targeted at the cert-map catch): a representative sf-card
  surface (the Dashboard stat card) computes borderTopColor rgb(241, 245,
  249) — the utility's family — AND the Calendar month card + a GT stat
  card compute rgb(226, 232, 240) with boxShadow none (the measured
  BY-VIEW boundary, both sides pinned). (Pre-change RED on the Dashboard
  surface: rgb(226, 232, 240).)
- **EK7**: the Tasks search wrapper computes 256px at 1280 (md:w-64) and
  ≤ 130px at 390 (the flex-1 collapse, floor-guarded — the clone's Add
  Task is 118px vs the reference's 126, so 115px expected); the Tasks
  toolbar at 390 fits ONE line (height 36 — was 84).

Zero writes, zero uploads (no dialog is opened; the selects are read-only
combobox geometry probes), order-independent (each pin navigates fresh).

## §5 The execution order (the TODO list)

1. [x] The environment re-derive + the cold baseline (lint/tsc/unit/build).
2. [x] The standing chrome (drawer check 133rd + the parity probe MATCH).
3. [x] The reference measurement (three probes, zero residue) + the
   clone-side pre-change probe.
4. [x] **The RED run** — the seven EK pins against the pre-change
   standalone (the §0 build), each verified failing at its designed marker.
5. [x] **The port** — §3.1 → §3.4 (globals.css, exams-view.tsx,
   assignments-view.tsx, tasks-view.tsx).
6. [x] **The GREEN sweep** — the seven EK pins; then the FULL
   parity-session7.spec.ts file; then the touched-spec cold runs
   (parity-session5/6/8/9, tasks, navigation, mobile-navigation,
   a11y-sweep, dark-mode, theme-system — every spec touching these views).
7. [x] **The re-anchor audit** — the pins touching these surfaces: the
   S16 mobile-auth geometry records (unaffected — the auth card), the
   Files-search pins (unaffected — already the measured family), the
   task-row/deck-card/editor-card/keyboard-key slate-200 pins (unaffected
   — component classes, NOT sf-card), the EJ4/EJ8 header pins (unaffected
   — the stacking family unchanged), the hue-tokens unit register (the
   globals.css edit shifts NO unit-pinned lines — verified in the RED
   run's unit leg).
8. [x] **The gates**: lint · tsc · unit 1795/1795 · build.
9. [x] **The census** (`--list`, never estimated) + the doc-chain lockstep
   (the README badge/testing line/Session-187 row, the AGENTS census + the
   S187 lessons, the CLAUDE pairs + the filter-row/sf-card contract lines,
   the PAD revision, the SKILL census sites, the vitest header, the cert
   runner re-tags) + the tripwire.
10. [x] **The 5-chunk cold cert map** (the full e2e suite).
11. [x] **The evidence frames** — the separated Exams header + filter row
    (desktop + mobile 390), the Assignments 160px mobile selects, the
    sf-card border family (a stat card), the Tasks one-line mobile
    toolbar — self-verifying, under `docs/screenshots/`.
12. [x] **The closing chrome** — the drawer check (the 134th) + the
    desktop parity probe.
13. [x] **The commit + the SSH-wrapper push** (the operator's standing
    sequence).

## §6 The adjudications (the open questions, resolved)

1. **§6.1 The reference's DARK state does not block this cycle.** All
   three ported surfaces carry STATIC classes (the filter rows, the card
   borders, the search inputs) — measured mode-independent on the dark
   account, cross-verified against the light-era records (the S185 card
   record `border-slate-100`; the S183 Files search `pl-10 text-base
   md:text-sm`). The token-driven families (the border-input triggers)
   stay on their standing light-mode pins — the dark-scoped trigger
   border rgb(38,38,38) is recorded, NOT ported.
2. **§6.2 The sf-card port is the UTILITY plus the measured per-view
   boundary.** The component-class card surfaces measured slate-200 (the
   notes editor, the file grids, the task rows, the deck cards, the
   keyboard keys, the tablists) keep their own borders; the Calendar's
   three sections + the GT stat cards — sf-card CONSUMERS whose reference
   counterparts measured slate-200 no-shadow — re-port onto their measured
   component classes (§3.1b). The first-cut claim "zero re-anchor
   fallout" was WRONG (the plan had mis-classified the Calendar/GT
   consumers as component-class surfaces on an incomplete census): the
   cert map's chunk-1 catch failed the two S8-C Calendar pins and drove
   the correction — the boundary is BY VIEW, established by the complete
   probe set (2/4/5).
3. **§6.3 The Tasks search keeps the wrap superset.** The toolbar keeps
   `flex flex-wrap` (the S78 no-overflow adjudication) — the flex-1 search
   simply cedes the line at mobile (the reference's own behavior: its
   toolbar fits one line because its search collapses). If a future
   control widens the toolbar past 358 the wrap still guards it.
4. **§6.4 The Exams filter row drops NO functionality.** The search + the
   status select keep their state and behavior — only the DOM position
   moves (out of the header, into the sibling row). The Exams view keeps
   its mb-spacing through the view container's gap-6 (measured 24px
   header→filter).
5. **§6.5 The redundant h-9 classNames retire** on the search inputs (the
   Input base carries h-9) — the smallest-safe-diff rule; the rendered
   geometry is unchanged (36px).
6. **§6.6 The mobile select widths are the measured form** — w-40 at all
   viewports (never full-width). The clone's `w-full md:w-40` was the S15
  -era responsive assumption, never width-measured at mobile until this
   cycle.

## §7 The re-anchor risk register

- `tests/e2e/parity-session7.spec.ts` — the EJ4/EJ8 pins (the header
  stacking) HOLD (the header rows are unchanged); the S7 editor-card pin
  (line 443) HOLDS (the notes editor is a component-class surface); the
  deck-card pin (line 120) HOLDS (same); adds EK1-EK7.
- `tests/e2e/parity-session6.spec.ts` — the task-row border pin HOLDS
  (component class). The stat-card pins (border-0 Analytics family)
  HOLD (different family).
- `tests/e2e/parity-session8.spec.ts` — the tablist pins HOLD (component
  classes); the two S8-C Calendar aside pins (month card + day detail)
  FAILED on the first cert roll (the sf-card consumers mis-classified in
  the plan's first cut) — held again after §3.1b (the measured slate-200
  no-shadow component classes), re-verified cold 147/147 with
  parity-session5 + dark-mode.
- `tests/e2e/parity-session9.spec.ts` — the chart gridline #e2e8f0 fill
  pin HOLDS (an SVG fill, not a border).
- `tests/e2e/tasks.spec.ts` — the search-filters pin is behavioral
  (typing) — HOLDS regardless of width.
- The S33/S34/S35 mobile/midband/landscape sweeps — the no-overflow
  contracts IMPROVE (the Tasks toolbar drops from 2 lines to 1 at mobile);
  no view gains overflow.
- `tests/hue-tokens.test.ts` — the globals.css edit adds no lines (a
  one-token color swap) — the residual-register anchors HOLD; the unit
  leg of the RED run verifies.

## §8 The verification ledger (what proves this cycle)

- The three reference probes' JSON evidence (§1) + the clone-side
  pre-change probe.
- The honest RED (§5.4) + the GREEN sweep (§5.6) — every pin at its
  designed marker.
- The full gate: lint · tsc · unit 1795/1795 · build · the 5-chunk cold
  cert map (the census by `--list`).
- The closing chrome: the drawer check (134th) + the desktop parity probe
  MATCH.
- The evidence frames under `docs/screenshots/` (self-verifying).

## §9 The close-out (as executed)

- The execution order §5.1-§5.13 ran in sequence: the honest RED (all 7
  EK pins at their designed markers; one pin bug root-caused — the EK1
  element-handle serialization, restructured into ONE evaluate) → the port
  (§3.1-§3.4) → the GREEN sweep (7/7; the full parity-session7 138/138;
  tasks + parity-session5 + parity-session6 81/81; parity-session8 +
  parity-session9 109 passed — the tail misread as clean, it carried the
  2 S8-C Calendar failures; navigation + mobile-navigation + a11y-sweep
  107/107; dark-mode + theme-system 48/48; resilience + s17-fresh-user +
  greeting-clock + calculator 78/78) → the gates (lint ✓ · tsc ✓ · unit
  1795/1795 · build ✓) → the census (`--list`: 709 → 716 chromium specs;
  the chunk map 158 + 275 + 101 + 95 + 92 = 721) → the doc-chain lockstep
  + the tripwire green → **THE CERT MAP'S CATCH**: chunk 1's first roll
  failed the 2 S8-C Calendar pins (the sf-card port had flipped the
  Calendar/GT sections — the first-cut census [probe 2 alone] had skipped
  those views and §6.2 mis-classified their clone-side sections as
  component-class surfaces) → the follow-up probes 4/5 measured the
  complete BY-VIEW boundary (Calendar + GT = border-slate-200 NO shadow;
  Dashboard + Timetable + FocusTimer = slate-100 + shadow-sm) → §3.1b
  (the utility stays slate-100; the Calendar's 3 sections + the GT stat
  cards re-port onto the measured component classes; EK6 re-targeted to
  the Dashboard surface + the boundary guard) → re-verified cold (the EK
  family 7/7; the full parity-session7 138/138; parity-session8 +
  parity-session5 + dark-mode 147/147) → the full 5-chunk cold cert map
  721/721 → the self-verifying evidence frames → the closing chrome (the
  drawer check GREEN — the 134th; the desktop parity probe MATCH) → the
  commit + the SSH-wrapper push.
- The §6 adjudications held as designed: the dark-state measurements
  cross-verified (§6.1); the sf-card port touched ONLY the utility (§6.2 —
  zero re-anchor fallout, confirmed by the GREEN sweep); the Tasks wrap
  superset kept (§6.3); the Exams restructure dropped no functionality
  (§6.4); the redundant h-9 classNames retired (§6.5); the mobile select
  widths ported to the measured form (§6.6).
- ONE root-caused discovery beyond the plan (the §3.4 rider): the Tasks
  search's `flex-1` (flex-basis 0) defeats the definite `md:w-64` under
  the toolbar's `flex-wrap` intrinsic sizing — the wrapper rendered the
  input's content width (239px) instead of 256px; the reference's own
  nowrap toolbar never hits that path. The scoped form
  `max-md:flex-1 md:w-64` resolves both viewports exactly (the S187
  lesson 3 + the CLAUDE contract line record it).

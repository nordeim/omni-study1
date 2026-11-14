# The S186 remediation plan — the auth-button family + the view-header row family (Batch EJ)

The axis: the S185 close's named candidates — "the outline-button family
re-rotation … the biggest standing drift" plus "the view-header row family
re-probe (the reference's `flex flex-col md:flex-row md:items-center`
mobile-stacked form vs the clone's flex-wrap S78/AE12 record)". The
measurement pass (NINE probes, 2026-11-15, all zero-residue on the operator
account) re-attributed the outline family and surfaced TWO mode-independent
portable gaps: the never-color-measured auth button family and the
view-header stacking family. This cycle ports both and records the
reference's dark-mode discovery.

## §0 The context and the baseline

- The workspace: a fresh clone at `3d41294` on `main` (the S185 close `88d67f8`
  + the operator's session_243 transcript commit; the sandbox reset between
  operator messages). The environment re-derived per the standing recipe:
  bun install (509 pkgs), `.env` from `.env.example` at
  `DATABASE_URL="file:../db/custom.db"` with `db/` at the repo root
  (push + seed — the demo account ready), the pinned chromium v1243
  re-provisioned (the fresh sandbox carried only v1200).
- The cold baseline reproduced the S185 close EXACTLY: lint ✓ · tsc ✓ · unit
  **1795/1795 (55 files)** · build ✓.
- The standing chrome at the open: the drawer check GREEN (**the 131st
  consecutive** — no Tailwind v4 mobile-nav bug; the backdrop's
  `oklab(0 0 0 / 0.2)` is the documented trap-7 serialization, blur(4px),
  288px panel, 20 links, no footer, Escape + navigate auto-close) · the
  desktop parity probe MATCH (all five structural checks, both hosts:
  sidebar 260, 20 links, mainX 260, mainWidth 1180).
- The skills audit refreshed: the web-application rubric (§14 testing
  law — the production build is the e2e vehicle; §15 the gate order), the
  tdd loop rules (red before green, one slice at a time), the
  clone-app-pat-pro doctrine (computed styles = ground truth, screenshots
  secondary), the agent-browser/catalog conventions; `skills/` excluded
  from all checking/testing/compilation throughout.
- The reference account at the open: **in DARK mode** (the owner's
  persisted state — see §1.1), all content surfaces at zero residue.

## §1 The measured reference inventory (nine probes, 2026-11-15)

The evidence: `scripts/ref-probe-s186-{outline1,theme2,yellow3,yellow4,light5,light6,auth7,header8,tools9}.mjs`
— JSON/PNG at `docs/probe-evidence/s186/`.

### 1.1 THE DISCOVERY — the reference's dark mode now WORKS (the S10 record invalidated)

- The reference account sits in **Dark** (persisted): `<html class="dark">`
  measured on every authed view; the Settings Appearance tab's Dark card
  carries the selected tint. The body computes `rgb(10, 10,  10)`;
  the base text token `rgb(250, 250, 250)`.
- The S10 record ("the reference's own Dark option is a measured platform
  no-op") is **INVALIDATED** — the platform now applies `.dark` tokens:
  `--background: 0 0% 3.9%`, `--foreground: 0 0% 98%`, `--card: 0 0% 3.9%`
  (the `.dark` block measured live).
- The S185 findings re-attributed: the "invisible mobile weekday names"
  (zero-ink inherited near-white) and the "--background token renders its
  outline family at rgb(10,10,10)" were **dark-token values**, not
  theme-neutral defects. The view-layer cards stay `bg-white` (dark is
  PARTIAL: the shell re-themes, the cards do not).
- **The reference's dark defect family (recorded, NOT ported — §6.1):**
  - The **yellow primary-foreground**: the app's `:root
    --primary-foreground: "255 255 255"` (RGB-triplet format) collides with
    the platform's `.dark --primary-foreground: "0 0% 9%"` (HSL format);
    the `text-primary-foreground` utility consumes
    `hsl(var(--primary-foreground))` → Chromium computes
    `hsl(255 255 255)` = **rgb(255, 255, 0)** — pure yellow text on every
    gradient CTA (Add Task, Add Class, Add Assignment, Create Task, the
    Calendar active tab). Root-caused by the var-cascade probe
    (`ref-yellow-source.json` — the on-button cascaded value + the format
    matrix).
  - The **near-black outline family**: `bg-background` under
    `.dark --background: 0 0% 3.9%` renders every outline button
    rgb(10,10,10) + near-white text (Grid Builder, the Tasks Active filter,
    Files New Folder — the S185 "standing family finding" was this).
  - The **still-white cards** with near-white inherited text (the invisible
    weekday names, the S185 record).
- **The reference's theme switcher is a NO-OP**: the Light card click (the
  real UI element, `BUTTON` with text "Light") leaves `html.dark` unchanged
  even after reload (`ref-light-mechanism.json`) — the reference cannot
  switch back to light through its own UI. Its bug, recorded.
- Consequence for parity: the reference's LIGHT surface remains the clone's
  parity target (the anon login defaults to light; every standing pin
  asserts light values; the reference's dark is a broken partial
  implementation). The clone's full dark mode STAYS the documented
  superset — now over a reference that HAS a (broken) dark mode.

### 1.2 The auth button family (the portable gap — probe 3/7/9)

The reference's ENTIRE auth primary-CTA family is **solid slate-900** —
never color-measured before (the S15 probe captured only the first six
class tokens; the clone's gradient was the app-wide CTA assumption):

| Screen | Button | bg | text | h (mobile 390) | h (desktop 1440) | radius |
|---|---|---|---|---|---|---|
| signin | Sign in | rgb(15,23,42) | white | 44 (h-11) | 48 (sm:h-12) | 12px |
| signup | Create account | rgb(15,23,42) | white | 40 (h-10) | 44 (sm:h-11) | 12px |
| verify | Verify email | rgb(15,23,42) | white | 40 | 44 | 12px |
| forgot | Send reset link | rgb(15,23,42) | white | 40 | 44 | 12px |
| reset | Reset password | (family — the S15 form) | white | 40 | 44 | 12px |

Full classes measured (`ref-auth-buttons.json`): `bg-slate-900
hover:bg-slate-800 text-white font-medium shadow-sm rounded-xl` — solid,
NOT the violet→indigo gradient. The clone renders ALL five as
`variant="gradient"` with `sf-gradient-shadow`, the four sub-CTAs at h-9
(36px).

### 1.3 The view-header row family (the portable gap — probes 5/8/9)

The reference's view-header taxonomy (all 20 views censused at 1440×900 +
390×844, `ref-header-rows.json`):

- **The stacking family (8 toolbar views)**: `flex flex-col md:flex-row
  md:items-center justify-between gap-4` — Dashboard (adds
  `md:justify-between`), Tasks (adds `mb-6`), Calendar, Timetable,
  Assignments, Exams, Practice Tests, Files. At mobile the toolbar STACKS
  BELOW the h1 block (column, gap 16px, both kids full-width 358px); at
  desktop a row (items-center, justify-between).
- **The row family (2 action views)**: `flex items-center justify-between`
  — Calculator (mobile h-80: the h1 wraps, the History button stays right),
  Grade Tracker (mobile h-112). Row-always, NO wrap, NO stack.
- **The plain block family (4 views)**: Analytics, AI Assistant, Math
  Solver, Settings — the h1 + subtitle as direct children of a non-flex
  container (no toolbar).
- **The toolbar internals**: `flex items-center gap-3` (Tasks: search 256→107
  responsive / filter 101 / Add Task 126; Timetable: select 160 + the
  builder/add pair 258; Files: `flex gap-3`, New Folder 144 + Upload 113);
  the Calendar mode pill keeps its own `gap-2 p-1` family (the S9-E pin).
- The reference's Tasks toolbar fits one line at mobile (358px — its search
  collapses to 107px); its Timetable toolbar reads ~395px at 390 (the S78
  record's own overflow family). The Exams/Assignments headers carry ONLY
  the add button (their filter selects render in a separate row below the
  header — recorded as the S187 candidate, §6.6).

## §2 The clone's drift (the gap table)

| # | Surface | Reference (measured) | Clone (pre-change) | Class |
|---|---|---|---|---|
| A1 | Sign in CTA | solid slate-900, white text, r12, 44/48 | gradient (violet→indigo) + sf-gradient-shadow | visual |
| A2 | Create account CTA | solid slate-900, 40/44, r12 | gradient, h-9 (36) flat | visual |
| A3 | Verify email CTA | solid slate-900, 40/44, r12 | gradient, h-9 | visual |
| A4 | Send reset link CTA | solid slate-900, 40/44, r12 | gradient, h-9 | visual |
| A5 | Reset password CTA | the family (S15 form) | gradient, h-9 | visual |
| H1 | Tasks header row | flex-col md:flex-row items-center justify-between gap-4 **mb-6** (2-kid: h1 block + toolbar) | flex-wrap items-center gap-3 pb-4 (4 direct kids, h1 in w-full sm:w-auto wrapper) | visual (mobile stack + sm/md reflow 640→768) |
| H2 | Timetable header row | the stacking family | flex-wrap items-center justify-between gap-4 | visual |
| H3 | Calendar header row | the stacking family | flex-wrap items-center justify-between gap-3 | visual |
| H4 | Assignments header row | the stacking family | flex-wrap items-center justify-between gap-4 | visual |
| H5 | Exams header row | the stacking family | flex items-center justify-between gap-4 (no stack) | visual |
| H6 | Dashboard header row | the stacking family + md:justify-between | flex-wrap items-end justify-between gap-3 | visual |
| H7 | Files + Practice Tests headers (ViewHeader) | the stacking family | ViewHeader `flex items-start justify-between gap-4` (row-always) | visual |
| H8 | Calculator + Grade Tracker headers (ViewHeader) | `flex items-center justify-between` (row, items-center, no wrap) | ViewHeader items-start (+ Calculator's own row flex-wrap items-start) | visual |
| T1 | The Timetable toolbar gap | gap-3 (12px) | gap-2 (8px) | visual |
| — | The reference's dark family (yellow CTAs, near-black outline, invisible inherited text) | its own defect | the clone's coherent families | **NOT ported** (§6.1) |
| — | The auth sub-screen filter rows (Assignments/Exams selects below the header) | separate row | bundled in the header | recorded as the S187 candidate (§6.6) |

## §3 The port design (the superset mapping)

1. **§3.1 The Button `solid` variant** (`src/components/ui/button.tsx`):
   add `solid: "bg-slate-900 text-white shadow-sm hover:bg-slate-800
   dark:bg-slate-800 dark:hover:bg-slate-700 sf-print-exact"` — the measured
   family (slate-900 = the pinned ramp's rgb(15,23,42), byte-identical to
   the reference's computed value). The dark lift (800/700) is the clone's
   dark-login coherence (§6.3).
2. **§3.2 The five auth CTAs** (`src/components/auth/login-surface.tsx`):
   Sign in → `variant="solid"` + `h-11 w-full rounded-xl sm:h-12` (the
   sf-gradient-shadow retired); Create account / Verify email / Send reset
   link / Reset password → `variant="solid"` + `h-10 w-full rounded-xl
   sm:h-11` (h-9 → the measured 40/44 pair).
3. **§3.3 ViewHeader** (`src/components/views/shared.tsx`): a `stack`
   prop — `stack` renders `flex flex-col md:flex-row md:items-center
   justify-between gap-4`, the default renders `flex items-center
   justify-between gap-4` (items-start → items-center, the measured row
   family). Files + Practice Tests pass `stack`.
4. **§3.4 The Tasks header** (`tasks-view.tsx`): restructure to the
   measured 2-kid form — the row `flex flex-col md:flex-row md:items-center
   justify-between gap-4 mb-6`; the h1 block a plain div (the w-full
   sm:w-auto sm:flex-1 wrapper retired — the column owns the stacking); the
   toolbar `flex flex-wrap items-center gap-3` carrying the search + filter
   + Add Task (the wrap stays — §6.4).
5. **§3.5 The Timetable header** (`timetable-view.tsx`): the row → the
   stacking family; the toolbar `flex flex-wrap items-center gap-2` →
   `gap-3` (the measured 12px).
6. **§3.6 The Calendar / Assignments / Exams headers**: the rows → the
   stacking family (their toolbars keep their own measured families — the
   Calendar mode pill untouched).
7. **§3.7 The Dashboard header** (`dashboard-view.tsx`): `flex flex-wrap
   items-end justify-between gap-3` → `flex flex-col md:flex-row
   md:items-center md:justify-between gap-4`.
8. **§3.8 The Calculator header row** (`calculator-view.tsx`): its own
   toolbar row adopts `flex items-center justify-between gap-4` (the row
   family — wrap dropped, items-start → items-center) if it is the view
   header; the ViewHeader consumers Calculator/GradeTracker ride §3.3's
   default.

## §4 The TDD plan (the honest RED first — the EJ pins)

All pins run against the pre-change standalone build FIRST and fail at
their designed markers:

- **EJ1** (auth.spec.ts): the Sign in button computes `rgb(15, 23, 42)` bg
  + white text + 12px radius (the pre-change: the gradient's
  `linear-gradient` backgroundImage — the RED marker).
- **EJ2** (auth.spec.ts): the signup Create account button computes the
  solid family + h 44 at desktop (the pre-change: gradient + 36px).
- **EJ3** (auth.spec.ts): the forgot Send reset link button computes the
  solid family (the pre-change: gradient).
- **EJ4** (parity-session7.spec.ts): the Tasks header row computes
  flexDirection column at 390 + row at 1280 + gap 16px + the mb-6 spacing
  (the pre-change: row-at-390 under flex-wrap + gap 12px — the RED).
- **EJ5**: the Timetable header row column/row + the toolbar's 12px gap
  (the pre-change: row + 8px).
- **EJ6**: the Files header (ViewHeader stack) column at 390 (the
  pre-change: row — items-start).
- **EJ7**: the Dashboard header column at 390 + row at 1280 (the
  pre-change: flex-wrap row).
- **EJ8**: the Exams header column at 390 (the pre-change: row-always).
- **EJ9**: the Calculator header stays a ROW at 390 with items-center (the
  pre-change: items-start + wrap — the alignSelf/align-items RED).

Zero uploads, zero writes (every dialog Escape-closed before any submit),
order-independent (each pin navigates fresh).

## §5 The execution order (the TODO list)

1. [x] The environment re-derive + the cold baseline (lint/tsc/unit/build).
2. [x] The standing chrome (drawer check 131st + the parity probe MATCH).
3. [x] The reference measurement (nine probes, zero residue).
4. [x] **The RED run** — the nine EJ pins against the pre-change
   standalone (the §0 build), each verified failing at its designed marker.
5. [x] **The port** — §3.1 → §3.8 (button.tsx, login-surface.tsx,
   shared.tsx, tasks/timetable/calendar/assignments/exams/dashboard/
   calculator views).
6. [x] **The GREEN sweep** — the nine EJ pins; then the FULL auth.spec.ts
   + auth-flows.spec.ts + parity-session7.spec.ts files; then the
   touched-spec cold runs (navigation, mobile-navigation, a11y-sweep,
   dark-mode, theme-system, parity-session5, parity-session8,
   greeting-clock, calculator).
7. [x] **The re-anchor audit** — the pins touching these surfaces: the
   S16 mobile-auth geometry records, the S8 Tasks single-row pin (desktop
   row holds), the S78/AE9-AE12 wrap comments (the toolbar wraps stay),
   the theme-system dark-login chip pin.
8. [x] **The gates**: lint · tsc · unit 1795/1795 · build.
9. [x] **The census** (`--list`, never estimated) + the doc-chain lockstep
   (the README badge/testing line/Session-186 row, the AGENTS census + the
   S186 lessons, the CLAUDE pairs, the PAD revision, the SKILL census
   sites, the vitest header, the cert runner re-tags) + the tripwire.
10. [x] **The 5-chunk cold cert map** (the full e2e suite).
11. [x] **The evidence frames** — the auth card (light + dark + mobile),
    the stacked Tasks/Timetable headers at 390, the reference dark-mode
    discovery frames (the yellow CTA + the near-black outline family) —
    self-verifying, under `docs/screenshots/`.
12. [x] **The closing chrome** — the drawer check (the 132nd) + the
    desktop parity probe.
13. [x] **The commit + the SSH-wrapper push** (the operator's standing
    sequence).

## §6 The adjudications (the open questions, resolved)

1. **§6.1 The reference's dark family is NOT ported.** The yellow
   primary-foreground (a CSS var format collision producing
   rgb(255,255,0) text on violet gradients), the near-black outline
   buttons, and the invisible inherited texts are the reference's OWN
   defect family (its dark mode is partial: the shell re-themes, the
   cards stay white, the token formats collide). The S83/AJ5
   readable-superset precedent: the clone keeps its coherent families and
   records the reference's defects. The S10 "Dark is a platform no-op"
   record is superseded — the reference's dark now WORKS at the token
   level (the discovery documented in §1.1 + the AGENTS lesson).
2. **§6.2 The parity target stays LIGHT.** The reference's account
   state (dark) is the owner's persisted preference; its light surface is
   the standing baseline every pin asserts. No attempt was made to
   permanently re-theme the operator's reference account (the Light
   round-trip probe left it exactly as found — and the switcher is a
   no-op anyway, §1.1).
3. **§6.3 The auth buttons in dark**: the reference never renders a dark
   login (its login stays light), so no ground truth exists for the
   clone's dark-login superset. The `solid` variant carries
   `dark:bg-slate-800 dark:hover:bg-slate-700` — a one-step lift keeping
   the primary CTA visible on the clone's dark login card (the S80/AG1
   static-keep precedent does not apply: that button was measured IN the
   reference's dark app; this one has no reference rendering at all).
4. **§6.4 The toolbar wraps stay.** The reference's Timetable toolbar
   overflows 390px by ~5px (its own bug family, the S78 record); the
   clone's `flex-wrap` toolbars (the no-overflow superset) are kept —
   only the HEADER row's stacking behavior ports.
5. **§6.5 The sub-CTA heights port** h-9 → `h-10 sm:h-11` (40/44 — the
   measured responsive pair; the clone's h-9 was the S15 assumption,
   never height-measured on the sub-screens).
6. **§6.6 The filter-row separation** (the reference's Assignments/Exams
   selects render BELOW the header, not inside it) — recorded as the S187
   candidate; out of this cycle's scope (a structural re-layout of two
   views' filter chrome with its own pin family).
7. **§6.7 The Tasks search width**: the reference's search collapses to
   107px at mobile (its toolbar fits one line); the clone's w-48 (192px)
   search wraps under flex-wrap. Keeping the clone's wrap (§6.4) — the
   search width itself is unmeasured drift inside the wrap superset,
   recorded.

## §7 The re-anchor risk register

- `tests/e2e/auth.spec.ts` — the Sign in h/r pins hold (48px/12px
  unchanged); adds EJ1-EJ3.
- `tests/e2e/auth-flows.spec.ts` — the journey pins are locator-based
  (no color assertions); the sub-CTA h-9→h-10 changes no pin.
- `tests/e2e/parity-session8.spec.ts` S8's "main header is a single row"
  — desktop locators only; the stacking family renders a row at the spec
  viewport (1280). HOLDS.
- `tests/e2e/theme-system.spec.ts` — the dark-login chip pin
  (rgb(15,23,42)) is the "or" divider, not the CTA. HOLDS.
- The S33/S34/S35 mobile/midband/landscape sweeps — the identity-heading
  and no-overflow contracts: the stacked headers keep the h1 first-child
  (clearance improves); no view gains overflow. Expected GREEN.
- The S78/AE9-AE12 documented wrap comments — the toolbar-level wraps
  stay; the header-level flex-wrap retires with the port (the comments
  update in the same change).

## §8 The verification ledger (what proves this cycle)

- The nine reference probes' JSON/PNG evidence (§1).
- The honest RED (§5.4) + the GREEN sweep (§5.6) — every pin at its
  designed marker.
- The full gate: lint · tsc · unit 1795/1795 · build · the 5-chunk cold
  cert map (the census by `--list`).
- The closing chrome: the drawer check (132nd) + the desktop parity
  probe MATCH.
- The evidence frames under `docs/screenshots/` (self-verifying).

## §9 The close-out (as executed)

- The execution order §5.1-§5.13 ran in sequence: the honest RED (all 9
  EJ pins at their designed markers; two pin bugs root-caused — the Files
  heading substring + the ancestor-walk self-match) → the port (§3.1-§3.8)
  → the GREEN sweep (9/9; the full auth + auth-flows 34/34; the full
  parity-session7 131/131; navigation + mobile-navigation 87/87;
  dark-mode + theme-system 48/48; a11y-sweep + greeting-clock +
  calculator 38/38; parity-session5 + parity-session8 119/119;
  resilience + s17-fresh-user + tasks 73/73) → the gates (lint ✓ · tsc ✓
  · unit 1795/1795 · build ✓) → the census (`--list`: 700 → 709 chromium
  specs; the chunk map 158 + 268 + 101 + 95 + 92 = 714) → the doc-chain
  lockstep + the tripwire 138/138 → **the 5-chunk cold cert map 714/714
  (every chunk first roll)** → the five self-verifying evidence frames →
  the closing chrome (the drawer check GREEN — the 132nd; the desktop
  parity probe MATCH) → the commit + the SSH-wrapper push.
- The §6 adjudications held as designed: the reference's dark family
  recorded not ported (§6.1 — the yellow collision + the near-black
  outline + the no-op switcher documented in the plan §1.1, the AGENTS
  S186 lessons, and the PAD v1.3.94 block); the operator account left
  exactly as found (dark); the auth dark lift (§6.3); the toolbar wraps
  kept (§6.4); the sub-CTA heights ported (§6.5); the filter-row
  separation recorded as the S187 candidate (§6.6); the Tasks search
  width recorded (§6.7).
- The §7 re-anchor register closed clean: the auth.spec.ts h/r pins held;
  auth-flows locator-based; the S8 single-row pin held (desktop row);
  the theme-system dark-login chip pin held; the mobile/midband/landscape
  sweeps green in the cert map; the S78/AE9-AE12 comments updated in the
  same change. One unit-side re-anchor: the hue-tokens dashboard
  residual-register line 210 → 212 (the stacking-header comment pair
  shifted the overdue chip — the documented S140/CO3 line-shift class).

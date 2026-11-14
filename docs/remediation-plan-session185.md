# The S185 remediation plan — the Timetable week-strip rows (Batch EI)

The axis: the S184 close's first named candidate — "the Timetable week-strip
rows (the visibility-scoped pass, the mobile anatomy already recorded)". The
recorded mobile anatomy was the CLONE's own accordion (the S105/S113 frames);
the reference's own mobile surface had never been measured. This cycle
measures BOTH halves live and ports the drift.

## §0 The context and the baseline

- The workspace: a fresh clone at `98721da` on `main` (the S184 close + the
  operator's session_241 transcript commit). The environment re-derived per
  the standing recipe: bun install (510 pkgs), `.env` from `.env.example` at
  `DATABASE_URL="file:../db/custom.db"` with `db/` at the repo root, db push +
  seed (the demo account: 5 seeded classes, ISO Mon–Fri), the pinned chromium
  v1243 re-provisioned (the fresh sandbox carried only v1200).
- The cold baseline reproduced the S184 close EXACTLY: lint ✓ · tsc ✓ · unit
  **1795/1795 (55 files)** · build ✓.
- The standing chrome at the open: the drawer check GREEN (**the 129th
  consecutive** — no Tailwind v4 mobile-nav bug; the backdrop's
  `oklab(0 0 0 / 0.2)` is the documented trap-7 serialization) · the desktop
  parity probe MATCH (all five structural checks, both hosts).
- The skills audit refreshed: the web-application rubric, the tdd loop
  rules, the clone-app-pat-pro doctrine (computed styles = ground truth),
  the agent-browser/catalog conventions; `skills/` excluded from all
  checking/testing/compilation throughout.
- The reference account at the open: TRUE ZERO (carried from the S184
  close; re-verified by the probes' own view renders — every timetable
  surface renders its empty state; all probe dialogs Escape-closed, nothing
  created).

## §1 The measured reference inventory (eleven probes, 2026-11-14)

The evidence: `scripts/ref-probe-s185-week{1..11}.mjs` +
`scripts/clone-probe-s185-week.mjs` + the three pixel probes, JSON/PNG at
`docs/probe-evidence/s185/`.

### 1.1 The desktop grid (1440×900, the empty account)

- **The card**: `bg-white rounded-2xl shadow-sm border border-slate-100
  overflow-hidden` — radius 16px, **NO padding**: the header strip and the
  grid render FLUSH to the card edges (the grid-parent chain measured
  pad 0×4 hops).
- **The grid DOM is COLUMN-ORIENTED**: ONE `grid grid-cols-8` whose 8
  children are full-height (840px) columns — the time column
  (`border-r border-slate-100`) + 7 day columns (`relative border-l
  border-slate-100 cursor-pointer hover:bg-slate-50/50`). 840px / 60px =
  **14 hour cells** (7 AM … 8 PM — the S127/CB6 record holds).
- **The header strip** (a SEPARATE `grid grid-cols-8` row above the grid):
  the container carries **`border-b border-slate-100`**; cell[0] is the
  **"Time" corner label** (`p-3 text-center text-sm font-medium
  text-slate-500` — 14px/500/slate-500); cells[1..7] are `p-3 text-center
  border-l border-slate-100` carrying P `text-sm font-medium text-slate-600`
  (the day name) + P `text-lg font-bold **text-slate-700**` (the date —
  rgb(51,65,85), NOT the clone's slate-800).
- **The TODAY header cell** (Saturday 14): **`bg-violet-50`**
  (rgb(245,243,255) — the clone's sf-today-tint light value byte-identical)
  with **NO rounding**, the name `text-violet-600` (rgb(124,58,237)) + the
  date `text-violet-700` (rgb(109,40,217)).
- **The time labels**: each cell `h-[60px] border-b border-slate-50 px-3
  py-1` wrapping **SPAN `text-xs text-slate-400`** (12px/400/slate-400,
  LEFT-positioned at 12px). The pixel probe CONFIRMED the ink
  rgb(148,163,184) at x306–333 — visible, slate-400 (the cell's own
  computed color reads the inherited neutral-50; the SPAN carries the real
  color — the reference's root carries a near-white base text token, and
  every visible text carries its own class).
- **The day-column hour cells**: `h-[60px] border-b border-slate-50` — no
  per-cell border-l (the column div owns the border-l **slate-100**).
- **The vertical separators: slate-100** (rgb(241,245,249)) — the clone's
  per-cell border-l is slate-50 (rgb(248,250,252)), a measurably fainter
  hairline.
- **The view header row**: `flex flex-col md:flex-row md:items-center
  justify-between gap-4` — at mobile the toolbar STACKS below the H1 block
  (the header row 108px tall at 390). Recorded as the S186 candidate
  (§6.7).
- **The banner**: MATCHES the clone (white card, ghost 36px chevrons
  rounded-md, H2 16px/600/slate-700 month + P 14px/slate-500 range "Nov 8 -
  Nov 14").
- **The toolbar**: the "All Weeks" select w-40/h-9, Grid Builder 117px,
  Add Class 132px — the Grid Builder is the reference's OUTLINE family and
  computes **bg rgb(10,10,10) + text rgb(250,250,250)** (§6.2).

### 1.2 The desktop cell-click FUNCTION (the measured create path)

- Clicking an EMPTY day-column cell opens the **Add Class dialog** —
  **prefilled with the DAY ONLY** (Tuesday's 11 AM cell → day select "2";
  the times stay the dialog defaults 09:00/10:00 — probe 10's
  disambiguation; probe 4's Saturday hit was the ambiguous default, probe
  9's expanded-button hit proved the default is day-agnostic).
- The dialog's DEFAULT day (from the toolbar or the expanded button):
  **today** (6 = Saturday = today's getDay; the only sensible reading of a
  fresh-context default — the residual ambiguity recorded in §6.5).
- The columns carry `cursor-pointer` + `hover:bg-slate-50/50` — the hover
  tint rides the COLUMN (the whole column tints when any of its cells is
  hovered).

### 1.3 The mobile surface (390×844 — the reference's own anatomy, measured for the first time)

- The mobile card: `bg-white rounded-2xl shadow-sm border border-slate-100
  overflow-hidden` — NO card padding; a `md:hidden` wrapper inside; **7 row
  wrappers** each `border-b border-slate-100 last:border-b-0` (hairline
  separators, NOT the clone's per-row bordered rounded cards).
- **NO "Today" chip** — the reference renders no chip above the rows (the
  clone's sf-chip-dark Today chip is clone-only chrome).
- The row: `flex items-center gap-3` (cursor-pointer, no role/aria — the
  reference's own a11y gap) with ~16px per-row breathing room (77px row
  rhythm = 44 content + 32 pad + 1 border).
- **The date tile**: `w-10 h-10 rounded-xl flex flex-col items-center
  justify-center bg-slate-100 text-slate-600` carrying **TWO stacked
  spans** — SPAN `text-xs font-medium` ("Sun" — 12px/500/slate-600) over
  SPAN `text-sm font-bold` ("8" — 14px/700/slate-600). The clone renders
  ONLY the date number.
- **The TODAY tile**: `bg-violet-500 text-white` (rgb(139,92,246)) with
  white spans; the TODAY name: `font-medium **text-violet-700**`. NO
  row-level tint (the tile + the name carry today; the row bg stays
  transparent).
- **The weekday names**: P `font-medium` (16px/500) with NO color class —
  the pixel probe measured **ZERO ink** in the six non-today name bands
  (the inherited near-white token): **the reference's own invisible-label
  defect** (the counts at slate-500 and the tiles at slate-600 ink
  normally; Saturday's violet name inks 203px). Recorded, not ported
  (§6.1).
- The count: P `text-sm text-slate-500` — **14px** (the clone's text-xs is
  12px).
- **NO chevron** — no ChevronDown anywhere in the rows (the rows are
  cursor-pointer with no expand glyph).
- **The click EXPANDS an accordion** (the card 540→668px; no dialog), and
  **NO row is pre-opened** (the click on the today row EXPANDED it — the
  initial state is all-collapsed).
- **The expanded EMPTY day**: `overflow-hidden` > **`p-4 space-y-2
  bg-slate-50`** > P `text-center text-slate-500 py-4` "**No classes**"
  (16px/400/slate-500, centered) + an **Add Class BUTTON** — the outline
  family at `h-8 rounded-md px-3 text-xs w-full mt-2` with the 16px Plus
  icon: **bg rgb(10,10,10) + text rgb(250,250,250)** (the reference's
  --background token is near-black — §6.2), radius 6px, shadow-sm.
  Clicking it opens the Add Class dialog **with the DEFAULT form** (day =
  the default, no prefill from the expanded day — probe 9).
- **The My Classes panel**: `bg-white rounded-2xl shadow-sm border
  border-slate-100 p-6` + H2 `text-lg font-bold text-slate-800` + the
  header row `flex items-center justify-between **mb-4**` + "Saturday,
  November 14" + the empty P `text-center text-slate-400 py-8` (the S184
  slim-empty anatomy ✓).

## §2 The clone's drift (the gap table)

| # | Surface | Reference (measured) | Clone (pre-change) | Class |
|---|---|---|---|---|
| D1 | The grid card wrapper | NO padding — the strip + grid flush | `sf-card p-6` — a 24px inset | visual |
| D2 | The header strip container | `border-b border-slate-100` | no border-b | visual |
| D3 | The corner cell | "Time" (p-3 text-sm/500/slate-500) | an EMPTY div | visual |
| D4 | The date color | text-slate-700 | text-slate-800 | visual |
| D5 | The today header cell | bg-violet-50 UNROUNDED + violet-600 name + violet-700 date | `rounded-lg sf-today-tint` + slate-600/slate-800 texts | visual |
| D6 | The time labels | span text-xs text-slate-400, px-3 py-1, LEFT | div text-xs text-slate-500, pr-2 pt-1, RIGHT | visual |
| D7 | The column separators | border-l slate-100 | border-l slate-50 | visual |
| D8 | The empty cells | cursor-pointer + column-wide hover + CLICK → Add Class prefilled (day) | inert | **functional** |
| M1 | The mobile card | ONE overflow-hidden card, hairline rows | sf-card p-4 + 7 bordered rounded-xl cards (gap-2) | visual |
| M2 | The Today chip | NONE | the sf-chip-dark chip | visual |
| M3 | The tile | flex-col: "Sun" (text-xs/500) over "8" (text-sm/700) | the date number only | visual |
| M4 | The today marking | the tile (violet) + the name violet-700; NO row tint | the sf-today-tint ROW + the slate name | visual |
| M5 | The count | text-sm (14px) | text-xs (12px) | visual |
| M6 | The chevron | NONE | ChevronDown (rotating) | visual |
| M7 | The initial state | ALL collapsed | today pre-open | behavioral |
| M8 | The expanded empty day | bg-slate-50 p-4 space-y-2 + "No classes" + the Add Class button | px-3 pb-3 + "No classes this day." + no button | visual + **functional** |
| M9 | The My Classes header row | mb-4 | no mb | visual |
| — | The dialog default day | today (measured) | Monday (0) | behavioral |
| — | The view header row | flex-col at mobile (stacked) | flex-wrap | recorded as the S186 candidate (§6.7) |
| — | The outline-button family | bg rgb(10,10,10) + neutral-50 text | bg-card white + near-black text | recorded as the S186 candidate (§6.2) |

## §3 The port design (the superset mapping — `src/components/views/timetable-view.tsx` only)

1. **§3.1 The grid card + the header strip**: the section drops `p-6`
   (flush); the strip container gains `border-b border-slate-100
   dark:border-slate-800`; the corner cell renders "Time" (`p-3 text-center
   text-sm font-medium text-slate-500 dark:text-slate-400`).
2. **§3.2 The day header cells**: the date `text-slate-800 → text-slate-700`;
   the today cell drops `rounded-lg` (the sf-today-tint stays — its light
   value is byte-identical to the measured violet-50); the today name gains
   `text-violet-600 dark:text-sf-primary-strong-dark`; the today date gains
   `text-violet-700` (the dark variants unchanged — the S10-4 pin rides
   `p.text-lg`'s dark STRONG_DARK).
3. **§3.3 The time labels**: the cell re-ports to `h-[60px] border-b
   border-slate-50 px-3 py-1 dark:border-slate-800` wrapping the label in
   `<span className="text-xs text-slate-400 dark:text-slate-500">` —
   12px slate-400 at the LEFT (12px in). The S7-C hour-rows pin reads the
   cell's textContent ("7 AM" via the span) + its 60px height — both hold.
4. **§3.4 The day cells — the click affordance + the separators**: each
   cell gains `cursor-pointer`, `border-l border-slate-50 → border-slate-100`
   (the measured hairline), `onClick={() => openCreate(isoDay)}` (the
   reference's prefill = the DAY only — the times stay the form defaults),
   and the column-wide hover via a `hoverCol` state (the cell's
   onMouseEnter sets it; the grid container's onMouseLeave clears it; the
   cell tints `bg-slate-50/50 dark:bg-slate-800/50` when its column
   matches). The class-card buttons gain `e.stopPropagation()` on their
   onClick so a card's EDIT never triggers the cell's ADD (the reference's
   cards own their click).
5. **§3.5 The dialog default day**: `openCreate`'s no-arg default becomes
   today's ISO day (`(today.getDay() + 6) % 7`) — the measured reference
   default (the toolbar Add Class + the expanded button ride it).
6. **§3.6 The mobile section**: the card drops `p-4` for `overflow-hidden`
   (the rows carry their own breathing room); the row stack becomes
   `divide-y divide-slate-100 dark:divide-slate-800` over UNBORDERED
   wrappers; the row button re-ports to `flex w-full items-center gap-3
   p-4 text-left` (NO rounding, NO row tint); the tile becomes `flex-col`
   with the two stacked spans (the new `DAY_ABBRS` const, ISO-ordered);
   the today name gains `text-violet-700 dark:text-sf-primary-strong-dark`;
   the count becomes `text-sm`; the ChevronDown RETIRES (with its import);
   `openDay`'s initial state becomes `null` (all collapsed — the measured
   initial); the aria-expanded superset STAYS (invisible semantics).
7. **§3.7 The expanded day**: the wrapper re-ports to the measured
   `overflow-hidden` > `p-4 space-y-2 bg-slate-50 dark:bg-slate-800/50`; the
   empty line becomes the measured `<p className="py-4 text-center
   text-slate-500 dark:text-slate-400">No classes</p>`; the empty day gains
   the **Add Class button** — `<Button type="button" variant="neutral"
   size="sm" className="mt-2 w-full border border-input"
   onClick={() => openCreate()}><Plus …/>Add Class</Button>` (the neutral
   variant IS the measured near-black family — bg #0a0a0a + text #fafafa +
   shadow-sm + 6px radius; the sm size contributes h-8/text-xs/px-3; the
   reference's border-input hairline rides the className). The NON-empty
   expanded branch (the class rows) re-wraps into the same slate-50 block —
   the wrapper is the measured family; the rows keep the clone's own
   anatomy (unmeasurable without creating undeletable reference residue —
   §6.3).
8. **§3.8 The My Classes header row**: gains `mb-4` (the grid's `mt-4`
   drops — the non-empty spacing stays 16px; the empty gains the measured
   16px above its py-8).

## §4 The TDD plan (the honest RED first — eight EI pins in parity-session7.spec.ts)

All eight run against the pre-change tree FIRST and must fail at their
designed markers:

- **EI1** (the flush card): the grid's parent card computes paddingLeft 0
  (the pre-change reads 24px — the RED marker).
- **EI2** (the corner + the strip border): the header strip's first cell
  reads "Time" with 14px/500/rgb(100,116,139) + the strip's border-b 1px
  rgb(241,245,249) (the pre-change: the empty cell + no border — the RED).
- **EI3** (the date colors): a non-today date computes rgb(51,65,85); the
  today cell computes borderRadius 0px + the name rgb(124,58,237) + the date
  rgb(109,40,217) (the pre-change: rgb(30,41,59) + 8px + slate texts).
- **EI4** (the time label carrier): the first label cell's SPAN computes
  rgb(148,163,184)/12px + the cell's paddingLeft 12px (the pre-change: no
  span — the locator RED).
- **EI5** (the cell click): clicking the Sunday 7 AM cell opens the Add
  Class dialog with the day select reading "Sunday" + `#class-start` STILL
  "09:00" (the day prefilled, the hour NOT — the measured semantics); the
  pre-change: no dialog ever (the RED).
- **EI6** (the mobile anatomy): at 390×844 — the row wrappers carry the
  hairline borders with NO per-row rounding, the tile carries the two
  stacked spans (the abbr 12px/500 + the date 14px/700), the count computes
  14px, NO chevron svg in the row buttons, ALL SEVEN aria-expanded read
  "false" (the pre-change: rounded cards, the date-only tile, 12px counts,
  the chevron, today pre-open — the RED).
- **EI7** (the expanded empty day): clicking the Sunday row expands the
  `bg-slate-50` block with "No classes" + the Add Class button (h 32px,
  near-black bg) whose click opens the dialog (the pre-change: the
  transparent px-3 pb-3 wrapper + no button — the RED).
- **EI8** (the dialog default day): the toolbar's Add Class opens with the
  day select reading TODAY's name + the 09:00/10:00 defaults (the
  pre-change: "Monday" — the RED).

Zero uploads (no file API), zero writes (every dialog Escape-closed before
any submit), order-independent (each pin navigates fresh; the dialog state
resets per mount). The pins append after the EH block in
`tests/e2e/parity-session7.spec.ts`.

## §5 The execution order

1. The RED run (the eight EI pins against the pre-change standalone — the
   §0 build).
2. The port (§3.1 → §3.8, one file).
3. The GREEN sweep (the eight EI pins; then the FULL parity-session7 file;
   then the touched-spec cold runs: navigation, a11y-sweep, dark-mode,
   mobile-navigation, resilience, s17-fresh-user, parity-session5).
4. The re-anchor audit (the S7-C/S8-E/S127/CB6/S161/DJ2/S184-EH5/S10-4
   pins — the §7 list).
5. The gates: lint · tsc · unit 1795/1795 · build.
6. The census (`--list`, never estimated) + the doc-chain lockstep +
   the tripwire.
7. The 5-chunk cold cert map.
8. The evidence frames + the screenshots.
9. The closing chrome (the drawer check — the 130th + the parity probe).
10. The commit + the SSH-wrapper push.

## §6 The adjudications (the open questions, resolved)

1. **§6.1 The invisible mobile names**: the reference's six non-today
   weekday names render INVISIBLE (the pixel-verified zero ink — the
   inherited near-white token; only the today name at violet-700 inks).
   The clone's slate-700 names are the READABLE superset (the Escape-close
   posture) — KEPT. The today name's violet-700 IS visible on the
   reference — PORTED. The reference's own defect recorded, not ported.
2. **§6.2 The near-black button family**: the reference's `--background`
   token is rgb(10,10,10) — its ENTIRE outline family (Grid Builder
   measured 117px near-black; the expanded Add Class) renders near-black
   with near-white text. The clone's `neutral` variant IS this measured
   family (the S9-R2/AG1 Exit-Study port: bg #0a0a0a + text #fafafa +
   shadow-sm). The expanded Add Class button rides `variant="neutral"` —
   the measured bytes. The clone's whole OUTLINE family (bg-card white)
   vs the reference's near-black is a STANDING family drift across every
   outline button — OUT OF THIS CYCLE'S SCOPE (the blast radius: dozens of
   pinned surfaces), recorded as the S186 candidate (the outline-button
   family re-rotation).
3. **§6.3 The expanded non-empty branch**: unmeasurable without creating
   reference residue (the reference's timetable has NO delete affordance —
   the S119/BT9 record; a created class would be permanent). The wrapper
   re-ports to the measured empty-day family (bg-slate-50 p-4 space-y-2);
   the class rows keep the clone's own anatomy. Honest gap, recorded.
4. **§6.4 The chevron + the Today chip + the pre-open**: all three retire
   (the reference has none of them — measured). No e2e pin guards any of
   the three (verified by grep across tests/e2e). The aria-expanded button
   semantics STAY (the invisible a11y superset over the reference's bare
   divs). The S105/S113 capture scripts are historical one-shots — noted,
   not re-run.
5. **§6.5 The dialog's default day**: measured 6 on a Saturday in two
   fresh contexts — today is the only sensible reading (a hardcoded
   Saturday default is not a form worth porting). The port: today's ISO
   day. The residual ambiguity (static-6 cannot be excluded without
   waiting for a non-Saturday) recorded here.
6. **§6.6 The DOM orientation**: the reference's grid is column-oriented
   (8 column children); the clone's is row-oriented (14 row fragments).
   The computed geometry is identical (8 columns × 60px rows — the parity
   doctrine's ground truth); the pin surface (S7-C/S8-E/S127) rides the
   row DOM. DECISION: keep the clone's row DOM; port the visual drifts
   only. The DOM shape is not the parity axis.
7. **§6.7 The view header row**: the reference's `flex flex-col
   md:flex-row md:items-center justify-between gap-4` (stacked at mobile)
   vs the clone's `flex flex-wrap` (the S78/AE12 record). OUT OF SCOPE —
   recorded as the S186 candidate (the view-header row family re-probe
   alongside §6.2). The S78/AE9-13 no-overflow pin keeps passing (this
   cycle never touches the header row).
8. **§6.8 The sf-card border token**: the clone's sf-card carries
   `border: 1px solid #e2e8f0` (slate-200) vs the reference's cards
   `border-slate-100`. The shared family across every view — OUT OF SCOPE,
   recorded (a future family cycle).
9. **§6.9 The mobile expanded wrapper in dark**: the reference has no
   coherent dark mode (its dark is the recorded half-broken family); the
   clone's dark rides its own tokens (bg-slate-800/50 for the slate-50
   block) — the standing clone-wide dark superset posture.

## §7 The tripwires, the census, the cert map

- The e2e census: chunk 2 moves 254 → **262** (+8 EI pins); the full map
  158 + 262 + 101 + 95 + 89 = **705**. Verified by `--list`, never
  estimated.
- The unit census: HOLDS **1795/1795 (55 files)** — a view-layer port, no
  new seam.
- The badge: 1795 + 705 = **2500**.
- The tripwire: 138/138 after the doc-chain lockstep.
- The re-anchor audit list (the pins touching the changed surfaces):
  S7-C (the header strip, the hour rows, the My Classes header), S8-E
  (the today tint, the ghost chevrons), S127/CB6 (the 14 rows), S161/DJ2
  (the band guard — the dialog opens via the toolbar; the day default is
  not read), S184/EH5 (the grid-always + the slim empty), S10-4 dark (the
  today header tint + the STRONG_DARK date), the mobile no-overflow
  contract (the mobile rows only get narrower), the a11y-sweep (the
  plain-div cells stay axe-clean; the aria-expanded buttons keep their
  names).

## §8 The doc chain + the evidence

- README: the Session-185 row + the badge (2492 → 2500) + the testing line.
- AGENTS.md: the census pairs + the S185 lessons.
- CLAUDE.md: the census pairs + the week-strip family contract line.
- PAD: v1.3.93 revision block.
- omni-study1_SKILL.md: the census sites.
- vitest.config.ts: the header's S185 block.
- The cert runner pair: the chunk-2 re-tag (254 → 262).
- `docs/session_242.md` (the cycle transcript) + the worklog Session-196
  entry + this plan's §10/§11 close.
- The evidence: the 4 self-verifying frames under `docs/screenshots/`
  (the flush grid + the "Time" corner; the today header cell's violet
  pair; the mobile flat rows + the stacked tile; the expanded empty day
  with the Add Class button) + the 18 probe JSONs/PNGs under
  `docs/probe-evidence/s185/`.
- `.env.example`: re-verified (no env changes this cycle).

## §9 The risks (watched honestly)

- **The hover-col state**: a per-cell onMouseEnter at 98 cells — the
  render cost is a single setState per hover move (the cells' className
  recomputes; React handles the keyed rows fine at this scale). The
  container's mouseleave clears; moving between columns overwrites the
  state (no flicker window — the enter on the new cell fires before the
  leave of the old in the same frame).
- **The stopPropagation on the class cards**: the EDIT path (the
  S119/BT9 pin) must still open the edit dialog — the stopPropagation
  prevents the cell's ADD only; the pin's click on the card still opens
  Edit Class (verified in the GREEN sweep).
- **The dialog default-day change**: any pin that read "Monday" as the
  default select — grepped: none (the DJ2 pin fills its own fields; the
  s17/resilience specs never read the day select's default).
- **The divide-y hairlines in dark**: `dark:divide-slate-800` rides the
  clone's dark tokens.
- **The mobile row click target**: the whole button (tile + text column)
  toggles; the tile is not a separate control (the reference's own
  single-target form).

## §10 The as-executed close (filled at the cycle's end)

Executed as designed, with the pin-level fixes and the honest deviations
recorded below:

1. **The honest RED**: all 8 EI pins failed at their designed markers
   against the pre-change standalone — EI1 at the card's 24px padding,
   EI2 at the strip's 0px border + the empty corner cell, EI3 at the
   slate-800 date + the 8px-rounded today cell with slate texts, EI4 at
   the bare right-aligned label (no span), EI5 at the "auto" cursor +
   the never-opening dialog, EI6 at the Today chip's count 1, EI7 at the
   missing bg-slate-50 block, EI8 at the "Monday" default day.
2. **Three pin bugs root-caused en route** (all pin bugs, not port
   defects): the `md:hidden` colon collides with Playwright's `:hidden`
   pseudo-class — `section.md:hidden` can never satisfy a toBeVisible,
   and the substring escape `[class*="md:hidden"]` double-matched
   `max-md:hidden` (the whitespace-token form `[class~="md:hidden"]` is
   the safe locator); Tailwind v4's `divide-y` emits border-BOTTOM on
   `:not(:last-child)` (the first pin read the second row's border-TOP —
   the emitted side pinned); and the flex-1 wrapper's textContent
   matched the count locator (`/classes/` matched "Sunday 0 classes" —
   the exact-form regex `/^\d+ (class|classes)$/` pins the count span).
3. **The port**: the full §3 map in `timetable-view.tsx` — the flush
   card, the strip's border-b + the "Time" corner, the slate-700 date +
   the today violet pair (UNROUNDED), the span-carried labels at px-3
   LEFT, the slate-100 separators, the column-wide hover + the
   empty-cell click (the day-only prefill + the class-card
   stopPropagation), the today-day dialog default + the 10:00 end
   default (a measured port the EI5/EI8 pins caught — the clone's prior
   10:30 was the never-measured S7-era form), the mobile flat rows (the
   divide-y hairlines, the stacked Sun/8 tile, the 14px counts, the
   chevron/Today chip/pre-open retired, the aria-expanded superset
   staying), the expanded day's measured block + the near-black Add
   Class button, and the My Classes mb-4.
4. **The a11y gate's arbitration**: the first faithful port rendered the
   reference's slate-400 label ink — the a11y-sweep caught it as an axe
   color-contrast serious (2.85:1). The readable slate-500 superset kept
   (the S83/AJ5 precedent); the reference's own defect recorded in the
   view comment + the pin + §6.1. Parity never ships an axe-serious.
5. **The GREEN sweep**: all 8 EI pins GREEN; the full parity-session7
   file 125/125 (the EG + EH + EI families together); navigation +
   a11y-sweep + dark-mode + mobile-navigation 135/135; resilience +
   s17-fresh-user + parity-session5 + greeting-clock + tasks 124/124;
   lint ✓ · tsc ✓ · unit 1795/1795 (55 files — the census UNCHANGED as
   designed) · build ✓ (the seven edge-instrumentation warnings
   pre-existing).
6. **The census** (verified by `--list`, never estimated): chunk 2 =
   262 (254 + 8); the full map 158 + 262 + 101 + 95 + 89 = 705; the
   badge 1795 + 705 = 2500. The tripwire 138/138 after the doc-chain
   lockstep.
7. **The residue discipline**: the reference account ends the cycle at
   TRUE zero — every probe dialog Escape-closed before any submit,
   nothing created or deleted (the measurement rode the account's own
   empty states; the reference's timetable has no delete affordance so
   no class was ever created there).
8. **The evidence**: the four self-verifying frames under
   `docs/screenshots/` (the flush grid + the "Time" corner + the today
   violet pair; the labels + cells asserts; the mobile flat rows + the
   stacked tile + all-collapsed; the expanded empty day + the
   near-black Add Class button — each frame's DOM markers asserted
   in-DOM before the shot, the non-white pixel ratios 3-10%) + the
   eighteen probe JSONs/PNGs under `docs/probe-evidence/s185/`.
9. **The doc chain**: the README (badge 2492 → 2500 + the testing line
   705 + the Session-185 row), AGENTS (the census + the S185 lessons —
   six), CLAUDE (the census + the week-strip family contract line), PAD
   v1.3.93, the SKILL census sites (all three), the vitest header (the
   S185 block), the cert runner re-tags (both scripts, chunk 2 254 →
   262) + the tripwire expectation, session_242.md, the worklog
   Session-196 entry, and this close.
10. **The cert map**: the 5-chunk cold run (158 + 262 + 101 + 95 + 89 =
    705) — chunk 1 **158/158 first roll**; chunk 2's first in-map roll
    read 260 + 2 failed — the two S11-era theme-system chip pins asserting
    the clone-only Today chip THIS cycle retired (a re-anchor class, not a
    port defect — the chip's retirement is the cycle's own measured
    decision) — the pins re-anchored to the surviving mobile today TILE
    (the light leg: the sf-selected-tint violet-600 fill + the white text
    + the violet-700 name; the dark leg: the soft-dark wash + the white
    tile text + the strong-dark name) and the clean cold re-roll reads
    **262/262**; chunk 3's in-map record read 97 (the cert script's
    grep|tail-3 truncation + the interference of this session's own
    concurrent theme-system verification runs against the shared :3100
    server during the map — the operator-honest note: never run
    verification suites against the cert's live server) and the standalone
    cold re-run reads **101/101** first-roll; chunk 4 **95/95 first roll**;
    chunk 5 **89/89 first roll**. The closing chrome: the drawer check
    (the 130th) + the desktop parity probe.
11. **The hand-off**: the commit on `main` + the SSH-wrapper push (the
    operator's standing sequence).

## §11 The final checklist (the operator's asks, mapped) — CLOSED

- [x] Workspace refreshed (the fresh clone at the S184 close; the baseline
      reproduced exactly)
- [x] The core docs read (AGENTS/CLAUDE/README/PAD/SKILL)
- [x] The session docs + worklog read (240/241 + the S184 plan close)
- [x] The validation against the codebase (the cold baseline gates + the
      standing chrome)
- [x] The audit (the eleven reference probes + the clone-side probe + the
      pixel probes; the gap table §2)
- [x] The mobile navigation menu check (the drawer check — the 129th
      consecutive GREEN at the open; no Tailwind v4 mobile-nav bug)
- [x] `.env` at DATABASE_URL="file:../db/custom.db" with `db/` at the repo
      root (verified standing; no changes needed)
- [x] The vitest + playwright suites (the configs verified standing; the
      EI pins extend the e2e layer)
- [x] The remediation plan saved under docs/ (this document) + validated
      against the codebase
- [x] The TDD execution (the EI REDs → the port → the GREEN sweep)
- [x] The dev-server screenshots under docs/screenshots/ (the four
      self-verifying 185 frames)
- [x] `.env.example` re-verified + committed
- [x] The doc-chain lockstep (the tripwire 138/138)
- [x] worklog.md updated (the Session-196 entry) + committed
- [x] The local commit on main + the SSH-wrapper push (the closing
      sequence)

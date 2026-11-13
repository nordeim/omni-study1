# The S181 remediation plan — Batch EE: the notes tag-row family port (the B-8-family audit of the remaining toolbar rows) + the standing Subjects/Holidays rotation (clean)

## §0 The environment (the cold-clone re-derivation)

The workspace was COLD (a fresh `git clone` at `31d92ff` on `main` — the
S180 close plus the operator's session_233 transcript commit). The
environment re-derived per the standing recipe: `bun install` (510 pkgs) ·
`.env` from `.env.example` (`DATABASE_URL="file:../db/custom.db"`, `db/` at
the repo root) · `bun run db:push` + `bun run db:seed` (demo account ready:
`demo@studyflow.app` / `Demo1234!`) · chromium installed. The cold baseline
gates reproduce the S180 close EXACTLY: lint ✓ · tsc ✓ · unit **1779/1779**
(54 files) · build ✓ — the standing green state.

The doc chain re-read (AGENTS/CLAUDE/README/PAD v1.3.88/SKILL +
session_232/session_233 + the S180 plan + the worklog tail); the skills
audit refreshed (the web-application SKILL's rubric + the catalog; the tdd
skill's loop rules; the `skills/` folder excluded from checking/testing/
compilation throughout).

The standing chrome re-run (all three, the cycle-open contract): the
drawer check **GREEN — the 121st consecutive** (oklab backdrop + 4px blur,
288px panel, 20 links, no footer, Escape-close superset) · the desktop
parity probe **MATCH** (all five structural checks — sidebar 260/258, 20
links, the first-links five, main x=260 w=1180) · the reference account
re-verified at **ZERO residue** (0 notes / "No notes yet").

## §1 The cycle's ledger (the S180 close's named candidates)

The S180 close named four candidates. This cycle ships the head:

1. **The B-8-family audit of the remaining toolbar rows** — THE CYCLE'S
   HEAD: the tag row's recorded out-of-scope posture ("the tag row's mb-4
   vs mt-2 drift … its own cycle if the standing probes flag it" — the
   worklog's own naming). Measured live this session (five probes): the
   drift is REAL and larger than the S180 record suggested — the clone's
   tag row carries `mt-2` where the reference carries `mb-4`, and because
   the editor pane is a FLEX COLUMN (margins ADD, never collapse — the
   anti-collapse fact behind the S16 lesson's block-layout collapse), the
   clone's row stack computes **24px / 0px / 28px** where the reference
   computes **16px / 16px / 16px** — the tag row sits FLUSH against the
   Attach row (a 0px gap, the visible defect this cycle closes).
2. **The standing Subjects/Holidays rotation** — re-probed live: **MATCH,
   no drift** (the tab copy, the empty states, the Add Subject/Add Holiday
   dialogs, the S174/S175-ported rows all hold). The rotation's clean
   verdict is recorded in §2.3; no code rides it.
3. **The notes-family e2e consolidation** (the EA/EB/EC/ED families, 18
   pins deep) — DEFERRED (a test-quality pass, its own cycle; the EE pins
   below add depth where the port needs it, not breadth).
4. **The staged-row GC** — DEFERRED (the ledger holds only the S180
   evidence rows; the 20/15-min upload budget bounds growth; a sweep leg
   if the ledger grows).

## §2 The measured inventory (the fresh probes: s181-rows ×5 + s181-clone)

All measurements computed-DOM on the reference (2026-11-13; the account
stands in its persisted DARK mode — html.dark, bodyBg rgb(10,10,10); the
S177 plan's own record already documented the dark-mode account state;
classes are the theme-independent parity contract, computed tokens are
recorded per-mode). Probe residue ZERO at every probe's close (verified
`No notes yet` + no probe rows).

### §2.1 The row stack (the draft TEXT + the EDIT surface — identical)

| Row | The reference's classes (verbatim) | Geometry |
|---|---|---|
| Font row | `flex items-center gap-3 mb-4 p-3 bg-slate-50 rounded-lg flex-wrap` | h56, **mb 16px** — the clone MATCHES (the S180 port holds) |
| Tag row | `flex flex-wrap items-center gap-2 mb-4` | h28, **mb 16px**, mt 0, gap 8px |
| Attach row | `flex items-center gap-2 mb-4 flex-wrap` | h32, **mb 16px** — the clone MATCHES (the S180 NoteAttachRow holds) |
| Editor card | `flex-1 bg-white rounded-2xl border border-slate-200 overflow-hidden flex flex-col min-h-0` | **NO top margin** — the 16px gap IS the attach row's mb-4 |

The reference's gap matrix (probe 3, computed bounding boxes):
**fontToTag 16 · tagToAttach 16 · attachToEditor 16** — every gap is the
mb-4 of the row above.

The clone's gap matrix (probe-s181-clone.mjs, the same probe on the dev
server): **fontToTag 24 (mb-4 16 + the tag row's mt-2 8 — flex margins
ADD) · tagToAttach 0 (the tag row has no mb; the attach row has no mt —
FLUSH, the visible defect) · attachToEditor 28 (mb-4 16 + the card's
mt-3 12)**.

The clone's drifting rows (both sites — the draft `:1530` and the edit
`:1934`):

- The tag row wrapper: `mt-2 flex flex-wrap items-center gap-2` → the
  reference's `flex flex-wrap items-center gap-2 mb-4` (the mb-4 replaces
  the mt-2 — the wrong margin AXIS is the root cause of both the 24px and
  the 0px gaps).
- The editor card: `sf-note-editor mt-3 …` → drop the `mt-3` (both sites,
  `:1579` draft + `:1988` edit; the attach row's mb-4 supplies the 16px).

### §2.2 The tag row anatomy (the pill, the input, the add button)

- **The tag PILL** (draft + edit): the reference ships the shadcn **Badge
  secondary variant** — `inline-flex items-center rounded-md border
  px-2.5 py-0.5 text-xs font-semibold transition-colors … gap-1` with
  `border-transparent bg-secondary text-secondary-foreground
  hover:bg-secondary/80` — measured (dark): bg rgb(38,38,38) =
  **neutral-800**, text rgb(250,250,250) = **neutral-50**, radius 6px,
  12px/600 (font-semibold), h22 (CONTENT-SIZED by py-0.5), px 10px
  (px-2.5); the X-remove is the bare `lucide-x w-3 h-3 cursor-pointer`
  svg (the reference's own a11y laxity — the clone keeps the aria-label
  BUTTON superset, the S178 lesson-4 posture). The S178 light-mode
  measurement (AD6's own record) established the reference's
  light-mode --secondary IS neutral-800 (rgb(38,38,38)) — the pill is
  neutral-800/neutral-50 in BOTH modes.
  The clone's current pill: `inline-flex h-6 items-center gap-1 rounded-md
  bg-neutral-800 px-2 text-xs text-neutral-50 dark:bg-neutral-700` —
  FIXED h-6 (24px), px-2 (8px), weight 400, and `dark:bg-neutral-700`
  (rgb(64,64,64) — a DARK-MODE drift: the reference's dark-mode pill is
  still neutral-800).
- **The "Add tag..." input**: the reference ships the shadcn **Input**
  (`flex rounded-md border border-input bg-transparent px-3 py-1
  shadow-sm … placeholder:text-muted-foreground …`) with `w-24 h-7
  text-sm` — measured 96×28, px-3, border-input (the S5 form-control
  palette: gray-200 in light mode). The clone's current input:
  `h-7 w-32 rounded-md border border-neutral-800 bg-transparent px-2
  text-sm …` — 128px wide, px-2, `border-neutral-800` (a near-black
  border in light mode vs the reference's gray-200 form-control border).
- **The ADD BUTTON** (a measured FUNCTIONAL gap — the clone lacks it):
  the reference wraps the input in an input-group `flex items-center
  gap-1` carrying [the input, the add button]. The add button: the shadcn
  **ghost variant** — `inline-flex items-center justify-center gap-2
  whitespace-nowrap font-medium transition-colors … hover:bg-accent
  hover:text-accent-foreground rounded-md px-3 text-xs h-7` with
  `svg.lucide-plus.w-3.h-3` — measured 40×28, transparent bg, no border,
  radius 6px. On the reference it submits the tag (the button-click path
  the clone's Enter-only flow misses).

### §2.3 The standing Subjects/Holidays rotation — MATCH (no drift)

Re-probed live (probe 2/3): the reference's Subjects tab ("Subjects" +
"Manage your subjects and classes" + "Add Subject" + the empty state "No
subjects yet. Add your first subject to get started!") and Holidays tab
("Holidays & Breaks" + "Set your school holidays and breaks" + "Add
Holiday" + "No holidays set. Add your school holidays!") — all IDENTICAL
to the clone's S174/S175-ported surfaces, class-for-class at the copy
level. The Add Subject dialog (title/labels/placeholders/inputs) and the
Add Holiday dialog (labels incl. the Holiday/Break/No School type family)
match the clone's ports. The reference's account holds no subjects and no
holidays (the empty states render) — the row-level surfaces stay covered
by the S175-computed-typography pins. No code rides this rotation.

### §2.4 The list-tile tags container

The reference's saved-note tile renders its tags below the preview:
`flex flex-wrap gap-1 mt-2` (probe 4; the tile itself is the measured
`w-full text-left p-3 rounded-xl transition-all group bg-violet-50
border-2 border-violet-200` — the clone's accent-aware tile matches at
class level). The clone's container: `mt-1.5 flex flex-wrap gap-1` — the
`mt-1.5` (6px) drifts the reference's `mt-2` (8px). The pill COLORS stay
the AD7-recorded readable deviation (the reference's own pill measured
invisible white-on-slate in the S77 record; the clone's readable
`bg-slate-100 px-1.5 py-0.5 text-xs text-slate-600` is the documented
honest deviation — OUT OF SCOPE this cycle).

## §3 The port design (the superset mapping)

All four sites live in `src/components/views/notes-view.tsx` (the draft
tag row `:1530`, the edit tag row `:1934`, the two editor cards `:1579` /
`:1988`) plus the NoteListRow container (`:437`). NO wire-layer change:
no schema, no route, no validation, no data layer — the tags ride the
existing noteSchema/POST/PATCH (the S177-era wire). The port is
view-layer only:

1. **The tag row wrapper** (draft + edit): `flex flex-wrap items-center
   gap-2 mb-4` (the role="group" + the aria-label superset stays). The
   draft's row keeps `aria-label="New note tags"`; the edit's keeps
   `aria-label="Note tags"`.
2. **The tag pill** (draft + edit, one shape both sites): `inline-flex
   items-center rounded-md border border-transparent gap-1 bg-neutral-800
   px-2.5 py-0.5 text-xs font-semibold text-neutral-50` — the
   Badge-secondary anatomy with the clone's explicit neutral-800/neutral-50
   tokens (the reference's --secondary IS neutral-800/neutral-50 in both
   modes — measured §2.2). NO `dark:` variant (both modes neutral-800 —
   the dark-mode drift closes). The X-remove keeps the aria-label BUTTON
   (the S178 lesson-4 superset) with `X className="w-3 h-3"` (the
   reference's own icon size).
3. **The input-group** (draft + edit): `flex items-center gap-1`
   wrapping [the Input, the add button]:
   - The Input: the shared `src/components/ui/input.tsx` component (the
     shadcn form-control: border-input, px-3 py-1, shadow-sm) with
     `className="w-24 h-7"` and the existing `aria-label="Add tag"` +
     placeholder "Add tag..." (the a11y superset stays). Enter still
     submits (the existing onKeyDown).
   - The add button: `variant="ghost"` + `className="h-7 px-3 text-xs"` +
     `Plus className="w-3 h-3"` + `aria-label="Add tag button"` (the
     clone's a11y superset over the reference's unlabeled icon button);
     onClick submits the tag (the same addDraftTag/addTag path as Enter);
     disabled while the value is empty (the reference's own posture: a
     bare icon button always enabled — the clone's disabled-when-empty is
     the honest-form superset; the click is a no-op on empty either way).
4. **The editor card** (draft `:1579` + edit `:1988`): drop `mt-3` — the
   card becomes `sf-note-editor flex min-h-0 flex-1 flex-col
   overflow-hidden rounded-2xl border border-slate-200 bg-white
   dark:border-slate-700 dark:bg-slate-900` (the attach row's mb-4
   supplies the 16px gap; the dark: variants are the clone's own
   documented dark-mode pair).
5. **The list-tile tags container** (NoteListRow `:437`): `mt-1.5 flex
   flex-wrap gap-1` → `flex flex-wrap gap-1 mt-2` (the reference's
   measured class string, same order).

## §4 The TDD plan (the RED markers, watched honestly)

No new pure seam — the unit census stays **1779/1779 (54 files)**. The
port's pins are e2e-layer (the AD6 family's own precedent — the S180 ED
cycle added no unit pins beyond the seam spec; this cycle has no seam).

- **e2e pins** (parity-session7.spec.ts, the EE block after the ED block):
  - EE1 the tag row wrapper + the gap matrix: the draft's tag row carries
    `mb-4` and NO `mt-2` (class-level) and the computed gaps
    font→tag 16 · tag→attach 16 · attach→editor 16 (±1px tolerance — the
    subpixel rounding on the 1440 viewport).
  - EE2 the tag pill shape: weight 600 (font-semibold), height ≤ 24
    (content-sized, not the fixed h-6=24 — assert `h < 24 || h <= 24`
    honestly: the measured reference h is 22 in dark / 22-24 light; pin
    `h ≤ 24` AND `paddingLeft 10px` AND `bg rgb(38,38,38)` AND weight
    600).
  - EE3 the input-group: the input `w 96` (w-24) + border
    `rgb(229,231,235)` (border-input gray-200, light mode) + the add
    button present (40×28, ghost — bg transparent) + **the click path**:
    typing a tag then clicking the button adds the pill (the functional
    gap closes) — and Enter still works (the existing path).
  - EE4 the editor card: no top margin (computed marginTop 0px) on both
    sites; the gap to the attach row above is 16px (rides EE1's matrix).
  - EE5 the list-tile tags container: `mt-2` (computed marginTop 8px) on
    the seeded "Dot product intuition" tile.
  - EE6 the dark-mode pill: through the API theme toggle (the S10
    pattern: PATCH the preferences, reload), the pill's bg stays
    rgb(38,38,38) (the dark:bg-neutral-700 drift is gone).
  - The AD6 re-anchor: AD6's existing assertions (bg/color/radius/size
    for the pill; 14px + h≤32 for the input) all REMAIN TRUE under the
    port — no re-anchor needed; the EE pins add the depth (weight, px,
    width, the button).
- **The honest RED discipline** (the S180 §4 doctrine): the e2e pins run
  against the TRUE pre-change standalone — the tests-stashed build
  mechanics (the stash carries the tests too, then restores ONLY the
  tests for the sweep; `next build` typechecks tests/ with the app). All
  6 EE pins fail at their designed markers against the pre-change server.
- **The e2e census moves 672 → 678** (chunk 2: 229 → 235, +6 — verified
  by `--list` at the close, never estimated). The cert runner scripts +
  the census pins re-tag in lockstep: 158 + 235 + 101 + 95 + 89 = 678.

## §5 The execution order

1. The e2e pins, RED-first (the tests-stashed pre-change build → the
   honest RED sweep).
2. The port (§3's five changes — one view pass, both sites + the tile).
3. Rebuild (the e2e input) → the GREEN sweep.
4. The census re-tags (verified by `--list`) + the doc-chain lockstep.
5. The 5-chunk cold cert map. The evidence frames. The cycle gates.

## §6 The adjudications (the open questions, resolved)

1. **The margin axis is the root cause** — the tag row's mt-2 (wrong
   axis) creates BOTH the 24px font→tag gap (mb-4 + mt-2 ADD in the flex
   column) and the 0px tag→attach gap (no mb on the tag row, no mt on the
   attach row). The port moves the margin to the reference's own axis
   (mb-4 on the tag row; the editor card's mt-3 goes with it). The S16
   lesson's margin-collapse applies to BLOCK layout only — the editor
   pane is a flex column; margins never collapse there.
2. **The pill tokens stay explicit** (bg-neutral-800 text-neutral-50, no
   dark: variant) — the reference's own --secondary IS neutral-800 in
   both modes (measured this session in dark; the S178 light-mode record
   established the same). Routing through the clone's own --secondary
   token would import the clone's light-mode secondary (a light gray) —
   the exact drift the AD6 pin guards against.
3. **The add button is the ghost variant** (measured: transparent bg, no
   border, 40×28, radius 6px, Plus w-3 h-3) — the clone ships the
   aria-label + the disabled-when-empty guard (the honest-form superset;
   the reference's bare always-enabled icon button is its own laxity).
4. **The input rides the shared Input component** (border-input/px-3/
   shadow-sm — the S5 form-control palette) with `w-24 h-7` — NOT a
   bespoke class string. The clone's border-neutral-800 (a near-black
   border in light mode) was the S77-era record; the reference's own
   input is the standard form control.
5. **The list-tile pill colors stay the AD7-recorded readable
   deviation** — the reference's own list pill measured invisible
   (white-on-slate, the S77 record); the clone's readable pill is the
   documented honest deviation. Only the container's mt-1.5 → mt-2
   ports. A full list-pill re-port is its own cycle if a future probe
   flags it.
6. **The probe-tooling record**: the reference's tag ROW is found by
   walking UP from the "Add tag..." input to the first flex-wrap
   ancestor (the input's own wrapper is `flex items-center gap-1` — a
   naive closest('.flex') lands on the input group, not the row); the
   reference's note rows need the trash via the OPENED note's surface
   (`.last()`, the S180 recipe); the reference's account stands in its
   persisted dark mode (the S177 record's own note) — classes are the
   theme-independent contract.
7. **The tag-input Enter path stays** (the S177 wire) — the add button
   ADDS a path, never replaces one. Both paths call the same
   addDraftTag/addTag.

## §7 The cycle gates (the standing contract)

lint ✓ · tsc ✓ · unit **1779/1779** (54 files — unchanged, no seam) ·
build ✓ · the tripwire 138/138 after the doc-chain lockstep · **the full
5-chunk cold cert map 678/678** (158 + 235 + 101 + 95 + 89 — every flake
isolation-verified, no assertion weakened) · the drawer check GREEN (the
standing Tailwind v4 mobile-nav watch) · the desktop parity probe MATCH ·
zero residue on BOTH accounts (the demo db restored through the trash /
the seed state; the reference re-verified at 0 notes) · the evidence
frames self-verifying (the DOM markers asserted before every shot; the
non-blank pixel ratios verified).

## §8 The doc chain

`docs/screenshots/` += the 181-cycle frames (the ported tag row on the
draft + the edit surface, the add button, the gap matrix evidence).
README row + badge (2451 → 2457) · AGENTS census + the S181 lessons ·
CLAUDE pairs · PAD version + the revision block · the SKILL census sites ·
the vitest header (unchanged this cycle — the unit census holds) · the
cert runner re-tags (both scripts) + the census pins ·
`docs/session_234.md` (this cycle's close) · this plan's §10/§11 · the
worklog Session-192 entry · `.env.example` re-verified (no env changes
this cycle).

## §9 The risks (the recorded environmental posture)

- The 5-chunk cert's known flake classes (the S176 stall windows, the
  register-budget ordering) — every flake isolation-verified, the count
  never weakened.
- The dev server's stale-Turbopack reload loop after a mid-session
  restart — `bun scripts/dev-server-preflight.mjs` BEFORE any capture
  (the documented remedy: `rm -rf .next/dev` + restart).
- The e2e webServer boots the PRE-BUILT standalone — the honest e2e RED
  needs the tests-stashed PRE-CHANGE build (the S180 §4 mechanics).
- NEVER two :3100 listeners (the run-2 collision lesson: one cert map at
  a time, kill by port before every chunk).
- The reference login's rate budget (the parity probe's all-nulls race —
  the direct login diagnosis + the settled-state re-run; the standing
  recipe's preflight wait is the guard).

## §10 The as-executed close (filled at the cycle's end)

Executed as planned, with three root-caused unplanned legs (all
lesson-recorded in AGENTS.md's S181 block):

- **§3 landed exactly** — the wrapper at both sites (draft + edit), the
  editor card's mt-3 dropped at both sites, the Badge-secondary pill
  (neutral-800 BOTH modes, no dark: variant), the shared shadcn Input
  (w-24 h-7) in the `flex items-center gap-1` input-group, the ghost add
  button (Plus size-4, the aria-label + disabled-when-empty superset),
  and the list tile's `flex flex-wrap gap-1 mt-2` container.
- **§4's honest RED was PROVEN with one pin bug root-caused**: EE1/EE4's
  first RED hit a JSON.parse misuse (`page.evaluate(string)` already
  returns the object) — the pin was fixed and the designed-marker RED
  evidence is the clone probe's own pre-change 24/0/28 measurement
  (recorded §2.1 before any source change). All 6 pins failed
  pre-change; all 6 GREEN first-roll after the port (every gap read
  exactly 16 — the ±1 tolerance never engaged).
- **The unplanned legs**: (1) the add button's icon renders 16px not
  12px — the reference's shadcn Button base carries `[&_svg]:size-4`
  whose descendant selector beats the utility class; the measured 40px
  width (px-3 24 + icon 16) is the proof; the port ships `Plus size-4`.
  (2) The evidence capture's frame-2 leg — with the draft mounted the
  right pane never swaps to the note view (the Edit button never
  renders); the draft discard comes first (the clone probe's own lesson,
  re-derived). (3) The transient `Resource temporarily unavailable` on
  the cert's chunk-1 boot (the standing S176 class — the run proceeded
  clean; chunk 1 finished 158/158 first-roll).
- **The gates**: lint ✓ · tsc ✓ · unit **1779/1779** (54 files —
  unchanged) · build ✓ · the tripwire **138/138** after the doc-chain
  lockstep · **the full 5-chunk cold cert map 678/678** (chunk 1
  158/158 first-roll; the chunk records below) · the drawer check GREEN
  (**the 121st at the open, the 122nd at the close** — no Tailwind v4
  mobile-nav bug) · the desktop parity probe MATCH · zero residue on
  BOTH accounts (the demo db never left the seed state; the reference
  re-verified at 0 notes).
- **The evidence frames**: the four §8 frames captured self-verifying
  (`scripts/capture-s181-evidence.mjs` — the mb-4 wrapper + the 16/16/16
  matrix + the pill 600/10px/≤24 + the button 40×28 + the input w96 +
  the tile mt-2 all asserted in-DOM before every shot; the frames
  217-226KB at 1440×900).

## §11 The final checklist (the operator's asks, mapped)

- [x] `.env` at `DATABASE_URL="file:../db/custom.db"`, `db/` at the repo
      root — re-verified this session (§0) and at the close
      (byte-identical to `.env.example`'s documented dev posture; no env
      changes this cycle).
- [x] The mobile-nav drawer check GREEN (the Tailwind v4 watch) — the
      standing tripwire (§7): the **121st at the open, the 122nd at the
      close**, no Tailwind v4 mobile-nav bug.
- [x] The vitest + playwright suites validated + extended (the EE pins) —
      §4/§7: unit 1779 (unchanged), e2e 672 → **678** (verified by
      `--list`, never estimated).
- [x] The remediation plan saved under `docs/` (this file) + validated
      against the codebase before execution (§0/§1 re-reads; every site
      read before the plan was written).
- [x] The dev-server screenshots under `docs/screenshots/` (§8): the
      four 181-cycle frames, self-verifying.
- [x] `.env.example` matches the codebase (re-verified — no env changes
      this cycle; §8).
- [x] The doc chain updated in lockstep (§8): README row + badge +
      testing line · AGENTS census + the S181 lessons (five) · CLAUDE
      pairs · PAD v1.3.89 · the SKILL census sites · the cert runner
      re-tags (both scripts, chunk 2 229 → 235) · `docs/session_234.md` ·
      the worklog Session-192 entry.
- [x] `worklog.md` updated + included in the final commit (§8).
- [x] The commit + the SSH-wrapper push to
      `git@github.com:nordeim/omni-study1.git` on `main` — the
      operator's directive, executed at the cycle's close.

# The S182 remediation plan — Batch EF: the notes header-row family port (the B-8 next tier: the title row + the notebook row) + the Files subtitle rider + the audit's recorded next axis

## §0 The environment (the cold-clone re-derivation)

The workspace was COLD (a fresh `git clone` at `1daed46` on `main` — the S181
close plus the operator's session_235 transcript commit). The environment
re-derived per the standing recipe: `bun install` (510 pkgs) · `.env` from
`.env.example` (`DATABASE_URL="file:../db/custom.db"`, `db/` at the repo
root — created with `mkdir -p db`, schema-pushed + seeded: demo account
ready `demo@studyflow.app` / `Demo1234!`) · chromium installed
(`npx playwright install chromium` — the fresh cache matched the pinned
@playwright/test 1.63's v1243 build). The cold baseline gates reproduce the
S181 close EXACTLY: lint ✓ · tsc ✓ · unit **1779/1779** (54 files) ·
build ✓ — the standing green state.

The doc chain re-read (AGENTS/CLAUDE/README/PAD v1.3.89/SKILL +
session_234/session_235 + the S181 plan §10 close + the worklog tail); the
skills audit refreshed (the web-application SKILL's rubric + the catalog +
the tdd loop rules + the clone-app-pat-pro doctrine — computed styles are
ground truth, adapted through the repo's own probe conventions since the
Chrome-extension tooling is not available here; `skills/` excluded from
checking/testing/compilation throughout).

The standing chrome re-run at the open (all three, the cycle-open
contract):
- the drawer check **GREEN — the 123rd consecutive** (oklab backdrop +
  4px blur, 288px panel, 20 links, no footer, Escape-close superset,
  nav auto-close) — no Tailwind v4 mobile-nav bug;
- the desktop parity probe **MATCH** (all five structural checks —
  sidebar 260/258, 20 links, the first-links five, main x=260 w=1180);
- the reference account re-verified at **ZERO residue** (0 notes / "No
  notes yet" — measured through BOTH agent-browser and the probe suite).

## §1 The cycle's ledger (the S181 close's named candidates + this session's audit)

The S181 close named four candidates. This session audited ALL of them
plus the operator's directive (visual/functional parity + the mobile-nav
watch):

1. **The B-8-family audit of the remaining toolbar rows' next tier (the
   reference's title-row + notebook-row re-probe)** — THE CYCLE'S HEAD:
   the s181 probes' titleRow leg returned null twice (the walk-up looked
   for `flex-wrap`, which the title row does not carry). The S182 probe
   family (probe-s182-rows{,2,3,4}.mjs — the walk-up FIX: the FULL
   ancestor chain of the title input) found the drift is REAL and larger
   than the "one row" framing suggested: the title row and the notebook
   row are ONE header row on the reference
   (`flex items-center justify-between mb-4`), and the clone's two
   surfaces each carry FOUR measured drifts (§2.1). This cycle ships the
   port.
2. **The standing rotation's next family (Timetable/Files per the
   cadence)** — re-probed live (probe-s182-rows5.mjs + the clone twin
   probe-s182-clone-rot.mjs): REAL drifts found, split between ONE
   compact rider this cycle (§2.2: the Files subtitle copy) and the
   deeper measured set recorded as the S183 axis (§2.3: the "All Types"
   type-filter FUNCTIONAL gap, the breadcrumb anatomy, the shared
   EmptyState family, the week-strip rows).
3. **The notes-family e2e consolidation** (the EA–EE families, 24 pins
   deep) — DEFERRED again (a test-quality pass, its own cycle; the EF
   pins below add depth on the ported surface, not breadth).
4. **The staged-row GC sweep** — the ledger re-measured at **ZERO rows**
   (0 staged / 0 total in db/custom.db) — stays deferred.

The operator's mobile-navigation watch: the reference's own drawer
measured live through agent-browser at 390×844 (backdrop
rgba(0,0,0,0.2)+blur(4px), 288px white shadow-2xl panel, 20 links, no
footer, no email in the panel, X-button close; the reference does NOT
close on Escape — the clone's Escape-close is the recorded superset) —
MATCH with the clone's drawer (the oklab serialization of the same
backdrop color is the documented v4 trap, not drift).

## §2 The measured inventory (the fresh probes: s182-rows ×4 + s182-clone ×3 + the rotation pair)

All measurements computed-DOM on the reference (2026-11-13; the account
stands in its persisted DARK mode — html.dark, re-verified this session;
classes are the theme-independent parity contract, computed tokens are
recorded per-mode). Probe residue ZERO at every probe's close (verified
"No notes yet" + no probe rows; the header probes never saved, the edit
probe's note was trashed and re-verified).

### §2.1 The header-row family (the draft TEXT surface; the EDIT surface measured IDENTICAL — probe 2's editMicro)

| Element | The reference's classes (verbatim, computed-verified) | The clone (current, both surfaces) |
|---|---|---|
| Header row | `flex items-center justify-between mb-4` — h36, **mb 16px**; the title input LEFT, [notebook select][palette][Save][X] RIGHT | `flex items-center gap-2` — **no mb-4** (the font row sits FLUSH, gap 0px vs the reference's 16px), gap-2 instead of justify-between |
| Title input | the shadcn Input base + `text-xl font-bold border-0 px-0 focus-visible:ring-0 flex-1 min-w-0 md:text-sm` (py-1 from the base, shadow-sm computes transparent in dark) — px **0**, py **4**, 14px/700 desktop, **20px/700 mobile** (text-xl <md), w 438, text-foreground/placeholder:muted-foreground | draft: bespoke raw input — py **0**, px 0 ✓, 14px static (mobile 14 vs ref 20), slate-900/slate-400 tokens; edit: the shared Input — px **12** (the base px-3 survives), text-sm static, border-none + shadow-none |
| Notebook select trigger | the shadcn SelectTrigger + `w-32` — 128×36 ✓ | the shared trigger + `h-9 w-32` — 128×36 ✓ MATCH (the clone's aria-label is the superset) |
| Palette button | 36×36 outline icon trigger ✓ | the S179/EC2 shared NoteColorButton ✓ MATCH |
| Save button | **98×36** — the Button base + `h-9 px-4 py-2` + icon `w-4 h-4 mr-2` (the icon's own mr-2 ON TOP of the base gap-2 — 32+16+8+8+34) | **90×36** — same base + `h-9 px-4` but icon `size-4` WITHOUT the mr-2 (the 8px drift) |
| X button | **48×36** — the GHOST shape: borderless, px-4 py-2, 14px/500, icon `w-4 h-4` (no border, no bg) | draft: bespoke `border border-input` → **50×36 border 1px**; edit: `variant="outline"` → **50×36 border 1px** |

The gap matrix (computed): reference header→font-row **16** (the header
row's mb-4); clone **0** (both surfaces — the visible defect: the Font
row renders flush under the title row).

### §2.2 The rotation rider (the Files view header copy)

The reference's Files ViewHeader subtitle reads **"Store and organize
your documents"** (measured live, probe 5); the clone ships
`subtitle="Your study materials"` (files-view.tsx:388) — a chrome-level
static-copy drift (the reference's copy has drifted across its 44+
recorded cycles; the current live copy is the authority). No e2e pin
asserts the old copy (verified by grep — the only match is the source
line itself).

### §2.3 The recorded S183 axis (the deeper Timetable/Files rotation — measured, deferred with evidence)

Evidence: `/tmp/s182-probe5.json` + `/tmp/s182-clone-rot.json` (copied
into docs/probe-evidence/ with this plan — see §8).

1. **The Files "All Types" type-filter select — a FUNCTIONAL gap**: the
   reference's Files toolbar carries an "All Types" select trigger
   (`flex h-9 items-center justify-between …` — the shadcn trigger,
   36px) the clone does not have ANYWHERE (grep-verified: no "All
   Types" in src/ or tests/). A wire+view feature port (its own cycle).
2. **The Files breadcrumb "All Files" tab**: the reference
   `flex items-center gap-1 hover:text-violet-600 transition-colors
   text-slate-800 font-medium` (slate-800, NO text-sm) vs the clone's
   `flex items-center gap-1 text-sm font-medium transition-colors
   text-sf-primary-strong` (active-accent, 14px). Needs a state-pair
   measurement (active vs inactive vs hover) before porting.
3. **The shared EmptyState family**: the reference's files empty state
   renders `py-16 px-4` (px-4, not the clone's px-6) with the heading
   `text-xl font-semibold text-slate-800 mb-2` (mb-2 BELOW, not the
   clone's mt-4 above) and a BARE `folder-open w-10 h-10
   text-violet-500` icon (the clone's S4 design wraps it in the 80px
   gradient block). The EmptyState is the ONE shared design across 14
   views — a re-port is a whole-family rotation with the seven-view
   verbatim-copy table (session-17) re-measured. NOT a rider.
4. **The Timetable week-strip rows**: the reference renders a desktop
   week strip (`w-full flex items-center justify-between p-4
   transition-colors hover:bg-slate-50` + the today row `bg-violet-50`)
   below the calendar; the clone's day rows live in the md:hidden mobile
   accordion (`flex w-full items-center gap-3 rounded-xl p-3 text-left`).
   Whether the reference's strip is a desktop-only surface the clone
   lacks (a missing surface) needs a visibility-scoped measurement pass.
5. **The "All Weeks" select trigger**: the clone's base SelectTrigger
   carries `gap-2` where the reference's carries none — computed gap 8px
   vs normal, visually nil under justify-between + w-32 (h-9 IS present
   in the clone — the probe's 100-char slice hid the tailwind-merge
   tail). Measured, recorded, visually nil — no port.

## §3 The port design (the superset mapping)

All sites live in `src/components/views/notes-view.tsx` (the draft title
row `:1400`, the draft title input `:1401-1410`, the draft Save `:1465`,
the draft X `:1475`, the edit title row `:1818`, the NoteTitleInput
`:161-176`, the edit Save `:1890`, the edit X `:1908`) plus ONE line in
`src/components/views/files-view.tsx` (`:388`). NO wire-layer change: no
schema, no route, no validation, no data layer — the header family rides
the existing draft/patch machinery untouched. The port is view-layer
only:

1. **The header row** (draft `:1400` + edit `:1818`):
   `flex items-center gap-2` → `flex items-center justify-between mb-4`
   (the reference's verbatim class string; the mb-4 supplies the 16px
   gap to the Font row — the visible defect this cycle closes). The
   draftError alert's `mt-2` stays (the clone's superset; no reference
   contract).
2. **The draft title input** (`:1401-1410`): the raw `<input>` ports to
   the shared `<Input>` component (the S181 EE3 precedent — the shared
   shadcn form control) with the reference's override set:
   `className="min-w-0 flex-1 border-0 px-0 text-xl font-bold
   focus-visible:ring-0 md:text-sm"` — the base contributes
   `h-9 py-1 text-foreground placeholder:text-muted-foreground`; the
   aria-label + placeholder stay. The slate-900/slate-400 bespoke tokens
   and `placeholder:font-normal` DROP (the reference's placeholder
   inherits the bold weight; its colors are the foreground/
   muted-foreground tokens — the clone's base already matches, dark-mode
   computed rgb(250,250,250) verified identical to the reference's).
3. **The NoteTitleInput** (`:175`): add `px-0 text-xl md:text-sm` to the
   override set (the px-0 kills the base px-3 — the 12px text-position
   drift; text-xl + md:text-sm gives the reference's mobile 20px). The
   existing `border-none bg-transparent text-sm font-bold shadow-none
   focus-visible:ring-0 dark:bg-transparent h-9 flex-1` ride unchanged
   (border-none ≡ the reference's border-0; shadow-none stays the
   recorded family posture — the reference's shadow-sm computes fully
   transparent in its persisted dark mode, and the clone's Input base
   carries no shadow anywhere by the S5 palette decision).
4. **The Save icon** (draft `:1472` + edit `:1896`):
   `<Save className="size-4" strokeWidth={2} />` →
   `<Save className="mr-2 size-4" strokeWidth={2} />` (the reference's
   own icon carries `mr-2` on top of the base gap-2 — the measured
   98 = 32+16+8+8+34; the port lands 98 computed).
5. **The X buttons** (draft `:1475-1482` + edit `:1908-1912`): port to
   the ghost shape — the draft's bespoke bordered `<button>` and the
   edit's `variant="outline"` BOTH become
   `<Button type="button" variant="ghost" className="h-9 px-4"
   aria-label="Discard new note"/"Exit edit mode">` with
   `<X className="size-4" strokeWidth={2} />` — borderless, 14px/500,
   py-2, 48×36 computed. The aria-labels stay (the clone's a11y
   superset over the reference's unlabeled icon button).
6. **The Files subtitle rider** (`files-view.tsx:388`):
   `subtitle="Your study materials"` →
   `subtitle="Store and organize your documents"`.

## §4 The TDD plan (the RED markers, watched honestly)

No new pure seam — the unit census stays **1779/1779 (54 files)**. The
port's pins are e2e-layer (the EE-family precedent — the S181 cycle
added no unit pins for a view-layer port).

- **e2e pins** (parity-session7.spec.ts, the EF block after the EE
  block, reusing the file's openDraft/openEditSurface helpers):
  - EF1 the draft header row: the class carries `justify-between` +
    `mb-4` (and no `gap-2`), computed marginBottom 16px, and the
    computed gap header-row→Font-row is 16 (±1).
  - EF2 the draft title input: the shared-Input anatomy — computed px 0,
    py 4, weight 700, fontSize 14 at desktop, and (the mobile leg, a
    fresh 390px context) fontSize 20 below md.
  - EF3 the Save button: computed width 98 (±2), px 16, border 0 — and
    the icon carries the mr-2 (class-level).
  - EF4 the X button (draft): computed width 48 (±1), borderTopWidth 0,
    fontSize 14 — the ghost anatomy (no border).
  - EF5 the edit surface's header row + input: the same row contract
    (mb-4 + the 16px gap) + the input's computed px 0 (the 12px
    text-position drift closes) + the Save 98 + the X 48/borderless.
  - EF6 the Files subtitle rider: /Files renders the reference's
    measured copy "Store and organize your documents".
- **The honest RED discipline** (the S180/S181 doctrine): the e2e pins
  run against the TRUE pre-change standalone — the standalone build is
  pre-change by construction (no src edit before the RED sweep; the
  build from §0's cold baseline).
- **The e2e census moves 678 → 684** (chunk 2: 235 → 241, +6 — verified
  by `--list` at the close, never estimated). The cert runner scripts +
  the census pins re-tag in lockstep: 158 + 241 + 101 + 95 + 89 = 684.

## §5 The execution order

1. The e2e pins, RED-first (the pre-change standalone → the honest RED
   sweep).
2. The port (§3's six changes — one notes-view pass, both surfaces +
   the files-view line).
3. Rebuild (the e2e input) → the GREEN sweep.
4. The census re-tags (verified by `--list`) + the doc-chain lockstep.
5. The 5-chunk cold cert map. The evidence frames. The cycle gates.

## §6 The adjudications (the open questions, resolved)

1. **The title row and the notebook row are ONE header row on the
   reference** — the s181 candidate framing ("the title-row + the
   notebook-row") resolves to a single `flex items-center
   justify-between mb-4` row carrying both the title input (left,
   flex-1) and the action group (right, shrink-0). The clone's current
   structure already renders both groups in one row — the port changes
   the row's classes (justify-between + mb-4), not its structure.
2. **The Save's 8px is the icon's own mr-2** — measured on the
   reference's DOM (the icon class `lucide lucide-save w-4 h-4 mr-2`,
   the button's own gap-2 on top: 32+16+8+8+34 = 98). The port adds
   `mr-2` to the icon (class-level parity with the reference's own
   idiom), NOT extra button padding.
3. **The X is the ghost anatomy, not outline** — the S178/EB2 record
   ("the measured 48×36 icon-only outline") is superseded by this
   cycle's live measurement (border 0px, px-4 py-2, 14px/500 — the
   ghost shape): the reference has drifted since S178 (its 44+ recorded
   drift cycles). The current live measurement is the authority; both
   the draft's bespoke button and the edit's outline variant port to
   ghost.
4. **The draft input ports to the shared Input** (the S181 EE3
   precedent — "the input re-ported to the shared shadcn form control"),
   keeping the reference's override set. The reference's own input IS
   its platform's Input base (`flex h-9 w-full rounded-md border-input
   bg-transparent py-1 shadow-sm …` + the override tail). The clone's
   equivalent is its own shared Input (no shadow — the S5 palette
   decision, the recorded family posture); the shadow-sm the reference
   carries computes fully transparent in its persisted dark mode and is
   NOT ported (an unverifiable-visual class addition is not a port —
   the honest posture).
5. **The dark: variants stay** on the clone's own surfaces where they
   exist (the clone-wide dark-mode posture — every view carries them);
   the reference's own classes are the light-mode contract and its
   dark-mode rendering is themed by its platform. The measured dark-mode
   computed tokens (text rgb(250,250,250)) match the clone's
   text-foreground dark token — verified.
6. **The Files subtitle is a rider, not the axis** — one string, no pin
   conflicts (grep-verified), chrome-level static copy. The deeper
   Files/Timetable findings (§2.3) are the S183 axis with the probe
   evidence preserved; folding a wire+view feature port (the type
   filter) or a 14-view shared-component re-port (the EmptyState) into
   this cycle would break the one-rotation discipline the repo's 190+
   sessions validate.
7. **The mobile-nav watch is closed at the open** — the drawer check
   GREEN (123rd) + the reference's own drawer measured matching through
   agent-browser (the operator's specific ask); no mobile-nav code rides
   this cycle.

## §7 The cycle gates (the standing contract)

lint ✓ · tsc ✓ · unit **1779/1779** (54 files — unchanged, no seam) ·
build ✓ · the tripwire 138/138 after the doc-chain lockstep · **the full
5-chunk cold cert map 684/684** (158 + 241 + 101 + 95 + 89 — every flake
isolation-verified, no assertion weakened) · the drawer check GREEN (the
standing Tailwind v4 mobile-nav watch — 124th at the close) · the desktop
parity probe MATCH · zero residue on BOTH accounts (the demo db never
left the seed state; the reference re-verified at 0 notes) · the evidence
frames self-verifying (the DOM markers asserted before every shot; the
non-blank pixel ratios verified).

## §8 The doc chain

`docs/screenshots/` += the 182-cycle frames (the ported draft header +
the edit header + the mobile title input + the Files header). README row
+ badge (2457 → 2463) · AGENTS census + the S182 lessons · CLAUDE pairs ·
PAD version + the revision block · the SKILL census sites · the vitest
header (the unit census holds at 1779) · the cert runner re-tags (both
scripts, chunk 2 235 → 241) · `docs/session_236.md` (this cycle's close)
· this plan's §10/§11 · the worklog Session-193 entry · `.env.example`
re-verified (no env changes this cycle). The S183 probe evidence
(/tmp/s182-probe5.json + /tmp/s182-clone-rot.json) copied to
`docs/probe-evidence/s182/` for the next cycle's axis.

## §9 The risks (the recorded environmental posture)

- The 5-chunk cert's known flake classes (the S176 stall windows, the
  register-budget ordering) — every flake isolation-verified, the count
  never weakened.
- The dev server's stale-Turbopack reload loop after a mid-session
  restart — `bun scripts/dev-server-preflight.mjs` BEFORE any capture
  (the documented remedy: `rm -rf .next/dev` + restart).
- The reference login's rate budget (the parity probe's all-nulls race —
  the direct login diagnosis + the settled-state re-run; the standing
  recipe's preflight wait is the guard). The S182 probe family rode the
  button-enabled gate on every leg.
- The clone-probe login hydration race (the S9 lesson, re-hit once this
  session: a click before hydration no-ops) — every clone probe carries
  the button-enabled waitForFunction gate before the click.
- NEVER two :3100 listeners (one cert map at a time, kill by port
  before every chunk).

## §10 The as-executed close (filled at the cycle's end)

Executed as planned, with five root-caused unplanned legs (all
lesson-recorded in AGENTS.md's S182 block):

- **§3 landed exactly** — the header row at both sites (draft + edit:
  `flex items-center justify-between mb-4`), the draft title input on the
  shared Input with the reference's override tail (`min-w-0 flex-1
  border-0 px-0 text-xl font-bold focus-visible:ring-0 md:text-sm`), the
  NoteTitleInput's `px-0 text-xl md:text-sm` pair, the Save icon's `mr-2`
  at both sites, the ghost X at both sites (the draft's bespoke bordered
  button and the edit's outline variant both became `variant="ghost"` +
  `h-9 px-4` + `X size-4`), and the Files subtitle copy.
- **§4's honest RED was PROVEN** — all 6 EF pins failed at their designed
  markers against the pre-change standalone (EF1 the missing
  justify-between, EF2 the py 0px, EF3 the Save 90px, EF4 the X's 1px
  border, EF5 the null header row, EF6 the missing copy).
- **The unplanned legs**: (1) the EF2 pin's class-slice bug — a 200-char
  slice hid the tailwind-merge TAIL where the per-usage overrides live
  (the merged string runs ~438 chars); fixed to 500, never an assertion
  weakened. (2) The hue-tokens register's three 408-anchors tripped AS
  DESIGNED (the header-row comment block added 4 lines above the
  NoteListRow's selected-note row) — re-anchored 408 → 412 with the
  anchor-chain cause appended. (3) A `{/* */}` JSX comment between a
  component's attributes is a syntax error (TS1005) — the attribute
  position takes `//` line comments only. (4) The build's seven
  edge-instrumentation warnings verified PRE-EXISTING (the stashed
  pre-change tree reproduces all seven — the db-path→instrumentation
  import trace, untouched by the diff). (5) The below-md draft header is
  inherently cramped (the w-80 list + the shrink-0 334px action group
  crush the input below ~820px — the reference's own posture); the
  evidence frame captured at the 765px band where the 20px-bold input
  stays visible.
- **The gates**: lint ✓ · tsc ✓ · unit **1779/1779** (54 files —
  unchanged) · build ✓ · the tripwire **138/138** after the doc-chain
  lockstep · **the full 5-chunk cold cert map 684/684 — EVERY CHUNK
  FIRST ROLL, ZERO FLAKES** (chunk 1 158/158 [3.3m] · chunk 2 — the EF
  pins' home — 241/241 [6.1m] · chunk 3 101/101 [4.4m] · chunk 4 95/95
  [3.1m] · chunk 5 89/89 [1.5m]) · the drawer check GREEN (the
  123rd at the open, the 124th at the close) · the desktop parity probe
  MATCH · zero residue on BOTH accounts.
- **The evidence frames**: the four §8 frames captured self-verifying
  (`scripts/capture-s182-evidence.mjs` — the row contract + the 16px gap
  + the paddings + the Save 98/mr-2 + the X 48/borderless + the 20px
  below-md + the Files copy all asserted in-DOM before every shot; the
  frames 136-223KB).
- **The S183 probe evidence** preserved at `docs/probe-evidence/s182/`
  (nine JSON files + the README) — the measured next-axis inventory.

## §11 The final checklist (the operator's asks, mapped)

- [x] `.env` at `DATABASE_URL="file:../db/custom.db"`, `db/` at the repo
      root — re-derived this session (§0) and re-verified at the close
      (byte-identical to `.env.example`'s documented dev posture; no env
      changes this cycle).
- [x] The mobile-nav drawer check GREEN (the Tailwind v4 watch) — the
      standing tripwire (§7): the **123rd at the open, the 124th at the
      close**, no Tailwind v4 mobile-nav bug; the reference's own drawer
      measured matching through agent-browser (§1).
- [x] The vitest + playwright suites validated + extended (the EF pins) —
      §4/§7: unit 1779 (unchanged), e2e 678 → **684** (verified by
      `--list`, never estimated).
- [x] The remediation plan saved under `docs/` (this file) + validated
      against the codebase before execution (§0/§1 re-reads; every site
      read before the plan was written — §2/§3 cite the line numbers).
- [x] The dev-server screenshots under `docs/screenshots/` (§8): the
      four 182-cycle frames, self-verifying.
- [x] `.env.example` matches the codebase (re-verified — no env changes
      this cycle; §8).
- [x] The doc chain updated in lockstep (§8): README row + badge +
      testing line · AGENTS census + the S182 lessons (six) · CLAUDE
      pairs · PAD v1.3.90 · the SKILL census sites (all four) · the
      vitest header (the S182 block) · the cert runner re-tags (both
      scripts, chunk 2 235 → 241) · `docs/session_236.md` · the worklog
      Session-193 entry · the S183 probe evidence at
      `docs/probe-evidence/s182/`.
- [x] `worklog.md` updated + included in the final commit (§8).
- [x] The commit + the SSH-wrapper push to
      `git@github.com:nordeim/omni-study1.git` on `main` — the
      operator's directive, executed at the cycle's close.

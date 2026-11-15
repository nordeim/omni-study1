# The S190 remediation plan — the never-re-measured trio (Batch EN: the calculator Basic-keypad + the AI quick-action copy + the Focus Timer chrome)

The axis: a reference behavior-change cycle, discovered by the standing
audit — the fresh 20-view reference census (S190's opening probe, live
2026-11-15) found THREE surfaces where the clone carries chrome that
never matched a live re-measurement, plus one doc-rot site. The S189
close's named S190 candidate (the flashcards-family e2e consolidation)
is DEFERRED per the standing blast-radius rule: "a reference
behavior-change axis takes precedence if one appears" (the S185 close's
wording, re-affirmed every cycle since). This IS that axis.

## §0 The context and the baseline

- The workspace: the S189 close `7e599ac` + the operator's session_251
  transcript commit `34c948b`, on `main`, pulled fresh (a cold clone).
  The environment derived: `bun install` (510 pkgs), `.env` created from
  `.env.example` at `DATABASE_URL="file:../db/custom.db"` with `db/` at
  the repo root, `bun run db:push` + `db:seed` (the demo account), the
  pinned chromium **v1243** installed (`bunx playwright install
  chromium` — the cache held only the stale v1200 from another project).
- The cold baseline reproduced the S189 close EXACTLY: lint ✓ · tsc ✓ ·
  unit **1799/1799 (55 files)** · build ✓.
- The standing chrome at the open: the drawer check GREEN (**the 139th
  consecutive** — no Tailwind v4 mobile-nav bug; backdrop
  `oklab(0 0 0 / 0.2)` + blur(4px), 288px panel, 20 links, no footer,
  Escape + navigate auto-close, appbar z-40 fixed) · the desktop parity
  probe **MATCH** (all five structural checks, both hosts: sidebar 260,
  20 links, the first-five links, mainX 260, mainWidth 1180) · the
  s116 reference resweep **ok:true, 9/9 invariants both hosts, the
  brand truth tables matched, probeCleanup ok** (zero residue — the
  standing account untouched).
- The axis discovery: the fresh **20-view reference census** (all 20
  views, headings/buttons/tabs fingerprints, both hosts) flagged 16
  raw deltas; the adjudication pass reduced them to THREE real gap
  families (the rest were the reference account's zero-data empty-state
  CTAs vs the seeded clone — the S123 lesson-3 data-shaped doctrine —
  plus hidden mobile-only DOM). Five follow-up precision probes
  (scripts under `/home/z/my-project/scripts/`, run against the live
  reference + the clone standalone on :3200) measured every token in
  §3. The reference captures for the record:
  `/home/z/my-project/download/ref-captures-s190/` (basic, scientific,
  focus timer, AI assistant).
- **The mode protocol record (S188/§6.3 clause (a)): every probe this
  cycle rode the reference in LIGHT mode** — the account's standing
  state changed from the S188-era dark (the owner's doing; the theme
  is never toggled by a probe). Verified by the capture backgrounds +
  the computed whites (rgb(255,255,255) digit keys, the white focus
  panel). Consequence: the port's light tokens are direct
  measurements (the ground truth); the DARK re-anchors ride the
  clone's own re-theme doctrine (the AG2/History literal family + the
  house pairs) — the reference's dark calculator cannot be measured
  without toggling the theme (forbidden, zero residue).

## §1 The record (why these three surfaces are the debt)

1. **The calculator Basic keypad** — the session-2 audit's E2 finding
   ("keypad anatomy wrong… keypad rework: no `%`, AC `col-span-2`") is
   the LAST live measurement of this surface in the doc chain; the s72
   reference capture (`docs/screenshots/72-ref-populated-calculator.png`)
   already shows the CLEAR+backspace top row, and today's live probe
   confirms it unchanged: **the reference's Basic keypad is
   `Clear(span-2) + backspace-icon(span-2)` on row 1, a 4×4 digit/op
   grid below, dark slate-800 operators, a 6px radius family — 18
   keys.** The clone ships a 6-row, 21-key pad (`AC | ± | ÷` … `0 . ( )`
   + `⌫ | ^ | =`), violet-soft operators, 12px radii, a red-pill AC.
   The `±`/`^`/`(`/`)` keys the reference carries live on its
   SCIENTIFIC tab (`xʸ`, `(`, `)`, `%` measured there); the clone put
   them on Basic. The session-2 fix itself was likely measured against
   a since-changed reference state — either way, **clone ≠ reference
   today on a surface no cycle has re-measured in 188 sessions.**
2. **The AI quick actions** — the original recon dossier
   (`docs/worked-example-academiaflow.md` §3) records the reference's
   six prompts as "Explain Concept, Study Tips, **Summarize**, Solve
   Problem, **Translate, Essay Ideas**"; the live probe measures the
   same today (mode cards 331×102, six cards). The clone shipped
   "**Summarize Notes**" and swaps the tail order (Essay Ideas before
   Translate). A transcription-era drift, never re-verified.
3. **The Focus Timer chrome** — the S5-E port measured the stats row,
   the 256px ring, the 48px time, the 64px play; the S174/DX port
   measured the stats value shape + the sound/settings presence. But
   the timer PANEL, the mode row, the preset cards, the ring interior,
   the subject select, and the control row were never measured: the
   live reference carries a white `rounded-3xl` panel card on a
   `max-w-2xl` column, freestanding 36px mode pills (gradient active),
   64px tinted two-line preset cards (name/durations — the clone's
   typography is INVERTED), a `lucide-brain` icon + `font-mono` clock
   inside the ring, a compact 192px subject select with the "Select
   subject" placeholder, and 48px near-black round reset/complete
   controls flanking the play. The clone ships a container-less
   `max-w-md` column, a slate-100 mode group, 32px bordered presets,
   no ring icon, a full-width select with no placeholder state, and
   ghost-sized controls in the wrong order.
4. **The doc-rot rider** — `scripts/run-cert-chunk.sh`'s header
   Expected line still reads the S185-era `705` (four re-tags stale);
   the tripwire pins only the CHUNKS identity and the cert script's own
   Expected line (the S189 lesson-5 class: an unpinned count-claim site
   is doc rot even when the tripwire is green).

## §2 The gap table

| # | Surface | Current (pre-change) | Post-change (the measured reference) | Class |
|---|---|---|---|---|
| G1 | Calc Basic keypad | 21 keys / 6 rows; AC red pill; ± ^ ( ) on Basic; violet-soft ops; radius 12px; = span-2 bottom row | 18 keys / 5 rows; `Clear`(span-2, near-black bg rgb(10,10,10), red-600 label+icon, fs14, border rgb(38,38,38)) + icon-only backspace(span-2, near-black, white 16px icon, aria "Backspace") on row 1; 4×4 grid (7 8 9 ÷ / 4 5 6 × / 1 2 3 - / 0 . = +); ops slate-800 bg rgb(30,41,59) white text fw600; digits white/slate-200-border/slate-800 fw600; `=` single cell gradient radius 6px; the whole key family radius **6px** | measured parity port |
| G2 | Calc Scientific keypad | extras = sin cos tan ln log √ x² π e ! | the reference's 11 (sin cos tan π √ x² **xʸ** log **(** **)** **%** e) in measured order, plus the documented supersets ln, ! | measured parity port (+2 superset keys) |
| G3 | AI quick actions | "Summarize Notes"; order …, Essay Ideas, Translate | "Summarize"; order Explain Concept, Study Tips, Summarize, Solve Problem, Translate, Essay Ideas | copy/order port |
| G4 | Focus Timer chrome | max-w-md column; no panel; slate-100 mode group (46px buttons); 32px bordered presets (inverted typography); ring = time+label only; full-width select, no placeholder; ghost controls, play first | max-w-2xl column; `bg-white rounded-3xl p-8 shadow-xl border border-slate-100` panel (mode row `flex justify-center gap-2 mb-8` INSIDE); 36px mode pills pad 8/16 radius 12 (active sf-gradient+white, inactive transparent slate-600, icon-first); 64px preset cards pad 12/24 radius 12 (active violet-100 rgb(237,233,254) + violet-700 rgb(109,40,217); inactive slate-100 rgb(241,245,249) + slate-600; inner `p.font-semibold` name + `p.text-xs.opacity-70` durations; NO border); ring interior = `lucide-brain` w-8 h-8 mb-2 text-violet-500 + text-5xl font-bold **font-mono** + `text-sm text-slate-500 mt-2 capitalize` label; h1 icon size-7 → **size-8**; select compact (~192px class-w-auto) with the "Select subject" placeholder at no-selection ("No subject" stays an option); controls row = 48px near-black round Reset + 64px gradient play + 48px near-black round Complete (RotateCcw / Check icons white); sound/settings 40×40 radius-6px near-black | measured parity port |
| G5 | run-cert-chunk.sh header | "Expected (S185/EI re-tag): … = 705" | re-anchored to the live census (the S190 re-tag) | doc-rot fix |

## §3 The port design (the measured token tables)

### §3.1 The calculator

**BASIC_KEYS (post-port, 16 keys):** `7 8 9 ÷ / 4 5 6 × / 1 2 3 - / 0 . = +`
rendered `grid-cols-4 gap-2`; the `=` key is its own gradient button
(single cell, `sf-gradient`, radius 6px); row 1 is TWO separate
elements above the grid (same `grid grid-cols-4 gap-2` container):
- `Clear`: `col-span-2`, near-black `bg-[#0a0a0a]` + `border-[#262626]`,
  label "Clear" fs14 fw500 + the RotateCcw icon 16px, BOTH the label and
  the icon red-600 `rgb(220,38,38)`, aria-label "Clear" (visible text ==
  accessible name — the S8/F axe rule).
- backspace: `col-span-2`, near-black `bg-[#0a0a0a]` + `border-[#262626]`,
  ICON-ONLY (Delete icon, 16px, white `rgb(250,250,250)`), aria-label
  "Backspace" (an icon-only control keeps its label).
- ALL calculator keys: `rounded-md` (6px) — the radius family moves
  12px → 6px (basic + scientific + the row-1 pair).
- digits: `border border-slate-200 bg-white text-lg font-semibold
  text-slate-800` (fw 500→600).
- operators (÷ × - +): `bg-slate-800 text-white font-semibold`, no
  border (replaces `bg-sf-primary-soft text-sf-primary-strong`).
- the sf-pill-red usage DROPS from calculator-view (the hue-tokens
  CONSUMERS register entry updates in the same commit — the utility
  itself stays; flashcards/dashboard/exams still ride it).
- **The dark re-theme (the clone's doctrine — the reference's dark
  calculator stays unmeasurable, §0):** Clear/backspace keep the
  near-black literal in BOTH modes (`bg-[#0a0a0a]` — the AG2/History
  measured family) with `dark:border-[#404040]`; the Clear label
  `text-red-600 dark:text-red-400`; operators
  `bg-slate-800 dark:bg-slate-700`; digits keep the standing
  white/slate-900 pair. The AG3 pin (the old red-950/red-300 AC pill)
  and the AH4a pin (the old footer backspace slate pair) re-anchor to
  these families in the same commit.

**SCIENTIFIC_EXTRA (post-port, 13 keys):** the reference's measured
order `sin cos tan π √ x² xʸ log ( ) % e` + the documented supersets
`ln`, `!` appended (grid-cols-4 per the measured 113.5px×4 columns —
the clone's current grid-cols-5 becomes grid-cols-4). The `^`-token key
renders as `xʸ`. The scientific tab keeps the clone's existing
clear/backspace/equals furniture (a documented superset — the reference's
scientific lacks any clear key, a reference defect the clone does not
replicate; recorded in §6).

**What leaves Basic:** `±` (no reference home — the engine keeps unary
minus; the physical-keyboard superset is unaffected), `^` (becomes `xʸ`
on scientific), `(` `)` (scientific), the bottom `⌫ ^ =` row (backspace
moves to row 1; `=` joins the main grid).

### §3.2 The AI quick actions

`QUICK_ACTIONS` retitled + reordered to the measured set: Explain
Concept, Study Tips, **Summarize** (FileText), Solve Problem,
**Translate** (Languages), **Essay Ideas** (Lightbulb). The prompts
keep their current text (data-shaped, not chrome).

### §3.3 The Focus Timer

The `max-w-md` column becomes `max-w-2xl` (672px measured); the mode
row + presets + ring + subject + controls wrap in the measured panel
`bg-white rounded-3xl p-8 shadow-xl border border-slate-100` (with the
dark-mode equivalents the theme system already carries for white
cards); the stats row + header stay OUTSIDE the panel (both hosts).
- Mode row: `flex justify-center gap-2 mb-8` inside the panel; buttons
  `px-4 py-2 text-sm font-medium rounded-xl` h-9, icon FIRST then label,
  active `sf-gradient text-white`, inactive `text-slate-600` transparent;
  the slate-100 group container and the `role="group"` chrome retire
  (the aria-label moves to the row's div for the forced-colors scope).
- Presets: plain buttons (no Button/outline chrome), `rounded-xl px-6
  py-3` (12/24) min-h-16 (64px), active `bg-violet-100
  text-violet-700` dark `dark:bg-sf-primary-soft-dark/40
  dark:text-sf-primary-strong-dark`, inactive `bg-slate-100
  text-slate-600 dark:bg-slate-800 dark:text-slate-300`; inner two
  stacked lines: name `font-semibold` (order SWAPPED — name first) +
  durations `text-xs opacity-70`.
- Ring interior: `Brain` icon `size-8 mb-2 text-sf-primary` (accent-aware
  via the standing token doctrine; the reference's violet-500 is violet
  at default accent) + the clock `text-5xl font-bold font-mono` (drops
  tabular-nums for font-mono — mono subsumes it) + the label
  `capitalize`.
- h1 icon: `size-7` → `size-8` (32px measured).
- Subject select: the `w-full` trigger becomes the compact measured
  shape (~192px — `w-auto min-w-48`), the placeholder becomes "Select
  subject", and the no-selection state becomes the DEFAULT (value
  `undefined` → placeholder; "No subject" remains the first option
  mapping to `none`; a started session without a choice saves
  subjectless exactly as today's "none").
- Controls: order Reset (48px near-black round, RotateCcw white) →
  play (64px gradient, unchanged) → Complete (48px near-black round,
  Check white); the near-black family `bg-[#0a0a0a]
  dark:bg-[#262626]` (the History-toggle precedent's exact tokens);
  sound/settings buttons restyle to 40px `rounded-md bg-[#0a0a0a]
  text-white` (keeping the aria superset).

### §3.4 The doc-rot rider

`scripts/run-cert-chunk.sh` line 7 re-anchors to the live census with
the S190 re-tag note (the historical blocks beneath stay — §6.6).

## §4 The TDD plan (RED → GREEN → re-anchor)

1. **The RED pins** (written FIRST, run RED against the un-ported
   tree, every pin citing its measured source):
   - `tests/e2e/calculator.spec.ts` — a new `S190 · the measured
     Basic-keypad anatomy` describe: EN1 the Clear key (label/span/bg/
     red tokens/radius/fs14/aria), EN2 the backspace key (row-1
     span-2, icon-only, near-black, aria), EN3 the operator family
     (slate-800 bg, white text, 4 ops), EN4 the digit family
     (white/slate-200/slate-800 fw600/radius 6px), EN5 the Equals
     (single-cell width ≈ digit width, gradient, radius 6px), EN6 the
     tab census (Basic = 18 keys, no ±/^/(/) text; Scientific renders
     xʸ, (, ), %). +6 pins.
   - `tests/e2e/parity-session8.spec.ts` — the S8-M pin re-anchors
     (`hasText: "Summarize"` becomes exact — the retitle makes it
     precise) + a new EN7 order pin (the six titles in the measured
     order). +1 pin.
   - `tests/e2e/parity-session5.spec.ts` — a new `S190 · the Focus
     Timer chrome port` describe: EN8 the panel + column (rounded-3xl
     white panel present; the column ≥ 672px), EN9 the mode row (36px
     buttons, pad 8/16, no group bg, gradient active), EN10 the preset
     cards (64px, pad 12/24, the violet-100/violet-700 active pair,
     the inverted two-line typography), EN11 the ring interior (the
     brain icon + font-mono + capitalize label), EN12 the select +
     controls (the "Select subject" placeholder, the compact width,
     the 48px near-black reset/complete flanking the 64px play). +5
     pins.
   - Census projection: 723 + 12 = **735** — chunk 1 158→159 (S8-M
     re-anchor is count-neutral), chunk 3 103→108, chunk 4 95→101;
     chunks 2/5 unchanged. Verified by `--list`, never estimated.
2. **The GREEN implementation** — §3's three ports, each behind its
   RED pins.
3. **The re-anchors** — the pins that measured the OLD anatomy update
   in the same commit: calculator.spec's Clear-role locator (the
   "Clear: AC" aria retires), the S5-E two-line preset observation
   (the durations text stays; the typography check inverts), any
   hue-tokens CONSUMERS entry, the s112 capture script's historical
   comment stays (§6.6), the mobile/a11y sweeps' focus-timer locators
   if they trip.
4. **The gates** — lint · tsc · unit 1799/1799 (unchanged — a
   view-layer port, no new seam) · build · the chunk certs: chunks 1,
   3, 4 cold (the changed chunks) + chunks 2, 5 (the unchanged
   composition proof) = the full 5-chunk map 735/735.

## §5 The execution order (the TODO list)

1. [x] The environment + the cold baseline + the standing chrome (the
   drawer check 139th, the parity probe MATCH, the s116 resweep 9/9,
   the fresh 20-view census + the five precision probes).
2. [x] This plan.
3. [x] **The RED pins** — the 12 new e2e pins, run RED (every pin
   fails against the un-ported tree — the honest-RED proof, captured).
4. [x] **The calculator port** (§3.1) — GREEN (the port expanded in
   flight to the measured max-w-md display CARD + the tab-strip family
   — the EN4/EN5 width pins exposed the full-width-keypad drift the
   old relative pins had masked; measured, then ported).
5. [x] **The AI quick-action port** (§3.2) — GREEN.
6. [x] **The Focus Timer port** (§3.3) — GREEN (the active preset's
   measured violet-100/700 pair mapped to the STANDING
   sf-primary-empty/sf-primary-deep tokens + the new @theme mapping
   for --color-sf-primary-deep).
7. [x] **The re-anchor sweep** — AH4b + S5-H ×2 + AG3 + AH4a + the
   hue-tokens register + the run-cert-chunk.sh header (§3.4).
8. [x] **The gates** — lint ✓ · tsc ✓ · unit 1799/1799 · build ✓ · the
   5-chunk cold cert map **735/735** (159+275+108+101+92).
9. [x] **The evidence** — the two self-verifying frames under
   `docs/screenshots/` (DOM-asserted before the shot, pixel-verified
   non-blank).
10. [x] **The doc-chain lockstep** — AGENTS (the census lines + the
    S190 lessons block, five lessons), CLAUDE, README (the badge
    2522 → 2534, the testing lines, the tree diagram, the Key Features
    rows, the Session-190 row), SKILL (the census sites), the vitest
    header (the S190 re-anchor — unit unchanged), the PAD **v1.3.98**,
    the cert script re-tag + the paired runner header + the tripwire
    comment chain, this plan's §9 close-out, the worklog Session-201
    entry, `docs/session_252.md`.
11. [ ] **The commit + the SSH-wrapper push** (the operator's standing
    sequence).

## §6 The adjudications (the open questions, resolved)

1. **§6.1 The ± key leaves the UI entirely.** The reference has no ±
   key on any tab (measured both); the engine's unary minus (and the
   physical-keyboard `-`) covers the function. Parity wins; the
   capability is the engine seam (unit-pinned already), not a key.
2. **§6.2 ln and ! stay on Scientific as documented supersets.** The
   reference's scientific carries 11 fn keys; the clone's ln and !
   are real functions the engine supports. They append AFTER the
   measured 11 (order preserved for the reference set). The deviation
   is recorded here + in the PAD's Known Issues.
3. **§6.3 The clone's scientific keeps clear/backspace/equals.** The
   reference's scientific tab has NO clear key (measured — 28 keys,
   no Clear/backspace): a reference defect (an unclearable
   calculator). The clone keeps its furniture; documented superset.
4. **§6.4 The carousel dots are NOT ported.** The reference renders 4
   slate-200 12px dots under the timer; clicking them (probed live)
   changes NOTHING — non-functional decoration. The clone does not
   ship dead chrome; the deviation is recorded in the PAD's Known
   Issues (the reference's own dead UI).
5. **§6.5 The select's no-selection default is a behavior change,
   deliberately taken.** The reference's combobox sits at its
   "Select subject" placeholder until the user picks; "No subject" is
   an option. The clone's default was the literal "No subject" value.
   Post-port the placeholder is the default and a choiceless session
   saves subjectless — the same persistence outcome, the reference's
   interaction shape.
6. **§6.6 The historical records stay.** The s112 capture script's
   "Summarize Notes" comment, the S5-E pin's original wording in git
   history, and the old plan text record their era; only LIVE
   count-keepers and the touched pins re-anchor (the S189/§6.6
   doctrine).
7. **§6.7 The near-black control family uses the History-toggle
   precedent's literal tokens** (`bg-[#0a0a0a]` + `dark:bg-[#262626]`)
   — the same measured near-black the calculator's Clear key and the
   S80/AG2 History toggle carry; no new token family is invented (the
   measured rgb(10,10,10) is NOT slate-900 = rgb(15,23,42) — the
   literal is the honest port).
8. **§6.8 The reference's own WCAG-contrast fails are not replicated on
   TEXT faces.** Two measured reference patterns fail axe color-contrast
   (the a11y-sweep's zero-violation Lighthouse-set pin is a repo-level
   contract): the inactive calculator tab's neutral-400 (~2.2:1 — the
   clone ships the slate-600 a11y stand-in) and the Clear key's
   red-600-on-near-black (4.10:1 — one step to red-500 = 5.27:1, the
   Family F precedent).
9. **§6.9 The preset durations line drops the measured `opacity-70`.**
   The reference's `text-xs opacity-70` durations measure ~2.9:1 on the
   tinted preset cards (axe serious — caught live by the chunk-2 cert's
   a11y-sweep on /FocusTimer). The text-xs hierarchy carries the
   secondary-line role alone; the opacity is the reference's own AA
   fail, not ported (the §6.8 class, recorded separately because it was
   found by the cert rather than the pre-port audit).

## §7 The re-anchor risk register

- `src/components/views/calculator-view.tsx` — the keys, the grid, the
  two row-1 elements, the radius family, the scientific extras.
- `src/components/views/aiassistant-view.tsx` — QUICK_ACTIONS.
- `src/components/views/focustimer-view.tsx` — the column, the panel,
  the mode row, the presets, the ring interior, the select, the
  controls, the h1 icon.
- `tests/e2e/calculator.spec.ts` — +6 pins; the Clear-role locator
  re-anchor ("Clear: AC" → "Clear").
- `tests/e2e/parity-session8.spec.ts` — the S8-M re-anchor +1.
- `tests/e2e/parity-session5.spec.ts` — +5 pins; the S5-E preset
  observation stays (the texts persist).
- `tests/hue-tokens.test.ts` — the calculator-view CONSUMERS entry
  (sf-pill-red drops from the file's consumer set).
- `tests/e2e/dark-mode.spec.ts` — the AG3 pin re-anchors to the
  near-black + red-400 Clear family; the AH4a pin re-anchors to the
  row-1 icon-only backspace's dark family (count-neutral).
- `scripts/e2e-chunked-cert.sh` + `scripts/run-cert-chunk.sh` — the
  Expected line 723 → 735 + the S190 re-tag blocks (CHUNKS unchanged —
  no new spec files).
- `tests/script-conventions.test.ts` — the tripwire Expected string +
  the comment chain.
- The census sites — AGENTS.md:13/169 (the test:e2e line), the README
  badge + testing + tree + session table, CLAUDE.md's census line, the
  SKILL census sites, the vitest header (unit unchanged at 1799/55),
  the PAD v1.3.97 → v1.3.98.
- The e2e neighbor risk: the focus-timer pins live in parity-session5
  (chunk 3) — the theme-spec's accent-restore contract and the
  shared-userrecord posture are untouched (the port changes no API
  surface); the mobile sweeps' drawer navigation is untouched (the
  focus view's mobile layout keeps the no-overflow contract — verified
  in the chunk certs).

## §8 The verification ledger (what proves this cycle)

- The RED proof: the 12 new pins failing against the un-ported tree.
- The GREEN proof: the same 12 passing against the ported tree.
- The re-anchor proofs: the touched pins passing, the hue-tokens
  census green, the tripwire green.
- The gates: lint ✓ · tsc ✓ · unit 1799/1799 ✓ · build ✓.
- The 5-chunk cold cert map: **735/735** (159+275+108+101+92).
- The evidence frames: the two self-verifying screenshots
  (pixel-probe non-blank, DOM-asserted pre-shot).
- The residue discipline: the reference account untouched (read-only
  navigation + login; zero rows created or deleted — the resweep's
  probeCleanup proof + the census's read-only posture).

## §9 The close-out (as executed)

- The §5 order ran in sequence: the baseline + chrome + census + probes
  → the plan → the 12-pin honest RED (every pin failing at its marker
  against the un-ported tree) → the three ports (each GREEN) → the
  re-anchor sweep → the gates → the 5-chunk cold cert map **735/735**
  (159+275+108+101+92, `cert-s190.log`) → the evidence frames → the
  closing chrome (the drawer check GREEN — the 140th; the parity probe
  MATCH) → the commit + the SSH-wrapper push.
- **The in-flight expansion**: the EN4/EN5 width pins exposed that the
  calculator's FULL-WIDTH keypad was itself drift (the old pins were
  all RELATIVE — col-span ratios — masking the 1116px-vs-448px column
  difference); the port expanded to the measured max-w-md display card
  + the slate-50 keypad area + the tab-strip family (bg-white bordered
  container, the near-black active face), all measured before porting
  (the reference's display-card chain probed: the gradient container,
  the card, the max-w-md column, the tablist, the GPA tab's full-width
  panel).
- **The live catches**: (1) the hue-tokens INLINE-HEX guard caught raw
  rgb() values in a first-cut COMMENT (fixed to color names — the
  guard sweeps comments too); (2) the unmapped `text-sf-primary-deep`
  utility silently dropped by Tailwind v4 (the class existed in the
  markup, the token mapping didn't — caught by the RED pin reading the
  inherited color, fixed by the @theme mapping); (3) the CF6/CQ6
  cross-read family caught four un-updated doc census sites live
  mid-lockstep (AGENTS prose, CLAUDE prose ×2, the SKILL sites);
  (4) the EN6 census's first cut double-filtered the icon-only
  backspace (`.filter(Boolean)` removed the empty-text key — the
  17-vs-18 correction); (5) **the chunk-2 cert's a11y-sweep caught the
  preset durations' measured `opacity-70`** (the reference's own
  ~2.9:1 AA fail on /FocusTimer — the fix dropped the opacity, kept the
  text-xs hierarchy, recorded as §6.9; chunk 2 re-certified cold
  275/275, the full map 735/735).
- **The axe adjudications held as designed**: the Clear label ships
  red-500 (the measured red-600's 4.10:1 fails the zero-violation
  a11y-sweep pin; red-500 = 5.27:1 — the Family F one-step precedent,
  documented in the pin); the inactive tab text stays slate-600 (the
  reference's neutral-400 = 2.2:1); the dots skipped; the scientific
  keeps its clear furniture (§6.3).
- **The census**: 1799 unit / 55 files UNCHANGED; the e2e 723 → 735
  (159+275+108+101+92; 730 chromium in the same 31 spec files, 731 by
  `--list`); the badge 2534. Every count verified by `--list`, never
  estimated.

# The S199 remediation plan — the Events + FocusTimer two-family view-home e2e consolidation (Batch EW: the S198 close's named next candidate, the size-debt adjudication of the remaining coverage-axis files)

The axis: the fresh **20-view reference census** (the standing S192 instrument
`scripts/ref-census-s192.mjs`) flagged **112 raw deltas (17 auto-classed
data-shaped + the identical 95 requiring adjudication)** — the identical count
and item set the S193–S198 cycles adjudicated — and every one adjudicates to a
standing non-gap class (the ledger in §1). The reference is UNCHANGED since the
S198 close — **the ninth consecutive clean window**. Per the S198 close's named
next candidates and the S189–S198 size-debt doctrine, this cycle executes the
**Events + FocusTimer two-family view-home e2e consolidation** out of
`parity-session5.spec.ts`: the Events view family (S5-B the dark terminal
panel + S5-U1 the day-focus carousel) and the FocusTimer view family (S5-E the
layout + S190 the chrome port) split byte-faithfully into TWO dedicated VIEW
homes — **`tests/e2e/events.spec.ts`** (the 11th view home) and
**`tests/e2e/focustimer.spec.ts`** (the 12th view home) — the S195
(analytics + gradetracker) / S196 (studygroups + practicetests) multi-family
shape, third application. A pure test-organization refactor with ZERO
application behavior change.

## §0 The context and the baseline

- The workspace: the S198 close `ad29a0f` + the operator's session_269
  transcript commit `29d6d66` on `main`, pulled fresh (a COLD clone — the
  environment re-derived per the standing recipe: bun install 510 pkgs,
  `.env` at `DATABASE_URL="file:../db/custom.db"` with `db/` at the repo
  root, db:push + db:seed, the pinned chromium v1243 re-provisioned, the
  dev daemon :3000 + the standalone :3200 launched via the reaper-proof
  launchers; both `/api/health` green at the open).
- The cold baseline reproduced the S198 close EXACTLY: lint ✓ · tsc ✓ ·
  unit **1799/1799 (55 files)** ✓.
- The standing chrome at the open: the drawer check GREEN (**the 157th
  consecutive** — no Tailwind v4 mobile-nav bug; the mobile navigation menu
  verified working: backdrop `oklab(0 0 0 / 0.2)` + blur(4px), 288px white
  panel, 20 links, no footer, Escape + navigate auto-close) · the desktop
  parity probe **MATCH** (all five structural checks, both hosts — the
  reference account probed read-only with the operator's credentials via
  the REF_PROBE_* env posture) · the reference account persists in DARK
  mode (`REF-DARK` via agent-browser — the documented S188+ protocol
  record, re-confirmed live this cycle).
- The agent-browser interactive sweep (the operator's standing watch, run
  this cycle on BOTH hosts, sessions `s199-clone` + `s199-ref`): the clone
  login → dashboard render (the sidebar's 20 links, the greeting, the stat
  cards, the section cards) · the mobile journey (the 390×844 viewport:
  the labeled hamburger `Open navigation menu` → the drawer's 20 links →
  the Tasks link navigates to `/Tasks` and the drawer AUTO-CLOSES,
  verified `DRAWER-CLOSED` by DOM probe) · the Create Task dialog anatomy
  + a full UI CRUD round-trip (create → the row renders → the row menu
  delete → `ZERO-RESIDUE` by DOM text probe) · the reference login + a
  read-only navigation sweep (Tasks/Calendar/Events/Notes/Analytics all
  render, zero console errors) · the reference mobile drawer (288px
  panel, 20 links — the clone's exact match) — **zero console errors,
  zero findings** on both hosts; the four comparison frames captured
  (`199-abrowser-ref-mobile-drawer.png` + `199-abrowser-ref-dashboard.png`
  + `199-abrowser-clone-mobile-drawer.png` +
  `199-abrowser-clone-dashboard.png`, all pixel-verified non-blank).
- The environment contract re-verified against the operator's standing
  instructions: `.env` at `DATABASE_URL="file:../db/custom.db"` with `db/`
  at the repo root (the seeded `db/custom.db` present) · the vitest +
  playwright configs present and green (1799 unit + 744 e2e — the suites
  the operator asked to "add" are present, green, and this cycle extends
  the e2e organization) · `.env.example` matching the env surface (no env
  changes this cycle).

## §1 The census and the adjudication ledger (what was measured, what it adjudicated to)

The fresh 20-view census (both hosts, the reference account read-only —
login + navigation only, zero rows created or deleted) flagged 112 raw
deltas; 17 auto-classed data-shaped, 95 requiring the standing adjudication
(the identical count and item set the S193–S198 cycles closed). Every class
adjudicates to a STANDING non-gap record:

1. **The data-shaped families** (the reference account's zero-data
   empty-state CTAs vs the seeded clone — dashboard/myday/tasks/timetable/
   assignments/exams/notes/flashcards/practicetests/studygroups/
   gradetracker/analytics/focustimer rows and counts). The closing half (the
   S191 lesson-2 code check) re-verified this cycle by grep: the clone
   CARRIES each flagged CTA in its zero-data path (`myday-view.tsx:226`
   "Add Your First Task", `tasks-view.tsx:738` "No tasks yet",
   `assignments-view.tsx:337` "No assignments yet", `exams-view.tsx:327`
   "No exams found", `flashcards-view.tsx:552/717`, `notes-view.tsx:1315`).
2. **The computed-identical tag differences** (Tasks "My Lists" p-vs-h3, the
   Settings Appearance h2-vs-div — the S192 adjudications, unchanged).
3. **The AI view's heads-delta** (the reference's real h3 quick-action
   titles + hero vs the clone's span role=heading stand-ins) — the S192
   axe-clean superset adjudication, computed-identical, pinned by EP2/EP4
   (verified present at `parity-session5.spec.ts:1160/1205`).
4. **The Files "Upload" affordance** — the S183 outline port (the S192
   dark-mode-artifact adjudication).
5. **The MathSolver solution card** — the S14 aria-live superset (pinned).
6. **The dashboard 6-vs-4 grid-div count** in the rough structural probe —
   the S192-counted artifact (the probe counts ALL grid children, not stat
   cards; the deeper S192 probe measured 4 stat cards on both hosts).

**REAL GAPS: NONE.** The reference is unchanged since the S198 close — the
consolidation window is clean (the ninth consecutive clean window; the
reference account remains zero-data, so the AI audit-rider candidates — the
message-bubble anatomy — stay unmeasurable).

## §2 The axis (why Events + FocusTimer out of parity-session5, why now)

- The S198 close's named next candidates, in order: a reference
  behavior-change axis (NOT found — the census is clean, ninth window);
  the AI audit-rider message-bubble anatomy (still unmeasurable — the
  reference account is zero-data); or the next size-debt adjudication —
  the remaining multi-describe coverage-axis files (parity-session5 /
  parity-session6 / parity-session8 / parity-session9) IF a future cycle
  re-adjudicates their axes. This cycle takes the size-debt candidate and
  re-adjudicates.
- **The re-adjudication**: parity-session8 is the LARGER file (1,938 lines
  vs 1,347) but its families are FRAGMENTED — 33 describes, most 1 pin,
  spanning ~20 views; its largest coherent single-family group (S8-C
  Calendar, 6 pins) is half the Events family's size, and the S8-AC S76
  anatomy trio is a MEASUREMENT-BATCH grouping across three views
  (assignments/exams/tasks), not a view or UI-pattern axis — the size-debt
  ranking is not the axis ranking (the S194 lesson-3). parity-session5
  carries the two LARGEST remaining PURE view families:
  - **Events** (11 pins / 216 lines): S5-B the dark terminal panel (7
    pins — the slate-900 panel, the EVENTS label, the big date, the cyan
    New Event row, the dialog anatomy [opened + Escape-closed, never
    submitted], the day-section labels) + S5-U1 the day-focus carousel
    (4 pins — the ‹ ○ › ∨ controls with the a11y-superset names, the
    big-date/weekday/CW tracking, the re-anchoring 7-day list, the
    one-line "Oct 2026 CW 43" header). The two describes are CONTIGUOUS
    in the source (lines 51–266) — the family is one region.
  - **FocusTimer** (6 pins / 185 lines): S5-E the layout (1 pin — the 3
    stat cards, the 256px ring, the 48px mono time, the 64px gradient
    play button, the two-line presets) + S190 the chrome port (5 pins —
    the white rounded-3xl panel, the mode row, the preset cards, the
    ring interior, the subject select, the control row — the
    never-measured half first measured 2026-11-15).
- Both are VIEW families → VIEW homes (the S189 notes / S191 flashcards /
  S193 timetable / S194 files / S195 analytics + gradetracker / S196
  studygroups + practicetests precedent shape) — events.spec.ts the 11th
  view home, focustimer.spec.ts the 12th (16 homes total counting the
  four axis homes: dialogs, emptystates, filterrows, viewheaders).
- The boundary adjudications (the S189–S198 doctrine):
  - **The S162/DK1 events CB8 failure-domain split (parity-session5:953)
    STAYS** — a hardening coverage leg (the failed-refresh failure-domain
    family, deliberately distributed DK/DL/DM/DN/DP/DQ across the parity
    files), not chrome.
  - **The S123/BX6 + S127/CB1 FocusTimer duration-recording pins
    (parity-session5:873/909) STAY** — write-behavior hardening legs
    (they complete focus sessions and assert the recorded duration
    semantics), not chrome; moving them would carry write units and
    re-open the budget arithmetic for no organization gain.
  - **The S192 mixed describe (AI-chrome + calendar-day-header) STAYS**
    (the mixed-axis doctrine), as do the S5-AB populated-surface drift
    layer (coverage axis) and every other mixed/coverage describe.
  - **The strays outside the split source STAY** (the file-boundary
    doctrine, S197 lesson-1): the S8-N focustimer complete-button leg
    (parity-session8), the S9-L FocusTimer icons leg
    (parity-session9), the DZ1 events create-dialog (the dialogs axis
    home), and the OTHER S190-batch describes — calculator.spec.ts's
    Basic-keypad port and parity-session8's AI quick-action order port —
    a pin's BATCH TAG is not its family when the pin already has a home
    or a different binding axis (the S198 lesson-4; Batch EN was a
    three-family port cycle: each leg stays with ITS family).
- The stale-mention walk: the mentions found are historical narrative or
  different families — `parity-session7.spec.ts:313` names
  calculator.spec.ts's S190 describe (a different family); the
  `tests/validation.test.ts:258` S5-B2 mention is a measurement
  provenance, not a file location; `scripts/capture-s190-evidence.mjs`
  is the S190 cycle's historical capture script. The source file's OWN
  founding header (parity-session5.spec.ts:8, "the Events dark panel
  (S5-B)") gets the ledger re-anchor in this split.

## §3 The characterization contract (the Mode-D discipline — no honest-RED shape exists for a refactor)

1. **The pre-split baseline**: `parity-session5.spec.ts` cold-green at
   **60 pins** (verified by `--list`, never estimated — the S189 lesson 2;
   the `--list` census reads 61 tests = 60 pins + the setup test).
2. **The byte-faithfulness machine checks** (the S189–S198 doctrine): (a)
   each moved block byte-identical to its source range INCLUDING its
   leading comment run (S5-B carries NO leading run — line 51 is the
   describe; S5-U1's dashes run 200–211; S5-E carries NO leading run —
   line 303 is the describe; S190's dashes run 977–983); (b) the title
   multiset (the moved pins' titles exactly the pre-split members); (c)
   the describe/pin arithmetic: 4 moved + 19 staying = 23 describes
   before; 17 moved + 43 staying = 60 pins before; (d) the helper census
   (`hydrated` 13 call sites move — S5-B 7, S5-U1 4, S5-E 1, S190 1 [the
   beforeEach]; the staying file keeps 37 — no orphan on either side;
   the `rgb(` matches inside the moved blocks are STRING-LITERAL false
   positives — `expect(...).toBe("rgb(15, 23, 42)")` — the S193 lesson-4
   subtraction, verified this cycle: zero helper-position call sites,
   parity-session5 defines NO local rgb helper); (e) the blank-run
   accounting against the original's inventory with the EMPIRICALLY
   MEASURED shift (the S198 lesson-3 — never a hand-computed constant);
   (f) the no-internal-terminator header check (the S197 lesson-2 — the
   new homes' header comments narrate without any `*/` sequence).
3. **The post-split equivalence**: the three-file cold run
   (`parity-session5.spec.ts` + the two new homes) reproducing the
   pre-split pin outcome — 60 pins green, first-roll (the setup test
   runs per file: 44 + 12 + 7 = 63 tests).
4. **The chunk-3 composition cold** (5 files, expected 116 — the two
   families issue ZERO writes [grep-verified: zero `.post(`/`.patch(`/`
   `.delete(` in all 401 moved lines; the seven `.click(` calls are the
   S5-B dialog open + Escape-Close WITHOUT submitting (the S195
   read-only precedent) and the S5-U1 carousel prev/next/today
   navigation; the five `page.clock` calls freeze time, never write], so
   no budget units move and the chunk's budget is unchanged by
   construction).
5. **The 5-chunk cold cert map: 744/744 UNCHANGED** (a pure reorganization
   — no pins added, none removed; the Expected lines hold 160+275+116+
   101+92).

## §4 The extraction spec (the exact blocks, the exact boundaries)

| # | Describe | Source lines (1-indexed, inclusive) | Pins |
|---|----------|-------------------------------------|------|
| 1 | `S5-B · Events dark terminal panel` | 51–198 (no leading comment; describe 51–198) | 7 |
| 2 | `S5-U1 · Events day-focus carousel` | 200–266 (comment 200–211; describe 212–266) | 4 |
| 3 | `S5-E · FocusTimer layout` | 303–329 (no leading comment; describe 303–329) | 1 |
| 4 | `S190 · the Focus Timer chrome port` | 977–1134 (comment 977–983; describe 984–1134) | 5 |

- **401 source lines move** across four blocks in two regions: the Events
  pair is CONTIGUOUS (51–266 with the single inter-block blank at 199) —
  the splice removes 51–266 wholesale; the FocusTimer pair is two blocks
  (303–329 + 977–1134) with their adjacent blanks handled by the splice
  arithmetic (each removal takes its block + ONE adjacent blank so the
  staying neighbors keep single-blank separation).
- Each new home's header follows the `emptystates.spec.ts` template (the
  S198 home): the consolidation note (cycle, boundary decisions,
  contracts — narrated WITHOUT any `*/` sequence), the local `hydrated`
  helper, and the import line; events carries the two Events blocks in
  declaration order, focustimer the two FocusTimer blocks.
- `parity-session5.spec.ts` keeps **19 describes / 43 pins** (947 lines:
  S5-A, S5-C, S5-D, S5-F, S5-G, S5-H, S5-I, S5-J, S5-U2, S5-K, S5-L,
  S5-M, S5-N, S5-V, S5-AB, S123/BX6, S127/CB1, S162/DK1, S192) and its
  founding header comment re-anchors (the Events/FocusTimer moved-family
  notes join the ledger).

### The residue two-direction analysis (the S193 both-directions shape)

Chunk 3 is `parity-session5 + resilience + s16-perf-parity` (116 tests).
After the split its alphabetical order runs **events < focustimer <
parity-session5 < resilience < s16-perf-parity** — both new homes sort
STRICTLY BEFORE the split source (the S194/S195 SAFE direction —
strictly fewer predecessors), and the split source moves 1st → 3rd.

- **Direction-1 (what the moved pins see)**: events sorts 1st — ZERO
  predecessors, the identical exposure the Events pins had inside the
  1st-position parity-session5. focustimer sorts 2nd — ONE predecessor
  (events), but events issues ZERO writes, so the state focustimer's
  read-only chrome pins observe is byte-identical to the pre-split
  exposure. The immunity proof collapses to the write census (the S198
  lesson-2): all 17 moved pins issue ZERO writes and are read-only
  chrome/interaction asserts — immune by construction.
- **Direction-2 (what the later files see)**: parity-session5 itself now
  runs 3rd with events + focustimer before it — both ZERO-write, so the
  staying 43 pins observe identical predecessor state (previously zero
  predecessors at position 1; now two zero-write predecessors ≡ zero
  state delta). resilience + s16-perf-parity see the same zero-write
  region before them. Nothing lands for any later file to see.
- **The budget map**: ZERO write units move (there are none in the 401
  lines — no registrations, no POST/PATCH/DELETE); the register budget
  is untouched (no moved pin registers).

## §5 The execution ToDo list (the detailed, sequential, verifiable steps)

1. **Pre-split baseline** (cold): `bash scripts/e2e-cold-reset.sh` (kills
   the :3100 listener + `rm -f db/e2e.db`) → `bunx playwright test
   tests/e2e/parity-session5.spec.ts --project=chromium` → **60 pins
   passed, first-roll** (the S155/DD3 cold-reset-first doctrine for direct
   invocations).
2. **Write the extraction script** (`scripts/extract-s199.py`, session-
   staged, NEVER committed — the S194–S198 precedent): reads
   `parity-session5.spec.ts`, cuts the four blocks at the verified
   boundaries, writes the two homes (header note + helper + import + the
   blocks, declaration order preserved), rewrites
   `parity-session5.spec.ts` (the blocks removed, the header ledger note
   added), and machine-verifies: (a) block containment (each destination
   block byte-identical to its source range); (b) the source-negatives
   (no moved describe title remains in the source); (c) the title
   multiset (the union of the three files' pin titles == the pre-split
   multiset); (d) the describe/pin arithmetic (4+19 describes, 17+43
   pins); (e) the helper census (events' `hydrated` count == 11;
   focustimer's == 2 [S5-E 1 + the S190 beforeEach 1]; the staying
   file's 37 consumers intact — no orphan); (f) the blank-run accounting
   with the empirically measured shift; (g) the no-internal-terminator
   header check on both new homes.
3. **Single-file syntax check** (the S195 lesson-3 — a multi-file `--list`
   can mask a single file's syntax error): `bunx playwright test
   tests/e2e/events.spec.ts --list` → 12 tests; the same for focustimer
   → 7 (each home's pins + the setup test).
4. **Post-split equivalence** (cold): `bash scripts/e2e-cold-reset.sh` →
   `bunx playwright test tests/e2e/parity-session5.spec.ts
   tests/e2e/events.spec.ts tests/e2e/focustimer.spec.ts
   --project=chromium` → **63 passed, first-roll** (60 pins + the three
   per-file setup runs — the identical pin outcome to the pre-split
   baseline).
5. **Chunk-map sync** (both scripts): `scripts/e2e-chunked-cert.sh` +
   `scripts/run-cert-chunk.sh` — add the two homes to chunk 3 (1st and
   2nd files), add the S199/EW re-tag comment block to each header (the
   Expected line UNCHANGED at 160+275+116+101+92 = 744), keep the two
   CHUNKS arrays byte-identical (the CF6 tripwire).
6. **Tripwire comment chain**: `tests/script-conventions.test.ts` — the
   S198/EV comment block gains the S199/EW successor note (the census
   UNCHANGED at 744; the spec-file census 42 → 44; events 1st +
   focustimer 2nd — strictly fewer predecessors, the S194/S195
   direction; zero budget units move).
7. **Doc-chain lockstep** (§8) — every census site re-anchored in the same
   commit.
8. **Full gates**: `bun run lint` → `bun run typecheck` → `bun run test`
   (1799/1799 — the script-conventions tripwire machine-verifying the
   edited cert scripts) → kill the :3200 daemon by port (the S191 lesson)
   → `bun run build` (verify the bundled `.next/standalone/.env` carries
   `AUTH_SECRET=""`) → the full 5-chunk cold cert map
   (`bash scripts/e2e-chunked-cert.sh`) → **744/744, every chunk
   first-roll**.
9. **Closing chrome**: the drawer check (the 158th consecutive) + the
   desktop parity probe MATCH.
10. **Evidence frames** (§7) — captured on the re-booted :3200 standalone +
    the dev server :3000.
11. **The session transcript** (`docs/session_270.md`) + the worklog
    Session-210 entry + this plan's §9 closed.

## §6 The gates (the definition of done)

lint ✓ · tsc ✓ · unit 1799/1799 (55 files) ✓ · build ✓ · the 5-chunk cold
cert map 744/744 (160+275+116+101+92, the chunk-3 composition 116/116 cold
at 5 files) · the closing chrome (the drawer check GREEN + the parity probe
MATCH) · the doc-chain lockstep complete (§8) · zero residue on both hosts
(the reference account read-only; the clone's demo account left clean).

## §7 The evidence (the self-verifying frames + the dev-server set)

- `199-events.png` — the Events family's contracts DOM-asserted before the
  shot on the :3200 standalone (the slate-900 panel + the big date + the
  one-line "Nov 2026 CW <n>" header + the cyan New Event row).
- `199-focustimer.png` — the FocusTimer family's contracts (the white
  rounded-3xl panel + the 256px ring + the 48px mono time + the presets).
- The dev-server frames (the operator's standing request): the :3000
  dashboard + one moved-family surface + the mobile drawer.
- The four agent-browser comparison frames already captured (§0).
- All frames pixel-verified non-blank (the standing evidence discipline).

## §8 The doc-chain lockstep (every site, same commit)

AGENTS (the census line 42 → 44 spec files + the **S199 lessons** block) ·
CLAUDE (the e2e line's two-homes note) · README (the tree diagram 42 → 44 +
the Session-199 row) · the SKILL census sites (the §2 header + the §11
green-state re-anchor) · the vitest header · the cert scripts' re-tags
(BOTH) + the tripwire comment chain · the PAD **v1.3.107** revision block ·
the worklog **Session-210** entry · `docs/remediation-plan-session199.md`
(this plan, §5 executed, §9 closed) + `docs/session_270.md` ·
`.env.example` re-verified (no env changes this cycle).

## §9 The close and the next candidates (filled at the cycle close)

- **The execution outcome**: every step green — the pre-split baseline cold
  (**61 passed = 60 pins + setup, first-roll**), the machine-verified
  byte-faithfulness (all checks green after three check-design corrections
  inside the extraction script — none touching the shipped spec content),
  the single-file syntax checks (events 12 / focustimer 7 / the staying
  source 44), the post-split three-file equivalence (**61 passed,
  first-roll** — the identical outcome), the chunk-3 composition **116/116
  cold (5 files)**, the full 5-chunk cold cert map **744/744**
  (160+275+116+101+92, every chunk first-roll), lint ✓ · tsc ✓ · unit
  1799/1799 ✓ (the tripwire 138/138) · build ✓ (the :3200 daemon killed
  by port first; the bundled `.next/standalone/.env` verified
  `AUTH_SECRET=""`) · the closing chrome (the drawer check **158th**
  GREEN + the parity probe MATCH) · the five evidence frames + the four
  agent-browser comparison frames ok:true.
- **The deviation record**: THREE check-design corrections inside the
  extraction script (the S198 lesson-3 pattern): (1) the ledger-note
  injection spliced `[keep[close_idx]]` instead of `keep[close_idx:]`,
  silently dropping everything after the founding header — caught by the
  title-multiset check (all 43 staying pins missing); (2) the helper
  census subtracted `count("const hydrated")` from a call-regex that
  never matches the definition (`const hydrated = (page: Page) =>` — a
  space before the paren) — under-counting every file by one; (3) the
  first splice left BOTH boundary blanks at each of the three junctions,
  producing three double-blank runs — caught by the blank-run accounting
  check exactly as designed (each removal now consumes ONE adjacent
  blank — the S199 lesson-2). ONE plan correction: §3.3's expectation of
  "63 tests" in the post-split run was wrong — the setup test runs ONCE
  PER INVOCATION, not per file (the actual outcome 61 passed = 60 pins +
  setup, the identical pre-split shape). The spec content itself landed
  first-roll: the extraction, the single-file checks, the three-file
  equivalence, and the certification all green with zero re-runs of the
  split.
- **The next-cycle candidates (S200)**: a reference behavior-change axis
  if the next census finds one; the AI audit-rider candidates (the
  message-bubble anatomy when a populated reference account becomes
  measurable); or the next size-debt adjudication — parity-session5 is
  down to 19 describes / 43 pins (the mixed + coverage-axis families that
  STAY per the boundary doctrine), so the natural next targets are the
  remaining coverage-axis files (parity-session8 / parity-session6 /
  parity-session9) IF a future cycle re-adjudicates their axes — the
  S8-C Calendar family (6 pins) is the largest remaining pure view
  family in parity-session8; otherwise the S199 close stands as the
  parity-session5 consolidation program's natural end state.

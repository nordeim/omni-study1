# The S200 remediation plan — the Calendar + Dashboard + MyDay three-family view-home e2e consolidation (Batch EX: the S199 close's named next candidate, the size-debt re-adjudication of the remaining coverage-axis files)

The axis: the fresh **20-view reference census** (the standing S192
instrument `scripts/ref-census-s192.mjs`) flagged **112 raw deltas (17
auto-classed data-shaped + the identical 95 requiring adjudication)** — the
identical count and item set the S193–S199 cycles adjudicated — and every one
adjudicates to a standing non-gap class (the ledger in §1). The reference is
UNCHANGED since the S199 close — **the tenth consecutive clean window**. Per
the S199 close's named next candidates and the S189–S199 size-debt doctrine,
this cycle executes the **Calendar + Dashboard + MyDay three-family view-home
consolidation** out of `parity-session8.spec.ts` (the largest remaining
coverage-axis file, 1,939 lines): the Calendar view family (S8-C the rework
chrome), the Dashboard view family (S8-B the flush rows) and the MyDay view
family (S8-D the header + suggestions) split byte-faithfully into THREE
dedicated VIEW homes — **`tests/e2e/calendar.spec.ts`** (the 13th view home),
**`tests/e2e/dashboard.spec.ts`** (the 14th view home) and
**`tests/e2e/myday.spec.ts`** (the 15th view home) — the S195/S196/S199
multi-family shape, fourth application. A pure test-organization refactor
with ZERO application behavior change.

## §0 The context and the baseline

- The workspace: the S199 close `37dc215` + the operator's session_271
  transcript commit `fe0318b` on `main`, pulled fresh (a COLD clone — the
  environment re-derived per the standing recipe: bun install 510 pkgs,
  `.env` at `DATABASE_URL="file:../db/custom.db"` with `db/` at the repo
  root [the parent-workspace `.env` shadow re-verified live — the S192
  lesson-1 posture], db:push + db:seed, the pinned chromium v1243
  re-provisioned, the dev daemon :3000 + the standalone :3200 launched via
  the reaper-proof launchers; both `/api/health` green at the open; the
  bundled `.next/standalone/.env` verified `AUTH_SECRET=""`).
- The cold baseline reproduced the S199 close EXACTLY: lint ✓ · tsc ✓ ·
  unit **1799/1799 (55 files)** ✓.
- The standing chrome at the open: the drawer check GREEN (**the 159th
  consecutive** — no Tailwind v4 mobile-nav bug; the mobile navigation menu
  verified working: backdrop `oklab(0 0 0 / 0.2)` + blur(4px), 288px white
  panel, 20 links, no footer, Escape + navigate auto-close, appbar z-40
  fixed) · the desktop parity probe **MATCH** (all five structural checks,
  both hosts — the reference account probed read-only with the operator's
  credentials via the REF_PROBE_* env posture) · the reference account
  persists in DARK mode (`REF-DARK` via agent-browser — the documented
  S188+ protocol record, re-confirmed live this cycle).
- **The agent-browser interactive sweep** (the operator's standing watch,
  run this cycle on BOTH hosts, sessions `s200-clone` + `s200-ref`): the
  clone login → dashboard render (the sidebar's 20 links, the greeting, the
  stat cards, the section cards) · the mobile journey (the 390×844
  viewport: the labeled hamburger `Open navigation menu` → the drawer's 20
  links → the Tasks link navigates to `/Tasks` and the drawer AUTO-CLOSES,
  verified `DRAWER-CLOSED` by DOM probe) · the Create Task dialog anatomy +
  a full UI CRUD round-trip (create → the row renders → the row menu delete
  → `ZERO-RESIDUE` by DOM text probe) · the reference login + a read-only
  navigation sweep (Tasks/Calendar/Events/Notes/Analytics all render, zero
  console errors) · the reference mobile drawer (288px panel, 20 links —
  the clone's exact match) — **zero console errors, zero findings** on both
  hosts; the four comparison frames captured
  (`200-abrowser-ref-mobile-drawer.png` +
  `200-abrowser-ref-dashboard.png` + `200-abrowser-clone-mobile-drawer.png`
  + `200-abrowser-clone-dashboard.png`, all pixel-verified non-blank).
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
(the identical count and item set the S193–S199 cycles closed). Every class
adjudicates to a STANDING non-gap record:

1. **The data-shaped families** (the reference account's zero-data
   empty-state CTAs vs the seeded clone — dashboard/myday/tasks/timetable/
   assignments/exams/notes/flashcards/practicetests/studygroups/
   gradetracker/analytics/focustimer rows and counts; the AI view's
   reference-only quick-action heads "Explain Concept/Study Tips/Summarize/
   Solve Problem/Translate/Essay Ideas/How can I help you study today?"
   are the zero-data empty-hero family). The closing half (the S191
   lesson-2 code check) re-verified this cycle by grep: the clone CARRIES
   each flagged CTA in its zero-data path (`myday-view.tsx:226` "Add Your
   First Task", `tasks-view.tsx:738` "No tasks yet", the flashcards "Create
   Deck" pair, the notes empty family).
2. **The computed-identical tag differences** (Tasks "My Lists" p-vs-h3,
   the Settings Appearance h2-vs-div — the S192 adjudications, unchanged).
3. **The AI view's heads-delta** (the reference's real h3 quick-action
   titles + hero vs the clone's span role=heading stand-ins) — the S192
   axe-clean superset adjudication, computed-identical, pinned by EP2/EP4
   (verified present in `parity-session5.spec.ts`, at the post-S199-split
   line positions).
4. **The Files "Upload" affordance** — the S183 outline port (the S192
   dark-mode-artifact adjudication).
5. **The MathSolver solution card** — the S14 aria-live superset (pinned).
6. **The dashboard 6-vs-4 grid-div count** in the rough structural probe —
   the S192-counted artifact (the probe counts ALL grid children, not stat
   cards; the deeper S192 probe measured 4 stat cards on both hosts).
7. **The focustimer clone-only heads** ("7" / "0h 25m" — the seeded stats
   vs the reference account's zero-data stats) and **the settings
   clone-only "Appearance" head** (the active tab's h2 vs the reference's
   div — the S192 tag-difference family) — data-shaped, unchanged.

**REAL GAPS: NONE.** The reference is unchanged since the S199 close — the
consolidation window is clean (the tenth consecutive clean window; the
reference account remains zero-data, so the AI audit-rider candidates — the
message-bubble anatomy — stay unmeasurable).

## §2 The axis (why Calendar + Dashboard + MyDay out of parity-session8, why now)

- The S199 close's named next candidates, in order: a reference
  behavior-change axis (NOT found — the census is clean, tenth window);
  the AI audit-rider message-bubble anatomy (still unmeasurable — the
  reference account is zero-data); or the next size-debt adjudication —
  the remaining multi-describe coverage-axis files (parity-session8 /
  parity-session6 / parity-session9) IF a future cycle re-adjudicates
  their axes. This cycle takes the size-debt candidate and re-adjudicates.
- **The re-adjudication** (the S199 lesson-1: the largest PURE FAMILY, not
  the largest file — parity-session8 IS the largest remaining file at
  1,939 lines / 33 describes / 73 pins, but its families are fragmented
  across ~20 views, most describes 1 pin): the three largest PURE
  homeless-view families in the file are
  - **Calendar** (S8-C the rework chrome, 6 pins / 125 lines, L176–300:
    the simple p-6 border-slate-200 month card, the text-xl h2 with
    exactly 2 chevron nav buttons, the weekday header family, the
    selected-cell accent fill + today 100-level tint + hover stripped
    [with the S122/BW1 once-a-month deselect guard], the day-detail p-6
    card + font-bold h3 long date, and the EP7 year-omission port) —
    the S199 close's own named candidate ("the S8-C Calendar family
    [6 pins] is the largest remaining pure view family in
    parity-session8").
  - **Dashboard** (S8-B the flush rows, 3 pins / 73 lines, L102–174: the
    flush divide-y card bodies, the p-4 exam hover rows with the
    rounded-full badge [the S120/BU7 slate far family], the assignment
    4px color strip).
  - **MyDay** (S8-D the header + suggestions, 3 pins / 73 lines,
    L302–374: the 56px amber gradient sun block, the bare suggestions
    toggle, the bg-slate-50 suggestion rows with circle icons).
  All three families' views have NO home yet (the 12 existing view homes:
    notes, flashcards, timetable, files, analytics, gradetracker,
    studygroups, practicetests, events, focustimer + the view-adjacent
    tasks/calculator homes that predate the program); all three are
    contiguous in the source (L102–374 — the S199 Events-pair precedent
    of one splice region, now three blocks with single-blank separators
    at L175 + L301); and all twelve pins are read-only computed-style
    asserts (the census in §4).
- The boundary adjudications (the S189–S199 doctrine):
  - **The S8-G Notes two-pane describe (5 pins) STAYS** — the Notes view
    family already HAS its home (`notes.spec.ts`, S189); merging into an
    existing home is not the established one-file-to-new-homes split
    shape, and the S198 lesson-4 batch-tag rule cuts the other way too:
    a pin whose family already has a home is a reason NOT to move it.
  - **The S8-I Analytics additions (4 pins) STAY** (the analytics home
    exists — the same rule), as do the S8-F Tasks legs (2 pins — the
    tasks home predates the program; the file-boundary doctrine).
  - **The S8-A Sidebar chrome (4 pins) STAYS** — cross-view chrome (its
    own potential AXIS home for a future cycle, not a view family).
  - **The S8-AC S76 anatomy trio (4+6+1 pins) STAYS** — a
    MEASUREMENT-BATCH grouping across three views, not a view or
    UI-pattern axis (the S199 §2 doctrine).
  - **The S8-P Search icons + exam card describe (6 pins) STAYS** — a
    MIXED axis (search icons across views + the exam card), the mixed-axis
    doctrine.
  - **The hardening legs STAY** (S123/BX3, S125/BZ3/BZ4, S126/CA4/CA9,
    S127/CB8/CB17, S153/DB1, S163/DL1, S167/DQ1) — write-behavior
    hardening coverage, not chrome; the S190 AI quick-action order port
    STAYS (the AI family's binding axis, not a view).
  - **The strays outside the split source STAY** (the file-boundary
    doctrine, S197 lesson-1): the Calendar families in the other files
    (S5-G the segmented switch in parity-session5, S6-G + S127/CB5 in
    parity-session6, S9-E/S9-F in parity-session9), the Dashboard
    families (S6-D in parity-session6, S9-A/S9-R in parity-session9), and
    the MyDay families (S6-C in parity-session6, S9-B/Q in
    parity-session9).
- The stale-mention walk: grep found ZERO `S8-B`/`S8-C`/`S8-D` mentions
  outside `parity-session8.spec.ts` in tests/ + scripts/ (verified this
  cycle); the founding header's own items (L9, L10, L11) get the ledger
  re-anchor in this split.

## §3 The characterization contract (the Mode-D discipline — no honest-RED shape exists for a refactor)

1. **The pre-split baseline**: `parity-session8.spec.ts` cold-green at
   **73 pins** (verified by `--list`, never estimated — the S189 lesson 2;
   the `--list` census reads 74 tests in 2 files = 73 pins + the setup
   test).
2. **The byte-faithfulness machine checks** (the S189–S199 doctrine): (a)
   each moved block byte-identical to its source range INCLUDING its
   leading comment run (none of the three describes carries one — L102,
   L176, L302 are the describes directly); (b) the title multiset (the
   moved pins' titles exactly the pre-split members); (c) the
   describe/pin arithmetic: 3 moved + 30 staying = 33 describes before;
   12 moved + 61 staying = 73 pins before; (d) the helper census on
   COMMENT-STRIPPED, string-literal-excluded text (the S193 lesson-4
   extended to comments AND literals — the S8-D `hydrated()` comment
   mention, the S8-B/S8-C in-comment `rgb(` mentions, and the `rgb`
   definition's own template literal are false positives): `hydrated`
   12 calls move (3/6/3), `rgb` 10 calls move (2/6/2), `isRound` 2 calls
   move (both S8-B — its ONLY consumers in the file; the staying file
   keeps `hydrated` 63 + `rgb` 25 calls and DROPS the isRound DEFINITION
   or `tsc --noEmit` fails on
   noUnusedLocals — the no-orphan check must hold on BOTH sides); (e) the
   blank-run accounting against the original's inventory with the
   EMPIRICALLY MEASURED shift (the S198 lesson-3 — never a hand-computed
   constant); (f) the no-internal-terminator header check (the S197
   lesson-2 — the new homes' header comments narrate without any `*/`
   sequence).
3. **The post-split equivalence**: the four-file cold run
   (`parity-session8.spec.ts` + the three new homes) reproducing the
   pre-split pin outcome — 73 pins green, first-roll (the setup test runs
   ONCE PER INVOCATION, not per file — the S199 deviation-record lesson:
   expect 74 passed, not 77).
4. **The chunk-1 composition cold** (6 files, expected 160 — the three
   families issue ZERO writes [grep-verified: zero `.post(`/`.patch(`/`
   `.delete(`/`.request(` in all 273 moved lines; the two `.click(` calls
   are the S8-C day-cell selection and the S8-D suggestions toggle — both
   client-state only, never touching the API], so no budget units move
   and the chunk's budget is unchanged by construction).
5. **The 5-chunk cold cert map: 744/744 UNCHANGED** (a pure reorganization
   — no pins added, none removed; the Expected lines hold 160+275+116+
   101+92).

## §4 The extraction spec (the exact blocks, the exact boundaries)

| # | Describe | Source lines (1-indexed, inclusive) | Pins |
|---|----------|-------------------------------------|------|
| 1 | `S8-B · Dashboard flush rows` | 102–174 (no leading comment; describe 102–174) | 3 |
| 2 | `S8-C · Calendar rework` | 176–300 (no leading comment; describe 176–300) | 6 |
| 3 | `S8-D · MyDay header + suggestions` | 302–374 (no leading comment; describe 302–374) | 3 |

- **273 source lines move** across three blocks in ONE contiguous region
  (L102–374 with the single inter-block blanks at 175 + 301) — the splice
  removes 102–375 wholesale (the removal takes the region + ONE adjacent
  blank [the trailing 375], keeping the leading 101, so the staying
  neighbors S8-A and S8-E keep single-blank separation — the S199
  lesson-2 one-blank-per-removal rule).
- Each new home's header follows the `events.spec.ts` template (the S199
  home): the consolidation note (cycle, boundary decisions, contracts —
  narrated WITHOUT any `*/` sequence), the local helpers (calendar:
  `hydrated` + `rgb`; dashboard: `hydrated` + `rgb` + `isRound` with the
  trap-11 comment; myday: `hydrated` + `rgb`), and the import line
  (`import { expect, test, type Page } from "@playwright/test"`); each
  home carries its family block byte-faithfully.
- `parity-session8.spec.ts` keeps **30 describes / 61 pins** (~1,664
  lines): S8-A, S8-E, S8-F, S8-G, S8-H, S85/AL1, S86/AM1, S8-I, S8-K,
  S8-L, S8-M, S8-N, S8-O, S8-P, S8-U3, S8-Z, the S8-AC trio, BX3, BZ3,
  BZ4, CA4, CA9, CB8, CB17, DB1, DL1, DQ1, the S190 port; its founding
  header comment re-anchors (the moved-family ledger note joins the
  S199 precedent shape) and the `isRound` definition is REMOVED (its
  consumers all moved).

### The residue two-direction analysis (the S193 both-directions shape)

Chunk 1 is `navigation + parity-session8 + mobile-navigation` (160 tests).
After the split its alphabetical order runs **calendar < dashboard <
mobile-navigation < myday < navigation < parity-session8** — all three new
homes sort STRICTLY BEFORE the split source (the S194/S195 SAFE direction —
strictly fewer predecessors), and the split source moves 3rd → 6th.

- **Direction-1 (what the moved pins see)**: calendar sorts 1st — ZERO
  predecessors (the S8-C pins previously ran 3rd behind mobile-navigation
  + navigation inside parity-session8 — strictly fewer). dashboard sorts
  2nd — ONE predecessor (calendar), but calendar issues ZERO writes, so
  the state dashboard's read-only chrome pins observe is byte-identical
  to the pre-split exposure. myday sorts 4th — three predecessors
  (calendar + dashboard [zero-write] + mobile-navigation [ALREADY a
  predecessor of every parity-session8 pin today] — the net-new
  predecessor delta is the two zero-write homes ≡ zero state delta). The
  immunity proof collapses to the write census (the S198 lesson-2): all
  12 moved pins issue ZERO writes and are read-only chrome asserts —
  immune by construction.
- **Direction-2 (what the later files see)**: mobile-navigation,
  navigation and parity-session8 now see the three zero-write homes
  before them ≡ zero state delta (they previously saw only each other).
  Nothing lands for any later file to see.
- **The budget map**: ZERO write units move (there are none in the 273
  lines — no registrations, no POST/PATCH/DELETE); the register budget is
  untouched (no moved pin registers).

## §5 The execution ToDo list (the detailed, sequential, verifiable steps)

1. **Pre-split baseline** (cold): `bash scripts/e2e-cold-reset.sh` (kills
   the :3100 listener + `rm -f db/e2e.db`) → `bunx playwright test
   tests/e2e/parity-session8.spec.ts --project=chromium` → **73 pins
   passed, first-roll** (the S155/DD3 cold-reset-first doctrine for direct
   invocations).
2. **Write the extraction script** (`scripts/extract-s200.py`,
   session-staged, NEVER committed — the S194–S199 precedent): reads
   `parity-session8.spec.ts`, cuts the three blocks at the verified
   boundaries (keep 1–101 + 376–end), writes the three homes (header note
   + helpers + import + the block, declaration order preserved), rewrites
   `parity-session8.spec.ts` (the blocks removed, the founding-header
   ledger note added, the orphaned `isRound` definition removed), and
   machine-verifies: (a) block containment (each destination block
   byte-identical to its source range); (b) the source-negatives (no moved
   describe title remains in the source); (c) the title multiset (the
   union of the four files' pin titles == the pre-split multiset); (d) the
   describe/pin arithmetic (3+30 describes, 12+61 pins); (e) the helper
   census on comment-stripped text (calendar `hydrated` 6 + `rgb` 6;
   dashboard `hydrated` 3 + `rgb` 2 + `isRound` 2; myday `hydrated` 3 +
   `rgb` 2; the staying file `hydrated` 63 + `rgb` 25 + `isRound` 0 — no
   orphan on either side, the isRound definition removed from the source);
   (f) the blank-run accounting with the empirically measured shift; (g)
   the no-internal-terminator header check on all three new homes; (h)
   the no-orphan-definition check (`isRound` absent from the staying
   source, present in dashboard's home).
3. **Single-file syntax check** (the S195 lesson-3 — a multi-file `--list`
   can mask a single file's syntax error): `bunx playwright test
   tests/e2e/calendar.spec.ts --list` → 7 tests; the same for dashboard →
   4; myday → 4; the staying source → 62 (each home's pins + the setup
   test).
4. **Post-split equivalence** (cold): `bash scripts/e2e-cold-reset.sh` →
   `bunx playwright test tests/e2e/parity-session8.spec.ts
   tests/e2e/calendar.spec.ts tests/e2e/dashboard.spec.ts
   tests/e2e/myday.spec.ts --project=chromium` → **74 passed, first-roll**
   (73 pins + the one per-invocation setup run — the identical pin
   outcome to the pre-split baseline).
5. **Chunk-map sync** (both scripts): `scripts/e2e-chunked-cert.sh` +
   `scripts/run-cert-chunk.sh` — add the three homes to chunk 1 (1st, 2nd
   and 4th files), add the S200/EX re-tag comment block to each header
   (the Expected line UNCHANGED at 160+275+116+101+92 = 744), keep the
   two CHUNKS arrays byte-identical (the CF6 tripwire).
6. **Tripwire comment chain**: `tests/script-conventions.test.ts` — the
   S199/EW comment block gains the S200/EX successor note (the census
   UNCHANGED at 744; the spec-file census 44 → 47; calendar 1st +
   dashboard 2nd + myday 4th — strictly fewer predecessors, the S194/S195
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
9. **Closing chrome**: the drawer check (the 160th consecutive) + the
   desktop parity probe MATCH.
10. **Evidence frames** (§7) — captured on the re-booted :3200 standalone +
    the dev server :3000.
11. **The session transcript** (`docs/session_272.md`) + the worklog
    Session-211 entry + this plan's §9 closed.

## §6 The gates (the definition of done)

lint ✓ · tsc ✓ · unit 1799/1799 (55 files) ✓ · build ✓ · the 5-chunk cold
cert map 744/744 (160+275+116+101+92, the chunk-1 composition 160/160 cold
at 6 files) · the closing chrome (the drawer check GREEN + the parity probe
MATCH) · the doc-chain lockstep complete (§8) · zero residue on both hosts
(the reference account read-only; the clone's demo account left clean).

## §7 The evidence (the self-verifying frames + the dev-server set)

- `200-calendar.png` — the Calendar family's contracts DOM-asserted before
  the shot on the :3200 standalone (the p-6 border-slate-200 month card +
  the text-xl h2 + the 2 chevron buttons + the selected accent cell + the
  day detail).
- `200-dashboard.png` — the Dashboard family's contracts (the flush
  divide-y exam rows + the rounded-full badge + the 4px assignment strip).
- `200-myday.png` — the MyDay family's contracts (the 56px amber gradient
  sun block + the suggestions toggle + the slate-50 suggestion rows).
- The dev-server frames (the operator's standing request): the :3000
  dashboard + a moved-family surface + the mobile drawer.
- The four agent-browser comparison frames already captured (§0).
- All frames pixel-verified non-blank (the standing evidence discipline).

## §8 The doc-chain lockstep (every site, same commit)

AGENTS (the census line 44 → 47 spec files + the **S200 lessons** block) ·
CLAUDE (the e2e line's three-homes note) · README (the tree diagram 44 → 47
+ the Session-200 row) · the SKILL census sites (the §2 header + the §11
green-state re-anchor) · the vitest header · the cert scripts' re-tags
(BOTH) + the tripwire comment chain · the PAD **v1.3.108** revision block ·
the worklog **Session-211** entry · `docs/remediation-plan-session200.md`
(this plan, §5 executed, §9 closed) + `docs/session_272.md` ·
`.env.example` re-verified (no env changes this cycle).

## §9 The close and the next candidates (filled at the cycle close)

- **The execution outcome**: every step green — the pre-split baseline cold
  (**74 passed = 73 pins + setup, first-roll**), the machine-verified
  byte-faithfulness (all checks green after three check-design corrections
  inside the extraction script — none touching the shipped spec content),
  the single-file syntax checks (calendar 7 / dashboard 4 / myday 4 / the
  staying source 62), the post-split four-file equivalence (**74 passed,
  first-roll** — the identical outcome), the chunk-1 composition
  **160/160 cold (6 files)**, the full 5-chunk cold cert map **744/744**
  (160+275+116+101+92, every chunk first-roll), lint ✓ · tsc ✓ · unit
  1799/1799 ✓ (the tripwire 138/138) · build ✓ (the :3200 daemon killed
  by port first; the bundled `.next/standalone/.env` verified
  `AUTH_SECRET=""`) · the closing chrome (the drawer check **160th**
  GREEN + the parity probe MATCH) · the six evidence frames + the four
  agent-browser comparison frames ok:true. The census re-derived by
  `--list`: 740 tests in 48 files = 739 chromium in **47 spec files** +
  the setup test — exactly as planned.
- **The deviation record**: THREE check-design corrections inside the
  extraction script (the S198 lesson-3 pattern): (1) the helper census
  counted the `rgb` definition's own template literal as a call — the
  census regex now excludes quote/backtick-preceded matches on
  comment-stripped text; (2) the blank-run accounting first missed the
  trailing-blank JUNCTION run (the region text's final blank forms no run
  outside full-file context) and the deliberate isRound-edit delta —
  redesigned as measured junction arithmetic plus the edit's own measured
  before/after delta; (3) Python Counter subtraction drops non-positive
  counts — the signed form restores the −2×3-runs/+1×4-run merge. ONE
  plan correction: §3.2e/§5.2e's staying helper counts (hydrated 64 /
  rgb 28) were hand-derived from the flawed first census — corrected to
  the MEASURED 63/25 before execution (the S200 lesson-4). The spec
  content itself landed first-roll: the extraction, the single-file
  checks, the four-file equivalence, and the certification all green
  with zero re-runs of the split.
- **The next-cycle candidates (S201)**: a reference behavior-change axis
  if the next census finds one; the AI audit-rider candidates (the
  message-bubble anatomy when a populated reference account becomes
  measurable); or the next size-debt adjudication — parity-session8
  keeps the S8-A Sidebar chrome [4 pins] as its largest remaining pure
  cross-view family (its own future AXIS-home candidate) + the
  S8-G/S8-I already-homed stragglers per the boundary doctrine, with
  parity-session6's S6-A populated task rows [5 pins] and
  parity-session9's S9-B/Q MyDay family [5 pins] the other
  homeless-view candidates; otherwise the S200 close extends the
  consolidation program's steady state.

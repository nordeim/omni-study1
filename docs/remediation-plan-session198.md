# The S198 remediation plan — the cross-view three-family e2e consolidation (Batch EV: the S197 close's named next candidate, the SECOND AXIS-HOME KIND)

The axis: the fresh **20-view reference census** (the standing S192 instrument
`scripts/ref-census-s192.mjs`) flagged **112 raw deltas (17 auto-classed
data-shaped + the identical 95 requiring adjudication)** — the identical count
and item set the S193–S197 cycles adjudicated — and every one adjudicates to a
standing non-gap class (the ledger in §1). The reference is UNCHANGED since
the S197 close — **the eighth consecutive clean window**. Per the S197 close's
named next candidates and the S189–S197 size-debt doctrine, this cycle
executes the **cross-view three-family e2e consolidation**: the three
cross-view chrome describes (S184/EH the shared EmptyState family + S186/EJ
the view-header row family + S187/EK the filter-row separation + sf-card
border + Tasks search width family) split byte-faithfully out of
`parity-session7.spec.ts` into THREE dedicated AXIS homes —
**`tests/e2e/emptystates.spec.ts`** (the EmptyState-anatomy axis),
**`tests/e2e/viewheaders.spec.ts`** (the view-header-row axis), and
**`tests/e2e/filterrows.spec.ts`** (the filter-row-separation axis) — the
second, third, and fourth AXIS homes after S197's dialogs (the S196 close's
own shape: "the cross-view family homes …, each an AXIS home rather than a
view home"). A pure test-organization refactor with ZERO application behavior
change.

## §0 The context and the baseline

- The workspace: the S197 close `0a12b1f` + the operator's session_267
  transcript commit `76dad3a` on `main`, pulled fresh (a WARM workspace:
  node_modules, `db/custom.db`, the :3000 dev daemon, and the :3200
  standalone survivor all present; the doc-only diff `0a12b1f..76dad3a`
  verified — `docs/session_267.md` only, ZERO src/tests/scripts/prisma files
  — so both daemons are BYTE-CURRENT per the S193 lesson-1 verify-and-reuse
  procedure: `/api/health` ok on both ports, no rebuild at the open).
- The cold baseline reproduced the S197 close EXACTLY: lint ✓ · tsc ✓ ·
  unit **1799/1799 (55 files)** ✓.
- The standing chrome at the open: the drawer check GREEN (**the 155th
  consecutive** — no Tailwind v4 mobile-nav bug; the mobile navigation menu
  verified working: backdrop `oklab(0 0 0 / 0.2)` + blur(4px), 288px white
  panel, 20 links, no footer, Escape + navigate auto-close) · the desktop
  parity probe **MATCH** (all five structural checks, both hosts — the
  reference account probed read-only with the operator's credentials via
  the REF_PROBE_* env posture) · the reference account persists in DARK
  mode (`REF-DARK` via agent-browser — the documented S188+ protocol
  record, re-confirmed live this cycle).
- The agent-browser interactive sweep (the operator's standing watch, run
  this cycle on BOTH hosts, session `s198-03e363425671`): the clone login →
  dashboard render (the sidebar's 20 links, the greeting, the stat cards,
  the section cards) · the mobile journey (the 390×844 viewport: the labeled
  hamburger `Open navigation menu` → the drawer's 20 links → the Tasks link
  navigates to `/Tasks` and the drawer AUTO-CLOSES, verified
  `DRAWER-CLOSED` by DOM probe) · the Create Task dialog anatomy + a full
  UI CRUD round-trip (create → the row renders → the row menu delete →
  `ZERO-RESIDUE` by DOM text probe) · the reference login + a read-only
  navigation sweep (Tasks/Calendar/Events/Notes/Analytics all render, zero
  console errors) · the reference mobile drawer (288px panel, 20 links —
  the clone's exact match) — **zero console errors, zero findings** on
  both hosts; the four comparison frames captured
  (`198-abrowser-ref-mobile-drawer.png` + `198-abrowser-ref-dashboard.png`
  + `198-abrowser-clone-mobile-drawer.png` +
  `198-abrowser-clone-dashboard.png`, all pixel-verified non-blank).
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
(the identical count and item set the S193–S197 cycles closed). Every class
adjudicates to a STANDING non-gap record:

1. **The data-shaped families** (the reference account's zero-data
   empty-state CTAs vs the seeded clone — dashboard/myday/tasks/timetable/
   assignments/exams/notes/flashcards/practicetests/studygroups/
   gradetracker/analytics/focustimer rows and counts). The closing half (the
   S191 lesson-2 code check) re-verified this cycle by grep: the clone
   CARRIES each flagged CTA in its zero-data path (`myday-view.tsx:226`
   "Add Your First Task", `tasks-view.tsx:738` "No tasks yet",
   `assignments-view.tsx:337` "No assignments yet", `exams-view.tsx:327`
   "No exams found", `flashcards-view.tsx:516/543`, `notes-view.tsx:1284`).
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

**REAL GAPS: NONE.** The reference is unchanged since the S197 close — the
consolidation window is clean (the eighth consecutive clean window; the
reference account remains zero-data, so the AI audit-rider candidates — the
message-bubble anatomy — stay unmeasurable).

## §2 The axis (why the cross-view three-family split, why now)

- `parity-session7.spec.ts` remains the suite's second-largest file at
  **1,016 lines / 7 describes / 31 pins** after the S189 (notes, 49 pins),
  S191 (flashcards, 18), S193 (timetable, 15), S194 (files, 7), S195
  (analytics + gradetracker, 6), S196 (studygroups + practicetests, 6), and
  S197 (dialogs, 5) splits. (The largest file remains `resilience.spec.ts`
  at 2,359 lines — a COVERAGE-AXIS file whose describes are
  failure-state/edge-case axes, not view families; the view-dedicated
  convention does not apply there — the S194 lesson 3.)
- The S197 close's named next candidates, in order: a reference
  behavior-change axis (NOT found — the census is clean, eighth window);
  the AI audit-rider message-bubble anatomy (still unmeasurable — the
  reference account is zero-data); or the next size-debt adjudication —
  **the cross-view family** (S184/EH + S186/EJ + S187/EK). This cycle
  takes the size-debt candidate.
- The S196 close's own shape for this family: "the cross-view family homes
  [S184/EH EmptyState + S186/EJ view-header + S187/EK filter-row], each an
  AXIS home rather than a view home" — THREE homes, one per binding axis
  (the S197 close's singular "the second axis home" reads as the
  axis-home KIND — dialogs was the first, these are the second kind's
  members). The one-home-per-family shape follows the S195 (analytics +
  gradetracker) and S196 (studygroups + practicetests) two-family
  precedents, extended to three.
- The complete-family scope (the S189–S197 precedent: each home holds
  every pure describe for its family in the split source):
  - **S184/EH** (6 pins / 211 lines with the leading comment — the shared
    EmptyState family re-rotation: the family anatomy on Files [px-4,
    wrapper mb-6, title mb-2, hint max-w-sm, no CTA], the Tasks empty CTA
    "Create Task" + the PLAIN gradient shadow, the Flashcards two-pane
    zero split [sidebar "Create Deck" + main "Select a deck"], the Exams
    spanning-cell empty, the Timetable always-grid + slim My-Classes
    empty, the Assignments bare empty + plain-shadow CTA — all six
    zero-forced via the EA3 GET-interception pattern, all read-only).
  - **S186/EJ** (6 pins / 118 lines with the leading dashes comment — the
    view-header row family: the Tasks/Timetable/Files/Dashboard/Exams
    headers stack their toolbars below the h1 at mobile and row at
    desktop; the Calculator header stays a row at mobile, items-center —
    the `rowOf` ancestor-walk helper is DESCRIBE-SCOPED and moves with
    the block; all six read-only computed-style asserts).
  - **S187/EK** (7 pins / 198 lines, no leading comment run [its
    measurement narrative lives INSIDE the describe] — the filter-row
    separation + the sf-card border + the Tasks search width: the Exams
    header carries only the Add Exam button, the Exams filter row stacks
    below the header, the Exams/Assignments selects stay 160px at both
    viewports, the search inputs render pl-10 + text-base md:text-sm, the
    sf-card border reads slate-100 + the Calendar/GT family stays
    slate-200 [the EK6 pin — the one `rgb(` consumer among the moved
    pins: 3 real call sites], the Tasks search collapses at mobile +
    256px at desktop — all seven read-only).
- **Each family's binding axis is a UI PATTERN measured ACROSS views, not
  a view**: EH spans Files/Tasks/Flashcards/Exams/Timetable/Assignments;
  EJ spans Tasks/Timetable/Files/Dashboard/Exams/Calculator; EK spans
  Exams/Assignments/Tasks/Calendar/GradeTracker — the same axis-home
  legitimacy S197 established for dialogs, three times over.
- The other S197-close candidates, adjudicated: the reference
  behavior-change axis (NOT found — the census is clean, eighth window);
  the AI audit-rider message-bubble anatomy (still unmeasurable).

## §3 The characterization contract (the Mode-D discipline — no honest-RED shape exists for a refactor)

1. **The pre-split baseline**: `parity-session7.spec.ts` cold-green at
   **31 pins** (verified by `--list`, never estimated — the S189 lesson 2;
   the `--list` census reads 32 tests = 31 pins + the setup test).
2. **The byte-faithfulness machine checks** (the S189–S197 doctrine): (a)
   each moved block byte-identical to its source range INCLUDING its
   leading comment run (the comment-block ownership walk — S184/EH's run
   485–500; S186/EJ's dashes run 699–708; S187/EK carries NO leading
   comment run, its narrative sits inside the describe); (b) the title
   multiset (the moved pins' titles exactly the pre-split members);
   (c) the describe/pin arithmetic: 3 moved + 4 staying = 7 describes
   before; 19 moved + 12 staying = 31 pins before; (d) the helper census
   (`hydrated` 6 calls move with EH, 6 with EJ, 10 with EK; `rgb`'s 3 EK6
   call sites move with EK; the staying file's `hydrated` keeps 12
   consumers and its `rgb` keeps the 7 S7-B consumers — no orphan on
   either side); (e) the blank-run accounting against the original's
   inventory (the source's ≥2-run inventory {121:3, 295:2, 335:2, 351:2,
   364:2, 483:2, 696:3, 817:2} minus the removed-region runs {483:2,
   696:3, 817:2} == the new source's inventory {121:3, 295:2, 335:2,
   351:2, 364:2} — the S197 lesson-3 accounting shape, never an absolute
   style rule).
3. **The post-split equivalence**: the four-file cold run
   (`parity-session7.spec.ts` + the three new homes) reproducing the
   pre-split outcome — 31 pins green, first-roll.
4. **The chunk-2 composition cold** (19 files, expected 275 — the family
   issues ZERO writes [grep-verified: zero `.click(`, zero POST/PATCH/
   DELETE, zero request.* writes in all 532 moved lines; the six
   `page.route` GETs are the EA3 zero-forcing interception, each
   unrouted], so no budget units move and the chunk's budget is unchanged
   by construction).
5. **The 5-chunk cold cert map: 744/744 UNCHANGED** (a pure reorganization
   — no pins added, none removed; the Expected lines hold 160+275+116+
   101+92).

## §4 The extraction spec (the exact blocks, the exact boundaries)

| # | Describe | Source lines (1-indexed, inclusive) | Pins |
|---|----------|-------------------------------------|------|
| 1 | `S184/EH · the shared EmptyState family re-rotation` | 485–695 (comment 485–500; describe 501–695) | 6 |
| 2 | `S186/EJ · the view-header row family (mobile-stacked)` | 699–816 (comment 699–708; describe 709–816) | 6 |
| 3 | `S187/EK · the filter-row separation + the sf-card border + the Tasks search width` | 819–1016 (no leading comment; describe 819–1016) | 7 |

- **527 source lines move** across three blocks (the fifth multi-block
  extraction after S193's four, S195's four, S196's five, and S197's
  four) — the entire tail of the file from the EH comment run to EOF.
- Each new home's header follows the `dialogs.spec.ts` template: the
  consolidation note (cycle, boundary decisions, contracts), the local
  `hydrated` helper (all three homes), the `rgb` helper (filterrows only —
  EK6's 3 call sites; narrated WITHOUT any `*/` sequence in the header
  text — the S197 lesson-2 comment-terminator trap), and the import line.
- `parity-session7.spec.ts` keeps **4 describes / 12 pins** (482 lines:
  S7-B the mixed dialogs family, S78 the Batch AE hardening family, S81
  the calculator keypad guard, S175/DY4 the mixed CRUD journeys — the
  four families the S197 close itself named as staying) and its header
  comment re-anchors (the EH/EJ/EK moved-family notes join the founding
  ledger).
- **The S82/AI1 orphaned comment block (335–350) STAYS** — an orphaned
  comment from the S191 flashcards split documenting describes that moved
  then; "an orphaned comment block from a PRIOR split is not yours to
  move" (the S195 lesson-4 precedent, re-applied at its post-S197
  position).

### The boundary adjudications (the S189–S197 doctrine)

- **The cross-view strays outside the split source STAY**: the auth
  primary-CTA family in `auth.spec.ts` carries the SAME S186/EJ batch tag
  but is a DIFFERENT family (the auth-button anatomy, its own home — the
  file-boundary doctrine; the S197 dialogs precedent: S173/DW2 stayed in
  gradetracker); the a11y-sweep/dark-mode/mobile-navigation legs, the
  s17-fresh-user zero-data legs, and the resilience legs stay in their
  coverage-axis homes. A pin's BATCH TAG is not its family when the pin
  already lives in a dedicated home (the S197 lesson-1 extension: a pin's
  TOPIC is not its family either when it has a home).
- **The stale-mention walk**: `gradetracker.spec.ts:22`'s founding header
  narrates "the S187/EK GT-stat border leg) stay in their coverage-axis
  homes" — the S195 historical record; after this cycle that leg lives in
  the filterrows home. The mention STAYS VERBATIM (the S197 lesson-4:
  stale mentions remain as accurate historical narrative — the record
  describes where the stray lived at the S195 split); the
  `scripts/e2e-chunked-cert.sh` S194/ER-era comment that names "the EH1
  forced-zero + EJ6 header-stacking pins in parity-session7" likewise
  stays as history.
- **The residue two-direction analysis** (the S193 both-directions shape —
  the first cycle with BOTH directions present in one file set): with the
  three homes added, chunk 2's alphabetical order runs a11y-sweep <
  analytics < dialogs < **emptystates** < files < **filterrows** <
  flashcards < gradetracker < notes < parity-session6 < parity-session7
  < parity-session9 < practicetests < s14-hardening < studygroups < tasks
  < theme-system < timetable < **viewheaders** — the split source now
  sorts 11th. Direction-1: emptystates (4th) and filterrows (6th) sit
  STRICTLY BEFORE the source's 11th position (the S194/S195 SAFE
  direction); viewheaders sorts 19th — LAST — the S196 after-position
  direction, requiring the per-pin immunity proof: every EJ pin is a
  read-only computed-style assert on view CHROME (header flexDirection/
  gap/alignItems/wrap, the 2-kid children census, the mb-6 rider) that
  does not depend on any predecessor's data state — immune by
  construction (the strongest immunity class: zero writes + zero
  data-shaped reads). Direction-2: all 19 moved pins issue ZERO writes
  (the §3 write census), so nothing lands for any later file to see;
  viewheaders leaves nothing behind (there are also no later files — it
  sorts last).
- **The budget map**: ZERO write units move (there are none in the 527
  lines — the six `page.route` GETs intercept reads only); the register
  budget is untouched (no moved pin registers).

## §5 The execution ToDo list (the detailed, sequential, verifiable steps)

1. **Pre-split baseline** (cold): `bash scripts/e2e-cold-reset.sh` (kills
   the :3100 listener + `rm -f db/e2e.db`) → `bunx playwright test
   tests/e2e/parity-session7.spec.ts --project=chromium` → **31 pins
   passed, first-roll** (the S155/DD3 cold-reset-first doctrine for direct
   invocations).
2. **Write the extraction script** (`scripts/extract-s198.py`, session-
   staged, NEVER committed — the S194–S197 precedent): reads
   `parity-session7.spec.ts`, cuts the three blocks at the verified
   boundaries, writes the three homes (header note + helpers + import +
   the block, per the dialogs assembly shape), rewrites
   `parity-session7.spec.ts` (the three blocks removed, the header ledger
   note added), and machine-verifies: (a) block containment (each
   destination block byte-identical to its source range); (b) the
   source-negative (no moved describe title remains in the source); (c)
   the title multiset (the union of the four files' pin titles == the
   pre-split multiset); (d) the describe/pin arithmetic (3+4 describes,
   19+12 pins); (e) the helper census (each home's `hydrated` count == its
   blocks' count; filterrows' `rgb` count == 3; the staying file's
   `hydrated`/`rgb` keep their consumers); (f) the blank-run accounting
   against the original's inventory.
3. **Single-file syntax check** (the S195 lesson-3 — a multi-file `--list`
   can mask a single file's syntax error): `bunx playwright test
   tests/e2e/emptystates.spec.ts --list` → 7 tests; the same for
   viewheaders → 7; filterrows → 8 (each home's pins + the setup test).
4. **Post-split equivalence** (cold): `bash scripts/e2e-cold-reset.sh` →
   `bunx playwright test tests/e2e/parity-session7.spec.ts tests/e2e/
   emptystates.spec.ts tests/e2e/viewheaders.spec.ts tests/e2e/
   filterrows.spec.ts --project=chromium` → **32 passed, first-roll**
   (31 pins + the setup test — the identical outcome to the pre-split
   baseline).
5. **Chunk-map sync** (both scripts): `scripts/e2e-chunked-cert.sh` +
   `scripts/run-cert-chunk.sh` — add the three homes to chunk 2 (17th,
   18th, 19th files), add the S198/EV re-tag comment block to each header
   (the Expected line UNCHANGED at 160+275+116+101+92 = 744), keep the
   two CHUNKS arrays byte-identical (the CF6 tripwire).
6. **Tripwire comment chain**: `tests/script-conventions.test.ts` — the
   S197/EU comment block gains the S198/EV successor note (the census
   UNCHANGED at 744; the spec-file census 39 → 42; emptystates 4th +
   filterrows 6th — strictly fewer predecessors, the S194/S195 direction;
   viewheaders 19th/last — the S196 after-position direction with the
   zero-write immunity proof; zero budget units move).
7. **Doc-chain lockstep** (§8) — every census site re-anchored in the same
   commit.
8. **Full gates**: `bun run lint` → `bun run typecheck` → `bun run test`
   (1799/1799 — the script-conventions tripwire machine-verifying the
   edited cert scripts) → kill the :3200 daemon by port (the S191 lesson)
   → `bun run build` (verify the bundled `.next/standalone/.env` carries
   `AUTH_SECRET=""`) → the full 5-chunk cold cert map
   (`bash scripts/e2e-chunked-cert.sh`) → **744/744, every chunk
   first-roll**.
9. **Closing chrome**: the drawer check (the 156th consecutive) + the
   desktop parity probe MATCH.
10. **Evidence frames** (§7) — captured on the re-booted :3200 standalone +
    the dev server :3000.
11. **The session transcript** (`docs/session_268.md`) + the worklog
    Session-209 entry + this plan's §9 closed.

## §6 The gates (the definition of done)

lint ✓ · tsc ✓ · unit 1799/1799 (55 files) ✓ · build ✓ · the 5-chunk cold
cert map 744/744 (160+275+116+101+92, the chunk-2 composition 275/275 cold
at 19 files) · the closing chrome (the drawer check GREEN + the parity
probe MATCH) · the doc-chain lockstep complete (§8) · zero residue on both
hosts (the reference account read-only; the clone's demo account left
clean).

## §7 The evidence (the self-verifying frames + the dev-server set)

- `198-emptystates.png` — the S184/EH contracts DOM-asserted before the
  shot on the :3200 standalone (a view's zero-state empty anatomy: the
  py-16 px-4 container, the wrapper mb-6, the 20px/600 title, the
  max-w-sm hint).
- `198-viewheaders.png` — the S186/EJ contracts (a toolbar view's header
  at BOTH viewports: the mobile column + 16px gap, the desktop row +
  items-center).
- `198-filterrows.png` — the S187/EK contracts (the Exams/Assignments
  header + the separated filter row below it: the add-only header, the
  160px selects, the pl-10 search).
- The dev-server frames (the operator's standing request): the :3000
  dashboard + one cross-view surface + the mobile drawer.
- The four agent-browser comparison frames already captured (§0).
- All frames pixel-verified non-blank (the standing evidence discipline).

## §8 The doc-chain lockstep (every site, same commit)

AGENTS (the census line 39 → 42 spec files + the **S198 lessons** block) ·
CLAUDE (the e2e line's three-homes note) · README (the tree diagram 39 → 42
+ the Session-198 row + the badge re-verify) · the SKILL census sites (the
§2 header + the §11 green-state re-anchor — the census note kept OUTSIDE
the `(2543 green)` parens, the S196 tripwire lesson applied) · the vitest
header · the cert scripts' re-tags (BOTH) + the tripwire comment chain ·
the PAD **v1.3.106** revision block · the worklog **Session-209** entry ·
`docs/remediation-plan-session198.md` (this plan, §5 executed, §9 closed)
+ `docs/session_268.md` · `.env.example` re-verified (no env changes this
cycle).

## §9 The close and the next candidates (filled at the cycle close)

- **The execution outcome**: every step green — the pre-split baseline cold
  (32 passed = 31 pins + setup, first-roll), the machine-verified
  byte-faithfulness (all checks green after three check-design corrections
  inside the extraction script — none touching the shipped spec content),
  the single-file syntax checks (emptystates 7 / viewheaders 7 /
  filterrows 8), the post-split four-file equivalence (32 passed,
  first-roll), the chunk-2 composition **275/275 cold (19 files)**, the
  full 5-chunk cold cert map **744/744** (160+275+116+101+92, every chunk
  first-roll), lint ✓ · tsc ✓ · unit 1799/1799 ✓ (the tripwire 138/138) ·
  build ✓ (the :3200 daemon killed by port first; the bundled
  `.next/standalone/.env` verified `AUTH_SECRET=""`; the seven
  edge-instrumentation warnings pre-existing) · the closing chrome (the
  drawer check **156th** GREEN + the parity probe MATCH) · the six
  evidence frames + the four agent-browser comparison frames ok:true.
- **The deviation record**: THREE check-design corrections inside the
  extraction script (the S198 lesson-3): (1) the title-regex's unescaped
  paren made the pin census read 0 — fixed to the escaped form; (2) the
  blank-run accounting's hand-computed shift was off by one line —
  redesigned to the EMPIRICALLY MEASURED delta (`len(new) - len(old)`,
  never a hand-computed constant); (3) the ledger-note terminator check
  first scanned the note's own closing delimiter — scoped to the note
  BODY. ONE evidence-capture fix (the S9 auto-wait lesson re-hit): the
  dev-server Files frame's bare `isVisible()` raced the async files
  fetch — replaced with the auto-waiting `waitFor({ state: "visible" })`.
  The spec content itself landed first-roll: the extraction, the
  single-file checks, the four-file equivalence, and the certification
  all green with zero re-runs of the split.
- **The next-cycle candidates (S199)**: a reference behavior-change axis
  if the next census finds one; the AI audit-rider candidates (the
  message-bubble anatomy when a populated reference account becomes
  measurable); or the next size-debt adjudication — parity-session7 is
  down to 4 describes / 12 pins (the S7-B/S78/S81/S175-DY4 mixed +
  batch-lineage families that STAY per the boundary doctrine), so the
  natural next targets are the remaining multi-describe coverage-axis
  files (parity-session5 / parity-session6 / parity-session8 /
  parity-session9) IF a future cycle re-adjudicates their axes;
  otherwise the S198 close stands as the parity-session7 consolidation
  program's natural end state.

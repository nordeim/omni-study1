# The S201 remediation plan — the Sidebar-chrome AXIS-home e2e consolidation (Batch EY: the S200 close's named next candidate, the size-debt re-adjudication of parity-session8's remaining pure cross-view family)

The axis: the fresh **20-view reference census** (the standing S192
instrument `scripts/ref-census-s192.mjs`) flagged **112 raw deltas (17
auto-classed data-shaped + the identical 95 requiring adjudication)** — the
identical count and item set the S193–S200 cycles adjudicated — and every one
adjudicates to a standing non-gap class (the ledger in §1). The reference is
UNCHANGED since the S200 close — **the eleventh consecutive clean window**.
Per the S200 close's named next candidates and the S189–S200 size-debt
doctrine, this cycle executes the **Sidebar-chrome AXIS-home consolidation**:
the S8-A Sidebar chrome family (the reference-measured nav-icon set, the
active-nav gradient's avatarTo stop, the untruncated brand tagline, the
reference's 36px collapse button — 4 pins) split byte-faithfully out of
`parity-session8.spec.ts` into the dedicated AXIS home
**`tests/e2e/sidebar.spec.ts`** — the **FIFTH AXIS home** (after the S197/EU
dialogs home and the S198/EV emptystates + viewheaders + filterrows homes;
the family's binding axis is the SIDEBAR CHROME measured across the shell,
not a view). A pure test-organization refactor with ZERO application
behavior change.

## §0 The context and the baseline

- The workspace: the S200 close `705e219` + the operator's session_273
  transcript commit `79f7105` on `main`, pulled fresh (a COLD clone — the
  environment re-derived per the standing recipe: bun install 510 pkgs,
  `.env` at `DATABASE_URL="file:../db/custom.db"` with `db/` at the repo
  root [the parent-workspace `.env` shadow re-verified live — the S192
  lesson-1 posture], db:push + db:seed, the pinned chromium v1243
  re-provisioned, the dev daemon :3000 + the standalone :3200 launched via
  the reaper-proof launchers; both `/api/health` green at the open; the
  bundled `.next/standalone/.env` verified `AUTH_SECRET=""`).
- The cold baseline reproduced the S200 close EXACTLY: lint ✓ · tsc ✓ ·
  unit **1799/1799 (55 files)** ✓.
- The standing chrome at the open: the drawer check GREEN (**the 161st
  consecutive** — no Tailwind v4 mobile-nav bug; the mobile navigation menu
  verified working: backdrop `oklab(0 0 0 / 0.2)` + blur(4px), 288px white
  panel, 20 links, no footer, Escape + navigate auto-close) · the desktop
  parity probe **MATCH** (all five structural checks, both hosts — the
  reference account probed read-only with the operator's credentials via
  the REF_PROBE_* env posture; the two raw diffs — the h1's `dark:`
  superset token and the statRow grid's same-utilities-different-order
  serialization — are the documented standing non-gaps) · the reference
  account persists in DARK mode (`REF-DARK` via agent-browser — the
  documented S188+ protocol record, re-confirmed live this cycle).
- **The agent-browser interactive sweep** (the operator's standing watch,
  run this cycle on BOTH hosts, sessions `s201-clone` + `s201-ref`): the
  clone login → dashboard render (the sidebar's 20 links, the greeting, the
  4 stat cards, the section cards) · the mobile journey (the 390×844
  viewport: the labeled hamburger `Open navigation menu` → the drawer's 20
  links in the 288px panel → the Tasks link navigates to `/Tasks` and the
  drawer AUTO-CLOSES, verified `DRAWER-CLOSED` by DOM probe) · the Create
  Task dialog anatomy + a full UI CRUD round-trip (create → the row renders
  → the All-filter relocation → the row menu delete → `ZERO-RESIDUE` by DOM
  text probe AND by a direct db count) · the reference login + a read-only
  navigation sweep (Tasks/Calendar/Events/Notes/Analytics all render, zero
  console errors) · the reference mobile drawer (288px panel, 20 links —
  the clone's exact match) — **zero console errors, zero findings** on both
  hosts; the four comparison frames captured
  (`201-abrowser-ref-mobile-drawer.png` +
  `201-abrowser-ref-dashboard.png` + `201-abrowser-clone-mobile-drawer.png`
  + `201-abrowser-clone-dashboard.png`, all pixel-verified non-blank).
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
(the identical count and item set the S193–S200 cycles closed — the
per-view breakdown identical too: dashboard 12, myday 3, tasks 10, calendar
0, events 0, timetable 20, assignments 7, exams 5, notes 11, flashcards 9,
practicetests 4, studygroups 5, gradetracker 5, analytics 9, files 1,
calculator 0, mathsolver 1, aiassistant 7, focustimer 2, settings 1). Every
class adjudicates to a STANDING non-gap record:

1. **The data-shaped families** (the reference account's zero-data
   empty-state CTAs vs the seeded clone — dashboard/myday/tasks/timetable/
   assignments/exams/notes/flashcards/practicetests/studygroups/
   gradetracker/analytics/focustimer rows and counts; the AI view's
   reference-only quick-action heads "Explain Concept/Study Tips/Summarize/
   Solve Problem/Translate/Essay Ideas/How can I help you study today?"
   are the zero-data empty-hero family). The closing half (the S191
   lesson-2 code check) re-verified this cycle by grep: the clone CARRIES
   each flagged CTA in its zero-data path (`myday-view.tsx:226` "Add Your
   First Task", `tasks-view.tsx:738` "No tasks yet", the assignments 337 /
   exams 327 / notes 1284 / flashcards 543 / practicetests 852 /
   studygroups 386+457 empty families).
2. **The computed-identical tag differences** (Tasks "My Lists" p-vs-h3,
   the Settings Appearance h2-vs-div — the S192 adjudications, unchanged).
3. **The AI view's heads-delta** (the reference's real h3 quick-action
   titles + hero vs the clone's span role=heading stand-ins) — the S192
   axe-clean superset adjudication, computed-identical, pinned by EP2/EP4
   (verified present in `parity-session5.spec.ts` at L764/L809).
4. **The Files "Upload" affordance** — the S183 outline port (the S192
   dark-mode-artifact adjudication).
5. **The MathSolver solution card** — the S14 aria-live superset (pinned).
6. **The dashboard 6-vs-4 grid-div count** in the rough structural probe —
   the S192-counted artifact (the probe counts ALL grid children, not stat
   cards; the deeper probe measured 4 stat cards on both hosts — re-run
   this cycle: 4/4).
7. **The focustimer clone-only heads** ("7" / "0h 25m" — the seeded stats
   vs the reference account's zero-data stats) and **the settings
   clone-only "Appearance" head** (the active tab's h2 vs the reference's
   div — the S192 tag-difference family) — data-shaped, unchanged.

**REAL GAPS: NONE.** The reference is unchanged since the S200 close — the
consolidation window is clean (the eleventh consecutive clean window; the
reference account remains zero-data, so the AI audit-rider candidates — the
message-bubble anatomy — stay unmeasurable).

## §2 The axis (why the S8-A Sidebar chrome family, why now)

- The S200 close's named next candidates, in order: a reference
  behavior-change axis (NOT found — the census is clean, eleventh window);
  the AI audit-rider message-bubble anatomy (still unmeasurable — the
  reference account is zero-data); or the next size-debt adjudication —
  "parity-session8 keeps the S8-A Sidebar chrome [4 pins] as its largest
  remaining pure cross-view family (its own future AXIS-home candidate) +
  the S8-G/S8-I already-homed stragglers per the boundary doctrine, with
  parity-session6's S6-A populated task rows [5 pins] and parity-session9's
  S9-B/Q MyDay family [5 pins] the other homeless-view candidates". This
  cycle takes the FIRST-named candidate: the S8-A AXIS-home consolidation.
- **Why S8-A and not S6-A or S9-B/Q** (the boundary doctrine, the S200 §2
  record verbatim): "a pin whose family already has a home is a reason NOT
  to move it" and "merging into an existing home is not the established
  one-file-to-new-homes split shape". The S6-A populated task rows family
  is a Tasks-view family — the tasks home (`tasks.spec.ts`) predates the
  program (the S200 §2 file-boundary adjudication kept the S8-F Tasks legs
  in place for exactly this reason); the S9-B/Q MyDay family's view home
  (`myday.spec.ts`) was created at S200/EX. Both families' views HAVE
  homes — both STAY. The S8-A family is the ONLY named candidate whose
  axis has NO home: the sidebar CHROME is a cross-view axis (the shell's
  nav surface, not a view), the S197/S198 AXIS-home kind.
- **The family is pure**: all 4 pins are read-only computed-style asserts
  on `/Dashboard` (the goto + evaluate shape — ZERO clicks, ZERO API
  writes, not even a client-state interaction): the nav-icon lucide set
  (20 links, 6 measured swaps), the active-nav gradient's violet-500 +
  indigo-500 stops (the avatarTo contract, unit-twin
  `tests/theme.test.ts:50`), the brand tagline's clip/no-truncate
  contract, and the collapse button's 34–36px band + 8px radius (the
  reference's flex-shrunk h-9 w-9 rounded-lg).
- **The residue two-direction analysis** (the S198 both-directions
  doctrine): with the home added, chunk 1's alphabetical order runs
  calendar < dashboard < mobile-navigation < myday < navigation <
  parity-session8 < **sidebar** — the new home sorts 7th/LAST, strictly
  MORE predecessors than the pins' old exposure (S8-A is parity-session8's
  FIRST describe; the pins ran after 5 files). The after-position
  direction requires the per-pin immunity proof: every S8-A pin is a
  read-only computed-style assert on SHELL CHROME that (a) issues zero
  writes — nothing the pins do can affect any other file, and (b) reads
  state that no predecessor can mutate — the nav-icon set and the collapse
  geometry are static chrome; the active-gradient pin navigates fresh to
  `/Dashboard` (the active state derives from the route) and the accent
  derives from the USER RECORD (violet — no chunk-1 file PATCHes the
  theme; the only theme mutator, theme-system.spec.ts, is a chunk-2 file
  that restores violet); the tagline pin depends on the sidebar's EXPANDED
  mount, and Playwright contexts start with EMPTY localStorage (the S11
  quirk — `sf-sidebar-collapsed` cannot leak across tests). Immune by
  construction. Direction-2: the moved pins leave NOTHING behind (zero
  writes; and the home sorts last — there are no later files in the chunk
  anyway).
- The stale-mention walk: grep found ZERO actionable `S8-A` references
  outside `parity-session8.spec.ts` in tests/ + scripts/ (the four hits
  are descriptive comments in navigation.spec.ts/accessibility.spec.ts +
  the theme.test.ts unit pin's historical citation — no dependency on the
  spec file's location); the founding header's own item (L9) gets the
  ledger re-anchor in this split.

## §3 The characterization contract (the Mode-D discipline — no honest-RED shape exists for a refactor)

A pure test-organization refactor changes no production behavior, so no
test can honestly go RED first. The Mode-D discipline (the S189–S200
record, applied verbatim):

1. **The pre-split baseline cold**: run `parity-session8.spec.ts` alone
   against the standalone build, cold — the expected outcome **62 passed =
   61 pins + the setup test** (the setup runs ONCE PER INVOCATION, not per
   file — the S199 deviation-record lesson). First-roll green REQUIRED
   before any edit.
2. **The machine-verified byte-faithfulness**: the extraction is performed
   by a SESSION-STAGED script (never committed) whose checks validate —
   (a) the title multiset (staying + moved = the original 61 titles,
   exactly), (b) the splice accounting (the blank-run arithmetic: the
   region's interior runs + the junction blanks + the spliced seam, all
   measured on fragments — the S200 lesson-3 two-layer shape), (c) the
   helper census on comment-stripped, quote/backtick-excluded text (the
   S200 lesson-1/lesson-4 rules: the `rgb` definition's own template
   literal is NOT a call; comment mentions are NOT calls), (d) the
   orphaned-definition check on BOTH sides (the staying file keeps a
   helper definition only when calls remain; the new home carries only the
   helpers it uses — the S200 lesson-2 type-gate trap).
3. **The single-file syntax checks**: a full cold run of each touched file
   INDIVIDUALLY — the expected outcomes **sidebar 5 passed = 4 pins +
   setup** and **the staying source 58 passed = 57 pins + setup**.
4. **The post-split two-file cold equivalence**: run
   `parity-session8.spec.ts` + `sidebar.spec.ts` together in ONE
   invocation — the expected outcome **62 passed = 61 pins + setup**, the
   IDENTICAL pre-split outcome.
5. **The chunk-1 composition**: chunk 1 cold (now 7 files) — **160/160**,
   first-roll.
6. **The full 5-chunk cold cert map**: **744/744 (160+275+116+101+92)**,
   every chunk first-roll, via `scripts/run-cert-chunk.sh 1..5`.

## §4 The extraction spec (the exact blocks, the exact boundaries)

- **The source**: `tests/e2e/parity-session8.spec.ts` at the S200 close —
  1,671 lines / 30 describes / 61 pins (the founding header L1–40, the
  helpers `hydrated` L42–43 + `rgb` L45, the S8-A describe **L46–106** —
  61 lines [the content-anchored measured boundary — the plan's first
  draft said L46–107/62 by hand-count; corrected to the extraction
  script's anchor-measured truth, the S200 lesson-4 pattern], 4 pins: "nav icons match the reference's lucide set (6
  swaps)", "active nav gradient ends at indigo-500 (avatarTo), not
  violet-600", "brand tagline never truncates", "collapse button is the
  reference's h-9 w-9 rounded-lg").
- **The boundaries**: the describe opens at L46 (preceded by the two blank
  lines L44–L45 after the `rgb` definition) and closes at L106 (`});`);
  L107 is the single blank before the S8-E describe at L108. The splice
  removes L46–106 plus ONE adjacent blank (the S199 lesson-2 rule — each
  removal consumes one adjacent blank; here the TRAILING L107, leaving the
  helpers + two blanks + S8-E — the pre-split shape of
  helpers→first-describe preserved).
- **The helper census** (comment-stripped, definition-excluded, the S200
  lesson-4 measured methodology — derived this cycle by the same script
  shape, to be re-measured by the extraction checks):
  - The S8-A block: `hydrated` ×3 (the gradient/tagline/collapse pins; the
    nav-icon pin gates on the inline `waitForFunction`), `rgb` ×0,
    `isRound` ×0.
  - The staying file after the splice: `hydrated` ×60 calls (definition
    KEPT — 60 callers remain), `rgb` ×25 calls (definition KEPT), no
    orphaned definitions.
  - The new home carries: the `hydrated` helper + its `type Page` import;
    NO `rgb` (zero callers), NO `isRound`.
- **The new home's founding header** (the calendar.spec.ts S200 template,
  adapted): the AXIS-home kind note (the FIFTH AXIS home — the binding
  axis is the SIDEBAR CHROME measured across the shell), the
  byte-faithful move note, the pins' contracts (unchanged by the move):
  the CHUNK 1 home (the SAME chunk as the split source — the write
  budgets hold by construction; the family issues ZERO writes), the file
  sorts LAST in the chunk's alphabetical order — strictly MORE
  predecessors than the pins' old exposure inside parity-session8's first
  describe, the after-position direction with the per-pin immunity proof
  (§2), and the family map reference
  (docs/remediation-plan-session201.md).
- **The staying file's founding header**: the S8-A ledger line (L9) keeps
  its historical record; a new MOVED note is appended to the header's
  S200/EX paragraph (the S8-B/C/D precedent): "The Sidebar chrome family
  (S8-A) MOVED to tests/e2e/sidebar.spec.ts at S201/EY (the AXIS-home
  consolidation — see docs/remediation-plan-session201.md)."
- **The chunk map**: chunk 1 gains `tests/e2e/sidebar.spec.ts` as its 7th
  file (both `scripts/e2e-chunked-cert.sh` CHUNKS + `scripts/run-cert-chunk.sh`
  CHUNK mirror — the CF6 tripwire requires both arrays byte-identical).
  The per-chunk census is UNCHANGED (the 4 pins move WITHIN chunk 1:
  160+275+116+101+92 = 744 holds).

## §5 The execution ToDo list (the detailed, sequential, verifiable steps)

1. **The pre-split baseline** (§3.1): cold `parity-session8.spec.ts` —
   expect 62 passed, first-roll. FAIL → stop, diagnose, re-plan.
2. **Write the extraction script** (session-staged under /tmp, never
   committed — the standing convention): reads parity-session8.spec.ts,
   extracts L46–107 + builds the new home (header + hydrated helper + the
   block byte-faithfully), splices the staying file (block + one adjacent
   blank + the founding-header MOVED note), and runs the machine checks
   (§3.2 a–d). FAIL → restore from git, fix the CHECK DESIGN (the S198
   lesson-3 pattern — check corrections never touch the shipped spec
   content), re-run from a clean restore.
3. **The single-file syntax checks** (§3.3): cold sidebar.spec.ts alone
   (expect 5) + the staying parity-session8.spec.ts alone (expect 58).
4. **The post-split two-file equivalence** (§3.4): both files in one
   invocation — expect 62, the identical pre-split outcome.
5. **The chunk-map sync**: update the CHUNKS arrays in BOTH cert scripts +
   the re-tag header blocks (the S201/EY re-tag: census UNCHANGED at 744,
  the change ORGANIZATIONAL — chunk 1 gains sidebar.spec.ts as its 7th
   file; the spec-file census 47 → 48; sidebar sorts LAST — the
   after-position direction, the per-pin immunity proof recorded; ZERO
   budget units move). Verify the CF6 tripwire (both arrays
   byte-identical) + add the S201/EY successor note to the tripwire
   comment chain.
6. **The early gates**: `bun run lint` + `bun run typecheck` + the
   script-conventions tripwire (`bunx vitest run tests/script-conventions.test.ts`
   — the 138/138 shape; the Expected-line assertion is UNTOUCHED this
   cycle since the census holds).
7. **The doc-chain lockstep** (§8 — every site, same commit).
8. **The full gates**: `bun run lint` + `bun run typecheck` + `bun run
   test` (1799/1799) + kill :3200 by port + `bun run build` (verify the
   bundled `.next/standalone/.env` AUTH_SECRET="") + the 5-chunk cold
   cert map via `scripts/run-cert-chunk.sh 1..5` (744/744, every chunk
   first-roll).
9. **The closing chrome**: re-boot :3200, the drawer check (expect the
   162nd consecutive GREEN) + the desktop parity probe (expect MATCH).
10. **The evidence capture** (§7): `scripts/capture-s201-evidence.mjs`
    (committed) — the six frames, every contract DOM-asserted before the
    shot, every frame pixel-verified non-blank.
11. **The census re-derivation** (by `--list`, never estimated): 740
    tests in 49 files = 739 chromium in **48 spec files** + the setup
    test.
12. **The README Session-201 row** (after the gates — every number real).
13. **The PAD v1.3.109 revision block** + the worklog Session-212 entry +
    the plan §9 close + the session transcript `docs/session_274.md`.
14. **The pre-commit checks**: the `.env.example` verification (no env
    changes — byte-identical contract re-verified), the secret scan over
    the staged diff, the staging review (the session-staged extraction
    script NEVER committed), commit (Conventional Commits, `main` only),
    push via the SSH wrapper (dry-run → push → remote verified → key
    shredded).

## §6 The gates (the definition of done)

- lint ✓ · tsc ✓ · unit 1799/1799 (55 files — UNCHANGED: a
  test-organization cycle) · build ✓ (the :3200 daemon killed by port
  FIRST; the bundled env verified) · the 5-chunk cold cert map 744/744
  (160+275+116+101+92, every chunk first-roll) · the closing chrome (the
  drawer check 162nd GREEN + the parity probe MATCH) · the six evidence
  frames + the four agent-browser comparison frames ok:true · the census
  re-derived by `--list`: 739 chromium in 48 spec files + the setup test ·
  the doc-chain lockstep complete (§8) · zero residue on both hosts.

## §7 The evidence (the self-verifying frames + the dev-server set)

Under `docs/screenshots/` (the S200 six-frame shape, this cycle's
families):

1. **`201-sidebar.png`** — the sidebar family's contracts on the re-booted
   :3200 standalone (S8-A's contracts DOM-asserted before the shot: the 20
   nav links with the measured lucide set, the active gradient's two
   stops, the untruncated tagline, the collapse button's geometry band).
2. **`201-devserver-dashboard.png`** — the dev server :3000 dashboard (the
   sidebar surface at 1440×900).
3. **`201-devserver-sidebar.png`** — the dev server :3000 sidebar
   close-up-viewport frame documenting the moved family's surface (the
   collapsed toggle interaction riding the client-state only).
4. **`201-devserver-mobile-drawer.png`** — the dev server :3000 mobile
   drawer at 390×844 (the operator's standing mobile-nav watch).
5. The four agent-browser comparison frames (captured at the open, §0):
   `201-abrowser-ref-mobile-drawer.png` +
   `201-abrowser-ref-dashboard.png` + `201-abrowser-clone-mobile-drawer.png`
   + `201-abrowser-clone-dashboard.png`.

Every frame is DOM-asserted BEFORE the shot and pixel-verified non-blank
after (the standing evidence discipline); the capture script
`scripts/capture-s201-evidence.mjs` is committed with the cycle.

## §8 The doc-chain lockstep (every site, same commit)

- **AGENTS.md**: the test:e2e census line (47 → 48 spec files; the 744 +
  the chunk map UNCHANGED) + the S201 lessons block (the cycle's lessons,
  appended at the end of the lessons chain).
- **CLAUDE.md**: the e2e line's S200/EX tail note extended with the
  S201/EY AXIS-home note (the sidebar chrome family moved; the spec-file
  census 47 → 48).
- **README.md**: the tree diagram (47 → 48 spec files) + the Session-201
  row (after the gates).
- **Project_Architecture_Document.md**: the v1.3.109 revision block (the
  census anchor + the cycle record).
- **omni-study1_SKILL.md**: the §2 header census site (47 → 48, the
  S201/EY note) + the §11 green-state re-anchor (the AXIS-home census).
- **vitest.config.ts**: the header re-tag (the S201/EY re-anchor — the
  unit census UNCHANGED; the spec-file census 47 → 48).
- **scripts/e2e-chunked-cert.sh** + **scripts/run-cert-chunk.sh**: the
  S201/EY re-tag blocks + the CHUNKS arrays (chunk 1 +sidebar.spec.ts).
- **tests/script-conventions.test.ts**: the S201/EY re-tag comment entry
  in the chronological ledger (the Expected-line assertion UNTOUCHED —
  the census holds).
- **worklog.md**: the Session-212 entry.
- **docs/session_274.md**: the formal session transcript.
- **docs/remediation-plan-session201.md**: this plan (§9 closed at the
  cycle close).

## §9 The close and the next candidates (filled at the cycle close)

- **The execution outcome**: every step green — the pre-split baseline cold
  (**62 passed = 61 pins + setup, first-roll**), the machine-verified
  byte-faithfulness (ALL checks green on the first extraction run: title
  multiset 61 = 57+4, the blank arithmetic [79 orig → 75 stay, 4 removed],
  the helper census hydrated 3/60 + rgb 0/25 + isRound 0/0, no orphaned
  definitions on either side, the describe census 30 = 29+1), the
  single-file syntax checks (**sidebar 5 passed = 4 pins + setup** + the
  **staying source 58 passed = 57 pins + setup**), the post-split two-file
  equivalence (**62 passed, first-roll** — the identical outcome), the
  chunk-1 composition **160/160 cold (7 files)**, the full 5-chunk cold
  cert map **744/744** (160+275+116+101+92, every chunk first-roll),
  lint ✓ · tsc ✓ · unit 1799/1799 ✓ (the tripwire 138/138; the Expected
  line UNTOUCHED — the census holds) · build ✓ (the :3200 daemon killed
  by port first; the bundled `.next/standalone/.env` verified
  `AUTH_SECRET=""`) · the closing chrome (the drawer check **162nd**
  GREEN + the parity probe MATCH) · the four evidence frames + the four
  agent-browser comparison frames ok:true. The census re-derived by
  `--list`: 740 tests in 49 files = 739 chromium in **48 spec files** +
  the setup test — exactly as planned.
- **The deviation record**: ONE check-design correction inside the
  EVIDENCE capture script (not the extraction): the aside width read
  `getComputedStyle().width` — a STRING — through `Math.round`,
  producing NaN serialized as null (the frame's first run showed
  ok:false with null contracts; the aside was present and healthy —
  corrected to `getBoundingClientRect().width`, a number; the S198
  lesson-3 pattern, never touching shipped content). ONE plan
  correction: §4's hand-counted boundary (L46–107, "62 lines") was off
  by one — the extraction script's content anchors measured the truth
  (L46–106, 61 lines) and the plan was corrected BEFORE execution (the
  S200 lesson-4 pattern). The extraction itself landed first-roll: all
  machine checks green on the first run, zero re-runs of the split, and
  the spec content never touched by a correction.
- **The next-cycle candidates (S202)**: a reference behavior-change axis
  if the next census finds one; the AI audit-rider candidates (the
  message-bubble anatomy when a populated reference account becomes
  measurable); or the next size-debt adjudication — the remaining pure
  families in the coverage files are thin (parity-session8 keeps the
  S8-AC measurement-batch trio [11 pins] + the S8-P mixed axis [6 pins]
  + every hardening leg, all STAY per the boundary doctrine;
  parity-session6's S6-A and parity-session9's S9-B/Q stay with their
  views' homes), so the natural S202 axis is the standing audit rotation
  (the recent-changes axis + a fresh family audit) or the S200 close's
  "extends the consolidation program's steady state" — the consolidation
  program has now homed every homeless pure view family and every
  homeless pure cross-view chrome family; otherwise the S201 close
  stands as the consolidation program's natural end state.

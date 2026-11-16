# The S197 remediation plan — the dialog catch-up family e2e consolidation (Batch EU: the S196 close's first named next candidate, the FIRST axis home)

The axis: the fresh **20-view reference census** (the standing S192 instrument
`scripts/ref-census-s192.mjs`) flagged **112 raw deltas (17 auto-classed
data-shaped + the identical 95 requiring adjudication)** — the identical count
and item set the S193/S194/S195/S196 cycles adjudicated — and every one
adjudicates to a standing non-gap class (the ledger in §1). The reference is
UNCHANGED since the S196 close — **the seventh consecutive clean window**. Per
the S196 close's named next candidates and the S189–S196 size-debt doctrine,
this cycle executes the **dialog catch-up family e2e consolidation**: the four
pure create-dialog-parity describes (S174/DX4 holidays + S175/DY1 subjects +
S176/DZ1 events + S176/DZ3 tasks) split byte-faithfully out of
`parity-session7.spec.ts` into the dedicated **`tests/e2e/dialogs.spec.ts`**
home — **the FIRST axis home** (the family's binding axis is the dialog
ANATOMY, not a view: four dialogs across Settings/Events/Tasks). The tenth
dedicated home overall after tasks/notes/flashcards/timetable/files/analytics/
gradetracker/practicetests/studygroups. A pure test-organization refactor with
ZERO application behavior change.

## §0 The context and the baseline

- The workspace: the S196 close `8b3ea2c` + the operator's session_265
  transcript commit `7944948` on `main`, pulled fresh (a COLD clone — the
  environment re-derived per the standing recipe: `bun install` [510 pkgs],
  `.env` created from `.env.example` at `DATABASE_URL="file:../db/custom.db"`
  with `db/` at the repo root, `db:push` + `db:seed`, the pinned chromium
  v1243 re-provisioned, the dev daemon :3000 + the standalone :3200 launched
  via the reaper-proof launchers).
- The cold baseline reproduced the S196 close EXACTLY: lint ✓ · tsc ✓ ·
  unit **1799/1799 (55 files)** ✓.
- The standing chrome at the open: the drawer check GREEN (**the 153rd
  consecutive** — no Tailwind v4 mobile-nav bug; the mobile navigation menu
  verified working: backdrop `oklab(0 0 0 / 0.2)` + blur(4px), 288px white
  panel, 20 links, no footer, Escape + navigate auto-close, appbar z-40
  fixed) · the desktop parity probe **MATCH** (all five structural checks,
  both hosts — the reference account probed read-only with the operator's
  credentials via the REF_PROBE_* env posture) · the reference account
  persists in DARK mode (`html.dark`, body `rgb(10,10,10)` — the documented
  S188+ protocol record; re-confirmed live this cycle via agent-browser).
- The agent-browser interactive sweep (the operator's standing watch, run
  this cycle on BOTH hosts): the clone login → dashboard render, the mobile
  drawer open/navigate/auto-close journey (Tasks link → `/Tasks` → drawer
  closed), the Create Task dialog anatomy + a full UI CRUD round-trip
  (create → row render → menu delete → zero residue), the reference login +
  read-only navigation sweep (Tasks/Calendar/Events/Notes/Analytics/Settings
  all render) — **zero console errors, zero findings**.
- The environment contract re-verified against the operator's standing
  instructions: `.env` at `DATABASE_URL="file:../db/custom.db"` with `db/`
  at the repo root (freshly created) · the vitest + playwright configs
  present and green (1799 unit + 744 e2e — the suites the operator asked to
  "add" are present, green, and this cycle extends the e2e organization) ·
  `.env.example` matching the env surface (no env changes this cycle).

## §1 The census and the adjudication ledger (what was measured, what it adjudicated to)

The fresh 20-view census (both hosts, the reference account read-only —
login + navigation only, zero rows created or deleted) flagged 112 raw
deltas; 17 auto-classed data-shaped, 95 requiring the standing adjudication
(the identical count and item set the S193–S196 cycles closed). Every class
adjudicates to a STANDING non-gap record:

1. **The data-shaped families** (the reference account's zero-data
   empty-state CTAs vs the seeded clone — dashboard/myday/tasks/timetable/
   assignments/exams/notes/flashcards/practicetests/studygroups/
   gradetracker/analytics/focustimer rows and counts). The closing half (the
   S191 lesson-2 code check) re-verified this cycle by grep: the clone
   CARRIES each flagged CTA in its zero-data path (`myday-view.tsx:226`
   "Add Your First Task", `tasks-view.tsx:738` "No tasks yet",
   `assignments-view.tsx:337` "No assignments yet", `exams-view.tsx:327`
   "No exams found", `flashcards-view.tsx:516/543`, `practicetests-view.tsx:852`,
   `studygroups-view.tsx:386/457`).
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

**REAL GAPS: NONE.** The reference is unchanged since the S196 close — the
consolidation window is clean (the seventh consecutive clean window; the
reference account remains zero-data, so the AI audit-rider candidates — the
message-bubble anatomy — stay unmeasurable).

## §2 The axis (why the dialog catch-up family, why now)

- `parity-session7.spec.ts` remains the suite's second-largest file at
  **1,302 lines / 11 describes / 36 pins** after the S189 (notes, 49 pins),
  S191 (flashcards, 18), S193 (timetable, 15), S194 (files, 7), S195
  (analytics + gradetracker, 6), and S196 (studygroups + practicetests, 6)
  splits — the default landing spot for six generations of pins. (The
  largest file remains `resilience.spec.ts` at 2,359 lines — a COVERAGE-AXIS
  file whose describes are failure-state/edge-case axes, not view families;
  the view-dedicated convention does not apply there — the S194 lesson 3.)
- The S196 close's named next candidates, in order: **the dialog catch-up
  family (S174/DX4 + S175/DY1 + S176/DZ1 + S176/DZ3)** or the cross-view
  families (S184/EH + S186/EJ + S187/EK). This cycle takes the FIRST named
  candidate.
- The complete-family scope (the S189–S196 precedent: each home holds every
  pure describe for its family in the split source):
  - **S174/DX4** (1 pin / 72 lines — the holidays create-dialog: the
    measured "Name */Start Date */End Date */Type" labels, range fields,
    type selector, [Cancel][Add Holiday] footer; read-only anatomy, never
    submits).
  - **S175/DY1** (1 pin / 75 lines — the subject create-dialog: the
    asterisked "Subject Name *" label, the "e.g., Mathematics" placeholder,
    the 17-swatch 32px palette, teacher/room fields, [Cancel][Add Subject]
    footer; read-only anatomy, never submits).
  - **S176/DZ1** (2 pins / 120 lines — DZ1a the events create-dialog
    anatomy: the placeholder trio, the six-swatch double-ring palette, the
    reminders ROWS control, the five-option repeat select, the "Create
    Event" submit copy [read-only]; DZ1b the reminders round-trip: a
    Date.now-stamped event created through the real dialog, edited, and
    self-DELETed — zero residue).
  - **S176/DZ3** (1 pin / 16 lines — the tasks create-dialog placeholder
    trio "Task name..."/"Add a subtask..."/"Add notes..."; read-only).
- **The family's binding axis is the DIALOG, not any view**: the four
  describes cover FOUR different views (Settings×2, Events, Tasks) — the
  home is the first AXIS home (`dialogs.spec.ts`), the shape the S196 close
  itself named ("axis homes rather than view homes").
- The other S196-close candidates, adjudicated: the reference
  behavior-change axis (NOT found — the census is clean, seventh window);
  the AI audit-rider message-bubble anatomy (still unmeasurable — the
  reference account is zero-data); the cross-view families (S184/EH +
  S186/EJ + S187/EK — the NEXT cycle's natural candidate after this one).

## §3 The characterization contract (the Mode-D discipline — no honest-RED shape exists for a refactor)

1. **The pre-split baseline**: `parity-session7.spec.ts` cold-green at
   **36 pins** (verified by `--list`, never estimated — the S189 lesson 2;
   the `--list` census reads 37 tests = 36 pins + the setup test).
2. **The byte-faithfulness machine checks** (the S189–S196 doctrine): (a)
   each moved block byte-identical to its source range INCLUDING its leading
   comment run (the comment-block ownership walk — S174/DX4's run 346–369,
   S175/DY1's run 420–443, S176/DZ's run 630–642 [shared by DZ1+DZ3, both
   moving — the DZ2 studygroups mention inside it is historical narrative,
   accurate]; S176/DZ3 carries NO leading comment run); (b) the title
   multiset (the moved pins' titles exactly the pre-split members); (c) the
   describe/pin arithmetic: 4 moved + 7 staying = 11 before; 5 moved + 31
   staying = 36 before.
3. **The post-split equivalence**: the two-file cold run
   (`parity-session7.spec.ts` + `dialogs.spec.ts`) reproducing the pre-split
   outcome — 36 pins green, first-roll.
4. **The chunk-2 composition cold** (16 files, expected 275 — the DZ1b
   write units [1 POST + 1 PATCH + 1 DELETE through the real UI] ride WITH
   the pin inside chunk 2; the chunk is the budget boundary, so the chunk's
   write budget is unchanged by construction).
5. **The 5-chunk cold cert map: 744/744 UNCHANGED** (a pure reorganization
   — no pins added, none removed; the Expected lines hold 160+275+116+
   101+92).

## §4 The extraction spec (the exact blocks, the exact boundaries)

| # | Describe | Source lines (1-indexed, inclusive) | Pins |
|---|----------|-------------------------------------|------|
| 1 | `S174/DX4 · the holidays create-dialog parity catch-up + the start/end/type field port` | 346–417 (comment 346–369; describe 370–417) | 1 |
| 2 | `S175/DY1 · the subject create-dialog parity catch-up + the teacher/room field port` | 420–494 (comment 420–443; describe 444–494) | 1 |
| 3 | `S176/DZ1 · the events create-dialog parity catch-up + the reminders-rows port` | 630–749 (comment 630–642; describe 643–749) | 2 |
| 4 | `S176/DZ3 · the tasks create-dialog placeholder catch-up` | 752–767 (no leading comment; describe 752–767) | 1 |

- **283 source lines move** across four blocks (the fourth multi-block
  extraction after S193's four, S195's four, and S196's five).
- The new file's header follows the `studygroups.spec.ts` template: the
  consolidation note (cycle, boundary decisions, contracts), the local
  `hydrated` helper (the moved blocks' ONLY file-local dependency — verified
  by the helper census: DX4 1 hit, DY1 1 hit, DZ1 2 hits, DZ3 1 hit; the one
  `rgb(` hit inside S176/DZ1 is the STRING LITERAL
  `"rgb(255, 255, 255) 0px 0px 0px 2px"` inside an assertion — the S193/S196
  string-literal false-positive class, NOT a call to the helper), and the
  import line. The staying file's `rgb` helper remains used by the staying
  S7-B describe — no orphan.
- `parity-session7.spec.ts` keeps **7 describes / 31 pins** (~1,020 lines)
  and its header comment re-anchors (the DX4/DY1/DZ1/DZ3 moved-family notes
  join the founding ledger).
- **The S82/AI1 orphaned comment block (330–343) STAYS** — an orphaned
  comment from the S191 flashcards split documenting describes that moved
  then; "an orphaned comment block from a PRIOR split is not yours to move"
  (the S195 lesson-4 precedent).

### The boundary adjudications (the S189–S196 doctrine)

- **The dialog-family strays outside the split source STAY**: the S173/DW2
  grades create-dialog pin lives in the gradetracker home (the S195 split —
  the consolidation boundary follows the FILE, not the family: the S189/S191
  lesson); the S171/DU2 + S176/DZ2 dialogs live in the studygroups home
  (S196); the S172/DV2 dialog lives in the practicetests home (S196); the
  a11y-sweep dialog legs, the dark-mode washes, the navigation legs, and the
  resilience CB8 legs stay in their coverage-axis homes. A pin's VIEW is not
  its FAMILY — and a pin's TOPIC (a dialog) is not its family either when
  the pin already lives in a dedicated home.
- **The mixed describe STAYS**: S175/DY4 (the gradetracker/settings-CRUD +
  AlertDialog-confirm journeys — 4 pins) is a CRUD-journey family whose
  AlertDialog confirmations are DELETION guards, not create-dialog anatomy
  ports — MIXED, stays per the S78/AE precedent.
- **The residue two-direction analysis** (the S193 both-directions shape):
  `dialogs.spec.ts` sorts **3rd** in chunk 2's alphabetical order
  (a11y-sweep < analytics < dialogs < files) — strictly FEWER predecessors
  than the split source's 8th position (the S194/S195 SAFE direction).
  Direction-1 (what the moved pins see from a11y-sweep + analytics): the
  three read-only anatomy pins are immune by construction; DZ1b's
  Date.now-stamped unique name + self-delete make it immune to any
  predecessor state. Direction-2 (what later files see): DZ1b self-deletes
  (its own `Delete ${name}` UI leg + the `toHaveCount(0)` assert), and it
  now runs EARLIER (3rd vs 8th) — a strict reduction in the residue window;
  no spec references the DZ1b row outside its own pin (grep-verified).
- **The budget map**: the DZ1b write units (event POST + PATCH + DELETE)
  move WITH the pin inside chunk 2 — the chunk's total POST/PATCH/DELETE
  count is UNCHANGED (the same 16 files, the same pins); the register
  budget is untouched (no moved pin registers).

## §5 The execution ToDo list (the detailed, sequential, verifiable steps) — EXECUTED, all steps green first-roll except the recorded lesson-2 correction

1. **Pre-split baseline** (cold): `bash scripts/e2e-cold-reset.sh` (kills
   the :3100 listener + `rm -f db/e2e.db`) → `bunx playwright test
   tests/e2e/parity-session7.spec.ts --project=chromium` → **36 pins
   passed, first-roll** (the S155/DD3 cold-reset-first doctrine for direct
   invocations).
2. **Write the extraction script** (`scripts/extract-s197.py`, session-
   staged, NEVER committed — the S194/S195/S196 precedent): reads
   `parity-session7.spec.ts`, cuts the four blocks at the verified
   boundaries, writes `tests/e2e/dialogs.spec.ts` (header note + `hydrated`
   helper + import + the four blocks in declaration order, blank-line
   separated), rewrites `parity-session7.spec.ts` (the four blocks removed,
   the blank-separator shapes normalized, the header ledger note added),
   and machine-verifies: (a) block containment (each destination block
   byte-identical to its source range); (b) the source-negative (no moved
   describe title remains in the source); (c) the title multiset (the union
   of the two files' pin titles == the pre-split multiset); (d) the
   describe/pin arithmetic (4+7 describes, 5+31 pins); (e) the helper
   census (the new file's `hydrated` count == the moved blocks' count; the
   staying file's `rgb` still has consumers).
3. **Single-file syntax check**: `bunx playwright test tests/e2e/
   dialogs.spec.ts --project=chromium --list` (the S195 lesson-3 — a
   multi-file `--list` can mask a single file's syntax error) → 5 tests.
4. **Post-split equivalence** (cold): `bash scripts/e2e-cold-reset.sh` →
   `bunx playwright test tests/e2e/parity-session7.spec.ts tests/e2e/
   dialogs.spec.ts --project=chromium` → **36 passed, first-roll** (the
   identical outcome to the pre-split baseline).
5. **Chunk-map sync** (both scripts): `scripts/e2e-chunked-cert.sh` +
   `scripts/run-cert-chunk.sh` — add `tests/e2e/dialogs.spec.ts` to chunk 2
   (16th file), add the S197/EU re-tag comment block to each header (the
   Expected line UNCHANGED at 160+275+116+101+92 = 744), keep the two
   CHUNKS arrays byte-identical (the CF6 tripwire).
6. **Tripwire comment chain**: `tests/script-conventions.test.ts` — the
   S196 comment block gains the S197/EU successor note (the census
   UNCHANGED at 744; the spec-file census 38 → 39; dialogs sorts 3rd —
   strictly fewer predecessors, the S194/S195 direction; the DZ1b write
   units ride with the pin inside chunk 2).
7. **Doc-chain lockstep** (§8) — every census site re-anchored in the same
   commit.
8. **Full gates**: `bun run lint` → `bun run typecheck` → `bun run test`
   (1799/1799 — the script-conventions tripwire machine-verifying the cert
   edits) → kill the :3200 daemon by port (the S191 lesson) → `bun run
   build` (verify the bundled `.next/standalone/.env` carries
   `AUTH_SECRET=""`) → the full 5-chunk cold cert map
   (`bash scripts/e2e-chunked-cert.sh`) → **744/744, every chunk
   first-roll**.
9. **Closing chrome**: the drawer check (the 154th consecutive) + the
   desktop parity probe MATCH.
10. **Evidence frames** (§7) — captured on the re-booted :3200 standalone +
    the dev server :3000.
11. **The session transcript** (`docs/session_266.md`) + the worklog
    Session-208 entry + this plan's §9 closed.

## §6 The gates (the definition of done)

lint ✓ · tsc ✓ · unit 1799/1799 (55 files) ✓ · build ✓ · the 5-chunk cold
cert map 744/744 (160+275+116+101+92, the chunk-2 composition 275/275 cold
at 16 files) · the closing chrome (the drawer check GREEN + the parity
probe MATCH) · the doc-chain lockstep complete (§8) · zero residue on both
hosts (the reference account read-only; the clone's demo account left
clean).

## §7 The evidence (the four self-verifying frames + the dev-server set)

- `197-dialogs-holidays.png` — the S174/DX4 contracts DOM-asserted before
  the shot on the :3200 standalone (the Holidays tab → Add Holiday → the
  "Name */Start Date */End Date */Type" labels + the [Cancel][Add Holiday]
  footer — Escape-closed WITHOUT submitting).
- `197-dialogs-subjects.png` — the S175/DY1 contracts (the Subjects tab →
  Add Subject → the "Subject Name *" label + the 17-swatch palette + the
  [Cancel][Add Subject] footer — Escape-closed).
- `197-dialogs-events.png` — the S176/DZ1a contracts (Events → New Event →
  the placeholder trio + the six-swatch palette + the reminders row +
  "Create Event" — Escape-closed).
- `197-dialogs-tasks.png` — the S176/DZ3 contracts (Tasks → Add Task → the
  placeholder trio — Cancel-closed).
- The dev-server frames (the operator's standing request): the :3000
  dashboard + one dialog open + the mobile drawer.
- All frames pixel-verified non-blank (the standing evidence discipline).

## §8 The doc-chain lockstep (every site, same commit)

AGENTS (the census line 38 → 39 spec files + the **S197 lessons** block) ·
CLAUDE (the e2e line's dialogs-home note) · README (the tree diagram +
the Session-197 row + the badge re-verify) · the SKILL census sites (§2
header + §3 config note + §11 green-state line) · the vitest header ·
the cert scripts' re-tags (BOTH) + the tripwire comment chain · the PAD
**v1.3.105** revision block · the worklog **Session-208** entry ·
`docs/remediation-plan-session197.md` (this plan, §5 executed, §9 closed)
+ `docs/session_266.md` · `.env.example` re-verified (no env changes this
cycle).

## §9 The close and the next candidates (filled at the cycle close)

- **The execution outcome**: every step green — the pre-split baseline cold
  (37 passed = 36 pins + setup, first-roll), the machine-verified
  byte-faithfulness (all checks green), the post-split two-file equivalence
  (37 passed, first-roll), the chunk-2 composition **275/275 cold (16
  files)**, the full 5-chunk cold cert map **744/744** (160+275+116+101+92,
  every chunk first-roll), lint ✓ · tsc ✓ · unit 1799/1799 ✓ · build ✓ ·
  the closing chrome (the drawer check **154th** GREEN + the parity probe
  MATCH) · the seven evidence frames ok:true.
- **The deviation record**: ONE mid-execution correction (the S197
  lesson-2): the new home's header narrated the measured labels as
  `"Name */Start Date */End Date */Type"` — the FIRST `*/` closed the
  block comment, the rest parsed as code, and the single-file `--list`
  read ZERO tests; fixed by narrating the asterisked labels as words, the
  extraction re-run clean (the source restored + re-split in one pass).
  ONE check-design correction inside the extraction script: the blank-run
  check redesigned from an absolute style rule to an accounting comparison
  against the original's run inventory (the pre-existing 3-blank
  separators are not normalized).
- **The next-cycle candidates (S198)**: a reference behavior-change axis
  if the next census finds one; the AI audit-rider candidates (the
  message-bubble anatomy when a populated reference account becomes
  measurable); or the next size-debt adjudication — the **cross-view
  family** (S184/EH EmptyState + S186/EJ view-header + S187/EK
  filter-row — the second axis home), leaving parity-session7 at 1,017
  lines / 7 describes / 31 pins with the S7-B/S78/S81/S175-DY4 mixed +
  batch-lineage families that stay per the boundary doctrine.
- **Suggested next cycle (S198)**: a reference behavior-change axis if the
  next census finds one; the AI audit-rider candidates (the message-bubble
  anatomy when a populated reference account becomes measurable); or the
  next size-debt adjudication — the **cross-view family** (S184/EH
  EmptyState + S186/EJ view-header + S187/EK filter-row — the second axis
  home the S196 close named), leaving parity-session7 at ~1,020 lines / 7
  describes / 31 pins with the S7-B/S78/S81/S175-DY4 mixed + batch-lineage
  families that stay per the boundary doctrine.

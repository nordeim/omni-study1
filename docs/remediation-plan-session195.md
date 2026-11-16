# The S195 remediation plan — the analytics + gradetracker two-family e2e consolidation (Batch ES: the last S7-era founding strays + their same-file siblings)

The axis: the fresh **20-view reference census** (the standing S192 instrument
`scripts/ref-census-s192.mjs`) flagged 112 raw deltas (17 auto-classed
data-shaped + 95 requiring adjudication — the identical count and item set the
S193 and S194 cycles adjudicated) and **every one adjudicates to a standing
non-gap class** (the ledger in §1) — the reference is UNCHANGED since the S194
close, so the clean behavior-change-free window the S189 doctrine requires for
a consolidation cycle is CONFIRMED (the fifth consecutive clean window). Per
the S194 close's named next candidate and the S189/S191/S193/S194 size-debt
doctrine, this cycle executes the **analytics + gradetracker two-family e2e
consolidation**: the last S7-era founding strays (the S7-D Analytics describe
+ the S7-E Grade Tracker describe) PLUS their same-file pure siblings (the
S127/CB13 Analytics describe + the S173/DW2 grades-dialog describe) split
byte-faithfully out of `parity-session7.spec.ts` into the dedicated
`tests/e2e/analytics.spec.ts` and `tests/e2e/gradetracker.spec.ts` homes (the
view-dedicated convention, the sixth and seventh applications after
tasks/notes/flashcards/timetable/files). A pure test-organization refactor
with ZERO application behavior change.

## §0 The context and the baseline

- The workspace: the S194 close `fb156be` + the operator's session_261
  transcript commit `dbf8673` on `main` (a WARM workspace — node_modules,
  `db/custom.db`, the :3000 dev server, and the :3200 standalone survivor
  all present; the doc-only `dbf8673` diff verified against `src/` — zero
  source files — so the surviving :3200 daemon is BYTE-CURRENT per the S193
  lesson-1 verify-and-reuse procedure: `/api/health` ok + the tree-diff
  empty).
- The cold baseline reproduced the S194 close EXACTLY: lint ✓ · tsc ✓ ·
  unit **1799/1799 (55 files)** ✓.
- The standing chrome at the open: the drawer check GREEN (**the 149th
  consecutive** — no Tailwind v4 mobile-nav bug; backdrop `oklab(0 0 0 /
  0.2)` + blur(4px), 288px white panel, 20 links, no footer, Escape +
  navigate auto-close, appbar z-40 fixed) · the desktop parity probe
  **MATCH** (all five structural checks, both hosts — the reference account
  probed read-only with the operator's credentials via the REF_PROBE_* env
  posture) · the s116 reference resweep **ok:true, 9/9 invariants both
  hosts, probeCleanup ok** (zero residue).
- The environment contract re-verified against the operator's standing
  instructions: `.env` at `DATABASE_URL="file:../db/custom.db"` with `db/`
  at the repo root · the vitest + playwright configs present and green ·
  `.env.example` matching the env surface (no env changes this cycle).

## §1 The census and the adjudication ledger (what was measured, what it adjudicated to)

The fresh 20-view census (both hosts, the reference account read-only —
login + navigation only, zero rows created or deleted) flagged 112 raw
deltas; 17 auto-classed data-shaped, 95 requiring the standing adjudication
(the identical count and item set the S193 and S194 cycles closed). Every
class adjudicates to a STANDING non-gap record:

1. **The data-shaped families** (the reference account's zero-data
   empty-state CTAs vs the seeded clone — dashboard/myday/tasks/timetable/
   assignments/exams/notes/flashcards/practicetests/studygroups/
   gradetracker/analytics/focustimer rows and counts). The closing half (the
   S191 lesson-2 code check) re-verified this cycle by grep: the clone
   CARRIES each flagged CTA in its zero-data path (`myday-view.tsx:226`
   "Add Your First Task", `tasks-view.tsx:738` "No tasks yet",
   `assignments-view.tsx:337` "No assignments yet", `exams-view.tsx:327`
   "No exams found", `notes-view.tsx:1284`, `flashcards-view.tsx:516/717`
   "No decks yet"/"Select a deck", `practicetests-view.tsx:852` "No practice
   tests yet", `studygroups-view.tsx:386` "No study groups" + `:457`/`:465`
   "Select a group").
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

**REAL GAPS: NONE.** The reference is unchanged since the S194 close — the
consolidation window is clean (the fifth consecutive clean window; the
reference account remains zero-data, so the AI audit-rider candidates — the
message-bubble anatomy — stay unmeasurable).

## §2 The axis (why the analytics + gradetracker families, why now)

- `parity-session7.spec.ts` remains the suite's second-largest file at
  **1,724 lines / 20 describes / 48 pins** after the S189 (notes, 49 pins),
  S191 (flashcards, 18 pins), S193 (timetable, 15 pins), and S194 (files, 7
  pins) splits — the default landing spot for six generations of pins. (The
  largest file remains `resilience.spec.ts` at 2,359 lines — a COVERAGE-AXIS
  file whose describes are failure-state/edge-case axes, not view families;
  the view-dedicated convention does not apply there — the S194 lesson 3.)
- The S194 close's named next candidate: **the S7-D/S7-E analytics/
  gradetracker strays — the last S7-era founding strays** (the header's
  founding ledger: S7-A moved at S191, S7-C at S193, S7-F at S189, S183/EG
  at S194; S7-B is MIXED [studygroups + practicetests] and stays per the
  boundary doctrine). The S194 close also recorded "the family is small
  enough that a multi-family cycle or a different axis may adjudicate
  higher" — this cycle is that multi-family shape: TWO view homes in one
  characterization cycle.
- The complete-family scope (the S189/S191/S193/S194 precedent: each home
  holds EVERY pure describe for its view in the split source):
  - **The Analytics family**: the S7-D founding describe (3 pins / 57
    lines — the icon-block stat cards with the four measured 48px tinted
    blocks, the fraction values + completion-rate subs, the 7-day chart
    titles) + the S127/CB13 describe (1 pin / 21 lines — the Assignments
    card's true-average-progress derivation, the "0/6" seeded fraction).
    Both pure /Analytics: 2 describes / 4 pins / 78 lines.
  - **The GradeTracker family**: the S7-E founding describe (1 pin / 18
    lines — the award/target/chart-column summary icons at w-8 h-8) + the
    S173/DW2 describe (1 pin / 73 lines — the grades create-dialog anatomy:
    the "Add New Grade" title, the Max Score/Weight labels, the capitalized
    type select, the native date input defaulting to today, the
    Cancel-before-submit footer order). Both pure /GradeTracker: 2
    describes / 2 pins / 91 lines.
- The view-dedicated convention: `tasks.spec.ts` (S167), `notes.spec.ts`
  (S189/EM), `flashcards.spec.ts` (S191/EO), `timetable.spec.ts` (S193/EQ),
  `files.spec.ts` (S194/ER) — the analytics and gradetracker homes are the
  sixth and seventh applications of the pattern, and the first TWO-family
  cycle (the S194 close's recorded multi-family adjudication).
- The other S193-close candidates, adjudicated: the reference
  behavior-change axis (NOT found — the census is clean, fifth window); the
  AI audit-rider message-bubble anatomy (still unmeasurable — the reference
  account is zero-data).

## §3 The characterization contract (the Mode-D discipline — no honest-RED shape exists for a refactor)

1. **The pre-split baseline**: `parity-session7.spec.ts` cold-green at
   **48 pins** (verified by `--list`, never estimated — the S189 lesson 2).
2. **The byte-faithfulness machine checks** (the S189/S191/S193/S194
   doctrine): (a) each moved block byte-identical to its source range
   INCLUDING its leading comment run (the comment-block ownership walk —
   S127/CB13's runs 443–451, S173/DW2's runs 655–683; S7-D and S7-E carry
   NO leading comment run — their describes start directly); (b) the title
   multiset (the moved pins' titles exactly the pre-split members); (c) the
   describe/pin arithmetic: 4 moved describes + 16 staying = 20 before;
   6 moved pins + 42 staying = 48 before.
3. **The post-split equivalence**: the three-file cold run
   (`parity-session7.spec.ts` + `analytics.spec.ts` + `gradetracker.spec.ts`)
   reproducing the pre-split outcome — 48 pins green, first-roll.
4. **The chunk-2 composition cold** (the budget map holds: the same chunk,
   the same POST/register units — the four moved describes are ALL
   read-only/zero-write [verified by grep: zero `.post(`/`.patch(`/`
   .delete(`/`fill(` outside the never-submitted dialog-anatomy pin], so
   there are no budget units to move at all).
5. **The 5-chunk cold cert map: 744/744 UNCHANGED** (a pure reorganization
   — no pins added, none removed; the Expected lines hold 160+275+116+
   101+92).

## §4 The extraction spec (the exact blocks, the exact boundaries)

| # | Describe | Source lines (1-indexed, inclusive) | Pins |
|---|----------|-------------------------------------|------|
| 1 | `S7-D · Analytics stat cards + charts` | 92–148 (no leading comment; describe 92–148) | 3 |
| 2 | `S7-E · Grade Tracker summary icons` | 151–168 (no leading comment; describe 151–168) | 1 |
| 3 | `S127/CB13 · the analytics Assignments card renders the true average progress` | 443–463 (comment 443–451; describe 452–463) | 1 |
| 4 | `S173/DW2 · the grades create-dialog parity catch-up + the type/date field port` | 655–727 (comment 655–683; describe 684–727) | 1 |

- **169 source lines move** across four blocks (the second multi-block
  extraction after S193's four, and the first TWO-DESTINATION extraction).
- The new files' headers follow the `timetable.spec.ts`/`files.spec.ts`
  template: the consolidation note (cycle, boundary decisions, contracts),
  the local `hydrated` helper (analytics.spec.ts additionally carries the
  local `rgb` helper — S7-D's four tinted-icon assertions use it; verified
  by the helper census: the moved blocks' ONLY external dependencies are
  `hydrated` [6 refs] and `rgb` [4 refs, all S7-D]; the staying file's
  `rgb` remains used 13× — no orphan), and the import line.
- `parity-session7.spec.ts` keeps **16 describes / 42 pins** (~1,555 lines)
  and its header comment re-anchors (the S7-D/S7-E/S127-CB13/S173-DW2
  moved-family notes join the S7-A/S7-C/S7-F/S183-EG notes).

### The boundary adjudications (the S189–S194 doctrine)

- **The Analytics/GradeTracker strays outside the split source STAY**: the
  a11y-sweep /Analytics + /GradeTracker legs (the cross-view a11y home),
  the dark-mode Analytics/GradeTracker wash legs (chunk 4, the theme-axis
  home), the navigation.spec.ts legs (the routing-axis home), the
  parity-session5/8/9 pins (their own batch-lineage homes — the
  consolidation boundary follows the FILE, not the view: the S189/S191
  lesson), the s17-fresh-user zero-data legs (the fresh-user-axis home),
  the resilience legs (the resilience-axis home). A pin's VIEW is not its
  FAMILY — the family is the pin's batch lineage + coverage axis.
- **The mixed describes STAY**: S7-B (studygroups + practicetests dialogs),
  S175/DY4 (gradetracker DY4a/DY4b + subjects/settings DY4c/DY4d — the
  mixed family stays per the S78/AE precedent), S78/AE (notes + flashcards
  hardening), S184/EH + S186/EJ + S187/EK (the cross-view EmptyState/
  header/filter-row families — each carries its Analytics or GradeTracker
  leg by design; the S187/EK GT-stat border pin at line ~1691 is the
  filter-row family's own leg).

### The chunk-map and residue analysis (the S189 lesson 3, both directions)

- **The chunk assignment**: both new files join **chunk 2** (its 12th and
  13th files) — the SAME chunk as the split source, so the per-chunk POST
  budget and the register/login budgets hold by construction (stronger:
  the moved describes issue ZERO writes — verified by grep — so there are
  no budget implications at all; every test rides the authenticated
  storageState).
- **Playwright orders files alphabetically** (re-verified empirically in
  S193/S194 via `--list`): the current chunk-2 order runs parity-session7
  6th (after a11y-sweep, files, flashcards, notes, parity-session6); after
  the split, `analytics.spec.ts` sorts **2nd** (a11y-sweep < **analytics**
  < files) and `gradetracker.spec.ts` sorts **5th** (a11y-sweep <
  analytics < files < flashcards < **gradetracker** < notes) — BOTH before
  the split source's 6th position.
- **Direction 1 — what the moved pins now see** (the residue timeline):
  STRICTLY LESS than today for both files. The S7-D/S127 pins currently
  see five predecessors (a11y-sweep, files, flashcards, notes,
  parity-session6); after the move they see ONE (a11y-sweep). The S7-E/
  S173 pins see four (a11y-sweep, analytics [read-only], files,
  flashcards) instead of five. Both are strict subsets of today's green
  exposure. The seed-anchored assertions (the S127 "0/6" fraction, the
  S7-D fraction values + completion-rate subs, the S7-E summary icons)
  depend on the DETERMINISTIC SEED (re-created by the global setup before
  any spec runs), never on a predecessor's writes — and the remaining
  predecessors (a11y-sweep; analytics's own read-only family) mutate
  nothing the pins read.
- **Direction 2 — what the neighbors now see**: the moved family leaves
  ZERO residue (the four describes are read-only — S173/DW2 opens the
  create dialog and asserts its anatomy WITHOUT ever submitting; S7-D/
  S7-E/S127 assert seeded state). The newly exposed successors (files,
  flashcards, notes — all now running AFTER analytics and/or gradetracker)
  see no new state. The staying parity-session7 describes keep their
  current exposure minus the four removed blocks (a pure reduction).

## §5 The execution order (TDD-shaped for a Mode-D cycle)

1. Characterize: cold `--list` + cold run of parity-session7.spec.ts (48 +
   setup, first-roll) — the pre-split baseline.
2. Machine-verify the block map (the §4 boundaries) against the live file.
3. Write `tests/e2e/analytics.spec.ts` (header + `hydrated` + `rgb` + the
   S7-D and S127/CB13 blocks, byte-identical, declaration order
   preserved).
4. Write `tests/e2e/gradetracker.spec.ts` (header + `hydrated` + the S7-E
   and S173/DW2 blocks, byte-identical, declaration order preserved).
5. Delete the four blocks from parity-session7.spec.ts; re-anchor its
   header comment (the four moved-family notes).
6. Machine-verify the byte-faithfulness trio (containment + multiset +
   arithmetic) for BOTH destinations.
7. `--list` census: 739 chromium + setup = 740 UNCHANGED, in **36 spec
   files** (was 34).
8. The three-file cold run: 48 pins green (the pre-split equivalence).
9. The chunk-map lockstep: BOTH cert scripts' CHUNKS arrays gain the two
   files (chunk 2's 12th/13th) + the S195/ES re-tag headers (the Expected
   lines UNTOUCHED — the totals hold) + the `tests/script-conventions.test.ts`
   tripwire comment chain.
10. The full gates: lint · tsc · unit 1799/1799 · build (the :3200 daemon
    killed by port FIRST — the S191 lesson 1; the build runs as the
    standing cycle gate even though the build inputs did not move).
11. The chunk-2 cold composition (13 files, 275 expected), then the full
    5-chunk cold cert map (744 expected).
12. The closing chrome: the drawer check + the desktop parity probe.
13. The evidence frames: the Analytics + GradeTracker surfaces (desktop +
    dev-server frames) under `docs/screenshots/` (the self-verified
    convention; the read-only surfaces need no fixture cleanup).
14. The doc-chain lockstep (§7) + the worklog Session-206 entry + this
    plan's §9 close-out.

## §6 The re-anchor risk register

- `tests/e2e/parity-session7.spec.ts` — the four block deletions + the
  header re-anchor (the ONLY source-file changes).
- `tests/e2e/analytics.spec.ts` + `tests/e2e/gradetracker.spec.ts` — NEW
  (the moved blocks + headers).
- `scripts/e2e-chunked-cert.sh` + `scripts/run-cert-chunk.sh` — the CHUNKS
  arrays + the S195/ES re-tag headers.
- `tests/script-conventions.test.ts` — the tripwire comment chain (the
  Expected-line assertion itself UNTOUCHED — it pins
  `Expected: 160 + 275 + 116 + 101 + 92 = 744`, which holds).
- The census sites — the spec-file count moves 34 → 36 at: AGENTS.md (the
  Commands table), README.md (the tree diagram + the Session-195 row),
  omni-study1_SKILL.md (the green-state line + the §11 re-anchor),
  vitest.config.ts (the header note), CLAUDE.md (the e2e line's session-7
  reference).
- `Project_Architecture_Document.md` — the v1.3.103 revision block.
- `worklog.md` — the Session-206 entry.

## §7 The verification ledger (what proves this cycle)

- The pre-split baseline cold (48 + setup) and the post-split three-file
  cold (48 green, first-roll) — the equivalence proof.
- The byte-faithfulness machine checks (containment + multiset +
  arithmetic, both destinations).
- The `--list` census: 740 total in 36 spec files (739 chromium + setup).
- The full gates: lint · tsc · unit 1799/1799 · build.
- The 5-chunk cold cert map 744/744 (the Expected lines hold).
- The closing chrome: the drawer check GREEN + the parity probe MATCH.
- The evidence frames under `docs/screenshots/` (self-verified).

## §8 The deliverables

- This plan (§5 executed, §9 closed).
- `docs/session_262.md` (the transcript).
- The worklog Session-206 entry.
- The Analytics + GradeTracker evidence frames (standalone + dev-server).
- The re-verified `.env` / `.env.example` (no env changes expected).

## §9 The close-out (as executed)

- The §5 order ran in sequence, every step first-roll:
  - **The pre-split baseline cold**: parity-session7.spec.ts **49 passed**
    (48 pins + the setup test), first-roll, zero flakes.
  - **The extraction**: the boundary assertions against the live file (all
    ten markers + the sixteen blank-separator shapes verified before any
    byte moved), the byte-identical block extraction (169 content lines
    across four blocks), the two new homes written, the four deletions
    (92–170 / 443–465 / 655–729, absorbing the trailing separators per
    the convention), the header re-anchor (the four moved-family notes),
    and the machine checks (block containment + the title multiset + the
    arithmetic 4+16=20 describes, 6+42=48 pins + the helper-census
    no-orphan proof) all GREEN.
  - **The post-split equivalence**: the three-file cold run **49 passed,
    first-roll** — the identical outcome to the pre-split baseline.
  - **The census**: `--list` 740 total (739 chromium + the setup test) in
    **36 spec files** (was 34); every count UNCHANGED; the badge holds
    2543.
  - **The full gates**: lint ✓ · tsc ✓ · unit 1799/1799 (the
    script-conventions tripwire machine-verifying the cert-script edits —
    the `bash -n` syntax check + the Expected-line pin) · build ✓ (the
    :3200 daemon killed by port FIRST; the bundled
    `.next/standalone/.env` verified `AUTH_SECRET=""` — the s22
    contract).
  - **The cert map**: chunk 1 **160** ✓ · chunk 2 **275/275 cold** (13
    files, the new composition) · chunk 3 **116** ✓ · chunk 4 **101** ✓ ·
    chunk 5 **92** ✓ — the full map **744/744**, every chunk first-roll.
  - **The closing chrome**: the drawer check GREEN (**the 150th**) · the
    desktop parity probe MATCH (all five checks).
  - **The evidence**: the four self-verifying frames (the analytics
    desktop + the gradetracker dialog on the re-booted :3200 standalone —
    read-only surfaces, the dialog Escape-closed without submitting; the
    analytics + gradetracker views on the dev server :3000 per the
    operator's standing request) — DOM-asserted before the shots,
    pixel-verified non-blank.
  - **The residue discipline**: the reference account untouched
    (read-only); the clone's persistent demo account untouched (zero
    writes on both hosts).
- The deviation record: ONE extraction iteration (the generated files'
  headers carried double braces from the Python f-string template
  escaping — Playwright's multi-file `--list` answered "Total: 0 tests in
  0 files"; the single-file `--list` surfaced the SyntaxError; fixed in
  place, the byte-faithfulness trio re-verified — the S195 lesson 3). No
  plan-level deviations; the extraction, the equivalence, and the
  certification all landed first-roll.

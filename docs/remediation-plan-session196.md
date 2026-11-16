# The S196 remediation plan — the studygroups + practicetests two-family e2e consolidation (Batch ET: the S195 close's named next candidates, both remaining natural view homes)

The axis: the fresh **20-view reference census** (the standing S192 instrument
`scripts/ref-census-s192.mjs`) flagged 112 raw deltas (17 auto-classed
data-shaped + 95 requiring adjudication — the identical count and item set the
S193/S194/S195 cycles adjudicated) and **every one adjudicates to a standing
non-gap class** (the ledger in §1) — the reference is UNCHANGED since the S195
close, so the clean behavior-change-free window the S189 doctrine requires for
a consolidation cycle is CONFIRMED (the sixth consecutive clean window). Per
the S195 close's named next candidates and the S189–S195 size-debt doctrine,
this cycle executes the **studygroups + practicetests two-family e2e
consolidation** — the SECOND two-family cycle: the studygroups family (the
S171/DU2 create-dialog + description round-trip describe + the S176/DZ2
create-dialog + swatch idiom describe) splits byte-faithfully out of
`parity-session7.spec.ts` into the dedicated `tests/e2e/studygroups.spec.ts`
home, and the practicetests family (the S7-P founding stray [the last
practice-tests pin in the founding ledger] + the S130/CE2 True/False default +
the S172/DV2 create-dialog catch-up) into the dedicated
`tests/e2e/practicetests.spec.ts` home (the view-dedicated convention, the
eighth and ninth applications after tasks/notes/flashcards/timetable/files/
analytics/gradetracker). A pure test-organization refactor with ZERO
application behavior change.

## §0 The context and the baseline

- The workspace: the S195 close `e827270` + the operator's session_263
  transcript commit `ece111f` on `main`, pulled fresh at the open (the doc-only
  commit added `docs/session_263.md`). A WARM workspace: node_modules,
  `db/custom.db`, the :3000 dev server, and the :3200 standalone survivor all
  present (the reaper-proof launchers outlived the recycle). The doc-only diff
  verified against `src/` — the survivor daemon BYTE-CURRENT, reused per the
  S193 lesson-1 procedure (health-check + tree-diff; no rebuild at the open).
- The cold baseline reproduced the S195 close EXACTLY: lint ✓ · tsc ✓ ·
  unit **1799/1799 (55 files)** ✓.
- The standing chrome at the open: the drawer check GREEN (**the 151st
  consecutive** — no Tailwind v4 mobile-nav bug; the mobile navigation menu
  verified working: backdrop `oklab(0 0 0 / 0.2)` + blur(4px), 288px white
  panel, 20 links, no footer, Escape + navigate auto-close, appbar z-40
  fixed) · the desktop parity probe **MATCH** (all five structural checks,
  both hosts — the reference account probed read-only with the operator's
  credentials via the REF_PROBE_* env posture) · the s116 reference resweep
  **ok:true, probeCleanup ok** (zero residue).
- The environment contract re-verified against the operator's standing
  instructions: `.env` at `DATABASE_URL="file:../db/custom.db"` with `db/`
  at the repo root · the vitest + playwright configs present and green ·
  `.env.example` matching the env surface (no env changes this cycle).

## §1 The census and the adjudication ledger (what was measured, what it adjudicated to)

The fresh 20-view census (both hosts, the reference account read-only —
login + navigation only, zero rows created or deleted) flagged 112 raw
deltas; 17 auto-classed data-shaped, 95 requiring the standing adjudication
(the identical count and item set the S193/S194/S195 cycles closed). Every
class adjudicates to a STANDING non-gap record:

1. **The data-shaped families** (the reference account's zero-data
   empty-state CTAs vs the seeded clone — dashboard/myday/tasks/timetable/
   assignments/exams/notes/flashcards/practicetests/studygroups/
   gradetracker/analytics/focustimer rows and counts). The closing half (the
   S191 lesson-2 code check) re-verified this cycle by grep: the clone
   CARRIES each flagged CTA in its zero-data path (`myday-view.tsx:226`
   "Add Your First Task", `tasks-view.tsx:738` "No tasks yet",
   `assignments-view.tsx:337` "No assignments yet", `exams-view.tsx:327`
   "No exams found", `notes-view.tsx:1284`, `flashcards-view.tsx:516/543`
   "No decks yet"/"Select a deck", `practicetests-view.tsx:852` "No practice
   tests yet", `studygroups-view.tsx:386/457` "No study groups"/"Select a
   group").
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

**REAL GAPS: NONE.** The reference is unchanged since the S195 close — the
consolidation window is clean (the sixth consecutive clean window; the
reference account remains zero-data, so the AI audit-rider candidates — the
message-bubble anatomy — stay unmeasurable).

## §2 The axis (why the studygroups + practicetests families, why now)

- `parity-session7.spec.ts` remains the suite's second-largest file at
  **1,558 lines / 16 describes / 42 pins** after the S189 (notes, 49 pins),
  S191 (flashcards, 18 pins), S193 (timetable, 15 pins), S194 (files, 7
  pins), and S195 (analytics + gradetracker, 6 pins) splits — the default
  landing spot for six generations of pins. (The largest file remains
  `resilience.spec.ts` at 2,359 lines — a COVERAGE-AXIS file whose
  describes are failure-state/edge-case axes, not view families; the
  view-dedicated convention does not apply there — the S194 lesson 3.)
- The S195 close's named next candidates: **the studygroups home (S171/DU2 +
  S176/DZ2) or the practicetests home (S7-P + S130/CE2 + S172/DV2)** —
  individually small families (3 pins each), so this cycle bundles BOTH into
  the SECOND two-family cycle (the S195 precedent's shape: "a cycle can
  carry TWO view homes — the multi-family shape the S194 close named"),
  closing BOTH remaining natural view homes in one characterization pass.
- The complete-family scope (the S189–S195 precedent: each home holds EVERY
  pure describe for its view in the split source):
  - **The StudyGroups family**: the S171/DU2 describe (2 pins / 91 lines —
    the create-dialog parity catch-up: the "Create Study Group" title, the
    measured name/description labels + placeholders, the footer DOM order
    submit-then-secondary, plus the description round-trip leg [create →
    select → detail-pane renders the description → DELETE, zero residue])
    + the S176/DZ2 describe (1 pin / 36 lines — the swatch idiom port: the
    measured labels, palette geometry, and the selected state's
    `rgb(255,255,255) 0 0 0 2px` ring). Both pure /StudyGroups: 2 describes
    / 3 pins / 127 lines.
  - **The PracticeTests family**: the S7-P founding describe (1 pin / 39
    lines — the bare zero-state on a FRESH registered account: the S17
    pattern, empty storageState + register/verify) + the S130/CE2 describe
    (1 pin / 36 lines — the True/False default answer: a one-question
    True/False test saves without touching the correct-answer select) + the
    S172/DV2 describe (1 pin / 56 lines — the create-dialog parity
    catch-up: the "Create Practice Test" title, the measured labels,
    placeholder, counter, and footer order). All pure /PracticeTests: 3
    describes / 3 pins / 131 lines.
- The view-dedicated convention: `tasks.spec.ts` (S167), `notes.spec.ts`
  (S189/EM), `flashcards.spec.ts` (S191/EO), `timetable.spec.ts` (S193/EQ),
  `files.spec.ts` (S194/ER), `analytics.spec.ts` + `gradetracker.spec.ts`
  (S195/ES) — the studygroups and practicetests homes are the eighth and
  ninth applications of the pattern, and the SECOND two-family cycle.
- The other S195-close candidates, adjudicated: the reference
  behavior-change axis (NOT found — the census is clean, sixth window); the
  AI audit-rider message-bubble anatomy (still unmeasurable — the reference
  account is zero-data).

## §3 The characterization contract (the Mode-D discipline — no honest-RED shape exists for a refactor)

1. **The pre-split baseline**: `parity-session7.spec.ts` cold-green at
   **42 pins** (verified by `--list`, never estimated — the S189 lesson 2;
   the `--list` census reads 43 tests in 2 files = 42 pins + the setup
   test).
2. **The byte-faithfulness machine checks** (the S189–S195 doctrine): (a)
   each moved block byte-identical to its source range INCLUDING its leading
   comment run (the comment-block ownership walk — S130/CE2's run 375–386,
   S171/DU2's run 413–433, S172/DV2's run 506–523; S7-P and S176/DZ2 carry
   NO leading comment run — their describes start directly); (b) the title
   multiset (the moved pins' titles exactly the pre-split members); (c) the
   describe/pin arithmetic: 5 moved describes + 11 staying = 16 before;
   6 moved pins + 36 staying = 42 before.
3. **The post-split equivalence**: the three-file cold run
   (`parity-session7.spec.ts` + `studygroups.spec.ts` +
   `practicetests.spec.ts`) reproducing the pre-split outcome — 42 pins
   green, first-roll.
4. **The chunk-2 composition cold** (the budget map holds: the same chunk,
   the same POST/register units — the register POSTs of S7-P's fresh-account
   pin move WITH the pin inside chunk 2, so the chunk's register budget is
   unchanged by construction).
5. **The 5-chunk cold cert map: 744/744 UNCHANGED** (a pure reorganization
   — no pins added, none removed; the Expected lines hold 160+275+116+
   101+92).

## §4 The extraction spec (the exact blocks, the exact boundaries)

| # | Describe | Source lines (1-indexed, inclusive) | Pins |
|---|----------|-------------------------------------|------|
| 1 | `S7-P · Practice Tests bare empty state` | 103–141 (no leading comment; describe 103–141) | 1 |
| 2 | `S130/CE2 · the True/False default answer` | 375–410 (comment 375–386; describe 387–410) | 1 |
| 3 | `S171/DU2 · the studygroups create-dialog parity catch-up + the description round-trip` | 413–503 (comment 413–433; describe 434–503) | 2 |
| 4 | `S172/DV2 · the practiceTests create-dialog parity catch-up` | 506–561 (comment 506–523; describe 524–561) | 1 |
| 5 | `S176/DZ2 · the studygroups create-dialog parity catch-up + the swatch idiom port` | 970–1005 (no leading comment; describe 970–1005) | 1 |

- **258 source lines move** across five blocks (the third multi-block
  extraction after S193's four and S195's four, and the second
  TWO-DESTINATION extraction).
- The new files' headers follow the `analytics.spec.ts`/`gradetracker.spec.ts`
  template: the consolidation note (cycle, boundary decisions, contracts),
  the local `hydrated` helper (the moved blocks' ONLY file-local dependency —
  verified by the helper census; the one `rgb(` hit inside S176/DZ2 is the
  STRING LITERAL `"rgb(255, 255, 255) 0px 0px 0px 2px"` inside an assertion,
  the S193 string-literal false-positive class, NOT a call to the helper),
  and the import line. The staying file's `rgb` helper remains used by the
  staying S7-B describe (5 calls) — no orphan.
- `parity-session7.spec.ts` keeps **11 describes / 36 pins** (~1,300 lines)
  and its header comment re-anchors (the S7-P/S130-CE2/S171-DU2/S172-DV2/
  S176-DZ2 moved-family notes join the founding ledger).

### The boundary adjudications (the S189–S195 doctrine)

- **The StudyGroups/PracticeTests strays outside the split source STAY**: the
  a11y-sweep /StudyGroups + /PracticeTests legs (the cross-view a11y home),
  the dark-mode washes (chunk 4, the theme-axis home), the navigation legs
  (the routing-axis home), the parity-session5/8/9 pins (their own
  batch-lineage homes — the consolidation boundary follows the FILE, not the
  view: the S189/S191 lesson), the s17-fresh-user zero-data legs (the
  fresh-user-axis home), the resilience legs (the resilience-axis home), the
  mobile-navigation StudyGroups leg (the mobile-chrome home), the S78/AE
  hardening describe's studygroups-adjacent pins (the batch-lineage home). A
  pin's VIEW is not its FAMILY — the family is the pin's batch lineage +
  coverage axis.
- **The mixed describe STAYS**: S7-B (Study Groups swatch palette + Practice
  Tests dialog — 1 studygroups pin + 2 practicetests pins) is MIXED and
  stays per the S78/AE precedent (the S195 plan §4's own recorded
  adjudication: "S7-B is MIXED [studygroups + practicetests] and stays per
  the boundary doctrine").

### The chunk-map and residue analysis (the S189 lesson 3, both directions)

- **The chunk assignment**: both new files join **chunk 2** (its 14th and
  15th files) — the SAME chunk as the split source, so the per-chunk POST
  budget and the register/login budgets hold by construction (the S7-P
  register/verify POSTs ride the pin into the same chunk; the chunk's total
  register count is UNCHANGED).
- **Playwright orders files alphabetically** (re-verified empirically in
  S193/S194/S195 via `--list`): the current chunk-2 order runs
  parity-session7 8th (after a11y-sweep, analytics, files, flashcards,
  gradetracker, notes, parity-session6); after the split,
  `practicetests.spec.ts` sorts **10th** (parity-session9 < practicetests <
  s14-hardening) and `studygroups.spec.ts` sorts **12th** (s14-hardening <
  studygroups < tasks) — BOTH AFTER the split source's 8th position (the
  S193 last-slot direction, NOT the S194/S195 strictly-fewer one — the
  both-directions enumeration the S193 lesson demands).
- **Direction 1 — what the moved pins now see** (the residue timeline):
  MORE predecessors than today (practicetests sees 9 vs parity-session7's
  current 7 — adding the STAYING parity-session7 describes + parity-session9;
  studygroups sees 11 — adding s14-hardening too). The immunity proof, per
  pin: **S7-P** registers its OWN fresh account (empty storageState —
  immune to every predecessor's demo-user residue by construction);
  **S130/CE2** creates and asserts its OWN uniquely-titled row ("CE2
  True/False default probe" — no predecessor writes that string;
  grep-verified); **S171/DU2** creates a Date.now-stamped group and
  self-DELETEs it in a finally block (zero residue, unique stamp);
  **S172/DV2 + S176/DZ2** are read-only dialog-anatomy pins (seed-anchored;
  they never submit). The added predecessors' own residue classes (the
  staying describes' dialog fixtures, parity-session9's data-state writes,
  s14-hardening's AI-budget exhaustion) touch no surface the moved pins
  read: none of the five moved pins calls an AI route (the S172/DV2
  "AI Generate Questions" assertion is a VISIBILITY check on the dialog's
  button, not an API call — the s14 AI-budget pin's AFTER-everyone posture
  is unaffected).
- **Direction 2 — what the neighbors now see**: the moved family leaves ONE
  persistent row today (S130/CE2's practice-test row lands when
  parity-session7 runs 8th) — after the move it lands at position 10
  (practicetests), so **parity-session9 (position 9) NO LONGER sees it — a
  strict exposure REDUCTION** (and no spec references "CE2 True/False"
  outside parity-session7 — grep-verified; the standing discipline is every
  spec owns its data). The successors after position 10 (s14-hardening,
  studygroups, tasks, theme-system, timetable) still see the CE2 row —
  exactly the exposure class they already tolerate today (all five ran
  green after parity-session7's 8th position through S195). S171/DU2's
  fixture self-deletes; S7-P's fresh account leaves no demo-user state; the
  read-only pins leave nothing. The staying parity-session7 describes keep
  their current exposure minus the five removed blocks (a pure reduction).

## §5 The execution order (TDD-shaped for a Mode-D cycle)

1. Characterize: cold `--list` + cold run of parity-session7.spec.ts (42 +
   setup, first-roll) — the pre-split baseline.
2. Machine-verify the block map (the §4 boundaries) against the live file.
3. Write `tests/e2e/studygroups.spec.ts` (header + `hydrated` + the S171/DU2
   and S176/DZ2 blocks, byte-identical, declaration order preserved).
4. Write `tests/e2e/practicetests.spec.ts` (header + `hydrated` + the S7-P,
   S130/CE2, and S172/DV2 blocks, byte-identical, declaration order
   preserved).
5. Delete the five blocks from parity-session7.spec.ts; re-anchor its header
   comment (the five moved-family notes).
6. Machine-verify the byte-faithfulness trio (containment + multiset +
   arithmetic) for BOTH destinations.
7. `--list` census: 739 chromium + setup = 740 UNCHANGED, in **38 spec
   files** (was 36).
8. The three-file cold run: 42 pins green (the pre-split equivalence).
9. The chunk-map lockstep: BOTH cert scripts' CHUNKS arrays gain the two
   files (chunk 2's 14th/15th) + the S196/ET re-tag headers (the Expected
   lines UNTOUCHED — the totals hold) + the `tests/script-conventions.test.ts`
   tripwire comment chain.
10. The full gates: lint · tsc · unit 1799/1799 · build (the :3200 daemon
    killed by port FIRST — the S191 lesson 1; the build runs as the
    standing cycle gate even though the build inputs did not move).
11. The chunk-2 cold composition (15 files, 275 expected), then the full
    5-chunk cold cert map (744 expected).
12. The closing chrome: the drawer check + the desktop parity probe.
13. The evidence frames: the StudyGroups + PracticeTests surfaces (standalone
    + dev-server frames) under `docs/screenshots/` (the self-verified
    convention; the create-dialog frames Escape-closed without submitting —
    zero writes on the persistent demo account).
14. The doc-chain lockstep (§7) + the worklog Session-207 entry + this
    plan's §9 close-out.

## §6 The re-anchor risk register

- `tests/e2e/parity-session7.spec.ts` — the five block deletions + the header
  re-anchor (the ONLY source-file changes).
- `tests/e2e/studygroups.spec.ts` + `tests/e2e/practicetests.spec.ts` — NEW
  (the moved blocks + headers).
- `scripts/e2e-chunked-cert.sh` + `scripts/run-cert-chunk.sh` — the CHUNKS
  arrays + the S196/ET re-tag headers.
- `tests/script-conventions.test.ts` — the tripwire comment chain (the
  Expected-line assertion itself UNTOUCHED — it pins
  `Expected: 160 + 275 + 116 + 101 + 92 = 744`, which holds).
- The census sites — the spec-file count moves 36 → 38 at: AGENTS.md (the
  Commands table), README.md (the tree diagram + the Session-196 row),
  omni-study1_SKILL.md (the green-state line + the §11 re-anchor),
  vitest.config.ts (the header note), CLAUDE.md (the e2e line's spec-file
  count).
- `Project_Architecture_Document.md` — the v1.3.104 revision block.
- `worklog.md` — the Session-207 entry.

## §7 The verification ledger (what proves this cycle)

- The pre-split baseline cold (42 + setup) and the post-split three-file
  cold (42 green, first-roll) — the equivalence proof.
- The byte-faithfulness machine checks (containment + multiset +
  arithmetic, both destinations).
- The `--list` census: 740 total in 38 spec files (739 chromium + setup).
- The full gates: lint · tsc · unit 1799/1799 · build.
- The 5-chunk cold cert map 744/744 (the Expected lines hold).
- The closing chrome: the drawer check GREEN + the parity probe MATCH.
- The evidence frames under `docs/screenshots/` (self-verified).

## §8 The deliverables

- This plan (§5 executed, §9 closed).
- `docs/session_264.md` (the transcript).
- The worklog Session-207 entry.
- The StudyGroups + PracticeTests evidence frames (standalone + dev-server).
- The re-verified `.env` / `.env.example` (no env changes expected).

## §9 The close-out (as executed)

- The §5 order ran in sequence, every step first-roll:
  - **The pre-split baseline cold**: parity-session7.spec.ts **43 passed**
    (42 pins + the setup test), first-roll, zero flakes.
  - **The extraction**: the boundary assertions against the live file (all
    fifteen markers + the twenty blank-separator shapes + the six
    stay-neighbors verified before any byte moved), the byte-identical
    block extraction (258 content lines across five blocks), the two new
    homes written, the three deletions (103–144 / 374–563 / 970–1007,
    absorbing the trailing separators per the convention), the header
    re-anchor (the five moved-family notes + the S7-B mixed-family
    resolution note), and the machine checks (block containment + the
    title multiset + the arithmetic 5+11=16 describes, 6+36=42 pins +
    the helper-census no-orphan proof with the string-literal
    false-positive adjudication) all GREEN.
  - **The post-split equivalence**: the three-file cold run **43 passed,
    first-roll** — the identical outcome to the pre-split baseline.
  - **The census**: `--list` 740 total (739 chromium + the setup test) in
    **38 spec files** (was 36); every count UNCHANGED; the badge holds
    2543.
  - **The full gates**: lint ✓ · tsc ✓ · unit 1799/1799 (the
    script-conventions tripwire machine-verifying the cert-script edits —
    the `bash -n` syntax check + the Expected-line pin) · build ✓ (the
    :3200 daemon killed by port FIRST; the bundled
    `.next/standalone/.env` verified `AUTH_SECRET=""` — the s22
    contract).
  - **The cert map**: chunk 1 **160** ✓ · chunk 2 **275/275 cold** (15
    files, the new composition) · chunk 3 **116** ✓ · chunk 4 **101** ✓ ·
    chunk 5 **92** ✓ — the full map **744/744**, every chunk first-roll.
  - **The closing chrome**: the drawer check GREEN (**the 152nd**) · the
    desktop parity probe MATCH (all five checks).
  - **The evidence**: the four self-verifying frames (the studygroups +
    practicetests create-dialogs on the re-booted :3200 standalone —
    read-only surfaces, both dialogs Escape-closed without submitting;
    the studygroups + practicetests views on the dev server :3000 per the
    operator's standing request) — DOM-asserted before the shots,
    pixel-verified non-blank.
  - **The residue discipline**: the reference account untouched
    (read-only); the clone's persistent demo account untouched (zero
    writes on both hosts).
- The deviation record: NONE — the extraction, the equivalence, and the
  certification all landed first-roll (the S195 f-string brace-escape
  trap avoided by design: the extraction script builds its headers with
  plain concatenation, no f-strings near JS template literals).

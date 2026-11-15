# The S194 remediation plan — the Files-family e2e consolidation (Batch ER: the largest remaining pure view family in parity-session7)

The axis: the fresh **20-view reference census** (the standing S192 instrument
`scripts/ref-census-s192.mjs`) flagged 112 raw deltas (17 auto-classed
data-shaped + 95 requiring adjudication — the identical 95 the S193 cycle
adjudicated) and **every one adjudicates to a standing non-gap class** (the
ledger in §1) — the reference is UNCHANGED since the S193 close, so the clean
behavior-change-free window the S189 doctrine requires for a consolidation
cycle is CONFIRMED (the fourth application). Per the S189/S191/S193 size-debt
doctrine ("the largest remaining view family takes the cycle"), this cycle
executes the **Files-family e2e consolidation**: the largest remaining pure
view family in `parity-session7.spec.ts` — the S183/EG describe (449 lines /
7 pins, the file's largest single describe) — splits byte-faithfully into the
dedicated Files home `tests/e2e/files.spec.ts`. A pure test-organization
refactor with ZERO application behavior change.

## §0 The context and the baseline

- The workspace: the S193 close `1eb87d2` + the operator's session_259
  transcript commit `089477e` on `main` (a WARM workspace — node_modules,
  `db/custom.db`, the :3000 dev server, and the :3200 standalone survivor
  all present; the doc-only `089477e` diff verified — zero `src/` files —
  so the surviving :3200 daemon is BYTE-CURRENT per the S193 lesson-1
  verify-and-reuse procedure: `/api/health` ok + the tree-diff empty).
- The cold baseline reproduced the S193 close EXACTLY: lint ✓ · tsc ✓ ·
  unit **1799/1799 (55 files)** ✓.
- The standing chrome at the open: the drawer check GREEN (**the 147th
  consecutive** — no Tailwind v4 mobile-nav bug; backdrop `oklab(0 0 0 /
  0.2)` + blur(4px), 288px white panel, 20 links, no footer, Escape +
  navigate auto-close, appbar z-40 fixed) · the desktop parity probe
  **MATCH** (all five structural checks, both hosts) · the s116 reference
  resweep **ok:true, 9/9 invariants both hosts, probeCleanup ok** (zero
  residue; one transient consecutive-run registration race re-run clean —
  the exit-code gate green).
- The environment contract re-verified against the operator's standing
  instructions: `.env` at `DATABASE_URL="file:../db/custom.db"` with `db/`
  at the repo root · the vitest + playwright configs present and green ·
  `.env.example` matching the env surface (no env changes this cycle).

## §1 The census and the adjudication ledger (what was measured, what it adjudicated to)

The fresh 20-view census (both hosts, the reference account read-only —
login + navigation only, zero rows created or deleted) flagged 112 raw
deltas; 17 auto-classed data-shaped, 95 requiring the standing adjudication
(the identical count and item set the S193 cycle closed). Every class
adjudicates to a STANDING non-gap record:

1. **The data-shaped families** (the reference account's zero-data
   empty-state CTAs vs the seeded clone — dashboard/myday/tasks/timetable/
   assignments/exams/notes/flashcards/practicetests/studygroups/
   gradetracker/analytics/focustimer rows and counts). The closing half (the
   S191 lesson-2 code check) re-verified this cycle by grep: the clone
   CARRIES each flagged CTA in its zero-data path (`myday-view.tsx:226`
   "Add Your First Task", `tasks-view.tsx:738` "No tasks yet",
   `assignments-view.tsx:337`, `exams-view.tsx:327`,
   `notes-view.tsx:1284`, `flashcards-view.tsx:516/717`,
   `practicetests-view.tsx:852`, `studygroups-view.tsx:386`).
2. **The computed-identical tag differences** (Tasks "My Lists" p-vs-h3, the
   Settings Appearance h2-vs-div — the S192 adjudications, unchanged).
3. **The AI view's heads-delta** (the reference's real h3 quick-action
   titles + hero vs the clone's span role=heading stand-ins) — the S192
   axe-clean superset adjudication, computed-identical, pinned by EP2/EP4.
4. **The Files "Upload" affordance** — the S183 outline port (the S192
   dark-mode-artifact adjudication).
5. **The MathSolver solution card** — the S14 aria-live superset (pinned).
6. **The dashboard 6-vs-4 grid-div count** in the rough structural probe —
   the S192-counted artifact (the probe counts ALL grid children, not stat
   cards; the deeper S192 probe measured 4 stat cards on both hosts).

**REAL GAPS: NONE.** The reference is unchanged since the S193 close — the
consolidation window is clean (the fourth consecutive clean window; the
reference account remains zero-data, so the AI audit-rider candidates — the
message-bubble anatomy — stay unmeasurable).

## §2 The axis (why the Files family, why now)

- `parity-session7.spec.ts` remains the suite's **second**-largest file at
  **2,167 lines / 21 describes / 55 pins** after the S189 (notes, 49 pins),
  S191 (flashcards, 18 pins), and S193 (timetable, 15 pins) splits — the
  default landing spot for six generations of pins. (The largest file is
  now `resilience.spec.ts` at 2,359 lines — a COVERAGE-AXIS file whose
  describes are failure-state/edge-case axes, not view families; the
  view-dedicated convention does not apply there. The size-debt doctrine
  targets the view families parity-session7 inherited.)
- The **Files family is its largest remaining pure view family: the
  S183/EG describe — 449 lines / 7 pins** (the file's largest single
  describe by a 2× margin over the next): the toolbar (search, All Types
  select, toggle), the sectioned grid (Folders/Files labels, 2/4/6
  columns), the type filter + measured search semantics, the in-folder
  navigation + move dialog, the list-mode row anatomy, the View dialog,
  and the non-image/link tiles.
- The view-dedicated convention: `tasks.spec.ts` (S167), `notes.spec.ts`
  (S189/EM), `flashcards.spec.ts` (S191/EO), `timetable.spec.ts`
  (S193/EQ) — the Files home is the fifth application of the pattern, and
  the first single-describe family (the S183/EG describe is one
  consolidated block, internally complete: its fixtures and helpers ride
  INSIDE the describe).
- The S193 close's other named candidates, adjudicated: the reference
  behavior-change axis (NOT found — the census is clean); the AI
  audit-rider message-bubble anatomy (still unmeasurable — the reference
  account is zero-data); the S7-D/S7-E analytics/gradetracker strays (4
  pins / 79 lines — real but SMALL; they remain the next-size candidate
  after this cycle).

## §3 The characterization contract (the Mode-D discipline — no honest-RED shape exists for a refactor)

1. **The pre-split baseline**: `parity-session7.spec.ts` cold-green at
   **55 pins** (verified by `--list`, never estimated — the S189 lesson 2).
2. **The byte-faithfulness machine checks** (the S189/S191/S193 doctrine):
   (a) the moved block byte-identical to its source range INCLUDING its
   leading comment run (the comment-block ownership walk — lines 1187–1202
   own the describe); (b) the title multiset (the moved pins' titles
   exactly the pre-split members); (c) the describe/pin arithmetic:
   1 moved describe + 20 staying = 21 before; 7 moved pins + 48 staying =
   55 before.
3. **The post-split equivalence**: the two-file cold run
   (`parity-session7.spec.ts` + `files.spec.ts`) reproducing the pre-split
   outcome — 55 pins green, first-roll.
4. **The chunk-2 composition cold** (the budget map holds: the same chunk,
   the same POST units — the EG family's 11 upload-budget units stay in
   chunk 2, and the relative order of every /api/files POST consumer is
   preserved).
5. **The 5-chunk cold cert map: 744/744 UNCHANGED** (a pure reorganization
   — no pins added, none removed; the Expected lines hold 160+275+116+
   101+92).

## §4 The extraction spec (the exact block, the exact boundaries)

| # | Describe | Source lines (1-indexed, inclusive) | Pins |
|---|----------|-------------------------------------|------|
| 1 | `S183/EG · the Files toolbar + sections + cards + the filter/search/move ports` | 1187–1635 (comment block 1187–1202; describe 1205–1635) | 7 |

- **449 source lines move** — a single block (the first single-describe
  consolidation; the S193 precedent moved four, the S191 eleven).
- The new file's header follows the `timetable.spec.ts` template: the
  consolidation note (cycle, boundary decisions, contracts), the local
  `hydrated` helper (the ONLY file-local dependency — verified by the
  helper census: `EG_PNG_B64`, `egStamp`, `egPost`, `egUpload`,
  `egTextUpload`, and `gotoFiles` all ride INSIDE the describe; the `rgb`
  helper is never called by the moved pins and stays — still used 18× by
  the staying pins, no orphan), and the import line.
- `parity-session7.spec.ts` keeps **20 describes / 48 pins** (~1,717 lines)
  and its header comment re-anchors (the S183/EG moved-family note joins
  the S7-A/S7-C/S7-F notes).

### The boundary adjudications (the S189/S191/S193 doctrine)

- **The Files strays outside the split source STAY**: the EH1 Files-empty
  pin (the cross-view EmptyState family home, in parity-session7), the EJ6
  Files-header stacking pin (the view-header family home, in
  parity-session7), the a11y-sweep /Files leg (the cross-view a11y home),
  the dark-mode Files wash legs (chunk 4, the theme-axis home), the
  mobile/midband/landscape drawer-sweep Files legs (chunk 1, the
  viewport-axis homes), the resilience "files upload edge cases" describe
  (chunk 3, the resilience-axis home), and the s14-hardening /api/files
  pins (the hardening-axis home). A pin's VIEW is not its FAMILY — the
  family is the pin's batch lineage + coverage axis.
- **The mixed describes STAY**: no mixed describe touches the moved set
  (S184/EH is the cross-view EmptyState family, S186/EJ the cross-view
  header family, S187/EK the cross-view filter-row family — each carries
  its Files leg by design; the moved S183/EG is Files-pure — every pin
  drives /Files or its API family).

### The chunk-map and residue analysis (the S189 lesson 3, both directions)

- **The chunk assignment**: `tests/e2e/files.spec.ts` joins **chunk 2**
  (its 11th file) — the SAME chunk as the split source, so the per-chunk
  POST budget and the register/login budgets hold by construction (the
  moved pins issue their 11 upload units in the same chunk; every test
  rides the authenticated storageState).
- **Playwright orders files alphabetically** (re-verified empirically in
  S193 via `--list`; re-verified this cycle on the post-split file set):
  the current chunk-2 order runs parity-session7 5th (after a11y-sweep,
  flashcards, notes, parity-session6); after the split, `files.spec.ts`
  sorts **2nd** (a11y-sweep < **files** < flashcards — 'i' < 'l').
- **Direction 1 — what the moved pins now see** (the residue timeline):
  STRICTLY LESS than today. The EG pins currently see four predecessors
  (a11y-sweep, flashcards, notes, parity-session6); after the move they
  see ONE (a11y-sweep) — a strict subset of today's green exposure. The
  critical EG1 zero-state dependency ("No files yet" asserted WITHOUT
  interception, riding the seed's empty Files — the S4-C convention) is
  safe by construction: every spec EG1 currently tolerates remains either
  a predecessor or removed.
- **Direction 2 — what the neighbors now see**: the EG family's residue
  (the AN1-cleanup exception — EG2–EG7 create stamped folders/uploads via
  `egPost`/`egUpload` and do not delete them; the uploads ride the 20/
  15-min POST budget) now lands at position 2 instead of position 5. The
  newly exposed successors are audited: **flashcards** (zero /Files or
  /api/files references — grep-verified), **notes** (one /Files goto —
  EF6, which asserts the header subtitle COPY only, data-independent),
  and **parity-session6** (zero Files references). The staying
  parity-session7 describes that precede EG in declaration order (S7-B →
  S176/DZ3, lines 42–1186) carry ZERO Files references; the staying
  Files-touching pins handle the residue by design: EH1 FORCES the zero
  state (only the GET intercepted to `[]` — the EA3 order-independent
  pattern) and EJ6 asserts header chrome (stacking direction/gap, not
  data). The existing successors (parity-session9, s14-hardening, tasks,
  theme-system, timetable) keep their current exposure — s14's /api/files
  pins already tolerate the EG residue today (the green cert map is the
  proof), and the relative order EG-before-s14 is preserved.
- **The upload-budget arithmetic**: the EG block's own header records
  "SEVEN consolidated pins at ELEVEN upload-budget units" — the units stay
  in chunk 2, the relative order of every /api/files POST consumer is
  unchanged, no new consumer sits between files.spec.ts and the previous
  ones (flashcards/notes/parity-session6 carry zero Files POSTs).

## §5 The execution order (TDD-shaped for a Mode-D cycle)

1. Characterize: cold `--list` + cold run of parity-session7.spec.ts (55 +
   setup, first-roll) — the pre-split baseline.
2. Machine-verify the block map (the §4 boundaries) against the live file.
3. Write `tests/e2e/files.spec.ts` (header + helper + the block,
   byte-identical).
4. Delete the block from parity-session7.spec.ts; re-anchor its header
   comment (the S183/EG moved-family note) + the EH1 comment re-anchor
   ("this file's OWN EG pins" → the files-home reference).
5. Machine-verify the byte-faithfulness trio (containment + multiset +
   arithmetic).
6. `--list` census: 739 chromium + setup = 740 UNCHANGED, in **34 spec
   files** (was 33).
7. The two-file cold run: 55 pins green (the pre-split equivalence).
8. The chunk-map lockstep: BOTH cert scripts' CHUNKS arrays gain
   `tests/e2e/files.spec.ts` (chunk 2's 11th file) + the S194/ER re-tag
   headers (the Expected lines UNTOUCHED — the totals hold) + the
   `tests/script-conventions.test.ts` tripwire comment chain.
9. The full gates: lint · tsc · unit 1799/1799 · build (the :3200 daemon
   killed by port FIRST — the S191 lesson 1; the build runs as the
   standing cycle gate even though the build inputs did not move — a
   test-file split leaves them untouched, and the fresh build re-serves
   the evidence frames).
10. The chunk-2 cold composition (11 files, 275 expected), then the full
    5-chunk cold cert map (744 expected).
11. The closing chrome: the drawer check + the desktop parity probe.
12. The evidence frames: the Files desktop + mobile captures under
    `docs/screenshots/` (the self-verified convention) + the dev-server
    frames per the operator's standing request.
13. The doc-chain lockstep (§7) + the worklog Session-205 entry + this
    plan's §9 close-out.

## §6 The re-anchor risk register

- `tests/e2e/parity-session7.spec.ts` — the block deletion + the header
  re-anchor + the EH1 comment re-anchor (the ONLY source-file changes).
- `tests/e2e/files.spec.ts` — NEW (the moved block + header).
- `scripts/e2e-chunked-cert.sh` + `scripts/run-cert-chunk.sh` — the CHUNKS
  arrays + the S194/ER re-tag headers.
- `tests/script-conventions.test.ts` — the tripwire comment chain (the
  Expected-line assertion itself UNTOUCHED — it pins
  `Expected: 160 + 275 + 116 + 101 + 92 = 744`, which holds).
- The census sites — the spec-file count moves 33 → 34 at: AGENTS.md (the
  Commands table), README.md (the tree diagram + the Session-194 row),
  omni-study1_SKILL.md (the green-state line + the §11 re-anchor),
  vitest.config.ts (the header note), CLAUDE.md (the e2e line's
  session-7 reference).
- `Project_Architecture_Document.md` — the v1.3.102 revision block.
- `worklog.md` — the Session-205 entry.

## §7 The verification ledger (what proves this cycle)

- The pre-split baseline cold (55 + setup) and the post-split two-file cold
  (55 green, first-roll) — the equivalence proof.
- The byte-faithfulness machine checks (containment + multiset +
  arithmetic).
- The `--list` census: 740 total in 34 spec files (739 chromium + setup).
- The full gates: lint · tsc · unit 1799/1799 · build.
- The 5-chunk cold cert map 744/744 (the Expected lines hold).
- The closing chrome: the drawer check GREEN + the parity probe MATCH.
- The evidence frames under `docs/screenshots/` (self-verified).

## §8 The deliverables

- This plan (§5 executed, §9 closed).
- `docs/session_260.md` (the transcript).
- The worklog Session-205 entry.
- The Files evidence frames (standalone + dev-server).
- The re-verified `.env` / `.env.example` (no env changes expected).

## §9 The close-out (as executed)

- The §5 order ran in sequence, every step first-roll:
  - **The pre-split baseline cold**: parity-session7.spec.ts **56 passed**
    (55 pins + the setup test), first-roll, zero flakes.
  - **The extraction**: `scripts/split-files-s194.py` — the boundary
    assertions against the live file (the describe-line window widened to
    the whole block: the 16-line leading comment run pushes the describe
    past the S193 template's 12-line window — the S194 lesson 1's script
    adaptation), the byte-identical block extraction (449 lines), the
    header re-anchor + the EH1 comment re-anchor, and the machine checks
    (block containment + the title multiset + the arithmetic 1+20=21
    describes, 7+48=55 pins) all GREEN in one pass.
  - **The post-split equivalence**: the two-file cold run **56 passed,
    first-roll** — the identical outcome to the pre-split baseline.
  - **The census**: `--list` 740 total (739 chromium + the setup test) in
    **34 spec files** (was 33); every count UNCHANGED; the badge holds
    2543.
  - **The full gates**: lint ✓ · tsc ✓ · unit 1799/1799 (the
    script-conventions tripwire machine-verifying the cert-script edits —
    the `bash -n` syntax check + the Expected-line pin) · build ✓ (the
    :3200 daemon killed by port FIRST; the bundled
    `.next/standalone/.env` verified `AUTH_SECRET=""` — the s22 contract).
  - **The cert map**: chunk 1 **160** ✓ · chunk 2 **275/275 cold** (11
    files, the new composition) · chunk 3 **116** ✓ · chunk 4 **101** ✓ ·
    chunk 5 **92** ✓ — the full map **744/744**, every chunk first-roll.
  - **The closing chrome**: the drawer check GREEN (**the 148th**) · the
    desktop parity probe MATCH (all five checks).
  - **The evidence**: the four self-verifying frames (the files zero-state
    desktop + the fixture-populated sectioned grid on the re-booted :3200
    standalone — the fixtures stamped and DELETED in the finally [both
    200], the persistent-db leave-no-residue discipline; the dashboard +
    the mobile drawer on the dev server :3000) — DOM-asserted before the
    shots, pixel-verified non-blank.
  - **The residue discipline**: the reference account untouched
    (read-only navigation + login; zero rows created or deleted); the
    clone's persistent demo account left clean.
- The doc-chain lockstep completed: AGENTS (the census line 33 → 34 + the
  S194 lessons ×4) · CLAUDE (the session-7 e2e line's files-home note) ·
  README (the tree diagram + the Session-194 row) · the SKILL census
  sites + the §11 green-state re-anchor · the vitest header (the S194
  re-anchor) · the cert scripts' re-tags (BOTH) + the tripwire comment
  chain · the PAD v1.3.102 · the worklog Session-205 entry ·
  `docs/session_260.md` · `.env.example` re-verified (no env changes).
- The deviation record: TWO evidence-capture iterations (the sectioned
  frame's grid assertion first used a bare `grid-cols-6` token regex that
  missed the responsive `lg:grid-cols-6` variant — fixed to the EG2 pin's
  own containment form; the frame-2 fixture-name probe first referenced
  outer-scope names inside the browser-context evaluate — fixed by passing
  them as args). No plan-level deviations; the extraction, the
  equivalence, and the certification all landed first-roll.

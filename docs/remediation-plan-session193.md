# The S193 remediation plan — the timetable-family e2e consolidation (Batch EQ: the twice-deferred S189 close's named candidate)

The axis: the fresh **20-view reference census** (the standing S192 instrument
`scripts/ref-census-s192.mjs`) flagged 95 raw deltas and **every one
adjudicated to a known non-gap class** (the ledger in §1) — the reference is
UNCHANGED since the S192 close, so the clean behavior-change-free window the
S189 doctrine requires for a consolidation cycle is CONFIRMED. Per the S192
close's named candidate (and the S189/S191 close's before it), this cycle
executes the **timetable-family e2e consolidation**: the largest remaining
view family in `parity-session7.spec.ts` splits byte-faithfully into the
dedicated timetable home `tests/e2e/timetable.spec.ts` — a pure
test-organization refactor with ZERO application behavior change.

## §0 The context and the baseline

- The workspace: the S192 close `aeafcbf` + the operator's session_257
  transcript commit `a5fb4b7` on `main` (a WARM workspace — node_modules,
  `db/custom.db`, and the :3200 standalone survivor all present and healthy;
  the S192 lesson-1 parent-workspace `.env` hazard re-confirmed and respected —
  the shell-pinned env posture on every standalone-launching process).
- The cold baseline reproduced the S192 close EXACTLY: lint ✓ · tsc ✓ ·
  unit **1799/1799 (55 files)** ✓.
- The standing chrome at the open: the drawer check GREEN (**the 145th
  consecutive** — no Tailwind v4 mobile-nav bug; backdrop `oklab(0 0 0 / 0.2)`
  + blur(4px), 288px panel, 20 links, no footer, Escape + navigate
  auto-close, appbar z-40 fixed) · the desktop parity probe **MATCH** (all
  five structural checks, both hosts) · the s116 reference resweep
  **ok:true, 9/9 invariants both hosts, probeCleanup ok** (zero residue).
- The environment contract re-verified: `.env` at
  `DATABASE_URL="file:../db/custom.db"` with `db/` at the repo root · the
  vitest + playwright configs present and green (`vitest.config.ts`,
  `playwright.config.ts` — the suite the operator's standing instructions
  require) · `.env.example` matching the env surface.

## §1 The census and the adjudication ledger (what was measured, what it adjudicated to)

The fresh 20-view census (both hosts, the reference account read-only) flagged
95 raw deltas. Every class adjudicates to a STANDING non-gap record:

1. **The data-shaped families** (the reference account's zero-data
   empty-state CTAs vs the seeded clone — dashboard/myday/tasks/timetable/
   assignments/exams/notes/flashcards/practicetests/studygroups/
   gradetracker/analytics/focustimer rows and counts). The closing half (the
   S191 lesson 2 code check) re-verified this cycle: the clone CARRIES each
   flagged CTA in its zero-data path (`myday-view.tsx:226` "Add Your First
   Task", `tasks-view.tsx:738` "No tasks yet", the S191-verified
   dashboard/tasks/notes/flashcards/studygroups set).
2. **The computed-identical tag differences** (Tasks "My Lists" p-vs-h3, the
   Settings Appearance h2-vs-div — the S192 adjudications, unchanged).
3. **The AI view's heads-delta** (the reference's real h3 quick-action
   titles + hero vs the clone's span role=heading stand-ins) — the S192
   axe-clean superset adjudication, computed-identical, pinned by EP2/EP4.
4. **The Files "Upload" affordance** — the S183 outline port (the S192
   dark-mode-artifact adjudication, re-confirmed by the S192 HTML dump).
5. **The MathSolver solution card** — the S14 aria-live superset (pinned).
6. **The dashboard 6-vs-4 grid-div count** in the rough structural probe —
   the S192-counted artifact (the probe counts ALL grid children, not stat
   cards; the deeper S192 probe measured 4 stat cards on both hosts).

**REAL GAPS: NONE.** The reference is unchanged since the S192 close — the
consolidation window is clean.

## §2 The axis (why the timetable family, why now)

- `parity-session7.spec.ts` remains the suite's largest file at **2,646
  lines / 25 describes / 70 pins** after the S189 (notes, 49 pins) and S191
  (flashcards, 18 pins) splits — the default landing spot for six
  generations of pins, still carrying four view families it inherited from
  the session-7 era.
- The **timetable family is its largest remaining view family: 4 pure
  describes / 15 pins** — exactly the S192 close's named candidate
  ("S7-C + CB6 + DJ2 + S185/EI ≈ 15 pins", twice deferred by the
  blast-radius rule).
- The view-dedicated convention: `tasks.spec.ts` (S167), `notes.spec.ts`
  (S189/EM), `flashcards.spec.ts` (S191/EO) — the timetable home is the
  fourth application of the pattern.

## §3 The characterization contract (the Mode-D discipline — no honest-RED shape exists for a refactor)

1. **The pre-split baseline**: `parity-session7.spec.ts` cold-green at
   **70 pins** (verified by `--list`, never estimated — the S189 lesson 2).
2. **The byte-faithfulness machine checks** (the S189/S191 doctrine):
   (a) every moved block byte-identical to its source range INCLUDING its
   leading comment run (the comment-block ownership walk — S191 lesson 5);
   (b) the title multiset (the moved pins' titles exactly the pre-split
   members); (c) the describe/pin arithmetic: 4 moved describes + 21
   staying = 25 before; 15 moved pins + 55 staying = 70 before.
3. **The post-split equivalence**: the two-file cold run
   (`parity-session7.spec.ts` + `timetable.spec.ts`) reproducing the
   pre-split outcome — 70 pins green, first-roll.
4. **The chunk-2 composition cold** (the budget map holds: the same chunk,
   the same POST units — the moved family issues ZERO timetable writes).
5. **The 5-chunk cold cert map: 744/744 UNCHANGED** (a pure reorganization —
   no pins added, none removed; the Expected lines hold 160+275+116+101+92).

## §4 The extraction spec (the exact blocks, the exact boundaries)

| # | Describe | Source lines (1-indexed, inclusive) | Pins |
|---|----------|-------------------------------------|------|
| 1 | `S7-C · Timetable week grid` | 82–155 (no leading comment block; the S119/BT9 note rides INSIDE) | 4 |
| 2 | `S161/DJ2 · the timetable band hand-guard (Batch DJ)` | 278–313 (comment block 278–286) | 1 |
| 3 | `S127/CB6 · the timetable renders the reference's 14 hour rows` | 545–582 (comment block 545–551) | 2 |
| 4 | `S185/EI · the Timetable week-strip rows port` | 1996–2325 (the describe's internal comments ride inside) | 8 |

- **478 source lines move**, declaration order preserved (S7-C → DJ2 →
  CB6 → EI).
- The new file's header follows the `flashcards.spec.ts` template: the
  consolidation note (cycle, boundary decisions, contracts), the local
  `hydrated` helper (the ONLY file-local dependency — verified: the `rgb`
  helper is never called by the moved pins), and the import line.
- parity-session7.spec.ts keeps **21 describes / 55 pins** and its header
  comment re-anchors (the S7-C line joins the S7-A/S7-F moved-family notes).

### The boundary adjudications (the S189/S191 doctrine)

- **The strays outside the split source STAY**: S165/DN1 (the timetable
  CB8 failure-domain pin in parity-session9 — session-lineage home), the
  theme-system S11-2..5 timetable mobile-tile leg (the theme-axis home),
  the a11y-sweep /Timetable leg (the cross-view a11y home), and the
  mobile/midband/landscape drawer-sweep navigation legs (the
  viewport-axis homes). A pin's VIEW is not its FAMILY — the family is the
  pin's batch lineage + coverage axis.
- **The mixed describes STAY**: no mixed describe touches the moved set
  (the four moved describes are pure — every pin drives /Timetable or its
  API family; verified pin by pin this cycle).

### The chunk-map and residue analysis (the S189 lesson 3, both directions)

- **The chunk assignment**: `tests/e2e/timetable.spec.ts` joins **chunk 2**
  (its 10th file) — the SAME chunk as the split source, so the per-chunk
  POST budget and the register/login budgets hold by construction (the
  moved pins issue no uploads, no registers; every test rides the
  authenticated storageState).
- **Playwright orders files alphabetically** (re-verified empirically this
  cycle via `--list` on the chunk-2 file set): the current order runs
  parity-session7 5th; after the split, timetable.spec.ts sorts LAST
  (tasks < theme-system < timetable).
- **Direction 1 — what the moved pins now see** (the residue timeline):
  four files that ran AFTER parity-session7 now run BEFORE timetable.spec.ts
  — parity-session9 (its S165/DN1 timetable pin is SELF-CLEANING: the
  finally DELETE, the zero-residue convention), s14-hardening (zero
  /api/timetable calls), tasks (zero /api/timetable calls), theme-system
  (the afterEach restores light + the accent pins self-restore violet at
  their close). The moved pins are SEED-ANCHORED and read-only: every pin
  starts `goto("/Timetable") + hydrated()` and asserts the SEED's 5 classes
  (Calculus II / World History / Physics / English Literature / Chemistry
  Lab, ISO Mon–Fri) — never another spec's residue. The DJ2 pin asserts
  ZERO POSTs; the dialog-opening pins (S7-C BT9, EI5, EI8) close or
  abandon their dialogs page-scoped.
- **Direction 2 — what the neighbors now see**: NOTHING runs after
  timetable.spec.ts (it sorts last) — the moved family's (zero) residue
  exposes no neighbor.
- **The theme-axis ambient risk, recorded**: a theme-system accent pin
  FAILING mid-test after a blue PATCH could leave the shared demo user at
  a non-violet accent, and the EI3/EI6 violet-today pins (last in the
  chunk) would then read the wrong tint. This failure mode is unreachable
  in the current map (nothing ran after theme-system); the consolidation
  makes it REACHABLE but only through a prior pin's FAILURE (each accent
  pin self-restores violet on its green path). Accepted ambient risk,
  documented here — the cold chunk-2 run is the proof.

## §5 The execution order (TDD-shaped for a Mode-D cycle)

1. Characterize: cold `--list` + cold run of parity-session7.spec.ts (70 +
   setup, first-roll) — the pre-split baseline.
2. Machine-verify the block map (the §4 boundaries) against the live file.
3. Write `tests/e2e/timetable.spec.ts` (header + helper + the four blocks,
   byte-identical, declaration order preserved).
4. Delete the four blocks from parity-session7.spec.ts; re-anchor its
   header comment (the S7-C moved-family note).
5. Machine-verify the byte-faithfulness trio (containment + multiset +
   arithmetic).
6. `--list` census: 739 chromium + setup = 740 UNCHANGED, in **33 spec
   files** (was 32).
7. The two-file cold run: 70 pins green (the pre-split equivalence).
8. The chunk-map lockstep: BOTH cert scripts' CHUNKS arrays gain
   `tests/e2e/timetable.spec.ts` (chunk 2's 10th file) + the S193/EQ
   re-tag headers (the Expected lines UNTOUCHED — the totals hold) + the
   `tests/script-conventions.test.ts` tripwire comment chain.
9. The full gates: lint · tsc · unit 1799/1799 · build (the :3200 daemon
   killed by port FIRST — the S191 lesson 1).
10. The chunk-2 cold composition (10 files, 275 expected), then the full
    5-chunk cold cert map (744 expected).
11. The closing chrome: the drawer check + the desktop parity probe.
12. The evidence frames: the timetable desktop + mobile captures under
    `docs/screenshots/` (the self-verified convention).
13. The doc-chain lockstep (§7) + the worklog Session-204 entry + this
    plan's §9 close-out.

## §6 The re-anchor risk register

- `tests/e2e/parity-session7.spec.ts` — the four block deletions + the
  header re-anchor (the ONLY source-file changes).
- `tests/e2e/timetable.spec.ts` — NEW (the moved blocks + header).
- `scripts/e2e-chunked-cert.sh` + `scripts/run-cert-chunk.sh` — the CHUNKS
  arrays + the S193/EQ re-tag headers.
- `tests/script-conventions.test.ts` — the tripwire comment chain (the
  Expected-line assertion itself UNTOUCHED — it pins
  `Expected: 160 + 275 + 116 + 101 + 92 = 744`, which holds).
- The census sites — the spec-file count moves 32 → 33 at: AGENTS.md (the
  Commands table), README.md (the tree diagram + the Session-193 row),
  omni-study1_SKILL.md (§ the census sites + the §11 green-state re-anchor),
  vitest.config.ts (the header note), CLAUDE.md (the e2e line's
  session-7 reference).
- `Project_Architecture_Document.md` — the v1.3.101 revision block.
- `worklog.md` — the Session-204 entry.

## §7 The verification ledger (what proves this cycle)

- The pre-split baseline cold (70 + setup) and the post-split two-file cold
  (70 green, first-roll) — the equivalence proof.
- The byte-faithfulness machine checks (containment + multiset +
  arithmetic).
- The `--list` census: 740 total in 33 spec files (739 chromium + setup).
- The full gates: lint · tsc · unit 1799/1799 · build.
- The 5-chunk cold cert map 744/744 (the Expected lines hold).
- The closing chrome: the drawer check GREEN + the parity probe MATCH.
- The evidence frames under `docs/screenshots/` (self-verified).

## §8 The deliverables

- This plan (§5 executed, §9 closed).
- `docs/session_258.md` (the transcript).
- The worklog Session-204 entry.
- The timetable evidence frames.
- The re-verified `.env` / `.env.example` (no env changes expected).

## §9 The close-out (as executed)

- The §5 order ran in sequence, every step first-roll:
  - **The pre-split baseline cold**: parity-session7.spec.ts **71 passed**
    (70 pins + the setup test), first-roll, zero flakes.
  - **The extraction**: `scripts/split-timetable-s193.py` — the boundary
    assertions against the live file, the byte-identical block extraction
    (478 lines), the header re-anchor, and the machine checks (block
    containment + the title multiset + the arithmetic 4+21=25 describes,
    15+55=70 pins) all GREEN in one pass.
  - **The post-split equivalence**: the two-file cold run **71 passed,
    first-roll** — the identical outcome to the pre-split baseline.
  - **The census**: `--list` 740 total (739 chromium + the setup test) in
    **33 spec files** (was 32); every count UNCHANGED; the badge holds
    2543.
  - **The full gates**: lint ✓ · tsc ✓ · unit 1799/1799 (the
    script-conventions tripwire machine-verifying the cert-script edits —
    the `bash -n` syntax check + the Expected-line pin) · build ✓ (the
    :3200 daemon killed by port FIRST; the bundled
    `.next/standalone/.env` verified `AUTH_SECRET=""` — the s22 contract).
  - **The cert map**: chunk 1 **160** ✓ · chunk 2 **275/275 cold** (10
    files, the new composition) · chunk 3 **116** ✓ · chunk 4 **101** ✓ ·
    chunk 5 **92** ✓ — the full map **744/744**, every chunk first-roll.
  - **The closing chrome**: the drawer check GREEN (**the 146th**) · the
    desktop parity probe MATCH (all five checks).
  - **The evidence**: the four self-verifying frames (the timetable
    desktop + mobile on the re-booted :3200 standalone; the dashboard +
    the mobile drawer on the dev server :3000) — DOM-asserted before the
    shots, pixel-verified non-blank.
  - **The residue discipline**: the reference account untouched
    (read-only navigation + login; zero rows created or deleted).
- The doc-chain lockstep completed: AGENTS (the census line 32 → 33 + the
  S193 lessons ×4) · CLAUDE (the session-7 e2e line's timetable-home note)
  · README (the tree diagram + the Session-193 row) · the SKILL census
  sites + the §11 green-state re-anchor · the vitest header (the S193
  re-anchor) · the cert scripts' re-tags (BOTH) + the tripwire comment
  chain · the PAD v1.3.101 · the worklog Session-204 entry ·
  `docs/session_258.md` · `.env.example` re-verified (no env changes).
- The deviation record: ONE evidence-capture iteration (the mobile frame's
  first attempt clicked the hidden desktop sidebar locator — fixed by
  navigating the deep link per the SPA rewrite contract; and the
  dev-server drawer frame's first assertion measured the dialog overlay
  instead of the inner w-72 panel — fixed to the panel). No plan-level
  deviations; the extraction, the equivalence, and the certification all
  landed first-roll.


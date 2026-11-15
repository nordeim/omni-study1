# The S189 remediation plan — the notes-family e2e consolidation (Batch EM: parity-session7 split into the dedicated notes home)

The axis: the S188 close's named S189 candidate — "the notes-family e2e
consolidation (the S188 close's words: "parity-session7 is 140 pins across five
families" — the run-output figure incl. the setup test; the file's own
--list census is 137 chromium pins) — now with
a clean behavior-change-free window." Five times deferred (the S185
worklog's count: "37 pins deep, five times deferred" — the EA–EE batch
families at that era; the family has since grown), each deferral a
deliberate blast-radius decision: a pure test-organization refactor must
not share a cycle with a behavior change, and no clean window had opened
since. The S188 cycle shipped the staged-row GC with the consolidation
explicitly deferred to S189 as a recorded decision (the S188 plan §6.4) —
this IS the clean window.

## §0 The context and the baseline

- The workspace: the S188 close `0fd1051` + the operator's session_249
  transcript commit `0d389b8`, on `main`. The environment was already
  derived (bun install 516 pkgs, `.env` at `DATABASE_URL="file:../db/custom.db"`
  with `db/` at the repo root, db push + seed, the pinned chromium v1243
  present).
- The cold baseline reproduced the S188 close EXACTLY: lint ✓ · tsc ✓ ·
  unit **1799/1799 (55 files)** · build ✓.
- The standing chrome at the open: the drawer check GREEN (**the 137th
  consecutive** — no Tailwind v4 mobile-nav bug; backdrop
  `oklab(0 0 0 / 0.2)` + blur(4px), 288px panel, 20 links, no footer,
  Escape + navigate auto-close, appbar z-40 fixed) · the desktop parity
  probe **MATCH** (all five structural checks, both hosts: sidebar 260,
  20 links, the first-five links, mainX 260, mainWidth 1180 — the
  reference probed fresh this session, dark-mode account, zero residue).
- The recent-changes audit (the S188 commits): the staged-row GC seam
  verified in place (`gcStagedNoteAttachments` +
  `STAGED_ATTACHMENT_RETENTION_MS` in `src/lib/server/note-attachments.ts`,
  wired after the rate-limit guard in the staged upload POST,
  error-tolerant, user-scoped) — the diff read line by line, clean.
- The pre-split characterization (Mode D — the refactor discipline): the
  file under the knife run cold against the fresh standalone build —
  **137 passed + 1 flaky** (the DY1 subject-dialog pin, the documented
  S176/DZ5 retry-class environmental flake, green on its one retry) =
  137 chromium pins + the setup test (the report's "138").

## §1 The record (why this file is the debt)

`tests/e2e/parity-session7.spec.ts` is **5,415 lines, 50 describes, 137
pins** (by `--list`) — the suite's largest file by 3.4× and the only one over 2,000
lines. It began as the S7 era's "lightly-probed views" home (flashcards,
study groups, timetable, analytics, grade tracker, notes title) and
became the DEFAULT LANDING SPOT for six generations of pins: the AD/AG/
AH/AE hardening batches, the AO/AP zombie kills, the BX8–CE2 catch-ups,
the DU2–DZ3 create-dialog parity ports, the EA–EE notes feature ports,
and the EG–EK view-layer ports. The notes family alone is 14 describes /
49 pins / ~1,760 lines (36% of the file's describes) — every notes pin added since
S177 landed in a file whose header still says "Session-7 parity pins."

The costs are concrete:
1. **Navigation cost** — any notes-family work (the S177–S181 ports, the
   S188 EL relocation analysis) requires scrolling a 5,415-line file to
   find the family; the S188 plan §3.4's placement analysis had to
   reconstruct the family census by hand.
2. **Blast-radius opacity** — a notes pin edit re-runs the whole file in
   CI terms of mental overhead; the file mixes five upload-budget
   consumers (the notes ED family) with unrelated families, which is
   exactly how the S188 429 happened (the budget census had to count the
   whole chunk's units before placing three pins).
3. **The naming lie** — `parity-session7` no longer describes the
   contents; new pin authors land notes pins there by inertia (the S188
   EL pins' first cut did exactly that).

## §2 The gap table

| # | Surface | Current (pre-change) | Post-change | Class |
|---|---|---|---|---|
| G1 | The notes pins' home | 14 describes interleaved in parity-session7.spec.ts (5,415 lines) | `tests/e2e/notes.spec.ts` — the dedicated notes home, 49 pins, declaration order preserved | test-organization (zero behavior change) |
| G2 | parity-session7's size/identity | 137 pins, 5,415 lines, the default landing spot | 88 pins, 3,388 lines, the S7-lineage + non-notes families home | test-organization |
| G3 | The census sites (AGENTS/CLAUDE/README/SKILL/vitest/cert/tripwire) | "30 spec files" / the stale README tree-diagram e2e count (672, an S180-era figure) | 31 spec files / 723 / the S189 re-tag chain | documentation lockstep |

## §3 The port design

1. **§3.1 The moving set (14 describes, 49 pins, byte-faithful)** —
   every notes-view describe, in declaration order:
   S7-F (Notes editor title, 2) · S7-AD (Notes rich-text editor, 8) ·
   S161/DJ1 (notes tag failure surfaces, 2) · S80/AG6 (autosave streak
   scoped to the note, 2) · S81/AH1 (delete flow settles the selection
   mirror, 2) · S81/AH2 (departed-Save settlement, 3) · S81/AH8
   (partial-PATCH keeps what the caller did not send, 5) · S142/CQ3
   (notebook mover keyboard-reachable, 2) · S166/DP3 (notes search
   matches rendered text, 2) · S177/EA1 (inline-draft create flow, 5) ·
   S178/EB (view/edit mode split, 5) · S179/EC (pin/palette/coding-note
   port, 5) · S180/ED (Attach-File wire + B-8 Font-row port, 7) ·
   S181/EE (tag-row family port, 13 — the EF6 Files-subtitle rider
   rides along, the describe's own batch boundary).
   The STAYING set: the S7-A/B/C/D/E flashcards/studygroups/timetable/
   analytics/gradetracker families, the S7-P practice-tests empty state,
   DJ2 (timetable), the AD flashcards rework, AE (mixed 2-notes +
   2-flashcards — an AUDIT-batch label, not a view family; it stays with
   its s78-audit siblings), AG9, AH6, AH4b, S82, AO, AP, BX8, BZ1, CB6,
   CB13, CE2, DU2–DY4, DZ1–DZ3, EG, EH, EI, EJ, EK — 36 describes,
   88 pins.
2. **§3.2 The new file** — `tests/e2e/notes.spec.ts` (the view-dedicated
   convention: tasks.spec.ts, calculator.spec.ts, dark-mode.spec.ts are
   the precedents). The header comment carries: the consolidation record
   (S189/EM), the lineage of the families it holds, the SEED fixtures
   the pins depend on ("Essay sources" in Reading Journal, "Lecture
   Notes" — prisma/seed.ts), the upload-budget note (the ED family's ~5
   staged upload POSTs ride the chunk-2 shared 20/15-min bucket — the
   S188 lesson 3), and the alphabetical-order note (the file runs after
   a11y-sweep, before parity-session6 — inside the SAME chunk as before,
   so the within-chunk budget and the residue timeline for the
   after-neighbors are unchanged). The helpers `hydrated` + `rgb` are
   carried (both used; tsc's noUnusedLocals applies to spec files).
3. **§3.3 The extraction mechanics (machine-verified byte-faithfulness)**:
   a Python script reads parity-session7.spec.ts, extracts the 14
   describe blocks by exact line ranges, writes notes.spec.ts (the
   import + header + helpers + the 14 blocks verbatim, original relative
   order), and rewrites parity-session7.spec.ts (its header amended with
   the consolidation note, the non-notes describes in original order).
   The script then VERIFIES: (a) every extracted block is byte-identical
   to its source range; (b) the test-title multiset of the two new files
   equals the original 137 exactly (no loss, no duplication, no rename);
   (c) the describe-count arithmetic (14 + 36 = 50).
4. **§3.4 The chunk map** — chunk 2 gains `tests/e2e/notes.spec.ts`
   (8 files, 275 tests — the TOTAL is unchanged: 88 + 49 = 137 from the
   split source). The `Expected: 158 + 275 + 103 + 95 + 92 = 723` line
   is UNTOUCHED. The upload budget: unchanged by construction (the ED
   family's POSTs stay in chunk 2; the alphabetical re-timing can only
   relax the window pressure — the notes pins fire EARLIER in the chunk,
   so more of their units age out of the 15-min window before s14's
   CU1a/CU1b run; the S188-verified 275/275 composition is the floor).
   The within-chunk ORDER delta, adjudicated safe by analysis:
   - The notes pins now run BEFORE parity-session6/7/9 instead of inside
     parity-session7. The neighbors' exposure to notes residue is
     unchanged-or-reduced: parity-session6 never touches /Notes or
     /api/notes; parity-session7's remaining 88 pins assert on ten other
     views (the EH empty-state pins are order-independent by
     construction — the EA3 route-interception pattern); parity-session9
     and everything after already ran after the notes pins today.
   - The notes pins' exposure: a11y-sweep's residue only (it runs before
     them today too — unchanged); they no longer see parity-session6's
     or the earlier parity-session7 pins' residue (strictly LESS
     cross-file state). The pins are seed-anchored (each starts
     `page.goto("/Notes")` + `hydrated`, creates and cleans up its own
     probes — the zero-residue doctrine), and the CQ3/AD fixtures ride
     the SEED, not other pins.

## §4 The characterization plan (Mode D — behavioral equivalence, not RED→GREEN)

This cycle changes ZERO application behavior — there is no honest-RED
shape. The refactor discipline (the coding-agent Mode D contract):
characterize first, refactor incrementally, verify equivalence after
each step:

1. **The pre-split characterization** (§0, done): the file cold-green
   137 + setup green against the fresh standalone build.
2. **The equivalence proofs** (each a hard gate):
   - The census proof: `playwright test --list` — notes.spec.ts = 63,
     parity-session7.spec.ts = 75, the suite 719 total in 32 files
     (718 chromium + the setup test).
   - The title-multiset proof: the extraction script's machine check (b)
     — the 137 titles identical, order preserved within each file.
   - The cold-run proof: both files green in one cold composition
     (63 + 75).
   - The chunk-2 composition: 275/275 (the S188-verified floor).
   - The full 5-chunk cold cert map: 158 + 275 + 103 + 95 + 92 = 723.
3. **The unit gates**: lint ✓ · tsc ✓ (the new file typechecks under
   noUnusedLocals) · unit 1799/1799 (the tripwire re-green — the DA6
   cross-read pins self-anchor to the vitest header + the cert script's
   unchanged Expected line).

## §5 The execution order (the TODO list)

1. [x] The environment + the cold baseline (lint/tsc/unit/build) + the
   standing chrome (drawer 137th + parity probe MATCH) + the recent-
   changes audit + the pre-split characterization (137 + setup cold).
2. [x] This plan.
3. [x] **The split** — the extraction script (§3.3), its three machine
   verifications green.
4. [x] **The post-split proofs** — the --list census (49 + 88 = 137
   chromium pins; the suite 719 in 32 files); the cold two-file
   composition (137 + setup — the identical outcome to the pre-split
   baseline down to the same DY1 retry-class flake); the chunk-2
   composition **275/275**.
5. [x] **The chunk-map lockstep** — the cert script's chunk-2 file list
   + the S189 re-tag header comment (the Expected line UNTOUCHED —
   275/723 hold) + the paired run-cert-chunk.sh runner (the CF6
   byte-identity tripwire caught the missed runner live — the anti-rot
   mechanism working, the second live catch in two cycles).
6. [x] **The doc-chain lockstep** — AGENTS (the census line 30 → 31 spec
   files + the S189 lessons block, five lessons), CLAUDE (the census
   line's notes-home reference), README (the tree-diagram e2e count
   672 → 723 — the stale unpinned site found in this cycle's audit +
   the Session-189 row), SKILL (the green-state line + the §11 census
   site re-anchored S189/EM), the vitest header (the S189 re-anchor),
   the PAD **v1.3.97**, the script-conventions tripwire comment chain.
7. [x] **The full gates** — lint ✓ · tsc ✓ · unit 1799/1799 · build ✓
   (the §0 build; no application code changed this cycle).
8. [x] **The 5-chunk cold cert map** — **723/723** (158 + 275 + 103 +
   95 + 92; the cert log at `cert-s189.log`, launched reaper-proof via
   `scripts/launch-cert-s189.py`).
9. [x] **The evidence frames** — `docs/screenshots/189-notes-home-
   desktop.png` (the consolidated family's home surface, the seeded
   fixtures DOM-asserted) + `189-consolidation-census-proof.png` (the
   proof table generated FROM the live spec files' own census, the
   14/49/36/88 arithmetic asserted before the shot; both frames
   pixel-verified non-blank).
10. [x] **The closing chrome** — the drawer check GREEN (**the 138th**)
    + the desktop parity probe MATCH (all five structural checks, both
    hosts).
11. [ ] **The commit + the SSH-wrapper push** (the operator's standing
    sequence).

## §6 The adjudications (the open questions, resolved)

1. **§6.1 The full notes family moves (49 pins), not just the EA–EE
   batches (35).** The deferral's "37 pins deep" counted the modern
   batches at the S185 era; the family's actual extent is every
   notes-view describe. A partial extraction would leave the navigation
   cost (§1.1) and the naming lie (§1.3) half-fixed and force a SECOND
   re-verification cycle later. The re-verification cost (the full cert
   map) is identical either way — the complete consolidation is the
   better trade.
2. **§6.2 The AE hardening family STAYS.** It is mixed (AE1/AE2 notes,
   AE4/AF1 flashcards) and labeled by its AUDIT batch (the s78 audit),
   not by a view. Its notes pins are editor-HARDENING pins (the load
   window, the autosave toast), kindred with their audit siblings. The
   describe is the unit of consolidation (§6.4); splitting INSIDE a
   describe fragments its shared context. The cost: two notes-flavored
   pins (AE1/AE2) live in parity-session7 — recorded here as the
   intentional boundary, not an oversight.
3. **§6.3 The EF6 Files-subtitle rider rides with EE.** The EE describe
   is "the notes tag-row family port" — 12 notes pins + the one EF6
   Files-header rider that landed in the same S182 batch. The describe's
   batch boundary is the pin's documented lineage; splitting it off
   would rewrite history the pins' comments rely on.
4. **§6.4 The describe is the unit of consolidation.** No pin moves
   without its describe; no describe is split. This preserves every
   pin's comment context, its describe-scoped fixtures, and its
   lineage labels — and makes the byte-faithful extraction mechanically
   verifiable (§3.3).
5. **§6.5 The file name is `notes.spec.ts` and the chunk is unchanged.**
   The view-dedicated convention (tasks.spec.ts precedent); the chunk-2
   home preserves the upload budget and the after-neighbor timelines
   (§3.4). The alternative — a new sixth chunk for the notes home —
   would add a server boot + seed to every cert run for zero benefit
   and re-draw the budget map the S188 cycle just stabilized.
6. **§6.6 The historical references stay.** The README session-table
   rows, the PAD revision history, and the old plans that say "the EA1
   pins in parity-session7" record their era truthfully; only the LIVE
   count-keepers (AGENTS/CLAUDE/README badge+tree/testing lines, SKILL,
   vitest header, cert header, tripwire) re-anchor. The one exception:
   the README tree diagram's e2e count — a LIVE site (the current-state
   tree) carrying the stale S180-era 672 — is corrected to 723 with the
   DA6 lesson noted (it is the second doc-rot site the audit found
   beyond the tripwire's reach; the first, the tree's unit count, was
   the S188 tripwire catch).
7. **§6.7 The `hydrated`/`rgb` helpers are DUPLICATED into the new
   file, not extracted into helpers.ts.** Two four-line closures shared
   across 31 spec files is a coupling step the repo has never taken
   (every spec file today defines its own probe preamble); the
   convention is per-file self-containment. The duplication is the
   documented cost of the convention.

## §7 The re-anchor risk register

- `tests/e2e/parity-session7.spec.ts` — 137 → 88 pins; the header gains
  the consolidation note; the non-notes describes byte-identical.
- `tests/e2e/notes.spec.ts` — NEW; 49 pins; the moving describes
  byte-identical; the helpers duplicated (§6.7).
- `scripts/e2e-chunked-cert.sh` — the chunk-2 file list gains
  notes.spec.ts; the Expected line UNTOUCHED (275 holds); the header
  gains the S189 re-tag.
- `tests/script-conventions.test.ts` — the tripwire assertion
  (`Expected: 158 + 275 + 103 + 95 + 92 = 723`) UNTOUCHED; the comment
  chain gains the S189 entry.
- The census sites — AGENTS.md:14 (30 → 31 spec files), the vitest
  header (the S189 re-anchor comment; the unit counts UNCHANGED at
  1799/55), the SKILL green-state line, the CLAUDE census line, the
  README tree diagram (672 → 723), the PAD v1.3.97.
- The global-setup / auth.setup / playwright.config — UNTOUCHED (the
  new file is auto-discovered by the chromium project's default
  *.spec.ts match; the storageState posture is inherited).
- The budgets — chunk 2's upload budget, the register budgets, the
  boot cadence: all UNCHANGED by construction (§3.4).

## §8 The verification ledger (what proves this cycle)

- The pre-split characterization: 137 + setup cold (§0, the one documented
  retry-class flake recorded).
- The extraction's three machine checks (byte-faithful blocks, the
  title multiset, the describe arithmetic).
- The --list census: 63 + 75, 719 in 32 files.
- The cold two-file composition (137) + the chunk-2 composition (275) +
  the full 5-chunk cert map (723).
- The unit gates: lint · tsc · 1799/1799 (the tripwire green).
- The closing chrome: the drawer check (the 138th) + the parity probe
  MATCH.
- The evidence frames under `docs/screenshots/` (self-verified).

## §9 The close-out (as executed)

- The §5 order ran in sequence: the baseline + chrome + audit +
  characterization → the plan → the split (three machine checks green)
  → the post-split proofs (the census by `--list` 49 + 88 = 137, the
  suite 719 in 32 files; the two-file cold composition reproducing the
  pre-split baseline EXACTLY — 137 passed + the same DY1 retry-class
  flake; the chunk-2 composition 275/275) → the doc-chain lockstep
  (the CF6 tripwire catching the missed run-cert-chunk.sh runner live —
  fixed + re-green) → the gates (lint ✓ · tsc ✓ · unit 1799/1799 ·
  build ✓ — the §0 build, no application code touched) → **the 5-chunk
  cold cert map 723/723** (158+275+103+95+92, `cert-s189.log`) → the
  two self-verifying evidence frames → the closing chrome (the drawer
  check GREEN — the 138th; the desktop parity probe MATCH) → the commit
  + the SSH-wrapper push.
- **The census correction en route** (recorded as the S189 lesson 2):
  the first-cut pin arithmetic (63 moving / 75 staying / 138 total) was
  a grep artifact — a `test(` pattern matches `test.describe(` lines
  and a run's reported total counts the setup project's test. The
  authoritative `--list` census corrected it to **49 / 88 / 137** before
  any file was written (the extraction script's assertions were
  re-anchored to the true values; the plan's §2/§3.1 figures were
  written from the corrected census).
- The §6 adjudications held as designed: the full notes family (§6.1);
  the AE audit family staying (§6.2); the EF6 rider riding with EE
  (§6.3); the describe as the unit (§6.4); notes.spec.ts + the
  unchanged chunk (§6.5); the historical references staying + the
  live tree-diagram site corrected (§6.6); the helpers duplicated
  (§6.7).
- The equivalence ledger: pre-split 137 + setup (1 documented flake) →
  post-split 137 + setup (the IDENTICAL flake signature) → chunk 2
  275/275 → the full map 723/723. Zero application behavior change;
  zero assertion change; zero pin loss (the title-multiset machine
  check).

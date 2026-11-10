# Remediation Plan — Session 167 (Cycle 117, Batch DQ)

> Status: PLANNED (pre-change record — the immutable plan; the as-executed
> close lives in §9). Written before any source change, per the standing
> doctrine ("write the cycle plan into docs/remediation-plan-sessionN.md
> BEFORE any source change").
>
> Operator directive: refresh the workspace, re-read the doc chain
> (AGENTS/CLAUDE/README/PAD/SKILL + session_205 +
> remediation-plan-session166 + worklog), validate against the codebase,
> audit with the repo-included skills (skills/web-application/SKILL.md the
> primary; the skills catalog for the rotation), iterate toward
> visual/functional parity with omni-study1.base44.app (live reference
> login, mobile-nav attention, the Tailwind v4 bug watch), keep `.env` at
> `DATABASE_URL="file:../db/custom.db"` + the repo-root `db/`, validate the
> vitest/playwright suites, remediate TDD-first, capture evidence frames,
> update the doc chain, push via the SSH wrapper. The repo's `skills/`
> folder stays excluded from code checking, testing, and compilation.
> Proceed with best judgement on the remaining open questions (the
> operator's standing instruction).
>
> Session note: this cycle continues the rotation from the S166/Batch DP
> close (`5daa566` pushed + remote-verified; `391abdb` ticked the plan's
> final checklist item). The workspace SURVIVED this time (no reset —
> `git pull` reported "Already up to date" at `391abdb`; node_modules, the
> repo-root `db/`, `.env` byte-identical to `.env.example` at the
> documented dev posture, and the dev daemon on :3000 all verified live
> before the baseline), and every surface below was verified by direct
> read in THIS session before this plan was written.

## §0 Scope, method, cold baseline, live parity

**Workspace (warm at `391abdb` on `main` — the S166/Batch DP fix
`5daa566` + the plan-tick `391abdb`; `git pull` a no-op; the environment
verified in place: node_modules present, the repo-root `db/` carrying
custom.db + e2e.db, `.env` byte-identical to `.env.example` at the
documented dev posture (`DATABASE_URL="file:../db/custom.db"`), the dev
daemon answering 200 on :3000/login).**

Cold baseline (before any work): lint ✓ · tsc ✓ · the full Vitest run
**1679/1679 (51 files — the documented S166 final state exactly)** ·
dev-server preflight GREEN · **the drawer check GREEN (the 94th
consecutive** no-Tailwind-v4-mobile-nav-bug confirmation — backdrop
oklab(0 0 0 / 0.2)+blur(4px) match, 288px white panel, 20 links both
hosts, no footer, Escape-close superset) · the desktop parity probe
**MATCH** (all five formal checks — sidebar shell 260, nav-link count 20,
first-links sequence, mainX 260, mainWidth 1180; live reference login;
run through the s142 formal probe — the s141 one-shot tripped its own
documented inner-nav artifact [258px inside the 260px shell], re-derived
this cycle exactly as recorded, no code regression). Baseline noise:
none. The config posture re-validated for the operator's standing ask:
the vitest include matches `src/**/*.test.ts` + `tests/**/*.test.ts`
only; the playwright testDir is `tests/e2e` with the production-build
webServer on `db/e2e.db`; tsconfig excludes `skills`; eslint ignores
`skills` — the repo-included `skills/` folder is excluded from code
checking, testing, and compilation on every axis.

## §1 The audits (Mode-C; every H/L finding re-verified by direct read by the orchestrator)

### Audit A — the Batch DP recent-changes axis (the `5daa566` fix commit; `391abdb` docs-only): **0C / 0H / 0M / 0L / 0I — clean.**

All three DP claims verified at the source anchors: **DP1** — the seven
contained catches at data.ts:748-811 (the notebooks trio + the notes trio
+ the setNoteTags chain, the doctrine comment re-tagged S166/DP1, the
fifth family); **DP2** — `role="status"` + `aria-label="Loading notes"`
on the list-pane gate (notes-view.tsx:756) + `role="status"` +
`aria-label="Loading note editor"` on the main-pane gate (:832, with the
differentiated-labels comment); **DP3** — the `htmlToText` export
(text.ts:54) + `stripHtmlPreview` delegating through it (:68) + the
view's rendered-text search (notes-view.tsx:78 import, :292 the
`htmlToText(n.content)` content leg). The test anchors: the DP1 unit
pair set (data-store.test.ts:851-938), the DP1 e2e leg
(parity-session9.spec.ts:856), the DP3 e2e leg (parity-session7). The
doc census chain machine-verified: README badge `2308 green` + the
Session-166 row; AGENTS 1679 + 629 + the S166 lessons block (:3061);
CLAUDE 1679 + 629; PAD v1.3.74; SKILL (1679 ×3 + 2308 ×2); the vitest
header (vitest.config.ts:4, re-anchored S166/DP); the cert runner re-tag
(both scripts: 629, chunk 2 196). The commit diff is surgical (no
skills/ files touched). The one leftover: an UNTRACKED scratch
`cert-s166.log` at the repo root (the S166 cert run's console log — the
tracked `scripts/launch-cert-s*.py` runners are the committed artifacts;
the root .log is scratch) — removed this cycle before the commit (never
staged).

### Audit B — the flashcards family (the rotation's fresh axis: the S166 close's own "Next cycle" list NAMED this axis — "the family-wide CB8 port's REMAINING families (flashcards/tasks …) — each family gets its own rotation-axis audit + pin set; the events/exams/assignments/timetable/notes pin sets are the templates" — flashcards is NEXT in the S165 close's recorded order; the family's point-fixes rode S77/AD9+AD10+AD11 (the measured chrome: the deck colors, the card chrome, the rating-is-navigation semantics), S78/AE6 (the mobile squeezed shape — the same documented parity decision the Notes view made), S79/AF1+AF7 (the study-session binding + the mobile in-row study affordance + the generate rider), S80/AG8+AG9, S81/AH6 (the row keyboard path), S88/AO4 + S89/AP1 (the study-zombie structural kill), S119/BT12 (the mastery-mark toast), S120/BU17b+BU17c, S123/BX8 (the effective-id highlight), S125/BZ1+BZ12 (the card dialog contract + the flat cards route with deckId presence enforced at create), S126/CA6 (the distinct-createdAt seed), S127/CB8 (the generate-flow CB8 twin — ALREADY hardened), S130/CE3 (the two loading gates themselves), S137/CL3 (the take:5000 deck-completeness window), S138/CM5 (the global-across-decks doctrine), S139/CN3 (the [createdAt, id] index), S140/CO4g+CO4h, S152/DA1+DA2 (the delete double-fire latch + the hand-guard) — but the family was never deep-swept as an axis). The axis read against the web-application skill's §4/§7/§8/§9/§13/§16/§17 rubric: flashcards-view.tsx (952 lines, the sole mutation consumer — verified no other view touches the flashcards mutations) + the flashcards decks/cards API routes (the delegate factory) + the seams they consume (validation.ts's flashcardDeckSchema/flashcardSchema :413-429, the six mutations in data.ts:815-839, the flashcardDeckDelegate at entities.ts:546 + the custom flashcardCardDelegate at :603 with the deck-scoped where + the create-time deck-ownership check, the PATHS map :51-52) + the round-trip verification against the route/factory wire contracts. **Verdict: 0C / 1H / 0M / 1L / 0I.**

The family is coherent on every other axis (re-verified by direct read):

- **Ownership** — in the WHERE clause by construction (the delegate
  factory: flashcardDeckDelegate via makeOwnedDelegate with
  OWNED_FKS.deck; the card delegate's `where: { deck: { userId } }` on
  list/update + the create-time `findFirst({ id, userId })` deck check
  with the honest "That deck does not exist." ValidationError).
- **Zod at both boundaries** — the route factory parses with the
  delegate's schemas (boundedTitle, description ≤ 1000, hexColor,
  nullableId, front/back ≤ 2000; deckId OPTIONAL in the schema so a
  PATCH that only flips difficulty/mastered validates unchanged —
  presence enforced at the create seam, the BZ12 contract).
- **The bounded reads** — the deck list rides the factory's CA5
  newest-500 window; the cards list is the CL3 deck-completeness window
  (take:5000, desc-then-reversed to the asc presentation, the id
  tiebreak) with the CN3 [createdAt, id] index backing the ORDER BY.
- **The delete FK contract** — FlashcardDeck→Flashcard is
  `onDelete: Cascade` (schema.prisma:367): the view's "Deck deleted —
  its cards went with it." toast copy is honest by construction.
- **Zero useEffect in the view** — the AG6 set-state-in-effect
  discipline holds vacuously (the family keeps ZERO effects; the
  selection/zombie guards are structural, the S88/S89 kill).
- **The toast copy** — "Deck created." / "Deck updated." / "Card
  added." / "Card updated." / "Deck deleted — its cards went with it." /
  "Card deleted." + the BT12 honesty rider ("Couldn't mark the card
  mastered — it stays in rotation.") + the AF7 generate rider ("Drafted
  — but the deck didn't refresh. Reload to see the new cards.") — the
  AX-family copy shape.
- **The a11y surface** — labeled controls throughout (18 aria-labels:
  the study-mode region, the flip button, the deck-list pane, the New
  Deck button, the search input, the per-deck Study/options triggers,
  the color swatches with aria-pressed, the deck rows/detail/card-grid
  role="group"s), the focus-visible rings, the AH6 keyboard path.
- **The search** — the deck filter matches the NAME only
  (flashcards-view.tsx:108-111): names are plain text (no HTML storage
  anywhere in the family), so the DP3 raw-HTML divergence class is
  unreachable here by construction.

The findings:

- **H-1 (DQ1)** — the flashcards family mutations reject on the refresh
  leg after a COMMITTED write (data.ts:815-839, the pre-CB8 shape): all
  SIX mutations are `await apiSend(...)` then an uncaught
  `await fetchAndSet(...)` — createFlashcardDeck (:815-818),
  updateFlashcardDeck (:819-822), deleteFlashcardDeck (:823-826, the
  `Promise.all([fetchAndSet("flashcardDecks"), fetchAndSet("flashcards")])`
  double refresh), createFlashcard (:828-831), updateFlashcard
  (:832-835), and deleteFlashcard (:836-839) — and fetchAndSet REJECTS
  when its GET fails (the CD2 20 s deadline). A write that COMMITTED
  server-side followed by a flaky refresh rejected the WHOLE mutation.
  The view's failure surfaces then LIE on committed rows: the deck
  submit catch (:186-187) shows "Something went wrong." in the
  still-open dialog, fires no success toast, and keeps the form armed,
  so a RETRY re-POSTs and DUPLICATES the deck (the card submit catch
  :229-230, the same shape on cards); the delete catches (:242-243,
  :259-260) toast "Delete failed." after the delete (or the whole
  cascade) already COMMITTED (the CB8 letter: a false mutation-failure
  claim on a committed row — the exact shape the S162/DK1, S163/DL1,
  S164/DM1, S165/DN1, and S166/DP1 audits found and fixed on the
  events/exams/assignments/timetable/notes families; the recorded
  family-wide port's SIXTH family).
- **L-1 (DQ2)** — the two loading gates carry no aria contract
  (flashcards-view.tsx): the deck-list pane gate (:517-520) and the
  deck-detail pane gate (:659-662) both render `<Spinner>` inside an
  unlabeled div with no `role="status"` (the DM2 assignments / DL2
  exams / DK4 events-calendar / DN2 timetable / DP2 notes precedent
  closed this on every prior CB8-ported family — the Spinner is
  aria-hidden, so the in-flight window is silent to assistive tech;
  both flashcards gates ARE live at list level [the
  `loading && decks.length === 0` shape], and the S166 gate census
  counted flashcards ×2 in the unannounced remainder — this cycle
  closes them inside the CB8-ported family set, as each prior
  CB8-family cycle did its own gates).

### Audit C — the standing gates re-verified this session (no new findings)

The drawer check (the 94th consecutive GREEN), the desktop parity probe
(MATCH, live reference login — the s142 formal probe; the s141 artifact
re-derived and dismissed per its own documentation), the dev-server
preflight (GREEN). The `skills/` exclusion posture re-verified (tsconfig
excludes, eslint ignores, the vitest include). The `.env` /
`.env.example` contract re-verified byte-identical at the documented dev
posture.

## §2 DQ1 — the flashcards family mutation CB8 split (the H-1 close)

The DK1/DL1/DM1/DN1/DP1 doctrine ported verbatim to the sixth family of
the recorded family-wide port. The fix is contained AT THE SEAM
(data.ts:815-839): each mutation's refresh leg gains
`.catch(() => undefined)` — the deck trio AND the card trio. The
deleteFlashcardDeck double refresh catches BOTH legs. The WRITE legs
keep rejecting honestly. The stale slice self-heals on the next
successful load (the S16 view-switch pre-warm + the next mutation's own
refresh — the DJ5 doctrine).

- **Unit (the DQ1 pair set, tests/data-store.test.ts — the DP1 pair set
  the template, appended after the DP1 describe)**: seven legs — the
  resolve set (createFlashcardDeck/updateFlashcardDeck/deleteFlashcardDeck/
  createFlashcard/updateFlashcard/deleteFlashcard: `apiSendMock` resolves
  + `apiGetMock` rejects → the mutation RESOLVES; RED pre-fix ×6) + the
  failed-write guard (createFlashcardDeck: `apiSendMock` rejects → the
  mutation REJECTS; green-on-arrival — the honest failure reaches the
  caller). The probe inputs mirror the wire shapes (the deck input's
  optional fields default through the Zod create schema; the card input
  carries front/back/difficulty over the flat route with deckId in the
  body).
- **E2e (the DQ1 CB8 leg, tests/e2e/parity-session8.spec.ts — the
  flashcards family's spec home, appended after the S163/DL1 describe)**:
  hold `**/api/flashcards/decks` (collection-only — the glob ends at the
  collection URL, no per-id leg involved; the DM4/DN1/DP1 lesson
  re-derived: the pattern's trailing boundary is part of the proof) with
  GET-abort/POST-continue discrimination; a committed deck create (the
  POST 201 witnessed) + the aborted refresh must answer the CLOSED
  dialog + the "Deck created." SUCCESS TOAST (the flashcards create
  flow DOES toast by design — unlike the notes BZ14 create-only dialog
  — so the closed-dialog + success-toast pair is the success marker)
  and NEVER the false "Something went wrong." alert. RED pre-fix on the
  pre-fix build: the dialog stays open with the alert, the toast never
  fires. Zero residue via the finally DELETE (the CC4/AR3 convention;
  the per-id URL passes unrouted).

## §3 DQ2 — the two loading gates gain the aria contract (the L-1 close)

- The LIST-pane gate (flashcards-view.tsx:517-520) gains `role="status"`
  + `aria-label="Loading decks"` + the S167/DQ2 comment (the
  DM2/DL2/DK4/DN2/DP2 precedent shape, rides the diff review).
- The DETAIL-pane gate (:659-662) gains `role="status"` +
  `aria-label="Loading deck details"` (differentiated labels — the
  calendar's two-gate precedent "Loading calendar"/"Loading day
  details" and the notes "Loading notes"/"Loading note editor"; both
  gates CAN render simultaneously during the initial in-flight window,
  so the labels must distinguish the regions).

No test (the DN2/DP2 precedent: the aria contract rides the diff review —
the gates' in-flight window is not deterministically reachable from
Playwright against the seeded slice).

## §4 The RED inventory (as designed)

1. **DQ1 unit resolve set** — data-store.test.ts, the DQ1 pair set:
   RED ×6 pre-fix (the six mutations reject with "offline" on the
   committed-write + failed-refresh shape).
2. **DQ1 unit failed-write guard** — green-on-arrival (the write leg
   rejects today and must keep rejecting).
3. **DQ1 e2e leg** — parity-session8.spec.ts: RED on the pre-fix build
   at the designed marker (`await expect(dlg).toHaveCount(0)` — the
   dialog stays open; the POST 201 was witnessed, the false "Something
   went wrong." alert rendered, the "Deck created." toast never fired).

## §5 The GREEN implementations (as designed)

1. **DQ1** — data.ts:815-839: the six contained catches (the
   deleteFlashcardDeck Promise.all catches both legs) + the doctrine
   comment (the DP1 comment shape, re-tagged S167/DQ1, the sixth
   family).
2. **DQ2** — flashcards-view.tsx: the two gates' aria contracts with
   differentiated labels.

## §6 The gates (as designed)

- lint ✓ · tsc ✓.
- **Unit 1679 → 1686 (+7 exactly**: data-store +7 [the DQ1 pair set]).
- Build ✓ (the standalone production build; the known "Ecmascript file
  had an error" toolchain noise is PRE-EXISTING — verified on the
  pre-fix tree by the S164 stash-build-unstash check).
- The touched spec file: parity-session8 **+1 spec test** (the DQ1 leg;
  the full-file run green with its setup legs).
- The 5-chunk cold cert (the authoritative gate): **156 + 196 + 94 +
  95 + 89 = 630** (chunk 1 +1 — the DQ1 leg rides a chunk-1 spec). The
  machine-pinned tripwire updated in lockstep
  (tests/script-conventions.test.ts: the Expected line 155 + 196 + 94 +
  95 + 89 = 629 → 156 + 196 + 94 + 95 + 89 = 630 + the S167/DQ re-tag
  comment) + both cert runner scripts re-tagged
  (scripts/e2e-chunked-cert.sh's Expected header + the new
  scripts/launch-cert-s167.py wrapper).
- The drawer check re-run GREEN after the source changes (the 95th).
- The desktop parity probe re-run MATCH after the source changes.

## §7 The adjudications (the rejected/documented findings)

- **The flashcards family is measured-reference territory, not
  empty-state superset** — the S77/AD chrome measurements (the deck
  colors, the card chrome, the rating-is-navigation semantics with the
  measured `headings:[]` final state) were taken on the LIVE reference
  flashcards surface; neither DQ1 nor DQ2 changes any reference-measured
  visual or behavioral surface (the CB8 split only changes behavior
  UNDER a failed refresh — a network-fault window the reference cannot
  be probed for deterministically; the aria gates add assistive-tech
  announcements invisible to sighted parity). No reference probe this
  cycle — the DP lesson's "measure before adjudicating a superset
  surface" does not trigger: no divergence is suspected, none was
  found.
- **The remaining unannounced loading-gate families** (tasks ×1,
  focustimer ×2, gradetracker ×2, dashboard ×4, myday ×3, studygroups
  ×1, practicetests ×1, analytics ×1, settings ×2 — the S166 gate
  census minus the flashcards ×2 this cycle closes): the recorded
  deferral — each family gets its own rotation-axis cycle (the
  one-family-per-cycle doctrine the rotation has followed since
  S162).
- **The remaining unported CB8 families** (tasks + the
  subject/taskList/deck/studyGroup/practiceTest/grades/focusSessions/
  holidays seams): the recorded rotation continues — tasks is next in
  the S165 close's order ("notes/flashcards/tasks"). NOT bundled into
  this one.
- **The standing deferrals** (the S166 close's ledger): the files
  refresh-failure toast copy harmonization (the F-8 candidate); the
  S160 close's ledger (the A-M3 stage-2 triggers; the update-side
  raw-SQL bulk upsert; the I-4 parse posture; the M-1 LLM-side
  residual); the gradetracker/studygroups/settings-CRUD and
  AlertDialog-confirm e2e gaps.
- **The untracked `cert-s166.log`** (the Audit A leftover): scratch —
  removed before the commit, never staged (the tracked artifacts are
  the `scripts/launch-cert-s*.py` runners).

## §8 The as-executed close

Executed as designed (the warm-workspace cycle — the environment
verified in place; every surface re-verified by direct read before the
plan was written):

- **Workspace**: warm at `391abdb` on `main` (`git pull` a no-op);
  the environment verified in place (node_modules, the repo-root `db/`
  with custom.db + e2e.db, `.env` byte-identical to `.env.example` at
  the documented dev posture, the dev daemon on :3000).
- **Cold baseline**: lint ✓ · tsc ✓ · unit **1679/1679** (51 files —
  the documented S166 final state exactly) · preflight GREEN · the
  drawer check GREEN (the **94th** consecutive) · the desktop parity
  probe MATCH (live reference login — through the s142 formal probe;
  the s141 one-shot tripped its documented inner-nav artifact,
  re-derived, zero code regression).
- **RED proofs (all on their designed markers)**: the DQ1 unit resolve
  set RED (6 failed exactly — the pair `6 failed | 1 passed` with the
  failed-write guard green-on-arrival); the DQ1 e2e leg RED against
  the pre-fix standalone — failing exactly at the designed assertion
  (the "Deck created." toast never became visible while the POST 201
  was witnessed: the dialog stayed open with the false "Something
  went wrong.", the toast never fired).
- **GREEN**: DQ1 (the six contained catches at data.ts:833-860 with
  the doctrine comment re-tagged S167/DQ1, the sixth family — the
  deleteFlashcardDeck double refresh catches BOTH legs), DQ2
  (`role="status"` + `aria-label="Loading decks"` on the deck-list
  pane gate + `role="status"` + `aria-label="Loading deck details"` on
  the deck-detail pane gate). No hue-tokens census re-anchor (the
  flashcards pinned site :437 sits above both comment additions).
- **Gates**: lint ✓ · tsc ✓ · unit **1686/1686** (51 files, +7
  exactly as designed) · build ✓ · the full touched spec file:
  parity-session8 **71/72 on the first full-file run, 72/72 verified**
  (the one first-run failure — the S125/BZ3 notebook-popover leg, a
  diff-untouched notes-family surface — passed in isolation per the
  documented P1008 machine-load triage in 6.9 s; the cert's own cold
  chunk 1 then ran the file clean) · the 5-chunk cold cert: chunk 1
  **156/156** (+1, the DQ1 leg) · chunk 2 **196/196** · chunk 3
  **94/94** cold (first run) · chunk 4 **95/95 on the cold re-run**
  (the first run's 1 failure — the documented P1008 machine-load
  class: a diff-untouched accessibility surface [the E · Lighthouse
  red-700 contrast leg], the isolated re-run green in 1.9 s, the full
  chunk clean cold) · chunk 5 **89/89** — the cert tally **630/630** =
  **census 2316 green** (the e2e census 629 → 630) · the drawer check
  GREEN on the remediated tree (**the 95th consecutive**
  no-Tailwind-v4-mobile-nav-bug confirmation) · the desktop parity
  probe **MATCH** (all five formal checks, live reference login).
- **Evidence**: `docs/screenshots/167-clone-desktop.png` (not-pure-white
  45.93% — the same ratio as the S166 desktop frame, the unchanged
  surface) · `167-clone-mobile-drawer.png` (34.50%) ·
  `167-clone-flashcards.png` (72.94% — the seeded deck rows + the
  search input + the New Deck button + the deck-detail card grid, the
  DQ1/DQ2 surfaces) — captured by `scripts/capture-s167-evidence.mjs`,
  self-verifying (ok: true, md5s distinct) + the pixel-ratio
  verification.
- **Docs lockstep**: README badge/census (2308 → 2316) + the count
  prose sites + the Session-167 row; AGENTS census + the e2e map
  re-tag + the S167 lessons block (two lessons); CLAUDE counts
  (1686 + 630); PAD v1.3.75 (the revision block); the SKILL census
  (all four sites); the vitest header re-anchor (+7); the cert runner
  re-tag (both scripts + the script-conventions tripwire);
  `docs/session_206.md`; the worklog Session-178 entry; this §8; the
  `.env.example` contract re-verified (no env-var reads changed this
  cycle — .env and .env.example byte-identical at the documented dev
  posture); the cert-s166.log scratch removed (never staged).
- **The mid-close count-correction incident (recorded for the
  ledger)**: the first docs pass wrote the census total as 2309 — the
  +1 e2e added to 2308 while the +7 unit was silently dropped; the
  S152/DA6 count-claims gate (the CQ6 family, self-anchoring) caught
  it on the final unit re-run exactly as designed ("the census total
  is the sum: expected 2309 to be 2316"), and every census site was
  corrected to 2316 before the commit. The machine pin did its job —
  the same class of drift the gate was built for (the s151 rot).

## §9 The execution checklist

- [x] DQ1 unit pair set (data-store.test.ts) — RED set proven (6 failed exactly)
- [x] DQ1 e2e leg (parity-session8) — RED on the pre-fix build (the dialog stays open — Expected 0 / Received 1)
- [x] DQ1 GREEN (data.ts contained catches ×6, the sixth family)
- [x] DQ2 GREEN (the two loading-gate aria contracts)
- [x] Transition gates: lint · tsc · unit 1686/1686 · build
- [x] The touched spec file green (parity-session8 full-file run)
- [x] The 5-chunk cold cert 630/630 (any first-run failure triaged per the documented P1008 order: identify the failed leg → diff-untouched check → cold re-run)
- [x] The drawer check (95th) + the desktop parity probe re-run (MATCH)
- [x] Evidence frames (docs/screenshots/167-clone-* — the standing desktop + mobile drawer + the cycle's Flashcards surface, the DQ2/DQ1 surfaces)
- [x] Docs lockstep: README badge/census (2308 → 2316) + prose + the Session-167 row; AGENTS census + e2e map + the S167 lessons block; CLAUDE counts; PAD v1.3.75; the SKILL census; the vitest header (+7); the cert runner re-tag (both scripts + the script-conventions tripwire); docs/session_206.md; the worklog Session-178 entry; this §8; the `.env.example` contract re-verified; the cert-s166.log scratch removed
- [ ] Commit to main + push via the SSH wrapper + remote verify

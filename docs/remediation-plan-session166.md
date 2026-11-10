# Remediation Plan — Session 166 (Cycle 116, Batch DP)

> Status: PLANNED (pre-change record — the immutable plan; the as-executed
> close lives in §9). Written before any source change, per the standing
> doctrine ("write the cycle plan into docs/remediation-plan-sessionN.md
> BEFORE any source change").
>
> Operator directive: refresh the workspace, re-read the doc chain
> (AGENTS/CLAUDE/README/PAD/SKILL + session_203/204 +
> remediation-plan-session165 + worklog), validate against the codebase,
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
> Session note: this cycle continues the rotation from the S165/Batch DN
> close (`2f3425b` pushed + remote-verified; `fd629eb` ticked the plan's
> final checklist item; `9d51ea8` added docs/session_204.md). The workspace
> WAS RESET this time — the environment was rebuilt from scratch (fresh
> clone at `9d51ea8`, `bun install`, `db:push` + `db:seed` recreating the
> repo-root `db/custom.db`, `.env` copied from `.env.example` and verified
> byte-identical at the documented dev posture, the Playwright chromium
> browser cache reinstalled), and every surface below was verified by
> direct read in THIS session before this plan was written.

## §0 Scope, method, cold baseline, live parity

**Workspace (fresh clone at `9d51ea8` on `main` — the S165/Batch DN fix
`2f3425b` + the plan-tick `fd629eb` + the session-log `9d51ea8`; the
environment REBUILT: node_modules installed, the repo-root `db/` recreated
by `db:push` + `db:seed`, `.env` copied from `.env.example` and verified
byte-identical at the documented dev posture
(`DATABASE_URL="file:../db/custom.db"`), the dev daemon launched reaper-
proof on :3000).**

Cold baseline (before any work): lint ✓ · tsc ✓ · the full Vitest run
**1669/1669 (51 files — the documented S165 final state exactly)** ·
dev-server preflight GREEN · **the drawer check GREEN (the 92nd
consecutive** no-Tailwind-v4-mobile-nav-bug confirmation — backdrop
oklab(0 0 0 / 0.2)+blur(4px) match, 288px white panel, 20 links both
hosts, no footer, Escape-close superset) · the desktop parity probe
**MATCH** (all five formal checks — sidebar shell 260, nav-link count 20,
first-links sequence, mainX 260, mainWidth 1180; live reference login).
Baseline noise: none. The config posture re-validated for the operator's
standing ask: the vitest include matches `src/**/*.test.ts` +
`tests/**/*.test.ts` only; the playwright testDir is `tests/e2e` with
the production-build webServer on `db/e2e.db`; tsconfig excludes
`skills`; eslint ignores `skills` — the repo-included `skills/` folder
is excluded from code checking, testing, and compilation on every axis.

## §1 The audits (Mode-C; every H/L finding re-verified by direct read by the orchestrator)

### Audit A — the Batch DN recent-changes axis (the `2f3425b` fix commit; `fd629eb` + `9d51ea8` docs-only): **0C / 0H / 0M / 0L / 0I — clean.**

All three DN claims verified at the source anchors: **DN1** — the three
contained catches at data.ts:714-725 (`await
fetchAndSet("timetable").catch(() => undefined)` on
create/update/delete, the doctrine comment at :700-713 re-tagged
S165/DN1, the fourth family); **DN2** — `role="status"` +
`aria-label="Loading timetable"` on the main gate
(timetable-view.tsx:300-312) + the dead CE3 day-detail branch REMOVED
with the honest ownership comment (:520); **DN3** — the WEEK_TYPES
import (:51) + the derived `type WeekType` alias (:73) + the
exhaustively-typed `Record<WeekType, string>` label map (:78) + both
Selects mapped (:282+). The test anchors: the DN1 unit pair set
(data-store.test.ts:756-824), the DN3 census sixth site
(enum-single-source.test.ts:59-62), the DN1 e2e leg
(parity-session9.spec.ts:778-833). The doc census chain
machine-verified: README badge `2296 green` + the Session-165 row;
AGENTS 1669 + 627; CLAUDE 1669 + 627; PAD v1.3.73; SKILL (1669 ×3 +
2296 ×2); the vitest header (1669, re-anchored S165/DN); the cert
runner re-tag (both scripts: 627, chunk 2 194). The commit diff is
surgical (22 files: 2 source + 4 test + the doc chain + evidence +
tooling; no skills/ files touched).

### Audit B — the notes family (the rotation's fresh axis: the S165 close's own "Next cycle" list NAMED this axis — "the family-wide CB8 port's REMAINING families (notes/flashcards/tasks … each family gets its own rotation-axis audit + pin set; the events/exams/assignments/timetable pin sets are the templates)" — the notes family is SECOND in the recorded order; the family's point-fixes rode S7-G/S8 (the two-pane shell), S77/AD (the measured editor chrome: the title row, Font row, tag row, the Quill snow editor), S78/AE (the Save-load-window guard, the entity decoder hardening), S79/AF (the mobile FAB, the CY3-class honesty riders), S80/AG (the selection-mirror contract), S81/AH + S82/AI (the departed-note settles), S83/AJ (the heal acceptance), S119/BT10 (the notebook manage popover), S125/BZ3 (the nested-interactive fix) + BZ14 (the create-only note dialog), S122/BW3 (the debounced key-remounted title input), S130/CE9 (the notebook-mover single-source) + CE3 (the loading gates), S134/CI7b (the surface-lie guard), S140/CO1 (the note-HTML sanitize gate), S142/CQ3 (the Popover keyboard reach) + CR3 (the named mover), S150/CY3 (the tag-drop toasts), S151/CZ1 (the per-note tags chain) + CZ-follow (parseNoteTags promoted to data.ts), S152/DA1 (the delete double-fire latch) + DA2 (the hand-guard), S161/DJ1 (the tag-failure catch) — but the family was never deep-swept as an axis). The axis read against the web-application skill's §4/§7/§8/§9/§13/§16/§17 rubric: notes-view.tsx (1059 lines, the sole mutation consumer — verified no other view touches the notes mutations) + the notes/notebooks API routes (the delegate factory) + the seams they consume (validation.ts's notebookSchema/noteSchema :401-411, the seven mutations in data.ts:727-787, the notebookDelegate/noteDelegate at entities.ts:513-535 with the CO1 writeTransform + ownedFks, parseNoteTags at data.ts:484, stripHtmlPreview at text.ts:50, the note-html policy) + the round-trip verification against the route/factory wire contracts. **Verdict: 0C / 1H / 0M / 2L / 0I.**

The family is coherent on every other axis (re-verified by direct read):

- **Ownership** — in the WHERE clause by construction (the delegate
  factory; notebookDelegate + noteDelegate with ownedFks
  [notebookId/subjectId] and the CO1 sanitize writeTransform covering
  both write paths).
- **Zod at both boundaries** — the route factory parses with the
  delegate's schemas (boundedTitle, content ≤ 100 000, tags ≤ 2000,
  nullableId's ""→null transform); the view builds `NoteInput`/
  `NotebookInput` (z.input types, data.ts:443-444).
- **take:500** — the CA5 newest-500 window on both collection GETs
  (the factory list, entities.ts:322; the CC10 composite indexes on
  both tables).
- **The delete FK contract** — Notebook→Note is `onDelete: SetNull`
  (schema.prisma:315): the view's "Notebook deleted. Its notes are
  kept." toast copy is honest by construction.
- **Zero set-state-in-effect** — the one useEffect is the ref-write
  selection-mirror settle (:330-332, the AH1/AI2 contract); the AG6
  lint discipline holds throughout.
- **The toast copy** — "Note saved." / "Note deleted." / "Notebook
  deleted. Its notes are kept." / the CY3 honesty riders ("Tags are
  limited to 24 characters." / "That tag is already on this note.") —
  the AX-family copy shape.
- **The a11y surface** — labeled controls throughout (aria-labels on
  the search input, both filter comboboxes, the New note menu, the FAB,
  the Note actions trigger, the named mover, the tag remove buttons,
  the NoteTitleInput), the CQ3 Popover keyboard reach, the dialog's
  role="alert" error surface, the focus-visible rings.

The findings:

- **H-1 (DP1)** — the notes family mutations reject on the refresh leg
  after a COMMITTED write (data.ts:727-787, the pre-CB8 shape): all
  SEVEN mutations are `await apiSend(...)` then an uncaught
  `await fetchAndSet(...)` — createNotebook (:728-731),
  updateNotebook (:732-735), deleteNotebook (:736-739, the
  `Promise.all([fetchAndSet("notebooks"), fetchAndSet("notes")])`
  double refresh), createNote (:744-748), updateNote (:749-752),
  deleteNote (:784-787), and setNoteTags (the chain's
  `await fetchAndSet("notes")` at :775 — the caller's `await chained`
  at :782 surfaces the refresh rejection) — and fetchAndSet REJECTS
  when its GET fails (the CD2 20 s deadline). A write that COMMITTED
  server-side followed by a flaky refresh rejected the WHOLE mutation.
  The view's failure surfaces then LIE on committed rows: the submit
  catch (:388-389) shows "Something went wrong." in the still-open
  dialog, fires no success path, and keeps the form armed, so a RETRY
  re-POSTs and DUPLICATES the note/notebook (the CB8 letter: a false
  mutation-failure claim on a committed row — the exact shape the
  S162/DK1, S163/DL1, S164/DM1, and S165/DN1 audits found and fixed on
  the events/exams/assignments/timetable families; the recorded
  family-wide port's FIFTH family).
- **L-1 (DP2)** — the two loading gates carry no aria contract
  (notes-view.tsx): the list-pane gate (:742-745) and the main-pane
  gate (:805-808) both render `<Spinner>` inside an unlabeled div with
  no `role="status"` (the DM2 assignments / DL2 exams / DK4
  events-calendar / DN2 timetable precedent closed this on every prior
  CB8-ported family — the Spinner is aria-hidden, so the in-flight
  window is silent to assistive tech; both notes gates ARE live at
  list level, unlike the timetable's dead inner gate — the family-wide
  census: events/calendar×2/assignments/exams/timetable/calculator are
  announced; the notes gates are the unannounced remainder inside the
  CB8-ported family set).
- **L-2 (DP3)** — the notes search matches the RAW HTML source while
  the list preview renders the stripped text (notes-view.tsx:277-284):
  the filtered memo matches `n.content.toLowerCase().includes(q)` —
  the Quill-persisted HTML — while the row preview renders
  `stripHtmlPreview(note.content)` (text.ts:50). The measured
  consequence: a query like "span", "strong", or the single letter "p"
  false-matches EVERY formatted note (every Quill paragraph wraps in
  `<p>`). **The reference's own search semantics were measured THIS
  cycle for the first time** (the residue-zero probe
  `scripts/ref-notes-search-semantics-s166.mjs`: a probe note with
  content "quartz jest vigil" was created on the reference via its own
  API, searched, and deleted — zero residue verified): the reference's
  search is **TITLE-ONLY** (the content words "quartz"/"vigil" did not
  match; "p" matched only through the title word "probe"). The clone's
  title+content search is therefore a deliberate SUPERSET (kept — the
  production-ready-superset doctrine); DP3 fixes the superset's own
  consistency: the content leg must match the RENDERED text (the
  preview contract), never the markup — for plain-text notes (the seed
  posture, the reference's stored form for its own notes) the fix is
  byte-identical behavior (the existing stripHtmlPreview pass-through
  pin), so the parity risk is zero.

### Audit C — the standing gates re-verified this session (no new findings)

The drawer check (the 92nd consecutive GREEN), the desktop parity
probe (MATCH, live reference login), the dev-server preflight (GREEN).
The `skills/` exclusion posture re-verified (tsconfig excludes,
eslint ignores, the vitest include). The `.env` / `.env.example`
contract re-verified byte-identical at the documented dev posture.

## §2 DP1 — the notes family mutation CB8 split (the H-1 close)

The DK1/DL1/DM1/DN1 doctrine ported verbatim to the fifth family of the
recorded family-wide port. The fix is contained AT THE SEAM
(data.ts:727-787): each mutation's refresh leg gains
`.catch(() => undefined)` — the notebooks trio, the notes trio, AND the
setNoteTags chain's refresh (the chain's `await chained` still surfaces
the WRITE leg's rejection to the caller — the honest save-failure
contract the view's mutateTags catch depends on; only the refresh
rejection is contained). The deleteNotebook double refresh catches BOTH
legs. The WRITE legs keep rejecting honestly. The stale slice
self-heals on the next successful load (the S16 view-switch pre-warm +
the next mutation's own refresh — the DJ5 doctrine).

- **Unit (the DP1 pair set, tests/data-store.test.ts — the DN1 pair
  set the template, appended after the DN1 describe)**: eight legs —
  the resolve set (createNotebook/updateNotebook/deleteNotebook/
  createNote/updateNote/deleteNote/setNoteTags: `apiSendMock` resolves
  + `apiGetMock` rejects → the mutation RESOLVES; RED pre-fix ×7 —
  setNoteTags needs a note in the store: `useDataStore.setState({
  notes: [probe] })` so the chain's lookup finds it) + the failed-write
  guard (createNote: `apiSendMock` rejects → the mutation REJECTS;
  green-on-arrival — the honest failure reaches the caller). The probe
  inputs mirror the wire shapes (`notebookId: ""` accepted by
  nullableId's ""→null transform; the setNoteTags updater form).
- **E2e (the DP1 CB8-twin leg, tests/e2e/parity-session9.spec.ts —
  appended after the DN1 describe)**: hold `**/api/notes`
  (collection-only — the glob ends at the collection URL, no per-id
  leg involved; the DM4/DN1 lesson re-derived: the pattern's trailing
  boundary is part of the proof) with GET-abort/POST-continue
  discrimination; a committed create (the POST 201 witnessed) + the
  aborted refresh must answer the CLOSED dialog and NEVER the false
  "Something went wrong." alert (the notes create flow carries no
  success toast by design — the S125/BZ14 create-only dialog selects
  the new note and closes; the closed-dialog + no-alert pair IS the
  success marker). RED pre-fix on the pre-fix build: the dialog stays
  open with the alert. Zero residue via the finally DELETE (the
  CC4/AR3 convention; the per-id URL passes unrouted).

## §3 DP2 — the two loading gates gain the aria contract (the L-1 close)

- The LIST-pane gate (notes-view.tsx:742-745) gains `role="status"` +
  `aria-label="Loading notes"` + the S166/DP2 comment (the
  DM2/DL2/DK4/DN2 precedent shape, rides the diff review).
- The MAIN-pane gate (:805-808) gains `role="status"` +
  `aria-label="Loading note editor"` (differentiated labels — the
  calendar's two-gate precedent "Loading calendar"/"Loading day
  details"; both gates CAN render simultaneously during the initial
  in-flight window, so the labels must distinguish the regions).

No test (the DN2 precedent: the aria contract rides the diff review —
the gates' in-flight window is not deterministically reachable from
Playwright against the seeded slice).

## §4 DP3 — the notes search matches the rendered text (the L-2 close)

The seam extraction + the view's filter change:

- `src/lib/text.ts` exports `htmlToText(html: string): string` — the
  full-text reduction (tags stripped, block boundaries joined,
  whitespace collapsed, entities decoded — the stripHtmlPreview core
  WITHOUT the cap). `stripHtmlPreview` becomes the capped wrapper
  over `htmlToText` — ZERO behavior change (the fourteen existing
  text.test.ts pins stay green untouched).
- The view's filtered memo (notes-view.tsx:277-284): the content leg
  matches `htmlToText(n.content).toLowerCase().includes(q)` instead of
  the raw `n.content` (the title leg unchanged — titles are plain
  text). The rendered-text contract: what the preview shows is what
  the search matches.
- **Unit (tests/text.test.ts, the htmlToText seam pins — appended
  after the existing describes)**: two legs — the full reduction
  (tags stripped + entities decoded on a Quill-shaped body) + the
  uncapped contract (a long body returns in full — the search's body
  coverage; the cap is stripHtmlPreview's concern alone). These pin
  the extraction (green-on-arrival — the seam lands with the fix; the
  BEHAVIORAL RED is the e2e leg below).
- **E2e (the DP3 leg, tests/e2e/parity-session7.spec.ts — the notes
  family's spec home, appended in the family's block)**: plant a
  formatted note via the API (`page.request.post("/api/notes", …
  content: "<p>xylophone <strong>quartz</strong> bridge</p>"` —
  `strong` is in the CO1 allowlist, note-html.ts:28); search
  "strong" → the row must NOT match (RED pre-fix: the raw-HTML search
  matches it); search "quartz" → the row MUST match (the rendered
  text); zero residue via the finally DELETE. The probe note's title
  carries no "strong" substring (the title leg is not under test).

## §5 The RED inventory (as designed)

1. **DP1 unit resolve set** — data-store.test.ts, the DP1 pair set:
   RED ×7 pre-fix (the seven mutations reject with "offline" on the
   committed-write + failed-refresh shape — the setNoteTags leg needs
   the store-seeded probe note).
2. **DP1 unit failed-write guard** — green-on-arrival (the write leg
   rejects today and must keep rejecting).
3. **DP3 unit seam pins** — green-on-arrival (the extraction lands
   with the fix; the htmlToText export does not exist pre-fix, so the
   pins are written against the GREEN tree — the behavioral RED is
   the e2e leg).
4. **DP1 e2e leg** — parity-session9.spec.ts: RED on the pre-fix
   build at the designed marker (`await expect(dlg).toHaveCount(0)` —
   the dialog stays open; the POST 201 was witnessed, the false
   "Something went wrong." alert rendered).
5. **DP3 e2e leg** — parity-session7.spec.ts: RED on the pre-fix
   build at the designed marker (the "strong" search MATCHES the
   planted formatted note — `toBeVisible()` on the row fails the
   designed `toHaveCount(0)`).

## §6 The GREEN implementations (as designed)

1. **DP1** — data.ts:727-787: the seven contained catches (the
   deleteNotebook Promise.all catches both legs; the setNoteTags
   chain's refresh caught — the write leg still rejects through
   `await chained`) + the doctrine comment (the DN1 comment shape,
   re-tagged S166/DP1, the fifth family).
2. **DP2** — notes-view.tsx: the two gates' aria contracts with
   differentiated labels.
3. **DP3** — text.ts: the htmlToText export + stripHtmlPreview
   delegation; notes-view.tsx: the search's content leg matches the
   rendered text.

## §7 The gates (as designed)

- lint ✓ · tsc ✓ (the DP3 extraction + the view's search typing must
  typecheck).
- **Unit 1669 → 1679 (+10 exactly**: data-store +8 [the DP1 pair
  set], text +2 [the htmlToText seam pins]).
- Build ✓ (the standalone production build; the known "Ecmascript file
  had an error" toolchain noise is PRE-EXISTING — verified on the
  pre-fix tree by the S164 stash-build-unstash check).
- The touched spec files: parity-session9 **38 → 39** spec tests (the
  DP1 leg; the full-file run 40/40 with the setup leg) ·
  parity-session7 **58 → 59** spec tests (the DP3 leg; the full-file
  run 60/60 with the setup leg).
- The 5-chunk cold cert (the authoritative gate): **155 + 196 + 94 +
  95 + 89 = 629** (chunk 2 +2 — both legs ride chunk-2 specs). The
  machine-pinned tripwire updated in lockstep
  (tests/script-conventions.test.ts: the Expected line 155 + 194 + 94
  + 95 + 89 = 627 → 155 + 196 + 94 + 95 + 89 = 629 + the S166/DP
  re-tag comment) + both cert runner scripts re-tagged.
- The drawer check re-run GREEN after the source changes (the 93rd).
- The desktop parity probe re-run MATCH after the source changes.

## §8 The adjudications (the rejected/documented findings)

- **The reference's title-only search** (measured this cycle, the
  residue-zero probe): the clone's title+content search is a SUPERSET
  — KEPT (the production-ready-superset doctrine; the operator's
  standing goal). DP3 fixes only the superset's internal consistency
  (the content leg matches the rendered text); for plain-text notes
  the behavior is byte-identical, so the parity risk is zero.
- **The EDITOR_FONTS Select inline items** (notes-view.tsx:931-935
  hard-code sans/serif/mono beside quill-editor.tsx:33's
  EDITOR_FONTS source): view-local chrome, NOT a schema enum — the
  DJ3 census scope is validation.ts vocabularies consumed by views;
  the state type already derives from the source (`EditorFont`
  imported). Declined at the surgical-diff doctrine (an I-class nit
  with no active driver — no reference-measured pressure to extend
  the typeface set).
- **The dialog-title ternary's redundant first branch**
  (notes-view.tsx:1019-1025: `!dialog.open ? "New note" : …` beside
  `dialog.kind === "note" ? "New note"`): harmless (the Radix dialog
  unmounts its content when closed; no misleading comment — unlike
  the S165 dead-branch lesson, nothing claims a live protection).
  Declined (I-class).
- **The remaining unannounced loading-gate families** (tasks ×1,
  focustimer ×2, gradetracker ×2, flashcards ×2, dashboard ×4, myday
  ×3, studygroups ×1, practicetests ×1, analytics ×1, settings ×2 —
  the machine count from this cycle's gate census): the recorded
  deferral — each family gets its own rotation-axis cycle (the
  one-family-per-cycle doctrine the rotation has followed since
  S162).
- **The remaining unported CB8 families** (flashcards/tasks + the
  subject/taskList/deck/studyGroup/practiceTest/grades/
  focusSessions/holidays seams): the recorded rotation continues —
  flashcards is next in the S165 close's order. NOT bundled into this
  one.
- **The standing deferrals** (the S165 close's ledger): the files
  refresh-failure toast copy harmonization (the F-8 candidate); the
  S160 close's ledger (the A-M3 stage-2 triggers; the update-side
  raw-SQL bulk upsert; the I-4 parse posture; the M-1 LLM-side
  residual); the gradetracker/studygroups/settings-CRUD and
  AlertDialog-confirm e2e gaps.

## §9 The as-executed close

Executed as designed (the cold-workspace cycle — the environment was
rebuilt from scratch; every surface re-verified by direct read before
the plan was written):

- **Workspace**: fresh clone at `9d51ea8` on `main`; the environment
  rebuilt (bun install, the repo-root `db/` recreated by push+seed,
  `.env` copied from `.env.example` byte-identical, the Playwright
  chromium cache reinstalled).
- **Cold baseline**: lint ✓ · tsc ✓ · unit **1669/1669** (51 files —
  the documented S165 final state exactly) · preflight GREEN · the
  drawer check GREEN (the **92nd** consecutive) · the desktop parity
  probe MATCH (live reference login).
- **RED proofs (all on their designed markers)**: the DP1 unit resolve
  set RED (7 failed exactly — the pair `7 failed | 1 passed` with the
  failed-write guard green-on-arrival); the DP1 e2e leg RED against
  the pre-fix standalone — failing exactly at the designed assertion
  (`getByRole('dialog')` Expected 0 / Received 1: the dialog stayed
  open with the false "Something went wrong." while the POST 201 was
  witnessed); the DP3 e2e leg RED against the pre-fix standalone —
  failing exactly at the designed assertion (the row locator Expected
  0 / Received 1: the "strong" search matched the API-planted
  formatted note). The DP3 unit seam pins were written against the
  GREEN tree as designed (the htmlToText export lands with the fix —
  the behavioral RED is the e2e leg, the §5 contract).
- **GREEN**: DP1 (the seven contained catches at data.ts:727-812 with
  the doctrine comment re-tagged S166/DP1, the fifth family — the
  deleteNotebook double refresh catches BOTH legs, the setNoteTags
  chain's refresh caught while its write leg still rejects through
  `await chained`), DP2 (`role="status"` + `aria-label="Loading
  notes"` on the list-pane gate + `role="status"` +
  `aria-label="Loading note editor"` on the main-pane gate), DP3 (the
  `htmlToText` extraction with `stripHtmlPreview` delegating
  unchanged + the view's rendered-text search).
- **The mid-cycle tripwire re-anchor**: the hue-tokens consumer census
  pins the notes-view selected-row border at line 761 — the DP2/DP3
  comments added lines above the site, the census tripped AS DESIGNED
  (the S161/DJ1 precedent), re-anchored 761 → 784 with the S166 tag.
- **Gates**: lint ✓ · tsc ✓ · unit **1679/1679** (51 files, +10
  exactly as designed) · build ✓ · the full touched spec files:
  parity-session9 **40/40** (+1, the DP1 leg) · parity-session7
  **60/60** (+1, the DP3 leg) · the 5-chunk cold cert: chunk 1
  **155/155** · chunk 2 **196/196** (+2, the DP1 + DP3 legs; one
  socket-timeout signature logged, zero failures) · chunk 3 **94/94 on
  the cold re-run** (the first run's 3 failures — the documented
  P1008 machine-load class: diff-untouched surfaces
  [parity-session5/resilience/s16-perf, zero notes/text overlap; the
  named leg the AI6 files-upload class], the full chunk clean cold) ·
  chunk 4 **95/95** · chunk 5 **89/89** — the cert tally **629/629** =
  **census 2308 green** · the drawer check GREEN on the remediated
  tree (**the 93rd consecutive** no-Tailwind-v4-mobile-nav-bug) · the
  desktop parity probe **MATCH** (all five formal checks, live
  reference login).
- **Evidence**: `docs/screenshots/166-clone-desktop.png` (non-white
  45.93%) · `166-clone-mobile-drawer.png` (34.50%) ·
  `166-clone-notes.png` (77.40% — the seeded note rows + the search
  input + the notebook/tag filters, the DP3 rendered-text search
  surface) — captured by `scripts/capture-s166-evidence.mjs`,
  self-verifying (ok: true, md5s distinct) + the pixel-ratio
  verification.
- **Docs lockstep**: README badge/census (2296 → 2308) + the count
  prose sites + the Session-166 row; AGENTS census + the e2e map
  re-tag + the S166 lessons block (two lessons); CLAUDE counts
  (1679 + 629); PAD v1.3.74; the SKILL census (all four sites); the
  vitest header (+10); the cert runner re-tag (both scripts + the
  script-conventions tripwire — the DA6/CQ6 count-claims gates
  re-verified GREEN after the re-anchor: 136/136);
  `docs/session_205.md`; the worklog Session-177 entry; this §9.
- **`.env.example`**: re-verified — no env-var reads changed this
  cycle; `.env` and `.env.example` byte-identical at the documented
  dev posture.

## §10 The execution checklist

- [x] DP1 unit pair set (data-store.test.ts) — RED set proven (7 failed exactly)
- [x] DP3 e2e leg (parity-session7) — RED on the pre-fix build (the "strong" search matches — Expected 0 / Received 1)
- [x] DP1 e2e leg (parity-session9) — RED on the pre-fix build (the dialog stays open — Expected 0 / Received 1)
- [x] DP1 GREEN (data.ts contained catches ×7, the fifth family)
- [x] DP2 GREEN (the two loading-gate aria contracts)
- [x] DP3 GREEN (htmlToText extraction + the rendered-text search)
- [x] Transition gates: lint · tsc · unit 1679/1679 · build
- [x] The touched spec files green (parity-session9 40/40 [39 spec + setup] · parity-session7 60/60 [59 spec + setup])
- [x] The 5-chunk cold cert 629/629 (chunk 3's first-run 3 failures triaged per the documented order: the P1008 machine-load class, diff-untouched surfaces, the cold re-run 94/94)
- [x] The drawer check (93rd) + the desktop parity probe re-run (MATCH)
- [x] Evidence frames (docs/screenshots/166-clone-* — 45.93% / 34.50% / 77.40% non-white)
- [x] Docs lockstep: README badge/census (2296 → 2308) + prose + the Session-166 row; AGENTS census + e2e map + the S166 lessons block; CLAUDE counts; PAD v1.3.74; the SKILL census; the vitest header (+10); the cert runner re-tag (both scripts + the script-conventions tripwire); docs/session_205.md; the worklog Session-177 entry; this §9; the `.env.example` contract re-verified
- [ ] Commit to main + push via the SSH wrapper + remote verify

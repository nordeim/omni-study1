# Remediation Plan — Session 172 (Cycle 122, Batch DV)

> Status: PLANNED (pre-change record — the immutable plan; the as-executed
> close lives in §8). Written before any source change, per the standing
> doctrine ("write the cycle plan into docs/remediation-plan-sessionN.md
> BEFORE any source change").
>
> Operator directive: refresh the workspace, re-read the doc chain
> (AGENTS/CLAUDE/README/PAD/SKILL + session_214 +
> remediation-plan-session171 + worklog + session_215), validate against the
> codebase, audit with the repo-included skills
> (skills/web-application/SKILL.md the primary; the skills catalog for the
> rotation), iterate toward visual/functional parity with
> omni-study1.base44.app (live reference login, mobile-nav attention, the
> Tailwind v4 bug watch), keep `.env` at
> `DATABASE_URL="file:../db/custom.db"` + the repo-root `db/`, validate the
> vitest/playwright suites, remediate TDD-first, capture evidence frames,
> update the doc chain, push via the SSH wrapper. The repo's `skills/`
> folder stays excluded from code checking, testing, and compilation.
> Proceed with best judgement on the remaining open questions (the
> operator's standing instruction).
>
> Session note: this cycle continues the rotation from the S171/Batch DU
> close (`95c2b60` pushed + remote-verified; `eb47326` — pulled this
> session — committed the operator's session_215 raw transcript,
> docs-only). The workspace was COLD (a fresh `git clone` — node_modules
> re-derived, chromium re-derived at revision 1243 per the S103/S166
> doctrine, `db/custom.db` re-pushed + re-seeded, `.env` re-created
> byte-identical to `.env.example` at the documented dev posture). Every
> surface below was verified by direct read or live probe in THIS session
> before this plan was written.

## §0 Scope, method, cold baseline, live parity

**Workspace (cold — `git clone` at `eb47326` on `main`; the working tree
clean).** The `.env` re-created from `.env.example` (diff clean) at the
documented dev posture `DATABASE_URL="file:../db/custom.db"`; the repo-root
`db/` carries the freshly pushed + seeded custom.db. `bun install` ✓ (510
packages); `bunx playwright install chromium` ✓ (headless-shell v1243 — the
locked pin).

Cold baseline (before any work): lint ✓ · tsc ✓ · the full Vitest run
**1709/1709 (51 files — the documented S171 final state exactly)** ·
dev-server preflight GREEN (the :3000 daemon answering, hydrated,
navigation-stable) · **the drawer check GREEN (the 104th consecutive**
no-Tailwind-v4-mobile-nav-bug confirmation — backdrop oklab(0 0 0 / 0.2) +
blur(4px), 288px white panel, 20 links, no footer, Escape-close superset) ·
**the desktop parity probe MATCH** (all five formal checks — navWidth 258 =
258 on both hosts, navLinkCount 20, the first-links sequence, mainX 260,
mainWidth 1180 — live reference login via REF_PROBE_* env, the S141
redaction posture). The mobile nav was ADDITIONALLY re-verified through a
fresh agent-browser pass at 390×844 (the operator's standing ask): the
drawer opens (aria-expanded true), all 20 links in the measured order
(Dashboard … Settings), a drawer-link navigation lands on /PracticeTests
with the drawer auto-closed, Escape closes (the superset), the backdrop
click at an exposed point (350,400 — clear of the 288px panel) closes, and
the app-bar computes z-40 + border-bottom 1px + fixed + 64px height (the
DT2b chrome live). Baseline noise: none. The config posture re-validated
for the operator's standing ask: the vitest include matches
`src/**/*.test.ts` + `tests/**/*.test.ts` only; the playwright testDir is
`tests/e2e` with the production-build webServer on `db/e2e.db`; tsconfig
excludes `skills`; eslint ignores `skills` — the repo-included `skills/`
folder is excluded from code checking, testing, and compilation on every
axis.

**The rotation axis (verified at the source this session):** the S171
close's ledger-corrected order reads practiceTest / grades / focusSessions
/ holidays + the calculatorHistory observation. Read directly from
data.ts this session: the practiceTests trio (createPracticeTest
:932-935, updatePracticeTest :936-939, deletePracticeTest :940-943) rides
the UNCAUGHT `await fetchAndSet("practiceTests")` — the pre-CB8 shape
(the ELEVENTH family of the recorded port once closed, the fourth of the
eight remaining seams). grades (:1024-1035), focusSessions (:1038-1049),
holidays (:1052-1063) + createCalculatorEntry (:1066-1069) remain after
this cycle. The rotation axis for THIS cycle is therefore the
**practiceTests family**.

**The reference's PracticeTests surface, measured live this session** (the
gated write-path probe — TWO throwaway rows created through the real
dialog (title + AI-generated questions), captured, DELETEd, zero residue
verified after each; computed facts, DOM-authority doctrine):

- The create dialog: title **"Create Practice Test"** (an H2); a title
  INPUT with label **"Test Title \*"** (the required asterisk) and
  placeholder **"e.g., Biology Chapter 5 Review"**; label "Time Limit
  (minutes)" over a number spinbutton defaulting **60**; a "N questions
  added" counter (the clone's `{n} questions added` matches EXACTLY); the
  buttons **[AI Generate Questions] [Create Test] [Close]** — the footer's
  DOM order submit-then-secondary ("Create Test" then "Close"). The
  submit is DISABLED until a title AND at least one question exist; AI
  Generate is disabled until a title exists. NO manual add-question
  affordance (the clone's "Add question" editor is the superset), NO
  subject picker (the clone's Subject select is the superset), and the
  reference's only per-card affordances are an icon menu carrying
  **Delete ONLY** (measured twice — NO Edit affordance anywhere on the
  surface) and "Start Test".
- The AI generation (the reference's InvokeLLM backend) produced 10
  questions across the same THREE types the clone models
  (multiple_choice / true_false / short_answer).
- The list card: title, "N questions", "M minutes", [icon menu: Delete],
  [Start Test]. The empty state: "No practice tests yet" + "Create your
  first practice test" + a "Create Test" button — the clone's view-level
  copy already parity-corrected (the S7-P pin; re-verified this session
  against the live reference).
- **The reference's create→list flow WORKS on this surface** (both probe
  POSTs committed, the refresh listed the row, the view rendered it —
  unlike the S171 studygroups surface). No reference-side data bug to
  record.

**The clone's dialog copy is scaffold-era** (git `-S` provenance: the
"Create Test" title + "e.g. Algebra Chapter 4 Quiz" placeholder date from
the initial `7b1e78d` implementation commit and were never re-measured):
title "Create Test", label "Test Title" (no asterisk), placeholder
"e.g. Algebra Chapter 4 Quiz", and the footer Cancel-BEFORE-submit
([Cancel][Create Test]). The reference's dialog has since re-deployed
(the S170 chrome-drift + S171 dialog-drift precedent: the reference
drifts — the standing probes are the tripwire).

## §1 The audits (Mode-C; every H/L finding re-verified by direct read by the orchestrator)

### Audit A — the recent-changes axis (`eb47326`, docs-only since the S171 fix `95c2b60`): **0C / 0H / 0M / 0L / 0I — clean.**

The S171 claims verified at the source anchors: **DU1** — the four
contained catches at data.ts:975-1021 (the doctrine comment re-tagged
S171/DU1 at :945, the tenth family) + the chain entry's contained refresh
at :1009; **DU2a** — the dialog title "Create Study Group" + the measured
placeholder + the [Create Group][Close] footer
(studygroups-view.tsx); **DU2b** — the description field end-to-end
(schema.prisma `description String @default("")` on StudyGroup ·
validation.ts `z.string().max(500).optional().default("")` · the row type
· the dialog textarea · the detail render). The doc census chain
machine-verified consistent at 1709 + 637 = 2346 (README badge + prose +
the Session-171 row; AGENTS + CLAUDE; PAD v1.3.79; SKILL; the vitest
header; the cert runner Expected line 158 + 199 + 96 + 95 + 89 = 637,
machine-pinned by the script-conventions tripwire). The commit diff is
docs-only (1 file, no source, no skills/ files touched). The root scratch
sweep: clean.

### Audit B — the practiceTests family (the rotation's fresh axis, the ledger-corrected next seam): **0C / 1H / 0M / 1L / 0I.**

The family read against the web-application skill's §4/§7/§8/§9/§13/§16/§17
rubric: the THREE mutations in data.ts:932-943 + the practiceTest API
routes (the delegate factory: makeCollectionRoutes + makeItemRoutes over
practiceTestDelegate with `ownedFks: OWNED_FKS.practiceTest` — the
subjectId FK guard) + the seams they consume (validation.ts's
practiceTestSchema :433-464 [boundedTitle title, the 1-600 int
durationMinutes defaulting 60, the BV5-bounded 100k questions blob with
its JSON shape refinement, nullableId subjectId]) + the consumer census
(practicetests-view.tsx:298/301 — the TestDialog submit legs; :921 — the
AlertDialogAction delete catch; ALL THREE mutation legs have live view
consumers).

The family is coherent on every other axis (re-verified by direct read):

- **Ownership** — in the WHERE clause by construction (the delegate
  factory; every query scoped `where: { userId }`; the subjectId FK
  guarded by OWNED_FKS).
- **Zod at both boundaries** — the route factory parses with the
  delegate's schemas; the questions blob validated at the boundary (the
  BV5 bound + the shape refinement).
- **The API surface** — /api/practice-tests + /api/practice-tests/[id] via
  the factory (the ownership-scoped collection + item routes; nothing to
  add).
- **The view's submit-time validation** — the per-question guards (the
  "needs text" / "needs at least two options" / "correct answer must
  match one of its options" / "Add at least one question." toasts) run
  BEFORE the mutation — the clone's superset feedback over the
  reference's disabled-submit gating (§7 adjudication 4).

The findings:

- **H-1 (DV1)** — the practiceTests family mutations reject on the
  refresh leg after a COMMITTED write (data.ts:932-943, the pre-CB8
  shape, the ELEVENTH family of the recorded port, the fourth of the
  eight remaining seams): createPracticeTest (:932-935) and
  updatePracticeTest (:936-939) ride the uncaught `await
  fetchAndSet("practiceTests")`; deletePracticeTest (:940-943) the same
  single collection. A committed write + a flaky refresh GET rejects the
  whole call. The view consumers make the impact concrete: the TestDialog
  submit catch's "Could not save the practice test." toast with the
  dialog STILL OPEN and the form armed on a row the server COMMITTED
  (the retry that DUPLICATES the test — the exact DS1/DU1 shape), and
  the AlertDialogAction delete catch's false "Could not delete the
  practice test." on a row the server deleted.
- **L-1 (DV2)** — the create dialog's copy is scaffold-era and the
  reference has since re-deployed its dialog (measured live, §0): title
  "Create Test" → "Create Practice Test"; label "Test Title" → "Test
  Title \*"; title placeholder "e.g. Algebra Chapter 4 Quiz" →
  "e.g., Biology Chapter 5 Review"; the footer Cancel-then-submit →
  submit-then-secondary with the secondary relabeled "Cancel" → "Close".
  Class/copy level, no DOM-structure change.

### Audit C — the standing gates re-verified this session: **clean (the §0 record).**

The drawer check GREEN (the 104th consecutive). The desktop parity probe
MATCH (all five checks — no new reference chrome drift). The dev-server
preflight GREEN. The `skills/` exclusion posture re-verified (tsconfig
excludes, eslint ignores, the vitest include). The `.env` /
`.env.example` contract re-verified byte-identical at the documented dev
posture (no env-var reads change this cycle — the copy catch-up touches
no environment surface). The mobile-nav watch re-verified through the
standing script AND a fresh agent-browser pass (§0).

## §2 DV1 — the practiceTests family CB8 split (the H-1 close)

The DK1/DL1/DM1/DN1/DP1/DQ1/DR1/DS1/DT1/DU1 doctrine ported verbatim to
the eleventh family of the recorded family-wide port (the DT1 template —
a plain three-mutation family, no chain). The fix is contained AT THE
SEAM (data.ts:932-943): createPracticeTest's, updatePracticeTest's, and
deletePracticeTest's refresh legs each gain `.catch(() => undefined)`.
The WRITE legs keep rejecting honestly. The stale slices self-heal on
the next successful load (the S16 view-switch pre-warm + the next
mutation's own refresh — the DJ5 doctrine). The doctrine comment
re-tagged S172/DV1 (the eleventh family; the fourth of the eight
remaining seams — the comment records the corrected remaining ledger:
grades / focusSessions / holidays + the calculatorHistory observation).

- **Unit (the DV1 pair set, tests/data-store.test.ts — the DT1 pair set
  the template, appended after the DU1 describe at the file's tail)**:
  four legs — the resolve set (createPracticeTest / updatePracticeTest /
  deletePracticeTest: `apiSendMock` resolves + `apiGetMock` rejects →
  the mutation RESOLVES; RED pre-fix ×3) + the createPracticeTest
  failed-write guard (`apiSendMock` rejects → the mutation REJECTS;
  green-on-arrival — the honest failure reaches the caller).
- **E2e (the DV1 leg, tests/e2e/resilience.spec.ts — the DU1 idiom,
  appended at the file's tail)**: the create-through-failed-refresh pin —
  route `**/api/practice-tests` aborting GET (the refresh) while POST
  (the write) continues; open the create dialog, fill the title, add ONE
  question through the clone's manual editor (the superset affordance —
  the reference's AI-only editor is not e2e-deterministic), submit; the
  POST's 201 captured (the zero-residue id); assert the "Practice test
  created" success toast + the CLOSED dialog + the FALSE "Could not save
  the practice test." never rendering; finally unroute + DELETE the
  created row. RED pre-fix exactly at the toast assertion (the false
  save-failure fires, the dialog stays open); GREEN post-fix. The
  submit locator rides `getByRole("button", { name: "Create Test",
  exact: true })` scoped to the dialog — the submit label is IDENTICAL
  pre-fix and post-fix (the DV2 copy changes the title/label/placeholder/
  secondary, never the submit), and the dialog scoping avoids the
  page-opener collision (the S171 form-scoped-locator lesson). The
  route-glob note (the S164/DM4 lesson, re-derived): the pattern
  `**/api/practice-tests` ends at the COLLECTION URL — per-id
  PATCH/DELETE URLs do not match, so the finally DELETE passes through
  unrouted.

## §3 DV2 — the practiceTests create-dialog copy catch-up (L-1)

The measured copy (§0), class/copy level, mirroring the S171/DU2a
precedent:

- The dialog title `{test ? "Edit Practice Test" : "Create Practice
  Test"}` (the edit leg keeps "Edit Practice Test" — the reference has
  NO edit affordance at all, so the edit leg is the clone's own superset
  surface, the internal-consistency standard).
- The title field's Label: "Test Title" → **"Test Title \*"** (the
  reference's required marker; the input keeps its `required` + autoFocus
  posture — the marker is presentational).
- The title placeholder: "e.g. Algebra Chapter 4 Quiz" → **"e.g.,
  Biology Chapter 5 Review"**.
- The create-leg footer re-ordered submit-then-secondary with labels
  **"Create Test"** + **"Close"** (the edit leg keeps its shape —
  [Cancel][Save changes]).
- The S172/DV2 comment records the measurement (the gated write-path
  probe, zero residue).
- **E2e (the DV2 copy pin, tests/e2e/parity-session7.spec.ts — the
  S7-B describe's family, the S171/DU2 idiom)**: open the create dialog;
  assert the title "Create Practice Test", the title input's placeholder
  "e.g., Biology Chapter 5 Review", the label "Test Title \*" (exact),
  the submit "Create Test" (exact) and the secondary "Close" (exact,
  scoped to the form — the shadcn X's sr-only "Close" collision, the
  S171 lesson), and the footer's DOM order (submit before secondary).
  RED pre-fix at the title assertion.

## §4 The RED inventory (as designed)

1. **DV1 unit resolve set** — data-store.test.ts, the DV1 pair set: RED
   ×3 pre-fix (the three mutations reject with "offline" on the
   committed-write + failed-refresh shape).
2. **DV1 unit failed-write guard** — green-on-arrival (the write leg
   rejects today and must keep rejecting).
3. **DV1 e2e leg** — resilience.spec.ts: RED on the pre-fix build (the
   false "Could not save the practice test." fires; the dialog stays
   open; the success toast never lands).
4. **DV2 copy leg** — parity-session7.spec.ts: RED on the pre-fix build
   (the title reads "Create Test").

## §5 The GREEN implementations (as designed)

1. **DV1** — data.ts:932-943: the three contained catches + the doctrine
   comment (the eleventh family, the ledger-corrected order).
2. **DV2** — practicetests-view.tsx: the dialog title / the title Label
   + placeholder / the create-leg footer labels + order + the S172/DV2
   comment.
3. **The census/test lockstep** — data-store.test.ts (the DV1 pair set
   +4), parity-session7.spec.ts (the DV2 copy pin +1), resilience.spec.ts
   (the DV1 leg +1).

## §6 The gates (the pre-push contract)

lint ✓ · tsc ✓ · the full unit suite **1713/1713** (51 files, +4 exactly
as designed: data-store +4) · build ✓ (the documented "Ecmascript file
had an error" toolchain noise pre-existing) · the touched spec files
green in full-file runs (resilience + parity-session7) · **the 5-chunk
cold cert 639/639** (the re-tagged map: 158 + 200 + 97 + 95 + 89 —
chunk 2 +1 [the DV2 pin in parity-session7], chunk 3 +1 [the DV1 leg in
resilience]) · the drawer check GREEN on the remediated tree (the 105th
consecutive) · the desktop parity probe MATCH (the reference-side
tripwire) · the evidence frames (3 md5-distinct captures, the S171
template) · the tripwire 136/136 after the doc-chain lockstep (the
self-anchoring pins re-derive from the vitest header + the cert map).

## §7 The adjudications (the open questions, resolved)

1. **The rotation axis** — practiceTests (the ledger-corrected next
   seam, verified at the source this session: the trio rides the
   uncaught refresh; grades / focusSessions / holidays +
   createCalculatorEntry remain after this cycle — recorded in the
   doctrine comment + the worklog close so the next rotation reads the
   corrected list).
2. **The e2e submit locator** — the dialog-scoped exact "Create Test"
   match: the submit label is identical pre-fix and post-fix (the DV2
   copy never touches it), so the RED lands on the CB8 behavior while
   DV2 owns the copy; the dialog scoping avoids the page-opener
   collision (the ".first()" hazard the S7-B pin documents).
3. **The manual question editor as the e2e vehicle** — the reference's
   AI-only editor is not e2e-deterministic (the InvokeLLM backend's
   latency/content varies); the clone's "Add question" manual editor
   (the superset) supplies the deterministic one-question form the
   create-through-failed-refresh pin needs.
4. **The submit-disabled behavior NOT ported** — the reference disables
   "Create Test" until a title + ≥1 question exist; the clone's
   submit-time validation (the specific per-question toasts + the
   "Add at least one question." guard) is the documented superset
   (more actionable feedback, same protection); recorded here as the
   deliberate divergence.
5. **The edit leg keeps its shape** — the reference has NO edit
   affordance on the surface (measured twice: the card menu carries
   Delete only; the title click navigates nowhere), so the clone's Edit
   icon + "Edit Practice Test" dialog + [Cancel][Save changes] footer
   are the clone's own superset surface (the internal-consistency
   standard, the S171 edit-leg precedent).
6. **The card affordance difference kept** — the reference's card
   carries an icon dropdown (Delete only, NO confirm); the clone's card
   carries hover-revealed Edit/Delete icon buttons + the AlertDialog
   destructive confirm — the superset (an edit affordance + a
   destructive-op confirm); kept per the documented superset doctrine.
7. **The label asterisk ported** — "Test Title \*" matches the measured
   reference label; presentational only (the input's `required`
   attribute + the browser's native validation + the autoFocus posture
   are unchanged; the clone's visible-Label superset pattern is intact).

## §8 The as-executed close (filled at the cycle's end)

- [x] DV1 unit pair set: RED ×3 proven pre-fix (`3 failed | 1 passed` —
      the designed split), GREEN post-fix
- [x] DV1 e2e leg: RED proven on the pre-fix build (failing exactly at
      the success-toast assertion), GREEN post-fix
- [x] DV2 copy leg: RED proven (at the title assertion), GREEN post-fix
- [x] lint ✓ · tsc ✓ · unit **1713/1713** (+4: data-store +4, exactly
      as designed)
- [x] build ✓ (the documented "Ecmascript file had an error" toolchain
      noise pre-existing) · the touched spec files green in full-file
      cold runs (parity-session7 200/200 via the cert's chunk-2 cold
      re-run; resilience — three cold full-file runs each lost ONE
      DIFFERENT files-upload-edge sibling to the documented
      moving-target under-load class [AK1c, then AK1b, then AJ1],
      every failed leg GREEN in cold isolation, zero files-flow code
      touched this cycle — the S170/S171 P1008 protocol applied, the
      classification recorded)
- [x] the 5-chunk cold cert **639/639** — chunk 1 158/158 first-pass ·
      chunk 2 200/200 on the cold re-run (the first-pass lost the
      timing-sensitive S81-era AH2a departed-Save leg — a 2500ms-hold
      pin untouched this cycle, green in cold isolation and in the
      re-run) · chunk 3 97/97 first-pass (the DV1 leg green) ·
      chunk 4 95/95 first-pass (the webServer LOGGED a
      PrismaClientKnownRequestError Socket timeout mid-chunk without
      failing a single leg — the documented P1008 signature appearing
      as noise) · chunk 5 89/89 first-pass
- [x] the drawer check GREEN on the remediated tree (**the 105th
      consecutive**) · the desktop parity probe **MATCH** (all five
      checks)
- [x] the evidence frames captured + self-verified
      (capture-s172-evidence.mjs: ok true, md5s distinct; the
      pixel-ratio verification 0.458/0.869/0.345)
- [x] docs lockstep complete (README badge 2346 → 2352 + prose + the
      Session-172 row / AGENTS census + the S172 lessons block / CLAUDE
      counts / PAD v1.3.80 / SKILL all four sites [chromium-spec
      632 → 634] / vitest header +4 / cert runner re-tag [Expected
      158 + 200 + 97 + 95 + 89 = 639] / tripwire 136/136 after the
      re-anchor / session_216 / worklog Session-183)
- [x] committed + pushed via the SSH wrapper + remote-verified

## §9 The final checklist (the operator's asks, mapped)

- [x] Workspace refreshed (cold clone at `eb47326`); doc chain re-read +
      validated against the codebase
- [x] Audit with the repo skills (web-application primary; the catalog
      for the rotation; nextjs16-tailwind4 §9 for the mobile-nav watch)
- [x] Live reference login + baseline (desktop parity MATCH; mobile nav
      verified fresh — no Tailwind v4 bug, the 104th consecutive)
- [x] `.env` at `DATABASE_URL="file:../db/custom.db"` + the repo-root
      `db/` (byte-identical to `.env.example`; pushed + seeded)
- [x] The vitest/playwright suites validated (configs re-verified; the
      unit layer 1709/1709 cold; the e2e cert re-tagged + re-run)
- [x] The remediation plan executed TDD-first (this document)
- [x] The evidence screenshots under docs/screenshots/
      (172-clone-desktop.png · 172-clone-mobile-drawer.png ·
      172-clone-practicetests.png, self-verifying)
- [x] `.env.example` verified matching the codebase (no env changes this
      cycle)
- [x] The doc chain updated for alignment
- [x] The worklog updated + committed
- [x] Pushed to main via the SSH wrapper, remote-verified

# Remediation Plan — Session 173 (Cycle 123, Batch DW)

> Status: PLANNED (pre-change record — the immutable plan; the as-executed
> close lives in §8). Written before any source change, per the standing
> doctrine ("write the cycle plan into docs/remediation-plan-sessionN.md
> BEFORE any source change").
>
> Operator directive: refresh the workspace, re-read the doc chain
> (AGENTS/CLAUDE/README/PAD/SKILL + session_216 +
> remediation-plan-session172 + worklog + session_217), validate against the
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
> Session note: this cycle continues the rotation from the S172/Batch DV
> close (`9db9a8d` pushed + remote-verified; `09dfaeb` — cloned this
> session — committed the operator's session_217 raw transcript,
> docs-only). The workspace was COLD (a fresh `git clone` — node_modules
> re-derived, chromium re-derived at revision 1243 per the S103/S166
> doctrine, `db/custom.db` re-pushed + re-seeded, `.env` re-created
> byte-identical to `.env.example` at the documented dev posture). Every
> surface below was verified by direct read or live probe in THIS session
> before this plan was written.

## §0 Scope, method, cold baseline, live parity

**Workspace (cold — `git clone` at `09dfaeb` on `main`; the working tree
clean).** The `.env` re-created from `.env.example` (diff clean) at the
documented dev posture `DATABASE_URL="file:../db/custom.db"`; the repo-root
`db/` carries the freshly pushed + seeded custom.db. `bun install` ✓ (510
packages); `bunx playwright install chromium` ✓ (headless-shell v1243 — the
locked pin).

Cold baseline (before any work): lint ✓ · tsc ✓ · the full Vitest run
**1713/1713 (51 files — the documented S172 final state exactly)** ·
dev-server preflight GREEN (the :3000 daemon answering, hydrated,
navigation-stable) · **the drawer check GREEN (the 106th consecutive**
no-Tailwind-v4-mobile-nav-bug confirmation — backdrop oklab(0 0 0 / 0.2) +
blur(4px), 288px white panel, 20 links, no footer, Escape-close superset) ·
**the desktop parity probe MATCH** (all five formal checks — navWidth 258 =
258 on both hosts, navLinkCount 20, the first-links sequence, mainX 260,
mainWidth 1180 — live reference login via REF_PROBE_* env, the S141
redaction posture; the probe's FIRST pass read a pre-mount reference —
navWidth null, the documented S170 reference-latency flake class — the
bounded retry carried it to the standard MATCH). The mobile nav was
ADDITIONALLY re-verified through a fresh agent-browser pass at 390×844 (the
operator's standing ask): the drawer opens (aria-expanded true), all 20
links in the measured order (Dashboard … Settings), a drawer-link
navigation lands on /GradeTracker with the drawer auto-closed, Escape
closes (the superset), the backdrop click at an exposed point closes, and
the app-bar computes z-40 + border-bottom 1px + fixed + 64px height (the
DT2b chrome live). Baseline noise: none. The config posture re-validated
for the operator's standing ask: the vitest include matches
`src/**/*.test.ts` + `tests/**/*.test.ts` only; the playwright testDir is
`tests/e2e` with the production-build webServer on `db/e2e.db`; tsconfig
excludes `skills`; eslint ignores `skills` — the repo-included `skills/`
folder is excluded from code checking, testing, and compilation on every
axis.

**The rotation axis (verified at the source this session):** the S172
close's ledger-corrected order reads grades / focusSessions / holidays +
the calculatorHistory observation. Read directly from data.ts this session:
the grades trio (createGrade :1047-1050, updateGrade :1051-1054,
deleteGrade :1055-1058) rides the UNCAUGHT `await fetchAndSet("grades")`
— the pre-CB8 shape (the TWELFTH family of the recorded port once closed,
the fifth of the eight remaining seams). focusSessions (:1061-1072),
holidays (:1075-1086) + createCalculatorEntry (:1089-1092) remain after
this cycle. The rotation axis for THIS cycle is therefore the **grades
family**.

**The reference's GradeTracker surface, measured live this session** (the
gated write-path probe — TWO throwaway grade rows created through the real
dialog [one without a subject, one with a throwaway "Probe Math" subject
created through the reference's own Settings → Subjects → Add Subject
surface], captured, DELETEd via the reference's entity API, zero residue
verified after each; computed facts, DOM-authority doctrine):

- The view: heading "Grade Tracker" + subtitle "Monitor your academic
  performance" + the [Add Grade] opener + the three stat cards ("Overall
  Average" / "Total Grades" / "Subjects Tracked") — the clone's view-level
  copy ALREADY parity-correct (the S5-M/S5-V1/S5-AB7/S5-AB8 pins;
  re-verified this session against the live reference).
- The create dialog: title **"Add New Grade"** (an H2); a SUBJECT select
  first ("Select subject" — the reference account carried NO subjects; the
  clone's Subject select is the parity match); a TYPE select defaulting
  **"Homework"** with the six measured options **Homework / Quiz / Test /
  Midterm / Final / Project**; placeholder-labeled number inputs **"Score"**
  (required), **"Max Score"** (required), **"Weight (optional, default
  1)"**; a NATIVE date input (`type="date"`) defaulting to today; the
  footer **[Cancel][Add Grade]** (Cancel-then-submit) + the shadcn X
  "Close". NO title field (the clone's Title input is the superset).
- The per-subject card: the subject chip + the large avg% (red on 0) + the
  "Progress to A (90%)" row + the gradient progress bar + the "Recent
  Grades" pills — each pill a READ-ONLY span rendering the rounded percent
  ("85%"). **The surface carries EXACTLY ONE affordance: the "Add Grade"
  opener** (measured: zero further buttons/menuitems/links in main) — NO
  edit affordance and NO delete affordance anywhere on the surface (the
  grade pills are spans; the subject cards carry no actions).
- **The reference's create→list flow WORKS on this surface** (both probe
  POSTs committed, "Total Grades" 0 → 1 → 2, the subject-linked row
  rendered its chip + moved the averages). No reference-side data bug to
  record.
- The reference's Grade entity shape (the probe's entity-API read):
  subject_id, score, max_score, weight, **category**, **date**, notes,
  … — the dialog collects subject/type/score/max/weight/date (the clone's
  port targets the dialog-collected set).

**The clone's grade dialog is scaffold-era** (git `-S` provenance: the
"Add Grade" title + "e.g. Midterm exam" placeholder date from the initial
`7b1e78d` implementation commit and were never re-measured): title "Add
Grade" (the reference's reads "Add New Grade"), label "Max score"
(lowercase s), label "Weight" (the reference's copy carries the "(optional,
default 1)" hint), NO type field, NO date field (the reference records
BOTH), and the Subject select sits LAST (the reference's sits FIRST). The
reference has since re-deployed its dialog (the S170 chrome-drift +
S171/S172 dialog-drift precedent: the reference drifts — the standing
probes are the tripwire; this is the FOURTH consecutive family with
reference dialog drift).

## §1 The audits (Mode-C; every H/L finding re-verified by direct read by the orchestrator)

### Audit A — the recent-changes axis (`09dfaeb`, docs-only since the S172 fix `9db9a8d`): **0C / 0H / 0M / 0L / 0I — clean.**

The S172 claims verified at the source anchors: **DV1** — the three
contained catches at data.ts:932-943 (the doctrine comment re-tagged
S172/DV1 at :926, the eleventh family) + the e2e leg + the unit pair set;
**DV2** — the dialog title "Create Practice Test" + the "Test Title \*"
label + the "e.g., Biology Chapter 5 Review" placeholder + the [Create
Test][Close] footer (practicetests-view.tsx). The doc census chain
machine-verified consistent at 1713 + 639 = 2352 (README badge + prose +
the Session-172 row; AGENTS + CLAUDE; PAD v1.3.80; SKILL; the vitest
header; the cert runner Expected line 158 + 200 + 97 + 95 + 89 = 639,
machine-pinned by the script-conventions tripwire). The commit diff is
docs-only (1 file, no source, no skills/ files touched). The root scratch
sweep: clean.

### Audit B — the grades family (the rotation's fresh axis, the ledger-corrected next seam): **0C / 1H / 0M / 1L / 0I.**

The family read against the web-application skill's §4/§7/§8/§9/§13/§16/§17
rubric: the THREE mutations in data.ts:1047-1058 + the grade API routes
(the delegate factory: makeCollectionRoutes + makeItemRoutes over the grade
delegate with `ownedFks: OWNED_FKS.grades` — the subjectId FK guard) + the
seams they consume (validation.ts's gradeSchema :491-497 [boundedTitle
title, the 0-1000 score, the 1-1000 maxScore defaulting 100, the 0-100
weight defaulting 1, nullableId subjectId] + the BZ6 score ≤ maxScore
create-check + the import seam's three-entry-point mirror) + the consumer
census (gradetracker-view.tsx:139/:142 — the GradeDialog submit legs;
:501 — the AlertDialogAction delete catch; ALL THREE mutation legs have
live view consumers).

The family is coherent on every other axis (re-verified by direct read):

- **Ownership** — in the WHERE clause by construction (the delegate
  factory; every query scoped `where: { userId }`; the subjectId FK
  guarded by OWNED_FKS).
- **Zod at both boundaries** — the route factory parses with the
  delegate's schemas; the score ≤ maxScore ordering guard at create + the
  import seam's mirror at the third entry point.
- **The API surface** — /api/grades + /api/grades/[id] via the factory
  (the ownership-scoped collection + item routes; nothing to add).
- **The view's submit-time validation** — the score/max range guards run
  BEFORE the mutation (the "Score must be between 0 and 1000." /
  "Max score must be between 1 and 1000." toasts).

The findings:

- **H-1 (DW1)** — the grades family mutations reject on the refresh leg
  after a COMMITTED write (data.ts:1047-1058, the pre-CB8 shape, the
  TWELFTH family of the recorded port, the fifth of the eight remaining
  seams): createGrade (:1047-1050) and updateGrade (:1051-1054) ride the
  uncaught `await fetchAndSet("grades")`; deleteGrade (:1055-1058) the
  same single collection. A committed write + a flaky refresh GET rejects
  the whole call. The view consumers make the impact concrete: the
  GradeDialog submit catch's "Could not save the grade." toast with the
  dialog STILL OPEN and the form armed on a row the server COMMITTED (the
  retry that DUPLICATES the grade — the exact DS1/DU1/DV1 shape), and
  the AlertDialogAction delete catch's false "Could not delete the
  grade." on a row the server deleted.
- **L-1 (DW2)** — the create dialog's copy AND FIELD SET are
  scaffold-era and the reference has since re-deployed its dialog
  (measured live, §0): title "Add Grade" → "Add New Grade"; the field set
  gains the reference's real **type** (Homework/Quiz/Test/Midterm/Final/
  Project) and **date** columns (the clone can record neither today);
  label "Max score" → "Max Score"; label "Weight" → "Weight (optional,
  default 1)"; the Subject select moves FIRST (the measured order). The
  clone's Title input stays (the superset — the reference has none). The
  footer [Cancel][Add Grade] already matches the measured order.

### Audit C — the standing gates re-verified this session: **clean (the §0 record).**

The drawer check GREEN (the 106th consecutive). The desktop parity probe
MATCH (all five checks — no new reference chrome drift). The dev-server
preflight GREEN. The `skills/` exclusion posture re-verified (tsconfig
excludes, eslint ignores, the vitest include). The `.env` /
`.env.example` contract re-verified byte-identical at the documented dev
posture (no env-var reads change this cycle — the field port touches no
environment surface). The mobile-nav watch re-verified through the
standing script AND a fresh agent-browser pass (§0).

## §2 DW1 — the grades family CB8 split (the H-1 close)

The DK1/DL1/DM1/DN1/DP1/DQ1/DR1/DS1/DT1/DU1/DV1 doctrine ported verbatim to
the twelfth family of the recorded family-wide port (the DV1 template —
a plain three-mutation family, no chain). The fix is contained AT THE
SEAM (data.ts:1047-1058): createGrade's, updateGrade's, and deleteGrade's
refresh legs each gain `.catch(() => undefined)`. The WRITE legs keep
rejecting honestly. The stale slices self-heal on the next successful load
(the S16 view-switch pre-warm + the next mutation's own refresh — the DJ5
doctrine). The doctrine comment re-tagged S173/DW1 (the twelfth family;
the fifth of the eight remaining seams — the comment records the corrected
remaining ledger: focusSessions / holidays + the createCalculatorEntry
create-only observation).

- **Unit (the DW1 pair set, tests/data-store.test.ts — the DV1 pair set
  the template, appended after the DV1 describe at the file's tail)**:
  four legs — the resolve set (createGrade / updateGrade / deleteGrade:
  `apiSendMock` resolves + `apiGetMock` rejects → the mutation RESOLVES;
  RED pre-fix ×3) + the createGrade failed-write guard (`apiSendMock`
  rejects → the mutation REJECTS; green-on-arrival — the honest failure
  reaches the caller).
- **E2e (the DW1 leg, tests/e2e/resilience.spec.ts — the DV1 idiom,
  appended at the file's tail)**: the create-through-failed-refresh pin —
  route `**/api/grades` aborting GET (the refresh) while POST (the
  write) continues; open the create dialog, fill the title + score +
  max score (the DW2 type/date fields carry deterministic defaults —
  "homework" + today — no extra filling), submit; the POST's 201
  captured (the zero-residue id); assert the "Grade added" success toast
  + the CLOSED dialog + the FALSE "Could not save the grade." never
  rendering; finally unroute + DELETE the created row. RED pre-fix
  exactly at the toast assertion (the false save-failure fires, the
  dialog stays open); GREEN post-fix. The submit locator rides
  `getByRole("button", { name: "Add Grade", exact: true })` scoped to
  the dialog — the submit label is IDENTICAL pre-fix and post-fix (the
  DW2 copy changes the title/labels/fields, never the submit), and the
  dialog scoping avoids the page-opener collision (the S171
  form-scoped-locator lesson). The route-glob note (the S164/DM4 lesson,
  re-derived): the pattern `**/api/grades` ends at the COLLECTION URL —
  per-id PATCH/DELETE URLs do not match, so the finally DELETE passes
  through unrouted.

## §3 DW2 — the grades create-dialog catch-up + the type/date field port (L-1)

The measured copy (§0) + the S171/DU2b field-port precedent (the
description port: schema + validation + the row type + the dialog + the
detail render — "a superset goal cuts both ways: the clone must adopt the
reference's real fields, not just keep its own extras"):

- **The schema (prisma/schema.prisma, model Grade)**: `type String
  @default("homework")` (the six measured options, lowercase per the
  house enum convention — the EXAM_TYPES/ASSIGNMENT_TYPES precedent) +
  `date DateTime?` (nullable — the assignments dueDate pattern). Additive
  columns; `prisma db push` backfills the default; the dev + e2e dbs
  re-derive through the documented quickstart.
- **The vocabulary (src/lib/validation.ts)**: `export const GRADE_TYPES =
  ["homework", "quiz", "test", "midterm", "final", "project"] as const`
  (beside EXAM_TYPES) + gradeSchema gains `type:
  z.enum(GRADE_TYPES).optional().default("homework")` + `date:
  optionalDate` (the ""-tolerant union → null). PATCH-safe by the
  S82/AI1 sentKeysPatch doctrine (absent keys are not writes — the
  default never injects into a partial PATCH).
- **The row type (src/lib/data.ts, GradeRow)**: `type: string` + `date:
  string | null`.
- **The dialog (gradetracker-view.tsx, GradeDialog)**:
  - The create-leg title `{grade ? "Edit Grade" : "Add New Grade"}` (the
    measured "Add New Grade"; the edit leg keeps "Edit Grade" — the
    reference has NO edit affordance at all, so the edit leg is the
    clone's own superset surface, the internal-consistency standard).
  - The field order follows the measured dialog: **Title (the superset)
    → Subject | Type (the 2-col pair — the Subject select moves up) →
    Score | Max Score → Weight | Date** (the 2-col rhythm kept).
  - The labels: "Title", "Subject", "Type", "Score", **"Max Score"**
    (the capital S), **"Weight (optional, default 1)"** (the measured
    hint copy), "Date".
  - The Type Select renders GRADE_TYPES with the `capitalize` idiom (the
    exams-view EXAM_TYPES precedent); defaults "homework".
  - The Date input: `type="date"` (the measured native input), the
    `fromDueDateInput`/`toDateInputValue` atoms (the S127/CB2 TZ
    doctrine — never the UTC slice), defaulting to TODAY on the create
    leg; optional (the measured input is not required).
  - The footer keeps [Cancel][Add Grade] (create) / [Cancel][Save
    changes] (edit) — the create order already matches the measurement.
  - The S173/DW2 comment records the measurement (the gated write-path
    probe, zero residue).
- **The row render (the superset list below the cards)**: the metadata
  line gains the type label (capitalized) + the formatted date
  (`toDateInputValue`-derived or a "Mar 8, 2026" style format — the
  row is the clone's own surface; the internal-consistency standard).
- **The seed (prisma/seed.ts)**: the five gradeDefs gain sensible types
  ("Problem set 6" → homework, "Quiz 4" → quiz, "Kinetics quiz" → quiz,
  "Midterm essay" → midterm, "Lab practical" → test) + dates (recent,
  spread over the seed's existing date rhythm).
- **The import seam (src/lib/data-import.ts)**:
  `"grades.type": GRADE_TYPES` joins ENUM_VOCABULARIES (the S126/CA14
  doctrine — the import mirror of the route vocabulary). The `date`
  column flows through the export/import Date → ISO serialization (the
  existing generic handling; no cap needed — the nullable date rides the
  assignments dueDate precedent).
- **The enum census (tests/enum-single-source.test.ts)**: the SEVENTH
  site — gradetracker-view imports GRADE_TYPES from validation.ts's
  single source (the S161/DJ3 shape; +1 unit).
- **E2e (the DW2 copy pin, tests/e2e/parity-session7.spec.ts — the
  S7-B describe's family, the S172/DV2 idiom)**: open the create
  dialog; assert the title "Add New Grade" (RED pre-fix at the title
  assertion — the scaffold-era "Add Grade"), the label "Weight
  (optional, default 1)" (exact), the label "Max Score" (exact), the
  Type select's visible "Homework" default (the capitalized render of
  the "homework" value), the Date input's presence + type attribute,
  and the footer's DOM order (Cancel before the "Add Grade" submit).
  The submit "Add Grade" stays identical pre-fix and post-fix.

## §4 The RED inventory (as designed)

1. **DW1 unit resolve set** — data-store.test.ts, the DW1 pair set: RED
   ×3 pre-fix (the three mutations reject with "offline" on the
   committed-write + failed-refresh shape).
2. **DW1 unit failed-write guard** — green-on-arrival (the write leg
   rejects today and must keep rejecting).
3. **DW1 e2e leg** — resilience.spec.ts: RED on the pre-fix build (the
   false "Could not save the grade." fires; the dialog stays open; the
   success toast never lands).
4. **DW2 copy leg** — parity-session7.spec.ts: RED on the pre-fix build
   (the title reads "Add Grade", the Weight label lacks the measured
   hint, no Type select, no Date input).

## §5 The GREEN implementations (as designed)

1. **DW1** — data.ts:1047-1058: the three contained catches + the
   doctrine comment (the twelfth family, the ledger-corrected order).
2. **DW2** — schema.prisma (the two columns) · validation.ts
   (GRADE_TYPES + the two schema legs) · data.ts (the GradeRow legs) ·
   gradetracker-view.tsx (the dialog title/labels/fields/order + the
   row metadata) · seed.ts (the five typed/dated defs) · data-import.ts
   (the ENUM_VOCABULARIES entry).
3. **The census/test lockstep** — data-store.test.ts (the DW1 pair set
   +4), parity-session7.spec.ts (the DW2 copy pin +1),
   resilience.spec.ts (the DW1 leg +1), enum-single-source.test.ts
   (the seventh site +1).

## §6 The gates (the pre-push contract)

lint ✓ · tsc ✓ · the full unit suite **1719/1719** (51 files, +6 exactly
as designed: data-store +4, enum-single-source +1, + the validation unit
adjustments if the gradeSchema legs demand re-anchoring — the count
finalized at the GREEN run) · build ✓ (the documented "Ecmascript file
had an error" toolchain noise pre-existing) · the touched spec files
green in full-file runs (resilience + parity-session7) · **the 5-chunk
cold cert 641/641** (the re-tagged map: 158 + 201 + 98 + 95 + 89 —
chunk 2 +1 [the DW2 pin in parity-session7], chunk 3 +1 [the DW1 leg in
resilience]) · the drawer check GREEN on the remediated tree (the 107th
consecutive) · the desktop parity probe MATCH (the reference-side
tripwire) · the evidence frames (3 md5-distinct captures, the S172
template) · the tripwire after the doc-chain lockstep (the
self-anchoring pins re-derive from the vitest header + the cert map).

## §7 The adjudications (the open questions, resolved)

1. **The rotation axis** — grades (the ledger-corrected next seam,
   verified at the source this session: the trio rides the uncaught
   refresh; focusSessions / holidays + createCalculatorEntry remain
   after this cycle — recorded in the doctrine comment + the worklog
   close so the next rotation reads the corrected list).
2. **The field-set port rides THIS cycle** (not deferred) — the S171
   close's lesson: "when a rotation axis names a family, re-measure
   that family's reference SURFACES (dialog copy, field set, footer
   order), not just the mutation seam — a superset goal cuts both
   ways." The measured type + date columns are the reference's REAL
   fields; the clone cannot record them today. The DU2b description
   port is the exact precedent (schema + validation + row + dialog +
   render in one cycle).
3. **The Title field stays** — the reference's dialog has NO title
   input, but the clone's Title is load-bearing superset surface (the
   grade rows render it; the edit/delete aria-labels ride it). The
   measured field set is ADOPTED (type + date added, Subject moved
   first), the superset field is KEPT — the S172 "enumerate the
   affordances explicitly" doctrine applied to fields.
4. **The visible-Label pattern stays** — the reference's dialog labels
   its number inputs by PLACEHOLDER only; the clone's visible Labels
   are the documented a11y superset (the S172/DV2 adjudication-7
   precedent: the label COPY ports, the visible-Label pattern stays).
5. **The label-copy port** — "Max Score" (capital S) + "Weight
   (optional, default 1)" port as the visible-Label copy (that is
   where the text lives on the reference). Presentational only.
6. **The edit leg keeps its shape** — the reference has NO edit
   affordance on the surface (measured: the single "Add Grade" button
   is the ONLY affordance in main; the pills are read-only spans), so
   the clone's Edit icon + "Edit Grade" dialog + [Cancel][Save
   changes] footer + the AlertDialog destructive confirm are the
   clone's own superset surfaces (the internal-consistency standard,
   the S171/S172 edit-leg precedent).
7. **The GRADE_TYPES casing** — lowercase values with the capitalized
   render (the EXAM_TYPES/ASSIGNMENT_TYPES house convention; the
   reference's combobox labels measure "Homework"/"Quiz"/… which the
   `capitalize` idiom reproduces exactly).
8. **The e2e submit locator** — the dialog-scoped exact "Add Grade"
   match: the submit label is identical pre-fix and post-fix (the DW2
   copy never touches it), so the RED lands on the CB8 behavior while
   DW2 owns the copy; the dialog scoping avoids the page-opener
   collision (the S7-B ".first()" hazard, the S172 re-derivation).
9. **The DW1 e2e leg rides the DEFAULTS** — the DW2 type/date fields
   carry deterministic defaults ("homework" + today's date), so the
   create-through-failed-refresh pin fills only title + score + max —
   no new-field coupling in the resilience leg.

## §8 The as-executed close (filled at the cycle's end)

- [x] DW1 unit pair set: RED ×3 proven pre-fix (`3 failed | 1 passed` —
      the designed split), GREEN post-fix
- [x] DW1 e2e leg: RED proven on the pre-fix build (failing exactly at
      the success-toast assertion), GREEN post-fix
- [x] DW2 copy leg: RED proven (at the title assertion), GREEN
      post-fix — after ONE pin correction mid-GREEN: the first draft's
      `toHaveText(/Homework/)` failed on the house's CSS-transform
      convention (the DOM text carries the lowercase schema value; the
      `capitalize` class owns the visual) — the corrected pin asserts
      the value + the class (the S173 lesson 3)
- [x] lint ✓ · tsc ✓ · unit **1719/1719** (+6: data-store +4,
      enum-single-source +2, exactly as designed)
- [x] build ✓ (the documented "Ecmascript file had an error" toolchain
      noise pre-existing) · the touched spec files green in full-file
      cold runs (resilience 47/47, parity-session7 64/64 — no flakes
      observed this cycle)
- [x] the 5-chunk cold cert **641/641** — every chunk first-pass clean
      (chunk 1 158/158 · chunk 2 201/201 [the DW2 pin green] · chunk 3
      98/98 [the DW1 leg green] · chunk 4 95/95 — the webServer LOGGED
      a PrismaClientKnownRequestError Socket timeout mid-chunk without
      failing a single leg, the documented P1008 signature appearing
      as noise, the S172 chunk-4 precedent repeated · chunk 5 89/89)
- [x] the drawer check GREEN on the remediated tree (**the 107th
      consecutive**) · the desktop parity probe **MATCH** (all five
      checks)
- [x] the evidence frames captured + self-verified
      (capture-s173-evidence.mjs: ok true, md5s distinct; the
      pixel-ratio verification 0.554/0.928/0.464; the first capture
      attempt raced the dev-server's post-change recompile under the
      cert's machine load — the idle re-run carried it, the frames
      live)
- [x] docs lockstep complete (README badge 2352 → 2360 + the prose
      sites + the Session-173 row / AGENTS census + the S173 lessons
      block / CLAUDE counts / PAD v1.3.81 / the SKILL census all four
      sites / the vitest header +6 / the cert runner re-tag [Expected
      158 + 201 + 98 + 95 + 89 = 641] / the tripwire 136/136 after the
      re-anchor / session_218 / worklog Session-184)
- [x] committed + pushed via the SSH wrapper + remote-verified
      (commit `c6578a7` — `refs/heads/main @ c6578a7 == local HEAD`, the
      tracking ref synced; the operator key shredded after the push)

## §9 The final checklist (the operator's asks, mapped)

- [x] Workspace refreshed (cold clone at `09dfaeb`); doc chain re-read +
      validated against the codebase
- [x] Audit with the repo skills (web-application primary; the catalog
      for the rotation; nextjs16-tailwind4 §9 for the mobile-nav watch)
- [x] Live reference login + baseline (desktop parity MATCH; mobile nav
      verified fresh — no Tailwind v4 bug, the 106th consecutive)
- [x] `.env` at `DATABASE_URL="file:../db/custom.db"` + the repo-root
      `db/` (byte-identical to `.env.example`; pushed + seeded)
- [x] The vitest/playwright suites validated (configs re-verified; the
      unit layer 1713/1713 cold; the e2e cert re-tagged + re-run)
- [x] The remediation plan executed TDD-first (this document)
- [x] The evidence screenshots under docs/screenshots/
      (173-clone-desktop.png · 173-clone-mobile-drawer.png ·
      173-clone-gradetracker.png, self-verifying)
- [x] `.env.example` verified matching the codebase (no env changes this
      cycle)
- [x] The doc chain updated for alignment
- [x] The worklog updated + committed
- [x] Pushed to main via the SSH wrapper, remote-verified

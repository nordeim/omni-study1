# Remediation Plan — Session 171 (Cycle 121, Batch DU)

> Status: PLANNED (pre-change record — the immutable plan; the as-executed
> close lives in §8). Written before any source change, per the standing
> doctrine ("write the cycle plan into docs/remediation-plan-sessionN.md
> BEFORE any source change").
>
> Operator directive: refresh the workspace, re-read the doc chain
> (AGENTS/CLAUDE/README/PAD/SKILL + session_212 +
> remediation-plan-session170 + worklog + session_213), validate against the
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
> Session note: this cycle continues the rotation from the S170/Batch DT
> close (`b982ea8` pushed + remote-verified; `5ecd477` ticked the plan's
> final checklist item; `c40ac6c` — pulled this session — committed the
> operator's session_213 raw transcript, docs-only). The workspace was COLD
> (a fresh `git clone` — node_modules re-derived, chromium re-derived at
> revision 1243 per the S103/S166 doctrine, `db/custom.db` re-pushed +
> re-seeded, `.env` re-created byte-identical to `.env.example` at the
> documented dev posture). Every surface below was verified by direct read
> in THIS session before this plan was written.

## §0 Scope, method, cold baseline, live parity

**Workspace (cold — `git clone` at `c40ac6c` on `main`; the working tree
clean).** The `.env` re-created from `.env.example` (diff clean) at the
documented dev posture `DATABASE_URL="file:../db/custom.db"`; the repo-root
`db/` carries the freshly pushed + seeded custom.db. `bun install` ✓ (510
packages); `bunx playwright install chromium` ✓ (headless-shell v1243 — the
locked pin).

Cold baseline (before any work): lint ✓ · tsc ✓ · the full Vitest run
**1701/1701 (51 files — the documented S170 final state exactly)** ·
dev-server preflight GREEN (the :3000 daemon answering, hydrated,
navigation-stable) · **the drawer check GREEN (the 102nd consecutive**
no-Tailwind-v4-mobile-nav-bug confirmation — backdrop oklab(0 0 0 / 0.2) +
blur(4px), 288px white panel, 20 links, no footer, Escape-close superset) ·
**the desktop parity probe MATCH** (all four formal checks — navWidth 258 =
258 on both hosts, navLinkCount 20, the first-links sequence, mainX 260 —
live reference login via REF_PROBE_* env, the S141 redaction posture). The
mobile nav was ADDITIONALLY re-verified through a fresh agent-browser pass
at 390×844 (the operator's standing ask): the drawer opens (aria-expanded),
all 20 links in the measured order, a drawer-link navigation lands on
/StudyGroups with the drawer auto-closed, Escape closes (the superset), the
backdrop click at an exposed point (350,400 — clear of the 288px panel)
closes, and the app-bar computes z-40 + border-bottom 1px + fixed (the
DT2b chrome live). Baseline noise: none. The config posture re-validated
for the operator's standing ask: the vitest include matches
`src/**/*.test.ts` + `tests/**/*.test.ts` only; the playwright testDir is
`tests/e2e` with the production-build webServer on `db/e2e.db`; tsconfig
excludes `skills`; eslint ignores `skills` — the repo-included `skills/`
folder is excluded from code checking, testing, and compilation on every
axis.

**The ledger correction (the rotation-axis finding, verified at the
source):** the S170 close's "Next cycle" list names "deck" as the next CB8
seam — STALE. The deck family (createFlashcardDeck / updateFlashcardDeck /
deleteFlashcardDeck + the card trio) has carried the CB8 catches + the DQ1
pair set since S167 (commit `8d25d9a`, data.ts:883-926 — the doctrine
comment names it "the sixth family"). The TRUE remaining pre-CB8 families
(read directly from data.ts this session): **studyGroups (943-986),
practiceTests (929-940), grades (989-1000), focusSessions (1003-1014),
holidays (1017-1028)** — plus the `createCalculatorEntry` create-only
mutation (:1031-1034), which no ledger has ever named (recorded here as an
observation; its refresh is a single collection and its only consumer is
the calculator view's fire-and-forget history append). The rotation axis
for THIS cycle is therefore the **studygroups family** — next in the
recorded order once the stale deck entry is corrected.

**The reference's StudyGroups surface, measured live this session** (the
gated write-path probe — one throwaway row created, captured, DELETEd,
zero residue verified; computed facts, DOM-authority doctrine):

- The create dialog: title **"Create Study Group"**; a name INPUT
  (placeholder **"e.g., Math Study Squad"**); a description TEXTAREA
  (placeholder **"What's this group about?"**); SIX color swatches —
  rgb(139,92,246) / rgb(59,130,246) / rgb(16,185,129) / rgb(245,158,11) /
  rgb(239,68,68) / rgb(236,72,153) — the clone's GROUP_COLORS
  (`#8b5cf6 #3b82f6 #10b981 #f59e0b #ef4444 #ec4899`) match EXACTLY; the
  footer's DOM order is submit-then-secondary (**"Create Group"** then
  **"Close"**). No subject picker in the reference's dialog (the clone's
  is a documented superset, the tasks-dialog precedent).
- The model (the POST round-trip): `name`, **`description`**, `subject_id`,
  `color`, `members` (objects carry `name`/`email`/`role` — the creator is
  auto-added as `admin`), `meeting_schedule`, `chat_messages`, `is_sample`.
- **The reference's create→list flow is BROKEN**: the POST commits (200,
  the row returned with an id), the refresh GET returns `[]`, the view
  keeps rendering "No study groups" (measured twice, plus a full reload).
  The clone's working study-groups CRUD is the documented superset posture
  ("where the reference is broken or empty the clone keeps the layout but
  ships working features").
- The view-level copy already parity-corrected in prior sweeps (verified
  against the live reference this session): "Search groups…" placeholder,
  "No study groups" empty state, "Select a group" right pane.

**The clone's dialog copy is scaffold-era** (git `-S` provenance: the
"New Study Group" title + "e.g. Calculus cram crew" placeholder date from
the initial `7b1e78d` implementation commit and were never re-measured):
title "New Study Group", submit "Create group", secondary "Cancel" before
the submit, and NO description field anywhere in the family (schema,
validation, row type, dialog, display). The reference's dialog has since
re-deployed (the S170 chrome-drift precedent: the reference drifts — the
standing probes are the tripwire).

## §1 The audits (Mode-C; every H/L finding re-verified by direct read by the orchestrator)

### Audit A — the recent-changes axis (`5ecd477` + `c40ac6c`, both docs-only since the S170 fix `b982ea8`): **0C / 0H / 0M / 0L / 0I — clean.**

The S170 claims verified at the source anchors: **DT1** — the three
contained catches at data.ts:670-681 (the doctrine comment re-tagged
S170/DT1 at :647, the ninth family); **DT2a** — the sidebar's
`border-x shadow-xl shadow-slate-200/50 z-40 transition-all duration-300`
className + the S170/DT2a comment (sidebar.tsx:37-48); **DT2b** — the
app-bar's `border-b shadow-sm z-40` + the S170/DT2b comment
(mobile-chrome.tsx:131-136). The doc census chain machine-verified
consistent at 1701 + 634 = 2335 (README badge + prose + the Session-170
row; AGENTS + CLAUDE; PAD v1.3.78; SKILL; the vitest header; the cert
runner Expected line 158 + 197 + 95 + 95 + 89 = 634, machine-pinned by the
script-conventions tripwire). The commit diffs are docs-only (2 files, no
source, no skills/ files touched). The root scratch sweep: clean.

### Audit B — the studygroups family (the rotation's fresh axis, the ledger-corrected next seam): **0C / 1H / 0M / 1L / 2I.**

The family read against the web-application skill's §4/§7/§8/§9/§13/§16/§17
rubric: the FOUR mutations in data.ts:943-986 + the studyGroup API routes
(the delegate factory: makeCollectionRoutes + makeItemRoutes over
studyGroupDelegate with `ownedFks: OWNED_FKS.studyGroup` — the subjectId
FK guard) + the seams they consume (validation.ts's studyGroupSchema
:467-486 [boundedTitle name, hexColor, nullableId subjectId, the AM1
trim-before-check members array capped at 50]) + the consumer census
(studygroups-view.tsx:101/104/230/252/530 — the dialog submit, the
add/remove member legs, the AlertDialogAction delete — ALL FOUR mutation
legs have live view consumers, unlike the S170 taskLists axis).

The family is coherent on every other axis (re-verified by direct read):

- **Ownership** — in the WHERE clause by construction (the delegate
  factory; every query scoped `where: { userId }`; the subjectId FK
  guarded by OWNED_FKS).
- **Zod at both boundaries** — the route factory parses with the
  delegate's schemas; the members array validated at the boundary
  (membersFromRow/membersToWrite).
- **The API surface** — /api/study-groups + /api/study-groups/[id] via the
  factory (the ownership-scoped collection + item routes; nothing to add).
- **The members chain** — setStudyGroupMembers rides the per-group
  CX2 chain (the updater form, the call-time store read) — correct on the
  interleaving axis; the chain entry's REFRESH leg is the CB8 exposure
  (below).

The findings:

- **H-1 (DU1)** — the studygroups family mutations reject on the refresh
  leg after a COMMITTED write (data.ts:943-986, the pre-CB8 shape, the
  TENTH family of the recorded port, the third of the eight remaining
  seams once the stale deck entry is corrected): createStudyGroup
  (:943-946) and updateStudyGroup (:947-950) ride the uncaught `await
  fetchAndSet("studyGroups")`; deleteStudyGroup (:983-986) the same single
  collection; setStudyGroupMembers' chain entry (:962-982) rides the
  uncaught `await fetchAndSet("studyGroups")` INSIDE the chain — the
  refresh rejection propagates through `chained` to `await chained`, so a
  committed members PATCH + a flaky refresh rejects the whole call. The
  view consumers make this the highest-impact CB8 seam yet: the
  StudyGroupDialog submit catch's "Could not save the study group." toast
  with the dialog STILL OPEN and the form armed on a row the server
  COMMITTED (the retry that DUPLICATES the group — the exact DS1 shape),
  the add/remove member catches' false "Could not add/remove the member."
  toasts, and the AlertDialogAction delete catch's false "Could not delete
  the study group." on a row the server deleted.
- **L-1 (DU2a)** — the create dialog's copy is scaffold-era and the
  reference has since re-deployed its dialog (measured live, §0): title
  "New Study Group" → "Create Study Group"; name placeholder
  "e.g. Calculus cram crew" → "e.g., Math Study Squad"; submit
  "Create group" → "Create Group"; the secondary "Cancel" → "Close" and
  the footer order Cancel-then-submit → submit-then-Close. Class/copy
  level, no DOM-structure change beyond the DU2b field.
- **I-1 (DU2b)** — the reference's StudyGroup model carries a DESCRIPTION
  field (the dialog's textarea + the POST round-trip, §0); the clone
  lacks it end-to-end. A functional gap against the superset goal →
  ported this cycle (schema + validation + row type + dialog + display +
  seed + import cap), mirroring the in-repo deck-description precedent
  (`flashcardDeckSchema.description`, cap 1_000, `String @default("")`).
- **I-2 (recorded, out of scope)** — the reference's members carry a
  `role` field (the auto-added creator is `admin`) and the model carries
  `meeting_schedule` / `chat_messages`; the reference's own UI for these
  is UNMEASURABLE today (the create→list flow is broken — §0), so there
  is no parity contract to pin. Recorded as observations for a future
  re-probe cycle (the S123 data-shape doctrine: the reference's demo
  account drifts; chrome-level facts stay authoritative, data-shaped
  probes do not).

### Audit C — the standing gates re-verified this session: **clean (the §0 record).**

The drawer check GREEN (the 102nd consecutive). The desktop parity probe
MATCH (all four checks — no new reference chrome drift). The dev-server
preflight GREEN. The `skills/` exclusion posture re-verified (tsconfig
excludes, eslint ignores, the vitest include). The `.env` /
`.env.example` contract re-verified byte-identical at the documented dev
posture (no env-var reads change this cycle — the description field
touches no environment surface). The mobile-nav watch re-verified through
the standing script AND a fresh agent-browser pass (§0).

## §2 DU1 — the studygroups family CB8 split (the H-1 close)

The DK1/DL1/DM1/DN1/DP1/DQ1/DR1/DS1/DT1 doctrine ported verbatim to the
tenth family of the recorded family-wide port. The fix is contained AT THE
SEAM (data.ts:943-986): createStudyGroup's, updateStudyGroup's, and
deleteStudyGroup's refresh legs each gain
`.catch(() => undefined)`; setStudyGroupMembers' chain entry gains the
same contained catch on its `await fetchAndSet("studyGroups")` — the
chain entry never rejects into the CHAIN either way (the stored
`chained.catch(() => undefined)` guards the chain), but the CALLER's
`await chained` must not see the refresh rejection either (the
committed-PATCH + flaky-refresh call resolves; the failed PATCH still
rejects to the caller honestly). The WRITE legs keep rejecting honestly.
The stale slices self-heal on the next successful load (the S16
view-switch pre-warm + the next mutation's own refresh — the DJ5
doctrine). The doctrine comment re-tagged S171/DU1 (the tenth family; the
ledger-corrected third of the eight remaining seams — the comment records
the deck-ledger correction).

- **Unit (the DU1 pair set, tests/data-store.test.ts — the DT1 pair set
  the template, appended after the DT1 describe at :1189-1229)**: six
  legs — the resolve set (createStudyGroup / updateStudyGroup /
  deleteStudyGroup / setStudyGroupMembers: `apiSendMock` resolves +
  `apiGetMock` rejects → the mutation RESOLVES; RED pre-fix ×4 — the
  members leg seeds the store slice so the chain finds its group, and
  its unique group id avoids any cross-test chain-map residue) + the two
  failed-write guards (createStudyGroup AND setStudyGroupMembers:
  `apiSendMock` rejects → the mutation REJECTS; green-on-arrival — the
  honest failures reach the callers).
- **E2e (the DU1 leg, tests/e2e/resilience.spec.ts — the DS1 idiom,
  appended at the file's tail)**: the create-through-failed-refresh pin —
  route `**/api/study-groups` aborting GET (the refresh) while POST (the
  write) continues; open the create dialog, fill the name, submit; the
  POST's 201 captured (the zero-residue id); assert the "Study group
  created" success toast + the CLOSED dialog + the FALSE
  "Could not save the study group." never rendering; finally unroute +
  DELETE the created row. RED pre-fix exactly at the toast assertion (the
  false save-failure fires, the dialog stays open); GREEN post-fix. The
  submit locator rides `getByRole("button", { name: "Create Group" })` —
  Playwright's name matching is case-insensitive, so the SAME locator
  matches the pre-fix "Create group" and the post-fix "Create Group": the
  RED lands on the CB8 behavior, not the copy (the DU2 legs own the
  copy).

## §3 DU2 — the studygroups dialog parity catch-up + the description port (L-1 + I-1)

- **DU2a — the create-dialog copy (class/copy level, measured §0):**
  the dialog title `{group ? "Edit Study Group" : "Create Study Group"}`;
  the name placeholder "e.g., Math Study Squad"; the create-leg footer
  re-ordered submit-then-secondary with labels "Create Group" + "Close"
  (the edit leg keeps its measured-era shape — [Cancel][Save changes] —
  the reference's EDIT dialog is unmeasurable today, its list flow being
  broken). The S171/DU2a comment records the measurement.
- **DU2b — the description field (the deck-description precedent
  mirrored):**
  - `prisma/schema.prisma`: `description String @default("")` on
    StudyGroup (additive, default-empty — `db push` applies it without
    data loss; no migrations in this repo's workflow).
  - `src/lib/validation.ts` studyGroupSchema:
    `description: z.string().max(500).optional().default("")` — bounded
    (the superset bound the reference's unbounded textarea lacks; 500
    chars for a group blurb, the repo's bounded-everything posture).
  - `src/lib/data.ts` StudyGroupRow: `description: string` (the
    StudyGroupInput type derives from the schema via z.input — no
    separate edit).
  - `src/components/views/studygroups-view.tsx`: the dialog gains the
    description field (Label "Description (optional)" + textarea
    `id="group-description"`, placeholder "What's this group about?" —
    the clone's visible-Label superset pattern over the reference's
    placeholder-only inputs, the established a11y posture), placed after
    the name input; the field order becomes Name → Description → Color →
    Subject (the reference's measured prefix intact; the superset
    Subject select moves after the swatches); the submit payload carries
    `description` (state seeded from the group on edit); the DETAIL pane
    renders the description (when non-empty) between the header row and
    the Members card — slate-600 / dark slate-300, the clone's
    internal-consistency standard (the reference's own detail display is
    unmeasurable, its list flow being broken).
  - `prisma/seed.ts`: the seeded "Calc Crew" gains a description (fresh
    e2e/dev databases render the field populated; the idempotent seed's
    existing-row upserts do not refresh it — the documented S45-class
    posture, acceptable for a display-only enrichment).
  - `src/lib/data-import.ts`: `IMPORT_FIELD_LENGTHS` gains
    `"studyGroups.description": 500` (keyed by the manifest collection
    name, the S133/CH1 doctrine).
- **E2e (the DU2 pin pair, tests/e2e/parity-session7.spec.ts — the S7-B
  describe, the group-dialog idiom)**:
  - **The copy leg**: open the create dialog; assert the title "Create
    Study Group", the name input's placeholder "e.g., Math Study Squad",
    the description textarea's placeholder "What's this group about?",
    the submit "Create Group" (exact) and the secondary "Close", and the
    footer's DOM order (submit before secondary). RED pre-fix at the
    title assertion.
  - **The description round-trip leg**: create a group THROUGH THE DIALOG
    with a name + a distinctive description; select it; assert the
    detail pane renders the description text; finally DELETE (zero
    residue). RED pre-fix at the textarea absence.
- **Unit (the DU2 import leg, tests/data-import.test.ts — the CH1
  rejection idiom)**: a studyGroups row with a 501-char description
  rejects at `sanitizeImportRow`; a 500-char row passes. RED pre-fix (the
  cap key absent → the 1M generic default). The census pin updates in
  lockstep: the `IMPORT_FIELD_LENGTHS` key list gains
  "studyGroups.description" (alphabetical: before "studyGroups.name")
  and the parity-contract VALIDATION_TS_MAP gains
  `"studyGroups.description": ["studyGroupSchema", "description"]` — the
  resolveCap extractor re-derives the 500 from the schema source, so the
  census self-verifies.

## §4 The RED inventory (as designed)

1. **DU1 unit resolve set** — data-store.test.ts, the DU1 pair set: RED
   ×4 pre-fix (the four mutations reject with "offline" on the
   committed-write + failed-refresh shape).
2. **DU1 unit failed-write guards** — green-on-arrival ×2 (the write legs
   reject today and must keep rejecting).
3. **DU1 e2e leg** — resilience.spec.ts: RED on the pre-fix build (the
   false "Could not save the study group." fires; the dialog stays open;
   the success toast never lands).
4. **DU2 copy leg** — parity-session7.spec.ts: RED on the pre-fix build
   (the title reads "New Study Group").
5. **DU2 description round-trip leg** — parity-session7.spec.ts: RED on
   the pre-fix build (no description textarea exists).
6. **DU2 import cap leg** — data-import.test.ts: RED pre-fix (the
   501-char description imports — the cap key absent).

## §5 The GREEN implementations (as designed)

1. **DU1** — data.ts:943-986: the four contained catches (the
   create/update/delete trio + the members chain entry) + the doctrine
   comment (the tenth family, the ledger-corrected order).
2. **DU2a** — studygroups-view.tsx: the dialog title / name placeholder /
   create-leg footer labels + order + the S171/DU2a comment.
3. **DU2b** — schema.prisma (the column; `db push`) · validation.ts (the
   bounded field) · data.ts (the row type) · studygroups-view.tsx (the
   dialog field + the payload + the detail render) · seed.ts (Calc Crew's
   description) · data-import.ts (the cap key).
4. **The census/test lockstep** — data-import.test.ts (the key list +
   the parity map + the rejection leg).

## §6 The gates (the pre-push contract)

lint ✓ · tsc ✓ · the full unit suite **1708/1708** (51 files, +7 exactly
as designed: data-store +6, data-import +1) · build ✓ · the touched spec
files green in full-file runs (resilience + parity-session7) · **the
5-chunk cold cert 637/637** (the re-tagged map: 158 + 199 + 96 + 95 + 89
— chunk 2 +2 [the DU2 pair in parity-session7], chunk 3 +1 [the DU1 leg
in resilience]) · the drawer check GREEN on the remediated tree (the
103rd consecutive) · the desktop parity probe MATCH (the reference-side
tripwire) · the evidence frames (3 md5-distinct captures, the S170
template).

## §7 The adjudications (the open questions, resolved)

1. **The rotation axis** — the S170 ledger's "deck is next" is STALE
   (verified at the source: the DQ1 catches + pair set since S167). The
   studygroups family is the next seam (the ledger-corrected order);
   recorded in the doctrine comment + the worklog close so the next
   rotation reads the corrected list (practiceTest / grades /
   focusSessions / holidays + the calculatorHistory observation).
2. **The e2e leg for DU1** — DERIVED (unlike the S170 taskLists
   adjudication): the family's four mutations ALL have live view
   consumers, so the DS1 create-through-failed-refresh idiom applies
   directly. The locator choice (case-insensitive "Create Group") keeps
   the RED on the CB8 behavior while DU2 owns the copy.
3. **The description bound** — 500 (the bounded-everything posture; the
   deck's 1_000 is the precedent family, but a group blurb is a shorter
   form; the census machinery pins whatever bound ships).
4. **The members `role` / `meeting_schedule` / `chat_messages` fields** —
   OUT OF SCOPE (I-2): the reference's UI for them is unmeasurable (its
   list flow is broken), so there is no parity contract; the clone's
   plain {name,email} members stay the documented shape.
5. **The edit-dialog footer** — kept as [Cancel][Save changes] (the
   reference's edit dialog is unmeasurable; the create leg carries the
   measured [Create Group][Close]).
6. **The DU2 detail-pane render** — the clone's own surface (the
   reference's detail pane is unmeasurable): the description renders
   between the header row and the Members card, the internal-consistency
   standard.

## §8 The as-executed close (filled at the cycle's end)

- [x] DU1 unit pair set: RED ×4 proven pre-fix (`4 failed | 2 passed`),
      GREEN post-fix
- [x] DU1 e2e leg: RED proven on the pre-fix build (failing exactly at
      the success-toast assertion), GREEN post-fix
- [x] DU2 copy + round-trip legs: RED proven (at the title assertion /
      at the textarea absence), GREEN post-fix — the copy leg's first
      GREEN run tripped the "Close" strict-mode collision (the shadcn
      X's sr-only name) and gained the form-scoped locator
- [x] DU2 import cap legs: RED ×2 proven, GREEN post-fix
- [x] lint ✓ · tsc ✓ · unit **1709/1709** (+8: data-store +6,
      data-import +2 — the §6 arithmetic said +7; the DU2b describe
      carries TWO legs [the cap assertion + the rejection pair], the
      correction recorded here per the S170 arithmetic-error
      precedent; three StudyGroupRow fixtures gained `description: ""`
      for the new required row-type field)
- [x] build ✓ (the documented "Ecmascript file had an error" toolchain
      noise pre-existing) · the touched spec files green in full-file
      cold runs (resilience 45/45 — one first-pass AJ1 failure triaged
      per the P1008 protocol: the isolate reproduction PASSED clean on
      a fresh boot (201/200/200, the parent preserved) + the cold
      re-run 45/45; parity-session7 62/62)
- [x] the 5-chunk cold cert **637/637** — chunk 1 158/158 first-pass ·
      chunk 2 199/199 first-pass (both DU2 legs) · chunk 3 96/96 on
      the cold re-run (the first-pass and the first re-run each lost
      ONE files-upload-edge leg to the documented P1008
      socket-timeout-under-load class — the server-side signature
      CAPTURED this cycle (`PrismaClientKnownRequestError: Socket
      timeout`), the failures MOVING between AJ siblings with
      shape-shifting wrong statuses (500 on the rename, 413 on the
      tiny re-parent PATCH — the S170 session's own "200 instead of
      400" shape), every failed leg GREEN in cold isolation, zero
      files-flow code touched this cycle, the manual probe clean) ·
      chunk 4 95/95 first-pass · chunk 5 89/89 first-pass
- [x] the drawer check GREEN on the remediated tree (**the 103rd
      consecutive**) · the desktop parity probe **MATCH** (all four
      checks)
- [x] the evidence frames captured + self-verified
      (capture-s171-evidence.mjs: ok true, md5s distinct)
- [x] docs lockstep complete (README badge 2335 → 2346 + prose + the
      Session-171 row / AGENTS census + the S171 lessons block / CLAUDE
      counts / PAD v1.3.79 / SKILL all four sites [chromium-spec
      629 → 632] / vitest header +8 / cert runner re-tag [Expected
      158 + 199 + 96 + 95 + 89 = 637] / tripwire 136/136 after the
      re-anchor / session_214 / worklog Session-182)
- [x] committed + pushed via the SSH wrapper + remote-verified

## §9 The final checklist (the operator's asks, mapped)

- [x] Workspace refreshed (cold clone at `c40ac6c`); doc chain re-read +
      validated against the codebase
- [x] Audit with the repo skills (web-application primary; the catalog
      for the rotation; nextjs16-tailwind4 §9 for the mobile-nav watch)
- [x] Live reference login + baseline (desktop parity MATCH; mobile nav
      verified fresh — no Tailwind v4 bug, the 102nd consecutive)
- [x] `.env` at `DATABASE_URL="file:../db/custom.db"` + the repo-root
      `db/` (byte-identical to `.env.example`; pushed + seeded)
- [x] The vitest/playwright suites validated (configs re-verified; the
      unit layer 1701/1701 cold; the e2e cert re-tagged + re-run)
- [x] The remediation plan executed TDD-first (this document)
- [x] The evidence screenshots under docs/screenshots/
      (171-clone-desktop.png · 171-clone-mobile-drawer.png ·
      171-clone-studygroups.png, self-verifying)
- [x] `.env.example` verified matching the codebase (no env changes this
      cycle)
- [x] The doc chain updated for alignment
- [x] The worklog updated + committed
- [x] Pushed to main via the SSH wrapper, remote-verified

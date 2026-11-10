# Session 218 — the S173 cycle (Batch DW)

The workspace was COLD — a fresh `git clone` at `09dfaeb` on `main`
(the S172/Batch DV fix `9db9a8d` pushed + remote-verified by the prior
session, and the operator's session_217 transcript commit `09dfaeb`).
The environment rebuilt from the documented quickstart: `.env` from
`.env.example` (byte-identical at the documented dev posture
`DATABASE_URL="file:../db/custom.db"`, the repo-root `db/` carrying
the freshly pushed + seeded custom.db), `bun install` (510 packages),
the Playwright chromium re-derived at the locked v1243 pin.

The doc chain re-read (worklog tail, session_216, the S172 plan
§8/§9, session_217 [the operator's raw S172 transcript], the census
sites across README/AGENTS/CLAUDE/PAD/SKILL), then validated against
the codebase: the DV1 catches + the DV2 dialog surface verified at
their source anchors, the doc census chain machine-verified
consistent at 1713 + 639 = 2352.

Cold baseline (before any work): lint ✓ · tsc ✓ · the full Vitest run
**1713/1713 (51 files — the documented S172 final state exactly)** ·
dev-server preflight GREEN · **the drawer check GREEN (the 106th
consecutive** no-Tailwind-v4-mobile-nav-bug confirmation) · **the
desktop parity probe MATCH** (all five formal checks — navWidth 258 =
258, navLinkCount 20, the first-links sequence, mainX 260, mainWidth
1180; the probe's FIRST pass read a pre-mount reference — navWidth
null, the documented S170 reference-latency flake class — the bounded
retry carried it to the standard MATCH). The mobile nav ADDITIONALLY
re-verified through a fresh agent-browser pass at 390×844 (the
operator's standing ask): the drawer opens (aria-expanded) with all
20 links in the measured order, a drawer-link navigation lands on
/GradeTracker with the drawer auto-closed, Escape closes (the
superset), the backdrop click at an exposed point closes, and the
app-bar computes z-40 + border-bottom 1px + fixed + 64px (the DT2b
chrome live). Baseline noise: none. The config posture re-validated:
the `skills/` folder excluded from code checking, testing, and
compilation on every axis (tsconfig excludes, eslint ignores, the
vitest include); the `.env` ≡ `.env.example` contract re-verified.

**The rotation axis (verified at the source):** the S172 close's
ledger-corrected order names grades as the next CB8 seam — CONFIRMED
by direct read this session (the trio at data.ts:1047-1058 rode the
uncaught `fetchAndSet("grades")`). The remaining seams after this
cycle: focusSessions / holidays + the `createCalculatorEntry`
create-only observation. The rotation axis for this cycle: the
**grades family**.

The audits (Mode-C; every H/L finding re-verified by direct read):

- **A — the recent-changes axis** (`09dfaeb`, docs-only since the
  S172 fix): **0C / 0H / 0M / 0L / 0I — clean.**
- **B — the grades family** (the rotation's fresh axis):
  **0C / 1H / 0M / 1L / 0I.** The family coherent on every other
  axis (the delegate's owned-Query scoping + the OWNED_FKS.subjectId
  guard, Zod at both boundaries, the BZ6 score ≤ maxScore ordering
  guard + the import seam's three-entry-point mirror, the factory
  routes). The findings: **H-1** the THREE family mutations (the
  create/update/delete trio) rejected on the refresh leg after a
  COMMITTED write — and ALL THREE have live view consumers (the
  GradeDialog submit catch's false "Could not save the grade." with
  the dialog open — the duplicate-creating retry; the
  AlertDialogAction delete catch's false claim). **L-1** the create
  dialog's copy AND FIELD SET are scaffold-era (git `-S` provenance:
  `7b1e78d`) and the reference has since re-deployed its dialog —
  at the FIELD level this cycle: the reference's dialog records a
  TYPE (Homework/Quiz/Test/Midterm/Final/Project) and a DATE the
  clone's model could not store.
- **C — the standing gates**: clean (the §0 record) + the reference's
  GradeTracker surface measured live through the GATED WRITE-PATH
  probe (TWO throwaway grade rows created through the real dialog —
  one without a subject, one with a throwaway "Probe Math" subject
  created through the reference's own Settings → Subjects → Add
  Subject surface — captured, DELETEd via the platform's entity API
  [the surface carries NO delete affordance: the "Add Grade" opener
  measured as the ONLY interactive element in main, the grade pills
  read-only spans], zero residue verified after each): the create
  dialog reads title **"Add New Grade"**, a SUBJECT select first, a
  TYPE select defaulting **"Homework"** (the six measured options),
  the placeholder-labeled **"Score"** / **"Max Score"** / **"Weight
  (optional, default 1)"** inputs, a NATIVE date input defaulting
  today, and the footer **[Cancel][Add Grade]**. The reference's
  create→list flow WORKS on this surface (Total Grades 0 → 1 → 2, the
  subject-linked row rendered its pill — no reference-side data bug).

The remediation plan written BEFORE any source change
(`docs/remediation-plan-session173.md`, the plan-first doctrine),
validated against the codebase surfaces, then executed TDD-first
(every RED on its designed marker):

- **DW1 — the grades family CB8 split (the H-1 close).** The three
  contained catches at the seam (data.ts:1047-1058) + the doctrine
  comment re-tagged S173/DW1 (the TWELFTH family, the fifth of the
  eight remaining seams). Unit RED `3 failed | 1 passed` (the resolve
  set ×3 + the failed-write guard green-on-arrival). The e2e leg
  (resilience, the DV1 idiom) RED-proven on the pre-fix build —
  failing exactly at the success-toast assertion — GREEN post-fix.
  The submit locator rides the dialog-scoped exact "Add Grade" match
  (the label identical pre-fix and post-fix), and the DW2 type/date
  fields carry deterministic defaults ("homework" + today) so the leg
  fills only the title + score + max.
- **DW2 — the create-dialog catch-up + the type/date FIELD PORT (the
  L-1 close — the S171/DU2b description-port precedent applied at
  the field level).** The GRADE_TYPES vocabulary (validation.ts,
  beside EXAM_TYPES) + the `type`/`date` columns ported end-to-end:
  schema.prisma (`type String @default("homework")` +
  `date DateTime?`) · gradeSchema (`z.enum(GRADE_TYPES)` +
  `optionalDate` — PATCH-safe by the S82/AI1 sentKeysPatch doctrine)
  · the GradeRow type · the dialog (the measured title "Add New
  Grade" + the Subject-first field order + the Type select with the
  exams-view capitalize idiom + the native date input riding the CB2
  TZ atoms [fromDueDateInput/toDateInputValue] + the "Max Score"
  label + the "Weight (optional, default 1)" hint + the kept
  [Cancel][Add Grade] footer; the edit leg keeps "Edit Grade" +
  [Cancel][Save changes] — the reference has no edit affordance) ·
  the row render's type/date metadata (the superset rows) · the
  seed's five typed/dated defs · the import seam's ENUM_VOCABULARIES
  mirror (`"grades.type": GRADE_TYPES`) · the enum single-source
  census's SEVENTH site. The clone's Title input stays (the
  superset — the reference's dialog has no title input). The e2e
  copy pin (parity-session7) RED-proven at the title assertion,
  GREEN post-fix — including the capitalize-class assertion for the
  Type select (the first draft's `toHaveText(/Homework/)` failed on
  the house's CSS-transform convention: the DOM text carries the
  lowercase schema value; the corrected pin asserts the value + the
  `capitalize` class) and the native date input's today default.

**Gates**: lint ✓ · tsc ✓ · unit **1719/1719** (51 files, +6 exactly:
data-store +4, enum-single-source +2) · build ✓ (the documented
"Ecmascript file had an error" toolchain noise pre-existing) · the
touched spec files green in full-file cold runs (resilience 47/47,
parity-session7 64/64 — no flakes observed this cycle) · the 5-chunk
cold cert **641/641** · the drawer check GREEN on the remediated
tree (**the 107th consecutive**) · the desktop parity probe **MATCH**
· the tripwire 136/136 after the doc-chain lockstep.

**Evidence**: `docs/screenshots/173-clone-desktop.png` (the standing
desktop dashboard) · `173-clone-mobile-drawer.png` (the 107th
drawer-GREEN companion) · `173-clone-gradetracker.png` (the cycle's
surface — the GradeTracker view with the create dialog open, the
measured title + the Subject-first order + the Type select + the
date input + the [Cancel][Add Grade] footer + the seeded typed/dated
rows below), captured by `scripts/capture-s173-evidence.mjs`
self-verifying (ok: true, md5s distinct) + the not-pure-white
pixel-ratio verification.

**Docs lockstep**: README badge/census (2352 → 2360) + the count
prose sites (the tree diagram's unit + e2e counts, the test-command
block) + the Session-173 row; AGENTS census (1719 + 641) + the S173
lessons block (three lessons: a reference dialog can drift at the
FIELD level — measure the field set, not only its labels, and port
through the DU2b shape; a surface with no delete affordance makes
the probe's cleanup an entity-API exercise with the localStorage
Bearer token executed in-page; the e2e pin for a CSS-capitalized
enum asserts the DOM text + the class, never the transformed
string); CLAUDE counts (1719 + 641); PAD v1.3.81 (the revision
block); the SKILL census (all four sites — the header line, the §11
green-state line, the eslint-posture line, the cert-map figure
re-derived 634 → 636 chromium specs); the vitest header re-anchor
(+6); the cert runner re-tag (the S173 block + Expected 158 + 201 +
98 + 95 + 89 = 641, machine-pinned by the script-conventions
tripwire — verified GREEN after the re-anchor: 136/136); this log;
the worklog Session-184 entry; the plan §8 as-executed close; the
`.env.example` contract re-verified (no env-var reads changed this
cycle — .env and .env.example byte-identical at the documented dev
posture).

Next cycle. The rotation continues: the remaining three CB8 seams
(focusSessions / holidays + the calculatorHistory create-only
observation). The other recorded deferrals: the task-lists e2e leg
(when/if a list surface ships); the unannounced loading-gate
families (the S166 gate census minus the closed siblings); the files
refresh-failure toast copy harmonization (the F-8 candidate); the
S160 close's ledger; the gradetracker/settings-CRUD and
AlertDialog-confirm e2e gaps; a periodic re-probe of the reference's
chrome AND dialog surfaces (the standing probes are the tripwire —
this cycle's field-level catch-up is the fourth consecutive family
with reference dialog drift, and the first at the field level,
confirming the pattern's escalation).

# Session 216 — the S172 cycle (Batch DV)

The workspace was COLD — a fresh `git clone` at `eb47326` on `main`
(the S171/Batch DU fix `95c2b60` pushed + remote-verified by the prior
session, and the operator's session_215 transcript commit `eb47326`).
The environment rebuilt from the documented quickstart: `.env` from
`.env.example` (byte-identical at the documented dev posture
`DATABASE_URL="file:../db/custom.db"`, the repo-root `db/` carrying
the freshly pushed + seeded custom.db), `bun install` (510 packages),
the Playwright chromium re-derived at the locked v1243 pin.

The doc chain re-read (worklog tail, session_214, the S171 plan
§8/§9, session_215 [the operator's raw S171 transcript], the census
sites across README/AGENTS/CLAUDE/PAD/SKILL), then validated against
the codebase: the DU1 catches + the DU2a/DU2b dialog surface verified
at their source anchors, the doc census chain machine-verified
consistent at 1709 + 637 = 2346.

Cold baseline (before any work): lint ✓ · tsc ✓ · the full Vitest run
**1709/1709 (51 files — the documented S171 final state exactly)** ·
dev-server preflight GREEN · **the drawer check GREEN (the 104th
consecutive** no-Tailwind-v4-mobile-nav-bug confirmation) · **the
desktop parity probe MATCH** (all five formal checks — navWidth 258 =
258, navLinkCount 20, the first-links sequence, mainX 260, mainWidth
1180). The mobile nav ADDITIONALLY re-verified through a fresh
agent-browser pass at 390×844 (the operator's standing ask): the
drawer opens (aria-expanded) with all 20 links in the measured order,
a drawer-link navigation lands on /PracticeTests with the drawer
auto-closed, Escape closes (the superset), the backdrop click at an
exposed point (350,400 — clear of the 288px panel) closes, and the
app-bar computes z-40 + border-bottom 1px + fixed + 64px (the DT2b
chrome live). Baseline noise: none. The config posture re-validated:
the `skills/` folder excluded from code checking, testing, and
compilation on every axis (tsconfig excludes, eslint ignores, the
vitest include); the `.env` ≡ `.env.example` contract re-verified.

**The rotation axis (verified at the source):** the S171 close's
ledger-corrected order names practiceTest as the next CB8 seam —
CONFIRMED by direct read this session (the trio at data.ts:932-943
rode the uncaught `fetchAndSet("practiceTests")`). The remaining
seams after this cycle: grades / focusSessions / holidays + the
`createCalculatorEntry` create-only observation. The rotation axis
for this cycle: the **practiceTests family**.

The audits (Mode-C; every H/L finding re-verified by direct read):

- **A — the recent-changes axis** (`eb47326`, docs-only since the
  S171 fix): **0C / 0H / 0M / 0L / 0I — clean.**
- **B — the practiceTests family** (the rotation's fresh axis):
  **0C / 1H / 0M / 1L / 0I.** The family coherent on every other
  axis (the delegate's owned-Query scoping + the OWNED_FKS.subjectId
  guard, Zod at both boundaries, the factory routes, the BV5-bounded
  questions blob). The findings: **H-1** the THREE family mutations
  (the create/update/delete trio) rejected on the refresh leg after
  a COMMITTED write — and ALL THREE have live view consumers (the
  TestDialog submit catch's false "Could not save the practice
  test." with the dialog open — the duplicate-creating retry; the
  AlertDialogAction delete catch's false claim). **L-1** the create
  dialog's copy is scaffold-era (git `-S` provenance: `7b1e78d`) and
  the reference has since re-deployed its dialog.
- **C — the standing gates**: clean (the §0 record) + the reference's
  PracticeTests surface measured live through the GATED WRITE-PATH
  probe (TWO throwaway rows created through the real dialog →
  captured → DELETEd → zero residue verified after each): the create
  dialog reads title **"Create Practice Test"**, label **"Test Title
  \*"**, title placeholder **"e.g., Biology Chapter 5 Review"**, the
  "N questions added" counter (the clone's matches EXACTLY), and the
  footer's DOM order **[Create Test][Close]** (submit-then-secondary;
  the submit disabled until a title + ≥1 question). The reference's
  editor is AI-ONLY (no manual add-question affordance), carries NO
  subject picker, and its card menu is **Delete-ONLY (measured
  twice — NO edit affordance anywhere on the surface)**; the AI
  generation produced 10 questions across the same three types the
  clone models. **The reference's create→list flow WORKS on this
  surface** (both probe POSTs committed, the refresh listed the rows
  — unlike the S171 studygroups surface; no reference-side data bug).

The remediation plan written BEFORE any source change
(`docs/remediation-plan-session172.md`, the plan-first doctrine),
validated against the codebase surfaces, then executed TDD-first
(every RED on its designed marker):

- **DV1 — the practiceTests family CB8 split (the H-1 close).** The
  three contained catches at the seam (data.ts:932-943) + the
  doctrine comment re-tagged S172/DV1 (the ELEVENTH family, the
  fourth of the eight remaining seams). Unit RED `3 failed | 1
  passed` (the resolve set ×3 + the failed-write guard
  green-on-arrival). The e2e leg (resilience, the DU1 idiom)
  RED-proven on the pre-fix build — failing exactly at the
  success-toast assertion (the false "Could not save the practice
  test." fired, the dialog stayed open) — GREEN post-fix. The
  submit locator rides the dialog-scoped exact "Create Test" match
  (the label is identical pre-fix and post-fix; the dialog scoping
  avoids the page-opener collision), and the one question rides the
  clone's manual Add-question editor (the superset — the reference's
  AI-only editor is not e2e-deterministic).
- **DV2 — the create-dialog copy catch-up (the L-1 close).** The
  measured title "Create Practice Test" + the label "Test Title \*" +
  the placeholder "e.g., Biology Chapter 5 Review" + the create-leg
  footer re-ordered to the measured [Create Test][Close] (the edit
  leg keeps "Edit Practice Test" + [Cancel][Save changes] — the
  reference has no edit affordance, so the edit leg is the clone's
  own superset surface). The e2e copy pin (parity-session7)
  RED-proven at the title assertion, GREEN post-fix — including the
  footer DOM-order pin and the form-scoped "Close" locator (the
  shadcn X's sr-only "Close" collision, the S171 lesson).

**Gates**: lint ✓ · tsc ✓ · unit **1713/1713** (51 files, +4 exactly:
data-store +4) · build ✓ (the documented "Ecmascript file had an
error" toolchain noise pre-existing) · the touched spec files green
in full-file cold runs (resilience: three cold full-file runs each
lost ONE DIFFERENT files-upload-edge sibling to the documented
moving-target under-load class — AK1c, then AK1b, then AJ1 — every
failed leg GREEN in cold isolation, zero files-flow code touched
this cycle; parity-session7: the cert's chunk-2 cold re-run carried
it 200/200) · the 5-chunk cold cert **639/639** (chunk 1 158/158
first-pass · chunk 2 200/200 on the cold re-run — the first-pass
lost the timing-sensitive S81-era AH2a departed-Save leg [a
2500ms-hold pin, untouched this cycle], green in cold isolation and
in the re-run; chunk 3 97/97 first-pass [the DV1 leg green]; chunk
4 95/95 first-pass [the webServer LOGGED a PrismaClientKnownRequest
Error Socket timeout mid-chunk without failing a single leg — the
documented P1008 signature appearing as noise]; chunk 5 89/89
first-pass) · the drawer check GREEN on the remediated tree (**the
105th consecutive**) · the desktop parity probe **MATCH** · the
tripwire 136/136 after the doc-chain lockstep.

**Evidence**: `docs/screenshots/172-clone-desktop.png` (the standing
desktop dashboard) · `172-clone-mobile-drawer.png` (the 105th
drawer-GREEN companion) · `172-clone-practicetests.png` (the cycle's
surface — the PracticeTests view with the create dialog open, the
measured title + label + placeholder + the [Create Test][Close]
footer + the superset Add-question/AI-Generate editor), captured by
`scripts/capture-s172-evidence.mjs` self-verifying (ok: true, md5s
distinct) + the not-pure-white pixel-ratio verification (0.458 /
0.869 / 0.345).

**Docs lockstep**: README badge/census (2346 → 2352) + the count
prose sites (the tree diagram's unit + e2e counts, the test-command
block) + the Session-172 row; AGENTS census (1713 + 639) + the S172
lessons block (three lessons: a reference surface can carry NO edit
affordance at all — enumerate the affordances explicitly so the
superset doctrine knows which legs have a reference contract; the
e2e vehicle for an AI-only reference editor is the clone's manual
superset — pin through the deterministic affordance when the
reference's only path is an LLM; count the dialog-footer DOM order
from the MEASURED button list and scope the order assertion to the
submit + secondary or a section-local button silently joins the
set); CLAUDE counts (1713 + 639); PAD v1.3.80 (the revision block);
the SKILL census (all four sites — the header line, the §11
green-state line, the eslint-posture line, the chromium-spec figure
re-derived 632 → 634); the vitest header re-anchor (+4); the cert
runner re-tag (the S172 block + Expected 158 + 200 + 97 + 95 + 89 =
639, machine-pinned by the script-conventions tripwire — verified
GREEN after the re-anchor: 136/136); this log; the worklog
Session-183 entry; the plan §8 as-executed close; the
`.env.example` contract re-verified (no env-var reads changed this
cycle — .env and .env.example byte-identical at the documented dev
posture).

Next cycle. The rotation continues: the remaining four CB8 seams
(grades / focusSessions / holidays + the calculatorHistory
create-only observation). The other recorded deferrals: the
task-lists e2e leg (when/if a list surface ships); the unannounced
loading-gate families (the S166 gate census minus the closed
siblings); the files refresh-failure toast copy harmonization (the
F-8 candidate); the S160 close's ledger; the gradetracker/settings
-CRUD and AlertDialog-confirm e2e gaps; a periodic re-probe of the
reference's chrome AND dialog surfaces (the standing probes are the
tripwire — this cycle's dialog catch-up is the third consecutive
family with reference dialog drift, confirming the pattern).

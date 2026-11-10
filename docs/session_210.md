# Session 210 — the S169 cycle (Batch DS)

The workspace was WARM — `git pull` fast-forwarded `c828182` → `cc936fc`
on `main` (the S168/Batch DR fix `071a084` pushed + remote-verified by
the prior session, the plan-tick `c828182`, and the operator's
session_207/session_209 transcript commits `848c0bf`/`cc936fc` pulled
in; the only delta the session_209 raw transcript, docs-only; the
working tree clean). The environment stood intact from the S168 session:
node_modules present, the repo-root `db/` carrying custom.db (seeded) +
the gitignored e2e scratch, `.env` byte-identical to `.env.example` at
the documented dev posture `DATABASE_URL="file:../db/custom.db"` (diff
clean), and the post-S168 standalone build compiled at 02:34 — verified
fresh against every touched-family source mtime (data.ts 02:32,
tasks-view 02:32, settings-view 02:16 — all pre-build; the build's
static chunks carry the DR2 "Loading tasks" marker), so it stood as the
pre-DS1 build for the e2e RED proof without a rebuild.

The doc chain re-read (worklog tail, session_208, the S168 plan §8/§9,
session_209 [the operator's raw S168 transcript], the census sites
across README/AGENTS/CLAUDE/PAD/SKILL), then validated against the
codebase: all three DR claims verified at their source anchors (the six
contained catches + the S168/DR1 doctrine comment at data.ts:512-613,
the DR2 aria gates at tasks-view :706-709, the DR1 pair set at
data-store.test.ts:1025-1116 + the DR1 e2e leg at tasks.spec:248-312),
the doc census chain machine-verified consistent at 1693 + 631 = 2324.
The root scratch sweep: clean (the only root log the gitignored
`dev.log`).

Cold baseline (before any work): lint ✓ · tsc ✓ · the full Vitest run
**1693/1693 (51 files — the documented S168 final state exactly)** ·
dev-server preflight GREEN · **the drawer check GREEN (the 98th
consecutive** no-Tailwind-v4-mobile-nav-bug confirmation) · the desktop
parity probe **MATCH** (all five formal checks, live reference login —
run through the s142 FORMAL probe with the operator-provided
credentials). Baseline noise: none. The config posture re-validated for
the operator's standing ask (the `skills/` folder excluded from code
checking, testing, and compilation on every axis).

The audits (Mode-C; every H/L finding re-verified by direct read):

- **A — the Batch DR recent-changes axis** (`071a084` fix +
  `c828182`/`848c0bf`/`cc936fc` docs-only): **0C / 0H / 0M / 0L / 0I —
  clean.**
- **B — the subjects family** (the rotation's fresh axis, the FIRST of
  the eight remaining CB8 seams the S168 close's ledger names —
  "the subject/taskList/deck/studyGroup/practiceTest/grades/
  focusSessions/holidays families"): **0C / 1H / 0M / 1L / 0I.** The
  family coherent on every other axis (the subjectDelegate's
  where-scoped queries — subjects are the SetNull FK TARGET, not a
  carrier, so no owned-FK guards apply; Zod at both boundaries
  [boundedTitle + hexColor with the violet default]; the remount-via-key
  dialog contract with the saving busy-guard + the client blank-name
  guard + the server boundedTitle backstop; the labeled-controls a11y
  surface [the per-row Edit/Delete aria-labels, the aria-pressed color
  swatches, the Custom color input's aria-label]; the AlertDialog
  delete-confirm with the SetNull-consequences copy). The findings:
  **H-1** the THREE subjects-family mutations rejected on the refresh
  leg after a COMMITTED write — createSubject/updateSubject the single-
  collection fetchAndSet, deleteSubject the ELEVEN-collection
  SUBJECT_TOUCHED Promise.all (the SetNull FK reconciliation set — the
  WIDEST refresh blast radius in the codebase: ANY one failed GET among
  the eleven rejected the whole delete on a row the server deleted; the
  SubjectDialog's catch toasted "Could not save the subject." with the
  dialog still open and the form armed — the retry duplicated the
  subject; the AlertDialogAction's catch toasted "Could not delete the
  subject." on a deleted row — the CB8 letter's EIGHTH family, the
  first of the eight remaining seams); **L-1** the SubjectsTab loading
  gate carried no aria contract (settings ×1 in the S166 gate census's
  unannounced remainder — the DM2/DL2/DK4/DN2/DP2/DQ2/DR2 precedent
  family; the HolidaysTab twin stays the holidays family's ledger).

The remediation plan written BEFORE any source change
(`docs/remediation-plan-session169.md`, the plan-first doctrine),
validated against the codebase surfaces, then executed TDD-first:

- **DS1 — the subjects-family mutation CB8 split (the H-1 close).** Unit
  RED proven exactly as designed (the resolve set RED ×3 — the trio,
  the delete leg's `mockRejectedValueOnce` rejecting ONE of the eleven
  parallel refresh GETs, sufficient because `Promise.all` rejects on
  its first rejection, exactly the flaky-refresh condition — + the
  failed-write guard green-on-arrival, the pair `3 failed | 1
  passed`); the e2e leg RED-proven against the pre-fix standalone build
  (failing exactly at the designed marker — `getByText("Subject
  created")` never became visible: the POST 201 was witnessed, the
  dialog stayed open, the false "Could not save the subject." fired).
  GREEN = the three contained catches at the seam (the create/update
  pair + ONE catch on deleteSubject's whole Promise.all — the
  multi-collection refresh is one failure domain) + the doctrine
  comment re-tagged for the eighth family. The e2e leg is also the
  FIRST e2e pin to drive the Settings Subjects CRUD surface (the
  recorded settings-CRUD e2e gap, partially closed).
- **DS2 — the SubjectsTab loading gate gains the aria contract (the
  L-1 close).** `role="status"` + `aria-label="Loading subjects"` + the
  S169/DS2 comment. No hue-tokens census re-anchor: the RESIDUALS
  register carries no settings-view line-pinned sites (login-surface
  :28, dashboard-view :210, rum-panel :143 only).

**Gates**: lint ✓ · tsc ✓ · unit **1697/1697** (51 files, +4 exactly
as designed) · build ✓ · the full touched spec file: resilience.spec
green (one P1008 machine-load flake triaged — the AK1b leg failed
under the full-file run's load, GREEN in isolation at 1.2 s) · the
5-chunk cold cert: chunk 1 **156/156** · chunk 2 **197/197** (one
socket-timeout signature logged, zero failures) · chunk 3 **94 passed
+ 1 triaged** (the AK1d files-upload leg failed under the documented
`PrismaClientKnownRequestError: Socket timeout` machine-load
signature; isolate-rerun GREEN at 1.2 s; the chunk then cold-re-run in
full: **95/95**, every leg first-pass on the re-run, the DS1 leg
included) · chunk 4 **95/95** cold · chunk 5 **89/89** cold — the cert
tally **632/632** = **census 2329 green** (the e2e census 631 → 632) ·
the drawer check GREEN on the remediated tree (**the 99th consecutive**
no-Tailwind-v4-mobile-nav-bug confirmation) · the desktop parity probe
**MATCH** (all five formal checks, live reference login).

**Evidence**: `docs/screenshots/169-clone-desktop.png` (not-pure-white
45.87% — byte-identical to the S168 desktop measurement, the
live-clock surface) · `169-clone-mobile-drawer.png` (34.50% —
byte-for-byte the S166/S167/S168 drawer ratio, the unchanged static
surface) · `169-clone-subjects.png` (57.76% — the seeded subject rows
[Mathematics/Physics/Chemistry/History/English/Biology] + the Add
Subject button + the Manage-your-subjects prose, the DS1/DS2
surfaces), captured by `scripts/capture-s169-evidence.mjs`,
self-verifying (ok: true, md5s distinct) + the not-pure-white
pixel-ratio verification.

**Docs lockstep**: README badge/census (2324 → 2329) + the count prose
sites (the tree diagram + the test-command block) + the Session-169
row; AGENTS census (1697 + 632) + the e2e map re-tag + the S169
lessons block (two lessons: a multi-collection refresh is ONE failure
domain — the contained catch rides the whole `Promise.all`, not each
leg; a warm-workspace cycle re-verifies the standing build's freshness
by SOURCE MTIME before using it as the pre-fix RED baseline — RED
proofs need a TRUSTED pre-fix binary, not a fresh one); CLAUDE counts
(1697 + 632); PAD v1.3.77 (the revision block); the SKILL census (all
four sites); the vitest header re-anchor (+4); the cert runner re-tag
(both scripts, 631 → 632, chunk 3 94 → 95, machine-pinned by the
script-conventions tripwire — the CQ6/DA6 count-claims gates verified
GREEN after the re-anchor: 136/136); this log; the worklog Session-180
entry; the plan §8 as-executed close; the `.env.example` contract
re-verified (no env-var reads changed this cycle — .env and
.env.example byte-identical at the documented dev posture); the
cert-s169.log scratch swept before the commit (the tracked artifact is
the launcher script).

Next cycle. The rotation continues — the subjects port closes the
FIRST of the eight remaining CB8 seams. The recorded deferrals: the
remaining seven CB8 seams (the taskList/deck/studyGroup/practiceTest/
grades/focusSessions/holidays families — each gets its own
rotation-axis audit + pin set); the unannounced loading-gate families
(focustimer/gradetracker/dashboard/myday/studygroups/practicetests/
analytics/settings-holidays — the S166 gate census minus the
flashcards ×2 [S167], the tasks ×1 [S168], and the subjects ×1 [this
cycle]); the files refresh-failure toast copy harmonization (the F-8
candidate); the S160 close's ledger (the A-M3 stage-2 triggers; the
update-side raw-SQL bulk upsert; the I-4 parse posture; the M-1
LLM-side residual); the gradetracker/studygroups/settings-CRUD
(edit/delete journeys + holidays) and AlertDialog-confirm e2e gaps.

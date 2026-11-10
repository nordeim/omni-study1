# Session 214 — the S171 cycle (Batch DU)

The workspace was COLD — a fresh `git clone` at `c40ac6c` on `main`
(the S170/Batch DT fix `b982ea8` pushed + remote-verified by the prior
session, the plan-tick `5ecd477`, and the operator's session_213
transcript commit `c40ac6c`). The environment rebuilt from the
documented quickstart: `.env` from `.env.example` (byte-identical at
the documented dev posture `DATABASE_URL="file:../db/custom.db"`,
the repo-root `db/` carrying the freshly pushed + seeded custom.db),
`bun install` (510 packages), the Playwright chromium re-derived at
the locked v1243 pin.

The doc chain re-read (worklog tail, session_212, the S170 plan
§8/§9, session_213 [the operator's raw S170 transcript], the census
sites across README/AGENTS/CLAUDE/PAD/SKILL), then validated against
the codebase: the DT1 catches + the DT2a/DT2b chrome verified at
their source anchors, the doc census chain machine-verified consistent
at 1701 + 634 = 2335.

Cold baseline (before any work): lint ✓ · tsc ✓ · the full Vitest run
**1701/1701 (51 files — the documented S170 final state exactly)** ·
dev-server preflight GREEN · **the drawer check GREEN (the 102nd
consecutive** no-Tailwind-v4-mobile-nav-bug confirmation) · **the
desktop parity probe MATCH** (all four formal checks — navWidth 258 =
258, navLinkCount 20, the first-links sequence, mainX 260). The
mobile nav ADDITIONALLY re-verified through a fresh agent-browser
pass at 390×844 (the operator's standing ask): the drawer opens with
all 20 links in the measured order, a drawer-link navigation lands on
/StudyGroups with the drawer auto-closed, Escape closes (the
superset), the backdrop click at an exposed point (350,400 — clear of
the 288px panel) closes, and the app-bar computes z-40 + border-b +
fixed (the DT2b chrome live). Baseline noise: none. The config
posture re-validated: the `skills/` folder excluded from code
checking, testing, and compilation on every axis (tsconfig excludes,
eslint ignores, the vitest include); the `.env` ≡ `.env.example`
contract re-verified.

**The ledger correction (this cycle's first finding, verified at the
source):** the S170 close's "Next cycle" list names "deck" as the
next CB8 seam — STALE. The deck family (createFlashcardDeck /
updateFlashcardDeck / deleteFlashcardDeck + the card trio) has
carried the DQ1 catches + pair set since S167 (commit `8d25d9a`).
The TRUE remaining pre-CB8 families: studyGroups, practiceTests,
grades, focusSessions, holidays — plus the `createCalculatorEntry`
create-only mutation no ledger ever named (recorded as an
observation). The rotation axis for this cycle: the **studygroups
family**.

The audits (Mode-C; every H/L finding re-verified by direct read):

- **A — the recent-changes axis** (`5ecd477` + `c40ac6c`, both
  docs-only since the S170 fix): **0C / 0H / 0M / 0L / 0I — clean.**
- **B — the studygroups family** (the ledger-corrected next seam):
  **0C / 1H / 0M / 1L / 2I.** The family coherent on every other
  axis (the delegate's owned-Query scoping + the OWNED_FKS.subjectId
  guard, Zod at both boundaries, the factory routes, the CX2 members
  chain). The findings: **H-1** the FOUR family mutations (the
  create/update/delete trio + the members chain entry) rejected on
  the refresh leg after a COMMITTED write — and unlike the S170
  taskLists axis, ALL FOUR have live view consumers (the dialog
  submit catch's false "Could not save the study group." with the
  dialog open — the duplicate-creating retry; the member catches'
  false toasts; the delete catch's false claim). **L-1** the create
  dialog's copy is scaffold-era (git `-S` provenance: `7b1e78d`) and
  the reference has since re-deployed its dialog. **I-1** the
  reference's StudyGroup model carries a DESCRIPTION field the clone
  lacks end-to-end. **I-2** (out of scope) the reference's members
  carry a `role` field + the model carries `meeting_schedule` /
  `chat_messages` — their reference UI is unmeasurable (see below).
- **C — the standing gates**: clean (the §0 record) + the reference's
  StudyGroups surface measured live through the GATED WRITE-PATH
  probe (one throwaway row created → captured → DELETEd → zero
  residue verified): the create dialog reads title "Create Study
  Group", the name placeholder "e.g., Math Study Squad", a
  description textarea "What's this group about?", six swatches
  (the clone's GROUP_COLORS match EXACTLY), and the footer's DOM
  order [Create Group][Close]; the model carries description /
  subject_id / color / members (with role — the auto-added creator
  is admin) / meeting_schedule / chat_messages; **the reference's
  own create→list flow is BROKEN** (the POST commits, the list GET
  returns `[]`, the view keeps "No study groups" — measured twice +
  a full reload) — the clone's working CRUD remains the documented
  superset posture.

The remediation plan written BEFORE any source change
(`docs/remediation-plan-session171.md`, the plan-first doctrine),
validated against the codebase surfaces, then executed TDD-first
(every RED on its designed marker):

- **DU1 — the studygroups family CB8 split (the H-1 close).** The
  four contained catches at the seam: the create/update/delete trio
  + the members chain entry's own refresh (the rejection no longer
  propagates through `await chained`; the failed PATCH still rejects
  honestly). Unit RED `4 failed | 2 passed` (the resolve set ×4 +
  the two failed-write guards green-on-arrival — the chain guard is
  the family's new shape). The e2e leg (resilience, the DS1 idiom)
  RED-proven on the pre-fix build — failing exactly at the
  success-toast assertion (the false "Could not save the study
  group." fired, the dialog stayed open) — GREEN post-fix. The
  submit locator rides the case-INSENSITIVE "Create Group" match so
  the RED landed on the CB8 behavior, not the copy (the DU2 legs
  owned the copy).
- **DU2a — the create-dialog copy catch-up.** The measured title
  "Create Study Group" + the name placeholder "e.g., Math Study
  Squad" + the footer re-ordered to the measured [Create Group][Close]
  (the edit leg keeps its measured-era [Cancel][Save changes] — the
  reference's edit dialog is unmeasurable under its broken list
  flow). The e2e copy pin (parity-session7) RED-proven at the title
  assertion, GREEN post-fix — including the footer DOM-order pin and
  the form-scoped "Close" locator (the clone's shared shadcn X also
  carries the sr-only name "Close" — the documented superset chrome;
  the pin scopes to the form so the X and the footer secondary never
  collide).
- **DU2b — the description port (the deck-description precedent
  mirrored).** `description String @default("")` on StudyGroup ·
  `z.string().max(500).optional().default("")` in studyGroupSchema ·
  the StudyGroupRow type · the dialog's textarea (Label "Description
  (optional)", the measured placeholder — the clone's visible-Label
  superset over the reference's placeholder-only input) · the field
  order following the reference's measured prefix (name → description
  → color; the superset Subject select moved after the swatches) ·
  the payload carrying description on both legs · the detail-pane
  render between the header row and the Members card · the seed's
  Calc Crew enrichment · the import cap registry entry + the census
  key list + the parity-contract map. The e2e round-trip leg
  (create with description through the dialog → the detail pane
  renders it) RED-proven at the textarea absence, GREEN post-fix.
  The unit import-cap legs RED ×2 (the registry key + the
  501-char rejection), GREEN post-fix.

**Gates**: lint ✓ · tsc ✓ · unit **1709/1709** (51 files, +8 exactly:
data-store +6, data-import +2 — the plan's §6 arithmetic said +7, the
DU2b describe carries TWO legs [the cap assertion + the rejection
pair], the correction recorded here per the S170 arithmetic-error
precedent) · build ✓ (the documented "Ecmascript file had an error"
toolchain noise pre-existing) · the touched spec files green in
full-file cold runs (resilience 45/45 — one first-pass AJ1 failure
triaged per the P1008 protocol: the isolate reproduction PASSED
clean (201/200/200, the parent preserved) on a fresh boot and the
cold re-run passed 45/45, the documented S162/S165/S168/S169/S170
files-PATCH-under-load intermittent class, no files-surface code
touched this cycle; parity-session7 62/62) · the 5-chunk cold cert
(the §8 close records the tally) · the drawer check GREEN on the
remediated tree (**the 103rd consecutive**) · the desktop parity
probe **MATCH** · the tripwire 136/136 after the doc-chain lockstep.

**Evidence**: `docs/screenshots/171-clone-desktop.png` (the standing
desktop dashboard) · `171-clone-mobile-drawer.png` (the 103rd
drawer-GREEN companion) · `171-clone-studygroups.png` (the cycle's
surface — the StudyGroups view with the create dialog open, the
measured title + placeholders + description textarea + the
[Create Group][Close] footer), captured by
`scripts/capture-s171-evidence.mjs` self-verifying (ok: true, md5s
distinct) + the not-pure-white pixel-ratio verification.

**Docs lockstep**: README badge/census (2335 → 2346) + the count
prose sites (the tree diagram + the test-command block) + the
Session-171 row; AGENTS census (1709 + 637) + the S171 lessons block
(three lessons: a rotation ledger can go stale — verify the next axis
at the source, the codebase is the ledger of record; a scaffold-era
dialog copy is an unmeasured surface — re-probe the family's
reference surfaces when the cycle lands on them, and the superset
goal cuts both ways; a locator that must match pre-fix AND post-fix
copy rides the case-insensitive default so each RED proof fails at
its own marker); CLAUDE counts (1709 + 637); PAD v1.3.79 (the
revision block); the SKILL census (all four sites — the header line,
the §11 green-state line, the eslint-posture line, the
chromium-spec figure re-derived 629 → 632); the vitest header
re-anchor (+8); the cert runner re-tag (the S171 block + Expected
158 + 199 + 96 + 95 + 89 = 637, machine-pinned by the
script-conventions tripwire — verified GREEN after the re-anchor:
136/136); this log; the worklog Session-182 entry; the plan §8
as-executed close; the `.env.example` contract re-verified (no
env-var reads changed this cycle — .env and .env.example
byte-identical at the documented dev posture).

Next cycle. The rotation continues with the LEDGER-CORRECTED order:
the remaining five CB8 seams (practiceTest / grades / focusSessions /
holidays + the calculatorHistory create-only observation). The other
recorded deferrals: the task-lists e2e leg (when/if a list surface
ships); the unannounced loading-gate families (focustimer/
gradetracker/dashboard/myday/studygroups/practicetests/analytics/
settings-holidays — the S166 gate census minus the closed siblings);
the files refresh-failure toast copy harmonization (the F-8
candidate); the S160 close's ledger; the gradetracker/settings-CRUD
and AlertDialog-confirm e2e gaps; a periodic re-probe of the
reference's chrome AND dialog surfaces (this cycle's dialog catch-up
proves the reference drifts on surfaces beyond chrome — the standing
probes are the tripwire).

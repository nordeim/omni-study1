# Session 212 — the S170 cycle (Batch DT)

The workspace was COLD — a fresh `git clone` at `5d6258f` on `main`
(the S169/Batch DS fix `2ed1512` pushed + remote-verified by the prior
session, the plan-tick `5699d1b`, and the operator's session_211
transcript commit `5d6258f`). The environment rebuilt from the
documented quickstart: `.env` from `.env.example` (byte-identical at
the documented dev posture `DATABASE_URL="file:../db/custom.db"`),
`bun install` (510 packages), the Playwright chromium re-derived at
the locked v1243 pin (the S103/S166 fresh-clone doctrine — the
provisioning failure class never arose), `db:push && db:seed` (the
repo-root `db/custom.db`).

The doc chain re-read (worklog tail, session_210, the S169 plan §8/§9,
session_211 [the operator's raw S169 transcript], the census sites
across README/AGENTS/CLAUDE/PAD/SKILL), then validated against the
codebase: all three DS claims verified at their source anchors (the
three contained catches + the S169/DS1 doctrine comment at
data.ts:609-645, the DS2 aria gate on the SubjectsTab, the DS1 unit
pair set + e2e leg), the doc census chain machine-verified consistent
at 1697 + 632 = 2329. The root scratch sweep: clean.

Cold baseline (before any work): lint ✓ · tsc ✓ · the full Vitest run
**1697/1697 (51 files — the documented S169 final state exactly)** ·
dev-server preflight GREEN · **the drawer check GREEN (the 100th
consecutive** no-Tailwind-v4-mobile-nav-bug confirmation) · **the
desktop parity probe DIVERGENCE on navWidthMatch** — the FIRST
standing-probe divergence since the program's parity gates were
instituted, root-caused this session: the reference reads nav 258px
(x=1, inside an aside that NOW carries border-x + shadow-xl +
shadow-slate-200/50 + z-40 + transition-all duration-300) while the
clone read 260px (unbordered) — a LIVE REFERENCE DEPLOYMENT between
the S169 close and this session (the S169 MATCH is incompatible with
the bordered form: the inner nav of a bordered 260px aside reads
258). The divergence pass doubled as a chrome-family census and
surfaced the mobile app-bar's LONGSTANDING miss (the reference's z-40
+ shadow-sm + border-b, documented in the mobile-navigation spec's
own initial-era comment but never pinned — the clone shipped z-30
bare since the scaffold). Baseline noise: none. The config posture
re-validated for the operator's standing ask (the `skills/` folder
excluded from code checking, testing, and compilation on every axis).

The audits (Mode-C; every H/L finding re-verified by direct read):

- **A — the Batch DS recent-changes axis** (`2ed1512` fix +
  `5699d1b`/`5d6258f` docs-only): **0C / 0H / 0M / 0L / 0I —
  clean.**
- **B — the task lists family** (the rotation's fresh axis, the SECOND
  of the eight remaining CB8 seams the S168 close's ledger names —
  taskList first in the recorded order of the remaining seven): **0C /
  1H / 0M / 0L / 0I.** The family coherent on every other axis (the
  taskListDelegate's where-scoped queries — task lists carry no owned
  FKs, they are the SetNull TARGET for Task.listId, not a carrier; Zod
  at both boundaries [boundedTitle name]; the factory routes over
  /api/task-lists + /api/task-lists/[id]; the read-only aside
  consumer). The finding: **H-1** the THREE task-list mutations
  rejected on the refresh leg after a COMMITTED write —
  createTaskList/updateTaskList the single-collection
  fetchAndSet("taskLists"), deleteTaskList the TWO-collection
  Promise.all([taskLists, tasks]) — the Task.listId SetNull
  reconciliation set (EITHER failed GET rejected the whole delete on
  a row the server deleted) — the CB8 letter's NINTH family, with NO
  view consumer today (the tasks-view aside is read-only; the
  TaskDialog carries no list picker — verified against the LIVE
  reference: their dialog fields are Title/My Day/Important/Due
  date/Priority/Repeat/Subtasks/Notes, and their Tasks aside carries
  no create-list affordance), so the pinned surface is the mutation
  CONTRACT itself.
- **C — the standing gates**: the parity DIVERGENCE root-caused (the
  computed styles captured live by the s170 probe scripts —
  probe-sidebar-geometry/probe-sidebar-styles/probe-ref-shell/
  probe-ref-collapse/probe-ref-tasks/probe-ref-dialog); the reference
  collapse behavior UNCHANGED (260 ↔ 80, mainX follows — their chevron
  lost its accessible name, an a11y regression on their side; the
  clone's aria-label stays, the documented superset); the reference's
  dashboard structure UNCHANGED (4 KPI stat cards, the same labels and
  grids — the probe's statCards 6-vs-4 read a cross-grid count, not
  drift).

The remediation plan written BEFORE any source change
(`docs/remediation-plan-session170.md`, the plan-first doctrine),
validated against the codebase surfaces, then executed TDD-first:

- **DT1 — the task-lists-family mutation CB8 split (the H-1 close).**
  Unit RED proven exactly as designed (the resolve set RED ×3 — the
  trio, the delete leg's `mockRejectedValueOnce` rejecting ONE of the
  two parallel refresh GETs, sufficient because `Promise.all` rejects
  on its first rejection, exactly the flaky-refresh condition — + the
  failed-write guard green-on-arrival, the pair `3 failed | 1
  passed`). NO e2e leg — the family has no view consumer (the
  adjudicated deferral: inventing a list-CRUD UI beyond the
  reference's own surface is out of scope for a CB8 seam cycle; the
  e2e leg arrives when/if a list surface ships). GREEN = the three
  contained catches at the seam (the create/update pair + ONE catch
  on deleteTaskList's whole Promise.all — the S169
  multi-collection-is-one-failure-domain lesson) + the doctrine
  comment re-tagged for the ninth family.
- **DT2a — the desktop sidebar chrome catch-up (the parity
  DIVERGENCE close).** The reference's post-S169 deployment, measured
  live and pinned: the aside gains `border-x` (the glass
  border-color, rgba(255,255,255,0.5) light / slate-700/50 dark) +
  `shadow-xl shadow-slate-200/50` + `z-40` + `transition-all
  duration-300`. The border-box width contract holds (w-[260px]/w-20
  + border-x still computes 260/80 total — the navigation +
  s52-collapse pins hold; the main offset is unchanged). The e2e leg
  (navigation.spec, the computed-style ground-truth idiom) RED-proven
  against the pre-fix standalone build — failing exactly at the
  border-left-width assertion — then GREEN post-fix. The first GREEN
  run tripped the oklab shadow serialization (the v4
  color-mix(in oklab) rides the SAME hex-pinned slate-200 step and
  serializes `oklab(0.9287… / 0.5)` while the reference's v3-era vars
  serialize `rgba(226, 232, 240, 0.5)` — the rendered colors are
  equivalent): the pin now asserts the GEOMETRY (`0px 20px 25px
  -5px`, `0px 8px 10px -6px`) + the 0.5 alpha and accepts either
  serialization — the drawer-check trap-7 precedent extended from
  backdrops to shadows.
- **DT2b — the mobile app-bar chrome catch-up.** The reference's
  measured classes: `border-b` + `shadow-sm` + `z-40` (the
  longstanding miss — the mobile-navigation spec's initial-era
  comment documented them; the clone shipped z-30 bare since the
  scaffold). The e2e leg (mobile-navigation.spec) RED-proven against
  the pre-fix build, GREEN post-fix. Stacking safety verified: the
  drawer backdrop/dialog (z-50), the connectivity pill (z-[70]), and
  the Radix overlays stay above z-40; the aside renders at lg+ only
  and the app-bar below lg only.

**Gates**: lint ✓ · tsc ✓ · unit **1701/1701** (51 files, +4 exactly
as designed: data-store +4) · build ✓ (the known "Ecmascript file
had an error" toolchain noise pre-existing) · the touched spec files
green (navigation 67/67 + mobile-navigation 21/21, full-file runs) ·
the 5-chunk cold cert — the chunk tally recorded in the plan's §8
close (chunk 1 158/158 first-pass, both DT2 legs included) · the
drawer check GREEN on the remediated tree (**the 101st consecutive**
no-Tailwind-v4-mobile-nav-bug confirmation) · the desktop parity
probe **MATCH** (all four formal checks — navWidth 258 = 258, the
bordered content box on BOTH hosts; nav-link count 20; the
first-links sequence; mainX 260 — live reference login) with the
probe itself HARDENED: the login page's own `<main>` false-positived
the old wait and the fixed 1.5s settle raced the reference's slow
mounts under load (the probe read all-nulls and reported DIVERGENCE
on a healthy app); the hardening waits for the POST-LOGIN chrome
(nav + main together) with a bounded re-read retry — the standing
gate no longer flakes on reference latency.

**Evidence**: `docs/screenshots/170-clone-desktop.png` (the standing
desktop dashboard — now carrying the DT2a chrome) ·
`170-clone-mobile-drawer.png` (the 101st drawer-GREEN companion; the
DT2b app-bar above it) · `170-clone-sidebar.png` (the cycle's surface
— the desktop sidebar close-up, the DT2a border-x + xl-shadow
chrome), captured by `scripts/capture-s170-evidence.mjs`
self-verifying (ok: true, md5s distinct) + the not-pure-white
pixel-ratio verification.

**Docs lockstep**: README badge/census (2329 → 2335) + the count
prose sites (the tree diagram + the test-command block) + the
Session-170 row; AGENTS census (1701 + 634) + the S170 lessons block
(three lessons: a standing-probe divergence on a clean tree is a
reference-side finding — probe the reference at the source and sweep
the whole chrome family while in there; a gate script must wait for
the POST-LOGIN chrome, never any `<main>` — a settle constant is a
race against every slower environment; v4 alpha shadows serialize
oklab even on hex-pinned steps — pin the geometry + the alpha,
accept either color form); CLAUDE counts (1701 + 634); PAD v1.3.78
(the revision block); the SKILL census (all four sites — the
chromium-spec figure re-derived 624 → 629, a pre-existing small
drift the re-anchor caught); the vitest header re-anchor (+4); the
cert runner re-tag (both scripts, 632 → 634, chunk 1 156 → 158,
machine-pinned by the script-conventions tripwire — the CQ6/DA6
count-claims gates verified GREEN after the re-anchor: 136/136);
this log; the worklog Session-181 entry; the plan §8 as-executed
close; the `.env.example` contract re-verified (no env-var reads
changed this cycle — .env and .env.example byte-identical at the
documented dev posture); the cert-s170.log scratch swept before the
commit (the tracked artifact is the launcher script).

Next cycle. The rotation continues — the task-lists port closes the
SECOND of the eight remaining CB8 seams. The recorded deferrals: the
remaining six CB8 seams (the deck/studyGroup/practiceTest/grades/
focusSessions/holidays families — each gets its own rotation-axis
audit + pin set; deck is next in the recorded order); the task-lists
e2e leg (arrives when/if a list surface ships — the reference carries
no list-CRUD UI today); the unannounced loading-gate families
(focustimer/gradetracker/dashboard/myday/studygroups/practicetests/
analytics/settings-holidays — the S166 gate census minus the
flashcards ×2 [S167], the tasks ×1 [S168], and the subjects ×1
[S169]); the files refresh-failure toast copy harmonization (the F-8
candidate); the S160 close's ledger (the A-M3 stage-2 triggers; the
update-side raw-SQL bulk upsert; the I-4 parse posture; the M-1
LLM-side residual); the gradetracker/studygroups/settings-CRUD
(edit/delete journeys + holidays) and AlertDialog-confirm e2e gaps; a
periodic re-probe of the reference's chrome (the live deployment this
cycle caught proves the reference drifts — the standing probes are
the tripwire).

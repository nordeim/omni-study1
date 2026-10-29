# Session 110 — Batch BK (Cycle 60) — the register rotation + the s110 MOBILE-PORTRAIT LIGHT evidence-frame rotation

**Scope**: the standing audit-rider cycle at the plateau. Received state `9254575`
(Batch BJ `c85f27c` + the operator's session-log commit adding
`docs/session_88.md` — the S109 raw transcript, audited clean: one file, 111
insertions, no source changes, no key material). The 34th workspace
continuation — the first IN-FLIGHT continuation (the S110 lesson-4): the
session arrived to an interrupted predecessor, not a wiped workspace (the
riders GREEN but uncommitted, the Cycle-60 plan written into the remediation
plan but the execution record missing, the standing suite reaped mid-run
between tool calls by the workspace's between-call process reaper).

## The in-flight recovery protocol (run BEFORE any mutating step)

- `git status` — the modified `docs/remediation-plan.md` + the 20 untracked
  `110-*.png` frames + the two untracked riders
  (`scripts/ref-resweep-s110.mjs` + `scripts/capture-s110-evidence.mjs`) = the
  exact interruption point.
- The plan's BK1–BK4 rider list = the remaining-work ledger (BK1 done — the
  register note visible in the plan; BK2 done — the riders GREEN first-pass;
  BK3 the acknowledgment; BK4 reserved for the final re-cert).
- The DB quiescence state verified live through Prisma BEFORE any mutating
  step: Task 12 / Note 4 / Event 3, demo light/violet, zero stranded probe
  rows — the S110 lesson-2 coordination signal.
- The already-verified work HONORED, not re-verified from scratch: the
  baseline cold re-cert **474/474**, the final-tree re-cert **474/474**, lint ✓
  tsc ✓ unit **936/936**, the canonical build green, the riders' GREEN
  first-pass — all completed by the interrupted session. Only the interrupted
  steps re-run: the s110 resweep on the final tree, the standing suite, the
  docs chain, the register arithmetic.

## Baseline (cold, before any change — the interrupted session's layer, honored)

lint ✓ `tsc --noEmit` ✓ unit **936/936** (28 files); the canonical build
green; the full cold 5-chunk e2e cert **474/474** (131+141+57+87+58 — every
chunk first-pass, zero flakes).

## The Mode-C audit of Batch BJ (diff `2507b30..c85f27c` + the operator's `9254575`)

**0C / 0H / 0M / 0L / 1I** — all BJ claims verified TRUE:

- the BJ diff 30 files / 1004 insertions, ZERO src/ and tests/ changes, zero
  key-material insertions;
- the committed rotation-frame md5s re-hashed from the committed blobs
  matching the record verbatim (874522bbc9be12a3e3e5762ea89a2ec0 /
  250b87636715d66ccd2200c2e22f9bdb);
- the 20 committed 109-*.png frames md5-distinct (0 duplicate hashes);
- the operator commit clean (docs/session_88.md only, 111 insertions — the
  S109 raw transcript);
- the docs chain aligned (README badge 1410 + the Session-109 row, AGENTS/
  CLAUDE 936 + the S109 lessons ×4 + the Unit-line seam tail S109/BJ, the
  vitest header S109/BJ, PAD v1.3.17, the remediation-plan header properly
  re-anchored to Batch BJ — the S108 lesson-4 held: NO L-class finding).

**The I1 finding that sized the cycle**: the BJ1 note's counts (233/114)
describe the pre-s109-rider tree — the post-BJ final-tree re-derivation (the
pin's own regex, instrument-identical, the expectation stated BEFORE the
measurement) is **235 playwright importers / 116 Usage-line carriers / 0
stale / 119 usage-line-free** — the doctrine's own predicted drift, arrived
on schedule (ninth consecutive cycle).

## The live parity re-verification (agent-browser on BOTH hosts)

No NEW parity gap — the plateau re-confirmed live: the reference re-probed at
1280×800 and 390×844 (the 20 nav links, the login → dashboard journey, the
reference's own /Notes overflow defect [scrollWidth 416 at mobile] which the
clone does NOT reproduce [390]); the reference's `sidebarOpen` storage key
read-then-restored; the reference's Dark option re-confirmed a platform
no-op (the Light click updates the selected border only — the `.dark` class
and the body bg never move; documented since session-10); the clone's 20
view scrollWidths all 1280/390 (zero overflow); the clone's Analytics
stat/icon geometry byte-matched against the live reference (the
violet/blue/green/orange icon tints rgb(237,233,254)/rgb(219,234,254)/
rgb(220,252,231)/rgb(255,237,213) measured IDENTICAL on both hosts); the VLM
cross-comparison (glm-5v) of the full-page Analytics frames re-deriving the
documented deviations (the subtitle, the stat-card anatomy, the seeded-data
charts — the functional SUPERSET the README documents: "where the reference
shows empty states, StudyFlow ships working features").

## The rotation survey (BEFORE any rotation — the coverage ledger)

The rotation program's 20 committed frames: 1280×800 desktop ×10 dark + ×2
light (s109 — Events + Analytics, the theme axis OPENED at the home band),
390×844 mobile-portrait ×4 dark, 844×390 mobile-landscape ×2 dark, 768×1024
mid-band ×2 dark. **The theme axis's REMAINING never-varied cells:
mobile-portrait×light, mobile-landscape×light, mid-band×light.** The
view-level gaps across the entire 20-frame lineage: Settings, Files — zero
rotation frames. The s110 rotation: **the MOBILE-PORTRAIT LIGHT cell** (the
theme axis × the viewport axis's most-used mobile band) with the two
view-level gap candidates at 390×844 in LIGHT: **Settings** + **Files**.

## Execution

- **BK1 — DONE.** The dated S110 register note appended to the BJ1 execution
  record (the quote block visible there): the post-BJ final-tree counts
  235/116/0-stale/119, the growth mechanism (the two s109 riders), the
  register-rotates-forward doctrine restated, the scoped expectation for the
  next audit ("this register's 235/116 + this cycle's named riders").

- **BK2a — DONE.** `scripts/ref-resweep-s110.mjs`: the 7-location re-tag from
  s109 (provenance, usage, probe email `s110-resweep-`, probe name "S110
  Probe", the three capture path prefixes), the re-tag exactness verified by
  the normalization diff — EMPTY under the full token set (all generation
  tokens s100–s119 / S100–S119 + the capture-path dash tokens, the filename
  tokens included) — BEFORE the live run, re-verified live by this
  continuation; live: **ok:true, exit 0** (the invariants green both hosts,
  the brand tables byte-matched, probeCleanup ok, 18 captures; zero stranded
  probe rows); re-run on the FINAL tree by this continuation: **exit 0
  again** — the gate: 0 ONLY on ok AND probeCleanup ok, 53s, the 18 captures
  freshly rewritten, the DB quiescence re-verified through Prisma post-run.

- **BK2b — DONE (GREEN FIRST-PASS, the zero-iteration cycle).** The capture
  ran GREEN first-pass with exit 0 (the interrupted session's run), then
  re-run on the FINAL tree by this continuation — exit 0 again (the BJ
  precedent: the committed artifacts are the final-tree re-run's PNGs; the
  cross-run md5 variance is the live clock's own signature, the S109
  lesson-4):
  - **Frame 1 — the SETTINGS view at 390×844 in LIGHT**: the view's FIRST
    rotation frame; the Appearance tab's measured chrome (the S69/S4-pinned
    surfaces): the ONE max-w-4xl bg-card card ("Appearance" + "Customize how
    StudyFlow looks"), the three h-[88px] theme buttons with the selected
    LIGHT button's violet border rgb(139, 92, 246) through the --sf-primary
    token, the 7 accent swatches (the 48px size-12, the Violet one
    aria-pressed=true), the emoji avatar tile grid, the Save Preferences
    gradient CTA — deterministic from the seed, ZERO interaction; the mobile
    no-overflow contract scrollWidth <= 390; md5 `7506871ac19c0860a25b4b1da175b41d`;
    pixel-probe mean brightness 240.4 (genuinely light).
  - **Frame 2 — the FILES view at 390×844 in LIGHT**: the view's FIRST
    rotation frame; the mobile stacked layout (the md:flex aside renders at
    390 as the stacked list pane), the S5-K-pinned chrome (the "All Files"
    breadcrumb at its <=24px measured height, the View mode bordered strip at
    rounded-lg 8px with the Grid view aria-pressed, the icon-only Add link),
    and — the S110 lesson-3 correction — the **S17-pinned zero-data
    EmptyState the SEED produces** (the seed creates no folders/files: the
    "No files yet" card + "Upload your first file to get started" + the
    gradient "Upload a file" CTA), the plan's "the seeded rows" paraphrase
    corrected by the rider's own gate (the plan is the immutable pre-change
    record; the execution record carries the truth); the mobile no-overflow
    contract scrollWidth <= 390; md5 `9a469ef03b7243fd3945b75008674baa`; pixel-probe mean
    brightness 248.2 (genuinely light).
  - Both frames md5-DISTINCT GATE-enforced (each run); the 20 committed
    110-*.png frames md5-distinct (0 duplicate hashes); the S4 violet/light
    restore awaited on every path (verified through Prisma post-run).

- **BK3 — DONE.** The honest-zero-cycle acknowledgment: no guard gap found in
  the pre-change audit (the 0L verdict); the census projections 936/474
  unchanged EXACT BY CONSTRUCTION. No manufactured headline — the verified
  plateau IS the deliverable (the S100 lesson-2 doctrine).

- **BK4 — DONE (the reserved rider — EXERCISED: the standing suite's first
  NOT-GREEN verdict, root-caused, fixed, re-certified).** The standing suite
  run #1 (the double-forked daemon, the S110 lesson-1 remedy) completed
  **33/35** — ai-error + ai-a11y FAIL ("stage exited 1", both envelopes
  empty: the stages crashed at connect), every other stage GREEN including
  the theme-restore closing guard (demo light/violet, the seed counts exact —
  zero DB damage). Root cause (the probe chain: the suite table, the empty
  envelopes, `ss` — :3000 listenerless while the next-server process lived,
  dev.log's "⨯ Another next dev server is already running", the
  `.next/dev/lock` naming the live pid): the S106/BG4 stop path verified the
  LISTENER, not the PROCESS — the next-server's SIGTERM graceful shutdown
  closed the listener (health false — the old code returned "stopped" right
  there) while the process lived on (sleeping, the turbopack pool child
  holding the shutdown open), so the dev lock kept naming a LIVE pid and
  the restarted `next dev` REFUSED to boot, leaving :3000 dead for the
  :3000-targeted stages. The fix (`scripts/standing-suite.mjs` — the guard's
  own file, scripts-only, the census projections 936/474 UNCHANGED by
  construction, the register untouched — the suite imports no playwright):
  the PROCESS-gone verification (`kill(pid, 0)` → ESRCH) after the listener
  polls, the SIGKILL escalation now reached whenever the process outlives
  its listener, and the zombie fallback (SIGKILL the pid's own parent chain
  so init reaps — `kill(pid, 0)` succeeds on an unreaped zombie too); the
  AP-70 discipline preserved (only the listener's own tree, never a blanket
  pkill). Verified empirically BEFORE the patch: the SIGKILLed tree
  collapsed (the whole dev tree gone, :3000 free), the stale lock naming
  the DEAD pid did NOT block the fresh boot (the new server rewrote the
  lock — the fix's premise proven live), the healed :3000 healthy. The
  re-cert: suite run #2 (the fresh single run on the final tree, the
  double-forked daemon) — **35/35 GREEN** with the FIXED guard
  live-exercised at the cwv-volume-stress stage (the stop → the
  process-gone verification → the restart healthy → ai-error/ai-a11y
  GREEN). Syntax ✓ lint ✓ the script-conventions census 3/3 after the
  patch.

## The workspace's between-call process reaper + the double-fork remedy (the S110 lesson-1)

The standing suite (60–120 min, per-stage budgets to 25 min) cannot fit any
single foreground call (the 10-min ceiling), and this workspace REAPS
background processes between tool calls — the interrupted session's suite
run was itself a victim. Verified live by racing three daemonization
strategies (setsid / nohup / the python double-fork): only the double-fork
orphan (PPID 1) survived the call boundary; the survivors' PPID=1 signature
is the diagnostic (the Oct-28 dev servers carry it). The remedy deployed:
the python double-fork launcher (fork → setsid → fork → exec) with stdio to
a log — BOTH suite runs (the BK4 defect discovery run #1 and the
re-certification run #2) ran to completion as orphaned daemons, polled
across calls through the log + the per-stage envelopes; the mutating riders
held back until each run's closing guard restored the quiescence state (the
S110 lesson-2 exclusion window: the suite's accent sweeps PATCH the demo
user through all seven accents and its volume stages insert/delete rows in
the shared custom.db — a capture rider launched mid-suite would fail its
violet gate through no fault of its own).

## Mobile-nav verification (agent-browser, BOTH hosts — the standing requirement)

- **Reference** (`sidebarOpen` read-then-restored, "true" = expanded): 24
  labeled visible links with the drawer open (20 nav + 4 page-behind); the
  drawer navigates to /Notes and auto-closes; the drawer's own X at (228,26)
  closes; the desktop rail collapsed at 80px with 20 icon-only links and ZERO
  title/aria (the reference's own a11y defect); scrollWidth 416 on /Notes (the
  reference's own overflow defect); the hamburger carries no aria-label.
- **Clone** (`sf-sidebar-collapsed` read-and-removed, null default): 26
  labeled visible links (the superset skip-link); the drawer dialog MOUNTS
  (`role="dialog"`, `aria-label="Navigation menu"` — the superset pattern);
  the drawer navigates to /Notes and auto-closes (the dialog UNMOUNTS); a
  REAL Escape keypress closes; the desktop rail collapsed at 80px with ALL 20
  icon-only links carrying title AND aria-label (the superset a11y);
  scrollWidth 390; the hamburger aria-labeled "Open navigation menu".

**No Tailwind v4 mobile-nav bug — s110 re-confirmed** (reference scrollWidth
416 vs clone 390; the clone's superset dialog semantics + a11y intact).

## Re-certification (all on the FINAL tree)

- lint ✓ `tsc --noEmit` ✓ unit **936/936** (28 files — the census projection
  exact; re-run after the riders AND the docs landed, the threshold-form pins
  absorbing the two new riders by design)
- the canonical build green (the standalone asset contract intact)
- cold 5-chunk e2e re-cert: **474/474** (131+141+57+87+58, every chunk
  first-pass, zero flakes)
- the s110 resweep on the final tree: exit 0 (the gate: 0 ONLY on ok AND
  probeCleanup ok — 18 captures, the DB quiescence re-verified through
  Prisma post-run)
- the standing suite (33 stages + verdict = 35 checks): **35/35 GREEN**
  (run #2, the fresh single run on the final tree — run #1's 33/35 was the
  BK4 defect discovery, root-caused + fixed + re-certified; the
  cwv-volume-stress stage GREEN with 0 budget breaches [7 volume-affected
  views × 5 field metrics at 390×844 under the Lighthouse throttle against
  the :3200 standalone; volume 300/200/250; MODE light; INP proxy
  Dashboard→Tasks 1246ms — GREEN at the unchanged 2400 pin; the FIXED
  S106/BG4+S110/BK4 co-residency guard fired live in the suite's own run:
  "dev server (pid 7468) stopped for the cwv-volume-stress stage" — the
  process-gone verification held, the restart returned healthy,
  ai-error/ai-a11y GREEN]; the theme-restore closing guard GREEN [demo
  light/violet verified through Prisma post-suite; the volume MARKER rows
  deleted by the stage's own finally — Task 12 / Note 4 / Event 3, the seed
  counts exact, zero stranded probe rows])
- the register arithmetic on the final tree, measured LAST through an
  instrument that is itself not a rider: **237 playwright importers / 118
  Usage-line carriers / 0 stale / 119 usage-line-free = 235/116 + the two
  s110 riders** (the scoped expectation for the next audit)
- `.env.example` verified current (the env surface enumerated live: NODE_ENV /
  DATABASE_URL / AUTH_SECRET / NEXT_PUBLIC_SITE_URL — NODE_ENV runtime-managed
  by the scripts, the cwv/preflight/capture script knobs runtime-local)

## The standing suite verdict — the two-run record (the BK4 story)

**Run #1: 33/35 NOT GREEN** (the BK4 defect discovery — the suite's first
NOT-GREEN verdict in the lineage): 31 stages + the theme-restore closing
guard GREEN; ai-error + ai-a11y FAIL ("stage exited 1", both envelopes
empty — the stages crashed at connect on the dead :3000). The BG4
co-residency guard fired live ("dev server (pid 14626) stopped for the
cwv-volume-stress stage") but the restart FAILED silently: the next-server
survived its SIGTERM (sleeping, listener closed), the dev lock named the
live pid, and the spawned `next dev` refused to boot ("⨯ Another next dev
server is already running" — the dev.log evidence). Root-caused, fixed
(the process-gone verification + the SIGKILL escalation + the zombie
parent-chain fallback in the guard's own file, scripts-only), the
environment healed (the SIGKILLed tree collapsed; the stale lock naming a
DEAD pid did NOT block the fresh boot — the fix's premise proven live),
and the suite re-run as a fresh single run on the final tree.

**Run #2: **35/35 GREEN** (`bun scripts/standing-suite.mjs` run #2, the fresh single run on the
final tree with the FIXED guard, the suite's own summary "35/35 green", aborted: false,
the failed list empty) — all 33 stages + the verdict green, zero findings in every stage:
the preflight (navigations 1, hydrated true);
security/settings-roundtrip/connectivity/upload-edge/data-volume (0 findings each); the
forced-colors/print/focus-order/mobile/midband/landscape/dark-mobile sweeps (0 findings);
the accent families (7 accents × 140 view renderings per band, 0 findings); the volume ×
theme × viewport cross-axis (0 findings); the cwv stage GREEN with 0 clone metric findings
(the reference's own POOR scenario informational, not a clone finding); **the
cwv-volume-stress stage GREEN with 0 budget breaches** (7 volume-affected views × 5 field
metrics at 390×844 under the Lighthouse throttle against the :3200 standalone; volume
300/200/250; MODE light; INP proxy Dashboard→Tasks **1246ms** — GREEN at the unchanged
2400 pin; **the FIXED S106/BG4+S110/BK4 co-residency guard fired live in the suite's own
run: "dev server (pid 7468) stopped for the cwv-volume-stress stage"** — the
process-gone verification held: the old dev tree FULLY dead mid-stage (`ss` showed ZERO
dev processes and :3000 free — the run-#1 failure mode eliminated), the restart's
transient warning — "dev server did NOT return healthy on :3000" — resolved by the
stages that follow: ai-error **GREEN** (0 findings; 10 nonGaps — the run-#1 victim,
now green through the fixed guard's own live exercise), ai-a11y GREEN, pre15-preflight
GREEN (deps pinned by design, client bundle lean, outdatedCount 0), dep-audit GREEN (3
advisories documented as non-production, 0 runtime-reachable) and the :3000 listener
verified healthy post-suite); the theme-restore closing guard GREEN (demo light/violet
verified through Prisma post-suite; the volume MARKER rows deleted by the stage's own
finally — Task 12 / Note 4 / Event 3, the seed counts exact, zero stranded probe rows).**

## Documentation chain

- README.md: the Session-110 row (badge `tests-1410 green` unchanged: 936 +
  474)
- AGENTS.md: the S110 lessons ×4 (the double-fork reaper doctrine; the
  concurrent-rider exclusion window; the plan-vs-record truth doctrine; the
  in-flight continuation protocol)
- CLAUDE.md: the Unit-line seam tail re-anchored S110/BK
- vitest.config.ts: the header re-anchored S110/BK (28 files / 936)
- Project_Architecture_Document.md: v1.3.18 (the Cycle-60 revision block)
- docs/remediation-plan.md: the Cycle-60 plan + this execution record + the
  header re-anchor (BJ → BK)
- worklog.md: the Session-110 entry
- docs/session_89.md: this session record

**DONE** — Batch BK closed. Baselines unchanged: unit **936/936**, e2e
**474/474**, the standing suite per the verdict above. Standing debt after
BK: **ZERO**.

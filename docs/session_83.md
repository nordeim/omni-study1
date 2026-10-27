# Session 107 — Batch BH (Cycle 57) — the register rotation + the s107 LANDSCAPE evidence-frame rotation

**Scope**: the standing audit-rider cycle at the plateau. Received state `78426f4`
(Batch BG `51b0f0f` + the operator's session-log commit adding `docs/session_82.md` —
the S106 raw transcript). The 31st workspace continuation — exercised as the full
RESET CONTINGENCY twice in-session: the workspace was wiped mid-suite (standing suite
mid-run, all uncommitted BH riders lost) and, both times, the ENTIRE cycle was honestly
re-executed on a fresh clone at `78426f4` (runtime restored from zero: bun install,
chromium-1243, `.env` with `DATABASE_URL="file:../db/custom.db"`, db seeded, demo
violet/light verified directly through SQLite; baseline re-certified cold BEFORE any
work; every rider re-run live; every md5 re-measured; every doc claim re-derived
against the fresh tree — no claim carried over unverified from a wiped workspace).

## Baseline (cold, before any change)

- lint ✓ `tsc --noEmit` ✓ unit **936/936** (28 files)
- canonical build green (the standalone asset contract intact)
- cold 5-chunk e2e certification: **474/474** (131+141+57+87+58, every chunk
  first-pass, zero flakes) — `scripts/e2e-chunked-cert.sh`, the S32 daemon recipe

## The Mode-C audit of Batch BG (diff `51b0f0f..78426f4` + the operator's `78426f4`)

**0C / 0H / 0M / 0L / 1I** — all BG claims verified TRUE:

- BG1 register note read in full (227/108/0-stale/119 + the growth mechanism + the
  register-rotates-forward doctrine + the exact-count pin staying rejected)
- BG2a resweep's 7-location re-tag diff vs s105 EXACT — the normalization diff EMPTY
  under the full token set [s106/S106/s105/S105/s104/S104 + 106-/105-/104-]
- BG2b capture's committed rotation-frame md5s matching the record verbatim
  (4dfde092fa6e8e51adebaf6fb4bb237a / 02637cbbb248871fbc50c5a73010e190 — the
  mobile-dark Flashcards + Notes frames)
- the 20 committed 106-*.png frames md5-distinct (0 duplicate hashes)
- BG4 measurement-context fix read in full (the S51_BUDGETS pin stays 2400 with the
  BG4 context note; the suite runner stops :3000 for the cwv-volume-stress stage; the
  boundary pins 2400/2401 unchanged)
- operator commit clean (docs/session_82.md only, 172 insertions, zero key material)
- src/ untouched by BG (`git diff --stat`: zero src/ files)
- docs chain aligned (README badge 1410 + the Session-106 row, AGENTS/CLAUDE 936, the
  vitest header S106/BG, PAD v1.3.14)

**The I1 finding that sized the cycle**: the BG1 note's counts (227/108) describe the
pre-BG-rider tree — the post-BG final-tree re-derivation (the pin's own regex,
instrument-identical, the expectation stated BEFORE the measurement per the S102
lesson-1 doctrine: "the register's 227/108 + the two named s106 riders") is
**229 playwright importers / 110 Usage-line carriers / 0 stale / 119 usage-line-free**
— the doctrine's own predicted drift, arrived on schedule (sixth consecutive cycle);
the close is the register rotation (a dated S107 note appended to the BG1 execution
record), not a pin change.

## The rotation survey (BEFORE any rotation — the coverage ledger)

The rotation program's committed frames by viewport cell:

| Cell | Frames | Era |
|------|--------|-----|
| 1280×800 desktop dark | 10 | s96–s104 |
| 390×844 mobile-portrait dark | 4 | s105–s106 |
| **844×390 landscape** | **0 — NEVER varied** | — |
| 768×1024 mid-band | 0 | — |
| mobile light | 0 | — |

**844×390 LANDSCAPE is the viewport axis's last never-varied band** (the S105
lesson-1: an axis never varied is an axis never verified — the S105 precedent opened
mobile, s107 opens landscape). Tasks additionally carried ZERO rotation frames across
the entire 14-frame lineage (the view-level coverage gap).

## The Cycle-57 plan (written into docs/remediation-plan.md BEFORE any source change)

- **BH1** — the S107 register note (the audit's I1)
- **BH2** — the s107 riders: `scripts/ref-resweep-s107.mjs` (the 7-location re-tag
  sweep from s106) + `scripts/capture-s107-evidence.mjs` (the LANDSCAPE rotation)
- **BH3** — the honest-zero-cycle acknowledgment (census projections 936/474
  unchanged EXACT BY CONSTRUCTION — documentation + scripts only, src/ and tests/
  untouched)
- **BH4** — the reserved re-cert rider

## Execution

- **BH1 — DONE.** The dated S107 register note appended to the BG1 execution record
  (the quote block visible there): the post-BG final-tree counts 229/110/0-stale/119,
  the growth mechanism (the two s106 riders), the register-rotates-forward doctrine
  restated, the scoped expectation for the next audit ("this register's 229/110 +
  this cycle's named riders").

- **BH2a — DONE.** `scripts/ref-resweep-s107.mjs`: the 7-location re-tag from s106
  (provenance, usage, probe email `s107-resweep-`, probe name "S107 Probe", the three
  capture path prefixes), syntax-checked, the re-tag exactness verified by the
  normalization diff — EMPTY under the full token set [s107/S107/s106/S106/s105/S105 +
  107-/106-/105-] — BEFORE the live run; live: **ok:true, exit 0** (the invariants
  green both hosts, the brand tables byte-matched, probeCleanup ok, 18 captures; zero
  stranded s107-resweep probe rows verified independently through SQLite).

- **BH2b — DONE (after one live gate iteration, root-caused and fixed).** The first
  capture run timed out at the Frame-1 gate; the diagnostic probe isolated the root
  cause — **the SHARED-SELECTOR trap** (the S107 lesson-2): the desktop sidebar's nav
  and the mobile drawer's nav BOTH carry `aria-label="Primary"` with the same class
  string, the desktop renders FIRST in DOM order, and at 844 it is `hidden lg:flex`
  (display:none → scrollHeight 0 / clientHeight 0) — the unscoped selector read the
  hidden element while every drawer condition was TRUE. Fixed by DIALOG-SCOPING the
  query (`div[role="dialog"] nav[aria-label="Primary"]`); the Tasks gate's h1
  corrected to the ACTIVE-LIST label ("All Tasks" — the view's own h1 renders the
  active list's name, never the route name — the S107 lesson-3). Re-run GREEN
  first-pass, exit 0:
  - **Frame 1 — the DRAWER NAV-SCROLL at 844×390 in DARK**: the below-1024 chrome
    renders at 844 BY CONSTRUCTION; the slide-in drawer (w-72 panel, the 89px S3-L
    brand header with the border-b divider, "StudyFlow" + "Your study companion",
    the X + backdrop close contract) with its nav list **scrollHeight 992 >
    clientHeight 301** and 20 NavItemLinks — the LANDSCAPE-ONLY discriminator (the
    list fits unscrolled at portrait; ≥1024 replaces the drawer with the desktop
    rail); md5 `3938d39ba803f1b1d5e5e17d3580e58f`; pixel-probe mean brightness 19.5
    (genuinely dark).
  - **Frame 2 — the TASKS view at 844×390 in DARK**: the view's FIRST rotation frame;
    the two-pane landscape layout (the `md:flex` aside renders AT 844); the pill
    family asserted BOTH sides of the seed's boundary (the S106 lesson-2): the
    overdue "Return library books" row carries `.sf-pill-red` (the at(-2) seeded
    past; the today-due rows render red too — daysUntil <= 0), the boundary row
    "Weekly vocabulary review" (repeat: weekly, NO dueDate) renders the violet
    RepeatPill + the slate SubjectChip and NO red pill inside the row — the
    class-overlap trap honored (the SubjectChip shares the future DuePill's slate
    classes; the gate discriminates by ROW scoping + the red family, never by the
    slate class alone); no-overflow contract scrollWidth 844; md5
    `16f1c6115a677911d55ffa62d75b5765`; pixel-probe mean brightness 36.8.
  - Both frames md5-DISTINCT GATE-enforced; the S4 violet/light restore awaited on
    every path (verified directly through SQLite post-run).

- **BH3 — DONE.** The honest-zero-cycle acknowledgment: no guard gap found in the
  pre-change audit; the census projections 936/474 unchanged EXACT BY CONSTRUCTION
  (BH1 documentation-only; BH2 scripts-only; src/ and tests/ untouched). No
  manufactured headline — the verified plateau IS the deliverable (the S100
  lesson-2 doctrine).

- **BH4 — reserved for any defect the final re-cert finds.**

## Mobile-nav verification (agent-browser, BOTH hosts — the standing requirement)

- **Reference** (`sidebarOpen` read-then-restored, "true" = expanded): 24 labeled
  visible links with the drawer open (20 nav + 4 page-behind); the drawer navigates
  to /Notes and auto-closes; the drawer's own X at (228,26) closes; the desktop rail
  collapsed at 80px with 20 icon-only links and ZERO title/aria (the reference's own
  a11y defect); scrollWidth 416 on /Notes (the reference's own overflow defect); the
  hamburger carries no aria-label.
- **Clone** (`sf-sidebar-collapsed` read-and-removed, null default): 26 labeled
  visible links (the superset skip-link); the drawer dialog MOUNTS (`role="dialog"`,
  `aria-label="Navigation menu"` — the superset pattern); the drawer navigates to
  /Notes and auto-closes (the dialog UNMOUNTS); a REAL Escape keypress closes; the
  desktop rail collapsed at 80px with ALL 20 icon-only links carrying title AND
  aria-label (the superset a11y); scrollWidth 390; the hamburger aria-labeled "Open
  navigation menu".

**No Tailwind v4 mobile-nav bug — s107 re-confirmed** (reference scrollWidth 416 vs
clone 390; the clone's superset dialog semantics + a11y intact).

## Re-certification (all on the FINAL tree)

- lint ✓ `tsc --noEmit` ✓ unit **936/936** (28 files — the census projection exact)
- the canonical build green (the standalone asset contract intact)
- cold 5-chunk e2e re-cert: **474/474** (131+141+57+87+58, every chunk first-pass)
- the s107 resweep: ok:true, exit 0 (probeCleanup ok, 18 captures)
- the standing suite (33 stages + verdict = 35 checks): 35/35 GREEN — the verdict
  below
- the register arithmetic on the final tree AFTER the session-local probe cleanup:
  **231 playwright importers / 112 Usage-line carriers = 229/110 + the two s107
  riders** (the scoped expectation for the next audit; measured LAST through an
  instrument that is itself not a rider — the S106 lesson-3)
- `.env.example` verified current (the env surface enumerated live: NODE_ENV /
  DATABASE_URL / AUTH_SECRET / NEXT_PUBLIC_SITE_URL)

## The standing suite verdict

**35/35 GREEN** (`bun scripts/standing-suite.mjs`, SUITE-EXIT:0) — all 33 stages + the
verdict green, zero findings in every stage: the preflight (navigations 1, hydrated
true); security/settings/connectivity/upload-edge/data-volume (0 findings each); the
forced-colors/print/focus-order/mobile/midband/landscape/dark-mobile sweeps (0
findings; drawer linkCount 20 at every viewport band); the accent families (7 accents
× 140 view renderings per band, 0 findings); the volume × theme × viewport cross-axis
(0 findings); **the cwv stage GREEN with 0 clone metric findings (the reference's own
POOR scenario informational, not a clone finding)**; **the cwv-volume-stress stage
GREEN with 0 budget breaches** (7 volume-affected views × 5 field metrics at 390×844
under the Lighthouse throttle against the :3200 standalone; volume 300/200/250;
MODE light; INP proxy Dashboard→Tasks **1167ms**; the longTaskTotal family ≤ 2400
unbreached — the S106/BG4 co-residency guard fired live in the suite's own run: "dev
server (pid 17579) stopped for the cwv-volume-stress stage"; the transient restart
warning after the stage — "dev server did NOT return healthy on :3000" — resolved by
the stages that follow: ai-error/ai-a11y/pre15-preflight/dep-audit all GREEN and the
:3000 listener verified healthy post-suite); ai-error/ai-a11y (0 findings);
pre15-preflight GREEN; dep-audit GREEN; the theme-restore closing guard GREEN (demo
light/violet verified through SQLite post-suite; the volume MARKER rows deleted by
the stage's own finally — Task 12 / Note 4 / Event 3, the seed counts exact).

## Documentation chain

- README.md: the Session-107 row (badge `tests-1410 green` unchanged: 936 + 474)
- AGENTS.md: the S107 lessons ×4 (the band-granularity rotation doctrine; the
  shared-selector trap; the active-list h1; the reset-as-re-execution doctrine)
- CLAUDE.md: the Unit-line seam tail re-anchored S107/BH
- vitest.config.ts: the header re-anchored S107/BH (28 files / 936)
- Project_Architecture_Document.md: v1.3.15 (the Cycle-57 revision block)
- docs/remediation-plan.md: the Cycle-57 plan + this execution record
- worklog.md: the Session-107 entry

**DONE** — Batch BH closed. Baselines unchanged: unit **936/936**, e2e **474/474**,
the standing suite per the verdict above. Standing debt after BH: **ZERO**.

# Session 127 — Batch CA (Cycle 76): The Audit-Driven Hardening Cycle — the Transcript-Window + Shared-Validator + Print-Chrome Set

> Record of worklog **Session-126 / Batch CA**. Workspace: fresh clone at `77205a4`
> (the Batch BZ state `48d8877` + the operator's `docs/session_122.md` transcript).
> Plan + execution record: **`docs/remediation-plan-session126.md`**.

## The directive

The operator directed the standing rhythm: refresh the workspace (a fresh clone — the
sandbox had been reset; `.env` re-created from the current `.env.example`, the dev db
re-pushed + re-seeded, chromium re-provisioned after the fresh-workspace browser gap),
re-read the full doc chain (`AGENTS.md`, `CLAUDE.md`, `README.md`, `PAD`,
`omni-study1_SKILL.md`, `docs/session_121.md`, `docs/remediation-plan-session125.md`,
`worklog.md`, `docs/session_122.md`), re-validate against the codebase, audit with the
repo skills as rubrics (the `skills/` folder excluded from checking/testing/compilation),
iterate on visual + functional parity with `https://omni-study1.base44.app/` (the mobile
navigation menu the named focus, Tailwind v4 the named suspicion class), keep the repo a
production-ready functional SUPERSET, verify the `.env`/`db/` contract and the vitest +
playwright suites, plan + execute remediation TDD-style, capture evidence, update the docs
chain, and commit + push to `main` via the SSH wrapper.

## Baseline (cold, BEFORE any work)

lint ✓ · `tsc --noEmit` ✓ (`noImplicitAny` + `noUnusedLocals`/`noUnusedParameters`) ·
unit **1127/1127** (42 files) · the canonical build green (exit 0) · the cold 5-chunk e2e
**529/529 — 139+157+71+92+70, every chunk first-pass** (per-chunk in the foreground, the
cert script's exact kill→fresh-db procedure — after the fresh-sandbox chromium
re-provision; the first attempt surfaced the missing-browser infrastructure failure, 138
instant `browserType.launch` errors, resolved by `bunx playwright install chromium`) · the
register re-derivation **249 importers / 130 Usage-line carriers / 0 stale / 119
usage-line-free** (the 29th consecutive hold, the expectation stated BEFORE the
measurement — the calibrated instrument: repo script files importing `playwright`
exactly) · the Mode-C audit of the Batch BZ diff (`48d8877`, 37 files, +1509/−185): all
substantive claims re-verified TRUE against the tree (BZ1's `effectiveDeckId` guards +
payloads; BZ2's `timeoutMs` + `isTimeoutError`; BZ3's Popover conversion; BZ4's
`removeOneMember`; BZ5's `write:${user.id}` 600 budget; BZ6's
`gradeCreateSchema.check()` + `checkGradeRangeMerge`; BZ7's `$transaction`; BZ8's
`FILE_METADATA` + link select; BZ9's P2002 uniform 200; BZ10's `$transaction` +
id-tiebroken trim; BZ12's comment; BZ13's `take: 500`; BZ14/BZ15/BZ16's removals; zero
key material).

## Live parity (both hosts — agent-browser, mobile 390×844)

**Reference** (logged in `sepnetflix2023@outlook.com`): the hamburger UNLABELED
(name=null, 36px at [17,14]) ✓ · the drawer: **no `role=dialog`** ✓, panel **288px**
(`lg:hidden fixed left-0 top-0 h-screen w-72 bg-white z-50 shadow-2xl`) ✓, the backdrop
**blur(4px)** on the true layer ✓, exactly **20 nav links** ✓ (the current standing pin)
· /Notes horizontal overflow **416 > 390** (the reference's own defect) ✓ · the landscape
(844×390) drawer-nav **scrollHeight 992 > clientHeight 290, overflow-y auto** ✓.

**Clone** (`:3000`, demo session): the labeled hamburger (`aria-label="Open navigation
menu"`, [16,14,36,36] — the a11y superset) ✓ · the drawer `role=dialog` +
`aria-label="Navigation menu"` ✓, panel **288px, max-width 331.5px = 85vw** ✓, **20
links** ✓, the true backdrop layer `bg-black/20 backdrop-blur-xs` computing **blur(4px)**
+ `oklab(0 0 0 / 0.2)` (the trap-7 serialization) ✓ · nav auto-close ✓ · /Notes **clean**
(scrollW 390 = 390) ✓ · scroll persistence (Dashboard 600px → /Analytics 600px) ✓ ·
landscape **992 > 301, overflow-y auto** ✓. **No Tailwind v4 mobile-nav bug — the 27th
consecutive live confirmation** (and the 28th on the post-fix fresh daemon at re-cert).
Probe residue zero on both hosts.

## The audits (rotated dual deep — fresh eyes on the BZ-uncovered surfaces)

The rotated pair covered what S121–S125 did NOT deep-cover — **the app shell + routing +
design tokens + auth screens** (layout.tsx, page.tsx, the full globals.css token surface,
router.ts, the mobile-chrome/sidebar/connectivity/nav-items shell family, the login
surface's five sub-screens, theme.ts, the store's boot lifecycle; rubrics §8/§9/§12/§13/
§16/§17 — **0C/0H/2M/7L/3I**) and **the persistence + crypto/auth core + infrastructure
configs** (schema.prisma in full, seed.ts, auth.ts end-to-end, db-path, server/ai.ts,
next.config/Dockerfile/compose/eslint/tsconfig/postcss/components/vitest/playwright,
health/robots/sitemap, the export + import route INTERNALS; rubrics §3/§4/§5/§6/§7/§16/
§17 — **0C/0H/2M/6L/5I**). Every finding verified by direct read before the plan (the M
set line-by-line personally); the AP-130 discipline held — the `ath/solve]` "typo" that
re-appeared in this cycle's own Read output is the known display-pipeline artifact,
byte-verified correct in S125/BZ11, untouched.

## TDD execution (RED → GREEN)

**RED:** unit +18 pins (data-import +18: the CA2 shared-validator contract — 4 RED on the
missing export + the seam-contract leg green by design; the CA14 domain caps — 11 RED on
the absent caps + the 2 legal-accept legs green by design) + e2e +9 pins (CA1/CA5 the
windows, CA2 the empty-id/null pair, CA3 the mobile print, CA4 the focus, CA7 the
modified-click, CA9 the helper text, CA11 the missing token — every RED verified for the
RIGHT reason; CA8 the placeholder AA guard GREEN BY DESIGN, the retracted finding's
regression lock). **GREEN:** CA1-CA22 in the smallest safe diffs; the interim gates green
after each item. Unit **1127 → 1145** (42 files); e2e **529 → 538** (142+161+71+93+71).

## The honest mid-run corrections (five — the ledger)

1. **CA8/A-L4 honestly resolved as a comment fix** — the audit's "2.5:1 placeholder" was a
   conversion error (hsl(220 9% 46%) computes to gray-500 rgb(107,114,128) = 4.82:1,
   already AA-compliant; the auditor trusted the Input's own stale "gray-400" comment).
   The real defect was the misleading comment — fixed with the honest arithmetic; the pin
   locks the compliant computed value as the regression guard (the AP-130 adjacent lesson:
   prose descriptions of computed values are claims; getComputedStyle is ground truth).
2. The CA5 pin's task field name (`done` → `completed` — the first import 400'd through
   the route's own PrismaClientValidationError mapping).
3. The CA3 pin's pill wait — `waitForSelector` defaults to VISIBLE, but the pill under
   print emulation is hidden BY THE FIX; the wait moved to `state: "attached"`.
4. The CA6 seed re-mapping broke SIX study pins across two chunk runs (they had encoded
   the mislabeled seed state — "1 / 4" counters on a calculus deck carrying biology
   cards); each re-anchored to the remediated honest counts (Integration 1 / Biology 3 /
   Spanish 2) with the CA note, and the first chunk-1 run's tail-2 output had masked one
   failure — the diff-review discipline caught it.
5. The README blanket census replace corrupted two historical rows (Session-125's
   baseline/GREEN/re-cert numbers + Session-124's chunk map); every value restored and
   the lesson recorded: census re-tags are per-line surgical edits, never blanket string
   replaces over a history-bearing table.

## Re-certification (the FINAL tree)

lint ✓ · tsc ✓ · unit **1145/1145** (42 files — data-import 32 → 50) · the canonical
build green · the cold 5-chunk e2e **538/538 — 142+161+71+93+71, every chunk first-pass**
(chunk 1 re-run after the S79 re-anchor; chunk 2 re-run after the four parity-session7
re-anchors) · the register tripwire **249/130/0/119** (the 30th consecutive hold) · the
live battery on the fresh S32 daemon (the mobile drawer re-run GREEN — **the 28th
consecutive no-Tailwind-v4-bug confirmation**; the CA4 focus walkthrough; the CA9 helper
text; the CA11 missing-token message; the CA8 computed placeholder; the CA6 deterministic
deck order) · the six `docs/screenshots/126-*.png` evidence frames (non-blank-verified
programmatically) · the `.env`/`db/` contract verified current (the dev db re-pushed for
the CA19 index drop + re-seeded for the CA6 remediated fixtures). **Standing debt: ZERO.**

## Docs chain

README badge 1683 + the Session-126 row + the tree/testing census lines; AGENTS commands
1145/538 + the S126 lessons ×4 (the asc+take oldest-window trap, the single-source
doctrine extended to validation rules, the computed-comment-vs-computed-value lesson, the
seed-correction-as-pin-migration rule); CLAUDE census + the lint-attribution fix; the
vitest header (42 files / 1145); PAD **v1.3.34** (the §8.1 Total repair + the per-file
rows + §12's line counts + §3.3's Patterns A–D reconciled to the shipped code + §3.2's
tree fixes + §5.1/§5.2/§5.3's token corrections + ADR-002/004/016/017/018 reconciliations
+ §11's avatarEmoji + the v1.3.32 retro-edit repair); the SKILL doc's five drift fixes +
the census + the BZ/CA-era seam references + the sanctioned-exception note; the
cert-script Expected re-tag (142+161+71+93+71 = 538 + the CA block); the master plan's §5
execution record; the worklog Session-126 entry; this record.

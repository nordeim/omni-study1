# Session 126 — Batch BZ (Cycle 75): The Audit-Driven Hardening Cycle — the Auto-Select-Guard + Write-Budget + Popover-Keyboard Set

> Record of worklog **Session-125 / Batch BZ**. Workspace: refreshed clone at `37d29cd`
> (the Batch BY state `09d3054` + the operator's `docs/session_120.md` transcript).
> Plan + execution record: **`docs/remediation-plan-session125.md`**.

## The directive

The operator directed the standing rhythm: refresh the workspace, re-read the full doc chain
(`AGENTS.md`, `CLAUDE.md`, `README.md`, `PAD`, `omni-study1_SKILL.md`,
`docs/session_119.md`, `docs/remediation-plan-session124.md`, `worklog.md`,
`docs/session_120.md`), re-validate against the codebase, audit with the repo skills as
rubrics (the `skills/` folder excluded from checking/testing/compilation), iterate on
visual + functional parity with `https://omni-study1.base44.app/` (the mobile navigation
menu the named focus, Tailwind v4 the named suspicion class), keep the repo a
production-ready functional SUPERSET, verify the `.env`/`db/` contract and the vitest +
playwright suites, plan + execute remediation TDD-style, capture evidence, update the docs
chain, and commit + push to `main` via the SSH wrapper.

## Baseline (cold, BEFORE any work)

lint ✓ · `tsc --noEmit` ✓ (`noImplicitAny` + `noUnusedLocals`/`noUnusedParameters`) ·
unit **1113/1113** (41 files) · the canonical build green (exit 0) · the cold 5-chunk e2e
**523/523 — 137+153+71+92+70**, every chunk first-pass (run per-chunk in the foreground,
replicating the cert script's exact kill→fresh-db→run procedure — the sandbox reaps
daemonized processes between tool calls) · the register re-derivation **249 importers /
130 Usage-line carriers / 0 stale / 119 usage-line-free** (the 27th consecutive hold, the
expectation stated BEFORE the measurement — the calibrated instrument: repo files importing
`playwright` exactly) · the Mode-C audit of the Batch BY diff (`09d3054`, 59 files,
+1571/−234): all substantive claims re-verified TRUE against the tree (BY1's gradeLevel
union + the UI `""` send; BY2's nodeEnv-gated fallback; BY3's 25 MiB shared constant;
BY5's shared export key; BY6's null-gap seam + the type-predicate filter; BY7's
appHydrated gate across 16 spec files + the HydrationMarker; BY8's print-exact checked
checkbox; BY9's vocabulary; BY10's popstate close; BY11's skip-link gating; BY12's
sf-focus removal; BY13's container-scoped pickers; the five evidence frames; zero key
material in the diff).

## Live parity (both hosts — agent-browser, mobile 390×844)

**Reference** (logged in `sepnetflix2023@outlook.com`): the hamburger UNLABELED
(name=null, 36px at [17,14]) ✓ · the drawer: no `role=dialog` ✓, panel **288px** ✓, the
backdrop **blur(4px)** on the true layer ✓ · /Notes horizontal overflow **416 > 390**
(the reference's own defect) ✓ · the landscape (844×390) drawer-nav **scrollHeight 992 >
clientHeight 290, overflow-y auto** ✓. **Drift recorded:** the reference drawer now
carries exactly **20 nav links** (the historical "24 links" pin reflected drawer chrome
the live reference has since removed — a footer/profile section). The clone's 20 links
are the CURRENT exact parity set; current chrome-level measurements are authoritative
(the S123 data-drift doctrine extended to the reference's own chrome evolution).

**Clone** (`:3000`, demo session): the labeled hamburger (`aria-label="Open navigation
menu"`, [16,14,36,36] — the a11y superset) ✓ · the drawer `role=dialog` +
`aria-label="Navigation menu"` ✓, panel **288px, max-width 331.5px = 85vw** ✓, **20
links** ✓, the backdrop `bg-black/20 backdrop-blur-xs` computing **blur(4px)** +
`oklab(0 0 0 / 0.2)` (the trap-7 serialization) ✓ · nav auto-close ✓ · /Notes **clean**
(scrollW 390 = 390 — the reference's own defect fixed) ✓ · scroll persistence (Dashboard
600px → /Analytics 600px) ✓ · landscape **992 > 301, overflow-y auto** ✓ · the BY10
popstate close re-verified (pushState → back → drawer closed, URL followed) ✓.
**No Tailwind v4 mobile-nav bug — the 26th consecutive live confirmation.** Probe residue
ZERO on both hosts.

## The audits (rotated dual deep — fresh eyes on the BY-uncovered surfaces)

The FE audit (**0C/1H/3M/3L/1I**): the view layer + client data seams. The H finding
(FE-H1): the flashcards Add Card + AI Generate guards read the raw `selectedDeckId` while
the S123/BX8 render model auto-selects the first deck via `effectiveDeckId` — reproduced
live (the dialog stayed open, no toast, no card, NO POST at the wire). The M findings:
the practice-tests AI site without the 120 s deadline (FE-M1); the manage-notebooks
nested buttons inside `role="menuitem"` (FE-M2); the duplicate-member email-only removal
(FE-M3). The API audit (**0C/0H/1M/3L/4I**): the delegate factory end-to-end + the
route family. The M finding: no write budget on the 16 factory POSTs (API-M1). The L
findings: the unbounded factory list (API-L1), the folder re-parent TOCTOU (API-L2), the
grade score/maxScore guard (API-L3). Every finding personally verified by direct read
before the plan; the H finding additionally reproduced live. **The AP-130 retraction:** the
audit's two "corrupted log tags" were display-pipeline artifacts — byte-verified via the
hex dump + byte-constructed searches (both `[health]`/`[math/solve]` byte-correct since
birth); the first "byte-verification" (a python repr PRINT) inherited the same
bracket-eating pipeline and confirmed the phantom. **BZ11 shipped NO change** — the
verification rule became AGENTS S125 lesson 1 + AP-133.

## TDD execution (RED → GREEN)

**RED:** 11 unit pins (validation +4, grade-merge the NEW 42nd file +7, group-members +3)
+ 6 e2e pins (BZ1/BZ3/BZ4/BZ6/BZ8/BZ5) — every RED verified for the right reason (the
wrong-reason-RED discipline; two pin-side corrections to reach it). **GREEN:** BZ1-BZ16 in
the smallest safe diffs (BZ11 retracted, no diff); the interim gates green after each
item; tsc's noUnusedLocals caught the dead code's last references (the machine guard
working). Unit **1113 → 1127** (42 files); e2e **523 → 529** (139+157+71+92+70).

## The honest mid-run corrections (six)

1. The BZ3/BZ4 create-fetches ran inside `page.evaluate` at about:blank — relative URLs
   need a real origin; both pins gained the AL1b leading-goto convention.
2. The scripted entities-import edit injected the grade symbols into the WRONG import
   block (the regex matched the first `import {`); the merge threw empty-message
   ValidationErrors; rewired + re-run green.
3. The grade-merge legacy pin sent the SCORE leg (numeric — overriding the stored
   string); the non-numeric stored leg must be the one the effective pair falls back TO.
4. **BZ11 retracted** — the phantom log-tag finding (the AP-130 class extends to
   python-repr "verifications"; hex/boolean instruments only).
5. The BZ5 exhaustion pin's first design spent the DEMO budget: playwright runs spec
   files ALPHABETICALLY (s14 before tasks.spec), so 600 demo-budget writes 429'd six
   later chunk tests. The fix: FRESH-USER isolation (the s25 TEST-NET register
   convention); the demo user is never mutated.
6. The BZ1 strict-mode flake: the seed's same-millisecond `createdAt` ties make
   `decks[0]` random per seed — the 0-card deck's empty grid renders a second
   exact-name "Add Card" CTA when it wins the tie (~50% of chunk runs). The `.first()`
   hardening (the header button is DOM-first) made the pin order-agnostic.

## Re-certification (the FINAL tree)

lint ✓ · tsc ✓ · unit **1127/1127** (42 files) · the canonical build green · the cold
5-chunk e2e **529/529 — 139+157+71+92+70**, every chunk first-pass (chunk 2 verified
TWICE on consecutive fresh seeds; chunk 1 re-run on the final spec set) · the register
tripwire **249/130/0/119** (the 28th consecutive hold) · the live curl battery (BZ6's
inverted pair 400 with the copy verbatim + the single-leg shrink 400; BZ8's 201 with no
`data` key; zero residue) · the live agent-browser battery on the fresh S32 daemon (BZ1's
round-trip — dialog closes, the card renders, POST 201 + the cleanup DELETE 200; BZ3's
keyboard walkthrough — open → Rename focused → Tab → Delete → Escape closes; BZ4's
one-removed-sibling-survives; the mobile drawer battery re-run GREEN) · the six
`docs/screenshots/125-*.png` evidence frames (non-blank-verified programmatically) · the
`.env`/`db/` contract verified current. **Standing debt: ZERO.**

## Docs chain

README badge 1656 + the Session-125 row + the tree/testing census lines; AGENTS commands
1127/529 + the S125 lessons ×4 + the conventions (the write-budget family, the bounded
list, the grade-guard merge pattern); CLAUDE Unit-line 1127 + the e2e line 529; the
vitest header (42 files / 1127); PAD **v1.3.33** (the revision block; §12's globals.css
1002; §8.4's floors 1127+/529+; §6.3's session shape + `v`; §3.2's annotated tree
regenerated end-to-end; §8.1's changed rows + the Total; the rejected version-cell claim
documented — the lockfile pins zod 4.6.5/playwright 1.63.0); the cert-script Expected
re-tag (139+157+71+92+70 = 529 + the BZ block); the SKILL doc's twelve drift fixes + the
census header + AP-133 (the AccentToken honest count: 17 fields — the digest's 15 was
itself a drift); the master plan's §5 execution record; the worklog Session-125 entry;
this record.

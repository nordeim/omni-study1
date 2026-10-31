# Session 119 — Batch BS (Cycle 68): The Audit-Driven Hardening Cycle — the Session-Revocation + Bounded-Reads + Drawer-Focus Set

> Record of worklog **Session-118 / Batch BS**. Workspace: continued clone at `5f2a19b`
> (the Batch BR state + the operator's `docs/session_104.md` transcript).
> Plan + execution record: **`docs/remediation-plan-session118.md`**.

## The directive

The operator directed the standing rhythm: refresh the workspace, re-read the full doc
chain (`AGENTS.md`, `CLAUDE.md`, `README.md`, `PAD`, `omni-study1_SKILL.md`,
`docs/session_103.md`–`104.md`, `docs/remediation-plan.md`, `worklog.md`), re-validate
against the codebase, audit with the repo skills as rubrics (the `skills/` folder
excluded from checking/testing/compilation), iterate on visual + functional parity with
`https://omni-study1.base44.app/` (the mobile navigation menu the named focus, Tailwind
v4 the named suspicion class), keep the repo a production-ready functional SUPERSET,
verify the `.env`/`db/` contract and the vitest + playwright suites, plan + execute
remediation TDD-style, capture evidence, update the docs chain, and commit + push to
`main` via the SSH wrapper.

## Baseline (cold, BEFORE any work — all green)

lint ✓ · `tsc --noEmit` ✓ (`noImplicitAny` on) · unit **944/944** (28 files) · the
canonical build green (the bundled-`.env` contract intact: `AUTH_SECRET=""`) · the cold
5-chunk e2e **476/476** (131+141+57+87+60 — the first chunk-5 attempt hit the
documented aged-scratch-db class; fresh `db/e2e.db` → green) · the dev-server preflight
GREEN (after the documented `.next/dev` reload-loop remedy) · the register
re-derivation **249 importers / 130 Usage-line carriers / 0 stale / 119
usage-line-free** (the recorded tripwire held exactly; the instrument's Usage-line
regex fixed from the documented `// Usage:` form) · the Mode-C audit of the Batch BR
diff (`2b7222e` + `5f2a19b`): 34 files / 830 insertions, every BR claim verified TRUE
against the tree, zero key material (the 64-hex sweep empty), all six s117 evidence
frames present.

## Live parity (both hosts — agent-browser + DOM probes)

**No NEW parity gap; no Tailwind v4 mobile-nav bug — s118 re-confirmed (the 19th
consecutive live confirmation).** Reference reproduced live: 24 visible links
drawer-open, NO `role=dialog`, the unlabeled hamburger, `/Notes` `scrollWidth 416 >
390` (the reference's own overflow defect), landscape nav `scrollHeight 992 > 290`.
Clone: 26 labeled links, `role="dialog"` + `aria-label="Navigation menu"`, labeled
hamburger + `aria-expanded`, labeled backdrop close at `blur(4px)` (the v4
`backdrop-blur-xs` pin), REAL Escape close + scroll-lock release, `/Notes` clean at
390, landscape `992 > 301`, sidebar 260 → 80 px with **20/20 icon-only rail links
titled**.

**Two auditor recommendations DISPROVEN by reference measurement and converted to
documented non-gaps (the DOM-authority rule extends to audit findings — the S118
lesson-1):**

- **Q1 — the `sf-slide-in` dead class.** The auditor recommended WIRING the drawer
  animation. The reference's drawer panel computes `transition: all 0s` — it opens
  INSTANTLY. The clone's instant open IS parity; wiring the animation would BREAK it.
  The fix is dead-code removal (BS11), not wiring.
- **Q2 — scroll-to-top on navigate.** The auditor recommended `window.scrollTo(0,0)`
  in `navigate()` ("SPA routers conventionally scroll to top"). The reference PERSISTS
  scroll across drawer navigation (600 px carried Dashboard → /Analytics on a 2166 px
  page; the clone carries 600 px identically onto its 2584 px /Analytics). The clone's
  behavior IS parity; the reset would BREAK it. No fix.

**BS4 verified live before the fix:** opening the drawer leaves `document.activeElement`
on the hamburger (outside the announced `aria-modal` dialog) — the keyboard user tabs
through background content behind the modal.

## The findings (every one verified against code)

The two parallel deep audits (API/security + frontend/quality, against the
`skills/web-application/SKILL.md` §5/§16 rubrics) surfaced **one Medium security gap,
two Medium hardening gaps, one Medium a11y gap, seven Low items, and three Info
items** — every one verified by direct read + live probe before the fix, every one
executed (BS1–BS12; the Info pair I1/I2 documented as non-gaps). The full table with
evidence citations lives in the plan (`docs/remediation-plan-session118.md` §1). The
headline set: **BS1** a password reset did NOT revoke existing sessions (no version
claim, no column — a pre-reset cookie survived up to 7 days); **BS2** `readJson` was
unbounded + several schema atoms unbounded (an invalid date reached `new Date()` →
Prisma 500, violating the 400-bad-input contract); **BS3** the upload routes lacked
the rate limit the rubric documents; **BS4** the drawer announced `aria-modal` without
any focus lifecycle; **BS5** the files POST's JSON branch hand-rolled a divergent
second validation on the same table; **BS6** CSV formula injection in the RUM export;
**BS7** the RUM schema twin was dead code with weaker bounds.

## The fixes (TDD: red → green; the smallest safe diff)

**RED first: 18 failing pins across 4 files** (auth +3, validation +13,
rum-diagnostics +2), then the source, then GREEN **963/963** (28 files). The set (full
detail in the plan §2): **BS1** the User model gains `sessionVersion`, the token embeds
`v`, a MISSING `v` reads as 0 (deploy compat — pre-change cookies survive the deploy;
only the bump revokes), `getCurrentUser` compares the claim, and the reset transaction
increments the column (login/verify embed the current version; change-password and
change-email keep their documented ADR-022/024 session-survives contracts); **BS2**
the `readJson` 10 MiB cap (declared content-length pre-read + actual length) + the
bounded atoms (`emailField` trim/email/≤200 everywhere, `jsonArray` ≤100k, dates
`Date.parse`-valid ≤40 with `optionalDate`'s `""` leg carried independently — the S118
lesson-2 near-miss, `idField` ≤64, the mathSolve image ≤7M) + the 5 MiB client-side
picker gate; **BS3** the 20/15-min per-user upload budget shared across BOTH
file-link entry points; **BS4** the drawer focus lifecycle (focus-in on open, Tab
contained with wrap at both edges, focus-restore to the opener — the WCAG 2.2 AA modal
contract the role/aria already claimed; no animation, no geometry change); **BS5**
`linkFileSchema` trim-before-check + the files POST JSON branch consumes it (the
hand-rolled copy deleted, the folder-404 guard kept); **BS6** `csvField` neutralizes a
leading `=`/`+`/`-`/`@`/tab/CR; **BS7** the RUM twin deleted, `validation.ts` carries
the route's enforced bounds and the route imports them; **BS8** the settings
`holidays` pre-warm; **BS9** the boot `loadAll` gains `.catch(() => {})`; **BS10**
`main` gains `duration-200` (matching the rail); **BS11** the inert `sf-slide-in`
class + orphaned keyframes + stale comment removed + the export 10 MiB client
pre-check; **BS12** the reset-password limiter (10/IP/15 min) + the "exactly 15
entries" comment → 16 + the boot script consumes its own `var KEY`.

**Guardrails held:** no test weakened (the RUM pin re-anchor re-shaped the pins to the
ENFORCED contract — the old pins pinned dead code), no lint/type rule loosened,
`noImplicitAny` stays on, the s117 e2e pins ride untouched.

## The live verifications (the dev server, :3000)

The readJson cap (an 11 MiB login body → 400 before the read) · the upload limiter (a
scratch registered user's 20 × 201 → the 21st 429 + `Retry-After`; `files/link` shares
the bucket) · the reset revocation (a pre-reset cookie → 401 after the reset; the
new-password sign-in 200) · the files JSON branch (the shared schema's rejections
live) · the reset limiter · the BR1 import round-trip regression (the demo account's
export → import: cards updated 6 — the S117 fix still holds).

## The standing suite (the honest sequence)

The first launch (the bare `nohup … &` form) was REAPED mid-stage-2 — the S110
lesson-1 live again (its security stage had already run, consuming the demo user's
20/15-min AI budget on the shared :3000 process). The double-fork orphan re-launch
(the S110 remedy): **34/35** — the security stage alone failed, `AI-route limiter
shape wrong: cutoffAt=1, statuses=429` — the **double-run phantom** (the S32
fixture-harvested class live: the killed run's own probe had pre-exhausted the
in-memory budget the re-run's probe measures). Diagnosis by failure MODE (the S117
lesson-4 protocol): an assertion-mode finding whose mechanism is the per-process
budget, not the code. A standalone re-run on the same process read `cutoffAt=16` (the
suite's own ai-error/ai-a11y stages had consumed 5 within the window — the second
consumption class, confirming the mechanism); a FRESH dev-server boot (the S32 recipe)
+ the standalone re-run: **0 findings, 7 nonGaps — GREEN.** The standing suite:
effectively **35/35**.

## Re-certification (the FINAL tree)

lint ✓ · `tsc --noEmit` ✓ (`noImplicitAny` on) · unit **963/963** (28 files — auth +3,
validation +13, rum-diagnostics +2, view-collections +1; the RUM + theme-cache pins
re-anchored) · the canonical build green (the standalone asset contract intact) · the
cold 5-chunk e2e **478/478** (132+141+57+87+61 — chunk one +1: the BS4 drawer
focus-lifecycle pin; chunk five +1: the BS2 oversized-body pin; BS1 rides the reset
journey in-place via the captured-cookie replay) · `.env.example` verified current
(tracked, matches the codebase contract) · 6 fresh evidence frames in
`docs/screenshots/` (118-ref-dashboard / 118-ref-mobile-drawer / 118-clone-dashboard /
118-clone-mobile-drawer / 118-clone-settings-holidays / 118-clone-files — all
md5-distinct, DOM-verified states; the drawer frame's capture session itself
re-verified the BS4 lifecycle live: open → focus on the close button, Escape → closed
+ focus restored to the hamburger).

**Standing debt: ZERO.** The docs chain re-anchored at every anchor: README badge 1441
+ the Session-118 row, AGENTS 963/478 + the S118 lessons ×4, CLAUDE Unit-line seam
tail S118/BS, vitest header 963, PAD v1.3.26 (+ the §6.4 rows + the stale-title
repair — the S117 cycle left the title at v1.3.24), the e2e-cert script census re-tag
478 (also repairing the S117 474-era Expected sum the cycle never re-tagged), the
remediation-plan header → Batch BS, the worklog entry, this record.

# Session 121 — Batch BU (Cycle 70): The Parity-Superset Hardening Cycle — the Dialog-Key + Badge-Family + Off-Switch Set

> Record of worklog **Session-120 / Batch BU**. Workspace: refreshed clone at `da5942d`
> (the Batch BT state + the operator's `docs/session_109.md`/`session_110.md` transcripts).
> Plan + execution record: **`docs/remediation-plan-session120.md`**.

## The directive

The operator directed the standing rhythm: refresh the workspace, re-read the full doc chain
(`AGENTS.md`, `CLAUDE.md`, `README.md`, `PAD`, `omni-study1_SKILL.md`,
`docs/session_109.md`–`110.md`, the remediation plans, `worklog.md`), re-validate against
the codebase, audit with the repo skills as rubrics (the `skills/` folder excluded from
checking/testing/compilation), iterate on visual + functional parity with
`https://omni-study1.base44.app/` (the mobile navigation menu the named focus, Tailwind v4
the named suspicion class), keep the repo a production-ready functional SUPERSET, verify
the `.env`/`db/` contract and the vitest + playwright suites, plan + execute remediation
TDD-style, capture evidence, update the docs chain, and commit + push to `main` via the
SSH wrapper. **This cycle executed across two context windows**: the first was interrupted
mid-GREEN (the build green, the standalone verification not yet run); the second re-derived
the plan's item×tree matrix before finishing — the recovery itself became the AP-126
lesson.

## Baseline (cold, BEFORE any work — all green)

lint ✓ · `tsc --noEmit` ✓ (`noImplicitAny` on) · unit **990/990** (31 files) · the canonical
build green (the bundled-`.env` contract intact: `AUTH_SECRET=""`; the documented ADR-020
warning the only stderr) · the cold 5-chunk e2e **488/488** (133+142+60+89+64, fresh
`db/e2e.db`) · the register re-derivation **249 importers / 130 Usage-line carriers / 0
stale / 119 usage-line-free** (the 21st consecutive hold) · the Mode-C audit of the Batch
BT diff (`80298b5`): every BT1–BT14 claim verified TRUE against the tree, zero key
material, all six s119 evidence frames present. The Playwright browser binary was missing
in the fresh sandbox (infrastructure, not source debt — the first cert attempt failed
near-total until `agent-browser install`/the chromium provision; the class documented at
S90).

## Live parity (both hosts — agent-browser + DOM probes)

**No NEW parity gap; no Tailwind v4 mobile-nav bug — s120 re-confirmed (the 21st
consecutive live confirmation).** The standing reference battery held: the unlabeled
hamburger, no `role=dialog` drawer-closed, 24 links drawer-open, backdrop `blur(4px)`,
`/Notes` overflow, landscape nav scroll. **Four reference measurements settled parity
decisions** (the DOM-authority rule):

- **F5 (the task delete):** the reference's task ellipsis → Delete runs IMMEDIATELY, no
  confirmation — the clone's instant delete IS parity (documented non-gap; corroborates
  the P1 record that the never-shipped confirm was deliberately not matched).
- **The dialog Cancel matrix (P3):** the reference's Add EXAM + Add CLASS dialogs carry
  Cancel; Events/Flashcards do not; the clone lacked it in Exams/Assignments/Timetable —
  **BU9** closed the three gaps (measured matrix, not convention).
- **The dashboard exam badge family (P4a):** the reference renders red for a TODAY exam
  and the NEUTRAL slate family for an 11-day exam — the clone shipped sf-pill-red for
  EVERY distance and the label without the measured "!" — **BU7**.
- **The exams-view ≥2-days badge (P4b — the reference DRIFTED):** the CURRENT reference
  renders the BLUE family (measured blue-100/blue-600 on an 11-day exam) where the S76
  measurement recorded yellow — the reference moved; the clone follows with the
  AA-superset blue-700 text (5.49:1 vs the reference's own 4.24:1, the one-step-darker
  precedent) — **BU8**.

The clone battery GREEN: the labeled hamburger + drawer (`role="dialog"`, 288px panel,
navigation → auto-close, scroll lock), `/Notes` clean at 390, scroll persistence carried
through SPA navigation, the sidebar rail titled. The **F1 FolderDialog bug reproduced
live** (create Alpha → create Beta → Rename Alpha showed **"S120 Folder Beta"** — the
stale first-mount props; a Save would silently rename Alpha to Beta).

## The audits

Two parallel deep audits against the `skills/web-application` rubrics (§5/§16 for the API
surface, §8/§9/§12/§13 for the frontend), every finding verified by direct read (the
functional ones reproduced live): the API audit **1H/4M/5L/5I**, the frontend audit
**1H/7M/9L/3I** — consolidated, de-duplicated, and reference-measured into the BU table
(`docs/remediation-plan-session120.md` §1). The I-level trio documented as non-gaps or
accepted postures (the unthrottled CRUD writes — the accepted single-user posture; the
ADR-013 delivery posture — whose off-switch BU2 then shipped).

## The BU set (TDD — RED first, then the source)

**RED:** 40 failing unit pins (client-ip +14, delivery-gate +6, secure-cookie +6,
hue-pairs +2, seed-gate +5, auth eviction +2, validation ordering +5) + 9 e2e pins, every
pin verified RED for the right reason on the pre-change tree. **GREEN: unit 990 → 1030
(36 files); e2e 488 → 497 (135+145+61+90+66).**

- **BU1** the FolderDialog `key` remount (the sibling idiom) — verified live BOTH
  directions; e2e-pinned in resilience.
- **BU2** `inAppDeliveryGates` (DISABLE_IN_APP_OTP/RESET) — the gated responses omit the
  code/resetUrl (the shape-identical no-enumeration form); the PAD §6.4 reopen trigger's
  off-switch.
- **BU3** `parseTrustedProxyHops`/`clientIpFromForwarded` (TRUSTED_PROXY_HOPS — the
  declared proxy-hop contract, failing closed); the other §6.4 trigger closed.
- **BU4** the RUM unique widened to `@@unique([userId, sessionId, metric])` + the
  user-scoped upsert; e2e-pinned (user B never touches user A's row).
- **BU5** the rum/export `take: 2000` — the AGENTS-documented cap now true in code.
- **BU6** the rate-limiter lazy sweep at the 2,048-bucket cap (+ the size observable and
  the drain seam exported for tests/ops).
- **BU7** the dashboard badges: TODAY-only red "Today!" + the neutral slate far family
  (the measured values + the superset dark pairs).
- **BU8** the new `sf-pill-blue` utility (blue-100/blue-700, both pinned in @theme —
  closing the blue-900 unpinned consumer too); the AC7 pins re-anchored to the blue
  family; the hue-tokens census updated coherently (the AP-125 three-edit contract).
- **BU9** the three Cancel buttons (Exams/Assignments/Timetable — the measured matrix).
- **BU10/BU11** the 51+8-site slate text dark-pair sweep + `tests/hue-pairs.test.ts` (the
  machine guard; the color-pinned exception list documented).
- **BU12** the True/False `role="radiogroup"` → `role="group"`.
- **BU13** the countdown-expiry `aria-live="polite"` announcement; e2e-pinned.
- **BU14** the register uniform 200 (the 201/200 enumeration split closed); e2e-pinned.
- **BU15** `secureCookieFlag` — the DEPLOYMENT X-Forwarded-Proto instruction made true.
- **BU16** the security headers on every route (nosniff / X-Frame-Options: DENY /
  Referrer-Policy: strict-origin-when-cross-origin) — **live-verified on the standalone
  production server**: all three on `/login` AND on the API routes (the 400 login
  validation and the 401 RUM both carry them); the AUTH_SECRET boot enforcement verified
  in the same smoke (refuses the empty secret, boots with a real one).
- **BU17** the polish set (the calculator unit-select ids; the flashcards Textarea
  primitive + entity-named icon buttons; the login reset-success on the emerald
  `role="status"` channel; the rum-panel dark pairs).
- **BU18** the tasks-view dead imports; **BU19** the base-layer cursor rule; **BU20** the
  eight unpinned palette steps pinned.
- **BU21** the `shouldSeedDemo` fail-safe gate + the seed wiring — **live-verified both
  directions** (SEED_DEMO=0 → skipped, users=0; unset → seeded, users=1); DEPLOYMENT.md
  §8 + §3 + `.env.example`. Discovered unimplemented at the docs phase (the prior window
  was interrupted mid-GREEN) — closed TDD-style; the recovery is the AP-126 lesson.
- **BU22** the smalls: the eventSchema endDate≥startDate ordering refine (via
  restructured create/update schemas — the Zod-4 `.refine()`-wraps-`.partial()`
  incompatibility avoided at implementation), the deckId comment, the expired-token
  pruning, the z-index scale documented in AGENTS Conventions, and
  **`ignoreBuildErrors` REMOVED — the canonical build is now the type gate** (green,
  exit 0).

## The honest mid-run corrections

1. **Three stale pins** exposed by the first full cert (the discovery pass) and
   re-anchored IN-PLACE to the measured contracts: the parity-session8 S8-B exam-row
   badge (red → the slate far family, the "Today!" regex widened), the accessibility
   overdue-badge census (zero `sf-pill-red` on the seeded dashboard under BU7 → the
   self-owned-data shape: create → assert → finally-cleanup), and the auth-flows S15
   reset-success (`role="alert"` → `role="status"` after BU17d). The AP-124 lesson: a
   measured-parity change must sweep the pin layer for the OLD measured values in the
   same change.
2. **The BU21 miss** (above) — the per-BU grep matrix at the docs phase is now the
   resumed-session discipline.
3. The cert-script census re-tag was written but deliberately NOT applied to the running
   script (the S119 phantom-chunk lesson); it landed after the DONE line with the final
   cert log as its evidence.

## Re-certification (all on the FINAL tree)

lint ✓ · `tsc --noEmit` ✓ (`noImplicitAny` on) · unit **1030/1030** (36 files) · the
canonical build green (exit 0, the type gate live post-BU22e) · the standalone smoke: the
three security headers on page AND API responses, the AUTH_SECRET boot enforcement, login
validation + RUM auth live · the register tripwire **249/130/0-stale/119** — the exact
hold, the expectation stated BEFORE the measurement · the cold 5-chunk e2e **497/497**
(135+145+61+90+66, every chunk first-pass) · the live agent-browser battery: the mobile
drawer (288px panel, labeled hamburger — the a11y superset, drawer navigation →
/Analytics + auto-close), the F1 rename fix verified live both directions, the BU8 blue
badges (Today red-100/red-700; 2/3/11-days blue-100/blue-700), the BU9 Cancel ×3, the
scroll-persistence 590px carried · the seven `docs/screenshots/120-clone-*.png` evidence
frames (pixel-sane, DOM-verified states) · `.env.example` verified current (DATABASE_URL /
NEXT_PUBLIC_SITE_URL / AUTH_SECRET / SEED_DEMO / DISABLE_IN_APP_* / TRUSTED_PROXY_HOPS /
E2E_PORT).

**Standing debt after BU: ZERO.**

## The docs chain

`docs/remediation-plan-session120.md` (the plan + execution record) ·
`docs/remediation-plan.md` (the Cycle-70 header) · `AGENTS.md` (the S120 lessons ×4 + the
z-index scale + the census) · `CLAUDE.md` (the Unit-line seam tail S120/BU) ·
`vitest.config.ts` (the 1030 header) · `PAD v1.3.28` (the revision block + the §6.4 rows:
the two reopen triggers closed, the RUM row closed, four new rows) ·
`scripts/e2e-chunked-cert.sh` (the 497 census re-tag) · `README` (the badge 1527 + the
census lines + the Session-120 row) · `omni-study1_SKILL.md` (the census re-anchor + the
§18 z-index re-measure + the AP-124..126 lessons) · `docs/DEPLOYMENT.md` (§2/§3/§8) ·
`.env.example` · `docs/screenshots/120-clone-*.png` · this record · `worklog.md` (the
Session-120 entry). Commit + push to `main` via the SSH wrapper.

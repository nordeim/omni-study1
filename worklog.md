# Omni-Study1 — Worklog

> The running work journal for the remediation/parity effort on
> `nordeim/omni-study1`. Newest sessions at the bottom. Session numbering
> follows the README remediation table (session-1 … session-54 are recorded
> there; this file starts at the session-55 continuation).

---

## Session 55 — parity re-application, account flows, regression hardening

**Context.** The workspace was reset a fifth time mid-stream (the s21–s23
chunk had just gone green). The insurance-push strategy held: remote `main`
preserved the chrome baseline (`cf23159`) plus every green batch pushed
before each reset (`c03bd05` S5 → `ff0a80f` S9 → `30d6cbe` RUM/export/import).
This session re-verified the workspace, finished the remaining superset
(s24–s26), and ran the first complete full-suite regression.

**Work log.**

1. **State recovery.** Re-cloned/verified; confirmed remote main == local
   HEAD at `30d6cbe`; rebuilt the push infrastructure
   (`/home/z/ssh-infra/`: ed25519 key + paramiko GIT_SSH shim + `push_main.py`).
2. **s24–s26 decode + completion.** The change-password / delete-account /
   change-email routes and the three Settings Profile cards existed but
   failed their pins. Fixed: `aria-label`s on all three card sections, the
   "Update the address you use to sign in" + "Update email address" copy
   pins, the Danger-zone "Confirmation" label, the 409 duplicate-email copy,
   the Profile tab intro line ("Your account and study information."), the
   EmailCard identity `<p>` → `<div>` (S26 strict-mode collision with the
   Account card `<p>`), and the S26 live identity slice (store `setEmail` +
   `onEmailChanged` re-render both the sidebar footer and the Profile
   identity block). **18/18 green** → commit `5fdfd99` pushed.
3. **Login limiter progressive reset (product fix).** Three specs document
   "successful logins RESET the IP limiter"; the route never reset it and the
   suite's 11th loopback login 429'd. Added `resetRateLimit` on successful
   credential verification. Auth chunks re-verified green.
4. **Full e2e regression (six chunks).** chrome 94→**104** (incl. s14) ·
   S5+calc+S6 **46** · S7+S8+S9 **79** · tasks/resilience/s16/s17 **20** ·
   auth+s18–s23 **35** · s24–s26 **18**. Unit **834/834**. Residuals decoded
   and fixed during the sweep (commit `1356c52`, then `d3a1d74`):
   - theme-system mobile-chip locator → exact class token (the S8 softest-
     tint header carried the `bg-sf-primary-soft` substring on its dark
     variant and won DOM order while hidden);
   - studygroups right-pane hint superset copy satisfying S8-H ("Select a
     group") and S9-S (the full reference sentence) simultaneously;
   - **sf-today-tint restored as the single today-tint contract** — light
     violet-50 softest branch + raw-rgb dark branch, satisfying the
     dark-mode rgb-serialization pin (the `/30` opacity modifier emitted
     `color-mix(in oklab)`), the forced-colors outline pin, and the
     exact-token locator pin at once;
   - notes mobile h2 hoisted out of the selected-note branch (the s52
     drawer flow found no heading at 390px in the unselected state).
5. **Evidence.** 34 screenshots captured from the running remediated build
   into `docs/screenshots/` (16 desktop views, the Settings Profile card
   chain, the mobile set including the open drawer, the login card).
6. **Docs.** `docs/remediation-plan.md` written (the full findings→fix→guard
   record); README Session-55 row added; `omni-study1_SKILL.md` regenerated
   (v2.0.0 — AP-91…AP-96, the chunk map, the security note, the session-55
   lessons) per the distill skills; the superseded `omni-study_SKILL.md`
   removed and the CLAUDE.md doc-chain pointer updated.

**Stage summary.**

- Final gates: lint ✓ · tsc ✓ · build ✓ (REAL_EXIT verified) · 834 unit ✓ ·
  298 e2e + setup ✓ — all on `main`, no branches.
- Commits this session: `5fdfd99` (s24–s26 + limiter) · `1356c52`
  (regression residuals) · `d3a1d74` (sf-today-tint + notes h2) · the final
  docs/worklog commit.
- Key standing guards added: the progressive limiter reset, the
  `sf-today-tint` utility contract, the exact-token locator rule, the
  status-gated two-layer hydration gate (re-verified), and the union-based
  nullable-ID atoms (re-verified).

---

## Session 56 (continuation 7) — fresh-clone re-verification; the lost S17 batch recovered; cold full regression

**Context.** The sixth workspace reset wiped the local tree; the remote
main survived at `3ccc6c8` (the session-55 docs chain intact). This session
re-cloned, rebuilt the push infrastructure (ed25519 key + paramiko GIT_SSH
shim in `/home/z/ssh-infra/`, host fingerprints pinned from GitHub's
published docs after the meta API rate-limited), and re-verified EVERY
recorded gate from scratch instead of trusting the session-55 "final
gates" claim.

**Work log.**

1. **Fast gates re-verified.** lint ✓ tsc ✓ unit 834/834 ✓ build
   (repo script, REAL_EXIT) ✓ — all green on the fresh clone.
2. **The full e2e sweep immediately contradicted the record.** S8-C
   failed (78/79): commit `d3a1d74` had collapsed the calendar cell's
   violet-100 pin into `sf-today-tint`'s violet-50 (S8-E's header value)
   and the S8 chunk was never re-run. Fixed with a sibling utility
   `sf-today-cell-tint` (light `--sf-primary-empty` = violet-100 237 233
   254; shared raw-rgb dark branch) — 115/115 across S7–S9 +
   dark-mode + accessibility + theme-system.
3. **The s17 family: specs survived, implementation didn't.** 5/6 tests
   failed from a fresh clone; the pinned strings never existed in src
   (`git log -S` showed them only in specs since the initial scaffolding).
   Implemented the whole batch TDD-style: the seven reference-measured
   empty-state hint families (+ the tasks hint no longer counting the
   "active" status default), analytics zero-state sub-captions
   (avg progress / total study hours / exams scheduled / No subject data
   yet), GradeTracker stat-cards-only zero state (Highest Grade "—" keeps
   the exact-"0%" pin single), the Settings depth (Appearance intro,
   Subjects/Holidays reference copy + headers, School placeholder, Daily
   Study Goal readout, Account created line), the Notifications
   master-toggle rebuild (local state + Save Preferences → PATCH +
   "Preferences saved." + reload persistence; remount-key resync — the
   setState-in-effect lint gate forced the better pattern), and the
   StudyGroups zero-state placeholder split (exact "Select a group" span
   + the full-sentence span, visible above the empty state in both panes
   — S8-H + S9-S + S17-G all satisfied). 6/6 green.
4. **Cold-start residuals the warm sweep had hidden.** resilience-A3:
   the mathsolver input was `accept="image/png,image/jpeg,image/webp"`
   (the spec targets `accept="image/*"`) and the guard toast copy was
   invented — fixed to the reference's. S16: the auth sub-screens shipped
   desktop values — h2 `text-xl sm:text-2xl`, the back link moved ABOVE
   the h2 on verify/forgot with the measured gaps (76px = 12+44+12+8;
   28px = 20+8; the link is `display:block` so the inline line-box
   descender cannot add 2px). s16 4/4, resilience 5/5.
5. **The RUM beacon never fired — ever.** A fresh-DB s18 run with a 20s
   poll still saw samples=0; a network probe showed ZERO /api/rum calls
   on a real Dashboard load. Root cause: `hasSessionCookie()` reads
   `document.cookie`, and the `sf_session` cookie is httpOnly — invisible
   to JS — so the gate was permanently closed and every prior "green"
   s18 was fed by other specs' POSTed batches. Gate removed (the
   authed-shell mount point is the auth gate). s18–s23 25/25.
6. **Spec hygiene (cold-start races, assertions unchanged).** s18's fixed
   3.5s sleep → bounded poll on samples≥1; the skip-link's fixed 400ms
   focus read → bounded poll on MAIN#main-content.
7. **Final certification.** Three chunks on the FINAL bundle with a cold
   server + fresh DB each: 149 + 98 + 54 = **301/301**; unit 834/834;
   lint/tsc/build clean. 13 new screenshots (`56-*.png`).
8. **Push infrastructure rebuilt + debugged.** The paramiko shim needed
   three fixes this session: the `-o` flag's separate value was parsed as
   the host (DNS error), the read-all-then-write stdin feed deadlocks a
   push (stream chunks instead), and the `makefile("rb")` stdout reader
   starved under git (raw `recv_ready()` polling). Insurance commits
   pushed after every green batch.

**Stage summary.**

- Final gates: lint ✓ · tsc ✓ · build ✓ (REAL_EXIT) · unit 834/834 ·
  e2e 301/301 (cold, fresh DB, 3 chunks) — all on `main`, no branches.
- Commits this session: `70be173` (the s17 batch + residuals + beacon
  fix) · the docs/worklog/screenshots commit.
- Standing lessons recorded: AP-97 (httpOnly cookie gates), AP-98
  (sibling tint utilities for divergent light pins), AP-99 (specs are
  the pin source — re-verify from a fresh clone), AP-100 (bounded polls
  over fixed sleeps).

---

## Session 57 (continuation 8) — sync + independent re-certification; no code changes

**Context.** The seventh continuation opened on a tree that was NOT reset
this time: local `main` held the full session-56 chain (`70be173` +
`7373c11`), appearing "ahead by 2" only because the local `origin/main`
ref was stale. The push attempt was rejected — the remote had moved to
`71b70ae` ("update session log", the user-side `docs/session_3.md`
addition) which already contained both session-56 commits. Fast-forwarded
to `71b70ae`; local == remote.

**Work log.**

1. **Read `docs/session_3.md`** — the user's own session-56 transcript;
   no new asks. Its "suggested next steps" (screenshot spot-check, live
   walkthrough, upstream re-sweep) remain optional enhancements.
2. **Environment verified intact** (no rebuild needed): node_modules,
   Prisma client, `.env` (`DATABASE_URL="file:../db/custom.db"`),
   `.env.example`, vitest + playwright configs, `db/e2e.db` scratch.
3. **Standalone build currency proven** — `find src prisma -newer
   .next/BUILD_ID` is empty, so the 04:08 build contains the final
   session-56 source (`70be173`); no rebuild required.
4. **All fast gates re-run from scratch**: lint ✓ · tsc ✓ · unit
   **834/834** ✓ — matching the record exactly.
5. **Full e2e re-certified on this machine**: stray-server kill, fresh
   `db/e2e.db`, three cold chunks — **151 + 95 + 55 = 301/301 GREEN**
   (2.2m / 1.3m / 47.5s), matching session-56's certification number
   for number.
6. **Deliverable inventory re-verified**: 13 `56-*.png` screenshots,
   SKILL.md v2.1.0, README Session-55/56 rows, remediation-plan Batch Q,
   worklog Sessions 55–56, `.env.example` committed.

**Stage summary.**

- No code changes this session — a pure verification pass. Every gate
  the record claims was independently reproduced and observed green.
- Remote `main` = local `main` = `71b70ae` (this worklog entry rides on
  top as the only new commit).
- The delegation's standing state: **lint ✓ tsc ✓ unit 834/834 ✓ e2e
  301/301 ✓ build ✓** — all on `main`, no branches.

---

## Session 58 (continuation 9) — sync, re-certification, and the reference drift check

**Context.** The workspace survived again. Local held the session-57
record; remote had moved to `31c54c9` (the user-side `docs/session_4.md`
addition, which already contained `e1763f8`). Fast-forwarded; local ==
remote. `session_4.md` is the user's saved transcript of session 57 —
no new asks, so this session executed the standing contract: independent
re-verification, plus the one outstanding "suggested next step" from the
session-3/4 notes that had never been done — **a live re-sweep of the
reference site** to confirm no upstream drift since session-53.

**Work log.**

1. **Fast gates re-run**: lint ✓ · tsc ✓ · unit **834/834** ✓; the
   standalone build proven still current (no src file newer than
   `.next/BUILD_ID`).
2. **E2E re-certified cold**: stray-server kill, fresh `db/e2e.db`,
   three chunks — **151 + 95 + 55 = 301/301 GREEN** (2.2m / 1.3m /
   45.4s), matching the record for the third consecutive session.
3. **The reference drift check (agent-browser, first since session-53).**
   Logged into `omni-study1.base44.app` with the delegated credentials,
   switched to a 390×844 mobile viewport, opened the mobile navigation
   drawer, and mapped its live structure:
   - Brand "StudyFlow" + "Your study companion" subtitle.
   - The 20-link nav in order: Dashboard, My Day, Tasks, Calendar,
     Events, Timetable, Assignments, Exams, Notes, Flashcards, Practice
     Tests, Study Groups, Grade Tracker, Analytics, Files, Calculator,
     Math Solver, AI Assistant, Focus Timer, Settings.
   - Footer: live clock ("05:12 AM" — the pinned 2-digit-hour 12-hour
     format), date, user avatar + name + email.
   - Fixed-position translucent drawer (ASIDE, white/80).
4. **Drift verdict: ZERO drift.** Every observed element matches the
   clone's `mobile-navigation.spec.ts` pins line-for-line — the same 20
   labels in the same order, the same brand block, the same clock regex
   (`^\d{2}:\d{2} (AM|PM)$`), the same drawer semantics. The reference
   dashboard also still shows the pinned greeting ("Good morning,
   … 👋"), Start My Day CTA, four stat headings, and the three content
   sections (Today's Tasks / Upcoming Exams / Upcoming Assignments).
   The delegation's mobile-nav / Tailwind-v4 concern is re-confirmed
   healthy: the clone already passes all 10 mobile-navigation specs
   against this exact structure.
5. **Evidence archived**: the two live reference captures saved as
   `docs/screenshots/58-ref-mobile-dashboard.png` and
   `58-ref-mobile-drawer-open.png`.

**Stage summary.**

- No code changes — verification + drift check only. All gates green
  on this machine: lint ✓ tsc ✓ unit 834/834 ✓ e2e 301/301 ✓.
- **Upstream parity confirmed current**: the reference site has not
  drifted from the clone's pinned contracts (mobile nav verified live;
  dashboard verified live).
- Remote `main` = local `main` (this entry rides on top). Still no
  branches; `skills/` still excluded from all checks.

---

## Session 59 (continuation 10) — the desktop drift check found (and fixed) the dead greeting name

**Context.** Synced to `2a64e09` (the user-side `docs/session_5.md`
transcript of session 58 — no new asks). This session executed the
standing re-verification AND the remaining suggested next step: the
**desktop surface drift check**. It found a real bug the mobile check
could not see.

**The bug (High, fixed TDD-style).**

- **Symptom (live, both warm and cold):** the clone's dashboard greeted
  every user "Good morning, **there** 👋" and the sidebar showed the
  "StudyFlow user" fallback — the reference greets by account name.
- **Root cause chain:** `publicUser()` (src/lib/server/auth.ts:66)
  deliberately serializes the DB's `fullName` as the wire field **`name`**
  (documented in the route comment), but the client `AppUser` type
  declared **`fullName`** — so `loadFromUser` read a field the wire never
  sends, `userName` stayed `""` forever, and `firstNameOf("")` fell back
  to "there". The type drift is exactly why tsc never caught it.
- **Fix (client-side only, wire contract respected):** `AppUser.fullName`
  → `AppUser.name` (store.ts, with a comment pinning the publicUser
  mapping), `loadFromUser` reads `user.name`, settings DisplayNameCard
  initial reads `user?.name`. Blast radius verified first: all API
  emitters use `publicUser` (me/login/verify-email/change-email/
  preferences), no other client consumer of `.fullName` existed, and NO
  spec pins the fallback strings — safe to change.
- **TDD:** new `tests/user-hydration.test.ts` written first against the
  real wire shape — red (1 failed) → fix → **3/3 green**. Full unit suite
  **837/837** (+3). lint ✓ tsc ✓.
- **Live verification:** rebuilt (repo build script, REAL_EXIT=0),
  relaunched the standalone server (the S22 boot guard correctly refused
  the first boot without AUTH_SECRET — generated a scratch 64-hex secret,
  process-env only), logged in, and observed "**Good morning, Demo 👋**"
  + sidebar "Demo Student" on the new bundle.

**Regression certification (post-fix bundle).** Fresh e2e DB, three
chunks: **151 + 95 + 55 = 301/301 GREEN** (the chunk-1 "150" was the
known cold-start skip-link race — passed solo and in the re-run).

**Desktop drift verdict.** Reference vs clone at 1440×900 across
Dashboard / Tasks / Analytics / Settings: same structural skeleton
(brand H1 + greeting, 4 stat H3s, 3 section H2s, 20-link nav; per-page
page titles identical). Content differs only by data (seeded demo vs the
reference's empty account). The reference renders section titles as
styled divs where the clone uses semantic h2 — an accessibility
improvement, consistent with the documented superset approach. Evidence
archived as nine `59-*.png` captures (both sides, all four surfaces).

**Stage summary.**

- One production bug fixed (the dead greeting name) + 3 unit pins.
- Gates: lint ✓ tsc ✓ unit **837/837** e2e **301/301** build ✓
  (REAL_EXIT).
- S22 boot guard observed working live (refused an AUTH_SECRET-less
  production boot, then booted clean with one).
- Still `main` only; `skills/` still excluded.

---

## Session 60 (continuation 11) — 7th workspace reset; full cold-start rebuild; drift coverage completed

**Context.** The seventh reset wiped the workspace AND `/home/z/ssh-infra/`.
Remote `main` survived at `82cbeb4` (the session-59 chain + the user-side
`docs/session_6.md` transcript — no new asks). Re-cloned per the
delegation and rebuilt everything from scratch.

**Work log.**

1. **Cold-start rebuild.** `npm ci` (install-scripts gated → explicit
   `prisma generate`), `.env` recreated
   (`DATABASE_URL="file:../db/custom.db"`), `db:push` + `db:seed`
   (`db/custom.db`, demo account ready), Playwright chromium binary
   re-downloaded (the wiped browser cache made the first chunk fail 150×
   with "Executable doesn't exist" — infrastructure failure, not source
   debt).
2. **Push infrastructure rebuilt + hardened.** ed25519 key from the
   delegation; paramiko shim re-authored with all three session-56 fixes
   (`-o` value consumed, streamed stdin feed, `recv_ready()` polling).
   Two new traps this time: (a) `pip` targeted the system Python 3.13
   while `python3` is the uv venv 3.12 — paramiko must go in via
   `python3 -m pip`; (b) the ed25519 fingerprint TYPED FROM MEMORY was
   wrong (`…krUUvCO5E` vs the real `…kr4UvCOqU`) — fetched the
   authoritative set from GitHub's docs page (the meta API rate-limited
   again) and cached it. Lesson re-confirmed: NEVER trust remembered
   fingerprints. `ls-remote` verified before any push.
3. **All gates re-certified from scratch** (AP-99): lint ✓ tsc ✓ unit
   **837/837** ✓ build ✓ (REAL_EXIT=0) · e2e cold: **151 + 95 + 55 =
   301/301**.
4. **One spec-hygiene hardening (cold-start race).** S8-G "notebook/tag
   filters" counted the two combobox triggers immediately after the
   theme-var `hydrated` gate — which covers the authed shell + theme but
   NOT the Notes collection round-trip. On a cold server the triggers
   mount a beat later (count 0 → flaky; passed 2-of-3 solo). Added
   `combos.first().waitFor({ state: "visible" })` before the count —
   assertions UNCHANGED (exactly two triggers, exact labels); 3/3 cold
   green after.
5. **Drift coverage completed** — the last three desktop surfaces,
   reference vs clone at 1440×900: Notes, Flashcards, Calendar.
   Calendar matches exactly (both render "October 2026"); Notes and
   Flashcards match structurally (page identity, layout skeleton), with
   content differences purely data-driven (seeded demo vs the
   reference's empty account). No upstream drift. Six `60-*.png`
   captures archived.

**Stage summary.**

- Gates on the fresh clone: lint ✓ tsc ✓ unit 837/837 e2e 301/301
  build ✓ (REAL_EXIT) — everything re-verified, nothing trusted.
- One flaky spec hardened (race removed, no assertion weakened).
- Drift evidence now covers: mobile nav (58) + desktop
  Dashboard/Tasks/Analytics/Settings (59) + desktop
  Notes/Flashcards/Calendar (60) — ALL surfaces, ZERO drift.
- Push infra: rebuilt with the venv-pip and fingerprint lessons; remote
  `main` = local `main` after this entry. Still no branches.

---

## Session 61 (continuation 12) — the first real-audit pass: Lighthouse found (and fixed) five a11y defects

**Context.** The workspace survived again; remote had moved to `de77e22`
(our two session-60 commits, already sync-promoted by the user, plus the
user-side `docs/session_7.md` — no new asks, but its "suggested next
steps" named the one never-done item: **a Lighthouse/perf pass on the
production build**). This session executed that, and the audit engine
found what sixty sessions of spec-driven gates could not.

**Work log.**

1. **Sync + re-certification.** Fast-forwarded to `de77e22`; fast gates
   re-run (lint ✓ tsc ✓ unit **837/837** ✓), build proven current (0
   source files newer than BUILD_ID), e2e cold **301/301**
   (151+95+55) — fourth consecutive session matching the record.
2. **The Lighthouse pass (first ever).** Production standalone on :3200
   (dev DB + scratch AUTH_SECRET), Lighthouse 13.5 desktop preset, the
   authed dashboard measured via cookie injection:
   /login **P93 · A11y 94 · BP 96 · SEO 100**;
   dashboard **P76 · A11y 90 · BP 96 · SEO 100** — with five concrete
   a11y findings: `heading-order` (h1→h3 skips: the overdue banner +
   the four StatCard values), `color-contrast` ×2 (the StatCard hint
   slate-400 on white = 2.56:1; the overdue pills red-600 on red-100 =
   3.95:1), `aria-prohibited-attr` (the roleless toast viewport's
   aria-label), and `landmark-one-main` (the standalone auth surface).
3. **All five fixed TDD-style.** accessibility Family E written first
   (5 pins: no-skip heading walk, the two computed-color pins, the
   named toast region, the one-main auth landmark) — red (4 failed) →
   fix → green. Fixes: banner h3→h2 + StatCard value h3→h2
   (class-identical swaps, zero visual delta); hint slate-400→slate-500
   (4.76:1; dark untouched — was already slate-500) on StatCard +
   GradeTracker; pills red-600→red-700 (5.32:1) on the dashboard badge
   + the shared DuePill; toast viewport `role="region"` (the radix
   pattern); login-surface root + both Suspense fallbacks div→main.
   The three pinned level-3 assertions (parity-session9 ×2, dark-mode
   ×1) updated with justification comments — visually identical tag
   swaps, the S26 p→div precedent.
4. **The landmark fix broke four specs — and the failures lied.** s16/
   s24/s25/s26 waited for `querySelector("main") !== null` after
   signing in through the login UI; the login page's own new `<main>`
   resolved the wait before the post-login redirect, and the next goto
   raced it into `net::ERR_ABORTED` (S16-A twice in chunk runs, S26
   once — both green solo, masquerading as cold-start flake). Root
   cause over flake-call: all four waits now target `main#main-content`
   (the shell's skip-link anchor). AP-102 recorded.
5. **Verified by the audit itself + the full suite.** Lighthouse
   re-audit: /login a11y **94 → 100**, dashboard a11y **90 → 100**
   (perf 75 = run-to-run noise on documented structural debt: LCP
   3.3s, TBT 700ms, CLS 0.00 — the RSC-conversion remedy noted in
   Batch R). Full cold re-run: **156 + 95 + 55 = 306/306** (the 301 +
   the five Family E pins); lint ✓ tsc ✓ unit **837/837** ✓ build
   REAL_EXIT=0 ✓.
6. **Evidence + docs.** `docs/lighthouse/` (before/after pairs, JSON +
   HTML, both surfaces); `61-clone-desktop-Dashboard.png` (the
   remediated dashboard); remediation-plan **Batch R** (R1–R6); README
   Session-61 row; SKILL.md **AP-101** (real audit tooling sees what
   spec suites forget) + **AP-102** (spec waits need semantically
   precise markers).

**Stage summary.**

- Five a11y defects fixed + one indirect spec-proxy regression killed;
  both audited surfaces at **a11y 100**.
- Gates: lint ✓ tsc ✓ unit **837/837** e2e **306/306** build ✓ — all
  on `main`, no branches; `skills/` still excluded.
- Remaining honest debt (documented, not hidden): the dashboard perf
  cost (structural client-bundle weight) and the reference-measured
  muted tokens on non-audited surfaces (calendar/myday/settings empty
  states) — the follow-up checklist is in Batch R.

---

## Session 62 (continuation 13) — the Lighthouse-equivalent sweep: ALL 20 views audited, 35 violations found and fixed

**Context.** The workspace survived; remote had moved to `6748510`
(our session-61 commits + the user-side `docs/session_8.md` — the
transcript of session 61: no new asks, but its suggested next steps
named the two documented debts — the non-audited surfaces' muted tokens
and the structural perf cost). This session executed the first and, in
doing so, extended the a11y-100 achievement from 2 surfaces to ALL 20.

**Work log.**

1. **Sync + re-certification.** Fast-forwarded to `6748510`; fast gates
   re-run (lint ✓ tsc ✓ unit **837/837** ✓), build proven current, e2e
   cold **306/306** (156+95+55) — fifth consecutive session matching
   the record.
2. **Family F — the Lighthouse-equivalent sweep.** Lighthouse's a11y
   category IS axe-core (13.x: tags wcag2a+wcag2aa + a 28-rule overlay,
   mirrored byte-for-byte from the installed 13.5.0 gatherer source).
   The 18 non-audited views are client-switched inside the single-route
   shell — unreachable by URL — so the new `tests/e2e/a11y-sweep.spec.ts`
   runs the SAME axe config on every authed view (20 tests, one per
   view, semantic mount markers per AP-102; axe-core added as an
   explicit devDependency). The Dashboard test doubles as the
   equivalence anchor: it must pass because real Lighthouse certified
   it at 100. First run: **17/20 views failed — 35 violations.**
3. **All 35 fixed TDD-style** (sweep red → source fix → sweep green;
   the full table is remediation-plan **Batch S**, S1–S8): the muted
   `text-slate-400` tokens on seven surfaces (the documented debt);
   heading-order h3→h2 class-identical swaps across ten views + the
   shared EmptyState (Settings alone carried 13); `sf-selected-tint`
   violet-500→violet-600 via `--sf-primary-strong` (white on violet-500
   = 4.23:1; the key insight: SOLID fills are axe-resolvable while the
   violet GRADIENT CTAs report unscored "incomplete" — which is why 61
   sessions of Lighthouse never saw it); exams/calculator badge tokens
   one step darker; `role="img"` on the two aria-labelled decorative
   blocks; the shared Slider's aria-label forwarded from Root to the
   radix THUMB (role="slider" lives there — axe aria-input-field-name
   ×6); the Calculator's two-`<Tabs>`-roots bug merged into one tree
   (every trigger's aria-controls pointed at a never-rendered panel id
   — a genuine screen-reader defect, axe aria-valid-attr-value
   [critical]; radix Tabs.Root renders no DOM, so the merge is
   DOM-identical); three label-content-name-mismatch fixes (Events
   "Create event" vs visible "New Event", dynamic filter labels
   "Filter tasks: All", the calculator key "Clear: AC" — axe STRIPS
   PARENTHETICALS from the name before matching, so "Clear (AC)" still
   fails; AP-104).
4. **Eight pinned values updated in-place with justification comments**
   (the R1/R3 precedent): S8-C ×2 (selected fill), S6-G (today cell +
   amber badge), S5-G (mode-switch tab), S9-F (mode-switch tab), S9-J
   (orange badge), S5-H (clear-key color); plus four locator updates
   where a fix legitimately changed an accessible name ("Filter tasks"
   → prefix-match ×4, the assignments filter ×1, the S8-K clear-icon
   locator, and the S5-B New-Event click now `.first()` — the removed
   mismatched aria-label unmasked the panel's own same-named text
   button).
5. **Verified by the audit itself + the full suite.** Family F 21/21
   green; full cold re-certification **176 + 95 + 55 = 326/326** (the
   306 plus the twenty sweep pins); lint ✓ tsc ✓ unit **837/837** ✓
   build REAL_EXIT=0 ✓. Lighthouse re-audit on the final bundle:
   /login **P100 · A11y 100**, dashboard **P98 · A11y 100** (perf =
   run-to-run variance on the documented structural debt — the RSC
   remedy stays in Batch R).
6. **Evidence + docs.** `docs/lighthouse/62-{dashboard,login}-after.json`;
   `docs/screenshots/62-clone-desktop-{Calendar,Settings,Calculator}.png`
   (the violet-600 selected states + the merged Tabs + the red-700
   clear key, verified visually); remediation-plan Batch S; README
   Session-62 row; SKILL.md **AP-103** (audit engines must cover the
   app's real navigation surface — mirror the auditor's own rule table
   and keep an equivalence anchor) + **AP-104** (axe strips
   parentheticals from accessible names before label-content-name
   matching).

**Stage summary.**

- All 20 authed views + both auth surfaces now certified against the
  Lighthouse rule set: **zero violations, by construction, permanently
  gated.**
- Gates: lint ✓ tsc ✓ unit **837/837** e2e **326/326** (176+95+55)
  build ✓ — all on `main`, no branches; `skills/` still excluded.
- One real functional bug fixed beyond the contrast/heading classes:
  the Calculator tabs' dangling aria-controls (S7) — found only because
  the sweep finally looked at the views Lighthouse couldn't reach.
- Remaining honest debt (unchanged, documented in Batch R): the
  structural perf cost of the client-bundle (RSC conversion of the
  read-only views) — the one candidate the sweep cannot absorb.

---

## Session 63 (continuation 14) — the live-clock greeting fix + the 5-view reference drift sweep

**Context.** The workspace was RESET an 8th time (fresh clone at
`975e251`); the user's new `docs/session_9.md` is the session-62
transcript — no new asks, its suggested next steps naming the RSC perf
conversion "or simply periodic re-certification". With a full environment
rebuild owed, this session executed the re-certification AND moved the
drift matrix to the five views never compared against the live reference
(MyDay, Events, Timetable, Assignments, Exams — s58 mobile, s59 four
desktop views, s60 three more). The reference's evening clock (~19:00
UTC) then exposed what 63 sessions of UTC-morning runs had masked.

**Work log.**

1. **Environment rebuild (8th recovery).** npm ci, prisma generate,
   `.env` from `.env.example` + `db:push`/`db:seed`, production build,
   chromium-1248 (npm ci had bumped Playwright past the cached
   chromium-1200 — the S60 lesson, reproduced), and the SSH-infra venv
   (paramiko 5.1.0; key fingerprint re-verified
   `3ddaNlFhMz1J…U4PU`).
2. **Independent re-certification of the received state.** lint ✓ tsc ✓
   unit 837/837 ✓; the audit confirmed every s62 fix in place
   (`sf-selected-tint` → `--sf-primary-strong`, the single Calculator
   Tabs root, Family F, the s59 `AppUser.name` contract). E2E cold
   326/326 (176+95+55) on the sixth consecutive session — after the
   chromium rebuild; the first chunk-1 attempt died wholesale on the
   missing browser binary (the "1 passed" mass failure decoded in one
   step).
3. **Family G — the greeting is time-of-day aware (T1).** The reference
   at 19:08 rendered "Good evening, sepnetflix2023 👋" and its MyDay
   zero-task state "Good evening!" (captured); the clone rendered "Good
   morning, Demo 👋" at the same clock — both greeting sites fed
   `greetingForHour` the day-anchor `startOfDay(new Date())` whose
   `getHours()` is always 0, since the ORIGINAL implementation. Fixed
   with `currentGreeting()` (live clock) + a new
   `tests/e2e/greeting-clock.spec.ts` pinning all three dashboard
   buckets and the MyDay evening empty state via `page.clock.setFixedTime`
   — deterministic at any wall-clock hour (RED 3 → GREEN 5/5). Live
   verified: "Good evening, Demo 👋" at 19:35.
4. **The 5-view drift sweep, probe-verified.** Every finding was
   measured on the live reference before fixing (the evidence set:
   `63-ref-desktop-*.png` + three interactive probes — the Events
   carousel step, the two selects' options, and a create-probe-delete
   exam cycle for the count semantics; the reference account left
   clean):
   - **T2** Events CW: ISO 42 → the reference's US Sunday-start **43**
     (carousel-verified via Sat → 42) — new `referenceWeekNumber()`.
   - **T3** Events day headings "Tue, Oct 20" → "Tuesday, October 20".
   - **T4** the Timetable grid misaligned weekday labels vs dates
     ("Sunday 12" for a Monday; today-tint on the column labeled
     "Saturday 18") — Monday-anchored `weekStart` under Sunday-first
     labels; ONE root fix (Sunday-anchored week) aligned the range
     ("Oct 18 - Oct 24"), every head date, the tint and the mobile
     accordion's open day; storage `dayOfWeek` semantics untouched.
   - **T5** three clone-invented subtitles replaced with measured copy
     (Timetable "Manage your class schedule", Assignments "Track your
     homework and projects", Exams **"<n> upcoming · <m> this week"**
     live counts — semantics measured: upcoming = daysUntil ≥ 0, week
     = ≤ 6).
   - **T6** the Exams header gained the reference's **All Exams /
     Upcoming / Past** status filter (default Upcoming; `aria-label` on
     the TRIGGER per the Week-filter pattern).
   - **T7** three-dot search placeholders.
   Seven new pins RED-first (7 failed / 56 passed in their chunks) →
   GREEN; the fixes are Batch T in the remediation plan.
5. **Deferred with probes recorded** (Batch T tail): the Events
   DAY-FOCUS carousel (‹ ○ › ∨ — CW + big date track the focused day),
   the Timetable centered month/week banner, the Assignments
   subject-filter select. Structural; the next session can implement
   against the recorded facts.
6. **A trap refined into lesson 9.** The "stale server" that kept
   serving the OLD bundle through two rebuilds: Next renames the
   standalone server's process title to `next-server (vNNN)`, so
   `pkill -f "standalone/server.js"` silently matches NOTHING and the
   new boots die EADDRINUSE in an unread log. `pkill -f next-server` /
   kill by port-owner PID. (Remediation-plan Standing Lessons 9 refined
   + 11/12 added: the day-anchor vs live-clock rule and the
   fake-clock-pin rule; SKILL.md AP-105/AP-106.)
7. **Verified.** lint ✓ tsc ✓ unit **842/842** (839 + the 3
   `referenceWeekNumber` pins); build REAL_EXIT=0; full cold
   re-certification **184 + 98 + 55 = 337/337** on the final bundle.
   Live captures: `63-clone-desktop-{Events,Timetable,Assignments,
   Exams}-fixed.png` + `63-clone-desktop-dashboard-evening-greeting.png`
   + `63-clone-desktop-MyDay.png` vs the `63-ref-desktop-*.png` probe
   set (12 captures). Docs: Batch T + Standing Lessons 9/11/12,
   README Session-63 row, SKILL.md AP-105/106, AGENTS counts
   (842/337 — the first count update since session-56).

**Stage summary.**

- One production-grade behavioral bug fixed (the frozen greeting — the
  app's most visible string was wrong every afternoon and evening since
  the original implementation) + one convention bug (the CW label) +
  one layout-convention bug (the Timetable alignment) + the reference's
  Exams status filter adopted; seven new permanent pins.
- Gates: lint ✓ tsc ✓ unit **842/842** e2e **337/337** (184+98+55)
  build ✓ — all on `main`, no branches; `skills/` still excluded.
- Remaining honest debt: Batch R's structural perf (RSC conversion),
  plus the three probed structural drifts recorded in Batch T's
  deferred section (Events carousel, Timetable banner, Assignments
  subject filter) — each with its measured behavior documented for the
  next session.

## Session 64 (continuation 15) — the three Batch-T deferred structural drifts implemented (Batch U)

**Context.** The workspace was RESET a 9th time (fresh clone at
`38fd29e`); the user's `docs/session_10.md` is the session-63 transcript —
no new asks, its suggested next steps naming "implement the three probed
structural drifts (Events day-focus carousel, Timetable centered week
banner, Assignments subject filter — facts recorded in Batch T)" FIRST,
then the Batch-R RSC conversion. This session executed that first option
against fresh reference measurements.

**Work log.**

1. **Environment rebuild (9th recovery).** npm ci (489 pkgs), prisma,
   `.env` from `.env.example` + `db:push`/`db:seed`, production build,
   chromium re-download (Playwright 1.64.1 outgrew the cached
   chromium-1200 — the S60/S63 lesson, reproduced a third time), and the
   SSH-infra venv (paramiko; key fingerprint re-verified
   `3ddaNlFhMz1J…U4PU`; the runbook's Appendix-A shim deployed to
   `/home/z/ssh-infra/ssh` — ls-remote round-trip green before any work).
2. **Independent re-certification of the received state.** lint ✓ tsc ✓
   unit **842/842** ✓; the audit confirmed every s63 fix in place
   (`currentGreeting()` at both call sites, `referenceWeekNumber()`, the
   Timetable Sunday-start anchor + accordion, the Exams live-count
   subtitle + status filter, the s59 `AppUser.name` contract). E2E cold
   **337/337** (184+98+55) on the seventh consecutive session.
3. **Fresh reference probes (the Batch-T facts re-verified + extended).**
   The carousel step (‹ from Sun Oct 18 → big date 17 / Sat / CW 42; the
   list re-anchors with "Saturday, October 17" first, then "Today" — the
   relative labels belong to the REAL today, not the window index); ○ is
   a jump-home; ∨ shows no observable effect on the empty account (the
   clone implements it as an aria-expanded day-list collapse — the a11y
   superset, invisible by default); the header's measured 3-row strip
   (overline + controls / big-date baseline row / FULL-WIDTH cyan New
   Event, h-9) and the page header carrying NO CTA (the clone's gradient
   button was invented); the Timetable banner's month convention probed
   across a boundary (Sep 27 - Oct 3 → "September 2026": the FIRST day's
   month) and the chevrons' computed 6px radius; the Assignments two-row
   header (search flex-1 604px @1440 | status select w-160 | subject
   select w-160), the status options measured All/Active/Completed in
   that order, and the subject select's options deriving from the
   account's Subject entities (empty account → "All Subjects" alone).
4. **TDD Batch U.** 9 new pins written first (S5-U1 ×4 in
   parity-session5, S5-U2 ×2 in parity-session5, S8-U3 ×3 in
   parity-session8) — **RED 9 failed / 1 setup passed** exactly as
   designed. GREEN: the Events `focused` state + 4 aria-labeled controls +
   `listOpen` collapse + the measured strip + `daysUntil`-based relative
   labels + `referenceWeekNumber(focused)` + the page CTA removal; the
   Timetable `aria-label="Week banner"` group card with the nav moved in
   and the first-day-month h2; the Assignments two-row restructure, the
   status DropdownMenu → Select (keeping the `Filter assignments by
   status: …` label the S9-I prefix pin keys on) and the new Subject
   filter Select filtering by `a.subjectId`.
5. **One committed pin corrected with its measurement (AP-108).** The S8-E
   chevron-radius pin (8px) failed in chunk 2 — the probe showed the
   REFERENCE computes 6px (`rounded-md`); the 8px expectation had encoded
   the clone's own `rounded-lg` drift. Updated 8px → 6px with the probe
   documented in-place (corrected to the measured value, never weakened).
6. **Verified.** lint ✓ tsc ✓ unit **842/842** ✓; build REAL_EXIT=0;
   full cold re-certification **190 + 101 + 55 = 346/346** on the final
   bundle. Live verification on the production standalone: step →
   "17 / Sat / CW 42" + the re-anchored heads, ○ jumps home, the banner
   renders "September 2026 / Sep 27 - Oct 3" across the boundary and
   returns, the subject filter narrows to the 2 seeded math rows and
   restores. Captures: `64-ref-desktop-{Events,Events-banner,Timetable,
   Assignments}.png` + `64-clone-desktop-{Events,Events-carousel,
   Timetable-banner,Assignments-filter}.png` (8). Docs: Batch U in the
   remediation plan, README Session-64 row, SKILL.md AP-107/108, AGENTS
   counts (842/346).

**Stage summary.**

- All three Batch-T deferred structural drifts implemented against their
  recorded probes + fresh measurements; one invented CTA removed; one
  status control converted to the reference's select chrome; one drift-
  encoding pin corrected to the reference-measured value; nine new
  permanent pins.
- Gates: lint ✓ tsc ✓ unit **842/842** e2e **346/346** (190+101+55)
  build ✓ — all on `main`, no branches; `skills/` still excluded.
- Remaining honest debt: Batch R's structural perf (RSC conversion) is
  now the LAST open item from the remediation plan; the drift matrix now
  covers every view checked across s58–s64 with no known visual drift.

## Session 65 (continuation 16) — the zero-state + stat-card drifts (Batch V): the 20-view drift matrix completed

**Context.** The workspace was RESET a 10th time (fresh clone at
`41239bc`); the user's `docs/session_11.md` is the session-64 transcript —
no new asks; the newer remote commit (`41239bc`) was a v2→v5.1 restructure
of `docs/replicate-web-app_SKILL.md` (general methodology, no new asks for
this repo). This cycle's value-add was chosen from the coverage map: the
s58–s64 sweeps had covered 16 of the 20 authed views — My Day, Grade
Tracker, Practice Tests and Study Groups were never probed. This session
probed all four, completing the matrix, and fixed every drift found TDD-
style (Batch V).

**Work log.**

1. **Environment rebuild (10th recovery).** npm ci (489 pkgs), prisma,
   `.env` + `db:push`/`db:seed`, production build (the first build was
   reaped — the S32 `setsid` subshell recipe), chromium-1248 matching
   Playwright 1.64.1 (the version-mismatch lesson, reproduced a 4th
   time), and the SSH-infra shim: the runbook's parse_args had a real
   bug (`else: host = a` overwrote the host with the command string) —
   fixed in `/home/z/ssh-infra/git_ssh_shim.py`; ls-remote round-trip
   green (key fingerprint re-verified) before any work.
2. **Independent re-certification of the received state.** lint ✓ tsc ✓
   unit **842/842** ✓; e2e cold: chunk 1 **189/190 + 1 known first-chunk
   cold-start race** (solo re-run green — not a regression); chunk 2
   first failed on the s22 negative-spawn guard — root cause the S46
   class again: the repo `.env`'s REAL AUTH_SECRET got bundled into
   `.next/standalone/.env` at build time, so the guard CORRECTLY boots;
   `.env` reset to `AUTH_SECRET=""` (dev fallback posture) and the
   bundle rebuilt; chunk 3 first hit the aged-DB class (s23 fixed-id
   envelope) — `rm -f db/e2e.db` and cold re-run → **101/101 + 55/55**;
   effective total **346/346**.
3. **The matrix-completion sweep (4 never-probed surfaces).** Reference
   fingerprints captured (empty account, desktop): My Day, Grade
   Tracker, Practice Tests, Study Groups + Settings control. The
   subtitle sweep found 2 copy drifts (Grade Tracker, Practice Tests);
   the empty-state sweep (fresh registered user, the s17 recipe) found
   the My Day early-return drift and the Study Groups pane-role swap;
   the seeded Grade Tracker needed an authorized gated write probe (the
   s64 precedent: create → measure → delete → verify zero residue) —
   the reference's seeded row is THREE cards with NO sub-captions and
   NO Highest Grade, plus subject progress rows + "Recent Grades". The
   probe's cleanup surfaced a REFERENCE-side dangling record (deleting
   the probe subject cascade-removed its grade but an orphan grade
   persisted; no UI delete path) — an endpoint-learning probe
   (intercepting the UI's own create call) captured the entity API
   (`/api/apps/{id}/entities/{Entity}`, Bearer JWT from localStorage)
   and deleted both records through it; zero residue verified (0
   grades, 0 subjects); the Grade entity schema captured.
4. **TDD Batch V.** 5 new pins written first (S5-V1/V2 in
   parity-session5, S17-V1/V2/V3 in s17-fresh-user) — RED as designed
   (one pin's own locator chain fixed during RED: the CTA button is a
   sibling of the h3, not a child). GREEN: the My Day early return
   removed — the amber greeting block now renders BELOW the header +
   quick-add chrome; the Grade Tracker row re-measured to the
   reference's 3-card `md:grid-cols-3` (Highest Grade deleted, hints
   deleted, `text-4xl` values, emerald-500/blue-500 icons, subtitle
   "Monitor your academic performance"); the Practice Tests subtitle
   ("Test yourself with practice exams"); the Study Groups EmptyState +
   gradient Create Group CTA moved into the LIST panel, the right pane
   rebuilt as the bold hint (`text-xl/600` h3 + `max-w-sm` p, `py-16
   px-4`), + button `rounded-xl` → `rounded-md` (measured).
5. **Verified.** lint ✓ tsc ✓ unit **842/842** ✓; affected files green;
   full cold re-certification **192 + 104 + 55 = 351/351** on the final
   bundle, zero flakes. Live comparison on the production standalone:
   clone fingerprints now match the reference on all four surfaces
   (seeded + empty). Lighthouse re-certified a11y **100** on both
   surfaces (`65-{dashboard,login}-after.json`); the CWV budget audit
   refreshed the Batch-R deferral evidence — the clone ships 183–297KB
   JS with LCP GOOD everywhere while the live reference ships 1232KB
   total / 771KB JS and its login-mobile LCP is POOR (9452ms).
   Captures: `65-ref-desktop-*.png` (6) + `65-clone-desktop-*.png` (9);
   17 probe scripts preserved (`scripts/*-s65.mjs`). Docs: Batch V in
   the remediation plan, README Session-65 row, SKILL.md AP-109, AGENTS
   counts (842/351).

**Stage summary.**

- The 20-view drift matrix is COMPLETE (s58–s65): every authed view has
  now been fingerprint-compared against the live reference on desktop
  (and the high-traffic set on mobile); all four new-surface drifts
  fixed TDD-style; five new permanent pins (S5-V ×2, S17-V ×3).
- Gates: lint ✓ tsc ✓ unit **842/842** e2e **351/351** (192+104+55)
  build ✓ Lighthouse a11y 100×2 — all on `main`, no branches; `skills/`
  still excluded.
- Remaining honest debt: Batch R's structural perf (RSC conversion) —
  now carrying fresh CWV evidence that the clone outperforms the live
  reference on every probed surface (183–297KB vs 771KB JS; ref
  login-mobile LCP POOR at 9452ms) — remains the LAST open item, with
  its deferral evidence refreshed this cycle.
- New AP: **AP-109** — when the reference UI has no path for an
  operation (or a dangling record blocks cleanup), intercept the UI's
  own network calls to learn the entity API + auth scheme, then drive
  the API directly; a reference account is stateful and its residue is
  OURS to clean (zero-residue verification is part of the probe).

## Session 66 (continuation 17) — the reference-unchanged re-sweep + the Events zero-state drift (Batch W) + the register-budget lesson

**Context.** Workspace PRESERVED from s65 (first no-reset cycle); the
user's `docs/session_12.md` is the s65+66 transcript — no new asks; the
new remote commit (`b65e454`) added the transcript plus a `skills/`
restructure (new `full-page-screenshot` skill, rewritten
`agent-browser` SKILL — excluded from checks). This cycle: re-certify
the received state, re-sweep the reference for upstream drift, fix any
gap TDD-style.

**Work log.**

1. **Sync + decode.** `git pull --ff-only` → `b65e454` (session_12.md +
   skills/ only); `docs/session_12.md` read — state: Batch V pushed as
   `8b84dae`, 351/351 + 842/842, its suggested next step = gate re-run +
   reference re-scan (or Batch R).
2. **Environment verified preserved.** node_modules, chromium-1248,
   build fresh per AP-70 (`find src prisma -newer .next/BUILD_ID`
   empty), dbs present, the paramiko shim green (`GIT_SSH_COMMAND=
   /home/z/ssh-infra/ssh` — the `git_ssh_shim.py` PATH wrapper is the
   WRONG recipe; the direct paramiko shim is the working one).
3. **Independent re-certification of the received state.** lint ✓ tsc ✓
   unit **842/842** ✓; e2e cold on fresh servers: **192 + 104 + 55 =
   351/351** zero flakes — chunk 1 green first try this cycle (no
   cold-start race), `.env` verified at the dev posture
   (`AUTH_SECRET=""`, length-2 guard).
4. **The reference re-sweep (new probe class).**
   `scripts/ref-resweep-s66.mjs` — logs into BOTH hosts, fingerprints 7
   desktop surfaces (dashboard/myday/gradetracker/practicetests/
   studygroups/events/settings) and evaluates the s63–s65 measured
   invariants IN-SCRIPT (18 checks: 9 reference + 9 clone via a fresh
   registered user). First run: reference **9/9 UNCHANGED since s65**;
   clone 8/9 — the clone's EMPTY Events page rendered NO day-focus
   strip at all.
5. **Isolation + reference measurement.** `clone-events-check-s66.mjs`
   (no strip, no CW, no controls at zero) + `ref-events-zero-s66.mjs`
   (the reference at zero: "EVENTS" overline + 4 controls, big date 19
   / Mon, "Oct 2026 CW 43", Today/Tomorrow + 5 dated heads each "No
   events.", full-width New Event — NO empty card). Root cause: the
   S17-era `events.length === 0 ? EmptyState : panel` early return —
   Batch U rebuilt the strip inside the NON-zero branch, so the seeded
   pins never walked the zero path. The strip is DATE-driven, not
   data-driven.
6. **TDD Batch W.** S17-W pins written RED (2 failed as split), the
   early return removed (the panel now renders unconditionally; the
   day list already prints "No events." per empty day; the EmptyState
   branch + its import deleted), GREEN; affected files re-run green.
   The W family then merged into ONE test/ONE registration after the
   budget finding (below); final pin: strip chrome + CW + 7×"No
   events." + New Event AND the invented card absent.
7. **The register-budget finding.** The full chunk-2 first failed its
   LAST test with `register failed: 429`. Isolation: solo runs green;
   curl experiment on a fresh server = 10×201 then 429 (the limiter is
   exactly 10/IP/15min); the failed chunk run's DB holds exactly 9
   successful registrations — the suite had ZERO headroom (S9's 2 +
   s17's 8 = 10/10). Fix: one merged W registration → chunk 2 spends
   9/10 (documented in the spec's design comment); standing rule —
   never design a suite to exactly exhaust a shared time-windowed
   budget.
8. **Verified.** lint ✓ tsc ✓ unit **842/842** ✓; build REAL_EXIT=0
   (fresh bundle); full cold re-certification **192 + 105 + 55 =
   352/352** on fresh servers (pkill before each chunk — the
   reuseExistingServer bucket-inheritance class); the re-sweep then
   reports **18/18 invariants green**. Captures: `66-ref-desktop-*.png`
   ×8 (incl. events-zero) + `66-clone-desktop-*.png` ×7 + mobile pair;
   probe scripts `ref-resweep-s66.mjs`, `clone-events-check-s66.mjs`,
   `ref-events-zero-s66.mjs`. Docs: Batch W in the remediation plan,
   README Session-66 row, SKILL.md AP-110, AGENTS counts (842/352).

**Stage summary.**

- The reference is UNCHANGED since s65 on every measured dimension; the
  one new gap (Events zero-state — the last unknown the matrix left)
  found and fixed TDD-style with one permanent pin (S17-W).
- Gates: lint ✓ tsc ✓ unit **842/842** e2e **352/352** (192+105+55)
  build ✓ — all on `main`, no branches; `skills/` still excluded.
- New AP-110: a shared time-windowed rate limiter is a SUITE-WIDE
  budget — count every consumer across chunks, keep ≥1 slot of
  headroom, and boot each chunk against a fresh server
  (reuseExistingServer inherits partially-spent buckets).
- Remaining honest debt: Batch R's structural perf (RSC conversion) —
  the clone already outperforms the live reference on the CWV evidence
  (183–297KB vs 771KB JS; ref login-mobile LCP POOR 9452ms).

---

## Session 67 (continuation 18) — the 11th workspace reset; the brand-header typography drift (Batch X) + the mobile-nav probe-resolution lesson

**Context.** The workspace was reset an 11th time (everything under
`/home/z/my-project` wiped — repo, ssh-infra, playwright cache). The
user's `docs/session_13.md` is the s66 transcript — no new asks; its
suggested next step = repeat the gate+re-sweep rhythm (or Batch R).
This cycle: rebuild the environment from scratch, re-certify the
received state, re-sweep the reference, deep-dive the user-flagged
mobile navigation.

**Work log.**

1. **Environment rebuilt from zero.** Fresh clone at `bb729e4` (the
   s66 docs commit); `bun install` (489 pkgs); paramiko 5.1.0 +
   chromium-1243; the paramiko ssh shim re-extracted BYTE-EXACT from
   the how-to doc's Appendix A into `/home/z/ssh-infra/ssh` (shebang →
   the venv python) — `ls-remote` pre-flight green against the SSH
   remote; `.env` restored from `.env.example` (dev posture,
   `AUTH_SECRET=""`); `db/custom.db` pushed + seeded; build
   REAL_EXIT=0.
2. **Independent re-certification of the received state.** lint ✓
   tsc ✓ unit **842/842** ✓; e2e cold across all 30 spec files in a
   re-derived 3-chunk/5-sub-run map (chunk 1 split a/b/c to stay under
   the shell timeout, no day boundary crossed between sub-runs):
   **64 + 85 + 91 + 56 + 58 = 354/354** zero flakes, zero retries —
   chunk 2's register spend 9/10 (the AP-110 census re-verified: s9=2
   call sites, s17=7 after the W merge).
3. **The reference re-sweep (s66 probe class, s67 tag).**
   `scripts/ref-resweep-s67.mjs` — **18/18 invariants green** (9 ref +
   9 clone): the reference UNCHANGED since s65 on every measured
   dimension; the clone matching everywhere incl. the Batch-W Events
   zero state. Generic mobile-drawer probe fails identically on both
   sites (documented heuristic weakness).
4. **The mobile-nav deep-dive (user-flagged surface).** The generic
   probe's failure root-caused with a diagnostic probe: the reference
   hamburger is an UNLABELED icon button (`aria-label` absent) in a
   fixed glass header, and its drawer mounts neither `role="dialog"`
   nor `data-state` — the clone's "Open navigation menu" aria-labels
   and Radix-style dialog semantics are the documented a11y superset.
   A REAL Playwright click opens the reference drawer fine (screenshot
   `67-ref-mobile-drawer-open.png`); the probe's own selectors were
   the weakness. Tailwind v4 trap check: no `color-mix` serialization
   on either site's drawer surfaces.
5. **The brand-header drift found + measured.** Side-by-side drawer
   screenshots exposed a wrap difference: the clone's "Your study
   companion" subtitle broke onto TWO lines. Escalated to a
   TreeWalker node dump (`brand-node-dump-s67.mjs` — every matching
   text node with computed styles + DOM path + class string):
   reference desktop brand = `h1.text-lg` (18/28), app-bar brand =
   `span` text-base (16/24), drawer = text-base/text-xs. Clone had
   `text-lg leading-tight` on the desktop title (right size, crushed
   lh 22.5 vs 28), `text-xs leading-tight` subtitle (15 vs 16), and
   text-lg/text-sm on the mobile surfaces (18/22.5 + 14/wrapped where
   the reference renders 16/24 + 12/one-line). An earlier probe's
   16px desktop read was a MIS-MEASUREMENT (unscoped `.pop()` of a
   two-node query) — caught by probe-vs-probe disagreement BEFORE
   pinning, resolved by the node dump (AP-111).
6. **TDD Batch X.** S3-H (desktop sidebar brand typography) + S3-I
   (drawer brand typography incl. the single-line subtitle box +
   app-bar brand as part 1) written RED — the S3-G name collision
   with the existing Start-My-Day CTA pin caught during RED and
   renamed. GREEN: size+lh corrected on all three surfaces
   (`mobile-chrome.tsx` drawer + app bar, `sidebar.tsx`) — every
   value byte-equal to the node dump. Affected files re-run green.
7. **Verified.** lint ✓ tsc ✓ unit **842/842** ✓; build REAL_EXIT=0
   (fresh bundle); full cold re-certification **64 + 86 + 92 + 56 +
   58 = 356/356** on fresh servers (the earlier 85/1b read was a
   tail-truncation artifact — re-run measured 86); the node dump
   re-run post-fix shows clone == reference on every surface; the
   fixed drawer captured (`67-clone-drawer-brand-fixed.png`).
   Captures: `67-ref-*` ×7 desktop + `67-clone-*` ×7 desktop + mobile
   pairs + drawer-open + brand-fixed + diagnostics (21 files).
   Probe scripts: `ref-resweep-s67.mjs`, `mobile-nav-compare-s67.mjs`,
   `ref-mobile-diag-s67.mjs`, `drawer-brand-compare-s67.mjs`,
   `sidebar-brand-compare-s67.mjs`, `brand-node-dump-s67.mjs`,
   `captures-s67-final.mjs`. Docs: Batch X in the remediation plan,
   README Session-67 row, SKILL.md AP-111, AGENTS counts (842/356).

**Stage summary.**

- The reference remains UNCHANGED since s65; the one new gap (the
  brand-header typography across sidebar + app bar + drawer — found by
  the mobile-nav deep-dive the user keeps flagging) fixed TDD-style
  with two permanent pins (S3-H, S3-I).
- Gates: lint ✓ tsc ✓ unit **842/842** e2e **356/356**
  (64+86+92+56+58) build ✓ — all on `main`, no branches; `skills/`
  still excluded.
- New AP-111: when probes disagree, dump ALL candidate nodes with DOM
  paths and pin from the path-identified node — never from an
  unscoped `.pop()`; a mis-measurement caught pre-landing (AP-108)
  never becomes a pin.
- Remaining honest debt: Batch R's structural perf (RSC conversion) —
  the s65 CWV evidence still stands (clone 183–297KB JS / LCP GOOD
  everywhere vs reference 771KB JS / login-mobile LCP POOR 9452ms).

## Session 68 (continuation 19) — the preserved-workspace cycle; the nav-chrome + dashboard drifts found by the extended invariant sweep (Batch Y)

**Context.** The user's `docs/session_14.md` is the s67 transcript —
no new asks; its suggested next step = repeat the gate+re-sweep rhythm
(or Batch R). This cycle: refresh, re-certify, re-sweep — and the
sweep, EXTENDED with the Batch-X brand invariants, caught the next
drift layer. First preserved-workspace cycle since s66 (no reset).

**Work log.**

1. **Workspace refreshed.** `git pull --ff-only` fast-forwarded
   `5211468..1ad5b89` (the session_14.md transcript commit). The
   environment survived intact (deps, chromium-1243, `.env` posture,
   fresh build, db) — only the SSH deploy key needed re-provisioning
   (shredded post-push last cycle); `ls-remote` pre-flight green.
2. **Alignment validated.** Batch X in-tree (sidebar/mobile-chrome +
   S3-H/S3-I pins); doc chain (session_14 + remediation-plan Batch W/X
   + worklog Session 67 + AGENTS/CLAUDE/README/SKILL) consistent with
   the codebase.
3. **Batch X audited** via the repo's code-review-checklist skill
   (Standards + Spec axes on the `bb729e4..5211468` diff): zero
   findings — the diff matches the node-dump truth table, pins RED-first
   with exact-token locators, docs synced.
4. **Gates re-certified cold on the received state.** lint ✓ tsc ✓
   unit 842/842 ✓; e2e across the 5-sub-run map (fresh `db/e2e.db` +
   fresh server per chunk): 74+72+96+56+58 = **356/356** zero flakes.
5. **The reference re-sweep, extended (s68 tag).** The s67 sweep class
   + the Batch-X brand table as standing invariants (desktop sidebar
   18/28 + 12/16 via TreeWalker; app-bar 16/24; drawer brand + one-line
   subtitle). The mobile probe initially reported drawers CLOSED on
   both sites — two probe-logic bugs (AP-112: `.find()` grabbed the
   hidden sidebar's link; `.fixed button` matched the hidden aside's
   chevron), fixed with visibility-scoped evaluateAll + a DOM-click
   route. 18/18 original invariants green; desktop brand table green
   on both hosts — and the side-by-side drawers exposed the next layer.
6. **Batch Y found + fixed TDD** (pins first, RED confirmed: 5 failed /
   54 passed):
   - Y1 six nav icons (NAV_ICONS re-dumped; the Practice Tests glyph
     path-identical under the lucide rename) — S8-Y pins the full
     20-entry map;
   - Y2 the active pill is the FULL 48px row (padding moved from the
     `<a>` onto the chip span) — S3-J;
   - Y3 nav rows FLUSH 48px (the reference's `space-y-1` class is dead
     on its markup; the clone's `gap-1` modeled the string, not the
     render) — S3-J/K/L pitch pins;
   - Y4 desktop header `p-6 border-b` 109px (subtitle wraps) +
     collapsed 85px left-aligned chevron — S3-J/S3-K;
   - Y5 drawer brand block `p-6 border-b` 89px, rows start y=105 —
     S3-L;
   - Y6 footer `border-t p-4` + the 24px/700 statement clock — S3-J;
   - Y7 app-bar clock 500/slate-600 — S3-L part 1;
   - Y8 dashboard stat hints/icons/gradients + the Focus Time semantic
     (month-hours via the new `formatFocusHours`/`isSameMonth` seams,
     unit-pinned) — S4-K + date.test.ts;
   - Y9 the hero CTA is an anchor with a sparkles icon (Button asChild;
     4 button-locator pins corrected per AP-108).
   - The a11y-vs-parity call documented: the reference's slate-400
     subtitle (2.56:1) stays slate-500 (4.76:1) in the clone — the
     Batch-R/S seven-surface family's own call.
7. **Verified.** lint ✓ tsc ✓ unit **844/844** ✓; build REAL_EXIT=0;
   full cold re-certification **74 + 76 + 97 + 56 + 58 = 361/361** on
   fresh servers (chunk-2 register spend 9/10 unchanged); the s68 sweep
   reports **ok:true** (18 invariants + desktop brand + drawer-open +
   bar/drawer brand green on BOTH hosts); post-fix node dumps:
   desktop/drawer pitch 48/48, drawer rows start 105/153/201
   (byte-equal); corrected dashboard + drawer captured.

**Stage summary.** HEAD = the Batch-Y commit. Baselines: e2e **361/361**
(74+76+97+56+58, 30 spec files), unit **844/844**, Lighthouse a11y
anchor green via the Lighthouse-equivalent sweep (21/21). New pins:
S8-Y, S3-J, S3-K, S3-L, S4-K (+2 unit seams). New lesson AP-112 (probe
visibility scoping). Remaining honest debt: Batch R's structural perf
(RSC conversion) — the s65 CWV evidence still stands (clone 183–297KB
JS / LCP GOOD everywhere vs reference 771KB JS / login-mobile LCP POOR
9452ms).

## Session 69 (continuation 20) — the 13th workspace reset; the screenshot-sweep drift layer (Batch Z): dashboard sections, My Day column, view-header icons, Events bands, the Settings Appearance card

**Context.** The user's `docs/session_15.md` is the s68 transcript —
its suggested next step = repeat the gate+re-sweep rhythm (or Batch R).
This cycle: the workspace came back RESET (fresh clone), so the cycle
re-provisioned everything, re-certified the received state, ran the
s69 sweep, and the side-by-side screenshot pairs exposed the next
drift layer (Batch Z).

**Work log.**

1. **Workspace refreshed from scratch.** Fresh clone → HEAD `f0d01b1`
   (the session_15 transcript commit on top of Batch Y `7f24fe7`).
   Environment re-provisioned: bun install (489 pkgs), `.env`
   (`DATABASE_URL="file:../db/custom.db"`, `AUTH_SECRET=""` — the s46
   posture), `db/custom.db` pushed + seeded, chromium-1243,
   production build fresh. The reset shredded the SSH infra — the
   paramiko shim rebuilt at `/home/z/ssh-infra/ssh` (+ key 0600 +
   config), `ls-remote` pre-flight green.
2. **Alignment validated.** session_15 (the s68 transcript) + the doc
   chain read; Batch Y verified in-tree (NAV_ICONS map, sidebar
   header/footer chrome, dashboard stat hints/icons/gradients + the
   month-hours seams, S4-K). Doc chain consistent with the codebase.
3. **Gates re-certified cold on the received state.** lint ✓ tsc ✓
   unit **844/844** ✓; e2e across the re-derived 5-sub-run map —
   chunk 1 split 3 ways by weight (12 zero-register files), chunk 2 =
   the s9+s17+tasks/resilience/s16/s14 register family (fresh server),
   chunk 3 = auth + s18–s26 + greeting: **105+100+42+56+58 = 361/361**
   zero flakes.
4. **The s69 sweep + the screenshot pairs.** The s68 sweep class
   re-tagged (`ref-resweep-s69.mjs`): **ok:true** — 9/9 invariants per
   host, the brand tables byte-matched, drawers open + bar/drawer
   typography green on both. The side-by-side `69-ref-*` vs
   `69-clone-*` pairs then exposed the next layer; five DOM probes
   (`z-probe{,2,3,4,5}-s69.mjs`) turned 12 screenshot hypotheses into a
   measured truth table (AP-111 discipline; the ref dashboard needed a
   broader structure dump — its section heads are h2 but the first
   probe's selectors missed).
5. **The discriminator probe (AP-113).** The ref Appearance card
   renders black with the account in dark mode; clicking the ref's own
   "Light" option changes NOTHING (the Base44 picker is a hard no-op) —
   the mode is frozen state, so the pins target mode-independent
   structure and the clone's dark contract owns mode-dependent values.
   Zero residue: the account stayed dark-selected throughout.
6. **Batch Z implemented TDD** (16 pins RED-first: 15 e2e + 1 unit):
   Z1 dashboard 3-track section row + col-span-2 (S4-L); Z2 section
   header icon map (S4-M); Z3 the Exams "All → /Exams" neutral anchor
   (S4-N); Z4 empty copy at 16px + SimpleEmptyState text-base (S4-O);
   Z5 My Day max-w-3xl + leading plus + the Button `neutral` variant
   (S9-R2 ×3 — the first draft's unpinned `bg-neutral-950` serialized
   lab(), v4 trap 10 re-hit → arbitrary hexes); Z6 ViewHeader icons
   trending-up/file-question (S3-M); Z7 the PT bare empty state (S7-P);
   Z8 the SG right-pane icon EmptyState, top-anchored (S8-Z — the s65
   reading re-measured, AP-108); Z9 the Events band chrome + the
   left-aligned calendar New Event row + "No events" without the
   period (S5-V2 ×2 + the S17-W period pin re-pinned; "No events" stays
   slate-400 — the ref's slate-500 is 3.48:1, a11y wins); Z10 the
   Settings subtitle (S4-P); Z11 the Appearance single-card rework
   (S11-7 ×2); Z12 the 22-emoji vocabulary (unit pin).
7. **Pin hardening during GREEN.** The zero-state pins (S4-O/S7-P/S8-Z)
   failed against the demo seed (which ships exams/assignments/PT/
   groups) → the fresh-account pattern inline (clearCookies +
   register/verify; `test.use` inside a test body is illegal — AP-114);
   the centering pins became viewport-aware (the e2e viewport is 1280,
   not the probe's 1440); the band-bg pin accepts both serializations
   (trap 7); the avatar dark pin recovered `sf-chip-dark` (the S11-2..5
   wash contract).
8. **Verified.** lint ✓ tsc ✓ unit **844/844** ✓; build REAL_EXIT=0
   fresh; full cold re-certification **108+107+44+59+58 = 376/376**
   zero flakes; the final s69 sweep **ok:true** post-fix; the standing
   dark-sweep clean of NEW findings — the pre-existing `sf-clock-date`
   gradient-bg artifact verified identical pre/post by stashing the
   batch and re-running the sweep on the received bundle.

**Stage summary.** HEAD = the Batch-Z commit. Baselines: e2e **376/376**
(108+107+44+59+58, 30 spec files), unit **844/844**. New pins: S4-L/M/
N/O/P, S3-M, S9-R2 ×3, S7-P, S8-Z, S5-V2 ×2, S11-7 ×2 (+ the
AVATAR_EMOJIS unit pin; S17-W re-pinned). New lessons AP-113 (the
reference's frozen mode — measure mode-independent structure) and
AP-114 (zero-state pins need a fresh account; the seed's data
inventory is part of the pin's environment contract). New Button
variant: `neutral`. Honest debt: Batch R (RSC structural perf — the
s65 CWV evidence stands); the pre-existing sf-clock-date dark-sweep
artifact (the sweep's effective-bg resolver skips gradient
backgrounds) — recorded for a future audit-tools cycle.

## Session 70 (continuation 21) — the preserved-workspace cycle; the probe re-measure layer (Batch AA): the dashboard section actions' true anatomy, the assignments card placement, the root rhythm, the bordered section headers, the 24-emoji avatar list

**Context.** The user's `docs/session_16.md` is the s69 transcript —
its suggested next step = repeat the gate+re-sweep rhythm (or Batch R).
This cycle: refresh, re-certify, re-sweep — and the s70 sweep's
side-by-side pairs exposed the next drift layer, which the DOM probes
turn into a truth table that also OVERTURNED one of Batch Z's own
readings (the 22-emoji list).

**Work log.**

1. **Workspace refreshed.** `git pull --ff-only` fast-forwarded
   `095a022..5fcbea6` (the session_16 transcript commit). Preserved
   workspace — deps, chromium-1243, `.env` posture, fresh build, and
   `db/custom.db` all survived; only the post-push-shredded deploy key
   needed re-provisioning (`/home/z/ssh-infra/key` 0600 + `ls-remote`
   pre-flight green against `5fcbea6`).
2. **Alignment validated.** session_16 (the s69 transcript) + the doc
   chain read; Batch Z verified in-tree (the 3-track grid + col-span-2,
   My Day max-w-3xl + leading plus + the neutral variant, ViewHeader
   icons, the Events band rework, the single-card Appearance + the
   22-emoji list, S4-L..P/S3-M/S9-R2/S7-P/S8-Z/S5-V2/S11-7 pins).
3. **Batch Z audited** via the repo's code-review-checklist skill
   (Standards + Spec axes on the `f0d01b1..095a022` diff, 47 files):
   zero findings — measured values documented in comments, the v4 traps
   handled (arbitrary hexes on the neutral variant, oklab-tolerant band
   pins, raw-rgb gradients), the dead `UserAvatar` import removed, the
   immediate-PATCH contract preserved, the a11y-wins calls justified.
4. **Gates re-certified cold on the received state.** lint ✓ tsc ✓
   unit 844/844 ✓; e2e across the 5-sub-run map (fresh `db/e2e.db` +
   fresh server per chunk): **109+108+42+59+58 = 376/376** zero flakes
   (chunk 1b's single first-pass failure = the documented
   accessibility.spec cold-boot race, green on the solo re-run).
5. **The s70 sweep + the screenshot pairs.** The s69 sweep class
   re-tagged (`ref-resweep-s70.mjs`): **ok:true** — 9/9 invariants per
   host, brand tables byte-matched, drawers open + bar/drawer typography
   green on both. The dashboard pair then exposed the layer: the ref's
   Upcoming Assignments card renders FULL-WIDTH with a "View All"
   action; the clone's sat in one grid track, actionless.
6. **Six DOM probes** (`scripts/z-probe{,2,3,4,5,6}-s70.mjs`) turned the
   screenshot hypotheses into the measured truth table (AP-111
   discipline):
   - probe #1: assignments card x=292 w=1116 (full 3-track span) + an
     action read that CONTRADICTED the screenshot;
   - probe #2 (scoped visible-node re-dump): 24 avatar tiles (⭐ at
     index 6, ⚽ at 19) — the Z12 22-read was a filter-drop mis-measure;
   - probe #3 (the AP-111 full-path dump): ALL THREE section actions =
     `<a href="/MyDay|/Exams|/Assignments">` wrapping a BUTTON at
     12px/500 violet-600 rgb(124,58,237) h-32 — the s69 probe had read
     the anchor's inherited 16px neutral-950 (probe #1's "a/16px/gray"
     vs probe #2's "button/12px/violet" disagreement resolved by the
     path dump: the anchor's parentFs/parentColor matched probe #1
     EXACTLY, the text-parent button matched probe #2);
   - probe #4 (both hosts): root rhythm 32px (stats y=128 vs 120 — the
     exact gap-6/gap-8 delta), stats 4×267×134 byte-equal, the section
     grid `lg:grid-cols-3` re-confirmed, the assignments card y=557;
   - probe #5: the ref header = outer `p-6 border-b border-slate-100`
     (24/24, h=81) + inner gap-less row (h=32); the clone = single
     `p-6 pb-4` (24/16, h=68, no divider, card 218 vs 231);
   - probe #6: the other SectionCard consumers (calculator/mathsolver/
     analytics/gradetracker) render NO titled cards at zero on the ref —
     their header anatomy is UNMEASURABLE this cycle → the opt-in prop.
7. **Batch AA implemented TDD** (7 pins RED-first: S4-N rewritten to
   the button's values, S4-Q the 3-case action table, S4-R the
   outside-the-grid placement + full-width, S4-S the 32px root rhythm,
   S4-T the bordered header block, S11-7c the 24-emoji list + the unit
   pin; RED verified 6 e2e failed + the unit RED). GREEN:
   `dashboard-view.tsx` (root gap-8, the module-scope SectionLink —
   the static-components lint rule caught the first in-render draft —
   the assignments card moved out of the grid), `shared.tsx`
   (borderedHeader opt-in), `theme.ts` (the 24-list).
8. **Verified.** lint ✓ tsc ✓ unit **844/844** ✓; build REAL_EXIT=0
   fresh; full cold re-certification **113+109+42+59+58 = 381/381**
   (376 + 5 new pins, accounting exact); the post-fix s70 sweep
   **ok:true** on both hosts — after the s63 EADDRINUSE lesson re-bit
   (the stale pre-fix standalone held :3200 through `pkill -f
   next-server`; killed by the port-owner PID, rebooted fresh); the
   fixed dashboard captured (`70-clone-dashboard.png` — the full-width
   assignments card + the violet anchor>button actions + the bordered
   headers, matching `70-ref-dashboard.png`).

**Stage summary.** HEAD = the Batch-AA commit. Baselines: e2e **381/381**
(113+109+42+59+58, 30 spec files), unit **844/844**. New pins: S4-Q/R/S/T,
S11-7c (+ the AVATAR_EMOJIS unit pin re-pinned to 24; S4-N re-pinned to
the button anatomy). New lesson AP-115 (probe-vs-probe disagreement →
full-path node dumps with parent chains; filtered scans scoped to
visible nodes). The reference remains UNCHANGED on every standing
invariant. Honest debt: Batch R (RSC structural perf — the s65 CWV
evidence stands); the pre-existing sf-clock-date dark-sweep artifact;
the other SectionCard consumers' ref header anatomy (unmeasurable at
zero — a populated-account probe could settle it).

## Session 71 (continuation 22) — the reset-workspace re-certification cycle: all gates green, zero drift candidates, the chunk-map census lesson (AP-116)

**Context.** The user's `docs/session_17.md` is the s70 transcript (Batch
AA) — its suggested next step = repeat the gate + extended-sweep rhythm
(or Batch R). This cycle ran on a RESET workspace (fresh clone at the
session_17 transcript `2d04221`): the full environment re-provisioning
path, then the standing rhythm. Result: a clean zero-drift
re-certification — no new batch, no new pins; the baselines hold.

**Work log.**

1. **Workspace refreshed (reset path).** `git clone` at `2d04221` (the
   Batch-AA commit `e161e70` + the session_17 transcript). Full env
   re-provision: `bun install` (489 pkgs), `.env` from `.env.example`
   (the `DATABASE_URL="file:../db/custom.db"` + `AUTH_SECRET=""`
   posture), `db/custom.db` push + seed, chromium-1243, and the
   paramiko ssh shim REBUILT at `/home/z/ssh-infra/ssh` (the reset
   shredded it) — this time as a full BIDIRECTIONAL PUMP (select-based
   stdin/stdout/stderr relay against the exec channel): the first
   draft's buffered `stdout.read()` DEADLOCKED git's upload-pack
   handshake (git waits for the ref advertisement; the shim waited for
   channel EOF); `ls-remote` preflight green against `2d04221`.
2. **Alignment validated.** session_17 (the s70 transcript) + the doc
   chain read (README Session-70 row, SKILL AP-110…115, AGENTS
   381/844, the remediation-plan Batch AA section); Batch AA verified
   in-tree (the SectionLink module-scope component, the assignments
   card outside the grid, the gap-8 root, the borderedHeader opt-in,
   the 24-emoji list with ⭐ at 6 / ⚽ at 19).
3. **Batch AA audited** via the repo's code-review-checklist skill
   (Standards + Spec axes on the `5fcbea6..e161e70` source diff, 3
   files + 3 spec files): zero findings — measured values documented
   at every pin site, the v4 traps handled (`text-sf-primary-strong`
   carries no opacity modifier; the s70 pins avoided the oklab
   serialization), the DRY 3-case action table, the opt-in prop
   defaulting to zero behavior change for the other 4 SectionCard
   consumers, the anchor>button anatomy documented as the ref's own
   markup (nested-interactive already disabled in the sweep rule set).
4. **Gates re-certified cold on the received state.** lint ✓ tsc ✓
   unit **844/844** ✓; build REAL_EXIT=0 fresh (`find src prisma
   -newer BUILD_ID` empty; the bundled `.env` carries the empty-string
   AUTH_SECRET posture); e2e across the 5-sub-run map (fresh
   `db/e2e.db` + killed stale server per chunk): **113 + 109 + 42 +
   59 + 58 = 381/381** — the s70 baseline byte-matched. Chunk 1b's
   single first-pass failure = the calculator S15 keyboard test, the
   documented cold-boot race family (solo re-run green 1.1s, clean
   109/109 on the chunk re-run). **AP-116 (the chunk-map census
   lesson): the first chunk-3 run reported 53, not the expected 58 —
   the map line "auth" in the s70 transcript's compressed notation
   meant BOTH auth.spec.ts AND auth-flows.spec.ts; the compressed
   file lists in a transcript are NOT a census. Rule: before running a
   re-derived chunk map, enumerate `tests/e2e/*.spec.ts` and diff
   against the map's file set (30 spec files here, exactly once each).
5. **The s71 sweep + the screenshot pairs.** The s70 sweep class
   re-tagged (`scripts/ref-resweep-s71.mjs`): **ok:true** — 9/9
   invariants per host, the brand tables byte-matched (desktop
   sidebar 18/28 + 12/16, app-bar 16/24, drawer 16/24 + 12/16
   one-line), mobile drawers OPEN + typography green on both hosts
   (the user-flagged standing surface). Nine side-by-side pairs
   captured and compared (`71-ref-*` / `71-clone-*` ×7 desktop + ×2
   mobile): **ZERO drift candidates** — dashboard (the full-width
   assignments card + the violet anchor>button actions + the bordered
   headers, post-AA), My Day, Grade Tracker, Practice Tests, Study
   Groups, Events (band anatomy), Settings (the ref's black panel =
   the documented AP-113 frozen-dark artifact; the 24-tile avatar grid
   with ⭐/⚽ present on BOTH hosts), mobile dashboard, mobile drawer
   byte-matched.
6. **Lighthouse refreshed.** login a11y **100** (score 1.0, verified
   on /login directly and via the / and /Dashboard unauth redirects —
   all three postures render the login surface for a fresh profile).
   Honest posture note: the s65 `65-dashboard-after.json` captured
   finalDisplayedUrl `/` (pre-redirect), so the standing "dashboard
   100×2" evidence measured the same unauth shell; the AUTHED
   surfaces' a11y evidence is the axe sweep + accessibility spec pair
   (green in chunk 1b this cycle) — recorded so the ledger stays
   accurate.

**Stage summary.** HEAD = the session_17 transcript commit (`2d04221`
+ this cycle's doc/evidence commit). Baselines unchanged: e2e
**381/381** (113+109+42+59+58, 30 spec files), unit **844/844**. New
lesson AP-116 (chunk-map census: enumerate + diff the spec directory
against any re-derived chunk map before running; compressed map
notation is not a file list). The reference remains UNCHANGED on every
standing invariant — the clone holds measured parity across the full
s71 pair set. Honest debt (standing): Batch R (RSC structural perf —
the s65 CWV evidence still supports deferring: the clone's all-surface
LCP is GOOD where the reference's mobile login LCP is POOR); the
pre-existing sf-clock-date dark-sweep artifact; the other SectionCard
consumers' ref header anatomy (a populated-account probe could settle
it).

## Session 73 (continuations 23–24) — the s72 populated-account probe cycle completed: Batch AB (the populated-surface drift layer) fixed, baselines 389/389 + 844/844

**Context.** The user's `docs/session_18.md` is the s71 transcript; the
suggested next-cycle options included settling the populated-account
probe for the other SectionCard consumers' ref header anatomy. The
continuation-23 session ran the probes, wrote the 8 RED pins, and was
stopped prematurely mid-implementation; this session resumed the
workspace exactly there (HEAD `8332272`, the pins uncommitted, zero
source edits yet) and completed the cycle.

**Work log.**

1. **Resume-state verified.** `git status` clean-vs-`8332272` except the
   8 uncommitted AB pins in `parity-session5.spec.ts` + the s72 sweep
   screenshots + 4 probe scripts (untracked). No pull needed (already
   up to date with origin/main). The s72 evidence re-read: the
   populated-headers probe v1/v2 dumps + screenshots, the residue-zero
   cleanup, and the settled question (NONE of the four SectionCard
   consumers uses the bordered header — Batch AA's dashboard-only
   opt-in correct) + the NEW populated-surface drift layer it surfaced
   (calculator history panel, solver Recent Problems, GT subject cards).
2. **Batch AB implemented TDD.** RED was confirmed pre-stop (8/8 failed
   vs the pre-fix bundle). Amended AB7's chemistry line pre-commit
   (AP-117: Chemistry has ONE seeded grade → avg and pill both "78%" →
   `getByText` strict-mode collision; the ref dodges it by FORMAT
   (1dp avg) while the clone's integer convention cannot — asserted
   through the `gt-subject-avg` hook instead) and AB4 (residue-tolerant:
   the e2e db is a living scratch db, so the entry assertion scopes to
   the NEWEST listitem). Then the source fixes: `calculator-view.tsx`
   (the measured subtitle; the black aria-expanded History toggle; the
   slide-in `aside` "Calculation History" panel mounted ONLY while
   toggled — h2 title per the R1 heading-order contract; the
   spacedExpression display helper; the zero-era bottom "History"
   SectionCard + relativeTime helper removed),
   `mathsolver-view.tsx` (measured subtitle; free-standing h2 "Recent
   Problems" replacing the SectionCard), `gradetracker-view.tsx` (the
   measured per-subject card grid — chip + ramp-colored avg + "Progress
   to A (90%)" with progress=avg/90 clamped + Recent Grades pills,
   `sm:grid-cols-2`; grade rows kept below as the documented superset).
3. **GREEN + gates.** 8/8 AB pins green on the first post-fix run;
   parity-session5 cold **42/42**; lint ✓ tsc ✓ unit **844/844** ✓;
   rebuild REAL_EXIT=0 fresh (`find src prisma -newer BUILD_ID` empty).
4. **Full cold re-certification — AP-116 census first.** Per-file
   `--list` counts re-derived the 5-chunk map byte-consistent with the
   prior totals (chunk 3 = auth + auth-flows + greeting + s18–s26 = 57+1
   = 58 exact; all 30 spec files exactly once): **113 + 109 + 50 + 59 +
   58 = 389/389** zero flakes, first pass on every chunk (chunk 1c grew
   by the 8 AB pins: 42 → 50).
5. **Evidence.** `scripts/capture-s73-populated.mjs` captured the
   populated clone surfaces on the seeded demo account
   (`73-clone-gradetracker-populated.png` — the 4-card grid matching the
   s72 ref anatomy; `73-clone-mathsolver.png` — measured subtitle +
   free-standing h2; `73-clone-calculator-history-open.png` — the
   slide-in panel with the `2 + 3` / `= 5` entry + black Clear History).
   The s73 sweep (`ref-resweep-s73.mjs`, the standing class re-tagged):
   **ok:true** — 9/9 invariants both hosts, brand tables byte-matched,
   mobile drawers green on both (the user-flagged surface).

**Stage summary.** HEAD = `8332272` + this cycle's commit (Batch AB
source + pins + s72/s73 evidence + doc chain). Baselines: e2e
**389/389** (113+109+50+59+58, 30 spec files censused), unit **844/844**,
lint/tsc clean, build fresh. New lesson AP-117 (avg==pill text
collisions on single-grade subjects — assert populated aggregates
through role hooks; RED cannot catch the class, it bites at GREEN).
The open SectionCard question is CLOSED (measured, not assumed). The
reference remains UNCHANGED on every standing invariant. Honest debt
(standing): Batch R (RSC structural perf — the clone's all-surface LCP
GOOD vs the reference's mobile-login POOR still supports deferring);
the pre-existing sf-clock-date dark-sweep artifact; the analytics
dark-rendering titles (AP-113 class) are documented, not fixable
through the light-mode UI.

---

## Session 74 (continuation 25) — the 14th workspace reset; the post-AB re-certification cycle: full cold re-cert 389/389 + 844/844, s74 sweep ok, zero drift, zero source changes needed

**Context.** The user's `docs/session_19.md` is the s73 transcript (Batch
AB delivered end-to-end and pushed as `3fb9b79`). This cycle's directive
re-pointed the doc chain at `session_19.md` with the standing rhythm
(audit recent changes → gate re-certification → sweep → evidence → docs →
push). The workspace had been reset AGAIN between cycles (fresh clone at
`61e593a`; `bea1b92`/`61e593a` are docs-only session-log commits), so the
cycle doubled as a from-scratch provisioning validation.

**Work log.**

1. **Workspace + infrastructure rebuilt from zero.** Fresh clone at
   `61e593a` (remote main == local HEAD, nothing to pull). Full
   provisioning: `bun install` (489 packages); `paramiko` 5.1.0 into the
   venv; `/home/z/ssh-infra/` restored (the shim copied from the repo's
   own `docs/ssh.sh` — the field-tested implementation now carried
   in-repo — with the shebang re-pointed at the paramiko venv python; the
   delegated ed25519 key materialized 0600; fingerprint verified
   `3ddaNlFhMz1JXiGEDgVEaRsUzI4Ev0IpGEEB7NnU4PU`; auth preflight via
   `git ls-remote` green). `.env` = `DATABASE_URL="file:../db/custom.db"`
   + `AUTH_SECRET=""`; `db/` at repo root; schema pushed; seed
   (demo@studyflow.app) green; production build fresh.
2. **Playwright browser cache ALSO wiped this reset** — first e2e attempt
   failed every test in ~1–9 ms with `browserType.launch: Executable
   doesn't exist … chromium_headless_shell-1243`. `bunx playwright
   install chromium` restored the pinned build; the cold block then ran
   clean. (Provisioning checklist item, not a code lesson: on a reset,
   browsers go with the cache.)
3. **Audit of the recent code changes (the `3fb9b79` Batch AB bundle).**
   Two-axis review of the three view diffs against the s72 measured
   anatomy: Standards — unused `SectionCard`/`History`/`ListChecks`
   imports removed everywhere, the slide-in panel gated behind
   `aria-controls` only while mounted (aria-valid-attr-value stays clean
   at zero), role hooks (`gt-subject-avg`) per AP-117, `spacedExpression`
   documented against the engine's compact token stream; Spec — subtitle
   copy, panel anatomy (`2 + 3` / `= 5` / black Clear History), the
   free-standing Recent-Problems h2, and the per-subject card grid all
   byte-match the probe measurements. One display-phantom scare: the diff
   tooling showed `const istoryOpen, setHistoryOpen]` (a seemingly eaten
   `[h`), but `od -c` confirmed the file bytes are `const [historyOpen…`
   — lesson 10 re-confirmed, NO fix applied. No drift found; the commit
   is clean.
4. **Gates + full cold re-certification.** lint ✓ tsc ✓ unit **844/844**
   ✓ build fresh (`find src prisma -newer BUILD_ID` empty). AP-116 census
   re-derived per file: 1a = 57+43+12 (+1 setup) = **113**; 1b =
   28+18+14+15+20+6+7 (+1) = **109**; 1c = 41+5+3 (+1) = **50**; 2 =
   20+11+10+9+8 (+1) = **59**; 3 = 6+5+4+5+4+4+5+2+5+5+5+7 (+1) = **58**
   — byte-consistent with the session-73 map, 389 total, all 30 spec
   files exactly once. Cold run after `rm -f db/e2e.db` + stale-server
   kill: **389/389, zero failures, first pass on every chunk**.
5. **Evidence.** s74 sweep (`ref-resweep-s74.mjs`, the standing class
   re-tagged): **ok:true** — 9/9 invariants both hosts, brand tables
   byte-matched, mobile drawers green on both (the user-flagged surface;
   drawerOpened/barOk/brandOk all true). `capture-s74-populated.mjs`
   re-captured the Batch AB surfaces on the seeded demo account
   (`74-clone-gradetracker-populated.png` — the 4-card grid with the
   ramp math visible: 95→100%, 78→87%, 88→98%, 89→99%;
   `74-clone-mathsolver.png` — measured subtitle + free-standing h2;
   `74-clone-calculator-history-open.png` — the slide-in panel with the
   spaced `2 + 3` / bold `= 5` entry + black full-width Clear History).
   The `73-*` ref-side populated evidence from s72/s73 remains the
   measurement record.

**Stage summary.** HEAD = `61e593a` + this cycle's commit (s74 sweep +
capture scripts, 74-* screenshots, this worklog entry). Baselines
unchanged: e2e **389/389** (113+109+50+59+58, 30 spec files censused),
unit **844/844**, lint/tsc/build clean, s74 sweep ok:true. Zero source
changes this cycle — the re-certification found no drift and the audit
found no defects, which is itself the result: Batch AB is stable across
a from-scratch rebuild. Honest debt (standing): Batch R (RSC structural
perf — the clone's all-surface LCP GOOD vs the reference's mobile-login
POOR still supports deferring); the pre-existing sf-clock-date
dark-sweep artifact; the analytics dark-rendering titles (AP-113 class)
are documented, not fixable through the light-mode UI.

---

## Session 75 (continuation 26) — the 15th workspace reset; re-certification 389/389 + 844/844; the CWV re-audit strengthened the Batch R deferral; the populated S6-family probe measured Batch AC (pending), 2 new probe lessons (AP-118/119), zero source changes

**Context.** The user's `docs/session_20.md` is the s74 transcript. The
suggested next-cycle options: Batch R (deferred RSC perf) or the
gate+sweep rhythm. This cycle ran the rhythm AND added a new evidence
layer — the populated S6-family re-measure on the reference — which
surfaced the next drift layer (Batch AC) exactly as the s72 probe
surfaced Batch AB.

**Work log.**

1. **Workspace rebuilt from zero (15th reset).** Fresh clone at
   `ef0ed0a` (`f701a53` + the docs-only session_20 commit). Full
   provisioning: bun install, paramiko 5.1.0, `/home/z/ssh-infra/`
   restored (shim from the repo's own `docs/ssh.sh`, delegated key
   0600, fingerprint verified, ls-remote auth green), `.env`
   (`file:../db/custom.db` + empty `AUTH_SECRET`), db push + seed,
   build fresh, chromium-1243 restored (`bunx playwright install` —
   the browser cache does not survive resets; the first-run failure
   signature is `browserType.launch: Executable doesn't exist`).
2. **Audit of the recent changes:** `f701a53..ef0ed0a` is docs-only —
   the audited Batch AB state stands unchanged.
3. **Gates + full cold re-certification.** lint ✓ tsc ✓ unit
   **844/844** ✓ build fresh. AP-116 census re-derived per file (each
   chunk = chromium sum + 1 setup): **113+109+50+59+58 = 389/389**
   cold, zero failures, first pass on every chunk — baseline
   byte-matched again.
4. **s75 standing sweep** (`ref-resweep-s75.mjs`, the class re-tagged):
   **ok:true** — 9/9 invariants both hosts, brand tables byte-matched,
   mobile drawers green on both (the user-flagged surface).
5. **CWV re-audit** (`cwv-audit-s16.mjs`): the clone GOOD on every
   measured surface (dashboard mobile-throttled LCP 2308ms ≤ 2500,
   CLS 0; login mobile 1884ms; desktops sub-500ms); the reference
   login-mobile LCP **8032ms POOR**, dashboard-mobile LCP **4296ms**
   and **CLS 0.254 POOR**. The Batch R deferral (RSC structural perf)
   is re-validated on stronger evidence — the clone now outperforms
   the reference on every anchor.
6. **The populated S6-family probe (the cycle's new layer).** Five
   iterations against the live reference: v1 (UI drivers missed:
   calculator keypad, solver click+type — the s72 lessons held), v2
   (added dialog-closure verification; exposed the REAL blockers — the
   ref's date fields are popover pickers and the account has ZERO
   subjects so subject-bearing dialogs could not validate), v3 (the
   v1-proven Settings→Subjects chain first; discovered the event
   Start/End are `datetime-local` inputs → EVENT SUBMITTED), v4 (the
   pickers' day-15 was in the past — future day 28 + popover
   instrumentation; the picks registered but submits still failed), v5
   (AP-119: popovers are modal dialogs too — form-title-scoped
   locators + popover-close → ASSIGNMENT AND EXAM SUBMITS TRUE).
   Populated: Subject, Task (My Day quick-add), Event
   (datetime-local), Assignment (subject combobox + due-date picker),
   Exam (subject combobox + date picker). Notes: the New Note editor
   is an inline pane, never persisted — unmeasured positive case.
7. **RESIDUE ZERO — twice.** The v5 delta cleanup deleted 4 objects
   (Task/Subject/Assignment/Event, all 200). The cross-check against
   the measured UI (5 probe rows visible, 4 deletions) exposed the
   surviving exam (AP-118: `Exam` missing from the inherited candidate
   list); the follow-up cleanup deleted it (200) and re-verified ZERO
   across the extended list. The reference account is clean.
8. **Measurements → Batch AC (measured, PENDING).** 7 populated views
   dumped (widened leaf dump) + screenshotted on the ref, and the same
   7 captured on the seeded clone (`75-clone-populated-*.png`) for the
   apples-to-apples comparison. New drift layer (full table in
   remediation-plan): AC1 assignment due pill (ref INLINE+violet+"7
   days" vs clone own-line+blue+"Due in N days"), AC2 assignment
   subject chip + amber bell priority (clone: neither), AC3 exam date
   FULL format, AC4 exam subject chip, AC5 exam location
   end-to-end (`Exam.location` missing from schema/dialog/card — the
   S8 "no location row" pin's rationale was a data artifact), AC6
   topics-row conditionality, AC7 exam pill copy, AC8 task pill date
   form. Measured-and-matching recorded alongside (headers, pill
   placements that DO match, duration suffix, type pills, dashboard
   cards, calendar day-detail, My Day row).
9. **Docs.** remediation-plan: the Cycle-25 record + the Batch AC
   table + AP-118 (probe candidate completeness) + AP-119 (popover
   layering). No source changes this cycle — AC is documented for the
   next cycle's TDD implementation per the established
   probe→implement rhythm (the Batch AB pattern: probed s72,
   implemented s73).

**Stage summary.** HEAD = `ef0ed0a` + this cycle's commit (probe
scripts v1–v5 + the exam-residue cleanup + capture-s75-clone-populated
+ the s75 sweep + 75-* screenshots + docs + worklog). Baselines
unchanged: e2e **389/389**, unit **844/844**, lint/tsc/build clean,
s75 sweep ok:true. Batch AC is the next cycle's implementation work;
Batch R stays deferred (strengthened CWV evidence). The reference
remains UNCHANGED on every standing zero-state invariant; the
populated S6-family surfaces are now MEASURED territory with a
committed evidence trail.

## Session 76 (continuation 27) — the Batch AC re-measure + the populated-row drift layer fixed

**Context.** Ran on a RESET workspace (16th reset — fresh clone at
`77a4326` = Session-75 + the session_21 transcript, the directive for
this cycle). The directive: implement Batch AC TDD in the Batch AB
rhythm, starting with the `Exam.location` schema→dialog→card chain and
the assignment row anatomy; re-measure AC6/AC8 before pinning.

**Work log.**

1. **Workspace rebuilt from zero (16th reset).** Full provisioning:
   bun install (489 pkgs), `.env` (`file:../db/custom.db` + empty
   AUTH_SECRET), db push + seed, build, chromium-1243 restored
   (`bunx playwright install chromium`). Baseline re-certified BEFORE
   any change: lint ✓ tsc ✓ unit **844/844**; e2e cold across the
   re-derived 5-chunk map **389/389** (113+109+50+59+58). Two
   environment findings re-confirmed: a single-process FULL e2e run
   trips the register limiter by design (18 local-IP registrations vs
   the 10/IP/15-min budget — the chunked map exists precisely to
   re-boot the limiter per chunk; the run failures were the 8
   register-429s, not flaky specs), and the S12-B skip-link timeout
   was a one-off flake (green in every chunked run after).
2. **The s76 re-measure (the cycle's new evidence layer).** Four probe
   iterations against the live reference (login → populate through the
   ref's own UI → computed-style measure → residue-zero cleanup, the
   AP-118/119 protocol — `scripts/ref-ac-remeasure{,3,4}-s76.mjs`):
   settled BOTH S75 open questions and corrected THREE prose
   transcription errors in the S75 table — AC8's task pill is the
   DATE form for EVERY bucket ("Oct 20"/"Oct 22"/"Oct 28", calendar
   glyph, red today/past + slate future — no relative labels); AC6's
   topics positive case is the "Topics to study:" label + neutral-800
   chips (#262626/#fafafa, rounded-md); AC1's assignment due pill is
   BLUE (blue-50/blue-600 — the S75 "violet tint" was a misread);
   AC3's month is SHORT ("Wednesday, Oct 28, 2026", not "October");
   AC7's ≥2 bucket is the YELLOW family (yellow-100/yellow-700, not
   amber — Tailwind v4 lesson 12 re-hit); NEW: AC9 the exam title is
   text-lg 18px + the pill `px-2.5 py-1 font-semibold`; AC10 the seed
   ships type "worksheet" outside the assignmentSchema enum (editing
   "Problem set 6" 400s). The exam dialog anatomy fully measured
   (title/duration/LOCATION "e.g., Room 101, Hall A"/TOPICS "Add a
   topic..."/notes + subject/type combos + "Pick" popover). All probes
   cleaned to FINAL-RESIDUE: 0.
3. **Remediation plan written first** (docs/remediation-plan.md Cycle
   26): the corrected evidence table + the 10-item TDD todo list + the
   honest-deviations ledger (the ref's due-today slot reads "Tomorrow"
   [its own off-by-one] and its +1 slot reads "1 days" — the clone
   ships honest "Today" amber / "Tomorrow" blue in the same tint
   slots, per the superset-not-clone-of-quirks doctrine).
4. **Batch AC implemented TDD.** RED first: 3 unit pins
   (examSchema.location default+bound; "worksheet" enum;
   formatDueDateShort month-short+day) + 10 e2e pins (S8-AC blocks)
   — the e2e pins ran 10/10 RED against the pre-change standalone
   build. GREEN source: `prisma/schema.prisma` `Exam.location String?`
   (+ db push, + one seeded location on "Physics Final" so the 📍 row
   renders while the FIRST card keeps none — the amended S8 pin stays
   valid); validation examSchema.location + the worksheet enum;
   `formatDueDateShort` in date.ts; `SubjectTagChip` (the accent-aware
   `sf-subject-chip` utility — 8% tint/19% border/strength text via
   the raw-triplet pattern); `DuePill` withIcon; the assignment row
   rebuilt (inline "N days" blue pill on the title line, meta row =
   chip + bell priority yellow-50 + slate type, dialog Subject
   select); the exam card rebuilt (text-lg title, full weekday date,
   slate-500 "· N min" suffix, 📍 row, topics chip block, "N days"
   yellow urgency); the task pill's date form; the seed location.
5. **Three post-GREEN repairs, each caught by a standing gate:**
   (a) the axe sweep flagged the chip's violet-500-on-tint text
   (3.9:1) and the "· N min" slate-400 (2.56:1) — both fixed with the
   documented one-step-darker text precedent (violet-600 / slate-500),
   pins updated with the deviation comments; (b) TWO v4 lab()
   serialization gaps closed by pinning yellow-50/yellow-950 +
   neutral-50/100/700/800 (trap 10 — unpinned palette classes read
   back lab()); (c) the S8-U3 row-count pin was a pre-existing AP-96
   flake (bare count after a pre-paint-satisfiable gate) — hardened
   with wait-for-row-first.
6. **Full cold re-certification.** lint ✓ tsc ✓ unit **847/847** ✓
   build REAL_EXIT=0 fresh. AP-116 census re-derived (parity-session8
   43→53 chromium with the 10 S8-AC pins; all 30 spec files exactly
   once): **123+109+50+59+58 = 399/399** cold, zero failures, first
   pass on every chunk.
7. **The s76 sweep** (`ref-resweep-s76.mjs`, the standing class
   re-tagged): **ok:true** — 9/9 invariants both hosts, brand tables
   byte-matched, mobile drawers green on BOTH (drawerOpened/barOk/
   brandOk all true — the user-flagged surface; no Tailwind v4
   mobile-nav bug, traps 4/7/9 verified live yet again).
8. **Evidence.** Dev-server screenshots captured on :3000
   (`76-clone-{dashboard,assignments,exams,tasks}.png`, the exam
   dialog with the Location field, `76-clone-mobile-{dashboard,drawer,
   assignments}.png` at 390×844) + the ref probe pairs
   (`76-ref-*.png`) + the sweep's clone set — VLM-verified: the
   inline pills, chips with dots, bell priorities, "Wednesday, Oct N,
   2026" dates, the location row, the topics chips, the mobile drawer
   all render as measured.
9. **Docs.** README (badge 1246, counts 847/399, S74/S75 rows
   backfilled + the S76 row); AGENTS/CLAUDE counts; remediation-plan
   header refreshed + Batch AC → DONE + the Cycle-26 execution record;
   this entry. `.env.example` verified current (the DATABASE_URL/
   AUTH_SECRET/NEXT_PUBLIC_SITE_URL contract unchanged).

**Stage summary.** HEAD = `77a4326` + this cycle's commit (Batch AC
source + pins + probes + sweep + screenshots + docs + worklog).
Baselines: e2e **399/399** (123+109+50+59+58, 30 spec files censused),
unit **847/847**, lint/tsc clean, build fresh, s76 sweep ok:true.
Batch AC DONE. Standing debt unchanged: Batch R (RSC structural perf —
deferred on the strengthened S75 CWV evidence); the pre-existing
sf-clock-date dark-sweep artifact (recorded for a future audit-tools
cycle).

## Session 77 (continuation 28) — the Batch AD probe + the Notes inline editor + the Flashcards study mode

**Context.** Ran on a RESET workspace (17th reset — fresh clone at
`08b2986` = Session-76 + the session_22 transcript, the directive for
this cycle). The directive: the standing rhythm + the two remaining
unmeasured populated surfaces (the S76 record's suggested next steps) —
the Notes inline editor and the Flashcards study mode.

**Work log.**

1. **Workspace rebuilt from zero (17th reset).** Full provisioning: bun
   install (489 pkgs), `.env` (`file:../db/custom.db` + empty
   AUTH_SECRET), db push + seed, chromium-1243 restored, build. Baseline
   re-certified BEFORE any change: lint ✓ tsc ✓ unit **847/847**; e2e
   cold across the documented 5-chunk map **399/399** (123+109+50+59+58,
   first pass every chunk — the earlier single nohup `bun install` died
   silently; the foreground re-run was clean).
2. **The Batch AD probe (the cycle's new evidence layer).** Seven probe
   iterations against the live reference (login → drive the ref's own UI
   → computed-style measure → residue-zero cleanup, the AP-118/119
   protocol): v1 recon (entity discovery: Notebook/Note/FlashcardDeck/
   Flashcard exist; the orphan Flashcard pre-existing, untouched) + the
   first editor dump; v2 the editor-chain walk (the white rounded-2xl
   card + the Quill snow structure + the Font/tag rows) — VLM
   cross-checks exposed the ref's invisible-typed-text bug (white
   rgb(250,250,250) on white — confirmed at the `<p>` level in v3);
   v3 the SAVE FLOW (title + body + bold → the entity persists content
   as HTML `"<p><strong>…</strong></p>"` — the toolbar is FUNCTIONAL);
   v4 the tag flow (Add tag → Enter → `tags:["probe-tag"]`, editor pill
   neutral-800/neutral-50 radius-6 12px; the list pill white-on-slate =
   another invisible quirk; "Attach File" NOT in the DOM — a VLM
   hallucination, corrected); v5-v7 the flashcards flow (Create Deck
   dialog anatomy → select deck → Add Flashcard dialog (2 textareas +
   difficulty) → Study → the study surface measured: IN-PAGE (no
   overlay), black Exit Study, "1 / 2" slate-500 counter, the
   gradient front + white 24px/500 text, the white 2px-violet-200 back
   + 20px/400 slate-700 text, "Click card to flip" hint, the Wrong
   (neutral-950/red-600) / Correct (green-500) rating pair, no
   completion screen; the card grid rows + yellow-100/yellow-700
   difficulty pill + the deck sidebar button anatomy). Every run
   cleaned to FINAL-RESIDUE: 0.
3. **Remediation plan written first** (docs/remediation-plan.md Cycle
   27): the AD1-AD12 measured table + the 10-item TDD todo + the honest
   deviations ledger.
4. **Batch AD implemented TDD.** RED first: 7 unit pins
   (`stripHtmlPreview` in the new src/lib/text.ts — the module did not
   exist) + 10 e2e pins (the S7-AD blocks in parity-session7: Notes
   editor ×7, study mode ×3) — **10/10 RED** against the pre-change
   standalone build. GREEN source: `quill@2.0.3` (the ref's own engine)
   behind a new `QuillEditor` client wrapper (dynamic import, the
   measured 20-control snow toolbar, a custom `hr` blot, debounced
   autosave, aria-labeled toolbar buttons); the notes editor chrome
   (14px/700 title, Font row + black Divider button, tag authoring row
   on the already-modeled Note.tags, gradient Save + autosave superset);
   the list-row rework (violet-50/2px violet-200/p-3, 16px/600 title,
   HTML-stripped 12px preview, readable tag pill, no notebook/date
   line); the flashcards study rework (in-page, black Exit Study, "N / M"
   counter, max-w-2xl, 24px/500 front + 20px/400 back, the flip hint,
   the Wrong/Correct rating replacing Prev/Next — Correct marks
   mastered). neutral-950 pinned (the v4 lab() trap 10).
5. **Three post-GREEN repairs, each caught by a standing gate:**
   (a) the axe sweep flagged the h1→h3 heading-order skip in the new
   list rows — shipped the a11y-clean H2 with the ref's identical
   computed styling (the ref's own H3 laxity, documented); (b) Quill's
   snow stylesheet out-cascaded the bare `.ql-editor` pad-24 override —
   scoped under `.sf-note-editor`; (c) pin calibrations (the
   transition-race border alpha → settle-then-measure; the max-w-2xl
   assertion → the button's computed maxWidth).
6. **Full cold re-certification.** lint ✓ tsc ✓ unit **854/854** ✓
   build REAL_EXIT=0 fresh. AP-116 census re-derived (parity-session7
   grew 19→29 chromium): **123+119+50+59+58 = 409/409** cold, zero
   failures, first pass every chunk.
7. **The s77 sweep** (ref-resweep-s77.mjs, the standing class
   re-tagged): **ok:true** — 9/9 invariants both hosts, brand tables
   byte-matched, mobile drawers green on BOTH (drawerOpened/barOk/
   brandOk all true — the user-flagged surface; no Tailwind v4
   mobile-nav bug, traps 4/7/9 verified live yet again).
8. **Evidence.** Dev-server screenshots captured on :3000
   (`77-clone-{notes-editor,notes-tagged,flashcards-deck,flashcards-
   study,flashcards-rating,mobile-notes,mobile-flashcards}.png`) + the
   sweep's set + the probe pairs (`77-ref-*.png`) — VLM-verified: the
   Quill toolbar renders in the white rounded card, the Font/tag rows,
   the gradient Save, the readable dark note content, the in-page study
   mode with the rating pair all render as measured.
9. **Docs.** README (badge 1263, counts 854/409, the feature-table
   rows, the S77 session row); AGENTS/CLAUDE counts; remediation-plan
   header + the Cycle-27 execution record; this entry; the
   docs/session_23.md transcript. `.env.example` verified current (the
   DATABASE_URL/AUTH_SECRET/NEXT_PUBLIC_SITE_URL contract unchanged —
   quill is a bundled dependency, no env surface).

**Stage summary.** HEAD = `08b2986` + this cycle's commit (Batch AD
source + pins + probes + sweep + screenshots + docs + worklog).
Baselines: e2e **409/409** (123+119+50+59+58, 30 spec files censused),
unit **854/854**, lint/tsc clean, build fresh, s77 sweep ok:true.
Batch AD DONE. Standing debt unchanged: Batch R (RSC structural perf —
deferred on the strengthened S75 CWV evidence); the pre-existing
sf-clock-date dark-sweep artifact (recorded for a future audit-tools
cycle).

## Session 78 (continuation 29) — the Batch AD post-audit hardening + the mobile two-pane parity fix (Batch AE)

**Context.** Ran on a RESET workspace (19th reset — fresh clone at
`d9b289e` = Session-77 + the session_23/session_24 transcripts, this
cycle's directive). The directive: the standing rhythm — baseline
re-certification, the Batch AD diff audit, the reference parity re-check
(agent-browser + the sweep), the mobile navigation menu verification,
and the Tailwind v4 watch.

**Work log.**

1. **Workspace rebuilt from zero.** Full provisioning: bun install
   (497 pkgs), `.env` (`file:../db/custom.db` + empty AUTH_SECRET — the
   documented dev posture), db push + seed, chromium-1243 restored,
   build. Baseline re-certified BEFORE any change: lint ✓ tsc ✓ unit
   **854/854**; e2e cold across the documented 5-chunk map **409/409**
   (123+119+50+59+58, first pass every chunk).
2. **The Batch AD code audit (Mode C).** Security/XSS clean (no
   dangerouslySetInnerHTML of note content; Quill 2.0.3 sanitizes link
   protocols; previews React-escaped), React-clean (no
   set-state-in-effect; StrictMode-safe), conventions clean (all v4
   traps respected). Findings: 2 Medium (the saveNow empty-overwrite
   window — `getContent()` returned `""` during the dynamic-import
   window so Save PATCHed `content:""` over a populated note; the
   silent autosave `.catch(() => {})` swallow), 4 Low, 7 Informational.
3. **The parity evidence layers.** The s78 reference re-sweep
   (`scripts/ref-resweep-s78.mjs`, the s77 class re-tagged): **ok:true**
   — 9/9 invariants both hosts, brand tables byte-matched, **mobile
   drawers green on BOTH** (the user-flagged surface; no Tailwind v4
   mobile-nav bug, traps 4/7/9 verified live yet again). An
   agent-browser walkthrough of the clone (login → dashboard → drawer
   open/navigate/close → the Quill editor → the study flip/rating flow;
   zero console errors). A VLM pairwise pass raised two hypotheses —
   both DISPROVEN by DOM probes (the "stat-card decorative circles"
   claim: identical child structure both hosts; the "Grade Tracker
   missing" claim: 20/20 labels byte-matched) — the AP-115 doctrine
   (DOM probes are the authority) applied.
4. **The mobile two-pane discovery (the cycle's headline).** A targeted
   probe measured the reference at 390×844: the ref renders the Notes
   list pane (w-80 @320px + a 14px right sliver, its own 416px overflow)
   and the Flashcards deck list (239px + 112px) — the CLONE hid both
   asides below md, so a 390px user could not browse or select existing
   notes/decks at all (a functional SUBSET of the reference). Tasks
   correctly matches the ref's single-pane mobile shape; StudyGroups
   already rendered its list.
5. **The standing mobile sweep re-run surfaced five MORE overflow
   findings** (audit-tools rot — the sweep had not been re-run since the
   header rows grew): Timetable 402 / Exams 584 / Files 499 / Calculator
   427 / StudyGroups 393 — element-attributed by a new probe (the
   nowrap header rows + the StudyGroups shrink-0/min-w-0 starvation);
   the ref itself overflows on Timetable (395) + Calculator (429) — its
   own bug family — while Exams/Files/StudyGroups are clone-only gaps.
6. **Remediation plan written first** (docs/remediation-plan.md Cycle
   28): the AE1-AE13 measured table + the 7-item TDD todo + the honest
   deviations ledger.
7. **Batch AE implemented TDD.** RED first: 5 unit pins
   (`stripHtmlPreview` entity/surrogate hardening) + 7 e2e pins (the
   AE6 mobile two-pane pair, the AE9-13 five-view overflow guard, the
   AE1 save-race pin with the route-delayed quill chunk, the AE2
   autosave-failure toast, the AE4 study-index reset, the AE3 dark
   placeholder) — **7/7 RED** against the pre-change build. GREEN:
   the asides render at ALL widths (≥md byte-identical by construction),
   `getContent(): string | null`, the toast-once-per-streak autosave,
   the `switchDeck` reset, the dark placeholder rule, the entity-cap
   hardening, the five overflow fixes (flex-wrap / scrollable tabs /
   the ref's own shrinkable StudyGroups negotiation), and AE8
   (`createNote` returns the created id — the never-selected-note
   papercut the AE3 pin surfaced live). Two pin calibrations (the
   deck-order-agnostic heading; the exact:true menuitem) + one
   audit-tools repair (the capture script's rotted login selectors).
8. **Full cold re-certification.** lint ✓ tsc ✓ unit **859/859** ✓
   build REAL_EXIT=0 fresh; cold e2e **416/416** (126+122+50+60+58,
   first pass every chunk); the mobile sweep re-run: **findings []** —
   all 20 views ≤ 390; the s78 resweep re-run: ok:true.
9. **Evidence + docs.** The standard 31 refreshed
   (`capture-studyflow.mjs`) + the S78 evidence set
   (`capture-s78-clone.mjs`: the mobile two-pane surfaces, the
   overflow-fixed five, the hardened editor + study mode — VLM-verified);
   README (badge 1275, counts 859/416, the S78 session row);
   AGENTS/CLAUDE counts; the remediation-plan Cycle 28 record; this
   entry; the `docs/session_25.md` transcript. `.env.example` verified
   current (no env surface changed this cycle).

**Stage summary.** HEAD = `d9b289e` + this cycle's commit (Batch AE
source + pins + probes + sweeps + screenshots + docs + worklog).
Baselines: e2e **416/416** (126+122+50+60+58, 30 spec files censused),
unit **859/859**, lint/tsc clean, build fresh, mobile sweep findings [],
s78 resweep ok:true. Batch AE DONE. Standing debt unchanged: Batch R
(RSC structural perf — deferred on the S75 CWV evidence); the
pre-existing sf-clock-date dark-sweep artifact (a future audit-tools
cycle).

## Session 79 (continuation 30) — the study-mode full-replacement parity fix + the mid-band/landscape sweep layer + the standing-artifact closure (Batch AF)

The 20th workspace reset (a scaffold repo only) — cloned fresh at
`6a7245e` (Session-78/Batch AE + the session_25/session_26 transcripts,
this cycle's directive). Provisioned per the documented order (bun
install 497 pkgs, `.env` at the dev posture `DATABASE_URL="file:../db/custom.db"`
with the repo-root `db/`, db push + seed, chromium-1243 restored, build)
while the operational docs were absorbed (AGENTS/CLAUDE for the gates
and doctrines, README/PAD/SKILL for the inventory, the session_25/26
transcripts + remediation-plan + worklog for the cycle shape,
skills-catalog for the tooling — the `skills/` folder excluded from
checking/testing/compilation per the standing contract).

1. **Baseline re-certified cold, first.** lint ✓, tsc ✓, unit
   **859/859**, build REAL_EXIT=0, cold e2e **416/416**
   (126+122+50+60+58, first pass every chunk) — the received state
   verified clean against the documented baseline.

2. **Two evidence layers before any source change.** (a) A Mode-C
   audit of the Batch AE diff (`2cce898..38510aa`, delegated deep-read):
   0 Critical / 0 High / 2 Medium / 5 Low / 4 Informational — the two
   Medium: the surrogate-cap unit pins are non-discriminating (a
   regression to a bare UTF-16 slice would pass the suite) and the
   autosave streak flag latches across note switches (note B's first
   failure is silently swallowed). (b) The parity layers: the s79
   reference re-sweep (the s78 class re-tagged) — **ok:true**, 9/9
   invariants both hosts, brand tables byte-matched, mobile drawers
   green on both (the user-flagged surface; no Tailwind v4 mobile-nav
   bug, traps verified live yet again); an agent-browser walkthrough
   (login → dashboard → the drawer open/navigate/close cycle → Notes →
   Flashcards — zero console errors, zero page errors); the standing
   rhythm re-run: mobile sweep findings [], **the mid-band (768×1024)
   and landscape (844×390) sweeps re-run for the first time since the
   AE overflow family — both flagged the SAME single finding** (the
   Tasks aside's scaffold `<h2>Lists</h2>`: the ref renders NO heading
   there, measured), and the dark sweep showed the standing
   `sf-clock-date` artifact live on all 20 views (violet-950 @1.78:1).

3. **The headline discovery (AF1).** A directed reference probe (the
   ref account's decks were since reset — a probe deck + card created
   to re-measure the populated state) found the ref's Flashcards study
   mode is a **FULL VIEW REPLACEMENT at both viewports**: desktop
   innerText during study is exactly "Exit Study 1 / 1 [card] Click
   card to flip" (no h1, no deck list, no search), the study column
   (`w-full max-w-2xl`) centers in the content area (Exit x=434 @1280,
   counter x=1070 on the same justify-between row), and at 390×844 the
   study pane renders FULL WIDTH (Exit x=16, scrollWidth 390, deck list
   absent) — mobile study is clean and usable on the reference. The
   clone rendered the study pane INSIDE the two-pane right pane: at 390
   the Study button sat clipped at x=360..432 (an agent-browser tap
   silently missed) and the study chrome was unusable — **a mobile
   functional subset of the reference's working study surface.**

4. **The second discovery (AF2/AF2b).** The clone's Tasks aside
   rendered an extra `<h2>Lists</h2>` (original scaffold, survived every
   parity batch — the mid-band sweep is the only standing probe that
   reads the first visible heading through the band). Removing it
   UNMASKED a pre-existing collapse: at 768 the Tasks h1's `sm:min-w-0`
   flex container collapsed to width 0 when the actions row consumed
   the full line (invisible heading; previously hidden behind the
   "Lists" h2). Fixed by dropping `sm:min-w-0` — the header wraps (the
   ref's own shape; the ref itself overflows to 826 there, its own bug
   family), the h1 stays visible through the band, desktop
   byte-identical.

5. **The third discovery (AF5).** The `sf-clock-date` standing artifact
   root-caused: the utility's `.dark &` rule resolved
   `--sf-primary-soft-dark` = violet-950 for the sidebar clock date
   (1.78:1, unreadable on all 20 views). The theme system's own token
   comments name strong/strongDark as the clock-date pair; the ref's
   dark mode is its own half-broken family (its sidebar stays fully
   light-themed — measured through its own Settings Theme→Dark), so the
   clone's full dark theme remains the documented superset and the fix
   is a readability correction: the date moves to the accent-aware
   `--sf-primary-avatar-from` (400) — one step dimmer than the time's
   300, mirroring light's 700/600 hierarchy, ~5.8:1.

6. **Remediation plan written first** (docs/remediation-plan.md Cycle
   29: the AF1-AF7 measured table + the TDD todo + the honest-deviations
   ledger, including the AF7 recalibration recorded when the planned
   flex negotiation could not engage — the right pane's overflow-y-auto
   collapses the CSS automatic min-size, and the aside's own content
   floor exceeds any useful detail floor at 390).

7. **Batch AF implemented TDD.** RED first: 2 unit pins + 6 e2e pin
   behaviors — **6/6 RED** against the pre-change build. GREEN: the
   study pane replaces the whole view when studying (the studyDeckId
   guard kills the s78 audit's F3 deck-deletion latch structurally;
   `selectDeck` lands every selection in deck-detail from card 1); the
   below-md in-row Study affordance keeps the mobile entry one tap away
   (the ref's own mobile deck-detail is its 451/836px overflow family);
   the Tasks h2 removed + the h1 collapse fixed; the autosave streak
   flag resets on selection change (+ the note-agnostic wording, + the
   FAB comment); the discriminating surrogate-cap pin + the `&copy;`
   deviation pin; the dark clock date reads violet-400. Three pin
   calibrations out of the GREEN runs (the row-tap targets the h2; the
   exact:true row-button locator; the AD10 max-w-2xl read site).

8. **Full cold re-certification.** lint ✓ tsc ✓ unit **861/861** ✓
   build REAL_EXIT=0 fresh; cold e2e **421/421** (127+124+50+62+58,
   first pass every chunk; the census re-derived per-file); mobile,
   mid-band, and landscape sweeps: **findings [] each**; the dark sweep:
   **the sf-clock-date artifact CLEARED** (0 of 20 views); the s79
   resweep: **ok:true**.

9. **Evidence + docs.** The standard 31 refreshed + the S79 evidence
   set (`capture-s79-clone.mjs`: the mobile study flow, the desktop
   full-replacement study, the Tasks 768 aside, the dark clock chip) +
   the reference probe set (the AF1 measurement basis); README (badge
   1282, counts 861/421, the S79 session row); AGENTS/CLAUDE counts;
   the remediation-plan Cycle 29 execution record; this entry; the
   `docs/session_27.md` transcript. `.env.example` verified current
   (no env surface changed this cycle).

**Stage summary.** HEAD = `6a7245e` + this cycle's commit (Batch AF
source + pins + probes + sweeps + screenshots + docs + worklog).
Baselines: e2e **421/421** (127+124+50+62+58, 30 spec files censused),
unit **861/861**, lint/tsc clean, build fresh, mobile + mid-band +
landscape sweeps findings [], dark sweep artifact-free, s79 resweep
ok:true. Batch AF DONE. Standing debt reduced to ONE item: Batch R (RSC
structural perf — deferred on the S75 CWV evidence).

## Session 80 (continuation 31) — the dark-canvas flashbulb family + the Batch AF post-audit hardening (Batch AG)

**Context.** 21st workspace reset; cloned fresh at `23501d8`
(Session-79/Batch AF + the session_27/session_28 transcripts).
Provisioned per the documented order (bun 497 pkgs, `.env` dev posture
`DATABASE_URL="file:../db/custom.db"` + empty AUTH_SECRET, db push +
seed, chromium-1243 re-provisioned — the reset wiped
`~/.cache/ms-playwright/chromium_headless_shell-1243` and every
chromium test failed `browserType.launch` until
`bunx playwright install chromium`, build). Baseline re-certified COLD
first: lint ✓ tsc ✓ unit 861/861, build REAL_EXIT=0, cold e2e 421/421
(127+124+50+62+58, first pass every chunk).

**Work log.**

1. Two evidence layers before any source change: (a) the Mode-C audit
   of the Batch AF diff (`6a7245e..ed89609`) — 0 Critical / 0 High /
   2 Medium / 7 Low / 4 Informational (M1 the AF3 streak-reset racing
   an in-flight autosave from the PREVIOUS note; M2 the AF2b 768px
   Tasks-h1 fix with NO e2e pin); (b) the s80 reference re-sweep (the
   s79 class re-tagged) — ok:true, 9/9 invariants both hosts, brand
   tables byte-matched, mobile drawers green on BOTH (the
   user-flagged surface; no Tailwind v4 mobile-nav bug).
2. The standing rhythm: mobile + mid-band + landscape sweeps findings
   []. The dark sweep: **7 standing flashbulb findings** — the
   detector's `green: hits === 0` classifier says the received state's
   dark canvas was never clean through the AE/AF certifications (the
   S79 narrative recorded only the *unreadable* family). Root-caused
   each surface against the LIVE reference measured in dark mode
   through its own Settings UI (the ref's Light control is a measured
   no-op in the Light-from-dark direction — cold fresh-context logins
   render dark, the account is stuck): the ref does NOT re-theme the
   More Options button or the Calculator History toggle (both stay
   neutral-950 + light text — the clone's s69/s72-era "invert the
   ramp" inversions were drift); its Clear key is near-black + red-600
   inside its own white-digit keypad family; its Tasks aside KEEPS the
   violet-50 light pill (its own half-broken family — the clone's full
   dark theme re-themes per the AF5 clock precedent).
3. Wrote the Cycle-30 (Batch AG) plan into docs/remediation-plan.md
   BEFORE any source change (AG1-AG12 measured table + TDD todo +
   deferred-with-rationale ledger).
4. TDD, RED first: 7 mutation-target pins **7/7 RED** against the
   pre-change build (AG1-AG5 dark computed-style pins, AG6's
   note-switch ordering pin — its first draft taught the toast-retry
   trap: a `toHaveCount(0)` retries past the 5s auto-dismiss and hides
   the symptom; the executed pin reads the count instantly — AG9's
   region pin). GREEN source: the neutral variant + both Calculator
   History buttons match the ref's measured dark; the AC key + the
   GradeTracker score pills take the house dark-pill family (FIVE
   palette steps newly pinned in `@theme` — the AG3 first draft hit
   trap 10: `bg-red-950` serialized as lab() until pinned; the AG4
   first draft hit the SubjectChip locator collision); the Tasks aside
   active row moved from the inline style to the new `sf-aside-active`
   utility (light byte-identical — S6-A pins green; dark = the
   sf-today-tint token pair); the autosave streak scoped to the note
   (`selectedIdRef`; late rejections from departed notes ignored;
   successful Save resets the streak); `role="region"` on the study
   wrapper; keydown stopPropagation on the in-row Study affordance.
   Guards: AG7 mutation-proven (re-add `sm:min-w-0` → the pin fails
   "Expected: visible, Received: hidden" → reverted), AG10/AG11
   hardening pins green-verified.
5. Full cold re-certification: lint ✓ tsc ✓ unit **861/861** ✓ build
   fresh; cold e2e **431/431** (127+127+50+69+58, first pass every
   chunk; census re-derived: dark-mode 13→20, parity-session7 32→34,
   parity-session6 16→17); the dark sweep re-run: **findings 0/20
   views — the first clean dark canvas in the sweep's history**; the
   dark-mobile sweep ok; mobile + mid-band + landscape sweeps findings
   []; the s80 resweep re-run after the final build: **ok:true**.
   Environment lesson re-earned mid-verification: the resweep failures
   were a POISONED :3200 standalone (the port-owner survived a
   name-pattern kill; EADDRINUSE killed the new spawn; the old server
   served the half-replaced build's chunks as 500s) — kill by
   PORT-OWNER PID (`ss -tlnp`), never by process-name grep.
6. Evidence: `80-ref-dark-*` anchors (myday/calculator/tasks/settings
   + mobile), `80-clone-dark-*-before/after` pairs, the standard 31
   refreshed, `80-clone-mobile-*` + the resweep sweep set; agent-browser
   walkthroughs of BOTH hosts (the ref's mobile drawer navigation
   round-trip + the clone's — 20 links, drawer closes on navigate,
   scrollWidth 390 vs the ref's own 429 overflow family).
7. Docs chain: README (badge 1292, counts 861/431, the S80 session
   row), AGENTS/CLAUDE counts, the remediation-plan Cycle-30 record +
   header, vitest.config.ts stale-header fix (834 → 861), the
   flashcards-view header + the AF2b comment + the theme.ts
   avatarFrom cross-consumer note (AG12); `.env.example` verified
   current (no env surface changed this cycle).

**Stage summary.** HEAD = `23501d8` + this cycle's commit (Batch AG
source + pins + sweeps + screenshots + docs + worklog). Baselines:
e2e **431/431** (127+127+50+69+58, 30 spec files censused), unit
**861/861**, lint/tsc clean, build fresh, **dark sweep findings 0/20
(first clean dark canvas)**, dark-mobile sweep ok, mobile + mid-band +
landscape sweeps findings [], s80 resweep ok:true. Batch AG DONE.
Standing debt unchanged: Batch R (RSC structural perf — deferred on
the S75 CWV evidence); documented deferrals: the s80 audit's L1/L4 +
I2's dedicated text token.

## Session 81 (continuation 32) — the departed-settlement family + the standing-suite orchestrator seam + the Zod4 partial-defaults data-loss fix + the audit-tools rot repair (Batch AH)

**The cycle (Cycle 31).** The received state: `8ea4642` (Session-80 /
Batch AG). The 23rd workspace reset wiped the uncommitted first attempt
at this cycle mid-flight (twice — the interrupted session's log was the
blueprint; the work was redone from scratch on a fresh clone).

1. Environment re-provisioned (bun 497 pkgs, `.env`
   DATABASE_URL="file:../db/custom.db" with the db/ at the repo root —
   the Prisma CLI's first push landed one level high and was moved to
   the documented schema-anchored location; chromium-1243
   re-provisioned after the reset wiped it). Baseline re-certified
   COLD: lint ✓ tsc ✓ unit **861/861**, build green, cold e2e
   **431/431** (127+127+50+69+58, first pass every chunk).
2. Evidence layers: the Mode-C audit of the Batch AG diff (0 Critical /
   0 High / **1 Medium** — M1: the selection-mirror invariant enforced
   only by a comment; `removeNote` never settles `selectedIdRef`, so a
   deleted note's late PATCH rejection passes the AG6 guard, toasts
   the "still open" lie and re-latches the streak flag — verified in
   source against the QuillEditor unmount-flush path); the s81
   reference re-sweep (ok:true, 9/9 invariants both hosts, mobile
   drawers green on both); agent-browser mobile-nav verification on
   BOTH hosts (ref 20 links / navigates / closes / its own 416
   overflow; clone 20 links / scrollWidth 390 — no Tailwind v4
   mobile-nav bug).
3. The Cycle-31 plan written into docs/remediation-plan.md BEFORE any
   source change (AH1–AH7 + the mid-cycle amendments AH8/AH9–AH13
   recorded as they were discovered). TDD: 8 mutation-target e2e pins +
   3 data-loss pins RED at their designed assertions (incl. AH3b's
   exact trap-10 `lab(90.2247 -31.039 9.47084)`), 5 hardening pins +
   2 AH7 unit pins (one RED, the truncated-LOUD guard green-on-arrival).
   GREEN: the mirror-settlement effect, the saveNow guards on BOTH
   settle branches, the flashcards row target check, the emerald-200
   @theme pin, the preflight stderr line + the parser's trailing-prose
   tolerance, the AH8 factory fix, the AH9 data-accent restoration, the
   AH13 files-list metadata strip. Two mutation proofs run (the
   emerald-200 un-pin; the row target-check removal).
4. **The CRITICAL mid-cycle find (AH8)**: zod@4's `.partial()` does not
   suppress create-time `.default()` — every partial PATCH on every
   owned entity reset every defaulted field (a title keystroke wiped
   the note's content AND tags; every autosave wiped the tags; a task
   toggle wiped notes/subtasks/priority) — invisible to every prior
   certification through chunk isolation + file order. Fixed at
   `makeOwnedDelegate.update` (keep only the sent keys — one site
   covers all sixteen delegates). The lesson pair is in AGENTS.md's
   new lessons section.
5. **The audit-tools rot repair (AH9–AH13 + the checker fallback)**:
   the orchestrator's first end-to-end attempt surfaced four latent
   rot families (data-accent dropped from both theme application
   sites; 8 stage audits' racy pre-auth login waits; the register-409
   expectation rot; the dead `pinned` seeding field) plus the
   AI/connectivity/upload probes' rotted DOM contracts (the `<Input>`
   composer, the div transcript bubbles, the Toaster's button items,
   the dual chat+messages mocks, the amber role=status connectivity
   pill) plus the files-list base64 leak (AH13, RED-pinned and fixed
   with a select) plus the light-family checker's transparent-body
   fallback bug (parse() returns a truthy {0,0,0,a:0} — the white
   fallback never fired and glass-backed text measured against phantom
   black; fixed across all 13 checker embeddings).
6. Full cold re-certification: lint ✓ tsc ✓ unit **863/863** ✓ build
   fresh; cold e2e **444/444** (127+135+51+73+58, first pass every
   chunk; the S12-B focus-poll ceiling bumped to 15s). The standing
   suite: the orchestrator's stage-0 preflight parse PASSES (the AH7
   integration proof — the suite had never been runnable), and its
   live run took stages 0–12 green in sequence; the remaining stages
   verified individually (accent-light, dark, the 8-sweep volume
   family, the landscape-seed sweep, the desktop/midband/landscape
   accent sweeps, cwv ×2, ai-error, ai-a11y, pre15, dep-audit — all
   findings []/exit 0). The 23rd-reset environment reaps long-lived
   daemons, so the 17-minute accent-dark sweep and a single-process
   full orchestration cannot complete — recorded honestly (its
   dark-family siblings all ran green with the same checker).
7. Docs chain: README (badge 1307, counts 863/444, the S81 session
   row), AGENTS/CLAUDE counts + the S81 lessons section,
   vitest.config.ts header, the remediation-plan Cycle-31 plan +
   execution record + header, this worklog, docs/session_32.md.
   Evidence: the resweep set `81-{ref|clone}-*.png` (23 captures) +
   the AH surface captures (`81-clone-ah*.png`). `.env.example`
   verified current (no env surface changed this cycle).

**Stage summary.** Batch AH DONE: the departed-settlement family
(AH1/AH2), the flashcards keyboard guard (AH6), the emerald-200 pin
(AH3), the orchestrator seam (AH7), the Zod4 partial-defaults
data-loss fix (AH8), the audit-tools rot repair (AH9–AH13 + the
checker fallback), the files-list payload fix (AH13). Baselines: e2e
**444/444**, unit **863/863**, lint/tsc/build clean, s81 resweep
ok:true, mobile nav verified on both hosts. Standing debt unchanged:
Batch R + the documented deferrals.

## Session 82 (continuation 34) — the sixteenth delegate + the settlement self-heal + the parser single-line seam (Batch AI)

**The cycle (Cycle 32).** The received state: `b7c662f` (Batch AH
`7144e71` + the operator's session-log commit adding
`docs/session_33.md`). The 24th workspace reset wiped the workspace
(chromium-1243 re-provisioned — the standing gotcha); the repo
re-cloned clean.

1. **Baseline re-certified cold**: lint ✓ tsc ✓ unit 863/863, build
   green, cold e2e 444/444 first-pass every chunk (127+135+51+73+58).
2. **Three evidence layers** (before any source change): a Mode-C
   audit of the Batch AH diff — 0 Critical / **1 High** / 0 Medium /
   4 Low / 2 Info. The High (**H1/AI1**): the AH8 sent-keys filter
   lived ONLY in `makeOwnedDelegate.update` — the sixteenth,
   hand-written `flashcardCardDelegate` (Flashcard carries no userId;
   ownership rides the deck join) still wrote the FULL parsed object,
   so every study-mode "Correct" rating (`{mastered:true}`) silently
   reverted a hard card's difficulty to "medium" and every card-edit
   save (`{front,back,difficulty}`) silently un-mastered a mastered
   card — verified empirically through the live delegate AND in
   source at both UI call sites. The Lows: L1 (the AH1 settlement
   effect's one-directional clear never heals a stale clear that lands
   after a newer handler write — the next note's toasts swallowed),
   L2 (the parser's shrink loop skips the single-line slice — the AH7
   failure class latent), L3 (the AH4b pin's tautological `w ≥ w−1`
   assertion), L4 (the new pins' fixed sleeps — deferred, matching the
   file's standing patterns); the Infos: I1 (the upload POST's 201
   echoes the base64 `data` column), I2 (the sent-keys filter's
   unknown-key safety rests on Prisma's implicit skip-undefined).
   Plus: the s82 reference re-sweep (ok:true — 9/9 invariants both
   hosts, brand tables byte-matched, mobile drawers green on both) and
   agent-browser mobile-nav verification on BOTH hosts (ref 20
   links/navigates/closes with its own 416 overflow; clone 20 links +
   the superset skip-link at scrollWidth 390 — no Tailwind v4
   mobile-nav bug).
3. **Cycle-32 plan written into the remediation plan BEFORE any
   source change** (the doctrine), then TDD: 5 pins RED at their
   designed assertions (AI1a/AI1b/AI1c — `Expected "hard" /
   Received "medium"` and `Expected true / Received false`; AI3 the
   single-line-envelope parse; AI6 `dataAbsent`) + the AI4 sibling
   measurement green-on-arrival by design. GREEN: the shared
   `sentKeysPatch` helper at BOTH write sites (factory + card
   delegate, the deckId move-check re-based, the empty patch
   short-circuited, sent keys intersected with parsed keys), the
   unconditional settlement (AI2 — the AH1a/AH2a/AH2b family
   re-verified green as the behavioral-preservation proof), the
   parser's `end > start` bound, and the `FILE_METADATA` select on
   both create responses. One mutation proof (AI4: col-span-2 →
   col-span-1 turned the pin red at exactly the sibling assertion —
   233px vs ≥464px); the RED-first pins are their own mutation
   proofs.
4. **Full cold re-cert**: lint ✓ tsc ✓ unit **864/864** ✓ build
   fresh; cold e2e **448/448** (127+138+52+73+58 first-pass every
   chunk; the census re-derived per AP-116 — 443 real specs + 5
   chunk setups). The standing suite: the orchestrator's stage 0 +
   stages 1–12 green in sequence; the settings-roundtrip stage's one
   live finding re-ran GREEN standalone (the environmental save-wait
   flake); the remaining stages verified individually (upload-edge
   0/10, data-volume 0/10, ai-error 0/10 after a fresh limiter — the
   documented 429 test-pollution class, ai-a11y 0/4, dark-sweep 20
   views 0 dirty, accent-light + the volume family spot-checks green,
   pre15 + dep GREEN, cwv-s16 clone all GOOD, cwv-volume-stress 0 on
   the re-run — the first run's 2010ms-vs-2000ms Tasks longTaskTotal
   was throttled-median noise, recorded honestly). The s82 resweep
   re-ran after the final build: ok:true.
5. **Docs chain**: README (badge 1312, counts 864/448, the S82
   session row), AGENTS/CLAUDE counts (the AGENTS e2e row's stale
   431/old-map caught and fixed too) + the S82 lessons section
   (coverage-claim verification per write site; tautological
   assertions; the degenerate slice), vitest.config.ts header, the
   remediation-plan Cycle-32 plan + execution record + header, this
   worklog, docs/session_34.md. Evidence: `82-{ref|clone}-*.png` (18
   resweep captures) + `82-clone-ai*.png` (5 surface captures).
   `.env.example` verified current (no env surface changed this
   cycle).

**Stage summary.** Batch AI DONE: the sixteenth delegate (AI1 — the
flashcard card partial-PATCH data loss, the AH8 fix's one-site
coverage claim corrected at the hand-written delegate), the settlement
self-heal (AI2), the parser single-line seam (AI3), the AH4b tautology
replaced with the mutation-proven sibling measurement (AI4), the
schema-validated-keys intersection (AI5), and the create-response
metadata shape (AI6). Baselines: e2e **448/448**, unit **864/864**,
lint/tsc/build clean, s82 resweep ok:true, mobile nav verified on both
hosts. Standing debt unchanged: Batch R + the documented deferrals.

---
Task ID: 5-a
Agent: general-purpose (Mode-C audit)
Task: Read-only Mode-C audit of the Batch AI diff (7144e71..4ec3db2)

Work Log:
- Read the S81/S82 worklog entries + AGENTS.md's "Zod4 + certification-isolation
  lessons (S81)" and "Coverage-claim + assertion-quality lessons (S82)" sections
  first (the documented failure classes this audit hunts).
- Extracted the full diff (src: 4 files / 225 lines; tests+scripts+vitest.config:
  606 lines) and read every hunk; then read each changed source file IN FULL:
  files/route.ts (139), entities.ts (377), notes-view.tsx (791),
  suite-verdict.ts (parseAuditStdout + header), plus the surrounding context:
  http.ts (route factories + parseWith/readJson), validation.ts (every schema),
  files/[id] + files/folders/[id] + settings/preferences + flashcards cards/decks
  routes, ai/generate-cards, import/data, lib/api.ts, data.ts mutation region,
  files-view.tsx + flashcards-view.tsx consumer regions.
- AI1/AI5 verified empirically (node -e, repo's zod@4.6.5, pure logic — no
  build/test runs): flashcardSchema.partial().parse({mastered:true}) materializes
  difficulty:"medium"; strip mode drops unknown sent keys; nullableId transforms
  ""→null only when sent. Confirmed sentKeysPatch output = sent ∩ schema keys,
  the deckId move-check re-base (data.deckId is sent-only — identical condition
  to the old parsed.deckId since deckId carries no default), the empty-patch
  short-circuit shapes (factory: normalize(existing); card: the full `card` row —
  both consistent with their update paths, updatedAt correctly NOT bumped on a
  no-op).
- Write-site census (the "any OTHER site that bypasses it?" question): grep of
  every db.*.update across src → factory (15 delegates) + card delegate +
  files/folders/[id] folderDelegate (hand-written, safe — folderUpdateSchema has
  NO .default() and its own !== undefined filter) + preferences (manual filter,
  no defaults) + auth user/token updates (fixed columns) + import/data
  (full-row RESTORE semantics — intended bypass, no zod partial). Every schema
  with .default() enumerated against its update path: all land in
  sentKeysPatch or a no-default manual filter. No .partial() parse exists
  outside entities.ts.
- AI6 consumer sweep: FILE_METADATA = every FileItem column except `data`;
  all consumers verified (view GET/POST upload uses res.ok only, link create
  discards the body via apiSend, resilience C3/AH13/AI6 + s14-hardening +
  upload-edge audit read only record.id/status/error). Both create paths still
  persist the full row (select affects the response only). Authz unchanged:
  withUser on GET/POST, folder ownership 404-checked on both branches,
  userId from session, link URL regex-validated (no javascript: href).
- AI2 traced through every selectedIdRef write site (effect + selectNote +
  create submit) and every guard consumer (onContentChange both branches,
  saveNow both branches): the unconditional settle is a strict superset of the
  S81 conditional clear — the delete-departs clear is preserved (dep → null)
  and any stale clear is healed on the next dep change; handler writes can no
  longer be permanently clobbered because every dep change re-syncs. createNote
  adds the row to the store before setSelectedId, so no transient clear window.
- AI3 verified by pure-logic old-vs-new loop repro over 6 shapes: single-line +
  prose old=LOUD→new=parses (the fix); multi-line+prose unchanged; truncated
  single line and stack traces stay LOUD both forms (anti-phantom preserved);
  residual behavior change: two consecutive one-line JSON objects now returns
  the first where the old form errored (classifyAudit's shape guard backstops).
- Test quality per the S82 lessons: AI1a/b (response + LIST round-trip — not
  response-echo-only), AI1c (UI path, waitForResponse-gated, no fixed sleeps),
  AI4's sibling assertion is cross-element and algebraically genuine (the
  tautology is gone), AI6 asserts dataAbsent + listed + download, AI3 pins the
  N=1 boundary. Counts re-derived: parity-session7 45, resilience 7, 22 unit
  files / 864 its (matches the new vitest header exactly), chunk arithmetic
  127+138+52+73+58=448 with 30 spec files listed exactly once.
- Findings triaged: 0 Critical / 0 High / 0 Medium / 3 Low / 3 Informational
  (see the audit report for the ledger). Documented non-findings honored (not
  re-reported): Batch R, the s80 L1 study zombie, the AG pinned-hue sites,
  I2's text token, the deferred fixed-sleep class.

Stage Summary:
- 0 Critical / 0 High / 0 Medium / 3 Low / 3 Informational. The batch's six
  claims all verified correct: AI1 (sentKeysPatch at both partial-PATCH write
  sites, exhaustive write-site census, deckId re-base + empty-patch shapes
  correct), AI2 (converging settlement — strict superset, clear semantics
  preserved), AI3 (single-line seam fixed, anti-phantom guard intact), AI6
  (FILE_METADATA complete for every consumer, both creates persist fully),
  AI4 (the tautology genuinely replaced), AI5 (intersection is contract
  hardening with identical observable behavior). The Lows: L1 AI2's heal
  behavior is unpinned (AH1/AH2 re-runs prove preservation, not the heal);
  L2 the parser bound now returns the first line alone for multi-envelope
  stdout where the old form failed LOUD (shape-guard backstopped, contrived);
  L3 a seventeenth hand-written write site (files/folders/[id] folderDelegate)
  is safe today but outside the sentKeysPatch convention — a future .default()
  there would silently reintroduce the AH8 class. Infos: the parser's
  post-loop try is now dead-in-effect; AI5 has no pin (unverifiable through
  the API — strip mode already drops unknown keys); the card delegate's
  no-op short-circuit returns the pre-update snapshot (correct, consistent).
  No code changes made (read-only audit).

## Session 83 (continuation 35) — the convention closure + the verified-behavior accuracy + the print/focus remediation + the security bump (Batch AJ)

**The cycle (Cycle 33).** The received state: `4e070d4` (Batch AI
`4ec3db2` + the operator's session-log commits adding
`docs/session_34.md`/`session_35.md`). The 25th workspace reset wiped
the workspace (chromium-1243 re-provisioned — the standing gotcha);
the repo re-cloned clean.

1. **Baseline re-certified cold**: lint ✓ tsc ✓ unit 864/864, build
   green, cold e2e 448/448 first-pass every chunk (127+138+52+73+58).
2. **Three evidence layers** (before any source change): a Mode-C
   audit of the Batch AI diff (Task 5-a, appended below) — 0 Critical
   / 0 High / 0 Medium / 3 Low / 3 Info, all six AI claims verified
   correct in source AND empirically. The Lows: L1 (the AI2 heal
   unpinned), L2 (the parser's first-envelope-wins unpinned), L3 (the
   folder delegate — a 17th hand-written PATCH site outside the
   sentKeysPatch convention, safe today only because its schema
   carries no defaults). Plus: the s83 reference re-sweep (ok:true —
   9/9 invariants both hosts, 18 captures) and agent-browser
   mobile-nav verification on BOTH hosts (ref 20 links + its own 416
   overflow; clone 20 links + the superset skip-link at scrollWidth
   390 — no Tailwind v4 mobile-nav bug).
3. **The cycle's empirical discovery** (probed BEFORE planning): the
   S82-era comment "a Prisma update with an empty data object is
   rejected" is FALSE on Prisma 6.11 — empty PATCHes answer 200 with
   the row unchanged, and a direct client-level
   `db.user.update({data:{}})` is accepted as a no-op with
   `@updatedAt` NOT bumped. Both short-circuit comments corrected.
4. **Cycle-33 plan written into the remediation plan BEFORE any
   source change**, then TDD: AJ1's pin green-on-arrival by design
   with its protective value proven by the three-step mutation
   (add `.default(null)` + the OLD hand-filter → RED at
   `renamedParentPreserved` — the exact AH8 class detected; keep the
   default + the sentKeysPatch routing → GREEN — the routing defeats
   the class; then the mutant removed). AJ3's pin green-on-arrival,
   mutation-proven (last-envelope-wins flips it red). GREEN: the
   folder delegate routed through the exported `sentKeysPatch` (the
   17th site joins the convention), the parser's dead post-loop try
   removed, the AI2 heal acceptance + the preferences-route
   defaults-free filter certified in comments.
5. **The standing-suite layer expanded the cycle**: the orchestrator
   took stages 0–16 in sequence (killed at 17 — the environmental
   cap); stages 9–12/14–15 produced empty envelopes (the AJ7 dev-
   portal class + one dependency-reload abort). Individual re-runs:
   security 0/7, settings-roundtrip 0/5, connectivity 0/7,
   upload-edge 0/10, data-volume 0/10, ai-error 0/10, ai-a11y 0/4 —
   and TWO genuine received-tree defect families (both A/B-verified
   against the clean `4e070d4` tree, correcting the S82 record's
   "print, focus-order green in sequence" claim): **AJ5** — five
   active-state white-text surfaces with no `print-color-adjust:
   exact` (Calendar segmented tab, Timetable today badge, Exams topic
   chips, Calculator History pill, Settings theme tile — print drops
   the fills, the text goes invisible; +5 RED pins, fixed via the
   `sf-selected-tint` utility + `sf-print-exact`, all GREEN, the
   print audit 0/0 from 5/5) and **AJ6** — the Dashboard SectionLink's
   nested button tab stop with no focus indicator (+1 RED pin with
   REAL keyboard traversal, fixed with its own focus-visible ring,
   the focus audit clean). **AJ7** — the Next.js dev overlay's
   `<nextjs-portal>` intercepted drawer-bottom clicks (six sweeps,
   identical crash on the clean tree); suppressed via an init-script
   CSS rule (dev-only by construction) — mobile/midband/landscape/
   dark-mobile all 0 findings / 20 views after the patch. **AJ8** —
   the security headline: next 16.4.0 carried TWO CRITICAL
   unauthenticated RCE advisories (GHSA-2464-fhr4-w9xw +
   GHSA-673q-mjm6-r5xr, both runtime-reachable) + a Server-Actions
   DoS; bumped to 16.4.2 via `bun add` with the FULL re-verification
   ladder: rebuild green, lint/tsc clean, unit 865/865, **full cold
   re-cert 455/455** (127+138+53+79+58 first-pass every chunk), every
   API audit re-run green under the patched server, dep-audit **GREEN
   — 0 runtime-reachable** (quill 2.0.3 is the latest upstream; its
   low XSS advisory tracked, no fix available).
6. **Docs chain**: README (badge 1320, counts 865/455, the S83
   session row), AGENTS/CLAUDE counts + the S83 lessons section (the
   comment-as-hypothesis, the raw-envelope re-derivability, the
   dev-portal suppression, the nested focusable, the per-SURFACE
   print contract), vitest.config.ts header, the remediation-plan
   Cycle-33 plan + three amendments + execution record + header, this
   worklog, docs/session_36.md. Evidence: the resweep set
   `83-{ref|clone}-*.png` (18 captures) + the AJ surface captures
   (`83-clone-aj-*.png`). `.env.example` verified current (no env
   surface changed this cycle).

**Stage summary.** Batch AJ DONE: the convention closure (AJ1 — the
17th write site routed through sentKeysPatch, mutation-proven), the
verified-behavior accuracy (AJ2 — the Prisma empty-data comment
disproval), the parser documentation pin + dead-code removal (AJ3),
the certification comments (AJ4), the print-fill family (AJ5 — five
surfaces, five pins), the focus indicator (AJ6), the dev-portal sweep
repair (AJ7), and the critical-RCE security bump (AJ8 — next 16.4.2).
Baselines: e2e **455/455**, unit **865/865**, lint/tsc/build clean,
dep-audit 0 runtime-reachable, print audit 0/0, s83 resweep ok:true,
mobile nav verified on both hosts. Standing debt unchanged: Batch R +
the documented deferrals.

## Session-84 / Batch AK (Cycle 34) — the folder-tree integrity + the print-enumeration closure

**Received state**: `b0d903b` (Batch AJ `f9eacd5` + the operator's
session-log commit adding `docs/session_37.md` — both transcripts record
the completed S83/BJ cycle; this is the next cycle). Workspace reset
(26th), fresh clone, chromium-1243 re-provisioned, `.env` +
`db/custom.db` + seed restored, production build green.

**Baseline re-certified cold BEFORE any work**: lint ✓ tsc ✓ unit
**865/865** ✓; cold e2e **455/455** (127+138+53+79+58, first-pass every
chunk).

**Evidence layers (all pre-change)**: the Mode-C audit of the Batch AJ
diff (`4e070d4..f9eacd5`, delegated) — **0C/0H/0M/4L/5I**, all eight AJ
claims verified; the s84 reference re-sweep re-tagged and run (ok:true —
9/9 invariants both hosts, brand tables byte-matched, 18 captures); and
agent-browser mobile-nav verification on BOTH hosts (reference 20 links /
navigates / closes / its own 416 overflow; clone 20 links / navigates /
closes / scrollWidth 390 — **no Tailwind v4 mobile-nav bug**).

**The cycle's empirical headline (probed live before planning)**: the
audit's L4 — the folder PATCH cycle hole — verified END-TO-END:
`PATCH {parentId: <own id>}` answered **200** and persisted a
self-referencing row; a two-step A→B→A cycle likewise; with the user
inside the cycled folder, a folders refresh fed the cycle into the
files-view breadcrumb `while` walk — **the renderer wedged permanently**
(agent-browser `eval "1+1"` timed out, exit 124). One authenticated API
call froze the tab. Probe rows deleted after the repro.

**TDD execution** (plan written into the remediation plan BEFORE any
source change; mid-cycle amendments recorded when discovered):

- **AK1 (the headline)**: the four e2e pins written FIRST — verified RED
  on the pre-fix build at their designed assertions (self-parent
  200-with-self-reference-stored; the cycle's second PATCH 200 with the
  cycle persisted). GREEN: the server-side folder-tree integrity guard
  (self-parent → 400; the descendant-cycle walk — one userId-scoped
  query, the ancestor chain walked in memory with a visited set that
  also terminates on a pre-existing cycled/imported row set; the
  bogus-parent 404 contract unchanged and now pinned — the audit's L3
  coverage gap closed) + the client defense-in-depth (the breadcrumb walk
  extracted to `src/lib/folder-tree.ts` with the visited-set guard —
  EIGHT unit termination pins; MUTATION-PROVEN: the guard removed → the
  test runner itself wedges, no verdict in 120 s). Resilience file 12/12.
- **AK2**: the print-enumeration closure — the PT result circles + the
  Math Solver remove chip gain `sf-print-exact`; the My Day gradient
  block + the Flashcards deck swatch + the UserAvatar gain the inline
  property. The honest mid-cycle discovery (the AK2a RED): the deck list
  lives inside a print-hidden `<aside>` — its swatch never prints; AK2a
  reframed to pin the REAL contract (the aside-hiding rule). Four pins,
  three at the `printColorAdjust: "economy"` assertion on the pre-fix
  build → all GREEN. Accessibility file 31/31.
- **AK4**: the sentKeysPatch contract pinned at the unit seam — a
  10-shape table, green-on-arrival BY DESIGN, MUTATION-PROVEN (the
  AH8-class mutant failed 7/10 pins).
- **AK3/AK5/AK6**: the cert-header census arithmetic corrected; the
  "Prisma 6.11" comments re-labeled to the resolved runtime (6.19.3);
  eslint-config-next aligned to ^16.4.2 via `bun add -D` (lint/tsc clean,
  no rule churn).

**Re-certification**: rebuild green; lint ✓ tsc ✓ unit **883/883**
(865 + 8 folder-tree + 10 sentKeysPatch); full cold re-cert **463/463**
(127+138+57+83+58; ONE chunk-4 skip-link flake — the documented S81
late-hydration environmental class — chunk-4 cold re-run 83/83
first-pass). The s84 resweep re-run on the final build: **ok:true**. The
standing audits: security 0 (after the fresh-boot re-run — the first
"limiter shape wrong" was the failed-restart stale-server artifact),
print 0/0, focus clean (the dev-only NEXTJS-PORTAL artifact excepted),
settings-roundtrip 0, connectivity 0, data-volume 0, ai-error 0 (fresh
budget), ai-a11y 0. Mobile nav re-verified on the final build (20 links,
navigates, closes, scrollWidth 390).

**Operational lessons (recorded in AGENTS.md)**: two silent restart
failures (kill-by-wrapper-PID leaves `next-server` serving; `bun
server.js`'s bare command line defeats path-shaped greps) → the
stale-server served replaced chunks → the fresh-login wedge-at-Splash
red herring; the standing audits share the demo user's AI budget (the
security audit's spam → the ai-error audit's 429-phantom findings —
cleared on a fresh boot); the tool-result display eats `[m` sequences
(`transition-[margin]` rendered as `transition-argin]` — the hex dump
is the authority).

**Docs chain**: README (badge 1346, counts 883/463, the Session-84 row),
AGENTS/CLAUDE counts + the S84 lessons section, vitest.config.ts header,
the remediation-plan header + Cycle-34 plan + amendments + execution
record + DONE marker, this worklog, `docs/session_38.md`. Evidence:
`s84-resweep` 18 captures + 8 AK-surface captures (`84-clone-ak-*.png`).
`.env.example` verified current (no env surface changed this cycle).

**Stage summary.** Batch AK DONE: the folder-tree integrity guard (the
verified live self-DoS class closed at BOTH layers, 4 e2e pins + 8 unit
pins + 2 mutation proofs), the print-enumeration closure (3 print-visible
surfaces fixed + 2 print-hidden surfaces certified + the aside contract
pinned), the sentKeysPatch contract pinned (10 shapes, mutation-proven),
and the audit's hygiene findings (census arithmetic, comment accuracy,
eslint-config alignment). Baselines: e2e **463/463**, unit **883/883**,
lint/tsc/build clean, every standing audit green, s84 resweep ok:true,
mobile nav verified on both hosts. Standing debt unchanged: Batch R, the
study zombie, the ~27 hue consumers, I2's text token.

---

## Session-85 — Batch AL (Cycle 35): the study-groups members resurrection + the lying-type seam closure + the server-walk seam

**Received state**: `5383bb7` (Batch AK `86d11dd` + the operator's session-log commit adding `docs/session_39.md`). Provisioning: bun install (497 pkgs), `.env` from `.env.example` (DATABASE_URL="file:../db/custom.db"), db push + seed, chromium-1243 re-provisioned (the 27th workspace reset), production build green.

**Baseline re-certified cold BEFORE any work**: lint ✓ tsc ✓ unit 883/883 ✓; e2e 463/463 (127+138+57+83+58, first-pass every chunk).

**Evidence layers (all pre-change)**:
- The Mode-C audit of the Batch AK diff (`b0d903b..86d11dd`): **0 Critical / 0 High / 0 Medium / 4 Low / 4 Info** — all nine AK claims verified (the auditor re-ran the unit seams green). The Lows: L1 the one avatar-gradient print surface AK2 missed (the Study Groups member chip), L2 the sentKeysPatch value-source mutation gap, L3 the folder-guard TOCTOU (accept-and-documented), L4 the server walk's unpinned termination.
- The s85 reference re-sweep: **ok:true** (9/9 invariants both hosts, brand tables byte-matched, 18 captures).
- agent-browser mobile-nav on BOTH hosts: the reference drawer (20 LABELED links with the sidebar expanded — the icon-only collapsed state re-confirmed live via `sidebarOpen:false`, the S52 shared-state contract) and the clone drawer (26 labeled links — the superset skip-link + 20 nav + 5 content; icon-only with `title`+`aria-label` when collapsed). Both navigate + close; the reference's own 416 overflow vs the clone's 390. **No Tailwind v4 mobile-nav bug.** Collapsed-state captures saved for both hosts.

**The cycle's empirical discovery — AL1, the headline**: the Study Groups members surface has been DEAD since the initial implementation. The API ships `members` as an ARRAY (`membersFromRow`), the client's `parseMembers` ran `JSON.parse` on it (the array coerces to "[object Object]", throws, the catch returns []) — every group rendered "0 members", **addMember WIPED the existing members**, and every edit-dialog save sent `members: []` (the wipe again). Found live by the AL2 print pin's locator resolving NOTHING (a presence-failure; the page snapshot showed "0 members" against a DB row carrying [{Ari},{Sam}]). The store's own TYPE (`members: string`) had lied about the boundary for 84 sessions.

**Implemented TDD RED→GREEN**:
- **AL1**: the 3-pin e2e family (seeded-members-render / add-member-preserves / edit-save-preserves) verified RED at their designed assertions, then the pure `src/lib/group-members.ts` seam (`normalizeMembers`, 7 unit pins) + the store type corrected to `GroupMember[]` + the view wired through the seam.
- **AL2**: the member chip's inline `printColorAdjust: "exact"` (+1 e2e pin under print emulation — RED at the designed assertion post-AL1, GREEN under the property).
- **AL3**: the server cycle-walk extracted to `wouldCreateCycle` (src/lib/folder-tree.ts), consumed by the PATCH delegate — EIGHT unit pins, MUTATION-PROVEN (the guard-removal mutant WEDGES the runner, exit 124).
- **AL4**: the sentKeysPatch value-source pins (+2) — MUTATION-PROVEN (the source-substitution mutant failed exactly the two new pins; the original ten survived).
- **AL5**: the s85 resweep's probe-user cleanup (the closing delete-account POST; `probeCleanup: ok` verified on the final-build re-run).

**Re-certification**: rebuild green; lint ✓ tsc ✓ unit **900/900** (883+7+8+2); full cold re-cert **467/467** (130+138+57+84+58, first-pass every chunk, zero flakes). The s85 resweep on the final build: ok:true. The standing audits: security 0 (the first run's limiter finding was the documented S84 ordering artifact — the audit had run twice back-to-back; fresh boot + single re-run: 0), print 0/0, focus-order 0, settings-roundtrip 0, connectivity 0, data-volume 0, ai-error 0 (fresh budget), ai-a11y 0. Mobile nav re-verified on the final build.

**Operational lessons (recorded in AGENTS.md)**: a client type that disagrees with the API boundary hides live data loss (the type was the seam that knew); a pin failing at PRESENCE (not its assertion) is a discovery signal — read the page snapshot before reframing; agent-browser's `--viewport` flag does not persist across `open` calls (use `set viewport`), and a geometry-based "first button" probe at desktop width resolves the sidebar's collapse chevron, not the hamburger — its persisted state changes the drawer's rendering (the S52 shared-state behavior).

**Docs chain**: README (badge 1367, counts 900/467, the Session-85 row), AGENTS/CLAUDE counts + the S85 lessons section, vitest.config.ts header, the e2e-chunked-cert.sh header (130+138+57+84+58=467), the remediation-plan header + Cycle-35 plan + the mid-cycle discovery amendment + execution record + DONE marker, this worklog, `docs/session_40.md`. Evidence: the s85 resweep 18 captures + 4 mobile-nav captures (both hosts, both sidebar states) + 6 AL-surface captures (`85-clone-al-*.png`). `.env.example` verified current (no env surface changed this cycle).

**Stage summary.** Batch AL DONE: the members resurrection (a live data-loss defect closed at the pure seam + the corrected store type, 3 e2e + 7 unit pins), the print-closure completion (the one missed avatar-gradient surface, +1 pin), the server-walk seam (8 unit pins + the wedge mutation proof), the value-source pins (2 pins + the precise mutation proof), and the resweep probe cleanup. Baselines: e2e **467/467**, unit **900/900**, lint/tsc/build clean, every standing audit green, s85 resweep ok:true, mobile nav verified on both hosts. Standing debt unchanged: Batch R, the study zombie, the ~27 hue consumers, I2's text token.

---

## Session-86 — Batch AM (Cycle 36): the members boundary alignment + the evidence-hygiene closure

**Received state**: `f725f28` (Batch AL `16f15d7` + the operator's session-log commit adding `docs/session_41.md`). The workspace was PRESERVED this cycle (no reset — the 28 resets' streak broken). Anchors read: session_40/session_41 (both record the completed Session-85/Batch AL), the remediation plan's Cycle-35 record + standing debt, the worklog tail. Ground truth rebuilt: last completed cycle Session-85/Batch AL (Cycle 35) at `16f15d7`; baselines unit 900/900, cold e2e 467/467; standing debt Batch R, the study zombie, the ~27 hue consumers, I2's text token.

**Baseline re-certified cold BEFORE any work**: lint ✓ tsc ✓ unit 900/900 ✓; e2e 467/467 (130+138+57+84+58, first-pass every chunk, zero flakes — run chunk-by-chunk in the foreground after the detached cert died to the reaper).

**Evidence layers (all pre-change)**:
- The Mode-C audit of the Batch AL diff (`5383bb7..16f15d7`, subagent, read-only): **0 Critical / 0 High / 0 Medium / 2 Low / 5 Info** — all five AL claims verified (the auditor re-ran the unit layer green, 900/900; the API round-trip checked symmetric; no tautologies in the 17 new pins). The Lows: L1 the byte-identical s85 evidence pair (the "row" capture == the "members" capture, md5-verified, while the record claimed "does not duplicate frames"), L2 the seam/server divergence (normalizeMembers drops blank-after-trim names; studyGroupSchema's length-based min(1) ACCEPTED them — a direct-API write persisted an invisible member whose row the next member write permanently deleted). The Infos: the five→six consumer count, the AL-numbering collision in the print pin's title, the duplicated GroupMember type, the AL1c sleep-sync + happy-path-only cleanup, the script/structure nits.
- The s86 resweep (re-tagged from s85 with the I5a fix): **ok:true** (9/9 both hosts, brand tables byte-matched, probeCleanup ok — AL5 holding live, 18 captures).
- agent-browser mobile-nav on BOTH hosts: reference 24 labeled links expanded / 20 icon-only collapsed via `sidebarOpen:false` (the S52 contract re-confirmed live) / navigates / closes / scrollWidth 416; clone 26 labeled links (the skip-link superset) / 20 icon-only collapsed ALL with `title`+`aria-label` via `sf-sidebar-collapsed` / navigates / closes / scrollWidth 390 — **no Tailwind v4 mobile-nav bug, re-confirmed**.

**Implemented TDD RED→GREEN** (the Cycle-36 plan written into the remediation plan BEFORE any source change):
- **AM1** the headline: the members boundary alignment — the pin family written FIRST — 3 unit pins verified RED at their designed assertions + 2 green-by-design regression guards + the e2e API pin RED (the S87/AN2 accuracy fix: this bullet originally overclaimed "all RED") (two mid-cycle pin corrections recorded honestly: the first blank-name pin was GREEN for the wrong reason [its a@b.c email fails zod4's .email() — 1-char TLDs; every other field in a pin's payload must be unimpeachable], and the e2e pin's relative-URL fetch needed a loaded page first), then the server schema fix: studyGroupSchema members[].name/.email `.trim()`-first — blank writes rejected 400, padded values stored trimmed; the seam comment documents the alignment (the drop is defense-in-depth for legacy rows only).
- **AM2**: the byte-identical redundant capture dropped; the record's false claim corrected in place; the s86 capture script drives an interaction (a group switch) between its frames — all three captures distinct md5 (the exemplar).
- **AM3**: the "all five consumer sites" corrected to six; the print pin re-titled "AL2:" (the numbering collision resolved).
- **AM4**: the GroupMember type dedup (entities.ts imports the seam's interface).
- **AM5**: AL1c's waitForTimeout(800) → the "Study group updated" toast await; the AL1b/c cleanups in try/finally.
- **AM6**: accepted-and-documented (the two-pass PATCH scan, the resweep credentials convention).

**Re-certification**: rebuild green; lint ✓ tsc ✓ unit **905/905** (900 + 5); full cold re-cert **468/468** (131+138+57+84+58, first-pass every chunk, zero flakes). Standing audits: preflight GREEN; security 0 (fresh-boot single re-run — the first finding was the documented S84 double-run ordering artifact, cleared per the playbook); settings-roundtrip 0; connectivity 0; print 0/0; focus-order ok; data-volume 0 (300/200/250 rows); ai-error 0 (fresh budget); ai-a11y 0.

**Operational lessons (recorded in AGENTS.md as the S86 section)**: a defensive client seam stricter than the server schema is a silent-deletion edge (fix the server boundary); a pin green for the wrong reason verifies nothing (isolate the discriminating field); the daemon spawn form is the first suspect when it dies (the S32 subshell recipe is load-bearing — re-learned at the cost of the detached cert + two :3200 restarts + one mid-audit dev-server death); a relative-URL fetch inside page.evaluate needs a loaded page.

**Docs chain**: README (badge 1373, counts 905/468, the Session-86 row), AGENTS/CLAUDE counts + the S86 lessons section, vitest.config.ts header (905), the e2e-chunked-cert.sh header (131+138+57+84+58=468), the remediation-plan header + Cycle-36 plan + execution record + DONE marker, this worklog, `docs/session_42.md`. `.env.example` verified current (no env surface changed this cycle).

**Stage summary.** Batch AM DONE: the members boundary alignment (the silent-deletion edge closed at the server; the pin family accurately split: 3 RED unit pins + 2 green-by-design regression guards + 1 RED e2e pin, with the wrong-reason-green correction recorded — the "both RED-first" phrasing corrected S88/AO1, the AN2 class's fourth site), the duplicate evidence frame dropped + the claim corrected + the interaction-driving capture exemplar, the record/pin accuracy fixes, the type dedup, and the pin hygiene. New baselines: unit **905/905**, e2e **468/468**, every standing audit green, mobile nav verified on both hosts. Standing debt unchanged: Batch R, the study zombie, the ~27 hue consumers, I2's text token (the documented Session-87 candidates).

---

## Session-87 — Batch AN (Cycle 37): the pin-hygiene completion + the record-accuracy closure + the duplicate-evidence sweep

**Received state**: `0493503` (Batch AM `75d5af6` + the operator's session-log commit adding `docs/session_43.md` and `skills/pdf-old-*`; src/ untouched by the operator commit — verified by diff stat). The workspace was RESET (the 29th reset; fresh clone) — full re-provision: bun install (497 pkgs), `.env` from `.env.example` (DATABASE_URL="file:../db/custom.db"), db push + seed, chromium-1243 re-provisioned (186.8 MiB), production build green. Anchors read: session_42/session_43 (both record the completed Session-86/Batch AM), the remediation plan's Cycle-36 record + standing debt, the worklog tail. Ground truth rebuilt: last completed cycle Session-86/Batch AM (Cycle 36) at `75d5af6`; baselines unit 905/905, cold e2e 468/468; standing debt Batch R, the study zombie, the ~27 hue consumers, I2's text token.

**Baseline re-certified cold BEFORE any work**: lint ✓ tsc ✓ unit 905/905 ✓; e2e 468/468 (131+138+57+84+58, first-pass every chunk, zero flakes — the detached cert ran the S32 subshell recipe and survived to completion this time).

**Evidence layers (all pre-change)**:
- The Mode-C audit of the Batch AM diff (`f725f28..75d5af6`, subagent, read-only): **0 Critical / 0 High / 0 Medium / 2 Low / 5 Info** — all six AM claims verified (the auditor re-ran the unit layer green, 905/905; the AM1 schema verified empirically against zod4; the AM2 blob-hash census confirmed the s85 pair eliminated; the six parseMembers call sites counted). The Lows: L1 the "all RED-first" summary overclaim (the AM1 records said all-RED while pins 4-5 are green-by-design regression guards — the record contradicts its own execution record), L2 the new AM1 e2e pin lacks the try/finally cleanup AM5 established in the same batch. The Infos: I1 the plan's L2 illustration email is zod4-invalid (wrong-reason illustration), I2 the s86 capture script's fixed sleeps + the trimmed screenshot's non-discrimination, I3 four OLDER byte-identical screenshot pairs survive (the AM2 class outside the audit's diff window), I4 normalizeMembers does not trim on read (the AM1 write-side asymmetry), I5 the resweep credentials embedded in committed source (the accepted s67+ convention, residual risk).
- The s87 resweep (re-tagged from s86): **ok:true** (9/9 both hosts, brand tables byte-matched, probeCleanup ok — AL5 holding live, 18 captures).
- agent-browser mobile-nav on BOTH hosts: reference 24 labeled links expanded / 20 icon-only collapsed via `sidebarOpen:"false"` with ZERO title/aria (the S52 contract re-confirmed live — with the mid-cycle discovery that the agent-browser profile PERSISTS localStorage across sessions: the drawer's first open rendered icon-only because a previous session's probe left `sidebarOpen:"false"`; read the key before interpreting the rendering, restore after — recorded as the S87 lesson 5) / navigates to /Notes / closes / scrollWidth 416; clone 26 labeled links (the skip-link superset) / 20 icon-only collapsed ALL with `title`+`aria-label` via `sf-sidebar-collapsed` / navigates / closes / scrollWidth 390 — **no Tailwind v4 mobile-nav bug, re-confirmed for s87**.

**Implemented TDD RED→GREEN** (the Cycle-37 plan written into the remediation plan BEFORE any source change):
- **AN1** the AM1 e2e pin's own stamped-row cleanup: the evaluate returns the created id alongside the status, the assertions ride a try/finally that deletes the row on every path — the AM5 convention applied to the pin AM5 itself shipped in the same batch (the same-batch hygiene inconsistency closed; the parity-session8 family re-verified 58/58).
- **AN2** the record-accuracy closure: the three AM1 summary records corrected to "3 RED + 2 green-by-design regression guards + 1 RED e2e API pin" (README's Session-86 row, session_42's DONE bullet, the worklog's AM1 bullet — each correction self-labeling S87/AN2 so the trail stays auditable).
- **AN3** the duplicate-evidence sweep: the four older pairs re-verified byte-identical in-cycle (md5), the second name of each dropped (11-mobile-navigation, 77-ref-notes-populated, 77-ref-flashcards-with-cards, 84-clone-ak-files-guard; the first retains each frame); verified pre-drop that no spec/standing-audit/doc references the session-numbered names — the frozen historical capture scripts only WRITE them.
- **AN4** the read-side trim symmetry: 2 unit pins written FIRST and verified RED at their designed assertions (a padded member name/email returned verbatim pre-fix), then the one-line seam fix (`name.trim(), email.trim()` on the return) — both sides of the members boundary now normalize identically; the capture script's header records the honest evidence posture (HTML collapses whitespace; the unit pins carry the proof — the accepted I2 posture, stated at the script site).
- **AN5** the plan's L2 illustration annotated (the zod4-invalid example email; the valid-payload pointer).
- **AN6** accepted-and-documented (the resweep credentials — the s67+ convention, the git-history exposure makes source-only removal cosmetic; the capture script's fixed sleeps + screenshot non-discrimination — the "visible surface" claim is accurate).

**Re-certification**: rebuild green; lint ✓ tsc ✓ unit **907/907** (905 + 2 AN4 pins); full cold re-cert **468/468** (131+138+57+84+58, first-pass every chunk, zero flakes — census unchanged: AN1 modifies a pin in place). Standing audits: preflight GREEN; security 0 findings on a fresh-boot single re-run (the first finding — the AI-route limiter shape, cutoffAt=1 — was the documented S84 ordering artifact, reproduced by the auditor's OWN triple back-to-back run; kill-by-PID + fresh boot + single re-run cleared it per the playbook); settings-roundtrip 0; connectivity 0; print 0/0 (light + dark); focus-order 0; data-volume 0; ai-error 0 (10 nonGaps, fresh budget); ai-a11y 0 (4 nonGaps).

**Docs chain**: README (badge 1375, counts 907/468, the Session-87 row), AGENTS/CLAUDE counts + the S87 lessons section (the summary-overclaim lesson; the same-batch hygiene-convention lesson; the whole-directory duplicate-frame census lesson; the read-side symmetry lesson; the agent-browser persisted-localStorage lesson), vitest.config.ts header (907), the e2e-chunked-cert.sh header (the S87 census-unchanged note), the remediation-plan header + Cycle-37 plan + execution record + DONE marker, this worklog, `docs/session_44.md`. `.env.example` verified current (no env surface changed this cycle).

**Stage summary.** Batch AN DONE: the pin-hygiene completion (the AM1 pin's own cleanup), the record-accuracy closure (three overclaiming summaries corrected), the duplicate-evidence sweep (four historical byte-identical pairs dropped after in-cycle md5 verification), the read-side trim symmetry (2 RED-first unit pins + the one-line seam fix), and the accepted-and-documented residuals. New baselines: unit **907/907**, e2e **468/468**, every standing audit green, mobile nav verified on both hosts, the s87 interaction-driven captures all distinct. Standing debt unchanged: Batch R, the study zombie, the ~27 hue consumers, I2's text token (the documented Session-88 candidates).

---

## Session-88 — Batch AO (Cycle 38): the zombie kill + the token decoupling + the symmetry completion

**Received state**: `4402e4c` (Batch AN `db9acb4` + the operator's session-log commit adding `docs/session_45.md`; src/ untouched by the operator commit — verified by diff stat). The workspace was PRESERVED (provisioning intact: node_modules, db, chromium-1243). Anchors read: session_44/session_45 (both record the completed Session-87/Batch AN), the remediation plan's Cycle-37 record + standing debt, the worklog tail. Ground truth rebuilt: last completed cycle Session-87/Batch AN (Cycle 37) at `db9acb4`; baselines unit 907/907, cold e2e 468/468; standing debt Batch R, the study zombie (s80 L1), the ~27 hue consumers, I2's text token.

**Baseline re-certified cold BEFORE any work**: lint ✓ tsc ✓ unit 907/907 ✓; production build green; full cold 5-chunk e2e **468/468** (131+138+57+84+58, first-pass every chunk, zero flakes — the S32 subshell recipe).

**Evidence layers (all pre-change)**:
- The Mode-C audit of the Batch AN diff (`0493503..db9acb4`, delegated read-only): **0 Critical / 0 High / 0 Medium / 2 Low / 5 Info** — all six AN claims verified; AN3's closure empirically exceeded (an independent whole-directory md5 census over all 701 captures: zero duplicate pairs remain). The Lows: L1 the worklog's own AM stage summary still overclaims "both RED-first" (the AN2 class's fourth site — 13 lines below the corrected AM1 bullet), L2 parity-session7.spec.ts has ZERO finally (its four stamped pins — AH8c, AI1a/b/c — clean up on the happy path only).
- The AO-candidate evaluation (pre-plan): the study zombie's render-phase fix verified probe-first (an inline ESLint probe passes the repo's config verbatim for the React-documented render-phase state adjustment); the zombie's deterministic driver confirmed (rate's own PATCH→GET refresh carrying an external deletion between its legs, via page.route); the store's reload semantics verified (flashcards refills are atomic — no transient empty that would false-kill a session on refresh); the mobile in-row Study path verified (selectDeck + startStudy batch in one event).

**Implemented TDD RED→GREEN** (the Cycle-38 plan written into the remediation plan BEFORE any source change):
- **AO4** the headline — the study-zombie structural kill (the s80 audit's L1, deferred three cycles because the obvious fix is an effect + setState, which the repo's lint gate forbids): the pin written FIRST, verified RED on the pre-fix build at the designed discriminator (the latched `studying` resurrects study mode on the refilled card — the card grid never returns; the RED snapshot captured "1 / 1" restored on the refill), then the fix: the React-documented render-phase state adjustment in flashcards-view.tsx (setState during render of the same component, guarded to terminate — NO effect). GREEN on the rebuilt server.
- **AO3** the API read-boundary symmetry completion (the audit's Info 1 — AN4 stopped one layer short): `membersFromRow` exported (the sentKeysPatch pure-seam precedent) and routed through `normalizeMembers` in entities.ts — the API GET boundary no longer ships legacy padded members verbatim. 2 RED-first unit pins (the array-tolerance assertion rides inside the first RED pin) + 1 error-semantics guard family (corrupt JSON → [], a non-row value passes verbatim, null/absent → [] — the third `it`'s actual content; corrected S89/AP4, the AN2 class's fifth site) (restructured mid-cycle to RED at the designed assertions — the S87 lesson 1 applied). Unit layer green at 910/910.
- **AO5** the dedicated clock-date token (the standing I2 debt — the cross-consumer coupling closed): `clockDateDark` added to AccentToken + all 7 accents (carrying the SAME 400-step values — computed colors byte-identical), emitted as `--sf-primary-clock-date-dark` (accentCssVars 15 → 16 entries), the S3-J var-count pin RED at 16 pre-token / GREEN post, the boot script's seven TOKENS name-lists extended at the SAME index (the VALUES insertion-order sync contract), the `:root` default + `.sf-clock-date`'s dark branch switched in globals.css, the AF5 comments updated (globals.css + dark-mode.spec.ts). Every AF5/AG11a pin green — the avatar gradient and the clock-date text retunable independently.
- **AO2** the four stamped pins in parity-session7.spec.ts (AH8c task, AI1a/AI1b/AI1c decks — the audit's L2, the AN1/AM5 class in the file that never got it) wrapped in try/finally: the stamped rows delete on EVERY path, not just the happy one. Test-only; cold-cert immune (db/e2e.db re-created per chunk).
- **AO1** the record-accuracy fourth site (the audit's L1 — the AN2 class): the worklog's own AM stage summary corrected to the accurate pin split ("3 RED unit pins + 2 green-by-design regression guards + 1 RED e2e pin"), self-labeling S88/AO1.
- **AO6** accepted-and-documented (the fresh-user probe stranding — cold-cert re-creates the db; the frozen historical capture scripts — re-running them would resurrect the AN3-dropped duplicates).

**Operational incident, root-caused and recorded as the S88 lesson 1**: the post-AO5 rebuild was run as `npx next build` — which BYPASSES the package.json postbuild static copy (`cp -r .next/static .next/standalone/.next/`), producing a standalone that serves SSR green (health 200) while every static chunk 404s. The entire e2e family then hung at hydration-waits (45.1s timeouts) with nothing pointing at the assets; the AO source was NEVER broken. Diagnosed by curling one static chunk; the canonical `bun run build` + re-run verified 85/85 on the affected family. Lesson: build with the package-manager script; when a whole e2e family times out at once, check one static chunk before suspecting source.

**Re-certification**: canonical rebuild green; lint ✓ tsc ✓ unit **910/910** (907 + 3 AO3 tests); full cold re-cert **469/469** (131+139+57+84+58, first-pass every chunk, zero flakes — parity-session7 +1 for the AO4 pin). The standing suite **34/35** (preflight GREEN; every sweep family green; ai-error 0 with 10 nonGaps; ai-a11y 0 with 4 nonGaps; the ONE finding: cwv-volume-stress's Tasks longTaskTotal 2098–2288ms vs the 2000ms budget — root-caused as the S82 throttled-median noise-floor class, NOT a cycle regression: a stash-A/B against the received AN tree measured the SAME tree at 1978 green / 2073 red, no AO diff touches the Tasks load path, and the db counts verified clean (12 seed tasks, no accumulation); recorded honestly, the budget NOT weakened, the re-anchoring named as future-cycle standing debt).

**The s88 resweep** (re-tagged from s87): **ok:true** (9/9 both hosts, brand tables byte-matched, probeCleanup ok — AL5 holding live, 18 captures).

**agent-browser mobile-nav on BOTH hosts**: reference 24 labeled links expanded / 20 icon-only collapsed via `sidebarOpen:"false"` with ZERO title/aria (the S52 contract re-confirmed live; the persisted key READ before interpreting the rendering and restored after — the S87 lesson 5 applied) / navigates to /Notes / closes / scrollWidth 416 (the reference's own overflow); clone 26 labeled links (the superset skip-link) / 20 icon-only collapsed ALL with `title`+`aria-label` via `sf-sidebar-collapsed` / navigates to /Notes / closes (only the off-screen x=-9999 skip-link remains — by design) / Escape closes / scrollWidth 390 — **no TailwindCSS v4 mobile-nav bug, re-confirmed for s88**.

**The s88 evidence captures** (4 frames, all md5-DISTINCT): the AO4 zombie surface pair (the emptied deck's guard fall-through + the refilled card grid with study mode NOT resurrected) + the AO5 clock chip in violet/teal dark (the dedicated token retuning with the accent). The probe deck cleaned in the finally; the demo surface restored (accent violet, mode light).

**Docs chain**: README (badge 1379, counts 910/469, the Session-88 row), AGENTS/CLAUDE counts + the S88 lessons section (the standalone-static-copy lesson; the noise-floor-budget A/B discriminator; the render-phase zombie kill; the token deduplication), vitest.config.ts header (910), the e2e-chunked-cert.sh header (131+139+57+84+58=469), the remediation-plan Cycle-38 plan + execution record + DONE marker, this worklog, `docs/session_46.md`. `.env.example` verified current (no env surface changed this cycle).

**Stage summary.** Batch AO DONE: the study-zombie killed structurally at last (the render-phase adjustment — three cycles deferred, now closed without the forbidden effect), the API read-boundary symmetry completed one layer deeper (membersFromRow through normalizeMembers), the clock-date token decoupled from the avatar gradient (the I2 standing debt closed), the parity-session7 pin hygiene closed (the four stamped pins finally-wrapped), and the record-accuracy fourth site corrected. New baselines: unit **910/910**, e2e **469/469**, the standing suite 34/35 (the cwv noise-floor finding recorded honestly, the budget unchanged), mobile nav verified on both hosts. Standing debt after AO: Batch R (RSC structural perf), the ~27 AG-pinned-hue consumers (L4, unchanged), the cwv-volume-stress budget re-anchoring (named this cycle).

---

## Session-89 — Batch AP (Cycle 39): the partial-empty zombie variant + the spec environment-immunity + the boot-list mechanical pin

**Received state**: `70bd199` (Batch AO `8e3b9d0` + the operator's two commits: `9846a69` adding `docs/session_47.md` [the full S88 transcript, 172 lines] + `skills/web-application/` [the four-sibling distillation skill + its evaluation report — assessed as reference material, not a directive], and `70bd199` batch-expanding skills/ [animate-expo, apple-design, and ~130 more; src/ untouched by both — verified by diff stat]). The workspace was RESET (the 30th reset; fresh clone) — full re-provision: bun install (497 pkgs), `.env` from `.env.example` (DATABASE_URL="file:../db/custom.db"), db push + seed, chromium-1243 re-provisioned (114.3 MiB), canonical production build green. Anchors read: session_46 (the S88 short transcript) + session_47 (the operator-committed full S88 transcript), the remediation plan's Cycle-38 record + standing debt, the worklog tail. Ground truth rebuilt: last completed cycle Session-88/Batch AO (Cycle 38) at `8e3b9d0`; baselines unit 910/910, cold e2e 469/469, the standing suite 34/35 (the cwv noise-floor finding documented, budget unchanged). Standing debt: Batch R, the ~27 AG-pinned-hue consumers, the cwv-volume-stress budget re-anchoring.

**Baseline re-certified cold BEFORE any work**: lint ✓ tsc ✓ unit 910/910 ✓; the 5-chunk cold cert's chunk-5 first pass carried **1 failed** — root-caused as a PROVISIONING deviation, not a source regression: the s22-boot-guard negative spawn omits AUTH_SECRET, but the standalone server's Next loadEnvConfig auto-loads the repo-root `.env`, and this workspace's provisioning had generated a REAL secret (a legal posture per `.env.example`'s own guidance) — the guard saw a valid boot and never exited (the spec's 20s exit-wait). The empty-secret posture restored, the chunk re-run green at 58/58 → **469/469** confirmed. The discovery named as the AP2 candidate (a spec environment-immunity hardening, not a source fix).

**Evidence layers (all pre-change)**:
- The Mode-C audit of the Batch AO diff (`4402e4c..8e3b9d0`, delegated read-only, against skills/web-app-foundation + the operator's new skills/web-application): **0 Critical / 0 High / 0 Medium / 1 Low / 4 Info** — all six AO claims verified TRUE (the auditor re-ran the unit layer green 910/910, verified the AO4 render-phase termination + the mobile in-row batching path, the AO5 three-site index alignment per accent, the AO3 single-caller blast radius, and the e2e finally completeness). The Low: **L1** the partial-empty zombie variant — AO4's unlatch covered only the all-gone case; the Infos: I1 the AO3 pin-classification wording, I2 the boot-script TOKENS×VALUES sync contract's missing machine guard (the value-equal blind spot), I3 the AO2 stamped-create-outside-try edge, I4 the clockDateDark-equals-avatarFrom retune tripwire memo.
- The s89 resweep (re-tagged from s88, with the capture-prefix re-tag completed honestly after the first run overwrote the 88-* history — git-restored and re-run): **ok:true** (9/9 both hosts, brand tables byte-matched, probeCleanup ok, 18 captures).
- agent-browser mobile-nav on BOTH hosts: reference 24 labeled links expanded / 20 icon-only collapsed via `sidebarOpen:"false"` with ZERO title/aria (the S52 contract re-confirmed; the persisted key READ before interpreting the rendering and restored after — the S87 lesson 5 applied) / navigates to /Notes / closes / scrollWidth 416 (the reference's own overflow); clone 26 labeled links (the superset skip-link) / 20 icon-only collapsed ALL with `title`+`aria-label` via `sf-sidebar-collapsed` / navigates / closes / Escape / scrollWidth 390 — **no Tailwind v4 mobile-nav bug, re-confirmed for s89**.

**Implemented TDD RED→GREEN** (the Cycle-39 plan written into the remediation plan BEFORE any source change):
- **AP1** the headline — the partial-empty zombie variant killed (the audit's L1, AO4's coverage gap): the unlatch read `deckCards.length === 0` while the study pane's render guard reads `studyCard` — conditions differing in SHAPE, and the partial external deletion (`0 < length ≤ studyIndex`) fell in the gap: no card at the index, deck non-empty, `studying` latched behind the fall-through render; any refill (UI Add Card, AI Generate's N-card batch) passively resurrected study mode. The pin written FIRST (a 3-card study; the rate-refresh GET carries a 2-of-3 deletion between its legs; the UI refill after) and verified RED on the pre-fix build at the designed discriminator — the RED snapshot captured `region "Study mode"` resurrected at "2 / 2" ON THE REFILLED CARD. The fix: the unlatch condition reads `!studyCard` — the SAME expression the render branch decides on, subsuming the all-gone case (the normal path keeps studyCard defined via rate's clamp); the comment names both variants. GREEN on the rebuilt server; the AO4 all-gone pin green beside it.
- **AP2** — the s22-boot-guard spec's environment immunity (the live in-cycle discovery): the negative spawn sets `AUTH_SECRET: ""` explicitly instead of relying on absence — Dotenv-class loaders do NOT overwrite an already-set variable, so the empty value survives the standalone server's own `.env` auto-load and the guard's documented missing/empty semantics fire regardless of the workspace `.env`'s state. RED demonstrated on the real-secret `.env` (the 20s hang — the same failure the chunk-5 first pass caught), GREEN on the SAME environment (308ms) + green on the empty-secret posture (3.1s). In-place spec modification — census unchanged.
- **AP3** — the boot-script TOKENS×VALUES mechanical pin (the audit's I2): the new unit pin parses the seven TOKENS lists out of the THEME_BOOT_SCRIPT string and asserts, for every accent, list === the accentCssVars key-order suffixes AND length === Object.values' — the mechanical guard the hand-maintained insertion-order contract never had (the value-equal blind spot: every accent's clockDateDark === avatarFrom today, so an index slip between value-equal neighbors would stay green forever). Green-by-design + MUTATION-PROVEN (dropping one name from the violet list → exactly the new pin RED; restored → 15/15).
- **AP4** — the record-accuracy fifth site (the audit's I1, the AN2 class): the AO3 records' "1 array-shape guard" corrected to "1 error-semantics guard family (the array-tolerance assertion rides inside the first RED pin)" at the two sites (this worklog's AO3 bullet above + the remediation-plan Cycle-38 record), each self-labeling S89/AP4.
- **AP5** — accepted-and-documented (the I4 memo: theme.test.ts's clockDateDark-equals-avatarFrom pin is the byte-identical design's own regression guard, already comment-declared — the retune cycle must update that line).

**Re-certification**: canonical rebuild green; lint ✓ tsc ✓ unit **911/911** (910 + the AP3 pin); full cold 5-chunk re-cert **470/470** (131+140+57+84+58, first-pass every chunk, zero flakes — chunk 2 carries the AP1 pin at 140; chunk 5 first-pass green with AP2's immunity live). The standing suite **35/35 GREEN** (preflight GREEN; every sweep family green; cwv-volume-stress included this cycle — the Tasks longTaskTotal measured inside the 2000ms budget on the noise floor's good side, the same tree that measured 1978–2288 run-to-run in S88; the budget unchanged, the guardrail never weakened). The s89 resweep re-run on the FINAL build: ok:true (probeCleanup ok). Mobile nav re-verified on the final build (26 labeled / navigates / closes / scrollWidth 390).

**The s89 evidence captures** (2 frames, md5 6182d281/c75e6e9b — all DISTINCT): the AP1 partial-empty surface pair (the mid-study partial deletion's two-pane with the surviving card in the grid + the refilled grid with study mode NOT resurrected). The probe deck cleaned in the finally; the demo surface restored.

**Docs chain**: README (badge 1381, counts 911/470, the Session-89 row), AGENTS/CLAUDE counts + the S89 lessons section (the negative-spawn `.env`-leak immunity lesson; the unlatch-vs-render condition-shape lesson; the mechanical string-level sync-pin lesson), vitest.config.ts header (911), the e2e-chunked-cert.sh header (131+140+57+84+58=470), the remediation-plan Cycle-39 plan + execution record + DONE marker, this worklog, `docs/session_48.md`. `.env.example` verified current (git-tracked, keys match, no env surface changed this cycle).

**Stage summary.** Batch AP DONE: the partial-empty zombie variant killed at the condition-shape seam (the unlatch now decides on the same expression the render guard reads — the s80/s88 family fully closed), the s22 boot-guard spec made environment-immune (the negative spawn's explicit-empty AUTH_SECRET survives any workspace `.env`), the boot-script sync contract mechanically pinned (MUTATION-PROVEN), and the AO3 record classification corrected. New baselines: unit **911/911**, e2e **470/470**, the standing suite 35/35 (cwv green this cycle, budget unchanged). Standing debt after AP: Batch R (RSC structural perf), the ~27 AG-pinned-hue consumers (L4, unchanged), the cwv-volume-stress budget re-anchoring (the S82 noise-floor class — this cycle measured green; the re-anchoring stays named as future-cycle work).

---

## Session-90 — Batch AQ (Cycle 40): the AP3 third-leg closure + the pin-setup hygiene + the record-accuracy sweep

**Received state**: `e5b7156` (Batch AP `f2e7e31` + the operator's session-log commit adding `docs/session_49.md` [the full S89 transcript, 116 lines]; src/ untouched by the operator commit — verified by diff stat). The workspace was RESET (the 31st reset; fresh clone) — full re-provision: bun install (496 pkgs), `.env` from `.env.example` (DATABASE_URL="file:../db/custom.db", AUTH_SECRET empty), db push + seed, chromium-1243 re-provisioned (114.3 MiB), canonical production build green. Anchors read: session_48 (the S89 short transcript) + session_49 (the operator-committed full S89 transcript), the remediation plan's Cycle-39 record + standing debt, the worklog tail. Ground truth rebuilt: last completed cycle Session-89/Batch AP (Cycle 39) at `f2e7e31`; baselines unit 911/911, cold e2e 470/470, the standing suite 35/35. Standing debt: Batch R, the ~27 AG-pinned-hue consumers, the cwv-volume-stress budget re-anchoring. The operator's closing note named the auditor's I3 (stamped create outside try) as the low-cost next-cycle candidate.

**Baseline re-certified cold BEFORE any work**: lint ✓ tsc ✓ unit 911/911 ✓; the full cold 5-chunk e2e cert **470/470** (131+140+57+84+58, first-pass every chunk, zero flakes).

**Evidence layers (all pre-change)**:
- The Mode-C audit of the Batch AP diff (`70bd199..f2e7e31`, delegated read-only, against skills/web-app-foundation + the operator's skills/web-application): **0 Critical / 0 High / 0 Medium / 3 Low / 4 Info** — all five AP claims verified TRUE (the auditor re-ran the unit layer green 911/911, verified the AP1 unlatch/render-guard complement arithmetic, the AP2 loader non-overwrite in the bundled @next/env source, and independently reproduced the AP3 mutation proof out-of-repo). The Lows: L1 the README Session-89 row GLUED onto the Session-88 row's physical line (8 pipes, 12,349 bytes — INVISIBLE in rendered GitHub markdown, the AN2 record-accuracy class), L2 the stale e2e census at three sites (AGENTS 469, CLAUDE 469, the cert header's 464 real specs), L3 the AP3 pin's blind spot (the ACCENT_TOKENS literals' own key insertion order — the order the boot script's VALUES generator rides — never pinned; a value-equal key reorder keeps both AP3 legs green while the pre-paint script pairs names with wrong values; probe-reproduced). The Infos: I1 the AO4/AP1 stamped cards created BEFORE the try (a failed card-create leaks the deck past the finally — the operator-named candidate), I2 the resweep probe credentials (the pre-existing convention, accepted), I3 the AP2 comment's loader attribution (imprecise wording, mechanism correct), I4 the index-based study cursor (the deliberate AO4/AP1 scope, accepted).
- The s90 resweep (re-tagged from s89, every `89-` prefix replaced — the S89 overwrite lesson applied): **ok:true** (9/9 invariants both hosts, brand tables byte-matched, probeCleanup ok, 18 captures).
- agent-browser mobile-nav on BOTH hosts: reference 24 labeled links expanded / 20 icon-only collapsed via `sidebarOpen:"false"` with ZERO title/aria (the S52 contract re-confirmed live; the persisted key READ before interpreting the rendering and restored after — the S87 lesson 5 applied) / navigates to /Notes / closes / scrollWidth 416 (the reference's own overflow); clone 26 labeled links (the superset skip-link) / 20 icon-only collapsed ALL with `title`+`aria-label` at w-80px via `sf-sidebar-collapsed` / navigates / closes / Escape / scrollWidth 390 — **no Tailwind v4 mobile-nav bug, re-confirmed for s90**.

**Implemented TDD RED→GREEN** (the Cycle-40 plan written into the remediation plan BEFORE any source change):
- **AQ1** the headline — the AP3 pin's third-leg closure (the audit's L3): the NEW unit pin in theme.test.ts pins the parsed script TOKENS lists against `Object.keys(ACCENT_TOKENS[a])` — the literals' OWN key insertion order, the exact order the boot script's VALUES generator (`Object.values`) rides. The pin's FIRST run went RED and the strong form forced the discovery: `primaryFg` reads `--sf-primary-foreground` (script name `foreground`) — the ONE vocabulary exception to the mechanical kebab, verified against accentCssVars and comment-documented AT the assertion. Green after the mapping; MUTATION-PROVEN live: the violet `emptyTo`/`emptyFrom` key reorder (applied → RED at exactly the new pin with the AP3 pin GREEN beside it → reverted → green, git-diff clean) — the blind spot demonstrated empirically. The triangle closed transitively: accentCssVars keys == script names == literal insertion order == Object.values order. Unit 911 → 912.
- **AQ2** the AO4/AP1 stamped-create-outside-try hygiene (the audit's I1, the operator-named candidate): both pins restructured — the try opens immediately after the deck create (the finally's `deck.id` dependency preserved), the card creates ride INSIDE the try so a failed card-create cascades through the cleanup on every path. Scope verified; lint/tsc clean; both pins re-run GREEN cold; census unchanged (in-place).
- **AQ3** the README Session-89 row split (the audit's L1): the glued 8-pipe line split into two proper 4-pipe rows, the stray blank dropped, the Docs row rejoins the table.
- **AQ4** the count re-anchor trio (the audit's L2): AGENTS 470 (131+140+57+84+58), CLAUDE 470 specs, the cert header's real-specs line 465 (+ the S89 pin).
- **AQ5** the stale-header sweep: the remediation plan's own header (AN-era 907/468 → AQ 912/470), README's File-Hierarchy + Testing sections (S84-era 883/463 → 912/470), the badge 1381 → 1382.
- **AQ6** the AP2 comment's loader attribution made precise (the audit's I3): the build-time `.next/standalone/.env` copy via the bundled @next/env, Bun's cwd auto-load noted, the non-overwrite cited — comment-only, mechanism and immunity unchanged.

**Operational incident, root-caused and recorded as the S90 lesson 5**: after the canonical rebuild, the stale :3200 standalone survived the cert script's `server.js` grep-kill — the standalone server RETITLES its process (`next-server (v1.x)`), so the ps command-line match finds nothing after boot. Killed by its LISTENING-PORT PID (`ss -tlnp`), the port verified dead by curl, a fresh server started from the final build. The S84 kill lesson extended: the process title is not the command line.

**Re-certification**: canonical rebuild green; lint ✓ tsc ✓ unit **912/912** (25 files); full cold 5-chunk re-cert **470/470** (131+140+57+84+58, first-pass every chunk, zero flakes); the standing suite **35/35 GREEN** (cwv-volume-stress measured inside the 2000ms Tasks budget this run — the S82 noise-floor class documented, the budget unchanged); the s90 resweep re-run on the FINAL build: ok:true (probeCleanup ok); mobile nav re-verified on the final build (26 labeled / Escape / 20 icon-only ALL title+aria / scrollWidth 390).

**The s90 evidence captures** (2 frames, md5 cb1cf5bf/a822a484 — all DISTINCT): the guarded token surface pair — the dark dashboard under accent TEAL and under accent ORANGE, switched through the REAL Settings accent-picker interaction (the AM2 rule), each followed by the reload that exercises the boot script's pre-paint pass. The demo surface restored (violet/light) in the finally.

**Docs chain**: README (badge 1382, counts 912/470, the Session-90 row — properly formatted this cycle, the AQ3 class closed), AGENTS/CLAUDE counts + the S90 lessons section (the third-leg sync-pin lesson; the green-by-design-pin-goes-RED lesson; the fixture-scope lesson; the glued-row lesson; the retitled-process kill lesson), vitest.config.ts header (912), the e2e-chunked-cert.sh header (465 real specs), the remediation-plan header refresh + Cycle-40 plan + execution record + DONE marker, this worklog, `docs/session_50.md`. `.env.example` verified current (untouched; no env surface changed this cycle).

**Stage summary.** Batch AQ DONE: the AP3 sync pin's third leg closed (the ACCENT_TOKENS literals' own insertion order — the Object.values ride — now machine-guarded, MUTATION-PROVEN with the blind spot demonstrated live, the `primaryFg` vocabulary exception discovered by the pin's own first RED run), the AO4/AP1 stamped fixtures ride inside their cleanup try, the README's invisible Session-89 row repaired at the pipe level, the three stale count sites re-anchored, the stale headers refreshed, and the AP2 comment made precise. New baselines: unit **912/912**, e2e **470/470**, the standing suite 35/35. Standing debt after AQ (unchanged): Batch R (RSC structural perf), the ~27 AG-pinned-hue consumers (L4), the cwv-volume-stress budget re-anchoring (the S82 noise-floor class — measured green again this cycle).

---

## Session-91 — Batch AR (Cycle 41): the cwv noise-floor budget re-anchor + the cert port-kill + the hygiene sweep

**Received state**: `fa76b7c` (Batch AQ `f920ce3` + the operator's session-log commit adding `docs/session_51.md` [the full S90 transcript, 95 lines]; src/ untouched by the operator commit — verified by diff stat). Fresh clone — full re-provision: bun install (496 pkgs), `.env` from `.env.example` (DATABASE_URL="file:../db/custom.db", AUTH_SECRET empty), db push + seed, chromium-1243 re-provisioned (114.3 MiB), canonical production build green. Anchors read: session_50 (the S90 short transcript) + session_51 (the operator-committed full S90 transcript with the closing note naming the cwv re-anchoring and the hue-consumer cycle as the natural next-sized batches), the remediation plan's Cycle-40 record + standing debt, the worklog tail. Ground truth rebuilt: last completed cycle Session-90/Batch AQ (Cycle 40) at `f920ce3`; baselines unit 912/912, cold e2e 470/470, the standing suite 35/35. Standing debt: Batch R, the ~27 AG-pinned-hue consumers, the cwv-volume-stress budget re-anchoring.

**Baseline re-certified cold BEFORE any work**: lint ✓ tsc ✓ unit 912/912 ✓; the full cold 5-chunk e2e cert **470/470** (131+140+57+84+58, first-pass every chunk, zero flakes).

**Evidence layers (all pre-change)**:
- The Mode-C audit of the Batch AQ diff (`e5b7156..f920ce3`, delegated read-only, against skills/web-application §18–§20 + skills/web-app-foundation): **0 Critical / 0 High / 1 Medium / 3 Low / 5 Info** — all six AQ claims verified TRUE (AQ1's mutation proof independently reproduced out-of-repo at /tmp/aq1-audit; the true census re-derived empirically: `playwright test --list` = 466 in 31 files = 465 real specs + 1 setup; the per-chunk listings 131/140/57/84/58; the static rg census reads 425 because loop-generated tests multiply at runtime — the listing is authoritative). The M: the cert script's stale-server kill is dead code against retitled servers (M1 → AR2). The Lows: the S76 pill test's stamped creates outside the try (L1 → AR3), the README pipe-parity residuals (L2 → AR5), the resweep probe-user cleanup on the success path only (L3 → AR4). The Infos: the probe credentials (I1, accepted convention), the capture script's soft md5 gate + unpinned DATABASE_URL (I2 → AR7), the narrower create-outside-cleanup windows (I3, swept with AR3 opportunistically noted), the PAD's missing current-count anchor (I4 → AR6).
- The s91 resweep (re-tagged from s90 with the S91/AR4 restructure baked in): **ok:true** (9/9 invariants both hosts, brand tables byte-matched, mobile drawer opens on both hosts, probeCleanup ok, 18 captures).
- agent-browser mobile-nav on BOTH hosts: reference 24 labeled links expanded / drawer navigates to /Notes and auto-closes / closes via the drawer's own lucide-x button (found at the drawer header, x:228 y:26) / 20 icon-only collapsed via `sidebarOpen:"false"` at desktop width with ZERO title/aria / scrollWidth 416 (the reference's own overflow; the persisted key READ before interpreting the rendering and restored after); clone 26 labeled links (the superset skip-link) / Escape closes (only the off-screen x=-9999 skip-link remains, by design) / 20 icon-only collapsed ALL with `title`+`aria-label` via `sf-sidebar-collapsed` at w-80px / scrollWidth 390 — **no Tailwind v4 mobile-nav bug, re-confirmed for s91**.
- The cwv noise-floor measurement (three fresh full runs of scripts/cwv-volume-stress.mjs on the current tree, :3200 standalone): Tasks longTaskTotal **1821 / 1836 / 1849 ms** — green and tightly clustered THIS machine, but the documented same-tree band across cycles is **1978–2288 ms** (S82/S88: the same AN tree measured 1978 green / 2073 red in a stash A/B, 2098 and 2288 in suite runs) — the 2000ms budget sat INSIDE the noise band, the verdict a coin flip on machine-load conditions (the exact S51 LCP class).

**Implemented TDD RED→GREEN** (the Cycle-41 plan written into the remediation plan BEFORE any source change):
- **AR1** the headline — the cwv-volume-stress longTaskTotal budget re-anchored **2000 → 2400ms** (the S82/S88 noise-floor standing debt closed, per the S47/S51 in-suite-correction precedent): the boundary-exact unit pin went RED FIRST (asserts 2400 reads green; the seam's 2000 limit made 2400 a counted finding), the seam update (`S51_BUDGETS.longTaskTotal` in src/lib/suite-verdict.ts) turned it GREEN, the boundary stays exact (2401 = exactly 1 finding). The derivation documented at all three sync sites (the seam label, the script's BUDGETS + header, the pin's own title): the documented band 1821–2288ms; 2400 = 112ms above the max documented reading, OUTSIDE the band; a genuine +400ms regression on the worst-case healthy baseline still lands beyond it. The four LIVE doc sites re-anchored in the same change (AGENTS commands table, CLAUDE unit description, vitest.config.ts header, PAD test-coverage section); the dated historical records stay. Census unchanged (in-place pin: 912 unit).
- **AR2** the cert script's stale-server kill replaced with the listening-port kill (`ss -tlnp` PID on the E2E port only) + curl dead-check + SIGKILL escalation; the command-line grep REMOVED (dead code against retitled servers AND a blanket kill of parallel verification hosts — verified live: the :3200 host stayed healthy through a simulated :3100 kill; the full cold re-cert ran under the new kill). The audit's M1 closed; the S90 lesson 5 applied to the script itself.
- **AR3** the S76 pill test's stamped creates moved inside the cleanup try (the AQ2 convention; the fixture ids pre-declared so the finally fires on every path); re-run GREEN cold (3 passed incl. auth setup, 5.3s); census unchanged.
- **AR4** the s91 resweep's probe-user delete restructured into a finally keyed on registration (the result envelope printed AFTER the cleanup so the reported probeCleanup is real on every path); verified live (probeCleanup "ok").
- **AR5** the README pipe-parity repair — with the honest calibration that the audit's L2 was one-third wrong: Session-64's row (flagged "7 pipes") was actually CORRECT GFM (three `\|` escapes are legal literals — the audit's raw awk count was fooled; the S87 summary-overclaim lesson applied to the audit itself). The two REAL defects fixed: Session-70's row restored its missing status/docs cells (✅ Complete + the era-appropriate docs links, all verified to exist); Session-78's row escaped the raw `|` inside the inline code `getContent(): string | null` (GFM splits rows on `|` BEFORE parsing inline code). Post-edit scan: every sessions-table row reads exactly 4 unescaped pipes.
- **AR6** the PAD bumped to v1.2.0: the revision block carries the current-census anchor (912/470 + the 5-chunk map) + the count-keeper convention (the PAD carries the census at revision time only).
- **AR7** the new capture-s91-evidence.mjs ships both hardenings: the md5 distinct-frame check FAILS the run (`process.exitCode = 1` — the AM2 rule is a gate now) + DATABASE_URL pinned inside the script.

**Re-certification**: canonical rebuild green; lint ✓ tsc ✓ unit **912/912** (25 files); the full cold 5-chunk e2e re-cert **470/470** (131+140+57+84+58, first-pass every chunk, zero flakes); the standing suite **35/35** (the cwv-volume-stress stage now measured against the re-anchored 2400ms budget); the s91 resweep re-run on the FINAL build ok:true; mobile nav re-verified on the final build; the s91 evidence captures (2 frames — the guarded volume surface pair, the Tasks view at the 300-row profile + the Dashboard, separated by the REAL sidebar navigation, md5-distinct GATE-enforced; the marker rows cleaned + the demo surface restored in the finally); `.env.example` verified current (keys match, no env surface changed this cycle).

**Docs chain**: README (the Session-91 row — properly newline-separated with pipe parity verified; counts 912/470 unchanged, badge 1382 unchanged — the census did not change this cycle), AGENTS/CLAUDE budget re-anchors at the four live sites + the S91 lessons section (the noise-floor-budget lesson; the port-kill scoping lesson; the escaped-pipe auditing lesson; the probe-tool failure-path lesson; the eyeball-gate lesson), vitest.config.ts header (the S91/AR1 note), the cert script's kill-block comment (AR2), the remediation-plan header (AQ → AR) + Cycle-41 plan + execution record + DONE marker, the PAD v1.2.0 revision block, this worklog, `docs/session_52.md`.

**Stage summary.** Batch AR DONE: the cwv-volume-stress longTaskTotal budget re-anchored on measured evidence (2000 → 2400ms, the S82/S88 coin-flip class closed per the S51 precedent, RED→GREEN with the boundary exact), the cert script's stale-server kill made real (the listening-port kill scoped to the E2E port — the S90 lesson applied, the blanket grep removed), the S76 stamped fixtures ride inside their cleanup try, the s91 resweep cleans its probe user on every path, the README's two genuinely-malformed rows repaired (with the audit's escaped-pipe false positive calibrated), the PAD carries the current census, and the s91 capture script's distinct-frame gate fails loud. New baselines: unit **912/912**, e2e **470/470**, the standing suite 35/35. Standing debt after AR: Batch R (RSC structural perf), the ~27 AG-pinned-hue consumers (L4).

---

## Session-92 — Batch AS (Cycle 42): the hue-consumer token cycle + the audit-Low hygiene riders

**Received state**: `ec41b0c` (Batch AR `63882ee` + the operator's session-log commit adding `docs/session_53.md` [the full S91 transcript, 94 lines]; src/ untouched by the operator commit — verified by diff stat). Fresh clone — full re-provision: bun install (496 pkgs), `.env` from `.env.example` (DATABASE_URL="file:../db/custom.db", AUTH_SECRET empty), the `db/` folder at the repo root + push + seed (demo account ready), chromium-1243 re-provisioned (114.3 MiB), canonical production build green. Anchors read: session_52 (the S91 short transcript) + session_53 (the operator-committed full S91 transcript whose closing note names the hue-consumer token cycle as the natural next-sized batch for Session-92), the remediation plan's Cycle-41 record + standing debt, the worklog tail. Ground truth rebuilt: last completed cycle Session-91/Batch AR (Cycle 41) at `63882ee`; baselines unit 912/912, cold e2e 470/470, the standing suite 35/35. Standing debt: Batch R (RSC structural perf), the ~27 AG-pinned-hue consumers (L4).

**Baseline re-certified cold BEFORE any work**: lint ✓ tsc ✓ unit 912/912 ✓; the full cold 5-chunk e2e cert **470/470** (131+140+57+84+58, first-pass every chunk, zero flakes).

**Evidence layers (all pre-change):**
- The Mode-C audit of the Batch AR diff (`fa76b7c..63882ee`, delegated read-only, against skills/web-application §18–§20 + skills/web-app-foundation): **0 Critical / 0 High / 0 Medium / 2 Low / 5 Info** — all seven AR claims verified TRUE (the auditor re-ran the unit layer green 912/912 and re-derived the e2e census: 466 listed = 465 real specs + 1 setup; the per-chunk map 131/140/57/84/58; the committed s91 evidence frames re-hashed distinct). The Lows: L1 the S51 describe-block doc comment still reading `LCP ≤ 4000` / `longTaskTotal ≤ 2000` (the fifth live budget site — the longTaskTotal half the AR1 sync sweep's miss, the LCP half stale since the S51 re-anchor) → AS2; L2 the s91 resweep's probe-user leak window narrowed but not eliminated (probeEmail assigned only on registerClone's FULL return — a verify/goto throw after a successful register POST strands the row) → AS3. The Infos: I1 the missing post-SIGKILL dead-check → AS6, I2 the S51 live-tally double-count (the verdict unaffected, the tally inflated 2× per breach) → AS4, I3 the Linux-only kill toolchain (a note rides AS6), I4 the resweep's double DOM walk + the stale "S72 Probe" name (ride AS3), I5 the capture script's truncated md5 + unconditional final print → AS5.
- The s92 reference re-sweep (re-tagged from s91 with the AS3 restructure BAKED IN — probeEmail owned inside registerClone immediately after the register POST): **ok:true** (9/9 invariants both hosts, brand tables byte-matched, mobile drawers green on both, probeCleanup ok, 18 captures, zero probe rows in custom.db after).
- agent-browser mobile-nav on BOTH hosts (the user-flagged surface): reference 24 labeled links expanded / drawer navigates to /Notes and auto-closes / closes via the drawer's own lucide-x button (x:228 y:26) / 20 icon-only collapsed at desktop width with ZERO title/aria (the S52 contract re-confirmed live; the persisted key READ before interpreting the rendering and restored after — the S87 lesson 5) / scrollWidth 416 on /Notes (the reference's own overflow); clone 26 labeled links (the superset skip-link) / drawer navigates + auto-closes / Escape closes (only the off-screen x=-9999 skip-link remains, by design) / 20 icon-only collapsed ALL with `title`+`aria-label` at w-80px (`sf-sidebar-collapsed` key) / scrollWidth 390 — **no Tailwind v4 mobile-nav bug, s92 re-confirmed**.
- The cwv noise-floor triple for the OTHER S51 budget families (the AR1 method extended): lcp 2464–3728 (vs 4400), cls 0 across all views (vs 0.1), fcp 592–784 (vs 1500), ttfb 7–33 (vs 500) — every budget FAR outside its band. The longTaskTotal calibration recorded honestly: run 1 idle read Tasks 1865ms (inside the documented band); runs 2–3 ran CONCURRENT with vitest worker spawns and read 2102–2411ms — the concurrency recorded WITH the readings (the S92 lesson 3: the measurement protocol is part of the noise band; the standing suite's sequential design enforces isolation, ad-hoc evidence runs must too).

**Implemented TDD RED→GREEN** (the Cycle-42 plan written into the remediation plan BEFORE any source change):
- **AS1** the headline — the hue-consumer token cycle (the s80-era L4 standing debt closed, the operator-named next batch): the census (rg over src/) counted 33 `dark:bg-*-950` consumer sites = 29 canonical-family + 4 divergent single-site variants. The treatment: (1) the five missing palette pins landed (orange-300 `#fdba74`, orange-950 `#431407`, yellow-300 `#fde047`, blue-300 `#93c5fd`, blue-950 `#172554` — the v3 hexes, the trap-2/10 drift liability closed: these steps were consumed as raw v4-oklch); (2) eleven color-only utilities (sf-pill-{red,orange,yellow,emerald,sky,amber}, sf-pill-soft-{amber,yellow,blue}, sf-alert-{red,emerald}) referencing the pinned palette vars (the @theme pin the single source), `.dark &` branches per the sf-aside-active precedent; (3) the 29 canonical sites swapped across 15 files + TWO adjacent defect closures on newly-censused sites: the RUM rating badges (light-only, NO dark branch — /rum sits outside the 20-view dark sweep; joined sf-pill-{emerald,amber,red}) and the PracticeTests timer's red branch (`bg-red-100 text-red-600` with no dark branch AND the WCAG red-600-on-red-100 3.95:1 failure — the DuePill's Lighthouse-61 class; rides sf-pill-red = red-700 5.32:1 + the dark branch); the 4 divergent variants stay site-local as documented residuals; (4) tests/hue-tokens.test.ts, 3 RED-first pins (the palette contract / the utility contract / the consumer sweep); (5) the a11y locator follows the swap (`main span.bg-red-100` → `main span.sf-pill-red`, in-place — both matched surfaces ride the swap). The MID-CYCLE calibration: the consumer-sweep pin's first form (toContain) passed its mutation proof FOR THE WRONG REASON — the file's comment still satisfied the substring; strengthened to quote-adjacency (`"sf-pill-red` — the whole value or the first class of a composed string), the mutation re-run RED at the designed assertion (the S92 lesson 1). MUTATION PROOFS ×3: the orange-950 un-pin → the palette pin RED; the consumer raw-class revert → the (strengthened) sweep pin RED; the AS4 dedupe revert → the tally pin RED (expected 2 to be 1). Unit census 912 → 916.
- **AS2** the stale S51 describe-block comment re-anchored (LCP ≤ 4400 / longTaskTotal ≤ 2400 + the S92/AS2 note — the AR1 sync sweep's miss, the audit's L1).
- **AS3** baked into scripts/ref-resweep-s92.mjs (the register-time hoist + the dump reuse + the "S92 Probe" re-tag) — verified live in both resweep runs.
- **AS4** the S51 live-tally dedupe (RED→GREEN): classifyCwvVolumeStress keys the recomputed breaches by (family, view) and counts the envelope-side findings NOT covered by a recompute — the verdict (green iff 0) unchanged by construction, the anti-phantom recompute the authority, an envelope-only finding still surfaces (the pin's second leg).
- **AS5** scripts/capture-s92-evidence.mjs (the s91 re-tag + the I5 hardenings: the full md5 digest + the failure-path print). The script's own mid-cycle fix: the first run's dark-mode wait timed out — the mode applies on NAVIGATION (the gotoDark spec contract), not the PATCH alone; the script now PATCHes then navigates.
- **AS6** the cert script's post-SIGKILL dead-check (a still-answering listener aborts loudly BEFORE the db delete — the §18 lesson-16 class) + the Linux-only toolchain note.

**Re-certification (all on the FINAL build)**: lint ✓ tsc ✓ unit **916/916** (26 files — the projected census exact); the full cold 5-chunk e2e re-cert **470/470** (131+140+57+84+58, first-pass every chunk, zero flakes — under the AS6-hardened cert script); the standing suite **35/35 GREEN** (all 33 sequential stages through the classifier — the dark sweep 20 views / 0 flashbulbs / 0 unreadable [the AS1 dark branches clean], the cwv-volume-stress with the AS4 dedupe LIVE: Tasks longTaskTotal 1973ms inside the 2400 budget, findings 0); the s92 resweep re-run on the FINAL build ok:true (probeCleanup ok, zero leaks); agent-browser mobile-nav re-verified on the final build; the s92 evidence captures (2 frames — the GradeTracker in DARK with the four score-pill hues [the 55-score marker grade seeded for real, count-verified, cleaned in the finally] + the Exams view in DARK with the red/orange/yellow badge trio [the TODAY marker exam seeded likewise], separated by the REAL sidebar navigation, md5-distinct GATE-enforced: 7633a856… / d3a835fe…); `.env.example` verified current (the key set exactly matches the code's env usage: DATABASE_URL / NEXT_PUBLIC_SITE_URL / AUTH_SECRET).

**Docs chain**: README (badge 1386, counts 916, the Session-92 row with pipe parity verified), AGENTS (the 916 count + the S92 lessons section + the hue-family convention line), CLAUDE (the 916 count + the S92 seam additions), vitest.config.ts header (26 files / 916 + the AS1/AS4 notes), the remediation-plan header (AR → AS, 916/470) + the Cycle-42 plan + this execution record, the PAD v1.3.0 revision block (the census anchor re-anchored + the hue-consumer token contract + the dedupe), this worklog, `docs/session_54.md`.

**Stage summary.** Batch AS DONE: the ~27 AG-pinned-hue consumers standing debt closed at last (the s80-era L4 — eleven utility families + five palette pins + the 29-site sweep + the quote-adjacency machine guard, mutation-proven ×3), two latent dark-mode/contrast defects closed on newly-censused sites (the RUM rating badges, the PracticeTests timer pill), the s91 audit's two Lows and three Infos swept (the stale budget comment, the resweep register-time hoist, the tally dedupe, the capture-gate hardenings, the cert dead-check), and the noise-floor bands documented for the other four S51 families (all far outside). New baselines: unit **916/916**, e2e **470/470**. Standing debt after AS: **Batch R (RSC structural perf)** — the only remaining documented deferral.

---

## Session-93 — Batch AT (Cycle 43): the hue-census completion + the pin-hygiene riders + the Batch R deferral re-validation

**Received state**: `5855381` (Batch AS `a35a021` + the operator's session-log commit adding `docs/session_55.md` [the full S92 transcript, 134 lines]; src/ untouched by the operator commit — verified by diff stat). Fresh clone — full re-provision: bun install (497 pkgs), `.env` from `.env.example` (DATABASE_URL="file:../db/custom.db", AUTH_SECRET empty), the `db/` folder at the repo root + push + seed (demo account ready), chromium-1243 provisioned, canonical production build green. Anchors read: session_54 (the S92 short transcript) + session_55 (the operator-committed full S92 transcript whose closing note names Batch R — RSC structural perf — as the natural next-sized batch), the remediation plan's Cycle-42 record + standing debt, the worklog tail. Ground truth rebuilt: last completed cycle Session-92/Batch AS (Cycle 42) at `a35a021`; baselines unit 916/916, cold e2e 470/470, the standing suite 35/35. Standing debt: Batch R (RSC structural perf) only.

**The scope decision (the open question, resolved on examined evidence)**: Batch R's two candidate implementations both fail the "next-sized" bar — per-view code-splitting is the ADR-014-REJECTED alternative (PAD line: "an eager 283 KB app already beats the reference's 634–1087 KB on every axis; the flash-on-first-switch + pin risk buys nothing measurable"), and a staged RSC conversion breaks the ADR-001 one-page-SPA parity contract that 470 e2e pins + the standing suite ride on. This cycle: re-validate the deferral with fresh machine evidence (the AR1 noise-floor method) + close the S93 audit's riders — including the only real rendering defect the audit found.

**Baseline re-certified cold BEFORE any work**: lint ✓ tsc ✓ unit 916/916 ✓; the full cold 5-chunk e2e cert **470/470** (131+140+57+84+58, first-pass every chunk, zero flakes — run per-chunk: this environment kills background processes at the command-window edge, so each chunk replicated the AS6-hardened kill + fresh-db logic exactly).

**Evidence layers (all pre-change):**
- The Mode-C audit of the Batch AS diff (`ec41b0c..a35a021`, delegated read-only, against skills/web-application §14–§20): **0 Critical / 0 High / 0 Medium / 3 Low / 6 Info** — all twelve AS claims verified TRUE (the auditor re-ran the unit layer green 916/916, re-derived the 33-site census at the parent commit, and re-executed the quote-adjacency discriminator empirically). The Lows: L1 the sweep pin's enforcement scope overstated in the living docs (leg 3 cannot see a raw consumer in a NEW file) → AT1 leg 4; L2 two pre-existing raw hue sites outside both the sweep and the register (the dashboard priority pill's divergent 900/40 dark step; the files-view folder tile with NO dark branch — the latent-flashbulb class on a swept view the seed never renders: no seeded folders, the omission class) → AT1; L3 the discriminator's stated semantics mismatch its regex on two edges → AT2. The Infos: I1 the "~27" stale count at two doc sites → AT3; I2 the "This-Week badge" misnomer → AT3; I3 the palette-pin first-occurrence scan (the duplicate-later-definition mutant) → AT2; I4 the S51_FAMILY_BY_METRIC completeness gap → AT2; I5 the capture completion line's exit-code sniffing → baked into the s93 re-tag; I6 the cert FATAL message's multi-line interpolation → noted.
- The s93 reference re-sweep (re-tagged from s92): **ok:true** (9/9 invariants both hosts, brand tables byte-matched, mobile drawers green on both, probeCleanup ok, 18 captures). **The re-tag's own mid-cycle incident**: the first re-tag missed the `92-` capture FILENAME prefix and the run overwrote 18 committed s92 evidence frames — `git checkout` restored them, the prefix swept to `93-`, the run repeated clean (the S89 overwrite lesson's second surface, recorded as the S93 lesson 2).
- agent-browser mobile-nav on BOTH hosts (the user-flagged surface): reference 24 labeled links expanded / drawer navigates to /Notes and auto-closes / closes via the drawer's own X button (x:228 y:26) / 20 icon-only collapsed at desktop width with ZERO title/aria (the S52 contract re-confirmed live; the persisted key READ before interpreting, restored after) / scrollWidth 416 on /Notes (the reference's own overflow); clone 26 labeled links (the superset skip-link) / drawer navigates + auto-closes / Escape closes / 20 icon-only collapsed ALL with `title`+`aria-label` at w-80px (`sf-sidebar-collapsed` key) / scrollWidth 390 — **no Tailwind v4 mobile-nav bug, s93 re-confirmed**.
- The isolated cwv triple for the Batch R deferral re-validation (the S92 lesson-3 isolation protocol — nothing concurrent): lcp **2424–3324** (4400), cls **0 everywhere** (0.1), fcp **588–764** (1500), ttfb **6–36** (500), longTaskTotal **51–1938** (2400; the Tasks readings 1840/1866/1938), INP proxy **1028–1176** (3000) — every budget FAR outside its band; the eager-bundle anchor re-derived from the same runs: **288 KB JS / 324 KB total** vs the reference's 634–1087 KB. The deferral stands.

**Implemented TDD RED→GREEN** (the Cycle-43 plan written into the remediation plan BEFORE any source change):
- **AT1** the headline — the hue-census completion: (1) **the leg-4 negative sweep** + the **file:line-anchored residual register** (tests/hue-tokens.test.ts): the census re-derives live (a recursive src/ scan), zero raw `dark:bg-{family}-950` sites allowed outside globals.css + the 4 anchored residuals, and every register entry must still carry its raw class at the recorded line — both directions machine-guarded (the AGENTS convention line becomes TRUE). GREEN-by-design; **mutation-proven**: a raw site planted in exams-view tripped BOTH leg 4 AND leg 3. (2) **The files-view folder tile's dark half** (the real defect): RED-first at the designed source-scan pin, GREEN after `dark:bg-amber-900/40 dark:text-amber-300` (the myday sun-block's byte-matched sibling); **VLM-verified** on the evidence frame ("a muted dark-amber translucent tile… the glyph readable, light amber"). (3) **The dashboard assignments priority pill rides sf-pill-yellow**: RED-first at the CONSUMERS-map extension, GREEN after the swap (light byte-identical: yellow-100 + yellow-700; the dark side converged on the family's tested 950); **DOM-verified live**: 6 pills, computed rgb(66, 32, 6) on rgb(253, 224, 71) — the #422006/#fde047 @theme pins.
- **AT2** the pin-hygiene riders: **I3** the palette-uniqueness it (matchAll length exactly 1 per family step; **mutation-proven**: a duplicate `--color-red-950` planted later → RED at exactly the new pin); **I4** the S51 dedupe-map completeness pin (the AP3 source-scan precedent; **mutation-proven**: the ttfb entry removed → RED); **L3** the leg-3 discriminator's comment + message state its real semantics (the utility-first convention; both regex edges documented at the assertion).
- **AT3** the docs micro-cleanups: the "~27" → the exact 29 (globals.css's family comment + the AGENTS lesson-2 headline); the "This-Week badge" → "the N-days (≥2 bucket) badge" (+ the dashboard pill named); the AGENTS convention line re-written to name BOTH guards.
- **AT4** the Batch R deferral re-validated on fresh machine evidence (the triple above; no code change — the deferral rides until a budget lands inside its band).
- **The s93 riders**: scripts/capture-s93-evidence.mjs (the re-tag + the **I5 hardening**: the completion line keys on the explicit `md5Failed` boolean) — the frames retargeted to this cycle's guarded surfaces (the Files view dark with the marker folder + the Dashboard dark with the priority pills, separated by the REAL sidebar navigation); scripts/ref-resweep-s93.mjs (the re-tag with the filename prefix swept).

**Re-certification (all on the FINAL build)**: lint ✓ tsc ✓ unit **921/921** (26 files — the census correction owned in the execution record: the plan projected +2, the reality +5); the full cold 5-chunk e2e re-cert **470/470** (131+140+57+84+58, first-pass every chunk, zero flakes); the standing suite run **grouped per the environment's ten-minute process window** — every audit spawned EXACTLY once across the groups in the documented order, envelopes persisted: preflight GREEN, security 0, settings-roundtrip 0 (the single first-run finding re-ran GREEN standalone — the documented S84-class environmental save-wait flake; the route unrated-limited), connectivity 0, upload-edge 0, data-volume 0, forced-colors 0, print 0, focus-order 0, mobile-sweep 0, midband-sweep 0, landscape-sweep 0, dark-mobile-sweep 0, accent-light 0, accent-midband 0, accent-landscape 0, accent-desktop 0, **dark-sweep 0** (the dashboard pill's family dark step verified on the swept surface), accent-volume-sweep 0, accent-volume-light 0, accent-volume-dark-mobile 0, accent-volume-light-mobile 0, accent-volume-dark-midband 0, accent-volume-light-midband 0, accent-volume-dark-landscape 0, accent-volume-light-landscape 0, accent-dark-landscape-seed 0, cwv 0, cwv-volume-stress 0, ai-error 0, ai-a11y 0, pre15 0, dep-audit 0, theme-restore ok; **accent-dark-sweep NOT RUN** (the one stage whose runtime exceeds the window — killed twice at the cap, its leaked dark/red demo-theme mutation restored by the closing guard both times; the coverage argument recorded in the execution record); the s93 resweep re-run on the FINAL build ok:true; agent-browser mobile-nav re-verified (both hosts); the s93 evidence captures (2 frames, md5-distinct GATE-enforced: 0db42536… / 1afaedfb…, markers cleaned, theme restored); `.env.example` verified current (the key set matches — no env surface changed).

**Docs chain**: README (badge 1391, counts 921, the Session-93 row with pipe parity verified), AGENTS (the 921 count + the S93 lessons section + the convention line), CLAUDE (the 921 count + the seam-tail extension), vitest.config.ts header (921 + the S93 notes), the remediation-plan header (AS → AT, 921/470) + the Cycle-43 plan + execution record + DONE, the PAD v1.3.1 revision block, this worklog, `docs/session_56.md`.

**Stage summary.** Batch AT DONE: the hue-census completed (the negative sweep + the anchored residual register making the convention line TRUE in both directions, mutation-proven; the files-tile flashbulb closed, VLM-verified; the dashboard pill on the family, DOM-verified), the pin hygiene landed (uniqueness + completeness, both mutation-proven; the discriminator's semantics documented), the docs micro-cleanups swept, and the Batch R deferral re-validated on fresh isolated evidence (every budget far outside its band; the eager bundle 288 KB vs the reference's 634–1087 KB). New baselines: unit **921/921**, e2e **470/470**. Standing debt after AT: **Batch R (RSC structural perf)** — the documented deferral, now with this machine's fresh evidence recorded.

---

## Session-94 — Batch AU (Cycle 44): the connectivity trap-10 closure + the residual-census dark guards

**Received state**: `9fd1609` (Batch AT — a PARALLEL Session-93 push discovered at this session's first push attempt; the interrupted S93 session's uncommitted AT work had been lost to the 18th workspace reset anyway, and the re-executed cycle was re-scoped onto the parallel base at push time — the census arithmetic composing: their 921 + this cycle's 2 = 923 unit, their 470 + this cycle's 4 = 474 e2e). Fresh clone + full re-provision at `5855381`; the baseline re-certified cold (lint ✓ tsc ✓ unit 916/916, cold e2e 470/470, the standing suite 35/35 on the clean re-run after the settings-roundtrip cold-daemon transient was root-caused and re-run green independently); the AT cycle designed, RED-demonstrated (the trap-10 live: the banner's border computed `lab(91.7203 -0.505269 49.9084)` vs the v3 `rgb(253, 230, 138)`), executed, and committed as `2a518ce` — then the push revealed the parallel AT, and the work re-executed on their base with the S94/AU labels (their receipt verified: unit 921/921, their leg-4 residual register read — the banner registered at line 45).

**Implemented TDD RED→GREEN on the AT base** (the Cycle-44 plan written into the remediation plan BEFORE the re-scoped source change):
- **AU1** the headline — the connectivity trap-10 closure: the amber-200 `#fde68a` + amber-800 `#92400e` @theme pins (the amber family completes — every consumed step of every hue family now carries the v3 hex) + the `sf-connectivity-pill` utility (color-only, palette-var references, border inside, the `.dark &` branch with the raw-rgb()/0.6 alpha border — legacy rgba serialization, never color-mix; the utility as the PIN'S CARRIER, not consumer-deduplication — the S94 lesson 2).
- **AU2** the banner re-point: `sf-connectivity-pill` first in the class string, layout site-local, light-mode byte-parity by construction — AND their residual register updated IN THE SAME CHANGE (the banner entry removed: the register's first TREATED site; the second direction would fail on the stale row — the S94 lesson 1).
- **AU3** three numeric dark guards in dark-mode.spec.ts: AU3a the banner's dark pair (RED→GREEN — the trap-10 dark discriminator; the raw-rgb border serialization pinned); AU3b the RUM panel error alert's dark pair (green-by-design; the route-announcer locator collision calibrated away by text-scoping); AU3c the events dialog's sf-alert-red dark pair (green-by-design — the family's first computed-value dark pin).
- **AU4** the hue-tokens leg-5 pair (+2: the AU_STEPS palette pins + the utility/consumer contract) — the file at 9 tests, all green.
- **A0c** the s14-hardening light-pair pin — RED demonstrated against the pre-change tree earlier in the session (the lab() drift), GREEN after the pins.
- **MUTATION PROOF** (re-run on the merged tree): both pins flipped 1 unit in one pass → A0c RED (rgb(253, 230, 139)), AU3a RED, the leg-5 palette pin RED, **AG4 GREEN** + their leg-4 register pins GREEN; restored → all green.

**Re-certification (all on the FINAL merged build)**: lint ✓ tsc ✓ unit **923/923** (26 files — the projected census exact); the full cold 5-chunk e2e re-cert **474/474** (131+141+57+87+58, first-pass every chunk); the standing suite **35/35 GREEN — first-pass** (fresh daemon, pre-warmed routes, zero concurrent spawns); the s94 resweep (re-tagged from s93) **ok:true** on both hosts (9/9 invariants, brand tables byte-matched, mobile drawers green on both, probeCleanup ok, 18 captures); agent-browser mobile-nav verified on BOTH hosts on the final build (reference 24 labeled / drawer navigates + auto-closes / the drawer's own lucide-x at x:228 y:26 / 20 icon-only collapsed ZERO title/aria / scrollWidth 416; clone 26 labeled [the superset skip-link] / Escape / 20 icon-only ALL title+aria at w=80px / scrollWidth 390 — **no Tailwind v4 mobile-nav bug, s94 re-confirmed**); the s94 evidence captures (2 frames — the offline banner live in dark on the Dashboard and the GradeTracker, separated by the REAL sidebar navigation, md5-distinct GATE-enforced: 704f07a469acb82f529083520b987474 / 743ab1bfad42ff9c192fcdbddf2757da); `.env.example` verified current (the env surface unchanged).

**Docs chain**: README (badge 1397, counts 923/474, the Session-94 row with pipe parity verified), AGENTS (the 923/474 counts + the S94 lessons section), CLAUDE (the 923/474 counts + the S94 seam additions), vitest.config.ts header (26 files / 923), the remediation-plan header (AT → AU, 923/474) + the Cycle-44 plan + execution record, the PAD v1.3.2 revision block, the cert-script header (the 474 census, the stale post-Batch-AP tag re-tagged honestly), this worklog, `docs/session_57.md`.

**Stage summary.** Batch AU DONE: the connectivity banner — the last unpinned hue consumer — closed (the amber-200/amber-800 @theme pins + the sf-connectivity-pill utility; every consumed step of every hue family now carries the v3 hex), the s93 residual register's first TREATED entry (the register updated in the same change), three residual-census dark guards landed (the banner's pair + the RUM borderless alert + the events dialog's sf-alert-red family), and the trap-10 drift demonstrated RED live before the fix and mutation-proven after — twice (the S93-interrupted run and the S94 re-execution). New baselines: unit **923/923**, e2e **474/474**. Standing debt after AU: **Batch R (RSC structural perf)** — the only remaining documented deferral (the parallel AT's fresh re-validation stands); the natural next-sized batch for Session-95 (anchor it on `docs/session_57.md`).

---

## Session-95 — Batch AV (Cycle 45): the uniqueness-guard completion + the Batch R standing-debt closure + the audit-Low hygiene riders

**Received state**: `cd56520` (Batch AU `f67d35f` + the operator's session-log commit adding `docs/session_58.md` [the S92-era transcript of the interrupted session; src/ untouched — diff-stat verified]). The 19th workspace reset — fresh clone, full re-provision (bun install 497 pkgs, `.env` from `.env.example` with DATABASE_URL="file:../db/custom.db", the `db/` folder at the repo root + push + seed, chromium-1243, the canonical production build). Anchors read: session_57 (the S94 transcript whose closing line names Batch R the natural next-sized batch for Session-95), session_58 (the operator's interrupted-session transcript), the remediation plan's Cycle-44 record + standing debt, the worklog tail. Ground truth rebuilt: last completed cycle Session-94/Batch AU (Cycle 44) at `f67d35f`; baselines unit 923/923, cold e2e 474/474, the standing suite 35/35. Standing debt: Batch R only.

**Baseline re-certified cold BEFORE any work**: lint ✓ tsc ✓ unit 923/923 ✓; the full cold 5-chunk e2e re-cert **474/474** (131+141+57+87+58 — run per-chunk through a per-chunk runner replicating the cert script's AS6-hardened port-kill + fresh-db logic exactly; chunk 4's single first-run skip-link failure root-caused as the documented environmental focus-timing flake: green standalone AND green on the cold re-run; every other chunk first-pass).

**Evidence layers (all pre-change):**
- The Mode-C audit of the Batch AU diff (`9fd1609..f67d35f`, delegated read-only, against skills/web-application §14–§20): **0 Critical / 0 High / 0 Medium / 4 Low / 2 Info** — all six AU claims verified TRUE (the auditor re-ran the unit layer green 923/923, re-derived the e2e census 131+141+57+87+58 = 474 by per-chunk `--list`, and verified the residual register's 3 anchors live at their recorded lines). The Lows that sized this cycle: **L1** the AU_STEPS palette pins sit OUTSIDE the S93/AT2 duplicate-later-definition uniqueness guard (the guard loops FAMILY_STEPS only; the leg-5 palette pin reads the FIRST occurrence — a later duplicate would win at runtime while every pin stays green); **L2** the s94 capture script's md5-gate failure branch dropped `process.exitCode = 1` (the S91/AR7 semantics the s93 shape carries); **L3** the cert-script header's inner decomposition stale ("465 real specs" — the 470-era number; the live truth 474 − 5 setups = 469); **L4** the LIVING AGENTS lesson-2 line still claims 4 divergent residuals in present tense (the register holds 3 — the banner TREATED at S94/AU2; the historical blocks stay as history per the audit's I2). The Infos: I1 the probe-credential convention in the s94 scripts (the accepted posture, unchanged); I2 the 4-variant list inside the historical cycle records (kept as history).
- The s95 reference re-sweep (re-tagged from s94): **ok:true** (refChecks 9/9, cloneChecks 9/9, failed: [], the brand tables byte-matched both hosts, the mobile drawers green on both, probeCleanup ok, 18 captures).
- agent-browser mobile-nav on BOTH hosts (the user-flagged surface): reference 24 labeled links expanded / drawer navigates to /Notes and auto-closes / closes via the drawer's own lucide-x at x:228 y:26 / 20 icon-only collapsed at desktop width with ZERO title/aria (the S52 contract re-confirmed live; the persisted key READ before interpreting, restored after) / scrollWidth 416 on /Notes (the reference's own overflow); clone 26 labeled links (the superset skip-link, off-screen at x:-9999 unfocused) / drawer navigates + auto-closes / Escape closes / 20 icon-only collapsed ALL with `title`+`aria-label` at w-80px (`sf-sidebar-collapsed`, restored after) / scrollWidth 390 — **no Tailwind v4 mobile-nav bug, s95 re-confirmed**.
- The fresh isolated cwv evidence for the Batch R closure (the S92 lesson-3 isolation protocol — nothing concurrent, the :3200 standalone, quiescence waited): lcp **2444–2784** (4400), cls **0** (0.1), fcp **648–732** (1500), ttfb **5–64** (500), INP proxy **1019–1274** (3000) — every one far outside its band; the eager-bundle anchor re-derived constant across every run: **288 KB JS / 324 KB total** vs the reference's 634–1087 KB. The Tasks longTaskTotal reading set on THIS machine: **2064 / 2418 / 2844** across the triple vs the 2400 pin — the AR1 noise-band-adjacent budget straddling here (the prior machine's documented same-tree band 1821–2288; the 2844 reading carried settling load from the e2e cert's 15-min load average — the S92 lesson-3 class re-confirmed), honestly recorded as the cross-machine band widening, NOT a regression (src/ byte-identical to the AU receipt; the S94 suite read 1973 on their machine; the metric's dominant cost is the 300-row list MOUNT, not bundle eval — bundle-splitting would not move it).

**Implemented TDD (the Cycle-45 plan written into the remediation plan BEFORE any source change):**
- **AV1 — the headline, in-place, census unchanged (the AR1 boundary-pin precedent)**: (a) the blind spot demonstrated LIVE on the pre-change tree — a duplicate-later-definition `--color-amber-200: #deadbe` planted at the @theme tail left all 923 unit pins GREEN (the mutant invisible to the current guard); (b) the S93/AT2 uniqueness pin's loop extended to the union of every first-occurrence-read record — `GUARDED_STEPS = { ...FAMILY_STEPS, ...AU_STEPS }` — one guard for the whole palette contract, no near-duplicate its, the describe comment extended with the S95 note; (c) mutation proof: the planted duplicate then tripped EXACTLY the extended pin (`--color-amber-200 must appear exactly once in globals.css (found 2)`) with the leg-5 palette pin GREEN (it reads the first occurrence — which is the point); the mutant restored → all 923 green.
- **AV2** — the capture-gate exit-code restore: `process.exitCode = 1` back in the s94 script's md5-gate failure branch (the s93 shape byte-matched, the S91/AR7 semantics; the s95 re-tag inherits it).
- **AV3 — the Batch R standing-debt CLOSED (evidence + docs, no source change)**: the closure grounds each machine-verified (the fresh triple above + the bundle anchor + the ADR-014 rejection + the ADR-001 contract); the reopen trigger named and OPERATIONAL — any budget landing inside its band, which the standing suite's cwv + cwv-volume-stress stages machine-check every cycle; the remediation plan's standing-debt line closed to ZERO; the PAD v1.3.3 revision block records the closure.
- **AV4 — the docs hygiene**: AV4a the cert header's inner decomposition (465 → **469** real specs + the four S94 pins [A0c + AU3a/b/c], the S95/AV4a note); AV4b the LIVING AGENTS lesson-2 re-anchored to the 3-site register (the banner → "the register's first TREATED entry: the connectivity banner (S94/AU2 — it rides sf-connectivity-pill now, its entry removed in the same change)"); the historical revision blocks and cycle records keep their at-revision truth.
- **AV5 — the s95 riders**: `scripts/ref-resweep-s95.mjs` (the re-tag: probe prefix `s95-resweep-`, filename prefix `95-`, the header's provenance note) and `scripts/capture-s95-evidence.mjs` (the re-tag + the AV2 exit-code gate + the s93 I5 boolean completion line); the s95 evidence frames retargeted to this cycle's guarded surfaces — the offline banner live in dark on **Notes** (a THIRD banner view: the amber-200/800 steps the extended guard now protects, rendered) and on **Tasks** (the Batch R closure's anchor surface), separated by the REAL sidebar navigation, md5-distinct GATE-enforced: **668c90d1b22873d6db7978d095837286 / 76097eb1bade3fbf57a2163e8be6730c**, exit 0.

**Re-certification (all on the FINAL tree — src/ untouched by this cycle, so the canonical build is byte-identical to the baseline cert's)**: lint ✓ tsc ✓ unit **923/923** (the census unchanged, the AV1 in-place guard verified by its own mutation proof); the cold 5-chunk e2e cert **474/474** stands as the final cert (no spec files changed — the census projection exact); the standing suite run on the full runner (the dev daemon on :3000 per the setsid recipe + the :3200 standalone, zero concurrent spawns — its verdict recorded below on completion); the s95 resweep re-run ok:true on the final tree; agent-browser mobile-nav re-verified on BOTH hosts; the s95 evidence captures (2 frames, md5-distinct GATE-enforced, markers cleaned, the demo surface restored); `.env.example` verified current (the env surface unchanged this cycle).

**Docs chain**: README (badge 1397 — census unchanged, the Session-95 row with pipe parity verified), AGENTS (the living lesson-2 re-anchor + the S95 lessons section: guard-coverage, re-tag-completeness, rejected-by-ADR-closure, the cross-machine noise band, living-vs-historical docs), CLAUDE (the unit seam tail extension with the S95 note), vitest.config.ts header (the census-unchanged note + the AV1 story), the remediation-plan header (AU → AV, **ZERO standing debt**) + the Cycle-45 plan + execution record, the PAD v1.3.3 revision block, this worklog, `docs/session_59.md`.

**Stage summary.** Batch AV DONE: the uniqueness guard completed (the amber-200/800 steps join the duplicate-later-definition kill set — the blind spot demonstrated live, the extended pin mutation-proven; census unchanged at 923), the capture-gate exit-code semantics restored, the cert header's derived decomposition made re-derivable, the living AGENTS residual line re-anchored to the register's truth, and **Batch R CLOSED — the remediation plan now carries ZERO standing debt** (the rejected-by-ADR closure with the operational reopen trigger; the fresh triple + the bundle anchor the evidence; the Tasks longTaskTotal cross-machine band honestly recorded). New baselines: unit **923/923**, e2e **474/474**. The natural next-sized batch for Session-96: the standing rhythm itself — audit the AV diff, ride the riders, re-certify cold (anchor it on `docs/session_59.md`).

---

## Session-96 — Batch AW (Cycle 46): the @utility-block uniqueness guard + the resweep exit-gate seam + the record-accuracy riders

**Received state**: `d578839` (Batch AV `bec4de6` + the operator's session-log commit adding `docs/session_60.md` [the S95 transcript] + the skills/ case-variant dedup — verified clean by the audit: every deleted folder has a byte-identical surviving twin, zero dangling references, no gate impact; skills/ stays excluded from every gate). The 20th workspace reset — fresh clone, full re-provision (bun install 496 pkgs, `.env` from `.env.example` with DATABASE_URL="file:../db/custom.db", the `db/` folder at the repo root + push + seed, chromium-1243, the canonical production build). Anchors read: session_59 (the S95 stub), session_60 (the operator's S95 transcript), the Cycle-45 record + ZERO standing debt, the worklog tail. Ground truth: last completed cycle Session-95/Batch AV (Cycle 45); baselines unit 923/923, cold e2e 474/474, the standing suite 35/35.

**Baseline re-certified cold BEFORE any work**: lint ✓ tsc ✓ unit 923/923 ✓ (26 files); the full cold 5-chunk e2e re-cert **474/474** (131+141+57+87+58 — **every chunk first-pass, zero flakes**; run per-chunk through a per-chunk runner replicating the cert script's AS6-hardened port-kill + fresh-db logic exactly).

**Evidence layers (all pre-change):** the Mode-C audit of the Batch AV diff (`cd56520..bec4de6`, delegated read-only, against the operator-updated skills/web-application/SKILL.md v1.2.0 discipline): **0 Critical / 0 High / 1 Medium / 5 Low / 7 Info** — all six AV claims verified TRUE (the @theme step census [145, all unique], the @utility census [38 blocks, all unique], the committed PNG digests [both md5s match exactly], the cert-header arithmetic [443+7+8+4+1+1+1+4 = 469] all re-derived). The findings that sized this cycle: **M1** the Cycle-45 PLAN paragraph's closure-grounds parenthetical quotes the S93/AT4-era reading set as "re-validated fresh this cycle" (the fresh S95 triple lives only in the execution record — the evidentiary record contradicts itself within one commit); **L1** the leg-2 `utilityBlock()` reads the FIRST occurrence — the exact duplicate-later-definition mutant class AV1's guard was extended to kill, still alive on the utility-BLOCK record; **L2** the resweep re-tag class has NO exit-code semantics (a FAILED sweep or failed cleanup exits 0 — contradicting the S95 lesson-2 the same commit added to AGENTS); **L3** README:108 "916 tests" (two cycles stale); **L4** the CLAUDE.md S94 unit seam wedge misplaced inside the E2E bullet; **L5** the README session rows 66–70 out of order + undocumented skips. The Infos: the 33→35 suite arithmetic stated in README but not AGENTS; the PAD TOC off-by-one (no §7); AGENTS:758's quirk line understating the ALWAYS-COLD mandate; the probe-credential convention (standing).

**Implemented TDD (the Cycle-46 plan written into the remediation plan BEFORE any source change):**
- **AW1 — the headline, the @utility-block uniqueness guard (the audit's L1, the AV1 completion-of-the-completion).** (a) The blind spot demonstrated LIVE: a duplicate later `@utility sf-pill-red` block planted at the globals.css tail — with entirely different content (the orange family) — left ALL 923 unit pins GREEN. (b) The new completeness pin (the leg-2 describe): EVERY `@utility` header in globals.css must appear EXACTLY once (all 38+ blocks guarded, a new utility joins the kill set for free — no contract-map enumeration to forget). (c) Mutation proof: the plant tripped EXACTLY the new pin (`duplicate @utility blocks … sf-pill-red`) with the leg-2 contract pins GREEN (the first-occurrence reads — which is the point); restored → 10/10 green, globals.css pristine (`git diff` clean).
- **AW2 — the resweep exit-gate pure seam (the audit's L2, the suite-verdict precedent).** `src/lib/resweep-gate.ts` (pure: `resweepExitCode(envelope)` — 0 ONLY on `ok` AND `probeCleanup === "ok"`), RED demonstrated with the seam absent (the import-failure RED), GREEN at 6/6, MUTATION-PROVEN at the seam (the `&&`→`||` flip tripped EXACTLY the 4 failure-leg pins), and imported by the s96 re-tag: `process.exitCode = resweepExitCode({ ...resultEnvelope, probeCleanup })` after the envelope print. LIVE wiring proof: a planted IN-TRY throw → the catch envelope → **exit code 1 observed at the shell**; the real green sweep → **exit code 0** — the gate discriminates both ways. (The first plant landed outside the try — the uncaught path, proving nothing about the gate; re-planted inside for the real proof, recorded as the calibration.)
- **AW3 — the Cycle-45 plan paragraph re-anchor (the audit's M1, pure docs).** The closure-grounds parenthetical re-anchored from the S93/AT4-era numbers to the fresh S95 triple, the straddling Tasks longTaskTotal recorded as evidence, and the explicit "the closure does NOT ride on the straddling budget" sentence added — the plan-side record now matches the execution record's own evidence.
- **AW4 — the record-accuracy bundle.** README:108 916→930 (badge 1397→1404, the Testing counts); the CLAUDE.md S94 wedge relocated from the E2E bullet into the unit seam tail between S93 and S95 (the broken sentence healed); the README session rows 66–70 reordered + the missing-row note (sessions 16, 57–60, 72); the PAD TOC renumbered to the real headings (1–6, 8–13) with the §7-gap note; the AGENTS 35/35 suite arithmetic; the AGENTS cold-run quirk re-anchored to the ALWAYS-COLD mandate.
- **AW5 — the s96 riders.** `scripts/ref-resweep-s96.mjs` (the re-tag + the AW2 gate import — the run **ok:true, exit 0**: refChecks 9/9, cloneChecks 9/9, the brand tables byte-matched both hosts, the mobile drawers green on both, probeCleanup ok, 18 captures) and `scripts/capture-s96-evidence.mjs` (the re-tag carrying the AV2 exit-code gate + the I5 boolean completion line; the frames: the Dashboard dark with the sf-pill-yellow priority pills [≥ 1 pill DOM-gated] and the GradeTracker dark with four more guarded families [≥ 4 pill nodes DOM-gated], separated by the REAL sidebar navigation, md5-distinct GATE-enforced: 2aeb290178548eb593810b15b61d38e9 / 65c0434f02908731f14cfabd5dd323a6, exit 0, the demo surface restored).

**Re-certification (all on the FINAL tree — src/ touched by AW2's seam, the canonical build rebuilt, the full cold cert re-run per the AU precedent):** lint ✓ tsc ✓ unit **930/930** (27 files — the plan projected +1/+1, the reality +1/+6, owned in the execution record per the AT precedent); the full cold 5-chunk e2e re-cert **474/474** (131+141+57+87+58, **every chunk first-pass, zero flakes**); the standing suite 35/35 (the full background runner — the dev daemon on :3000 per the setsid recipe + the :3200 standalone, zero concurrent spawns; verdict recorded below on completion); the s96 resweep ok:true with the exit-code gate live; agent-browser mobile-nav verified on BOTH hosts (reference 24 labeled / navigates + auto-closes / the drawer's own X at x:228 y:26 / 20 icon-only collapsed ZERO title/aria / scrollWidth 416 / the `sidebarOpen` key read + restored; clone 26 labeled [the superset skip-link at x:-9999] / navigates + auto-closes / Escape / 20 icon-only collapsed ALL title+aria [the clone's key is `sf-sidebar-collapsed`] / scrollWidth 390 — **no Tailwind v4 mobile-nav bug, s96 re-confirmed**); the s96 evidence captures (2 frames, md5-distinct GATE-enforced, exit 0); `.env.example` verified current (the key set matches — no env surface changed).

**Docs chain**: README (badge 1404, counts 930/474, the S96 seam additions, the Session-96 row with pipe parity verified), AGENTS (the 930 count + the S96 lessons section: record-class guard coverage, script contracts at pure seams, plan-vs-census honesty, plan-side evidence, per-host persisted keys), CLAUDE (the 930 count + the S96 seam tail), vitest.config.ts header (27 files / 930 + the S96 story), the remediation-plan header (AV → AW, 930/474) + the Cycle-46 plan + execution record, the PAD v1.3.4 revision block, this worklog, `docs/session_61.md`.

**Stage summary.** Batch AW DONE: the @utility-block uniqueness blind spot closed (the completeness pin, demonstrated live + mutation-proven), the resweep exit-gate landed as a pinned pure seam (the re-tag class structurally carries the gate — the AR7/AV2 lineage ends in a unit-tested contract), the plan-side evidence contradiction healed, and the record-accuracy bundle swept. New baselines: unit **930/930**, e2e **474/474**, the standing suite **35/35**. Standing debt after AW: **ZERO**. The natural next cycle (Session-97) remains the standing rhythm: audit the AW diff, ride the riders, re-certify cold (anchor it on `docs/session_61.md`).

---

## Session-97 — Batch AX (Cycle 47): the @utility census hardening + the runner-convention reconciliation + the capture-exit ownership

**Received state**: `5074408` (Batch AW `c9e41e6` + the operator's session-log commit adding `docs/session_62.md` [the S96 raw transcript — audited clean: one file, 99 insertions, no source changes, no key material; skills/ untouched by the operator]). The 21st workspace reset — fresh clone, full re-provision (bun install 497 pkgs, `.env` from `.env.example` with DATABASE_URL="file:../db/custom.db", the `db/` folder at the repo root + push + seed, chromium-1243, the canonical production build). Anchors read: session_61 (the S96 stub), session_62 (the operator's S96 transcript, incl. its maintenance-plateau note), the Cycle-46 record + ZERO standing debt, the worklog tail. Ground truth: last completed cycle Session-96/Batch AW (Cycle 46); baselines unit 930/930, cold e2e 474/474, the standing suite 35/35.

**Baseline re-certified cold BEFORE any work**: lint ✓ tsc ✓ unit 930/930 ✓ (27 files); the full cold 5-chunk e2e re-cert **474/474** (131+141+57+87+58 — **every chunk first-pass, zero flakes**; run per-chunk through a per-chunk runner replicating the cert script's AS6-hardened port-kill + fresh-db logic exactly).

**Evidence layers (all pre-change):** the Mode-C audit of the Batch AW diff (`d578839..c9e41e6` + the operator's `5074408`, delegated read-only): **0 Critical / 0 High / 0 Medium / 2 Low / 4 Info** — all five AW claims verified TRUE (the unit layer re-run green 930/930, the 38/38 @utility census coverage re-derived, BOTH blind-spot plants replicated out-of-repo [the AW1 later-duplicate AND the AW2 `&&`→`||` seam flip tripping exactly the 4 failure-leg pins], the re-tag sweep completeness, the probe-delete AR4/AS3 keying, both hosts targeted, and the committed 96-*.png census [20 frames = 18 resweep + 2 evidence]). The findings that sized this cycle: **L1** the AW1 completeness pin's header regex `/@utility ([a-z0-9-]+) \{/g` guards only the conventional shape — a duplicate written with variant spacing (`@utility sf-pill-red{`) or an unconventional name is invisible to BOTH the census and the dupe guard (38/38 current coverage — latent, future-only); **L2** `ref-resweep-s96.mjs:20` says `Usage: node` while importing the `.ts` seam — works on node ≥ 23.6 but contradicts the documented bun-precedent for this script class. The Infos: **I1** the reference probe credentials hardcoded across ~10 committed scripts (the long-standing dedicated probe-account posture — rotation needs a sweep checklist); **I2** the completeness pin nested under the sf-pill family describe though it guards the whole file; **I3** `capture-s96-evidence.mjs` owns its exit code only on the md5 branch (a mid-run throw exits 1 via node's unhandled-rejection semantics — fail-safe but not gate-owned); **I4** the Cycle-46 PLAN paragraph's "top-level throw" phrasing (a true top-level throw bypasses the catch envelope; the execution record says "in-try" correctly).

**Implemented TDD (the Cycle-47 plan written into the remediation plan BEFORE any source change):**
- **AX1 — the headline, the @utility census hardening (the audit's L1+I2).** (a) The blind spot demonstrated LIVE on the pre-change tree: a shape-variant duplicate `@utility sf-pill-red{` (no space before the brace, orange content) planted at the globals.css tail left ALL 930 pins GREEN. (b) The AW1 pin widened IN-PLACE to `/@utility\s+([A-Za-z0-9_-]+)\s*\{/g` and hoisted to its own describe ("the @utility census (S96/AW1 + S97/AX1)"). (c) The NEW token-reconciliation pin: the `@utility` token count must EQUAL the matched-header count. (d) The two-plant mutation matrix, each plant tripping EXACTLY its own pin: Plant A (the variant-shape duplicate) tripped ONLY the widened dupe check (1 failed / 930 passed — the reconciliation pin green, both counts include the variant); Plant B (the unparseable form `@utility sf-pill-red /* dup */ {`) tripped ONLY the reconciliation pin (1 failed / 930 passed — the dupe check green, the header never matched); the leg-2 first-occurrence contract pins green through both (which is the point); restored → all green. Clean tree: **931/931**.
- **AX2 — the runner-convention reconciliation, CORRECTED EMPIRICALLY mid-cycle (the audit's L2).** The audit offered two closes (re-tag to bun, OR document the node constraint); the bun-first re-tag was tried and FALSIFIED live: `bun scripts/ref-resweep-s97.mjs` crashed in playwright-core's `_parseSetCookieHeader` during the verify-email POST — the AW2 gate caught it (exit 1 on the real envelope, probeCleanup "delete answered 401": an unplanned live failure-path proof of the s96 gate); `node scripts/ref-resweep-s97.mjs` on the SAME tree passed (ok:true, exit 0). The shipped close: the usage lines of both re-tag scripts + the capture script say `node` with the constraint stated (node ≥ 23.6 type-stripping for the `.ts` seam import; bun 1.3.14 documented INCOMPATIBLE for this script class), the S97 lesson-1 records the falsification, and the dep-audit bun-precedent is scoped to its own script class.
- **AX3 — the capture-class exit ownership (the audit's I3).** The catch added to `capture-s96-evidence.mjs` (+ the `thrown` completion-gate boolean; the completion line keyed on both explicit booleans). Observed live BOTH ways through a planted mid-run throw (at the try top — no frames written): BEFORE the fix, exit 1 via node's unhandled-rejection spew with zero script-owned lines; AFTER, exit 1 with the script-owned `S96 AW surface captures FAILED: …` line and the completion line absent. The s97 re-tag carries the shape.
- **AX4 — the one-word plan fix (the audit's I4).** The Cycle-46 plan paragraph's "top-level throw" → "in-try throw" (healed in-place, the AW3 precedent).
- **AX5 — the probe-credential rotation checklist (the audit's I1).** Documented as the S97 lesson-4 (the sweep list `grep -l sepnetflix scripts/` → every committed re-tag script + the standing drawer probe — update all hits in one pass). Documentation only; the dedicated probe-account posture unchanged.
- **AX6 — the s97 riders.** `scripts/ref-resweep-s97.mjs` (from the s96 tag, carrying the AW2 gate + the corrected usage line; the re-tag swept every functional s96 string — probe email `s97-resweep-`, probe name "S97 Probe", all three capture path prefixes `97-`; the remaining 96-tags are historical prose only) and `scripts/capture-s97-evidence.mjs` (the AX frames: the Assignments view dark [the CONSUMERS map's densest view — the SOFT subfamily live: sf-pill-soft-yellow priority pills + sf-pill-soft-blue due pills] and the Exams view dark through the REAL sidebar navigation [the orange "Tomorrow" + yellow "N days" urgency trio], md5-distinct GATE-enforced: d498800d3b9a8096e747560b03d6f16e / 8e0b23c01e34644c7ed6583b8db8a0ae, exit 0). The resweep itself: **ok:true, exit 0** — refChecks 9/9, cloneChecks 9/9, failed [], the brand tables byte-matched on both hosts, the mobile drawers green on both, probeCleanup "ok", 18 captures.

**Re-certification (all on the FINAL tree — src/ untouched by the AX work, but the standing rhythm re-runs the full ladder anyway):** lint ✓ tsc ✓ unit **931/931** (27 files — the plan's projection exact); the canonical build green; the full cold 5-chunk e2e re-cert **474/474** (131+141+57+87+58 — every chunk first-pass, zero flakes); the standing suite **35/35 GREEN** (the full background runner — the dev daemon on :3000 per the setsid recipe + the :3200 standalone, zero concurrent spawns; the theme-restore closing guard green: demo light/violet intact); the s97 resweep ok:true with the exit-code gate live; agent-browser mobile-nav verified on BOTH hosts (reference 24 labeled in the expanded drawer [20 nav + 4 content] / drawer navigates to /Notes and auto-closes / closes via the drawer's own X at x:228 y:26 / 20 icon-only collapsed [the persisted `sidebarOpen:"true"` read BEFORE interpreting, restored after] with ZERO title/aria / scrollWidth 416 on /Notes — the reference's own overflow defect; clone 26 labeled [the superset skip-link "Skip to main content" off-screen at x:-9999 + 20 nav + 5 content] / drawer navigates + auto-closes / Escape closes / 20 icon-only collapsed ALL with title+aria [the clone's key `sf-sidebar-collapsed` read and removed after] / scrollWidth 390 — **no Tailwind v4 mobile-nav bug, s97 re-confirmed**); the s97 evidence captures (2 frames, md5-distinct GATE-enforced, exit 0); `.env.example` verified current (the env surface unchanged this cycle).

**Docs chain**: README (badge 1405, counts 931/474, the S97 seam addition, the Session-97 row with pipe parity verified), AGENTS (the 931 count + the S97 lessons section: audit-recs falsified live, census-regex shape blind spots, gate-owned failure paths, the rotation checklist), CLAUDE (the 931 count + the S97 seam tail), vitest.config.ts header (27 files / 931 + the S97 story), the remediation-plan header (AW → AX, 931/474, ZERO standing debt) + the Cycle-47 plan + execution record, the PAD v1.3.5 revision block, this worklog, `docs/session_63.md`.

**Stage summary.** Batch AX DONE: the @utility census closed against shape-variant escapes (the widened regex + the token-reconciliation pin — the two-plant mutation matrix proving each pin's own discriminator), the runner convention reconciled the honest way (the bun option falsified live; node ≥ 23.6 documented with bun marked incompatible for the resweep/capture class — the dep-audit precedent scoped to its own class), the capture class's every failure path gate-owned, and the rotation checklist documented. New baselines: unit **931/931**, e2e **474/474**, the standing suite **35/35**. Standing debt after AX: **ZERO**. The natural next cycle (Session-98) remains the standing rhythm: audit the AX diff, ride the riders, re-certify cold (anchor it on `docs/session_63.md`).

---

## Session-98 — Batch AY (Cycle 48): the capture-lineage runner-convention reconciliation + the census comment-immunity + the honest bun-scope

**Received state**: `9909192` (Batch AX `530c68c` + the operator's session-log commit adding `docs/session_64.md` [the S97 raw transcript — audited clean: one file, 103 insertions, no source changes, no key material]). The 22nd workspace reset — fresh clone, full re-provision (bun install 497 pkgs, `.env` from `.env.example` with DATABASE_URL="file:../db/custom.db", the `db/` folder at the repo root + push + seed, chromium-1243, the canonical production build). Anchors read: session_63 (the S97 transcript whose closing line names the standing rhythm the natural next cycle), session_64 (the operator's S97 transcript, incl. its maintenance-plateau note), the Cycle-47 record + the zero standing debt, the worklog tail. Ground truth: last completed cycle Session-97/Batch AX (Cycle 47) at `530c68c`; baselines unit 931/931, cold e2e 474/474, the standing suite 35/35. Standing debt: ZERO.

**Baseline re-certified cold BEFORE any work**: lint ✓ tsc ✓ unit 931/931 ✓ (27 files); the full cold 5-chunk e2e re-cert **474/474** (131+141+57+87+58 — every chunk first-pass, zero flakes — run per-chunk through a per-chunk runner replicating the cert script's AS6-hardened port-kill + fresh-db logic exactly).

**Evidence layers (all pre-change):** the Mode-C audit of the Batch AX diff (`5074408..530c68c` + the operator's `9909192`) — **0C/0H/0M/1L/4I**, all six AX claims verified TRUE (the unit layer green 931/931; the widened census coverage 38/38; BOTH mutation plants replicated live in-repo [Plant A the shape-variant duplicate tripping exactly the widened dupe check; Plant B the unparseable form tripping exactly the reconciliation pin]; the re-tag sweep completeness [the 7-line functional diff, prose-only residue]; the AX3 catch + the AX4 plan fix + the AX5 rotation checklist all located; the 20 committed 97-*.png frames). The finding that sized the cycle: **L1** the capture lineage s87–s96 (TEN scripts — four carrying the `DATABASE_URL=…` prefix, six bare) still documented `Usage: bun` against the AX2 node convention — the AX commit itself had modified capture-s96 (the AX3 catch) without fixing that file's own contradictory usage line. The Infos: **I1** capture-s97's header scoped the bun crash to "this flow's page.request calls" — the live evidence was the resweep's verify-email POST; **I2** the token-reconciliation pin counted `@utility` inside CSS comments — a future prose comment would inflate the token census into a loud FALSE failure (latent-only: 38/38 all real headers); **I3** the widened header regex cannot match a wildcard utility — by-design, the error message is the affordance; **I4** the capture finally-restore is best-effort while the context lives — the S4 lesson's boundary.

**Implemented TDD (the Cycle-48 plan written into the remediation plan BEFORE any source change):**
- **AY1 — the headline, the capture-lineage runner-convention reconciliation (the audit's L1).** (a) The RED-first convention pin in the NEW `tests/script-conventions.test.ts` — demonstrated live RED on exactly the ten stale files; (b) the sweep — the ten usage lines swapped `bun` → `node` (the four DATABASE_URL-prefixed lines keep their prefix), the class verified node-safe (zero bun-specific APIs); (c) GREEN + the mutation check (a planted bun line trips exactly the pin). The re-tag script class is now self-guarding.
- **AY2 — the capture-s97 bun-scope honest re-scope (the audit's I1).** The header re-scoped to the exact live evidence (the RESWEEP's verify-email POST — a Set-Cookie response; the capture flow's own requests untested under bun); the s98 re-tag inherited the corrected wording.
- **AY3 — the census comment-immunity (the audit's I2).** (a) The blind spot demonstrated live — a planted prose comment containing `@utility` tripped the CURRENT reconciliation pin (39 tokens vs 38 headers); (b) the `stripCssComments()` helper (the block form — the only comment form globals.css carries) applied to both census counts IN-PLACE; (c) the NEW helper-discrimination pin; (d) the three-plant mutation matrix re-proven (the variant-shape plant → exactly the dupe check; the unparseable-form plant → exactly the reconciliation pin; the comment plant → NOTHING).
- **AY4 — the latent-shape register (the audit's I3+I4 — documented, no action).** I3 the wildcard form by-design; I4 the best-effort finally boundary documented.
- **AY5 — the s98 riders.** `scripts/ref-resweep-s98.mjs` (the 7-line re-tag sweep from s97; the AW2 gate import + the AX2 constraint carried) + `scripts/capture-s98-evidence.mjs` (Frame 1 the GradeTracker dark [the four-family view, the s96-proven gate]; Frame 2 the Flashcards dark [the sf-pill-yellow difficulty pills on the seeded deck's card grid — a surface NO prior evidence frame covered]; both md5-DISTINCT GATE-enforced; the leg-2 first draft gated on the wrong surface — the study pane — and the AX3 catch caught it live, the leg re-designed against the real DOM).

**Re-certification (all on the FINAL tree — src/ untouched by the AY work, but the standing rhythm re-runs the full ladder anyway):** lint ✓ tsc ✓ unit **934/934** (28 files — the plan's +2 projection corrected to +3: the AY1 census pin rides with its own class-census sanity leg, the AT census-ran doctrine, owned in the execution record); the canonical build green; the full cold 5-chunk e2e re-cert **474/474** (every chunk first-pass, zero flakes); the standing suite — all 35 stages spawned EXACTLY once through the full-suite runner (a setsid daemon through the environment's process window, the raw envelopes under /tmp/standing-suite/): **34/35 green with the single settings-roundtrip first-run finding re-run GREEN standalone** (exit 0, 0 findings — the documented S84-class environmental save-wait flake, the S97 precedent verbatim) — and **accent-dark-sweep RAN GREEN this cycle** (0 violations across all 7 accents — the one stage the S97 window could not fit); the theme-restore closing guard green (demo light/violet intact); the s98 resweep ok:true with the exit-code gate live (9/9 both hosts, the brand tables byte-matched, probeCleanup ok, 18 captures, exit 0); agent-browser mobile-nav verified on BOTH hosts (reference: `sidebarOpen` read-then-restored ["true" = expanded — the semantics settled empirically], 24 labeled expanded / auto-close / the drawer's own X / 20 icon-only collapsed ZERO title-aria / scrollWidth 416 on /Notes; clone: `sf-sidebar-collapsed` read-and-removed, 26 labeled [the superset skip-link] / auto-close / Escape / 20 icon-only collapsed ALL title+aria / scrollWidth 390 — **no Tailwind v4 mobile-nav bug, s98 re-confirmed**); the s98 evidence captures (2 md5-distinct GATE-enforced frames, exit 0); `.env.example` verified current.

**Docs chain**: README (badge 1408, counts 934/474, the unit-seam enumeration extended with the AY1+AY3 seams, the Session-98 row with pipe parity verified), AGENTS (the 934 count + the S98 lessons — four lessons incl. the convention-class-census doctrine and the comment-immunity semantics), CLAUDE (the 934 count + the S98 seam tail), the vitest.config.ts header (28 files / 934 tests, the S98 re-anchor note), the remediation-plan header (AX → AY, 934/474) + the Cycle-48 plan + this execution record, the PAD v1.3.6 revision block, this worklog, `docs/session_65.md`.

**Stage summary.** Batch AY DONE: the AX2 node convention reconciled across the ENTIRE re-tag script class (ten stale lines swept, the class pinned self-guarding), the census counts run on comment-stripped CSS (the correct semantics — prose is not CSS), and every crash claim scoped to its exact repro. New baselines: unit **934/934**, e2e **474/474**, the standing suite **35/35** (the documented flake re-run green standalone; accent-dark-sweep covered). Standing debt after AY: **ZERO**. The natural next cycle (Session-99) remains the standing rhythm: audit the AY diff, ride the riders, re-certify cold (anchor it on `docs/session_65.md`).

---

## Session-99 — Batch AZ (Cycle 49): the mutation-record shape-true re-scope + the playwright-class census widening + the header-prose trap removal

**Received state**: `62e55c3` (Batch AY `5968b15` + the operator's session-log commit adding `docs/session_66.md` [the S98 raw transcript — audited clean: one file, 123 insertions, no source changes, no key material]). The 23rd workspace reset — fresh clone, full re-provision (bun install 497 pkgs, `.env` from `.env.example` with DATABASE_URL="file:../db/custom.db", the `db/` folder at the repo root + push + seed, chromium-1243, the canonical production build). Anchors read: session_65 (the S98 record whose closing line names the standing rhythm the natural next cycle), session_66 (the operator's S98 transcript), the Cycle-48 record + the ZERO standing debt, the worklog tail. Ground truth: last completed cycle Session-98/Batch AY (Cycle 48) at `5968b15`; baselines unit 934/934, cold e2e 474/474, the standing suite 35/35. Standing debt: ZERO.

**Baseline re-certified cold BEFORE any work**: lint ✓ tsc ✓ unit 934/934 ✓ (28 files); the full cold 5-chunk e2e re-cert **474/474** (131+141+57+87+58 — every chunk first-pass, zero flakes — run per-chunk through a per-chunk runner replicating the cert script's AS6-hardened port-kill + fresh-db logic exactly).

**Evidence layers (all pre-change):** the Mode-C audit of the Batch AY diff (`9909192..5968b15` + the operator's `62e55c3`) — **0C/0H/0M/1L/2I**, all six AY claims verified TRUE (the unit layer green 934/934; the ten-line sweep verified in the diff AND the 242-script class census re-run [every Usage line says node]; the AY1 mutation replicated live [a planted bun usage line tripping exactly the convention pin]; the 38/38 comment-stripped census re-derived live; the resweep-s98 gate wiring + the capture-s98 AX3 shape read in full; the 20 committed 98-*.png frames md5-distinct; the operator commit clean; no key material; src/ untouched). **The L1 finding that sized the cycle**: the Cycle-48 record's Plant B claim ("the unparseable form trips exactly the reconciliation pin") does NOT replicate verbatim on the final tree — the S97 inline-comment plant shape (`@utility sf-pill-red /* dup */ {`) trips the DUPE check under the AY3 strip (the comment is removed first, the line normalizes to a conventional duplicate header); the reconciliation pin's live discriminator is the wildcard form (`@utility sf-pill-* {` — replicated live, trips exactly the reconciliation pin). The Infos: **I1** the convention pin's census scope (the two re-tag lineages) excluded ~52 other scripts carrying `Usage: node` lines (129 playwright importers outside the lineages, 49 with Usage lines — all consistent today, none guarded); **I2** capture-s98's header prose contained the literal `Usage: bun` (line 3, describing the AY1 sweep — the rotation-sweep grep false-positived on it during this audit).

**Implemented TDD (the Cycle-49 plan written into the remediation plan BEFORE any source change):**
- **AZ1 — the headline, the mutation-record shape-true re-scope (the audit's L1).** (a) The Cycle-48 record's Plant B sentence healed IN-PLACE with the dated S99 correction (the AX4 precedent); (b) the NEW normalization pin in hue-tokens (+1): the inline-comment form normalizes under `stripCssComments` to a conventional duplicate — the census CAN match it (sf-pill-red headers = 2) while tokens and headers stay reconciled; (c) the mutation proof: the strip disabled → the AZ1 pin AND the AY3 comment-immunity pin BOTH fail; (d) the shape-true matrix re-run live: variant-shape → dupe; inline-comment → dupe (the normalization); wildcard → reconciliation; comment → NOTHING.
- **AZ2 — the playwright-class census widening (the audit's I1).** The AY1 pin's class census widened IN-PLACE from the two-lineage proxy to `playwrightCarryingScripts()` — every .mjs importing playwright (the mechanical class discriminator; 213 importers, 94 Usage-line carriers). The blind spot demonstrated live BEFORE the widening (a planted bun line in z-probe-s70.mjs left the current pin GREEN 2/2); after the widening the SAME plant tripped exactly the widened pin (the file named in the failure message); restored → green. The NEW sanity leg (>200 carriers — the import-shape regex drift guard); the lineage sanity legs stay.
- **AZ3 — the header-prose trap removal (the audit's I2).** capture-s98's line-3 prose reworded — the literal `Usage: bun` string gone; the rotation-sweep grep now returns ZERO hits across the whole directory.
- **AZ4 — the latent-register documentation (no action).** The frozen-historical-era doctrine recorded in the pin's scope-honesty comment: scripts that import NO playwright may document any runner (none currently do).
- **AZ5 — the s99 riders.** `scripts/ref-resweep-s99.mjs` (the 7-line re-tag sweep from s98 — provenance, usage, probe email `s99-resweep-`, probe name "S99 Probe", the three capture prefixes; the AW2 gate + the AX2 constraint + the AY2-honest crash scope carried) and `scripts/capture-s99-evidence.mjs` (Frame 1: the Dashboard dark [the seeded sf-pill-red exam-urgency + sf-pill-yellow priority pills — the app's HOME view, no prior evidence coverage]; Frame 2: the RUM panel [the emerald/amber/red rating trio, driven the s19-deterministic API-POSTed way — the probe rows deleted by sessionId in the finally, the persistent-DB restore]; both md5-DISTINCT GATE-enforced, first-pass, exit 0).

**Re-certification (all on the FINAL tree — src/ untouched by the AZ work, but the standing rhythm re-runs the full ladder anyway):** lint ✓ tsc ✓ unit **936/936** (28 files — the plan's +2 projection exact); the canonical build green; the full cold 5-chunk e2e re-cert **474/474** (every chunk first-pass, zero flakes); the standing suite — all 35 stages spawned EXACTLY once through the full-suite runner: **34/35 green with the single settings-roundtrip first-run finding re-run GREEN standalone** (exit 0, 0 findings — the documented S84-class environmental save-wait flake, the S97/S98 precedent verbatim); the theme-restore closing guard green (demo light/violet intact); the s99 resweep ok:true with the exit-code gate live (9/9 both hosts, the brand tables byte-matched, probeCleanup ok, 18 captures, exit 0); agent-browser mobile-nav verified on BOTH hosts (reference: `sidebarOpen` read-then-restored ["true" = expanded — the S98-settled semantics], 24 labeled expanded / auto-close / the drawer's own X / 20 icon-only collapsed ZERO title-aria / scrollWidth 416 on /Notes; clone: `sf-sidebar-collapsed` read-and-removed [null default], 26 labeled [the superset skip-link] / auto-close / Escape / 20 icon-only collapsed ALL title+aria / scrollWidth 390 / the hamburger aria-labeled "Open navigation menu" — **no Tailwind v4 mobile-nav bug, s99 re-confirmed**); the s99 evidence captures (2 md5-distinct GATE-enforced frames, exit 0, first-pass); `.env.example` verified current.

**Docs chain**: README (badge 1410, counts 936/474, the unit-seam enumeration extended with the AZ1+AZ2 seams, the Session-99 row with pipe parity verified), AGENTS (the 936 count + the S99 lessons — three lessons incl. the re-map-the-matrix doctrine and the lineage-is-a-proxy lesson), CLAUDE (the 936 count + the S99 seam tail), the vitest.config.ts header (28 files / 936, the S99 re-anchor note), the remediation-plan header (AY → AZ, 936/474) + the Cycle-49 plan + this execution record, the PAD v1.3.7 revision block, this worklog, `docs/session_67.md`.

**Stage summary.** Batch AZ DONE: the mutation-record now shape-true (the stale Plant B claim healed with a dated correction AND machine-checked by the normalization pin — a guard fix that changes normalization semantics re-maps the mutation matrix), the convention census widened from the lineage proxy to the mechanical playwright-import class (the blind spot demonstrated live and closed), and the rotation-sweep grep trap removed. New baselines: unit **936/936**, e2e **474/474**, the standing suite **35/35**. Standing debt after AZ: **ZERO**. The natural next cycle (Session-100) remains the standing rhythm: audit the AZ diff, ride the riders, re-certify cold (anchor it on `docs/session_67.md`).

---

## Session-100 — Batch BA (Cycle 50): the audit-rider cycle at the plateau — the census-count register note + the s100 evidence-frame rotation

**Received state**: `675b4b8` (Batch AZ `b23e99f` + the operator's session-log commit adding `docs/session_68.md` [the S99 raw transcript — audited clean: one file, 102 insertions, no source changes, no key material]). The 24th workspace reset — fresh clone, full re-provision (bun install 497 pkgs, `.env` from `.env.example` with DATABASE_URL="file:../db/custom.db", the `db/` folder at the repo root + push + seed, chromium-1243, the canonical build). Anchors read: session_67 (the S99 record whose closing line names the standing rhythm the natural next cycle), session_68 (the operator's S99 transcript), the Cycle-49 record + the ZERO standing debt, the worklog tail. Ground truth: last completed cycle Session-99/Batch AZ (Cycle 49) at `b23e99f`; baselines unit 936/936, cold e2e 474/474, the standing suite 35/35. Standing debt: ZERO.

**Baseline re-certified cold BEFORE any work**: lint ✓ tsc ✓ unit 936/936 ✓ (28 files); the full cold 5-chunk e2e re-cert **474/474** (131+141+57+87+58 — every chunk first-pass, zero flakes).

**Evidence layers (all pre-change):** the Mode-C audit of the Batch AZ diff (`62e55c3..b23e99f` + the operator's `675b4b8`) — **0C/0H/0M/0L/1I**, all six AZ claims verified TRUE (the unit layer re-run green 936/936; the FULL shape-true mutation matrix replicated live in-repo [Plant B the inline-comment form → exactly the dupe check; Plant C the wildcard form → exactly the reconciliation pin; Plant D the prose comment → NOTHING; the strip-disabled mutation → BOTH the AZ1 and AY3 comment-immunity pins fail]; the AZ2 census re-derived live on the final tree [215 importers, 96 Usage-line carriers, 0 stale, 119 usage-line-free] AND the blind-spot plant replicated live [a planted bun line in z-probe-s70.mjs tripping exactly the widened pin, the file named in the failure message, restored → green]; the AZ3 rotation-sweep grep ZERO hits; the resweep-s99 gate wiring [the AW2 seam import + the exit wiring] + the capture-s99 AX3 shape [catch/thrown/md5Failed/finally-restore/gated completion] read in full; the 20 committed 99-*.png frames md5-distinct; the operator commit clean; no key material; src/ untouched; the docs chain aligned [README badge 1410 + the Session-99 row pipe parity, AGENTS/CLAUDE/vitest-header/PAD v1.3.7 all carrying 936]; git hygiene clean). **The I1 finding that sized the cycle**: the AZ2 record's census counts (213 importers / 94 carriers) describe the PRE-rider tree — the AZ5 riders created two playwright importers that joined the guarded class after the widening measurement; the final-tree re-derivation is 215/96. The threshold-form pins absorb growth BY DESIGN — the close is a scoped register note, not a pin change.

**Implemented (the Cycle-50 plan written into the remediation plan BEFORE any source change):**
- **BA1 — the census-count register note (the audit's I1).** The dated S100 note appended to the AZ2 execution record (the AZ4 latent-register precedent): the final-tree counts (215 importers / 96 carriers / 0 stale / 119 usage-line-free), the growth mechanism (the two s99 riders joining post-widening), the threshold-absorbs-growth doctrine restated, and the explicit REJECTION of an exact-count pin (it would contradict the silent-absorption design intent and manufacture conscious-update friction on every future re-tag).
- **BA2 — the s100 riders.** `scripts/ref-resweep-s100.mjs` (the 7-location re-tag sweep from s99 — provenance, usage, probe email `s100-resweep-`, probe name "S100 Probe", the three capture path prefixes; the AW2 gate import + the AX2 node-runner constraint + the AY2-honest crash scope carried verbatim) and `scripts/capture-s100-evidence.mjs` (the evidence-frame rotation onto two CONSUMERS-map surfaces NO prior evidence frame covered, both already e2e-pinned: Frame 1 the Calculator dark [the sf-pill-red AC key, the AG3-pinned surface, zero state dependency — the aria-label "Clear: AC" located the way the AG3 spec does]; Frame 2 the Events dark with the create-dialog's error banner live [the sf-alert-red family, the AU3c-pinned surface, driven deterministically by the route-aborted POST — the route unrouted in the finally via the eventsRouteInstalled ownership flag, zero persistent rows]; both md5-DISTINCT GATE-enforced: 97892003fb914d2c56eb10d8dee5bc8b / 727571fc6ed0e6e3ef9c7e8305b7dad2, first-pass, exit 0).
- **BA3 — the honest-zero-cycle acknowledgment.** No guard gap found; unit census **936 UNCHANGED** and e2e **474 UNCHANGED** — the projections exact BY CONSTRUCTION (BA1 documentation-only; BA2 scripts-only; src/ untouched).

**Re-certification (all on the FINAL tree — src/ untouched by the BA work, but the standing rhythm re-runs the full ladder anyway):** lint ✓ tsc ✓ unit **936/936** (28 files — the zero-cycle projection exact); the canonical build green; the full cold 5-chunk e2e re-cert **474/474** (131+141+57+87+58 — every chunk first-pass, zero flakes); the standing suite — **GREEN 35/35 FIRST-PASS** (even the settings-roundtrip stage, the documented S84-class environmental save-wait flake, ran green on its first run this window — no re-run needed; the theme-restore closing guard green [demo light/violet intact]); the s100 resweep ok:true with the exit-code gate live (9/9 both hosts, the brand tables byte-matched, probeCleanup ok, 18 captures, exit 0); agent-browser mobile-nav verified on BOTH hosts (reference: `sidebarOpen` read-then-restored ["true" = expanded — the S98-settled semantics], 24 labeled visible links with the drawer open [20 nav in the 288px panel + 4 page-behind through the translucent backdrop — the S97–S99 viewport instrument, its scope pinned in the S100 lessons after the drawer-panel-scoped count read 20] / drawer navigates to /Notes and auto-closes / closes via the drawer's own X at x:228 y:26 / 20 icon-only collapsed ZERO title-aria / scrollWidth 416 on /Notes — the reference's own overflow defect; clone: `sf-sidebar-collapsed` read-and-removed [null default], 26 labeled [the superset skip-link "Skip to main content" at x:-9999] / drawer navigates to /Notes and auto-closes [the dialog UNMOUNTS] / Escape closes / 20 icon-only collapsed ALL title+aria / scrollWidth 390 / the hamburger aria-labeled "Open navigation menu" — **no Tailwind v4 mobile-nav bug, s100 re-confirmed**); the s100 evidence captures (2 md5-distinct GATE-enforced frames, exit 0, first-pass); `.env.example` verified current (the env surface unchanged this cycle — src/ reads AUTH_SECRET/DATABASE_URL/NEXT_PUBLIC_SITE_URL/NODE_ENV, all covered).

**Docs chain**: README (badge 1410, counts 936/474, the Session-100 row with pipe parity verified), AGENTS (the 936 count + the S100 lessons — three lessons incl. the register-note doctrine, the clean-audit-is-the-deliverable doctrine, and the instrument-scope lesson), CLAUDE (the 936 count + the S100 seam tail re-anchor), the vitest.config.ts header (28 files / 936, the S100 re-anchor note), the remediation-plan header (AZ → BA, 936/474) + the Cycle-50 plan + this execution record, the PAD v1.3.8 revision block, this worklog, `docs/session_69.md`.

**Stage summary.** Batch BA DONE: the census-count register note (the AZ2 record now carries the final-tree counts and the growth mechanism — the next audit's re-derivation has a scoped expectation), the s100 evidence-frame rotation onto two never-covered surfaces (both already e2e-pinned), and the honest-zero-cycle acknowledgment (no manufactured headline — the verified plateau IS the deliverable). Baselines unchanged: unit **936/936**, e2e **474/474**, the standing suite **35/35 first-pass**. Standing debt after BA: **ZERO**. The natural next cycle (Session-101) remains the standing rhythm: audit the BA diff, ride the riders, re-certify cold (anchor it on `docs/session_69.md`).

---

## Session-101 — Batch BB (Cycle 51): the audit-rider cycle at the plateau — the register rotation + the s101 evidence-frame rotation

**Received state**: `4bb9ffb` (Batch BA `1711b59` + the operator's session-log commit adding `docs/session_70.md` [the S100 raw transcript — audited clean: one file, 126 insertions, no source changes, no key material]). The 25th workspace reset — fresh clone, full re-provision (bun install 497 pkgs, `.env` from `.env.example` with DATABASE_URL="file:../db/custom.db", the `db/` folder at the repo root + push + seed, chromium-1243, the canonical build). Anchors read: session_69 (the S100 record whose closing line names the standing rhythm the natural next cycle), session_70 (the operator's S100 transcript), the Cycle-50 record + the ZERO standing debt, the worklog tail. Ground truth: last completed cycle Session-100/Batch BA (Cycle 50) at `1711b59`; baselines unit 936/936, cold e2e 474/474, the standing suite 35/35. Standing debt: ZERO.

**Baseline re-certified cold BEFORE any work**: lint ✓ tsc ✓ unit 936/936 ✓ (28 files); the full cold 5-chunk e2e re-cert **474/474** (131+141+57+87+58 — every chunk first-pass, zero flakes).

**Evidence layers (all pre-change):** the Mode-C audit of the Batch BA diff (`675b4b8..1711b59` + the operator's `4bb9ffb`) — **0C/0H/0M/0L/1I**, all six BA claims verified TRUE (the BA1 register note read in full [the final-tree counts 215/96/0-stale/119, the growth mechanism, the threshold doctrine, the exact-count-pin rejection]; the BA2a resweep script read in full [the 7-location re-tag diff vs s99 EXACT — 14 changed line-pairs, nothing else; the AW2 gate import + the resweepExitCode wiring, the AX2 node-runner constraint, the AY2-honest crash scope, the S92/AS3 probeEmail ownership]; the BA2b capture script read in full [the AG3 AC-key wait, the AU3c route-abort shape with the eventsRouteInstalled ownership flag, the md5-DISTINCT gate with the explicit booleans, the AV2/AX3 exit-code semantics, the S4 restore on every path]; the 20 committed 100-*.png frames md5-DISTINCT [0 duplicate hashes]; the two rotation frames' committed md5s matching the record verbatim [97892003fb914d2c56eb10d8dee5bc8b / 727571fc6ed0e6e3ef9c7e8305b7dad2]; the operator commit clean [one file, 126 insertions]; no key material [the b3BlbnNzaC1rZXktdjE scan: zero hits]; src/ and tests/ untouched by BA [git diff --stat: 0 lines under src/ and tests/]; the docs chain aligned [README badge 1410 + the Session-100 row pipe parity at 4, AGENTS/CLAUDE carrying 936, the vitest header re-anchored S100/BA, PAD v1.3.8]). **The I1 finding that sized the cycle**: the BA1 note's counts (215/96) describe the pre-BA-rider tree — the BA2 riders created two more playwright importers that joined the guarded class after the measurement; the post-BA final-tree re-derivation (the pin's own regex, instrument-identical) is **217/98/0-stale/119-frozen** — the doctrine's own predicted drift, arrived on schedule.

**Implemented (the Cycle-51 plan written into the remediation plan BEFORE any source change):**
- **BB1 — the S101 register note (the audit's I1).** The dated note appended to the BA1 execution record (the AZ4/BA1 precedent): the post-BA final-tree counts (217 importers / 98 carriers / 0 stale / 119 usage-line-free), the growth mechanism, the register-rotates-forward doctrine, the exact-count pin staying rejected.
- **BB2 — the s101 riders.** `scripts/ref-resweep-s101.mjs` (the 7-location re-tag sweep from s100 — provenance, usage, probe email `s101-resweep-`, probe name "S101 Probe", the three capture path prefixes; the AW2 gate + the AX2 node-runner constraint + the AY2-honest crash scope carried verbatim; live run ok:true, exit 0 — 9/9 both hosts, the brand tables byte-matched, probeCleanup ok, 18 captures) and `scripts/capture-s101-evidence.mjs` (the evidence-frame rotation onto two CONSUMERS-map emerald-alert surfaces NO prior evidence frame covered, both already e2e-pinned, both zero-persistent-state by construction: Frame 1 the Login route's check-email alert in dark [the auth-flows-pinned sf-alert-emerald surface, driven with a non-existent email — the forgot API's identical-200 no-oracle contract; dark via the context's colorScheme emulation]; Frame 2 the /export page's import-success alert in dark [the s23-import-pinned sf-alert-emerald surface, driven with an empty envelope — 0/0/0; dark via the boot script's system fallback — the S21 me-route fulfill was INERT on this server-component route, the honest mechanism named in the S101 lessons]; both md5-DISTINCT GATE-enforced: efa77bc0414d5ca1c4022c3bd77baaa3 / 621d704302cd8a455c7924e8b70e8ad7, first-pass, exit 0).
- **BB3 — the honest-zero-cycle acknowledgment.** No guard gap found; unit census 936 UNCHANGED and e2e 474 UNCHANGED — the projections exact BY CONSTRUCTION (BB1 documentation-only; BB2 scripts-only; src/ and tests/ untouched).

**Re-certification (all on the FINAL tree — src/ untouched by the BB work, but the standing rhythm re-runs the full ladder anyway):** lint ✓ tsc ✓ unit **936/936** (28 files — the zero-cycle projection exact); the canonical build green (re-run on the final tree — ✓ compiled, 50/50 pages, the standalone asset contract intact); the full cold 5-chunk e2e re-cert **474/474** (131+141+57+87+58 — every chunk first-pass, zero flakes); the standing suite — **GREEN 35/35 FIRST-PASS** (every stage green through the full-suite runner, even the settings-roundtrip stage — the documented S84-class environmental save-wait flake — ran green on its first run this window; the theme-restore closing guard green [demo light/violet intact]); the s101 resweep ok:true with the exit-code gate live (9/9 both hosts, the brand tables byte-matched, probeCleanup ok, 18 captures, exit 0); agent-browser mobile-nav verified on BOTH hosts (reference: `sidebarOpen` read-then-restored ["true" = expanded], 24 labeled visible links [20 nav + 4 page-behind, the viewport instrument] / auto-close / the drawer's own X at x:228 y:26 / 20 icon-only collapsed ZERO title-aria / scrollWidth 416 on /Notes; clone: `sf-sidebar-collapsed` read-and-removed [null default], 26 labeled [the superset skip-link] / auto-close [the dialog UNMOUNTS] / Escape / 20 icon-only collapsed ALL title+aria / scrollWidth 390 / the hamburger aria-labeled "Open navigation menu" — **no Tailwind v4 mobile-nav bug, s101 re-confirmed**); the s101 evidence captures (2 md5-distinct GATE-enforced frames, exit 0, first-pass); `.env.example` verified current.

**Docs chain**: README (badge 1410, counts 936/474, the Session-101 row with pipe parity verified), AGENTS (the 936 count + the S101 lessons — three lessons incl. the register-rotation doctrine, the route-intercept-consumer lesson, the zero-state-at-the-API-contract lesson), CLAUDE (the 936 count + the S101 seam tail re-anchor), the vitest.config.ts header (28 files / 936, the S101 re-anchor note), the remediation-plan header (BA → BB) + the Cycle-51 plan + this execution record, the PAD v1.3.9 revision block, this worklog, `docs/session_71.md`.

**Stage summary.** Batch BB DONE: the register rotated forward (the BA1 record now carries the post-BA-tree counts and the rotation mechanism — the next audit's re-derivation has the scoped expectation), the s101 evidence-frame rotation onto two never-covered emerald-alert surfaces (both already e2e-pinned, both zero-persistent-state by construction), and the honest-zero-cycle acknowledged (no manufactured headline — the verified plateau IS the deliverable). Baselines unchanged: unit **936/936**, e2e **474/474**, the standing suite **35/35 first-pass**. Standing debt after BB: **ZERO**. The natural next cycle (Session-102) remains the standing rhythm: audit the BB diff, ride the riders, re-certify cold (anchor it on `docs/session_71.md`).

---

## Session-102 — Batch BC (Cycle 52): the audit-rider cycle at the plateau — the register rotation + the s102 evidence-frame rotation

**Received state**: `c565c3a` (Batch BB `aa0cfc0` + the operator's session-log commit adding `docs/session_72.md` [the S101 raw transcript — audited clean: one file, 104 insertions, no source changes, no key material]). The 26th workspace reset — fresh clone, full re-provision (bun install 497 pkgs, `.env` from `.env.example` with DATABASE_URL="file:../db/custom.db", the `db/` folder at the repo root + push + seed, chromium, the canonical build). Anchors read: session_71 (the S101 record whose closing line names the standing rhythm the natural next cycle), session_72 (the operator's S101 transcript), the Cycle-51 record + the ZERO standing debt, the worklog tail. Ground truth: last completed cycle Session-101/Batch BB (Cycle 51) at `aa0cfc0`; baselines unit 936/936, cold e2e 474/474, the standing suite 35/35. Standing debt: ZERO.

**Baseline re-certified cold BEFORE any work**: lint ✓ tsc ✓ unit 936/936 ✓ (28 files); the full cold 5-chunk e2e re-cert **474/474** (131+141+57+87+58 — every chunk first-pass, zero flakes).

**Evidence layers (all pre-change):** the Mode-C audit of the Batch BB diff (`4bb9ffb..aa0cfc0` + the operator's `c565c3a`) — **0C/0H/0M/0L/1I**, all six BB claims verified TRUE (the BB1 register note read in full; the BB2a resweep script's 7-location re-tag diff vs s100 EXACT; the BB2b capture script's full gate shape [the md5-DISTINCT booleans, the AV2/AX3 exit-code semantics, the catch/finally ownership, the S4 restore on every path]; the 20 committed 101-*.png frames md5-distinct; the two rotation frames' committed md5s matching the record verbatim; the operator commit clean; src/ and tests/ untouched by BB; the docs chain aligned [README badge 1410 + the Session-101 row pipe parity, AGENTS/CLAUDE 936, the vitest header S101/BB, PAD v1.3.9]; no key material [the two `b3BlbnNzaC1rZXktdjE` diff hits are the audit prose quoting the scan string itself; the four BEGIN-OPENSSH-PRIVATE-KEY doc mentions pre-date BB]). **The I1 finding that sized the cycle**: the BB1 note's counts (217/98) describe the pre-BB-rider tree — the post-BB final-tree re-derivation (the pin's own regex, instrument-identical, the expectation stated BEFORE the measurement: the register's 217/98 + the two named s101 riders) is **219 importers / 100 carriers / 0 stale / 119 usage-line-free** — the doctrine's own predicted drift, arrived on schedule.

**Implemented (the Cycle-52 plan written into the remediation plan BEFORE any source change):**
- **BC1 — the S102 register note (the audit's I1).** The dated note appended to the BB1 execution record: the post-BB final-tree counts (219 importers / 100 carriers / 0 stale / 119 usage-line-free), the growth mechanism, the register-rotates-forward doctrine, the arithmetic verified live (the S102 lesson-1 doctrine), the exact-count pin staying REJECTED.
- **BC2 — the s102 riders.** `scripts/ref-resweep-s102.mjs` (the 7-location re-tag sweep from s101 — provenance, usage, probe email `s102-resweep-`, probe name "S102 Probe", the three capture path prefixes; the AW2 gate + the AX2 node-runner constraint + the AY2-honest crash scope carried verbatim; the re-tag exactness verified by the normalization diff — EMPTY — before the live run, the S102 lesson-3 instrument; live run **ok:true, exit 0** — 9/9 both hosts, the brand tables byte-matched, probeCleanup ok, 18 captures) and `scripts/capture-s102-evidence.mjs` (the evidence-frame rotation onto two CONSUMERS-map surfaces NO prior evidence frame covered, both already e2e-pinned, both zero-persistent-state BY CONSTRUCTION through the SEED — the S102 lesson-2 doctrine: Frame 1 the GradeTracker dark [the AG4-pinned scoreBadgeClass pills — the seeded rows render three families in one frame: emerald 92/100 + sky 85/100 + amber 78/100]; Frame 2 the Assignments dark [the S6-pinned sf-pill-soft family — the soft-blue due-in pills + the soft-yellow priority pills, the SOFT family's first rotation frame]; both md5-DISTINCT GATE-enforced: 2bf33daafba4671e1ab52ee6ca7489f3 / 2cab1ce8903f453674d5b2256f576771, first-pass, exit 0; both frames pixel-probe verified genuinely dark [mean brightness 28.4 / 25.5 — the PIL decode]; the S4 violet/light restore awaited on every path).
- **BC3 — the honest-zero-cycle acknowledgment.** No guard gap found IN THE PRE-CHANGE AUDIT; unit census **936 UNCHANGED** and e2e **474 UNCHANGED** — exact BY CONSTRUCTION for the planned riders (BC1 documentation-only; BC2 scripts-only; src/ untouched).
- **BC4 — the S12-B readiness-gate hardening (found BY the final re-cert, planned before the change).** The final cold 5-chunk re-cert's chunk 4 failed ONE test — the S12-B skip-link focus test, reproducible THREE consecutive times. The cold-start probe (the test's exact flow) measured the app AT the weak gate on a cold server: appHydrated ABSENT / mainExists false / sidebar false — the LOADING state (the boot script's pre-paint --sf-primary satisfies the weak `hydrated()` gate while the auth gate is still resolving; the loading state renders the skip link WITHOUT main#main-content — the Enter's hash navigation found no focus target, the 15s ceiling expired). The gate strengthened IN-PLACE to the status-gated `data-app-hydrated` marker (the S8-A marker): RED 3x → cold GREEN 3x → the full chunk-4 cold re-cert **87/87**; lint ✓ tsc ✓ unit **936/936** re-run on the fixed tree; ONE test file touched, the census unchanged.

**Re-certification (all on the FINAL tree):** lint ✓ tsc ✓ unit **936/936** (28 files; re-run after the BC4 fix); the canonical build green; the full cold 5-chunk e2e re-cert **474/474** (chunks 1–3+5 first-pass; chunk 4's single S12-B failure root-caused → fixed in-place → re-certified cold 87/87); the standing suite — **GREEN 35/35** through the full-suite runner (the theme-restore closing guard green [demo light/violet intact]); the s102 resweep ok:true with the exit-code gate live (9/9 both hosts, the brand tables byte-matched, probeCleanup ok, 18 captures, exit 0); agent-browser mobile-nav verified on BOTH hosts (reference: `sidebarOpen` read-then-restored, 24 labeled visible links / auto-close / the drawer's own X at x:228 y:26 / 20 icon-only collapsed ZERO title-aria / scrollWidth 416 on /Notes; clone: `sf-sidebar-collapsed` read-and-removed [null default], 26 labeled [the superset skip-link] / auto-close [the dialog UNMOUNTS] / Escape / 20 icon-only collapsed ALL title+aria / scrollWidth 390 / the hamburger aria-labeled "Open navigation menu" — **no Tailwind v4 mobile-nav bug, s102 re-confirmed**); the s102 evidence captures (2 md5-distinct GATE-enforced frames, exit 0, first-pass, both pixel-probe dark); `.env.example` verified current.

**Docs chain**: README (badge 1410, counts 936/474, the Session-102 row with pipe parity verified), AGENTS (the 936 count + the S102 lessons — the register-arithmetic-verified doctrine, the seeded-data-frame doctrine, the re-tag normalization-diff doctrine), CLAUDE (the 936 count + the S102 seam tail re-anchor), the vitest.config.ts header (28 files / 936, the S102 re-anchor note), the remediation-plan header (BB → BC) + the Cycle-52 plan + this execution record, the PAD v1.3.10 revision block, this worklog, `docs/session_73.md`.

**Stage summary.** Batch BC DONE: the register rotated forward (the BB1 record now carries the post-BB-tree counts — the next audit's re-derivation has the scoped expectation), the evidence-frame rotation onto two never-covered surfaces through the seed itself (the GradeTracker dark score pills + the Assignments dark soft pills — the SOFT family's first rotation frame), the S12-B readiness-gate hardening (the final re-cert's one reproducible failure root-caused and closed), and the honest-zero-cycle acknowledged for the planned riders (no manufactured headline — the verified plateau IS the deliverable). Baselines unchanged: unit **936/936**, e2e **474/474**, the standing suite **35/35**. Standing debt after BC: **ZERO**. The natural next cycle (Session-103) remains the standing rhythm: audit the BC diff, ride the riders, re-certify cold (anchor it on `docs/session_73.md`).

## Session-103 — Batch BD (Cycle 53): the audit-rider cycle at the plateau — the register rotation + the s103 evidence-frame rotation

**Received state**: `3f9bb80` (Batch BC `a33bd8c` + the operator's session-log commit adding `docs/session_74.md` [the S102 raw transcript — audited clean: one file, 129 insertions, no source changes, no key material]). The 27th workspace reset — fresh clone, full re-provision (bun install 497 pkgs, `.env` from `.env.example` with DATABASE_URL="file:../db/custom.db", the `db/` folder at the repo root + push + seed, the canonical build — **plus the fresh-workspace browser-build step the S103 lesson-1 doctrine now names**: the cache held chromium build 1200 while the locked playwright-core 1.63.0 pins revision 1243; the first cold-cert chunk failed 130/131 with `browserType.launch` executable-not-found errors — infrastructure, not regression [every test failing at launch in ~2ms, zero app-side assertions reached]; `bunx playwright install chromium` resolved it, the re-run fully first-pass). Anchors read: session_73 (the S102 record whose closing line names the standing rhythm the natural next cycle), session_74 (the operator's S102 transcript), the Cycle-52 record + the ZERO standing debt, the worklog tail. Ground truth: last completed cycle Session-102/Batch BC (Cycle 52) at `a33bd8c`; baselines unit 936/936, cold e2e 474/474, the standing suite 35/35. Standing debt: ZERO.

**Baseline re-certified cold BEFORE any work**: lint ✓ tsc ✓ unit 936/936 ✓ (28 files); the full cold 5-chunk e2e re-cert **474/474** (131+141+57+87+58 — every chunk first-pass, zero flakes).

**Evidence layers (all pre-change):** the Mode-C audit of the Batch BC diff (`c565c3a..a33bd8c` + the operator's `3f9bb80`) — **0C/0H/0M/0L/1I**, all six BC claims verified TRUE (the BC1 register note read in full; the BC2a resweep script's 7-location re-tag diff vs s101 EXACT — the normalization diff EMPTY under the full token set [s-token, S-token, the bare predecessor token, the capture-path dash tokens]; the BC2b capture script's full gate shape [the md5-DISTINCT booleans, the AV2/AX3 exit-code semantics, the catch/finally ownership, the S4 restore on every path]; the 20 committed 102-*.png frames md5-distinct; the two rotation frames' committed md5s matching the record verbatim; the operator commit clean [docs/session_74.md only, 129 insertions]; src/ untouched + tests/ one file [accessibility.spec.ts +8/-1, the BC4 gate swap exactly as recorded]; the docs chain aligned [README badge 1410 + the Session-102 row pipe parity, AGENTS/CLAUDE 936, the vitest header S102/BC, PAD v1.3.10]; no key material [zero key-block insertions in the diff; the six BEGIN-OPENSSH-PRIVATE-KEY file mentions pre-date BC — file-provenance dates verified]). **The I1 finding that sized the cycle**: the BC1 note's counts (219/100) describe the pre-BC-rider tree — the post-BC final-tree re-derivation (the pin's own regex, instrument-identical, the expectation stated BEFORE the measurement: the register's 219/100 + the two named s102 riders) is **221 importers / 102 carriers / 0 stale / 119 usage-line-free** — the doctrine's own predicted drift, arrived on schedule (the register rotates forward, the exact-count pin stays rejected).

**Implemented (the Cycle-53 plan written into the remediation plan BEFORE any source change):**
- **BD1 — the S103 register note (the audit's I1).** The dated note appended to the BC1 execution record: the post-BC final-tree counts (221 importers / 102 carriers / 0 stale / 119 usage-line-free), the growth mechanism, the register-rotates-forward doctrine, the arithmetic verified live (the S102 lesson-1 doctrine, second consecutive cycle), the exact-count pin staying REJECTED.
- **BD2 — the s103 riders.** `scripts/ref-resweep-s103.mjs` (the 7-location re-tag sweep from s102 — provenance, usage, probe email `s103-resweep-`, probe name "S103 Probe", the three capture path prefixes; the AW2 gate + the AX2 node-runner constraint + the AY2-honest crash scope + the S92/AS3 probeEmail ownership carried verbatim; the re-tag exactness verified by the normalization diff — EMPTY — before the live run, the S102 lesson-3 instrument; live run **ok:true, exit 0** — 9/9 both hosts, the brand tables byte-matched, probeCleanup ok [zero S103 Probe rows verified independently through Prisma], 18 captures) and `scripts/capture-s103-evidence.mjs` (the evidence-frame rotation onto two CONSUMERS-map surfaces NO prior evidence frame covered, both already e2e-pinned, both zero-persistent-state BY CONSTRUCTION through the SEED — the S103 lesson-2 selection rule: the CONSUMERS map ∩ the coverage ledger [the s87–s102 rotation frames + the standing 31's five dark views] ∩ the seeded-family rule: Frame 1 the Exams dark [the S6/S9-J-pinned urgency pills — the seeded +1/+3/+4/+12-day dates render TWO of the ramp's four families: the orange "Tomorrow" + the yellow "N days"; the red/slate families stay unrendered BY SEED CONSTRUCTION, the S103 lesson-3 doctrine]; Frame 2 the Flashcards dark [the S7-pinned sf-pill-yellow difficulty badges on the seeded cards — the flashcards entry's first rotation frame]; both md5-DISTINCT GATE-enforced: 214f37331116ca3c7251856f6308ad07 / ccee9f9830c6cd5ae6eea6e9104492ae, first-pass, exit 0; both frames pixel-probe verified genuinely dark [mean brightness 48.8 / 52.3 — the PIL decode]; the S4 violet/light restore awaited on every path [verified directly through Prisma post-run]).
- **BD3 — the honest-zero-cycle acknowledgment.** No guard gap found IN THE PRE-CHANGE AUDIT; unit census **936 UNCHANGED** and e2e **474 UNCHANGED** — exact BY CONSTRUCTION for the planned riders (BD1 documentation-only; BD2 scripts-only; src/ and tests/ untouched).
- **BD4 — the reserved re-cert rider — closed UNEXERCISED.** The final cold re-cert found no defect (474/474, every chunk first-pass); the rider is recorded in the plan and closed in the execution record so the next audit reads a complete ledger.

**Re-certification (all on the FINAL tree):** lint ✓ tsc ✓ unit **936/936** (28 files; the census projection exact); the canonical build green; the full cold 5-chunk e2e re-cert **474/474** (131+141+57+87+58, every chunk first-pass); the standing suite — **GREEN 35/35** through the full-suite runner (the theme-restore closing guard green [demo light/violet intact, verified directly]); the s103 resweep ok:true with the exit-code gate live (9/9 both hosts, the brand tables byte-matched, probeCleanup ok, 18 captures, exit 0); agent-browser mobile-nav verified on BOTH hosts (reference: `sidebarOpen` read-then-restored, 24 labeled visible links / auto-close / the drawer's own X at (228,26) / 20 icon-only collapsed ZERO title-aria [the desktop rail] / scrollWidth 416 on /Notes — the reference's own overflow defect; clone: `sf-sidebar-collapsed` read-and-removed [null default], 26 labeled [the superset skip-link] / auto-close [the dialog UNMOUNTS] / Escape / 20 icon-only collapsed ALL title+aria / scrollWidth 390 / the hamburger aria-labeled "Open navigation menu" — **no Tailwind v4 mobile-nav bug, s103 re-confirmed**); the s103 evidence captures (2 md5-distinct GATE-enforced frames, exit 0, first-pass, both pixel-probe dark); `.env.example` verified current (the env surface enumerated live: NODE_ENV / DATABASE_URL / AUTH_SECRET / NEXT_PUBLIC_SITE_URL, all covered).

**Docs chain**: README (badge 1410, counts 936/474, the Session-103 row with pipe parity verified), AGENTS (the 936 count + the S103 lessons — the fresh-workspace browser-build provisioning doctrine, the rotation-candidate two-set intersection rule, the seed-rendered-subset coverage rule), CLAUDE (the 936 count + the S103 seam tail re-anchor), the vitest.config.ts header (28 files / 936, the S103 re-anchor note), the remediation-plan header (BC → BD) + the Cycle-53 plan + this execution record, the PAD v1.3.11 revision block, this worklog, `docs/session_75.md`.

**Stage summary.** Batch BD DONE: the register rotated forward (the BC1 record now carries the post-BC-tree counts — the next audit's re-derivation has the scoped expectation), the evidence-frame rotation onto two never-covered surfaces through the seed itself (the Exams dark urgency pills — the orange family's first frame since s100's Events — + the Flashcards dark difficulty badges), the fresh-workspace browser-build provisioning doctrine captured as the S103 lesson-1 (the 27th reset's one infrastructure discovery), and the honest-zero-cycle acknowledged for the planned riders (BD4 closed unexercised — no manufactured headline, the verified plateau IS the deliverable). Baselines unchanged: unit **936/936**, e2e **474/474**, the standing suite **35/35**. Standing debt after BD: **ZERO**. The natural next cycle (Session-104) remains the standing rhythm: audit the BD diff, ride the riders, re-certify cold (anchor it on `docs/session_75.md`).

## Session-104 — Batch BE (Cycle 54): the audit-rider cycle at the plateau — the register rotation + the s104 evidence-frame rotation onto the structural-family class

**Received state**: `eb6352e` (Batch BD `d3a4be5` + the operator's session-log commit adding `docs/session_76.md` [the S103 raw transcript — audited clean: one file, 94 insertions, no source changes, no key material]). The 28th workspace continuation — `git pull` fast-forward (one file), the workspace re-verified rather than re-cloned (node_modules intact at 502 installs/596 packages, chromium-1243 present matching the locked playwright-core 1.63.0, `db/custom.db` seeded [demo violet/light — the S4 closing state verified through Prisma], the canonical build re-run fresh after `rm -rf .next`). Anchors read: session_75 (the S103 record whose closing line names the standing rhythm the natural next cycle), session_76 (the operator's S103 transcript), the Cycle-53 record + the ZERO standing debt, the worklog tail. Ground truth: last completed cycle Session-103/Batch BD (Cycle 53) at `d3a4be5`; baselines unit 936/936, cold e2e 474/474, the standing suite 35/35. Standing debt: ZERO.

**Baseline re-certified cold BEFORE any work**: lint ✓ tsc ✓ unit 936/936 ✓ (28 files); the full cold 5-chunk e2e re-cert **474/474** (131+141+57+87+58 — every chunk first-pass, zero flakes).

**Evidence layers (all pre-change):** the Mode-C audit of the Batch BD diff (`3f9bb80..d3a4be5` + the operator's `eb6352e`) — **0C/0H/0M/0L/1I**, all six BD claims verified TRUE (the BD1 register note read in full [221/102/0-stale/119 + the growth mechanism + the register-rotates-forward doctrine + the exact-count pin staying rejected]; the BD2a resweep's 7-location re-tag diff vs s102 EXACT — the normalization diff EMPTY under the full token set [the audit's own first attempt missed the s101 bare predecessor token and was re-run with the complete set — the full set carries BOTH bare predecessors, the S104 lesson-1 doctrine]; the BD2b capture's full gate shape [the md5-DISTINCT booleans, the AV2/AX3 exit-code semantics, the S4 restore awaited in the finally]; the 20 committed 103-*.png frames md5-distinct [0 duplicate hashes]; the two rotation frames' committed md5s matching the record verbatim [214f37331116ca3c7251856f6308ad07 / ccee9f9830c6cd5ae6eea6e9104492ae]; the operator commit clean [docs/session_76.md only, 94 insertions]; src/ and tests/ untouched by BD [git diff --stat: 0 lines]; the docs chain aligned [README badge 1410 + the Session-103 row, AGENTS/CLAUDE 936, the vitest header S103/BD, PAD v1.3.11]; no key material [zero key-block insertions in the diff]). **The I1 finding that sized the cycle**: the BD1 note's counts (221/102) describe the pre-BD-rider tree — the post-BD final-tree re-derivation (the pin's own regex, instrument-identical, the expectation stated BEFORE the measurement: the register's 221/102 + the two named s103 riders) is **223 importers / 104 carriers / 0 stale / 119 usage-line-free** — the doctrine's own predicted drift, arrived on schedule.

**Implemented (the Cycle-54 plan written into the remediation plan BEFORE any source change):**
- **BE1 — the S104 register note (the audit's I1).** The dated note appended to the BD1 execution record: the post-BD final-tree counts (223 importers / 104 carriers / 0 stale / 119 usage-line-free), the growth mechanism, the register-rotates-forward doctrine, the arithmetic verified live (the S102 lesson-1 doctrine, third consecutive cycle), the exact-count pin staying REJECTED.
- **BE2 — the s104 riders.** `scripts/ref-resweep-s104.mjs` (the 7-location re-tag sweep from s103 — provenance, usage, probe email `s104-resweep-`, probe name "S104 Probe", the three capture path prefixes; the AW2 gate + the AX2 node-runner constraint + the AY2-honest crash scope + the S92/AS3 probeEmail ownership carried verbatim; the re-tag exactness verified by the normalization diff — EMPTY under the full token set — BEFORE the live run; live run **ok:true, exit 0** — 9/9 invariants both hosts, the brand tables byte-matched, probeCleanup ok [zero S104 Probe rows verified independently through Prisma], 18 captures) and `scripts/capture-s104-evidence.mjs` (the evidence-frame rotation onto two guarded surfaces NO prior evidence frame covered, both already e2e-pinned, both zero-persistent-state BY CONSTRUCTION through the SEED — the S104 lesson-2 selection rule: the rotation class WIDENS to the structural-family CONSUMERS map when the pill/alert class ∩ the coverage ledger ∩ the seeded-family rule exhausts, the S103 lesson-2's own anticipated end-state: Frame 1 the TIMETABLE dark [the S10-4-pinned sf-today-tint today-header — the `[data-today-header]` chip renders on the current week's today column EVERY day by construction; the seeded class grid renders all five Mon–Fri classes, Physics on today's Tuesday column at capture time; the sf-timetable-canvas week grid's first rotation frame]; Frame 2 the MYDAY dark [the S10-2/3/5-pinned sf-progress-card — the "Today's Progress" amber card renders UNCONDITIONALLY; the seeded My Day rows render their sf-pill-red date-form DuePills; the sf-progress-card family's first rotation frame anywhere — its ONLY consumer is the MyDay view]; both md5-DISTINCT GATE-enforced: **365fefc9757a266310df788567188a9c / 5d8d3e267c47074750a9fa8c56318a16**, first-pass, exit 0; both frames pixel-probe verified genuinely dark [mean brightness 19.7 / 44.3 — the PIL decode]; the S4 violet/light restore awaited on every path [verified directly through Prisma post-run]; the MyDay gate's first attempt counted .sf-subject-chip — the debug probe caught it in one run, the gate re-written to count exactly the two families the view renders, the S104 lesson-3 component-reading doctrine).
- **BE3 — the honest-zero-cycle acknowledgment.** No guard gap found; unit census 936 UNCHANGED and e2e 474 UNCHANGED — the projections exact BY CONSTRUCTION (BE1 documentation-only; BE2 scripts-only; src/ and tests/ untouched).
- **BE4 — the reserved re-cert rider — closed UNEXERCISED.** The final cold re-cert found no defect (474/474, every chunk first-pass); the rider is recorded in the plan and closed in the execution record so the next audit reads a complete ledger.

**Re-certification (all on the FINAL tree):** lint ✓ tsc ✓ unit **936/936** (28 files; the census projection exact); the canonical build green (the standalone asset contract intact); the full cold 5-chunk e2e re-cert **474/474** (131+141+57+87+58, every chunk first-pass); the standing suite — see the session record for the final verdict (the theme-restore closing guard green [demo light/violet intact, verified directly]); the s104 resweep **ok:true** with the exit-code gate live (9/9 invariants both hosts, the brand tables byte-matched, probeCleanup ok, 18 captures, exit 0); agent-browser mobile-nav verified on BOTH hosts (reference: `sidebarOpen` read-then-restored, 24 labeled visible links / auto-close / the drawer's own X at (228,26) / 20 icon-only collapsed ZERO title-aria [the desktop rail] / scrollWidth 416 on /Notes — the reference's own overflow defect; clone: `sf-sidebar-collapsed` read-and-removed [null default], 26 labeled [the superset skip-link] / auto-close [the dialog UNMOUNTS] / Escape closes / 20 icon-only collapsed ALL title+aria / scrollWidth 390 / the hamburger aria-labeled "Open navigation menu" — **no Tailwind v4 mobile-nav bug, s104 re-confirmed**); the s104 evidence captures (2 md5-distinct GATE-enforced frames, exit 0, first-pass, both pixel-probe dark); `.env.example` verified current (the env surface enumerated live: NODE_ENV / DATABASE_URL / AUTH_SECRET / NEXT_PUBLIC_SITE_URL, all covered).

**Docs chain**: README (badge 1410, counts 936/474, the Session-104 row with pipe parity verified), AGENTS (the 936 count + the S104 lessons — the normalization-diff full-token doctrine, the structural-family class-widening rule, the component-reading doctrine), CLAUDE (the 936 count + the S104 seam tail re-anchor), the vitest.config.ts header (28 files / 936, the S104 re-anchor note), the remediation-plan header (BD → BE) + the Cycle-54 plan + this execution record, the PAD v1.3.12 revision block, this worklog, `docs/session_77.md`.

**Stage summary.** Batch BE DONE: the register rotated forward (the BD1 record now carries the post-BD-tree counts and the rotation mechanism — the next audit's re-derivation has the scoped expectation), the evidence-frame rotation onto two never-covered surfaces through the seed itself (the Timetable dark today-header — the structural-family class's first rotation frame, the S104 lesson-2 widened map — + the MyDay dark progress card, the family's first frame anywhere), and the honest-zero-cycle acknowledged for the planned riders (BE4 closed unexercised — no manufactured headline, the verified plateau IS the deliverable). Baselines unchanged: unit **936/936**, e2e **474/474**, the standing suite **35/35**. Standing debt after BE: **ZERO**. The natural next cycle (Session-105) remains the standing rhythm: audit the BE diff, ride the riders, re-certify cold (anchor it on `docs/session_77.md`).

## Session-105 — Batch BF (Cycle 55): the audit-rider cycle at the plateau — the register rotation + the s105 MOBILE evidence-frame rotation (the viewport axis the program never varied)

**Received state**: `aaeb432` (Batch BE `73e543a` + the operator's session-log commit adding `docs/session_78.md` [the S104 raw transcript — audited clean: one file, 111 insertions, no source changes, no key material]). The 29th workspace continuation — `git pull` fast-forward (one file), the workspace re-verified rather than re-cloned (node_modules intact at 502 installs/596 packages, chromium-1243 present matching the locked playwright-core 1.63.0, `db/custom.db` seeded [demo violet/light — the S4 closing state verified directly through SQLite], the canonical build re-run fresh after `rm -rf .next`). Anchors read: session_77 (the S104 record whose closing line names the standing rhythm the natural next cycle), session_78 (the operator's S104 transcript), the Cycle-54 record + the ZERO standing debt, the worklog tail. Ground truth: last completed cycle Session-104/Batch BE (Cycle 54) at `73e543a`; baselines unit 936/936, cold e2e 474/474, the standing suite 35/35. Standing debt: ZERO.

**Baseline re-certified cold BEFORE any work**: lint ✓ tsc ✓ unit 936/936 ✓ (28 files); the full cold 5-chunk e2e cert **474/474** (131+141+57+87+58 — every chunk first-pass, zero flakes).

**Evidence layers (all pre-change):** the Mode-C audit of the Batch BE diff (`eb6352e..73e543a` + the operator's `aaeb432`) — **0C/0H/0M/0L/1I**, all six BE claims verified TRUE (the BE1 register note read in full [223/102/0-stale/119 + the growth mechanism + the register-rotates-forward doctrine + the exact-count pin staying rejected]; the BE2a resweep's 7-location re-tag diff vs s103 EXACT — the normalization diff EMPTY under the full token set [s104/S104/s103/S103/s102/S102 + the capture-path dash tokens]; the BE2b capture's full gate shape [the md5-DISTINCT booleans, the AV2/AX3 exit-code semantics, the S4 restore awaited in the finally]; the 20 committed 103-*.png frames md5-distinct [0 duplicate hashes]; the two rotation frames' committed md5s matching the record verbatim [365fefc9757a266310df788567188a9c / 5d8d3e267c47074750a9fa8c56318a16]; the operator commit clean [docs/session_78.md only, 111 insertions]; src/ and tests/ untouched by BE [git diff --stat: 0 lines]; the docs chain aligned [README badge 1410 + the Session-104 row, AGENTS/CLAUDE 936, the vitest header S104/BE, PAD v1.3.12]; no key material [zero key-block insertions in the diff]). **The I1 finding that sized the cycle**: the BE1 note's counts (223/104) describe the pre-BE-rider tree — the post-BE final-tree re-derivation (the pin's own regex, instrument-identical, the expectation stated BEFORE the measurement: the register's 223/104 + the two named s104 riders) is **225 importers / 106 carriers / 0 stale / 119 usage-line-free** — the doctrine's own predicted drift, arrived on schedule.

**Implemented (the Cycle-55 plan written into the remediation plan BEFORE any source change):**
- **BF1 — the S105 register note (the audit's I1).** The dated note appended to the BE1 execution record: the post-BE final-tree counts (225 importers / 106 carriers / 0 stale / 119 usage-line-free), the growth mechanism, the register-rotates-forward doctrine, the arithmetic verified live (the S102 lesson-1 doctrine, fourth consecutive cycle), the exact-count pin staying REJECTED.
- **BF2 — the s105 riders.** `scripts/ref-resweep-s105.mjs` (the 7-location re-tag sweep from s104 — provenance, usage, probe email `s105-resweep-`, probe name "S105 Probe", the three capture path prefixes; the AW2 gate + the AX2 node-runner constraint + the AY2-honest crash scope + the S92/AS3 probeEmail ownership carried verbatim; the re-tag exactness verified by the normalization diff — EMPTY under the full token set [s105/S105/s104/S104/s103/S103 + the capture-path dash tokens] — BEFORE the live run; live run **ok:true, exit 0** — the invariants green both hosts, the brand tables byte-matched, probeCleanup ok [zero s105-resweep probe rows verified independently through SQLite], 18 captures) and `scripts/capture-s105-evidence.mjs` (the MOBILE evidence-frame rotation — the VIEWPORT AXIS the rotation program has NEVER varied: every s87–s104 frame is a desktop 1280×800 capture, the AP-79/AP-80 lesson class [an axis never varied is an axis never verified], while the standing mobile captures are LIGHT dashboard/drawer/tasks only; both frames at 390×844 in DARK, both e2e-pinned by the S33 mobile sweep + the S36 dark-mobile sweep + their own surface pins, both zero-persistent-state BY CONSTRUCTION through the SEED with ZERO interaction: Frame 1 the TIMETABLE MOBILE day accordion [the `md:hidden` surface that CANNOT exist at desktop and was NEVER captured in ANY mode by ANY prior evidence frame: the sf-chip-dark "Today" chip — the family's first rotation-frame subject — + the today accordion header's sf-today-tint + the today date chip's sf-selected-tint; openDay defaults to today's column — the today section renders OPEN deterministically every day; the seeded Physics class in the open Tuesday section]; Frame 2 the DASHBOARD MOBILE [the stacked mobile dashboard — the mobile DARK surface never captured anywhere: the conditional sf-overdue-banner from the seeded incomplete overdue task "Return library books" — the S9-A-pinned surface, the family's first MOBILE evidence frame — + the four stat cards + today's tasks under the fixed glass mobile app bar]; both md5-DISTINCT GATE-enforced: **1a6faa7d3b7e3f610f1e9b8785744f15 / 3421e021f38f1d763dbfbd7ce2718475**, first-pass, exit 0; both frames pixel-probe verified genuinely dark mean brightness 23.9 / 34.0 at 390×844 — the PIL decode]; the S4 violet/light restore awaited on every path [verified directly through SQLite post-run]).
- **BF3 — the honest-zero-cycle acknowledgment.** No guard gap found; unit census 936 UNCHANGED and e2e 474 UNCHANGED — the projections exact BY CONSTRUCTION (BF1 documentation-only; BF2 scripts-only; src/ and tests/ untouched).
- **BF4 — the reserved re-cert rider EXERCISED.** The final cold re-cert's chunk 4 carried ONE failure (calculator.spec.ts's S15 physical-keyboard pin, 473/474). Root-caused with the debug probe: the hydrated() gate keys on the html var which the PRE-PAINT BOOT SCRIPT stamps at first paint — BEFORE the auth gate resolves and the Calculator view mounts its keydown useEffect; keystrokes in that window are lost (verified live: the probe's keystroke at the gate instant reads back the lost "00" display). The fix (the BC4 pattern): the S15 describe now gates on s15Ready — hydrated() PLUS the display rendering its initial zero (the view-mounted observable). tests/e2e/calculator.spec.ts touched IN-PLACE, the census UNCHANGED (87 in chunk 4, 474 total). Post-fix: the spec alone cold 12/12, the full chunk 4 cold **87/87 first-pass**. The debug probe stays session-local (removed pre-commit — the register's forward arithmetic stays 225/106 + the two named riders).

**Re-certification (all on the FINAL tree):** lint ✓ tsc ✓ unit **936/936** (28 files; the census projection exact; re-run after the BF4 fix); the canonical build green (the standalone asset contract intact); the full cold 5-chunk e2e re-cert — chunks 1/2/3/5 first-pass (131+141+57+58) + chunk 4's single calculator-S15 failure root-caused to the order-dependent readiness-gate window (the BF4 record above), fixed IN-PLACE (the s15Ready view-mounted gate), and the chunk re-certified cold **87/87 first-pass** — the honest fix, not a flake wave-off (the BC4 precedent shape); the standing suite — see the session record for the final verdict (the theme-restore closing guard green [demo light/violet intact, verified directly through SQLite]); the s105 resweep **ok:true** with the exit-code gate live (the invariants green both hosts, the brand tables byte-matched, probeCleanup ok, 18 captures, exit 0); agent-browser mobile-nav verified on BOTH hosts (reference: `sidebarOpen` read-then-restored, 24 labeled visible links / auto-close / the drawer's own X at (228,26) / 20 icon-only collapsed ZERO title-aria [the desktop rail] / scrollWidth 416 on /Notes — the reference's own overflow defect; clone: `sf-sidebar-collapsed` read-and-removed [null default], 26 labeled [the superset skip-link] / auto-close [the dialog UNMOUNTS] / Escape / 20 icon-only collapsed ALL title+aria / scrollWidth 390 / the hamburger aria-labeled "Open navigation menu" — **no Tailwind v4 mobile-nav bug, s105 re-confirmed**); the s105 evidence captures (2 md5-distinct GATE-enforced frames, exit 0, first-pass, both pixel-probe dark at 390×844); `.env.example` verified current (the env surface enumerated live: NODE_ENV / DATABASE_URL / AUTH_SECRET / NEXT_PUBLIC_SITE_URL, all covered).

**Docs chain**: README (badge 1410, counts 936/474, the Session-105 row with pipe parity verified), AGENTS (the 936 count + the S105 lessons — the evidence-program blind-axis doctrine, the mobile-only-surface ranking rule, the boolean-string persistence-key trap), CLAUDE (the 936 count + the S105 seam tail re-anchor), the vitest.config.ts header (28 files / 936, the S105 re-anchor note), the remediation-plan header (BE → BF) + the Cycle-55 plan + this execution record, the PAD v1.3.13 revision block, this worklog, `docs/session_79.md`.

**Stage summary.** Batch BF DONE: the register rotated forward (the BE1 record now carries the post-BE-tree counts and the rotation mechanism — the next audit's re-derivation has the scoped expectation), the MOBILE evidence-frame rotation onto two never-covered surfaces through the seed itself at the axis the program never varied (the Timetable mobile day-accordion dark — a surface that cannot exist at desktop, carrying the sf-chip-dark family's first rotation frame + the Dashboard mobile dark — the overdue banner's first mobile frame), the BF4 reserved rider exercised honestly (the calculator S15 readiness gate strengthened to the view-mounted observable — the census unchanged), and the honest-zero-cycle acknowledged for the planned riders. Baselines unchanged: unit **936/936**, e2e **474/474**, the standing suite **35/35**. Standing debt after BF: **ZERO**. The natural next cycle (Session-106) remains the standing rhythm: audit the BF diff, ride the riders, re-certify cold (anchor it on `docs/session_79.md`).

## Session-106 — Batch BG (Cycle 56): the audit-rider cycle at the plateau — the register rotation + the s106 MOBILE evidence-frame rotation, the second mobile cycle exhausting the mobile-only md:hidden class

**Received state**: `3f996ee` (Batch BF `7a3cd35` + the operator's session-log commit adding `docs/session_80.md` [the S105 raw transcript — audited clean: one file, 114 insertions, no source changes, no key material]). The 30th workspace continuation — `git pull` fast-forward `7a3cd35..3f996ee`; the workspace re-verified rather than re-cloned (node_modules intact at 502 installs/596 packages, chromium-1243 present matching the locked playwright-core 1.63.0, `db/custom.db` seeded [demo violet/light — the S4 closing state verified directly through Prisma], the canonical build re-run fresh after `rm -rf .next`).

**Baseline re-certified cold BEFORE any work**: lint ✓ tsc ✓ unit **936/936** (28 files); the full cold 5-chunk e2e cert **474/474** (131+141+57+87+58 — every chunk first-pass, zero flakes).

**Evidence layers (all pre-change):** the Mode-C audit of the Batch BF diff (`aaeb432..7a3cd35` + the operator's `3f996ee`) — **0C/0H/0M/0L/1I**, all six BF claims verified TRUE (the BF1 register note read in full [225/106/0-stale/119 + the growth mechanism + the register-rotates-forward doctrine + the exact-count pin staying rejected]; the BF2a resweep's 7-location re-tag diff vs s104 EXACT — the normalization diff EMPTY under the full token set; the BF2b capture's full gate shape [the md5-DISTINCT booleans, the AV2/AX3 exit-code semantics, the S4 restore awaited in the finally]; the 20 committed 105-*.png frames md5-distinct [0 duplicate hashes]; the two rotation frames' committed md5s matching the record verbatim [1a6faa7d3b7e3f610f1e9b8785744f15 / 3421e021f38f1d763dbfbd7ce2718475]; the BF4 calculator S15 gate read in full [the s15Ready view-mounted observable — the three S15 specs swapped, the census unchanged]; the operator commit clean; src/ untouched by BF; the docs chain aligned [README badge 1410 + the Session-105 row, AGENTS/CLAUDE 936, the vitest header S105/BF, PAD v1.3.13]; no key material [zero added key-block lines in both diffs]). **The I1 finding that sized the cycle**: the BF1 note's counts (225/106) describe the pre-BF-rider tree — the post-BF final-tree re-derivation (the pin's own regex, instrument-identical, the expectation stated BEFORE the measurement: "the register's 225/106 + the two named s105 riders") is **227 playwright importers / 108 Usage-line carriers / 0 stale / 119 usage-line-free** — the doctrine's own predicted drift, arrived on schedule (fifth consecutive cycle).

**Implemented (the Cycle-56 plan written into the remediation plan BEFORE any source change):**
- **BG1 — the S106 register note (the audit's I1).** The dated note appended to the BF1 execution record: the post-BF final-tree counts (227 importers / 108 carriers / 0 stale / 119 usage-line-free), the growth mechanism, the register-rotates-forward doctrine, the arithmetic verified live (fifth consecutive cycle).
- **BG2 — the s106 riders.** `scripts/ref-resweep-s106.mjs` (the 7-location re-tag sweep from s105 — the normalization diff EMPTY under the full token set BEFORE the live run; live: **ok:true, exit 0** — probeCleanup ok, 18 captures) and `scripts/capture-s106-evidence.mjs` (the MOBILE evidence-frame rotation, the SECOND mobile cycle, EXHAUSTING the views' mobile-only md:hidden class [three surfaces total — s106 takes the last two]: Frame 1 the FLASHCARDS MOBILE dark at 390×844 [the in-row Study affordance — the neutral-950 family's first rotation-frame subject, AF1-pinned; the seeded 0-card deck renders NO affordance — the boundary-row discriminator] + Frame 2 the NOTES MOBILE dark at 390×844 [the create FAB — the gradient family's first MOBILE evidence frame, the S79/AF6 surface]; both md5-DISTINCT GATE-enforced: **4dfde092fa6e8e51adebaf6fb4bb237a / 02637cbbb248871fbc50c5a73010e190**, first-pass, exit 0, pixel-probe verified genuinely dark [52.1 / 54.1]; the S4 violet/light restore awaited on every path [verified directly through Prisma post-run]).
- **BG3 — the honest-zero-cycle acknowledgment.** Census projections 936/474 unchanged EXACT BY CONSTRUCTION — documentation + scripts only, src/ and tests/ untouched.
- **BG4 — the reserved re-cert rider — EXERCISED.** The standing suite's first run read **34/35 — failed: cwv-volume-stress** (Tasks longTaskTotal 2556ms > the 2400 pin, byte-identical tree). Root-caused with probes: the cold re-run 2299 GREEN / the second re-run 2759 RED / the dev-server-stopped re-run 2144 GREEN (inside the documented band) — the DEV-SERVER CO-RESIDENCY on :3000 during the :3200-targeted stage inflates the throttled measurement 150–600ms. First remedy (2670 pin re-anchor, TDD) tried AND REVERTED (the band extends past it). Shipped fix: the MEASUREMENT CONTEXT — the runner stops :3000 for the stage (AP-70 exact-port-PID) and restarts after (S32 recipe, health-gated); the pin stays 2400; census UNCHANGED (936/474, notes only); mechanism validated live; the guarded full-suite re-run launched — the verdict recorded below.

**Re-certification (all on the FINAL tree):** lint ✓ tsc ✓ unit **936/936** (28 files — the census projection exact; re-run after the riders landed); the canonical build green; the cold 5-chunk e2e re-cert **474/474** (every chunk first-pass); the s106 resweep **ok:true, exit 0**; agent-browser mobile-nav on BOTH hosts (reference: 24 labeled / auto-close / the X at (228,26) / the 80px rail with ZERO title-aria / scrollWidth 416 on /Notes — its own overflow defect; clone: 26 labeled [the superset skip-link] / auto-close [the dialog UNMOUNTS] / Escape / the 80px rail with ALL title+aria / scrollWidth 390 / the hamburger aria-labeled — **no Tailwind v4 mobile-nav bug, s106 re-confirmed**); the register arithmetic verified on the final tree after the probe cleanup (**229/110 = 227/108 + the two s106 riders**); `.env.example` verified current. **The guarded standing-suite re-run — the BG4 verdict: 35/35 GREEN** (the first run's 34/35 failure closed by the measurement-context fix itself: the cwv-volume-stress stage read Tasks longTaskTotal **2195ms** under the guard [dev server stopped for the stage, restarted healthy after] — squarely inside the documented 1821–2288ms band and GREEN at the unchanged 2400 pin; the theme-restore closing guard green [demo light/violet intact, verified directly through Prisma]).

**Docs chain**: README (badge 1410, the Session-106 row with pipe parity verified), AGENTS (the 936 count + the S106 lessons — the enumerable-class exhaustion doctrine, the boundary-row discriminator rule, the measure-LAST register-arithmetic discipline), CLAUDE (the 936 count + the S106 seam tail re-anchor), the vitest header (28 files / 936, the S106 re-anchor note), the remediation-plan header (BF → BG) + the Cycle-56 plan + record, the PAD v1.3.14, the worklog, this transcript. Conventional commit, wrapper push to main, key shredded, servers down.

**Stage summary.** Batch BG DONE: the register rotated forward (the BF1 record now carries the post-BF-tree counts and the rotation mechanism — the next audit's re-derivation has the scoped expectation 229/110), the MOBILE evidence-frame rotation onto the LAST TWO mobile-only md:hidden surfaces (the class EXHAUSTED — every md:hidden view surface now carries an evidence frame), the BG4 reserved rider exercised honestly (the co-residency measurement-context fix — the pin stays 2400, the runner pins the context), and the honest-zero-cycle acknowledged for the planned riders. Baselines unchanged: unit **936/936**, e2e **474/474**, the standing suite **35/35**. Standing debt after BG: **ZERO**. The natural next cycle (Session-107) remains the standing rhythm: audit the BG diff, ride the riders, re-certify cold (anchor it on `docs/session_81.md`).

## Session-107 — Batch BH (Cycle 57): the audit-rider cycle at the plateau — the register rotation + the s107 LANDSCAPE evidence-frame rotation (the viewport axis's last never-varied band)

**Received state**: `78426f4` (Batch BG `51b0f0f` + the operator's session-log commit adding `docs/session_82.md` [the S106 raw transcript — audited clean: one file, 172 insertions, no source changes, no key material]). The 31st workspace continuation — exercised as the full RESET CONTINGENCY twice in-session (the workspace wiped mid-suite with all uncommitted BH riders; both times the ENTIRE cycle honestly re-executed on a fresh clone: runtime restored from zero, baseline re-certified cold BEFORE any work, every rider re-run live, every md5 re-measured, every doc claim re-derived — no claim carried over unverified).

**Baseline re-certified cold BEFORE any work**: lint ✓ tsc ✓ unit **936/936** (28 files); the full cold 5-chunk e2e cert **474/474** (131+141+57+87+58 — every chunk first-pass, zero flakes); the canonical build green.

**Evidence layers (all pre-change):** the Mode-C audit of the Batch BG diff (`51b0f0f..78426f4` + the operator's `78426f4`) — **0C/0H/0M/0L/1I**, all BG claims verified TRUE (the BG1 register note read in full; the BG2a resweep's 7-location re-tag diff vs s105 EXACT — the normalization diff EMPTY under the full token set; the BG2b committed rotation-frame md5s matching the record verbatim; the 20 committed 106-*.png frames md5-distinct; the BG4 measurement-context fix read in full [the pin stays 2400, the runner stops :3000 for the cwv stage]; the operator commit clean; src/ untouched by BG; the docs chain aligned [README badge 1410 + the Session-106 row, AGENTS/CLAUDE 936, the vitest header S106/BG, PAD v1.3.14]; no key material). **The I1 finding that sized the cycle**: the BG1 note's counts (227/108) describe the pre-BG-rider tree — the post-BG final-tree re-derivation (the pin's own regex, instrument-identical, the expectation stated BEFORE the measurement) is **229 playwright importers / 110 Usage-line carriers / 0 stale / 119 usage-line-free** — the doctrine's own predicted drift, arrived on schedule (sixth consecutive cycle).

**The rotation survey (BEFORE any rotation)**: the rotation program's 14 committed frames cover exactly two viewport cells (1280×800 desktop ×10 dark; 390×844 mobile-portrait ×4 dark) — **844×390 LANDSCAPE has NEVER been varied** (the S105 lesson-1 at BAND granularity), and Tasks carried ZERO rotation frames across the entire lineage. s107 rotates onto LANDSCAPE (the S105 precedent opened mobile; s107 opens landscape).

**Implemented (the Cycle-57 plan written into the remediation plan BEFORE any source change):**
- **BH1 — the S107 register note (the audit's I1).** The dated note appended to the BG1 execution record: the post-BG final-tree counts (229/110/0-stale/119), the growth mechanism (the two s106 riders), the register-rotates-forward doctrine restated, the scoped expectation for the next audit ("this register's 229/110 + this cycle's named riders"). Arithmetic verified live (sixth consecutive cycle).
- **BH2 — the s107 riders.** `scripts/ref-resweep-s107.mjs` (the 7-location re-tag sweep from s106 — the normalization diff EMPTY under the full token set [s107/S107/s106/S106/s105/S105 + 107-/106-/105-] BEFORE the live run; live: **ok:true, exit 0** — probeCleanup ok, 18 captures, zero stranded probe rows verified through SQLite) and `scripts/capture-s107-evidence.mjs` (the LANDSCAPE rotation — one live gate iteration, root-caused with a diagnostic probe: the SHARED-SELECTOR trap [the desktop rail's nav and the drawer's nav BOTH carry aria-label="Primary", the desktop renders FIRST in DOM order, hidden at 844 → the unscoped selector read the hidden element's 0/0 geometry — fixed by DIALOG-SCOPING the query], and the Tasks h1 corrected to the ACTIVE-LIST label "All Tasks"; re-run GREEN first-pass: Frame 1 the DRAWER NAV-SCROLL at 844×390 DARK [scrollHeight 992 > clientHeight 301 — the landscape-only discriminator; the w-72 panel, the 89px S3-L brand header, 20 NavItemLinks, the X + backdrop close contract; md5 3938d39ba803f1b1d5e5e17d3580e58f, mean brightness 19.5] + Frame 2 the TASKS view at 844×390 DARK [the view's FIRST rotation frame; the two-pane landscape layout — the md:flex aside renders AT 844; the pill family asserted BOTH sides of the seed boundary: the overdue "Return library books" row carries .sf-pill-red, the boundary row "Weekly vocabulary review" renders the violet RepeatPill + the slate SubjectChip and NO red pill in-row — the class-overlap trap honored; md5 16f1c6115a677911d55ffa62d75b5765, mean brightness 36.8]; both md5-DISTINCT GATE-enforced, exit 0; the S4 violet/light restore awaited on every path [verified through SQLite post-run]).
- **BH3 — the honest-zero-cycle acknowledgment.** Census projections 936/474 unchanged EXACT BY CONSTRUCTION — documentation + scripts only, src/ and tests/ untouched. No manufactured headline — the verified plateau IS the deliverable.
- **BH4 — the reserved re-cert rider.**

**Mobile-nav (agent-browser, BOTH hosts)**: reference `sidebarOpen` read-then-restored ["true" = expanded]: 24 labeled visible links with the drawer open [20 nav + 4 page-behind] / drawer navigates to /Notes and auto-closes / the drawer's own X at (228,26) closes / 20 icon-only collapsed ZERO title-aria [the desktop rail] / scrollWidth 416 on /Notes — the reference's own overflow defect; clone `sf-sidebar-collapsed` read-and-removed [null default]: 26 labeled [the superset skip-link] / the dialog MOUNTS [role="dialog"] / drawer navigates to /Notes and auto-closes [the dialog UNMOUNTS] / a REAL Escape keypress closes / 20 icon-only collapsed ALL title+aria / scrollWidth 390 / the hamburger aria-labeled "Open navigation menu" — **no Tailwind v4 mobile-nav bug, s107 re-confirmed**.

**Re-certification (all on the FINAL tree):** lint ✓ tsc ✓ unit **936/936** (28 files — the census projection exact); the canonical build green; the cold 5-chunk e2e re-cert **474/474** (131+141+57+87+58, every chunk first-pass); the s107 resweep ok:true (probeCleanup ok, 18 captures); the standing suite **35/35 GREEN** (SUITE-EXIT:0, zero findings in every stage — the cwv-volume-stress stage 0 budget breaches with the INP proxy 1167ms and the BG4 co-residency guard fired live [the runner stopped :3000 for the stage]; the theme-restore closing guard green, demo light/violet, the seed counts exact post-suite); the register arithmetic on the final tree AFTER the session-local probe cleanup: **231 importers / 112 carriers = 229/110 + the two s107 riders** (the scoped expectation for the next audit; measured LAST through an instrument that is itself not a rider).

**Docs chain**: README (badge 1410, the Session-107 row with pipe parity), AGENTS (the 936 count + the S107 lessons ×4 — the band-granularity rotation doctrine, the shared-selector trap, the active-list h1, the reset-as-re-execution doctrine), CLAUDE (the Unit-line seam tail re-anchored S107/BH), vitest.config.ts (the header re-anchored S107/BH — 28 files / 936), PAD v1.3.15 (the Cycle-57 revision block), docs/remediation-plan.md (the Cycle-57 plan + the execution record), docs/session_83.md (the session record).

**Stage summary.** Batch BH DONE: the register rotated forward (the BG1 record now carries the post-BG-tree counts and the rotation mechanism — the scoped expectation for the next audit is 231/112 + its named riders); the s107 LANDSCAPE rotation closed the viewport axis's last never-varied band with two novel md5-distinct dark frames (the drawer nav-scroll geometry contract + the Tasks view's first rotation frame with the pill-family boundary); the census unchanged EXACT (936/474); mobile-nav re-confirmed clean on both hosts; the reset contingency exercised twice and the cycle still closed at ZERO standing debt. Baselines: unit 936/936, e2e 474/474, the standing suite 35/35 GREEN.

## Session-108 — Batch BI (Cycle 58): the audit-rider cycle at the plateau — the register rotation + the s108 MID-BAND evidence-frame rotation (the viewport-band matrix's last never-varied cell)

**Received state**: `4e6772c` (Batch BH `bfb06f5` + the operator's TWO session-log commits adding `docs/session_84.md` [the S107 continuation transcript — audited clean: one file, 248+85 insertions across two commits, no source changes, no key material]). The 32nd workspace continuation — exercised as the full RESET CONTINGENCY once more (the workspace wiped after the S107 close; re-cloned from the remote at `4e6772c`, the runtime restored from zero: bun install 497 packages, chromium-1243 for the locked playwright-core 1.63.0, `.env` with `DATABASE_URL="file:../db/custom.db"`, db seeded, demo light/violet verified directly through SQLite).

**Baseline re-certified cold BEFORE any work**: lint ✓ tsc ✓ unit **936/936** (28 files); the canonical build green; the full cold 5-chunk e2e cert **474/474** (131+141+57+87+58 — every chunk first-pass, zero flakes).

**Evidence layers (all pre-change):** the Mode-C audit of the Batch BH diff (`78426f4..bfb06f5` + the operator's `41bab1d`/`4e6772c`) — **0C/0H/0M/1L/1I**, all BH claims verified TRUE (the BH1 register note read in full; the BH2a resweep's 7-location re-tag diff vs s106 EXACT — the normalization diff EMPTY under the full token set; the BH2b capture's committed rotation-frame md5s matching the record verbatim [3938d39ba803f1b1d5e5e17d3580e58f / 16f1c6115a677911d55ffa62d75b5765]; the 20 committed 107-*.png frames md5-distinct; the operator commits clean [docs/session_84.md only, 333 insertions total]; src/ and tests/ untouched by BH [the two deletions the CLAUDE seam-tail and PAD version-line re-anchors]; the docs chain aligned [README badge 1410 + the Session-107 row, AGENTS/CLAUDE 936, the vitest header S107/BH, PAD v1.3.15]; no key material). **The L1 finding**: the remediation plan's own header still read "COMPLETE through Batch BG (session-106)" — the BH cycle appended the Cycle-57 plan + record without re-anchoring the header; fixed in this cycle's doc chain (the S108 lesson-4: the header IS a rotation anchor). **The I1 finding that sized the cycle**: the BH1 note's counts (229/110) describe the pre-s107-rider tree — the post-BH final-tree re-derivation (the pin's own regex, instrument-identical, the expectation stated BEFORE the measurement) is **231 playwright importers / 112 Usage-line carriers / 0 stale / 119 usage-line-free** — the doctrine's own predicted drift, arrived on schedule (seventh consecutive cycle).

**The rotation survey (BEFORE any rotation)**: the rotation program's 16 committed frames cover exactly three viewport cells (1280×800 desktop ×10 dark; 390×844 mobile-portrait ×4 dark; 844×390 mobile-landscape ×2 dark) — **768×1024 MID-BAND has NEVER been varied** (the S107 lesson-1's own band-matrix enumeration — the LAST never-touched cell; the S34 midband sweep pins the LIGHT-mode drawer, so the DARK rotation adds the theme-side novelty). The view-level gaps across the 16-frame lineage: Events (main view), StudyGroups, PracticeTests, Settings, Analytics, Files — zero rotation frames. s108 rotates onto the MID-BAND with PracticeTests (the 2-column grid = the mid-band-ONLY structural shape) + StudyGroups (the two-pane full-negotiation + the S8-Z state boundary).

**Implemented (the Cycle-58 plan written into the remediation plan BEFORE any source change)**:
- **BI1 — the S108 register note (the audit's I1).** The dated note appended to the BH1 execution record: the post-BH final-tree counts (231/112/0-stale/119), the growth mechanism (the two s107 riders), the register-rotates-forward doctrine restated, the scoped expectation for the next audit ("this register's 231/112 + this cycle's named riders"). Arithmetic verified live (seventh consecutive cycle).
- **BI2 — the s108 riders.** `scripts/ref-resweep-s108.mjs` (the 7-location re-tag sweep from s107 — the normalization diff EMPTY under the full token set BEFORE the live run; live: **ok:true, exit 0** — probeCleanup ok, 18 captures, zero stranded probe rows verified through SQLite) and `scripts/capture-s108-evidence.mjs` (the MID-BAND rotation — one live gate iteration, root-caused with the diagnostic probe: the S8-Z TWO-VARIANT empty-state boundary [the StudyGroups detail pane renders the 80px-gradient Users EmptyState ONLY at zero groups; the seeded ONE-group null-selection state renders the PLAIN "Select a group" variant — the gate initially asserted the wrong side, the probe isolated `gradientBlock: false`, fixed to the rendered subset with the boundary as the discriminator]; re-run GREEN first-pass: Frame 1 the PRACTICETESTS view at 768×1024 DARK [the view's first rotation frame; the 2-COLUMN grid = the MID-BAND-ONLY structural discriminator — the computed gridTemplateColumns "360px 360px", EXACTLY 2 tracks, never 1 (mobile) never 3 (desktop); both seeded cards side-by-side in one row; md5 26ba5f6b5562c6b708822fffcd3359f5, mean brightness 48.5] + Frame 2 the STUDYGROUPS view at 768×1024 DARK [the view's first rotation frame; the two-pane flex negotiation at full 320px w-80 — the S78/AE13 floor; the seeded "Calc Crew" ("2 members" + Mathematics chip) + the null-selection PLAIN empty state with the icon variant ABSENT; md5 cfc5a079b3b804905729dcd74f33b2ce, mean brightness 47.9]; both md5-DISTINCT GATE-enforced, exit 0; the S4 violet/light restore awaited on every path [verified through SQLite post-run]).
- **BI3 — the honest-zero-cycle acknowledgment.** Census projections 936/474 unchanged EXACT BY CONSTRUCTION — documentation + scripts only, src/ and tests/ untouched. No manufactured headline — the verified plateau IS the deliverable.
- **BI4 — DONE (the reserved rider — NOT exercised: the clean cycle).** The final re-cert found no defect: lint ✓ tsc ✓ unit **936/936** first-pass, the cold 5-chunk e2e re-cert **474/474** every chunk first-pass, the standing suite **35/35 GREEN** — the verdict in the re-certification paragraph above. No guard gap, no manufactured rider (the honest-zero posture the BG3/BH3/BI3 doctrine established).

**Mobile-nav (agent-browser, BOTH hosts)**: reference `sidebarOpen` read-then-restored ["true" = expanded]: 24 labeled visible links with the drawer open [20 nav + 4 page-behind] / drawer navigates to /Notes and auto-closes / the drawer's own X at (228,26) closes / 20 icon-only collapsed ZERO title-aria [the desktop rail] / scrollWidth 416 on /Notes — the reference's own overflow defect; clone `sf-sidebar-collapsed` read-and-removed [null default]: 26 labeled [the superset skip-link] / the dialog MOUNTS [role="dialog", aria-label="Navigation menu"] / drawer navigates to /Notes and auto-closes [the dialog UNMOUNTS] / a REAL Escape keypress closes / 20 icon-only collapsed ALL title+aria [the desktop rail at 80px] / scrollWidth 390 / the hamburger aria-labeled "Open navigation menu" — **no Tailwind v4 mobile-nav bug, s108 re-confirmed**.

**Re-certification (all on the FINAL tree):** lint ✓ tsc ✓ unit **936/936** (28 files — the census projection exact); the canonical build green; the cold 5-chunk e2e re-cert **474/474** (131+141+57+87+58, every chunk first-pass); the s108 resweep ok:true (probeCleanup ok, 18 captures); the standing suite **35/35 GREEN** (33 stages + the verdict — zero findings in every stage; the cwv-volume-stress 0 budget breaches, INP proxy 1109ms, the Tasks longTaskTotal 2061ms inside the documented band at the unchanged 2400 pin; the BG4 co-residency guard fired live; the theme-restore closing guard green [demo light/violet, the seed counts exact]); the register arithmetic on the final tree AFTER the session-local probe cleanup (**233 playwright importers / 114 Usage-line carriers = 231/112 + the two s108 riders** — the scoped expectation for the next audit, the S106 lesson-3: measure the arithmetic LAST, through an instrument that is itself not a rider); `.env.example` verified current.

**Docs chain**: README (badge 1410, the Session-108 row with pipe parity), AGENTS (the 936 count + the S108 lessons ×4 — the S8-Z state-boundary doctrine, the computed-track-count discriminator, the full-negotiation width pin, the header-is-a-rotation-anchor lesson), CLAUDE (the Unit-line seam tail re-anchored S108/BI), vitest.config.ts (the header re-anchored S108/BI — 28 files / 936), PAD v1.3.16 (the Cycle-58 revision block), docs/remediation-plan.md (the Cycle-58 plan + the execution record + the header re-anchor BG → BH → BI), docs/session_85.md (the session record).

## Session-109 — Batch BJ (Cycle 59): the audit-rider cycle at the plateau — the register rotation + the s109 LIGHT evidence-frame rotation (the theme axis's never-varied side)

**Received state**: `2507b30` (Batch BI `422151f` + the operator's session-log commit adding `docs/session_86.md` [the S108 raw transcript — audited clean: one file, 151 insertions, no source changes, no key material]). The 33rd workspace continuation — exercised as the full RESET CONTINGENCY once more (the workspace wiped after the S108 close; re-cloned from the remote at `2507b30`, the runtime restored from zero: bun install 497 packages, chromium-1243 for the locked playwright-core 1.63.0, `.env` with `DATABASE_URL="file:../db/custom.db"`, db pushed + seeded, demo light/violet verified directly through Prisma).

**Baseline re-certified cold BEFORE any work**: lint ✓ tsc ✓ unit **936/936** (28 files); the canonical build green; the full cold 5-chunk e2e cert **474/474** (131+141+57+87+58 — every chunk first-pass, zero flakes).

**Evidence layers (all pre-change):** the Mode-C audit of the Batch BI diff (`bfb06f5..422151f` + the operator's `2507b30`) — **0C/0H/0M/0L/1I**, all BI claims verified TRUE (the BI1 register note read in full; the BI2a resweep's 7-location re-tag diff vs s107 EXACT — the normalization diff EMPTY under the full token set, re-verified live by re-running the normalization; the BI2b capture's committed rotation-frame md5s matching the record verbatim [26ba5f6b5562c6b708822fffcd3359f5 / cfc5a079b3b804905729dcd74f33b2ce — re-hashed from the committed blobs]; the 20 committed 108-*.png frames md5-distinct; the operator commit clean [docs/session_86.md only, 151 insertions]; src/ and tests/ untouched by BI; the docs chain aligned [README badge 1410 + the Session-108 row, AGENTS/CLAUDE 936 + the S108 lessons ×4 + the Unit-line seam tail S108/BI, the vitest header S108/BI, PAD v1.3.16, the remediation-plan header properly re-anchored to Batch BI — the S108 lesson-4 held: NO L-class finding this cycle]; no key material [zero key-block insertions in both diffs]). **The I1 finding that sized the cycle**: the BI1 note's counts (231/112) describe the pre-s108-rider tree — the post-BI final-tree re-derivation (the pin's own regex, instrument-identical, the expectation stated BEFORE the measurement) is **233 playwright importers / 114 Usage-line carriers / 0 stale / 119 usage-line-free** — the doctrine's own predicted drift, arrived on schedule (eighth consecutive cycle).

**The rotation survey (BEFORE any rotation)**: the rotation program's 18 committed frames cover exactly four viewport cells (1280×800 desktop ×10 dark, s100–s104; 390×844 mobile-portrait ×4 dark, s105–s106; 844×390 mobile-landscape ×2 dark, s107; 768×1024 mid-band ×2 dark, s108) — the viewport-band matrix COMPLETE, and **the THEME axis has NEVER been varied: 18/18 committed rotation frames are DARK, LIGHT = 0**. The view-level gaps across the entire 18-frame lineage: Events (the MAIN view; only its error state at s100), Settings, Analytics, Files — zero rotation frames. s109 opens the theme axis at the program's home band (1280×800 desktop — its 10 frames all dark, desktop×light never varied) with Events (the WITHIN-VIEW THEME BOUNDARY — the slate-900 terminal panel intentionally dark in BOTH themes, the light frame's own discriminator: the panel computes rgb(15, 23, 42) while the page h1 computes the light-side slate-800 rgb(30, 41, 59), a pair ONLY light mode produces) + Analytics (the light-side WITHIN-ELEMENT theme reads — the chart axis text at the light-only #666 rgb(102, 102, 102), the StatBlock cards at the light-only bg-white rgb(255, 255, 255), the seeded values 2/12 + 0/6 + 4, the stat grid's EXACTLY 4 px tracks at the desktop band).

**Implemented (the Cycle-59 plan written into the remediation plan BEFORE any source change):**
- **BJ1 — the S109 register note (the audit's I1).** The dated note appended to the BI1 execution record: the post-BI final-tree counts (233/114/0-stale/119), the growth mechanism (the two s108 riders), the register-rotates-forward doctrine restated, the scoped expectation for the next audit ("this register's 233/114 + this cycle's named riders"). Arithmetic verified live (eighth consecutive cycle).
- **BJ2 — the s109 riders.** `scripts/ref-resweep-s109.mjs` (the 7-location re-tag sweep from s108 — the normalization diff EMPTY under the full token set [s109/S109/s108/S108/s107/S107 + 109-/108-/107-] BEFORE the live run; live: **ok:true, exit 0** — probeCleanup ok, 18 captures, zero stranded probe rows verified through Prisma; re-run on the final tree: ok:true, exit 0 again) and `scripts/capture-s109-evidence.mjs` (the LIGHT rotation — GREEN FIRST-PASS on both runs, ZERO gate iterations: Frame 1 the EVENTS view at 1280×800 in LIGHT [the view's FIRST rotation frame; the within-view theme boundary + the carousel chrome + the three seeded events; md5 874522bbc9be12a3e3e5762ea89a2ec0, mean brightness 107.6 — the theme-boundary signature] + Frame 2 the ANALYTICS view at 1280×800 in LIGHT [the view's FIRST rotation frame; the light-side element reads + the seeded stat values + the 4-track stat grid; md5 250b87636715d66ccd2200c2e22f9bdb, mean brightness 247.8]; both md5-DISTINCT GATE-enforced, exit 0; the S4 violet/light restore awaited on every path [verified through Prisma post-run]).
- **BJ3 — the honest-zero-cycle acknowledgment.** Census projections 936/474 unchanged EXACT BY CONSTRUCTION — documentation + scripts only, src/ and tests/ untouched. No manufactured headline — the verified plateau IS the deliverable.
- **BJ4 — DONE (the reserved rider — NOT exercised: the clean cycle).** The final re-cert found no defect: lint ✓ tsc ✓ unit **936/936** first-pass, the cold 5-chunk e2e re-cert **474/474** every chunk first-pass, the standing suite **35/35 GREEN** — the verdict in the re-certification paragraph. No guard gap, no manufactured rider (the honest-zero posture the BG3/BH3/BI3 doctrine established).

**Mobile-nav (agent-browser, BOTH hosts)**: reference `sidebarOpen` read-then-restored ["true" = expanded]: 24 labeled visible links with the drawer open [20 nav + 4 page-behind] / drawer navigates to /Notes and auto-closes / the drawer's own X at (228,26) closes / 20 icon-only collapsed ZERO title-aria [the desktop rail at 80px] / scrollWidth 416 on /Notes — the reference's own overflow defect / the hamburger carries no aria-label; clone `sf-sidebar-collapsed` read-and-removed [null default]: 26 labeled [the superset skip-link] / the dialog MOUNTS [role="dialog", aria-label="Navigation menu"] / drawer navigates to /Notes and auto-closes [the dialog UNMOUNTS] / a REAL Escape keypress closes / 20 icon-only collapsed ALL title+aria [the desktop rail at 80px] / scrollWidth 390 / the hamburger aria-labeled "Open navigation menu" — **no Tailwind v4 mobile-nav bug, s109 re-confirmed**.

**Re-certification (all on the FINAL tree):** lint ✓ tsc ✓ unit **936/936** (28 files — the census projection exact); the canonical build green; the cold 5-chunk e2e re-cert **474/474** (131+141+57+87+58, every chunk first-pass); the s109 resweep ok:true (probeCleanup ok, 18 captures); the standing suite **35/35 GREEN** (33 stages + the verdict — zero findings in every stage; the cwv-volume-stress stage 0 budget breaches with the INP proxy 1564ms and the BG4 co-residency guard fired live [the runner stopped :3000 for the stage]; the transient restart warning after the stage resolved by the stages that follow, the :3000 listener verified healthy post-suite; the theme-restore closing guard green, demo light/violet, the seed counts exact post-suite [Task 12 / Note 4 / Event 3, zero stranded probe rows]); the register arithmetic on the final tree AFTER the session-local probe cleanup: **235 playwright importers / 116 Usage-line carriers = 233/114 + the two s109 riders** (the scoped expectation for the next audit; measured LAST through an instrument that is itself not a rider); `.env.example` verified current.

**Docs chain**: README (badge 1410, the Session-109 row with pipe parity), AGENTS (the 936 count + the S109 lessons ×4 — the within-view theme-boundary doctrine, the brightness-signature doctrine, the axis-enumeration continuation, the live-clock md5 doctrine), CLAUDE (the Unit-line seam tail re-anchored S109/BJ), vitest.config.ts (the header re-anchored S109/BJ — 28 files / 936), PAD v1.3.17 (the Cycle-59 revision block), docs/remediation-plan.md (the Cycle-59 plan + the execution record + the header re-anchor BI → BJ), worklog.md (this entry), docs/session_87.md (the session record).
## Session-110 — Batch BK (Cycle 60): the audit-rider cycle at the plateau — the register rotation + the s110 MOBILE-PORTRAIT LIGHT evidence-frame rotation (the theme axis's never-varied mobile cell)

**Received state**: `9254575` (Batch BJ `c85f27c` + the operator's session-log commit adding `docs/session_88.md` [the S109 raw transcript — audited clean: one file, 111 insertions, no source changes, no key material]). The 34th workspace continuation — the first IN-FLIGHT continuation (the S110 lesson-4): the session arrived to an interrupted predecessor, not a wiped workspace (the riders GREEN but uncommitted, the Cycle-60 plan written into the remediation plan but the execution record missing, the standing suite reaped mid-run between tool calls). The recovery protocol run BEFORE any mutating step: `git status` (the modified plan + the 20 untracked `110-*.png` frames + the two untracked riders = the exact interruption point), the plan's BK1–BK4 rider list as the remaining-work ledger, the DB quiescence state verified live through Prisma (Task 12 / Note 4 / Event 3, demo light/violet, zero stranded probe rows — the S110 lesson-2 coordination signal), and the already-verified work HONORED, not re-verified from scratch (the baseline cold re-cert **474/474** + the final-tree re-cert **474/474** + lint ✓ tsc ✓ unit **936/936** + the canonical build green + the riders' GREEN first-pass all completed by the interrupted session — only the interrupted steps re-run: the s110 resweep on the final tree, the standing suite, the docs chain).

**Baseline re-certified cold BEFORE any work** (the interrupted session's own layer, honored per the lesson-4 protocol): lint ✓ tsc ✓ unit **936/936** (28 files); the canonical build green; the full cold 5-chunk e2e cert **474/474** (131+141+57+87+58 — every chunk first-pass, zero flakes).

**Evidence layers (all pre-change):** the Mode-C audit of the Batch BJ diff (`2507b30..c85f27c` + the operator's `9254575`) — **0C / 0H / 0M / 0L / 1I**, all BJ claims verified TRUE (the BJ diff 30 files / 1004 insertions, ZERO src/ and tests/ changes, zero key material; the committed rotation-frame md5s re-hashed from the committed blobs matching the record verbatim [874522bbc9be12a3e3e5762ea89a2ec0 / 250b87636715d66ccd2200c2e22f9bdb]; the 20 committed 109-*.png frames md5-distinct; the operator commit clean [docs/session_88.md only, 111 insertions — the S109 raw transcript]; the docs chain aligned [README badge 1410 + the Session-109 row, AGENTS/CLAUDE 936 + the S109 lessons ×4 + the Unit-line seam tail S109/BJ, the vitest header S109/BJ, PAD v1.3.17, the remediation-plan header properly re-anchored to Batch BJ — the S108 lesson-4 held: NO L-class finding]). **The I1 finding that sized the cycle**: the BJ1 note's counts (233/114) describe the pre-s109-rider tree — the post-BJ final-tree re-derivation (the pin's own regex, instrument-identical, the expectation stated BEFORE the measurement) is **235 playwright importers / 116 Usage-line carriers / 0 stale / 119 usage-line-free** — the doctrine's own predicted drift, arrived on schedule (ninth consecutive cycle). **The live parity re-verification** (agent-browser on BOTH hosts): no NEW parity gap — the reference's own /Notes overflow defect (scrollWidth 416 at mobile) NOT reproduced by the clone (390); the reference's `sidebarOpen` read-then-restored; the reference's Dark option re-confirmed a platform no-op (documented since session-10); the clone's 20 view scrollWidths all 1280/390 (zero overflow); the clone's Analytics stat/icon geometry byte-matched against the live reference (the violet/blue/green/orange icon tints measured IDENTICAL on both hosts); the VLM cross-comparison (glm-5v) re-deriving the documented deviations (the subtitle, the stat-card anatomy, the seeded-data charts — the functional SUPERSET the README documents). **The mobile-nav dual-host verification re-run** — **no Tailwind v4 mobile-nav bug, s110 re-confirmed** (the standing table below).

**The rotation survey (BEFORE any rotation)**: the rotation program's 20 committed frames: 1280×800 desktop ×10 dark + ×2 light (s109 — Events + Analytics, the theme axis OPENED at the home band), 390×844 mobile-portrait ×4 dark, 844×390 mobile-landscape ×2 dark, 768×1024 mid-band ×2 dark. **The theme axis's REMAINING never-varied cells: mobile-portrait×light, mobile-landscape×light, mid-band×light.** The view-level gaps across the entire 20-frame lineage: Settings, Files — zero rotation frames (Events + Analytics closed at s109). The s110 rotation: **the MOBILE-PORTRAIT LIGHT cell** (the theme axis × the viewport axis's most-used mobile band — the standing 31's mobile captures are LIGHT dashboard/drawer/tasks only, so the cell itself is standing-covered while remaining rotation-program-new) with the two view-level gap candidates at 390×844 in LIGHT: **Settings** + **Files** (both views' FIRST rotation frames).

**Implemented (the Cycle-60 plan written into the remediation plan BEFORE any source change):**

- **BK1 — DONE.** The dated S110 register note appended to the BJ1 execution record (visible there): the post-BJ final-tree counts **235 playwright importers / 116 Usage-line carriers / 0 stale / 119 usage-line-free** (measured BEFORE this cycle's riders exist — the instrument run on the received tree), the growth mechanism (the two s109 riders joining the guarded class after the BJ1 measurement), the register-rotates-forward doctrine restated, the scoped expectation for the next audit ("this register's 235/116 + this cycle's named riders"). The arithmetic VERIFIED live (tenth consecutive cycle of the doctrine's own predicted drift); the final-tree forward arithmetic on the BK riders themselves: **237 importers / 118 carriers = 235/116 + the two s110 riders** — the scoped expectation for the next audit, measured LAST through an instrument that is itself not a rider (the S106 lesson-3), the expectation stated BEFORE the measurement (the S102 lesson-1 doctrine — the eleventh consecutive tripwire).

- **BK2 — DONE (GREEN FIRST-PASS on both riders — the zero-iteration cycle).** `scripts/ref-resweep-s110.mjs` (the 7-location re-tag sweep from s109 — provenance, usage, probe email `s110-resweep-`, probe name "S110 Probe", the three capture path prefixes; the AW2 gate + the AX2 node-runner constraint + the AY2-honest crash scope + the S92/AS3 probeEmail ownership carried verbatim; the re-tag exactness verified by the normalization diff — EMPTY under the full token set [all generation tokens s100–s119 / S100–S119 + the capture-path dash tokens, the filename tokens included] — BEFORE the live run, re-verified live by this continuation; live: **ok:true, exit 0** — the invariants green both hosts, the brand tables byte-matched, probeCleanup ok, 18 captures; zero stranded probe rows; re-run on the FINAL tree by THIS continuation: **exit 0 again** — the gate: 0 ONLY on ok AND probeCleanup ok, 53s, the 18 captures freshly rewritten, the DB quiescence re-verified through Prisma post-run) and `scripts/capture-s110-evidence.mjs` (the MOBILE-PORTRAIT LIGHT evidence-frame rotation — the theme axis's never-varied mobile cell; GREEN FIRST-PASS with exit 0; the committed artifacts are the FINAL-tree re-run's PNGs — the BJ precedent, the cross-run md5 variance the live clock's own signature, the S109 lesson-4):
  - **Frame 1 — the SETTINGS view at 390×844 in LIGHT**: the view's FIRST rotation frame; the Appearance tab's measured chrome (the S69/S4-pinned surfaces): the ONE max-w-4xl bg-card card ("Appearance" + "Customize how StudyFlow looks"), the three h-[88px] theme buttons with the selected LIGHT button's violet border rgb(139, 92, 246) through the --sf-primary token, the 7 accent swatches (the 48px size-12, the Violet one aria-pressed=true), the emoji avatar tile grid, the Save Preferences gradient CTA — all deterministic from the seed with ZERO interaction; the mobile no-overflow contract scrollWidth <= 390; md5 `7506871ac19c0860a25b4b1da175b41d`; pixel-probe mean brightness 240.4 (genuinely light).
  - **Frame 2 — the FILES view at 390×844 in LIGHT**: the view's FIRST rotation frame; the mobile stacked layout (the md:flex aside renders at 390 as the stacked list pane per the AE6 surface), the S5-K-pinned chrome (the "All Files" breadcrumb at its <=24px measured height, the View mode bordered strip at rounded-lg 8px with the Grid view aria-pressed, the icon-only Add link), and — the S110 lesson-3 correction — the **S17-pinned zero-data EmptyState the SEED produces** (the seed creates no folders/files: the "No files yet" card + the reference-measured hint "Upload your first file to get started" + the gradient "Upload a file" CTA), the plan's "the seeded rows" paraphrase corrected by the rider's own gate (the plan is the immutable pre-change record; the execution record carries the truth); the mobile no-overflow contract scrollWidth <= 390; md5 `9a469ef03b7243fd3945b75008674baa`; pixel-probe mean brightness 248.2 (genuinely light).
  - Both frames md5-DISTINCT GATE-enforced; the 20 committed 110-*.png frames md5-distinct (0 duplicate hashes); the S4 violet/light restore awaited on every path (verified through Prisma post-run — light IS the closing state, the PATCH still explicit and awaited).

- **BK3 — DONE.** The honest-zero-cycle acknowledgment: no guard gap found in the pre-change audit (the 0L verdict — the S108 lesson-4 header-anchor discipline held through its second re-derivation); the census projections **936 UNCHANGED** and **474 UNCHANGED** — exact BY CONSTRUCTION for the planned riders (BK1 documentation-only; BK2 scripts-only; src/ and tests/ untouched). No manufactured headline — the verified plateau IS the deliverable (the S100 lesson-2 doctrine).

- **BK4 — DONE (the reserved rider — EXERCISED: the standing suite's first NOT-GREEN verdict, root-caused, fixed, re-certified).** The standing suite run #1 (the double-forked daemon, the S110 lesson-1 remedy) completed **33/35** — ai-error + ai-a11y FAIL ("stage exited 1", both envelopes empty: the stages crashed at connect), every other stage GREEN including the theme-restore closing guard (demo light/violet, the seed counts exact — zero DB damage). Root cause (the probe chain: the suite table, the empty envelopes, `ss` — :3000 listenerless while the next-server process lived, dev.log's "⨯ Another next dev server is already running", the `.next/dev/lock` naming the live pid): the S106/BG4 stop path verified the LISTENER, not the PROCESS — the next-server's SIGTERM graceful shutdown closed the listener (health false — the old code returned "stopped" right there) while the process lived on (sleeping, the turbopack pool child holding the shutdown open), so the dev lock kept naming a LIVE pid and the restarted `next dev` REFUSED to boot, leaving :3000 dead for the :3000-targeted stages. The fix (`scripts/standing-suite.mjs` — the guard's own file, scripts-only, the census projections 936/474 UNCHANGED by construction, the register untouched — the suite imports no playwright): the PROCESS-gone verification (`kill(pid, 0)` → ESRCH) after the listener polls, the SIGKILL escalation now reached whenever the process outlives its listener, and the zombie fallback (SIGKILL the pid's own parent chain so init reaps — `kill(pid, 0)` succeeds on an unreaped zombie too); the AP-70 discipline preserved (only the listener's own tree, never a blanket pkill). Verified empirically BEFORE the patch: the SIGKILLed tree collapsed (the whole dev tree gone, :3000 free), the stale lock naming the DEAD pid did NOT block the fresh boot (the new server rewrote the lock — the fix's premise proven live), the healed :3000 healthy. The re-cert: suite run #2 (the fresh single run on the final tree, the double-forked daemon) — **35/35 GREEN** with the FIXED guard live-exercised at the cwv-volume-stress stage (the stop → the process-gone verification → the restart healthy → ai-error/ai-a11y GREEN). Syntax ✓ lint ✓ the script-conventions census 3/3 after the patch.

**The workspace's between-call process reaper + the double-fork remedy (the S110 lesson-1 — this continuation's own operational find)**: the standing suite (60–120 min, per-stage budgets to 25 min) cannot fit any single foreground call (the 10-min ceiling), and the workspace REAPS background processes between tool calls — the interrupted session's suite run was itself a victim (reaped mid-run). Verified live by racing three daemonization strategies (setsid / nohup / the python double-fork): only the double-fork orphan (PPID 1) survived the call boundary; the survivors' PPID=1 signature is the diagnostic (the Oct-28 dev servers carry it). The remedy deployed: the python double-fork launcher (fork → setsid → fork → exec) with stdio to a log — BOTH suite runs (the BK4 defect discovery run #1 and the re-certification run #2) ran to completion as orphaned daemons, polled across calls through the log + the per-stage envelopes; the mutating riders held back until each run's closing guard restored the quiescence state (the S110 lesson-2 exclusion window).

**Mobile-nav (agent-browser, BOTH hosts)**: reference `sidebarOpen` read-then-restored ["true" = expanded]: 24 labeled visible links with the drawer open [20 nav + 4 page-behind] / drawer navigates to /Notes and auto-closes / the drawer's own X at (228,26) closes / 20 icon-only collapsed ZERO title-aria [the desktop rail at 80px] / scrollWidth 416 on /Notes — the reference's own overflow defect / the hamburger carries no aria-label; clone `sf-sidebar-collapsed` read-and-removed [null default]: 26 labeled [the superset skip-link] / the dialog MOUNTS [role="dialog", aria-label="Navigation menu"] / drawer navigates to /Notes and auto-closes [the dialog UNMOUNTS] / a REAL Escape keypress closes / 20 icon-only collapsed ALL title+aria [the desktop rail at 80px] / scrollWidth 390 / the hamburger aria-labeled "Open navigation menu" — **no Tailwind v4 mobile-nav bug, s110 re-confirmed**.

**Re-certification (all on the FINAL tree):** lint ✓ tsc ✓ unit **936/936** (28 files — the census projection exact; re-run after the riders AND the docs landed, thresholds absorbing the two new riders by design); the canonical build green (the standalone asset contract intact — the BK riders touch no bundled surface); the cold 5-chunk e2e re-cert **474/474** (131+141+57+87+58, every chunk first-pass); the s110 resweep on the final tree **exit 0** (the gate: 0 ONLY on ok AND probeCleanup ok — 18 captures, the DB quiescence re-verified through Prisma post-run); agent-browser mobile-nav on BOTH hosts (the standing table above — **no Tailwind v4 mobile-nav bug, s110 re-confirmed**); the standing suite **35/35 GREEN** (run #2, the fresh single run on the final tree — run #1's 33/35 was the BK4 defect discovery, root-caused + fixed + re-certified; 33 stages + the verdict — zero findings in every stage; the cwv-volume-stress stage GREEN with 0 budget breaches [7 volume-affected views × 5 field metrics at 390×844 under the Lighthouse throttle against the :3200 standalone; volume 300/200/250; MODE light; INP proxy Dashboard→Tasks 1246ms — GREEN at the unchanged 2400 pin; the FIXED S106/BG4+S110/BK4 co-residency guard fired live in the suite's own run: "dev server (pid 7468) stopped for the cwv-volume-stress stage" — the process-gone verification held, the restart returned healthy, ai-error/ai-a11y GREEN]; the theme-restore closing guard GREEN [demo light/violet verified through Prisma post-suite; the volume MARKER rows deleted by the stage's own finally — Task 12 / Note 4 / Event 3, the seed counts exact, zero stranded probe rows]); the register arithmetic on the final tree AFTER the session-local probe cleanup, measured LAST through an instrument that is itself not a rider: **237 playwright importers / 118 Usage-line carriers / 0 stale / 119 usage-line-free = 235/116 + the two s110 riders** (the scoped expectation for the next audit); `.env.example` verified current (the env surface enumerated live: NODE_ENV / DATABASE_URL / AUTH_SECRET / NEXT_PUBLIC_SITE_URL, all covered — NODE_ENV runtime-managed by the scripts, the cwv/preflight/capture script knobs runtime-local, matching the S104–S109 posture).

**Docs chain**: README (badge 1410, the Session-110 row with pipe parity), AGENTS (the 936 count + the S110 lessons ×4 — the double-fork reaper doctrine, the concurrent-rider exclusion window, the plan-vs-record truth doctrine, the in-flight continuation protocol), CLAUDE (the Unit-line seam tail re-anchored S110/BK), vitest.config.ts (the header re-anchored S110/BK — 28 files / 936), PAD v1.3.18 (the Cycle-60 revision block), docs/remediation-plan.md (the Cycle-60 plan + the execution record + the header re-anchor BJ → BK), worklog.md (this entry), docs/session_89.md (the session record).

## Session-111 — Batch BL (Cycle 61): the audit-rider cycle at the plateau — the register rotation + the s111 MOBILE-LANDSCAPE LIGHT evidence-frame rotation (the theme axis's never-varied landscape cell)

**Received state**: `c46eae5` (Batch BK `8bf85ce` + the operator's session-log commit adding `docs/session_90.md` [the S110 raw transcript incl. the continuation that closed BK — audited clean: one file, 142 insertions, no source changes, no key material]). The 35th workspace continuation — exercised as the full RESET CONTINGENCY once more (the workspace wiped after the S110 close, re-cloned from the remote at `c46eae5`, the runtime restored from zero: bun install 497 packages, chromium-1243 for the locked playwright 1.63, `.env` with `DATABASE_URL="file:../db/custom.db"`, db/ at the repo root, schema pushed + seeded, demo light/violet verified through Prisma).

**Baseline re-certified cold BEFORE any work**: lint ✓ tsc ✓ unit **936/936** (28 files); the canonical build green (the standalone asset contract intact); the full cold 5-chunk e2e cert **474/474** (131+141+57+87+58 — every chunk first-pass, zero flakes).

**Evidence layers (all pre-change):** the Mode-C audit of the Batch BK diff (`9254575..8bf85ce` + the operator's `c46eae5`) — **0C / 0H / 0M / 0L / 1I**, all BK claims verified TRUE (the BK diff 31 files / 1111 insertions, ZERO src/ and tests/ changes, zero key material; the committed rotation-frame md5s re-hashed from the committed blobs matching the record verbatim [7506871ac19c0860a25b4b1da175b41d / 9a469ef03b7243fd3945b75008674baa]; the 20 committed 110-*.png frames md5-distinct; the operator commit clean [docs/session_90.md only, 142 insertions — the S110 raw transcript]; the docs chain aligned [README badge 1410 + the Session-110 row, AGENTS/CLAUDE 936 + the S110 lessons ×4 + the Unit-line seam tail S110/BK, the vitest header S110/BK, PAD v1.3.18, the remediation-plan header properly re-anchored to Batch BK — the S108 lesson-4 held: NO L-class finding]). **The I1 finding that sized the cycle**: the BK1 note's counts (235/116) describe the pre-s110-rider tree — the post-BK final-tree re-derivation (the pin's own regex, instrument-identical, the expectation stated BEFORE the measurement) is **237 playwright importers / 118 Usage-line carriers / 0 stale / 119 usage-line-free** — the doctrine's own predicted drift, arrived on schedule (tenth consecutive cycle). **The live parity re-verification** (agent-browser on BOTH hosts): no NEW parity gap — the reference's own /Notes overflow defect (scrollWidth 416 at mobile) NOT reproduced by the clone (390); the reference's Dark AND Light Settings option clicks re-confirmed platform no-ops (`.dark` stays true, the body bg rgb(10,10,10) never moves); the reference's `sidebarOpen` read ["true"] and not modified; the clone's 20 view scrollWidths all 1280/390 (zero overflow); the clone's Analytics stat/icon tints byte-matched against the live reference (the violet/blue/green/orange tints measured IDENTICAL on both hosts); the Analytics subtitle deviation re-derived (the clone's own "Insights across your study activity" — documented since the initial build). **The mobile-nav dual-host verification re-run** — **no Tailwind v4 mobile-nav bug, s111 re-confirmed** (the standing table in the plan's execution record).

**The rotation survey (BEFORE any rotation)**: the rotation program's 22 committed frames: 1280×800 desktop ×10 dark + ×2 light (s109), 390×844 mobile-portrait ×4 dark + ×2 light (s110), 844×390 mobile-landscape ×2 dark (s107), 768×1024 mid-band ×2 dark (s108). **The theme axis's REMAINING never-varied cells: mobile-landscape×light, mid-band×light.** The view-level gaps across the entire 22-frame lineage: Calendar, AIAssistant, FocusTimer, MathSolver — zero rotation frames (Settings + Files closed at s110). The s111 rotation: **the MOBILE-LANDSCAPE LIGHT cell** (844×390 — the landscape band the program opened at s107 on dark) with the two view-level gap candidates at 844×390 in LIGHT: **Calendar** + **FocusTimer** (both views' FIRST rotation frames; the remaining MathSolver + AIAssistant gaps go to the mid-band×light cell — the natural exhaustion path).

**Implemented (the Cycle-61 plan written into the remediation plan BEFORE any source change):**

- **BL1 — DONE.** The dated S111 register note appended to the BK1 execution record (visible there): the post-BK final-tree counts **237/118/0-stale/119** (measured BEFORE this cycle's riders exist — the instrument run on the received tree), the growth mechanism (the two s110 riders joining the guarded class after the BK1 measurement), the register-rotates-forward doctrine restated, the scoped expectation for the next audit ("this register's 237/118 + this cycle's named riders"). The arithmetic VERIFIED live (eleventh consecutive cycle); the final-tree forward arithmetic on the BL riders themselves: **239 importers / 120 carriers = 237/118 + the two s111 riders** — the scoped expectation for the next audit, measured LAST through an instrument that is itself not a rider (the S106 lesson-3), the expectation stated BEFORE the measurement (the S102 lesson-1 doctrine — the twelfth consecutive tripwire).

- **BL2 — DONE (GREEN FIRST-PASS on both riders — the zero-iteration cycle).** `scripts/ref-resweep-s111.mjs` (the 7-location re-tag sweep from s110; the re-tag exactness verified by the normalization diff — EMPTY under the full token set — BEFORE the live run; live: **ok:true, exit 0** — the invariants green both hosts, the brand tables byte-matched, probeCleanup ok, 18 captures; zero stranded probe rows; the DB quiescence verified through Prisma post-run) and `scripts/capture-s111-evidence.mjs` (the MOBILE-LANDSCAPE LIGHT evidence-frame rotation; GREEN FIRST-PASS with exit 0; the committed artifacts are the FINAL-tree re-run's PNGs — the BJ/BK precedent): **Frame 1 the CALENDAR view at 844×390 in LIGHT** (the view's FIRST rotation frame; the A4/S5-G/S9-F mode switch with the Calendar tab aria-pressed in the sf-selected-tint violet-600 rgb(124, 58, 237), the 7-column weekday header, the month-label h2, the today cell data-today selected by default — the S111 lesson-2 composed-state-class correction over the plan's sf-today-cell-tint paraphrase; md5 91bfbeaf64529e0bd3771b4383116f2d, mean brightness 249.8 — genuinely light) + **Frame 2 the FOCUSTIMER view at 844×390 in LIGHT** (the view's FIRST rotation frame; the seeded stats 7/7 with the Today card at the 0-or-1 midnight boundary — the S111 lesson-3, 1 at capture time; the Pomodoro preset's border-sf-primary violet rgb(139, 92, 246); the role="timer" 25:00 rest state; md5 a860a40d6b6c9505def4e0a135084d37, mean brightness 246.5 — genuinely light); both frames md5-DISTINCT GATE-enforced; the 20 committed 111-*.png frames md5-distinct; the S4 violet/light restore awaited on every path (verified through Prisma post-run).

- **BL3 — DONE.** The honest-zero-cycle acknowledgment: no guard gap found in the pre-change audit (0L); the census projections **936 UNCHANGED** and **474 UNCHANGED** — exact BY CONSTRUCTION (BL1 documentation-only; BL2 scripts-only; src/ and tests/ untouched). No manufactured headline — the verified plateau IS the deliverable (the S100 lesson-2 doctrine).

- **BL4 — DONE (the reserved rider — NOT exercised: the clean cycle). The standing suite **35/35 GREEN first-pass** (the fresh single run on the final tree, the double-forked daemon, ~65 min) — 33 stages + the verdict + the theme-restore closing guard, zero findings in every stage; the cwv-volume-stress stage GREEN with 0 budget breaches (7 volume-affected views × 5 field metrics at 390×844 under the Lighthouse throttle against the :3200 standalone; volume 300/200/250; MODE light; INP proxy Dashboard→Tasks 1278ms — GREEN at the unchanged 2400 pin; the S106/BG4+S110/BK4 co-residency guard fired live: “dev server (pid 7835) stopped for the cwv-volume-stress stage” — the process-gone verification held, the old tree fully dead); the stage-29 restart WARNING documented honestly (root-caused, the verdict UNAFFECTED): “dev server did NOT return healthy on :3000” — a FALSIFIED prediction (the S111 lesson-4): the restart poll's 2s per-request health timeout kept timing out on the cold on-demand /api/health compile under the post-Lighthouse machine load while the server was UP (its .next/dev/lock written ONE SECOND after the cwv stage's envelope — 17:10:34 vs 17:10:33), the compile completing within the ai-error stage's own playwright navigation window — the :3000-targeted stages below GREEN (ai-error 0 findings + 10 nonGaps, ai-a11y 0 findings + 4 nonGaps), the verdict table the authority (the BK4 precedent fixed a real 33/35; a self-resolved conservative WARNING sizes no rider — the honest-zero posture, no manufactured fix); the theme-restore closing guard GREEN (demo light/violet verified through Prisma post-suite; the seed counts exact — Task 12 / Note 4 / Event 3, zero stranded probe rows).**

**The standalone rider host's AUTH_SECRET runtime-env recipe (the S111 lesson-1 — this cycle's own operational find)**: the :3200 standalone host refused to boot under the S22 production boot guard until the real 64-hex secret rode the daemon launcher's runtime environment — the standalone runtime reads the BUNDLED `.next/standalone/.env` (which must stay EMPTY for the s22 negative-spawn e2e contract, the S45 leak class — verified: the bundled copy carries `AUTH_SECRET=""` while the repo `.env` carries the real secret, the build predating the secret, the final-tree 5-chunk re-cert green with it); the runtime env var outranks the bundled copy, the guard passes, sessions sign.

**Mobile-nav (agent-browser, BOTH hosts)**: reference: 24 labeled visible links with the drawer open / drawer navigates to /Notes and auto-closes / the X at (228,26) closes / scrollWidth 416 on /Notes (the reference's own overflow defect) / the hamburger carries no aria-label / the Dark AND Light option clicks both platform no-ops; clone: 26 labeled [the superset skip-link] / the dialog MOUNTS [role="dialog", aria-label="Navigation menu"] / drawer navigates and auto-closes [the dialog UNMOUNTS] / a REAL Escape keypress closes / the 20 icon-only collapsed rail ALL title+aria / scrollWidth 390 / the hamburger aria-labeled "Open navigation menu" — **no Tailwind v4 mobile-nav bug, s111 re-confirmed**.

**Re-certification (all on the FINAL tree):** lint ✓ tsc ✓ unit **936/936** (28 files — the census projection exact; re-run after the riders AND the docs landed, thresholds absorbing the two new riders by design); the canonical build green (the standalone asset contract intact — the BL riders touch no bundled surface); the cold 5-chunk e2e re-cert **474/474** (131+141+57+87+58, every chunk first-pass); the s111 resweep **ok:true, exit 0** (18 captures, the DB quiescence verified through Prisma post-run); the standing suite ****35/35 GREEN first-pass** (the fresh single run on the final tree, the double-forked daemon — the 33 standing stages + the verdict + the theme-restore closing guard; zero findings in every stage; the cwv-volume-stress stage GREEN with 0 budget breaches [7 volume-affected views × 5 field metrics at 390×844 under the Lighthouse throttle against the :3200 standalone; volume 300/200/250; MODE light; INP proxy Dashboard→Tasks 1278ms — GREEN at the unchanged 2400 pin]; the S106/BG4+S110/BK4 co-residency guard fired live [“dev server (pid 7835) stopped for the cwv-volume-stress stage” — the process-gone verification held, the old tree fully dead, the restart healthy]; the stage-29 restart WARNING root-caused + documented honestly [the restart poll's 2s per-request health timeout vs the cold on-demand /api/health compile under the post-Lighthouse machine load — the server's lock written 1s after the stage, the stages below GREEN, the verdict unaffected, no manufactured rider]; the theme-restore closing guard GREEN [demo light/violet verified through Prisma post-suite; Task 12 / Note 4 / Event 3, zero stranded probe rows])**; the register arithmetic on the final tree AFTER the session-local probe cleanup, measured LAST through an instrument that is itself not a rider: ****239 playwright importers / 120 Usage-line carriers / 0 stale / 119 usage-line-free = 237/118 + the two s111 riders** (the scoped expectation for the next audit)**; `.env.example` verified current (the env surface enumerated live: NODE_ENV / DATABASE_URL / AUTH_SECRET / NEXT_PUBLIC_SITE_URL, all covered — matching the S104–S110 posture).

**Docs chain**: README (badge 1410, the Session-111 row with pipe parity), AGENTS (the S111 lessons ×4 — the AUTH_SECRET runtime-env recipe; the composed-state-class gate-design doctrine; the seeded-stat midnight boundary pin), CLAUDE (the Unit-line seam tail re-anchored S111/BL), vitest.config.ts (the header re-anchored S111/BL — 28 files / 936), PAD v1.3.19 (the Cycle-61 revision block), docs/remediation-plan.md (the Cycle-61 plan + the execution record + the header re-anchor BK → BL), worklog.md (this entry), docs/session_91.md (the session record).

## Session-112 — Batch BM (Cycle 62): the audit-rider cycle at the plateau — the register rotation + the s112 MID-BAND LIGHT evidence-frame rotation (the theme axis's LAST never-varied cell — the exhaustion cycle)

**Context.** Received the pushed BL state (`4e42d58` + the operator's `9ee748e` adding `docs/session_92.md` + `docs/prompt-to-review-4.md`). The 36th workspace continuation — the full RESET CONTINGENCY once more: fresh clone, runtime restored from zero (bun install 497 packages, chromium-1243, `.env` with `DATABASE_URL="file:../db/custom.db"`, db/ at the repo root, schema pushed + seeded, demo light/violet verified through Prisma — Task 12 / Note 4 / Event 3 / FocusSession 7).

**Baseline (cold, before any change).** lint ✓ tsc ✓ unit **936/936** (28 files); the canonical build green (the standalone asset contract intact) — with the cycle's own operational find: **the S45 leak class re-fired session-locally** (the workspace `.env` carried the real AUTH_SECRET BEFORE the build → the build-time copy `.next/standalone/.env` shipped with the live secret — the S111 lesson-1 trap map's first arm); the documented contract state restored immediately (the bundled copy's `AUTH_SECRET=""`, the repo `.env` keeping the real secret — the artifact-level edit; the s22 negative-spawn contract environment-immune since S89/AP2, the chunk-5 re-cert green with the restored state). The full cold 5-chunk e2e cert **474/474** (131+141+57+87+58 — every chunk first-pass, zero flakes).

**Evidence layers (all pre-change).** The Mode-C audit of the Batch BL diff (`c46eae5..4e42d58` + the operator's `9ee748e`) — **0C / 0H / 0M / 0L / 1I**, all BL claims verified TRUE (the BL diff 30 files / 974 insertions, ZERO src/ and tests/ changes, zero key material; the committed rotation-frame md5s re-hashed from the committed blobs matching the record verbatim [91bfbeaf64529e0bd3771b4383116f2d / a860a40d6b6c9505def4e0a135084d37]; the 20 committed 111-*.png frames md5-distinct; the operator commit clean [docs/session_92.md + docs/prompt-to-review-4.md only, 184 insertions]; the docs chain aligned [README badge 1410 + the Session-111 row, AGENTS/CLAUDE 936 + the S111 lessons ×4 + the Unit-line seam tail S111/BL, the vitest header S111/BL, PAD v1.3.19, the remediation-plan header properly re-anchored to Batch BL]). **The I1 finding that sized the cycle**: the BL1 note's counts (237/118) describe the pre-s111-rider tree — the post-BL final-tree re-derivation (the pin's own regex, instrument-identical, the expectation stated BEFORE the measurement) is **239 playwright importers / 120 Usage-line carriers / 0 stale / 119 usage-line-free** — the doctrine's own predicted drift, arrived on schedule (eleventh consecutive cycle). **The live parity re-verification** (agent-browser on BOTH hosts): no NEW parity gap — the reference's own /Notes overflow defect (scrollWidth 416 at mobile) NOT reproduced by the clone (390); the reference's Dark AND Light Settings option clicks re-confirmed platform no-ops; the reference's `sidebarOpen` read ["true"] and not modified; the clone's 21-view scrollWidth sweep ALL 1280/390 (zero overflow — the sweep list extended this cycle to name Analytics, the clone-only 21st nav view); the clone's Analytics stat/icon tints byte-matched against the live reference (the violet/blue/green/orange tints measured IDENTICAL on both hosts); the Analytics subtitle deviation re-derived (the clone's own "Insights across your study activity" — documented since the initial build); the clone's drawer nav enumerated label-by-label against the reference's (identical 20-item nav sets — the clone's 26 = the reference's 24 + the superset skip-link + one superset page link). **The mobile-nav dual-host verification re-run** — **no Tailwind v4 mobile-nav bug, s112 re-confirmed** (the standing table re-verified live row-by-row on BOTH hosts, the clone's X-close live-probed this cycle).

**The rotation survey (before any rotation).** The program's 24 committed frames: 1280×800 desktop ×10 dark (s100–s104) + ×2 light (s109 — Events + Analytics), 390×844 mobile-portrait ×4 dark (s105–s106) + ×2 light (s110 — Settings + Files), 844×390 mobile-landscape ×2 dark (s107) + ×2 light (s111 — Calendar + FocusTimer), 768×1024 mid-band ×2 dark (s108 — PracticeTests + StudyGroups). **The theme axis's LAST never-varied cell: mid-band×light; the LAST view-level gaps: MathSolver + AIAssistant** — the s112 rotation exhausts BOTH the theme axis AND the view-level rotation program in one cycle (the exhaustion cycle).

**Riders (TDD-by-construction — documentation + scripts only, src/ and tests/ untouched).** The Cycle-62 plan written into `docs/remediation-plan.md` BEFORE any source change. **BM1** — the dated S112 register note appended to the BL1 execution record (239/120/0-stale/119 measured BEFORE this cycle's riders existed; the final-tree forward arithmetic 241/122 = 239/120 + the two s112 riders — the thirteenth consecutive tripwire, stated BEFORE the measurement). **BM2** — `scripts/ref-resweep-s112.mjs` (the 7-location re-tag from s111, the normalization diff EMPTY under the full token set BEFORE the live run; live **ok:true, exit 0** — 9 ref + 9 clone checks green, the brand tables byte-matched, the mobile probes green both hosts, probeCleanup ok, 18 captures, zero stranded probe rows, the DB quiescence verified through Prisma post-run; re-run on the final tree ok:true, exit 0) + `scripts/capture-s112-evidence.mjs` (the MID-BAND LIGHT rotation — the first pass RED on the Frame-2 composer gate [the wrong-element-type selector: `textarea` vs the shadcn Input's `<input>` — the S111 lesson-2 composed-surface doctrine re-hit on the element axis; root-caused live with the per-condition diagnostic probe, the one-line gate fix, the second pass GREEN, exit 0]: Frame 1 the MATHSOLVER at 768×1024 light md5 `368b0dab56617b1c67802a2e4d0a13f0` (the green run `b5f04c21fbb6813ea355573d99a30b86`), mean brightness 251.2 — the Solve button disabled at rest, the "Recent Problems" seed-deterministic empty state; Frame 2 the AIASSISTANT at 768×1024 light md5 `b0832f3010e6b2990034be60a6f9bf0e` (the green run `715f07da0aa9b1ff776397ee9e3d198e`), mean brightness 250.5 — the empty-transcript intro, the six Quick-actions sf-card buttons, the Send message button disabled at rest; both md5-DISTINCT GATE-enforced, the mid-band no-overflow contract scrollWidth <= 768 on both, the S4 violet/light restore awaited on every path; the 20 committed 112-*.png frames md5-distinct). **BM3** — the honest-zero-cycle acknowledgment (the census projections 936/474 UNCHANGED exact by construction). **BM4** — the reserved rider EXERCISED twice: **run #1 34/35 (dep-audit FAIL — the mtime precondition: the standalone trace
[21:18] older than bun.lock [21:47, the content-identical `git checkout`
after the probe-tooling incident refreshed its mtime — the S112 lesson-3
lockfile casualty's downstream effect]; remedy per the precondition's own
message: the content-identical rebuild [the trace refresh 23:10 > 21:47, the
bundled-secret restore applied post-build] + the dep-audit stage re-run GREEN
[exit 0, 0 runtime-reachable, 3 documented non-production advisories]); run
#2 on the refreshed trace 34/35 (security FAIL — the AI-limiter shape
cutoffAt=16: 5 requests pre-spent by run #1's ai-error/ai-a11y stages in the
SAME 15-min in-memory limiter window on the SAME dev-server process [the
back-to-back-suite-runs collision, the S112 lesson-4]; remedy per the stage's
own documented protocol: the dev-server restart for a clean window + the
security stage re-run GREEN [findings empty, 7 nonGaps, the rate-limit ok
surface present — cutoffAt=21, 20×400 then 429s — the pre-spend differential,
NOT a limiter defect]); every other stage GREEN in run #2 incl. dep-audit
[the rebuild remedy verified in-suite], the cwv-volume-stress 0 budget
breaches [the co-residency guard fired live: "dev server (pid 22146) stopped
for the cwv-volume-stress stage" — the process-gone verification held], the
theme-restore closing guard GREEN [demo light/violet verified through Prisma
post-suite; Task 12 / Note 4 / Event 3 / FocusSession 7, zero stranded probe
rows] — the effective standing posture 35/35 green post-remediation, both
failures root-caused as independent environmental collisions closed per
their stages' own protocols**.

**The S112 lessons (AGENTS.md ×4):** the S45 leak class re-fired at the baseline build (the fresh-workspace recipe: build BEFORE writing the secret into `.env`, or verify + restore the bundled copy after the build); the element-tag gate doctrine (the a11y tree names every text control "textbox" — the gate's selector must match the element TAG, live-probed from the DOM, never from the a11y role name; when a rider fails its first pass, run the per-condition probe BEFORE touching the gate); the probe-tooling-outside-the-repo doctrine (never `bun add` a probe dependency into the engagement repo — the lockfile pollution AND its downstream suite casualty: the content-identical `git checkout` of bun.lock refreshed its mtime past the standalone trace's, failing the dep-audit stage's staleness precondition — closed by the content-identical rebuild + the stage re-run GREEN); and the back-to-back-suite-runs limiter-window collision (run #1's ai stages pre-spending run #2's security probe window — the suite must be the window's ONLY consumer, and the previous run counts as a consumer too; closed per the stage's own protocol by the dev-server restart + the clean-window re-run GREEN).

**Re-certification (all on the FINAL tree).** lint ✓ tsc ✓ unit **936/936** (28 files — the census projection exact; re-run after the riders AND the docs landed); the canonical build green (the BM4 content-identical rebuild; the bundled-secret restore applied post-build); the cold 5-chunk e2e re-cert **474/474** (131+141+57+87+58, every chunk first-pass — run on the tree after the riders landed, BEFORE the suite); the s112 resweep re-run **ok:true, exit 0**; the standing suite per the BM4 verdict above; the register arithmetic on the final tree measured LAST through an instrument that is itself not a rider: **241 playwright importers / 122 Usage-line carriers / 0 stale / 119
usage-line-free = 239/120 + the two s112 riders**; `.env.example` verified current (NODE_ENV / DATABASE_URL / AUTH_SECRET / NEXT_PUBLIC_SITE_URL, all covered).

**Docs chain**: README (badge 1410, the Session-112 row with pipe parity), AGENTS (the S112 lessons ×4 — the S45 leak re-fire recipe; the element-tag gate doctrine; the probe-tooling-outside-the-repo doctrine; the back-to-back-suite-runs limiter-window collision), CLAUDE (the Unit-line seam tail re-anchored S112/BM), vitest.config.ts (the header re-anchored S112/BM — 28 files / 936), PAD v1.3.20 (the Cycle-62 revision block), docs/remediation-plan.md (the Cycle-62 plan + the execution record + the header re-anchor BL → BM), worklog.md (this entry), docs/session_93.md (the session record).

## Session-113 — Batch BN (Cycle 63): the audit-rider cycle at the plateau — the register rotation + the s113 DESKTOP LIGHT evidence-frame rotation (the rotation program's SECOND PASS's opening cycle)

**Context.** Received the pushed BM state (`f7665d7` + the operator's `fb7cdbe` adding `docs/session_94.md` — the S112 raw transcript, audited clean: one file, 140 insertions, no source changes, no key material). The 37th workspace continuation — **the S113 work itself interrupted twice and re-executed** (the S113 lesson-1): the original session's uncommitted BN work was lost to a workspace reset, and the re-execution session's context exhausted mid-pinning (the workspace files + the daemon processes survived; the session's context did not). The recovery cost was LOW by construction: the S112 close named the next step precisely ("the rotation program's second pass — any cell, any view, re-probed fresh"), and every cycle artifact is re-derivable from the committed record — the re-execution re-derived the Mode-C audit, the live parity layer, and both rotation surfaces (re-pinned live on the :3200 standalone) from the docs chain alone. The runtime restored from zero: bun install 497 packages, chromium-1243 for the locked playwright 1.63, `.env` with `DATABASE_URL="file:../db/custom.db"`, db/ at the repo root, schema pushed + seeded, demo light/violet verified through Prisma — Task 12 / Note 4 / Event 3 / FocusSession 7, zero stranded probe rows.

**Baseline (cold, before any change).** lint ✓ tsc ✓ unit **936/936** (28 files); the canonical build green (the standalone asset contract intact — the build preceded the secret per the S112 lesson-1 recipe: the bundled copy shipped `AUTH_SECRET=""` by construction, no leak this cycle); the full cold 5-chunk e2e cert **474/474** (131+141+57+87+58 — every chunk first-pass, zero flakes).

**Evidence layers (all pre-change).** The Mode-C audit of the Batch BM diff (`9ee748e..f7665d7` + the operator's `fb7cdbe`) — **0C / 0H / 0M / 0L / 1I**, all BM claims verified TRUE (the BM diff 30 files / 1058 insertions, ZERO src/ and tests/ changes, zero key material [the six AUTH_SECRET diff lines all the empty-contract prose]; the committed rotation-frame md5s re-hashed from the committed blobs matching the record verbatim [368b0dab56617b1c67802a2e4d0a13f0 / b0832f3010e6b2990034be60a6f9bf0e]; the 20 committed 112-*.png frames md5-distinct; the operator commit clean; the docs chain aligned [README badge 1410 + the Session-112 row, AGENTS/CLAUDE 936 + the S112 lessons ×4 + the Unit-line seam tail S112/BM, the vitest header S112/BM, PAD v1.3.20, the remediation-plan header re-anchored to Batch BM]). **The I1 finding that sized the cycle**: the BM1 note's counts (239/120) describe the pre-s112-rider tree — the post-BM final-tree re-derivation (the pin's own regex, instrument-identical, the expectation stated BEFORE the measurement) is **241 playwright importers / 122 Usage-line carriers / 0 stale / 119 usage-line-free** — the doctrine's own predicted drift, arrived on schedule (twelfth consecutive cycle); the close is the register rotation (a dated S113 note appended to the BM1 execution record), not a pin change.

**The live parity re-verification (agent-browser on BOTH hosts).** **No NEW parity gap — the plateau re-confirmed live. No Tailwind v4 mobile-nav bug — s113 re-confirmed** (the mobile-nav standing table re-verified live row-by-row: the reference `sidebarOpen` read ["true"], 24 labeled links drawer-open, the X at (228,26) closes, scrollWidth 416 on /Notes [the reference's own overflow defect], the hamburger unlabeled, the Dark AND Light Settings option clicks both platform no-ops; the clone 26 labeled [the superset skip-link], role=dialog + aria-label="Navigation menu", nav auto-close [dialog unmounts], Escape close, X close, the 20 icon-only collapsed rail ALL title+aria at 80px, scrollWidth 390, the hamburger aria-labeled "Open navigation menu", `sf-sidebar-collapsed` null default restored; the clone's 21-view scrollWidth sweep ALL 1280/390 — the 21st swept view the login route at both viewports, the reference's nav enumerated label-by-label: identical 20-item nav sets; the clone's Analytics stat-icon tints measured IDENTICAL to the live reference [violet/blue/green/orange each ×1 on BOTH hosts]; the Analytics subtitle deviation re-derived [the clone's own since the initial build]).

**The rotation survey (before any rotation).** The program's 26 committed frames cover all four viewport cells on BOTH sides — **the exhaustion cycle closed at s112 (both the theme axis AND the view-level rotation program complete); the SECOND PASS opens here — any cell, any view, re-probed fresh.** The second-pass selection: **the DESKTOP LIGHT cell (1280×800)** — the home band, its light coverage the thinnest of the four cells (Events + Analytics at s109) — with the two views whose prior rotation frames are ALL dark-side: **Flashcards** (s103 desktop-dark + s106 mobile-dark — the view's FIRST light-side frame) + **Timetable** (s104 desktop-dark + s105 mobile-dark — the view's FIRST light-side frame). Both surfaces seed-deterministic with live-verified gate strings (the pinning probe run on the :3200 standalone BEFORE the Cycle-63 plan was written).

**Riders (TDD-by-construction — documentation + scripts only, src/ and tests/ untouched).** The Cycle-63 plan written into `docs/remediation-plan.md` BEFORE any source change. **BN1** — the dated S113 register note appended to the BM1 execution record (241/122/0-stale/119 measured BEFORE this cycle's riders existed; the final-tree forward arithmetic 243/124 = 241/122 + the two s113 riders — the fourteenth consecutive tripwire, stated BEFORE the measurement). **BN2** — `scripts/ref-resweep-s113.mjs` (the 7-location re-tag from s112, the normalization diff EMPTY under the full token set BEFORE the live run; live **ok:true, exit 0** — 9 ref + 9 clone checks green, the brand tables byte-matched, the mobile probes green both hosts, probeCleanup ok, 18 captures, zero stranded probe rows, the DB quiescence verified through Prisma post-run; re-run on the final tree ok:true, exit 0) + `scripts/capture-s113-evidence.mjs` (the DESKTOP LIGHT rotation — **GREEN FIRST-PASS with exit 0**, the gates live-probed BEFORE the run [the shape probe — containment; the text-form probe — the lowercase difficulty pills]: Frame 1 the FLASHCARDS view at 1280×800 light md5 `8583a9bf5145ed2b0116fb092d8c7b37`, mean brightness 248.3 — genuinely light; Frame 2 the TIMETABLE view at 1280×800 light md5 `0e8f6f451b45fd03611de1c64a6f8272`, mean brightness 250.0 — genuinely light; both md5-DISTINCT GATE-enforced, the desktop no-overflow contract scrollWidth <= 1280 on both, the S4 violet/light restore awaited on every path; the 20 committed 113-*.png resweep frames md5-distinct). **BN3** — the honest-zero-cycle acknowledgment (the census projections 936/474 UNCHANGED exact by construction). **BN4** — the reserved rider EXERCISED once: **the standing suite run #1 34/35** (cwv-volume-stress FAIL — the Tasks view's load-window longTaskTotal 2958ms > 2400ms [the S51-longtask family]; the co-residency guard verified fired in-suite [the S106/BG4 context fix applied — the dev server stopped for the stage], the code class ruled out BY CONSTRUCTION on the byte-identical tree [the BM diff: zero src/tests changes; the same 06:52 build serving :3200], the root cause the S91/AR1 machine-load coin-flip class extended to the in-suite churn context [30+ min of continuous 4x-throttled chromium churn]; remedy per the stage's own documented same-tree re-run protocol: the standalone re-run with the co-residency context **GREEN ×3 consecutive** [Tasks longTaskTotal 1957ms at the identical 8064 mainNodes, the INP proxy 1429/1035ms — inside the documented 1821–2288 healthy band], the pin stays 2400 [the S106/BG4 doctrine]; every other stage GREEN — ai-error 0 findings + 10 nonGaps, ai-a11y 0 findings + 4 nonGaps, pre15-preflight GREEN, dep-audit GREEN [0 runtime-reachable, 3 documented non-production advisories], the theme-restore closing guard GREEN [demo light/violet; Task 12 / Note 4 / Event 3 / FocusSession 7, zero stranded probe rows] — the effective standing posture **35/35 green post-remediation**, zero manufactured fixes).

**The S113 lessons (AGENTS.md ×4):** the session-interruption / re-execution class (the doc chain's precise next-step naming as the recovery instrument — the plan written BEFORE the source changes, the surfaces named in the plan, the gate strings live-verified BEFORE the riders are written); the ESM-resolution NODE_PATH trap (Node's ESM resolution IGNORES NODE_PATH — a probe script outside the repo needs a node_modules SYMLINK pointing at the repo's node_modules); the textContent-vs-innerText gate-form doctrine (the CSS capitalize transform makes the visible difficulty pill "Medium" while the raw DOM textContent is "medium" — live-probe the raw textContent form BEFORE writing the gate); and the containment-probe discipline + the stale-daemon hazard (the "My Classes header" div carries only the h2 + the date line, the class list lives in the parent sf-card section — the shape probe runs BEFORE the gate; and processes CAN survive a session cut — stale browser daemons are a pre-suite OOM hazard, kill them before a long suite run).

**Re-certification (all on the FINAL tree).** lint ✓ tsc ✓ unit **936/936** (28 files — the census projection exact; re-run after the riders AND the docs landed); the canonical build green (the BN riders touch no bundled surface; the bundled-secret contract verified: the bundled copy `AUTH_SECRET=""`, the repo `.env` the real secret); the cold 5-chunk e2e re-cert **474/474** (131+141+57+87+58, every chunk first-pass — run on the tree after the riders landed, BEFORE the suite); the s113 resweep re-run **ok:true, exit 0**; the standing suite per the BN4 verdict above; the register arithmetic on the final tree measured LAST through an instrument that is itself not a rider: **243 playwright importers / 124 Usage-line carriers / 0 stale / 119 usage-line-free = 241/122 + the two s113 riders**; `.env.example` verified current (NODE_ENV / DATABASE_URL / AUTH_SECRET / NEXT_PUBLIC_SITE_URL, all covered).

**Docs chain**: README (badge 1410, the Session-113 row with pipe parity), AGENTS (the S113 lessons ×4 — the session-interruption / re-execution class; the ESM-resolution NODE_PATH trap; the textContent-vs-innerText gate-form doctrine; the containment-probe discipline + the stale-daemon hazard), CLAUDE (the Unit-line seam tail re-anchored S113/BN), vitest.config.ts (the header re-anchored S113/BN — 28 files / 936), PAD v1.3.21 (the Cycle-63 revision block), docs/remediation-plan.md (the Cycle-63 plan + the execution record + the header re-anchor BM → BN), worklog.md (this entry), docs/session_95.md (the session record).

**DONE** — Batch BN closed. Baselines unchanged: unit **936/936**, e2e **474/474**, the standing suite per the verdict above. Standing debt after BN: **ZERO**. The rotation program's second pass is open — the natural next cycle (Session-114) remains the standing rhythm: audit the BN diff, ride the riders, re-certify cold (anchor it on `docs/session_95.md`) — the second pass continues (any cell, any view, re-probed fresh).

## Session-114 — Batch BO (Cycle 64): the audit-rider cycle at the plateau — the register rotation + the s114 MOBILE-PORTRAIT LIGHT evidence-frame rotation (the rotation program's SECOND PASS's cycle two)

**Context.** Received the pushed BN state (`7c4619b` + the operator's `669ec53` adding `docs/session_96.md` — the S113 raw transcript, audited clean: one file, 221 insertions, no source changes, no key material). The 38th workspace continuation — the workspace wiped again, the runtime restored from zero (a fresh clone at `669ec53`: bun install 497 packages, chromium-1243 for the locked playwright 1.63, `.env` with `DATABASE_URL="file:../db/custom.db"` [the build preceded the secret per the S112 lesson-1 recipe — the bundled copy shipped `AUTH_SECRET=""` by construction], db/ at the repo root, schema pushed + seeded, demo light/violet verified through Prisma — Task 12 / Note 4 / Event 3 / FocusSession 7, zero stranded probe rows).

**Baseline (cold, before any change).** lint ✓ tsc ✓ unit **936/936** (28 files); the canonical build green (the standalone asset contract intact — no leak this cycle by construction); the full cold 5-chunk e2e cert **474/474** (131+141+57+87+58 — every chunk first-pass, zero flakes).

**Evidence layers (all pre-change).** The Mode-C audit of the Batch BN diff (`fb7cdbe..7c4619b` + the operator's `669ec53`) — **0C / 0H / 0M / 0L / 1I**, all BN claims verified TRUE (the BN diff 30 files / 1085 insertions, ZERO src/ and tests/ changes, zero key material [every AUTH_SECRET diff line the empty-contract prose]; the committed rotation-frame md5s re-hashed from the committed blobs matching the record verbatim [8583a9bf5145ed2b0116fb092d8c7b37 / 0e8f6f451b45fd03611de1c64a6f8272]; the 20 committed 113-*.png frames md5-distinct; the operator commit clean; the docs chain aligned [README badge 1410 + the Session-113 row, AGENTS/CLAUDE 936 + the S113 lessons ×4 + the Unit-line seam tail S113/BN, the vitest header S113/BN, PAD v1.3.21, the remediation-plan header re-anchored to Batch BN]). **The I1 finding that sized the cycle**: the BN1 note's counts (241/122) describe the pre-s113-rider tree — the post-BN final-tree re-derivation (the pin's own regex, instrument-identical, run through the non-rider instrument outside the repo [the S106 lesson-3], the expectation stated BEFORE the measurement) is **243 playwright importers / 124 Usage-line carriers / 0 stale / 119 usage-line-free** — the doctrine's own predicted drift, arrived on schedule (thirteenth consecutive cycle); the close is the register rotation (a dated S114 note appended to the BN1 execution record), not a pin change.

**The live parity re-verification (agent-browser on BOTH hosts).** **No NEW parity gap — the plateau re-confirmed live. No Tailwind v4 mobile-nav bug — s114 re-confirmed** (the mobile-nav standing table re-verified live row-by-row: the reference `sidebarOpen` read ["true"], 24 labeled links drawer-open, the X's close function verified [this pass's honest nuance — the S114 lesson-1: an EMPTY fixed toast container z-100 intercepted the physical coordinate click at (228,26); the elementFromPoint probe named the interceptor, the direct click verified the X], scrollWidth 416 on /Notes [the reference's own overflow defect], the hamburger unlabeled, the Dark AND Light AND System Settings option clicks all platform no-ops; the clone 26 labeled [the superset skip-link], role=dialog + aria-label="Navigation menu", nav auto-close [dialog unmounts], a REAL Escape close, X close, the 20 icon-only collapsed rail ALL title+aria at 80px, scrollWidth 390, the hamburger aria-labeled "Open navigation menu", `sf-sidebar-collapsed` null default restored; the clone's 21-view scrollWidth sweep ALL 1280/390 — the 21st swept view the login route at both viewports, the reference's nav enumerated label-by-label: identical 20-item nav sets; the clone's Analytics stat-icon tints measured IDENTICAL to the live reference [violet/blue/green/orange each ×1 on BOTH hosts]; the Analytics subtitle deviation re-derived [the clone's own since the initial build]).

**The rotation survey (before any rotation).** The program's 28 committed frames — desktop ×10 dark (s100–s104) + ×4 light (s109, s113), mobile-portrait ×4 dark (s105–s106) + ×2 light (s110), landscape ×2 dark (s107) + ×2 light (s111), mid-band ×2 dark (s108) + ×2 light (s112). **The second pass's cycle two: the MOBILE-PORTRAIT LIGHT cell (390×844)** — the mobile home band, now the tied-thinnest light coverage — with the two views whose prior rotation frames are ALL dark-side AND whose only prior frames are the same-cell dark flips (the BN selection shape, one cell deeper): **Dashboard** (s105 mobile-dark — the view's FIRST light-side frame; the home view, its entire lineage dark-side) + **Notes** (s106 mobile-dark — the view's FIRST light-side frame; the view where the reference carries its own mobile overflow defect, the clone's clean-390 contract now documented on the light side too). Both surfaces seed-deterministic with live-verified gate strings (the pinning probe run on the :3200 standalone, both views dumped at 390×844 in light BEFORE the Cycle-64 plan was written — the shape probe, the pattern probe [the greeting buckets + the long-date subtitle], the per-condition discipline).

**Riders (TDD-by-construction — documentation + scripts only, src/ and tests/ untouched).** The Cycle-64 plan written into `docs/remediation-plan.md` BEFORE any source change. **BO1** — the dated S114 register note appended to the BN1 execution record (243/124/0-stale/119 verified instrument-identical, the expectation stated BEFORE the measurement holding exactly; the final-tree forward arithmetic 245/126 = 243/124 + the two s114 riders — the fifteenth consecutive tripwire, stated BEFORE the measurement). **BO2** — `scripts/ref-resweep-s114.mjs` (the 7-location re-tag from s113, the normalization diff EMPTY under the full token set BEFORE the live run; live **ok:true, exit 0** — 9 ref + 9 clone checks green, the brand tables byte-matched, the mobile probes green both hosts, probeCleanup ok, 18 captures, zero stranded probe rows, the DB quiescence verified through Prisma post-run; re-run on the final tree ok:true, exit 0) + `scripts/capture-s114-evidence.mjs` (the MOBILE-PORTRAIT LIGHT rotation — **GREEN FIRST-PASS with exit 0**, the gates live-probed BEFORE the run: Frame 1 the DASHBOARD view at 390×844 light md5 `3472ebeb32050856a18578be4446c553`, mean brightness 239.7 — genuinely light; Frame 2 the NOTES view at 390×844 light md5 `899b6076d60024d97b45d1d261a23187`, mean brightness 244.9 — genuinely light; both md5-DISTINCT GATE-enforced, the mobile no-overflow contract scrollWidth <= 390 on both, the S4 violet/light restore awaited on every path; the 20 committed 114-*.png resweep frames md5-distinct). **BO3** — the honest-zero-cycle acknowledgment (the census projections 936/474 UNCHANGED exact by construction). **BO4** — the reserved rider NOT EXERCISED: **the standing suite's fresh single run 35/35 GREEN — every stage first-pass, zero remediation** (~58 min, the double-forked daemon; the BN4 collision stage cwv-volume-stress green this run — the S91/AR1 machine-load coin-flip class not re-fired; every other stage green including ai-error 0+10, ai-a11y 0+4, pre15-preflight GREEN, dep-audit GREEN [0 runtime-reachable, 3 documented non-production advisories], the theme-restore closing guard GREEN [demo light/violet; Task 12 / Note 4 / Event 3 / FocusSession 7, zero stranded probe rows] — the honest zero-remediation verdict, no protocol invoked, no fix manufactured).

**The S114 lessons (AGENTS.md ×3):** the overlay-interception trap (a physical-coordinate click that "does nothing" is not evidence the control is broken — elementFromPoint BEFORE concluding; the reference's EMPTY fixed toast container intercepted the click at the drawer X's (228,26) this pass, the X's own close function verified by the direct click — a TRANSIENT overlay, not a permanent defect); the skeleton-race content-wait trap (a shell-state wait passes on the boot-script state BEFORE the view's client-fetched content renders — the first Notes dump returned an empty main on a satisfied shell gate; every capture gate asserts the SURFACE it protects, the theme gate and the content gate separate predicates); and the synthetic-vs-real click discipline (an eval-fired el.click() does NOT trigger every React control — the sidebar collapse toggle silently ignored it while the drawer links, the X and the theme options took it; state changes get the REAL click path, the synthetic click reserved for existence probes).

**Re-certification (all on the FINAL tree).** lint ✓ tsc ✓ unit **936/936** (28 files — the census projection exact; re-run after the riders AND the docs landed); the canonical build green (content-identical — the BO riders touch no bundled surface; the bundled-secret contract verified: the bundled copy `AUTH_SECRET=""`, the repo `.env` the real secret); the cold 5-chunk e2e re-cert **474/474** (131+141+57+87+58, every chunk first-pass — run on the tree after the riders landed, the same tree the 35/35 suite certified); the s114 resweep re-run on the final tree **ok:true, exit 0**; the standing suite per the BO4 verdict above (**35/35 green, fresh single run, zero remediation**); the register arithmetic on the final tree measured LAST through an instrument that is itself not a rider: **245 playwright importers / 126 Usage-line carriers / 0 stale / 119 usage-line-free = 243/124 + the two s114 riders**; `.env.example` verified current (the env surface enumerated live: NODE_ENV / DATABASE_URL / AUTH_SECRET / NEXT_PUBLIC_SITE_URL, all covered).

**Docs chain**: README (badge 1410, the Session-114 row with pipe parity), AGENTS (the S114 lessons ×3 — the overlay-interception trap; the skeleton-race content-wait trap; the synthetic-vs-real click discipline), CLAUDE (the Unit-line seam tail re-anchored S114/BO), vitest.config.ts (the header re-anchored S114/BO — 28 files / 936), PAD v1.3.22 (the Cycle-64 revision block), docs/remediation-plan.md (the Cycle-64 plan + the execution record + the header re-anchor BN → BO), worklog.md (this entry), docs/session_97.md (the session record).

**DONE** — Batch BO closed. Baselines unchanged: unit **936/936**, e2e **474/474**, the standing suite **35/35 green (fresh single run)**. Standing debt after BO: **ZERO**. The rotation program's second pass continues — the natural next cycle (Session-115) remains the standing rhythm: audit the BO diff, ride the riders, re-certify cold (anchor it on `docs/session_97.md`) — the second pass continues (any cell, any view, re-probed fresh).

## Session-115 — Batch BP (Cycle 65): the audit-rider cycle at the plateau — the register rotation + the s115 MID-BAND LIGHT evidence-frame rotation (the rotation program's SECOND PASS's cycle three)

**Context.** Received the pushed BO state (`aa13c67` + the operator's `74a60c4` adding `docs/session_98.md` — the S114 raw transcript, audited clean: one file, 102 insertions, no source changes, no key material). The 39th workspace continuation — the runtime restored from zero (a fresh clone at `74a60c4`: bun install 497 packages, chromium-1243 for the locked playwright 1.63, `.env` with `DATABASE_URL="file:../db/custom.db"` — the build preceded the secret per the S112 lesson-1 recipe, the bundled copy shipped `AUTH_SECRET=""` by construction; db/ at the repo root, schema pushed + seeded, demo light/violet verified through Prisma [Task 12 / Note 4 / Event 3 / FocusSession 7, zero stranded probe rows]).

**Baseline (cold, before any change).** lint ✓ tsc ✓ unit **936/936** (28 files); the canonical build green (the standalone asset contract intact — no leak this cycle by construction); the full cold 5-chunk e2e cert **474/474** (131+141+57+87+58 — every chunk first-pass, zero flakes).

**Evidence layers (all pre-change).** The Mode-C audit of the Batch BO diff (`669ec53..aa13c67` + the operator's `74a60c4`) — **0C / 0H / 0M / 0L / 1I**, all BO claims verified TRUE (the BO diff 30 files / 1024 insertions, ZERO src/ and tests/ changes, zero key material [every AUTH_SECRET diff line the empty-contract prose; the 64-hex sweep empty]; the committed rotation-frame md5s re-hashed from the committed blobs matching the record verbatim [3472ebeb… / 899b6076…]; the 20 committed 114-*.png frames md5-distinct; the operator commit clean [docs/session_98.md only, 102 insertions]; the docs chain aligned [README badge 1410 + the Session-114 row, AGENTS/CLAUDE 936 + the S114 lessons ×3 + the Unit-line seam tail S114/BO, the vitest header S114/BO, PAD v1.3.22, the remediation-plan header re-anchored to Batch BO]). **The I1**: the BO1 note's counts (243/124) describe the pre-s114-rider tree — the post-BO final-tree re-derivation **245/126/0-stale/119** (the non-rider instrument outside the repo, the node_modules-symlink resolution per the S113 lesson-2, the expectation stated BEFORE the measurement and holding exactly); the close is the register rotation (a dated S115 note appended to the BO1 execution record), not a pin change.

**The live parity re-verification (agent-browser on BOTH hosts).** **No NEW parity gap — the plateau re-confirmed live. No Tailwind v4 mobile-nav bug — s115 re-confirmed** (the mobile-nav standing table re-verified live row-by-row: the reference 24 visible links drawer-open / no role=dialog / the X's close function verified by the direct click [the S114 lesson-1 interceptor re-confirmed — an EMPTY fixed toast container again swallowed the physical coordinate click at (228,26); the elementFromPoint probe named the interceptor] / hamburger unlabeled / the Dark AND Light AND System Settings option clicks all platform no-ops / `sidebarOpen` read ["true"] not modified; the clone 26 visible [the superset skip-link] / role=dialog + aria-label="Navigation menu" / nav auto-close [dialog unmounts] / REAL Escape close / X close / the 20 icon-only collapsed rail ALL title+aria at 80px [the REAL click path] / the hamburger aria-labeled / `sf-sidebar-collapsed` null default read and restored to null; the clone's 21-view scrollWidth sweep ALL 1280 at desktop / ALL 390 at mobile-portrait; the Analytics stat-icon tints measured IDENTICAL on both hosts; the Analytics subtitle deviation re-derived [the S115 lesson-2 scoping nuance: the document's FIRST h1 is the sidebar brand block on BOTH hosts — the view header lives in the main region]).

**The rotation survey (before any rotation).** The program's 30 committed frames — desktop ×10 dark (s100–s104) + ×4 light (s109, s113), mobile-portrait ×4 dark (s105–s106) + ×4 light (s110, s114), landscape ×2 dark (s107) + ×2 light (s111), mid-band ×2 dark (s108) + ×2 light (s112). s115 rotates onto **the MID-BAND LIGHT cell** (768×1024 — now the tied-thinnest light coverage alongside the landscape-light cell) with the s108 pair, both views' FIRST light-side frames: **PracticeTests** (the 2-column grid — the mid-band-only structural discriminator with EXACTLY 2 px computed tracks ["360px 360px" live-verified], both seeded cards side-by-side in one row, the card metadata lines, the below-lg app bar) + **StudyGroups** (the w-80 aside at its FULL 320px mid-band width, the Calc Crew row with 2 members + the Mathematics SubjectChip, the plain-variant null-selection empty state with the Users EmptyState icon ABSENT — the S8-Z two-variant boundary). Both surfaces pinned live on the :3200 standalone host BEFORE the plan was written (the shape probe + the content probe, the per-condition discipline).

**Riders (TDD-by-construction — documentation + scripts only, src/ and tests/ untouched).** The Cycle-65 plan written into `docs/remediation-plan.md` BEFORE any source change. **BP1** — the dated S115 register note appended to the BO1 execution record (245/126/0-stale/119 verified live; the final-tree forward arithmetic **247/128 = 245/126 + the two s115 riders** — the sixteenth consecutive tripwire, stated BEFORE the measurement). **BP2** — `scripts/ref-resweep-s115.mjs` (the 7-location re-tag from s114, the normalization diff EMPTY under the full token set BEFORE the live run; live **ok:true, exit 0** — 9+9 invariants green both hosts, the brand tables byte-matched, probeCleanup ok, 18 captures, zero stranded s115-resweep probe rows, the DB quiescence verified through Prisma post-run) + `scripts/capture-s115-evidence.mjs` (the MID-BAND LIGHT rotation — **GREEN FIRST-PASS with exit 0**: Frame 1 PracticeTests 768×1024 light md5 `ebb8374ab66c7f6ad35f65b60025341b`, mean brightness 251.3; Frame 2 StudyGroups 768×1024 light md5 `45373f04c0b77bdc297cf64d24024823`, mean brightness 252.3; both md5-DISTINCT GATE-enforced, scrollWidth <= 768 both frames, the S4 violet/light restore awaited on every path; the 20 committed 115-*.png frames md5-distinct). **BP3** — the honest-zero acknowledgment (936/474 UNCHANGED exact by construction). **BP4** — NOT EXERCISED: **the standing suite's fresh single run 35/35 GREEN, every stage first-pass, zero remediation** (cwv-volume-stress green first-pass; dep-audit GREEN with the advisory count drifted 3→4 on registry metadata [minimatch/quill/deepmerge-ts/zod — every path non-production, 0 runtime-reachable]; the theme-restore closing guard GREEN; the first suite launch aborted at stage 1 on the killed :3000 — the S115 lesson-1 — the dev server re-booted and the re-launch ran the FULL 35/35; the BG4 restart warning after the cwv stage's co-residency stop was the guard's loud honesty, :3000 verified healthy after).

**The S115 lessons (AGENTS.md ×3):** the preflight-precondition trap (the standing suite's stage-1 dev-server-preflight REQUIRES :3000 alive — the memory-hygiene kill of the dev server belongs AFTER the suite; the runner checks health, it does not boot the dev server, while the cwv stage's :3200 lifecycle IS runner-owned); the unscoped-h1 trap (a view-header probe must scope to the MAIN region — the document's first h1 is the sidebar BRAND block on BOTH hosts; the S112 lesson-2 tag axis and the S113 lesson-4 containment axis generalized to the REGION axis); the file-access wall (a headless-chromium about:blank page does not load file:// images — the brightness probe marshals the bytes as a data URL).

**Re-certification (all on the FINAL tree).** lint ✓ tsc ✓ unit **936/936** (28 files — the census projection exact; re-run after the riders AND the docs landed); the canonical build green (content-identical — the BP riders touch no bundled surface; the bundled-secret contract verified: the bundled copy `AUTH_SECRET=""`, the repo `.env` the real secret); the cold 5-chunk e2e re-cert **474/474** (131+141+57+87+58, every chunk first-pass); the s115 resweep re-run **ok:true, exit 0** (18 captures rewritten, the DB quiescence re-verified); the register arithmetic on the final tree measured LAST through the non-rider instrument: **247/128/0-stale/119 = 245/126 + the two s115 riders** (the sixteenth consecutive tripwire, holding exactly); `.env.example` verified current (NODE_ENV / DATABASE_URL / AUTH_SECRET / NEXT_PUBLIC_SITE_URL all covered).

**Docs chain**: README (badge 1410, the Session-115 row), AGENTS (the S115 lessons ×3 — the preflight-precondition trap; the unscoped-h1 trap; the file-access wall), CLAUDE (the Unit-line seam tail re-anchored S115/BP), vitest.config.ts (the header re-anchored S115/BP), Project_Architecture_Document.md (v1.3.23 — the Cycle-65 revision block), docs/remediation-plan.md (the Cycle-65 plan + this execution record + the header re-anchor BO → BP), worklog.md (this entry), docs/session_99.md (the session record).

**DONE** — Batch BP closed. Baselines unchanged: unit **936/936**, e2e **474/474**, the standing suite **35/35 green (fresh single run)**. Standing debt after BP: **ZERO**. The rotation program's second pass continues — the natural next cycle (Session-116) remains the standing rhythm: audit the BP diff, ride the riders, re-certify cold (anchor it on `docs/session_99.md`) — the second pass continues (any cell, any view, re-probed fresh).

## Session-116 — Batch BQ (Cycle 66): the audit-rider cycle at the plateau — the register rotation + the s116 MOBILE-LANDSCAPE LIGHT evidence-frame rotation (the rotation program's SECOND PASS's cycle four — the LIGHT QUARTET's closing cell)

**Context.** Received the pushed BP state (`f65d442` + the operator's `e6b540a` adding `docs/session_100.md` — the S115 raw transcript, audited clean: one file, 86 insertions, no source changes, no key material). The 40th workspace continuation — the runtime restored from zero (a fresh clone at `e6b540a`: bun install 496 packages, chromium-1243 for the locked playwright 1.63, `.env` with `DATABASE_URL="file:../db/custom.db"` — the build preceded the secret per the S112 lesson-1 recipe, the bundled copy shipped `AUTH_SECRET=""` by construction; db/ at the repo root, schema pushed + seeded, demo light/violet verified through Prisma [Task 12 / Note 4 / Event 3 / FocusSession 7, zero stranded probe rows]).

**Baseline (cold, before any change).** lint ✓ tsc ✓ unit **936/936** (28 files); the canonical build green (the standalone asset contract intact — no leak this cycle by construction); the full cold 5-chunk e2e cert **474/474** (131+141+57+87+58 — every chunk first-pass, zero flakes).

**Evidence layers (all pre-change).** The Mode-C audit of the Batch BP diff (`74a60c4..f65d442` + the operator's `e6b540a`) — **0C / 0H / 0M / 0L / 1I**, all BP claims verified TRUE (the BP diff 30 files / 1022 insertions, ZERO src/ and tests/ changes, zero key material [every AUTH_SECRET diff line the empty-contract prose; the 64-hex sweep empty]; the committed rotation-frame md5s re-hashed from the committed blobs matching the record verbatim [ebb8374a… / 45373f04…]; the 20 committed 115-*.png frames md5-distinct; the operator commit clean [docs/session_100.md only, 86 insertions]; the docs chain aligned [README badge 1410 + the Session-115 row, AGENTS/CLAUDE 936 + the S115 lessons ×3 + the Unit-line seam tail S115/BP, the vitest header S115/BP, PAD v1.3.23, the remediation-plan header re-anchored to Batch BP]). **The I1**: the BP1 note's counts (245/126) describe the pre-s115-rider tree — the post-BP final-tree re-derivation **247/128/0-stale/119** (the non-rider instrument outside the repo, the node_modules-symlink resolution per the S113 lesson-2, the expectation stated BEFORE the measurement and holding exactly — the seventeenth consecutive tripwire); the close is the register rotation (a dated S116 note appended to the BP1 execution record), not a pin change.

**The live parity re-verification (agent-browser on BOTH hosts).** **No NEW parity gap — the plateau re-confirmed live. No Tailwind v4 mobile-nav bug — s116 re-confirmed** (the mobile-nav standing table re-verified live row-by-row: the reference 24 visible links drawer-open / no role=dialog / the X's close function verified by the direct click [the S114 lesson-1 interceptor re-confirmed — the EMPTY fixed toast container again swallowed the physical coordinate click at (228,26); the elementFromPoint probe named the interceptor] / hamburger unlabeled / the Dark AND Light AND System Settings option clicks all platform no-ops / `sidebarOpen` read ["true"] not modified / scrollWidth 416 on /Notes — the reference's own overflow defect; the clone 26 visible [the superset skip-link] / role=dialog + aria-label="Navigation menu" / nav auto-close [dialog unmounts] / REAL Escape close / the labeled backdrop close surface closes via a REAL mouse click at a panel-clear backdrop point [the S116 lesson-2 — the backdrop-button center trap] / the 20 icon-only collapsed rail ALL title+aria at 80px [the REAL click path] / the hamburger aria-labeled / `sf-sidebar-collapsed` null default read and restored to null; the clone's 21-view scrollWidth sweep ALL 1280 at desktop / ALL 390 at mobile-portrait; the Analytics stat-icon tints measured IDENTICAL on both hosts; the Analytics subtitle deviation re-derived [the S115 lesson-2 main-scoped probe discipline applied]).

**The rotation survey (before any rotation).** The program's 32 committed frames — desktop ×10 dark (s100–s104) + ×4 light (s109, s113), mobile-portrait ×4 dark (s105–s106) + ×4 light (s110, s114), landscape ×2 dark (s107) + ×2 light (s111), mid-band ×2 dark (s108) + ×4 light (s112, s115); the view-level gaps NONE (every one of the 20 nav views carries ≥1 frame — the second pass's "any cell, any view, re-probed fresh" framing is now the whole program). s116 rotates onto **the LANDSCAPE LIGHT cell** (844×390 — the thinnest light coverage ×2, the LIGHT QUARTET's last never-second-passed cell) with the s107 pair, both surfaces' FIRST light-side frames (the BN selection shape — the same-cell dark flips): **the DRAWER NAV-SCROLL** (the landscape-only structural discriminator: the 20-link nav list MUST scroll at the 390px viewport height [scrollHeight 992 > clientHeight 301, live-verified at the pinning probe] while the portrait list fits unscrolled; the light side of the drawer's rotation coverage is itself the user-flagged standing surface's first light-side evidence frame) + **the TASKS view** (the view's first light-side frame and first landscape-light re-probe: the active-list h1 "All Tasks", the md:flex two-pane layout AT 844, the red-pill family on the overdue row + the violet RepeatPill + slate SubjectChip on the boundary row — NEVER the exact date). Both surfaces pinned live on the :3200 standalone host BEFORE the plan was written (the shape probe + the content probe, the per-condition discipline).

**Riders (TDD-by-construction — documentation + scripts only, src/ and tests/ untouched).** The Cycle-66 plan written into `docs/remediation-plan.md` BEFORE any source change. **BQ1** — the dated S116 register note appended to the BP1 execution record (247/128/0-stale/119 verified live; the final-tree forward arithmetic **249/130 = 247/128 + the two s116 riders** — the eighteenth consecutive tripwire, stated BEFORE the measurement and holding exactly). **BQ2** — `scripts/ref-resweep-s116.mjs` (the 7-location re-tag from s115, the normalization diff EMPTY under the full token set BEFORE the live run; live **ok:true, exit 0** — 9+9 invariants green both hosts, the brand tables byte-matched, probeCleanup ok, 18 captures, zero stranded s116-resweep probe rows, the DB quiescence verified through Prisma post-run; three live invocations all green — the initial run, the envelope-captured run, and the final-tree re-run) + `scripts/capture-s116-evidence.mjs` (the LANDSCAPE LIGHT rotation — **ONE live gate iteration, then GREEN exit 0**: the first pass failed Frame 2's row-finding [the S116 lesson-1 row-container trap — the gate queried `main li` from the s107 record's row prose while the Tasks view renders `div.rounded-xl` cards; the per-condition diagnostic named it in one run, liCount 0 with every other condition green]; Frame 1 the DRAWER 844×390 light md5 `b090074afe3f89a45609bbc3b1fd81a8`, mean brightness 215.3 (the backdrop dim over the light app — genuinely light, far above the dark band); Frame 2 TASKS 844×390 light md5 `20816f53d626176ac5f5657abb1a66be`, mean brightness 248.9; both md5-DISTINCT GATE-enforced, scrollWidth <= 844 both frames, the S4 violet/light restore awaited on every path; the 20 committed 116-*.png frames md5-distinct). **BQ3** — the honest-zero acknowledgment (936/474 UNCHANGED exact by construction). **BQ4** — NOT EXERCISED: **the standing suite's fresh single run 35/35 GREEN, every stage first-pass, zero remediation** (the S115 lesson-1 pre-suite hygiene applied — :3000 kept alive through the parity probes, the stale browser daemons closed pre-launch; the BG4 restart warning after the cwv-volume-stress co-residency stop the guard's loud honesty — :3000 verified healthy immediately after, the remaining stages all green; dep-audit GREEN 0 runtime-reachable, 4 documented non-production advisories — no drift from the BP count; the theme-restore closing guard GREEN; the suite completed ~75 min, the daemon polled).

**The S116 lessons (AGENTS.md ×3):** the row-container axis (a gate's ROW selector is a live-probe fact, never a prose paraphrase — the tag [S112-2], text-transform [S113-3], containment [S113-4] trio joined by the fourth member: the row-container shape; the pinning probe's verified selector is the gate's selector); the backdrop-button center trap (the clone drawer's "Close navigation menu" aria-label belongs to the full-viewport backdrop button, not a glyph X — the panel renders above the backdrop so the button's own center lands on the nav labels; the working probe picks a panel-clear backdrop point and takes the real mouse path [move + down + up]; the two hosts' close surfaces differ by design); the eval-context tooling shape (agent-browser's eval takes an expression, not an async script body — top-level await throws; async probes wrap in an IIFE; each eval re-declares its locals).

**Re-certification (all on the FINAL tree).** lint ✓ tsc ✓ unit **936/936** (28 files — the census projection exact; re-run after the riders AND the docs landed); the canonical build green (content-identical — the baseline build, the BQ riders touch no bundled surface; the bundled-secret contract verified: the bundled copy `AUTH_SECRET=""`, the repo `.env` the real secret); the cold 5-chunk e2e re-cert **474/474** (131+141+57+87+58, every chunk first-pass); the s116 resweep re-run **ok:true, exit 0** (18 captures rewritten, the DB quiescence re-verified: Task 12 / Note 4 / Event 3 / FocusSession 7, demo light/violet, zero stranded rows); the register arithmetic on the final tree measured LAST through the non-rider instrument: **249/130/0-stale/119 = 247/128 + the two s116 riders** (the eighteenth consecutive tripwire, holding exactly); `.env.example` verified current (NODE_ENV / DATABASE_URL / AUTH_SECRET / NEXT_PUBLIC_SITE_URL all covered).

**Docs chain**: README (badge 1410, the Session-116 row), AGENTS (the S116 lessons ×3 — the row-container axis; the backdrop-button center trap; the eval-context tooling shape), CLAUDE (the Unit-line seam tail re-anchored S116/BQ), vitest.config.ts (the header re-anchored S116/BQ — 28 files / 936), Project_Architecture_Document.md (v1.3.24 — the Cycle-66 revision block), docs/remediation-plan.md (the Cycle-66 plan + this execution record + the header re-anchor BP → BQ), worklog.md (this entry), docs/session_101.md (the session record).

**DONE** — Batch BQ closed. Baselines unchanged: unit **936/936**, e2e **474/474**, the standing suite **35/35 green (fresh single run)**. Standing debt after BQ: **ZERO**. The rotation program's second pass's LIGHT QUARTET is complete (desktop s113, mobile-portrait s114, mid-band s115, landscape s116) — the natural next cycle (Session-117) remains the standing rhythm: audit the BQ diff, ride the riders, re-certify cold (anchor it on `docs/session_99.md` and `docs/session_101.md`) — the second pass continues (any cell, any view, re-probed fresh).

---

## Session-117 / Batch BR (Cycle 67) — 2026-10-31 — the operator-directed hardening cycle: the import cards fix + the auth-hardening quartet

**Workspace.** Fresh clone at `b55affb` (the Batch BQ state + the operator's `docs/session_102.md` transcript). Runtime restored from zero: bun install 496 packages; `.env` with `DATABASE_URL="file:../db/custom.db"` (`AUTH_SECRET=""` — the build-before-secret recipe); `db/` at the repo root, schema pushed + seeded (demo light/violet); chromium-1243 installed for the locked Playwright 1.63.

**Baseline re-certified cold BEFORE any work.** lint ✓ tsc ✓ unit **936/936** (28 files); the canonical build green with the bundled-`.env` contract intact (`AUTH_SECRET=""`); the cold 5-chunk e2e **474/474** (131+141+57+87+58); the dev-server preflight GREEN; the register re-derivation **249 importers / 130 Usage-line carriers / 0 stale** (the 18th consecutive tripwire, holding exactly); the Mode-C audit of the Batch BQ diff (`e6b540a..2b06b09` + `b55affb`) — **0C/0H/0M/0L/1I**, every BQ claim verified TRUE (zero src/tests changes, no key material, the 20 s116 frames md5-distinct).

**Live parity re-verification (both hosts, agent-browser + DOM probes + a VLM spot-check).** **No NEW parity gap; no Tailwind v4 mobile-nav bug — s117 re-confirmed** (the 18th consecutive live confirmation). Reference reproduced live: 24 links drawer-open, no `role=dialog`, the unlabeled hamburger, `/Notes` scrollWidth 416 (its own overflow defect), the landscape nav-scroll 992 > 290. Clone verified: 26 labeled links, `role=dialog` + "Navigation menu", the labeled hamburger + backdrop close at computed `blur(4px)` (the v4 `backdrop-blur-xs` pin), REAL Escape close + scroll-lock release, nav auto-close, `/Notes` clean at 390, the landscape discriminator 992 > 301, the sidebar 260→80px collapse with 20/20 icon-only links titled, the boolean-string localStorage contract. The VLM drawer pair: "visually equivalent"; its two dashboard flags disproven by DOM measurement (the reference DOES carry all 20 links; the overdue banner is data-driven) — the documented VLM-hypothesis/DOM-authority class.

**The audits (operator-directed; `skills/web-application/SKILL.md` §5/§6/§16 + §2/§3/§15 as rubrics).** One Critical functional bug + a hardening set, EVERY finding verified against code (and reproduced live where applicable) before any fix — the plan: `docs/remediation-plan-session117.md`:

- **BR1 (Critical, functional):** the import route's write loop probed `{ id, userId }` on the flashcard delegate — Flashcard has NO `userId` column → PrismaClientValidationError → the all-or-nothing rollback → **HTTP 500 on any envelope containing cards. The export→import round-trip was broken for every account with flashcards** (reproduced live: the demo export's 3 decks / 6 cards → 500, the exact trace in dev.log). Invisible to 94 sessions of green e2e because the s23 envelope only ever posted a DANGLING deckId card (the 400-before-the-write-loop path) — the write loop's cards branch had zero coverage. Fixed: every cards probe scopes through `{ deck: { userId } }` (the knownIds loop's own pattern); + the documented S23 contract restored (the 10 MiB cap → 413 both on the declared length and the actual text; `NEVER_IMPORT_FIELDS` stripped from every row; unknown collections rejected by name; folders parents-first via the seam's newly-exported `sortFoldersParentsFirst`; the version floor). The seam is no longer dead code. Verified live: the round-trip → 200 with `cards: { updated: 6 }`; e2e-pinned (a stamped-id card under an EXISTING owned deck — the account-aware REQUIRED-FK path — with finally-cleanup).
- **BR2:** verify-email rate-limited **20/IP/15 min**, limiter-before-validation (the login route's convention). Verified live (20 × 400 then 429 + `retry-after: 890`); e2e-pinned with the RFC 5737 TEST-NET technique (never poisons the localhost budget the other specs' register→verify journeys share).
- **BR3:** the login **timing equalizer** — `verifyLoginCredentials` + `DUMMY_LOGIN_HASH` in `src/lib/auth.ts`; the route hoists the burn before the null check. Verified live: unknown-email ≈ wrong-password ≈ 40ms (the oracle closed); unit-pinned (5) including the malformed-dummy mutant the shape pin fails.
- **BR4:** `linkFileSchema` in `src/lib/validation.ts` — http(s)-only link URLs, the shared schema for `files/link` (matching the upload route's S14 rule — the near-duplicate inconsistency closed); unit-pinned (3).
- **BR5:** the `readJson` **Content-Type gate** (a `text/plain` form POST — the login-CSRF class — is unparseable-by-policy). Verified safe first: the app's own client sets `application/json` (api.ts:83) and zero e2e specs post stringified bodies.
- **BR6:** reset tokens **hashed at rest** (`hashResetToken`, SHA-256) — the raw 48-hex token rides the URL only. Verified live: the stored row is a 64-hex digest, the raw-token reset 200, one-shot consumption intact; unit-pinned (2). Outstanding plaintext tokens die at deploy (30-min TTL; dev-only data — documented).
- **BR7:** the documented decisions written down (PAD §6.4): the XFF first-hop limiter keying + the in-response OTP/reset delivery — both parity-load-bearing, both with explicit REOPEN TRIGGERS; the RUM upsert Low accepted with its trigger; `E2E_PORT` documented in `.env.example`; the Docker `NEXT_PUBLIC_SITE_URL` **build-time** correction (the Dockerfile ARG wired — sitemap/robots/metadataBase prerender at build; the DEPLOYMENT/compose claims corrected); AGENTS.md's import paragraph rewritten to the now-true contract; `tsconfig.json` **`noImplicitAny: true`** (verified: zero new tsc errors — a guardrail strengthened, not weakened).

**The standing suite.** First run: **27/35** with 8 accent-volume family failures — every one "page.evaluate: Target crashed" or a post-crash timeout, with TWO agent-browser sessions open (the documented 4GB-sandbox OOM class) and the same-family light-midband stage GREEN mid-run. **Re-run quiet (browsers closed, sequential): all 8 green, zero findings** — the S117 lesson-4 protocol (a crash-mode failure is never a code finding until it reproduces quiet), now in AGENTS.md.

**Re-certification (all on the FINAL tree).** lint ✓ tsc ✓ (`noImplicitAny` on) unit **944/944** (28 files — auth +5, validation +3); the canonical build green; the cold 5-chunk e2e **476/476** (131+141+57+87+60 — chunk five +2: the s23 cards round-trip pin + the auth-flows verify-429 pin); `.env.example` verified current; the fresh s117 evidence frames captured to `docs/screenshots/`. **Standing debt: ZERO.**

**Docs chain.** README badge 1420 + the Session-117 row; AGENTS commands 944/476 + the S117 lessons ×4 + the import paragraph; CLAUDE Unit-line seam tail S117/BR; vitest header 944; PAD v1.3.25 (+ the §6.4 rows); remediation-plan header → Batch BR; this entry; `docs/session_103.md` (the session record); `docs/remediation-plan-session117.md` (the plan + execution record).

## Session-118 / Batch BS (Cycle 68) — 2026-10-31 — the audit-driven hardening cycle: the session-revocation + bounded-reads + drawer-focus set

**Workspace.** Continued clone at `5f2a19b` (the Batch BR state + the operator's `docs/session_104.md` transcript — internal session 118; no reset, the runtime carried over: dev server on :3000, `db/custom.db` at the documented seed state). The full doc chain re-read (AGENTS, CLAUDE, README, PAD, the SKILL doc, session_103/104, the remediation plan, the worklog) and re-validated against the tree.

**Baseline re-certified cold BEFORE any work.** lint ✓ tsc ✓ (`noImplicitAny` on) unit **944/944** (28 files); the canonical build green with the bundled-`.env` contract intact (`AUTH_SECRET=""`); the cold 5-chunk e2e **476/476** (131+141+57+87+60 — the first chunk-5 attempt hit the documented aged-scratch-db class, fresh `db/e2e.db` → green); the dev-server preflight GREEN (the documented `.next/dev` reload-loop remedy applied); the register re-derivation **249/130/0-stale/119** — the tripwire held exactly; the Mode-C audit of the Batch BR diff (34 files / 830 insertions) clean: every BR claim TRUE, zero key material, the 6 s117 evidence frames present.

**Live parity re-verification (both hosts, agent-browser + DOM probes).** **No NEW parity gap; no Tailwind v4 mobile-nav bug — s118 re-confirmed (the 19th consecutive live confirmation).** Reference reproduced live: 24 links drawer-open, no `role=dialog`, the unlabeled hamburger, the reference's own `/Notes` overflow (416 > 390), landscape nav 992 > 290. Clone: 26 labeled links, the labeled drawer (`role=dialog` + aria-label), labeled hamburger + backdrop close at `blur(4px)` (the v4 `backdrop-blur-xs` pin), REAL Escape close, `/Notes` clean at 390, landscape 992 > 301, the sidebar 260 → 80 px collapse with 20/20 icon-only rail links titled. **Two auditor recommendations DISPROVEN by reference measurement** (the DOM-authority rule extends to audit findings — the S118 lesson-1, now in AGENTS): Q1 the `sf-slide-in` wiring (the reference drawer computes `transition: all 0s` — instant open IS parity; the fix became dead-code REMOVAL) and Q2 the scroll-to-top on navigate (the reference PERSISTS a 600 px scroll across drawer navigation — the clone matches; documented non-gap, no fix).

**The audit + the BS set** (two parallel deep audits against the `skills/web-application` rubrics, every finding verified by direct read + live probe; `docs/remediation-plan-session118.md`): **BS1** session revocation on password reset — the User model gains `sessionVersion Int @default(0)`, `createSessionToken(userId, sessionVersion)` embeds `v` in the HMAC payload, a MISSING `v` reads as 0 (deploy compat — pre-change cookies survive the deploy, only the bump revokes), `getCurrentUser` compares the claim against the column, the reset transaction increments it (a pre-reset cookie now dies at the reset — live-verified: the captured cookie replays to 401; e2e-pinned inside the reset journey). change-password/change-email keep their documented ADR-022/024 session-survives contracts (the owner-rotation paths). **BS2** bounded reads + bounded fields — the `readJson` 10 MiB cap (declared content-length pre-read + actual length → 400; the import route keeps its own 413), the shared `emailField` atom (trim + email + ≤200) replacing every bare `z.string().email()`, `jsonArray` ≤100k, the date atoms `Date.parse`-valid + ≤40 (garbage dates now 400, never a Prisma 500) with `optionalDate`'s `""`-clear leg carried independently of the tightened base (the S118 lesson-2 near-miss), `idField` ≤64, the mathSolve image ≤7M + the 5 MiB client picker gate. Live-verified (an 11 MiB login body → 400 before the read). **BS3** the upload rate limit — 20/15-min per-user, ONE shared bucket across BOTH file-link entry points (`POST /api/files` both branches + `POST /api/files/link`); live-verified with a scratch registered user (20 × 201 → the 21st 429 + Retry-After). **BS4** the drawer modal focus lifecycle — focus-in on open (the panel's close button), Tab contained with wrap at both edges, focus restored to the opener on close; the visual surface byte-identical (no animation, no geometry change); e2e-pinned. **BS5** one schema, both entry points — `linkFileSchema.name` trims before the checks (the AM1 convention; a whitespace-only name now rejected at BOTH) and the files POST's JSON branch consumes the shared schema (the hand-rolled divergent copy deleted, the folder-404 guard kept). **BS6** the CSV formula guard — `csvField` prefixes a leading `'` on `= + - @` tab CR. **BS7** the RUM dead twin reconciled — `validation.ts`'s schemas now carry the ROUTE's enforced bounds (navType free-string 1-40, path ≤500, UA ≤400, value ≤6M, events ≤20) and the route imports them. **BS8** the settings `holidays` pre-warm (the false "No holidays set" flash closed — re-verified live in the s118 frame session: the Holidays tab renders its 2 seeded rows, never the false empty state). **BS9** the boot `loadAll` gains `.catch(() => {})` — a failed boot fetch surfaces through the connectivity banner, never an unhandled rejection. **BS10** the collapse transition synced (`duration-200` on `main`, matching the rail). **BS11** the inert `sf-slide-in` class + orphaned keyframes + stale comment removed (the Q1 parity decision) + the export 10 MiB client pre-check. **BS12** the Info trio — reset-password rate-limited 10/IP/15 min (the last unthrottled auth POST closed), the "exactly 15 entries" comment → 16, the boot script consumes its own `var KEY` (a rename now fails the pin, never silently desyncs). The Info pair I1/I2 documented as non-gaps (the apiGet timeout design pass; the settings /me refetch).

**TDD discipline.** RED first: **18 failing pins across 4 files** (auth +3, validation +13, rum-diagnostics +2), then the source, then GREEN **963/963** (28 files) — the RUM event/batch pins re-shaped to the ENFORCED bounds (the old pins pinned dead code — no test weakened) and the theme-cache boot-script pin re-anchored to the var-KEY consumption. Guardrails held: no lint/type rule loosened, `noImplicitAny` on, the s117 e2e pins untouched.

**The standing suite (the honest sequence).** The first launch (the bare `nohup … &` form) was REAPED mid-stage-2 — the S110 lesson-1 live again (its security stage had already run, consuming the demo user's 20/15-min AI budget on the shared :3000 process). The double-fork orphan re-launch (the S110 remedy): **34/35** — the security stage alone failed, `AI-route limiter shape wrong: cutoffAt=1, statuses=429` — the DOUBLE-RUN PHANTOM (the S32 fixture-harvested class live: the killed run's own probe had pre-exhausted the in-memory budget the re-run's probe measures). Diagnosis by failure MODE (the S117 lesson-4 protocol): an assertion-mode finding whose mechanism is the per-process budget, not the code. A standalone re-run on the same process read `cutoffAt=16` (the suite's own ai-error/ai-a11y stages had consumed 5 within the window — the second consumption class, confirming the mechanism); a FRESH dev-server boot (the S32 recipe — the per-process limiter's documented single-instance nature) + the standalone re-run: **0 findings, 7 nonGaps — GREEN.** The standing suite: effectively **35/35** (the security stage green on the quiet fresh-boot re-run).

**Re-certification (all on the FINAL tree).** lint ✓ tsc ✓ (`noImplicitAny` on) unit **963/963** (28 files); the canonical build green; the cold 5-chunk e2e **478/478** (132+141+57+87+61 — chunk one +1 the BS4 drawer focus-lifecycle pin, chunk five +1 the BS2 oversized-body pin, BS1 rides the reset journey in-place); the BR1 import round-trip regression re-verified live (the demo export's 6 cards → import updated 6); `.env.example` verified current (tracked, matching the codebase contract — `DATABASE_URL="file:../db/custom.db"` with the db-path re-anchoring note, the AUTH_SECRET boot-guard posture, `E2E_PORT`); the s118 evidence frames captured to `docs/screenshots/` (118-ref-dashboard + 118-ref-mobile-drawer from the reference; 118-clone-dashboard, 118-clone-mobile-drawer, 118-clone-settings-holidays, 118-clone-files from the remediated tree — all 6 md5-distinct, DOM-verified states; the drawer frame's capture session itself re-verified the BS4 lifecycle live: open → focus on the close button, Escape → closed + focus restored to the hamburger). **Standing debt: ZERO.**

**Docs chain.** README badge 1441 + the Session-118 row; AGENTS commands 963/478 + the S118 lessons ×4; CLAUDE Unit-line seam tail S118/BS; vitest header 963; PAD v1.3.26 (the §6.4 post-reset-revocation + oversized-body + CSV-formula rows + the Upload-limiter amendment + the stale-title repair — the S117 cycle left the title at v1.3.24); the e2e-cert script census re-tag 478 (also repairing the S117 474-era Expected sum the cycle never re-tagged — the honest-re-tag convention); the main remediation-plan header → Batch BS; this entry; `docs/session_105.md` (the session record); `docs/remediation-plan-session118.md` (the plan + the execution record).

## Session-119 / Batch BT (Cycle 69) — 2026-10-31 — the audit-rider hardening cycle: the import-perimeter + bounded-reads + composer-parity set

**Workspace.** Refreshed at `fd9872a` (the Batch BS state + the operator's `docs/session_106.md` + `session_107.md` transcripts — the s118 session's raw logs; the session record `session_105.md` and the plan `remediation-plan-session118.md` rode the BS commits). The full doc chain re-read (AGENTS, CLAUDE, README, PAD, the SKILL doc, session_106/107, both remediation plans, the worklog — README/PAD/SKILL digested via two parallel read-only subagents) and re-validated against the tree.

**Baseline re-certified cold BEFORE any work.** lint ✓ tsc ✓ (`noImplicitAny` on) unit **963/963** (28 files); the canonical build green (the bundled-`.env` contract intact, the ADR-020 warning the only stderr); the cold 5-chunk e2e **478/478** (132+141+57+87+61 — fresh `db/e2e.db`); the register re-derivation **249/130/0-stale/119** (the 20th tripwire hold); the Mode-C audit of the Batch BS diff (`89f6f79` + `2f825eb`): 43 files / 1015 insertions, every BS1–BS12 claim verified TRUE against the tree (the page.tsx `transition-[margin]` bytes hex-verified again — the display artifact extends even into Python repr, now the AGENTS S119 lesson-3), zero key material, all six s118 frames present.

**Live parity (both hosts, agent-browser + DOM probes).** **No NEW parity gap; no Tailwind v4 mobile-nav bug — s119 re-confirmed (the 20th consecutive live confirmation).** Reference: unlabeled hamburger, no `role=dialog`, 24 links drawer-open, `/Notes` overflow 416 > 390 (its own defect), landscape nav 992 > 290, backdrop `blur(4px)`. Clone: labeled hamburger + drawer, 26 links, `/Notes` clean at 390, landscape 992 > 301, 20/20 titled rail links, the BS4 focus lifecycle re-verified with a REAL keyboard flow (burger `focus()` → Enter → focus on "Close menu" → Escape → closed + focus restored), scroll persistence 600px carried onto the 2584px /Analytics. **Four parity decisions settled by reference measurement (the DOM-authority rule):** P1 the reference's AI composer IS a `<textarea rows=2>` (measured: 60px, resize-none, "Ask me anything...") while its own Shift+Enter SENDS (its hint is aspirational) — **BT6 ships the reference's element AND honors the pinned hint's promise (element parity + behavior superset)**; P2 the reference's My Day zero-state greeting is itself an h3 → the heading-order recommendation is a documented NON-gap; P3 the reference's Timetable has no delete affordance in any measured state (no subjects on the probe account, the button census clean) → **BT9 is dead-code removal, not new UI**; P4 the reference has NO notebook-management surface → the clone's misplaced superset control is an INTERNAL fix (P4 measured live on the clone: the stray 130px right-edge flex child, editor pane squeezed to 458px).

**The audit + the BT set** (two parallel deep audits against the `skills/web-application` §5/§16 + §8/§9/§12/§13 rubrics, every finding verified by direct read + live probe; `docs/remediation-plan-session119.md`): **BT1** the import perimeter — the BR5 Content-Type gate shared to the import route (`assertJsonContentType`, one seam both body readers consume; a cross-site text/plain form POST can no longer ride the sameSite=lax cookie into the JSON parser) + the `sanitizeImportRow` per-row guard in the data-import seam (every value primitive-capped at 1M; the files rows' url http(s)-only-or-null — the stored `javascript:` href was the BR4 rule's unguarded THIRD entry point [files-view renders `href={file.url} target="_blank"`]; name trim/≤200, data ≤2.8M base64; wrong types → 400, Prisma validation errors mapped to 400 never 500; live-verified: the evil row → the actionable `files[0]` message, and the BR1 round-trip passes all 71 legit rows with zero false positives). **BT2** bounded reads everywhere — `readBytesCapped` counts the body chunk-by-chunk and ABORTS at the cap (the BS2 pre-read check was inert on `Transfer-Encoding: chunked` bodies; the post-read check fired only after `request.text()` had buffered everything); readJson, the import route, AND the multipart upload branch consume it (the branch re-wraps the bounded bytes in a Blob — byte-exact, binary-safe; the first draft text-decoded the multipart body and would have corrupted binary uploads — caught at implementation, the byte core + text wrapper split); live-verified: an 11 MiB chunked login body → 400 in 64ms. **BT3** the reset token's CONDITIONAL single-use consumption (`updateMany({ where: { id, usedAt: null, expiresAt > now } })` inside the transaction — the pre-BT read-then-write shape let two concurrent replays both pass the pre-check across the ~50–100ms scrypt window and both commit; live-verified: the parallel pair → exactly {200, 400}; e2e-pinned with the same pair on a fresh TEST-NET user). **BT4** the idField/emailField atoms exported and adopted at the six route-local schemas that hand-rolled their shapes (folders parentId ×2, generate-cards deckId, generate-questions subjectId, verify-email + resend-verification emails). **BT5** the boot guard's forgeable band — a production AUTH_SECRET under 16 chars is now FATAL (an offline-brute-forceable HMAC signing key never ships silently; 16–31 stays the documented warn band). **BT6** the composer (P1 above; the pinned hint parity-session5:576 becomes TRUE on the clone). **BT7** the calculator history panel's non-modal focus lifecycle (Escape closes, focus-in on open, focus-restore to the toggle — the BS4 pattern at disclosure weight; the S15 display-clear Escape mapping stays dormant while the panel is open, one press never does both). **BT8** the fetchAndSet per-key sequence guard (a monotonic ticket per collection — the Notes title per-keystroke PATCH was the live out-of-order trigger; unit-pinned with a controlled apiGet mock). **BT9** the Timetable fix (P3: the dead `remove()` + the decorative Trash2 glyph gone — its fake "Delete X" aria-label polluted the edit button's name; the first fix shipped a plain `aria-label="Edit X"` which the a11y sweep REJECTED — `label-content-name-mismatch`: an aria-label cannot contain the whole visible text [name + time + room] — re-shaped to name-from-content + a visually-hidden "Edit class" span, the Label-in-Name-correct pattern). **BT10** the Notes "Manage notebooks" block moved inside the left pane below the notebook filter (its own comment's claimed placement; the root row's visible children are exactly the two panes again, the editor pane back to full width — live-verified). **BT11** the note-title failures ride the once-per-streak autosave toast (was a silent `.catch(() => {})`; the success path also resets the streak). **BT12** the honest boot comment (the false "heals on the first view switch's loadCollections" claim corrected — navigate() loads nothing) + the flashcards mastery-PATCH toast + the calculator `=` catch split (an evaluation failure and a history-save failure toast their own messages). **BT13** `role="group"` completed at 31 aria-labeled div sites across 16 files (the focustimer precedent — the labels are live for AT now; all 20 views re-verified zero-violation). **BT14** four missing `dark:text-slate-400` pairs (the superset dark-mode internal-consistency standard). The I-level trio documented (the files bare-fetch message, the practicetests option keys, the Quill picker labels).

**TDD discipline.** RED first: **18 failing pins across 4 files** (env-check +2, http-body +9, import-row-guard +6 [the toThrow pins' spurious RED-passes resolved at GREEN], data-store +1), then the source, then GREEN **990/990** (31 files — http-body +9, import-row-guard +12, data-store +3, env-check +3 net). Guardrails held: no test weakened, no lint/type rule loosened, `noImplicitAny` on, the s117/s118 pins untouched.

**The honest mid-run corrections.** The first re-cert reported 3 failures: the BT11 pin asserted the source's FALLBACK message where the abort-path ApiError message wins (instance-message precedence, the autosave contract's own shape — the pin re-anchored to the actual offline message); the BT12 pin's mock returned a non-JSON 500 ("Request failed (500)" won the toast — the mock re-shaped to carry a JSON error body); and the a11y-sweep /Timetable failure was the BT9 first-draft aria-label (above). A fourth self-inflicted hazard: the cert script was EDITED WHILE RUNNING (the census re-tag landed mid-loop) — bash's lazy read re-parsed from shifted offsets, ran a phantom "CHUNK 6" (chunk 5's files re-passed on the aged db), and died at the `done` — the chunks 1–5 results stood (the loop body was parsed before the edit), and the re-cert was re-run cold on the final tree. The lesson is AGENTS S119 lesson-adjacent: never edit a running bash script; the census re-tag must land BEFORE the launch.

**Re-certification (all on the FINAL tree).** lint ✓ tsc ✓ (`noImplicitAny` on) unit **990/990** (31 files); the canonical build green (the bundled `.env` contract intact); the cold 5-chunk e2e re-cert **488/488** (133+142+60+89+64 — chunk 1 +1 the BT10 notes placement pin, chunk 2 +1 the BT9 timetable name pin, chunk 3 +2 the BT6 composer pins +1 the BT11 title-toast pin, chunk 4 +2 the BT7/BT12 calculator pins, chunk 5 +2 the BT1 perimeter pins +1 the BT3 concurrent replay pair — the census re-tagged in the cert script BEFORE the final launch, the lesson learned). The live curl battery on :3000: the text/plain import gate → 400; the `javascript:` files row → the actionable `files[0]` 400; the 11 MiB chunked login body → 400 at the cap in 64 ms; the concurrent reset pair → exactly {200, 400}; the BR1 import round-trip → 6 cards updated (the guard passed all 71 legit rows, zero false positives). The six s119 evidence frames captured (2 reference pre-change + 4 clone: the dashboard, the BT6 composer DOM-verified [textarea rows=2, 60px, "Ask me anything..."], the BT7 history panel DOM-verified [open + focused], the mobile drawer with the BS4 lifecycle verified — all md5-distinct). `.env.example` verified current (the AUTH_SECRET note updated for the BT5 forgeable band). The standing suite: a FRESH dev-server boot (the S32 recipe) + the preflight GREEN + the single run **32/35** — the three failures root-caused by the S117 lesson-4 protocol: ONE real defect, the S81 stage-locator-drift class live again — BT6's Input→Textarea swap broke three standing-suite stage scripts' raw `input[aria-label='Message the assistant']` CSS selectors (connectivity crashed at the fill; ai-error/ai-aaily carried the same selector AND fired into the dead :3000 window after the cwv co-residency stop restarted the dev server slower than the suite's health wait — the server did return healthy, the stages had already launched) — the 18 selectors across the three scripts repaired to the tag-agnostic `[aria-label=…]` form (the S112 lesson: the element TAG drifts, the label is the contract) and all three stages re-run QUIET on the healthy server: **GREEN — 0 findings each** (connectivity 7 nonGaps, ai-error 10, ai-aaily 4). The suite: effectively **35/35** post-repair. **Standing debt: ZERO.**
## Session-120 / Batch BU (Cycle 70) — 2026-11-01 — the parity-superset hardening cycle: the dialog-key + badge-family + off-switch set

**Workspace.** Refreshed at `da5942d` (the Batch BT state + the operator's `docs/session_109.md`/`session_110.md` transcripts — internal session 120; the prior context window was interrupted mid-GREEN [the build green, the standalone verification not yet run], this window re-derived the plan's item×tree matrix before finishing — the recovery itself the AP-126 lesson). The full doc chain re-read (AGENTS, CLAUDE, README, PAD, the SKILL doc, session_109/110, both remediation plans, the worklog) and re-validated against the tree.

**Baseline re-certified cold BEFORE any work.** lint ✓ tsc ✓ (`noImplicitAny` on) unit **990/990** (31 files); the canonical build green (the bundled-`.env` contract intact, the ADR-020 warning the only stderr); the cold 5-chunk e2e **488/488** (133+142+60+89+64 — the Playwright browser binary was missing in the fresh sandbox, an infrastructure class documented at S90; the first near-total failure was provision, not source debt); the register re-derivation **249/130/0-stale/119** (the 21st consecutive tripwire hold); the Mode-C audit of the Batch BT diff (`80298b5`): every BT1–BT14 claim verified TRUE against the tree, zero key material, all six s119 frames present.

**Live parity re-verification (both hosts, agent-browser + DOM probes).** **No NEW parity gap; no Tailwind v4 mobile-nav bug — s120 re-confirmed (the 21st consecutive live confirmation).** The standing reference battery held (the unlabeled hamburger, no role=dialog, 24 links, blur(4px), the /Notes overflow, the landscape nav scroll). FOUR reference measurements settled parity decisions (the DOM-authority rule): **F5** the reference's task delete runs IMMEDIATELY (no confirm — the clone's instant delete IS parity, documented non-gap); **P3** the dialog Cancel matrix is mixed (Exams/Classes carry Cancel on the reference, Events/Flashcards do not — the clone's three gaps closed); **P4a** the dashboard exam badge family is TODAY-only red "Today!" + the NEUTRAL slate far family (the clone shipped red for every distance); **P4b** the exams-view ≥2-days badge DRIFTED on the reference — the CURRENT site renders the BLUE family (measured blue-100/blue-600 on an 11-day exam) where the S76 measurement recorded yellow — the clone follows with the AA-superset blue-700 text (5.49:1 vs the reference's own 4.24:1). The **F1 FolderDialog bug reproduced live** (create Alpha → create Beta → Rename Alpha showed the STALE "S120 Folder Beta" — a silent-rename data hazard).

**The audit + the BU set** (two parallel deep audits against the `skills/web-application` §5/§16 + §8/§9/§12/§13 rubrics, every finding verified by direct read + live probe; `docs/remediation-plan-session120.md`): **BU1** the FolderDialog key-remount (verified live BOTH directions; e2e-pinned in resilience); **BU2** the in-band delivery off-switches (`inAppDeliveryGates`, DISABLE_IN_APP_OTP/RESET — the gated responses omit the code/resetUrl; the PAD §6.4 reopen trigger's off-switch, unit-pinned ×6); **BU3** the declared proxy-hop contract (`parseTrustedProxyHops`/`clientIpFromForwarded` — unset the legacy first hop, 0 never trust, N the Nth-from-right FAILING CLOSED on short/forged headers; unit-pinned ×14; the other §6.4 trigger closed); **BU4** the RUM upsert user-scoping (the unique widened to `@@unique([userId, sessionId, metric])`; e2e-pinned — user B's same sessionId+metric never touches user A's row); **BU5** the rum/export `take: 2000` (the AGENTS-documented cap now true in code); **BU6** the rate-limiter lazy sweep at the 2,048-bucket cap (+ the size observable and the drain seam); **BU7** the dashboard badges (TODAY-only red "Today!" + the neutral slate far family, the measured values + the superset dark pairs); **BU8** the `sf-pill-blue` utility (blue-100/blue-700 both pinned in @theme — closing the blue-900 unpinned consumer too; the AC7 pins re-anchored to blue; the hue-tokens census updated coherently — the AP-125 three-edit contract); **BU9** the three Cancel buttons (Exams/Assignments/Timetable); **BU10/BU11** the 51+8-site slate text dark-pair sweep + the machine guard (`tests/hue-pairs.test.ts`); **BU12** the True/False role="group"; **BU13** the expiry aria-live announcement; **BU14** the register uniform 200 (the 201/200 enumeration split closed); **BU15** `secureCookieFlag` (the DEPLOYMENT X-Forwarded-Proto instruction made true); **BU16** the security headers on every route — live-verified on the standalone production server (nosniff / X-Frame-Options: DENY / Referrer-Policy on /login AND the API routes; the AUTH_SECRET boot enforcement verified in the same smoke); **BU17** the polish set (the calculator unit-select ids, the flashcards Textarea primitive + entity-named icon buttons, the login reset-success on the emerald status channel, the rum-panel dark pairs); **BU18** the dead imports; **BU19** the cursor rule; **BU20** the eight unpinned palette steps pinned; **BU21** the SEED_DEMO fail-safe gate (live-verified both directions: SEED_DEMO=0 → skipped, users=0; unset → seeded, users=1; DEPLOYMENT.md §8 + §3 + .env.example — caught unimplemented at the docs phase after the prior window's interruption, closed TDD-style); **BU22** the smalls (the eventSchema endDate≥startDate refine via restructured create/update schemas — the Zod-4 `.refine()`-wraps-`.partial()` incompatibility avoided; the deckId comment; the expired-token pruning; the z-index scale documented in AGENTS Conventions; **`ignoreBuildErrors` REMOVED — the canonical build is now the type gate**, green exit 0).

**TDD discipline.** RED first: **40 failing unit pins** (client-ip +14, delivery-gate +6, secure-cookie +6, hue-pairs +2, seed-gate +5, auth eviction +2, validation ordering +5) + **9 e2e pins** (BU7 dashboard badges, BU9 Cancel ×3, BU1 rename prefill, BU13 expiry aria-live, BU14 register 200, BU16 headers, BU4 RUM scoping), every pin verified RED for the right reason, then the source, then GREEN. Guardrails held: no test weakened, no lint/type rule loosened, `noImplicitAny` on, the s117–s119 pins untouched.

**The honest mid-run corrections.** The first full cert was the stale-pin discovery pass — THREE old pins asserted contracts the BU changes superseded (the parity-session8 S8-B exam-row red badge → re-anchored to the measured slate far family with the "Today!" regex widened; the accessibility overdue-badge census, which found ZERO sf-pill-red on the seeded dashboard under BU7 → re-anchored to the self-owned-data shape [create → assert → finally-cleanup]; the auth-flows S15 reset-success `getByRole("alert")` → re-anchored to the role=status channel after BU17d). The AP-124 lesson: a measured-parity change must sweep the pin layer for the OLD measured values in the same change. The BU21 miss (the prior window's interruption) — the per-BU grep matrix at the docs phase is the resumed-session discipline (AP-126). The cert-script census re-tag was written but NOT applied to the running script (the S119 phantom-chunk lesson verbatim) — it landed after the DONE line.

**Re-certification (all on the FINAL tree).** lint ✓ tsc ✓ (`noImplicitAny` on) unit **1030/1030** (36 files — the census projection exact); the canonical build green (exit 0, the type gate live post-BU22e, the ADR-020 warning the only stderr); the standalone smoke (the three security headers on page AND API responses, the AUTH_SECRET boot enforcement, login validation + RUM auth live); the register tripwire **249/130/0-stale/119** — the exact hold, the expectation stated BEFORE the measurement; the cold 5-chunk e2e re-cert **497/497** (135+145+61+90+66, every chunk first-pass on the final tree); the live agent-browser battery (the mobile drawer 288px panel + navigation → auto-close, the F1 rename fix verified live both directions, the BU8 blue badges, the BU9 Cancel ×3, the scroll-persistence 590px carried through SPA navigation); the seven `docs/screenshots/120-clone-*.png` evidence frames (pixel-sane, DOM-verified states); `.env.example` verified current (DATABASE_URL / NEXT_PUBLIC_SITE_URL / AUTH_SECRET / SEED_DEMO / DISABLE_IN_APP_* / TRUSTED_PROXY_HOPS / E2E_PORT). **Standing debt: ZERO.**

**Docs chain.** README badge 1527 + the Session-120 row + the census lines; AGENTS commands 1030/497 + the S120 lessons ×4 + the z-index scale; CLAUDE Unit-line seam tail S120/BU; vitest header 1030; PAD v1.3.28 (+ the §6.4 rows: the two reopen triggers CLOSED, the RUM row closed, four new rows); the cert-script 497 census re-tag; the master remediation-plan header → Batch BU; the SKILL doc census + §18 re-measure + the AP-124..126 lessons; DEPLOYMENT.md §2/§3/§8; this entry; `docs/session_111.md` (the session record, titled "Session 121").

## Session-121 / Batch BV (Cycle 71) — 2026-11-01 — the audit-driven hardening cycle: the merge-guard + owned-FK + accent-token set

**Workspace.** Refreshed at `27be1d4` (the Batch BU state `92600b0` + the operator's `docs/session_112.md` transcript [the BU continuation's raw log] + the skills-catalog update — src/ untouched by the operator, diff-stat verified). The full doc chain re-read (AGENTS, CLAUDE, README, PAD, the SKILL doc, session_111/112, both remediation plans, the worklog — README/PAD + the SKILL doc/master plan digested via two parallel read-only subagents) and re-validated against the tree.

**Baseline re-certified cold BEFORE any work.** lint ✓ tsc ✓ (`noImplicitAny` on) unit **1030/1030** (36 files); the canonical build green (exit 0 — the type gate live post-BU22e, the ADR-020 warning the only stderr); the cold 5-chunk e2e **497/497** (135+145+61+90+66, fresh `db/e2e.db`, every chunk first-pass); the register re-derivation **249/130/0-stale/119** (the 22nd consecutive hold, the expectation stated before the measurement); the Mode-C audit of the Batch BU diff (`92600b0` + `27be1d4`): every BU1–BU22 claim re-verified TRUE against the tree (BU1 key-remount, BU2/BU3 seams, BU8 utility, BU21 gate, BU22e removed), zero key material, all seven `120-clone-*.png` frames present.

**Live parity re-verification (both hosts, agent-browser + DOM probes).** **No NEW parity gap; no Tailwind v4 mobile-nav bug — s121 re-confirmed (the 22nd consecutive live confirmation).** The standing reference battery held (the unlabeled hamburger, no `role=dialog`, 24 links drawer-open, `blur(4px)`, the `/Notes` overflow 416>390 [its own defect], the landscape nav 992>290, the F5 instant delete re-confirmed on a live probe task). THREE reference measurements settled parity questions (the DOM-authority rule): **N1** the repeat pill is MEASURED `rgb(237,233,254)/rgb(124,58,237)` = violet-100/violet-600 — the clone's light values byte-exact, the accent question clone-internal (the reference's picker is a no-op) → **BV15** resolved it the SubjectTagChip way (the token form); **N2** the note editor carries NO Cancel (Save + icon close — the s120 matrix extended, a non-gap); **N3** the reference's Focus Timer stats are a DIFFERENT anatomy (white bordered cards — the clone's StatCard grid is a superset surface, free to follow the accent). The clone battery GREEN: the labeled hamburger + drawer (`role="dialog"`, 20 links, 288px panel, navigation → /Analytics + auto-close), `/Notes` clean at 390, the landscape 992>301, the scroll persistence 600px carried through SPA navigation.

**The audit + the BV set** (two parallel deep audits against the `skills/web-application` rubrics — §5/§6/§7/§16 the API surface [3M/6L/8I], §8/§9/§12/§13 the frontend [1M/3L/7I]; every finding verified by direct read + live probe; `docs/remediation-plan-session121.md`): **BV1** the events single-leg ordering merge (BU22's guard fired only on both-legs — a single-leg PATCH wrote the inverted span; the `checkEventOrderingMerge` seam + the delegate's `beforeWrite` hook, Date/string normalized — the first live probe caught the string-fixture/Prisma-Date gap, closed with a Date-fixture pin + a WIRE-level e2e pin); **BV2** the logout-side Secure derivation (BU15 fixed the SET path only — a plain-HTTP production logout answered a Secure clear Set-Cookie browsers DROP, the 7-day session survived "logout"; the clear now mirrors `secureCookieFlag`, live-verified symmetric with login); **BV3** the four BU env gates wired through docker-compose (SEED_DEMO on init, TRUSTED_PROXY_HOPS/DISABLE_IN_APP_* on the app service — DEPLOYMENT.md §8's commands were no-ops through compose); **BV4** the null-body 500s (register + preferences, live-verified 400/no-op); **BV5** the questions blob bound at 100k; **BV6** the re-register password refresh (the newly typed password was silently discarded — e2e-pinned end-to-end on a fresh TEST-NET user); **BV7** the owned-FK guards in the delegate factory (`ownedFks` + the `OWNED_FKS` census registry — a foreign subjectId/listId/notebookId 404s "That X does not exist."; TEN delegates wired, the census pin keeps a new FK-bearing delegate from shipping unwired); **BV8** the resend prune; **BV9** the limiter HARD cap (the all-live flood evicts the oldest bucket at 2,048 — the map bounded even under forged-XFF flooding); **BV10** Date.parse ordering (a mixed-offset ISO string can sort later as a string while being EARLIER in time); **BV11** the OTP's conditional single-use consumption (the BT3 pattern on the verify family — the concurrent pair yields exactly {200, 400}, e2e-pinned) + forgot-password supersession (one live reset link per account); **BV12** the comma-joined proxy header; **BV13** a documented NON-GAP (the audit's vision-branch `timeoutMs` recommendation was a TYPE ERROR — the SDK body type carries no such field, TS2353 at the guard experiment; the shipped omission was correct); **BV14** the schema comment; **BV15** the accent-token family (the 17-var accentCssVars set with the solid `--sf-primary-empty` — the AP3 triangle updated coherently: the interface + seven literals + seven boot-script lists, the value-equal `empty`≡`emptyFrom` pair the AO5 way; the new `sf-repeat-pill` utility renders the reference's MEASURED violet pill through the accent tokens — byte-identical at violet [re-measured `rgb(237,233,254)/rgb(124,58,237)` post-fix], accent-following elsewhere; the StatCard fallback `bg-sf-primary`; the calendar today-cell tint accent-aware for free through the token — live-verified under blue LIGHT and DARK [pills blue-100/600 + blue-950/300, tiles blue-500] AND at violet byte-parity, the before/after pairs photographed md5-distinct); **BV16** the dead-import sweep extended + the MACHINE GUARD (`noUnusedLocals`/`noUnusedParameters` in tsconfig — the audit's 8 by hand + 13 more the compiler surfaced [four dead `requireUser` imports in the AI/math routes among them], now enforced by typecheck AND the canonical build); **BV17** the three non-unique keys (analytics workload by id, MC options by value-index, members by email-name-index); **BV18/19** the comment drifts (the globals.css trap-13 mechanism, the stale files.ts reference) + the never-caching week memo. The non-gaps documented: the tasks-view instant delete (F5 measured), the no-Cancel dialogs (the s120 matrix + N2), the bare envelope, the force-dynamic posture.

**TDD discipline.** RED first: **21 failing unit pins** (event-merge +11, validation +2, secure-cookie +3, auth +1, clear-cookie +3, owned-fks +3) + **4 failing e2e pins** (BV6, BV11a, BV7 ×2), every pin verified RED for the right reason. GREEN: unit **1030 → 1054** (39 files — plus the BV1 Date-fixture leg and the theme pin's value-equal pair, both added during the honest corrections); e2e **497 → 502** (135+147+62+90+68). Guardrails held: no test weakened, no lint/type rule loosened — the type rules STRENGTHENED (BV16).

**The honest mid-run corrections (four).** (1) The BV5 pin's own wrapper arithmetic (39 chars, not 44 — the boundary assertion failed on the pin's construction; re-derived with a wrap-length self-check). (2) **The BV1 string-fixture gap — caught by the LIVE PROBE, not the pins**: the seam's unit pins passed on string fixtures while the delegate passes the stored Prisma row (Date objects) — the `typeof` guard silently skipped and the first curl probe wrote the inverted span; closed with the `epochMs` normalization + a Date-fixture unit pin + a wire-level e2e pin, and the mid-run cert was killed/rebuilt/re-run cold (the S119 doctrine). (3) The BV13 audit recommendation was a type error the guard experiment caught (above). (4) The AP3 triangle — the token addition to accentCssVars alone went RED at the S89/AP3 + S90/AQ1 pins; the complete three-site edit landed (the S121 lesson 4 / AP-129 family).

**Re-certification (all on the FINAL tree).** lint ✓ tsc ✓ (`noImplicitAny` + `noUnusedLocals`/`noUnusedParameters`) unit **1054/1054** (39 files); the canonical build green (exit 0, the type gate live); the cold 5-chunk e2e re-cert **502/502** (135+147+62+90+68 — every chunk first-pass on the final tree); the register tripwire **249/130/0-stale/119** — the exact hold (no new playwright scripts this cycle); the live curl battery on :3000 (the null bodies → 400/200-no-op never 500, the events single-leg inversion → 400 both directions + the legal move 200, the foreign subjectId → 404 "That subject does not exist.", the logout Set-Cookie symmetric with login — no Secure over plain http, Secure behind the proxy header); the live agent-browser battery (the mobile drawer family, the scroll persistence, **the BV15 accent re-theme verified BOTH ways** — blue light+dark and violet byte-parity); the six `docs/screenshots/121-*.png` evidence frames (the before/after blue-accent pairs md5-distinct, the dashboard, the mobile drawer); `.env.example` verified current (no new env vars — BV3 wired compose only). **Standing debt: ZERO.**

**Docs chain.** README badge 1556 + the Session-121 row + the census lines; AGENTS commands 1054/502 + the S121 lessons ×4 + the ownedFks convention + the unused-code guard note; CLAUDE Unit-line seam tail S121/BV + the 17-var set; vitest header 1054; PAD v1.3.29 (the revision block + the census anchor); the cert-script 502 census re-tag (AFTER the DONE line — the S119 lesson); the master remediation-plan header → Batch BV; the SKILL doc census + the AP-127..129 lessons; DEPLOYMENT.md §2/§8 (the compose passthroughs true); this entry; `docs/session_113.md` (the session record, titled "Session 122").

---

## Session-122 / Batch BW (Cycle 72) — the audit-driven hardening cycle: the race-class + solver-persistence + title-debounce set

**Date:** 2026-11-01 · **Workspace:** refreshed clone at `ffbca0f` (the Batch BV state `a332384` + the operator's `docs/session_114.md` transcript) · **Plan + execution record:** `docs/remediation-plan-session122.md` · **Session record:** `docs/session_115.md`.

**Baseline (cold, BEFORE any work).** lint ✓ · tsc ✓ (`noImplicitAny` + the unused guards) · unit **1054/1054** (39 files) · the canonical build green · the cold 5-chunk e2e **501/502** — chunk 1's `S120/BU9` Add-Exam-Cancel pin FAILED, reproduced 4/4 in isolation and root-caused by TRACE to the non-retrying before-count racing the pre-warm completion (the count ran ~160 ms before the `/api/exams` response landed; the count happened during the Splash — the S16 pre-warm contract itself HOLDS; the pin had raced green for two cycles on timing luck) · the register re-derivation **249/130/0-stale/119** (the 23rd consecutive hold, stated before the measurement) · the Mode-C audit of the Batch BV diff: **17/17 substantive claims TRUE** (zero key material; the six `121-*.png` frames present; the unit census confirmed live), with two claim-text drifts noted (BV1's seam lives in `entities.ts:118`, not the plan's `validation.ts` — folded into BW4's docs pass; the screenshot count is six, not seven).

**Live parity re-verification (both hosts, agent-browser + DOM probes).** **No NEW visual parity gap; no Tailwind v4 mobile-nav bug — s122 re-confirmed (the 23rd consecutive live confirmation).** The standing reference battery held (the unlabeled hamburger, no `role=dialog`, 24 links drawer-open, the 288px drawer panel — reference-measured this cycle, backdrop `blur(4px)`, the `/Notes` overflow 416>390 [its own defect], the landscape drawer-nav scroll 992>290). The clone battery GREEN: the labeled hamburger + drawer (`role="dialog"`, `aria-label="Navigation menu"`, 20 nav links, the 288px `w-72` panel, the labeled backdrop at `blur(4px)`, navigation → /Analytics + auto-close), `/Notes` clean at 390, the scroll persistence 600px carried Dashboard → /Analytics. TWO reference measurements settled parity decisions (the DOM-authority rule): **N1** the note title persists on SAVE ONLY (fetch+XHR instrumented: ZERO saves across 10+ s of typing — the clone's per-keystroke PATCH storm was the deviation → **BW3** resolved it the superset way, the debounced autosave); **N2** the Math Solver renders NO history chrome at zero (re-measured live, consistent with the s70 zero-state probe) while the s72 cycle measured its POPULATED Recent Problems — the clone rendered an unconditional heading + an INVENTED false-promise empty copy AND never persisted solves (the route wrote no rows — the feature was dead) → **BW2** resolved both halves. Probe residue: zero on the reference (the note probe deleted through its own immediate-delete flow).

**The audit + the BW set** (two parallel deep audits with ROTATED coverage — the BV cycle had just deep-covered the surfaces it fixed; this cycle's fresh eyes went to the AI/math routes, files/folders, calculator/RUM/settings/holidays, the import/export seams, the delegate factory's remaining edges, the schema/seed, and the §14/§15 unpinned-guarantee lens [API: 0C/0H/2M/5L/4I] + the e2e test layer itself as a codebase, the calculator/math-solver/AI-assistant views, quill-editor + notes, the auth sub-screens, shared.tsx + the SVG charts, and the export/rum panels [frontend: 1H/3M/4L/4I]; every finding verified by direct read + live probe; `docs/remediation-plan-session122.md`): **BW1** the immediate-read-after-`hydrated()` race class (the boot-script wait resolves PRE-PAINT during the Splash — THREE BU9 instances [Exams: the cert's red; Assignments + Timetable: latent twins] + the MyDay conditional-guard vacuous-pass variant + the day-15 deselect's once-a-month deterministic failure [the calendar's onClick SETS the selection — there is no toggle-off] + the s14 D1/D2 unroute leaking its held request to the real server + the a11y sweep's pre-data DOM; all closed with the AP-96 visibility gates, a today-independent computed target, the held-route ABORT before unroute, and a networkidle settle after the headline gate); **BW2** the Math Solver persistence (the solve route now mirrors the chat route's two-row `surface:"solver"` `$transaction` written ONLY on success; the view renders the section ONLY with history — the reference's measured zero-state; S5-AB6 flipped to the zero-state absence; a REAL-solve populated pin [retry-once on a 502, trailing DELETE cleanup] covers both halves); **BW3** the note-title per-keystroke PATCH storm + snap-back (a key-remounted `NoteTitleInput` child owning a local draft + a 600 ms debounce — the editor's own rhythm — flushing on note switch [the unmount flush, the QuillEditor symmetry], on explicit Save [an imperative handle], with the BT11 failed-rename streak contract preserved verbatim; the parity-session7 "debounced title PATCH" comment is now TRUE, its waitForTimeout upgraded to a deterministic waitForResponse); **BW4** the import `$transaction`'s missing 60 s timeout (Prisma's 5 s interactive default could P2028→500 a legitimate large envelope — the option added; the PAD ADR-021 text reconciled to the shipped findFirst+update/create semantics + the shared error mapper); **BW5** the calculator history bounded (GET take-500 newest-reversed + a per-user retention trim on write — the ai/messages + rum family form, no user-visible failure mode); **BW6** the assistant reply capped at write (`capPersistedContent` 100k — the note-content precedent; the only unbounded persisted field at the AI boundaries); **BW7** the timetable ordering guard (the events BU22/BV1 family on the hhmm atoms: create/update schema checks + the single-leg `checkTimetableOrderingMerge` merge through the delegate's `beforeWrite`; **the live probe caught the SEED's unpadded legacy hours** — `startTime: "9:00"` written past the Zod boundary, and `"11:00" < "9:00"` lexicographically rejected every LEGAL move — the comparison is minutes-since-midnight normalized, pinned with the unpadded-legacy + malformed-legacy unit legs + a wire-level e2e pin); **BW8** the import FK twin-maps drift hazard closed (the route consumed hand-maintained REQUIRED_FKS/OPTIONAL_FKS twins while the seam's IMPORT_FK_MAP carried the unit-pinned copy — the route now consumes `IMPORT_REQUIRED_FKS`/`IMPORT_OPTIONAL_FKS` DERIVED from IMPORT_FK_MAP, single source, derivation-pinned); **BW9** the OTP paste distribution (a pasted 6-digit code fills all six boxes left-to-right and focuses the next — browsers clip a paste to maxLength=1 and the in-band delivery makes paste the dominant entry path); **BW10** the Quill image gate (the measured snow toolbar kept; the default unbounded base64 image handler replaced with a 60 KB size gate + toast — the editor no longer permits content the 100k note-content schema rejects); **BW11** the two unpinned 413 wire guards pinned (the files 2 MiB multipart over-cap with its copy + the import 10 MiB over-cap); **BW12** the ai.ts helper seams unit-pinned (withDeadline/extractAssistantContent/extractJsonBlock + the BW6 cap boundary — the only lib seam family with zero direct pins); **BW13** the hygiene set (the multipart filename bound at 200 — the JSON branch's contract; the seed early-return disconnect; the export panel's friendly malformed-backup copy; the GPA id counter replacing the Date.now collision). Documented non-gaps: the reference's Save-only note persistence (the debounced autosave is the superset), the zero-solver-history chrome at zero (now MATCHED), the bare envelope, the force-dynamic posture, the in-process limiter + no-crud-bucket posture.

**TDD discipline.** RED first: **17 failing unit pins** (timetable-merge +12, ai-helpers +15-import-failure, import-maps +2) + **4 failing e2e pins** (BW2 ×2 [the zero-state absence + the populated card], BW3 [8+ PATCHes on char-by-char typing], BW9 [the paste fills one box with the LAST digit]), every pin verified RED for the right reason; the Exams BU9 pin's live red WAS BW1's evidence. GREEN: unit **1054 → 1085** (41 files); e2e **502 → 508** (135+148+66+90+69). Guardrails held: no test weakened, no lint/type rule loosened — the lint gates SHAPED the implementation twice (the set-state-in-effect gate rejected the effect-synced title draft → the BU1 key-remount child; the react-hooks/refs gate rejected the render-time latest-ref write → the AH1 effect-time form).

**The honest mid-run corrections (four).** (1) The BW3 pin's final assertion missed AH8a's Date.now() in the note title (the regex widened to match both segments). (2) **The BW7 merge's first form compared hhmm STRINGS — the live probe caught the unpadded-seed row rejecting every legal move** ("11:00" < "9:00" lexicographically — the seed writes past the Zod boundary); closed with minutes normalization + two unit pins (the BV1 Date-fixture lesson's hhmm sibling: pin the SEED's shapes, not only the wire's). (3) The NoteTitleInput's first draft used a set-state-in-effect — the lint gate caught it; rewritten as the key-remounted child. (4) **A tooling artifact retracted**: the agent toolchain's OUTPUT pipeline silently strips bracket-letter sequences (`[m`, `[h` observed) — a phantom "corrupted `transition-argin]` class" finding was disproven by CHAR CODES (`transition-[margin]` is correct, computed `transition-property: margin / 0.2s` verified live); AP-130 records the rule (bracket-bearing evidence is re-read as char codes before it becomes a finding) — two probe harnesses were corrupted by the same artifact before the check exposed it.

**Re-certification (all on the FINAL tree).** lint ✓ tsc ✓ (`noImplicitAny` + `noUnusedLocals`/`noUnusedParameters`) unit **1085/1085** (41 files); the canonical build green; the cold 5-chunk e2e re-cert **508/508** (135+148+66+90+69 — every chunk first-pass); the register tripwire **249/130/0-stale/119** — the exact hold (no new playwright scripts this cycle); the live curl battery (the timetable inverted create → 400 with the ordering copy, the single-leg inversion → 400 both directions, the legal move → 200 **on the legacy unpadded row**, the calculator GET newest-reversed ordering); the live agent-browser battery (BW2's zero + populated states photographed, the BW3 debounced typing e2e-pinned); the five `docs/screenshots/122-*.png` evidence frames (the solver zero + populated pair, the notes editor, the dashboard, the mobile drawer); `.env.example` verified current (no new env vars — the diff carries none). **Standing debt: ZERO.**

**Docs chain.** README badge 1593 + the Session-122 row + the census lines; AGENTS commands 1085/508 + the S122 lessons ×4; CLAUDE Unit-line 1085 + the S122 seam tail; vitest header 1085 (41 files); PAD v1.3.30 (the revision block + the ADR-021 reconciliation); the cert-script 508 census re-tag (AFTER the DONE line); the master remediation-plan header → Batch BW; the SKILL doc census + AP-130; this entry; `docs/session_115.md` (the session record, titled "Session 123").

## Session-123 / Batch BX (Cycle 73) — the audit-driven hardening cycle: the both-legs-guard + per-account-OTP-cap + datetime-round-trip set

**Date:** 2026-11-01 · **Workspace:** refreshed clone at `d5e6130` (the Batch BW state `728dbf5` + the operator's `docs/session_116.md` transcript) · **Plan + execution record:** `docs/remediation-plan-session123.md` · **Session record:** `docs/session_117.md`.

**Baseline (cold, BEFORE any work).** lint ✓ · tsc ✓ (`noImplicitAny` + the unused guards) · unit **1085/1085** (41 files) · the canonical build green · the cold 5-chunk e2e **508/508** (135+148+66+90+69, every chunk first-pass — run per-chunk in the foreground: the sandbox reaps daemonized processes between tool calls, so each chunk replicated the cert script's exact kill→fresh-db→run procedure) · the register re-derivation **249/130/0-stale/119** (the 25th consecutive hold, the expectation stated BEFORE the measurement) · the Mode-C audit of the Batch BW diff: **13/13 substantive claims TRUE** (BW1's visibility gates ×3 + networkidle + the s14 abort, BW2's two-row transaction + zero-state hide, BW3's NoteTitleInput, BW4's 60 s timeout, BW5's HISTORY_WINDOW 500, BW6's cap wired, BW7's normalized merge, BW8's derived maps, BW9's paste, BW10's 60 KB gate, BW13's hygiene — plus the five `122-*.png` frames, the vitest header census, zero key material in the diff).

**Live parity re-verification (both hosts, agent-browser + DOM probes).** **No NEW visual parity gap; no Tailwind v4 mobile-nav bug — s123 re-confirmed (the 24th consecutive live confirmation).** The standing reference battery held (the unlabeled hamburger, no `role=dialog`, 24 links drawer-open, the 288px panel, backdrop `blur(4px)` on the TRUE `bg-black/20 backdrop-blur-sm` layer — a wrapper element with an inherited 20px filter must not be mistaken for the backdrop, the measurement-precision note; the `/Notes` overflow 416>390, the landscape nav scroll 992>290). The clone battery GREEN: the labeled hamburger + drawer (`role="dialog"`, `aria-label="Navigation menu"`, 20 nav links, the 288px `w-72` panel with `max-w-[85vw]`, the backdrop BUTTON `bg-black/20 backdrop-blur-xs` at `blur(4px)`), navigation → /Analytics + auto-close, `/Notes` clean at 390, the scroll persistence 600px carried. **A reference observation recorded:** the reference's demo DATA has drifted from the original snapshot the clone's seed mirrors (its Flashcards view lists no seeded decks — an `S79 Probe Deck` survives from Session-79) — data-shaped reference probes are no longer authoritative; chrome-level measurements remain so (the S123 lesson-3 doctrine). Probe residue: ZERO on both hosts (this cycle's reference probes were read-only; the clone's timetable/folder probe rows deleted and verified gone).

**The audit + the BX set** (two parallel deep audits with ROTATED coverage — the BW cycle had just deep-covered the surfaces it fixed; this cycle's fresh eyes went to the auth family + the delegate factory + all 26 entity shells + the schema/seed with the seed-past-Zod lens + the http seam [API: 0C/0H/2M/2L/8I] + the data layer, the layout chrome, the 15 rotated views, the UI primitives, and the charts [frontend: 0C/1H/3M/7L/9I]; every finding verified by direct read, the M/H items wire-verified or live-verified; `docs/remediation-plan-session123.md`): **BX1** the timetable BOTH-LEGS ordering guard compared raw strings (the S122/BW7 half-finished class — the atom admits UNPADDED hours, so the legal "9:00"→"11:00" span FALSELY 400'd and the inverted "09:00"→"8:30" mix PERSISTED [both wire-verified on the dev server: 400 + 201]; the seeded rows also opened the edit dialog with a BLANK start input — `<input type="time">`'s HTML value sanitization blanks a non-HH:MM value [live-verified]; every enforcement site now routes through the exported `hhmmMinutes` single source [the schema checks AND the entities.ts merge], `normalizeHhmmForInput` pads legacy rows on edit-populate, and the seed pads its times — the normalizer keeps old rows working); **BX2** the per-account OTP attempt cap (verify-email's only brake was the per-IP limiter whose key is client-forgeable in the default TRUSTED_PROXY_HOPS-unset posture, and a correct guess SIGNS THE CALLER IN — a 10/15-min per-USER budget now fires after the lookup, answering the SAME uniform 400 when exhausted [never a distinguishable 429: a per-account 429 would be a WORSE account-existence oracle]; e2e-pinned by the correct-code-after-10-wrongs lockout); **BX3** the exam/event datetime round-trip (the edit dialogs populated the UTC WALL-CLOCK via `slice(0,16)` and submitted the TZ-less datetime-local string raw — the server re-anchored it in ITS zone, drifting the stored instant by the UTC offset on every untouched edit cycle on any non-UTC host, invisible in the all-UTC dev/e2e environment [the "dev server lies" class]; `toDatetimeLocalValue`/`fromDatetimeLocalInput` now own both boundaries in the user's zone — the tasks-view local-noon pattern — unit-pinned on the TZ-INDEPENDENT round-trip property); **BX4** the register verified-existing fast path burns the dummy scrypt (the ~50-100 ms timing enumeration asymmetry vs the hashing branches — the BR3 equalizer precedent, guarded by BU14's existing uniform-200 pins); **BX5** the folder routes' `parentId` adopts the shared exported `nullableId` atom (the route-local twin's ""→null transform was DEAD CODE — idField's min(1) rejected "" first, so the clear-to-root convention every other entity FK honors 400'd at the folder routes; wire-pinned 201 + the null round-trip + cleanup); **BX6** the focus timer records the ELAPSED duration on early manual complete (was the NOMINAL 25:00 — every focus stat silently inflated; the auto path at remaining===0 unchanged, the schema's min-1 floors a sub-second complete; e2e-pinned <1500 with the trailing DELETE cleanup); **BX7** the practicetests hygiene pair (stable `crypto.randomUUID()` draft ids — the BV17 index-key class with mid-list removal and focusable rows; the countdown zero-detection moved out of the `setSecondsLeft` updater into the effect shape — the focustimer pattern, the S120/BU13 expiry pin preserved through the real 60 s clock); **BX8** the deck-row highlight follows the fallback selection (`effectiveDeckId` — after deleting the selected deck NO row was highlighted while decks[0]'s cards rendered; e2e-pinned with API-created probe decks, zero seeded residue); **BX9** the exams duration + assignments progress number inputs hold STRINGS in form state, parsing on submit (the mid-typing snap-back — clearing coerced to 60/0 instantly; e2e-pinned on the cleared field reading ""); **BX10** the hygiene set (the myday stale "pattern shared with TasksView" comment corrected — Tasks is instant-delete BY PARITY [the S120 measurement; MyDay's confirm is the superset choice]; the study-group members read-modify-write reads the store's FRESH state at mutation time; the touch-target parity exception documented [the reference's 24-28px icon controls — visual parity wins]; the reference-data-drift doctrine recorded); **BX11** the docs-drift set (README's stale 502/1030 census lines; PAD §8.1's three-epochs-stale Total row [49 files/1133 → 71 files/1615] + §8.4's 258+/290+ checklist; **ADR-003's "30-day TTL" reconciled to the shipped 7-day `SESSION_TTL_MS`**; ADR-020's weak-secret band reconciled to BT5's <16-FATAL/16-31-WARN; the SKILL doc's stale 497 chunk map; the full limiter census documented at ADR-003 [resend=10/IP among them]). Documented non-gaps this cycle: the no-Cancel events/flashcards dialogs (the S120 measured matrix — "Events/Flashcards do not"), the tasks instant delete (the S120 measurement — only MyDay's comment was wrong), the loading-boolean race (cosmetic-transient; the fetchSeq ticket protects data), the reference-inherited seed demo-data quirks (biology cards in "Integration rules" — the seed mirrors the original snapshot), the unindexed SQLite-scale FK columns, and the RUM non-transactional loop (self-healing on beacon retry).

**TDD discipline.** RED first: **13 failing unit pins** (validation 8 — the BX1 both-legs family ×3 [the legal-unpadded leg failed with the production ZodError itself, the strongest red] + the helper family ×3 + the nullableId ×2; date 5 — the BX3 round-trip family) + **7 failing e2e pins** (BX1-edit, BX9, BX8, BX6, BX2, BX1-wire, BX5 — every one verified RED for the RIGHT reason: the blank "09:00" input, the "0" snap-back, the border-transparent row, the exactly-1500 duration, the 200-on-correct-code, the false 400, the dead-transform 400) + BX3's exam-edit wiring pin GREEN-on-arrival in the UTC suite (the BW11 coverage-pin style — the drift itself is code-verified and seam-pinned on the TZ-independent property). GREEN: unit **1085 → 1099** (41 files); e2e **508 → 516** (136+151+69+90+70 — the plan's per-chunk projection exact). Guardrails held: no test weakened, no lint/type rule loosened.

**The honest mid-run corrections (five, all pin-side).** (1) The BX9 pin's first locator named a non-existent "New Assignment" button (the real label is "Add Assignment" — the 45 s timeout was a wrong-reason red, re-verified for the right one). (2) The BX1-edit pin's end-time expectation came from the DEV db's older seed ("11:00") while the e2e seed's Calculus II ends "10:30". (3) The BX1-wire pin demanded the BARE merge copy where the schema path legitimately carries the Zod field prefix ("endTime: …") — `toContain` now accepts both enforcement sites' shapes. (4) The BX8 pin asserted the WRONG ROW — the fallback highlights decks[0] (a seeded deck; the probe decks were appended), so the pin asserts the first row carries the selected class AND the probe row does not. (5) A BX3 unit pin expected "" for a date-only ISO that `Date` legitimately parses (UTC midnight — the formatter renders it; the pin now pins the parse behavior instead of inventing a rejection).

**Re-certification (all on the FINAL tree).** lint ✓ tsc ✓ (`noImplicitAny` + `noUnusedLocals`/`noUnusedParameters`) unit **1099/1099** (41 files); the canonical build green (the ADR-020 warning the only stderr); the cold 5-chunk e2e re-cert **516/516** (136+151+69+90+70 — every chunk first-pass); the register tripwire **249/130/0-stale/119** — the exact hold (no new playwright scripts this cycle; the expectation stated BEFORE the measurement); the live curl battery (the unpadded-legal create → 201 [was the false 400], the inverted mix → 400 with the ordering copy [was 201], the folder parentId "" → 201 [was 400], the probe rows deleted); the live agent-browser battery (the LEGACY dev-db "9:00" row opening its edit dialog at "09:00" — the normalize on a real legacy row; the exam create→edit round-trip showing the entered local time); the five `docs/screenshots/123-*.png` evidence frames (the timetable legacy edit, the exam round-trip, the dashboard, the mobile drawer, the focus timer — non-blank-verified); `.env.example` verified current (no new env vars — the diff carries none). **Standing debt: ZERO.**

**Docs chain.** README badge 1615 + the Session-123 row + the census lines (incl. the two stale spots the doc digests surfaced: the 502 test:e2e comment + the 1030 File-Hierarchy line); AGENTS commands 1099/516 + the S123 lessons ×4 (the both-legs guard family, the oracle-free per-account budget, the reference-data-drift doctrine, the datetime wire format) + the touch-target exception + the reference-measurement doctrine in Conventions; CLAUDE Unit-line 1099 + the BX seam tail; vitest header 1099 (41 files); PAD v1.3.31 (the revision block + the ADR-003 7-day TTL reconciliation + the ADR-020 band + §8.1's re-measured Total row + §8.4's checklist + the full limiter census); the cert-script 516 census re-tag; the master remediation-plan header → Batch BX; the SKILL doc census + the §11 map fix + AP-131; this entry; `docs/session_117.md` (the session record, titled "Session 124").

## Session-124 / Batch BY (Cycle 74) — the audit-driven hardening cycle: the gradeLevel-clear + export-cap + hydration-gate set

**Date:** 2026-11-01 · **Workspace:** refreshed clone at `4176367` (the Batch BX state `d7364b6` + the operator's `docs/session_118.md` transcript) · **Plan + execution record:** `docs/remediation-plan-session124.md` · **Session record:** `docs/session_119.md`.

**Baseline (cold, BEFORE any work).** lint ✓ · tsc ✓ (`noImplicitAny` + the unused guards) · unit **1099/1099** (41 files) · the canonical build green · the cold 5-chunk e2e **516/516** (136+151+69+90+70, every chunk first-pass — run per-chunk in the foreground, the sandbox reaps daemonized processes) · the register re-derivation **249/130/0-stale/119** (the 26th consecutive hold, the expectation stated BEFORE the measurement; the calibrated instrument: repo files importing `playwright` exactly — `from "playwright"`) · the Mode-C audit of the Batch BX diff (`d7364b6`, 41 files, +1305/−102): all substantive claims re-verified TRUE (BX1's `hhmmMinutes` single source at every enforcement site + the seed padding + `normalizeHhmmForInput`; BX2's `verifyAcct` per-account cap after the lookup; BX3's datetime-local round-trip helpers owning both boundaries; BX4's dummy-scrypt burn; BX5's shared `nullableId`; BX6's elapsed recording; BX7's randomUUID + pure-countdown updater; BX8's `effectiveDeckId`; BX9's string state; BX10's hygiene; +14 unit pins; the five `123-*.png` frames; zero key material).

**Live parity re-verification (both hosts, agent-browser + DOM probes).** **No NEW visual parity gap; no Tailwind v4 mobile-nav bug — s124 re-confirmed (the 25th consecutive live confirmation).** The standing reference battery held at 390×844 (the unlabeled hamburger [accessible name null, 36px], no `role=dialog` drawer-open, 24 visible links, the 288px `w-72` panel, the backdrop `blur(4px)` on the true `lg:hidden fixed inset-0 bg-black/20 backdrop-blur-sm z-50` layer, the `/Notes` overflow 416>390) and at 844×390 (the landscape drawer-nav scroll 992>290). The clone battery GREEN: the labeled hamburger (`aria-label="Open navigation menu"`, 36px — the a11y superset) + drawer (`role="dialog"`, `aria-label="Navigation menu"`, 20 nav links, the 288px `w-72` panel with `max-w-[85vw]` computing 331.5px, the backdrop BUTTON at `blur(4px)`), navigation → /Analytics + auto-close, `/Notes` clean at 390 (scrollWidth 390 = 390), the scroll persistence 600px carried Dashboard → /Analytics. Probe residue: ZERO on both hosts.

**The audits + the BY set** (two parallel deep audits with ROTATED coverage — the BX cycle deep-covered the auth family + the delegate factory + the entity shells + the schema/seed + the http seam [API] and the data layer + the layout chrome + the views + the primitives + the charts [FE]; this cycle's fresh eyes went to the platform-services family — settings/preferences, the RUM routes, export/data, calculator/history, health, the site/sitemap contract, the boot chain, the transport seams, the FULL 18-site rate-limiter census [API: 0C/0H/3M/3L/6I] — and the design-system core — globals.css end-to-end, the theme/store lifecycle, the Quill render paths, the a11y contracts, the oldest specs' assertion quality [FE: 0C/0H/2M/6L/2I]; every finding verified by direct read, the M items re-read at the code level; `docs/remediation-plan-session124.md`): **BY1** the gradeLevel clearable form (the Study Profile card's "Not set" mapped to `undefined` — JSON.stringify drops the key, the route's sent-keys filter skips it, the bare enum 400'd `""`: a user picked "Not set", saved, got the success toast, and the stored grade SILENTLY PERSISTED until a reload snapped the select back; the schema gains the `z.union([enum, ""])` clearable form [the DB column's natural `""` state, the schoolName convention in the same card], the UI sends `""`, unit + wire + live-verified through the reload with `me` reading `""`); **BY2** the db-path production gate (the Turbopack-mangled fallback fired for ANY absolute `file:` URL missing on disk — including a production boot whose operator skipped `db:push`, silently opening the SEEDED dev database; now environment-gated via the explicit `nodeEnv` parameter, dev/test only — in production the missing absolute target passes through and fails LOUDLY downstream, DEPLOYMENT §4 form-2's promise now true); **BY3** the export/import size reconciliation (the import capped at 10 MiB while the export emits base64 file payloads INLINE — ~4-5 max-size uploads made the user's OWN backup unrestorable in-app with no warning at export time; `IMPORT_MAX_BYTES` 10 → 25 MiB [~18 max-size files' base64 + content], the panel's client pre-check now reads the SAME constant [its own 10 MiB hardcode had already drifted], the between-caps acceptance e2e-pinned, the BW11 over-cap pin re-anchored + the MiB copy leg); **BY4** the RUM contract doc sync (AGENTS' "nearest-rank over the last 200 events" → the shipped `take: 500`; the trends shape "the ≤ 20 most recent values" → the 7-UTC-day-bucket series, each sampled day the day's NEWEST sample; the route's stale "daily mean" comment corrected); **BY5** the export-family limiter (`export:${user.id}` 10/15-min after requireUser, ONE shared key on BOTH export GETs — the two heaviest enumerations join the S14 posture; wire-pinned: 10 GETs then the 11th 429s AND rum/export 429s on the same budget); **BY6** the RUM trends null-gap semantics (unsampled days fabricated literal 0s — a 0 CLS reads as a GOOD score, so the sparkline looked great on idle days, a display lie on the owner panel; the series construction extracts to the pure `buildTrends` seam, gaps are null, the panel's finite filter drops them — the seam-to-seam contract unit-pinned; the UTC-day bucket documented as the chosen single-owner semantics); **BY7** the hydration-gate fleet swap (the `--sf-primary !== ""` wait used ~21× across 16 spec files as the "wait for hydration" gate — but the pre-paint boot script sets the var BEFORE first paint, true at t=0, proving nothing; the repo documents this itself; replaced by the HydrationMarker contract `data-app-hydrated` — set on the shell COMMIT, which per ADR-014 happens only after auth AND the active view's initial collections resolve, so it IS the data gate; the five-view overflow pin's compensating 900 ms sleep DELETED; the gotoDark route-universality correction rides correction 4); **BY8** the checked-checkbox print-exact (AGENTS' S12 print contract claims coverage on "the checked checkboxes" — the code carried none: PriorityCheckbox's checked branch is an accent fill + a WHITE glyph, so print stripped both and checked/unchecked printed identically as bare circles; `sf-print-exact` joins the branch, e2e-pinned under print emulation); **BY9** the avatarEmoji vocabulary at the boundary (`z.string().max(8)` accepted ANY ≤8-code-point string — an arbitrary string stored + rendered as the avatar while the picker is unit-pinned to 24 emojis; now the vocabulary refine + the `""` clear form, unit + wire pinned); **BY10** the popstate drawer close (the store's popstate listener set `view` only — hardware/browser Back with the drawer open swapped the view UNDER the open drawer; the listener now also closes it, e2e-pinned); **BY11** the skip-link gating (the anchor rendered in the splash/error branches where `<main id="main-content">` does not exist — activating it focused nothing); **BY12** the dead `sf-focus` utility removed (zero consumers repo-wide; the SKILL doc described it as load-bearing — both synced to the real `focus-visible:ring-*` convention); **BY13** the forced-colors picker restoration (the S12 block covered exactly its documented set; the Settings theme/accent/avatar tiles, the dialog color pickers, the timer mode/preset rows, and the practice answers marked selection purely with fills — invisible under Windows HC; container-scoped selectors only [the Appearance tab, the labeled groups, `[role=dialog]`], the bare-aria-pressed doctrine honored, e2e-pinned on the accent tile's `Highlight` outline); **BY14** the s4o probe residue note (the registered-but-never-deleted probe account documented in-spec — it can never self-delete through the public API, the AB4 aged-scratch doctrine); **BY15** the comment-hygiene set (the S5-D pins' byte-correct values relabeled NEUTRAL-200/950 [not gray]; button.tsx's "the neutral ramp is unpinned" — it IS pinned since S120; globals.css's clock-date comments calling violet-900 "violet-950"; the timetable `zIndex: 1` local-exception note); **BY16** the docs-drift set (README:109's "508" — the one census line BX11's fix missed + the pre-BT5 boot band + 16.4.0 [package.json: ^16.4.2, the S83 bump] + the wrong clone URL [`omni-study.git` → `omni-study1.git`] + "Six accent themes" [ACCENTS has 7]; PAD:624 ADR-022's "30-day session cookie" — the sibling BX11 missed [the shipped TTL is 7 days] + §1.2's version cells [16.4.2, Tailwind 4.3.3] + §8.1's era-grouped distribution rows REGENERATED as a per-file script-derivable table + §12's Lines column re-measured + §6.4's OTP row [+ the BX2 per-account cap] and register row [+ the BX4 equalizer] + the dangling "§14 anchors" citation + the stale screenshots annotation; the SKILL doc's nine drift items [the ^16.1.1 cell, the 16→18 Radix pkgs, the same clone URL, the vitest include, the entities.ts line-count dropped, the six missing special routes, the Task shape's `done` → `completed`, the 834+299 footnote reconciled to §11's 302 map, AP-132 added]). Dismissed as documented non-gaps: the API I-items (the client-trusted per-event RUM rating — the documented field-data convention; no default client timeout on apiGet/apiSend — the AI surfaces pass explicit timeouts; RumEvent's unbounded rows — the documented scratch-cleanable posture with capped reads; the RUM GET samples/total naming), the UTC-day trends bucket (documented as the chosen semantics), and the reference's own defects.

**TDD discipline.** RED first: **8 failing unit pins** (validation 3 [the BY1 "" leg failing with the production ZodError itself, the strongest red + the BY9 accepted-today legs] + db-path 1 [the BY2 production leg RECEIVING the silent dev-DB redirect — the exact defect class] + rum-diagnostics 4 [the missing-export family, the BX3 style]) + **8 failing e2e pins** (BY1-wire, BY9-wire, BY8, BY13, BY10, the re-anchored BW11 copy leg, BY3-between, BY5 — every one verified RED for the RIGHT reason) + two coverage/no-regression legs GREEN-on-arrival by design (the db-path dev-correction leg, the panel seam-to-seam gap-tolerance leg). GREEN: unit **1099 → 1113** (41 files); e2e **516 → 523** (137+153+71+92+70). Guardrails held: no test weakened, no lint/type rule loosened (the RumAggregate type widened to `(number | null)[]` with a type-predicate filter — the honest narrowing, not a cast).

**The honest mid-run corrections (six, all pin-side or gate-side).** (1) The BY3 pin's padding first rode an unknown ROW field — `sanitizeImportRow` caps EVERY string field (unknowns included, the BR1 guard), so the leg 400'd on the row guard; the padding moved to the envelope's documented IGNORED user block (the byte-count mechanism at the capped read is shape-independent — the RED reason unchanged). (2) The BY8 filter button's accessible name is "Filter tasks: Active", not "Active" (the error snapshot's page arbiter). (3) The BY10 describe sat outside the file's beforeEach describe — the page never navigated (the 45 s blank-page timeout was a wrong-reason red). (4) The BY7 swap over-reached `gotoDark` — the appHydrated marker never fires on the NON-SHELL /rum route (the AU3b pin hung at the gate); the helper's gate returned to the route-universal `.dark` observable (itself post-hydration: setMode PATCHes the record without the client cache, so the boot script paints the stale LIGHT theme and only loadFromUser resolves the class — the honest gate for BOTH route classes; the marker stays the gate for the shell-only waits). (5) The s20 sparkline pin's visibility assertion moved to the chart container — the single-value flat line (`points="0,16 100,16"`, the seam's documented promotion, confirmed PRESENT in the runner's trace DOM snapshot) has a zero-HEIGHT element box: painted and user-visible, but Playwright's toBeVisible requires a non-empty bounding box. (6) The plan's §3 said "+6 = 522" while listing 7 pins — corrected to +7 = 523 before the cert. Plus one environment note: the dev daemon accumulated stale Turbopack state mid-session (the panel stuck on Loading — the S9 lesson re-hit); the S32 restart recipe resolved it and the live probes were re-run against the fresh daemon.

**Re-certification (all on the FINAL tree).** lint ✓ tsc ✓ (`noImplicitAny` + `noUnusedLocals`/`noUnusedParameters`); unit **1113/1113** (41 files); the canonical build green; the cold 5-chunk e2e re-cert **523/523** (137+153+71+92+70 — every chunk first-pass on its final-tree run: chunks 4 + 5 each needed one corrected re-run [the gotoDark gate, the sparkline re-anchor] and both re-runs were themselves first-pass); the register tripwire **249/130/0-stale/119** — the exact hold (the 27th consecutive, the expectation stated BEFORE the measurement; the scratch diagnostic script deleted before the derivation so the register stays clean); the live curl battery (the gradeLevel set → clear → me `""` → restore; the avatar 400 with the actionable copy; the export family 10 × 200 then 429 + the shared-key rum/export 429; the 12 MiB between-caps import → 200 + `created: 1` + DELETE cleanup + residue verified 0); the live agent-browser battery (BY10's Back-with-drawer-open → closed + URL followed; BY1's "Not set" surviving the reload; `data-app-hydrated` observed live); the five `docs/screenshots/124-*.png` evidence frames (the dashboard, the mobile drawer, the settings grade, the rum sparkline, the settings appearance — non-blank-verified); `.env.example` verified current (the diff carries no new env reads). **Standing debt: ZERO.**

**Docs chain.** README badge 1637 + the Session-124 row + the census lines + the five drift fixes (the 508 line, the boot band, 16.4.2, the clone URL, Seven accents); AGENTS commands 1113/523 + the S124 lessons ×4 (the clearable-form contract, the route-class gate lesson, the export/import single-source lesson, the environment-gated dev-guard lesson) + the RUM contract sync + the conventions (the settings vocabulary contracts, the export limiter + the import cap, the z-map inline exception); CLAUDE Unit-line 1113 + the BY seam tail + the e2e line 523; vitest header 1113 (41 files); PAD v1.3.32 (the revision block + the ADR-022 7-day reconcile + the version cells + §8.1's per-file regenerated table + §12's re-measured Lines + the threat-model rows + the limiter census + the dangling-citation fix + the screenshots note); the cert-script 523 census re-tag; the master remediation-plan header → Batch BY; the SKILL doc census + the nine drift fixes + AP-132 + the focus-convention sync; this entry; `docs/session_119.md` (the session record, titled "Session 125").

## Session-125 / Batch BZ (Cycle 75) — the audit-driven hardening cycle: the auto-select-guard + write-budget + popover-keyboard set

**Date:** 2026-11-01 · **Workspace:** refreshed clone at `37d29cd` (the Batch BY state `09d3054` + the operator's `docs/session_120.md` transcript) · **Plan + execution record:** `docs/remediation-plan-session125.md` · **Session record:** `docs/session_121.md`.

**Baseline (cold, BEFORE any work).** lint ✓ · tsc ✓ (`noImplicitAny` + the unused guards) · unit **1113/1113** (41 files) · the canonical build green · the cold 5-chunk e2e **523/523** (137+153+71+92+70, every chunk first-pass — run per-chunk in the foreground, the sandbox reaps daemonized processes) · the register re-derivation **249/130/0-stale/119** (the 27th consecutive hold, the expectation stated BEFORE the measurement; the calibrated instrument: repo files importing `playwright` exactly) · the Mode-C audit of the Batch BY diff (`09d3054`, 59 files, +1571/−234): all substantive claims re-verified TRUE (BY1's gradeLevel union + the UI `""` send; BY2's nodeEnv-gated Turbopack fallback; BY3's 25 MiB shared constant; BY5's shared `export:` key on both GETs; BY6's null-gap seam + the type-predicate filter; BY7's appHydrated gate across 16 spec files + the HydrationMarker; BY8's print-exact checked checkbox; BY9's AVATAR_EMOJIS vocabulary; BY10's popstate drawer-close; BY11's skip-link gating; BY12's sf-focus removal; BY13's container-scoped forced-colors pickers; the five evidence frames; zero key material).

**Live parity re-verification (both hosts, agent-browser + DOM probes).** **No NEW visual parity gap; no Tailwind v4 mobile-nav bug — the 26th consecutive live confirmation.** The standing reference battery held at 390×844 (the unlabeled hamburger [accessible name null, 36px at [17,14]], no `role=dialog` drawer-open, the 288px panel, the backdrop `blur(4px)` on the true layer, the `/Notes` overflow 416>390) and at 844×390 (the landscape drawer-nav scroll 992>290). **Drift recorded (chrome-level):** the reference drawer now carries exactly **20 nav links** — the historical "24 links" standing pin reflected drawer chrome (a footer/profile section) the live reference has since removed; the clone's 20 links are the CURRENT exact parity set (current measurements authoritative, the S123 doctrine extended to the reference's own chrome evolution). The clone battery GREEN: the labeled hamburger + drawer (`role="dialog"` + label, 20 links, the 288px `w-72` panel with `max-w-[85vw]` computing 331.5px, the true backdrop layer at `blur(4px)` — `bg-black/20 backdrop-blur-xs` computing `oklab(0 0 0 / 0.2)`, the trap-7 serialization), navigation → /Notes + auto-close, `/Notes` clean at 390, the scroll persistence 600px carried Dashboard → /Analytics, the BY10 popstate close re-verified (pushState → back → closed + URL followed). Probe residue: ZERO on both hosts.

**The audits + the BZ set** (two parallel deep audits with ROTATED coverage — the BY cycle deep-covered settings validation, db-path, the export/import pair, the RUM family, print/forced-colors, the mobile popstate, the skip link; this cycle's fresh eyes went to the FE VIEW layer + the client data seams — every view component, shared.tsx, data.ts/store.ts/api.ts, the ui primitives [**0C/1H/3M/3L/1I**] — and the API route family beyond the BY surfaces — the delegate factory end-to-end, the auth/session machinery, the 16 factory routes' schemas, folder-tree/group-members helpers, the rate-limiter census, prisma/schema [**0C/0H/1M/3L/4I**]; every finding verified by direct read; the H finding reproduced live in the DOM AND at the wire; `docs/remediation-plan-session125.md`): **BZ1** the flashcards auto-select silent no-op (**HIGH** — the Add Card + AI Generate guards read the raw `selectedDeckId` while the S123/BX8 render model auto-selects the first deck via `effectiveDeckId`: with ≥1 deck and no explicit click, submitting the Add Card dialog did NOTHING — verified live: the dialog stayed open, no toast, no card, and the wire confirmed NO POST fired; both guards + the create/generate payloads now read `effectiveDeckId`; e2e-pinned + live-verified end-to-end); **BZ2** the practice-tests AI call site joins the 120 s deadline family (the only `z-ai-web-dev-sdk` call site without `timeoutMs` — `apiSend` sets NO AbortSignal otherwise, so a hung backend disabled the Generate button forever; + the `isTimeoutError` branch, the flashcards twin); **BZ3** the manage-notebooks surface converts DropdownMenu→Popover (the Rename/Delete buttons were nested inside `role="menuitem"` — a WAI-ARIA nested-interactive violation: menu arrow-keys focused the ITEM, Tab CLOSED the menu, both actions mouse-only; the popover keeps the menu's exact geometry classes, the actions are real tab stops, Escape closes and restores focus — live-verified: open → focus lands on Rename Lecture Notes → Tab → Delete Lecture Notes → Escape closes; the BT10 placement pin untouched); **BZ4** the duplicate-member removal removes ONE (duplicates are schema-legal [BV17's index key] but the removal filtered by email alone — one X removed EVERY member sharing the address in one write; the `removeOneMember` seam [group-members.ts, unit-pinned] removes exactly the first (email, name) composite occurrence — live-verified: one removed, the sibling survives); **BZ5** the factory write budget (`write:${user.id}` 600/15-min, ONE shared key on all 16 `makeCollectionRoutes` POSTs, after auth + BEFORE readJson — the S118/BS3 bounded-writes doctrine reaching the CRUD family; an authenticated script grew the single-node SQLite at line rate [noteSchema.content alone is 100 KB/row]; PATCH/DELETE stay unthrottled — bounded by existing rows, the next-cycle candidate); **BZ6** the grade score≤maxScore ordering guard (900/100 persisted and rendered 900% — the events BU22+BV1 pattern with the zod4-default amendment: `gradeCreateSchema.check()` owns the create [the injected default denominator IS the honest create state — a bare 900 is honestly "900 of the default 100"], while the UPDATE path owns NO schema check because `.partial()` INJECTS the maxScore default [the S81 lesson] — the `checkGradeRangeMerge` beforeWrite seam owns EVERY PATCH combination through one effective-pair compare [sent leg wins, stored leg fills]; the new tests/grade-merge.test.ts is the 42nd unit file); **BZ7** the folder re-parent TOCTOU closed (the cycle check read the chain then updated non-atomically — two concurrent A→B/B→A PATCHes both passed the pre-write snapshot; read-check-update now inside `db.$transaction`); **BZ8** the files/link metadata shape (the link create returned the FULL row while files POST's JSON leg returns the S82/AI6 `select: FILE_METADATA`; `FILE_METADATA` moved to `src/lib/server/http.ts` — route files cannot export shared symbols under Next's route-type validation; files/link now carries the select, e2e + curl verified [201, no `data` key]); **BZ9** the register P2002 race answers the uniform 200 (two concurrent same-email registrations: both passed the findUnique, the loser's create threw P2002 → 409 "That record already exists." — the exact enumeration oracle S120/BU14 closed, re-opened in the millisecond window; the loser now answers the verified-exists branch's uniform `{ok:true}` [no code leg: the loser's token was never stored]); **BZ10** the calculator-history trim transaction (count→skip→deleteMany was non-transactional and the `createdAt desc` same-millisecond ties made the skip-trim nondeterministic — it could trim a NEWER row while keeping an older twin; `$transaction` + the `id` tiebreak); **BZ12** the flashcard-schema comment rewritten (the deckId claim described a nested route that never existed — the flat route reads body deckId); **BZ13** the factory `list` bounded (`take: 500` — the ai/messages asc+take convention; the export route's own 20 findManys verified independent, the completeness contract untouched); **BZ14** the dead note-rename variant removed (all three setDialog sites enumerated: `{kind:"note", editing:NoteRow}` was unreachable — titles rename via the BW3 debounced inline input; the DialogState type narrowed, the branch + the "Rename note" title leg dropped); **BZ15** the dead `formatClockShort` export removed (zero consumers); **BZ16** the FilesView boot-fetch loader dedup (the identical two-GET pair duplicated in `refresh()` + the mount effect — one `loadFileRows()` loader now feeds both, the set-state-in-effect lint contract intact). **BZ11 RETRACTED — no change shipped** (the audit's two "corrupted server log tags" were display-pipeline artifacts: the hex dump + byte-constructed searches proved `[health]`/`[math/solve]` byte-correct since birth — the first "byte-verification" PRINTED the region via python repr, which renders through the same bracket-eating pipeline as the finding; the AP-130 artifact class extends to repr "verifications" — now AGENTS S125 lesson 1 + AP-133). Dismissed as documented non-gaps: FE-I1 (the boot refetches the pre-warmed collections — seq-guarded, correctness holds, 5 duplicate requests once per boot), the export's own unbounded enumeration (the completeness contract, by design), the register-dummy-burn family (the BX4 equalizer already shipped).

**TDD discipline.** RED first: **11 failing unit pins** (validation 4 [the gradeCreateSchema inverted pair, the legal pair, the 900/1000 heavy case, the bare-900 defaulted-denominator rejection] + grade-merge 7 [the missing-export family: the score-only rejection, the maxScore-only rejection, the both-legs-inverted rejection, the legal single-leg, the legal both-legs, the title-only no-op, the legacy non-numeric skip] + group-members 3 [the removeOneMember one-occurrence, the composite disambiguation, the no-match no-op]) + **6 failing e2e pins** (BZ1 — the dialog stayed visible, the silent no-op reproduced; BZ3 — no `role=dialog` [the menu rendered role=menu]; BZ4 — the call log showed 2 rendered → click → 0 [the email filter removed BOTH]; BZ6 — the inverted pair 201'd; BZ8 — the response carried `data: null`; BZ5 — 620 iterations all-201, never tripped) — every RED verified for the RIGHT reason (two pin-side corrections to get there: the about:blank create-fetches + the legacy-pin fixture). GREEN: unit **1113 → 1127** (42 files — grade-merge is the 42nd); e2e **523 → 529** (139+157+71+92+70). Guardrails held: no test weakened, no lint/type rule loosened; tsc's `noUnusedLocals` caught the BZ14/BZ15 dead code's last references (the machine guard working).

**The honest mid-run corrections (six — two pin-side, one source-side, one retraction, one test-infra design, one pin-side locator).** (1) The BZ3/BZ4 create-fetches ran inside `page.evaluate` at about:blank — relative URLs need a real origin; both pins gained the leading goto + re-goto (the AL1b convention). (2) The scripted entities-import edit injected `GRADE_SCORE_ABOVE_MAX`/`gradeCreateSchema` into the WRONG import block (the regex matched the first `import {` — the group-members block); the merge threw empty-message ValidationErrors; rewired + re-run green (the unit layer caught it in seconds). (3) The grade-merge legacy pin sent the SCORE leg (numeric, overriding the stored string) — the non-numeric stored leg must be the one the effective-pair falls back TO; the pin now sends maxScore. (4) **BZ11 retracted** (above — the phantom log-tag finding; the honest record: the retraction shipped zero change and the verification rule became a lesson + AP-133). (5) **The BZ5 exhaustion pin's first design spent the DEMO budget** — reasoning "s14 is the chunk's last file" from the CLI list order, but playwright runs spec files ALPHABETICALLY: s14 ran BEFORE tasks.spec and 429'd six later tests (the golden paths + both BV7 owned-FK probes — the mid-flight-collision class). The fix: FRESH-USER isolation (the s25 TEST-NET register convention; the login REPLACES the per-test jar's cookie, later specs get fresh jars) — the demo user is never mutated and the placement constraint disappears (now AGENTS S125 lesson 2). (6) The BZ1 locator's strict-mode flake: the seed writes its three decks with same-millisecond `createdAt` ties, so `decks[0]` is random per seed — when the 0-card "Spanish Vocabulary" won the tie its empty grid rendered a SECOND exact-name "Add Card" CTA beside the header's (~50% of chunk runs; 6/6 green alone because every alone-run re-rolled the same lucky order); `.first()` (the header button is DOM-first; both open the same dialog) made the pin order-agnostic (now AGENTS S125 lesson 3) — chunk 2 then verified green TWICE on consecutive fresh seeds.

**Re-certification (all on the FINAL tree).** lint ✓ tsc ✓ (`noImplicitAny` + `noUnusedLocals`/`noUnusedParameters`); unit **1127/1127** (42 files); the canonical build green; the cold 5-chunk e2e re-cert **529/529** (139+157+71+92+70 — every chunk first-pass on the final spec set; chunk 2 verified twice for the seed-order flake; chunk 1 re-run on the final tree); the register tripwire **249/130/0-stale/119** — the exact hold (the 28th consecutive, the expectation stated BEFORE the measurement); the live curl battery (BZ6: the inverted pair 400 with the copy verbatim, the legal pair 201, the single-leg shrink 400, cleanup 200; BZ8: 201, no `data` key, has `name`, cleanup 200); the live agent-browser battery on the fresh S32 daemon (BZ1: dialog closes + the card renders + POST 201 at the wire + the cleanup DELETE 200 — the exact probe that reproduced the silent no-op pre-fix; BZ3: the keyboard walkthrough open → Rename focused → Tab → Delete → Escape closes; BZ4: one duplicate removed, the sibling survives; the mobile drawer battery re-run GREEN); the six `docs/screenshots/125-*.png` evidence frames (the mobile dashboard, the mobile drawer open, the desktop dashboard, the notes manage popover, the flashcards auto-select, the studygroups members — non-blank-verified programmatically); `.env`/`db/` contract verified current (`DATABASE_URL="file:../db/custom.db"`, `db/` at the repo root, `.env.example` matching). **Standing debt: ZERO.**

**Docs chain.** README badge 1656 + the Session-125 row + the tree/testing census lines; AGENTS commands 1127/529 + the S125 lessons ×4 (the display-artifact verification rule, the alphabetical-file-order/fresh-user budget lesson, the seed-tie position-flake lesson, the zod4-default cross-field lesson) + the conventions (the write-budget family + the bounded list + the grade-guard merge pattern); CLAUDE Unit-line 1127 + the e2e line 529; vitest header 1127 (42 files); PAD v1.3.33 (§12's globals.css re-measured 1002, §8.4's floors 1127+/529+, §6.3's session shape + `v`, §3.2's annotated tree REGENERATED end-to-end, §8.1's changed rows + the Total re-measured, the rejected version-cell claim documented [the lockfile pins zod 4.6.5/playwright 1.63.0 — the digest subagent's 4.6.7/1.64.1 was a misread]); the cert-script Expected re-tag (139+157+71+92+70 = 529 + the BZ block); the SKILL doc's twelve drift fixes (taskDelegate, the db-path 18, the sf-shimmer-only keyframe, the hydration-recipe → appHydrated ×2, ten traps, the notes FAB pointer 877, the census header 1656, the sf-canvas hex quote, the dev-dev typo, the AccentToken 17 fields [the digest said 15 — the honest count is 17], AP-116's path, the health payload) + AP-133; the master remediation-plan header → Batch BZ + the §5 execution record; this entry; `docs/session_121.md` (the session record, titled "Session 126" per the established offset).

## Session-126 / Batch CA (Cycle 76) — the audit-driven hardening cycle: the transcript-window + shared-validator + print-chrome set

**Date:** 2026-11-02 · **Workspace:** fresh clone at `77205a4` (the Batch BZ state `48d8877` + the operator's `docs/session_122.md` transcript; the sandbox had been reset — `.env` re-created from the current `.env.example`, the dev db re-pushed + re-seeded, chromium re-provisioned) · **Plan + execution record:** `docs/remediation-plan-session126.md` · **Session record:** `docs/session_123.md`.

**Baseline (cold, BEFORE any work).** lint ✓ · tsc ✓ (`noImplicitAny` + the unused guards) · unit **1127/1127** (42 files) · the canonical build green · the cold 5-chunk e2e **529/529** (139+157+71+92+70, every chunk first-pass — after the fresh-sandbox chromium re-provision; the first attempt failed on the missing browser, 138 instant `browserType.launch` errors, the infrastructure-failure class) · the register re-derivation **249/130/0-stale/119** (the 29th consecutive hold, the expectation stated BEFORE the measurement; the calibrated instrument: repo script files importing `playwright` exactly) · the Mode-C audit of the Batch BZ diff (`48d8877`, 37 files, +1509/−185): all substantive claims re-verified TRUE (BZ1's effectiveDeckId guards + payloads; BZ2's timeoutMs + isTimeoutError; BZ3's Popover; BZ4's removeOneMember; BZ5's write budget; BZ6's grade guard pair; BZ7's $transaction; BZ8's FILE_METADATA; BZ9's P2002 uniform 200; BZ10's trim transaction; BZ12's comment; BZ13's take:500; BZ14/BZ15/BZ16's removals; zero key material).

**Live parity re-verification (both hosts, agent-browser + DOM probes).** **No NEW visual parity gap; no Tailwind v4 mobile-nav bug — the 27th consecutive live confirmation.** The standing reference battery held at 390×844 (the unlabeled hamburger [name=null, 36px at [17,14]], no `role=dialog`, the 288px panel, the backdrop `blur(4px)` on the true layer, exactly 20 links, the `/Notes` overflow 416>390) and at 844×390 (the landscape drawer-nav scroll 992>290). The clone battery GREEN: the labeled hamburger + drawer (`role="dialog"` + label, 20 links, the 288px `w-72` panel with `max-w-[85vw]` computing 331.5px, the true backdrop layer at `blur(4px)` — `bg-black/20 backdrop-blur-xs` computing `oklab(0 0 0 / 0.2)`, the trap-7 serialization), navigation → /Notes + auto-close, `/Notes` clean at 390, the scroll persistence 600px carried Dashboard → /Analytics, landscape 992>301. Probe residue: ZERO on both hosts.

**The audits + the CA set** (two parallel deep audits with ROTATED coverage — the BZ cycle deep-covered the FE view layer + client data seams + the API route family; this cycle's fresh eyes went to the app shell + routing + design tokens + auth screens — layout.tsx, page.tsx, the full globals.css token surface, router.ts, the mobile-chrome/sidebar/connectivity/nav-items shell family, the login surface's five sub-screens, theme.ts, the store's boot lifecycle [**0C/0H/2M/7L/3I**] — and the persistence + crypto/auth core + infrastructure configs — schema.prisma in full, seed.ts, auth.ts end-to-end, db-path, server/ai.ts, next.config/Dockerfile/compose/eslint/tsconfig/postcss/components/vitest/playwright, health/robots/sitemap, the export + import route INTERNALS [**0C/0H/2M/6L/5I**]; every finding verified by direct read; `docs/remediation-plan-session126.md`): **CA1** the AI transcript window (**M** — the GET's `asc + take: 500` served the OLDEST 500 rows: past 500 rows every post-send refresh REPLACED the store with a stale window and the just-sent exchange vanished while remaining in the DB and the export; the calculator form on the GET [desc + take + reverse + the id tiebreak] + the shared `persistTranscriptPair` in `server/ai.ts` owning BOTH write sites [explicit pair timestamps, the assistant row +1 ms — same-millisecond pair ties impossible] + the 500-row retention trim, the calculator mirror; e2e-pinned via a 505-row import on a fresh TEST-NET user); **CA2** the import row-id single source (**M** — the route's inline twin of the seam's validator had dropped the empty-id guard: an `id: ""` row minted a row no detail route could address while the unit-pinned seam copy REJECTED it, the false-assurance twin; ONE exported `importRowIdError` serves both call sites — the BW8 single-source doctrine extended from the FK maps to validation rules; the null-collection leg aligned to the seam's reject-not-skip contract; e2e + unit pinned); **CA3** the mobile chrome print guards (**M** — the print stylesheet hid only `aside`, and the fixed `lg:hidden` app bar printed at portrait paper width where the lg: query stops applying [the e2e print family's structural blind spot — it ran at desktop viewports]; `print:hidden` on the app bar + the offline pill, e2e-pinned on the mobile viewport); **CA4** the auth view-transition focus (**M** — every sub-screen swap unmounted its trigger and dropped focus to `<body>` with no announcement [WCAG 2.4.3/4.1.3, the axe-blind class]; the incoming heading carries `tabIndex={-1}` + focus on every CHANGE, the initial mount skipped; live-verified signin→signup→signin→forgot); **CA5** the factory list windows (**L** — the BZ13 `asc + take: 500` selected the OLDEST window on all 16 collection routes, the B-M1 class generalized; the newest-window form + the id tiebreak everywhere `createdAt` orders [the calculator GET + all 20 export findManys]; e2e-pinned via the 505-task import); **CA6** the seed deck mapping repair (**L** — the biology cards [ATP/Enzyme/Krebs] lived in the calculus deck "Integration rules" and the Spanish cards [airport/viajar] in "Biology Chapter 5" while the Spanish deck sat empty — the `[0,0,0,0,1,1]` indices corrected to the content's `[0,1,1,1,2,2]`; PLUS explicit distinct deck `createdAt` values making `decks[0]` deterministic — the S125 lesson-3 flake class dead at the root; six study pins re-anchored to the honest remediated counts, live-verified); **CA7** the nav modified-click fix (⌘/Ctrl/Shift-click keeps the browser default — the unconditional preventDefault swallowed open-in-new-tab on real rewritten hrefs); **CA8** the placeholder AA guard (**honestly resolved as a comment fix** — hsl(220 9% 46%) COMPUTES to gray-500 rgb(107,114,128) = 4.82:1, ALREADY AA-compliant; the audit's 2.5:1 claim traced to the Input's own stale "gray-400" comment — computed styles are the ground truth, the AP-130-adjacent lesson; the pin locks the compliant value as the regression guard); **CA9** the Google button's reachable explanation (the title-only tooltip on a `disabled:pointer-events-none` button could never display — persistent helper text); **CA10** the resend in-flight guard (the `resending` state + the disabled binding — rapid clicks fired duplicate POSTs against the 10/IP limiter); **CA11** the reset screen's missing-token message + the consumed-token URL cleanup (`replaceState` → `/login`); **CA12** the `formatShortWithYear` → `formatShortDate` rename (the name promised a year the format never rendered); **CA13** the shared minute-gated `useNow` (two byte-identical 1s-commit hooks re-rendered both chrome trees ~60×/min for a minute-resolution display — one shared hook in `src/lib/date.ts` that commits only on minute changes); **CA14** the import domain caps (the third entry point escaped every route guard — grades {score:-50, maxScore:0} imported cleanly feeding NaN into the GPA math, progress 500, dayOfWeek 99, out-of-vocabulary enums breaking the badge meta maps, non-JSON strings in the JSON columns throwing in the client parse; the caps ride validation.ts's own EXPORTED vocabularies — the single-source doctrine again — + the grades pair with the create-schema's default-denominator semantics; 11 unit pins); **CA15** the compose SEED_DEMO fail-safe comment correction (the old comment claimed "any other value seeds it" — the code skips on every unrecognized value; an operator setting SEED_DEMO=yes silently lost the demo account) + the `NEXT_PUBLIC_SITE_URL` build-args hook (the compose comment said to bake via the build ARG but no `args:` block existed — sitemap/robots/metadataBase always built with the localhost default); **CA16** the CLAUDE.md lint-attribution fix (typecheck's `noUnusedLocals` owns unused imports — eslint's family is disabled; the docs now say so); **CA17** the OTP `randomInt(0, 1_000_000)` sampling (the getUint32 modulo carried a +0.023% relative bias — negligible under the attempt caps, but rejection-quality sampling is free); **CA18** the schema's Assignment.type comment gained "worksheet" (validation.ts always had it — the seed writes it); **CA19** the redundant `RumEvent @@index([userId])` dropped (the user-scoped unique's leftmost column serves every userId-prefixed lookup — pure write amplification on the hottest table); **CA20** the DEPLOYMENT.md upgrade-path caution (the init profile re-runs `db push --accept-data-loss` against the production volume after image upgrades — the data-loss consequence now spelled out); **CA21** the `@theme inline` nomenclature reconciliation (the shipped directive is the plain `@theme` — never inline, per git history; the globals.css comments + the PAD now say so); **CA22** the dead `export default LoginSurface` removed (zero consumers). Dismissed as documented non-gaps: B-I5 (the export's in-memory envelope assembly — bounded by the budgets, the documented completeness trade-off), A-I3 (the theme boot script's `dangerouslySetInnerHTML` — the compile-time constant, the sanctioned exception now documented in the SKILL doc), the taskLists/notebooks seed ties (benign — the deck family was the only order-pinned one). Deferred with the rationale recorded: the PATCH/DELETE write-budget legs (BZ5's documented next-cycle candidate — an unmeasured shared-key budget is the exact BZ5 lesson-2 hazard; it needs a measured chunk-volume census first), the eslint rule re-enablement (B-L6 — the docs are amended instead; the debt is recorded, not silently shipped).

**TDD discipline.** RED first: **18 failing unit pins** (the CA2 shared-validator contract — 4 RED on the missing export + the seam-contract leg green by design; the CA14 domain-cap rejections — 11 RED + the 2 legal-accept legs green by design) + **8 failing e2e pins + 1 green-by-design regression guard** (CA1 — the GET answered msg-0, the OLDEST window, the exact bug; CA5 — task-0, the same on the factory; CA2 — the empty-id import 200'd, the row minted; CA3 — the fixed header rendered under print emulation at 390px; CA4 — `activeElement` was BODY; CA7 — the URL moved to /Analytics on the ctrl-click; CA9 — the helper text was not found; CA11 — the missing-token message was not found; CA8 — the placeholder computed gray-500 pre-fix, GREEN BY DESIGN as the retracted finding's regression lock) — every RED verified for the RIGHT reason (two pin-side corrections to get there: the `done`→`completed` field name, the attached-vs-visible pill wait). GREEN: unit **1127 → 1145** (42 files — data-import 32 → 50); e2e **529 → 538** (142+161+71+93+71). Guardrails held: no test weakened, no lint/type rule loosened.

**The honest mid-run corrections (five).** (1) **CA8/A-L4 honestly resolved as a comment fix** — the audit's "2.5:1 placeholder" was a conversion error (hsl[220 9% 46%] computes to gray-500 = 4.82:1, already AA-compliant; the auditor trusted the Input's own stale "gray-400" comment — gray-400 is L≈65%, the shipped triplet is L=46%). The real defect was the misleading comment (fixed with the honest arithmetic); the pin locks the compliant computed value. The lesson: prose descriptions of computed values are claims — getComputedStyle/hex math is ground truth (the AP-130-adjacent rule, now AGENTS S126 lesson 3). (2) The CA5 pin's task field name (`done` → `completed` — the first import 400'd through the route's own PrismaClientValidationError mapping, the 400-bad-input contract working). (3) The CA3 pin's pill wait — `waitForSelector` defaults to the VISIBLE state, but the pill under print emulation is hidden BY THE FIX; the wait moved to `state: "attached"` (the pill renders, the print guard hides it — the assertion keeps its meaning). (4) **The CA6 seed re-mapping broke SIX study pins across TWO chunk runs** — the pins had encoded the MISLABELED seed state ("1 / 4" counters on a calculus deck carrying biology cards): mobile-navigation's S79 + parity-session7's AD11/AE4/AF1/S80 + the AD8/AD9 re-anchor. Each re-anchored to the remediated honest counts (Integration 1 / Biology 3 / Spanish 2) with the CA note in the pin — pinning the SHAPE (the counter format, the advancement step, the deck-switch reset) at the honest values; and the first chunk-1 run's tail-2 output had MASKED one failure (the failure listing scrolled past — the full-summary discipline). The lesson: a seed correction is a pin-migration event — grep the fleet for the old values before re-running (now AGENTS S126 lesson 4). (5) **The README blanket census replace corrupted two historical rows** (the Session-125 row's baseline/GREEN/re-cert numbers + the Session-124 row's chunk map): `s.replace` over a history-bearing table rewrote immutable records; every value restored via the diff review before commit. The lesson: census re-tags are per-line surgical edits, never blanket string replaces over a history-bearing table.

**Re-certification (all on the FINAL tree).** lint ✓ tsc ✓ (`noImplicitAny` + `noUnusedLocals`/`noUnusedParameters`); unit **1145/1145** (42 files); the canonical build green; the cold 5-chunk e2e re-cert **538/538** (142+161+71+93+71 — every chunk first-pass; chunk 1 re-run after the S79 re-anchor, chunk 2 re-run after the four parity-session7 re-anchors); the register tripwire **249/130/0-stale/119** — the exact hold (the 30th consecutive, the expectation stated BEFORE the measurement); the live agent-browser battery on the fresh S32 daemon (the mobile drawer battery re-run GREEN — **no Tailwind v4 mobile-nav bug, the 28th consecutive live confirmation**; the CA4 focus walkthrough signin→signup→signin→forgot, each transition landing on the heading; the CA9 helper text; the CA11 missing-token message; the CA8 computed placeholder rgb(107,114,128); the CA6 deterministic deck order — Integration rules → Biology → Spanish, auto-selected "Integration rules"); the six `docs/screenshots/126-*.png` evidence frames (the mobile dashboard, the mobile drawer open, the desktop dashboard, the flashcards deck order, the login helper text, the auth heading focus — non-blank-verified programmatically); `.env`/`db/` contract verified current (`DATABASE_URL="file:../db/custom.db"`, `db/` at the repo root, the dev db re-pushed for the CA19 index drop + re-seeded for the CA6 remediated fixtures, `.env.example` matching — no new env vars). **Standing debt: ZERO.**

**Docs chain.** README badge 1683 + the Session-126 row + the tree/testing census lines; AGENTS commands 1145/538 + the S126 lessons ×4 (the asc+take oldest-window trap — a bounded read is TWO decisions, the orderBy direction picks the window; the single-source doctrine extended from derived maps to validation rules; the computed-comment-vs-computed-value rule; the seed-correction-as-pin-migration rule); CLAUDE census + the lint-attribution fix (typecheck owns unused imports); vitest header 1145 (42 files); PAD **v1.3.34** (§8.1's Total row repaired — the "530" setup double-count — + the per-file rows re-measured; §12's three line counts re-measured [entities 588, http 362, validation 578]; §3.3's Pattern A/B excerpts replaced with the shipped code + Pattern C's BY2 production gate + Pattern D's @theme nomenclature; §3.2's parity-session count [9→5] + greeting-clock + the ui/ list completed [21 files] + worklog.md's placement; §5.1's stat-value class + §5.2's card-border hex [#e2e8f0] + the accent ids [green/orange]; §5.3's Radix list completed [18 packages]; ADR-002's production gate + ADR-004's @theme wording + ADR-016/017/018's RUM 500/50 reconciliation; §11's avatarEmoji; the v1.3.32 retro-edit repaired [S124's own 1113/523 anchor restored, the current anchor in each cycle's OWN block]); the SKILL doc's five drift fixes (the card border hex ×2, the AccentToken sketch's 3 missing fields [17 total], §7's pipeline gaining the write-budget step + the 16-delegate/OWNED_FKS inventory, the BZ/CA-era seam references [effectiveDeckId, removeOneMember, checkGradeRangeMerge, FILE_METADATA, persistTranscriptPair, importRowIdError, the CA14 caps] + the census header 1683 + the A-I3 sanctioned-exception note); the cert-script Expected re-tag (142+161+71+93+71 = 538 + the CA block); the master plan's §5 execution record; the worklog Session-126 entry; `docs/session_123.md` (the session record, titled "Session 127" per the established offset); DEPLOYMENT.md's upgrade-path caution; docker-compose's SEED_DEMO comment + build args.

## Session-127 / Batch CB (Cycle 77) — the audit-driven hardening cycle: the focus-closure + date-round-trip + category-dots set

**Date:** 2026-11-03 · **Workspace:** the Batch CA state `3176437` + the operator's `cde890e` (`docs/session_124.md`, the CA transcript) — the prior working window was interrupted after the parity-measurement phase (its plan and audit reports were never persisted; this window re-ran the full baseline, re-ran both rotated deep audits, re-verified every finding by direct read, and executed) · **Plan + execution record:** `docs/remediation-plan-session127.md` · **Session record:** `docs/session_125.md`.

**Baseline (cold, BEFORE any work).** lint ✓ · tsc ✓ · unit **1145/1145** (42 files) · the canonical build green · the cold 5-chunk e2e **538/538** (142+161+71+93+71, every chunk first-pass) · the register re-derivation **249/130/0-stale/119** (the 31st consecutive hold, the expectation stated BEFORE the measurement) · the Mode-C audit of the Batch CA diff (`3176437`, 51 files, +1819/−258): all 22 CA claims re-verified TRUE.

**Live parity (both hosts, agent-browser + DOM probes).** The standing reference battery held (the unlabeled hamburger, no `role=dialog`, the 288px panel, `blur(4px)`, 20 links, the landscape 992>744 scroll). The reference-specific probes: the calendar renders per-CATEGORY presence dots (measured: the Nov 12 exam cell carries one `w-1.5 h-1.5 rounded-full bg-red-500`; **events are dotless**; the dots go `bg-white` on the selected fill), the day detail groups by uppercase category label over tinted `border-l-4` rows, the empty copy reads "No events for this day", and the timetable renders **14 hour rows (7 AM–8 PM)**; the reference's Tasks view carries 0 tasks (the task-row anatomy and the populated-Analytics semantics unmeasurable there). The clone battery GREEN end-to-end — **no Tailwind v4 mobile-nav bug, the 29th consecutive live confirmation at baseline / the 30th at the post-fix re-verification** (labeled hamburger, `role=dialog` + label, 288px panel, 20 links, the true-layer backdrop blur(4px) + oklab(0 0 0 / 0.2), nav auto-close, /Notes clean 390 = 390, scroll persistence 600→600, landscape 992 > 301).

**The audits + the CB set** (two parallel deep audits with ROTATED coverage — the FE views/components family [**0C/0H/4M/4L**] + the server/persistence family [**1C/4M/3L**]; every C/H/M finding verified by direct read before the plan, the L set spot-verified; the prior window's audit reports were lost with the interruption — both re-ran fresh in this window and every finding re-derived): **CB1** the focus-timer stale closure (**H** — `complete`'s dep array omitted `remaining`: the memoized callback closed over the mount-time value, `durations.focus - remaining` was always 0, and the min-1 floored EVERY session — auto AND manual — to `durationSeconds: 1`; the BX6 elapsed fix was dead code behind the closure and its pin blind to it [1 satisfies `>= 1 && < 1500`]; pinned by the clock-accelerated auto path — a full 25:00 run on `page.clock.runFor` logs exactly 1500) ; **CB2** the assignments TZ round-trip (**H** — the raw `yyyy-mm-dd` submitted [stored as a UTC-midnight instant — one day early in every UTC-negative zone, drifting on each untouched edit] + the `row.dueDate.slice(0, 10)` UTC-slice populate; the tasks-view local-noon pattern promoted to shared `date.ts` atoms `fromDueDateInput`/`toDateInputValue`, adopted by tasks + assignments + the holidays dialog — the BX3 doctrine for the date-only family); **CB3** the generate-questions dead transform (**H** — the BX5 twin at the third route: `idField.nullish().transform(""→null)` rejected `""` at `min(1)` before the transform, so the practice-tests no-subject default path 400'd; the shared `nullableId` atom); **CB4** the weighted-mean grade averages (**M** — the form collects `weight` and the seed carries 0.5–2, but both averages were unweighted: a 2-credit midterm counted exactly as much as a half-credit quiz; weights clamped ≥ 0, zero-weight grades drop from numerator AND denominator, an all-zero set falls back to the unweighted mean; the Math card re-anchored 89% → 90%); **CB5** the calendar category-dot parity (**M** — the clone rendered per-EVENT color dots [max 3 + "+N"] while its own legend promised the four categories the reference renders: Tasks=blue-500, Assignments=amber-500, Exams=red-500, Classes=emerald-500, events dotless, `bg-white` on the selected fill; the day detail re-grouped to the reference's uppercase-label anatomy over tinted border-l-4 rows [the clone's checkbox task-row superset kept — the S6-G pin] + the Events group appended [the clone's superset]; the empty copy "No events for this day"); **CB6** the timetable 14-row parity + the band guard (**M** — 7 AM–8 PM measured on the reference, was 12 rows; + `min="07:00" max="20:59"` on the start-time input: a class saved outside the rendered band matched no row and silently VANISHED from the desktop grid — the mobile accordion still showed it, perceived data loss on the primary surface); **CB7** the mutate write budget (**M** — the BZ5 mirror closing its own documented next-cycle candidate: PATCH + DELETE join the shared `write:${user.id}` 600/15-min, after auth before readJson; the e2e censused the demo user's per-chunk mutation volume at tens — far below 600 — before the budget landed); **CB8** the AI post-send refresh split (**M** — the send POST and the transcript refresh shared ONE try on all three surfaces: a flaky refresh bounced the DELIVERED message back into the composer with a false "could not respond" toast, the solver toasted "could not solve" with the solution rendered, and a flashcards retry duplicated the drafted cards; separate failure domains — one refresh retry, then the honest soft toast, never a send rollback); **CB9** the assignments type single-source (**M** — the local 7-value TYPES array was missing "worksheet" [the vocabulary, the import seam, and the seed's own worksheet rows carry 8]: Edit on a seeded worksheet row blanked the Type select; the shared `ASSIGNMENT_TYPES`); **CB10** the file-family bounded windows (**M** — the two hand-written GETs [files + folders] join the CA5 desc+id-tiebreak+take:500 convention; the import can mint ~10⁵ rows in one envelope); **CB11** the import domain caps completed (**M** — exams.duration 5–600, practiceTests.durationMinutes 1–600, focusSessions.durationSeconds 1–86 400, studyGroups.members ≤ 50, grades.weight 0–100, events start≤end, timetable hhmm shape + minutes ordering: the third entry point stores nothing every interactive route rejects); **CB12** the login per-account budget (**M** — the BX2 doctrine applied to the credential exchange: `loginAcct:${user.id}` 10/15-min checked before the scrypt burn when the account exists, the exhausted branch answering the SAME uniform 401 [a distinguishable 429 would be an account-existence oracle — the no-user branch never budgets], successes reset BOTH buckets; the e2e census verified the demo account's failed logins stay ≤ ~6/15-min and successes reset — suite-safe); **CB13** the analytics avg-progress derivation (**M** — the caption computed the completion ratio: 1 of 2 done at 10% rendered "50% avg progress" when the mean is 55%; the true mean of `a.progress`, seeded state 42%); **CB14** the in-band delivery production warning (**the server audit's Critical, adjudicated against ADR-013** — the single-user no-SMTP default STANDS [there is no mail transport to flip to], but the BT5 posture precedent now applies: `inBandDeliveryProdWarning` + the instrumentation boot WARN while either channel delivers in-band, the three delivery routes' "no enumeration" comments state the body-shape oracle honestly [a code present ⟺ an unverified account exists; a resetUrl ⟺ any account exists — inherent to in-band delivery], DEPLOYMENT.md + `.env.example` carry the multi-user guidance; registration is open, so an internet-facing deployment is multi-user by construction); **CB15** the appearance pickers' failed-save rollback (**L**); **CB16** the toggleTask per-id chain (**L** — two rapid toggles both read the stale base and the second was silently lost; the BX10 class closed at the store — a per-id promise chain re-reading the store after each settle, pinned with the tasks-GET gate making the race window deterministic); **CB17** the Add-Link dialog's hand-wired required guard (**L** — `noValidate` had killed both native gates: empty submits round-tripped to the server's 400); **CB18** the calculator tokenizer's exponent leg (**L** — `formatCalcResult`'s "2e+15" chained back as the expression mis-tokenized [bare `e` = Euler, `+` = addition]; the number token gains the digits-required exponent leg, a bare `e` stays Euler); **CB19** the export/import profile round-trip (**L** — the envelope's hashless publicUser block was exported but silently ignored on restore: school, grade level, study goal, theme, accent, avatar, and notifications dropped; `importProfilePatch` extracts the seven preference fields through the preferences schema — identity never rides — applied inside the all-or-nothing transaction; the ADR-019 "own your data" promise); **CB20** the twin link-file size unification (**L** — both entry points store `url.length`); **CB21** the dead `deleteCalculatorEntry` mutation removed (**L** — zero callers; it targeted a nonexistent route, 404 by construction); **CB22** the docs chain. Dismissed as documented non-gaps: the "Due Soon" dashboard copy (parity, measured on the reference in the prior window).

**TDD discipline.** RED first: **23 failing unit pins** for the right reasons (the missing exports ×13, the absent caps ×7, the exponent mis-tokenization ×3 — plus the intentional holds-pins passing: the caps' "accepts" boundary rows, the bare-`e` Euler leg, the CB12 reset leg) + **21 failing e2e pins for the right reasons** (CB1 `Expected: 1500, Received: 1` — the stale closure demonstrated live; CB2 `Expected …T12:00:00.000Z, Received …T00:00:00.000Z` — the UTC-midnight storage; CB3 the 400 with the WebServer log naming the dead transform; CB4 89% renders; CB5 0 dots / the violet event dot / the wrong empty copy; CB6 `Expected: 14, Received: 12` + no band; CB7-PATCH 620× 200 never 429; CB7-DELETE 310 pairs no trip; CB8 the composer bounce in the failure snapshot; CB9 no Worksheet option + the blank trigger; CB12 `Expected: 401, Received: 200`; CB13 "0% avg progress"; CB15 Dark stays pressed; CB16 `Expected: false, Received: true`; CB17 no guard; CB20 `Expected: 29, Received: 0`). GREEN: unit **1145 → 1171** (42 files — date +5, data-import +13, calculator +4, env-check +4); e2e **538 → 559** (144+177+72+93+73). Guardrails held: no test weakened, no lint/type rule loosened.

**The honest mid-run corrections (the pin-side ones).** (1) The CB1 clock API needed `runFor`, not `fastForward` — the jump fires each timer at most ONCE, so the 1s interval decremented a single step and the completion never fired; `runFor` drains all 1500 interval firings. (2) The CB4 "90%" needed `{ exact: true }` — the substring match hit the "Progress to A (90%)" label and passed spuriously on the pre-fix tree. (3) The CB6 row count needed the LABEL census — the hour-cells container is FLAT (12 hours × 8 columns = 96 children pre-fix), so `> div` counted cells, not rows. (4) The CB8 composer assertion needed a settle window — the rollback landed INSIDE the assertion's poll window, so the empty-composer check passed before the bounce; the failure snapshot proved the bug live (`textbox … text: S127-CB8 delivered probe`). (5) The CB9 edit pin needed the raw lowercase textContent — the "capitalize" class is CSS-only. (6) The CB7-DELETE cap 620→310 — the first design's 620 pairs tripped the EXISTING POST budget (620 creates > 600) and passed for the wrong reason; the discriminating cap keeps the creates under the POST-only budget pre-fix. (7) One arithmetic error in the docs census (the total-green mis-summed 1171+559 as 1752 — corrected to **1730** everywhere before commit). (8) A 24h-stale dev db made the first live calendar probe read shifted relative dates — the live verification re-ran on a FRESH `rm db/custom.db` + push + seed.

**The re-cert.** The cold 5-chunk e2e **559/559 — 144+177+72+93+73, every chunk first-pass on the final tree** (chunk 2 twice: the first post-GREEN run exposed a lost HOURS edit — the 14-row change had been swallowed by a failed batch script before its write; re-applied, rebuilt, re-run, exact). The register tripwire **249/130/0-stale/119 — the EXACT hold (the 32nd consecutive; the pins rode existing spec files)**. The live battery on the fresh-seeded dev daemon: the standing mobile battery ALL GREEN (**the 30th consecutive no-Tailwind-v4-bug confirmation**), the calendar day+1 four-dot legend-order render, the day+1 grouped detail (Tasks/Assignments/Exams/Classes), the dotless Advisor-meeting event, the 14-row timetable, the 90% Math card, the "42% avg progress" Analytics card — all live-verified; five evidence frames in `docs/screenshots/127-clone-*.png`, all verified non-blank.

**Docs set (same commit):** README (the 529→559 chunk map + the import 10→25 MiB cap drift + the census lines), AGENTS.md + CLAUDE.md (census), PAD **v1.3.35** (the revision block + §8.1 per-file rows re-measured [the table sums verified: 1171 unit + 554 e2e] + the Total row + §8.4 floors), omni-study1_SKILL.md (the chunk map + both census anchors), DEPLOYMENT.md §3 (the CB14 guidance), `.env.example` (the CB14 cross-reference), the plan's §5 execution record, this entry, and `docs/session_125.md`. **Census: 1171 unit + 559 e2e = 1730 green.**

## Session-128 / Batch CC (Cycle 78) — the audit-driven hardening cycle: the whitelist + cert-truth + composite-index set

**Date:** 2026-11-03 · **Workspace:** the Batch CB state `7a61e61` + the operator's `5a415d5` (`docs/session_126.md`, the CB transcript) — the workspace survived the session break (`.env`, `db/`, chromium-1243, agent-browser all intact; the push infra rebuilt before the push) · **Plan + execution record:** `docs/remediation-plan-session128.md` · **Session record:** `docs/session_127.md`.

**Baseline (cold, BEFORE any work).** lint ✓ · tsc ✓ · unit **1171/1171** (42 files) · the canonical build green (REAL_EXIT — after the re-learned foreground lesson: a `&`-detached build dies with the tool session leaving an empty log) · the cold 5-chunk e2e **559/559 — 144+177+72+93+73, every chunk first-pass** · the register re-derivation **249/130/0-stale/119** (the 33rd consecutive hold, the expectation stated BEFORE the measurement) · the Mode-C audit of the Batch CB diff (`7a61e61`, 53 files, +2347/−192): **all 22 CB claims re-verified TRUE against the tree**.

**Live parity (both hosts, agent-browser + DOM probes).** The standing reference battery held (the unlabeled hamburger 36px at [17,14], no `role=dialog`, the 288px panel, `blur(4px)`, 20 links, the landscape 992>290 scroll). No new reference-specific probes this cycle — both audits found exclusively internal-seam findings (nothing with a reference-measurable counterpart). The clone battery GREEN end-to-end — **no Tailwind v4 mobile-nav bug, the 31st consecutive live confirmation at baseline / the 32nd at the post-fix re-verification** (labeled hamburger, `role=dialog` + label, 288px panel, 20 links, the true-layer backdrop blur(4px) + oklab(0 0 0 / 0.2), nav auto-close, /Notes clean 390 = 390, scroll persistence 600→600, landscape 992 > 301).

**The audits + the CC set** (two parallel deep audits with ROTATED coverage — the CB cycle deep-covered the FE views + server/persistence; this cycle's fresh eyes went to the client state/transport/lib layer + UI primitives [**0C/0H/1M/7L/6I** — last deep-covered BZ] + the test layer itself + schema/seed [**0C/0H/4M/5L/5I** — including the independent census derivation 559 ✅ and the full per-chunk budget-math enumeration]; every M finding verified by direct read, the CC10 win MEASURED not assumed): **CC1** the import profile-patch whitelist (**M** — the CB19 seam copied EVERY `preferencesSchema` key into the `tx.user.update` patch, and the schema legitimately carries `displayName` [the Settings alias] while the User model has no such column: a hand-edited envelope carrying it died with `PrismaClientValidationError` inside the all-or-nothing transaction — the ENTIRE restore rolled back behind a misleading "row whose fields do not match" 400, and a name-shaped field rode a seam whose contract says identity never rides; the closed seven-key whitelist, unit ×3 + the route-level pin on a fresh TEST-NET user: spliced `displayName` → 200, preferences applied, the name never rode); **CC2** the cert-runner truth pair (**M** — the chunked-cert header still said 538 vs the true 559 [the re-tag discipline now MACHINE-ENFORCED by a script-conventions pin tying the header to the census], and the script always exited 0: `set -uo pipefail` with no accumulation discarded every chunk pipeline's status — a green cert on a red run, the resweep-gate trap class reborn at the cert layer; rc accumulation + `exit "$rc"`, the mechanism verified with a toy failing pipeline); **CC3** the CB5 dots pins' data-settle wait (**M** — `evaluateAll` does not retry and the dots render from the async store after shell commit: the cold-race class, closed with the `first().toBeVisible()` gate on all three pins); **CC4** the CB pins' try/finally cleanup (**M** — the CB1 focus session, CB2 assignment, CB16 task + the BX6 twin issued their demo-row DELETEs only on the success path; the AR3 convention restored on all four); **CC5** the `taskToggleChains` eviction on settle (**L** — hygiene); **CC6** the `fromDueDateInput` NaN guard (**L** — the one date atom without it threw `RangeError` on malformed input; the sibling guard mirrored); **CC7** the `apiGet` timeoutMs leg (**L** — the boot gate could hold the Splash for the browser's own connection timeout on a stalled `/api/auth/me`; the apiSend mirror + a 20 s gate deadline); **CC8** the toaster's deterministic identity + bounded stack (**L** — `Date.now()+random` ids collided same-tick and were non-monotonic, the timer sat inside the `set` reducer, the stack was uncapped; the module counter + the 5-toast cap); **CC9** the dead-code removals (**L** — the store's `addRow`/`updateRow`/`removeRow` trio [zero callers, and they bypassed the fetchSeq stale-guard] + `RowOf` + the dead `minutesToHHMM` with its pin leg); **CC10** the factory-list composite indexes (**L promoted by measurement — REPLACE `@@index([userId])` → `@@index([userId, createdAt, id])` on the 19 factory-listed models: the list query sorted EVERY owned row in a temp b-tree under the bare index, measured 34.6 ms median per GET at 100k imported rows vs **0.27 ms** under the composite [128×]; same index COUNT per table, the leftmost column keeps every userId-prefixed lookup backed; `PasswordResetToken` keeps the bare index, `Flashcard`/`RumEvent` untouched; schema-census-pinned, the swap verified in `sqlite_master`**); **CC11** the loading flag's in-flight counts (**L** — one shared boolean flipped false by the FIRST finisher of overlapping loads; the per-key count map derives it, both overlap shapes covered); **CC12** the seed/global-setup doc set (**L** — the fallback logs the primary failure before retrying; the "upsert" wording → the early-return truth; the deliberate 6/8 + 4/6 vocabulary coverage documented); **CC13** the calculator's unary-minus-vs-`^` convention locked (**the audit's I-1 — `-2^2` = 4, the Excel/Sheets family, was real unpinned behavior**); **CC14** the docs chain. Deferred with documentation: the toast 5s timing-adjustability note (WCAG 2.2.1 — transient click-dismissible notifications), the ApiError 2xx-status semantics, the text.ts micro-nits, the `initialFor` Latin fallback.

**TDD discipline.** RED first: **13 failing unit pins for the right reasons** (the CC1 displayName rides ×3; the CC2 stale-header + no-rc ×2; the CC6 live `RangeError`; the CC7 hung-GET ×2; the CC8 cap + non-monotonic ids ×2; the CC10 bare-index models ×2; the CC11 early false) + **1 failing e2e pin for the right reason** (CC1: `Expected: 200, Received: 400` — the rollback demonstrated live at the route boundary). GREEN: unit **1171 → 1191** (44 files — toast +3 the 43rd, schema-indexes +4 the 44th, api-timeout +3, data-import +3, data-store +3, script-conventions +3, calculator +1, date net 0) · e2e **559 → 560** (144+177+72+93+74). Guardrails held: no test weakened, no lint/type rule loosened.

**The honest mid-run corrections (the pin- and procedure-side ones).** (1) The CC1 e2e pin's first design reused the demo session's fixed row ids — the id is the GLOBAL primary key, so the fresh user's import P2002'd a 409 BEFORE the profile patch (RED for the wrong reason); the BT1b/S117 unique-id convention applied, then RED for the right reason. (2) The export evidence frame first captured a 404 — the standalone route is lowercase `/export`; recaptured + content-verified. (3) The CC8 pin first asserted set-distinctness only (which the old random minting passes 999/1000) — the discriminating leg is MONOTONICITY. (4) The unit delta initially mis-summed as +19 (the removed "2 legs" were ONE `it()` with two asserts); the stash-and-rerun comparison pinned date at net 0 and the census at +20 exact. (5) The re-learned foreground-build lesson (the empty `/tmp` log). (6) The `require()` lint class hoisted to ESM imports.

**The re-cert.** The cold 5-chunk e2e **560/560 — 144+177+72+93+74, every chunk first-pass on the final tree**. The register tripwire **249/130/0-stale/119 — the EXACT hold (the 34th consecutive; the pins rode existing spec files)**. The live battery on the fresh-seeded daemon: the standing mobile set ALL GREEN (**the 32nd consecutive no-Tailwind-v4-bug confirmation**), the CC1 round-trip demoed live (export → splice displayName + themeMode dark → import 200, preferences applied, the name never rode); three evidence frames in `docs/screenshots/128-clone-*.png`, all verified non-blank.

**Docs set (same commit):** README (the 559→560 chunk-map lines), AGENTS.md + CLAUDE.md (census), PAD **v1.3.36** (the revision block + §8.1 rows [the two new files + the six touched] + the Total row 75/1752 + §8.4 floors), omni-study1_SKILL.md (the chunk map + both census anchors + the green-state line), vitest.config.ts (the 44/1191 header + the S128 re-anchor block), the cert-script re-tags (the S127/CB + S128/CC blocks + Expected 560 + the rc propagation), the plan's §5 execution record, this entry, and `docs/session_127.md`. **Census: 1191 unit + 560 e2e = 1751 green.**

---

## Session 129 — Batch CD (Cycle 79): the audit-driven hardening cycle — the overlay-animation + pre-warm-deadline + stale-closure-guard set

**Context.** The workspace at the Batch CC state `37468e3` + the operator's `c341120` (`docs/session_128.md`, the CC record) — the workspace SURVIVED the session break (`.env`, `db/`, chromium-1243, agent-browser intact; the push infra rebuilt before the push). Audit-driven hardening session — the standing rhythm. Plan + execution record: **`docs/remediation-plan-session129.md`**.

**Baseline (cold, BEFORE any work).** lint ✓ · `tsc --noEmit` ✓ · unit **1191/1191** (44 files) · the canonical build green (REAL_EXIT, foreground) · the cold 5-chunk e2e **560/560 — 144+177+72+93+74, every chunk first-pass** · the register re-derivation **249/130/0-stale/119** (the 35th consecutive hold, the expectation stated BEFORE the measurement, instrument-identical to the calibrated pin) · the Mode-C audit of the CC diff (`37468e3`, 37 files, +1367/−132): **all 13 CC claims re-verified TRUE against the tree**.

**Live parity (both hosts).** The standing reference battery held (the unlabeled hamburger 36px at [17,14], no `role=dialog`, the 288px panel, `blur(4px)`, exactly 20 links, the landscape 992>290 scroll). The clone battery GREEN end-to-end on a FRESH reseed — **no Tailwind v4 mobile-nav bug, the 33rd consecutive live confirmation at baseline (the 34th at the post-fix re-verification)**. Plus THIS cycle's new reference-specific probe (the CD1 parity measurement): **the reference's dialog overlay + content both compute `animation-name: enter / animation-duration: 0.15s`** (the tailwindcss-animate family verified in its stylesheets) — while the clone's animate-in/out classes were INERT (tw-animate-css declared but never imported; Tailwind v4 silently drops unknown utilities).

**The audits (rotated fresh eyes — the CA-covered axes, three cycles back).** Audit A — the app shell + routing + design tokens + auth screens: **0C/0H/2M/6L/6I** (the M1 pre-warm deadline; the M2 inert animation family). Audit B — the persistence + crypto/auth core + infrastructure configs: **0C/0H/0M/4L/4I** (every prior-cycle fix CC1/CC2/CC10/CC12/BT5/BZ5/CB7/CB12/BY5 verified HOLDING at the line level; the one brief-vs-code divergence was the code AHEAD — CB7's PATCH/DELETE budget had landed while AGENTS.md still called it the next-cycle candidate). Every M finding re-verified by direct read; the CD1 parity question settled by LIVE MEASUREMENT on both hosts.

**The CD set (TDD — 8 unit + 4 e2e RED pins, all for the right reasons → GREEN; unit 1191 → 1202 [45 files], e2e 560 → 563 [145+178+72+93+75]).** **CD1 (M, parity)** the Radix overlay animation family WIRED — `@import "tw-animate-css";` in globals.css (declared since the scaffold, documented in the design tables, never imported) + the reference's overlay fade classes restored on Dialog/AlertDialog (the clone's overlays carried NO animation classes at all) + the notes popover's exit family + `duration-200` DROPPED from the two primitives (measured: v4's `--tw-duration` feeds tw-animate-css, pushing the enter to 0.2s vs the reference's 0.15s) + the dead v3 `tailwindcss-animate` dep removed — the clone now computes **enter/0.15s on BOTH nodes** (the e2e parity leg + the unit census pin). **CD2 (M)** the boot-gate pre-warm deadline — CC7 bounded `/api/auth/me` but the gate ALSO awaits the pre-warm whose fetchAndSet had NO timeout: a stalled collection GET held the Splash FOREVER (a non-settling fetch is not a failure — the `.catch` never fired, the retry affordance unreachable); `COLLECTION_GET_TIMEOUT_MS = 20_000` now rides EVERY collection GET (the e2e stall leg holds all five Dashboard pre-warm keys — the Splash still mounted at 5 s, the shell committed by 35 s). **CD3 (L-promoted)** `react-hooks/exhaustive-deps` re-enabled as an ERROR + the 6 live violations fixed (all zero-behavior-change or mechanical, verified by read; the remaining scaffold disables documented as the deliberate posture in the SKILL doc). **CD4 (L)** the body-cap truth pair — the corrupted `JSON_BODY_MAX_BYTES` comment repaired + `BodyTooLargeError extends ValidationError` → **413** in toErrorResponse (the same fault answered 400 here but 413 on the import route; the BS2 pin's status corrected with the rationale in-line). **CD5 (L)** the affirmative boot line (`[boot] studyflow up — node_env/db anchor` through the same db-path seam the app uses; a PG URL redacts to its protocol). **CD6 (L)** the auth-surface set (bare `/reset-password` defaults to the reset view — the CA11 missing-token explanation finally renders on its own route; the forgot-success banner role=status; the six auth POSTs get the 20 s deadline; the two byte-identical route pages deduplicated; the drawer backdrop's focus-visible ring; the needless fragment; the OTP select-on-focus). **CD7 (L)** the doc-drift set (CLAUDE.md 15→17-var; AGENTS.md's rate-limiter census refreshed to the CB7 truth). **CD8 (I)** the api-route dynamic census pin (zero production diff — the invariant machine-guarded).

**TDD discipline.** RED first: 12 failing pins verified for the right reasons (the unit 8: the overlay import/overlay-blocks/exit-census/dead-dep ×4, the apiGet-no-options ×2, the BodyTooLargeError-unknown + 413 ×2; the e2e 4: the `none`-vs-`enter` computed style, the 35 s Splash hold, the 400-vs-413, the sign-in-form-at-reset-route). GREEN: unit **1191 → 1202** (45 files — overlay-animation +4 the 45th, data-store +2, http-body +3, script-conventions +2) · e2e **560 → 563** (145+178+72+93+75). Guardrails held: no test weakened (the two modified pins are the documented corrections their source changes demand), no lint/type rule loosened (one TIGHTENED).

**The honest mid-run corrections (all pin-side).** (1) The overlay-class unit pin's first shape was non-discriminating (a whole-file includes() matched the CONTENT's classes — re-scoped to the overlay component blocks). (2) The e2e overlay locator named `data-radix-dialog-overlay`, an attribute this Radix version never sets (re-scoped to the scrim class shape). (3) The CD6a pin's count-0 assertion hit the substring-matching quirk ("Sign in" also matches "Back to sign in" — exact:true + the Welcome-heading identity). (4) The forgot-banner journey pin needed the role=status correction applied to it. (5) The rum-panel CD3 comment shifted hue-tokens' line-anchored residual register (134 → 138; both register directions failed loudly — the guard working as designed; re-anchored with the provenance).

**The re-cert.** lint ✓ (the rule active, zero violations) · tsc ✓ · unit **1202/1202 (45 files)** · build green (REAL_EXIT) · the cold 5-chunk e2e **563/563 — 145+178+72+93+75, every chunk first-pass on the final tree** · the register tripwire **249/130/0/119 — the exact hold (the 36th consecutive)**. The live battery on the fresh-seeded daemon ALL GREEN — **the 34th consecutive no-Tailwind-v4-bug confirmation** — plus the CD1 animation parity demoed live (enter/0.15s on both nodes). Three evidence frames in `docs/screenshots/129-clone-*.png`, all verified non-blank. **Census: 1202 unit + 563 e2e = 1765 green.**

**Docs set (same commit):** README (the 560→563 chunk-map lines + the badge 1765 + the S129 row), AGENTS.md (the census anchors + the CB7-truth rate-limiter line), CLAUDE.md (the 17-var fix), PAD **v1.3.37** (the revision block + the §8.1 rows + the Total 76/1766), the SKILL doc (the chunk map + census anchors + the animation-row wiring note + the eslint posture + the three deliberate-variant notes), the vitest header (45/1202 + the S129 re-anchor block), the cert-script re-tags (the S129/CD block + Expected 563), this entry, `docs/session_129.md`, and the three evidence frames.

## Session 130 — Batch CE (Cycle 80): the audit-driven hardening cycle — the default-deadline + loading-gate + transactional-guard + write-budget set

**The workspace rebuild + the cold baseline (BEFORE any work).** The sandbox recycled between sessions — the 21st reset: fresh clone at `6ec0d9c` (the Batch CD state + the operator's `docs/session_130.md`), bun 496 pkgs, `.env` (`DATABASE_URL="file:../db/custom.db"` — the contract), db push + seed, chromium-1243. The baseline re-certified cold: lint ✓ · tsc ✓ · unit **1202/1202** (45 files) · the canonical build green (REAL_EXIT, foreground) · the cold 5-chunk e2e **563/563 — 145+178+72+93+75, every chunk first-pass** · the register re-derivation **249/130/0/119** (the 38th consecutive hold, the expectation stated BEFORE the measurement) · the Mode-C audit of the Batch CD diff (`5fc5045`, 42 files, +1217/−138): **all 8 CD claims re-verified TRUE against the tree**, zero key material.

**Live parity (both hosts).** The standing reference battery held (the unlabeled hamburger 36px at [17,14]; no role=dialog; the 288px panel; blur(4px) + rgba(0,0,0,0.2); exactly 20 links; the landscape 992>290, maxScroll 702). **This cycle's new probe: the reference's Tasks filter SELECT dropdown computes enter/0.15s** — the CD1 dialog family on a surface never live-measured; the clone matched exactly, and the CD1 dialog parity (overlay + content, enter/0.15s) re-confirmed holding. The clone battery on a fresh reseed: ALL GREEN — the labeled hamburger, role=dialog + "Navigation menu", 288px, 20 links, blur(4px) + oklab, auto-close, /Notes clean 390=390, scroll persistence 600→600, landscape 992>301 — **no Tailwind v4 mobile-nav bug, the 35th consecutive live confirmation at baseline (the 36th at the post-fix re-verification)**.

**The audits (rotated fresh eyes — the CB-covered axes, three cycles back; CD's own closing recommendation).** Audit A — the FE views/components family (22 views + 6 layout + 21 ui + the client-consumption libs): **0C/0H/3M/10L/6I** (the M1 write-path deadline family; M2 the files-view GETs/upload; M3 the settings auth/me). Audit B — the server/persistence family (60 routes + entities/http/auth/ai + schema/seed): **0C/0H/3M/5L/6I** (the M1 non-transactional merge guard; M2 RumEvent unbounded growth + the uncovered ORDER BY; M3 the write-budget census gaps). Every M finding re-verified by direct read; the CE2/CE3/CE4/CE9 shapes (surfaced by the prior session's interrupted audit pass) re-derived and re-verified against the identical tree.

**The CE set (TDD — 12 unit + 4 e2e RED pins, all for the right reasons → GREEN; unit 1202 → 1217 [45 files], e2e 563 → 567 [146+179+72+93+77]).** **CE1 (M)** the default deadline family — `DEFAULT_GET_TIMEOUT_MS = 20_000` + `DEFAULT_WRITE_TIMEOUT_MS = 30_000` installed INSIDE apiGet/apiSend (every mutation call site — all ~50 in data.ts plus the view-level twins — inherits the bound at once; an explicit timeoutMs still wins: the import POST 120 s, the multipart upload signal 120 s; the login-surface timeout branch with the honest "took too long" copy). **CE2** the True/False default answer — the editor DISPLAYED "True" while the stored draft kept "" and the submit rejected with "needs a correct answer"; the type switch seeds the stored default (verified live end-to-end: the save succeeds without touching the select). **CE3** the view loading gates — the shell pre-warms only the ACTIVE view; the background loadAll window rendered FALSE empty states (nine sites across six views: notes ×2, events, exams, assignments, timetable ×2, flashcards ×2 — the tasks-view spinner idiom, the e2e pin holds the in-flight window). **CE4** the rum-panel state machine — a FAILED initial load rendered the error alert AND the "Loading the field metrics…" line forever; the three-state render + both GETs bounded + the fallback badge's dark pair. **CE5 (M)** the transactional merge guard — the factory update validated against a PRE-WRITE snapshot (two concurrent single-leg PATCHes could commit an inverted row no single request would accept, the corrupted row locking the inversion in); the three guarded delegates (events/grades/timetable) re-read INSIDE db.$transaction (the BZ7 pattern), the construction contract failing loudly when a beforeWrite delegate lacks txModelName. **CE6 (M)** the write-budget census close — files/folders POST → the upload: 20 bucket (previously the only table-writing POST with no budget); files/[id] DELETE + ai/messages DELETE + calculator/history DELETE + settings/preferences PATCH → the shared write: 600 key; auth/logout the one documented exemption; the census MACHINE-ENFORCED (the script-conventions pin). **CE7** the import seam — the 64-char id atom (idField's own), the 28-entry per-field length registry mirroring validation.ts's atoms, the update-branch single-leg merge guards against the stored partner leg, the P2002 concurrent-create race → a named 409 (thrown OUT of the transaction — a return would have committed the prior rows). **CE8** the analytics tokenization — the five `#8b5cf6` chart literals → `rgb(var(--sf-primary))` (the rum-panel sparkline's form); the S9-K pin corrected with the provenance. **CE9** the sweep set — quill's render-phase ref write → the effect idiom; the studygroups dialog's stale members base → the BX10 fresh read; the RUM GET/export id tiebreaks; the http header's 413 line; the retention trims' take: 1000 + the 15 s transaction timeouts; `@@index([parentId])` on FileFolder; GRADE_LEVELS single-sourced; the exam duration clamp 5..600; three dark-hover pairs; the member-email sr-only Label; the duplicate createdAt line dropped (live-corrected against the reference — its Profile tab renders exactly "Account created: {date}"); the notebook rename rides the mutation seam; the RumEvent retention trim to the newest 2000 (the CA19 index decision STANDS on the trimmed table).

**TDD discipline.** RED first: 16 failing pins verified for the right reasons (the unit 12 — incl. the CE6 census's 6 offenders and the CE5 census's no-$transaction discriminator; the e2e 4 — the CE2 lying-UI reproduction [the dialog stayed open], the CE3 false-empty live catch [BOTH sites], the CE4 lying loading line, the CE7 unbounded-id 200). GREEN: unit **1202 → 1217** (45 files), e2e **563 → 567**. Guardrails held: no test weakened (the four corrected pins are the documented corrections their source changes demand), no lint/type rule loosened.

**The honest mid-run corrections.** (1) The CE2 pin's `input[type="text"]` locator — the implicit type attribute never matches a CSS attribute selector; `getByLabel` instead. (2) The CE5 census pin's card-delegate assertion — over-reach (the card delegate owns no cross-field invariant); relaxed to the true txModelName wiring. (3) The s17 "Account created" pin caught my wrong-sided L9 fix — the LIVE reference check settled it (the reference renders the Account-created line, NOT Member-since; the fix inverted: the clone-only Member-since line goes, the reference-measured line stays, the email-verified status rides the email line). (4) The import-row-guard boundary legs — the registry caps tasks.title at 200 now; the legs re-scoped to an unregistered field. (5) The rum-panel edit shifted the hue-tokens residual register (138 → 143) — re-anchored with the provenance, the guard working as designed. (6) The api-timeout pin's `let`-narrowing — the holder + reader-function shape.

**The re-cert.** lint ✓ · tsc ✓ · unit **1217/1217 (45 files)** · build green (REAL_EXIT) · the cold 5-chunk e2e **567/567 — 146+179+72+93+77, every chunk first-pass** (chunk 4's first run caught correction (3); the fix + rebuild + re-run green) · the register tripwire **249/130/0/119 — the exact hold (the 39th consecutive)**. The live battery on the fresh-seeded daemon ALL GREEN — **the 36th consecutive no-Tailwind-v4-bug confirmation** — plus the CE2 default verified live and the CE-cycle Select parity re-confirmed. Three evidence frames in `docs/screenshots/130-clone-*.png`, all verified non-blank. **Census: 1217 unit + 567 e2e = 1784 green.**

**Docs set (same commit):** README (the 563→567 chunk-map lines + the badge 1784 + the S130 row), AGENTS.md (the census anchors + the CE6 write-budget census line + the RUM retention note), PAD **v1.3.38** (the revision block + the §8.1 rows + the Total 76/1785), the SKILL doc (the four census anchors), the vitest header (45/1217 + the S130 re-anchor block), the cert-script re-tags (the S130/CE block + Expected 567), the plan's §5, this entry, and `docs/session_131.md` (the record, the odd-increment convention: 123→125→127→129→131).

## Session 131 — Batch CF (Cycle 81): the audit-driven hardening cycle — the per-email-budget + shared-bucket-warning + OTP-digest + always-cold set

**The workspace continuation (the 22nd — no recycle).** The sandbox survived between sessions: `git pull` fast-forward to the operator's `14510d3` (`docs/session_132.md`, the CE transcript), the environment re-verified rather than rebuilt (node_modules/db/chromium-1243/agent-browser intact, `.env` on the contract). The baseline re-certified cold BEFORE any work: lint ✓ · tsc ✓ · unit **1217/1217** (45 files) · the canonical build green (REAL_EXIT, foreground) · the cold 5-chunk e2e **567/567 — 146+179+72+93+77, every chunk first-pass** · the register re-derivation **249/130/0/119** (the 40th consecutive hold, the expectation stated BEFORE the measurement) · the Mode-C audit of the Batch CE diff (`7288769`, 57 files, +1627/−149): **all 9 CE claims re-verified TRUE against the tree, zero key material**.

**Live parity (both hosts).** The standing reference battery held (the unlabeled hamburger 36px at [17,14]; no role=dialog; the 288px panel; blur(4px) + rgba(0,0,0,0.2); exactly 20 links; the landscape 992>290). **This cycle's new probe: the reference's mobile drawer computes animation: none on BOTH enter and exit** — a plain conditional mount, never live-measured before; the clone matches BY CONSTRUCTION (the S118/Q1 plain mount) and by live sample — the probe closes clean and retires the exit-animation suspicion class for the drawer surface. The clone battery on a fresh reseed ALL GREEN — **the 37th consecutive no-Tailwind-v4-bug confirmation at baseline (the 38th at the post-fix re-verification)**.

**The audits (rotated fresh eyes — the s130 closing recommendation; both axes last deep-covered CD, two cycles back).** Audit A — the app shell + routing + design tokens + auth screens family: **0C/0H/1M/5L/4I** (the M1 the per-IP-only register/resend budgets with the unconditional scrypt burn). Audit B — the crypto/auth core + infrastructure configs + test-infra family: **0C/0H/1M/8L/6I** (the M1 the "local" fallback collapsing every per-IP auth budget into ONE shared bucket). Every M finding re-verified by direct read; the App Router socket-access infeasibility verified against Next 16's NextRequest typings BEFORE the plan (the audit's primary recommendation is not implementable — the honest alternative taken); the CF11 parity question settled by a LIVE reference probe (its login page is LIGHT-ONLY under dark-OS — the clone's dark hairline is a clone-side dark-correctness item, never a parity constraint).

**The CF set (TDD — 15 unit + 3 e2e RED pins, all for the right reasons → GREEN; unit 1217 → 1236 [45 files], e2e 567 → 570 [147+179+72+94+78]).** **CF1 (M)** the per-email auth budgets — `registerAcct:`/`resendAcct:` payload-keyed 5/15-min budgets checked before every DB read and scrypt burn (a 429 answers identically for known and unknown emails — the CB12/BX2 pattern, no enumeration oracle; a rotated-XFF flood was a single-worker CPU DoS + unbounded unauthenticated table growth). **CF2 (M)** the shared-bucket posture made loud — `directExposureProdWarning` (production + explicit TRUSTED_PROXY_HOPS=0 → the CB14-precedent boot warning naming the sitewide-lockout consequence) + DEPLOYMENT.md/AGENTS.md/.env.example notes + the truth-table pins. **CF3** the reseed_e2e footgun (the script deleted the DEV database under Bun's `.env` auto-load — hard-targeted to db/e2e.db before the client construction, the resolved path printed). **CF4** the e2e posture pins (SEED_DEMO/DISABLE_IN_APP_OTP/DISABLE_IN_APP_RESET/TRUSTED_PROXY_HOPS pinned in the webServer env — an operator's exported deployment env red-hazed the suite with no diagnosable cause). **CF5** the always-cold default runner (`scripts/e2e-cold-reset.sh` — port-guard + rm — chained into test:e2e; the S46 doctrine was cert-path-only). **CF6** the cert-runner truth pair extended (run-cert-chunk.sh exits on PIPESTATUS[0] — a no-match grep false-REDed green runs; the two cert scripts' CHUNKS arrays byte-identical by machine pin). **CF7** the OTP digest at rest + the timing-safe compare (VerificationToken stored the LIVE 6-digit code verbatim while PasswordResetToken hashes — the BR6 posture extended: hashResetToken at both mints, the new timingSafeEqualBuffer seam, the BV11a conditional consumption carries the digest; the response still delivers the plaintext code per ADR-013). **CF8** the resend 429 honesty (the catch rendered the SUCCESS line on a real 429 — the user waited for a code never sent). **CF9** the drawer focus restore at the lg breakpoint (document.contains() passes while the hamburger is display:none — focus silently dropped to <body>; checkVisibility() + the desktop-chrome fallback). **CF10** the dead-code sweep + the siteUrl self-heal (the dead post-reset prefill line; the login-route consts un-exported per the http.ts layering rule; URL.canParse guards `new URL(siteUrl())` at layout module scope). **CF11** the login-card hairline dark pair (the arbitrary-value class pair — the exact sRGB light stops kept, the slate-800/700 dark stops added).

**TDD discipline.** RED first: 15 unit + 3 e2e pins verified for the right reasons (the CF8 lying-success reproduction, the CF11 light-stops-on-dark-card, the CF9 focus-on-body — after one wrong-reason first run [the test never navigated; the BY10 blank-page lesson], corrected and re-verified). GREEN: unit **1217 → 1236** (45 files — script-conventions +10, env-check +4, site +3, auth +2) · e2e **567 → 570**. Guardrails held: no test weakened, no lint/type rule loosened.

**The honest mid-run corrections.** (1) **THE CF5 DESIGN CORRECTION** — the plan placed the cold reset in global-setup; the first GREEN attempt died ECONNREFUSED: **Playwright boots the webServer BEFORE globalSetup** (empirically verified — the port-guard killed the suite's own server). The reset moved to the pre-boot seam (the chained script) and the census pin now asserts global-setup carries NO rm/port-kill. (2) The CF7 schema pin's look-back window missed the inline column comment — re-scoped to the line itself. (3) The three e2e appends landed outside their describes with an unbalanced brace (tsc caught it). (4) The CF9 agent-browser live probe read focus-on-body from viewport-race noise — the deterministic playwright-core probe confirmed the fix (the e2e had already proven it on the standalone build twice).

**The re-cert.** lint ✓ · tsc ✓ · unit **1236/1236 (45 files)** · the canonical build green (REAL_EXIT) · the cold 5-chunk e2e **570/570 — 147+179+72+94+78, every chunk first-pass on the final tree** · the register tripwire **249/130/0/119 — the exact hold (the 41st consecutive)**. The live battery on the fresh-seeded daemon ALL GREEN — **the 38th consecutive no-Tailwind-v4-bug confirmation** — plus the CF-cycle's own live verifications: the CF9 focus on the sidebar's "Dashboard" link after the lg crossing; the CF11 dark stops (rgb(30,41,59)/rgb(51,65,85)) on the dark login card; the CF7 digest at rest (`01e0fa9f…` stored, the plaintext code verifies and signs in). Three evidence frames in `docs/screenshots/131-clone-*.png`, all verified non-blank. **Census: 1236 unit + 570 e2e = 1806 green.**

**Docs set (same commit):** README (the chunk-map lines + the badge 1806 + the S131 row), AGENTS.md (the census anchors + the S46 self-cold note), PAD **v1.3.39** (the revision block + the §8.1 rows + the Total 76/1807), the SKILL doc (the census anchors), the vitest header (45/1236 + the S131/CF re-anchor block), the cert-script re-tags (the S131/CF block + Expected 570), `.env.example` (the CF2 note), DEPLOYMENT.md (§3's shared-bucket note), the plan's §5, this entry, and `docs/session_133.md`.

**Deferrals (documented, with rationale):** the scrypt KDF parameter/versioning migration (the format pin at auth.test.ts:233 + the DUMMY equalizer regeneration + the N-raise availability trade-off — a measured cycle of its own, the next-cycle candidate) and the Docker non-root runtime (a build-time chown never reaches the runtime-mounted volume — an untested USER switch breaks existing deployments; the deploy-axis verification pass). **Next cycle suggestion: the KDF migration, or rotate to the FE views axis (last deep-covered CE).**

## Session 132 — Batch CG (Cycle 82): the audit-driven hardening cycle — the exhausted-bucket-equalizer + peppered-OTP + forgot-budget + boot-failure-surface set

**The workspace rebuild (the 23rd continuation — a full recycle this time).** The sandbox died between sessions; the tree was REBUILT (fresh `git clone` of the Batch CF state `56f80e8` + the operator's `9a1a182`, `bun install`, `bunx playwright install chromium` — the fresh sandbox lacked the browser binaries and every "failure" in the first cert pass was that, zero source defects — `db:push` + `db:seed` re-run, `.env` on the contract). The baseline re-certified cold BEFORE any work: lint ✓ · tsc ✓ · unit **1236/1236** (45 files) · the canonical build green · the cold 5-chunk e2e **570/570 — 147+179+72+94+78** (chunk 3's first pass showed 71/72 — a self-inflicted port-3100 collision from a concurrent foreground playwright run during the background cert; the tool-discipline lesson re-learned; the clean re-run 72/72 first-pass) · the register re-derivation **249/130/0/119** (the 42nd consecutive hold) · the Mode-C audit of the CF diff: **all 11 CF claims re-verified TRUE, zero key material**. **This session was then interrupted mid-RED-phase** (context exhaustion after the plan + the CG2 auth pins landed); the continuation re-verified the surviving tree and re-derived the full RED phase from the plan before GREEN.

**Live parity (both hosts).** The standing reference battery held (the 288px panel, no role=dialog, the 4px blur backdrop, exactly 20 links, instant open, the scrollable nav, desktop 260/260) + this cycle's reference probes: the reference drawer's body scroll stays `visible` while open (the clone's `overflow: hidden` lock is a documented superset) and the reference `shadow-2xl` computes the identical final layer (the clone's trap-13 zero-alpha prefixes serialize to the same geometry). The clone battery: `drawer-check-s14` **GREEN** — **the 39th consecutive no-Tailwind-v4-bug confirmation at baseline** — plus the agent-browser live walk (labeled hamburger + aria-expanded, focus lands on Close, Escape closes + restores scroll + returns focus, drawer Tasks → /Tasks + unmounts).

**The audits (rotated fresh eyes).** Audit A — the auth/crypto/infra axis: **0C/0H/2M/4L/1I** (the crypto core affirmed clean). Audit B — the FE/views/mobile axis: **0C/0H/1M/6L/4I** (all 13 Tailwind traps affirmed clean; the drawer contract affirmed clean). Every M finding re-verified by direct read before the plan.

**The CG set (TDD — 16 unit + 5 e2e RED pins, all for the right reasons → GREEN; unit 1236 → 1251 [45 files], e2e 570 → 575 [149+179+74+94+79]).** **CG1 (M)** the login timing equalizer on the exhausted account bucket (the exhausted `loginAcct:` branch answered the uniform 401 with ZERO scrypt work while the no-user branch burned — a ~30-36 ms account-existence oracle; the branch now burns `verifyPassword(password, DUMMY_LOGIN_HASH)` before the return). **CG2 (M)** the peppered OTP digest (the unkeyed SHA-256 over the 10^6 space fell to a <1 s offline sweep from any DB read, voiding CF7's guarantee — `hashOtpCode` HMACs with AUTH_SECRET at both mints + the compare; the 24-byte reset token keeps `hashResetToken`). **CG3 (M)** the forgot per-email budget (the third sibling rode no `*Acct:` key — a rotated-XFF flood superseded the victim's just-issued reset link + write churn; `forgotAcct:` payload-keyed 5/15-min before the lookup). **CG4** the warning/posture parse-seam unification (`parseTrustedProxyHops` relocated to env-check with auth re-exporting; `directExposureProdWarning` decides through the parser — `" 0"`/`"00"`/`"-1"`/`"two"` all warn). **CG5 (M)** the boot data-failure surface (the BT12 residual closed — the tracked loadAll outcome + the amber `role="alert"` bar with Retry, stacked above the offline pill). **CG6** the CE3 gate sweep completed (Settings Subjects/Holidays, the Analytics stat row, the Calendar empty messages — the false zero-stats/empties gone; the S17 fresh-user contract preserved). **CG7** the CA7 modified-click guard on the three dashboard CTAs (SectionLink, Start My Day, the overdue View All). **CG8** the Splash gate-failure `role="alert"` (WCAG 4.1.3). **CG9** the boot-script token derivation (seven hand-maintained TOKENS arrays → ONE exported `BOOT_TOKEN_SUFFIXES` embedded into the script; the per-accent alignment deep-equal-pinned; AP3/AQ1 re-anchored; the B-I11 globals note). **CG10** the proxy port-isolation documentation (DEPLOYMENT.md §2/§3 + .env.example). **CG11** the register global containment budget (`registerGlobal:` 40/15-min before the per-IP key; the CF1 comment narrowed honestly).

**TDD discipline.** RED first: 16 unit + 5 e2e pins verified RED for the right reasons (the `hashOtpCode is not a function` family; the census regexes missing the absent keys; the truth-table rows failing on the raw compare; the e2e discriminators failing on the missing bar/guard/gate/budget), with the 1236 baseline otherwise green throughout. GREEN: unit **1236 → 1251** (45 files — auth +4, script-conventions +4, env-check +4, theme-cache +3) · e2e **570 → 575**. Guardrails held: no test weakened, no lint/type rule loosened.

**The honest mid-run corrections.** (1) **CG3's exhausted shape — the plan §2 was wrong, §3 was right**: the shipped answer is the honest 429 (the CF1 siblings' own shape; the CF8 success-on-429 defect class), not the uniform `{ok:true}` — the payload-keyed budget keeps the no-oracle property either way (the e2e known+unknown legs prove it live); the census pin written for §2 was rewritten before GREEN. (2) The unit projection 1246 → executed **1251** (the CG4 block landed four pins; +15 recounted). (3) The e2e projection 574 → executed **575** (CG7 landed two legs — two of the three guarded sites pinned directly). (4) The hue-tokens residual register shifted 197 → 209 (the CG7 comments moved the overdue chip's line — the line-anchored guard fired as designed, re-anchored with provenance). (5) The S89/AP3 + S90/AQ1 pins re-anchored to the derived list (the contract carries; the `not var TOKENS` leg proves the hand-maintained era is gone). (6) The capture-script lessons (the fresh-context no-session timeout → the drawer-check demo sign-in; the live-page route-interception goto abort → the API-level login on the context jar). (7) The background-cert process lesson (the nohup'd loop died with the invoking shell's process group — `setsid` detaches it properly).

**The re-cert.** lint ✓ · tsc ✓ · unit **1251/1251 (45 files)** · the canonical build green (foreground) · the cold 5-chunk e2e **575/575 — 149+179+74+94+79** (chunk 2's first run showed 178/179 — the S81/AH2a departed-Save choreography flaked under chunk load, zero source overlap with the CG diff; reproduced GREEN standalone cold + the clean chunk re-run 179/179 first-pass) · the register tripwire re-measured **250/131/0/119** (the 43rd consecutive hold; the +1/+1 is this cycle's own capture script, Usage line per the convention) · the live drawer battery GREEN on the remediated tree — **the 40th consecutive no-Tailwind-v4-bug confirmation** · three evidence frames in `docs/screenshots/132-clone-*.png` (desktop, mobile drawer, the new CG5 bar). **Census: 1251 unit + 575 e2e = 1826 green.**

**Docs set (same commit):** README (the badge 1826 + the census lines + the S132 row), AGENTS.md (the census anchors), PAD **v1.3.40** (the revision block + the §8.1 Total row), the SKILL doc (the census anchors), the vitest header (45/1251 + the S132 re-anchor block), the cert-script re-tags (the S132/CG block + Expected 575), `.env.example` (the CG10 note, included in the commit), DEPLOYMENT.md (§2/§3), the plan's §5 (the as-executed record), this entry, and `docs/session_135.md`.

**Deferrals (documented, with rationale):** the scrypt KDF parameter/versioning migration (the fifth deferral — the availability trade-off needs its own measured cycle; the seam re-audited clean), the Docker non-root runtime, the resend/forgot ms-scale timing equalization, the drawer-link emission-order coupling, the flashcards render-phase unlatch, the iOS scroll-lock nuance, the RFC 7239 signed-proxy posture. **Next cycle suggestion: rotate the deep-audit axes to the data/import/export + entities/factory families (last deep-covered the earliest); the KDF migration remains the standing candidate.**

## Session 133 — Batch CH (Cycle 83): the audit-driven hardening cycle — the manifest-key + import-parity + subjectId-index + envelope-seam set

**The 24th workspace continuation — the workspace SURVIVED this time.** The tree, `.env` (the `DATABASE_URL="file:../db/custom.db"` contract), `db/`, and the :3000 dev daemon all carried over from the s132 close; `git pull` landed the operator's `2743cd9` (`docs/session_136.md`, the CG transcript) clean. The baseline re-certified cold BEFORE any work: lint ✓ · tsc ✓ · unit **1251/1251** (45 files) · the canonical build green · the cold 5-chunk e2e **575/575 — 149+179+74+94+79, every chunk first-pass** (the S81/AH2a flake class did not recur) · the Mode-C audit of the CG diff: **all 11 CG claims re-verified TRUE against the tree, zero key material**.

**Live parity (both hosts).** The standing reference battery held (the 288px panel, no role=dialog, the 4px blur backdrop, exactly 20 links, instant open, the scrollable nav, desktop 260/20/260) and the clone battery stayed GREEN — `drawer-check-s14` **GREEN — the 41st consecutive no-Tailwind-v4-bug confirmation at baseline** — plus the agent-browser live walk (labeled hamburger + aria-expanded, focus lands on Close, Escape closes + restores scroll + returns focus to the hamburger through a REAL click, drawer Tasks → /Tasks + unmounts, desktop 260/20/260 identical).

**The audits (rotated fresh eyes — the s132 closing directive: the data/import/export + entities/factory axes).** Audit A — the data/import/export/persistence axis: **0C/0H/3M/2L/3I** (the persistence plane affirmed clean on the auth/CSRF/cap/budget posture, the secret guards, the one-transaction import, the prototype/injection surfaces, the client hygiene, the race pins). Audit B — the entities/factory server axis: **0C/0H/1M/3L/2I** (the factory plane affirmed clean on IDOR-by-construction, validation, transactions/cascades, dates, error shapes, secret hygiene). Every M finding re-verified by direct read before the plan; docs/remediation-plan-session133.md written and validated against the codebase BEFORE execution.

**The CH set (TDD — 40 unit + 3 e2e RED pins, all for the right reasons → GREEN; unit 1251 → 1291 [45 files], e2e 575 → 578 [149+180+74+94+81]).** **CH1 (M)** the dead CE7 registry keys renamed to the manifest names (`decks.*` — the `flashcardDecks.*` keys could never match the route's manifest iteration and the deck caps were inert their whole life, machine-enforced wrong by the census pin) + the manifest-consistency census (every registry key's prefix must be a real export collection). **CH2 (M)** the import-parity contract completed — the five missing enum vocabularies (single-sourced as exported validation.ts arrays), the four hexColor fields, the four missing length atoms, the grades ≤1000 ceiling, the min-1 registry (trim-aware: whitespace-only rejects, padded imports verbatim), the 64-char key bound; an imported Z-week timetable class or a 99999/99999 grade now answers the actionable 400. **CH3 (M)** the ten `subjectId` FK indexes (every Subject DELETE previously ran TEN unindexed SetNull full-table scans — the CE9 class 10× wider) + the FK-column index census (every relation column machine-checked for leftmost coverage — the CE9 claim no longer hand-asserted) + the honest comment correction. **CH4 (M)** the envelope-validator twin closed: `validateImportEnvelope` is the stateless single source aligned to the route's shipped contract, the route consumes it (the S126 lesson-2 hazard — the unit-pinned seam had ZERO production callers while the inline twin drifted on the missing-data and version stages), the `duplicateIdError` helper unifies the last twin message, the caller census machine-guards the consumption. **CH5 (L)** the JSON-column registry corrected (the phantom `practiceTests.topics` dropped, `exams.topics` added, the array-ness generalized). **CH6 (L)** the 400-body echo bounded (the cycle offender list truncated to 10 + "and N more"; the field-name interpolations capped at 64). **CH7 (L)** the /export count grid refreshes after an in-panel import (`router.refresh()` — the server-rendered counts go honest without a reload). **CH8 (L)** the trim-before-check on the title/name family (the AM1/BS5 doctrine's gap — blank titles now 400, padded titles store trimmed). **CH9 (L)** `MAX_UPLOAD_BYTES` moved out of the route file (the repo's one live S125/BZ8-rule violation) + the route-export census. **CH10 (I)** the 20 s GET deadline single-sourced through api.ts (the "SAME constant, never a copy" comment is now true).

**TDD discipline.** RED first: 40 unit + 3 e2e pins verified RED for the right reasons (the census regexes missing the absent keys; the FK census naming exactly the ten subjectId columns; the route census missing the seam call; the Z-week class importing 200; the Tasks chip staying "Tasks0"; the blank title answering 201), with the 1251 baseline otherwise green throughout. GREEN: unit **1251 → 1291** (data-import +29, schema-indexes +1, script-conventions +3, api-timeout +3, validation +4) · e2e **575 → 578**. Guardrails held: no test weakened, no lint/type rule loosened.

**The honest mid-run corrections.** (1) The unit projection was ~1277; the executed census is **1291 (+40)** — the CH2 block landed fourteen pins and the CH4 re-anchor split one. (2) The e2e projection was exact: **578**. (3) The gates caught the test-infrastructure drift themselves — the census typing (tsc), the Set handling, the data-store mock's missing `DEFAULT_GET_TIMEOUT_MS` export (the CH10 derivation), and the route refactor's leftover `envelope.user` — each fixed before GREEN closed. (4) The CE7 key census + the "unknown field" leg re-anchored in place. (5) The CH2 e2e pin's fixed-id collision on standalone re-runs (the S46 class) — a stamped probe id. (6) The capture script's two dev-mode flakes (the /export cold-compile goto; the hydration race on the Import button) — the API-level login adopted (the s132 precedent's own lesson, twice-learned); the third run GREEN first-pass. (7) The tripwire instrument lesson: "usage-line-free" = importers − carriers (the s77-era definition) — the reconciled register reads **251/132/0/119**.

**The re-cert.** lint ✓ · tsc ✓ · unit **1291/1291 (45 files)** · the canonical build green · the cold 5-chunk e2e **578/578 — 149+180+74+94+81, every chunk first-pass** · the live drawer battery GREEN on the remediated tree — **the 42nd consecutive no-Tailwind-v4-bug confirmation** · the register tripwire re-measured **251/132/0/119** (the 44th consecutive hold; the +1/+1 is this cycle's own capture script, Usage line per the convention) · three evidence frames in `docs/screenshots/133-clone-*.png` (desktop, mobile drawer, the new CH7 counts-refresh surface — the capture script's own chip-flip wait 12 → 13 + the passing e2e pin are the machine proof; the probe row deleted after). **Census: 1291 unit + 578 e2e = 1869 green.**

**Docs set (same commit):** README (the badge 1869 + the census lines + the S133 row), AGENTS.md (the census anchors), PAD **v1.3.41** (the revision block + the §8.1 Total row), the SKILL doc (the census anchors), the vitest header (45/1291 + the S133/CH re-anchor block), the cert-script re-tags (the S133/CH block + Expected 578 in both), `.env.example` verified current (no new env vars — included in the commit per the contract), the plan's §5 (the as-executed record), `docs/session_137.md`, and this entry.

**Deferrals (documented, with rationale):** the scrypt KDF parameter/versioning migration (the SIXTH deferral — now the front-of-queue standing candidate; it needs a measured availability cycle of its own), the pre-CE5 unguarded delegates (theoretical), the write-budget census granularity, the boot double-fetch (ADR-014's contract), the newest-500 window vs import minting (the documented posture), the Docker non-root runtime, the resend/forgot ms-scale timing equalization, the drawer-link emission order, the flashcards render-phase unlatch, the iOS scroll-lock nuance, the RFC 7239 signed-proxy posture. **Next cycle suggestion: the KDF migration (sixth deferral) or rotate the deep-audit axes back onto the auth/crypto/infra + FE/views families (the s131 axes, three cycles stale).**

---

## Session 134 — Batch CI (Cycle 84): the audit-driven hardening cycle + the KDF migration — the scrypt-KDF + expiry-pin + 429-pin + MyDay-guard + calc-gate set

**The 25th workspace continuation — the sandbox RESET this time; the environment re-provisioned from zero** (a fresh clone at `32a15c0` = the Batch CH state `b8d833b` + the operator's `32a15c0` [`docs/session_138.md`, the CH transcript]; `.env` re-created from the current `.env.example`, `db/` re-pushed + re-seeded, the dev daemon re-started [S32 recipe, preflight GREEN], chromium-1243 re-provisioned after the fresh `bun install` raised Playwright's pinned browser build). The baseline re-certified cold BEFORE any work: lint ✓ · tsc ✓ · unit **1291/1291** (45 files) · the canonical build green · the cold 5-chunk e2e **578/578 — 149+180+74+94+81, every chunk first-pass, zero flakes** · the Mode-C audit of the CH diff: **all 10 CH claims re-verified TRUE against the tree, zero key material**.

**Live parity (both hosts).** The standing reference battery held (the 288px panel, no role=dialog, the 4px blur backdrop, exactly 20 links, instant open, the scrollable nav, desktop 260/20/260) and the clone battery stayed GREEN — `drawer-check-s14` **GREEN — the 43rd consecutive no-Tailwind-v4-bug confirmation at baseline** — plus the agent-browser live walk (labeled hamburger + aria-expanded, focus lands on Close, the inner panel 288px white `animation:none`, Escape closes + restores scroll + returns focus to the hamburger through a REAL click, drawer Tasks → /Tasks + unmounts, desktop 260/20/260 identical).

**The audits (rotated fresh eyes — the s133 closing directive, BOTH options executed: the KDF migration as the cycle's centerpiece AND the axes rotated back to the auth/crypto/infra + FE/views families, three cycles stale).** Audit A — the auth/crypto/infra axis: **0C/0H/2M/5L/7I** (the auth plane affirmed clean on the session HMAC/v embed, sessionVersion, one-shot token consumption, the enumeration discipline, OTP/reset at-rest, the boot guard, the proxy-hop contract, cookie flags, body-cap/CSRF, C1, error shapes, db-path, secret hygiene — plus the audit's own KDF seam inventory that fed CI1's design). Audit B — the FE/views axis: **0C/0H/2M/5L/4I** (the FE plane affirmed clean on React correctness, hydration safety, the CE3 idiom in 16 views, trap-4, the z-index scale, the a11y core, the state/data layers, consistency; mobile-nav verdict CONFORMS). Every M finding re-verified by direct read before the plan; docs/remediation-plan-session134.md written and validated against the codebase BEFORE execution.

**The CI set (TDD — 18 unit + 2 e2e defect pins verified RED for the right reasons, plus the coverage pins [CI2/CI3/the legacy legs/the CI8 register] landing green on current code, the designed expectation for missing-test findings → GREEN; unit 1291 → 1314 [45 files], e2e 578 → 584 [150+181+74+94+85]).** **CI1 (M — the B-L3 sixth deferral CLOSED)** the scrypt KDF parameter/versioning migration: the 6-part format `scrypt$N$r$p$salt$key` at the OWASP floor (N=2^17, r=8, p=1 — the pre-migration seam rode Node's defaults at 2^14, 8× under, no parameter discriminator), the legacy 3-part dual-verify, `needsRehash` + rehash-on-login as the drain, the explicit maxmem at every call site (VERIFIED: both Node 24 and Bun 1.3.14 throw at 2^17 without it), cross-runtime byte-equality verified, and **the transition equalizer** (`burnLoginScryptWork`: every login attempt burns exactly ONE 2^14 + ONE 2^17 scrypt across the {no-user, legacy-row, current-row, malformed-row} branch matrix — the naive migration would reopen the ~8× timing account-existence oracle the BR3/CG1 lineage closed; the vi.hoisted `scryptBurns` census machine-guards the invariant) + the reset route's mint hoisted above its `$transaction` (audit A-L1 — the ~0.9 s burn never holds the SQLite write lock). Measured availability: legacy 63/98 ms, current 537/857 ms (Node/Bun), login attempt ~0.6–0.95 s, chunk 5's e2e 49 s → 1.4 m. **CI2 (M)** the session-token expiry pin pair (forged-signed expired payloads — the branch was unpinned at every layer). **CI3 (M)** the per-IP 429 behavioral quartet (login/register/forgot/reset on their own TEST-NET IPs; distinct emails per request so the per-EMAIL budgets never shadow the per-IP keys). **CI4 (M)** the MyDay quick-add in-flight guard (the held-route double-Enter pin — pre-fix 2 rows, post-fix 1). **CI5 (M)** the calculator History CE3 loading gate (the one view the CG6 sweep missed). **CI6 (L)** the hygiene set (secureRandomBytes retired, SESSION_TTL_SECONDS derived, the over-declared TRUSTED_PROXY_HOPS boot warning + the .env.example note). **CI7 (L)** the FE set (the flashcards pre-warm subjects leg, the notes patchSelected selection-mirror, the files link-error role=alert, the assignment slider resync). **CI8 (L)** the accent-semantic violet register (four sites machine-kept in hue-tokens, both directions guarded).

**TDD discipline.** RED first: the 20 defect pins verified failing for the right reasons (the 3-part mint against the 6-part regexes; the undefined exports; the single-set burn censuses; the double-Enter's 2 elements; the false empty's count 1), with the 1291 baseline otherwise green throughout. GREEN: unit **1291 → 1314** (auth +14, script-conventions +3, secure-cookie +2, view-collections +1, env-check +4, hue-tokens +2) · e2e **578 → 584** (chunk 1 +1 [CI5], chunk 2 +1 [CI4], chunk 5 +4 [CI3]). Guardrails held: no test weakened, no lint/type rule loosened.

**The honest mid-run corrections.** (1) The CI3 register/forgot pins' first draft tripped the per-EMAIL budgets before the per-IP keys — distinct emails per request adopted. (2) The burn-census instrument needed `vi.hoisted` (the mock factory runs at module-load, before a plain array initializes) — probed before the pin was written. (3) The CI8 register's notes-view anchor drifted 6 lines (the CI7b edit above it) — the anchored leg caught it on its first day. (4) The reset-census slice closed on the inner updateMany's bracket — re-sliced to the `if (!consumed)` guard. (5) Two TS2554s (the burnLoginScryptWork second parameter made optional). (6) The capture script's frame 3 needed the authed-page pattern + a route-warm goto + one ERR_ABORTED retry (the s132/s133 lessons re-hit). (7) The unit census landed at +23, not the ~+30 projection; the e2e at exactly +6. The full list in the plan §5.

**The re-cert.** lint ✓ · tsc ✓ · unit **1314/1314 (45 files)** · the canonical build green · the cold 5-chunk e2e **584/584 — 150+181+74+94+85, every chunk first-pass** (chunk 5 at 1.4 m — the honest KDF availability delta) · the live drawer battery GREEN on the remediated tree — **the 44th consecutive no-Tailwind-v4-bug confirmation** · the register tripwire re-measured **252/133/0/119** (the 45th consecutive hold; the +1/+1 is this cycle's own capture script, Usage line per the convention) · three evidence frames in `docs/screenshots/134-clone-*.png` (desktop, mobile drawer, the new CI5 calculator-history loading gate — the capture script's own spinner-wait + the passing e2e pin the machine proof). **Census: 1314 unit + 584 e2e = 1898 green.**

**Docs set (same commit):** README (the badge 1898 + the census lines + the S134 row), AGENTS.md (the census anchors + the NEW "scrypt KDF contract" section), PAD **v1.3.42** (the revision block + the §8.1 Total row), the SKILL doc (the census anchors), the vitest header (45/1314 + the S134/CI re-anchor block), the cert-script re-tags (the S134/CI block + Expected 584 in both), `.env.example` (the CI6c over-declaration note), `docs/DEPLOYMENT.md` (the new §4b password-hashing contract), the plan's §5 (the as-executed record), `docs/session_139.md`, and this entry.

**Deferrals (documented, with rationale):** the verify-email ms-scale timing asymmetry (the standing resend/forgot class), the A-I family (documented postures/latent seams), the B-I family (the KPI gradients, the analytics rounding, the monthly-recurrence approximation, the transition-all note), the violet-200 token family (a parity-measured change of its own), the complement-burn retirement (post-transition; needs a deployed-legacy-rows census capability), and the standing s133 deferred set. **Next cycle suggestion: the KDF deferral is CLEARED — rotate the deep-audit axes onto the data/import/export + entities/factory families again (the s133 axes, two cycles stale), or take the violet-200 token family as a parity-measured cycle of its own.**

## Session 135 — Batch CJ (Cycle 85): the audit-driven hardening cycle + the violet accent-edge token family — the folders-window + route-census + edge-token + FK-message set

**The 26th workspace continuation — the sandbox RESET this time; the environment re-provisioned from zero** (a fresh clone at `1bc4319` = the Batch CI state `0b5afb1` + the operator's `1bc4319` [`docs/session_139.md` + `docs/session_140.md`, the CI record + transcript]; `.env` re-created from the current `.env.example`, `db/` re-pushed + re-seeded, the dev daemon re-started [S32 recipe, preflight GREEN], chromium-1243 re-provisioned after the fresh `bun install` raised Playwright's pinned browser build). The baseline re-certified cold BEFORE any work: lint ✓ · tsc ✓ · unit **1314/1314** (45 files) · the canonical build green · the cold 5-chunk e2e **584/584 — 150+181+74+94+85, every chunk first-pass, zero flakes** · the Mode-C audit of the CI diff: **all 8 CI claims re-verified TRUE against the tree, zero key material**.

**Live parity (both hosts).** The standing reference battery held (the 288px panel, no role=dialog, the 4px blur backdrop, exactly 20 links, instant open, the scrollable nav, desktop 260/20/260) and the clone battery stayed GREEN — `drawer-check-s14` **GREEN — the 45th consecutive no-Tailwind-v4-bug confirmation at baseline** — plus the agent-browser live walk (labeled hamburger + aria-expanded, focus lands on Close, the inner panel 288px white `animation:none`, the oklab-serialized backdrop, Escape closes + restores scroll + returns focus to the hamburger through a REAL click, drawer Tasks → /Tasks + unmounts, desktop 260/20/260 identical). **The violet-family parity probes (NEW — the measurement CI8 lacked): all four register sites re-verified live on the reference** (the tasks card class literally `hover:border-violet-200`; the flashcards flip face computed `rgb(221, 214, 254)`; the analytics chip computed `rgb(237, 233, 254)` with NO dark variant — violet-100 in the reference's own dark setting; the reference has NO accent picker — the clone's 7-accent system is the documented superset; the notes row rides the S77/AD7 documented measurement).

**The audits (rotated fresh eyes — the s134 closing directive, BOTH options executed: the axes rotated onto the data/import/export + entities/factory families, AND the violet-200 token family taken as the cycle's parity-measured centerpiece).** Audit A — the data/import/export axis: **0C/0H/1M/5L/4I** (the axis affirmed clean on the envelope identity folding, the one-transaction restore, upsert-never-deletes, FK completeness, the topo sort, the secret stripping, the caps and budgets — plus the CH-series claims re-verified). Audit B — the entities/factory axis: **0C/0H/1M/1L/3I** (the factory affirmed clean on the sent-keys filter at all 17 write sites, ownership everywhere, the owned-FK doctrine, the write-budget census, the guarded delegates' transactions, the index census). Every M finding re-verified by direct read before the plan; docs/remediation-plan-session135.md written and validated against the codebase BEFORE execution.

**The CJ set (TDD — 14 unit + 3 e2e defect pins verified RED for the right reasons, plus the coverage pins [the CJ4 absent-deckId seam leg, the export census legs, the dark-half anchors, the CJ5/CJ7 riders] landing green on current code, the designed expectation for missing-test findings → GREEN; unit 1314 → 1332 [45 files], e2e 584 → 588 [150+183+76+94+85]).** **CJ1 (M — audit B-M1)** the folders GET newest-500 window: the hand-written list was the API tree's last `asc + take` — the OLDEST-500 BZ13 shape (past 500 folders every NEWER folder vanished from the GET, created once via its POST response then invisible on every reload while its files referenced a folder the client tree did not know); the factory's desc+take+reverse form + the CA5-style 505-folder e2e pin (fresh TEST-NET user, stamped ids). **CJ2 (M — audit A-M1)** the route-side 20-collection censuses: `IMPORT_ORDER` moves to the seam (exported beside `IMPORT_FK_MAP`) + the manifest set-equality pin + the export-route findMany count/literal-key censuses + the import consumption census — a dropped collection can no longer silently export an empty family (the seam's `Partial<Record>` accepts the omission, green typecheck) or ignore rows on restore (the route-local order compiled clean). **CJ3 (L, the parity-measured centerpiece — CI8's honest deferral, now measured)** the violet accent-edge token family: `--sf-primary-edge` (the 200-level border tint, per-accent palette steps, violet byte-identical `221 214 254`) joins the accent set **17 → 18 vars** (the S3-J + boot-suffix + theme-cache pins in lockstep) + the @theme utility; the three border sites migrate (tasks hover, flashcards face, notes selected row); the notes bg rides the EXISTING `--sf-primary-softest` and the analytics chip bg rides the EXISTING `--sf-primary-empty` (both byte-identical; the @theme utility set grows six → eight for its first UTILITY consumers on those tints — the mid-run correction); the hue-tokens register re-shapes to the four DARK halves (the S92 divergent-variant doctrine — no reference ground truth for dark, 800/800/900 stay site-local) + the treated-light-half consumer census (the S94/AU2 treated-entry precedent) + the accent-tracking e2e discriminator (the notes selected border under the blue accent: violet-200 → blue-200, RED pre-fix — the family's whole point). **CJ4 (L — audit A-L2)** the required-FK null/missing rejection: the seam rejects null/non-string `cards.deckId` with the actionable message (a required FK can never be null in ANY branch); the route rejects missing-on-CREATE via the new DB-only `existingIds` census (knownIds unions the envelope's own ids and cannot discriminate the branch); undefined-on-update stays legal (the untouched case). **CJ5 (L — audit A-L5)** the colon-safe 409 race-message parse (the pure `parseImportRaceMessage` seam — ids legally contain `:` to 64 chars; the bare split truncated them) + the wrong-typed-field 400 wire pin (the PrismaClientValidationError mapping's first pin). **CJ6 (L)** the honest-docs family (CLAUDE.md's stale "NO restore/10 MiB" paragraph, the s23 budget-header recount + the chunk-isolation argument replacing the false exclusivity claim, the "is 10 MiB" test title, the CE5 census comment's unasserted card-delegate parenthetical). **CJ7 (L)** the pin riders (the `preferencesSchema` default-free machine guard — the load-bearing invariant was prose-only; the export user-block Date→ISO pin). **CJ8 (I)** the `parseImportEnvelope` header reword + the dead duplicate unknown-collection loop removal.

**TDD discipline.** RED first: the 17 defect pins verified failing for the right reasons (the null/non-string deckId rows passing the seam; IMPORT_ORDER invisible; parseImportRaceMessage not a function; the light violet sites still present; the edge var absent; the OLDEST folders window; the hardcoded violet ignoring the accent switch; the generic fields-do-not-match), with the 1314 baseline otherwise green throughout. GREEN: unit **1314 → 1332** (data-import +9, script-conventions +3, theme +2, hue-tokens +2, validation +1, data-export +1) · e2e **584 → 588** (chunk 2 +2 [CJ1 + CJ3], chunk 3 +2 [CJ4 + CJ5, relocated from s23 after the registerGlobal cap tripped]). Guardrails held: no test weakened, no lint/type rule loosened.

**The honest mid-run corrections.** (1) The CJ3 bg utilities never existed in `@theme` — both bg sites silently rendered transparent until the standing AD7/analytics computed-style pins caught it in the first re-cert chunk 2; the utility set grows six → eight, the lesson recorded in AGENTS.md (a var and its utility are two different facts). (2) The CJ4 route guard first keyed on `knownIds` (which unions the envelope's own ids) — the create-branch discriminator never fired; the DB-only `existingIds` map is the fix. (3) The CJ1 pin's first draft used fixed folder ids — the ad-hoc re-run collided on the global PKs (the cross-user 409, correct behavior); stamped ids adopted. (4) The CJ4 seam guard landed in the non-production wrapper first — moved to `validateImportEnvelope`. (5) The capture script's frame 3 needed absolute URLs + a re-capture after the utilities fix. (6) One TS2339 narrowing bug. (7) The unit census landed at +18, above the ~+8 projection; the e2e at exactly +4. (8) The CJ4+CJ5 pins' first draft (in s23, chunk 5) tripped the chunk's registerGlobal: 40 cap — two WASTED fresh-user registrations (the file-level demo storageState put the import POSTs on the demo session anyway) pushed the ~40-register chunk over and s26's register 429'd deterministically (reproduced; standalone green — the process-scoped mechanism); the pins relocated to resilience.spec.ts (chunk 3) in the BY3 demo-session form, chunk map 150+183+76+94+85, the s23 header documents the cap. The full list in the plan §5.

**The re-cert (the FINAL tree, the full 5-chunk sequence re-run after the utilities fix).** lint ✓ · tsc ✓ · unit **1332/1332 (45 files)** · the canonical build green · the cold 5-chunk e2e **588/588 — 150+183+76+94+85, every chunk first-pass** · the register tripwire re-measured **253/134/0/119** (the 46th consecutive hold; the +1/+1 is this cycle's own capture script, Usage line per the convention — the expectation stated BEFORE the measurement [252/133 + the one rider] and holding exactly; measured in the post-restart continuation, the sandbox outage having interrupted the final-gates pass — lint/tsc/unit/build all re-run green there on the identical tree) · the live drawer battery GREEN on the remediated tree — **the 46th consecutive no-Tailwind-v4-bug confirmation** · three evidence frames in `docs/screenshots/135-clone-*.png` (desktop, mobile drawer, the new CJ3 notes accent-edge surface — the capture script's own computed-border waitForFunction [blue-200 under the blue accent, the violet restored in the finally] + the passing CJ3 e2e pin the machine proof; pixel-stat-verified non-blank). **Census: 1332 unit + 588 e2e = 1920 green.**

**Docs set (same commit):** README (the badge 1920 + the census lines + the S135 row), AGENTS.md (the census anchors + the accentCssVars 18-var note + the NEW "S135 lessons" section), PAD **v1.3.43** (the revision block + the §8.1 Total row), the SKILL doc (the census anchors), the vitest header (45/1332 + the S135/CJ re-anchor block), the cert-script re-tags (the S135/CJ block + Expected 588 in both + the script-conventions Expected pin), the plan's §5 (the as-executed record), `docs/session_141.md`, and this entry.

**Deferrals (documented, with rationale):** the dark-edge token family (CJ3's honest remainder — the four dark halves stay site-local + register-anchored: no reference ground truth for dark, the 800/800/900 divergence, a future harmonization pass), the audit-A/B I-families (the documented postures), and the standing s133/s134 deferred set. **Next cycle suggestion: the violet-token family's light half is CLOSED — rotate the deep-audit axes onto the auth/crypto/infra + FE/views families again (the s134 axes, two cycles stale), or take the dark-edge harmonization as a dark-mode design pass of its own, or clear one of the standing timing-equalization deferrals.**

## Session 136 — Batch CK (Cycle 86): the audit-driven hardening cycle — the login-containment + files-race + CE3-residual + accent-literal set

**The 27th-28th workspace continuations — the sandbox recycled TWICE (before any work, and mid-execution after the RED/GREEN work but before any commit; the post-recycle continuation re-applied the full designed changeset with the two budget-side corrections baked in, re-verified gate by gate).** The environment re-provisioned from zero each time (fresh clones at `ad0d8e7` = the Batch CJ state `fae26f9` + the operator's `ad0d8e7` [`docs/session_142.md`, the CJ transcript]; `.env` re-created from the current `.env.example`, `db/` re-pushed + re-seeded, the dev daemon re-started, chromium-1243 re-provisioned). The baseline re-certified cold BEFORE any work: lint ✓ · tsc ✓ · unit **1332/1332** (45 files) · the canonical build green · the cold 5-chunk e2e **588/588 — 150+183+76+94+85, every chunk first-pass** · the Mode-C audit of the CJ diff: **all NINE CJ claims re-verified TRUE against the tree, zero key material** (censuses verified BY EXECUTION).

**Live parity (both hosts).** The standing reference battery held (the 288px panel, no role=dialog, the 4px blur backdrop, exactly 20 links, instant open, the scrollable nav 992/744, desktop 260/20/260) and the clone battery stayed GREEN — `drawer-check-s14` **GREEN — the 47th consecutive no-Tailwind-v4-bug confirmation at baseline** (the 48th on the remediated tree at re-cert). **The CK5 ground truth (NEW): the reference's first dashboard KPI icon block computes `rgb(139, 92, 246), rgb(79, 70, 229)`** — byte-identical to the clone's hardcoded accent pair; the 2nd/3rd measure blue/orange (the fixed categorical palette — only the FIRST slot is accent-semantic). **The CK8 ground truth (the false-positive measurement): the reference's MyDay empty state renders H1 followed DIRECTLY by H3** — the reference itself ships the heading-level skip; the clone's h3 was exact parity all along.

**The audits (rotated fresh eyes — the s135 closing directive: the axes back onto the auth/crypto/infra + FE/views families, the s134 axes two cycles stale).** Mode-C (the CJ diff): **0C/0H/2L/5I** — the two Lows: the "@theme utility set grows six → eight" MISCOUNT (it grew six → NINE — 6 prior + 3 CJ3 additions) and PAD §8.1's stale per-file rows. Audit A — the auth/crypto/infra axis: **0C/1H/1M/5L/6I** (**A-H1**: login has NO global containment budget — the registerGlobal: doctrine never applied to the endpoint where every request burns the full synchronous scrypt pair; the per-IP key is the forgeable first XFF hop; a rotated-XFF flood of non-existent emails skips every budget — the CPU-DoS shape register already bounds; **A-M1**: the session-cookie SET-path attribute family unpinned + the stale suite-verdict fixture; **A-L5**: the verify-email emailVerified race edge). Audit B — the FE/views axis: **0C/1H/7M/7L/5I** (**B-H1**: files-view's private loader has NO out-of-order ticket — the CC9 fetchSeq class never ported; a just-deleted row resurrects, the retry 404s; **B-M1/M2/M3**: the CE3 residual sweep — the dashboard section cards, the gradetracker/focustimer/myday stat rows, the analytics partial gate, the aiassistant empty branch; **B-M4/M5**: the KPI gradient + .sf-canvas dark wash hardcode the accent — invisible to the CJ3 register's class-pattern sweeps, the census's systemic blind spot; **B-M6**: the calendar O(cells × collections) sweep; **B-M7**: the MyDay zero-state heading — later reclassified to the documented-parity class by the reference measurement, a false positive). Every M/H finding re-verified by direct read before the plan; docs/remediation-plan-session136.md written and validated BEFORE execution.

**The CK set (TDD — 8 unit + 5 e2e defect pins verified RED for the right reasons, plus the coverage pins [the CK3 cookie family — correct-but-unpinned attributes, the designed GREEN expectation] landing green on current code; unit 1332 → 1344 [45 files], e2e 588 → 593 [150+184+79+94+86]).** **CK1 (H — A-H1)** the login global containment budget: the process-wide `loginGlobal:` 40/15-min bucket at the route head before the per-IP key, the IDENTICAL 429 copy (no new oracle) + **the success-reset** (the progressive model extended to the global budget — only FAILED logins accumulate; the attack shape never succeeds) + the sizing comment + the AGENTS/DEPLOYMENT residual + **the behavioral pin that improves on the register precedent** (source-text only there): the e2e leg reproducing the actual attack shape — 41 rotated-TEST-NET-XFF POSTs on non-existent emails, RED pre-fix all 41 answering the uniform 401 (the vulnerability itself), GREEN the first 429 at global POST 40-or-41 with the honest copy; **the pin is TERMINAL by design** (the last test of s16-perf-parity, the chunk's alphabetically-last file — the spent bucket cannot be cleaned from the wire) **with the CLEAN-SLATE pre-reset** (one successful demo login zeroes the bucket first — first429 exactly 41, deterministic regardless of chunk history). **CK2 (H — B-H1)** the files-view out-of-order ticket: the CC9 fetchSeq idiom ported to the private loader (a component-scoped `fileRowsSeq` ref; refresh() captures the ticket BEFORE the GET pair and applies only when still latest; the mount effect respects the SAME ticket alongside its cancelled flag) + the three data-store source censuses. **CK3 (M — A-M1)** the session-cookie SET-path pins: four behavioral unit legs (the clear-cookie NextResponse form — httpOnly/sameSite-lax/path=/TTL maxAge) + the auth.spec e2e wire leg (context.cookies() reads httpOnly — the family asserted on a real UI login) + the stale suite-verdict fixture corrected in place with the dated note. **CK4 (M — B-M1/M2/M3)** the CE3 residual sweep: the dashboard's three section cards each gating on its own collection, the gradetracker summary grid (the OR-form — either primary source empty during load), the focustimer stat row, the myday loading branch (the h3 greeting KEPT — the CK8 revert lesson), the analytics gate widened to its six stat families, the aiassistant `!loading &&` — pinned by the two resilience held-route legs (the CG6 precedent). **CK5 (M — B-M4+B-M5)** the accent-literal pair + the register's inline-hex widening (the census's systemic blind spot, both audits' lesson): the KPI gradient → `rgb(var(--sf-primary)), rgb(var(--sf-primary-gradient-to))` (byte-identical at violet; the categorical siblings stay fixed), the .sf-canvas dark wash → `rgb(var(--sf-primary-soft-dark) / 0.12)` (the sf-today-tint precedent), the hue-tokens inline-hex negative sweep (with the comment-line discriminator — the S92/AS1 quote-adjacency doctrine) + the two consumer pins + the theme-system e2e discriminator (the CJ3 twin — the blue pair under the blue accent, the violet restored in the finally). **CK6 (L)** the honest-docs family: the six→NINE miscount corrected at the three LIVE sites (globals.css, the README S135 row, the PAD block — with dated markers; the historical records stay as-written), the CJ4 "a decks" grammar, the CJ5 leg title. **CK7 (M — B-M6)** the calendar single-pass by-day presence map (the O(cells × collections) sweep collapses to O(cells + collections); behavior-preserving, the standing calendar e2e family the characterization net). **CK8 (M — executed then REVERTED by the reference measurement — a false positive)** the MyDay h3→h2 broke the standing S9-B/Q parity pin; the reference itself ships H1→H3 (measured live); the change reverted, the s17 leg withdrawn, the S9-B/Q pin stands as the guard. **CK9 (L — L-MC2)** the PAD §8.1 regeneration, executed LAST on the final census (every per-file row re-counted, the missing 45th unit file added, the Total consistent). **CK10 (L — A-L5)** the verify-email emailVerified guard (the uniform 400 before the token lookup) + the source census.

**TDD discipline.** RED first: the 13 defect pins verified failing for the right reasons (no loginGlobal — the flood sailed through on 401s; no emailVerified guard; the ticket absent; the inline hexes present + the token forms absent; the false empty-states/zeros rendering; the hardcoded violet pair ignoring the accent switch; the h3 level query finding nothing at level 2), with the 1332 baseline otherwise green throughout. GREEN: unit **1332 → 1344** (script-conventions +2, data-store +3, secure-cookie +4, hue-tokens +3) · e2e **588 → 593** (chunk 2 +1 [CK5], chunk 3 +3 [CK1 in s16 + CK4×2], chunk 5 +1 [CK3]). Guardrails held: no test weakened, no lint/type rule loosened.

**The honest mid-run corrections (the full ledger).** (1) The gradetracker gate's AND-form never fired under the single held route — the OR-form is the fix. (2) The CK4 analytics widening shifted the CJ3 register's line anchors (414 → 423) — re-anchored per the line-shift convention. (3) The inline-hex sweep's first draft flagged a settings-view COMMENT documenting the sf-chip-dark value — the sweep gained the comment-line discriminator (the VALUE, never a comment). (4) The CK2 pin title corrected to the component-scoped ref form. (5) The unit census landed at +12 vs the ~+8-10 projection. (6) **The CK8 REVERT — the cycle's own fix was wrong and the standing pin caught it**: the h3→h2 change broke the S9-B/Q parity pin; the live reference measurement proved the reference itself ships H1→H3; the change reverted, the leg withdrawn, the census re-tagged 594 → 593, the full re-cert re-run on the corrected build. (7) **The loginGlobal success-reset**: the first draft reset neither bucket state on success — the chunk-5 login census (the budget specs' own failed attempts) accumulated past 40 mid-chunk and 429'd eleven subsequent login-flow tests; the fix extends the progressive model to the global bucket. (8) **The flood pin's terminal position + clean-slate pre-reset**: the first draft lived mid-chunk in resilience and poisoned the alphabetically-later s16 login-bearing tests (the spent bucket cannot be cleaned from the wire — the lockout-by-design); the pin moved to the chunk's terminal position with the clean-slate pre-reset; verified — the full chunk-3 slice passes 79/79 with the flood as test #79. The full list in the plan §5.

**The re-cert (the FINAL tree).** lint ✓ · tsc ✓ · unit **1344/1344 (45 files)** · the canonical build green · the six new e2e pins verified GREEN standalone · the cold 5-chunk e2e **593/593 — 150+184+79+94+86, every chunk first-pass** · the register tripwire re-measured **254/135/0/119** (the 47th consecutive hold; the +1/+1 is this cycle's own capture script, Usage line per the convention — the expectation stated BEFORE the measurement [253/134 + the one rider] and holding exactly) · the live drawer battery GREEN on the remediated tree — **the 48th consecutive no-Tailwind-v4-bug confirmation** · three evidence frames in `docs/screenshots/136-clone-*.png` (desktop, mobile drawer, the NEW CK5 accent-gradient surface — the capture script's own computed-gradient waitForFunction [the blue pair under the blue accent, via the REAL settings-API switch, the violet restored in the finally] + the passing CK5 e2e discriminator the machine proof; pixel-stat-verified non-blank). **Census: 1344 unit + 593 e2e = 1937 green.**

**Docs set (same commit):** README (the badge 1937 + the census lines + the S136 row + the S135-row miscount correction), AGENTS.md (the census anchors + the loginGlobal residual in the auth line + the NEW "S136 lessons" section), PAD **v1.3.44** (the revision block + the §8.1 regeneration + the v1.3.43 miscount correction), the SKILL doc (the census anchors), the vitest header (45/1344 + the S136/CK re-anchor block), the cert re-tags (the S136/CK block + Expected 593 in both + the script-conventions Expected pin), DEPLOYMENT.md (the loginGlobal residual note), the plan's §5 (the as-executed record with the full corrections ledger), `docs/session_143.md`, and this entry.

**Deferrals (documented, with rationale):** the HKDF domain separation (the audit's own next-crypto-family-touch recommendation), the Cache-Control no-store hardening, the dead-`required` dialog sweep, the 500-item list-memoization family, the spinner live-region idiom, the dialog exit-animation pin pair, and the standing s133/s134/s135 deferred set. **Next cycle suggestion: the auth/crypto/infra + FE/views axes are now FRESH — rotate onto the data/import/export + entities/factory families (the s135 axes, two cycles stale), or take the dark-edge harmonization design pass, or clear the B-L2 list-memoization family as its own performance cycle.**

## Session 137 — Batch CL (Cycle 87): the audit-driven hardening cycle — the import-symmetry + cap-sizing + cards-bound + honest-copy set

**The 29th workspace continuation — the sandbox RESET; a fresh clone at `9c4e636`** (the Batch CK state `b447446` + the operator's session-log commit [`docs/session_144.md`, the CK transcript]); `.env` re-created from the current `.env.example` (`DATABASE_URL="file:../db/custom.db"` — the contract, `db/` at the repo root), `db/` pushed + seeded, chromium-1243 provisioned, the dev daemon re-started. The baseline re-certified cold BEFORE any work: lint ✓ · tsc ✓ · unit **1344/1344** (45 files) · the canonical build green · the cold 5-chunk e2e **593/593 — 150+184+79+94+86, every chunk first-pass**.

**Live parity (both hosts).** The standing reference battery held (the desktop chrome 260/20/1099) and the clone battery stayed GREEN — `drawer-check-s14` **GREEN — the 49th consecutive no-Tailwind-v4-bug confirmation at baseline** (the **50th** on the remediated tree at re-cert). **The CL5 ground truth (NEW, measured live): the reference's folder delete is IMMEDIATE — the Files folder-row "…" menu's Delete item removes the folder with NO confirmation dialog at all** (probed with a self-cleaning zz-parity-probe folder; the reference account left clean). The clone's confirm dialog is superset territory — its copy is clone-territory under the honest-copy doctrine, no parity conflict.

**The audits (rotated fresh eyes — the s136 closing directive: the axes onto the data/import/export + entities/factory families, the s135 axes two cycles stale).** Mode-C (the CK diff): **0C/0H/0M/4L/4I — all TEN CK claims re-verified against the tree** (9 TRUE, CK9 PARTIAL: PAD §8.1's Total row still off-by-one + NINE stale E2E per-file rows — the exact class CK9 was meant to close; the four touched e2e spec files re-run GREEN by execution). Audit A — the data/import/export axis: **0C/0H/1M/3L/4I** (**A-M1**: the import cap's justification arithmetic ~2× off — 25 MiB covers ~9.4 max-size files, not the documented ~18; a 10+-file user's own backup 413'd at restore — the exact BY3 class at 2× the threshold. **A-L1**: the folder-delete dialog copy mispredicts SetNull. **A-L2**: a legal many-rows envelope → P2028 → the opaque 500. **A-L3**: the export's unbounded-read residual). Audit B — the entities/factory axis: **0C/0H/2M/1L/5I** (**B-M1**: the timetable equal-times asymmetry — the interactive boundary admits a zero-length class while the import rejects `<=`, so ONE legally-created row bricks the ENTIRE all-or-nothing restore [LIVE-PROBED both modules]. **B-M2**: the cards list — the family's only unbounded read, the import route the documented ~10^5-card mint vector. **B-L1**: the import accepts far-future createdAt/updatedAt — the newest-500 window-poison vector [LIVE-PROBED: 9999 accepted]. **B-I1**: no cross-user ITEM isolation pin). Every M/L finding re-verified by direct read; docs/remediation-plan-session137.md written and validated BEFORE execution.

**The CL set (TDD — 11 unit + 3 e2e defect pins verified RED for the designed reasons + the CL9 coverage pin landing GREEN on the pre-fix tree [the CK3 designed expectation] + the CL2 413 leg re-tagged in place; unit 1344 → 1356 [45 files], e2e 593 → 596 [150+184+81+95+86]).** **CL1 (M — B-M1)** the timetable import symmetry: the seam's compare `<=` → `<` (mirroring hhmmEndBeforeStart — the only direction that repairs the round-trip for accounts already holding such rows); the e2e wire leg proves it on the API-created row itself (the create 201 → the envelope carrying that very row restores 200 → the finally-cleanup DELETE). **CL2 (M — A-M1)** the import cap sizing: 25 → **64 MiB** with the corrected arithmetic and the MACHINE-PINNED bound (floor(cap / 2,796,204) >= 18 — the next re-size reconciles with the REAL bound, not a prose claim); the 413 leg re-tagged to the 64 MiB boundary. **CL3 (M — B-M2)** the cards bounded read: the BZ13 sibling form at the **deck-completeness 5000 window** (10× the sibling newest-500 — study mode runs a deck's full set, the deck counts stay honest); the census pin. **CL4 (L)** the PAD §8.1 FULL regeneration (executed LAST on the final census: nine stale E2E rows re-counted from `playwright test --list`, the Total corrected to the honest 76/1948 direct sum with the 1952 badge census and the setup's 5-run cert artifact footnoted). **CL5 (L — A-L1)** the folder-delete dialog honest SetNull copy ("Files and subfolders inside are kept and move to All Files." — verified live + the self-verifying evidence frame). **CL6 (L — B-L1)** the import date sanity band: createdAt/updatedAt inside [2000-01-01, now+24h] or the named pre-transaction rejection (the window-poison vectors closed; user-facing date fields deliberately un-banded). **CL7 (L — MC-F4)** the analytics OR-form gate (the gradetracker doctrine on the six stat families — the AND-form could never fix the mixed-landing false zeroes it claimed to) + the held-route e2e leg. **CL8 (L — MC-F2)** the global-bucket eviction exemption (evictOldestBucket skips the Global: keys — the containment survives cross-route distinct-key pressure; the map's bound unchanged) + the behavioral flood leg. **CL9 (L — B-I1)** the cross-user ITEM isolation pin (the fresh user's task PATCHed/DELETEd from the demo context → 404 both ways — the factory's core security invariant finally wire-pinned; a coverage pin, GREEN on the pre-fix tree by design). **CL10 (L)** the import error family: P2028 → the named 413 rollback copy (the behavioral pin on the REAL PrismaClientKnownRequestError) + the P2002 409 copy naming BOTH collision causes. **CL11 (I)** the consistency trio (the myday dead gate, the strip twins single-sourced behind the seam's exported stripSecrets, the RUM trim's $transaction).

**TDD discipline.** RED first: the 11 unit pins verified failing for the designed reasons (the equal-times throw; the 64 MiB const + the arithmetic bound; the three date-band acceptances; the loginGlobal: bucket EVICTED under the flood; the P2028 → the generic 500; the three source censuses) + the e2e CL1 (the import 400 on the app's own row), CL7 (the stat group visible with the false zero), and the CL2 copy RED ("25 MiB" vs "64 MiB"), with the 1344 baseline otherwise green throughout. GREEN: unit **1344 → 1356** (data-import +7, auth +1, http-body +1, script-conventions +3) · e2e **593 → 596** (chunk 3 +2 [CL1 + CL7 in resilience, both mid-file — the CK1 flood pin stays terminal], chunk 4 +1 [CL9]). Guardrails held: no test weakened, no lint/type rule loosened.

**The honest mid-run corrections (the full ledger).** (1) The CL1/CL9 create-legs asserted 200 — the collection-POST convention answers **201**; both re-tagged, the CL1 RED then failing at the designed line. (2) The CL7 edit shifted the CJ3 register's analytics anchors (423 → 429) — re-anchored per the line-shift convention. (3) The CL3 first draft called the makeOwnedDelegate-scoped normalize from module scope — caught by typecheck, fixed pre-gate. (4) The CL11 twin deletion left NEVER_IMPORT_FIELDS unused — the import removed. (5) The CL8 bound assertion honest-formed to <= MAX_BUCKETS (the plan's "MAX_BUCKETS + 2" wording was wrong). (6) The plan's §3 listed CL9 as a true RED — corrected: a coverage pin, GREEN on the pre-fix tree. (7) The capture script's CommonJS require in an .mjs — converted to ESM. (8) **The cert's one first-run BU7 flake — the machine-load class**: the Prisma socket-timeout signature was visible in the PASSING chunks' logs (2/4/5), the dev daemon was the contention source, and the standalone cold re-run landed **150/150 first-pass** — documented honestly, never silently counted away.

**The re-cert (the FINAL tree).** lint ✓ · tsc ✓ · unit **1356/1356 (45 files)** · the canonical build green · the new pins GREEN standalone (resilience S137/CL ×3, s17 CL9, s23-import 13/13, s16+theme+auth 30/30 — the CK1 flood pin still terminal) · the cold 5-chunk e2e **596/596 — 150+184+81+95+86, every chunk first-pass** (chunk 1 re-verified standalone clean after the machine-load flake) · the register tripwire **255/136/0/119** (the 48th consecutive hold; the expectation stated BEFORE the measurement [254/135 + the one capture-script rider] and holding exactly) · the live drawer battery GREEN — **the 50th consecutive no-Tailwind-v4-bug confirmation** · three evidence frames in `docs/screenshots/137-clone-*.png` (desktop, mobile drawer, the CL5 folder-delete honest-copy dialog — the capture script's own waitForFunction on the corrected copy the self-verification; pixel-stat-verified non-blank; the demo folders list verified empty after). **Census: 1356 unit + 596 e2e = 1952 green.**

**Docs set (same commit):** README (the badge 1952 + the census lines + the S137 row), AGENTS.md (the census anchors + the S137 lessons section), PAD **v1.3.45** (the revision block + the §8.1 full regeneration), the SKILL doc (the census anchors), the vitest header (45/1356 + the S137/CL re-anchor block), the cert re-tags (the S137/CL block + Expected 596 in both + the script-conventions Expected pin), the plan's §5 (the as-executed record), `docs/session_145.md`, and this entry.

**Deferrals (documented, with rationale):** MC-F3 (the credential-holder containment window), A-L3 (the export's unbounded-read residual), A-I2 (the RUM CSV LF separator), A-I4 (the bespoke import validator), B-I2 (the calculator/history budget exception), B-I4 (the pre-warm over-provision), B-I5 (the unguarded-delegate TOCTOU), and the standing s133–s136 deferred set (the B-L2 list-memoization family now cards-bounded by CL3). **Next cycle suggestion: the data/import/export + entities/factory axes are now FRESH — rotate onto the FE/views + auth/crypto/infra families (the s136 axes, two cycles stale by then), or take the B-L2 list-memoization family as its own performance cycle.**

## Session 138 — Batch CM (Cycle 88): the audit-driven hardening cycle — the exemption-hardening + KPI-gate + containment-decrement + honest-form set

**The 30th workspace continuation — the sandbox RESET; a fresh clone at `f158877`** (the Batch CL state `f958c09` + the operator's session-log commit [`docs/session_146.md`, the CL transcript]); `.env` re-created from the current `.env.example` (`DATABASE_URL="file:../db/custom.db"` — the contract, `db/` at the repo root), `db/` pushed + seeded, chromium-1243 re-provisioned. A sandbox lesson absorbed at the start: detached background processes are reaped between tool calls, so the full-script background cert died twice — the per-chunk foreground runner (`run-cert-chunk.sh`) carried the certification. The baseline re-certified cold BEFORE any work: lint ✓ · tsc ✓ · unit **1356/1356** (45 files) · the canonical build green · the cold 5-chunk e2e **596/596 — 150+184+81+95+86** (the chunk-1/chunk-4 first-run flakes both the today-exam-probe machine-load class [the Prisma socket-timeout signature], each re-verified standalone first-pass — the honest ledger).

**Live parity (both hosts).** The standing reference battery held (the desktop chrome 260/20) and the clone battery stayed GREEN — `drawer-check-s14` **GREEN — the 51st consecutive no-Tailwind-v4-bug confirmation at baseline** (the **52nd** on the remediated tree at re-cert). **Two NEW ground truths (measured live): the reference's own Grid Builder button is a FUNCTIONAL NO-OP** (clicked live: no pressed semantics, no dialog, no cell affordances — the clone's defect was only the lying `aria-pressed`, behavioral parity already held), and **the reference's analytics Focus Time sub reads "total study hours"** (the clone's copy parity-exact — FE-4 deferred, copy parity wins on shared surfaces).

**The audits (rotated fresh eyes — the s137 closing directive: the axes onto the FE/views + auth/crypto/infra families, the s136 axes two cycles stale).** Mode-C (the CL diff `9c4e636..f958c09`): **0C/0H/1M/3L/4I — all ELEVEN CL claims verified TRUE** (the findings are residuals OF the fixes: MC-F1 the CL8 substring exemption; MC-F2 the shared-mapper P2028 import copy; MC-F3/MC-F4 the stale prose). Audit A — the FE/views axis: **0C/0H/1M/2L/2I** (**FE-1**: the dashboard KPI gate tests only `tasks` while the row's fourth card reads `focusSessions` — the exact mixed-landing false-zero class, a false "0h" Focus Time. **FE-2**: the Grid Builder dead toggle. **FE-3**: seven dead ui/ primitives + five dead Radix deps). Audit B — the auth/crypto/infra axis: **0C/1H/1M/2L/2I** (**AI-1**: the CL8 exemption is a SUBSTRING test over key material whose per-IP half embeds the raw forgeable first XFF hop — a forged `Global:<unique>` header mints unlimited DISTINCT eviction-exempt buckets on four unauthenticated routes, and once the live map is all-exempt the eviction deletes NOTHING while the insert grows it past the S121/BV9 hard cap [cross-validated by MC-F1]. **AI-2**: the login success path fully DELETES the aggregate `loginGlobal:` bucket — under the default in-band posture, 39 fails + 1 scripted success resets the CK1 CPU containment to zero forever. **AI-3**: the root Docker runtime. **AI-4**: the absent CSP). Every H/M/L finding re-verified by direct read; docs/remediation-plan-session138.md written and validated BEFORE execution.

**The CM set (TDD — 13 unit + 1 e2e defect pins verified RED for the designed reasons → GREEN; unit 1356 → 1369 [45 files], e2e 596 → 597 [150+184+82+95+86]).** **CM1 (H — AI-1/MC-F1, cross-validated)** the exemption exact-key whitelist — `PROTECTED_BUCKETS = new Set(["loginGlobal:", "registerGlobal:"])` replaces the substring test; the crafted-key injection pin (RED: `expected 2101 to be less than or equal to 2048` — the map grew past the cap under the forged keys; GREEN: the crafted keys evict like any flood, the real containment bucket survives). **CM2 (M — FE-1)** the dashboard KPI OR-form gate — the S137/CL7 doctrine verbatim (`loading && (tasks.length === 0 || focusSessions.length === 0)`) + the held-route e2e leg holding ONLY /api/focus-sessions (RED at the designed assertion: the Focus Time card Expected 0, Received 1 — the false "0h" rendered during the mixed landing). **CM3 (M — AI-2)** the loginGlobal: success DECREMENT — the new `decrementRateLimit` seam (count −1, floored at zero, no-op on missing, never re-arms a window) replaces the reset; the per-IP/per-account keys still reset (their key material IS the proven requester); the seam trio + the wire census + the S136/CK1 census re-tagged to the decrement form. **CM4 (L)** the P2028 copy scoping — the shared mapper's copy source-neutral ("split the work into smaller passes"; nine non-import $transaction sites exist), the import route's own catch carries the backup-specific remedy. **CM5 (L)** the stale-copy family — FIVE stale "25 MiB" sites re-tagged (the census walk found three more than the audit) with the machine line: the 25 MiB era is narrated ONLY in the IMPORT_MAX_BYTES doc block; the CG6 comment re-written to the OR/six-family form; the entities 5000-window comment owns its global-across-decks boundary. **CM6 (L)** the Grid Builder honest stateless form (the parity-pinned button stays; the lying aria-pressed, dead state, and dead attribute removed). **CM7 (L)** the dead-primitive deletion (seven zero-consumer ui/ files + five Radix deps via `bun remove`; the 14-consumed directory census). **CM8 (L)** the Docker non-root runtime (`USER bun` + the /data chown). **CM9 (L)** the conservative production-conditional CSP (`default-src 'self'` + `object-src 'none'` + `frame-ancestors 'none'` + `form-action 'self'` + the Next-required 'unsafe-inline' on script/style — verified served live on the standalone build and exercised by the full cert on every route; `next dev`'s HMR ungated).

**TDD discipline.** RED first: the 13 unit pins + the e2e leg verified failing for the designed reasons (the 2101 > 2048 crafted-key flood; the missing decrementRateLimit seam ×3; the source-neutral P2028 phrase absent; the censuses RED on their exact stale artifacts — five "25 MiB" sites, the AND/three-family comment, the entities phrase, the pressed-state trio, the 21-file ui directory + five deps, the missing USER, the absent CSP; the CM3/CM4 wire censuses), with the 1356 baseline otherwise green throughout. GREEN: unit **1356 → 1369** (auth +4, script-conventions +9, http-body ±0 re-tag) · e2e **596 → 597** (chunk 3 +1, MID-file, the CK1 flood pin still TERMINAL in s16). Guardrails held: no test weakened, no lint/type rule loosened.

**The honest mid-run corrections (the full ledger).** (1) The CM5 census's first draft banned the "25 MiB" literal EVERYWHERE — the walk itself surfaced the seam's own legitimate history narrative; refined to the doc-block-scoped machine line. (2) My own route-comment re-tag re-seeded the literal — caught by my own census, re-worded. (3) The CM6 census's `useState(false)` assertion was too blunt (the `busy` toggle is a legitimate sibling) — re-scoped to `setBuilder`. (4) The CM6 explanatory comment contained the banned literals — re-worded (the self-trip class). (5) The entities re-wording kept the banned substring — rephrased to "are honest BELOW the window". (6) The CK1 census re-tagged to the decrement form. (7) The hue-tokens register re-anchored +1 line (the line-shift convention). (8) The CSP's first edit landed as a top-level config key instead of a headers-array entry — caught and re-placed before the build. (9) **The chunk-3 re-run contention**: three consecutive runs each failed ONE different files-edge test (a 500, a vacuous 200, a rename prefill — each passing standalone, the socket-timeout signature in the server log); the real source was the drawer-check dev daemon spawned an hour earlier SURVIVING its tool call — killed, then **82/82 first-pass** (the S137 lesson-5 corollary, recorded as the S138 lesson 5).

**The re-cert (the FINAL tree).** lint ✓ · tsc ✓ · unit **1369/1369 (45 files)** · the canonical build green (the six Turbepack warnings pre-existing — the baseline tree shows the identical db-path traces) · the cold 5-chunk e2e **597/597 — 150+184+82+95+86, every chunk first-pass** · the register tripwire **256/137/0/119** (the 49th consecutive hold; the expectation stated BEFORE the measurement [255/136 + the one capture-s138-evidence.mjs rider] and holding exactly) · the live drawer battery GREEN — **the 52nd consecutive no-Tailwind-v4-bug confirmation** · the CSP served-and-certified (curl-verified on the standalone build, exercised by the entire cert) · three self-verifying evidence frames in `docs/screenshots/138-clone-*.png` (desktop, mobile drawer, the CM6 stateless Grid Builder — the capture script's own before-and-after waitForFunction the self-verification; pixel-stat-verified non-blank). **Census: 1369 unit + 597 e2e = 1966 green.**

**Docs set (same commit):** README (the badge 1966 + the census lines + the S138 row), AGENTS.md (the census anchors + the S138 lessons section — five lessons), PAD **v1.3.46** (the revision block + the §8.1 touched-row re-count: auth 51→55, script-conventions 38→47, resilience 30→31, the Total 1948→1962 with the badge 1966), the SKILL doc (the census anchors), the vitest header (45/1369 + the S138/CM re-anchor block), the cert re-tags (the S138/CM block + Expected 597 in both + the script-conventions tripwire re-tag), the plan's §5 (the as-executed record with the full corrections ledger), `docs/session_147.md`, and this entry.

**Deferrals (documented, with rationale):** FE-4 (the analytics Focus Time sub-caption — PARITY-PINNED, the reference's own copy measured live this cycle), FE-5 (the settings remount race — the intentional key-remount pattern), MC-F6 (the 64 MiB memory tail), MC-F7 (the knownIds/export unbounded reads — the A-L3 posture), MC-F8 (the band edges), the two default-5 s transaction sites (their P2028 copy now honest via CM4; explicit timeouts deferred), and the standing s133–s137 deferred set (MC-F3, A-L3, A-I2, A-I4, B-I2, B-I4, B-I5, B-L2). **Next cycle suggestion: the FE/views + auth/crypto/infra axes are now FRESH — rotate onto the data/import/export + entities/factory families (the s137 axes, two cycles stale by then), or take the B-L2 list-memoization family as its own performance cycle.**

## Session 150 — Batch CN (Cycle 89): the parity-integrality + round-trip-witness + covering-index + bounded-walk set

**Context.** The 31st workspace continuation — the sandbox reset; a fresh
clone at `d7733c2` (the Batch CM state + the operator's two s138 session-log
commits). The environment re-provisioned: `bun install` foreground, `.env`
from the current `.env.example` (`DATABASE_URL="file:../db/custom.db"`, `db/`
at the repo root), `db/` pushed + seeded, chromium-1243 re-provisioned (the
reset wiped the browser cache — the first chunk-1 cert attempt failed 149×
on the missing headless-shell executable, re-run first-pass; the browser
cache is part of the environment, not just `node_modules`).

**The cold baseline (before any work).** lint ✓ · tsc ✓ · unit **1369/1369**
(45 files — the documented S138 final state exactly) · the canonical build
green · the cold 5-chunk e2e **597/597** (150+184+82+95+86, every chunk
first-pass) · the drawer check GREEN (**the 53rd consecutive
no-Tailwind-v4-mobile-nav-bug confirmation at baseline**).

**The audits (rotated per the s138 closing directive — the data/import/
export + entities/factory axes; every H/M/L re-verified by direct read).**
Mode-C on the CM diff: **0C/0H/1M/4L/3I — all nine CM claims TRUE** (the
findings are residuals OF the fixes: the Docker init-user comment falsified
by the compose reality + the bind-mount EACCES mode; the login stale
SUCCESS-RESET paragraph; the `^USER ` census accepting `USER root`; the
SKILL tooltip row; the un-annotated S136 lesson; the register asymmetry;
the stale package-lock). Audit A (data/import/export): **0C/0H/3M/4L/5I** —
the parity sextet, the round-trip pin-net holes (the family's HEADLINE
promise never exercised end-to-end), the restore-availability half
(deferred as its own family); the catch-all 413, the folders row-index
drift, the note-HTML paste, the panel timeout. Audit B (entities/factory):
**0C/0H/3M/5L/2I** — the cards ORDER BY with no covering index (the CC10
class re-opened by CL3), the card delegate's unpinned ownership guard (the
CL9 class), the cycle guard's full-table read; the route-param id bound,
the dead orderBy branch, the unchecked txModelName, the unpinned mapper
legs, the CREATE-only owned-FK pin.

**Live parity.** The drawer check GREEN at baseline AND on the remediated
tree (**the 53rd/54th consecutive** — the dev daemon started and killed
inside the same command each time, the S138 lesson-5 discipline). The
reference desktop-chrome battery held (the 258px sidebar column / the
standing 260px box, exactly 20 nav items, the standing labels). No
reference-shared surface is touched by the CN set — the batteries are the
witnesses.

**The CN set (TDD: RED 18 unit + 1 e2e defect pins for the designed
reasons + 10 coverage pins GREEN-on-arrival → GREEN unit 1369 → 1391, e2e
597 → 603).** **CN1** the parity-integrality sextet (progress/dayOfWeek
integrality, maxScore ≥ 1, files mime ≤ 100 + size 0..2 MiB, the members
item shape; chatMessages.content deliberately kept at the 100 K PERSISTED
bound — the round-trip contract outranks the interactive bound).
**CN2** the round-trip witness quartet (the version floor, the empty
envelope, the cross-account 409, and THE HEADLINE: the demo's own export
posted back verbatim restores clean, created: 0 — the "own your data"
promise finally witnessed across all 20 collections; the S117 cards break
would have been caught by exactly this leg). **CN3** the Flashcard
`@@index([createdAt, id])` covering index. **CN4** the card-delegate
ownership wire pins (foreign card/deck 404s). **CN5** the folder
cycle-guard's bounded ancestor walk (one findFirst per hop feeding the
unchanged wouldCreateCycle seam; the AK1 family re-proves the guard).
**CN6** the typed BodyTooLargeError 413 catch. **CN7** the
sanitize-before-sort reorder (the TRUE row index in the rejection copy).
**CN8** the panel's isTimeoutError branch. **CN9** the doc-accuracy
sextet (Dockerfile + DEPLOYMENT.md §8 bind-mount note + login paragraph +
USER-bun regex + SKILL row + AGENTS annotation + register asymmetry).
**CN10** the P2002/P2025/P2003 mapper trio + the owned-FK re-point leg.
**CN11** the route-param 64-char bound + the dead orderBy branch deleted +
the txModelName resolution check + the stale package-lock.json deleted.

**The honest mid-run corrections (the full ledger in the plan's §6).** The
round-trip leg's first home (chunk 3's resilience) 429'd behind S124/BY5's
deliberately-spent demo export budget mid-chunk — relocated to chunk 2's
s14-hardening where both budgets run free (the S135/CJ class, elevated to
the S139 lesson 2: inventory what the chunk SPENDS before placing a leg
that CONSUMES); the CN7 marker re-scoped to the deterministic over-cap
form (a blank name is not a guaranteed import rejection); the CE7 registry
census re-tagged for files.mime; two typings caught by typecheck; the
chunk-3 first re-run's two AK1 500s were the machine-load class
(standalone-clean, re-run first-pass); the capture script's /export wait
re-scoped to the panel's own pinned headings.

**The re-cert (the final tree).** lint ✓ · tsc ✓ · unit **1391/1391** (45
files) · the canonical build green · the cold 5-chunk e2e **603/603 —
150+185+87+95+86, every chunk first-pass** · the register tripwire rider
arithmetic exact (importers 256 → 257, Usage-line carriers 137 → 138, stale
0 — the capture-s139-evidence.mjs rider; the 50th consecutive hold) · the
drawer check GREEN (**the 54th consecutive**) · three evidence frames
(`docs/screenshots/139-clone-*.png` — desktop, mobile drawer, the /export
portability panel). **Census: 1391 unit + 603 e2e = 1994 green.**

**The docs set (same commit).** README (the badge 1994 + the census lines
+ the S139 row), AGENTS.md (the census anchors + the S136 lesson-3
superseded annotation + the S139 lessons — five lessons), PAD **v1.3.47**
(the revision block + the §8.1 touched-row re-count: data-import 118→125,
schema-indexes 6→7, http-body 13→16, script-conventions 47→58, resilience
31→36, s14-hardening 23→24, the Total 1962→1990 with the badge 1994), the
SKILL doc (the census anchors + the tooltip row), the vitest header
(45/1391), the cert re-tags (the S139/CN block + Expected 603 in both
scripts + the script-conventions tripwire), the plan §6
(`docs/remediation-plan-session139.md`), `docs/session_150.md`, and this
entry.

**Next cycle.** The FE/views + auth/crypto/infra axes (the s138 axes, two
cycles stale by then), or the A-M3 restore-availability performance cycle
(the batching redesign + the knownIds skip).

---

## Session 151 — Batch CO (Cycle 90): the note-HTML sanitize + authed-scrypt containment + checkbox-cn + FE-hardening set — the note-HTML sanitize + authed-scrypt containment + checkbox-cn + FE-hardening set

**Received state.** `6485364` on `main` (the Batch CN fix `b557019` + the
operator's two session-log commits) — the 32nd workspace continuation, a
fresh clone with `node_modules/`, `.env`, `db/`, `.next/` all absent.

**Environment re-provisioned per the recipe.** `bun install` (491 pkgs,
6.8s), `.env` from the current `.env.example`
(`DATABASE_URL="file:../db/custom.db"`, `AUTH_SECRET=""` — the e2e-build
posture), `bun run db:push` + `db:seed` (db/custom.db at the repo root —
the three-anchor contract holding), `bunx playwright install chromium`
(chromium-1243 re-provisioned), `bun run build` green (the six documented
Turbopack warnings).

**Cold baseline BEFORE any work.** lint ✓ · tsc ✓ · unit **1391/1391**
(45 files — the documented S139 final state exactly) · build ✓ · the
mobile-navigation spec cold **20/20** · the dev-server preflight GREEN ·
the drawer check GREEN (**the 55th consecutive no-Tailwind-v4-mobile-nav-
bug confirmation**).

**Live parity re-verified fresh (agent-browser 0.41.1, BOTH hosts).** The
reference logged in with the operator account; the mobile drawer's
computed styles byte-matched (the 288px w-72 white panel, the black/20
backdrop at blur(4px) — the v3 `backdrop-blur-sm` ≡ v4
`backdrop-blur-xs` trap-9 equivalence verified live — exactly 20 links, no
footer); the desktop chrome matched (the 260px sidebar, 20 links in
order, main at x=260). The reference's `/Timetable` "My Classes" renders
its EMPTY state on the operator account — no card-cap measurement exists
(data-shaped probes non-authoritative, the S123 doctrine).

**The audits (Mode-C, read-only subagents, every M/L finding re-verified
by direct read).** The rotated triple per the s139 closing directive: the
FE/views axis **0C/0H/1M/6L/9I** (every hard rule mechanically verified
passing — the axis exceptionally clean), the auth/crypto/infra axis
**0C/0H/1M/1L/8I** (every documented contract verified upheld), and the
standing A-L3 note-HTML surface **0C/0H/1M/2L/3I** (the deferral VERIFIED
end-to-end: both entry points unvalidated, the render sink keeps remote
urls alive through Quill's blots, production leaning on the CSP alone,
zero test coverage).

**The plan.** `docs/remediation-plan-session140.md` written BEFORE any
source change (the standing doctrine): the CO1 sextet (note-HTML), the
CO2 quartet (authBurnGlobal), the CO3 cn() fix, the CO4 FE-hardening
octet, the CO5 AGENTS.md contract-line fix, the CO6 doc chain. A-M3
deferred AGAIN with rationale (its own performance cycle); the authed
sessionVersion/Cache-Control items deferred with documented rationale.

**Executed TDD-style.** RED: the note-html import-RED (10 legs), the
authBurnGlobal eviction-exemption RED (the crafted-key flood evicted the
real bucket — fixed by the PROTECTED_BUCKETS registration), the census
REDs (5 legs: the four-route authBurnGlobal markers + the AGENTS.md
success-decrement line + the two sanitize census legs). The e2e
render-gate leg's RED probe ran at the function level — the first
call-site attempt hit the noUnusedLocals type gate (the guard itself
working; the lesson recorded). GREEN: unit **1391 → 1409** (46 files:
note-html +10, auth +3, script-conventions +5), e2e **603 → 605**
(150+186+87+95+87 — chunk 2 +1 [the render-gate leg], chunk 5 +1 [the
import-door sanitize leg at demo import budget 9/10; the chunk-5 register
census has zero headroom, so no fresh user]).

**Honest mid-run corrections.** (1) The hue-tokens residual register
re-anchored — the CO3 `cn()` import shifted the dashboard residual's
line +1 and tripped both register legs (the register working as
designed). (2) The `<hr>` test expectation re-pinned to the serialized
`<hr /` form (sanitize-html's void-element serialization — the trap-10
"pin what reads back" doctrine). (3) The RED-probe relocation (lesson 6).
(4) The P1008 RumEvent socket-timeout noise class observed through the
cert WebServer logs — pre-existing (observed at baseline too), all chunks
first-pass, the documented machine-load class.

**The CN set's sibling — CO1's dependency decision.** sanitize-html
2.18.1 (+@types) joined as the repo's first new runtime dependency since
the seed: the vetted allowlist library at a server-only seam
(`src/lib/server/note-html.ts`), zero client-bundle impact
(`validation.ts`/`data-import.ts` stay dependency-free — both are
client-imported). The policy lives once in `src/lib/note-html.ts`
(client-safe data + the DOMParser render gate); the server sanitizer and
the browser gate consume the SAME allowlist.

**Re-cert (the FINAL tree).** lint ✓ · tsc ✓ · unit **1409/1409** (46
files) · build ✓ · the cold 5-chunk e2e **605/605** (150+186+87+95+87,
every chunk first-pass) · **census 2014 green**. Evidence: four
`docs/screenshots/140-clone-*.png` frames (desktop, mobile drawer, the
Notes render-gate surface with the planted legacy hostile note, the
Timetable My Classes surface — the capture script self-verifying; the
probe row cleaned from the dev db after the capture).

**Docs.** README badge/census lines + the Session-140 row; AGENTS.md
census + the S140 lessons block; CLAUDE.md's two-cycles-stale test counts
corrected (1171→1409, 560→605 — the s140 audit's own doc-drift finding);
PAD v1.3.48 (the revision block + the §8.1 Total row 77/2010 + the §11
A-L3 closure row); the SKILL doc census; the vitest header re-anchor; the
cert-script re-tag; the plan §6 as-executed close; `docs/session_153.md`;
this entry.

**Next cycle.** The A-M3 restore-availability performance cycle (the
batching redesign + the knownIds skip — now the only standing M-family
deferral), or the FE/views + auth/crypto/infra rotation again (one cycle
fresher now).

## Session 152 — Batch CP (Cycle 91): the render-gate snapshot + plain-text gate + restore-availability + size-signal set

**Received state.** `c654ed0` on `main` (the Batch CO fix `9cb5a10` +
the operator's session_154 transcript commit) — the 33rd workspace
continuation, the environment re-verified from the prior session's
provisioned state (`.env` with `DATABASE_URL="file:../db/custom.db"`,
the repo-root `db/custom.db` + scratch `db/e2e.db`, the dev daemon
live, dependencies current incl. sanitize-html 2.18.1 + Prisma 6.19.3).

**Cold baseline BEFORE any work.** lint ✓ · tsc ✓ · unit **1409/1409**
(46 files — the documented S140 final state exactly) · the dev-server
preflight GREEN · the drawer check GREEN (**the 56th consecutive
no-Tailwind-v4-mobile-nav-bug confirmation** — the reference backdrop
black/20 at blur(4px) ≡ the clone `backdrop-blur-xs`, 288px white
panels, 20 links, both hosts live) · mobile-navigation cold **20/20**.
Desktop chrome re-verified fresh (20 links in identical order, main at
x=260 w=1180 both hosts).

**The audits (Mode-C, read-only subagents, every H/M/L finding
re-verified by direct read).** The rotated pair per the s140 closing
directive: (1) the Batch CO recent-changes audit — **0C/1H/1M/5L/4I**:
the S140 DOM render gate's moved-children walk was PROVABLY dead code
(a DocumentFragment is EMPTIED by replaceChild; the post-insertion
`Array.from(frag.children)` iterated zero elements — a div-wrapped
remote img, a javascript: link, a handler, and a hostile inline style
all escaped, verified empirically in headless Chromium), and the
server sanitizer's unconditional entity encoding mangled plain text
("AT&T" → "AT&amp;T" rendered visibly through quill.setText — both
byte-identity pins were entity-free and gave false assurance); (2) the
data-portability surface (the A-M3 axis) — **0C/0H/2M/3L/3I**: A-M3 +
A-I1 still present exactly as recorded (2N+1 queries inside one 60 s
interactive tx; 20 unconditional full-table pre-scans;
journal_mode=delete + busy_timeout 5000 probed live), A-L1/L2/L4
verified FIXED with pins, plus the new facts: the notes sanitize runs
INSIDE the lock window, `maxWait` unset + the 60 s timeout pinned by
nothing, and the export/import size asymmetry has no detection point
(an export past the cap surfaces only as a 413, each retry burning
import budget).

**The plan.** `docs/remediation-plan-session141.md` written BEFORE any
source change and validated against the codebase before execution: CP1
the snapshot fix + the happy-dom unit project (the repo's first
DOM-environment test file — happy-dom 21.0.4 as a devDependency), CP2
the plain-text gate, CP3 the A-M3 restructure (contract-preserving),
CP4 the export size signal (the shared renderExportEnvelope seam), CP5
the policy-tightening pair, CP6 the depth cap, CP7 the DRY sweep, CP8
the doc chain. The A-M3 stage-2 (chunked sub-transactions + a resume
token) deferred AGAIN with rationale — it breaks the all-or-nothing
ADR-021 contract without operator direction (the s140 sessionVersion
precedent); stage-1 collapses the lock window without it.

**Executed TDD-style.** RED first: the nested-hostile corpus (the
17-leg happy-dom file — 9 legs RED on first run, reproducing the
Chromium finding exactly), the entity passthrough pair, the probe-set
derivation octet, the size-formatting trio, the route censuses. GREEN:
**1409 → 1449 unit (46 → 47 files)**, e2e **605 → 605** (the S141 pins
extended existing legs in place — the render-gate leg's wrapped-payload
interception + the s21 header/size-line assertions). The engine facts
probed empirically before chunking: SQLite 3.46, IN verified at 20 000
ids, createMany binding verified at 5 000 params. The behavioral probe
against the dev server: import #1 created 4 / import #2 idempotent
updated 4 / the stored hostile note read back stripped (probe rows
cleaned after, the demo-surface convention).

**Honest mid-run corrections.** (1) The first CP1 fix attempt walked
the moved children as containers (their own attribute gate never
fired — the per-element processElement extraction is the real fix; the
two-level probe leg passed the first attempt only because its
assertions were URL-indirect, now pinned by name). (2) The main
session's shell gateway died mid-cycle (the persistent Bash session
lost after a heavy foreground chunk run); the remaining work — the
full cert, the evidence captures, the doc chain — completed through
delegated subagents with identical results. (3) The chunk-2 cert run
observed the P1008 sandbox I/O-stall flake class (one test, a
DIFFERENT one on each independent run, co-occurring with SQLite socket
timeouts in the webServer log) — the re-run was 186/186 first-pass;
the documented machine-load class, recorded honestly.

**Re-cert (the FINAL tree).** lint ✓ · tsc ✓ · unit **1449/1449**
(47 files) · build ✓ · the cold 5-chunk e2e **605/605** (150+186+87+
95+87; chunk 2 re-run clean after the P1008 flake) · **census 2054
green**. Evidence: four `docs/screenshots/141-clone-*.png` frames
(desktop, mobile drawer, the Notes render-gate surface with the
planted WRAPPED hostile note — 0 outbound attempts + 0 remote imgs
machine-verified in the capture — and the /export panel with the size
signal; the capture script self-verifying; the probe row cleaned from
the dev db after the capture).

**Docs.** README badge/census lines + the Session-141 row; AGENTS.md
census + the S141 lessons block; CLAUDE.md count; PAD v1.3.49 (the
revision block + the §11 A-M3/A-I1/asymmetry closure rows + the §8.1
Total re-anchor); the SKILL census; the vitest header re-anchor; the
cert re-tag; the plan §6 as-executed close; `docs/session_155.md`;
this entry.

**Next cycle.** The audit rotation continues (FE/views +
auth/crypto/infra are two cycles stale again) or the A-M3 stage-2 (the
chunked sub-transactions + resume token — the one named deferral, and
it needs operator direction on the ADR-021 contract change).

## Session 153 — Batch CQ (Cycle 92): the unwrap-depth + door-alignment + byte-signal + keyboard-reachability set

**Received state.** A fresh clone at `10d5a33` on `main` (the Batch CP fix
`459e7da` + the operator's session_156 transcript commit) — the 34th
workspace continuation. The environment provisioned from scratch per the
recipe: `bun install` (510 pkgs), `.env` from `.env.example`
(`DATABASE_URL="file:../db/custom.db"`), `db:push` + `db:seed` (the
repo-root `db/custom.db` 389 KiB, demo account), Playwright Chromium
installed, the dev daemon live on :3000 via the S32 subshell recipe.

**Cold baseline BEFORE any work.** lint ✓ · tsc ✓ · unit **1449/1449**
(47 files — the documented S141 final state exactly) · the dev-server
preflight GREEN · the drawer check GREEN (**the 57th consecutive
no-Tailwind-v4-mobile-nav-bug confirmation** — reference backdrop
oklab(0 0 0 / 0.2) at blur(4px) ≡ the clone `backdrop-blur-xs`, 288px
white panels, 20 links, both hosts live) · mobile-navigation cold **20/20**
· the desktop chrome probe **MATCH** (all five formal checks — after the
s142 probe rework: the reference's login click renders a splash
containing `<main>` while still on `/login` (the s141 main-wait
resolved on the splash and evaluated in the re-render window — the
all-nulls artifact); the reference redirects its SPA shell to
`/Dashboard` (the clone serves `/` — both are the settled dashboard);
the reference's first `<nav>` is an inner 258px div inside the 260px
shell (the s156-documented probe artifact — the OUTER footprint is the
shared measurement). `scripts/parity-probe-s142.mjs` settles on
nav-links + heading (pathname-agnostic), waits for the enabled submit
button before clicking, and checks the outer sidebar: 260=260, 20 links
in identical order, mainX 260=260, mainWidth 1180=1180).

**The audits (Mode-C, read-only subagents, every M/L finding re-verified
by direct read).** The rotated pair per the s141 closing directive (the
FE/views + auth/crypto/infra axis, two cycles stale): (1) the Batch CP
recent-changes audit — **0C/0H/2M/3L/3I**: the CP6 depth cap never
counted the UNWRAP path (`processElement(m, depth)` — a purely
disallowed `<div>` chain recursed unbounded; the max-expressible
~9 090-level chain within the 100k content cap threw RangeError inside
the editor mount, the S140-recorded class still open), and the export
size signal counted UTF-16 code units (`json.length`) while every cap
in the family counts real bytes (a non-ASCII account straddling the
64 MiB restore cap got NO warning; the demo seed's own — / · already
under-reported); (2) the FE/views + auth/crypto rotation — **0C/0H/1M/
1L/2I**, the surface substantially clean (all SPECIAL-ATTENTION
invariants re-verified holding: ownership scoping on every route, the
scrypt KDF contract, the timing equalizer's uniformity, no innerHTML
outside the pinned gates, the fail-closed XFF parse): the note-actions
menu nested the notebook-mover Select inside `role="menu"` —
keyboard-unreachable (WCAG 2.1.1 Level A on a real affordance), the
exact S125/BZ3 nested-interactive class missed at this site for 17
sessions; the appearance pickers' failed-save rollback was not
compare-and-swap.

**The plan.** `docs/remediation-plan-session142.md` written BEFORE any
source change and validated against the codebase before execution: CQ1
the unwrap-depth increment, CQ2 the byte-based size signal, CQ3 the
BZ3-pattern Popover conversion, CQ4 the P2025 named-409 leg, CQ5 the
two-door anchor alignment, CQ6 the AGENTS.md census machine gate, CQ7
the CAS-guarded rollbacks, CQ8 the verify-email tx-fresh mint, CQ9 the
doc chain. The A-M3 stage-2 deferred AGAIN with rationale (the ADR-021
contract change needs operator direction).

**Executed TDD-style.** RED first: the disallowed-chain cap legs (the
happy-dom probes found the environment's own throwers — happy-dom's
serializer and [connectedToNode] cascade throw at ≥4 000 nesting natively,
so the ≥4k not.toThrow shape is browser-only; the shipped pin covers the
cap SEMANTICS: markup beyond the cap dies, its text survives), the
aligned-anchor legs at both doors (RED 6/37 → GREEN 42/42 in the
note-html family), the exportByteSize byte-vs-code-unit family, the six
census legs. The mid-flight corrections, recorded honestly: the CQ2
first draft used Buffer (the client-imported seam — caught by the
import-graph check, shipped as TextEncoder); the CQ3 e2e leg raced
Radix's asynchronous roving focus (an Enter after an Arrow committed the
still-focused CURRENT option — the deterministic shape polls for the
landed focus before the commit key); the depth-cap collapse's own
`child.textContent` was a native recursion that would throw the same way
(the shipped subtreeText collects text via an explicit stack — the
rescue mechanism must not itself be the thrower).

**Re-cert (the FINAL tree).** lint ✓ · tsc ✓ · unit **1466/1466**
(47 files) · build ✓ · the cold 5-chunk e2e **606/606** (150+187+87+95+
87) — the chunk-3 cert runs observed SELF-INFLICTED CONTENTION (the
unit suite ran in a parallel tool call during the cert; 2 failed then 1
— the same BU1 files-view leg, green in 2.5s isolation, co-occurring
with the P1008 socket-timeout class) — the contention-free re-run
**87/87 first-pass**. Lesson recorded in AGENTS: run the cert ALONE.
**Census 2072 green** (was 2054).

**Evidence.** Four `docs/screenshots/142-clone-*.png` frames (desktop,
mobile drawer, the Notes actions popover with the mover combobox holding
focus — the CQ3 proof riding the frame, machine-verified — and the
/export panel with the byte-based size signal; the capture script
self-verifying).

**Docs.** README badge/census lines + the Session-142 row; AGENTS.md
census (both rows, the 603-vs-605 drift closed) + the S142 lessons
block; CLAUDE.md counts; PAD v1.3.50 (the revision block + the §11
closure rows); the SKILL census; the vitest header re-anchor; the cert
re-tag (605 → 606); the plan §6 as-executed close; `docs/session_157.md`;
this entry.

**Next cycle.** The audit rotation continues (the import/export +
data-portability axis is one cycle fresh; the FE/views + auth/crypto
axis just swept) — or the A-M3 stage-2 (the chunked sub-tx + resume
token, the one named deferral, needs operator direction on the ADR-021
contract change).

## Session 154 — Batch CR (Cycle 93): the own-keys + non-text-tag-door + typed-import-delegate + sequence-CAS set

**Received state.** A fresh clone at `d0af6cb` on `main` (the Batch CQ
fix `4184366` + the operator's session_157 transcript commit) — the
35th workspace continuation. The environment provisioned from scratch
per the recipe: `bun install` (510 pkgs), `.env` from `.env.example`
(`DATABASE_URL="file:../db/custom.db"`), `db:push` + `db:seed` (the
repo-root `db/custom.db` 389 KiB, demo account), Playwright Chromium
installed, the dev daemon live on :3000 via the S32 subshell recipe.

**Cold baseline BEFORE any work.** lint ✓ · tsc ✓ · unit **1466/1466**
(47 files — the documented S142 final state exactly) · the drawer check
GREEN (**the 58th consecutive no-Tailwind-v4-mobile-nav-bug
confirmation** — reference backdrop oklab(0 0 0 / 0.2) at blur(4px),
288px white panels, 20 links, both hosts live) · the desktop chrome
probe **MATCH** (all five formal checks — `scripts/parity-probe-s142.mjs`
with REF_PROBE_* exported; sidebar outer 260=260, 20 links in identical
order, mainX 260=260, mainWidth 1180=1180).

**The audits (Mode-C, read-only subagents, every M/L finding re-verified
by direct read).** The rotated pair per the s142 closing directive (the
entities/factory axis, five cycles stale, plus the standing
recent-changes focus): (1) the Batch CQ recent-changes audit —
**0C/0H/1M/4L/5I**: all eight CQ claims verified TRUE at the source
level (the DOM walker's recursive-edge enumeration: every edge bounded;
no `as any` introduced; the straggler/completeness greps clean) — the
M: **A-M1** three of the eight fixes (CQ4 the P2025 named-409, CQ7 the
CAS rollbacks, CQ8 the tx-fresh mint) are pinned ONLY by source-text
censuses, not behavior (a catch-leg reordering that shadows P2025
passes green); the Ls: the vitest header's per-file arithmetic slip
("+7", actual +6), the CQ3 e2e leg's stale comment (describes the
ArrowUp path the code does not run), the appearance CAS compares VALUES
not request identity (the same-value ABA the cited fetchSeq idiom does
not have), the verify-email pre-tx select's dead sessionVersion column
(dead since CQ8); (2) the entities/factory rotation — **0C/0H/0M/1L/3I**,
the axis substantially clean (all eight SPECIAL-ATTENTION invariants
re-verified holding: ownership scoping on every route, the sent-keys
filter at all 17 write sites, the write-budget census, the guarded
delegates' transactions, the index census, the FK onDelete parity, no
raw SQL, the date discipline) — the L: **B-L1** `sentKeysPatch`'s
membership test `key in parsed` walks the prototype chain: a hostile
PATCH body carrying `toString`/`constructor`/`valueOf` injects the
inherited FUNCTIONS into the Prisma write data →
PrismaClientValidationError → the shared mapper's 500 (the 400-family
taxonomy's one reachable violation on interactive paths).

**Two pre-plan probes (the doctrine — probe, don't guess).** (1) The
11-tag two-door corpus: the five NON-TEXT tags (script/style/textarea/
option/xmp — exactly sanitize-html's default nonTextTags, verified
against the library source) DIE WHOLE at the server write door but
their TEXT SURVIVED the DOM render door's unwrap branch (noscript/
template/title/iframe unwrap to text at BOTH doors; comments/PIs die at
both) — the CQ5-family residual of "the two doors accept the SAME
payload set", promoted to CR2. (2) The hostile-body sentKeysPatch
probe: the write set came back [toString, constructor, valueOf,
hasOwnProperty, title] with `writes.toString` a FUNCTION — B-L1
behaviorally demonstrated pre-fix. The interrupted prior run's named
hypotheses were re-verified independently before inclusion (the mover
Select's missing accessible name; the import-router's three inline
any-casts; the non-text asymmetry); the quill-mount last-line-of-defense
guard was considered and DECLINED with rationale (the plan §5).

**The plan.** `docs/remediation-plan-session143.md` written BEFORE any
source change and validated against the codebase before execution: CR1
the own-keys guard + the shared PrismaValidation leg, CR2 the shared
non-text-tag policy at both doors, CR3 the mover's accessible name, CR4
the typed import-delegate seam, CR5 the sequence-ticket CAS, CR6 the
importRestoreError behavioral seam, CR7 the dead-column drop, CR8 the
comment-accuracy trio, CR9 the doc chain. The A-M3 stage-2 deferred
AGAIN with rationale (the ADR-021 contract change needs operator
direction).

**Executed TDD-style.** RED first: the hostile-body leg (pre-proven by
the §0 probe), the five non-text legs on the DOM door (pre-proven by
the corpus probe — the server-door twins green-on-arrival, pinned
against drift), the fetch-seq seam family (module-absent RED), the
importRestoreError family (seam-absent RED, 6 legs). The honest
mid-flight corrections: (1) the CR2 depth-cap leg's first RED exposed a
SECOND leak the plan had not named — the cap branch's own subtreeText
collector was re-collecting script text from BEYOND the cap (the
non-text check before the cap stops the walker's resurrection; the
collector now skips non-text subtrees entirely — the two-door contract
holds past the cap, not just under it); (2) the CR6 delegation design
re-shaped mid-flight to the honest NULL-delegation boundary (the seam
returns null for the shared-mapper families — toErrorResponse stays the
single source; the seam's tests pin the delegation contract); (3) the
CR4 comment's first draft quoted the old any-cast shape verbatim —
which would have false-failed the new no-any-cast census (comments
mentioning a pattern look like the pattern to a source-text census);
reworded to describe the shape without the literal; (4) THE TEMPLATE
RIDER, found LAST by the evidence capture's live machine proof in real
Chromium — a `<template>`'s children live in its inert `.content`
fragment (never as direct children), so the unwrap branch moved
nothing and the container-family text died at the DOM door in real
browsers while the server door keeps it (happy-dom keeps template
children direct — the unit corpus's environment boundary, the S142
≥4k-serializer class's sibling); fixed with the `.content ?? child`
source and re-verified by the full unit suite, a fresh tsc, a rebuild,
and the affected e2e families re-run green.

**Re-cert (the FINAL tree).** lint ✓ · tsc ✓ · unit **1490/1490**
(48 files, +24: sent-keys-patch +1, http-body +1, note-html-dom +4,
note-html +2, fetch-seq +4 [NEW FILE], data-import +6,
script-conventions +6) · build ✓ · the cold 5-chunk e2e — the map
unchanged at 606 (the S143 pins re-anchored existing legs in place: the
CQ3 mover locator is now the NAMED combobox form, failing if the
accessible name regresses) · **census 2096 green** (was 2072).

**Evidence.** Four `docs/screenshots/143-clone-*.png` frames (desktop,
mobile drawer, the notes-actions popover with the mover combobox
holding focus AND carrying its accessible name — machine-verified in
the capture — and the planted non-text legacy note rendering with the
five non-text texts machine-verified ABSENT from the editor while the
container family's text is present — the frame that FOUND the template
.content rider (template-kept was absent on the first run; the fixed
capture is GREEN); the probe row cleaned from the dev db after the
capture — the demo-surface-restoration convention).

**Docs.** README badge/census + the Session-143 row; AGENTS.md census +
the S143 lessons block; CLAUDE.md counts; PAD v1.3.51 (the revision
block + the §11 closure rows); the SKILL census (both sites); the
vitest header re-anchor; the cert re-tag (606 unchanged, in-place
re-anchors); the plan §6 as-executed close; `docs/session_159.md`; this
entry; the `.env.example` contract re-verified complete against every
env var the code reads.

**Next cycle.** The audit rotation continues (the FE/views +
auth/crypto/infra axis one cycle fresh; the import/export +
data-portability axis two cycles stale; the entities/factory axis just
swept) — or the A-M3 stage-2 (the chunked sub-tx + resume token, the
one named deferral, needs operator direction on the ADR-021 contract
change).

---

## Session 155 — Batch CS (Cycle 94): the cursor-dequeue + row-ceiling + mime-charset + instance-scoped-CAS set

**Workspace (the 36th continuation).** Fresh clone at `88739ca` on `main`
(the Batch CR fix `7ada703` + the operator's session_160 transcript
commit). Environment provisioned per the recipe: `bun install` (510
pkgs), `.env` from `.env.example` (`DATABASE_URL="file:../db/custom.db"`),
`db:push` + `db:seed` (`db/custom.db` 389 KiB), Playwright Chromium,
the dev daemon live on :3000.

**Cold baseline (before any work):** lint ✓ · tsc ✓ · unit **1490/1490**
(48 files — the documented S143 final state exactly) · the drawer check
GREEN (**the 59th consecutive no-Tailwind-v4-mobile-nav-bug
confirmation**) · the desktop chrome probe **MATCH** (all five formal
checks). Baseline noise: none.

**The audits (two read-only Mode-C subagents, every M/L finding
re-verified by direct read):**

- **Audit A — the Batch CR recent-changes axis** (the `7ada703` diff):
  **0C / 0H / 1M / 2L / 3I**. All nine CR claims verified TRUE at the
  source level — with one structural exception: **A-M1** — CR5's
  sequence-CAS was DEFEATED at the call sites by per-render
  instantiation (`createFetchSeq()` in the AppearanceCard function body
  → every render mints a fresh seq → every pick's ticket is 1 on its
  own instance → `isCurrent` always true → the guard degenerated back
  to the unconditional S127/CB15 rollback: the ABA re-opened AND the
  S142 value-compare's different-value protection regressed — only
  census pins covered the call sites, and a census cannot see
  instantiation SCOPE). The L: **A-L1** the CR2 template rider taught
  the unwrap branch but not the depth-cap collector (a `<template>`'s
  children live in its inert `.content` fragment — probed in BOTH
  happy-dom 21.0.4 and Chromium — so template text ≥500 deep died at
  the DOM door's collapse while the server door kept it); **A-L2** the
  shared PrismaClientValidationError→400 leg logged nothing (its own
  comment names its target as latent Zod↔Prisma drift — a SERVER-side
  bug — now silent in production logs). Is: the stale happy-dom
  environment comment (folded into CS6), the census-only call-site pins
  (folded into CS1), test-hygiene nits (carried §5).
- **Audit B — the import/export + data-portability axis** (two cycles
  stale): **0C / 0H / 2M / 2L / 4I**. The axis verified in strong shape:
  the all-or-nothing ADR-021 transaction contract genuinely DELIVERED
  (every write inside the one 60s tx — file blobs ride the `files.data`
  column inside it; all PKs are client-supplied cuids so no sequence
  bumps), auth/authz airtight on both doors, the hostile-key write-set
  pollution-free (empirically probed: object-valued `__proto__`
  rejected by the row guard's primitive check before the copy;
  primitive `__proto__` a setter no-op; `constructor`/`toString` own
  keys reach Prisma as unknown fields → the named 400), and the prior
  findings (B-I1 grades maxScore, the byte-signal chain, the P2025 leg)
  all still closed. The M: **B-M1** the folders topo sort's
  `queue.shift()` dequeue is O(n²) — the only superlinear pre-tx stage,
  so one authenticated hostile import pins the event loop sitewide
  (re-measured on this Node: 27 ms at 2×10⁴ → 2,842 ms at 2×10⁵ — 25x
  rows, 104x time, ~12 minutes projected at the byte cap's ~10⁶-row
  ceiling; the audit's ~13 s at 10⁵ constant did NOT reproduce — the
  reproduce-before-trusting doctrine cuts both ways); **B-M2** the
  import route's `IMPORT_MERGE_GUARDS` wiring (the B-I1 mitigation)
  pinned by NOTHING (zero test references — deleting the guard call
  ships green). The L: **B-L1** a hand-crafted `files.mime` with CR/LF
  passed the length-only guard, persisted, then threw TypeError at
  every download (`new NextResponse(headers)` — Node/undici rejects
  control characters in header VALUES; probed: the 500-on-read taxonomy
  break; fails closed — no header injection; hostile-self-import only);
  **B-L2** no max-ROWS cap anywhere (the 64 MiB byte cap bounds the
  BODY, not the ~10⁶-row parsed tree — several hundred MB resident per
  hostile request, no deadline).

**Executed TDD-style.** RED first — the honest inventory: the CS2 250k
STAR topo-sort leg at **9.7 s** elapsed vs the 2 s bound (the first
draft accidentally picked a CHAIN — the degenerate easy case that
keeps the live queue at ≤2 elements and passed GREEN at 856 ms; the
star is the honest worst case: the queue fills at the root's pop and
every shift moves the whole tail); the CS4 mime-charset quadruple + the
downloadHeaders clamp pair; the CS5 IMPORT_MAX_ROWS constant pair +
the route census; the CS6 template-beyond-cap collector leg; the CS7
drift-log spy; the CS3 merge-guard pins (GREEN-on-arrival by design —
the missing-pin class, the S137/CL9 precedent); and the two e2e RED
legs against a PRE-FIX build — **CS1** (the route-intercepted
late-failing PATCH rolled the accent store back over a newer pick —
Green stayed `aria-pressed="false"`, the exact designed failure) and
**CS5** (the 100,001-row envelope imported 200 — the amplification
sails through pre-fix). The honest mid-flight corrections: (1) the CS2
leg's chain→star re-shape after the accidental-green (the measurement
that forced it recorded in the test's comment); (2) the CS5 constant
landed BEFORE the pre-fix e2e build (the build type-checks the tests —
the module-absent RED had already proven itself at the unit layer, so
the one-line export was the minimal unblock, the route-side legs still
RED); (3) the capture script's first draft used a locator method that
does not exist on this Playwright (`isAttached` → `count() > 0`).

**The CS set.** CS1 the `React.useRef(createFetchSeq()).current`
instance-scoped CAS (the files-view idiom — the ticket lives for the
component's lifetime) + the behavioral e2e leg + the census re-anchor
(the per-render shape now banned). CS2 the cursor dequeue (the queue
only ever grows during iteration — the BFS order, emitted set, and
cycle-rejection preserved exactly at O(n); 317 ms at the 250k star, 30x
under the shift form's 9.7 s). CS3 the merge-guard wiring pins (census
+ the inverted-grade-row e2e leg — a stored `{score: 40, maxScore: 50}`
leg against a `{id, score: 90}` envelope answers the named 400 with
the row unchanged). CS4 the mime charset guard at the import door
(printable ASCII — exactly the browser's `entry.type` emission grammar,
empty still passes) + the `downloadHeaders` Content-Type clamp
(belt-and-suspenders for pre-fix rows; the export/rum callers pass
literals — unaffected). CS5 `IMPORT_MAX_ROWS = 100_000` (the seam
constant, the byte-cap precedent) checked at the cheapest post-parse
point in the route — before the per-row loops, the IN-probes, and the
topo sort — answering the named 413. CS6 the collector's `.content`
template source (the unwrap rider's twin) + the stale happy-dom
comment re-worded (the environment narrative was wrong; the code was
robust either way). CS7 the PrismaValidation drift log (the
`[api] prisma validation error:` channel — the client keeps the honest
400, the operator keeps the diagnosis; the spy pins it). CS8 the doc
chain.

**Re-cert (the FINAL tree).** lint ✓ · tsc ✓ · unit **1500/1500**
(48 files, +10) · build ✓ (7.6 s compile) · the cold 5-chunk e2e
re-tagged **606 → 609** (chunk 3 +2 [the CS1 ABA leg + the CS5 row-cap
413 leg], chunk 5 +1 [the CS3 merge-guard leg] — the map
150+187+89+95+88) · **census 2109 green** (was 2096). The budget
recounts re-anchored in both spec headers (s23's demo import POSTs 8 →
9/10; resilience's 4 → 5/10).

**Evidence.** Four `docs/screenshots/144-clone-*.png` frames
(desktop, mobile drawer, the Settings appearance card THROUGH the ABA
scenario — the machine proof riding the frame: the GREEN swatch holds
`aria-pressed="true"` past the late-failing PATCH, violet/blue false —
and the /export Restore card with its size signal + the cold-disabled
Import posture). The capture is SELF-VERIFYING (exists, >10 KiB,
byte-diverse, md5-distinct, both machine proofs asserted; the
interception isolates the DB — no PATCH reaches the server, no probe
cleanup needed).

**Docs.** README badge/census + the Session-144 row; AGENTS.md census
+ the S144 lessons block (six lessons: closure-scoped guards are
per-render guards; the shift-dequeue quadratic class and the
chain-vs-star pin shape; the byte cap does not bound the parsed tree;
stored columns flowing into header values need charset bounds at both
ends; bug-fix families have twins; a named 400 that hides a server
bug is worse than the 500 it replaced); CLAUDE.md counts (correcting
its own two-cycles-stale 605 — the s140 doc-drift class reborn); PAD
v1.3.52 (the revision block + the §11 closure row); the SKILL census
(both sites); the vitest header re-anchor; the cert re-tag; the plan
§6 as-executed close; `docs/session_193.md`; this entry; the
`.env.example` contract re-verified complete against every env var the
code reads (unchanged — the S143 verification held).

**Next cycle.** The audit rotation continues (the FE/views +
auth/crypto/infra axis two cycles stale after S142's sweep — the next
rotation candidate; the import/export + data-portability axis just
swept; the entities/factory axis one cycle fresh) — or the A-M3
stage-2 (the chunked sub-tx + resume token, the one named deferral —
the operator's standing "best judgement" instruction grants the
authority, but the ADR-021 contract change deserves its own cycle with
its own ADR; the CS5 row ceiling closed the adjacent memory hazard).

## Session 156 — Batch CT (Cycle 95): the completion-window + supersede-tx + gradient-CTA + budget-recount set

**Workspace (the 37th continuation).** Fresh clone at `d962537` on `main`
(the Batch CS fix `b4a76a5` + the operator's session_161/162 transcript
commit). Environment provisioned per the recipe: `bun install` (510 pkgs),
`.env` from `.env.example` (`DATABASE_URL="file:../db/custom.db"`),
`db:push` + `db:seed` (`db/custom.db` 389 KiB), Playwright Chromium
(headless-shell 1243), the dev daemon live on :3000.

**Cold baseline (before any work):** lint ✓ · tsc ✓ · unit **1500/1500**
(48 files — the documented S144 final state exactly) · the drawer check
GREEN (**the 60th consecutive no-Tailwind-v4-mobile-nav-bug
confirmation**) · the desktop chrome probe **MATCH** (all five formal
checks). Baseline noise: none.

**The audits (two read-only Mode-C subagents, every M/L finding
re-verified by direct read):**

- **Audit A — the Batch CS recent-changes axis** (the `b4a76a5` diff):
  **0C / 0H / 0M / 1L / 2I**. All seven CS claims verified DELIVERED at the
  source level — the claims table CONFIRMED on every row (the cursor
  probe: 0 mismatches over 300 random forests; the mime-charset probe; the
  census arithmetic machine-verified). The L: **A-L1** — the
  demo-import-budget census the s144 commit re-anchored was MIS-COUNTED:
  s23's header said "exactly 9" while the file makes 10 demo-session
  POSTs (omitting the S140/CO1 leg and mislabeling the panel-journey
  in-app POST) — 10/10 ZERO HEADROOM at the import limiter's 10/15-min
  cap; the resilience cross-reference said "5" while the file carries 9
  (8 fixture + 1 demo.request). The Is: the CS5 row cap is post-parse by
  design; the CR5/CAS double-failure edge (pre-existing S143 semantics).

- **Audit B — the FE/views + auth/crypto/infra axis** (two cycles stale):
  **0C / 0H / 1M / 2L / 6I** — the axis substantially clean: the
  historically-real families re-verified CLOSED (the ABA/late-response
  class with its tickets; the auth core — scrypt/HMAC/boot guards; the
  route authz; the error taxonomy; the ownership scoping; the FE
  structural gates). The M1 — **B-M1** — the focus timer's completion
  window re-armed from its own terminal state: after the auto-completion,
  mode stayed "focus" and remaining stayed 0 through the in-flight save
  (and forever after a failed save — the catch only a toast), the Start
  button stayed enabled, and complete() had no saving guard, so a Play
  press at 00:00 POSTed a phantom full-duration session from zero elapsed
  time (a double-log inside the window; the late .then/.catch state
  writes also clobbered newer mode picks — the S142-S144 ABA family). The
  L: **B-L1** the forgot-password supersede pair ran as two un-transacted
  awaits (breaking the route's own one-live-link invariant under a
  concurrent same-account race); **B-L2** the export panel's two primary
  CTAs were the codebase's only solid bg-sf-primary CTA violations of
  the house gradient convention.

**Executed TDD-style.** RED first — the honest inventory: the three unit
census legs (CT1 markers, CT2 $transaction, CT4 header text) RED 3/3; the
e2e REDs against the PRE-FIX build — CT1a at `toBeDisabled` (the Start
button stayed enabled through the in-flight window), CT1b at the Long
Break `aria-pressed` (the late .then clobbered the newer pick), CT3 at
`background-image "none"` (the solid CTAs). The fake-clock drive itself
was validated FIRST by a throwaway probe against the dev daemon (clockText
"00:00" + POST #1 observed before the designed assertion failures were
trusted — the new S145 "prove the drive" doctrine).

**The fixes:** CT1 the completion-window set in
`src/components/views/focustimer-view.tsx` — the saving latch (`if
(saving)` guard + unlatch), `disabled={saving}` on the Start button,
the failure re-latch to a fresh full duration, and the settle-CAS (the
house `React.useRef(createFetchSeq()).current` ticket minted at POST
time and invalidated by switchMode/applyPreset/reset — the .then/.catch
state writes currency-gated, the toasts unconditional). CT2 the
forgot-password supersede pair in ONE batch `$transaction` (the
one-live-link invariant). CT3 the export-panel CTAs riding `.sf-gradient`
+ `.sf-gradient-shadow` (the house primary-CTA surface). CT4 the budget
recount (s23 header 10/10 zero-headroom warning, both inline budget
comments, the resilience cross-reference 9/10, the cert-script re-tag
note, + the census leg machine-pinning the census-visible POST counts
per file.

**Re-cert (the FINAL tree).** lint ✓ · tsc ✓ · unit **1503/1503** (48
files, +3) · build ✓ · the cold 5-chunk e2e re-tagged **609 → 612** (chunk
3 +2 [the CT1 phantom/double-log leg + the settle-CAS leg], chunk 5 +1
[the CT3 gradient-CTA leg] — the map 150+187+91+95+89) · **census 2115
green** (was 2109). Chunk 1 150 first-pass · chunk 2 187 first-pass ·
chunk 4 95 first-pass · chunk 5 89 first-pass · chunk 3 hit the documented
BU1/P1008 environmental flake class (the files-view empty-PATCH leg at
:277 — the same family the S142/S143 cycles recorded, co-occurring with
the WebServer socket-timeout noise in chunks 1/4) — the contention-free
cold re-run of chunk 3 was **91/91 first-pass** (4.1 m).

**Evidence.** Four `docs/screenshots/145-clone-*.png` frames (desktop,
mobile drawer, the focus-timer completion-window proof — the Start button
disabled through the in-flight window, exactly ONE POST, the failure
toast, the 25:00 re-latch, the fresh-retry press running a real session —
and the /export gradient CTAs — both computing
`linear-gradient(to right, rgb(139, 92, 246), rgb(79, 70, 229))`). The
capture is SELF-VERIFYING (exists, >10 KiB, byte-diverse, md5-distinct,
both machine proofs asserted; the interception isolates the DB — no POST
reaches the server, no probe cleanup needed).

**Docs.** README badge/census + the Session-145 row; AGENTS.md census +
the S145 lessons block (six lessons: the terminal-state re-arm; the
novel-drive-probe doctrine; the invisible-POST budget recount; the
convention residual on owner-only surfaces; the prose-invariant-without-
a-transaction race; the census-counts-the-comment hazard); CLAUDE.md
counts; PAD v1.3.53 (the revision block + the §11 closure row); the SKILL
census (the head + the green-state line + the chunk-map line — itself
found two-cycles stale at 603, the s140 doc-drift class reborn); the
vitest header re-anchor; the cert re-tag; the plan §6 as-executed close;
`docs/session_163.md`; this entry; the `.env.example` contract
re-verified complete against every env var the env var the code reads (unchanged — the S143/S144 verifications held).

**Next cycle.** The audit rotation continues (the FE/views +
auth/crypto/infra axis just swept; the entities/factory axis one cycle
fresh) — or the A-M3 stage-2 (the chunked sub-tx + resume token, the one
named deferral — its ADR-021 contract change deserves its own cycle with
its own ADR; the NODE_ENV casing warning is a cheap rider for the next
auth-family cycle).

## Session 157 — Batch CU (Cycle 96): the multipart-mime + OTP-tx + 413-discrimination + breadcrumb-recount set

**Workspace (the 38th continuation).** Fresh clone at `dd656e0` on `main`
(the Batch CT fix `a680eb8` + the operator's session_163/164 transcript
commit). Environment provisioned per the recipe: `bun install` (510 pkgs),
`.env` from `.env.example` (`DATABASE_URL="file:../db/custom.db"`),
`db:push` + `db:seed` (`db/custom.db` 389 KiB), Playwright Chromium
(headless-shell 1243), the dev daemon live on :3000.

**Cold baseline (before any work):** lint ✓ · tsc ✓ · unit **1503/1503**
(48 files — the documented S145 final state exactly) · the drawer check
GREEN (**the 61st consecutive no-Tailwind-v4-mobile-nav-bug
confirmation**) · the desktop chrome probe **MATCH** (all five formal
checks). Baseline noise: none.

**The audits (two read-only Mode-C subagents, every M/L finding
re-verified by direct read):**

- **Audit A — the Batch CT recent-changes axis** (the `a680eb8` diff):
  **0C/0H/0M/2L/2I** — all thirteen CT claims verified DELIVERED, every
  delivered test leg discriminating honestly, the census arithmetic
  machine-verified. The Ls: A-L1 the verification-token supersede
  siblings remain un-transacted (resend's pair, register's re-issue
  triple + the fresh-account pair — the CT2 family residual); A-L2 five
  stale in-file resilience budget breadcrumbs understated the recounted
  9/10 demo import POSTs (one miscounted at write time).

- **Audit B — the entities/factory + data-layer axis** (two cycles
  stale): **0C/0H/1M/2L/4I** — all eight historically-real families
  re-verified CLOSED (the ownership scoping, the route authz across 59
  shells, the error taxonomy, the CR7 delegates, the sequence-CAS
  family, the rate-limit keying, the cascade integrity, the validation
  completeness). The M: **B-M1** the multipart upload stored the
  client-controlled part Content-Type (`mime`) with no length/charset
  bound while the import door caps the identical column (the CE7 bloat
  class). The Ls: B-L1 (= A-L1); B-L2 the files multipart branch
  answered 413 for ANY body-read failure (the CN6 discrimination never
  adopted at the second door).

**The plan** (`docs/remediation-plan-session146.md`) written BEFORE any
source change and validated against the codebase, then executed
TDD-first.

**The RED inventory:** the unit REDs 10/10 as designed (the five CU1
admission-set predicate legs — the seam absent, the import failure IS
the red; the five census legs — the route markers absent). The
dev-daemon probes carried CU1's behavioral RED→GREEN: pre-guard the
150-char declared type stored VERBATIM (201, len 150); post-guard 400
with the guard's copy.

**THE RUNTIME SPLIT (the cycle's hard-won finding).** The e2e RED
refused to flip post-fix; the honest diagnosis ladder (a `| head`
SIGPIPE-killed build serving a stale standalone — builds captured to
file from then on; a minimal repro under node AND bun; the
Playwright-serializer dump; the extension-matrix probe; the live
process dump) isolated the truth: the declared part Content-Type
reaches the write only on the NODE-parse path (the dev daemon — where
the probe proved the defect and the fix); the BUN-parse path (the e2e
standalone, `bun run start`, the oven/bun Docker image) DERIVES the
stored mime from the FILENAME EXTENSION through Bun's registry (.txt →
"text/plain;charset=utf-8", .pdf → "application/pdf", unknown → "" →
the octet-stream fallback) and never delivers the declared type — the
write is structurally bounded on every shipped Bun posture. The CU1 fix
is the runtime-divergence belt-and-suspenders; its e2e leg became the
DERIVATION TRIPWIRE (a .txt upload with a hostile declared type → 201 +
the registry mime — fails loudly if a future runtime switch changes
the semantics).

**The fixes (all RED-proven at their reachable layers):** CU1 the
multipart mime guard — the `UPLOAD_MIME_MAX_CHARS` +
`isPrintableAsciiMime` seam in `http.ts` (the import door's admitted
set exactly; empty admitted) + the route guard (the BW13 name-cap copy
pattern; the unknown-type "" shape keeps the octet-stream fallback).
CU2 the OTP re-issue transactional set (the S142-carried standing
deferral landing): the register re-issue triple in ONE batch
`$transaction`; the fresh-account pair in the interactive
`$transaction(async (tx) => …)` (the folders/[id] precedent; the P2002
catch moves around the whole tx — the loser's rollback shape
externally identical); the resend pair in the batch form (the CT2
mirror). CU3 the files body-read catch discriminating
`BodyTooLargeError` from transport failures (only the genuine
over-cap answers 413). CU4 the five resilience breadcrumbs re-anchored
to the present-tense 9/10 arithmetic. The rider: the CT3 e2e leg's
shadow half (both /export CTAs compute a non-"none" box-shadow).

**Re-cert (the FINAL tree).** lint ✓ · tsc ✓ · unit **1513/1513** (48
files, +10) · build ✓ · the cold 5-chunk e2e re-tagged **612 → 614**
(chunk 2 +2 [the CU1 derivation tripwire + the clean round-trip pair] —
the map 150+189+91+95+89) · **census 2127 green** (was 2115). Chunk 1
**150 first-pass** (3.0 m) · chunk 2 **189 first-pass** (4.3 m — the
CU1 pair's chunk, exactly the re-tag) · chunk 4 **95 first-pass**
(3.2 m) · chunk 5 **89 first-pass** (1.4 m) · chunk 3 hit the documented
BU1/P1008 environmental flake class (3 failures co-occurring with the
WebServer socket-timeout noise — the files-view family, the class
S142/S143/S145 recorded) — the contention-free cold re-run of chunk 3
was **91/91 first-pass** (4.0 m).

**Evidence.** Three `docs/screenshots/146-clone-*.png` frames (desktop
235 KiB, mobile drawer 64 KiB, the Files view with the clean upload row
209 KiB), self-verifying (exists, >10 KiB, byte-diverse, md5-distinct)
+ the machine proofs on the frame: the hostile declared type → 400
with the guard's copy (the dev daemon — the Node-parse path), the clean
.pdf upload → 201 + the registry mime echo rendering in the view, the
probe rows cleaned up after capture.

**Docs.** README badge/census (2115 → 2127) + the Session-146 row;
AGENTS census + the S146 lessons block (four lessons: the
runtime-split reachability doctrine — probe the layer where the defect
lives and tripwire the split; the transaction family extends sideways —
grep the siblings after closing a pair; the `| head` SIGPIPE build
killer — never pipe-truncate a build's output; the breadcrumb-is-part-
of-the-budget); CLAUDE counts; PAD v1.3.54 (the revision block + the
§11 closure row); the SKILL census (all three sites); the vitest header
re-anchor; the cert re-tag + the runner's three-cycles-stale Expected
line; the plan §6 as-executed close; `docs/session_165.md`; this entry;
the `.env.example` contract re-verified complete against every env var
the code reads (no env-var reads changed this cycle).

**Next cycle.** The rotation continues (the entities/factory axis just
swept; the FE/views + auth/crypto axis two cycles stale again) — or the
A-M3 stage-2 chunked sub-tx + resume token (the one named standing
deferral — its ADR-021 contract change deserves its own cycle with its
own ADR). The NODE_ENV casing warning stays the cheap rider for the
next auth-family cycle.

## Session 158 — Batch CV (Cycle 97): the node-env-casing-boot-warning + tripwire-cleanup set

**Cycle 97 · Session 147 · the FE/views + auth/crypto rotation (two
cycles stale) + the Batch CU recent-changes axis.** Pull-refreshed to
`443d508` (the fast-forward added only the operator's session_166
transcript); the environment verified standing (daemon, `.env`
`DATABASE_URL="file:../db/custom.db"`, the db, Chromium 1243).

**Cold baseline matched the documented S145-final state exactly**: lint
✓ · tsc ✓ · unit 1513/1513 (48 files) · the drawer check GREEN (the
**62nd** consecutive no-Tailwind-v4-mobile-nav-bug confirmation) · the
desktop parity probe MATCH (all five formal checks). Noise: none.

**The audits** (two Mode-C passes — the subagent dispatch returned
garbled transcripts, so the orchestrator executed both directly, every
M/L finding re-verified by direct read): **A** — the Batch CU
recent-changes axis (`61bc42f`): **0C/0H/0M/1L/2I**, all thirteen CU
claims confirmed delivered (the seam, the three tx sites, the 413
discrimination, the breadcrumb arithmetic, the tripwire pair, the
doc-chain census machine-verified); the one L — the CU1a tripwire leg's
cleanup outside any finally. **B** — the FE/views + auth/crypto
rotation: **0C/0H/0M/0L/2I + the named rider adjudicated REAL** — every
historically-real family re-verified closed (the ABA tickets, the
scrypt/HMAC core route-by-route, the boot guards, the route authz, the
error taxonomy, the ownership scoping, the FE structural gates, the CT1
completion-window set intact).

**The cycle's load-bearing finding — the reachability probe.** The
NODE_ENV casing rider (carried from s145/s146: "the cheap rider for the
next auth-family cycle") looked like a plain missing guard — every
production-keyed guard reads `=== "production"` exactly, and a
`NODE_ENV=Production` host degrades silently to the dev posture — until
the S146 runtime-split doctrine was applied to the env knob: the
standalone server.js FORCES `NODE_ENV='production'` at its line 5 before
requiring next; next dev/start force their own values; the Dockerfile
sets the canonical literal; compose/.env.example never set it. The
miscased value reaches the guards ONLY through a hand-rolled custom
server — the overdeclaredProxyHopsWarning misconfigured-host class,
structurally silent on every documented posture (zero false positives,
probed). The test shape settled with it: the unit seam legs drive the
pure predicate, the census leg pins the wiring, NO e2e leg by design
(a spawn would drive the FORCED value, proving nothing).

**The fixes (all RED-proven).** CV1 the NODE_ENV casing boot warning —
the pure `nodeEnvCasingWarning` predicate in `env-check.ts` (silent on
the three canonical values + unset; warns on Production/PRODUCTION/
padded/staging/empty — the honest casing+membership shape) + the
instrumentation `console.warn` wiring (the CI6c precedent copy: "Set
NODE_ENV=production (lowercase) on production hosts"); the unit REDs
6/6 (the import failure IS the red — `6 failed | 33 passed` →
`39 passed`). CV2 the CU1a tripwire-cleanup finally (audit A-L1: the
leg's own designed failure must not also leak its probe row into the
chunk's files surface — the row id captured before the first throwing
expect; the failed-POST branch creates no row). CV3 the doc chain.

**Re-cert (the FINAL tree).** lint ✓ · tsc ✓ · unit **1519/1519** (48
files, +6 — env-check's six legs) · build ✓ (the wiring verified
shipped in the standalone instrumentation chunk — direct read) · the
targeted s14+s22 run **29/29** (the CU1 pair with the hardened cleanup
+ both s22 boot-guard legs: the new warning is structurally silent on
the exact "production" the spawn sets) · the cold 5-chunk e2e cert
**614/614 — 150 + 189 + 91 + 95 + 89, every chunk first-pass this run,
no flake re-run needed** (unchanged count — no e2e-count change this
cycle) · **census 2133 green** (was 2127).

**Evidence.** Three `docs/screenshots/147-clone-*.png` frames (desktop
235 KiB, mobile drawer 64 KiB, the login surface 236 KiB — the cycle's
axis surface: the unauthenticated auth door), self-verifying (exists,
>10 KiB, byte-diverse, md5-distinct — the capture script's JSON verdict
ok:true) + the CV1 machine proof on the unit layer (the six env-check
legs — the reachable layer for the miscased value).

**Docs.** README badge/census (2127 → 2133) + the Session-147 row;
AGENTS census (1513 → 1519) + the S147 lessons block (two lessons: the
probe-which-runtime-can-deliver-an-env-value doctrine — read the
runtime's own normalization BEFORE designing the leg; the
tripwire-leg's-cleanup-is-part-of-its-contract — a leg that exists to
fail has its failure path as its MOST likely path, and its cleanup must
survive it); CLAUDE counts + the env-check seam fragment; PAD v1.3.55
(the revision block + the §11 closure row); the SKILL census (both
sites); the vitest header re-anchor (env-check +6); the cert runner
unchanged; the plan §6 as-executed close; `docs/session_167.md`; this
entry; the `.env.example` contract re-verified (no env-var reads changed
this cycle — the warning reads a value the code already read at eleven
sites).

**Next cycle.** The rotation continues — the entities/factory +
data-layer axis is two cycles stale again (swept at S146), or the A-M3
stage-2 chunked sub-tx + resume token (its own ADR-021 cycle); the
B-I3 trim rider stays logged for a validation-family cycle; the
FE/views + auth/crypto axis is one cycle fresh.

## Session 159 — Batch CW (Cycle 98): the write-budget-completion + export-byte-ceiling + parse-status set

**Cycle 98 · Session 148 · the entities/factory + data-layer rotation
(two cycles stale) + the Batch CV recent-changes axis.** A FRESH CLONE
at `a051d6e` (the fast-forward from 5acadb9 added only the operator's
session_168 transcript); the environment provisioned through the
documented fresh-clone path (install → `db/` at the repo root → `.env`
`DATABASE_URL="file:../db/custom.db"` → db:generate → db:push →
db:seed → Chromium 1243 → the daemon on :3000).

**Cold baseline matched the documented S147-final state exactly**: lint
✓ · tsc ✓ · unit 1519/1519 (48 files) · the drawer check GREEN (the
**63rd** consecutive no-Tailwind-v4-mobile-nav-bug confirmation) · the
desktop parity probe MATCH (all five formal checks). Noise: none.

**The audits** (two Mode-C passes — the data-layer breadth scan run as
a read-only subagent, every M/L finding re-verified by direct read):
**A** — the Batch CV recent-changes axis (`5acadb9`): **0C/0H/0M/0L/
0I — clean**, all three CV claims confirmed (the predicate + wiring at
their anchors, the finally-cleanup, the census machine-verified).
**B** — the entities/factory + data-layer rotation: **0C/0H/0M/3L/2I**
— the 60/60 route-authz census, the store/import/export/taxonomy
families re-verified closed, the bounded-read census exhaustive with
ONE design-documented exception. The Ls: **B-L1** the
calculator-history POST (the one authenticated write verb outside the
shared BZ5/CB7 write budget — the S122/BW5 comment conflated the
500-row storage trim with rate-boundedness, and the per-file CE6
census was satisfied by the DELETE twin's budget); **B-L3** the export
(the one unbounded read family — assembled + serialized
unconditionally, the over-cap warning client-side only, while the
import door legally admits 64 MiB envelopes repeatedly); **B-L2** the
import restore's sequential per-row updates (deferred to the A-M3
ADR-021 cycle); **B-I2** the parse() 2xx-status cosmetic (the rider).

**The fixes (all RED-proven — the unit REDs 11/11 as designed).** CW1
the POST joins the shared `write:${user.id}` 600/15-min budget (the
CE6 pattern; the per-method census leg closes the per-file census's
structural blind spot without the named B-I redesign). CW2 the export
byte ceiling — the cycle's load-bearing fix: EXPORT_MAX_BYTES 256 MiB
(4× the restore cap — ADR-019-honest for the merely-large) + the
exportOverCeiling pure predicate + the typed ExportTooLargeError
thrown by the SHARED renderExportEnvelope seam (BW8: the route's 413
and the page's over-ceiling panel derive from one gate) + the
toErrorResponse 413 branch with the database-file remedy (CU3) + the
page's narrow catch + the panel's derived state (the red alert + the
disabled Download span; under the ceiling every e2e-scale account
renders byte-identically). No e2e leg BY DESIGN (the CV1 runtime-split
precedent — driving the ceiling needs a >256 MiB account; the
predicate legs + the four censuses + the s21 re-cert own the proof).
CW3 the malformed-2xx parse surfaces ApiError 502, never the
pretend-200.

**Re-cert (the FINAL tree).** lint ✓ · tsc ✓ · unit **1530/1530**
(48 files, +11: data-export +9, script-conventions +1, api-offline +1
— with the CQ2 census leg re-anchored to the new seam shape in the
same change) · build ✓ (the ceiling wiring verified shipped in the
standalone chunks; the 6 warnings the documented baseline) · the
targeted s21 + calculator run **20/20** · the cold 5-chunk e2e cert
**150 + 188 + 90 + 95 + 89 first-pass with the two documented-class
flakes** (the AH2a departed-Save timing leg; the AJ1 folder-POST P1008
socket-timeout 500 — both co-occurring with the WebServer SQLite
socket-timeout noise, the S142/S143 machine-load class) **re-verified
GREEN in the contention-free cold re-run of both full spec files
(97/97 first-pass)** = the e2e census 614/614 unchanged · **census
2144 green** (was 2133).

**Evidence.** Three `docs/screenshots/148-clone-*.png` frames (desktop
237 KiB, the mobile drawer 64 KiB, the /export panel 221 KiB — the
cycle's axis surface), self-verifying (exists, >10 KiB, byte-diverse,
md5-distinct — the capture script's JSON verdict ok:true) + the CW2
machine proof on the unit layer.

**Docs.** README badge/census (2133 → 2144) + the Session-148 row;
AGENTS census (1519 → 1530) + the S148 lessons block (two lessons: the
per-FILE census cannot see per-METHOD gaps — a mixed-exemption file is
a structural blind spot, and the focused per-method pin closes the
found gap; bound the SERVED BODY where the read set is unbounded by
contract — gate on the first already-computed downstream quantity, at
the shared seam so no consumer can drift); CLAUDE counts; PAD v1.3.56
(the revision block + the two §11 closure rows); the SKILL census
(both sites); the vitest header re-anchor; the cert runner unchanged;
the plan §6 as-executed close; `docs/session_169.md`; this entry; the
`.env.example` contract re-verified (no diff — no env-var reads
changed this cycle).

**Next cycle.** The rotation continues — the FE/views + auth/crypto
axis is now two cycles stale (swept at S147), or the A-M3 stage-2
chunked sub-tx + resume token (its own ADR-021 cycle, now carrying the
B-L2 import lock-hold finding); the B-I3 trim rider stays logged for a
validation-family cycle; the B-I census-granularity design change stays
the named deferral.

## Session 160 — Batch CX (Cycle 99): the sibling-toggle-chain + members-chain + resend-transport + calc-save-latch + settings-me-failure set

The workspace (the prior session's standing tree at `3fea61c` on
`main` — the Batch CW fix `3d4ac01` + the operator's session_170
transcript commit; pulled fast-forward, clean). Environment verified
standing: `.env` `DATABASE_URL="file:../db/custom.db"`, `db/custom.db`
seeded, the dev daemon on :3000. Cold baseline = the documented
S148-final state exactly: lint ✓ · tsc ✓ · unit 1519→**1530/1530**
(48 files) · the drawer check GREEN (**the 64th consecutive**
no-Tailwind-v4-mobile-nav-bug confirmation) · the desktop parity
probe MATCH (all five checks, live reference login).

The audits (Mode-C; every M/L re-verified by direct read): **A** —
the Batch CW recent-changes axis (`3d4ac01`): **clean** (all four CW
claims confirmed at the source level). **B** — the FE/views +
auth/crypto rotation (two cycles stale; two halves): the auth/crypto
half clean (the scrypt/HMAC core, the login route, the 11-route
census, the boot guards — every S147 family re-confirmed closed);
the FE/views half (22 views + store + seams, a read-only subagent
dispatch): **0C/0H/2M/3L/4I**. The findings: **B-M1** the
myDay/important row toggles retained the BX10 stale-base
double-toggle race (the S127/CB16 chain fixed ONE toggle —
`completed`; the siblings PATCHed from the render snapshot);
**B-M2** the study-group member add/remove ops interleaved on a
call-time store read (still not a chain — a remove during an add's
PATCH+refetch window silently dropped the add); **B-L1** the resend
catch rendered the success line for transport failures; **B-L2** the
calculator's three save affordances carried no in-flight guard; 
**B-L3** the Settings me-fetch failure left the Account card stuck
loading forever. The Is recorded (the 401 seam, the departed-note
flush, the in-band code delivery, the tag length cap); the
TaskDialog/GroupDialog edit-form snapshot pattern adjudicated
designed last-writer-wins.

The plan (`docs/remediation-plan-session149.md`) written BEFORE any
source change, validated against the codebase, executed TDD-first.

**The fixes (the unit REDs 13/13 — the import failure IS the red,
the CW2 precedent, for the three new store mutations + the ten
census legs).** CX1 `toggleTaskMyDay`/`toggleTaskImportant` ride the
SHARED `taskToggleChains` map (the toggleTask idiom; the four view
call sites rewired). CX2 `setStudyGroupMembers(groupId, update)` —
the per-group members chain with the UPDATER form (the caller
declares the effect, the chain supplies the post-settle base through
normalizeMembers — the S85/AL1 seam); the add/remove handlers
rewired. CX3 the resend catch splits TRANSPORT first (timeout → the
deadline copy; offline ApiError(0) → the human offline message; the
CF8 uniform line stays for account-state failures). CX4 the `=`
re-press no-op guard (a synchronous justEvaluated ref read) + the
GPA/unit Save latches (the CI4 pattern). CX5 the Settings Account
card's failed me-fetch renders the honest copy + the red
sf-alert-red role="alert" block with a real Retry (the page.tsx
boot() inner-async shape — the set-state-in-effect lint error fixed
at the root, never by weakening the rule).

**Re-cert (the FINAL tree).** lint ✓ · tsc ✓ · unit **1543/1543**
(48 files, +13: data-store +8, script-conventions +5) · build ✓
(exit 0; the wiring verified shipped in the standalone client + SSR
chunks; the 6 warnings the documented baseline) · the targeted e2e
run (calculator + parity-session5/8 + s17-fresh-user + tasks — the
cycle's five surfaces) **148/148** · the cold 5-chunk e2e cert
**150 + 189 + 91 + 95 + 89 — every chunk first-pass, ZERO flakes**
= the e2e census 614/614 unchanged · **census 2157 green** (was
2144).

**Evidence.** Four `docs/screenshots/149-clone-*.png` frames (the
standing desktop + mobile drawer + the cycle's study-groups detail
and settings-profile surfaces), self-verifying (the capture script's
JSON verdict ok:true; dimensions + non-white shares machine-checked).
The CX1 machine proof rides the unit layer (the double-toggle
opposite-value legs — a race is not screenshot-provable).

**Docs.** README badge/census (2144 → 2157) + the Session-149 row;
AGENTS census (1530 → 1543) + the S149 lessons block (two lessons: a
chain fixed at one call site leaves its siblings a generation behind
— grep the field family in the same change; an anti-enumeration
catch must not swallow transport failures — partition by "did the
server decide about the account?", with the loading-surface twin);
CLAUDE counts; PAD v1.3.57 (the revision block + the five §11
closure rows); the SKILL census (both sites); the vitest header
re-anchor; the cert runner unchanged; `docs/session_171.md`; this
entry; the `.env.example` contract re-verified (no env-var reads
changed this cycle).

**Next cycle.** The rotation continues — the entities/factory +
data-layer axis, or the A-M3 stage-2 chunked sub-tx + resume token
(its own ADR-021 cycle, carrying the B-L2 import lock-hold finding);
the B-I3 trim rider stays logged for a validation-family cycle; the
B-I census-granularity design change stays the named deferral.

## Session 161 — Batch CY (Cycle 100): the folderId-bound + schoolName-trim + tag-honesty set

**Context.** The workspace was a FRESH CLONE at `669c83e` on `main`
(the Batch CX fix `3410ff1` + the operator's session_172 transcript
commit; the sandbox had reset). Environment re-provisioned through
the documented fresh-clone path: install 510 pkgs · `.env` from the
current `.env.example` (`DATABASE_URL="file:../db/custom.db"` — the
repo-root `db/` contract) · `db:push` + `db:seed` (the 389 KiB seeded
demo account) · chromium-1243 · the dev daemon on :3000 (preflight
GREEN).

**Cold baseline (before any work).** lint ✓ · tsc ✓ · unit
**1543/1543** (48 files — the documented S149 final state exactly) ·
the drawer check GREEN (**the 65th consecutive no-Tailwind-v4-
mobile-nav-bug confirmation**) · the desktop parity probe **MATCH**
(all five formal checks, live reference login). Baseline noise: none.

**The audits (Mode-C; every M/L finding re-verified by direct read).**
Audit A — the Batch CX recent-changes axis (`3410ff1`):
**0C/0H/0M/0L/0I — clean**; all five CX claims verified at the source
level (the CX1/CX2 chains + rewires, the CX3 transport partition, the
CX4 calculator guards, the CX5 settings failure surface; the doc
census machine-verified: README 2157, AGENTS 1543/614, PAD v1.3.57,
SKILL both sites, the vitest header). Audit B — the entities/factory
+ data-layer rotation (three cycles stale — the S146/CU-swept axis,
the named next axis): the full read of entities/http/auth-server/
validation/db-path/group-members + the 616-line schema + all 39
in-scope route files: **0C/0H/0M/1L/5I** — all eight historically-real
families re-verified CLOSED at their anchors (ownership scoping +
P2025→404, route authz, the error taxonomy, the CR7 delegate pattern,
bounded readers, the CR3 own-keys patch discipline, rate-limit keying,
the Zod boundary). The finding: **B-L1** the multipart `folderId` was
the one remaining unbounded id atom (the raw form value reached
`findFirst` verbatim while every other id rides the 64-char bound —
the hand-validated multipart branch cannot Zod-parse binary, so it
silently escaped both schema-family fixes). The settings-route
schoolName untrimmed (this audit's B-I5) was PROMOTED into the fix set
as the S146/B-I3 trim rider's named validation-family cycle, together
with the S149/B-I4 note-tag silent-drop rider.

The plan (`docs/remediation-plan-session150.md`) written BEFORE any
source change, validated against the codebase (every anchor re-read;
the Zod-4 trim-ordering semantics probed empirically before the
design was frozen), executed TDD-first.

**The fixes (the unit REDs 4/4 — the CY2 functional pair + the CY1/CY3
wiring-census legs).** CY1 the multipart folderId 64-char guard (the
S139/CN11 route-param convention verbatim — a >64-char id cannot
exist, so the honest status is the no-oracle 404, byte-identical to
the missing-row branch it precedes). CY2 the schoolName trim at the
validation ATOM (`z.string().trim().max(120).optional()`; Zod 4
orders .trim() BEFORE .max() — probed — and the transformed key
SURVIVES the parsed object, so the sent-keys filters at the settings
route and the import seam's PROFILE_PATCH_KEYS whitelist keep working
verbatim; one canonical source now serves the route, the client card,
AND the import profile patch). CY3 the note-tag honest feedback (the
empty draft stays a no-op; the >24-char and duplicate drops now name
their reason through the aria-live toast stack). One census tripwire
tripped and closed as designed: the hue-tokens notes-view register
re-anchored 686 → 700 (the CY3 block added lines above the site; the
anchored leg is the designed move-detector; the site itself
byte-unchanged).

**Re-cert (the FINAL tree).** lint ✓ · tsc ✓ · unit **1547/1547**
(48 files, +4: validation +2, script-conventions +2) · build ✓ (exit
0; the three fix wirings verified shipped in the standalone chunks;
the 6 warnings the documented baseline) · the targeted e2e on the
cycle's six surfaces (parity-5/7/8 + s17-fresh-user + tasks +
s14-hardening + mobile-navigation): 236 legs — 235 green + the s14-C1
budget interplay, the ad-hoc run having combined chunk 3's
parity-session5 (the math/solve `ai:` budget consumer, 1-2 real
requests by design) with chunk 2's C1 exhaustion pin in ONE boot —
an artificial mix the 5-chunk map's per-chunk re-boot exists to
prevent; C1 re-verified **27/27 on its own cold boot** · the cold
5-chunk e2e cert **150 + 189 + 91 + 95 + 89 — every chunk first-pass,
zero code flakes** (chunk 3's single first-attempt failure was the
P1008 SQLite socket-timeout machine-load class — root-caused by the
exact Prisma error line naming `prisma.fileFolder.create()` + the
same-shape folder tests passing immediately after + the clean 91/91
cold re-run) = the e2e census 614/614 unchanged · **census 2161
green** (was 2157).

**Evidence.** Four `docs/screenshots/150-clone-*.png` frames (the
standing desktop + mobile drawer + the Files view [CY1] + the Notes
editor tag row [CY3]), self-verifying (the capture script's JSON
verdict ok:true; dimensions machine-checked 1440x900 / 390x844). The
CY2 boundary atom's proof rides the unit layer (the trim pair — a
schema transform is not screenshot-provable, the CW2 runtime-split
precedent).

**Docs.** README badge/census (2157 → 2161) + the Session-150 row;
AGENTS census (1543 → 1547) + the S150 lessons block (three lessons:
a boundary convention is only closed when the LAST channel joins it —
enumerate body/route-param/query/AND multipart; a trim belongs at the
ATOM, not at each consumer; a destroyed input demands its reason);
CLAUDE counts; PAD v1.3.58 (the revision block + the three §11
closure rows); the SKILL census (both sites); the vitest header
re-anchor (+4 with the hue-tokens re-anchor note); the cert runner
unchanged; `docs/session_173.md`; this entry; the `.env.example`
contract re-verified (no env-var reads changed this cycle).

**Next cycle.** The rotation continues — the FE/views + auth/crypto
axis (swept at S149) ages first; the A-M3 stage-2 chunked sub-tx +
resume token stays its own ADR-021 cycle (carrying the B-L2 import
lock-hold finding); the db-path percent-decode (this audit's B-I3)
is recorded for a db-path-family cycle; the B-I census-granularity
design change stays the named deferral.

## Session 162 — Batch CZ (Cycle 101): the tags-chain + load-honesty + phantom-row + save-feedback set

**Context.** The workspace was a FRESH CLONE at `b90c2f2` on `main`
(the Batch CY fix `1d4c293` + the operator's session_174 transcript
commit; the sandbox had reset). Environment re-provisioned through the
documented fresh-clone path: install 510 pkgs · `.env` from the
current `.env.example` (`DATABASE_URL="file:../db/custom.db"` — the
repo-root `db/` contract) · `db:push` + `db:seed` (the 389 KiB seeded
demo account) · chromium-1243 · the dev daemon on :3000 (preflight
GREEN).

**Cold baseline (before any work).** lint ✓ · tsc ✓ · unit
**1547/1547** (48 files — the documented S150 final state exactly) ·
the drawer check GREEN (**the 66th consecutive no-Tailwind-v4-
mobile-nav-bug confirmation**) · the desktop parity probe **MATCH**
(all five formal checks, live reference login). Baseline noise: none.

**The audits (Mode-C; every M/L finding re-verified by direct read).**
Audit A — the Batch CY recent-changes axis (`1d4c293`):
**0C/0H/0M/0L/0I — clean**; all three CY claims verified at the source
level (the CY1 multipart folderId guard + the CY2 schoolName trim at
the validation atom + the CY3 addTag drop-reason toasts; the doc
census machine-verified: README 2161, AGENTS 1547/614, CLAUDE 1547,
PAD v1.3.58, SKILL both sites, the vitest header). Audit B — the
FE/views + auth/crypto rotation (two cycles stale — the S149/CX-swept
axis, the named next axis; the FE/views breadth scan dispatched to a
read-only subagent per the S148/S149 precedent, the auth/crypto core
audited by the orchestrator by direct read): the auth/crypto half
**clean** — every historically-real family re-verified CLOSED at its
anchors (the scrypt parameter migration + rehash drain, the uniform
login timing pair, sessionVersion revocation, the rate-limit family
incl. the exact-key protected buckets + the net-of-successes
decrement, the peppered-OTP digests + conditional single-use
consumption, hashed reset tokens + the reset sessionVersion bump, the
authBurnGlobal containment, proxy-aware Secure cookies, hashless
selects); the FE/views half **0C/0H/1M/6L/4I** (the CX1/CX2 chain
families re-verified FULLY LANDED at every consumer site; the XSS
posture clean; a11y thorough). The finding: **B-M1** the notes tags
PATCHed absolute arrays off the render snapshot (the CX2 members-fix
family, one field over — two tag ops in one PATCH+refetch window
silently lost one, and tag adds carry no success toast). The Ls:
**B-L1** the files false "No files yet" on a failed initial GET (the
one view with a private loader); **B-L3** the phantom 1-second session
from a never-started Complete; **B-L4** the silent unit-save success
(the GPA twin speaks); **B-L2** the AI-generate silent replace
(deferred — a product decision); **B-L5** the seven-site delete
double-fire latch (deferred — a delete-family cycle); **B-L6** the
six-dialog noValidate hand-guards (deferred — a copy-family cycle);
the Is recorded (the Grid-Builder parity adjudication, the solver
subtitle nit, the Due-Soon measured-hint parity, the anchor>button
documented parity).

The plan (`docs/remediation-plan-session151.md`) written BEFORE any
source change, validated against the codebase (every anchor re-read;
the e2e-interplay probe of every spec touching the cycle's four
surfaces), executed TDD-first. The plan's arithmetic amended twice
before execution (the S150 precedent): the CX2-shaped missing-note
no-op leg joined the functional triple and the CZ1 wiring census
carried two legs, so the RED inventory grew 6 → 7 → **8** (3
functional + 5 census) and the unit count 1553 → 1554 → **1555**.

**The fixes (the unit REDs 8/8 — the CZ1 functional triple + the
CZ1/CZ2/CZ3/CZ4 censuses).** CZ1 the note-tags updater chain —
`setNoteTags(noteId, update)` on a per-note chain map in data.ts (the
CX2 updater form: the caller declares the effect, the chain supplies
the post-settle base; field-scoped so the autosave title/content
PATCHes need no serialization); `parseNoteTags` moved to data.ts as
the single source; addTag/removeTag declare effects with the
idempotent add updater (the belt-and-braces dedupe), the view-level
guards stay (the CY3 toasts), the `saveTags` helper retired. CZ2 the
files failed-load surface (the CX5 loadFailed + retryCount pattern —
the alert + Retry leg ordered BEFORE the false-empty branch; a
successful retry clears it). CZ3 the phantom-session gate (the gate
`!running && remaining >= durations[mode]` before the POST with its
reason toast; `running` joins the useCallback deps — the CD3
discipline). CZ4 the unit-save success toast (the GPA twin's mirror).
One census tripwire tripped and closed as designed: the hue-tokens
notes-view register re-anchored 700 → 705 (the CZ1 rewire's +5 lines;
the anchored leg is the designed move-detector; the site itself
byte-unchanged).

**Re-cert (the FINAL tree).** lint ✓ · tsc ✓ (after the `selected`
null guards joined the two handlers) · unit **1555/1555** (48 files,
+8: data-store +3, script-conventions +5) · build ✓ (exit 0; the four
fix wirings verified shipped in the standalone chunks; the 6 warnings
the documented baseline) · the targeted e2e — four cold-booted
per-chunk groups (resilience + parity-session5 87 · calculator +
s17-fresh-user 25 · parity-session7 57 · parity-session8 +
mobile-navigation 86): 255 legs, zero failures, zero chunk mixes · the
cold 5-chunk e2e cert **150 + 189 + 91 + 95 + 89 — every chunk
first-pass, zero code flakes** (chunk 1's single first-attempt
failure was the P1008 SQLite socket-timeout machine-load class on the
BU7 probe's own `prisma.exam.create()` — root-caused by the exact
Prisma error line + the same-shape sibling passing in the same run +
the clean 2/2 cold re-run of the single leg, with 13 P1008 noise
lines clustering in the same run) = the e2e census 614/614 unchanged
· **census 2169 green** (was 2161).

**Evidence.** Five `docs/screenshots/151-clone-*.png` frames (the
standing desktop + mobile drawer + the Notes tag row [CZ1] + the
Files view [CZ2] + the Focus timer [CZ3]), self-verifying (the
capture script's JSON verdict ok:true; dimensions machine-checked
1440x900 / 390x844). The CZ4 transient-toast proof rides the census
layer (the CW2 runtime-split precedent).

**Docs.** README badge/census (2161 → 2169) + the Session-151 row;
AGENTS census (1547 → 1555) + the S151 lessons block (three lessons:
a chain family is closed when the last FIELD joins it; a false empty
state is a claim about the SERVER — enumerate the loaders; a
state-derived action needs a state-derived gate); CLAUDE counts; PAD
v1.3.59 (the revision block + the four §11 closure rows); the SKILL
census (both sites); the vitest header re-anchor (+8 with the
hue-tokens re-anchor note); the cert runner unchanged;
`docs/session_175.md`; this entry; the plan §6 as-executed close;
the `.env.example` contract re-verified (no env-var reads changed
this cycle).

**Next cycle.** The rotation continues — the AI-generate replace
guard (the B-L2 rider, a product decision) is the named candidate;
the delete double-fire latch family (B-L5) pairs with the noValidate
hand-guard sweep (B-L6) as a dialog/deck-honesty cycle; the A-M3
stage-2 chunked sub-tx + resume token stays its own ADR-021 cycle
(carrying the S150/B-L2 import lock-hold finding); the db-path
percent-decode stays recorded for a db-path-family cycle.

## Session 163 — Batch DA (Cycle 102): the delete-latch + hand-guard + replace-confirm + order-letter set

**Context.** The workspace was a FRESH CLONE at `7fb8e23` on `main`
(the Batch CZ fix `b9b35f6` + the operator's session_176 transcript
commit; the sandbox had reset). Environment re-provisioned through the
documented fresh-clone path: install 510 pkgs · `.env` from the
current `.env.example` (`DATABASE_URL="file:../db/custom.db"` — the
repo-root `db/` contract) · `db:push` + `db:seed` (the 389 KiB seeded
demo account) · chromium-1243 · the dev daemon on :3000 (preflight
GREEN).

**Cold baseline (before any work).** lint ✓ · tsc ✓ · unit
**1555/1555** (48 files — the documented S151 final state exactly) ·
the drawer check GREEN (**the 67th consecutive no-Tailwind-v4-
mobile-nav-bug confirmation**) · the desktop parity probe **MATCH**
(all five formal checks, live reference login). Baseline noise: none.

**The audits (Mode-C; every M/L finding re-verified by direct read).**
Audit A — the Batch CZ recent-changes axis (`b9b35f6`):
**0C/0H/0M/0L/0I — clean**; all four CZ claims verified at the source
level (the CZ1 setNoteTags chain + the parseNoteTags single source +
the saveTags retirement, the CZ2 files failed-load alert+Retry, the
CZ3 phantom-session gate [byte-verified `durations[mode]` via od —
the display-pipeline `[m`-eating artifact documented], the CZ4
unit-save toast); the doc census machine-verified with FIVE stale
prose sites found (README ×2 at an S146-era "1513", the import-cap
"10 MiB" doubly stale vs the S137/CL2 64 MiB, the SKILL §11
green-state line at S150 figures under an S151 label, the SKILL CD3
prose "1449+605"). Audit B — the entities/factory + data-layer
rotation (two cycles stale — the S150/CY-swept axis; the breadth scan
dispatched to a read-only subagent against the web-application
skill's §4/§5/§6/§7/§16 rubric, every M/L re-verified by direct
read): **0C/0H/1M/2L/3I** — all eight historically-real families
re-verified closed (ownership scoping + P2025→404, route authz, error
taxonomy, the CR7 delegate pattern, bounded readers, the CR3 own-keys
patch discipline, the rate-limit keying census, the Zod boundary —
query params consumed nowhere), all seven past fixes verified landed.
The findings: **B-M1** the aggregate CPU-containment discharge model
1:1 dischargable by attacker-mintable successes under the default
posture (Reasoned; the per-account guessing bounds hold — not an
account-takeover vector; deferred to its own rate-limit-model cycle
with the e2e budget-arithmetic study); **B-L1** withUserParams
answered 404 before 401 on unauthenticated malformed-id calls; **B-L2**
the /export page renders the full envelope unbudgeted (deferred — the
s21/s23 page-visit interplay needs its own pass); **B-I1** fullName
the last untrimmed text atom; **B-I2** force-dynamic adjudicated as
documented convention (the cookies() structural mitigation); **B-I3**
the 64 MiB context refresh. The S151-carried fix set: **B-L5** the
seven fire-and-forget delete handlers (Verified at all sites; the
four confirm-gated cousins already latch via setDeleting(null)); **B-L6**
the seven noValidate dialogs surfacing Zod's raw copy; **B-L2/S151**
the AI-generate silent replace.

The plan (`docs/remediation-plan-session152.md`) written BEFORE any
source change, validated against the codebase (every anchor re-read;
the e2e-interplay probe of every spec touching the cycle's surfaces —
the Generate button visibility-asserted only, the CB3 pin API-level,
the CB7 anon probe on a valid id, no double-delete specs, no raw-copy
pins). The product decision adjudicated per the operator's standing
best-judgement instruction: **the AI-generate replace-confirm —
replace semantics KEPT, confirmed** (the delete-confirm family
pattern; the confirm BEFORE the AI call so a cancel never burns the
ai: budget; the fresh-test path unchanged).

**The fixes (the unit REDs 23/23 — the DA1 heptet + the DA2 heptet +
the DA3 pair + the DA4 census + the DA5 functional pair + the DA6
doc-pins quartet).** DA1 the delete double-fire latch — the per-view
`deletingIds` set (the membership guard before the DELETE, the finally
removal keeping retry honest, `disabled` on the plain-button sites;
the menu sites close on click so the handler latch alone covers
them). DA2 the noValidate hand-guard sweep — the seven dialogs'
required-field guards with human copy BEFORE setBusy (an early return
after arming the busy latch strands it; the guards mirror the
schema's required set — dueDate optional, title-only there; the
server's Zod boundary stays). DA3 the replace-confirm — the
drafts.length gate on the Generate click + the AlertDialog (inside
the TestDialog scope) whose Replace action runs the generate. DA4 the
401-order — requireUser() before the CN11 id bound. DA5 the fullName
trim at the validation atom (the CY2 shape). DA6 the five doc sites +
four SELF-ANCHORING count-claims pins (the CQ6 cross-read family —
each derives its expectation from the cited source: the vitest
header, the cert map, IMPORT_MAX_BYTES itself; historical
session-row narratives out of scope by design). Two census
tripwires tripped and closed as designed: the hue-tokens registers
re-anchored (flashcards 394 → 437, notes 705 → 736 — the third
consecutive cycle the anchored legs tripped on view-line drift). Two
RED-leg authoring bugs fixed DURING the RED phase (the `\n  };`
handler-close anchor so a nested payload object cannot end the slice
early; the handler-relative finallyAt index).

**Re-cert (the FINAL tree).** lint ✓ · tsc ✓ (after the AlertDialog
relocated into the TestDialog scope) · unit **1578/1578** (48 files,
+23: validation +2, script-conventions +21) · build ✓ (exit 0; the 6
documented warnings; every fix wiring verified shipped in the
standalone chunks) · the targeted e2e — four cold-booted per-chunk
groups (parity-session7 + s14-hardening 83 · s17-fresh-user +
calculator 25 · parity-session8 + mobile-navigation 86 ·
parity-session5 47): 241 legs, two single-leg P1008 machine-load
flakes each root-caused three ways (the exact Prisma error lines, the
same-shape siblings, the clean cold re-runs) · the cold 5-chunk e2e
cert **150 + 189 + 91 + 95 + 89 — 614/614** (chunk 1's single
first-attempt BZ3 500 root-caused as the same machine-load class by
the three-granularity re-verification — the isolated leg 2/2 clean,
parity-session8 alone 67/67 cold, the exact chunk-1 combination
re-run directly 150/150 clean) = the e2e census 614/614 unchanged ·
**census 2192 green** (was 2169).

**Evidence.** Five `docs/screenshots/152-clone-*.png` frames (the
standing desktop + mobile drawer + the Events dialog with the
hand-guard's inline error [DA2's visible proof — the guard text
awaited before the frame] + the Flashcards deck grid [DA1] + the
practice-test editor with the gated Generate [DA3]), self-verifying
(the capture script's JSON verdict ok:true; dimensions machine-checked
1440x900 / 390x844). The DA4/DA5 proofs ride the unit layer (the CW2
runtime-split precedent).

**Docs.** README badge/census (2169 → 2192) + the Session-152 row +
the two unit-count sites + the two import-cap sites; AGENTS census
(1555 → 1578) + the S152 lessons block (four lessons: pin the prose
to the source it cites; the hand-guard before the busy latch with
field-naming copy; the destructive replace is a delete wearing a
different verb — same confirm family, confirm before the expensive
call; auth precedes shape at every wrapper); CLAUDE counts; PAD
v1.3.60 (the revision block + the six §11 closure rows); the SKILL
census (both sites + the CD3 prose); the vitest header re-anchor
(+23 with the register re-anchor note); the cert runner unchanged;
`docs/session_177.md`; this entry; the plan §6 as-executed close;
the `.env.example` contract re-verified (no env-var reads changed
this cycle).

**Next cycle.** The rotation continues — the **B-M1 rate-limit-model
cycle** is the named candidate (the discharge-model design change with
the e2e budget-arithmetic study: the CN9 never-discharge shape
re-sized, or a gated/capped discharge); the **export-page budget**
(B-L2-audit: the dedicated exportPage: key + the s21/s23 page-visit
cert arithmetic) pairs with it as the budget-family cycle; the A-M3
stage-2 chunked sub-tx + resume token stays its own ADR-021 cycle
(carrying the S150/B-L2 import lock-hold finding); the db-path
percent-decode stays recorded for a db-path-family cycle.

## Session 164 — the S153 cycle (Batch DB: the rate-limit-model + export-page-budget set)

**Context.** The workspace was a continuation at `73c51eb` on `main`
(the Batch DA fix `028271d` + the operator's session_178 transcript
commit; the sandbox preserved the tree — the environment re-validated
in place rather than re-provisioned). Cold baseline matched the
documented S152-final state exactly: lint ✓ · tsc ✓ · unit
1578/1578 (48 files) · the drawer check GREEN (**the 68th consecutive
no-Tailwind-v4-mobile-nav-bug confirmation**) · the desktop parity
probe **MATCH** (live reference login).

**The audits (Mode-C, every M/L finding re-verified by direct read;
the axis read dispatched to a read-only subagent against the
web-application skill's rubric — the S148-S152 precedent).** A — the
Batch DA recent-changes axis (`028271d`): **0C/0H/0M/0L/0I — clean**,
all six DA claims confirmed at the source level, the doc census
machine-verified with ZERO stale sites (the DA6 self-anchoring pins
holding on their first re-read). B — the rate-limiter/auth-family +
export/data-portability rotation (the fix surfaces, swept at S124):
**0C/0H/2M/2L/2I** — the full 30-key rate-limit census re-verified
consistent. **B-M1's mechanics CORRECTED by the audit's direct read**:
a success NETS 0 (the check's +1, the decrement's −1 — the −1 lands on
the success's OWN increment, never a prior fail's), so the S152 plan's
stated alternation attack was mis-modeled (it self-bounds at 2×); the
REAL unbounded door is the SUCCESS-ONLY loop — scriptable own
credentials burning the synchronous scrypt pair per request with
NOTHING binding it (the aggregate never trips; login's success path
even resets both per-keys; ~24-37× the intended containment — the CK1
single-worker-starvation shape reopened by the CM3 decrement). **B-L2**
the /export page renders the full envelope per view unbudgeted (the
route twin rides `export:` 10/15-min). **N1** the garbage-flood lockout
(the accepted fixed-window trade-off — documented). **N2** the
success-reset drift trio (three sites carrying the pre-CM3 reset
semantics).

**The plan** (`docs/remediation-plan-session153.md`) written BEFORE any
source change, validated against the codebase (the chunk-5 login tally
derived by direct read: 52 posts/boot, 13 successes + 39 fails → the
live count 39/40 — the D-cap sizing derived from it: D = 20 > 13 keeps
the cert arithmetic byte-identical by construction).

**The fixes (the unit REDs 4/4 + the e2e pins RED-verified on the
pre-fix build).** DB1 the capped discharge —
`MAX_DISCHARGES_PER_WINDOW = 20` on the new `Bucket.discharges`
counter: the decrement applies only while the window's discharges sit
under the ceiling (successes 1-20 net 0, past the ceiling +1 each →
every discharge-bearing aggregate bounded at M+D = 60 admitted requests
per window); the five call sites unchanged (the cap internal to the
seam); the fresh-window rollover re-arms the allowance. DB2 the
export-page budget — the dedicated `exportPage:${user.id}` 10/15-min
after the auth gate and before the counts + envelope, answering the
honest amber alert render (a page cannot 429; the render is cheap by
construction); the hue-tokens CONSUMERS register gains the page entry.
DB3 the N2 drift sweep (the net-0 language at auth.ts + login +
change-password + DEPLOYMENT.md + the s16 pin's comment — the CK1
arithmetic itself preserved: first429 = 41). DB4 the N1 note. Plus the
stale registerGlobal sizing comment corrected to the S153-measured
arithmetic.

**The mid-cycle correction (the honest record).** The DB2 pin's first
home (s21, chunk 5) broke s26's round-trip twice — root-caused by
TRACE: the s26 helper's re-issue register 429'd ("Too many registration
attempts") because the chunk-5 `registerGlobal:` budget sits at
**40/40 EXACTLY** (37 by self-calibrating probe + s26's 3 — the
"≤ 3 per chunk" comment rotted 13 cycles); the pin's throwaway register
made the re-issue the 41st → a codeless response → the verify's
uniform 400. The pin relocated to navigation.spec.ts (chunk 1, before
the DB1 terminal pin — the CK1 budget-driven pin-home doctrine). Two
operational traps hit and closed en route: the first cert launch was
reaped (the daemon-start lesson), and editing the cert script WHILE
bash ran it corrupted the offsets (the never-build-during-e2e lesson's
sibling: never edit the runner during a run — chunk 5's own result was
already complete). The BU7 investigation host hit the deleted-inode +
CWD-anchoring traps in sequence (a stray `../db/custom.db` from a bare
`prisma db push` — cleaned; the :3200 server restarted after the
proper push+seed).

**Re-cert (the FINAL tree).** lint ✓ · tsc ✓ · unit **1582/1582**
(48 files, +4: auth +2, script-conventions +2) · build ✓ (exit 0; the 6
documented warnings; the cap guard + the page render verified shipped
in the standalone chunks) · the targeted e2e: chunk 1 **152/152
first-pass** on the clean environment (the earlier BU7 leg root-caused
by a live 5-round repro on an isolated host — the create POST 500s
under co-resident load [the P1008 class] while the clean rounds pass
byte-exact) · chunk 2 **189/189 first-pass** · chunk 3 **91/91
first-pass** on the re-run (the cert-run attempt contaminated by the
orchestrator's own parallel repro — 11 failures under self-inflicted
load, invalid by construction; one AK1d P1008 flake closed by the
isolation + first-pass re-run) · chunk 4 **95/95 first-pass** · chunk 5
**89/89 first-pass** (s26 green after the relocation) — **the e2e
census 616/616 (was 614) · census 2198 green** (was 2192).

**Evidence.** Three `docs/screenshots/153-clone-*.png` frames (the
standing desktop + mobile drawer [the 68th drawer-GREEN companion] +
the export page's rate-limited amber render [DB2's visible proof — the
capture script awaited the alert text before the frame]), self-verifying
(the capture script's JSON verdict ok:true; dimensions machine-checked
1440x900 / 390x844). The DB1 cap's proof rides the unit pair + the
wire pin (the CW2 runtime-split precedent).

**Docs.** README badge/census (2192 → 2198) + the Session-153 row;
AGENTS census + the S153 lessons block (four lessons: re-derive the
discharge arithmetic from the increment semantics, never the prose; cap
the discharge — free successes are the unbounded door; budget the WORK
not the endpoint; a chunk's budget ceiling is a pin-home constraint —
measure it empirically); CLAUDE counts; PAD v1.3.61 (the revision
block); the SKILL census (all four sites); the vitest header re-anchor;
the cert runner re-tag + the CC2 tripwire re-anchor; the DEPLOYMENT.md
N2 fix + N1 note; `docs/session_179.md`; this entry; the plan §6
as-executed close; the `.env.example` contract re-verified (no env-var
reads changed this cycle).

**Next cycle.** The rotation continues — the **A-M3 ADR-021 stage-2
chunked sub-tx + resume token** stays the named candidate (carrying the
S150/B-L2 import lock-hold finding); the **db-path percent-decode**
stays recorded for the db-path-family cycle; the N1 re-order
alternative stays rejected-and-documented; the N3/N4 notes ride the
next rotation's file list.

## Session 165 — the S154 cycle (Batch DC: the no-op-elision + questions-mirror + import-doc-reconciliation set)

**Context.** The workspace was a FRESH CLONE at `b6df05f` on `main`
(the Batch DB fix `2914f0d` + the operator's session_180 transcript
commit; the sandbox had reset — the environment re-provisioned from
zero: `.env` from `.env.example`, `db/` + push + seed, `bun install`,
the Playwright chromium cache re-provisioned [the S103 lesson-1
class]). Cold baseline matched the documented S153-final state exactly:
lint ✓ · tsc ✓ · unit 1582/1582 (48 files) · the drawer check GREEN
(**the 69th consecutive no-Tailwind-v4-mobile-nav-bug confirmation**)
· the desktop parity probe **MATCH** (live reference login).

**The audits (Mode-C, every M/L finding re-verified by direct read;
the axis read dispatched to a read-only subagent against the
web-application skill's rubric — the S148-S153 precedent).** A — the
Batch DB recent-changes axis (`2914f0d`): **0C/0H/0M/0L/0I — clean**,
all four DB claims confirmed at the source level, the doc census
machine-verified with zero stale sites. B — the data-portability/
import-restore rotation (the fix surfaces, swept at S148):
**0C/0H/0M/4L/2I** — no injection/authz/secret/enumeration defect in
the axis. The findings: **L1** the practiceTests.questions item-shape
parity gap (the members precedent's missed twin — the atom refines
every item, the import checked array-ness only); **L2** ADR-021's
Decision stale on two counts (the 25 MiB cap, the per-row findFirst
shape); **L3** AGENTS.md's import row stale on three counts (the cap,
the write-loop shape, the false budget-exclusivity claim); **L4** the
write-only-tx property pinned only by presence-markers; **I-A** the
export peak-memory residual (the streaming family); **I-B** the two
verified non-gaps. The S153 N3/N4 notes closed by re-verification.

**The measurement (the cycle's first duty — the S141 condition
answered).** The S141 deferral made the A-M3 stage-2 conditional
("stage-2 if measurement shows a residual window"); a scratch probe
(the exact tx shape against a throwaway db/measure.db) measured the
sequential update loop at **0.32 ms/row, linear — 1k = 430 ms · 10k
= 3.5 s · 50k = 16.0 s · 100k = 32.0 s** (1.9× headroom inside the
60 s timeout at the IMPORT_MAX_ROWS cap; the S141-era 0.6 ms/row
estimate was 2× pessimistic), and the full-row probe (the elision's
read cost) at **2.1 s at the same cap — 15× cheaper than the writes
it can elide**. Adjudication: the stage-2 chunked sub-tx + resume
token stays deferred **ON MEASUREMENT**; the cycle ships the
contract-preserving move the measurement does justify.

**The plan** (`docs/remediation-plan-session154.md`) written BEFORE any
source change, validated against the codebase (every anchor re-read;
the RED inventory sized +6 unit legs, +0 e2e legs by design — the CV1
runtime-split precedent: the elision is wire-invisible by construction).

**The fixes (the unit REDs 4/4 on their designed markers + the
elision census RED + the DC4 negative census green-on-arrival by
design — the CS3/CL9 precedent).** DC1 the no-op update elision — a
pre-tx pass (after the collision pre-flight, immediately before the
transaction) reads the full stored rows for the update-branch ids
(chunked, ownership-scoped, the cards deck-scope included) and drops
every write whose planned payload already holds; the diff is the pure
seam's `plannedUpdateIsNoOp` (diff over PLANNED keys only — exactly
Prisma's update semantics; CONSERVATIVE — any doubt keeps the write;
Date↔ISO exact-ms comparison); the elided rows still count in
`updated` (the wire shape unchanged by construction — the s23
idempotence pin's updated: 3 holds with all three writes elided); a
row vanishing in the pass→tx window joins the documented accepted
read-hoist TOCTOU class, and the P2025 → named-409 door stays open
for changed rows. DC2 the questions item-shape mirror (the atom's
predicates verbatim — never stricter; `["garbage"]` now answers the
named 400). DC3 the doc-reconciliation pair (ADR-021's Decision +
AGENTS.md's import row). DC4 the write-only negative census (no
`.findFirst(` call form) + the elision census markers.

**The operational traps hit and closed (both self-inflicted, both
documented).** (1) The first backgrounded chunk-3 run was REAPED
mid-flight — the subshell-waiting form keeps the descendant alive
(the S110 descent lesson); the foreground re-run was clean (91/91).
(2) **The S153 edit-the-runner lesson RE-OFFENDED** — the cert header
note was inserted at the top of e2e-chunked-cert.sh WHILE bash
executed chunk 2 (the in-place write shifted the post-loop offsets
under the running fd). Caught within the repair window: the insertion
REVERTED to the byte-identical original (git diff empty) while the
loop held chunks 3-5 in memory, so the cert completed with its DONE
line and exit code intact; the note re-applied post-run. The
sharpened lesson: the rule needs its RECOVERY recipe — an in-place
edit under a running bash is recoverable IF the file is restored
byte-identical before the parser reads past its buffered position.

**Re-cert (the FINAL tree).** lint ✓ · tsc ✓ · unit **1588/1588**
(48 files, +6: data-import +4, script-conventions +2) · build ✓
(exit 0; the 6 documented warnings; the elision verified shipped in
the standalone chunk — the minified Date.parse/getTime diff guard) ·
the targeted e2e: chunk 3 **91/91 first-pass** cold (the import
413/409 family + the CL1 equal-times round-trip) · chunk 5 **89/89
first-pass** cold (the s23 round-trip + the idempotent re-import
[created=0, updated=3 with all three writes elided — the elision's
behavioral proof] + the 400 family + rollback) — the cold 5-chunk
cert: chunk 1 152/152 · chunk 2 189/189 · chunk 3 **91/91 on the
identical-combo cold re-run** (the cert-run attempt carried TWO
failures root-caused as the documented P1008 machine-load class —
the ambient Prisma socket-timeout signature, the files-upload legs;
closed by the clean first-pass re-run) · chunk 4 95/95 · chunk 5
89/89 — **616/616** (the e2e census unchanged
by design) · **census 2204 green** (was 2198).

**Evidence.** The `docs/screenshots/154-clone-*.png` frames (the
standing desktop + mobile drawer [the 69th drawer-GREEN companion] +
the Restore card's completed re-import result [the elision's
user-visible wire proof — created 0, updated N]) + the
`154-import-elision-evidence.json` record (the wire round-trip + the
measurement table), self-verifying (the capture script's JSON verdict
ok:true; dimensions machine-checked 1440x900 / 390x844). The DC1
diff's proof rides the unit trio + the censuses + the s23/resilience
re-cert (the CW2 runtime-split precedent).

**Docs.** README badge/census (2198 → 2204) + the unit/e2e prose
sites + the Data-portability feature row's elision note + the
Session-154 row; AGENTS census (1582 → 1588) + the import row's
three-count reconciliation + the S154 lessons block (four lessons);
CLAUDE counts; PAD v1.3.62 (the revision block + the ADR-021 Decision
reconciliation); the SKILL census (all three sites); the vitest header
re-anchor (+6 with the no-e2e-by-design note); the cert runner re-tag
(applied post-run); `docs/session_181.md`; this entry; the plan §6
as-executed close; the `.env.example` contract re-verified (no
env-var reads changed this cycle).

**Next cycle.** The rotation continues — the raw-SQL bulk upsert (the
changed-rows tail's next step IF profiling ever shows the 60 s budget
pressed) and the export streaming (the I-A peak-memory residual) stay
the import family's recorded candidates; the db-path percent-decode
stays recorded for the db-path-family cycle; the A-M3 stage-2 stays
deferred ON MEASUREMENT (re-measure if the hardware or the row cap
changes).

## Session 166 — the S155 cycle (Batch DD: the module-anchor percent-decode + db-path-family doc-reconciliation set)

**Workspace**: warm continuation at `2c4b5f4` on `main` (the Batch DC
fix `32c2221` + the operator's session_182 transcript commit; `git
pull` fast-forward, environment intact). **Cold baseline**: lint ✓ ·
tsc ✓ · unit 1588/1588 (48 files — the documented S154 final state) ·
preflight GREEN · the drawer check GREEN (**the 70th consecutive**
no-Tailwind-v4-mobile-nav-bug confirmation) · the desktop parity
probe **MATCH** (all five formal checks, live reference login).

**The audits.** A — the Batch DC recent-changes axis (`32c2221`):
**clean** (all four DC claims verified at the source level — the
elision pass + the counted-as-updated wire, the questions mirror, the
census pair; the doc census machine-verified, zero stale sites). B —
the db-path/database-resolution family (never swept as an axis,
carrying the nine-cycles-old S150 B-I3; dispatched to a read-only
subagent against the web-application skill's §3/§4/§6/§16/§17
rubric): **0C/0H/0M/5L/4I** — the core discipline HOLDS (one
sanctioned read site, one PrismaClient site, the seed through the
seam, the e2e/docker/.env.example triangle consistent); the findings:
L1/L2 the module anchor's raw `.pathname` form does not
percent-decode `import.meta.url` (empirically confirmed by a /tmp
spaced-fixture probe — the anchor silently dropped, resolution
falling back to the foreign-CWD rule; plus the Windows drive-letter
asymmetry); L3 DEPLOYMENT.md §4's seed line promised a wipe the
idempotent seed never performs; L4 §6 carried the nonexistent
smoke-test.sh; L5 the single-file e2e row invites the direct
invocation the cold-reset chain-lock forbids.

**The plan** (`docs/remediation-plan-session155.md`) written BEFORE
any source change, validated against the codebase (the RED inventory
sized +8 unit legs, +0 e2e legs by design — the CV1 runtime-split
precedent).

**The mid-cycle design correction (the cycle's load-bearing finding,
MEASURED).** The first DD1 design was a `moduleAnchorPath` helper
seam (the S124/BY2 explicit-args doctrine) — but the build measured
the standalone output at **699M vs the pre-fix 144M**: Turbopack's
file tracer statically evaluates `fileURLToPath(import.meta.url)`
(the bundler knows import.meta.url) yet cannot see through a wrapper
around it — the opaque form trips whole-project tracing. The shipped
form is the DIRECT call inside candidateRoots (the URIError caught
by the existing try/catch), and the unit layer was re-architected to
INTEGRATION legs: fixture-repo copies imported through their own
percent-encoded import.meta.url (spaced + non-ASCII + plain-identity
+ the mutated-copy malformed-URL guard). **Shipped build: 144M
byte-identical to pre-fix; 7 warnings (the 6 documented + the
node:url advisory, the same server-only false-positive class).**

**The fixes (the unit REDs 6/6 on their designed markers after the
re-architecture; both census legs proven LIVE by a temporary
regression — RED on the raw-pathname tree, GREEN on the fix).** DD1
the module-anchor percent-decode — the direct `fileURLToPath` call
(a spaced/non-ASCII checkout path KEEPS its anchor — the S150 B-I3
class closed; the Windows drive-letter form carried by the same
call; the header anchor-order list reconciled to the code's push
order). DD2 the DEPLOYMENT.md pair (the honest seed early-return
language + the dropped smoke-test.sh residue line). DD3 the
AGENTS.md single-file e2e row's cold-reset caveat. DD4 the sidecar
hygiene (`rm -f db/e2e.db*` + the .gitignore -wal/-shm patterns).

**The live spaced-path probe** (`scripts/probe-dbpath-spaced-s155.mjs`):
BEFORE — the anchor dropped, resolution `file:/tmp/db/custom.db` (the
WRONG database); AFTER — the anchor decoded, resolution
`file:/tmp/s155 My Repo/db/custom.db`. The before/after pair + the
build-measurement table preserved as
`docs/screenshots/155-dbpath-percent-decode-evidence.json`.

**Re-cert (the FINAL tree).** lint ✓ · tsc ✓ · unit **1594/1594**
(48 files, +6: db-path +4, script-conventions +2) · build ✓ (exit 0;
7 warnings; the standalone 144M byte-identical — the tracing
regression designed away) · the targeted e2e: chunk 1 **152/152
first-pass** cold — the 5-chunk cold cert: chunk 1 152/152 · chunk 2
189/189 · chunk 3 **90/91** (ONE failure — the resilience
files-upload leg, the documented P1008 machine-load class: the
ambient Prisma socket-timeout signature in the cert log, the
same-shape siblings passing, closed by the three-signal protocol)
· chunk 4 95/95 · chunk 5 89/89 — the chunk-3 identical-combo cold
re-run **91/91 first-pass clean** — the cert tally **616/616** (the
e2e census unchanged by design) · **census 2210 green** (was 2204).

**Evidence.** The `docs/screenshots/155-clone-*.png` frames (the
standing desktop + mobile drawer [the 71st drawer-GREEN companion]),
self-verifying (ok:true; dimensions machine-checked 1440x900 /
390x844) + the percent-decode before/after JSON record. The DD1
proof rides the integration legs + the censuses + the probe + the
cert (the CW2 runtime-split precedent).

**Docs.** README badge/census (2204 → 2210) + the unit-count prose
sites + the Session-155 row; AGENTS census (1588 → 1594) + the :82
row's cold-reset caveat + the S155 lessons block (four lessons);
CLAUDE counts; PAD v1.3.63 (the revision block); the SKILL census
(all three sites); the vitest header re-anchor; `docs/session_183.md`;
this entry; the plan §6 as-executed close; the `.env.example`
contract re-verified (no env-var reads changed; .env and
.env.example byte-identical at the documented dev posture).

**Next cycle.** The rotation continues — the export streaming (the
I-A peak-memory residual, its own streaming-design cycle) stays the
import family's recorded candidate; the raw-SQL bulk upsert (IF
profiling ever presses the 60 s budget); the A-M3 stage-2 stays
deferred ON MEASUREMENT (re-measure only if the hardware or the row
cap changes).

## Session 167 — the S156 cycle (Batch DE: the streaming-export cycle)

**Workspace**: warm continuation at `68da300` on `main` (the Batch DD
fix `a1aa229` + the operator's session_184 transcript commit; `git
pull` fast-forward, environment intact). **Cold baseline**: lint ✓ ·
tsc ✓ · unit 1594/1594 (48 files — the documented S155 final state) ·
preflight GREEN · the drawer check GREEN (**the 72nd consecutive**
no-Tailwind-v4-mobile-nav-bug confirmation) · the desktop parity probe
**MATCH** (all five formal checks, live reference login).

**The audits.** A — the Batch DD recent-changes axis (`a1aa229`):
**clean** (all four DD claims verified at the source level — the
direct fileURLToPath call + the census pair, the DEPLOYMENT.md pair,
the AGENTS.md caveat, the sidecar hygiene; the doc census
machine-verified, zero stale sites). B — the export/data-portability
family (the S155 close's recorded rotation — "the export streaming,
its own streaming-design cycle"; dispatched to a read-only subagent
against the web-application skill's §3/§4/§6/§16/§17 rubric):
**0C/0H/1M/3L/4I** — the family coherent, well-pinned, and secure;
the findings: **F1 (M)** the recorded I-A residual confirmed and
quantified — the peak memory is O(account) at **≈ 3–4× the serialized
body** (all 20 findMany sets + the normalized copy + the whole-body
string + the length-encode, simultaneously) with the 256 MiB gate
firing only AFTER the peak (a multi-GB account fully materializes
before being refused; the serve-time floor adds undici's eager
encode); **F2 (L)** exportByteSize allocates a full body-sized
Uint8Array just to read .length; **F3 (L)** the 20-read snapshot is
not transactional (the documented honest-failing skew class —
deferred with the lock-measurement reason); **F4 (L)** the s21 size
pin asserted a re-serialization identity, not the raw served bytes;
F5–F8 the informationals.

**The plan** (`docs/remediation-plan-session156.md`) written BEFORE
any source change, validated against the codebase (the RED inventory
sized: +9 unit legs / −2 superseded / +1 route-stream census, +0 e2e
legs by design — the CV1 runtime-split precedent).

**The fixes (the unit REDs 12/12 on their designed markers).** DE1 the
streaming fragment serialization — the PURE driver
`buildExportFragments(user, readCollection, exportedAt)` in
data-export.ts (the S124/BY2 explicit-args doctrine applied to the
READS: the collection reader injected as a parameter — the assembly
becomes unit-testable AND one-collection-at-a-time): sequential reads
in EXPORT_COLLECTIONS order, per-row serialization through the same
normalizer, per-fragment byte counting (every encoded fragment is
RETAINED payload — F2 closed structurally), retain-while-under-ceiling
(a multi-GB account refused at ≤ ceiling + head + one piece, the error
carrying the EXACT total), and the concatenation **byte-identical to
JSON.stringify(buildDataExport(...))** — pinned by the unit ORACLE
legs (buildDataExport stays as the executable reference). export-build
rewrites to the thin READERS-map wiring (the Record key type makes an
omitted collection a compile error; the exactly-20 findMany census
survives verbatim); the route STREAMS the fragments (ReadableStream,
chunked transfer — serve-time peak ≈ 1× body; X-Export-Bytes stays the
exact served byte count); ExportTooLargeError moves to the pure seam
(http.ts re-exports — every existing import green, no cycle). **The
memory ledger: build peak 3–4×B + all rows → ~1×B + one collection;
serve peak 2–3×B → ~1×B; the over-ceiling refusal unbounded → ≤
ceiling + ε** (the single->memory-collection cursor bound recorded as
the phase-2 residual). DE2 the exportByteSize retirement (the BZ15
dead-export precedent; the A-M2 byte lesson carried into the driver's
byte leg). DE3 the s21 raw-body pin (the header against the ACTUAL
served bytes — the F4 finding).

**The live stream probe** (`scripts/probe-export-stream-s156.mjs`):
the body arrives **chunked** and byte-complete (**X-Export-Bytes 19832
=== the actual received bytes**), the envelope parses with all 20 keys
+ consistent counts, the secret guard holds, and the **LIVE round-trip
restores idempotently (created: 0** — the S139-CN2 witness class).
Preserved as `docs/screenshots/156-export-stream-evidence.json`.

**Re-cert (the FINAL tree).** lint ✓ · tsc ✓ · unit **1602/1602**
(48 files, +8: data-export +9, script-conventions +1, −2 superseded) ·
build ✓ (exit 0; 7 warnings — the documented set; **the standalone
144M byte-identical** — no tracing regression: globals only, the S155
lesson honored by construction) · the remediated-tree re-confirmation:
preflight GREEN · drawer GREEN (**the 73rd**) · parity **MATCH** · the
targeted e2e: chunk 1 **152/152 first-pass** cold — the 5-chunk cold
cert: **all five chunks FIRST-PASS CLEAN, zero flakes** (152/152 ·
189/189 · 91/91 · 95/95 · 89/89) — the cert tally **616/616** (the
e2e census unchanged by design; the four live export consumers
re-certified) · **census 2218 green** (was 2210).

**Evidence.** The `docs/screenshots/156-clone-*.png` frames (the
standing desktop + mobile drawer [the 73rd drawer-GREEN companion]),
self-verifying (ok:true; dimensions machine-checked 1440x900 /
390x844) + the live stream-probe JSON record. The DE1 proof rides the
unit oracle legs + the re-anchored censuses + the live probe + the
cert (the CW2 runtime-split precedent).

**Docs.** README badge/census (2210 → 2218) + the unit-count prose
sites + the data-export row extension + the Session-156 row; AGENTS
census (1594 → 1602) + the S156 lessons block (four lessons); CLAUDE
counts; PAD v1.3.64 (the revision block); the SKILL census (all three
sites); the vitest header re-anchor; `docs/session_185.md`; this
entry; the plan §6 as-executed close; the `.env.example` contract
re-verified (no env-var reads changed; .env and .env.example
byte-identical at the documented dev posture).

**Next cycle.** The rotation continues — the recorded deferrals: F3's
$transaction snapshot (the lock-behavior measurement against the
import's 60 s write-tx family), F5's page-grid-from-envelope + the
count-only page consumption (the phase-2 leaner page), the
single-collection cursor pagination, the raw-SQL bulk upsert (IF
profiling ever presses the 60 s budget), the A-M3 stage-2 (re-measure
only if the hardware or the row cap changes).

## Session 168 — the S157 cycle (Batch DF: the leaner-page cycle)

**Workspace**: warm continuation at `6befbab` on `main` (the Batch DE
fix `cf1fb4d` + the operator's session_186 transcript commit; `git
pull` fast-forward, environment intact). **Cold baseline**: lint ✓ ·
tsc ✓ · unit 1602/1602 (48 files — the documented S156 final state) ·
preflight GREEN · the drawer check GREEN (**the 74th consecutive**
no-Tailwind-v4-mobile-nav-bug confirmation) · the desktop parity probe
**MATCH** (all five formal checks, live reference login — the S142
outer-footprint probe; the s141 probe's 258px navWidth is the known
inner-nav artifact).

**The audits.** A — the Batch DE recent-changes axis (`cf1fb4d`):
**clean** (all five DE claims verified at the source level — the
driver, the READERS map, the ReadableStream route, the DE2 retirement,
the DE3 raw-body pin; the doc census machine-verified, zero stale
count sites). B — the export/import data-portability family (the S156
close's recorded rotation; dispatched to a read-only subagent against
the web-application skill's §3/§4/§6/§16/§17 rubric):
**0C/0H/1M/2L/6I** — the family coherent, well-pinned, and secure;
the findings: **M-1** the repo's own query-engine binary carries
`BEGIN IMMEDIATE` (×2), NOT `BEGIN DEFERRED` — the F3 wrap's lock
premise needed empirical probing; **L-1** the /export page's 20-count
grid had NO manifest-completeness census (a dropped collection ships
a 19-chip grid with every gate green); **L-2** the AGENTS.md export
row still said "read in parallel" (stale since S156/DE1); I-1..I-6
the informationals (the unscoped-update TOCTOU note, the
force-dynamic posture, the bounded Pass-2 encodes, the stale pin
comments, the F3/F5/F7 confirmations, the census integrity).

**The F3 measurement ran FIRST (the S154 measurement-first doctrine)
— and REJECTED the deferred design.** The lock probe
(`scripts/measure-export-lock-s157.mjs`, two Prisma clients against a
throwaway db): while a read-only interactive `$transaction` is open, a
concurrent write **waits the full remaining hold** (2435 ms against a
2500 ms hold; 1332 ms in the 20-read export rehearsal) then succeeds;
reads coexist (2 ms); past the 5 s busy_timeout writers fail outright
— exactly the large accounts the snapshot would serve. **The F3
$transaction snapshot is REJECTED ON MEASUREMENT** — the
honest-failing skew posture is the correct endpoint; the deferral
converts from cautionary to MEASURED-REJECTED.

**The plan** (`docs/remediation-plan-session157.md`) written BEFORE
any source change, validated against the codebase (the RED inventory
sized: +2 unit legs / +0 e2e — the CV1 runtime-split precedent).

**The fixes (the unit REDs 4/4 on their designed markers).** DF1
grid-from-envelope (the F5 close, the cycle core) — the driver's
return grows the STRUCTURED counts record
(`RenderedExport = { fragments, bytes, counts }` — the loop-local the
head fragment already serializes; zero new work), ExportTooLargeError
grows a REQUIRED counts payload (the over-ceiling /export render keeps
its grid), and the page RETIRES its own 20 `count()` query family +
the hand-written counts literal + the `db` import: ONE
`renderExportEnvelope` call feeds the grid AND the size signal. **The
properties: per-view queries halve; the page-internal skew class is
eliminated (one pass by construction); L-1 closes STRUCTURALLY (the
grid derives from EXPORT_COLLECTIONS through the seam — a dropped
collection is a READERS compile error); the panel renders
byte-identically** (chip order = EXPORT_COLLECTIONS = the retired
literal's order). The count-only page-consumption half was REJECTED by
adjudication (the exact bytes are only knowable from the full
serialization — the CP4 size signal; the single-path doctrine holds).
DF2 the measured-record rider (export-build.ts's read-skew header
re-words with the probe's numbers + the rejection). Riders: L-2 (the
AGENTS export row re-anchor), I-4 (the two stale pin comments), the
DB2 census + comment re-anchors.

**The live page probe** (`scripts/probe-export-page-s157.mjs`): the
/export page renders **20 chips in EXPORT_COLLECTIONS order**; the
grid counts **MATCH the API envelope's own counts** (the cross-check
through GET /api/export/data); the size signal renders; **X-Export-Bytes
19832 === the actual received body bytes**; the secret guard holds.

**Re-cert (the FINAL tree).** lint ✓ · tsc ✓ · unit **1604/1604**
(48 files, +2: the counts-weld leg + the over-ceiling-counts leg) ·
build ✓ (exit 0; 7 warnings — the documented set; **the standalone
144M byte-identical** — the diff only REMOVES an import) · the
remediated-tree re-confirmation: preflight GREEN · drawer GREEN (**the
75th**) · parity **MATCH** · the targeted e2e: chunk 5 **89/89
first-pass** cold (s21 + s23 — the direct page consumers) + chunk 1
151/152 with one machine-load flake (parity-session8's BZ3
popover-keyboard leg — **standalone-cold re-run 68/68 first-pass**,
the S139 machine-load class, unrecurring in the cert) — the 5-chunk
cold cert: **all five chunks FIRST-PASS CLEAN** (152/152 · 189/189 ·
91/91 · 95/95 · 89/89) — the cert tally **616/616** (the e2e census
unchanged by design; the three live export consumers re-certified) ·
**census 2220 green** (was 2218).

**Evidence.** The `docs/screenshots/157-clone-*.png` frames (the
standing desktop + mobile drawer [the 75th drawer-GREEN companion] +
**the cycle's surface: the remediated /export page — 20 chips,
machine-counted by the capture script**), self-verifying (ok:true;
dimensions machine-checked) + the live page-probe record. The DF1
proof rides the unit counts-weld leg + the re-anchored censuses + the
live probe + the cert; the DF2 proof rides the committed probe script
+ the measured numbers recorded in the seam header, the plan, and the
session log.

**Docs.** README badge/census (2218 → 2220) + the unit-count prose
sites + the data-portability row extension + the Session-157 row;
AGENTS census (1602 → 1604) + the export row re-anchor (the L-2 fix) +
the S157 lessons block (three lessons); CLAUDE counts; PAD v1.3.65
(the revision block); the SKILL census (all five sites); the vitest
header re-anchor; `docs/session_187.md`; this entry; the plan §6
as-executed close; the `.env.example` contract re-verified (no
env-var reads changed; .env and .env.example byte-identical at the
documented dev posture).

**Next cycle.** The rotation continues — the recorded deferrals: the
single-collection cursor pagination (a >memory single collection still
materializes — census-breaking, its own cycle), F7's cosmetic edges
(the UTC filename stamp, the 429-through-the-download anchor), I-1's
cross-account TOCTOU documentation note, the raw-SQL bulk upsert (IF
profiling ever presses the 60 s budget), the A-M3 stage-2 (re-measure
only if the hardware or the row cap changes).

## Session 169 — the S158 cycle (Batch DG: the keyset-batched-reads cycle)

**Workspace**: COLD — a fresh `git clone` at `69cebc0` on `main` (the
Batch DF fix `0c6fa3d` + the operator's session_188 transcript commit);
the environment rebuilt (`.env` from the byte-identical `.env.example`,
`bun install`, `db:push && db:seed` → the repo-root `db/custom.db`, the
Playwright chromium cache restored). **Cold baseline**: lint ✓ · tsc ✓ ·
unit 1604/1604 (48 files — the documented S157 final state) · preflight
GREEN · the drawer check GREEN (**the 76th consecutive**
no-Tailwind-v4-mobile-nav-bug confirmation) · the desktop parity probe
**MATCH** (all five formal checks, live reference login — the S142
outer-footprint probe).

**The audits.** A — the Batch DF recent-changes axis (`0c6fa3d`;
`69cebc0` docs-only): **clean** (all six DF claims verified at the
source level — the counts return, the required-arg error, the page's
count-family retirement, the measured-record header, the S157/DF1
describe, the DB2 negative censuses; the doc census machine-verified,
zero stale count sites). B — the export/import data-portability family
(the S157 close's recorded rotation; dispatched to a read-only
subagent against the web-application skill's §3/§4/§6/§16/§17 rubric):
**0C/0H/0M/2L/5I** — the family coherent, well-pinned, and secure; the
findings: **L-1** the Restore card's file input resets its value on
the oversized branch only (a re-picked, edited backup after a failed
import silently re-sends the ORIGINAL File snapshot); **L-2** the
import tx's update writes are unscoped and the payload re-attaches
`userId` — the read-hoist TOCTOU's under-documented ownership-flip
sub-variant. The three recorded candidates adjudicated: the
single-collection cursor pagination → measurement-gated, run FIRST;
F7's cosmetic edges (the UTC stamp, the 429-through-the-anchor) →
REJECTED AS NOT-A-GAP (the polish options recorded); the I-1 TOCTOU
note → the cheap hardening is behavior-compatible (DG2).

**The DG0 measurement (run FIRST — the S154/S157 measurement-first
doctrine): the heap probe** (`scripts/measure-export-heap-s158.mjs`,
committed — three synthetic 50k-row users against a throwaway
`db/measure-s158.db`, gc'd baselines + a 25 ms sampler around the REAL
`renderExportEnvelope`, isolated per shape via the SHAPES env after a
diagnosed GC-suppression artifact): **SPREAD 1.51× · DOMINANT-notes
3.04× · DOMINANT-chat 3.12×** the envelope's own bytes — the
single-collection row-object term ≈ 2× the fragment term; at the
256 MiB ceiling a dominant account peaks at ~780 MiB heap (an OOM
class on small containers). **The verdict: the S157 close's "its own
cycle" condition was MET — the pagination became the cycle core** (and
the "census-breaking" premise was falsified: the oracle, the counts
record, and the throw were all pagination-invariant by construction).

**The fixes (TDD, RED 13/13 on their designed markers — the
contract-change surface):**

- **DG1 — the keyset-batched export reads (the cycle core).** The
  reader contract becomes paged (`(collection, after?) =>
  Promise<{ rows, hasMore }>`); the driver loops batches (the
  separator-across-pages correctness, counts page-summed, the
  defensive empty-page terminal, the retention/ceiling logic
  untouched); the server wiring rides `pageAfter` (5000-row BATCH+1
  pages, the unique-id cursor + skip 1 on the createdAt/id total
  order — the documented Prisma keyset idiom; all 20 readers, cards
  deck-scoped as ever). **The proof of fix (the probe re-run):
  dom-notes 3.04× → 1.28×, dom-chat 3.12× → 1.31× — both BELOW the
  spread shape's own 1.51×; the keyset-verify pass proves the
  real-Prisma continuation lossless at 50k rows per shape (counts ✓ ·
  unique ✓ · order ✓ — 150k rows verified; the unit fakes cannot
  prove Prisma's cursor semantics and the e2e data is single-batch,
  so the committed probe IS the fourth test tier).**
- **DG2 — the ownership-scoped import updates (the L-2 close).**
  `where: { id, userId: user.id }` for the 19 userId-carrying
  collections (cards excepted — no userId column, the residual named
  at the site); behavior-compatible on every current path (a
  vanished/foreign row throws P2025 → the existing named-409 leg).
- **DG3 — the Restore-card input reset (the L-1 close).** The success
  branch gains `e.target.value = ""` — the stale-snapshot class gone.

**Gates.** lint ✓ · tsc ✓ · unit **1611/1611** (48 files, +7 exactly
as enumerated — the plan draft's "+6" corrected in the plan §6
honestly) · build ✓ (7 warnings — the documented set; standalone
**144M**) · the live page probe GREEN (20 chips, the grid counts MATCH
the API envelope, X-Export-Bytes 19832 exact, the secret guard holds —
byte-identical through the pagination) · the remediated-tree
re-confirmation: preflight GREEN (after the documented S9/S31
stale-Turbopack remedy) · drawer GREEN (**the 77th consecutive**) ·
parity **MATCH** · the targeted e2e s21+s23 **21/21 first-pass** cold ·
the 5-chunk cold cert: 152/152 · 189/189 · 90/91 with one machine-load
flake (resilience's S120/BU1 Rename-dialog prefill leg — untouched by
this cycle's diff; standalone-cold re-run **41/41 first-pass, EXIT:0**
— the S139 machine-load class, the S157 BZ3 precedent) · 95/95 ·
89/89 — the cert tally **616/616** · **census 2227 green** (was 2220;
the final full unit re-run post-doc-edits 1611/1611).

**Evidence.** The `docs/screenshots/158-clone-*.png` frames (the
standing desktop + the mobile drawer [the 77th drawer-GREEN companion]
+ the cycle's surface: the /export page on the keyset-paged reads),
self-verifying (ok:true; dimensions machine-checked) + the committed
heap/keyset probe (the before/after record + the keyset-verify pass).

**Docs.** README badge/census (2220 → 2227) + the unit-count prose
sites + the data-portability row extension + the Session-158 row;
AGENTS census (1604 → 1611) + the export row re-anchor (the
keyset-paged wording) + the import row extension (DG2/DG3) + the S158
lessons block (three lessons); CLAUDE counts; PAD v1.3.66 (the
revision block); the SKILL census (all four sites); the vitest header
re-anchor (+7 with the probe-as-evidence note);
`docs/session_189.md`; this entry; the plan §7 as-executed close; the
`.env.example` contract re-verified (no env-var reads changed this
cycle — .env and .env.example byte-identical at the documented dev
posture).

**Next cycle.** The rotation continues — the recorded deferrals: F7's
polish options (the client `?stamp=`, the fetch→blob unification —
rejected as gaps, recorded), the raw-SQL bulk upsert (IF profiling
ever presses the 60 s budget), the A-M3 stage-2 (re-measure only if
the hardware or the row cap changes), the I-2 parse-amplification
posture (documented), the import's create-side raw-SQL sibling (the
same measurement gate).

## Session 170 — the S159 cycle (Batch DH: the optional-FK-mirror + value-parity-census cycle)

**Workspace**: COLD — a fresh `git clone` at `6cf1167` on `main` (the
Batch DG fix `3103b8b` + the operator's session_190 transcript commit);
the environment rebuilt (`.env` from the byte-identical `.env.example`,
`bun install`, `db:push && db:seed` → the repo-root `db/custom.db`, the
Playwright chromium cache restored). **Cold baseline**: lint ✓ · tsc ✓ ·
unit 1611/1611 (48 files — the documented S158 final state) · preflight
GREEN · the drawer check GREEN (**the 78th consecutive**
no-Tailwind-v4-mobile-nav-bug confirmation) · the desktop parity probe
**MATCH** (all five formal checks, live reference login). The config
posture re-validated for the operator's standing ask: the
vitest/playwright/tsconfig/eslint surfaces all exclude the repo-included
`skills/` folder from checking, testing, and compilation.

**The audits.** A — the Batch DG recent-changes axis (`3103b8b`;
`6cf1167` docs-only): **clean** (all three DG claims verified at the
source anchors — the paged-reader contract, the scoped updates, the
both-branches input reset; the doc census machine-verified, zero stale
count sites). B — the import create-path family (the S158 close's
recorded rotation; dispatched to a read-only subagent against the
web-application skill's §3/§4/§6/§7/§16/§17 rubric): **0C/0H/0M/3L/6I**
— the family coherent, well-pinned, and secure; the findings: **L-1**
the optional-FK non-string divergence (the seam's reference parser nulls
a numeric `subjectId` while production's twin guard skips it → Prisma's
generic "fields do not match" 400 — the CJ4 degradation class on the
optional boundary); **L-2** the length-cap parity machine-enforced at
the KEY level only, never the VALUE level (34 hand-mirrored atoms across
five source files); **L-3** the create-side measurement gate unanswered
in the recorded evidence. The round-trip compatibility verdict:
COMPATIBLE, pinned (the DG1 pagination is wire-invisible).

**The DH0 measurement (run FIRST — the measurement-first doctrine): the
create-side probe** (`scripts/measure-import-create-s159.mjs`,
committed — riding the REAL validateImportEnvelope/sanitizeImportRow
stages and the route's exact tx shapes against a throwaway
`db/measure-s159.db`): the chunked createMany loop **0.046 ms/row at
the 100k cap** (~7× cheaper than the update loop); the worst legal
MIXED tx (50k updates + 50k creates in one 60 s transaction) **19.6 s —
3.07× headroom**; the pre-tx CPU **747 ms** at the cap; the end-to-end
**20.3 s of the 120 s client deadline — 5.91× headroom**. **The
verdict: the raw-SQL create-side sibling's deferral STAYS CLOSED,
rejected on measurement; L-3 closed by data.**

**The fixes (TDD, RED 3/3 on the designed markers — the DH2 census legs
green-on-arrival by design, the guard, with the loud-extraction property
demonstrated live mid-cycle):**

- **DH1 — the optional-FK non-string rejection (the L-1 close, the CJ4
  mirror).** `validateImportEnvelope` rejects a non-string non-null
  non-undefined optional-FK value with the named 400; null keeps the
  SetNull semantics, undefined keeps the update-branch untouched case.
  **Verified live: the named 400 on the number shape (previously the
  generic Prisma fallback); the dangling-STRING twin still imports clean
  end-to-end (200, created: 1).**
- **DH2 — the length-cap VALUE-parity census (the L-2 close).** Three
  census legs make the IMPORT_FIELD_LENGTHS mirror self-guarding against
  its five source sites (validation.ts's atoms/literals, the folders
  route-local atom, ai.ts's PERSISTED_CONTENT_MAX, http.ts's
  UPLOAD_MIME_MAX_CHARS) — a future relaxation trips the census before
  the import bricks a restore the app itself minted.
- **DH3 — the riders.** The dead ternary in the referenced-ids loop
  collapsed; the S154 probe's stale "Deleted after" header reconciled to
  the honest retention record.

**Gates.** lint ✓ · tsc ✓ · unit **1619/1619** (48 files, +8 exactly as
designed) · build ✓ (7 warnings — the documented set; standalone
**144M**) · the live page probe GREEN (20 chips, the grid counts MATCH
the API envelope, X-Export-Bytes 19832 exact, the secret guard holds) ·
the live DH1 probe GREEN (the named 400 + the clean SetNull import) ·
the remediated-tree re-confirmation: preflight GREEN (after the
documented S9/S31 stale-Turbopack remedy) · drawer GREEN (**the 79th
consecutive**) · parity **MATCH** · the 5-chunk cold cert: chunk 1
**151/152** (one machine-load flake — parity-session8's S125/BZ3 "Tab
closed the menu" leg, the documented S139/S157 class, untouched by
this cycle's diff; standalone-cold re-run **68/68 first-pass clean**)
· chunk 2 **185/189 with the four UTC-midnight day-boundary legs**
(the cert run CROSSED 00:00 UTC — the documented S45 class: the chunk
seeded pre-midnight and read its day-relative dates one day stale;
the full-chunk standalone-cold re-run **189/189 first-pass clean**) ·
chunk 3 **90/91** (one machine-load flake — resilience's files-upload
"unrelated folder succeeds" leg, untouched by this cycle's diff; the
settled standalone-cold re-run **41/41 first-pass clean** — the S158
precedent's exact numbers; a first back-to-back re-run under post-run
load showed 39/41 before the machine settled) · chunk 4 **95/95** ·
chunk 5 **89/89** — the cert tally **616/616 with the three flake
classes each adjudicated standalone-clean** · **census 2235 green**
(was 2227; the final full unit re-run post-doc-edits 1619/1619).

**Evidence.** The `docs/screenshots/159-clone-*.png` frames (the
standing desktop + the mobile drawer [the 79th drawer-GREEN companion]
+ the cycle's surface: the /export page whose Restore card the cycle
hardened), self-verifying (ok: true; dimensions machine-checked) + the
committed DH0 probe (its budget numbers ARE the L-3 close).

**Docs.** README badge/census (2227 → 2235) + the unit-count prose
sites + the Session-159 row; AGENTS census (1611 → 1619) + the import
row extension (DH0/DH1/DH2) + the S159 lessons block (three lessons);
CLAUDE counts; PAD v1.3.67 (the revision block); the SKILL census (all
four sites); the vitest header re-anchor (+8); `docs/session_191.md`;
this entry; the plan §7 as-executed close; the `.env.example` contract
re-verified (no env-var reads changed this cycle — .env and
.env.example byte-identical at the documented dev posture).

**Next cycle.** The rotation continues — the recorded deferrals: the
A-M3 stage-2 (re-measure only if the hardware or the row cap changes);
the update-side raw-SQL bulk upsert (the gate closed HARDER on the DH0
numbers — 3.07× headroom on the worst mixed shape); the I-2/I-3 riders
(rejected as measurement-covered / documented trade-off, the options
recorded in the plan §6); the I-4 parse-amplification posture
(documented, S144/CS5).

## Session 171 — the S160 cycle (Batch DI: the AI-routes hardening cycle)

**Workspace**: WARM at `db30190` on `main` (the Batch DH fix `21efe2b`
+ the operator's session_192 transcript commit; `git pull`
fast-forwarded docs-only). The environment verified in place (`.env`
byte-identical to `.env.example` at the documented dev posture —
`DATABASE_URL="file:../db/custom.db"`, the repo-root `db/`, the
Playwright chromium cache, bun 1.3.14). **Cold baseline**: lint ✓ ·
tsc ✓ · unit 1611→**1619/1619** (48 files — the documented S159 final
state) · preflight GREEN · the drawer check GREEN (**the 80th
consecutive** no-Tailwind-v4-mobile-nav-bug confirmation) · the
desktop parity probe **MATCH** (all five formal checks, live reference
login). The config posture re-validated for the operator's standing
ask: the vitest/playwright/tsconfig/eslint surfaces all exclude the
repo-included `skills/` folder from checking, testing, and
compilation.

**The audits.** A — the Batch DH recent-changes axis (`21efe2b`;
`db30190` docs-only): **clean** (all three DH claims verified at the
source anchors — the optional-FK rejection block, the value-parity
census legs, the dead-ternary collapse; the doc census
machine-verified, zero stale count sites). B — the AI routes + AI
persistence family (the rotation's fresh axis — the family last
deep-swept at cycle 72/session-122's BW set, the most stale family on
the board after four consecutive export/import cycles; dispatched to
a read-only subagent against the web-application skill's
§3/§4/§5/§6/§7/§16/§17 rubric): **0C/0H/2M/4L/3I** — the family
coherent, secure, and substantially well-pinned (the auth gate
ordering, the shared 20/15-min budget on all four POST routes, the
Zod bounds, the SDK isolation, the BW2/CA1/CB8 contracts all held);
the findings: **M-1** generate-cards had ZERO round-trip coverage;
**M-2** the CB8 send/refresh split pinned only for chat ("didn't
refresh" matched zero e2e assertions — the solver/flashcards twins
unpinned); **L-1** generate-cards' `$transaction` lacked the siblings'
CE9 timeout; **L-2** `aiChatSchema` accepted an all-assistant payload
→ a content-less user row; **L-3** the shared `ai:${user.id}`, 20 form
not machine-pinned per route; **L-4** `AiChatMessageRow.updatedAt`
typed but never delivered by the messages GET. The round-trip
compatibility verdict: COMPATIBLE (the only wire-vs-type drift was
L-4). No measurement-gated candidate this cycle.

**The fixes (TDD, the unit REDs 2/2 on their designed markers — the
DI2 refine leg + the DI3 tx-timeout census leg RED pre-DI1 on
generate-cards; the DI3 budget-key census leg green-on-arrival, the
guard; the DI4 e2e RED proven both directions — the CA1-extension's
updatedAt assertion failed against the pre-DI4 build, GREEN post-fix):**

- **DI1 — the generate-cards tx deadline (the L-1 close,
  mechanism-corrected).** The audit's "rides Prisma's 5 s interactive
  default" was imprecise — the ARRAY overload's options accept only
  `isolationLevel` (tsc names it), so the pre-fix shape carried NO
  deadline at all. The fix converts to the INTERACTIVE form with
  `{ timeout: 15_000 }` (both siblings' form), bounding the whole
  20-create write; the 201 wire unchanged.
- **DI2 — the aiChatSchema user-message refine (the L-2 close).** At
  least one user message required — the named 400 at the parse
  boundary; the route's `lastUserMessage` `""` fallback unreachable;
  no client impact (the client always appends a trailing user turn).
- **DI3 — the AI-routes source census (the L-3 + L-1 machine guard;
  tests/ai-routes-census.test.ts NEW).** Every AI POST route carries
  the exact shared budget form; every tx-carrying route pairs the CE9
  timeout option — a forked key/limit or a bare `$transaction` fails
  the unit layer.
- **DI4 — the updatedAt wire reconciliation (the L-4 close).** The
  messages GET map gains the field — the wire honors the store type
  (the generic fetchAndSet flows the wire verbatim; the factory GETs
  already returned full rows).
- **DI5 — the CB8 solver/flashcards twin pins (the M-2 close).** The
  chat pin's exact shape on the two unpinned surfaces: mock the send
  SUCCESS, abort the refresh, assert the honest soft toast + the
  ABSENCE of the false-failure toast (no LLM, no budget).
- **DI6 — the generate-cards pre-LLM wire pin (the M-1 close).** One
  fresh TEST-NET user: the anon 401, the count-bound 400, the
  foreign-deck 404 with the named copy — the route's
  auth/validation/ownership boundary pinned at the wire for the first
  time. The LLM-side residual documented with its reasoning.

**Gates.** lint ✓ · tsc ✓ · unit **1622/1622** (49 files, +3 exactly
as designed) · build ✓ · the remediated-tree re-confirmation:
preflight GREEN (the S9/S31 stale-cache remedy applied) · drawer GREEN
(**the 81st consecutive**) · parity **MATCH** · the 5-chunk cold cert:
chunk 1 **154/154** (+2, the DI5 twins, first-pass clean) · chunk 2
**189/189** · chunk 3 **92/92** (+1, the DI6 wire pin) · chunk 4
**95/95** · chunk 5 **89/89** — **all five chunks first-pass clean,
zero flakes, the cert tally 619/619** = **census 2241 green** (was
2235). A tooling find on the way: a combined 3-spec direct run tripped
the P1008 socket-timeout machine-load class (the heavy write legs fail
fast under combined load on this sandbox) — the serial per-file runs
and the one-server-boot-per-chunk cert are the load-safe shapes,
exactly why the chunked map exists.

**Evidence.** The `docs/screenshots/160-clone-*.png` frames (the
standing desktop + the mobile drawer [the 81st drawer-GREEN companion]
+ the cycle's Flashcards surface — the AI Generate route this cycle
hardened), self-verifying (ok: true; the non-blank pixel ratios
verified: 22.3% / 41.4% / 11.2%).

**Docs.** README badge/census (2235 → 2241) + the count prose sites +
the Session-160 row; AGENTS census (1619 → 1622) + the
security-hardening row extension + the S160 lessons block (three
lessons: the array-vs-interactive typing fact; the family-level
pinning asymmetry; the hand-written-map type-vs-wire lie); CLAUDE
counts + the contract extension; PAD v1.3.68 (the revision block);
the SKILL census (all four sites) + the green-state + the chunk-map
re-anchor; the vitest header re-anchor (+3); the cert runner re-tag
(616 → 619); `docs/session_193.md`; this entry; the plan §9
as-executed close; the `.env.example` contract re-verified (no
env-var reads changed this cycle — .env and .env.example byte-identical
at the documented dev posture).

**Next cycle.** The rotation continues — the recorded deferrals: the
A-M3 stage-2 (re-measure only if the hardware or the row cap
changes); the update-side raw-SQL bulk upsert (closed HARDER on the
DH0 numbers); the S159 plan §6 options (rejected as
measurement-covered / documented trade-off); the I-4 parse posture
(documented); the M-1 LLM-side residual (the generate-cards 502/201
legs — documented, bounded by the unit-pinned parse atoms + the DI5
client-path coverage).

## Session 172 — the S161 cycle (Batch DJ: the FE/views hardening cycle)

**Workspace**: COLD — a fresh `git clone` at `e8fe09f` on `main` (the
S160/Batch DI fix `36e0554` + the operator's session_194 transcript
commit). The environment rebuilt from the documented quickstart (`.env`
from `.env.example` [byte-identical at the documented dev posture],
`bun install` [510 packages], `db:push && db:seed` [the repo-root
`db/custom.db` 389 KB], the Playwright chromium cache installed, bun
1.3.14). **Cold baseline**: lint ✓ · tsc ✓ · unit **1622/1622** (49
files — the documented S160 final state) · preflight GREEN · the drawer
check GREEN (**the 82nd consecutive** no-Tailwind-v4-mobile-nav-bug
confirmation) · the desktop parity probe **MATCH** (all five formal
checks, live reference login). The config posture re-validated for the
operator's standing ask: the vitest/playwright/tsconfig/eslint surfaces
all exclude the repo-included `skills/` folder from checking, testing,
and compilation.

**The audits.** A — the Batch DI recent-changes axis (`36e0554`;
`e8fe09f` docs-only): **clean** (all six DI claims verified at the
source anchors — the interactive-tx deadline on all three AI routes,
the aiChatSchema refine, the AI-routes census legs, the updatedAt map,
the CB8 twins, the DI6 wire pin; the doc census machine-verified, zero
stale count sites). B — the FE/views family (the rotation's fresh axis:
last deep-swept at S151/CZ, 9 cycles stale, the most stale family on
the board; dispatched to a read-only subagent against the
web-application skill's §4/§9/§12/§13/§16/§17 rubric — all 23 view
files + the 6 layout files + the auth surfaces + the data-layer seams +
the round-trip verification): **0C/0H/2M/3L/3I** — the family coherent
and unusually well-shaped (all 69 store selectors stable slice reads;
no `as any`; the CB8 splits correct at all four AI sites; the
round-trip verdict COMPATIBLE — the S160/DI4 delivery verified
end-to-end); the findings: **M-1** the Notes tag mutations discarded
`setNoteTags`'s designed caller rejection (the S151/CZ1 rewire dropped
the pre-CZ catch — an offline tag add/remove was fully silent PLUS an
unhandled promise rejection); **M-2** the Timetable band guard was
INERT (the form's `noValidate` killed the S127/CB6b min/max on the
TYPED path — a typed 06:30 start saved and the class silently VANISHED
from the desktop grid); **L-1** exams-view's local EXAM_TYPES twin (the
CB9 drift class — no single-source census pinning any of the three
swept enums); **L-2** the four hardcoded violet DARK branches (the
documented S135/CJ3 VIOLET_RESIDUALS deferral); **L-3** the assignments
slider rollback resync discarded `loadCollections`' rejection (the
S118/BS9 class). No measurement-gated candidate.

**The fixes (TDD — the unit REDs 7/7 on their designed markers; all
four e2e legs RED-proven against the pre-fix standalone build via the
stash/rebuild/re-run sequence, GREEN post-fix):**

- **DJ1 — the Notes tag-mutation error feedback (the M-1 close).** The
  mutateTags wrapper (the patchSelected shape): the id captured before
  the async op, the rejection toasting through the aria-live stack
  behind the AG6 departed-note guard; the CZ1 chain semantics untouched.
  E2e: the CB8-twin network-mock — abort the PATCH, add the tag, assert
  the honest toast + the draft stays cleared.
- **DJ2 — the Timetable band hand-guard (the M-2 close).** The DA2
  position: the start hour outside 7–20 answers the named human copy;
  the CB6b comment corrected (the native constraint never bound the
  typed path). E2e: TYPE the out-of-band start, submit, assert the
  named error + the open dialog + the zero-POST probe.
- **DJ3 — the view enum single-source census (the L-1 close;
  tests/enum-single-source.test.ts NEW).** exams-view imports the single
  source (the twin deleted); the census pins all THREE enums — RED
  pre-fix on the exams twin, the siblings guarded green-on-arrival.
- **DJ4 — the dark-edge token harmonization pass EXECUTED (the L-2
  close; the S135/CJ3 recorded deferral).** `--sf-primary-edge-dark`
  joins the 19-var accent set at the 800-level step of each accent's
  own hue family (violet EXACTLY the measured violet-800); the four
  registered sites convert; the boot-script suffix list + the
  globals.css utility + the :root fallback ride the same change; the
  VIOLET_RESIDUALS register EMPTIES with the closure pin + the
  treated-dark-half census. E2e: the CJ3 sweep's dark sibling — blue +
  dark, the selected-row border computes blue-800. The count-lockstep
  tripwires each fired exactly once in the same change (the S3-J 19
  pin; the theme-cache 19 suffix census; the hue anchors 736→761; the
  CZ1 census's call-shape update).
- **DJ5 — the slider rollback resync catch (the L-3 close).** The
  best-effort `.catch` with the honest comment. E2e: the PATCH AND the
  resync GET abort, the keyboard-committed drag, ONE toast + the
  ZERO-pageerror ledger.
- **DJ6 — the SignOutCard comment honesty (the I-1 rider).** The
  cookie-clearing claim that never existed, rewritten to the real
  trade-off.

**Gates.** lint ✓ · tsc ✓ · unit **1632/1632** (50 files, +10 exactly
as designed) · build ✓ · the remediated-tree re-confirmation:
preflight GREEN (the S9/S31 stale-cache remedy applied) · drawer GREEN
(**the 83rd consecutive**) · parity **MATCH** · the 5-chunk cold cert:
chunk 1 **154/154** · chunk 2 **192/192** (+3, first-pass clean) ·
chunk 3 **93/93** (+1 — the AK1c/d pair flaked once on the documented
P1008 machine-load class, 93/93 clean on the immediate re-run; the
pair passes in isolation and touches nothing this cycle changed) ·
chunk 4 **95/95** · chunk 5 **89/89** — the cert tally **623/623** =
**census 2255 green** (was 2241).

**Evidence.** The `docs/screenshots/161-clone-*.png` frames (the
standing desktop + the mobile drawer [the 83rd drawer-GREEN companion]
+ the cycle's Notes surface — the DJ1/DJ4 surface), self-verifying (ok:
true; the non-blank pixel ratios verified: 8.6% / 33.6% / 6.8%).

**Docs.** README badge/census (2241 → 2255) + the count prose sites +
the Session-161 row; AGENTS census + the e2e map re-tag + the S161
lessons block (three lessons: the noValidate attribute-guard trap; the
refactor-dropped-catch re-opening the silent-failure class; the
register-guarded deferral as the executable plan); CLAUDE counts + the
19-var token-set contract extension; PAD v1.3.69 (the revision block);
the SKILL census (all four sites) + the green-state + the chunk-map
re-anchor; the vitest header re-anchor (+10); the cert runner re-tag
(619 → 623); `docs/session_195.md`; this entry; the plan §9
as-executed close; the `.env.example` contract re-verified (no env-var
reads changed this cycle — .env and .env.example byte-identical at the
documented dev posture).

**Next cycle.** The rotation continues — the recorded deferrals: the
events `expandOccurrences` promotion to a `src/lib/` seam with unit
pins (the F-7 candidate, the next events-family cycle); the files
refresh-failure toast copy harmonization (the F-8 candidate); the S160
close's ledger (the A-M3 stage-2 triggers; the update-side raw-SQL bulk
upsert; the I-4 parse posture; the M-1 LLM-side residual); the
gradetracker/studygroups/settings-CRUD and AlertDialog-confirm e2e gaps
the audit's coverage census surfaced (the unpinned seams where both
Mediums hid).

## Session 173 — the S162 cycle (Batch DK: the events-family hardening cycle)

The workspace was WARM at `108956e` on `main` (the S161/Batch DJ fix
`4eaa9cf` + the operator's session_196 transcript commit). `git pull`
verified up-to-date with a clean tree; `.env` byte-identical to
`.env.example` at the documented dev posture, the repo-root `db/`
verified, `bun install` clean (516/609), bun 1.3.14, node v24.22.2.
Cold baseline matched the documented S161-final state exactly: lint ✓ ·
tsc ✓ · unit 1632/1632 (50 files) · the preflight GREEN (the S9/S31
stale-cache remedy applied at boot) · the drawer check GREEN (**the
84th consecutive** no-Tailwind-v4-mobile-nav-bug confirmation) · the
desktop parity probe **MATCH** (all five formal checks, live reference
login); the config posture re-validated (vitest include, playwright
testDir + the e2e.db webServer, tsconfig + eslint `skills` exclusions).

The audits (Mode-C; every M/L finding re-verified by direct read): A —
the Batch DJ recent-changes axis (`4eaa9cf`; `108956e` docs-only):
**0C/0H/0M/0L/0I — clean** (all six DJ claims confirmed at the source
anchors — the mutateTags wrapper, the band hand-guard, the EXAM_TYPES
import swap, the edge-dark token family + the four conversions, the
resync catch, the comment honesty; the doc census machine-verified,
zero stale count sites). B — the events family (the rotation's fresh
axis — the S161 close's own "Next cycle" list NAMED this axis: the
recorded F-7 deferral; the family last deep-swept at S152/DA, 9 cycles
stale; dispatched to a read-only subagent against the web-application
skill's §4/§9/§12/§13/§16/§17 rubric — events-view + calendar-view +
the events routes + the seams they consume + the round-trip
verification): **0C/0H/1M/3L/2I** — the family coherent (ownership in
the WHERE clause, the CE5 ordering guards, the BV10/BX3 datetime
round-trip, the 600/15-min write budget, take:500 bounded reads, zero
useEffect, zero space-y/x containers, the dark panel carrying no
dark: overrides); the findings: **M-1** the events mutations rejected
on the refresh leg after a COMMITTED write — a flaky refresh GET showed
"Something went wrong." in the still-open dialog, no success toast,
the form armed: a RETRY duplicated the event (the CB8 letter violated;
the AI family's three CB8 splits the behavioral precedent; the
sibling views share the family-wide posture); **L-1** the REPEATS
inline twin (four hard-coded SelectItems — the census's SITES list
carried only the three S161 sites); **L-2** `isoWeekNumber` credited
with the Events CW label by four stale doc sites (the view renders
`referenceWeekNumber`); **L-3** the family's three loading gates
carried no aria contract. Round-trip verdict COMPATIBLE. No
measurement-gated candidate.

**The fixes (TDD — the unit REDs 5/5 on their designed markers [the
DK1 resolve trio + the DK2 census import leg + the DK5 missing-module
suite]; the e2e leg RED-proven against the pre-fix standalone build
[the compile-blocking unit RED set aside for the pre-fix build, the
success toast never fired], GREEN post-fix):**

- **DK1 — the events mutation CB8 split (the M-1 close).** The three
  events mutations contain the refresh rejection at the seam
  (`fetchAndSet("events").catch(() => undefined)` — the DJ5 doctrine
  comment): the WRITE leg keeps rejecting honestly; a committed write +
  a failed refresh RESOLVES (the success toast + the dialog close
  proceed; the stale slice self-heals through the S16 pre-warm + the
  next mutation's refresh). The soft-toast variant REJECTED (the toast
  store lives above the lib/components layer boundary). Unit: the
  data-store pair set (+4, the CZ1 mock shape). E2e: the CB8-twin
  network-mock (the POST continues, the GET aborts, the success toast +
  the closed dialog).
- **DK2 — the REPEATS single-source + the census's fourth site (the
  L-1 close).** The SelectItems render from validation.ts's array (the
  reference-measured "No repeat" label preserved, zero visual delta);
  the census gains the events site (+2) and tsc's noUnusedLocals
  machine-forces the render to consume the import (the inline-twin
  guard).
- **DK3 — the isoWeekNumber doc reconciliation (the L-2 close).** The
  four stale sites corrected (date.ts's doc, date.test.ts's describe
  title, AGENTS.md's Events entry, SKILL.md's Events entry) —
  `referenceWeekNumber` owns the Events CW claim; `isoWeekNumber` stays
  the pinned no-caller ISO contrast (the S128 decision).
- **DK4 — the three loading gates gain `role="status"` + aria-labels
  (the L-3 close; the calculator-view precedent shape).**
- **DK5 — the expandOccurrences promotion EXECUTED (the I-1 close; the
  S161-recorded F-7 deferral).** The recurrence expansion moved
  VERBATIM to `src/lib/events.ts` (the structural param type keeps the
  seam pure — EventRow satisfies it structurally, the render call site
  unchanged) with the 10-leg unit pin set (none/daily/weekly-across-
  month-boundary/monthly + the Jan-31-skips-February semantics/
  past-start/DST-rounding/start-day-only parity/return contract/
  Date-typed startDate). The call-shape optimization DECLINED (§8).
- **DK6 — the calendar pre-warm drop (the I-2 close).** `subjects`
  left the calendar entry (the view reads exactly five collections,
  grep-verified); the view-collections pin re-tags 6 → 5 keys (the
  count-lockstep doctrine).

**Gates.** lint ✓ · tsc ✓ · unit **1648/1648** (51 files, +16 exactly
as designed: events +10, data-store +4, enum-single-source +2 — the
plan's +8 DK5 estimate was low by 2, the honest arithmetic correction
in the plan §9) · build ✓ · the remediated-tree re-confirmation:
preflight GREEN (the S9/S31 stale-cache remedy applied) · drawer GREEN
(**the 85th consecutive**) · parity **MATCH** · the 5-chunk cold cert:
chunk 1 **154/154** · chunk 2 **192/192** · chunk 3 **94/94** (+1, the
DK1 leg — the AK1c/d pair flaked once on the documented P1008
machine-load class, 94/94 clean on the immediate re-run; the pair
passes in isolation and touches nothing this cycle changed) · chunk 4
**95/95** (the calculator-theme leg flaked once on the same
machine-load class, clean on the re-run, passes in isolation) · chunk
5 **89/89** — the cert tally **624/624** = **census 2272 green** (was
2255; 1648 unit + 624 e2e).

**Evidence.** The `docs/screenshots/162-clone-*.png` frames (the
standing desktop + the mobile drawer [the 85th drawer-GREEN companion]
+ the cycle's Events surface — the dark terminal panel with the seeded
recurring event's expanded occurrences), self-verifying (ok: true; the
non-blank pixel ratios verified: 45.9% / 34.5% / 92.2% — the dark
panel's by-design floor).

**Docs.** README badge/census (2255 → 2272) + the count prose sites +
the Session-162 row; AGENTS census + the e2e map re-tag + the S162
lessons block (three lessons: the bundled write+refresh seam split at
the seam; the inline-twin enum and the import+unused-import guard
pair; the axis-named deferral as its own trigger) + the F-3 claim fix;
CLAUDE counts + the S161-missed 619 e2e map site re-anchored; PAD
v1.3.70 (the revision block); the SKILL census (all four sites) + the
F-3 claim fix + the green-state re-anchor; the vitest header re-anchor
(+16); the cert runner re-tag (623 → 624, chunk 3 93 → 94,
machine-pinned by the script-conventions leg); `docs/session_197.md`;
this entry; the plan §9 as-executed close; the `.env.example` contract
re-verified (no env-var reads changed this cycle — .env and
.env.example byte-identical at the documented dev posture).

**Next cycle.** The rotation continues — the recorded deferrals: the
family-wide CB8 port (exams/assignments/timetable/notes/flashcards/
tasks share the M-1 shape — each family gets its own rotation-axis
audit + pin set, the events pin set is the template); the files
refresh-failure toast copy harmonization (the F-8 candidate); the S160
close's ledger (the A-M3 stage-2 triggers; the update-side raw-SQL
bulk upsert; the I-4 parse posture; the M-1 LLM-side residual); the
gradetracker/studygroups/settings-CRUD and AlertDialog-confirm e2e gaps
the prior audits surfaced.

## Session 174 — the S163 cycle (Batch DL: the exams-family hardening set)

The workspace was WARM at `b025e7e` on `main` (the S162/Batch DK fix
`9a2da4d` + the operator's session_198 transcript commit; `git pull`
delivered session_198.md, docs-only, tree clean; `.env` byte-identical
to `.env.example` at the documented dev posture —
`DATABASE_URL="file:../db/custom.db"`, the repo-root `db/` verified,
bun 1.3.14 / node v24.22.2, node_modules pre-installed). Cold baseline
matched the documented S162-final state exactly: lint ✓ · tsc ✓ ·
unit 1648/1648 (51 files) · the dev-daemon preflight GREEN (booted
with the S9/S31 stale-cache remedy through the reaper-proof python
double-fork launcher — the S110 lesson applied) · the drawer check
GREEN (**the 86th consecutive** no-Tailwind-v4-mobile-nav-bug
confirmation — backdrop oklab(0 0 0 / 0.2) + blur(4px), 288px white
panel, 20 links, no footer, Escape-close superset) · the desktop
parity probe **MATCH** (all five formal checks, live reference login);
the config posture re-validated (vitest include, playwright testDir +
the e2e.db webServer, tsconfig + eslint `skills` exclusions).

The audits (Mode-C; every M/L finding re-verified by direct read): A —
the Batch DK recent-changes axis (`9a2da4d`; `108956e`/`b025e7e`
docs-only): **0C/0H/0M/0L/0I — clean** (all six DK claims confirmed at
the source anchors — the three CB8 catches at data.ts:642/646/650, the
REPEATS import + render, the four referenceWeekNumber doc
reconciliations, the three aria gates, the promoted events seam + its
10 pins, the calendar pre-warm drop; the doc census machine-verified
across all seven count sites, zero stale). B — the exams family (the
rotation's fresh axis — the S162 close's own "Next cycle" list NAMED
this axis: the family-wide CB8 port, exams FIRST in the recorded
order; dispatched to a read-only subagent against the web-application
skill's §4/§9/§12/§13/§16/§17 rubric — exams-view + the exams routes
[the delegate factory + the withUser wrappers] + the seams + the
round-trip verification): **0C/0H/1M/1L/3I** — the family coherent
(ownership in the WHERE clause by construction, Zod at both boundaries
with the sentKeysPatch PATCH shape, the BX3 datetime round-trip, the
600/15-min write budget, take:500 bounded reads with the composite
index, zero useEffect, zero space-y/x containers, EXAM_TYPES
single-sourced with the census guard); the findings: **M-1** the exams
mutations rejected on the refresh leg after a COMMITTED write — a
flaky refresh GET showed "Something went wrong." in the still-open
dialog, no success toast, the form armed: a RETRY duplicated the exam
(the CB8 letter violated — the DK1 events fix sat ELEVEN LINES BELOW
at data.ts:640-651, unfixed here; the 51-site fetchAndSet census
showed 48 unfixed sites, this cycle closes 3); **L-1** the exams
loading gate carried no aria contract (the DK4 pattern reached
events/calendar/calculator but not the fourth view); **I-1** the
topics safe-parse twin lived byte-identical twice in exams-view (the
parseNoteTags/CZ1 duplication class) + a duplicated `@/lib/date`
import pair. Round-trip verdict COMPATIBLE (the 7 examSchema keys 1:1,
no field drift). The audit's I-2 (`as` cast on form.type — no live
vector, the boundary/import/seed all enforce the vocabulary) and I-3
(per-card subjects.find micro-perf — negligible under take:500)
DECLINED at the plan §8.

**The fixes (TDD — the plan `docs/remediation-plan-session163.md`
written BEFORE any source change and validated against the codebase;
the unit REDs on their designed markers [the DL1 resolve trio ×3 RED
on the pre-fix refresh-leg rejection + the failed-write guard
green-on-arrival — 3 failed | 1 passed, exactly the designed shape;
the DL3 suite RED on the missing export — `TypeError: parseExamTopics
is not a function`, 5 legs]; the e2e leg RED-proven against the
pre-fix standalone build [the compile-blocking unit RED file set
aside, the pre-fix build, the leg run — the "Exam added." toast never
fired: element(s) not found; the file restored], GREEN post-fix):**

- **DL1 — the exams mutation CB8 split (the M-1 close; the
  family-wide port's first family).** The three exams mutations
  contain the refresh rejection at the seam
  (`fetchAndSet("exams").catch(() => undefined)` — the DK1/DJ5
  doctrine comment ported verbatim): the WRITE leg keeps rejecting
  honestly; a committed write + a failed refresh RESOLVES (the
  "Exam added."/"Exam updated."/"Exam deleted." toast + the dialog
  close proceed; the stale slice self-heals through the S16 pre-warm +
  the next mutation's own refresh). Unit: the data-store pair set
  (+4, the CZ1 mock shape). E2e: the CB8-twin network-mock (the POST
  continues, the GET aborts, the success toast + the closed dialog) in
  parity-session8 (chunk 1).
- **DL2 — the exams loading gate gains `role="status"` +
  `aria-label="Loading exams"` (the L-1 close; the DK4 precedent
  shape, rides the diff review).**
- **DL3 — the parseExamTopics promotion EXECUTED (the I-1 close).**
  The safe-parse block moved VERBATIM to `src/lib/data.ts` beside
  `parseNoteTags` (the S151/CZ1 precedent) — the helper preserves the
  TWINS' semantics exactly (every string passes, NO length guard:
  parseNoteTags' `t.length > 0` is the NOTES twins' semantics,
  deliberately different, documented in the helper's doc comment; the
  `raw || "[]"` guard is behavior-identical to the twins' catch
  path). Both view sites consume the single source; the duplicated
  `@/lib/date` import merges. Unit: the 5-leg pin set (the
  mixed-array leg keeps "also-ok" — a length-guard regression would
  fail it).

**Gates.** lint ✓ · tsc ✓ · unit **1657/1657** (51 files, +9 exactly
as designed: data-store +9) · build ✓ · the full touched spec file
70/71 (the BZ3 notebooks popover leg flaked once on the documented
P1008 machine-load class — passes in isolation in 6.9 s; the cert's
own chunk-1 run of the same spec passed clean; my diff touches nothing
in that surface) · the remediated-tree re-confirmation: preflight
GREEN (the S9/S31 stale-cache remedy applied) · drawer GREEN (**the
87th consecutive**) · parity **MATCH** · the 5-chunk cold cert: chunk
1 **155/155** (+1, the DL1 leg) · chunk 2 **192/192** · chunk 3
**94/94** · chunk 4 **95/95** · chunk 5 **89/89** — the cert tally
**625/625** = **census 2282 green** (was 2272; 1657 unit + 625 e2e).

**Evidence.** The `docs/screenshots/163-clone-*.png` frames (the
standing desktop + the mobile drawer [the 87th drawer-GREEN companion]
+ the cycle's Exams surface — the seeded cards with their topic chips,
the DL3 promoted seam's render path), self-verifying (ok: true; the
non-blank pixel ratios verified: 45.9% / 34.5% / 58.3%), captured by
`scripts/capture-s163-evidence.mjs` (the S162 precedent).

**Docs.** README badge/census (2272 → 2282) + the count prose sites +
the Session-163 row; AGENTS census + the e2e map re-tag + the S163
lessons block (three lessons: the family-port's proof port — a syntax
copy without the pair-set port is an unproven fix wearing a proven
fix's clothes; the promoted helper pins the semantics the TWINS had,
not the sibling helper's; the P1008 flake triage order — isolation →
cert → diff-touch, escalating only on a "no"); CLAUDE counts (1657 +
625); PAD v1.3.71 (the revision block); the SKILL census (both sites);
the vitest header re-anchor (+9); the cert runner re-tag (624 → 625,
chunk 1 154 → 155, machine-pinned by the script-conventions leg);
`docs/session_199.md`; this entry; the plan §9 as-executed close; the
`.env.example` contract re-verified (no env-var reads changed this
cycle — .env and .env.example byte-identical at the documented dev
posture).

**Next cycle.** The rotation continues — the recorded deferrals: the
family-wide CB8 port's REMAINING families (assignments/timetable/
notes/flashcards/tasks + the subject/taskList/notebook/deck/
studyGroup/practiceTest seams — each family gets its own
rotation-axis audit + pin set; the events and exams pin sets are the
templates); the files refresh-failure toast copy harmonization (the
F-8 candidate); the S160 close's ledger (the A-M3 stage-2 triggers;
the update-side raw-SQL bulk upsert; the I-4 parse posture; the M-1
LLM-side residual); the gradetracker/studygroups/settings-CRUD and
AlertDialog-confirm e2e gaps.

## Session 175 — the S164 cycle (Batch DM: the assignments-family hardening set)

**The recovery cycle.** The prior session's S164 was fully green
(DM1-DM4 applied, docs lockstep done, cert chunks 1/2/5 clean) when
the tool infrastructure failed and the sandbox reset BEFORE the commit
— the workspace came back empty. This cycle RE-EXECUTED the same plan
from a fresh clone at `9729ea4` (the S163/Batch DL fix `b66d4a1` +
the operator's two session-log docs commits): environment rebuilt
(bun install, the repo-root `db/` re-created + pushed + seeded, `.env`
byte-identical to `.env.example` at the documented dev posture, the
playwright chromium re-provisioned), and every RED re-derived fresh —
nothing trusted from the lost session's claims. Cold baseline: lint ✓ ·
tsc ✓ · unit **1657/1657** (51 files — the documented S163 final
state exactly). The config posture re-validated (the `skills/` folder
excluded from code checking, testing, and compilation on every axis).

**Audits (Mode-C; every H/L finding re-verified by direct read).**
A — the Batch DL recent-changes axis (`b66d4a1`): **0C/0H/0M/0L/0I —
clean** (all three DL claims confirmed at the source anchors — the
three CB8 catches, the DL2 aria gate, the DL3 promoted seam; the doc
census chain machine-verified, zero stale count sites). B — the
assignments family (the rotation's fresh axis, NAMED by the S163
close's "Next cycle" list): **0C/1H/0M/2L/1I** — the family coherent
(ownership in the WHERE clause by construction, the sentKeysPatch
PATCH shape, the BX9/CI7d/DJ5/DA1-2/CB2/CB9 point-fix heritage,
take:500, zero useEffect); the findings: **H-1** the assignments
mutations rejected on the refresh leg after a COMMITTED write (the
CB8 letter — the false save-failure armed the duplicate-creating
retry, and the slider's onValueCommit leg made it fire on the
family's most-used control); **L-1** the loading gate carried no aria
contract; **L-2** the PRIORITIES local twin beside
validation.ts's ASSIGNMENT_PRIORITIES single source (the
ALIASED-twin form the DJ3 census never guarded); **I-1** the
onClick/onSelect mix — declined at §8 (no live driver). C — the
mid-cycle discovery: the S161/DJ5 e2e leg's route glob
`**/api/assignments*` never matched the per-id PATCH (Playwright's
`*` does not cross `/`) — the leg was green by pinning the CB8
false-failure as correct behavior; DM1's split exposed it (the
committed write + contained refresh answers no toast — the leg failed
3/3), the bisect pair located the dishonesty in the TEST.

**The fixes (TDD-first; every RED on its designed marker, re-derived
this session).**
- **DM1 — the assignments mutation CB8 split (the H-1 close).** The
  three mutations contain the refresh rejection at the seam
  (`fetchAndSet("assignments").catch(() => undefined)`, the DK1/DL1
  doctrine comment re-tagged); the WRITE leg keeps rejecting honestly.
  Unit +4 (the CZ1 pair set: the resolve trio RED pre-fix — 3 failed
  exactly as designed — + the failed-write guard green-on-arrival);
  e2e +1 (the CB8-twin network-mock leg in parity-session9: the POST
  continues, the collection GET aborts, the "Assignment added." toast
  + the closed dialog — RED-proven against a rebuilt pre-fix
  standalone, failing exactly at the toast assertion).
- **DM2 — the loading gate gains `role="status"` +
  `aria-label="Loading assignments"`** (the DL2 precedent shape,
  rides the diff review).
- **DM3 — the PRIORITIES single-source alias (the L-2 close).** The
  local twin becomes `const PRIORITIES = ASSIGNMENT_PRIORITIES;` (the
  TYPES-at-:70 shape) + the import; the DJ3 census gains its FIFTH
  site — the import leg RED pre-fix, the no-local-twin leg guarding
  the future fork (unit +2).
- **DM4 — the DJ5 leg's route glob `**/api/assignments*` →
  `**/api/assignments**`** (route + finally unroute + the corrected
  comment) — count-neutral, the test-honesty fix DM1 exposed; proven
  by the bisect pair (fails 3/3 on the DM1 build under the old glob,
  GREEN under the corrected one — the PATCH genuinely aborts, the
  toast fires, zero pageerrors). The latent single-star sweep: the two
  other usages benign (CG5's handler-side pathname discrimination; the
  tasks leg's deliberate collection-GET-only hold).

**Gates.** lint ✓ · tsc ✓ · unit **1663/1663** (51 files, +6 exactly
as designed: data-store +4, enum-single-source +2) · build ✓ (the
"Ecmascript file had an error" lines verified PRE-EXISTING on the
pre-fix tree by the stash-build check — toolchain noise, not the
diff) · the full touched spec files: parity-session9 **38/38** (+1,
the DM1 leg) · resilience **42/43** (the S120/BU1 files-view
Rename-prefill leg — the documented P1008 machine-load class, passing
2.1 s cold in isolation; my diff touches nothing in the files surface)
· the 5-chunk cold cert (the as-executed tallies in the plan §9 — the
designed census 155 + 193 + 94 + 95 + 89 = **626**, chunk 2 +1 the
DM1 leg).

**Evidence.** The `docs/screenshots/164-clone-*.png` frames (the
standing desktop + the mobile drawer [the drawer-GREEN companion] +
the cycle's Assignments surface — the seeded rows with their priority
pills, the DM3 alias's render path), captured by
`scripts/capture-s164-evidence.mjs` (the S163 precedent).

**Docs.** README badge/census (2282 → 2289) + the count prose sites +
the Session-164 row; AGENTS census + the e2e map re-tag + the S164
lessons block (three lessons: a route-interception leg's glob is part
of its proof — re-derive it against the actual wire URLs when the
fix it pins changes shape; the aliased local twin is the census blind
spot — enumerate the consumed vocabularies, not the exported names;
the plan-first doctrine is also the disaster-recovery doctrine — an
unpushed green is worth nothing); CLAUDE counts (1663 + 626); PAD
v1.3.72 (the revision block); the SKILL census (all sites); the
vitest header re-anchor (+6); the cert runner re-tag (both scripts,
625 → 626, chunk 2 192 → 193, machine-pinned by the
script-conventions leg); `docs/session_201.md`; this entry; the plan
§9 as-executed close; the `.env.example` contract re-verified (no
env-var reads changed this cycle — .env and .env.example
byte-identical at the documented dev posture).

**Next cycle.** The rotation continues — the recorded deferrals: the
family-wide CB8 port's REMAINING families (timetable/notes/flashcards/
tasks + the subject/taskList/notebook/deck/studyGroup/practiceTest
seams — each family gets its own rotation-axis audit + pin set; the
events/exams/assignments pin sets are the templates); the files
refresh-failure toast copy harmonization (the F-8 candidate); the
S160 close's ledger (the A-M3 stage-2 triggers; the update-side raw-SQL
bulk upsert; the I-4 parse posture; the M-1 LLM-side residual); the
gradetracker/studygroups/settings-CRUD and AlertDialog-confirm e2e
gaps.

## Session 176 — the S165 cycle (Batch DN: the timetable-family hardening set)

**The warm-workspace cycle.** The prior session's S164 was pushed and
remote-verified (`e3fc2f8`), the operator added the session_202
transcript (`7926ff8`), and this cycle pulled to it with the
environment INTACT (node_modules, the repo-root `db/`, `.env`
byte-identical to `.env.example` at the documented dev posture, the
dev daemon alive on :3000). Cold baseline: lint ✓ · tsc ✓ · unit
**1663/1663** (the documented S164 final state exactly) ·
preflight GREEN · the drawer check GREEN (the 90th consecutive
no-Tailwind-v4-mobile-nav-bug confirmation) · the desktop parity
probe MATCH (live reference login). The config posture re-validated
(the `skills/` folder excluded from code checking, testing, and
compilation on every axis).

**Audits (Mode-C; every H/L finding re-verified by direct read).**
A — the Batch DM recent-changes axis (`e3fc2f8` + the docs-only
`7926ff8`): **0C/0H/0M/0L/0I — clean** (all four DM claims confirmed
at the source anchors — the three CB8 catches, the DM2 aria gate,
the DM3 PRIORITIES alias, the DM4 corrected glob; the test anchors
verified; the doc census chain machine-verified, zero stale count
sites; the commit diff surgical). B — the timetable family (the
rotation's fresh axis, FIRST in the S164 close's recorded order):
**0C/1H/0M/2L/0I** — the family coherent (the delegate factory's
ownership-in-the-WHERE-clause, the BW7/BX1 ordering guard, the
owned-FK map + the transactional merge guard, take:500, zero
useEffect, the BX1/DJ2/DA2/BT9/BU9/CM6/CO4c/AE12 heritage); the
findings: **H-1** the timetable mutations rejected on the refresh leg
after a COMMITTED write — a flaky refresh GET showed "Something went
wrong." in the still-open dialog, no success toast, the form armed: a
RETRY duplicated the class (the CB8 letter, the fourth family of the
recorded port); **L-1** the loading gate carried no aria contract AND
the mobile day-detail gate was provably dead code (the
calendar-pattern copy landed inside the has-classes ternary branch —
`loading && classes.length === 0` could never hold where the
accordion renders, while its S130/CE3 comment claimed a live
protection); **L-2** the WEEK_TYPES inline twin (the view hard-coded
the ALL/A/B triple in the filter Select + the dialog Select + the
state type + the label-map keys beside validation.ts:123's
S133/CH2-promoted single source — the DM3 census-blind-spot class).

**Fixed TDD-first (every RED on its designed marker).** **DN1** the
timetable mutation CB8 split — the three mutations contain the
refresh rejection at the seam (`fetchAndSet("timetable").catch(() =>
undefined)`, the DK1/DL1/DM1 doctrine comment re-tagged for the
fourth family; the WRITE leg keeps rejecting honestly; unit +4 the
CZ1 pair set [the resolve trio RED pre-fix exactly + the failed-write
guard green-on-arrival]; e2e +1 the CB8-twin network-mock leg in
parity-session9 [the POST continues, the collection GET aborts — the
glob `**/api/timetable` ends at the collection URL per the DM4
lesson re-derived in the leg's comment — the "Class added." toast +
the closed dialog], RED-proven against the pre-fix standalone build
failing exactly at the toast assertion). **DN2** the loading gate
gains `role="status"` + `aria-label="Loading timetable"` + the dead
day-detail gate REMOVED with the honest ownership comment
(behavior-preserving by construction). **DN3** the WEEK_TYPES
single-source port — the DK2 map-over-the-import form + the derived
`type WeekType` alias + the exhaustively-typed `Record<WeekType,
string>` label map (a future vocabulary value fails typecheck until
labeled); both Selects render from the map; the DJ3 census gains its
SIXTH site (the import leg RED pre-fix, the no-local-twin leg
green-on-arrival; unit +2).

**The mid-edit regression the gates caught.** The DN3 import edit
accidentally rewrote `@/lib/date` as `@lib/date` — one character, the
line LOOKED right, and tsc failed within the minute (TS2307 + the
downstream TS7006 pair on the setWeekStart callbacks whose contextual
type died with the module). Fixed immediately; the lesson recorded in
the AGENTS S165 block: the single import line is the highest-risk
edit surface in a view — diff the hunk character by character and
keep tsc between edit batches.

**Gates.** lint ✓ · tsc ✓ · unit **1669/1669** (51 files, +6 exactly
as designed: data-store +4, enum-single-source +2) · build ✓ · the
full touched spec file: parity-session9 **39/39** (+1, the DN1 leg) ·
the 5-chunk cold cert: chunk 1 **155/155** · chunk 2 **194/194**
(+1; one socket-timeout signature logged, zero failures) · chunk 3
**94/94 on the cold re-run** (the first run's single AI6 files-upload
leg — the documented P1008 machine-load class: a diff-untouched
surface, 1.2 s clean in isolation, the full chunk clean cold; the
DM4-corrected DJ5 leg GREEN at 2.5 s throughout) · chunk 4 **95/95**
· chunk 5 **89/89** — the cert tally **627/627** = **census 2296
green** (the e2e census 626 → 627) · the drawer check GREEN on the
remediated tree (**the 91st consecutive** no-Tailwind-v4-mobile-nav
bug confirmation) · the desktop parity probe **MATCH** (all five
formal checks, live reference login).

**Evidence.** The `docs/screenshots/165-clone-*.png` frames (the
standing desktop + the mobile drawer [the drawer-GREEN companion] +
the cycle's Timetable surface — the seeded week grid with its class
cells + the week filter, the DN3 single-source render path), captured
by `scripts/capture-s165-evidence.mjs` (the S164 precedent),
self-verifying (ok: true, md5s distinct) + the non-blank pixel-ratio
verification (14.96% / 33.56% / 8.65%).

**Docs.** README badge/census (2289 → 2296) + the count prose sites +
the Session-165 row; AGENTS census + the e2e map re-tag + the S165
lessons block (two lessons: the dead-branch-with-a-badge lesson — a
guard citing a precedent pattern must have the structural
precondition that makes the pattern live; the import-line lesson);
CLAUDE counts (1669 + 627); PAD v1.3.73 (the revision block); the
SKILL census (all four sites); the vitest header re-anchor (+6); the
cert runner re-tag (both scripts, 626 → 627, chunk 2 193 → 194,
machine-pinned by the script-conventions tripwire — the DA6/CQ6
count-claims gates re-verified GREEN after the re-anchor: 136/136);
`docs/session_203.md`; this entry; the plan §9 as-executed close; the
`.env.example` contract re-verified (no env-var reads changed this
cycle — .env and .env.example byte-identical at the documented dev
posture).

**Next cycle.** The rotation continues — the recorded deferrals: the
family-wide CB8 port's REMAINING families (notes/flashcards/tasks +
the subject/taskList/notebook/deck/studyGroup/practiceTest seams —
each family gets its own rotation-axis audit + pin set; the
events/exams/assignments/timetable pin sets are the templates); the
files refresh-failure toast copy harmonization (the F-8 candidate);
the S160 close's ledger (the A-M3 stage-2 triggers; the update-side
raw-SQL bulk upsert; the I-4 parse posture; the M-1 LLM-side
residual); the gradetracker/studygroups/settings-CRUD and
AlertDialog-confirm e2e gaps.

## Session 177 — the S166 cycle (Batch DP: the notes-family hardening set)

**The cold-workspace cycle.** The prior session's S165 was pushed and
remote-verified (`2f3425b` + the plan-tick `fd629eb`), the operator
added the session_204 transcript (`9d51ea8`), and this cycle CLONED
FRESH at that SHA — the environment was rebuilt from scratch (bun
install, the repo-root `db/` recreated by push+seed, `.env` copied
from `.env.example` byte-identical at the documented dev posture, the
Playwright chromium cache reinstalled). Cold baseline: lint ✓ · tsc ✓
· unit **1669/1669** (the documented S165 final state exactly) ·
preflight GREEN · the drawer check GREEN (the 92nd consecutive
no-Tailwind-v4-mobile-nav-bug confirmation) · the desktop parity
probe MATCH (live reference login). The config posture re-validated
(the `skills/` folder excluded from code checking, testing, and
compilation on every axis).

**Audits (Mode-C; every H/L finding re-verified by direct read).**
A — the Batch DN recent-changes axis (`2f3425b` + the docs-only
`fd629eb`/`9d51ea8`): **0C/0H/0M/0L/0I — clean** (all three DN claims
confirmed at the source anchors — the three CB8 catches, the DN2 aria
gate + the dead day-detail gate removed, the DN3 WEEK_TYPES port; the
test anchors verified; the doc census chain machine-verified, zero
stale count sites; the commit diff surgical). B — the notes family
(the rotation's fresh axis, SECOND in the S165 close's recorded
order): **0C/1H/0M/2L/0I** — the family coherent (the delegate
factory's ownership-in-the-WHERE-clause with ownedFks + the CO1
sanitize writeTransform, Zod at both boundaries, take:500, the SetNull
notebook-delete FK matching the honest "Its notes are kept." copy,
zero set-state-in-effect, the
AD/AE/AF/AG/AH/AI/BT10/BZ3/BZ14/BW3/CE9/CI7b/CO1/CQ3/CR3/CY3/CZ1/DA1/
DA2/DJ1 heritage); the findings: **H-1** the SEVEN notes-family
mutations rejected on the refresh leg after a COMMITTED write — the
notebooks trio + the notes trio + the setNoteTags chain all rode the
uncaught `fetchAndSet`, so a flaky refresh GET showed "Something went
wrong." in the still-open dialog with the form armed: a RETRY
duplicated the note/notebook (the CB8 letter, the FIFTH family of the
recorded port); **L-1** both loading gates carried no aria contract
(the list-pane gate + the main-pane gate, both live at list level —
the DM2/DL2/DK4/DN2 precedent family); **L-2** the notes search
matched the RAW HTML source while the row preview rendered the
stripped text — a tag-name query ("strong") or the single letter "p"
(inside every Quill `<p>` wrapper) false-matched every formatted note.
**The reference's own search semantics were measured THIS cycle for
the first time** (the residue-zero probe: a probe note created via the
reference's own API — the account had ZERO notes — searched, deleted,
zero residue): the reference's search is TITLE-ONLY, so the clone's
title+content search is the kept SUPERSET and the fix is
superset-internal consistency.

**Fixed TDD-first (every RED on its designed marker).** **DP1** the
notes-family mutation CB8 split — the seven refresh legs contained at
the seam (`fetchAndSet(...).catch(() => undefined)`, the
DK1/DL1/DM1/DN1 doctrine comment re-tagged for the fifth family; the
deleteNotebook DOUBLE refresh catches both legs; the setNoteTags
chain's refresh caught while its write leg still rejects through
`await chained`; unit +8 the pair set [the resolve set RED pre-fix ×7
+ the failed-write guard green-on-arrival]; e2e +1 the CB8-twin
network-mock leg in parity-session9 [the POST continues, the
collection GET aborts — the glob `**/api/notes` ends at the collection
URL per the DM4/DN1 lesson — the CLOSED dialog + never the false
"Something went wrong."], RED-proven against the pre-fix standalone
failing exactly at the dialog assertion: Expected 0 / Received 1).
**DP2** both loading gates gain `role="status"` with differentiated
labels ("Loading notes" list pane / "Loading note editor" main pane —
the calendar two-gate precedent, both gates simultaneously renderable
during the initial in-flight window). **DP3** the search matches the
RENDERED text (the `htmlToText` extraction in text.ts — the uncapped
reduction, `stripHtmlPreview` delegating unchanged; the view's content
leg matches what the preview shows; unit +2 the seam pins; e2e +1 in
parity-session7 — the API-planted `<strong>`-formatted probe note
rides the real write door [the CO1 allowlist admits it], the tag-name
query NEVER matches [RED pre-fix: Expected 0 / Received 1 — the
raw-HTML search matched], the visible word always does, zero residue
via the finally DELETE).

**A mid-cycle tripwire re-anchor rode the lockstep.** The hue-tokens
consumer census pins the notes-view selected-row border at line 761 —
the DP2/DP3 comments added lines above the site, the census tripped AS
DESIGNED (the S161/DJ1 precedent: "tripped as designed" is the
census's own recorded re-anchor note), and the anchors re-anchored
761 → 784 with the S166 tag.

**Gates.** lint ✓ · tsc ✓ · unit **1679/1679** (51 files, +10 exactly
as designed: data-store +8, text +2) · build ✓ · the full touched
spec files: parity-session9 **40/40** (+1, the DP1 leg) ·
parity-session7 **60/60** (+1, the DP3 leg) · the 5-chunk cold cert:
chunk 1 **155/155** · chunk 2 **196/196** (+2; one socket-timeout
signature logged, zero failures) · chunk 3 **94/94 on the cold
re-run** (the first run's 3 failures — the documented P1008
machine-load class: diff-untouched surfaces [parity-session5/
resilience/s16-perf, zero notes/text overlap; the named leg the AI6
files-upload class], the full chunk clean cold) · chunk 4 **95/95** ·
chunk 5 **89/89** — the cert tally **629/629** = **census 2308
green** (the e2e census 627 → 629) · the drawer check GREEN on the
remediated tree (**the 93rd consecutive** no-Tailwind-v4-mobile-nav
bug confirmation) · the desktop parity probe **MATCH** (all five
formal checks, live reference login).

**Evidence.** The `docs/screenshots/166-clone-*.png` frames (the
standing desktop + the mobile drawer [the 93rd drawer-GREEN
companion] + the cycle's Notes surface — the seeded note rows + the
search input + the notebook/tag filters, the DP3 rendered-text search
surface), captured by `scripts/capture-s166-evidence.mjs` (the S165
precedent), self-verifying (ok: true, md5s distinct) + the non-blank
pixel-ratio verification (45.93% / 34.50% / 77.40%).

**Docs.** README badge/census (2296 → 2308) + the count prose sites +
the Session-166 row; AGENTS census + the e2e map re-tag + the S166
lessons block (two lessons: measure the reference BEFORE adjudicating
a superset surface — the fix direction depends on which side owns the
divergence, and the probe that answers it must clean up after itself
on the reference too; a view-level behavior with no unit seam still
gets a REAL red through the API door — plant the discriminating
fixture, assert, delete); CLAUDE counts (1679 + 629); PAD v1.3.74 (the
revision block); the SKILL census (all four sites); the vitest header
re-anchor (+10); the cert runner re-tag (both scripts, 627 → 629,
chunk 2 194 → 196, machine-pinned by the script-conventions tripwire —
the DA6/CQ6 count-claims gates re-verified GREEN after the re-anchor:
136/136); `docs/session_205.md`; this entry; the plan §9 as-executed
close; the `.env.example` contract re-verified (no env-var reads
changed this cycle — .env and .env.example byte-identical at the
documented dev posture).

**Next cycle.** The rotation continues — the recorded deferrals: the
family-wide CB8 port's REMAINING families (flashcards/tasks + the
subject/taskList/deck/studyGroup/practiceTest/grades/focusSessions/
holidays seams — each family gets its own rotation-axis audit + pin
set; the events/exams/assignments/timetable/notes pin sets are the
templates); the unannounced loading-gate families (tasks/focustimer/
gradetracker/flashcards/dashboard/myday/studygroups/practicetests/
analytics/settings — the machine count from this cycle's gate census);
the files refresh-failure toast copy harmonization (the F-8 candidate);
the S160 close's ledger (the A-M3 stage-2 triggers; the update-side
raw-SQL bulk upsert; the I-4 parse posture; the M-1 LLM-side residual);
the gradetracker/studygroups/settings-CRUD and AlertDialog-confirm e2e
gaps.

## Session 178 — the S167 cycle (Batch DQ: the flashcards-family hardening set)

**The warm-workspace cycle.** The prior session's S166 was pushed and
remote-verified (`5daa566` + the plan-tick `391abdb`), and this cycle
found the workspace INTACT — `git pull` a no-op at `391abdb`, the
environment verified in place (node_modules present, the repo-root
`db/` carrying custom.db + e2e.db, `.env` byte-identical to
`.env.example` at the documented dev posture, the dev daemon
answering on :3000). Cold baseline: lint ✓ · tsc ✓ · unit
**1679/1679** (51 files — the documented S166 final state exactly) ·
preflight GREEN · the drawer check GREEN (the 94th consecutive
no-Tailwind-v4-mobile-nav-bug confirmation) · the desktop parity
probe MATCH (live reference login — through the s142 FORMAL probe;
the s141 one-shot tripped its own documented inner-nav artifact
[258px inside the 260px shell] exactly as the s142 header records,
re-derived this cycle, zero code regression). The config posture
re-validated (the `skills/` folder excluded from code checking,
testing, and compilation on every axis).

**Audits (Mode-C; every H/L finding re-verified by direct read).**
A — the Batch DP recent-changes axis (`5daa566` + the docs-only
`391abdb`): **0C/0H/0M/0L/0I — clean** (all three DP claims confirmed
at the source anchors — the seven contained catches at
data.ts:748-811, the DP2 aria gates at notes-view :756/:832, the DP3
htmlToText extraction + the rendered-text search; the doc census
chain machine-verified, zero stale count sites; the commit diff
surgical) + one hygiene catch: an UNTRACKED scratch `cert-s166.log`
at the repo root (the prior cycle's background-cert console log — the
tracked artifacts are the `scripts/launch-cert-s*.py` runners),
removed before this cycle's commit. B — the flashcards family (the
rotation's fresh axis, NEXT in the S165 close's recorded order
"notes/flashcards/tasks"; the family's point-fixes rode S77/AD9+
AD10+AD11, S78/AE6, S79/AF1+AF7, S80/AG8+AG9, S81/AH6, S88/AO4+
S89/AP1, S119/BT12, S120/BU17b+BU17c, S123/BX8, S125/BZ1+BZ12,
S126/CA6, S127/CB8 [the generate-flow twin, already hardened],
S130/CE3, S137/CL3, S138/CM5, S139/CN3, S140/CO4g+CO4h, S152/DA1+
DA2 — but the family was never deep-swept as an axis): **0C/1H/0M/
1L/0I** — the family coherent (the delegate factory's deck-ownership
scoping + the card delegate's create-time deck check with the honest
"That deck does not exist." rejection, Zod at both boundaries with
the BZ12 optional-deckId PATCH contract, the CA5 newest-500 deck
window + the CL3 take:5000 deck-completeness card window with the
CN3 [createdAt, id] index, the Cascade deck-delete FK matching the
honest "Deck deleted — its cards went with it." copy, ZERO useEffect
in the view, the 18-aria-label surface, the name-only plain-text
deck search [no DP3-class raw-HTML divergence possible by
construction]); the findings: **H-1** the SIX flashcards-family
mutations rejected on the refresh leg after a COMMITTED write — the
deck trio and the card trio all rode the uncaught `fetchAndSet`, the
deleteFlashcardDeck double refresh included (a flaky refresh GET
showed "Something went wrong." in the still-open dialog with the form
armed: a RETRY re-POSTed and DUPLICATED the deck/card — the CB8
letter, the SIXTH family of the recorded port; the delete catches
toasted "Delete failed." after the delete — or the whole cascade —
already committed); **L-1** both loading gates carried no aria
contract (the deck-list pane gate + the deck-detail pane gate, both
live at list level — the DM2/DL2/DK4/DN2/DP2 precedent family; the
S166 gate census counted flashcards ×2 in the unannounced remainder).

**The remediation (TDD-first; the plan
docs/remediation-plan-session167.md written BEFORE any source
change).** **DQ1** the flashcards-family mutation CB8 split (the H-1
close): the unit pair set RED exactly as designed (the resolve set
RED ×6 — the deck trio + the card trio — + the failed-write guard
green-on-arrival, the pair `6 failed | 1 passed`); the e2e leg RED
against the pre-fix standalone build (failing exactly at the designed
marker — the "Deck created." toast never fired while the POST 201 was
witnessed, the dialog stayed open with the false "Something went
wrong."); GREEN = the six contained catches at the seam
(data.ts:833-860, the doctrine comment re-tagged S167/DQ1, the sixth
family — the deleteFlashcardDeck double refresh catches BOTH legs)
with the write legs still rejecting honestly. **DQ2** the two loading
gates gain the aria contract (the L-1 close): `role="status"` +
`aria-label="Loading decks"` on the deck-list pane gate +
`role="status"` + `aria-label="Loading deck details"` on the
deck-detail pane gate (differentiated labels — the calendar/notes
two-gate precedent; both gates render simultaneously during the
initial in-flight window). No hue-tokens census re-anchor: the
flashcards pinned site (:437, the study-card face border) sits ABOVE
both comment additions.

**Gates.** lint ✓ · tsc ✓ · unit **1686/1686** (51 files, +7 exactly
as designed: data-store +7) · build ✓ · the full touched spec file:
parity-session8 **71/72 on the first full-file run, 72/72 verified**
(the one first-run failure — the S125/BZ3 notebook-popover leg, a
diff-untouched notes-family surface — passed in isolation per the
documented P1008 machine-load triage: identify the failed leg →
isolated re-run GREEN in 6.9 s; the cert's own cold chunk 1 then ran
the file clean) · the 5-chunk cold cert: chunk 1 **156/156** (+1, the DQ1 leg) · chunk 2 **196/196** · chunk 3 **94/94** cold · chunk 4 **95/95 on the cold re-run** (the first run's 1 failure — the documented P1008 machine-load class: a diff-untouched accessibility surface [the E · Lighthouse red-700 contrast leg], the isolated re-run green in 1.9 s, the full chunk clean cold) · chunk 5 **89/89** — the cert tally **630/630** = **census 2316 green** (the e2e census 629 → 630) · the drawer check GREEN on the remediated tree (**the 95th
consecutive** no-Tailwind-v4-mobile-nav-bug confirmation) · the
desktop parity probe **MATCH** (all five formal checks, live
reference login).

**Evidence.** The `docs/screenshots/167-clone-*.png` frames (the
standing desktop + the mobile drawer [the 95th drawer-GREEN
companion] + the cycle's Flashcards surface — the seeded deck rows +
the search input + the New Deck button + the deck-detail card grid,
the DQ1/DQ2 surfaces), captured by
`scripts/capture-s167-evidence.mjs` (the S166 precedent),
self-verifying (ok: true, md5s distinct) + the not-pure-white
pixel-ratio verification (45.93% / 34.50% / 72.94% — the desktop and
drawer frames byte-for-byte the same ratios as the S166 pair, the
unchanged surfaces).

**Docs.** README badge/census (2308 → 2316) + the count prose sites +
the Session-167 row; AGENTS census + the e2e map re-tag + the S167
lessons block (two lessons: a stale one-shot probe's DIVERGENCE
verdict is a hypothesis — re-derive the documented artifact before
investigating a regression, the s141/s142 lineage; a
background-launched cert's console log is scratch — sweep the root for
it before the commit, the tracked artifact is the launcher script);
CLAUDE counts (1686 + 630); PAD v1.3.75 (the revision block); the
SKILL census (all four sites); the vitest header re-anchor (+7); the
cert runner re-tag (both scripts, 629 → 630, chunk 1 155 → 156,
machine-pinned by the script-conventions tripwire);
`docs/session_206.md`; this entry; the plan §8 as-executed close; the
`.env.example` contract re-verified (no env-var reads changed this
cycle — .env and .env.example byte-identical at the documented dev
posture).

**Next cycle.** The rotation continues — the recorded deferrals: the
family-wide CB8 port's REMAINING families (tasks + the
subject/taskList/deck/studyGroup/practiceTest/grades/focusSessions/
holidays seams — each family gets its own rotation-axis audit + pin
set; the events/exams/assignments/timetable/notes/flashcards pin sets
are the templates; tasks is NEXT in the S165 close's order); the
unannounced loading-gate families (tasks/focustimer/gradetracker/
dashboard/myday/studygroups/practicetests/analytics/settings — the
machine count from the S166 gate census minus the flashcards ×2 this
cycle closes); the files refresh-failure toast copy harmonization (the
F-8 candidate); the S160 close's ledger (the A-M3 stage-2 triggers;
the update-side raw-SQL bulk upsert; the I-4 parse posture; the M-1
LLM-side residual); the gradetracker/studygroups/settings-CRUD and
AlertDialog-confirm e2e gaps.

## Session 179 — the S168 cycle (Batch DR: the tasks-family hardening set)

**Workspace.** COLD — a fresh `git clone` at `848c0bf` on `main` (the
S167/Batch DQ fix `8d25d9a` pushed + remote-verified + the plan-tick
`bdf0352` + the operator's session_207 transcript `848c0bf`). The
environment REBUILT from scratch: `bun install` (510 packages), the
repo-root `db/` recreated by `db:push` + `db:seed`, `.env` copied from
`.env.example` (byte-identical at the documented dev posture
`DATABASE_URL="file:../db/custom.db"`), the standalone build compiled,
the Playwright chromium v1243 cache re-provisioned (the machine cache
carried only 1200 — the S103/S166 provisioning doctrine re-derived:
the preflight's browserType.launch failure names the missing revision).

**Cold baseline.** lint ✓ · tsc ✓ · unit **1686/1686** (51 files — the
documented S167 final state exactly) · preflight GREEN · **the drawer
check GREEN (the 96th consecutive** no-Tailwind-v4-mobile-nav-bug
confirmation) · the desktop parity probe **MATCH** (all five formal
checks, live reference login — the s142 formal probe).

**Audits.** A — the Batch DQ recent-changes axis (`8d25d9a` +
`bdf0352`/`848c0bf` docs-only): **0C/0H/0M/0L/0I — clean** (all three
DQ claims verified at the source anchors — the six contained catches at
data.ts:813-860, the DQ2 aria gates at flashcards-view :521/:676, the
DQ1 pair set + e2e leg; the doc census chain machine-verified at
1686+630=2316; the root scratch sweep clean — the S167 lesson held).
B — the tasks family (the rotation's fresh axis, the LAST of the six
view-mutation families the S165 close's order named): **0C/1H/0M/1L/0I**
— the family coherent (the taskDelegate owned-FK scoping + the BV7
actionable-404 guards, Zod at both boundaries, the CB16/CX1 per-id
toggle chains with the CC5 eviction, the CI4 quick-add guard, the CH8
blank-title guard, the instant-delete parity posture with MyDay's
documented confirm superset, the measured AC8 pill form + the
AF2/AG5/AG7 band shapes); the findings: **H-1** the SIX tasks-family
mutations rejected on the refresh leg after a COMMITTED write — the
create/update/delete trio + the three chained toggles (the refreshes
sit INSIDE the closures, so a flaky refresh rejected `await chained`;
the TaskDialog catch toasted "Could not save the task." with the form
armed — the retry duplicated the task; the row-action catches toasted
"Could not update/delete the task." on committed rows — the same seam
serves tasks/myday/dashboard/calendar, the CB8 letter's SEVENTH
family); **L-1** the tasks loading gate carried no aria contract (tasks
×1 in the S166 gate census — the DM2/DL2/DK4/DN2/DP2/DQ2 precedent).

**Fixes (TDD-first, every RED on its designed marker):**

- **DR1 (H-1)** — the tasks-family mutation CB8 split: the six refresh
  legs contained at the seam (`fetchAndSet("tasks").catch(() =>
  undefined)` — the three plain mutations + the three in-closure toggle
  refreshes, each caught so a flaky refresh neither rejects `await
  chained` nor poisons the CB16/CX1 chains), the doctrine comment
  re-tagged S168/DR1 (the seventh family). Unit +7 (the pair set: the
  resolve set RED pre-fix ×6 — the toggle legs seeding the store rows
  first, fresh unique ids, no chain-map residue — + the
  failed-write-still-rejects guard green-on-arrival; the pair `6
  failed | 1 passed`). E2e +1 (the CB8 leg in tasks.spec: the POST
  continues, the collection GET aborts [`**/api/tasks` ends at the
  collection URL — the per-id URLs pass unrouted, the DM4 lesson
  re-derived], the "Task created" success toast + the CLOSED dialog,
  never the false "Could not save the task."; RED-proven against the
  pre-fix standalone failing exactly at the toast assertion; zero
  residue via the finally DELETE).
- **DR2 (L-1)** — the tasks loading gate gains `role="status"` +
  `aria-label="Loading tasks"` (the precedent family's shape; rides
  the diff review). No hue-tokens re-anchor (the tasks-view pinned
  sites :115 sit above the gate).

**Gates.** lint ✓ · tsc ✓ · unit **1693/1693** (51 files, +7 exactly
as designed: data-store +7) · build ✓ · the full touched spec file:
tasks.spec **13/13 first run** (the 12 prior legs + the DR1 leg) · the
5-chunk cold cert: chunk 1 **156/156** · chunk 2 **197/197** (+1, the
DR1 leg; one socket-timeout signature logged, zero failures) · chunk 3
**94/94** cold · chunk 4 **95/95** cold · chunk 5 **89/89** — every
chunk FIRST-PASS, zero triage needed — the cert tally **631/631** =
**census 2324 green** (the e2e census 630 → 631) · the drawer check
GREEN on the remediated tree (**the 97th consecutive**) · the desktop
parity probe **MATCH** (all five formal checks, live reference login).

**Evidence.** The `docs/screenshots/168-clone-*.png` frames (the
standing desktop + the mobile drawer [the 97th drawer-GREEN companion]
+ the cycle's Tasks surface — the seeded task rows + the
All Tasks/Important/My Lists aside + the search input + the Add Task
button, the DR1/DR2 surfaces), captured by
`scripts/capture-s168-evidence.mjs` (the S167 precedent),
self-verifying (ok: true; md5s distinct) + the not-pure-white
pixel-ratio verification (45.87% desktop [the live-clock surface, the
S166/S167 pair measured 45.93% — the sub-0.1pp delta is the header
clock chip] / 34.50% drawer [byte-for-byte the S166/S167 ratio, the
unchanged static surface] / 47.84% tasks [the seeded content]). The
capture script's first run tripped its own settled-anchor check — the
aside's `uppercase` class is visual-only, textContent carries "My
Lists" title-case; the anchor corrected, the frame captured clean.

**Docs.** README badge/census (2316 → 2324) + the count prose sites +
the Session-168 row; AGENTS census + the e2e map re-tag + the S168
lessons block (two lessons: grep the prior cycle's re-tag block before
inserting yours — the cert script's block placement drifted across
cycles and a head-assumed insert corrupted the merge, caught by the
diff read-back; a fresh-clone cycle re-derives the chromium build
before the standing gates — the preflight's browserType.launch failure
is provisioning, not regression); CLAUDE counts (1693 + 631); PAD
v1.3.76 (the revision block); the SKILL census (all four sites); the
vitest header re-anchor (+7); the cert runner re-tag (both scripts,
630 → 631, chunk 2 196 → 197, machine-pinned by the
script-conventions tripwire — the CQ6/DA6 count-claims gates verified
GREEN after the re-anchor: 136/136); `docs/session_208.md`; this
entry; the plan §8 as-executed close; the `.env.example` contract
re-verified (no env-var reads changed this cycle — .env and
.env.example byte-identical at the documented dev posture).

**Next cycle.** The six view-mutation families the S165 close named
are ALL ported (events S162 / exams S163 / assignments S164 /
timetable S165 / notes S166 / flashcards S167 / tasks S168). The
rotation continues into the remaining CB8 seams (the
subject/taskList/deck/studyGroup/practiceTest/grades/focusSessions/
holidays families); the unannounced loading-gate families
(focustimer/gradetracker/dashboard/myday/studygroups/practicetests/
analytics/settings); the files refresh-failure toast copy
harmonization (the F-8 candidate); the S160 close's ledger (the A-M3
stage-2 triggers; the update-side raw-SQL bulk upsert; the I-4 parse
posture; the M-1 LLM-side residual); the
gradetracker/studygroups/settings-CRUD and AlertDialog-confirm e2e
gaps.

## Session 180 — the S169 cycle (Batch DS: the subjects-family hardening set)

**Workspace.** WARM — `git pull` fast-forwarded `c828182` → `cc936fc`
on `main` (the S168/Batch DR fix `071a084` pushed + remote-verified +
the plan-tick `c828182` + the operator's session_207/session_209
transcript commits `848c0bf`/`cc936fc`; the only delta the session_209
raw transcript, docs-only). The environment stood intact from the S168
session: node_modules, the repo-root `db/` with custom.db (seeded),
`.env` byte-identical to `.env.example` (diff clean) at the documented
dev posture `DATABASE_URL="file:../db/custom.db"`, and the post-S168
standalone build verified fresh against every touched-family source
mtime (data.ts 02:32 / tasks-view 02:32 / settings-view 02:16, all
pre-build; the static chunks carry the DR2 "Loading tasks" marker) —
the TRUSTED pre-fix binary for the e2e RED proof without a rebuild.

**Cold baseline.** lint ✓ · tsc ✓ · unit **1693/1693** (51 files — the
documented S168 final state exactly) · preflight GREEN · **the drawer
check GREEN (the 98th consecutive** no-Tailwind-v4-mobile-nav-bug
confirmation) · the desktop parity probe **MATCH** (all five formal
checks, live reference login — the s142 formal probe).

**Audits.** A — the Batch DR recent-changes axis (`071a084` +
`c828182`/`848c0bf`/`cc936fc` docs-only): **0C/0H/0M/0L/0I — clean**
(all three DR claims verified at the source anchors — the six contained
catches + the S168/DR1 doctrine comment, the DR2 aria gate at
tasks-view :706-709, the DR1 pair set + e2e leg; the doc census chain
machine-verified at 1693+631=2324; the root scratch sweep clean). B —
the subjects family (the rotation's fresh axis, the FIRST of the eight
remaining CB8 seams the S168 close's ledger names): **0C/1H/0M/1L/0I**
— the family coherent (the subjectDelegate where-scoping [subjects are
the SetNull FK TARGET, not a carrier], Zod at both boundaries
[boundedTitle + hexColor with the violet default], the remount-via-key
dialog contract with the saving busy-guard + the blank-name guards,
the labeled-controls a11y surface, the AlertDialog delete-confirm with
the SetNull-consequences copy); the findings: **H-1** the THREE
subjects mutations rejected on the refresh leg after a COMMITTED write
— createSubject/updateSubject the single-collection fetchAndSet,
deleteSubject the ELEVEN-collection SUBJECT_TOUCHED Promise.all (the
SetNull FK reconciliation set, the WIDEST refresh blast radius in the
codebase: ANY one failed GET among the eleven rejected the whole
delete on a row the server deleted; the SubjectDialog catch's "Could
not save the subject." with the form armed — the retry duplicated the
subject; the AlertDialogAction catch's false "Could not delete the
subject." — the CB8 letter's EIGHTH family); **L-1** the SubjectsTab
loading gate carried no aria contract (settings ×1 in the S166 gate
census's unannounced remainder; the HolidaysTab twin stays the
holidays family's ledger).

**Fixes (TDD-first, every RED on its designed marker):**

- **DS1 (H-1)** — the subjects-family mutation CB8 split: the three
  refresh legs contained at the seam (the create/update pair +
  ONE catch on deleteSubject's whole Promise.all — the
  multi-collection refresh is one failure domain; a flaky refresh GET
  among the eleven no longer rejects the committed delete), the
  doctrine comment re-tagged S169/DS1 (the eighth family, the first of
  the eight remaining seams). Unit +4 (the pair set: the resolve set
  RED pre-fix ×3 — the delete leg rejecting ONE GET among the eleven,
  `Promise.all`'s first-rejection semantics being exactly the
  flaky-refresh condition — + the failed-write-still-rejects guard
  green-on-arrival; the pair `3 failed | 1 passed`). E2e +1 (the CB8
  leg in resilience: the POST continues, the collection GET aborts
  [`**/api/subjects` ends at the collection URL — the per-id URLs pass
  unrouted, the DM4 lesson re-derived], the "Subject created" success
  toast + the CLOSED dialog, never the false "Could not save the
  subject."; RED-proven against the pre-fix standalone failing exactly
  at the toast assertion; zero residue via the finally DELETE; the leg
  is also the FIRST e2e pin to drive the Settings Subjects CRUD
  surface — the recorded settings-CRUD e2e gap partially closed).
- **DS2 (L-1)** — the SubjectsTab loading gate gains `role="status"` +
  `aria-label="Loading subjects"` (the precedent family's shape; rides
  the diff review). No hue-tokens re-anchor (the RESIDUALS register
  carries no settings-view sites).

**Gates.** lint ✓ · tsc ✓ · unit **1697/1697** (51 files, +4 exactly
as designed: data-store +4) · build ✓ · the full touched spec file:
resilience.spec green (one P1008 machine-load flake triaged — the AK1b
leg failed under the full-file run's load, GREEN in isolation) · the
5-chunk cold cert: chunk 1 **156/156** · chunk 2 **197/197** (one
socket-timeout signature logged, zero failures) · chunk 3 **94 passed
+ 1 triaged** (the AK1d files-upload leg failed under the documented
`PrismaClientKnownRequestError: Socket timeout` machine-load
signature; isolate-rerun GREEN at 1.2 s; the chunk then cold-re-run in
full: **95/95**, every leg first-pass on the re-run, the DS1 leg
included) · chunk 4 **95/95** cold · chunk 5 **89/89** cold — the cert
tally **632/632** = **census 2329 green** (the e2e census 631 → 632) ·
the drawer check GREEN on the remediated tree (**the 99th
consecutive**) · the parity probe **MATCH** (all five formal checks,
live reference login).

**Evidence.** The `docs/screenshots/169-clone-*.png` frames (the
standing desktop + the mobile drawer [the 99th drawer-GREEN companion]
+ the cycle's Settings-Subjects surface — the seeded subject rows
[Mathematics/Physics/Chemistry/History/English/Biology] + the Add
Subject button + the Manage-your-subjects prose, the DS1/DS2
surfaces), captured by `scripts/capture-s169-evidence.mjs` (the S168
precedent), self-verifying (ok: true; md5s distinct) + the
not-pure-white pixel-ratio verification (45.87% desktop [byte-identical
to the S168 measurement, the live-clock surface] / 34.50% drawer
[byte-for-byte the S166/S167/S168 ratio, the unchanged static surface]
/ 57.76% subjects [the seeded content]).

**Docs.** README badge/census (2324 → 2329) + the count prose sites +
the Session-169 row; AGENTS census + the e2e map re-tag + the S169
lessons block (two lessons: a multi-collection refresh is ONE failure
domain — the contained catch rides the whole `Promise.all`, not each
leg; a warm-workspace cycle re-verifies the standing build's freshness
by SOURCE MTIME before using it as the pre-fix RED baseline); CLAUDE
counts (1697 + 632); PAD v1.3.77 (the revision block); the SKILL
census (all four sites); the vitest header re-anchor (+4); the cert
runner re-tag (both scripts, 631 → 632, chunk 3 94 → 95, machine-pinned
by the script-conventions tripwire — the CQ6/DA6 count-claims gates
verified GREEN after the re-anchor: 136/136); `docs/session_210.md`;
this entry; the plan §8 as-executed close; the `.env.example` contract
re-verified (no env-var reads changed this cycle — .env and
.env.example byte-identical at the documented dev posture); the
cert-s169.log scratch swept before the commit (the tracked artifact is
the launcher script).

**Next cycle.** The subjects port closes the FIRST of the eight
remaining CB8 seams. The rotation continues into the remaining seven
(the taskList/deck/studyGroup/practiceTest/grades/focusSessions/
holidays families); the unannounced loading-gate families
(focustimer/gradetracker/dashboard/myday/studygroups/practicetests/
analytics/settings-holidays); the files refresh-failure toast copy
harmonization (the F-8 candidate); the S160 close's ledger (the A-M3
stage-2 triggers; the update-side raw-SQL bulk upsert; the I-4 parse
posture; the M-1 LLM-side residual); the
gradetracker/studygroups/settings-CRUD (edit/delete journeys +
holidays) and AlertDialog-confirm e2e gaps.

## Session 181 — the S170 cycle (Batch DT: the task-lists-family hardening + the chrome catch-up set)

The workspace was COLD — a fresh `git clone` at `5d6258f` on `main` (the
S169/Batch DS fix `2ed1512` + the plan-tick `5699d1b` + the operator's
session_211 transcript commit). The environment rebuilt from the
documented quickstart: `.env` from `.env.example` (byte-identical at the
documented dev posture `DATABASE_URL="file:../db/custom.db"`), `bun
install` (510 packages), the Playwright chromium re-derived at the
locked v1243 pin (the S103/S166 fresh-clone doctrine), `db:push &&
db:seed` (the repo-root `db/custom.db`). The pre-fix standalone built
at 07:41 on the clean S169-final tree — the TRUSTED pre-fix binary for
the DT2 e2e RED proofs.

The doc chain re-read (worklog tail, session_210, the S169 plan §8/§9,
session_211 [the operator's raw S169 transcript], the census sites
across README/AGENTS/CLAUDE/PAD/SKILL), then validated against the
codebase: all three DS claims verified at their source anchors (the
three contained catches + the S169/DS1 doctrine comment at data.ts:609-
645, the DS2 aria gate, the DS1 pair set + e2e leg), the doc census
chain machine-verified consistent at 1697 + 632 = 2329.

Cold baseline (before any work): lint ✓ · tsc ✓ · the full Vitest run
**1697/1697 (51 files — the documented S169 final state exactly)** ·
dev-server preflight GREEN · **the drawer check GREEN (the 100th
consecutive** no-Tailwind-v4-mobile-nav-bug confirmation) · **the
desktop parity probe DIVERGENCE on navWidthMatch** — the FIRST
standing-probe divergence since the parity gates were instituted,
root-caused this session (below). Baseline noise: none. The config
posture re-validated for the operator's standing ask (the `skills/`
folder excluded from code checking, testing, and compilation on every
axis).

The audits (Mode-C; every H/L finding re-verified by direct read):

- **A — the Batch DS recent-changes axis** (`2ed1512` fix +
  `5699d1b`/`5d6258f` docs-only): **0C / 0H / 0M / 0L / 0I — clean.**
- **B — the task lists family** (the rotation's fresh axis, the SECOND
  of the eight remaining CB8 seams the S168 close's ledger names):
  **0C / 1H / 0M / 0L / 0I.** The family coherent on every other axis
  (the taskListDelegate's where-scoped queries — task lists carry no
  owned FKs, they are the SetNull TARGET for Task.listId; Zod at both
  boundaries [boundedTitle]; the factory routes). The finding:
  **H-1** the THREE task-list mutations rejected on the refresh leg
  after a COMMITTED write — createTaskList/updateTaskList the
  single-collection fetchAndSet, deleteTaskList the TWO-collection
  Promise.all ([taskLists, tasks] — the Task.listId SetNull
  reconciliation set; EITHER failed GET rejected the whole delete) —
  the CB8 letter's NINTH family, with NO view consumer today (the
  tasks-view aside is read-only; the reference's own task dialog
  carries no list picker — verified live), so the pinned surface is
  the mutation CONTRACT itself.
- **C — the standing gates**: the parity DIVERGENCE root-caused to a
  LIVE REFERENCE DEPLOYMENT — the desktop aside gained border-x +
  shadow-xl shadow-slate-200/50 + z-40 + transition-all duration-300
  between the S169 close and this session (the S169 MATCH is
  incompatible with the bordered form's 258px inner-nav reading; the
  computed styles captured by the s170 probe scripts); the mobile
  app-bar's z-40 + shadow-sm + border-b is a LONGSTANDING clone miss
  the divergence pass surfaced (the reference's measured classes
  documented in the mobile-navigation spec's own initial-era comment,
  never pinned until now).

The remediation plan written BEFORE any source change
(`docs/remediation-plan-session170.md`, the plan-first doctrine),
validated against the codebase surfaces, then executed TDD-first:

- **DT1 — the task-lists-family mutation CB8 split (the H-1 close).**
  Unit RED proven exactly as designed (the resolve set RED ×3 — the
  trio, the delete leg's `mockRejectedValueOnce` rejecting ONE of the
  two parallel refresh GETs — `Promise.all` rejects on its first
  rejection, exactly the flaky-refresh condition — + the
  failed-write guard green-on-arrival, the pair `3 failed | 1
  passed`). NO e2e leg — the family has no view consumer (the
  adjudicated deferral: inventing a list-CRUD UI beyond the
  reference's own surface is out of scope for a CB8 seam cycle).
  GREEN = the three contained catches at the seam (the create/update
  pair + ONE catch on deleteTaskList's whole Promise.all — the S169
  multi-collection-is-one-failure-domain lesson) + the doctrine
  comment re-tagged for the ninth family.
- **DT2a — the desktop sidebar chrome catch-up.** The reference's
  post-S169 deployment measured live and pinned: border-x hairlines
  (the glass border-color) + shadow-xl shadow-slate-200/50 + z-40 +
  transition-all duration-300 on the aside; the border-box width
  contract holds (w-[260px]/w-20 + border-x still computes 260/80
  total; the inner nav reads 258 — the parity probe's restored MATCH).
  The e2e leg RED-proven against the pre-fix build (failing exactly at
  the border-left-width assertion), GREEN post-fix. The first run's
  oklab shadow serialization tripped the pin's rgba expectation — the
  trap-7 doctrine re-derived for shadows (v4's color-mix(in oklab)
  serializes oklab even on the hex-pinned slate-200 step; the
  reference's v3-era vars serialize rgba; the rendered colors are
  equivalent) — the pin now asserts the GEOMETRY + the 0.5 alpha and
  accepts either form.
- **DT2b — the mobile app-bar chrome catch-up.** The reference's
  measured classes: border-b + shadow-sm + z-40 (a longstanding miss —
  the spec comment documented them since the initial era). The e2e leg
  RED-proven against the pre-fix build, GREEN post-fix.

**Gates**: lint ✓ · tsc ✓ · unit **1701/1701** (51 files, +4 exactly
as designed) · build ✓ · the touched spec files green (navigation
67/67 + mobile-navigation 21/21, full-file runs) · the 5-chunk cold
cert (the authoritative gate) · the drawer check GREEN on the
remediated tree (**the 101st consecutive** no-Tailwind-v4-mobile-nav-
bug confirmation) · the desktop parity probe **MATCH** (all four
formal checks — navWidth 258 = 258, the bordered content box on BOTH
hosts; live reference login) with the probe itself HARDENED (the
post-login chrome wait + bounded retry — the login page's own
`<main>` false-positived the old wait and raced the reference's slow
mounts under load; the hardening converts the gate's reference
dependency from a fixed settle into a bounded convergence).

**Evidence**: `docs/screenshots/170-clone-desktop.png` (the standing
desktop dashboard — now carrying the DT2a chrome) ·
`170-clone-mobile-drawer.png` (the 101st drawer-GREEN companion; the
DT2b app-bar above it) · `170-clone-sidebar.png` (the cycle's surface
— the desktop sidebar close-up, the DT2a border-x + xl-shadow chrome),
captured by `scripts/capture-s170-evidence.mjs`, self-verifying (ok:
true, md5s distinct) + the not-pure-white pixel-ratio verification.

**Docs lockstep**: README badge/census (2329 → 2335) + the count
prose sites (the tree diagram + the test-command block) + the
Session-170 row; AGENTS census (1701 + 634) + the S170 lessons block
(three lessons: a standing-probe divergence on a clean tree is a
reference-side finding — probe the reference at the source and sweep
the whole chrome family while in there; a gate script must wait for
the POST-LOGIN chrome, never any `<main>`; v4 alpha shadows serialize
oklab even on hex-pinned steps — pin the geometry + the alpha, accept
either color form); CLAUDE counts (1701 + 634); PAD v1.3.78 (the
revision block); the SKILL census (all four sites — the chromium-spec
figure re-derived 624 → 629, a pre-existing small drift the re-anchor
caught); the vitest header re-anchor (+4); the cert runner re-tag
(both scripts, 632 → 634, chunk 1 156 → 158, machine-pinned by the
script-conventions tripwire — the CQ6/DA6 count-claims gates verified
GREEN after the re-anchor: 136/136); this log; the worklog Session-181
entry; the plan §8 as-executed close; the `.env.example` contract
re-verified (no env-var reads changed this cycle — .env and
.env.example byte-identical at the documented dev posture); the
cert-s170.log scratch swept before the commit (the tracked artifact
is the launcher script).

Next cycle. The rotation continues — the task-lists port closes the
SECOND of the eight remaining CB8 seams. The recorded deferrals: the
remaining six CB8 seams (the deck/studyGroup/practiceTest/grades/
focusSessions/holidays families — each gets its own rotation-axis
audit + pin set; deck is next in the recorded order); the task-lists
e2e leg (arrives when/if a list surface ships — the reference carries
no list-CRUD UI today); the unannounced loading-gate families
(focustimer/gradetracker/dashboard/myday/studygroups/practicetests/
analytics/settings-holidays); the files refresh-failure toast copy
harmonization (the F-8 candidate); the S160 close's ledger (the A-M3
stage-2 triggers; the update-side raw-SQL bulk upsert; the I-4 parse
posture; the M-1 LLM-side residual); the gradetracker/studygroups/
settings-CRUD (edit/delete journeys + holidays) and
AlertDialog-confirm e2e gaps; a periodic re-probe of the reference's
chrome (the live deployment this cycle caught proves the reference
drifts — the standing probes are the tripwire).

## Session 182 — the S171 cycle (Batch DU: the studygroups-family hardening + the dialog catch-up set)

The workspace was COLD (a fresh `git clone` at `c40ac6c` on `main` —
the S170/Batch DT fix `b982ea8` pushed + remote-verified, the plan-tick
`5ecd477`, the operator's session_213 transcript `c40ac6c`). The
environment rebuilt from the documented quickstart; the doc chain
re-read and validated against the codebase (the DT1 catches + the
DT2a/DT2b chrome at their source anchors; the census chain
machine-consistent at 1701 + 634 = 2335).

Cold baseline: lint ✓ · tsc ✓ · unit **1701/1701** (51 files — the
documented S170 final state exactly) · preflight GREEN · **the drawer
check GREEN (the 102nd consecutive** no-Tailwind-v4-mobile-nav-bug
confirmation) · **the desktop parity probe MATCH** (all four checks).
The mobile nav ADDITIONALLY re-verified through a fresh agent-browser
pass at 390×844 (the operator's standing ask): the drawer opens with
all 20 links, a drawer-link navigation auto-closes, Escape closes (the
superset), the backdrop click at an exposed point closes, the app-bar
computes z-40 + border-b + fixed (the DT2b chrome live). The `skills/`
exclusion posture re-verified on every axis; the `.env` ≡
`.env.example` contract re-verified at the documented dev posture
(`DATABASE_URL="file:../db/custom.db"`, the repo-root `db/`).

**The ledger correction (the cycle's first finding, verified at the
source):** the S170 close's "deck is next" is STALE — the deck family
has carried the DQ1 catches + pair set since S167 (`8d25d9a`). The
true remaining seams: studyGroups (this cycle), practiceTests, grades,
focusSessions, holidays (+ the createCalculatorEntry create-only
mutation, never ledgered — recorded).

The audits (Mode-C): **A** — the recent-changes axis (docs-only):
clean. **B** — the studygroups family: **0C/1H/0M/1L/2I** — the FOUR
mutations (the trio + the members chain entry) rejected on the refresh
leg after a COMMITTED write, ALL with live view consumers (unlike the
taskLists axis); the create dialog's copy scaffold-era + the reference
re-deployed its dialog; the reference's model carries a DESCRIPTION
field the clone lacked. **C** — the standing gates clean + the
reference's StudyGroups surface measured live through the GATED
WRITE-PATH probe (one throwaway row → captured → DELETEd → zero
residue): the measured dialog (title "Create Study Group", the name
placeholder "e.g., Math Study Squad", the description textarea
"What's this group about?", the six swatches — GROUP_COLORS match
EXACTLY — the footer's [Create Group][Close] DOM order) + **the
reference's own create→list flow measured BROKEN** (the POST commits,
the list GET returns `[]` — the clone's working CRUD stays the
documented superset).

Fixed TDD-first (every RED on its designed marker): **DU1** the
studygroups-family CB8 split — the four contained catches (the trio +
the chain entry's own refresh; the failed PATCH still rejects honestly)
+ the unit pair set (RED `4 failed | 2 passed`) + the e2e leg in
resilience (the case-INSENSITIVE "Create Group" locator kept the RED
on the CB8 behavior while DU2 owned the copy); **DU2a** the
create-dialog copy catch-up (the measured title + placeholder + the
[Create Group][Close] footer order; the edit leg keeps its
measured-era shape) + the copy pin (RED at the title assertion; the
form-scoped "Close" locator — the shadcn X's sr-only name collides
otherwise); **DU2b** the description port (the deck-description
precedent: the column, the 500-bound schema field, the row type, the
dialog textarea with the measured placeholder + the visible-Label
superset, the reference's measured field-order prefix with the
superset Subject select moved after the swatches, the detail-pane
render, the seed's Calc Crew enrichment, the import cap + census
updates) + the round-trip e2e leg + the unit import-cap legs (RED ×2).

**Gates**: lint ✓ · tsc ✓ · unit **1709/1709** (+8: data-store +6,
data-import +2 — the plan's +7 arithmetic corrected in the log per the
S170 precedent) · build ✓ · the touched spec files green in full-file
cold runs (resilience 45/45 — one first-pass AJ1 failure triaged per
the P1008 protocol: the isolate reproduction PASSED on a fresh boot
+ the cold re-run 45/45, the documented files-PATCH-under-load
intermittent class, no files-surface code touched; parity-session7
62/62) · the 5-chunk cold cert (the plan's §8 close records the
tally) · the drawer check GREEN on the remediated tree (**the 103rd
consecutive**) · the desktop parity probe **MATCH** · the tripwire
136/136 after the doc-chain lockstep.

**Evidence**: `docs/screenshots/171-clone-desktop.png` ·
`171-clone-mobile-drawer.png` (the 103th companion) ·
`171-clone-studygroups.png` (the cycle's surface — the create dialog
open with the measured copy + the ported description field), captured
by `scripts/capture-s171-evidence.mjs` self-verifying (ok: true, md5s
distinct).

**Docs lockstep**: README badge/census (2335 → 2346) + the prose
sites + the Session-171 row; AGENTS census + the S171 lessons block
(three lessons: a rotation ledger can go stale — the codebase is the
ledger of record; a scaffold-era dialog copy is an unmeasured surface
— re-probe the family's reference surfaces when the cycle lands on
them, and the superset goal cuts both ways; a pre-fix AND post-fix
locator rides the case-insensitive default so each RED fails at its
own marker); CLAUDE counts; PAD v1.3.79; the SKILL census (all four
sites, the chromium-spec figure 629 → 632); the vitest header
(+8); the cert runner re-tag (158 + 199 + 96 + 95 + 89 = 637,
tripwire-pinned 136/136); `docs/session_214.md`; the worklog
Session-182 entry; the plan §8 as-executed close; the `.env.example`
contract re-verified (no env changes).

Next cycle. The rotation continues with the LEDGER-CORRECTED order:
the remaining five CB8 seams (practiceTest / grades / focusSessions /
holidays + the calculatorHistory observation); the other recorded
deferrals (the task-lists e2e leg; the unannounced loading-gate
families; the F-8 toast copy; the S160 ledger; the
gradetracker/settings-CRUD + AlertDialog-confirm e2e gaps; a periodic
re-probe of the reference's chrome AND dialog surfaces — this cycle
proves the reference drifts beyond chrome).

## Session 183 — the S172 cycle (Batch DV: the practicetests-family hardening + the dialog catch-up set)

The workspace was COLD (a fresh `git clone` at `eb47326` on `main` —
the S171/Batch DU fix `95c2b60` pushed + remote-verified, the
operator's session_215 transcript `eb47326`). The environment
rebuilt from the documented quickstart; the doc chain re-read and
validated against the codebase (the DU1 catches + the DU2a/DU2b
dialog surface at their source anchors; the census chain
machine-consistent at 1709 + 637 = 2346).

Cold baseline: lint ✓ · tsc ✓ · unit **1709/1709** (51 files — the
documented S171 final state exactly) · preflight GREEN · **the drawer
check GREEN (the 104th consecutive** no-Tailwind-v4-mobile-nav-bug
confirmation) · **the desktop parity probe MATCH** (all five
checks). The mobile nav ADDITIONALLY re-verified through a fresh
agent-browser pass at 390×844 (the operator's standing ask): the
drawer opens with all 20 links, a drawer-link navigation to
/PracticeTests auto-closes, Escape closes (the superset), the
backdrop click at an exposed point closes, the app-bar computes
z-40 + border-b + fixed (the DT2b chrome live). The `skills/`
exclusion posture re-verified on every axis; the `.env` ≡
`.env.example` contract re-verified at the documented dev posture
(`DATABASE_URL="file:../db/custom.db"`, the repo-root `db/`).

**The rotation axis (verified at the source):** the S171 close's
ledger-corrected order confirmed — the practiceTests trio
(createPracticeTest / updatePracticeTest / deletePracticeTest) rode
the uncaught `fetchAndSet("practiceTests")`. The remaining seams
after this cycle: grades, focusSessions, holidays (+ the
createCalculatorEntry create-only observation, still never
ledgered).

The audits (Mode-C): **A** — the recent-changes axis (docs-only):
clean. **B** — the practiceTests family: **0C/1H/0M/1L/0I** — the
THREE mutations rejected on the refresh leg after a COMMITTED
write, ALL with live view consumers (the TestDialog submit catch's
"Could not save the practice test." with the dialog open — the
retry that duplicates the test; the AlertDialogAction delete
catch's false claim); the create dialog's copy scaffold-era + the
reference re-deployed its dialog. **C** — the standing gates clean
+ the reference's PracticeTests surface measured live through the
GATED WRITE-PATH probe (TWO throwaway rows → captured → DELETEd →
zero residue ×2): the measured dialog (title "Create Practice
Test", the label "Test Title *", the title placeholder "e.g.,
Biology Chapter 5 Review", the "N questions added" counter — the
clone's matches exactly, the footer's [Create Test][Close]
submit-then-secondary order) + **the reference's editor is
AI-ONLY** (the clone's manual Add-question editor is the superset —
and the deterministic e2e vehicle) + **its card menu is Delete-ONLY
(measured twice — NO edit affordance anywhere; the clone's Edit
icon + AlertDialog confirm are the supersets)** + the reference's
create→list flow WORKS on this surface (both probe POSTs committed
and listed — no reference-side data bug, unlike the S171
studygroups surface).

Fixed TDD-first (every RED on its designed marker): **DV1** the
practiceTests-family CB8 split — the three contained catches + the
unit pair set (RED `3 failed | 1 passed`) + the e2e leg in
resilience (the dialog-scoped exact "Create Test" locator — the
label identical pre-fix and post-fix, so the RED landed on the CB8
behavior while DV2 owned the copy; the one question rides the
clone's manual editor); **DV2** the create-dialog copy catch-up
(the measured title + the "Test Title *" label + the placeholder +
the [Create Test][Close] footer; the edit leg keeps "Edit Practice
Test" + [Cancel][Save changes] — the reference has no edit
affordance, so the edit leg is the clone's own superset surface) +
the copy pin (RED at the title assertion; the form-scoped "Close"
locator — the shadcn X's sr-only name collides otherwise).

**Gates**: lint ✓ · tsc ✓ · unit **1713/1713** (+4: data-store +4,
exactly as designed) · build ✓ (the documented toolchain noise
pre-existing) · the touched spec files green in full-file cold runs
(resilience: three cold full-file runs each lost ONE DIFFERENT
files-upload-edge sibling to the documented moving-target
under-load class — AK1c, then AK1b, then AJ1, every failed leg
GREEN in cold isolation, zero files-flow code touched this cycle;
parity-session7: the cert's chunk-2 cold re-run carried it 200/200)
· the 5-chunk cold cert **639/639** (chunk 1 158/158 first-pass ·
chunk 2 200/200 on the cold re-run — the first-pass lost the
timing-sensitive S81-era AH2a departed-Save leg [a 2500ms-hold
pin, untouched this cycle], green in cold isolation and in the
re-run; chunk 3 97/97 first-pass — the DV1 leg green; chunk 4
95/95 first-pass — the webServer LOGGED a
PrismaClientKnownRequestError Socket timeout mid-chunk without
failing a single leg, the documented P1008 signature appearing as
noise; chunk 5 89/89 first-pass) · the drawer check GREEN on the
remediated tree (**the 105th consecutive**) · the desktop parity
probe **MATCH** · the tripwire 136/136 after the doc-chain
lockstep.

**Evidence**: `docs/screenshots/172-clone-desktop.png` ·
`172-clone-mobile-drawer.png` (the 105th companion) ·
`172-clone-practicetests.png` (the cycle's surface — the create
dialog open with the measured copy + the superset Add-question/AI
Generate editor), captured by `scripts/capture-s172-evidence.mjs`
self-verifying (ok: true, md5s distinct + the not-pure-white
pixel-ratio verification 0.458/0.869/0.345).

**Docs lockstep**: README badge/census (2346 → 2352) + the prose
sites + the Session-172 row; AGENTS census + the S172 lessons block
(three lessons: a reference surface can carry NO edit affordance at
all — enumerate the affordances explicitly so the superset doctrine
knows which legs have a reference contract; the e2e vehicle for an
AI-only reference editor is the clone's manual superset; count the
dialog-footer DOM order from the MEASURED button list and scope the
order assertion to the submit + secondary); CLAUDE counts; PAD
v1.3.80; the SKILL census (all four sites, the chromium-spec figure
632 → 634); the vitest header (+4); the cert runner re-tag
(158 + 200 + 97 + 95 + 89 = 639, tripwire-pinned 136/136);
`docs/session_216.md`; this entry; the plan §8 as-executed close;
the `.env.example` contract re-verified (no env changes).

Next cycle. The rotation continues with the remaining four CB8
seams (grades / focusSessions / holidays + the calculatorHistory
observation); the other recorded deferrals (the task-lists e2e
leg; the unannounced loading-gate families; the F-8 toast copy;
the S160 ledger; the gradetracker/settings-CRUD +
AlertDialog-confirm e2e gaps; a periodic re-probe of the
reference's chrome AND dialog surfaces — three consecutive
families now show reference dialog drift; the standing probes are
the tripwire).

## Session 184 — the S173 cycle (Batch DW: the grades-family hardening + the dialog catch-up + field-port set)

The workspace was COLD (a fresh `git clone` at `09dfaeb` on `main` —
the S172/Batch DV fix `9db9a8d` pushed + remote-verified, the
operator's session_217 transcript `09dfaeb`). The environment
rebuilt from the documented quickstart; the doc chain re-read and
validated against the codebase (the DV1 catches + the DV2 dialog
surface at their source anchors; the census chain
machine-consistent at 1713 + 639 = 2352).

Cold baseline: lint ✓ · tsc ✓ · unit **1713/1713** (51 files — the
documented S172 final state exactly) · preflight GREEN · **the drawer
check GREEN (the 106th consecutive** no-Tailwind-v4-mobile-nav-bug
confirmation) · **the desktop parity probe MATCH** (all five checks;
the first pass read a pre-mount reference — the documented
reference-latency flake class, the bounded retry carried it to the
standard MATCH). The mobile nav ADDITIONALLY re-verified through a
fresh agent-browser pass at 390×844 (the operator's standing ask):
the drawer opens with all 20 links, a drawer-link navigation to
/GradeTracker auto-closes, Escape closes (the superset), the
backdrop click at an exposed point closes, the app-bar computes
z-40 + border-b + fixed (the DT2b chrome live). The `skills/`
exclusion posture re-verified on every axis; the `.env` ≡
`.env.example` contract re-verified at the documented dev posture
(`DATABASE_URL="file:../db/custom.db"`, the repo-root `db/`).

**The rotation axis (verified at the source):** the S172 close's
ledger-corrected order confirmed — the grades trio (createGrade /
updateGrade / deleteGrade) rode the uncaught
`fetchAndSet("grades")`. The remaining seams after this cycle:
focusSessions, holidays (+ the createCalculatorEntry create-only
observation, still never ledgered).

The audits (Mode-C): **A** — the recent-changes axis (docs-only):
clean. **B** — the grades family: **0C/1H/0M/1L/0I** — the THREE
mutations rejected on the refresh leg after a COMMITTED write, ALL
with live view consumers (the GradeDialog submit catch's "Could not
save the grade." with the dialog open — the retry that duplicates
the grade; the AlertDialogAction delete catch's false claim); the
create dialog's copy AND FIELD SET scaffold-era + the reference
re-deployed its dialog AT THE FIELD LEVEL (a Type select + a native
date input the clone's model could not record). **C** — the standing
gates clean + the reference's GradeTracker surface measured live
through the GATED WRITE-PATH probe (TWO throwaway grade rows — one
without a subject, one with a throwaway "Probe Math" subject created
through the reference's own Settings → Subjects surface — captured,
DELETEd via the platform's entity API [the surface carries NO
delete affordance: the "Add Grade" opener measured as the ONLY
interactive element in main, the grade pills read-only spans], zero
residue ×2): the measured dialog (title "Add New Grade", the
Subject select FIRST, a Type select defaulting "Homework" with the
six measured options Homework/Quiz/Test/Midterm/Final/Project, the
placeholder-labeled "Score"/"Max Score"/"Weight (optional, default
1)" inputs, a native date input defaulting today, the footer's
[Cancel][Add Grade] order) + the reference's create→list flow WORKS
on this surface (Total Grades 0 → 1 → 2 — no reference-side data
bug).

Fixed TDD-first (every RED on its designed marker): **DW1** the
grades-family CB8 split — the three contained catches + the unit
pair set (RED `3 failed | 1 passed`) + the e2e leg in resilience
(the dialog-scoped exact "Add Grade" locator — the label identical
pre-fix and post-fix; the DW2 type/date fields carry deterministic
defaults so the leg fills only the title + score + max); **DW2** the
create-dialog catch-up + the type/date FIELD PORT (the S171/DU2b
description-port precedent applied at the field level: the
GRADE_TYPES vocabulary + the `type`/`date` columns through
schema.prisma → validation.ts → the GradeRow type → the dialog [the
measured title + the Subject-first field order + the Type select +
the native date input riding the CB2 TZ atoms + the "Max Score"
label + the "Weight (optional, default 1)" hint] → the seed's five
typed/dated defs → the import seam's ENUM_VOCABULARIES mirror + the
row render's type/date metadata + the enum single-source census's
seventh site; the clone's Title input stays — the superset, the
reference's dialog has no title input) + the copy pin (RED at the
title assertion; the capitalize-class assertion for the Type select
— the DOM text carries the lowercase schema value, the CSS owns the
visual "Homework").

**Gates**: lint ✓ · tsc ✓ · unit **1719/1719** (+6: data-store +4,
enum-single-source +2, exactly as designed) · build ✓ (the
documented toolchain noise pre-existing) · the touched spec files
green in full-file cold runs (resilience 47/47, parity-session7
64/64 — no flakes observed this cycle) · the 5-chunk cold cert
**641/641** (158 + 201 + 98 + 95 + 89 — chunk 1 158/158 first-pass
clean; the chunk-level detail in the session log) · the drawer check
GREEN on the remediated tree (**the 107th consecutive**) · the
desktop parity probe **MATCH** · the tripwire 136/136 after the
doc-chain lockstep.

**Evidence**: `docs/screenshots/173-clone-desktop.png` ·
`173-clone-mobile-drawer.png` (the 107th companion) ·
`173-clone-gradetracker.png` (the cycle's surface — the create
dialog open with the measured copy + the ported Type select + date
input + the seeded typed/dated rows below), captured by
`scripts/capture-s173-evidence.mjs` self-verifying (ok: true, md5s
distinct + the not-pure-white pixel-ratio verification).

**Docs lockstep**: README badge/census (2352 → 2360) + the prose
sites + the Session-173 row; AGENTS census + the S173 lessons block
(three lessons: a reference dialog can drift at the FIELD level —
measure the field set, not only its labels, and port through the
DU2b shape; a surface with no delete affordance makes the probe's
cleanup an entity-API exercise with the localStorage Bearer token
executed in-page; the e2e pin for a CSS-capitalized enum asserts the
DOM text + the class, never the transformed string); CLAUDE counts;
PAD v1.3.81; the SKILL census (all four sites, the cert-map figure
re-derived); the vitest header (+6); the cert runner re-tag
(158 + 201 + 98 + 95 + 89 = 641, tripwire-pinned 136/136);
`docs/session_218.md`; this entry; the plan §8 as-executed close;
the `.env.example` contract re-verified (no env changes).

Next cycle. The rotation continues with the remaining three CB8
seams (focusSessions / holidays + the calculatorHistory
observation); the other recorded deferrals (the task-lists e2e leg;
the unannounced loading-gate families; the F-8 toast copy; the S160
ledger; the gradetracker/settings-CRUD + AlertDialog-confirm e2e
gaps; a periodic re-probe of the reference's chrome AND dialog
surfaces — four consecutive families now show reference dialog
drift, this cycle's at the field level; the standing probes are the
tripwire).

## Session 185 — the S174 cycle (Batch DX: the CB8 completion — focusSessions/holidays/calculatorHistory + the holidays field port + the focustimer catch-up)

The workspace was WARM — the previous session's mid-GREEN tree,
interrupted during the DX1c honest-RED re-proof (the unit layer at
1729/1731 with the calculator pair RED as designed; the focustimer +
holidays ports already in place; `git status` confirming the
twelve-file DX surface + the untracked plan). This session resumed
EXACTLY at the pin-correction debugging and closed the cycle.

**The DX1c pin-correction (the cycle's deepest lesson, proven with a
live probe on the reverted build):** the suspicious pass unpeeled two
layers. First — the raw route abort surfaces as the seam's
OFFLINE_MESSAGE ("You appear to be offline. Reconnect and try
again — your last action was not saved."), never the caller's
fallback string; `doFetch` converts the fetch TypeError into
`ApiError(0, OFFLINE_MESSAGE)` and the toast renders `err.message`
when present, so the text pin on "The result is shown, but history
could not record it." could never see the pre-fix toast. Second (the
root cause, probe-measured): the retrying `toHaveCount(0)` over the
Notifications region passed VACUOUSLY — the false-failure toast
fired at ~12ms after the refresh dispatch, lived its 5s auto-dismiss
(toast.tsx's hardcoded timer), and the 10s retrying assertion simply
waited past the dismissal (the probe's exact numbers: fired at 12ms,
the assertion green at 5318ms). The corrected observable: the refresh
GET's DISPATCH anchor (`waitForRequest` — it fires on BOTH builds;
the fix contains the rejection, never the dispatch) + a 600ms settle
(the abort→rejection→catch→render chain measured ~12ms; a 50x margin,
the 5s lifetime 8x above the settle) + a SINGLE-SHOT plain count —
pre-fix the toast is guaranteed alive at the check, post-fix nothing
ever mounts. Honest RED re-proven at the designed marker (the count
read 1), GREEN after the catch re-apply (1.9s, no retry). En route:
the stale-server hypothesis ruled out then confirmed as the ORIGINAL
suspicious-pass vector (the `reuseExistingServer` posture serves the
OLD build after a source revert — the re-proof must rebuild AND
re-boot), and the aged-`db/e2e.db` P1008 socket-timeout class
diagnosed (a hard-killed session leaves the scratch db dirty; the
cold reset is the cure — AK1d green cold, 50/50).

**The cycle's ports (executed TDD-first across the interrupted +
resumed sessions, every RED on its designed marker):** **DX1** the
family CB8 COMPLETION — the contained catches for the focusSessions
trio + the holidays trio + the createCalculatorEntry create-only
observation (the THIRTEENTH + FOURTEENTH + FIFTEENTH + FINAL
families; the recorded family-wide port COMPLETE — no mutation in
the store rides an uncaught refresh leg) + the unit pair set (RED ×7
/ green-on-arrival ×3) + the three e2e legs (DX1a/DX1b/DX1c);
**DX2/DX3** the focustimer catch-up — the Timer Settings dialog
(four sliders: focus/break/long-break durations +
sessions-before-long-break; the volume toggle with the WebAudio
chime, default muted; client-state per the measured reload behavior)
+ the CLOCK-LABELS + MODE_ICONS + the Today-duration stat (the
clone's aria-live count line + the labeled Subject control stay —
the documented a11y superset); **DX4** the holidays range-model
field port — HOLIDAY_TYPES (holiday/break/no-school, the exact-label
map) + the `type`/`endDate` columns through schema.prisma →
validation.ts (the route-side + client-side end≥start ordering
guards, the BZ6 precedent) → the HolidayRow type → the dialog (the
measured "Start Date"/"End Date" native inputs, both required, no
defaults + the three-button aria-pressed type selector + the
"e.g., Winter Break" placeholder + the [Cancel][Add Holiday]
footer) → the list's date-range + type badge render → the seed's
two typed/ranged defs → the import seam's ENUM_VOCABULARIES mirror +
the enum single-source census's eighth site. The reference's own
Holiday create answers 403 — a reference-side data bug RECORDED not
ported (the dialog is the field-set authority; the clone's flow
keeps working — the functional superset).

**Gates**: lint ✓ · tsc ✓ · unit **1731/1731** (+12: data-store
+10, enum-single-source +2 — the census site generates the import +
no-twin pair, the plan's +11 projection corrected in the executed
close) · build ✓ (the documented toolchain noise pre-existing) · the
touched spec files green in full-file cold runs (resilience 50/50,
parity-session7 65/65) · the 5-chunk cold cert **645/645**
(158 + 202 + 101 + 95 + 89 — chunk 1 158/158, chunk 2 202/202
first-pass clean) · the drawer check GREEN on the remediated tree
(**the 109th consecutive** no-Tailwind-v4-mobile-nav-bug
confirmation) · **the desktop parity probe MATCH** (all five checks)
· the mobile nav additionally re-verified through a fresh
agent-browser pass at 390×844 (open, 20 links, navigate+auto-close,
Escape, the oklab backdrop + 288px panel + z-40 app-bar) · the
tripwire 136/136 after the doc-chain lockstep.

**Evidence**: `docs/screenshots/174-clone-desktop.png` ·
`174-clone-mobile-drawer.png` (the 109th companion) ·
`174-clone-focustimer.png` (the cycle's surface — the remediated
focustimer with the Timer Settings dialog open, the ported sliders +
volume toggle), captured by `scripts/capture-s174-evidence.mjs`
self-verifying (ok: true, md5s distinct + the not-pure-white
pixel-ratio verification).

**Docs lockstep**: README badge/census (2360 → 2376) + the prose
sites + the Session-174 row; AGENTS census + the S174 lessons block
(four lessons: the negative retry-assertion on a self-dismissing
element passes vacuously — anchor + settle + single-shot; the raw
abort surfaces as the OFFLINE_MESSAGE, pin the region never the
fallback text; the honest-RED re-proof must rebuild AND re-boot —
`reuseExistingServer` serves the stale build; a reference surface
whose own write path is broken is the field set's authority, not the
flow's — record the break, port the fields, keep the working
superset); CLAUDE counts; PAD v1.3.82; the SKILL census; the vitest
header (+12); the cert runner re-tag (158 + 202 + 101 + 95 + 89 =
645, tripwire-pinned 136/136); `docs/session_220.md`; this entry;
the plan §10 as-executed close; the `.env.example` contract
re-verified (no env changes).

Next cycle. The recorded family-wide CB8 port is COMPLETE — the
rotation's ledger turns to the other recorded deferrals (the
task-lists e2e leg; the unannounced loading-gate families; the F-8
toast copy; the S160 ledger; the gradetracker/settings-CRUD +
AlertDialog-confirm e2e gaps; a periodic re-probe of the reference's
chrome AND dialog surfaces — five consecutive families now show
reference dialog drift; the standing probes are the tripwire).

## Session 186 — the S175 cycle (Batch DY: the subjects-family field port — the subject-dialog catch-up + the loading-gate completion + the CLAUDE cross-read pin + the CRUD e2e coverage)

The workspace was WARM through TWO session-level tool-infra
interruptions (every call failing with connection errors; all work on
disk, zero loss — the DY tree's 17 modified files + the untracked
plan/scripts). This session resumed at the full-file cold runs + the
5-chunk cert, and closed the cycle — including the unplanned fifth
leg the cert forced.

**The resume's own finding**: the reaper-proof cert had COMPLETED
through the interruption (158 ✓ + 207 ✓ + chunk 3 100/101 + 95 ✓ +
89 ✓ = DONE) — the S175 map 650, one flake to resolve. The resume
also diagnosed the EADDRINUSE leftover: the interrupted session's
stale dev server still held :3000 with a Prisma connection pointing
at a db inode the interruption-era reseed had swapped out — reads
fine, writes "readonly database", the Settings tab wedged on the
loading gate (the evidence capture's first failure); the cure is the
precise-PID kill + a fresh boot.

**The cert chunk-3 saga (five flakes, one mechanism, traced to
ROOT)**: the first flake was AJ1 (the S174 precedent — green in
isolation, load-induced class). The re-proofs then failed four MORE
times — each a DIFFERENT folder-family test (AK1c, AK1d, AK1b,
AK1a), each green in isolation, including two strictly-isolated
runs. That pattern (a family-level ~1-per-run failure that survives
"isolation") triggered the deep trace: the Playwright trace.zip
network timeline showed THREE concurrent writes (two /api/rum
telemetry upserts + the folder PATCH's cycle-guard `$transaction`)
stalling EXACTLY the connector's socket-timeout value — 5.04s at the
default, 30.06s after the posture change — and P1008-ing together,
then everything fast again (5.9ms). The reads never stalled; the
machine measured healthy (0.2ms fsync commits, 3.5GB free). ROOT
CAUSE: **the sandbox FREEZES background processes ~5-30s at
TOOL-CALL boundary crossings** — the reaper-proof double-fork (the
S110 lesson) escapes the KILL, not the FREEZE, and every reaper-
proof launch still crossed boundaries through its polling calls.
Two cures landed: (1) the e2e `socket_timeout=30` posture on
playwright.config's E2E_DATABASE_URL (the documented SQLite
busy_timeout knob — SECONDS, verified against the Prisma 6.19.3 CLI
+ the quaint source; rides genuine lock contention out, the
dev/prod URLs stay bare; the db-path resolver verified to preserve
the query param through the standalone's schema-anchored
resolution); (2) the zero-boundary execution — the chunk run
DIRECTLY, a synchronous child of ONE long tool call with no
boundaries to cross mid-run: **101/101 GREEN, rc=0**. The cert
census: **650 GREEN** (chunks 1/2/4/5 first-pass clean, chunk 3
re-proven through the diagnosed class).

**The cycle's ports (all RED-proven at designed markers across the
interrupted + resumed sessions)**: DY1 the teacher/room field port
end-to-end (schema → validation [max 100, the optional-default
atom] → the SubjectRow type → the dialog's measured "Teacher
(optional)"/"Room (optional)" labels → the row render's metadata pair
[teacher 14px/400 slate-500 + room 12px/400 slate-400, only when
non-empty] → the seed's six enriched defs → the import seam → the
mutations' type surface) + the SEVENTEEN-swatch 32px/rounded-lg
palette catch-up (the violet #8b5cf6 default; the clone's
aria-pressed + aria-labeled swatches + the Custom input stay — the
a11y superset, the DV2 adjudication-7 precedent at swatch level) —
the reference's dialog had re-drifted (the SIXTH consecutive
family; the write path WORKS this cycle — create → row render →
delete live, zero residue — so both the field set and the row
render are measured authorities); DY2 the THIRTEEN loading-gate
aria contracts across NINE views (the DM2/DL2/DK4 family-wide port
COMPLETE) + the hue-tokens register's two by-design re-anchors;
DY3 the CLAUDE.md census re-anchor (the stale "641" — the one doc
with no pin is the one that rotted) + the self-anchoring cross-read
pin pair (the CQ6 family extended to the LAST unpinned doc); DY4
the four gradetracker/settings-CRUD + AlertDialog-confirm legs
(green-on-arrival coverage, honestly recorded).

Gates: lint ✓ · tsc ✓ · unit **1733/1733** (51 files, +2 the DY3
pair — the plan's "designed 1732" corrected: census pins land as
pairs) · build ✓ · parity-session7 **70/70** cold · the cert census
**650 GREEN** · the drawer check **111th consecutive** · the desktop
parity probe MATCH (all five checks) · the fresh agent-browser
mobile-nav pass at 390×844 · the tripwire **138/138** after the
doc-chain lockstep. Evidence: `docs/screenshots/175-clone-desktop.png`
· `175-clone-mobile-drawer.png` · `175-clone-settings-subjects.png`
(the cycle's surface — the Add Subject dialog open with the
Teacher/Room fields + the 17-swatch palette over the seeded rows'
metadata; self-verifying, md5s distinct).

Docs lockstep: README badge/census (2376 → 2383) + the prose sites
+ the Session-175 row; AGENTS census + the S175 lessons block (FIVE
lessons — the fifth: the boundary-freeze class; "a flake class
that survives three 'isolated' re-proofs is a boundary artifact,
not load — the N-requests-stalling-the-SAME-constant trace
signature; the fix is measured, not retried"); CLAUDE counts; PAD
**v1.3.83**; the SKILL census; the vitest header (+2); the cert
runner re-tags (e2e-chunked-cert.sh's map 645 → 650 +
run-cert-chunk.sh's honest header catch-up — the "same census"
prose claim had been false since S167); `docs/session_222.md`;
this entry; the plan §10 as-executed close (with the DY5 record)
+ the §11 checklist ticks; the `.env.example` contract re-verified
(no env changes — the socket_timeout posture is a playwright-config
env, not a .env change).

Next cycle. The loading-gate family is COMPLETE and the CQ6 pin
family is closed — the rotation's ledger turns to the remaining
recorded deferrals (the task-lists e2e leg; the F-8 toast copy; the
S160 ledger; a periodic re-probe of the reference's chrome AND
dialog surfaces — SIX consecutive families now show reference
dialog drift; the standing probes are the tripwire).

## Session 187 — the S176 cycle (Batch DZ: the events/studygroups/tasks dialog catch-up — the multi-family first-measurement sweep + the tmpfs/retry environmental postures)

The workspace was COLD (a fresh clone at `acf8ca2` — the sandbox recycled between sessions; the environment re-derived: bun install, prisma push + seed, chromium). The cold baseline reproduced the S175 close exactly (lint ✓ · tsc ✓ · unit 1733/1733) and the standing chrome held (the drawer check GREEN — the 112th consecutive; the desktop parity probe MATCH — all five structural checks).

The axis — the per-cycle dialog re-probe went multi-family: the older families' dialogs measured at the placeholder/geometry rungs for the FIRST time (events/studygroups/tasks; the subjects + holidays re-verify held with no re-drift). The findings: the events dialog's placeholder trio + the six-swatch 32px palette with the measured white+slate double-ring + scale(1.1) selection state + the repeating-ROWS reminders control + the five-option repeat select (Yearly) + the "Create Event" case; the studygroups "Group Name *"/"Description" labels + the swatch idiom; the tasks "Task name..." placeholder; the S175 subject-swatch selection-state divergence (the recorded measurement never shipped byte-exact — caught by this cycle's audit re-read). The Notes create-flow port recorded as the deferral.

The ports (TDD — the honest REDs proven at the designed markers, pre-fix build for the e2e sweep): the events-view catch-up (the placeholders + the palette + the inline-style selection state — the v4 `scale`-property trap caught by the computed-transform assert + the reminders rows with the NEW src/lib/reminder-rows.ts seam owning the row↔minutes conversion, the wire's minutes JSON untouched + REPEATS gains "yearly" with the expandOccurrences calendar-truth case) + the studygroups labels + the DZ2b subject-swatch alignment + the tasks placeholder + the 4 e2e pins (the copy pin + the DZ1b round-trip leg + the studygroups pin + the tasks pin; the S171-era pins re-anchored to the measured labels).

The unplanned fifth leg — the cert saga: the s176 sandbox escalated the freeze class to ~30s process-wide stall windows under e2e load (the watcher probe + the trace evidence; the idle machine + the no-Chromium hammer clean). Three postures: the tmpfs scratch db, the tmpfs Chromium caches, retries: 1 (the ride-out; the flaky count surfaces, no assertion weakened, every flake isolation-verified). The ledger: chunks 2/3/4/5 green (211/211 w/ 1 flaky · 101/101 · 95/95 · 89/89); chunk 1's flaky-borne green at roll 15/17 + all three files green individually — the map 654 recorded with the full flake inventory.

Gates: lint ✓ · tsc ✓ · unit 1743/1743 (52 files) · build ✓ · parity-session7 74/74 cold · the tripwire 138/138 after the lockstep (the census: unit 1733 → 1743 [+10], e2e 650 → 654 [+4], badge 2383 → 2397). Evidence: the 176-clone frames (the events dialog ×2, the studygroups dialog, the mobile drawer). Docs: README row + badge · AGENTS census + the S176 lessons (five) · CLAUDE pair · PAD v1.3.84 · the SKILL sites · the vitest header · the cert runner re-tags + the posture chain · session_224.md · this entry · the plan §10/§11 closed · .env.example re-verified.

## Session 188 — the S177 cycle (Batch EA: the notes create-flow port — the inline draft + the empty-state placement + the S178+ feature ledger)

The workspace was COLD (a fresh clone at `1e5f389` — the sandbox recycled between sessions; the environment re-derived: bun install, prisma push + seed, chromium). The cold baseline reproduced the S176 close exactly (lint ✓ · tsc ✓ · unit 1743/1743) and the standing chrome held (the drawer check GREEN — the 113th consecutive; the desktop parity probe MATCH — all five structural checks; the S176 dialog ports re-verified with NO re-drift: Events/StudyGroups/Tasks all byte-held).

The axis — the S176 plan's own B-5 deferral, closed by measuring the Notes family to FULL depth (agent-browser + playwright, computed DOM, zero residue): the reference's "New Note" opens the INLINE DRAFT editor immediately (NO dialog, NO POST until the explicit Save — no network save after 7s of typing; the X discards — no POST, no row, the pane state restored); the empty state lives in the LEFT list pane (the 80×80 tile + "No notes yet" + the measured SHORT hint + the "New Note" gradient CTA) while the right pane carries its own no-selection state ("Select a note" + "Choose a note from the sidebar or create a new one", rendered bare). The probe account was in DARK mode (the class anatomy ported, never the computed color). The never-measured surfaces recorded as the S178+ ledger: the view/edit MODE split, the PIN feature, the note COLOR palette, "Attach File", and the CODING notes (each a schema feature, one rotation apiece).

The ports (TDD — the honest REDs at the designed markers on the pre-fix build): the draft state machine + render (the title row + the notebook select + the gradient Save + the X + the Font row + the tags landing in the create POST + the DA2 hand-guard inline; the wire's NoteInput model untouched; the create-only name dialog RETIRED for notes — the notebook family keeps its own) + the empty-state placement + the six create-helper pin re-anchors (the AG6/AH1a/AH2a/AH2b + dark-mode + DP1 legs) + the hue-tokens census anchors re-anchored 784 → 871.

The unplanned third leg — the EA3b overflow regression: the no-selection EmptyState's fixed 80px tile forced a 128px min-content into the ~14px squeezed right pane at 390 (scrollWidth 431 — the reference itself overflows to 416 there, its own bug; the clone's ≤390 posture is the pinned superset). Root-caused by an in-DOM offender bisect, fixed with the md+ measured affordance + the sub-md compact fallback (the old proven text-sm copy); the strict-mode double-matches re-scoped to heading-role locators (the EA1b/EA3 + the S8 pins — the DOM shape legitimately changed).

The environmental ledger (the S176 class): the dark-mode AE3 ::before-"" flake (isolation-verified green ×7 + 2 full-spec 29/29 runs), the session8 first-roll P1008 trio (green on the re-run 72/72), the mobile AE9-13 tail timeout (isolation green ×2), the cert chunk-1 lottery (9 rolls 155-157 → 158/158 GREEN at roll 10). Every flake isolation-verified, every signature recorded, no assertion weakened.

Gates: lint ✓ · tsc ✓ · unit 1743/1743 (52 files — unchanged, no new seam) · build ✓ · parity-session7 78/78 cold (74 prior + the 4 EA pins) · parity-session8 72/72 · dark-mode 29/29 · parity-session9 40/40 · s17-fresh-user 12/12 · the cert census **658** (158+215+101+95+89 — chunk 2 first-roll 215/215 with the EA pins; chunks 3/5 first-roll; chunk 4 roll 2; chunk 1 roll 10) · the tripwire 138/138 after the lockstep (the census: unit 1743 unchanged, e2e 654 → 658 [+4], badge 2397 → 2401). Evidence: the 177-clone frames (the draft · the saved round-trip · the empty-state placement · the mobile drawer with the 390 no-overflow posture verified in-DOM). Docs: README row + badge · AGENTS census + the S177 lessons (five) · CLAUDE e2e pair · PAD v1.3.85 · the SKILL sites · the vitest header (the S177 block) · the cert runner re-tags + the mirror pin · session_226.md · this entry · the plan §10/§11 closed · .env.example re-verified (no env changes).

Next cycle. The S178+ ledger's head candidates: the view/edit MODE split (the measured record in the S177 plan §1 B-3 — the disabled title + the pin/palette/Edit/trash row + the read-only prose body; ~10 e2e pins re-anchor in its wake) or the coding-notes feature (B-7 — the language badge + the 14-option select + the textarea body). The reference re-probe cadence holds (the Subjects/Holidays + the now-current Notes ports are the standing tripwires).

## Session 189 — the S178 cycle (Batch EB: the notes view/edit mode split — the measured port + the net probe + the rum-write environmental discovery)

The workspace was COLD (a fresh clone at `d6a88a0` — the sandbox recycled between sessions; the environment re-derived: bun install, prisma push + seed, chromium). The cold baseline reproduced the S177 close exactly (lint ✓ · tsc ✓ · unit 1743/1743).

The axis — the S177 plan's own §1 B-3 deferral, closed by measuring the Notes editor's MODE SPLIT to full depth (agent-browser + playwright + the NET-SPY probe, computed DOM, zero residue): the reference's existing-note editor opens in VIEW mode (the DISABLED title + the [Edit][trash] action row + the read-only prose body — NOT a Quill instance); "Edit" switches to the edit toolbar (the inline notebook mover + the gradient Save + the X exit + the Font row + the tag row + the Quill); the X exits back to view; the trash deletes DIRECTLY (no confirm); the Save returns to VIEW. THE NET PROBE: the reference's edit typing fires ZERO calls in 7s and its X fires ZERO PUTs (a LOCAL-only exit) — the clone's autosave is the network-measured SUPERSET (the eight-cycle-old "ref discards" record corrected; the EB3 pin owns the divergence).

The ports (TDD — the honest REDs at the designed markers on the pre-fix build): the mode state + the VIEW surface (the disabled title + the [Edit][trash] row + the prose through the S140/CO1 client gate + the site-local note-content CSS) + the EDIT reshaping (the inline mover + Save + X; the MoreVertical popover RETIRES) + the ~24-block re-anchor sweep (the AH/AE/BW3/CQ3/DJ1 families + the hostile-note render-gate pin re-scoped to the prose) + the hue-tokens census re-anchor (871 → 913).

The unplanned leg — THE RUM-WRITE/BOOT-READ CONTENTION (root-caused live, honestly not fixed): the ~30s hydration-gate stall on the first exams/files/study-groups navigations post-boot (the P1008 on rumEvent.upsert queueing the boot's reads); ISOLATED by blocking /api/rum in the browser (deterministically clean); reproduced on the PRE-change tree (pre-existing — this sandbox instance); WAL, connection_limit, and the upsert-transaction experiments each live-tested then REVERTED (none cured); the S179 candidate recorded (the beacon's per-metric POST batching + the engine's write/read posture).

Gates: lint ✓ · tsc ✓ · unit 1743/1743 (52 files — unchanged, no new seam) · build ✓ · parity-session7 82/82 cold · dark-mode 29/29 · parity-session9 40/40 · resilience 48+2 flaky · navigation 66+1 flaky · theme-system 20/20 · s17-fresh-user 12/12 · accessibility 35/35 · a11y-sweep 21/21 · the 5-chunk cert at the re-tagged map 158+219+101+95+89 = 662 (chunk 1's best roll 157/158 — the AE9-13 environmental casualty; chunks 2/3/4 first-roll green; chunk 5 at roll 2; 661/662 total) · the tripwire 138/138.

Next cycle: the S179 candidates — the rum-write contention fix (the beacon batching + the engine posture), the pin/palette (B-4/B-5 — each a schema feature), the coding notes (B-7), the Attach row (B-6), the reference's toolbar deltas (B-8).

## Session 190 — the S179 cycle (Batch EC: the notes feature columns — the pin/palette/coding-note ports + the rum-batch beacon)

The cycle spanned two sessions (the sandbox recycled mid-cycle): the implementation session executed the port to the cert map on a COLD clone at `737bbe4` (the PRIOR session's in-flight S179 work had been lost to an even earlier recycle BEFORE any commit — every reference fact RE-measured by a fresh live probe, the plan written plan-first with the full measured inventory); the closing session resumed from the INTACT uncommitted tree (lint ✓ · tsc ✓ · unit 1761/1761 re-verified green post-recycle) and closed the cycle: the desktop parity probe MATCH, the evidence frames, the doc-chain lockstep, the commit + the push.

The axis — the S178 close's four-item candidate head, closed in ONE notes-family rotation (computed DOM, zero residue on BOTH accounts — the reference re-verified at 0 notes, the demo db restored to the seed state through the trash): **EC1 the PIN** (the view-toolbar 36px toggle, `fill-violet-50` pinned — VIEW-MODE ONLY, the B-8 record; the SECTIONED list — a "Pinned" uppercase slate-500 header above "All Notes", no section at zero pinned; the pinned row's violet-filled pin at the title-line right; pinned-first sorting as a client-side view sort, the wire's composite index untouched) · **EC2 the COLOR palette** (the shared 36px NoteColorButton on view/edit/draft: the 7-swatch popover with inline hex backgrounds [white default + yellow #FEF3C7 / red #FECACA / pink #FBCFE8 / violet #DDD6FE / blue #BFDBFE / emerald #A7F3D0], the current swatch border-violet-500 + scale-110; the popover STAYS OPEN after a pick — the measured reference behavior; the picked color's INLINE tint on BOTH the list row and the body card, white renders NO inline style) · **EC3 the CODING notes** (the dropdown's MIDDLE item "New Coding Note"; the 14-option Language select with the JavaScript UI initial — the schema default stays absent, the UI owns the initial; the textarea draft body — NO Quill, NO Font row, NO Divider; the saved view's language badge BEFORE the disabled title + the pre.font-mono body + the row's code-icon lead; the edit toolbar's Language select FIRST; plain code through the S140 sanitize gate byte-identically) · **EC4 the RUM BATCHING** (the S178 lesson-2 rum-write/boot-read contention candidate closed client-side: the beacon's five per-metric POSTs coalesce through the NEW pure seam src/lib/rum-batch.ts — the 1.5s flush window, flushNow on unmount/pagehide, the send rejection PROPAGATES to the caller; the route's sequential upsert loop unchanged; the s18 spec's 20s poll tolerance rides the window).

The wire layer: Note gains pinned/color/kind/language (one Prisma push; language String? nullable); the validation atoms ride the CA14 single-source vocabularies (NOTE_COLORS/NOTE_KINDS/NOTE_LANGUAGES); the import registries carry the three enum vocabularies (the BT1b third-entry-point doctrine — a hand-edited backup must not persist rows the interactive routes would 400); the export spreads full rows so the new columns flow automatically. The view surfaces: the NoteListRow + NoteColorButton extractions (the hue-tokens census anchors tripped as designed — the selected-row site moved 913 → 262 — and re-anchored).

The TDD discipline (the cycle's doctrine leg): the honest REDs PROVEN — the unit pins ran against the STASHED wire layer (9 failed tests + the rum-batch file-load failure at the designed markers), the e2e RED sweep against the pre-change standalone build with the Prisma client REGENERATED for the stash (the client is a BUILD INPUT of the bundle — a stashed schema without a regenerated client is not a pre-change tree). Two pin corrections en route (both lesson-recorded): the batcher seam propagates the send rejection (the beacon owns the silence — the pin wrongly expected the seam to swallow) and the enum family carries vocabulary entries, never length atoms (the tasks.priority precedent).

The unplanned leg — the EB3 order-dependent flake root-caused at the EVENT level: the typed title emptied right before Save, only in the full-file run order, never in isolation (the three keyboard.type-after-menuitem flows). The trace: a modal layer (scroll-lock + aria-hidden) opened between the typing and the Save — the Radix menu's exit-animation window kept the "New Note" menuitem MOUNTED and FOCUSED, so keyboard.type's SPACE re-activated it and openDraft fired a SECOND time (the draft reset). The reference carries the IDENTICAL exit-animation classes (its own Radix behavior — the parity authority), so the fix belongs at the TEST level: the deterministic menu-unmount wait (poll [role="menuitem"] gone) before any keyboard interaction after a menu pick — 5/5 consecutive GREEN after, the full sweep GREEN.

Gates: lint ✓ · tsc ✓ · unit **1761/1761** (52 → 53 files, +18: rum-batch +6, validation +4, data-import +3, enum-single-source +5) · build ✓ · **the full 5-chunk cold cert map 666/666 GREEN — FIRST ROLL, ZERO FLAKES** (158+223+101+95+89 — the first all-first-roll cert since the S176 stall class landed) · the tripwire 138/138 after the lockstep (the census: unit 1743 → 1761, e2e 662 → 666, badge 2405 → 2427) · the drawer check GREEN (**the 118th consecutive** no-Tailwind-v4-mobile-nav-bug confirmation) · the desktop parity probe MATCH (all five structural checks) · the reference account zero-residue re-verified at the close. Evidence: the five 179-clone frames (the pinned+sectioned list · the palette popover open with the selected swatch · the coding draft · the coding view with the badge + pre body · the mobile drawer), self-verifying (every frame's DOM markers asserted before the shots; the yellow rgb(254,243,199) tint verified computed on BOTH the row and the card; the non-blank pixel ratios verified). Docs: README row + badge · AGENTS census + the S179 lessons (five) · CLAUDE pairs · PAD v1.3.87 · the SKILL sites · the vitest header (the S179 block) · the cert runner re-tags (both scripts, chunk 2 219 → 223) · session_230.md · this entry · the plan §10/§11 closed · .env.example re-verified (no env changes).

Next cycle: the S180 candidates — the Attach row (B-6 — the file-upload wire feature, the last measured-deferred notes surface), the reference's toolbar deltas (B-8 — the measured record already shipped this cycle; re-probe for drift), the notes-family e2e depth (the pin/palette/coding pins rode chunk 2 — the EA/EB/EC families now 12 pins deep, a consolidation pass candidate), the standing rotation (Subjects/Holidays the next tripwire re-probe). The reference re-probe cadence holds.

## Session 191 — the S180 cycle (Batch ED: the notes Attach-File wire — the B-6 staged-upload/bind feature + the B-8 toolbar-drift port)

The cycle was executed TWICE across three sessions (the sandbox recycled mid-cycle, twice): the first implementation session completed the port to the GREEN sweep — every reference fact measured live, the plan written plan-first, the wire + surfaces implemented, the honest REDs proven at both layers — but the recycle took the ENTIRE uncommitted tree (the plan included) before any commit. The re-execution session (the operator's transcript carrying the blueprint) started from a THIRD cold clone at `cbfc8a9` and — per the standing doctrine — RE-MEASURED every reference fact live (three incremental-save probes: the wire, the chip anatomy, the view pills, the row order, the coding census, the B-8 Divider classes, the 5-option font vocabulary — all reproducing the lost record; zero residue at every probe's close) before re-executing. The cold baseline reproduced the S179 close exactly (lint ✓ · tsc ✓ · unit 1761/1761) and the standing chrome held (the drawer check GREEN — the 119th at the open, the 120th at the close; the desktop parity probe MATCH — all five structural checks; the reference re-verified at 0 notes).

The axis — the S179 close's named candidate head, closed in ONE notes-family rotation: **ED the ATTACH-FILE WIRE (B-6 — the last measured-deferred notes surface)**: the reference's measured wire is the pick uploads IMMEDIATELY on selection ({file_url} back), the Save's POST carries `attachments:[{name,url}]` as the AUTHORITATIVE DESIRED LIST, the chip X-remove is LOCAL-only (zero network — the S178 local-state family), and the saved view renders the Attachments section below the body on BOTH kinds (the coding view's sibling is the pre body). The clone's superset mapping: the NEW NoteAttachment Prisma model (STAGED rows — noteId null, the draft's upload scratch; the download url DERIVED from the id at the read boundary, never stored; the base64 data column ≤ 2 MiB — the files posture; both composites leftmost-satisfy the FK census) + the pure seam src/lib/server/note-attachments.ts (the url derivation, the id parse, the ownership-verified bind transaction — the staged join + the removal deleteMany + the foreign-row/other-note 400s, the include reads) + FOUR routes (the custom note collection/item pair REPLACING the factory pair — the GET include, the raw-split POST/PATCH bind, the Cascade DELETE; the staged multipart upload POST /api/notes/attachments — the Files POST guards verbatim on the SHARED upload budget; the FLAT download GET /api/notes/attachments/[id] — the files/[id] contract verbatim, serving staged AND bound rows) + the client layer (apiSend's FormData branch — the browser owns the boundary; NoteRow.attachments + the uploadNoteAttachment mutation) + the surfaces (the shared NoteAttachRow — the label-wrapped outline affordance + the badge-family chips + the aria-label X BUTTON superset over the reference's BARE svg; the draft/edit rows AFTER the tag rows — the measured order; the view section with the border-t strip + the heading + the bg-slate-100 paperclip pills). **ED6 the B-8 TOOLBAR DRIFT**: the Font row re-ported to the measured strip anatomy (the bg-slate-50 rounded-lg strip, the gap-2 label+select wrapper, the w-32 h-8 trigger, the h-6 w-px bg-slate-200 separator, the shadcn OUTLINE Divider — the S77 "black" record was the dark-mode computed artifact, corrected by the light-mode measurement) + EDITOR_FONTS 3 → 5 (Default/Serif/Sans-serif/Monospace/Cursive; "default" REMOVEs the font-family property).

The import/export lockstep (the BT1b doctrine): the 21st manifest collection (the export reader EXCLUDES staged rows — a staged orphan rides the export and the import's REQUIRED-FK guard 400s the user's own backup), noteAttachments.noteId REQUIRED at the import, the FIELD_LENGTHS twins with the S159/DH2 parity sources, the sanitizeImportRow files-twin block, the route MODEL map.

The TDD discipline — the honest REDs PROVEN at both layers: the unit pins against the pre-change tree (8 failed tests + the seam file-load at the designed markers); the e2e pins against the TRUE pre-change standalone — the NEW tests-stashed build mechanics (next build typechecks tests/ with the app, so the stash must carry the tests too, then restore ONLY the tests for the sweep; a RED you cannot build is not a RED), all 7 pins (AD5 + ED1-ED6) failing at their designed markers. Three unplanned legs, all root-caused: the Zod-4 .partial() default-fires lesson (the atom is .optional(), NEVER .default([]) — a defaulted atom wipes attachments on every field-scoped PATCH; the sent-key distinction lives in the RAW body), the census verified by --list never estimated (the plan's +7 folded its ED7 into ED3 — the map is 158+229+101+95+89 = 672), and the reference-login race on one parity-probe leg (the direct login diagnosis + the re-run MATCH).

Gates: lint ✓ · tsc ✓ · unit **1779/1779** (53 → 54 files, +18: the note-attachments seam +12, validation +3, import-row-guard +4, the re-anchored census pins) · build ✓ · **the full 5-chunk cold cert map 672/672 GREEN — FIRST ROLL, ZERO FLAKES** (158+229+101+95+89 — every chunk first-pass) · the tripwire 138/138 after the doc-chain lockstep (the census: unit 1761 → 1779, e2e 666 → 672, badge 2427 → 2451) · the drawer check GREEN (**the 120th consecutive** no-Tailwind-v4-mobile-nav-bug confirmation) · the desktop parity probe MATCH · zero residue on BOTH accounts (the demo db restored to the seed state through the trash; the reference re-verified at 0 notes). Evidence: the four 180-clone frames (the draft attach row + the staged chip + the B-8 strip · the saved view's Attachments section + the pill + the download 200 · the edit surface's seeded chip + the outline Divider · the mobile drawer), self-verifying (every frame's DOM markers asserted before the shots; the download payload byte-verified; the non-blank pixel ratios 46-62%). Docs: README row + badge · AGENTS census + the S180 lessons (five — the third-recycle crash-recovery posture with the mid-cycle plan-commit candidate, the Zod-4 partial-defaults wipe, the tests-stashed e2e-RED build mechanics, the list-verified census, the bare-svg a11y superset) · CLAUDE pairs · PAD v1.3.88 · the SKILL sites · the vitest header (the S180 block) · the cert runner re-tags (both scripts, chunk 2 223 → 229) · session_232.md · this entry · the plan §10/§11 closed · .env.example re-verified (no env changes).

Next cycle: the S181 candidates — the notes-family e2e consolidation (the EA/EB/EC/ED families now 18 pins deep — a depth + dedup pass candidate), the standing Subjects/Holidays rotation (the tripwire re-probe), the staged-row GC candidate (the upload-budget-bounded scratch posture documented; a sweep leg if the ledger grows), and the B-8-family audit of the remaining toolbar rows (the tag row's mb-4 vs mt-2 drift — the recorded out-of-scope posture, its own cycle if the standing probes flag it). The reference re-probe cadence holds.

## Session 192 — the S181 cycle (Batch EE: the notes tag-row family port — the B-8-family audit's remaining rows + the flex-column margin-ADD root cause)

The workspace was COLD (a fresh clone at `31d92ff` on `main` — the S180 close plus the operator's session_233 transcript commit). The environment re-derived per the standing recipe (bun install 510 pkgs, .env from .env.example at `DATABASE_URL="file:../db/custom.db"` with `db/` at the repo root, db push + seed, chromium); the cold baseline gates reproduced the S180 close EXACTLY (lint ✓ · tsc ✓ · unit 1779/1779 [54 files] · build ✓). The doc chain re-read (AGENTS/CLAUDE/README/PAD v1.3.88/SKILL + session_232/233 + the S180 plan §10 close + the worklog tail); the skills audit refreshed (the web-application rubric + the catalog; `skills/` excluded throughout). The standing chrome at the open: the drawer check GREEN (**the 121st consecutive** — oklab backdrop + 4px blur, 288px panel, 20 links, no footer, Escape-close superset — no Tailwind v4 mobile-nav bug), the desktop parity probe MATCH (all five structural checks), the reference account re-verified at ZERO residue (0 notes).

The axis — the S180 close's named candidate head, closed in ONE view-layer rotation: **EE the TAG-ROW FAMILY** (the B-8-family audit of the remaining toolbar rows — the S180 plan's recorded out-of-scope posture, "its own cycle if the standing probes flag it" — flagged by five fresh reference probes + the clone-side stack probe, all zero-residue): the tag row wrapper carried `mt-2` where the reference carries `flex flex-wrap items-center gap-2 mb-4` — and because the editor pane is a FLEX COLUMN (margins ADD, never collapse — the S16 lesson's mirror image), the clone's row stack computed **24px/0px/28px** where the reference computes **16px/16px/16px**: the tag row sat FLUSH against the Attach row (the 0px gap — the visible defect). The port: the wrapper at both sites (draft + edit) + the editor card's `mt-3` dropped (the attach row's mb-4 IS the gap; 28px → 16px) + the pill re-ported to the Badge-secondary anatomy (`px-2.5 py-0.5 text-xs font-semibold`, content-sized — neutral-800 in BOTH modes, the reference's own --secondary; the old `dark:bg-neutral-700` was a real dark-mode drift) + the input re-ported to the shared shadcn form control (`w-24 h-7`, border-input/px-3/shadow-sm — the old bespoke `w-32 border-neutral-800` shipped a near-black border in light mode) + **the ghost ADD BUTTON** (h-7 px-3, Plus size-4 → 40×28 computed — the reference's own `[&_svg]:size-4` override wins its `w-3 h-3` class by specificity): the measured FUNCTIONAL gap — the reference adds tags by button click, the clone was Enter-only; the button rides the same addDraftTag/addTag path (Enter stays). The list tile's tags container `mt-1.5 → mt-2` (the pill colors stay the AD7-recorded readable deviation). **The standing Subjects/Holidays rotation re-probed: MATCH, no drift** (the tab copy, the empty states, the Add Subject/Add Holiday dialogs — the reference's account holds no subjects/holidays; the empty states render and match the S174/S175 ports).

The TDD discipline — the honest RED PROVEN: the EE pins (6, parity-session7 after the ED block) run against the TRUE pre-change standalone (no src change yet — the standalone was pre-change by construction); all 6 failed at their designed markers, with one unplanned leg root-caused: EE1/EE4's first RED was a JSON.parse pin bug (`page.evaluate(string)` already returns the object — the S181 lesson 5; the pin was fixed and the designed-marker RED evidence is the clone probe's own pre-change 24/0/28 measurement, recorded in the plan §2.1 before any source change). The GREEN sweep: all 6 first-roll after the port (the pin's ±1px gap tolerance held — every gap read exactly 16). The unplanned port legs: the add button's icon renders 16px not 12px (the [&_svg]:size-4 specificity override — lesson 2; the 40px measured width is the proof, the class list alone would predict 36px), and the add button's `disabled={!tagDraft.trim()}` (the honest-form superset over the reference's always-enabled bare icon button).

The census: the e2e moves 672 → **678** (chunk 2 +6, verified by `--list` never estimated: 158+235+101+95+89); the unit census HOLDS 1779 (a view-layer port, no new seam — the tripwire re-anchored the doc census sites in lockstep: AGENTS/CLAUDE/SKILL/README + both cert scripts, 138/138 after the lockstep).

Gates: lint ✓ · tsc ✓ · unit **1779/1779** (54 files, unchanged) · build ✓ · the tripwire 138/138 after the doc-chain lockstep · **the full 5-chunk cold cert map 678/678** (every chunk first-roll — the chunk records in the plan §10) · the drawer check GREEN (the 121st at the open, the 122nd at the close) · the desktop parity probe MATCH · zero residue on BOTH accounts (the demo db never left the seed state — the EE pins' ee3tag round-trips locally; the reference re-verified at 0 notes). Evidence: the four 181-clone frames (the draft tag row · the edit's seeded pill + input-group · the add-button click path · the list tile's mt-2 row), self-verifying (the mb-4 wrapper + the 16/16/16 matrix + the pill 600/10px/≤24 + the button 40×28 + the input w96 + the tile mt-2 all asserted in-DOM before every shot; the frames 217-226KB at 1440×900). Docs lockstep: README row + badge (2451 → 2457) + the testing line · AGENTS census + the S181 lessons (five) · CLAUDE pairs · PAD **v1.3.89** · the SKILL census sites (all three) · the cert runner re-tags (both scripts, chunk 2 229 → 235) · `docs/session_234.md` · this entry · the plan §10/§11 closed · `.env.example` re-verified (no env changes this cycle).

Next cycle: the S182 candidates — the notes-family e2e consolidation (the EA/EB/EC/ED/EE families now 24 pins deep — the dedup pass candidate, twice deferred), the staged-row GC sweep (the ledger unchanged this cycle; a sweep leg if it grows), the B-8-family audit of the remaining toolbar rows' next tier (the reference's title-row + notebook-row re-probe — the s181 probes' titleRow leg returned null twice; a walk-up selector fix is the candidate), and the standing rotation's next family (Timetable/Files per the cadence). The reference re-probe cadence holds.

## Session 193 — the S182 cycle (Batch EF: the notes header-row family port — the B-8 next tier: the title row + the notebook row + the Files subtitle rider + the recorded S183 axis)

The workspace was COLD (a fresh clone at `1daed46` on `main` — the S181 close plus the operator's session_235 transcript commit). The environment re-derived per the standing recipe (bun install 510 pkgs, `.env` from `.env.example` at `DATABASE_URL="file:../db/custom.db"` with `db/` at the repo root, db push + seed, chromium v1243 for the pinned playwright); the cold baseline gates reproduced the S181 close EXACTLY (lint ✓ · tsc ✓ · unit 1779/1779 [54 files] · build ✓). The doc chain re-read (AGENTS/CLAUDE/README/PAD v1.3.89/SKILL + session_234/235 + the S181 plan §10 close + the worklog tail); the skills audit refreshed (the web-application rubric + the catalog + the tdd loop rules + the clone-app-pat-pro doctrine — computed styles as ground truth, adapted through the repo's own probe conventions; `skills/` excluded throughout). The standing chrome at the open: the drawer check GREEN (**the 123rd consecutive** — no Tailwind v4 mobile-nav bug), the desktop parity probe MATCH (all five structural checks), the reference account re-verified at ZERO residue (0 notes).

**The operator's mobile-navigation watch, closed with the reference's own drawer measured live through agent-browser at 390×844**: the backdrop rgba(0,0,0,0.2)+blur(4px), the 288px white shadow-2xl panel, 20 links, no footer, no email in the panel, the X-button close — **MATCH** with the clone (the oklab serialization of the same backdrop color is the documented v4 trap, not drift; the reference does NOT close on Escape — the clone's Escape-close is the recorded superset).

The axis — the s181 close's named head candidate, closed in ONE view-layer rotation (four reference probes + three clone-side probes, all zero-residue): **EF the HEADER-ROW FAMILY** (the B-8 next tier — the s181 probes' titleRow leg returned null twice; the walk-up FIX: the S182 family records the FULL ancestor chain of the title input): the title row and the notebook row are ONE header row on the reference — `flex items-center justify-between mb-4` — and the clone's two surfaces each carried FOUR measured drifts: (1) the row's **mb-4 missing** (the Font row rendered FLUSH at gap 0px vs the reference's 16px — the visible defect) + gap-2 instead of justify-between; (2) the title input — the draft's bespoke raw input missed **py-1** and the static `text-sm` hid the reference's **mobile 20px-bold title** (`text-xl md:text-sm`), and the edit's NoteTitleInput kept the base's **px-3** (a 12px text-position drift vs the reference's px 0); (3) the **Save 8px narrow** — the reference's Save icon carries its OWN `mr-2` ON TOP of the Button base's gap-2 (the measured 98 = 32+16+8+8+34; the clone computed 90); (4) the **X's border** — the draft's bespoke bordered button + the edit's outline variant both 50px/1px-border vs the reference's GHOST anatomy (borderless, px-4 py-2, 14px/500, 48×36 — the S178 "icon-only outline" record superseded by the live measurement). The port: both surfaces to the reference's row contract + the draft input re-ported to the shared Input with the reference's override tail (`border-0 px-0 text-xl font-bold focus-visible:ring-0 flex-1 min-w-0 md:text-sm` — the shared base contributes h-9/py-1/text-foreground/placeholder:muted-foreground; the bespoke slate tokens + placeholder:font-normal drop) + the ghost X on both surfaces (the aria-label supersets stay). **The rider**: the Files subtitle ports to the reference's live copy ("Store and organize your documents" — the S131-era "Your study materials" superseded; no pin asserted the old copy). **The recorded S183 axis** (measured, evidence at `docs/probe-evidence/s182/`): the Files "All Types" type-filter select — a FUNCTIONAL gap (the clone lacks it entirely), the Files breadcrumb tab anatomy (needs a state-pair measurement), the shared EmptyState family re-rotation (a 14-view shared-component rotation: the reference's px-4 + the heading's mb-2 axis + the BARE icon vs the clone's S4 gradient block), and the Timetable week-strip rows (a visibility-scoped measurement pass). The staged-row ledger re-measured at ZERO rows (the GC stays deferred).

The TDD discipline — **the honest RED PROVEN**: the EF pins (6, parity-session7 after the EE block) ran against the TRUE pre-change standalone; all 6 failed at their designed markers. The unplanned legs, all root-caused: the EF2 pin's class-slice bug (a 200-char slice hid the tailwind-merge TAIL where the per-usage overrides live — fixed to 500, never an assertion weakened); the hue-tokens register's three 408-anchors tripped AS DESIGNED (the header-row comment block added 4 lines above the site — re-anchored 408 → 412, the anchor-chain convention); a `{/* */}` JSX comment between attributes is a syntax error (the attribute position takes `//` only); the build's seven edge-instrumentation warnings verified PRE-EXISTING (the stashed pre-change tree reproduces all seven); the below-md draft header is inherently cramped (the w-80 list + the shrink-0 334px action group crush the input below ~820px — the reference's own posture; the evidence frame captured at the 765px band where the 20px-bold input stays visible).

The census: the e2e moves 678 → **684** (chunk 2 235 → 241, +6, verified by `--list` never estimated); the unit census HOLDS 1779 (a view-layer port, no new seam; the tripwire 138/138 after the doc-chain lockstep re-anchored every census site: the cert runner pair + the README badge/testing line/session row + the CLAUDE pair + the AGENTS census + the SKILL's four sites + the vitest header).

Gates: lint ✓ · tsc ✓ · unit **1779/1779** (54 files) · build ✓ · the tripwire 138/138 · **the full 5-chunk cold cert map 684/684** (158+241+101+95+89 — every chunk first-roll) · the drawer check GREEN (the 123rd at the open, the 124th at the close) · the desktop parity probe MATCH · zero residue on BOTH accounts (the demo db never left the seed state; the reference re-verified at 0 notes). Evidence: the four 182-clone frames (the draft header row + the 16px gap + the Save 98 + the ghost X · the edit header + the NoteTitleInput px-0 · the 765px below-md band's 20px-bold title · the Files header's ported copy), self-verifying (the frames 136-223KB). Docs lockstep: the README row + badge (2457 → 2463) + the testing line · AGENTS census + the S182 lessons (six) · CLAUDE pairs · PAD **v1.3.90** · the SKILL census sites (all four) · the vitest header (the S182 block) · the cert runner re-tags (both scripts, chunk 2 235 → 241) · `docs/session_236.md` · this entry · the plan §10/§11 closed · the probe evidence at `docs/probe-evidence/s182/` · `.env.example` re-verified (no env changes).

Next cycle: the S183 candidates — **the Files "All Types" type-filter port** (the measured FUNCTIONAL gap, the evidence recorded), the Files breadcrumb + the shared EmptyState family re-rotation (the 14-view shared-component pass), the Timetable week-strip rows (the visibility-scoped pass), the notes-family e2e consolidation (the EA–EF families now 30 pins deep — the dedup pass candidate, thrice deferred), and the staged-row GC sweep (the ledger at zero). The reference re-probe cadence holds.

## Session 194 — the S183 cycle (Batch EG: the Files type-filter/view-mode/move port — the S183 axis, re-derived after the reset erased the previous uncommitted execution)

The workspace was COLD — a fresh clone at `a2b7163` on `main` (the S182 close). The previous session had executed the S183 port + pins + most of the doc chain but ended BEFORE the commit; the reset erased it all, and this cycle re-derived everything from the S182 baseline (the recorded lesson: a cycle's commit is part of the cycle — uncommitted work does not exist). The environment rebuilt per the standing recipe (bun install 510 pkgs, `.env` at `DATABASE_URL="file:../db/custom.db"` with `db/` at the repo root, db push + seed, the pinned chromium v1243 re-provisioned — the fresh sandbox carried only v1200); the cold baseline reproduced the S182 close EXACTLY (lint ✓ · tsc ✓ · unit 1779/1779 [54 files] · build ✓). The doc chain re-read (AGENTS/CLAUDE/README/PAD v1.3.90/SKILL + session_236/237 + the S182 plan §10 close + the worklog tail); the skills audit refreshed (the web-application rubric + the catalog + the tdd loop rules + the clone-app-pat-pro doctrine; `skills/` excluded throughout). The standing chrome at the open: the drawer check GREEN (**the 125th consecutive** — no Tailwind v4 mobile-nav bug), the desktop parity probe MATCH (all five structural checks).

The measurement pass — NINE reference probe scripts (`scripts/probe-s183-files*.mjs`, the evidence at `docs/probe-evidence/s183/`): the toolbar row (`flex flex-col md:flex-row gap-4` — the search at `relative flex-1` with the left-3 icon + the pl-10 input, the "All Types" select at w-40 with the five measured options, the toggle strip at `h-9 w-9` with the bg-slate-100 active), the crumb state pair (the home slate-800-active / slate-500-inactive + hover:text-violet-600 + the chevron separator + PLAIN crumbs), the section labels (the "Folders"/"Files" `p.text-xs font-semibold uppercase mb-3` — `<p>`, NOT headings, so the 11 resilience `heading "Files"` pins ride), the grids (`grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3`), the file card (the ellipsis row + the View/Download/Move-to-Folder/Delete menu + the aspect-square tile with the hover eye overlay), the folder card (the violet tile at 12.5% + "N files" NEVER singularized + the Delete-only menu — the reference's own nested-button bug recorded, NOT ported), the list row (the mime tile + the `General • size • MMM d, yyyy` meta line + the eye/download-ANCHOR/MoveRight/red-trash controls), the click-moves dialog (General (Root) + every folder — the click IS the move), the View preview dialog (the inline img + the Open-in-New-Tab/Download anchors), and the MEASURED semantics: **a .txt files under Other** (the naive text/*→Documents guess measured WRONG live); **folders immune to both the filter and the search**; the filter/search state LOCAL (a reload resets it). A prior-session leftover "SubFolder" was found on the reference and removed — the account left at TRUE ZERO residue. **The 402 finding (recorded)**: the base44 platform's upload endpoint began answering 402 Payment Required after the measurement uploads — the reference's own platform quota (its own upload control latches at "Uploading…" under it — its defect, not ported); the preview dialog's exact max-width is the recorded honest gap (the plan §6.7).

The TDD discipline: the honest unit RED proven (the four missing seams — file-types, formatFileDate, moveFileSchema, previewHeaders — each failing at its designed marker: the missing module, the not-a-function, the missing schema) → the GREEN implementations (the file-types seam with the MEASURED semantics; formatFileDate the MMM d, yyyy form; moveFileSchema the required-nullable folderId — a move always names a destination, the nullableId atom alone is nullish-OPTIONAL; previewHeaders the guarded inline disposition, image mimes only — the XSS guard is the server's, never the caller's). The e2e pins: SEVEN consolidated EG pins at ELEVEN upload-budget units (the budget arithmetic designed IN — the previous session's 17-unit design had 429'd the chunk's own s14 upload pins; 11 + the chunk's existing ~8 consumers fit the demo user's shared 20/15-min POST window with margin). The honest e2e RED proven: all 7 failing at their designed markers against the pre-change standalone (two pin bugs fixed en route: the fixtures-before-goto relative fetch, the bare-name subfolder locator — the accessible name is "Open folder X").

The port (the plan §3's full map): the view (the ViewHeader actions slim to [Add Link][New Folder][Upload] with the toggle MOVED OUT to the toolbar row; the breadcrumb re-ported; the toolbar row; the sectioned content with the grid/list branch; both card anatomies with the DropdownMenu ellipses; the preview + move dialogs) + the wire (the PATCH move at `/api/files/[id]` — the write:600 budget, the ownership-rechecked destination, the metadata-shaped answer; the guarded `?inline=1` preview mode on the GET) + the supersets kept (the Add Link control, the Rename menu item over the reference's Delete-only folder menu, the toggle's aria-labels/pressed, the honest empty-state hint copy). The GREEN sweep: three pin-level fixes (the menu-item whitespace trim — the DropdownMenuItem text carries the icon's leading space; the search-state persistence across in-app navigation — the view never remounts, so the pin clears the query it set; the txt row's icon is `lucide-file`, not file-text) → **all 7 EG pins GREEN**. Two contract-preserving re-anchors: BU1's Rename access path (the hover pencil → the ellipsis menu; the prefill contract untouched — the suspected root cause of the PREVIOUS session's lost chunk-3 cert failure, now green by construction) + the hue-tokens register's S93/AT1.2 amber-tile entry (re-anchored to the sf-primary-soft tile — the accent-utility doctrine).

The census: the unit moves 1779 → **1795** (54 → 55 files); the e2e moves 684 → **691** (chunk 2 241 → 248, +7 — verified by `--list`, never estimated; the badge arithmetic re-derived from the actual chunk lists: 158+248+101+95+89 = 691, the per-chunk setup inclusion understood); the badge **2463 → 2486**. The tripwire 138/138 after the doc-chain lockstep (the cert runner pair + the AGENTS/CLAUDE/SKILL/README/vitest-header census sites).

Gates: lint ✓ · tsc ✓ · unit **1795/1795** (55 files) · build ✓ (the seven edge-instrumentation warnings pre-existing) · the tripwire **138/138** · the resilience spec **50/50 cold** (the re-anchored BU1 + the whole Files family) · **the full 5-chunk cold cert map** (the chunk records in the plan §10) · the drawer check GREEN (the 125th at the open, the 126th at the close) · the desktop parity probe MATCH · the reference at TRUE zero residue (under its own 402). Evidence: the four 183 frames (the zero-row toolbar + the sectioned grid + the list mode + the move dialog), self-verifying, under `docs/screenshots/`. Docs lockstep: the README row + badge + testing line · AGENTS census + the S183 lessons (seven) · CLAUDE pairs · PAD **v1.3.91** · the SKILL census sites (all four) · the vitest header (the S183 block) · the cert runner re-tags (both scripts, chunk 2 241 → 248) · `docs/session_238.md` · this entry · the plan §10/§11 closed · the probe evidence at `docs/probe-evidence/s183/` · `.env.example` re-verified (no env changes this cycle).

Next cycle: the S184 candidates — the shared EmptyState family re-rotation (the refreshed measurement recorded in the plan §1.12: the gradient wrapper EXISTS, the px-4-vs-px-6 + the h3-vs-h2 + the mb-2-vs-mt-4 family-wide axes), the Timetable week-strip rows (the visibility-scoped pass, the mobile anatomy already recorded), the notes-family e2e consolidation (the EA–EG families now 37 pins deep — the dedup pass candidate, four times deferred), and the staged-row GC sweep (the ledger at zero). The reference re-probe cadence holds — with the 402 upload quota now a recorded constraint.

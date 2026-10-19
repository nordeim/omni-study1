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

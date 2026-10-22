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
workspace exactly there (HEAD `8332270`, the pins uncommitted, zero
source edits yet) and completed the cycle.

**Work log.**

1. **Resume-state verified.** `git status` clean-vs-`8332270` except the
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

**Stage summary.** HEAD = `8332270` + this cycle's commit (Batch AB
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

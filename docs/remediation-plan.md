# Omni-Study1 — Remediation Plan & Execution Record

> **Status: COMPLETE.** Every batch below has been executed TDD-style
> (spec-red → fix → spec-green) and verified: **834/834 Vitest unit**,
> **298/298 Playwright e2e** (+1 auth setup), lint clean, `tsc --noEmit`
> clean, production build green with the standalone asset contract intact.
> This document is the durable record of what was broken, how it was
> diagnosed, and which standing guard now pins each fix.

---

## 1. Scope & Method

The engagement: bring the repo's clone of `omni-study1.base44.app` to
**functional superset + measured visual parity**, production-ready. The
`tests/e2e/*.spec.ts` files are the authoritative pin source — every fix was
driven by decoding its spec, surveying the live view, patching, rebuilding
with the repo build script (never bare `npx next build`), and re-running the
chunk until green. All work landed on `main` in small insurance commits,
pushed after every green batch.

Environment contract (verified each session):
- `.env` → `DATABASE_URL="file:../db/custom.db"`; `db/` at repo root;
  `src/lib/db-path.ts` re-resolves relative `file:` URLs so the runtime,
  Prisma CLI, and seed all agree.
- e2e uses its own DB (`db/e2e.db`) seeded by the Playwright config; after
  any seed change the DB file must be deleted and re-seeded (the seed
  early-returns on the existing demo user).
- `skills/` is excluded from checking, testing, and compilation.

---

## 2. Audit Findings → Remediation Batches

### Batch A–D — Chrome foundation (dark mode, theme, navigation)

| # | Finding | Root cause | Fix | Standing guard |
|---|---------|-----------|-----|----------------|
| A1 | Dark tokens were slate, spec pins zinc family | `.dark` block predated the reference palette rework | zinc token values in `.dark` | `dark-mode.spec.ts` |
| A2 | StatCard anatomy drifted (icon chip, label/hint slots) | early scaffold markup | reference anatomy rework | `navigation.spec.ts` dashboard pins |
| A3 | Sidebar footer missing clock/date/user structure | partial build | restructured footer | `s52-sidebar-collapse.spec.ts` |
| A4 | Calendar lacked the Calendar/Timeline mode switch | superset feature unbuilt | SegmentedControl-style switch + timeline pane | `parity-session8.spec.ts` S8 calendar |
| A5 | Settings tiles were card-lists, reference uses 88px tiles | layout drift | tile grid rework | `navigation.spec.ts` settings |
| A6 | Login dark bg mismatch | unpinned palette class | pinned arbitrary hex | `dark-mode.spec.ts` login |

### Batch E–G — S5 parity family (events/timetable/focustimer/calculator/files/notes/gradetracker/AI)

| # | Finding | Root cause | Fix | Standing guard |
|---|---------|-----------|-----|----------------|
| E1 | Events lacked description E2E (schema→API→dialog) | model field missing | `Event.description` end-to-end + dialog field | `parity-session5.spec.ts` S5-B |
| E2 | Calculator keypad anatomy wrong (`%` key present, AC half-width, U+2212 minus aria) | drift from reference | keypad rework: no `%`, AC `col-span-2`, ASCII "Insert -" aria | `calculator.spec.ts` + S5-H |
| E3 | Calculator display not a single labelled 36px expression→result line | two unlabelled lines | `aria-label="Calculator display"` container rework | `calculator.spec.ts` |
| E4 | FocusTimer stats row + 48px timer + 64px play missing | unbuilt superset | stats row + sizing | S5-F/G |
| E5 | Files breadcrumb/grid-toggle/add-link missing | unbuilt | toolbar + link dialog wired to `POST /api/files/link` | S5-I/K |
| E6 | Notes tag filter combobox missing | unbuilt | tag combobox fed by `Note.tags` | S5-L |
| E7 | GradeTracker gradient stat / AI quick-action cards missing | unbuilt | reworked | S5-M/N |
| E8 | `hydrated()` gate returned before React attached (boot script sets `--sf-primary` pre-hydration) | gate keyed on a pre-paint variable | **two-layer gate**: shell-level `data-app-hydrated` (status-gated: fires only when the authed shell renders) + calc-specific `data-calc-kb` | all 4 calculator.spec tests |
| E9 | Dialogs POST `""` for cleared IDs → 400 | Prisma `idField.nullish()` rejects `""` | union-based atom on every nullable ID field (`""`→null) | S6 dialog flows |
| E10 | Button outline variant shadow/color drift | v4 palette drift | `border-neutral-200 text-neutral-950 shadow-xs` + dark overrides | S5-D |

### Batch H — S6 parity family (populated-state seed + tasks/exams/calendar/myday/assignments)

| # | Finding | Fix | Guard |
|---|---------|-----|-------|
| H1 | Seed contract gaps (priority/important flags, vectors/weekly-review/PS6/quiz rows) | seed reworked to the S6 contract | S6 populated-state |
| H2 | Assignments rows aria + blue-50 due pill; exam `div` cards + amber-600 badge + two aris | view reworks | S6-A/D |
| H3 | Calendar legend + day-detail panel with blue task rows + `data-today="true"` | built | S6-G |
| H4 | MyDay Suggestions renders suggested tasks | built | S6-F |

### Batch I–K — S7/S8 parity (flashcards/studygroups/practicetests/timetable/analytics + shell)

| # | Finding | Fix | Guard |
|---|---------|-----|-------|
| I1 | StudyGroup.color missing E2E | schema→validation→dialog swatch end-to-end | S7 color test |
| I2 | PracticeTests AI Generate Questions not wired | dialog → `POST /api/practicetests/:id/generate-questions` (persist:draft) | S7 |
| I3 | Timetable Week grid / hour-cell split / class blocks not absolutely positioned | `button.absolute` day-cell rework (keeps S7-C hour-label pin) | S7-C + S8-E |
| I4 | Analytics 250px donut / workload / priority chips / "(Last 7 Days)" titles | rework | S7/S8-I |
| I5 | Shell hydration marker fired on the LOADING commit → nav svg probes raced the auth gate | status-gated marker (fires only after the authed shell renders) | S8-A |
| I6 | Exam cards were `<article>`s where the chain expects `> div` | converted | S8 |
| I7 | `sf-card` border drift (slate-200), `sf-softest-tint` missing | utility added | S8 |

### Batch L — S9 parity (14 fixes)

Overdue banner copy, MyDay amber CTA, calendar weekday spans, files grid3x3
toggle, assignments filter label + pills split, analytics focus line path +
hour ticks, focustimer stat/mode icons, settings tab icons, notes combobox
icons, flashcards deck-row menu (hover menu rework), AI wand-sparkles icon,
studygroups hint, `SimpleEmptyState` slim icon. Guard: `parity-session9.spec.ts` (26/26).

### Batch M — RUM / export / import superset (s18–s23)

| # | Finding | Fix | Guard |
|---|---------|-----|-------|
| M1 | `/api/rum` routes missing | GET aggregate + POST batch upsert + CSV export | s18/s20 |
| M2 | RUM panel missing recent-samples table + mount load; trend bucket needed the day's NEWEST sample | built/fixed | s19 |
| M3 | `/export` page missing | server-gated page (the `/rum` pattern): count grid + Download JSON + Restore card | s21 |
| M4 | `POST /api/import/data` missing | upsert-by-id, transaction rollback, FK validation, deck-scoped flashcards | s23 |
| M5 | Import chips rendered raw keys | human labels in their own elements | s23 |

### Batch N — Account security superset (s24–s26)

| # | Finding | Fix | Guard |
|---|---------|-----|-------|
| N1 | Change-password / delete-account / change-email routes existed but the UI cards were absent | Profile tab additive chain: **Email address → Change password → Danger zone** (`section[aria-label=…]`, two-step destructive reveal, inline alert/status roles) | s24/s25/s26 round-trips |
| N2 | 409 duplicate-email copy mismatch | "An account with this email already exists." | s26 guards |
| N3 | Profile tab missing the pinned intro copy | "Your account and study information." | s24/s25/s26 |
| N4 | Email change did not update the live identity surfaces | store `setEmail` + `onEmailChanged` (sidebar footer + Profile identity block re-render) | s26 live-slice |
| N5 | EmailCard identity line was a `<p>` containing the email → strict-mode collision with the Account card `<p>` | identity line demoted to `<div>` | s26 |
| N6 | **Login limiter never reset on success** (3 specs document "successful logins RESET the IP limiter"; the 11th suite login 429'd) | `resetRateLimit` on successful credential verification (progressive throttling) | s24–s26 chunk + auth specs |

### Batch P — Full-regression residuals

| # | Finding | Root cause | Fix | Guard |
|---|---------|-----------|-----|-------|
| P1 | theme-system mobile-chip locator resolved to the hidden desktop header | the S8 softest-tint header put the `bg-sf-primary-soft` substring on `dark:bg-sf-primary-soft-dark/30`; DOM order made the hidden element win | locator upgraded to the exact class token `div.bg-sf-primary-soft` | theme-system 12/12 |
| P2 | StudyGroups right-pane hint conflict (S8-H pins "Select a group", S9-S pins the full reference sentence) | two sessions pinned different wordings | superset copy "Select a group — choose a study group from the sidebar or create a new one" | S8-H + S9-S |
| P3 | dark-mode:159 computed `oklab(...)` instead of rgb | the `/30` opacity modifier on a theme color emits `color-mix(in oklab)` | `sf-today-tint` utility restored (light violet-50 softest + raw-rgb dark branch) — one class satisfying the oklab serialization, forced-colors outline, and exact-token pins | dark-mode + accessibility + theme-system |
| P4 | s52 drawer flow found no "Notes" heading at 390px | the mobile h2 rendered only in the selected-note branch | hoisted to the right-pane top (every notes-present state) | s52:161 |

### Batch Q — Session-56: the lost S17 batch + full-regression residuals

The s17 specs survived every workspace reset but their implementation
batch did not; a re-verification pass from a fresh clone surfaced them
(along with three more residuals the recorded final gates had missed).

| # | Finding | Root cause | Fix | Guard |
|---|---------|-----------|-----|-------|
| Q1 | Seven empty-state hint families drifted from the measured copy (assignments/exams/flashcards/practicetests/files + the tasks filter-variant hint fired on load because `status` defaults to "active") | specs committed, implementation lost in a reset | reference copy restored verbatim; tasks hint no longer counts the status filter | `s17-fresh-user.spec.ts` (6/6) |
| Q2 | Analytics zero-state sub-captions missing ("avg progress", "total study hours", "exams scheduled", "No subject data yet") | same | StatBlock subs carry the measured phrasing | s17-D |
| Q3 | GradeTracker rendered a "No grades yet" EmptyState the reference never shows; "Highest Grade" 0% collided with the exact-"0%" pin | same | zero grades render the stat cards only; Highest Grade shows "—" at zero | s17-E |
| Q4 | Settings depth: Appearance intro, Subjects/Holidays per-tab headers + zero-empty copy, School placeholder "Your school...", "Daily Study Goal: N hours" readout, "Account created:" line | same | built into the existing cards | s17-A/C |
| Q5 | Notifications tab was a placeholder (no master-toggle structure, no Save flow) | same | intro + "Enable Notifications" h3 + reminders line + local-state Switch + Save Preferences (PATCH + toast + reload-persist); remount-key resync instead of a setState-in-effect | s17-B |
| Q6 | StudyGroups zero-state: the dash-joined placeholder failed the exact-"Select a group" pin; the right pane showed no placeholder at zero groups | superset copy joined two pins into one text node | placeholder split into two spans; visible above the empty state in both panes | s17-G + S8-H + S9-S |
| Q7 | S16 auth sub-screens: h2 24px (reference 20px at <sm), back link at the bottom (reference: above), gaps unmeasurable | desktop values shipped | `text-xl sm:text-2xl`; back link moved above (verify: 12+44+12+8=76px; forgot: 20+8=28px — the link is `block` so no line-box descender); mathsolver `accept="image/*"` + "Please choose an image file" guard | s16 + resilience A3 |
| Q8 | **The RUM beacon never fired** — `document.cookie.includes("sf_session")` can never match an httpOnly cookie | the gate was unwritable from JS | gate removed; auth gating lives at the authed-shell mount point | s18 (polls the aggregate) |
| Q9 | sf-today-tint collapsed two different light pins (S8-E header violet-50 vs S8-C cell violet-100) into violet-50 | one shared utility for two surfaces | `sf-today-cell-tint` (light `--sf-primary-empty` 237 233 254, shared raw-rgb dark branch) | S8-C + dark-mode S10 |
| Q10 | s18 beacon sleep + skip-link fixed-focus sleep raced cold-start hydration | fixed sleeps | bounded polls on the pinned condition (assertions unchanged) | s18 + S12-B |

---

### Batch R — Session-61: the first real-audit pass (Lighthouse) on the production bundle

The session-7 transcript's suggested next step — a Lighthouse/perf pass —
had never been run; every prior gate was spec-driven, and the specs' own
blind spots (semantic-DOM quality, computed contrast, landmark structure)
are exactly what an audit engine sees. First-ever runs, `/login` and the
authed `/` (cookie-injected), production standalone on :3200.

**Before → after (Lighthouse 13.5, desktop):**

| Surface | Perf | A11y | Best-Practices | SEO |
|---------|------|------|----------------|-----|
| /login before → after | 93 → 94 | 94 → **100** | 96 | 100 |
| / (dashboard) before → after | 76 → 75 | 90 → **100** | 96 | 100 |

| # | Finding (Lighthouse) | Root cause | Fix | Guard |
|---|---------|-----------|-----|-------|
| R1 | `heading-order` — the dashboard h1 was followed by h3s (the overdue banner title, then the StatCard values) | semantic headings were added over sessions without a whole-page level audit | banner title h3→h2 (dashboard-view) + StatCard value h3→h2 (shared.tsx) — class-identical tag swaps, zero visual delta; the three pinned level-3 assertions updated with justification comments (parity-session9 ×2, dark-mode ×1) | accessibility Family E: no heading level may skip downward on /Dashboard |
| R2 | `color-contrast` — the StatCard hint `text-slate-400` on white = 2.56:1 (AA needs 4.5) | reference-measured muted token (the reference itself fails AA here); no spec pinned the color (S4-B pins size/margin only) | one step darker: `text-slate-500` = 4.76:1, dark branch untouched (was already slate-500); the same fix on the GradeTracker stat hint | Family E: every `main .sf-card p.mt-1` reads rgb(100,116,139) |
| R3 | `color-contrast` — the overdue pills `text-red-600` on `bg-red-100` = 3.95:1 at 12px | same class of reference-measured token | `text-red-700` = 5.32:1 on the dashboard exam badge + the shared DuePill overdue variant; dark branch untouched | Family E: every `main span.bg-red-100` reads rgb(185,28,28) |
| R4 | `aria-prohibited-attr` — `aria-label="Notifications"` on the roleless toast viewport div | aria-label needs a supporting role | `role="region"` (the radix-toast viewport pattern) | Family E: the viewport is a named region with aria-live polite |
| R5 | `landmark-one-main` — the standalone auth surface had no `<main>` | the auth page root was a div (the authed shell's main#main-content made the suite assume "main ⇒ shell") | login-surface root div→main + both Suspense fallbacks (login/reset-password pages) | Family E: exactly one main on /login |
| R6 | **The R5 fix broke four specs indirectly** — s16/s24/s25/s26 waited for `querySelector("main") !== null` after signing in through the login UI; the login page's own new `<main>` resolved the wait before the post-login redirect, so the next goto raced it and died `net::ERR_ABORTED` (S16-A twice in chunk runs, S26 once; both green solo) | a spec proxy (`main exists` ⇒ authed shell) that a legitimate semantic fix made ambiguous | all four waits target `main#main-content` (the shell's skip-link anchor) with the race documented | the four hardened waits + AP-102 |

Perf (documented, not "fixed" — structural): dashboard LCP 3.3s / TBT
700ms / SI 1.2s / CLS 0.00 under the desktop preset; the cost is the
client-component bundle (top wasted chunks 83/27/24 KiB) — the honest
remedy is a staged RSC conversion of the read-only views, out of scope
for a parity session; the repo's own `scripts/cwv-audit-s16.mjs` +
`cwv-volume-stress.mjs` already track these budgets against the
reference's measured anchors. Reports: `docs/lighthouse/` (before/after
pairs, JSON + HTML).

**Gates on the remediated bundle:** lint ✓ · tsc ✓ · unit 837/837 ✓ ·
e2e **306/306** cold (156 + 95 + 55 — the 301 plus the five Family E
pins) · build REAL_EXIT=0 ✓ · Lighthouse re-audit: both surfaces a11y
100.

### Batch S — Session-62: the Lighthouse-equivalent sweep across ALL 20 authed views

Session 61 audited the two surfaces Lighthouse can reach by URL; the
other views are client-switched inside the single-route shell. Family F
(`tests/e2e/a11y-sweep.spec.ts`) runs Lighthouse 13.x's exact axe rule
table (tags wcag2a+wcag2aa + the 28-rule overlay, mirrored from the
13.5.0 gatherer source) on every authed view — Lighthouse-equivalent by
construction, with the Dashboard test as the equivalence anchor. First
run: **17 of 20 views failed with 35 violations** — the same defect
classes as Batch R, at ten times the scale, plus a genuinely functional
ARIA bug. All fixed TDD-style; the sweep is now a permanent gate.

| # | Finding (axe, Family F first run) | Root cause | Fix | Guard |
|---|---------|-----------|-----|-------|
| S1 | `color-contrast` ×~45 nodes — muted meta text `text-slate-400` on white (Notes card dates, GradeTracker weights, PracticeTests dates, Timetable day cells, Events "No events." on the dark panel) | the Batch R2 fix darkened the dashboard/GradeTracker stat hints; the same reference-measured token survived on every non-audited surface | one step darker per the R2 recipe: light `slate-400`→`slate-500` (4.76:1); on the Events dark panel one step lighter `slate-600`→`slate-400` (6.9:1 on slate-900); dark branches untouched | Family F pins zero violations on every view |
| S2 | `heading-order` ×9 — h1→h3 skips (Flashcards/PracticeTests/StudyGroups/Files/Exams/Assignments/Settings×13/Events panel/Notes/GradeTracker/Analytics stat values, AIAssistant role="heading" aria-level 3) | the R1 swap fixed the dashboard only; every view repeated the pattern | class-identical tag swaps h3→h2 (AIAssistant aria-level 3→2); zero visual delta | Family F heading-order |
| S3 | `color-contrast` — white on `sf-selected-tint` (violet-500) = 4.23:1 (Calendar cells + mode switch, Settings tab, Timetable selected) | the brand selected-fill is a SOLID color — axe resolves it; the violet CTAs are GRADIENTS — axe reports "incomplete" (unscored), which is why 61 sessions of Lighthouse never saw it | the utility's bg moved to `--sf-primary-strong` (violet-600, 5.70:1); `--sf-primary` itself unchanged; five pinned values updated with justification (S8-C ×2, S6-G, S5-G, S9-F) | Family F + the updated pins |
| S4 | `color-contrast` — status badges: exams amber/orange/red 600-on-100 pairs, the calculator clear key red-600 | same reference-measured badge tokens as R3 | one step darker: red/orange/amber 600→700 on the light branch (dark 300/950 branches untouched); the pinned amber-600 (S6) and orange-600 (S9-J) values updated | Family F + updated pins |
| S5 | `aria-prohibited-attr` — `aria-label` on roleless divs (MyDay's 56px sun block, the Exams subject color strips ×4) | aria-label needs a supporting role | `role="img"` on both (image-like indicators); the pinned locators keep working | Family F |
| S6 | `aria-input-field-name` ×6 — the assignment Slider thumbs (`role="slider"`) had no accessible name; the label was parked on the Root span | the shared Slider component forwards aria-label to Root, but radix puts role="slider" on the THUMB | slider.tsx now forwards `aria-label` to the Thumb | Family F |
| S7 | `aria-valid-attr-value` [critical] — every Calculator tab trigger's `aria-controls` pointed at a panel id that never rendered | the triggers and the TabsContents lived in TWO separate `<Tabs>` roots, so radix minted mismatched id families in each tree — screen readers announced tabs controlling missing panels (a functional defect, not cosmetic) | merged into ONE `<Tabs>` root (radix Tabs.Root renders no DOM — byte-identical output); plus the inactive-trigger contrast 4.38→6.87 on `bg-muted` (explicit slate-600 inactive class) | Family F |
| S8 | `label-content-name-mismatch` ×3 — "Create event" vs visible "New Event" (Events ×2), "Filter tasks"/"Filter assignments by status" vs the visible status word, the calculator "AC" key | the accessible name must CONTAIN the visible text; axe additionally strips parentheticals from the name before matching, so "Clear (AC)" still fails | dropped the mismatched aria-labels (visible text wins), made the filter labels dynamic (`Filter tasks: All`), renamed the key "Clear: AC" | Family F |

**Verified:** Family F 21/21 green; full cold re-certification **326/326**
(176 + 95 + 55 — the 306 plus the twenty sweep pins); lint ✓ tsc ✓
unit 837/837 ✓; build REAL_EXIT=0 ✓; Lighthouse re-audit: /login
P100·A11y 100, dashboard P98·A11y 100 (perf = run-to-run variance on the
documented structural debt). Evidence: `docs/lighthouse/62-*.json`,
`docs/screenshots/62-*.png`. Eight pinned values were updated in-place
with justification comments (the R1/R3 precedent) — every one a
class-identical or one-step-darker deviation in the documented
a11y-superset direction.

### Batch T — Session-63: the live-clock greeting + the 5-view reference drift sweep (Events/Timetable/Assignments/Exams/MyDay)

An 8th workspace reset forced a full environment rebuild (npm ci, prisma,
`.env`+seed, build, chromium, the SSH-infra venv). After re-certifying all
gates cold (the record now 326/326), the drift sweep moved to the five
never-compared views — and found the reference account's clock state
(~19:00 UTC) exposing a defect 63 sessions of UTC-morning runs had masked:
the clone's greeting froze at "Good morning" while the reference rendered
"Good evening" at the same wall clock. The same sweep re-measured five
views against the live reference; every finding below was probe-verified
on the reference (not inferred) before fixing.

| # | Finding (reference-measured 2026-10-18) | Root cause | Fix | Guard |
|---|---------|-----------|-----|-------|
| T1 | The dashboard h1 + MyDay's zero-task amber heading read **"Good morning" at every hour**; the reference rendered "Good evening, sepnetflix2023 👋" (dashboard, 19:08) and **"Good evening!"** (MyDay empty state, 19:11) at the same clock | both call sites fed `greetingForHour` the DAY-ANCHOR `today = startOfDay(new Date())` — whose `getHours()` is always 0 — present since the original implementation (`7b1e78d`); the sandbox clock runs UTC and nearly every session ran in the UTC morning, so the frozen bucket looked correct | the views now call the new `currentGreeting()` (reads the LIVE clock); the day-anchor stays for day-relative logic where it belongs | `tests/e2e/greeting-clock.spec.ts` (Family G): `page.clock.setFixedTime` pins all three buckets on the dashboard h1 + the MyDay evening empty state — deterministic at any wall-clock hour; unit pins on `currentGreeting` incl. the startOfDay trap |
| T2 | Events' **CW label reads ISO 8601 (42)**; the reference rendered **"CW 43"** on Sun 2026-10-18, and its header carousel stepped to Sat 10-17 → "CW 42" — the US week-of-year convention (Sunday-start, week 1 contains Jan 1) is the only rule producing both | the clone assumed ISO when it added the reference-matching label; ISO vs US only diverges across a Sunday, so mid-week probes never caught it | new `referenceWeekNumber()` in date.ts (documented, unit-pinned incl. the ref-measured pair); the Events panel uses it | Family G-adjacent pins in S5-B: "CW 43" clock-pinned at 2026-10-18 |
| T3 | Events' day-group headings read **"Tue, Oct 20"**; the reference renders **"Tuesday, October 20"** (full weekday + full month) | the clone's `Intl.DateTimeFormat` used `weekday/month: "short"` | one-line format change | S5-B pin: the full-format heading |
| T4 | **The Timetable grid misaligned weekday labels vs dates**: the header range read "Oct 12 - Oct 18" (Monday-start) while the columns rendered Sunday-first labels — "Sunday 12" for a Monday, and the today-tint landed on the column labeled "Saturday 18"; the reference's week is Sunday-start: "Oct 18 - Oct 24" with today FIRST | `weekStart` was Monday-anchored (`(getDay()+6)%7` back) while `DAY_NAMES[columnToIso(col)]` labels columns Sunday-first — two conventions meeting in one header; the mobile accordion's initial open day used the same ISO-index math | one root fix: Sunday-anchored `weekStart` (`today.getDay()` back) aligns range, dates, today-tint AND the mobile accordion; storage semantics (`dayOfWeek`, 0=Monday) untouched — class chips were always on the right columns | S5-J pin: clock-pinned "Oct 18 - Oct 24" + the Sunday head carrying "18" |
| T5 | The three view subtitles were **clone-invented copy never pinned**: Timetable "Your weekly class schedule.", Assignments "Track your coursework and progress.", Exams "Your upcoming exams and assessments."; the reference reads "Manage your class schedule" / "Track your homework and projects" / **a live count "<n> upcoming · <m> this week"** ("0 · 0" probed on the empty account; create-a-probe-exam measured tomorrow → "1 upcoming · 1 this week") | invented copy from early sessions; no spec asserted it | subtitles replaced with the measured strings; the Exams subtitle computes live counts from the FULL list (upcoming = `daysUntil ≥ 0`, this week = `≤ 6`) | S5-J + S8-P pins on all three strings |
| T6 | The Exams header had **no status filter**; the reference carries **All Exams / Upcoming / Past** (default Upcoming — probed by opening the control) | a functional gap the header-chrome pins never covered | a Select (radix, `aria-label="Exam filter"` on the TRIGGER per the Week-filter pattern) filtering `sorted` before search; the seeded 4-upcoming data keeps every existing exam pin green | S8-P pin: the three options + default |
| T7 | The search placeholders used "…" or none; the reference uses three dots ("Search exams...", "Search assignments...") | cosmetic drift, unpinned | placeholder strings aligned (aria-labels untouched — the pins key on those) | covered by the S8-P subtitle test run |

**Deferred with measured evidence** (structural, Batch-R-style honest
debt): the reference's Events header is a DAY-FOCUS carousel (unnamed ‹ ○ ›
∨ controls; the CW + big date track the focused day; the day list re-anchors
to it) — a real interactive restructure, not a one-line alignment; the
reference's Timetable carries a centered month/week banner ("October 2026 /
Oct 18 - Oct 24") between header and grid; its Assignments header carries a
second select (subject filter: "All Subjects" + dynamic subject options —
empty on the current account). All three are recorded here with their
probes so the next session can implement against facts, not guesses.

**Verified:** the 7 new pins RED-first (7 failed / 56 passed in their
chunks), then GREEN; full cold re-certification **184 + 98 + 55 =
337/337**; lint ✓ tsc ✓ unit **842/842** ✓ (839 + the 3
`referenceWeekNumber` pins); build REAL_EXIT=0 ✓; live screenshots
`63-clone-desktop-{Events,Timetable,Assignments,Exams}-fixed.png` +
`63-clone-desktop-dashboard-evening-greeting.png` vs the
`63-ref-desktop-*.png` probe set.

### Batch U — Session-64: the three Batch-T deferred structural drifts (Events day-focus carousel, Timetable week banner, Assignments subject filter)

A 9th workspace reset (fresh clone at `38fd29e`) forced the full
environment rebuild again; the received state was re-certified cold first
(unit 842/842, e2e 337/337, lint/tsc/build). Then the three drifts Batch T
deferred WITH their probes were implemented — each re-measured on the live
reference before writing code (fresh probes 2026-10-18/19: the carousel
step semantics, the banner's month convention across a month boundary, the
two selects' options and the reference's two-row Assignments header).

| # | Finding (reference-measured 2026-10-18/19) | Root cause (clone) | Fix | Guard |
|---|---------|-----------|-----|-------|
| U1 | The Events header is a **DAY-FOCUS carousel**: four unnamed controls (‹ ○ › ∨, lucide size-4 in h-6 w-6 ghost buttons, `text-slate-400 hover:text-white hover:bg-slate-800`) step the focused day; the big date (text-4xl/700), the weekday abbrev ("Sun", text-lg/500) and the **"Oct 2026 CW 43"** line (ONE slate-400 p, short month) all track the FOCUSED day; the 7-day list re-anchors to it (focused + 6) while Today/Tomorrow stay anchored to the REAL today (stepping back to Sat Oct 17 rendered "Saturday, October 17" first, then "Today"); the New Event button is a FULL-WIDTH cyan row (h-9) at the strip's bottom, under a slate-700 divider | the header had no controls and stacked overline/big-date/long-month with CW + a cyan text link on the right; `windowDays` was today-anchored forever; `dayLabel` keyed relative labels on the list INDEX (window[0] = "Today"), which mislabels any re-anchored window; the page-level gradient New Event CTA was clone-invented (the ref's page header is title + subtitle only) | `focused` state (default today) + the four controls (aria-labeled — the a11y superset; the ref's are unnamed) + `listOpen` toggle (∨ collapses the list, chevron rotates, `aria-expanded`); big-date row + CW track `focused` (`referenceWeekNumber(focused)`); `dayLabel` derives relative labels from `daysUntil(day, today)` and falls back to `formatWeekdayMonthDay` (no year); window = `focused + 6`; measured 3-row strip (overline+controls / big date / full-width cyan New Event) with the `border-b border-slate-700` divider; page CTA removed | S5-U1 (4 pins, clock-pinned at 2026-10-18: controls' names, the 17/Sat/CW 42 step + re-anchor + real-today relatives, the ○ jump home, the short-month line + the long-month absence) |
| U2 | The Timetable carries a **centered month/week banner** between header and grid: a white card (`rounded-xl p-4 shadow-sm border-slate-100`, `flex items-center justify-between`) holding [‹] [h2 "October 2026" (font-semibold text-slate-700) + p "Oct 18 - Oct 24" (text-sm text-slate-500)] [›] — the week nav lives INSIDE the banner (36px chevrons at the card's padding edges); the h2 reads the week's **FIRST-DAY month** (the spanning week Sep 27 - Oct 3 rendered "September 2026", probed by stepping ‹ ×3); the chevrons compute a **6px radius** (`rounded-md`) | the clone's chevrons + range label lived in the page header row (the ref's header row holds only All Weeks / Grid Builder / Add Class); no banner; the old S8-E pin expected an 8px radius — it had encoded the clone's own `rounded-lg` drift, not the reference | the nav moved into the new `aria-label="Week banner"` card (`role="group"`); h2 = `Intl.DateTimeFormat("en-US", {month:"long", year:"numeric"}).format(weekStart)`; the S8-E pin re-measured and updated 8px → 6px WITH the justification (never weakened — corrected to the reference-measured value) | S5-U2 (2 pins: banner content + nav inside; the month-boundary convention) + S8-E (updated, justified) |
| U3 | The Assignments header is **TWO rows**: [h1 + subtitle \| Add Assignment] then [search flex-1 (604px @1440) \| status select w-160 \| subject select w-160]; the status control is a **SELECT** (radix trigger, h-9) whose options read **All / Active / Completed** (that order, probed); a **subject filter** lists "All Subjects" + the user's subjects (the ref's account has none — its list was "All Subjects" alone; its dialog's own subject select was empty, the options derive from the account's Subject entities) | the clone crammed search (w-48) + a status DropdownMenu BUTTON (Filter icon) + Add Assignment into one row; no subject filter existed | two-row restructure (search `flex-1`, both selects `w-full md:w-40`); status DropdownMenu → Select keeping the `Filter assignments by status: …` aria-label (the S9-I prefix pin survives) with the measured option order; new `aria-label="Subject filter"` Select ("All Subjects" + `subjects` from the store) filtering `filtered` by `a.subjectId` before status | S8-U3 (3 pins: the filter + options; Mathematics → exactly the 2 seeded active math rows and All Subjects restores; the status select + option order) |

**Verified:** the 9 new pins RED-first (9 failed / 1 setup passed), then
GREEN; the S8-E radius pin re-measured (6px) — one committed pin updated
with its justification; full cold re-certification **190 + 101 + 55 =
346/346**; lint ✓ tsc ✓ unit **842/842** ✓; build REAL_EXIT=0 ✓; live
verification on the production standalone (step 17/CW 42 + re-anchor,
banner "September 2026" across the boundary, Mathematics → 2 rows) with
captures `64-clone-desktop-{Events,Events-carousel,Timetable-banner,
Assignments-filter}.png` vs `64-ref-desktop-{Events,Events-banner,
Timetable,Assignments}.png`.

## 3a. Verification (session-56 re-run, from a fresh clone)

| Gate | Result |
|------|--------|
| lint / `tsc --noEmit` | clean |
| Vitest unit | 834/834 |
| Playwright e2e (final bundle, cold server + fresh DB per chunk) | **301/301**: chrome+S5/calc/S6 149 · S7–S9+tasks/resilience/s16/s17 98 · auth+s18–s26 54 |
| build (repo script, REAL_EXIT) | green |
| Screenshots | +13 session-56 captures (settings tabs, analytics/gradetracker zero states, studygroups mobile, auth signup mobile, calendar) |

---

## 3. Verification (final)

| Gate | Result |
|------|--------|
| `npm run lint` | clean (0 errors, 0 warnings) |
| `npx tsc --noEmit` | clean |
| `npm run build` (repo script, REAL_EXIT verified) | green, standalone assets copied |
| Vitest unit | **834/834** |
| Playwright e2e (6 chunks) | **298/298** + setup |
| Screenshots | 34 captures in `docs/screenshots/` (desktop views, settings profile chain, mobile set incl. drawer) |
| Pushes | every green batch committed & pushed to `main` (no branches) |

The known-good chunk map (all green on the final pass): chrome+s14 104/104 ·
S5+calc+S6 46/46 · S7+S8+S9 79/79 · tasks/resilience/s16/s17 20/20 ·
auth+s18–s23 35/35 · s24–s26 18/18.

---

## 4. Standing Lessons (the traps that keep biting)

1. **`BUILD_EXIT` from a tail pipeline is untrustworthy** — verify `REAL_EXIT`
   independently; use the repo build script (standalone asset copies).
2. **Tailwind v4 opacity modifiers on theme colors serialize as
   `color-mix(in oklab)`** — for any computed-style assertion, ship a raw
   `rgb(var(--x) / a)` arbitrary value or a utility with a raw dark branch.
   Unpinned palette classes read back as `lab()`.
3. **A wait condition satisfiable pre-mount is not a gate for post-mount
   reads** — the two-layer hydration gate (`data-app-hydrated` status-gated
   on the authed shell, plus feature-specific markers) exists because the
   boot script satisfies naive gates at first paint.
4. **Seed early-returns** — after any seed edit, delete the e2e DB and
   re-seed, or the old rows silently persist.
5. **Prisma nullable-ID fields reject `""`** — dialogs send cleared IDs as
   empty strings; the union-based atom hardening converts them to null.
6. **Script idempotency** — every scripted insertion needs a SKIP guard that
   actually matches (a typo'd guard duplicates rows); verify script effects
   with boolean-only checks after any re-run.
7. **Spec locators must be exact-token when a substring can leak across
   states** — the `bg-sf-primary-soft` substring matched a hidden desktop
   header via its dark variant; `div.bg-sf-primary-soft` cannot.
8. **Progressive throttling** — successful logins reset the IP limiter; only
   failures consume budget.
9. **Stale standalone servers hold ports** — the process is
   `bun .next/standalone/server.js`, not `next start`; kill by PID before
   letting the Playwright config boot its own server. (Session-63
   refinement: Next RENAMES the process title to `next-server (vNNN)` —
   `/proc/<pid>/cmdline` no longer contains the script path, so
   `pkill -f "standalone/server.js"` silently matches nothing and the
   stale server survives every cleanup while the new boot dies
   EADDRINUSE in a log nobody reads; `pkill -f next-server` or kill by
   the port-owner PID.)
10. **Display phantoms are real** — stdout/Read can eat `[h`/`[m` byte
    sequences; verify with `od -c` before "fixing" corrupted-looking source.
11. **A day-anchor is the right input for day-relative logic and the
    WRONG input for time-of-day logic** — `startOfDay(new Date())` is the
    correct "today" for due-date math and the wrong "now" for greeting
    buckets: `getHours()` on it is always 0. Sixty-three sessions of
    UTC-morning runs hid the frozen "Good morning". Related: when copying
    a reference COMPUTATION (a week number, a count), measure the
    reference's own convention first — the CW label was assumed ISO and
    was wrong by one across every Sunday.
12. **Time-dependent UI needs a fake-clock pin, not a wall-clock hope** —
    `page.clock.setFixedTime` makes greeting buckets, week numbers and
    date alignments deterministic at any hour; a pin that only fails at
    certain wall-clock times is coverage roulette.

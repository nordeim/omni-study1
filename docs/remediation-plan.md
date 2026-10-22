# Omni-Study1 — Remediation Plan & Execution Record

> **Status: COMPLETE through Batch AI (session-82).** Every batch below has
> been executed TDD-style (spec-red → fix → spec-green) and verified:
> **864/864 Vitest unit**, **448/448 Playwright e2e** across the 5-chunk
> cold map (127+138+52+73+58, 30 spec files censused exactly once; the
> per-chunk count includes that chunk's auth setup), lint clean,
> `tsc --noEmit` clean, production build green with the standalone asset
> contract intact. This document is the durable record of what was broken,
> how it was diagnosed, and which standing guard now pins each fix.

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

### Batch V — Session-65: the zero-state + stat-card drifts (My Day, Grade Tracker, Practice Tests, Study Groups) — the 20-view matrix completed

The drift sweeps s58–s64 had covered 16 of the 20 authed views (s58 mobile:
Dashboard/Tasks/Analytics/Settings; s60 desktop: Notes/Flashcards/Calendar;
s63–s64: Dashboard/Events/Timetable/Exams/Assignments). This cycle probed the
four never-swept surfaces — My Day, Grade Tracker, Practice Tests, Study
Groups — completing the matrix. The reference account is EMPTY, so the
seeded Grade Tracker comparison needed an authorized gated write probe (the
s64 precedent: create → measure → delete → verify zero residue). The probe
also surfaced a reference-side dangling record: deleting the probe subject
cascade-removed its grade but the account's "Total Grades 1" counter kept a
second orphan grade — no UI delete path exists for it; an endpoint-learning
probe (intercepting the UI's own create call) captured the entity API
(`/api/apps/{id}/entities/{Entity}`, Bearer JWT from localStorage) and both
records were deleted through it. Zero residue verified (0 grades, 0
subjects); the Grade entity schema was captured as a bonus.

| # | Finding (reference-measured 2026-10-19) | Root cause (clone) | Fix | Guard |
|---|---------|-----------|-----|-------|
| V1 | **My Day at zero keeps the full chrome**: the header + the quick-add row stay visible and the amber greeting block (sun tile, "Good {bucket}!", "What would you like to accomplish today?", "Add Your First Task") renders BELOW them — not instead of them | the S9-era early return replaced the WHOLE view with the amber empty; S9-B pinned only the block's internals, not its position | the early return removed; the amber block is now a conditional branch after the quick-add form (`!loading && tasks.length === 0`), the progress/list chrome renders otherwise; S9-B's parent-locator structure survives | S17-V1 (header h1 + quick-add visible AND amber h3 below, at zero) |
| V2 | **Practice Tests subtitle copy**: "Test yourself with practice exams" | the clone invented "Build and take practice tests" | one-line subtitle swap in the ViewHeader | S5-V2 (exact copy pin) |
| V3 | **Grade Tracker is a 3-card row with no sub-captions**: `grid md:grid-cols-3 gap-4`; cards = Overall Average (gradient) / **Total Grades** (white, emerald-500 Target) / **Subjects Tracked** (white, blue-500 ChartColumn); values `text-4xl font-bold mt-2`, labels `text-sm` — NO Highest Grade card, NO hint lines; the header subtitle reads **"Monitor your academic performance"**; the seeded view adds subject progress rows + "Recent Grades" (probed with data, then deleted) | the clone had FOUR cards (invented Highest Grade + a 2×2/4-col grid), a hint paragraph under every value, and the subtitle "Track your grades across subjects" | GtSummaryCard: `hint` prop removed, `iconClass` prop added, value `text-3xl mt-1` → `text-4xl mt-2`, icon `mb-3`; grid → `md:grid-cols-3`; Highest Grade card deleted, Total Grades + Subjects Tracked reordered into the measured order with the measured icon colors; the "—" zero sentinel (S17-E exact-text pin) survives on the gradient card; subtitle corrected | S5-V1 (3-card row, no Highest Grade, no hints, measured colors + subtitle) + S17-V3 (the zero state shows the same three cards at 0/0/0) |
| V4 | **Study Groups panes swap their empties**: at zero the LIST panel carries the EmptyState (Users icon, "No study groups", "Create a group to collaborate") WITH the gradient **Create Group** CTA; the right pane is the bold hint ONLY (h3 "Select a group" `text-xl font-semibold text-slate-800 mb-2` + p `text-slate-500 max-w-sm mb-6`, centered `py-16 px-4`); the header's + button radius is **6px** (`rounded-md`) | the clone had the roles swapped — a bare "No study groups yet." text line in the list panel and the EmptyState (no CTA) in the right pane; the + button used `rounded-xl` | EmptyState + CTA moved into the list panel's zero branch (the search-no-results line stays — unprobed); right pane rebuilt as the bold hint; S17-G's mobile stacking pins survive (both panes stack); + button `rounded-xl` → `rounded-md` | S17-V2 (list-panel EmptyState + CTA; right-pane bold hint; no right-pane EmptyState) |

**Verified:** the 5 new pins RED-first, then GREEN (one pin's locator chain
fixed during RED — the CTA button is a sibling of the h3, not a child);
affected files re-run green; full cold re-certification **192 + 104 + 55 =
351/351** on the final bundle with zero flakes; lint ✓ tsc ✓ unit
**842/842** ✓; the standalone bundle rebuilt in-cycle for the RED→GREEN
verification (REAL_EXIT=0; `find src prisma -newer .next/BUILD_ID` empty —
fresh); live comparison on the production standalone:
clone fingerprints now match the reference on all four surfaces (seeded +
empty captures); Lighthouse re-certified a11y **100** on both surfaces
(`65-{dashboard,login}-after.json`); CWV budget audit refreshed the
Batch-R deferral evidence — the clone ships 183–297KB JS with LCP GOOD on
every probed surface while the live reference ships 1232KB total / 771KB
JS and its login-mobile LCP is POOR (9452ms). Captures:
`65-ref-desktop-{myday,gradetracker,practicetests,studygroups,settings,
gradetracker-probe}.png` + `65-clone-desktop-{myday,myday-empty,
gradetracker,gradetracker-empty,practicetests,practicetests-empty,
studygroups,studygroups-empty,settings}.png` (15). Probe scripts preserved
under `scripts/*-s65.mjs` (17).

### Batch W — Session-66: the Events zero-state drift (the last unknown left by the matrix) + the reference-unchanged re-sweep

The re-certification cycle on the preserved s65 workspace: full gates
re-run cold (351/351 as received), then the reference re-sweep (a NEW
probe class — invariants evaluated in-script from the s63–s65 measured
records, both hosts) to detect upstream drift. The reference came back
UNCHANGED on all 9 measured dimensions — but the sweep exposed one
clone-side defect the matrix had missed: **Events at zero**. The s64
Batch-U strip work had been verified against the SEEDED clone only; the
clone's S17-era early return (`events.length === 0 ? EmptyState : panel`)
had survived beneath it. The reference (whose account is empty) shows the
OPPOSITE: the day-focus strip is DATE-driven, not data-driven — at zero it
still renders the overline + controls, the big focused date, the CW line,
the 7-day list with every day reading "No events.", and the full-width
cyan New Event row — and NO empty card anywhere (the per-day lines ARE
the zero state).

| # | Finding (reference-measured 2026-10-19) | Root cause (clone) | Fix | Guard |
|---|---------|-----------|-----|-------|
| W1 | **Events at zero still renders the full day-focus strip**: 4 controls (3 focus + toggle), big date, "Oct 2026 CW 43", Today/Tomorrow + 5 dated heads each reading "No events.", full-width New Event — and no empty card | the S17-era `events.length === 0` early return rendered an invented EmptyState ("No events yet / Create your first event to see your week come alive.") INSTEAD of the panel; Batch U rebuilt the strip inside the non-zero branch so seeded pins never saw the zero path | the early return removed — the panel renders unconditionally (the day list already prints "No events." per empty day); the EmptyState branch + its import deleted | S17-W (one pin, one registration: strip chrome + CW + 7×"No events." + New Event AND "No events yet"/"come alive" absent) |

**Verified:** the pin RED-first (2 failed as split, then merged — see the
budget note), GREEN after the fix; lint ✓ tsc ✓ unit **842/842** ✓; build
REAL_EXIT=0 (fresh bundle, `find src -newer .next/BUILD_ID` empty); full
cold re-certification **192 + 105 + 55 = 352/352** on fresh servers (the
chunk-2 budget lesson below); the re-sweep then reports **all 18
invariants green** (9 reference + 9 clone) — the reference unchanged
since s65, the clone matching on every measured dimension. Captures:
`66-ref-desktop-*.png` ×10 (7 sweep surfaces + events-zero + the mobile
pair) + `66-clone-desktop-*.png` ×9 (7 sweep surfaces + the mobile
pair) = 19; the generic mobile-drawer
probe heuristic found no drawer button on EITHER site (probe weakness,
identical both sides — `mobile-navigation.spec.ts` stays the authority,
green in chunk 1). Probe scripts: `ref-resweep-s66.mjs`,
`clone-events-check-s66.mjs`, `ref-events-zero-s66.mjs`.

**The register-budget lesson (standing).** The register limiter is
10/IP/15 min and `reuseExistingServer: !CI` means a chunk can inherit a
partially-spent bucket from a prior run. The W pins first shipped as two
tests (2 registrations) — the full chunk-2 then spent S9's 2 + s17's 8 =
the entire budget with ZERO headroom and the LAST register 429'd
(curl-proven baseline: 10 calls pass, the 11th 429s; the chunk run
reached the boundary under conditions not fully reproduced solo). Fix:
the W family merged into ONE test/ONE registration — chunk 2 now spends
9/10, a deliberate one-slot headroom, documented in the spec's design
comment. Never design a suite to exactly exhaust a shared time-windowed
budget.

### Batch X — Session-67: the brand-header typography drift (sidebar + app bar + drawer) found by the mobile-nav deep-dive

The 11th workspace reset forced a full environment rebuild (fresh clone
`bb729e4`, deps, chromium-1243, paramiko shim re-extracted from the
how-to doc's Appendix A). Cycle rhythm: gates re-certified cold on the
received state (354/354 + 842/842 — the chunk map re-derived as
5 sub-runs under the register-budget rule), the s66 invariants re-sweep
came back **18/18 green** (reference unchanged, clone matching), and
the user-flagged mobile-navigation surface got a PRECISE probe (the
generic sweep probe fails identically on both sites because the
reference's hamburger is an UNLABELED icon button and its drawer mounts
neither `role="dialog"` nor `data-state` — the clone's aria-labels are
the documented a11y superset). Visual comparison of the two drawers
then exposed a wrap difference: the clone's drawer subtitle
("Your study companion") broke onto two lines where the reference kept
one. Measurement escalated to a node dump (TreeWalker over text nodes +
computed styles + DOM paths), which settled the truth table:

| Surface | Reference (measured s67) | Clone before | Clone after |
|---|---|---|---|
| Desktop sidebar title | `h1.text-lg` → **18px/28px**/700 | `text-lg leading-tight` → 18px/**22.5px** (lh drift) | `text-lg` (v4 default lh 28) |
| Desktop sidebar subtitle | **12px/16px** | `text-xs leading-tight` → 12px/**15px** | `text-xs` (16) |
| App-bar brand span (mobile) | **16px/24px**/700 (`span.font-bold` = text-base) | `text-lg` → 18px/28px | `text-base` |
| Drawer brand title (mobile) | **16px/24px**/700 | `text-lg leading-tight` → 18px/22.5px | `text-base` (24) |
| Drawer subtitle (mobile) | **12px/16px**, ONE line | `text-sm` → 14px/**wrapped 2 lines** | `text-xs` (one line) |

| # | Finding | Root cause | Fix | Guard |
|---|---------|-----------|-----|-------|
| X1 | Drawer subtitle wrapped to 2 lines; drawer/app-bar titles read visibly larger than the reference | `text-lg`/`text-sm` shipped where the reference renders `text-base`/`text-xs` on the mobile surfaces; `leading-tight` crushed the desktop lh (22.5/15 vs the reference's v4-default 28/16) | size+lh corrected on all three surfaces (mobile-chrome.tsx drawer + app bar, sidebar.tsx) — every value now byte-equal to the node-dump measurements | **S3-I** (drawer title 16/24 + subtitle 12/16 + single-line box <20px; app-bar brand 16/24 as part 1) + **S3-H** (sidebar title 18/28 + subtitle 12/16) |

**The probe-agreement lesson (AP-111).** Two runs of the same probe
class measured the reference's desktop brand title 16px then 18px. The
resolution — a TreeWalker node dump capturing EVERY matching text node
with computed styles + DOM path + class string — found the reference's
own two brand nodes (`h1.text-lg` desktop 18/28, `span` app-bar 16/24)
and proved the 16px desktop read had grabbed the wrong node. Rule: when
two probes disagree, do not average or re-run hoping for stability —
dump ALL candidate nodes with DOM paths; pin from the node whose path
identifies the element, never from an unscoped `.pop()` of a query. A
pin corrected pre-landing (AP-108) beats a pin corrected after it
enshrines a mis-measurement.

**Verified:** both pins RED-first (2 failed as designed, the S3-G name
collision with the existing CTA pin caught and renamed S3-I), GREEN
after the fix; lint ✓ tsc ✓ unit **842/842** ✓; build REAL_EXIT=0; full
cold re-certification **64 + 86 + 92 + 56 + 58 = 356/356** on fresh
servers (chunk-2 register spend 9/10 unchanged); node-dump re-run
confirms clone == reference on all three surfaces; the fixed drawer
captured (`67-clone-drawer-brand-fixed.png` — subtitle one line).

### Batch Y — Session-68: the nav-chrome + dashboard-copy drifts found by the extended invariant sweep

The 12th cycle ran on the PRESERVED workspace (no reset — first time
since s66). Gates re-certified cold on the received state (356/356 +
842/842), the Batch-X diff audited clean against the repo's
code-review checklist, and the s66/s67 invariant sweep was EXTENDED
with the Batch-X brand typography as standing invariants — which
immediately caught the next drift layer. The sweep's mobile probe
initially reported drawers CLOSED on both sites: two probe-logic bugs
(the `.find()` visibility check grabbed the hidden sidebar's link, and
the `.fixed button` selector matched the hidden aside's chevron first —
AP-112), fixed with visibility-scoped evaluateAll + a DOM-click route;
the side-by-side drawers then exposed the drifts:

| # | Finding | Root cause | Fix | Guard |
|---|---------|-----------|-----|-------|
| Y1 | SIX nav icons wrong (both surfaces): Timetable `calendar-range`→`calendar`, Assignments `clipboard-list`→`book-open`, Practice Tests `file-text`→`file-question`, Grade Tracker `list-checks`→`trending-up`, AI Assistant `bot`→`sparkles`, Focus Timer `clock`→`timer` | the S8-A-era icon records covered 7 named glyphs; the unpinned 13 drifted (or the reference updated) and no pin guarded the map | NAV_ICONS corrected from the live DOM dump; the Practice Tests glyph is byte-identical path data under the lucide rename (`file-question`→`file-question-mark` — the BarChart3→chart-column precedent) | **S8-Y** (the full 20-entry lucide map pinned from the sidebar DOM — one surface proves both) |
| Y2 | The active nav pill was a 24px inner-span chip; the reference paints the FULL 48px row (px-4 py-3 + bg on the row box) | the clone put py-3 on the `<a>` and the gradient on the inner span | padding moved onto the chip span (now the full-row pill; hover too); the S8-A/S52-C assertions survive unchanged | **S3-J** (chip box height 48) |
| Y3 | Nav rows sat 4px apart (52px pitch); the reference is FLUSH 48px (its own `space-y-1` class is inert on its markup) | the clone modeled the ref's class STRING (`space-y-1`) as `gap-1` — v4 trap 4's flex-gap convention applied where the reference's own spacing is dead | `gap-1` removed from both nav containers (desktop 48/48, drawer 48/48, collapsed 44/44) | **S3-J/S3-K/S3-L** (pitch pins per surface + state) |
| Y4 | Desktop sidebar header: clone `h-16 px-4` 64px no-divider vs reference `p-6 justify-between border-b` 109px (the subtitle WRAPS in the ~124px text container); collapsed 64px centered-chevron vs 85px left-aligned | the h-16 was the MOBILE app bar's geometry, never re-measured on the desktop sidebar | header = `p-6 border-b border-slate-100 dark:border-slate-800` in BOTH states; chevron left-aligned when collapsed | **S3-J** (pad/border/height≥100, wrapped subtitle) + **S3-K** (collapsed 85px, chevron x≈25, pitch 44) |
| Y5 | Drawer brand block: clone `p-6 pb-4` 80px NO divider vs reference `p-6` 89px with the border-b | same divider class the desktop header carries | `border-b border-slate-100 dark:border-slate-800` + uniform p-6; drawer rows start y=105 (byte-equal) | **S3-L** (block 89px, border, first row 105) |
| Y6 | Sidebar footer: no divider, tight clock (14px/600) vs reference `border-t p-4` block + a 24px/700 statement clock + `px-4 pb-4` identity | the footer geometry was never measured (S3-B/C pinned the chip's gradient + color, not the block) | footer = `border-t border-slate-100 dark:border-slate-800 p-4` + chip `p-4` + time `text-2xl font-bold` + identity `px-4 pb-4` | **S3-J** (border-t, pt-16, time 24px/700) |
| Y7 | App-bar clock: 600/slate-700 vs reference 500/slate-600 | weight/color one step heavy | `font-medium text-slate-600` | **S3-L part 1** |
| Y8 | Dashboard stat HINTS invented: "tasks done today"/"to complete"/"next 7 days"/"logged today" vs reference "tasks completed"/"to be done"/"assignments"/"this month"; stat icons list-todo/clock/timer vs square-check-big/book-open/flame; blocks SOLID vs the reference's 48px 12px GRADIENTS (violet→indigo, blue→cyan, orange→amber, pink→rose); Focus Time "0m logged today" vs "0h this month" — a SEMANTIC drift (today-minutes vs month-hours) | the stat subs/icons/blocks predate the measurement discipline and no pin guarded them | hints + icons corrected; blocks carry the measured inline sRGB gradients (v4 trap 5); `formatFocusHours` + `isSameMonth` seams (unit-pinned) scope the stat to month-hours | **S4-K** (hints exact, stale strings count 0, hours format, sparkles CTA) + date.test.ts |
| Y9 | Hero CTA: iconless BUTTON vs reference ANCHOR with a sparkles icon | same unmeasured-era copy | `Button asChild` → real `/MyDay` anchor (the overdue View All pattern) + Sparkles; 4 button-locator pins corrected per AP-108 | **S4-K** (link role + lucide-sparkles) + S4-G/S3-G locator updates |

**The a11y-vs-parity call (documented deviation).** The reference's
brand subtitle renders `text-slate-400` (2.56:1 on white — an axe
color-contrast failure). The clone KEEPS `text-slate-500` (4.76:1) on
both surfaces — the Batch-R/S seven-surface family's own call (the
StatCard hint docstring records the identical decision from session
61). The S3-J/S3-L pins assert the superset value with the
justification in-place.

**The sweep-extension lesson (AP-112).** The invariant sweep's first
mobile pass reported drawers closed on BOTH sites while both opened
fine: `.find()`/`.first()` over label-matching links picks the HIDDEN
sidebar's copy (display:none, width 0) before the drawer's, and a
`header button, .fixed button` selector matches the hidden fixed aside
before the visible fixed header. Rule: visibility checks must scope to
VISIBLE nodes (evaluateAll over rect width), and positional selectors
must filter by rendered geometry, not DOM order. Second trap in the
same family: the drawer overlays the app bar at the SAME y-range, so a
y-threshold cannot separate the two brand nodes — anchor the drawer
title to the (unique, visible) subtitle node instead.

**Verified:** S8-Y/S3-J/S3-K/S3-L + the app-bar clock extension RED on
the received bundle (5 failed / 54 passed); GREEN after the chrome
fixes; S4-K + the unit seams RED-first on the measured pre-fix state;
lint ✓ tsc ✓ unit **844/844** ✓; build REAL_EXIT=0; full cold
re-certification **74 + 76 + 97 + 56 + 58 = 361/361** on fresh servers
(chunk-2 register spend 9/10 unchanged); the s68 sweep reports
**ok:true** — 18/18 original invariants + the desktop brand table +
drawer-open + bar/drawer brand typography green on BOTH hosts; the
post-fix node dumps: desktop/drawer pitch 48/48, drawer rows start
y=105/153/201 (byte-equal), Practice Tests glyph path-identical; the
corrected dashboard + drawer captured (`68-clone-dashboard.png`,
`68-clone-mobile-drawer.png`).

### Batch Z — Session-69: the screenshot-sweep drift layer (dashboard sections, My Day column, view-header icons, Events bands, the Settings Appearance card)

The 13th cycle ran on a RESET workspace (fresh clone at the
session_15 transcript `f0d01b1`). Environment re-provisioned from
scratch (bun install, `.env`, `db/custom.db` push+seed, chromium-1243,
the paramiko ssh shim rebuilt at `/home/z/ssh-infra/ssh` after the
reset shredded it; `ls-remote` pre-flight green). Gates re-certified
cold on the received state: lint ✓ tsc ✓ unit 844/844 ✓; e2e across
the re-derived 5-sub-run map (12 zero-register files split by weight;
the s9+s17+tasks/resilience/s16/s14 register family on its own fresh
server; auth + s18–s26 + greeting on the third) — **361/361** zero
flakes (105+100+42+56+58). The s69 invariant sweep (the s68 class +
tags) reported **ok:true** on both hosts — and the side-by-side
screenshot pairs (`69-ref-*` vs `69-clone-*`) exposed the next drift
layer, DOM-probed into a 12-finding truth table
(`scripts/z-probe{,2,3,4,5}-s69.mjs`):

| # | Finding | Root cause | Fix | Guard |
|---|---------|-----------|-----|-------|
| Z1 | Dashboard section row: clone `lg:grid-cols-2` (546/546) vs reference `grid lg:grid-cols-3 gap-6` with Today's Tasks `col-span-2` (736+356) | the S8-B-era 2-col grid was never re-measured | `lg:grid-cols-3` + SectionCard `lg:col-span-2` | **S4-L** (span 2 + 3 tracks) |
| Z2 | Dashboard section header icons: sun / graduation-cap / clipboard-list vs reference square-check-big / graduation-cap / book-open | S8-era guesses, no pin on the header map | header icons corrected | **S4-M** (3-entry map) |
| Z3 | The Upcoming Exams header had NO action; the reference carries a plain 16px neutral-950 **"All" anchor → /Exams** with an arrow-right icon | unmeasured header slot | anchor added (the AP-108-measured value: `text-base text-neutral-950`) | **S4-N** |
| Z4 | Dashboard section empties: "No upcoming exams." (invented period), "No active assignments." (invented copy), 14px messages vs reference "No upcoming exams" / "No upcoming assignments" at **16px** | SimpleEmptyState predates the measurement discipline | copy corrected; SimpleEmptyState message `text-sm`→`text-base` | **S4-O** (fresh-user — the seed ships exams/assignments, AP-114) |
| Z5 | My Day rendered FULL-width (x=292, w=1061) vs the reference's centered **max-w-3xl** column (x=466, w=768); the quick-add plus TRAILING 16px vs the reference's LEADING 20px slate-400 plus with a 48px input inset; More Options white outline rounded-xl vs the reference's **neutral-950 6px-radius dark button** | the My Day shell was never measured | root `mx-auto max-w-3xl`; leading plus (`left-4 size-5`) + `pl-12`; gap-3; new Button **`neutral` variant** (arbitrary hexes — the first draft's `bg-neutral-950` serialized `lab(...)`, v4 trap 10 re-hit) | **S9-R2** ×3 |
| Z6 | Grade Tracker h1 icon list-checks vs reference **trending-up**; Practice Tests h1 icon file-text vs **file-question** | the Batch-Y NAV_ICONS fix never reached the ViewHeader call sites | icons corrected (ListChecks kept for the By-subject card) | **S3-M** |
| Z7 | Practice Tests zero state wrapped in an sf-card; the reference's floats **BARE on the canvas** (probe: no bordered/bg ancestor within 6 levels) | the wrapper predates the zero-state matrix | wrapper dropped | **S7-P** (fresh-user, AP-114) |
| Z8 | Study Groups right pane at zero: the centered bold-hint-only variant vs the reference's **top-anchored icon EmptyState** (80px gradient users block, icon y≈96, h3 y≈200) | the s65 reading no longer matches the live reference (AP-108: re-probe, re-pin) | icon block + h3 (level kept for the s17 pin) + hint, top-anchored | **S8-Z** (fresh-user, AP-114) |
| Z9 | Events day rows: bare cyan-400 labels, centered plus-icon New Event, "No events." vs the reference's **full-width slate-800/50 band rows** (`px-4 py-2`, slate-300/600 14px labels), a **left-aligned calendar-icon New Event** full-width row (`px-4 py-2`), "No events" without the period; the panel itself `p-0 overflow-hidden` with the strip carrying `px-4 pt-6 pb-4` | the Batch-U/W chrome modeled the pre-restructure reference | panel/strip/day-row structure rebuilt; "No events" color stays **slate-400** — the reference's slate-500 is 3.48:1 on slate-900 (the a11y-wins precedent); the band bg asserts accept the oklab serialization (v4 trap 7) | **S5-V2** ×2 + S17-W updated (the Batch-W period pin re-pinned per AP-108) |
| Z10 | Settings subtitle "Personalize your study companion" vs reference **"Customize your StudyFlow experience"** | invented copy | corrected | **S4-P** |
| Z11 | Settings Appearance tab: THREE sf-cards at max-w-2xl with per-card headings/hints vs the reference's **ONE shadcn card** (`rounded-xl border bg-card shadow`, 896px = max-w-4xl centered) holding CardTitle "Appearance" + "Customize how StudyFlow looks" + the Theme / Accent Color / Avatar labels (`text-sm font-medium`) + h-88 rounded-xl border-2 theme buttons (24px icons) + 48px rounded-xl swatches + a flex-wrap gap-2 grid of 48px rounded-xl emoji tiles + a Save Preferences gradient button (save icon) | the S11-era three-card design was invented before the appearance surface was ever measured | AppearanceCard composite (the pickers keep the immediate-PATCH contract; Save re-PATCHes the triple; the None/Preview row dropped — ref has neither; labels carry dark: variants, the reference's dark-mode rendering of them is unreadable and the clone's dark mode is the documented superset) | **S11-7** ×2 |
| Z12 | Avatar vocabulary: the S11-era 24-list (✏️ 🌱 🔥 ☕ 🐢 🐙 🦄 🌈 ⚡ invented) vs the reference's **22-emoji list** (🎓 📚 🧠 💡 🎯 🚀 🌟 🦊 🐱 🐶 🐼 🦁 🐸 🦉 🐧 🎨 🎵 🎮 🏀 🎾 🏆 🎪) | never dumped | AVATAR_EMOJIS re-dumped | the theme.test.ts unit pin (the full list) |

**The discriminator probe (AP-113).** The reference's Appearance card
renders BLACK with the account stuck in dark mode. Clicking the
reference's own "Light" option changes NOTHING (html.dark stays set,
Dark stays selected) — the Base44 theme picker is a hard no-op, so the
account's mode is frozen state and the light-mode rendering of
dark-artifact surfaces is UNKNOWABLE through the UI. The pins
therefore target the mode-independent structure (anatomy, geometry,
copy, vocabulary — the `bg-card`/`rounded-xl`/896px facts) and the
clone's dark-mode contract owns the mode-dependent values (dark:
variants; the labels stay readable).

**Verified:** 16 new pins RED-first (15 e2e + the AVATAR_EMOJIS unit
pin; the unit pin's RED rides the e2e S11-7 RED — the source landed in
the same pass); lint ✓ tsc ✓ unit **844/844** ✓; build REAL_EXIT=0
(fresh: `find src prisma -newer BUILD_ID` empty); full cold
re-certification **108 + 107 + 44 + 59 + 58 = 376/376** on fresh
servers, zero flakes; the final s69 sweep **ok:true** (18 invariants +
brand tables + drawer/bar typography green on BOTH hosts, post-fix);
the standing dark-sweep: zero NEW findings (the pre-existing
`sf-clock-date` gradient-bg artifact reads identically pre/post —
verified by stashing the batch and re-running the sweep on the
received bundle); post-fix evidence captured (`69-ref-*` /
`69-clone-*`).

### Batch AA — Session-70: the probe re-measure layer (the dashboard section actions' true anatomy, the assignments card placement, the root rhythm, the bordered section headers, the 24-emoji avatar list)

Cycle 21 ran on a PRESERVED workspace (fast-forward pull of the
session_16 transcript `5fcbea6` onto Batch Z `095a022`; the environment
survived — deps, chromium-1243, `.env` posture, fresh build, db; only
the shredded deploy key was re-provisioned at `/home/z/ssh-infra/key`,
`ls-remote` pre-flight green). Gates re-certified cold on the received
state: lint ✓ tsc ✓ unit 844/844 ✓; e2e across the 5-sub-run map —
**376/376** zero flakes (113+109+42+59+58 on the s70 sub-split; chunk
1b's single first-pass failure was the documented accessibility.spec
cold-boot race, green on the solo re-run). The s70 invariant sweep (the
s69 class re-tagged, `scripts/ref-resweep-s70.mjs`) reported **ok:true**
on both hosts — and the side-by-side screenshot pairs exposed the next
layer, which SIX probes (`scripts/z-probe{,2,3,4,5,6}-s70.mjs`) turned
into a measured truth table:

| # | Finding | Root cause | Fix | Guard |
|---|---------|-----------|-----|-------|
| AA1 | Dashboard Upcoming Assignments card: clone = a 3-track GRID ITEM (row 2, track 1, ≈360px) vs reference = a SIBLING of the grid (probe #3's DOM path: `space-y-8 > div[3].bg-white.rounded-2xl`, OUTSIDE `div[2].grid.lg:grid-cols-3`), full-width 1116px | the Z1 fix set the grid + the Tasks span but never measured where the third card lived | the SectionCard moved out of the grid into the root flow | **S4-R** (outside the grid + width == the grid's width) |
| AA2 | Dashboard root rhythm: clone `gap-6` (24px) vs reference `space-y-8` (32px — stats y=128 vs clone y=120, the exact 8px gap delta, probe #4) | the S8-B-era root predated the rhythm measurement | root `gap-6` → `gap-8` | **S4-S** (root row-gap 32px) |
| AA3 | The Upcoming Assignments header had NO action; the reference carries **"View All"** in the shared action anatomy | the card was never header-measured | SectionLink action added | **S4-Q** (3-case table) |
| AA4 | ALL THREE section actions' true anatomy (probe #3 node dump): `<a href="/MyDay\|/Exams\|/Assignments">` wrapping a **button** rendering **12px/500 violet-600 rgb(124,58,237) at h-32** with the arrow svg — the s69 probe had read the ANCHOR's inherited styles (16px neutral-950) and missed the button inside (AP-108 re-measure; probe-vs-probe disagreement resolved by the full-path dump per AP-111) | one-element-deep reads | the shared `SectionLink` (module-scope component — the static-components rule) on all three headers; the anchor stays unstyled + the focus-ring a11y superset; S4-N re-pinned to the button's values | **S4-N** (re-pinned) + **S4-Q** |
| AA5 | Section headers: clone single row `p-6 pb-4` (24/16, no divider, card h=218) vs reference OUTER `p-6 border-b border-slate-100` (24/24 + 1px slate-100 divider) wrapping an inner gap-less flex row (h=32, card h=231) (probe #5) | the flush-card header was never padding-measured | SectionCard `borderedHeader` opt-in prop (the other consumers' ref anatomy is UNMEASURED — their zero states render no titled cards to probe; recorded as the open follow-up) | **S4-T** (outer pt/pb 24 + 1px rgb(241,245,249) + inner row h=32 gap normal) |
| AA6 | Avatar vocabulary: the Z12-pinned **22-list was a mis-measurement** — the reference renders **24** emojis; the s69 emoji-scan dropped ⭐ (index 6) and ⚽ (index 19) (probe #2's scoped visible-tile dump) | the s69 scan filtered without visibility scoping | AVATAR_EMOJIS 24-list; the unit pin + a new e2e pin re-pinned (AP-108) | **S11-7c** (24 tiles, ⭐ at 6, ⚽ at 19) + the theme.test.ts unit pin |

**The discriminator lesson (AP-115).** Two of this cycle's six probes
DISAGREED on the same node (anchor/16px/gray vs button/12px/violet) and
one standing pin (Z12's 22-emoji) was overturned by a scoped re-dump.
Rule: when probes disagree — or when a pin encodes a probe reading —
dump EVERY candidate node with its DOM PATH and PARENT chain
(`parentFs`/`parentColor` caught the anchor-wrapping-button structure);
a text-node's inherited styles are not the visible text's styles. And
scope every filtered scan to VISIBLE nodes (`offsetParent !== null`) —
a filter over the whole document silently drops or invents members.

**Verified:** 7 pins RED-first on the pre-fix bundle (S4-N rewrite +
S4-Q/R/S/T + S11-7c + the unit pin — 6 e2e failed + the unit RED);
GREEN after the source fixes (`dashboard-view.tsx` root/action/placement,
`shared.tsx` borderedHeader, `theme.ts` vocabulary); lint ✓ tsc ✓ unit
**844/844** ✓; build REAL_EXIT=0 fresh; full cold re-certification
**113 + 109 + 42 + 59 + 58 = 381/381** (376 + 5 new pins, accounting
exact); the post-fix s70 sweep **ok:true** (after the s63
EADDRINUSE lesson re-bited — the stale pre-fix standalone held :3200
through `pkill -f next-server`; killed by the port-owner PID); the
fixed dashboard captured (`70-clone-dashboard.png` vs `70-ref-dashboard.png`).

### Batch AB — Session-73: the populated-surface drift layer (the s72 endpoint-learning probe finding)

**Finding.** The Batch-AA cycle had left one question open: do the OTHER
four SectionCard consumers (calculator, mathsolver, analytics,
gradetracker) use the dashboard's new bordered-header anatomy on the
reference? The zero-state probes (s70 probe #6) could never see those
surfaces — the reference renders NO history/recent/subject chrome at
zero, so the layer was explicitly unmeasured. The s72 cycle settled it
with a populated-account endpoint-learning probe
(`scripts/ref-populated-headers-s72.mjs` + the v2 re-drive): it filled
the reference account THROUGH THE REFERENCE'S OWN UI/API (subject +
grade + task POSTs against `/api/apps/6969efea366cba53524cde3f/entities/*`
with the Bearer JWT from localStorage, a keyed evaluation, a solved
problem), measured the populated card headers, then cleaned up to ZERO
RESIDUE (surgical signature-matched deletes via the same entity API —
verified by re-list; the s65 protocol).

**The settled question + the new layer.** NONE of the four consumers
uses the bordered header — Batch AA's dashboard-only opt-in is correct
(analytics renders titled cards whose titles are NOT h2 elements inside
a dark rendering — the AP-113 artifact class; GradeTracker renders
subject cards with NO wrapper title). But the probe surfaced a NEW
drift layer — the populated states of three surfaces:

| # | Surface | Reference (measured, s72 screenshots) | Clone before |
|---|---------|----------------------------------------|--------------|
| AB-1 | Calculator header | subtitle "All your calculation needs in one place" under the h1; black History pill top-right | h1 alone |
| AB-2/3 | Calculator history | a header History toggle → right slide-in panel "Calculation History" (h3 16px/700), entry cards (expr spaced `2 + 3` grey / `= 5` bold), black full-width "Clear History"; NO history chrome at zero | a permanently-visible bottom h2 "History" SectionCard with an "Empty history" button (clone invention) |
| AB-4 | Calculator entry | expression spaced + bold result | `{expression} = {result}` one-liner |
| AB-5 | Math Solver header | subtitle "Type a problem or upload an image to get step-by-step solutions" | invented "Snap a photo or type a problem" |
| AB-6 | Math Solver history | free-standing h2 "Recent Problems" (18px/600 slate-800, no card chrome) | SectionCard "Recent solutions" |
| AB-7/8 | GradeTracker | bare per-subject cards in a 2-col grid: chip pill + large colored avg% + "Progress to A (90%)" row (progress = avg/90, 50 → 56%) + "Recent Grades" percent pills; NO "By subject" wrapper | a "By subject" SectionCard with per-subject progress rows |

**Fix.** `calculator-view.tsx` (subtitle, the aria-expanded History
toggle with the panel mounted ONLY while toggled — zero chrome at zero,
the spacedExpression display helper, the slide-in `aside` with the h2
title per the R1 heading-order contract), `mathsolver-view.tsx`
(measured subtitle; the free-standing h2 section), `gradetracker-view.tsx`
(the measured card grid with the `gt-subject-card`/`gt-subject-avg`
hooks, the avg text ramp on the badge thresholds, progressToA clamped;
the grade rows kept BELOW the cards as the documented superset — they
carry the edit/delete entry points the reference lacks).

**AP-117 (the seed-coincidence collision).** The first AB7 draft
asserted `getByText("78%")` on the Chemistry card — but Chemistry has
ONE seeded grade (78/100), so its avg and its only Recent-Grades pill
are BOTH "78%" and the locator resolves to two elements (strict-mode
violation). The reference dodges the collision BY FORMAT (1dp avg
"50.0%" vs integer pills); the clone's integer convention (the measured
Overall card) cannot. Rule: when a surface renders the same value in
two roles, assert through a role hook (`data-testid`), never through
the bare text — and check the seed for single-grade subjects before
pinning populated aggregates.

**Verified.** 8 pins RED-first on the pre-fix bundle (all 8 failed;
the amended AB7 chemistry line still RED through the hook); GREEN
after the source fixes; lint ✓ tsc ✓ unit **844/844** ✓; build
REAL_EXIT=0 fresh (`find src prisma -newer BUILD_ID` empty); full cold
re-certification across the AP-116-censused 5-chunk map (all 30 spec
files exactly once): **113 + 109 + 50 + 59 + 58 = 389/389** (376 + 8
new pins, accounting exact — chunk 1c grew by the 8 AB pins); the s73
sweep **ok:true** (9/9 invariants both hosts, brand tables byte-matched,
mobile drawers green on both); the populated clone surfaces captured
(`73-clone-gradetracker-populated.png`, `73-clone-mathsolver.png`,
`73-clone-calculator-history-open.png` against the s72 ref evidence).

### Cycle 25 (session-75) — the re-certification cycle + the populated S6-family probe (Batch AC measured, PENDING)

Ran on a RESET workspace (fresh clone at `ef0ed0a` = Session-74 + the
session_20 transcript). Full re-provision again (deps, paramiko,
ssh-infra, `.env`/db/seed, build, chromium-1243 — browsers go with the
cache on every reset). Gates re-certified cold: lint/tsc clean, unit
**844/844**, e2e **389/389** (113+109+50+59+58, census byte-matched,
first pass every chunk), s75 sweep **ok:true** (9/9 both hosts, mobile
drawers green), CWV re-audit re-validated the Batch R deferral on
STRONGER evidence: clone GOOD on every surface (dashboard
mobile-throttled LCP 2308ms, CLS 0) while the reference measured
login-mobile LCP **8032ms POOR** and dashboard-mobile LCP **4296ms** +
**CLS 0.254 POOR**.

**The new evidence layer: the populated S6-family re-measure on the
reference** (the S6/S7/S8 pins were decoded in the s6–s8 era; the
ref-side populated surfaces had never been re-measured). Five probe
iterations (v1 UI-driver misses → v2 dialog-closure verification →
v3 datetime-local + subject chain → v4 future-day pick + instrumentation
→ v5 form-title-scoped submits) populated Subject + Task + Event +
Assignment + Exam on the reference through its own UI, measured 7
populated views, and cleaned to **RESIDUE ZERO**. Probe-protocol lessons
(AP-118 + the popover-layering fix) are in the lessons table.

**Batch AC — the populated-row drift layer, MEASURED (s75) → IMPLEMENTED
(s76, see the Cycle 26 record below; the established probe→implement
rhythm that produced Batch AB):**

| # | Surface | Ref (measured, `75-ref-populated-*.png`) | Clone today | Class |
|---|---------|------------------------------------------|-------------|-------|
| AC1 | Assignment due pill | INLINE with the title, copy "7 days", violet tint | own line below the title, "Due tomorrow"/"Due in 2 days", blue-50 | placement + copy + tint |
| AC2 | Assignment meta row | subject chip (dot+name violet pill) + amber "🔔 Medium" priority + gray type | neutral flag-pill priority + type; NO subject chip | missing chip; priority icon + tint |
| AC3 | Exam card date | FULL format "Wednesday, October 28, 2026" | short "Wed, Oct 21" | format |
| AC4 | Exam card subject chip | renders (violet-50 pill) | absent | missing |
| AC5 | Exam card location | 📍 row renders WHEN set; the dialog has a Location field | no schema field, no dialog field, no row — the S8 pin "no location row" encoded a DATA ARTIFACT (the decode-era ref exams had no locations); the pin stays valid for the seeded no-location rows but its rationale is amended | E1-class end-to-end gap (`Exam.location` schema + dialog + card) |
| AC6 | Exam card topics | absent when empty | renders for seeded exams | data-conditional — re-measure the ref's positive case before pinning |
| AC7 | Exam due pill copy | "7 days" | "in 12 days" | micro-copy |
| AC8 | Task due pill | red DATE pill "📅 Oct 20" for a due-today task (quick-add defaults due=today) | relative "Today" | copy form (measure the ref's far-date form before pinning) |

Measured-and-MATCHING (no drift): exams header live-count
("N upcoming · N this week"), the amber above-title exam pill
placement, exam type pill title-case, the "· N min" duration suffix,
the assignments header + search + Active + All Subjects + violet Add
button, the progress track + violet % right, the populated dashboard
cards (Today's Progress N/M "tasks completed", Pending Tasks, Due
Soon, Focus Time), the calendar month grid + day-detail task rows, and
the My Day task row. The ref dashboard greeting renders the account's
name — behavior matches (the clone shows the display name).

### Cycle 26 (session-76) — the Batch AC re-measure (computed styles) + the execution plan

The S75 Batch AC table carried three prose transcription errors that the
s76 computed-style re-measure (`scripts/ref-ac-remeasure{,3,4}-s76.mjs`,
login → populate → measure → residue-zero cleanup, the AP-118/119
protocol) corrected, and it settled the two open questions (AC6 positive
case, AC8 far-date form). The corrected, machine-read evidence:

| # | Surface | Ref (computed-style measured 2026-10-20/21, `76-ref-*.png`) |
|---|---------|---------------------------------------------------------------|
| AC1 | Assignment due pill | INLINE with the title (titleY 17 / pillY 19); **blue-50 bg + blue-600 text** (the S75 table's "violet tint" was a misread), 12px/500, NO icon; copy "N days" (due +7 → "7 days", +1 → "1 days" — the ref's own quirk), due-today → amber-50/amber-600 "Tomorrow" (the ref's off-by-one slot), overdue unmeasurable through the UI (picker disables past dates) |
| AC2 | Assignment meta row | subject chip: `inline-flex gap-1.5 rounded-full font-medium text-xs px-2 py-0.5`, bg `rgba(139,92,246,0.082)`, text + dot `rgb(139,92,246)` (w-2 h-2 rounded-full), border `rgba(139,92,246,0.19)`; priority pill: bell SVG + "Medium", **yellow-50 bg + yellow-500 text**, 12px/500; type pill: slate-100 bg, **slate-400 text** (clone keeps slate-600 — the documented a11y-win family), raw-lowercase data + `capitalize` display (matches the clone); progress "0%" violet-600 ✓ unchanged |
| AC3 | Exam card date | **"Wednesday, Oct 28, 2026"** — weekday LONG + month SHORT (the S75 table's "October" was a transcription error; month is abbreviated), 14px/400 slate-600, calendar icon w-4 text-slate-400; the time row's "· N min" suffix is a separate **slate-400** span |
| AC4 | Exam card subject chip | same violet chip anatomy as AC2, rendered between the title row and the date row (`mb-3` wrapper) |
| AC5 | Exam card location | `flex items-center gap-2` row — map-pin SVG w-4 text-slate-400 + text 14px/400 slate-600 ("Room 3B"); the Add Exam dialog carries a Location input (placeholder "e.g., Room 101, Hall A") |
| AC6 | Exam card topics (POSITIVE case measured) | label `Topics to study:` (12px/500 slate-500, mb-2) + chips: **neutral-800 bg (#262626) + neutral-50 text**, rounded-md, px-2.5 py-0.5, 12px/600 — the clone's "N topics" count row is the drift |
| AC7 | Exam due pill copy + tint | "7 days" (no "in " prefix), **yellow-100 bg (rgb 254,249,195) + yellow-700 text (rgb 161,98,7)**, 12px/600, `px-2.5 py-1` — the clone's amber-100/amber-700 is the adjacent-hue family (Tailwind v4 lesson 12); "Tomorrow" (+1) stays orange (S9-J pinned) |
| AC8 | Task due pill (all forms measured) | ALWAYS the date form "Oct 20" / "Oct 22" / "Oct 28" (month-short + day, NO weekday, NO relative labels), with a leading **lucide-calendar SVG** inside the pill; today/past → red-100/red-600, future (tomorrow AND beyond) → slate-100/slate-500; 12px/400 |
| AC9 | NEW (found by the s76 fine dump) | the exam card title is **text-lg 18px/600 slate-800** (the clone renders 16px); the urgency pill is `px-2.5 py-1 font-semibold` (the clone: py-0.5 font-medium) |
| AC10 | NEW (audit finding) | the seed ships assignment type "worksheet" ("Problem set 6") which is OUTSIDE the `assignmentSchema` enum — the row renders (pin S6-E) but editing it 400s; add "worksheet" to the enum |

**Execution TODO (TDD — RED pins first, then GREEN source, in this order):**

1. **AC5 schema chain** — `prisma/schema.prisma` `Exam.location String?` →
   `bun run db:push` → `src/lib/validation.ts` examSchema
   `location: z.string().max(200).optional().default("")` (the eventSchema
   pattern) → `src/lib/data.ts` ExamRow `location: string` → dialog
   Location field (placeholder "e.g., Room 101, Hall A") → card 📍 row
   (MapPin w-4 slate-400 + slate-600 text, only when set) → seed ONE
   location ("Physics Final" → "Examination Hall A"; the FIRST card keeps
   none so the amended S8 pin stays valid). Unit test: validation accepts/
   defaults location.
2. **AC1/AC2 assignment row anatomy** — due pill moves INLINE with the
   title (flex row), copy/tint per the measured table; meta row becomes
   subject chip + bell priority + type. Honest-label decisions (documented
   deviations): diff 0 → "Today" amber (the ref's "Tomorrow"-for-today is
   its off-by-one quirk — superset, not clone-of-quirks), diff 1 →
   "Tomorrow" blue (the ref's "1 days" is its own sloppiness), diff ≥ 2 →
   "N days" blue (measured), overdue → "Overdue by Nd" red (unchanged
   superset — unmeasurable on the ref). Priority yellow-500 → **yellow-700**
   on yellow-50 (the ref's 1.9:1 fails AA; the documented a11y-win
   precedent). Dialog gains the Subject select (functional parity — the
   ref's dialog has one; without it the new chip is un-settable).
3. **AC3/AC9 exam card** — date format `weekday:"long", month:"short",
   day:"numeric", year:"numeric"`; "· N min" suffix as a slate-400 span;
   title → `text-lg`; urgency pill → `px-2.5 py-1 font-semibold`.
4. **AC4 subject chip component** — a shared `SubjectTagChip` (accent-aware:
   `rgb(var(--sf-primary) / 0.08)` bg, `rgb(var(--sf-primary))` text +
   border `rgb(var(--sf-primary) / 0.19)` — the Standing-Lesson-2 raw-triplet
   pattern, never the `/NN` modifier) + dot w-2 h-2 (subject color fallback
   accent); consumed by the assignment meta row + exam card.
5. **AC6 topics block** — replace the count row with the label + neutral-800
   chips (dark: neutral-700/neutral-100), only when topics parse non-empty.
6. **AC7 urgency labeler** — "N days" (drop "in "), amber-100/amber-700 →
   yellow-100/yellow-700 for the ≥2 bucket; update the S6-F pin's colors
   (the "Quiz — Integration" +4 card) accordingly.
7. **AC8 task pill** — new `formatDueDateShort` helper in `src/lib/date.ts`
   ("Oct 20", month-short + day) + unit tests; `DuePill` gains the
   `withIcon` CalendarIcon; `TaskRowCard` always uses the date form (the
   dashboard's own "Due {label}" line keeps `dayBucketLabel` — different
   surface, own pins).
8. **AC10 enum fix** — "worksheet" joins the assignment type enum + unit
   test (the seeded row becomes editable).
9. **Pin amendments** — S9-I (pills row 2→3 spans, subject chip present),
   S6-F (amber→yellow on the far badge), S8 (rationale: the "no location
   row" pin encoded a data artifact — stays valid for the no-location
   first card; ADD the positive location row + topics block assertions on
   the seeded location card).
10. **Doc hygiene** — README badge/anchors → 844 unit / 384 chromium specs
    (+4 setup runs in the 5-chunk map = the documented 389/389 posture);
    backfill the README remediation table's S74/S75 rows; refresh this
    file's stale "Status: COMPLETE … 834/834, 298/298" header to the live
    baselines.

Honest deviations ledger (all pinned with comments): the 0/1-day
assignment labels (honest copy vs the ref's quirk), priority yellow-700
(AA), type slate-600 (AA), task-pill red-700/slate-600 (AA family),
topic-chip dark-mode equivalents (the documented dark superset).

**Cycle 26 execution record (session-76).** The plan above was executed
in full, TDD: 3 unit pins (examSchema location default/bound, the
"worksheet" enum catch-up, `formatDueDateShort`) RED-first; 10 e2e pins
in the S8-AC blocks (assignment row anatomy ×4, exam card anatomy ×5,
task pill ×1) RED 10/10 against the pre-change build → GREEN 10/10; the
amended S6-F (amber→yellow badge), S9-I (meta row 2→4 spans + the chip
present), and S8 (location-pin rationale) all green. Two a11y regressions
caught by the standing axe sweep and fixed with the documented one-step-
darker text precedent (chip text violet-500→violet-600, "· N min"
slate-400→slate-500); two v4 lab() serialization gaps closed by pinning
yellow-50/950 + neutral-50/100/700/800; one pre-existing AP-96 flake in
the S8-U3 row-count pin hardened (wait-for-row before count). Gates:
lint ✓ tsc ✓ unit **847/847** ✓ build REAL_EXIT=0 fresh; cold
re-certification **399/399** (123+109+50+59+58, first pass every
chunk); s76 sweep ok:true (9/9 invariants both hosts, brand tables
byte-matched, mobile drawers green on both). Evidence:
`docs/screenshots/76-*.png` (the dev-server captures + the probe pairs)
+ `scripts/ref-ac-remeasure{,3,4,5}-s76.mjs` + `scripts/capture-s76-clone.mjs`
+ `scripts/ref-resweep-s76.mjs`. **Batch AC: DONE.** Standing debt
unchanged: Batch R (RSC structural perf — the deferral evidence
strengthened in S75 stands).

### Cycle 27 (session-77) — the Batch AD probe (the Notes inline editor + the Flashcards study mode, measured)

The two remaining unmeasured populated surfaces (named by the S76
record) probed through the reference's own UI in seven iterations
(`scripts/ref-ad-{probe,notes,notes2,notes3,flashcards,flashcards2,flashcards3}-s77.mjs`,
the AP-118/119 protocol — every run cleaned to FINAL-RESIDUE: 0; the
pre-existing orphan `Flashcard` on the ref account was never touched).
All values below are machine-read computed styles + entity API state,
cross-checked with screenshots + VLM (the DOM is the authority).

| # | Surface | Ref (computed-style measured 2026-10-21, `77-ref-*.png`) | Clone today | Class |
|---|---------|---------------------------------------------------------------|-------------|-------|
| AD1 | Notes editor engine | **Quill rich-text** (`ql-editor ql-snow`), toolbar = the full snow set: 3 pickers (header/font/size ~98-108px) + B/I/U/S + 3 list + 2 indent + 3 pickers (color/background/align) + blockquote + code-block + link + image + clean = **20 controls**, toolbar strip bg slate-50 pad 8px; **toolbar FUNCTIONAL** (select-all + bold → `<strong>` in the saved entity); `content` persisted as **HTML** (`"<p><strong>Probe paragraph one.</strong></p>"`) | plain `<textarea>`, no toolbar, plain-text content | **E1 functional** |
| AD2 | Notes editor card | `bg-white rounded-2xl border border-slate-200 overflow-hidden` (rgb 255/226,232,240, radius 16px) wrapping [toolbar strip + editor]; `.ql-editor` pad **24px**, 16px text, w:770; card w:772 h:556 in the `h-[calc(100vh-8rem)] gap-6` two-pane row | `sf-card mt-3 p-4` textarea | E2 |
| AD3 | Notes title input | "Note title..." placeholder, **14px/700**, borderless, transparent (the ref's TYPED text is white-on-white — its own bug); title row = input + a black square icon button + the Save button | `text-xl` (20px)/700 Input | E3 |
| AD4 | Notes Save | gradient button + floppy icon, computed text **rgb(255,255,0) yellow** (the ref's gradient-button text quirk family); **NO autosave** — typed-but-unsaved content is lost on navigation (the entity stays empty until Save is clicked) | autosave-on-blur only, no Save button | E4 |
| AD5 | Notes Font row | "Font:" label **12px/500 slate-500** + a font picker + black **"Divider" button** (neutral-950 bg rgb(10,10,10), neutral-50 text, radius 6px, 12px, h:32, w:89) above the toolbar | absent | E5 |
| AD6 | Notes tag authoring | "Add tag..." input (14px, **1px neutral-800 border**, h:28) + Enter → editor tag pill **neutral-800 bg + neutral-50 text, radius 6px, 12px, h:22** (visible); entity `tags: ["probe-tag"]`; the LIST row's tag pill is slate-200/50 bg + **white text (invisible — the ref's bug family again)** | tags parsed for the filter only — no authoring UI, no pills | E6 |
| AD7 | Notes list row | selected: `bg-violet-50` (rgb 245,243,255) + **2px violet-200 border** (rgb 221,214,254) + rounded-xl + **p-3** (12px); title **H3 16px/600 slate-800**; preview **P 12px/400 slate-500**; + tag pill; **NO notebook/date line** (row = title + preview + tag only, h:72) | p-4, `border-sf-primary/30`, h2 text-sm/500, text-xs preview + a `notebook · date` line | E7 |
| AD8 | FC study container | **IN-PAGE pane** (replaces the deck-detail region when studying; no fixed/overlay element exists — `overlayFound:false`) | `fixed inset-0 z-50 bg-black/40` overlay | E1 structural |
| AD9 | FC study chrome | **"Exit Study" button**: neutral-950 bg, neutral-50 text, radius 6px, 14px/500, w:137 h:36; counter **"1 / 2"** (spaces, no deck name) 16px/400 **slate-500**; hint **"Click card to flip"** 16px/400 slate-400 below the card | round white X icon button; "Card 1 of 2 · {deck}" white/80; no hint | E2 |
| AD10 | FC study card | container `w-full max-w-2xl` (**672px**) h:320; front face `absolute inset-0 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-2xl p-8` (computed `linear-gradient(to right bottom, rgb(139,92,246), rgb(79,70,229))` — the clone's accent tokens resolve to the SAME stops ✓) + front text **24px/500 white**; back face `bg-white border-2 border-violet-200 rounded-2xl p-8` ✓ + back text **20px/400 slate-700**; flip = a state swap (no transform on the container) | max-w-lg (512px); front text text-xl/600; back text text-lg slate-800; **3D rotateY flip — deliberate superset flourish, KEEP** | E3 |
| AD11 | FC rating flow | after the flip: **Wrong** (neutral-950 bg + **red-600 text** rgb(220,38,38), radius 6px, h:40) + **Correct** (green-500 bg rgb(34,197,94) + the yellow-text quirk, h:40); rating ADVANCES the counter; the last card STAYS displayed (no completion screen — headings:[]) | Prev/Next outline buttons only — **no rating mechanic at all** | **E4 functional** |
| AD12 | FC deck extras (measured, matching or near) | deck sidebar button (selected): violet-50 + 2px violet-200 + p-4 + violet-500 swatch + "N cards" 12px slate-500; card rows: `bg-white rounded-xl border-slate-200 p-4 hover:shadow-md` + difficulty pill **yellow-100/yellow-700** 12px + front 16px/500 slate-800 + back 14px slate-500 + red-500 delete icon | card grid ✓ matches (font-medium 500 vs ref 400 on the pill — cosmetic); difficulty pill ✓ already yellow-100/yellow-700 (AC7 family); edit icon slate-400 (the ref's reads white — its invisible-icon quirk) | match / cosmetic |

**Measured-and-MATCHING (no drift):** the front-face gradient stops
(exact violet-500→indigo-600), the back-face anatomy (white + 2px
violet-200 + rounded-2xl + p-8), the card grid rows + difficulty pill,
the deck dialog (name/description/color, default #8b5cf6), the Add
Flashcard dialog (two textareas + difficulty select), the zero-state
chrome ("No decks yet" / "Select a deck" / "Create Deck"), the Notes
left-pane chrome (search + All Notebooks/All Tags filters + New Note —
pinned S5-L/S8-G), and the Notes entity field coverage the clone
already models (title/content/tags/notebookId).

**Execution TODO (TDD — RED pins first, then GREEN source, in this order):**

1. **AD1 the Quill engine** — `bun add quill` (the same library the ref
   ships — snow theme). A `QuillEditor` client wrapper (dynamic import
   in `useEffect`, `quill/dist/quill.snow.css` imported in the view),
   the measured 20-control toolbar array, a custom `hr` blot for the
   Divider button, debounced onChange → PATCH (the autosave superset).
   Content stays a string in the NoteRow contract — now HTML.
2. **AD2/AD3/AD5/AD6 the editor chrome** — the card reworked to
   `rounded-2xl border border-slate-200 bg-white overflow-hidden`
   wrapping [toolbar strip + `.ql-editor` pad-6 (24px) text-base]; the
   title input → `text-sm font-bold` (14px/700, placeholder unchanged —
   S7-F pin stays valid); the Font row ("Font:" 12px/500 slate-500 +
   font select + the black Divider button); the tag row ("Add tag..."
   h-7 input + Enter → neutral-800/neutral-50 pills with remove ×);
   noteSchema gains nothing (tags already string).
3. **AD4 the Save button** — gradient + Save icon + **white text**
   (honest deviation from the yellow quirk), immediate PATCH + toast;
   autosave stays (superset — the ref loses unsaved content, the clone
   never does).
4. **AD7 the list row** — p-3, selected `bg-violet-50 border-2
   border-violet-200`, title h3 `text-base font-semibold slate-800`,
   preview `text-xs slate-500` via the new **`stripHtmlPreview`** helper
   (`src/lib/text.ts` — unit pins RED first), the tag pill (readable
   slate-600-on-slate-100 — honest deviation from the invisible ref
   pill), drop the notebook·date line (match the ref's 3-line row).
5. **AD8/AD9/AD10 the study rework** — in-page study pane replacing the
   deck-detail region (keep `aria-label="Study mode"` + `data-flip-*`
   so the S7-A pin stays green); "Exit Study" black button; counter
   `"{i+1} / {n}"` text-base slate-500; card `max-w-2xl` + front
   `text-2xl font-medium` + back `text-xl font-normal slate-700`; the
   "Click card to flip" hint text-base slate-400; KEEP the 3D flip
   (superset flourish — static states match the ref exactly).
6. **AD11 the rating mechanic** — after the flip: Wrong (neutral-950 +
   red-600 text) / Correct (green-500 + white text) buttons; Correct
   marks the card `mastered` (the existing column) and advances; Wrong
   advances without mastering; the last card stays displayed (match the
   ref); Prev/Next REMOVED (the rating IS the navigation — no existing
   pin covers them).
7. **globals.css** — pin `neutral-950` (#0a0a0a) + `green-500`
   (#22c554) (trap 10 — assert-on-means-pin); the `.sf-note-hr` style;
   dark-mode overrides for the Quill surfaces (dark:bg-slate-900 card,
   slate-800 toolbar strip, slate-200 editor text — the documented dark
   superset).
8. **Seed** — tags on ONE seeded note ("Dot product intuition" →
   `["linear-algebra","vectors"]`) so the tag pill + editor pills render
   on the populated account (the other notes keep none — the no-tag
   rows stay valid).
9. **e2e RED** — an `S7-AD` pin block (Notes editor ×6: Quill present +
   toolbar count + card anatomy + title 14px/700 + Save + tag flow +
   list-row anatomy + HTML-stripped preview; study ×5: in-page container
   + Exit Study black + "1 / 2" counter + max-w-2xl/24px front +
   Wrong/Correct + hint + no prev/next) run RED against the pre-change
   standalone build, then GREEN.
10. **Doc hygiene** — README badge + session row, AGENTS/CLAUDE counts,
    this record's execution paragraph, worklog, `docs/session_23.md`.

Honest deviations ledger (all pinned with comments): every text the ref
renders white-on-white stays READABLE in the clone (title input, editor
body, list tag pill — the ref's own bug family, documented); the Save
and Correct button text ships white (the ref's yellow-on-gradient
quirk); the 3D flip animation kept (superset flourish); the clone's
autosave kept alongside Save (superset — the ref silently discards
unsaved content); edit/delete card icons slate-400 (the ref's edit icon
reads invisible-white).

**Cycle 27 execution record (session-77).** The plan above was executed
in full, TDD: 7 unit pins (`stripHtmlPreview` — tags stripped, block
joins, entities decoded, length-capped ellipsis, plain-text passthrough)
RED-first (the module did not exist); 10 e2e pins in the S7-AD blocks
(Notes editor ×7, study mode ×3) run **10/10 RED against the pre-change
standalone build** → GREEN 10/10 after the source landed. GREEN source:
`quill@2.0.3` (the reference's own engine) mounted through a new
`QuillEditor` client wrapper (dynamic import + the measured 20-control
snow toolbar + a custom `hr` blot for the Divider button + debounced
autosave + aria-labeled toolbar buttons — Quill ships them nameless);
the notes editor chrome (14px/700 title, Font row + black Divider, tag
row with neutral-800 pills on the already-modeled `Note.tags` JSON, the
gradient Save with immediate PATCH + toast); the list row rework
(violet-50 + 2px violet-200 + p-3 + 16px/600 title + the
`stripHtmlPreview` 12px slate-500 preview + readable tag pill, no
notebook/date line); the flashcards study rework (in-page pane, black
Exit Study, "N / M" counter, max-w-2xl card, 24px/500 front + 20px/400
slate-700 back, the flip hint, the Wrong/Correct rating pair — Correct
marks `mastered` and advances; Prev/Next removed). Three post-GREEN
repairs, each caught by a standing gate: (a) the axe sweep flagged the
heading-order skip (h1→h3) — the rows ship the a11y-clean H2 with the
ref's identical computed 16px/600 styling (the ref's own H3 is its
laxity); (b) Quill's own snow stylesheet out-cascaded the bare
`.ql-editor` pad-24 override — scoped under `.sf-note-editor` for
specificity; (c) two pin calibration fixes (the border transition-race
alpha — settle-then-measure; the max-w-2xl assertion moved to the
button's computed maxWidth, viewport-independent). Gates: lint ✓ tsc ✓
unit **854/854** ✓ build REAL_EXIT=0 fresh; cold re-certification
**409/409** (123+119+50+59+58, first pass every chunk; parity-session7
grew 19→29 chromium with the 10 S7-AD pins); s77 sweep ok:true (9/9
invariants both hosts, brand tables byte-matched, mobile drawers green
on both). Evidence: `docs/screenshots/77-*.png` (the probe pairs + the
debug captures + VLM-verified clone surfaces) +
`scripts/ref-ad-{probe,notes,notes2,notes3,flashcards,flashcards2,flashcards3}-s77.mjs`
+ `scripts/capture-s77-clone.mjs` + `scripts/ref-resweep-s77.mjs`.
**Batch AD: DONE.** Standing debt unchanged: Batch R (RSC structural
perf — the S75 deferral evidence stands) + the pre-existing
`sf-clock-date` dark-sweep artifact (a future audit-tools cycle).

### Cycle 28 (session-78) — the Batch AD post-audit hardening + the mobile two-pane parity gap (measured)

The standing rhythm on the received `2cce898` state: full cold
re-certification FIRST (lint ✓ tsc ✓ unit **854/854** build ✓ e2e
**409/409** cold across the 5-chunk map, first pass every chunk), then
two independent evidence layers — (1) a Mode-C code audit of the Batch
AD diff (security/XSS clean, React-clean, conventions clean) and (2)
the s78 reference re-sweep (`scripts/ref-resweep-s78.mjs`: **ok:true**
— 9/9 invariants both hosts, brand tables byte-matched, mobile drawers
green on BOTH, no Tailwind v4 mobile-nav regression) plus a
`agent-browser` walkthrough of the clone (login → dashboard → the
drawer open/navigate/close cycle → the Notes Quill editor → the
Flashcards study flip/rating flow; zero console errors) and a targeted
**mobile two-pane probe** (`scripts/ref-mobile-{notes,twopane}-s78.mjs`
+ `scripts/sectionaction-probe-s78.mjs` — the DOM authority over two
VLM hypotheses, both disproven: the "stat-card decorative circles"
claim and the "Grade Tracker missing" claim).

| # | Finding | Source | Class |
|---|---------|--------|-------|
| AE1 | **saveNow empty-overwrite window** — `QuillEditor.getContent()` returns `""` (not null) during the dynamic-import window, so `?? selected.content` never fires and a Save click there PATCHes `content:""` over a populated note (silent data loss; the loaded editor still shows the original text) | s78 code audit (M1) | **E1 data-loss** |
| AE2 | **Silent autosave failures** — the debounced `onContentChange` routes `.catch(() => {})`; offline/429/413 (a toolbar-image data URI blows the 100k content cap) vanish with zero feedback while the user believes the autosave superset persisted | s78 code audit (M2) | E2 resilience |
| AE3 | **Dark-mode Quill placeholder invisible** — snow pins `.ql-blank::before` to `rgba(0,0,0,0.6)` ≈ 1.07:1 on the slate-900 editor; the S77 dark block never covered it (sweeps never render a *blank* note) | s78 code audit (L5) | E2 dark-mode |
| AE4 | **Mid-study deck switch keeps a stale `studyIndex`** — the sidebar stays interactive during study (measured), so switching decks mid-study keeps the old deck's index (out-of-range → the pane silently falls back to deck-detail with `studying` still true; in-range → card N of the WRONG deck) | s78 code audit (L6) | E1 correctness |
| AE5 | **`stripHtmlPreview` edge cases** — the cap slice splits surrogate pairs (an emoji at char 59 renders as a replacement char); numeric entities (`&#8212;`, `&#x2014;`) and common named ones Quill emits (`&ldquo;` `&rsquo;` `&hellip;`) pass through undecoded | s78 code audit (L3, executed proof) | E2 polish |
| AE6 | **Mobile two-pane functional SUBSET** — measured on the ref at 390×844: Notes renders the list pane (w-80 @320px + a 14px right sliver, its own 416px overflow) and Flashcards renders the deck list (239px + 112px); the CLONE hides both asides below `md` (the mobile-only h2 + FAB pattern), so a 390px user CANNOT browse or select existing notes/decks at all — a functional subset of the reference (Tasks correctly matches the ref's single-pane mobile shape; StudyGroups already renders its list at all widths) | s78 mobile parity probe | **E1 functional gap** |
| AE7 | **Quill toolbar pickers unlabeled** — the S77 a11y-win labeled the 20 buttons; the 3 picker groups (header/font/size + color/background/align) render nameless label spans | s78 code audit (I) | E2 a11y-win |
| AE8 | **A freshly created note is never auto-selected** — the create flow's `setSelectedId(created)` intent received `void` (`createNote: Promise<void>` discarded the POST's created row), so the editor pane stayed on "Select a note from the list." after every create | surfaced live by the AE3 pin | E1 correctness |
| AE9 | **Exams mobile overflow (584px)** — the search + filter + Add Exam header row (`flex items-center gap-2`, nowrap children) blows past 390; the ref fits (390) | the standing mobile sweep re-run (audit-tools rot — the sweep had not run since the header grew) | E1 layout |
| AE10 | **Files mobile overflow (499px)** — the view-mode + New Folder + Upload actions row exceeds 390; the ref fits | the standing mobile sweep re-run | E1 layout |
| AE11 | **Calculator mobile overflow (427px)** — the 4-mode TabsList bar (413px intrinsic) overflows; the ref overflows identically (429 — its own bug family) | the standing mobile sweep re-run | E1 layout |
| AE12 | **Timetable mobile overflow (402px)** — the All Weeks + Grid Builder + Add Class row; the ref overflows too (395 — its own bug family) | the standing mobile sweep re-run | E1 layout |
| AE13 | **StudyGroups mobile overflow (393px)** — `shrink-0` on the aside + `min-w-0` on the right pane starved the pane to 46px and its empty-state text overflowed; the ref's own aside SHRINKS (222px aside + 112px pane, 390) | the standing mobile sweep re-run | E1 layout |

**Verified non-gaps (documented, no churn):** the dashboard
section-action inner-button radius (ref 6px on the button vs clone 6px
on the anchor — both transparent, borderless, and hover-paint-free on
BOTH hosts, so the delta is invisible in every state; the clone's
anchor-side radius exists to clip its focus-ring superset); the
Wrong-button ≈4.1:1 contrast (measured parity); `mastered` staying
write-only UI state (the counter advance is the reference's own
observable); the ref's mobile Notes 416px overflow (its own bug family
— the clone's `min-w-0` keeps scrollWidth ≤ 390, the standing
superset-quality contract).

**Execution TODO (TDD — RED pins first, then GREEN source, in this order):**

1. **AE5 unit pins RED** — `tests/text.test.ts` new cases: numeric +
   named entity decoding, the surrogate-safe cap (an emoji straddling
   the cap must not split), the plain-text passthrough family.
2. **AE6 e2e pins RED** — `tests/e2e/mobile-navigation.spec.ts` new
   S78 block at 390×844: `/Notes` renders the list pane VISIBLE (the
   h1, the search input, a seeded note row) with scrollWidth ≤ 390,
   and tapping a row selects the note (the editor's title input
   appears); `/Flashcards` renders the deck list VISIBLE and tapping a
   deck row switches the detail heading.
3. **AE1/AE2/AE4 e2e pins RED** — `tests/e2e/parity-session7.spec.ts`
   S78 block: (a) with the quill chunk route-delayed, an immediate
   Save click must NOT PATCH `content:""` (the captured request body
   carries the original HTML); (b) an aborted PATCH during typing
   surfaces the autosave-failure toast (once per streak, not per
   keystroke); (c) advancing to card 2 in deck A then switching to
   deck B resets the counter to "1 / N" of deck B.
4. **AE3 pin RED** — `tests/e2e/dark-mode.spec.ts`: dark PATCH → a
   blank note's `.ql-editor.ql-blank::before` reads the slate-400
   placeholder (not snow's rgba(0,0,0,.6)).
5. **GREEN source** — `src/lib/text.ts` (entity map + code-point-aware
   cap); `src/components/views/quill-editor.tsx`
   (`getContent(): string | null` + picker-label a11y); the notes-view
   (autosave toast-once-per-streak, the aside `flex` at all widths,
   drop the now-redundant mobile-only h2, keep the FAB superset); the
   flashcards-view (the `switchDeck` reset, the aside `flex`); the
   globals.css dark placeholder rule; `src/lib/data.ts` (`createNote`
   returns the created row's id — the AE8 auto-select fix). **The ≥md
   rendering is byte-identical by construction** (`hidden md:flex` →
   `flex` changes nothing at ≥md; the h2 was already `md:hidden`).
6. **Full cold re-certification** — lint → tsc → unit → build → the
   5-chunk e2e cold map (the new pins grow the census) → the s78 sweep
   re-run → the S33 mobile sweep re-run (the no-overflow contract at
   390 now covers the visible asides) → axe re-check.
7. **Evidence + docs** — mobile before/after captures
   (`78-{clone,ref}-mobile-{notes,flashcards,tasks,studygroups}.png`),
   the README session row + counts, AGENTS/CLAUDE counts, this record,
   the worklog Session-78 entry, the `docs/session_25.md` transcript.

**Honest deviations ledger (this cycle):** the clone keeps
`scrollWidth ≤ 390` at mobile (the ref's 416px overflow is its own
bug); the clone keeps the mobile "New note" FAB (a superset quick-action
that coexists with the now-visible list); deck switches mid-study RESET
the study index (the ref's own mid-study switch behavior is unmeasured
— reset-from-card-1 is the least-surprise reading of its always-interactive
sidebar).

**Cycle 28 execution record (session-78):** executed in the documented
TDD order. RED first: 5 unit pins (`tests/text.test.ts` — the numeric/
named entity family + the surrogate-safe cap: 3 failing) and 7 e2e pins
(mobile-navigation +2 AE6 +1 AE9-13, parity-session7 +3 AE1/AE2/AE4,
dark-mode +1 AE3 — **7/7 RED** against the pre-change standalone). GREEN
source: `src/lib/text.ts` (the entity map + `Array.from` code-point cap);
`quill-editor.tsx` (`getContent(): string | null` + the picker
role=group/aria-label a11y); `notes-view.tsx` (the autosave
toast-once-per-streak, the aside `flex` at all widths, the mobile-only
h2 dropped); `flashcards-view.tsx` (the `switchDeck` reset, the aside
`flex` + `aria-label="Deck list pane"`); `globals.css` (the
`.dark .sf-note-editor .ql-editor.ql-blank::before` slate-400 rule);
`data.ts` (`createNote` returns the created row's id — the AE8
auto-select); the five overflow fixes (exams/timetable/files
`flex-wrap` headers, calculator `max-w-full overflow-x-auto` tabs,
studygroups shrinkable aside + content-floor right pane). Two
pin-calibration repairs (the deck-order-agnostic heading — the
collection orders by createdAt so Spanish Vocabulary leads the fresh
seed; the exact:true menuitem — the substring lesson), one AE8 fix
surfaced live by the AE3 pin, and one audit-tools repair
(`capture-studyflow.mjs`'s login selectors — the S15 id rename rot).
Post-fix full cold re-certification: lint ✓ tsc ✓ unit **859/859** ✓
build REAL_EXIT=0 fresh; cold e2e **416/416** (126+122+50+60+58, first
pass every chunk; the census grew 30→411 chromium with the 7 S78 pins +
1 setup per chunk); the mobile sweep re-run: **findings []** — all 20
views ≤ 390 (the five overflow views remediated); the s78 resweep
re-run: ok:true (9/9 invariants both hosts, brand tables byte-matched,
mobile drawers green on both). Evidence: `docs/screenshots/78-*.png`
(the sweep's 9-view clone set + the mobile pairs + the S78 evidence
captures — the mobile two-pane surfaces, the five overflow-fixed views,
the hardened editor + study mode) + `scripts/ref-mobile-{notes,twopane,overflow}-s78.mjs`
+ `scripts/{vlm-verify,sectionaction-probe,mobile-overflow-probe}-s78.mjs`
+ `scripts/capture-s78-clone.mjs` + `scripts/ref-resweep-s78.mjs`.
**Batch AE: DONE.** Standing debt unchanged: Batch R (RSC structural
perf — the S75 deferral evidence stands) + the pre-existing
`sf-clock-date` dark-sweep artifact (a future audit-tools cycle).

### Cycle 29 (session-79) — the study-mode full-replacement parity fix + the mid-band/landscape sweep layer + the audit hardening (measured)

The received state: Session-78/Batch AE at `6a7245e`, re-certified cold
(lint ✓ tsc ✓ unit 859/859, cold e2e 416/416 first-pass every chunk).
Two evidence layers ran before any source change:

1. **Mode-C audit of the Batch AE diff** (the `2cce898..38510aa` source
   surface): 0 Critical / 0 High / 2 Medium / 5 Low / 4 Informational.
   The two Medium: **F1** the surrogate-cap unit pins are
   non-discriminating (both chosen inputs produce identical output under
   the old UTF-16 slice and the new code-point slice — a regression to a
   bare `String.slice` passes the suite); **F2** `autosaveFailedRef` is
   NOT reset on note switch (note A's failed streak silences note B's
   first failure — a swallowed-failure sub-case inside AE2's own goal).
   Lows: F3 the deck-deletion-mid-study `studying` latch, F4 the stale
   `?? stored` fallback race (narrow, strictly better than pre-AE1), F5
   the mobile FAB's stale comment, F6 entity-decoder HTML5 spec
   deviations (cosmetic, no security surface), F7 the AE2 pin's toast
   lifetime margin.

2. **The parity layers**: the s79 reference re-sweep (the s78 class
   re-tagged) — **ok:true**, 9/9 invariants both hosts, brand tables
   byte-matched, mobile drawers green on both. An agent-browser
   walkthrough (login → dashboard → the drawer cycle → Notes →
   Flashcards) — zero console errors, zero page errors, the mobile
   drawer open/navigate/close cycle green. The standing rhythm re-run:
   mobile sweep **findings []** (20/20 clean), **mid-band sweep (768×1024)
   + landscape sweep (844×390) — first re-run since the AE overflow
   family, both flagging the same single finding** (the Tasks aside's
   extra "Lists" h2), dark sweep: the `sf-clock-date` unreadable
   artifact live on all 20 views (contrast 1.78) — the documented
   standing debt, now scoped for closure.

**The headline discovery (the AF1 family).** A directed probe of the
reference's Flashcards at 390×844 (the account's decks were since reset;
a probe deck + card were created to re-measure the populated state)
found the reference's study mode is a **FULL VIEW REPLACEMENT** at BOTH
viewports: entering study swaps out the ENTIRE two-pane layout — desktop
innerText during study is exactly "Exit Study 1 / 1 [card] Click card to
flip" (no "Flashcards" h1, no deck list, no search), the study column
(`w-full max-w-2xl`, 672px) centers in the content area (Exit at x=434
on 1280), and the Exit button + "N / M" counter share a
`flex items-center justify-between mb-8` row (counter right-aligned at
x=1070). At 390×844 the study pane renders FULL WIDTH (Exit x=16,
scrollWidth 390, deck list absent) — mobile study is CLEAN and usable on
the reference. The CLONE renders the study pane INSIDE the two-pane
right pane: at ≥md the deck list stays beside it (structural drift vs
the ref's replacement — invisible to the S7-AD pins, which assert the
pane's internals), and at 390 the right pane squeezes to ~46px — the
Study button itself sits at x=360..432 (clipped outside the viewport; an
agent-browser tap silently misses) and even a forced study entry renders
the Exit button at x=347..419 (out of viewport). **A 390px user cannot
enter or use study mode on the clone — a functional SUBSET of the
reference's working mobile study surface.**

**The second discovery (AF2).** The mid-band sweep (768×1024) flagged
`Tasks: expected "All Tasks", rendered "Lists"` — the clone's Tasks
aside renders an `<h2>Lists</h2>` the REFERENCE DOES NOT HAVE (measured
at 768: the ref's aside carries no heading at all — only the All
Tasks/Important rows + the "MY LISTS" divider label; the first visible
heading on the ref is the main-pane h1 "All Tasks"). The landscape sweep
(844×390) flags the same finding. The h2 is original-scaffold code that
survived every parity batch because the desktop pins assert the h1
(later in DOM order), the copy sweep reads h1/subtitle/buttons, and the
mobile sweep runs below md (the aside hidden) — the mid-band sweep is
the ONLY standing probe that reads the first visible heading through the
band, and it had not been re-run since the two-pane headers grew (the
audit-tools rot lesson, re-learned).

**The third discovery (AF5).** The `sf-clock-date` dark-sweep artifact,
now root-caused: the utility's `.dark &` rule resolves
`--sf-primary-soft-dark` = violet-950 (rgb(76,29,149)) for the sidebar
clock date — 1.78:1 on the dark chip (unreadable on all 20 views). The
theme system's own documented intent (theme.ts: "strong: 600 — clock
date" / "strongDark: 300 — dark-mode strong counterpart") says the dark
clock date belongs on the STRONG-dark family; the reference's dark mode
is its own half-broken family (its sidebar stays fully light-themed —
aside bg rgba(255,255,255,0.8), date violet-600, chip violet-50→indigo-50
— measured through its own Settings UI Theme→Dark), so the clone's full
dark theme remains the documented superset and the fix is a
clone-side readability correction: the date moves to the accent-aware
`--sf-primary-avatar-from` (400) in dark — one step dimmer than the
time's 300, mirroring light's 700/600 one-step hierarchy, contrast ≈5.8
on the dark chip.

**The AF measured table:**

| # | Finding (measured on the reference unless noted) | Clone state | Fix class |
|---|---|---|---|
| AF1 | FC study mode = FULL view replacement both viewports: desktop innerText "Exit Study N / M [card] Click card to flip" only; study column `w-full max-w-2xl` centered (Exit x=434 @1280); Exit+counter on one `justify-between mb-8` row (counter x=1070, 16px); mobile: Exit x=16, scrollW 390, deck list ABSENT | study pane inside the two-pane right pane; deck list beside at ≥md; at 390 the pane is ~46px — Study button x=360..432 clipped (tap misses), Exit x=347..419 out-of-viewport; mobile study impossible | **E1 structural + E2 functional** |
| AF2 | Tasks aside @768: NO heading on the ref (first visible heading = the main h1 "All Tasks"); the ref's aside = rows + "MY LISTS" divider only | clone renders an extra `<h2>Lists</h2>` (original scaffold) — the first visible heading through the 768/844 bands reads "Lists"; flagged by BOTH the mid-band and landscape sweeps | **E3 visual drift** |
| AF3 | (audit F2) note A's failed autosave streak silences note B's first failure — `autosaveFailedRef` never resets on selection change | the toast-once-per-streak flag latches across note switches | **E4 UX hardening** |
| AF4 | (audit F1) the surrogate-cap pins are non-discriminating — the chosen inputs cut BEFORE or AFTER the pair under BOTH the old UTF-16 and new code-point slices | a future regression to `String.slice` passes the suite | **E5 test quality** |
| AF5 | `sf-clock-date` dark: violet-950 @1.78:1 on all 20 views (the standing artifact); theme.ts's own token comments name `strong`/`strongDark` as the clock-date pair; ref's dark mode is its own broken family (sidebar stays light) | the `.dark &` rule uses `--sf-primary-soft-dark` | **E6 superset readability** |
| AF6 | (audit F5) the Notes mobile FAB comment describes the pre-AE6 "two-pane is md+" reality | the FAB overlays the now-rendering list pane; comment stale | **papercut** |
| AF7 | FC aside negotiation: the ref's Flashcards aside SHRINKS at 390 (measured 299px today, 239px in the s78 account state) — its right pane gets ~112px | the clone's aside is `w-80 shrink-0` (fixed 320px) → right pane ~46px; the deck-detail header buttons wrap but the Study button still clips | **E7 flex negotiation (the AE13 pattern)** |

**TDD todo (RED → GREEN, in order):**

1. Unit pins RED (tests/text.test.ts): the discriminating surrogate case
   — 54×"a"+🎓+"tail"@max 56 must keep 🎓 whole (a bare UTF-16 slice
   emits a lone surrogate); plus an entity-decoder named-form passthrough
   pin (`&copy;` surfaces literally — the documented honest deviation,
   pinned so the deviation is a CONTRACT, not an accident).
2. E2E pins RED (the S79 block):
   - mobile-navigation.spec.ts: at 390×844 the Study button is IN
     VIEWPORT and tappable → the study pane renders FULL WIDTH (Exit
     in-viewport, scrollWidth ≤ 390, the deck-list aside ABSENT) → Exit
     Study restores the two-pane layout (the aside back).
   - parity-session7.spec.ts (AF1 desktop): during study the deck-list
     aside is ABSENT and the deck-detail pane is ABSENT (the full
     replacement); the Exit+counter row reads on one justify-between row
     (counter right-aligned); the AE4 pin REWRITTEN to the ref's actual
     semantics — during study the deck list is gone; the switch leg
     becomes exit → switch → Study → the new deck starts at card 1.
   - parity-session7.spec.ts (AF3): the AE2 autosave pin gains a
     note-switch leg — A fails (toast 1) → switch to B → B fails →
     toast 2 fires (the streak flag reset).
   - tasks spec (AF2): the Task-views aside carries NO heading (h2
     count 0) and the "All Tasks" h1 still renders (any viewport).
   - dark-mode.spec.ts (AF5): the dark clock date computes to the
     accent-aware 400-step (rgb(167,139,250) under default violet) and
     the light clock date is unchanged (violet-600).
3. GREEN source, one site at a time, rebuilding between:
   - flashcards-view.tsx (AF1+AF7): the `studying && studyCard &&
     studyDeckId === effectiveDeckId` early-return renders the study
     pane as the view's ONLY content (the ref's replacement), with the
     Exit+counter `justify-between` row and the centered max-w-2xl
     column; `startStudy` stores the study deck id; `selectDeck` (the
     old switchDeck) exits study + resets; the aside drops `shrink-0`
     and the right pane drops `min-w-0` (the ref's own negotiation, the
     AE13 pattern) so the deck-detail header buttons fit at 390.
   - tasks-view.tsx (AF2): remove the `<h2>Lists</h2>`.
   - notes-view.tsx (AF3+AF6): the selection handler resets
     `autosaveFailedRef`; the toast wording goes note-agnostic; the FAB
     comment re-written to the post-AE6 reality.
   - globals.css (AF5): the `.dark &` sf-clock-date rule resolves
     `--sf-primary-avatar-from`.
4. Full cold re-certification: lint → tsc → unit → build → the 5-chunk
   cold e2e map (re-derived census) → the mobile + mid-band + landscape
   sweeps (the Tasks finding must clear) → the dark sweep (the
   clock-date unreadable must clear) → the s79 resweep (ok:true).
5. Evidence: the S79 capture set (the mobile study flow at 390, the
   desktop study replacement, the Tasks aside, the dark clock chip) +
   the refreshed standard 31.
6. Docs: README (counts + the S79 row), AGENTS/CLAUDE counts, this
   record's execution appendix, worklog Session-79, the session_26
   transcript successor, `.env.example` verified.


**Cycle 29 execution record (session-79):** executed in the documented
TDD order. RED first: 2 unit pins (`tests/text.test.ts` — the
discriminating surrogate case 54×"a"+🎓+"tail"@56 [proven discriminating:
the pre-AE5 bare-slice emits a lone U+D83C, the code-point cap keeps 🎓
whole] + the `&copy;` literal-passthrough deviation pin) and 6 e2e pin
behaviors (**6/6 RED** against the pre-change build: the mobile study
full-width pin, the desktop study-chrome pin, the AE4/S79 rewrite [deck
list absent during study], the AE2 note-switch toast leg, the Tasks
aside no-heading pin, the dark clock-date pin). GREEN source:
`flashcards-view.tsx` (the `studying && studyCard && studyDeckId ===
effectiveDeckId` early-return renders the study pane as the view's ONLY
content — the Exit+counter `justify-between` row, the centered max-w-2xl
column; `startStudy(deckId?)` binds the session to its deck; `selectDeck`
replaces switchDeck [every selection lands in deck-detail from card 1];
the below-md in-row Study affordance `aria-label="Study {deck}"` for
decks with cards — the mobile entry; the max-w-2xl restored on the card
button [the AD10 pin's read site]); `tasks-view.tsx` (the `<h2>Lists</h2>`
removed + the AF2b fix: the title div's `sm:min-w-0` dropped — the h1's
width-0 collapse at the md band [pre-existing, unmasked by the h2
removal] now resolves by wrapping, the ref's own shape, without the
ref's 826px overflow); `notes-view.tsx` (`selectNote` resets
`autosaveFailedRef` on every selection change + the create flow; the
toast wording note-agnostic; the FAB comment rewritten);
`globals.css` (the `.dark &` sf-clock-date rule resolves
`--sf-primary-avatar-from` — violet-400, ~5.8:1 on the dark chip).
Three pin calibrations came out of the GREEN runs: the AE6 Flashcards
row-tap now targets the row's h2 (the in-row affordance absorbs the
center-tap), the S79 row-button locator needs `exact: true` (the deck
ROW's role=button accessible name absorbs the affordance's label — the
substring-collision lesson re-hit), and the AD10 max-w-2xl class stays
on the card button (the pin reads the closest button's computed
max-width). Post-fix full cold re-certification: lint ✓ tsc ✓ unit
**861/861** ✓ build REAL_EXIT=0 fresh; cold e2e **421/421**
(127+124+50+62+58, first pass every chunk; the census re-derived with
per-file --list — mobile-navigation 16, parity-session7 32,
parity-session6 16, dark-mode 13); the mobile sweep re-run: **findings
[]**; the mid-band sweep re-run: **findings []** (the Tasks finding
cleared); the landscape sweep re-run: **findings []**; the dark sweep
re-run: **the sf-clock-date unreadable artifact CLEARED** (0 of 20
views; no other unreadable); the s79 resweep re-run: **ok:true** (9/9
invariants both hosts, mobile drawers green on both). Evidence: the
standard 31 refreshed + `docs/screenshots/79-*.png` (the mobile study
flow ×4 [deck list → in-row entry → full-width study → rating → exit],
the desktop deck-detail + full-replacement study, the Tasks 768 aside,
the dark clock chip + dashboard) + the reference probe set
(`79-ref-mobile-flashcards{,-seeded,-card,-study}.png` +
`79-ref-desktop-flashcards-study.png` — the measured basis of the AF1
family) + `scripts/ref-mobile-flashcards-{,seeded-,study-}s79.mjs` +
`scripts/ref-resweep-s79.mjs` + `scripts/capture-s79-clone.mjs`.
**Batch AF: DONE.** Standing debt: Batch R (RSC structural perf — the
S75 deferral evidence stands) remains the only open item; the
`sf-clock-date` artifact is CLOSED (this cycle).

**Honest deviations (pre-declared):**

- The ref's own mobile Flashcards deck-detail overflows massively at 390
  (scrollWidth 836 with a card; 451 with the empty detail) — its own bug
  family. The clone keeps the ≤390 no-overflow contract (the AE13
  negotiation) instead of copying the overflow: the deck-detail is
  cramped-but-usable on the clone where the ref's is broken.
- The Notes view's mobile squeeze (list 320px + ~46px editor) stays the
  documented s78 parity decision (the ref's own Notes mobile is equally
  squeezed — its 416px overflow family); AF1 does not extend to Notes.
- AF4's entity-decoder HTML5 deviations (`&#0;` passthrough,
  surrogate-range numerics, unlisted named entities) are pinned as the
  contract, not "fixed" to the HTML5 spec — the decoder covers what
  Quill emits (the measured surface).
- The study-mode 3D flip stays (the S77-kept superset flourish; static
  states match the ref exactly).
- **AF7 recalibrated during execution (the honest deviation):** the
  planned AE13-style flex negotiation could NOT engage — the Flashcards
  right pane's `overflow-y-auto` collapses the CSS automatic min-size
  (`min-width:auto` → 0 when overflow ≠ visible), and the aside's own
  content floor (294px: the unbreakable "Flashcards" h1 row) exceeds any
  useful detail floor at 390. The executed design keeps the s78
  contained-squeeze shape (aside 320 + detail ~46px, scrollWidth ≤ 390 —
  the SAME documented parity decision the Notes view made) and solves the
  mobile study ENTRY with a below-md in-row Study affordance on each deck
  row (desktop never sees it — byte-identical).

### Cycle 30 (session-80) — the dark-canvas flashbulb family + the Batch AF post-audit hardening (measured)

The received state: Session-79/Batch AF at `23501d8`, re-certified cold
after the 21st workspace reset (lint ✓ tsc ✓ unit 861/861, build
REAL_EXIT=0, cold e2e 421/421 first-pass every chunk on the re-derived
5-chunk map; chromium-1243 re-provisioned — the reset wiped
`~/.cache/ms-playwright/chromium_headless_shell-1243` and every chromium
test failed `browserType.launch` until `bunx playwright install chromium`).

Three evidence layers ran before any source change:

1. **Mode-C audit of the Batch AF diff** (`6a7245e..ed89609`):
   0 Critical / 0 High / 2 Medium / 7 Low / 4 Informational. The two
   Medium: **M1** the AF3 streak reset races an in-flight/flushed autosave
   from the PREVIOUS note — `selectNote` resets the shared flag at switch
   time, but note A's late PATCH rejection re-latches it, so note B's
   first autosave failure is silently swallowed (the exact symptom AF3
   set out to fix, resurfacing through ordering) and the toast text lies
   ("the note is still open" — A is not); **M2** the AF2b 768px Tasks h1
   collapse fix has NO e2e pin (the new AF2 pin asserts the aside
   heading-count at the DEFAULT viewport — it passes pre-AF2b too; only
   the manual mid-band sweep guards the fix). Lows: L1 the study-state
   zombie (external card deletion empties `deckCards` mid-study → the
   guard falls through silently, `studying` stays latched, refilled cards
   auto-resurrect study), L2 `saveNow` success never resets the streak
   flag, L3 study mode leaves the document with ZERO headings and the
   `aria-label="Study mode"` sits on a generic div, L4 the flip button's
   aria-label overrides the card text, L5 the in-row Study button's
   keydown bubbles to the row's `selectDeck`, L6 the flashcards-view
   header comment still describes the S77 in-pane study, L7 the AF2b
   comment overclaims "byte-identical" (long labels now wrap — the h1's
   `truncate` is dead at sm+). Infos: I1 the surrogate pin lacks an
   exact-output assertion, I2 AF5 reuses the avatar-gradient token as
   the clock-date text color (hidden coupling), I3 the AF5 pins
   hardcode violet only (the accent-awareness claim is unpinned), I4 the
   S78 mobile test's `.first()` locator silently depends on DOM order.

2. **The s80 reference re-sweep** (the s79 class re-tagged):
   **ok:true** — 9/9 invariants both hosts, brand tables byte-matched,
   mobile drawers green on both (the user-flagged surface; no Tailwind v4
   mobile-nav bug, traps 4/7/9 verified live yet again). The standing
   rhythm: mobile + mid-band + landscape sweeps **findings []**.

3. **The dark sweep — THE discovery of this cycle: 7 standing flashbulb
   findings** (the detector's `green: hits === 0` classifier says the
   received state's dark canvas is NOT clean, and never was through the
   AE/AF certifications — the S79 narrative recorded only the *unreadable*
   family ("no other unreadable") and called the sweep "artifact-free"
   for the tracked clock-date artifact; the flashbulb entries below were
   present but untracked). The live reference was then measured in DARK
   mode through its own Settings UI (its Light control is a measured
   no-op in the Light-from-dark direction — the account is stuck dark;
   cold fresh-context login renders dark, the Light button's local
   selected-state updates but the html class and the persisted value do
   not, zero network calls — the ref's own broken family, symmetric with
   the documented Dark/System no-op):

   | ID | Surface | Clone dark (measured) | Reference dark (measured s80) | Class |
   |----|---------|----------------------|-------------------------------|-------|
   | AG1 | MyDay "More Options" (button.tsx neutral variant) | bg rgb(245,245,245) + #0a0a0a text — the s69 "dark superset inverts the ramp" | bg **rgb(10,10,10)** + rgb(250,250,250) text — the ref does NOT re-theme it | drift (fix to ref) |
   | AG2 | Calculator History button ×2 (header + panel footer) | bg rgb(241,245,249) slate-100 (dark inversion) | bg **rgb(10,10,10)** + rgb(250,250,250) | drift (fix to ref) |
   | AG3 | Calculator AC key | bg rgb(254,226,226) red-100, un-themed | Clear key: bg **rgb(10,10,10)** + red-600 text (but inside the ref's own white-digit keypad family) | gap (house style) |
   | AG4 | GradeTracker score pills ×3 (emerald/sky/amber-100) | un-themed light pills | unmeasurable (the ref account has no grades) | gap (house style) |
   | AG5 | Tasks aside ACTIVE row | inline `rgb(var(--sf-primary-softest))` — violet-50 light pill | **the SAME violet-50 pill** (the ref keeps it light in dark) | parity-correct but clone-internally inconsistent (the clone's own dark nav re-themes its active surfaces — re-theme per the AF5 clock precedent) |

   The treatment doctrine: AG1/AG2 match the reference's measured dark
   values exactly (parity); AG3/AG4 follow the clone's established house
   dark-pill family (`dark:bg-*-950 dark:text-*-300` — the dashboard
   Today pill / assignments / exams precedent) because those surfaces sit
   inside the clone's superset dark theme where the ref's own dark is its
   half-broken white-keypad family; AG5 re-themes to the token pair the
   clone's own utilities already use (`sf-today-tint`'s dark branch:
   `rgb(var(--sf-primary-soft-dark) / 0.3)` + `--sf-primary-strong-dark`)
   because the clone's dark nav active surfaces already re-theme — the
   Tasks aside pill is the internal outlier, exactly like the AF5 clock
   date was.

**The Cycle-30 TDD execution plan (written BEFORE any source change):**

- **AG1** — button.tsx `neutral` variant: drop
  `dark:bg-[#f5f5f5] dark:text-[#0a0a0a] dark:hover:bg-[#d4d4d4]` (the
  button renders `#0a0a0a` in BOTH modes — byte-parity with the measured
  ref in both). Light unchanged (the S9-R2 pin guards it). Update the
  S9-R2 comment: the ref keeps neutral-950 in dark (measured s80).
- **AG2** — calculator-view.tsx:255 + :389: replace the
  `dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white` inversion
  with the ref's measured dark: `dark:bg-[#0a0a0a] dark:text-[#fafafa]
  dark:hover:bg-[#262626]`.
- **AG3** — calculator-view.tsx:222 AC key: add
  `dark:bg-red-950 dark:text-red-300 dark:hover:bg-red-900` (house pill
  family; visually distinct from the slate-900 digit keys, unlike the
  ref's own near-black-on-near-black Clear).
- **AG4** — gradetracker-view.tsx `scoreBadgeClass`: add
  `dark:bg-emerald-950 dark:text-emerald-300` / `dark:bg-sky-950
  dark:text-sky-300` / `dark:bg-amber-950 dark:text-amber-300` /
  `dark:bg-red-950 dark:text-red-300` per the house family.
- **AG5** — tasks-view.tsx `AsideRow`: replace the active inline style
  with a new `sf-aside-active` utility (globals.css): light =
  `rgb(var(--sf-primary-softest))` + `rgb(var(--sf-primary-deep))`
  (byte-identical computed values — the S6-A pin guards them); dark =
  `rgb(var(--sf-primary-soft-dark) / 0.3)` +
  `rgb(var(--sf-primary-strong-dark))` (the sf-today-tint dark pattern).
- **AG6** — notes-view.tsx (M1 + L2): scope the autosave streak to the
  note — the rejection latches/toasts ONLY if the failed note is still
  the selected note (a `selectedIdRef` comparison); `saveNow` success
  also resets the flag.
- **AG7** — tests/e2e/parity-session6.spec.ts (M2): the 768×1024 Tasks
  pin — viewport resize, h1 "All Tasks" boundingBox width > 40, no
  horizontal overflow.
- **AG8** — flashcards-view.tsx (L5): stopPropagation on the in-row
  Study button's keydown (prophylactic structural fix — the
  double-activation is currently benign with no distinguishing
  observable, documented here rather than pinned).
- **AG9** — flashcards-view.tsx (L3, the safe part): `role="region"` on
  the study wrapper (validates the aria-label, adds a navigable
  landmark; NO sr-only h1 — that would change the AF1-measured innerText
  contract, recorded as the rejected option).
- **AG10** — tests/text.test.ts (I1): the surrogate pin's exact-output
  assertion (`"a".repeat(54) + "🎓" + "…"`, mutation-proven).
- **AG11** — tests (I3 + I4): the accent-variant clock-date dark pin
  (PATCH blue, assert blue-400 rgb(96,165,250)) + the S78 mobile
  locator's `exact: true` hardening.
- **AG12** — docs alignment: vitest.config.ts stale header (834 → 861),
  flashcards-view header comment (L6), the AF2b comment softening (L7),
  theme.ts avatarFrom cross-consumer note (I2).

RED-first pins: AG1/AG2/AG3/AG4/AG5 dark computed-style pins + AG5 light
regression guard, AG6 the note-switch ordering toast pin, AG7 the 768
pin, AG9 the region pin — all expected RED on the pre-change build.
AG10/AG11 are hardening pins (green-verified on arrival,
mutation/discriminating-proven where feasible — the AF4 method).
Deferred with rationale: L1 (the study zombie needs an effect +
set-state-in-effect, which the repo's lint gate forbids — the
external-mutation precondition keeps it Low; documented standing), L4
(the flip aria-label semantics — the ref's own button is unmeasured and
existing pins target the current name), I2's dedicated token (the
cross-consumer note is the low-risk half).

**Verification plan:** full cold re-cert (lint → tsc → unit → build →
cold 5-chunk e2e with re-derived census), the dark sweep re-run
(expected **findings []** — the cycle's headline), dark-mobile-sweep,
mobile/mid-band/landscape re-runs, the s80 resweep re-run after the
final build, evidence `80-*.png` (ref dark anchors + clone before/after
pairs), docs chain, conventional commit, SSH-wrapper push.


### Cycle 31 (session-81) — the departed-settlement family + the standing-suite orchestrator seam + the Zod4 partial-defaults data-loss fix + the audit-tools rot repair (measured)

The received state: Session-80/Batch AG at `8ea4642`, re-certified cold
after the 22nd workspace reset (lint ✓ tsc ✓ unit 861/861, build green,
cold e2e 431/431 first-pass every chunk on the 5-chunk map;
chromium-1243 re-provisioned — the reset wiped it and every chromium
test failed `browserType.launch` until `npx playwright install
chromium`).

Three evidence layers ran before any source change:

1. **Mode-C audit of the Batch AG diff** (`790ea88`): 0 Critical / 0
   High / 1 Medium / 6 Low / 6 Informational. The Medium (**M1**, the
   cycle's headline): the selection-mirror invariant in notes-view.tsx
   is enforced only by a comment — `selectedIdRef` writes live at
   `selectNote`/`createNote`, but `removeNote` never settles the mirror.
   Deleting the selected note leaves `selectedIdRef.current` holding
   the DELETED id while the render-derived `effectiveNoteId` falls back
   to null: the QuillEditor unmount-flush (final PATCH within the ≤600ms
   dirty window, `onChangeRef` captured at render) fires against the
   deleted row, and the late rejection then PASSES the stale-mirror
   guard — toasting a lie onto whatever surface is mounted next and
   re-latching the AF3 streak flag. Verified in source (the flush
   closure and the guard's read site).
2. **s81 reference re-sweep** (the s80 script re-tagged): ok:true — 9/9
   invariants both hosts, brand tables byte-matched, mobile drawers
   green on both.
3. **agent-browser mobile-nav verification on BOTH hosts** (the
   operator's explicit directive): reference drawer opens with 20
   links, navigates, closes on navigate, scrollWidth 416 (its own
   overflow on /Notes); clone drawer 20 links, navigates, closes,
   scrollWidth 390 — **no Tailwind v4 mobile-nav bug**, consistent with
   the standing record.

**The Cycle-31 fix list (planned before any source change, per
doctrine):**

- **AH1** — notes-view.tsx: settle the selection mirror on delete. The
  delete flow mutates the collection, not the selection, so no
  event-handler write site exists — the settlement rides an effect that
  clears `selectedIdRef.current` when `effectiveNoteId` becomes null (a
  ref write in an effect — allowed by the lint contract).
- **AH2** — notes-view.tsx `saveNow` + `onContentChange`: guard BOTH
  settle branches against the departed note (the success toast and the
  failure toast are both surface-lies when the saved/rejected note is
  no longer the selected one; the AF3 flag must not re-latch after a
  departed rejection).
- **AH6** — flashcards-view.tsx: the deck row's `onKeyDown` fires
  `selectDeck` for Enter/Space bubbled from CHILD controls — the
  options DropdownMenuTrigger's keydown (open the menu) bubbles to the
  row and selects the deck while the menu opens (a second
  double-activation path the AG6 click-guard misses). Fix: the row
  handler checks `e.target !== e.currentTarget` before acting.
- **AH3** — globals.css: pin `--color-emerald-200: #a7f3d0` in
  `@theme` (the success toast's dark-mode text, toast.tsx — the last
  unpinned hue on a certified surface; trap-10: unpinned v4-oklch hues
  serialize as `lab(90.2247 -31.039 9.47084)` and break the build).
- **AH7** — scripts/dev-server-preflight.mjs: the GREEN human line goes
  to STDERR (stdout stays JSON-only); suite-verdict.ts
  `parseAuditStdout`: tolerate trailing prose AFTER a complete envelope
  (shrink from the end until JSON parses — a partial/truncated
  envelope still fails LOUD; the anti-phantom guard is preserved).
- **AH8** (found mid-cycle, during the AH2a GREEN verification — the
  combined-file run put dark-mode's Save-pin before AD6/AD7 and the
  seeded note's tag pill vanished) — src/lib/server/entities.ts
  `makeOwnedDelegate.update`: after parsing the partial schema, keep
  ONLY the keys the caller actually sent (absent keys are not writes —
  the preferences route's own `!== undefined` filter, applied at the
  factory). One site covers every owned entity (notes, tasks,
  assignments, exams, events, subjects, decks, cards, practice tests,
  study groups, timetable, files); create-time defaults stay intact on
  the create path; an empty patch short-circuits to the existing row.
  Root cause: **zod@4's `.partial()` does not suppress create-time
  `.default()`** — `noteSchema.partial().parse({title})` →
  `{title, content: "", tags: "[]""}` (verified empirically): every
  partial PATCH on every owned entity reset every defaulted field — a
  title keystroke wiped the note's content AND tags, every autosave
  wiped the tags, a task toggle wiped notes/subtasks/priority —
  invisible to every prior certification through chunk isolation +
  file order.
- **AH9–AH12** (found mid-cycle, when the orchestrator's FIRST
  end-to-end run finished 10/35 — the preflight seam fix had unmasked
  four families of audit-tools rot that the never-runnable orchestrator
  could never surface; every prior session ran the sweeps individually,
  so the rot sat latent) — the repair batch:
  - **AH9** — src/lib/theme.ts + the store's theme action: restore
    `data-accent` on the document at BOTH application sites (the boot
    script + the setTheme action). The S27 accent doctrine has ~16
    sweeps reading `document.documentElement.dataset.accent`; a refactor
    dropped the attribute from `applyToDocument` and every accent sweep
    has been failing its precondition (`data-accent=undefined`) since.
  - **AH10** — the 8 standing-suite stage audits' login waits: the
    login page itself has a `<main>`, so `waitForFunction(main !==
    null)` resolved PRE-AUTH and the first `page.goto` after login
    raced the login POST (ERR_ABORTED on the auth-gate bounce) — the
    audits crash at their first navigation. Fix: the sweeps'
    `waitForURL(/Dashboard)` pattern (prove the redirect, not the
    element). Same repair family: the AI audits' composer locator
    (`textarea` → `input` — the composer was rebuilt on `<Input>`), the
    ai-a11y transcript probes (`main ul/li` → the aria-live pane's div
    bubbles — the transcript markup was refactored off lists), the
    toast probes (`[role=status]` on items → the Toaster's buttons; the
    items are plain buttons, the REGION carries the live semantics),
    the a11y audit's D1 mock (fulfill BOTH `/api/ai/chat` POST and the
    `/api/ai/messages` GET — the view renders the reply from the
    persisted-transcript refresh, not the POST body), the A4c
    over-length probe (schema max raised 2000 → 4000; send 4001), the
    D4 quick-action probe (aria-pressed → the click-to-fill redesign's
    accessible-text + focus-visible contract), the connectivity
    banner probe (`[data-offline]` never existed — the amber
    role=status pill is the real contract), and the settings B1 save
    click (the display-name card's "Save name", not the study-fields'
    "Save profile").
  - **AH11** — scripts/security-audit.mjs: the register-duplicate
    expectation moves to the SHIPPED contract (uniform 200 for verified
    existing emails — the route's own anti-enumeration design,
    documented in its comment; the 409 expectation was the stale side).
  - **AH12** — the volume-sweep family's seeding: the `pinned` field
    never existed on `Note` (Prisma reject on insert) — the
    data-volume and accent-volume sweeps have been dead since the
    schema landed. Field removed.
  - **AH13** (found mid-cycle, from the repaired upload-edge audit's
    C8 finding) — src/app/api/files/route.ts GET: strip the base64
    `data` column from the LIST response (a `select` of the metadata
    columns). The view never reads it (downloads go through the
    per-file `/api/files/[id]` endpoint; its only list-side use is the
    link-file null-check, which `url !== null` already decides); every
    stored ≤2 MiB file otherwise adds ~2.7 MiB of base64 to EVERY list
    fetch — an unbounded payload. Companion view fix: `isLinkFile`
    reads `url !== null`; the audit's C5 probe moves to the shipped 404
    contract ("That folder does not exist.").

RED-first pins: AH1a (the delete flow — no /autosave|offline/i toast
after deleting a dirty selected note under an aborted PATCH route),
AH2a (the departed-Save success — no wrong-surface "Note saved." toast
and B's second failure stays swallowed), AH2b (the departed-Save
failure — silent on B's surface), AH6 (keyboard-opening the options
dropdown of an unselected deck does not select it), AH3b (the success
toast's dark text computes the v3 hex `rgb(167, 243, 208)` — the
trap-10 RED), AH8a (a title edit keeps the note's content AND tags —
the critical data-loss pin), AH8b (autosave keeps the tags), AH8c (an
API-level task `completed` toggle keeps notes/subtasks/priority — the
class proof for the whole owned-entity family), AH13 (the file list
omits the base64 data column while the per-file download serves it).
Hardening pins green-verified on arrival: AH3a (the overdue banner
dark pair), AH3c (the error toast's dark red-200), AH4a (the
calculator footer dark pair), AH4b (the footer light-mode structural
guard), AH7 ×2 unit pins (the trailing-prose tolerance + the
truncated-envelope LOUD failure) — expected 861 → 863 unit.

Deferred with rationale: L4's ~27 pre-existing consumer sites of the
AG-pinned hues (documented standing — the pins re-theme them uniformly
and no observable diverges; a dedicated text-token cycle would touch
27 surfaces for zero user-visible change), the study zombie (L1 — the
AG record's effect+set-state precondition still holds).

**Verification plan:** full cold re-cert (lint → tsc → unit 863 →
build → cold 5-chunk e2e with re-derived census), the emerald-200
mutation proof (un-pin → the lab() serialization reproduces → re-pin),
the FULL standing-suite orchestrator run (the AH7 integration proof —
stage 0 must pass and every stage must go green), the individual
standing sweeps re-run, the s81 resweep re-run after the final build,
evidence `81-*.png` (the resweep set + the AH surface captures), docs
chain, conventional commit, SSH-wrapper push.




## 3a. Verification (session-56 re-run, from a fresh clone)

| Gate | Result |
|------|--------|
| lint / `tsc --noEmit` | clean |
| Vitest unit | 834/834 |
| Playwright e2e (final bundle, cold server + fresh DB per chunk) | **301/301**: chrome+S5/calc/S6 149 · S7–S9+tasks/resilience/s16/s17 98 · auth+s18–s26 54 |
| build (repo script, REAL_EXIT) | green |
| Screenshots | +13 session-56 captures (settings tabs, analytics/gradetracker zero states, studygroups mobile, auth signup mobile, calendar) |

### Cycle 22 (session-71) — the reset-workspace re-certification record (no new batch)

Ran on a RESET workspace (fresh clone at the session_17 transcript
`2d04221` = Batch AA + transcript). Full environment re-provision
(deps, `.env`/`db/custom.db`, chromium-1243, the paramiko ssh shim
rebuilt — this cycle as a full bidirectional pump: the buffered
`stdout.read()` draft deadlocked git's upload-pack handshake, git
waits for the ref advertisement while a buffering shim waits for
channel EOF). Batch AA audited clean via the code-review-checklist
skill (Standards + Spec axes on the `5fcbea6..e161e70` source diff:
measured-value comments at every pin site, no v4 oklab traps, the
opt-in prop defaulting to zero behavior change, the DRY 3-case action
table). Gates re-certified cold:

| Gate | Result |
|------|--------|
| lint / `tsc --noEmit` | clean |
| Vitest unit | 844/844 |
| build (repo script, REAL_EXIT) | green, fresh (`find src prisma -newer BUILD_ID` empty; bundled `.env` AUTH_SECRET empty-string posture) |
| Playwright e2e (5-sub-run map, cold server + fresh DB per chunk) | **381/381**: 113 (nav+S8+mobile-nav) · 109 (S5+sweeps+theme+calc+dark) · 42 (S6/S7+s52) · 59 (S9/S17/tasks/resilience/s16/s14) · 58 (auth+auth-flows+s18–s26+greeting) — the s70 baseline byte-matched; chunk 1b's single first-pass failure = the calculator S15 keyboard cold-boot race (solo re-run green, clean chunk re-run) |
| s71 invariant sweep | **ok:true** — 9/9 per host, brand tables byte-matched, mobile drawers + typography green on both |
| Screenshot pairs (9: 7 desktop + 2 mobile) | ZERO drift candidates — the post-AA dashboard, My Day, Grade Tracker, Practice Tests, Study Groups, Events, Settings (the ref's black panel = the AP-113 frozen-dark artifact), mobile dashboard, mobile drawer byte-matched |
| Lighthouse a11y | login 100 (score 1.0; verified on /login directly + via the unauth redirects); the AUTHED surfaces carried by the green axe sweep + accessibility spec pair (chunk 1b) |

**New lesson AP-116 (the chunk-map census).** The first chunk-3 run
reported 53 where the baseline demanded 58: the compressed map line
"auth" in the s70 transcript meant BOTH `auth.spec.ts` AND
`auth-flows.spec.ts`; the re-derived map silently under-covered 5
tests. Rule: enumerate the spec directory and diff against any
re-derived chunk map before running — a re-certification that
under-covers looks green while specs never ran; when the arithmetic
mismatches the baseline, bisect the map with per-file `--list`
counts, never the baseline.

Honest debt (standing, unchanged): Batch R (RSC structural perf — the
s65 CWV evidence still supports deferring); the pre-existing
sf-clock-date dark-sweep artifact; the other SectionCard consumers'
ref header anatomy (a populated-account probe could settle it).

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
| AP-117 | MEDIUM | The Batch-AB pin draft asserted `getByText("78%")` on the populated GradeTracker's Chemistry card and would strict-mode-violate at GREEN time: Chemistry has ONE seeded grade (78/100), so the card renders the SAME string in two roles (the big avg AND the Recent-Grades pill). The reference never hits this because its avg format is 1dp ("50.0%") while its pills are integer — the clone's integer convention (the measured Overall card) makes avg==pill collisions inherent for single-grade subjects | when a surface renders the same value in two roles, assert through a role hook (`data-testid="gt-subject-avg"`), never bare text; before pinning populated aggregates, check the SEED for coincidences (single-grade subjects, avg==grade); a RED run cannot catch this class — the failure only appears at GREEN when the surface finally renders | tests/e2e/parity-session5.spec.ts (S5-AB7) + scripts/capture-s73-populated.mjs |
| AP-118 | HIGH | The s75 probe's residue scan reported ZERO while a probe-created exam SURVIVED on the reference: the CANDIDATES entity list (inherited verbatim from the s72 probe) had no `Exam` entry — the ref stores exams under `Exam` — so neither the delta scan nor the signature scan ever listed it. DELETIONS showed 4 objects against a measured UI showing 5 probe rows; that cross-check (lesson 8: verify state, not exit codes) is what caught it, and the follow-up cleanup deleted the exam (200) and re-verified ZERO across the extended list | a probe's cleanup candidate list must cover EVERY entity its UI session can write — derive it from the dialogs actually driven, not from a prior session's list; always cross-check the DELETIONS count against the rows the UI measurably gained before accepting a RESIDUE ZERO verdict | scripts/ref-populated-s6family5-s75.mjs + scripts/ref-exam-residue-cleanup-s75.mjs |
| AP-119 | MEDIUM | The s75 probe's assignment/exam submits silently verified the WRONG dialog layer: Radix date-picker popovers are themselves modal `[role=dialog]` elements, so `[role=dialog]` `.last()` scoped the submit-click and the detach-wait to the popover (which never detached) while the form stayed open — the run then poisoned every later nav click and the failure looked like a nav-timeout | scope form dialogs by TITLE (`[role=dialog]:has-text("Add Assignment")`), close the popover first (Escape once → verify `[data-radix-popper-content-wrapper]` is gone), then submit and detach-wait the SCOPED form; verify closure of the layer you mean, never whichever dialog happens to be last | scripts/ref-populated-s6family4-s75.mjs (the failure) vs ref-populated-s6family5-s75.mjs (the fix; submits went false→true) |

**Cycle-30 execution record (Session-80).** TDD, RED first: the 7
mutation-target pins ran **7/7 RED** against the pre-change build
(AG1-AG5's dark computed-style pins + AG6's note-switch ordering pin +
AG9's region pin; the AG6 pin's first draft had a genuine lesson baked
into it — a `toHaveCount(0)` on the toast locator RETRIED past the
toast's 5s auto-dismiss and passed on the dismissal, hiding the very
symptom it existed to catch; the executed pin reads the count
INSTANTLY via `locator.count()`, and the retry-trap is documented at
the pin). The guards verified green on arrival and the AG7 pin was
**mutation-proven**: temporarily re-adding `sm:min-w-0` and rebuilding
made the pin fail exactly as designed ("Expected: visible, Received:
hidden" — the h1 collapses at 768) before the revert. GREEN source:
the neutral variant drops its dark inversion (byte-parity with the
measured ref in BOTH modes), the two Calculator History buttons take
the ref's measured dark (`dark:bg-[#0a0a0a] dark:text-[#fafafa]
dark:hover:bg-[#262626]`), the AC key + the GradeTracker score pills
take the house dark-pill family with FIVE palette steps newly pinned
in `@theme` (red-950, emerald-950, sky-950, amber-950, sky-300 — the
AG3 first draft hit trap 10 head-on: `bg-red-950` serialized as
`lab(13.003 29.04 16.7519)` until the pin landed; the AG4 first draft
hit the SubjectChip locator collision — the row's rounded-full chip
answered `span.rounded-full.first()`, the executed pin addresses the
pill by its text), the Tasks aside active row moves to the new
`sf-aside-active` utility (light byte-identical — the S6-A pins green;
dark = the sf-today-tint token pair, serialized as legacy rgba), the
autosave streak is scoped to the note (`selectedIdRef` mirrors the
selection at its only two mutation sites; late rejections from
departed notes are ignored; a successful explicit Save resets the
streak — L2 folded in), the study wrapper gains `role="region"`, the
in-row Study affordance stops keydown propagation, and the four
hardening pins landed (the exact-output surrogate assertion, the
768 h1 pin, the accent-aware clock-date pin, the S78 locator's
structural scoping).

Full cold re-certification: lint ✓ tsc ✓ unit **861/861** ✓ build
REAL_EXIT=0 fresh; cold e2e **431/431** (127+127+50+69+58, first pass
every chunk — the census re-derived: dark-mode 13→20, parity-session7
32→34, parity-session6 16→17); the dark sweep re-run: **findings
0/20 views — the first clean dark canvas in the sweep's history**
(the cycle's headline); the dark-mobile sweep ok with zero findings;
the mobile + mid-band + landscape sweeps re-run: **findings []**; the
s80 resweep re-run after the final build: **ok:true** (9/9 invariants
both hosts, brand tables byte-matched, mobile drawers green on both —
no Tailwind v4 mobile-nav bug, the user-flagged surface verified live
yet again). One environment lesson recorded for the next reset: the
resweep's mid-run failures were a POISONED :3200 standalone — the
port-owner survived a name-pattern kill (EADDRINUSE killed the new
spawn; the old server served the half-replaced build's chunks as
500s) — kill by PORT-OWNER PID (`ss -tlnp`), never by process-name
grep (the AP-70 lesson re-earned). Evidence: `80-ref-dark-*` (the
reference's dark anchors), `80-clone-dark-*-before/after` (the
flashbulb family's before/after pairs), the standard 31 refreshed,
`80-clone-mobile-*` + the resweep's sweep set.

**Batch AG: DONE.** Standing debt: Batch R (RSC structural perf,
deferred on the S75 CWV evidence) — unchanged; the s80 audit's L1
(the study-state zombie — needs an effect the lint gate forbids;
external-mutation precondition keeps it Low), L4 (the flip button's
aria-label semantics — the ref's own button unmeasured), and I2's
dedicated text token remain documented deferrals.

**Cycle-31 execution record (Session-81).** TDD, RED first — 8
mutation-target e2e pins + 3 data-loss pins went RED against the
pre-change build at their DESIGNED assertions (AH1a: the "still open"
lie toast after deleting a dirty selected note; AH2a: the wrong-surface
"Note saved." toast + the unlatched streak re-toasting beta's second
failure; AH2b: alpha's late Save-failure toast on beta's surface; AH6:
the detail pane reading "Biology Chapter 5" after Enter on the options
trigger; AH3b: `lab(90.2247 -31.039 9.47084)` — the unpinned
emerald-200; AH8a/AH8b/AH8c: the data-loss assertions — the wiped
content ("Empty note"), the vanished tag pill, `notes: ""`), while the
hardening pins verified green-on-arrival (AH3a the overdue banner dark
pair, AH3c the error toast's red-200, AH4a the calculator footer dark
pair, AH4b the footer structural guard, AH7's truncated-envelope LOUD
guard). GREEN source: the mirror-settlement effect in notes-view.tsx (a
ref write in an effect — the delete flow mutates the collection, not
the selection, so no event-handler write site exists), the saveNow
mirror guards on BOTH settle branches, the flashcards row
`e.target !== e.currentTarget` check, the `--color-emerald-200:
#a7f3d0` @theme pin, the preflight GREEN line → stderr, the
`parseAuditStdout` shrink-from-the-end trailing-prose tolerance, the
AH8 factory fix, the AH9 data-accent restoration at both application
sites, and the AH13 files-list metadata strip. Two mutation proofs:
un-pinning emerald-200 reproduced the exact lab() serialization;
removing the row's target check made the AH6 pin fail at the designed
assertion. Pin-design lessons learned the hard way: the seeded decks
share ONE createdAt (the seed's Promise.all batch — the deck-list tie
order is nondeterministic, so the AH6 pin selects its deck explicitly);
a second seeded note carries the same "calculus" tag (an unscoped text
match masks the AH8 wipe — the pins scope to the target row's
`data-note-tag`); and there is no GET item route on the tasks
collection (the AH8c proof reads the PATCH's own response body + the
list round-trip).

Mid-cycle discoveries, root-caused and fixed the same session (the
doctrine: amend the plan, pin first, fix at the source):

1. **AH8 (CRITICAL)** — surfaced by the AH2a GREEN verification (the
   combined-file run put dark-mode's Save-pin before AD6/AD7 and the
   seeded note's tag pill vanished). zod@4's `.partial()` does NOT
   suppress create-time `.default()` — every partial PATCH on every
   owned entity reset every defaulted field. The fix at
   `makeOwnedDelegate.update` (keep only the sent keys) covers all
   sixteen delegates.
2. **AH9–AH12** — surfaced when the orchestrator's FIRST end-to-end
   run finished 10/35 (the preflight seam fix had unmasked four latent
   audit-tools-rot families that the never-runnable orchestrator could
   never surface; every prior session ran the sweeps individually).
   data-accent restored at both theme sites; the 8 stage audits' racy
   login waits replaced with the waitForURL(/Dashboard) proof; the
   register-duplicate expectation moved to the shipped uniform-200
   anti-enumeration contract; the dead `pinned` seeding field removed.
3. **AH13** — surfaced by the repaired upload-edge audit's C8 probe:
   the files LIST leaked the base64 data column (~2.7 MiB per stored
   file on every list fetch). RED-pinned, fixed with a select, view
   companion fix (`isLinkFile` reads `url !== null`).
4. **The light-family checker's transparent-body fallback** — surfaced
   when the accent-light sweep's live run (another never-live stage)
   reported phantom unreadable entries: the glass rail's 0.8 alpha
   fails the checker's > 0.85 walk, and the body fallback
   `bodyBg || {white}` never fired because parse() returns a truthy
   {0,0,0,a:0} for a transparent body — every glass-backed text
   measured against phantom BLACK. The dark family's own fallback
   (near-black) masked the same bug. Fixed across all 13 checker
   embeddings: the fallback now fires on alpha ≤ 0.85.

Full cold re-certification: lint ✓ tsc ✓ unit **863/863** ✓ build
fresh; cold e2e **444/444** (127+135+51+73+58, first pass every chunk —
the S12-B focus-poll ceiling bumped to 15s for the cold-hydration
tail). The standing suite: the orchestrator's stage-0 preflight parse
now PASSES (the AH7 integration proof — the suite had never been
runnable before), and its first live run took stages 0–12 green in
sequence (security, settings-roundtrip, connectivity, upload-edge,
data-volume, forced-colors, print, focus-order, mobile, midband,
landscape, dark-mobile — all findings []); the remaining stages were
verified individually (the S78–S80 convention) — accent-light, dark,
the 8-sweep volume family, the landscape seed sweep, the desktop +
midband + landscape accent sweeps, cwv ×2, ai-error, ai-a11y,
pre15-preflight, dep-audit — all green (the 23rd workspace reset's
process-reaping environment kills long-lived daemons, so the
17-minute accent-dark sweep and the single-run 45-minute full
orchestration cannot complete in one process lifetime; the stage-0
proof + the per-stage green runs are the cycle's verification record).
The s81 resweep re-ran after the final build: ok:true (9/9 invariants
both hosts, brand tables byte-matched, mobile drawers green on both).
agent-browser mobile-nav verified on BOTH hosts (reference 20
links/navigates/closes with its own 416 overflow on /Notes; clone 20
links/navigates/closes at scrollWidth 390 — no Tailwind v4 mobile-nav
bug). Evidence: the resweep set `81-{ref|clone}-*.png` (9 views × 2
hosts + the mobile drawer/dashboard pairs) + the AH surface captures
(`81-clone-ah*.png` — the toast/banner dark family, the calculator
footer, the flashcards rows, the notes tag row).

**Batch AH: DONE.** Standing debt: Batch R (RSC structural perf —
deferred on the S75 CWV evidence) — unchanged; the s80 audit's L1 (the
study zombie), L4's ~27 AG-pinned-hue consumer sites (uniform
re-theme, no observable diverges), and I2's dedicated text token
remain documented deferrals. The AH8 finding's process lesson is
recorded in AGENTS.md's lessons list: zod `.partial()` does not
suppress `.default()` — partial-PATCH endpoints must filter to sent
keys; certification chunk isolation can hide cross-file state
corruption — a combined-file run is what exposed it.

### Cycle 32 (session-82) — the sixteenth delegate + the settlement self-heal + the parser single-line seam (measured)

The received state: Session-81/Batch AH at `7144e71` (+ the operator's
session-log commit `b7c662f` adding `docs/session_33.md`), re-certified
cold after the 24th workspace reset (chromium-1243 re-provisioned —
the reset gotcha again): lint ✓ tsc ✓ unit 863/863, build green, cold
e2e 444/444 first-pass every chunk on the 5-chunk map (127+135+51+73+
58).

Three evidence layers ran before any source change:

1. **Mode-C audit of the Batch AH diff** (`7144e71`): 0 Critical /
   1 High / 0 Medium / 4 Low / 2 Informational.
   - **H1 (the cycle's headline, AI1)**: the AH8 sent-keys filter
     lives ONLY in `makeOwnedDelegate.update` — the sixteenth
     delegate, `flashcardCardDelegate` (hand-written because
     `Flashcard` carries no `userId` — its ownership rides the deck
     join), still writes the FULL parsed object
     (`const data: Row = { ...parsed }`). `flashcardSchema` carries
     create-time defaults (`difficulty: "medium"`,
     `mastered: false`), so every partial PATCH on a CARD
     materializes them: study-mode "Correct" sends `{mastered:true}`
     → a hard card's difficulty silently reverts to "medium"
     (flashcards-view.tsx `rate()`); the card-edit dialog sends
     `{front, back, difficulty}` → a mastered card silently
     un-masters (`mastered` resets to false). Verified empirically
     through the live delegate by the audit (UPDATE SET difficulty
     = 'medium' on a `{mastered:true}` PATCH) and re-verified in
     source + at both UI call sites. The AH8 commit's "one site
     covers all sixteen delegates" claim was false for this one.
   - **L1 (AI2)**: the AH1 settlement effect only CLEARS the mirror —
     it never re-establishes it. In the post-paint/pre-effect window
     a stale closure (effectiveNoteId === null from the prior commit)
     can clear a freshly-set handler write (select B), and until the
     next selection change every guard sees ref(null) ≠ B — the
     note's toasts are silently swallowed (an AE2 doctrine miss).
   - **L2 (AI3)**: `parseAuditStdout`'s shrink loop bound
     `end > start + 1` skips the single-line slice — a single-line
     JSON envelope followed by trailing prose still fails LOUD (the
     exact AH7 failure class; latent because the preflight prints
     multi-line envelopes and its GREEN line moved to stderr).
   - **L3 (AI4)**: the AH4b calculator-footer pin contains a
     tautological assertion — `w ≥ 2·(w/2) − 1` reduces to
     `w ≥ w − 1`, always true; the Equals cell's fill contract is
     unverified.
   - **I1 (AI6)**: the upload POST's 201 response echoes the FULL row
     including the base64 `data` column — a 2 MiB upload returns a
     ~2.7 MiB response body (the LIST-side leak AH13 fixed; the
     create-side echo remained).
   - **I2 (AI5)**: the sent-keys filter's unknown-key safety rests on
     Prisma's implicit skip-undefined semantics (`writes[key]` is
     `undefined` for unknown sent keys) rather than an explicit
     schema-validated-keys intersection.
2. **s82 reference re-sweep** (the s81 script re-tagged): ok:true —
   9/9 invariants both hosts, brand tables byte-matched, mobile
   drawers green on both.
3. **agent-browser mobile-nav verification on BOTH hosts** (the
   operator's explicit directive): reference drawer opens with 20
   links, navigates, closes on navigate, scrollWidth 416 (its own
   overflow); clone drawer 20 links + the superset skip-link,
   navigates, closes, scrollWidth 390 — **no Tailwind v4 mobile-nav
   bug**, consistent with the standing record.

**The Cycle-32 fix list (planned before any source change, per
doctrine):**

- **AI1 (HIGH)** — entities.ts: extract the AH8 sent-keys filter into
  a shared helper (`sentKeysPatch(input, parsed)`) applied at BOTH
  write sites — the factory's `makeOwnedDelegate.update` AND
  `flashcardCardDelegate.update` (whose deckId move-check re-bases
  onto the filtered writes: a deckId the caller did NOT send is not a
  write). The helper intersects the sent keys with
  `Object.keys(parsed)` (AI5 merged: `writes` only ever contains
  schema-validated keys — the explicit contract, not Prisma's
  implicit undefined-skip).
- **AI2 (LOW)** — notes-view.tsx: the settlement effect settles
  UNCONDITIONALLY (`selectedIdRef.current = effectiveNoteId`) — the
  dep-change re-run heals a stale clear that landed after a newer
  handler write (the one-directional clear's race window closes; the
  AH1 clear semantics are preserved exactly when effectiveNoteId is
  null). Standing guard: the AH1a/AH2a/AH2b pin family re-run green
  (behavioral preservation) + this record (the race window itself is
  not deterministically pinnable at e2e level — the honest gap).
- **AI3 (LOW)** — suite-verdict.ts: the shrink loop bound becomes
  `end > start` (the single-line slice is tested; the fallback stays
  as belt-and-suspenders). Unit pin RED-first (a single-line envelope
  + trailing prose currently fails to parse).
- **AI4 (LOW)** — parity-session7.spec.ts AH4b: the tautological
  assertion replaced with the sibling measurement (Equals width ≥
  2 × Backspace width − 1 — the col-span-2 fill contract becomes
  real). Mutation proof: col-span-2 → col-span-1 on the calculator
  footer must turn the pin red.
- **AI6 (LOW)** — files route POST: the 201 response carries the same
  metadata shape as the LIST (base64 `data` stripped from the create
  response; the view's `FileItemRow.data?` optionality already
  anticipates rows without it). Pin: the upload response body has no
  `data` key AND the row still lands in the LIST with its bytes
  fetchable per-file (the AH13 download contract).

Pin plan: +3 e2e pins in parity-session7.spec.ts (AI1a the API
rating-preserve pin, AI1b the API edit-preserve pin, AI1c the
study-mode UI round-trip pin), +1 e2e pin in resilience.spec.ts (AI6),
+1 unit pin in suite-verdict.test.ts (AI3); AI4 rides the existing
AH4b test (assertion replacement). Expected post-cycle census: unit
864, e2e 447 (chunk map 127 + 137 + 52 + 73 + 58 — parity-session7
42→45 incl. the AH4b replacement, resilience 6→7).

**Cycle-32 execution record (Session-82).** TDD, RED first — the AI1
family (AI1a the API mastered-toggle pin, AI1b the API card-edit pin,
AI1c the study-mode UI round-trip pin), the AI3 parser pin, and the
AI6 upload-response pin ALL failed at their designed assertions against
the pre-change build (AI1a/AI1c: `Expected "hard" / Received "medium"`;
AI1b: `Expected true / Received false`; AI3: the single-line envelope +
prose parse returning `ok:false`; AI6: `dataAbsent: expected true,
received false`). AI1c needed one pin repair before its RED was clean
(the rating pair renders only after the flip — AD11's measured gate;
the pin now flips the card before clicking Correct and waits for the
PATCH response). The AI4 assertion replacement was green-on-arrival BY
DESIGN (the Equals cell IS col-span-2 on the shipped build) and was
mutation-proven instead: col-span-2 → col-span-1 on the calculator
footer turned the pin red at exactly the sibling assertion (Equals
233px vs the required ≥ 464px = 2 × Backspace − 2) — the tautology it
replaced would have passed that mutant. GREEN: the shared
`sentKeysPatch` helper (the AH8 filter extracted; sent keys intersected
with the parsed keys — schema-validated keys only, the explicit
contract) applied at BOTH write sites (the factory's fifteen delegates
AND `flashcardCardDelegate`, whose deckId move-check re-bases onto the
filtered writes and whose empty patch now short-circuits to the
existing card); the AH1 settlement effect settles unconditionally (the
dep-change re-run heals a stale clear — the AH1a/AH2a/AH2b family
re-verified green as the behavioral-preservation proof); the parser's
shrink loop bound `end > start` (the single-line slice is tested); the
upload POST's 201 (and the link-create's) response carries the LIST's
metadata shape via the shared `FILE_METADATA` select.

Full cold re-certification: lint ✓ tsc ✓ unit **864/864** ✓ build
fresh; cold e2e **448/448** (127+138+52+73+58, first pass every chunk
— the census re-derived per AP-116: 443 real specs + 5 chunk setups,
the S81's 439 + the four S82 pins; the plan's pre-cycle estimate of
447 double-subtracted the setups). The standing suite: the
orchestrator's live run took stage 0 (the preflight parse — now
single-line-envelope-proof too) plus stages 1–12 green in sequence
(security, settings-roundtrip, connectivity, upload-edge, data-volume,
forced-colors, print, focus-order, mobile, midband, landscape,
dark-mobile); the settings-roundtrip stage's one live-run finding
(`apiName:"Demo Student"` after the probe save) re-ran GREEN standalone
— the environmental save-wait flake under 13-stage serial chromium
load, the documented S81 class. The remaining stages verified
individually: upload-edge 0 findings/10 non-gaps, data-volume 0/10,
ai-error 0/10 (after a dev-server restart — the documented AI-budget
429 test-pollution class), ai-a11y 0/4, dark-sweep 20 views 0 dirty
entries, accent-light 0, the accent-volume family spot-checked green
(dark + dark-mobile + light-midband), pre15-preflight GREEN, dep-audit
GREEN (0 runtime-reachable), cwv-audit-s16 clone scenarios all GOOD
(LCP 252–2436ms, CLS 0 — the two ref-dashboard timeouts are the
reference's own, excluded by the classifier), cwv-volume-stress 0
findings on the re-run (the first run's single finding — Tasks
load-window longTaskTotal 2010ms vs the 2000ms budget — did not
reproduce; a 0.5% throttled-2-run-median overage recorded honestly as
noise). The accent-dark sweep (17 min) remains beyond this
environment's process-reaping cap (its dark-family siblings ran
green). The s82 resweep re-ran after the final build: ok:true (9/9
invariants both hosts, brand tables byte-matched, mobile drawers green
on both). agent-browser mobile-nav verified on BOTH hosts (reference
20 links/navigates/closes with its own 416 overflow; clone 20 links +
the superset skip-link at scrollWidth 390 — no Tailwind v4 mobile-nav
bug). Evidence: the resweep set `82-{ref|clone}-*.png` (18 captures) +
the AI surface captures (`82-clone-ai*.png` — the card grid, the study
rating pair, the notes surface, the files surface, the calculator
footer).

**Batch AI: DONE.** Standing debt unchanged: Batch R (RSC structural
perf — deferred on the S75 CWV evidence), the s80 audit's L1 (the
study zombie), L4's ~27 AG-pinned-hue consumer sites (uniform
re-theme, no observable diverges), and I2's dedicated text token. The
S82 lessons are recorded in AGENTS.md: a fix's "covers all N sites"
claim must be verified per write site (the sixteenth delegate was the
hand-written exception the factory fix never reached); a tautological
assertion is worse than a missing one; a tolerance fix's loop bounds
must include the degenerate slice.

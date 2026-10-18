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
   letting the Playwright config boot its own server.
10. **Display phantoms are real** — stdout/Read can eat `[h`/`[m` byte
    sequences; verify with `od -c` before "fixing" corrupted-looking source.

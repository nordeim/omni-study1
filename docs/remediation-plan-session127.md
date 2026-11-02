# Remediation Plan — Session 127 / Batch CB (Cycle 77)

**Status: COMPLETE** (executed TDD-style 2026-11-02/03 — the verification record is §5 below)
**Date:** 2026-11-02 · **Workspace:** the Batch CA state `3176437` + the operator's `cde890e`
(`docs/session_124.md`, the CA transcript) — the prior working window was interrupted after the
parity measurement phase (the plan itself was never persisted); this window re-ran the full
baseline, re-ran both rotated deep audits (the prior reports were likewise not persisted),
re-verified every finding by direct read, and executed. **Audit-driven hardening session** — the
standing rhythm (audit the prior-batch diff, rotate two fresh-eyes deep audits, re-certify cold).

---

## 0. Scope and Method

The operator directed the standing rhythm: refresh the workspace, re-read the full doc chain
(`AGENTS.md`, `CLAUDE.md`, `README.md`, `PAD`, `omni-study1_SKILL.md`, `docs/session_123.md`,
`docs/remediation-plan-session126.md`, `worklog.md`, `docs/session_124.md`), re-validate against
the codebase, audit with the repo skills as rubrics (`skills/` excluded from checking/testing/
compilation), iterate on visual + functional parity with `https://omni-study1.base44.app/` (the
mobile navigation menu the named focus, Tailwind v4 the named suspicion class), keep the repo a
production-ready functional SUPERSET, verify the `.env`/`db/` contract (`DATABASE_URL=
"file:../db/custom.db"` + `db/` at the repo root; `.env.example` present, tracked, and current),
maintain the vitest + playwright suites, plan remediation for everything found, execute with TDD
(RED → GREEN), capture evidence, update the docs chain, and commit + push to `main` via the SSH
wrapper.

Method (the six-phase workflow): ANALYZE → PLAN (this document) → VALIDATE (every M/H/C finding
re-verified by direct read BEFORE the plan; the L set spot-verified) → IMPLEMENT (smallest safe
diff, TDD) → VERIFY (cold re-cert) → DOCUMENT.

### Baseline (cold, BEFORE any work)

lint ✓ · `tsc --noEmit` ✓ · unit **1145/1145** (42 files) · the canonical build green (exit 0) ·
the cold 5-chunk e2e **538/538 — 142+161+71+93+71, every chunk first-pass** (per-chunk in the
foreground, the cert script's exact kill→fresh-db→run procedure) · the register re-derivation
**249 importers / 130 Usage-line carriers / 0 stale / 119 usage-line-free** (the 31st consecutive
hold, the expectation stated BEFORE the measurement) · the Mode-C audit of the Batch CA diff
(`3176437`, 51 files, +1819/−258): all 22 CA claims re-verified TRUE against the tree (CA1's
calculator-form GET + shared `persistTranscriptPair` + retention trim at both write sites; CA2's
shared `importRowIdError`; CA3's `print:hidden` chrome guards; CA4's heading focus on every
sub-screen CHANGE; CA5's desc+take+reverse + id tiebreak across the 16 factory routes and all 20
export findManys; CA6's deck re-mapping + distinct deck createdAt; CA7–CA13; CA14's import domain
caps riding validation.ts's own exported arrays; zero key material in the diff).

### Live parity (both hosts — agent-browser, mobile 390×844)

**Reference** (logged in `sepnetflix2023@outlook.com`): the standing battery holds — the hamburger
UNLABELED (name=null) · the drawer **no `role=dialog`**, panel **288px**, the true-layer backdrop
**blur(4px)**, exactly **20 nav links** · /Notes horizontal overflow 416 > 390 (the reference's own
defect) · the landscape drawer-nav **scrollHeight 992 > clientHeight, overflow-y auto**. The
reference-specific probes this cycle: the **calendar month grid renders CATEGORY dots** — one
`w-1.5 h-1.5 rounded-full` dot per present category, the legend mapping **Tasks=blue-500,
Assignments=amber-500, Exams=red-500, Classes=emerald-500** (measured: the Nov 12 exam cell carries
`bg-red-500`), and **events do NOT get dots**; the day-detail panel **groups by category**; the
day-detail empty state reads **"No events for this day"**; the **timetable renders 14 hour rows
(7 AM–8 PM)** — the clone renders 12 (7 AM–6 PM).

**Clone** (`:3000`, demo session): the full standing battery GREEN — the labeled hamburger
(a11y superset), `role=dialog` + label, 288px panel (85vw cap), blur(4px) + oklab(0 0 0 / 0.2)
backdrop, 20 links, nav auto-close, /Notes clean (390 = 390), scroll persistence, landscape
992 > 301. **No Tailwind v4 mobile-nav bug — the 29th consecutive live confirmation.**

### The audits (rotated dual deep — fresh eyes on the CA-covered-and-not surfaces)

The rotated pair covered **the views/components family** (all 20+ views, the layout/auth/export/rum
components, the client libs) and **the server/persistence family** (all 61 route files, the
server/http/entities/auth/ai seams, validation/data-import/data-export, db/db-path/dev-preflight,
the Prisma schema + seed). FE: **0C/0H/4M/4L**; server: **1C/4M/3L**. Every finding re-verified by
direct read before this plan (the C/H/M set personally re-read line-by-line; the L set
spot-verified). The one Critical (the in-band reset delivery default posture) was adjudicated
against ADR-013 — see CB14 for the posture decision.

### §0.1 Verified-clean (the next cycle's coverage map)

The full app-shell family (layout, page boot, store hydration lifecycle, router, theme, mobile
chrome, sidebar, connectivity, RUM beacon/toaster); the auth screens' UX contracts; the globals.css
token surface; next.config rewrites + headers; ownership scoping across every delegate (incl. the
deck-scoped card family and the OWNED_FKS registry); the auth route family mechanics (scrypt timing
equalizer, session-version revocation, one-shot token consumption, P2002 race handling,
proxy-aware cookies); body handling (chunked-safe capped readers, multipart reconstruction);
`sentKeysPatch` + the single-leg merges; seed determinism (CA6 deck pins, BX1 padded times, id
tiebreaks); date.ts/router.ts/store.ts/calculator engine/text/folder-tree/theme client libs; the
MyDay/Dashboard/Exams/Events/Notes/StudyGroups/Settings views beyond the findings below; the
export internals (20 scoped findManys, hashless select); import internals (transaction, topo sort,
cycle rejection); health/robots/sitemap; Dockerfile/compose; the test configs; .env.example
accuracy (verified current — no drift this cycle).

## 1. The verified findings (consolidated, de-duplicated)

**H-1 (FE, Verified)** — `focustimer-view.tsx:112-139`: `complete`'s `useCallback` dep array
`[mode, durations, subjectId, toast, mutations]` omits `remaining` — the memoized callback closes
over the mount-time value (1500), so `durations.focus - remaining` is always 0 and
`Math.max(1, …)` floors **every focus session — auto AND manual paths — to `durationSeconds: 1`**.
The S123/BX6 "elapsed duration" fix is dead code behind the stale closure; the BX6 pin
(`>= 1 && < 1500`) is blind to it (1 satisfies both bounds).

**H-2 (FE, Verified)** — `assignments-view.tsx:147` submits the raw `yyyy-mm-dd` from the date
input (no local-noon conversion), and `:130` edit-populates via `row.dueDate.slice(0, 10)` (the
UTC wall-clock). `optionalDate` accepts the bare string (`Date.parse` passes) and the server stores
it as a UTC-midnight instant; the client re-parses with `new Date()` — in any UTC-negative zone the
due date renders one day early and every untouched edit cycle drifts the stored day. Tasks
(`tasks-view.tsx:86-99`) and holidays (`settings-view.tsx:880`) already ship the local-noon
pattern — assignments is the straggler.

**H-3 (server, Verified)** — `ai/generate-questions/route.ts:37-39`: `subjectId: idField
.nullish().transform((v) => (v === "" ? null : v))` — `idField`'s `min(1)` rejects `""` BEFORE the
transform, so the transform is dead; `practicetests-view.tsx:196` sends `""` on the default
no-subject path → the Create Test dialog's AI generation 400s whenever no subject is selected.
The exact BX5 dead-transform shape; the canonical `nullableId` atom already exists.

**M-1 (seed/FE, Verified)** — `gradetracker-view.tsx:284-297`: both `overallAvg` and the
per-subject `avg` are unweighted means over `percentOf`, while the form collects `weight`
(`0-100`) and the seed carries non-uniform weights (0.5–2). Weighted math: overall stays 88%, but
the Mathematics card changes 89 → 90. One pin (`parity-session5.spec.ts:833`, `89%`) re-anchors.

**M-2 (parity, Verified on the reference)** — the calendar month grid renders per-EVENT color dots
(up to 3 + `+N`) while the reference renders per-CATEGORY presence dots (Tasks=blue-500,
Assignments=amber-500, Exams=red-500, Classes=emerald-500; events dotless) — the clone's own legend
already promises the category mapping, the dots contradict it. The reference's day-detail groups by
category; the empty copy reads "No events for this day" (clone: "No events this day").

**M-3 (parity, Verified on the reference)** — the timetable renders 12 hour rows (7 AM–6 PM); the
reference renders 14 (7 AM–8 PM).

**M-4 (FE audit, Verified)** — `timetable-view.tsx:56,113-118`: a class whose start hour falls
outside the rendered band matches no row and silently vanishes from the desktop week grid (the
dialog's time inputs carry no `min`/`max`). Widening to 14 rows narrows but does not close the gap.

**M-5 (FE audit, Verified)** — `aiassistant-view.tsx:81-103` (+ the same shape at
`mathsolver-view.tsx:93-108`, `flashcards-view.tsx:228-243`): the send POST and the post-success
refresh share one `try` — a refresh failure runs the SEND-failure rollback (the delivered message
bounces back into the composer; the solver toasts "could not solve" while the solution is on
screen; a flashcards retry duplicates the drafted cards).

**M-6 (FE audit, Verified)** — `assignments-view.tsx:66`: the local 7-value `TYPES` array omits
`"worksheet"` — the shared `ASSIGNMENT_TYPES` vocabulary (and the import seam, and the seed's own
"Problem set 6" worksheet row) carries 8. Edit on a seeded worksheet row blanks the Type select.

**M-7 (FE audit, Verified)** — `analytics-view.tsx:324-326,399`: the "N% avg progress" caption
renders the completion ratio (share at 100%), not the average of `a.progress`. The zero-state pin
("0% avg progress", fresh user) is unaffected by the derivation; no populated-state pin exists.

**M-8 (server audit, Verified)** — `files/route.ts:48-52` and `files/folders/route.ts:29-35`: the
only two hand-written collection GETs without the CA5 bounded window (no `take`, no id tiebreak) —
import-amplified into unbounded per-request memory (the import can mint ~10⁵ rows in one envelope).

**M-9 (server audit, Verified)** — `data-import.ts:451-548`: the CA14 domain-cap contract misses
several route-enforced, time-independent invariants — `exams.duration` (5–600),
`practiceTests.durationMinutes` (1–600), `focusSessions.durationSeconds` (1–86 400),
`studyGroups.members` length (≤ 50), `grades.weight` (0–100), events start≤end ordering, timetable
hhmm shape + ordering. The third entry point stores rows every interactive route rejects.

**M-10 (server audit, Verified)** — `auth/login/route.ts:30-37`: login's only brake is the
per-IP `login:${ip}` 10/15-min whose key material is client-forgeable (XFF first hop) in the
default `TRUSTED_PROXY_HOPS`-unset posture — while a correct password guess SIGNS THE CALLER IN.
The S123/BX2 doctrine (a per-account budget on the verify route) was never applied to login.
The BX2 no-oracle discipline applies verbatim: the exhausted branch answers the SAME uniform 401
(a distinguishable 429 would be an account-existence oracle — the no-user branch never budgets).

**C-1 (server audit, Verified, adjudicated)** — the in-band reset delivery default: with
`DISABLE_IN_APP_RESET` unset (the default), `forgot-password` returns the live one-shot takeover
link in the response body to any caller who knows the email. ADR-013 documents this as the
single-user no-SMTP posture and ships the opt-out; `AUTH_SECRET` gets a boot guard, the delivery
gates get none. Adjudication: NOT a default flip (it would break the documented single-user
quickstart — there is no mail transport), but the BT5 posture precedent applies — a production
boot warning + honest comments (the "no enumeration" comments are wrong in the default posture:
the body shape — code present or not — is an account-state oracle; inherent to in-band delivery)
+ DEPLOYMENT.md/.env.example guidance. See CB14.

**L set (spot-verified)** — L-1 settings theme pickers apply optimistically with no rollback
(`settings-view.tsx:146-165`); L-2 `toggleTask`'s read-modify-write race drops a rapid double
toggle (`data.ts:449-453` — the BX10 class); L-3 the files Add-Link dialog's `noValidate` kills
both `required` gates — empty links round-trip to a server 400 (`files-view.tsx:556-576,287-304`);
L-4 calculator "=" chaining feeds `formatCalcResult`'s exponential form back as the expression,
which mis-tokenizes (`calculator-view.tsx:168-179` + `calculator.ts:367-373`); L-5 export emits a
`user` profile block the import silently ignores (ADR-019 "exact inverse" promise);
L-6 the twin link-file entry points disagree on `size` (`files/link` stores `url.length`,
`files` POST stores 0); L-7 `deleteCalculatorEntry` targets a nonexistent route (404) — dead code,
zero callers. Plus the doc drift: README:169 (`529` → 538), README:52 (import `10 MiB` cap → the
route's 25 MiB, moved S124/BY3), SKILL:617 (the stale `139+157+71+92+70` chunk map), PAD §12 +
SKILL §5/§11 census anchors, AGENTS/CLAUDE census lines (after the new counts land).

**Dismissed** — the "Due Soon" dashboard copy (parity — measured on the reference in the prior
window, confirmed identical intent); the analytics zero-state caption semantics (reference-
measured, pinned, unaffected).

## 2. The CB set (TDD — RED first, then the source)

The batch name: **the focus-closure + date-round-trip + category-dots set**. Pins ride existing
spec files wherever their family lives (the tripwire-safe doctrine — no new spec files).

- **CB1 (H-1)** `remaining` joins `complete`'s dep array. RED: a clock-accelerated auto-path pin
  (the greeting-clock Clock-API precedent): start a 25:00 focus, `page.clock.fastForward` the full
  span, intercept the POST → the stored `durationSeconds` must be **exactly 1500** (pre-fix: 1).
  The BX6 manual pin stays (elapsed band still true post-fix).
- **CB2 (H-2)** the date-only twins promoted to `date.ts` shared atoms (`toDateInputValue` /
  `fromDueDateInput` — the BX3 doctrine for the date-only family): assignments submits the
  local-noon ISO and edit-populates the local wall-clock; tasks-view and the settings holiday
  dialog adopt the shared atoms (identical semantics, one source). RED: unit pins in `date.test.ts`
  (mirror the BX3 twins' pins) + an e2e pin — create an assignment with a due date, GET the row,
  the stored instant === `new Date(\`${date}T12:00:00\`).toISOString()` computed in the test
  (pre-fix: the raw UTC-midnight string).
- **CB3 (H-3)** the generate-questions `subjectId` swaps the dead transform for the shared
  `nullableId` atom. RED: a fresh-user e2e pin (the BZ5 fresh-user doctrine — never the demo
  budget): POST `{title, subjectId: "", count: 1, persist: false}` → pre-fix 400; post-fix NOT 400
  (the AI layer answers on its own merits; 150s timeout for the deadline).
- **CB4 (M-1)** weighted-mean averages in the Grade Tracker: `overallAvg` and per-subject `avg`
  weight by `grade.weight` (clamped ≥ 0; a zero-total-weight set falls back to the unweighted
  mean — zero-weight grades never zero out an average). RED: the `S5-AB7` re-anchor
  (Mathematics `89%` → **`90%`**) + the overall `88%` guard pin (weighted 87.9 → 88, stable).
  Zero-state pins untouched (no rows → 0%).
- **CB5 (M-2)** calendar category-dot parity: the month-grid dot row becomes per-category
  presence dots (Tasks/Assignments/Exams/Classes — blue/amber/red/emerald `size-1.5 rounded-full`,
  the selected-cell white/90 convention kept), **events dotless**; the `EVENT_DOT_COLORS`/`+N`
  overflow machinery is removed (four categories bound the row); the day detail re-measured on the
  reference at execution (the category-group anatomy) and restructured to match; the empty copy →
  "No events for this day". RED: calendar pins in the parity specs — a seeded exam day renders
  `bg-red-500` presence dots and no event dots (the reference's own measured Nov-12 anatomy), the
  empty-day copy string.
- **CB6 (M-3 + M-4)** `HOURS` → 14 rows (7…20, "7 AM – 8 PM") + the dialog's start-time input gets
  `min="07:00" max="20:59"` (a class can no longer be saved outside the rendered band — the vanish
  finding closed at the input; server schema untouched — legacy/imported rows still render in the
  mobile accordion + My Classes). RED: a timetable pin counting 14 hour rows + a band-guard pin
  (a `06:30` start is rejected by the input's constraint).
- **CB7 (the BZ5 mirror)** PATCH + DELETE join `write:${user.id}` 600/15-min in
  `makeItemRoutes` (after auth, BEFORE readJson — the C1 convention; the same shared bucket, one
  write budget per user). RED (the BZ5 pin shape, fresh TEST-NET users): a PATCH leg (create one
  row, PATCH-loop to the 429, cap 620, Retry-After asserted, anon still 401) + a DELETE leg
  (create+delete pairs to the 429). Suite census: the demo user's per-chunk mutation volume is
  tens — far below 600.
- **CB8 (M-5)** the AI surfaces' send/refresh split: the POST keeps its rollback semantics; the
  post-success refresh gets its own `try` (one retry, then a soft "history refresh failed" toast)
  — a delivered message never bounces back to the composer, the solver never claims failure with
  the solution rendered, a flashcards retry never duplicates drafted cards. All three surfaces
  (chat, solver, flashcards). RED: a route-abort e2e pin (the resilience-spec pattern) — abort the
  messages GET after a successful send → the composer stays empty, no send-failure toast.
- **CB9 (M-6)** assignments `TYPES` → the shared `ASSIGNMENT_TYPES` from validation.ts (the CA14
  single-source; + the "Worksheet" label). RED: an e2e pin — the Create dialog's Type select
  offers 8 options incl. Worksheet; edit on the seeded worksheet row shows the value.
- **CB10 (M-8)** the two hand-written file-family GETs get the CA5 window: files
  `orderBy: [{createdAt: desc}, {id: desc}], take: 500`; folders
  `orderBy: [{createdAt: asc}, {id: asc}], take: 500` (roots-first preserved). RED: unit-level
  shape pins are impractical against the route — the pin is the s14 API-contract family: seed 505
  folders via the import route on a fresh user, GET → exactly 500 (the CA1 import-505 precedent).
- **CB11 (M-9)** `checkDomainCaps` gains the missing invariants (each mirroring its route's Zod
  bound verbatim): `exams.duration` 5–600, `practiceTests.durationMinutes` 1–600,
  `focusSessions.durationSeconds` 1–86 400, `studyGroups.members` array length ≤ 50 (after the
  JSON-parse check), `grades.weight` 0–100, events `startDate <= endDate`, timetable `startTime`/
  `endTime` hhmm shape + ordering. RED: unit pins in `data-import.test.ts` (the CA14 pin family —
  one rejected row per new cap + accepted boundary rows).
- **CB12 (M-10)** the login per-account budget (the BX2 mirror, no-oracle discipline): when the
  account exists, `checkRateLimit(\`loginAcct:${user.id}\`, 10)` runs BEFORE the scrypt burn; an
  EXHAUSTED bucket answers the SAME uniform 401 "Invalid email or password" (indistinguishable
  from a wrong password — never a 429; the correct-password attempt fails too, so guessing is
  bounded at 10/15-min per account); a successful sign-in resets BOTH the IP and the account
  bucket (the progressive model — successes never accumulate). Suite census: the demo account
  sees ≤ ~6 failed logins per 15-min window (auth.spec:75 + auth-flows negatives) — well under
  10; successful logins reset. RED (fresh users, distinct TEST-NET IPs per attempt to isolate the
  account bucket from the IP bucket — the auth-flows:445 OTP-lockout pin shape): 10 wrong
  passwords (ten uniform 401s) → the CORRECT password also fails with the uniform 401 (pre-fix:
  200 signs in); the success-reset leg (5 wrong → correct 200 → 5 wrong → correct 200 — never
  locked).
- **CB13 (M-7)** the analytics Assignments card derives the true mean of `a.progress` (the label
  becomes honest; seeded state renders 42% = mean of 80/40/45/25/60/0). The reference's populated
  card is measured during the live phase to confirm the semantics; the fresh-user zero-state pin
  ("0% avg progress") is unaffected. RED: an e2e pin on the seeded Analytics card asserting
  `42% avg progress`.
- **CB14 (C-1 adjudication)** the BT5 posture precedent for in-band delivery: `instrumentation.ts`
  warns at boot when `NODE_ENV=production` AND in-band OTP/reset delivery is enabled (the exact
  takeover-risk language, pointing at the two env gates); the three delivery routes' comments stop
  claiming "no enumeration" (the body shape IS an account-state oracle in the default posture —
  stated honestly); DEPLOYMENT.md §8 and `.env.example` note the multi-user guidance. No default
  flip (ADR-013 stands). RED: a unit pin on the pure posture predicate (the env-check family).
- **CB15 (L-1)** the settings theme pickers capture the previous value and revert the local
  selection + toast when the PATCH fails. RED: a route-abort e2e pin (abort the preferences PATCH
  → the pressed selection reverts).
- **CB16 (L-2)** `toggleTask` chains per-id: a module-level in-flight map chains each call onto
  the previous toggle's settled promise, re-reading the store AFTER it — rapid double-clicks apply
  in order (the BX10 class closed at the store). RED: an e2e pin — click a task's toggle twice
  with no await between; the final state must equal the original (pre-fix: both read the same base
  → the net-zero double toggle leaves it checked).
- **CB17 (L-3)** the Add-Link dialog's `submitLink` gets the JS guard (trim + non-empty name and
  URL, inline error) — `noValidate`'s dead contract wired by hand. RED: an e2e pin — submit the
  empty link form → no POST fires (request interception count), the inline error shows.
- **CB18 (L-4)** the calculator's "=" chaining: the tokenizer's number token gains the exponent
  leg `(\d+(\.\d+)?|\.\d+)([eE][+-]?\d+)?` — the engine understands its own display format
  (`formatCalcResult`'s `2e+15`/`1e-10` forms re-tokenize as ONE number, the standard scientific
  convention every physical calculator ships; a bare `2e`/`e5` still reads as the Euler constant —
  the exponent leg requires digits). RED: unit pins in `calculator.test.ts` (the chained
  `2e+15`-class regression pins + the bare-`e` name pins hold).
- **CB19 (L-5)** the import applies the envelope's `user` profile block (school, gradeLevel,
  studyGoal, themeMode/accent/avatar, notifications — the harmless fields; email/identity never);
  a garbage block stays ignored (the existing tolerance pin holds). RED: unit pins in
  `data-import.test.ts` + the round-trip pin.
- **CB20 (L-6)** the link-file `size` unifies to `url.length` (the dedicated route's semantics —
  an informative proxy both paths now share). RED: a unit-contract note + the e2e link-creation
  pin extended to assert the size.
- **CB21 (L-7)** the dead `deleteCalculatorEntry` mutation is removed (zero callers verified;
  the advertised-but-nonexistent endpoint contract goes with it).
- **CB22 (docs)** the docs chain: README (`529`→the new chunk map; import cap 10→25 MiB), the
  SKILL doc's chunk-map line + census anchors, PAD (§12 counts + the revision block), AGENTS.md +
  CLAUDE.md census lines, this plan's §5 execution record, `worklog.md` Session-127, and
  `docs/session_125.md` (the session record).

## 3. Verification checklist (the cold re-cert)

1. lint ✓ · `tsc --noEmit` ✓ · full unit (the new census, expected ≈ 1145 → 1160±5, 42 files).
2. The canonical build green.
3. The cold 5-chunk e2e cert (per-chunk, the kill→fresh-db→run procedure): every chunk
   first-pass, the new census (expected ≈ 538 → 550±5) with the re-anchored chunk map.
4. The register re-derivation tripwire (expectation stated BEFORE the measurement:
   **249/130/0/119** — the pins rode existing spec files).
5. The dev db re-pushed + re-seeded; the dev daemon restarted; the live battery: the standing
   mobile battery (both hosts), the calendar category-dot + timetable 14-row parity verified
   against the reference, the CB5 day-detail anatomy measured-then-matched.
6. Evidence frames (non-blank, verified) → `docs/screenshots/`.

## 4. Documentation chain (the same-commit updates)

README (census + import-cap drift), AGENTS.md (census + the CB lessons), CLAUDE.md (census),
PAD (revision block + counts), omni-study1_SKILL.md (chunk map + census), DEPLOYMENT.md §8 (the
in-band delivery multi-user note), `.env.example` (verified current — the delivery-gate comment
gains the production-warning cross-reference), this plan's §5, `worklog.md` Session-127,
`docs/session_125.md`.

## 5. Execution record (2026-11-03)

**RED** (every pin failing for the right reason on the pre-fix tree): unit **23 failed** for the
right reasons (the missing exports ×13 [date twins, importProfilePatch, inBandDeliveryProdWarning],
the absent caps ×7, the exponent mis-tokenization ×3 — plus the 3 intentional holds-pins passing:
the caps' "accepts" boundary rows, the bare-`e` Euler leg, the CB12 reset leg); e2e **CB1**
(`Expected: 1500, Received: 1` — the stale closure demonstrated live), **CB2** (`Expected
"2026-11-22T12:00:00.000Z", Received "2026-11-22T00:00:00.000Z"` — the UTC-midnight storage),
**CB3** (the 400 — the WebServer log shows the dead transform's `Too small: expected string to
have >=1 characters`), **CB4** (89% renders, not 90%), **CB5** (0 dots / the violet event dot /
the wrong empty copy), **CB6** (`Expected: 14, Received: 12` + no band), **CB7-PATCH** (620× 200,
never 429), **CB7-DELETE** (310 pairs, no trip — after the pin-side correction: the first design's
620 pairs tripped on the EXISTING POST budget, not the delete), **CB8** (the composer bounce —
`Expected: "", Received: "S127-CB8 delivered probe"` in the failure snapshot), **CB9** (no
Worksheet option; blank trigger), **CB12** (`Expected: 401, Received: 200` — no lockout),
**CB13** ("0% avg progress" renders), **CB15** (Dark stays pressed), **CB16**
(`Expected: false, Received: true`), **CB17** (no guard), **CB20** (`Expected: 29, Received: 0`).

**Pin-side corrections during RED** (the honest record): the CB1 clock API needed `runFor`, not
`fastForward` (the jump fires each timer at most ONCE — the 1s interval decremented a single
step); the CB4 "90%" needed `{ exact: true }` (substring-matching the "Progress to A (90%)"
label); the CB6 row count needed the LABEL census (the hour-cells container is flat — 12×8=96
children pre-fix); the CB8 composer assertion needed a settle window (the rollback landed inside
the assertion's poll window); the CB9 edit pin needed the raw lowercase textContent (the
"capitalize" class is CSS-only); the CB7-DELETE cap 620→310 (the POST-budget collision); the CB19
gradeLevel needed the vocabulary's "11th Grade" form.

**GREEN**: all CB items implemented (see §2). Interim gates: lint ✓ · `tsc --noEmit` ✓ · unit
**1171/1171** (42 files — 1145 → 1171, +26 exact: date +5, data-import +13, calculator +4,
env-check +4) · the canonical build green.

**The cold re-cert**: **559/559 — 144+177+72+93+73, every chunk first-pass** (chunk 1 twice:
once pre-HOURS-fix — the re-applied CB6a surfaced as 12 rows on the first chunk-2 run; rebuilt,
re-run, exact). The register tripwire: **249 importers / 130 Usage-line carriers / 0 stale /
119 usage-line-free — the EXACT hold (the 32nd consecutive; the pins rode existing spec files)**.

**The live battery** (dev daemon re-seeded FRESH — `rm db/custom.db` + push + seed; the standing
rhythm): the clone's mobile 390×844 battery ALL GREEN — the labeled hamburger (36×36 at
[16,14]), `role=dialog` + label, **288px** panel, **20 links**, the true-layer backdrop
**blur(4px) + oklab(0 0 0 / 0.2)**, nav auto-close, /Notes **clean (390 = 390)**, scroll
persistence (600 → 600 via SPA), landscape **992 > 301, overflow-y auto**. **No Tailwind v4
mobile-nav bug — the 30th consecutive live confirmation.** The CB parity live-verified on the
fresh seed: the calendar's day+1 cell renders **all four category dots in legend order**
[blue-500, amber-500, red-500, emerald-500], day+2 renders the Advisor-meeting EVENT dotless,
the selected cell's dots white; the day+1 detail renders the **Tasks/Assignments/Exams/Classes
groups** (the reference's uppercase-label anatomy); the timetable renders **14 hour rows
(7 AM–8 PM)**; the Grade Tracker Math card **90%**; the Analytics Assignments card
**"42% avg progress"**. Evidence frames: `docs/screenshots/127-clone-{calendar-category-dots,
timetable-14rows,gradetracker-weighted,analytics-avgprogress,mobile-drawer}.png` — all verified
non-blank.

**The reference measurements this cycle** (agent-browser, 2026-11-02/03): the calendar day-detail
anatomy captured in full (`p.text-xs.font-semibold.text-slate-500.uppercase.mb-2` group labels
over `p-3 bg-red-50 rounded-lg border-l-4 border-red-500` rows inside `div.space-y-4`; the empty
state `p.text-slate-400.text-center.py-8` "No events for this day"); the grid dot row
(`div.flex.gap-0.5.mt-1` + `w-1.5 h-1.5 rounded-full bg-red-500`, `bg-white` selected); the
reference's Tasks view carries **0 tasks** and its calendar only the one Nov 12 exam — the
task-row and populated-Analytics semantics are UNMEASURABLE there (the clone's pinned task-row
superset stands; CB13 ships the label-honest derivation). The standing reference battery held
(unlabeled hamburger, 288px panel, no dialog role, 20 links, blur(4px), 992>744 scroll).

**The docs chain** (this commit): README (1171/559/1730 + the import 10→25 MiB cap drift),
AGENTS.md (census), CLAUDE.md (census), PAD **v1.3.35** (the revision block + §8.1 per-file rows
re-measured [sums verified: 1171 unit + 554 e2e] + the Total row + §8.4 floors),
omni-study1_SKILL.md (the chunk map + both census anchors), DEPLOYMENT.md §3 (the CB14
production-warning guidance), `.env.example` (the CB14 cross-reference), this §5, the worklog
Session-127 entry, and `docs/session_125.md`.

**Census movement**: unit 1145 → **1171** (+26); e2e 538 → **559** (+21: chunk 1 +2, chunk 2
+16, chunk 3 +1, chunk 5 +2); total green 1683 → **1730**.

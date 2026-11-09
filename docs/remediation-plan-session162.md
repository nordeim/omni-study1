# Remediation Plan — Session 162 (Cycle 112, Batch DK)

> Status: PLANNED (pre-change record — the immutable plan; the as-executed
> close lives in §9). Written before any source change, per the standing
> doctrine ("write the cycle plan into docs/remediation-plan-sessionN.md
> BEFORE any source change").
>
> Operator directive: refresh the workspace, re-read the doc chain
> (AGENTS/CLAUDE/README/PAD/SKILL + session_195/196 +
> remediation-plan-session161 + worklog), validate against the codebase,
> audit with the repo-included skills (skills/web-application/SKILL.md the
> primary; the skills catalog for the rotation), iterate toward
> visual/functional parity with omni-study1.base44.app (live reference
> login, mobile-nav attention, the Tailwind v4 bug watch), keep `.env` at
> `DATABASE_URL="file:../db/custom.db"` + the repo-root `db/`, validate the
> vitest/playwright suites, remediate TDD-first, capture evidence frames,
> update the doc chain, push via the SSH wrapper. The repo's `skills/`
> folder stays excluded from code checking, testing, and compilation.
> Proceed with best judgement on the remaining open questions (the
> operator's standing instruction).

## §0 Scope, method, cold baseline, live parity

**Workspace (WARM at `108956e` on `main` — the S161/Batch DJ fix
`4eaa9cf` + the operator's session_196 transcript commit `108956e`;
`git pull` verified up-to-date, working tree clean). Environment verified
from the prior session's quickstart state: `.env` byte-identical to
`.env.example` at the documented dev posture
(`DATABASE_URL="file:../db/custom.db"`), the repo-root `db/custom.db`
(389 KB) + `db/e2e.db` present, `bun install` clean (516 installs across
609 packages), bun 1.3.14, node v24.22.2.**

**Cold baseline (before any work): lint ✓ · tsc ✓ · the full Vitest run
1632/1632 (50 files — the documented S161 final state exactly) · the dev
daemon booted with the S9/S31 stale-cache remedy (`rm -rf .next/dev`
before boot; `[boot] studyflow up — node_env=development
db=file:/home/z/my-project/omni-study1/db/custom.db`) · the preflight
GREEN (hydrated, navigation-stable) · the drawer check GREEN (**the 84th
consecutive no-Tailwind-v4-mobile-nav-bug confirmation** — backdrop
oklab(0 0 0 / 0.2) + blur(4px); 288px white panel; 20 links; no footer;
Escape-close superset) · the desktop chrome probe **MATCH** (all five
formal checks, live reference login — sidebar-outer 260 / 20 links /
first-links / mainX 260 / mainWidth 1180, the S142 outer-footprint
probe).** Baseline noise: none.

**The config posture re-validated (the operator's standing ask):** the
vitest include matches `src/**/*.test.ts` + `tests/**/*.test.ts` only
(vitest.config.ts:1123); the playwright testDir is `tests/e2e` with the
production-build webServer on `db/e2e.db` (playwright.config.ts:27);
tsconfig excludes `skills` (tsconfig.json:43); eslint ignores `skills`
(eslint.config.mjs:58) — the repo-included `skills/` folder is excluded
from code checking, testing, and compilation on every axis, as directed.

## §1 The audits (Mode-C; every M/L finding re-verified by direct read by the orchestrator)

### Audit A — the Batch DJ recent-changes axis (the `4eaa9cf` diff; `108956e` docs-only)

**0C / 0H / 0M / 0L / 0I — clean.** All six DJ claims verified DELIVERED
at the source anchors: DJ1's `mutateTags` wrapper (notes-view.tsx:488-501
— the addTag/removeTag handlers route through it, the AG6 departed-note
guard shape); DJ2's band hand-guard ("Classes must start between 7 AM and
8 PM." at timetable-view.tsx:200, the DA2 position); DJ3's EXAM_TYPES
import swap (exams-view.tsx:46 imports from `@/lib/validation`; the local
twin deleted); DJ4's edge-dark token family (theme.ts:83-209 carries
`edgeDark` in all 7 accent maps at the 800-level step +
`--sf-primary-edge-dark` in accentCssVars (:266) + globals.css utility
(:269) + `:root` fallback (:301) + the four site conversions:
tasks/flashcards/notes/analytics); DJ5's resync catch
(`.catch(() => undefined)` at assignments-view.tsx:429); DJ6's comment
honesty (settings-view.tsx:1248-1249, the httpOnly trade-off) — and the
doc census chain machine-verified (README badge 2255 ✓ · AGENTS 1632 +
the 623 e2e map ✓ · CLAUDE 1632 ✓ · PAD v1.3.69 ✓ · SKILL census 2255 ✓
· the vitest header 50/1632 ✓ · the cert runner re-tag 623 ✓) — zero
stale count sites.

### Audit B — the events family (the rotation's fresh axis: the family last deep-swept at S152/DA — 9 cycles stale; the S161 close's §"Next cycle" NAMED this axis: "the events `expandOccurrences` promotion to a `src/lib/` seam with unit pins (the F-7 candidate, recorded for the next events-family cycle)")

The axis read dispatched to a read-only subagent against the
web-application skill's §4/§9/§12/§13/§16/§17 rubric: events-view.tsx +
calendar-view.tsx + the events API routes (collection + [id]) + the
seams they consume (date.ts, validation.ts's event schemas, data.ts's
events mutations, view-collections.ts) + the round-trip verification
against the route/factory wire contracts. **Verdict: 0C / 0H / 1M / 3L /
2I.** The family remains in good shape (ownership in the WHERE clause on
every events query; Zod at both boundaries with the CE5 ordering guards;
the BV10/BX3 datetime round-trip pair; write budget 600/15-min; take:500
bounded reads; zero `useEffect` in either view; zero `space-y/x`
containers; the dark panel carries no `dark:` overrides; icon-only
buttons carry aria-labels; the `aria-pressed` day cells are
forced-colors-supported). The findings (each re-verified by direct
read):

- **F-1 (M — Verified by direct read, the full chain):** the events
  mutations REJECT on the refresh leg after a COMMITTED write —
  `createEvent`/`updateEvent`/`deleteEvent` are `await apiSend(...)` then
  `await fetchAndSet("events")` (data.ts:628-639), and `fetchAndSet`
  rejects when its GET fails (the 20 s CD2 deadline, data.ts:347-358).
  The view's catch then shows `err.message || "Something went wrong."`
  in the STILL-OPEN dialog (events-view.tsx:213-219), fires NO success
  toast, and keeps the form armed — a RETRY re-POSTs and creates a
  DUPLICATE event. The user is told a save failed on a row the server
  committed: the CB8 letter violated (the reference shape in-repo:
  files-view's `refresh()` catches internally and toasts "Could not load
  your files." separately — the S161 plan §8 F-8 adjudication names the
  standard: "refresh() never rejects [no false mutation-failure
  claim]"). The AI family's three CB8 splits (aiassistant:81,
  flashcards:274, mathsolver:92) are the behavioral precedent. The
  sibling views share the pattern (exams/assignments/timetable/notes/
  flashcards dialogs all read "Something went wrong." on the same seam
  rejection — a family-wide posture, not an events regression; the
  family-wide port is the recorded deferral, §8). **Rides §2 (DK1).**
- **F-2 (L — Verified by direct read):** events-view renders the `repeat`
  vocabulary as four hard-coded `<SelectItem>`s (events-view.tsx:538-543)
  beside validation.ts:102's exported `REPEATS` single source — the
  exact S161/DJ3 drift class the census was created to machine-guard,
  but the census's SITES list (tests/enum-single-source.test.ts:26-42)
  carries only the three S161 sites: the events site is UNGUARDED. A
  future `REPEATS` addition (e.g. "yearly") would not appear in the UI
  and no test would fail. **Rides §3 (DK2).**
- **F-3 (L — Verified by direct read + grep):** `isoWeekNumber` is a
  dead export whose doc, test title, AGENTS.md, and SKILL.md all still
  credit it with the Events CW label the view no longer uses — the view
  renders `CW {referenceWeekNumber(focused)}` (events-view.tsx:333, the
  US Sunday-start convention, measured CW 43 on Sun 2026-10-18 where ISO
  reads 42, pinned at date.test.ts:41-59). The stale claim sites:
  date.ts:51 ("the Events panel's CW label"), date.test.ts:29 (the
  describe title), AGENTS.md:128 ("the header carries the `CW <n>`
  calendar-week (`isoWeekNumber`)"), omni-study1_SKILL.md:266 (the same
  claim). A maintainer following AGENTS.md could "fix" the view back to
  `isoWeekNumber` and silently break the measured Sunday parity — with
  no test failing, since nothing production-side reads the function.
  **Rides §4 (DK3).**
- **F-4 (L — Verified by direct read):** the family's three loading
  gates (events-view.tsx:353-356; calendar-view.tsx:233-236 and
  :419-427) render the `aria-hidden` `Spinner` inside a plain
  unlabeled `<div>` — the spinner→content swap is announced to no screen
  reader. The in-repo precedent: calculator-view.tsx:431 carries
  `role="status" aria-label="Loading calculation history"`. Calibrated
  Low because the bare-gate shape is the repo-wide majority posture
  (only calculator-view carries the contract); the family matches the
  majority, but the audit rotation is the moment to close it on the
  axis's own surfaces. **Rides §5 (DK4).**
- **F-5 (I — the S161-recorded F-7 deferral, verified at source):**
  `expandOccurrences` is view-local (events-view.tsx:72-94, not exported)
  with ZERO unit pins (no file under tests/ references it). The S161
  plan §8 recorded: "Promoting the function to a `src/lib/` seam with
  unit pins is genuine tier-1 hygiene... the promotion candidate is
  recorded for the next events-family cycle." THIS cycle is that cycle
  (the named condition arrived). The call-site shape rides the same
  finding: the view invokes it once per event PER DAY with a 1-element
  array and discards the returned Dates (`events.flatMap((e) =>
  expandOccurrences(e, [day]).map(() => e))`, :359-361) — 7×N calls per
  render where N would do. **Rides §6 (DK5).**
- **F-6 (I — Verified by direct read + grep):** the calendar entry in
  view-collections.ts:22 pre-warms `subjects` — but calendar-view.tsx
  reads exactly five collections (tasks/events/assignments/exams/
  timetable, :51-55) and contains ZERO subject references (grep clean;
  the entry dates from the original implementation commit `7b1e78d`,
  never touched since). One wasted parallel GET per cold /Calendar boot.
  The pin (tests/view-collections.test.ts, "mirrors the heaviest views'
  own loadAll sets") asserts the exact 6-key array and rides the change.
  **Rides §7 (DK6).**

**Point 8 (the client ↔ store ↔ api round-trip verdict): COMPATIBLE, no
field drift** — the view sends exactly the 9 `eventSchema` keys
(`EventInput = z.input<typeof eventSchema>`, 1:1); the conversions are
the pinned BX3 pair (`fromDatetimeLocalInput` /
`toDatetimeLocalValue`, round-trip pinned at date.test.ts:223-289); the
server delegate carries `eventCreateSchema`/`eventUpdateSchema` + the
CE5 ordering merge (12 pins in tests/event-merge.test.ts); the store's
`EventRow` mirrors the Prisma `Event` model field-for-field; full-payload
PATCHes dodge the Zod4 `.default()` reset hazard (all keys explicitly
sent). The F-1 gap is error-path plumbing, not shape drift.

**No measurement-gated candidate this cycle** — none of the findings is
profiling-gated.

## §2 DK1 — the events mutation CB8 split (the F-1 close)

The three events mutations in `src/lib/data.ts` gain the contained
refresh catch — the S158/DG3-scoped-updates shape's error-path sibling,
the DJ5 precedent applied at the seam:

```ts
createEvent: async (input: EventInput): Promise<void> => {
  await apiSend("POST", PATHS.events, input);
  // S162/DK1 (CB8): the write is committed — a failed refresh is NOT a
  // failed save … (the full comment in the source)
  await fetchAndSet("events").catch(() => undefined);
},
```

The same `.catch(() => undefined)` rides `updateEvent` and `deleteEvent`.
The WRITE leg keeps rejecting honestly (the caller's catch still sees
real save failures — the dialog stays open, the retry is legitimate).
The refresh failure after a committed write is contained at the seam: the
mutation resolves, the view's success toast + dialog close proceed, and
the stale slice self-heals on the next successful load (the S16 view-
switch pre-warm + the next mutation's own refresh — the DJ5 doctrine:
"a second toast for the same offline window is noise, and the stale
thumb self-heals"). The soft-refresh-toast variant (the AI family's
"Saved — but the list didn't refresh" copy) is REJECTED for the CRUD
seam (§8): the seam cannot toast (lib must not import the component-
layer toast store — the §8 layer model), and the view cannot distinguish
the legs without a seam contract change that would break "every mutation
refreshes the touched collections" for the 51 sibling sites.

**The pins (unit, data-store.test.ts +4 — the CZ1 mock shape):** for
EACH of the three events mutations, "a committed write + a failed
refresh RESOLVES" (apiSend resolves, apiGet rejects →
`resolves.toBeUndefined()`, RED pre-fix: rejects with the GET's error);
plus one "a FAILED write still rejects" leg on createEvent (apiSend
rejects → `rejects.toThrow` — the honest save-failure contract). The
events mutations have exactly ONE consumer (events-view.tsx — verified
by grep), so the behavioral change is fully scoped.

**The pin (e2e, parity-session5 +1 — the CB8-twin network-mock shape):**
route `**/api/events**` so the POST continues (the write lands) but the
GET aborts (the flaky refresh); create an event through the real dialog;
assert the success toast "Event created." IS visible, the dialog is
CLOSED, and the false-failure copy never appears (RED pre-fix: the
mutation rejects on the aborted refresh → "Something went wrong." in the
open dialog, no success toast).

## §3 DK2 — the REPEATS single-source + the census's fourth site (the F-2 close)

events-view imports `REPEATS` from `@/lib/validation` and renders the
SelectItems from it, PRESERVING the reference-measured labels ("No
repeat" for none; capitalized values otherwise):

```tsx
{REPEATS.map((r) => (
  <SelectItem key={r} value={r}>
    {r === "none" ? "No repeat" : r.charAt(0).toUpperCase() + r.slice(1)}
  </SelectItem>
))}
```

The rendered options are value-identical and label-identical to the
current hard-coded set (zero visual delta). The `form.repeat as
EventInput["repeat"]` cast stays (the DJ3 precedent: keep the cast
unless tsc drops it for free). The unused-import gate (tsc
noUnusedLocals) machine-forces the render to actually consume the import
— import + hard-coded items would fail typecheck.

**The pin (unit, enum-single-source.test.ts +2):** the SITES list gains
the events-view/REPEATS entry — the import leg (RED pre-fix: no import)
+ the no-local-twin leg (green-on-arrival — there is no `const REPEATS =`
declaration today; the guard). The census now covers all FOUR
view-consumed schema enums.

## §4 DK3 — the isoWeekNumber doc reconciliation (the F-3 close)

Four stale claim sites corrected (comment/doc-only, zero behavior):

1. `src/lib/date.ts:51` — the doc line becomes "ISO 8601 calendar week
   (a pinned pure helper — NO production caller; the Events panel's CW
   label is `referenceWeekNumber`, the US Sunday-start convention)."
2. `tests/date.test.ts:29` — the test title drops the Events claim
   ("computes the ISO calendar week" — the referenceWeekNumber describe
   at :41 already owns the Events-CW title).
3. `AGENTS.md:128` — "the header carries the `CW <n>` calendar-week
   (`referenceWeekNumber` — US Sunday-start; `isoWeekNumber` is the
   pinned no-caller ISO contrast)".
4. `omni-study1_SKILL.md:266` — the same correction.

`isoWeekNumber` itself STAYS exported (the S128 decision: "the
documented reference-week contrast, pinned by intent" — its pins at
date.test.ts:28-37 and the cross-assertions at :48-60 are the
referenceWeekNumber contract's contrast legs). PAD:1192 mentions "CW <n>
week label" without naming the function — clean. The historical
remediation-plan-session128.md references stay as historical record.

**No new test** (the DJ6 comment-honesty precedent: doc-only riders ride
the diff review; the underlying functions' pins are unchanged).

## §5 DK4 — the three loading gates gain the aria contract (the F-4 close)

The three gate divs gain `role="status"` + an `aria-label` (the
calculator-view.tsx:431 precedent shape, the S14 announcement doctrine):

- events-view.tsx:353 — `aria-label="Loading events"`
- calendar-view.tsx:233 — `aria-label="Loading calendar"`
- calendar-view.tsx:419 — `aria-label="Loading day details"`

No e2e pin (the calculator precedent's own gate carries no pin; the
a11y-sweep's role="status" probes are surface-scoped, none counts the
gates). Rides the diff review.

## §6 DK5 — the expandOccurrences promotion EXECUTED (the F-5 close; the S161-recorded F-7 deferral)

The S161 plan §8 recorded the promotion "for the next events-family
cycle" — this cycle. The function moves VERBATIM from
events-view.tsx:72-94 to a new pure seam `src/lib/events.ts`, with the
parameter typed structurally so `EventRow` satisfies it without an
import cycle:

```ts
export function expandOccurrences(
  event: { startDate: string | Date; repeat: string },
  windowDays: Date[],
): Date[]
```

The view deletes the local copy and imports the seam (the only render
call site, :359-361, is unchanged). The file-header comment line ("this
file owns the recurrence expansion") updates to name the seam. The
structural type keeps the seam pure (no data.ts import — the §8 layer
model; `string | Date` covers the wire's string instants and any Date a
future caller holds).

**The pins (unit, tests/events.test.ts NEW, +8):** the recurrence rules
the audit's edge-case analysis verified by reading but never pinned —
1. `none` hits only the start day;
2. `daily` hits every day from the start (inclusive);
3. `weekly` hits every 7th day across a month boundary (pure day-diff
   `% 7`, no week anchoring);
4. `monthly` hits the same date-of-month, and a Jan 31 start simply
   skips February (the short-month semantics);
5. days before the start never hit (the past-start guard);
6. a `daily` event spanning the US DST transition (2026-03-08) hits all
   window days (the `Math.round` over 86,400,000 absorbs the ±1 h
   midnight shift);
7. a multi-day event hits only its START day (the documented parity rule
   — the Calendar's day detail filters `isSameDay(startDate)`; the
   occurrence model has no spanning);
8. the returned hits are the window's own day values (the promoted API's
   return contract — the caller maps them per-day).

**The call-shape optimization (the per-day 1-element windows) is
ADJUDICATED — DECLINED (§8).**

## §7 DK6 — the calendar pre-warm drop (the F-6 close)

`subjects` leaves the calendar entry (view-collections.ts:22):
`["events", "exams", "assignments", "tasks", "timetable"]` — exactly the
five collections calendar-view reads (:51-55; grep-verified zero subject
references; the entry dates from the original `7b1e78d` implementation
commit and predates the CI7a subjects-need audits that ADDED the key
where views read it). The pin
(tests/view-collections.test.ts, "mirrors the heaviest views' own
loadAll sets") updates the asserted array from 6 keys to 5 in the same
change — the count-lockstep tripwire, resolved in the same commit by
design.

## §8 The adjudications (the rejected/documented findings)

- **The soft-refresh-toast variant of DK1 — REJECTED (the layer-model
  binding):** the CB8 letter's fullest form (the AI family's "Saved —
  but the list didn't refresh. Reload to catch up." copy) requires the
  refresh failure to reach a toast. The toast store lives in
  `src/components/ui/toast.tsx`; `src/lib/data.ts` importing it would be
  a lib→components upward import (the §8 layer model of the
  web-application skill — forbidden). The view-side variant requires the
  seam to stop bundling the refresh (breaking "every mutation refreshes
  the touched collections" for all 51 sites) or to expose per-leg errors
  (a contract change this rotation's scope cannot carry). The contained
  catch delivers the defect's full closure — no false failure claim, no
  armed duplicate retry — with the staleness self-healing through the
  documented pre-warm + next-mutation paths. The DJ5 precedent's own
  adjudication ("a second toast for the same offline window is noise")
  supports the quieter shape.
- **The family-wide CB8 port — RECORDED DEFERRAL:** the exams/
  assignments/timetable/notes/flashcards/tasks mutations share the
  F-1 shape (each family's view dialog reads "Something went wrong." on
  a refresh-leg rejection after a committed write — verified by grep
  across the seven files). The port is mechanical (the same contained
  catch per family) but each family deserves its own rotation-axis
  audit + its own behavioral pin set (the CZ1/DJ1 lesson: a
  convention-spanning change without per-family pins is one refactor
  away from silent forking). Recorded for the next CRUD-family cycles;
  the events pin set here is the template.
- **The DK5 call-shape optimization — DECLINED:** computing a per-day
  event map once per render (N `expandOccurrences` calls over the full
  window instead of 7N calls with 1-element windows) is a pure
  performance polish with NO behavioral driver (the audit's own impact
  note: "negligible at the 500-row window") and render-code churn on a
  parity-pinned surface. The promoted seam's API supports the future
  shape (the return contract pin); the optimization rides a cycle that
  touches the strip's render functionally.
- **The F-4 repo-wide gate aria pass — DECLINED (scope):** the audit
  calibrated L-4 as family-matching (the bare gate is the majority
  posture across ~20 views). This cycle closes the axis's own three
  gates (the calculator precedent); the repo-wide pass rides a future
  a11y-rotation cycle.
- **The S160 close's deferral ledger — unchanged:** the A-M3 stage-2
  triggers, the update-side raw-SQL bulk upsert, the I-4 parse posture,
  the M-1 LLM-side residual; the S161 close's remaining deferrals (the
  files refresh-toast copy harmonization; the
  gradetracker/studygroups/settings-CRUD and AlertDialog-confirm e2e
  coverage gaps).

## §9 The as-executed close

Executed as planned, with the honest arithmetic corrections (the
planned unit estimate 1646 low by 2 — the DK5 pin set materialized as
TEN legs, not eight: the Date-typed-startDate leg and the split
monthly pair [the in-window hit + the Jan-31-skips-February leg] each
earned their own pin):

1. **Unit REDs (5/5 on their designed markers, as run):** the DK1
   resolve trio (create/update/delete each RED on the pre-fix
   refresh-leg rejection — the CZ1 mock shape: apiSend resolves, apiGet
   rejects); the DK2 census import leg (RED on the missing REPEATS
   import — the no-local-twin leg green-on-arrival, the guard); the
   DK5 suite (RED on the missing `src/lib/events` module — the whole
   file fails to import, the designed marker). The fourth data-store
   leg (the failed-write-still-rejects guard) passed green-on-arrival
   by design.
2. **The e2e RED: proven against the pre-fix standalone build.** The
   compile-blocking unit RED file (tests/events.test.ts imports the
   nonexistent seam — `next build`'s tsc step fails on it) was set
   aside for the pre-fix build (the stash mechanics' equivalent — a
   clean pre-fix buildable tree with the e2e spec in place), then
   restored. The DK1 leg failed on the designed marker:
   `getByText('Event created.')` — element(s) not found (the pre-fix
   mutation rejected on the aborted refresh; the false-failure copy in
   the open dialog). GREEN post-fix (the success toast + the closed
   dialog + the no-false-error assertion).
3. **GREEN implementations:** DK1–DK6 as §2–§7 specify (the three
   contained catches at the events seam; the REPEATS import + the
   label-preserving render; the four doc sites; the three aria gates;
   the verbatim seam move + the view import swap; the calendar entry
   drop + the pin re-tag).
4. **The full unit layer green: 1648/1648 (51 files — 1632 + 4 [DK1]
   + 2 [DK2] + 10 [DK5]).**
5. **The full gate: lint ✓ · tsc ✓ · unit 1648/1648 · build ✓ · the
   5-chunk cold cert: chunk 1 154/154 · chunk 2 192/192 · chunk 3
   94/94 (+1, the DK1 leg — the AK1c/d pair flaked once on the
   documented P1008 machine-load class, 94/94 clean on the immediate
   re-run; the pair passes in isolation and touches nothing this cycle
   changed) · chunk 4 95/95 (the calculator-theme leg flaked once on
   the same machine-load class — passes in isolation, clean on the
   re-run) · chunk 5 89/89 — the cert tally 624/624 = census 2272
   green.**
6. **The remediated-tree standing re-confirmation: preflight GREEN
   (the S9/S31 stale-cache remedy applied) · drawer GREEN (the 85th
   consecutive) · the desktop parity probe MATCH (live reference
   login).**
7. **Evidence: docs/screenshots/162-clone-*.png (the standing desktop
   + the mobile drawer [the 85th companion] + the cycle's Events
   surface — the dark terminal panel with the seeded recurring event's
   expanded occurrences), self-verifying (ok: true; the non-blank
   pixel ratios verified: 45.9% / 34.5% / 92.2% — the dark panel's
   by-design floor), captured by scripts/capture-s162-evidence.mjs.**
8. **Docs in lockstep:** README badge/census (2255 → 2272) + the count
   prose sites + the Session-162 row; AGENTS census (1632 → 1648; the
   e2e map 623 → 624) + the F-3 claim fix + the S162 lessons block;
   CLAUDE counts + the S161-missed 619 e2e map site re-anchored to
   624 (an honest-lockstep catch — the S161 update touched CLAUDE's
   unit count but left the e2e map straggler); PAD v1.3.70; the SKILL
   census (all four sites) + the F-3 claim fix + the green-state
   re-anchor; the vitest header re-anchor (+16); the cert runner re-tag
   (623 → 624, chunk 3 93 → 94 — machine-pinned by the
   script-conventions leg updated in the same change);
   docs/session_197.md; the worklog Session-173 entry; this §9; the
   `.env.example` contract re-verified (byte-identical to `.env` — no
   env-var reads changed this cycle).
9. **Commit + push:** the Conventional Commit on `main` + the
   SSH-wrapper push + the operator key shredded after use (§10's
   close).

## §10 The execution checklist

1. Unit REDs first (the designed markers): the DK1 behavioral pair set
   (RED on the resolve legs — the pre-fix mutations reject on the
   refresh failure); the DK2 census import leg (RED — no REPEATS
   import); the DK5 pin set (RED — `tests/events.test.ts` cannot import
   the seam: `src/lib/events.ts` does not exist yet).
2. GREEN implementations: DK1 (the three contained catches), DK2 (the
   REPEATS import + render), DK3 (the four doc sites), DK4 (the three
   aria gates), DK5 (the seam file + the view import swap), DK6 (the
   calendar entry + the pin re-tag).
3. The full unit layer green (the arithmetic: 1632 + 4 [DK1] + 2 [DK2] +
   8 [DK5] = 1646, 51 files — events.test.ts NEW).
4. The e2e leg (parity-session5 +1 [DK1]) — RED-proven against the
   pre-fix standalone build (the stash/rebuild/re-run sequence), then
   GREEN.
5. The full gate: lint · tsc · unit · build · the 5-chunk cold cert
   (154 + 192 + **94** + 95 + 89 = **624**) — census 1646 + 624 =
   **2272**.
6. The remediated-tree standing re-confirmation: preflight · drawer
   (the 85th) · the desktop parity probe (live reference login).
7. Evidence: `docs/screenshots/162-clone-*.png` (the standing desktop +
   the mobile drawer [the 85th companion] + the cycle's Events surface —
   the DK1/DK5 surface this cycle hardened), self-verifying capture
   script per the S159/S160/S161 precedent.
8. Docs in lockstep: README badge/census (2255 → 2272) + the count prose
   sites + the Session-162 row · AGENTS census (1632 → 1646; the e2e map
   623 → 624) + the F-3 claim fix (:128) + the S162 lessons block ·
   CLAUDE counts · PAD v1.3.70 (the revision block) · the SKILL census
   (all sites) + the F-3 claim fix (:266) · the vitest header re-anchor
   (+14) · the cert runner re-tag (623 → 624, chunk 3 93 → 94) ·
   `docs/session_197.md` (the cycle log) · the worklog Session-173 entry
   · this plan's §9 close · the `.env.example` contract re-verified (no
   env-var reads change this cycle).
9. Commit (Conventional Commit on main) + the SSH-wrapper push + the
   operator key shredded after use.

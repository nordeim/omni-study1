# Remediation Plan — Session 161 (Cycle 111, Batch DJ)

> Status: PLANNED (pre-change record — the immutable plan; the as-executed
> close lives in §9). Written before any source change, per the standing
> doctrine ("write the cycle plan into docs/remediation-plan-sessionN.md
> BEFORE any source change").
>
> Operator directive: refresh the workspace, re-read the doc chain
> (AGENTS/CLAUDE/README/PAD/SKILL + session_193/194 +
> remediation-plan-session160 + worklog), validate against the codebase,
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

**Workspace (a FRESH CLONE at `e8fe09f` on `main` — the S160/Batch DI fix
`36e0554` + the operator's session_194 transcript commit `e8fe09f`;
`git pull` verified up-to-date). Environment built from the documented
quickstart: `.env` created from `.env.example` (byte-identical at the
documented dev posture — `DATABASE_URL="file:../db/custom.db"`), the
repo-root `db/` created by `bun run db:push && bun run db:seed`
(custom.db 389 KB, the demo account seeded), `bun install` (510
packages), the Playwright chromium cache installed (headless-shell
v1243), bun 1.3.14, node v24.22.2.**

**Cold baseline (before any work): lint ✓ · tsc ✓ · the full Vitest run
1622/1622 (49 files — the documented S160 final state exactly) · the dev
daemon preflight GREEN (hydrated, navigation-stable) · the drawer check
GREEN (**the 82nd consecutive no-Tailwind-v4-mobile-nav-bug
confirmation** — backdrop oklab(0 0 0 / 0.2) + blur(4px); 288px white
panel; 20 links; no footer; Escape-close superset) · the desktop chrome
probe **MATCH** (all five formal checks, live reference login —
sidebar-outer 260 / 20 links / first-links / mainX 260 / mainWidth 1180,
the S142 outer-footprint probe).** Baseline noise: none.

**The config posture re-validated (the operator's standing ask):** the
vitest include matches `src/**/*.test.ts` + `tests/**/*.test.ts` only
(vitest.config.ts); the playwright testDir is `tests/e2e` with the
production-build webServer on `db/e2e.db`; tsconfig excludes `skills`;
eslint ignores `skills` — the repo-included `skills/` folder is excluded
from code checking, testing, and compilation on every axis, as directed.

## §1 The audits (Mode-C; every M/L finding re-verified by direct read by the orchestrator)

### Audit A — the Batch DI recent-changes axis (the `36e0554` diff; `e8fe09f` docs-only)

**0C / 0H / 0M / 0L / 0I — clean.** All six DI claims verified DELIVERED
at the source anchors: DI1's interactive `$transaction` with the
`{ timeout: 15_000 }` option on generate-cards (route.ts:126 — both
siblings carry the same form, chat:131 + solve:93); DI2's user-message
refine with the named copy (validation.ts:573); DI3's two census legs in
tests/ai-routes-census.test.ts (the shared budget-key form + the
tx-timeout pairing); DI4's `updatedAt` map entry
(messages/route.ts:37); DI5's solver/flashcards CB8 twin pins
(parity-session8.spec.ts:1639/:1667); DI6's pre-LLM wire pin family
(resilience.spec.ts:1665+) — and the doc census chain machine-verified
(README badge 2241 ✓ · AGENTS 1622 ✓ · CLAUDE 1622 ✓ · PAD v1.3.68 ✓ ·
the SKILL census [2241 = 1622 + 619, the 5-chunk map] ✓ · the vitest
header 49/1622 ✓ · the cert runner re-tag 619 ✓) — zero stale count
sites.

### Audit B — the FE/views family (the rotation's fresh axis: the family last deep-swept at S151/CZ — 9 cycles stale, the most stale family on the board after the AI/export/import rotations)

The axis read dispatched to a read-only subagent against the
web-application skill's §4/§9/§12/§13/§16/§17 rubric: all 23 view files +
the 6 layout files + the two auth surfaces + the data-layer seams they
consume (store/api/data/view-collections) + the round-trip verification
against the route/factory wire contracts. **Verdict: 0C / 0H / 2M / 3L /
3I.** The family remains in unusually good shape (9 hardening cycles
closed the stale-base races, double-fire latches, false-empty gates, and
CB8 splits; all 69 store selectors are stable slice reads; no `as any`
casts; no margin-in-space-y violations; the CB8 split correct at all
four AI/generation sites). The findings (each re-verified by direct
read):

- **F-1 (M — Verified by direct read + git history):** the Notes
  tag mutations fire `void mutations.setNoteTags(...)` with NO catch
  (notes-view.tsx:479-481 addTag, :487 removeTag) while the seam
  REJECTS to the caller by design (data.ts:697-713 — "the CALLER still
  gets the real rejection"). The tag draft was already cleared
  (`setTagDraft("")` at :455), so an offline/flaky tag add/remove is
  fully silent (nothing in the store, no toast, no aria-live
  announcement) PLUS an unhandled promise rejection — the exact
  "input cleared, nothing happened, no reason" class S150/CY3 fixed
  for the same handlers' validation guards, and an S118/BS9 violation
  (the S151/CZ1 refactor dropped the pre-CZ catch that routed through
  `patchSelected`). **Rides §2 (DJ1).**
- **F-2 (M — Verified by direct read):** the Timetable band guard is
  INERT — the form carries `noValidate` (timetable-view.tsx:577) which
  disables ALL interactive constraint validation on submission, so the
  `min="07:00" max="20:59"` attributes the S127/CB6b comment claims
  "keep every new/edited start inside the band" constrain only the
  picker UI, never a TYPED value. A typed `06:00` start submits clean
  (the hand-guards check only non-empty fields; the `hhmm` atom accepts
  any h ≤ 23) and the class then matches no `HOURS` row (7..20) — it
  silently VANISHES from the desktop week grid, the exact
  "perceived data loss on the primary surface" the comment says the
  guard prevents. The e2e pin (parity-session7:1893-1894) asserts only
  that the attributes EXIST. **Rides §3 (DJ2).**
- **F-3 (L — Verified by direct read):** exams-view forks the
  EXAM_TYPES enum — a local 6-value twin (exams-view.tsx:49) beside
  validation.ts:122's single source, value-equal today (no live bug)
  but the exact S127/CB9 drift class (the assignments twin missed
  "worksheet" and blanked the Edit select on seeded rows). Neither
  EXAM_TYPES nor its two swept siblings (ASSIGNMENT_TYPES, CB9;
  GRADE_LEVELS, S130/CE9) has a single-source census pin — the
  doctrine is unpinned. **Rides §4 (DJ3).**
- **F-4 (L — Verified by direct read + the VIOLET_RESIDUALS register
  read):** four hardcoded violet DARK branches bypass the accent token
  system (tasks-view:115 `dark:hover:border-violet-800`;
  flashcards-view:437 `dark:border-violet-800`; notes-view:736
  `dark:border-violet-900`; analytics-view:430 `dark:bg-violet-900/50`)
  — under any of the 6 non-violet accents in dark mode these surfaces
  stay violet while every sibling dark surface re-themes. This is the
  DOCUMENTED S135/CJ3 deferral (the VIOLET_RESIDUALS register in
  tests/hue-tokens.test.ts:475-490: "a dark-edge token family waits
  for a harmonization pass that changes dark-mode rendering at three
  sites"; machine-guarded against a fifth unregistered site). The
  audit surfaced it fresh — this cycle EXECUTES the recorded
  harmonization pass. **Rides §5 (DJ4).**
- **F-5 (L — Verified by direct read):** the Assignments slider
  rollback resync discards its promise (assignments-view.tsx:417-419 —
  `void useDataStore.getState().loadCollections(["assignments"])`)
  while `loadCollections` rejects when its GET fails
  (data.ts:424-428, Promise.all over fetchAndSet) — most likely in
  exactly the offline state that failed the commit → an unhandled
  promise rejection ON TOP of the already-shown error toast (the
  S118/BS9 class). The sibling resync sites all guard. **Rides §6
  (DJ5).**

F-6–F-8 informational: the SignOutCard comment claims client-side
cookie clearing that doesn't exist (settings-view:1246-1250 — comment
honesty, rides §7); the events `expandOccurrences` recurrence
expansion is view-local with zero pins (adjudicated §8); the files
view's refresh-failure toast after a successful mutation uses the hard
"Could not load your files." copy where the AI surfaces use the softer
"didn't refresh" form (adjudicated §8).

**Point 8 (the client ↔ store ↔ api round-trip verdict): COMPATIBLE,
no breaking mismatches** — the S160/DI4 `updatedAt` delivery verified
end-to-end (the wire honors the store type; no view reads it yet —
both AI views sort by createdAt, so the fix is complete and closed);
the S160/DI2 refine is unreachable from the client (the assistant view
always appends a trailing user turn); the factory collections mirror
the row types field-for-field (spot-verified exam.location nullable,
the S85/AL1 members boundary); every mutation refreshes its touched
collections (incl. the SetNull cascades). The F-1/F-5 gaps are
error-path plumbing, not shape drift.

**No measurement-gated candidate this cycle** — the S160 close's
deferral ledger stands unchanged; none of this cycle's findings is
profiling-gated.

## §2 DJ1 — the Notes tag-mutation error feedback (the F-1 close)

The two handlers route through a small `mutateTags` helper shaped on
the file's own `patchSelected` precedent (the AG6 departed-note guard
family): capture the note id BEFORE the async op, catch the rejection,
toast through the aria-live stack ONLY if the user hasn't switched
notes (`selectedIdRef.current !== noteId → return`). Toast copy: the
ApiError message if present, else "Tag not saved — check your
connection." (the S13 offline family's human form). The chain's
serialization semantics are untouched (the updater form stays; a
failed PATCH still doesn't poison the chain).

**The pin (e2e, parity-session7 +1):** the CB8-twin network-mock shape
— route `**/api/notes/*` PATCH to abort, add a tag through the real
input, assert the failure toast IS visible (RED pre-fix: no toast —
the silent class) and the input draft does not resurrect (the CY3
honesty stays: the draft was cleared, the toast explains why). No
server writes; the route mock restores itself per the Playwright
context lifecycle.

## §3 DJ2 — the Timetable band hand-guard (the F-2 close)

The `submit()` hand-guards gain the band check BEFORE `setBusy(true)`
(the DA2 position — an early return must not strand the busy latch):
parse `Number(form.startTime.split(":")[0])`, reject with
`setError("Classes must start between 7 AM and 8 PM.")` when the hour
falls outside 7–20. The CB6b comment is corrected in the same change
(the native constraint never bound the typed path under `noValidate`;
the hand-guard owns the band now — the DA2 pattern the S152 cycle
already established for this exact form's required-field guards). The
end-time's missing band stays the documented cosmetic residual (an end
past 20:59 renders a taller card — the class still renders at its
start hour's row; no vanishing, no data-loss class). The
end-before-start ordering stays the server schema's check (the Zod
message surfaces inline through the existing catch).

**The pin (e2e, parity-session7 +1):** open Add Class, fill the name,
TYPE `06:30` into the start input (`page.fill` bypasses the picker —
the exact inert-guard surface), pick an end, submit, assert the named
error IS visible (RED pre-fix: the dialog closes with "Class added.")
AND the dialog stays open (no POST fired — assert via a route-count
probe or the dialog's continued visibility).

## §4 DJ3 — the view enum single-source census (the F-3 close)

exams-view imports `EXAM_TYPES` from `@/lib/validation` (the local
twin deleted — the CB9/CH2 precedent, one line). The
`form.type as ExamInput["type"]` cast at :205 becomes unnecessary if
the select's value typing tightens — minimal diff: keep the cast
unless tsc drops it for free.

**The pin (unit, NEW tests/enum-single-source.test.ts — the
DI3-census shape, +3 legs):** a source census over the three
single-sourced view enums — exams-view must import EXAM_TYPES from
validation and declare NO local twin (RED pre-fix on the F-3 twin);
assignments-view must import ASSIGNMENT_TYPES (green-on-arrival — the
guard); settings-view must import GRADE_LEVELS (green-on-arrival — the
guard). A future forked twin fails the unit layer BEFORE it ships the
CB9 blanked-select class.

## §5 DJ4 — the dark-edge token harmonization pass (the F-4 close; the S135/CJ3 recorded deferral, executed)

The S135/CJ3 cycle pinned the LIGHT halves of the four sites to accent
tokens and registered the DARK halves in the VIOLET_RESIDUALS ledger
("a dark-edge token family waits for a harmonization pass that changes
dark-mode rendering at three sites"). This cycle is that pass:

1. **The token:** `--sf-primary-edge-dark` — the 800-level border tint
   of each accent's own hue family (violet `91 33 182` #5b21b6 — the
   measured value three of the four sites already render; blue `30 64
   175` #1e40af; green `6 95 70` #065f46; orange `146 64 14` #92400e;
   pink `157 23 77` #9d174d; red `153 27 27` #991b1b; teal `17 94 89`
   #115e59). AccentToken gains `edgeDark` (positioned LAST in every
   accent object literal); `accentCssVars` gains
   `--sf-primary-edge-dark`; `BOOT_TOKEN_SUFFIXES` gains `"edge-dark"`
   (LAST — the boot script's `Object.values` positional alignment
   holds; the theme-cache deep-equal enforces it); globals.css gains
   the `--color-sf-primary-edge-dark` utility + the `:root` fallback
   (violet-800).
2. **The four sites convert:** tasks-view `dark:hover:border-violet-800`
   → `dark:hover:border-sf-primary-edge-dark`; flashcards-view
   `dark:border-violet-800` → `dark:border-sf-primary-edge-dark`;
   notes-view `dark:border-violet-900` → `dark:border-sf-primary-edge-dark`
   (the 900→800 harmonization — the S92 divergent-variant collapse,
   the register's own named condition); analytics-view
   `dark:bg-violet-900/50` → `dark:bg-sf-primary-edge-dark/50` (the
   trap-7 serialization family — v4 emits `color-mix(in oklab, …)` for
   BOTH forms; the computed shape is unchanged at violet).
3. **The register re-shapes:** the VIOLET_RESIDUALS ledger empties —
   the four entries convert to a treated-dark-half census (the CJ3
   light-half shape, mirrored): the anchored legs pin the four sites
   to their token utilities with the quote-adjacency discriminator
   (the class string, never a comment mention); the negative leg
   fails when ANY new hardcoded violet site appears in the four files
   (the register's fifth-site guard generalizes).

**Visual scope (honest):** dark-mode rendering changes ONLY at violet
→ no visible diff (the token's violet value IS violet-800; the notes
selected-row border moves violet-900 → violet-800 — the one
harmonization-visible change, 3 of 4 sites byte-identical); at the 6
non-violet accents in dark mode the four surfaces re-theme (the
superset closing). Light mode: zero diff. The reference's Dark option
remains the measured platform no-op (the clone's dark mode is the
documented superset — no reference ground truth exists for these
values; the 800-level step of each accent's own hue family is the
existing token-set convention).

**The pins (unit, theme.test.ts +2; hue-tokens.test.ts +1; e2e,
theme-system.spec.ts +1):** the family values pin (all 7 accents emit
`--sf-primary-edge-dark` at the 800-level step); the 19-entry
completeness pin (the S3-J count 18 → 19, the AO5/BV15/CJ3 precedent);
the hue-tokens treated-census leg; the e2e dark-accent leg — the CJ3
sweep's dark sibling: dark + blue accent, the notes selected-row border
computes `rgb(30, 64, 175)` (RED pre-fix: stays violet-900
`rgb(76, 29, 149)`).

## §6 DJ5 — the slider rollback resync catch (the F-5 close)

`void useDataStore.getState().loadCollections(["assignments"])` gains
`.catch(() => undefined)` with the honest comment: the PRIMARY failure
toast already fired (the commit's own catch); the resync is a
best-effort visual rollback whose failure must not stack an unhandled
rejection on top (BS9). The heavier retry-then-soft-toast shape is
rejected — the failure state is already surfaced once; a second toast
for the same offline window is noise, and the thumb's stale position
self-heals on the next successful load.

**The pin (e2e, resilience.spec.ts +1):** route the PATCH
`**/api/assignments/*` to abort AND the GET `**/api/assignments*` to
abort, drive the slider via keyboard (focus the thumb, ArrowRight —
Radix commits on keyup), collect `page.on("pageerror")` events, assert
the primary error toast IS visible AND the pageerror list stays EMPTY
(RED pre-fix: the discarded resync rejection surfaces as a pageerror).

## §7 DJ6 — the SignOutCard comment honesty (the F-6 rider)

Comment-only: the `catch { // clearing the cookie client-side still
ends the session UX }` claim (settings-view:1246-1250) is rewritten to
the real trade-off — a failed logout POST leaves the session alive
server-side (the cookie is httpOnly; no client-side clearing exists or
could); the redirect still exits the UX, the next /api/auth/me 401s on
any authed surface. No behavior change, no test (comment honesty
rides the cycle's diff review).

## §8 The adjudications (the rejected/documented findings)

- **F-7 (events `expandOccurrences`, I) — REJECTED as
  parity-measured design:** the Events 7-day strip expands recurring
  occurrences onto their day bands while the Calendar day detail
  filters `isSameDay(startDate)` — both behaviors were landed as
  measured reference parity (the reference's own recurrence surfaces
  were probed in the S6/S66 eras). Promoting the function to a
  `src/lib/` seam with unit pins is genuine tier-1 hygiene, but it is
  a refactor with NO behavioral change and NO parity delta — the kind
  of change the repo defers to a rotation that touches the events
  family functionally. The promotion candidate is recorded for the
  next events-family cycle.
- **F-8 (files refresh-failure toast copy, I) — REJECTED as the
  documented trade-off:** the hard "Could not load your files." toast
  after a successful mutation + failed refresh is HONEST (the load DID
  fail; the mutation's success toast already fired) — the CB8 letter
  is satisfied because `refresh()` never rejects (no false
  mutation-failure claim). The softer "didn't refresh" copy is a
  consistency polish that changes pinned-adjacent copy without a
  behavioral driver; deferred with the F-7 class.
- **The DJ4 end-time band (the F-2 secondary) — DOCUMENTED residual:**
  an end past 20:59 renders a taller card (cosmetic overflow, no
  vanishing, no data loss). The start-band hand-guard owns the
  data-loss class; the end-band would be a visual-clamp decision on
  the clone's own superset surface. Documented here as the known
  residual.
- **The S160 close's deferral ledger** — unchanged: the A-M3 stage-2
  triggers, the update-side raw-SQL bulk upsert (closed HARDER on the
  DH0 numbers), the S159 plan §6 options, the I-4 parse posture
  (S144/CS5), the M-1 LLM-side residual (generate-cards 502/201 legs).

## §9 The as-executed close

Executed as planned, with the honest arithmetic corrections (the
planned unit estimate 1628 low by 4 — the enum census materialized as
SIX legs, not three: each site carries the import leg + the
no-local-twin leg; and the hue-tokens re-shape added the closure pin +
the treated-dark-half census where one was planned):

1. **Unit REDs (7/7 on their designed markers, as run):** the enum
   census twin pair (exams-view: the import leg + the local-twin leg —
   the assignments/settings siblings green-on-arrival, the guards); the
   S3-J completeness pin re-tag (18 → 19 — RED on the absent edge-dark
   entry); the edge-dark family pair (the 7-accent values + the violet
   byte-identity); the hue register's emptied-census pair (the negative
   leg reading FOUR unregistered offenders with the emptied register +
   the treated-dark-half census). Plus the count-lockstep tripwires
   that fired during the GREEN phase, each resolved in the same change:
   the theme-cache 18 → 19 suffix census; the hue file:line anchors
   (736 → 761 — the DJ1 mutateTags block added lines above the notes
   site); the CZ1 census's call-shape assertions (updated to the
   mutateTags wiring, now also pinning the DJ1 catch + the departed-note
   guard + the toast copy).
2. **GREEN implementations:** DJ1–DJ6 as §2–§7 specify (the mutateTags
   wrapper; the band hand-guard at the DA2 position with the corrected
   CB6b comment; the EXAM_TYPES import swap; the full CJ3-shaped token
   family + the four conversions + the register closure; the resync
   catch; the comment rewrite).
3. **The full unit layer green: 1632/1632 (50 files — 1622 + 6 [the
   enum census] + 2 [theme] + 2 [hue-tokens]).**
4. **The e2e legs (parity-session7 +2 [DJ1/DJ2], resilience +1 [DJ5],
   theme-system +1 [DJ4-dark]):** every leg RED-proven against the
   pre-fix standalone build (the stash/rebuild/re-run sequence — DJ5's
   RED carried the exact designed marker, the unhandled `ApiError`
   pageerror), all GREEN post-fix; the three touched specs verified
   serially (parity-session7 59/59; theme-system 20/20; resilience —
   the DJ5 leg green in every run; the AK1 family flaked between full
   runs, the documented P1008 machine-load class, passing in isolation
   and on the clean re-run).
5. **The full gate: lint ✓ · tsc ✓ · unit 1632/1632 · build ✓ · the
   5-chunk cold cert: chunk 1 154/154 · chunk 2 192/192 (+3, the
   DJ1/DJ2/DJ4-dark legs, first-pass clean) · chunk 3 93/93 (+1, the
   DJ5 leg — the AK1c/d pair flaked once on the documented machine-load
   class, 93/93 clean on the immediate re-run; the pair passes in
   isolation and touches nothing this cycle changed) · chunk 4 95/95 ·
   chunk 5 89/89 — the cert tally 623/623 = census 2255 green.**
6. **The remediated-tree standing re-confirmation: preflight GREEN (the
   S9/S31 stale-cache remedy applied) · drawer GREEN (the 83rd
   consecutive) · the desktop parity probe MATCH (live reference
   login).**
7. **Evidence: docs/screenshots/161-clone-*.png (the standing desktop +
   the mobile drawer [the 83rd companion] + the cycle's Notes surface),
   self-verifying (ok: true; the non-blank pixel ratios verified: 8.6%
   / 33.6% / 6.8%), captured by scripts/capture-s161-evidence.mjs.**
8. **Docs in lockstep:** README badge/census (2241 → 2255) + the count
   prose sites + the Session-161 row; AGENTS census (1622 → 1632; the
   e2e map 619 → 623) + the S161 lessons block; CLAUDE counts + the
   19-var token-set contract extension; PAD v1.3.69; the SKILL census
   (all four sites) + the green-state + the chunk-map re-anchor; the
   vitest header re-anchor (+10); the cert runner re-tag (619 → 623);
   docs/session_195.md; the worklog Session-172 entry; this §9; the
   `.env.example` contract re-verified (byte-identical to `.env` — no
   env-var reads changed this cycle).
9. **Commit + push:** the Conventional Commit on `main` + the SSH-wrapper
   push + the operator key shredded after use (§10's close).

## §10 The execution checklist

1. Unit REDs first (the designed markers): the enum census (RED on the
   F-3 twin), the edge-dark family pin (RED — the token absent), the
   hue treated-census (RED — the violet literals present).
2. GREEN implementations: DJ1 (notes-view helper), DJ2 (timetable
   hand-guard), DJ3 (the import swap), DJ4 (the token family + the
   four conversions + the register re-shape), DJ5 (the catch), DJ6
   (the comment).
3. The full unit layer green (the arithmetic: 1622 + 3 [enum census] +
   2 [theme family] + 1 [hue treated-census] = 1628, 50 files).
4. The e2e legs (parity-session7 +2 [DJ1/DJ2], resilience +1 [DJ5],
   theme-system +1 [DJ4-dark]) — each RED-proven against the pre-fix
   build where feasible (the stash/rebuild sequence), then GREEN.
5. The full gate: lint · tsc · unit · build · the 5-chunk cold cert
   (154 + 192 + 93 + 95 + 89 = 623) — census 1628 + 623 = 2251.
6. The remediated-tree standing re-confirmation: preflight · drawer
   (the 83rd) · the desktop parity probe (live reference login).
7. Evidence: `docs/screenshots/161-clone-*.png` (the standing desktop
   + the mobile drawer [the 83rd companion] + the cycle's surface —
   Notes, the DJ1/DJ4 surface this cycle hardened), self-verifying
   capture script per the S159/S160 precedent.
8. Docs in lockstep: README badge/census + the Session-161 row · AGENTS
   census + the S161 lessons block · CLAUDE counts + the contract
   extension · PAD v1.3.69 · the SKILL census · the vitest header ·
   the cert runner re-tag · `docs/session_195.md` (the cycle log) ·
   the worklog Session-172 entry · this plan's §9 close · the
   `.env.example` contract re-verified.
9. Commit (Conventional Commit on main) + the SSH-wrapper push + the
   operator key shredded after use.

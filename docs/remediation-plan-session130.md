# Remediation Plan — Session 130 / Batch CE (Cycle 80)

**Status: COMPLETE** (executed TDD-style 2026-11-03 — the verification record is §5 below)
**Date:** 2026-11-03 · **Workspace:** the Batch CD state `5fc5045` + the operator's `6ec0d9c`
(`docs/session_130.md`, the CD transcript). The workspace was REBUILT this session (fresh clone —
the sandbox recycled between sessions; `.env`, `db/`, bun 496 packages, and chromium-1243 all
re-provisioned before the baseline). **Audit-driven hardening session** — the standing rhythm
(audit the prior-batch diff, rotate two fresh-eyes deep audits, re-certify cold).

---

## 0. Scope and Method

The operator directed the standing rhythm (the same charter as s125–s129): refresh the workspace,
re-read the doc chain (`AGENTS.md`, `CLAUDE.md`, `README.md`, `PAD`, `omni-study1_SKILL.md`,
`docs/session_129.md`, `docs/remediation-plan-session129.md`, `worklog.md`, `docs/session_130.md`),
re-validate against the codebase, audit with the repo skills as rubrics (`skills/` excluded from
checking/testing/compilation), iterate on visual + functional parity with
`https://omni-study1.base44.app/` (the mobile navigation menu the named focus, Tailwind v4 the
named suspicion class), keep the repo a production-ready functional SUPERSET with visual parity,
keep the `.env`/`db/` contract (`DATABASE_URL="file:../db/custom.db"`, `db/` at the repo root,
`.env.example` tracked + current), maintain the vitest + playwright suites, plan remediation for
everything found, execute with TDD (RED → GREEN), capture evidence under `docs/screenshots/`,
update the docs chain, and commit + push to `main` via the SSH wrapper.

Method (the six-phase workflow): ANALYZE → PLAN (this document) → VALIDATE (every M finding
re-verified by direct read BEFORE the plan, plus the live reference probe that anchored the CE
Select animation parity question) → IMPLEMENT (smallest safe diff, TDD) → VERIFY (cold re-cert) →
DOCUMENT.

### Baseline (cold, BEFORE any work)

lint ✓ · `tsc --noEmit` ✓ · unit **1202/1202** (45 files) · the canonical build green (exit 0,
REAL_EXIT, foreground — the S128 re-learned lesson applied) · the cold 5-chunk e2e **563/563 —
145+178+72+93+75, every chunk first-pass** (per-chunk via `scripts/run-cert-chunk.sh`) · the
register re-derivation **249 importers / 130 Usage-line carriers / 0 stale / 119 usage-line-free**
(the 38th consecutive hold, the expectation stated BEFORE the measurement, the instrument
identical to `tests/script-conventions.test.ts`'s calibrated regex) · the Mode-C audit of the
Batch CD diff (`5fc5045`, 42 files, +1217/−138): **all 8 CD claims re-verified TRUE against the
tree** (CD1's `@import "tw-animate-css"` + the overlay class families on both primitives + the
notes popover exit family + `duration-200` dropped — only provenance comments remain — + the dead
v3 dep gone; CD2's `COLLECTION_GET_TIMEOUT_MS = 20_000` exported + threaded through
`fetchAndSet`; CD3's `exhaustive-deps: "error"` + zero suppressions anywhere in `src/`/`tests/`;
CD4's `BodyTooLargeError extends ValidationError` → 413 first in the mapper; CD5's boot line with
the node_env + db anchor; CD6's auth-surface set — the `/reset-password` re-export of
`AuthRoutePage`, `role="status"`, 6 `timeoutMs` in login-surface, the backdrop focus ring, the
OTP select-on-focus; CD7's doc-drift fixes; CD8's route census pin; zero key material in the
diff — the only `AUTH_SECRET` mention is the established empty-dev-posture documentation line).

### Live parity (both hosts — agent-browser, mobile 390×844)

**Reference** (logged in `sepnetflix2023@outlook.com`): the standing battery held — the hamburger
UNLABELED (name=null, 36px at [17,14], no `aria-haspopup`) · the drawer **no `role=dialog`**,
panel **288px** (`w-72`), the true-layer backdrop **blur(4px) + rgba(0,0,0,0.2)**, exactly
**20 nav links** · the landscape drawer-nav **scrollHeight 992 > clientHeight 290, overflow-y
auto** (maxScroll 702). **Plus this cycle's NEW reference-specific probe (the CE Select
animation):** the Tasks filter Select's dropdown content computes **`animation-name: enter,
animation-duration: 0.15s`** — the same tailwindcss-animate family CD1 measured on the dialog
surface; the dropdown carries the full shadcn class family
(`data-[state=open]:animate-in ... bg-popover`).

**Clone** (`:3000`, demo session on a FRESH reseed — kill-by-port + `rm db/custom.db` + push +
seed, the S32 daemon recipe, daemon health 200): the full standing battery GREEN — the labeled
hamburger **"Open navigation menu"** (36×36 at [16,14], the a11y superset), **`role=dialog` +
"Navigation menu"**, **288px** panel, **20 links**, the true-layer backdrop **blur(4px) +
oklab(0 0 0 / 0.2)**, nav auto-close (Notes click → drawer closed, `/Notes`), /Notes clean
(**390 = 390**), scroll persistence **600 → 600** (the drawer cycle), landscape **992 > 301,
scrolls** — **no Tailwind v4 mobile-nav bug, the 35th consecutive live confirmation**. The CE
Select probe on the clone: **enter/0.15s — the exact reference match**. The CD1 animation parity
holding: the Add Task dialog's overlay AND content both compute **enter/0.15s** (the
reference-matched values).

### The audits (two parallel, ROTATED fresh-eyes — findings only, then direct-read verification)

The CD cycle deep-covered the app shell + auth screens and the persistence/crypto/infra configs;
CB covered the FE views + server/persistence family three cycles back (CD's own closing
recommendation: rotate back to the FE views + server/persistence axes). This cycle's fresh eyes:

- **Audit A — the FE views/components family** (last deep-covered CB, three cycles ago): all 22
  views, the 6 layout files, the 21 ui primitives, and the client-consumption side of api.ts /
  data.ts / store.ts / view-collections.ts / data-export.ts / data-import.ts / validation.ts.
  **0C/0H/3M/10L/6I.**
- **Audit B — the server/persistence family** (also last covered CB): all 60 API routes,
  entities.ts, http.ts, server/auth.ts, server/ai.ts, db.ts/db-path.ts, schema.prisma in full,
  seed.ts, validation.ts (server side). **0C/0H/3M/5L/6I.**

Every M finding re-verified by direct read (the six: the write-path deadline family in three
parts, the transactional merge guard, the RumEvent retention/index posture, the write-budget
census gaps); the CE2/CE3/CE4/CE9 shapes re-verified by direct read too (they surfaced in the
prior session's interrupted audit pass and were re-derived here against the identical tree —
see §1).

## 1. The verified findings (consolidated, de-duplicated)

**M1 (the deadline family, FE ×3).** The `timeoutMs` infrastructure exists (apiGet/apiSend
signal; CD wired collection GETs at 20 s, AI surfaces at 120 s, auth POSTs at 20 s) — but every
MUTATION write path rides no deadline: all ~50 `apiSend` calls in `data.ts`'s `mutations`
(`createTask: async (input) => { await apiSend("POST", PATHS.tasks, input); ... }` — no options),
the view-level twins (files-view's bare multipart `fetch("/api/files", ...)` upload, settings-view
×6, notes-view ×1, calculator-view ×1), settings-view's `/api/auth/me` GET (`.catch(() => {})`
swallows a stall → "Loading your account…" forever), and rum-panel's two GETs. A stalled write
(the CC7/CD2 scenario — accepted TCP, no response, no `offline` event) latches every busy state:
dialog Save spinners, the delete-account button, the upload button — no error branch reachable
until reload. **Verified** (api.ts:80-84 — `apiSend` only sets `init.signal` when
`options?.timeoutMs !== undefined`; data.ts:470+; files-view.tsx:198-199, 271;
settings-view.tsx:1053-1065; rum-panel.tsx:54, 99).

**M2 (the transactional merge guard, server).** The factory `update` runs
`findFirst → beforeWrite(existing, writes) → update` with NO transaction (entities.ts:298-326;
the hand-written flashcard-card delegate :548-577 has the same shape). The three cross-field
merge guards (`checkEventOrderingMerge`, `checkGradeRangeMerge`,
`checkTimetableOrderingMerge` — validation.ts, threaded as `beforeWrite`) validate the sent leg
against a PRE-WRITE snapshot: two concurrent single-leg PATCHes (events `{startDate: X}` vs
`{endDate: Y < X}`; grades `{score}` vs stored `{maxScore}`; timetable `{endTime}` vs stored
`{startTime}`) both pass their guards and commit an interleaved row no single request would
accept — the corrupted row then LOCKS the inversion in (the next legitimate single-leg PATCH
fails its guard against the corrupt stored leg). The BZ7 folder cycle guard already established
the repo's transactional pattern (`db.$transaction` with the re-read inside — "SQLite serializes
interactive transactions, so the chain re-read inside the transaction is authoritative").
**Verified.**

**M3 (RumEvent: unbounded per-user growth + an uncovered ORDER BY, server).** `RumEvent` is the
ONE user-growable table with no retention trim (AiChatMessage and CalculatorHistoryEntry both
trim to the newest 500 at every write site under CA1/BW5). The `@@unique([userId, sessionId,
metric])` does not bound growth because sessionId is caller-chosen — each of the 1000/15-min
budgeted POSTs can mint up to 20 fresh rows (new sessionIds). The panel GET (`where userId,
orderBy createdAt desc, take 500`) is served by no covering index (CA19 removed `@@index([userId])`;
nothing covers createdAt ordering). **Verified** (rum/route.ts:39-65, 77-81; schema.prisma:561-583).

**M4 (the write-budget census gaps, server).** AGENTS.md's census covers the factory routes
(`write:` 600/15-min) and the upload family (`upload:` 20/15-min), but six hand-written write
routes ride NO budget: `files/folders` POST (creates rows at line rate — the only table-writing
POST with no budget), `files/[id]` DELETE, `ai/messages` DELETE, `calculator/history` POST+DELETE,
`settings/preferences` PATCH, and `auth/logout` POST (the documented no-op exemption). Which
wrapper a route used decided its budget — an accident, not a decision. **Verified** (the
route-by-route census; http.ts:313-325's factory budget).

**CE2 (the True/False lying default, FE).** The practicetests question editor's True/False
Select renders `value={draft.correctAnswer || "True"}` — the UI SHOWS "True" while the stored
draft keeps `correctAnswer: ""`; the submit loop then rejects with "Question N needs a correct
answer" even though the user sees an answer selected. The user must re-pick True (or False) to
unstick it. **Verified** (practicetests-view.tsx:431-432 vs :270).

**CE3 (the false empty states, FE ×6 views).** The shell pre-warms only the ACTIVE view's
collections before the Splash lifts; `loadAll()` then runs in the BACKGROUND
(page.tsx:175 — `void useDataStore.getState().loadAll().catch(() => {})`). Navigating to any
other view during that window renders its empty state on in-flight data: notes ("No notes yet" —
TWO sites: the list pane :653 and the main pane :708), events ("No events"), exams ("No exams
found"), assignments ("No assignments yet"), timetable ("No classes yet" :246 + the day detail
"No classes this day." :450), flashcards ("No decks yet." :471/:603). Eight sibling views
(tasks, dashboard, myday, studygroups, gradetracker, practicetests, focustimer, aiassistant)
already gate on `s.loading` with the spinner idiom — the six are the ungated remainder.
**Verified.**

**CE4 (the rum-panel state machine, FE).** A FAILED initial load renders the error alert AND the
"Loading the field metrics…" line (rum-panel.tsx:143-144) — forever: the `!rows` branch cannot
distinguish loading from failed-with-no-data, so the panel lies about being mid-load when the
load already errored. The recent-samples fallback badge (:236) also lacks the dark pair its
rating-badge sibling (:167) carries — the AS1 class recurring on a later line. **Verified.**

**CE7 (the import seam trio, server).** (a) The write loop's `delegate.create` has no P2002
branch — an id created between the findFirst probe and the create (concurrent tab/script) throws
through the generic mapper as a 500, violating the route's own 400-class contract for bad input.
(b) `importRowIdError` bounds the row id to NON-EMPTY ONLY — every interactive boundary bounds
ids at 64 (`idField`), the import accepts up to the 1 M-char field cap as a primary key.
(c) The per-field cap is a flat 1 M catch-all (`IMPORT_FIELD_MAX_CHARS`) — validation.ts's 41
per-field length atoms (title 200, name 100, description 1000/5000, front/back 2000, tags 2000,
room 100, location 200, notes 5000 ...) are NOT mirrored at the third entry point, so a
hand-edited backup can persist rows the interactive routes would 400. (d) The update branch
bypasses the single-leg merge guards (a one-leg `{score: 80}` update against a stored
`maxScore: 50` persists 160% — the L1 hazard the routes' `beforeWrite` seams exist for).
**Verified** (import/data/route.ts:340-410; data-import.ts:158-167, 392-418).

**CE8 (the analytics violet literals, FE).** analytics-view.tsx hardcodes `#8b5cf6` at five
sites (:85, :86, :151, :206, :218 — the SVG gradient stops, two line strokes, the bar fill) —
the last hardcoded accent hexes on a themed surface outside the button's documented measured
literals. The rum-panel's own sparkline already shows the token form
(`stroke="rgb(var(--sf-primary))"`, rum-panel.tsx:190). The S9-K e2e pin asserts the old hex
(`path[stroke='#8b5cf6']`, parity-session9.spec.ts:452) — a documented pin correction the
tokenization demands. **Verified.**

**CE9 (the sweep set).** (a) quill-editor.tsx:189 writes `onChangeRef.current = onChange` during
RENDER — the repo's own contract is event-handler writes only (the NoteTitleInput sibling does
it via effect; a React-Compiler hazard). (b) studygroups GroupDialog's submit reads members from
the STALE PROP snapshot (studygroups-view.tsx:92) — the BX10 stale-base class in the dialog path
(addMember/removeMember were fixed; the dialog wasn't). (c) The RUM GET + export ORDER BY
`createdAt desc` carries NO tiebreak — equal timestamps paginate non-deterministically.
(d) http.ts's header contract comment (lines 6-8) still lists the pre-CD4 four-branch contract —
the 413 line is missing while the mapper carries it. (e) The retention trims
(persistTranscriptPair, calculator history) run an UNBOUNDED `findMany(skip: 500)` inside the
default 5 s interactive transaction — the exact BW4 class the import route fixed with its
explicit 60 s timeout (ai.ts:158-171; calculator/history/route.ts:51-66). (f) FileFolder.parentId
is the only FK column without an index (schema.prisma:455-475 — every sibling FK carries one;
each parent-folder DELETE scans for SetNull children). **All Verified.**

**The L set (verified, folded into the CE items where cheap).** GRADE_LEVELS duplicated in
settings-view (:68-81) instead of importing validation.ts's exported single source; the exam
dialog duration clamp floor (1) mismatches the schema floor (5) (exams-view.tsx:185 vs
validation.ts:266); three disclosure toggles lack the dark hover pair (myday ×2, notes ×1);
the studygroups member-email input has no accessible name (studygroups-view.tsx:470-478);
settings renders the createdAt fact twice back-to-back (:1107-1118); notes-view's notebook
rename bypasses the mutation seam while `mutations.updateNotebook` sits dead (notes-view.tsx:367
vs data.ts:596).

## 2. The CE set (TDD — RED first, then the source)

**CE1 (M1)** the default deadline family: `DEFAULT_GET_TIMEOUT_MS = 20_000` and
`DEFAULT_WRITE_TIMEOUT_MS = 30_000` exported from api.ts and applied INSIDE `apiGet`/`apiSend`
when the caller passes no `timeoutMs` — the one-seam fix covering every mutation call site and
the stray view-level `apiGet`s at once (explicit `timeoutMs` still wins; the existing explicit
call sites are unchanged in behavior). The export-panel's import POST (a 25 MiB envelope over
the 60 s server transaction) gets an explicit `timeoutMs: 120_000`; files-view's multipart
upload gets `signal: AbortSignal.timeout(120_000)` (2 MiB + slow uplink). The unit pins: the
default-write leg (apiSend with no options carries the 30 s signal), the default-get leg, and
the explicit-override leg (a caller's 120 s wins) — with the obsolete "does NOT time out"
legs tombstoned (their premise is now inverted by design). The login-surface errorMessage helper
gains the isTimeoutError branch (the honest "took too long" copy, matching rum-panel's).

**CE2** the True/False default: switching a draft's type TO `true_false` seeds
`correctAnswer: "True"` (the displayed default becomes the stored default — the displayed
`|| "True"` fallback stays as the belt-and-braces render). The e2e pin: create a test with a
True/False question, never touching the correct-answer Select, save → succeeds (pre-fix:
rejected with "needs a correct answer").

**CE3** the loading gates: the six views adopt the tasks-view idiom
(`const loading = useDataStore((s) => s.loading);` + `loading && rows.length === 0 ? <Spinner
branch> : rows.length === 0 ? <EmptyState> : ...`) at the eight sites (notes ×2, events, exams,
assignments, timetable ×2, flashcards). The e2e pin: intercept `/api/notes` with a 1 s delay,
navigate to Notes with empty-ish state in flight → the Spinner branch renders, NOT "No notes
yet" (pre-fix: the false empty state renders live).

**CE4** the rum-panel state machine: the render distinguishes three states — no data AND no
error → the loading line; no data AND error → the error alert (already rendered) + an inline
retry hint in place of the loading lie; data → the grid. Both GETs gain `timeoutMs: 20_000`.
The recent-samples fallback badge gains the dark pair. The e2e pin: intercept `/api/rum` →
abort → assert the retry-hint branch and that "Loading the field metrics…" is ABSENT.

**CE5 (M2)** the transactional merge guard: the factory `update` takes a transactional path when
the delegate carries `beforeWrite` — ownership `findFirst` stays outside (the 404 fast-path),
then `db.$transaction` re-reads `existing` and runs guard + update inside (the BZ7 pattern); the
unguarded delegates keep the current zero-overhead shape. The hand-written flashcard-card
delegate's update joins the same transactional path (its deck-scope ownership check re-read
inside). The unit pin: a structural census (the guarded delegates' update paths contain
`$transaction` — the same machine-guarded approach as the route census).

**CE6 (M4)** the write budgets: `files/folders` POST → `upload:${user.id}` 20/15-min (the
file-family write path); `files/[id]` DELETE, `ai/messages` DELETE, `calculator/history`
DELETE, and `settings/preferences` PATCH → the shared `write:${user.id}` 600/15-min.
`auth/logout` stays the documented exemption (no DB write). AGENTS.md's census line updates in
the same commit. The unit pin: the script-conventions write-route census — every route file
declaring a write method calls `checkRateLimit` or carries a documented exemption marker (the
machine-enforced census, the CD8 pattern).

**CE7** the import seam: (a) the P2002 branch — the write loop's create catches the unique
violation and converts it to a clean `ImportRowError`-shaped 409 ("concurrent change —
re-export and retry"), preserving the all-or-nothing rollback with an actionable message;
(b) `importRowIdError` bounds the id at 64 (the `idField` atom); (c) the per-field length
registry — `IMPORT_FIELD_LENGTHS` keyed `collection.field` mirroring validation.ts's atoms,
enforced in `sanitizeImportRow` (the flat 1 M cap remains the unknown-field default), with the
unit pin asserting the registry matches the validation.ts atoms (the consistency guard); (d) the
update branch runs the single-leg merge guards against the stored partner leg (the probe's
select extended to the guard fields for events/grades/timetable; the same validation.ts seams
the factory uses). The e2e pin: the s23 import round-trip rejects a 65-char id with the named
message.

**CE8** the analytics tokenization: the five `#8b5cf6` sites → `rgb(var(--sf-primary))` (the
rum-panel sparkline's established token form); the :61 comment updated with the provenance; the
S9-K pin corrected to the token attribute (the documented correction the source change demands —
the pin's PURPOSE, "the analytics line renders in the accent", is unchanged). The unit pin: the
hue-tokens negative sweep — no `#8b5cf6` remains in analytics-view.

**CE9 (the sweep set)** — quill-editor's onChange ref write moves to an effect (the
NoteTitleInput idiom); GroupDialog's submit reads the members base from the store at submit time
(the BX10 idiom); the RUM GET + export ORDER BY gains the `{ id: "desc" }` tiebreak; http.ts's
header comment gains the 413 line; the retention trims gain `take: 1000` on the stale-select and
`{ timeout: 15_000 }` on their two `$transaction` call sites; `@@index([parentId])` lands on
FileFolder (the sibling-FK convention); GRADE_LEVELS imports from validation.ts; the exam
duration clamp becomes `Math.min(600, Math.max(5, ...))`; the three dark-hover pairs; the
member-email sr-only Label; the duplicate createdAt line dropped; the notebook rename swaps to
`mutations.updateNotebook`.

**The RumEvent retention (M3)** lands as part of the CE9 server sweep: the POST gains the
persistTranscriptPair-shaped trim (count → deleteMany beyond the newest 2000, the export
window), and the CA19 index decision is DOCUMENTED (the trimmed table's 500-row GET sort is
bounded — the index stays out; the deviation recorded in AGENTS.md's census line).

## 3. Verification checklist (the cold re-cert)

lint (the CD3 rule active) · `tsc --noEmit` · unit — census 1202 → the CE delta (the pins +
the plan's §5 records the exact count) · the canonical build (REAL_EXIT, foreground) · the cold
5-chunk e2e on the re-tagged census (the cert scripts + the script-conventions pin re-tagged in
the same commit) · the register tripwire re-derivation (expectation stated BEFORE: no new repo
scripts — 249/130/0/119) · the live battery re-run on the fresh-seeded daemon (the mobile
standing battery + the CE2/CE3/CE4 flows spot-checked) · evidence frames under
`docs/screenshots/`.

## 4. Documentation chain (the same-commit updates)

README (the chunk map + the badge + the S130 row) · AGENTS.md (the census anchors + the
write-budget census line + the RUM retention note) · CLAUDE.md (only if a count it carries
shifts) · PAD (the revision block + the §8.1 rows + the Total) · the SKILL doc (the census
anchors + any wiring notes) · the vitest header · the cert-script re-tags · the worklog
Session-130 entry · `docs/session_131.md` (the session record, the odd-increment convention:
123→125→127→129→131) · this plan's §5.

## 5. Execution record (2026-11-03)

**Status: COMPLETE — every CE item shipped, all gates green.**

**The RED phase (verified for the right reasons before any source change).** 12 unit pins:
api-timeout +4 (the structural live-signal legs, the constants, the override-wins discriminator —
the two "does NOT time out" legs tombstoned with provenance: their patient-default premise is
inverted by design), data-import +7 (the 64-char id atom, the registry rejection legs, the key
census, the unknown-field 1 M default), script-conventions +3 (the CE6 write-route budget census
[6 offenders pre-fix], the CE5 transactional census [no $transaction in entities.ts pre-fix]),
hue-tokens +2 (the analytics sweep [5 hex sites] + the token census [0 tokens]). 4 e2e pins: CE2
(the save rejected with "needs a correct answer" while the dialog showed "True" — the dialog
STAYED OPEN, the exact lying-UI reproduction), CE3 (the false "No notes yet" rendered at BOTH
sites live), CE4 (the lying "Loading the field metrics…" rendered alongside the error), CE7 (the
65-char id imported 200 — the bound did not exist).

**The GREEN phase.** CE1: the defaults installed inside apiGet/apiSend (one seam, ~50 mutation
sites covered at once); the import POST 120 s; the multipart upload signal 120 s; the
login-surface authErrorMessage helper (isTimeoutError branch). CE2: the type switch seeds
`correctAnswer: "True"`. CE3: nine sites across six views gated on the tasks-view spinner idiom
(notes ×2, events [one spinner, the terminal zero-state keeps the measured 7-band shape], exams,
assignments, timetable ×2, flashcards ×2). CE4: the three-state render (rows-first narrowing) +
both GETs bounded + the fallback badge's dark pair. CE5: the guarded delegates' transactional
path (the construction contract throws when a beforeWrite delegate lacks txModelName; the
unguarded thirteen keep the zero-overhead shape). CE6: five budgets + the logout exemption
marker + the AGENTS.md census line. CE7: the id atom, the 28-entry IMPORT_FIELD_LENGTHS
registry, the update-branch merge guards (the probe's select extended), the P2002 → named 409
(throwing OUT of the transaction — a return would have committed the prior rows; the race error
mapped in the route's outer catch). CE8: the five chart sites tokenized. CE9: the twelve-item
sweep incl. the RUM retention trim (newest 2000, take: 1000) and `@@index([parentId])`.

**The honest mid-run corrections (all caught by the gates).** (1) The CE2 pin's
`input[type="text"]` locator never resolved — the implicit type attribute does not match the CSS
selector; re-scoped to `getByLabel("Test Title")`. (2) The CE5 census pin's first shape asserted
the flashcard-card delegate carries $transaction — over-reach (the card delegate owns no
cross-field invariant); relaxed to the true wiring (txModelName on the three guarded delegates).
(3) The s17 "Account created" e2e pin caught my wrong-sided L9 fix: I had dropped the
reference-measured "Account created:" line and kept the clone-only "Member since" — the LIVE
reference check (its Profile tab) settled it: the reference renders exactly "Account created:
{date}" and NO Member-since line; the fix inverted (the Member-since line goes, the email-
verified status rides the email line, the Account-created line stays). (4) The
import-row-guard's 1 M boundary legs used tasks.title — the registry now caps it at 200; the
legs re-scoped to an unregistered field (the documented correction the source change demands).
(5) The rum-panel edit shifted the hue-tokens residual register (the alert line 138 → 143) —
re-anchored with the provenance, the guard working as designed. (6) The api-timeout pin's plain
`let` narrowed to `never` across the closure — the holder-object + reader-function shape.

**The re-cert (cold, on the final tree).** lint ✓ (the CD3 rule active, zero violations) ·
`tsc --noEmit` ✓ · unit **1217/1217 (45 files — census 1202 → 1217, +15 exact)** · the canonical
build green (REAL_EXIT=0, foreground; the schema push for the parentId index applied first) ·
the cold 5-chunk e2e **567/567 — 146+179+72+93+77, every chunk first-pass** (chunk 4's first
run caught correction (3) — the s17 pin; the fix + rebuild + re-run green) · the register
tripwire **249/130/0/119 — the exact hold (the 39th consecutive)**. The live battery on the
fresh-seeded daemon ALL GREEN — **the 36th consecutive no-Tailwind-v4-bug confirmation** (the
labeled hamburger 36×36 @ [16,14], role=dialog + label, 288px, blur(4px) + oklab, 20 links,
auto-close, scroll persistence 600→600, landscape 992>301) — plus the CE2 default verified LIVE
end-to-end (the save succeeds without touching the correct-answer select; the card renders) and
the CE-cycle's Select animation parity (enter/0.15s on both hosts) re-confirmed at baseline.
Three evidence frames in `docs/screenshots/130-clone-*.png` (the mobile drawer; the True/False
default; the desktop dashboard), all verified non-blank. **Census: 1217 unit + 567 e2e = 1784
green.**

**Docs set (same commit):** README (the chunk-map lines + the badge 1784 + the S130 row),
AGENTS.md (the census anchors + the CE6 write-budget census line + the RUM retention note),
PAD **v1.3.38** (the revision block + the §8.1 rows + the Total 76/1785), the SKILL doc (the
four census anchors), the vitest header (45/1217 + the S130 re-anchor block), the cert-script
re-tags (the S130/CE block + Expected 567), this §5, the worklog Session-130 entry, and
`docs/session_131.md`.

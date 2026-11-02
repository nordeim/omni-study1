# Remediation Plan — Session 128 / Batch CC (Cycle 78)

**Status: COMPLETE** (executed TDD-style 2026-11-02/03 — the verification record is §5 below)
**Date:** 2026-11-02 · **Workspace:** the Batch CB state `7a61e61` + the operator's `5a415d5`
(`docs/session_126.md`, the CB transcript) — the workspace survived the session break (`.env`,
`db/`, chromium-1243, and agent-browser all intact; the push infra rebuilt before the push). **Audit-
driven hardening session** — the standing rhythm (audit the prior-batch diff, rotate two fresh-eyes
deep audits, re-certify cold).

---

## 0. Scope and Method

The operator directed the standing rhythm (the same charter as s125–s127): refresh the workspace,
re-read the doc chain, re-validate against the codebase, audit with the repo skills as rubrics
(`skills/` excluded from checking/testing/compilation), keep the repo a production-ready functional
SUPERSET of `https://omni-study1.base44.app/` with visual parity (the mobile navigation menu the
named focus, Tailwind v4 the named suspicion class), keep the `.env`/`db/` contract
(`DATABASE_URL="file:../db/custom.db"`, `db/` at the repo root, `.env.example` tracked + current),
maintain the vitest + playwright suites, plan remediation for everything found, execute with TDD
(RED → GREEN), capture evidence under `docs/screenshots/`, update the docs chain, and commit + push
to `main` via the SSH wrapper.

Method (the six-phase workflow): ANALYZE → PLAN (this document) → VALIDATE (every M/H/C finding
re-verified by direct read BEFORE the plan; the L set spot-verified; the CC10 composite-index win
MEASURED, not assumed) → IMPLEMENT (smallest safe diff, TDD) → VERIFY (cold re-cert) → DOCUMENT.

### Baseline (cold, BEFORE any work)

lint ✓ · `tsc --noEmit` ✓ · unit **1171/1171** (42 files) · the canonical build green (exit 0,
REAL_EXIT verified — the background-invocation lesson re-learned: a `&`-detached build dies with
the tool session and leaves an empty log; re-run in the foreground) · the cold 5-chunk e2e
**559/559 — 144+177+72+93+73, every chunk first-pass** (per-chunk via `scripts/run-cert-chunk.sh`,
the kill-by-port → curl-verify → fresh-db procedure) · the register re-derivation **249 importers /
130 Usage-line carriers / 0 stale / 119 usage-line-free** (the 33rd consecutive hold, the expectation
stated BEFORE the measurement; the calibrated instrument: `scripts/*.mjs` matching
`from "playwright(-core)"` exactly) · the Mode-C audit of the Batch CB diff (`7a61e61`, 53 files,
+2347/−192): **all 22 CB claims re-verified TRUE against the tree** (CB1's `remaining` in the dep
array; CB2's shared date atoms adopted by tasks + assignments; CB3's `nullableId`; CB4's
`weightedPercent` with the zero-weight drop + unweighted fallback; CB5's `CATEGORY_DOTS` +
dotless events + `bg-white` on the selected fill; CB6's 14-row `HOURS` + the `07:00`/`20:59` band;
CB7's `write:` budget on both PATCH and DELETE; CB8's separate failure domains on all three AI
surfaces; CB9's `ASSIGNMENT_TYPES`; CB10's desc+take:500 windows; CB11's domain-cap family; CB12's
`loginAcct:` budget answering the uniform 401; CB13's true-mean caption; CB14's
`inBandDeliveryProdWarning` + the boot WARN; CB15–CB21 spot-verified on the tree; zero key material
in the diff).

### Live parity (both hosts — agent-browser, mobile 390×844)

**Reference** (logged in `sepnetflix2023@outlook.com`): the standing battery holds — the hamburger
UNLABELED (name=null, 36px at [17,14], no `aria-haspopup`) · the drawer **no `role=dialog`**, panel
**288px** (`w-72`), the true-layer backdrop **blur(4px)** (`bg-black/20 backdrop-blur-sm`), exactly
**20 nav links** · the landscape drawer-nav **scrollHeight 992 > clientHeight 290, scrolls**
(maxScroll 702). No NEW reference-specific probes this cycle: both audits found exclusively
internal-seam findings (nothing with a reference-measurable visual or functional counterpart), and
the four CB parity fixes (the calendar category dots, the day-detail grouping, the 14-row timetable,
the true-mean analytics caption) were live-verified on the fresh-seeded daemon last cycle. The
reference host remains the parity authority for anything the next cycle's audits surface.

**Clone** (`:3000`, demo session on a FRESH reseed — `rm db/custom.db` + push + seed): the full
standing battery GREEN — the labeled hamburger **"Open navigation menu"** (36×36 at [16,14], the
a11y superset), **`role=dialog` + "Navigation menu" label** on the drawer wrapper, **288px** panel,
**20 links**, the true-layer backdrop **blur(4px) + oklab(0 0 0 / 0.2)**, nav auto-close (Notes
click → drawer closed, `/Notes`), /Notes clean (**390 = 390**), scroll persistence **600 → 600**
(the drawer open/close cycle preserves the page scroll), landscape **992 > 301, scrolls**
(maxScroll 691) — **no Tailwind v4 mobile-nav bug, the 31st consecutive live confirmation at
baseline**.

### The audits (two parallel, ROTATED fresh-eyes — findings only, then direct-read verification)

The CB cycle deep-covered the FE views/components family + the server/persistence family; this
cycle's fresh eyes went to the axes least recently covered:

- **Audit A — the client state/transport/lib layer + UI primitives** (last deep-covered BZ, four
  cycles ago; CB just mutated data.ts/date.ts/calculator.ts/validation.ts):
  `data.ts`/`store.ts`/`api.ts`, `date.ts`, `calculator.ts`, `validation.ts`, `theme.ts`, `text.ts`,
  `site.ts`, `db-path.ts`, `env-check.ts`, the router, `data-import.ts`/`data-export.ts`,
  `view-collections.ts`, `folder-tree.ts`, `group-members.ts`, the server seam, all 22
  `components/ui/*` primitives, `shared.tsx`, and the consuming surfaces. **0C/0H/1M/7L/6I.**
- **Audit B — the test layer itself + the schema/seed** (the e2e layer last audited as a codebase
  BW, five cycles ago; CB added ~1000 lines of pins): all 30 e2e specs + helpers/setup/global-setup,
  the 42 unit files as guards, `prisma/schema.prisma` + `prisma/seed.ts`, the four config/runner
  scripts, plus an independent census derivation (144/177/72/93/73 = 559 ✅ and every CB delta
  located) and a full budget-math enumeration (per-chunk registers ≤9/10, TEST-NET collisions none,
  demo write volume ≪ 600, login budget reset semantics sound). **0C/0H/4M/5L/5I.**

Per Mode-C discipline every M finding was re-verified by direct read (§1 marks each Verified), and
the L set was spot-verified. The CC10 index question was settled by MEASUREMENT, not assumption.

---

## 1. The verified findings (consolidated, de-duplicated)

**[CC1 · M · Verified]** `importProfilePatch` leaks `displayName` into `tx.user.update` — the whole
import dies on a name-shaped field. `src/lib/data-import.ts:699-719` parses the envelope's `user`
block with `preferencesSchema` — which legitimately carries a `displayName` leg (the Settings
alias, `validation.ts:206`) — and copies EVERY defined parsed key into the patch. The User model
has no `displayName` column (`schema.prisma`: `fullName` is the name column), so a hand-edited (or
future-shaped) envelope carrying `displayName` in its user block triggers a
`PrismaClientValidationError` inside the all-or-nothing transaction → the route's catch answers a
misleading 400 ("a row whose fields do not match the app's data model") and **the entire restore
rolls back**. Also a violation of the seam's own contract ("identity — id, email, name — never
rides"): a name-shaped field rides. The legit export block (publicUser: id/email/name/themeMode/
accentColor/avatarEmoji/notificationsEnabled/schoolName/gradeLevel/studyGoalHours/emailVerified/
createdAt/updatedAt — verified by read) carries no `displayName`, so the honest round-trip is safe
today; the defect is the adversarial/edited-envelope path (fails closed — no corruption).

**[CC2 · M · Verified]** The cert-script truth pair. (a) `scripts/e2e-chunked-cert.sh`'s header
still reads `Expected: 142 + 161 + 71 + 93 + 71 = 538` — the CB cycle's +21 pins (538→559) were
never re-tagged there, breaking the every-cycle re-tag discipline visible in the file's own S118
repair note; `scripts/run-cert-chunk.sh` (created CB) carries no Expected header at all. (b) The
same script **always exits 0**: `set -uo pipefail` but no `-e`, no status accumulation — each
chunk's failed pipeline is discarded by the loop and the trailing `echo` returns 0 unconditionally.
A cert script that cannot fail is the exact trap class the resweep-gate seam was built against
(`tests/resweep-gate.test.ts`): an exit-code-checking caller sees a green cert on a red run.

**[CC3 · M · Verified]** The CB5 calendar-dot pins race the collection GETs.
`tests/e2e/parity-session6.spec.ts:444-499` — all three dots pins do `expect(cell).toBeVisible()`
then immediately `evaluateAll` the computed background colors. The month grid renders at shell
commit (`appHydrated` fires there) while the dots render from the async-loaded store
(`useDataStore((s) => s.tasks)` etc.) — `evaluateAll` does not retry, so a pre-data read returns
`[]` and the exact-equality assertion false-reds. The same file's own S6-G pin and the a11y-sweep's
documented networkidle doctrine both solve this; the newest pins skipped it. Currently green on
localhost (the GETs are fast), but the cold-race class the conventions exist to kill.

**[CC4 · M · Verified]** The CB pins clean up created demo-user rows only on the success path.
`parity-session5.spec.ts:918` (the CB1 focus session), `parity-session9.spec.ts:660` (the CB2
assignment), `tasks.spec.ts:182` (the CB16 task) — each issues the trailing
`page.request.delete(...)` AFTER all assertions, so a red assertion leaks the row into the
chunk-shared db. The AR3 try/finally convention (the same repo, 40 lines away in
parity-session8:1066) exists precisely for this; the pre-existing BX6 twin (parity-session5:883)
rides the same fix.

**[CC5 · L · Verified]** `taskToggleChains` never evicts (`data.ts:440,459-468`): entries are
overwritten per id but never deleted — a deleted task's settled chain lives for the page session.
Tiny per entry; no cross-user leak (logout is a full `location.replace`, resetting module state —
verified). Hygiene class.

**[CC6 · L · Verified]** `fromDueDateInput` is the only date atom without a NaN guard
(`date.ts:267-270`): malformed input throws `RangeError: Invalid time value` (executed:
`"2026-13-45T12:00:00"`) or silently rolls the day (`"2026-02-30"` → Mar 2 — executed). Its three
siblings all guard `Number.isNaN`. UI-unreachable (`<input type="date">`), but the defensive
asymmetry sits inside the atom family CB2 just hardened.

**[CC7 · L · Reasoned]** `apiGet` has no timeout leg (`api.ts:70-73`) — the S13 seam lives only in
`apiSend`. The boot gate (`page.tsx:148`) awaits `apiGet("/api/auth/me")` with no deadline: a
stalled connection (accepted TCP, no response) holds the Splash spinner for the browser's own
connection timeout (minutes) with no retry affordance (that lives in the gate's `error` branch),
and the connectivity banner does not fire on a stall (no `offline` event).

**[CC8 · L · Verified]** The toaster: colliding ids (`Date.now() + Math.floor(Math.random()*1000)`
— same-ms pushes collide ~1/1000, duplicate React keys, one dismiss kills both), a `setTimeout`
scheduled inside the zustand `set` reducer (purity smell), and no stack cap (an error loop can pile
toasts for the 5s lifetime each). `components/ui/toast.tsx:26-34`.

**[CC9 · L · Verified]** Dead code: the store's `addRow`/`updateRow`/`removeRow` (zero callers —
repo-wide grep; they bypass the fetchSeq stale-guard, a trap surface for future optimistic-update
misuse) and `minutesToHHMM` (`date.ts:244-247`, zero callers outside its own test legs).
`isoWeekNumber` STAYS (the documented reference-week contrast, pinned by intent).

**[CC10 · L-promoted · MEASURED]** The factory list windows are backed by `@@index([userId])`
only. Every collection GET runs `where {userId}, orderBy [createdAt desc, id desc], take:500` —
SQLite uses the index for the WHERE then fetches + temp-b-tree-sorts ALL the user's rows before the
LIMIT. The import can mint ~10^5 rows in one envelope (CB10's own comment), and the UI refetches
after every mutation. **Measured at 100k rows (raw SQLite, the exact query shape): single
`[userId]` index = 34.6 ms median per GET; composite `[userId, createdAt, id]` = 0.27 ms (128×).**
The swap is a REPLACE (the composite carries `[userId]` as its prefix — every existing
userId-prefixed lookup stays backed, same index COUNT per table, no write amplification beyond a
wider key). Scope: the **19 factory-listed models** (TaskList, Subject, Task, Assignment, Exam,
Event, TimetableClass, Notebook, Note, FlashcardDeck, PracticeTest, StudyGroup, Grade,
FocusSession, FileFolder, FileItem, AiChatMessage, CalculatorHistoryEntry, Holiday). NOT touched:
`PasswordResetToken` (lookup-by-token table, not factory-listed, keeps the bare index), `Flashcard`
(deck-scoped, no userId), `RumEvent` (CA19's deliberate removal stands — the upsert-hot table).

**[CC11 · L · Verified]** The store's `loading` is one boolean shared across overlapping
`loadAll`/`loadCollections` — the first finisher flips it false while the second fetch is still in
flight (`data.ts:383-399`). Currently masked (the three view-side `loadCollections` callers don't
read `s.loading`; the boot pre-warm completes before `loadAll` starts) but one new consumer away
from a flash-of-empty-state; 8 views read `s.loading`.

**[CC12 · L · Verified]** The seed/global-setup doc set: `global-setup.ts` swallows the original
`bunx` failure reason before its `npx` fallback (a schema-drift error would be re-raised as an
unrelated npx error — log the cause first); the seed header says "the upsert will not refresh them"
but the seed has no upserts (an early-return on existing demo user — the documented BEHAVIOR is
accurate, the mechanism wording stale); the seed's deliberate vocabulary coverage (assignments
6/8 types — no presentation/other; exams 4/6 — no test/oral/practical) is undocumented (the CB9
dialog pin covers all 8 OPTIONS end-to-end, so nothing is untested — the omission deserves its
deliberate-coverage note, not new rows and pin churn).

**[CC13 · I → pin]** The calculator's unary-minus-vs-`^` precedence (`-2^2` → `4`, the
Excel/Sheets family) is real behavior with NO pin — one refactor away from silently flipping to the
math convention. Pin the choice deliberately (no code change).

**Dismissed as documented non-gaps** (the audits' own verdicts, re-checked): the in-band delivery
default (ADR-013, adjudicated CB14); the wrong-typed import numbers falling through to the generic
400 (contract holds, only the per-field message is lost — the Zod boundary owns typed rejection);
the toast 5s auto-dismiss timing (WCAG 2.2.1 — toasts are transient, click-dismissible
notifications; noted as a future hardening candidate); `ApiError` carrying a 2xx status for
malformed success bodies (semantic change, no current caller branches on it — deferred);
`text.ts`'s dead `#X` branch + lone-surrogate pass-through (harmless previews); the
`initialFor` Latin-only fallback (a visual choice); the CB commit-message "RED 23 unit" prose vs
the +26 true delta (the census numbers in the same message are correct — recorded here, §5);
CB3's accepted-status set being validation-boundary-only (as scoped, worth its comment — added).

---

## 2. The CC set (TDD — RED first, then the source)

Order: the seam fixes (CC1), the script truth pair (CC2), the test-layer fixes (CC3, CC4 — pins
first so the convention repairs are themselves verifiable), then the L set. Every source change
lands with its RED pin written and verified failing FIRST (except the pin-less hygiene classes,
marked below).

- **CC1** `importProfilePatch` whitelists the seven preference keys (`themeMode, accentColor,
  avatarEmoji, notificationsEnabled, schoolName, gradeLevel, studyGoalHours`) — `displayName`
  (name-shaped identity) can never ride the patch; the declared return type becomes the enforced
  truth. RED: a `displayName`-bearing block produces a patch WITHOUT it (pre-fix: it rides) + the
  e2e leg in s23-import — an export envelope with `displayName` spliced into its user block
  restores 200 (pre-fix: the misleading 400).
- **CC2** (a) the `S127/CB + S128/CC` re-tag blocks + `Expected: 144 + 177 + 72 + 93 + 74 = 560`
  in `e2e-chunked-cert.sh` (and the Expected line added to `run-cert-chunk.sh`); (b) rc
  accumulation + `exit "$rc"` in `e2e-chunked-cert.sh`. RED: a script-conventions pin — the cert
  script parses (`bash -n`), propagates failure (the rc pattern), and its header names the current
  census (the static tripwire that forces every future re-tag).
- **CC3** the three CB5 dots pins wait for data BEFORE `evaluateAll`:
  `expect(cell.locator("span.rounded-full").first()).toBeVisible()` (both dot-bearing cells have
  permanent seeded dots; the empty-copy pin already waits on text). Census unchanged.
- **CC4** the four pins (CB1 focus session, CB2 assignment, CB16 task, BX6 twin) wrap their
  create→assert span in try/finally with the DELETE in `finally` (guarded on a truthy id) — the
  AR3 convention restored. Census unchanged.
- **CC5** the chain evicts on settle when still-latest (`if (taskToggleChains.get(id) === stored)
  taskToggleChains.delete(id)`). Hygiene class, no dedicated pin (the CB16 chaining pin already
  guards the semantics; the map is module-private and gains no test-only export — the repo has no
  such convention).
- **CC6** `fromDueDateInput` mirrors its siblings' `Number.isNaN` guard (malformed → `""`; the
  Feb-30 rollover is inherent to `Date` and stays — the guard catches hard-invalid strings). RED:
  the malformed-input pin (pre-fix: `RangeError`).
- **CC7** `apiGet(path, options?)` gains the optional `timeoutMs` (AbortSignal.timeout, the
  apiSend mirror); the boot gate passes a 20 s deadline so a stalled `/api/auth/me` reaches the
  gate's retry affordance. RED: the api-timeout mirror pin.
- **CC8** the toaster: a module counter for ids (deterministic distinctness), the auto-dismiss
  timer scheduled OUTSIDE the `set` reducer, and a 5-toast stack cap (oldest dropped — the
  standard viewport convention). RED: the cap pin (6 pushes → 5 items, the oldest gone); the
  id-distinctness and auto-dismiss legs pin as holds.
- **CC9** removal of the dead trio (`addRow`/`updateRow`/`removeRow` + their DataState entries)
  and `minutesToHHMM` (+ its two test legs — the pin tests dead code and leaves with it;
  `isoWeekNumber` stays). No new pin (the CB21 dead-removal precedent).
- **CC10** the 19 model index swap `@@index([userId])` → `@@index([userId, createdAt, id])` with
  the measured rationale in a schema comment; `PasswordResetToken` keeps its bare index (with the
  comment why). RED: a schema-census pin (the owned-fks style) asserting every factory-listed
  model carries the composite (pre-fix: they carry `[userId]` only).
- **CC11** per-key in-flight tracking: a module-level `Set<CollectionKey>` add/removed around
  each fetch, `loading` derived as `set.size > 0` at each transition (the public boolean API
  unchanged — the 8 consuming views untouched). RED: the overlap pin (a held `tasks` GET +
  a settled `notes` GET keeps `loading === true` until the hold releases; pre-fix: false early).
- **CC12** `global-setup.ts` logs the caught error before each fallback; the seed header's
  mechanism wording fixed (early-return, not upsert) + the deliberate vocabulary-coverage note.
  Doc-only class, no pin.
- **CC13** the calculator precedence pin: `-2^2` → `"4"` (the Excel-family convention, locked).
  RED-phase: passes pre-fix (a convention-lock pin, the holds-class — the audit's I-1).
- **CC14** the docs chain (§4).

**Projected census:** unit 1171 → **1181** (+2 CC1-family, +1 CC2, +1 CC6, +1 CC7, +2 CC8, +1
CC10, +1 CC11, +1 CC13 — exact counts re-derived as the pins land); e2e 559 → **560** (chunk 5
+1, the CC1 e2e leg; chunks 1–4 unchanged — CC3/CC4 modify existing pins in place).

---

## 3. Verification checklist (the cold re-cert)

1. lint ✓ · `tsc --noEmit` ✓ (the CC9 removals type-clean).
2. Unit: **1181/1181** (43 files — the new toast pin file may make it 43; exact at run time).
3. The canonical build green (REAL_EXIT), then the cold 5-chunk e2e **560/560** —
   144+177+72+93+74, every chunk first-pass, fresh `db/e2e.db` per chunk (the schema change rides
   the global-setup push automatically).
4. The register tripwire: **249/130/0/119** — the expectation stated BEFORE the measurement (no
   new script files; the pins ride existing spec files).
5. The db contract re-verified: `DATABASE_URL="file:../db/custom.db"`, `db/` at the repo root,
   `.env.example` current (no new env vars this cycle).
6. The live battery on the fresh-seeded daemon: the standing mobile set + the CC1 round-trip
   demoed live (export → splice displayName → import → 200 + preferences applied), evidence frames
   under `docs/screenshots/128-clone-*.png`, all verified non-blank.

## 4. Documentation chain (the same-commit updates)

README (the chunk map 559→560 + the census lines) · AGENTS.md + CLAUDE.md (the census anchors) ·
PAD **v1.3.36** (the revision block + the §8.1 rows for the touched files + the index-swap note in
the schema section) · `omni-study1_SKILL.md` (the chunk map + census anchors) · the cert-script
re-tags (CC2) · this plan's §5 execution record · the worklog Session-128 entry ·
`docs/session_127.md` (the agent session record, mirroring the established structure) · the
evidence frames.

## 5. Execution record (2026-11-03)

Executed TDD-style. **RED:** 13 unit pins verified failing for the right
reasons on the pre-fix tree (CC1 ×3 — `displayName` rides the patch verbatim;
CC2 ×2 — the stale 538 header + the absent rc pattern [the bash-syntax leg
passes: the pre-fix script parses]; CC6 — the live `RangeError: Invalid time
value`; CC7 ×2 — the hung GET never rejects [no timeout leg exists]; CC8 ×2 —
the uncapped 6-stack + the non-monotonic ids; CC10 ×2 — the bare-index models;
CC11 — the early false) + the CC1 e2e pin RED at the route boundary
(**Expected: 200, Received: 400** — the PrismaClientValidationError rollback
demonstrated live). The holds-class legs passed pre-fix as designed (CC13's
`-2^2` → 4, CC8's auto-dismiss, CC7's patient default, CC10's census-count).

**GREEN:** the thirteen source fixes (§2) — all pins green, then the full
gates: lint ✓ · tsc ✓ (`noImplicitAny` + the unused guards) · unit **1191/1191
(44 files — census 1171 → 1191, +20 exact: toast +3 the 43rd file,
schema-indexes +4 the 44th, api-timeout +3, data-import +3, data-store +3,
script-conventions +3, calculator +1, date net 0 [+1 −1])** · the canonical
build green (REAL_EXIT) · the cold 5-chunk e2e **560/560 — 144+177+72+93+74,
every chunk first-pass on the final tree** (census 559 → 560, +1: the CC1
route pin in chunk 5) · the register re-derivation **249/130/0/119 — the exact
hold (the 34th consecutive; no new script files, the pins rode existing spec
files)**. The dev db re-pushed with the composite indexes verified in
`sqlite_master` (`Task_userId_createdAt_id_idx` et al.; `PasswordResetToken`
keeps its bare index).

**The live re-cert:** the daemon re-seeded FRESH (`rm db/custom.db` + push +
seed), the standing mobile battery ALL GREEN — the labeled hamburger 36×36 at
[16,14], `role=dialog` + label, 288px panel, 20 links, the true-layer backdrop
blur(4px) + oklab(0 0 0 / 0.2), nav auto-close → `/Notes`, /Notes clean
(390 = 390), scroll persistence 600 → 600 across the drawer cycle, landscape
992 > 301 scrolls — **no Tailwind v4 mobile-nav bug, the 32nd consecutive live
confirmation (the 31st at baseline + this post-fix re-verification)**. The CC1
round-trip demoed LIVE on the daemon: export → splice `displayName` +
`themeMode: "dark"` into the user block → import → **200**, the preferences
applied (`themeMode: "dark"` via `/api/auth/me`), the spliced name never rode
(`name` stays "Demo Student"). Three evidence frames in
`docs/screenshots/128-clone-*.png`, all verified non-blank (the mobile drawer
50.8% content; the applied-dark-theme dashboard 84.8% dark; the export panel —
content-verified after the recapture below).

**The honest mid-run corrections (all pin- or procedure-side):**
1. **The CC1 e2e pin's first design reused the base envelope's fixed row ids**
   — the id is the GLOBAL primary key, so the fresh user's import P2002'd a
   **409** ("That record already exists") before ever reaching the profile
   patch; the pin was RED for the WRONG reason. Fixed with the BT1b/S117
   unique-id convention (its own `s128-cc1-subject`), then RED for the RIGHT
   reason (the 400).
2. **The export evidence frame first captured a 404** — the route is lowercase
   `/export`, not `/Export` (the one-page SPA's twenty rewritten paths are
   capitalized, the export panel is a standalone route); recaptured at the
   right path and content-verified ("Export Your Data" + "What's included" +
   "Download").
3. **A same-ms id pin design flaw found in RED:** the CC8 distinct-ids pin
   first asserted only set-distinctness (which `Date.now()+random` passes
   999/1000); the discriminating leg is MONOTONICITY (the counter only moves
   forward — `Date.now()+random` ids are non-monotonic by construction), which
   fails deterministically pre-fix.
4. **The arithmetic lesson:** the unit delta initially mis-summed as +19 (the
   removed `minutesToHHMM` "2 legs" were ONE `it()` with two asserts); the
   stash-and-rerun comparison pinned date at net 0 and the census at +20 exact
   — the §8.1 rows and the vitest header now carry the corrected derivation.
5. **The background-build lesson re-learned** (the s126 transcript's own
   incident): a `&`-detached `npm run build` dies with the tool session and
   leaves an EMPTY log — the baseline build was re-run in the foreground
   (REAL_EXIT verified).
6. **A lint class:** the inline `require("node:child_process")` in the new
   script-conventions pin violated `@typescript-eslint/no-require-imports` —
   hoisted to the file's top-level ESM imports.

**Guardrails held:** no test weakened, no lint/type rule loosened, no e2e pin
deleted (the one removed unit leg tested dead code that left with its export —
the CB21 precedent). Census: unit **1191** + e2e **560** = **1751 green**.

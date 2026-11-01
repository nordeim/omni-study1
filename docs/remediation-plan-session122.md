# Remediation Plan — Session 122 / Batch BW (Cycle 72)

**Status: COMPLETE** (executed TDD-style 2026-11-01 — the verification record is §5 below)
**Date:** 2026-11-01 · **Workspace:** refreshed clone at `ffbca0f` (the Batch BV state
`a332384` + the operator's `docs/session_114.md` transcript) · **Audit-driven hardening
session** — the standing rhythm (audit the prior-batch diff, ride the riders, re-certify
cold).

---

## 0. Scope and Method

The operator directed the standing rhythm: refresh the workspace (`git pull` → `ffbca0f`,
clean), re-read the full doc chain (`AGENTS.md`, `CLAUDE.md`, `README.md`, `PAD`,
`omni-study1_SKILL.md`, `docs/session_113.md`, `docs/remediation-plan-session121.md`,
`worklog.md`, `docs/session_114.md` — README/PAD + the SKILL doc digested via parallel
read-only subagents, AGENTS.md/CLAUDE.md read direct), re-validate against the codebase,
audit with the repo skills as rubrics (`skills/web-application/SKILL.md` §5/§6/§7/§16
the API surface, §8/§9/§12/§13 the frontend; `skills/` excluded from checking/testing/
compilation), iterate on visual + functional parity with `https://omni-study1.base44.app/`
(the mobile navigation menu the named focus, Tailwind v4 the named suspicion class), keep
the repo a production-ready functional SUPERSET, verify the `.env`/`db/` contract and the
vitest + playwright suites, plan remediation for everything found, execute with TDD (RED →
GREEN), capture evidence, update the docs chain, and commit + push to `main` via the SSH
wrapper.

Method (the six-phase workflow): ANALYZE → PLAN (this document) → VALIDATE (every finding
re-verified by direct read + live probe BEFORE planning the fix — all 9 M/H findings and
the fix-worthy L items were personally re-verified against the tree; the two parity
questions were measured live on the reference) → IMPLEMENT (smallest safe diff, TDD) →
VERIFY (cold re-cert) → DOCUMENT.

### Baseline (cold, BEFORE any work)

lint ✓ · `tsc --noEmit` ✓ (`noImplicitAny` + `noUnusedLocals`/`noUnusedParameters`) ·
unit **1054/1054** (39 files) · the canonical build green (exit 0) · the cold 5-chunk e2e
**501/502 — 134+147+62+90+68**: chunk 1's `S120/BU9` Add-Exam-Cancel pin FAILED (the
skeleton race — see BW1), reproduced 4/4 in isolation and root-caused to the non-retrying
`before` count racing the pre-warm completion (trace-verified: the count ran ~160 ms
before the `/api/exams` response landed; the Exams view's chrome renders during the
Splash — the S16 pre-warm contract itself HOLDS) · the register re-derivation **249
importers / 130 Usage-line carriers / 0 stale / 119 usage-line-free** (the 23rd
consecutive hold, the expectation stated before the measurement) · the Mode-C audit of
the Batch BV diff (`a332384`): **17/17 substantive claims re-verified TRUE** against the
tree (zero key material; the six `121-*.png` frames present; unit census confirmed live
1054/1054), with two claim-text drifts noted: BV1's seam lives in
`src/lib/server/entities.ts:118` (the plan text said `validation.ts`) — folded into BW4's
docs pass; the screenshot count is six, not seven.

**A tooling lesson recorded this cycle (AP-130):** the agent toolchain's OUTPUT pipeline
silently strips certain bracket-letter sequences (`[m`, `[h` observed) from command
output — a displayed `transition-argin]` was actually `transition-[margin]` (verified by
char codes: 45,91,109). One phantom "corrupted class" finding was retracted after char-code
verification. **Any bracket-bearing string read through tool output must be verified by
char codes before it becomes a finding.**

### Live parity (both hosts — agent-browser + DOM probes)

**No NEW visual parity gap; no Tailwind v4 mobile-nav bug — s122 re-confirmed (the 23rd
consecutive live confirmation).** The standing reference battery held: the unlabeled
hamburger, no `role=dialog` drawer-open, 24 visible links drawer-open, the 288px drawer
panel, backdrop `blur(4px)`, `/Notes` overflow 416 > 390 (the reference's own defect),
the landscape drawer-nav scroll 992 > 290. The clone battery GREEN: the labeled hamburger
(the a11y superset) + drawer (`role="dialog"`, `aria-label="Navigation menu"`, 20 nav
links, the 288px `w-72` panel — reference-measured parity, the backdrop labeled
"Close navigation menu" at `blur(4px)`), navigation → /Analytics + auto-close, `/Notes`
clean at 390, the landscape nav scroll available (992 > 755 at 844×390), the scroll
persistence 600px carried Dashboard → /Analytics.

**Two reference measurements settled parity decisions this cycle (the DOM-authority
rule):**

- **N1 (the note title):** the reference's note title fires ZERO network saves while
  typing (fetch+XHR instrumented, 10+ seconds of typing + a 3s/6s settle window) — it
  persists on the explicit Save. The clone's per-keystroke PATCH + full-collection
  refetch (a store-controlled input) is a functional DEVIATION with a real defect
  underneath (the snap-back + the request storm) → **BW3** resolves it the superset way
  (a debounced autosave — the clone's documented content-autosave rhythm — with a
  store-synced local draft).
- **N2 (the solver history):** the reference's Math Solver renders NO history section at
  zero (re-measured live — consistent with the s70 zero-state probe), and the s72
  populated measurement showed a working "Recent Problems". The clone renders the
  heading + an invented empty-state promise at zero AND never persists solves (the
  route writes no rows — the feature is dead) → **BW2** resolves both halves (persist
  like the chat route; hide the section at zero like the reference).

Probe residue: zero on the reference (the note probe deleted; the reference's own
immediate-delete behavior re-confirmed).

### The audits

Two parallel deep audits against the `skills/web-application` rubrics with ROTATED
coverage (the BV cycle had just deep-covered §5/§6/§7/§16 + §8/§9/§12/§13 on the surfaces
it fixed; this cycle's fresh eyes went to what BV did NOT deep-cover): the API audit
focused on the AI/math routes, files/folders, calculator/RUM/settings/holidays, the
import/export seams, the delegate factory's remaining edges, the schema/seed, and the
unpinned-guarantee lens (§14/§15) — **0C/0H/2M/5L/4I**; the frontend audit focused on the
e2e test layer itself as a codebase, the calculator/math-solver/AI-assistant views,
quill-editor + notes, the auth sub-screens, shared.tsx + the SVG charts, and the
export/rum panels — **1H/3M/4L/4I**. Consolidated, de-duplicated, reference-measured,
and folded into the BW table below. Verified-clean areas (stated, not silently dropped):
the AI family budget/ordering/deadline set (all four routes share `ai:<uid>` BEFORE
validation; the SDK confined to route files; the vision branch regex-locked to data URLs),
the files/folders 2 MiB triple-enforcement + download contract + cycle guard, the RUM
routes, the settings alias/trim/no-default discipline, the import/export secret guards +
FK pre-emption + topo sort, the delegate factory's ownedFks census (all 12 FK fields
across the 10 registry delegates match the schema), the schema cascades + index coverage,
the seed idempotency + SEED_DEMO gate, the calculator keyboard/focus/error contracts, the
math-solver client gates, the AI-assistant rollback contract, the Quill lifecycle +
AE1/AG6/AH1/AH2 machinery, the charts' aria/empty-state/division guards, the auth
surface's state machine + autoComplete types + no-enumeration, and the remaining e2e
non-waiting reads (all properly gated or deliberately instant).

---

## 1. The BW table (findings → fixes)

Severity per the Mode-C taxonomy. Every item was verified by direct read before planning;
the functional ones were additionally measured against the reference or reproduced live.

### BW1 (High, e2e-layer) — the immediate-read-after-`hydrated()` race class (the BU9 family + two cousins)

- **Finding:** `hydrated()` resolves pre-paint (the boot-script `--sf-primary` var), so a
  non-retrying read taken right after it races the shell flip + the pre-warm completion.
  THREE instances of the exact pattern: the Exams BU9 pin
  (`tests/e2e/parity-session8.spec.ts:1221` — CONFIRMED failing 4/4 on this machine +
  the cert's 134≠135), the Assignments BU9 pin (`parity-session9.spec.ts:369` — passed
  by timing luck), the Timetable BU9 pin (`parity-session9.spec.ts:352` — same). Plus
  two cousins: the MyDay suggestions test's whole body hides behind
  `if (await toggle.count())` / `if (await row.count())` guards
  (`parity-session8.spec.ts:330-349` — vacuously passable), and the fixed "day 15"
  deselect clicks (`dark-mode.spec.ts:177`, `parity-session8.spec.ts:240`) — the calendar
  `onClick` SETS the selection (there is no toggle-off), so on the 15th of every month
  the click re-selects today and the unselected-tint poll times out — a deterministic
  once-a-month suite failure.
- **Fix:** the AP-96 visibility gate (`await expect(<locator>.first()).toBeVisible()`)
  before every before-count (the seeded data guarantees a first row on all three views —
  the seed ships 4 exams, assignments, and timetable classes); the MyDay test adopts its
  sibling's `toBeVisible()` flow (the 305-328 pattern); the deselect clicks target a
  today-independent day (`15`, or `14` when today IS the 15th). Plus the rider: the s14
  D1/D2 held chat route releases its in-flight request to the REAL server on unroute
  (harmless in the full file only because C1 exhausts the demo budget first) — abort the
  held route before unrouting (`heldRoute?.abort("failed")`), keeping the busy-clears
  assertion meaningful (the abort rejection is the real clearing path). And the a11y
  sweep's headline-only gate scans a possibly pre-data DOM — add an optional per-view
  `settled` selector (first row or empty-state text) to the shared VIEWS map for the
  data views.
- **Tests:** in-place edits (no census change); the Exams pin's current red IS the RED
  evidence; after the fix, 5× isolated runs + the chunk-1 cold re-cert prove determinism.

### BW2 (High, functional parity) — the Math Solver's "Recent Problems" can never populate

- **Finding:** the solver view builds its history exclusively from `aiChatMessage` rows
  with `surface === "solver"` and calls `mutations.refreshAiMessages()` after every
  solve — but `POST /api/math/solve` persists NOTHING (no write path anywhere; only
  `/api/ai/chat` writes rows, and the assistant client hardcodes `surface: "assistant"`).
  The shipped empty-state copy ("Problems you solve will be saved here.") is an
  explicitly false promise (invented in the initial commit, unpinned). The s72 cycle
  measured the reference's POPULATED "Recent Problems" (a solved problem was created on
  the reference before measuring) — a functional parity gap. And the zero-state is ALSO
  a deviation: the reference renders NO history chrome at zero (re-measured live this
  cycle), while the clone renders the heading + the invented copy unconditionally
  (S5-AB6 pins the heading visible at zero — against the reference's measured zero).
- **Fix:** (a) the solve route mirrors the chat route's persistence — the problem +
  solution rows in one `$transaction` with `surface: "solver"`, written ONLY on a
  successful reply (a failed solve bounces the composer, no orphan rows — the S13
  doctrine); (b) the view renders the section only when `history.length > 0` (the
  reference's measured zero-state), dropping the invented copy and the now-unreachable
  spinner branch; (c) the pins: S5-AB6 flips to the zero-state absence (the reference's
  measured behavior) and a NEW populated pin solves a trivial problem through the real
  route (retry-once on a 5xx — the SDK occasionally returns empty) and asserts the
  Recent Problems card appears with the probe text + a non-empty answer, covering both
  the persistence and the populated anatomy (the h2 style assertions move here).
- **Tests:** the new populated pin (+1 e2e); the unit layer gets none (the persistence
  is a db write in the route — the e2e layer is its pin home). Budget: the pin rides the
  demo user's `ai:` budget in chunk 3 where nothing else consumes it (all other AI pins
  route-mock; the s14 C1 exhaustion lives in chunk 2 and the limiter is per-chunk-boot).

### BW3 (High, functional) — the note title PATCHes per keystroke, un-debounced, with a full collection refetch

- **Finding:** the title Input is controlled ONLY by store state
  (`value={selected.title}`, no local state) and its `onChange` fires
  `updateNote(id, {title})` on EVERY keystroke — each one a PATCH plus a full-collection
  `GET /api/notes`. Typing an N-char title fires N PATCHes and N refetches; interleaved
  refetch responses re-render the input to an older value mid-typing (visible snap-back)
  and out-of-order server processing can persist a stale title. The content path IS
  debounced (600ms in quill-editor.tsx) — the title path missed it. The reference
  persists the title on Save only (N1 measured) — the clone's per-keystroke storm is a
  deviation, and `parity-session7.spec.ts:1275` already comments "the debounced title
  PATCH settles" — the test layer believes a debounce the code does not implement.
- **Fix:** a store-synced local draft + a 600ms debounced PATCH (the editor's own
  rhythm), flushing on note switch (the departed note's pending title must not be lost —
  the AG6 departed-note gates ride the flush), on explicit Save (`saveNow` flushes the
  pending title before the content save), and on unmount (the editor's unmount-flush
  symmetry). The BT11 failed-rename streak-toast contract is preserved verbatim (the
  debounced PATCH's settle branches keep the selectedIdRef gates + the once-per-streak
  toast). The parity-session7 comment becomes TRUE (and its `waitForTimeout(800)`
  becomes a deterministic `waitForResponse` on the debounced PATCH).
- **Tests:** a new e2e pin types a title character-by-character and asserts ≤2 PATCH
  requests total (the old behavior fired one per character) + the final persisted title;
  the parity-session7 title pin is upgraded to the waitForResponse form.

### BW4 (Medium, contract) — the import `$transaction` is missing its documented 60 s timeout (+ PAD drifts)

- **Finding:** the PAD's ADR-021 documents "ONE interactive `$transaction` (60 s
  timeout)… per row a userId-scoped `updateMany`… the Prisma error mapping is
  route-local (P2002/P2003/P2012/P2013 → actionable 400s)". The shipped code: (a) no
  `{ timeout: 60_000 }` — Prisma's interactive default is 5 s, so a legitimate large
  envelope (the seam allows ~1 M-char fields; many small rows) can exceed it → P2028 →
  the shared mapper's 500 — violating the route's own 400-contract (the rollback itself
  is correct); (b) `findFirst` → `update`/`create` per row, not `updateMany`; (c) the
  shared `toErrorResponse`, not a route-local mapping. Three PAD-vs-code drifts on the
  app's most complex contract. (Related Mode-C note: BV1's seam lives in `entities.ts`,
  not the `validation.ts` the BV plan text said — same docs-truth class.)
- **Fix:** pass `{ timeout: 60_000 }` to the `$transaction` (the code side); reconcile
  the PAD ADR-021 text to the shipped reality (findFirst+update/create is the CORRECT
  semantics — it preserves explicit `updatedAt` and reads the row's live values; the
  route-local mapping was consolidated into the shared mapper in a later cycle — the PAD
  text is what's stale).
- **Tests:** the timeout option is not unit-pinnable (a db-timing behavior); the fix is
  one option + the PAD reconciliation. The s23-import round-trip pin re-certifies the
  unchanged happy path.

### BW5 (Low, bounded growth) — the calculator history is the only growing-table route with neither a bounded read nor a retention bound

- **Finding:** `GET /api/calculator/history` returns every row (`findMany`, no `take`);
  the POST is unthrottled. The sibling growing tables both got the family treatment
  (`ai/messages` take 500 + budget; `rum` take 500/2000 + budget).
- **Fix:** the family form: `take: 500` newest-first, reversed in the route to preserve
  the UI's oldest-first order + a per-user retention trim on write (delete beyond the
  newest 500 — bounds the table without a user-visible failure mode; a rate limit would
  silently drop history for a legitimately fast calculator). The no-crud-bucket posture
  (every factory POST/PATCH/DELETE unthrottled) is the documented single-node decision —
  noted in the PAD threat model, unchanged this cycle.
- **Tests:** a unit-shaped pin is not available (db behavior); the e2e calculator spec's
  existing history pins re-certify the ordering/shape; the 500 bound is documented in
  the route comment (the family precedent — `ai/messages`'s take is likewise
  unpinned-beyond-shape).

### BW6 (Low, boundary uniformity) — the assistant reply is persisted with no length bound

- **Finding:** every other persisted field at the chat boundary is schema-bounded (the
  user leg ≤10k, cards ≤2k, questions ≤2k); the assistant leg writes
  `extractAssistantContent(response)` unchecked — a runaway provider reply writes an
  arbitrarily large row (and the GET returns up to 500 of them).
- **Fix:** cap at write, 100_000 (the note-content precedent), truncating with a comment
  (the trust boundary is the provider, not the requester — truncation keeps the
  conversation; the cap is the pathological-provider guard).
- **Tests:** a unit pin on the new pure cap helper (the exact boundary).

### BW7 (Low, data-quality superset) — the timetable classes have no endTime > startTime ordering guard (the events BU22 class)

- **Finding:** an event with end-before-start is rejected at both the create schema and
  the single-leg PATCH merge (BU22/BV1); a timetable class with `startTime: "10:00",
  endTime: "09:00"` persists verbatim (create and PATCH — no `beforeWrite` for this
  delegate). Zero-padded hhmm strings compare lexicographically, so the guard is a plain
  string comparison.
- **Fix:** mirror the events pattern: a `.check()` on `timetableClassSchema` (create) +
  a pure `checkTimetableOrderingMerge(existing, writes)` seam + the delegate's
  `beforeWrite` (single-leg PATCH vs the stored row). The reference has no such guard —
  this is superset hardening (the owned-FK precedent).
- **Tests:** RED unit pins on the schema check (inverted rejected, legal accepted) + the
  merge seam (single-leg inversions both directions vs the stored row, the legal moves,
  the null clear) — the event-merge pin file's shape; a wire-level e2e append.

### BW8 (Low, seam hygiene) — `parseImportEnvelope` + `IMPORT_FK_MAP` are dead on the request path (unpinned twin maps)

- **Finding:** the unit-pinned seam is imported by no route; the import route carries
  its own `REQUIRED_FKS`/`OPTIONAL_FKS`/`IMPORT_ORDER` twins with materially different
  FK semantics (the seam resolves envelope-only; the route resolves envelope ∪ the
  owner's live rows — the CORRECT semantics). The route's operative maps have no census:
  a future export collection added with an FK would fail the seam pin while shipping
  with no route-side FK pre-emption.
- **Fix (minimal — the drift hazard closed, the refactor deferred):** a unit census pin
  asserting the route's maps match the seam's `IMPORT_FK_MAP` key-by-key and
  target-by-target (so the two cannot drift apart), + comments on both sides stating
  the semantic split (the seam: envelope-only; the route: envelope ∪ live rows) and
  WHY the route owns the operative resolution.
- **Tests:** the census pin (+2 unit tests: required + optional maps).

### BW9 (Low, UX superset) — the OTP paste distributes only the first digit

- **Finding:** `setBox` takes `value.replace(/\D/g, "").slice(-1)` — a pasted 6-digit
  code lands as ONE character in the focused box (browsers clip the paste to
  `maxLength=1`); the code is surfaced right above the input (the no-SMTP in-band
  delivery), so paste is the dominant entry path. No `onPaste` handler exists.
- **Fix:** an `onPaste` on the boxes distributing the clipboard digits left-to-right
  from the focused index, focusing the next empty box — pure superset (invisible
  statically, no reference surface changes).
- **Tests:** an e2e pin (fill box 1, paste the full code via `page.evaluate` clipboard
  event or `locator.pressSequentially`-assisted paste) — simplest deterministic form:
  dispatch a synthetic paste event with `clipboardData` and assert all six boxes fill.

### BW10 (Low, data hygiene) — the Quill image toolbar inserts unbounded base64 (breaks the note save)

- **Finding:** the measured snow toolbar includes `image` (parity — do not remove);
  Quill 2's default handler inserts base64 data-URLs. A typical screenshot (~200 KB →
  ~270 KB base64) exceeds the note-content cap (100_000) → the autosave 400s (the BT11
  streak toasts it) — the editor permits content the server rejects.
- **Fix:** keep the toolbar; register a custom image handler that gates the insert by
  the resulting content budget (~60 KB file → ~80 KB base64, leaving room for text),
  rejecting oversized inserts with an inline toast. Superset (the reference has the same
  toolbar; its own cap posture is unmeasured).
- **Tests:** a unit-shaped pin is not available (Quill runtime); the handler is
  code-reviewed + the existing editor pins re-certify.

### BW11 (Low, coverage) — the unpinned wire guards: the files 413 and the import 413

- **Finding:** no test posts an over-cap upload (2 MiB) or an over-cap import (10 MiB)
  — only the shared-reader unit + an 11 MiB LOGIN post pin the reader itself. The
  routes' own 413 copies and envelope math are unpinned (a regression ships green).
- **Fix:** two request-level e2e pins: a >2 MiB multipart POST → 413 with the files
  copy; a >10 MiB JSON POST → 413 with the import copy. Budgets: the files POST rides
  `upload:<uid>` (20/15min — 1 use); the import POST brings s23-import to 9 of its 10
  (the over-cap 413 counts — 9 ≤ 10, safe).
- **Tests:** +2 e2e pins.

### BW12 (Low, coverage) — `src/lib/server/ai.ts` is the only lib seam family with zero unit pins

- **Finding:** `withDeadline` (the timer race + loser rejection suppression),
  `extractAssistantContent` (the provider shape walker), and `extractJsonBlock`
  (balanced-fence parsing with a fallback block) are only exercised incidentally —
  §14's tier-1 rule is unit pins at the pure seams.
- **Fix:** a new `tests/ai-helpers.test.ts`: deadline rejection + the AiDeadlineError
  name, the loser's rejection suppression (no unhandled rejection), the content-shape
  family (string/array-parts/missing), the fence-stripping + fallback-block edge cases
  (unbalanced fences, no fences, nested braces).
- **Tests:** +8 unit pins.

### BW13 (Info, hygiene set) — the small items

(a) the multipart upload filename is unbounded/un-normalized at rest (the JSON branch's
`linkFileSchema` trims + bounds at 200 — the multipart branch only trims; serve-time is
safe) → normalize + bound at write (400 on >200); (b) `prisma/seed.ts`'s early-return
path skips `$disconnect()` (benign under bun — the happy path and the SEED_DEMO=0 path
both disconnect) → add it for consistency; (c) the export panel surfaces the raw V8
`JSON.parse` message for a malformed backup → friendly copy ("That file is not a valid
StudyFlow backup."); (d) the GPA "Add course" ids come from `Date.now()` — a
same-millisecond double-click collides (React key collision) → a monotonic counter.
Left as-is (documented non-gaps): StatCard's `{hint ?? label}` duplication (deliberate
anatomy), the rum unknown-rating fallback (unreachable — schema-validated ratings), the
in-process limiter posture, the no-crud-bucket posture.

### Documented non-gaps (measured, no change)

The reference's /Notes 416px overflow, its unlabeled hamburger, its no-`role=dialog`
drawer, its Save-only note persistence (the clone's debounced autosave is the documented
superset), the bare `{error}` envelope, the force-dynamic posture (PAD-documented), the
`transition-[margin]` main class (the BS10 fix — verified correct by char codes after
the tooling artifact), the tasks-view instant delete (F5), the no-Cancel dialogs (the
s120 matrix).

---

## 2. The TDD sequence

RED first (every pin verified failing for the right reason on the pre-change tree):

1. **Unit RED:** timetable schema + merge pins (validation.test.ts append + a new
   timetable-merge test file); the assistant-cap helper pin; the import-FK census pins;
   the ai-helpers file (the deadline/extract family).
2. **E2E RED:** the BW3 debounced-title pin (fires ~one PATCH per char today); the BW2
   populated-solver pin (no history card today); the files/import 413 pins (assert the
   413s — they may already pass if the caps work; if so they are coverage pins, not RED
   pins, and that is stated); the BW9 paste pin.
3. **The already-RED:** the Exams BU9 pin (the cert's 134≠135 + 4/4 isolated) IS BW1's
   RED evidence.

GREEN (smallest safe diffs, in dependency order):

4. BW1's test-layer fixes (the visibility gates, the MyDay flow, the today-independent
   deselect, the D1/D2 abort, the a11y settled map) — the Exams pin goes green; 5×
   isolated runs prove determinism.
5. BW2 (the solve-route persistence + the view's zero-state hide + the AB6 flip).
6. BW3 (the title draft + debounce + flushes + the parity-session7 upgrade).
7. BW4 (the import timeout + the PAD reconciliation).
8. BW5–BW7 (the calculator read/retention, the assistant cap, the timetable guard).
9. BW8–BW13 (the census pin, the paste handler, the image gate, the 413 pins, the
   ai-helpers pins, the hygiene set).

## 3. Verification checklist (the cold re-cert)

lint ✓ · `tsc --noEmit` ✓ · unit (new census — 1054 + ~17) · the canonical build · the
cold 5-chunk e2e (new census — 502 + 3: 135+147+62+90+68 → chunk 1 +0 [the AB6 flip is
in-place, the solver pin lands in chunk 3], chunk 3 +3 [the solver pin + the two 413
pins... the 413 pins' home decided at implementation: the files pin rides chunk 2 or 3
per the resilience spec's home]) · the register tripwire re-derivation (249/130/0/119 +
this cycle's additions if any playwright script is added) · the live curl battery (the
timetable inversion → 400 both directions; the legal move → 200; the solver persistence
→ the messages GET shows the pair; the calculator trim) · the live agent-browser battery
(the mobile drawer family, the solver populated + zero states, the notes title typing) ·
the evidence screenshots · `.env.example` verified current. **Standing debt: ZERO.**

## 4. Documentation chain (the same-commit updates)

README (badge + census + the Session-122 row) · AGENTS.md (the commands census + the
S122 lessons: the output-pipeline artifact [AP-130], the hydrated-race class, the
title-debounce contract) · CLAUDE.md (the seam-tail census + the BW contracts) ·
vitest.config.ts header (the new census) · PAD (v1.3.30: the ADR-021 reconciliation +
the BW entries) · the cert-script census re-tag (AFTER the DONE line) · the master
remediation-plan header → Batch BW · the SKILL doc (the census + AP-130) ·
`worklog.md` (this cycle's entry) · `docs/session_115.md` (the session record, titled
"Session 123").

## 5. Execution record (2026-11-01)

**Status: COMPLETE — standing debt ZERO.** Executed TDD-style in the plan's order; the
census math held exactly.

- **RED verified:** 17 unit pins (timetable-merge 12 [one pin's scenario was
  mis-constructed — the "missing leg" case actually constructs a LEGAL comparison; fixed
  to the true missing-other-leg form], ai-helpers 15 [the whole file rides the import
  failure until `capPersistedContent` exists], import-maps 2) + 4 e2e pins (BW2 ×2, BW3
  [8+ PATCHes on char-by-char typing], BW9 [the paste fills one box with the LAST digit —
  the `slice(-1)` shape]) + the two BW11 413 pins GREEN-on-arrival (coverage pins, as the
  plan stated) + the Exams BU9 live red (BW1's evidence). The 413 pins' budget arithmetic
  held (the import POST rides chunk 3's own limiter boot — the s23-import 8-of-10 budget
  is chunk 5's, untouched).
- **GREEN:** unit **1054 → 1085** (41 files); e2e **502 → 508** (135+148+66+90+69 — the
  plan's chunk-3 prediction of +4 held exactly; chunk 2 gained the BW3 pin [parity-7 is
  chunk 2, not 3 — the plan's only census slip] and chunk 5 the BW9 pin).
- **The mid-run catches (the honest corrections):** (1) the BW3 pin's final assertion
  missed AH8a's Date.now() in the note title (regex widened); (2) **the BW7 live probe
  caught the seed's unpadded hours** — `startTime: "9:00"` written past the Zod boundary,
  and the first string-compare form rejected every LEGAL move on a legacy row
  ("11:00" < "9:00" lexicographically); closed with minutes-since-midnight normalization
  + the unpadded-legacy/malformed-legacy unit pins + the wire pin (the BV1 Date-fixture
  lesson's hhmm sibling); (3) the NoteTitleInput's first draft used set-state-in-effect —
  the lint gate caught it, rewritten as the key-remounted child; the render-time
  latest-ref write moved to the AH1 effect-time form; (4) **the AP-130 retraction** — the
  tool OUTPUT pipeline strips bracket-letter sequences (`[m`, `[h`): a phantom
  "corrupted `transition-argin]` class" was disproven by char codes
  (`transition-[margin]`, computed `margin / 0.2s` — the BS10 fix works as designed). No
  repo change; the rule is recorded (bracket-bearing evidence is re-read as char codes).
- **The a11y networkidle rider verified empirically:** the full 20-view sweep ran green
  with the settle gate (21 passed, ~39 s — no beacon storm; the beacon posts only on the
  early vitals).
- **Determinism proof for BW1:** the fixed Exams BU9 pin ran 3/3 green in isolation
  (was 4/4 red) and chunk 1 re-certified first-pass.
- **Live curl battery:** the timetable inverted create → 400 (the ordering copy); the
  single-leg inversion → 400 both directions; the legal move → 200 **on the legacy
  unpadded row**; the calculator GET newest-reversed.
- **Final re-cert (the §3 checklist):** lint ✓ · tsc ✓ · unit **1085/1085** (41 files) ·
  the canonical build green · the cold 5-chunk e2e **508/508** (every chunk first-pass) ·
  the register tripwire **249/130/0/119** (the exact hold) · the five `122-*.png`
  evidence frames (non-blank-verified) · `.env.example` current (the diff carries no new
  env reads).

# Remediation Plan — Session 125 / Batch BZ (Cycle 75)

**Status: COMPLETE** (executed TDD-style 2026-11-01 — the verification record is §5 below)
**Date:** 2026-11-01 · **Workspace:** refreshed clone at `37d29cd` (the Batch BY state
`09d3054` + the operator's `docs/session_120.md` transcript) · **Audit-driven hardening
session** — the standing rhythm (audit the prior-batch diff, ride the riders, re-certify
cold).

---

## 0. Scope and Method

The operator directed the standing rhythm: refresh the workspace (`git pull` → `37d29cd`,
clean — `docs/session_120.md` the only new file), re-read the full doc chain (`AGENTS.md`,
`CLAUDE.md`, `README.md`, `PAD`, `omni-study1_SKILL.md`, `docs/session_119.md`,
`docs/remediation-plan-session124.md`, `worklog.md`, `docs/session_120.md` — PAD + the
SKILL doc digested via parallel read-only subagents, AGENTS.md/CLAUDE.md/README read
direct), re-validate against the codebase, audit with the repo skills as rubrics
(`skills/web-application/SKILL.md` §5/§6/§7/§16 the API surface, §8/§9/§12/§13 the
frontend; `skills/` excluded from checking/testing/compilation), iterate on visual +
functional parity with `https://omni-study1.base44.app/` (the mobile navigation menu the
named focus, Tailwind v4 the named suspicion class), keep the repo a production-ready
functional SUPERSET, verify the `.env`/`db/` contract (`DATABASE_URL="file:../db/custom.db"`
+ `db/` at the repo root — verified current) and the vitest + playwright suites (both
present and census-anchored), plan remediation for everything found, execute with TDD
(RED → GREEN), capture evidence, update the docs chain, and commit + push to `main` via
the SSH wrapper.

Method (the six-phase workflow): ANALYZE → PLAN (this document) → VALIDATE (every
finding re-verified by direct read BEFORE planning the fix — all M/H findings personally
re-verified against the tree; the H finding additionally reproduced live in the DOM and at
the wire) → IMPLEMENT (smallest safe diff, TDD) → VERIFY (cold re-cert) → DOCUMENT.

### Baseline (cold, BEFORE any work)

lint ✓ · `tsc --noEmit` ✓ (`noImplicitAny` + `noUnusedLocals`/`noUnusedParameters`) ·
unit **1113/1113** (41 files) · the canonical build green (exit 0) · the cold 5-chunk e2e
**523/523 — 137+153+71+92+70, every chunk first-pass** (run per-chunk in the foreground,
replicating the cert script's exact kill→fresh-db→run procedure — the sandbox reaps
daemonized processes between tool calls) · the register re-derivation **249 importers /
130 Usage-line carriers / 0 stale / 119 usage-line-free** (the 27th consecutive hold, the
expectation stated BEFORE the measurement — the calibrated instrument: repo files
importing `playwright` exactly) · the Mode-C audit of the Batch BY diff (`09d3054`, 59
files, +1571/−234): **all substantive claims re-verified TRUE** against the tree (BY1's
gradeLevel union + the UI `""` send; BY2's nodeEnv-gated Turbopack fallback; BY3's
25 MiB cap on the shared constant; BY5's `export:${user.id}` on both GETs; BY6's
buildTrends null-gap seam + the type-predicate finite filter; BY7's `data-app-hydrated`
gate across 16 spec files + the `HydrationMarker`; BY8's print-exact checked checkbox;
BY9's AVATAR_EMOJIS vocabulary; BY10's popstate drawer-close; BY11's skip-link gating;
BY12's sf-focus removal — 0 occurrences; BY13's container-scoped forced-colors picker
selectors; the 5 evidence frames; zero key material in the diff).

### Live parity (both hosts — agent-browser, mobile 390×844)

**Reference** (logged in `sepnetflix2023@outlook.com`): hamburger UNLABELED
(name=null, 36×36 at [17,14]) ✓ the standing measurement holds · drawer: **no
role=dialog** ✓ · panel **288px** ✓ · backdrop **blur(4px)** on the true layer ✓ ·
/Notes horizontal overflow **416 > 390** (the reference's own defect) ✓ · landscape
(844×390) drawer-nav **scrollHeight 992 > clientHeight 290, overflow-y auto** ✓.
**Drift observation (chrome-level, recorded):** the drawer now carries exactly **20 nav
links** (the historical "24 links" pin reflected drawer chrome that no longer exists on
the live reference — a footer/profile section). The clone's 20 links are the CURRENT
exact parity set. Current measurements are authoritative (the S123 data-drift doctrine
extended to the reference's own chrome evolution).

**Clone** (`:3000`, demo session): hamburger **labeled "Open navigation menu"**
([16,14,36,36] — the a11y superset) ✓ · drawer **role=dialog + aria-label
"Navigation menu"** (superset) ✓ · panel **288px, max-width 331.5px = 85vw** ✓ ·
**20 links** ✓ · backdrop **blur(4px)** (`bg-black/20 backdrop-blur-xs`, computed
`oklab(0 0 0 / 0.2)` — the trap-7 serialization) ✓ · nav auto-close ✓ · /Notes
**clean** (scrollW 390 = clientW — the reference's own defect fixed) ✓ · scroll
persistence (Dashboard 600px → /Analytics 600px) ✓ · landscape nav **992 > 301,
overflow-y auto** (same class as the reference's 992 > 290) ✓ · the BY10 popstate
close re-verified (pushState → back → drawer closed, URL followed) ✓.
**No Tailwind v4 mobile-nav bug — the 26th consecutive live confirmation.**

### The audits (rotated dual deep, the standing rhythm)

The rotated pair covered what S121–S124 did NOT deep-cover — the **frontend view layer +
client data layer** (§8/§9/§12/§13 rubrics) and the **API route family beyond the
BY-covered surfaces** (§5/§6/§7/§16 rubrics). FE: **0C/1H/3M/3L/1I**; API:
**0C/0H/1M/3L/4I**. Every M/H finding personally re-verified by direct read before this
plan; the H finding reproduced live (DOM + wire). The display-artifact discipline
(AP-130): the API-I4 log-tag "typos" were byte-verified via python `repr` — both REAL
(`"ealth]"` / `"ath/solve]"` — the `[h`/`[m` prefixes are genuinely absent from the
bytes), not output-pipeline ghosts.

### §0.1 Verified-clean (the next cycle's coverage map)

api.ts (timeout unwrap + offline classification); store.ts (popstate drawer contract,
theme lifecycle); the `mutations` object (per-key seq guard, cascade refreshes);
shared.tsx primitives; dashboard/calendar/myday/analytics/gradetracker/timetableView/
files/focustimer/aiassistant/mathsolver (the audited views beyond the findings —
the timeout family, the rollback paths, the BW3 title debounce, the BX3/BX9 date
handling, the pure updaters all sound); ownership scoping on every audited read/write
path (factory `where:{userId}`, deck-join ×3, files/folders guards ×5); sentKeysPatch
at every write site (the seventeenth-seventeenth census); ownedFks on all 10 FK-bearing
delegates; the error mapper (Zod→400, P2002→409, P2025→404, 401, generic 500
server-side-only); scrypt/HMAC timing-safe primitives; cookie flags; Prisma cascade +
index census; string/id/date/blob caps; the space-y/mt v4 trap sweep (no violating
child margins); no raw SQL beyond the static health probe; the export's own 20
`findMany`s (independent of the factory `list` — the BZ13 safety check); the register
dummy-burn + uniform-200 families; the ai: limiter census; the s23 import round-trip.

## 1. The verified findings (consolidated, de-duplicated)

**FE-H1 · Flashcards: Add Card + AI Generate silently no-op on the auto-selected deck**
(`flashcards-view.tsx:178`/`:221`, Verified + reproduced live). The render-derived
selection model (`effectiveDeckId`, S123/BX8) falls back to the first deck, but
`submitCard` guards `if (busy || !selectedDeckId) return;` and `generateCards` guards
`if (!selectedDeckId || generating) return;` — with ≥1 deck and no explicit click,
`selectedDeckId` is null while the detail pane renders the auto-selected deck's cards:
submitting the open dialog does NOTHING (verified live: dialog stays open, no toast, no
card — and the wire confirms no POST fires). A user with existing decks hits this on
first visit of every session. **Fix: both guards + the `createFlashcard`/
generate payload use `effectiveDeckId`.**

**FE-M1 · Practice-tests AI call site is the only one without the 120 s deadline**
(`practicetests-view.tsx:192-199`, Verified). Every other AI call site passes
`{ timeoutMs: 120_000 }` + the `isTimeoutError` branch (flashcards:228, aiassistant:87,
mathsolver:97); this one has NEITHER — `apiSend` sets no AbortSignal at all (verified in
api.ts: `if (options?.timeoutMs !== undefined)`), so a hung request disables the
Generate button forever and a timeout rejection surfaces raw DOMException text — the
S13 RESILIENCE contract violation. **Fix: add both, mirroring flashcards-view:228-239.**

**FE-M2 · Keyboard-inoperable nested buttons inside a Radix menuitem**
(`notes-view.tsx:580-606`, Verified). The S119/BT10 "Manage notebooks" DropdownMenu
nests Rename/Delete `<button>`s inside `DropdownMenuItem` (`role="menuitem"`) — a
WAI-ARIA nested-interactive violation: menu arrow-keys focus the item (not the buttons)
and Tab CLOSES the menu, so both actions are effectively mouse-only. **Fix: convert the
surface to a Radix Popover (the content keeps the menu's exact geometry classes;
the rows become plain divs; the actions become real tab stops). The trigger's name
("Manage notebooks") + placement are pinned by the BT10 e2e pin and unchanged.**

**FE-M3 · removeMember deletes EVERY member sharing the email**
(`studygroups-view.tsx:234-237`, Verified). Duplicate members are schema-legal and the
render key disambiguates by index (S121/BV17), but removal filters `m.email !==
member.email` — clicking one X removes all duplicates in one write. **Fix: a pure seam
`removeOneMember(members, email, name)` (group-members.ts — the parseMembers home)
that removes exactly the FIRST (email, name) composite occurrence; the view calls it.**

**API-M1 · No write budget on the entity CRUD family**
(`src/lib/server/http.ts:270-273`, Verified). Only login/register/verify, upload, AI,
export/import, rum carry `checkRateLimit`; every `makeCollectionRoutes` POST (16 routes:
tasks, notes, decks, cards, exams, grades, assignments, events, timetable, notebooks,
practice-tests, focus-sessions, task-lists, study-groups, subjects, holidays) is
unthrottled — an authenticated script grows the single-node SQLite at line rate (the
exact rationale S118/BS3 documented for throttling uploads), with `noteSchema.content`
100 000 chars/row. **Fix: `checkRateLimit(`write:${user.id}`, 600)` in the factory POST
(after auth, BEFORE readJson — the C1 convention), 429 + Retry-After on exhaust. Budget
sizing: 600/15-min ≈ 40 sustained writes/min — 12× the heaviest realistic human burst
(creates ~50/15 min), and the ai: 20-budget precedent's ~3× doctrine scaled to the
CRUD family; a flooding script consumes it in seconds. The e2e suite's heaviest chunk
consumes ≈100-120 before the pin (measured self-calibrating below) — the budget never
interferes with legitimate flows. PATCH/DELETE stay unthrottled this cycle (bounded by
existing rows — the growth vector is creates) — documented as the next candidate.**

**API-L1 · Unbounded factory collection reads** (`entities.ts:236-239`, Verified).
`list` = `findMany({ where: { userId }, orderBy: { createdAt } })` — no `take`; notes
ship ≤100 KB content each (1 000 notes ≈ 100 MB JSON). The bounded-reads doctrine
(S118/BS3) bounded ai/messages/calculator at `take: 500`; the factory family never got
it. **Fix: `take: 500` on the factory `list` (the shipped asc+take convention —
response bounded; the slice tradeoff identical to the ai/messages precedent). The
export route is independent (its own 20 findManys — verified) so the completeness
contract is untouched; realistic fixture/seed counts are 2-3 orders below the cap.**

**API-L2 · Folder re-parent cycle guard is TOCTOU-racy**
(`files/folders/[id]/route.ts:66-86`, Verified). The cycle check reads the chain then
updates non-atomically; two concurrent PATCHes (A→B, B→A) both pass against the
pre-write snapshot. Impact bounded (the client walk is cycle-safe since AL3), but the
guard's promise is false under concurrency. **Fix: read-check-update inside
`db.$transaction` (SQLite serializes interactive transactions — the check re-reads
the chain inside the transaction).**

**API-L3 · gradeSchema has no score ≤ maxScore guard**
(`validation.ts:443-449`, Verified). `score: 0..1000`, `maxScore: 1..1000` — no
cross-field check; 900/100 persists and renders 900%. The repo's own doctrine added
end≥start (events, BU22 + BV1/BV10 merge) and hhmm ordering (BW7/BX1) for exactly this
class. **Fix: the BU22+BV1 pattern — `gradeCreateSchema = gradeSchema.check()` fires
when both legs are present (score is required, maxScore defaults 100 — the create-side
injection is the honest row state); the update path carries NO schema check (zod4's
`.partial()` injects the maxScore default — the check would compare against the
injected 100, not the sent/stored pair); instead the `checkGradeRangeMerge(existing,
writes)` beforeWrite seam owns BOTH legs on PATCH (both-sent → compare the pair;
single-leg → compare against the stored row; the S123/BX1 normalized-guard rule applied
at every enforcement site).**

**API-I1 · files/link response shape drifts from the metadata contract**
(`files/link/route.ts:41-52` vs `files/route.ts:99`, Verified). The files POST JSON
branch returns `select: FILE_METADATA` (S82/AI6: "the create responses carry the SAME
metadata shape as the LIST — the base64 data column never rides a JSON response body");
files/link returns the FULL row. `data` is null for links today — pure shape drift.
**Fix: move FILE_METADATA to `src/lib/server/http.ts` (beside buildContentDisposition
— route files cannot export shared symbols under Next's route-type validation) and add
the select to files/link's create.**

**API-I2 · Stale flashcardSchema comment contradicts the route**
(`validation.ts:380-384`, Verified). The comment claims deckId is "injected by the
create route from the URL (/api/flashcards/cards is nested under a deck)"; the route
is flat and the delegate requires body deckId (`400 "A flashcard needs a deck."`).
**Fix: rewrite the comment to the shipped contract.**

**API-I3 · Register's P2002 race branch breaks the uniform-200 doctrine**
(`auth/register/route.ts:112-117` + the http.ts mapper, Reasoned→Verified by read).
Two concurrent same-email registrations: both pass `findUnique`, the loser's
`db.user.create` throws P2002 → `toErrorResponse` → **409 "That record already
exists."** — the exact enumeration oracle S120/BU14 closed, re-opened in the
millisecond race window. **Fix: catch P2002 around the create → the uniform
`{ ok: true }` (the verified-exists branch's exact shape — no code leg: the loser's
own token was never stored, so an echoed code would be invalid; the winner's client
carries the working one).**

**API-I4 · (a) calculator-history trim is non-transactional with a nondeterministic
tiebreak** (`calculator/history POST`: count → findMany(skip 500) → deleteMany,
`createdAt desc` same-millisecond ties make the skip-trim nondeterministic) —
**Fix: `$transaction` + `orderBy [{createdAt: "desc"}, {id: "desc"}]`.**
**(b) Two server log tags are byte-level corrupted** (byte-verified via python repr —
NOT the AP-130 display artifact): `health/route.ts:21` `console.error("ealth] db
probe failed:")` and `math/solve/route.ts:105` `console.error("ath/solve] solve
failed:")` — the `[h`/`[m` prefixes are genuinely absent; both defeat log grep.
**Fix: restore `[health]` / `[math/solve]`.**

**FE-L1 · Dead "Rename note" dialog branch** (`notes-view.tsx:345-347` + `:874`,
Verified — all three setDialog sites enumerated: only `{kind:"note", editing:null}`,
`{kind:"notebook", editing:null}`, `{kind:"notebook", editing:row}` exist). The
`{kind:"note", editing: NoteRow}` variant is unreachable; the branch + the "Rename
note" title conditional mislead. **Fix: drop the dead variant (the DialogState note leg
loses its `editing` field); note titles edit via the debounced inline input (BW3).**

**FE-L2 · Dead export `formatClockShort`** (`shared.tsx:334-339`, Verified — zero
consumers repo-wide). **Fix: delete.**

**FE-L3 · Duplicated boot-fetch body in FilesView** (`files-view.tsx:189-202` vs
`:206-226` — `refresh()` and the mount effect repeat the identical two-GET block).
**Fix: extract the request pair into one loader both call (the effect still inlines
the call — the set-state-in-effect lint workaround unchanged).**

**FE-I1 · Boot refetches the pre-warmed collections** (data.ts:383-399 + page.tsx —
seq-guarded, correctness holds; cost is 5 duplicate requests once per boot).
**ACCEPTED — documented, no fix (the pre-warm ticket model is a future candidate).**

**Doc-drift set (BZ17, from the PAD + SKILL digest subagents — every item verified
against the tree before this plan):** PAD §12's `globals.css` "~230" vs the real 1002
lines; PAD §8.4's stale floor cells "1099+"/"516+"; PAD §6.3's session shape missing
`v` (sessionVersion, S118/BS1); PAD §1.2's zod/playwright version cells vs the lockfile
(4.6.7 / 1.64.1); PAD §3.2's v1.0-era annotated tree (missing /rum, /export,
/reset-password, robots/sitemap, 11 auth routes, the import/export/rum/ai routes, ~13
lib seams, 5 components); PAD §8.1's total-row arithmetic (524 vs 523 — reconciled at
the docs phase against the fresh census). SKILL: §7's `tasksDelegate` → the real
`taskDelegate`; the db-path "16 tests" → 18 (BY2 added +2); §4's "`sf-slide-in`"
keyframe (does not exist — only `sf-shimmer`); §10+§15's hydration-gate recipe (the
stale `--sf-primary` wait vs the shipped `data-app-hydrated` marker — the BY7 swap);
Appendix B's "9 Tailwind traps" vs §4's ten; §18's z-map line pointer (notes-view
776 → 859); the header census cells (524/1637 — reconcile to the honest counts); §4's
`.sf-canvas` hsl quote vs the shipped hex literals; the `z-ai-web-dev-dev-sdk` typo;
§20's AccentToken "14 fields" → 15 (`gradientToStrong`); AP-116's dangling path
(`scripts/e2e-chunk.sh` → `scripts/e2e-chunked-cert.sh`); §10's health payload quote
missing `app: "studyflow"`.

## 2. The BZ set (TDD — RED first, then the source)

Pin homes: unit — `tests/validation.test.ts` (BZ6 create legs),
`tests/grade-merge.test.ts` (NEW — the BZ6 merge seam, the event-merge precedent),
`tests/group-members.test.ts` (BZ4 removeOneMember). e2e — `parity-session7.spec.ts`
(BZ1, file-end), `parity-session8.spec.ts` (BZ3 keyboard + BZ4 members, file-end),
`s14-hardening.spec.ts` (BZ6 grades wire + BZ8 link shape + BZ5 exhaustion — the
file's LAST tests; the exhaustion pin is the chunk's last test, after which nothing in
chunk 2 writes).

- **BZ1 (H)** flashcards: swap both guards + payloads to `effectiveDeckId`.
  e2e RED: fresh /Flashcards → Add Card → fill → submit → card renders + dialog
  closed (pre-fix: silent no-op, reproduced live). finally: DELETE the card.
- **BZ2 (M)** practicetests: `{ timeoutMs: 120_000 }` + the `isTimeoutError` branch.
  Code-verified (no e2e pin — the AI routes are budget-intercepted everywhere else).
- **BZ3 (M)** notes manage-notebooks: DropdownMenu → Popover (visual classes
  preserved; rows are divs; Rename/Delete are real tab stops; Escape closes + restores
  focus). e2e RED: md+ viewport → open → the content renders (role=dialog) with
  NO menuitem, Tab reaches the action buttons, the BT10 placement pin keeps holding.
- **BZ4 (M)** studygroups: `removeOneMember` pure seam (group-members.ts) + the view
  swap. Unit RED: duplicate members → removes exactly one. e2e RED: fresh group →
  add the same member twice → remove once → exactly one remains → finally: delete
  the group.
- **BZ5 (M)** the write budget: `checkRateLimit(`write:${user.id}`, 600)` in the
  factory POST. e2e RED: self-calibrating exhaustion (POST valid minimal tasks until
  429, cap 650 — never trips for legitimate flows; assert the Retry-After header;
  assert anon still 401s) — `test.setTimeout(120_000)`; placed as chunk 2's final
  test (s14-hardening's last) so no later spec shares the exhausted demo budget.
- **BZ6 (L)** the grade ordering guard: `gradeCreateSchema` `.check()` +
  `checkGradeRangeMerge` beforeWrite on the grades delegate. Unit RED: create
  rejects 900/100, accepts 90/100 and the defaulted leg; merge rejects single-leg
  score-over-stored-maxScore + maxScore-under-stored-score, passes the legal pair.
  e2e RED (wire): PATCH a seeded grade's maxScore below its stored score → 400 (no
  write — no restore needed); POST `{score: 900, maxScore: 100}` → 400; a legal
  POST → 201 → DELETE in finally.
- **BZ7 (L)** folders/[id]: the cycle check + update inside `db.$transaction`.
  Code-verified (the race is not deterministically e2e-reproducible).
- **BZ8 (I)** FILE_METADATA → http.ts (shared), both file routes import it;
  files/link's create gains the select. e2e RED: POST /api/files/link → 201, the
  response JSON carries no `data` key → DELETE in finally.
- **BZ9 (I)** register: P2002 around the create → uniform `{ ok: true }`.
  Code-verified (the race window is not deterministically reproducible; the shipped
  uniform-200 pins keep guarding the other branches).
- **BZ10 (I)** calculator history trim: `$transaction` + the id tiebreak.
  Code-verified (the retention behavior is already §0.1-covered).
- **BZ11 (I)** the two log-tag byte fixes (`[health]`, `[math/solve]`).
  Code-verified (console output — no pin class).
- **BZ12 (I)** the flashcardSchema comment rewrite. Code-verified.
- **BZ13 (L)** the factory `list` gains `take: 500`. Code-verified + documented (the
  ai/messages asc+take convention; export independent — verified; no fixture user
  approaches the cap).
- **BZ14 (L)** the dead note-rename variant removal (type narrowing + the branch +
  the "Rename note" title conditional). Code-verified.
- **BZ15 (L)** the dead `formatClockShort` export removal. Code-verified.
- **BZ16 (L)** the FilesView boot-fetch loader dedup. Code-verified.
- **BZ17** the docs chain (§4 below) — every doc-drift item from §1, the census
  re-tags (unit +6: validation +3, grade-merge NEW +... exact counts measured at the
  docs phase; e2e 523 → 529 = 139+157+71+92+70), the S125 lessons, the BZ contract
  entries in AGENTS.md, the evidence frames (125-*.png), the session record
  (`docs/session_121.md`), and the worklog entry.

Rejected/deferred (documented): FE-I1 (accepted informational); API-M1's PATCH/DELETE
legs (bounded by existing rows — the next cycle's candidate); the export's own
unbounded enumeration (the completeness contract — by design).

## 3. Verification checklist (the cold re-cert)

1. Unit: the full census, every new pin RED-before/GREEN-after, zero skipped.
2. lint + `tsc --noEmit` clean (`noUnusedLocals` will catch any BZ14/BZ15 leftover).
3. The canonical build green (the type gate).
4. Cold 5-chunk e2e: **139+157+71+92+70 = 529**, every chunk first-pass, per-chunk in
   the foreground with the cert script's kill→fresh-db procedure.
5. The register tripwire: 249/130/0/119 (no new playwright scripts — the pins ride
   existing spec files; the BZ4 e2e helper is inside an existing file).
6. Live curl battery on :3000: the grade guard (400 on the inverted pair), the write
   budget (429 + Retry-After after 600), files/link shape (no `data` key), the flashcards
   Add Card POST firing, the register uniform-200 race shape.
7. Live agent-browser: the BZ1 round-trip (card created + rendered), the BZ3 keyboard
   walkthrough (Tab reaches Rename/Delete, Escape closes), the BZ4 duplicate-member
   removal, the mobile drawer battery re-run (the standing measurements hold).
8. Evidence frames captured + programmatically verified non-blank.

## 4. Documentation chain (the same-commit updates)

AGENTS.md (commands table census, the S125 lessons ×4, the conventions: the write
budget, the bounded list, the grade ordering guard, the popover pattern) · CLAUDE.md
(census lines) · README.md (badge + testing rows + the Session-125 status row) ·
`vitest.config.ts` header · the cert script Expected line + the re-tag block ·
PAD (§12 re-measure, §8.4 floors, §6.3 session shape, §1.2 version cells, §3.2
regeneration, §8.1 reconcile + the per-file rows for changed spec files, the
revision block) · the SKILL doc (the §1 twelve-item drift set) · this plan's §5 ·
the session record `docs/session_121.md` · `worklog.md` (the Session-125 entry).

## 5. Execution record (2026-11-01)

- **RED phase:** unit +14 pins (validation +4, grade-merge NEW +7, group-members +3)
  and e2e +6 pins (BZ1 flashcards, BZ3 keyboard, BZ4 members, BZ5 exhaustion, BZ6
  grades wire, BZ8 link shape) — every RED verified for the RIGHT reason before the
  source phase (the wrong-reason-RED smell: locators, navigation, filter states —
  the BX9 discipline; two pin-side corrections were needed to reach it, below).
- **GREEN phase:** BZ1-BZ16 landed in the smallest safe diffs; the interim gates
  (touched-file unit runs, tsc, lint) green after each item. **BZ11 shipped NO
  change — RETRACTED during execution** (see the honesty ledger).
- **Corrections during execution (honesty ledger):**
  1. **BZ4/BZ3 pin navigation (pin-side):** the fresh-row create-fetches ran inside
     `page.evaluate` at about:blank — relative URLs need a real origin; both pins
     gained the leading `goto` + re-goto (the AL1b convention).
  2. **The entities import injection (source-side, caught by the unit layer):** the
     scripted edit put `GRADE_SCORE_ABOVE_MAX`/`gradeCreateSchema` into the
     group-members import block (the regex matched the first `import {`); the merge
     threw empty-message ValidationErrors; the import was rewired and the unit pins
     re-run green.
  3. **The grade-merge legacy pin fixture (pin-side):** the non-numeric-stored-leg
     pin sent the SCORE leg (a number, overriding the stored string) — the stored
     leg must be the one the effective-pair falls back TO; the pin now sends the
     maxScore leg.
  4. **BZ11 RETRACTED (the AP-130 extension):** the audit's "corrupted log tags"
     (`"ealth]"`/`"ath/solve]"`) were display-pipeline artifacts — the FIRST
     "byte-verification" (a python repr PRINT of the region) inherited the same
     eating pipeline and "confirmed" the phantom; the hex dump + byte-constructed
     searches proved `[health]`/`[math/solve]` byte-correct since birth. No change
     shipped; the verification rule is now AGENTS S125 lesson 1 + AP-133.
  5. **BZ5's first design poisoned the chunk (test-infra design):** the exhaustion
     pin spent the DEMO user's budget in s14-hardening, reasoning s14 was the
     chunk's last file — playwright runs spec files ALPHABETICALLY, so s14 ran
     BEFORE tasks.spec and 429'd six later tests (the golden paths + the BV7
     probes). The fix: FRESH-USER isolation (the s25 TEST-NET register convention)
     — the demo user is never mutated and the placement constraint disappears.
  6. **BZ1's strict-mode flake (pin-side):** the seed writes its three decks with
     same-millisecond `createdAt` ties, so `decks[0]` is random per seed; when the
     0-card "Spanish Vocabulary" wins, the empty grid renders a SECOND exact-name
     "Add Card" CTA → strict violation (~50% of chunk runs, 6/6 green alone).
     The locator hardened with `.first()` (the header button is DOM-first; both
     open the same dialog) — AGENTS S125 lesson 3.
- **Cold re-cert (the FINAL tree):** lint ✓ · tsc ✓ · unit **1127/1127** (42 files)
  · the canonical build green · the cold 5-chunk e2e **529/529 — 139+157+71+92+70,
  every chunk first-pass** (chunk 2 verified TWICE for the seed-order flake; chunk
  1 re-run on the final spec set) · the register tripwire **249/130/0/119** (the
  28th consecutive hold).
- **Live verification:** the mobile drawer battery re-run GREEN on the fresh S32
  daemon (no Tailwind v4 mobile-nav bug — the 26th consecutive live confirmation);
  the agent-browser round-trips: **BZ1** (dialog closes + the card renders + POST
  201 at the wire + cleanup DELETE 200 — the exact probe that reproduced the
  silent no-op pre-fix), **BZ3** (open → focus lands on the first Rename button →
  Tab → Delete button → Escape closes), **BZ4** (one duplicate removed, the
  sibling survives); the curl battery: **BZ6** (the inverted pair 400 with the
  copy verbatim, the legal pair 201, the single-leg shrink 400), **BZ8** (201, no
  `data` key, has `name`). Zero residue on every probe (cleanups verified).
- **Docs:** §4 completed in the same commit; the evidence frames in
  `docs/screenshots/125-*.png` (6 frames, all verified non-blank programmatically).

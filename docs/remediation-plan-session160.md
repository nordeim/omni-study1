# Remediation Plan — Session 160 (Cycle 110, Batch DI)

> Status: PLANNED (pre-change record — the immutable plan; the as-executed
> close lives in §9). Written before any source change, per the standing
> doctrine ("write the cycle plan into docs/remediation-plan-sessionN.md
> BEFORE any source change").
>
> Operator directive: refresh the workspace, re-read the doc chain
> (AGENTS/CLAUDE/README/PAD/SKILL + session_191/192 +
> remediation-plan-session159 + worklog), validate against the codebase,
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

**Workspace (warm at `db30190` on `main` — the Batch DH fix `21efe2b` +
the operator's session_192 transcript commit; `git pull` fast-forwarded
`21efe2b..db30190` [docs-only: docs/session_192.md]. Environment verified
in place: `.env` byte-identical to `.env.example` at the documented dev
posture [`DATABASE_URL="file:../db/custom.db"`], the repo-root `db/`
[custom.db 389 KB + e2e.db], node_modules, bun 1.3.14, node v24.22.2, the
Playwright chromium cache).**

**Cold baseline (before any work): lint ✓ · tsc ✓ · the full Vitest run
1619/1619 (48 files — the documented S159 final state exactly) · the dev
daemon preflight GREEN (hydrated, navigation-stable) · the drawer check
GREEN (**the 80th consecutive no-Tailwind-v4-mobile-nav-bug
confirmation** — backdrop oklab(0 0 0 / 0.2) + blur(4px); 288px white
panel; 20 links; no footer; Escape-close superset) · the desktop chrome
probe **MATCH** (all five formal checks, live reference login —
sidebar-outer 260 / 20 links / first-links / mainX 260 / mainWidth 1180,
the S142 outer-footprint probe).** Baseline noise: none.

**The config posture re-validated (the operator's standing ask):** the
vitest include matches `src/**/*.test.ts` + `tests/**/*.test.ts` only
(vitest.config.ts:1098); the playwright testDir is `tests/e2e` with the
production-build webServer on `db/e2e.db`; tsconfig excludes `skills`
(tsconfig.json:41-44); eslint ignores `skills` (eslint.config.mjs:58) —
the repo-included `skills/` folder is excluded from code checking,
testing, and compilation on every axis, as directed.

## §1 The audits (Mode-C; every M/L finding re-verified by direct read by the orchestrator)

### Audit A — the Batch DH recent-changes axis (the `21efe2b` diff; `db30190` docs-only)

**0C / 0H / 0M / 0L / 0I — clean.** All three DH claims verified DELIVERED
at the source anchors: DH1's optional-FK non-string rejection block at
data-import.ts:524–553 (the named message + the documented guarantee
comment + the nulling-loop re-anchor at :660); DH2's three census legs in
tests/data-import.test.ts (the completeness census at :1097–1098, the
parity spot-pins at :1143–1147); DH3's dead-ternary collapse in
route.ts (the `target === source ? source : target` tautology replaced by
the direct `target` read with the honest comment) — and the doc census
chain machine-verified (README badge 2235 ✓ · AGENTS 1619 ✓ · CLAUDE
1619 ✓ · PAD v1.3.67 ✓ · the SKILL census ✓ · the vitest header 48/1619 ✓
· the cert runner Expected 616 [152+189+91+95+89] ✓) — zero stale count
sites.

### Audit B — the AI routes + AI persistence family (the rotation's fresh axis; the family last deep-swept at cycle 72 / session 122's BW set — the most stale family on the board)

The axis read dispatched to a read-only subagent against the
web-application skill's §3/§4/§5/§6/§7/§16/§17 rubric: the five route
files (ai/chat, ai/generate-cards, ai/generate-questions, ai/messages,
math/solve) + the `src/lib/server/ai.ts` seam + the related unit files
(ai-helpers, api-timeout, validation sections) + the e2e pinning coverage
(s14-hardening C1/CA1/CB3, resilience A1–A3, parity-session5 BW2,
parity-session7 dialog, parity-session8 CB8) + the four client call sites
+ the rate-limiter seam + the schema models. **Verdict:
0C / 0H / 2M / 4L / 3I.** The family remains coherent, secure, and
substantially well-pinned (the auth gate ordering before every LLM call;
the identical 20/15-min `ai:${user.id}` budget on all four POST routes;
every field Zod-bounded behind the 10 MiB reader; the SDK confined to the
four route files; the BW2 solve-mirrors-chat transactional pair write
held; the CA1 newest-500 window held; `capPersistedContent` on every
provider-trusting leg; the client 120 s timeout + server withDeadline
race + 504 mapping on all four; the CB8 split-failure-domain code held on
all three surfaces). The findings (each re-verified by direct read):

- **M1 (M — Verified by direct read):** `/api/ai/generate-cards` has
  ZERO round-trip test coverage — `rg "generate-cards" tests/` → 0
  matches. The route carries real unpinned logic: the deck-ownership 404
  (route.ts:55–59), the LLM-JSON-parse → 502 fallback (:86–89), the
  bounded draft list (:34), and the 20-row transactional create (:91–103).
  Its three siblings are each pinned at the wire. **Rides §7 (DI6 — the
  wire-boundary pins: the pre-LLM boundary 401/400/404).**
- **M2 (M — Verified by direct read):** the CB8 send/refresh
  failure-domain split is pinned ONLY for the chat surface
  (parity-session8.spec.ts:1565–1603); `rg "didn't refresh" tests/e2e` →
  0 matches — the solver twin ("Solved — but the history didn't
  refresh", mathsolver-view.tsx:113) and the flashcards twin ("Drafted —
  but the deck didn't refresh", flashcards-view.tsx:293) are asserted
  NOWHERE. A refactor collapsing the nested try/catch re-opens the exact
  pre-CB8 bug class with no failing test. **Rides §6 (DI5 — the two CB8
  twin pins).**
- **L1 (L — Verified by direct read):** generate-cards' `$transaction`
  (route.ts:91–103) rides Prisma's 5 s interactive default with up to 20
  sequential creates while BOTH siblings carry the explicit
  `{ timeout: 15_000 }` (chat/route.ts:131, math/solve/route.ts:93) — the
  S130/CE9 doctrine unapplied on the third route. **Rides §2 (DI1) +
  §4's census (the machine guard).**
- **L2 (L — Verified by direct read):** `aiChatSchema`
  (validation.ts:557–568) accepts an ALL-ASSISTANT payload — the route's
  `lastUserMessage` fallback (chat/route.ts:126–127) then persists a
  content-less user row (`userContent: ""`). The client always appends a
  trailing user message, so only crafted API payloads trigger it; the
  unit pin (validation.test.ts:502–514) does not cover the shape.
  **Rides §3 (DI2 — the user-message refine).**
- **L3 (L — Verified by direct read):** the shared `ai:${user.id}`, 20
  budget form is enforced in all four routes (chat:86, cards:45,
  questions:57, solve:37 — verified by grep) but pinned ONLY through the
  s14 C1 e2e leg which exhausts via `/api/ai/chat`; a refactor forking
  one route's key/limit trips nothing. **Rides §4 (DI3 — the census).**
- **L4 (L — Verified by direct read):** `AiChatMessageRow`
  (data.ts:275–283) declares `updatedAt: string` but the messages GET map
  (messages/route.ts:26–33) omits it — a TypeScript lie in a strict repo
  (the store slice types promise what the wire never delivers; the
  factory GETs DO return updatedAt — the hand-written AI GET is the
  family outlier). **Rides §5 (DI4 — the wire honors the type).**

I1–I3 informational: the deck-name-as-topic prompt redundancy (the client
sends `topic: selectedDeck?.name` — cosmetic prompt duplication);
generate-questions' 201-with-`test:null` on the draft path + the
UI-unreachable `persist:true` leg; the newest-500 window + the
clear-DELETE spanning both surfaces (documented trade-offs at the route
header). Adjudicated in §8.

**Point 8 (the client ↔ route round-trip verdict): COMPATIBLE, no
breaking mismatches** — wire shapes verified pairwise on all five routes;
the `subjectId: ""` clear convention round-trips via the shared
`nullableId` atom; the only wire-vs-type drift is L4.

**No measurement-gated candidate this cycle:** the S159 close's recorded
deferral ledger (the A-M3 stage-2 re-measure triggers; the update-side
raw-SQL bulk upsert — closed HARDER on the DH0 3.07× headroom; the I-2/I-3
riders — rejected as measurement-covered; the I-4 parse posture —
documented) stands unchanged; none of this cycle's findings is
profiling-gated.

## §2 DI1 — the CE9 tx-timeout mirror (the L1 close, mechanism-corrected in execution)

**The change (src/app/api/ai/generate-cards/route.ts:91–127):** the
transactional card-create converts to the INTERACTIVE transaction form
with the explicit `{ timeout: 15_000 }` option. **The honest mechanism
correction (found at implementation):** the audit's L1 note said the
array form "rides Prisma's 5 s interactive default" — that is imprecise:
the ARRAY overload's options accept only `isolationLevel` (tsc: "timeout
does not exist in type '{ isolationLevel?: ... }'"); the array form
carried NO deadline at all, so a hung create (disk stall, lock
contention) held the request open until the client's own 120 s timeout.
The interactive conversion bounds the whole 20-create write at 15 s —
matching both siblings' form and doctrine (chat's pair write,
solve's pair write, the S130/CE9 posture). The 201 wire shape is
unchanged (`{ cards: createdRows }`). **Verified by the DI3 census leg
(the RED pre-fix: the census demands the option in all three
tx-carrying routes; generate-cards fails it pre-change) + the full
gate.**

## §3 DI2 — the user-message refine (the L2 close)

**The change (src/lib/validation.ts, `aiChatSchema`):** the messages
array gains the refine demanding at least one `role: "user"` message:

> `.refine((msgs) => msgs.some((m) => m.role === "user"), { message: "A conversation needs at least one message from you." })`

The route's `lastUserMessage` fallback (`userContent: ""`) becomes
unreachable-by-validation; the crafted all-assistant API payload answers
the named 400 at the parse boundary (`parseWith` → `ValidationError` →
the standard 400 envelope, the message surfaced verbatim). The client's
own payloads always append a trailing user message — no client impact.

**The RED legs (tests/validation.test.ts, the `aiChatSchema` describe
extension — one new `it()`):** the all-assistant payload REJECTED with the
named message (currently parses clean — the designed RED); the mixed
[user, assistant] history shape still ACCEPTED (the legal transcript
replay — the client's own shape). **Arithmetic: +1 unit leg.**

## §4 DI3 — the AI-routes source census (the L3 + L1 machine guard)

**The change (tests/ai-routes-census.test.ts, NEW — the
script-conventions source-census precedent applied to the route family):**
a two-leg census reading the four AI route files:

1. **The budget-key census:** every one of the four route files
   (ai/chat, ai/generate-cards, ai/generate-questions, math/solve)
   carries the exact `checkRateLimit(\`ai:${user.id}\`, 20)` form — the
   shared-key/shared-limit contract machine-pinned per route (a forked
   key or limit on any route fails loudly; today all four agree —
   green-on-arrival, the guard).
2. **The tx-timeout census:** every `$transaction(` occurrence in the
   three tx-carrying routes (chat, generate-cards, math/solve) is paired
   with the `{ timeout: 15_000 }` option (count-equality: the count of
   `$transaction(` === the count of `timeout: 15_000`, both > 0, per
   file) — **RED pre-DI1 on generate-cards** (0 timeout options vs 1
   transaction), GREEN after — the L1 fix's machine enforcement.

**Arithmetic: +2 unit legs.** Source-reading test only; no production
change (the census is the guard).

## §5 DI4 — the updatedAt wire reconciliation (the L4 close)

**The change (src/app/api/ai/messages/route.ts, the GET map):** the row
map gains `updatedAt: m.updatedAt.toISOString()` — the wire honors the
`AiChatMessageRow` type (the store's generic `fetchAndSet` flows the wire
shape into the store slice verbatim, so the type's `updatedAt` becomes
truthful; the family's factory GETs already return full rows — the
hand-written AI GET joins the convention).

**The RED leg (e2e, the S126/CA1 leg extension in
s14-hardening.spec.ts:490–501):** the 505-row import probe's GET
assertion extends to the `updatedAt` field — the typed shape gains
`updatedAt: string` and the leg asserts `messages[0].updatedAt` matches
the ISO-8601 prefix (RED pre-fix: the field is `undefined`; GREEN
post-fix). **Arithmetic: +0 census legs (an existing leg's assertions
extended).**

## §6 DI5 — the CB8 solver/flashcards twin pins (the M2 close)

**The change (tests/e2e/parity-session8.spec.ts, the S127/CB8 describe
extension — two new tests, the chat pin's exact shape):**

1. **The solver twin:** goto /MathSolver, hydrated; mock
   `**/api/math/solve` as 200 `{ solution }`; abort `**/api/ai/messages*`;
   fill the "Math problem" textarea; press Solve; settle; assert the
   solution renders, the soft toast "Solved — but the history didn't
   refresh. Reload to catch up." appears, and the false-failure toast
   ("could not solve") NEVER does.
2. **The flashcards twin:** goto /Flashcards, hydrated (a deck is
   selected by the render-derived default); mock
   `**/api/ai/generate-cards` as 200 `{ cards: [] }`; abort
   `**/api/flashcards/cards*` (the post-generate collection refresh —
   `loadCollections(["flashcards"])` fetches decks+cards in one
   `Promise.all`, one abort fails the pair); click "AI Generate"; settle;
   assert the soft toast "Drafted — but the deck didn't refresh. Reload
   to see the new cards." appears and the false-failure toast
   ("Generation failed") NEVER does.

Both legs mock at the network layer (the established parity-session8 /
resilience A1–A3 pattern) — no LLM dependency, no `ai:` budget
consumption (mocked requests never reach the server). **Arithmetic: +2
e2e legs (chunk 1: 152 → 154).**

## §7 DI6 — the generate-cards wire pins (the M1 close)

**The change (tests/e2e/resilience.spec.ts, a new
`S160/DI · the generate-cards wire pins` describe — one test, the CN
family's registerFreshUser + demo-context pattern):** on ONE fresh
TEST-NET user (the existing helper, probe IP 192.0.2.139 — the family's
budget arithmetic becomes 4/10 per-IP, 4/40 registerGlobal; the demo
import budget untouched), three wire legs through the user's authenticated
`page.request`:

1. **The anon 401:** a cookie-stripped POST answers 401 (the s14 C1
   anon convention, extended to the unpinned route).
2. **The count bound 400:** `count: 21` answers 400 at the parse
   boundary (the Zod bound 1–20 — the pre-LLM validation).
3. **The foreign-deck 404:** the demo context's seeded deck id (read via
   GET /api/flashcards/decks on the demo storageState) POSTed as the
   fresh user's `deckId` answers 404 with the named copy "That deck does
   not exist." (the ownership-scoped findFirst — the route's
   userId-scoped WHERE, pinned at the wire).

All three legs exercise the pre-LLM boundary (rate limit → validation →
ownership) — no LLM dependency; the fresh user's `ai:` budget spends 3 of
20 (the 404 + 400 legs consume; the 401 leg pre-auth consumes nothing).
**Arithmetic: +1 e2e leg (chunk 3: 91 → 92).**

**The honest residual (documented, not built):** the LLM-side legs — the
502 garbage-reply parse fallback and the 201 happy-path card create —
remain unpinned: the e2e environment must not depend on the external LLM
service, and the parse atoms (`extractJsonBlock`, `cardDraftListSchema`)
are individually unit-pinned while the transactional create is standard
Prisma. The client's consumption of the 201 shape is covered transitively
by the DI5 flashcards twin (the mocked-200 post-generate path). Recorded
in §8 for the next rotation.

## §8 The rejections + the deferral ledger (adjudicated, the operator's standing best-judgement instruction)

- **I1 (the deck-name-as-topic prompt redundancy) — REJECTED AS
  COSMETIC-BY-DESIGN.** The prompt reads `Create 8 flashcards for the
  deck "Biology" focused on: Biology.` — the duplication reinforces, not
  degrades, the generated output; removing the client's `topic` send (or
  adding a topic input) is a UI behavior change with parity surface
  implications (the reference has no topic input) for zero functional
  gain. Recorded for the next rotation.
- **I2 (the 201-with-`test:null` draft shape + the UI-unreachable
  `persist:true` leg) — REJECTED AS DOCUMENTED-API-SURFACE.** No client
  branches on the status code; the `persist:true` capability is a
  documented API affordance (the self-hosted API consumer). Documented
  here; no change.
- **I3 (the newest-500 window + the clear-DELETE spanning both surfaces)
  — REJECTED AS THE DOCUMENTED TRADE-OFF.** The route header documents
  both behaviors (the client filters by surface; the DELETE is
  API/test-only with no UI affordance). No change.
- **The M1 residual (the LLM-side legs) — DEFERRED with the reasoning in
  §7.** The e2e environment cannot depend on the external LLM; the
  unit-pinned parse atoms + the standard tx create + the DI5/DCB8
  client-path coverage bound the risk. The option recorded.
- **The standing deferral ledger (unchanged this cycle):** the A-M3
  stage-2 (re-measure only if the hardware or the row cap changes); the
  update-side raw-SQL bulk upsert (closed HARDER on the DH0 numbers);
  the S159 plan §6 options (the I-2 double copy, the I-3 elision reads —
  rejected as measurement-covered / documented trade-off); the I-4
  parse-amplification posture (documented, S144/CS5).

## §9 The as-executed close

**Executed as planned, with the honest deltas:**

- **The RED inventory:** the unit REDs **2/2 on their designed markers**
  (the DI2 refine leg — the all-assistant payload parsed clean
  pre-fix; the DI3 tx-timeout census leg — generate-cards carried 0
  timeout options vs 1 `$transaction` pre-DI1); the DI3 budget-key
  census leg green-on-arrival (the guard). **The e2e RED: the DI4
  CA1-extension** — the `updatedAt` assertion failed against the
  pre-DI4 standalone build (the stash → build → run → pop → rebuild →
  re-run sequence proving both directions), GREEN post-fix.
- **The mechanism correction (DI1):** the audit's L-1 said the array
  form "rides Prisma's 5 s interactive default" — tsc proved the ARRAY
  overload's options accept only `isolationLevel`, so the pre-fix
  shape carried NO deadline at all (arguably worse than a 5 s one: a
  hung create held the request open until the client's 120 s abort).
  The fix converts to the INTERACTIVE form (both siblings' shape);
  §2 above carries the corrected record; the plan's census leg held
  unchanged.
- **The count arithmetic held exactly:** unit 1619 → **1622** (+3:
  validation +1, ai-routes-census +2), 48 → 49 files; the e2e census
  616 → **619** (chunk 1 +2 [the DI5 twins], chunk 3 +1 [the DI6 wire
  pin]) — the 5-chunk map 154+189+92+95+89.
- **A tooling find on the way:** a combined 3-spec direct run tripped
  the P1008 socket-timeout machine-load class (the heavy write legs
  fail fast under combined load on this sandbox — 10 failures, all
  s14-hardening's hammer legs, all passing serially); the serial
  per-file runs (27/27 + 70/70 + 42/42 on the touched specs) and the
  one-server-boot-per-chunk cert are the load-safe shapes — exactly
  why the chunked map exists. A second find: backgrounded processes
  do not survive between tool invocations on this sandbox (the
  nohup'd cert died after its first header line) — the cert ran
  chunk-by-chunk in the foreground, one tool call per chunk.
- **Gates:** lint ✓ · tsc ✓ · unit **1622/1622** (49 files) · build ✓ ·
  the remediated-tree re-confirmation (preflight GREEN after the
  S9/S31 stale-cache remedy · drawer GREEN — **the 81st consecutive**
  · parity **MATCH**) · the 5-chunk cold cert: chunk 1 **154/154** ·
  chunk 2 **189/189** · chunk 3 **92/92** · chunk 4 **95/95** · chunk
  5 **89/89** — **all five chunks first-pass clean, zero flakes, the
  cert tally 619/619** · **census 2241 green** (was 2235).
- **Evidence:** the `docs/screenshots/160-clone-*.png` frames (the
  standing desktop + the mobile drawer [the 81st drawer-GREEN
  companion] + the cycle's Flashcards surface — the capture script
  asserting the AI Generate button's visibility), self-verifying
  (ok: true; dimensions machine-checked; md5s distinct; the
  non-blank pixel ratios verified: 22.3% / 41.4% / 11.2%) — captured
  by `scripts/capture-s160-evidence.mjs` (the S159 precedent, node ≥
  23.6).
- **Docs:** README badge/census + the count prose sites + the
  Session-160 row · AGENTS census + the security-hardening row
  extension + the S160 lessons block (three lessons) · CLAUDE counts +
  the contract extension · PAD v1.3.68 (the revision block) · the
  SKILL census (all four sites) + the green-state + the chunk-map
  re-anchor · the vitest header (+3) · the cert runner re-tag (616 →
  619) · `docs/session_193.md` · the worklog Session-171 entry · this
  §9 · the `.env`/`.env.example` contract re-verified byte-identical
  (no env-var reads changed this cycle).
- **Remaining debt:** unchanged from §8's ledger — the A-M3 stage-2
  (hardware/row-cap triggers), the update-side raw-SQL gate (closed
  HARDER on the DH0 numbers), the S159 plan §6 options, the I-4 parse
  posture (documented), and the M-1 LLM-side residual (the
  generate-cards 502/201 legs — documented with its reasoning).

## §10 The ToDo list (the execution checklist)

- [x] Cold baseline certification (§0) — lint ✓ · tsc ✓ · 1619/1619 · preflight GREEN · drawer GREEN (the 80th) · parity MATCH
- [x] Audit A (the DH axis) — clean, all anchors verified
- [x] Audit B (the AI routes family) — 0C/0H/2M/4L/3I, every M/L re-verified by direct read
- [x] DI2 RED: the aiChatSchema refine legs (validation.test.ts) — RED on the all-assistant shape
- [x] DI3 RED: the ai-routes census legs (tests/ai-routes-census.test.ts, NEW) — the tx-timeout leg RED on generate-cards pre-DI1; the budget-key leg green-on-arrival (the guard)
- [x] DI1 GREEN: the generate-cards interactive-tx conversion with `{ timeout: 15_000 }` (mechanism-corrected — §2/§9)
- [x] DI2 GREEN: the user-message refine
- [x] Interim gates: lint ✓ · tsc ✓ · the full unit run 1622/1622 (+3 exactly)
- [x] DI4 RED: the CA1 leg's updatedAt extension — RED against the pre-DI4 build (the stash/rebuild sequence)
- [x] DI5 + DI6 legs written; the three touched specs verified against the pre-DI4 build (DI5/DI6 green-on-arrival guards; DI4 the only designed e2e RED)
- [x] DI4 GREEN: the messages GET updatedAt map; the three touched specs re-run GREEN serially (27/27 + 70/70 + 42/42)
- [x] The dev-daemon re-confirmation on the remediated tree: preflight GREEN · drawer GREEN (the 81st) · parity MATCH
- [x] build ✓ + the 5-chunk cold cert — chunk 1 154/154 · chunk 2 189/189 · chunk 3 92/92 · chunk 4 95/95 · chunk 5 89/89 — all five chunks first-pass clean, zero flakes, the cert tally 619/619 (Expected 154 + 189 + 92 + 95 + 89 = 619 ✓)
- [x] Evidence frames: docs/screenshots/160-clone-*.png (the capture-s160 script, self-verifying ok:true)
- [x] The doc chain: README badge/census (2235 → 2241) + the Session-160 row · AGENTS census (1619 → 1622) + the S160 lessons block · CLAUDE counts + the contract extension · PAD v1.3.68 · the SKILL census + the green-state + the chunk map · the vitest header · this plan's §9 · docs/session_193.md · the worklog Session-171 entry
- [x] The `.env`/`.env.example` contract re-verified (no env-var reads changed this cycle)
- [ ] Commit (Conventional Commit on main) + push via the SSH wrapper (`--remote` per the S157/S158/S159 precedent)

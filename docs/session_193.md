# Session 193 — the S160 cycle (Batch DI)

The workspace was WARM at `db30190` on `main` (the Batch DH fix
`21efe2b` + the operator's session_192 transcript commit;
`git pull` fast-forwarded `21efe2b..db30190` — docs-only, the
session_192 transcript). The environment verified in place (no rebuild
needed): `.env` byte-identical to `.env.example` at the documented dev
posture [`DATABASE_URL="file:../db/custom.db"`], the repo-root `db/`
[custom.db 389 KB + e2e.db], node_modules, bun 1.3.14, node v24.22.2,
the Playwright chromium cache.

Cold baseline (before any work): lint ✓ · tsc ✓ · the full Vitest run
**1619/1619 (48 files — the documented S159 final state exactly)** · the
dev daemon preflight GREEN (hydrated, navigation-stable) · the drawer
check GREEN (**the 80th consecutive no-Tailwind-v4-mobile-nav-bug
confirmation** — backdrop oklab(0 0 0 / 0.2) + blur(4px); 288px white
panel; 20 links; no footer; Escape-close superset) · the desktop chrome
probe **MATCH** (all five formal checks, live reference login —
sidebar-outer 260 / 20 links / first-links / mainX 260 / mainWidth
1180, the S142 outer-footprint probe). Baseline noise: none. The config
posture re-validated for the operator's standing ask: the vitest
include matches `src/**/*.test.ts` + `tests/**/*.test.ts` only; the
playwright testDir is `tests/e2e` with the production-build webServer
on `db/e2e.db`; tsconfig excludes `skills`; eslint ignores `skills` —
the repo-included `skills/` folder is excluded from code checking,
testing, and compilation on every axis.

The audits (Mode-C; every M/L finding re-verified by direct read by the
orchestrator):

- **Audit A — the Batch DH recent-changes axis** (the `21efe2b` diff;
  `db30190` docs-only): **0C / 0H / 0M / 0L / 0I — clean.** All three
  DH claims verified DELIVERED at the source anchors: DH1's
  optional-FK non-string rejection block at data-import.ts:524–553
  (the named message + the documented guarantee comment + the
  nulling-loop re-anchor at :660); DH2's three census legs in
  tests/data-import.test.ts (:1097–1098, :1143–1147); DH3's
  dead-ternary collapse in the import route (the tautology replaced by
  the direct `target` read with the honest comment) — and the doc
  census chain machine-verified (README badge 2235 ✓ · AGENTS 1619 ✓ ·
  CLAUDE 1619 ✓ · PAD v1.3.67 ✓ · the SKILL census ✓ · the vitest
  header 48/1619 ✓ · the cert runner Expected 616 ✓) — zero stale
  count sites.

- **Audit B — the AI routes + AI persistence family** (the rotation's
  fresh axis: the family last deep-swept at cycle 72 / session-122's
  BW set — the most stale family on the board after four consecutive
  export/import cycles). The axis read dispatched to a read-only
  subagent against the web-application skill's §3/§4/§5/§6/§7/§16/§17
  rubric: the five route files (ai/chat, ai/generate-cards,
  ai/generate-questions, ai/messages, math/solve) + the
  `src/lib/server/ai.ts` seam + the related unit files + the e2e
  pinning coverage + the four client call sites + the rate-limiter
  seam + the schema models.

  **Verdict: 0C / 0H / 2M / 4L / 3I.** The family remains coherent,
  secure, and substantially well-pinned (the auth gate ordering before
  every LLM call; the identical 20/15-min `ai:${user.id}` budget on
  all four POST routes before validation; every field Zod-bounded
  behind the 10 MiB reader; the SDK confined to the four route files;
  the BW2 solve-mirrors-chat transactional pair write held; the CA1
  newest-500 window held; `capPersistedContent` on every
  provider-trusting leg; the client 120 s timeout + the server
  `withDeadline` race + the 504 mapping on all four; the CB8
  split-failure-domain code held on all three surfaces). The findings:

  - **M-1 (M — Verified by direct read):** `/api/ai/generate-cards`
    had ZERO round-trip test coverage — `rg "generate-cards" tests/`
    → 0 matches — while carrying real unpinned logic (the deck
    ownership 404, the LLM-JSON-parse → 502 fallback, the bounded
    draft list, the 20-row transactional create). **Rode DI6.**
  - **M-2 (M — Verified by direct read):** the CB8 send/refresh
    failure-domain split pinned ONLY for the chat surface
    (parity-session8:1565–1603); `rg "didn't refresh" tests/e2e` → 0
    matches — the solver and flashcards twins asserted NOWHERE. **Rode
    DI5.**
  - **L-1 (L — Verified by direct read):** generate-cards'
    `$transaction` lacked the siblings' explicit `{ timeout: 15_000 }`
    (chat:131, solve:93 carry it). **Rode DI1 — with the honest
    mechanism correction found at implementation: the audit's "rides
    Prisma's 5 s interactive default" was imprecise (the ARRAY
    overload's options accept only `isolationLevel` — tsc names it);
    the pre-fix shape carried NO deadline at all.**
  - **L-2 (L — Verified by direct read):** `aiChatSchema` accepted an
    all-assistant payload → the route's `lastUserMessage` fallback
    persisted a content-less user row. **Rode DI2.**
  - **L-3 (L — Verified by direct read):** the shared
    `ai:${user.id}`, 20 budget form pinned only through the s14 C1
    e2e leg (which exhausts via /api/ai/chat). **Rode DI3.**
  - **L-4 (L — Verified by direct read):** `AiChatMessageRow`
    declared `updatedAt` while the messages GET never delivered it —
    a TypeScript lie in a strict repo. **Rode DI4.**

  I-1–I-3 informational (the deck-name-as-topic prompt redundancy; the
  201-with-`test:null` draft shape + the UI-unreachable `persist:true`
  leg; the newest-500 window + the clear-DELETE spanning both
  surfaces) — adjudicated and REJECTED in the plan §8.

  **Point 8 (the client ↔ route round-trip verdict): COMPATIBLE, no
  breaking mismatches** — wire shapes verified pairwise on all five
  routes; the only wire-vs-type drift was L-4.

**No measurement-gated candidate this cycle** — the S159 close's
deferral ledger (the A-M3 stage-2 triggers; the update-side raw-SQL
bulk upsert closed HARDER on the DH0 3.07× headroom; the I-2/I-3
riders rejected as measurement-covered; the I-4 parse posture
documented) stands unchanged, and none of this cycle's findings is
profiling-gated.

The plan (`docs/remediation-plan-session160.md`) written BEFORE any
source change and validated against the codebase (the refine's
consumption path, the census's file set, the CA1 leg's assertion
surface, the fresh-user/IP budget arithmetic, the CB8 mock patterns).

**The RED inventory (as it ran): the unit REDs 2/2 on their designed
markers** (the DI2 refine leg — the all-assistant payload parsed
clean pre-fix; the DI3 tx-timeout census leg — generate-cards carried
0 timeout options vs 1 `$transaction` pre-DI1; the DI3 budget-key
census leg green-on-arrival, the guard). **The e2e RED: the DI4
CA1-extension** — the `updatedAt` assertion failed against the
pre-DI4 standalone build (the field undefined on every row), GREEN
post-fix (the stash/rebuild/re-run sequence proving both directions;
the three touched specs verified serially — 27/27 + 70/70 + 42/42).
A tooling find on the way: a combined 3-spec direct run tripped the
P1008 socket-timeout machine-load class (the heavy write legs fail
fast under combined load on this sandbox) — the serial per-file runs
and the 5-chunk cert (one server-boot per chunk) are the load-safe
shapes, exactly why the chunked map exists.

**The S160 fixes:**

- **DI1 — the generate-cards tx deadline (the L-1 close,
  mechanism-corrected).** The card create converts to the INTERACTIVE
  transaction form with `{ timeout: 15_000 }` — bounding the whole
  20-create write at 15 s (the array form carried NO deadline: a hung
  create held the request open until the client's own 120 s abort).
  Both siblings already carried the option; the 201 wire shape is
  unchanged. Machine-guarded by the DI3 census.
- **DI2 — the aiChatSchema user-message refine (the L-2 close).** At
  least one `role: "user"` message is required ("A conversation needs
  at least one message from you.") — the crafted all-assistant API
  payload answers the named 400 at the parse boundary; the client
  always appends a trailing user turn, so no client impact.
- **DI3 — the AI-routes source census (the L-3 + L-1 machine guard;
  tests/ai-routes-census.test.ts, NEW).** Two legs reading the four
  route files: the exact shared `checkRateLimit(\`ai:${user.id}\`, 20)`
  form per route (a forked key/limit fails loudly) and the
  count-equality tx-timeout pairing (every `$transaction(` pairs the
  CE9 option — RED pre-DI1 on generate-cards, GREEN after).
- **DI4 — the updatedAt wire reconciliation (the L-4 close).** The
  messages GET map gains `updatedAt: m.updatedAt.toISOString()` — the
  wire honors the store type (the generic `fetchAndSet` flows the wire
  shape verbatim; the family's factory GETs already return full rows).
  The CA1 leg's assertions extend to the field — the designed e2e
  RED/GREEN pair.
- **DI5 — the CB8 solver/flashcards twin pins (the M-2 close).** The
  chat pin's exact shape on the two unpinned surfaces: mock the send
  as SUCCESS, abort the refresh, assert the honest soft toast and the
  ABSENCE of the false-failure toast. Network-layer mocks — no LLM, no
  budget consumption.
- **DI6 — the generate-cards pre-LLM wire pin (the M-1 close).** On
  one fresh TEST-NET user (probe IP 192.0.2.139, the file's per-IP
  total 4/10, registerGlobal 4/40): the anon 401, the count-bound
  400, and the foreign-deck 404 with the named copy ("That deck does
  not exist.") — the route's auth/validation/ownership boundary pinned
  at the wire for the first time. The honest residual (the LLM-side
  legs) documented in the plan §7/§8 with its reasoning.

**The remediated-tree re-confirmation:** the daemon restart applied the
documented S9/S31 stale-Turbopack remedy (kill, `rm -rf .next/dev`,
restart) → preflight GREEN · the drawer check GREEN (**the 81st
consecutive**) · the desktop parity probe **MATCH** (all five checks,
live reference login).

**Gates.** lint ✓ · tsc ✓ · unit **1622/1622** (49 files, +3 exactly
as designed: validation +1 DI2, ai-routes-census +2 DI3) · build ✓ ·
the 5-chunk cold cert: chunk 1 **154/154** (+2, the DI5 twins — the
chunk's first run of the new legs, first-pass clean) · chunk 2
**189/189** · chunk 3 **92/92** (+1, the DI6 wire pin) · chunk 4
**95/95** · chunk 5 **89/89** — **all five chunks first-pass clean,
zero flakes, the cert tally 619/619** (the e2e census 616 → 619) ·
**census 2241 green** (was 2235). The S128/CC2 re-tag tripwire caught
the one missed count site mid-close (the cert-header pin in
script-conventions updated in the same change — the count-lockstep
doctrine working as designed).

**Evidence.** The `docs/screenshots/160-clone-*.png` frames (the
standing desktop + the mobile drawer [the 81st drawer-GREEN companion]
+ the cycle's Flashcards surface — the AI Generate button's route this
cycle hardened, the capture script asserting its visibility),
self-verifying (ok: true; dimensions machine-checked; md5s distinct;
the non-blank pixel ratios verified: 22.3% / 41.4% / 11.2%), captured
by `scripts/capture-s160-evidence.mjs` (the S159 precedent, node ≥
23.6).

**Docs.** README badge/census (2235 → 2241) + the unit/e2e count
prose sites + the Session-160 row; AGENTS census (1619 → 1622) + the
security-hardening row extension (the DI3 census + the DI1 conversion)
+ the S160 lessons block (three lessons); CLAUDE counts + the
security-hardening contract extension; PAD v1.3.68 (the revision
block); the SKILL census (all four sites) + the green-state + the
chunk-map re-anchor; the vitest header re-anchor (+3); the cert
runner's re-tag (616 → 619, the per-chunk arithmetic);
`docs/session_193.md` (this log); the worklog Session-171 entry; the
plan §9 as-executed close; the `.env.example` contract re-verified (no
env-var reads changed this cycle — .env and .env.example remain
byte-identical at the documented dev posture).

**Next cycle:** the rotation continues — the recorded deferrals: the
A-M3 stage-2 (re-measure only if the hardware or the row cap changes);
the update-side raw-SQL bulk upsert (closed HARDER on the DH0 numbers);
the S159 plan §6 options (the I-2 double copy, the I-3 elision reads —
rejected as measurement-covered / documented trade-off); the I-4
parse-amplification posture (documented, S144/CS5); the M-1 LLM-side
residual (the generate-cards 502/201 legs — documented in the plan
§7/§8, bounded by the unit-pinned parse atoms + the DI5 client-path
coverage).

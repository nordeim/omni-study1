# Remediation Plan — Session 126 / Batch CA (Cycle 76)

**Status: COMPLETE** (executed TDD-style 2026-11-02 — the verification record is §5 below)
**Date:** 2026-11-02 · **Workspace:** fresh clone at `77205a4` (the Batch BZ state `48d8877` + the
operator's `docs/session_122.md` transcript) · **Audit-driven hardening session** — the standing
rhythm (audit the prior-batch diff, rotate two fresh-eyes deep audits, re-certify cold).

---

## 0. Scope and Method

The operator directed the standing rhythm: refresh the workspace (fresh clone → `77205a4`, clean —
`docs/session_122.md` the only new file), re-read the full doc chain (`AGENTS.md`, `CLAUDE.md`,
`README.md`, `PAD`, `omni-study1_SKILL.md`, `docs/session_121.md`,
`docs/remediation-plan-session125.md`, `worklog.md`, `docs/session_122.md` — PAD + the SKILL doc
digested via parallel read-only subagents, AGENTS/CLAUDE/README read directly), re-validate against
the codebase, audit with the repo skills as rubrics (`skills/web-application/SKILL.md` §5/§6/§7/§16
the API surface, §8/§9/§12/§13/§17 the frontend; `skills/` excluded from checking/testing/
compilation), iterate on visual + functional parity with `https://omni-study1.base44.app/` (the
mobile navigation menu the named focus, Tailwind v4 the named suspicion class), keep the repo a
production-ready functional SUPERSET, verify the `.env`/`db/` contract (`DATABASE_URL=
"file:../db/custom.db"` + `db/` at the repo root — `.env` re-created from the current
`.env.example`, dev db re-pushed + re-seeded) and the vitest + playwright suites (both present and
census-anchored), plan remediation for everything found, execute with TDD (RED → GREEN), capture
evidence, update the docs chain, and commit + push to `main` via the SSH wrapper.

Method (the six-phase workflow): ANALYZE → PLAN (this document) → VALIDATE (every M/H finding
re-verified by direct read BEFORE the plan — all findings from both audits verified personally;
the L set spot-verified) → IMPLEMENT (smallest safe diff, TDD) → VERIFY (cold re-cert) → DOCUMENT.

### Baseline (cold, BEFORE any work)

lint ✓ · `tsc --noEmit` ✓ (`noImplicitAny` + `noUnusedLocals`/`noUnusedParameters`) · unit
**1127/1127** (42 files) · the canonical build green (exit 0) · the cold 5-chunk e2e **529/529 —
139+157+71+92+70, every chunk first-pass** (per-chunk in the foreground, the cert script's exact
kill→fresh-db→run procedure) · the register re-derivation **249 importers / 130 Usage-line
carriers / 0 stale / 119 usage-line-free** (the 29th consecutive hold, the expectation stated
BEFORE the measurement — the calibrated instrument: repo script files importing `playwright`
exactly) · the Mode-C audit of the Batch BZ diff (`48d8877`, 37 files, +1509/−185): all substantive
claims re-verified TRUE against the tree (BZ1's `effectiveDeckId` guards + payloads; BZ2's
`timeoutMs` + `isTimeoutError`; BZ3's Popover conversion; BZ4's `removeOneMember`; BZ5's
`write:${user.id}` 600 budget after auth before readJson; BZ6's `gradeCreateSchema.check()` +
`checkGradeRangeMerge` beforeWrite; BZ7's `$transaction` cycle check; BZ8's `FILE_METADATA` move +
link select; BZ9's P2002 → uniform `{ok:true}`; BZ10's `$transaction` + id-tiebroken trim; BZ12's
comment rewrite; BZ13's `take: 500`; BZ14/BZ15/BZ16's dead-code/loader removals; zero key material
in the diff).

### Live parity (both hosts — agent-browser, mobile 390×844)

**Reference** (logged in `sepnetflix2023@outlook.com`): the hamburger UNLABELED (name=null, 36px
at [17,14]) ✓ the standing measurement holds · the drawer: **no `role=dialog`** ✓, panel **288px**
(`lg:hidden fixed left-0 top-0 h-screen w-72 bg-white z-50 shadow-2xl`) ✓, the backdrop
**blur(4px)** on the true layer ✓, exactly **20 nav links** ✓ (the current standing pin — the
reference's own chrome evolution, S123 doctrine) · /Notes horizontal overflow **416 > 390** (the
reference's own defect) ✓ · the landscape (844×390) drawer-nav **scrollHeight 992 > clientHeight
290, overflow-y auto** ✓.

**Clone** (`:3000`, demo session): the labeled hamburger (`aria-label="Open navigation menu"`,
[16,14,36,36] — the a11y superset) ✓ · the drawer `role=dialog` + `aria-label="Navigation menu"`
✓, panel **288px, max-width 331.5px = 85vw** ✓, **20 links** ✓, the true backdrop layer
`bg-black/20 backdrop-blur-xs` computing **blur(4px)** + `oklab(0 0 0 / 0.2)` (the trap-7
serialization) ✓ · nav auto-close ✓ · /Notes **clean** (scrollW 390 = 390 — the reference's own
defect fixed) ✓ · scroll persistence (Dashboard 600px → /Analytics 600px) ✓ · landscape **992 >
301, overflow-y auto** ✓. **No Tailwind v4 mobile-nav bug — the 27th consecutive live
confirmation.** Probe residue zero on both hosts.

### The audits (rotated dual deep — fresh eyes on the BZ-uncovered surfaces)

The rotated pair covered what S121–S125 did NOT deep-cover — **the app shell + routing + design
tokens + auth screens** (layout.tsx, page.tsx, the full globals.css token surface, router.ts, the
mobile-chrome/sidebar/connectivity/nav-items shell family, the login surface's five sub-screens,
theme.ts, the store's boot lifecycle; rubrics §8/§9/§12/§13/§16/§17) and **the persistence +
crypto/auth core + infrastructure configs** (schema.prisma in full, seed.ts, auth.ts end-to-end,
db-path, server/ai.ts, next.config/Dockerfile/compose/eslint/tsconfig/postcss/components/
vitest/playwright configs, health/robots/sitemap, the export + import route INTERNALS; rubrics
§3/§4/§5/§6/§7/§16/§17). FE/shell: **0C/0H/2M/7L/3I**; API/persistence: **0C/0H/2M/6L/5I**. Every
finding verified by direct read before this plan (the M set personally re-read line-by-line; the
AP-130 discipline held — the `ath/solve]` "typo" that re-appeared in this cycle's own Read output
is the known display-pipeline artifact, byte-verified correct in S125/BZ11, untouched).

### §0.1 Verified-clean (the next cycle's coverage map)

globals.css token surface (all ~40 pinned v3 hexes, the 17 `--sf-*` triplets, `--shadow-sm`,
`--radius-sm`, the `.dark &` nesting, the v4-native `@utility` discipline, no space-y/mt children,
forced-colors/reduced-motion/print blocks, skip-link); the z-index five-layer scale; layout.tsx
(`suppressHydrationWarning` scoping, metadataBase, Toaster wiring); page.tsx boot lifecycle (the
cancelled flag, pre-warm non-blocking, 401 full-reload, Splash); store boot/hydration (re-entry
safe popstate bind, try/caught storage, `loadFromUser` validation, the complete 17-var stamp);
router.ts (20 ids/paths/labels consistent, greeting buckets); theme.ts (ACCENT_TOKENS sync, the
boot-script arrays); ConnectivityBanner (`useSyncExternalStore` correct); RumBeacon; Toaster; the
auth screens' label/autoComplete/error-channel contracts, OTP paste distribution, no-enumeration
UX, dark-mode contrast; next.config rewrites ×20 + security headers. Schema: 24 models, the
cascade census, `SetNull` families, the user-scoped RumEvent unique, the SHA-256-hashed reset
tokens; seed idempotency + SEED_DEMO fail-safe + `at()` rollover + the db-path seam; auth.ts
scrypt/HMAC/dummy-hash/limiter (2048-cap bounded map); db-path three-anchor + production gate;
server/ai.ts (the 120s deadline family, late-rejection suppression, content caps); export
internals (20 parallel scoped findManys, hashless select, header neutralization); import internals
(the all-or-nothing 60s transaction, CSRF gate, capped read, version floor+ceiling, topo sort +
cycle rejection, P2003→400); health/robots/sitemap (22 URLs matching the rewrites 1:1); Dockerfile
(the prisma-CLI overlay, .dockerignore, build-time vs serve-time site URL); compose (AUTH_SECRET
hard-fail, healthcheck, named volume); playwright/vitest/tsconfig/postcss (the `*.test.ts` vs
`*.spec.ts` split, strict + unused guards, isolated port + scratch db + 64-hex secret);
.gitignore/.env.example accuracy.

## 1. The verified findings (consolidated, de-duplicated)

**B-M1 · The AI transcript GET serves the OLDEST 500 rows — new exchanges vanish past the cap**
(`src/app/api/ai/messages/route.ts:13-17`, Verified). `orderBy: { createdAt: "asc" }, take: 500`
selects the oldest window, not the newest. Nothing trims `aiChatMessage` (both POSTs — chat +
math/solve — write 2 rows per send with no retention trim, unlike calculator history's BW5/BZ10),
so the table grows unboundedly; once an account crosses 500 rows, every post-send
`refreshAiMessages()` REPLACES the store with the stale oldest window — the just-sent question and
reply never appear (rows persist, export fine, UI loses them). The sibling calculator route does
it correctly (`desc` + `take` + `.reverse()`). **Fix: the calculator form on the GET (desc + take
500 + reverse + the id tiebreak) + a shared `persistTranscriptPair` helper in `src/lib/server/ai.ts`
owning the pair write (explicit `createdAt` with the assistant row +1 ms — the same-millisecond
pair-order class) + the retention trim (the calculator mirror, newest-500) for BOTH write sites.**

**B-M2 · The import route's inline validator dropped the seam's empty-id guard; the seam validator
is dead production code and has drifted** (`src/app/api/import/data/route.ts:227` vs
`src/lib/data-import.ts:292-293`, Verified). The route checks only `typeof id !== "string"` — an
`id: ""` row imports and mints a row with an empty-string primary key that no `/api/[collection]/
[id]` route can address (uneditable/undeletable via the API). The seam (`parseImportEnvelope`)
rejects empty ids and is pinned by the unit suite — but has ZERO production callers (grep: tests
only): the unit pins give false assurance while the live path accepts it. Other drift: a `null`
collection is skipped by the route but rejected by the seam. The exact twin-implementation hazard
the repo eliminated for FK maps in S122/BW8. **Fix: export a shared row-id validator from the
seam (`importRowIdError`); the route's loop + the seam's `finish()` both call it; the route's
null-collection leg merges into the array check (null → 400, the seam's contract). The seam keeps
its role as the unit-pinned envelope contract with the derivation comment.**

**A-M1 · The mobile app bar and the offline pill print on paper** (`mobile-chrome.tsx:121`,
`connectivity-banner.tsx:48`, `globals.css:991-994`, Verified). The print stylesheet hides chrome
via `aside { display: none }` only; the mobile app bar is a `<header class="... lg:hidden">` — at
portrait paper width (~816px < 1024px) the `lg:` media query stops applying, so the fixed header
(hamburger, brand, the live clock) prints on every page; the fixed offline pill has no print guard
either. The e2e print family runs at desktop viewports where `lg:hidden` still applies — the
structural blind spot. **Fix: `print:hidden` on both fixed chrome elements.**

**A-M2 · Auth sub-screen swaps drop focus with no announcement** (`login-surface.tsx:224-236`,
`335-357`, Verified). All five sub-screens swap by conditional render on `view`; every transition
is triggered from a button that unmounts in the swap, so focus falls to `<body>` and nothing
announces the context change (no heading focus, no live region — WCAG 2.4.3/4.1.3; the only
`focus()` calls are the OTP-box helpers, and nothing autofocuses on any view mount). **Fix: a
single heading ref + `tabIndex={-1}` on the five headings; an effect on `[view]` focuses the
incoming heading, skipping the initial mount.**

**B-L1 · `createdAt`-only ordering with no id tiebreak — the exact class BZ10 fixed in calculator
history** (`ai/messages:15`, `entities.ts:270`, `export/data:55-78`, the chat/solve pair writes,
Verified). Same-millisecond rows order nondeterministically in SQLite; the chat/solve POSTs write
the user+assistant pair inside ONE `$transaction` (two sub-millisecond inserts sharing a
millisecond is the common case), and the seed's `Promise.all` families (subjects, taskLists,
notebooks, decks) all tie. **Fix: the id tiebreak everywhere `createdAt` orders rows (the BZ10
form) + explicit pair `createdAt` at the write sites (CA1) + explicit deck `createdAt` in the seed
(CA6). The export findManys gain the tiebreak for round-trip order determinism.**

**B-L2 · The seed puts biology cards in the math deck and Spanish cards in the biology deck**
(`prisma/seed.ts:165-179`, Verified). "ATP", "Enzyme function", "Krebs cycle" (cell-biology cards)
are assigned to `decks[0]` = "Integration rules" (the calculus deck); "the airport"/"el
aeropuerto", "to travel"/"viajar" to `decks[1]` = "Biology Chapter 5"; the Spanish deck gets zero
cards. The indices were authored `[0,0,0,0,1,1]` where the content implies `[0,1,1,1,2,2]`.
**Fix: re-map the card defs; the three decks gain explicit distinct `createdAt` values so
`decks[0]` is deterministic ("Integration rules", 1 card) — the S125 lesson-3 flake class killed
at the root. Spec-safety verified: every deck pin references decks BY NAME (hasText filters) and
"Chain rule" (the studied card) stays in decks[0]; zero specs reference the moving cards.**

**B-L3 · Import accepts domain-invalid values — the third entry point escapes the route guards**
(`data-import.ts:400-419`, Verified). `sanitizeImportRow` checks primitive types + string caps +
the files rules, but no domain constraints: `grades {score:-50, maxScore:0}` imports cleanly (0
maxScore → NaN/Infinity in the Grade Tracker's division), `progress: 500`, `dayOfWeek: 99`,
out-of-vocabulary enum strings (break the badge/color meta maps), and non-JSON strings in the
JSON-string columns (throw in the client `JSON.parse`). **Fix: extend the guard with the cheap
time-independent invariants: the grades pair (`score ≥ 0`, `maxScore > 0`, `score ≤ maxScore`
with the create-schema's `maxScore ?? 100` default semantics), `progress` 0..100, `dayOfWeek`
0..6, the enum vocabularies (assignments.type/priority, cards.difficulty, chatMessages.role/
surface), and `JSON.parse`-ability for the JSON-string columns (subtasks, topics, members, tags,
reminders, questions).**

**A-L1 · `formatShortWithYear` name contradicts its output** (`src/lib/date.ts:140-142`,
Verified — renders "Tue, Oct 6", no year; 3 consumers + 1 test). **Fix: rename
`formatShortDate`.**

**A-L2 · Duplicate 1-second clocks re-render both chrome trees for a minute-resolution display**
(`sidebar.tsx:29-36`, `mobile-chrome.tsx:32-39`, Verified). Two byte-identical `useNow` hooks tick
every 1000ms while `formatTime12h` renders only HH:MM — both mounted chrome trees (2 × 20 nav
links + avatar) reconcile ~60×/min for nothing. **Fix: one shared `useNow` hook (a `src/lib/`
seam) that ticks every second but only commits state when the rendered minute changes — the
display stays live-correct, the trees stop re-rendering.**

**A-L3 · Nav links swallow modified clicks** (`nav-items.tsx:91-95`, Verified — unconditional
`preventDefault` on real hrefs; ⌘/Ctrl/Shift-click cannot open a view in a new tab). **Fix: the
modified-click early return before `preventDefault()`.**

**A-L4 · Input placeholder contrast fails AA (≈2.5:1) — and carries the only password-policy
hint** (`input.tsx:18` + `globals.css:292`, Verified — `text-muted-foreground` ≈ #9ca3af on white;
the reference-measured palette, but the repo's own doctrine upgrades reference colors that fail
AA). **Fix: `placeholder:text-gray-500` (#6b7280, 4.83:1) on the shared Input — single-site fix,
app-wide benefit; no spec pins the placeholder color (verified).**

**A-L5 · The disabled Google button's `title` can never display** (`login-surface.tsx:271-280` +
`button.tsx:14`, Verified — `disabled:pointer-events-none` means no hover; disabled buttons are
not focusable). **Fix: persistent small helper text under the button.**

**A-L6 · `resend` has no in-flight guard** (`login-surface.tsx:155-166, 501-503`, Verified —
checks `busy` but never sets it; the button has no `disabled` binding; rapid clicks fire duplicate
POSTs against the 10/IP limiter). **Fix: a `resending` state + `disabled={busy || resending}`.**

**A-L7 · Reset screen with a missing token is a permanently-disabled dead end; a consumed token
lingers in the URL** (`login-surface.tsx:49-51, 196-199, 630`, Verified). `view` initializes to
"reset" on `?view=reset` even without a token; the submit button is disabled with no explanation;
after a successful reset the consumed token stays in the URL (a refresh re-lands the user on the
reset screen). **Fix: an InlineError when `view==="reset" && !token`; on success
`history.replaceState` to `/login` alongside the signin swap.**

**B-L4 · docker-compose.yml comment misstates SEED_DEMO semantics** (`docker-compose.yml:56-60`
vs `env-check.ts:110-118` + DEPLOYMENT.md:41, Verified — the code seeds only on unset/empty/1/
true, unrecognized values SKIP; the comment claims the opposite). **Fix: correct the comment.**

**B-L5 · compose provides no build-args hook for the build-time `NEXT_PUBLIC_SITE_URL` bake**
(`docker-compose.yml:13-15, 23-27` + `Dockerfile:47-49`, Verified — the comment itself says to
bake via the build ARG, but no `args:` block exists). **Fix: `args: { NEXT_PUBLIC_SITE_URL:
"${NEXT_PUBLIC_SITE_URL:-http://localhost:3000}" }` on both services' build blocks.**

**B-L6 · eslint disables rule families the docs cite as lint gates** (`eslint.config.mjs:12-25`
vs `CLAUDE.md:36`, Verified — `no-unused-vars`/`exhaustive-deps`/`purity`/`react-compiler` off;
unused imports are actually gated by tsc's `noUnusedLocals` at typecheck). **Fix: amend CLAUDE.md
to attribute the unused-import gate to typecheck and document the eslint posture honestly
(re-enabling the families would open a repo-wide lint debt the audit did not size — deferred with
the rationale recorded).**

**B-I1 · Modulo bias in OTP generation** (`auth.ts:197-201`, Verified — `getUint32 % 1_000_000`;
negligible under the attempt caps, but rejection-quality sampling is free). **Fix:
`randomInt(0, 1_000_000)`.**

**B-I2 · Schema comment drift: `Assignment.type` vocabulary omits "worksheet"**
(`schema.prisma:162` vs `validation.ts:235` + `seed.ts:101`, Verified). **Fix: the comment.**

**B-I3 · RumEvent carries a redundant `@@index([userId])`** (`schema.prisma:445-446`, Verified —
the user-scoped unique's leftmost column already serves `userId`-prefixed lookups; pure write
amplification on the hottest table). **Fix: drop the index (a `db push` change, no data loss).**

**B-I4 · Docker init-profile upgrade hazard undocumented** (compose init profile re-runs
`db push --accept-data-loss` against the production volume after image upgrades, the documented
no-migrations posture — the data-loss consequence spelled out nowhere). **Fix: a DEPLOYMENT.md
note.**

**B-I5 · Export assembles the full envelope in memory** (the route documents itself as the
heaviest enumeration; bounded by the export/import/write budgets — accepted, already documented).
**ACCEPTED — no fix.**

**A-I1 · Stale comment calls the plain `@theme` block "@theme inline"** (`globals.css:256` vs
`:37`; the same nomenclature drift in PAD Pattern D + ADR-004/ADR-008 — the shipped directive is
plain `@theme`, never `@theme inline` per git history). **Fix: reword the comment + the PAD
nomenclature to the shipped form.**

**A-I2 · Dead default export on LoginSurface** (`login-surface.tsx:650`, Verified — both routes
import the named export). **Fix: delete.**

**A-I3 · `dangerouslySetInnerHTML` in the root layout vs the letter of the §16 checklist**
(`layout.tsx:26` — the compile-time `THEME_BOOT_SCRIPT` constant, no user input, the standard
pre-paint pattern). **ACCEPTED — documented as the sanctioned exception in the SKILL doc's theme
section.**

**Doc-drift set (CA23, from the PAD + SKILL digest subagents — every item verified against the
tree):** PAD §8.1's Total row (1657/530 → 1656/529 — the setup double-counted); §12's three stale
line counts (entities 582, http 362, validation 562); §3.3 Pattern A/B excerpts are not the
shipped code (the real `viewFromPath` resolves first-segment via `NAV_ITEMS`, no query/slash
handling; no `owned()`/`taskPatchSchema` symbols exist — the real update path is findFirst →
NotFoundError → sentKeysPatch); Pattern C + ADR-002 missing the BY2 production gate
(`nodeEnv !== "production"`); §3.2's "9 parity-session specs" (really 5: session5–9) +
greeting-clock unlisted + the ui/ and §5.3 primitive lists under-count (21 files, 18 radix deps)
+ worklog.md misplaced under docs/; §5.2's card border hex (#e2e8f0, not #f1f5f9) + the accent
ids (green/orange, not emerald/amber); §5.1's stat-value class (text-3xl); ADR-016/017/018's RUM
window/recent counts predate the shipped 500/50; §11's avatarEmoji impact pre-dates BY9; the
v1.3.32 revision block retro-edited to S125 numbers. SKILL: the card border hex (§4 + §19); the
AccentToken sketch missing 3 fields (17 total — `gradientToStrong`, `clockDateDark`, `empty`);
§7's factory pipeline missing the BZ5 write-budget step; the delegate inventory absent (16
delegates, `OWNED_FKS` 10); the BZ-era symbols unreferenced (`effectiveDeckId`, 
`removeOneMember`, `checkGradeRangeMerge`, `FILE_METADATA`) + the CA-era additions at their
natural homes + the A-I3 sanctioned-exception note.

## 2. The CA set (TDD — RED first, then the source)

Pin homes: unit — `tests/data-import.test.ts` (CA2's shared-validator contract + CA14's domain
caps; the existing seam pins keep holding — the messages unchanged). e2e —
`parity-session8.spec.ts` (CA4 focus + CA9 helper text, file-end), `navigation.spec.ts` (CA7
modified-click, file-end), `s14-hardening.spec.ts` (CA1 + CA5 windows + CA2 empty-id/null — fresh
TEST-NET users, the BZ5 lesson: the demo user is never mutated; CA8 placeholder, file-end),
`accessibility.spec.ts` (CA3 mobile print, the print family's home), `auth-flows.spec.ts` (CA11
missing-token, file-end).

- **CA1 (M)** the AI transcript window: the GET mirrors the calculator form (`desc` + `take:
  500` + `.reverse()` + the id tiebreak); `persistTranscriptPair` in `src/lib/server/ai.ts`
  owns both write sites (the pair with explicit `createdAt`, assistant +1 ms; the retention
  trim, the calculator mirror). e2e RED: a fresh TEST-NET user imports 505 chatMessages with
  strictly-increasing createdAt → GET `/api/ai/messages` → exactly 500 rows, the NEWEST window
  (row[0] = import row 5; rows 0-4 absent).
- **CA2 (M)** the import id-guard: `importRowIdError` exported from the seam; the route's loop
  + the seam's `finish()` call it; the route's null-collection leg merges into the array check
  (null → 400). e2e RED: `id: ""` row → 400; `"tasks": null` → 400 (pre-fix: 200, the row
  mints an empty-PK row / the null silently skips).
- **CA3 (M)** `print:hidden` on the mobile app bar + the connectivity pill. e2e RED: at
  390×844 `emulateMedia({ media: "print" })` → the header and the pill are hidden (pre-fix:
  the fixed header renders at paper width).
- **CA4 (M)** the auth view-transition focus: one heading ref + `tabIndex={-1}` ×5 + the
  skip-initial-mount effect. e2e RED: /login → "Need an account? Sign up" → the signup h2 is
  `document.activeElement`; → "Forgot password?" → the forgot h2 (pre-fix: `activeElement` is
  `body`).
- **CA5 (L)** the factory list window: `desc` + `take: 500` + reverse-to-asc + the id
  tiebreak (all 16 delegates ride the default asc — verified; the export findManys gain the
  tiebreak for order determinism; the calculator GET gains the tiebreak rider). e2e RED: the
  fresh user's import carries 505 tasks → GET `/api/tasks` → 500, the newest window.
- **CA6 (L)** the seed: card defs re-mapped `[0,1,1,1,2,2]` + explicit distinct deck
  `createdAt` (Integration → Biology → Spanish, deterministic; decks[0] = "Integration rules"
  with its 1 card). Code-verified + the existing flashcards pins re-hold (every pin is
  name-based; "Chain rule" stays in decks[0]).
- **CA7 (L)** the nav modified-click early return (`metaKey || ctrlKey || shiftKey || altKey
  || button !== 0`). e2e RED: a ctrl-key click dispatch on a nav link does NOT navigate
  (pre-fix: the SPA nav fires).
- **CA8 (L)** `placeholder:text-gray-500` on the shared Input. e2e RED: the /login email
  placeholder computes `rgb(107, 114, 128)` (pre-fix: `rgb(156, 163, 175)`).
- **CA9 (L)** the Google button's helper text (`<p class="text-xs text-slate-500">` under the
  button). e2e RED: the text is visible on /login (pre-fix: only the unreachable `title`).
- **CA10 (L)** the resend in-flight guard (`resending` state + `disabled`). Code-verified
  (timing-bound behavior; the uniform-200 endpoint's contract unchanged).
- **CA11 (L)** the reset missing-token InlineError + the success URL cleanup
  (`replaceState` → `/login`). e2e RED: `/login?view=reset` renders the missing-token
  message (pre-fix: a bare disabled submit, no explanation).
- **CA12 (L)** `formatShortWithYear` → `formatShortDate` (3 consumers + the pin renamed).
  Code-verified (tsc + the renamed unit pin).
- **CA13 (L)** the shared `useNow` hook (commits only on minute changes; both chrome
  components consume it). Code-verified (the greeting-clock + shell pins keep holding — the
  rendered values are identical).
- **CA14 (L)** the import domain caps in `sanitizeImportRow` (§1's B-L3 list). Unit RED: the
  grades pair (inverted, negative score, zero maxScore, the bare-over-default leg), progress
  500, dayOfWeek 99, a bogus priority, a non-JSON `subtasks` string — each rejects; the legal
  rows pass.
- **CA15 (L)** compose: the SEED_DEMO comment + the `NEXT_PUBLIC_SITE_URL` build args on both
  services. Code-verified.
- **CA16 (L)** CLAUDE.md: the unused-import gate attributed to typecheck; the eslint posture
  documented. Code-verified.
- **CA17 (I)** `generateVerificationCode` → `randomInt(0, 1_000_000)`. Code-verified (the
  shape/length contract unchanged; the OTP e2e family re-holds).
- **CA18 (I)** the schema comment gains "worksheet". Code-verified.
- **CA19 (I)** `@@index([userId])` dropped from RumEvent. Code-verified (the user-scoped
  unique serves the prefix; `db push` re-run for the dev db; the e2e global setup re-pushes
  its own db).
- **CA20 (I)** DEPLOYMENT.md: the init-profile upgrade-path note. Code-verified.
- **CA21 (I)** the globals.css `@theme inline` comment → the shipped plain-`@theme` wording.
  Code-verified.
- **CA22 (I)** the dead `export default LoginSurface` removed (zero consumers — grep-verified).
  Code-verified.
- **CA23** the docs chain (§4 below) — every §1 doc-drift item, the census re-tags (measured
  at the docs phase, never estimated), the S126 lessons, the CA contract entries in AGENTS.md,
  the evidence frames (126-*.png), the session record (`docs/session_123.md`), and the worklog
  entry.

Rejected/deferred (documented): the PATCH/DELETE write-budget legs (BZ5's documented
next-cycle candidate — deferred again: an unmeasured shared-key budget is the exact BZ5
lesson-2 hazard; it needs a measured chunk-volume census first); eslint rule re-enablement
(B-L6 — the docs are amended instead; the debt is recorded, not silently shipped); export
streaming (B-I5 — the accepted completeness/perf trade-off, already documented); A-I3 (the
sanctioned theme-boot exception, documented in the SKILL doc); the taskLists/notebooks seed
ties (benign — the deck family was the only order-pinned one).

## 3. Verification checklist (the cold re-cert)

1. Unit: the full census, every new pin RED-before/GREEN-after, zero skipped.
2. lint + `tsc --noEmit` clean (`noUnusedLocals` catches any CA12/CA22 leftover).
3. The canonical build green (the type gate).
4. Cold 5-chunk e2e: the re-measured map (142+161+71+93+71 = 538 expected — chunk 1 +3
   [CA4 focus, CA7 modified-click, CA9 helper text]; chunk 2 +4 [CA1 window, CA5 factory
   window, CA2 empty-id/null, CA8 placeholder]; chunk 4 +1 [CA3 print]; chunk 5 +1 [CA11
   missing-token]; measured at the RED phase, re-tagged if the count differs), every chunk
   first-pass, per-chunk in the foreground with the cert script's kill→fresh-db procedure.
5. The register tripwire: 249/130/0/119 (the pins ride existing spec files — no new scripts).
6. Live curl battery on :3000: the messages window (import-probe on a scratch account or the
   fresh-user e2e shape), the import empty-id 400, the placeholder/`print:hidden` classes via
   agent-browser.
7. Live agent-browser: the mobile drawer battery re-run (the standing measurements hold), the
   CA3 print emulation, the CA4 focus walkthrough, the CA9 helper text.
8. Evidence frames captured + programmatically verified non-blank.

## 4. Documentation chain (the same-commit updates)

AGENTS.md (the commands-table census, the S126 lessons — the asc+take oldest-window trap, the
twin-validator derivation doctrine extended, the seed-tie root fix, the print-guard class; the
conventions: the newest-window read, the shared row-id validator) · CLAUDE.md (the census lines
+ the lint-attribution fix) · README.md (the badge + the testing rows + the Session-126 status
row) · `vitest.config.ts` header · the cert script's Expected re-tag + the CA block · PAD
(v1.3.34: §8.1's Total, §12's line counts, §3.3's Pattern A/B/C excerpts, §3.2's parity-count +
ui/ lists + worklog placement, §5.1/§5.2's class/hex/accent fixes, §5.3's radix list,
ADR-002/004/008/016/017/018 reconciliations, §11's avatarEmoji, the v1.3.32 retro-edit repair,
the revision block) · the SKILL doc (the five drift items + the census header + the BZ/CA-era
symbol references + the A-I3 note + AP-134 if a new antipattern class emerges) · this plan's
§5 · the session record `docs/session_123.md` · `worklog.md` (the Session-126 entry).

## 5. Execution record (2026-11-02)

- **RED phase:** unit +18 pins in data-import.test.ts (CA2's shared-validator contract ×5 —
  4 RED on the missing export, 1 the seam's existing contract, green by design; CA14's
  domain caps ×13 — 11 RED on the absent caps, the 2 legal-accept legs green by design) and
  +9 e2e pins (CA1 the messages window, CA5 the factory window, CA2 the empty-id/null pair,
  CA3 the mobile print, CA4 the auth focus, CA7 the modified-click, CA9 the helper text,
  CA11 the missing token — every RED verified for the RIGHT reason; CA8 the placeholder AA
  guard GREEN BY DESIGN — see the honesty ledger). Two pin-side corrections to reach the
  right reasons: the CA5 task rows' `done` → `completed` field name (the Task model's
  column), and navigation.spec's missing `hydrated` helper → the inline appHydrated marker
  wait.
- **GREEN phase:** CA1-CA22 landed in the smallest safe diffs; the interim gates (lint, tsc,
  the touched-file unit runs) green after each item; tsc's structural-model widening (the
  orderBy array form) caught at the first typecheck.
- **Corrections during execution (the honesty ledger):**
  1. **CA8/A-L4 HONESTLY RESOLVED AS A COMMENT FIX — the visual change retracted.** The
     audit's "2.5:1 placeholder" claim was a conversion error: hsl(220 9% 46%) COMPUTES to
     rgb(107,114,128) = gray-500 = 4.82:1, already AA-compliant; the auditor (like 100+
     sessions of readers) trusted the Input's own stale "gray-400 placeholders" comment
     (gray-400 is L≈65%). The class change shipped as NO-OP-avoidance: the real defect was
     the misleading comment (fixed, with the honest arithmetic); the e2e pin stays as a
     GREEN regression guard locking the compliant computed value.
  2. **The CA5 pin's task field name** (`done` → `completed` — the model's column; the first
     import 400'd through the PrismaClientValidationError mapping, the route's own 400
     contract working).
  3. **The CA3 pin's pill wait** — `waitForSelector` defaults to the VISIBLE state, but the
     pill under print emulation is hidden BY THE FIX; the wait moved to `state: "attached"`
     (the pill renders, the print guard hides it — the assertion keeps its meaning).
  4. **The CA6 seed re-mapping broke SIX study pins across TWO chunk runs** — the pins had
     encoded the MISLABELED seed state ("1 / 4" counters on a calculus deck carrying
     biology cards). The re-anchor rule: pin the SHAPE at the remediated honest values
     (Integration 1 / Biology 3 / Spanish 2) with the CA note in each pin; grep the fleet
     for the old values before re-running (found: mobile-navigation S79 + parity-session7's
     AD11/AE4/AF1/S80; the first chunk-1 run's tail-2 output had masked one failure).
  5. **The README blanket census replace corrupted historical rows** (the Session-125 row's
     baseline/GREEN/re-cert numbers + the Session-124 row's chunk map): blanket
     `s.replace` over a history-bearing table is the wrong instrument — the repair restored
     every historical value and the lesson is recorded (census re-tags are per-line
     surgical edits; the diff review caught all three corruptions before commit).
- **Cold re-cert (the FINAL tree):** lint ✓ · tsc ✓ · unit **1145/1145** (42 files —
  data-import 32 → 50) · the canonical build green · the cold 5-chunk e2e **538/538 —
  142+161+71+93+71, every chunk first-pass** (chunk 1 re-run after the S79 re-anchor;
  chunk 2 re-run after the four parity-session7 re-anchors) · the register tripwire
  **249/130/0/119** (the 30th consecutive hold) · the live battery on the fresh S32 daemon
  (the mobile drawer re-run GREEN — the 28th consecutive no-Tailwind-v4-bug confirmation;
  the CA4 focus walkthrough signin→signup→signin→forgot; the CA9 helper text; the CA11
  missing-token message; the CA8 computed placeholder; the CA6 deterministic deck order +
  auto-selected "Integration rules") · the six `docs/screenshots/126-*.png` evidence frames
  (non-blank-verified programmatically) · `.env`/`db/` contract verified current (the dev db
  re-pushed for the CA19 index drop + re-seeded for the CA6 remediated fixtures).
- **Docs:** §4 completed in the same commit (README badge 1683 + the Session-126 row;
  AGENTS commands 1145/538 + the S126 lessons ×4; CLAUDE census + the lint attribution;
  the vitest header 1145; the cert-script Expected re-tag; PAD v1.3.34 — the §8.1 Total
  repair + the per-file rows + §12's line counts + §3.3's Patterns A-D + §3.2's tree +
  §5.1/§5.2/§5.3's tokens + ADR-002/004/016/017/018 + §11 + the v1.3.32 retro-edit repair;
  the SKILL doc's five drift items + the census + the BZ/CA seam references + the A-I3
  note; DEPLOYMENT.md's upgrade caution; docker-compose's comment + build args; this §5;
  the session record; the worklog entry).

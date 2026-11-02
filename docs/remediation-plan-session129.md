# Remediation Plan — Session 129 / Batch CD (Cycle 79)

**Status: COMPLETE** (executed TDD-style 2026-11-02 — the verification record is §5 below)
**Date:** 2026-11-02 · **Workspace:** the Batch CC state `37468e3` + the operator's `c341120`
(`docs/session_128.md`, the CC record) — the workspace survived the session break (`.env`, `db/`,
chromium-1243, and agent-browser all intact; the push infrastructure rebuilt before the push).
**Audit-driven hardening session** — the standing rhythm (audit the prior-batch diff, rotate two
fresh-eyes deep audits, re-certify cold).

---

## 0. Scope and Method

The operator directed the standing rhythm (the same charter as s125–s128): refresh the workspace,
re-read the doc chain (`AGENTS.md`, `CLAUDE.md`, `README.md`, `PAD`, `omni-study1_SKILL.md`,
`docs/session_127.md`, `docs/remediation-plan-session128.md`, `worklog.md`, `docs/session_128.md`),
re-validate against the codebase, audit with the repo skills as rubrics (`skills/` excluded from
checking/testing/compilation), iterate on visual + functional parity with
`https://omni-study1.base44.app/` (the mobile navigation menu the named focus, Tailwind v4 the
named suspicion class), keep the repo a production-ready functional SUPERSET with visual parity,
keep the `.env`/`db/` contract (`DATABASE_URL="file:../db/custom.db"`, `db/` at the repo root,
`.env.example` tracked + current), maintain the vitest + playwright suites, plan remediation for
everything found, execute with TDD (RED → GREEN), capture evidence under `docs/screenshots/`,
update the docs chain, and commit + push to `main` via the SSH wrapper.

Method (the six-phase workflow): ANALYZE → PLAN (this document) → VALIDATE (every M finding
re-verified by direct read BEFORE the plan, plus the live reference measurement that adjudicated
CD1's parity question; the L set spot-verified) → IMPLEMENT (smallest safe diff, TDD) → VERIFY
(cold re-cert) → DOCUMENT.

### Baseline (cold, BEFORE any work)

lint ✓ · `tsc --noEmit` ✓ · unit **1191/1191** (44 files) · the canonical build green (exit 0,
REAL_EXIT, foreground — the S128 re-learned lesson applied) · the cold 5-chunk e2e **560/560 —
144+177+72+93+74, every chunk first-pass** (per-chunk via `scripts/run-cert-chunk.sh`) · the
register re-derivation **249 importers / 130 Usage-line carriers / 0 stale / 119 usage-line-free**
(the 35th consecutive hold, the expectation stated BEFORE the measurement, the instrument
identical to `tests/script-conventions.test.ts`'s calibrated regex) · the Mode-C audit of the
Batch CC diff (`37468e3`, 37 files, +1367/−132): **all 13 CC claims re-verified TRUE against the
tree** (CC1's whitelist iterating `PROFILE_PATCH_KEYS`; CC2's rc accumulation + `exit "$rc"` +
the Expected-560 re-tag; CC5's eviction-on-settle; CC6's NaN guard; CC7's `timeoutMs` + the 20 s
gate deadline; CC8's module-counter + 5-cap + timer outside `set`; CC9's removals — `RowOf`, the
store trio, `minutesToHHMM` all gone; CC10's 19 composite-index swaps in the diff; CC11's
per-key count map; CC12's seed/global-setup docs; zero key material in the diff).

### Live parity (both hosts — agent-browser, mobile 390×844)

**Reference** (logged in `sepnetflix2023@outlook.com`): the standing battery held — the hamburger
UNLABELED (name=null, 36px at [17,14], no `aria-haspopup`) · the drawer **no `role=dialog`**,
panel **288px** (`w-72`), the true-layer backdrop **blur(4px)**, exactly **20 nav links** · the
landscape drawer-nav **scrollHeight 992 > clientHeight 290, overflow-y auto** (maxScroll 702).
**Plus this cycle's NEW reference-specific probe (the CD1 parity measurement):** the reference's
dialog overlay + content **both compute `animation-name: enter`, `animation-duration: 0.15s`**
(the tailwindcss-animate family, verified present in its stylesheets: `.animate-in { animation:
enter 0.15s }`, `.fade-in-0`, `.zoom-in-95`), the overlay carrying
`data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:animate-out
data-[state=closed]:fade-out-0` and the content the full shadcn family — **the reference's Radix
overlays animate; the clone's were instant** (the audit's M2, measured live on both hosts).

**Clone** (`:3000`, demo session on a FRESH reseed — kill-by-PID + `rm db/custom.db` + push +
seed, the S32 daemon recipe, preflight GREEN): the full standing battery GREEN — the labeled
hamburger **"Open navigation menu"** (36×36 at [16,14], the a11y superset), **`role=dialog` +
"Navigation menu"**, **288px** panel, **20 links**, the true-layer backdrop **blur(4px) +
oklab(0 0 0 / 0.2)**, nav auto-close (Notes click → drawer closed, `/Notes`), /Notes clean
(**390 = 390**), scroll persistence **600 → 600** (the drawer cycle), landscape **992 > 301,
scrolls** — **no Tailwind v4 mobile-nav bug, the 33rd consecutive live confirmation**.

### The audits (two parallel, ROTATED fresh-eyes — findings only, then direct-read verification)

The CC cycle deep-covered the client state/transport/lib layer + UI primitives and the test layer
+ schema/seed; the CA cycle (three back) covered the shell and the persistence/infra families.
This cycle's fresh eyes went to the two least-recently-covered axes:

- **Audit A — the app shell + routing + design tokens + auth screens** (last deep-covered CA,
  three cycles ago; CC7/CC8 just touched page.tsx/toast): `layout.tsx`, `page.tsx`, the full
  `globals.css` token surface, `router.ts`, `theme.ts`, `site.ts`, the mobile-chrome/sidebar/
  connectivity/nav-items/rum-beacon/user-avatar shell family, the login surface's five
  sub-screens (688 lines), `lib/auth.ts`, the route wrappers. **0C/0H/2M/6L/6I.**
- **Audit B — the persistence + crypto/auth core + infrastructure configs** (also last covered
  CA): `schema.prisma` in full, `seed.ts`, `db.ts`/`db-path.ts`, `server/auth.ts`, `env-check.ts`,
  `server/ai.ts`, `instrumentation.ts`, `next.config.ts`, eslint/tsconfig/postcss/components/
  vitest/playwright configs, `Dockerfile`/`docker-compose.yml`, health/robots/sitemap, the
  export + import route internals, the rate-limiter census, `package.json`, `.env.example`.
  **0C/0H/0M/4L/4I** — every prior-cycle fix (CC1/CC2/CC10/CC12/BT5/BZ5/CB7/CB12/BY5) verified
  HOLDING at the line level; the one place the code diverged from the standing brief (PATCH/DELETE
  throttling) it was *ahead* (CB7 had landed it — the brief and AGENTS.md were the stale side).

Per Mode-C discipline every M finding was re-verified by direct read (§1 marks each Verified),
the L set spot-verified, and the CD1 parity question was settled by LIVE MEASUREMENT on both
hosts, not assumption.

---

## 1. The verified findings (consolidated, de-duplicated)

**[CD1 · M · Verified + live-measured]** The Radix overlay animation family is declared but
never wired — every `animate-in`/`animate-out` class in the repo is inert, and the reference's
overlays animate. `package.json` declares BOTH `tw-animate-css` (^1.3.5, the v4 port) AND
`tailwindcss-animate` (^1.0.7, the v3 plugin — dead weight under v4); the PAD's own design-system
table documents the pair as "Radix enter/exit transitions" (PAD §design-system row). But
`globals.css`'s only import is `@import "tailwindcss";` — no `tw-animate-css` import, no
`@utility` defining the family — and Tailwind v4 silently drops unknown utilities. Consumers:
`dialog.tsx` (content), `alert-dialog.tsx` (content), `dropdown-menu.tsx` (×3), `select.tsx`,
`notes-view.tsx:594` (the BZ3 popover) — all inert; every dialog/dropdown/select opens and closes
instantly. **Measured live on the reference (the parity authority): the overlay and content both
run `animation-name: enter, animation-duration: 0.15s`** (the tailwindcss-animate default; the
reference's `duration-200` class feeds only an inert 0.2s `transition-duration` —
`transition-property: all` with nothing transitioning on a mounted dialog). The clone's
`-translate-x-1/2 -translate-y-1/2` was verified to emit the standalone `translate` CSS property
(`translate: -50% -50%`, NOT `transform`), so the `enter` keyframes' `transform` COMPOSES with
the centering — the v4-native classes need no `slide-in-from-*` baking. The clone's
`DialogOverlay`/`AlertDialogOverlay` additionally carry NO animation classes at all (the
reference's overlay fades in AND out: `fade-in-0` + `fade-out-0`). A real visual parity gap in
the overlay family — invisible to every existing pin (none asserts animation, and exit animations
kept nodes mounted was never exercised because nothing animated).

**[CD2 · M · Verified]** The boot gate's pre-warm has no deadline — one stalled collection GET
holds the Splash forever. CC7 gave `/api/auth/me` a 20 s deadline, but the gate also
`await prewarm`s `loadCollections(INITIAL_COLLECTIONS[activeView])`, and `fetchAndSet`
(`data.ts:329-335`) calls `apiGet(PATHS[key])` with NO timeout — a stalled connection (accepted
TCP, no response; no `offline` event fires) never settles, `.catch(() => {})` never fires (it is
a non-rejection), and `setStatus("ready")` never runs: the Splash pulses indefinitely with the
retry affordance unreachable (`onRetry` renders only on `status === "error"`). Violates the
file's own header contract ("a failed pre-warm never blocks the shell") for the stall case. The
view-side `loadCollections` callers (calculator/flashcards/notes) and the post-boot `loadAll`
ride the same unbounded fetch.

**[CD3 · L-promoted · Verified]** `react-hooks/exhaustive-deps` is disabled (the initial
scaffold's wholesale disable list, `eslint.config.mjs` — unchanged since commit `01cb829`), and
the probe run found **6 live violations** — the classic stale-closure class: (1)
`rum-panel.tsx:89` — the interval effect calls `refresh()` but deps say `[load]`;
(2) `calculator-view.tsx:127` — the cleanup reads `historyToggleRef.current` (the ref-changed-
by-then hazard); (3)+(4) `files-view.tsx:214,235` — `toast` missing (the `useToast()` object —
verified STABLE: `React.useMemo` over the store's stable `push`); (5) `focustimer-view.tsx:144` —
`mutations` in the deps array (an outer-scope module import, not a valid dependency); (6)
`notes-view.tsx:239` — `updateNote` missing (`mutations.updateNote`, a stable module member).
Fixes (1)–(6) verified zero-behavior-change or mechanical by direct read. The remaining scaffold
disables (~25 rules) stay — documented as the deliberate posture (the compensating controls:
tsc strict `noUnusedLocals`/`noUnusedParameters`, the ACTIVE `react-hooks/set-state-in-effect`
gate, 1191 unit + 560 e2e) — but the stale-closure rule earns its error status back.

**[CD4 · L · Verified]** The shared body cap's comment is corrupted AND its status is
semantically wrong. `http.ts:105-108` — the `JSON_BODY_MAX_BYTES` doc block carries an orphaned
fragment ("route enforces (its own 413 contract predates this and stays). The largest" — a
sentence moved into the parens but its tail left behind). And the same client fault (an
oversized body) answers **400** through the shared cap (`ValidationError("The request body is
too large.")` → `toErrorResponse` → 400) but **413** on the import route — internally
inconsistent; 413 is the correct signal (the repo's own import contract uses it, and no caller
can fix too-large by retrying). The e2e pin (`auth-flows.spec.ts:421-431`, S118/BS2) asserts the
400 — its PURPOSE (the pre-read bounded-memory rejection) is untouched by the status
correction.

**[CD5 · L · Verified]** No affirmative structured startup line. `instrumentation.ts`'s
`register()` logs only on warn/fatal; the happy path is silent — yet AGENTS.md's own
db-troubleshooting guidance says "check the startup log line", and the three-anchor
`DATABASE_URL` contract (the repo's self-declared most fragile invariant) has zero boot-time
observability. One `console.log` in `register()` (node_env + the db anchor outcome — NEVER the
raw URL: a PostgreSQL URL carries credentials) closes it.

**[CD6 · L · Verified]** The auth-surface set: (a) `/reset-password` with a stripped query
renders the SIGN-IN form (the initial view keys only on `params.get("view")/("token")`,
`login-surface.tsx:49-51`) — the CA11 missing-token explanation is reachable only via
`/login?view=reset`; the route the explanation was written for never shows it; (b) the
forgot-success banner uses `role="alert"` (assertive) where the surface's own success channel is
`role="status"` (its own `InlineStatus`); (c) all six auth-form `apiSend` calls pass no
`timeoutMs` — a stalled POST holds the disabled-busy button forever (the CC7 class on the app's
one unauthenticated surface); (d) `login/page.tsx` ≡ `reset-password/page.tsx` byte-identical
(37 duplicated lines); (e) the drawer backdrop close-button (the dialog's first focusable —
pinned by the S118/BS4 cycle) carries no `focus-visible` style (one invisible focus stop);
(f) `page.tsx:202-209` — a needless fragment left post-BY11; (g) the OTP boxes don't
select-on-focus (typing over an existing digit does nothing under `maxLength=1`).

**[CD7 · L · Verified — doc drift]** The census/doc set: (a) `CLAUDE.md:69` says "the COMPLETE
15-var token set" — the code and its own comment say **17** (S88/AO5 + S121/BV15 additions,
theme.test.ts-pinned); (b) `AGENTS.md:1367` still says "PATCH/DELETE unthrottled — bounded by
existing rows, the next-cycle candidate" — **CB7 landed the PATCH/DELETE shared write budget
three cycles ago** (`http.ts:319-328`, "the BZ5 collection-POST budget's documented next-cycle
candidate, closed") — the line is stale; (c) the audit-brief non-gap register carried the same
stale entry (I-4).

**[CD8 · I → census pin · Verified]** `force-dynamic` is declared on exactly 1 of 61 API route
files (`health`). Every data route is dynamic-by-construction (33 files route through
`makeCollectionRoutes`/`makeItemRoutes` → `requireUser` → `cookies()`; 8 use `requireUser`
directly; the auth family sets/reads cookies; Next 15+ does not cache route handlers by
default), so this is letter-of-rubric, not a live bug — but nothing guards the invariant. The
census pin (script-conventions style): every `src/app/api/**/route.ts` declares
`export const dynamic = "force-dynamic"` OR imports one of the dynamic-by-construction seams
(`@/lib/server/http` factories, `@/lib/server/auth`, `@/lib/auth`, `next/headers`) — a future
route that dodges every seam fails the unit layer.

**Dismissed as documented non-gaps or deliberate variants** (the audits' own verdicts,
re-checked): the reset-token 24-byte/30-min shape vs the master skill's 32-byte/60-min (192-bit
entropy, STRICTER TTL, hashed-at-rest + single-use + supersede-on-reissue all verified holding —
recorded as the deliberate variant in the SKILL doc, CD7's docs pass); the `{ error }` envelope
vs the skill's `{ok, error}` (the documented repo-wide convention, consumed by api.ts + the
entire e2e layer); the base64url MAC encoding (same HMAC-SHA256 strength); `package.json`'s
declared lower bounds lagging the documented floors (the lockfile pins the floors — react
19.3.0, prisma 6.19.3 installed; a floor-bump is a metadata nicety, deferred with this record);
the seven 17-name TOKENS arrays in theme.ts (index-sync machine-pinned — churning the boot
script for style is risk without value); the just-in-time palette pinning policy (the standing
convention, hue-tokens-guarded); Audit A's I1/I6 (the sanctioned pre-paint dSH; a comment
clause) — the comment clause rides CD7's docs pass.

---

## 2. The CD set (TDD — RED first, then the source)

Order: the two parity/resilience Ms first (CD1, CD2), then the stale-closure guard (CD3 — the
rule flip IS the RED), then the L set. Every source change lands with its RED pin written and
verified failing FIRST (except the pin-less hygiene/doc classes, marked).

- **CD1** the overlay animation family: `@import "tw-animate-css";` directly after
  `@import "tailwindcss";` in globals.css (the v4 port — same class names, same `enter`/`exit`
  keyframes, default 150 ms); the overlay classes restored on `DialogOverlay` +
  `AlertDialogOverlay` (the reference-measured set: `data-[state=open]:animate-in
  data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0`);
  `bun remove tailwindcss-animate` (the dead v3 dep). **The duration-200 question settled by
  measurement after wiring:** the reference's content measures 0.15s (its `duration-200` feeds
  only the inert transition) — if the clone's `duration-200` (v4 sets `--tw-duration`, which
  tw-animate-css reads) pushes the animation to 0.2s, the class is DROPPED from the four
  primitives (the measured rationale in the commit; transition-duration parity on a
  never-transitioning element is invisible). RED: (a) unit — a new
  `tests/overlay-animation.test.ts`: the globals.css source-shape pin (the import present — the
  hue-tokens/script-conventions source-pin precedent) + the four-primitives census (every
  `animate-in` consumer's file carries the family; the two overlays carry the reference set);
  (b) e2e — the parity leg in `theme-system.spec.ts`: open the Add Task dialog, the computed
  `animation-name === "enter"` AND `animation-duration === "0.15s"` on content AND overlay (the
  reference-measured values; pre-fix: `none`/`0s`). Exit-animation race check: the dialog-heavy
  specs (tasks, notes/BZ3, calculator, settings) re-run cold after wiring — the CC3 class
  (`evaluateAll` does not retry) audited for those specs first.
- **CD2** the collection GET deadline: `export const COLLECTION_GET_TIMEOUT_MS = 20_000` in
  `data.ts` (the public-seam precedent: `IMPORT_MAX_BYTES` is exported and consumed by the
  panel); `fetchAndSet` passes `{ timeoutMs: COLLECTION_GET_TIMEOUT_MS }`. Every collection GET
  (pre-warm, loadAll, view refreshes, post-mutation refresh) becomes bounded; on a stall the
  fetch rejects → the existing `.catch` paths handle it (the prewarm catch, the BS9 loadAll
  catch, the view-side catches — flashcards already retries; the mutation refresh rejection
  surfaces as the standard toast, same class as any refresh failure). RED: (a) unit — the
  source-shape leg in `tests/data-store.test.ts` (fetchAndSet's apiGet call carries the
  timeoutMs leg + the constant is 20_000 — the CC11 family file); (b) e2e — the boot-gate stall
  leg in `navigation.spec.ts`: `page.route` holding a pre-warmed collection GET (never
  fulfilling), `goto /`, at 5 s the Splash still visible (the stall holds the gate — the
  pre-fix-forever shape), by 30 s the shell heading visible (the deadline released it;
  `test.setTimeout(35_000)`; the held-GET cleanup per the S13/S14 lessons — unroute in
  `finally`, a GET unroutes harmlessly). Pre-fix: the leg times out at the heading assertion —
  RED for the right reason.
- **CD3** the stale-closure guard: re-enable `"react-hooks/exhaustive-deps": "error"` in
  `eslint.config.mjs` (with the posture comment: the deliberate-remaining scaffold disables +
  their compensating controls) and fix the six violations — (1) `rum-panel` deps `[load]` →
  `[refresh]`; (2) `calculator-view` — copy `historyToggleRef.current` to a local inside the
  effect, cleanup focuses the local; (3)+(4) `files-view` — add `toast` (the stable memoized
  object); (5) `focustimer-view` — drop `mutations` from the array; (6) `notes-view` — add
  `updateNote`. RED = the probe command itself (the 6 eslint errors on the pre-fix tree, the
  counts recorded here); the fixes ride the existing view coverage (unit + e2e). No census
  change.
- **CD4** the body-cap truth pair: repair the `JSON_BODY_MAX_BYTES` comment (one coherent
  sentence); introduce `BodyTooLargeError extends Error` in `http.ts`, thrown by the shared
  cap's two sites, mapped **413** in `toErrorResponse` (the import route's own catch keeps its
  route-specific copy — it converts before the shared mapper sees it). RED: the unit legs
  (toErrorResponse maps BodyTooLargeError → 413 with the existing copy; ValidationError still
  400) + the auth-flows e2e pin updated `400` → `413` (the pin's bounded-memory purpose
  unchanged — its comment updated to name the S129 status correction).
- **CD5** the structured startup line: `register()`'s happy path emits one line —
  `[boot] studyflow up — node_env=%s, db=%s` where db is the RESOLVED anchor shape (sqlite file
  present / resolved path tail — never the raw URL). Doc-class observability; the s22 boot-guard
  e2e pins (negative spawn + positive control) are the existing guards — no new pin (the CB14
  boot-WARN precedent).
- **CD6** the auth-surface + shell set: (a) `login-surface` reads `usePathname()` — on
  `/reset-password` the initial view defaults to `"reset"` regardless of query (the missing-token
  guard + disabled submit render there; `/login` keeps the param-keyed behavior); (b) the
  forgot-success banner `role="alert"` → `role="status"`; (c) the six auth `apiSend` calls pass
  `{ timeoutMs: 20_000 }`; (d) the two byte-identical route pages deduplicated (a shared
  `AuthRoutePage` component; both routes become 2-line wrappers); (e) the backdrop button gains
  `focus-visible:ring-2 focus-visible:ring-sf-primary/40` (the pinned BS4 focus cycle untouched
  — it asserts order, not styling); (f) the needless fragment removed; (g) the OTP boxes gain
  `onFocus={(e) => e.target.select()}`. RED: the e2e leg in `auth-flows.spec.ts` — bare
  `/reset-password` renders the missing-token explanation (pre-fix: the sign-in form); the rest
  ride the existing suites (class additions + stable-dep additions; the OTP paste pin BW9
  untouched — select-on-focus only changes the overtype path).
- **CD7** the doc-drift set: `CLAUDE.md` 15→17 (+ the S88/S121 provenance); `AGENTS.md`'s
  rate-limiter census line refreshed to the CB7 truth (PATCH/DELETE on the shared write budget,
  after auth before readJson — the "next-cycle candidate" clause closed); the SKILL doc gains
  the three deliberate-variant notes (reset-token shape, envelope shape, the eslint posture).
  Doc-only class, no pins.
- **CD8** the api-route dynamic census: the script-conventions-style pin — every
  `src/app/api/**/route.ts` declares `export const dynamic = "force-dynamic"` or imports a
  dynamic-by-construction seam (`@/lib/server/http`, `@/lib/server/auth`, `@/lib/auth`,
  `next/headers`); the census count recorded in the pin's message. No production diff (the
  current tree passes — health declares, everything else routes through a seam).
- **CD9** the docs chain (§4).

**Projected census:** unit 1191 → **~1199** (overlay-animation +4 as the 45th file;
data-store +1; http-error-mapping +2; script-conventions route-census +1 — exact counts
re-derived as the pins land); e2e 560 → **~563** (chunk 1 +1 the boot-gate stall leg; chunk 2 +1
the animation parity leg; chunk 5 +1 the reset-password default leg — the auth-flows BS2 pin is
modified in place, no count change). The register tripwire: no new `scripts/*.mjs` — the
expectation is the exact hold **249/130/0/119** (36th).

---

## 3. Verification checklist (the cold re-cert)

1. lint ✓ (the CD3 rule flip active, zero violations) · `tsc --noEmit` ✓.
2. Unit: **~1199/~1199** (45 files — exact at run time).
3. The canonical build green (REAL_EXIT, foreground), then the cold 5-chunk e2e **~563** — the
   re-tagged chunk map, every chunk first-pass, fresh `db/e2e.db` per chunk.
4. The register tripwire: **249/130/0/119** — the expectation stated BEFORE the measurement.
5. The db contract re-verified: `DATABASE_URL="file:../db/custom.db"`, `db/` at the repo root,
   `.env.example` current (no new env vars this cycle).
6. The live battery on the fresh-seeded daemon: the standing mobile set + the CD1 animation
   parity demoed live (the dialog's computed `enter`/`0.15s` on the daemon — the reference-matched
   values), evidence frames under `docs/screenshots/129-clone-*.png`, all verified non-blank.

## 4. Documentation chain (the same-commit updates)

README (the chunk map + census lines + the S129 row) · AGENTS.md (the census anchors + the
CB7-truth line + the commands table) · CLAUDE.md (the 17-var fix + census) · PAD **v1.3.37** (the
revision block + the §8.1 rows for the touched files + the animation-layer row's wired status) ·
`omni-study1_SKILL.md` (the chunk map + census + the three variant notes) · the vitest header ·
the cert-script re-tags (Expected: the new census) · this plan's §5 execution record · the
worklog Session-129 entry · `docs/session_129.md` (the agent session record, mirroring the
established structure) · the evidence frames.

## 5. Execution record (2026-11-02)

Executed TDD-style. **RED:** the overlay-animation unit pins (the import absent; the overlay blocks carrying no animation classes; the notes popover missing its exit family; the dead v3 dep still declared) + the theme-system e2e parity leg (**Expected: "enter", Received: "none"** — the inert family demonstrated live at the computed-style boundary) + the data-store pins (apiGet called with NO options on both loadCollections and loadAll) + the navigation boot-gate stall leg (**the shell heading never rendered inside the 35 s window — the pre-fix-forever Splash demonstrated live, all 60 sibling legs green**) + the http 413 mapping legs (BodyTooLargeError unknown to the mapper, the shared cap answering 400) + the auth-flows reset-default leg (**the sign-in form rendered at bare /reset-password**) + the auth-flows BS2 status-correction leg (the route answering 400) — **12 RED total (8 unit + 4 e2e), all for the right reasons**. The holds-class legs passed pre-fix as designed (the CD8 route census — the current tree already satisfies the invariant; the plain-ValidationError 400 mapping).

**GREEN:** the CD1 wiring (the `@import "tw-animate-css";` after the tailwind import + the overlay fade classes on Dialog/AlertDialog + the notes popover's exit family + `bun remove tailwindcss-animate`), CD2 (`COLLECTION_GET_TIMEOUT_MS = 20_000` exported from data.ts and threaded through fetchAndSet — every collection GET bounded), CD3 (the eslint rule flip + the six fixes: rum-panel `[refresh]`, calculator-view's ref copy, files-view's `toast` ×2, focustimer's `mutations` dropped, notes-view's `updateNote`), CD4 (`BodyTooLargeError extends ValidationError` → 413 ahead of the 400 branch in toErrorResponse + both readBytesCapped throw sites converted + the comment repaired + the BS2 pin's status corrected with the rationale), CD5 (the boot line in register()'s happy path — the file: shape prints its path, anything else redacts to the protocol), CD6 (the pathname-keyed reset default, the role=status banner, the six auth timeouts, the AuthRoutePage dedupe, the backdrop focus ring, the fragment removal, the OTP select-on-focus), CD7 (CLAUDE.md 15→17, AGENTS.md's CB7-truth line), CD8 (the census pin — zero production diff).

**The duration-200 measurement (the plan's open question, settled live):** with the import wired, the clone's dialog content computed `animation-duration: 0.2s` (v4's `duration-200` writes `--tw-duration`, which tw-animate-css reads) vs the reference's **0.15s** — the class was DROPPED from the two primitives per the plan's pre-committed rule, and the content then measured **0.15s exact** on BOTH the content and the overlay (the live dev-server probe + the e2e parity leg assert the pair). The never-transitioning `transition-duration` parity loss is invisible by construction (no property changes on a mounted dialog) — recorded here as the deliberate trade.

**The honest mid-run corrections (all pin-side):**

1. **The overlay-class unit pin's first shape was non-discriminating** — a whole-file `includes()` matched the CONTENT's animation classes (both live in one file and share the family tokens), so the overlay leg PASSED pre-fix for the wrong reason; re-scoped to the overlay COMPONENT blocks (`const DialogOverlay` … `displayName`).
2. **The e2e overlay locator named an attribute this Radix version never sets** — `[data-radix-dialog-overlay]` matched nothing on the clone (verified live: the overlay carries `data-state/class/data-aria-hidden/aria-hidden/style` only); re-scoped to the scrim class shape `div[class*="bg-black/80"]`.
3. **The CD6a pin's count-0 assertion hit the documented substring-matching quirk** — `getByRole("button", { name: "Sign in" })` also matches the reset screen's "Back to sign in" button (the AGENTS.md lesson, re-hit); fixed with `exact: true` + the Welcome-heading identity assertion.
4. **The forgot-banner role pin needed the CD6b correction applied to it** — the S15 journey pin located the success banner via `getByRole("alert")`; with the corrected `role="status"` semantics the pin follows (its text purpose unchanged) — the pin update is part of the semantics change, documented in-line.
5. **The rum-panel CD3 comment shifted a line-anchored residual register** — hue-tokens' raw-family register pins `rum-panel.tsx:134`; the 4-line exhaustive-deps comment moved the raw class to line 138 and both register directions failed loudly (the guard working as designed); the register re-anchored with the provenance note.

**Guardrails held:** no test weakened (the two modified pins — the BS2 status and the forgot-banner role — are the documented corrections their source changes demand, each with the rationale in-line; the pin's PURPOSE is unchanged in both), no lint/type rule loosened (one lint rule TIGHTENED — exhaustive-deps error), no e2e pin deleted.

**The re-cert:** lint ✓ (the CD3 rule active, zero violations) · tsc ✓ · unit **1202/1202 (45 files — census 1191 → 1202, +11 exact: overlay-animation +4 the 45th file, data-store +2, http-body +3, script-conventions +2)** · the canonical build green (REAL_EXIT, foreground) · the cold 5-chunk e2e **563/563 — 145+178+72+93+75, every chunk first-pass on the final tree** (chunk 1 +1 the CD2 boot-gate stall leg; chunk 2 +1 the CD1 animation parity leg; chunk 5 +1 the CD6a reset-default leg) · the register tripwire **249/130/0/119 — the exact hold (the 36th consecutive; no new script files, the pins rode existing spec files)**. **Census: unit 1202 + e2e 563 = 1765 green.**

**The live re-cert:** the daemon re-seeded FRESH (kill-by-PID + `rm db/custom.db` + push + seed, the S32 recipe, preflight GREEN), the standing mobile battery ALL GREEN — the labeled hamburger 36×36 at [16,14], `role=dialog` + label, 288px panel, 20 links, the true-layer backdrop blur(4px) + oklab(0 0 0 / 0.2), nav auto-close → `/Notes`, /Notes clean (390 = 390), scroll persistence 600 → 600 across the drawer cycle, landscape 992 > 301 scrolls — **no Tailwind v4 mobile-nav bug, the 34th consecutive live confirmation**. The CD1 animation parity demoed LIVE on the daemon: the Add Task dialog's overlay AND content both compute `enter` / `0.15s` (the reference-matched values). Three evidence frames in `docs/screenshots/129-clone-*.png` (the mobile drawer; the open Add Task dialog — the cycle's visible consequence; the desktop dashboard), all verified non-blank (the byte-histogram check; the drawer frame 60,298 bytes vs the prior cycle's same-view 60,243).

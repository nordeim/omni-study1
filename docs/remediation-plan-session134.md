# Remediation Plan — Session 134 / Batch CI (Cycle 84)

**Status: COMPLETE** (executed TDD-style 2026-11-04 — the verification record is §5;
the drafted §2/§3 held through GREEN with the divergences recorded inline in §5, the
s133 precedent)
**Date:** 2026-11-04 · **Workspace:** a FRESH clone at `32a15c0` (the Batch CH state `b8d833b` + the
operator's `32a15c0` (`docs/session_138.md`, the CH transcript) — the sandbox was reset, so `.env`
was re-created from the current `.env.example`, `db/` re-pushed + re-seeded, the dev daemon
re-started (S32 recipe, preflight GREEN), and chromium-1243 re-provisioned after the fresh
`bun install` raised Playwright's pinned browser build). **Audit-driven hardening session** — the
standing rhythm (audit the prior-batch diff, rotate two fresh-eyes deep audits, re-certify cold),
with THIS cycle executing the standing front-of-queue deferral: the scrypt KDF
parameter/versioning migration (B-L3, deferred the sixth time — "it needs a measured availability
cycle of its own"; this is that cycle, and the measurement section is §2.1).

---

## 0. Scope and Method

The operator directed the standing charter (the same as s125–s133): refresh the workspace, re-read
the doc chain (`AGENTS.md`, `CLAUDE.md`, `README.md`, `PAD`, `omni-study1_SKILL.md`,
`docs/session_137.md`, `docs/remediation-plan-session133.md`, `worklog.md`,
`docs/session_138.md`), re-validate against the codebase, audit with the repo skills as rubrics
(`skills/` excluded from checking/testing/compilation), iterate on visual + functional parity with
`https://omni-study1.base44.app/` (the mobile navigation menu the named focus, Tailwind v4 the
named suspicion class), keep the repo a production-ready functional SUPERSET with visual parity,
keep the `.env`/`db/` contract (`DATABASE_URL="file:../db/custom.db"`, `db/` at the repo root,
`.env.example` tracked + current), maintain the vitest + playwright suites, plan remediation for
everything found, execute with TDD (RED → GREEN), capture evidence under `docs/screenshots/`,
update the docs chain, and commit + push to `main` via the SSH wrapper.

**The s133 closing suggestion executed this cycle:** BOTH options — the scrypt KDF migration (the
sixth-time deferral, now the centerpiece) AND the deep-audit axes rotated back onto the
auth/crypto/infra + FE/views families (the s131 axes, three cycles stale).

### Baseline (cold, BEFORE any work — re-derived on the fresh clone)

lint ✓ · `tsc --noEmit` ✓ · unit **1291/1291** (45 files) · the canonical build green (exit 0,
foreground) · the cold 5-chunk e2e **578/578 — 149+180+74+94+81, every chunk first-pass** (per-chunk
via `scripts/run-cert-chunk.sh`; zero flakes) · the Mode-C audit of the Batch CH diff (`b8d833b`,
33 files): **all 10 CH claims re-verified TRUE against the tree, zero key material** (CH1's
`decks.*` registry keys at data-import.ts:505-506 + the manifest-consistency census at
tests/data-import.test.ts:892; CH2's `ENUM_VOCABULARIES` over the exported validation.ts arrays;
CH3's exactly-ten real `@@index([subjectId])` lines [schema.prisma:173-462 — the 11th grep hit is
the comment at :472] + the FK census; CH4's `validateImportEnvelope` seam at data-import.ts:278
with the route consuming it at route.ts:208; CH5's `exams.topics` registry entry; CH6's
`slice(0, 10)` + "…and N more" + the 64-char field cap; CH7's `router.refresh()` in
export-panel.tsx:93; CH8's `boundedTitle` trim + the folder schemas; CH9's `MAX_UPLOAD_BYTES` in
http.ts:102; CH10's `DEFAULT_GET_TIMEOUT_MS` in api.ts:80 with data.ts:345 deriving).

### Live parity (both hosts — agent-browser, mobile 390×844 + desktop 1280×800)

**Reference** (logged in `sepnetflix2023@outlook.com`): the standing battery held — the mobile
drawer panel **288px**, no `role=dialog`, `z-50`, `shadow-2xl` final layer
`rgba(0,0,0,0.25) 0px 25px 50px -12px` (identical to the clone's trap-13 serialization), backdrop
**`blur(4px)` + `rgba(0,0,0,0.2)`**, exactly **20 nav links**, `animation: none` (instant open),
nav **scrollable (992/744)**, drawer nav-click → `/Tasks` + drawer unmounts, body scroll `visible`
while open (the clone's lock is the documented superset), desktop **260px sidebar / 20 links /
main offset 260px**.

**Clone** (dev :3000, demo account): `node scripts/drawer-check-s14.mjs` → **DRAWER CHECK: GREEN**
(all six checks) — the **43rd consecutive no-Tailwind-v4-mobile-nav-bug confirmation** at
baseline. The agent-browser live walk: hamburger labeled "Open navigation menu" + `aria-expanded`
toggling ✓, open lands focus on the panel's "Close menu" button ✓, the inner panel **288px white
`animation:none`** ✓, Escape closes + restores body scroll + **returns focus to the hamburger**
(through a REAL click — the synthetic path carries no focus, the s133 probing nuance) ✓, drawer
"Tasks" → `/Tasks` + drawer unmounts ✓, desktop chrome **260/20/260 identical to the reference** ✓.

### The audits (rotated fresh eyes — the s131 axes, three cycles stale)

- **Audit A — the auth/crypto/infra axis** (auth.ts, server/{auth,http}.ts, env-check.ts,
  db.ts/db-path.ts, site.ts, all 11 auth routes in full, the Prisma auth models, the
  middleware/config surfaces, the contract test files): **0 Critical / 0 High / 2 Medium / 5 Low /
  7 Informational**. The auth plane affirmed clean on: session HMAC construction/verification +
  the `v` embed; sessionVersion enforcement + reset revocation; token one-shot consumption
  atomicity (both families); user-enumeration discipline (body + scrypt-scale timing, the
  uniform-401 family incl. the CG1 exhausted-burn); OTP-at-rest (the peppered digest) +
  reset-tokens-at-rest (SHA-256 + supersede); the AUTH_SECRET boot guard; the proxy-hop contract;
  cookie flags (set AND clear); body-cap/CSRF gate; the C1 convention; error shapes; db-path;
  secret hygiene.
- **Audit B — the FE/views axis** (all 22 views, the layout chrome, the auth/export/rum/ui
  components, the store/router/theme/api/data libs, all app pages): **0 Critical / 0 High /
  2 Medium / 5 Low / 4 Informational**. The FE plane affirmed clean on: React correctness (zero
  set-state-in-effect shapes; key-remount + open-handler patterns everywhere; `cancelled` flags +
  sequence guards on every async load), hydration safety (structural — the SSR shell is the Splash
  only), the CE3 idiom in 16 views, trap-4 discipline (all 7 space-y consumers margin-free),
  the z-index scale, the a11y core (CA7 guards, aria-live, BS4 drawer lifecycle), the state layer
  (boot-script parity, loadFromUser unwrap), the data layer (refresh-after-write, optimistic
  rollback), consistency, testing breadth. **Mobile-nav verdict: CONFORMS** (every drawer-contract
  clause holds at mobile-chrome.tsx).

**Every M finding re-verified by direct read BEFORE this plan** (A-M1: only the positive
`exp > Date.now()` assertion exists at tests/auth.test.ts:43 — no expired-token rejection pin
anywhere; A-M2: the existing e2e 429 pins cover verify-email/resend/forgotAcct/loginAcct but none
of the per-IP `login:`/`register:`/`forgot:`/`reset:` keys [login/route.ts:34, register/route.ts:60,
forgot-password/route.ts:28, reset-password/route.ts:33]; B-M1: myday-view.tsx:105-116 has no busy
guard while every sibling composer has one; B-M2: calculator-view.tsx:416-419 renders the false
empty with no `s.loading` subscription). The A-L family likewise verified (L1: the
`hashPassword(password)` burn sits INSIDE the reset `$transaction` at reset-password/route.ts:76;
L2: `secureRandomBytes` has zero callers; L3: `SESSION_TTL_SECONDS` is a hand-mirrored literal at
server/auth.ts:27; L4: `directExposureProdWarning` fires only on parsed===0, env-check.ts:154) and
the B-L family (L1: view-collections.ts:28 omits `subjects` the view reads at flashcards-view.tsx80;
L3: files-view.tsx:600 bare `<p>`; L4: notes-view.tsx:405-412 no `selectedIdRef` mirror; L2: the
four violet sites at tasks-view.tsx:115, flashcards-view.tsx:394, notes-view.tsx:680,
analytics-view.tsx:414).

## 1. Findings → the CI set

| # | Finding | Severity | Fix |
|---|---------|----------|-----|
| CI1 | **B-L3 (sixth deferral) — the scrypt KDF is 8× below the OWASP floor**: `hashPassword` uses Node defaults (N=16384/2¹⁴, r=8, p=1 — 16 MiB) while OWASP's Password Storage Cheat Sheet floor is N≥2¹⁷ (128 MiB); the format carries NO parameter discriminator (a silent N-raise locks out every existing user — byte-shape-identical hashes, no parse error); at 2¹⁷ the 128·N·r working set **exceeds Node's default 32 MiB maxmem — verified BOTH runtimes throw without an explicit cap**; the login miss/legacy branches would diverge in timing during any naive transition (the BX4 oracle class reopened BY the migration); the reset route burns the KDF inside the open SQLite transaction (A-L1) | Medium | the full versioned migration (§2.1) |
| CI2 | the session-token expiry branch is unpinned at every layer — a regression in `if (exp <= Date.now()) return null` ships immortal tokens with a green gate (A-M1) | Medium | the expired-token rejection pin |
| CI3 | the per-IP 429 behavior of login/register/forgot/reset has no behavioral pin — only static source pins guard the key spellings (A-M2) | Medium | four e2e 429 pins (the verify-email 429 pin's shape) |
| CI4 | the MyDay quick-add composer has no in-flight guard — a second Enter during the POST window duplicates the task; every sibling composer guards (B-M1) | Medium | the busy guard + the held-route double-Enter e2e pin |
| CI5 | the calculator history panel misses the CE3 loading gate — a deep-linked `/Calculator` + History toggle during the background loadAll window renders the false "Your calculations will appear here." (B-M2) | Medium | the `s.loading` gate + the held-GET e2e pin |
| CI6 | the A-L hygiene family: `secureRandomBytes` is a dead export in the crypto seam (A-L2); `SESSION_TTL_SECONDS` is a hand-mirrored literal (A-L3 — a future TTL edit desyncs cookie maxAge from token exp, no failing test); an over-declared `TRUSTED_PROXY_HOPS` (e.g. 10 behind a 2-hop chain) silently collapses EVERY client into the shared `"local"` bucket — the exact CF2 sitewide-lockout posture the boot warning was built to make loud — with no warning because the parse returned 10, not 0 (A-L4) | Low | retire the dead export; derive the TTL; extend the boot warning + the `.env.example` note |
| CI7 | the B-L FE family: the flashcards pre-warm omits `subjects` the deck dialog reads (B-L1 — the S118/BS8 class); the notes `patchSelected` failure toast is not selection-mirrored (B-L4 — the AG6/AH2 surface-lie class); the files "Add Link" inline error is a bare `<p>` with no `role="alert"` (B-L3); an assignment slider commit failure leaves the thumb desynced from the label until the next re-render (B-L5) | Low | the pre-warm addition + the mirror gate + the alert shape + the catch-side resync |
| CI8 | four residual hardcoded-violet sites on accent-semantic surfaces (tasks hover border, flashcards study-card back border — both undocumented; notes selected-row and analytics Tasks-Completed chip — documented measured values never swept into the accent-token doctrine) (B-L2) | Low | register the four in the hue-tokens residual register (the machine-kept ledger); NO token migration this cycle — no byte-identical accent-token equivalent exists for a violet-200 border, and inventing tokens is a parity-measured change of its own |

**Deferred with documented rationale** → §4.

## 2. The CI set — design

### CI1 (M) — the scrypt KDF parameter/versioning migration (the B-L3 close)

**The measured availability record (this machine, Node 24.22.2 / Bun 1.3.14):**

| burn | Node | Bun |
|---|---|---|
| legacy N=2¹⁴ r=8 p=1 (the shipped default) | 63.1 ms | 97.7 ms |
| current N=2¹⁷ r=8 p=1 (maxmem set) | 536.8 ms | 857.4 ms |
| N=2¹⁷ WITHOUT an explicit maxmem | **THROWS** (`memory limit exceeded`) | **THROWS** (`MEMORY_LIMIT_EXCEEDED`) |
| cross-runtime byte-equality | sha256(derived) identical on both runtimes for BOTH parameter sets | — |

The login-verify cost rises ~8× (one burn per attempt; change-password 2; register/reset 1) —
imperceptible interactively, bounded by the 10/IP/15-min + 10/account/15-min budgets. The e2e
impact estimate (+40–70 s, concentrated in chunk 5's auth journeys) is re-measured honestly at
re-cert. The DUMMY mint at module load adds one current-params burn per process boot (~0.5–0.9 s)
— negligible.

**The format.** New form: `scrypt$<N>$<r>$<p>$<salt-hex-32>$<key-hex-128>` (6 parts). The legacy
3-part form (`scrypt$<salt>$<key>`) remains VERIFIABLE at the Node-default parameter set
(N=16384, r=8, p=1) — dual-verify is the migration's core requirement (an N-raise without a
discriminator locks out every pre-migration row: the hashes are byte-shape-identical).

**The seam (`src/lib/auth.ts`):**

- `SCRYPT_N = 131072`, `SCRYPT_R = 8`, `SCRYPT_P = 1` — exported (the current set, the OWASP
  floor); `SCRYPT_MAXMEM = 128·N·r + 64 MiB slack` — every call site passes it explicitly
  (the verified both-runtime trap).
- `hashPassword` mints the 6-part form at the current set.
- `parseStoredFormat(stored)` — the single parser: 3 parts → the LEGACY set; 6 parts → the current
  set and NOTHING ELSE (any other N/r/p fails closed — a hostile or corrupt row can never induce
  an oversized allocation; the accepted set is exactly the two shipped ones); salt 16 B, key 64 B
  (unchanged validation).
- `verifyPassword` — format-aware: parse, derive at the row's own parameter set, timing-safe
  compare. Malformed rows still answer false without burning.
- `needsRehash(stored)` — true for the 3-part legacy form (and malformed rows — harmless: the
  drain only runs after a SUCCESSFUL verify), false for the current 6-part form.
- **The transition equalizer** (the design's key novelty — the BX4/CG1 doctrine applied to the
  migration itself): while legacy rows drain, a login attempt against a legacy hash burns 2¹⁴ work
  while the no-user miss burns the dummy's 2¹⁷ — an ~8× remotely measurable account-existence
  oracle REOPENED BY the migration. The fix makes every login attempt burn EXACTLY ONE
  2¹⁴-scrypt AND ONE 2¹⁷-scrypt, on every branch:
  - `verifyLoginCredentials(user, password)` verifies against the stored hash (or
    `DUMMY_LOGIN_HASH`) — burning the row's own parameter set — then burns the COMPLEMENT set
    (current→legacy, legacy→current, malformed→both) with a per-process `COMPLEMENT_SALT`.
    Totals: {no-user, legacy-row, current-row, malformed-row} × {right, wrong} = 2¹⁴+2¹⁷
    identically. The pinned boolean contract is unchanged.
  - The login route's exhausted-account branch (S132/CG1) consumes the same helper
    (`burnLoginScryptWork(password, null)` — the dummy verify + complement) so its uniform 401
    costs the same as every other login attempt.
  - Register keeps its single-burn shape: every register branch burns at the current set only
    (no legacy hashes are in play — re-register OVERWRITES the hash, BV6).
- **Rehash-on-login** (the drain): after the credentials check succeeds (and before the
  unverified gate — the password proof already completed), the login route runs
  `if (needsRehash(user.passwordHash)) await db.user.update({ passwordHash: hashPassword(password) })`.
  One extra current-params burn on the FIRST successful login per legacy account only.
- **A-L1 folds in here** (same edit site): the reset route's `hashPassword(password)` hoists
  ABOVE the `$transaction` — at the new parameter set the burn is ~0.9 s under Bun, and the
  S119/BT3 replay-pair probe holds the SQLite write lock for its whole duration otherwise.
- `DUMMY_LOGIN_HASH` auto-regenerates at the current set (the existing mint line).
- The seed needs NO change (`prisma/seed.ts:57` calls `hashPassword`).

**The pins (unit, `tests/auth.test.ts`):** re-anchor the three format pins (:23 hash regex →
the 6-part form; :34 malformed `scrypt$only` — still false; :234 the DUMMY regex → the 6-part
form). NEW: the round-trip at the current set (which IS the maxmem regression pin — without the
explicit cap the call throws, so the pin fails loudly); a hand-built LEGACY 3-part hash verifies
TRUE; `needsRehash` semantics (3-part true / current false / malformed true); the 6-part
fail-closed family (wrong N, wrong r, wrong p, non-hex, short salt, short key → false); the
**burn census** — `vi.hoisted` + `vi.mock("node:crypto")` wrapping the REAL `scryptSync` with a
counter (the technique probed this cycle: it intercepts `@/lib/auth`'s calls, module-load mint
included), asserting `verifyLoginCredentials` burns exactly `[16384, 131072]` (in some order)
across the branch matrix {null user, legacy-hash user, current-hash user} — the machine guard
for the transition equalizer (a dropped complement burn fails the census); the login-route
source census (the rehash call + the exhausted branch's `burnLoginScryptWork`) via the
script-conventions family.

**The e2e layer:** the standing battery IS the CI1 e2e (register→login journeys, the uniform-401
family, the change-password/reset/delete rotations — all green post-migration = the hot paths
carry). No new e2e pin is POSSIBLE for the legacy path (an outside actor cannot write a legacy
row) — the unit layer owns the legacy semantics. Chunk 5's duration delta is the honest
availability measurement.

### CI2 (M) — the session-token expiry pin (A-M1)

`tests/auth.test.ts`, the token describe: forge a body `{ uid, iat: 0, exp: Date.now() - 1000 }`,
sign it with a set `process.env.AUTH_SECRET` (the key-change pin's technique at :61-71), assert
`readSessionToken` → null. Plus the boundary leg: `exp: Date.now()` (equal, not greater) → null.
The mutant this family guards: an inverted/dropped comparison shipping immortal tokens.

### CI3 (M) — the per-IP 429 behavioral pins (A-M2)

`tests/e2e/auth-flows.spec.ts` (the verify-email 429 pin's home, :394-422), one pin per route,
each on its own TEST-NET `x-forwarded-for` IP (the budget-isolation convention):
- **login**: 10 wrong-password 401s (a nonexistent email — the dummy+complement burn each) → the
  11th answers **429 + Retry-After + the login copy** ("Too many login attempts. Try again
  shortly."). ~10 s of double-burn — accounted in the availability record.
- **register**: 10 uniform 200s (a nonexistent email, unverified junk payload shape — the
  uniform-200 family) → the 11th 429. The global budget arithmetic: the standing chunk-5 register
  census is 15 POSTs (auth-flows 11 + s24 1 + s25 1 + s26 2); this pin adds ≤11 → **26 < 40** with
  a 14-request margin — verified safe, and each chunk re-boots the server (fresh buckets).
- **forgot**: 10 uniform 200s → the 11th 429 (the `forgot:${ip}` key, forgot-password/route.ts:28).
- **reset**: 10 invalid-token 400s → the 11th 429 (the `reset:${ip}` key, reset-password/route.ts:33
  — the limiter sits before validation per C1, so garbage payloads consume budget).

### CI4 (M) — the MyDay quick-add busy guard (B-M1)

`myday-view.tsx`: `const [adding, setAdding] = useState(false)`; the submit early-returns on
`adding`; set-true before the await, clear in `finally` (the sibling-composer idiom —
tasks-view `saving`, aiassistant `busy`). The e2e pin (tasks.spec.ts, the MyDay family): HOLD
`**/api/tasks` POSTs (the never-fulfilling route), type a stamped title, press Enter twice,
unroute (the S14 lesson — the held POSTs release to the real server), await the row, assert
EXACTLY ONE row carries the title. Pre-fix the second Enter fires a second POST → two rows (the
RED discriminator); post-fix the busy guard stands the second Enter down.

### CI5 (M) — the calculator history CE3 gate (B-M2)

`calculator-view.tsx`: subscribe `const loading = useDataStore((s) => s.loading);` and render the
Spinner (the tasks-view :708 idiom) in the `loading && history.length === 0` branch instead of the
false empty copy. The e2e pin (navigation.spec.ts, the S130/CE3 describe's shape): HOLD
`**/api/calculator/history`, goto `/Calculator` (pre-warm `[]` — gates on auth alone), open the
History panel, assert `.animate-spin` visible + "Your calculations will appear here." count 0;
unroute in `finally`.

### CI6 (L) — the A-L hygiene family

- (a) `secureRandomBytes` retired (zero callers — verified; no pin exists to re-anchor).
- (b) `server/auth.ts`: `export const SESSION_TTL_SECONDS = SESSION_TTL_MS / 1000;` (the import
  already exists) + a lockstep pin (`secure-cookie.test.ts`, the natural host — it already imports
  the server seam).
- (c) `env-check.ts`: `overdeclaredProxyHopsWarning(env)` — fires in production when the parsed
  hop depth exceeds a plausible bound (> 4 — cloud chains are 1-3 hops; the RFC 7239 discussion
  space never exceeds a handful) with the shared-bucket consequence named; consumed wherever
  `directExposureProdWarning` is (the boot warning surface — verified at implementation); +
  the `.env.example` note beside the CG10 port-isolation text. The runtime fail-closed-to-local
  behavior is UNCHANGED (the documented safe posture — a short XFF chain under an over-declared
  depth must not fall back to the forgeable first hop).
- (d) the reset-route hoist rides CI1 (same edit site).

### CI7 (L) — the B-L FE family

- (a) `view-collections.ts`: `flashcards: ["flashcardDecks", "flashcards", "subjects"]` + the
  view-collections test extension (the S118/BS8 settings-pre-warm pin's shape).
- (b) `notes-view.tsx` `patchSelected`: capture `const noteId = selected.id`, gate both settle
  branches on `selectedIdRef.current === noteId` (the title/content/Save sibling idiom) — the
  failure toast lands on the note the user is STILL on.
- (c) `files-view.tsx:600`: the link error gains `role="alert"` (the InlineError family's shape).
- (d) `assignments-view.tsx` `onValueCommit` catch: `useDataStore.getState().loadCollections(["assignments"])`
  — the controlled thumb re-syncs from the store (the sequence guard makes the refetch safe; the
  store never changed on the failed PATCH, so the refresh snaps the thumb back to `a.progress`).

### CI8 (L) — the residual violet register (B-L2)

The four sites join the hue-tokens residual register (the machine-kept, file:line-anchored ledger)
with the S134 annotation: the two undocumented sites (tasks-view.tsx:115 hover border,
flashcards-view.tsx:394 study-card back border) as accent-semantic drift acknowledged; the two
documented measured sites (notes-view.tsx:680 selected row, analytics-view.tsx:414 Tasks-Completed
chip) as parity-measured values outside the accent-token doctrine. NO token migration this cycle:
`--sf-primary-soft` (243 232 255) is violet-100, not violet-200 (221 214 254) — no byte-identical
equivalent exists, and inventing a `--sf-primary-200` token family is a parity-measured change of
its own (the honest deferral, §4).

## 3. The TDD pins (RED design — the projection)

Unit (target ~+30, the census 1291 → ~1321): `auth.test.ts` +~20 (the CI1 family: three
re-anchors in place, the round-trip/maxmem pin, the legacy-verify pin, the needsRehash family,
the fail-closed family, the burn census ×3 branches, the CI2 expiry pair) ·
`script-conventions.test.ts` +2 (the login rehash + exhausted-branch censuses) ·
`secure-cookie.test.ts` +1 (the TTL lockstep) · `view-collections.test.ts` +1 (the flashcards
pre-warm) · `env-check.test.ts` +2 (the over-declaration warning pair).
E2E (target +7, the census 578 → 585): chunk 2 +1 (the CI5 calculator gate — navigation.spec),
chunk 5 +6 (the CI3 quartet + the CI4 MyDay pin in tasks.spec... tasks.spec rides chunk 2 —
recount at RED time; the chunk map re-tags in lockstep with the machine-enforced Expected pin).

RED discipline: every pin verified failing for its DESIGNED reason (the format regexes missing
the 6-part form; the burn census reading the default-param burns; the expiry pin passing because
no pin exists — RED means the NEW pin fails on the CURRENT code; the 429 pins passing because no
behavioral pin exists... — for CI2/CI3/CI4/CI5/CI7 the RED leg is the standard new-pin-fails-
on-current-behavior; for CI1 the re-anchors flip RED on the current 3-part mint), with the 1291
baseline otherwise green throughout.

## 4. Deferrals (documented, with rationale)

- **A-L5 verify-email ms-scale timing asymmetry** — the same class as the standing resend/forgot
  equalization deferral (session133 §4): DB-query-scale (~ms) signal-to-noise, folded into that
  eventual pass.
- **The A-I family** (all documented postures or latent seams): logout's client-side-only
  revocation (the stateless doctrine — a registry is the rejected alternative); the
  `registerGlobal:` sitewide-exhaustibility flip side (the CF1 containment bound, mitigated by
  TRUSTED_PROXY_HOPS≥1 + port isolation); the OTP/reset mint delete-then-create windows
  (self-healing, zero integrity impact); the `inAppDeliveryGates` fail-open spellings (the
  documented direction, CB14 still warns); the forgot reset-URL Host-derivation (inert until a
  mail transport exists — the documented reopen trigger); the `__Host-` cookie prefix
  (posture-gated — incompatible with the plain-HTTP Docker posture); `poweredByHeader`
  (unverifiable read-only — needs a live-response probe).
- **B-I family**: the KPI icon-gradient stops (multi-hue decorative — the residual-register
  decision I1 defers to a design pass); the analytics "total study hours" rounding (cosmetic);
  the monthly-recurrence day-of-month approximation (documented parity behavior); the task-card
  `transition-all` (no current offender among asserted surfaces — noted for future pin authors).
- **The violet-200 token family** (CI8's honest remainder): a `--sf-primary-200`-class token +
  the four-site migration is a parity-measured change of its own (each site's byte-identity at
  violet must be re-probed on the reference).
- **Future KDF raises** (N beyond 2¹⁷): the accepted-set parser makes each raise an explicit,
  pinned decision — no silent parameter drift is possible now.
- **Dropping the complement burn post-transition**: once real deployments have drained legacy
  rows (rehash-on-login), the 2¹⁴ half of every login attempt is pure waste (~15-100 ms) — but
  removing it needs a deployed-legacy-rows census capability this single-user app doesn't have;
  the permanent uniform cost is the honest price of the absolute timing guarantee.
- The standing deferred set from s133 (unchanged): the pre-CE5 unguarded delegates (theoretical),
  the write-budget census per-method granularity, the boot double-fetch (ADR-014's contract), the
  newest-500 window vs import minting, the Docker non-root runtime, the resend/forgot ms-scale
  timing equalization, the drawer-link emission order, the flashcards render-phase unlatch, the
  iOS scroll-lock nuance, the RFC 7239 signed-proxy posture.

## 5. The as-executed record

**RED (verified).** 10 unit pins in `tests/auth.test.ts` failed for exactly their designed
reasons (the round-trip regex against the 3-part mint; the DUMMY regex; `SCRYPT_N`
undefined; the 6-part length assertion reading 3; `needsRehash`/`burnLoginScryptWork`
not functions; the four burn-census legs reading `[16384]`/`[]` — the single-default-set
burn with no complement, the naive-migration state itself). 3 unit pins in
`tests/script-conventions.test.ts` (the re-anchored CG1 leg finding the raw
verifyPassword+DUMMY form; the login drain census finding no `needsRehash`; the reset
census finding the mint INSIDE the transaction). 1 in `tests/secure-cookie.test.ts` (the
structural derivation leg — the literal form), 1 in `tests/view-collections.test.ts` (the
flashcards entry without subjects), 4 in `tests/env-check.test.ts`
(`overdeclaredProxyHopsWarning` not a function ×3 + the instrumentation census). At the
e2e layer: **CI4 RED for the designed reason** (the double-Enter resolved to **2
elements** — the duplicate-task discriminator), **CI5 RED for the designed reason** (the
false empty copy rendered at count 1 while the GET was held), and the **CI3 quartet
GREEN on current code** — coverage pins, the designed expectation for a missing-test
finding (A-M2), as were the CI2 expiry pair, the CI1 legacy-verify/fail-closed legs, and
the CI8 register legs (a register is born green — the S93/AT1 precedent).

**The honest mid-run corrections.**

1. **The CI3 register/forgot pins tripped the WRONG budget first** — the first draft
   reused ONE email across the 10 requests, so the per-EMAIL budgets
   (`registerAcct:`/`forgotAcct:`, 5/15-min) 429'd at the 6th request before the per-IP
   keys the pins measure. Fixed with DISTINCT emails per request (the budget-isolation
   convention, applied per-request rather than per-pin); the corrected pins pass.
2. **The burn-census instrument needed `vi.hoisted`** — the plain mock factory ran at
   module-load time (the DUMMY mint) before the counting array initialized
   (`Cannot access 'burns' before initialization`); the hoisted array is the standard
   fix, probed BEFORE the pin was written (the probe itself demonstrated the RED state:
   `[16384, 16384]` against `[131072, 131072]`).
3. **The CI8 register's notes-view anchor drifted 6 lines** — the CI7b patchSelected
   edit inserted comment lines above the registered site (680 → 686); the anchored leg
   caught it immediately (the register's own second direction doing its job on its
   first day); re-anchored with the drift note.
4. **The reset-census slice ended early** — `indexOf("});", txAt)` closed on the inner
   updateMany's bracket, missing the user.update body; re-sliced to the
   `if (!consumed)` guard.
5. **Two TS2554s** — `burnLoginScryptWork(password)` at the login route + the pin: the
   second parameter made optional (`= null`) per the exhausted-branch call shape.
6. **The capture script's frame-3 needed the authed-page pattern + a route-warm goto**
   — the fresh context bounced to /login (no session) and the cold Turbopack compile of
   /Calculator outran the goto (the s132/s133 lessons, both re-hit); the fixed script
   also gained a single retry on the mid-boot ERR_ABORTED bounce.
7. **The unit census landed at 1314 (+23), not the projected ~1321** — the count: auth
   +14 (10 new + the 2 CI2 legs + 2 legacy/fail-closed legs... the exact per-file
   arithmetic: auth 50 → 64 [+14: CI1 ×10, CI2 ×2, legacy-verify +1, fail-closed +1],
   script-conventions 27 → 30 [+3], secure-cookie 15 → 17 [+2], view-collections +1,
   env-check +4, hue-tokens +2). The e2e census landed at exactly **584** (+6), the
   projection exact: chunk 1 +1 [CI5], chunk 2 +1 [CI4], chunk 5 +4 [CI3].

**GREEN (verified).** lint ✓ · `tsc --noEmit` ✓ · unit **1291 → 1314 (45 files)** · the
canonical build green (exit 0) · the cold 5-chunk e2e **578 → 584 — 150+181+74+94+85,
every chunk first-pass** (chunk durations: 3.0m / 4.2m / 1.9m / 3.1m / **1.4m** — the
chunk-5 figure IS the availability measurement: 49 s → 1.4 m, the +35 s of scrypt work
at the new parameter set across the auth journeys, exactly the projected class and
magnitude). The drawer battery GREEN on the remediated tree — **the 44th consecutive
no-Tailwind-v4-mobile-nav-bug confirmation**. The register tripwire re-measured
**252/133/0/119** (the 45th consecutive hold; the +1/+1 is this cycle's own
`capture-s134-evidence.mjs`, Usage line per the S97/AX2 convention — verified by the
machine pin, which passed with the new script in the class). Three evidence frames under
`docs/screenshots/134-clone-*` (the desktop dashboard, the mobile drawer, and the NEW
CI5 calculator-history loading gate — the capture script's own `.animate-spin`
waitFor-visible + the passing e2e pin are the machine proof; the held route released in
the finally, the S13/S14 discipline). **Census: 1314 unit + 584 e2e = 1898 green.**

**The docs set (same commit):** README (the badge 1898 + the census lines + the S134
row), AGENTS.md (the census anchors + the NEW "scrypt KDF contract" section), PAD
**v1.3.42** (the revision block + the §8.1 Total row), the SKILL doc (the census
anchors), the vitest header (45/1314 + the S134/CI re-anchor block), the cert-script
re-tags (the S134/CI block + Expected 584 in both), `.env.example` (the CI6c
over-declaration note beside the CG10 text), `docs/DEPLOYMENT.md` (the new §4b password-
hashing contract), this record's §5, `docs/session_139.md`, and the worklog entry.

**Deferral deltas (§4):** none promoted, none retired beyond the plan — the KDF
migration itself is CLOSED (the standing front-of-queue deferral cleared); the NEW
deferred items are the complement-burn retirement (post-transition, needs a
deployed-legacy-rows census capability) and the violet-200 token family (a
parity-measured change of its own).

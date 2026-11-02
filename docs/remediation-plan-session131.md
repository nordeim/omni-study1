# Remediation Plan — Session 131 / Batch CF (Cycle 81)

**Status: COMPLETE** (executed TDD-style 2026-11-03/04 — the verification record is §5)
**Date:** 2026-11-03 · **Workspace:** the Batch CE state `7288769` + the operator's `14510d3`
(`docs/session_132.md`, the CE transcript). The workspace SURVIVED this time (the 22nd
continuation — no recycle: node_modules/db/chromium intact, `git pull` fast-forward, the
environment re-verified rather than rebuilt). **Audit-driven hardening session** — the standing
rhythm (audit the prior-batch diff, rotate two fresh-eyes deep audits, re-certify cold).

---

## 0. Scope and Method

The operator directed the standing rhythm (the same charter as s125–s130): refresh the workspace,
re-read the doc chain (`AGENTS.md`, `CLAUDE.md`, `README.md`, `PAD`, `omni-study1_SKILL.md`,
`docs/session_131.md`, `docs/remediation-plan-session130.md`, `worklog.md`,
`docs/session_132.md`), re-validate against the codebase, audit with the repo skills as rubrics
(`skills/` excluded from checking/testing/compilation), iterate on visual + functional parity with
`https://omni-study1.base44.app/` (the mobile navigation menu the named focus, Tailwind v4 the
named suspicion class), keep the repo a production-ready functional SUPERSET with visual parity,
keep the `.env`/`db/` contract (`DATABASE_URL="file:../db/custom.db"`, `db/` at the repo root,
`.env.example` tracked + current), maintain the vitest + playwright suites, plan remediation for
everything found, execute with TDD (RED → GREEN), capture evidence under `docs/screenshots/`,
update the docs chain, and commit + push to `main` via the SSH wrapper.

Method (the six-phase workflow): ANALYZE → PLAN (this document) → VALIDATE (every M finding
re-verified by direct read BEFORE the plan, plus the live reference probe that settled the CF11
dark-hairline parity question) → IMPLEMENT (smallest safe diff, TDD) → VERIFY (cold re-cert) →
DOCUMENT.

### Baseline (cold, BEFORE any work)

lint ✓ · `tsc --noEmit` ✓ · unit **1217/1217** (45 files) · the canonical build green (exit 0,
REAL_EXIT, foreground) · the cold 5-chunk e2e **567/567 — 146+179+72+93+77, every chunk
first-pass** (per-chunk via `scripts/run-cert-chunk.sh`) · the register re-derivation **249
importers / 130 Usage-line carriers / 0 stale / 119 usage-line-free** (the 40th consecutive hold,
the expectation stated BEFORE the measurement, the instrument identical to
`tests/script-conventions.test.ts`'s calibrated regex) · the Mode-C audit of the Batch CE diff
(`7288769`, 57 files, +1627/−149): **all 9 CE claims re-verified TRUE against the tree** (CE1's
`DEFAULT_GET_TIMEOUT_MS`/`DEFAULT_WRITE_TIMEOUT_MS` inside apiGet/apiSend + the four explicit
override files + the login-surface isTimeoutError branch; CE2's type-switch seeding at
practicetests-view:384-392; CE3's 12 gate markers across the six views; CE4's three-state render
at rum-panel:148; CE5's txModelName construction contract + the guarded delegates; CE6's five
budgets + the logout exemption + the machine census; CE7's 64-char atom + registry + the
P2002→409 at import/data; CE8's chart tokenization — the ten remaining `#8b5cf6` sites are
picker palettes/validation defaults/the pinned v3 token, data not chart styling; CE9's parentId
index + trims + clamp; zero key material).

### Live parity (both hosts — agent-browser, mobile 390×844)

**Reference** (logged in `sepnetflix2023@outlook.com`): the standing battery held — the hamburger
UNLABELED (name=null, 36px at [17,14], no `aria-haspopup`) · the drawer **no `role=dialog`**,
panel **288px** (`w-72`), the true-layer backdrop **blur(4px) + rgba(0, 0, 0, 0.2)**, exactly
**20 nav links** · the landscape drawer-nav **scrollHeight 992 > clientHeight 290, overflow-y
auto**. **Plus this cycle's NEW reference-specific probe (the drawer animation family):** the
reference's mobile drawer computes **`animation: none`, `transition: 0s`, no `data-state`, on
BOTH enter and exit** — a plain conditional mount/unmount, never live-measured before. The clone
matches BY CONSTRUCTION (mobile-chrome's `{mobileMenuOpen && …}` plain mount, the S118/Q1
comment) and by live measurement (`animation: none` sampled at open). The probe closes clean:
no parity delta on the drawer animation surface, and the exit-animation Tailwind v4 suspicion
class (tw-animate-css exit families) is confirmed ABSENT from the reference's drawer — the CD1
animation wiring correctly never touched it.

**Clone** (fresh reseed — kill-by-port + `rm db/custom.db` + push + seed, the S32 daemon recipe,
daemon health 200, demo login): the labeled hamburger **"Open navigation menu"** (36×36 at
[16,14]), **`role=dialog` + "Navigation menu"** (the deliberate superset), **288px**, **20
links**, **blur(4px) + oklab(0 0 0 / 0.2)** (the v4 form of the same color), nav auto-close →
/Notes, **/Notes clean (390 = 390)**, scroll persistence **600 → 600**, landscape **992 > 301,
scrolls** — **no Tailwind v4 mobile-nav bug, the 37th consecutive live confirmation.**

### The audits (rotated fresh eyes — the s130 closing recommendation)

- **Audit A — the app shell + routing + design tokens + auth screens family** (last deep-covered
  CD, two cycles back): `src/app/` (layout, page, globals.css, robots, sitemap, login,
  reset-password, export, rum), the 11 auth routes, `src/components/auth/`, the 6 layout
  components, the client-consumption side of router/theme/store/site. **0C/0H/1M/5L/4I.**
- **Audit B — the crypto/auth core + infrastructure configs + test-infra family** (also last
  deep-covered CD): `src/lib/auth.ts` (crypto core in full), `src/lib/server/auth.ts`, http.ts,
  ai.ts, entities.ts (non-CE5 axis), db.ts/db-path.ts, env-check.ts, instrumentation.ts, all
  configs, Dockerfile/docker-compose, the e2e setup + cert scripts. **0C/0H/1M/8L/6I.**

Every M finding re-verified by direct read BEFORE the plan (the two: A-M1 the per-IP-only
register/resend budgets with the unconditional scrypt burn; B-M1 the `"local"` fallback
collapsing every per-IP auth budget into one shared bucket). The key L findings verified the
same way (the reseed footgun, the resend 429 lie, the OTP plaintext-at-rest + short-circuit
compare, the playwright env leak, the global-setup never-cold gap, the run-cert-chunk exit-code
drift, the focus-restore no-op, the dead prefill line, the dead exports). One live reference
probe settled the CF11 parity question BEFORE the plan: **the reference's login page is
LIGHT-ONLY under dark-OS emulation** (bodyBg white, `prefers-color-scheme: dark` matched) — its
hairline never renders dark, so the clone's dark hairline is a clone-side dark-correctness
question (the clone's own dark-OS login pin creates the surface), NOT a parity constraint.

### The B-M1 infeasibility note (verified, not assumed)

The audit's primary recommendation — thread `request.socket.remoteAddress` into the fallback —
is **not implementable in the Next.js 16 App Router**: `NextRequest` (verified against
`node_modules/next/dist/server/web/spec-extension/adapters/next-request.d.ts`) exposes no `ip`
property (removed upstream after the 15.x deprecation) and no socket/remote-address accessor;
route handlers receive a Web `Request` shape only. The honest remediation is the audit's own
alternative: the boot warning + docs (CF2 below). No AsyncLocalStorage/http-server monkey-patch
hacks — fragile against Next internals and unverifiable here.

---

## 1. Findings → the CF set

| # | Finding (source) | Sev | Fix |
|---|---|---|---|
| CF1 | Register/resend gated ONLY by the forgeable per-IP key; unconditional `scryptSync` on every register branch (single-worker CPU DoS) + unbounded unauthenticated User/VerificationToken growth under rotated XFF (A-M1; B-I1) | **M** | Per-EMAIL budgets, checked before any DB work/scrypt burn |
| CF2 | The `"local"` fallback collapses every per-IP auth budget into ONE shared bucket — 10 anonymous requests sitewide-lockout the auth families under the hops=0 / no-XFF postures (B-M1) | **M** | Production boot warning (the CB14 precedent) + DEPLOYMENT.md/AGENTS.md notes + unit pins |
| CF3 | `scripts/reseed_e2e.ts` deletes the demo user from **db/custom.db** under Bun's `.env` auto-load — destructive footgun (B-L4) | L | Hard-target `db/e2e.db` + print the resolved path + guard |
| CF4 | Playwright webServer env leaks the operator's shell (`SEED_DEMO=0` etc. red-hazes the suite with no diagnosis) (B-L5) | L | Pin the posture vars in `playwright.config.ts` + global-setup seed env |
| CF5 | `bun run test:e2e` never resets `db/e2e.db`; `reuseExistingServer` can serve stale state — the ALWAYS-COLD doctrine is cert-path-only (B-L6) | L | Global-setup port-guard + unlink the scratch db before the push |
| CF6 | `run-cert-chunk.sh`: trailing `grep` decides the exit code (a no-match false-REDs a green run) + the two cert scripts' CHUNKS arrays can drift unguarded (B-L8) | L | `PIPESTATUS[0]` exit honesty + the identical-arrays machine pin |
| CF7 | OTP codes stored PLAINTEXT at rest (`VerificationToken.code`) + the one secret compare not timing-safe (`!==`) — inconsistent with the BR6 hashed-reset posture (B-L1/L2) | L | SHA-256 digest at rest (the BR6 helper) + `timingSafeEqual` compare |
| CF8 | `resend()` renders the success status on a real 429 — a lying UI state, the user waits for a code that never arrives (A-L1) | L | Branch on `ApiError.status === 429` → the route's own 429 copy |
| CF9 | Drawer focus restore no-ops at the lg breakpoint crossing (`document.contains` passes; the opener is `display:none`; `focus()` silently drops to body) (A-L4) | L | `checkVisibility()` guard + the sidebar-nav/#main-content fallback |
| CF10 | Dead code + the siteUrl crash: the post-reset prefill line (dead in every dominant flow), the two dead `export` consts in login/route.ts, `new URL(siteUrl())` throws at layout module scope on a malformed `NEXT_PUBLIC_SITE_URL` (A-L2/L5/I4) | L | Drop the dead line + un-export the consts + `URL.canParse` self-heal |
| CF11 | The login-card top hairline has no dark pair — a bright 4px strip atop the dark auth card (the clone's own dark-OS login surface; the reference never renders this surface dark — live-measured) (A-L3) | L | The arbitrary-value class pair (exact sRGB kept, dark stops added) |

**Deferred with documented rationale (not this cycle):**

- **B-L3 (scrypt KDF params/versioning)** — real hardening but a cycle of its own: the
  `scrypt$salt$key` format is PINNED by `tests/auth.test.ts:233` (`^scrypt\$[0-9a-f]{32}\$[0-9a-f]{128}$`),
  the DUMMY_LOGIN_HASH equalizer must be regenerated at the new cost (or the timing equalizer
  burns a different cost than the real path), and the N-raise (OWASP suggests ≥2^17, 8× the
  current default) is a real availability trade-off for a single-threaded self-hosted server
  (register burns scrypt on EVERY branch) that needs measurement, not assumption. **Next-cycle
  candidate.**
- **B-L7 (Docker runtime as root)** — the fix is NOT the one-line `USER app` it appears: the
  runtime volume mount (`./db:/data`) is host-owned; a build-time `chown` never reaches the
  mounted inode, so an untested USER switch silently breaks every existing deployment's writes.
  Needs a docker build/run verification pass (the deploy axis). **Documented, next-cycle
  candidate with the DEPLOYMENT axis.**
- **A/B I-class items** — documented postures, each verified honest by the audits: the ADR-013
  in-band delivery (off-switches + the CB14 boot warning), the CB12 targeted-lockout trade-off,
  the no-CSP baseline (BU16), the dev/start tee exit-code masking, the BV6 unverified-re-register
  takeover (the S121 fix that made it deliberate), the register-signup-for-existing-verified-email
  verify-screen dead end (inherent to the anti-enumeration contract), the 403-unverified-copy
  email that never arrives (the I3 resend-affordance idea — an I-class UX candidate for a future
  cycle), the eslint broad disables (the documented posture with compensating controls).

---

## 2. The CF set — design

### CF1 (M) — the per-email register + resend budgets

**The defect.** `register/route.ts:39` checks only `register:${ip}` (10/15 min) — under the
legacy/unset XFF posture a forged per-request `x-forwarded-for` mints a fresh key per request,
so the budget is decorative for an attacker; every branch then burns `scryptSync` (the BX4
equalizer at :73, `hashPassword` at :99/:125) — a rotated-XFF flood is a single-worker CPU DoS
plus unbounded unauthenticated `User`/`VerificationToken` growth (the exact rationale BZ5
documented for the authed write budget). `resend-verification/route.ts:31` has the same shape
and mints unlimited live code rows for a known unverified email.

**The fix.** Mirror the CB12/BX2 per-ACCOUNT pattern with a per-EMAIL key — derived from the
request payload, never from DB state, so a 429 answers IDENTICALLY for known and unknown emails
(no enumeration oracle):

- `register/route.ts`: after `parseWith` + `normalizedEmail`, `checkRateLimit(\`registerAcct:${normalizedEmail}\`, 5)` → the family's own `rateLimitedResponse` 429 copy ("Too many registration attempts…") — checked BEFORE the findUnique and every scrypt burn.
- `resend-verification/route.ts`: after `parseWith`, `checkRateLimit(\`resendAcct:${email.toLowerCase()}\`, 5)` → the existing 429 copy — checked BEFORE the user lookup.

An attacker must now rotate EMAILS to reach the burn (each rotation still costs the per-IP check
when XFF is honest; the per-email key stops the same-email flood + the table growth dead).
**Pins (unit, tests/auth.test.ts + script-conventions census):** the budget census (both routes
carry the Acct keys, register's before the first scrypt site), the no-oracle shape (the Acct
check textually precedes every `findUnique`/`hashPassword`/`verifyPassword` in both files), and
the key-collision freedom (`registerAcct:`/`resendAcct:` join the documented family-prefix
table). No e2e burn leg — chunk 5 already rides 16 registers against the shared `register:local`
budget through unique XFF headers; a same-email burn leg would add interplay for no marginal
proof (the budget seam itself is unit-pinned and the 429 path is already e2e-proven on the
shared key).

### CF2 (M) — the `"local"` fallback posture made loud

**The defect.** `clientIp()` returns the constant `"local"` whenever the XFF policy yields no
usable header (explicit `TRUSTED_PROXY_HOPS=0`, absent header, or a short header under N≥1) —
every such request shares ONE bucket per family (`login:local`, `register:local`, …): 10
anonymous requests lock out sitewide auth for 15-minute windows. The per-ACCOUNT budgets
(CB12/BX2) contain the guessing-critical halves; the availability half is the direct-exposure
posture's inherent bound.

**The fix (the audit's alternative — the primary is infeasible, see §0):**
- `env-check.ts`: `directExposureProdWarning(env)` — TRUE iff `NODE_ENV=production` AND
  `TRUSTED_PROXY_HOPS` is explicitly `"0"` (the declared direct-exposure posture; the unset
  default is ambiguous at boot — a proxy may front it).
- `instrumentation.ts`: the boot `console.warn` naming the consequence (every per-IP auth budget
  shares one bucket; set the hop depth or front the app with a proxy that appends XFF) pointing
  at DEPLOYMENT.md.
- `DEPLOYMENT.md` §proxy: the shared-bucket consequence spelled out.
- `AGENTS.md`: the known-posture line.
- **Pins (unit, tests/env-check.test.ts):** the seam's truth table (prod+0 → true; prod+unset →
  false; dev+0 → false; prod+"1" → false) + the instrumentation wiring census.

### CF3 (L) — the reseed_e2e hard-target guard

**The fix.** `process.env.DATABASE_URL = "file:../db/e2e.db"` BEFORE the `PrismaClient`
construction (the schema-anchored relative URL targets `<repo>/db/e2e.db` — the global-setup
precedent), print the resolved absolute path before deleting, and the header comment stating the
script's contract. The operator's `.env` (custom.db) can no longer be reached from this script.

### CF4 (L) — the playwright posture env pinned

**The fix.** `playwright.config.ts` webServer.env: pin `SEED_DEMO: "1"`,
`DISABLE_IN_APP_OTP: ""`, `DISABLE_IN_APP_RESET: ""`, `TRUSTED_PROXY_HOPS: ""` (overriding any
operator-shell leakage — the AP2/AUTH_SECRET precedent extended to every posture var the suite's
green depends on). `tests/e2e/global-setup.ts`: pass `SEED_DEMO: "1"` explicitly in the seed env
(the demo account is auth.setup's login). **Pin (unit, script-conventions census):** the four
vars pinned in the config (a future refactor that drops one fails loudly).

### CF5 (L) — global-setup always-cold

**The fix.** `tests/e2e/global-setup.ts`: before the schema push — (1) the port guard (if
`:${E2E_PORT:-3100}` answers `/api/health`, find the pid by port, kill, escalate to SIGKILL,
re-check; refuse loudly if it survives — the run-cert-chunk.sh procedure inlined in Node via
`execSync`), then (2) `fs.rmSync(db/e2e.db, {force: true})`. `bun run test:e2e` now inherits the
cert path's ALWAYS-COLD doctrine (AGENTS.md S46) by construction; the aged-scratch-db failure
classes (day-boundary, fixed-id round-trip) can no longer reach the default runner.
**Pin (unit, script-conventions census):** global-setup carries the rm + the port guard (a
future simplification that drops the cold reset fails loudly).

### CF6 (L) — the run-cert-chunk exit honesty + the identical-chunks pin

**The fix.** `scripts/run-cert-chunk.sh`: capture `rc=${PIPESTATUS[0]}` after the playwright
pipeline, `exit "$rc"` (a grep that matches nothing can no longer false-RED a green run; a red
run still propagates). `tests/script-conventions.test.ts`: the machine pin asserts the two cert
scripts' `CHUNKS` arrays are byte-identical AND both carry the same topmost `Expected:` census
line (drift between the per-chunk runner and the censused map becomes a unit failure, the CE6
precedent extended).

### CF7 (L) — the OTP digest at rest + the timing-safe compare

**The defect.** `VerificationToken.code` stores the live 6-digit code verbatim
(`prisma/schema.prisma:74`) while `PasswordResetToken` stores a SHA-256 digest (BR6: "a DB read
must never yield a live account-takeover credential") — and a correct code both verifies AND
signs the caller in (`verify-email` sets the session cookie). The compare at
`verify-email/route.ts:84` is `token.code !== normalized` — the one secret compare in the
codebase that is not timing-safe.

**The fix.** The BR6 pattern applied to the OTP family:
- Store `hashResetToken(code)` (the existing SHA-256 helper) at both create sites (register:99,
  resend:52) — the response still carries the PLAINTEXT code (the ADR-013 in-band posture; only
  the at-rest form changes).
- `verify-email`: compare `timingSafeEqual(Buffer.from(token.code), Buffer.from(normalized))`
  — both sides are exactly-6-digit strings pre-hash; post-fix both sides are 64-char hex
  digests, equal length, the length guard first.
- The BV11a conditional consumption (`deleteMany` WHERE carries the code): pass the digest.
- `prisma/schema.prisma:74` comment: `// SHA-256 digest of the 6-digit OTP (CF7, the BR6 pattern)`.
- Migration honesty: existing rows hold plaintext codes that will never match a digest — the
  15-minute TTL bounds the impact to "resend once"; the re-register path already re-issues
  (BV6). Stated in the schema comment, no data migration.
- **Pins (unit, tests/auth.test.ts):** the hash round-trip (`hashResetToken(code)` verifies),
  the timing-safe compare census (verify-email carries `timingSafeEqual`), the no-plaintext
  census (no `verificationToken.create` site persists a raw `code` — both routes pass the
  digest), the schema comment pin. **e2e:** the register→verify journeys already prove the
  round-trip end-to-end (they read the response code and verify with it) — no new leg needed;
  the existing legs ARE the regression pins.

### CF8 (L) — the resend 429 honest copy

**The fix.** `login-surface.tsx` resend catch: branch on `err instanceof ApiError &&
err.status === 429` → `setStatus("Too many verification requests. Try again shortly.")` (the
route's own copy); the uniform-200 comment corrected (the endpoint DOES have one error surface
— the budget). **Pin (e2e, tests/e2e/auth-flows.spec.ts):** burn `resendAcct:${unique-email}`
5× via direct API POSTs riding a unique XFF (fresh per-IP bucket, no shared interplay — the
spec family's own technique), then the 11th-click shape: the UI Resend click surfaces the 429
copy, NOT the success line.

### CF9 (L) — the focus-restore visibility guard

**The fix.** `mobile-chrome.tsx` cleanup: `if (opener && document.contains(opener) &&
opener.checkVisibility()) opener.focus();` else fall back to the first sidebar nav link (the
now-relevant chrome at ≥lg) or `#main-content` when the sidebar is collapsed. **Pin (e2e,
tests/e2e/mobile-navigation.spec.ts):** open the drawer at 390px, resize to 1280px (the
breakpoint crossing closes the drawer), assert `document.activeElement` is the sidebar's first
nav link — pre-fix it is `body`.

### CF10 (L) — the dead-code sweep + the siteUrl self-heal

- Drop `setEmail(resetEmail || email)` (login-surface:258 — dead in the dominant full-page-load
  flow; the state does not survive the reload).
- Un-export `INVALID_CREDENTIALS`/`UNVERIFIED_COPY` (login/route.ts:23-25 — nothing imports
  them; the http.ts layering rule says route files cannot export shared symbols).
- `site.ts` `siteUrl()`: `URL.canParse(raw)` guard → the localhost fallback (a malformed
  `NEXT_PUBLIC_SITE_URL` currently throws at layout module scope — every route 500s). **Pin
  (unit, tests/site.test.ts — the existing seam file, already the siteUrl contract's home):** malformed → the fallback, valid → the value,
  unset → the default.

### CF11 (L) — the login-card hairline dark pair

**The live-measured settlement.** The reference's login page is LIGHT-ONLY (bodyBg white under
dark-OS emulation) — its hairline never renders dark, so there is no parity constraint; the
clone's own dark-OS login pin (session-11) creates the dark surface, and the clone's own dark
contract (globals.css S10-1) says the strip re-themes. **The fix:** replace the inline style
with the arbitrary-value class pair — `bg-[linear-gradient(to_right,#e2e8f0,#cbd5e1,#e2e8f0)]
dark:bg-[linear-gradient(to_right,#1e293b,#334155,#1e293b)]` — the exact sRGB stops kept (the
trap-5 convention), the dark stops the slate-800/700 divider family (the card's own
`border-slate-800` dark idiom). The hue-tokens raw-family residual register re-anchored with
the provenance (the CE9(5) precedent — the guard working as designed). **Pin (e2e,
tests/e2e/dark-mode.spec.ts):** dark-OS /login → the strip's computed background-image carries
the dark stops.

---

## 3. TDD plan (RED → GREEN) + census projection

**Unit RED (tests/auth.test.ts, tests/env-check.test.ts, tests/script-conventions.test.ts,
tests/site.test.ts):** ~14 pins — CF1 the budget census + the no-oracle shape + the
key-prefix table; CF2 the truth table + the wiring census; CF4/CF5/CF6 the config/setup/script
censuses; CF7 the round-trip + the three censuses + the schema comment; CF10 the siteUrl
matrix. **e2e RED (3 legs):** CF8 the 429 honest copy; CF9 the breakpoint focus restore; CF11
the dark hairline. RED verified for the right reasons against the pre-fix build, then GREEN on
the fixed tree.

**Census projection:** unit 1217 → **~1231** (45 files — the siteUrl pins land in the existing site.test.ts); e2e 567 → **~570** (chunk map
+0/+1/+1/+1/+0 → 146+180+73+94+77). The exact deltas recorded at GREEN; the cert-script
`Expected:` line + the vitest header + every census anchor re-tagged to the measured counts.

## 4. Deferrals → next-cycle register

B-L3 the scrypt KDF migration (format versioning + N decision + the dummy-hash regeneration —
a measured cycle of its own; the format pin at auth.test.ts:233 must be re-anchored as part of
it). B-L7 the Docker non-root runtime (needs the mounted-volume ownership verification — the
deploy axis). A-I3 the resend affordance on the 403-unverified sign-in state (the UX candidate).
B-L6's residual (the reuseExistingServer stale-build interplay is now guarded by CF5's port
kill; the build-freshness assertion remains an I-class idea).

## 5. Execution record

**RED (verified for the right reasons against the pre-fix build).** Unit **15 pins failing**:
CF1 ×3 (no registerAcct/resendAcct in the routes), CF7 census ×3 (the raw-code shorthand at
both mints, the `!==` compare, the schema comment), CF4/CF5 ×2 (no env pins, no cold reset),
CF6 ×1 (no PIPESTATUS exit), CF2 ×4 (no directExposureProdWarning — the import itself), CF10 ×2
(no canParse guard). The holds-green-by-design: CF6's identical-CHUNKS guard + CF7's behavior
pins (the digest function predates the cycle). e2e **3 legs failing for the right reasons**:
CF8 (the SUCCESS line rendered on the budget-exhausted resend — the defect live), CF11 (the
strip computed the light slate-200/300 stops on the dark card), CF9 (focus on `<body>` after
the lg crossing — the defect live, after one wrong-reason first run: the describe-outside-
beforeEach test never navigated — the BY10 blank-page lesson, navigated explicitly).

**GREEN (the source fixes).** CF1 the payload-keyed budgets (register after parse + before the
findUnique/scrypt; resend after parse + before the lookup); CF2 the seam + the boot warn;
CF3 the hard-target; CF4 the four env pins; CF6 the PIPESTATUS exit; CF7 the digest mints +
the timingSafeEqualBuffer seam (auth.ts) + the schema comment; CF8 the ApiError-429 branch;
CF9 the checkVisibility guard + the desktop-chrome fallback; CF10 the three sweeps; CF11 the
class pair.

**The honest mid-run corrections.** (1) **THE CF5 DESIGN CORRECTION** — the plan placed the
cold reset (port-guard + rm) in global-setup; the first GREEN attempt died with ECONNREFUSED
::1:3100: **Playwright boots the webServer BEFORE globalSetup** (empirically verified — the
global-setup port-guard killed the suite's own server, then rm'd + re-seeded under it). The
reset moved to `scripts/e2e-cold-reset.sh` chained into `test:e2e` BEFORE playwright boots —
the only pre-boot seam; global-setup keeps only the safe half (push + seed + the SEED_DEMO
pin), and the census pin asserts global-setup carries NO rm/port-kill (the same mistake cannot
return silently). (2) The CF7 schema pin's 200-char look-back window missed the inline column
comment — re-scoped to the column's own line. (3) The three e2e appends initially landed
outside their describes with an unbalanced trailing brace (tsc caught it) — wrapped per the
file conventions. (4) The CF9 first RED run timed out at the hamburger (the wrong-reason
class) — the explicit navigation added, the true RED (focus on `<body>`) confirmed after.

**The re-cert (cold, on the final tree).** lint ✓ (the CD3 rule active, zero violations) ·
`tsc --noEmit` ✓ · unit **1236/1236 (45 files — census 1217 → 1236, +19 exact:
script-conventions +10, env-check +4, site +3, auth +2)** · the canonical build green
(REAL_EXIT=0, foreground) · the cold 5-chunk e2e **570/570 — 147+179+72+94+78, every chunk
first-pass** · the register tripwire **249/130/0/119 — the exact hold (the 41st
consecutive)**. The live battery on the fresh-seeded daemon ALL GREEN — **the 38th
consecutive no-Tailwind-v4-bug confirmation** (the labeled hamburger 36×36 @ [16,14],
role=dialog + label, 288px, blur(4px) + oklab, 20 links, auto-close, /Notes clean 390=390,
scroll persistence 600→600, landscape 992>301) — plus the CF-cycle's own live verifications:
**CF9** focus on the sidebar's "Dashboard" link after the lg crossing (the deterministic
playwright-core probe; the agent-browser first probe was viewport-race noise — the e2e had
already proven the fix on the standalone build twice), **CF11** the dark stops
(rgb(30,41,59)/rgb(51,65,85)) computed on the dark login card, **CF7** the DB row stores
`01e0fa9f…` (the SHA-256 digest) while the plaintext code (456747) verifies and signs in —
the digest at rest and the round-trip both live. Three evidence frames in
`docs/screenshots/131-clone-*.png` (the mobile drawer; the dark login hairline; the desktop
dashboard), all verified non-blank. **Census: 1236 unit + 570 e2e = 1806 green.**

**Docs set (same commit):** README (the chunk-map lines + the badge 1806 + the S131 row),
AGENTS.md (the census anchors + the S46 self-cold note), PAD **v1.3.39** (the revision block +
the §8.1 rows + the Total 76/1807), the SKILL doc (the census anchors), the vitest header
(45/1236 + the S131/CF re-anchor block), the cert-script re-tags (the S131/CF block + Expected
570 + the CC2 pin re-tag), `.env.example` (the CF2 note on the TRUSTED_PROXY_HOPS block),
DEPLOYMENT.md (§3's shared-bucket note), this §5, the worklog Session-131 entry, and
`docs/session_133.md` (the record, the odd-increment convention: 123→125→127→129→131→133).

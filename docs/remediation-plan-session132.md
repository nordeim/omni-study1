# Remediation Plan — Session 132 / Batch CG (Cycle 82)

**Status: COMPLETE** (executed TDD-style 2026-11-03 — the verification record is §5;
the §5 below is the AS-EXECUTED record: the plan was drafted mid-session, the session
was cut off after the first RED pin batch landed on disk, and the continuation
re-derived the RED phase from scratch on the surviving tree before GREEN — every
divergence between the drafted §3/§5 and the executed reality is recorded inline)
**Date:** 2026-11-03 · **Workspace:** fresh clone of the Batch CF state (`56f80e8`) + the operator's
`9a1a182` (`docs/session_134.md`, the CF transcript). The workspace was REBUILT (sandbox recycle —
fresh `git clone`, `bun install`, chromium browsers re-installed, `db:push` + `db:seed`
re-executed; every baseline number re-derived on the fresh tree). **Audit-driven hardening
session** — the standing rhythm (audit the prior-batch diff, rotate two fresh-eyes deep audits,
re-certify cold).

---

## 0. Scope and Method

The operator directed the standing rhythm (the same charter as s125–s131): refresh the workspace,
re-read the doc chain (`AGENTS.md`, `CLAUDE.md`, `README.md`, `PAD`, `omni-study1_SKILL.md`,
`docs/session_133.md`, `docs/remediation-plan-session131.md`, `worklog.md`,
`docs/session_134.md`), re-validate against the codebase, audit with the repo skills as rubrics
(`skills/` excluded from checking/testing/compilation), iterate on visual + functional parity with
`https://omni-study1.base44.app/` (the mobile navigation menu the named focus, Tailwind v4 the
named suspicion class), keep the repo a production-ready functional SUPERSET with visual parity,
keep the `.env`/`db/` contract (`DATABASE_URL="file:../db/custom.db"`, `db/` at the repo root,
`.env.example` tracked + current), maintain the vitest + playwright suites (both config files
verified live this cycle: the fresh sandbox initially lacked the Playwright browser binaries —
`bunx playwright install chromium` — every "failure" in the first cert pass was the missing
binary, zero source defects), plan remediation for everything found, execute with TDD
(RED → GREEN), capture evidence under `docs/screenshots/`, update the docs chain, and commit +
push to `main` via the SSH wrapper.

Method (the six-phase workflow): ANALYZE → PLAN (this document) → VALIDATE (every M finding
re-verified by direct read BEFORE the plan; the live reference probe battery below) → IMPLEMENT
(smallest safe diff, TDD) → VERIFY (cold re-cert) → DOCUMENT.

### Baseline (cold, BEFORE any work)

lint ✓ · `tsc --noEmit` ✓ · unit **1236/1236** (45 files) · the canonical build green (exit 0,
foreground) · the cold 5-chunk e2e **570/570 — 147+179+72+94+78** (per-chunk via
`scripts/run-cert-chunk.sh`; chunk 3's first pass this cycle showed 71/72 — a self-inflicted
port-3100 collision from a concurrent foreground `playwright test` during the background cert run
(the tool-discipline lesson re-learned: NEVER run a foreground playwright command while a cert
chunk owns :3100); the clean re-run passed 72/72 first-pass) · the register re-derivation holds
via the passing `tests/script-conventions.test.ts` census (the 42nd consecutive hold) · the
Mode-C audit of the Batch CF diff (`56f80e8`, 38 files, +518/−78 across source/tests/config):
**all CF claims re-verified TRUE against the tree** (CF1's `registerAcct:`/`resendAcct:`
per-email budgets before every DB read/scrypt burn; CF2's `directExposureProdWarning` +
instrumentation wiring; CF5's `e2e-cold-reset.sh` chained into `test:e2e` before Playwright
boots; CF6's `PIPESTATUS[0]` exit; CF7's digest compare at `verify-email/route.ts:91-101` +
`timingSafeEqualBuffer`; CF9's `checkVisibility()` focus guard at
`mobile-chrome.tsx:112-123`; CF10's `URL.canParse` self-heal; CF11's login-card hairline) —
zero key material in the diff.

### Live parity (both hosts — agent-browser, mobile 390×844)

**Reference** (logged in `sepnetflix2023@outlook.com`): the standing battery held — the mobile
drawer panel **288px** (`w-72`), white, `z-50`, `shadow-2xl`, **no `role=dialog`**, backdrop
sibling **`bg-black/20 backdrop-blur-sm`** (v3 blur-sm = 4px), exactly **20 nav links**, close-X
at (228,26) 36×36 unlabeled, `animation: none` (instant open), nav **scrollHeight 992 >
clientHeight 744** (scrollable), drawer nav-click → URL change + drawer unmounts, desktop
sidebar **260px fixed glass** with main margin 260px. **Plus this cycle's reference-specific
probes:** (1) the reference drawer's body scroll stays `visible` while open (the clone's
`overflow: hidden` lock is a documented superset, not a parity delta); (2) the reference's
`shadow-2xl` computes `0 25px 50px -12px rgba(0,0,0,0.25)` — the clone's v4 composed utility
emits the four documented zero-alpha prefixes (trap 13) with the IDENTICAL final layer.

**Clone** (dev :3000, demo account): `node scripts/drawer-check-s14.mjs` → **DRAWER CHECK:
GREEN** (backdropMatch, panelWidthMatch, panelWhite, linkCountMatch, noFooter,
escapeCloseSuperset — all true) — the **39th consecutive no-Tailwind-v4 mobile-nav-bug
confirmation**. Agent-browser live walk: hamburger labeled + `aria-expanded` ✓, open lands focus
on the panel's Close button ✓, Escape closes + restores body scroll + returns focus to the
hamburger ✓, drawer "Tasks" link → `/Tasks` + drawer unmounts + "All Tasks" heading ✓, desktop
chrome 260/260 ✓.

### The audits (rotated fresh eyes — the s131 closing recommendation)

- **Audit A — the auth/crypto/infra axis** (login/register/verify/resend/forgot/reset/change
  family, `auth.ts`, `env-check.ts`, `site.ts`, `db-path.ts`, `server/auth.ts`, `http.ts`,
  schema): **0 Critical / 0 High / 2 Medium / 4 Low / 1 Informational**. The crypto core
  affirmed clean (timing-safe scrypt verify, HMAC session tamper/expiry/version rejection,
  conditional single-use token consumption, disciplined anti-enumeration shapes, bounded limiter
  memory).
- **Audit B — the FE/views/mobile axis** (shell, globals.css pins, mobile-chrome, sidebar,
  nav-items, router/store/theme/data/api seams, dashboard/myday/tasks/settings/flashcards/
  focustimer views + targeted reads of every view): **0 Critical / 0 High / 1 Medium / 6 Low /
  4 Informational**. Tailwind v4 trap compliance affirmed clean across all 13 traps (no
  `space-*`+margin sites, pins present, no removed v3 utilities); the mobile drawer contract
  affirmed clean (BS4/CF9 lifecycle, 20 links, scrollable nav, scroll lock, aria).

## 1. Findings → the CG set

| # | Finding | Severity | Fix |
|---|---------|----------|-----|
| CG1 | login's exhausted per-account branch returns the uniform 401 with ZERO scrypt work while the no-user branch burns — a timing account-existence oracle (reopens the BX4 class in the gated posture) | Medium | burn before the return |
| CG2 | the OTP digest at rest is unkeyed SHA-256 over a 10⁶ space — offline brute force < 1 s defeats CF7's stated guarantee in the `DISABLE_IN_APP_OTP=1` posture | Medium | HMAC-peppered digest seam |
| CG3 | forgot-password has NO per-email budget (its two siblings got CF1's `*Acct:` keys) — rotated-XFF flood supersede-DoS the victim's reset link + unauthenticated write churn | Medium | the CF1 pattern |
| CG4 | `directExposureProdWarning` compares the RAW string; `" 0"`/`"00"` parse to posture 0 without the warning | Low | normalize through the parse seam |
| CG5 | a boot where the pre-warm AND `loadAll` both fail leaves every view in false empty states with no error surface and no retry (the BT12 residual) | Medium | shell data-failure bar + Retry |
| CG6 | CE3 loading gates missing on Settings Subjects/Holidays tabs, Analytics (false zero-stats), Calendar empty messages | Low | the tasks-view idiom |
| CG7 | the three dashboard CTA anchors preventDefault unconditionally — ⌘/ctrl/middle-click cannot open in a new tab (the CA7 class NavItemLink already fixed) | Low | the modified-click guard |
| CG8 | the Splash gate-failure message renders with no `role="alert"` — invisible to AT (WCAG 4.1.3) | Low | one attribute |
| CG9 | THEME_BOOT_SCRIPT pairs hand-maintained name arrays with `Object.values` positionally — unpinned; a mid-object token insertion silently mis-maps every later var pre-paint | Low | derive + pin |
| CG10 | `TRUSTED_PROXY_HOPS≥1` presumes port isolation the docs never state — a directly-reachable app accepts a wholly forged XFF including the trusted hop | Low | DEPLOYMENT.md + .env.example note |
| CG11 | CF1's containment comment overstates: distinct-email floods pass every budget; one scrypt burn + two rows per request from a single host | Low | global register budget + honest comment |

**Deferred with documented rationale** → §4.

## 2. The CG set — design

### CG1 (M) — the login timing equalizer on the exhausted account bucket

`src/app/api/auth/login/route.ts:60-65`: the exhausted `loginAcct:` branch answers the uniform
401 immediately (no scrypt), while the no-user branch burns against `DUMMY_LOGIN_HASH` —
measured ~30-36 ms delta in this environment. The register route already equalizes the identical
asymmetry (its verified-exists branch burns). Fix: `verifyPassword(password, DUMMY_LOGIN_HASH)`
inside the exhausted branch BEFORE the return (the BX4 one-line pattern; response shape and
status unchanged — only the timing equalizes). Import `verifyPassword` + `DUMMY_LOGIN_HASH`
from `@/lib/auth`.

### CG2 (M) — the peppered OTP digest (the CF7 guarantee made real for a 10⁶ space)

`hashResetToken` stays for the 24-byte reset token (entropy sufficient). New seam in
`src/lib/auth.ts`: `hashOtpCode(code, secret = sessionSecret())` →
`createHmac("sha256", secret).update(code).digest("hex")` — deterministic (DB-matchable),
64-hex, and offline brute force now requires `AUTH_SECRET`, which a DB read does not include.
Three call sites flip: `register/route.ts` (`code: hashOtpCode(code)`),
`resend-verification/route.ts` (same), `verify-email/route.ts:91`
(`const presentedDigest = hashOtpCode(normalized)`). Pre-existing rows hold unkeyed-SHA digests
that never match an HMAC — bounded by the 15-min TTL + the resend path, exactly CF7's own rollout
(no data migration). The explicit `secret` parameter keeps the seam unit-pinnable (the
env-check precedent).

### CG3 (M) — the `forgotAcct:` per-email budget

`src/app/api/auth/forgot-password/route.ts`: after `parseWith` (email known), before the user
lookup — `checkRateLimit(`forgotAcct:${email.toLowerCase()}`, 5)`; on exhaustion answer the
SAME `NextResponse.json({ ok: true })` (uniform for known/unknown emails — the no-enumeration
shape the sibling keys establish). This bounds the supersede-DoS (each flood request
`deleteMany`s the victim's just-issued link) and the write churn.

### CG4 (L) — the warning/posture parse seam unification

Relocate `parseTrustedProxyHops` from `auth.ts` to `env-check.ts` (auth.ts re-exports it —
auth already imports from env-check, no cycle), and `directExposureProdWarning` decides through
the parser: `parseTrustedProxyHops(env.TRUSTED_PROXY_HOPS) === 0`. `" 0"`, `"00"`, `"-1"` then
all warn correctly (posture 0 / fail-closed).

### CG5 (M) — the boot data-failure surface (the BT12 residual closed)

`src/app/page.tsx`: track the first `loadAll()` result — `.then(() => setBootDataFailed(false),
() => setBootDataFailed(true))` (replacing the bare `.catch(() => {})`). When `bootDataFailed`,
render a non-blocking bar in the shell (fixed bottom-center, `role="alert"`, amber, z-[70] —
the connectivity-banner family) with honest copy and a **Retry** button that re-runs
`loadAll()` and clears the flag on success. The Splash gate still flips ready when `/api/auth/me`
+ pre-warm settle (ADR-014's contract untouched — a failed pre-warm never blocks the shell; the
pre-warm failure is healed by the loadAll that follows, so tracking loadAll alone is the honest
signal). New e2e pin: abort every `/api/*` route except `/api/auth/me` → the shell commits → the
bar appears → unroute + Retry → the bar clears.

### CG6 (L) — the CE3 gate sweep (Settings Subjects/Holidays, Analytics, Calendar)

The tasks-view idiom (`loading && X.length === 0 ? <Spinner/> : X.length === 0 ? <empty> …`)
applied at: `settings-view.tsx` SubjectsTab (~line 788) + HolidaysTab (~line 962);
`analytics-view.ts` (gate the stat row on `loading && tasks.length === 0 && grades.length === 0
&& subjects.length === 0`); `calendar-view.ts` (both empty messages gate on `loading &&
events.length === 0`). Spinner imported from the shared seam where missing.

### CG7 (L) — the CA7 modified-click guard on the three dashboard CTAs

`dashboard-view.tsx` `SectionLink` (~line 59-66), the "Start My Day" anchor (~line 178-188),
the overdue "View All" anchor (~line 208-218): add the NavItemLink guard —
`if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;` before
`e.preventDefault()`. E2e pin mirrors the CA7 pattern (synthetic ctrl-click; URL stays).

### CG8 (L) — the Splash error announcement

`page.tsx` Splash error container: add `role="alert"` (the S14 ambient-status convention; the
loading→error transition becomes announceable).

### CG9 (L) — the boot-script token derivation + pin

`src/lib/theme.ts`: replace the seven hand-maintained TOKENS arrays with ONE exported
`BOOT_TOKEN_SUFFIXES` list (the same 17 suffixes); the script embeds
`var SUFFIXES = ${JSON.stringify(BOOT_TOKEN_SUFFIXES)};` and the loop reads it. Pin in
`tests/theme-cache.test.ts`: for EVERY accent, the reconstructed var list
(`SUFFIXES.map(s => s === "primary" ? "--sf-primary" : "--sf-primary-" + s)`) deep-equals
`Object.keys(accentCssVars(accent))` — the positional alignment a mid-object insertion would
break now fails loudly. Plus the B-I11 one-line note in the globals.css trap-13 comment block
(`.dark` must stay on `<html>` — the plain-`@theme` runtime resolution coupling).

### CG10 (L) — the proxy-isolation documentation

`docs/DEPLOYMENT.md` (§2/§3 area) + `.env.example` TRUSTED_PROXY_HOPS comment: `TRUSTED_PROXY_HOPS
≥ 1` presumes the app port is reachable ONLY through the declared proxies (bind loopback /
internal interface or firewall it) — a directly-reachable app accepts a wholly forged
x-forwarded-for, including the trusted rightmost hop.

### CG11 (L) — the register global containment budget

`register/route.ts`: `checkRateLimit("registerGlobal:", 40)` (generous — the e2e fresh-user
journeys register ≤ 3 per chunk and each chunk re-boots the server, so the in-process bucket
never trips in tests) BEFORE the per-IP key; on exhaustion the honest 429 (this is a
volume-containment bucket, not an anti-enumeration one — a 429 here leaks nothing the per-IP
429 doesn't already). Plus the CF1 comment narrowed to state the residual honestly
(distinct-email floods bounded by the global bucket; adopt `TRUSTED_PROXY_HOPS≥1` before
exposure).

## 3. TDD plan (RED → GREEN) + census projection

RED pins (all fail against the CF state, all for the RIGHT reason):

- **Unit** (`tests/auth.test.ts`): CG2 family — `hashOtpCode` deterministic 64-hex;
  `hashOtpCode(x) !== hashResetToken(x)` (peppered); different secrets → different digests
  (the brute-force-resistance property); the register/resend/verify source census flips to
  `hashOtpCode`.
- **Unit** (`tests/script-conventions.test.ts`): CG1 — login source matches the
  exhausted-branch burn (`loginAcct:` … `DUMMY_LOGIN_HASH` … `errorResponse(401`); CG3 — the
  `forgotAcct:${…}` key census; CG11 — the `registerGlobal:` census.
- **Unit** (`tests/env-check.test.ts`): CG4 — `" 0"`/`"00"`/`"-1"` → warn TRUE; `"1"`/unset →
  FALSE (the parse-normalized truth table).
- **Unit** (`tests/theme-cache.test.ts`): CG9 — the positional-alignment pin.
- **E2e** (`tests/e2e/resilience.spec.ts`): CG5 — the aborted-boot bar + Retry cycle.
- **E2e** (`tests/e2e/navigation.spec.ts`): CG7 — ctrl-click on "View All" keeps the URL.
- **E2e** (`tests/e2e/auth-flows.spec.ts`): CG3 — the forgot 429 honest copy (per-email budget
  exhausted under distinct forged XFFs).
- **E2e** (`tests/e2e/resilience.spec.ts`): CG6 — the Settings Subjects spinner gate under a
  delayed `/api/subjects` (the representative site; the other three are the same idiom).

Census projection: unit 1236 → **~1246** (45 files); e2e 570 → **~574** (chunk map
148+179+74+94+78 — the byte-identical-CHUNKS pin updated in lockstep with
`scripts/e2e-chunked-cert.sh`, `scripts/run-cert-chunk.sh`, and the script-conventions census).

## 4. Deferrals → next-cycle register

- **B-L3 scrypt KDF parameter/versioning migration** (deferred the fourth time): the OWASP
  ≥2^17 N-raise is an availability trade-off needing a measured cycle of its own (format
  versioning + `DUMMY_LOGIN_HASH` regeneration + the `tests/auth.test.ts:233` pin re-anchor).
  This cycle's audits produced higher-priority fixes; the KDF seam itself re-audited clean.
- **B-L7 Docker non-root runtime** — needs the deploy-axis verification (no Docker daemon in
  the sandbox).
- **A-L5 resend/forgot ms-scale timing equalization** — the known/unknown branch DB-work
  asymmetry; statistical, ms-scale, gated-posture only. Documented acceptance (the route
  comments) rather than a no-op DB round-trip.
- **B-I8 drawer-link emission-order coupling** — currently renders as intended (zinc-50 wins);
  an explicit-override refactor risks visual churn for zero observable gain. Documented here.
- **B-I9 flashcards render-phase unlatch** — the React-documented guarded pattern, in-file
  documented; converts to the deferred-macrotask idiom only if StrictMode is ever enabled.
- **B-I10 iOS `overflow: hidden` scroll-lock nuance** — needs a physical device matrix.
- **A-I4 (from Finding 4)** — the signed-proxy-header (RFC 7239) posture: out of scope for a
  single-user self-hosted default; the documentation note (CG10) is the honest bound.

## 5. Execution record (as executed — the honest version)

**The interrupted-session continuation.** The plan was drafted at the end of a session that
was cut off mid-RED-phase: only the CG2 unit family (`tests/auth.test.ts` +4) had landed on
disk when the context died. The continuation re-verified the workspace (the tree, `.env`,
`db/`, the dev server all survived; the baseline re-derived: unit 1236/1236 pre-GREEN, lint ✓,
tsc ✓), then re-derived the FULL RED phase from the plan before touching any source: the
script-conventions census (CG1/CG3/CG11 + the CF7→hashOtpCode re-anchor), the env-check
truth table + relocation census (CG4), the theme-cache derivation pins (CG9), and the five
e2e pins (CG5, CG7 ×2, CG3, CG6).

**RED phase — every pin verified failing for the DESIGNED reason.** Unit: 16 pins RED
(auth 4 — `hashOtpCode is not a function`; script-conventions 6 — the census regexes miss
the absent keys AND the re-anchored CF7 legs miss the flipped seam; env-check 3 — the
truth-table rows fail on the raw-string compare, the relocation census fails, the parse-seam
import fails; theme-cache 3 — `BOOT_TOKEN_SUFFIXES` does not exist). E2e: 5 pins RED (CG3 —
the 6th forgot ask answered 200; CG7 ×2 — the synthetic ctrl-click NAVIGATED; CG5 — the bar
never rendered; CG6 — the false "No subjects yet" rendered live). All pre-existing pins stayed
green throughout the RED phase (the 1236 baseline minus nothing).

**GREEN phase** — the CG1–CG11 diffs applied in dependency order: CG4's parse relocation
first (env-check.ts hosts `parseTrustedProxyHops`; auth.ts imports + re-exports — the
server/auth.ts and client-ip.test.ts importers unchanged), then the auth trio CG1/CG2/CG3
(CG2 = the `hashOtpCode` seam in auth.ts + the three call-site flips + the schema comment),
CG11, the shell pair CG5/CG8 (the BootDataFailureBar + the tracked loadAll outcome + the
Splash `role="alert"`), the view sweeps CG6/CG7 (Settings ×2, Analytics, Calendar ×2; the
three dashboard CTA guards), the theme pair CG9 (BOOT_TOKEN_SUFFIXES + the script embed +
the globals.css B-I11 note) + the re-anchored S89/AP3/S90/AQ1 pins, the doc pair CG10
(DEPLOYMENT.md §2/§3 + .env.example).

**The honest mid-run corrections** (every divergence between the drafted plan and the
executed reality):

1. **CG3's exhausted shape — the plan §2 was WRONG, §3 was right.** The drafted §2 said the
   exhausted branch answers the uniform `NextResponse.json({ ok: true })`; the drafted §3
   (and the e2e pin already written to it) said the honest 429. The CF1 precedent settles it:
   `registerAcct:`/`resendAcct:` both ship the honest 429, and the CF8 finding proved the
   success-shape-on-429 is its own defect class (a user told a reset email is coming while
   the request was rejected). The payload-keyed budget keeps the no-oracle property either
   way (known and unknown emails burn identically). The route ships the honest 429; the
   census pin initially written for §2's shape was REWRITTEN to the 429 before GREEN, and
   the e2e pin's known+unknown legs prove the no-enumeration property live.
2. **The unit census projection was 1246; the executed census is 1251.** The CG4 block
   landed FOUR pins (truth table, silence rows, relocation census, re-run behavior pins),
   not three; script-conventions landed four NEW pins (the CG3 exhausted-shape leg counted
   separately); the recount is +15 (auth 4, script-conventions 4, env-check 4, theme-cache 3).
   1236 + 15 = **1251/1251 (45 files)**.
3. **The e2e census projection was 574; the executed census is 575.** CG7 landed TWO legs
   (the section-action "View All" AND the "Start My Day" hero CTA — two of the three guarded
   sites pinned directly; the overdue banner's View All renders conditionally and is covered
   by the same guard + the census). The chunk map: **149+179+74+94+79 = 575**, re-tagged in
   both cert scripts and the machine-enforced census pin.
4. **The hue-tokens residual register shifted 197 → 209.** The CG7 guard comments added
   twelve lines above the overdue icon chip; the line-anchored register caught the shift
   exactly as designed (the S95 precedent — the guard fires on a line move even when the
   site is untouched); re-anchored with the provenance.
5. **The S89/AP3 + S90/AQ1 pins re-anchored, not deleted.** The two s89/s90 pins guarded the
   SEVEN hand-maintained TOKENS arrays CG9 removed; their CONTRACT (the script's name list
   stays index-synced with accentCssVars, Object.values, and the literal insertion order)
   carries to the single BOOT_TOKEN_SUFFIXES list — the pins now assert the derived-list
   form (and the `not.toMatch(/var TOKENS/)` leg proves the hand-maintained era is gone).
6. **The capture-script port lesson.** The first evidence-capture attempt timed out on
   hydration — a fresh browser context carries no session, and /api/auth/me 401s straight to
   /login before the shell ever mounts; the drawer-check precedent's demo sign-in adopted.
   A second racing failure (route interception + goto over a live login page aborted the
   navigation itself) resolved by the API-level login on a fresh context (the cookie rides
   the context jar; no live page races the interception).

**Re-cert** — lint ✓ · `tsc --noEmit` ✓ · unit **1251/1251** (45 files) · the canonical build
green (foreground, exit 0) · the cold 5-chunk e2e **575/575 — 149+179+74+94+79** (chunk 2's
first run showed 178/179 — the S81/AH2a departed-Save choreography flaked under chunk load
[two failure toasts where one was expected; zero source overlap with the CG diff]; reproduced
GREEN standalone cold, and the clean chunk re-run passed 179/179 first-pass — the documented
flake class, same disposition as the s131 chunk-3 port-collision precedent) · the register
tripwire re-measured on the final tree (**250/131/0/119 — the 43rd consecutive hold; the +1 importer/+1 carrier over the prior 249/130 is THIS cycle's own
`capture-s132-evidence.mjs`, its Usage line documenting the node runner per the
S97/AX2 convention**) · the
live drawer battery re-run GREEN on the remediated tree (**the 40th consecutive
no-Tailwind-v4-mobile-nav-bug confirmation**) · three evidence frames under
`docs/screenshots/132-*` (the desktop dashboard, the mobile drawer, the NEW CG5
data-failure bar — the capture script's own `waitFor(visible)` + the passing e2e pin are the
machine proof the bar rendered).

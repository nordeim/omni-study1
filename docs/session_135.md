# Session 135 — Batch CG (Cycle 82): The Audit-Driven Hardening Cycle — The Exhausted-Bucket-Equalizer + Peppered-OTP + Forgot-Budget + Boot-Failure-Surface Set

> Record of worklog **Session-132 / Batch CG**. Workspace: the Batch CF state `56f80e8` + the
> operator's `9a1a182` (`docs/session_134.md`, the CF transcript) — the sandbox RECYCLED this
> time, so the tree was REBUILT (fresh `git clone`, `bun install`, chromium browsers
> re-installed, `db:push` + `db:seed` re-executed; every baseline number re-derived on the
> fresh tree). The session itself was INTERRUPTED mid-RED-phase (context exhaustion after the
> plan + the first RED pin batch landed); the continuation re-verified the surviving tree and
> re-derived the full RED phase before GREEN — the interruption and its recovery are part of
> this record. Plan + execution record:
> **`docs/remediation-plan-session132.md`**.

---

## 1. The baseline (cold, BEFORE any work)

The rebuilt tree re-certified before any change: lint ✓ · `tsc --noEmit` ✓ · unit
**1236/1236** (45 files) · the canonical build green (foreground, exit 0) · the cold 5-chunk
e2e **570/570 — 147+179+72+94+78** (per-chunk via `scripts/run-cert-chunk.sh`; the fresh
sandbox initially lacked the Playwright browser binaries — `bunx playwright install chromium`
— every "failure" in the first cert pass was the missing binary, zero source defects; and
chunk 3's first pass showed 71/72 from a self-inflicted port-3100 collision with a concurrent
foreground playwright run during the background cert — the tool-discipline lesson re-learned:
NEVER run a foreground playwright command while a cert chunk owns :3100; the clean re-run
passed 72/72 first-pass) · the register re-derivation **249/130/0/119** (the 42nd consecutive
hold) · the Mode-C audit of the Batch CF diff (`56f80e8`, 38 files): **all 11 CF claims
re-verified TRUE against the tree, zero key material** (CF1's `registerAcct:`/`resendAcct:`
budgets before every DB read/scrypt burn; CF2's warning + wiring; CF5's cold-reset chain;
CF6's PIPESTATUS exit; CF7's digest compare; CF9's `checkVisibility()` guard; CF10's
`URL.canParse` self-heal; CF11's hairline pair).

## 2. Live parity (both hosts — agent-browser, mobile 390×844)

**Reference** (logged in): the standing battery held — the mobile drawer panel **288px**
(`w-72`), white, `z-50`, `shadow-2xl`, **no `role=dialog`**, backdrop sibling
**`bg-black/20 backdrop-blur-sm`** (4px), exactly **20 nav links**, close-X unlabeled,
`animation: none` (instant open), nav scrollable, drawer nav-click navigates + unmounts,
desktop sidebar 260px fixed glass with main margin 260px. This cycle's reference-specific
probes: the reference drawer's body scroll stays `visible` while open (the clone's
`overflow: hidden` lock is a documented superset, not a parity delta); the reference's
`shadow-2xl` computes `0 25px 50px -12px rgba(0,0,0,0.25)` — the clone's v4 composed utility
emits the four documented zero-alpha prefixes (trap 13) with the IDENTICAL final layer.

**Clone** (dev :3000, demo account): `node scripts/drawer-check-s14.mjs` → **DRAWER CHECK:
GREEN** (backdropMatch, panelWidthMatch, panelWhite, linkCountMatch, noFooter,
escapeCloseSuperset) — the **39th consecutive no-Tailwind-v4 mobile-nav-bug confirmation** at
baseline. The agent-browser live walk: hamburger labeled + `aria-expanded` ✓, open lands focus
on the panel's Close button ✓, Escape closes + restores body scroll + returns focus to the
hamburger ✓, drawer "Tasks" → `/Tasks` + drawer unmounts + "All Tasks" heading ✓, desktop
chrome 260/260 ✓.

## 3. The audits (rotated fresh eyes — the s131 closing recommendation)

- **Audit A — the auth/crypto/infra axis** (login/register/verify/resend/forgot/reset family,
  `auth.ts`, `env-check.ts`, `site.ts`, `db-path.ts`, `server/auth.ts`, `http.ts`, schema):
  **0 Critical / 0 High / 2 Medium / 4 Low / 1 Informational**. The crypto core affirmed
  clean (timing-safe scrypt verify, HMAC session tamper/expiry/version rejection, conditional
  single-use token consumption, disciplined anti-enumeration shapes, bounded limiter memory).
- **Audit B — the FE/views/mobile axis** (shell, globals.css pins, mobile-chrome, sidebar,
  nav-items, router/store/theme/data/api seams, dashboard/myday/tasks/settings/flashcards/
  focustimer views + targeted reads of every view): **0 Critical / 0 High / 1 Medium / 6 Low /
  4 Informational**. Tailwind v4 trap compliance affirmed clean across all 13 traps; the
  mobile drawer contract affirmed clean (BS4/CF9 lifecycle, 20 links, scrollable nav, scroll
  lock, aria).

## 4. The CG set (TDD)

**RED**: 16 unit pins + 5 e2e pins, every one verified failing for the DESIGNED reason (the
census regexes miss the absent keys; the truth-table rows fail on the raw compare; the
derivation pin fails on the missing export; the e2e discriminators fail on the missing
bar/guard/gate/budget) — with the 1236 baseline otherwise green throughout.

**GREEN** (unit **1236 → 1251**, 45 files; e2e **570 → 575**, chunk map
**149+179+74+94+79**):

- **CG1 (M)** — login's exhausted `loginAcct:` branch answered the uniform 401 with ZERO
  scrypt work while the no-user branch burned `DUMMY_LOGIN_HASH`: a ~30-36 ms timing
  account-existence oracle (the BX4 class reopened on the CB12 bucket). The branch now burns
  `verifyPassword(password, DUMMY_LOGIN_HASH)` before the return — shape and status unchanged.
- **CG2 (M)** — the peppered OTP digest: the unkeyed SHA-256 over the 10^6 space was
  offline-brute-forceable in <1 s from any DB read, voiding CF7's guarantee.
  `hashOtpCode(code, secret = sessionSecret())` HMACs with AUTH_SECRET at both mints and the
  verify compare; the 24-byte reset token keeps `hashResetToken` (2^192 needs no pepper);
  pre-existing rows bounded by the 15-min TTL + re-issue (CF7's own rollout — no migration).
- **CG3 (M)** — the forgot per-email budget: the third sibling rode no `*Acct:` key — a
  rotated-XFF flood superseded the victim's just-issued reset link + write churn.
  `forgotAcct:${email}` payload-keyed 5/15-min before the lookup, answering the HONEST 429
  (the honest correction — see §6).
- **CG4** — the warning/posture parse-seam unification: `parseTrustedProxyHops` relocated to
  env-check (the single source; auth re-exports — no importer churn, no cycle), and
  `directExposureProdWarning` decides through the parser: `" 0"`, `"00"`, `"-1"`, `"two"` all
  warn now.
- **CG5 (M)** — the boot data-failure surface (the BT12 residual closed): the tracked
  loadAll outcome + the amber `role="alert"` bottom-center bar (the connectivity-banner
  family, z-[70], stacked at bottom-16 above the offline pill) with honest copy + a Retry
  that re-runs loadAll and clears on success.
- **CG6** — the CE3 gate sweep completed: Settings Subjects/Holidays tabs, the Analytics stat
  row (gated on `loading && tasks/grades/subjects all empty` — the S17 fresh-user
  fraction-value contract preserved), the Calendar's two empty messages.
- **CG7** — the CA7 modified-click guard mirrored on the three dashboard CTA anchors
  (SectionLink, "Start My Day", the overdue "View All"): ⌘/Ctrl/Shift/Alt/middle-click keeps
  the browser default again.
- **CG8** — the Splash gate-failure message carries `role="alert"` (WCAG 4.1.3).
- **CG9** — the boot-script token derivation: the seven hand-maintained per-accent TOKENS
  arrays (positionally paired with `Object.values`, unpinned — a mid-object insertion
  silently mis-mapped every later `--sf-primary-*` var pre-paint) replaced by ONE exported
  `BOOT_TOKEN_SUFFIXES` list embedded into the script; the per-accent positional alignment
  deep-equal-pinned in theme-cache.test.ts; the S89/AP3 + S90/AQ1 pins re-anchored (not
  deleted — their contract carries); the B-I11 note added to the globals.css trap-13 block.
- **CG10** — the proxy port-isolation documentation: DEPLOYMENT.md §2/§3 + `.env.example`
  (TRUSTED_PROXY_HOPS≥1 presumes the port is reachable only through the declared proxies).
- **CG11** — the register global containment budget: `registerGlobal:` 40/15-min before the
  per-IP key (distinct-email floods passed every CF1 key); the CF1 comment narrowed to state
  the residual honestly.

## 5. The re-cert

lint ✓ · `tsc --noEmit` ✓ · unit **1251/1251** (45 files) · the canonical build green
(foreground) · the cold 5-chunk e2e **575/575 — 149+179+74+94+79** (chunk 2's first run
showed 178/179 — the S81/AH2a departed-Save choreography flaked under chunk load, zero source
overlap with the CG diff; reproduced GREEN standalone cold + the clean chunk re-run 179/179
first-pass — the documented flake disposition) ·
the register tripwire re-measured **250/131/0/119** (the 43rd consecutive hold; the +1/+1
over the prior 249/130 is this cycle's own `capture-s132-evidence.mjs`, Usage line per the
S97/AX2 convention) · the live drawer battery re-run GREEN on the remediated tree — **the
40th consecutive no-Tailwind-v4-mobile-nav-bug confirmation** · three evidence frames under
`docs/screenshots/132-*` (the desktop dashboard, the mobile drawer, and the NEW CG5
data-failure bar — the capture script's own `waitFor(visible)` plus the passing e2e pin are
the machine proof the bar rendered). **Census: 1251 unit + 575 e2e = 1826 green.**

## 6. The honest mid-run corrections

1. **CG3's exhausted shape — the plan §2 was wrong, §3 was right.** The drafted §2 said the
   exhausted branch answers the uniform `{ok:true}`; the shipped answer is the honest 429 —
   the CF1 siblings' own shape (`registerAcct:`/`resendAcct:` both 429), and the CF8 finding
   proved the success-shape-on-429 is its own defect class. The payload-keyed budget keeps
   the no-oracle property either way (the e2e pin's known+unknown legs prove it live). The
   census pin initially written for §2's shape was rewritten to the 429 before GREEN.
2. **The unit census projection was 1246; the executed census is 1251** (the CG4 block landed
   four pins; the recount is +15: auth 4, script-conventions 4, env-check 4, theme-cache 3).
3. **The e2e census projection was 574; the executed census is 575** (CG7 landed TWO legs —
   the section-action AND the hero CTA, two of the three guarded sites pinned directly).
4. **The hue-tokens residual register shifted 197 → 209** (the CG7 guard comments moved the
   overdue icon chip's line; the line-anchored guard fired exactly as designed — re-anchored
   with the provenance).
5. **The S89/AP3 + S90/AQ1 re-anchor** (the pins guarded the removed hand-maintained arrays;
   the contract carries to the derived list — asserted against `BOOT_TOKEN_SUFFIXES` with the
   `not.toMatch(/var TOKENS/)` leg proving the hand-maintained era is gone).
6. **The capture-script port lessons**: a fresh browser context carries no session (the boot
   401s to /login before hydration — the drawer-check precedent's demo sign-in adopted); and
   route interception + goto over a LIVE login page aborted the navigation itself — resolved
   by the API-level login on a fresh context (the cookie rides the context jar).
7. **The background-cert process lesson**: the first nohup'd cert loop died silently with the
   invoking shell's process group (the log froze at the CHUNK 1 START line, zero playwright
   processes); `setsid` detaches the loop properly.

## 7. The docs set (same commit)

README (the badge 1826 + the census lines + the S132 row), AGENTS.md (the census anchors),
PAD **v1.3.40** (the revision block + the §8.1 Total row), the SKILL doc (the census
anchors), the vitest header (45/1251 + the S132 re-anchor block), the cert-script re-tags
(the S132/CG block + Expected 575 in both), `.env.example` (the CG10 port-isolation note),
DEPLOYMENT.md (§2 + §3 notes), the plan's §5 (the as-executed record), this record, and the
worklog entry.

## 8. Deferrals (documented, with rationale — the plan's §4)

The scrypt KDF parameter/versioning migration (the fifth deferral — an availability trade-off
needing a measured cycle of its own; the seam re-audited clean this cycle), the Docker
non-root runtime (needs the deploy-axis verification), the resend/forgot ms-scale timing
equalization (statistical, ms-scale, gated-posture only), the drawer-link emission-order
coupling (renders as intended), the flashcards render-phase unlatch (the React-documented
guarded pattern), the iOS scroll-lock nuance (needs a physical device matrix), and the RFC
7239 signed-proxy-header posture (out of scope for single-user self-hosted; the CG10 note is
the honest bound).

**Next cycle suggestion (the s131 closing rhythm): rotate the deep-audit axes again — the
data/import/export family and the entities/factory server family are the two axes last
deep-covered the earliest; the KDF migration remains the standing next-cycle candidate.**

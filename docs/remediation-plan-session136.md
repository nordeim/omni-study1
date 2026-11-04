# Remediation Plan — Session 136 / Batch CK (Cycle 86)

**Received state:** `ad0d8e7` (the Batch CJ state `fae26f9` + the operator's
session-log commit adding `docs/session_142.md`, the s135 record +
transcript).
**Scope:** the audit-driven hardening cycle — the login-containment +
files-race + CE3-residual + accent-literal set.

## 0. Scope and Method

The same standing method: cold baseline re-certified BEFORE any work; the
Mode-C audit of the received Batch CJ diff; the two ROTATED deep audits per
the s135 closing directive (the axes back onto the **auth/crypto/infra +
FE/views families** — the s134 axes, two cycles stale); every M/H finding
re-verified by direct read before this plan; live parity on BOTH hosts
before the plan; TDD (RED verified for designed reasons → GREEN →
re-factor); full cold re-cert on the final tree; the docs chain re-anchored
in the same commit. The repo `skills/` folder excluded from checking,
testing, and compilation throughout.

**Provenance note (the honest workspace record):** the sandbox recycled
TWICE this cycle — once before any work (the 27th continuation, fresh clone
at `ad0d8e7`, full re-provision), and once mid-execution AFTER the TDD
RED/GREEN work had landed but BEFORE any commit. The post-recycle
continuation re-applied the full designed changeset (every edit re-anchored
by exact-match assertion, re-verified gate-by-gate: unit 1344/1344 on the
first re-run), incorporating the two budget-side corrections the lost
incarnation had discovered live (§5 corrections 7–8). The audits, the live
parity batteries, the reference measurements, and the RED evidence were all
taken on the pre-recycle incarnation of the identical received tree; the
final gates were all re-run on the post-recycle tree.

### Baseline (cold, BEFORE any work — on the received tree)

The 27th workspace continuation — the sandbox reset; a fresh clone at
`ad0d8e7`, `bun install` (496 pkgs), `.env` re-created from the current
`.env.example` (`DATABASE_URL="file:../db/custom.db"`), `db/` re-pushed +
re-seeded, chromium-1243 re-provisioned, the dev daemon re-started
(preflight GREEN). Gates: lint ✓ · `tsc --noEmit` ✓ · unit **1332/1332**
(45 files) · the canonical build green · the cold 5-chunk e2e **588/588 —
150+183+76+94+85, every chunk first-pass**.

### Live parity (both hosts — agent-browser, mobile 390×844 + desktop 1280×800)

**Clone** — `drawer-check-s14` **GREEN — the 47th consecutive
no-Tailwind-v4-mobile-nav-bug confirmation** at baseline (backdropMatch,
panelWidthMatch, panelWhite, linkCountMatch, noFooter, escapeCloseSuperset).

**Reference** (logged in with the operator-provided reference account): the
standing battery held — the mobile drawer panel **288px** (`w-72`), white,
`animation: none` (instant open), `z-50`, backdrop **`rgba(0, 0, 0, 0.2)` +
`blur(4px)`**, exactly **20 nav links**, nav **scrollable (992/744)**, drawer
nav-click → `/Tasks` + the panel **unmounts**, desktop chrome **260/20/260
identical**. **The CK5 ground truth (NEW — the measurement for this cycle's
accent-literal family): the reference's first dashboard KPI icon block
computes `linear-gradient(to right bottom, rgb(139, 92, 246), rgb(79, 70,
229))`** — byte-identical to the clone's hardcoded value (the violet→indigo
accent pair); the 2nd/3rd icons measure blue/orange (the fixed categorical
palette — only the FIRST slot is accent-semantic). **The CK8 ground truth
(the false-positive measurement): the reference's own MyDay empty state
renders `H1 "My Day"` followed DIRECTLY by `H3 "Good morning!"`** — the
reference itself ships the heading-level skip, so the clone's h3 was exact
parity all along (this measurement was taken mid-execution, AFTER the
B-M7-driven h3→h2 change had broken the standing S9-B/Q parity pin — the
revert followed immediately; see §5 correction 6).

### The audits (rotated fresh eyes — the s135 closing directive executed)

**Mode-C (the Batch CJ diff `1bc4319..fae26f9`, 35 files, +1658/−115):
0 Critical / 0 High / 2 Low / 5 Info — all NINE CJ claims verified TRUE**
(censuses verified BY EXECUTION: the unit layer re-run green 1332/1332; the
per-file CJ arithmetic exact; the @theme utilities, the 18-var accent set,
the four view migrations, the existingIds discriminator, the relocation
record — all re-confirmed on the shipped tree). Zero key material in the
diff. **L-MC1**: the "@theme utility set grows six → eight" claim is a
MISCOUNT — it grew six → NINE (6 prior + 3 CJ3 additions: edge, softest,
empty); the comment + the live docs carry the wrong count. **L-MC2**: PAD
§8.1's per-file rows are stale (~S133-era counts) while the Total row
re-anchored and claims "per-file and script-derivable".

**Audit A — the auth/crypto/infra axis (fresh eyes): 0C / 1H / 1M / 5L /
6I.** The KDF migration, the session HMAC, the OTP/reset machinery, and the
anti-enumeration discipline re-verified sound (the maxmem claim re-proven
empirically on both runtimes; the timing-equalizer census, the bounded
limiter map, the boot-guard bands, the proxy-hop truth table all
re-confirmed). **A-H1**: `/api/auth/login` has NO global containment budget
— the `registerGlobal:` doctrine (S132/CG11) was never applied to login,
the endpoint where EVERY request burns the full synchronous scrypt pair
(~0.5 s measured, both runtimes); the per-IP key (`login:${ip}`) is
forgeable per request under the default TRUSTED_PROXY_HOPS-unset posture
(the FIRST x-forwarded-for hop); a flood of non-existent emails skips the
per-account bucket entirely (it only fires when the user exists) → ~2
rotated-XFF req/s starves the single worker for ALL routes. **A-M1**: the
session-cookie `httpOnly`/`sameSite`/`path`/`maxAge` attributes unpinned on
the SET path + the stale suite-verdict fixture ("30d Max-Age; secure is
NODE_ENV-gated" — the TTL is 7 days single-sourced, secure proxy-aware
since BU15). **A-L5**: verify-email does not re-check `emailVerified`
before consuming a token (the resend/verify race edge). The L/I remainder
documented with rationale (§4).

**Audit B — the FE/views axis (fresh eyes): 0C / 1H / 7M / 7L / 5I.** The
drawer contract, BS4/CF9/CA7/Trap-4, the CE3 idiom (15+ gated sites), the
mutations seam, and the 18-var accent set verified intact. **B-H1**:
files-view's private loader (the one view that bypasses the guarded
useDataStore seam) has NO out-of-order guard — `refresh()` (fired after
every mutation: delete/rename/upload) has no sequence ticket, so an older
in-flight GET settling after a newer one clobbers fresher state — the exact
S119/BT8→S128/CC9 class the main store fixed with `fetchSeq`, never ported
here; a just-deleted row resurrects and the retry 404s. **B-M1/M2/M3** (the
CE3 residual sweep): the dashboard's three section cards, the
gradetracker/focustimer/myday stat rows, the analytics partial gate, and
the aiassistant empty branch all render false empty-states/zeros during
in-flight loads. **B-M4**: the dashboard KPI "Today's Progress" icon
gradient HARDCODES the accent pair as inline hexes — invisible to the CJ3
register's class-pattern sweeps. **B-M5**: `.sf-canvas`'s dark branch
hardcodes the violet-900 wash — the most global surface in the app. **B-M6**:
the calendar recomputes 4 collection filters × 42 cells per render
(unmemoized at documented scale). **B-M7**: the MyDay amber empty state
skips h1→h3 (axe heading-order) — **later reclassified to the
documented-parity class by the reference measurement (a false positive; see
§5 correction 6)**. The L/I remainder: the dead `required`-under-
`noValidate` dialogs, unmemoized 500-item lists, aria-hidden spinners, the
dialog exit-animation remounts, the studygroups focus ring, the notes
Manage md-only cut, the redundant settings /me fetch, the I1 utility
miscount (cross-validating L-MC1), and the documented parity decisions
(SectionLink nesting, the mobile two-pane squeeze) — recorded, deferred
with rationale (§4).

Every M/H finding was re-verified by DIRECT READ on this tree before this
plan.

## 1. Findings → the CK set

| # | Source | Finding | Class |
|---|---|---|---|
| CK1 | A-H1 | login lacks the global containment budget (rotated-XFF scrypt CPU-DoS) | H |
| CK2 | B-H1 | files-view refresh() has no out-of-order ticket (deleted rows resurrect) | H |
| CK3 | A-M1 | session-cookie SET-path attributes unpinned + the stale suite-verdict fixture | M |
| CK4 | B-M1/M2/M3 | the CE3 residual sweep (dashboard cards, stat rows, aiassistant) | M |
| CK5 | B-M4 + B-M5 | the accent-literal pair (KPI gradient + .sf-canvas dark) + the inline-hex register sweep | M |
| CK6 | L-MC1 + B-I1 + MC-I1/I2 | the honest-docs family (six→nine, the "a decks" grammar, the CJ5 pin title) | L |
| CK7 | B-M6 | the calendar per-cell presence memoization | M |
| CK8 | B-M7 | the MyDay heading level — **executed then REVERTED by the reference measurement (a false positive)** | M |
| CK9 | L-MC2 | PAD §8.1 per-file rows regenerated (done LAST, after the final census lands) | L |
| CK10 | A-L5 | the verify-email emailVerified guard (defense-in-depth) | L |

## 2. The CK set — design

### CK1 (H) — the login global containment budget (A-H1)

Mirror the `registerGlobal:` doctrine (S132/CG11) onto login: a
process-wide `checkRateLimit("loginGlobal:", 40)` at the route head, BEFORE
the per-IP key, returning the SAME 429 copy the per-IP limit returns ("Too
many login attempts. Try again shortly.") — no distinguishable response
shape, no new oracle. The sizing comment mirrors register's own (4× the
per-IP budget). **The success-reset** (the progressive model extended to
the global budget): a successful login resets the global bucket alongside
the per-IP and per-account ones — only FAILED logins accumulate, and the
attack shape (all failures) never succeeds, so the containment still trips
at 40–41 consecutive failures while an interleaved legitimate burst never
inherits a flood's spend. The residual documented honestly in AGENTS.md's
auth line + DEPLOYMENT.md §3 (the register CG11 posture: a
volume-containment 429 leaks nothing the per-IP 429 doesn't already).

**The behavioral pin** (the register precedent's source-text-only pin,
IMPROVED — the S135 correction-8 lesson applied up front): an e2e leg that
reproduces the actual attack shape — 41 raw POSTs with ROTATED
`x-forwarded-for` TEST-NET headers (unique per request → each per-IP
bucket sees 1 < 10, only the global accumulates), on non-existent emails
(uniform 401s, no per-account bucket). Assert: the first POST answers the
uniform 401; the first 429 lands at global POST 40-or-41 with the honest
copy; POST 41 stays contained. **The terminal-position + clean-slate
design** (the two budget-side corrections, baked in): the pin lives as the
LAST test of the chunk's alphabetically-LAST file (s16-perf-parity.spec.ts
in chunk 3) — the spent bucket cannot be cleaned from the wire (a
post-flood login is itself gated; the lockout-by-design), so nothing after
the pin in its chunk may need a login; and the pin's FIRST action is one
successful demo login (the clean-slate pre-reset) so `first429` is exactly
41, deterministic regardless of chunk history. Plus the unit-layer
source-census pin (the registerGlobal pin's twin in script-conventions:
the `loginGlobal:` budget exists at the route head BEFORE the per-IP key,
and the success-reset exists).

### CK2 (H) — the files-view out-of-order ticket (B-H1)

Port the CC9 `fetchSeq` pattern into files-view's private loader: a
component-scoped `fileRowsSeq` ref (the React idiom for the store's
module-level seq); `refresh()` captures the ticket before the GET pair and
applies `setFolders`/`setFiles`/`setLoading` only when still latest; the
mount effect's existing `cancelled` flag stays (unmount) and additionally
respects the ticket (supersession). The BZ16 shared loader is untouched —
only the settle discipline changes. **The pins**: the unit source-censuses
(the ticket exists; captured before the GET; applied when latest; the
mount effect superseded too) + the standing files e2e family stays green
(the refactor is behavior-preserving in the serialized case).

### CK3 (M) — the session-cookie SET-path pins + the stale fixture (A-M1)

(1) Four behavioral unit pins in secure-cookie.test.ts (the clear-cookie
NextResponse form): `httpOnly === true`, `sameSite === "lax"`, `path ===
"/"`, `maxAge === SESSION_TTL_SECONDS` (the 7-day lockstep). (2) The
behavioral e2e leg in auth.spec: a real UI login → `context.cookies()`
(Playwright reads httpOnly cookies) → assert the family on the SET path.
(3) The stale suite-verdict fixture string corrected: 30d → the 7-day TTL
single-source wording, "NODE_ENV-gated" → "proxy-aware (BU15)".

### CK4 (M) — the CE3 residual sweep (B-M1/M2/M3)

The CG6 idiom extended to the missed sites, one gate shape everywhere:
`loading && <primary source empty> → <Spinner/>` (never the false
empty-state / false zero). Sites: the dashboard's three section cards
(today's tasks / upcoming exams / upcoming assignments — each gates on its
OWN collection); the gradetracker summary grid (**the OR-form** — either
primary source empty during load means the row is untrustworthy; the
settled zero still renders AT ZERO, the S17 contract); the focustimer stat
row; the myday progress card (the loading branch before the amber empty —
**the h3 greeting stays h3, the CK8 revert**); the analytics gate widened
to the six stat families the row renders; the aiassistant empty-transcript
branch (`!loading &&` joins the condition). **The pins**: two e2e legs
(the CG6 held-route precedent): the held assignments/exams dashboard gate
and the held grades gradetracker gate.

### CK5 (M) — the accent-literal pair + the register's inline-hex sweep (B-M4/M5)

The CJ3 doctrine extended from class-name literals to INLINE-STYLE
literals — the census's systemic blind spot (both audits' lesson). (1) The
KPI gradient: `rgb(var(--sf-primary)), rgb(var(--sf-primary-gradient-to))`
— byte-identical under violet (the reference's own measured value),
re-themes under the 6 non-violet accents; the 2nd/3rd/4th KPI blocks stay
fixed categorical (blue/orange/pink — measured on the reference). (2) The
`.sf-canvas` dark third stop: `rgb(var(--sf-primary-soft-dark) / 0.12)` —
the raw-rgb alpha convention the file itself documents (the sf-today-tint
precedent), byte-identical at violet. (3) **The register widening**: the
hue-tokens negative sweep gains an inline-hex leg — component code must
carry ZERO `rgb(139, 92, 246)` / `rgb(79, 70, 229)` / `rgb(76 29 149`
literals (the accent-pair + violet-900 shapes, both serial forms), with
the comment-line discriminator (the S92/AS1 quote-adjacency doctrine —
prose value-notes are documentation, not sites); plus the two consumer
pins (the KPI token pair, the canvas soft-dark wash). **The pin**: the e2e
accent discriminator (the CJ3 precedent's twin, in theme-system): under
the blue accent, the first KPI icon's computed `backgroundImage` reads the
blue pair while the categorical siblings stay fixed — measured via the
settings-API accent switch + reload + computed style, the violet restored
in the finally.

### CK6 (L) — the honest-docs family (L-MC1 + B-I1 + MC-I1/I2)

The "six → eight" miscount corrected to "six → NINE" at the three LIVE
sites (the globals.css comment, the README S135 row, the PAD v1.3.43 block
— each with the dated correction marker; the historical session records
stay as-written, the correction recorded in the current cycle's records).
The CJ4 400 grammar: "a decks in this backup" → "an existing deck in this
backup". The CJ5 unit leg's title reworded to what it asserts.

### CK7 (M) — the calendar presence memoization (B-M6)

A single `useMemo` keyed on the four collections building a by-day bucket
map in ONE pass (tasks/assignments/exams bucketed by calendar day; the
recurring weekday classes as a per-weekday set), consumed by the 42-cell
grid (each cell's presence + dotCount read from the map). The day-detail
panel keeps the single-day callbacks (5 reads, not the hot path).
Behavior-preserving (Mode-D): the standing calendar e2e family is the
characterization net — zero output change, the O(cells × collections)
iteration collapses to O(cells + collections).

### CK8 (M — executed, then REVERTED by the reference measurement) — the MyDay heading level (B-M7, a false positive)

The amber empty state's `h3` → `h2` was implemented per the axe
heading-order rule — and the standing S9-B/Q parity pin failed in the
first re-cert (the pin asserts the reference-measured level 3). The LIVE
reference measurement settled it: **the reference itself renders `H1 "My
Day"` followed directly by `H3 "Good morning!"`** — the reference ships
the level-skip, the clone's h3 was exact parity all along, and the audit
finding was a false positive of the generic-rule class. The change
REVERTED; the S9-B/Q pin stands as the guard; the finding reclassified to
the documented-parity class (the SectionLink L7 precedent — recorded, not
actioned). Lesson recorded in AGENTS.md: an a11y finding on a
reference-measured parity surface needs the reference measurement BEFORE
the fix.

### CK9 (L) — the PAD §8.1 regeneration (L-MC2, executed LAST)

The per-file rows regenerated from the live tooling at re-cert time (after
CK1–CK8's census delta lands): every row re-counted, the missing 45th unit
file (overlay-animation.test.ts) added, the Total row re-anchored, and the
"per-file and script-derivable" claim made true of the shipped table.

### CK10 (L) — the verify-email emailVerified guard (A-L5)

One guard at the top of the token-consuming branch: `if (user.emailVerified)
return uniform-400` (the same uniform shape the invalid-code path returns —
no new oracle) — closes the resend/verify race edge AND saves the token
query on the common path. **The pin**: the unit source census (the guard
present before the token lookup).

## 3. The TDD pins (RED design — the projection)

**Unit (~+12):** script-conventions +2 (the loginGlobal source census +
the success-reset census; the emailVerified guard census); data-store +3
(the files-view loader sequence censuses); secure-cookie +4 (the SET-path
attribute family); hue-tokens +3 (the inline-hex register). **E2E (+5,
the designed map):** chunk 2 +1 (the CK5 accent discriminator in
theme-system); chunk 3 +3 (the CK1 flood in s16-perf-parity [the terminal
home] + the CK4×2 gate legs in resilience); chunk 5 +1 (the CK3 cookie leg
in auth.spec). **Projected chunk map: 150 + 184 + 79 + 94 + 86 = 593.**
Every pin RED-verified for the designed reason before its GREEN lands
(the RED evidence was taken on the pre-recycle incarnation of the identical
tree); the guardrails hold (no test weakened, no lint/type rule loosened,
no expected-number fudged — the re-tags happen only after the green run).

## 4. Deferrals (documented, with rationale)

- **A-I-1 (HKDF domain separation)** — the shared AUTH_SECRET between the
  session HMAC and the OTP pepper: message spaces disjoint, no known
  cross-protocol attack; the honest fix is an HKDF subkey derivation at the
  NEXT crypto-family touch (the audit's own recommendation), not a rushed
  key-rotation inside a hardening cycle.
- **A-L-3 (Cache-Control: private, no-store on user-bearing JSON)** —
  standard hardening, Reasoned-severity, no demonstrated intermediary in
  any documented posture; batched with the next API-surface cycle.
- **B-L1 (the dead `required` under `noValidate` ×7 dialogs)** — functional
  (the server validates; the role=alert box surfaces the zod copy); the
  CB17 trim-guard port is a UX-consistency sweep of its own.
- **B-L2 (unmemoized 500-item lists)** — scale-conditional perf debt; the
  CK7 calendar memo is this cycle's representative; the list-family pass
  (TaskRowCard memo, the by-deck count map, the row-level tag parse) next.
- **B-L3 (aria-hidden spinners, no live region)** — a cross-cutting
  a11y-idiom change (the calculator role="status" precedent everywhere);
  batched with the next a11y cycle.
- **B-L4 (the dialog key-remount exit animations ×6)** — an unpinned
  visual contract; needs the enter+exit pin pair designed together.
- **B-L5/L6 (the studygroups focus ring; the notes Manage md-only cut)** —
  consistency polish + a deliberate-cut documentation pass.
- **A-L-1/L-2/L-4, A-I-2..6, B-I2..5** — the documented postures and
  parity decisions (recorded in the audit records above; no action this
  cycle).

## 5. The as-executed record

**RED (verified for the designed reasons, on the pre-recycle incarnation
of the received tree).** Unit — 8 defect pins failing: the loginGlobal
source census (no budget existed); the emailVerified guard census (no
guard existed); the files-view sequence censuses ×3 (no ticket); the
inline-hex sweep + the KPI token-pair consumer + the sf-canvas wash ×3
(the literals present, the token forms absent). The CK3 cookie family
landed GREEN as designed (the missing-test expectation — the attributes
were correct). E2E — 5 defect pins failing: the CK1 flood (all 41 POSTs
answered the uniform 401 — the vulnerability itself, `first429 = 0`); the
CK4 dashboard gate ("No upcoming exams" rendered on held data); the CK4
gradetracker gate ("Overall Average 0%" rendered on held grades); the CK5
discriminator (the hardcoded violet pair under the blue accent — computed
`rgb(139, 92, 246), rgb(79, 70, 229)`); the CK8 level-2 query (the h3
found nothing). The CK3 e2e leg GREEN (the coverage expectation).

**GREEN.** CK1 login/route.ts (the loginGlobal block + the success-reset +
the sizing comment); CK10 verify-email (the guard); CK2 files-view (the
fileRowsSeq ref + both settle paths); CK3 (the 4 behavioral pins + the
fixture corrected); CK4 (dashboard ×3 + gradetracker OR-form + focustimer
+ myday + analytics widened + aiassistant); CK5 (the gradient token pair +
the canvas soft-dark token + the register widening with the comment-line
discriminator); CK6 (globals.css + README + PAD miscounts, the grammar, the
title); CK7 (the by-day presence map); CK8 (h3→h2 — REVERTED, correction 6
below); CK9 (the §8.1 regeneration, executed last on the final census).
Unit **1332 → 1344** (+12: script-conventions +2, data-store +3,
secure-cookie +4, hue-tokens +3) · e2e **588 → 593** (+5: chunk 2 +1
[CK5], chunk 3 +3 [CK1 in s16 + CK4×2], chunk 5 +1 [CK3]).

**The honest mid-run corrections (the full ledger, including the two the
lost pre-recycle incarnation discovered live and the post-recycle redo
baked in):**

1. The gradetracker gate's first draft required grades AND subjects empty
   — the pin holds ONLY `/api/grades`, so subjects landed and the AND never
   fired; the OR-form is the fix (either primary source empty during load
   = the row is untrustworthy; the settled zero renders AT ZERO, a
   different branch).
2. The CK4 analytics widening shifted the CJ3 register's line anchors (the
   chip 414 → 423) — the register re-anchored (the line-shift convention).
3. The inline-hex sweep's first draft flagged settings-view.tsx:234 — a
   COMMENT documenting the sf-chip-dark wash value (prose, not a site);
   the sweep gained the comment-line discriminator (the S92/AS1
   quote-adjacency doctrine).
4. The CK2 pin title corrected from "module-level" to the component-scoped
   ref form (the correct React idiom).
5. The unit census landed at +12 vs the ~+8-10 projection (the CK3 family
   took four behavioral legs).
6. **The CK8 REVERT — the cycle's own fix was wrong and the standing pin
   caught it.** The h3→h2 change (audit B-M7, the axe heading-order rule)
   broke the S9-B/Q parity pin in the first re-cert's chunk 2; root-caused
   by LIVE measurement on the reference (the empty reference account
   renders H1 "My Day" followed directly by H3 "Good morning!" — the
   reference itself ships the level-skip); the change reverted, the s17
   leg withdrawn, the census re-tagged 594 → 593, the full re-cert re-run
   on the corrected build. Audit B-M7 reclassified as the
   documented-parity class (the SectionLink L7 precedent). Lesson: an
   a11y finding on a parity surface needs the reference measurement
   BEFORE the fix — the generic rule never overrides the measured
   contract.
7. **The loginGlobal success-reset.** The first draft reset neither bucket
   state on success: the e2e chunk-5 login census (the budget/429 specs'
   own failed attempts — all failures, never reset) accumulated past 40
   mid-chunk and 429'd eleven subsequent login-flow tests (auth.spec's
   sign-ins, s24/s25/s26's flows). The fix extends the progressive model
   to the global bucket — a successful login resets it; the attack shape
   never succeeds, so the containment still trips at 40–41 consecutive
   failures.
8. **The flood pin's terminal position + clean-slate pre-reset.** The
   first draft lived mid-chunk in resilience.spec.ts — under Playwright's
   alphabetical file scheduling the flood ran BEFORE s16-perf-parity's own
   login-bearing tests, and the spent bucket poisoned them (a post-flood
   login is itself gated — the lockout-by-design, so no wire-side cleanup
   exists). The fix: the pin moved to its chunk's TERMINAL position (the
   last test of s16-perf-parity.spec.ts, the alphabetically-last file) and
   its FIRST action is one successful demo login — the clean-slate
   pre-reset that zeroes the bucket, making `first429` exactly 41,
   deterministic regardless of chunk history. Verified: the full chunk-3
   slice passes 79/79 with the flood as test #79.

**The re-cert (the FINAL tree, post-recycle redo).** lint ✓ · `tsc
--noEmit` ✓ · unit **1344/1344** (45 files, first run on the re-applied
tree) · the canonical build green · the cold 5-chunk e2e **593/593 —
150+184+79+94+86, every chunk first-pass** · the six new e2e pins verified
GREEN standalone before the cert · the register tripwire
**254/135/0/119** (the 47th consecutive hold; the expectation stated
BEFORE the measurement [253/134 + this cycle's one capture-script rider]
and holding exactly) · the live drawer battery GREEN on the remediated
tree — the **48th consecutive no-Tailwind-v4-mobile-nav-bug confirmation**
· three evidence frames in `docs/screenshots/136-clone-*` (the desktop
dashboard, the mobile drawer, the CK5 accent-gradient surface — the
capture script's own computed-gradient waitForFunction [the blue pair
under the blue accent, via the REAL settings-API switch, the violet
restored in the finally] + the passing CK5 e2e discriminator the machine
proof; pixel-stat-verified non-blank). **Census: 1344 unit + 593 e2e =
1937 green.**

**The docs set.** README (the badge 1937 + the census lines + the S136
row + the S135-row miscount correction), AGENTS.md (the census anchors +
the auth line's loginGlobal residual + the six S136 lessons), PAD v1.3.44
(the revision block + the §8.1 regeneration + the v1.3.43 miscount
correction), the SKILL doc (the census anchors), the vitest header
(45/1344 + the S136/CK re-anchor block), the cert re-tags (the S136/CK
block + Expected 593 in both + the script-conventions Expected pin),
DEPLOYMENT.md (the loginGlobal residual note), this §5,
`docs/session_143.md`, and the worklog entry.

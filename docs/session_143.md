# Session 143 — Batch CK (Cycle 86): the audit-driven hardening cycle — the login-containment + files-race + CE3-residual + accent-literal set

**Received state:** `ad0d8e7` (the Batch CJ state `fae26f9` + the operator's
session-log commit adding `docs/session_142.md`, the s135 record +
transcript). **Scope:** the audit-driven hardening cycle per the s135
closing directive — the deep-audit axes rotated back onto the
**auth/crypto/infra + FE/views families** (the s134 axes, two cycles stale).

**Provenance note (the honest workspace record):** the sandbox recycled
TWICE this cycle — before any work (the 27th continuation, fresh clone) and
once mid-execution AFTER the RED/GREEN work but BEFORE any commit; the
post-recycle continuation re-applied the full designed changeset with the
two budget-side corrections (§6 items 7–8) baked in, re-verified gate by
gate. The audits, the reference measurements, and the RED evidence predate
the recycle (identical received tree); every final gate re-ran post-recycle.

## 1. The workspace + the cold baseline

The 27th workspace continuation — the sandbox reset; a fresh clone at
`ad0d8e7`, `bun install` (496 pkgs), `.env` re-created from the current
`.env.example` (`DATABASE_URL="file:../db/custom.db"` — the contract, `db/`
at the repo root), `db/` re-pushed + re-seeded, chromium-1243
re-provisioned, the dev daemon re-started (preflight GREEN).

The baseline re-certified cold BEFORE any work: lint ✓ · `tsc --noEmit` ✓ ·
unit **1332/1332** (45 files) · the canonical build green · the cold
5-chunk e2e **588/588 — 150+183+76+94+85, every chunk first-pass**.

## 2. The audits

**Mode-C (the Batch CJ diff `1bc4319..fae26f9`, 35 files, +1658/−115):
0 Critical / 0 High / 2 Low / 5 Info — all NINE CJ claims verified TRUE**
(censuses verified BY EXECUTION; zero key material in the diff). The two
Lows: **L-MC1** the "@theme utility set grows six → eight" claim is a
miscount — it grew six → NINE; **L-MC2** PAD §8.1's per-file rows are stale
while the Total row claims "per-file and script-derivable".

**Audit A — the auth/crypto/infra axis (fresh eyes): 0C / 1H / 1M / 5L /
6I.** The s134 KDF migration, the session HMAC, the OTP/reset machinery,
and the anti-enumeration discipline re-verified sound. **A-H1**: login has
NO global containment budget — the `registerGlobal:` doctrine (S132/CG11)
never applied to the endpoint where EVERY request burns the full
synchronous scrypt pair (~0.5 s measured); the per-IP key is the forgeable
FIRST x-forwarded-for hop, and a flood of non-existent emails skips the
per-account bucket → a rotated-XFF CPU-DoS on the single worker. **A-M1**:
the session-cookie SET-path attribute family unpinned + the stale
suite-verdict fixture. **A-L5**: the verify-email emailVerified race edge.

**Audit B — the FE/views axis (fresh eyes): 0C / 1H / 7M / 7L / 5I.** The
drawer contract, BS4/CF9/CA7/Trap-4, the CE3 idiom, the mutations seam,
and the 18-var accent set verified intact. **B-H1**: files-view's private
loader has NO out-of-order ticket (the CC9 fetchSeq class never ported —
a just-deleted row resurrects, the retry 404s). **B-M1/M2/M3** the CE3
residual sweep. **B-M4/M5**: the KPI gradient + .sf-canvas dark wash
hardcode the accent — invisible to the CJ3 register's class-pattern sweeps
(the census's systemic blind spot). **B-M6**: the calendar O(cells ×
collections) sweep. **B-M7**: the MyDay zero-state heading level — later
reclassified to the documented-parity class by the reference measurement
(a false positive; §6 item 6).

Every M/H finding re-verified by DIRECT READ before the plan.

## 3. Live parity (both hosts — agent-browser, mobile 390×844 + desktop 1280×800)

**Clone** — `drawer-check-s14` **GREEN — the 47th consecutive
no-Tailwind-v4-mobile-nav-bug confirmation at baseline** (and the **48th**
on the remediated tree at re-cert).

**Reference** (logged in with the operator-provided reference account): the
standing battery held — the 288px panel, `animation: none`, the blur(4px) +
rgba(0,0,0,0.2) backdrop, exactly 20 links, the scrollable nav (992/744),
nav-click → `/Tasks` + unmount, desktop 260/20/260 identical. **The CK5
ground truth (NEW): the reference's first dashboard KPI icon computes
`rgb(139, 92, 246), rgb(79, 70, 229)`** — byte-identical to the clone's
hardcoded accent pair (the 2nd/3rd measure blue/orange — the fixed
categorical palette; only the FIRST slot is accent-semantic). **The CK8
ground truth (the false-positive measurement): the reference's MyDay empty
state renders H1 followed directly by H3** — the reference itself ships the
level-skip; the clone's h3 was exact parity all along.

## 4. The CK set (TDD — 8 unit + 5 e2e defect pins verified RED for the
right reasons, plus the coverage pins [the CK3 cookie family] landing
green on current code, the designed expectation for a missing-test
finding; unit 1332 → 1344 [45 files], e2e 588 → 593 [150+184+79+94+86])

- **CK1 (H — A-H1)** the login global containment budget: the process-wide
  `loginGlobal:` 40/15-min bucket at the route head BEFORE the per-IP key,
  the IDENTICAL 429 copy (no new oracle), **plus the success-reset** (the
  progressive model extended to the global budget — only FAILED logins
  accumulate; the attack shape never succeeds). The behavioral pin improves
  on the register precedent (source-text only there): the e2e leg
  reproducing the actual attack shape — 41 rotated-TEST-NET-XFF POSTs on
  non-existent emails, RED pre-fix all 41 answering the uniform 401 (the
  vulnerability itself), GREEN the first 429 at global POST 40-or-41 with
  the honest copy. **The pin is TERMINAL by design** (the last test of
  s16-perf-parity, the chunk's alphabetically-last file — the spent bucket
  cannot be cleaned from the wire) **with the CLEAN-SLATE pre-reset** (one
  successful demo login zeroes the bucket first — first429 exactly 41,
  deterministic). Plus the unit source-census twin.
- **CK2 (H — B-H1)** the files-view out-of-order ticket: the CC9 fetchSeq
  idiom ported to the private loader (a component-scoped `fileRowsSeq` ref;
  refresh() captures the ticket BEFORE the GET pair and applies only when
  still latest; the mount effect respects the SAME ticket alongside its
  cancelled flag). Pinned by the three data-store source censuses.
- **CK3 (M — A-M1)** the session-cookie SET-path pins: FOUR behavioral unit
  legs (the clear-cookie NextResponse form — httpOnly, sameSite-lax,
  path=/, the TTL maxAge) + the e2e wire leg (a real UI login →
  `context.cookies()` — Playwright reads httpOnly cookies) + the stale
  suite-verdict fixture corrected in place with the dated note.
- **CK4 (M — B-M1/M2/M3)** the CE3 residual sweep, the CG6 idiom extended:
  the dashboard's three section cards (each gates on its own collection),
  the gradetracker summary grid (the OR-form — either primary source empty
  during load), the focustimer stat row, the myday loading branch, the
  analytics gate widened to its six stat families, the aiassistant
  `!loading &&` guard. Pinned by two resilience held-route e2e legs.
- **CK5 (M — B-M4+B-M5)** the accent-literal pair + the register's
  inline-hex widening (the census's systemic blind spot, both audits'
  lesson): the KPI gradient → `rgb(var(--sf-primary)),
  rgb(var(--sf-primary-gradient-to))` (byte-identical at violet; the
  categorical siblings stay fixed), the `.sf-canvas` dark wash →
  `rgb(var(--sf-primary-soft-dark) / 0.12)` (the sf-today-tint precedent),
  the hue-tokens inline-hex negative sweep (with the comment-line
  discriminator — the S92/AS1 quote-adjacency doctrine) + the two consumer
  pins + the theme-system e2e discriminator (the CJ3 twin).
- **CK6 (L — L-MC1 + B-I1 + MC-I1/I2)** the honest-docs family: the
  six→NINE miscount corrected at the three LIVE sites (globals.css, the
  README S135 row, the PAD block — with dated markers; the historical
  records stay as-written), the CJ4 "a decks" grammar, the CJ5 leg title.
- **CK7 (M — B-M6)** the calendar single-pass by-day presence map: the
  O(cells × collections) sweep collapses to O(cells + collections);
  behavior-preserving, the standing calendar e2e family the
  characterization net.
- **CK8 (M — executed then REVERTED by the reference measurement — a false
  positive)** the MyDay h3→h2 broke the standing S9-B/Q parity pin; the
  reference itself ships H1→H3 (measured live); the change reverted, the
  s17 leg withdrawn, the S9-B/Q pin stands as the guard. The sixth S136
  lesson in AGENTS.md.
- **CK9 (L — L-MC2)** the PAD §8.1 regeneration, executed LAST on the
  final census: every per-file row re-counted from the live tooling, the
  missing 45th unit file added, the Total consistent.
- **CK10 (L — A-L5)** the verify-email `emailVerified` guard: the uniform
  400 before the token lookup (the resend/verify race edge closed, the
  token query skipped on the common path); pinned by the unit source
  census.

## 5. The re-cert

lint ✓ · `tsc --noEmit` ✓ · unit **1344/1344** (45 files) · the canonical
build green · the six new e2e pins verified GREEN standalone · the cold
5-chunk e2e **593/593 — 150+184+79+94+86, every chunk first-pass on the
FINAL tree** · the register tripwire **254/135/0/119** (the 47th
consecutive hold; the expectation stated BEFORE the measurement [253/134 +
the one capture-script rider] and holding exactly) · the live drawer
battery GREEN on the remediated tree — **the 48th consecutive
no-Tailwind-v4-mobile-nav-bug confirmation** · three evidence frames under
`docs/screenshots/136-clone-*` (the desktop dashboard, the mobile drawer,
and the CK5 accent-gradient surface — the capture script's own
computed-gradient waitForFunction [the blue pair under the blue accent,
via the REAL settings-API switch, the violet restored in the finally] +
the passing CK5 e2e discriminator the machine proof; pixel-stat-verified
non-blank). **Census: 1344 unit + 593 e2e = 1937 green.**

## 6. The honest mid-run corrections (the full ledger)

1. The gradetracker gate's first draft required grades AND subjects empty —
   the pin holds ONLY `/api/grades`, so the AND never fired; the OR-form is
   the fix.
2. The CK4 analytics widening shifted the CJ3 register's line anchors
   (414 → 423) — the register re-anchored per the line-shift convention.
3. The inline-hex sweep's first draft flagged a settings-view COMMENT
   documenting the sf-chip-dark value — the sweep gained the comment-line
   discriminator (the VALUE, never a comment).
4. The CK2 pin title corrected to the component-scoped ref form.
5. The unit census landed at +12 vs the ~+8-10 projection (the CK3 family
   took four behavioral legs).
6. **The CK8 REVERT — the cycle's own fix was wrong and the standing pin
   caught it.** The h3→h2 change broke the S9-B/Q parity pin; the live
   reference measurement proved the reference itself ships H1→H3; the
   change reverted, the leg withdrawn, the census re-tagged 594 → 593, the
   full re-cert re-run on the corrected build.
7. **The loginGlobal success-reset.** The first draft reset neither: the
   chunk-5 login census (the budget specs' own failed attempts) accumulated
   past 40 mid-chunk and 429'd eleven subsequent login-flow tests. The fix
   extends the progressive model to the global bucket.
8. **The flood pin's terminal position + clean-slate pre-reset.** The first
   draft lived mid-chunk in resilience and poisoned the alphabetically-
   later s16 login-bearing tests (the spent bucket cannot be cleaned from
   the wire); the pin moved to the chunk's terminal position with a
   clean-slate pre-reset. Verified: the full chunk-3 slice passes 79/79
   with the flood as test #79.

## 7. The docs set (same commit)

README (the badge 1937 + the census lines + the S136 row + the S135-row
miscount correction), AGENTS.md (the census anchors + the loginGlobal
residual in the auth line + the six S136 lessons), PAD **v1.3.44** (the
revision block + the §8.1 regeneration + the v1.3.43 miscount correction),
the SKILL doc (the census anchors), the vitest header (45/1344 + the
S136/CK re-anchor block), the cert re-tags (the S136/CK block + Expected
593 in both + the script-conventions Expected pin), DEPLOYMENT.md (the
loginGlobal residual note), the plan's §5 (the as-executed record with the
full corrections ledger), this record, and the worklog entry.

## 8. Deferrals (documented, with rationale — the plan's §4)

The HKDF domain separation (the audit's own next-crypto-family-touch
recommendation), the Cache-Control no-store hardening, the
dead-`required` dialog sweep, the 500-item list-memoization family, the
spinner live-region idiom, the dialog exit-animation pin pair, the
studygroups focus ring + the notes Manage mobile entry, and the standing
s133/s134/s135 deferred set. **Next cycle suggestion: the auth/crypto/infra
+ FE/views axes are now FRESH — rotate onto the data/import/export +
entities/factory families (the s135 axes, two cycles stale), or take the
dark-edge harmonization design pass, or clear the B-L2 list-memoization
family as its own performance cycle.**

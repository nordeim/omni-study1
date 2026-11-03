# Session 139 — Batch CI (Cycle 84): The Audit-Driven Hardening Cycle + The KDF Migration — The Scrypt-KDF + Expiry-Pin + 429-Pin + MyDay-Guard + Calc-Gate Set

> Record of worklog **Session-134 / Batch CI**. Workspace: a FRESH clone at `32a15c0`
> (the Batch CH state `b8d833b` + the operator's `32a15c0` — `docs/session_138.md`, the
> CH transcript) — the sandbox had RESET, so the environment was re-provisioned from
> zero: `.env` re-created from the current `.env.example`, `db/` re-pushed + re-seeded,
> the dev daemon re-started (the S32 recipe, preflight GREEN), and chromium-1243
> re-provisioned after the fresh `bun install` raised Playwright's pinned browser
> build. Plan + execution record: **`docs/remediation-plan-session134.md`**.

---

## 1. The baseline (cold, BEFORE any work)

lint ✓ · `tsc --noEmit` ✓ · unit **1291/1291** (45 files) · the canonical build green
(exit 0, foreground) · the cold 5-chunk e2e **578/578 — 149+180+74+94+81, every chunk
first-pass** (per-chunk via `scripts/run-cert-chunk.sh`; zero flakes) · the Mode-C audit
of the Batch CH diff (`b8d833b`): **all 10 CH claims re-verified TRUE against the tree,
zero key material** (CH1's `decks.*` registry keys + the manifest census; CH2's
ENUM_VOCABULARIES over the exported arrays; CH3's exactly-ten real `@@index([subjectId])`
lines [the 11th grep hit is the comment]; CH4's seam + route consumption; CH5's
`exams.topics`; CH6's truncation family; CH7's `router.refresh()`; CH8's trimmed
`boundedTitle` + folder schemas; CH9's `MAX_UPLOAD_BYTES` in http.ts; CH10's
`DEFAULT_GET_TIMEOUT_MS` single-sourcing).

## 2. Live parity (both hosts — agent-browser, mobile 390×844 + desktop 1280×800)

**Reference** (logged in): the standing battery held — the mobile drawer panel **288px**,
no `role=dialog`, `z-50`, `shadow-2xl` final layer `rgba(0,0,0,0.25) 0px 25px 50px -12px`,
backdrop **`blur(4px)` + `rgba(0,0,0,0.2)`**, exactly **20 nav links**, `animation: none`
(instant open), nav **scrollable (992/744)**, drawer nav-click → `/Tasks` + drawer
unmounts, body scroll `visible` while open (the clone's lock is the documented superset),
desktop **260px sidebar / 20 links / main offset 260px**.

**Clone** (dev :3000, demo account): `node scripts/drawer-check-s14.mjs` → **DRAWER
CHECK: GREEN** (all six checks) — the **43rd consecutive no-Tailwind-v4-mobile-nav-bug
confirmation** at baseline. The agent-browser live walk: labeled hamburger +
`aria-expanded` toggling ✓, focus lands on "Close menu" ✓, the inner panel 288px white
`animation:none` ✓, Escape closes + restores body scroll + **returns focus to the
hamburger** (through a REAL click) ✓, drawer "Tasks" → `/Tasks` + unmounts ✓, desktop
chrome **260/20/260 identical to the reference** ✓.

## 3. The audits (rotated fresh eyes — the s133 closing directive, BOTH options executed:
the KDF migration as the centerpiece AND the axes rotated back to the auth/crypto/infra +
FE/views families, three cycles stale)

- **Audit A — the auth/crypto/infra axis** (auth.ts, server/{auth,http}.ts, env-check.ts,
  db/db-path, site.ts, all 11 auth routes in full, the Prisma auth models, the contract
  tests): **0 Critical / 0 High / 2 Medium / 5 Low / 7 Informational**. The auth plane
  affirmed clean on: the session HMAC + `v` embed; sessionVersion enforcement + reset
  revocation; token one-shot consumption atomicity (both families); the
  user-enumeration discipline (body + scrypt-scale timing); OTP/reset at-rest postures;
  the AUTH_SECRET boot guard; the proxy-hop contract; cookie flags; the body-cap/CSRF
  gate; the C1 convention; error shapes; db-path; secret hygiene. The audit's own KDF
  seam inventory (every hashPassword/verifyPassword call site with file:line, the format
  pins, the per-route burn table) fed CI1's design directly.
- **Audit B — the FE/views axis** (all 22 views, the layout chrome, the
  auth/export/rum/ui components, the store/router/theme/api/data libs, all app pages):
  **0 Critical / 0 High / 2 Medium / 5 Low / 4 Informational**. The FE plane affirmed
  clean on: React correctness (zero set-state-in-effect shapes; key-remount +
  open-handler patterns everywhere), hydration safety (structural), the CE3 idiom in 16
  views, trap-4 discipline, the z-index scale, the a11y core (CA7/aria-live/BS4), the
  state layer, the data layer, consistency, testing breadth. **Mobile-nav verdict:
  CONFORMS** (every drawer-contract clause holds).

Every M finding re-verified by direct read BEFORE the plan (A-M1's expiry-pin absence;
A-M2's per-IP 429 coverage gap; B-M1's unguarded quick-add; B-M2's ungated calculator
history panel) — and every L finding selected for the CI set likewise (the reset-route
in-transaction burn, the dead secureRandomBytes export, the hand-mirrored TTL literal,
the silent over-declared-hop collapse, the flashcards pre-warm gap, the notes toast
mirror, the files bare-`<p>` error, the slider desync, the four violet sites).

## 4. The CI set (TDD)

**RED**: 18 unit defect pins + 2 e2e defect pins, every one verified failing for its
DESIGNED reason (the 3-part mint against the 6-part regexes; the undefined exports; the
single-set burn censuses reading `[16384]`; the double-Enter resolving to 2 elements;
the false empty copy rendering at count 1) — plus the coverage pins (CI2/CI3/the CI1
legacy legs/the CI8 register legs) landing green on current code, the designed
expectation for missing-test findings.

**GREEN** (unit **1291 → 1314**, 45 files; e2e **578 → 584**, chunk map
**150+181+74+94+85**):

- **CI1 (M — the B-L3 sixth deferral CLOSED)** — the scrypt KDF
  parameter/versioning migration: the 6-part format `scrypt$N$r$p$salt$key` at the OWASP
  floor (N=2¹⁷, r=8, p=1 — the pre-migration seam rode Node's defaults at 2¹⁴, 8× under,
  with no parameter discriminator); the legacy 3-part dual-verify; `needsRehash` + the
  login route's rehash-on-login drain; the explicit maxmem at every call site (VERIFIED:
  both Node 24 and Bun 1.3.14 throw at 2¹⁷ without it); cross-runtime byte-equality
  verified; **the transition equalizer** (`burnLoginScryptWork`: every login attempt
  burns exactly ONE 2¹⁴ + ONE 2¹⁷ scrypt across the {no-user, legacy-row, current-row,
  malformed-row} branch matrix — the naive migration would reopen the ~8× timing
  account-existence oracle the BR3/CG1 lineage closed; the vi.hoisted `scryptBurns`
  census machine-guards the invariant); the reset route's mint hoisted above its
  `$transaction` (the A-L1 leg — the ~0.9 s burn never holds the SQLite write lock).
  The measured availability record: legacy 63/98 ms, current 537/857 ms (Node/Bun),
  login attempt ~0.6–0.95 s, chunk 5's e2e 49 s → 1.4 m.
- **CI2 (M)** — the session-token expiry pin pair (forged-signed expired payloads — the
  branch was unpinned at every layer; a regression would ship immortal tokens green).
- **CI3 (M)** — the per-IP 429 behavioral quartet (login/register/forgot/reset, each on
  its own TEST-NET IP; the register/forgot pins use DISTINCT emails per request so the
  per-EMAIL budgets never shadow the per-IP keys being measured).
- **CI4 (M)** — the MyDay quick-add in-flight guard (the lone unguarded composer; the
  held-route double-Enter e2e pin is the discriminator — pre-fix 2 rows, post-fix 1).
- **CI5 (M)** — the calculator History CE3 loading gate (the one view the CG6 sweep
  missed; the Spinner owns the zero branch on in-flight data).
- **CI6 (L)** — the hygiene set: `secureRandomBytes` retired; `SESSION_TTL_SECONDS`
  derived from `SESSION_TTL_MS`; the over-declared `TRUSTED_PROXY_HOPS` boot warning
  (parsed > 4 → the silent shared-bucket collapse made loud) + the `.env.example` note.
- **CI7 (L)** — the FE set: the flashcards pre-warm `subjects` leg (the S118/BS8
  class); the notes `patchSelected` selection-mirror (the AG6/AH2 class); the files
  link-error `role="alert"`; the assignment slider commit-failure resync.
- **CI8 (L)** — the accent-semantic violet register (four documented sites
  machine-kept in hue-tokens — the negative sweep fails a fifth unregistered
  `border-violet-200` site; the anchored leg keeps the ledger honest; NO token
  migration this cycle — no byte-identical accent-token equivalent exists).

## 5. The re-cert

lint ✓ · `tsc --noEmit` ✓ · unit **1314/1314** (45 files) · the canonical build green ·
the cold 5-chunk e2e **584/584 — 150+181+74+94+85, every chunk first-pass** (chunk 5 at
1.4 m — the honest KDF availability delta, +35 s of scrypt across the auth journeys) ·
the live drawer battery GREEN on the remediated tree — **the 44th consecutive
no-Tailwind-v4-mobile-nav-bug confirmation** · the register tripwire re-measured
**252/133/0/119** (the 45th consecutive hold; the +1/+1 is this cycle's own capture
script, Usage line per the S97/AX2 convention) · three evidence frames under
`docs/screenshots/134-clone-*` (the desktop dashboard, the mobile drawer, and the NEW
CI5 calculator-history loading gate — the capture script's own spinner-wait + the
passing e2e pin are the machine proof). **Census: 1314 unit + 584 e2e = 1898 green.**

## 6. The honest mid-run corrections

1. The CI3 register/forgot pins' first draft tripped the per-EMAIL budgets (5/15-min)
   before the per-IP keys (10/15-min) the pins measure — distinct emails per request
   adopted (the plan §5 records the class).
2. The burn-census instrument needed `vi.hoisted` (the mock factory runs at
   module-load, before a plain array initializes) — probed BEFORE the pin was written;
   the probe itself demonstrated the RED state.
3. The CI8 register's notes-view anchor drifted 6 lines (the CI7b edit above it) — the
   anchored leg caught it on its first day; re-anchored with the drift note.
4. The reset-census slice closed on the inner updateMany's bracket — re-sliced to the
   `if (!consumed)` guard.
5. Two TS2554s (the `burnLoginScryptWork` second parameter made optional).
6. The capture script's frame 3 needed the authed-page pattern + a route-warm goto +
   one ERR_ABORTED retry (the s132/s133 lessons, both re-hit).
7. The unit census landed at +23 (not the ~+30 projection); the e2e census landed at
   exactly +6. The per-file arithmetic is in the plan §5.

## 7. The docs set (same commit)

README (the badge 1898 + the census lines + the S134 row), AGENTS.md (the census
anchors + the NEW "scrypt KDF contract" section), PAD **v1.3.42** (the revision block +
the §8.1 Total row), the SKILL doc (the census anchors), the vitest header (45/1314 +
the S134/CI re-anchor block), the cert-script re-tags (the S134/CI block + Expected 584
in both), `.env.example` (the CI6c over-declaration note), `docs/DEPLOYMENT.md` (the new
§4b password-hashing contract), the plan's §5 (the as-executed record), this record,
and the worklog entry.

## 8. Deferrals (documented, with rationale — the plan's §4)

The verify-email ms-scale timing asymmetry (the standing resend/forgot equalization
class), the A-I family (all documented postures or latent seams: logout revocation, the
registerGlobal availability flip, the OTP mint windows, the in-band gate spellings, the
forgot Host-derivation, the `__Host-` prefix, poweredByHeader), the B-I family (the KPI
gradient stops, the analytics rounding, the monthly-recurrence approximation, the
task-card transition-all note), the violet-200 token family (a parity-measured change
of its own), the complement-burn retirement (post-transition; needs a
deployed-legacy-rows census capability), and the standing s133 deferred set (the
pre-CE5 unguarded delegates, the write-budget census granularity, the boot
double-fetch, the newest-500 window, the Docker non-root runtime, the drawer-link
emission order, the flashcards render-phase unlatch, the iOS scroll-lock nuance, the
RFC 7239 posture).

**Next cycle suggestion (the s134 closing rhythm): the KDF deferral is CLEARED —
rotate the deep-audit axes onto the data/import/export + entities/factory families
again (the s133 axes, now two cycles stale), or take the violet-200 token family as a
parity-measured cycle of its own.**

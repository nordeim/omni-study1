# Remediation Plan — Session 138 / Batch CM (Cycle 88)

**Received state:** `f158877` (the Batch CL state `f958c09` + the operator's
session-log commit adding `docs/session_146.md`, the s137 record +
transcript).
**Scope:** the audit-driven hardening cycle — the exemption-hardening +
KPI-gate + containment-decrement + honest-form set.

## 0. Scope and Method

The same standing method: cold baseline re-certified BEFORE any work; the
Mode-C audit of the received Batch CL diff; the two ROTATED deep audits per
the s137 closing directive (the axes onto the **FE/views +
auth/crypto/infra families** — the s136 axes, two cycles stale); every
H/M/L finding re-verified by direct read before this plan; live parity on
BOTH hosts before the plan (the drawer check + the reference battery,
including two reference-side measurements for the CM-parity questions);
TDD (RED verified for designed reasons → GREEN → re-factor); full cold
re-cert on the final tree; the docs chain re-anchored in the same commit.
The repo `skills/` folder excluded from checking, testing, and compilation
throughout.

### Baseline (cold, BEFORE any work — on the received tree)

lint ✓ · `tsc --noEmit` ✓ · unit **1356/1356** (45 files) · the canonical
build green · the cold 5-chunk e2e **596/596 — 150+184+81+95+86, every
chunk first-pass on its standalone (re-)run**. The honest ledger: the
chunk-1 and chunk-4 FIRST runs each carried one failure — both the
"today-exam probe row was created" create-leg, the machine-load class
(the Prisma socket-timeout signature visible in the passing chunks' own
WebServer logs — the exact s137-documented class); both chunks re-verified
**150/150 and 95/95 standalone cold, first-pass**. The `[ai/chat]
generation failed` log lines are the resilience specs' own
failure-injection noise, not failures.

### Live parity (both hosts — agent-browser + the standing drawer script)

**Clone** — `drawer-check-s14` **GREEN — the 51st consecutive
no-Tailwind-v4-mobile-nav-bug confirmation at baseline** (both hosts
probed, every match-check true: the 288px white panel, the
blur(4px)+rgba(0,0,0,0.2) backdrop, exactly 20 links, no footer,
Escape-close).

**Reference** (logged in with the operator-provided account): the desktop
chrome battery held — sidebar 260px, exactly 20 sidebar links. **Two NEW
ground-truth measurements for this cycle's parity questions:**

- **CM6 (the timetable Grid Builder): the reference's own Grid Builder
  button is a FUNCTIONAL NO-OP** — clicked live: no `aria-pressed`, no
  `[data-builder]` surface, no dialog, no cell affordances (the grid cells
  stay plain `div`s), no class change anywhere. The clone's button is
  therefore at BEHAVIORAL parity; the clone-only defect is the LYING
  `aria-pressed` + the dead `builder` state + the dead `data-builder`
  attribute (a WCAG 4.1.2 state-vs-actual mismatch the reference does not
  carry). The honest fix: drop the dead state/attributes, keep the
  parity-pinned outline button.
- **FE-4 (the analytics Focus Time sub-caption): the reference's own stat
  block reads "Focus Time / 0h / total study hours"** — the clone's copy
  is PARITY-EXACT. The week-scope/whole-hour honesty nit is the
  reference's own behavior on a shared surface → DEFERRED (copy parity
  wins; the honest-copy doctrine governs clone-territory copy only).

### The audits (rotated fresh eyes — the s137 closing directive executed)

**Mode-C (the Batch CL diff `9c4e636..f958c09`, 30 files, +1488/−102):
0C/0H/1M/3L/4I — all ELEVEN CL claims verified TRUE against the tree.**
The findings are residuals OF the CL fixes, not claim failures: MC-F1 (M)
the CL8 exemption's substring test over attacker-influenceable key
material (the same chain the auth audit found independently — see AI-1);
MC-F2 (L) the P2028→413 branch in the SHARED mapper emits import-specific
copy for every P2028 source (nine non-import `$transaction` sites exist;
two ride Prisma's default 5 s); MC-F3 (L) two stale "25 MiB" comments
re-seeded at the new 64 MiB boundary (the exact stale-prose class CL2 was
meant to close); MC-F4 (L) the S132/CG6 comment above the analytics
loading const still documents the AND/three-family form the CL7 fix
replaced; MC-F5–F8 (I) the 5000-window comment's overstatement, the 64 MiB
memory tail, the remaining unbounded adjacent reads, the band edges.

**Audit A — FE/views (the s136 axes, rotated back): 0C/0H/1M/2L/2I.**
**FE-1 (M)** the dashboard KPI stat row's loading gate tests ONLY
`tasks.length === 0` while the row's fourth card (Focus Time) derives from
`focusSessions` — the exact mixed-landing false-zero class the repo rates
M and wrote the S137/CL7 OR-form doctrine for (a non-dashboard boot whose
pre-warm excludes focusSessions, then navigating to /Dashboard while the
background focusSessions GET is in flight renders a false "0h"). **FE-2
(L)** the timetable Grid Builder dead toggle (measured against the
reference above — behavioral parity, dishonest aria). **FE-3 (L)** seven
dead UI primitives (`ui/{card,skeleton,avatar,checkbox,tooltip,badge,separator}`
— zero consumers repo-wide) + five dead Radix deps
(`react-avatar/-checkbox/-tooltip/-radio-group/-scroll-area` — the latter
two have no component file at all). FE-4 (I) the analytics caption
(parity-pinned — deferred). FE-5 (I) the settings profile-input remount
race (an intentional, code-commented pattern — deferred). The family
health: the cleanest FE surface audited at this scale — the CE3
false-empty family gated at 20+ sites with exactly the one FE-1 residual;
XSS, unbounded-render, hydration, and Tailwind-v4-scanner dimensions all
closed (the one risky Radix composition adjudicated SAFE against the
pinned dist sources).

**Audit B — auth/crypto/infra (the s136 axes, rotated back):
0C/1H/1M/2L/2I.** **AI-1 (H)** — cross-validated by Mode-C MC-F1 — the
CL8 eviction exemption is `key.includes("Global:")`, a SUBSTRING test over
key material whose per-IP half embeds the raw, forgeable first
`x-forwarded-for` entry under the default (unset
`TRUSTED_PROXY_HOPS`) posture: a forged `X-Forwarded-For: Global:<unique>`
mints `verify:Global:<unique>` / `resend:` / `forgot:` / `reset:` buckets
on the four unauthenticated routes with NO global containment — every one
eviction-exempt. Once the live map is all-exempt, `evictOldestBucket`
deletes NOTHING and the unconditional insert grows the map past the
S121/BV9 hard cap of 2048 without bound (request-rate × 15 min; the
documented "the map is bounded at MAX_BUCKETS even under the flood"
invariant is FALSE under this shape; the CL8 unit pin's `cl8-flood-${i}`
keys never exercise it). **AI-2 (M)** the login route's SUCCESS path calls
`resetRateLimit("loginGlobal:")` — a FULL delete on an AGGREGATE budget:
under the default ADR-013 in-band posture (open registration + the OTP in
the response) valid credentials are scriptable, so a credentialed attacker
alternating 39 failed logins + 1 successful one resets the S136/CK1
process-wide CPU-containment budget to zero forever — the exact
"starving the single worker for ALL routes" threat CK1 was built to bound.
**AI-3 (L)** the Docker runtime stage has no `USER` directive (root).
**AI-4 (L)** no Content-Security-Policy header (and unlike HSTS, the
omission is not documented as deliberate). AI-5 (I) ≡ MC-F3; AI-6 (I) ≡
MC-F2. The family health: the auth/crypto core is exceptionally hardened
(KDF, timing equalizers, peppered OTP digests, one-shot conditional token
consumption, ownership-by-construction factory, anti-enumeration
discipline — all verified intact); the single real weakness sits precisely
where the last cycle touched.

Every H/M/L finding above was re-verified by direct read (the exact lines
re-read; the exemption chain, the reset-on-success, the KPI gate, the
stale comments, the dead primitives, the Dockerfile, the header set) before
this plan. The two reference-side parity facts were measured live.

## 1. The findings → the CM set

| # | Sev | Source | The defect | The fix |
|---|-----|--------|-----------|--------|
| CM1 | H | AI-1/MC-F1 | The CL8 exemption is a substring test over forgeable per-IP key material → unbounded bucket-map growth (pre-auth, default posture) | Exact-key whitelist (the two real budget keys) + the crafted-key injection pin |
| CM2 | M | FE-1 | The dashboard KPI gate tests only `tasks` while the row's 4th card reads `focusSessions` → the false "0h" mixed-landing | The CL7 OR-form doctrine on the KPI row + the held-route e2e leg |
| CM3 | M | AI-2 | `resetRateLimit("loginGlobal:")` on success fully deletes an AGGREGATE budget → the CK1 CPU containment is defeated by any credentialed caller | A `decrementRateLimit` seam (successes net −1 on the global; per-IP/per-account still reset — their key material IS the proven requester) + the seam pin + the route census |
| CM4 | L | MC-F2/AI-6 | The shared mapper's P2028→413 emits import-specific copy for ALL P2028 sources (nine non-import tx sites) | Source-neutral copy in the shared mapper + the import-specific copy scoped to the import route's own catch |
| CM5 | L | MC-F3/MC-F4/AI-5/MC-F5 | The stale-copy quartet: two "25 MiB" comments, the CG6 AND/three-family comment, the entities 5000-window comment overstatement | The honest re-tags + the machine census (no "25 MiB" anywhere in src/) |
| CM6 | L | FE-2 | The Grid Builder's lying `aria-pressed` + dead state + dead `data-builder` (the reference's own button is a no-op — behavioral parity holds) | Drop the dead state/attributes; keep the parity-pinned outline button + the census |
| CM7 | L | FE-3 | Seven dead UI primitives + five dead Radix deps (zero consumers) | Delete the files + `bun remove` the deps + the ui-directory census |
| CM8 | L | AI-3 | The Docker runtime stage runs as root | `USER bun` + the /data chown + the Dockerfile census |
| CM9 | L | AI-4 | No Content-Security-Policy header (undocumented omission) | A conservative production-conditional CSP (`default-src 'self'`, `object-src 'none'`, `frame-ancestors 'none'`, …) verified by the full cold cert on the production build + the census |

Deferred (documented, with rationale — §4): FE-4 (parity-pinned copy),
FE-5 (intentional remount pattern), MC-F6 (the 64 MiB memory tail — the
documented read-cap trade-off), MC-F7 (the knownIds/export unbounded reads
— the A-L3/CJ-scope residuals), MC-F8 (the band edges — accepted
trade-offs), the two default-5 s transaction sites (AI-6's residual tail),
and the standing s133–s137 deferred set.

## 2. The design (per item)

### CM1 — the exemption exact-key whitelist (AI-1/MC-F1)

`src/lib/auth.ts`: replace `if (key.includes("Global:")) continue;` with a
fixed whitelist of the two REAL budget keys —
`const PROTECTED_BUCKETS = new Set(["loginGlobal:", "registerGlobal:"]);`
(verified: exactly two `Global:` mint sites exist in the tree — login:50,
register:51) — `if (PROTECTED_BUCKETS.has(key)) continue;`. A forged
`verify:Global:7` key does not match; the eviction always finds a victim
among non-exempt keys, restoring the S121/BV9 bound mathematically (at
most 2 exempt keys can ever be live). The comment re-writes honestly: the
exempt set is a fixed enumeration of the two process-wide budget keys,
NOT any key that merely contains the substring — the per-IP key material
is attacker-influenceable under the legacy XFF posture and must never be
able to manufacture an exempt key.

**Pin (auth.test.ts, after the CL8 describe):** the crafted-key flood —
seed `loginGlobal:` spent to its budget, flood 2100 distinct
`verify:Global:${i}` keys (the exact forged form), assert (a)
`rateLimitBucketCount() <= 2048` (RED pre-fix: the substring matches them
all → 2101+ live entries), (b) the real `loginGlobal:` bucket still
enforces (its next check blocked — the exemption intent preserved).

### CM2 — the dashboard KPI OR-form gate (FE-1)

`src/components/views/dashboard-view.tsx:240`:
`{loading && tasks.length === 0 ? …}` →
`{loading && (tasks.length === 0 || focusSessions.length === 0) ? …}` —
the S137/CL7 doctrine verbatim ("for a stat row fed by N collections, the
in-flight gate is the OR-form — any primary source empty while loading =
the row is untrustworthy"), with the citing comment.

**Pin (e2e, resilience.spec.ts after the CL7 describe, MID-file — the
CK1 terminal position in s16 untouched, chunk 3's demo import budget
untouched):** the held-route idiom holding `**/api/focus-sessions` only
(the other four dashboard families resolve): after the CD2 commit, the
KPI row renders NOWHERE pre-fix-RED is the visible false "0h" — post-fix
the "Focus Time" stat card is absent and the KPI spinner is visible.

### CM3 — the loginGlobal decrement (AI-2)

New seam in `src/lib/auth.ts`:
`export function decrementRateLimit(key: string): void` —
`const b = buckets.get(key); if (b && b.count > 0) b.count -= 1;` (no-op
on a missing key; never re-arms a window). The login route's success path:
`resetRateLimit("login:${ip}")` and `resetRateLimit("loginAcct:${user.id})`
stay (their key material IS the proven requester — a success fully
discharges the requester's own buckets); `resetRateLimit("loginGlobal:")`
→ `decrementRateLimit("loginGlobal:")`. The comment re-writes honestly:
an AGGREGATE budget's reset must not be grantable by ONE of its many
requesters — a success proves that requester is legitimate, not that the
window's other 39 spends were; the decrement keeps the progressive model
net-of-successes (only FAILED logins accumulate; consecutive successes
oscillate 39↔40 and never trip; a pure flood still trips at 40 net).

**Pins:** (a) the seam pin (auth.test.ts — decrements a spent bucket;
floors at zero; no-op on a missing key) — RED pre-fix as the missing
export; (b) the route census (script-conventions — the login route
contains `decrementRateLimit("loginGlobal:")` and NOT
`resetRateLimit("loginGlobal:")`) — RED pre-fix. The e2e wire stays the
CK1 terminal fail-only form (an interleave leg would spend the global
budget mid-chunk and poison chunk 3's demo session logins — the known
terminal-pin doctrine).

### CM4 — the P2028 copy scoping (MC-F2/AI-6)

`src/lib/server/http.ts`: the shared mapper keeps P2028 → 413 (the
"too large or slow, rolled back" class) but the copy goes SOURCE-NEUTRAL:
"That request was too large or slow to complete in one pass and was fully
rolled back. Try again, or split the work into smaller passes." — with the
comment re-written (P2028's sources now include the retention-trim
transactions on ai/chat, math/solve, rum, and calculator/history beside
the import route's 60 s window). `src/app/api/import/data/route.ts`: the
route's own catch maps P2028 BEFORE `toErrorResponse` to its
backup-specific 413 copy (the CL10 copy verbatim — "split the backup and
retry the halves").

**Pins:** the CL10 http-body leg re-tagged to the neutral copy (asserting
the NEW phrase "split the work into smaller passes" — RED pre-fix) + the
import-route census (the route file contains "split the backup and retry
the halves" — RED pre-fix: the phrase lives only in http.ts today).

### CM5 — the stale-copy quartet (MC-F3/MC-F4/AI-5/MC-F5)

1. `src/app/api/import/data/route.ts:155-156` — the comment re-referenced
   to `IMPORT_MAX_BYTES` (64 MiB at S137/CL2 — never a bare number again).
2. `src/components/export/export-panel.tsx:85` — same.
3. `src/components/views/analytics-view.tsx:316-321` — the CG6 comment
   re-written to the OR/six-family form, pointing at the CL7 block.
4. `src/lib/server/entities.ts` — the cards-window comment softened
   ("honest below the window; the newest-5000 window applies past it").

**Pin (script-conventions):** the machine census — NO "25 MiB" anywhere
under `src/` (RED pre-fix: two sites) + the analytics comment phrase gone
+ the entities phrase re-worded. The recurring stale-prose class gets its
machine check at last (CL2 re-seeded the rot one commit after CL2 closed
it).

### CM6 — the Grid Builder honest form (FE-2)

`src/components/views/timetable-view.tsx`: delete the `builder` state
(:88), the `aria-pressed` attribute (:233), and the `data-builder`
attribute (:307). The outline Button stays exactly as pinned (the
reference's own no-op form — behavioral parity preserved, the WCAG
state-vs-actual mismatch removed).

**Pin (script-conventions):** the timetable view contains neither
`aria-pressed` nor `data-builder` (RED pre-fix: both present).

### CM7 — the dead-primitive deletion (FE-3)

Delete `src/components/ui/{card,skeleton,avatar,checkbox,tooltip,badge,separator}.tsx`
(zero consumers verified repo-wide: src/, tests/, scripts/). Remove the
five dead Radix deps via `bun remove @radix-ui/react-avatar
@radix-ui/react-checkbox @radix-ui/react-tooltip @radix-ui/react-radio-group
@radix-ui/react-scroll-area` (the package manager, never a hand-edit; the
lockfile rides the commit). The remaining 14 primitives are all consumed.

**Pin (script-conventions):** the `src/components/ui` directory census —
exactly the 14 consumed files (RED pre-fix: 21) + package.json contains
none of the five deps (RED pre-fix).

### CM8 — the Docker non-root runtime (AI-3)

`Dockerfile` runtime stage: `RUN chown -R bun:bun /data` (and the app tree
as needed) + `USER bun` before the CMD. The init profile keeps its
one-shot semantics (the seed runs as root in the init container — the
volume chown is exactly its job — then the runtime drops to `bun`).

**Pin (script-conventions):** the Dockerfile contains `^USER ` (RED
pre-fix) and the `/data` chown.

### CM9 — the conservative CSP (AI-4)

`next.config.ts`: a `Content-Security-Policy` header on `/:path*`,
**production-conditional** (`process.env.NODE_ENV === "production"` —
`next dev`'s HMR websocket stays ungated; the e2e cert runs the production
standalone build and therefore exercises the header). The conservative
profile, matched to the verified resource surface (no blob:, no data:,
no media, no external origins anywhere in src/):
`default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self'
'unsafe-inline'; img-src 'self' data:; font-src 'self' data:;
connect-src 'self'; object-src 'none'; base-uri 'self';
frame-ancestors 'none'; form-action 'self'` — `unsafe-inline` is required
by Next's inline bootstrap + the theme boot script + the app's inline
style attributes; the profile still blocks every external
script/style/img/font/connect exfil vector, plugins, and framing (the
X-Frame-Options DENY belt-and-braces). The verification is the FULL cold
5-chunk cert + the drawer check + the evidence captures on the production
daemon — any resource the app actually needs that the profile blocks
surfaces as a red chunk, not as a shipped surprise. The comment documents
the omission story (CSP now shipped; HSTS still deliberately at the TLS
terminator per DEPLOYMENT.md).

**Pin (script-conventions):** next.config.ts contains
`Content-Security-Policy` (RED pre-fix).

## 3. The TDD pin projections

**Unit** (1356 baseline): auth +2 describes (CM1's crafted-key flood ×1;
CM3's seam ×3 legs) → +4; http-body re-tag ±0 (CM4's leg re-tagged in
place, +0 net); script-conventions +~8 (CM3 census 1, CM4 census 1, CM5 3,
CM6 1, CM7 2, CM8 1, CM9 1) → projected **1356 → ~1368** (45 files). The
exact census lands in §5 as-executed.

**E2e** (596 baseline): chunk 3 +1 (CM2's held-route leg in resilience,
mid-file — the CK1 flood pin stays TERMINAL in s16, the chunk's
alphabetically-last file) → **596 → 597 (150+184+82+95+86)**. No fresh
registrations, no import-budget spend: the leg rides the demo session and
holds only `/api/focus-sessions`.

**Register tripwire** (stated BEFORE the measurement, the 49th
consecutive hold): at s137 the register read `255/136/0/119`; this cycle
adds exactly ONE playwright-importing file with the conventional Usage
line (the `capture-s138-evidence.mjs` rider) → **expected
256/137/0/119**.

**Badge census:** unit (~1368) + e2e (597) → the README badge and the PAD
§8.1 Total re-tagged to the measured values (§5 records the exact
arithmetic); the §8.1 per-file rows this cycle touches (auth, http-body,
script-conventions, resilience) re-counted by `playwright test --list` /
the vitest reporter.

## 4. Deferrals (documented, with rationale)

- **FE-4** (the analytics Focus Time sub-caption): PARITY-PINNED — the
  reference's own stat block reads "total study hours" (measured live this
  cycle); copy parity with the reference wins on shared surfaces.
- **FE-5** (the settings profile-input remount race): an intentional,
  code-commented pattern (the key-remount-on-arrival design); the loss
  window is sub-second and keystroke-scoped.
- **MC-F6** (the 64 MiB worst-case per-request memory tail): the
  documented read-cap trade-off (CL2's plan owns it).
- **MC-F7** (the knownIds census + the export route's unbounded reads):
  the A-L3 deferral stands (the completeness contract), and the knownIds
  census is ids-only (~50 B/row).
- **MC-F8** (the CL6 band edges): the accepted cross-node-skew and
  status-class trade-offs, documented at CL6 time.
- **The two default-5 s transaction sites** (rum trim, calculator
  history): CM4 makes their P2028 copy honest; explicit timeouts are the
  B-I4-adjacent over-provision question — deferred.
- **The standing s133–s137 deferred set:** MC-F3 (the credential-holder
  containment window), A-L3 (the export unbounded read), A-I2 (the RUM CSV
  LF separator), A-I4 (the bespoke import validator), B-I2 (the
  calculator/history budget exception), B-I4 (the pre-warm
  over-provision), B-I5 (the unguarded-delegate TOCTOU), B-L2 (the
  list-memoization family — cards-bounded since CL3).

## 5. As-executed (the cycle close)

**TDD discipline.** RED first: **13 unit + 1 e2e defect pins verified
failing for the designed reasons** — CM1 `expected 2101 to be less than or
equal to 2048` (the crafted-key flood grew the map past the cap under the
substring exemption); CM3 `decrementRateLimit is not a function` ×3 (the
missing seam — verified in two steps so CM1's assertion-level RED was
visible before the import made the file fail at load); CM4 `expected 'That
backup was too large…' to contain 'split the work into smaller passes'`;
the CM5/CM6/CM7/CM8/CM9 censuses each RED on their exact stale artifact
(the five "25 MiB" sites, the AND/three-family comment, the entities
phrase, the pressed-state trio, the 21-file ui directory + the five deps,
the missing USER, the absent CSP); the CM3/CM4 wire censuses RED on the
missing forms; and the e2e CM2 leg RED at the designed assertion
(`main.getByText('Focus Time', {exact:true})` Expected 0, Received 1 —
the false "0h" card visible during the held focus-sessions window). The
1356 baseline was otherwise green throughout. GREEN: unit
**1356 → 1369** (45 files — auth +4, script-conventions +9, http-body
±0 re-tag) · e2e **596 → 597** (chunk 3 81 → 82). Guardrails held: no
test weakened, no lint/type rule loosened; the S136/CK1 census was
RE-TAGGED (not deleted) to the decrement form — the intentional CM3
evolution of the pin's own subject; the hue-tokens register was
re-anchored +1 line for the analytics comment growth (the line-shift
convention).

**The honest mid-run corrections (the full ledger).** (1) The CM5 census
walk surfaced FIVE stale "25 MiB" sites where the audit reported two —
the census's own first draft banned the literal EVERYWHERE, which would
have banned the seam's own legitimate history narrative too; refined to
the doc-block-scoped machine line (the 25 MiB era is narrated in exactly
one place — the IMPORT_MAX_BYTES doc block). (2) My first route-comment
re-tag re-seeded "10 → 25 MiB" as a literal — caught by my own census,
re-worded. (3) The CM6 census's `useState(false)` assertion was too blunt
(the `busy` toggle is a legitimate sibling) — re-scoped to `setBuilder`.
(4) The CM6 explanatory comment itself contained the banned literals —
re-worded (the self-trip class). (5) The entities re-wording initially
kept the banned substring "deck counts stay honest" — rephrased to "are
honest BELOW the window". (6) The CK1 census re-tagged to the decrement
form. (7) The CSP's first edit landed as a top-level config key instead
of a headers-array entry — structurally caught before the build and
re-placed. (8) **The chunk-3 re-run contention**: three consecutive runs
each failed ONE different files-edge test (a 500, a vacuous 200, a rename
prefill — each passing standalone, the socket-timeout signature in the
server log); the real source was the drawer-check dev daemon spawned an
hour earlier SURVIVING its tool call — killed, then **82/82 first-pass**
(the S137 lesson-5 corollary, now recorded as the S138 lesson 5).

**The re-cert (the FINAL tree).** lint ✓ · tsc ✓ · unit **1369/1369 (45
files)** · the canonical build green (the six Turbopack warnings
pre-existing — the baseline tree shows the identical db-path/instrumentation
traces) · the cold 5-chunk e2e **597/597 — 150+184+82+95+86, every chunk
first-pass** (the baseline's chunk-1/chunk-4 first-run flakes were the
today-exam-probe machine-load class, each re-verified standalone
first-pass; the final-tree chunk-3 re-run contention was the surviving
dev daemon, killed and re-verified 82/82) · the register tripwire
**256/137/0/119** (the 49th consecutive hold; the expectation stated
BEFORE the measurement [255/136 + the one capture-s138-evidence.mjs
rider] and holding exactly) · the live drawer battery GREEN — **the 52nd
consecutive no-Tailwind-v4-bug confirmation** · the CSP verified served
live on the standalone production build (curl -sI on :3111: the full
profile) and exercised by the entire cert on every route · three
evidence frames in `docs/screenshots/138-clone-*.png` (desktop, mobile
drawer, the CM6 stateless Grid Builder — the capture script's own
before-and-after waitForFunction the self-verification; pixel-stat
verified non-blank; the frame sizes byte-comparable to the s137 standing
patterns). **Census: 1369 unit + 597 e2e = 1966 green.**

**Docs set (same commit):** README (the badge 1966 + the census lines +
the S138 row), AGENTS.md (the census anchors + the S138 lessons section),
PAD **v1.3.46** (the revision block + the §8.1 touched-row re-count:
auth 51→55, script-conventions 38→47, resilience 30→31, the Total
1948→1962 with the badge 1966), the SKILL doc (the census anchors), the
vitest header (45/1369 + the S138/CM re-anchor block), the cert re-tags
(the S138/CM block + Expected 597 in both + the script-conventions
tripwire re-tag), this §5, `docs/session_147.md`, and the worklog entry.

**Deferrals (documented, with rationale):** FE-4 (the analytics Focus
Time sub-caption — PARITY-PINNED, the reference's own copy measured live
this cycle), FE-5 (the settings remount race — the intentional
key-remount pattern), MC-F6 (the 64 MiB memory tail), MC-F7 (the
knownIds/export unbounded reads — the A-L3 posture), MC-F8 (the band
edges), the two default-5 s transaction sites (their P2028 copy is now
honest via CM4; explicit timeouts deferred), and the standing s133–s137
deferred set. **Next cycle suggestion: the FE/views + auth/crypto/infra
axes are now FRESH — rotate onto the data/import/export + entities/factory
families (the s137 axes, two cycles stale by then), or take the B-L2
list-memoization family as its own performance cycle.**

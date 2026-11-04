# Session 147 — Batch CM (Cycle 88): the audit-driven hardening cycle — the exemption-hardening + KPI-gate + containment-decrement + honest-form set

**Received state:** `f158877` (the Batch CL state `f958c09` + the operator's
session-log commit adding `docs/session_146.md`, the s137 record +
transcript). **Scope:** the audit-driven hardening cycle per the s137
closing directive — the deep-audit axes rotated onto the **FE/views +
auth/crypto/infra families** (the s136 axes, two cycles stale).

## 1. The workspace + the cold baseline

The 30th workspace continuation — the sandbox reset; a fresh clone at
`f158877`, `bun install` (496 pkgs), `.env` re-created from the current
`.env.example` (`DATABASE_URL="file:../db/custom.db"` — the contract, `db/`
at the repo root), `db/` pushed + seeded, chromium-1243 re-provisioned.
The toolchain: Bun 1.3.14 / Node 24.22.2 / Playwright 1.63.0.

The cold baseline, BEFORE any work: lint ✓ · `tsc --noEmit` ✓ · unit
**1356/1356** (45 files) ✓ — the documented S137 baseline exactly · the
canonical build green · the cold 5-chunk e2e **596/596 — 150+184+81+95+86**.
The honest ledger: the chunk-1 and chunk-4 FIRST runs each carried one
failure — both the "today-exam probe row was created" create-leg, the
machine-load class (the Prisma socket-timeout signature visible in the
passing chunks' own WebServer logs — the exact s137-documented class); both
chunks re-verified **150/150 and 95/95 standalone cold, first-pass**. A
sandbox lesson absorbed early: detached background processes are reaped
between tool calls, so the full-script background cert died twice — the
per-chunk foreground runner (`scripts/run-cert-chunk.sh`, the S137-era
answer to exactly this) carried the certification.

## 2. The audits

Three read-only audits ran while the baseline certified (subagents pinned
off the CPU so the cert stayed clean):

**Mode-C (the Batch CL diff `9c4e636..f958c09`, 30 files, +1488/−102):
0C/0H/1M/3L/4I — all ELEVEN CL claims verified TRUE against the tree.**
The findings are residuals OF the CL fixes, not claim failures: MC-F1 (M)
the CL8 exemption's substring test over attacker-influenceable key
material (the same chain the auth audit found independently); MC-F2 (L)
the P2028→413 branch in the SHARED mapper emitting import-specific copy
for every P2028 source (nine non-import `$transaction` sites exist); MC-F3
(L) two stale "25 MiB" comments re-seeded at the new boundary; MC-F4 (L)
the CG6 comment above the analytics loading const still documenting the
AND/three-family form; MC-F5–F8 (I) the 5000-window comment, the memory
tail, the adjacent unbounded reads, the band edges.

**Audit A — FE/views (rotated back): 0C/0H/1M/2L/2I.** FE-1 (M) the
dashboard KPI stat row's loading gate tests only `tasks.length === 0`
while the row's fourth card (Focus Time) derives from `focusSessions` —
the exact mixed-landing false-zero class. FE-2 (L) the timetable Grid
Builder dead toggle. FE-3 (L) seven dead UI primitives + five dead Radix
deps. FE-4/FE-5 (I). The family health: the cleanest FE surface audited
at this scale — the CE3 family gated at 20+ sites with one residual; XSS,
unbounded-render, hydration, and v4-scanner dimensions closed; the one
risky Radix composition adjudicated safe against the pinned dist sources.

**Audit B — auth/crypto/infra (rotated back): 0C/1H/1M/2L/2I.** AI-1 (H)
the CL8 exemption defeated by forged XFF key material (cross-validated
with MC-F1); AI-2 (M) the loginGlobal: reset-on-success; AI-3 (L) the
root Docker runtime; AI-4 (L) the absent CSP; AI-5/AI-6 (I) the comment/
copy drifts. The auth/crypto core verified intact (KDF, timing
equalizers, peppered digests, one-shot consumption, the
ownership-by-construction factory, anti-enumeration discipline).

Every H/M/L finding re-verified by direct read before the plan (the
exemption chain, the reset-on-success, the KPI gate, the stale comments,
the dead primitives, the Dockerfile, the header set).

## 3. Live parity (both hosts — agent-browser + the standing drawer script)

**Clone** — `drawer-check-s14` **GREEN — the 51st consecutive
no-Tailwind-v4-mobile-nav-bug confirmation at baseline** (both hosts,
every match-check true: the 288px white panel, the blur(4px)+rgba backdrop,
exactly 20 links, no footer, Escape-close).

**Reference** (logged in with the operator-provided account): the desktop
chrome battery held — sidebar 260px, exactly 20 sidebar links. **Two NEW
ground-truth measurements:** (1) **the reference's own Grid Builder button
is a FUNCTIONAL NO-OP** — clicked live: no pressed semantics, no dialog,
no cell affordances, no class change; the clone is behaviorally at parity
and its defect is only the lying `aria-pressed` (the CM6 honest form).
(2) **the reference's analytics Focus Time sub reads "total study
hours"** — the clone's copy is parity-exact, so FE-4 defers (copy parity
wins on shared surfaces).

## 4. The CM set (TDD — 13 unit + 1 e2e defect pins verified RED for the designed reasons → GREEN)

Unit **1356 → 1369** (45 files: auth +4, script-conventions +9, http-body
±0 re-tag) · e2e **596 → 597** (chunk 3 81 → 82).

**CM1 (H — AI-1/MC-F1, cross-validated)** the exemption exact-key
whitelist: `PROTECTED_BUCKETS = new Set(["loginGlobal:", "registerGlobal:"])`
replaces the substring test — the per-IP key material embeds the raw
forgeable first XFF hop under the default posture, and a forged
`Global:<unique>` header manufactured unlimited DISTINCT eviction-exempt
`verify:Global:`-shaped buckets on the four unauthenticated routes; once
the live map was all-exempt the eviction deleted nothing and the insert
grew it past the S121/BV9 cap (the documented invariant was FALSE under
the exact flood class CL8 cited; the CL8 pin's keys never contained the
substring, so the hole was unpinned). Pin: the crafted-key flood (RED:
`expected 2101 to be less than or equal to 2048`).

**CM2 (M — FE-1)** the dashboard KPI OR-form gate:
`loading && (tasks.length === 0 || focusSessions.length === 0)` — the
S137/CL7 doctrine verbatim on the row fed by TWO collections. Pin: the
held-route e2e leg holding ONLY `/api/focus-sessions` (the other four
families resolve) — RED at the designed assertion (`Focus Time` card
Expected 0, Received 1: the false "0h" rendered during the mixed landing).

**CM3 (M — AI-2)** the loginGlobal: success DECREMENT: the new
`decrementRateLimit` seam (count −1, floored at zero, no-op on missing,
never re-arms a window) replaces `resetRateLimit("loginGlobal:")` — an
aggregate budget's discharge must not be grantable by ONE of its many
requesters (under the default in-band posture, 39 fails + 1 scripted
success reset the CK1 CPU containment to zero forever); the per-IP and
per-account keys still reset (their key material IS the proven
requester). Pins: the seam trio + the wire census + the S136/CK1 census
re-tagged to the decrement form.

**CM4 (L — MC-F2/AI-6)** the P2028 copy scoping: the shared mapper's copy
went source-neutral ("split the work into smaller passes"); the import
route's own catch carries the backup-specific remedy ("split the backup
and retry the halves"). Pins: the CL10 leg re-tagged to the neutral phrase
+ the route census.

**CM5 (L — MC-F3/MC-F4/AI-5/MC-F5)** the stale-copy family: FIVE stale
"25 MiB" sites re-tagged (the census walk found three more than the audit
— two "current cap is 25" claims in seam guard comments + the CH6 era
note); the machine line: the 25 MiB era is narrated ONLY in the
IMPORT_MAX_BYTES doc block; the CG6 comment re-written to the OR/six-family
form; the entities 5000-window comment owns its global-across-decks
boundary.

**CM6 (L — FE-2)** the timetable Grid Builder honest stateless form: the
dead `builder` state, the lying `aria-pressed`, and the dead `data-builder`
attribute removed — the parity-pinned outline button stays (the
reference's own button is a measured no-op).

**CM7 (L — FE-3)** the dead-primitive deletion: seven zero-consumer ui/
primitives deleted + five dead Radix deps removed via `bun remove` (the
package manager, never a hand-edit); the ui/ directory census pins the 14
consumed files.

**CM8 (L — AI-3)** the Docker non-root runtime: `USER bun` + the /data
chown (the init profile keeps its one-shot root semantics).

**CM9 (L — AI-4)** the conservative CSP: a production-conditional
`Content-Security-Policy` joins the BU16 header set (`default-src 'self'`
+ `object-src 'none'` + `frame-ancestors 'none'` + `form-action 'self'`
+ the Next-required `'unsafe-inline'` on script/style) — verified served
live on the standalone build and exercised by the full cert on every
route; `next dev`'s HMR stays ungated.

## 5. The re-cert

lint ✓ · tsc ✓ · unit **1369/1369** · the canonical build green (the six
Turbopack warnings pre-existing — the baseline tree shows the identical
db-path/instrumentation traces) · the cold 5-chunk e2e **597/597 —
150+184+82+95+86, every chunk first-pass** · the register tripwire
**256/137/0/119** (the 49th consecutive hold, the expectation stated
BEFORE the measurement: 255/136 + the one capture-s138-evidence.mjs
rider) · the live drawer battery GREEN — **the 52nd consecutive
no-Tailwind-v4-bug confirmation** · the CSP served-and-certified · three
self-verifying evidence frames (`docs/screenshots/138-clone-*.png`).
**Census: 1369 unit + 597 e2e = 1966 green.**

The honest contention ledger: the final-tree chunk 3 failed three
consecutive re-runs on three DIFFERENT files-edge tests (each passing
standalone, the socket-timeout signature in the server log) — the real
source was the drawer-check dev daemon spawned an hour earlier SURVIVING
its tool call; killed, then **82/82 first-pass**. Recorded as the S138
lesson 5 (the S137 lesson-5 corollary: inventory your OWN surviving
processes before blaming the machine).

## 6. The honest mid-run corrections (the full ledger)

(1) The CM5 census's first draft banned the "25 MiB" literal everywhere —
the walk itself surfaced the seam's own legitimate history narrative;
refined to the doc-block-scoped machine line. (2) My own route-comment
re-tag re-seeded the literal — caught by my own census, re-worded.
(3) The CM6 census's `useState(false)` assertion was too blunt (the `busy`
toggle is a legitimate sibling) — re-scoped to `setBuilder`. (4) The CM6
explanatory comment contained the banned literals — re-worded (the
self-trip class). (5) The entities re-wording kept the banned substring —
rephrased. (6) The CK1 census re-tagged to the decrement form (the
intentional CM3 evolution). (7) The hue-tokens register re-anchored +1
line for the analytics comment growth (the line-shift convention).
(8) The CSP's first edit landed as a top-level config key instead of a
headers-array entry — caught and re-placed before the build.

## 7. The docs set (same commit)

README (the badge 1966 + the census lines + the S138 row), AGENTS.md (the
census anchors + the S138 lessons section — five lessons), PAD **v1.3.46**
(the revision block + the §8.1 touched-row re-count: auth 51→55,
script-conventions 38→47, resilience 30→31, the Total 1948→1962 with the
badge 1966), the SKILL doc (the census anchors), the vitest header
(45/1369 + the S138/CM re-anchor block), the cert re-tags (the S138/CM
block + Expected 597 in both + the script-conventions tripwire re-tag),
the plan's §5 (this record's source), `docs/session_147.md`, and the
worklog entry.

## 8. Deferrals (documented, with rationale — the plan's §4)

FE-4 (the analytics Focus Time sub-caption — PARITY-PINNED, the
reference's own copy measured live this cycle), FE-5 (the settings
remount race — the intentional key-remount pattern), MC-F6 (the 64 MiB
memory tail — the documented read-cap trade-off), MC-F7 (the
knownIds/export unbounded reads — the A-L3 posture), MC-F8 (the band
edges), the two default-5 s transaction sites (their P2028 copy is now
honest via CM4; explicit timeouts deferred), and the standing s133–s137
deferred set (MC-F3, A-L3, A-I2, A-I4, B-I2, B-I4, B-I5, B-L2).
**Next cycle suggestion: the FE/views + auth/crypto/infra axes are now
FRESH — rotate onto the data/import/export + entities/factory families
(the s137 axes, two cycles stale by then), or take the B-L2
list-memoization family as its own performance cycle.**

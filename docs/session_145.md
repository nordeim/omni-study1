# Session 145 — Batch CL (Cycle 87): the audit-driven hardening cycle — the import-symmetry + cap-sizing + cards-bound + honest-copy set

**Received state:** `9c4e636` (the Batch CK state `b447446` + the operator's
session-log commit adding `docs/session_144.md`, the s136 record +
transcript). **Scope:** the audit-driven hardening cycle per the s136
closing directive — the deep-audit axes rotated onto the
**data/import/export + entities/factory families** (the s135 axes, two
cycles stale).

## 1. The workspace + the cold baseline

The 29th workspace continuation — the sandbox reset; a fresh clone at
`9c4e636`, `bun install` (496 pkgs), `.env` re-created from the current
`.env.example` (`DATABASE_URL="file:../db/custom.db"` — the contract, `db/`
at the repo root), `db/` pushed + seeded, chromium-1243 provisioned, the
dev daemon started (preflight GREEN).

The baseline re-certified cold BEFORE any work: lint ✓ · `tsc --noEmit` ✓ ·
unit **1344/1344** (45 files) · the canonical build green · the cold
5-chunk e2e **593/593 — 150+184+79+94+86, every chunk first-pass**.

## 2. The audits

**Mode-C (the Batch CK diff `ad0d8e7..b447446`, 37 files, +1521/−65):
0C/0H/0M/4L/4I — all TEN CK claims verified against the tree (9 TRUE,
CK9 PARTIAL), zero key material, the four touched e2e spec files re-run
GREEN by execution (auth 7/7, s16-perf-parity 4/4, resilience 28/28,
theme-system 18/18 — all five new CK legs green).** The four Lows:
**MC-F1** PAD §8.1's Total row still off-by-one (`77/1938` vs the actual
76 rows / badge 1937 — the legacy setup double-count the CK9 regeneration
claimed to close) plus NINE stale E2E per-file rows (four of them files
the CK diff itself touched); **MC-F2** the `loginGlobal:`/
`registerGlobal:` buckets evictable via cross-route bucket-map pressure;
**MC-F3** the CK1 success-reset's credential-holder window (the
documented mixed-crowd posture); **MC-F4** the CK4 analytics comment
mis-describing its own AND-form fix.

**Audit A — the data/import/export axis (fresh eyes): 0C / 0H / 1M / 3L /
4I.** The all-or-nothing import transaction, the complete userId
re-scoping (no IDOR-by-import), the deterministic export ordering, the
double secret guard, and the pre-Prisma FK validation re-verified sound.
**A-M1**: the import cap's justification arithmetic ~2× off — 25 MiB
covers ~9.4 max-size files, not the documented ~18; a 10+-file user's own
backup 413s at restore. **A-L1**: the folder-delete dialog copy
mispredicts SetNull (root, not the enclosing folder). **A-L2**: a legal
many-rows envelope can exceed the 60 s interactive transaction → P2028 →
the opaque 500 (rollback correct, copy not actionable). **A-L3**: the
export's unbounded read residual (the documented completeness contract).

**Audit B — the entities/factory axis (fresh eyes): 0C / 0H / 2M / 1L /
5I.** The owned-FK doctrine, the mass-assignment guard, the error/status
contract, the index census, the delete-account cascade, and the seed
re-verified sound (164 family unit tests green). **B-M1**: the timetable
equal-times asymmetry — the interactive boundary admits a zero-length
class (`<`) but the import rejects `<=`, so one legally-created row
bricks the entire restore (LIVE-PROBED in both modules). **B-M2**: the
flashcard card list is the family's only unbounded read (the import
route the documented ~10^5-card mint vector). **B-L1**: the import
accepts far-future createdAt/updatedAt — the newest-500 window-poison
vector (LIVE-PROBED: 9999 accepted). **B-I1**: no pin for cross-user
ITEM isolation on the factory.

Every M/L finding re-verified by direct read before the plan;
`docs/remediation-plan-session137.md` written and validated BEFORE
execution.

## 3. Live parity (both hosts — agent-browser + the standing drawer script)

**Clone** — `drawer-check-s14` **GREEN — the 49th consecutive
no-Tailwind-v4-mobile-nav-bug confirmation at baseline** (and the **50th**
on the remediated tree at re-cert).

**Reference** (logged in with the operator-provided account): the desktop
chrome battery held (sidebar 260px, exactly 20 links, main 1099px). **The
CL5 ground truth (NEW, measured live): the reference's folder delete is
IMMEDIATE — the Files folder-row "…" menu's Delete item removes the folder
with NO confirmation dialog at all** (probed with a create→delete
zz-parity-probe folder; the probe self-cleaned). The clone's confirm
dialog is superset territory; its copy is clone-territory under the
honest-copy doctrine — no parity contract constrains the fix.

## 4. The CL set (TDD — 11 unit + 3 e2e defect pins verified RED for the
designed reasons, plus the CL9 coverage pin landing GREEN on the pre-fix
tree [the CK3 designed expectation — the finding was the missing pin, not
a defect] and the CL2 413 leg re-tagged in place; unit 1344 → 1356 [45
files], e2e 593 → 596 [150+184+81+95+86])

- **CL1 (M — B-M1)** the timetable import symmetry: the seam's compare
  `<=` → `<` (mirroring `hhmmEndBeforeStart` exactly — the only direction
  that repairs the round-trip for accounts already holding such rows);
  the unit leg (the equal-times span imports clean) + the e2e wire leg
  (the API creates the 09:00–09:00 class → 201, the envelope carrying
  that very row restores → 200 with the summary, the finally-cleanup
  DELETE).
- **CL2 (M — A-M1)** the import cap sizing: 25 → **64 MiB** with the
  corrected arithmetic comment and the MACHINE-PINNED bound
  (`floor(cap / 2,796,204) >= 18` — the next re-size reconciles with the
  real bound, not a prose claim); the e2e 413 leg re-tagged to the 64 MiB
  boundary (RED on the copy, GREEN at the new cap).
- **CL3 (M — B-M2)** the cards bounded read: the BZ13 sibling form (desc
  + take + reverse) at the **deck-completeness 5000 window** — 10× the
  sibling newest-500 (study mode runs a deck's full set; the deck counts
  stay honest), the import mint vector degraded to the window; the
  script-conventions census pin.
- **CL4 (L — MC-F1)** the PAD §8.1 FULL regeneration, executed LAST on
  the final census: every E2E row re-counted from `playwright test
  --list` (nine stale rows corrected), the unit rows re-verified exact,
  the Total corrected to the honest 76/1948 direct sum with the 1952
  badge census and the setup's 5-run cert artifact defined in a footnote.
- **CL5 (L — A-L1)** the folder-delete dialog honest copy: "Files and
  subfolders inside are kept and move to All Files." (the actual SetNull
  outcome for files AND child subfolders); the census pin + the live
  verification probe + the self-verifying evidence frame.
- **CL6 (L — B-L1)** the import date sanity band: createdAt/updatedAt
  must parse inside **[2000-01-01, now + 24h]** or the row rejects
  pre-transaction with the named copy (the 9999/1900 window-poison
  vectors closed); user-facing date fields deliberately un-banded; five
  unit legs.
- **CL7 (L — MC-F4)** the analytics OR-form gate: the gradetracker
  doctrine applied to the six stat families (any primary source empty
  while loading owns the row); the comment corrected to describe the
  OR-form honestly; the held-route e2e leg (hold /api/assignments, the
  five landed families make the AND-form's false zero render pre-fix).
- **CL8 (L — MC-F2)** the global-bucket eviction exemption:
  `evictOldestBucket` skips the `Global:` keys — the containment budgets
  survive cross-route distinct-key pressure; the map's bound unchanged
  (the exemption chooses the eviction VICTIM, never skips the eviction);
  the behavioral auth.test leg (the loginGlobal: bucket SURVIVES a
  2100-key flood past the cap).
- **CL9 (L — B-I1)** the cross-user ITEM isolation pin: the fresh user's
  task PATCHed and DELETEd from the demo context answers **404 both
  ways** — the factory's ownership-in-the-where-clause invariant finally
  wire-pinned; a coverage pin landing GREEN on the pre-fix tree (the
  designed expectation).
- **CL10 (L — A-L2 + A-I1)** the import error family: **P2028 → the
  named 413** ("too large or slow to restore in one pass and was fully
  rolled back. Try again, or split the backup and retry the halves." —
  the honest many-rows-tail framing) + the P2002 409 copy naming BOTH
  collision causes (the concurrent-create race AND the cross-account
  global-PK collision the old "re-export" advice could never help); the
  http-body behavioral pin on the REAL PrismaClientKnownRequestError +
  the route-copy census.
- **CL11 (I)** the consistency trio: the myday dead inner gate dropped
  (the outer CK4 gate owns the state), the strip-loop twins single-sourced
  behind the seam's exported `stripSecrets` (the BW8 doctrine's last
  inch), the RUM retention trim wrapped in its `$transaction` (its
  calculator/ai twins' shape).

## 5. The re-cert

lint ✓ · `tsc --noEmit` ✓ · unit **1356/1356** (45 files) · the canonical
build green · the new e2e pins verified GREEN standalone (resilience
S137/CL ×3, s17 CL9 ×2, s23-import 13/13, s16+theme+auth 30/30 — the CK1
flood pin still terminal) · the cold 5-chunk e2e **596/596 —
150+184+81+95+86, every chunk first-pass** (chunk 1's one first-run BU7
flake was the machine-load class — the Prisma socket-timeout signature
visible in the passing chunks' logs, the dev daemon the contention source
— re-verified **150/150 first-pass standalone** with the source removed) ·
the register tripwire **255/136/0/119** (the 48th consecutive hold; the
expectation stated BEFORE the measurement [254/135 + the one
capture-script rider, the Usage line per the convention] and holding
exactly) · the live drawer battery GREEN — **the 50th consecutive
no-Tailwind-v4-mobile-nav-bug confirmation** · three evidence frames under
`docs/screenshots/137-clone-*` (the desktop dashboard, the mobile drawer,
and the CL5 folder-delete honest-copy dialog — the capture script's own
waitForFunction on the corrected "move to All Files" text the
self-verification; pixel-stat-verified non-blank; the probe folder
self-cleaned, the demo folders list verified empty after). **Census:
1356 unit + 596 e2e = 1952 green.**

## 6. The honest mid-run corrections (the full ledger)

1. The CL1 and CL9 e2e pins' create-legs asserted `status === 200` — the
   collection-POST convention answers **201** (the first CL1 run failed
   at the create, not the import; the CL9 run never reached its isolation
   assertions). Both re-tagged to 201; the CL1 RED then failed at the
   DESIGNED line (the import 400).
2. The CL7 analytics edit shifted the CJ3 hue-tokens register's
   analytics-view line anchors (423 → 429) — the register re-anchored per
   the line-shift convention.
3. The CL3 cards-delegate GREEN edit's first draft called the
   `makeOwnedDelegate`-scoped `normalize` helper from module scope — a
   scope error caught by typecheck; the card list needs no fromRow
   normalization, fixed before any gate ran.
4. The CL11 route twin deletion left `NEVER_IMPORT_FIELDS` imported but
   unused — the import removed (the field list stays single-sourced in
   the seam).
5. The CL8 map-bound assertion honest-formed to `<= MAX_BUCKETS` (the
   plan's draft wording "MAX_BUCKETS + 2" was wrong: the exemption only
   chooses the eviction VICTIM, the map's bound is unchanged).
6. The plan's §3 note listing CL9 among the "true REDs" was an error —
   CL9 is a coverage pin landing GREEN on the pre-fix tree (the CK3
   designed expectation); corrected in the plan's §5.
7. The evidence capture script's first draft used CommonJS `require` in
   an `.mjs` (ERR_AMBIGUOUS_MODULE_SYNTAX) — converted to ESM imports.
8. The cert's one first-run BU7 flake (chunk 1, 149+1) — the machine-load
   class, discriminated by the standalone cold re-run (150/150 first-pass)
   after stopping the contention source; the socket-timeout signature was
   visible in the PASSING chunks' logs (chunks 2/4/5) — documented
   honestly, never silently counted away.

## 7. The docs set (same commit)

README (the badge 1952 + the census lines + the S137 row), AGENTS.md (the
census anchors + the S137 lessons section), PAD **v1.3.45** (the revision
block + the §8.1 full regeneration), the SKILL doc (the census anchors),
the vitest header (45/1356 + the S137/CL re-anchor block), the cert
re-tags (the S137/CL block + Expected 596 in both + the
script-conventions Expected pin), the plan's §5 (the as-executed record
with the full corrections ledger), this record, and the worklog entry.

## 8. Deferrals (documented, with rationale — the plan's §4)

MC-F3 (the credential-holder containment window — the documented
mixed-crowd posture), A-L3 (the export's unbounded-read residual — the
completeness contract), A-I2 (the RUM CSV LF separator — the pinned
shipped contract), A-I4 (the bespoke import validator — the recorded
S133/CH4 decision), B-I2 (the calculator/history budget exception), B-I4
(the pre-warm over-provision — the harmless direction), B-I5 (the
unguarded-delegate TOCTOU — verified benign), and the standing
s133–s136 deferred set (the B-L2 list-memoization family now
cards-bounded by CL3). **Next cycle suggestion: the data/import/export +
entities/factory axes are now FRESH — rotate onto the FE/views +
auth/crypto/infra families (the s136 axes, two cycles stale by then), or
take the B-L2 list-memoization family as its own performance cycle.**

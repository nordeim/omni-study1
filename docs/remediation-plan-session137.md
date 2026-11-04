# Remediation Plan — Session 137 / Batch CL (Cycle 87)

**Received state:** `9c4e636` (the Batch CK state `b447446` + the operator's
session-log commit adding `docs/session_144.md`, the s136 record +
transcript).
**Scope:** the audit-driven hardening cycle — the import-symmetry +
cap-sizing + cards-bound + isolation-pin set.

## 0. Scope and Method

The same standing method: cold baseline re-certified BEFORE any work; the
Mode-C audit of the received Batch CK diff; the two ROTATED deep audits per
the s136 closing directive (the axes onto the **data/import/export +
entities/factory families** — the s135 axes, two cycles stale); every M/L
finding re-verified by direct read (the three M's re-probed live by their
auditors) before this plan; live parity on BOTH hosts before the plan (the
drawer check + the reference battery, including the reference-side
folder-delete measurement for the CL5 parity question); TDD (RED verified
for designed reasons → GREEN → re-factor); full cold re-cert on the final
tree; the docs chain re-anchored in the same commit. The repo `skills/`
folder excluded from checking, testing, and compilation throughout.

### Baseline (cold, BEFORE any work — on the received tree)

lint ✓ · `tsc --noEmit` ✓ · unit **1344/1344** (45 files) · the canonical
build green · the cold 5-chunk e2e **593/593 — 150+184+79+94+86, every
chunk first-pass** (the `[ai/chat] generation failed` log lines are the
resilience specs' own failure-injection noise, not failures).

### Live parity (both hosts — agent-browser + the standing drawer script)

**Clone** — `drawer-check-s14` **GREEN — the 49th consecutive
no-Tailwind-v4-mobile-nav-bug confirmation at baseline** (both hosts
probed, every match-check true: the 288px white panel, the
blur(4px)+rgba(0,0,0,0.2) backdrop, exactly 20 links, no footer,
Escape-close).

**Reference** (logged in with the operator-provided account): the desktop
chrome battery held — sidebar 260px, exactly 20 links, main 1099px. **The
CL5 ground truth (NEW, measured live): the reference's folder delete is
IMMEDIATE — the Files folder-row "…" menu's Delete item removes the folder
with NO confirmation dialog at all** (probed with a create→delete
zz-parity-probe folder on the reference account; the probe folder
self-cleaned). The clone's confirm dialog is therefore SUPERSET territory
(a safety affordance the reference lacks) — the dialog COPY is
clone-territory where the honest-copy doctrine governs, and no parity
contract constrains the fix.

### The audits (rotated fresh eyes — the s136 closing directive executed)

**Mode-C (the Batch CK diff `ad0d8e7..b447446`, 37 files, +1521/−65):
0C/0H/0M/4L/4I — all TEN CK claims verified against the tree (9 TRUE,
CK9 PARTIAL), zero key material, the four touched e2e spec files re-run
GREEN by execution (auth 7/7, s16-perf-parity 4/4, resilience 28/28,
theme-system 18/18 — including all five new CK legs).** The four Lows:
**MC-F1** PAD §8.1's Total row still off-by-one (`77/1938` vs the actual
76 rows / badge 1937 — the legacy setup double-count the CK9 regeneration
claimed to close) and NINE stale E2E per-file rows (auth-flows 18 vs 23,
auth 6 vs 7, navigation 61 vs 64, resilience 22 vs 28, s14-hardening 22 vs
23, s16-perf-parity 3 vs 4, s23-import 10 vs 12, tasks 9 vs 11,
theme-system 16 vs 18 — four of them files the CK diff itself touched);
**MC-F2** the `loginGlobal:`/`registerGlobal:` buckets are evictable via
cross-route bucket-map pressure (a distinct-key flood on the per-IP-only
routes — verify/resend/forgot — fills the 2048-cap map and the
oldest-first eviction can delete a global bucket mid-flood, restarting its
count); **MC-F3** the CK1 success-reset lets a credential-holding attacker
hold the containment window open (documented tradeoff — the mixed-crowd
posture); **MC-F4** the CK4 analytics comment mis-describes its own fix
(the AND-form cannot fix the claimed mixed-landing false zeros — only the
OR-form does; the site is also the one CK4 gate with no pin).

**Audit A — the data/import/export axis (fresh eyes): 0C / 0H / 1M / 3L /
4I.** The all-or-nothing import transaction, the complete userId
re-scoping (no IDOR-by-import), the deterministic export ordering, the
double secret guard, and the pre-Prisma FK validation all re-verified
sound. **A-M1**: the import cap's justification arithmetic is ~2× off — a
2 MiB upload inflates to 2,796,204 base64 chars, so 25 MiB covers ~9.4
max-size files, not the documented ~18; a user with 10+ near-cap files
(achievable inside ONE 15-min upload budget of 20) downloads a backup
their own in-app restore then 413s — the exact BY3 failure class,
resurfaced at 2× the documented threshold. **A-L1**: the folder-delete
confirm copy mispredicts the destructive outcome — SetNull moves contained
files AND subfolders to root (All Files), not "the enclosing folder".
**A-L2**: a legal max-row-count envelope can exceed the 60 s interactive
transaction → P2028 → the unmapped opaque 500 (rollback correct, copy not
actionable). **A-L3**: the export's unbounded read + full in-memory
stringify — the documented completeness contract's residual self-DoS tail.

**Audit B — the entities/factory axis (fresh eyes): 0C / 0H / 2M / 1L /
5I.** The owned-FK doctrine (every generated query scoped), the
mass-assignment guard, the error/status contract, the index census, the
delete-account cascade, and the seed all re-verified sound (164 unit tests
across the family re-run green). **B-M1**: the timetable equal-times
asymmetry — the interactive boundary admits a zero-length class
(`endMin < startMin` rejects only inversion) but the import seam rejects
`<=`, so ONE legally-created 09:00–09:00 row in an export bricks the
ENTIRE all-or-nothing restore with a message blaming a row the app itself
minted (live-probed both modules; the events/grades sibling guards are
symmetric — only timetable drifted). **B-M2**: the flashcard card list is
the family's ONLY unbounded read (no `take` — "the take would hide cards")
with the import route as the documented mint vector (~10⁵ cards in one
envelope), after which every boot transfers the entire card table.
**B-L1**: the import accepts arbitrary `createdAt`/`updatedAt` —
hand-edited far-future timestamps permanently poison the newest-500
windows (live-probed: `9999-12-31` accepted; with ≥500 poisoned rows all
real data vanishes from every in-app list). **B-I1**: no automated pin for
cross-user ITEM isolation on the factory (PATCH/DELETE a foreign-owned id
→ 404 — a regression dropping `userId` from the delegate where-clause
would pass every existing test).

Every M/L finding re-verified by direct read before this plan; the two
live-probe findings (B-M1, B-L1) re-confirmed against the seam source.

## 1. Findings → the CL set

| # | Source | Finding | Class |
|---|---|---|---|
| CL1 | B-M1 | the timetable equal-times import asymmetry bricks the restore | M |
| CL2 | A-M1 | the import cap arithmetic ~2× off — the round-trip breaks at ~9 max-size files | M |
| CL3 | B-M2 | the cards list is the family's only unbounded read (the import mint vector) | M |
| CL4 | MC-F1 | PAD §8.1's Total row + nine stale E2E per-file rows (the CK9 follow-through) | L |
| CL5 | A-L1 | the folder-delete dialog copy mispredicts SetNull (root, not the enclosing folder) | L |
| CL6 | B-L1 | the import accepts far-future createdAt/updatedAt (the window-poison vector) | L |
| CL7 | MC-F4 | the analytics AND-form gate + its mis-describing comment (the unCK4'd site) | L |
| CL8 | MC-F2 | the global buckets are evictable under cross-route bucket-map pressure | L |
| CL9 | B-I1 | the factory's cross-user ITEM isolation has no pin | L |
| CL10 | A-L2 + A-I1 | the import error family: P2028 → the opaque 500; the P2002 409 copy misleads for the cross-account case | L |
| CL11 | MC-F7 + A-I3 + B-I3 | the consistency trio: the myday dead gate, the strip-loop twins, the RUM trim's missing tx | I |

## 2. The CL set — design

### CL1 (M) — the timetable import symmetry (B-M1)

The doctrine: **the import validates what the app itself can mint** — the
round-trip contract (ADR-019) means an export of a legally-created row
must restore. The route's atom (`hhmmEndBeforeStart` → `endMin <
startMin`) admits a zero-length class; the UI's timetable dialog has no
start/end guard; the seed pads hhmm. The fix direction is therefore the
IMPORT side: change the seam's compare from `<=` to `<` (strict — mirror
`hhmmEndBeforeStart` exactly), so an equal-times row imports clean while a
genuinely inverted span still rejects with the existing BW7/BX1 message.
(Tightening the route instead would strand every existing account
containing such a row — the round-trip would STILL break for them; the
mirror is the only direction that repairs it.)

**The pins**: the unit leg in data-import.test.ts next to the existing
inverted-span leg — `sanitizeImportRow("timetableClasses", { startTime:
"09:00", endTime: "09:00" })` does NOT throw (RED pre-fix: throws the
"must be after" ImportRowError); plus the e2e wire leg (resilience, chunk
3, riding the DEMO session — chunk 5's demo import budget is documented at
9/10 with zero register headroom, chunk 3's import budget is 4/10): POST
`/api/timetable` with `startTime: "09:00", endTime: "09:00"` → 200 (the
interactive boundary ADMITS it — the asymmetry proven live at the wire),
then POST the import envelope carrying that same row → 200 with
`timetableClasses` in the created/updated summary (RED pre-fix: 400 "field
\"endTime\" must be after \"startTime\""), then the finally-cleanup DELETE
of the timetable row (the AM1/AN1 convention).

### CL2 (M) — the import cap sizing (A-M1)

Raise `IMPORT_MAX_BYTES` from 25 MiB to **64 MiB** and correct the
comment's arithmetic honestly: a 2 MiB upload inflates to 2,796,204 base64
chars (×4/3), so the caps cover **~9.4** (25 MiB) and **~23** (64 MiB)
max-size files respectively — the old "~18 at 25 MiB" claim was ~2× off;
64 MiB covers the documented realistic round-trip (~18 max-size files'
base64 + content) with margin, matching the auditor's recommendation. The
route and the panel interpolate the constant in their copies
(`${IMPORT_MAX_BYTES / (1024 * 1024)} MiB`) — single-sourced, both update
together. The memory tail is bounded by the same read-cap discipline
(counting reader, 413 at the cap); the 60 s transaction budget is
unchanged (a 64 MiB envelope of file rows is ~46 large writes, well under
it — the many-ROWS tail is CL10's named mapping).

**The pins**: the unit const pin re-tags to `64 * 1024 * 1024` with the
corrected rationale, plus a NEW arithmetic leg asserting the honest
round-trip bound (`Math.floor(IMPORT_MAX_BYTES / 2_796_204) >= 18` — the
"realistic round-trip" promise, machine-checked so the next re-size
reconciles with it); the e2e 413 leg re-sizes its probe to `64 MiB + 1`
(RED-by-construction against the old 25 MiB cap? no — the 413 leg at 64
MiB + 1 PASSES under both caps; the honest RED for this cycle is the unit
const pin + the arithmetic leg; the 413 leg re-tags its size and its
"64 MiB" copy assertion so the wire contract stays pinned at the NEW
boundary); the BY3 between-caps acceptance leg (~12 MiB → 200) is
unchanged and still passes.

### CL3 (M) — the cards bounded read (B-M2)

The cards delegate joins the bounded-reads family at **5000** — the BZ13
sibling form (`orderBy: [{ createdAt: "desc" }, { id: "desc" }], take:
5000` then reverse to the asc presentation), NOT the sibling 500: the
deck-completeness contract (study mode runs a deck's full card set; the
deck counts must be honest) keeps the bound 10× the sibling window, past
which the newest-5000 window applies exactly like every sibling
collection. The sizing rationale: the AI drafts 20 cards per generation; a
realistic power-user library (~20 decks × 250 cards) sits well under 5000;
the import mint vector (~10⁵ cards in one envelope) — the exact growth
vector CA5/CB10 cited when bounding the file-family GETs — now degrades
to the newest-5000 window instead of the unbounded every-boot transfer.
The schema-indexes census's "Flashcard … out of scope by design" note
stays TRUE (the window bounds the read; the deck-scoped join pattern is
unchanged).

**The pin**: the script-conventions source-census leg — the
`flashcardCardDelegate` list block carries `take:` with the
deck-completeness doctrine comment (RED pre-fix: the block has no take).

### CL4 (L) — the PAD §8.1 full regeneration (MC-F1, executed LAST)

The CK9 follow-through, closing the class properly this time: every E2E
per-file row re-counted from `playwright test --list` on the FINAL tree
(nine stale rows corrected: auth-flows, auth, navigation, resilience,
s14-hardening, s16-perf-parity, s23-import, tasks, theme-system — plus
the two files this cycle touches), the Total row corrected to the actual
row count with the badge sum (the legacy setup double-count defined in a
footnote, not silently absorbed), the unit rows verified exact (they
already are — 45 rows summing 1344). Executed LAST on the final census,
per the CK9 doctrine.

### CL5 (L) — the folder-delete dialog honest copy (A-L1)

The reference measurement (this cycle, live): the reference's folder
delete is immediate, no dialog — the clone's confirm is superset, its copy
is clone-territory. The copy corrects to the actual SetNull outcome:
**"Files and subfolders inside are kept and move to All Files."** (both
the file rows AND the child subfolders re-parent to root — the schema's
`onDelete: SetNull` on `FileItem.folderId` and `FileFolder.parentId`).
"This cannot be undone." stays.

**The pin**: the script-conventions source census — files-view.tsx carries
the "move to All Files" copy and NOT the "enclosing folder" copy (RED
pre-fix: the old copy present, the new absent).

### CL6 (L) — the import date sanity band (B-L1)

`sanitizeImportRow` gains a band check for the two SYSTEM-minted
timestamps (`createdAt`, `updatedAt` — the fields the newest-500 windows
sort on): the parsed value must fall within **[2000-01-01T00:00:00.000Z,
now + 24 h]**, else the named ImportRowError ('field "createdAt" is
outside the importable date range — the export format carries real
timestamps between 2000 and now + 1 day.'). The bounds: an account
genuinely created years ago imports clean (2000 floor); a clock-skewed
client's near-future timestamps import clean (24 h ceiling); the
far-future poison (9999) and the far-past garbage (1900) reject BEFORE the
transaction with the actionable copy instead of silently poisoning every
window. User-facing date fields (dueDate, exam dates — legitimately years
in the future) are deliberately NOT banded. Non-Date-typed garbage strings
keep their existing graceful path (PrismaClientValidationError → the CJ5
400).

**The pins**: three unit legs in data-import.test.ts — far-future
(9999) rejected, pre-2000 rejected, an old-but-legit timestamp (2015)
accepted (all RED-appropriate: the first two currently pass through).

### CL7 (L) — the analytics OR-form gate (MC-F4)

The CK4 follow-through at the one site the sweep left in the AND-form: the
gate widens to the OR-form over the six stat families —
`loading && (tasks.length === 0 || grades.length === 0 || subjects.length
=== 0 || assignments.length === 0 || exams.length === 0 ||
focusSessions.length === 0)` — the gradetracker doctrine (S136 lesson 5:
for a stat row fed by N collections, the in-flight gate is the OR-form;
any primary source empty while loading = the row is untrustworthy). The
comment corrects to describe the OR-form honestly (the AND-form could
never fix the mixed-landing false zeros it claimed to). The settled-zero
contract (the S17-D fresh-user zero-stat pins — `!loading && all empty`
renders the zero cards) is untouched: a fresh user's completed load flips
`loading` false and the OR-form releases.

**The pin**: the resilience held-route e2e leg (the CG6/CK4 idiom): hold
`**/api/assignments` (one of the six pre-warmed families — the others
land), navigate `/Analytics`, wait hydrated, assert the stat group
(`[aria-label="Analytics stats"]`) renders NOWHERE and the Spinner is
visible (RED pre-fix: the five landed families make the AND-form false →
the row renders with the false "0" Assignments stat).

### CL8 (L) — the global-bucket eviction exemption (MC-F2)

`evictOldestBucket` skips the fixed process-wide budget keys (any key
containing `"Global:"` — `loginGlobal:`, `registerGlobal:`): the
containment budgets must not be evictable by cross-route distinct-key
pressure (the rotated-XFF flood on the per-IP-only routes —
verify/resend/forgot — that fills the 2048-cap map). The map's bound
honest-forms to `MAX_BUCKETS + the count of global keys` (2) in the
comment — still O(1) memory, still swept. The exemption is safe because
the globals are a FIXED, tiny, always-live set (never more than 2 keys
exist), so the eviction always finds a non-global oldest.

**The pin**: the behavioral leg in auth.test.ts (the BU6 eviction-pin
family, with `resetAllRateLimits()` hygiene): seed `checkRateLimit(
"loginGlobal:", 1)` (count 1 — the bucket is now the OLDEST live entry),
flood 2100 distinct `flood:${i}` keys (past MAX_BUCKETS — the eviction
path fires repeatedly), then assert `checkRateLimit("loginGlobal:",
1).ok === false` (the bucket SURVIVED with count 1 ≥ max 1 — RED pre-fix:
the flood evicted the oldest bucket, the re-created bucket answers ok) and
`rateLimitBucketCount()` ≤ MAX_BUCKETS + 2 (the bound honest).

### CL9 (L) — the cross-user ITEM isolation pin (B-I1)

The factory's core security invariant gets its wire pin: in
s17-fresh-user.spec.ts (chunk 4 — the register-budget analysis: chunk 4's
census is 3 registrations, all in this file; a 4th rides comfortably under
the 10/IP cap and the registerGlobal 40), a new describe registers a
fresh user (`registerFreshUser(page, "cl9-iso")` — the existing helper),
creates a task via `page.request` (user2's own session), then opens a
DEMO-context (`browser.newContext({ storageState:
"tests/e2e/.auth/user.json" })` — the project's own signed-in state) and
asserts the demo session's PATCH and DELETE on user2's task id both answer
**404** (the owned-FK delegate's `findFirst({ where: { id, userId } })` →
NotFoundError → 404 — never 403, never 200). The finally-cleanup: user2
deletes their own task; the demo context closes. A regression dropping
`userId` from the delegate's update/remove where-clause turns this pin
RED (it would answer 200/204).

### CL10 (L) — the import error family (A-L2 + A-I1)

(1) **P2028 → the named 413**: `toErrorResponse` maps
`PrismaClientKnownRequestError` code P2028 (interactive-transaction
timeout) to **413** with the actionable copy "That backup was too large
or slow to restore in one pass and was fully rolled back. Try again, or
split the backup and retry the halves." — the honest framing of the
many-rows tail (the body was UNDER the byte cap; the time budget is the
binding constraint; the rollback already held). The behavioral pin in
http-body.test.ts constructs the real
`Prisma.PrismaClientKnownRequestError` (code "P2028", constructor probe
verified this cycle) and asserts `toErrorResponse(...).status === 413` —
RED pre-fix: the generic 500 branch.
(2) **The P2002 409 copy generalization** (the import route's
ImportConcurrentCreateError branch): the copy names BOTH collision
causes honestly — "That ${collection} row (id "${id}") collides with an
existing record — either it was created while this import ran, or this
backup's ids already belong to another account. Edit the backup's ids or
restore into the original account." (the dominant real trigger is the
cross-account global-PK collision, for which "re-export a fresh backup"
was advice that could never help). The script-conventions source census
pins the new copy's core phrase + the old phrase's absence.

### CL11 (I) — the consistency trio (MC-F7 + A-I3 + B-I3)

Three micro-fixes, each behavior-preserving with the standing suites as
the characterization net: (1) the myday-view dead inner loading gate (the
outer CK4 gate owns the `loading && tasks.length === 0` state — the inner
ternary arm is unreachable; drop it); (2) the strip-loop single-sourcing
(the BW8 doctrine's last inch: the seam exports `stripNeverImportFields`
and the import route's byte-identical private twin is deleted — both
sites consume the single loop over NEVER_IMPORT_FIELDS); (3) the RUM
retention trim wraps in `db.$transaction` (its calculator and ai twins
are already transactional; deletes-only-by-id-list converges either way —
the consistency close).

## 3. The TDD pins (RED design — the projection)

**Unit (1344 → ~1355, 45 files):** data-import.test.ts +4 (CL1 equal-times
accepted; CL2 arithmetic leg; CL6 ×3 date-band legs) · script-conventions.test.ts +4 (CL3 cards-take census; CL5 dialog-copy census; CL10 route-copy census + the CL8 source census if behavioral coverage needs a twin) · auth.test.ts +1–2 (CL8 eviction-exemption behavioral) · http-body.test.ts +1 (CL10 P2028 → 413) · the CL2 const pin re-tags in place (+0). Projection ~+11; the honest landing count replaces it.

**E2e (593 → 596, the chunk map 150 + 184 + 81 + 95 + 86):** resilience
+2 (chunk 3: the CL1 equal-times round-trip leg + the CL7 analytics
held-route leg) · s17-fresh-user +1 (chunk 4: the CL9 isolation leg) ·
the CL2 413 leg re-tags size+copy in place (+0). The chunk-3 additions
are mid-file (resilience is alphabetically before s16-perf-parity — the
CK1 flood pin stays TERMINAL, last test of the chunk's last file); both
new resilience legs ride the demo session (chunk 3's import budget
4 → 5/10; no registrations added).

**The register tripwire** (stated BEFORE the measurement, the 48th
consecutive hold): the CK final tree holds **254/135/0/119**; this
cycle's one rider (capture-s137-evidence.mjs, a Usage-line playwright
script) joins the guarded class → **255/136/0/119**.

**RED discipline:** every defect pin verified failing for the designed
reason BEFORE its GREEN edit (the CL2 const re-tag and the 413 re-size
are re-tags of existing green pins — their RED is the design's own
honesty note, not a failing gate; the CL1/CL3/CL5/CL6/CL7/CL8/CL9/CL10
pins are true REDs).

## 4. Deferrals (documented, with rationale)

- **MC-F3** (the CK1 success-reset's credential-holder containment window):
  the documented mixed-crowd posture — a strict improvement over no bound;
  the decay-instead-of-reset redesign is a next-crypto-family-touch
  candidate.
- **A-L3** (the export's unbounded read + in-memory stringify): the
  documented completeness contract; the residual self-DoS tail is bounded
  by the 10/15-min export budget and requires sustained authenticated
  growth. A total-rows/bytes ceiling with an explicit error is the
  candidate redesign if the single-node posture ever changes.
- **A-I2** (the RUM CSV's LF record separator): the pinned shipped
  contract (the s20 e2e asserts the LF split); RFC 4180 §2 strictness is
  a cosmetic spec nit against a working, Excel-compatible export.
- **A-I4** (the import's bespoke validator instead of Zod): the recorded
  S133/CH4 single-source decision, machine-census-enforced — noted for
  conventions completeness, not a defect.
- **B-I2** (calculator/history POST carries no rate budget): the
  documented trimmed-table exception (per-request work bounded, table
  capped at 500/user).
- **B-I4** (the pre-warm's calendar/notes "subjects" over-provision):
  the HARMLESS direction (one extra parallel GET; the defect direction —
  view reads ⊄ pre-warm — verified clean). Removing it would touch the
  unit-pinned view-collections contract for a micro-optimization; defer
  to a view-collections-touching cycle.
- **B-I5** (the unguarded-delegate update/remove TOCTOU): verified benign
  (P2025 → 404, last-write-wins semantics); the corruption class was
  closed by CE5 for the guarded delegates.
- The standing deferred set: the HKDF domain separation, the
  Cache-Control no-store hardening, the dead-`required` dialog sweep, the
  500-item list-memoization family (B-L2 — NOTE: CL3's 5000 bound now
  caps the cards member of this family's exposure), the spinner
  live-region idiom, the dialog exit-animation pin pair, the studygroups
  focus ring + the notes Manage mobile entry, and the s133/s134/s135/s136
  deferred set.

**Next cycle suggestion:** the data/import/export + entities/factory axes
are now FRESH — rotate the deep audits onto the FE/views + auth/crypto/infra
families (the s136 axes, two cycles stale by then), or take the B-L2
list-memoization family as its own performance cycle (the exposure now
bounded on cards by CL3).

## 5. The as-executed record

**RED (all verified failing for the designed reasons before any GREEN
edit):** 11 unit pins — data-import ×6 (the CL1 equal-times throw; the
CL2 64 MiB const + the arithmetic bound; the CL6 far-future / pre-2000 /
far-future-updatedAt acceptances), auth ×1 (the CL8 loginGlobal: bucket
EVICTED under the flood), http-body ×1 (the CL10 P2028 → the generic
500), script-conventions ×3 (the CL3 no-take block, the CL5 old copy,
the CL10 old 409 phrase) — plus the e2e CL1 leg (the import 400 on the
app's own row), the CL7 leg (the stat group visible with the false zero),
and the CL2 413 re-tag (RED on the copy: "25 MiB" vs the asserted
"64 MiB"). The CL6 acceptance legs and the CL9 isolation leg landed GREEN
on the pre-fix tree — the designed expectation for coverage pins (the
CK3 precedent; the plan's §3 note listing CL9 among the "true REDs" was
an error, corrected here: CL9's finding was the MISSING pin, not a
defect).

**GREEN:** unit **1344 → 1356** (45 files: data-import +7, auth +1,
http-body +1, script-conventions +3) · e2e **593 → 596** (chunk 3
79 → 81, chunk 4 94 → 95) · lint ✓ · tsc ✓ · build ✓. The touched e2e
families verified GREEN standalone on the new build: resilience
(S137/CL ×3), s17-fresh-user (CL9 ×2 + the file green), s23-import
(13/13), s16-perf-parity + theme-system + auth (30/30 — the CK1 flood
pin still terminal and green).

**The honest mid-run corrections (the ledger):**

1. The CL1 and CL9 e2e pins' create-legs asserted `status === 200` — the
   collection-POST convention answers **201** (the first CL1 run failed
   at the create, not the import; the CL9 run never reached the isolation
   assertions). Both pins re-tagged to 201; the CL1 RED then failed at
   the DESIGNED line (the import 400).
2. The CL7 analytics edit shifted the CJ3 hue-tokens register's
   analytics-view line anchors (423 → 429) — the register re-anchored
   per the line-shift convention (the S136 correction-2 class, one cycle
   later).
3. The CL3 cards-delegate GREEN edit's first draft called the
   `makeOwnedDelegate`-scoped `normalize` helper from module scope — a
   scope error caught by typecheck; the card list needs no fromRow
   normalization (the plain reverse), fixed before any gate ran.
4. The CL11 route twin deletion left `NEVER_IMPORT_FIELDS` imported but
   unused (lint-class) — the import removed; the field LIST stays
   single-sourced in the seam, consumed by `stripSecrets` alone.
5. The CL8 map-bound assertion honest-formed to `<= MAX_BUCKETS` (the
   exemption only chooses the eviction VICTIM; the map's bound is
   unchanged — the plan's draft wording "MAX_BUCKETS + 2" was wrong and
   the pin was written to the honest form).

**The re-cert (the FINAL tree):** the cold 5-chunk e2e
**596/596 — 150 + 184 + 81 + 95 + 86, every chunk first-pass** · the
register tripwire measured **255/136/0/119** (the 48th consecutive hold;
the expectation stated BEFORE the measurement: the CK final tree's
254/135/0/119 + this cycle's one capture-script rider) · the drawer
battery GREEN on the remediated tree — **the 50th consecutive
no-Tailwind-v4-mobile-nav-bug confirmation** · three evidence frames
under `docs/screenshots/137-clone-*` (the desktop dashboard, the mobile
drawer, and the CL5 folder-delete honest-copy dialog — the capture
script's own waitForFunction on the corrected "move to All Files" text
the self-verification; pixel-stat-verified non-blank).
**Census: 1356 unit + 596 e2e = 1952 green.**

**The docs set (same commit):** README (the badge 1952 + the census
lines + the S137 row), AGENTS.md (the census anchors + the CL8/CL10
residuals + the S137 lessons section), PAD **v1.3.45** (the revision
block + the §8.1 full regeneration — the CL4 execution: every E2E
per-file row re-counted from `playwright test --list`, the Total row
corrected with the setup double-count defined in a footnote), the SKILL
doc (the census anchors), the vitest header (45/1356 + the S137/CL
re-anchor block), the cert re-tags (the S137/CL block + Expected 596 in
both + the script-conventions Expected pin), `docs/session_145.md`, the
worklog entry, and this §5.

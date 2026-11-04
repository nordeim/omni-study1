# Remediation Plan — Session 139 / Batch CN (Cycle 89)

**Received state:** `d7733c2` (the Batch CM state `cf37e36` + the operator's two
session-log commits adding `docs/session_148.md` + `docs/session_149.md`, the
s138 compact + full records).
**Scope:** the audit-driven hardening cycle — the parity-integrality +
round-trip-witness + covering-index + bounded-walk set.

## 0. Scope and Method

The same standing method: cold baseline re-certified BEFORE any work; the
Mode-C audit of the received Batch CM diff; the two ROTATED deep audits per
the s138 closing directive (the axes onto the **data/import/export +
entities/factory families** — the s137 axes, two cycles stale); every
H/M/L finding re-verified by direct read before this plan; live parity on
BOTH hosts before the plan (the drawer check + the reference desktop-chrome
battery — no reference-shared surface is touched by this cycle's set, so no
new reference measurement was required); TDD (RED verified for designed
reasons → GREEN → re-factor); full cold re-cert on the final tree; the docs
chain re-anchored in the same commit. The repo `skills/` folder excluded
from checking, testing, and compilation throughout.

### Baseline (cold, BEFORE any work — on the received tree)

The workspace had been reset (fresh clone per the task instructions). After
`bun install` (491 pkgs, foreground) + the chromium-1243 browser
re-provision (the reset wiped `~/.cache/ms-playwright` — the first chunk-1
attempt failed 149× on the missing headless-shell executable, re-run
first-pass after the install):

lint ✓ · `tsc --noEmit` ✓ · unit **1369/1369 (45 files)** ✓ (the
documented S138 final state exactly) · the canonical build green (the six
Turbopack warnings pre-existing, the db-path/instrumentation traces) · the
cold 5-chunk e2e **597/597 — 150+184+82+95+86, every chunk first-pass**
(the socket-timeout log lines are the documented machine-load noise class;
the `[ai/chat] generation failed` lines are the resilience specs' own
failure-injection noise, not failures).

### Live parity (both hosts — the standing scripts)

**Clone** — `drawer-check-s14` **GREEN — the 53rd consecutive
no-Tailwind-v4-mobile-nav-bug confirmation at baseline** (every match-check
true: the 288px white panel, the blur(4px)+rgba(0,0,0,0.2) backdrop,
exactly 20 links, no footer, Escape-close; the dev daemon started and
killed inside the same command — the S138 lesson-5 discipline).

**Reference** (logged in with the operator-provided account): the desktop
chrome battery held — the sidebar column at **258px computed (the standing
260px box)**, **exactly 20 nav items** with the standing labels
(Dashboard → Settings), the main column offset at x=260. No
reference-shared surface is modified by this cycle's set (every CN item is
backend seam, test, schema-index, or documentation) — the parity-pinned
surfaces are therefore untouched by construction, and the drawer +
chrome batteries above are the cycle's live witnesses.

## 1. The audits (rotated fresh eyes — the s138 closing directive executed)

**Mode-C (the Batch CM diff `f158877..cf37e36`, 30 files, +~1,500/−~250):
0C/0H/1M/4L/3I — all NINE CM claims verified TRUE against the tree.** The
findings are residuals OF the fixes: MC-M1 (M) the Dockerfile comment
claims the compose init profile "still runs as root" but the compose
`init` service carries NO `user:` override — after the image-level
`USER bun` the init job runs as bun (the named-volume path still works —
the image chowns /data — but the comment is false and a BIND-MOUNTED /data
owned by root now fails the SQLite open at first boot, a new deployment
failure mode the docs never mention); MC-L1 the login route's
pre-CM3 paragraph still narrates the overturned "SUCCESS-RESET … the
attack shape never succeeds" doctrine 100 lines above the decrement;
MC-L2 the CM8 census accepts `^USER ` — a regression to `USER root`
keeps it green; MC-L3 `omni-study1_SKILL.md:850` still lists the deleted
`ui/tooltip.tsx`; MC-L4 `AGENTS.md` S136 lesson 3 still teaches the
success-reset doctrine CM3 overturned (un-annotated); MC-I1 the s138 plan
§2 prose says the CSP has "no data:" while the shipped (correct) profile
carries `img-src 'self' data:`; MC-I2 the register route's deliberate
no-discharge asymmetry vs login is undocumented (a future symmetry pass
could reintroduce the AI-2 defeat on the register side); MC-I3
`package-lock.json` still pins the five CM7-removed Radix deps (the
npm lock diverged from the bun toolchain long ago).

**Audit A — data/import/export (the s137 axes, rotated back):
0C/0H/3M/4L/5I.** The clean surfaces verified first: the cross-user write
model (every probe `{id, userId}` / `{id, deck:{userId}}` — a foreign id
falls to create → P2002 → the named 409; NO path updates another user's
row), the all-or-nothing transaction, the secret guards both directions,
SetNull + topo-sort + cycle rejection, the CL6 date band, the CL1
equal-times symmetry, the files.url protocol guard, auth + the 10/15-min
budgets, the 64 MiB 413 path. **A-M1 (M)** the hand-crafted-envelope
parity contract still misses six cheap invariants the interactive routes
enforce: `assignments.progress`/`timetableClasses.dayOfWeek` admit
non-integers (12.5/3.5 pass the import guard → the generic
"fields do not match" 400 at Prisma, the exact CJ4 actionable-copy
degradation), `grades.maxScore` admits 0.5 (Float column — persists,
violating the family's own `min(1)` atom), `files.mime` rides the generic
1 M-char default (a poisoned row inflates EVERY files list GET — the CE7
bloat class), `files.size` admits negative/non-integer values,
`studyGroups.members` item shapes are unvalidated (the string bound is
the 1 M generic vs the ~15 K interactive reality). **A-M2 (M)** the
pin-net holes on the route's OWN documented contracts: the version FLOOR
(`version: 0` → the "older version" 400) has ZERO test references; the
409 cross-account collision branch (the route's own comment calls it
"the dominant real trigger") is pinned only by a pure parse helper + a
copy census — never at the HTTP level; the empty envelope
(`data: {}` → 200 zero-rows) is unpinned; and **no test anywhere
downloads `GET /api/export/data` and POSTs it back** — the family's
headline "own your data" round-trip across all 20 collections (incl. the
seeded unpadded `"9:00"` timetable rows, folders, chat, calc, holidays)
is never exercised end-to-end; the S117 cards break would have been
caught by exactly this pin. **A-M3 (M)** the large-restore availability
half: a 60 s interactive transaction with 2 queries/row (findFirst →
update|create) holds the single-node SQLite write lock — every other
write from every user queues behind it — while the restore ceiling is
TIME-bounded, the export is not, and the 413 remedy ("split the backup")
has no in-app tooling. **A-L1** the body-read catch-all answers a
confident 413 for ANY read failure (a client abort mid-stream is not "too
large"; the typed `BodyTooLargeError` exists and is unused here).
**A-L2** folders are topo-sorted BEFORE the sanitize loop, so
`Invalid folders[3]` names the SORTED index, not the backup file's row
index — an operator editing per the message lands on the wrong line.
**A-L3** imported note HTML renders through Quill's
`dangerouslyPasteHTML` with no server-side guard — a remote `<img src>`
survives as an open-time tracking pixel (pre-existing surface: the same
HTML is storable via a direct API POST — NOT import-caused).
**A-L4** the export panel surfaces the raw timeout DOMException message
(no `isTimeoutError` branch — the CE1 doctrine every auth surface
carries). A-I1 the knownIds census scans ALL 20 collections even when
the envelope contains none of them; A-I2 hand-crafted partial grade rows
are stricter than the interactive PATCH (documented decision); A-I3
files rows may carry both `data` and `url` (harmless — the view
classifies by `url`); A-I4 the client bundle pulls the ~1,200-line seam
for one constant; A-I5 the profile-patch drops the whole preferences
block on one bad leg (real exports carry valid blocks).

**Audit B — entities/factory (the s137 axes, rotated back):
0C/0H/3M/5L/2I.** The clean surfaces verified first: all 16 schemas
field-match their models exactly; ownership-by-construction holds on
every write path; foreign/missing ids → 404 on all factory verbs; the
desc+take+reverse window idiom is correct everywhere (BZ10 tiebreak, no
off-by-one); the merge guards are transactional with authoritative
re-reads; double validation cannot drift (3-line route shells).
**B-M1 (M)** the CL3 cards window re-opened the CC10 class: the list
query runs `orderBy [{createdAt desc}, {id desc}] take 5000` through the
`deck: { userId }` JOIN while Flashcard carries only `@@index([deckId])`
— SQLite temp-b-tree-sorts every owned card on every cards GET (the
class CC10 MEASURED at 34.6 ms/100k and closed with composites on all 19
factory-listed models; the census comment reads as if the class is
closed family-wide while the family's newest query re-opened it).
**B-M2 (M)** the hand-written card delegate's ownership guard has ZERO
behavioral pins — the CL9 class for the ONE delegate that doesn't share
the factory's where-clause: no test exercises PATCH/DELETE on a foreign
card id, POST with a foreign `deckId`, or PATCH re-pointing `deckId` to
a foreign deck; a regression dropping `deck: { userId }` from any of the
three where-clauses passes every existing test. **B-M3 (M)** the folder
re-parent cycle guard reads the user's ENTIRE folder table inside the
default-5 s transaction per PATCH (`findMany({where:{userId}})` — the
folders GET is bounded at 500 precisely because the import route can
mint ~10^5 folders in one envelope, but this guard's own read is
unbounded; cycle detection only needs the ancestor CHAIN, which is
depth-bounded). **B-L1** route-param ids are unvalidated and unbounded
(body ids cap at 64; an 8 KB path segment reaches `findFirst` verbatim —
Prisma parameterizes so no injection, purely the inconsistency).
**B-L2** the `orderBy: "asc"|"desc"` config branch is dead across all
sixteen delegates. **B-L3** `txModelName` resolution is unchecked — a
typo fails at first guarded PATCH as a 500, not at construction (the
loud-at-construction doctrine CE5 states is only half-enforced).
**B-L4** the P2002→409 / P2025→404 / P2003→400 mappings have no unit
pins (only P2028 is pinned, at CM4). **B-L5** owned-FK 404s are pinned
for tasks at CREATE only — the PATCH re-point leg and every other
delegate are unpinned. B-I1 the take:5000 window is comment-honest but
not behaviorally pinned (optional 5005-card leg).

Every H/M/L finding above was re-verified by direct read before this
plan (the exact lines re-read: the six guard gaps, the version floor,
the catch-all, the sort-before-sanitize ordering, the Quill paste call,
the panel's errorMessage, the Flashcard index set, the card delegate's
three where-clauses, the cycle guard's findMany, withUserParams, the
dead orderBy branch, the txModelName resolution, the Dockerfile/compose
user story, the login paragraph, the census regex, the SKILL row, the
lockfile).

## 2. The findings → the CN set

| # | Sev | Source | The defect | The fix |
|---|-----|--------|-----------|--------|
| CN1 | M | A-M1 | The import parity contract misses six cheap route invariants (progress/dayOfWeek integrality, maxScore ≥ 1, files mime/size, members item shape) | The six guard legs + six unit pins |
| CN2 | M | A-M2 | The round-trip pin-net holes: the version floor, the 409 collision, the empty envelope, and the export→import round-trip itself are all unpinned | 1 unit + 3 e2e legs (the headline: the family's own promise finally witnessed) |
| CN3 | M | B-M1 | The cards list ORDER BY has no covering index (the CC10-measured sort class, re-opened by CL3) | `@@index([createdAt, id])` on Flashcard + the census re-tag + a new census leg |
| CN4 | M | B-M2 | The hand-written card delegate's ownership guard has zero behavioral pins (the CL9 class) | The CL9-style e2e legs: foreign card PATCH/DELETE → 404, foreign deckId POST → 404 |
| CN5 | M | B-M3 | The folder cycle guard reads the user's ENTIRE folder table inside the transaction per PATCH | The bounded ancestor walk (one findFirst per hop, the visited-set termination) feeding the unchanged wouldCreateCycle seam + the route census |
| CN6 | L | A-L1 | The body-read catch-all answers 413 for ANY read failure (transport errors mislabeled "too large") | The typed `BodyTooLargeError` discrimination + the census |
| CN7 | L | A-L2 | Folders rejection copy names the topo-SORTED index, not the backup file's row index | Sanitize-before-sort (validate-only — order-independent) + the e2e leg + the census |
| CN8 | L | A-L4 | The export panel surfaces the raw timeout DOMException message | The `isTimeoutError` branch (the CE1 doctrine) |
| CN9 | L | MC M-1/L-1/L-2/L-3/L-4/I-2 | The doc-accuracy sextet: the Docker init-user comment + bind-mount guidance, the login stale paragraph, the USER-census regex, the SKILL tooltip row, the AGENTS S136 annotation, the register asymmetry comment | The honest re-tags + the DEPLOYMENT.md note + the census extensions |
| CN10 | L | B-L4/L-5 | The P2002/P2025/P2003 mappings and the owned-FK PATCH re-point are unpinned | 3 unit legs (the P2028 template) + 1 e2e leg |
| CN11 | L | B-L1/L-2/L-3 + MC-I3 | The small-hardening trio (unbounded route-param id, dead orderBy branch, unchecked txModelName) + the stale package-lock.json | The id bound (404), the dead-branch deletion, the construction check, the lockfile deletion + censuses |

Deferred (documented, with rationale — §4): A-M3 (the restore-availability
family: the lock-holding N+1 write loop, the knownIds skip, the split
tooling), A-L3 (the note-HTML sanitization), A-I2/I3/I4/I5, B-I1, MC-I1,
and the standing s133–s138 deferred set.

## 3. The design (per item)

### CN1 — the import parity integrality sextet (A-M1)

`src/lib/data-import.ts`, mirroring the interactive atoms exactly (the
ADR-021 parity contract — the import validates what the app itself can
mint):

1. `assignments.progress`: add `!Number.isInteger(progress)` to the
   existing rejection (the route atom is `z.number().int().min(0).max(100)`),
   message naming the integrality ("must be a whole number between 0 and
   100").
2. `timetableClasses.dayOfWeek`: same (the atom is `.int().min(0).max(6)`).
3. `grades.maxScore`: `maxScore <= 0` → `maxScore < 1` (the atom is
   `.min(1).max(1000)`; a Float 0.5 currently persists).
4. `files.mime`: registry entry `"files.mime": 100` + the files-block type
   check (string ≤ 100 — the interactive upload stores the browser's
   `entry.type`, realistically < 100 chars; a poisoned 1 M-char mime rides
   FILE_METADATA into EVERY files list GET — the CE7 bloat class).
5. `files.size`: the files-block check — a number, `Number.isInteger`,
   `0 ≤ size ≤ 2_097_152` (the `MAX_UPLOAD_BYTES` mirror — a new
   seam-local constant with the documented-mirror comment, the
   files-view.tsx precedent; data-import.ts must stay client-safe so it
   cannot import the server http module).
6. `studyGroups.members` item shape: every item must be an object with a
   string `name` (1–100, non-blank — the normalizeMembers agreement) and a
   string `email` (≤ 200). NO email-FORMAT check (deliberate: a stricter
   import regex than the zod atom risks rejecting legal exports — the
   round-trip contract outranks the nicety; the read side renders email
   as text, never a link).

REJECTED sub-leg (documented): tightening `chatMessages.content` to the
10 K interactive user-message bound — the PERSISTED bound for assistant
messages is 100 K and the round-trip contract requires exactly that
(shape-true; the audit's framing inverted the doctrine).

**Pins (data-import.test.ts, the CH2/CA14 block style):** six legs —
progress 12.5 rejects with "whole number"; dayOfWeek 3.5 rejects;
maxScore 0.5 rejects ("greater than or equal to 1"); mime 101 chars
rejects; size −5 and 2_097_153 reject (and 2_097_152 passes); a members
row with a non-object item rejects (and a 50-item valid array passes).

### CN2 — the round-trip witness quartet (A-M2)

1. **Unit (data-import.test.ts):** `version: 0` → the parse rejects with
   the "unsupported older version" message (the floor half of the
   documented version contract — the ceiling is already pinned).
2. **E2e (resilience.spec.ts, new describes at END of file — resilience is
   NOT chunk 3's alphabetically-last file, so the s16 CK1 terminal pin is
   untouched):** the empty envelope — POST `{version: 2, data: {}}` →
   200 with `created: 0, updated: 0` (the tolerance edge).
3. **E2e:** the cross-account 409 — a fresh TEST-NET user2 (the s23
   registerFreshUser pattern, probe IP `192.0.2.139`) imports an envelope
   minting subject id `s139-409-subject` (200, created: 1); the DEMO
   session then imports the SAME envelope → the ownership probe misses →
   create → P2002 → **409** with the "collides with an existing record"
   copy; finally-cleanup user2 DELETEs the subject (zero residue, the
   AM1/AN1 convention).
4. **E2e (the headline):** the export→import round-trip — the DEMO session
   GETs `/api/export/data` (200), POSTs the response body verbatim back to
   `/api/import/data` → **200 with `created: 0`** (every row the export
   carries is already the demo's own — the update branch; the seeded
   unpadded `"9:00"` timetable rows, the folders, the chat, the calc
   history, the holidays, and the CB19 preferences block all ride — the
   family's "own your data" promise finally witnessed across all 20
   collections).

**Budget arithmetic (stated BEFORE the legs):** chunk 3's demo import
budget is 5/10 today (CJ4, CJ5, CL1, BW11, BY3) → +3 (empty, 409, the
round-trip) = **8/10**; the demo export budget 0 → 1/10; user2's import
budget 1/10; ONE fresh registration per cross-user test (3 total: the
409, the CN4 card legs, the CN10 re-point — 3/10 per-IP on the probe IP,
3/40 registerGlobal). Chunk 5 is untouched (its demo budget stays as-is —
the S135/CJ relocation lesson: never push chunk 5's register caps).

### CN3 — the Flashcard covering index (B-M1)

`prisma/schema.prisma`: `@@index([createdAt, id])` on the Flashcard model
(KEEPING `@@index([deckId])` — the FK/deck-delete-cascade lookup). SQLite
walks the index newest-first and stops at 5000 MATCHING rows — the
common case (a single user owning most cards) drops the full temp-b-tree
sort of every owned card per GET; the sparse-user adversarial case is no
worse than today (the audit's honest caveat, recorded in the census
comment). The complete fix (denormalized `userId` + the family composite)
is a schema-migration decision documented as the upgrade path, not taken
this cycle. `bun run db:push` after the edit (dev + e2e dbs re-create
cold). **Pins (schema-indexes.test.ts):** the census comment re-tag
(Flashcard moves from "out of scope by design" to "carries the CL3
window's ORDER BY covering index") + a new leg asserting the Flashcard
model body contains `@@index([createdAt, id])` (RED pre-fix) + the
19-model composite leg unchanged. PAD's data-layer index documentation
re-tagged in the docs chain.

### CN4 — the card-delegate ownership pins (B-M2)

E2e (resilience.spec.ts, the CL9 pattern): a fresh TEST-NET user2 creates
a deck + a card through the API; the DEMO session (a second
`browser.newContext` with the demo storageState) then: PATCHes user2's
card id → **404**; DELETEs user2's card id → **404**; POSTs
`/api/flashcards/cards` with user2's `deckId` → **404** (the create-path
deck-ownership probe). Cleanup: user2 deletes the deck (the cascade
removes the card). The three where-clauses (`deck: { userId }` on
update/remove, the deck probe on create) are finally regression-pinned.

### CN5 — the folder cycle-guard bounded walk (B-M3)

`src/app/api/files/folders/[id]/route.ts`: replace the full-table
`tx.fileFolder.findMany({ where: { userId } })` with the bounded ancestor
walk — one `findFirst({ where: { id: cursor, userId }, select: { id,
parentId } })` per HOP from `writes.parentId` upward, the visited set
terminating pre-existing cycles (the AL3 contract). The collected chain
(a depth-bounded row set) feeds the UNCHANGED `wouldCreateCycle` seam —
its unit pins (folder-tree.test.ts, 16 legs) stay meaningful and the
seam stays live. The first hop doubles as the parent-existence check
(`chain.some(row => row.id === writes.parentId)` over the collected
chain — identical semantics to the full-table `some`, because the chain
starts AT the parent). The comment owns the change honestly: the guard's
own read was the unbounded one the family spent CB10/CJ1 bounding, and
the import route can mint ~10^5 folders in one envelope. **Pins:** the
route census (the file contains `findFirst` and NOT `fileFolder.findMany`
— RED pre-fix) + the existing AK1 e2e legs (self-parent 400, cycle 400,
missing parent 404) re-verified through the cert.

### CN6 — the typed 413 catch (A-L1)

`src/app/api/import/data/route.ts`: `catch (err) { if (err instanceof
BodyTooLargeError) return errorResponse(413, …); throw err; }` — the
typed error exists since S129/CD4 and is unused here; a transport
failure mid-stream is no longer mislabeled "too large" (it propagates to
the 500 handler honestly). **Pin:** the route census — the file contains
`instanceof BodyTooLargeError` (RED pre-fix).

### CN7 — the folders row-index honesty (A-L2)

`src/app/api/import/data/route.ts`: move the per-row sanitize loop BEFORE
the folders topo-sort (sanitize is VERIFIED validate-only — no row
mutation anywhere in its body — so the reorder is behavior-neutral for
valid envelopes; only the REJECTION copy changes, now naming the backup
file's true row index). The sort keeps its post-FK-validation position
(FK nulling mutates rows; the sort must still see the nulled form).
**Pins:** the e2e leg — an envelope whose folders[0] (a child with a bad
name) sorts AFTER its envelope sibling parent must reject with
`folders[0]` (RED pre-fix: `folders[1]`) + the route census (the
sanitize loop appears before `sortFoldersParentsFirst` in the file).

### CN8 — the export-panel timeout branch (A-L4)

`src/components/export/export-panel.tsx`: `errorMessage` gains the
`isTimeoutError` branch (imported from `@/lib/api` — the CE1 doctrine)
returning "The import took too long and was stopped. Try importing a
smaller backup, or split it first." **Pin:** the script-conventions
census — the panel contains `isTimeoutError` (RED pre-fix).

### CN9 — the doc-accuracy sextet (Mode-C residuals)

1. `Dockerfile`: the init-profile comment re-worded honestly (the compose
   `init` service runs as the IMAGE user — bun — because it carries no
   `user:` override; the named-volume path works because the image chowns
   /data) + `docs/DEPLOYMENT.md` §8 note: a BIND-MOUNTED /data must be
   owned by the container's bun uid (uid 1000 on the oven/bun base), or
   the runtime cannot open the SQLite file — the named-volume path is the
   documented default.
2. `src/app/api/auth/login/route.ts`: the stale SUCCESS-RESET paragraph
   re-tagged to the discharge form (referencing the CM3 decrement below).
3. `tests/script-conventions.test.ts`: the CM8 census tightened to
   `^USER bun$/m` (a regression to `USER root` must fail).
4. `omni-study1_SKILL.md:850`: drop the deleted `ui/tooltip.tsx` from the
   z-50 overlay-family row.
5. `AGENTS.md` S136 lesson 3: the one-line superseded annotation (points
   at the S138 lesson-2 aggregate doctrine).
6. `src/app/api/auth/register/route.ts`: the asymmetry comment — the
   register globals deliberately NEVER discharge (a register "success" is
   credential-free and scriptable under the in-band posture; decrementing
   would reopen the exact AI-2 defeat on the register side).

**Pins:** the census extensions — the login route must NOT contain
"SUCCESS-RESET" (RED pre-fix); the Dockerfile comment census (contains
"init" + "bun" adjacency — a light form; the USER bun$ regex is the
load-bearing one).

### CN10 — the mapper + owned-FK pin pair (B-L4/L-5)

1. `tests/http-body.test.ts`: three `toErrorResponse` legs constructing
   REAL `PrismaClientKnownRequestError`s (the P2028 template verbatim) —
   P2002 → 409, P2025 → 404, P2003 → 400 — each asserting the status +
   the named copy.
2. E2e (resilience.spec.ts, riding the CN4 user2): the DEMO session
   PATCHes its OWN task with `subjectId: <user2's subject>` → **404**
   (the assertOwnedFks re-point leg — "re-pointing a task at a foreign
   subject is the same hazard" finally pinned at the wire).

### CN11 — the small-hardening trio + the lockfile (B-L1/L-2/L-3 + MC-I3)

1. `src/lib/server/http.ts` `withUserParams`: `if (id.length === 0 ||
   id.length > 64) throw new NotFoundError();` — the route-param id now
   honors the same 64-char bound the body atoms enforce (`idField`), as
   a 404 (the no-oracle posture — a >64-char id cannot exist).
2. `src/lib/server/entities.ts`: delete the dead `orderBy?: "asc" |
   "desc"` config field + its branch (`orderBy === "desc" ? rows :
   rows.reverse()` → `rows.reverse()` — no delegate selects desc; the
   cards delegate owns its own raw-query ordering).
3. `src/lib/server/entities.ts`: the construction check extends — a
   `beforeWrite` delegate whose `txModelName` does not resolve on the
   client throws AT CONSTRUCTION (the loud-at-construction doctrine,
   completing CE5's own words), pinned by a unit leg constructing a
   bogus-config delegate.
4. `package-lock.json`: DELETED (the stale npm lock pins five
   CM7-removed Radix deps + tailwindcss-animate — the bun toolchain,
   bun.lock, the Dockerfile, and every documented command ignore it; the
   divergence was pre-existing and CM7 widened it). **Pin:** the census —
   no `package-lock.json` in the repo root (RED pre-fix).

## 4. The TDD pin projections

**Unit** (1369 baseline): data-import +7 (CN1's six + CN2's version leg) ·
schema-indexes +1 (CN3) · http-body +3 (CN10) · script-conventions +~6
(CN5, CN6, CN7, CN8, CN9×2, CN11×2 — the exact census lands in §5) ·
entities construction-check +1 (CN11) → projected **1369 → ~1387** (45
files). **E2e** (597 baseline): chunk 3 +6 (CN2's empty + 409 +
round-trip, CN4's card legs, CN7's folders-index leg, CN10's re-point) →
**597 → 603 (150+184+88+95+86)**. **Register tripwire** (stated BEFORE
the measurement — the 50th consecutive hold): at s138 the register read
`256/137/0/119`; this cycle adds exactly ONE playwright-importing file
(the `capture-s139-evidence.mjs` rider) → **expected 257/138/0/119**.
**Badge census:** unit (~1387) + e2e (603) → the README badge and the PAD
§8.1 Total re-tagged to the measured values; the §8.1 per-file rows this
cycle touches (data-import, schema-indexes, http-body,
script-conventions, resilience, entities-family tests) re-counted.

## 5. Deferrals (documented, with rationale)

- **A-M3 (the restore-availability family):** the 60 s lock-holding N+1
  write loop, the time-bounded restore ceiling vs the unbounded export,
  the absent split tooling, and the knownIds all-20-collections scan
  (A-I1) are one staged family: batching the write loop (createMany
  grouping / chunked idempotent sub-transactions — upsert-by-id makes
  chunking safe) + the knownIds presence-skip. Deferred as its own
  performance cycle — it touches the transaction's core shape and
  deserves dedicated RED/GREEN work, not a rider.
- **A-L3 (the note-HTML sanitization):** the remote-img tracking pixel is
  a PRE-EXISTING surface (the same HTML is storable via a direct API POST
  — `noteSchema.content` has never been HTML-validated). A correct fix
  must cover BOTH entry points at the validation seam (an allowlist
  sanitizer decision: dependency choice + schema change + pins) — an
  import-side-only guard would be a half-fix closing the smaller of two
  doors. Deferred with the seam named.
- **A-I2** (hand-crafted partial grade rows stricter than PATCH — a
  documented decision; real exports carry full rows). **A-I3** (files
  rows carrying both `data` and `url` — harmless, the view classifies by
  `url`). **A-I4** (the client bundle pulls the seam for
  `IMPORT_MAX_BYTES` — fixed properly by splitting the constant into a
  tiny module, a public-surface refactor deferred with the M3 family).
  **A-I5** (the profile-patch all-or-nothing granularity — real exports
  carry valid blocks).
- **B-I1** (the 5005-card behavioral pin for the window boundary — the
  comment-honesty pin stands; optional CA5-mirror leg).
- **MC-I1** (the s138 plan §2 CSP prose) — corrected in this cycle's docs
  chain (the shipped profile is the correct one and IS correctly
  documented in PAD/AGENTS; the plan's §2 line gets the bracketed
  correction).
- **The standing s133–s138 deferred set:** MC-F3 (the credential-holder
  containment window), A-L3 (the export unbounded read), A-I2 (the RUM
  CSV LF separator), A-I4 (the bespoke import validator), B-I2 (the
  calculator/history budget exception), B-I4 (the pre-warm
  over-provision), B-I5 (the unguarded-delegate TOCTOU), B-L2 (the
  list-memoization family), FE-4 (the analytics caption — parity-pinned),
  FE-5 (the settings remount race), MC-F6/F7/F8, and the two default-5 s
  transaction sites.

## 6. As-executed (the cycle close)

**TDD discipline.** RED first: **18 unit + 1 e2e defect pins verified failing
for the designed reasons** — CN1's six integrality legs (each rejecting its
exact artifact: 12.5 / 3.5 / 0.5 / the 101-char mime / −5 and 1.5 and the
over-cap size / the malformed members items); CN3's census (`Flashcard` body
lacks `@@index([createdAt, id])`); the eleven CN censuses each RED on its
exact stale artifact (the folders `fileFolder.findMany`, the bare 413 catch,
the sort-before-sanitize order, the missing `isTimeoutError`, the
SUCCESS-RESET paragraph present, the absent register comment, the
"still runs as root" comment, the absent `id.length > 64`, the live orderBy
branch, the absent resolution check, the present package-lock.json); and the
CN7 e2e leg RED at the designed assertion (`folders[1]` — the sorted index —
where the file's row 0 was the offender). **Ten coverage pins landed GREEN
on arrival BY DESIGN** (the CL9/CK3 pattern — the finding was the missing
pin, not a defect): the version-floor leg, the P2002/P2025/P2003 mapper
trio, the empty-envelope leg, the cross-account 409, the card-delegate 404s,
the owned-FK re-point — **and the headline round-trip witness: the demo's
own export restores clean (created: 0) — the promise HOLDS, now witnessed.**
GREEN: unit **1369 → 1391** (45 files — data-import +7, schema-indexes +1,
http-body +3, script-conventions +11) · e2e **597 → 603** (chunk 2 +1, chunk
3 +5). Guardrails held: no test weakened, no lint/type rule loosened; the
CE7 registry census was RE-TAGGED (not deleted) for the files.mime key (the
intentional CN1 evolution); the USER-bun regex tightened in place; the
cert-header tripwire re-tagged to the 603 census.

**The honest mid-run corrections (the full ledger).** (1) **The round-trip
leg's first home was wrong:** chunk 3's resilience — where S124/BY5 (the
export-family limiter pin) deliberately spends the demo export budget
mid-chunk (10 GETs + the asserted 11th 429) — 429'd the leg's export GET at
its FIRST assertion. The standalone run passed (BY5 never ran); only the
full chunk exposed it. Relocated to chunk 2's s14-hardening (import 6/10,
export 1/10 — both free), the budget arithmetic documented at both sites
(the S135/CJ relocation class, elevated to the S139 lesson 2). (2) The CN7
e2e leg's first draft used a BLANK name as the invalid-child marker — blank
names are not a guaranteed import rejection (the guard checks length caps,
not blankness; the interactive atoms trim, the import does not); re-scoped
to the deterministic over-cap registry form (201 chars). (3) The first
GREEN run caught the CE7 registry census (the files.mime key joined the
machine-checked list — re-tagged). (4) The first typecheck caught two of my
own typings (the walk's circular inference — annotated; the txModelName
narrowing — the guarded non-null assertion). (5) The first re-cert chunk-3
run failed 3 tests: the 429 (the relocation above) + two AK1 500s — the
latter the documented machine-load class (each standalone-clean, the
socket-timeout signature, the re-run first-pass). (6) The first capture
script draft waited on `appHydrated` for /export — a server-gated surface
without the SPA shell; re-scoped to the panel's own pinned headings (the
s23 idiom).

**The re-cert (the FINAL tree).** lint ✓ · tsc ✓ · unit **1391/1391 (45
files)** · the canonical build green (the six Turbopack warnings
pre-existing, the db-path/instrumentation traces) · the cold 5-chunk e2e
**603/603 — 150+185+87+95+86, every chunk first-pass** (chunk 1 certified
on the identical source tree before the test-file relocation — none of its
files touched) · the register tripwire rider arithmetic EXACT (importers
256 → 257, Usage-line carriers 137 → 138, stale 0 — the one
capture-s139-evidence.mjs rider; the 50th consecutive hold; the fourth
historical slot re-measured as the outsider count 121, the prior session's
119 not exactly reconstructable — the threshold-form census itself green
throughout) · the live drawer battery GREEN — **the 54th consecutive
no-Tailwind-v4-bug confirmation on the remediated tree** · three evidence
frames in `docs/screenshots/139-clone-*.png` (desktop, mobile drawer, the
/export portability panel — the capture script's own self-verifying waits;
byte-comparable to the s138 standing patterns). **Census: 1391 unit + 603
e2e = 1994 green.**

**Docs set (same commit):** README (the badge 1994 + the census lines + the
S139 row), AGENTS.md (the census anchors + the S136 lesson-3 superseded
annotation + the S139 lessons section — five lessons), PAD **v1.3.47** (the
revision block + the §8.1 touched-row re-count: data-import 118→125,
schema-indexes 6→7, http-body 13→16, script-conventions 47→58, resilience
31→36, s14-hardening 23→24, the Total 1962→1990 with the badge 1994), the
SKILL doc (the census anchors + the deleted tooltip row dropped), the
vitest header (45/1391 + the S139/CN re-anchor block), the cert re-tags (the
S139/CN block + Expected 603 in both scripts + the script-conventions
tripwire), this §6, `docs/session_150.md`, and the worklog entry.

**Deferrals (documented, with rationale):** A-M3 (the restore-availability
family: the 60 s lock-holding N+1 write loop, the time-bounded restore
ceiling, the absent split tooling, the knownIds all-20-collections scan —
one staged performance family), A-L3 (the note-HTML sanitization — must
cover BOTH entry points at the validation seam, its own cycle), A-I2/A-I3/
A-I4/A-I5, B-I1 (the optional 5005-card behavioral pin), MC-I1 (corrected
in this cycle's docs chain), and the standing s133–s138 deferred set.
**Next cycle suggestion: the axes are now both fresh — rotate the deep
audits onto the FE/views + auth/crypto/infra families (the s138 axes, two
cycles stale by then), or take the A-M3 restore-availability family as its
own performance cycle (the batching redesign + the knownIds skip).**

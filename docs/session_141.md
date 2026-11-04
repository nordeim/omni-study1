# Session 141 — Batch CJ (Cycle 85): The Audit-Driven Hardening Cycle + The Violet Accent-Edge Token Family — The Folders-Window + Route-Census + Edge-Token + FK-Message Set

> Record of worklog **Session-135 / Batch CJ**. Workspace: a FRESH clone at `1bc4319`
> (the Batch CI state `0b5afb1` + the operator's `1bc4319` — `docs/session_139.md`,
> the CI record, + `docs/session_140.md`, the CI transcript) — the sandbox had RESET,
> so the environment was re-provisioned from zero: `.env` re-created from the current
> `.env.example` (`DATABASE_URL="file:../db/custom.db"`, `db/` at the repo root),
> `db/` re-pushed + re-seeded (the demo account GREEN), the dev daemon re-started
> (the S32 recipe, preflight GREEN on :3000), and chromium-1243 re-provisioned after
> the fresh `bun install` raised Playwright's pinned browser build. Plan + execution
> record: **`docs/remediation-plan-session135.md`**.

---

## 1. The baseline (cold, BEFORE any work)

lint ✓ · `tsc --noEmit` ✓ · unit **1314/1314** (45 files) · the canonical build green
(exit 0, foreground) · the cold 5-chunk e2e **584/584 — 150+181+74+94+85, every chunk
first-pass** (per-chunk via `scripts/run-cert-chunk.sh`; zero flakes) · the Mode-C
audit of the Batch CI diff (`0b5afb1`, 37 files, +1,685/−56): **all 8 CI claims
re-verified TRUE against the tree, zero key material** (CI1's 6-part format + the
`SCRYPT_N/R/P` exports + the every-call-site maxmem + the fail-closed parser + the
burn equalizer + the rehash drain + the reset hoist; CI2's forged-expired pair;
CI3's per-IP quartet; CI4's MyDay guard; CI5's calculator gate; CI6's hygiene set;
CI7's FE set; CI8's four-entry violet register — one wording nuance: `SCRYPT_MAXMEM`
is module-private, not exported; the every-call-site contract itself holds).

## 2. Live parity (both hosts — agent-browser, mobile 390×844 + desktop 1280×800)

**Reference** (logged in with the operator-provided reference account): the standing battery held —
the mobile drawer panel **288px** (`h-screen w-72`), no `role=dialog`, `z-50`, white,
`animation: none` (instant open), backdrop **`blur(4px)` + `rgba(0,0,0,0.2)`**, exactly
**20 nav links**, nav **scrollable (992/744)**, shadow-2xl final layer
`rgba(0,0,0,0.25) 0px 25px 50px -12px`, drawer nav-click → `/Tasks` + drawer unmounts,
body scroll `visible` while open, desktop **260px sidebar / 20 links / main offset
260px**.

**Clone** (dev :3000, demo account): `node scripts/drawer-check-s14.mjs` → **DRAWER
CHECK: GREEN** (all six checks) — the **45th consecutive no-Tailwind-v4-mobile-nav-bug
confirmation** at baseline. The agent-browser live walk: labeled hamburger ("Open
navigation menu") + `aria-expanded` toggling ✓, focus lands on "Close menu" ✓, the
inner panel **288px white `animation:none`** ✓, backdrop `blur(4px)` +
`oklab(0 0 0 / 0.2)` (the trap-7 serialization of the same rendered color) ✓, Escape
closes + restores body scroll + **returns focus to the hamburger** (through a REAL
click) ✓, drawer "Tasks" → `/Tasks` + drawer unmounts ✓, desktop chrome
**260/20/260 identical to the reference** ✓.

**The violet-family parity probes (NEW this cycle — the measurement CI8 lacked).**
All four register sites probed LIVE on the reference: the tasks row-card class is
literally `border-slate-200 hover:border-violet-200 hover:shadow-md…` (class-level
parity; the probe task created through the real composer — the S120-probe precedent);
the flashcards study-card FRONT face class `bg-white border-2 border-violet-200`,
computed `rgb(221, 214, 254)` (the S79 Probe Deck re-used); the analytics
Tasks-Completed chip computed `rgb(237, 233, 254)` = violet-100, class
`bg-violet-100` — **no dark variant: the chip renders violet-100 in the reference's
own dark setting too**; the notes selected row carries the S77/AD7 documented
measured value (the reference's note composer would not save from synthetic events —
the documented measurement stands, the class family consistent with the two
live-verified siblings). The reference has **no accent picker** (Settings offers
theme mode + avatar only; `:root --primary: 139 92 246` fixed) — the clone's
7-accent system is the documented superset. Conclusion: the four sites are
byte-identical parity under the DEFAULT violet accent; the drift exists only under
the clone's six non-violet accents — exactly the accent-token doctrine's jurisdiction.

## 3. The audits (rotated fresh eyes — the s134 closing directive, BOTH options
executed: the axes rotated onto the data/import/export + entities/factory families,
AND the violet-200 token family taken as the cycle's parity-measured centerpiece)

- **Audit A — the data/import/export axis** (`src/lib/data-export.ts`,
  `src/lib/data-import.ts`, both routes in full, the /export page + ExportPanel, all
  four pin files, the schema's FK graph against `IMPORT_FK_MAP`): **0 Critical /
  0 High / 1 Medium / 5 Low / 4 Informational**. The axis affirmed clean on: the
  envelope identity/version folding, duplicate-id and `__proto__` handling, the
  one-transaction all-or-nothing restore, upsert-never-deletes, FK validation
  completeness (all 14 FK-bearing collections), Kahn topo-sort with cycle rejection,
  auth gating + userId scoping + the cross-user id-collision 409, the secret
  stripping (double guard), the 25 MiB counted-as-read cap, the content-type gate,
  the per-user budgets, the download headers — plus the CH-series claims re-verified
  (CH1/CH2/CH4/CH5/CH6).
- **Audit B — the entities/factory axis** (`src/lib/server/entities.ts`, `http.ts`,
  `server/auth.ts`, `validation.ts`, `prisma/schema.prisma`, all 33 route files in
  full, the pin-layer coverage map): **0 Critical / 0 High / 1 Medium / 1 Low /
  3 Informational**. The factory affirmed clean on: the sent-keys partial-PATCH
  filter at all 17 write sites (the Zod4 trap closed), ownership/IDOR scoping
  everywhere, the owned-FK doctrine, mass-assignment stripping, the write-budget
  census, the guarded delegates' transactional re-reads, the composites + the CH3
  index census, the uniform error envelope, the field bounds.

Every M finding re-verified by direct read BEFORE the plan (A-M1: the export route
builds the 20-collection literal against the seam's `Partial<Record>` — an omitted
key compiles clean and silently exports `[]` + count 0; the import route's
`IMPORT_ORDER` is route-local, zero test references — a dropped collection's rows
are silently ignored. B-M1: `files/folders/route.ts:39-43` reads `asc + take: 500`
— the OLDEST-500 window, the BZ13/CA5 shape, while the sibling files GET uses the
correct desc+take form) — and every L finding selected for the CJ set likewise
(A-L1's CLAUDE.md contradictions; A-L2's undefined/null early-continues; A-L3's
stale title; A-L4's s23 header; A-L5's unpinned mappings + the colon truncation;
B-L1's census comment claiming an unasserted $transaction route).

## 4. The CJ set (TDD)

**RED**: 14 unit defect pins + 3 e2e defect pins, every one verified failing for its
DESIGNED reason (the null/non-string deckId rows passing the seam; `IMPORT_ORDER`
invisible to the test import; `parseImportRaceMessage` not a function; the three
light `border-violet-200` sites still present; the edge var absent; the OLDEST
folders window; the hardcoded violet ignoring the accent switch; the generic
fields-do-not-match) — plus the coverage pins (the CJ4 absent-deckId seam leg, the
export-route census legs, the dark-half register anchors, the CJ5/CJ7 riders)
landing green on current code, the designed expectation for missing-test findings.

**GREEN** (unit **1314 → 1332**, 45 files; e2e **584 → 588**, chunk map
**150+183+76+94+85**):

- **CJ1 (M)** — the folders GET newest-500 window: the hand-written list was the
  API tree's last `asc + take` — past 500 folders (a single import envelope reaches
  it by the route's own comment) every NEWER folder vanished from
  `GET /api/files/folders`. The factory's BZ13 form (desc + take + reverse to the
  asc presentation) + the CA5-style 505-folder e2e pin (fresh TEST-NET user,
  stamped ids).
- **CJ2 (M)** — the route-side 20-collection censuses: `IMPORT_ORDER` moves to the
  seam (exported beside `IMPORT_FK_MAP` — the parents-first order is seam
  knowledge) + the manifest set-equality pin + the export-route findMany
  count/literal-key censuses + the import consumption census. A dropped collection
  can no longer silently export an empty family (green typecheck — the seam's
  `Partial<Record>` accepts the omission) or ignore rows on restore.
- **CJ3 (L, the parity-measured centerpiece)** — the violet accent-edge token
  family (CI8's honest deferral, now measured): `--sf-primary-edge` (the 200-level
  border tint — per-accent palette steps, violet byte-identical `221 214 254`)
  joins the accent set **17 → 18 vars** (the S3-J + boot-suffix + theme-cache pins
  in lockstep) + the @theme utility; the three border sites migrate
  (tasks hover, flashcards face, notes selected row); the notes bg rides the
  EXISTING `--sf-primary-softest` and the analytics chip bg rides the EXISTING
  `--sf-primary-empty` (both byte-identical; the @theme utility set grows six →
  eight for its first UTILITY consumers on those tints — the mid-run correction
  below); the hue-tokens register re-shapes to the four DARK halves (the S92
  divergent-variant doctrine — no reference ground truth for dark, 800/800/900 stay
  site-local) + the treated-light-half consumer census (the S94/AU2 precedent) +
  the accent-tracking e2e discriminator (the notes selected border under the blue
  accent: violet-200 → blue-200 — the family's whole point, RED pre-fix).
- **CJ4 (L)** — the required-FK null/missing rejection: the seam rejects
  null/non-string `cards.deckId` with the actionable message (a required FK can
  never be null in ANY branch); the route rejects missing-on-CREATE via the new
  DB-only `existingIds` census (the upsert probe's own branch truth — `knownIds`
  unions the envelope's own ids and cannot discriminate); undefined-on-update stays
  legal (the untouched case).
- **CJ5 (L)** — the colon-safe 409 race-message parse (the pure
  `parseImportRaceMessage` seam — ids legally contain `:` to 64 chars; the bare
  `split(":")` truncated them) + the wrong-typed-field 400 wire pin (the
  `PrismaClientValidationError` mapping's first pin — the route's last line of
  defense for "never 500 for bad input").
- **CJ6 (L)** — the honest-docs family: CLAUDE.md's portability paragraph (the
  "NO restore/import" sentence + the "10 MiB" cap → the 25 MiB truth), the s23
  budget-header recount (9 → 8 demo POSTs + the chunk-isolation argument replacing
  the false exclusivity claim, the 10/10 knife-edge named), the "is 10 MiB" test
  title, the CE5 census comment's unasserted card-delegate parenthetical.
- **CJ7 (L)** — the pin riders: the `preferencesSchema` default-free machine guard
  (a `.default()` would silently reset a column on every partial save — the
  load-bearing invariant was prose-only) + the export user-block Date→ISO pin.
- **CJ8 (I)** — the `parseImportEnvelope` header reword (the unit-pinned reference
  parser, not the production path — CH4's doctrine stated accurately) + the dead
  duplicate unknown-collection loop removed.

## 5. The re-cert

lint ✓ · `tsc --noEmit` ✓ · unit **1332/1332** (45 files) · the canonical build
green · the cold 5-chunk e2e **588/588 — 150+183+76+94+85, every chunk first-pass
on the FINAL tree** (the full sequence re-run after the utilities fix — the first
chunk-2 run's 2 failures [AD7 + the analytics icon pin] were the missing-utilities
regression itself, root-caused and fixed) · the register tripwire re-measured
**253/134/0/119** (the 46th consecutive hold; the +1/+1 is this cycle's own
capture script, Usage line per the convention — the expectation stated BEFORE
the measurement [252/133 + the one rider] and holding exactly; measured in the
post-restart continuation, the sandbox outage having interrupted the final-gates
pass — lint/tsc/unit/build all re-run green there on the identical tree) · the
live drawer battery GREEN on the
remediated tree — **the 46th consecutive no-Tailwind-v4-mobile-nav-bug
confirmation** · three evidence frames under `docs/screenshots/135-clone-*` (the
desktop dashboard, the mobile drawer, and the NEW CJ3 notes accent-edge surface —
the capture script's own computed-border waitForFunction [blue-200 under the blue
accent, via the REAL settings-API accent switch, the violet restored in the
finally] + the passing CJ3 e2e pin are the machine proof; pixel-stat-verified
non-blank). **Census: 1332 unit + 588 e2e = 1920 green.**

## 6. The honest mid-run corrections

1. The CJ3 bg utilities never existed in `@theme` — both bg sites silently rendered
   transparent (`rgba(0,0,0,0)`) until the standing AD7/analytics computed-style
   pins caught it in the first re-cert chunk 2; the utility set grows six → eight.
   Lesson recorded in AGENTS.md: a var and its utility are two different facts.
2. The CJ4 route guard first keyed on `knownIds` (which unions the envelope's own
   ids) — the create-branch discriminator never fired; the DB-only `existingIds`
   map is the fix.
3. The CJ1 pin's first draft used fixed folder ids — the ad-hoc re-run collided on
   the global PKs (the cross-user 409, correct behavior); stamped ids adopted.
4. The CJ4 seam guard landed in `parseImportEnvelope` (the non-production wrapper)
   first — moved to `validateImportEnvelope`, the route-consumed stage.
5. The capture script's frame 3 needed absolute URLs (a standalone playwright
   script has no baseURL) and was re-captured after the utilities fix.
6. One TS2339 narrowing bug in the CJ4 unit pin (an inverted guard).
7. The unit census landed at +18 (1314 → 1332), above the ~+8 projection; the e2e
   at exactly +4. The per-file arithmetic is in the plan §5.
8. The CJ4+CJ5 pins' first draft (in s23, chunk 5) tripped the chunk's
   `registerGlobal:` 40/15-min cap — two WASTED fresh-user registrations (the
   file-level demo storageState put the import POSTs on the demo session anyway)
   pushed the ~40-register chunk over and s26's register 429'd deterministically
   (reproduced on a clean re-run; standalone green — the process-scoped
   mechanism). The pins relocated to resilience.spec.ts (chunk 3) in the BY3
   demo-session form — the natural home beside the BW11/BY3 import perimeter
   pins; chunk map 150+183+76+94+85; the s23 header documents the cap.

## 7. The docs set (same commit)

README (the badge 1920 + the census lines + the S135 row), AGENTS.md (the census
anchors + the accentCssVars 18-var note + the NEW "S135 lessons" section), PAD
**v1.3.43** (the revision block + the §8.1 Total row), the SKILL doc (the census
anchors), the vitest header (45/1332 + the S135/CJ re-anchor block), the cert-script
re-tags (the S135/CJ block + Expected 588 in both + the script-conventions Expected
pin), `.env.example` unchanged this cycle (no new env surface), the plan's §5 (the
as-executed record), this record, and the worklog entry.

## 8. Deferrals (documented, with rationale — the plan's §4)

The dark-edge token family (CJ3's honest remainder: the four dark halves stay
site-local + register-anchored — no reference ground truth for dark [the
reference's Dark option is the measured platform no-op], the 800/800/900 divergence,
a future harmonization pass at a uniform value), the audit-A I-family (the per-row
probe+write transaction shape — self-DoS bounded; the `updatedAt` round-trip
fidelity — Prisma-managed), the audit-B I-family (the unbounded deck-scoped card
list — documented posture; the read-side budget-census scope), and the standing
s133/s134 deferred set (the pre-CE5 unguarded delegates, the write-budget census
granularity, the boot double-fetch, the Docker non-root runtime, the
resend/forgot ms-scale timing equalization, the drawer-link emission order, the
flashcards render-phase unlatch, the iOS scroll-lock nuance, the RFC 7239
signed-proxy posture, the complement-burn retirement, the verify-email ms-scale
timing asymmetry, the A-I/B-I documented-posture families, the KPI gradient stops,
future KDF raises).

**Next cycle suggestion (the s135 closing rhythm): the violet-token family's light
half is CLOSED — rotate the deep-audit axes onto the auth/crypto/infra + FE/views
families again (the s134 axes, now two cycles stale), or take the dark-edge
harmonization as a dark-mode design pass of its own (the four dark halves at a
uniform per-accent step — a clone-superset design decision needing no reference
measurement), or clear one of the standing timing-equalization deferrals.**

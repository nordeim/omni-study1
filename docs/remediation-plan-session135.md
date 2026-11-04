# Remediation Plan — Session 135 / Batch CJ (Cycle 85)

**Status: COMPLETE** (executed TDD-style 2026-11-04 — the verification record is §5;
the drafted §2/§3 held through GREEN with the divergences recorded inline in §5, the
s133/s134 precedent)
**Date:** 2026-11-04 · **Workspace:** a FRESH clone at `1bc4319` (the Batch CI state
`0b5afb1` + the operator's `1bc4319` (`docs/session_139.md` + `docs/session_140.md`,
the CI record + transcript) — the sandbox had RESET, so the environment was
re-provisioned from zero: `.env` re-created from the current `.env.example`, `db/`
re-pushed + re-seeded (demo account GREEN), the dev daemon re-started (the S32
recipe, preflight GREEN on :3000), and chromium-1243 re-provisioned after the fresh
`bun install` raised Playwright's pinned browser build). **Audit-driven hardening
session** — the standing rhythm (audit the prior-batch diff, rotate two fresh-eyes
deep audits, re-certify cold), with THIS cycle executing the s134 closing directive's
rotated axes: **the data/import/export + entities/factory families** (the s133 axes,
two cycles stale) PLUS the violet-token family as the cycle's parity-measured
centerpiece (the s134 closing directive's other option, its missing measurement now
gathered live).

---

## 0. Scope and Method

The operator directed the standing charter (the same as s126–s134): refresh the
workspace, re-read the doc chain (`AGENTS.md`, `CLAUDE.md`, `README.md`, PAD,
`omni-study1_SKILL.md`, `docs/session_139.md`, `docs/remediation-plan-session134.md`,
`worklog.md`, `docs/session_140.md`), re-validate against the codebase, audit with
the repo skills as rubrics (`skills/` excluded from checking/testing/compilation),
iterate on visual + functional parity with `https://omni-study1.base44.app/` (the
mobile navigation menu the named focus, Tailwind v4 the named suspicion class), keep
the repo a production-ready functional SUPERSET with visual parity, keep
`DATABASE_URL="file:../db/custom.db"` + `db/` at the repo root (`skills/web-application/SKILL.md`
§5/§6 the rubric; `skills/clone-app-pat-pro`, `skills/agent-browser`, `skills/tdd`
consulted), maintain the vitest + playwright suites, plan remediation for everything
found, execute with TDD (RED → GREEN), capture evidence under `docs/screenshots/`,
update the docs chain, and commit + push to `main` via the SSH wrapper.

### Baseline (cold, BEFORE any work — re-derived on the fresh clone)

lint ✓ · `tsc --noEmit` ✓ · unit **1314/1314** (45 files) · the canonical build green
(exit 0, foreground) · the cold 5-chunk e2e **584/584 — 150+181+74+94+85, every chunk
first-pass** (per-chunk via `scripts/run-cert-chunk.sh`; zero flakes) · the Mode-C
audit of the Batch CI diff (`0b5afb1`, 37 files, +1,685/−56): **all 8 CI claims
re-verified TRUE against the tree, zero key material** (CI1's 6-part format +
`SCRYPT_N/R/P` exports + the every-call-site maxmem + the fail-closed parser + the
burn equalizer + the rehash drain + the reset hoist; CI2's forged-expired pin pair;
CI3's per-IP quartet with distinct emails; CI4's MyDay busy guard; CI5's calculator
Spinner gate; CI6's hygiene set [secureRandomBytes absent, the TTL derivation, the
over-declaration warning wired in instrumentation.ts]; CI7's FE set; CI8's
four-entry violet register with both sweep directions) — one wording nuance
(`SCRYPT_MAXMEM` is module-private, not exported; the every-call-site contract
itself holds — no action).

### Live parity (both hosts — agent-browser, mobile 390×844 + desktop 1280×800)

**Reference** (logged in with the operator-provided reference account): the standing battery held —
the mobile drawer panel **288px** (`h-screen w-72`), no `role=dialog`, `z-50`,
white, `animation: none` (instant open), backdrop **`blur(4px)` + `rgba(0,0,0,0.2)`**,
exactly **20 nav links**, nav **scrollable (992/744)**, shadow-2xl final layer
`rgba(0,0,0,0.25) 0px 25px 50px -12px`, drawer nav-click → `/Tasks` + drawer
unmounts, body scroll `visible` while open, desktop **260px sidebar / 20 links /
main offset 260px**.

**Clone** (dev :3000, demo account): `node scripts/drawer-check-s14.mjs` → **DRAWER
CHECK: GREEN** (all six checks) — the **45th consecutive no-Tailwind-v4-mobile-nav-bug
confirmation** at baseline. The agent-browser live walk: labeled hamburger ("Open
navigation menu") + `aria-expanded` toggling ✓, open lands focus on the panel's
"Close menu" button ✓, the inner panel **288px white `animation:none`** ✓, backdrop
`blur(4px)` + `oklab(0 0 0 / 0.2)` (the trap-7 serialization of the same rendered
color) ✓, Escape closes + restores body scroll + **returns focus to the hamburger**
(through a REAL click) ✓, drawer "Tasks" → `/Tasks` + drawer unmounts ✓, desktop
chrome **260/20/260 identical to the reference** ✓.

**The violet-family parity probes (NEW this cycle — the measurement CI8 lacked).**
All four register sites were probed LIVE on the reference (mobile + desktop, the
account's current dark setting noted but the light values measured in the classes
and computed styles):

| site | reference evidence | clone today |
|---|---|---|
| tasks row-card hover border | the card class literally `border-slate-200 hover:border-violet-200 hover:shadow-md…` (class-level parity — the probe task "S135 parity probe task" created via the real composer) | `hover:border-violet-200` — byte-identical |
| flashcards study-card front border | the flip face class `bg-white border-2 border-violet-200 rounded-2xl…`, computed `rgb(221, 214, 254)` (the S79 Probe Deck re-used) | `border-2 border-violet-200` — byte-identical |
| notes selected row | the S77/AD7 documented measured value (violet-200 border + violet-50 bg; the reference's note composer would not save from synthetic events — the documented measurement stands, the class family consistent with the two live-verified siblings) | `border-violet-200 bg-violet-50` |
| analytics Tasks-Completed chip | computed `rgb(237, 233, 254)` = violet-100, class `bg-violet-100` — **no dark variant: the chip renders violet-100 in the reference's dark setting too** | `bg-violet-100 dark:bg-violet-900/50` |

The reference has **no accent picker** (Settings offers theme mode + avatar only;
`:root --primary: 139 92 246` fixed) — the clone's 7-accent system is the documented
superset. Conclusion: the four sites are byte-identical parity under the DEFAULT
violet accent; the "drift" exists only under the clone's six non-violet accents
(superset surfaces), which is exactly the accent-token doctrine's jurisdiction.

### The audits (rotated fresh eyes — the s134 closing directive, BOTH options executed)

- **Audit A — the data/import/export axis** (`src/lib/data-export.ts`,
  `src/lib/data-import.ts`, both routes in full, the /export page + ExportPanel,
  all four pin files, the schema's FK graph against `IMPORT_FK_MAP`):
  **0 Critical / 0 High / 1 Medium / 5 Low / 4 Informational**. The axis affirmed
  clean on: envelope identity/version folding, duplicate-id and `__proto__` handling,
  the one-transaction all-or-nothing restore, upsert-never-deletes, FK validation
  completeness (all 14 FK-bearing collections, `cards.deckId` the only required one,
  `folders.parentId` the only self-reference), Kahn topo-sort with cycle rejection,
  auth gating + userId scoping + the cross-user id-collision 409, the secret
  stripping (double guard), the 25 MiB counted-as-read cap, content-type gate,
  per-user budgets, download headers — plus the CH-series claims all re-verified
  (CH1 registry keys, CH2 ENUM_VOCABULARIES, CH4 the seam consumed by the route,
  CH5 exams.topics, CH6 the bounding family).
- **Audit B — the entities/factory axis** (`src/lib/server/entities.ts`, `http.ts`,
  `server/auth.ts`, `validation.ts`, `prisma/schema.prisma`, all 33 route files in
  full, the pin-layer coverage map): **0 Critical / 0 High / 1 Medium / 1 Low /
  3 Informational**. The factory affirmed clean on: the sent-keys partial-PATCH
  filter at all 17 write sites (the Zod4 trap closed), ownership/IDOR scoping
  everywhere (Flashcard via the deck relation), the owned-FK doctrine at every
  write site, mass-assignment stripping, the write-budget census, the guarded
  delegates' transactional re-reads, the schema's composites + the CH3
  every-FK-column index census, the uniform error envelope, field bounds.

**Every M finding re-verified by direct read BEFORE this plan** (A-M1: the export
route builds the 20-collection literal by hand against the seam's
`Partial<Record<ExportCollection, ExportRow[]>>` — an omitted key compiles clean and
silently exports `[]` + count 0; the import route's `IMPORT_ORDER` is route-local
(`route.ts:93-114`, not exported, zero test references) — a dropped collection's
rows are silently ignored. B-M1: `files/folders/route.ts:39-43` reads
`orderBy: [{ createdAt: "asc" }, { id: "asc" }], take: 500` — the OLDEST-500 window,
the exact BZ13/CA5 bug shape the factory's own doctrine documents, while the sibling
files GET uses the correct desc+take window). The L family likewise verified
(A-L1's CLAUDE.md:57 "NO restore/import" + "10 MiB" contradictions against the
shipped 25 MiB restore; A-L2's `undefined`/`null` early-continues at
`data-import.ts:418-421` + the route's `typeof value === "string"` guard at
`route.ts:270-274`; A-L3's stale test title; A-L4's s23 header miscount + false
exclusivity; A-L5's unpinned `PrismaClientValidationError` mapping + the
`split(":")` colon truncation at route.ts:447; B-L1's census comment claiming the
card delegate routes through `$transaction` while `entities.ts:616` is a plain
`db.flashcard.update`).

## 1. Findings → the CJ set

| # | Finding | Severity | Fix |
|---|---------|----------|-----|
| CJ1 | **B-M1 — the folders GET selects the OLDEST 500 rows**: the hand-written list is the only bounded enumeration in the API tree ordering `asc` and taking — past 500 folders (a single import envelope reaches it by the route's own comment) every newer folder vanishes from `GET /api/files/folders`; a freshly created folder appears once (its POST response) then disappears on reload while its files (correctly desc-windowed) reference a folder the client tree does not know. The factory's own BZ13 doctrine documents the shape; the sibling files GET uses the correct form | Medium | the desc+take+reverse form + the CA5-style e2e pin |
| CJ2 | **A-M1 — the route-side 20-collection registries have no machine guard**: the seam's manifest is byte-pinned, but the ROUTE wiring is prose-only — a dropped `findMany` exports every user's data minus that family (green typecheck: the seam's `Partial<Record>` accepts the omission, silently filling `[]` + count 0), and a collection dropped from the route-local `IMPORT_ORDER` is silently ignored on restore. The exact drift class the repo machine-guards everywhere else (INITIAL_COLLECTIONS, OWNED_FKS, the rate-limit census, the CH1 registry-key census) | Medium | `IMPORT_ORDER` moves to the seam (exported, next to `IMPORT_FK_MAP`) + the manifest-consistency extension + the export-route findMany census |
| CJ3 | **The violet-token family (CI8's honest deferral, now measured — the cycle's parity-measured centerpiece)**: four accent-semantic surfaces hardcode violet (3 × violet-200 borders, 1 × violet-100 chip bg) — byte-identical parity under the default accent (re-verified live this cycle) but frozen violet under the six other accents. The missing measurement now exists: the reference is single-accent (no picker), all four light values re-verified, and TWO of the four sites have byte-identical EXISTING tokens (`bg-violet-50` = `--sf-primary-softest` 245 243 255; `bg-violet-100` = `--sf-primary-empty` 237 233 254). The 200-level border tint has THREE uniform consumers — past the S92 "second consumer" threshold; the divergent dark halves (800/800/900) stay site-local per the S92 divergent-variant doctrine | Low (the register held it honest; the family closes it) | the `--sf-primary-edge` token family (§2.3) |
| CJ4 | **A-L2 — the required-FK guard skips null/missing/non-string values**: a `cards` row with `deckId` absent (create branch) or `null` (any branch) passes BOTH the seam's guard (the `undefined`/`null` early-continues run before the `spec.required` rejection) and the route's (`typeof value === "string"` — non-strings skip), then dies as `PrismaClientValidationError` → the GENERIC "fields do not match" 400 — the actionable ADR-021 contract silently degrades for one hand-crafted shape | Low | the seam rejects null/non-string required-FK values; the route rejects missing-on-create with the actionable message |
| CJ5 | **A-L5 — the exotic-fallback mappings unpinned + the 409 message truncates ids at the first colon**: the `PrismaClientValidationError` → 400 mapping (the route's last line of defense for "never 500 for bad input") and the concurrent-create 409 path have zero pins; `err.message.split(":")` destructured `[, collection, id]` truncates any id containing `:` (ids are legal to 64 arbitrary chars) | Low | the wrong-typed-field e2e leg + the colon-safe message parse (a pure seam helper, unit-pinned) |
| CJ6 | **The honest-docs family**: CLAUDE.md:57 opens the portability paragraph with the S21-era "NO restore/import" claim in the same paragraph that documents the session-23 restore, and says "a 10 MiB cap" while the shipped cap is 25 MiB (A-L1); the `IMPORT_MAX_BYTES` test title still says "is 10 MiB" (A-L3); the s23 header claims "exactly 9 import POSTs" (actual 8) + "no other spec file POSTs the route" (false — resilience + s14-hardening do; safety holds via chunk isolation, the argument the header should make) (A-L4); the CE5 census comment claims the hand-written card delegate routes through `$transaction` — it does not, and the census does not assert it (B-L1) | Low | the four doc corrections (comment, title, header, census comment) |
| CJ7 | **The pin riders (the audit I-family's load-bearing invariants)**: `preferencesSchema`'s default-free invariant is documented in the route's AJ4 note but guarded by prose only — a `.default()` added to it would silently reset that column on every partial save (B-I3); the export user block's Date→ISO conversion is unpinned (A-I4) | Low | the parse-`{}`-carries-no-keys leg + the `createdAt` ISO assertion |
| CJ8 | **A-I1 — the `parseImportEnvelope` header overstates its role + a dead duplicate loop**: the file header says the wrapper turns a file into rows "ready for the route's" transaction (the route consumes the stateless stages + account-aware twins instead — CH4's single-source doctrine); `finish()` repeats the unknown-collection rejection loop verbatim after `validateImportEnvelope` already ran it | Informational | the header reword + the dead loop deletion |

**Deferred with documented rationale** → §4.

## 2. The CJ set — design

### CJ1 (M) — the folders GET newest-500 window (B-M1)

`src/app/api/files/folders/route.ts` — the read mirrors the factory's own BZ13/CA5
form (and the sibling files GET at `files/route.ts:58`):
`orderBy: [{ createdAt: "desc" }, { id: "desc" }]` + `take: 500`, then
`folders.reverse()` — the presentation stays roots-first/asc (byte-identical for
≤500 rows), the window becomes the NEWEST 500. The route's CB10 comment updates to
record the CJ1 fix (the asc-shaped window was the BZ13 shape at its own admission).

**The e2e pin** (`tests/e2e/s14-hardening.spec.ts`, directly after the S126/CA5
sibling): the CA5 shape verbatim — fresh TEST-NET user (its own `192.0.2.x` IP —
the register/verify budget isolation convention), 505 folders via ONE import
envelope (stamped `createdAt`s, `cj1-folder-${i}` ids), then
`GET /api/files/folders`: **length 500, `[0].id === "cj1-folder-5"`,
`[499].id === "cj1-folder-504"`, `cj1-folder-0` absent** — RED pre-fix (the OLDEST
window returns folder-0 first). Chunk 2 (+1).

### CJ2 (M) — the route-side collection censuses (A-M1)

**The seam half:** `IMPORT_ORDER` moves from the route to `src/lib/data-import.ts`
(exported, beside `IMPORT_FK_MAP` — the order is ALREADY seam knowledge: the
parents-first topological order the route's comment cites). The route imports it;
`type Collection` follows the import. The existing manifest-consistency census
(`tests/data-import.test.ts`, the CH1 describe) gains the strongest leg:
**`new Set(IMPORT_ORDER)` ↔ `new Set(EXPORT_COLLECTIONS)` set-equality** (a dropped
or added collection fails BOTH directions). One new `it()`.

**The route half:** the script-conventions census pair (the established
source-reading idiom):
- the **export-route findMany census**: read `src/app/api/export/data/route.ts`,
  assert exactly **20** `findMany({` occurrences AND that each of the 20 manifest
  keys appears as a literal key in the `buildDataExport` call's argument object
  (the `subjects,` … `holidays,` shape) — a deleted read fails the count; a renamed
  key fails the membership;
- the **import-route consumption census**: read `src/app/api/import/data/route.ts`,
  assert it imports `IMPORT_ORDER` from the seam (no route-local re-declaration —
  the grep for `const IMPORT_ORDER` in the route source must be absent) and that
  the MODEL map's keys ride the imported type (the `as const` twin is gone).

One describe, two `it()`s in `tests/script-conventions.test.ts` (+2).

### CJ3 (L) — the violet accent-edge token family (the measured CI8 close)

**The token.** `--sf-primary-edge`: the accent's 200-level border tint — the light
interactive/selected outline. Per-accent values (the palette steps of each accent's
own hue family, the existing token table's convention; violet byte-identical to the
measured sites):

| accent | value | palette step |
|---|---|---|
| violet | `221 214 254` | violet-200 `#ddd6fe` (the measured sites) |
| blue | `191 219 254` | blue-200 `#bfdbfe` |
| green | `167 243 208` | emerald-200 `#a7f3d0` |
| orange | `253 230 138` | amber-200 `#fde68a` |
| pink | `251 207 232` | pink-200 `#fbcfe8` |
| red | `254 202 202` | red-200 `#fecaca` |
| teal | `153 246 228` | teal-200 `#99f6e4` |

(violet/emerald/amber/red confirmed against the repo's own `@theme` palette pins at
`globals.css:87/141/160/182`; blue/pink/teal are the v3-pinned family's standard
steps — the same values the token table's existing 100-level entries carry.)

**The plumbing (three files, the AO5/BV15 precedent):**
1. `src/lib/theme.ts`: the `edge` field joins `ACCENT_TOKENS` (7 accents, values
   above, each with the palette-step comment) + `accentCssVars` gains
   `"--sf-primary-edge": t.edge` — the set grows **17 → 18** (the doc comment and
   the S3-J regression pin update in lockstep — a partial set leaves stale violet
   values under other accents, the exact class the pin's comment warns about).
2. `src/app/globals.css`: `--color-sf-primary-edge: rgb(var(--sf-primary-edge));`
   joins the `@theme` utility block (generating `border-sf-primary-edge` /
   `bg-sf-primary-edge` / `text-sf-primary-edge`) + the `:root` default
   `--sf-primary-edge: 221 214 254;` (the pre-hydration violet fallback, the
   same- shape as every sibling default).
3. `tests/theme.test.ts`: the per-accent loop gains
   `expect(vars["--sf-primary-edge"]).toBe(t.edge);` + the violet leg asserts the
   byte-identity (`"221 214 254"`) + `toHaveLength(17)` → **18** + a NEW dedicated
   `it()` (the edge-family census: all 7 accents carry the field; violet equals
   violet-200; the light values are the 200-step of each accent's own hue family).

**The migrations (five sites, all byte-identical under violet):**
- `tasks-view.tsx:115`: `hover:border-violet-200` → `hover:border-sf-primary-edge`
  (the `dark:hover:border-violet-800` half STAYS — see the register below);
- `flashcards-view.tsx:394`: `border-2 border-violet-200` →
  `border-2 border-sf-primary-edge` (`dark:border-violet-800` stays);
- `notes-view.tsx:686-687`: `border-violet-200` → `border-sf-primary-edge` AND
  `bg-violet-50` → `bg-sf-primary-softest` (the EXISTING token — violet-50
  245 243 255 byte-identical; `dark:border-violet-900` + `dark:bg-slate-800` stay);
- `analytics-view.tsx:414`: `bg-violet-100` → `bg-sf-primary-empty` (the EXISTING
  token — violet-100 237 233 254 byte-identical, the S121/BV15 solid step;
  `dark:bg-violet-900/50` stays).

**The standing pins that must stay green (the byte-identity guards):**
`parity-session7.spec.ts:160` (the study-card front border `rgb(221, 214, 254)`),
`:579` (the notes selected border), the AD7 bg leg (`rgb(245, 243, 255)`),
`:305` (the analytics icon bg `rgb(237, 233, 254)`), `navigation.spec.ts:419` +
the `parity-session8` violet-100 family (OTHER surfaces — untouched). The token
resolves through `rgb(var(--sf-primary-edge))` → the identical computed
serialization (the utilities inline the `rgb(var(…))` STRING — trap 13's
serialization family, same form the sibling tokens already assert green).

**The NEW e2e pin (the accent-tracking discriminator — the family's whole point):**
`tests/e2e/theme-system.spec.ts` (+1): on `/Notes`, create/select a note (or reuse
the seeded demo note), assert the selected-row border computes `rgb(221, 214, 254)`
(violet), PATCH the accent to `blue` through the real settings API (the S27
doctrine — the applied accent rides the response), re-assert the SAME row's border
computes `rgb(191, 219 254)`-family (blue-200) — RED pre-fix (the hardcoded
violet-200 ignores the accent switch; the pin fails), GREEN post-fix. Restore the
violet accent in a finally (the closing-restore convention).

**The register re-shape (the S94/AU2 treated-entry precedent — treatment and
register-update ride ONE commit or the anchor pin fails on the stale row):**
`tests/hue-tokens.test.ts`'s `VIOLET_RESIDUALS` re-shapes from the four light
entries to the four **dark-half** entries —
`tasks-view.tsx` `/dark:hover:border-violet-800/`, `flashcards-view.tsx`
`/dark:border-violet-800/`, `notes-view.tsx` `/dark:border-violet-900/`,
`analytics-view.tsx` `/dark:bg-violet-900\/50/` — each with its why (the clone's
dark mode is the documented superset; the reference's Dark option is the measured
platform no-op, so the dark tints have NO reference ground truth; the three dark
border values are DIVERGENT [800/800/900] — the S92 divergent-variant doctrine
keeps them site-local until a dark-edge design pass earns its own token at a
uniform value). The negative sweep re-shapes to the dark family (a FIFTH
`dark:*border-violet-800/900` site fails) + a NEW consumer census leg: the three
migrated views carry `border-sf-primary-edge` at their registered lines (the S92
quote-adjacency discriminator — the class string, not a comment mention). The
comment block rewrites to the S135/CJ3 story.

### CJ4 (L) — the required-FK null/missing rejection (A-L2)

Two layers, both actionable:
- **The seam** (`src/lib/data-import.ts`, `validateImportEnvelope`'s FK loop): for
  `spec.required` fields, `value === null` or `typeof value !== "string"` → the
  actionable error (`Collection "cards" row "<id>" carries a <field> that is not a
  string — a required reference can never be null.`) — a required FK can NEVER be
  legitimately null in any branch, so the seam can reject unconditionally.
  `undefined` (absent) stays seam-legal (the update-branch untouched case — the
  seam cannot know the branch). Unit pin: `tests/data-import.test.ts` +1 (the
  null-deckId row and the numeric-deckId row both throw the ImportRowError family
  with the actionable message; the absent-deckId row still passes the seam).
- **The route** (`src/app/api/import/data/route.ts`, the required-FK loop at
  :266-285): a row whose required-FK value is `undefined` AND whose id is NOT in
  `knownIds` (a CREATE branch — the pre-tx census is already in hand) → the
  actionable 400 (`cards: row "<id>" is missing its required <field> — a new row
  must reference a deck in this backup.`). The e2e leg (+1, chunk 3 — in
  resilience.spec.ts after the §5 correction 8 relocation): POST an
  envelope with a new-branch cards row lacking `deckId` → 400 carrying
  "missing its required deckId" (RED pre-fix: the generic "fields do not match"
  message).

### CJ5 (L) — the exotic-fallback pins + the colon-safe 409 (A-L5)

- **The colon-safe parse**: `src/lib/data-import.ts` gains the tiny pure helper
  `parseImportRaceMessage(message: string): { collection: string; id: string }`
  (everything after the SECOND colon is the id — `indexOf` slicing, never a bare
  `split`); the route's 409 handler consumes it. Unit pin (+1): the helper parses
  `import-p2002:cards:weird:id:with:colons` → `{ collection: "cards", id:
  "weird:id:with:colons" }`.
- **The wrong-typed-field e2e leg** (+1, chunk 3): POST (the demo session) an envelope
  whose `tasks[0]` carries a legal-length UNKNOWN field with a number value
  (`someField: 42` — survives the seam's primitive strip? NO: the seam rejects
  unknown fields already… the audit's exact repro is a WRONG-TYPED KNOWN field,
  e.g. `title: 42`) → assert 400 + "fields do not match" — pinning the
  `PrismaClientValidationError` mapping's wire behavior (RED state: the mapping
  exists untested — the pin lands GREEN on current code as a coverage pin, the
  designed expectation for a missing-test finding; the pin's value is the
  regression guard).

### CJ6 (L) — the honest-docs family

- `CLAUDE.md:57`: drop the "NO restore/import (the schema + SQLite file are the
  restore story)" sentence; "a 10 MiB cap" → "a 25 MiB cap (S124/BY3)".
- `tests/data-import.test.ts:363`: the title "is 10 MiB — 5x the largest realistic
  single-user envelope" → "is 25 MiB — the S124/BY3 export/import reconciliation".
- `tests/e2e/s23-import.spec.ts:24-27`: the header recount (8 demo-user POSTs with
  the real line items) + replace the false exclusivity claim with the chunk-
  isolation argument (resilience's 2 demo POSTs live in chunk 3 — a different
  server process; the limiter is per-process in-memory).
- `tests/script-conventions.test.ts:258-260`: the census comment drops the "(and
  the hand-written card delegate's)" parenthetical (the card delegate's update is
  a plain `db.flashcard.update` by design — no cross-field invariant; a deck
  change TOCTOU resolves as P2003 → 400).

### CJ7 (L) — the pin riders

- `tests/validation.test.ts` (+1): `preferencesSchema` parses `{}` to a result
  carrying NO keys (the AH8 guard — fails the moment a `.default()` lands on any
  field).
- `tests/data-export.test.ts` (+1): the envelope's `user.createdAt` serializes as
  the ISO string (the Date→ISO branch of `serializeExportRow`'s user-block path —
  `expect(envelope.user.createdAt).toBe("2026-10-09T08:00:00.000Z")` against the
  existing `WHEN` fixture).

### CJ8 (I) — the parseImportEnvelope cleanup (A-I1)

- The file header reword: "unit-pinned reference parser; the route consumes the
  stateless stages + the account-aware twins (CH4's single-source doctrine)".
- `finish()`'s duplicate unknown-collection rejection loop (the verbatim repeat of
  `validateImportEnvelope`'s :316-323 loop) — deleted (unreachable duplication;
  the unit pins that exercise `parseImportEnvelope` stay green — the behavior is
  unchanged, only the dead second pass goes).

## 3. The TDD pins (RED design — the projection)

Unit (target ~+8, the census 1314 → ~1322): `theme.test.ts` +1 (the edge-family
census) · `hue-tokens.test.ts` +1 (the consumer census leg; the register re-anchor
rides the existing two legs) · `script-conventions.test.ts` +2 (the export findMany
census + the import consumption census — both RED on current code: 20 findMany
counting… the count IS 20 today; the RED discriminator is the IMPORT_ORDER
import-absence [route-local today] and… careful: the export census's count leg
passes today — its RED half is the CJ2 seam move; the census pins are anchored
GREEN-after-change coverage pins for the route side, the S93/AT1 register-born-green
precedent) · `data-import.test.ts` +2 (the required-FK null/non-string rejection —
RED pre-fix [the seam passes null today]; the IMPORT_ORDER↔manifest set-equality —
RED until the seam move) +1 (the race-message helper — RED until the helper lands)
· `validation.test.ts` +1 (the preferencesSchema default-free leg — GREEN coverage
pin, the missing-test expectation) · `data-export.test.ts` +1 (the user-block ISO
leg — GREEN coverage pin).

E2E (target +4, the census 584 → 588): chunk 2 +2 (the CJ1 folders window pin —
RED pre-fix [the OLDEST window]; the CJ3 accent-edge discriminator — RED pre-fix
[the hardcoded violet ignores the accent switch]) · chunk 3 +2 (the CJ4
missing-deckId 400 — RED pre-fix [the generic message]; the CJ5 wrong-typed-field
400 — GREEN coverage pin — both relocated from the s23/chunk-5 first draft after
the registerGlobal cap tripped, §5 correction 8). The chunk map re-tags in lockstep with the
machine-enforced Expected pin: **150 + 183 + 76 + 94 + 85 = 588**.

RED discipline: every defect pin verified failing for its DESIGNED reason (the
folders pin reading the OLDEST window; the accent pin reading violet under blue;
the deckId pin reading the generic message), with the 1314 baseline otherwise green
throughout. The coverage pins (the censuses' count legs, the CJ5/CJ7 legs, the
theme/hue re-anchors) land green on current code — the designed expectation for
missing-test findings, the S93/AT1 precedent.

## 4. Deferrals (documented, with rationale)

- **The dark-edge token family** (CJ3's honest remainder): the four dark halves
  (`dark:hover:border-violet-800` ×1, `dark:border-violet-800` ×1,
  `dark:border-violet-900` ×1, `dark:bg-violet-900/50` ×1) stay site-local +
  register-anchored. Rationale: NO reference ground truth exists (the reference's
  Dark option is the measured platform no-op — the clone's dark mode is the
  documented superset, its values are clone design decisions); the three dark
  border values are DIVERGENT (800/800/900 — the S92 divergent-variant doctrine:
  a token per divergent value is speculative scaffolding); a future harmonization
  (one dark-edge step per accent) is a design pass of its own that changes dark-
  mode rendering at three sites.
- **The remaining audit-A I-family**: the per-row probe+write transaction shape
  (P2028 → 500 only at ~10⁵-row adversarial envelopes, self-DoS bounded by the
  per-user budget — the documented posture); the `updatedAt` round-trip fidelity
  (Prisma-managed, metadata-exempt either way — pin if a product decision ever
  demands it).
- **The remaining audit-B I-family**: the flashcard card list's unbounded deck
  scope (documented posture — the take would hide cards); the read-side endpoints
  outside the write-budget census (the documented single-user self-hosted scope).
- **The standing s133/s134 deferred set** (unchanged): the pre-CE5 unguarded
  delegates (theoretical), the write-budget census per-method granularity, the
  boot double-fetch (ADR-014's contract), the newest-500 window vs import minting
  (CJ1 closes the file-family straggler — the factory collections remain the
  documented posture), the Docker non-root runtime, the resend/forgot ms-scale
  timing equalization, the drawer-link emission order, the flashcards
  render-phase unlatch, the iOS scroll-lock nuance, the RFC 7239 signed-proxy
  posture, the complement-burn retirement (post-transition; needs a
  deployed-legacy-rows census capability), the verify-email ms-scale timing
  asymmetry, the A-I/B-I documented-posture families, the KPI gradient stops.
- **Future KDF raises**: unchanged (the accepted-set parser makes each raise an
  explicit, pinned decision).

## 5. The as-executed record

**RED (verified).** 14 unit defect pins failed for exactly their designed reasons:
data-import 8 (the null/non-string `deckId` rows passing `validateImportEnvelope`;
`IMPORT_ORDER` invisible to the test import — the route-local const; `parseImportRaceMessage`
not a function ×3) · script-conventions 1 (the route-local `const IMPORT_ORDER` present)
· hue-tokens 2 (the three `border-violet-200` light sites still present + no
`border-sf-primary-edge` consumers) · theme 3 (the edge var absent ×2 + the
`toHaveLength(17)` on the 18-var design). At the e2e layer: **CJ1 RED for the designed
reason** (the folders GET answered the OLDEST window — `list[0]` = `folder-0` against
the expected `folder-5`), **CJ3 RED for the designed reason** (the notes selected-row
border stayed `rgb(221, 214, 254)` under the BLUE accent — the hardcoded violet
ignored the switch), **CJ4 RED for the designed reason** (the generic
"fields do not match" instead of the named `deckId` message), and **CJ5 GREEN on
current code** — the coverage pin, the designed expectation for a missing-test finding.
The coverage pins likewise landing green on current code: the CJ4 absent-deckId seam
leg (the update-branch untouched case), the two export-route census legs (the count
IS 20 today), the dark-half register anchors, the CJ7 riders.

**The honest mid-run corrections.**

1. **The CJ3 bg utilities never existed** — the migration swapped
   `bg-violet-50` → `bg-sf-primary-softest` and `bg-violet-100` → `bg-sf-primary-empty`
   believing the tints rode tokens; the tokens existed as runtime VARS but their
   `--color-sf-primary-*` UTILITIES had never been declared in `@theme` (the block's
   own header said "the only ones" — six). The border site survived (its utility was
   added in the same change) but BOTH bg sites silently rendered `rgba(0, 0, 0, 0)` —
   caught by the standing AD7 + analytics e2e pins in the first re-cert chunk 2 (2
   failures), NOT by typecheck/lint/build. The fix: the @theme utility set grows
   six → eight (softest + empty join for their first UTILITY consumers) + the lesson
   recorded in AGENTS.md (S135 lesson 1: a var and its utility are two different
   facts; grep the @theme block in the same commit as any palette→token swap).
2. **The CJ4 route guard first keyed on `knownIds`** — which unions the envelope's
   OWN ids with the existing rows, so every imported row always looked "existing"
   and the create-branch discriminator never fired (the e2e pin stayed RED through
   the first GREEN attempt). The fix: the census records a second, DB-only
   `existingIds` map — the upsert probe's own branch truth. The re-run GREEN.
3. **The CJ1 pin's first draft used fixed folder ids** (the CA5 sibling's shape) —
   the second ad-hoc RED-verification run registered a NEW user but collided on the
   global PKs → the cross-user 409 (correct behavior, wrong failure). Stamped
   `Date.now()` ids adopted; the cert runner's cold reset protects the CA5 form but
   ad-hoc re-runs do not get that protection.
4. **The CJ4 seam guard landed in the wrong function first** — the FK loop edited
   was `parseImportEnvelope`'s (the non-production wrapper), while the pins and the
   route consume `validateImportEnvelope`. Moved to the envelope validator (the
   row-level required-FK check after the array check); the wrapper's loop restored
   untouched.
5. **The capture script's frame 3 needed absolute URLs** (a standalone playwright
   script has no baseURL — `page.request.patch("/api/settings/preferences")` threw
   "Invalid URL") and was RE-CAPTURED after the utilities fix (the first frame-3
   render carried the transparent-bg regression the AD7 pin caught).
6. **One TS2339 narrowing bug** in the CJ4 unit pin (an inverted `if (!res.ok)`
   guard narrowing to the ok:true branch) — fixed to the sibling form.
7. **The unit census landed at +18 (1314 → 1332), above the ~+8 projection** — the
   exact per-file arithmetic: data-import 102 → 111 (+9), script-conventions 30 → 33
   (+3), theme 16 → 18 (+2), hue-tokens 17 → 19 (+2), validation +1, data-export +1.
   The e2e census landed at exactly **+4** (584 → 588), the projection exact: chunk 2
   +2 [CJ1 + CJ3], chunk 3 +2 [CJ4 + CJ5 — after the correction below].
8. **The CJ4+CJ5 pins' first draft tripped chunk 5's `registerGlobal:` 40 cap** —
   the pins lived in s23-import.spec.ts (chunk 5) with fresh TEST-NET registrations
   that were WASTED (the file-level demo storageState put the import POSTs on the
   demo session anyway — the fresh accounts were registered + verified + never
   used) and FATAL to the chunk's register census: chunk 5 already carries ~40
   register POSTs (auth-flows' 13 sites incl. the CI3 quartet's 11 + the
   verify-OTP re-register pairs + greeting-clock/s18/s24/s25/s26's fresh journeys)
   — AT the sitewide 40/15-min cap with zero headroom; the +2 pushed it over and
   s26's register (the chunk's LAST registering test) 429'd, deterministically
   (reproduced on a clean re-run; standalone s26 green — the process-scoped
   mechanism). The fix: the pins relocate to resilience.spec.ts (chunk 3 — the
   natural home beside the BW11/BY3 import perimeter pins) in the BY3 demo-session
   form (the 400 message shape is account-independent, the guards fire before any
   user-specific write; chunk 3's demo import budget 4/10, s23's 8 live in chunk
   5's separate process). Chunk map: **150+183+76+94+85**; the s23 header's CJ6
   recount now documents the registerGlobal cap as the chunk-scoped constraint.

**GREEN (verified).** lint ✓ · `tsc --noEmit` ✓ · unit **1314 → 1332 (45 files)** ·
the canonical build green (exit 0) · the cold 5-chunk e2e **584 → 588 —
150+183+76+94+85, every chunk first-pass on the FINAL tree** (chunk 1 re-run after
the utilities fix — the first chunk-2 run's 2 failures [AD7 + the analytics icon
pin] were the missing-utilities regression itself, root-caused and fixed; the
honest sequence: chunk 1 pre-fix 150 ✓ → chunk 2 pre-fix 181+2✗ → the utilities fix
+ rebuild → the full 5-chunk sequence re-run on the final tree, every chunk
first-pass). The drawer battery GREEN on the remediated tree — **the 46th
consecutive no-Tailwind-v4-mobile-nav-bug confirmation**. Three evidence frames
under `docs/screenshots/135-clone-*` (the desktop dashboard, the mobile drawer, and
the NEW CJ3 notes accent-edge surface — the capture script's own computed-border
waitForFunction [blue-200 under the blue accent, via the REAL settings-API accent
switch] + the passing CJ3 e2e pin are the machine proof; the violet accent restored
in the finally; pixel-stat-verified non-blank). **Census: 1332 unit + 588 e2e =
1920 green.**

**The docs set (same commit):** README (the badge 1920 + the census lines + the
S135 row), AGENTS.md (the census anchors + the accentCssVars 18-var note + the NEW
"S135 lessons" section — the utility-vs-var lesson, the knownIds≠existingIds
lesson, the raw-PATCH-reload lesson, the run-unique probe ids, the s23 prose
honesty), PAD **v1.3.43** (the revision block + the §8.1 Total row), the SKILL doc
(the census anchors), the vitest header (45/1332 + the S135/CJ re-anchor block),
the cert-script re-tags (the S135/CJ block + Expected 588 in both + the
script-conventions Expected pin), the plan §5 (this record), `docs/session_141.md`,
and the worklog entry.

**Deferral deltas (§4):** none promoted; the violet-200 token family is CLOSED on
its light half (CI8's deferral resolved as far as parity measurement supports) —
the NEW deferred item is the dark-edge token family (the four dark halves stay
site-local + register-anchored: no reference ground truth for dark, the 800/800/900
divergence, a future harmonization pass at a uniform value).

# Remediation Plan — Session 159 (Cycle 109, Batch DH)

> Status: PLANNED (pre-change record — the immutable plan; the as-executed
> close lives in §7). Written before any source change, per the standing
> doctrine ("write the cycle plan into docs/remediation-plan-sessionN.md
> BEFORE any source change").
>
> Operator directive: refresh the workspace, re-read the doc chain
> (AGENTS/CLAUDE/README/PAD/SKILL + session_189/190 +
> remediation-plan-session158 + worklog), validate against the codebase,
> audit with the repo-included skills (skills/web-application/SKILL.md the
> primary; the skills catalog for the rotation), iterate toward
> visual/functional parity with omni-study1.base44.app (live reference
> login, mobile-nav attention, the Tailwind v4 bug watch), keep `.env` at
> `DATABASE_URL="file:../db/custom.db"` + the repo-root `db/`, validate the
> vitest/playwright suites, remediate TDD-first, capture evidence frames,
> update the doc chain, push via the SSH wrapper. The repo's `skills/`
> folder stays excluded from code checking, testing, and compilation.
> Proceed with best judgement on the remaining open questions (the
> operator's standing instruction).

## §0 Scope, method, cold baseline, live parity

**Workspace (cold — the workspace was RESET; a fresh
`git clone https://github.com/nordeim/omni-study1.git` at `6cf1167` on
`main` [the Batch DG fix `3103b8b` + the operator's session_190 transcript
commit]; the environment rebuilt: `cp .env.example .env` [byte-identical at
the documented dev posture — `DATABASE_URL="file:../db/custom.db"`],
`bun install` [510 packages], `bun run db:push && bun run db:seed` [the
repo-root `db/custom.db`, 389 KB], `bunx playwright install chromium`,
bun 1.3.14).**

**Cold baseline (before any work): lint ✓ · tsc ✓ · the full Vitest run
1611/1611 (48 files — the documented S158 final state exactly) · the dev
daemon preflight GREEN (hydrated, navigation-stable) · the drawer check
GREEN (**the 78th consecutive no-Tailwind-v4-mobile-nav-bug confirmation**
— backdrop oklab(0 0 0 / 0.2) + blur(4px); 288px white panels; 20 links;
no footer; Escape-close superset) · the desktop chrome probe **MATCH** (all
five formal checks, live reference login — sidebar-outer 260 / 20 links /
first-links / mainX 260 / mainWidth 1180, the S142 outer-footprint
probe).** Baseline noise: none.

**The config posture re-validated (the operator's standing ask):** the
vitest include matches `src/**/*.test.ts` + `tests/**/*.test.ts` only (the
e2e specs never ride the unit runner); the playwright testDir is
`tests/e2e` with the production-build webServer on `db/e2e.db`; tsconfig
excludes `skills`; eslint ignores `skills` — the repo-included `skills/`
folder is excluded from code checking, testing, and compilation on every
axis, as directed.

## §1 The audits (Mode-C; every L+ finding re-verified by direct read by the orchestrator)

### Audit A — the Batch DG recent-changes axis (the `3103b8b` diff; `6cf1167` is docs-only)

**0C / 0H / 0M / 0L / 0I — clean.** All three DG claims verified DELIVERED
at the source level: DG1's paged reader contract
(`ExportCollectionPage = { rows, hasMore }` + the driver loop +
`pageAfter` with `EXPORT_BATCH_ROWS = 5000` + the BATCH+1 one-extra-row
page + the unique-id cursor + `skip: 1` + all 20 readers paged, cards
deck-scoped) at data-export.ts:250–259/304–359 + export-build.ts:72–126;
DG2's ownership-scoped update writes (`where: { id, userId: user.id }`,
cards excepted) at route.ts:642; DG3's both-branches file-input reset at
export-panel.tsx:242+254 — and the doc census chain machine-verified
(README badge 2227 ✓ · AGENTS 1611 ✓ · CLAUDE 1611 ✓ · PAD v1.3.66 ✓ · the
SKILL census ✓ · the vitest header 48/1611 ✓ · the cert runner Expected
616 ✓) — zero stale count sites.

### Audit B — the import create-path family (the S158 close's recorded rotation, swept as a family)

The axis read dispatched to a read-only subagent against the
web-application skill's §3/§4/§6/§7/§16/§17 rubric: the route's full 721
lines + the data-import seam + both unit files + the e2e round-trip spec +
the panel + the schema + the measurement scripts. **Verdict:
0C / 0H / 0M / 3L / 6I.** The family remains coherent, well-pinned, and
secure (the gate ordering auth → limiter → content-type → byte cap → parse
→ validate → row cap; the DG2 scoped updates; the write-only tx with the
explicit 60 s timeout; the collision pre-flight; the secrets strip; the
budget arithmetic machine-pinned; the DG3 fix complete — exactly one file
input in the panel, both branches reset). The findings:

- **L-1 (L — Verified by direct read):** the optional-FK non-string
  divergence — the seam's reference parser nulls a non-string optional FK
  (`String(value)` miss → the SetNull branch, data-import.ts:624–638)
  while the production route's twin guard SKIPS it
  (`typeof value !== "string" → continue`, route.ts:426–432) and the raw
  number rides to Prisma → `PrismaClientValidationError` → the GENERIC
  "fields do not match" 400 — the exact actionable-message degradation
  class S135/CJ4 closed for the REQUIRED twin (`cards.deckId`), on the
  optional boundary. A hand-crafted `subjectId: 42` imports clean through
  the unit-pinned parser and 400s generically through production — the
  unit pins describe unreachable production behavior (the CH4 doctrine).
  **Rides §3 (DH1 — the CJ4 mirror at the optional-FK boundary).**
- **L-2 (L — Verified by direct read):** the import↔interactive length-cap
  parity is machine-enforced at the KEY level only, never the VALUE level
  — `IMPORT_FIELD_LENGTHS` hand-mirrors the values (title/name 200, notes
  5000, description 1000/5000, front/back 2000, tags 2000, room 100,
  JSON-blob 100k, calc 500, chat 100k, mime 100) that live as inline Zod
  literals (validation.ts:31 `boundedTitle`, :258 `.max(5000)`, the
  `jsonArray` atom, calculatorHistorySchema, the route-local folder atom,
  ai.ts's `PERSISTED_CONTENT_MAX`, http.ts's `UPLOAD_MIME_MAX_CHARS`).
  A future relaxation in any source silently makes the import STRICTER
  than the app — one row the app itself minted then bricks the ENTIRE
  all-or-nothing restore with a message blaming the user's backup (the
  repo's own S137/CL1 lesson class). **Rides §4 (DH2 — the value-parity
  census, the script-conventions source-census precedent).**
- **L-3 (L — Verified by direct read):** the create-side measurement gate
  was unanswered in the recorded evidence — the S154 probe times ONLY the
  update loop + the full-row probe; the createMany loop, the mixed
  worst-case tx, and the pre-tx CPU stages were never measured, yet the
  raw-SQL create sibling's deferral is gated on profiling. **Rides §2
  (DH0 — the measurement, run FIRST per the S154/S157/S158
  measurement-first doctrine).**

I-1..I-6 informational: the dead ternary (route.ts:340), the double
per-create-row object copy, the elision probe's full-row reads, the
documented post-parse row cap, the app-wide PAD §6.2 envelope shape (the
code-wins rule), the stale "Deleted after" header on the S154 probe.
Adjudicated in §6.

**Point 8 (the round-trip compatibility verdict): COMPATIBLE, pinned.**
The DG1 pagination changed the export's internal read strategy only —
`DATA_EXPORT_VERSION` stays 1, the envelope wire shape is byte-identical
(unit oracle + the multi-batch legs), and the full round-trip is
e2e-witnessed against the post-DG1 build (s14-hardening + s23-import).
No action.

## §2 DH0 — the measurement (run FIRST; it decides the cycle)

The probe (`scripts/measure-import-create-s159.mjs`, committed — the
S158 measure-export-heap-s158.mjs precedent) rides the REAL seam stages
(`validateImportEnvelope` + `sanitizeImportRow`) and the route's EXACT tx
shapes (chunked `createMany` at `IMPORT_CREATE_CHUNK = 500`; the
`$transaction({ timeout: 60_000, maxWait: 5_000 })` options) against a
throwaway `db/measure-s159.db`:

- **The CREATE loop** (cold, fresh ids each pass): 1k = 113 ms · 10k =
  596 ms · 25k = 1 166 ms · 50k = 2 381 ms · 100k = 4 621 ms —
  **0.046 ms/row at the cap** (one round trip per 500 rows; ~7× cheaper
  than the measured 0.32 ms/row update loop).
- **The MIXED tx** (the true worst legal shape at the 100k row cap —
  half sequential per-row updates + half chunked creates in ONE tx):
  10k = 2 074 ms · 50k = 9 329 ms · 100k = **19 557 ms** vs the 60 s
  budget — **3.07× headroom** (update-dominated by construction).
- **The PRE-TX CPU at the cap** (the REAL parse → validate →
  per-row-sanitize pass over a 100k-row envelope): parse 179 ms ·
  validate 1 ms · sanitize 567 ms = **747 ms total**.
- **The end-to-end worst case**: 20 304 ms vs the client's 120 s
  `AbortSignal.timeout` — **5.91× headroom**.

**The verdict: the raw-SQL create-side sibling's deferral STAYS CLOSED
(rejected on measurement — the gate's own condition "IF profiling ever
presses the 60 s budget" is decisively unmet), and L-3 is closed by
data.** The cycle core therefore rides the audit's L-1/L-2 (§3/§4).

## §3 DH1 — the optional-FK non-string rejection (the L-1 close, the CJ4 mirror)

**The change (src/lib/data-import.ts, `validateImportEnvelope`):** a new
documented block directly after the CJ4 required-FK rejection — for every
collection's OPTIONAL FK specs, a row value that is neither `undefined`
(absent — the update branch's untouched case) nor `null` (the SetNull
semantics) nor a `string` is REJECTED with the named message:

> `Collection "<c>" row "<id>" carries a <field> that is not a string id
> — an optional reference can never be a non-string value.`

(the CJ4 phrasing's optional twin; the row id and the field are named; the
operator's edit pointer survives). Production now answers the named 400 at
the validateImportEnvelope boundary (the route already consumes
`envelopeCheck.error` verbatim — route.ts:257–260), and the seam's
reference parser inherits the rejection by delegation (its nulling loop's
non-string branch becomes unreachable — defensive, left in place with the
comment updated to name the DH1 guarantee).

**The RED legs (tests/data-import.test.ts, a new `S159/DH1` describe):**
1. rejects a tasks row with a NUMBER `subjectId` — the named message
   (contains "tasks", "subjectId", the row id);
2. rejects a tasks row with a non-string non-null shape family member
   (a boolean/object `subjectId`);
3. still ACCEPTS `null` (the SetNull semantics preserved — the
   resolvable-dangling nulling path untouched);
4. still ACCEPTS `undefined` (the update branch's untouched case);
5. `parseImportEnvelope` rejects the same shape (the delegation leg —
   the reference parser can no longer describe the unreachable nulling).

**Arithmetic: +5 unit legs.** No e2e census change (the route consumes the
seam's error verbatim — already wired; the S158 DG2/DG3 precedent: unit
pins only, the 616 census holds).

## §4 DH2 — the value-parity census (the L-2 close, the machine enforcement)

**The change (tests/data-import.test.ts, a new `S159/DH2` describe):** a
source-census leg family (the script-conventions precedent — read the
source, regex-extract the atoms, assert equality with
`IMPORT_FIELD_LENGTHS`):

1. **The completeness census:** every `IMPORT_FIELD_LENGTHS` key appears
   in exactly one source map (validation.ts schema-field map, or the
   other-source map) — a NEW registry key without a mapping fails loudly
   (the census forces the author to pin its parity source).
2. **The validation.ts parity:** parse `src/lib/validation.ts` — extract
   the shared atoms (`boundedTitle`'s `.max(N)`, `jsonArray`'s
   `.max(N)`) and the per-schema-field inline `.max(N)` literals for the
   mapped keys (subjects/taskLists/tasks/assignments/exams/events/
   timetableClasses/notebooks/notes/decks/cards/practiceTests/
   studyGroups/grades/holidays/calcHistory) — assert every mapped
   registry value equals its extracted source value.
3. **The other-source parity:** `folders.name` ↔ the folders route's
   route-local `z.string().trim().min(1).max(N)` atom;
   `chatMessages.content` ↔ `PERSISTED_CONTENT_MAX` (ai.ts);
   `files.mime` ↔ `UPLOAD_MIME_MAX_CHARS` (http.ts).

**Arithmetic: +3 unit legs.** Source-only test change; no production
change (the census is the guard — the values already agree; the guard
catches the FUTURE relaxation).

## §5 DH3 — the riders (I-1 + I-6, behavior-preserving)

- **I-1 — the dead ternary (route.ts:340):**
  `const targetCollection = target === source ? source : target;` — both
  branches yield `target` (a tautology; the `self` target form resolves
  identically). Collapsed to the direct `target` read with the comment
  kept honest. Verified-by-read before the change; behavior-identical
  by construction (the S98/AY "lying-type" lesson class — dead code that
  reads as if it did something).
- **I-6 — the stale header (measure-import-window-s154.mjs:8):** the
  "Deleted after the measurement is recorded" line contradicts the
  script's actual retention (later docs cite it as the probe precedent).
  The header now records the retention honestly.

## §6 The rejections + the deferral ledger (adjudicated, the operator's standing best-judgement instruction)

- **I-2 (the double per-create-row object copy) — REJECTED AS
  MEASUREMENT-COVERED.** The DH0 numbers: the worst legal mixed shape
  completes in 19.6 s of the 60 s budget (3.07× headroom) and the
  end-to-end 20.3 s of the 120 s deadline (5.91×); the extra ~100k
  transient objects at the cap are inside the documented accepted
  parse-memory posture (S144/CS5, I-4's family). A micro-allocation fix
  buys nothing the budgets need — the smallest-safe-diff doctrine keeps
  the working code untouched. Recorded here for the next rotation.
- **I-3 (the elision probe's full-row reads) — REJECTED AS A DOCUMENTED
  MEASURED TRADE-OFF.** The S154 measurement recorded the 2.1 s probe
  cost at 100k rows as accepted; the worst legal files-shape case is
  bounded by the byte cap (~23 max-size rows); a planned-keys-∪-id
  `select` is a real read-shape change with real edge risk (Date/JSON
  column coercion in the no-op diff) for a documented-accepted cost.
  The S158 F7 treatment: rejected as not-a-gap, the option recorded.
- **The 501-row chunk-boundary e2e leg — DEFERRED AS SOUND-BY-
  CONSTRUCTION.** The topo-sorted parents-first array is sliced in order
  and concatenated — order preservation across chunk boundaries is a
  property of slicing a sorted array (the topo sort itself is
  unit-pinned at 250k rows, the S154/DC-era leg). The audit's own
  assessment: "sound by construction." Recorded, not built.
- **I-4 (the post-parse row cap) — unchanged, the documented S144/CS5
  accepted posture.** I-5 (the envelope shape) — the app-wide PAD §6.2
  contract; the skill's own code-wins rule; no action.
- **The standing deferral ledger (unchanged this cycle):** the A-M3
  stage-2 (re-measure only if the hardware or the row cap changes); the
  update-side raw-SQL bulk upsert (the 60 s budget now measured at
  3.07× headroom on the worst mixed shape — the gate stays closed
  harder); the I-2 parse-amplification posture (documented).

## §7 The as-executed close

**Executed as planned, with the honest deltas:**

- **The RED inventory:** the unit REDs **3/3 on their designed markers**
  (the DH1 rejection legs — the number shape, the shape family, the
  delegation leg; the null/undefined acceptance guards passed through,
  proving the preserved contracts). The plan's DH2 note ("RED is the
  map-missing state, GREEN the enforced state") held — with one
  mid-cycle correction the census's own loud-failure property caught:
  the multi-line `practiceTestSchema.questions` Zod chain (its
  `.string()/.max()/.refine()` broken across lines with comments)
  tripped the single-line field extractor; the parser was taught
  chain capture (from the field name until the next 2-space field
  line) before any source change landed. A second tooling find on the
  way: a const-inferred `die` arrow does NOT trigger TS's never-call
  narrowing (`if (!m) die(...)` left every extraction site
  possibly-null) — the function-DECLARATION form does; both recorded
  in the AGENTS S159 lessons.
- **The count arithmetic held exactly:** unit 1611 → **1619** (+8:
  the 5 DH1 legs + the 3 DH2 census legs), 48 files; the e2e census
  unchanged at 616 by design.
- **The live DH1 verification (beyond the plan):** the named 400
  observed on the wire for the `subjectId: 42` shape (previously
  Prisma's generic fallback), AND the dangling-STRING twin imported
  clean end-to-end (200, created: 1 — the SetNull path). The probe
  row cleaned from the demo db afterward.
- **The rejections held:** I-2 (measurement-covered), I-3 (documented
  trade-off), the chunk-boundary leg (sound-by-construction) — no
  source change rode them.
- **Gates:** lint ✓ · tsc ✓ · unit 1619/1619 · build ✓ (7 warnings —
  the documented set; standalone 144M) · the remediated-tree
  re-confirmation (preflight GREEN after the preemptive S9/S31 remedy
  · drawer GREEN — the 79th · parity MATCH) · the live /export page
  probe GREEN (20 chips, counts MATCH, X-Export-Bytes exact, the
  secret guard holds) · the 5-chunk cold cert — chunk 1 151/152 (one machine-load
  flake — parity-session8's S125/BZ3 "Tab closed the menu" leg, the
  documented S139/S157 class; the standalone-cold re-run 68/68
  first-pass clean) · chunk 2 185/189 (the four UTC-midnight
  day-boundary legs — the run crossed 00:00 UTC mid-chunk, the
  documented S45 class; the full-chunk standalone-cold re-run
  189/189 first-pass clean) · chunk 3 90/91 (one machine-load flake —
  resilience's files-upload "unrelated folder succeeds" leg; the
  settled standalone-cold re-run 41/41 first-pass clean, the S158
  precedent's exact numbers) · chunk 4 95/95 · chunk 5 89/89 — the
  cert tally **616/616 with the three flake classes each adjudicated
  standalone-clean** · **census 2235 green** (was 2227).
- **Evidence:** the `docs/screenshots/159-clone-*.png` frames (the
  standing desktop + the mobile drawer [the 79th drawer-GREEN
  companion] + the cycle's /export surface), self-verifying
  (ok: true; dimensions machine-checked; md5s distinct) — captured by
  `scripts/capture-s159-evidence.mjs` (the S158 precedent, node ≥ 23.6).
- **Docs:** README badge/census + the Session-159 row · AGENTS census +
  the import row extension + the S159 lessons block · CLAUDE counts ·
  PAD v1.3.67 · the SKILL census · the vitest header ·
  `docs/session_191.md` · the worklog Session-170 entry · this §7 ·
  the `.env`/`.env.example` contract re-verified byte-identical (no
  env-var reads changed this cycle).
- **Remaining debt:** unchanged from §6's ledger — the A-M3 stage-2
  (hardware/row-cap triggers), the update-side raw-SQL gate (closed
  HARDER on the DH0 numbers), the I-2/I-3 options (recorded), the I-4
  parse posture (documented).

## §8 The ToDo list (the execution checklist)

- [x] Cold bootstrap + baseline certification (§0)
- [x] Audit A (the DG axis) — clean, all anchors verified
- [x] Audit B (the import family) — 0C/0H/0M/3L/6I, every L re-verified by direct read
- [x] DH0: the measurement probe written + run — the raw-SQL sibling REJECTED on measurement; L-3 closed by data
- [x] DH1 RED: the S159/DH1 describe (5 legs) — RED 3/3 on the designed markers (the 2 acceptance guards passed through by design)
- [x] DH1 GREEN: the validateImportEnvelope optional-FK rejection block + the finish() comment re-anchor
- [x] DH2: the S159/DH2 describe (3 legs) — green-on-arrival by design (the guard), the loud-extraction property demonstrated LIVE (the multi-line questions chain tripped the extractor mid-cycle; the parser taught chains)
- [x] DH2 GREEN: census-only — the values all agreed; no DH2b needed
- [x] DH3: the dead-ternary collapse + the stale-header fix
- [x] Interim gates: lint ✓ · tsc ✓ · the full unit run 1619/1619 (the arithmetic held exactly)
- [x] The dev-daemon re-confirmation on the remediated tree: preflight GREEN · drawer GREEN (the 79th) · parity MATCH
- [x] The live /export page probe GREEN + the live DH1 import probe GREEN (the named 400 + the clean SetNull import)
- [x] build ✓ (7 warnings — the documented set; standalone 144M) + the 5-chunk cold cert — the flake ledger in the worklog
- [x] Evidence frames: docs/screenshots/159-clone-*.png (the capture-s159 script, self-verifying ok:true)
- [x] The doc chain: README badge/census + the Session-159 row · AGENTS census + the S159 lessons block · CLAUDE counts · PAD v1.3.67 · the SKILL census · the vitest header · docs/session_191.md · the worklog Session-170 entry · this plan's §7
- [x] The `.env`/`.env.example` contract re-verified — byte-identical (diff clean)
- [ ] Commit (Conventional Commit on main) + push via the SSH wrapper (`--remote` per the S157/S158 precedent)

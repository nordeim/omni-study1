# Session 191 — the S159 cycle (Batch DH)

The workspace was COLD (a fresh `git clone` at `6cf1167` on `main` — the
Batch DG fix `3103b8b` + the operator's session_190 transcript commit;
the environment rebuilt from scratch: `cp .env.example .env`
[byte-identical at the documented dev posture —
`DATABASE_URL="file:../db/custom.db"`], `bun install` [510 packages],
`bun run db:push && bun run db:seed` [the repo-root `db/custom.db`,
389 KB], `bunx playwright install chromium`, bun 1.3.14).

Cold baseline (before any work): lint ✓ · tsc ✓ · the full Vitest run
**1611/1611 (48 files — the documented S158 final state exactly)** · the
dev daemon preflight GREEN (hydrated, navigation-stable) · the drawer
check GREEN (**the 78th consecutive no-Tailwind-v4-mobile-nav-bug
confirmation** — backdrop oklab(0 0 0 / 0.2) + blur(4px); 288px white
panels; 20 links; no footer; Escape-close superset) · the desktop chrome
probe **MATCH** (all five formal checks, live reference login —
sidebar-outer 260 / 20 links / first-links / mainX 260 / mainWidth
1180, the S142 outer-footprint probe). Baseline noise: none. The
config posture re-validated for the operator's standing ask: the
vitest include matches `src/**/*.test.ts` + `tests/**/*.test.ts` only;
the playwright testDir is `tests/e2e` with the production-build webServer
on `db/e2e.db`; tsconfig excludes `skills`; eslint ignores `skills` —
the repo-included `skills/` folder is excluded from code checking,
testing, and compilation on every axis.

The audits (Mode-C; every L+ finding re-verified by direct read by the
orchestrator):

- **Audit A — the Batch DG recent-changes axis** (the `3103b8b` diff;
  `6cf1167` is docs-only): **0C / 0H / 0M / 0L / 0I — clean.** All three
  DG claims verified DELIVERED at the source anchors: DG1's paged reader
  contract (`ExportCollectionPage = { rows, hasMore }` + the driver
  loop + `pageAfter` with `EXPORT_BATCH_ROWS = 5000` + the BATCH+1
  page + the unique-id cursor + `skip: 1` + all 20 readers paged) at
  data-export.ts:250–259/304–359 + export-build.ts:72–126; DG2's
  ownership-scoped update writes at route.ts:642; DG3's both-branches
  file-input reset at export-panel.tsx:242+254 — and the doc census
  chain machine-verified (README badge 2227 ✓ · AGENTS 1611 ✓ · CLAUDE
  1611 ✓ · PAD v1.3.66 ✓ · the SKILL census ✓ · the vitest header
  48/1611 ✓ · the cert runner Expected 616 ✓) — zero stale count sites.

- **Audit B — the import create-path family** (the S158 close's
  recorded rotation, swept as a family). The axis read dispatched to a
  read-only subagent against the web-application skill's
  §3/§4/§6/§7/§16/§17 rubric: the route's full 721 lines + the
  data-import seam + both unit files + the e2e round-trip spec + the
  panel + the schema + the measurement scripts.

  **Verdict: 0C / 0H / 0M / 3L / 6I.** The family remains coherent,
  well-pinned, and secure (the gate ordering auth → limiter →
  content-type → byte cap → parse → validate → row cap; the DG2 scoped
  updates; the write-only tx with the explicit 60 s timeout; the
  collision pre-flight; the secrets strip; the budget arithmetic
  machine-pinned; the DG3 fix complete — exactly one file input in the
  panel, both branches reset). The findings:

  - **L-1 (L — Verified by direct read):** the optional-FK non-string
    divergence — the seam's reference parser nulls a non-string
    optional FK (`String(value)` miss → the SetNull branch) while the
    production route's twin guard SKIPS it and the raw number rides to
    Prisma → the GENERIC "fields do not match" 400 — the CJ4
    degradation class on the optional boundary; a hand-crafted
    `subjectId: 42` imports clean through the unit-pinned parser and
    400s generically through production (the CH4 doctrine: the pins
    describe unreachable production behavior).
  - **L-2 (L — Verified by direct read):** the import↔interactive
    length-cap parity is machine-enforced at the KEY level only —
    `IMPORT_FIELD_LENGTHS` hand-mirrors 34 atom VALUES from five source
    files (validation.ts's boundedTitle/jsonArray atoms + per-schema
    `.max()` literals, the folders route-local atom, ai.ts's
    PERSISTED_CONTENT_MAX, http.ts's UPLOAD_MIME_MAX_CHARS); a future
    relaxation silently makes the import stricter than the app (the
    S137/CL1 brick-the-restore class).
  - **L-3 (L — Verified by direct read):** the create-side measurement
    gate unanswered — the S154 probe times only the update loop + the
    full-row probe; the createMany loop, the mixed worst-case tx, and
    the pre-tx CPU were never measured, yet the raw-SQL create
    sibling's deferral is gated on profiling.
  - I-1..I-6 informational: the dead ternary (route.ts:340), the
    double per-create-row copy, the elision full-row reads, the
    documented post-parse row cap, the app-wide PAD §6.2 envelope
    shape (the code-wins rule), the stale "Deleted after" header on
    the S154 probe.

  **Point 8 (the round-trip compatibility verdict): COMPATIBLE,
  pinned** — the DG1 pagination changed the export's internal read
  strategy only; `DATA_EXPORT_VERSION` stays 1, the wire is
  byte-identical (the unit oracle + the multi-batch legs), and the full
  round-trip is e2e-witnessed against the post-DG1 build.

**The DH0 measurement ran FIRST (the S154/S157/S158 measurement-first
doctrine) — and CLOSED the gate with a healthy negative result.** The
probe (`scripts/measure-import-create-s159.mjs`, committed — riding the
REAL `validateImportEnvelope`/`sanitizeImportRow` stages and the route's
exact tx shapes against a throwaway `db/measure-s159.db`):

- **The CREATE loop** (the route's exact chunk shape, cold): 1k = 113
  ms · 10k = 596 ms · 25k = 1 166 ms · 50k = 2 381 ms · 100k = 4 621
  ms — **0.046 ms/row at the cap** (~7× cheaper than the measured
  0.32 ms/row update loop; one round trip per 500 rows).
- **The MIXED tx** (the true worst legal shape at the 100k row cap —
  50k sequential per-row updates + 50k chunked creates in ONE
  `$transaction({ timeout: 60_000, maxWait: 5_000 })`): 10k = 2 074 ms
  · 50k = 9 329 ms · 100k = **19 557 ms — 3.07× headroom** on the 60 s
  budget (update-dominated by construction).
- **The PRE-TX CPU at the cap** (the REAL parse → validate →
  per-row-sanitize pass): parse 179 ms · validate 1 ms · sanitize
  567 ms = **747 ms**.
- **The end-to-end worst case**: 20 304 ms of the client's 120 s
  `AbortSignal.timeout` — **5.91× headroom**.

**The verdict: the raw-SQL create-side sibling's deferral STAYS CLOSED,
rejected on measurement** (the gate's own condition decisively unmet);
the update-side raw-SQL bulk upsert gate stays closed harder; L-3 is
closed by data. The cycle core therefore rode the audit's L-1/L-2.

The plan (`docs/remediation-plan-session159.md`) written BEFORE any
source change and validated against the codebase (the FK-map spec
shape, the route's verbatim error consumption, the five parity-source
files, the dead-ternary line).

**The RED inventory (as it ran): the unit REDs 3/3 on their designed
markers** (the DH1 rejection legs — the number shape, the shape family,
the delegation leg; the null/undefined acceptance guards passed
through, proving the SetNull semantics and the untouched-case contract
survive). The DH2 census legs ran green-on-arrival BY DESIGN (the
guard, not a bug-fix) — with the loud-extraction property demonstrated
LIVE: the multi-line `practiceTestSchema.questions` chain tripped the
extractor mid-cycle (the census failed loudly, never silently) before
the parser was taught chains; the never-call TS footgun found on the
way (a const-inferred `die` arrow does not narrow; the
function-declaration form does).

**The S159 fixes:**

- **DH1 — the optional-FK non-string rejection (the L-1 close, the
  CJ4 mirror).** `validateImportEnvelope` rejects an optional-FK value
  that is neither `undefined` (the update branch's untouched case) nor
  `null` (the SetNull semantics) nor a string, with the named message
  (`Collection "X" row "Y" carries a <field> that is not a string id —
  an optional reference can never be a non-string value.`). Production
  answers the named 400 at the validation boundary (the route already
  consumed `envelopeCheck.error` verbatim); the seam's nulling loop
  keeps its `String()` coercion as belt-and-suspenders typing with the
  comment naming the guarantee. **Verified live on the remediated
  tree: the named 400 on the `subjectId: 42` shape (previously
  Prisma's generic fallback), and the dangling-STRING twin still
  imports clean end-to-end (200, created: 1 — the SetNull path).**

- **DH2 — the length-cap VALUE-parity census (the L-2 close, the
  mirror made self-guarding).** Three census legs (the
  script-conventions source-census precedent): the completeness leg
  (every `IMPORT_FIELD_LENGTHS` key mapped to exactly one parity
  source — a new registry key without a mapping fails loudly), the
  validation.ts parity leg (31 atoms regex-extracted from
  brace-counted schema blocks, multi-line chains included, the shared
  boundedTitle/jsonArray atoms), and the other-source parity leg (the
  folders route-local atom, ai.ts's `PERSISTED_CONTENT_MAX`, http.ts's
  `UPLOAD_MIME_MAX_CHARS`). A future relaxation in ANY source trips
  the census before the import bricks a restore the app itself minted.

- **DH3 — the riders (I-1 + I-6, behavior-preserving).** The dead
  ternary in the import route's referenced-ids loop collapsed (both
  branches yielded `target`; the tautology read as if the folders
  self-form needed a redirect); the S154 measurement probe's stale
  "Deleted after the measurement is recorded" header reconciled to the
  honest retention record.

- **The rejections (recorded in the plan §6):** I-2 (the double
  per-create-row copy) REJECTED AS MEASUREMENT-COVERED (the DH0
  numbers); I-3 (the elision full-row reads) REJECTED AS A DOCUMENTED
  MEASURED TRADE-OFF; the 501-row chunk-boundary e2e leg DEFERRED AS
  SOUND-BY-CONSTRUCTION (the topo sort is unit-pinned at 250k rows;
  slicing preserves order).

**The remediated-tree re-confirmation:** the daemon restart applied the
documented S9/S31 stale-Turbopack remedy preemptively (kill, `rm -rf
.next/dev`, restart) → preflight GREEN · the drawer check GREEN (**the
79th consecutive**) · the desktop parity probe **MATCH** (all five
checks, live reference login) · the live /export page probe GREEN (20
chips; the grid counts MATCH the API envelope's own counts;
X-Export-Bytes 19832 exact; the secret guard holds).

**Gates.** lint ✓ · tsc ✓ · unit **1619/1619** (48 files, +8 exactly as
designed: the 5 DH1 legs + the 3 DH2 census legs — the plan's
arithmetic held exactly) · build ✓ (exit 0; **7 warnings — the
documented set, nothing new**; the standalone **144M**) · the 5-chunk
cold cert: chunk 1 **151/152** (one machine-load flake —
parity-session8's S125/BZ3 "Tab closed the menu" leg, the documented
S139/S157 class; the standalone-cold re-run **68/68 first-pass
clean**) · chunk 2 **185/189 with the four UTC-midnight day-boundary
legs** (the run crossed 00:00 UTC — the documented S45 class, the
chunk's seed aged one day mid-run; the full-chunk standalone-cold
re-run **189/189 first-pass clean**) · chunk 3 **90/91** (one
machine-load flake — resilience's files-upload "unrelated folder
succeeds" leg; the settled standalone-cold re-run **41/41 first-pass
clean**, the S158 precedent's exact numbers) · chunk 4 **95/95** ·
chunk 5 **89/89** — the cert tally **616/616 with the three flake
classes each adjudicated standalone-clean** · **census 2235 green**
(was 2227; the final full unit re-run post-doc-edits 1619/1619).

**Evidence.** The `docs/screenshots/159-clone-*.png` frames (the
standing desktop + the mobile drawer [the 79th drawer-GREEN companion]
+ the cycle's surface: the /export page whose Restore card the cycle
hardened — 20 chips, machine-counted by the capture script),
self-verifying (ok: true; dimensions machine-checked; md5s distinct) +
the committed DH0 measurement probe (its budget numbers ARE the
L-3 close) + the live DH1 probe record (the named 400 + the clean
SetNull import).

**Docs.** README badge/census (2227 → 2235) + the unit-count prose
sites + the Session-159 row; AGENTS census (1611 → 1619) + the import
row extension (DH0/DH1/DH2) + the S159 lessons block (three lessons);
CLAUDE counts; PAD v1.3.67 (the revision block); the SKILL census (all
four sites); the vitest header re-anchor (+8); `docs/session_191.md`
(this log); the worklog Session-170 entry; the plan §7 as-executed
close; the `.env.example` contract re-verified (no env-var reads
changed this cycle — .env and .env.example byte-identical at the
documented dev posture).

**Next cycle:** the rotation continues — the recorded deferrals: the
A-M3 stage-2 (re-measure only if the hardware or the row cap changes);
the update-side raw-SQL bulk upsert (the gate now closed HARDER on the
DH0 numbers — the worst mixed shape measured at 3.07× headroom); the
I-2/I-3 riders (rejected as measurement-covered / documented
trade-off, the options recorded in the plan §6); the I-4
parse-amplification posture (documented, S144/CS5).

# Session 189 — the S158 cycle (Batch DG)

The workspace was COLD (a fresh `git clone` at `69cebc0` on `main` — the
Batch DF fix `0c6fa3d` + the operator's session_188 transcript commit;
the environment rebuilt from scratch: `cp .env.example .env`
[byte-identical at the documented dev posture], `bun install` [510
packages], `bun run db:push && bun run db:seed` [the repo-root
`db/custom.db`], `bunx playwright install chromium`, bun 1.3.14).

Cold baseline (before any work): lint ✓ · tsc ✓ · the full Vitest run
**1604/1604 (48 files — the documented S157 final state exactly)** · the
dev daemon preflight GREEN (hydrated, navigation-stable) · the drawer
check GREEN (**the 76th consecutive no-Tailwind-v4-mobile-nav-bug
confirmation** — backdrop oklab(0 0 0 / 0.2) + blur(4px); 288px white
panels; 20 links; no footer; Escape-close superset) · the desktop chrome
probe **MATCH** (all five formal checks, live reference login —
sidebar-outer 260 / 20 links / first-links / mainX 260 / mainWidth
1180, the S142 outer-footprint probe). Baseline noise: none.

The audits (Mode-C; every L+ finding re-verified by direct read by the
orchestrator):

- **Audit A — the Batch DF recent-changes axis** (the `0c6fa3d` diff;
  `69cebc0` is docs-only): **0C / 0H / 0M / 0L / 0I — clean.** All six
  DF claims verified DELIVERED at the source level (the structured
  counts return + the required-arg error payload + the page's
  count-family retirement + the measured-record header + the S157/DF1
  describe + the DB2 negative censuses) — the doc census chain
  machine-verified (README badge 2220 ✓ · AGENTS 1604 ✓ · CLAUDE 1604 ✓
  · PAD v1.3.65 ✓ · the SKILL census ✓ · the vitest header 48/1604 ✓ ·
  the cert runner Expected 616 ✓) — zero stale count sites.

- **Audit B — the export/import data-portability family** (the S157
  close's recorded rotation). The axis read dispatched to a read-only
  subagent against the web-application skill's §3/§4/§6/§16/§17 rubric:
  the driver + the READERS wiring + the download route + the page + the
  client panel + the http.ts seams + the import counterpart + every
  unit/e2e/census pin + the schema's keyset viability.

  **Verdict: 0C / 0H / 0M / 2L / 5I.** The family coherent, well-pinned,
  and secure (auth gates precede limiters on all three doors, the triple
  secret guard, the budget ordering, the byte-based accounting, the
  round-trip reconciliation — all re-verified clean). The findings:
  **L-1 (L)** the Restore card's file input resets `e.target.value` on
  the OVERSIZED branch only — after a failed import, re-picking the same
  (edited) file fires no change event and the Import button re-sends the
  ORIGINAL File snapshot; **L-2 (L)** the import tx's update writes are
  unscoped (`where: { id }`) and the payload re-attaches `userId` — the
  documented read-hoist TOCTOU's under-documented ownership-flip
  sub-variant (importer-owned id → deleted → re-created by another
  account inside the widened probe→tx window → overwritten AND flipped);
  I-1..I-5 informational (the malformed-JSON copy, the documented
  S144/CS5 parse amplification, the page-per-view cost, the
  retain-then-serve stream, the MB/MiB labels).

  The three recorded candidates adjudicated: the single-collection
  cursor pagination → **measurement-gated, run FIRST**; F7's cosmetic
  edges (the UTC stamp, the 429-through-the-anchor) → **REJECTED AS
  NOT-A-GAP** (the polish options recorded); I-1's TOCTOU note → the
  cheap hardening IS behavior-compatible (DG2).

**The DG0 measurement ran FIRST (the S154/S157 measurement-first
doctrine) — and JUSTIFIED the deferred design.** The heap probe
(`scripts/measure-export-heap-s158.mjs`, committed — three synthetic
50k-row users against a throwaway `db/measure-s158.db`, ~1.2 KiB payload
rows, gc'd baselines + a 25 ms heap/rss sampler around the REAL
`renderExportEnvelope`, isolated per shape via the SHAPES env after a
diagnosed GC-suppression artifact [the first runs' contaminated
baselines let mid-render GC suppress the dominant-notes peak to 1.48×;
the isolated-process runs are the honest shape]):

- **P1 SPREAD** (10 collections × 5k rows): envelope 51.9 MiB · peak
  heap delta 78.4 MiB (**1.51×**) · 748 ms.
- **P2 DOMINANT-notes** (50k rows, one collection), isolated: envelope
  75.8 MiB · peak 230.3 MiB (**3.04×**) · 907 ms.
- **P3 DOMINANT-chat** (50k rows, one collection), isolated: envelope
  65.2 MiB · peak 203.4 MiB (**3.12×**) · 848 ms.

The verdict: a dominant collection peaks at ~3× the envelope's own bytes
(the row-object term ≈ 2× the fragment term); at the 256 MiB ceiling a
dominant account peaks at ~780 MiB heap — an OOM class on small
containers. The S157 close's "its own cycle" condition was MET — the
pagination became the cycle core. (The "census-breaking" premise itself
was falsified: the oracle, the counts record, and the throw were all
pagination-invariant; only the fakes + the READERS census needed
re-anchoring.)

The plan (`docs/remediation-plan-session158.md`) written BEFORE any
source change and validated against the codebase (the chunk map, the
P2025 leg, the delegate typing, the DB2/READERS census anchors).

**The RED inventory (as it ran): the unit REDs 13/13** on their designed
markers (the contract-change surface: the 3 new DG1 legs [the
multi-batch byte-identity weld, the paging contract, the defensive
terminal] + the re-anchored driver legs [the two oracles, the counts,
the bytes, the weld — the fakes moved to the paged contract FIRST,
preserving every legacy assertion] + the census legs [the CJ2 READERS
re-anchor + the 4 new DG censuses]) — not file-load errors.

**The S158 fixes:**

- **DG1 — the keyset-batched export reads (the cycle core).** The reader
  contract becomes paged: `ExportCollectionReader = (collection, after?)
  => Promise<{ rows, hasMore }>` — `after` is the previous page's last
  row (the keyset anchor; the raw row object). The driver loops batches:
  the `"name":[` scaffold rides the first page (retention-conditional —
  the retain-while-under contract preserved), the per-page
  `rowFragments(rows, first)` generator gives each non-first page's
  first row its own leading `,` (the separator-across-batches
  correctness), `counts[collection] += page.rows.length` page-sums, the
  defensive empty-page terminal breaks even under a misbehaving
  empty+hasMore reader, and the retention/ceiling logic is UNTOUCHED
  (per-piece, mid-collection capable; the throw post-loop with the
  complete record). The server wiring rides `pageAfter`
  (export-build.ts): `EXPORT_BATCH_ROWS = 5000` (the IMPORT_CREATE_CHUNK
  precedent; ~15 MiB of row objects per batch), the BATCH+1
  one-extra-row page (no empty roundtrip), the unique-id cursor +
  `skip: 1` on the `EXPORT_ORDER` (createdAt asc, id asc) total order —
  the documented Prisma keyset idiom (the compound-array-cursor form is
  unnecessary when the cursor field is itself unique — the generated
  `WhereUniqueInput` accepts only the extended unique shape, and the
  orderBy carries the keyset semantics); all 20 readers paged, cards
  deck-scoped as ever. **The proof of fix (the probe re-run): dom-notes
  3.04× → 1.28×, dom-chat 3.12× → 1.31× — both BELOW the spread shape's
  own 1.51×; the keyset-verify pass proves the real-Prisma continuation
  lossless at 50k rows per shape (per-collection counts === the counts
  record, ids unique, (createdAt, id) non-decreasing — 150k rows
  verified in total).** The wire is byte-identical (the unit oracle
  across page boundaries + the s21 raw-body pin re-certified).

- **DG2 — the ownership-scoped import updates (the L-2 close).** The tx
  update loop: `where: collection === "cards" ? { id } : { id, userId:
  user.id }` — Prisma's extended where-unique. Behavior-compatible on
  every current path (a vanished row — the CQ4 class — throws P2025 →
  the existing named-409 leg; the ownership-flip sub-variant now lands
  in the same 409 family instead of overwriting and flipping
  ownership). Cards stay unscoped (no userId column; Prisma's
  update-where cannot express the deck relation — the residual named at
  the site: a one-row content re-parent with no ownership column to
  flip). The `ImportDelegateOps.update` where type grows `userId?`.

- **DG3 — the Restore-card file-input reset (the L-1 close).** The
  success branch gains `e.target.value = ""` (the oversized branch
  already had it) — every pick of the same path re-fires change with the
  FRESH File; the stale-snapshot class is gone.

- **The riders:** F7's cosmetic edges REJECTED AS NOT-A-GAP (recorded in
  the plan §6 + the PAD block with the polish options); the doc chain
  (below).

**The live page probe** (`scripts/probe-export-page-s157.mjs` — the dev
tree on the remediated code, the demo session): the /export page renders
**20 chips**; the grid counts **MATCH the API envelope's own counts**;
the size signal renders (19 KB); **X-Export-Bytes 19832 === the actual
body bytes**; the secret guard holds — the page renders byte-identically
through the pagination.

**Remediated-tree re-confirmation**: the daemon restart hit the
documented S9/S31 stale-Turbopack reload-loop ONCE (the preflight's own
remedy applied: kill, `rm -rf .next/dev`, restart) → preflight GREEN ·
the drawer check GREEN (**the 77th consecutive**) · the desktop parity
probe **MATCH** (all five checks, live reference login).

**Gates.** lint ✓ · tsc ✓ · unit **1611/1611** (48 files, +7 exactly as
enumerated — the plan draft's "+6" was an arithmetic slip, corrected in
the plan §6 honestly) · build ✓ (exit 0; **7 warnings — the documented
set, nothing new**; the standalone **144M**) · the targeted e2e: s21 +
s23 **21/21 first-pass** cold (the direct consumers — the export wire +
the import update path) · the 5-chunk cold cert: chunk 1 **152/152** ·
chunk 2 **189/189** · chunk 3 **90/91 with one machine-load flake**
(resilience's S120/BU1 Rename-dialog prefill leg — untouched by this
cycle's diff; **standalone-cold re-run 41/41 first-pass, EXIT:0** — the
S139 machine-load class, the S157 BZ3 precedent) · chunk 4 **95/95** ·
chunk 5 **89/89** — the cert tally **616/616** · **census 2227 green**
(was 2220; the final full unit re-run post-doc-edits 1611/1611).

**Evidence.** The `docs/screenshots/158-clone-*.png` frames (the
standing desktop + mobile drawer [the 77th drawer-GREEN companion] +
the cycle's surface: the remediated /export page — 20 chips,
machine-counted by the capture script), self-verifying (ok:true;
dimensions machine-checked) + the committed heap/keyset probe (its
before/after record + the keyset-verify pass IS the DG1 proof).

**Docs.** README badge/census (2220 → 2227) + the unit-count prose
sites + the data-portability row extension + the Session-158 row; AGENTS
census (1604 → 1611) + the export row re-anchor (the keyset-paged
wording) + the import row extension (DG2/DG3) + the S158 lessons block
(three lessons: the measurement-can-falsify-the-cost-claim lesson, the
contract-RED-surface lesson, the fourth-test-tier lesson); CLAUDE
counts; PAD v1.3.66 (the revision block); the SKILL census (all four
sites); the vitest header re-anchor (+7 with the probe-as-evidence
note); `docs/session_189.md` (this log); the worklog Session-169 entry;
the plan §7 as-executed close; the `.env.example` contract re-verified
(no env-var reads changed this cycle — .env and .env.example
byte-identical at the documented dev posture).

**Next cycle:** the rotation continues — the recorded deferrals: F7's
polish options (the client `?stamp=`, the fetch→blob unification —
rejected as gaps, recorded), the raw-SQL bulk upsert (IF profiling ever
presses the 60 s budget), the A-M3 stage-2 (re-measure only if the
hardware or the row cap changes), the I-2 parse-amplification posture
(documented), the import's create-side raw-SQL sibling (the same
measurement gate).

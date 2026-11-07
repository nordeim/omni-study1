# Remediation Plan — Session 156 (Cycle 106, Batch DE)

> Status: PLANNED (pre-change record — the immutable plan; the as-executed
> close lives in §6). Written before any source change, per the standing
> doctrine ("write the cycle plan into docs/remediation-plan-sessionN.md
> BEFORE any source change").
>
> Operator directive: refresh the workspace, re-read the doc chain
> (AGENTS/CLAUDE/README/PAD/SKILL + session_183/184 +
> remediation-plan-session155 + worklog), validate against the codebase,
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

**Workspace (warm — the previous session's tree, `git pull` fast-forward
`a1aa229..68da300` bringing only `docs/session_184.md`; the environment
intact: `.env` at the documented dev posture [byte-identical to
`.env.example`], `db/` at the repo root with `custom.db` + the aged
`e2e.db`, node_modules, the Playwright chromium cache, bun 1.3.14).**

**Cold baseline (before any work): lint ✓ · tsc ✓ · the full Vitest run
1594/1594 (48 files — the documented S155 final state exactly) · the dev
daemon preflight GREEN (hydrated, navigation-stable) · the drawer check
GREEN (the 72nd consecutive no-Tailwind-v4-mobile-nav-bug confirmation —
backdrop oklab(0 0 0 / 0.2) + blur(4px); 288px white panels; 20 links; no
footer; Escape-close superset) · the desktop chrome probe MATCH (all five
formal checks, live reference login — sidebar 260/20 links/first-links/
mainX 260/mainWidth 1180).** Baseline noise: none.

**The fix scope (the S155 close's named candidate, adjudicated).** The
S155 close names the **export streaming** as the import family's recorded
candidate ("the I-A peak-memory O(account) residual — needs a streaming
serialization design, its own cycle"). Adjudication (the operator's
standing best-judgement instruction): this IS that cycle — the I-A
residual is now ten cycles old (recorded at S148/CW2 as "no action short
of streaming"), the audit below quantifies it precisely (peak ≈ 3–4× the
serialized body, with the 256 MiB gate firing only AFTER the peak), and
the fragment-serialization design is fully worked out against every pin
in the family. The raw-SQL bulk upsert stays deferred (no profiling
pressure); the A-M3 stage-2 stays deferred ON MEASUREMENT (unchanged).

## §1 The audits (Mode-C; every L+ finding re-verified by direct read by the orchestrator)

### Audit A — the Batch DD recent-changes axis (the `a1aa229` diff)

**0C / 0H / 0M / 0L / 0I — clean.** All four DD claims verified DELIVERED
at the source level: DD1's direct `fileURLToPath(import.meta.url)` call
inside candidateRoots (db-path.ts:144 — the URIError caught by the
existing try/catch, the S155/DD1 + WHY-THE-DIRECT-CALL comment blocks) +
the census pair at script-conventions.test.ts:2400-2420 (the positive:
import + inline form + marker; the negative: the raw pathname form gone);
DD2a's honest seed early-return language (DEPLOYMENT.md:84) + DD2b's
dropped smoke-test.sh residue; DD3's AGENTS.md:82 cold-reset caveat; DD4's
`rm -f db/e2e.db*` glob (e2e-cold-reset.sh:35) + the .gitignore
`db/*.db-wal`/`db/*.db-shm` patterns. The doc census machine-verified:
README badge 2210 ✓ · AGENTS 1594 ✓ · CLAUDE 1594 ✓ · PAD v1.3.63 ✓ · the
SKILL census (all three sites) ✓ · the vitest header 48/1594 ✓ · the cert
runner Expected 616 ✓ — zero stale sites.

### Audit B — the export / data-portability family (the rotation axis, swept as a family)

The axis read dispatched to a read-only subagent against the
web-application skill's §3/§4/§6/§16/§17 rubric: the shared assembly seam
(export-build.ts) + the pure seam (data-export.ts) + the download route +
the /export page + the client panel + the http.ts error/headers seams +
the import counterpart's round-trip contract + every unit/e2e/census pin
+ a whole-src consumer grep. **Verdict: 0C / 0H / 1M / 3L / 4I.** The
family is coherent, well-pinned, and secure (authz on both consumers, the
triple secret guard, the budget ordering, the byte-based accounting
end-to-end, the import round-trip reconciliation — all verified clean).
The findings:

- **F1 (M — the cycle core, the recorded I-A residual confirmed and
  quantified):** the peak memory is O(account) at **≈ 3–4× the serialized
  body size**, and the 256 MiB ceiling gate fires only AFTER the peak.
  The simultaneously-live allocations at the `exportByteSize` line
  (export-build.ts:123-127, re-verified by direct read): (1) all 20
  findMany result sets — held by the destructured locals until the
  function returns (the dominant term; FileItem's base64 `data` column
  rides every read, no take, no select); (2) the envelope's normalized
  copy (serializeExportRow re-shells every row + fresh ISO strings for
  every Date field); (3) the full JSON string (1×B Latin-1, up to 2×B
  two-byte when any code unit > U+00FF — the seed's own — / · / 👋 class);
  (4) the exportByteSize Uint8Array (a full 1×B encode — F2). At the cap
  that is ~0.75–1 GB on the single worker per export GET; a multi-GB
  account is FULLY materialized before being refused. The serve-time
  floor adds undici's eager body encode (another 1×B). **The fix is §2
  (DE1).**
- **F2 (L — Verified):** `exportByteSize` allocates a full body-sized
  Uint8Array just to read `.length` (data-export.ts:136-138); the
  allocation-free `Buffer.byteLength` is barred by the module's own
  browser-safety rule, but the FUNCTION has no browser consumer (the
  panel imports only exportOverCeiling/formatExportBytes/
  EXPORT_MAX_BYTES — grep-verified). The CQ2 census
  (script-conventions.test.ts:1363-1365) pins the allocating form AND the
  Buffer ban. **Rides §2/§3 (the driver's counting makes the question
  moot: every encode is retained payload, never length-only).**
- **F3 (L — Verified):** the 20-read snapshot is not transactional (a
  bare Promise.all of independent implicit read transactions) —
  cross-collection read-skew is possible (the hard edge: a card read
  after a post-decks-read deck creation exports a cards.deckId with no
  deck — a fresh-account restore answers the actionable required-FK 400;
  the same-account restore tolerates it — the S117 e2e-proven class);
  plus the page-internal skew (the 20 count() grid queries run before the
  envelope's reads). **Deferred with a recorded reason (§5): the
  $transaction snapshot changes the lock behavior (a read tx held open
  across the serialization CPU work, against the import route's 60 s
  write-tx family) — its own measurement cycle; the skew class is
  documented + honest-failing today. NOTE: DE1's sequential reads STRETCH
  the window (ms → seconds for large accounts) — the extension is
  documented honestly in the seam header (§2).**
- **F4 (L — Verified):** the s21 size pin asserts a re-serialization
  identity (`Buffer.byteLength(JSON.stringify(body))`), not the raw
  served bytes — the comment overstates it ("pinned here against the
  actual body"), and the identity silently assumes V8-stable
  re-serialization. **The fix is §4 (DE3) — the raw-body pin.**
- **F5 (I):** the /export page's 20 count() queries duplicate the
  envelope's own counts (the grid could ride `counts` from the seam in
  the under-ceiling path). Deferred (§5) — the page's grid works today;
  the leaner page consumption + the grid-from-envelope join the phase-2
  residual.
- **F6 (I):** the census inventory for any streaming redesign — three
  pins hard-code the materializing shape (`return { json, bytes }`,
  `const bytes = exportByteSize(json)`, the exactly-20 findMany census +
  the shorthand-key census) and must be updated deliberately in the same
  commit. **Rides §2 + §5 (the pin inventory).**
- **F7 (I):** minor edges — the UTC filename stamp, the 429-through-the-
  download-anchor UX (a rate-limited download saves the JSON error body
  as a file), the "byte-identical" doc nuance on RenderedExport.json.
  Deferred (cosmetic, §5).
- **F8 (I):** the `DataExportEnvelope` type is single-use (annotates
  buildDataExport's return). No action — it documents the wire shape.

## §2 DE1 — the streaming fragment serialization (F1, the cycle core)

**The architecture (pure driver + thin server wiring — the S124/BY2
explicit-args doctrine applied to the assembly itself).**

1. **The pure driver** — `buildExportFragments(user, readCollection,
   exportedAt)` in `src/lib/data-export.ts` (the pure seam — browser-safe:
   TextEncoder, generators, async; NO Buffer, NO db, zero imports — the
   module's existing import-free posture preserved). It takes the
   collection reader AS A PARAMETER (the explicit-args doctrine), reads
   the 20 collections SEQUENTIALLY in EXPORT_COLLECTIONS order (one
   collection's rows in memory at a time — the I-A fix's mechanism), and
   serializes each collection's rows PER-ROW through the existing
   `serializeExportRow` (the normalizer stays THE single row authority),
   emitting scaffold pieces:

   - the head — `{"format":…,"version":…,"exportedAt":…,"user":…,
     "counts":{…},"data":{` (built AFTER the reads: counts are complete
     then; the retain-then-serve design makes the emission order free —
     the response is assembled from retained fragments, never streamed
     live out of the generator);
   - per collection — `"name":[` + per-row `JSON.stringify(
     serializeExportRow(row))` joined by `,` + `]` (per-ROW fragments, so
     the counting can pass the ceiling MID-COLLECTION);
   - the separators + the `}}` tail.

   **Byte-identity (the load-bearing property):** the concatenation of
   the fragments is byte-identical to `JSON.stringify(buildDataExport(
   user, rows, exportedAt))` — JSON.stringify is compositional over plain
   objects/arrays/primitives (no toJSON, no undefined, no cycles: Prisma
   rows are plain values; serializeExportRow converts Dates first), and
   the scaffold reproduces buildDataExport's literal insertion order
   (format → version → exportedAt → user → counts → data; collections in
   EXPORT_COLLECTIONS order; counts keyed in the same loop order). The
   property is PINNED by the oracle legs (§5) — buildDataExport stays in
   the tree as the executable reference the driver is welded to (NOT dead
   code: it owns the envelope's identity, carries 20+ unit pins, and is
   the oracle the streaming form must never drift from).

2. **The counting + the gate + the bounded refusal.** The driver encodes
   each piece (TextEncoder — the encoded bytes ARE the retained payload,
   never a length-only allocation — F2 closed structurally), accumulates
   the running byte total, and **retains fragments only while the running
   total sits at-or-under EXPORT_MAX_BYTES** (the retain-while-under
   pass): a multi-GB account is refused at ≤ ceiling + head + one piece
   instead of after full materialization. The exact total is preserved
   (once over, the pass keeps COUNTING without retaining) so
   `ExportTooLargeError.bytes` stays the honest exact size the page
   renders. The gate itself is unchanged — `exportOverCeiling(bytes)` →
   throw — at the end, on the exact total (the CL2 at-cap boundary
   doctrine: at-cap is served, cap+1 refuses).

3. **The error class moves home.** `ExportTooLargeError` moves from
   `src/lib/server/http.ts` to `src/lib/data-export.ts` (the ceiling
   family — EXPORT_MAX_BYTES + exportOverCeiling + the throw — reunited
   in the pure seam, so the DRIVER can throw it without importing
   server/ code; data-export.ts stays import-free → no cycle possible).
   http.ts imports + re-exports it (every existing import site — the
   page, toErrorResponse's instanceof — stays green unchanged).

4. **The server wiring** — `src/lib/server/export-build.ts` rewrites to
   the thin form: a `READERS: Record<ExportCollection, (userId: string)
   => Promise<ExportRow[]>>` map carrying the 20 userId-scoped
   chronological findMany reads (cards deck-scoped — the S140 order
   contract verbatim; the Record key type makes an omitted collection a
   COMPILE error, stronger than the old destructuring literal), and
   `renderExportEnvelope(user)` delegates: `buildExportFragments(user,
   (collection) => READERS[collection](user.id), new Date())`. The
   name/signature stay (the route + page + their censuses ride
   unchanged); the return shape becomes `{ fragments: Uint8Array[];
   bytes: number }` (RenderedExport moves to data-export.ts beside the
   driver; export-build re-exports for continuity).

5. **The route streams.** `GET /api/export/data` builds a
   `ReadableStream<Uint8Array>` that enqueues the retained fragments in
   order and answers `new NextResponse(stream, …)` — the body never
   joins into a second full-body string (serve-time peak ≈ 1×B + chunk
   transients, vs today's 2–3×B). No explicit Content-Length (chunked
   transfer — NOT pinned anywhere; the e2e pins content-type/
   content-disposition/nosniff/cache-control/X-Export-Bytes, all of
   which ride unchanged); `X-Export-Bytes` stays `String(bytes)` — the
   exact byte count of the fragments actually served (the header
   contract strengthened, not weakened). ReadableStream/TextEncoder are
   globals — NO new imports, NO fs, NO import.meta wrappers → no
   Turbopack tracing risk (the S155 699M lesson honored by construction;
   the build measurement in §5 confirms).

6. **The page is untouched.** `(await renderExportEnvelope(publicUser(
   user))).bytes` works against the new shape unchanged (it reads .bytes;
   the fragments it never uses become garbage on return). The page's
   peak: today 3–4×B per view → ~1×B retained + one collection at a
   time. The leaner count-only page consumption stays a recorded
   phase-2 residual (§5) — the single-path doctrine (one assembly, one
   gate, both consumers) wins over a second mode.

**The memory ledger (before → after).** Build-time peak: all-20-row-sets
+ normalized copy + string (1–2×B) + length-encode (1×B) ≈ **3–4×B + all
rows** → **retained fragments (≤ max(B, ceiling+ε)) + one collection's
rows + per-piece transients**. Serve-time: string + undici's eager encode
≈ 2–3×B → fragments + chunk transients ≈ 1×B. The over-ceiling refusal:
full materialization first → ≤ ceiling + head + one piece. The remaining
bound (recorded honestly): a single collection larger than memory (a 10 GB
files table) still materializes in one findMany — the cursor-pagination
family, deferred (§5).

## §3 DE2 — the exportByteSize retirement (F2)

`exportByteSize` has no consumer after DE1 (the driver counts its own
encodes; grep-verified the panel never imports it) — removed per the BZ15
dead-export precedent. Its A-M2 unit legs (the byte-vs-code-unit lesson:
`—`→3, `·`→2, ≠ .length, === Buffer.byteLength) carry over as the
driver's byte-accounting pins: the oracle legs assert `bytes ===
TextEncoder(concat(fragments)).length` on fixtures that INCLUDE the
multi-byte class (— · 👋), so the code-unit under-report defect stays
dead. The CQ2 census rewrites to pin the new shape (the driver + the
fragments return + the no-Buffer rule on the pure module + the route's
String(bytes) + the page's .bytes — the negative pins preserved).

## §4 DE3 — the s21 raw-body pin (F4)

The s21 size pin strengthens to the honest form: read the body ONCE as
text, `expect(Number(sizeHeader)).toBe(Buffer.byteLength(raw))` (the
header against the ACTUAL served bytes — no re-serialization identity
assumption), and parse the text for the shape assertions (one body read,
both uses). The overstated comment corrects. No new e2e leg (the CV1
precedent — the leg count is unchanged; the pin strengthens in place).

## §5 Scoping, deferrals, the e2e interplay, the RED inventory

- **The RED inventory (planned): +9 unit legs, +0 e2e legs.**
  - data-export.test.ts — the new `S156/DE1` describe: (1) the ORACLE,
    empty account — concat(buildExportFragments with in-memory readers)
    === JSON.stringify(buildDataExport(user, {}, date)); (2) the ORACLE,
    populated edge fixture (unicode — · 👋, null, Date, number, boolean,
    FK fields, extra non-manifest keys ignored); (3) the reads run in
    EXPORT_COLLECTIONS order (the call-order recording reader); (4) the
    reads are SEQUENTIAL — reader N+1 is not called until N resolves
    (deferred-promise readers — the one-collection-at-a-time mechanism);
    (5) the parsed output's counts === the per-reader row counts; (6)
    `bytes` === the whole-body UTF-8 byte count on the unicode fixture
    (the A-M2 carry-over — byte divergence exercised); (7) the name-
    safety leg (every EXPORT_COLLECTIONS name matches /^[A-Za-z]+$/ —
    the `"${name}"` scaffold interpolation needs no JSON escaping);
    (8) the user block rides serialized (userId stripped, Date → ISO);
    (9) the fragments decode to the envelope (round-trip through
    TextDecoder === the oracle string).
  - script-conventions.test.ts — the census updates: the exactly-20
    findMany census SURVIVES verbatim (the READERS map carries 20
    literal findMany sites); the shorthand-key census re-anchors to the
    READERS-key form (`^\s*name: \(userId\) => db\.`); the CQ2 census
    rewrites to the new shape (the driver's `return { fragments, bytes }`
    + the gate markers on data-export.ts + the no-Buffer rule preserved
    + the route's String(bytes) + the page's .bytes + the negative
    pins); a NEW route-streaming census leg (the route contains the
    ReadableStream + the enqueue loop — the wire shape pinned).
  - data-export.test.ts — the CW2 wiring census re-anchors: the gate
    markers (exportOverCeiling + ExportTooLargeError) move from
    export-build.ts to data-export.ts (the driver); the http.ts + page +
    panel legs unchanged; the export-build leg re-anchors to the
    delegate + READERS form.
  - **No e2e legs BY DESIGN** (the CV1 runtime-split precedent): the
    four live consumers re-certify the wire — s21 (the download shape +
    headers + the DE3 raw-body pin), s14/S139-CN2 (the LIVE export→
    import round-trip witness — the streamed body must parse and restore
    clean, `created: 0`), resilience/S124-BY5 (the budget family: 10×200
    + the 429), navigation (the page budget + the route twin 200).
- **Unit census: +9 new legs, −2 superseded (the exportByteSize its —
  their A-M2 lesson carries into leg 6), net +7 → 1594 becomes 1601 ·
  e2e census 616 (unchanged — no cert re-tag) · census 2210 → 2217.**
  The vitest header re-anchors; the doc chain (README badge + the
  Session-156 row, AGENTS census + the export rows + the S156 lessons,
  CLAUDE, PAD v1.3.64, SKILL census) follows.
- **The targeted e2e: chunk 1 (navigation — 152 legs, includes the page
  budget + the route twin) — then the full 5-chunk cold cert** (the
  standing map; the budget arithmetic untouched — no new register or
  import POSTs).
- **The dev-tree re-confirmation discipline:** after the fix, the dev
  daemon restarts (the S9/S31 stale-Turbopack discipline) and the drawer
  check + the desktop parity probe re-run GREEN on the remediated tree
  before any capture; the /api/export/data endpoint probes live on the
  dev tree (the streamed body parses, the header matches — the
  ReadableStream-in-standalone empirical check) before the build.
- **The build measurement (the S155 lesson, standing):** the standalone
  output must stay 144M + 7 warnings — no new imports/fs/import.meta
  anywhere in the diff; a size regression means the design tripped the
  tracer and gets re-architected BEFORE proceeding.
- **Deferred (recorded, with reasons):** F3's $transaction snapshot (the
  lock-behavior measurement against the import's 60 s write-tx family —
  its own cycle; the skew class documented + honest-failing; DE1's
  sequential-read window extension documented in the seam header); F5's
  page-grid-from-envelope + the count-only page consumption (phase-2);
  the single-collection cursor pagination (a >memory single collection
  still materializes — census-breaking, its own cycle); F7's cosmetic
  edges (the UTC stamp, the 429-download UX); the raw-SQL bulk upsert +
  the A-M3 stage-2 (unchanged from the S155 close).
- **The `.env.example` contract:** no env-var reads change this cycle —
  re-verified at close.

## §6 As-executed close

**Executed as planned — no mid-cycle design corrections.** The RED
inventory: the unit REDs **12/12** on their designed markers (the 9
driver legs — the two ORACLE legs, the read-order leg, the
SEQUENTIAL-reads leg with deferred-promise readers, the counts leg,
the byte-count leg, the name-safety leg [green on arrival by design —
it pins the unchanged manifest's property], the user-block leg, the
exportedAt leg — + the READERS-key census + the route-streaming
census + the CQ2 re-anchor + the CW2 re-anchor). The §2 architecture
shipped exactly as designed: the pure driver (the injected reader +
per-row fragments + per-fragment counting + retain-while-under + the
exact-total gate), the READERS-map wiring (the compile-time
exhaustive key type), the ReadableStream route, the http.ts
re-export, the untouched page.

**The arithmetic correction (small, honest):** §5's planned census
line said "+9 → 1601/2217" — it missed the +1 route-streaming census
leg (a net-new it, not an edit). The true ledger: **+9 driver legs +
1 route-stream census − 2 superseded exportByteSize its = +8 net →
1602 unit · 616 e2e (unchanged) · census 2218.** The doc chain
carries the true numbers.

**The build measurement (the S155 lesson, standing):** the standalone
output **144M byte-identical to pre-fix; 7 warnings — the documented
set, nothing new** (ReadableStream + TextEncoder are globals; no new
imports, no fs, no import.meta wrappers — the tracing risk designed
away by construction, verified by measurement).

**The live stream probe** (`scripts/probe-export-stream-s156.mjs`,
the dev tree): 200 + the download headers; the body arrives
**chunked** and byte-complete (**X-Export-Bytes 19832 === the actual
received UTF-8 byte count** — the strengthened s21/DE3 contract,
live); the envelope parses with all 20 manifest keys +
internally-consistent counts; the secret guard holds; the **LIVE
round-trip** restores idempotently (**created: 0** — the S139-CN2
witness class). Preserved as
`docs/screenshots/156-export-stream-evidence.json`.

**The remediated-tree re-confirmation:** the daemon restart (the
S9/S31 stale-Turbopack discipline) → preflight GREEN · the drawer
check GREEN (**the 73rd consecutive**) · the desktop parity probe
**MATCH** (all five checks, live reference login).

**Gates.** lint ✓ · tsc ✓ · unit **1602/1602** (48 files, +8 exactly
as designed after the arithmetic correction) · build ✓ (exit 0; 7
warnings; 144M byte-identical) · the targeted e2e: chunk 1 **152/152
first-pass** cold · the 5-chunk cold cert: chunk 1 **152/152** ·
chunk 2 **189/189** · chunk 3 **91/91** · chunk 4 **95/95** · chunk 5
**89/89** — **all five chunks FIRST-PASS CLEAN, zero flakes, no
re-runs needed** — the cert tally **616/616** (the e2e census
unchanged by design; the four live export consumers re-certified:
s21's strengthened raw-body pin, the s14/S139-CN2 live round-trip,
resilience's budget family, navigation's page-budget twin) · **census
2218 green** (was 2210).

**Evidence.** The `docs/screenshots/156-clone-*.png` frames (the
standing desktop 241 KiB + the standing mobile drawer 66 KiB — the
73rd drawer-GREEN companion), self-verifying (the capture script's
JSON verdict ok:true; dimensions machine-checked 1440x900 / 390x844) +
the `156-export-stream-evidence.json` live probe record. The DE1 proof
rides the unit oracle legs + the re-anchored censuses + the live probe
+ the cert (the CW2 runtime-split precedent).

**Docs.** README badge/census (2210 → 2218) + the unit-count prose
sites + the data-export row extension + the Session-156 row; AGENTS
census (1594 → 1602) + the S156 lessons block (four lessons: the
pinned-shape contract, the fragmentation+injection fix, the
oracle-beats-a-twin rule, the retain-then-serve streaming spectrum);
CLAUDE counts; PAD v1.3.64 (the revision block); the SKILL census
(all three sites); the vitest header re-anchor (+8 with the
no-e2e-by-design note); `docs/session_185.md`; the worklog Session-167
entry; this close; the `.env.example` contract re-verified (no
env-var reads changed this cycle — .env and .env.example
byte-identical at the documented dev posture).

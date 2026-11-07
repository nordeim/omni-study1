# Session 185 — the S156 cycle (Batch DE)

The workspace was a WARM CONTINUATION at `68da300` on `main` (the
Batch DD fix `a1aa229` + the operator's session_184 transcript commit —
`git pull` fast-forwarded one file; the environment was intact: `.env`
at the documented dev posture [byte-identical to `.env.example`], `db/`
at the repo root, node_modules, the Playwright chromium cache, bun
1.3.14).

Cold baseline (before any work): lint ✓ · tsc ✓ · the full Vitest run
**1594/1594 (48 files — the documented S155 final state exactly)** ·
the dev daemon preflight GREEN · the drawer check GREEN (**the 72nd
consecutive no-Tailwind-v4-mobile-nav-bug confirmation** — backdrop
oklab(0 0 0 / 0.2) + blur(4px); 288px white panels; 20 links; no
footer; Escape-close superset) · the desktop chrome probe **MATCH**
(all five formal checks, live reference login — sidebar 260/20
links/first-links/mainX 260/mainWidth 1180). Baseline noise: none.

The audits (Mode-C; every L+ finding re-verified by direct read by the
orchestrator):

- **Audit A — the Batch DD recent-changes axis** (the `a1aa229` diff):
  **0C / 0H / 0M / 0L / 0I — clean.** All four DD claims verified
  DELIVERED at the source level (the direct `fileURLToPath(
  import.meta.url)` call at db-path.ts:144 + the S155/DD1 census pair;
  the DEPLOYMENT.md reconciliation pair; the AGENTS.md cold-reset
  caveat; the sidecar hygiene) — the doc census machine-verified
  (README badge 2210 ✓ · AGENTS 1594 ✓ · CLAUDE 1594 ✓ · PAD v1.3.63 ✓
  · the SKILL census ✓ · the vitest header 48/1594 ✓ · the cert
  runner Expected 616 ✓) — zero stale sites.

- **Audit B — the export / data-portability family** (the S155 close's
  recorded rotation: the export streaming, "its own streaming-design
  cycle"). The axis read dispatched to a read-only subagent against the
  web-application skill's §3/§4/§6/§16/§17 rubric: the shared assembly
  seam + the pure seam + the download route + the /export page + the
  client panel + the http.ts error/headers seams + the import
  counterpart's round-trip contract + every unit/e2e/census pin + a
  whole-src consumer grep.

  **Verdict: 0C / 0H / 1M / 3L / 4I.** The family coherent,
  well-pinned, and secure (authz on both consumers, the triple secret
  guard, the budget ordering, the byte-based accounting end-to-end, the
  round-trip reconciliation — all verified clean). The findings:
  **F1 (M)** the recorded I-A residual CONFIRMED AND QUANTIFIED — the
  peak memory is O(account) at **≈ 3–4× the serialized body** (all 20
  findMany sets held by the destructured locals + the envelope's
  normalized copy + the whole-body string [1–2×B: any code unit >
  U+00FF forces V8 two-byte] + the exportByteSize length-encode,
  simultaneously), and the 256 MiB gate fires only AFTER the peak — a
  multi-GB account is fully materialized before being refused, and the
  serve-time floor adds undici's eager body encode; **F2 (L)**
  exportByteSize allocates a full body-sized Uint8Array just to read
  `.length` (the census pinned the allocating form AND the Buffer ban);
  **F3 (L)** the 20-read snapshot is not transactional (the
  cross-collection read-skew class — documented, honest-failing,
  deferred with the lock-measurement reason); **F4 (L)** the s21 size
  pin asserted a re-serialization identity, not the raw served bytes;
  F5–F8 the informationals (the page's count-grid duplication, the
  census pin inventory for any redesign, the cosmetic edges, the
  single-use type).

The plan (`docs/remediation-plan-session156.md`) written BEFORE any
source change and validated against the codebase (every census anchor
re-read; the RED inventory sized +9 unit legs / −2 superseded / +1
route-stream census, +0 e2e legs by design — the CV1 runtime-split
precedent).

**The RED inventory (as it ran): the unit REDs 12/12** — the 9 driver
legs (the two ORACLE legs, the read-order leg, the SEQUENTIAL-reads
leg, the counts leg, the byte-count leg, the name-safety leg [green on
arrival by design — it pins the unchanged manifest's property], the
user-block leg, the exportedAt leg) + the 3 census legs (the
READERS-key form, the route-streaming shape, the CQ2 re-anchor) + the
CW2 re-anchor — each failing on its designed marker, not a file-load
error.

**The S156 fixes:**

- **DE1 — the streaming fragment serialization (the cycle core, the
  I-A answer).** The PURE driver `buildExportFragments(user,
  readCollection, exportedAt)` in data-export.ts (the S124/BY2
  explicit-args doctrine applied to the reads — the collection reader
  INJECTED as a parameter, which is what makes the assembly both
  unit-testable and one-collection-at-a-time): sequential reads in
  EXPORT_COLLECTIONS order, per-row serialization through the SAME
  normalizer, per-fragment byte counting (every encoded fragment is
  RETAINED payload, never a length-only allocation — F2 closed
  structurally), retain-while-under-ceiling (a multi-GB account
  refused at ≤ ceiling + head + one piece, the error still carrying
  the EXACT total), and the concatenation **byte-identical to
  JSON.stringify(buildDataExport(...))** — compositional JSON.stringify
  + the scaffold reproducing the object literal's insertion order,
  pinned by the unit ORACLE legs (buildDataExport STAYS as the
  executable reference the streaming form must never drift from).
  export-build.ts rewrites to the thin READERS-map wiring (the
  Record<ExportCollection, …> key type makes an omitted collection a
  COMPILE error; the exactly-20 findMany census survives verbatim).
  The route STREAMS the fragments (ReadableStream, chunked transfer —
  serve-time peak ≈ 1× the body; X-Export-Bytes stays the exact byte
  count of the served fragments). ExportTooLargeError moves to the
  pure seam beside the ceiling family (http.ts re-exports — every
  existing import green; no cycle: data-export.ts stays import-free).
  **The memory ledger: build peak 3–4×B + all rows → ~1×B + one
  collection; serve peak 2–3×B → ~1×B; the over-ceiling refusal
  unbounded → ≤ ceiling + ε.** The remaining bound (a single
  >memory collection still materializes in one findMany — the cursor
  family) recorded as the phase-2 residual.

- **DE2 — the exportByteSize retirement.** No consumer after the
  driver's own counting (the BZ15 dead-export precedent); the A-M2
  byte-vs-code-unit lesson carried into the driver's byte leg on the
  multi-byte fixture (— · 👋).

- **DE3 — the s21 raw-body pin.** The size pin strengthened from the
  re-serialization identity to the RAW served body (one res.text()
  read; the header against the actual wire bytes) — the F4 finding.

**The live stream probe** (`scripts/probe-export-stream-s156.mjs` —
the dev tree, the demo session): GET /api/export/data answers 200 with
the download headers; the body arrives **CHUNKED** and is
byte-complete (**X-Export-Bytes 19832 === the actual received UTF-8
byte count** — the strengthened s21/DE3 contract, live); the envelope
parses with all 20 manifest keys and internally-consistent counts; the
secret guard holds; and the **LIVE round-trip** POSTs the streamed body
back to /api/import/data for the idempotent restore (**created: 0** —
the S139-CN2 witness class). The record preserved as
`docs/screenshots/156-export-stream-evidence.json`.

**Remediated tree re-confirmation**: the daemon restart (the S9/S31
stale-Turbopack discipline) → preflight GREEN · the drawer check GREEN
(**the 73rd consecutive**) · the desktop parity probe **MATCH** (all
five checks, live reference login).

**Gates.** lint ✓ · tsc ✓ · unit **1602/1602** (48 files, +8 exactly
as designed: data-export +9, script-conventions +1, −2 superseded) ·
build ✓ (exit 0; **7 warnings — the documented set, nothing new**; the
standalone output **144M byte-identical to pre-fix** — no tracing
regression, the S155 lesson honored by construction: ReadableStream +
TextEncoder are globals, no new imports, no fs, no import.meta
wrappers) · the targeted e2e: chunk 1 **152/152 first-pass** cold ·
the 5-chunk cold cert: chunk 1 **152/152** · chunk 2 **189/189** ·
chunk 3 **91/91** · chunk 4 **95/95** · chunk 5 **89/89** — **all
five chunks FIRST-PASS CLEAN, zero flakes, no re-runs needed** — the
cert tally **616/616** (the e2e census unchanged by design; the four
live export consumers re-certified: s21's strengthened raw-body pin,
the s14/S139-CN2 live round-trip, resilience's budget family,
navigation's page-budget twin) · **census 2218 green** (was 2210).

**Evidence:** the `docs/screenshots/156-clone-*.png` frames (the
standing desktop 241 KiB + the standing mobile drawer 66 KiB [the 73rd
drawer-GREEN companion frame]), self-verifying (the capture script's
JSON verdict ok:true; dimensions machine-checked 1440x900 / 390x844) +
the `156-export-stream-evidence.json` live probe record. The DE1
proof rides the unit oracle legs + the re-anchored censuses + the live
stream probe + the cert (the CW2 runtime-split precedent).

**Docs:** README badge/census (2210 → 2218) + the unit-count prose
sites + the data-export row extension + the Session-156 row; AGENTS
census (1594 → 1602) + the S156 lessons block (four lessons); CLAUDE
counts; PAD v1.3.64 (the revision block); the SKILL census (all three
sites); the vitest header re-anchor (+8 with the no-e2e-by-design
note); `docs/session_185.md` (this log); the worklog Session-167
entry; the plan §6 as-executed close; the `.env.example` contract
re-verified (no env-var reads changed this cycle — .env and
.env.example byte-identical at the documented dev posture).

**Next cycle:** the rotation continues — the recorded deferrals: F3's
$transaction snapshot (the lock-behavior measurement against the
import's 60 s write-tx family), F5's page-grid-from-envelope + the
count-only page consumption (the phase-2 leaner page), the
single-collection cursor pagination (a >memory single collection), the
raw-SQL bulk upsert (IF profiling ever presses the 60 s budget), the
A-M3 stage-2 (re-measure only if the hardware or the row cap changes).

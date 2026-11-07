# Session 187 — the S157 cycle (Batch DF)

The workspace was a WARM CONTINUATION at `6befbab` on `main` (the
Batch DE fix `cf1fb4d` + the operator's session_186 transcript commit —
`git pull` fast-forwarded one file; the environment was intact: `.env`
at the documented dev posture [byte-identical to `.env.example`], `db/`
at the repo root, node_modules, the Playwright chromium cache, bun
1.3.14).

Cold baseline (before any work): lint ✓ · tsc ✓ · the full Vitest run
**1602/1602 (48 files — the documented S156 final state exactly)** ·
the dev daemon preflight GREEN · the drawer check GREEN (**the 74th
consecutive no-Tailwind-v4-mobile-nav-bug confirmation** — backdrop
oklab(0 0 0 / 0.2) + blur(4px); 288px white panels; 20 links; no
footer; Escape-close superset) · the desktop chrome probe **MATCH**
(all five formal checks, live reference login — the S142
outer-footprint probe: sidebar-outer 260 / 20 links / first-links /
mainX 260 / mainWidth 1180; the older s141 probe's 258px navWidth is
the KNOWN inner-nav artifact, the session-158 record). Baseline noise:
none.

The audits (Mode-C; every L+ finding re-verified by direct read by the
orchestrator):

- **Audit A — the Batch DE recent-changes axis** (the `cf1fb4d` diff):
  **0C / 0H / 0M / 0L / 0I — clean.** All five DE claims verified
  DELIVERED at the source level (the pure driver + the READERS-map
  wiring + the ReadableStream route + the DE2 retirement [zero call
  sites] + the DE3 raw-body pin) — the doc census machine-verified
  (README badge 2218 ✓ · AGENTS 1602 ✓ · CLAUDE 1602 ✓ · PAD v1.3.64 ✓
  · the SKILL census ✓ · the vitest header 48/1602 ✓ · the cert runner
  Expected 616 ✓) — zero stale count sites.

- **Audit B — the export/import data-portability family** (the S156
  close's recorded rotation). The axis read dispatched to a read-only
  subagent against the web-application skill's §3/§4/§6/§16/§17
  rubric: the driver + the READERS wiring + the route + the page + the
  client panel + the http.ts seams + the import counterpart's lock
  doctrine + every unit/e2e/census pin + a whole-src consumer grep.

  **Verdict: 0C / 0H / 1M / 2L / 6I.** The family coherent, well-pinned,
  and secure (authz on both consumers, the triple secret guard, the
  budget ordering, the byte-based accounting end-to-end, the round-trip
  reconciliation — all verified clean). The findings: **M-1 (M)** the
  repo's own query-engine binary carries `BEGIN IMMEDIATE` (×2) and
  NOT `BEGIN DEFERRED` — the F3 wrap's recorded premise ("holds a read
  transaction open") could understate the lock cost; the measurement
  must probe the ACTUAL lock mode first; **L-1 (L)** the /export page's
  20-count grid had NO manifest-completeness census (the DB2 census
  anchored only `db.subject.count` existence — a dropped collection
  ships a 19-chip grid with every gate green, the exact class the
  READERS census closed on the assembly side); **L-2 (L)** AGENTS.md:107
  (the living export row) still said "read in parallel" — stale since
  S156/DE1's sequential driver; I-1 the import update writes are
  unscoped (the accepted read-hoist TOCTOU's contrived cross-account
  flavor — documentation-only); I-2 the force-dynamic posture (the
  repo convention — cookie-reading auth makes both doors implicitly
  dynamic); I-3 the driver's Pass-2 unconditional head/separator/tail
  encodes (bounded, matches the documented refusal bound); I-4 the two
  stale pin comments; I-5/I-6 the F3/F5/F7 confirmations + the census
  integrity.

**The F3 measurement ran FIRST (the S154 measurement-first doctrine) —
and REJECTED the deferred design.** The probe
(`scripts/measure-export-lock-s157.mjs`, two Prisma clients against a
throwaway `db/measure.db`): P1 — while a read-only interactive
`$transaction` is open, a concurrent write WAITS THE FULL REMAINING
HOLD (2435 ms measured against a 2500 ms hold) then succeeds, and
concurrent reads coexist (2 ms); P2 — reads coexist with an open write
tx pre-commit (2 ms); P3 — the export-shaped rehearsal (20 sequential
reads + a 1.5 s serialization hold): write 0 blocked 1332 ms (the hold
remainder), writes 1-4 landed in 1-2 ms after close. **The verdict:**
an export snapshot tx would delay **every sitewide writer's COMMIT**
by the full read+serialize window (the journal_mode=delete
SHARED-blocks-EXCLUSIVE-commit tail), and past the 5 s busy_timeout
concurrent writes fail outright — exactly the large accounts the
snapshot would serve (the S154 sibling measure: 0.32 ms/row — a 100k-row
account serializes for tens of seconds). **F3's $transaction snapshot
is REJECTED ON MEASUREMENT** — the honest-failing skew posture is the
CORRECT endpoint; the deferral converts from cautionary to
MEASURED-REJECTED (the S154 lesson repeated: the measurement chose a
different answer than the deferred design).

The plan (`docs/remediation-plan-session157.md`) written BEFORE any
source change and validated against the codebase (every census anchor
re-read; the RED inventory sized +2 unit legs / +0 e2e — the CV1
runtime-split precedent).

**The RED inventory (as it ran): the unit REDs 4/4** — the counts-weld
leg (the returned counts record === the parsed envelope's counts ===
the per-reader row counts) + the over-ceiling-counts leg (the
required-arg constructor + the throw-site census) + the CQ2
return-shape re-anchor + the DB2 page census rewrite — each failing on
its designed marker, not a file-load error.

**The S157 fixes:**

- **DF1 — grid-from-envelope (the F5 close, the cycle core).** The
  driver's return grows the STRUCTURED counts record
  (`RenderedExport = { fragments, bytes, counts }` — the loop-local
  the head fragment already serializes; zero new work; insertion order
  = EXPORT_COLLECTIONS), `ExportTooLargeError` grows a REQUIRED counts
  payload (the driver always holds the complete record at the post-loop
  throw; the over-ceiling /export render keeps its grid), and the page
  RETIRES its own 20 `count()` query family + the hand-written counts
  literal + the `db` import (the `noUnusedLocals` guard enforces the
  cleanup): ONE `renderExportEnvelope` call feeds the grid AND the size
  signal. **The properties:** per-view queries halve (20 count + 20
  findMany → 20 findMany); the page-internal skew class (the old
  grid's counts read before the envelope's reads) is ELIMINATED (one
  pass by construction); **L-1 closes STRUCTURALLY** (the grid derives
  from EXPORT_COLLECTIONS through the seam — a dropped collection is a
  READERS compile error, never a 19-chip grid); the panel renders
  byte-identically (chip order = EXPORT_COLLECTIONS = the retired
  literal's order — verified identical by direct read). The count-only
  page-consumption half of the phase-2 candidate was REJECTED by
  adjudication (the exact bytes are only knowable from the full
  serialization — the S141/CP4 size signal; the single-path doctrine
  holds).

- **DF2 — the F3 measured-record rider.** export-build.ts's read-skew
  honesty header re-words from "its own measurement cycle" to the
  measured record (the probe's numbers + the rejection + the script's
  path); the probe script is committed (the
  measure-import-window-s154 precedent); the scratch `db/measure.db`
  deleted after the record.

- **The riders:** L-2 (AGENTS.md:107 — "read SEQUENTIALLY through the
  injected reader" + the grid-from-envelope wording); I-4 (the
  data-export.test.ts CW2 comment — the throw lives in the pure driver;
  the s23 CH7 comment — "re-runs the page's ONE envelope render"); the
  DB2 header + navigation DB2 comment blocks re-anchored.

**The live page probe** (`scripts/probe-export-page-s157.mjs` — the
dev tree, the demo session): the /export page renders **20 chips in
EXPORT_COLLECTIONS order** (Subjects=6 … Holidays=2); the grid counts
**MATCH the API envelope's own counts** (the cross-check through
`GET /api/export/data` — one source: the seam); the size signal renders
(19 KB); **X-Export-Bytes 19832 === the actual received body bytes**;
the secret guard holds.

**Remediated tree re-confirmation**: the daemon restart (the S9/S31
stale-Turbopack discipline) → preflight GREEN · the drawer check GREEN
(**the 75th consecutive**) · the desktop parity probe **MATCH** (all
five checks, live reference login).

**Gates.** lint ✓ · tsc ✓ · unit **1604/1604** (48 files, +2 exactly as
designed) · build ✓ (exit 0; **7 warnings — the documented set, nothing
new**; the standalone output **144M byte-identical to pre-fix** — the
diff only REMOVES an import, no tracing risk by construction) · the
targeted e2e: chunk 5 **89/89 first-pass** cold (s21 + s23 — the direct
page consumers) + chunk 1 **151/152 with one machine-load flake**
(parity-session8's BZ3 popover-keyboard leg — **standalone-cold re-run
68/68 first-pass**, the S139 machine-load class; the full cert's chunk
1 then passed 152/152 first-pass, the flake unrecurring) · the 5-chunk
cold cert: chunk 1 **152/152** · chunk 2 **189/189** · chunk 3
**91/91** · chunk 4 **95/95** · chunk 5 **89/89** — **all five chunks
FIRST-PASS CLEAN** — the cert tally **616/616** (the e2e census
unchanged by design; the three live export consumers re-certified:
s21's page leg + raw-body pin, s23's CH7 refresh flip, navigation's DB2
twin) · **census 2220 green** (was 2218).

**Evidence:** the `docs/screenshots/157-clone-*.png` frames (the
standing desktop 241 KiB + the standing mobile drawer 66 KiB [the 75th
drawer-GREEN companion frame] + **the cycle's surface: the remediated
/export page 226 KiB — 20 chips, machine-counted by the capture
script**), self-verifying (the capture script's JSON verdict ok:true;
dimensions machine-checked 1440x900 / 390x844) + the live page-probe
record. The DF1 proof rides the unit counts-weld leg + the re-anchored
censuses + the live probe + the cert (the CW2 runtime-split precedent);
the DF2 proof rides the committed probe script + the measured numbers
recorded in the seam header, the plan, and this log.

**Docs:** README badge/census (2218 → 2220) + the unit-count prose
sites + the data-portability row extension + the Session-157 row;
AGENTS census (1602 → 1604) + the export row re-anchor (the L-2 fix +
the grid-from-envelope wording) + the S157 lessons block (three
lessons); CLAUDE counts; PAD v1.3.65 (the revision block); the SKILL
census (all five sites); the vitest header re-anchor (+2 with the
no-e2e-by-design note); `docs/session_187.md` (this log); the worklog
Session-168 entry; the plan §6 as-executed close; the `.env.example`
contract re-verified (no env-var reads changed this cycle — .env and
.env.example byte-identical at the documented dev posture).

**Next cycle:** the rotation continues — the recorded deferrals: the
single-collection cursor pagination (a >memory single collection still
materializes in one findMany — census-breaking, its own cycle), F7's
cosmetic edges (the UTC filename stamp, the 429-through-the-download
anchor), I-1's cross-account TOCTOU documentation note, the raw-SQL
bulk upsert (IF profiling ever presses the 60 s budget), the A-M3
stage-2 (re-measure only if the hardware or the row cap changes).

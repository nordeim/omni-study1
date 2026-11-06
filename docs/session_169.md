# Session 169 — the S148 cycle (Batch CW)

The workspace was a FRESH CLONE (the 40th continuation) at `a051d6e` on
`main` (the Batch CV fix `5acadb9` + the operator's session_168
transcript commit). Environment provisioned through the documented
fresh-clone path: `bun install` (510 packages) → `db/` created at the
repo root → `.env` written with `DATABASE_URL="file:../db/custom.db"`
(the `.env.example` dev posture) → db:generate → db:push → db:seed
(db/custom.db 380 KiB, the demo account) → Playwright Chromium
headless-shell 1243 (matching playwright 1.63.0) → the dev daemon live
on :3000 (`curl /login` → 200, "StudyFlow" chrome).

Cold baseline (before any work): lint ✓ · tsc ✓ · unit **1519/1519**
(48 files — the documented S147 final state exactly) · the drawer check
GREEN (**the 63rd consecutive no-Tailwind-v4-mobile-nav-bug
confirmation** — backdrop oklab(0 0 0 / 0.2) + blur(4px); 288px white
panels; 20 links; no footer; Escape-close superset) · the desktop chrome
probe **MATCH** (all five formal checks). Baseline noise: none.

The audits (two Mode-C passes; the s148 data-layer breadth scan run as
a read-only subagent dispatch, every M/L finding re-verified by direct
read by the orchestrator before the plan was written):

- **Audit A — the Batch CV recent-changes axis** (the `5acadb9` diff):
  **0C / 0H / 0M / 0L / 0I — clean**. All three CV claims verified
  DELIVERED at the source level — CV1's seam (env-check.ts:229-237, the
  honest casing+membership shape) + the wiring (instrumentation.ts:117,
  the CI6c precedent copy); CV2's finally-cleanup (s14-hardening.spec
  :1000-1016 — the row id captured before the first throwing expect,
  the failed-POST branch creates no row); CV3's census machine-verified
  (README badge 2133, AGENTS 1519/614, CLAUDE, PAD v1.3.55, the SKILL
  census both sites, the vitest header — every number read in the
  tree). No new attack surface, no lock-order hazard.

- **Audit B — the entities/factory + data-layer rotation** (two cycles
  stale — the S146-swept axis; a full breadth scan of the store, the
  http factories, the api seam, the import/export engines, and all 60
  API route files): **0C / 0H / 0M / 3L / 2I**. The historically-real
  families re-verified CLOSED: the route-authz census (60/60 routes
  gated through the factories, direct wrappers, or verified requireUser
  handlers — the 8 pre-auth flows + health the documented exemptions);
  the store's stale-state classes (fetchSeq tickets, per-key
  loadingCounts, the per-id toggle chains); the import door (byte cap +
  row cap + per-row sanitize + NEVER_IMPORT_FIELDS + the userId
  re-attachment — the import cannot create rows owned by a different
  user); the error taxonomy re-read branch-by-branch; the bounded-read
  census exhaustive (every findMany in the API surface bounded — 500/
  5000/1000/2000/IN-chunk — with ONE design-documented exception,
  B-L3 below); the sentKeysPatch/ownedFks/CE5/CR4 hardening
  presence-verified at its anchors. The findings, all three Ls
  re-verified by direct read: **B-L1** the calculator-history POST —
  the one authenticated write verb outside the shared BZ5/CB7 write
  budget (the S122/BW5 comment conflated the 500-row STORAGE trim with
  RATE-boundedness; the per-file CE6 census was satisfied by the DELETE
  twin's budget while the POST rode none); **B-L2** the import
  restore's sequential per-row updates inside the 60 s interactive
  transaction (deferred — the A-M3 family's own ADR-021 cycle);
  **B-L3** the export — the one unbounded read family (20 findManys
  with no take, assembled + serialized unconditionally for both
  consumers; the over-cap warning client-side only, while the import
  door legally admits 64 MiB envelopes REPEATEDLY — a legit account
  grows to multi-GB and every export GET materializes it). The Is:
  the RUM bounded upsert loop (stylistic — no action); the api.ts
  parse() 2xx-status-in-ApiError cosmetic (B-I2 — the CW3 rider).

The plan (`docs/remediation-plan-session148.md`) written BEFORE any
source change and validated against the codebase (every anchor
re-read), then executed TDD-first.

**The RED inventory:** the unit REDs **11/11 as designed** — the CW1
per-method census leg (the calculator-history POST block sliced and
asserted for its own checkRateLimit — RED: the block carried none);
the CW2 import-failure reds (EXPORT_MAX_BYTES + exportOverCeiling
absent — the import failure IS the red) + the four wiring-census legs
(no markers yet in the seam/http/page/panel); the CW3 parse leg (a
malformed 2xx body answered status 200, expected 502). GREEN after
implementation: the same files 122/122 (the CQ2 census leg re-anchored
to the new seam shape in the same change — the byte derivation moved
from the return literal to a named const the ceiling gate reads).

**The S148 fixes:** CW1 the calculator-history POST joins the shared
`write:${user.id}` 600/15-min budget (the CE6 pattern — after auth,
before readJson; the FE unaffected: one POST per explicit "=" press,
the BT12 catch already degrades honestly; the exemption language
retired from the route comments). CW2 the export byte ceiling —
`EXPORT_MAX_BYTES` 256 MiB (4× the restore cap: ADR-019-honest for the
merely-large account that outgrew 64 MiB through repeated imports,
bounding the multi-GB tail) + the `exportOverCeiling` pure predicate +
the typed `ExportTooLargeError` (carrying the computed bytes) thrown by
the SHARED renderExportEnvelope seam — the BW8 single-source doctrine:
the route's 413 (the CU3 discrimination precedent, with the
database-file remedy) and the page's over-ceiling panel derive from
ONE gate and can never drift — + the /export page's narrow catch
rendering the same panel from err.bytes + the panel's derived
over-ceiling state (the red role="alert" remedy + the disabled
Download span; under the ceiling every e2e-scale account renders
byte-identically). No e2e leg BY DESIGN (the CV1 runtime-split
precedent: driving the ceiling needs a >256 MiB account — the
predicate legs + the four censuses + the s21 re-cert own the proof).
CW3 the malformed-2xx parse surfaces ApiError **502** (the server
answered garbage), never the pretend-200.

**Final gates: lint ✓ · tsc ✓ · unit 1530/1530 (48 files, +11) · build
✓ (exit 0; the ceiling wiring verified shipped in the standalone
chunks; the 6 Turbopack warnings are the documented db-path/instrumenta
tion baseline — files untouched this cycle) · the targeted s21 +
calculator run 20/20 · the cold 5-chunk cert 150 + 188 + 90 + 95 + 89
first-pass with the two documented-class flakes (the AH2a departed-Save
timing leg in parity-session7; the AJ1 folder-POST P1008 socket-timeout
500 in resilience — both co-occurring with the WebServer SQLite
socket-timeout noise, the S142/S143 machine-load class) re-verified
GREEN in the contention-free cold re-run of both full spec files
**97/97 first-pass** = census 614/614 · census total 2144 green** (was
2133).

**Evidence:** three `docs/screenshots/148-clone-*.png` frames (desktop
237 KiB, the mobile drawer 64 KiB, the /export panel 221 KiB — the
cycle's axis surface), self-verifying (exists, >10 KiB, byte-diverse,
dominant-share < 95%, md5-distinct — the capture script's JSON verdict
ok:true) + the CW2 machine proof on the unit layer (the nine
data-export legs — the predicate + the four wiring censuses) + the CW1
per-method census leg + the CW3 parse leg.

**Docs:** README badge/census (2133 → 2144) + the Session-148 row;
AGENTS census (1519 → 1530) + the S148 lessons block (two lessons: the
per-FILE census's structural blind spot vs the per-method pin; bound
the SERVED BODY where the read set is unbounded by contract — gate on
the first already-computed downstream quantity, at the shared seam);
CLAUDE counts; PAD v1.3.56 (the revision block + the two §11 closure
rows); the SKILL census (both sites); the vitest header re-anchor
(data-export +9, script-conventions +1, api-offline +1); the cert
runner unchanged (the e2e census untouched); the plan §6 as-executed
close; this log; the worklog Session-159 entry; the `.env.example`
contract re-verified (no diff against 5acadb9 — no env-var reads
changed this cycle).

**Next cycle:** the rotation continues — the FE/views + auth/crypto
axis is now two cycles stale (swept at S147), or the A-M3 stage-2
chunked sub-tx + resume token (its own ADR-021 cycle, now carrying the
B-L2 import lock-hold finding); the B-I3 trim rider stays logged for a
validation-family cycle; the B-I census-granularity design change stays
the named deferral (CW1's focused pin closed the found gap).

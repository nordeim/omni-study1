# Remediation Plan — Session 148 (Cycle 98, Batch CW)

> Status: PLANNED (pre-change record — the immutable plan; the as-executed
> close lives in §6). Written before any source change, per the standing
> doctrine ("write the cycle plan into docs/remediation-plan-sessionN.md
> BEFORE any source change").
>
> Operator directive: refresh the workspace, re-read the doc chain
> (AGENTS/CLAUDE/README/PAD/SKILL + session_167/168 +
> remediation-plan-session147 + worklog), validate against the codebase,
> audit with the repo-included skills (skills/web-application/SKILL.md the
> primary; the skills catalog for the rotation), iterate toward
> visual/functional parity with omni-study1.base44.app (agent-browser-era
> scripts, live reference login, mobile-navigation attention, the
> Tailwind v4 bug watch), provision `.env` with
> `DATABASE_URL="file:../db/custom.db"` + the repo-root `db/`, validate
> the vitest/playwright suites, remediate TDD-first, capture evidence
> frames, update the doc chain, push via the SSH wrapper. The repo's
> `skills/` folder stays excluded from code checking, testing, and
> compilation. Proceed with best judgement on the remaining open
> questions (the operator's standing instruction).

## §0 Scope, method, cold baseline, live parity

**Workspace (a FRESH CLONE — the 40th continuation).** Cloned from
`https://github.com/nordeim/omni-study1.git` to `a051d6e` on `main`
(the Batch CV fix `5acadb9` + the operator's session_168 transcript
commit). Environment provisioned from the documented fresh-clone path:
`bun install` (510 packages) → `db/` created at the repo root → `.env`
written with `DATABASE_URL="file:../db/custom.db"` +
`NEXT_PUBLIC_SITE_URL=http://localhost:3000` + `AUTH_SECRET=""` (the
`.env.example` dev posture) → `bun run db:generate` → `bun run
db:push` → `bun run db:seed` (db/custom.db 380 KiB, demo account
ready) → Playwright Chromium headless-shell 1243 (matching playwright
1.63.0) → the dev daemon on :3000 (`curl /login` → 200, the StudyFlow
chrome).

**Cold baseline (before any work):**

| Gate | Result |
|---|---|
| `bun run lint` | ✓ 0 errors |
| `bun run typecheck` | ✓ 0 errors |
| `bun run test` (Vitest) | ✓ 1519/1519 (48 files) — the documented S147 final state exactly |
| `node scripts/drawer-check-s14.mjs` (live reference login) | GREEN — **the 63rd consecutive no-Tailwind-v4-mobile-nav-bug confirmation** (backdrop oklab(0 0 0 / 0.2) + blur(4px); 288px white panels; 20 links; no footer; Escape-close superset) |
| `node scripts/parity-probe-s142.mjs` (live reference login; REF_PROBE_* exported) | **DESKTOP CHROME: MATCH** — all five formal checks (sidebar outer width, nav link count, first-links order, mainX, mainWidth) |

**Baseline noise observed (recorded, not findings):** none.

**Probes run BEFORE the plan (the doctrine — probe, don't guess):** the
fresh-clone verification leg itself (install → db:push → db:seed → dev,
all green — the web-application skill §15 periodic gate), the reference
login + drawer + parity probes above, plus every audit M/L finding
re-verified by direct read of the current tree before this plan was
written (the anchors are in §1).

## §1 The audits (Mode-C, read-only; every M/L finding re-verified by direct read)

Per the s147 closing directive — "the rotation continues — the
entities/factory + data-layer axis is two cycles stale again (swept at
S146), or the A-M3 stage-2 chunked sub-tx + resume token (its own
ADR-021 cycle)" — plus the standing recent-changes focus ("particularly
on the recent code changes"):

1. **Audit A — the Batch CV recent-changes audit** (the `5acadb9` diff
   itself: the CV1 nodeEnvCasingWarning predicate + the instrumentation
   wiring, the CV2 CU1a tripwire-cleanup finally, the CV3 doc-chain
   census, the capture script, every delivered test leg):
   **0C / 0H / 0M / 0L / 0I — clean**. All three CV claims verified
   **CONFIRMED** at the source level — CV1's seam
   (env-check.ts:229-237, the honest casing+membership shape: silent on
   the three canonical values + unset, warns on Production/PRODUCTION/
   padded/staging/empty) + the wiring (instrumentation.ts:117-123, the
   CI6c precedent copy); CV2's finally-cleanup
   (s14-hardening.spec.ts:1000-1016 — the row id captured before the
   first throwing expect, the failed-POST branch creates no row, the
   `rowId === undefined` branch skips the delete); CV3's census
   machine-verified (README badge 2133, AGENTS 1519/614 + the 5-chunk
   map, CLAUDE 1519/614, PAD v1.3.55, the SKILL census both sites, the
   vitest header, the `.env.example` NODE_ENV contract note — every
   number read in the tree). No new attack surface, no lock-order
   hazard, no stray await outside any tx.

2. **Audit B — the entities/factory + data-layer rotation** (two cycles
   stale — the S146-swept axis; a full breadth scan of
   `src/lib/data.ts`, `src/lib/server/http.ts`, `src/lib/api.ts`,
   `src/lib/data-import.ts`, `src/lib/data-export.ts`, and all 60
   `route.ts` under `src/app/api/`, `entities.ts` re-read as the
   pre-audited anchor): **0C / 0H / 0M / 3L / 2I**. The
   historically-real families re-verified CLOSED: the route-authz
   census (60/60 routes gated through the factories, direct
   `withUser`/`withUserParams` wrappers, or verified `requireUser`
   handlers; the 8 pre-auth flows + health the documented exemptions);
   the store's stale-state classes (fetchSeq tickets, per-key
   loadingCounts, the per-id toggle chains); the import door (byte cap
   + row cap + per-row sanitize + `NEVER_IMPORT_FIELDS` + userId
   re-attachment — the import cannot create rows owned by a different
   user); the error taxonomy (every branch re-read, the P2028
   source-neutral 413); the bounded-read census (every findMany in the
   API surface carries `take:` 500/5000/1000/2000 or an IN-chunk bound
   — with ONE design-documented exception, B-L3 below); the
   sentKeysPatch/ownedFks/CE5/CR4 hardening presence-verified at their
   anchors. The findings (all three Ls re-verified by direct read):

   - **B-L1 — the calculator-history POST is the one unthrottled
     authenticated write verb** (calculator/history/route.ts:35-75).
     The S122/BW5 design exempted it ("a rate limit would silently
     drop history for a legitimately fast calculator; the trim never
     rejects a write") — a STORAGE bound (the 500-row retention trim)
     mistaken for a RATE bound. Each POST performs 1 INSERT + one
     interactive transaction (COUNT + findMany + deleteMany); a
     scripted authenticated flood churns the single-node SQLite writer
     at line rate — the exact BZ5/CB7 rationale every other write verb
     already carries (the DELETE twin at :80 rides `write:${user.id}`
     600/15-min; the S130/CE6 census passed the FILE because the
     census is per-file, not per-method — the file's DELETE budget
     satisfied the walk while the POST rode none).
   - **B-L2 — the import restore's sequential per-row updates inside
     the 60 s interactive transaction** (import/data/route.ts:575-578:
     `for (const { id, data } of plan.updates) { await
     delegate.update(...) }` — up to IMPORT_MAX_ROWS sequential
     awaited writes). Availability-only (P2028 → the honest 413 +
     full rollback bounds each attempt); the fix is the A-M3 family's
     chunked-sub-tx territory. **Deferred — see §5.**
   - **B-L3 — the export is the one unbounded read family**
     (export-build.ts:69-92: 20 × `findMany` with no `take:`, answered
     unconditionally). ADR-019 design-justified (the full "own your
     data" export, `export:` 10/15-min budgeted) — but the import door
     legally admits 100k-row / 64 MiB envelopes REPEATEDLY (the caps
     are per-request, not per-account), so a legit account can grow to
     multi-GB and every export GET then materializes the full read set
     + the JSON.stringify on the single worker — with the over-cap
     WARNING rendered client-side only (the panel's amber alert at
     >IMPORT_MAX_BYTES) while the server builds the body
     unconditionally.
   - **B-I1** — the RUM POST's per-event sequential upsert loop
     (bounded by rumBatchSchema's `.max(20)`; purely stylistic — no
     action). **B-I2** — `api.ts parse()` surfaces a 2xx status inside
     `ApiError` on a malformed success body (api.ts:62-68: a 200 with
     a non-JSON body yields `ApiError` carrying `status: 200` —
     cosmetic today, dishonest to any future status-branching caller;
     the one existing status consumer — login-surface's 429 — is
     unaffected).

**Every M/L finding above was re-verified by direct read of the current
tree before this plan was written** — B-L1 at
src/app/api/calculator/history/route.ts:35-86 (the POST's body: no
checkRateLimit between `withUser` and the 201; the DELETE twin's budget
at :80-83; the FE caller — calculator-view.tsx:193-203 — POSTs one
entry per explicit "=" press, so the shared 600/15-min budget cannot
legitimately bind: 40 writes/min versus a human's evaluate-type-
press cycle); B-L3 at export-build.ts:45-127 + export/data/route.ts:25-56
(no ceiling between assembly and the 200) + export-panel.tsx:165-172
(the client-only amber warning) + app/export/page.tsx:95 (the page's
own unconditional render — an over-ceiling envelope would flow through
both consumers with no bound); B-L2 at import/data/route.ts:555-590.

## §2 The cycle (Batch CW — the write-budget-completion + export-byte-ceiling + parse-status set)

The rotation's named axis (entities/factory + data-layer) contributes
its two actionable Ls as CW1 + CW2; the audit's honest-rider I (the
parse status) lands as CW3 — the same class of cheap taxonomic rider
as CV1's census legs. The B-L2 import lock-hold and the B-I census-
granularity design change stay with their named deferral cycles (§5);
the A-M3 stage-2 chunked sub-tx keeps its own ADR-021 cycle.

## §3 The fixes (design, anchors verified)

### CW1 — the calculator-history POST joins the shared write budget (B-L1)

**The finding (verified by direct read):** the POST at route.ts:35
performs an unthrottled INSERT + retention-trim transaction per call.
Every sibling write verb rides `write:${user.id}` 600/15-min — the
factory verbs (BZ5), the PATCH/DELETE family (CB7), the DELETE twin
eight lines below (CE6). The S122/BW5 comment conflated
storage-boundedness (the 500-row trim) with rate-boundedness; the
S130/CE6 census could not see the gap (per-file granularity — the
named B-I deferral).

**The fix (the CE6 pattern, verbatim):** the POST gains, immediately
after `withUser` opens and BEFORE `readJson` (the C1 convention — the
limiter after auth keeps anon requests 401):

```ts
const limit = checkRateLimit(`write:${user.id}`, 600);
if (!limit.ok) {
  return rateLimitedResponse(limit.retryAfterSec, "Too many requests. Please slow down.");
}
```

The route's header comment (S122/BW5) and the DELETE's CE6 comment
("the POST stays the documented trimmed-table exception") are updated
to retire the exemption language — the POST now rides the shared
budget; the retention trim stays the STORAGE story. The FE needs no
change: the calculator's history POST catch already degrades honestly
("The result is shown, but history could not record it." — the
BT12 split), and the demo user's per-chunk calculator POST volume is
a handful, far under 600 (the CB7 posture note).

**The test leg (tests/script-conventions.test.ts — the CE6 census's
own file, a focused per-method pin the per-file census cannot
express):** one wiring-census leg reading
`src/app/api/calculator/history/route.ts`, slicing the POST block
(from `export const POST` to the next `export const` or EOF), and
asserting it contains `checkRateLimit(` — RED pre-fix (the POST block
carries none), GREEN post-fix. No e2e leg: the shared-bucket
mechanism is already exhaustion-proven by the BZ5 + CB7 legs; a
dedicated 600-POST exhaustion leg for this route would re-prove the
limiter, not the wiring, and burn chunk time + register budget.

### CW2 — the export byte ceiling (B-L3, the cycle's load-bearing fix)

**The finding (verified by direct read):** `renderExportEnvelope`
builds the full envelope unconditionally for both consumers (the
route's download body; the page's size signal), with no server-side
bound. The panel's amber warning fires at >IMPORT_MAX_BYTES (64 MiB —
the RESTORE cap, a different concern); nothing bounds the export
itself.

**The design (the CU3 413-discrimination + the S142/CQ2 byte-truth
doctrines):**

1. **The pure seam** (`src/lib/data-export.ts` — client-importable,
   no Node globals, the formatExportBytes/exportByteSize home):
   `EXPORT_MAX_BYTES = 256 * 1024 * 1024` (4× the restore cap — a
   legit account can outgrow 64 MiB through repeated imports, so the
   ceiling must sit above the restore cap to keep ADR-019 honest for
   the merely-large; 256 MiB still bounds the multi-GB tail) +
   `exportOverCeiling(bytes: number): boolean` (`bytes >
   EXPORT_MAX_BYTES` — the named predicate, the nodeEnvCasingWarning
   pattern: the gate is logic, the display helpers stay display-only).
   At-cap is the last ALLOWED value (the boundary doctrine — the same
   one every byte cap in the family carries).
2. **The typed error** (`src/lib/server/http.ts`, beside
   BodyTooLargeError — the taxonomy's home):
   `ExportTooLargeError extends Error` carrying `bytes` (the computed
   size, so the consumers can render the number), and the
   `toErrorResponse` branch mapping it to **413** with the
   source-neutral remedy copy ("That export is too large to build in
   one pass (over 256 MB). Delete unused files — the heaviest
   collection — and retry, or copy the database file directly (see
   docs/DEPLOYMENT.md §4).") — placed after the BodyTooLargeError
   branch, before the generic Error fallthrough.
3. **The throw** (`src/lib/server/export-build.ts`, after
   `exportByteSize` computes — the single seam both consumers share):
   `if (exportOverCeiling(bytes)) throw new ExportTooLargeError(bytes)`.
   The BW8 single-source doctrine: the route and the page can never
   drift on the ceiling because neither owns it.
4. **The route** (export/data/route.ts): no change — the existing
   `try/catch → toErrorResponse` carries the new 413 branch
   automatically (the CU3 discrimination shape).
5. **The page** (app/export/page.tsx): the
   `renderExportEnvelope` call gains a narrow catch — `ExportTooLargeError`
   → render the panel with `exportBytes={err.bytes}` (the over-ceiling
   state flows through the same prop); everything else re-throws
   (the honest 500 path is unchanged).
6. **The panel** (export-panel.tsx): derives `exportOverCeiling(exportBytes)`
   itself (the predicate is client-safe; the panel already imports
   from data-export.ts) → renders the red `sf-alert-red role="alert"`
   block ("This backup exceeds the app's 256 MB export ceiling — the
   download is disabled. Delete unused files — the heaviest
   collection — and retry, or copy the database file directly (see
   docs/DEPLOYMENT.md §4).") and replaces the Download anchor with a
   non-interactive disabled span (`aria-disabled="true"` + the
   `cursor-not-allowed opacity-60` treatment). The existing amber
   restore-cap warning is UNTOUCHED (a different cap, a different
   message). Under the ceiling — every e2e-scale account — the panel
   renders byte-identically to today (the s21 pins stay green).

**Why no e2e leg (the runtime-split doctrine, the CV1 precedent):**
driving the ceiling honestly means an account holding >256 MiB of
rows — seeding that per-run is prohibitive (the s23 import
round-trip rides ~KB fixtures), and making the ceiling
env-configurable for tests would add an unrequested knob (the
anti-slop rule). The predicate's reachable layer for every
e2e-scale account is always-under; the wiring is census-pinned; the
split is documented here. The s21 export legs re-certify the
under-ceiling surface (the anchor, the size signal, the absent
warnings).

**The test legs (tests/data-export.test.ts, the S21 seam's own file):**
- five predicate/value legs: the EXPORT_MAX_BYTES pin (256 MiB
  exactly — the value the panel copy and the route remedy both name);
  zero-bytes far-under → false; at-cap → false (the boundary); 
  one-past-cap → true; the multi-GB tail (10× cap) → true.
- four wiring-census legs (the CV1 census precedent, readFileSync +
  regex): export-build.ts matches `/ExportTooLargeError/` +
  `/exportOverCeiling/`; http.ts matches `/instanceof
  ExportTooLargeError/` beside its 413; app/export/page.tsx matches
  `/ExportTooLargeError/` (the catch); export-panel.tsx matches
  `/exportOverCeiling/` (the derived state).

### CW3 — the parse() malformed-body status normalization (B-I2, the cheap rider)

`src/lib/api.ts` parse(): a 2xx body that fails `res.json()` now
throws `ApiError(502, "The server returned a malformed response.")`
— the status finally says what happened (the server answered
garbage), never a pretend-200. The one existing status consumer
(login-surface's 429 branch) is unaffected; the message is unchanged.

**The test leg (tests/api-offline.test.ts — the client-seam
robustness file, the stubbed-fetch pattern):** stub fetch resolving a
200 with a non-JSON body → expect ApiError with status 502 (RED
pre-fix: status 200) + the unchanged human message.

### CW4 — the doc chain

README badge `2133` → **2144** + the Session-148 row; AGENTS.md
commands-table census (1519 → **1530** unit; e2e 614 unchanged — the
5-chunk map 150+189+91+95+89 untouched) + the S148 lessons block;
CLAUDE counts (1519 → 1530); PAD v1.3.56 (the revision block + the
§11 closure row for B-L1/B-L3); the SKILL census (both sites); the
vitest header re-anchor (+11: data-export +9, script-conventions +1,
api-offline +1); the cert runner's Expected line unchanged (the e2e
census is untouched this cycle); `docs/session_169.md`; the worklog
Session-159 entry; the plan §6 as-executed close; the `.env.example`
contract re-verified (no env-var reads change this cycle).

## §4 Execution order (TDD)

1. **RED legs first** (against the pre-fix tree): the CW1 census leg
   (the POST block carries no checkRateLimit); the CW2 import-failure
   reds (EXPORT_MAX_BYTES + exportOverCeiling absent — the import
   failure IS the red, the CV1 precedent) + the four wiring-census
   legs (no markers in the four files yet); the CW3 parse leg (status
   200, expected 502). Expect 11 RED.
2. **Implementation:** CW1 the route budget + comment retirements →
   CW2 the seam (EXPORT_MAX_BYTES + exportOverCeiling) → the typed
   error + the 413 branch → the throw → the page catch → the panel
   state → CW3 the parse status.
3. **Interim gates:** lint → typecheck → unit (expect 1530/1530,
   48 files, +11).
4. **The e2e GREEN run:** build (output captured to file — the S146
   SIGPIPE lesson) → the targeted s21 export quartet (the surface
   CW2 rides) + the calculator suite legs (the surface CW1 rides) →
   then the full cold 5-chunk cert on the FINAL tree (150+189+91+95+89
   = 614, per-chunk ALONE — the S142 lesson).
5. **The evidence capture** (`scripts/capture-s148-evidence.mjs`, the
   s147 precedent): the standing desktop frame + the standing mobile
   drawer frame + the cycle's surface frame (the /export panel — the
   CW2 surface); self-verifying (exists, >10 KiB, byte-diverse,
   md5-distinct).
6. **Final tree:** the census re-anchors → §6 close → commit + the
   SSH wrapper push (the wrapper's own procedure doc unchanged).

## §5 Riders considered, deferred (with reasons)

- **B-L2 (the import restore's sequential per-row updates):** the
  A-M3 family's chunked-sub-tx territory — its own ADR-021 cycle
  (the standing scoping doctrine: grabbing it here would violate the
  named-cycle rotation).
- **B-I1 (the RUM upsert loop):** bounded at 20 by the schema;
  purely stylistic — no action.
- **The B-I census-granularity design change (per-method write
  budget census):** the standing deferral (carried S142→S147); CW1's
  focused per-method pin closes THIS gap without redesigning the
  census walk.
- **A-M3 (the stage-2 chunked sub-tx + resume token):** its own
  ADR-021 cycle with its own ADR.
- **B-I3 (schoolName/fullName trim):** the validation-family rider —
  stays logged for its validation-family cycle.
- **The login stale-mint sibling, A-F3 (the break-mode re-latch),
  B-I2-reclass (the two sequence-CAS implementations — a refactor
  cycle), the export streaming half, the post-sanitize
  entity-expansion re-check, the parseImportEnvelope duplication, the
  delete-note popover no-auto-close rider, the unthrottled
  authenticated GET posture (BZ5), the prewarm/auth-verdict note:**
  all unchanged (the carried S142–S147 deferrals).

## §6 As-executed close

**The RED inventory (as it ran):** the unit REDs **11/11 as designed** —
the CW1 per-method census leg (the POST block carried no
checkRateLimit); the CW2 import-failure reds (EXPORT_MAX_BYTES +
exportOverCeiling absent — the import failure IS the red, evidenced by
the targeted vitest run BEFORE the seam landed: 11 failed across the
three files) + the four wiring-census legs (no markers in the seam/
http/page/panel); the CW3 parse leg (a malformed 2xx body answered
status 200, expected 502). One pre-existing pin re-anchored in the
same change: the S142/CQ2 source census (the byte derivation moved
from the seam's return literal to a named const the ceiling gate
reads — `const bytes = exportByteSize(json)` + `return { json, bytes }`).

**Interim gates:** lint ✓ · tsc ✓ · unit **1530/1530** (48 files, +11
exactly as planned).

**The build + targeted e2e:** build ✓ (exit 0, output captured to
file; the ExportTooLargeError wiring verified shipped in the
standalone chunks by direct read; the 6 Turbopack warnings are the
documented db-path/instrumentation baseline — files untouched this
cycle) · the targeted run — the s21 export suite + the calculator
suite — **20/20 green** (the /export page render, the size signal, the
anonymous gate, the CTA pins, the calculator history legs).

**The cold 5-chunk cert (the FINAL tree):** chunk 1 **150 first-pass**
(3.1 m) · chunk 2 **188 first-pass + 1 flake** (4.4 m — the AH2a
departed-Save timing leg; the S81/S80 toast-streak family, timing-
sensitive by construction) · chunk 3 **90 first-pass + 1 flake**
(4.4 m — the AJ1 folder-POST leg answered 500 on the CHILD CREATE, the
P1008 socket-timeout signature) · chunk 4 **95 first-pass** (3.2 m) ·
chunk 5 **89 first-pass** (1.5 m). Both flakes co-occurred with the
WebServer SQLite socket-timeout noise lines (the documented
S142/S143 machine-load class — no code path this cycle touches the
notes-streak flow or the folders POST, and the ExportTooLargeError
branch is a no-op for every non-export error). Per the documented
resolution: the contention-free cold re-run of BOTH full spec files
(parity-session7 + resilience) **97/97 first-pass** — the e2e census
614/614 unchanged (no e2e-count change this cycle, exactly as
planned). **Census 2144 green** (1530 unit + 614 e2e).

**Evidence:** three `docs/screenshots/148-clone-*.png` frames (desktop
237 KiB, the mobile drawer 64 KiB, the /export panel 221 KiB — the
cycle's axis surface), self-verifying (exists, >10 KiB, byte-diverse,
dominant-share < 95%, md5-distinct — the capture script's JSON verdict
`ok: true`; dimensions + non-blank shares machine-checked: 1440x900 /
390x844, 5.6–35.2% non-white). The CW2 machine proof rides the unit
layer (the nine data-export legs — the predicate + the four wiring
censuses); the CW1 per-method census leg and the CW3 parse leg ride
theirs.

**The doc chain:** README badge 2133 → 2144 + the Session-148 row;
AGENTS census (1519 → 1530) + the S148 lessons block (two lessons: the
per-FILE census cannot see per-METHOD gaps; bound the SERVED BODY where
the read set is unbounded by contract); CLAUDE counts; PAD v1.3.56 (the
revision block + the two §11 closure rows for B-L1/B-L3); the SKILL
census (both sites); the vitest header re-anchor (+11); the cert
runner unchanged (the e2e census untouched); `docs/session_169.md`;
the worklog Session-159 entry; this §6 close; the `.env.example`
contract re-verified (no diff against `5acadb9` — no env-var reads
changed this cycle).

**The honest residuals:** the §5 deferrals stand unchanged (B-L2 to the
A-M3 ADR-021 cycle — now carrying the audit's lock-hold finding;
B-I1 no action; the B-I census-granularity design change keeps its
named deferral with CW1's focused pin closing the found gap; B-I3;
A-M3; the login stale-mint sibling; A-F3; the carried S142–S147
family). The `skills/` folder untouched by every check, test, and
compile this cycle.

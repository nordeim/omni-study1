# Remediation Plan — Session 147 (Cycle 97, Batch CV)

> Status: PLANNED (pre-change record — the immutable plan; the as-executed
> close lives in §6). Written before any source change, per the standing
> doctrine ("write the cycle plan into docs/remediation-plan-sessionN.md
> BEFORE any source change").
>
> Operator directive: refresh the workspace, re-read the doc chain
> (AGENTS/CLAUDE/README/PAD/SKILL + session_165/166 +
> remediation-plan-session146 + worklog), validate against the codebase,
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

**Workspace (the 39th continuation).** Pull-refreshed to `443d508` on
`main` (the Batch CU fix `61bc42f` + the operator's session_166
transcript commit `443d508` — the fast-forward added only
`docs/session_166.md`). Environment verified standing: the dev daemon
live on :3000 (`curl /login` → 200, "StudyFlow" chrome), `.env` with
`DATABASE_URL="file:../db/custom.db"`, `db/custom.db` 405 KiB + the e2e
scratch `db/e2e.db`, Playwright Chromium headless-shell 1243 (matching
playwright 1.63.0).

**Cold baseline (before any work):**

| Gate | Result |
|---|---|
| `bun run lint` | ✓ 0 errors |
| `bun run typecheck` | ✓ 0 errors |
| `bun run test` (Vitest) | ✓ 1513/1513 (48 files) — the documented S146 final state exactly |
| `node scripts/drawer-check-s14.mjs` (live reference login) | GREEN — **the 62nd consecutive no-Tailwind-v4-mobile-nav-bug confirmation** (backdrop oklab(0 0 0 / 0.2) + blur(4px); 288px white panels; 20 links; no footer; Escape-close superset) |
| `node scripts/parity-probe-s142.mjs` (live reference login; REF_PROBE_* exported) | **DESKTOP CHROME: MATCH** — all five formal checks (sidebar outer width, nav link count, first-links order, mainX, mainWidth) |

**Baseline noise observed (recorded, not findings):** none.

**Probes run BEFORE the plan (the doctrine — probe, don't guess):** the
runtime-posture probe below (§3 CV1's reachability matrix — the
standalone server.js read, the Dockerfile/compose/.env.example reads)
plus every audit M/L/R finding re-verified by direct read of the current
tree before this plan was written (the anchors are in §1).

## §1 The audits (Mode-C, read-only; every M/L finding re-verified by direct read)

Per the s146 closing directive — "the rotation continues (the
entities/factory axis just swept; the FE/views + auth/crypto axis two
cycles stale again) … the NODE_ENV casing warning stays the cheap rider
for the next auth-family cycle" — plus the standing recent-changes focus
("particularly on the recent code changes"):

1. **Audit A — the Batch CU recent-changes audit** (the `61bc42f` diff
   itself: the CU1 multipart mime guard, the CU2 OTP re-issue
   transactional set, the CU3 413 discrimination, the CU4 breadcrumb
   recount, the CT3 shadow rider, every delivered test leg, the doc
   chain): **0C / 0H / 0M / 1L / 2I**. All thirteen CU claims verified
   **CONFIRMED** at the source level — the claims table: CU1's seam
   (`UPLOAD_MIME_MAX_CHARS` + `isPrintableAsciiMime` in http.ts, the
   admission set byte-equal to the import door's `/^[\x20-\x7E]*$/` +
   100-cap, empty admitted, the octet-stream fallback preserved at
   route.ts:207); CU2's three transaction sites (the register re-issue
   batch triple, the fresh-account interactive pair with the P2002 catch
   around the WHOLE tx — the loser's `{ok:true}` shape unchanged, the
   plaintext `code` echo captured before the tx; the resend batch pair);
   CU3's discriminating catch (`instanceof BodyTooLargeError` → 413,
   everything else `throw` → `withUser` → `toErrorResponse` → the honest
   500 with server-side logging); CU4's five breadcrumbs (the 9/10
   arithmetic re-derived: 10 raw `post("/api/import` lines = 9 demo +
   1 fresh-user, the documented reconciliation); the CT3 shadow pin
   (both CTAs' `boxShadow` ≠ "none"); the derivation tripwire + clean
   legs; the doc-chain census machine-verified (README badge 2127,
   AGENTS 1513/614/150+189+91+95+89, PAD v1.3.54, SKILL census,
   vitest header, cert runner re-tag — every number read in the tree).
   The L: **A-L1** — the CU1a e2e tripwire leg's cleanup `delete` runs
   AFTER the status assertion, not in a `finally` (CU1b's own pattern):
   the leg's designed failure mode (the tripwire firing on a runtime
   switch) ALSO leaks the probe row into the chunk's files surface
   (the row rides FILE_METADATA into every files list GET until the
   per-chunk DB reset). The Is: the guard-copy wording differs across
   the two doors (route 400 vs ImportRowError — different surfaces,
   acceptable); the diff is otherwise clean (no new attack surface, no
   lock-order hazard, no stray await outside any tx).

2. **Audit B — the FE/views + auth/crypto rotation** (two cycles stale —
   the S144/S145-swept axis): **0C / 0H / 0M / 0L / 2I + the named
   rider adjudicated REAL**. The historically-real families re-verified
   CLOSED: the ABA tickets (settings-view + focustimer-view carry the
   `createFetchSeq` CAS; the store's per-id toggle chains + the CC5
   eviction close the stale-base class at data.ts:489); the scrypt/HMAC
   auth core (login: the CF10 global budget + the CB12 per-account
   uniform-401 + the BX4/CI1 timing equalization + the CI1 rehash drain
   + the BS1 session-version mint; register: the CG11/CF1 budget tower
   + the BV6 re-typed-password win; verify-email: the CK10
   already-verified guard + the peppered-digest timing-safe compare +
   the BV11a conditional single-use consumption + the CQ8 tx-row mint;
   resend: the CA10-shape in-flight FE guard); the boot guards (the
   instrumentation wiring + the pure seam); the route authz (the
   factories' `withUser`/`withUserParams` + the BZ5/CB7 shared write
   budget); the error taxonomy (`toErrorResponse`'s 500-with-server-log
   shape); the ownership scoping (the delegates — re-verified at S146);
   the FE structural gates (the drawer check's 62nd GREEN + the parity
   probe MATCH above); the CT1 completion-window set (the `if (saving)`
   latch + the settle-CAS + `disabled={saving}` on both buttons —
   intact at focustimer-view.tsx:120/128/357/374). The rider:
   **B-R1** — see §3 CV1. The Is: the login stale-mint sibling (the
   S142-carried deferral — the millisecond read-to-mint window,
   TTL-bounded, stays deferred); the B-I3 trim rider (stays deferred to
   its validation-family cycle per the s146 plan's own scoping).

**Every M/L finding above was re-verified by direct read of the current
tree before this plan was written** — A-L1 at
tests/e2e/s14-hardening.spec.ts:985-1004 (the delete at :1003 outside
any finally); B-R1 at every consumer listed in §3.

## §2 The cycle (Batch CV — the node-env-casing-boot-warning set)

A thin, honest cycle: the rotation directive's named rider (the
NODE_ENV casing warning — "the cheap rider for the next auth-family
cycle", and this IS the next auth-family cycle) lands as CV1, plus the
audit's one L (the CU1a cleanup consistency) as CV2, plus the doc chain
as CV3. No new M findings existed to carry; grabbing the B-I3 trim
rider (validation family) or the A-M3 chunked sub-tx (its own
ADR-021 cycle) outside their named cycles would violate the standing
scoping doctrine.

## §3 The fixes (design, anchors verified)

### CV1 — the NODE_ENV casing boot warning (B-R1, the named rider landing)

**The finding (verified by direct read):** every production-keyed guard
reads the EXACT value — `env.NODE_ENV !== "production"` at
env-check.ts:119/148/172 (the CB14 in-band delivery, CF2 direct
exposure, CI6c over-declared hops warnings) + the `isProduction` core at
env-check.ts:32 (the AUTH_SECRET fatal gate); `process.env.NODE_ENV ===
"production"` at server/auth.ts:141/162 (the Secure cookie fallbacks);
db.ts:27/30 (the Prisma log config + the singleton guard); db-path.ts:48;
instrumentation.ts:23/48. A host exporting `NODE_ENV=Production` (or
`PRODUCTION`, ` production`, `staging`) degrades SILENTLY to the dev
posture: the AUTH_SECRET fatal gate never fires (a missing secret boots
on the public dev fallback), every production warning stays silent, the
cookie fallback is non-Secure, Prisma logs queries.

**The reachability matrix (the S146 runtime-split doctrine — probe which
runtime can even deliver the miscased value):**
- the standalone server.js FORCES `process.env.NODE_ENV = 'production'`
  at its line 5 BEFORE requiring next (verified by direct read of
  `.next/standalone/server.js`) — the shipped `bun run start` + the
  Docker posture CANNOT see a miscased value;
- `next dev` / `next start` force their own canonical values;
- the Dockerfile sets `ENV NODE_ENV=production` (canonical, line 56);
  docker-compose + `.env.example` never set NODE_ENV;
- ⇒ the miscased value reaches the guards ONLY through a hand-rolled
  custom server (an operator importing `next` programmatically with a
  host-exported NODE_ENV) — not a documented deployment path, exactly
  the overdeclaredProxyHopsWarning class of misconfigured-host
  defense-in-depth.

**The fix (the CI6c precedent, both halves):**
1. The pure predicate in `src/lib/env-check.ts` (after
   `overdeclaredProxyHopsWarning`, before `parseTrustedProxyHops`):
   `nodeEnvCasingWarning(env: { NODE_ENV?: string; [key: string]:
   string | undefined }): boolean` — `false` when NODE_ENV is unset OR
   exactly one of `production | development | test`; `true` otherwise
   (the honest shape is casing+membership: "Production", "PRODUCTION",
   " production", "", "staging" all warn; the name keeps the family
   idiom, the doc-comment states the membership truth).
2. The wiring in `src/instrumentation.ts` register() (after the CI6c
   hop-depth block, before the closing brace): `if
   (nodeEnvCasingWarning(process.env)) console.warn("[boot] WARNING:
   NODE_ENV=… is not one of production | development | test — every
   production-keyed guard … compares the value EXACTLY and is currently
   reading it as the DEV posture. Set NODE_ENV=production (lowercase) on
   production hosts.")`.

**Zero false-positive verification (probed):** every documented posture
delivers a canonical value or none (dev forces development; the
standalone forces production; vitest sets test; the Dockerfile sets
production; compose/.env.example set none) — the warning is structurally
silent on every one of them.

**The test legs (tests/env-check.test.ts, after the CI6c describe
block — the import block gains `nodeEnvCasingWarning`; readFileSync/path
already imported):**
- five predicate legs (the S146/CU1 quintet pattern): canonical silence
  (production/development/test → false); unset silence (undefined →
  false — nothing to miscase); the capital-P host ("Production" → true,
  "PRODUCTION" → true); the padded family (" production", "production ",
  " production " → true — the CG4 " 0" spelling lesson); the arbitrary
  non-canonical values ("staging", "prod", "" → true — membership, never
  a posture guess).
- one wiring census leg (the CI6c 4th-leg precedent):
  instrumentation.ts matches `/nodeEnvCasingWarning\(process\.env\)/`.

**Why no e2e leg (the S146 lesson applied):** the warning CANNOT fire
through any e2e-observable posture — the standalone webServer forces
production at server.js:5 before next boots, so a spawn-based leg (the
s22 negative-spawn precedent) would drive the FORCED value, not the
miscased one. The defect's reachable layer is the pure seam (every guard
reads the raw value) — the unit legs drive exactly that; the wiring is
census-pinned; the split is documented here + in the code comments + the
lessons block. Do not force the leg.

### CV2 — the CU1a tripwire-cleanup finally (A-L1)

`tests/e2e/s14-hardening.spec.ts:985` (the CU1a leg): the cleanup
`delete` moves into a `try/finally` holding `rowId` — the leg's own
designed failure (the tripwire firing on a runtime switch: the 400
answer) must not ALSO leak the probe row into the chunk's files surface.
The CU1b pattern; the failed-POST branch creates no row (the guard's
400 writes nothing — the `rowId === undefined` branch skips the
delete). Green-on-arrival (test hygiene, no source change — the class
is "the cleanup is part of the leg's contract").

### CV3 — the doc chain

README badge `2127` → **2133** + the Session-147 row; AGENTS.md
commands-table census (1513 → **1519** unit; e2e 614 unchanged — the
5-chunk map 150+189+91+95+89 untouched) + the S147 lessons block; CLAUDE
counts; PAD v1.3.55 (the revision block + the §11 closure row); the
SKILL census (all sites); the vitest header re-anchor (env-check +6:
the five predicate legs + the wiring census leg); the cert runner's
Expected line unchanged (the e2e census is untouched this cycle);
`docs/session_167.md`; the worklog Session-158 entry; the plan §6
as-executed close; the `.env.example` contract re-verified (no env-var
reads change this cycle).

## §4 Execution order (TDD)

1. **RED legs first** (against the pre-fix tree): the six env-check legs
   — the five predicate legs (the seam export absent: the import
   failure IS the red) + the wiring census leg (the instrumentation
   marker absent). Expect 6/6 RED.
2. **Implementation:** CV1 the predicate (env-check.ts) → the wiring
   (instrumentation.ts); CV2 the finally-cleanup edit.
3. **Interim gates:** lint → typecheck → unit (expect 1519/1519, 48
   files, +6).
4. **The e2e GREEN run:** build (output captured to file — the S146
   `| head` SIGPIPE lesson) → the targeted s14 CU1 pair + the s22
   boot-guard pair (the two legs whose surface the instrumentation
   change rides) → then the full cold 5-chunk cert on the FINAL tree
   (150+189+91+95+89 = 614, per-chunk ALONE — the S142 lesson).
5. **The evidence capture** (`scripts/capture-s147-evidence.mjs`, the
   s146 precedent): the standing desktop frame + the standing mobile
   drawer frame + the cycle's surface frame (the login surface — the
   unauthenticated auth door this cycle's axis swept); self-verifying
   (exists, >10 KiB, byte-diverse, md5-distinct).
6. **Final tree:** the census re-anchors → §6 close → commit + the SSH
   wrapper push.

## §5 Riders considered, deferred (with reasons)

- **B-I3 (schoolName/fullName trim):** the validation-family rider —
  deferred per the s146 plan's own scoping (watch the sent-keys/sentinel
  interplay; a validation-family cycle owns it).
- **A-M3 (the stage-2 chunked sub-tx + resume token):** its ADR-021
  contract change deserves its own cycle with its own ADR.
- **The login stale-mint sibling:** the S142-carried posture (the
  millisecond read-to-mint window, TTL-bounded, fails closed on the
  NEXT request) — unchanged.
- **A-F3 (the break-mode re-latch):** still deferred to a
  focus-timer-family cycle with a reference probe.
- **B-I2 (the two sequence-CAS implementations):** a pure refactor
  candidate — a refactor-cycle owns it.
- **The carried S142/S145 deferrals:** the export streaming half, the
  post-sanitize entity-expansion re-check, the parseImportEnvelope
  duplication, the delete-note popover no-auto-close rider, the
  unthrottled authenticated GET posture (BZ5), the prewarm/auth-verdict
  note, the B-I census-granularity design change — all unchanged.

## §6 As-executed close

(To be written after the cycle's gates — the immutable-record slot.)

## §6 As-executed close

**The RED inventory (as it ran):** the unit REDs **6/6 as designed** — the
five predicate legs + the wiring census leg, all failing together on the
absent seam export (the import failure IS the red, evidenced by the
targeted vitest run BEFORE the seam landed: `Tests 6 failed | 33 passed`).
The GREEN: the same targeted run after the seam + wiring landed
(`39 passed (39)`). No e2e RED by design (see §3 CV1 — the split: the
standalone webServer forces `NODE_ENV=production` at server.js:5 before
next boots, so no spawn can deliver the miscased value to the running
server; the unit seam is the layer where the value is reachable).

**Green-on-arrival (as designed):** CV2 (the finally-cleanup — test
hygiene, no source change; the tripwire pair re-ran green in the targeted
s14 run AND in the cold chunk-2 cert).

**Interim gates:** lint ✓ · tsc ✓ · unit **1519/1519** (48 files, +6
exactly as planned).

**The build + targeted e2e:** build ✓ (output captured to file, exit 0;
the S146 SIGPIPE lesson) · the standalone wiring verified shipped
(`.next/standalone/.next/server/chunks/src_instrumentation_ts_*.js`
carries the warning copy — direct read) · the targeted run — the s14 CU1
pair + the s22 boot-guard pair — **29/29 green** (the s22 negative-spawn
+ positive control both pass: the new warning is structurally silent on
the exact "production" the spawn sets).

**The cold 5-chunk cert (the FINAL tree):** chunk 1 **150 first-pass**
(3.3 m) · chunk 2 **189 first-pass** (4.3 m — the CU1 pair's chunk,
including the CV2-hardened tripwire leg) · chunk 3 **91 first-pass**
(4.0 m) · chunk 4 **95 first-pass** (3.5 m) · chunk 5 **89 first-pass**
(1.4 m) — **614/614, every chunk first-pass this run, no flake re-run
needed** (the documented WebServer socket-timeout noise lines co-occurred
without failing any leg). **Census 2133 green** (1519 unit + 614 e2e).

**Evidence:** three `docs/screenshots/147-clone-*.png` frames (desktop
235 KiB, mobile drawer 64 KiB, the login surface 236 KiB — the cycle's
axis surface), self-verifying (exists, >10 KiB, byte-diverse,
dominant-share < 95%, md5-distinct — the capture script's JSON verdict
`ok: true`). The CV1 machine proof rides the unit layer (the six
env-check legs — the reachable layer for the miscased value; the wiring
census-pinned in the same file).

**The doc chain:** README badge 2127 → 2133 + the Session-147 row; AGENTS
census (1513 → 1519) + the S147 lessons block (two lessons: the
probe-which-runtime-can-deliver-it doctrine for env knobs; the
tripwire-leg's-cleanup-is-part-of-its-contract); CLAUDE counts + the
env-check seam fragment; PAD v1.3.55 (the revision block + the §11
closure row); the SKILL census (both sites); the vitest header re-anchor
(env-check +6); the cert runner's Expected line unchanged (the e2e census
untouched); `docs/session_167.md`; the worklog Session-158 entry; this
§6 close; the `.env.example` contract re-verified (no env-var reads
changed this cycle — the NODE_ENV warning READS an env var the code
already read at eleven sites; nothing new is consumed).

**The honest residuals:** the §5 deferrals stand unchanged (B-I3 to its
validation-family cycle, A-M3 to its own ADR-021 cycle, the login
stale-mint sibling, A-F3, B-I2, the carried S142/S145 family). The
`skills/` folder untouched by every check, test, and compile this cycle.

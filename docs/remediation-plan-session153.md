# Remediation Plan — Session 153 (Cycle 103, Batch DB)

> Status: PLANNED (pre-change record — the immutable plan; the as-executed
> close lives in §6). Written before any source change, per the standing
> doctrine ("write the cycle plan into docs/remediation-plan-sessionN.md
> BEFORE any source change").
>
> Operator directive: refresh the workspace, re-read the doc chain
> (AGENTS/CLAUDE/README/PAD/SKILL + session_177/178 +
> remediation-plan-session152 + worklog), validate against the codebase,
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

**Workspace (continuation at `73c51eb` on `main` — the Batch DA fix
`028271d` + the operator's session_178 transcript commit; the sandbox
preserved the tree, so the environment re-validated in place rather than
re-provisioned: `.env` at the documented dev posture, `db/custom.db` +
`db/e2e.db` present, node_modules intact).**

**Cold baseline (before any work): lint ✓ · tsc ✓ · the full Vitest run
1578/1578 (48 files — the documented S152 final state exactly) · the dev
daemon preflight GREEN (hydrated, navigation-stable) · the drawer check
GREEN (the 68th consecutive no-Tailwind-v4-mobile-nav-bug confirmation —
backdrop oklab(0 0 0 / 0.2) + blur(4px); 288px white panels; 20 links; no
footer; Escape-close superset) · the desktop chrome probe MATCH (all five
formal checks, live reference login — sidebar 260/20 links/first-links/
mainX 260/mainWidth 1180).** Baseline noise: none.

**The fix scope (the S152 close's named candidates, adjudicated).** The
S152 record named the B-M1 rate-limit-model cycle as the cycle core (the
discharge-model design change with the e2e budget-arithmetic study) paired
with the export-page budget (B-L2-audit: the dedicated `exportPage:` key +
the s21/s23 page-visit cert arithmetic) as the budget-family cycle.
Adjudication (the operator's standing best-judgement instruction): BOTH
land — they are the two halves of the budget-family cycle (one
limiter-core design change + one unbudgeted-door closure), sharing the
e2e-arithmetic study. The audit's two new L findings (N1 the garbage-flood
lockout documentation, N2 the success-reset drift trio) ride as doc
riders; the two I findings (N3 the verifyEmailSchema reference-pin note,
N4 the audit-axis path correction) are recorded here only.

## §1 The audits (Mode-C; every M/L finding re-verified by direct read by the orchestrator)

### Audit A — the Batch DA recent-changes axis (the `028271d` diff)

**0C / 0H / 0M / 0L / 0I — clean.** All six DA claims verified DELIVERED
at the source level: DA1's `deletingIds` latch (the membership guard
before the DELETE at events `:225`, the finally removal, `disabled` +
`disabled:opacity-50` on the plain-button sites at events `:429`; all five
view files carry the set) + DA2's hand-guard heptet (the required-field
guards BEFORE `setBusy` — events `:186-192` spot-verified, the
field-naming copy across all seven forms) + DA3's replace-confirm
(`replaceConfirmOpen` state at practicetests `:186`, the `drafts.length >
0` gate at `:372-376`, the AlertDialog at `:510` inside the TestDialog
scope) + DA4's 401-order (`requireUser()` before the CN11 bound at http
`:396-406`) + DA5's fullName trim (`z.string().trim().max(100)` at
validation `:141`) + DA6's doc sites. The doc census machine-verified:
README badge 2192 ✓ · README:108/:167 at 1578 ✓ · the import-cap prose at
64 MiB ✓ (README:52/:184) · AGENTS 1578 ✓ · CLAUDE 1578 ✓ · PAD v1.3.60 ✓
· SKILL:630 green-state ✓ · the vitest header (48 files / 1578 tests) ✓ —
**zero stale sites** (the DA6 self-anchoring pins hold on their first
re-read). No new attack surface in the diff.

### Audit B — the rate-limiter/auth-family + export/data-portability rotation (the fix surfaces, swept at S124 and now 28 cycles grown)

The axis read dispatched to a read-only subagent against the
web-application skill's §4/§5/§6/§7/§16 rubric (the S148-S152 precedent):
auth.ts + server/auth.ts + all 11 auth routes + the export page + both
export routes + export-build + http.ts + data-import + the export panel;
every M/L finding re-verified by direct read by the orchestrator.

**Verdict: 0C / 0H / 2M (the two named deferrals, mechanics re-verified) /
2L / 2I.** The full 30-key rate-limit census re-verified consistent (every
scrypt-burning route carries a 40/15-min process-wide global checked
first; every non-scrypt auth route carries none; the write/upload/ai/
export/import/rum families unchanged; `auth/logout` the one documented
exemption). No injection, authz, enumeration, or secret-handling defect in
the axis. The findings:

- **B-M1 (Reasoned → mechanics CORRECTED by the audit's direct read —
  the load-bearing finding of this cycle):** the S152 plan's stated
  attack mechanics were WRONG. `checkRateLimit` INCREMENTS on every
  admitted request (`bucket.count += 1`, auth.ts `:304`), and
  `decrementRateLimit` fires only on the success path AFTER that
  increment — so **a successful login nets 0, not −1** (its decrement
  returns its OWN +1, never a prior fail's), and the described
  "fail-on-victim +1 with self-success −1" alternation actually nets +1
  per pair (tripping at 80 requests = the designed 2× bound; the
  per-account guessing bounds hold regardless). **The REAL unbounded
  door is the SUCCESS-ONLY loop**: under the documented default posture
  (open registration + in-band OTP → scriptable own credentials), one
  attacker account loops CORRECT-credential logins — each burns the full
  synchronous scrypt pair (~0.5 s class, event-loop-blocking) while
  netting 0 on `loginGlobal:` and RESETTING both per-keys
  (`login:${ip}` at `:147`, `loginAcct:` at `:148`) — so NOTHING binds
  the loop: ~24-37× the intended 40/15-min containment, the exact CK1
  single-worker-starvation shape reopened by the S138/CM3 decrement. The
  `authBurnGlobal:` family carries the same shape (per-user keys cap a
  single account at 10/15-min, but the account fleet grows +40/15-min
  through the never-discharged `registerGlobal:` — the CN9 asymmetry —
  and each success nets 0 on the shared aggregate). **The fix is §2
  (DB1).**
- **B-L2-audit (Verified at `src/app/export/page.tsx`):** the page
  renders the full envelope per authed view (20 `count` queries at
  `:21-63` + `renderExportEnvelope` at `:106` — the 20-`findMany` read +
  serialize + byte-count, byte-identical work to the budgeted download)
  with NO rate budget while its route twin rides `export:${user.id}`
  10/15-min. The e2e interplay measured: per chunk-5 boot the demo user
  does 3 full page renders (s21 ×2 at `:89`/`:143`, s23 ×1 at `:259`) +
  the s23 fresh user 1 (its own key) + 2 anon redirects (gated before
  any budget) — the shared-key variant would consume 3-of-10 on the demo
  key and risk mid-suite 429s; the dedicated key has 7-of-10 headroom.
  **The fix is §3 (DB2).**
- **N1 (L, new — Verified code order / Reasoned impact):** the three
  process-wide globals gate BEFORE body validation (the documented
  convention — login `:60` "invalid payloads consume budget"), so ~40
  garbage-body POSTs (zero scrypt cost — the burn sits after parse) pin
  `loginGlobal:`/`registerGlobal:`/`authBurnGlobal:` (the reset-password
  door needs no session) → sitewide 15-min lockouts renewable at ~40
  cheap requests/window. This is the fixed-window trade-off the CF2
  family already half-documents; the re-order alternative (parse before
  the global) would un-bound the garbage flood entirely. **Adjudicated:
  documented as the accepted trade-off (DB4) — the re-order is its own
  interplay study, not this cycle's rider.**
- **N2 (L, new — Verified at three sites):** the pre-CM3 "success-RESET"
  semantics survive in `change-password/route.ts:67-69` ("a success nets
  -1" — it nets 0), `docs/DEPLOYMENT.md` §3's TRUSTED_PROXY_HOPS cell
  ("it resets with the 15-minute window or any successful login" — false
  since S138/CM3, operator-facing), and the s16 CK1 pin's clean-slate
  comment (`:153-161` "one successful demo login zeroes the global
  bucket" — a success nets 0; the pin passes because the chunk carries
  zero prior login FAILS, not because the warm resets anything).
  **Fixed as DB3 (the honest-language sweep, folded into DB1's comment
  pass).**
- **N3 (I):** `verifyEmailSchema` is a unit-pinned reference atom, not
  the route's boundary schema (the route's relaxed local parse +
  post-parse normalization is documented in-file) — recorded, no action.
- **N4 (I):** the audit axis's data-import path is `src/lib/data-import.ts`
  (pure seam, correctly outside `server/`) — recorded for the next
  rotation's file list.

## §2 DB1 — the capped discharge (B-M1, the corrected mechanics)

**The design.** `decrementRateLimit` gains a per-window discharge
ceiling: the `Bucket` shape carries a `discharges` counter; a decrement
applies only while `discharges < MAX_DISCHARGES_PER_WINDOW` (20). The
five call sites (login `:149`; change-password `:70`; reset-password
`:107`; change-email `:80`; delete-account `:57`) keep the call verbatim —
the cap is internal to the seam, so the existing census legs
(script-conventions `:591-612`, `:899-908`, `:1131`) stay green and the
function name carries no churn.

```ts
type Bucket = { count: number; windowStart: number; discharges: number };
const MAX_DISCHARGES_PER_WINDOW = 20;

export function decrementRateLimit(key: string): void {
  const bucket = buckets.get(key);
  if (bucket && bucket.count > 0 && bucket.discharges < MAX_DISCHARGES_PER_WINDOW) {
    bucket.count -= 1;
    bucket.discharges += 1;
  }
}
```

A fresh window re-arms the allowance (the bucket is re-created with
`discharges: 0` on the first check after expiry — the rollover IS the
reset). `resetRateLimit` (the per-key full delete) is unchanged; the
per-IP/per-account keys never call the decrement.

**The bound.** Post-fix, the success-only loop: successes 1-20 net 0
(the discharge allowance), successes 21+ net +1 each → the loop trips at
60 admitted requests per window (M + D = 40 + 20) — the containment leak
ceiling 1.5× the intended 40/15-min, against the current unbounded ~24-
37×. The alternation shape (fails + self-successes): D free successes +
M fails = the same 60-request bound. The `authBurnGlobal:` family gets
the identical bound. The per-account guessing bounds and the per-IP
budgets are untouched.

**The sizing doctrine (D = 20).** D = 2× the per-IP budget (10) = M/2 —
the aggregate-discharge ceiling expressed in the family's own units. The
e2e constraint (the deferral's "budget-arithmetic study", measured by
direct read of every chunk-5 login leg): chunk 5 runs **52 login POSTs
per boot — 13 successes (auth.setup 1 + auth.spec 3 + auth-flows 5 +
s24 2 + s25 0 + s26 2) and 39 fails** → the live `loginGlobal:` count
reaches **39/40 today** (every success nets 0 under the CURRENT model
too — the decrement is not new), and the cert's 614/614 proves no leg
ever sees a 429. **D = 20 > 13 successes ⇒ the per-boot count is
BYTE-IDENTICAL pre/post DB1** (the cap only binds when a window's
successes exceed 20 — chunk 5's 13 never do), so the cert arithmetic is
unchanged by construction; the margin story (7 successes of D-headroom,
1 count-of-40 headroom on fails) is recorded here and in the AGENTS
lesson. The authBurnGlobal arithmetic: 17 POSTs (auth-flows 3 +
s24 4 + s25 4 + s26 6), ≤ 8 successes → count ≤ ~12/40 either way.
Chunk 3's CK1 flood pin (the terminal 41-flood leg): the warm login
consumes 1 discharge (D 20→19 with the setup project's success, 18 at
pin time), the 41 floods are all fails (+41, no discharge involvement)
→ **first429 stays exactly 41 — the pin's assertions survive
byte-identical**; only its comment is rewritten (DB3 — the warm nets 0;
the count at pin start is the chunk's prior FAIL count, which the cert
arithmetic holds at zero: parity-session5 + resilience + s16's earlier
tests carry no login POSTs).

**The comment pass (with DB3 folded in).** The corrected net-0 language
lands at: auth.ts's `decrementRateLimit` doc comment (the S153/DB1
rationale: the S152 plan's alternation model corrected; the success-only
loop is the real door; the cap's bound), the login route's `:130-149`
block, the four burn routes' discharge comments (change-password
`:67-69`'s "nets -1" → "nets 0 — the decrement returns the success's own
check-increment; the S153/DB1 cap bounds the success-only loop at
M+D"), DEPLOYMENT.md's TRUSTED_PROXY_HOPS cell (the success-reset claim
→ the net-of-successes + the D-cap language), and the s16 pin's
clean-slate comment (the honest arithmetic).

## §3 DB2 — the export-page budget (B-L2-audit)

**The design.** The page gains a dedicated per-user page budget after
the auth gate (the DA4 doctrine — auth precedes every other gate; the
anon redirect at `:18` stays budget-free) and BEFORE the 20-count +
envelope work:

```tsx
const pageLimit = checkRateLimit(`exportPage:${user.id}`, 10);
if (!pageLimit.ok) {
  return (
    <main className="mx-auto w-full max-w-3xl p-6 pt-10">
      <div role="alert" className="sf-alert-amber rounded-lg px-3 py-2 text-sm">
        Too many export page views. Please wait a few minutes and try again.
      </div>
    </main>
  );
}
```

- **Key `exportPage:${user.id}`, 10/15-min** — the `export:` family's
  sizing on a DEDICATED key (the shared-key variant measured against the
  s21/s23 arithmetic: 3 demo renders of 10 — the deferral's mid-suite
  risk; dedicated leaves 7-of-10 headroom + the s23 fresh user rides its
  own key).
- **The rate-limited render is the cheap path by construction** — the
  check precedes the 20 `count` queries and the full envelope build, so
  a scripted loop pays one `getCurrentUser` cookie verify and a ~200-
  byte render per request; the CPU/memory door (the envelope
  materialization) is closed at 10/15-min.
- **The amber alert rides the `sf-alert-amber` utility** (the S92/AS1
  family; the hue-tokens CONSUMERS register gains the page entry — the
  machine-guard extends to the new site).
- **A page component cannot answer 429** (App Router pages render 200 or
  redirect); the honest render + `role="alert"` is the documented shape,
  consistent with the app's alert family and screen-reader announced.

**The e2e pin (fresh-user, the BZ5 lesson — the demo user is never
mutated):** in s21-data-export.spec.ts, register + verify a throwaway,
then 11 authed GETs of `/export` on its session — the first 10 render
the panel (the count grid), the 11th renders the rate-limited alert. The
demo user's `exportPage:` bucket is untouched (per-user key), so the
s21/s23 demo legs and the s23 fresh-user leg are unaffected regardless
of file order. The throwaway's register (+1 registerGlobal — chunk 5's
27th of 40) and its logins (successes net 0) fit the measured budgets.

## §4 DB3 + DB4 — the doc riders

- **DB3** — the N2 drift trio, folded into DB1's comment pass (§2): the
  change-password comment, the DEPLOYMENT.md cell, the s16 pin comment.
- **DB4** — the N1 note in DEPLOYMENT.md's limiter cell: the three
  process-wide globals gate before body validation by design (the
  bounded-reader + anti-bypass convention), so a ~40-request garbage-
  body flood (zero scrypt cost) pins the respective global for the
  window — the accepted fixed-window trade-off (self-healing at
  rollover, Retry-After served, per-account guessing bounds unaffected);
  the re-order alternative (validation before the global) would un-bound
  the garbage flood and is rejected.

## §5 Scoping, deferrals, the e2e interplay study (measured, not assumed)

- **The RED inventory (planned): +4 unit legs + 2 e2e pins.**
  - auth.test.ts +2: (1) the cap binds — a window's 21st discharge is a
    no-op (the count keeps the +1); (2) the rollover re-arms — a fresh
    window (fake timers +15 min) grants a fresh allowance. The three
    existing decrement legs (small numbers, ≤ 3 discharges) stay green —
    the cap is additive, no test weakened.
  - script-conventions.test.ts +2: (3) the DB1 census leg — auth.ts
    declares `MAX_DISCHARGES_PER_WINDOW = 20` and the decrement guards
    on it (the structural pin); (4) the DB2 census leg — the export page
    carries `checkRateLimit("exportPage:"` before the counts (the
    ordering pin, the CE6 census family extended to the page door).
  - e2e +2: (5) the DB1 success-loop trip pin — parity-session8.spec.ts
    (chunk 1's alphabetically-LAST file) appended as its LAST describe:
    register + verify a throwaway, then self-calibrating correct-
    credential logins until 429 (cap 80; assert tripped && ≤ 61 && every
    prior status 200). Pre-fix: the loop NEVER trips (every success nets
    0, unlimited discharges) → tripped=false → the RED discriminator.
    Chunk 1's budget fit: prior loginGlobal spends = the setup success
    (net 0) — the pin's own register is registerGlobal's 2nd of 40; the
    pin leaves loginGlobal tripped, so its terminal position is required
    (nothing after it in the chunk logs in). Wall-time cost ~30-45 s
    (60 × the scrypt pair — the containment's own currency; the pin's
    setTimeout 120 s). (6) the DB2 page-budget pin (§3).
- **Unit census 1578 → 1582 (+4) · e2e census 614 → 616 (chunk 1
  150 → 151, chunk 5 89 → 90) · census 2192 → 2198.** The cert runner's
  header re-tags; the vitest header re-anchors; the doc chain
  (README badge + the Session-153 row, AGENTS census + the S153 lessons,
  CLAUDE, PAD v1.3.61, SKILL census) follows.
- **The hue-tokens CONSUMERS register** gains the export page entry
  (`sf-alert-amber`) — the register is data for the existing sweep leg,
  not a new test.
- **Deferred (recorded, with reasons):** the A-M3 ADR-021 stage-2 chunked
  sub-tx + resume token (its own cycle, carrying the S150/B-L2 import
  lock-hold finding); the db-path percent-decode (the db-path-family
  cycle); N1's re-order alternative (rejected — §4); the N3/N4
  informational notes (recorded in §1). The B-I2 force-dynamic
  adjudication stands (the S152 record).
- **The `.env.example` contract:** no env-var reads change this cycle —
  re-verified at close.

## §6 As-executed close

**Executed as planned with ONE placement correction (the mid-cycle
record, below).** The RED inventory: the unit REDs **4/4** (the DB1 cap
pair — each failing on the count-returned-to-0 pre-fix shape — + the
DB1/DB2 census pair, each failing on the absent markers) **+ the two
e2e pins RED-verified on the pre-fix build** (the DB1 success-loop pin:
80 iterations, never tripped — the designed discriminator; the DB2 page
pin: all 11 views rendered the panel). One e2e RED-leg authoring bug
fixed DURING the RED phase (the DB2 pin's "What's included" locator —
the apostrophe HTML-escapes to `&#x27;`; the discriminator moved to
"Download JSON"); one census-leg authoring bug fixed during GREEN (the
DB2 envelope anchor matched the IMPORT, not the call — the anchor moved
to the call form `renderExportEnvelope(publicUser(user))`).

**The mid-cycle correction (the plan's §5 s21 placement died on
measured reality).** The DB2 pin's first home (s21-data-export, chunk
5) broke s26's round-trip — twice, deterministic in the full-chunk
context, passing in every subset. Root-caused by TRACE: register #1 →
200, register #2 (the s26 helper's re-issue) → **429 "Too many
registration attempts"** → a codeless response → the verify's uniform
400. The chunk-5 `registerGlobal:` budget sits at **40/40 EXACTLY**
(measured: 37 by a self-calibrating probe spec across the pre-s26
files + s26's 3; the S136-era "≤ 3 per chunk" sizing comment had rotted
13 cycles — five register sites were invisible to the
`post("/api/auth/register"` grep). The pin relocated to
**navigation.spec.ts (chunk 1, before the DB1 terminal pin in
parity-session8)** — the CK1 budget-driven pin-home doctrine; the stale
sizing comment corrected to the measured arithmetic; the vitest header
+ the cert re-tag + this close carry the relocation note.

**Interim gates: lint ✓ · tsc ✓ · unit 1582/1582** (48 files, +4
exactly as designed) **· build ✓** (exit 0; the 6 documented warnings;
the cap guard `discharges<20&&…` and the page's amber render verified
shipped in the standalone chunks).

**The targeted e2e + the cert.** Chunk 1 **152/152 first-pass** on the
clean environment (the earlier 151/152 carried the BU7 leg —
root-caused by a live 5-round repro on an isolated :3200 host: the
exam-create POST 500s under co-resident load [the P1008 machine-load
class] while the clean rounds pass byte-exact; closed by the clean
first-pass). Chunk 2 **189/189 first-pass**. Chunk 3 **91/91
first-pass** on the re-run (the cert-run attempt was contaminated by
the orchestrator's own parallel repro — 11 failures under the
self-inflicted load, invalid by construction; the standalone attempt
carried one AK1d P1008 flake closed by the isolation pass + the
identical-combo first-pass). Chunk 4 **95/95 first-pass**. Chunk 5
**89/89 first-pass** (the s26 round-trip green after the relocation).
**The e2e census 616/616 (was 614) · census 2198 green** (was 2192).

**The operational traps hit and closed en route (all self-inflicted,
all documented in the session log):** the first cert-runner launch was
REAPED (the tool-call shell exits — the daemon-start lesson applies to
the cert runner; the setsid recipe fixed it); **editing the cert script
WHILE bash was running it** corrupted the read offsets (bash reads
scripts incrementally — the never-build-during-e2e lesson's sibling:
never edit the runner during a run; chunk 5's own result was already
complete at 89/89); and the BU7 investigation host hit the
deleted-inode + CWD-anchoring traps in sequence (a bare `prisma db
push` anchored at the CWD created a stray `../db/custom.db` — cleaned;
the :3200 repro server restarted after the proper schema-anchored
push + seed).

**Evidence.** Three `docs/screenshots/153-clone-*.png` frames (the
standing desktop + the standing mobile drawer — the 68th drawer-GREEN
companion — + the export page's rate-limited amber render [DB2's
visible proof, the capture script awaiting the alert text before the
frame]), self-verifying (the capture script's JSON verdict ok:true;
dimensions machine-checked 1440x900 / 390x844). The DB1 cap's proof
rides the unit pair + the wire pin (the CW2 runtime-split precedent).

**Docs.** README badge/census (2192 → 2198) + the unit/e2e prose sites
+ the Session-153 row; AGENTS census + the S153 lessons block (four
lessons); CLAUDE counts; PAD v1.3.61 (the revision block); the SKILL
census (all four sites); the vitest header re-anchor (+4 with the
relocation note); the cert runner re-tag (Expected 616 + the S153
block) + the CC2 tripwire re-anchor; the DEPLOYMENT.md N2 fix + the N1
note; `docs/session_179.md`; the worklog Session-164 entry; this close;
the `.env.example` contract re-verified (no env-var reads changed this
cycle).

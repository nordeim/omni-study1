# Remediation Plan — Session 154 (Cycle 104, Batch DC)

> Status: PLANNED (pre-change record — the immutable plan; the as-executed
> close lives in §6). Written before any source change, per the standing
> doctrine ("write the cycle plan into docs/remediation-plan-sessionN.md
> BEFORE any source change").
>
> Operator directive: refresh the workspace, re-read the doc chain
> (AGENTS/CLAUDE/README/PAD/SKILL + session_179/180 +
> remediation-plan-session153 + worklog), validate against the codebase,
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

**Workspace (a FRESH clone at `b6df05f` on `main` — the Batch DB fix
`2914f0d` + the operator's session_180 transcript commit; the sandbox had
been reset, so the environment was re-provisioned from zero: `.env` copied
from `.env.example` at the documented dev posture, `db/` created at the
repo root + `db:push` + `db:seed`, `bun install` (510 packages), the
Playwright chromium cache re-provisioned — the S103 lesson-1 class,
`bunx playwright install chromium`).**

**Cold baseline (before any work): lint ✓ · tsc ✓ · the full Vitest run
1582/1582 (48 files — the documented S153 final state exactly) · the dev
daemon preflight GREEN (hydrated, navigation-stable) · the drawer check
GREEN (the 69th consecutive no-Tailwind-v4-mobile-nav-bug confirmation —
backdrop oklab(0 0 0 / 0.2) + blur(4px); 288px white panels; 20 links; no
footer; Escape-close superset) · the desktop chrome probe MATCH (all five
formal checks, live reference login — sidebar 260/20 links/first-links/
mainX 260/mainWidth 1180).** Baseline noise: none.

**The fix scope (the S153 close's named candidates, adjudicated).** The
S153 close named the **A-M3 ADR-021 stage-2 chunked sub-tx + resume
token** (carrying the S150/B-L2 import lock-hold finding) as the cycle
core. Adjudication (the operator's standing best-judgement instruction):
the S141 deferral made stage-2 CONDITIONAL — "Stage-2 remains the named
candidate **if measurement shows a residual window**" — so the cycle's
first duty was the measurement, and the measurement ANSWERS (§1): the
sequential update loop measures **0.32 ms/row on this build — 32 s at the
IMPORT_MAX_ROWS cap, inside the 60 s timeout with 1.9× headroom** — the
full stage-2 (breaking the all-or-nothing ADR-021 contract) is NOT
justified by measurement and stays deferred, now on a measured record
instead of a cautionary one. The cycle instead ships the
**contract-preserving availability move the measurement DOES justify**
(the no-op update elision — the audit-B recommendation, independently
derived) + the audit's four L findings (the questions item-shape mirror,
the ADR-021/AGENTS.md reconciliation pair, the write-only negative
census). The two I findings (the export peak-memory residual, the
verified non-gaps) are recorded here only.

## §1 The audits (Mode-C; every M/L finding re-verified by direct read by the orchestrator)

### Audit A — the Batch DB recent-changes axis (the `2914f0d` diff)

**0C / 0H / 0M / 0L / 0I — clean.** All four DB claims verified DELIVERED
at the source level: DB1's capped discharge (`MAX_DISCHARGES_PER_WINDOW
= 20` exported at auth.ts, the `Bucket.discharges` counter minted at 0 in
`checkRateLimit`, the decrement guarded `discharges <
MAX_DISCHARGES_PER_WINDOW`, all five call sites verbatim — change-email
`:80`, change-password `:76`, delete-account `:57`, login `:157`,
reset-password `:107`) + DB2's export-page budget (the dedicated
`exportPage:${user.id}` 10/15-min after the auth gate at export/page.tsx,
before the 20 counts + the envelope, the honest amber render) + DB3's
drift sweep (DEPLOYMENT.md's TRUSTED_PROXY_HOPS cell + the s16 CK1 pin
comment both carrying the corrected net-0 language) + DB4's N1 note (the
garbage-flood fixed-window trade-off, documented). The doc census
machine-verified: README badge 2198 ✓ · AGENTS 1582 ✓ · CLAUDE 1582 ✓ ·
PAD v1.3.61 ✓ · the vitest header (48 files / 1582) ✓ · the cert runner
re-tag (Expected 616) ✓ · the hue-tokens register entry
(`src/app/export/page.tsx` → `sf-alert-amber`) ✓ · the register route's
measured 40/40 comment ✓ — **zero stale sites**. The e2e pins verified at
their homes: the DB2 page-budget pin (navigation.spec.ts:1087, chunk 1)
and the DB1 success-loop pin (parity-session8.spec.ts:1663, chunk 1
terminal).

### Audit B — the data-portability / import-restore rotation (the fix surfaces, swept at S148 and six cycles grown)

The axis read dispatched to a read-only subagent against the
web-application skill's §4/§6/§7/§16/§17 rubric (the S148–S153
precedence): the import route + the data-import seam + export-build +
both export routes + the export page + the export panel + the unit pins +
the s21/s23 e2e contracts + the schema's imported shapes. **Verdict:
0C / 0H / 0M / 4L / 2I.** No injection, authz, secret-handling, or
enumeration defect in the axis (all Prisma calls parameterized; the
notes HTML sanitized pre-tx; `files.url` http(s)-only + mime
charset-guarded; `stripSecrets` coverage complete for the 20 imported
models; the profile patch a closed 7-key whitelist). The findings:

- **B-L2 (the standing deferral, re-verified + now MEASURED):** the
  sequential per-row update loop inside the single 60 s write-only
  transaction (route `:575-578`) — up to IMPORT_MAX_ROWS sequential
  awaited writes. **The S141 condition ("stage-2 if measurement shows a
  residual window") answered by a scratch probe** (the exact tx shape —
  sequential updates + chunked createMany inside `$transaction({ timeout:
  60_000, maxWait: 5_000 })` — against a throwaway `db/measure.db`):
  **1k rows = 430 ms · 10k = 3.5 s · 50k = 16.0 s · 100k = 32.0 s
  (0.32 ms/row, linear)** — the cap-sized all-updates envelope fits the
  60 s timeout with 1.9× headroom on this build (the S141-era 0.6 ms/row
  estimate was 2× pessimistic — the CP3 restructure + the CC10 composite
  index + this machine). The full-row probe (the elision's read cost)
  measures **2.1 s at the same cap — 15× cheaper than the writes it can
  elide**. Adjudication: the stage-2 chunked sub-tx + resume token stays
  deferred (the measurement does NOT show a residual window at the cap on
  this hardware; a 2× machine-load slowdown — the documented P1008 class
  — clips the tail to the honest 413 + full rollback, bounded per
  attempt); the cycle ships the **no-op update elision** instead — the
  dominant heavy case is the IDEMPOTENT RE-IMPORT (restore over a
  mostly-unchanged account — the e2e suite's own scenario), and the
  elision collapses it from N lock-held writes to ~0 at read-cost.
  **The fix is §2 (DC1).**
- **L1 (Verified — the cycle's one code-behavior gap):** the
  `practiceTests.questions` item-shape parity gap — the members
  precedent's missed twin. The interactive atom refines EVERY item
  (object + `question: string` + `type ∈ {multiple_choice, true_false,
  short_answer}`, validation `:436-457`), while the import's
  JSON_STRING_FIELDS pass checks string-ness + parse + array-ness only —
  so `'["garbage"]'` persists a practiceTests row every interactive route
  would 400 (violates the CB11/CA14 parity contract).
  `studyGroups.members` — the other item-shaped atom — got its item-shape
  mirror at S139/CN1; `questions` never did. Client degrades gracefully
  (parseQuestions silently drops malformed items) — hostile-self-import
  only. **The fix is §3 (DC2).**
- **L2 (Verified):** ADR-021's Decision text is stale on two counts —
  "`IMPORT_MAX_BYTES` (25 MiB …)" (64 MiB since S137/CL2) and "per row a
  userId-scoped `findFirst` then `update`/`create`" (the write-only
  restructure shipped at S141/CP3 — no in-tx `findFirst` exists). The
  BW4 reconciliation convention applies. **The fix is §4 (DC3).**
- **L3 (Verified):** AGENTS.md's import row (`:109`) stale on three
  counts — the 25 MiB cap, "the knownIds loop AND the write loop's
  findFirst", and "exactly 9 import POSTs … no other spec posts the
  route" (the s23 header's own S145/CT4 recount documents 10 demo POSTs
  + resilience's 9 + s14-hardening's fresh-user POSTs — the S92/A4-era
  exclusivity claim was false and the s23 header already says so).
  **The fix is §4 (DC3).**
- **L4 (Verified):** the write-only-tx property is pinned only by
  presence-markers (the S141/CP3 census asserts the probe/createMany/
  sanitize/collision markers exist) with NO negative pin — a regression
  that re-interleaves a read inside the `$transaction` callback while
  keeping the markers ships green. The route currently contains ZERO
  `.findFirst(` call forms (verified by grep — only comment mentions
  survive). **The fix is §4 (DC4).**
- **I-A (Reasoned):** the export's peak memory remains O(account) despite
  the CW2 ceiling (all 20 findMany sets + stringify + the byte-size
  encode before the 256 MiB gate) — the documented streaming/A-M3
  residual; recorded, no action short of streaming.
- **I-B (Verified non-gaps, recorded):** the update branch's unscoped
  `where: { id }` is gated by the ownership-scoped probe + the unscoped
  collision pre-flight (the accepted TOCTOU class, route `:49-52`); the
  64 MiB `JSON.parse` preceding the row-cap check is the documented CS5
  trade-off.
- **N3/N4 (the S153 informational notes, closed by this audit's
  re-verification):** the verifyEmailSchema reference-atom comment is
  still accurate (verify-email route `:33-41` — the relaxed boundary
  schema + the strict atom referenced by comment only); data-import.ts is
  correctly a pure seam outside `server/` (two import statements:
  ./validation + ./data-export — nothing server-only, client-safety
  proven by the panel's own import of IMPORT_MAX_BYTES).

## §2 DC1 — the no-op update elision (B-L2's contract-preserving answer)

**The design.** A new pre-tx pass, placed AFTER the collision pre-flight
and immediately BEFORE the transaction (the last read pass — the smallest
elision→tx window): for every collection carrying update-branch rows,
read the FULL stored rows (no `select` — all scalar fields) in
`chunkImportIds` chunks under the collection's ownership scope (the
cards deck-scope included), then drop from `plan.updates` every row whose
planned payload is a provable no-op. The pure diff lives in the seam:

```ts
// S154/DC1: the no-op update elision's diff — conservative by design.
export function plannedUpdateIsNoOp(
  stored: Record<string, unknown>,
  planned: Record<string, unknown>,
): boolean {
  for (const [key, value] of Object.entries(planned)) {
    if (value === undefined) continue; // Prisma's skip semantics
    const current = stored[key];
    if (current === undefined) return false; // not in the stored row
    if (current === null || value === null) {
      if (current !== value) return false;
      continue;
    }
    if (current instanceof Date) {
      // the envelope carries DateTime as ISO strings; the stored row as Date
      if (typeof value !== "string") return false;
      const t = Date.parse(value);
      if (Number.isNaN(t) || t !== current.getTime()) return false;
      continue;
    }
    if (typeof current !== typeof value) return false;
    if (typeof current === "object") return false; // no Json columns; a doubt
    if (current !== value) return false;
  }
  return true;
}
```

**The semantics (the load-bearing choices).**
- **Diff over PLANNED keys only** — exactly Prisma's update semantics
  (absent keys never ride the write), so "the update would change
  nothing" is proven iff every planned key already holds its value.
- **Conservative failure direction:** any doubt (a key missing from the
  stored row, a typeof mismatch, null-vs-value, an unparseable date, an
  object value) keeps the write — the write is today's behavior, the
  skip is the optimization. A false "not equal" costs one redundant
  write; a false "equal" is impossible by construction (equality is
  proven key-by-key, never assumed).
- **Date↔ISO comparison:** the stored row's DateTime fields are `Date`
  objects; the envelope's are ISO strings; the export's own serialize →
  JSON.parse round-trip recovers the exact ms, so an untouched
  `updatedAt`/`createdAt`/`dueDate` compares equal — a row TOUCHED since
  the export (updatedAt moved) correctly keeps its write.
- **Counted-as-updated wire:** the elided rows join the `updated` counter
  (the idempotence pin expects `updated: 3` on a re-import where every
  row is a no-op — the wire shape is UNCHANGED by construction; the
  response's `created`/`updated`/`total` and the per-collection
  `imported` report stay byte-identical).
- **The P2025 door stays open for changed rows:** a row that vanishes
  between this pass and the transaction keeps its write only if the diff
  ran against it — the pass skips (elides) a row only when the full
  stored row was READ and proven equal, so a vanished row either (a) was
  read as equal and then vanished (the pass→tx window, milliseconds —
  the silent-skip narrowing, joining the documented accepted read-hoist
  TOCTOU class at route `:49-52`), or (b) was kept as changed and the
  tx's P2025 answers the named 409 exactly as today.
- **The re-import round-trip is elided by construction:** the first
  import CREATES the rows from the envelope (explicit createdAt/updatedAt
  preserved); the re-import's update payloads are the identical fields —
  the diff proves equality and the writes drop to ~0.
- **Memory:** the full-row read is bounded by the envelope's own update
  set (the probe reads envelope ids only — at most the 64 MiB envelope's
  rows), pre-tx, no lock; the measured cost 2.1 s at the 100k cap.

**The route's comment pass.** The route header's shape note + the write
banner gain the S154/DC1 language (the measurement record + the elision +
the narrowing trade-off), and the tx loop's `imported[collection]`
assignment gains the elided count.

## §3 DC2 — the practiceTests questions item-shape mirror (L1)

**The design.** The mirror lands in `sanitizeImportRow`'s JSON pass
beside the members branch, copying the ATOM's predicates verbatim (the
round-trip contract outranks niceties — never stricter than the
interactive atom):

```ts
if (collection === "practiceTests" && field === "questions") {
  // S154/DC2: the ITEM shape — the interactive atom refines every item
  // (object + question string + the three-member type vocabulary); the
  // import's array-ness check alone admitted '["garbage"]' (the members
  // mirror's twin, 15 cycles late).
  for (const item of parsed) {
    if (
      typeof item !== "object" ||
      item === null ||
      typeof (item as Record<string, unknown>).question !== "string" ||
      !["multiple_choice", "true_false", "short_answer"].includes(
        String((item as Record<string, unknown>).type),
      )
    ) {
      throw new ImportRowError(
        collection,
        index,
        'field "questions" items must each be an object with a question and a type (multiple_choice, true_false, or short_answer).',
      );
    }
  }
}
```

No per-item length bounds (the atom carries none — the whole-blob
100k-char bound at the field cap already governs).

## §4 DC3 + DC4 — the doc riders + the negative census

- **DC3a — ADR-021's Decision reconciliation** (the BW4 convention): the
  25 MiB → 64 MiB (S137/CL2) + the findFirst→write-only-shape (S141/CP3)
  corrections, with the S154/DC parenthetical naming the reconciliation
  and the elision; the historical Consequences counts stay (they are
  records, not claims about today).
- **DC3b — AGENTS.md's import row** (`:109`): the 64 MiB cap, the
  probe-only read shape (+ the elision pass), and the honest budget
  language (s23's 10 demo POSTs at zero headroom + resilience's 9 +
  s14-hardening's fresh-user POSTs — the chunk map is the safety, citing
  the s23 header's own S145/CT4 recount).
- **DC4 — the census pair** (script-conventions.test.ts, the S141/CP3
  census family extended): (1) the WRITE-ONLY negative pin — the route
  contains no `.findFirst(` call form (the comment mentions survive; the
  CALL is the property); (2) the elision census — the route carries the
  S154/DC1 marker + the `plannedUpdateIsNoOp` call + the
  counted-as-updated arithmetic.

## §5 Scoping, deferrals, the e2e interplay study (measured, not assumed)

- **The RED inventory (planned): +6 unit legs, +0 e2e legs.**
  - data-import.test.ts +3 (the DC1 diff pair): (1) the identical row
    elides (Date↔ISO, nulls, primitives — the re-import shape) → true;
    (2) a changed value never elides (a string field, a date field, a
    number) → false; (3) every doubt keeps the write (a key missing from
    the stored row; a typeof mismatch; null-vs-value; an unparseable
    date; an object value) → false. Dynamic-import form (the S139/:1095
    precedent) so the RED fails on the missing export at the leg, not at
    the file's import.
  - data-import.test.ts +1 (the DC2 mirror): the bad-shape family
    (a non-object item; a wrong type vocabulary) rejects with the named
    copy; the valid shape passes — the members-mirror test pattern.
  - script-conventions.test.ts +2 (the DC4 census pair + the DC1 census
    markers, folded): the write-only negative pin + the elision markers,
    each RED on the absent markers.
  - **No e2e legs BY DESIGN** (the CV1 runtime-split precedent): the
    elision is wire-invisible by construction (the counted-as-updated
    contract) — the proof rides the unit pair + the censuses + the
    s23/resilience re-cert (the idempotent re-import pin IS the elision's
    behavioral leg: all three rows elide, the wire still says updated: 3;
    the CL1 equal-times round-trip leg rides the same path).
- **Unit census 1582 → 1588 (+6) · e2e census 616 (unchanged) · census
  2198 → 2204.** The cert runner's header re-tags; the vitest header
  re-anchors; the doc chain (README badge + the Session-154 row, AGENTS
  census + the S154 lessons, CLAUDE, PAD v1.3.62, SKILL census) follows.
- **The targeted e2e: chunk 3 (resilience — the import 413/409 family +
  the CL1 round-trip) + chunk 5 (s23-import — the round-trip, the
  idempotent re-import, the 400 family + rollback, the merge guards) —
  then the full 5-chunk cold cert** (the standing map; the budget
  arithmetic untouched — no new register or import POSTs anywhere).
- **Deferred (recorded, with reasons):** the A-M3 stage-2 chunked sub-tx
  + resume token — **now deferred on MEASUREMENT** (0.32 ms/row, 32 s at
  cap, 1.9× headroom; this plan §1) rather than on caution alone; the
  raw-SQL bulk upsert (the changed-rows tail's next step if profiling
  ever shows the 60 s budget pressed — the hand-rolled type-marshalling
  risk documented); the export streaming (the I-A residual); the db-path
  percent-decode (the db-path-family cycle); the N1 re-order alternative
  (rejected, DEPLOYMENT.md).
- **The `.env.example` contract:** no env-var reads change this cycle —
  re-verified at close.

## §6 As-executed close

**Executed as planned.** The RED inventory: the unit REDs **4/4** (the
DC2 questions-mirror leg failing on the no-throw pre-fix shape + the
DC1 diff trio failing on the missing export through the dynamic-import
form — each leg at its own designed failure, not a file-load error) **
+ the elision census RED** (the absent markers) **+ the DC4 write-only
negative census GREEN-on-arrival by design** (the route already
carries no `.findFirst(` call form — the CS3/CL9 precedent; the pin
documents the existing-good property, closing the L4 regression gap).
One capture-script authoring bug found and fixed DURING the evidence
phase (the panel's two-step — the picker arms the file, the Import
BUTTON fires the POST; the first draft awaited the result without
clicking).

**Interim gates: lint ✓ · tsc ✓ · unit 1588/1588** (48 files, +6
exactly as designed: data-import +4, script-conventions +2) **·
build ✓** (exit 0; the 6 documented warnings; the elision verified
shipped in the standalone chunk — the minified `Date.parse`/`getTime`
diff guard found by pattern).

**The measurement record (the plan §1's probe, preserved as
`scripts/measure-import-window-s154.mjs` + the evidence JSON):**
1k = 430 ms · 10k = 3.5 s · 50k = 16.0 s · 100k = 32.0 s (0.32 ms/row,
linear; the full-row probe 2.1 s at the cap) — the A-M3 stage-2 stays
deferred ON MEASUREMENT.

**The targeted e2e + the cert.** Chunk 3 **91/91 first-pass** cold
(resilience — the import 413/409 family + the CL1 equal-times
round-trip, the elision's second behavioral leg) · chunk 5 **89/89
first-pass** cold (s23-import — the round-trip, the idempotent
re-import [created=0, updated=3 with all three writes elided — the
elision's primary behavioral proof], the 400 family + rollback, the
merge guards; + the auth family untouched). The cold 5-chunk cert:
chunk 1 **152/152** · chunk 2 **189/189** · chunk 3 **91/91 on the
identical-combo cold re-run** (the cert-run attempt carried TWO
failures root-caused as the documented P1008 machine-load class — the
Prisma socket-timeout signature ambient in every chunk's WebServer
log, the files-upload legs; closed by the clean first-pass re-run,
the three-signal protocol) · chunk 4 **95/95** · chunk 5 **89/89** —
**616/616** (the e2e census unchanged by design) · **census 2204
green** (was 2198).

**The operational traps hit and closed en route (all self-inflicted,
all documented in the session log).** (1) The first backgrounded
chunk-3 run was REAPED mid-flight — the subshell-waiting form keeps
the descendant alive (the S110 descent lesson: the reaper kills by
descent; only an orphan escapes) — the foreground re-run was clean.
(2) **The S153 edit-the-runner-during-a-run lesson RE-OFFENDED** — the
cert header note was inserted at the top of `e2e-chunked-cert.sh`
WHILE bash executed chunk 2 (the in-place write shifted the post-loop
byte offsets under the running fd 255). Caught within the repair
window: the insertion REVERTED to the byte-identical original (`git
diff` empty) while the loop held chunks 3-5 in memory, so the cert
completed with its DONE line and exit code intact; the header note
re-applied AFTER the run. The lesson's sharpening: the rule needs its
RECOVERY recipe next to it — an in-place edit under a running bash is
recoverable IF the file is restored byte-identical before the parser
reads past its buffered position (verify with `git diff` + the fd's
inode).

**Evidence.** The `docs/screenshots/154-clone-*.png` frames (the
standing desktop 235 KiB + the standing mobile drawer 64 KiB [the 69th
drawer-GREEN companion frame] + the Restore card's completed re-import
result 224 KiB [the elision's user-visible wire proof — the capture
awaited the "Import complete" text before the frame]), self-verifying
(the capture script's JSON verdict ok:true; dimensions machine-checked
1440x900 / 390x844) + `docs/screenshots/154-import-elision-evidence.json`
(the wire round-trip — both imports 200 with created 0, updated 71,
the counted-as-updated contract — + the measurement table). The DC1
diff's proof rides the unit trio + the censuses + the s23/resilience
re-cert (the CW2 runtime-split precedent).

**Docs.** README badge/census (2198 → 2204) + the unit/e2e prose sites
+ the Data-portability feature row's elision note + the Session-154
row (the honest cert record); AGENTS census (1582 → 1588) + the import
row's three-count reconciliation (DC3b) + the S154 lessons block (four
lessons); CLAUDE counts; PAD v1.3.62 (the revision block + the ADR-021
Decision reconciliation [DC3a]); the SKILL census (all three sites);
the vitest header re-anchor (+6 with the no-e2e-by-design note); the
cert runner re-tag (applied post-run — see the trap record);
`docs/session_181.md`; the worklog Session-165 entry; this close; the
`.env.example` contract re-verified (no env-var reads changed this
cycle).

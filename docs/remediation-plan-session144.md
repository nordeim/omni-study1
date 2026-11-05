# Remediation Plan — Session 144 (Cycle 94, Batch CS)

> Status: PLANNED (pre-change record — the immutable plan; the as-executed
> close lives in §6). Written before any source change, per the standing
> doctrine ("write the cycle plan into docs/remediation-plan-sessionN.md
> BEFORE any source change").
>
> Operator directive: refresh the workspace, re-read the doc chain
> (AGENTS/CLAUDE/README/PAD/SKILL + session_159/160 +
> remediation-plan-session143 + worklog), validate against the codebase,
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

**Workspace (the 36th continuation).** Fresh clone at `88739ca` on `main`
(the Batch CR fix `7ada703` + the operator's session_160 transcript
commit). Environment provisioned per the recipe: `bun install` (510
pkgs), `.env` from `.env.example` (`DATABASE_URL="file:../db/custom.db"`),
`db:push` + `db:seed` (the demo account + seeded rows, `db/custom.db`
389 KiB), Playwright Chromium installed, the dev daemon live on :3000
(the S32 subshell recipe, verified stable across tool calls).

**Cold baseline (before any work):**

| Gate | Result |
|---|---|
| `bun run lint` | ✓ 0 errors |
| `bun run typecheck` | ✓ 0 errors |
| `bun run test` (Vitest) | ✓ 1490/1490 (48 files) — the documented S143 final state exactly |
| `node scripts/drawer-check-s14.mjs` (both hosts, live reference login) | GREEN — **the 59th consecutive no-Tailwind-v4-mobile-nav-bug confirmation** (backdrop oklab(0 0 0 / 0.2) + blur(4px); 288px white panels; 20 links; no footer; Escape-close superset) |
| `node scripts/parity-probe-s142.mjs` (both hosts, live reference login; REF_PROBE_* exported) | **DESKTOP CHROME: MATCH** — all five formal checks (sidebar outer width, nav link count, first-links order, mainX, mainWidth) |

**Baseline noise observed (recorded, not findings):** none.

**Probes run BEFORE the plan (the doctrine — probe, don't guess):** the
two audit subagents carried their own empirical probes (sanitize-html
2.18.1 default nonTextTags identity; happy-dom 21.0.4 template
`.content` semantics — children live in the inert fragment, NOT as
direct childNodes, same as Chromium; `Headers.append` throwing
TypeError on CR/LF values; `Array.shift` quadratic scaling measured at
n=5k/20k/80k → 0.7ms/284ms/8,212ms). All M/L findings below were then
re-verified by direct read of the current tree before this plan was
written (the anchors are in §1).

## §1 The audits (Mode-C, read-only subagents; every M/L finding re-verified by direct read)

Per the s143 closing directive — "the audit rotation continues (the
FE/views + auth/crypto/infra axis one cycle fresh; the **import/export +
data-portability axis two cycles stale**; the entities/factory axis just
swept)" — plus the standing recent-changes focus ("particularly on the
recent code changes"):

1. **Audit A — the Batch CR recent-changes audit** (the `7ada703` diff
   itself: the own-keys guard, the shared non-text-tag door, the typed
   import delegate, the sequence-CAS wiring, the importRestoreError
   seam, the dead-column drop, the comment trio): **0C / 0H / 1M / 2L /
   3I**. All nine CR claims verified TRUE at the source level — with
   one structural exception: **A-M1** — CR5's sequence-CAS is defeated
   at the call sites by PER-RENDER instantiation (below). The L:
   **A-L1** — the CR2 template rider fixed the unwrap branch but not
   the depth-cap collector's own child walk (`<template>` children live
   in `.content`, never as direct childNodes — the collector's
   `node.childNodes` reads nothing for a template, so template text
   nested ≥500 deep dies at the DOM door's collapse while the server
   door keeps it — the exact two-door family CR2 aligned); **A-L2** —
   the shared PrismaClientValidationError→400 leg (CR1's compounding
   fix) logs NOTHING, while the unknown-error branch it pre-empts logs
   — the leg's own comment names its target as "latent Zod↔Prisma
   shape drift" (a server-side bug), which is now SILENT in production
   logs. The Is: A-I1 the template-rider comment's stale happy-dom
   narrative (probed: happy-dom 21.0.4 keeps template children in
   `.content` — same as Chromium; the code is robust either way, only
   the comment's environment story is wrong); A-I2 the census-only
   call-site pins (the class that let A-M1 ship — folded into CS1);
   A-I3 test-hygiene nits (the fetch-seq test's unneeded happy-dom env
   tag; the ValidationErrorCtor double-cast — carried informational,
   §5).

2. **Audit B — the import/export + data-portability axis** (two cycles
   stale — `src/lib/data-import.ts` 1455 L, `src/lib/data-export.ts`,
   `src/lib/server/export-build.ts`, the import/export API routes, the
   export page + panel, the files family, and the full test coverage
   map): **0C / 0H / 2M / 2L / 4I**. The axis is in strong shape: the
   all-or-nothing ADR-021 transaction contract is genuinely delivered
   (every write inside the one 60s tx, no escape found — file blobs ride
   the `files.data` column inside it, all PKs are client-supplied cuids
   so no sequence bumps exist), auth/authz airtight on both doors (no
   id parameter on export; ownership probes + cross-account pre-flight
   409 on import), the note-HTML sanitize door wired and e2e-pinned,
   the hostile-key write-set pollution-free (empirically probed:
   `__proto__` with an object value is rejected by the row guard's
   primitive check BEFORE the copy; a primitive `__proto__` is a setter
   no-op; `constructor`/`toString` own keys reach Prisma as unknown
   fields → the named 400), and the prior findings (B-I1 grades
   maxScore, the byte-signal chain, the P2025 leg) all still closed.
   The M: **B-M1** — the folders topo sort's `queue.shift()` dequeue is
   O(n²) (measured: ~13 s at 10⁵ folders) — the only superlinear stage
   before the tx on an otherwise-linear path, so a single authenticated
   hostile import pins the single-threaded event loop sitewide
   (the rate limiter does not help — one request suffices; nothing
   persists — the sort is pre-tx); **B-M2** — the import route's
   `IMPORT_MERGE_GUARDS` wiring (the B-I1 mitigation itself — the
   UPDATE-branch protection against single-leg inverted rows) is pinned
   by NOTHING (zero test references; deleting the `mergeGuard.guard()`
   call or dropping a collection ships green through the whole suite).
   The L: **B-L1** — a hand-crafted `files.mime` containing CR/LF
   (≤100 chars) passes the import guard's LENGTH-only check, persists
   clean, then throws TypeError at `new NextResponse(headers)` on that
   file's download FOREVER (the 500-on-read taxonomy break; the throw
   fails closed so no header injection — hostile-self-import only, the
   row stays deletable); **B-L2** — no max-ROWS cap exists anywhere
   (only `IMPORT_MAX_BYTES` = 64 MiB bounds the BODY): a 64 MiB
   envelope of minimal rows parses into ~10⁶ row objects — several
   hundred MB resident per hostile request with no deadline (the
   parse-memory amplification; auth-gated and rate-limited, an
   availability risk not corruption). The Is: B-I1 the
   `parseImportEnvelope` wrapper's zero production callers (documented
   standing duplication); B-I2 the axis-inventory staleness (the import
   UI lives in `export-panel.tsx`, not settings-view; parity-session7
   carries no import/export legs — this plan's §3 anchors to the REAL
   surfaces); B-I3 the export scale state (no new hazard beyond the
   recorded buffered-export deferral); B-I4 the benign write-set
   nuances (the `{error}` envelope convention confirmed — no
   violations).

**Every M/L finding above was re-verified by direct read of the
current tree before this plan was written** — A-M1 at
settings-view.tsx:152/163/174 (the three `createFetchSeq()` calls sit
in the `AppearanceCard` function body — every render mints fresh
instances; the repo's own correct precedent is files-view.tsx:210
`React.useRef(0)`, "the ticket is component-instance-scoped, the React
idiom"); B-M1 at data-import.ts:363-364 (`while (queue.length > 0) {
const id = queue.shift() as string;` — the queue only ever GROWS during
iteration, children are pushed never removed, so a cursor preserves
the BFS order and the emitted guard exactly); B-M2 at
src/app/api/import/data/route.ts:113-129 + 323 + 451 + 477-480 (the
wiring exists and is correct — `grep IMPORT_MERGE_GUARDS tests/` →
zero matches); A-L1 at note-html.ts:111-136 (the collector's
`const kids = node.childNodes;` at :132 — vs the unwrap branch's
`.content ?? child` rider at :224-226); A-L2 at http.ts:251-263 (the
leg returns the 400 with no log — vs the unknown branch's
`console.error("[api] unhandled error:", err)` at :294); B-L1 at
data-import.ts:1352-1363 (the mime guard checks ONLY
`typeof mime !== "string" || mime.length > 100`) + files/[id]/route.
ts:21-24 + http.ts:444-452 (`downloadHeaders` puts the stored mime
directly into the Content-Type header value — the probed TypeError
class); B-L2 at data-import.ts:54 (IMPORT_MAX_BYTES is the only bound;
`totalRows` exists ONLY inside the test-only `parseImportEnvelope`
wrapper at :552-621 — the route never checks a row count).

## §2 Findings → the CS set

| ID | Source | Severity | Defect | Fix |
|---|---|---|---|---|
| CS1 | A-M1 (+A-I2) | Medium (state consistency — the exact class CR5 claims to fix, and it regresses the S142 different-value guard) | `createFetchSeq()` is called in the `AppearanceCard` function body — EVERY render mints fresh seq instances, so a newer pick runs through a NEW closure whose seq the earlier pick's catch never sees: every ticket is `1` on its own instance, `isCurrent` is always true, and the guard degenerates to the unconditional S127/CB15 rollback (the ABA survives; the S142 value-compare's different-value protection is LOST — a late-failing pick(A) after a newer pick(C) rolls the store back to pre-A, clobbering C while PATCH2 succeeds) | Hold the guard for the component's lifetime: `React.useRef(createFetchSeq()).current` ×3 (the files-view `useRef` idiom — instance-scoped, survives re-renders); a behavioral e2e leg (route-intercepted late-failing PATCH + newer pick, assert no clobber) + the census re-anchor |
| CS2 | B-M1 (measured) | Medium (hostile-envelope event-loop freeze — sitewide, single request) | The folders topo sort dequeues with `Array.shift()` — O(n) per call, O(n²) over the loop: measured ~13 s at 10⁵ folders, tens of minutes at the 64 MiB cap's ~10⁶ ceiling; the only superlinear pre-tx stage (sanitize + IN-probes are linear), so nothing else bounds it first | Cursor dequeue: `for (let qi = 0; qi < queue.length; qi += 1)` (the queue only grows during iteration — order and guards preserved exactly); a 100k-row perf/order unit pin with a time bound the shift form provably misses |
| CS3 | B-M2 | Medium (missing behavioral test on important logic — the unpinned wiring ships green through regression) | The import route's `IMPORT_MERGE_GUARDS` wiring (the UPDATE-branch merge guards — the B-I1 mitigation) has ZERO pins: no unit, no e2e, no census (the seam functions are pinned; the interactive delegates' wiring is census-pinned; the import route's copy is the unpinned third site) | Coverage pins (the missing-pin class, green-on-arrival like S137/CL9): a script-conventions census (the route carries IMPORT_MERGE_GUARDS + calls `mergeGuard.guard(`) + an e2e leg (a single-leg inverted grade row against a stored partner answers the named 400; the stored row unchanged) |
| CS4 | B-L1 (probed) | Low (taxonomy: stored bad input → 500-on-read, self-inflicted only) | The import mime guard is length-only — a stored `mime: "text/html\r\nSet-Cookie: pwn=1"` (≤100 chars) imports clean, then `new NextResponse(bytes, { headers: downloadHeaders(...) })` THROWS on the CR/LF Content-Type value → the generic 500 on every download of that row (the throw fails closed — no header injection; the interactive door can never mint it, only the import door) | Charset guard at the import door (`/^[\x20-\x7E]*$/` — printable ASCII, exactly what browsers emit for `entry.type`; empty still passes, the unknown-type shape) + the belt-and-suspenders clamp in `downloadHeaders` (strip non-printables → fall back to `application/octet-stream` — the construction stays header-safe even for pre-fix rows); unit pins at both ends |
| CS5 | B-L2 | Low (parse-memory amplification — auth-gated availability risk) | The envelope is bounded by BYTES only (64 MiB) — ~10⁶ minimal rows parse into several hundred MB of resident objects per hostile request with no deadline; the recorded A-M3 deferral covers chunked sub-tx TIME, not the parse MEMORY | `IMPORT_MAX_ROWS = 100_000` (exported from the seam module beside IMPORT_MAX_BYTES, checked in the ROUTE per the byte-cap precedent — the cheapest post-parse point, before the per-row loops and probes): over-cap → named 413 with the rows copy; unit constant pin + route census + the e2e 413 leg |
| CS6 | A-L1 (+A-I1) | Low (two-door residual in the exact CR2 family; comment accuracy) | The CR2 template rider taught the UNWRAP branch to move `<template>` children from `.content`, but the depth-cap collector (`subtreeText`) still walks `node.childNodes` — which is EMPTY for a template (children live in the inert fragment, probed in BOTH happy-dom 21.0.4 and Chromium) — so template text nested ≥500 deep inside disallowed containers dies at the DOM door's collapse while the server door keeps it | The collector resolves the same source the unwrap branch uses (`(node as Element & { content?: DocumentFragment \| null }).content?.childNodes ?? node.childNodes` — safe for every other element: a string `.content` (meta) yields undefined); unit leg (template text survives the cap collapse); the stale happy-dom comment re-worded while in the file (the A-I1 fold) |
| CS7 | A-L2 | Low (observability: latent server-bug class goes silent) | The shared PrismaClientValidationError→400 leg (CR1's compounding fix) logs nothing — the leg's own comment names its target as "latent Zod↔Prisma shape drift", i.e. a SERVER-side bug the operator now cannot see in production logs (the user is told to "refresh and re-submit" an error that recurs deterministically) | `console.error("[api] prisma validation error:", err)` before the 400 return (the unknown branch's log format); a console-spy unit leg |
| CS8 | The doc chain | — | Census/lesson/revision updates for the whole cycle | README badge/census + Session-144 row; AGENTS census + the S144 lessons; CLAUDE counts; PAD v1.3.52; SKILL census; vitest header re-anchor; the cert re-tags (the new chunk map); the plan §6 as-executed close; `docs/session_161.md`; the worklog Session-155 entry; the `.env.example` contract re-verified |

## §3 Per-item design

### CS1 — the instance-scoped sequence CAS (A-M1)

`src/components/views/settings-view.tsx:152/163/174`. Each declaration
becomes `const themeSeq = React.useRef(createFetchSeq()).current;`
(×3, with the comment block re-anchored to record the S144 scope fix:
the ticket must live for the COMPONENT's lifetime — a function-body
instantiation mints a fresh seq per render, so every pick's ticket is
`1` on its own instance and `isCurrent` degrades to always-true, the
unconditional-rollback shape the S142/S143 guards exist to prevent; the
files-view `useRef` precedent is the house idiom — "the ticket is
component-instance-scoped, the React idiom"). `React` is already
imported (`import * as React from "react"` at :11); the `useRef`
argument's per-render throwaway instantiation is a cheap closure
alloc, the documented React idiom for inexpensive factories. The
picker bodies, the seam, and the store wiring are untouched.

**Pins:** (a) the census re-anchor — the CR5 leg in
`tests/script-conventions.test.ts` EXTENDS in place with the three
`React.useRef(createFetchSeq()).current` markers (the census cannot see
instantiation SCOPE — that is exactly how A-M1 shipped — but it can
hold the shape against drift); (b) **the behavioral e2e leg** (the
honest pin — `tests/e2e/resilience.spec.ts`, the route-interception
idiom the file already carries): intercept
`**/api/settings/preferences` so the FIRST PATCH waits ~700 ms then
answers 500 and every later PATCH answers 200; pick Blue, then Green;
past the first PATCH's late failure, the GREEN swatch must still carry
`aria-pressed="true"` (RED today: the stale catch rolls the store back
to violet — the pre-pick value — clobbering the newer pick; GREEN with
the ref: the stale ticket is not current, no rollback). The
interception isolates the DB (the PATCHes never reach the server — no
cleanup, no budget); the leg rides the demo session.

### CS2 — the cursor dequeue (B-M1)

`src/lib/data-import.ts:362-374`. The loop head becomes
`for (let qi = 0; qi < queue.length; qi += 1) { const id = queue[qi] as
string;` — the body is unchanged (the `emitted` guard is defensive
today and stays). The queue only ever GROWS during iteration (children
are pushed when their in-degree hits 0, never removed; an id is pushed
once at init or once on the decrement-to-zero — the init push happens
only when the parent is unresolvable, whose in-degree stays 0 so the
decrement path cannot re-push it), so the cursor preserves the exact
FIFO/BFS emission order and the cycle-rejection semantics. **Pins:**
`tests/data-import.test.ts` +1 leg — a 100,000-folder chain (ids
`f0…f99999`, each parent `f(i-1)`) sorts with the root first, the full
length, and `elapsed < 2000 ms` (measured pre-fix: ~13 s at this size —
the RED is the elapsed bound; measured post-fix: ~60-150 ms — >10x
margin against CI noise), the test timeout raised to 60 s so the RED
fails the ASSERTION (the designed reason), not a runner timeout.

### CS3 — the merge-guard wiring pins (B-M2, the missing-pin class)

The wiring is correct today (verified by direct read — route
:113-129 declares the three guards, :323/:451 resolve them, :477-480
run `mergeGuard.guard(leg, data)` on the UPDATE branch against the
probe's hoisted stored legs). The finding is the ABSENCE of pins, so
both land GREEN on arrival (the S137/CL9 precedent — "a coverage pin
landing GREEN on the pre-fix tree; the finding was the missing pin,
not a defect"): (a) `tests/script-conventions.test.ts` +1 census leg —
the import route contains `IMPORT_MERGE_GUARDS` and `mergeGuard.guard(`
(the cheap drift guard); (b) the e2e leg in
`tests/e2e/s23-import.spec.ts` — create a stored grade through the
INTERACTIVE door (`POST /api/grades` `{title, score: 40, maxScore:
50}` — subject-less, the column is optional), then POST the import
envelope carrying ONLY `{id, score: 90}` for that row → the named 400
("Score cannot be higher than the maximum score.") and the stored row
reads back score 40 (the all-or-nothing posture holds). Rides the demo
session's import budget 8 → 9/10 (the header comment re-anchored);
chunk 5's register census untouched (no fresh user).

### CS4 — the mime charset guard + the header-safe clamp (B-L1)

Two ends, both pinned. (a) **The import door** —
`src/lib/data-import.ts:1352-1363`: the mime guard gains the charset
leg (`!/^[\x20-\x7E]*$/.test(mime)` → the named ImportRowError with
the printable-ASCII copy; empty string still passes — the browser's
unknown-type `entry.type === ""` shape must keep importing). (b) **The
download door** — `src/lib/server/http.ts:444-452`
(`downloadHeaders`): the Content-Type value is clamped
(`contentType.replace(/[^\x20-\x7E]/g, "") || "application/
octet-stream"`) so the header CONSTRUCTION stays safe even for pre-fix
stored rows (the one caller that passes stored data is files/[id];
the export and rum callers pass literals — unaffected, still
belt-and-suspenders for any future caller). **Pins:**
`tests/data-import.test.ts` +1 (the CRLF mime, an ESC control char,
and a non-ASCII mime all throw `/mime/`; the browser-real
`"text/html; charset=utf-8"` still passes — extending the S139/CN1
family in place) + `tests/files.test.ts` +1 (downloadHeaders clamps
the CRLF value to a header-safe string, and the all-control shape
falls back to `application/octet-stream`).

### CS5 — the row-count ceiling (B-L2)

`src/lib/data-import.ts` exports `IMPORT_MAX_ROWS = 100_000` (beside
IMPORT_MAX_BYTES at :54 — the cap constants live in the seam module,
the CHECKS live in the route, the byte-cap precedent). The route gains
the check immediately after `validateImportEnvelope` succeeds (the
cheapest post-parse point — BEFORE the per-collection id loops, the
IN-probes, and the topo sort): sum `data[collection].length` over
IMPORT_ORDER; over-cap → `errorResponse(413, "That backup has too many
rows. The import cap is 100,000 rows.")` (the toLocaleString copy).
The value: comfortably above any real account (the volume-stress
profile tops out in the hundreds; the S42/S43 family's 300/200/250),
far below the ~10⁶ the byte cap admits — the amplification bound
without touching the all-or-nothing shape. **Pins:**
`tests/data-import.test.ts` +1 (the constant is exactly 100,000 + the
reconciling arithmetic — the row cap must stay ≤ the byte cap's
minimal-row ceiling, the IMPORT_MAX_BYTES re-size reconciliation
family) + `tests/script-conventions.test.ts` +1 census (the route
references IMPORT_MAX_ROWS — the wiring pin) + the e2e 413 leg in
`tests/e2e/resilience.spec.ts` (100,001 minimal folder rows POST → 413
with the "100,000" copy — beside the BW11 byte-cap leg it mirrors;
rides the demo session, resilience's demo import POSTs 4 → 5/10, the
header comment re-anchored).

### CS6 — the collector's template source (A-L1 + A-I1)

`src/lib/note-html.ts:131-133`. The collector's child walk resolves the
template fragment the unwrap branch already handles:

```ts
// Push children in REVERSE so pops yield document order. A <template>'s
// children live in its inert .content fragment — never as direct
// childNodes (probed in BOTH happy-dom 21.0.4 and Chromium; the S143
// rider taught the unwrap branch, this is the collector's twin). For
// every other element `.content` is undefined (meta's string content
// yields no childNodes either) — the ?? keeps the regular walk.
const source = (node as Element & { content?: DocumentFragment | null }).content;
const kids = source?.childNodes ?? node.childNodes;
```

The stale happy-dom comment at :217-223 (the A-I1 fold — "happy-dom
keeps template children direct" is FALSE for the installed 21.0.4,
probed) is re-worded while in the file: the rider's robustness is now
"either environment" (the `.content ?? child` form reads both shapes
correctly — which is exactly why it works). **Pins:**
`tests/note-html-dom.test.ts` +1 — a ≥500-deep disallowed chain whose
collapsed core contains a `<template>` with text: the template's text
must SURVIVE the collapse (RED today: the collector reads the
template's empty childNodes and emits nothing — while the server door
keeps the text, the two-door contract's residual).

### CS7 — the drift log (A-L2)

`src/lib/server/http.ts:258-263`. The leg gains
`console.error("[api] prisma validation error:", err);` before the 400
return — the operator keeps the only signal that a route is
mis-shaping writes (the unknown branch's log format, matched). **Pins:**
`tests/http-body.test.ts` +1 — `vi.spyOn(console, "error")` around the
existing leg's call shape: the 400 still answers AND the spy fired
(the log is part of the contract now; the spy is restored after).

### CS8 — the doc chain

The full set, in the same commit: README (badge 2096 → the new census,
the 48-files line, the e2e map line, the Session-144 row); AGENTS.md
(the commands-table census + the S144 lessons block — the per-render
closure-scope class is the lesson this cycle buys); CLAUDE.md counts;
PAD v1.3.52 (the revision block + the §11 rows for the closed
findings); omni-study1_SKILL.md census (both sites); the vitest.config
header re-anchor; the cert re-tag (the new chunk map: chunk 3 +2, chunk
5 +1); the plan §6 as-executed close; `docs/session_161.md`; the
worklog Session-155 entry; the `.env.example` contract re-verified
against every env var the code reads (the s143 re-verification held —
re-checked, not assumed).

## §4 The TDD order (RED first, the honest dependency order)

1. **All RED legs written first** (the suite must show the designed
   failures): CS2's 100k perf leg (fails the elapsed bound — the ~13 s
   measured class), CS4's mime charset + clamp legs, CS5's constant +
   route-census legs (the module-absent RED family), CS6's
   template-beyond-cap leg, CS7's log-spy leg, CS1's e2e leg (run RED
   against a PRE-FIX build — the wiring defect is only honestly red at
   the browser surface; the build is the cost of the honest RED),
   CS3's two pins (GREEN-on-arrival by design — the missing-pin class,
   run and recorded as such).
2. **Implementation, smallest-blast-radius first**: CS2 (the cursor —
   pure seam, one loop head) → CS5 (the row cap — bounds the work the
   hostile envelope can demand) → CS4 (the charset + clamp) → CS6 (the
   collector source) → CS7 (the log) → CS1 (the useRef wiring) → CS3
   (pins only — no source change) → CS8 (docs).
3. **Interim gates** after each implementation cluster: `bun run lint`
   + `bun run typecheck` + the full unit suite (no parallel suites —
   the S142 cert lesson).
4. **The final cert**: the cold production build, then the 5-chunk
   e2e map via `scripts/e2e-chunked-cert.sh` (re-tagged: 150 + 187 +
   89 + 95 + 88 = 609), run ALONE (the documented machine-load class).
5. **The evidence capture**: four `docs/screenshots/144-clone-*.png`
   frames (desktop, mobile drawer, the Settings appearance card
   machine-verifying the ABA scenario's end state — the green swatch
   pressed through the late failure — and the export page's restore
   card with its size signal), the probe rows cleaned after.

## §5 Deferrals carried (unchanged unless named here)

- **The A-M3 stage-2** (the chunked sub-tx + resume token): still the
  one named deferral — the operator's standing "best judgement"
  instruction grants the authority, but the all-or-nothing ADR-021
  contract is verified DELIVERED by this cycle's audit (every write
  inside the one tx; no escape found), the CS5 row ceiling closes the
  adjacent memory hazard, and a contract change that big deserves its
  own cycle with its own ADR — RECORDED as the deliberate carry, not
  silently dropped.
- **The export streaming half**: unchanged (buffered export accepted,
  the audit found no NEW hazard — B-I3).
- **The register re-issue transactional triple; the post-sanitize
  entity-expansion re-check**: unchanged (the s142/s143 carries).
- **The informational set**: A-I3 (the fetch-seq test's happy-dom env
  tag + the ValidationErrorCtor double-cast — test hygiene, no
  behavior), B-I1 (the parseImportEnvelope duplication — documented),
  B-I4's write-set nuances, the login stale-mint sibling, the
  delete-note popover no-auto-close rider, B-I1/B-I2/B-I3 from s143 —
  all carried as recorded.
- **The standing s133–s143 deferred set**: unchanged (see the s143
  plan §5).

## §6 As-executed close

Executed 2026-11-05 (the 36th workspace continuation, a fresh clone at
`88739ca` received). The plan held as written; the honest deltas:

- **CS2 (the measurement correction, both directions):** the audit's
  ~13 s at 10⁵ rows did NOT reproduce on this Node (~0.7-0.9 s — the
  quadratic CLASS reproduces exactly: 27 ms at 2×10⁴ → 449 ms at 8×10⁴
  → 2,842 ms at 2×10⁵, 25x rows → 104x time; the constant is ~10x
  smaller on this build), so the freeze projection holds at the CAP tier
  (~12 minutes at the ~10⁶ minimal-row ceiling) rather than the 10⁵
  tier — the severity reasoning stands, the numbers re-recorded. The
  first RED leg accidentally picked a linear CHAIN (the degenerate
  easy case: the live queue stays at ≤2 elements, shift is trivially
  cheap — the leg passed GREEN at 856 ms); the honest worst case is the
  STAR (one root, N children — the queue fills at the root's pop and
  every shift moves the whole tail): re-shaped to a 250k star, RED at
  9.7 s elapsed vs the 2 s bound, GREEN post-fix at 317 ms (30x).
- **CS5 (the RED-phase sequencing):** the build TYPE-CHECKS the tests,
  so the pre-fix e2e build required the constant export FIRST — the
  module-absent RED had already proven itself at the unit layer
  (IMPORT_MAX_ROWS undefined), so the one-line export was the minimal
  unblock; the route-side legs (the census + the 413 e2e) stayed RED
  until the route check landed. The CS5 e2e RED was MORE honest than
  the plan predicted: the 100,001-row envelope did not error out — it
  imported 200 (the amplification sails through the pre-fix tree in
  ~3 s, 100,001 folders persisted into the scratch db — the exact
  unbounded behavior the ceiling closes).
- **CS3 (the green-on-arrival class, as designed):** both pins landed
  green on the pre-fix tree (the wiring verified correct by direct
  read; the finding was the ABSENCE of pins — the S137/CL9 precedent);
  the e2e leg rides the demo session's import budget 8 → 9/10 (the
  header recount re-anchored in the same edit).
- **The census re-anchors the plan did not name (the S142 class, every
  cycle):** the cert tripwire pin (`Expected: … = 606` → 609), the
  vitest header's per-file arithmetic corrected in draft (data-import
  +5 → +4, script-conventions +1 → +2 — the count-the-things doctrine
  applied to the plan's own doc block before it landed), the SKILL
  census's chromium-specs arithmetic (601 → 604), and CLAUDE.md's
  e2e count found TWO cycles stale (605 — the s140 doc-drift class
  reborn; the S143 cycle corrected the README/AGENTS/SKILL but missed
  CLAUDE.md's line).
- **Cert:** the cold 5-chunk map re-tagged 606 → 609 and every chunk
  FIRST-PASS on the final tree — 150 + 187 + 89 + 95 + 88 (the
  documented P1008 socket-timeout WebServer noise appeared in the logs
  through the run, the known machine-load class; zero test failures).
  The final gates: lint ✓ · tsc ✓ · unit **1500/1500** (48 files,
  +10) · build ✓ · e2e **609/609** = **census 2109 green** (was 2096).
- **Evidence:** four `docs/screenshots/144-clone-*.png` frames — the
  settings-ABA frame machine-verifies the EXACT interleaving through
  the live UI (the first PATCH settles last and fails 500; the newer
  Green pick made in between holds `aria-pressed="true"` past the
  stale failure, violet/blue false — RED pre-fix was demonstrated by
  the same scenario in the pre-fix e2e run); the export-restore frame
  machine-verifies the Restore card's cold posture (the Import button
  disabled, the file input attached) and the S141/CP4 size line
  ("Current backup size: 19 KB (restore cap 64 MB)"). The capture is
  self-verifying (four md5-distinct, >10 KiB, byte-diverse frames; the
  JSON verdict carries both machine proofs; the interception isolates
  the DB — the PATCHes never reach the server, so no probe cleanup).
- **The `.env.example` contract re-verified** against every env var the
  code reads (DATABASE_URL, AUTH_SECRET, NEXT_PUBLIC_SITE_URL,
  SEED_DEMO, DISABLE_IN_APP_OTP, DISABLE_IN_APP_RESET,
  TRUSTED_PROXY_HOPS — all documented; NODE_ENV is
  framework-managed): unchanged, the S143 verification held.
- **The mid-flight corrections of the session itself:** the capture
  script's first draft called a locator method absent from this
  Playwright build (`isAttached` → `count() > 0`); the s23 budget
  header recount needed the per-line surgical form (the blanket
  replace over a history-bearing comment block failed to match — the
  CA20 lesson class); the plan's §0 live-battery numbers (the 59th
  drawer confirmation) recorded before the audits ran.
- **Deferrals carried forward (§5 stands):** the A-M3 stage-2 (the
  chunked sub-tx + resume token — still needs its own cycle + ADR; the
  operator's standing best-judgement instruction grants the authority
  but the contract change deserves deliberation, and the CS5 row
  ceiling closed the adjacent memory hazard), the export streaming
  half, the register re-issue transactional triple, the post-sanitize
  entity-expansion re-check, and the informational set (A-I3
  test-hygiene nits, B-I1 the parseImportEnvelope duplication, the
  login stale-mint sibling, the delete-note popover no-auto-close
  rider).

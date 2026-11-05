# Remediation Plan — Session 143 (Cycle 93, Batch CR)

> Status: PLANNED (pre-change record — the immutable plan; the as-executed
> close lives in §6). Written before any source change, per the standing
> doctrine ("write the cycle plan into docs/remediation-plan-sessionN.md
> BEFORE any source change").
>
> Operator directive: refresh the workspace, re-read the doc chain
> (AGENTS/CLAUDE/README/PAD/SKILL + session_157/158 +
> remediation-plan-session142 + worklog), validate against the codebase,
> audit with the repo-included skills (skills/web-application/SKILL.md the
> primary; the skills catalog for the rotation), iterate toward
> visual/functional parity with omni-study1.base44.app (agent-browser-era
> scripts, live reference login, mobile-navigation attention, the
> Tailwind v4 bug watch), provision `.env` with
> `DATABASE_URL="file:../db/custom.db"` + the repo-root `db/`, validate
> the vitest/playwright suites, remediate TDD-first, capture evidence
> frames, update the doc chain, push via the SSH wrapper. The repo's
> `skills/` folder stays excluded from code checking, testing, and
> compilation.

## §0 Scope, method, cold baseline, live parity

**Workspace (the 35th continuation).** Fresh clone at `d0af6cb` on `main`
(the Batch CQ fix `4184366` + the operator's session_157 transcript
commit). Environment provisioned per the recipe: `bun install` (510 pkgs),
`.env` from `.env.example` (`DATABASE_URL="file:../db/custom.db"`),
`db:push` + `db:seed` (the demo account + seeded rows, `db/custom.db`
389 KiB), Playwright Chromium installed, the dev daemon live on :3000
(the S32 subshell recipe — `( setsid bun run dev </dev/null >/dev/null
2>&1 & )`, verified stable across tool calls).

**Cold baseline (before any work):**

| Gate | Result |
|---|---|
| `bun run lint` | ✓ 0 errors |
| `bun run typecheck` | ✓ 0 errors |
| `bun run test` (Vitest) | ✓ 1466/1466 (47 files) — the documented S142 final state exactly |
| `node scripts/drawer-check-s14.mjs` (both hosts, live reference login) | GREEN — **the 58th consecutive no-Tailwind-v4-mobile-nav-bug confirmation** (backdrop oklab(0 0 0 / 0.2) + blur(4px); 288px white panels; 20 links; no footer; Escape-close superset) |
| `node scripts/parity-probe-s142.mjs` (both hosts, live reference login; REF_PROBE_* exported) | **DESKTOP CHROME: MATCH** — sidebar outer width 260=260, 20 links in identical order, mainX 260=260, mainWidth 1180=1180, first-links identical |

**Baseline noise observed (recorded, not findings):** none.

**Probes run BEFORE the plan (the doctrine — probe, don't guess):**

1. **The two-door non-text-tag corpus probe** (vitest/happy-dom, 11
   tags): `script`, `style`, `textarea`, `option`, `xmp` — **the exact
   sanitize-html default `nonTextTags` set — DIE WHOLE at the server door
   but their TEXT SURVIVES the DOM render door** (the unwrap branch keeps
   the children of every disallowed element). `noscript`/`template`/
   `title`/`iframe` unwrap to text at BOTH doors; comments/PIs die at
   both. The five-tag asymmetry is the residual of the CQ5 family the
   s142 cycle claimed closed ("the two doors accept the SAME payload
   set") — promoted to **CR2** below.
2. **The sentKeysPatch hostile-body probe**: `{"toString":"x",
   "constructor":"y", "valueOf":"z", "hasOwnProperty":"w", "title":"t"}`
   against a `{title, content}` parsed row → the write set came back
   `[toString, constructor, valueOf, hasOwnProperty, title]` with
   `writes.toString` a **function** — the `key in parsed` membership
   test walks `Object.prototype`. **B-L1 behaviorally demonstrated.**

## §1 The audits (Mode-C, read-only subagents; every M/L finding re-verified by direct read)

Per the s142 closing directive — "the audit rotation continues (the
import/export + data-portability axis is one cycle fresh; the FE/views +
auth/crypto axis just swept)" — the stale axis is **entities/factory**
(last swept S137, five cycles stale), plus the standing recent-changes
focus ("particularly on the recent code changes"):

1. **Audit A — the Batch CQ recent-changes audit** (the `4184366` diff
   itself: both note-html doors, the export byte-signal seam chain, the
   notes-view Popover conversion, the settings CAS rollbacks, the
   import P2025 leg, the verify-email mint, the new pins):
   **0C / 0H / 1M / 4L / 5I**. All eight CQ claims verified TRUE at the
   source level; the recursive-edge enumeration of the DOM walker found
   every edge bounded. The M: **A-M1** — three of the eight CQ fixes
   (CQ4 the P2025 named-409, CQ7 the CAS rollbacks, CQ8 the tx-fresh
   mint) are pinned ONLY by source-text censuses (`expect(src).
   toContain(...)`), not behavior — a catch-leg reordering that shadows
   P2025, or a CAS regression that keeps the marker lines, passes
   green. The Ls: A-L1 the vitest header's per-file arithmetic ("+7",
   actual +6), A-L2 the CQ3 e2e leg's stale comment (describes the
   ArrowUp path the code does not run), A-L3 the CAS compares VALUES not
   request identity (the same-value ABA — pick A, pick A again, the
   first PATCH fails → the rollback clobbers the second's success), A-L4
   verify-email's pre-tx select still fetches the now-unused
   `sessionVersion` column (dead since CQ8).
2. **Audit B — the entities/factory rotation** (the axis five cycles
   stale — the factory, the 26 route families, the data layer, the
   schema/indexes): **0C / 0H / 0M / 1L / 3I**, and the axis verified
   **substantially clean** — all eight SPECIAL-ATTENTION invariants
   re-verified HOLDING (ownership scoping on every route, the sent-keys
   filter at all 17 write sites, the write-budget census, the guarded
   delegates' transactions, the index census, the FK onDelete ↔ route
   delete parity, no raw SQL, the date-handling discipline). The L:
   **B-L1** — `sentKeysPatch`'s membership test `!(key in parsed)` walks
   the prototype chain: a hostile PATCH body carrying `toString`/
   `constructor`/`valueOf`/`hasOwnProperty` passes the Zod gate, then
   injects the inherited FUNCTIONS into the Prisma write data →
   `PrismaClientValidationError` → the shared mapper has no leg for it
   → **500 + unhandled-error log noise on a reachable interactive path
   (should be the 400 family)** — the PAD §6.2 taxonomy's one reachable
   violation. The Is: B-I1 the import grades `maxScore` create-default
   leg is applied to UPDATE-branch rows too (over-strict, hand-crafted
   envelopes only), B-I2 the write-budget census is file-level not
   method-level, B-I3 the RUM GET `total` field reports the window
   count.

**Every M/L finding above was re-verified by direct read of the current
tree before this plan was written** (A-M1 at tests/script-conventions.
test.ts:1339-1376; A-L1 at vitest.config.ts:7; A-L2 at
tests/e2e/parity-session7.spec.ts:2006-2010; A-L3 at settings-view.tsx:
151/160/169; A-L4 at verify-email/route.ts:63; B-L1 at entities.ts:260 —
plus the two behavioral probes in §0).

**The prior-session hypothesis sweep** (the interrupted s143 run's named
items, re-verified independently before inclusion): the mover Select's
missing accessible name VERIFIED (notes-view.tsx:798 — the only unlabeled
combobox in the tree; the siblings carry aria-labels or `Label htmlFor`
pairs); the import-router's three `(db|tx as any)[model]` casts VERIFIED
(route.ts:310/477/516); the non-text-tag asymmetry VERIFIED by probe
(the five-tag set). NOT re-verified as defects and therefore NOT
included: the quill-mount "last line of defense" guard (the mount's
disposed/container guards hold, the sanitize call is depth-bounded and
browser-safe by construction, and a swallow-the-throw shape risks
masking the exact class the S140/CO1 gate exists to surface — recorded
as a considered deferral, §5); the resilience-spec rate-limiter legs
(the register/eviction contracts are already unit-pinned per
BU6/BV9/S121 — no fresh finding).

## §2 Findings → the CR set

| ID | Source | Severity | Defect | Fix |
|---|---|---|---|---|
| CR1 | B-L1 (probed) | Low (taxonomy/robustness) | `sentKeysPatch`'s `key in parsed` walks the prototype chain — hostile PATCH bodies inject inherited functions into the write data → PrismaClientValidationError → 500 (the 400-family taxonomy's one reachable violation; the only reachable PrismaValidation-500 on interactive paths) | Own-keys guard (`Object.prototype.hasOwnProperty.call(parsed, key)`); behavioral unit pins (the hostile body → only own schema keys reach the write set); PLUS the shared `toErrorResponse` gains the `PrismaClientValidationError` → 400 leg (mirroring the import route's local BT1b) so every route's latent Zod↔Prisma drift answers 400, not 500 — with its own behavioral pin |
| CR2 | A-I1 promoted (probed: the 5-tag DIFF set) | Low (door-alignment doctrine) | The non-text tags (`script`/`style`/`textarea`/`option`/`xmp` — sanitize-html's default `nonTextTags`) die WHOLE at the server write door but their TEXT SURVIVES the DOM render door (the unwrap branch keeps disallowed elements' children) — the residual asymmetry of the family CQ5's comments claim closed ("the two doors accept the SAME payload set") | A shared `NOTE_HTML_NON_TEXT_TAGS` constant (the five-tag set) in the policy module; the DOM walker dies WHOLE for the set (no unwrap, no text survival, at ANY depth — the check runs before the depth cap); the server door sets `nonTextTags` explicitly from the same constant (drift-immune, behavior-identical to today's default); both-door behavioral pins |
| CR3 | verified gap on the CQ3 surface | Low (a11y, WCAG 4.1.2) | The notebook-mover `Select` in the note-actions popover — the exact surface CQ3 just made keyboard-reachable — has NO accessible name (no aria-label, no Label pair; the sibling Selects all carry one) | `aria-label="Move note to notebook"` on the mover SelectTrigger; the CQ3 keyboard-reachability e2e leg's combobox locator re-anchored to the NAMED form (pinning the label behaviorally) |
| CR4 | verified (the documented seam) | Low (TS quality) | Three `(db\|tx as any)[model]` casts in the import route (310/477/516) — the generic-restore seam documented as "the delegate is used as `any` throughout", against the repo's strict-types doctrine | ONE narrow-typed seam: an `ImportDelegateOps` interface (findMany/update/createMany — exactly the three ops used) + a lookup helper in `src/lib/data-import.ts`; the three call sites consume it; the `as any` census closes |
| CR5 | A-L3 + A-M1(b) | Low (state consistency) | The appearance CAS compares VALUES not request identity: pick(A) → pick(A) again → the FIRST PATCH fails → the guard sees store===next and rolls back over the SECOND's success (the ABA the comment's own "fetchSeq idiom" citation does not have — fetchSeq compares a sequence) | Per-field sequence tickets (the true fetchSeq form): a `createFetchSeq()` pure seam (`begin()` → ticket, `isCurrent(ticket)`); each picker's catch rolls back only when NO NEWER pick was issued; behavioral unit pin on the seam |
| CR6 | A-M1(a) | Low (test quality) | The import catch's P2025/P2028 named legs are pinned only by source-text censuses — a catch-leg reordering that shadows P2025 (or a copy change) passes green | `importRestoreError(err)` — the error→{status, message} mapping extracted into `src/lib/data-import.ts` (route files cannot export shared symbols; the lib can); the route's catch consumes the seam; behavioral unit pins: P2025→409 named copy, P2028→413 named copy, ValidationError→400, PrismaClientValidationError→400, unknown→500 |
| CR7 | A-L4 + A-M1(c) | Low (dead read + census) | verify-email's pre-tx select still fetches the `sessionVersion` column — dead since CQ8 minted from the tx-returned row (kept only because the census pins the mint site, not the select) | Drop the column from the select; the census re-anchored to pin BOTH shapes (the mint reads the tx row AND the select no longer fetches the pre-tx column) |
| CR8 | A-L2 + A-L1 + A-I5 | Low (comment accuracy) | The CQ3 e2e leg's stale comment (describes the ArrowUp path the code does not run); the vitest header's per-file arithmetic ("+7", actual +6); the "vocabulary quartet" comment over a 3-scheme loop | All three corrected to the executed truth |
| CR9 | The doc chain | — | Census/lesson/revision updates for the whole cycle | README badge + Session-143 row; AGENTS census + S143 lessons; CLAUDE counts; PAD v1.3.51; SKILL census; vitest header re-anchor; the plan §6 close; worklog Session 154; `docs/session_159.md` |

## §3 Per-item design

### CR1 — the own-keys guard + the shared PrismaValidation leg (B-L1)

`src/lib/server/entities.ts:260`. The membership test becomes
`Object.prototype.hasOwnProperty.call(parsed, key)` — Zod strip-mode
emits own keys only, so legitimate bodies are unaffected (verified: the
sent-keys-patch test family pins 13 shapes; the hostile probe is the
RED leg). The compounding fix: `toErrorResponse` (http.ts:236) gains the
leg the import route already carries locally (its BT1b) — `err instanceof
Error && err.name === "PrismaClientValidationError"` → 400 with the
named copy ("That request contained fields the server could not accept.
Try refreshing and re-submitting." — the taxonomy family's malformed-
request shape). **Pins:** (a) `tests/sent-keys-patch.test.ts` +1 leg —
the hostile body (`toString`/`constructor`/`valueOf`/`hasOwnProperty`
+ one real key) yields a write set with ONLY the real key (RED today:
the probe shows the functions entering the set); (b)
`tests/http-body.test.ts` +1 leg — `toErrorResponse(new
PrismaClientValidationError("…"))` (the next subclass of Error with the
name set) → 400 + the copy.

### CR2 — the shared non-text-tag policy (the CQ5-family residual)

`src/lib/note-html.ts` + `src/lib/server/note-html.ts`. The constant
(the policy module both doors already share):

```ts
export const NOTE_HTML_NON_TEXT_TAGS: readonly string[] =
  Object.freeze(["script", "style", "textarea", "option", "xmp"]);
```

— exactly sanitize-html's default set (verified in
node_modules/sanitize-html/index.js:208-214), so the server door's
explicit `nonTextTags: [...NOTE_HTML_NON_TEXT_TAGS]` is behavior-identical
to today's implicit default (drift-immune now). The DOM door: the
non-text check runs FIRST in `processElement` (before the depth cap — a
script at depth 600 dies whole, not text-collapsed): `if
(NOTE_HTML_NON_TEXT_TAGS.includes(tag)) { child.remove(); return; }`.
The five tags' content is never editor-authored prose (script/style are
code, textarea/option/xmp are editing-surface artifacts) — the render
gate's mission (the CO1 doctrine) is "legacy rows render as if freshly
written", and the write door kills these whole. **Pins:** (a) the DOM
door legs in `tests/note-html-dom.test.ts` — each of the five tags' text
dies (RED today: the probe shows all five surviving), nested allowed
content inside a script dies whole, the container family (noscript/
template/title/iframe) still unwraps to text (unchanged); (b) the server
door legs in `tests/note-html.test.ts` — the explicit nonTextTags
census (OPTIONS carries the constant) + the five-tag corpus re-run
(green on arrival, pinned against drift).

### CR3 — the mover's accessible name (the CQ3 surface)

`src/components/views/notes-view.tsx:798`. The SelectTrigger gains
`aria-label="Move note to notebook"` (mirroring the sibling Selects'
convention). **Pins:** the CQ3 keyboard-reachability e2e leg's
`getByRole("combobox")` locators re-anchored to `getByRole("combobox",
{ name: "Move note to notebook" })` — the label is now behaviorally
pinned (the leg fails if the name regresses).

### CR4 — the typed import-delegate seam

`src/app/api/import/data/route.ts:310/477/516` + `src/lib/data-import.ts`.
The three ops the generic restore uses (findMany for the probe and
collision legs, update for the per-row update set, createMany for the
chunked create set — verified the complete set by grep) become:

```ts
export interface ImportDelegateOps {
  findMany(args: { where: Row; select?: Row }): Promise<Row[]>;
  update(args: { where: { id: string }; data: Row }): Promise<Row>;
  createMany(args: { data: Row[] }): Promise<{ count: number }>;
}
export function importDelegateOps(
  client: { [model: string]: unknown }, // PrismaClient | tx
  model: string,
): ImportDelegateOps { /* ONE documented index cast */ }
```

Prisma's per-model delegates have heterogeneous signatures that TS cannot
unify — the seam narrows the contract through ONE documented index cast
(the honest boundary of the generic-restore design), replacing the three
inline `as any`s. The `model` keys stay the `MODEL[collection]` values.
**Pins:** the script-conventions census — the import route carries no
`as any` and the seam exists (the census that fails today).

### CR5 — the sequence-ticket CAS (A-L3)

`src/components/views/settings-view.tsx` + a new pure seam
`src/lib/fetch-seq.ts`:

```ts
export function createFetchSeq(): { begin(): number; isCurrent(ticket: number): boolean }
```

Each picker holds its own guard (`themeSeq`/`accentSeq`/`avatarSeq` —
three fields, three tickets): `const ticket = seq.begin()` at the pick;
the catch rolls back only when `seq.isCurrent(ticket)` — a newer pick
(same value or different) always blocks the stale rollback. This IS the
fetchSeq idiom the S142 comment cited (sequence compare, not value
compare). **Pins:** `tests/fetch-seq.test.ts` (new) — tickets are
monotonic; `isCurrent` true for the latest; false for every earlier
ticket after a newer begin; interleaved begins do not resurrect stale
tickets. The S142/CQ7 census legs re-anchored to the new markers.

### CR6 — the importRestoreError seam (A-M1a)

`src/lib/data-import.ts` + `src/app/api/import/data/route.ts` (the
catch block). The catch's mapping (P2028→413 named, P2025→409 named,
the BT1b PrismaClientValidationError→400 leg, everything else →
`toErrorResponse`) extracts as:

```ts
export function importRestoreError(err: unknown): { status: number; message: string }
```

— a pure {status, message} seam (NextResponse construction stays at the
route). The route's catch becomes the three-line consumer. **Pins:**
`tests/data-import.test.ts` +~5 legs — P2028 → 413 + the backup copy,
P2025 → 409 + the deleted-while-import-ran copy, ValidationError → 400,
PrismaClientValidationError → 400, unknown → 500 (all behavioral; the
census legs stay as the marker backstop).

### CR7 — the verify-email dead-column drop (A-L4)

`src/app/api/auth/verify-email/route.ts:63`. The select drops
`sessionVersion: true` (dead since CQ8 — only `id`/`emailVerified` are
read). **Pins:** the S142/CQ8 census leg re-anchored to ALSO assert the
select shape (the pre-tx read fetches neither `sessionVersion` nor any
other mint field).

### CR8 — the comment corrections (A-L2/A-L1/A-I5)

The e2e comment rewritten to the executed path (ArrowDown → option
focus-land → Enter on "Lecture Notes"); the vitest header's "+7" → "+6";
the "quartet" → "the http/https/mailto vocabulary" (three schemes).

### CR9 — the doc chain

The full set, per the standing convention: README badge/census + the
Session-143 row; AGENTS.md census + the S143 lessons block; CLAUDE.md
test counts; PAD v1.3.51 (the revision block + the §11 closure rows);
the SKILL census; the vitest header re-anchor; the cert re-tag; the plan
§6 as-executed close; the worklog Session 154 entry;
`docs/session_159.md`.

## §4 TDD pin projections

| Layer | File | Δ legs | Content |
|---|---|---|---|
| Unit | `tests/sent-keys-patch.test.ts` | +1 | The hostile-body leg (RED: the probed five-key write set) |
| Unit | `tests/http-body.test.ts` | +1 | toErrorResponse's PrismaClientValidationError → 400 leg |
| Unit | `tests/note-html-dom.test.ts` | +~6 | The five non-text tags die whole (RED: the probed text survival), nested-content-in-script dies whole, the container family unchanged |
| Unit | `tests/note-html.test.ts` | +~2 | The explicit nonTextTags census + the five-tag corpus drift pin |
| Unit | `tests/fetch-seq.test.ts` (new) | +~4 | Monotonic tickets, isCurrent semantics, the stale-no-rollback interleave |
| Unit | `tests/data-import.test.ts` | +~5 | The importRestoreError family (P2025/P2028/ValidationError/PrismaValidation/unknown) |
| Unit | `tests/script-conventions.test.ts` | +~4 | The no-`as any` import census, the fetch-seq markers, the verify-email select+mint census re-anchor |
| E2E | `tests/e2e/parity-session7.spec.ts` | ~3 modified | The CQ3 leg's combobox locators → the NAMED form; the stale comment fix |
| Census | — | 1466 → ~1489 unit; 606 e2e | The 5-chunk cold map re-tagged |

Every RED is demonstrated before its GREEN (the CR1/CR2 REDs are
pre-proven by the §0 probes — the write set and the text survival are
empirical; the rest follow the write-test → fail → implement → pass
loop).

## §5 Deferrals (documented, with rationale)

- **The quill-mount "last line of defense" guard** (the interrupted
  prior run's CR6 hypothesis): NOT re-verified as a defect by this
  cycle's audit — the mount's disposed/container guards hold, the
  render-gate call is depth-bounded and browser-safe by construction
  (the CQ1 cap, the subtreeText collector), and a swallow-the-throw
  shape risks masking the exact regression class the CO1 gate exists
  to surface. Considered and declined.
- **A-M3 stage-2 (chunked sub-transactions + resume token):** unchanged
  from the s141/s142 plans — it BREAKS the all-or-nothing ADR-021
  contract without operator direction. The one named deferral, carried
  again.
- **A-I2 (the login stale-mint sibling):** inherent to non-atomic cookie
  minting; fail-closed, window narrower than the verify-email shape
  CQ8 closed. Carried as informational.
- **A-I3 (the delete-note popover no longer auto-closes on FAILED
  deletes):** the CQ3 trade's minor rider; accepted (the e2e delete-flow
  leg is unaffected).
- **B-I1 (the import grades maxScore create-default on UPDATE rows):**
  over-strict on hand-crafted partial envelopes only, errs closed with
  a named message. Carried as informational.
- **B-I2 (the write-budget census is file-level):** accepted for now —
  the per-method census shape recorded as the next tightening if the
  calculator-family grows another method.
- **B-I3 (the RUM `total` = window count):** single-owner observability
  cosmetics; carried as informational.
- **The standing s133–s142 deferred set:** unchanged (see the s142 plan
  §5).

## §6 As-executed close

Executed 2026-11-05 (the 35th workspace continuation, a fresh clone at
`d0af6cb` received). The plan held as written; the honest deltas:

- **CR2 (the template rider)**: the evidence capture's live machine
  proof in real Chromium found a THIRD leak the plan and the happy-dom
  pins could not see — a `<template>`'s children live in its INERT
  `.content` fragment (never as direct children), so the unwrap
  branch's `while (child.firstChild)` moved nothing and the template's
  text died at the DOM door in real browsers while the server door
  keeps it (happy-dom keeps template children DIRECT — the probe
  corpus's environment boundary, the S142 ≥4k-serializer class's
  sibling). The unwrap now moves from `.content ?? child`. The rider's
  re-verification: full unit 1490/1490, fresh tsc, rebuild, and the
  affected e2e families re-run green (parity-session9 37/37 — the
  render-gate corpus carries no templates; parity-session7 57/57).
- **CR2 (first draft)**: the depth-cap leg's first RED exposed a SECOND leak the plan
  had not named — the non-text check placed before the depth cap stops
  the WALKER's resurrection, but the cap branch's own subtreeText
  collector was re-collecting script text from BEYOND the cap (a
  600-deep `<div>` chain's collapse emitted the script's text). The
  collector now honors the non-text set (skip the subtree entirely) —
  the two-door contract holds past the cap, not just under it. The
  server-door legs were green-on-arrival as designed (the library
  default already killed the set whole; the legs pin against drift).
- **CR4**: the typed seam landed as a ROUTE-LOCAL helper
  (`importDelegateOps` + the `ImportDelegateOps` interface in the import
  route) rather than in `src/lib/data-import.ts` as §3 sketched — the
  seam needs the `PrismaClient | Prisma.TransactionClient` types, and
  importing them into the otherwise-import-free pure lib would violate
  its own seam header ("zero imports beyond the export seam's shared
  constants"). The route file is where the three casts lived; the
  census (no `as any`, the seam markers present) pins it either way.
  One extra honest delta: `keyof PrismaClient` is string|symbol, so the
  index key narrows through `as string` (TS2538 — the exact error the
  interrupted prior run had hit).
- **CR5**: the settings-view pickers now hold per-field
  `createFetchSeq()` guards (`themeSeq`/`accentSeq`/`avatarSeq`) — the
  `useThemeStore.getState()` reads are gone from the catch paths (the
  hook subscriptions at the component top still use the store; the
  import stays).
- **CR6**: the delegation boundary re-shaped mid-flight — the seam
  returns `null` for the shared-mapper families (ValidationError/
  NotFound/known-request-error), and the route falls through to
  `toErrorResponse`. The first draft had the seam mapping those
  families itself, which would have duplicated the shared mapper's
  single source; the tests pin the delegation contract instead
  (`ValidationError → null`, `unknown → null`).
- **The census re-anchors the plan did not name**: the S142
  script-conventions legs for the P2028 route-local copy, the CQ4 P2025
  markers, and the CQ7 CAS markers all needed re-anchoring to the new
  shapes (the copy moved to the seam; the markers changed) — the exact
  "the machine gate finds its own first catch" class the S142 §6
  recorded; re-anchored in the same commit, plus the new CR1/CR2/CR4/
  CR5/CR3 census legs (6) and the CR7/CQ8 select-shape re-anchor.
- **CR1's http-body leg** needed two of its own iterations (the
  un-awaited `.resolves` assertion, then `await` in a non-async
  callback — both caught by the test runner, not by review).
- **Cert**: the 5-chunk cold map UNCHANGED at 606 (the S143 pins
  re-anchored existing legs in place — the CQ3 mover locator is now
  the NAMED combobox). Census: **1490 unit (48 files, +24) + 606 e2e =
  2096 green** (was 2072).
- The live parity battery this cycle: the drawer check GREEN (the 58th
  consecutive no-Tailwind-v4-mobile-nav-bug confirmation) and the
  desktop chrome probe **MATCH** on all five formal checks (the s142
  probe, REF_PROBE_* exported).
- Evidence: four `docs/screenshots/143-clone-*.png` frames — the
  notes-actions frame machine-verifies the mover combobox holding
  focus AND carrying its accessible name ("Move note to notebook");
  the non-text frame machine-verifies the five non-text texts ABSENT
  from the planted legacy note's editor while the container family's
  text is present. The probe row cleaned from the dev db after the
  capture.
- Deferrals carried forward (§5 stands): the A-M3 stage-2 (needs
  operator direction on the ADR-021 contract change), the export
  streaming half, the register re-issue transactional triple, the
  post-sanitize entity-expansion re-check, and the newly-recorded
  informational set (the login stale-mint sibling, the delete-note
  popover no-auto-close rider, B-I1/B-I2/B-I3).

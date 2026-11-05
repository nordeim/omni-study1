# Remediation Plan — Session 142 (Cycle 92, Batch CQ)

> Status: PLANNED (pre-change record — the immutable plan; the as-executed
> close lives in §6). Written before any source change, per the standing
> doctrine ("write the cycle plan into docs/remediation-plan-sessionN.md
> BEFORE any source change").
>
> Operator directive: refresh the workspace, re-read the doc chain
> (AGENTS/CLAUDE/README/PAD/SKILL + session_155/156 +
> remediation-plan-session141 + worklog), validate against the codebase,
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

**Workspace (the 34th continuation).** Fresh clone at `10d5a33` on `main`
(the Batch CP fix `459e7da` + the operator's session_156 transcript
commit). Environment provisioned per the recipe: `bun install` (510 pkgs),
`.env` from `.env.example` (`DATABASE_URL="file:../db/custom.db"`,
`AUTH_SECRET=""`), `db:push` + `db:seed` (the demo account + seeded rows,
`db/custom.db` 389 KiB), Playwright Chromium installed, the dev daemon
live on :3000 (the S32 subshell recipe — `( setsid bun run dev
</dev/null >/dev/null 2>&1 & )`, verified stable across tool calls).

**Cold baseline (before any work):**

| Gate | Result |
|---|---|
| `bun run lint` | ✓ 0 errors |
| `bun run typecheck` | ✓ 0 errors |
| `bun run test` (Vitest) | ✓ 1449/1449 (47 files) — the documented S141 final state exactly |
| dev-server preflight | GREEN (hydrated, navigation-stable) |
| `node scripts/drawer-check-s14.mjs` (both hosts, live reference login) | GREEN — **the 57th consecutive no-Tailwind-v4-mobile-nav-bug confirmation** (backdrop oklab(0 0 0 / 0.2) + blur(4px) ≡ trap-7 equivalence; 288px white panels; 20 links; no footer; Escape-close superset) |
| `npx playwright test tests/e2e/mobile-navigation.spec.ts` (cold `db/e2e.db`) | ✓ 20/20 (34.7s) |
| `node scripts/parity-probe-s142.mjs` (both hosts, live reference login) | **DESKTOP CHROME: MATCH** — sidebar outer width 260=260, 20 links in identical order, mainX 260=260, mainWidth 1180=1180 |

**Live parity notes (this cycle's probe work, recorded for the lineage):**
the s141 probe's settled-state contract was found fragile on the reference
host — (1) the reference's login click renders a SPLASH containing `<main>`
while the URL is still `/login`, so the s141 main-wait resolved on the
splash and evaluated inside the re-render window (the all-nulls artifact);
(2) the reference redirects its SPA shell to `/Dashboard` post-login (the
clone serves `/` — both are the settled dashboard surface; the clone's
one-page-SPA + rewritten-paths doctrine is unchanged); (3) the reference's
first `<nav>` is an inner scrollable div (258px inside the 260px shell —
the s156-documented probe artifact; the parent's width is the shared
measurement). The s142 probe settles on nav-links + heading
(pathname-agnostic), waits for the enabled submit button before clicking
(the preflight doctrine), and checks the OUTER sidebar footprint:
`scripts/parity-probe-s142.mjs` — MATCH, all five formal checks.

**Baseline noise observed (recorded, not findings):** none — the dev.log
tail carries boot traces only; no P1008-class noise during this cycle's
cold runs.

## §1 The audits (Mode-C, read-only subagents; findings re-verified by direct read)

Per the s141 closing directive — "the audit rotation continues (FE/views +
auth/crypto/infra are two cycles stale again)" — plus the recent-changes
focus the directive names ("particularly on the recent code changes"):

1. **Audit A — the Batch CP recent-changes audit** (the `459e7da` diff
   itself: the note-html policy pair, the CP3 import restructure, the
   export-build seam, the export panel/page, the new tests):
   **0C / 0H / 2M / 3L / 3I**. The CP1 snapshot fix verified real and
   complete for the wrapped-payload class; the CP3 all-or-nothing
   transaction verified intact (one `$transaction`, every throw path
   rolls back, chunk math inside SQLite limits); the probe-set derivation
   verified equivalent for every `knownIds` consumer. The Ms:
   **A-M1** — the CP6 depth cap does not bound the UNWRAP-path recursion
   (`processElement(m, depth)` passes depth unchanged; a chain of purely
   disallowed elements — `<div>`×20 000 within the 100k cap — recurses
   unbounded, throwing RangeError inside the editor mount IIFE: the exact
   bug class CP6 was written to close, still open through a different
   input shape); **A-M2** — the export size signal counts UTF-16 code
   units, not bytes (`json.length` for the `X-Export-Bytes` header, the
   page prop, and the over-cap threshold, while the import cap and the
   panel's file-picker pre-check use real bytes — a non-ASCII account
   straddling the 64 MiB cap gets NO warning; the seed's own `·`/`—`
   already under-report on the demo account).
2. **Audit B — the FE/views + auth/crypto/infra rotation** (the axis two
   cycles stale — 21 view files, the auth surface, the rate limiter, the
   settings path): **0C / 0H / 1M / 1L / 2I**, and the surface verified
   substantially clean — all SPECIAL-ATTENTION invariants re-verified
   holding (ownership scoping on every route, the scrypt KDF contract,
   the timing equalizer's parameter-pair uniformity, the
   set-state-in-effect compliance, no innerHTML outside the pinned gates,
   the fail-closed XFF parse). The M: **B-M1** — the note editor's
   actions dropdown nests a Radix `Select` (the notebook mover) inside
   `DropdownMenuContent` (`role="menu"`): Radix menus roving-focus only
   `DropdownMenuItem`-family elements and preventDefault Tab, so the
   mover is keyboard-unreachable (a WCAG 2.1.1 Level A failure on a real
   affordance) — the exact S125/BZ3 nested-interactive class that sweep
   missed. The L: **B-L1** — the appearance pickers' failed-save rollback
   is not compare-and-swap (a late-failing PATCH can overwrite a newer
   successful pick; the desync persists until reload).

**Every H/M/L finding above was re-verified by direct read of the current
tree before this plan was written** (the standing doctrine; the L-set:
A-L1 the import catch has no P2025 leg — verified at route.ts:583-627;
A-L2 the anchor `data:`/relative-href asymmetries between the doors —
verified at note-html.ts:101-111 vs server/note-html.ts:62/97-112;
A-L3 AGENTS.md's e2e census row reads 603 (150+185+87+95+86) vs the
actual 605 (150+186+87+95+87) — verified at AGENTS.md:14 against
README/CLAUDE/PAD and the cert script).

## §2 Findings → the CQ set

| ID | Source | Severity | Defect | Fix |
|---|---|---|---|---|
| CQ1 | Audit A M-1 | Medium (availability) | The DOM render gate's unwrap path recurses without incrementing depth: `processElement(m, depth)` at note-html.ts:151 — a purely-disallowed-element chain (`<div>`×20k, `<x>`×33k, within the 100k content cap) stack-overflows the editor mount (unhandled rejection, editor dead); the CP6 cap never fires because depth stays 0 | Increment depth on the unwrap recursion (`processElement(m, depth + 1)`); pin with a disallowed-chain leg (≥600-deep `<div>` chain → text, no throw) in the happy-dom unit project |
| CQ2 | Audit A M-2 | Medium (data portability) | The export size signal counts UTF-16 code units: `json.length` at export-build.ts / route.ts:49 (`X-Export-Bytes`) / page.tsx:96 / panel.tsx:165 (the over-cap threshold) — while the import cap (http.ts byte counter) and the panel's file-picker (`picked.size`) count real bytes; a non-ASCII account straddling the cap gets no warning; the header under-reports on the demo account already | The seam returns `{ json, bytes }` with `bytes = Buffer.byteLength(json)`; the route header, the page prop, and the panel threshold consume `bytes`; the s21 e2e pin re-anchored to the byte size |
| CQ3 | Audit B M-1 | Medium (a11y, WCAG 2.1.1 Level A) | The note-actions dropdown nests the notebook-mover `Select` inside `DropdownMenuContent` — Radix roving-focus never reaches it, Tab closes the menu; keyboard-only users cannot move a note to a notebook | The BZ3-pattern conversion: the actions menu becomes a `Popover` (real tab stops; Escape restores focus to the trigger; geometry classes mirror the menu's); the mover `Select` and the Delete action become real focusable controls inside it; a keyboard-reachability e2e leg pins the mover |
| CQ4 | Audit A L-1 | Low (correctness of the error taxonomy) | A row deleted between the CP3 probe and the write throws P2025 → the generic 404 ("That record does not exist.") instead of the route's named-409 family — the concurrent-modification shape the taxonomy otherwise maintains | A P2025 leg in the import catch mapping to the named 409 copy ("a row in this backup was deleted while this import ran — retry"); a census pin |
| CQ5 | Audit A L-2 | Low (security-seam consistency) | Four door asymmetries contradict the "the two doors accept the SAME payload set" comments: anchor `data:` hrefs (DOM keeps raster / server drops all), relative hrefs (server keeps / DOM drops), `rel` injection (server only), whitespace-only img `src` (server keeps / DOM removes) | Align to the anchor vocabulary (http/https/mailto at BOTH doors): the DOM gate drops anchor `data:` hrefs and injects `rel="noopener noreferrer"` on surviving anchors; the server's `a` transformTags filter drops scheme-less/relative hrefs; the server's img filter drops whitespace-only src; the comments state the true contract |
| CQ6 | Audit A L-3 | Low (doc accuracy, count-lockstep) | AGENTS.md's e2e census row reads 603 (150+185+87+95+86) — the actual is 605 (150+186+87+95+87); the S140/S141 cycles missed the e2e row while updating the unit row | The one-line fix + a script-conventions census leg pinning the AGENTS.md e2e row against the cert script's map (machine-gating the count claim, the neo-crm docs-counts pattern) |
| CQ7 | Audit B L-1 | Low (state consistency) | The appearance pickers' failed-save rollback restores `prev` unconditionally — a late-failing PATCH overwrites a newer successful pick (local store + localStorage disagree with the server until reload) | CAS-guarded rollback: restore only when the store's current value still equals the failed `next` (the `fetchSeq` idiom's compare-and-swap form); three call sites (theme/accent/avatar) |
| CQ8 | Audit B I-2 (promoted: trivial, availability) | Low rider | verify-email mints the session cookie from the PRE-transaction `sessionVersion` read — a concurrent reset-password in the window makes the fresh token born-invalid (one extra login; fails closed) | Mint from the transaction's returned row (`verifiedUser.sessionVersion`) — the one-line freshness fix |
| CQ9 | The doc chain | — | Census/lesson/revision updates for the whole cycle | README badge + Session-142 row; AGENTS census + S142 lessons; CLAUDE counts; PAD v1.3.50; SKILL census; vitest header; worklog Session 153; `docs/session_157.md`; this plan's §6 |

## §3 Per-item design

### CQ1 — the unwrap-path depth increment (Audit A M-1, the M)

`src/lib/note-html.ts:151`. The unwrap branch currently reads
`for (const m of moved) processElement(m, depth);` — the allowed-tag path
already increments (`walk(child, depth + 1)` at :203). The fix is the
one-token change `processElement(m, depth + 1)`: every unwrap consumes a
depth level, so a purely-disallowed chain hits the 500 cap and collapses
to its text content (a note that deep is not editor-authored — the CP6
posture, now actually enforced on both paths). **Pins:** (a) a
disallowed-chain leg in `tests/note-html-dom.test.ts` — a 600-deep
`<div>` chain (div is NOT in the allowlist) yields text, never throws;
(b) the existing allowed-tag depth-cap leg re-run unchanged; (c) a
mixed-chain leg (allowed wrapping disallowed wrapping allowed…) at ~600
levels. **RED demonstration:** the 600-deep disallowed chain throws
RangeError against the current code (the recursion is live since CP1).

### CQ2 — the byte-based export size signal (Audit A M-2, the M)

`src/lib/server/export-build.ts`, `src/app/api/export/data/route.ts:49`,
`src/app/export/page.tsx:96`, `src/components/export/export-panel.tsx`
(prop + threshold). The seam's return widens to
`{ json: string; bytes: number }` with
`bytes = Buffer.byteLength(json, "utf8")` — computed ONCE at the producer
(the BW8 single-source doctrine: the route, the page, and the panel all
consume the same number). The route header becomes
`"X-Export-Bytes": String(bytes)`; the page passes
`exportBytes={envelope.bytes}`; the panel's over-cap comparison and the
size line are unchanged (now fed real bytes). **Pins:** (a) a pure
formatting/derivation leg in `tests/data-export.test.ts` —
`exportByteSize(json) === Buffer.byteLength(json)` and
`> json.length` for a multi-byte fixture (the seed's own `—`); (b) the
seam census updated (the route imports `.bytes`, not `.length`); (c) the
s21 e2e pin re-anchored: `expect(Number(sizeHeader)).toBe(Buffer.byteLength(JSON.stringify(body)))`.

### CQ3 — the notebook-mover keyboard reachability (Audit B M-1, the M)

`src/components/views/notes-view.tsx:765-804`. The BZ3 remediation
pattern applied to the note-actions menu: the `DropdownMenu` +
`DropdownMenuContent` pair becomes `Popover` + `PopoverContent` (the
ui/popover primitives already imported at :53); the mover `Select` and
the Delete action ride the popover content as real focusable controls;
the trigger keeps its exact geometry (aria-label "Note actions", the
MoreVertical icon, the same classes). The popover content classes mirror
the menu's (`align="end"`, the same width/padding/shadow family). The
Delete action becomes a real `<button>` (the DropdownMenuItem styling
carried over — the red destructive pair). **Pins:** (a) an e2e
keyboard-reachability leg (notes surface): open the actions popover via
the trigger, TAB into the mover Select trigger (a real tab stop now),
select a notebook via the keyboard, assert the note's notebookId patched
— the pin that would have failed pre-fix (the mover was unreachable);
(b) the existing notes-view e2e legs re-run (the delete action still
works; the geometry unchanged). **Design note:** the Select INSIDE a
Popover is legal WAI-ARIA (a dialog-ish container with real tab stops,
unlike role="menu").

### CQ4 — the P2025 named-409 leg (Audit A L-1, the L)

`src/app/api/import/data/route.ts` catch block. After the P2028 leg, a
P2025 leg: "That backup contains a row that was deleted while the import
ran — it was fully rolled back. Retry the import." — the named-copy
taxonomy's concurrent-modification shape. **Pins:** a script-conventions
census leg (the P2025 marker + the copy present in the route source).

### CQ5 — the two-door alignment (Audit A L-2, the L)

Both doors, one anchor vocabulary (http/https/mailto — the Quill
toolbar's own set):
1. The DOM gate's `cleanUrl` drops anchor `data:` hrefs (the raster-MIME
   carve-out at note-html.ts:106-107 dies — anchors are not images; the
   `data:` branch returns null) and keeps http/https/mailto only.
2. The DOM gate's anchor branch injects `rel="noopener noreferrer"` on
   every surviving anchor (mirroring the server's transformTags :108-111).
3. The server's `a` transformTags filter drops scheme-less/relative hrefs
   (`/foo`, `#foo`, `foo` — never toolbar-authored) while `allowedSchemes`
   keeps killing scheme'd offenders; the filter also normalizes
   whitespace-only hrefs to deletion.
4. The server's img filter drops whitespace-only src (the
   `src.trim() &&` guard at server/note-html.ts:103 removed — empty src
   dies at both doors).
**Pins:** both-door legs for the aligned corpus (anchor data: href dies
at both; relative href dies at both; rel present on survivors at both;
whitespace-only src dies at both; the http/https/mailto quartet
survives at both); the comment blocks reworded to the true contract.
**Risk note:** relative-href deletion at the server door changes stored
output only for rows the DOM render gate already strips at read time —
write-time matches render-time by construction.

### CQ6 — the census fix + the machine gate (Audit A L-3, the L)

`AGENTS.md:14`: "603 tests across the 5-chunk cold map — 150+185+87+95+86"
→ "605 tests across the 5-chunk cold map — 150+186+87+95+87". A
script-conventions census leg reads AGENTS.md and the cert script's
expected map and asserts they agree (the count-claims machine gate).

### CQ7 — the CAS-guarded appearance rollbacks (Audit B L-1, the L)

`src/components/views/settings-view.tsx:141-166`. Each picker's catch
restores only when the store still holds the failed `next`:
`if (useThemeStore.getState().mode === next) setMode(prev);` — a newer
successful pick (the store moved on) is never clobbered by the late
failure. Three call sites (theme/accent/avatar — the store getters
verified at implementation time). **Pins:** a script-conventions census
marker (the CAS shape present at the three sites).

### CQ8 — the verify-email sessionVersion freshness (Audit B I-2, the rider)

`src/app/api/auth/verify-email/route.ts`: the cookie mint's
`sessionVersion: user.sessionVersion` → `sessionVersion:
verifiedUser.sessionVersion` (the transaction's returned row — fresh by
construction). **Pins:** a script-conventions census leg (the mint reads
the tx-returned row).

### CQ9 — the doc chain

The full set, per the standing convention: README badge/census + the
Session-142 row; AGENTS.md census + the S142 lessons block; CLAUDE.md
test counts; PAD v1.3.50 (the revision block + the §11 closure rows);
the SKILL census; the vitest header re-anchor; the worklog Session 153
entry; `docs/session_157.md`; this plan's §6 as-executed close.

## §4 TDD pin projections

| Layer | File | Δ legs | Content |
|---|---|---|---|
| Unit (happy-dom) | `tests/note-html-dom.test.ts` | +~4 | The disallowed-chain depth cap (600-deep `<div>` → text, no throw — RED pre-proven by the audit's analysis), the mixed-chain cap, the anchor data:/relative/rel legs on the DOM door, the whitespace-src leg |
| Unit | `tests/note-html.test.ts` | +~5 | The server-door anchor legs (data: dies, relative dies, rel injected, whitespace-src dies), the http/https/mailto survival quartet re-run |
| Unit | `tests/data-export.test.ts` | +~2 | `exportByteSize` byte-exactness + the multi-byte divergence leg |
| Unit | `tests/script-conventions.test.ts` | +~5 | The P2025 census, the AGENTS.md-e2e-row machine gate, the CAS markers, the verify-email mint census, the seam `.bytes` census |
| E2E | `tests/e2e/s21-data-export.spec.ts` | ~1 modified | The X-Export-Bytes pin re-anchored to `Buffer.byteLength` |
| E2E | the notes keyboard-reachability leg (new spec or an existing notes-family spec) | +1 | The mover Select reachable + operable by keyboard alone |
| Census | — | 1449 → ~1465 unit; 605 → ~606 e2e | The 5-chunk cold map re-tagged |

Every RED is demonstrated before its GREEN (the disallowed-chain RED is
pre-proven by direct code trace — the recursion provably runs unbounded
at depth 0; the rest follow the write-test → fail → implement → pass
loop).

## §5 Deferrals (documented, with rationale)

- **The A-M3 stage-2 (chunked sub-transactions + a resume token):**
  unchanged from the s141 plan §5 — it BREAKS the all-or-nothing ADR-021
  contract without operator direction; stage-1 already collapsed the lock
  window. The one named deferral, carried again.
- **Export streaming (the F2 second half):** unchanged — the size signal
  (now byte-accurate) closes the detection gap; the response-shape change
  defers with the stage-2 family.
- **Audit A I-1 (the CP3 marker censuses):** the standing census pattern
  — accepted as-is (the s23 wire pins are the behavioral backstop).
- **Audit A I-2 (the /export per-view envelope cost):** accepted by
  design, documented in the seam; the size signal is worth the per-view
  render on the owner-only surface.
- **Audit A I-3 (the post-sanitize entity expansion past the 100k cap):**
  self-account bloat only; re-checking length post-sanitize defers (it
  needs a named-copy decision on the reject-vs-truncate question).
- **Audit B I-1 (the register re-issue non-transactional triple):**
  self-healing on an unverified account; defers to the next auth-family
  cycle (the BT3 pattern is the shape when it lands).
- **The standing s133–s141 deferred set:** unchanged (see the s141 plan
  §5).

## §6 As-executed close

Executed 2026-11-05 (the 34th workspace continuation, a fresh clone at
`10d5a33` received). The plan held as written; the honest deltas:

- **CQ1**: the one-token unwrap fix landed as planned, but the pin design
  needed TWO iterations of its own — (1) the first RED shape (an
  8 000-deep chain asserting not.toThrow) is NOT demonstrable under
  happy-dom: probes isolated the throw to happy-dom's OWN library JS (the
  `[connectedToNode]` mutation cascade and the `innerHTML` serializer
  recurse natively and throw at ≥4 000 nesting, parse never throws), so
  the ≥4k not.toThrow guarantee is browser-only; (2) the depth-cap
  collapse itself (`child.replaceWith(child.textContent)`) was a native
  recursion that would throw the same way — the shipped shape collects
  text via an explicit-stack `subtreeText` (the rescue mechanism must not
  itself be the thrower). The unit pin that landed covers the cap
  SEMANTICS at a happy-dom-safe depth (a 550-deep disallowed chain:
  markup beyond the cap dies, its text survives) — the exact pattern of
  the existing CP6 allowed-chain leg.
- **CQ2**: the seam change went in clean (`{ json, bytes }`); one design
  correction mid-flight — the first `exportByteSize` draft used
  `Buffer.byteLength`, but the seam is client-imported by the export
  panel (the import-graph check caught it) — the shipped form is
  `new TextEncoder().encode(json).length` (byte-identical semantics,
  browser-safe). The s21 e2e pin re-anchored to `Buffer.byteLength` of
  the actual body.
- **CQ3**: the Popover conversion landed per the BZ3 pattern; the e2e leg
  needed two iterations — (1) the AH1 delete leg had to be re-anchored
  to the new button role (it clicked the old `menuitem` role); (2) the
  keyboard-commit keystrokes raced Radix's ASYNCHRONOUS roving focus (an
  Enter fired immediately after an Arrow key committed the
  still-focused CURRENT option — same value, no PATCH; and the
  arrow-landing point varied between runs). The deterministic shape:
  poll for the landed focus (role, then text) and commit with Enter; the
  live pre-pin probe (dev server) verified the combobox is the FIRST tab
  stop the moment the popover opens.
- **CQ6**: the machine gate found its own first catch — after updating
  the cert script's map to 606, the OLD S128/CC2 census leg (pinning
  605) failed and AGENTS.md still carried 606-vs-605 — both re-anchored
  in the same commit; the gate now reads AGENTS.md + the cert script and
  asserts agreement + the chunk-sum arithmetic.
- **Cert**: 150 + 187 + (85+2) + 95 + 87 — the chunk-3 failures were
  SELF-INFLICTED CONTENTION (the unit suite ran in a parallel tool call
  during the cert; the same BU1 files-view leg failed twice, green in
  2.5s isolation) + the P1008 socket-timeout class in the WebServer
  logs; the contention-free re-run was **87/87 first-pass**. Census:
  **1466 unit (47 files) + 606 e2e (150+187+87+95+87) = 2072 green**
  (was 2054).
- The live parity battery this cycle: the drawer check GREEN (the 57th
  consecutive no-Tailwind-v4-mobile-nav-bug confirmation), mobile-nav
  cold 20/20, and the desktop chrome probe **MATCH** on all five formal
  checks — after the s142 probe rework settled the reference host's
  splash-main artifact and `/Dashboard` redirect (the s141 probe's
  settled-state contract is now pathname-agnostic with the
  button-enabled pre-click wait; `scripts/parity-probe-s142.mjs`).
- Evidence: four `docs/screenshots/142-clone-*.png` frames. The probe
  note rows cleaned from the dev db after the CQ3 probe (the
  demo-surface-restoration convention).
- Deferrals carried forward (§5 stands): the A-M3 stage-2 (needs
  operator direction on the ADR-021 contract change), the export
  streaming half, the register re-issue transactional triple, the
  post-sanitize entity-expansion re-check.

# Remediation Plan — Session 141 (Cycle 91, Batch CP)

> Status: PLANNED (pre-change record — the immutable plan; the as-executed
> close lives in §6). Written before any source change, per the standing
> doctrine ("write the cycle plan into docs/remediation-plan-sessionN.md
> BEFORE any source change").
>
> Operator directive: refresh the workspace, re-read the doc chain
> (AGENTS/CLAUDE/README/PAD/SKILL + session_153/154 +
> remediation-plan-session140 + worklog), validate against the codebase,
> audit with the repo-included skills (skills/web-application/SKILL.md the
> primary; the skills catalog for the rotation), iterate toward
> visual/functional parity with omni-study1.base44.app (agent-browser live
> comparison, mobile-navigation attention, Tailwind v4 bug watch), provision
> `.env` with `DATABASE_URL="file:../db/custom.db"` + the repo-root `db/`,
> validate the vitest/playwright suites, remediate TDD-first, capture
> evidence frames, update the doc chain, push via the SSH wrapper. The
> repo's `skills/` folder stays excluded from code checking, testing, and
> compilation.

## §0 Scope, method, cold baseline, live parity

**Workspace (the 33rd continuation).** Working clone at `c654ed0` (the
s140 Batch CO fix `9cb5a10` + the operator's session_154 transcript
commit). Environment re-verified per the recipe: `.env` from
`.env.example` (`DATABASE_URL="file:../db/custom.db"`, `AUTH_SECRET=""`
— the e2e-build posture), `db/custom.db` (388 KiB) + `db/e2e.db` at the
repo root (the three-anchor contract holding — no code change needed;
`db-path.ts` re-anchors both doors), the dev daemon live on :3000
(setsid nohup — the documented reaper mitigation), `bun install`
state current (491 pkgs incl. sanitize-html 2.18.1, Prisma 6.19.3).

**Cold baseline (before any work):**

| Gate | Result |
|---|---|
| `bun run lint` | ✓ 0 errors |
| `bun run typecheck` | ✓ 0 errors |
| `bun run test` (Vitest) | ✓ 1409/1409 (46 files) |
| dev-server preflight | GREEN (hydrated, navigation-stable) |
| `node scripts/drawer-check-s14.mjs` (both hosts, live reference login) | GREEN — **the 56th consecutive no-Tailwind-v4-mobile-nav-bug confirmation** (reference backdrop `bg-black/20`+`blur(4px)` ≡ clone `backdrop-blur-xs`; 288px white panels; 20 links; no footer; Escape-close superset) |
| `npx playwright test tests/e2e/mobile-navigation.spec.ts` (cold db) | ✓ 20/20 (34.2s) |

**Live parity re-verification (agent-browser-era scripts, fresh on BOTH
hosts):** the reference logged in (operator account). The mobile drawer
computed styles byte-matched (the 288px `w-72` white panel, black/20
backdrop at blur(4px) — the v3 `backdrop-blur-sm` ≡ v4
`backdrop-blur-xs` trap-9 equivalence verified live; exactly 20 links,
no footer). Desktop chrome: 20 nav links in identical order both hosts,
main at x=260 w=1180 both hosts (a one-off ad-hoc probe read the
reference's inner nav-shaped element at 258px vs the clone's inner
`nav` at 260px — probe-artifact class, both outer footprints identical;
the authoritative geometry pins live in `tests/e2e/navigation.spec.ts`).
**No mobile-nav gap; no Tailwind v4 bug.**

**Empirical environment facts probed this cycle (feeding §3 CP3):**
SQLite 3.46.0 (the 32 766-variable class); `IN` probes verified at 900 /
5 000 / 20 000 ids; `createMany` binding verified at 1 000 rows × 5
fields (5 000 params) — the parameter ceiling is nowhere near the
planned chunk sizes. `PRAGMA journal_mode` = `delete` (not WAL),
`busy_timeout` = 5 000 — the write-lock window is the real availability
constraint, exactly as the standing A-M3 record states.

**Baseline noise observed (recorded, not findings):** the dev.log tail
carries the prior session's request traces only; no P1008-class noise
observed during this cycle's cold runs.

## §1 The audits (Mode-C, read-only subagents, findings re-verified by direct read)

Per the s140 closing directive — the A-M3 restore-availability
performance cycle is "the only standing M-family deferral" and the named
candidate for this session — plus the recent-changes focus the directive
names ("particularly on the recent code changes"):

1. **Audit A — the Batch CO recent-changes audit** (the 9cb5a10 diff
   itself: the note-html pair, the authBurnGlobal quartet, the CO3/CO4
   FE octet, the new tests): **0C / 1H / 1M / 5L / 4I**. Both write
   doors verified genuinely covered (no third note-write path exists —
   seed + plant script only); the quartet wiring byte-identical across
   all four routes with correct PROTECTED_BUCKETS registration; the FE
   octet all landed. The H: the DOM render gate's moved-children walk
   is **provably dead code** (a `DocumentFragment` is EMPTIED by
   `replaceChild` — the post-insertion `Array.from(frag.children)`
   iterates zero elements; empirically verified in headless Chromium:
   a `<div>`-wrapped remote img, `javascript:` link, `onclick` handler,
   and hostile inline style all survive the gate untouched). The M: the
   server sanitizer re-serializes plain-text entities (`AT&T` →
   `AT&amp;T`), contradicting its own byte-identity contract and
   rendering the entities as visible text through `quill.setText`.
2. **Audit B — the data-portability surface** (the A-M3 axis:
   import/restore/export): **0C / 0H / 2M / 3L / 3I**, plus the
   standing-findings re-verification table. A-L1/A-L2/A-L4 verified
   FIXED with pins (the S139/CN6/CN7/CN8 work holds). **A-M3 and A-I1
   still present exactly as recorded** (re-verified by direct read:
   `route.ts:366-470` — one interactive transaction, `findFirst` +
   `update|create` per row, `{ timeout: 60_000 }` only; the 20
   unconditional full-table `findMany` pre-scans at `route.ts:241-261`).
   NEW this cycle: the sanitize pass runs per-notes-row INSIDE the
   transaction (`route.ts:394-400` — CPU inside the lock window);
   `maxWait` unset and the 60 s timeout pinned by nothing; the
   export/import size asymmetry has no detection point (an account past
   ~23 max-size files downloads a backup the in-app restore will always
   413 — with no in-app signal and each retry burning budget).

**Every H/M/L finding above was re-verified by direct read of the
current tree before this plan was written** (the standing doctrine; the
two subagent reports agree with the source at every cited line).

## §2 Findings → the CP set

| ID | Source | Severity | Defect | Fix |
|---|---|---|---|---|
| CP1 | Audit A F1 (H) | High (security) | The DOM render gate's moved-children walk is dead code: `frag.children` snapshotted AFTER `replaceChild` is always empty — hostile markup one nesting level deep (the realistic pre-CO1 legacy shape: pasted newsletter wrappers) escapes the gate entirely; zero unit coverage of `sanitizeNoteHtmlDom` (node env) and the e2e plant fixture only carries top-level hostile elements | Snapshot the moved children BEFORE the insertion; add a happy-dom unit project pinning the nested-hostile corpus; extend the e2e plant fixture + render-gate leg with a wrapped payload |
| CP2 | Audit A F2 (M) | Medium (correctness) | The server sanitizer unconditionally re-serializes plain text (`AT&T` → `AT&amp;T`, `5 < 6` → `5 &lt; 6`) — the documented "plain-text rows round-trip byte-identically" contract is false, and the entities render as visible text through `quill.setText` | Gate the server sanitizer on the SAME `looksLikeHtml` probe the DOM gate uses (plain text → byte-identical passthrough) + entity-bearing pins + the comment made true |
| CP3 | Audit B F1/F3/F4/F5 (= A-M3 + A-I1, the standing M family) | Medium (availability) | The restore holds the SQLite RESERVED lock for the whole 2N+1-query interactive transaction (per-row `findFirst` reads + the notes sanitize CPU + merge-guard reads all INSIDE the lock window); the knownIds pre-scan queries all 20 collections unconditionally at O(account) cost; `maxWait` unset, the 60 s timeout pinned by nothing | The contract-preserving restructure: hoist EVERY read + all CPU out of the transaction (IN-probe knownIds at O(envelope), the create/update split, merge-guard partner legs, the notes sanitize); `createMany` (chunked) for the create set; per-row updates only in-tx; a cross-account collision pre-flight (the named 409 pre-write); explicit `{ timeout, maxWait }` + census pins. The all-or-nothing ADR-021 contract is PRESERVED |
| CP4 | Audit B F2 (M) | Medium (data portability) | The export/import size asymmetry has no detection point: the unbounded export can exceed the 64 MiB restore cap silently; the only remedy ("split the backup") has no in-app signal; each blind retry burns import budget | A shared server seam renders the envelope ONCE for both the route (the download) and the `/export` page (an exact `exportBytes` prop); the panel's Download card shows the size and warns when it exceeds `IMPORT_MAX_BYTES`; the route sets `X-Export-Bytes` |
| CP5 | Audit A F3/F4/F9 (L set) | Low (security/consistency) | Sanitize-policy gaps on both doors: any `data:` MIME survives the img gate (`data:text/html`, `data:image/svg+xml`); style VALUES are unconstrained (`url(...)`, `expression()` pass); `<a target=_blank>` survives without `rel` | Tighten both doors to the raster-image data: MIME set (png/gif/jpeg/webp — svg excluded), a color-grammar value constraint, and a `transformTags` rel-injection; mirror in the DOM gate |
| CP6 | Audit A F7 (L) | Low (resilience) | The DOM-gate `walk()` recurses per nesting depth — ~25k-deep allowed-tag nesting (expressible within the 100k-char cap) throws RangeError inside the mount IIFE (unhandled rejection, editor dead) | A depth cap (~500): beyond it the walk bails to the escaped-text form; unit-pinned |
| CP7 | Audit A F8 + Audit B F7 (I/L) | Info (maintainability/doc accuracy) | DRY + comment-accuracy drift inside the "one source of truth" policy pair: the server OPTIONS re-declares the class regex + style list inline; `quill-editor` re-inlines the html probe; the anchor `data:` rule diverges between doors; the import-route "byte-identically" and data-import "forward-compat" comments overstate | Import the shared constants; call `looksLikeHtml`; align the anchor rule; reword the three comments (CP2 makes one of them true rather than reworded) |
| CP8 | The doc chain | — | Census/lesson/revision updates for the whole cycle | README badge + Session-141 row; AGENTS census + S141 lessons; CLAUDE counts; PAD v1.3.49; SKILL census; vitest header; worklog Session 152; `docs/session_155.md`; this plan's §6 |

## §3 Per-item design

### CP1 — the render-gate fragment-snapshot fix (Audit A F1, the H)

`src/lib/note-html.ts:96-108`. The DOM spec moves (not copies) a
`DocumentFragment`'s children into the insertion parent — the current
code snapshots `frag.children` AFTER `parent.replaceChild(frag, child)`
and therefore iterates zero elements. The fix is the two-line
reordering:

```ts
const moved = Array.from(frag.children);   // BEFORE the insertion
parent.replaceChild(frag, child);
for (const m of moved) walk(m);            // now actually runs
```

The misleading block comment (lines 101-106 — it asserts a walk that
provably never ran) is rewritten to state the snapshot-before-insertion
contract. **Pins:** (a) a NEW `tests/note-html-dom.test.ts` running
under `// @vitest-environment happy-dom` (happy-dom joins as a
devDependency — the vitest 5 environment provider; the S140
sanitize-html precedent for dependency discipline, dev-side this time):
the nested-hostile corpus (`<div><img src=https://…>` wrapped remote
img, `<div><a href="javascript:…">`, `<div><span onclick=…>`,
`<section><article><img…>` double-nesting, the hostile-style wrapper)
plus the top-level control cases (which already work — pinned so the
regression can never resurface) and the plain-text passthrough. (b) the
e2e plant script (`scripts/e2e-plant-legacy-note.ts`) gains a
wrapped-payload note; the render-gate leg in
`tests/e2e/parity-session9.spec.ts` asserts the wrapped remote img dies
too. **RED demonstration:** the nested corpus fails against the current
code (verified empirically in Chromium by the audit — the RED is
pre-proven; the happy-dom run must reproduce it before the fix lands).

### CP2 — the plain-text passthrough gate (Audit A F2, the M)

`src/lib/server/note-html.ts:69-71`. `sanitizeNoteHtml` gains the DOM
gate's own first line: `if (!looksLikeHtml(html)) return html;` —
plain-text rows (no markup) become byte-identical by construction, and
the two doors finally enforce the SAME first-line contract. Entity-
bearing markup rows (`AT&T` inside `<p>`) still serialize to
`&amp;` — that is HTML-correct (a text node's canonical serialization)
and renders identically through Quill; the COMMENT is reworded to the
true contract ("plain text passes through byte-identically; markup rows
re-serialize canonically"). **Pins:** entity-bearing legs in
`tests/note-html.test.ts`: `sanitizeNoteHtml("AT&T rules")` →
byte-identical; `sanitizeNoteHtml("5 < 6")` → byte-identical; a markup
row with an entity round-trips render-stably (`<p>AT&T</p>` → `<p>AT&amp;T</p>`).

### CP3 — the restore-availability restructure (A-M3 + A-I1, the standing M family — contract-preserving)

`src/app/api/import/data/route.ts`. The staged restructure (all design
facts verified by direct read + the SQLite probes above):

1. **The IN-probe pre-flight (replaces the 20 unconditional full-table
   scans, fixes A-I1).** Per collection CARRYING envelope rows:
   `findMany({ where: { id: { in: chunk(envelopeIds, 5000) },
   …ownership scope }, select: { id, …mergeGuardSelect } })` — cost
   O(envelope), yields the create/update discriminator (existingIds)
   AND the merge-guard partner legs in one pass. Per FK-TARGET
   collection (derived from `IMPORT_FK_MAP`: a target is probed when a
   source with rows references it — a cards-only envelope still probes
   `decks`, the pinned s23 case): the REFERENCED values are collected
   from the envelope rows' FK fields and IN-probed — knownIds becomes
   envelopeIds ∪ probed-referenced-existing, exactly equivalent to the
   old full census for every decision that reads it (FK resolution,
   required-FK-on-create, optional-FK nulling). The folders self-FK
   rides the same probe.
2. **The cross-account collision pre-flight.** For envelope ids NOT
   found in the owned probe: one unscoped `findMany({ where: { id: {
   in: unfound } }, select: { id } })` per collection (deck-scoped for
   cards). A hit answers the EXISTING named 409 copy ("collides with an
   existing record … belongs to another account") pre-write — fast, and
   with the specific id the current per-row catch names. The residual
   CE7 concurrent-create race (a write landing between probe and
   transaction) still throws P2002 from the write and rides the
   existing catch — the all-or-nothing rollback holds either way.
3. **Everything hoisted OUT of the transaction.** The notes
   sanitizeNoteHtml pass (Audit B F4 — pure CPU inside the lock window
   today) folds into the pre-tx stage; the merge guards run pre-tx
   against the probe's partner legs (TOCTOU-equivalent to today's
   in-tx read — the same concurrent-PATCH race, unchanged); the
   create/update split is precomputed.
4. **The write loop becomes write-only.** Per collection in
   IMPORT_ORDER: the update set runs per-row `update` (Prisma has no
   bulk distinct-payload update; N fast indexed-PK writes, zero
   read-awaits); the create set runs chunked `createMany` (500
   rows/chunk — the 32 766-param ceiling verified at 5 000+; folders
   parents-first order preserved within the chunk array). In-tx
   queries: U + ceil(C/500) + 1 (the profile patch) — vs today's 2N+1
   with interleaved reads and sanitize CPU.
5. **The transaction options made explicit and pinned.**
   `{ timeout: 60_000, maxWait: 5_000 }` — maxWait hoisted off the 2 s
   default (under a concurrent restore, an unrelated user write must
   not P2028 at slot acquisition after 2 s); the census pins the pair
   (a regression to the 5 s default or an option deletion fails a
   test).
6. **The contract is PRESERVED.** ONE transaction, all-or-nothing,
   upsert-by-id, never-deletes — the ADR-021 shape, the e2e rollback
   pin, the idempotent re-import pin, and every message contract stay
   untouched. The counts (`imported` per collection) derive from the
   precomputed split — byte-identical summaries.

**Pins:** the pure helpers (the probe-set derivation from
IMPORT_FK_MAP, the chunk math) land in the client-importable seam
(`src/lib/data-import.ts` — pure data, no deps) with unit legs; the
route's shape is census-pinned (the createMany + maxWait + hoisted-
sanitize markers in `script-conventions.test.ts`); the s23 round-trip /
idempotence / rollback legs run UNTOUCHED (the strongest pin — the
restructure must be behavior-invisible to the wire contract).

### CP4 — the export size signal (Audit B F2, the M)

1. A new server seam `src/lib/server/export-build.ts`:
   `renderExportEnvelope(userId)` — the 20 parallel findMany reads +
   `buildDataExport` + `JSON.stringify`, extracted VERBATIM from the
   route (the BW8 single-source doctrine: the route and the page share
   one source; the route keeps its own rate-limit + download-headers
   shell and gains `X-Export-Bytes: <n>`).
2. The `/export` page (server component) calls the seam and passes
   `exportBytes` to the panel. Cost honesty: the owner surface (linked
   from nowhere, direct navigation) now renders the envelope per view —
   the same work the download already does, on a page that already
   runs 20 count queries; accepted and documented (the F2 detection
   half is worth it; the streaming half is deferred, §5).
3. The panel's Download card renders the size line ("≈ 12.4 MB") and,
   when `exportBytes > IMPORT_MAX_BYTES`, an amber `role="status"`
   warning naming the cap and the consequence ("a restore from this
   file will be rejected — keep it as an archive or prune large files
   before exporting"). The Download ANCHOR itself stays byte-identical
   (the pinned S21 surface).
**Pins:** unit legs for the seam's byte-exactness (the same input →
the same string the route answers); an e2e leg on the panel journey
(the size line renders; the X-Export-Bytes header matches the rendered
size) — riding the existing panel-journey budget, no new POSTs.

### CP5 — the sanitize-policy tightening pair (Audit A F3/F4/F9, the L set)

Both doors, one policy: (a) the img `data:` rule tightens from
"scheme-only" to the raster MIME set `png|gif|jpeg|webp` (svg+xml
EXCLUDED — script-capable; `data:text/html` dies) — the server via a
`transformTags` img filter, the DOM gate via the existing regex
tightened and shared from `note-html.ts`; (b) style VALUES constrain to
the color grammar (`#hex | rgb()/rgba() | hsl()/hsla() | named-color`)
on both doors; (c) `transformTags` injects `rel="noopener noreferrer"`
on every surviving `<a>`. **Pins:** hostile legs (svg data-uri img,
url() style value, target=_blank anchor) at both doors; the
Quill-vocabulary quartet re-run (no authentic-content regression).

### CP6 — the walk depth cap (Audit A F7, the L)

`sanitizeNoteHtmlDom`'s `walk` gains a depth parameter; beyond 500 the
subtree is replaced by its escaped text content (the hostile-input
posture: a note that deep is not editor-authored). Unit-pinned at the
DOM project (a 600-deep allowed-tag chain yields text, not a
RangeError).

### CP7 — the DRY + doc-accuracy sweep (Audit A F8 + Audit B F7, the I set)

The server OPTIONS imports `NOTE_HTML_CLASS_PATTERN` /
`NOTE_HTML_STYLE_PROPS` (the inline twins die); `quill-editor.tsx`
calls `looksLikeHtml` (the re-inlined regex dies); the anchor `data:`
rule aligns between doors (CP5's shared MIME set covers it); the
data-import "forward-compat" comment rewords to the true
PrismaClientValidationError behavior; the import-route
"byte-identically" comment is made true by CP2. All
comment-accuracy-only edits — no behavior change beyond CP2/CP5.

### CP8 — the doc chain

The full set, per the standing convention: README badge/census + the
Session-141 row; AGENTS.md census + the S141 lessons block; CLAUDE.md
test counts; PAD v1.3.49 (the revision block + the §11 A-M3/A-I1
closure rows); the SKILL census; the vitest header re-anchor; the
worklog Session 152 entry; `docs/session_155.md`; this plan's §6
as-executed close.

## §4 TDD pin projections

| Layer | File | Δ legs | Content |
|---|---|---|---|
| Unit (NEW, happy-dom) | `tests/note-html-dom.test.ts` | +~12 | The nested-hostile corpus (RED pre-proven in Chromium), the top-level controls, the depth cap, the plain-text passthrough, the tightened MIME/style rules on the DOM door |
| Unit | `tests/note-html.test.ts` | +~8 | The entity-bearing passthrough pair (CP2), the markup-row canonical serialization, the svg/data-text/html img legs, the url()/expression() style legs, the rel injection, the anchor data: alignment |
| Unit | `tests/data-import.test.ts` | +~5 | The probe-set derivation (FK-target coverage incl. the cards→decks case, the folders self-FK), the chunk math at the verified constants |
| Unit | `tests/script-conventions.test.ts` | +~4 | The route censuses: `{ timeout: 60_000, maxWait: 5_000 }`, the createMany marker, the hoisted-sanitize marker, the seam-import census |
| Unit | `tests/export-build.test.ts` (NEW) | +~3 | The seam's byte-exactness + the size-warning threshold derivation |
| E2E | `tests/e2e/parity-session9.spec.ts` | +1 | The render-gate leg's wrapped-payload assertion (the plant script grows the row) |
| E2E | `tests/e2e/s23-import.spec.ts` | +1 | The export size-signal panel leg (size line + header) riding the existing journey |
| Census | — | 1409 → ~1441 unit; 605 → ~607 e2e | The 5-chunk cold map re-tagged |

Every RED is demonstrated before its GREEN (the nested-corpus RED is
already empirically proven in Chromium by the audit; the rest follow
the write-test → fail → implement → pass loop).

## §5 Deferrals (documented, with rationale)

- **The A-M3 stage-2 (chunked sub-transactions + a resume token):**
  the audit's own analysis — contiguous IMPORT_ORDER slices are safe
  and upsert-by-id makes chunks idempotent — is sound, but the shape
  BREAKS the all-or-nothing ADR-021 contract (route header copy +
  the e2e rollback pin) and contradicts a standing ADR without
  operator direction. The s140 precedent (Auth I-4 / sessionVersion)
  applies: document, defer, keep the contract. CP3's stage-1 collapses
  the lock window by removing every read + all CPU from the tx and
  bulk-creating — the availability win without the contract change.
  Stage-2 remains the named candidate if measurement shows a residual
  window.
- **Export streaming (F2's second half):** the size signal (CP4)
  closes the detection gap; collection-by-collection streaming bounds
  peak memory but changes the response shape — deferred with the
  stage-2 family.
- **Audit A F5 (the fleet-of-own-accounts success path):** the
  documented CM3 net-of-successes trade-off — strictly better than
  pre-CO2 (no aggregate at all); accepted, documented here.
- **Audit A F6 (the reset→authed availability coupling):** the
  loginGlobal-pattern trade-off (same DoS-by-design class); accepted,
  documented here.
- **Audit A F10 (pasted remote images silently dropped at save):**
  the intentional policy (the tracking-pixel class must die); the UX
  affordance (a toast on sanitize-removal) deferred — needs a
  count-aware sanitizer API, its own cycle.
- **The standing s133–s140 deferred set:** unchanged (see the s140
  plan §5).

## §6 As-executed close

Executed 2026-11-05 (the 33rd workspace continuation, `c654ed0`
received). The plan held as written; the honest deltas:

- **CP1**: the fix needed TWO iterations — the snapshot reordering
  alone left the moved elements ungated (walk() visits a node's
  CHILDREN; the moved element's own attributes survived). The shipped
  shape extracts a per-element processElement() and calls it on every
  moved child; the nested corpus, the depth cap, and the tightened
  DOM-door rules landed as the repo's first happy-dom unit file (17
  legs; 9 RED on first run — the dead-walk bug reproduces under
  happy-dom exactly as in Chromium).
- **CP3**: the route restructure went in clean — the dev-server
  behavioral probe (created 4 / idempotent updated 4 / the hostile
  note stored stripped) plus every s23/resilience/s14 wire leg green
  untouched; the counts derive from the precomputed split,
  byte-identical summaries; the cross-account pre-flight answers the
  CN2 409 leg's exact copy pre-write.
- **CP4**: the /export page's per-view cost doubling accepted as
  documented; the CJ2 export censuses re-anchored onto the new seam
  (the route-level findMany census would have failed — the reads
  moved).
- **Cert**: 605/605 with one environmental correction — the chunk-2
  P1008 I/O-stall flake (one test, different per run; the re-run
  186/186 first-pass). Census: **1449 unit (47 files) + 605 e2e =
  2054 green** (was 2014).
- **The session's operational incident**: the main session's shell
  gateway died mid-cycle (after a heavy foreground cert chunk); the
  cert, the evidence captures, and the doc chain completed through
  delegated subagents — identical results, recorded for the handoff.
- Evidence: four `docs/screenshots/141-clone-*.png` frames (the
  render-gate frame machine-verifies 0 outbound attempts + 0 remote
  imgs on the planted WRAPPED payload; the export frame shows the
  size signal). The probe note cleaned from the dev db after the
  capture.
- Deferrals carried forward (§5 stands): the A-M3 stage-2 (chunked
  sub-transactions + a resume token — needs operator direction on
  the ADR-021 contract change), the export streaming half, the accepted
  authBurnGlobal residuals (F5/F6), the sanitize-removal UX
  affordance.

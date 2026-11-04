# Remediation Plan — Session 140 (Cycle 90, Batch CO)

> Status: PLANNED (pre-change record — the immutable plan; the as-executed
> close lives in §6). Written before any source change, per the standing
> doctrine ("write the cycle plan into docs/remediation-plan-sessionN.md
> BEFORE any source change").
>
> Operator directive: refresh the workspace, re-read the doc chain
> (AGENTS/CLAUDE/README/PAD/SKILL + session_150/151/152 +
> remediation-plan-session139 + worklog), validate against the codebase,
> audit with the repo-included skills (skills/web-application/SKILL.md the
> primary), iterate toward visual/functional parity with
> omni-study1.base44.app (agent-browser live comparison, mobile-navigation
> attention, Tailwind v4 bug watch), provision `.env` with
> `DATABASE_URL="file:../db/custom.db"` + repo-root `db/`, validate the
> vitest/playwright suites, remediate TDD-first, capture evidence frames,
> update the doc chain, push via the SSH wrapper.

## §0 Scope, method, cold baseline, live parity

**Workspace (the 32nd continuation).** Fresh clone at `6485364` (Batch CN
`b557019` + two operator session-log commits). Provisioned per the recipe:
`bun install` (491 pkgs, 6.8s) → `.env` from `.env.example`
(`DATABASE_URL="file:../db/custom.db"`, `AUTH_SECRET=""` — the e2e-build
posture) → `bun run db:push` + `db:seed` (db/custom.db 380 KiB at repo root,
demo account seeded) → `bunx playwright install chromium` (chromium-1243
re-provisioned after the workspace reset) → `bun run build` (green, the six
documented Turbopack warnings).

**Cold baseline (before any work):**

| Gate | Result |
|---|---|
| `bun run lint` | ✓ 0 errors |
| `bun run typecheck` | ✓ 0 errors |
| `bun run test` (Vitest) | ✓ 1391/1391 (45 files) |
| `bun run build` | ✓ (standalone + static copy) |
| `bunx playwright test tests/e2e/mobile-navigation.spec.ts` (cold db) | ✓ 20/20 (32.4s) |
| dev-server preflight | GREEN (hydrated, navigation-stable) |
| `node scripts/drawer-check-s14.mjs` | GREEN — **55th consecutive no-Tailwind-v4-mobile-nav-bug confirmation** (backdrop `oklab(0 0 0 / 0.2)` + `blur(4px)` + 390px; panel white 288px; 20 links; no footer; Escape-close superset) |
| register tripwire | not re-run this cycle (unchanged tree; the S139 census holds) |

**Live parity re-verification (agent-browser 0.41.1, both hosts):**

- Reference `omni-study1.base44.app` logged in (operator account) — dashboard
  structure captured: 20 nav links (identical order both hosts), greeting
  heading, 4 stat cards, Today's Tasks / Upcoming Exams / Upcoming
  Assignments sections.
- **Mobile drawer, reference vs clone (computed styles — the ground-truth
  doctrine):** reference panel `lg:hidden fixed left-0 top-0 h-screen w-72
  bg-white z-50 shadow-2xl` (288px, white, 20 links) + backdrop
  `fixed inset-0 bg-black/20 backdrop-blur-sm z-50`; clone panel
  `absolute inset-y-0 left-0 flex w-72 max-w-[85vw] flex-col bg-white
  shadow-2xl dark:bg-slate-950` (288px, white, 20 links) + backdrop button
  `absolute inset-0 bg-black/20 backdrop-blur-xs` (blur(4px) — the v3
  `backdrop-blur-sm` ≡ v4 `backdrop-blur-xs` trap-9 equivalence, verified
  live on both hosts). **Match on every measured axis.** Clone supersets
  intact: `role="dialog"` + `aria-label="Navigation menu"`, labeled
  hamburger, Escape/backdrop close, focus lifecycle.
- **Desktop chrome:** reference sidebar 260px glass `hidden lg:flex fixed …
  z-40`, main column x=260 w=1180; clone identical (20 links in order, main
  x=260 w=1180).
- The reference's `/Timetable` "My Classes" section renders its EMPTY state
  on the operator account ("No subjects added yet…") — no card-cap
  measurement exists (data-shaped probes non-authoritative, S123 doctrine);
  see CO4c's honest-resolution decision.

**Baseline noise observed (recorded, not findings):** one
`[WebServer] P1008` RumEvent socket-timeout line during the
mobile-navigation spec's webserver teardown — all 20 tests green; the
documented machine-load class. Watch for recurrence in the cert run.

## §1 The audits (Mode-C, read-only subagents, findings re-verified)

Per the S139 closing directive — the s138 axes (FE/views +
auth/crypto/infra) two cycles stale — plus the standing A-L3 deferral:

1. **Audit A — FE/views axis** (`src/components/views/*` 22 files +
   `src/components/layout/*` 6 files, ~14k lines): **0C / 0H / 1M / 6L / 9I**.
   Every mechanically-checkable hard rule passes (no
   `dangerouslySetInnerHTML` in scope, zero set-state-in-effect, zero
   fresh-array store selectors, trap-4 respected, drawer contract complete,
   one-source nav/headers/empties, icon-only a11y labels everywhere,
   loading/empty/error states explicit). Verdict: exceptionally clean.
2. **Audit B — auth/crypto/infra axis** (20 files, ~2.9k lines): **0C / 0H /
   1M / 1L / 8I**. All documented contracts verified upheld in code (scrypt
   KDF at OWASP floor + versioned dual-verify; timing equalizers across the
   full branch matrix; HMAC sessions + `v` + `sessionVersion` re-check;
   PROTECTED_BUCKETS exact-key whitelist; boot guards; fail-closed proxy
   parse; db-path three-anchor; one-shot token consumption; hashed reset
   tokens + peppered OTP; body caps + content-type gate; no secret leakage).
3. **Audit C — A-L3 note-HTML surface** (the standing deferral): **0C / 0H /
   1M / 2L / 3I**. The deferred finding VERIFIED end-to-end: both entry
   points (direct API + import) accept arbitrary HTML ≤100k chars with zero
   HTML inspection; the render sink (`quill.clipboard.dangerouslyPasteHTML`,
   quill-editor.tsx:254-255) re-materializes stored HTML — Quill's Delta
   round-trip drops scripts/handlers but the Image/Video/Link blots keep
   remote URLs alive (tracking-pixel / remote-iframe / click-beacon class);
   production currently leans on the S138/CM9 CSP (`img-src 'self' data:`,
   production-conditional) as the single backstop; zero test coverage of
   note-HTML anywhere. Editor-authored content is structurally benign (the
   BW10 gate inserts images as `data:` only — F7), so an allowlist
   sanitizer destroys zero authentic content.

## §2 Findings → the CO set

| ID | Source | Severity | Defect | Fix |
|---|---|---|---|---|
| CO1 | Audit C F1/F2/F4 | Medium (security) | Note-HTML: both entry points unvalidated; render sink keeps remote img/iframe; zero pins | Allowlist sanitizer at a server seam covering BOTH doors + a DOM render-gate for legacy rows + RED/GREEN pins (unit + e2e) |
| CO2 | Audit B M-1 | Medium (DoS containment) | change-password / change-email / delete-account / reset-password burn synchronous scrypt with only per-user/per-IP budgets — no process-wide aggregate (the CK1 family never swept across siblings) | One shared `authBurnGlobal:` aggregate (40/15min, decrement-on-success) on all four routes + PROTECTED_BUCKETS registration + census pins |
| CO3 | Audit A M-1 | Medium (correctness/visual) | Dashboard completed-task checkbox assembles classes by raw string concatenation — `border-slate-300`+`border-sf-primary` and `bg-white`+`bg-sf-primary` coexist; emission order decides the winner, not the author (the codebase's own `cn()` convention exists for exactly this; the Tasks-view sibling resolves the same conflict correctly) | Route through `cn()` mirroring `PriorityCheckbox` (shared.tsx:247) |
| CO4a | Audit A L-1 | Low | Exam card topic chips key on the bare topic — duplicate topics produce duplicate React keys (the dialog's own chips already use the value-index composite) | `key={`${topic}-${i}`}` at exams-view.tsx:371 |
| CO4b | Audit A L-2 | Low | Calendar timeline + day-detail loading gates test only `events.length === 0` while the surfaces render 2 and 5 collections — the S138/CM2 OR-form doctrine deviation (mixed-landing partial-data flash) | OR-form over each surface's actual sources |
| CO4c | Audit A L-3 | Low | Timetable "My Classes" silently truncates at 9 cards — no comment, no reference citation, no affordance; perceived data loss | Render all classes (the grid handles the domain scale); the reference renders an empty state here — nothing to preserve |
| CO4d | Audit A L-6 | Low | Calculator UnitPanel: dead initializer ternary (category is always Length at mount) + `switchCategory` re-defaults to mm→m instead of restoring the measured m→ft default | Kill the dead branch; one default rule applied on mount AND re-select |
| CO4e | Audit A I-1 | Low | rum-beacon.tsx header comment still describes the removed session-cookie gate (contradicts the inline comment) | Update the header block |
| CO4f | Audit A I-2 | Low | nav-items.tsx: every NavItemLink does a 20-item `find()` per render (~400 scans per sidebar/drawer render, re-run every minute via `useNow`) | One module-level `Map<ViewId, NavItem>` |
| CO4g | Audit A L-5 | Low | `DropdownDeleteDeck` is misnamed (renders two plain icon buttons, owns no deletion, no dropdown) | Rename `DeckDetailActions` |
| CO4h | Audit A I-5 | Info | DropdownMenuItem handlers: `onSelect` (tasks) vs `onClick` (notes/assignments/flashcards) — both work; Radix recommends onSelect | Consistency sweep to `onSelect` |
| CO5 | Audit B L-1 | Low (doc accuracy) | AGENTS.md:142 top-level auth summary still says loginGlobal has "the success-reset" — the CM3 success-DECREMENT is 2 sessions stale in the most-read contract line (a future implementer could reintroduce the AI-2 defeat) | One-line fix + a census leg so it cannot rot again |
| CO6 | — | docs | The doc chain re-anchor (README badge/census/Session-140 row, AGENTS.md lesson block, CLAUDE.md seam tail, PAD revision block, SKILL doc census, vitest.config.ts header, playwright.config.ts header if e2e census changes, worklog.md entry, session log) | Same-commit doc-chain update |

**Decisions on the open questions (operator directive: "proceed with your
best recommendations"):**

- **A-M3 (restore-availability performance family)** — deferred AGAIN with
  rationale: this cycle's budget goes to the two security mediums (CO1/CO2)
  + the parity/correctness mediums; A-M3 is a self-contained performance
  cycle (batched restore loop + knownIds skip) that deserves its own
  unpolluted cycle, exactly as the s139 plan argued.
- **Auth I-4 (change-password does not bump sessionVersion)** — keep
  ADR-022's documented asymmetry (session survives rotation by design);
  revisiting it changes e2e-pinned behavior and contradicts a standing ADR
  without operator direction.
- **Auth I-7 (no Cache-Control on auth JSON)** — defer: no
  validator/freshness hints ride these responses; POST-dominated family;
  smallest-safe-diff discipline.
- **FE L-4 (flashcards deck row `div[role=button]`)** — accept and document
  as the sanctioned exception (nested interactive children cannot legally
  live inside a real `<button>`; the row carries Enter/Space + origin
  guards + focus ring — functionally complete).
- **Dependency choice for CO1** — `sanitize-html@2.18.1` (+types): the
  vetted, actively-maintained server-side allowlist library; hand-rolled
  regex sanitization is a documented anti-pattern for a security boundary.
  Server-only import (never reaches a client module — see §3 CO1 seam
  placement), zero client-bundle impact.

## §3 Per-item design

### CO1 — the note-HTML sanitization sextet (A-L3 closed)

**Seam placement (the load-bearing decision).** `validation.ts` and
`data-import.ts` are BOTH client-imported (timetable/assignments/settings
views; export-panel) — the sanitizer must NOT live there. Placement:

1. **`src/lib/note-html.ts`** (NEW, client-safe pure module — no node deps):
   the POLICY as frozen data (`NOTE_HTML_ALLOWED_TAGS`, per-tag attribute
   map, scheme rules) + `sanitizeNoteHtmlDom(html)` — a DOMParser-based
   allowlist walk (browser path: the Quill render gate). Unit-testable
   policy invariants; the DOM walk itself is e2e-covered (DOMParser is not
   in node).
2. **`src/lib/server/note-html.ts`** (NEW, server-only):
   `sanitizeNoteHtml(html)` via `sanitize-html` configured FROM the policy
   module — allowed tags: `p h1-h6 ol ul li blockquote pre code strong em u
   s a span img br hr`; attributes: `a[href target rel]` (schemes
   http/https/mailto — Quill's own Link whitelist minus tel/sms which the
   toolbar never offers), `img[src alt width height]` (**data: scheme only**
   — the BW10 authorship fact makes this lossless), `span[class style]`
   (classes matching `^ql-[a-z0-9-]+$`, styles limited to
   color/background-color); everything else (event handlers, srcset,
   iframe/video/object/form/svg/style-tags) dropped.
3. **Entry ① — the API door:** `noteDelegate.writeTransform` in
   `src/lib/server/entities.ts` (the pre-write hook the factory already
   applies on create+update — the study-groups members precedent).
4. **Entry ② — the import door:** the import route's write loop
   (`src/app/api/import/data/route.ts`) — the route writes through the RAW
   Prisma tx client (`(tx as any)[model]`), NOT the delegate, so
   `writeTransform` does not apply there; the transform is applied to
   `notes` rows' `content` in the loop (one explicit site, comment-anchored).
5. **Render gate (legacy rows):** `quill-editor.tsx` mount — sanitize
   `initialRef.current` through `sanitizeNoteHtmlDom` BEFORE the
   `/<[a-z][^>]*>/i` test + `dangerouslyPasteHTML` paste (pre-fix rows
   neutralized at open; defense-in-depth under the CSP).
6. **Pins:**
   - `tests/note-html.test.ts` (NEW): the server sanitizer — hostile legs
     (script/style tags, inline handlers, `javascript:`/`data:text/html`
     hrefs, remote img src, iframe/object/embed, srcset, form/input,
     svg/foreignObject) each neutralized; benign Quill vocabulary preserved
     (headers/lists/blockquote/pre/code/inline formats/ql-* classes/color
     styles/https links with target/data: images/hr/br); plain text and the
     demo-seed note contents round-trip byte-identical (the parity guard —
     the seed is plain-text, but the pin future-proofs it).
   - `tests/data-import.test.ts` legs: the import-row guard surfaces the
     notes-content sanitize step (census-style pin that the route applies
     it — the route file itself is census-pinned in script-conventions).
   - `tests/script-conventions.test.ts` census leg: the import route file
     contains the `sanitizeNoteHtml` call site marker.
   - e2e `s23-import.spec.ts`: import a note carrying
     `<img src="https://al3.example/px">` + `<script>` + `onclick` → 200;
     GET the note → sanitized content (no remote src, no script, no
     handler); route interception asserts ZERO requests to the attacker
     origin when the notes view renders it.
   - e2e render-gate leg: `tests/e2e/global-setup.ts` plants ONE hostile
     "legacy" note row (direct Prisma write — simulating a pre-fix row;
     distinctive title `A-L3 legacy hostile note`); the notes-view spec
     opens it → zero outbound requests to the attacker origin + no live
     `img[src^=http]` in the editor DOM. (No existing spec asserts note
     counts — verified by grep before this pin was designed.)

### CO2 — the authed-scrypt aggregate containment quartet

The CK1 doctrine swept to its siblings. One shared process-wide budget
`authBurnGlobal:` (40/15min — the loginGlobal sizing mirrored; the e2e
authed-family usage per chunk is ~15-25 POSTs, under the cap with headroom —
verified in the cert run, re-sized honestly if it trips):

- `change-password`, `change-email`, `delete-account`: the global check
  FIRST (before validation — the login convention), the existing per-user
  key second; `decrementRateLimit("authBurnGlobal:")` on legitimate success
  (the CM3 net-of-successes model — one requester's success proves only
  their own legitimacy).
- `reset-password`: same, alongside the existing per-IP key.
- `PROTECTED_BUCKETS` gains `"authBurnGlobal:"` (the eviction-exemption
  whitelist — S138/CM1); the `tests/auth.test.ts` exemption census updates
  (≤2 → ≤3 exempt keys).
- Pins: `tests/auth.test.ts` — the new key's containment semantics
  (the 41st authed burn 429s; a success decrements; the copy is the
  volume-containment form, identical to the per-key 429 copy — no new
  oracle), the PROTECTED_BUCKETS census re-tag; `tests/script-conventions.test.ts`
  — all four route files carry the `authBurnGlobal:` marker (the census
  form that keeps the family swept).

### CO3 — the dashboard checkbox conflict-resolution fix

`dashboard-view.tsx:325-331`: the raw concatenation becomes a `cn()` call
mirroring `PriorityCheckbox` (shared.tsx:247) — the completed-state
`border-sf-primary bg-sf-primary text-sf-primary-foreground` then WINS the
same-property conflicts via twMerge (the author controls the outcome, not
the stylesheet emission order). The size-5/parity comment block stays (the
dashboard renders its own 20px round checkbox — measured parity).

### CO4 — the FE small-hardening octet

- **a)** exams-view.tsx:371 — `key={`${topic}-${i}`}` (the dialog's own
  precedent at :506-508).
- **b)** calendar-view.tsx:228 (timeline gate) → `loading && (events.length
  === 0 || tasks.length === 0)`; :411 (day-detail gate) → OR-form over the
  five collections the panel renders (events/tasks/assignments/exams/
  timetable).
- **c)** timetable-view.tsx:519 — `{visible.map(...)}` (cap removed; the
  3-col grid handles the domain scale; the reference renders its empty
  state here — nothing measured to preserve).
- **d)** calculator-view.tsx:607-618 — mount state becomes the literal
  `("m", "ft")` pair (the documented reference default; the dead ternary
  dies); `switchCategory` applies the same length default rule
  (`length → m→ft`, others `units[0] → units[2] ?? units[1]`).
- **e)** rum-beacon.tsx:5-6 — the header block rewritten to match the
  mount-point gate reality.
- **f)** nav-items.tsx — one module-level `Map<ViewId, NavItem>` built once;
  `NavItemLink` reads `MAP.get(view)` (O(1) per link).
- **g)** flashcards-view.tsx:868 — `DropdownDeleteDeck` → `DeckDetailActions`
  (the S120/BU17c comment re-anchored).
- **h)** the DropdownMenuItem `onSelect` sweep (notes ×3, assignments ×1,
  flashcards ×2, matching tasks-view's Radix-recommended form).

### CO5 — the AGENTS.md contract-line fix

`AGENTS.md:142`: "with the success-reset (S136/CK1…)" → "with the
success-decrement (S138/CM3 — supersedes the S136 reset)". Plus the census
pin: `tests/script-conventions.test.ts` asserts AGENTS.md's auth summary
contains "success-decrement" and NOT "success-reset" (the CN9
login-route-file pin generalized to the most-read contract line).

### CO6 — the doc chain

Same-commit re-anchors: README badge/census + Session-140 row; AGENTS.md
census + S140 lesson block; CLAUDE.md seam tail; PAD revision block
(v1.3.47 → v1.3.48) + the A-L3 closure in §11; SKILL doc census + the
sanitize seam entry; `vitest.config.ts` header re-anchor; cert-script
Expected re-tags for any changed census; `worklog.md` Session-140 entry;
`docs/session_153.md` (the session record); `.env.example` re-verified
against the final env surface (no new env vars — sanitize-html adds none).

## §4 TDD pin projections

- **Unit (Vitest):** 1391 → ~1408 (+17 projected: note-html +~12 [the
  hostile sextet + the benign-vocabulary quartet + the plain-text/seed
  round-trip pair], auth +~3 [the authBurnGlobal containment + decrement +
  the re-tagged exemption census], script-conventions +~2 [the four-route
  authBurnGlobal census + the AGENTS.md success-decrement line]). The exact
  census re-anchors in the same commit.
- **E2e (Playwright):** 603 → 606 (+3: the s23 import-sanitize leg, the
  s23 no-outbound-render leg, the global-setup legacy-note render-gate leg
  placed in the notes-view spec family). Chunk map re-tagged (chunk 5 +2,
  the notes spec's chunk +1).
- **Register tripwire:** 257 importers / 138 Usage-line carriers / 0 stale —
  re-verified after the sweep (the four authBurnGlobal route edits + the
  sanitizer import add carriers).

## §5 Deferrals (with rationale)

- **A-M3** restore-availability family — its own performance cycle (see §2).
- **Auth I-4** sessionVersion on change-password — ADR-022 standing
  decision (see §2).
- **Auth I-5** AUTH_SECRET HKDF domain separation — standing accepted
  residual (disjoint message spaces; no practical attack).
- **Auth I-6** resetUrl origin trust — latent only under real mail
  transport (in-band delivery returns the URL to the requester directly);
  re-open when mail transport lands.
- **Auth I-7** Cache-Control on auth JSON — see §2.
- **FE I-3** (events monthly-recurrence day-of-month skip), **I-4**
  (SectionLink nested-interactive — measured parity, documented),
  **I-6** (focus-timer auto-complete mode race), **I-7** (parseMembers
  twice), **I-8** (redundant pt-0), **I-9** (donut offset mutation) —
  accepted residuals; the family from the s133–s138 deferred ledger stands.
- **A-I4** (client bundle pulls the ~1200-line seam for one constant) —
  standing import-graph residual.

## §6 As-executed close

**Executed as designed — all six CO items complete.** Actuals vs the §4
projections:

- **Unit:** 1391 → **1409** (+18, projected +17: note-html +10, auth +3,
  script-conventions +5 — the projection's "+12 note-html" landed as +10
  with the `<hr>` serialization pin folded into the vocabulary quartet).
  46 files (+1: `tests/note-html.test.ts`).
- **E2e:** 603 → **605** (+2 exactly as projected: chunk 2 +1 [the
  render-gate leg in parity-session9], chunk 5 +1 [the s23 import-door
  leg, demo import budget 9/10]). The map: **150+186+87+95+87**, every
  chunk first-pass on the final tree.
- **The 5-chunk cold cert:** 605/605. lint ✓ · tsc ✓ · build ✓ ·
  **census 2014 green**.

**RED evidence (verified failing for the designed reasons):** the
note-html import-RED (10 legs); the authBurnGlobal eviction-exemption RED
(the crafted-key flood evicted the real bucket before the
PROTECTED_BUCKETS registration); the census REDs (5 legs — the four-route
authBurnGlobal markers, the AGENTS.md success-decrement line, the two
sanitize census legs); the render-gate e2e RED probe at the function
level (gate disabled → the live remote img rendered, the locator resolved
to 1 element — the designed failure; the first call-site probe attempt
hit the noUnusedLocals type gate, itself a guard working).

**Honest corrections (the ledger):**

1. The hue-tokens residual register re-anchored — the CO3 `cn()` import
   shifted the dashboard residual's line +1 and tripped BOTH register
   legs (the site escaped the register; the register's line went stale).
   Fixed with the "re-anchored S140/CO3" note (the S130/CE4 precedent).
2. The `<hr>` test expectation re-pinned to the serialized `<hr /` form
   (sanitize-html's void-element serialization — the trap-10 "pin what
   reads back" doctrine).
3. The RED-probe relocation (lesson recorded in AGENTS.md S140 lesson 6).
4. The P1008 RumEvent socket-timeout noise class observed in the cert
   WebServer logs — pre-existing (observed at the baseline
   mobile-navigation run too), all chunks first-pass, the documented
   machine-load class. Not a finding; watched.
5. The demo import budget arithmetic: the s23 file's demo-session POSTs
   went 8 → 9 of 10 (one headroom) — stated here before the next cycle's
   chunk-5 rider design.

**The dependency decision executed:** `sanitize-html@2.18.1` +
`@types/sanitize-html@2.16.2` (the repo's first new runtime dependency
since the seed) — installed through bun, pinned in `bun.lock`, imported
ONLY from `src/lib/server/note-html.ts` (a server-only seam;
`validation.ts` and `data-import.ts` stay dependency-free because both
are client-imported — verified before the seam was placed).

**CO4 execution notes:** the onSelect sweep covered the four plain sites
(notes ×3, assignments ×1); the flashcards pair keeps `onClick`
deliberately (the raw click's `stopPropagation` is load-bearing inside
the deck ROW — documented at the site). The timetable cap removal
rendered the demo seed's full class set (the evidence frame 4).

**Evidence:** four `docs/screenshots/140-clone-*.png` frames (md5-distinct;
the capture script self-verifying; the hostile-note probe row cleaned
from the dev db after the capture — the demo-surface-restoration
convention). The capture script: `scripts/capture-s140-evidence.mjs`;
the fixture: `scripts/e2e-plant-legacy-note.ts` (db-target aware).

**Docs re-anchored (CO6):** README badge 1994→2014 + census lines + the
Session-140 row; AGENTS.md census + the S140 lessons block (7 lessons);
CLAUDE.md's two-cycles-stale counts corrected (1171→1409, 560→605 + the
current chunk map — the audit's own doc-drift finding); PAD v1.3.48 (the
revision block, the §8.1 Total row 77/2010, the §11 A-L3 closure row);
the SKILL doc census; the vitest.config.ts header re-anchor; the
cert-script re-tag; `docs/session_153.md`; the worklog Session-151 entry;
`.env.example` re-verified against the final env surface (no new env
vars — sanitize-html adds none; the file unchanged and current).

**Deferrals carried forward (§5 stands):** A-M3 (the only remaining
M-family deferral — its own performance cycle next), the auth
I-4/I-5/I-6/I-7 set with rationale, the FE accepted residuals, A-I4.

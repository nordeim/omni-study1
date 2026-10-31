# Remediation Plan — Session 119 / Batch BT (Cycle 69)

**Status: PLANNED** (pre-source-change; the execution record is appended per item)
**Date:** 2026-10-31 · **Workspace:** continued clone at `fd9872a` (the Batch BS state + the
operator's `docs/session_106.md`/`docs/session_107.md` transcripts) · **Operator-directed
audit + remediation session**

---

## 0. Scope and Method

The operator directed the standing rhythm: refresh the workspace (`git pull` → `fd9872a`,
`docs/session_107.md` new), re-read the full doc chain (`AGENTS.md`, `CLAUDE.md`, `README.md`,
`PAD`, `omni-study1_SKILL.md`, `docs/session_106.md`–`107.md`,
`docs/remediation-plan.md`, `docs/remediation-plan-session118.md`, `worklog.md`), re-validate
against the codebase, audit with the repo skills as rubrics (`skills/web-application/SKILL.md`
§5/§16 for the API audit, §8/§9/§12/§13 for the frontend audit; `skills/` excluded from
checking/testing/compilation), iterate on visual + functional parity with
`https://omni-study1.base44.app/` (the mobile navigation menu the named focus, Tailwind v4
the named suspicion class), keep the repo a production-ready functional SUPERSET, verify the
`.env`/`db/` contract and the vitest + playwright suites, plan remediation for everything
found, execute with TDD (RED → GREEN), capture evidence, update the docs chain, and commit +
push to `main` via the SSH wrapper.

Method (the six-phase workflow): ANALYZE → PLAN (this document) → VALIDATE (every finding
re-verified by direct read + live probe BEFORE planning the fix) → IMPLEMENT (smallest safe
diff, TDD) → VERIFY (cold re-cert) → DOCUMENT.

**Baseline established BEFORE any change (all green, cold):**

| Gate | Result |
|---|---|
| `bun run lint` / `bun run typecheck` | 0 errors (`noImplicitAny` on) |
| `bun run test` (Vitest) | **963/963**, 28 files |
| `bun run build` | clean; standalone assembled; bundled `.env` carries `AUTH_SECRET=""` (the s22 contract); the ADR-020 Edge-Runtime boot-guard warning the only stderr line |
| `bun run test:e2e` (cold 5-chunk map, fresh `db/e2e.db`) | **478/478** (132 + 141 + 57 + 87 + 61) |
| Register re-derivation (non-rider instrument) | **249 importers / 130 Usage-line carriers / 0 stale / 119 usage-line-free** — the 20th consecutive hold |
| Mode-C audit of the Batch BS diff (`89f6f79` + `2f825eb`) | 43 files / 1015 insertions; every BS1–BS12 claim verified TRUE against the tree; zero key material (the 64-hex sweep empty); all six s118 evidence frames present |

**Live parity re-verification (both hosts, agent-browser + DOM probes):**

- Reference (the probe account, 2026-10-31): **unlabeled hamburger**; **no `role=dialog`**;
  **24 visible links** drawer-open; `/Notes` `scrollWidth 416 > 390` (its own overflow
  defect, re-confirmed); landscape drawer nav `scrollHeight 992 > 290` (the only path to
  links 8–20); drawer backdrop `blur(4px)`. **No NEW parity gap; no Tailwind v4 mobile-nav
  bug — s119 re-confirmed (the 20th consecutive live confirmation).**
- Clone: labeled hamburger (`aria-label="Open navigation menu"` + `aria-expanded`);
  `role="dialog"` + `aria-label="Navigation menu"`; **26 visible links**; `/Notes` clean at
  390 (`390 = 390`); landscape nav `992 > 301`; sidebar 260 px → 80 px with **20/20
  icon-only rail links titled**; **the BS4 focus lifecycle re-verified live with a real
  keyboard flow** (burger `focus()` → Enter → focus lands on the panel's "Close menu"
  button → Escape → dialog gone + focus restored to the hamburger); **scroll persistence
  parity re-verified** (600 px carried /Dashboard → /Analytics onto the 2584 px page —
  identical to the reference's measured carry).

**Parity decisions this session (the DOM-authority rule — measured on the reference BEFORE
any fix was planned):**

- **P1 (the AI composer — a REAL parity gap, promoted from the audit's L6).** The
  reference's composer IS a `<textarea rows=2>` (measured: 60 px tall, `w-full rounded-md
  border border-input bg-transparent px-3 py-2 shadow-sm`, `resize: none`, placeholder
  **"Ask me anything..."**); the clone ships a single-line `<Input>` (36 px) whose pinned
  hint ("Press Enter to send, Shift + Enter for a new line", parity-session5:576) is
  therefore FALSE on the clone. Measured reference behavior: Enter sends **and Shift+Enter
  ALSO sends** (live: a Shift+Enter with content posted the message — the reference's own
  hint is aspirational, not implemented). **The fix: element parity + the superset** — the
  clone adopts the textarea (the reference's measured geometry + placeholder) and
  implements the hint's PROMISED behavior (Enter sends; Shift+Enter inserts a real
  newline): visual parity on the element, functional superset on the behavior, and the
  pinned hint becomes true.
- **P2 (the My Day zero-state greeting heading — a documented NON-gap).** The audit
  recommended h3 → h2 (a heading-order skip h1 → h3). Measured on the reference: the
  reference's own zero-state greeting is an **`<h3 class="text-xl font-semibold
  text-slate-700 mb-2">`** — the identical skip. The clone's h3 IS parity; changing it
  would deviate. No fix (the Q1/Q2 precedent: the reference is the contract).
- **P3 (the Timetable delete affordance — dead-code removal, NOT new UI).** The audit
  found a dead `remove()` (never called; `deleteTimetableClass` consumed nowhere else)
  plus a decorative `Trash2` icon inside the EDIT button carrying
  `aria-label="Delete <name>"` — the button's computed accessible name is
  "Edit X **Delete X**" while it only opens the edit dialog (verified live on the clone).
  The reference's Timetable was measured with data-seeking probes (the Add Class dialog
  + the full button census): **no delete affordance exists in any measured reference
  state** (its probe account carries no subjects, so no class cells render at all).
  Wiring a delete button would change the parity-pinned surface; the fix is dead-code
  removal + a real `aria-label` ("Edit <name>") on the button, exactly the BS11
  precedent. A delete affordance remains an ADR-level superset decision if ever wanted.
- **P4 (the Notes "Manage notebooks" placement — an internal superset fix, no reference
  dependency).** The reference has NO notebook-management affordance at all (measured:
  its Notes buttons are the hamburger, the New dropdown, "All Notebooks"/"All Tags"
  filters — nothing else), so the clone's control is superset chrome and INTERNAL
  consistency is the standard. The block's own comment claims it lives "in a compact
  dropdown below the filter on md+" but it is actually a **stray third flex child of the
  root row** (verified live: a 130 px mostly-empty full-height column at x=1118 squeezing
  the editor pane to 458 px). The fix moves it into the left pane below the notebook
  filter — the placement its comment already claims.

---

## 1. Audit Findings (every one verified by direct read + live probe — Mode C)

Sources: two parallel deep audits (API/security against the §5/§6/§7/§14/§16/§17/§20
rubrics; frontend/quality against the §8/§9/§12/§13 rubrics), then per-finding verification.
Auditor items the reference measurement disproved or the repo already documents are
recorded as non-gaps (P2 above; I-A/I-B/I-C below), not defects.

| ID | Severity | The finding (verified) | The evidence |
|---|---|---|---|
| BT1a | **Medium (security)** | `POST /api/import/data` reads its body with NO Content-Type gate — a cross-site `<form method=POST enctype=text/plain>` POST rides the session cookie (sameSite=lax sends it on top-level form navigations, the exact class BR5 closed at `readJson`) and can smuggle a JSON-parse-valid envelope into the parser. The PAD §6.4 CSRF row claims "JSON-only APIs + the Content-Type gate" coverage; this route violates the claim. | `src/app/api/import/data/route.ts:129-160` (`request.text()` + `JSON.parse`, no content-type check) vs `src/lib/server/http.ts:98-101` (the BR5 gate). |
| BT1b | **Medium (security)** | The import write loop persists envelope fields VERBATIM — no per-row schema runs — so a hand-edited "backup" stores a `files[].url = "javascript:…"` row (the BR4 http(s)-only rule's THIRD entry point), plus wrong field types surface as PrismaClientValidationError → **500** (violating the 400-bad-input contract). | `src/app/api/import/data/route.ts:319-343` (the write loop writes `fields` after stripping only passwordHash/userId); the sink `src/components/views/files-view.tsx:503-504` (`href={file.url ?? "#"} target="_blank"`). |
| BT2 | **Medium (DoS)** | The BS2 cap is enforced on the DECLARED Content-Length before the read and the actual length after — but `await request.text()` buffers the whole body first, so a `Transfer-Encoding: chunked` request (no Content-Length) fully buffers before rejection. The multipart upload branch (`request.formData()`) has no cap in any form. | `src/lib/server/http.ts:102-109`; `src/app/api/files/route.ts:104-105`; the import route's `request.text()`. |
| BT3 | **Low (security)** | Reset-token single-use is read-then-write (TOCTOU): the `usedAt` check runs BEFORE the transaction and the consumption update is unconditional — two concurrent replays both pass the pre-check and both commit. The in-code comment only covers the consume→write gap INSIDE the transaction. | `src/app/api/auth/reset-password/route.ts:48-72`. The ~50–100 ms scrypt window between the pre-check and the commit makes the race practically exploitable with the raw token. |
| BT4 | **Low (hygiene)** | The BS2 `idField` max-64 / `emailField` atoms missed consumers: `folders` POST `parentId`, `folders/[id]` PATCH `parentId`, `generate-cards` `deckId`, `generate-questions` id fields (all unbounded `z.string().min(1)`), and the `verify-email`/`resend-verification` local schemas still use bare `z.string().email()` (no trim/max). | `src/app/api/files/folders/route.ts:21`; `src/app/api/files/folders/[id]/route.ts:21-27`; `src/app/api/ai/generate-cards/route.ts:31`; `src/app/api/ai/generate-questions/route.ts:36-40`; `src/app/api/auth/{verify-email,resend-verification}/route.ts`. |
| BT5 | **Low (security)** | A short production `AUTH_SECRET` (even 1 char) boots with a `console.warn` — the session HMAC key is trivially brute-forceable offline from any observed cookie while the server stays up. §5/§16 of the rubric demand fail-hard for forgeable-session keys. | `src/lib/env-check.ts:44-49` (`length < 32` → warn); `tests/env-check.test.ts` pins the warn family. |
| BT6 | **Medium (parity, P1)** | The AI composer is a single-line `<Input>` (36 px) while the reference ships a `<textarea rows=2>` (60 px, measured) — the pinned hint "Shift + Enter for a new line" is false on the clone (and, measured, on the reference too — its Shift+Enter sends). | `src/components/views/aiassistant-view.tsx:199-208`; the reference measurement (P1); the pin `tests/e2e/parity-session5.spec.ts:576`. |
| BT7 | **Medium (a11y)** | The calculator history slide-in (`fixed inset-y-0 right-0 z-50 w-80`, covering the keypad) is a bare labelled `<aside>` — no Escape close, no focus-in on open, no focus-restore on close; a keyboard user tabs into the covered content. The same WCAG modal-lifecycle contract class BS4 closed on the mobile drawer. | `src/components/views/calculator-view.tsx:362-408` (the panel), `:254-258` (the toggle); the toggle's aria-expanded/aria-controls are already correct. |
| BT8 | **Medium (data integrity)** | `fetchAndSet` has no per-key sequence guard — concurrent GETs for one collection resolve out of order and the stale response clobbers the fresher state (live trigger: the Notes title PATCH fires one per keystroke, M4). | `src/lib/data.ts:323-326`. |
| BT9 | **Medium (a11y + dead code, P3)** | Timetable: the dead `remove()` (never called) + the decorative `Trash2` glyph carrying `aria-label="Delete <name>"` inside the EDIT button — the computed name is "Edit X Delete X" while the button only opens the edit dialog; a SR user is promised a delete that does not exist. | `src/components/views/timetable-view.tsx:181-188, 361-374`; verified live on the clone (the button census); the reference measurement (P3). |
| BT10 | **Medium (layout, P4)** | Notes: the "Manage notebooks" block is a stray THIRD flex child of the root row (a 130 px full-height orphan column at the right edge, x=1118, squeezing the editor pane to 458 px) instead of inside the left pane where its comment claims. | `src/components/views/notes-view.tsx:753-797` (verified structurally: 18 `<div` opens vs 17 closes between the root row and the block; measured live on the clone). |
| BT11 | **Medium (UX/data)** | The note-title input fires a PATCH on EVERY keystroke with `.catch(() => {})` — a failed rename (offline) is fully silent data loss, contradicting the view's own autosave contract (the Quill path debounces 600 ms and toasts once per failure streak). | `src/components/views/notes-view.tsx:553-558` vs `:332-348` (the streak toast) + `quill-editor.tsx:202-205` (the debounce). |
| BT12 | **Low (accuracy + error handling)** | (a) The `page.tsx` boot comment claims an offline boot "heals on the first view switch's loadCollections" — **false**: `navigate()` loads nothing and no view loads collections on mount (only boot + 3 post-mutation sites do); a failed pre-warm + failed `loadAll` leaves every collection showing false empty states until a manual reload. (b) The flashcards study-mode "Correct" mastery PATCH is silently swallowed (`.catch(() => {})`) while every other mutation in the file toasts. (c) The calculator `=` catch toasts "could not be evaluated" even when the evaluation SUCCEEDED and only the history-save POST failed. | `src/app/page.tsx:158-165` + `src/lib/store.ts:69-76` + the loadCollections census; `src/components/views/flashcards-view.tsx:264`; `src/components/views/calculator-view.tsx:142-159`. |
| BT13 | **Low (a11y)** | `aria-label` on role-less generic `<div>`s is inert (ignored by AT) at ~25 sites — the repo's own correct pattern (`role="group"`, e.g. `focustimer-view.tsx:188`) was never completed across the other views. | The site list (dashboard, myday, tasks ×2, assignments, exams, notes, flashcards ×2, studygroups, calendar ×6, timetable ×3, analytics ×3, mathsolver ×2, aiassistant). |
| BT14 | **Low (dark-mode consistency)** | Four chart-adjacent `text-slate-500` spots missing the `dark:text-slate-400` pair their neighbors carry (the superset dark-mode internal-consistency standard): the analytics donut caption, the StatBlock `sub`, the workload row count, and the FocusTimer mode label. | `src/components/views/analytics-view.tsx:268,302,441`; `src/components/views/focustimer-view.tsx:259`. |
| I-A | **Info (documented, no fix)** | The Files upload bare-fetch surfaces the raw browser "Failed to fetch" instead of the S14 offline message — the file's own comment marks it the sanctioned one bare-fetch site; message polish only. | `src/components/views/files-view.tsx:257-274`. |
| I-B | **Info (documented, no fix)** | PracticeTests MC options keyed by `option` value (duplicate comma-typed options collide React keys) + the True/False `radiogroup` uses `aria-pressed` buttons. Operable; shipped semantics. | `src/components/views/practicetests-view.tsx:592,613-625`. |
| I-C | **Info (documented, no fix)** | The Quill toolbar `labelToolbarButtons` runs once at mount — picker popup items stay unlabeled. Minor, documented a11y scope. | `src/components/quill-editor.tsx:184`. |

---

## 2. The Fixes (TDD: RED → GREEN; the smallest safe diff)

- **BT1 — the import perimeter (the gate + the row guard).**
  (a) The route adopts the BR5 Content-Type policy before reading (a shared
  `assertJsonContentType(request)` seam in `http.ts`, consumed by `readJson` and the
  import route — the gate fires after the limiter, before the body read; the app's own
  client and every existing e2e POST send `application/json`, so nothing pinned changes).
  (b) The PURE seam `src/lib/data-import.ts` gains `sanitizeImportRow(collection, row)`:
  every value must be a primitive (`string | number | boolean | null` — the export's own
  serialization contract) with strings capped at a generous 1,000,000 chars, the `files`
  rows' `url` enforced http(s)-only-or-null (the BR4 rule at the third entry point) and
  `name` trim/min-1/max-200, and wrong shapes throw an `ImportRowError` carrying the
  collection + index. The route runs every row through it before the write loop and maps
  it to a 400 with the actionable copy; Prisma errors inside the write loop map to 400
  (never a 500). RED: unit pins on the seam (each violation family) + the e2e pins
  (a `text/plain` POST → 400; a `javascript:` files row → 400 — on a TEST-NET fresh user
  so the demo import budget is untouched).
- **BT2 — bounded reads everywhere (the counting reader).** `http.ts` gains
  `readBodyCapped(request, maxBytes)`: the body's `ReadableStream` is read chunk-by-chunk
  with a running byte count and an ABORT at the cap (a capped `AbortError`-free rejection
  → `ValidationError` → 400) — chunked bodies are counted AS they are read, never
  buffered past the cap. `readJson` and the import route consume it (keeping their
  existing 400/413 response contracts). The multipart branch gains the declared
  Content-Length pre-check + the same bounded read (the buffered bytes are re-wrapped
  and `formData()` runs on the bounded body — the 2 MiB entry check stays). RED: a new
  `tests/http-body.test.ts` — synthetic `Request`s with streaming bodies (no
  Content-Length): the over-cap chunked body rejects at the cap WITHOUT reading past it;
  the at-cap body passes; the existing BS2 e2e pin (the 11 MiB declared body → 400) must
  stay green.
- **BT3 — the reset token's conditional consumption.** The transaction's consume step
  becomes `updateMany({ where: { id, usedAt: null, expiresAt: { gt: now } }, data:
  { usedAt: new Date() } })`; `count === 0` → the invalid-token 400 (the row was consumed
  by the concurrent winner). RED: the e2e pin rides the reset journey — the single reset
  POST becomes TWO concurrent POSTs with the same body; the statuses must be exactly
  `{200, 400}` (pre-fix the ~50–100 ms scrypt window lets both pre-checks pass →
  `{200, 200}` → the pin fails RED); the journey then continues on the winner's password
  (the BS1 cookie-replay pin after it is unaffected).
- **BT4 — the shared atoms at the missed consumers.** The four id fields become
  `idField`-shaped (`min(1).max(64)`) and the two email twins become `emailField`
  (trim + email + max-200). RED: validation-shaped unit pins per site.
- **BT5 — the boot guard's short-secret band.** Production secrets `< 16` chars become
  FATAL (16–31 stay the documented warn band, 32+ ok). The `env-check.test.ts` pins
  re-shape to the new contract (the old pins pinned the weaker shape — the BS7 re-anchor
  precedent). The s22 e2e negative-spawn pin is unaffected (it tests the EMPTY secret).
- **BT6 — the composer (P1).** `<Input>` → the shadcn `Textarea` with `rows={2}` and the
  reference's measured classes; `onKeyDown`: Enter (no shift) prevents default + submits;
  Shift+Enter falls through (a real newline). The placeholder matches the reference's
  measured "Ask me anything...". RED: e2e pins next to the existing hint pin — the
  composer is a multi-line textbox of the reference's height; Shift+Enter inserts a
  newline; Enter sends.
- **BT7 — the history panel's lifecycle.** Escape closes (while open), focus moves into
  the panel on open (its heading), focus restores to the toggle on close — the BS4
  lifecycle at non-modal weight (no aria-modal; the toggle's aria-expanded/aria-controls
  already announce the pattern). RED: e2e pins in calculator.spec.
- **BT8 — the fetchAndSet sequence guard.** A module-level `seq` map per collection key:
  capture `++seq[key]` before the GET, `setSlice` only when still the latest. RED: a unit
  pin with a controlled apiGet mock (the stale resolution must NOT clobber).
- **BT9 — the Timetable edit button (P3).** The dead `remove()` + the decorative
  `Trash2` (with its fake aria-label) are removed; the edit button gains
  `aria-label={`Edit ${name}`}` and the pencil icon becomes `aria-hidden`. RED: an e2e
  pin — the class cell's button name is exactly "Edit <name>" (no "Delete <name>").
- **BT10 — the Notes block placement (P4).** The "Manage notebooks" block moves inside
  the left pane, below the notebook filter (its comment's claimed placement); the root
  row returns to exactly two children. RED: an e2e DOM pin — the trigger lives inside
  the aside; the root row has no third visible child.
- **BT11 — the title PATCH contract.** The note-title failures surface through the
  view's autosave streak toast (the same once-per-streak mechanism as the Quill path)
  instead of the silent swallow. RED: an e2e pin — a failed title PATCH (a routed 500)
  surfaces the toast; the streak does not re-toast on the next keystroke.
- **BT12 — the smalls.** (a) The `page.tsx` comment states the truth (the failed-boot
  residual: the connectivity banner shows offline; collections reload on the next
  mutation or a manual reload — no view-switch healing exists) — and the boot path gains
  the honest retry affordance the Splash already has (a reload), via the comment only (no
  behavioral change); (b) the flashcards mastery PATCH failure toasts like its siblings;
  (c) the calculator `=` path splits its try blocks (an evaluation failure and a
  history-save failure toast differently). RED: unit/e2e pins where pinnable (the
  calculator split has an e2e-able shape; the mastery toast mirrors the existing
  removeDeck pin family).
- **BT13 — `role="group"` completion.** The ~25 aria-labeled generic divs gain
  `role="group"` per the in-repo focustimer precedent (making the labels live). No pin
  beyond the standing a11y suite (the a11y-sweep re-cert carries it).
- **BT14 — the dark pairs.** The four sites gain `dark:text-slate-400`. The dark-mode
  spec re-cert carries it (no dedicated pin; the internal-consistency standard).

**Guardrails held:** no test weakened (the env-check re-shape follows the enforced
contract; every other pin is additive); no lint/type rule loosened; `noImplicitAny`
stays on; the s117/s118 e2e pins ride untouched (the reset journey's POST-pair change
keeps the BS1 replay pin semantics — the winner's reset still revokes).

---

## 3. Verification Plan (the FINAL tree)

1. lint + typecheck clean; Vitest census grows by the new pins (RED-first verified).
2. The canonical build green (the bundled-`.env` contract intact).
3. The cold 5-chunk e2e re-cert with the new census re-tagged in
   `scripts/e2e-chunked-cert.sh`.
4. Live curl verification on :3000 — the chunked-body cap (a no-Content-Length oversized
   body → 400 at the cap), the import gate (a `text/plain` POST → 400), the import row
   guard (a `javascript:` files row → 400), the reset concurrency (two parallel resets →
   exactly one 200), and the BR1 import round-trip regression (the demo export → import).
5. The standing suite (35 stages) fresh single run (the S110 double-fork recipe; the
   S32 fresh-boot recipe for the security stage).
6. Evidence frames: `docs/screenshots/119-ref-*` (captured pre-change — done) +
   `119-clone-*` (post-change), md5-distinct, DOM-verified states.
7. `.env.example` verified current; the docs chain re-anchored (README badge + the
   Session-119 row + the stale census lines 109/167/169, AGENTS census + the S119
   lessons, CLAUDE seam tail, vitest header, PAD v1.3.27 + §6.4 rows, the cert-script
   census, the master remediation-plan header → Batch BT, the SKILL doc's census/chunk
   re-anchor + the AP-120..122 lessons); the worklog entry + `docs/session_108.md` (the
   structured record, titled "Session 120"); commit + push to `main` via the SSH wrapper.

---

## 4. The Verification Record (executed — appended on completion)

## 4. The Verification Record (executed — the FINAL tree, 2026-10-31)

1. **lint + typecheck: clean** (`noImplicitAny` on, zero errors).
2. **Vitest: 990/990** (31 files — the S119 additions: http-body +9 [the counting-reader
   family: the chunked-body cap aborts AT the cap without reading past it (the pull-count
   proof), the at-cap boundary, the multi-byte split-codepoint decode, the
   assertJsonContentType family], import-row-guard +12 [the sanitizeImportRow family: the
   primitive-value contract, the 1M field guard, the files rows' javascript:/data: URL
   rejections, the name/data shape rules, the collection+index error naming], data-store
   +3 [the fetchAndSet sequence-guard family], env-check +3 net [the forgeable-key band
   pins + the re-shaped warn-boundary pins]). RED-first verified: the 18 new pins failed
   on the pre-change tree (the 6 spurious toThrow-passes of the missing export resolved
   at GREEN).
3. **The canonical build: green** — the standalone assembled, the bundled `.env` carries
   `AUTH_SECRET=""` (the s22 boot-guard contract intact; the documented ADR-020
   Edge-Runtime boot-guard warning the only stderr line).
4. **The cold 5-chunk e2e re-cert: 488/488** (133+142+60+89+64 — chunk 1 +1 the BT10
   notes placement pin, chunk 2 +1 the BT9 timetable name pin, chunk 3 +2 the BT6
   composer pins +1 the BT11 title-toast pin, chunk 4 +2 the BT7/BT12 calculator pins,
   chunk 5 +2 the BT1 perimeter pins +1 the BT3 concurrent replay pair). The census
   re-tagged in `scripts/e2e-chunked-cert.sh` BEFORE the final launch (the first re-cert
   was re-run after the mid-run corrections below — the honest sequence).
5. **Live curl verifications on :3000** — the text/plain import gate (400 "Upload the
   backup as a JSON file."); the `javascript:` files row (400 with the actionable
   `files[0]` message); the 11 MiB chunked login body (400 "too large" in 64 ms — no
   Content-Length, the counting reader's path); the concurrent reset pair (**exactly
   {200, 400}** — `{"ok":true}` + the invalid-token error); the BR1 import round-trip
   regression (the demo export's 6 cards → import updated 6; the guard passed all 71
   legit rows with zero false positives).
6. **The standing suite (35 stages): fresh single run on a FRESH dev-server boot** (the
   S32 recipe — the security stage's AI probe measures a clean per-process budget);
   the preflight GREEN before the launch. **32/35** in the single run — the three
   failures (connectivity, ai-error, ai-aaily) root-caused to ONE real defect: the
   S81 stage-locator-drift class — BT6's Input→Textarea swap broke the three stage
   scripts' raw `input[aria-label='Message the assistant']` selectors (the ai pair
   additionally fired into the dead-:3000 window after the cwv co-residency stop —
   the dev server returned healthy only after the suite's health wait expired). The
   18 selectors repaired to the tag-agnostic `[aria-label=…]` form and all three
   stages re-run QUIET: **GREEN, 0 findings each** (7/10/4 nonGaps). The suite:
   effectively **35/35** post-repair.
7. **Evidence frames: 6 in `docs/screenshots/`** — `119-ref-dashboard.png` +
   `119-ref-mobile-drawer.png` (the reference, the probe account, captured pre-change)
   + `119-clone-dashboard.png` (h1 "Good afternoon, Demo 👋"), `119-clone-aiassistant.png`
   (the BT6 composer: textarea rows=2, 60px, "Ask me anything..."), 
   `119-clone-calculator-history.png` (the BT7 panel open with focus verified on the
   panel), `119-clone-mobile-drawer.png` (the drawer open with the BS4 focus lifecycle
   verified: focus on "Close menu") — all md5-distinct, DOM-verified states.
8. **`.env.example` verified current** (tracked; `DATABASE_URL="file:../db/custom.db"`
   with the db-path re-anchoring note; the AUTH_SECRET note updated for the BT5
   forgeable band; `E2E_PORT`). The docs chain re-anchored (README badge 1478 + the
   Session-119 row + the never-re-tagged 936/474 census lines repaired, AGENTS 990/488
   + the S119 lessons ×4, CLAUDE Unit-line seam tail S119/BT, vitest header 990, PAD
   v1.3.27 + five §6.4 rows, the cert-script census 488, the master remediation-plan
   header → Batch BT, the SKILL doc **v2.2.0** — the census/chunk re-anchor + the
   AP-118..123 lessons, the doc-drift repair); the worklog entry +
   `docs/session_108.md` written.

**Standing debt: ZERO.**

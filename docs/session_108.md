# Session 120 — Batch BT (Cycle 69): The Audit-Rider Hardening Cycle — the Import-Perimeter + Bounded-Reads + Composer-Parity Set

> Record of worklog **Session-119 / Batch BT**. Workspace: refreshed clone at `fd9872a`
> (the Batch BS state + the operator's `docs/session_106.md`/`session_107.md` transcripts).
> Plan + execution record: **`docs/remediation-plan-session119.md`**.

## The directive

The operator directed the standing rhythm: refresh the workspace, re-read the full doc chain
(`AGENTS.md`, `CLAUDE.md`, `README.md`, `PAD`, `omni-study1_SKILL.md`,
`docs/session_106.md`–`107.md`, both remediation plans, `worklog.md`), re-validate
against the codebase, audit with the repo skills as rubrics (the `skills/` folder excluded
from checking/testing/compilation), iterate on visual + functional parity with
`https://omni-study1.base44.app/` (the mobile navigation menu the named focus, Tailwind v4
the named suspicion class), keep the repo a production-ready functional SUPERSET, verify
the `.env`/`db/` contract and the vitest + playwright suites, plan + execute remediation
TDD-style, capture evidence, update the docs chain, and commit + push to `main` via the
SSH wrapper.

## Baseline (cold, BEFORE any work — all green)

lint ✓ · `tsc --noEmit` ✓ (`noImplicitAny` on) · unit **963/963** (28 files) · the canonical
build green (the bundled-`.env` contract intact: `AUTH_SECRET=""`; the documented ADR-020
Edge-Runtime boot-guard warning the only stderr line) · the cold 5-chunk e2e **478/478**
(132+141+57+87+61, fresh `db/e2e.db`) · the register re-derivation **249 importers / 130
Usage-line carriers / 0 stale / 119 usage-line-free** (the 20th consecutive hold) · the
Mode-C audit of the Batch BS diff (`89f6f79` + `2f825eb`): 43 files / 1015 insertions,
every BS1–BS12 claim verified TRUE against the tree, zero key material (the 64-hex sweep
empty), all six s118 evidence frames present. The `transition-[margin]` bytes of
BS10 hex-verified again (`2d 5b 6d 61 72 67 69 6e 5d` = `-[margin]` — the display
artifact now extends into Python repr; the AGENTS S119 lesson-3).

## Live parity (both hosts — agent-browser + DOM probes)

**No NEW parity gap; no Tailwind v4 mobile-nav bug — s119 re-confirmed (the 20th
consecutive live confirmation).** Reference: the unlabeled hamburger, **no `role=dialog`**,
24 visible links drawer-open, `/Notes` `scrollWidth 416 > 390` (its own overflow defect,
re-confirmed), landscape drawer nav `992 > 290`, backdrop `blur(4px)`. Clone: the labeled
hamburger (`aria-label="Open navigation menu"` + `aria-expanded`), `role="dialog"` +
`aria-label="Navigation menu"`, 26 links, `/Notes` clean at 390, landscape `992 > 301`,
sidebar 260 → 80 with 20/20 titled rail links, **the BS4 focus lifecycle re-verified with
a real keyboard flow** (burger `focus()` → Enter → focus on the panel's "Close menu" →
Escape → closed + focus restored to the hamburger), and **scroll-persistence parity**
(600 px carried /Dashboard → /Analytics onto the 2584 px page — identical to the
reference's measured carry).

**Four parity decisions settled by live reference measurement BEFORE any fix was
planned (the DOM-authority rule, extending to audit findings — the S118 lesson-1):**

- **P1 — the AI composer (a REAL parity gap, promoted from the frontend audit's L6).**
  The reference's composer IS a `<textarea rows=2>` (measured: 60 px, `resize: none`, the
  placeholder **"Ask me anything..."**), while the clone shipped a single-line `<Input>`
  whose PINNED hint (parity-session5:576, "Press Enter to send, Shift + Enter for a new
  line") was therefore false. Measured reference behavior: **Enter sends AND Shift+Enter
  ALSO sends** (live: a Shift+Enter with content posted the message — the reference's own
  hint is aspirational). **The fix: element parity + the superset** — the reference's
  element, geometry, and placeholder, and the hint's PROMISED behavior (Enter sends,
  Shift+Enter inserts a real newline). The pinned hint becomes true on the clone.
- **P2 — the My Day greeting heading (a documented NON-gap).** The audit recommended
  h3 → h2 (a heading-order skip h1 → h3). The reference's own zero-state greeting is an
  `<h3 class="text-xl font-semibold text-slate-700 mb-2">` — the identical skip. The
  clone's h3 IS parity; changing it would deviate. No fix.
- **P3 — the Timetable delete affordance (dead-code removal, NOT new UI).** The reference's
  Timetable was measured with data-seeking probes (the Add Class dialog + the full button
  census): **no delete affordance exists in any measured reference state** (its probe
  account carries no subjects, so no class cells render at all). The clone's dead
  `remove()` (never called; `deleteTimetableClass` consumed nowhere else) plus the
  decorative `Trash2` glyph carrying `aria-label="Delete <name>"` inside the EDIT button
  (the computed name was "Edit X **Delete X**" — verified live on the clone) are removed.
  A delete affordance remains an ADR-level superset decision if ever wanted.
- **P4 — the Notes "Manage notebooks" placement (an internal superset fix).** The
  reference has NO notebook-management affordance at all (measured: its Notes buttons
  are the hamburger, the New dropdown, and the two filter comboboxes), so the clone's
  control is superset chrome and INTERNAL consistency is the standard. The block's own
  comment claimed it lived "below the filter" but it was a **stray third flex child of
  the root row** (measured live: a 130 px mostly-empty full-height column at x=1118
  squeezing the editor pane to 458 px). Moved inside the left pane below the notebook
  filter; the root row's visible children are exactly the two panes again.

## The Batch BT set (verified findings → TDD fixes)

| ID | The fix (all verified live or unit/e2e-pinned) |
|---|---|
| BT1 | **The import perimeter.** (a) The BR5 Content-Type gate shared to the import route — `assertJsonContentType`, one seam consumed by `readJson` AND the import route (a cross-site `text/plain` form POST can no longer ride the sameSite=lax cookie into the JSON parser; live-verified: 400 "Upload the backup as a JSON file."). (b) The per-row `sanitizeImportRow` guard in the data-import seam — every value must be a primitive (`string|number|boolean|null`, the export format's own serialization contract) with strings capped at 1M; the `files` rows' url is http(s)-only-or-null (the stored `javascript:` href was the BR4 rule's unguarded THIRD entry point — files-view renders `href={file.url} target="_blank"`), name trim/1..200, data ≤2.8M base64; errors name the collection[index]; the write loop runs it before any write and Prisma validation errors map to 400 (never a 500). Live-verified: the evil row → the actionable `files[0]` message, and the BR1 import round-trip passes all 71 legit demo rows with zero false positives (cards: updated 6). |
| BT2 | **Bounded reads everywhere.** `readBytesCapped` — the counting reader: the body is read chunk-by-chunk with a running byte count and ABORTED at the cap (the BS2 pre-read check was inert on `Transfer-Encoding: chunked` requests — no Content-Length — and the post-read check fired only after `request.text()` had buffered everything). `readBodyCapped` is its text wrapper (the JSON paths); the multipart upload branch re-wraps the bounded bytes in a Blob for `formData()` — **byte-exact, binary-safe** (the first draft text-decoded the multipart body and would have corrupted binary uploads; caught at implementation and split into the byte core + text wrapper). Live-verified: an 11 MiB chunked login body → 400 in 64 ms; unit-pinned with a pull-count proof (the reader never walks past the cap) + the multi-byte split-codepoint decode. |
| BT3 | **The reset token's conditional single-use consumption.** `updateMany({ where: { id, usedAt: null, expiresAt: { gt: now } } })` inside the transaction — the pre-BT read-then-write shape let two concurrent replays both pass the pre-check across the ~50–100 ms scrypt window and both commit. Live-verified: the parallel pair → exactly **{200, 400}**; e2e-pinned with the same pair on a fresh TEST-NET user + the sequential replay 400. |
| BT4 | **The shared atoms at the missed consumers.** `idField`/`emailField` exported from validation.ts and adopted at the six route-local schemas that hand-rolled their shapes (folders `parentId` ×2, generate-cards `deckId`, generate-questions `subjectId`, verify-email + resend-verification emails). |
| BT5 | **The boot guard's forgeable band.** A production `AUTH_SECRET` under 16 chars is now FATAL (an offline-brute-forceable HMAC signing key never ships silently); 16–31 chars stays the documented warn band; the env-check pins re-shaped to the strengthened contract. |
| BT6 | **The composer (P1).** The shadcn `Textarea` with `rows={2}`, `resize-none`, the reference's measured placeholder; Enter (no shift) submits, Shift+Enter falls through to the native newline. The parity-session5 hint pin now describes true behavior. |
| BT7 | **The calculator history panel's lifecycle.** Escape closes (while open — the S15 display-clear mapping stays dormant so one press never does both), focus lands in the panel on open, focus restores to the History toggle on close (the BS4 pattern at non-modal/disclosure weight; the toggle's aria-expanded/aria-controls already announced the pattern). Live-verified end-to-end. |
| BT8 | **The fetchAndSet sequence guard.** A module-level monotonic ticket per collection key — a stale out-of-order GET resolution is dropped, never clobbering the fresher slice (the live trigger: the Notes title input PATCHes on every keystroke, each followed by a notes GET). Unit-pinned with a controlled apiGet mock whose stale resolution is delayed past the fresh one. |
| BT9 | **The Timetable edit button (P3).** The dead `remove()` + the decorative `Trash2` removed; the pencil is `aria-hidden` and a visually-hidden "Edit class" span rides the button. **The first draft shipped `aria-label="Edit X"` — the a11y sweep rejected it** (`label-content-name-mismatch [serious]`: an aria-label cannot contain the button's whole visible text — the name + time + room); the re-shaped name-from-content pattern passes Label-in-Name by construction. |
| BT10 | **The Notes placement (P4).** The "Manage notebooks" block moved inside the left pane, below the notebook filter (its own comment's claimed placement). Live-verified: the trigger inside the aside; the root row's visible children exactly [ASIDE, DIV]. |
| BT11 | **The title PATCH contract.** The note-title failures surface through the view's once-per-streak autosave toast (the S78/AE2 mechanism; the success path resets the streak) — was a fully silent `.catch(() => {})` (offline renames were invisible data loss). |
| BT12 | **The honest smalls.** (a) The `page.tsx` boot comment states the truth (no view-switch healing exists — navigate() loads nothing; the loadCollections census: boot + three post-mutation sites). (b) The flashcards study-mode mastery PATCH toasts on failure like its siblings. (c) The calculator `=` catch split — an evaluation failure and a history-save failure toast their own messages. |
| BT13 | **`role="group"` completed.** 31 aria-labeled generic divs across 16 files gained `role="group"` (the in-repo focustimer precedent) — the labels are live for assistive tech now. All 20 views re-verified zero-violation. |
| BT14 | **Four missing `dark:text-slate-400` pairs** (the analytics donut caption, the StatBlock sub, the workload row count, the FocusTimer mode label) — the superset dark-mode internal-consistency standard. |

**Documented non-gaps:** P2 (the My Day h3 — the reference's own shape); I-A (the Files
bare-fetch message — the sanctioned one bare-fetch site); I-B (the PracticeTests option
keys / True-False radiogroup); I-C (the Quill picker labels).

## TDD discipline

RED first: **18 failing pins across 4 files** (env-check +2 [the forgeable band], http-body
+9 [the counting reader + the Content-Type seam], import-row-guard +6 of 12 [the toThrow
pins' spurious RED-passes against the missing export resolve at GREEN], data-store +1
[the clobber pin]), then the source, then GREEN **990/990** (31 files — http-body +9,
import-row-guard +12, data-store +3, env-check +3 net of the re-shaped warn-band pins).
Guardrails held: no test weakened, no lint/type rule loosened, `noImplicitAny` on, the
s117/s118 pins untouched.

## The honest mid-run corrections (all root-caused, all fixed at the source)

1. **The BT11 pin asserted the wrong message.** The route-abort mock maps to the S14
   offline ApiError whose message wins (instance-message precedence — the autosave
   contract's own shape). The pin re-anchored to the actual offline message.
2. **The BT12 pin's mock returned a non-JSON 500** ("Request failed (500)" won the
   toast). The mock re-shaped to carry a JSON error body; the pin asserts the surfaced
   server message.
3. **The BT9 first draft tripped the a11y sweep** (`label-content-name-mismatch`) —
   re-shaped to name-from-content + the sr-only action word (the WCAG 2.5.3
   Label-in-Name-correct pattern).
4. **The cert script was edited WHILE RUNNING** (the census re-tag landed mid-loop):
   bash's lazy read re-parsed from shifted offsets, ran a phantom "CHUNK 6" (chunk 5's
   file set, passed again on the aged db) and died at the `done`. The chunks 1–5 results
   stood (the loop body was parsed before the edit); the final re-cert was re-run cold on
   the final tree. Never edit a running bash script; the census re-tag lands BEFORE the
   launch.

## Re-certification (the FINAL tree)

lint ✓ · `tsc --noEmit` ✓ (`noImplicitAny` on) · unit **990/990** (31 files) · the
canonical build green (the bundled-`.env` contract intact) · the cold 5-chunk e2e
**488/488** (133+142+60+89+64) · the live curl battery on :3000 (the text/plain import
gate → 400; the `javascript:` files row → the actionable 400; the 11 MiB chunked body →
400 at the cap in 64 ms; the concurrent reset pair → exactly {200, 400}; the BR1 import
round-trip → 6 cards updated) · the standing suite effectively 35/35 (the single run 32/35 — the three failures root-caused to the BT6 locator drift in the stage scripts [the S81 class], repaired to the tag-agnostic form and re-verified QUIET green) · the six s119 evidence frames
in `docs/screenshots/` (2 reference + 4 clone: dashboard, the BT6 composer, the BT7
history panel with focus verified, the mobile drawer with the BS4 lifecycle verified —
all md5-distinct, DOM-verified states) · `.env.example` verified current.

**Standing debt: ZERO.**

## The docs chain

README badge 1478 (990+488) + the Session-119 row + the never-re-tagged 936/474 census
lines repaired; AGENTS census 990/488 + the S119 lessons ×4; CLAUDE Unit-line seam tail
S119/BT; the vitest header 990 (31 files); PAD v1.3.27 (the revision block + five §6.4
rows: the import CSRF gate, the stored-href guard, the chunked-body cap, the reset TOCTOU,
the forgeable-key band); the cert-script census 488; the master remediation-plan header →
Batch BT; the SKILL doc **v2.2.0** (the census/chunk re-anchor + AP-118..123 — the
doc-drift repair); this record; the plan + execution record
(`docs/remediation-plan-session119.md`).

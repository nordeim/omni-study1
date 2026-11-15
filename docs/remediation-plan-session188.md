# The S188 remediation plan — the staged-row GC sweep + the dark-mode standing measurement constraint (Batch EL)

The axis: the S187 close's named candidates — "the notes-family e2e
consolidation (parity-session7 is 138 pins across five families), the
staged-row GC sweep, and the dark-mode standing measurement constraint."
This cycle executes the LATTER TWO and records the first as the deferred
S189 candidate (§6.4): the **staged-row GC** is the functional-superset
item (the S180/ED plan's explicit deferral — "no GC ships this cycle"),
and the **dark-mode constraint** is the measurement-protocol adjudication
the S186/S187 cycles discovered but never codified.

## §0 The context and the baseline

- The workspace: a fresh clone at `b9ceff3` on `main` (the S187 close
  `8b6b4c6` + the operator's session_246/247 transcript commits). The
  environment re-derived per the standing recipe: bun install (510 pkgs),
  `.env` from `.env.example` at `DATABASE_URL="file:../db/custom.db"` with
  `db/` at the repo root (push + seed — the demo account ready), the
  pinned chromium v1243 re-provisioned (the fresh sandbox carried only
  v1200).
- The cold baseline reproduced the S187 close EXACTLY: lint ✓ · tsc ✓ ·
  unit **1795/1795 (55 files)** · build ✓.
- The standing chrome at the open: the drawer check GREEN (**the 135th
  consecutive** — no Tailwind v4 mobile-nav bug; backdrop
  `oklab(0 0 0 / 0.2)` [the documented trap-7 serialization] + blur(4px),
  288px panel, 20 links, no footer, Escape + navigate auto-close, appbar
  z-40 fixed) · the desktop parity probe MATCH (all five structural
  checks, both hosts: sidebar 260, 20 links, the first-five links,
  mainX 260, mainWidth 1180).
- The reference mode probe (`scripts/ref-probe-s188-mode.mjs`): the
  operator account persists in **DARK mode** (html.dark, body
  rgb(10,10,10), recorded 2026-11-15T00:38:31Z) — the S186 constraint
  re-confirmed live; the theme is LEFT AS FOUND (the standing
  zero-residue discipline).

## §1 The staged-row lifecycle record (the codebase + S180 evidence)

The S180/ED Attach-File wire left a documented gap
(`docs/remediation-plan-session180.md` §"the staged rows are the draft's
scratch"): a picked-but-never-saved upload mints an OWNED, ≤ 2-MiB,
INVISIBLE staged `NoteAttachment` row (noteId null) that **nothing ever
deletes**:

1. The staged upload POST (`/api/notes/attachments`) mints the row; the
   rate limiter bounds growth to 20/15-min per user — but that bound is
   per-WINDOW, not lifetime: a user who abandons drafts accumulates rows
   indefinitely (up to 2 MiB each).
2. The Save's bind (`bindNoteAttachments`) sets noteId on listed rows and
   deletes the note's UNLISTED bound rows — a staged row never listed is
   never touched.
3. The export excludes staged rows (the S180 run-2 caught bug —
   `noteId: { not: null }` in `src/lib/server/export-build.ts`) so they
   never ride a backup; they are pure scratch.
4. The reference's own posture is NO GC AT ALL (its probe uploads linger
   on its CDN forever — the S180 measured record). A GC is therefore a
   **superset** hygiene feature, not a parity port: zero visual surface,
   zero wire change.

The schema support is already in place: `@@index([userId, createdAt,
id])` — the sweep's `deleteMany({ userId, noteId: null, createdAt: { lt:
cutoff } })` rides the userId prefix.

## §2 The gap table

| # | Surface | Current (pre-change) | Post-change | Class |
|---|---|---|---|---|
| G1 | Orphaned staged rows | Accumulate indefinitely (bounded only per-15-min window) | Swept on the uploader's next staged upload once older than the 24h retention | functional (superset hygiene) |
| G2 | The dark-mode measurement protocol | Discovered at S186, re-ridden at S187, never codified | The constraint recorded in AGENTS.md (the probe protocol) + this plan §6.3 | documentation |

## §3 The port design

1. **§3.1 The seam** (`src/lib/server/note-attachments.ts`):
   - `export const STAGED_ATTACHMENT_RETENTION_MS = 24 * 60 * 60 * 1000`
     — 24 hours: a draft left open overnight SURVIVES (the retention is
     the boundary, not the sweep); the S180 record shows drafts are
     session-scoped in practice.
   - `export async function gcStagedNoteAttachments(userId: string, now:
     Date = new Date()): Promise<number>` — `deleteMany({ where: {
     userId, noteId: null, createdAt: { lt: new Date(now.getTime() -
     RETENTION) } } })`, returning the swept count. Pure db access, no
     route knowledge; the `now` parameter makes the cutoff arithmetic
     unit-pinnable deterministically.
2. **§3.2 The route wiring** (`src/app/api/notes/attachments/route.ts`):
   the GC fires on the staged upload POST — the write path that MINTS
   staged rows (the actor who creates the scratch cleans it). Placement:
   immediately AFTER the rate-limit guard (a rate-limited caller gets no
   free sweeps; the 20/15-min budget doubly bounds the sweep frequency),
   BEFORE the body read. **Error-tolerant**: a GC failure logs
   (`console.error`) and NEVER blocks the upload — the sweep is hygiene,
   not a precondition. Per-user scope (no cross-user table scan).
3. **§3.3 The e2e fixture** (`scripts/e2e-plant-stale-staged-
   attachment.ts`): plants TWO staged rows on the demo user with FIXED
   ids (≤ the 64-char route-param bound) and BOTH timestamps explicit
   (explicit values win over `@updatedAt`'s auto-set — the Prisma create
   contract): **A** `s188el-stale-staged-fixture-01` backdated **25h**
   (the sweep target) + **B** `s188el-fresh-staged-fixture-01` at **now**
   (the plant-integrity probe). Idempotent (deleteMany on both fixed ids
   first), shell-pinned `DATABASE_URL` (the `e2e-plant-legacy-note.ts`
   posture), wired into `tests/e2e/global-setup.ts` after the
   legacy-note plant.
   THE RACE THE TWO-FIXTURE DESIGN CLOSES: the S180/ED pins fire REAL
   staged upload POSTs (`page.route` + `route.continue()` — counted, not
   mocked) EARLIER in parity-session7's declaration order, so post-port
   they sweep fixture A before the EL block runs. A single-fixture pin
   would fail its own GREEN at the precondition. The flat two-fixture
   form is ordering-independent AND retry-safe: fixture B is FRESH —
   nothing in-suite can sweep it (only the GC removes staged rows, and
   it only removes rows older than 24h) — so `GET B → 200` proves the
   plant ran; `GET A → 404` after the trigger proves the sweep (the
   plant ran, and the only staged-row remover is the GC).
3. **§3.4 The pins' home — resilience.spec.ts (chunk 3), NOT
   parity-session7 (the s183 upload-budget doctrine, replayed and
   root-caused live)**: the pins were first written into
   parity-session7 (the notes-family home) — and the chunk-2
   composition 429'd s14-hardening's CU1a/CU1b multipart pins TWICE
   (reproduced, then isolated by the --grep-invert control run: without
   the EL pins the composition passed 275/275). The exact POST census:
   chunk 2 rides the demo user's shared 20/15-min upload bucket at ~21
   units (the EG Files family's 7 file + 3 folder + 1 link-JSON POSTs +
   the ED staged family's 5 + s14-hardening's 5) — the +3 EL units
   tipped it. The relocation to resilience.spec.ts (the upload-envelope
   family's own home — its "files upload edge cases" + "over-cap 413"
   describes) puts the 3 units in chunk 3's ~2-unit composition (~18
   headroom). Verified cold both sides after the move: chunk 2 restored
   275/275, chunk 3 **101 → 103** GREEN.

3. **§3.4b The census consequence**: the chunk map moves 158 + 275 +
   **101 → 103** + 95 + 92 = **723** (chunk 3 +2, NOT chunk 2); the
   chromium census 716 → 718; the badge 2516 → 2522 (1799 + 723).

## §4 The TDD plan (the honest RED first)

- **Unit** (`tests/note-attachments.test.ts`, the S188/EL block — the
  file's dbMock already carries `noteAttachment.deleteMany`):
  1. EL-u1: the retention constant is exactly 24h (86,400,000 ms — the
     documented boundary).
  2. EL-u2: an explicit `now` computes the cutoff `now − 24h` and calls
     `deleteMany` with the exact where shape `{ userId, noteId: null,
     createdAt: { lt: cutoff } }` (the ownership + staged-only + staleness
     triple), and NOTHING else (no create/updateMany side calls).
  3. EL-u3: the return rides `deleteMany`'s `count`.
  4. EL-u4: the default-now form — the cutoff lands within 2s of
     `Date.now() − 24h` (the production call path).
- **E2e** (`tests/e2e/resilience.spec.ts`, the S188/EL describe — the
  upload-envelope family's home; see §3.4 for the placement's budget
  rationale — the pins hit the REAL route through `page.request`, which
  carries the storageState cookie and bypasses page-level mocks; NO
  other chunk-3 spec POSTs to this route, so the planted fixture cannot
  be swept early):
  - **EL1 (the RED pin — the flat two-fixture form, ordering-independent
    and retry-safe)**: (1) GET fixture B's download URL → **200** (the
    plant-integrity guard: only the plant creates B, and nothing
    in-suite deletes a FRESH staged row — the bind's removal leg targets
    a note's BOUND rows only, `noteId: <that note>`, never `null`);
    (2) POST a fresh staged upload → **201** (the GC fires inside this
    request — or already fired at an ED pin's upload, same wiring);
    (3) GET fixture A's URL → **404** (THE SWEEP — the pre-change RED
    marker: 200, nothing sweeps; the two levers close both phantom
    holes: B 200 proves the plant ran, and the GC is the only remover
    of staged rows); (4) GET the trigger upload's URL → **200** (the
    boundary: a fresh staged row survives its own upload's sweep). One
    test, the full lifecycle, zero shared state, fully idempotent
    across the retry posture (a re-run reads B 200 / A 404 / a NEW
    trigger 201+200 — every leg re-proves).
  - **EL2 (the boundary guard — green BOTH sides by design)**: a second
    upload's GC must NOT sweep fresh rows — POST upload #1 → 201, POST
    upload #2 → 201, GET upload #1's URL → **200**. Stands alone (needs
    no fixture); guards against an over-eager sweep (e.g. a future
    `noteId: null` unconditional delete) across the port.
- The upload-budget note: the two pins add **3 upload POSTs** to chunk 2
  (parity-session7's ED family ~3 + s14-hardening's 4 — well under the
  shared 20/15-min `upload:${user.id}` budget; the s183 lesson's
  exhaustion class cannot fire).

## §5 The execution order (the TODO list)

1. [x] The environment re-derive + the cold baseline (lint/tsc/unit/
   build).
2. [x] The standing chrome (drawer check 135th + the parity probe
   MATCH) + the reference mode probe (dark, recorded).
3. [x] **The RED run** — the unit block against the pre-change seam
   (the import failure IS the missing-seam RED — 4 failing at their
   markers, 11 existing green) + the EL1 pin against the pre-change
   standalone build (the §0 build), verified failing at its designed
   marker (step 3: the stale URL answers 200; EL2 green both sides by
   design — the boundary guard). [The RED ran at the pins' FIRST
   placement in parity-session7; the relocation to resilience.spec.ts
   moved the identical pin text — the RED evidence carries.]
4. [x] **The port** — §3.1 the seam → §3.2 the route wiring → §3.3 the
   plant script + the global-setup wiring → §3.4 the pins (final home:
   resilience.spec.ts, after the live root-caused 429 relocation).
5. [x] **The GREEN sweep** — the unit block; the EL pins against the
   NEW build; the touched-spec cold runs (chunk 2's full 7-file
   composition 275/275 after the relocation; chunk 3's composition
   103/103; s14-hardening + parity-session9 + s21-data-export 72/72 at
   the first placement — the 429 root-cause rode the second chunk-2
   roll).
6. [x] **The gates**: lint ✓ · tsc ✓ · unit **1799/1799 (55 files)** ·
   build ✓ (all green post-port; one transient root-caused en route — a
   stale incremental tsbuildinfo re-reported the scripts/ global-main
   collision after the plant's module marker landed; cleared + clean).
7. [x] **The census** (`--list`, never estimated) + the doc-chain
   lockstep (the README badge/testing line/Session-188 row, the AGENTS
   census + the S188 lessons + the dark-mode probe protocol, the CLAUDE
   contract lines, the PAD revision, the SKILL census sites, the vitest
   header, the cert runner re-tag + the tripwire expectation). The
   tripwire CAUGHT one missed site live (the README tree-diagram prose
   count, the DA6 cross-read pin — the anti-rot mechanism working as
   designed; fixed + re-green).
8. [x] **The 5-chunk cold cert map** — the full e2e suite:
   **158 + 275 + 103 + 95 + 92 = 723/723** (every chunk green; the cert
   log at `cert-s188.log`).
9. [x] **The evidence frames** — the GC lifecycle proof table
   (`docs/screenshots/188-gc-lifecycle-proof.png` — the live API
   sequence: B 200 → trigger 201 → A 404 [THE SWEEP] → the trigger's row
   200 → second upload 201 → the first row still 200, self-verified
   before the shot) + the staged-chip frame
   (`188-notes-staged-chip.png` — the visible feature whose scratch the
   GC governs, the href asserted 200 live).
10. [x] **The closing chrome** — the drawer check GREEN (**the 136th**
    — ok, 20 links, Escape + navigate auto-close) + the desktop parity
    probe MATCH (all five structural checks, both hosts).
11. [x] **The commit + the SSH-wrapper push** (the operator's standing
    sequence).

## §6 The adjudications (the open questions, resolved)

1. **§6.1 The retention is 24 hours.** The boundary trades disk hygiene
   (≤ 2 MiB per orphaned row) against draft longevity: a draft left open
   overnight survives; the S180 net-probe record shows the reference's
   own drafts are session-scoped (its X-exit is local-only, its autosave
   is the clone's superset). A shorter window (1h) would race a lunch
   break; a longer one (7d) triples the accumulation window for zero
   practical benefit. The constant is exported + unit-pinned — a future
   operator can move it with one edit and one test change.
2. **§6.2 The GC fires on the staged upload POST, user-scoped, AFTER the
   rate-limit guard.** The alternative placements lose: the notes list
   GET (writes on the hot read path), a boot-time sweep in
   `instrumentation.ts` (runs rarely; multi-user timing), a cron
   (infrastructure for a self-hosted single-user app). The upload path
   is exactly where staged rows are minted — the creator cleans. The
   rate-limiter placement means the sweep frequency is bounded by the
   same 20/15-min budget as the minting. A GC failure is logged and
   swallowed — hygiene must never take the upload down.
3. **§6.3 The dark-mode standing measurement constraint (codified).**
   The reference account persists in DARK mode (the owner's state —
   re-confirmed live this cycle; the theme is never toggled by a probe:
   the zero-residue discipline). The protocol for future parity cycles:
   (a) every probe RECORDS the mode it rode (the S186 constraint);
   (b) STATIC-class surfaces (mode-independent utility classes) measure
   fine in dark mode and cross-verify against the light-era records;
   (c) TOKEN-driven surfaces (the border-input triggers, the shadcn
   variables) cannot be light-measured while the account is dark — they
   ride their standing light-mode pins UNTOUCHED (the S187 §6.1
   posture: the dark-scoped readings are recorded, never ported);
   (d) the s142-class structural probes (sidebar/main geometry, link
   census) are mode-independent and stay the standing chrome. This
   adjudication lands in AGENTS.md so the constraint survives the
   session boundary.
4. **§6.4 The notes-family e2e consolidation is DEFERRED to a future
   cycle.** parity-session7.spec.ts is 138 pins across five families
   (flashcards, timetable, notes, files, the S186/EJ view-headers) — the
   split into family files is a pure test-organization refactor with
   real re-verification cost (the full cert map re-run) and zero
   user-facing value; it must not share a cycle with a behavior change
   (the blast-radius rule). It is recorded here as the S189 candidate so
   the deferral is a decision, not an omission.
5. **§6.5 The plants' fixed ids are the spec contract.** The fixture ids
   `s188el-stale-staged-fixture-01` (A, 25h) and
   `s188el-fresh-staged-fixture-01` (B, 0h) are literals in BOTH the
   plant script and the spec (cross-referencing comments), the
   `demo@studyflow.app` precedent — the repo's established
   two-site-literal pattern (a shared module between a bun script and a
   playwright spec couples the test harnesses for two strings; the
   precedent is the lighter contract).
6. **§6.6 The staged rows the pins create are left in the scratch db.**
   They are invisible to every view and every export (the §1.3 record),
   the scratch db is deleted before every run (the always-cold
   doctrine), and their 24h retention sweeps them in any long-lived
   copy — no cleanup leg is needed (and one would spend upload-budget
   POSTs for nothing).

## §7 The re-anchor risk register

- `tests/note-attachments.test.ts` — the existing S180/ED blocks HOLD
  (the seam's existing exports are untouched; the dbMock already carries
  `deleteMany`); adds the S188/EL unit block.
- `tests/e2e/resilience.spec.ts` — the existing families HOLD (its 2
  upload units share the bucket with the EL pins' 3 — ~18 headroom,
  verified cold 103/103); adds the S188/EL block.
- `tests/e2e/parity-session7.spec.ts` — UNTOUCHED in this cycle's final
  shape (the EL block's first cut lived here and was RELOCATED after the
  429 root-cause — the file is byte-identical to the S187 close except
  nothing; the ED family's real staged uploads now fire the GC, their
  rows fresh, never swept, all 138 pins verified cold GREEN).
- `tests/e2e/global-setup.ts` — the legacy-note plant order is untouched;
  the stale-staged plant APPENDS (its failure falls back to npx tsx, the
  same posture).
- `scripts/e2e-chunked-cert.sh` — the chunk-3 count moves 101 → 103; the
  expected-sum line + the tripwire expectation move with it (723).
- `src/app/api/notes/attachments/route.ts` — the guards and the 201
  shape are untouched (the GC inserts AFTER the rate-limit guard); the
  ED2 wire pin (the mocked-route DOM probe) is unaffected; the s14
  download-header pins live on `/api/files` (untouched route).
- `src/lib/server/note-attachments.ts` — additive only; the S180/ED
  export surface (the bind, the include reads, the url derivation) is
  byte-identical.
- The unit census sites (AGENTS/README/SKILL/PAD/vitest header) — 1795
  → 1799 (55 files unchanged); the e2e census 716 → 718 chromium specs;
  the chunk map 721 → 723 (chunk 3 +2); the badge 2516 → 2522.

## §8 The verification ledger (what proves this cycle)

- The honest RED (§5.3) — the unit import-RED + the EL1 pin at its
  designed marker (the stale URL answering 200 post-trigger).
- The GREEN sweep (§5.5) — the unit block; the EL pins; the full
  parity-session7 file; the touched-spec cold runs.
- The full gate: lint · tsc · unit (the new census) · build · the
  5-chunk cold cert map (the census by `--list`).
- The closing chrome: the drawer check (136th) + the desktop parity
  probe MATCH.
- The evidence frames under `docs/screenshots/` (the GC lifecycle,
  self-verifying).
- The reference mode record (`scripts/ref-probe-s188-mode.mjs` — dark,
  the theme left as found, zero content residue).

## §9 The close-out (as executed)

- The execution order §5.1-§5.11 ran in sequence: the environment +
  baseline → the standing chrome (drawer 135th + parity MATCH) + the mode
  probe (dark, recorded) → the honest RED (unit 4-fail at markers / 11
  existing green; EL1 e2e at its designed marker — the stale fixture
  200) → the port (the seam + the route wiring + the plant + the
  global-setup wiring) → **the 429 root-cause** (the first placement's
  chunk-2 composition failed s14's CU1a/CU1b twice; the --grep-invert
  control run isolated the EL pins as the cause; the exact POST census
  found ~21 shared-bucket units in chunk 2 incl. the page-fired EG/ED
  uploads invisible to a request.post grep) → **the relocation to
  resilience.spec.ts** → the GREEN sweep (unit 15/15; parity-session7
  138/138; chunk 2 restored 275/275; chunk 3 103/103; the neighbors
  72/72) → the gates (lint ✓ · tsc ✓ · unit 1799/1799 · build ✓) → the
  census + the doc-chain lockstep (the tripwire catching the README
  tree-diagram site live) → **the 5-chunk cold cert map 723/723**
  (158+275+103+95+92, `cert-s188.log`) → the two self-verifying evidence
  frames → the closing chrome (the drawer check GREEN — the 136th; the
  desktop parity probe MATCH) → the commit + the SSH-wrapper push.
- The §6 adjudications held as designed: the 24h retention (§6.1); the
  upload-path placement, post-rate-limit, error-tolerant (§6.2); the
  dark-mode protocol codified in AGENTS.md (§6.3); the consolidation
  deferred to S189 as a decision (§6.4); the fixed-id two-site literals
  (§6.5); the pins' staged rows left in the scratch db (§6.6).
- ONE root-caused discovery beyond the plan (§3.4): the upload-budget
  overflow — the s183 doctrine replayed with a new blind spot (the
  page-fired POSTs a request.post grep cannot see). The lesson lands in
  AGENTS.md S188 lesson 3 + the resilience spec's placement comment, so
  the next pin author counts the bucket before choosing a home.

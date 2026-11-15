# Session 248 — the S188 cycle transcript (the staged-row GC sweep + the dark-mode standing measurement constraint)

The workspace was COLD — a fresh clone at `b9ceff3` on `main` (the S187
close `8b6b4c6` + the operator's session_246/247 transcript commits; the
sandbox had reset between operator messages). This session executed the
full S188 cycle end to end.

- The environment re-derived per the standing recipe (bun install 510
  pkgs, `.env` from `.env.example` at `DATABASE_URL="file:../db/custom.db"`
  with `db/` at the repo root, db push + seed, the pinned chromium v1243
  re-provisioned — the fresh sandbox carried only v1200). The cold
  baseline reproduced the S187 close EXACTLY: lint ✓ · tsc ✓ · unit
  **1795/1795 (55 files)** · build ✓. The standing chrome at the open:
  the drawer check GREEN (**the 135th consecutive** — no Tailwind v4
  mobile-nav bug; backdrop `oklab(0 0 0 / 0.2)` [the documented trap-7
  serialization] + blur(4px), 288px panel, 20 links, no footer, Escape +
  navigate auto-close, appbar z-40 fixed), the desktop parity probe MATCH
  (all five structural checks, both hosts: sidebar 260, 20 links, the
  first-five links, mainX 260, mainWidth 1180).
- The doc chain re-read (AGENTS/CLAUDE/README/PAD v1.3.95/SKILL +
  session_246/247 + the S187 plan §6/§9 close + the worklog tail); the
  skills audit refreshed (the web-application rubric §14/§15, the tdd
  loop rules, the clone-app-pat-pro doctrine, the agent-browser/catalog
  conventions; `skills/` excluded throughout).
- The axis: the S187 close's named candidates — the staged-row GC sweep
  (the S180/ED plan's explicit deferral, closed as the superset hygiene
  cycle) + the dark-mode standing measurement constraint codified; the
  notes-family e2e consolidation DEFERRED to S189 as a decision (the
  blast-radius rule).
- **The reference mode probe** (`scripts/ref-probe-s188-mode.mjs`): the
  operator account persists in DARK mode (html.dark, body rgb(10,10,10),
  recorded 2026-11-15T00:38:31Z) — the theme left as found (the
  zero-residue discipline); the constraint codified in AGENTS.md (the
  S188 lesson 5) + the plan §6.3.
- **The TDD discipline — the honest RED proven**: the unit block (4 EL
  pins) failing at their markers against the pre-change seam (the missing
  exports — 4 failed / 11 existing green) + the EL1 e2e pin failing at
  its designed marker against the pre-change standalone build (the
  25h-stale fixture answering 200 — nothing swept it; EL2 green both
  sides by design, the boundary guard).
- **The port**: the seam (`gcStagedNoteAttachments` +
  `STAGED_ATTACHMENT_RETENTION_MS` — the 24h retention, user-scoped,
  staged-only, the `@@index([userId, createdAt, id])` prefix) wired into
  the staged upload POST AFTER the rate-limit guard (the sweep frequency
  rides the same 20/15-min budget as the minting; a GC failure logs and
  NEVER blocks the upload) + the two-fixture plant
  (`scripts/e2e-plant-stale-staged-attachment.ts`, wired into
  global-setup: A backdated 25h + B fresh — the flat pin form closes
  both phantom holes AND the retry hazard).
- **THE PLACEMENT LESSON (root-caused live — the s183 doctrine
  replayed)**: the EL pins' first cut lived in parity-session7 (the
  notes-family home) and the chunk-2 composition 429'd s14-hardening's
  CU1a/CU1b multipart pins — reproduced twice, then isolated by the
  `--grep-invert` control run (275/275 without the EL pins). The exact
  POST census: chunk 2 rides the demo user's shared 20/15-min upload
  bucket at ~21 units (the EG Files family's 7 file + 3 folder + 1
  link-JSON POSTs — invisible to a `request.post` grep, they ride
  `page.evaluate(fetch)` + `setInputFiles` — + the ED staged family's 5 +
  s14's 5) and the +3 EL units tipped it. **The relocation to
  resilience.spec.ts** (the upload-envelope family's own home, chunk 3's
  ~2-unit composition, ~18 headroom), verified cold BOTH sides: chunk 2
  restored 275/275, chunk 3 **101 → 103**.
- **The GREEN sweep**: the unit block 15/15 (the file); the full
  parity-session7 **138/138** (the ED family's real staged uploads now
  fire the GC — their rows fresh, never swept); the chunk-2 composition
  **275/275**; the chunk-3 composition **103/103**; s14-hardening +
  parity-session9 + s21-data-export **72/72**; lint ✓ · tsc ✓ · unit
  **1799/1799 (55 files)** · build ✓ (one transient root-caused en
  route: a stale incremental tsbuildinfo re-reported the scripts/
  global-main collision after the plant's `export {}` module marker
  landed — cleared, clean).
- **The census** (verified by `--list`, never estimated): 719 total in
  31 files = **718 chromium specs** (+2) + the setup test; the chunk map
  158 + 275 + 103 + 95 + 92 = **723** (chunk 3 +2); the badge 2516 →
  **2522**. The tripwire green after the doc-chain lockstep — which
  CAUGHT one missed site live (the README tree-diagram prose count, the
  DA6 cross-read pin — exactly the anti-rot mechanism working).
- **The evidence**: the two self-verifying frames under
  `docs/screenshots/` — `188-gc-lifecycle-proof.png` (the live API
  sequence rendered as a proof table: fixture B 200 [the plant
  integrity] → the trigger 201 → fixture A **404 [THE SWEEP]** → the
  trigger's row 200 [the fresh boundary] → the second upload 201 → the
  first row still 200 [the repeated-GC boundary]) +
  `188-notes-staged-chip.png` (the staged attachment chip — the visible
  feature whose scratch the GC governs, the href asserted 200 live).
- **The residue discipline**: the reference account untouched — the
  theme left as found (dark), zero content created or deleted.
- **The hand-off**: the commit on `main` + the SSH-wrapper push (the
  operator's standing sequence).

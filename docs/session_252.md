# Session 252 — the S190 cycle transcript (the measured three-family parity port: the calculator Basic-keypad + the AI quick-action copy + the Focus Timer chrome)

The workspace carried the S189 close `7e599ac` + the operator's
session_251 transcript commit `34c948b` on `main`; a fresh clone (the
sandbox had been recycled). This session executed the full S190 cycle
end to end.

- The environment re-derived per the standing recipe (bun install 510
  pkgs, `.env` from `.env.example` at
  `DATABASE_URL="file:../db/custom.db"` with `db/` at the repo root, db
  push + seed, the pinned chromium **v1243** installed — the cache held
  only the stale v1200). The cold baseline reproduced the S189 close
  EXACTLY: lint ✓ · tsc ✓ · unit **1799/1799 (55 files)** · build ✓.
- The standing chrome at the open: the drawer check GREEN (**the 139th
  consecutive** — no Tailwind v4 mobile-nav bug; backdrop
  `oklab(0 0 0 / 0.2)` + blur(4px), 288px panel, 20 links, no footer,
  Escape + navigate auto-close, appbar z-40 fixed) · the desktop parity
  probe **MATCH** (all five structural checks, both hosts) · the s116
  reference resweep **ok:true, 9/9 invariants both hosts, the brand
  truth tables matched, probeCleanup ok** (zero residue).
- **The axis discovery**: the fresh 20-view reference census (all 20
  views, headings/buttons/tabs fingerprints, both hosts — the standing
  instrument that walks EVERY view, where the resweep's 9 invariants
  and the probe's 5 checks are anchors) flagged 16 raw deltas; the
  adjudication pass reduced them to THREE real gap families (the rest:
  the reference account's zero-data empty-state CTAs vs the seeded
  clone — the S123 data-shaped doctrine — plus hidden mobile-only DOM).
  Five precision probes measured every token (the captures under
  `/home/z/my-project/download/ref-captures-s190/`).
- **The mode protocol record (S188/§6.3 clause (a))**: every probe rode
  the reference in LIGHT mode — the account's standing state flipped
  from the S188-era dark (the owner's doing), making the light-era
  token surfaces directly measurable this cycle.
- The three ports, each measured against the live reference
  (2026-11-15):
  1. **The calculator Basic-keypad anatomy** — never re-measured since
     the session-2 E2 fix; the live reference carries the 18-key pad
     (the near-black Clear span-2 + an ICON-ONLY near-black backspace
     on row 1, dark slate-800 operators, the 6px radius family, the
     single-cell gradient `=`), the max-w-md white card (the h-6
     expression line EMPTY at rest + the left-aligned break-all 36px
     result), and the white-bordered tab strip with the near-black
     active face. The ±/^/(/) keys moved to Scientific (xʸ, (, ), % in
     the measured fn order; ln + ! stay as documented supersets).
  2. **The AI quick-action copy/order** — "Summarize Notes" →
     "Summarize" + the tail pair reordered to Translate-then-
     Essay-Ideas (the recon dossier's own record, re-measured live).
  3. **The Focus Timer chrome** — the max-w-2xl column + the white
     rounded-3xl panel card, the freestanding 36px icon-first mode
     pills (gradient active), the 64px tinted two-line preset cards
     (name font-semibold FIRST — the clone's typography was inverted;
     the sf-primary-empty/deep token pair, violet-100/700 at default),
     the brain-icon font-mono capitalize ring interior, the 32px h1
     icon, the compact placeholder-state subject select ("Select
     subject" — the no-selection default, a deliberate behavior
     change), and the 48px near-black Reset/Complete controls
     flanking the 64px gradient play.
- **The reference-defect adjudications** (the plan §6): the inactive
  tab's neutral-400 (~2.2:1 WCAG AA fail) NOT replicated (the slate-600
  a11y stand-in); the Clear key's measured red-600 on near-black
  (4.10:1) ONE-STEP adjusted to red-500 (5.27:1 — the Family F
  precedent, the axe-clean contract outranks exact text-color parity);
  the 4 non-functional carousel dots NOT ported (dead chrome); the
  scientific tab's missing clear key NOT replicated (the clone keeps
  its furniture as a documented superset).
- **The TDD discipline**: the 12 new pins (EN1-EN6 in calculator.spec,
  EN7 in parity-session8, EN8-EN12 in parity-session5) written FIRST and
  run RED against the un-ported tree (12/12 failing at their markers —
  the honest-RED proof captured) → the ports → GREEN. The re-anchors:
  AH4b (the footer-era structural guard), S5-H ×2 (the Clear face +
  the display anatomy), AG3 + AH4a (the dark families), the hue-tokens
  CONSUMERS register (calculator-view's sf-pill-red retired with the
  near-black Clear key), + the `--color-sf-primary-deep` @theme mapping
  (the S135/CJ3 precedent — an unmapped token name silently drops the
  Tailwind v4 utility; caught by the RED pin).
- **The doc-rot rider**: `run-cert-chunk.sh`'s header Expected line had
  carried the stale S185-era 705 through four re-tags (the S189
  lesson-5 class at one remove — the tripwire pins the CHUNKS identity
  + the cert script's own line, not the paired runner's header);
  re-anchored in this cycle's lockstep sweep.
- The census (verified by `--list`, never estimated): unit UNCHANGED
  **1799 [55 files]**; e2e **723 → 735** (chunk 1 +1 [EN7], chunk 3 +5
  [EN8-12], chunk 4 +6 [EN1-6]; 730 chromium specs in the same 31 spec
  files + the setup test = 731 by `--list`); the badge **2522 → 2534**.
- The gates: lint ✓ · tsc ✓ · unit 1799/1799 · build ✓ · **the 5-chunk
  cold cert map 735/735** (159+275+108+101+92, `cert-s190.log`, launched
  reaper-proof via `scripts/launch-cert-s190.py`) — with the honest
  sequence: the map's first pass failed chunk 2's a11y-sweep on
  /FocusTimer (the preset durations' MEASURED `text-xs opacity-70`
  reads ~2.9:1 — the reference's own AA fail, the §6.9 adjudication:
  the opacity dropped, the text-xs hierarchy kept), the fix rebuilt,
  and chunk 2 re-certified cold **275/275** (chunks 1/3/4/5 green in
  the map's pass; the map complete at 735/735).
- **The dev-daemon reload loop** (the S31 lesson, hit at the evidence
  stage): the long-lived dev server that had carried the session's HMR
  edits entered the Fast Refresh loop (1,154 /login reloads; React
  never re-hydrating) — the daemon-restart variant that survives via
  the stale `.next/dev` cache; cleared by the documented remedy
  (`rm -rf .next/dev` + restart + the preflight GREEN).
- The evidence: the two self-verifying frames under
  `docs/screenshots/` — `190-calculator-card-desktop.png` (the
  remediated measured card: the Clear/backspace row + the operators +
  the display anatomy, DOM-asserted before the shot) +
  `190-focus-timer-panel-desktop.png` (the remediated panel: the mode
  pills + the tinted presets + the brain-icon ring + the controls,
  DOM-asserted before the shot; both pixel-verified non-blank).
- The doc-chain lockstep: the README badge + testing lines + tree
  diagram + the Key Features rows + the Session-190 row · the AGENTS
  census lines + the S190 lessons (five) · the CLAUDE census sites ·
  the SKILL census sites (both) · the vitest header (the S190
  re-anchor — the unit census unchanged) · the cert script re-tag +
  the paired runner header + the tripwire comment chain (the CF6/CQ6
  family caught four un-updated sites live mid-lockstep — the
  anti-rot mechanism working) · the PAD **v1.3.98**.
- The closing chrome: the drawer check GREEN (**the 140th**) + the
  desktop parity probe MATCH. The residue discipline: the reference
  account untouched (read-only navigation + login; zero rows created
  or deleted — the resweep's probeCleanup proof).
- The deliverables: `docs/remediation-plan-session190.md` (§5/§9 closed
  as executed), this transcript, the worklog Session-201 entry, `.env`
  at `DATABASE_URL="file:../db/custom.db"` with `db/` at root,
  `.env.example` re-verified (no env changes this cycle).
- The commit + the SSH-wrapper push (the operator's standing sequence)
  close the cycle.

**Suggested next cycle (S191):** the flashcards-family e2e
consolidation (the S189 close's named candidate, deferred by this
cycle's behavior-change axis per the blast-radius rule — the deferral
is a decision, not an omission); a reference behavior-change axis
takes precedence if the next census finds one.

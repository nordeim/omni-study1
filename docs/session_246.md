# Session 246 — the S187 cycle transcript (the filter-row separation + the sf-card border token + the Tasks search width)

The workspace was COLD — a fresh clone at `8606cb2` on `main` (the S186 close
`001ffca` + the operator's session_245 transcript commit; the sandbox had
reset between operator messages). This session executed the full S187 cycle
end to end.

- The environment re-derived per the standing recipe (bun install 510
  pkgs, `.env` from `.env.example` at `DATABASE_URL="file:../db/custom.db"`
  with `db/` at the repo root, db push + seed, the pinned chromium v1243
  re-provisioned — the fresh sandbox carried only v1200). The cold baseline
  reproduced the S186 close EXACTLY: lint ✓ · tsc ✓ · unit **1795/1795 (55
  files)** · build ✓. The standing chrome at the open: the drawer check
  GREEN (**the 133rd consecutive** — no Tailwind v4 mobile-nav bug), the
  desktop parity probe MATCH (all five structural checks, both hosts).
- The doc chain re-read (AGENTS/CLAUDE/README/PAD v1.3.94/SKILL +
  session_244/245 + the S186 plan §6.6/§6.7 close + the worklog tail); the
  skills audit refreshed (the web-application rubric §14/§15, the tdd loop
  rules, the clone-app-pat-pro doctrine, the agent-browser/catalog
  conventions; `skills/` excluded throughout).
- The axis: the S186 close's named candidates — the Assignments/Exams
  filter-row separation, the sf-card border token family, the Tasks search
  width.
- **The measurement** (three reference probes + one clone pre-change twin,
  `docs/probe-evidence/s187/`, zero residue — every popover Escape-closed
  before any submit; the account's DARK state recorded at open per the S186
  constraint, all three surfaces static-class, mode-independent,
  cross-verified against the light-era records — the S185 card record, the
  S183 Files search): the reference's Assignments/Exams headers carry ONLY
  the add button — the search + selects render in a SEPARATE row below
  (`flex flex-col md:flex-row gap-4`, the selects **w-40 160px at BOTH
  viewports** — the clone's `w-full md:w-40` was the never-measured S15-era
  responsive assumption); every measured card surface carries
  **border-slate-100** rgb(241,245,249) 1px (the stat cards + the Timetable
  trio) while the component-class surfaces (the notes editor, the file
  grids, the task rows, the deck cards) keep their measured slate-200 —
  **the two-family boundary**; the search inputs ride **pl-10 (40px) +
  text-base md:text-sm (16/14)**; the Tasks search wrapper is `relative
  flex-1 md:w-64` (256 desktop / the 107px flex-1 collapse at mobile).
- **The TDD discipline**: the honest RED proven — all 7 EK pins failing at
  their designed markers against the pre-change standalone (one pin bug
  root-caused en route: the EK1 element-handle serialization — a
  `page.evaluate` returning a DOM element serializes to a plain object and
  the second evaluate's `el.querySelectorAll` fails; the census
  restructured into ONE evaluate, the S186 single-trip discipline).
- **The port**: the Exams view restructured to the separated filter row
  (the header keeps the measured 2-kid h1-block + Add Exam form; the select
  `w-[130px]` → `w-40`) + the Assignments selects `w-full md:w-40` →
  `w-40` + the three search inputs re-ported to the measured
  `pl-10 text-base md:text-sm` family + the **sf-card utility `#e2e8f0` →
  `#f1f5f9`** + the Tasks search
  **`max-md:flex-1 md:w-64`** — the scoping ROOT-CAUSED during the GREEN
  run: a bare `flex-1` (flex-basis 0) makes the wrap container's intrinsic
  sizing read the input's CONTENT width (239px) instead of the definite
  md:w-64 (the reference's own nowrap toolbar never hits that path); the
  mobile toolbar drops from the wrapped 84px two-line row to the
  reference's own one-line 36px.
- **The GREEN sweep**: all 7 EK pins GREEN; the full parity-session7 file
  **138/138**; tasks + parity-session5 + parity-session6 **81/81**;
  parity-session8 + parity-session9 **109/109**; navigation +
  mobile-navigation + a11y-sweep **107/107**; dark-mode + theme-system
  **48/48**; resilience + s17-fresh-user + greeting-clock + calculator
  **78/78**; lint ✓ · tsc ✓ · unit **1795/1795 (55 files — the census
  UNCHANGED as designed, a view-layer port)** · build ✓.
- **The census** (verified by `--list`, never estimated): the chromium
  specs 709 → **716** (+7); the chunk map 158 + 268 + 101 + 95 + 92 =
  **721** (chunk 2 268 → 275); the badge 2509 → **2516**. The tripwire
  green after the doc-chain lockstep (the cert runner re-tag + the tripwire
  expectation + the README badge/testing line/Session-187 row + the AGENTS
  census + the S187 lessons [five] + the CLAUDE pairs + the three contract
  lines + the PAD **v1.3.95** + the SKILL census sites [all three] + the
  vitest header).
- **The evidence**: the self-verifying 187 frames under `docs/screenshots/`
  (the separated Exams header + filter row at desktop + mobile 390, the
  Assignments 160px mobile selects, the sf-card border family, the Tasks
  one-line mobile toolbar) + the four probe JSONs under
  `docs/probe-evidence/s187/`.
- **The residue discipline**: the reference account untouched — the theme
  left as found (dark), zero content created or deleted (every popover
  Escape-closed).
- **The hand-off**: the commit on `main` + the SSH-wrapper push (the
  operator's standing sequence).

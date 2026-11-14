# Session 244 — the S186 cycle transcript (the auth-button family + the view-header row family)

The workspace was COLD — a fresh clone at `3d41294` on `main` (the S185
close + the operator's session_243 transcript commit; the sandbox had reset
between operator messages). This session executed the full S186 cycle end
to end.

- The environment re-derived per the standing recipe (bun install 509
  pkgs, `.env` from `.env.example` at `DATABASE_URL="file:../db/custom.db"`
  with `db/` at the repo root, db push + seed, the pinned chromium v1243
  re-provisioned — the fresh sandbox carried only v1200). The cold
  baseline reproduced the S185 close EXACTLY: lint ✓ · tsc ✓ · unit
  **1795/1795 (55 files)** · build ✓. The standing chrome at the open:
  the drawer check GREEN (**the 131st consecutive** — no Tailwind v4
  mobile-nav bug), the desktop parity probe MATCH (all five structural
  checks, both hosts).
- The doc chain re-read (AGENTS/CLAUDE/README/PAD v1.3.93/SKILL +
  session_242/243 + the S185 plan §10 close + the worklog tail); the
  skills audit refreshed (the web-application rubric, the tdd loop rules,
  the clone-app-pat-pro doctrine, the agent-browser conventions;
  `skills/` excluded throughout).
- The axis: the S185 close's named candidates — the outline-button
  family re-rotation + the view-header row family re-probe.
- **THE DISCOVERY** (the nine probes' first finding): the reference
  account now sits in **a WORKING dark mode** — `<html class="dark">` +
  body rgb(10,10,10) + the live `.dark` token block. The S10 "the
  reference's Dark option is a measured platform no-op" record is
  INVALIDATED; the S185 "invisible weekday names" + "the --background
  token renders its outline family near-black" findings are re-attributed
  as DARK-TOKEN values. The reference's dark carries its own defect
  family (recorded, not ported — the S83/AJ5 precedent): the **yellow
  primary-foreground** (the app's RGB-triplet `--primary-foreground:
  "255 255 255"` collides with the platform's HSL `.dark` override — the
  `hsl(var(--x))` utility computes `hsl(255 255 255)` = rgb(255,255,0),
  pure yellow text on every gradient CTA; root-caused by the var-cascade
  probe reading the CASCADED value on the button + the format matrix),
  the near-black outline buttons, the still-white cards with near-white
  inherited text — and **the theme switcher is a NO-OP** (the Light card
  click leaves html.dark unchanged after reload). The operator account
  was left exactly as found (dark; zero content residue).
- **The two portable gaps** (mode-independent, static classes):
  1. The reference's ENTIRE auth primary-CTA family is **solid
     slate-900** — rgb(15,23,42) + white text + rounded-xl 12px +
     font-medium + shadow-sm + hover:bg-slate-800 (Sign in h-11 sm:h-12
     44/48; the sub-CTAs h-10 sm:h-11 40/44, measured at 390 and 1440).
     NEVER color-measured before: the S15 probe captured only the first
     six class tokens of each button; the clone's gradient was the
     app-wide CTA assumption.
  2. The view-header taxonomy (all 20 views censused at 1440×900 +
     390×844): the 8 toolbar views carry `flex flex-col md:flex-row
     md:items-center justify-between gap-4` (Dashboard +md:justify-between,
     Tasks +mb-6) — at mobile the toolbar STACKS below the h1; the
     clone's flex-wrap rows reflowed at sm not md. Calculator/
     GradeTracker the row family (`flex items-center justify-between`);
     the Timetable toolbar's gap re-measured 12px.
- **The TDD discipline**: the honest RED proven — all 9 EJ pins failing
  at their designed markers against the pre-change standalone (two pin
  bugs root-caused en route: the "Files" heading substring matched the
  "No files yet" empty-state h2 [exact:true], and the header-row
  ancestor walk missed DIRECT-child buttons/anchors [querySelector
  searches descendants only — the `k.matches(ctrl) ||
  k.querySelector(ctrl)` self-match is the fix]).
- **The port**: the Button's new `solid` variant (bg-slate-900 + white +
  shadow-sm + hover:bg-slate-800 + the dark:bg-slate-800 coherence lift —
  the reference never renders a dark login, no ground truth) + the five
  auth CTAs re-ported (the sf-gradient-shadow retired; the sub-CTA
  heights h-9 → h-10 sm:h-11) + the Tasks 2-kid restructure (the w-full
  sm:w-auto wrapper retired) + the stacking family on Timetable/
  Calendar/Assignments/Exams/Dashboard + the ViewHeader `stack` prop
  (Files/PracticeTests) + the Calculator row family (the wrap retired,
  items-center). The toolbars keep their flex-wrap (the no-overflow
  superset — the S78 adjudication holds at the toolbar level).
- **The GREEN sweep**: all 9 EJ pins GREEN; the full auth + auth-flows
  files **34/34**; the full parity-session7 **131/131**; navigation +
  mobile-navigation **87/87**; dark-mode + theme-system **48/48**;
  a11y-sweep + greeting-clock + calculator **38/38**; parity-session5 +
  parity-session8 **119/119**; resilience + s17-fresh-user + tasks
  **73/73**; lint ✓ · tsc ✓ · unit **1795/1795 (55 files — the census
  UNCHANGED as designed; the hue-tokens dashboard register anchor
  re-anchored 210 → 212, the stacking-header comment pair shifted it)** ·
  build ✓.
- **The census** (verified by `--list`, never estimated): the chromium
  specs 700 → **709** (+9); the chunk map 158 + 268 + 101 + 95 + 92 =
  **714** (chunk 2 262 → 268, chunk 5 89 → 92); the badge 2500 →
  **2509**. The tripwire **138/138** after the doc-chain lockstep (the
  cert runner pair + the tripwire expectation + the README badge/
  testing line/Session-186 row + the AGENTS census + the S186 lessons
  [six] + the CLAUDE pairs + the auth-button + view-header contract
  lines + the PAD **v1.3.94** + the SKILL census sites [all three] +
  the vitest header).
- **The cert map**: the 5-chunk cold run — **158 + 268 + 101 + 95 + 92
  = 714, every chunk first roll**. The closing chrome: the drawer check
  GREEN (**the 132nd**) + the desktop parity probe MATCH.
- **The evidence**: the five self-verifying 186 frames under
  `docs/screenshots/` (the solid Sign in + the Create account CTA + the
  stacked Tasks/Timetable headers at 390 + the desktop Tasks row) + the
  seventeen probe JSONs/PNGs under `docs/probe-evidence/s186/`.
- **The residue discipline**: the reference account untouched — the
  theme left as found (dark), zero content created or deleted (the
  probes' throwaway registration rode the S15 precedent; the operator
  account's own surfaces only ever read).
- **The hand-off**: the commit on `main` + the SSH-wrapper push (the
  operator's standing sequence).

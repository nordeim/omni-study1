# Session 256 — the S192 cycle transcript (the AI-chrome + calendar-day-header parity port: Batch EP)

The workspace carried the S191 close `da40be2` + the operator's session_254
transcript commit `58de1ce` on `main`. The sandbox had been recycled — a
COLD clone: `bun install` (510 pkgs), `.env` from `.env.example` at
`DATABASE_URL="file:../db/custom.db"` with `db/` at the repo root (db push +
seed), the pinned chromium v1243 re-provisioned (the fresh sandbox carried
only v1200), `AUTH_SECRET` generated for the verification standalone (and
later EMPTIED per the S112 bundled-secret recipe once the s22-spec
interaction was re-verified). This session executed the full S192 cycle end
to end.

- The cold baseline reproduced the S191 close EXACTLY: lint ✓ · tsc ✓ ·
  unit **1799/1799 (55 files)** · build ✓.
- The standing chrome at the open: the drawer check GREEN (**the 143rd
  consecutive** — no Tailwind v4 mobile-nav bug; backdrop
  `oklab(0 0 0 / 0.2)` + blur(4px), 288px panel, 20 links, no footer,
  Escape + navigate auto-close, appbar z-40 fixed) · the desktop parity
  probe **MATCH** (all five structural checks, both hosts) · the s116
  reference resweep **ok:true, 9/9 invariants both hosts, the brand truth
  tables matched, probeCleanup ok** (zero residue).
- **The operational incident (root-caused, the S192 lesson 1)**: the first
  :3200 standalone boot resolved `db=file:/home/z/my-project/db/custom.db`
  — the PARENT WORKSPACE path (nonexistent) — and every query died with
  Prisma error 14. Root cause reproduced with `bun -e`: **bun auto-loads
  .env files walking UP the tree from the CWD**, and the sandbox's
  `/home/z/my-project/.env` (an absolute DATABASE_URL pointing at a
  nonexistent file) SHADOWS the repo's own `.env` (`file:../db/custom.db`).
  A shell-provided env var beats every .env file (verified in both
  directions). The remedy: `scripts/launch-standalone-s192.py` PINS
  `DATABASE_URL` (and `AUTH_SECRET`, read from `STANDALONE_AUTH_SECRET`,
  per the S112 recipe — the repo `.env` stays AUTH_SECRET-empty so the
  BUNDLED `.next/standalone/.env` ships empty, the s22 negative-spawn
  spec's contract) in the execve environment. The dev server (:3000) was
  never affected.
- **The axis discovery**: the fresh **20-view reference census** (the S190
  instrument re-created as `scripts/ref-census-s192.mjs` after the sandbox
  recycle wiped the prior scratch copy) flagged 98 raw deltas. Five
  adjudication probe rounds (mode-aware — the reference account rode DARK,
  recorded per the S188/§6.3 protocol; the AI family's fixed light classes
  made its measurements mode-independent) narrowed them to TWO real gap
  families: (1) **the AI Assistant view chrome** — a NEVER-MEASURED
  surface hiding behind four generations of green pins (the S5-N card
  icon/title, the S8-M icon set, the S119/BT6 composer element, the
  S190/EN7 quick-action copy): the max-w-5xl view wrapper (the clone was
  max-w-3xl), the 24px header row + "Your personal AI tutor, available
  24/7" subtitle (the clone shipped 30px + "Your study copilot"), the
  grid-cols-2 md:grid-cols-3 gap-4 quick grid (2-col gap-2 before), the
  measured card anatomy (border-slate-200, hover:border-violet-300,
  hover:shadow-lg, transition-all, the mb-3 32px icon with
  group-hover:scale-110, a REAL h3 title — the span role=heading stand-in
  retired), the py-20 empty-state hero INSIDE the chat card (the 64px
  violet-300 wand-sparkles + "How can I help you study today?" + "Ask me
  anything - explanations, summaries, problem solving, and more!" — the
  bot-circle one-liner retired), the min-h-[500px] rounded-2xl chat card
  containing BOTH the transcript AND the border-t p-4 composer, the
  icon-only h-[60px] gradient send with lucide-send (the "Send" text
  retired; the aria-label superset stays), the textarea's max-h-120 +
  text-base/md:text-sm responsive face, and the left-aligned "…for new
  line" hint; (2) **the Calendar day-detail year** — the reference renders
  "Sunday, November 15" (weekday + month + day, NO year — measured desktop
  AND mobile); the clone's `formatLongDateWithWeekday` appended the
  trailing year. Per the blast-radius rule the measured gap family took
  precedence over the S191 close's named timetable-consolidation candidate
  (deferred again — a decision, not an omission).
- **The non-gap adjudications** (the closing half of every census delta):
  the data-shaped families (the reference account's zero-data empty-state
  CTAs vs the seeded clone — every CTA code-verified in the clone's
  zero-data paths, the S191 lesson 2 loop); the computed-identical tag
  differences (Tasks "My Lists" p-vs-h3, the Settings Appearance h2-vs-div,
  the sidebar brand p-vs-h1 — all probe-verified style-identical); the
  Files-toolbar dark-mode artifact (the round-2 "solid near-black New
  Folder" was `bg-background` in DARK mode — the S183 outline port holds
  in light, re-verified with a fresh HTML dump); the MathSolver
  always-rendered solution card (the S14 aria-live superset, pinned); the
  MyDay empty state (matches the reference exactly); the dashboard (4+4
  stat cards, data-shaped only); and the unverifiable-at-reference-zero AI
  message bubbles (kept, resilience-pinned).
- **The TDD discipline**: the 9 new pins (EP1-EP6b/EP8 in
  parity-session5.spec.ts, EP7 in parity-session8.spec.ts) written FIRST
  and run RED against the un-ported tree (8 failed at their markers +
  EP6b, the mobile 2-col guard, green from the start — the pre-port clone
  was already 2-col at mobile, the pin guards the md:grid-cols-3 port's
  mobile half) → the port (`aiassistant-view.tsx` restructured to the
  measured anatomy with every behavioral contract preserved — the S13
  optimistic-send, the S14 aria-live, the CE3 gate, the CB8 two-domain
  split, the BT6 Enter/Shift+Enter superset, the aria-label supersets; the
  calendar's one-line `formatWeekdayMonthDay` swap) → GREEN 10/10. The
  re-anchors: the S5-N hint copy ("for a new line" → the reference's "for
  new line") + the EN7 locator (`button [role=heading]` → `button h3`).
  One EP8 viewport lesson en route: the e2e suite runs 1280×720, not the
  1440×900 the reference probes ride — the max-w-5xl cap pin must
  `setViewportSize(1440)` before measuring the 1024 cap (the S192 lesson
  5).
- The census (verified by `--list`, never estimated): the unit UNCHANGED
  **1799 [55 files]**; the e2e moves **735 → 744** (chunk 1 +1, chunk 3
  +8; 739 chromium specs in the same 32 spec files + the setup test = 740
  by `--list`); the badge **2534 → 2543**.
- The gates: lint ✓ · tsc ✓ · unit 1799/1799 (the tripwire + the CF6/CQ6
  cross-read family caught THREE un-updated doc sites live mid-lockstep —
  the SKILL green-state line, the SKILL CD3-prose census, the CLAUDE e2e
  line — all re-anchored in the first sweep) · build ✓ (with the
  AUTH_SECRET-empty .env posture re-verified: the bundled
  `.next/standalone/.env` ships `AUTH_SECRET=""`).
- The doc-chain lockstep: the AGENTS census line (735 → 744) + the S192
  lessons block (five) · the CLAUDE e2e line (the EP family references) ·
  the README badge (2534 → 2543) + the testing line + the tree diagram +
  the Session-192 row · the SKILL census sites (three) + the §11
  green-state re-anchor (S191/EO → S192/EP) · the vitest header (the S192
  re-anchor) · the cert scripts' Expected lines (BOTH, 735 → 744,
  160+275+116+101+92 — the CF6 tripwire green) + the S192/EP re-tag
  headers + the tripwire comment chain · the PAD **v1.3.100**.
- The evidence: the three self-verifying frames under `docs/screenshots/`
  — `192-ai-assistant-desktop.png` (the 3-col grid + the hero + the
  icon-only send + the 1024px wrapper, all DOM-asserted before the shot) +
  `192-ai-assistant-mobile.png` (the 2-col mobile grid) +
  `192-calendar-day-detail.png` (the year-less day header) — all
  pixel-verified non-blank.
- The closing chrome: the drawer check GREEN (**the 144th**) + the desktop
  parity probe MATCH. The residue discipline: the reference account
  untouched (read-only navigation + login; zero rows created or deleted).
- The cert map's honest sequence: the first pass caught TWO real misses
  live — the **S9-P catch** (chunk 2: the reference itself moved the
  composer's send glyph wand-sparkles → lucide-send since the S9-era
  measurement; the pin re-anchored to the measured glyph) and the
  **a11y-sweep catch** (the chunk-2 re-run: the h3-in-button
  heading-order violations on /AIAssistant + the hint's slate-400 AA
  fail — both reversed per the S190 Clear-key precedent, the span
  role=heading aria-level=2 stand-in with the measured typography +
  slate-500; the full a11y sweep then 21/21) — plus 2 ambient-IO flakes
  in chunk 3 (DX1b/DX1c, the documented S175/DY5 class, both green in
  isolation); after the fixes, chunk 2 re-certified **275/275 cold** +
  chunk 3 **116/116 cold** — the full map **744/744**
  (160+275+116+101+92). The census re-run at the close: the calendar gap
  CLOSED; the AI view's remaining heads-delta the adjudicated axe-clean
  superset. The evidence frames re-captured on the FINAL tree.
- The deliverables: `docs/remediation-plan-session192.md` (§5 executed,
  §9 closed), this transcript, the worklog Session-203 entry, `.env` at
  `DATABASE_URL="file:../db/custom.db"` with `db/` at root,
  `.env.example` re-verified (no env changes this cycle).
- The commit + the SSH-wrapper push (the operator's standing sequence)
  close the cycle.

**Suggested next cycle (S193):** the timetable family (the twice-deferred
S189 close's named candidate: parity-session7's largest remaining family —
S7-C + CB6 + DJ2 + S185/EI ≈ 15 pins), or a reference behavior-change axis
if the next census finds one.

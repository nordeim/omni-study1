# The S192 remediation plan — the AI-chrome + calendar-day-header parity port (Batch EP: the never-measured AI family + the calendar year)

The axis: the fresh **20-view reference census** (the S190 instrument
re-created as `scripts/ref-census-s192.mjs` after the sandbox recycle wiped
the prior copy from the session scratch area) plus five adjudication probe
rounds found TWO real parity gap families — the **AI Assistant view chrome**
(a never-measured surface: the S5-N/S8-M/S119/S190 pins measured the
quick-action titles/icons, the composer element, and the copy, but never the
grid anatomy, the card anatomy, the empty-state hero, the big chat card, the
header row, or the subtitle) and the **Calendar day-detail year** (the
reference renders "Sunday, November 15" — weekday + month + day, NO year;
the clone renders `formatLongDateWithWeekday` with the year). Every other
census delta adjudicated to a non-gap class (the ledger in §1). Per the
blast-radius rule, a measured visual-parity gap family takes precedence over
the S191 close's named consolidation candidate (the timetable family —
deferred again, a decision not an omission).

## §0 The context and the baseline

- The workspace: the S191 close `da40be2` + the operator's session_254
  transcript commit `58de1ce` on `main`, freshly cloned (the sandbox was
  recycled; a COLD workspace). The environment re-derived per the standing
  recipe: `bun install` (510 pkgs), `.env` from `.env.example` at
  `DATABASE_URL="file:../db/custom.db"` with `db/` at the repo root
  (db push + seed), the pinned chromium v1243 re-provisioned (the fresh
  sandbox carried only v1200), `AUTH_SECRET` generated into `.env` (the
  production boot gate refuses to start the standalone without one).
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
  standalone boot on :3200 resolved `db=file:/home/z/my-project/db/custom.db`
  — the PARENT WORKSPACE path, not the repo — and every query died with
  error 14 ("Unable to open the database file"). Root cause (reproduced
  with `bun -e`): **bun auto-loads `.env` files walking UP the tree from
  the CWD, and this sandbox's parent workspace `/home/z/my-project/.env`
  carries an absolute `DATABASE_URL=file:/home/z/my-project/db/custom.db`
  that SHADOWS the repo's own `.env`** ("file:../db/custom.db"). A
  shell-provided env var wins over every `.env` file (verified). The
  remedy: the standalone launcher (`scripts/launch-standalone-s192.py`)
  pins `DATABASE_URL` in the execve environment — the same mechanism
  `tests/e2e/global-setup.ts` uses for the scratch e2e db. The dev server
  (:3000) was never affected (its boot line resolved the repo db
  correctly — the `next dev` runner does not ride bun's dotenv walk).
- The reference account's standing theme state: **DARK** (recorded per the
  S188/§6.3 protocol; `html.dark`, bodyBg rgb(10,10,10)). The S192 probes
  measured mode-independently where the reference ships fixed light classes
  (the AI family: `bg-white`/`border-slate-200`/`text-slate-800` carry no
  dark variants — the reference's own dark-mode gap), and the round-2
  Files-toolbar anomaly (a "solid near-black New Folder") was diagnosed as
  the dark-mode rendering of `bg-background` — in light mode the S183
  outline port holds (verified against the S183 records + a fresh HTML
  dump).

## §1 The census and the adjudication ledger (what was measured, what it adjudicated to)

The fresh 20-view census flagged 98 raw deltas across 20 views. The
adjudication (each class probe-verified or code-checked):

**REAL GAPS (the S192 port set — 2 families):**

| # | Surface | Reference (measured live) | Clone (pre-port) |
|---|---------|---------------------------|------------------|
| G1 | AI header row | h1 `text-2xl font-bold` (24px) + subtitle `text-slate-500` "Your personal AI tutor, available 24/7"; the WHOLE view wrapped `max-w-5xl mx-auto space-y-6` | h1 `text-3xl` (size="lg") + subtitle "Your study copilot"; no max-w-5xl wrapper |
| G2 | AI quick-action grid | `grid grid-cols-2 md:grid-cols-3 gap-4` (3 cols @1440, 2 @390, 16px gap) | `grid grid-cols-2 gap-2` (2 cols everywhere, 8px gap) |
| G3 | AI quick-action card | `p-4 bg-white rounded-xl border border-slate-200 hover:border-violet-300 hover:shadow-lg transition-all text-left group`; icon `w-8 h-8 text-violet-500 mb-3 group-hover:scale-110 transition-transform`; title a REAL `<h3 class="font-semibold text-slate-800">` | `sf-card rounded-xl p-4 … hover:border-sf-primary/40`; icon `size-8 text-sf-primary` (no mb-3, no hover scale); title `<span role="heading" aria-level={2} class="mt-2 block …">` |
| G4 | AI empty-state hero | INSIDE the chat card's transcript area: `text-center py-20` + `lucide-wand-sparkles w-16 h-16 mx-auto text-violet-300 mb-4` + `<h3 class="text-xl font-semibold text-slate-700 mb-2">How can I help you study today?</h3>` + `<p class="text-slate-500">Ask me anything - explanations, summaries, problem solving, and more!</p>` | a bot-icon-in-tinted-circle + one-liner "Ask anything about your studies — or start with a quick prompt." + the quick grid BELOW |
| G5 | AI chat card + composer | one big card `bg-white rounded-2xl border border-slate-200 shadow-sm min-h-[500px] flex flex-col` containing the transcript (`flex-1 overflow-y-auto p-6 space-y-4`) AND the composer (`border-t border-slate-100 p-4`; row `flex gap-3`; textarea `text-base md:text-sm flex-1 min-h-[60px] max-h-[120px] resize-none shadow-sm`; icon-only gradient send `h-[60px] px-6` with `lucide-send w-5 h-5`; hint `text-xs text-slate-400 mt-2` "Press Enter to send, Shift + Enter for new line") | transcript and composer as SIBLING surfaces (no card); textarea `text-sm w-full` (no text-base/md:text-sm, no max-h); send button carries the "Send" TEXT + WandSparkles icon; hint text-centered with "for a new line" |
| G6 | Calendar day-detail header | "Sunday, November 15" — `formatWeekdayMonthDay` (weekday + month + day, NO year; measured desktop AND mobile) | `formatLongDateWithWeekday(selected)` → "Sunday, November 15, 2026" |

**NON-GAPS (adjudicated, with the evidence):**

1. The 14 data-view deltas (Tasks/Assignments/Exams/Notes/Flashcards/
   PracticeTests/StudyGroups/GradeTracker/Analytics/Timetable/Dashboard/
   MyDay/Files-empty/MathSolver-history): the reference account's TRUE-ZERO
   empty states vs the seeded clone — every empty-state CTA code-verified
   in the clone's zero-data paths (the S191 lesson 2 loop; myday-view:226
   "Add Your First Task", tasks-view:756, notes-view, flashcards-view:552,
   studygroups-view:237, the timetable accordions data-driven).
2. Tasks "My Lists": the reference renders an H3, the clone a `<p>` —
   computed styles IDENTICAL on both hosts (14px/600/uppercase/0.7px/
   rgb(100,116,139), probe-verified). The tag difference is not a visual
   gap; the surface is S6-A/S8-F-pinned.
3. Settings "Appearance" panel title: the reference a shadcn DIV
   (`font-semibold leading-none tracking-tight`), the clone an H2 —
   computed typography IDENTICAL (16px/600 both). The clone's h2 is the
   a11y superset (the reference's panel carries NO heading at all).
4. Files toolbar: the round-2 "solid near-black New Folder" was the
   reference's DARK-MODE `bg-background`; the fresh HTML dump confirms the
   S183 record (outline New Folder + the gradient Upload LABEL) — the
   S183 port holds.
5. Math solver "Math solution" card: the clone's always-rendered
   aria-live card is the S14 a11y contract (pinned by s14-hardening D3);
   the reference renders the solution section only after solving. A
   deliberate, pinned superset.
6. Dashboard: 4+4 stat cards; the ref's stat values are H3s, the clone's
   H2s — the StatCard comment documents the conscious Lighthouse-driven
   deviation (session 61). Data-shaped deltas only.
7. Sidebar brand: the reference's "StudyFlow" is an H1
   (`font-bold text-slate-800 text-lg`); the clone ships a `<p>` — the
   s67 measurement is recorded in the sidebar comment; computed
   typography pinned by the brand truth tables.
8. AI transcript message bubbles: the reference account carries zero
   messages — the bubble anatomy is UNVERIFIABLE at reference-zero (no
   read-only measurement exists). The clone's bubbles stay (pinned by the
   resilience family).
9. The reference's mobile drawer carries no `[role=dialog]` and its
   app-bar button no aria-label — the clone's dialog semantics +
   "Open navigation menu" label are the a11y supersets (S3-I-pinned).

## §2 The gap table (the port set)

| # | Surface | Current (pre-change) | Post-change | Class |
|---|---------|----------------------|-------------|-------|
| G1 | AI header row + wrapper | size="lg" (30px h1), "Your study copilot", no wrapper | default size (24px h1), "Your personal AI tutor, available 24/7", `mx-auto w-full max-w-5xl space-y-6` wrapper around header + grid + card | parity port |
| G2 | AI quick grid | `grid-cols-2 gap-2` | `grid grid-cols-2 gap-4 md:grid-cols-3` | parity port |
| G3 | AI quick card | sf-card + span role=heading + mt-2 | the measured card anatomy + the a11y-safe heading face (§6.5) + mb-3 icon + group-hover:scale-110 | parity port |
| G4 | AI empty hero | bot-circle + one-liner + grid below | the py-20 hero INSIDE the card (wand-sparkles 64px violet-300 + h3 + tagline), grid ABOVE the card | parity port |
| G5 | AI chat card + composer | sibling transcript/composer, text Send button, centered hint | the min-h-[500px] card containing transcript + composer; icon-only send (lucide-send, h-[60px] px-6); left hint "…for new line" | parity port |
| G6 | Calendar day-detail | `formatLongDateWithWeekday` | `formatWeekdayMonthDay` | parity port |

## §3 The port design

1. **§3.1 The AI view** (`src/components/views/aiassistant-view.tsx`):
   - Keep: the optimistic-send contract (S13), the aria-live/aria-busy
     transcript (S14), the CE3 loading gate (S136), the CB8 two-domain
     failure split, the BT6 composer behavior (Enter sends, Shift+Enter
     inserts a newline — the pinned superset), the `aria-label="Message
     the assistant"` + `aria-label="Send message"` labels (a11y
     supersets the s14/resilience pins ride), the outer
     `h-[calc(100vh-8rem)]` scroll architecture + the scrollTop effect
     (the transcript inner-scrolls; the reference's own scroll posture is
     unverifiable at zero data), the message-bubble anatomy (§1.8).
   - Port: the wrapper + header row (G1), the grid + card anatomy
     (G2/G3), the empty hero (G4), the chat card + composer chrome (G5).
   - Dark mode: the reference ships NO dark variants on this family (its
     own dark-mode gap); the clone keeps its working dark mode (the
     S186/S188 doctrine) — every ported class gains the clone's
     established `dark:` counterparts (`dark:border-slate-700`,
     `dark:bg-card`, `dark:text-slate-100` etc.).
   - `text-violet-300` renders the @theme-pinned `--color-violet-300:
     #c4b5fd` (globals.css:88) — the measured rgb(196,181,253); no
     hue-token register change (the register tracks sf-pill/sf-alert
     consumers).
2. **§3.2 The Calendar day-detail** (`src/components/views/calendar-view.tsx:416`):
   `formatLongDateWithWeekday(selected)` → `formatWeekdayMonthDay(selected)`
   (the function exists — used by myday/timetable/events). The day-cell
   aria-labels keep `formatLongDate` (the clone's superset locator
   contract the S6 pins ride).
3. **§3.3 The re-anchors** (the pins that pin the OLD anatomy):
   - S5-N (parity-session5.spec.ts:572): the hint copy pin
     "…Shift + Enter for a new line" → "…Shift + Enter for new line"
     (the reference's measured copy).
   - EN7 (parity-session8.spec.ts:1909): the locator stays
     `button [role=heading]` (the §6.5 axe-floor reversal keeps the span
     heading face; the pin's comment records the adjudication).
   - The S5-N heading checks (`card.getByRole("heading", …)`) work for a
     heading role unchanged (the §6.5 reversal keeps the span face);
     the S8-M icon pins are anatomy-agnostic; the
     s14/resilience label pins ride the kept aria-labels.

## §4 The TDD plan (RED → GREEN)

The new pins (EP1–EP8) are written FIRST and run RED against the
un-ported tree (the S190/EN discipline), then the port turns them GREEN:

- **EP1** (parity-session5.spec.ts, the S5-N family): the quick-action
  grid renders 3 columns at 1440 with a 16px gap; 2 columns at 390.
- **EP2**: the quick card carries the measured anatomy — border
  slate-200 (light), radius 12px, p-4, and the title face (the span
  heading role at level 2 — the §6.5 reversal) with no top margin; the
  icon carries mb-3.
- **EP3**: the AI header: h1 at 24px (not 30px) + the subtitle "Your
  personal AI tutor, available 24/7".
- **EP4**: the empty-state hero: the wand-sparkles icon at 64px
  violet-300, the hero heading "How can I help you study today?"
  (20px/600 — the span heading face, §6.5), the
  tagline "Ask me anything - explanations, summaries, problem solving,
  and more!", the py-20 centered wrapper, all INSIDE the chat card.
- **EP5**: the chat card: min-height ≥500, radius 16px (rounded-2xl),
  border slate-200, the transcript p-6, the composer INSIDE the card
  (border-t), the composer row gap-3.
- **EP6**: the composer send is icon-only (no "Send" text), 60px tall,
  gradient; the textarea `text-base md:text-sm` with min-h-60/max-h-120;
  the hint reads "Press Enter to send, Shift + Enter for new line"
  (left-aligned).
- **EP7** (parity-session5 or -6, the calendar family): the day-detail
  h3 omits the year (the `^(Weekday, Month Day)$` shape, no trailing
  year), keeps 700 weight.
- **EP8**: the view wrapper is max-w-5xl (1024px) centered.

## §5 The execution order (the TODO list)

1. [x] The environment + the cold baseline + the standing chrome +
   the census + the five adjudication probe rounds + this plan.
2. [x] **The RED set** — EP1–EP8 written and run RED against the
   un-ported tree (8 failing at their markers; EP6b green-from-the-start
   as the mobile-half guard).
3. [x] **The port** — §3.1 (AI) + §3.2 (Calendar) + §3.3 re-anchors
   (+ the §6.5 axe-floor reversal + the S9-P send-glyph re-anchor the
   cert map caught).
4. [x] **The GREEN set** — EP1–EP8 green 10/10; the re-anchored S5-N
   + S9-P green; the full a11y sweep 21/21; the affected chunks
   re-certified cold (275/275 + 116/116).
5. [x] **The full gates** — lint ✓ · tsc ✓ · unit 1799/1799 (the
   tripwire + cross-reads) · build ✓.
6. [x] **The 5-chunk cold cert map 744/744** (160+275+116+101+92 —
   chunks 1/4/5 in the map's pass, chunks 2/3 re-certified cold after
   the S9-P + axe-floor fixes; `cert-s192.log`, launched reaper-proof
   via `scripts/launch-cert-s192.py`).
7. [x] **The evidence frames** — `docs/screenshots/192-ai-assistant-
   desktop.png` + `192-ai-assistant-mobile.png` +
   `192-calendar-day-detail.png` (DOM-asserted before the shot,
   pixel-verified non-blank, re-captured on the FINAL tree).
8. [x] **The closing chrome** — the drawer check GREEN (the 144th) +
   the desktop parity probe MATCH + the census re-run (the calendar gap
   CLOSED; the AI view's remaining heads-delta the adjudicated axe-clean
   superset).
9. [x] **The doc-chain lockstep** — AGENTS (the S192 lessons ×6 + the
   census line), the README tree/Session-192 row + badge + testing line,
   the CLAUDE census site, the SKILL re-anchor ×3 sites, the vitest
   header, the PAD v1.3.100, the worklog Session-203 entry,
   `docs/session_256.md`, `.env.example` re-verified.
10. [ ] **The commit + the SSH-wrapper push** (the operator's standing
    sequence — the only open item).

## §6 The adjudications (the open questions, resolved)

1. **§6.1 The scroll architecture stays the clone's.** The reference's
   transcript-scroll-vs-page-scroll posture is unverifiable at
   reference-zero (no messages, and the residue discipline forbids
   sending one). The clone's `h-[calc(100vh-8rem)]` + inner-scroll +
   scrollTop effect is pinned behavior (s14/resilience) — changing it on
   an unverifiable measurement would be speculative. The card's
   `min-h-[500px]` reproduces the measured empty-state geometry inside
   the clone's architecture.
2. **§6.2 The message bubbles stay.** Same evidence bound (§1.8): the
   reference's bubble anatomy cannot be measured read-only. The clone's
   bubbles are resilience-pinned.
3. **§6.3 The dark-mode variants stay on every ported class.** The
   reference's AI family has no dark variants (its dark mode renders
   the family light-on-dark with fixed classes — the probe-observed
   posture); the clone's working dark mode (S186/S188 doctrine) adds
   `dark:` counterparts. In LIGHT mode (the parity mode) both hosts
   render the measured values.
4. **§6.4 The send button keeps its aria-label + the Enter/Shift+Enter
   behavior.** The reference's icon-only send carries NO label (its own
   a11y gap) and its Shift+Enter SENDS (measured S119); the clone's
   label + newline behavior are pinned supersets (BT6).
5. **§6.5 The h3-in-button port is REVERSED at the axe floor (the
   cert-map catch).** The reference's quick-action title is a real h3
   inside the button (measured DOM), and the first port shipped exactly
   that — the cert map's a11y sweep then flagged TWO heading-order
   violations on /AIAssistant (the h1 view header → h3 card titles skip,
   plus the hero h3). The reference's own a11y gap is NOT replicated (the
   S190 Clear-key precedent: the axe-clean contract is a repo-level pin
   that outranks exact DOM parity): the clone keeps its span
   role=heading aria-level=2 stand-in with the MEASURED typography (the
   same classes, byte-identical computed styles — pinned by EP2/EP4 via
   computed style, not tag). The same class applies to the composer
   hint's color: the reference's text-slate-400 measures 2.84:1 on white
   (its own AA fail) — slate-500 ships (4.76:1, the S190 inactive-tab
   precedent).
6. **§6.6 The day-cell aria-labels keep the year.** They are the
   clone's locator contract (S6 pins navigate by
   `aria-label="November 3, 2026"`); the reference's cells carry no
   labels at all. Only the day-detail HEADER format ports.
7. **§6.7 The hint copy ports exactly** ("for new line", no "a") — the
   S5-N pin re-anchors with it (the pin pinned the clone's drifted
   copy; the reference's own copy is the ground truth).
8. **§6.8 The Violet-300 icon color rides the pinned theme step** —
   no new token, no register change (§3.1).

## §7 The re-anchor risk register

- `src/components/views/aiassistant-view.tsx` — the G1–G5 port (the
  S13/S14/CE3/CB8/BT6 contracts preserved verbatim).
- `src/components/views/calendar-view.tsx` — one-line G6.
- `tests/e2e/parity-session5.spec.ts` — EP1/EP2/EP3/EP4/EP5/EP6/EP8 +
  the S5-N hint re-anchor.
- `tests/e2e/parity-session8.spec.ts` — EP7 + the EN7 locator
  re-anchor.
- The census sites — only if the spec-file count moves (it does not:
  no new spec files; the pin count moves 735 → 743 across chunks 1/2/3
  per the pin placement; AGENTS/CLAUDE/README/SKILL/vitest-header/PAD
  lockstep per the standing chain).
- The `tests/script-conventions.test.ts` tripwire — the CHUNKS arrays +
  the Expected line UNTOUCHED (no file moves; the counts move inside
  existing files).

## §8 The verification ledger (what proves this cycle)

- The RED set: EP1–EP8 failing at their markers pre-port.
- The GREEN set: EP1–EP8 + the re-anchors green post-port.
- The affected-file cold compositions (the AI/calendar pin families).
- The full gates: lint · tsc · unit 1799/1799 · build.
- The cert-map composition (the affected chunks, cold).
- The closing chrome: the drawer check (144th) + the parity probe
  MATCH + the census re-run (zero real gaps).
- The evidence frames under `docs/screenshots/` (self-verified).

## §9 The close-out (as executed)

- The §5 order ran in sequence with TWO honest cert-map catches en route:
  - **The RED set** (8 failing at their markers + EP6b green-from-the-start
    as the mobile-half guard) → the port → **GREEN 10/10** (one EP8
    viewport fix en route — the 1280 suite viewport vs the 1440 probe
    viewport, the S192 lesson 5).
  - **The cert map's first pass** (744 expected): chunk 1 **160** ✓ ·
    chunk 2 273+2 failed — the **S9-P catch**: the reference itself MOVED
    the composer's send glyph (wand-sparkles → lucide-send) since the
    S9-era measurement; the pin re-anchored to the measured lucide-send
    (the S192 reference-drift class) · chunk 3 111+2 failed — the
    DX1b/DX1c ambient-IO flakes (the documented S175/DY5 socket-timeout
    class under the map's memory contention; both green in isolation) ·
    chunks 4/5 **101/92** ✓.
  - **The a11y-sweep catch** (the chunk-2 re-run): the h3-in-button
    heading-order violations + the hint's slate-400 AA fail — both
    reversed per §6.5 (the span-heading stand-in + slate-500); the FULL
    a11y sweep then **21/21** green.
  - **The re-certifications**: chunk 2 **275/275 cold** · chunk 3
    **116/116 cold** — the full map **744/744** (160+275+116+101+92).
- The gates: lint ✓ · tsc ✓ · unit 1799/1799 (the tripwire + the CF6/CQ6
  cross-reads — three live catches mid-lockstep, all re-anchored) ·
  build ✓ (the AUTH_SECRET-empty .env posture — the bundled copy verified
  empty).
- The closing chrome: the drawer check GREEN (**the 144th**) · the
  desktop parity probe MATCH (all five checks) · the census re-run: the
  calendar gap CLOSED, the AI view's remaining heads-delta the adjudicated
  axe-clean superset (the reference's real h3s vs the clone's span
  headings — computed-identical).
- The evidence: the three self-verifying frames (the AI desktop + mobile
  + the calendar day-detail) re-captured on the FINAL tree, DOM-asserted
  before the shots, pixel-verified non-blank.
- The residue discipline: the reference account untouched (read-only).

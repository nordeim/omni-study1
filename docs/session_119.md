# Session 125 — Batch BY (Cycle 74): The Audit-Driven Hardening Cycle — the GradeLevel-Clear + Export-Cap + Hydration-Gate Set

> Record of worklog **Session-124 / Batch BY**. Workspace: refreshed clone at `4176367`
> (the Batch BX state `d7364b6` + the operator's `docs/session_118.md` transcript).
> Plan + execution record: **`docs/remediation-plan-session124.md`**.

## The directive

The operator directed the standing rhythm: refresh the workspace, re-read the full doc chain
(`AGENTS.md`, `CLAUDE.md`, `README.md`, `PAD`, `omni-study1_SKILL.md`,
`docs/session_117.md`, `docs/remediation-plan-session123.md`, `worklog.md`,
`docs/session_118.md`), re-validate against the codebase, audit with the repo skills as
rubrics (the `skills/` folder excluded from checking/testing/compilation), iterate on
visual + functional parity with `https://omni-study1.base44.app/` (the mobile navigation
menu the named focus, Tailwind v4 the named suspicion class), keep the repo a
production-ready functional SUPERSET, verify the `.env`/`db/` contract and the vitest +
playwright suites, plan + execute remediation TDD-style, capture evidence, update the docs
chain, and commit + push to `main` via the SSH wrapper.

## Baseline (cold, BEFORE any work)

lint ✓ · `tsc --noEmit` ✓ (`noImplicitAny` + the unused guards) · unit **1099/1099** (41
files) · the canonical build green · the cold 5-chunk e2e **516/516** (136+151+69+90+70,
every chunk first-pass — run per-chunk in the foreground, replicating the cert script's
exact kill→fresh-db→run procedure) · the register re-derivation **249 importers / 130
Usage-line carriers / 0 stale / 119 usage-line-free** (the 26th consecutive hold, the
expectation stated BEFORE the measurement — the calibrated instrument: repo files importing
`playwright` exactly) · the Mode-C audit of the Batch BX diff (`d7364b6`): **all
substantive claims re-verified TRUE** against the tree (BX1's `hhmmMinutes` single source
at every enforcement site + the seed padding + `normalizeHhmmForInput` on edit-populate;
BX2's `verifyAcct` per-account cap after the lookup answering the uniform 400; BX3's
`toDatetimeLocalValue`/`fromDatetimeLocalInput` owning both boundaries in exams + events;
BX4's dummy-scrypt burn; BX5's shared `nullableId` in both folder routes; BX6's elapsed
recording; BX7's `crypto.randomUUID` draft ids + the pure countdown updater with the
effect-shape zero-detection; BX8's `effectiveDeckId` highlight; BX9's string state +
parse-on-submit; BX10's corrected comment + the fresh-state reads; the five `123-*.png`
frames present; +14 unit pins in the diff; zero key material in the diff).

## Live parity (both hosts — agent-browser + DOM probes)

**No NEW visual parity gap; no Tailwind v4 mobile-nav bug — s124 re-confirmed (the 25th
consecutive live confirmation).** The standing reference battery held at 390×844: the
unlabeled hamburger (accessible name null, 36px), no `role=dialog` drawer-open, 24 visible
links drawer-open, the 288px `w-72` panel, the backdrop `blur(4px)` on the TRUE
`lg:hidden fixed inset-0 bg-black/20 backdrop-blur-sm z-50` layer, `/Notes` overflow
416 > 390 (the reference's own defect), and at 844×390 the landscape drawer-nav scroll
992 > 290. The clone battery GREEN: the labeled hamburger (the a11y superset) + drawer
(`role="dialog"`, `aria-label="Navigation menu"`, 20 nav links, the 288px `w-72` panel
with `max-w-[85vw]` computing 331.5px, the backdrop BUTTON at `blur(4px)`), navigation →
/Analytics + auto-close, `/Notes` clean at 390, the scroll persistence 600px carried
Dashboard → /Analytics. Probe residue: ZERO on both hosts.

## The audits

Two parallel deep audits against the `skills/web-application` rubrics with ROTATED
coverage (the BX cycle had just deep-covered the auth family + the delegate factory +
the entity shells + the schema/seed + the http seam [API] and the data layer + the layout
chrome + the views + the primitives + the charts [frontend]; this cycle's fresh eyes went
to what BX did NOT deep-cover): the API audit focused on the **platform-services family**
— settings/preferences (the full PATCH surface incl. the S17 study-profile fields), the
RUM routes (POST/GET + the CSV export), export/data, calculator/history, health, the
site/sitemap/robots contract, the boot chain (instrumentation + env-check + db-path), the
client/server transport seams (api.ts + http.ts), the pure seams (data-export,
rum-diagnostics), and the FULL 18-site rate-limiter census — **0C/0H/3M/3L/6I**; the
frontend audit focused on the **design-system core** — globals.css end-to-end (the
@theme pins, the dark twins, the sf-* utility census, forced-colors/print), the
theme/store lifecycle (7 accents × 17 tokens, the boot-script parity), the Quill render
paths (the XSS surface), the a11y contract surfaces, and the oldest e2e specs' assertion
quality — **0C/0H/2M/6L/2I**. Every finding was verified by direct read before it entered
the plan. Verified-clean areas are recorded in the plan's §0.1 (the settings sent-keys
semantics, the RUM POST/GET/CSV contracts, the export's 20-collection completeness + the
double secret guard, the calculator retention trim, health, the site contract, the boot
chain, http.ts's error mapper + the capped reads with zero raw body reads, the @theme
palette pins byte-exact with the unpinned-class sweep CLEAN, the dark twins complete, the
theme machine-guarded parity, the Quill render paths injection-free, the a11y contracts,
the pin-quality sweep).

## The BY set (TDD — RED first, then the source)

**RED:** 8 failing unit pins (validation 3 [the BY1 "" clear leg failing with the
production ZodError itself — the strongest red — + the BY9 accepted-today legs] + db-path
1 [the BY2 production leg RECEIVING the silent dev-DB redirect, the exact defect class,
with the dev-correction leg GREEN-on-arrival as the no-regression guard] +
rum-diagnostics 4 [the missing-export family, the BX3 coverage-pin style, with the panel
seam-to-seam gap-tolerance leg GREEN-on-arrival]) + 8 failing e2e pins (BY1-wire, BY9-wire,
BY8, BY13, BY10, the re-anchored BW11 copy leg, BY3-between, BY5 — every one verified RED
for the RIGHT reason).
**GREEN: unit 1099 → 1113 (41 files); e2e 516 → 523 (137+153+71+92+70).**

- **BY1** the gradeLevel clearable form — the Study Profile card's "Not set" mapped to
  `undefined` (JSON.stringify drops the key, the route's sent-keys filter skips it) while
  the bare enum 400'd the `""` that would have cleared: a user picked "Not set", saved,
  got the success toast, and the stored grade SILENTLY PERSISTED (the select even kept
  showing "Not set" until a reload snapped it back). The schema gains the
  `z.union([GRADE_LEVELS enum, ""])` clearable form (the DB column's natural `""` state —
  the schoolName convention in the same card), the UI sends `""`, and the round-trip is
  live-verified through the reload (`me` reads `""`).
- **BY2** the db-path production gate — the Turbopack-mangled fallback (a dev-boot
  convenience for Next's pre-resolution quirk) fired for ANY absolute `file:` URL missing
  on disk, including a production boot whose operator skipped `db:push`: prod writes
  silently landed in the SEEDED dev database (the §18 "reads the WRONG database" class).
  The fallback now fires only outside production (the explicit `nodeEnv` parameter keeps
  the seam pure + unit-pinnable); in production the missing absolute target passes through
  and fails LOUDLY downstream — DEPLOYMENT.md §4 form-2's promise is finally true.
- **BY3** the export/import size reconciliation — the import capped at 10 MiB while the
  export emits base64 file payloads INLINE (ADR-019's "COMPLETE content" promise), so ~4-5
  max-size uploads made the user's OWN backup unrestorable in-app with no warning at
  export time. `IMPORT_MAX_BYTES` 10 → 25 MiB; the panel's client pre-check now reads the
  SAME constant (its own 10 MiB hardcode had already silently drifted); the between-caps
  acceptance e2e-pinned (a ~12 MiB envelope imports); the BW11 over-cap pin re-anchored
  with the MiB-copy leg.
- **BY4** the RUM contract doc sync — AGENTS documented p75 as "nearest-rank over the
  last 200 events" (the shipped `take: 500`) and the trends as "the ≤ 20 most recent
  values" (the shipped 7-UTC-day buckets); the route's own "daily mean" comment corrected
  to the real newest-sample semantics. Same-commit doc/code sync.
- **BY5** the export-family limiter — the two heaviest enumerations (export/data: 20
  tables + base64 payloads + the full in-memory JSON.stringify; rum/export: 2000 rows →
  CSV) answered unlimited GETs while every other family is budgeted. ONE shared
  `export:${user.id}` 10/15-min key on both GETs (the ai: shared-key precedent);
  wire-pinned: exhausting one route 429s the sibling.
- **BY6** the RUM trends null-gap semantics — unsampled days fabricated literal 0s (a 0
  CLS reads as a GOOD score, so the sparkline looked great on idle days — a display lie on
  the owner panel). The series construction extracts to the pure `buildTrends` seam,
  gaps are null, the panel's finite filter drops them (the seam-to-seam contract
  unit-pinned); the UTC-day bucket documented as the chosen single-owner semantics.
- **BY7** the hydration-gate fleet swap — the `--sf-primary !== ""` wait was used ~21×
  across 16 spec files as the "wait for hydration" gate, but the pre-paint boot script
  sets the var BEFORE first paint (true at t=0, proving nothing — the repo documents this
  itself). Replaced by the HydrationMarker contract (`data-app-hydrated`, set on the shell
  COMMIT — which per ADR-014 implies auth + the active view's initial collections
  resolved, so it IS the data gate); the five-view overflow pin's compensating 900 ms
  sleep DELETED.
- **BY8** the checked-checkbox print-exact — AGENTS' S12 print contract claims coverage on
  "the checked checkboxes"; the code carried none (PriorityCheckbox's checked branch is an
  accent fill + a WHITE glyph — print stripped both, checked and unchecked printed
  identically). `sf-print-exact` joins the checked branch; e2e-pinned under print
  emulation (`print-color-adjust: exact`).
- **BY9** the avatarEmoji vocabulary — `z.string().max(8)` accepted ANY ≤8-code-point
  string while the picker is unit-pinned to 24 emojis (an arbitrary string stored +
  rendered as the avatar; the Settings grid then showed no selected tile). The vocabulary
  refine + the `""` clear form; unit + wire pinned.
- **BY10** the popstate drawer close — the store's popstate listener set `view` only;
  hardware/browser Back with the drawer open swapped the view UNDER the open drawer. The
  listener now also closes it; e2e-pinned (goBack with the drawer open → closed + the URL
  followed).
- **BY11** the skip-link gating — the anchor rendered in the splash/error branches where
  `<main id="main-content">` does not exist (activating it focused nothing); it now
  renders only in the ready branch.
- **BY12** the dead `sf-focus` utility removed (zero consumers repo-wide; the SKILL doc
  described it as load-bearing) + both doc mentions synced to the real
  `focus-visible:ring-*` convention.
- **BY13** the forced-colors picker restoration — the S12 block covered exactly its
  documented set; the Settings theme/accent/avatar tiles, the dialog color pickers
  (event/subject/group/deck), the timer mode/preset rows, and the practice answers marked
  selection purely with fills — INVISIBLE under Windows HC. Container-scoped selectors
  only (the Appearance tab, the labeled groups, `[role="dialog"]` — the bare-aria-pressed
  doctrine honored); e2e-pinned on the accent tile's `Highlight` outline.
- **BY14** the s4o probe residue note (the registered-but-never-deleted probe account
  documented in-spec — it can never self-delete through the public API; the AB4
  aged-scratch doctrine).
- **BY15** the comment-hygiene set (the S5-D pins' byte-correct values relabeled
  NEUTRAL-200/950, not gray; button.tsx's "the neutral ramp is unpinned" — it IS pinned
  since S120; globals.css's clock-date comments calling violet-900 "violet-950"; the
  timetable `zIndex: 1` local-exception note).
- **BY16** the docs-drift set — README's stale "508" census line (the one line BX11
  missed) + the pre-BT5 boot band + 16.4.0 + the wrong clone URL + "Six accent themes";
  PAD's ADR-022 "30-day session cookie" (the sibling BX11 missed — the shipped TTL is
  7 days) + the version cells (16.4.2, Tailwind 4.3.3) + §8.1's era-grouped distribution
  rows REGENERATED as a per-file script-derivable table + §12's Lines column re-measured +
  the threat-model rows (the BX2 cap, the BX4 equalizer) + the dangling "§14 anchors"
  citation + the stale screenshots annotation; the SKILL doc's nine drift items (the
  ^16.1.1 cell, the 16→18 Radix pkgs, the same clone URL, the vitest include, the
  entities.ts line-count dropped, the six missing special routes, the Task shape's `done`
  → `completed`, the 834+299 footnote reconciled, AP-132 added).

## The honest mid-run corrections (six, all pin-side or gate-side)

1. The BY3 pin's padding first rode an unknown ROW field — `sanitizeImportRow` caps
   EVERY string field (unknowns included, the BR1 guard), so the leg 400'd on the row
   guard, not the cap; the padding moved to the envelope's documented IGNORED user block
   (the byte-count mechanism at the capped read is shape-independent — the RED reason
   unchanged).
2. The BY8 filter button's accessible name is "Filter tasks: Active" (the measured
   prefix), not "Active" — the error snapshot's page arbiter.
3. The BY10 describe sat outside the file's beforeEach describe — the page never
   navigated (the 45 s blank-page timeout was a wrong-reason red).
4. The BY7 swap over-reached `gotoDark` — the appHydrated marker never fires on the
   NON-SHELL /rum route (the AU3b pin hung at the gate); the helper's gate returned to the
   route-universal `.dark` observable (itself post-hydration: setMode PATCHes the record
   without the client cache, so the boot script paints the stale LIGHT theme and only
   loadFromUser resolves the class — the honest gate for BOTH route classes).
5. The s20 sparkline pin's visibility assertion moved to the chart container — the
   single-value flat line (`points="0,16 100,16"`, the seam's documented promotion,
   confirmed PRESENT in the runner's trace DOM snapshot) has a zero-HEIGHT element box:
   painted and user-visible, but Playwright's toBeVisible requires a non-empty bounding
   box.
6. The plan's §3 said "+6 = 522" while listing 7 pins — corrected to +7 = 523 before the
   cert.

Plus one environment note: the dev daemon accumulated stale Turbopack state mid-session
(the panel stuck on Loading — the S9 lesson re-hit); the S32 restart recipe resolved it
and the live probes were re-run against the fresh daemon.

## Re-certification (all on the FINAL tree)

lint ✓ · `tsc --noEmit` ✓ (`noImplicitAny` + `noUnusedLocals`/`noUnusedParameters`) ·
unit **1113/1113** (41 files) · the canonical build green · the cold 5-chunk e2e **523/523**
(137+153+71+92+70 — every chunk first-pass on its final-tree run: chunks 4 + 5 each needed
one corrected re-run [the gotoDark gate, the sparkline re-anchor] and both re-runs were
themselves first-pass) · the register tripwire **249/130/0-stale/119** — the exact hold
(the 27th consecutive, the expectation stated BEFORE the measurement; the scratch
diagnostic script deleted before the derivation) · the live curl battery (the gradeLevel
set → clear "" → me `""` → restore; the avatar 400 with the actionable copy; the export
family 10 × 200 then the 11th 429 AND rum/export 429 on the shared key; the 12 MiB
between-caps import → 200 + `created: 1` + DELETE cleanup + residue verified 0) · the
live agent-browser battery (BY10's Back-with-drawer-open → closed + URL followed; BY1's
"Not set" surviving the reload; `data-app-hydrated` observed live on the Settings shell)
· the five `docs/screenshots/124-*.png` evidence frames (the dashboard, the mobile
drawer, the settings grade, the rum sparkline, the settings appearance —
non-blank-verified) · `.env.example` verified current (the diff carries no new env
reads). **Standing debt: ZERO.**

## Docs chain

README badge 1637 + the Session-124 row + the census lines + the five drift fixes; AGENTS
commands 1113/523 + the S124 lessons ×4 + the RUM contract sync + the conventions (the
settings vocabulary contracts, the export limiter + the import cap, the z-map inline
exception); CLAUDE Unit-line 1113 + the BY seam tail + the e2e line 523; vitest header
1113 (41 files); PAD v1.3.32 (the revision block + the ADR-022 7-day reconcile + the
version cells + §8.1's per-file regenerated table + §12's re-measured Lines + the
threat-model rows + the limiter census + the dangling-citation fix + the screenshots
note); the cert-script 523 census re-tag; the master remediation-plan header → Batch BY;
the SKILL doc census + the nine drift fixes + AP-132 + the focus-convention sync;
`worklog.md` (this cycle's entry); this record.

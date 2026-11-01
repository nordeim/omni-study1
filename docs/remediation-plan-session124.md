# Remediation Plan — Session 124 / Batch BY (Cycle 74)

**Status: COMPLETE** (executed TDD-style 2026-11-01 — the verification record is §5 below)
**Date:** 2026-11-01 · **Workspace:** refreshed clone at `4176367` (the Batch BX state
`d7364b6` + the operator's `docs/session_118.md` transcript) · **Audit-driven hardening
session** — the standing rhythm (audit the prior-batch diff, ride the riders, re-certify
cold).

---

## 0. Scope and Method

The operator directed the standing rhythm: refresh the workspace (`git pull` → `4176367`,
clean — `docs/session_118.md` the only new file), re-read the full doc chain (`AGENTS.md`,
`CLAUDE.md`, `README.md`, `PAD`, `omni-study1_SKILL.md`, `docs/session_117.md`,
`docs/remediation-plan-session123.md`, `worklog.md`, `docs/session_118.md` — README/PAD +
the SKILL doc digested via parallel read-only subagents, AGENTS.md/CLAUDE.md read direct),
re-validate against the codebase, audit with the repo skills as rubrics
(`skills/web-application/SKILL.md` §5/§6/§7/§16 the API surface, §8/§9/§12/§13/§14 the
frontend; `skills/` excluded from checking/testing/compilation), iterate on visual +
functional parity with `https://omni-study1.base44.app/` (the mobile navigation menu the
named focus, Tailwind v4 the named suspicion class), keep the repo a production-ready
functional SUPERSET, verify the `.env`/`db/` contract (`DATABASE_URL="file:../db/custom.db"`
+ `db/` at the repo root — verified current) and the vitest + playwright suites (both
configs present and census-anchored), plan remediation for everything found, execute with
TDD (RED → GREEN), capture evidence, update the docs chain, and commit + push to `main`
via the SSH wrapper.

Method (the six-phase workflow): ANALYZE → PLAN (this document) → VALIDATE (every finding
re-verified by direct read BEFORE planning the fix — all 5 M findings and the fix-worthy
L items personally re-verified against the tree; the M/H claims additionally probed at the
wire or in the DOM) → IMPLEMENT (smallest safe diff, TDD) → VERIFY (cold re-cert) →
DOCUMENT.

### Baseline (cold, BEFORE any work)

lint ✓ · `tsc --noEmit` ✓ (`noImplicitAny` + `noUnusedLocals`/`noUnusedParameters`) ·
unit **1099/1099** (41 files) · the canonical build green (exit 0) · the cold 5-chunk e2e
**516/516 — 136+151+69+90+70, every chunk first-pass** (run per-chunk in the foreground,
replicating the cert script's exact kill→fresh-db→run procedure — the sandbox reaps
daemonized processes between tool calls) · the register re-derivation **249 importers /
130 Usage-line carriers / 0 stale / 119 usage-line-free** (the 26th consecutive hold, the
expectation stated BEFORE the measurement — the calibrated instrument: repo files
importing `playwright` exactly) · the Mode-C audit of the Batch BX diff (`d7364b6`, 41
files, +1305/−102): **all substantive claims re-verified TRUE** against the tree (BX1's
exported `hhmmMinutes` + both-legs minutes checks + the entities merge + the seed padding
+ `normalizeHhmmForInput` on edit-populate; BX2's `verifyAcct:${user.id}` per-account cap
after the lookup answering the uniform 400; BX3's `toDatetimeLocalValue`/
`fromDatetimeLocalInput` owning both boundaries in exams + events; BX4's dummy-scrypt
burn on the register fast path; BX5's shared `nullableId` in both folder routes; BX6's
`durations.focus - remaining` elapsed; BX7's `crypto.randomUUID` draft ids + the pure
countdown updater with the effect-shape zero-detection; BX8's `effectiveDeckId` row
highlight; BX9's string-state + parse-on-submit; BX10's corrected myday comment + the
studygroups fresh-state reads; the five `123-*.png` frames present; the vitest header
census 1099 current; +14 unit pins in the diff; zero key material in the diff).

### Live parity (both hosts — agent-browser + DOM probes)

**No NEW visual parity gap; no Tailwind v4 mobile-nav bug — s124 re-confirmed (the 25th
consecutive live confirmation).** The standing reference battery held at 390×844: the
unlabeled hamburger (accessible name null, 36px), no `role=dialog` drawer-open, 24 visible
links drawer-open, the 288px drawer panel (`h-screen w-72`), the backdrop `blur(4px)` on
the TRUE `lg:hidden fixed inset-0 bg-black/20 backdrop-blur-sm z-50` layer, `/Notes`
overflow 416 > 390 (the reference's own defect), and at 844×390 the landscape drawer-nav
scroll 992 > 290. The clone battery GREEN: the labeled hamburger (`aria-label="Open
navigation menu"`, 36px — the a11y superset) + drawer (`role="dialog"`,
`aria-label="Navigation menu"`, 20 nav links, the 288px `w-72` panel with
`max-w-[85vw]` computing 331.5px, the backdrop BUTTON `bg-black/20 backdrop-blur-xs` at
`blur(4px)`), navigation → /Analytics + auto-close, `/Notes` clean at 390 (scrollWidth
390 = 390), the scroll persistence 600px carried Dashboard → /Analytics (scrollY 600
after the view switch, drawer auto-closed). Probe residue: ZERO on both hosts (the
reference probes read-only; the clone probes wrote no rows).

### The audits

Two parallel deep audits against the `skills/web-application` rubrics with ROTATED
coverage (the BX cycle had just deep-covered the auth family + the delegate factory +
all 26 entity shells + the schema/seed + the http seam [API] and the data layer + the
layout chrome + the views + the primitives + the charts [frontend]; this cycle's fresh
eyes went to what BX did NOT deep-cover): the API audit focused on the platform-services
family — settings/preferences (the full PATCH surface incl. the S17 study-profile
fields), the RUM family (POST/GET + the CSV export), export/data, calculator/history,
health, the site/sitemap/robots contract, the boot chain (instrumentation + env-check +
db-path), the client/server transport seams (api.ts + http.ts), the pure seams
(data-export.ts, rum-diagnostics.ts), and the FULL rate-limiter census (18 call sites —
all correctly placed before validation/body-reads) — **0C/0H/3M/3L/6I**; the frontend
audit focused on the design-system core (globals.css end-to-end — the @theme pins, the
dark twins, the sf-* utility census, forced-colors/print), the theme/store lifecycle
(the 7 accents × 17 tokens, the boot-script parity), the Quill editor (the XSS surface),
the a11y contract surfaces (skip link, aria-live, forced-colors scope), the cross-cutting
hygiene sweeps (hardcoded hexes, z-index, trap-4), and the oldest e2e specs' assertion
quality — **0C/0H/2M/6L/2I**. Every finding was verified by direct read before it entered
the plan; the M items' claims re-read at the code level (below). Verified-clean areas
are recorded in §0.1.

### §0.1 Verified-clean (the next cycle's coverage map)

Settings PATCH sent-keys semantics (absent never wipes, `{}` no-op, the displayName
whitespace guard, the name/displayName alias, enums from the constants module,
studyGoalHours 1–12 bounds, the publicUser response whitelist); RUM POST (the 1000/15-min
budget before readJson, rumBatchSchema depth, the user-scoped compound upsert —
cross-user pollution impossible); RUM GET (owner-scoped, take-500, nearest-rank p75,
correct public CWV bounds); RUM CSV (RFC-4180 + the formula-injection guard, the
2000-row cap, the download-header contract); the export's 20-collection completeness +
the double secret guard + hashless profile; calculator history (the 500-row retention
trim); health (leaks nothing); the site contract (22-URL sitemap, robots); the boot chain
(env-check bands, the s22 fail-fast); db-path beyond M2 (three anchors, empty/whitespace,
Windows drives, non-SQLite passthrough); http.ts (the error mapper never leaks stacks;
readJson's Content-Type gate + counting cap; no raw request.text()/.json() anywhere
under src/app/api — grep-verified); the pure seams. FE: the @theme palette pins byte-exact
(19 families, the unpinned-class sweep CLEAN — every used family-step resolves to a
@theme pin); --shadow-sm/--radius-sm alone; the sf-* consumer census (every utility has
a consumer except sf-focus — the L4 finding); no orphaned --sf-* tokens; the dark twins
complete (all 19, --radius mode-invariant); the Events panel unconditionally dark;
theme.ts ↔ store.ts ↔ boot-script parity (machine-guarded by the theme tests); the Quill
render paths (the only dangerouslySetInnerHTML is the static boot script; notes/AI/
imported content all render as React children — no HTML injection surface; the autosave
lifecycle sound); the 4 audited spec files' pin quality (no duplicate titles, provenance
comments throughout, no vacuous-fallback asserts, cleanup in finally); the skip-link
ready-state contract; Radix dialog focus traps; the cross-cutting sweeps (hardcoded hexes
all reference-measured; the z-map respected outside one informational; trap-4 clean).

## 1. The verified findings (consolidated, de-duplicated)

**API M1 — `gradeLevel` can never be cleared: the shipped "Not set" UI option is a silent
no-op.** The Study Profile card maps "Not set" to `undefined` (`settings-view.tsx:321`),
JSON.stringify drops the key, and the route's sent-keys filter skips it — while the
schema's `z.enum([…12 values])` has no clearable form (`""` → 400). The DB column is
`String @default("")` (the natural cleared state — `schoolName: ""` clears fine in the
same card; inconsistent clear semantics). A user picks "Not set", saves, gets the
"Study profile saved" toast — and the stored grade silently persists.

**API M2 — db-path: an absolute `file:` URL to a not-yet-existing file silently redirects
to the dev DB.** The Turbopack pre-resolution guard (`db-path.ts:62-68`) fires for ANY
absolute `file:` target missing on disk when the dev default exists — including a
production boot whose operator skipped `db:push`. Prod writes then land in the dev DB
with seed data, silently (the code's own §18 "reads the WRONG database" class). The
Docker posture is structurally immune (ENV + `RUN rm -rf /app/db`); the exposed postures
are repo-checkout `next start`/standalone copies. DEPLOYMENT.md §4 form-2's "Absolute
paths pass through untouched" is currently conditional.

**API M3 — backup/restore asymmetry: the export is unbounded (base64 file payloads
inline) while the import caps at 10 MiB.** `export/data` reads `fileItem` with no select
(base64 payloads inline) into one unbounded envelope; `data-import.ts:20` caps the
import at `IMPORT_MAX_BYTES = 10 MiB` (413 + the panel's pre-check message). ~4–5
max-size uploads (2 MiB → base64 ×4/3) make the "own your data" round-trip download a
backup the in-app restore then rejects — with no warning at export time. ADR-019's
"COMPLETE content (files with payloads)" promise forbids trimming the export; the cap
must rise to cover the realistic round-trip.

**API L1 — AGENTS.md's RUM contract drifted from the shipped route + a stale in-route
comment.** AGENTS documents p75 as "nearest-rank over the last 200 events" (code: `take:
500`) and the trends as "the ≤ 20 most recent values" (code: 7 UTC-day buckets, each the
day's NEWEST sample — the S20 final-value-wins semantics); the route's own header comment
says "daily mean" while the inner comment documents the real semantics.

**API L2 — the two heaviest enumerations carry no limiter.** `export/data` GET (20
tables + base64 payloads + a full in-memory JSON.stringify) and `rum/export` GET (2000
rows → CSV) answer unlimited requests while every other write/enumeration family in the
repo is budgeted (the S14 posture). Looping them holds the whole envelope in memory on a
single-node SQLite deployment.

**API L3 — RUM trends bucket by UTC day and fabricate zeros for unsampled days.** An
unsampled day renders a literal `0` — indistinguishable from a genuine zero-value sample
(the schema permits real zeros; a 0 CLS is a GOOD score, so the sparkline looks great on
idle days — a display lie on the owner panel). The UTC-day bucket half is a defensible
single-owner choice to DOCUMENT, not change (a client-TZ parameter surface is not
warranted for a Low display item).

**FE M1 — the `hydrated()` e2e gate is vacuous, and the five-view overflow pin pairs it
with a fixed 900 ms sleep.** `waitForFunction(--sf-primary !== "")` is used ~45× as the
"wait for hydration" gate, but the pre-paint boot script sets `--sf-primary` on
`<html>.style` before first paint — the condition is true at t=0. The repo documents
this itself (page.tsx:56-58: "The --sf-primary wait alone resolves pre-paint"). The
concrete risk case: the S78/AE9-13 five-view overflow pin measures `scrollWidth` after
the vacuous gate + a bare 900 ms sleep — a data-rendered overflow regression can pass
under slow loads. The CORRECT gate exists: `HydrationMarker` sets
`data-app-hydrated` on the shell commit, and the load-stability contract (ADR-014)
guarantees the shell mounts only after auth AND the active view's initial collections
resolve — the marker IS the data gate.

**FE M2 — checked-checkbox print state loss — the code contradicts AGENTS.md's own S12
print contract.** AGENTS.md:136 claims `sf-print-exact` coverage on "the checked
checkboxes"; `PriorityCheckbox`'s checked branch (`border-sf-primary bg-sf-primary
text-sf-primary-foreground` + a WHITE ✓ glyph) carries no print-exact — neither does
any ancestor in the Tasks/MyDay/Dashboard rows. In print, the accent fill strips and the
white glyph disappears — checked and unchecked print identically (bare 2px circles). The
other claimed surfaces verified intact (Button variants, sf-gradient, the events panel,
the calendar month card, the myday amber block).

**FE L1 — `avatarEmoji` accepts any ≤8-char string at the API boundary.**
`z.string().max(8)` bypasses the unit-pinned 24-emoji picker (`AVATAR_EMOJIS` lives in
the same file, `validation.ts:248`); an arbitrary string lands in the DOM as the avatar
(React-escaped — no XSS, but the Settings grid then shows no selected tile). The `""`
clear form must stay legal.

**FE L2 — `popstate` flips the view but leaves the mobile drawer open.** The listener
(`store.ts:100-105`) sets `view` only; `navigate()` also closes the drawer — the popstate
path doesn't. Hardware/browser Back while the drawer is open swaps the view underneath
the open drawer.

**FE L3 — the skip link has no target on the splash/error surfaces.** The
`href="#main-content"` anchor renders in BOTH page.tsx branches but `<main
id="main-content">` exists only when `status === "ready"` — activating it during
splash/error focuses nothing.

**FE L4 — `sf-focus` is dead CSS the SKILL doc calls load-bearing.** The `@utility` has
zero consumers repo-wide (the views use `focus-visible:ring-*` pairs); SKILL.md:230/375
describe it as the focus convention.

**FE L5 — forced-colors: selection state is invisible on the Settings Appearance pickers
(and the dialog color pickers) under Windows HC.** The S12 restoration covers exactly
its documented set (calendar/tabs/today/nav/slider); the theme/accent/avatar tiles
(`settings-view.tsx:188/210/228`) and the dialog-hosted color pickers
(events/flashcards/studygroups) mark selection purely with fills/rings that
forced-colors strips. A superset-surface a11y gap (no parity impact — media-gated CSS).

**FE L6 — the S4-O zero-state probe registers a user and never deletes it**
(`navigation.spec.ts:703-711`). An unverified account can never self-delete through the
public API (login gates 403; verifying + signing in would clobber the shared
storageState) — the honest disposition is the in-spec residue note (the cold-`rm
db/e2e.db` doctrine), not a contrived cleanup.

**FE I1/I2 — the comment-hygiene pair.** Three mislabeled color-family comments (S5-D's
pins assert byte-correct NEUTRAL-200/950 values labeled "gray-200/950";
button.tsx's "the neutral ramp is unpinned" — it IS pinned since S120;
globals.css's sf-clock-date comment calls violet-900 "violet-950") + one inline
`zIndex: 1` outside the documented z-map (timetable-view.tsx:353 — a local same-cell
overlap tweak needing the exception note).

**Doc drift (16 verified items)** — README:109 says 508 (should be 516 — the one census
line BX11's fix missed); README:44 carries the pre-BT5 boot band ("< 32 chars WARN" —
the shipped band is <16 FATAL / 16–31 WARN); README:59 says Next 16.4.0 (package.json
says ^16.4.2 — the S83 security bump); README:136-138 clones `omni-study.git` (the repo
is `omni-study1.git`); README:234 says "Six accent themes" (ACCENTS has 7); PAD:624
ADR-022's Rationale still says "30-day session cookie" (the shipped TTL is 7 days —
BX11 reconciled ADR-003's sibling but missed this one); PAD:430/433 stale version cells
(Next 16.4.0 → 16.4.2; Tailwind 4.1.x → 4.3.3 resolved); PAD §12's Key-Files "Lines"
column badly stale (12+ rows, e.g. validation.ts "~230" vs 510 actual, globals.css
"~230" vs 993); PAD §8.1's itemized distribution rows three-plus epochs stale (they sum
to 51 files/1194 vs the correct Total 71/1615 — BX11 fixed only the Total row);
PAD:970's OTP threat row omits the S123/BX2 per-account cap (and :991's
register-enumeration row omits BX4's equalizer); PAD:416 cites "§14 anchors" that exist
nowhere; PAD:764's screenshots annotation stale (1326 files); SKILL:77 the Next cell
(^16.1.1/16.4.0 installed → ^16.4.2/16.4.2); SKILL:82 says 16 Radix pkgs (18);
SKILL:101-102 the same wrong clone URL; SKILL:134 the vitest include pattern; SKILL:341
entities.ts "621 lines" (535 — the count rots; drop it); SKILL:357-359's
special-routes enumeration misses six routes (ai/generate-questions, ai/generate-cards,
import/data, export/data, rum, rum/export); SKILL:853-855 the Task shape example says
`done` (the model field is `completed`) and omits `subjectId/priority/repeat/myDay/
subtasks`; SKILL:30's "834 + 299 in six chunks" vs §11's map summing 302 (a 3-test
internal inconsistency in the historical narrative).

**Dismissed as documented non-gaps (with reasons):** the API I-items (no server-side
avatar whitelist → fixed as BY9 below, so the record item retires; per-event RUM rating
client-trusted — the documented field-data convention, ratings re-derive from p75; no
default client timeout on apiGet/apiSend — the AI surfaces pass explicit timeouts, the
documented posture; RumEvent unbounded rows — the documented scratch-cleanable posture
with capped reads; RUM GET samples===total naming-only; `apiSendFns` — the phantom name
exists only in the previous cycle's coverage map, not in any doc — nothing to fix in
the repo). The reference's own defects (the /Notes overflow; the unlabeled hamburger)
— parity doctrine, documented. The UTC-day trends bucket — documented as the chosen
semantics (BY6 fixes only the zero-fill lie).

## 2. The BY set (TDD — RED first, then the source)

- **BY1 the gradeLevel clearable form (API M1).** The schema accepts the clearable
  form: `gradeLevel: z.union([z.enum(GRADE_LEVELS), z.literal("")]).optional()` — the
  `""` stores as `""` (the DB column's natural cleared state, the schoolName
  convention). The UI sends `""` for "Not set" and maps the stored `""` back to the
  select's "none" position on load. **Pins:** unit (the schema legs: a valid grade ✓,
  `""` ✓, `"X"` ✗ [RED pre-fix: the ZodError itself]) + wire e2e (s14-hardening: PATCH
  `gradeLevel: ""` → 200 → `/api/auth/me` shows `""`; set → clear round-trip [RED
  pre-fix: 400]).
- **BY2 the db-path production gate (API M2).** `resolveDatabaseUrl(envUrl, anchors,
  nodeEnv = process.env.NODE_ENV)` — the Turbopack-mangled fallback fires only when
  `nodeEnv !== "production"`; in production an absolute URL passes through untouched
  (a missing target fails LOUDLY downstream — never the silent dev-DB redirect), making
  DEPLOYMENT.md §4 form-2's promise true. **Pins:** unit (production + missing absolute
  + existing default → the raw URL passes through [RED pre-fix: the dev default
  returns]; the dev/test correction pins stay, explicitly parameterized).
- **BY3 the export/import size reconciliation (API M3).** `IMPORT_MAX_BYTES` 10 →
  **25 MiB** (covers ~18 max-size files base64-inflated + content — the realistic
  round-trip ADR-019 promises), the panel's pre-check copy synced, every "10 MiB"
  doc/census reference re-anchored (grep-driven), the BW11 over-cap pin's payload
  re-anchored to >25 MiB. **Pins:** the between-caps acceptance leg — a valid envelope
  between 10 and 25 MiB (a small valid task + padding in an unknown field — Zod strips
  unknown keys, verified: zero `.strict()` in the schemas) → 200 [RED pre-fix: 413 at
  the 10 MiB cap] with finally-cleanup; the over-cap 413 re-anchored (in-place).
- **BY4 the RUM contract sync (API L1).** AGENTS.md:105-106 re-anchored to the shipped
  route (the 500-event p75 window; the trends = 7 UTC-day buckets, each the day's
  NEWEST sample — final-value-wins, gaps null per BY6) + the route's "daily mean"
  comment corrected. Same-commit doc/code sync.
- **BY5 the export-family limiter (API L2).** `checkRateLimit(\`export:${user.id}\`,
  10)` after requireUser, before the queries, on BOTH export GETs (the family posture —
  one shared key, the ai: shared-key precedent). **Pin:** wire e2e (resilience: 10
  GETs of export/data → the 11th 429s with Retry-After → rum/export ALSO 429s on the
  shared budget [RED pre-fix: 200s] — one pin locks both wirings + the family shape).
- **BY6 the RUM trends gap semantics (API L3).** The series construction extracts to
  the `rum-diagnostics.ts` seam (`buildTrends(events, now)`), pushes `null` for
  unsampled days (the sparkline's finite filter drops gaps — verified in the seam), and
  the route delegates. The UTC-day bucket documented as the chosen semantics. **Pins:**
  unit (the seam: a gap day → null, a sampled day → the newest value, the 7-day window
  shape [RED: the missing export, the BW11 coverage-pin style] + the panel row
  gap-tolerance leg).
- **BY7 the hydration gate swap (FE M1).** Every `--sf-primary` waitForFunction gate
  in the three affected spec files (mobile-navigation, parity-session5,
  parity-session6 — ~45 sites) swaps to the HydrationMarker contract
  (`document.documentElement.dataset.appHydrated === "true"` — the shell-commit gate
  that implies auth + the active view's initial collections resolved per ADR-014); the
  five-view overflow pin's 900 ms sleep DELETED (the marker is the data gate). Test-
  infrastructure hardening — verified by the cold re-cert (every pin that passed with
  the vacuous gate passes with the strictly-stronger one; the marker sets before any
  pin measured post-hydration data).
- **BY8 the PriorityCheckbox print-exact (FE M2).** `sf-print-exact` joins the checked
  branch — the accent fill + white glyph survive print (AGENTS.md's S12 claim becomes
  true). **Pin:** e2e (accessibility: check a task's checkbox → emulate print media →
  the checked box's `print-color-adjust` computes `exact` [RED pre-fix: `auto`] — the
  S12 print-family pattern).
- **BY9 the avatarEmoji vocabulary (FE L1).** `z.enum` over `AVATAR_EMOJIS` (the same
  file) refined to admit the `""` clear form — a bogus string 400s with an actionable
  copy. **Pins:** unit (a listed emoji ✓, `""` ✓, an unlisted 6-char string ✗, an
  unlisted 8-char string ✗ [RED pre-fix: accepted]) + wire (s14-hardening: PATCH
  `avatarEmoji: "sneaky"` → 400 [RED pre-fix: 200]; a listed emoji → 200).
- **BY10 the popstate drawer close (FE L2).** The listener also sets
  `mobileMenuOpen: false` (the navigate() contract). **Pin:** e2e
  (mobile-navigation: drawer open → `page.goBack()` → the drawer closed AND the view
  followed the URL [RED pre-fix: the drawer stays open]).
- **BY11 the skip-link gating (FE L3).** The anchor renders only in the ready branch
  (the splash/error surfaces have no `#main-content` target). Guarded by the existing
  ready-state skip-link pins.
- **BY12 the sf-focus removal (FE L4).** The dead `@utility` deleted; SKILL.md:230/375
  re-anchored to the real `focus-visible:ring-*` convention (grep-verified: zero
  consumers, zero pins).
- **BY13 the forced-colors picker restoration (FE L5).** One doctrine-consistent
  scoped rule extending the S12 block: `[aria-label="Appearance"]
  [aria-pressed="true"]` + `[role="dialog"] [aria-pressed="true"]` (the dialog color
  pickers) — container-scoped, never bare (the 12-file aria-pressed census honored);
  the focustimer/practicetests picker rows join via container aria-labels where
  absent (invisible, superset-safe). **Pin:** e2e (accessibility: forced-colors
  emulation → the selected accent tile shows the `Highlight` system outline [RED
  pre-fix: none]).
- **BY14 the s4o residue note (FE L6).** The in-spec comment documenting the accepted
  residue (the cold-`rm db/e2e.db` doctrine; the account can never self-delete — the
  AB4/AGENTS aged-scratch pattern).
- **BY15 the comment-hygiene set (FE I1/I2).** The three mislabeled color-family
  comments corrected (neutral-200/950; the pinned neutral ramp; violet-900) + the
  timetable `zIndex: 1` local-exception note.
- **BY16 the docs-drift set.** README:109 → 516; README:44 → the BT5 band; README:59 →
  16.4.2; README:136-138 → omni-study1.git; README:234 → Seven; PAD:624 → the 7-day
  cookie; PAD:430/433 → the resolved versions; PAD §12's Lines column re-measured;
  PAD §8.1's distribution rows re-measured (script-derived per-file counts — the BX
  census 41 unit + 30 e2e / 1099 + 516 reconciling to the Total 71/1615); PAD:970/991
  → the BX2/BX4 rows; PAD:416/764 → the dangling reference + the screenshots note;
  SKILL:77/82/101-102/134/341/357-359/853-855/30 → the verified corrections (the 621
  line-count dropped, the 6 missing special routes listed, the Task shape
  `completed`-corrected, the 834+299 footnote reconciled to §11's 302) + the standard
  census re-tags riding the final counts (README badge, AGENTS commands, CLAUDE, the
  vitest header, the cert script, the master plan header, the SKILL census).

## 3. Verification checklist (the cold re-cert)

lint ✓ · `tsc --noEmit` ✓ · unit (new census — 1099 + 14 = **1113** in 41 files: BY1 +3,
BY9 +4, BY2 +2, BY6 +5) · the canonical build · the cold 5-chunk e2e (new
census — projection: 516 + 7 = **523** [chunk 1 +1 BY10; chunk 2 +2 BY1-wire +
BY9-wire; chunk 3 +2 BY3-between + BY5; chunk 4 +2 BY8 + BY13; chunk 5 +0 —
the BY3 over-cap re-anchor rides in-place] = 137+153+71+92+70) · the register
tripwire re-derivation (**249/130/0/119 expected to hold — no new playwright
scripts; the pins ride existing spec files**) · the live curl battery (the
gradeLevel clear round-trip; the avatar 400; the export limiter 429; the
between-caps import acceptance) · the live agent-browser battery (the mobile
drawer family, the popstate close, the grade "Not set" round-trip) · the
evidence screenshots (the `124-*.png` frames — the dashboard, the mobile
drawer, the BY-fixed surfaces) · `.env.example` verified current (the diff
carries no new env reads). **Standing debt: ZERO.**

## 4. Documentation chain (the same-commit updates)

README (the census lines + the Session-124 row + the drift set) · AGENTS.md (the commands
census + the S124 lessons + the RUM contract sync + the BY-seam notes) · CLAUDE.md (the
Unit line census + the BY seams) · vitest.config.ts header (the new census) · PAD (the
revision block v1.3.32 + the §8.1/§12 re-measures + the ADR-022 7-day reconcile + the
threat-model rows + the version cells) · the cert-script census re-tag (AFTER the final
counts land) · the master remediation-plan header → Batch BY · the SKILL doc (the census +
the drift set + the focus-convention sync) · `worklog.md` (this cycle's entry) ·
`docs/session_119.md` (the session record, titled "Session 125").

## 5. Execution record (2026-11-01)

**Status: COMPLETE — standing debt ZERO.** Executed TDD-style in the plan's order; the census
projection held exactly (after one arithmetic correction — see correction 6).

- **RED verified:** 8 failing unit pins (validation 3 [the BY1 "" clear leg failing with the
  production ZodError itself + the BY9 "sneaky"/"sneaky12" legs failing on the accepted-today
  strings] + db-path 1 [the BY2 production leg receiving the SILENT DEV-DB REDIRECT —
  `file:/tmp/dbpath-gate-…/db/custom.db` — exactly the defect class the finding describes; the
  dev-correction leg GREEN-on-arrival as the no-regression guard] + rum-diagnostics 4 [the BY6
  missing-export family, the BX3 coverage-pin style; the panel seam-to-seam null-gap leg
  GREEN-on-arrival — the finite filter already drops nulls]) + 8 failing e2e pins (BY1-wire
  [the "" → 400], BY9-wire [the bogus avatar → 200], BY8 [print-color-adjust `auto`], BY13
  [the forced-colors outline `none`], BY10 [the drawer VISIBLE after goBack], the re-anchored
  BW11 over-cap [the 413's copy still saying "10 MiB"], BY3-between [the 413 at the 10 MiB cap],
  BY5 [the 11th export GET 200]) — every one verified RED for the RIGHT reason before the
  source changed.
- **GREEN:** unit **1099 → 1113** (41 files); e2e **516 → 523** (137+153+71+92+70 — the plan's
  per-chunk projection, after the +7 arithmetic correction).
- **The honest mid-run corrections (six):** (1) the BY3 pin's padding first rode an unknown ROW
  field — `sanitizeImportRow` caps EVERY string field (unknowns included, the BR1 guard), so
  the leg 400'd on the row guard instead of the cap; the padding moved to the envelope's
  documented IGNORED user block (the byte-count mechanism at the read is shape-independent, so
  the RED reason is unchanged). (2) The BY8 filter button's accessible name is
  "Filter tasks: Active" (the measured prefix), not "Active" — the error snapshot's page
  arbiter. (3) The BY10 describe sat OUTSIDE the file's beforeEach describe — the page never
  navigated (the 45 s blank-page timeout was a wrong-reason red; the explicit goto added).
  (4) The BY7 swap over-reached `gotoDark`: the appHydrated marker never fires on the
  NON-SHELL /rum route (AU3b's first re-run hung at the gate) — the helper's gate returned to
  the route-universal `.dark` observable (which itself lands only post-hydration because
  setMode PATCHes the record without the client cache, so the boot script paints the stale
  LIGHT theme first — the honest gate for BOTH route classes). (5) The s20 sparkline pin's
  visibility assertion moved to the chart container: the single-value flat line
  (`points="0,16 100,16"`, the seam's documented promotion, confirmed present in the runner's
  trace DOM snapshot) has a zero-HEIGHT element box — painted + user-visible, but Playwright's
  toBeVisible requires a non-empty bounding box. (6) The plan's §3 originally said "+6 = 522"
  while listing 7 pins — the correct projection is +7 = 523; §3 corrected before the cert.
  Plus one environment note: the dev daemon accumulated stale Turbopack state mid-session
  (the panel stuck on Loading — the S9 lesson re-hit); the S32 restart recipe resolved it and
  the live probes were re-run against the fresh daemon.
- **The wire/live verification beyond the pins:** the live curl battery (the gradeLevel set →
  clear "" → me `""` → restore round-trip; the avatar "sneaky" → 400 with the actionable copy;
  the export family — 10 × 200 then the 11th 429 AND rum/export 429 on the same key; the
  12 MiB between-caps envelope → 200 with `imported.tasks.created: 1`, probe deleted, residue
  verified 0) + the live agent-browser battery (BY10's Back-with-drawer-open → closed +
  URL followed; BY1's UI half — "Not set" saved, RELOADED, still "Not set" with me reading
  `""`, then restored; `data-app-hydrated` observed live on the Settings shell).
- **Final re-cert (the §3 checklist):** lint ✓ · tsc ✓ (`noImplicitAny` +
  `noUnusedLocals`/`noUnusedParameters`) · unit **1113/1113** (41 files) · the canonical
  build green · the cold 5-chunk e2e **523/523** (137+153+71+92+70 — every chunk first-pass on
  its final-tree run: chunk 4 and chunk 5 each needed one corrected re-run [the gotoDark gate
  + the sparkline visibility re-anchor], and both re-runs were themselves first-pass) · the
  register tripwire **249/130/0/119** (the exact hold, the expectation stated BEFORE the
  measurement — no new playwright scripts; the scratch diagnostic script was deleted before
  the tripwire so the register stays clean) · `.env.example` current (the diff carries no new
  env reads) · the five `docs/screenshots/124-*.png` evidence frames (non-blank-verified:
  dashboard, mobile drawer, settings grade, rum sparkline, settings appearance).

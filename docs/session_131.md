# Session 131 — Batch CE (Cycle 80): The Audit-Driven Hardening Cycle — The Default-Deadline + Loading-Gate + Transactional-Guard + Write-Budget Set

> Record of worklog **Session-130 / Batch CE**. Workspace: the Batch CD state `5fc5045` + the
> operator's `6ec0d9c` (`docs/session_130.md`, the CD transcript) — the sandbox RECYCLED between
> sessions (the 21st reset: a fresh clone, `.env`/db/chromium re-provisioned, then the baseline
> re-certified cold before any work). Plan + execution record:
> **`docs/remediation-plan-session130.md`**.

## The directive

The operator directed the standing rhythm: refresh the workspace (re-clone after the reset),
re-read the doc chain (`AGENTS.md`, `CLAUDE.md`, `README.md`, `PAD`, `omni-study1_SKILL.md`,
`docs/session_129.md`, `docs/remediation-plan-session129.md`, `worklog.md`, `docs/session_130.md`),
re-validate against the codebase, audit with the repo skills as rubrics (the `skills/` folder
excluded from checking/testing/compilation), iterate on visual + functional parity with
`https://omni-study1.base44.app/` (the mobile navigation menu the named focus, Tailwind v4 the
named suspicion class), keep the repo a production-ready functional SUPERSET, verify the
`.env`/`db/` contract (`DATABASE_URL="file:../db/custom.db"` + `db/` at the repo root) and the
vitest + playwright suites, plan remediation for everything found, execute with TDD (RED →
GREEN), capture evidence, update the docs chain, commit all changes locally, and push to `main`
via the SSH wrapper.

## Baseline (cold, BEFORE any work)

lint ✓ · `tsc --noEmit` ✓ · unit **1202/1202** (45 files) · the canonical build green (REAL_EXIT,
foreground) · the cold 5-chunk e2e **563/563 — 145+178+72+93+75, every chunk first-pass**
(per-chunk via `scripts/run-cert-chunk.sh`) · the register re-derivation **249 importers /
130 Usage-line carriers / 0 stale / 119 usage-line-free** (the 38th consecutive hold, the
expectation stated BEFORE the measurement) · the Mode-C audit of the Batch CD diff (`5fc5045`,
42 files, +1217/−138): **all 8 CD claims re-verified TRUE against the tree** (CD1's import +
class families + the dropped duration-200 [provenance comments only] + the dead dep; CD2's
exported 20 s constant threaded through fetchAndSet; CD3's error-level rule with zero
suppressions; CD4's 413-first subclass mapping; CD5's boot line; CD6's auth set; CD7's
doc-drift fixes; CD8's route census; zero key material — the only AUTH_SECRET mention is the
established empty-dev-posture documentation line).

## Live parity (both hosts)

The standing reference battery held: the unlabeled hamburger (36px at [17,14], no
`aria-haspopup`), no `role=dialog`, the 288px (`w-72`) panel, the true-layer backdrop
`blur(4px) + rgba(0,0,0,0.2)`, exactly 20 links, the landscape nav scroll 992 > 290 (maxScroll
702). **This cycle's new reference-specific probe (the Select animation):** the Tasks filter
Select's dropdown content computes **`animation-name: enter, animation-duration: 0.15s`** — the
CD1 dialog family on a surface never live-measured after the wiring; the clone matched exactly,
and the CD1 dialog parity (overlay AND content, enter/0.15s) re-confirmed holding.

The clone battery on a FRESH reseed (kill-by-port + `rm db/custom.db` + push + seed, the S32
daemon recipe, daemon health 200): the labeled hamburger **"Open navigation menu"** (36×36 at
[16,14]), **`role=dialog` + "Navigation menu"**, **288px**, **20 links**, **blur(4px) + oklab(0
0 0 / 0.2)**, nav auto-close, /Notes clean (**390 = 390**), scroll persistence **600 → 600**,
landscape **992 > 301, scrolls** — **no Tailwind v4 mobile-nav bug, the 35th consecutive live
confirmation at baseline (the 36th at the post-fix re-verification)**.

## The audits (rotated fresh eyes)

- **Audit A — the FE views/components family** (last deep-covered CB, three cycles back): all
  22 views, the 6 layout files, the 21 ui primitives, the client-consumption side of api.ts /
  data.ts / store.ts / view-collections.ts / data-export.ts / data-import.ts / validation.ts.
  **0C/0H/3M/10L/6I.**
- **Audit B — the server/persistence family** (also last covered CB): all 60 API routes,
  entities.ts, http.ts, server/auth.ts, server/ai.ts, db.ts/db-path.ts, schema.prisma in full,
  seed.ts. **0C/0H/3M/5L/6I.**

Every M finding re-verified by direct read (the six: the write-deadline family in three parts,
the non-transactional merge guard, the RumEvent retention/index posture, the write-budget
census gaps); the CE2/CE3/CE4/CE9 shapes (surfaced by the prior session's interrupted audit
pass on the identical tree) re-derived and re-verified by direct read before the plan.

## The CE set (TDD — 12 unit + 4 e2e RED pins, all for the right reasons)

**CE1 (M)** the default deadline family: `DEFAULT_GET_TIMEOUT_MS = 20_000` +
`DEFAULT_WRITE_TIMEOUT_MS = 30_000` installed INSIDE apiGet/apiSend — every mutation call site
(all ~50 in data.ts's mutations plus the view-level twins) inherits the bound at once; an
explicit timeoutMs still wins (the import POST 120 s for the 25 MiB envelope, the multipart
upload signal 120 s, the AI surfaces' 120 s, the auth POSTs' 20 s); the login-surface
`authErrorMessage` helper gains the isTimeoutError branch (the honest "took too long" copy).
**CE2** the True/False default answer: the editor's Select rendered `draft.correctAnswer ||
"True"` — the UI showed "True" while the stored draft kept "" and the submit rejected with
"needs a correct answer"; switching a draft TO true_false now seeds the stored default.
**CE3** the view loading gates: the shell pre-warms only the ACTIVE view's collections;
`loadAll()` runs in the BACKGROUND — navigating mid-window rendered false empty states. Nine
sites across six views (notes ×2, events [one spinner — the terminal zero-state keeps the
measured 7-band shape], exams, assignments, timetable ×2, flashcards ×2) adopt the tasks-view
spinner idiom. **CE4** the rum-panel state machine: a FAILED initial load rendered the error
alert AND the "Loading the field metrics…" line forever — the three-state render (loading /
failed-with-retry-hint / ready) + both GETs bounded + the recent-samples fallback badge's dark
pair. **CE5 (M)** the transactional merge guard: the factory update's
findFirst → beforeWrite → update validated against a PRE-WRITE snapshot — two concurrent
single-leg PATCHes (events `{startDate}` vs `{endDate}`, grades `{score}` vs stored
`{maxScore}`, timetable `{endTime}` vs stored `{startTime}`) could each pass against the old
partner leg and commit an interleaved row no single request would accept; the three guarded
delegates now re-read INSIDE `db.$transaction` (the BZ7 folder-cycle pattern), with a
construction contract that fails loudly when a beforeWrite delegate lacks `txModelName`.
**CE6 (M)** the write-budget census close: `files/folders` POST joins the `upload:` 20/15-min
bucket (previously the only table-writing POST with NO budget); `files/[id]` DELETE +
`ai/messages` DELETE + `calculator/history` DELETE + `settings/preferences` PATCH join the
shared `write:` 600/15-min key; `auth/logout` is the one documented exemption (a cookie clear,
no DB write); the census is machine-enforced by the new script-conventions pin. **CE7** the
import seam: the 64-char id atom (idField's own, at the shared seam), the 28-entry
`IMPORT_FIELD_LENGTHS` registry mirroring validation.ts's atoms (a hand-edited backup can no
longer persist rows the interactive routes would 400), the update branch's single-leg merge
guards against the stored partner leg, and the P2002 concurrent-create race answering a named
409 (thrown OUT of the transaction — a return would have committed the prior rows; mapped in
the route's outer catch). **CE8** the analytics tokenization: the five `#8b5cf6` chart sites →
`rgb(var(--sf-primary))` (the rum-panel sparkline's form); the S9-K pin corrected with the
provenance in-line. **CE9** the sweep set: quill's render-phase ref write → the effect idiom;
the studygroups dialog's stale members base → the BX10 fresh read; the RUM GET/export id
tiebreaks; the http header's 413 line; the retention trims' `take: 1000` + the 15 s
transaction timeouts; `@@index([parentId])` on FileFolder; GRADE_LEVELS single-sourced from
validation.ts; the exam duration clamp 5..600; three dark-hover pairs; the member-email
sr-only Label; the duplicate createdAt line dropped (live-corrected against the reference);
the notebook rename rides the mutation seam; the RumEvent retention trim to the newest 2000
(the persistTranscriptPair form — the CA19 index decision STANDS on the trimmed table, the
deviation documented in AGENTS.md).

## The honest mid-run corrections

(1) The CE2 e2e pin's `input[type="text"]` locator never resolved — the implicit type
attribute does not match a CSS attribute selector; re-scoped to `getByLabel("Test Title")`.
(2) The CE5 census pin's first shape asserted the flashcard-card delegate carries
`$transaction` — over-reach (the card delegate owns no cross-field invariant); relaxed to the
true wiring (txModelName on the three guarded delegates). (3) The s17 "Account created" pin
caught the wrong-sided L9 fix: the plan's first shape dropped the reference-measured
"Account created:" line and kept the clone-only "Member since" — the LIVE reference check (its
Profile tab) settled it: the reference renders exactly "Account created: {date}" and NO
Member-since line; the fix inverted (the Member-since line goes, the email-verified status
rides the email line, the reference's line stays). (4) The import-row-guard's 1 M boundary
legs used tasks.title — the registry now caps it at 200; the legs re-scoped to an unregistered
field. (5) The rum-panel edit shifted the hue-tokens residual register (the alert line 138 →
143) — re-anchored with the provenance, the guard working as designed. (6) The api-timeout
pin's plain `let` narrowed to `never` across the closure — the holder-object +
reader-function shape.

## The re-cert

lint ✓ · tsc ✓ · unit **1217/1217 (45 files — census 1202 → 1217, +15 exact: api-timeout +2
net, data-import +7, script-conventions +3, hue-tokens +2, schema-indexes +1, import-row-guard
net 0)** · the canonical build green (REAL_EXIT; the schema push for the parentId index
applied first) · the cold 5-chunk e2e **567/567 — 146+179+72+93+77, every chunk first-pass on
the final tree** (chunk 4's first run caught correction (3) — the s17 pin; the fix + rebuild +
re-run green) · the register tripwire **249/130/0/119 — the exact hold (the 39th
consecutive)**. The live battery on the fresh-seeded daemon ALL GREEN — **the 36th consecutive
no-Tailwind-v4-bug confirmation** — plus the CE2 default verified LIVE end-to-end (the save
succeeds without touching the correct-answer select; the card renders) and the Select
animation parity re-confirmed. Three evidence frames in `docs/screenshots/130-clone-*.png`
(the mobile drawer; the True/False default; the desktop dashboard), all verified non-blank.

## Final state

lint ✓ · tsc ✓ · unit **1217/1217 (45 files)** · build green (REAL_EXIT) · e2e **567/567**
(146+179+72+93+77) · tripwire **249/130/0/119** · **1784 green total**. Docs chain updated:
README (the chunk map + the badge 1784 + the S130 row), AGENTS.md (the census anchors + the
CE6 write-budget census line + the RUM retention note), PAD **v1.3.38** (the revision block +
the §8.1 rows + the Total 76/1785), the SKILL doc (the four census anchors), the vitest header
(45/1217 + the S130 re-anchor block), the cert-script re-tags (the S130/CE block + Expected
567), the plan's §5, the worklog Session-130 entry, and this record. Committed to `main` and
pushed via the SSH wrapper (the remote ref verified equal to the local HEAD).

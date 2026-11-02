# Session 129 — Batch CC (Cycle 78): The Audit-Driven Hardening Cycle — the Whitelist + Cert-Truth + Composite-Index Set

> Record of worklog **Session-128 / Batch CC**. Workspace: the Batch CB state `7a61e61` + the
> operator's `5a415d5` (`docs/session_126.md`, the CB transcript) — the workspace survived the
> session break (`.env`, `db/`, chromium-1243, and agent-browser all intact; the push
> infrastructure was rebuilt before the push). Plan + execution record:
> **`docs/remediation-plan-session128.md`**.

## The directive

The operator directed the standing rhythm: refresh the workspace, re-read the doc chain
(`AGENTS.md`, `CLAUDE.md`, `README.md`, `PAD`, `omni-study1_SKILL.md`, `docs/session_125.md`,
`docs/remediation-plan-session127.md`, `worklog.md`, `docs/session_126.md`), re-validate against
the codebase, audit with the repo skills as rubrics (the `skills/` folder excluded from
checking/testing/compilation), iterate on visual + functional parity with
`https://omni-study1.base44.app/` (the mobile navigation menu the named focus, Tailwind v4 the
named suspicion class), keep the repo a production-ready functional SUPERSET, verify the
`.env`/`db/` contract (`DATABASE_URL="file:../db/custom.db"` + `db/` at the repo root) and the
vitest + playwright suites, plan remediation for everything found, execute with TDD (RED →
GREEN), capture evidence, update the docs chain, and commit + push to `main` via the SSH
wrapper.

## Baseline (cold, BEFORE any work)

lint ✓ · `tsc --noEmit` ✓ · unit **1171/1171** (42 files) · the canonical build green (REAL_EXIT
— after the re-learned foreground lesson: a `&`-detached build dies with the tool session
leaving an empty log; re-run in the foreground) · the cold 5-chunk e2e **559/559 —
144+177+72+93+73, every chunk first-pass** · the register re-derivation **249 importers / 130
Usage-line carriers / 0 stale / 119 usage-line-free** (the 33rd consecutive hold, the
expectation stated BEFORE the measurement) · the Mode-C audit of the Batch CB diff (`7a61e61`,
53 files, +2347/−192): **all 22 CB claims re-verified TRUE against the tree** (CB1's `remaining`
dep, CB2's shared date atoms, CB3's `nullableId`, CB4's `weightedPercent`, CB5's `CATEGORY_DOTS`
+ dotless events, CB6's 14-row `HOURS` + band, CB7's PATCH/DELETE budget, CB8's separated
failure domains ×3, CB9's `ASSIGNMENT_TYPES`, CB10's take:500 windows, CB11's domain caps,
CB12's `loginAcct:` uniform-401, CB13's true mean, CB14's boot WARN, CB15–CB21 spot-verified).

## Live parity (both hosts)

The standing reference battery held: the unlabeled hamburger (36px at [17,14], no
`aria-haspopup`), no `role=dialog`, the 288px (`w-72`) panel, the true-layer backdrop
`blur(4px)`, exactly 20 links, the landscape nav scroll 992 > 290 (maxScroll 702). No new
reference-specific probes this cycle: both audits found exclusively internal-seam findings
(nothing with a reference-measurable visual or functional counterpart).

The clone battery on a FRESH reseed: the labeled hamburger **"Open navigation menu"** (36×36 at
[16,14]), **`role=dialog` + "Navigation menu"**, **288px**, **20 links**, the true-layer
backdrop **blur(4px) + oklab(0 0 0 / 0.2)**, nav auto-close, /Notes clean (**390 = 390**),
scroll persistence **600 → 600** (the drawer open/close cycle), landscape **992 > 301,
scrolls** — **no Tailwind v4 mobile-nav bug, the 31st consecutive live confirmation at
baseline** (the 32nd at the post-fix re-verification).

## The audits (rotated fresh eyes)

- **Audit A — the client state/transport/lib layer + UI primitives** (last deep-covered BZ,
  four cycles ago; CB just mutated data.ts/date.ts/calculator.ts/validation.ts): **0C/0H/1M/7L/
  6I.** The M: the CB19 `importProfilePatch` copied every `preferencesSchema` key into the
  `tx.user.update` patch — and the schema carries a `displayName` leg the User model has no
  column for.
- **Audit B — the test layer itself + the schema/seed** (the e2e layer last audited as a
  codebase BW, five cycles ago): **0C/0H/4M/5L/5I** — including the independent census
  derivation (144/177/72/93/73 = 559 ✅, every CB delta located) and the full per-chunk
  budget-math enumeration (registers ≤9/10, TEST-NET collisions none, demo writes ≪ 600).

Every M finding re-verified by direct read; the CC10 composite-index win **measured, not
assumed** (34.6 ms → 0.27 ms median per list GET at 100k rows).

## The CC set (TDD — 13 unit RED + 1 e2e RED, all for the right reasons)

**CC1 (M)** the import profile-patch **whitelist**: only the seven preference keys ride
(`themeMode, accentColor, avatarEmoji, notificationsEnabled, schoolName, gradeLevel,
studyGoalHours`) — `displayName` is name-shaped identity and never rides; pre-fix, a hand-edited
envelope carrying it rolled back the ENTIRE restore behind a misleading 400
(`PrismaClientValidationError` inside the all-or-nothing transaction). RED demonstrated at the
route boundary (`Expected: 200, Received: 400`) and live on the daemon (export → splice →
import → **200**, `themeMode` applied, the name never rode). **CC2 (M)** the cert-runner truth
pair: the chunked-cert header re-tagged (538 → the true census) AND machine-enforced by a new
script-conventions pin; the script's always-exit-0 fixed with rc accumulation + `exit "$rc"`
(the mechanism verified with a toy failing pipeline). **CC3 (M)** the CB5 dots pins' data-settle
wait (the `evaluateAll`-before-store-lands race, closed with `first().toBeVisible()`). **CC4
(M)** the CB1/CB2/CB16/BX6 pins' try/finally cleanup (the AR3 convention restored — a red
assertion no longer leaks rows into the chunk-shared db). **CC5** the `taskToggleChains`
eviction on settle. **CC6** the `fromDueDateInput` NaN guard (the live `RangeError` in RED).
**CC7** the `apiGet` timeoutMs mirror + the 20 s boot-gate deadline. **CC8** the toaster's
module-counter ids + the timer outside `set` + the 5-toast cap. **CC9** the dead-code removals
(`addRow`/`updateRow`/`removeRow` + `RowOf` + `minutesToHHMM`). **CC10** the factory-list
**composite indexes** — REPLACE `@@index([userId])` → `@@index([userId, createdAt, id])` on the
19 factory-listed models (measured 128× at import-flood scale; same index count per table;
`PasswordResetToken` keeps the bare index; schema-census-pinned; the swap verified in
`sqlite_master`). **CC11** the loading flag's per-key in-flight counts. **CC12** the
seed/global-setup doc set. **CC13** the `-2^2 = 4` Excel-family precedence locked by pin.

## The honest mid-run corrections

(1) The CC1 e2e pin's first design reused the demo session's fixed row ids — the id is the
GLOBAL primary key, so the fresh user's import P2002'd a 409 before the profile patch (RED for
the wrong reason); the BT1b/S117 unique-id convention applied. (2) The export evidence frame
first captured a 404 — the standalone route is lowercase `/export`. (3) The CC8 pin's
discriminating leg is MONOTONICITY (set-distinctness passes 999/1000 under the old random
minting). (4) The unit delta initially mis-summed as +19 (the removed "2 legs" were ONE `it()`
with two asserts); the stash-and-rerun comparison pinned date at net 0 and the census at +20
exact. (5) The re-learned foreground-build lesson. (6) The `require()` lint class hoisted to
ESM imports.

## The re-cert

The cold 5-chunk e2e **560/560 — 144+177+72+93+74, every chunk first-pass on the final tree**
(census 559 → 560, +1: the CC1 route pin). The register tripwire **249/130/0/119 — the exact
hold (the 34th consecutive)**. The live battery ALL GREEN on the fresh-seeded daemon — **the
32nd consecutive no-Tailwind-v4-bug confirmation** — plus the CC1 round-trip demoed live. Three
evidence frames in `docs/screenshots/128-clone-*.png` (the mobile drawer; the applied-dark-theme
dashboard — the round-trip's visible consequence; the export/restore panel), all verified
non-blank.

## Final state

lint ✓ · tsc ✓ · unit **1191/1191 (44 files)** · build green (REAL_EXIT) · e2e **560/560**
(144+177+72+93+74) · tripwire **249/130/0/119** · **1751 green total**. Docs chain updated:
README, AGENTS.md, CLAUDE.md, PAD **v1.3.36** (the revision block + §8.1 + §8.4), the SKILL
doc, vitest.config.ts, the cert-script re-tags, the plan's §5, the worklog Session-128 entry,
and this record. Committed to `main` and pushed via the SSH wrapper (the remote ref verified
equal to the local HEAD).

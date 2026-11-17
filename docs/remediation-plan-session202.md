# The S202 remediation plan — the audit-driven dependency-security hardening (Batch EZ: the standing audit rotation's dep-audit stage found a runtime-reachable advisory; the version-floor fix + the security-floor tripwire + the full-gate re-certification on the upgraded framework)

The axis: the S201 close's named S202 candidates, in order — a reference
behavior-change axis (NOT found: the fresh 20-view census is the TWELFTH
consecutive clean window, the identical 95 standing non-gaps, REAL GAPS
NONE) · the AI audit-rider message-bubble anatomy (still unmeasurable —
the reference account remains zero-data) · the next size-debt adjudication
(the remaining pure families all STAY per the boundary doctrine) · **the
standing audit rotation (the recent-changes axis + a fresh family audit)
— TAKEN**. The recent-changes axis (the EW/EX/EY e2e-consolidation
batches) audited GREEN (the chunk map byte-identical in both cert
scripts, the census 740 tests in 49 files re-derived by `--list`, the ten
new spec homes' founding headers + the tripwire ledger chain through
S201/EY). The fresh family scan — the standing suite's dependency-security
stage (`bun scripts/dep-audit.mjs`, the S30 seam) — returned **FAIL: 1
runtime-reachable advisory**: `next` 16.4.2 (GHSA-mfr8-8qww-v76h,
moderate) ships in the standalone runtime trace. This cycle executes the
audit-driven hardening (the S117–S139 lineage): the version floors fixed
through the package manager, the floors pinned by a new unit tripwire
(the honest RED → GREEN), and the full gate re-certified on the upgraded
framework — the e2e cert map as the behavioral regression net.

## §0 The context and the baseline

- The workspace: the S201 close `f3cb111` + the operator's session_275
  transcript commit `040d3f5` on `main`, pulled fresh (a COLD clone — the
  environment re-derived per the standing recipe: bun install 510 pkgs,
  `.env` from `.env.example` at `DATABASE_URL="file:../db/custom.db"`
  with `db/` at the repo root [the parent-workspace `.env` shadow
  re-verified live — the S192 lesson-1 posture], db:push + db:seed, the
  pinned chromium v1243 + headless-shell re-provisioned, the dev daemon
  :3000 + the standalone :3200 launched via the reaper-proof launchers;
  both `/api/health` green at the open; the bundled
  `.next/standalone/.env` verified `AUTH_SECRET=""`).
- The cold baseline reproduced the S201 close EXACTLY: lint ✓ · tsc ✓ ·
  unit **1799/1799 (55 files)** ✓.
- The standing chrome at the open: the drawer check GREEN (**the 163rd
  consecutive** — no Tailwind v4 mobile-nav bug; the mobile navigation
  menu verified working: backdrop `oklab(0 0 0 / 0.2)` + blur(4px),
  288px white panel, 20 links, no footer, Escape + navigate auto-close)
  · the desktop parity probe **MATCH** (all five structural checks, both
  hosts — the reference account probed read-only via the REF_PROBE_* env
  posture; the two raw diffs are the documented standing non-gaps) · the
  reference account persists in DARK mode (`REF-DARK` via agent-browser,
  re-confirmed live this cycle).
- **The agent-browser interactive sweep** (both hosts, sessions
  `s202-clone` + `s202-ref`): the clone login → dashboard render (the
  sidebar's 20 links, the greeting, the 4 stat cards, the section cards)
  · the mobile journey at 390×844 (the labeled hamburger → the drawer's
  20 links in the 288px panel → the Tasks link navigates to `/Tasks` and
  the drawer AUTO-CLOSES, verified by DOM probe; Escape-close also
  re-verified) · the Create Task dialog anatomy + a full UI CRUD
  round-trip (create → the row renders → the row menu delete →
  `ZERO-RESIDUE` by DOM text probe AND by a direct db count) · the
  reference login + a read-only navigation sweep (Tasks/Calendar/Events/
  Notes/Analytics all render; the reference console carries only the
  documented Tailwind-CDN warning — a reference-side artifact) · the
  reference mobile drawer (288px panel, 20 links — the clone's exact
  match) — **zero findings on both hosts**; the four comparison frames
  captured (`202-abrowser-ref-mobile-drawer.png` +
  `202-abrowser-ref-dashboard.png` + `202-abrowser-clone-mobile-drawer.png`
  + `202-abrowser-clone-dashboard.png`, all pixel-verified non-blank).
- The environment contract re-verified against the operator's standing
  instructions: `.env` at `DATABASE_URL="file:../db/custom.db"` with `db/`
  at the repo root (the seeded `db/custom.db` present) · the vitest +
  playwright configs present and green (1799 unit + 744 e2e) ·
  `.env.example` matching the env surface (no env changes this cycle).

## §1 The audit findings ledger (the fresh family scan — the dep-audit stage, measured this cycle)

`bun audit` (bun 1.3.14) reports **5 advisories**; the S30 seam
(`src/lib/dep-audit.ts`, unit-pinned by `tests/dep-audit.test.ts`)
classifies every one by runtime reachability against the production
standalone trace (`.next/standalone/node_modules` — the ground truth for
"does this ship"):

1. **`next` 16.4.2 — GHSA-mfr8-8qww-v76h (moderate): information
   disclosure across root params when a `'use cache'` function is called
   through `unstable_cache()`; vulnerable `>=16.3.0 <=16.4.4`, fixed
   16.4.5.** Classified **runtime-REACHABLE — FAIL** (next IS in the
   standalone trace; the module is the framework). Reachability
   adjudication: the app NEVER calls `unstable_cache`/`'use cache'`
   (grep over src/: zero hits) — the vulnerable path is unreachable by
   construction TODAY, but the advisory's surface SHIPS and the standing
   suite's dep-audit gate FAILs loudly (the S27 doctrine: a probe must
   never normalize a genuine finding away). The documented remediation is
   the version floor (16.4.5+), NOT an override. **THE CYCLE'S FINDING.**
2. **`zod` 4.6.5 — GHSA-mrhx-c7xc-m3w5 (high): Zod can exhaust memory
   while validating oversized constrained collections; fixed 4.6.6.** A
   DIRECT production dependency (every API boundary's Zod parse), but
   bundled into the server route chunks — NOT in
   `.next/standalone/node_modules` (webpack internalizes it), so the
   trace-based classifier reads it only through bun's displayed path
   (rooted in eslint-config-next — dev). The bounded readers (the SKILL
   §6 idiom: every route parses through the shared bounded reader before
   Zod) mitigate the oversized-collection vector, but the FLOOR is the
   fix: 4.6.6+ (the latest 4.6.x is 4.6.7). **THE CYCLE'S SECOND FINDING.**
3. **`quill` 2.0.3 — GHSA-v3m3-f69x-jf25 (low): XSS via the HTML export
   feature.** NO fixed release exists (npm latest = 2.0.3, the only 2.x
   release line). **Mitigated by design (the compensating-control
   record)**: the app reads `quill.root.innerHTML` only as editor state —
   every persistence door passes the server-side allowlist sanitizer
   (S140/CO1: the note delegate's writeTransform on every POST/PATCH
   /api/notes + the import route's pre-transaction pass), and the browser
   render gate covers pre-fix legacy rows; the allowlist strips everything
   the 20-control toolbar can never author. Client-bundled (not in the
   server trace) — documented non-production by the envelope, and
   accepted-mitigated by the sanitizer. NO code change.
4. **`minimatch` (moderate) — dev surface** (the eslint chain: eslint ›
   @eslint/eslintrc + typescript-eslint). Not in the trace; dev-time
   tooling only. Documented NON-PRODUCTION. NO change.
5. **`deepmerge-ts` (high) — cli surface** (prisma › @prisma/config).
   Prod-declared tooling the runtime never imports; not in the trace.
   Documented NON-PRODUCTION. NO change (the fix must come through a
   prisma upgrade that widens its own range — out of scope this cycle).

**The upgrade decision ledger**: `next` ^16.4.2 → ^16.4.6 (the floor +
the latest 16.4.x) and `zod` ^4.6.5 → ^4.6.7 (the floor + the latest
4.6.x), both through `bun add` (the package manager owns package.json —
never hand-edited). `eslint-config-next` STAYS at ^16.4.2: not named by
any advisory, dev-time-only (it lints source, not the framework runtime),
and the surgical principle (only what the failing gate requires) — the
version-drift is cosmetic, recorded here deliberately. react/react-dom,
@playwright/test, prisma: no advisories, no changes.

## §2 The axis (why the security-floor hardening, why now)

- The standing audit rotation is the S201 close's natural S202 axis once
  the census window is clean (the reference UNCHANGED, the twelfth
  consecutive window) and the consolidation program is complete (every
  homeless pure view family and every homeless pure cross-view chrome
  family homed through S201/EY). The audit found a real, actionable,
  security-relevant finding — the audit-driven hardening cycle lineage
  (the S117–S139 shape): fix at the source, pin the fix, re-certify.
- **Why the floor tripwire (not just the bump)**: a bare `bun add` closes
  today's finding but guards nothing — a future `bun update` pin or a
  fresh re-resolution could silently land below the floor again. The
  security-floor seam makes the floor a UNIT gate: every resolved
  occurrence of the floored packages in `bun.lock` must satisfy its floor
  or `bun run test` fails. The dep-audit envelope (the runtime trace)
  stays the shipped-surface probe; the floor pin is the lockfile gate —
  the two layers close the trace-classifier's documented blind spot for
  bundled deps (zod) and make the downgrade class impossible to ship.
- **Why the full cert map re-run**: `next` is the framework — a 16.4.2 →
  16.4.6 bump touches the compiler, the runtime, the standalone output,
  and the hydration path. The 744-pin e2e cert map (the 5-chunk cold
  map, every chunk first-roll) + the closing chrome (the drawer check +
  the parity probe + a fresh census re-probe on the re-booted :3200) is
  the behavioral regression net — the Mode-D characterization discipline
  applied to a dependency upgrade: the pre-change baseline (already
  measured this cycle, cold) must reproduce identically post-change.

## §3 The TDD contract (the honest RED → GREEN shape)

1. **RED first**: write the pure seam `src/lib/security-floor.ts` (the
   floor constants + the lockfile parser + the comparator) and
   `tests/security-floor.test.ts` (11 pins). The two REAL-lock pins —
   "every resolved `next` in bun.lock >= 16.4.5" and "every resolved
   `zod` in bun.lock >= 4.6.6" — FAIL against the current tree
   (next@16.4.2, zod@4.6.5): the honest RED, run and observed before any
   dependency change.
2. **GREEN**: `bun add next@^16.4.6 zod@^4.6.7` (the manifest floors rise
   through the package manager; bun.lock re-resolves). The RED pins turn
   GREEN; the pure-function pins (the parser + the comparator contract)
   were green from their fixtures and stay green.
3. **The re-verification chain**: `bun run lint` + `bun run typecheck` +
   `bun run test` (expect **1810/1810 in 56 files** — 1799 + the 11 new
   pins) · **rebuild** (the dep-audit's self-verifying precondition: the
   standalone trace must be NEWER than bun.lock — the S27 doctrine) ·
   `bun scripts/dep-audit.mjs` re-run (expect: **zero runtime-reachable**
   — the next advisory clears at 16.4.6 > 16.4.4; the zod path clears at
   4.6.7; quill + minimatch + deepmerge-ts remain the documented
   NON-PRODUCTION family) · `bun run build` (the bundled
   `.next/standalone/.env` re-verified `AUTH_SECRET=""`) · **the 5-chunk
   cold cert map** via `scripts/run-cert-chunk.sh 1..5` (expect
   **744/744 — 160+275+116+101+92, every chunk first-roll**) · the
   closing chrome (re-boot :3200 — kill by port FIRST, the S191 lesson —
   the drawer check expect the **164th** consecutive GREEN + the desktop
   parity probe expect MATCH + a fresh census re-probe on the upgraded
   standalone).

## §4 The change spec (the exact files, the exact boundaries)

- **`src/lib/security-floor.ts`** (NEW, ~80 lines): the S202 seam.
  `SECURITY_FLOORS: Record<string, string>` = `{ next: "16.4.5", zod:
  "4.6.6" }` (each with its GHSA id in the comment — the single source
  the tests import). `parseResolvedVersions(lockText, pkg): string[]` —
  regex-extracts EVERY resolved occurrence of the package from bun.lock's
  array-entry shape (`"pkg": ["pkg@X.Y.Z", …]`; the exact-key anchor
  kills the prefix trap — `next` cannot match `eslint-config-next`; the
  array anchor kills the workspaces manifest-range lines — those are
  string entries, not arrays). `parseSemverTriple(v): [number, number,
  number] | null` — plain X.Y.Z triples only; any prerelease/build
  suffix or non-numeric segment → null. `satisfiesFloor(resolved, floor):
  boolean` — both sides parsed; null anywhere → FALSE (fail closed: a
  resolution the comparator cannot prove is a floor violation).
- **`tests/security-floor.test.ts`** (NEW, 11 pins):
  1. parses a plain package's resolved version from a lock fragment;
  2. parses a scoped package's resolved version (`@prisma/client`);
  3. returns `[]` for an absent package;
  4. never matches a longer key ending in the probe name
     (next ≠ eslint-config-next — the prefix trap);
  5. never matches the workspaces manifest-range lines (`"next":
     "^16.4.2"` — a string entry, not an array);
  6. satisfiesFloor above the floor → true;
  7. satisfiesFloor at the floor → true (the floor itself satisfies);
  8. satisfiesFloor below the floor → false;
  9. satisfiesFloor on null/unparseable → false (fail closed — the
     honest RED shape for a missing resolution);
  10. **the REAL pin**: every resolved `next` in the repo's bun.lock
      >= 16.4.5 (GHSA-mfr8-8qww-v76h) — RED pre-upgrade, GREEN post;
  11. **the REAL pin**: every resolved `zod` in the repo's bun.lock
      >= 4.6.6 (GHSA-mrhx-c7xc-m3w5) — RED pre-upgrade, GREEN post.
  The real pins read `bun.lock` via `readFileSync` relative to the test
  file (the script-conventions precedent for repo-file reads in tests).
- **`package.json` + `bun.lock`** (via `bun add next@^16.4.6 zod@^4.6.7`
  ONLY — never hand-edited): the two manifest floors rise; the resolved
  versions bump (next 16.4.2 → 16.4.6 with its transitives — @next/env
  etc. — zod 4.6.5 → 4.6.7). NOTHING else changes (eslint-config-next,
  react, prisma, playwright all stay pinned — the surgical principle).
- **NO e2e spec changes; NO cert-script changes** (the e2e census
  UNCHANGED at 744; the spec-file census UNCHANGED at 48; the tripwire
  Expected line UNTOUCHED — the map holds). The cert map re-run is
  verification, not change.
- **The unit census moves 1799 → 1810 (55 → 56 files)**; the badge
  **2543 → 2554**; the e2e census + the spec-file census UNCHANGED.

## §5 The execution ToDo list (the detailed, sequential, verifiable steps)

1. **RED**: write the seam + the test file; run
   `bunx vitest run tests/security-floor.test.ts` — expect pins 1–9
   GREEN, pins 10–11 **RED** (the observed honest RED against
   next@16.4.2 / zod@4.6.5). FAIL shape other than 10–11 → fix the CHECK
   DESIGN before any dependency change.
2. **GREEN**: `bun add next@^16.4.6 zod@^4.6.7`; re-run the test file —
   expect **11/11 GREEN**. Verify package.json's floors + bun.lock's
   resolutions by grep (next@16.4.6, zod@4.6.7, no other direct-dep
   changes).
3. **The early gates**: `bun run lint` + `bun run typecheck` + `bun run
   test` — expect **1810/1810 in 56 files**.
4. **The rebuild**: kill the :3200 daemon BY PORT (the S191 lesson —
   never rebuild over a live standalone), `bun run build`, re-verify the
   bundled `.next/standalone/.env` carries `AUTH_SECRET=""`.
5. **The dep-audit re-run**: `bun scripts/dep-audit.mjs` — expect
   **GREEN verdict (zero runtime-reachable)** with the remaining family
   documented NON-PRODUCTION (quill client-bundled + mitigated,
   minimatch dev, deepmerge-ts cli).
6. **The 5-chunk cold cert map**: `scripts/run-cert-chunk.sh 1..5` —
   expect **744/744 (160+275+116+101+92), every chunk first-roll** (the
   framework-upgrade regression net).
7. **The closing chrome**: re-boot :3200 via the launcher (the
   STANDALONE_AUTH_SECRET shell posture), `/api/health` green, the
   drawer check (expect the **164th** consecutive GREEN) + the desktop
   parity probe (expect MATCH) + a fresh 20-view census re-probe on the
   upgraded standalone (expect the identical adjudicated set — the
   reference UNCHANGED).
8. **The evidence frames** (§7): the re-booted standalone frame + the
   dev-server frames on the upgraded tree.
9. **The census re-derivation** (by `--list`, never estimated): the e2e
   UNCHANGED 740 tests in 49 files; the unit 1810 in 56 files (the
   vitest run's own count).
10. **The doc-chain lockstep** (§8 — every site, same commit).
11. **The worklog Session-213 entry + the plan §9 close + the session
    transcript `docs/session_276.md`.**
12. **The pre-commit checks**: the `.env.example` verification (no env
    changes — byte-identical contract re-verified), the secret scan over
    the staged diff, the staging review, commit (Conventional Commits,
    `main` only), push via the SSH wrapper (dry-run → push → remote
    verified → key shredded).

## §6 The gates (the definition of done)

- lint ✓ · tsc ✓ · unit **1810/1810 (56 files)** · build ✓ (the :3200
  daemon killed by port FIRST; the bundled env re-verified) · the
  dep-audit re-run **GREEN (zero runtime-reachable)** · the 5-chunk cold
  cert map **744/744 (160+275+116+101+92, every chunk first-roll)** ·
  the closing chrome (the drawer check **164th** GREEN + the parity
  probe MATCH + the census re-probe the identical adjudicated set) · the
  evidence frames ok:true · the census re-derived by `--list` (e2e
  UNCHANGED) + the vitest run count (unit 1810/56) · the doc-chain
  lockstep complete (§8) · zero residue on both hosts.

## §7 The evidence (the self-verifying frames + the dev-server set)

Under `docs/screenshots/` (this cycle's families — the upgraded-build
rendering + the standing operator frames):

1. **`202-upgraded-standalone.png`** — the re-booted :3200 standalone on
   the UPGRADED framework (the upgraded-build dashboard; the standing
   structural contracts DOM-asserted before the shot: the 20 sidebar
   links, the greeting, the stat-card grid).
2. **`202-devserver-dashboard.png`** — the dev server :3000 dashboard at
   1440×900 on the upgraded tree.
3. **`202-devserver-mobile-drawer.png`** — the dev server :3000 mobile
   drawer at 390×844 (the operator's standing mobile-nav watch).
4. The four agent-browser comparison frames (captured at the open, §0):
   `202-abrowser-ref-mobile-drawer.png` +
   `202-abrowser-ref-dashboard.png` + `202-abrowser-clone-mobile-drawer.png`
   + `202-abrowser-clone-dashboard.png`.

Every frame is DOM-asserted BEFORE the shot and pixel-verified non-blank
after (the standing evidence discipline), captured by
`scripts/capture-s202-evidence.mjs` (committed — the standing
capture-lineage convention, the S198/S199/S201 precedent).

## §8 The doc-chain lockstep (every site, same commit)

- **AGENTS.md**: the `bun run test` census row (1799 → 1810 tests, 55 →
  56 files) + the **S202 lessons block** (appended at the end of the
  lessons chain).
- **CLAUDE.md**: the Unit line's census (1799 → 1810).
- **README.md**: the tree diagram's unit count (1799 → 1810, 55 → 56
  files) + the `bun run test` line + the **badge (2543 → 2554)** + the
  **Session-202 row** (after the gates — every number real).
- **Project_Architecture_Document.md**: the **v1.3.110 revision block**
  (the census anchor + the cycle record) + the §11 known-issues ledger
  entry (the dep-audit finding → closed by the floor).
- **omni-study1_SKILL.md**: the census sites (§2 header + the §11
  green-state re-anchor: 1810 unit + 744 e2e = 2554).
- **vitest.config.ts**: the header re-anchor (line-4 census 55/1799 →
  56/1810 + the S202/EZ re-tag block).
- **tests/script-conventions.test.ts**: the S202/EZ entry in the
  chronological ledger comment chain (the e2e census UNCHANGED at 744 —
  the Expected line UNTOUCHED; the unit census 1799 → 1810).
- **worklog.md**: the Session-213 entry.
- **docs/session_276.md**: the formal session transcript.
- **docs/remediation-plan-session202.md**: this plan (§9 closed at the
  cycle close).
- **`.env.example`**: re-verified, NO changes (no env changes this
  cycle).

## §9 The close and the next candidates (filled at the cycle close)

- **The execution outcome**: every step green — the honest RED observed
  first (**2 failed | 9 passed**: the two REAL floor pins against
  next@16.4.2/zod@4.6.5; the 9 pure-function pins green from their
  fixtures) → `bun add next@^16.4.6 zod@^4.6.7` → **11/11 GREEN** → the
  early gates (lint ✓ · tsc ✓ · unit **1810/1810 in 56 files**) → the
  rebuild (the :3200 daemon killed by port FIRST; the bundled
  `.next/standalone/.env` re-verified `AUTH_SECRET=""`) → the dep-audit
  re-run **GREEN — zero runtime-reachable** (4 advisories documented
  non-production: minimatch dev, quill client-bundled + mitigated,
  deepmerge-ts cli, zod's remaining dev-chain path) → the full 5-chunk
  cold cert map **744/744 (160+275+116+101+92, every chunk first-roll)**
  on the upgraded framework → the closing chrome with BOTH daemons
  restarted post-upgrade (the drawer check **164th** GREEN + the parity
  probe MATCH + the fresh census re-probe on the upgraded :3200: 112 =
  17 + 95, the identical adjudicated set — zero behavioral drift) → the
  census re-derived (e2e UNCHANGED 740 in 49 files by `--list`; unit
  1810/56 by the run) → the seven evidence frames ok:true.
- **The deviation record**: ONE design refinement observed during
  execution — bun's distinguished dev-chain resolution
  `eslint-plugin-react-hooks/zod@4.6.5` stays (bun's isolated install;
  `bun update` of the parent does not move it): the pin's exact-key
  anchor scopes the floor to the ROOT resolution BY DESIGN (the shipped
  / bundled resolution; the lint tooling's internal zod is dev-surface,
  documented NON-PRODUCTION by the envelope) — the plan §4's "every
  occurrence" language is thereby refined to "every occurrence under
  the package's own key", the scope decision recorded in the seam's
  comment block (the S202 lesson-2). ONE plan correction: §7's "no
  capture script committed" was corrected to the standing committed
  convention BEFORE the commit (the S198/S199/S201 precedent). The
  upgrade itself landed first-roll: zero re-runs, zero e2e failures
  anywhere in the cert map.
- **The next-cycle candidates (S203)**: a reference behavior-change
  axis if the next census finds one; the AI audit-rider candidates (the
  message-bubble anatomy when a populated reference account becomes
  measurable); the standing audit rotation's remaining stages — the
  24-stage standing suite (`scripts/standing-suite.mjs`) has not run
  end-to-end in the recent-cycle record, and the dep-audit stage's
  finding this cycle proved the rotation's value (a full
  standing-suite cycle is the natural next audit-rotation axis); or the
  next size-debt adjudication (the remaining pure families thin and
  STAY per the boundary doctrine).

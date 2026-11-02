# Session 133 — Batch CF (Cycle 81): The Audit-Driven Hardening Cycle — The Per-Email-Budget + Shared-Bucket-Warning + OTP-Digest + Always-Cold Set

> Record of worklog **Session-131 / Batch CF**. Workspace: the Batch CE state `7288769` + the
> operator's `14510d3` (`docs/session_132.md`, the CE transcript) — the sandbox SURVIVED this
> time (the 22nd continuation: no recycle, `git pull` fast-forward, the environment re-verified
> rather than rebuilt). Plan + execution record:
> **`docs/remediation-plan-session131.md`**.

## The directive

The operator directed the standing rhythm: refresh the workspace, re-read the doc chain
(`AGENTS.md`, `CLAUDE.md`, `README.md`, `PAD`, `omni-study1_SKILL.md`, `docs/session_131.md`,
`docs/remediation-plan-session130.md`, `worklog.md`, `docs/session_132.md`), re-validate
against the codebase, audit with the repo skills as rubrics (the `skills/` folder excluded
from checking/testing/compilation), iterate on visual + functional parity with
`https://omni-study1.base44.app/` (the mobile navigation menu the named focus, Tailwind v4 the
named suspicion class), keep the repo a production-ready functional SUPERSET, keep the
`.env`/`db/` contract and the vitest + playwright suites, plan remediation for everything
found, execute with TDD (RED → GREEN), capture evidence, update the docs chain, commit all
changes locally, and push to `main` via the SSH wrapper.

## Baseline (cold, BEFORE any work)

lint ✓ · `tsc --noEmit` ✓ · unit **1217/1217** (45 files) · the canonical build green
(REAL_EXIT, foreground) · the cold 5-chunk e2e **567/567 — 146+179+72+93+75's successor map
146+179+72+93+77, every chunk first-pass** (per-chunk via `scripts/run-cert-chunk.sh`) · the
register re-derivation **249 importers / 130 Usage-line carriers / 0 stale / 119
usage-line-free** (the 40th consecutive hold, the expectation stated BEFORE the measurement)
· the Mode-C audit of the Batch CE diff (`7288769`, 57 files, +1627/−149): **all 9 CE claims
re-verified TRUE against the tree** (the CE1 constants + overrides, CE2's seeding, CE3's 12
gate markers, CE4's three-state render, CE5's txModelName contract, CE6's five budgets +
exemption, CE7's atom/registry/409, CE8's tokenization [the remaining `#8b5cf6` sites are
picker palettes/validation defaults/the pinned token — data, not chart styling], CE9's sweep
set; zero key material).

## Live parity (both hosts)

The standing reference battery held: the unlabeled hamburger (36px at [17,14]), no
`role=dialog`, the 288px (`w-72`) panel, the true-layer backdrop `blur(4px) +
rgba(0,0,0,0.2)`, exactly 20 links, the landscape nav scroll 992 > 290. **This cycle's new
probe (the drawer animation family):** the reference's mobile drawer computes
**`animation: none`, `transition: 0s`, no `data-state`, on BOTH enter and exit** — a plain
conditional mount/unmount, a surface never live-measured before; the clone matches BY
CONSTRUCTION (mobile-chrome's `{mobileMenuOpen && …}` plain mount, the S118/Q1 comment) and
by live sample — **the probe closes clean, and the exit-animation Tailwind v4 suspicion class
is retired for the drawer surface** (the CD1 animated family correctly never touched it).

The clone battery on a FRESH reseed (kill-by-port + `rm db/custom.db` + push + seed, the S32
daemon recipe): the labeled hamburger **"Open navigation menu"** (36×36 at [16,14]),
**`role=dialog` + "Navigation menu"**, **288px**, **20 links**, **blur(4px) + oklab(0 0 0 /
0.2)**, nav auto-close, /Notes clean (**390 = 390**), scroll persistence **600 → 600**,
landscape **992 > 301, scrolls** — **no Tailwind v4 mobile-nav bug, the 37th consecutive live
confirmation at baseline (the 38th at the post-fix re-verification)**.

## The audits (rotated fresh eyes — the s130 closing recommendation)

- **Audit A — the app shell + routing + design tokens + auth screens family** (last
  deep-covered CD, two cycles back): `src/app/` in full, the 11 auth routes, the auth
  components, the 6 layout components, the client-consumption side of router/theme/store/site.
  **0C/0H/1M/5L/4I.**
- **Audit B — the crypto/auth core + infrastructure configs + test-infra family** (also last
  covered CD): the crypto core in full, http/ai/entities, db/db-path/env-check,
  instrumentation, every config, Dockerfile/compose, the e2e setup + cert scripts.
  **0C/0H/1M/8L/6I.**

Every M finding re-verified by direct read BEFORE the plan (the two: the per-IP-only
register/resend budgets with the unconditional scrypt burn; the `"local"` fallback collapsing
every per-IP auth budget into one shared bucket). Two decisive pre-plan verifications: the
**App Router socket-access infeasibility** (Next 16's `NextRequest` exposes no `ip`/socket —
the audit's primary recommendation is not implementable, the honest alternative taken), and
the **CF11 live reference probe** (the reference's login page is LIGHT-ONLY under dark-OS —
its hairline never renders dark, so the clone's dark hairline is a clone-side dark-correctness
item, never a parity constraint).

## The CF set (TDD — 15 unit + 3 e2e RED pins, all for the right reasons)

**CF1 (M)** the per-email auth budgets: register + resend were gated ONLY by the forgeable
per-IP key while every register branch burns `scryptSync` — a rotated-XFF flood was a
single-worker CPU DoS plus unbounded unauthenticated User/VerificationToken growth;
`registerAcct:`/`resendAcct:` payload-keyed 5/15-min budgets now precede every DB read and
scrypt burn (a 429 answers identically for known and unknown emails — the CB12/BX2 pattern,
no enumeration oracle). **CF2 (M)** the shared-bucket posture made loud: the `"local"`
fallback shares ONE bucket per auth family (10 anonymous requests sitewide-lockout auth for
15-minute windows under the hops=0/no-XFF postures); socket access is not implementable in
the App Router, so the CB14-precedent production boot warning (`directExposureProdWarning`)
+ the DEPLOYMENT.md/AGENTS.md/.env.example notes + the truth-table pins. **CF3** the
reseed_e2e footgun (the script deleted the DEV database under Bun's `.env` auto-load —
hard-targeted to db/e2e.db with the resolved path printed). **CF4** the e2e posture pins
(SEED_DEMO/DISABLE_IN_APP_OTP/DISABLE_IN_APP_RESET/TRUSTED_PROXY_HOPS pinned in the webServer
env — an operator's exported deployment env red-hazed the suite with no diagnosable cause).
**CF5** the always-cold default runner (`scripts/e2e-cold-reset.sh` chained into `test:e2e` —
the S46 ALWAYS-COLD doctrine was cert-path-only). **CF6** the cert-runner truth pair extended
(run-cert-chunk.sh exits on `PIPESTATUS[0]` — a no-match grep false-REDed green runs; the two
cert scripts' CHUNKS arrays byte-identical by machine pin). **CF7** the OTP digest at rest +
the timing-safe compare (VerificationToken stored the LIVE 6-digit code verbatim while
PasswordResetToken hashes — the BR6 posture extended to the OTP family [a correct code SIGNS
THE CALLER IN]: `hashResetToken` at both mints, the new `timingSafeEqualBuffer` seam, the
BV11a conditional consumption carries the digest; the response still delivers the plaintext
code per ADR-013; the 15-min TTL + re-issue paths bound the pre-existing-rows impact — no
data migration). **CF8** the resend 429 honesty (the catch rendered the SUCCESS line on a
real 429 — the "uniform-200 endpoint" comment was factually wrong; the route's own 429 copy
now rides the status channel). **CF9** the drawer focus restore at the lg breakpoint
(`document.contains()` passes while the hamburger is `display:none` — focus() silently no-ops
and drops to `<body>`; `checkVisibility()` guards, the desktop sidebar's first nav link is
the fallback). **CF10** the dead-code sweep + the siteUrl self-heal (the dead post-reset
prefill line; the login-route consts un-exported per the http.ts layering rule; `URL.canParse`
guards `new URL(siteUrl())` — a malformed NEXT_PUBLIC_SITE_URL threw at layout module scope,
500-ing every route). **CF11** the login-card hairline dark pair (the arbitrary-value class
pair — the exact sRGB light stops kept, the slate-800/700 dark stops added; settled by the
live reference probe).

## The honest mid-run corrections

(1) **THE CF5 DESIGN CORRECTION** — the plan placed the cold reset (port-guard + rm) in
global-setup; the first GREEN attempt died `ECONNREFUSED ::1:3100`: **Playwright boots the
webServer BEFORE globalSetup** (empirically verified — the global-setup port-guard killed the
suite's own server, then rm'd + re-seeded under it). The reset moved to
`scripts/e2e-cold-reset.sh` chained into `test:e2e` BEFORE playwright boots — the only
pre-boot seam; global-setup keeps only the safe half (push + seed + the SEED_DEMO pin), and
the census pin asserts global-setup carries NO rm/port-kill (the same mistake cannot return
silently). (2) The CF7 schema pin's 200-char look-back window missed the inline column
comment — re-scoped to the column's own line. (3) The three e2e appends initially landed
outside their describes with an unbalanced trailing brace (tsc caught it) — wrapped per the
file conventions. (4) The CF9 first RED run timed out at the hamburger (the wrong-reason
class — the describe sits outside the file's beforeEach and never navigated; the BY10
blank-page lesson, navigated explicitly, the true RED [focus on `<body>`] confirmed after);
and the CF9 agent-browser LIVE probe later read focus-on-body from viewport-race noise — the
deterministic playwright-core probe confirmed the fix (the e2e had already proven it on the
standalone build twice).

## The re-cert

lint ✓ · tsc ✓ · unit **1236/1236 (45 files — census 1217 → 1236, +19 exact:
script-conventions +10, env-check +4, site +3, auth +2)** · the canonical build green
(REAL_EXIT) · the cold 5-chunk e2e **570/570 — 147+179+72+94+78, every chunk first-pass on
the final tree** · the register tripwire **249/130/0/119 — the exact hold (the 41st
consecutive)**. The live battery on the fresh-seeded daemon ALL GREEN — **the 38th
consecutive no-Tailwind-v4-bug confirmation** — plus the CF-cycle's own live verifications:
**CF9** focus on the sidebar's "Dashboard" link after the lg crossing; **CF11** the dark
stops (rgb(30,41,59)/rgb(51,65,85)) computed on the dark login card; **CF7** the DB row
stores the SHA-256 digest (`01e0fa9f…`) while the plaintext code (456747) verifies and signs
in — the digest at rest and the round-trip both live. Three evidence frames in
`docs/screenshots/131-clone-*.png` (the mobile drawer; the dark login hairline; the desktop
dashboard), all verified non-blank. **Census: 1236 unit + 570 e2e = 1806 green.**

## Final state

lint ✓ · tsc ✓ · unit **1236/1236 (45 files)** · build green (REAL_EXIT) · e2e **570/570**
(147+179+72+94+78) · tripwire **249/130/0/119** · **1806 green total**. Docs chain updated:
README (the chunk map + the badge 1806 + the S131 row), AGENTS.md (the census anchors + the
S46 self-cold note), PAD **v1.3.39** (the revision block + the §8.1 rows + the Total
76/1807), the SKILL doc (the census anchors), the vitest header (45/1236 + the S131/CF
re-anchor block), the cert-script re-tags (the S131/CF block + Expected 570), `.env.example`
(the CF2 note), DEPLOYMENT.md (§3's shared-bucket note), the plan's §5, the worklog
Session-131 entry, and this record. **Deferrals documented with rationale:** the scrypt KDF
parameter/versioning migration (the next-cycle candidate — the format pin + the DUMMY
equalizer + the measured N-raise decision) and the Docker non-root runtime (the
runtime-volume ownership verification). Committed to `main` and pushed via the SSH wrapper
(the remote ref verified equal to the local HEAD).

I'll start by internalizing the operating instructions and setting up the workspace. Let me create a TODO plan first, then proceed systematically.
Workspace is fresh. Cloning the repo now:
Repo cloned (up to date with origin/main). Now let me read the key documentation files:
The docs are large. Let me read them strategically in chunks:
Let me read the files directly in manageable chunks:
The docs have extremely long lines. Let me write a helper script to read them in digestible chunks:
The docs are massive with extremely long lines. Let me delegate deep-reading to parallel subagents while I read the smaller files myself:
I now have a solid understanding of the project. Let me update my TODO and validate understanding against the actual codebase:
Now let me check the skills catalog and web-application skill:
I have a thorough understanding now. Let me set up the runtime environment. First, check bun availability:
bun 1.3.14 is available. No ssh binary and no paramiko — I'll need the paramiko shim for the git push later. Let me install dependencies now:
Now setting up `.env` with `DATABASE_URL="file:../db/custom.db"`, creating `db/` at repo root, and pushing the schema:
Schema pushed. Now seeding:
Seeded. Now installing Playwright chromium and starting the cold baseline gate (lint → typecheck → test):
Lint clean. Now typecheck + unit tests:
936/936 unit tests green — matches documented census. Now the production build:
Build green with the correct bundled `.env` contract. Now the cold e2e run. Per AGENTS.md, the full suite must run via the 5-chunk cold map (a single-process run trips the register rate-limiter). Let me check the chunked cert script:
The chunked cert script is the canonical cold e2e run. Let me launch it as a daemon (per the reaper-avoidance convention) while I proceed with the audit:
E2E chunk 1 is running. While it runs, let me start the Mode-C audit of the recent code changes (the Batch BQ diff + operator commit, per the established session pattern):
Batch BQ diff claims verified: zero src/tests changes, no secrets, 20 md5-distinct frames. Now the register re-derivation tripwire:
Register re-derivation: **249 importers / 130 carriers / 0 stale** — matches the recorded tripwire exactly. E2E chunk 1: 131 passed (as documented). While e2e continues, let me start the live parity verification. Loading the agent-browser skill:
Logged in to the reference site. Saving session state and capturing reference evidence (desktop dashboard first):
Now the critical mobile navigation check on the reference — mobile viewport 390×844, open the drawer:
The unlabeled hamburger button (`[ref=e50]`) is visible — the documented reference defect. Opening the drawer:
Reference drawer open with 20 nav links. Let me verify drawer semantics and the reference's known /Notes overflow defect via JS evaluation:
Reference facts confirmed live: 24 links, no `role=dialog`, unlabeled hamburger, and the /Notes overflow defect (scrollWidth 416 > 390). Now the landscape drawer nav-scroll discriminator:
参考移动端侧边栏必须滚动（在 290 处为 992 — 匹配的判别式）。现在让我检查内存，并在 :3000 上启动本地开发服务器，以便在 e2e 在 :3100 上继续运行的同时探测克隆版本：
Dev server up. Running the documented dev-server preflight (liveness ≠ stability ≠ hydration):
Preflight says unreachable though health returned 200. Checking server state:
Server alive but dev.log shows an Ecmascript error. Investigating:
This is the documented Edge-Runtime warning from the boot guard (ADR-020), not a new defect. The preflight likely raced the first compile. Re-running:
Preflight GREEN. Now let me probe the clone's mobile navigation in a separate agent-browser session:
Clone mobile dashboard healthy — labeled hamburger ("Open navigation menu"). Opening the drawer for the critical checks:
Dialog role + label confirmed, 26 links. My backdrop selector matched the wrong element — let me check the actual drawer backdrop computed style and the Escape-close behavior:
Backdrop is `blur(4px)` — the Tailwind v4 `backdrop-blur-xs` pin holds, and it's a labeled button. Now Escape-close and nav auto-close:
Escape works and scroll-lock releases. The "Tasks" click matched a hidden element — retrying with a scoped locator:
Auto-close works, no overflow. Checking the clone's /Notes (where the reference overflows) and the landscape drawer:
Clone mobile nav fully verified — no Tailwind v4 bug, all superset features hold. Now desktop checks (sidebar + collapsed rail) and screenshot:
All desktop checks pass (260→80px collapse, 20/20 icon links titled, boolean-string localStorage). Restoring state and checking e2e progress:
E2E cert complete. Verifying all 5 chunk counts:
**Cold baseline fully green: 936 unit + 474 e2e + lint + typecheck + build.** Now the visual parity comparison — viewing the fresh reference vs clone captures:
The model can't view images directly — let me use the VLM skill for the visual spot-check (per the repo's evidence convention):
VLM verdict: clone drawer visually equivalent. Now the desktop dashboard comparison:
VLM flagged two items — both need DOM verification (VLM findings are hypotheses, DOM probes are the authority). Checking the reference sidebar link count:
DOM verdict: reference HAS all 20 links including Practice Tests — the VLM flag is disproven (VLM misread; DOM is authority). The overdue banner is data-driven (empty vs seeded account). **No new parity gaps. No Tailwind v4 mobile-nav bug — s117 re-confirmed.**

Now launching the standing audit suite (35 stages, the canonical audit) as a daemon:
While the standing suite runs (~75 min), let me launch parallel deep-audit subagents against the codebase using the skill contracts as rubrics:
Both audits report findings. Per Mode-C discipline, I must verify the top findings myself before planning remediation. Let me check the PAD's documented decisions first, then reproduce F1 (the import/cards 500):
The AGENTS.md documents a DIFFERENT import contract than the auditor found. Let me read the actual route file myself to resolve this contradiction:
The route write-loop at line 246-247 uses `userId` in the findFirst for ALL collections including `cards` (Flashcard has no userId) — while the knownIds loop above it correctly special-cases cards. Let me check the seam file and its usage:
Flashcard confirmed to have no userId. Now let me reproduce the bug live (export→import round-trip on the dev server, which will include seeded cards):
**BUG REPRODUCED — HTTP 500 on the export→import round-trip.** Confirming root cause in server logs:
Root cause confirmed with full stack trace. Now verifying the remaining security findings — reading the verify-email and login routes, and the PAD threat model:
F3 and F5 confirmed by direct read. Checking the remaining findings — readJson, files/link, forgot-password, and the PAD threat model:
All findings verified against code and the PAD threat model. Checking standing suite progress and the e2e verify-POST budget (critical before adding a rate limiter):
Per-chunk verify budgets are low (fresh server per chunk). Let me confirm auth-flows' verify usage, then read the import seam fully to design the fix:
Standing suite at stage 15/33. I now have complete verified findings. Let me read the s23 spec structure and check the e2e POST shapes (for the CT-gate safety), plus the files route URL pattern:
files/route.ts already has both guards — files/link is the inconsistent duplicate. Verifying the app's own client sets the CT header before adding the gate:
Client is safe. Checking the RUM upsert (F8) and the s23 spec structure:
The s23 envelope has no cards — the blind spot confirmed. Let me check the deck API route names and an existing session plan's format:
API confirmed: `/api/flashcards/decks` + `/api/flashcards/cards`. All findings verified. Now writing the comprehensive remediation plan:
Plan created. Now the alignment validation pass — reading the files I'll modify (auth.ts, forgot/reset-password routes), and testing the noImplicitAny flip:
All source files read. Beginning TDD execution — first the RED phase. Let me check the test file styles to match conventions:
Now writing the RED-phase unit pins (they must fail first — missing exports):
Imports landed but the describe blocks didn't. Adding them now at the tail:
Now the BR4 validation pin (RED first):
Now run the RED phase — these pins must fail (missing exports):
**RED confirmed: 8 failing pins.** Now the GREEN phase. First the auth.ts helpers:
Hoisting is fine (function declarations). Now the linkFileSchema in validation.ts:
**GREEN: 84/84.** Now wiring the routes. Login timing equalizer first:
TS narrowing issue — the null check must come after the unconditional burn. Restructuring:
Now verify-email rate limit (BR2):
Now forgot-password (store hash) and reset-password (lookup hash) — BR6:
Now files/link (use the shared schema) and the readJson CT gate (BR5):
files/link clean. Now the readJson CT gate:
Now the core BR1 fix — the import route. Rewriting with the cards probe fix, body cap, secret strip, unknown-collection rejection, folders topo sort, and version floor:
Now export `sortFoldersParentsFirst` from the seam (it's currently module-private):
Now the tsconfig `noImplicitAny` experiment (flip + typecheck):
The stricter flag surfaced a pre-existing implicit-any in the route's transaction delegate. Fixing it explicitly:
The file has a corrupted line (`txodel]`). Fixing it:
False alarm — `od` proves the file is fine (`tx[model]`); the earlier display was a terminal-escape artifact. Applying the delegate fix with correct text:
Typecheck clean with the strengthened flag. Running lint + full unit suite:
944/944 unit green. Now the e2e pins — reading the rest of s23 spec first:
Checking the flashcards API route shapes before writing the pin:
Now writing the S117 cards round-trip pin into s23-import.spec.ts:
Now the auth-flows verify-429 pin. Reading its structure:
Let me check the standing suite progress and re-run lint/typecheck on the changed tree:
Lint + typecheck green. Live-verifying the import fix (the reproduction must now pass):
**GREEN verified live** — the round-trip now succeeds with `cards: {updated: 6}`. Now live-verifying the verify-email 429:
429 + `retry-after: 890` verified. Now the reset flow with hashed-at-rest tokens:
The bare-PrismaClient script hit the documented CWD-anchor trap (proving the docs right). Using an absolute URL for this one-off check:
BR6 verified live — 64-char SHA-256 digest stored, raw-token reset succeeded. Quick timing-oracle check on login, then suite status:
BR3 verified — both branches now ~40ms (the scrypt burn). Suite at stage 28/33 (cwv). Waiting for completion:
Suite NOT GREEN — 27/35 with 8 failures in the accent-volume family. Investigating whether my readJson CT gate broke the volume-insert POSTs:
The failures are "Target crashed" (Chromium OOM) — not app assertions. The same code paths passed in the non-volume accent stages. Let me examine the failure details and memory state:
Pattern confirmed: same-family stages pass (light-midband GREEN) while others crashed — the environmental OOM class, not a code regression. Per evidence discipline, re-running the 8 failed stages on a quiet machine. Closing my browsers first:
First 3 re-runs GREEN. Continuing with the remaining 5:
Running the remaining sweeps as a background daemon with logging:
While sweeps re-run, proceeding with the BR7 config/docs fixes. First `.env.example`:
Now the Docker/DEPLOYMENT sitemap build-time correction:
Now the PAD threat-model rows (the explicit decisions with reopen triggers):
Now updating the PAD version header and checking sweep re-run progress:
Now the vitest.config.ts header re-anchor:
Now the AGENTS.md updates — commands census, import paragraph, S117 lessons:
Now the AGENTS.md import paragraph rewrite (the code now implements the documented contract):
Now adding the S117 lessons to AGENTS.md (after the S116 section):
Now the CLAUDE.md seam tail:
Now README — badge count and session row:
Now the main remediation-plan.md status header re-anchor:
Now the worklog entry (appended at bottom per convention):
Worklog written (re-cert numbers pending actual verification — must run before commit). Checking sweep re-run status:
All 8 sweeps GREEN on re-run — environmental OOM confirmed, standing suite effectively 35/35. Now capturing the s117 evidence screenshots:
The reference session lost auth (redirected to login). Re-capturing with the saved state:
All 6 evidence frames md5-distinct, DOM-verified. Now writing the session record `docs/session_103.md`:
Now the actual FULL RE-CERT on the final tree. Build first (src changed since baseline):
Gate green: 944/944 + build with the bundled-secret contract. Now the cold 5-chunk e2e re-cert (expecting 476):
Chunk 5 has 1 failure (59 passed). Investigating:
The cert script's grep filter hid the failure name. Re-running chunk 5 with full output:
My new pin fails in e2e though the live curl passed. Isolating the failure:
Failure #1 is the documented aged-db artifact (I re-ran warm). But my pin failed cold too — let me see its specific error:
Found it — my pin posts a bare `{data:{cards}}` without the `format`/`version` envelope wrapper. Fixing the test to use the envelope helper:
Both pins GREEN cold, including the forgot→reset journey with hashed tokens. Full cold 5-chunk re-cert again:
**FULL COLD RE-CERT GREEN: 476/476** (131+141+57+87+60). Finalizing the remediation plan's validation record with the real numbers:
Final pre-commit review — git status and artifact hygiene:
All clean. Final gate re-verification after the last spec fix:
All green. Final count-lockstep verification before commit:
Count-lockstep verified at every anchor. Committing Batch BR:
Committed `2b7222e`. Now the SSH push setup — paramiko shim (no ssh binary in this sandbox) per the documented procedure:
Key verified (ed25519). Dry-run push via the wrapper:
Dry-run clean (fast-forward `b55affb..2b7222e`). Real push:
Push verified, key shredded, tree clean. Cleaning up the dev server and closing out:
**Session-117 / Batch BR complete — pushed to `main` (`2b7222e`), remote ref verified.**

The audit (repo skills as rubrics, every finding verified against code and reproduced live before fixing) found one **Critical functional bug**: the data-import route's write loop probed `userId` on the Flashcard model (which has no such column) — so the export→import round-trip **500'd for any account with flashcards**. Fixed plus five documented-but-unimplemented S23 contracts (10 MiB cap, secret stripping, unknown-collection rejection, folders topo-sort, version floor); the dead 289-line seam is now consumed by its route.

The hardening quartet followed (TDD, red→green): verify-email rate limiting (was unthrottled OTP brute-force), the login timing equalizer, http(s)-only link URLs, the `readJson` CSRF gate, and reset tokens hashed at rest. Documented decisions (XFF keying, in-response delivery) now carry explicit reopen triggers in the PAD; `noImplicitAny` was strengthened on.

**Mobile nav: no Tailwind v4 bug — s117 re-confirmed live** on both hosts (labeled drawer, `blur(4px)` backdrop pin, Escape/auto-close, no overflow). Cold re-cert: **944 unit + 476 e2e, all green**; the standing suite's 8 volume-sweep failures proved to be sandbox OOM, all green on quiet re-run.

Suggested next steps: review `docs/remediation-plan-session117.md` (the reopen triggers are the deploy-time decisions), and note the Docker compose-init flow still awaits its first real-host run.

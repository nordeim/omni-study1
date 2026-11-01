I'll start by internalizing the operating instructions and setting up the workspace. Let me create a comprehensive plan first.
The workspace has been reset. Let me clone the repository:
仓库已克隆。现在让我阅读核心文档文件。首先，我先查看一下根目录结构：
文档非常庞大（README 363KB，worklog 481KB）。让我采取策略性地阅读它们——先阅读核心部分，再加上最近的会话文档：
Now let me read the remediation plan and worklog tail:
Now let me check the worklog tail and the latest session records to establish the current state:
Current state established: Session 119/Batch BT is complete and pushed, standing debt ZERO. This session is the next cycle (Session-120/Batch BU, Cycle 70). Now let me read the core operating docs:
Let me read CLAUDE.md directly in chunks:
CLAUDE.md has a 48K-char line. Let me read it with line truncation:
Now let me digest the large docs. I'll launch two parallel subagents for README+PAD and SKILL doc+master plan, while I read AGENTS.md myself:
太好了。现在让我自行阅读 AGENTS.md（操作手册）—— 先看结构，再是关键章节：
I now have the operating manual internalized. Let me read the skills catalog and SSH push wrapper instructions:
Now let me set up the environment and validate the codebase. First check the env contract and configs:
The `.env.example` already carries the requested `DATABASE_URL="file:../db/custom.db"` contract. Now let me set up the environment — install deps and create `.env`:
数据库已正确在仓库根目录初始化。现在让我运行冷基准门控（任何工作前的验证）：
Unit 990/990 (31 files) — exact census match. Now the canonical build:
Build green (ADR-020 warning only, bundled `AUTH_SECRET=""` intact). Let me check the e2e cert script and launch the cold cert as a daemon:
The cert script is understood. Let me check the daemon recipe (S32) and launch the cold e2e cert in the background:
Cold e2e 认证已作为守护程序启动。在它运行的同时，让我查看一下技能目录和关键技能：
Let me read the audit-relevant sections of the web-application skill (§5, §8, §9, §12, §13, §16):
Full skill rubrics internalized. Let me check e2e cert progress and review the vitest/playwright configs in parallel:
Configs validated. While the cert runs, let me perform the Mode-C audit of the recent Batch BT diff:
Let me spot-verify the key BT claims against the tree (Mode-C discipline):
Mode-C spot-verification passes; secret sweep clean. Now let me start the dev server and set up the SSH key, then launch the deep audits:
Key verified. Let me check the wrapper script's remote configuration and do a dry-run:
Push infra verified. Now let me launch the two parallel deep audits (the standing rhythm) while the e2e cert runs:
Both audits delivered — API audit (1H/4M/5L/5I) and frontend audit (1H/7M/9L/3I). Let me check the e2e cert progress and verify key findings personally (Mode-C discipline):
Massive failures in chunks 4-5 — let me diagnose immediately:
Near-total failure across all chunks — likely infrastructure. Let me reproduce with one spec to see the actual error:
Root cause: infrastructure — the Playwright browser binary is missing in this fresh sandbox (not source debt). Installing browsers:
Browsers installed. Re-launching the cold e2e cert:
While the cert re-runs, let me personally verify each audit finding by direct read (Mode-C discipline). First batch — the API/security findings:
M4/M5 verified. Now the frontend findings batch:
verify-email semantics confirmed (ADR-013 documented posture). Let me verify the remaining findings:
F2 census exact (51 sites). Let me verify the F3 text sites and check for parity pins that could interact:
The hint color IS a measured parity pin — flashcards:381 is a non-gap. Let me check which other F3 sites are pinned:
All F3 sites verified — one is a color-pinned non-gap (flashcards:381). Let me check cert progress, then start the live parity phase:
Chunk 1: 133 passed — exact census. Cert is healthy. Now the live parity phase — let me load the agent-browser skill:
已登录到参考站点。现在开始进行常规的移动端导航测试（390×844）：
Reference battery holding: unlabeled hamburger, no role=dialog, 24 links, blur(4px) — the 21st confirmation. Now /Notes overflow + landscape:
Landscape 992 > 290 ✓. Standing battery fully re-confirmed. Now the new parity questions — first F5 (task delete confirmation):
The reference's Add Task dialog HAS Cancel. Let me create a task and test the delete flow:
The synthetic click didn't trigger the Radix menu (S114 lesson). Let me use the real click path:
I clicked the star earlier (task now marked Important). The ellipsis is @e100 — clicking it properly:
**F5 已确认**：参考实现会立即删除且无确认——克隆实现的即时删除即为一致性（non-gap）。现在 F12：检查参考实现的其它对话框以寻找取消按钮：
Reference Events dialog has NO Cancel (submit + Close only) — clone matches (parity). Checking Exams and Flashcards dialogs too:
Reference's Add Exam dialog HAS Cancel — let me check the clone's counterpart and complete the reference matrix (Assignments, Notes, Flashcards):
Real parity gap confirmed for Exams. Completing the reference dialog matrix:
The reference matrix is forming. Let me check the clone's dialog footers for Assignments and Timetable:
No exam data on the probe account for F17. Let me create an exam to measure the badge colors:
Reference dashboard badge for today-exam is red-100/red-600. Now a +12-day exam to check color differentiation:
The far exam got a past date. Let me retry with next-month navigation:
Reference exams-view differentiates: Today=red, 11 days=BLUE. Now the dashboard badge for the same far exam:
F17 settled: reference dashboard = red for Today, neutral slate for 11d. Let me read the clone's badge code:
The reference's exams-view badge (blue for 11 days) disagrees with the clone's pinned yellow family — possible reference drift. Let me census all badges on the reference's exams view carefully:
Reference drift detected (yellow→blue). Let me check the clone's dashboard badge labels and pins:
Let me create a tomorrow-exam on the reference to complete the dashboard badge family measurement:
Reference drift confirmed for the exams-view badge (yellow→blue). Let me map one more range (+2 days) to complete the family:
Reference measurement phase complete. Now the clone-side battery — open the clone dev server:
Let me redo the BS4 flow cleanly from a fresh page load:
Let me redo scroll persistence exactly as the s119 protocol (Dashboard→Analytics):
Scroll persistence ✓ (600 carried). Full clone battery GREEN. Now let me reproduce the F1 FolderDialog bug live:
The same-folder flow coincidentally matched. Testing the true bug path — create a second folder, then rename the first:
F1 visible already — the NEW folder dialog opened pre-filled with the stale name. Now the rename cross-check:
**F1 fully reproduced**: rename dialog shows the STALE "Beta" value for folder Alpha — silent-rename data hazard. Let me clean up and verify F11 (nested select):
F11 verified working live (non-gap). Let me restore the note's notebook and close the clone session's probe state:
Probe state restored. Let me check the e2e cert and run the register tripwire:
Cold e2e cert: **488/488 exact census**. Let me find the register tripwire procedure:
Register tripwire: **249/130/0/119 — exact 21st hold**. Complete baseline verified. Let me check a few fix-surface details before writing the plan:
All fix surfaces verified. Now writing the comprehensive remediation plan (Session-120 / Batch BU, Cycle 70):
Plan written. Now the plan-validation pass against the codebase — checking the pin surfaces for the new tests:
Plan validated. Now the TDD RED phase — first let me study the test conventions and the seams I'll extend:
Now let me check the validation test structure, then write the RED pins:
Writing the RED unit pins — 4 new test files + 2 appends:
Now let me append the RED pins to auth.test.ts (limiter eviction) and validation.test.ts (event refine):
Now the e2e RED pins. Let me check the spec surfaces first, then write them:
Now let me write the e2e RED pins. First, checking the conventions in the target specs:
Structure valid. Now the AC7 re-anchors (yellow→blue) in both specs:
The pin landed in the wrong describe block — relocating it into the files describe:
Now let me run the RED phase — confirm the new unit pins fail on the pre-change tree:
The eviction pins don't discriminate pre-fix — redesigning them with a size observable:
Unit RED confirmed. Now verifying the e2e pins are RED against the pre-fix build (one filtered invocation):
All e2e pins RED. Let me check the BU13 failure reason (fast fail = possible locator issue):
The BU13 pin needs a page load before its evaluate — fixing:
The API create fails — let me probe the route shape directly:
The pin sits in a logged-out describe — relocating to an authed top-level describe:
**E2E RED complete — all pins fail for the right reasons.** Now the GREEN phase. Starting with the pure seams:
The exact-count assertion is order-dependent on shared state — adding a drain seam for self-contained pins:
Seams GREEN. Now the eventSchema refine and the route wiring:
Now the route wiring — register, resend, forgot, verify, login, rum routes:
TS weak-type clash — widening the seam's env parameter with an index signature:
Now the RUM routes (user-scoped upsert + export cap) and the schema change:
Backend GREEN. Now the frontend fixes — starting with BU1 (the FolderDialog key):
Now BU8 — the exams-view blue badge + the sf-pill-blue utility with pinned palette steps:
Now BU9 — the three Cancel buttons (exams, assignments, timetable):
Now the practicetests fixes (radiogroup + expiry announcement):
Now the polish batch — calculator ids, flashcards Textarea + icon names, login status, rum-panel, tasks dead imports, cursor rule:
JSX comment placed in an expression position — fixing:
TSC clean. Now login status channel, rum-panel pairs, dead imports, cursor rule:
The status channel already existed — cleaning up my duplicates:
Now the big sweep — BU10 (51 sites) + BU11 (8 sites). Scripted with verification:
The guard needs refinement — icon glyphs are the sanctioned idiom and variant-prefixed pairs need general detection:
Guard GREEN. Now the security headers (BU16) + the ignoreBuildErrors test (BU22e):
Zod 4 refine wraps the schema breaking `.partial()` — switching to the in-place `.check()`:
`.check()` also blocks partial. Let me see how the routes consume eventSchema:
Restructuring: pure object + separate create/update schemas with the ordering check:
Build EXIT 0. Let me verify the standalone + headers work:

Workspace intact. Let me check the repo state and my TODO progress.
The GREEN-phase changes are in the working tree, uncommitted, right where the session stopped (after `next build` EXIT 0, before the standalone + headers verification). Let me set up the TODO list and continue.
Now let me run the full unit suite (GREEN verification) — that's the immediate next gate:
The `basic` reporter isn't valid in this vitest version. Let me use the project's canonical runner:
One failure: `hue-tokens.test.ts` — the BU8 exams-view badge change (yellow→blue) interacts with the hue-token pin. Let me examine it:
The hue-tokens census pins `sf-pill-yellow` in exams-view, but BU8 changed it to `sf-pill-blue` (per the live reference measurement). Let me check both surfaces:
The BU8 change requires updating the hue-tokens census. Let me read the census structure to update it coherently:
Now let me check the new `sf-pill-blue` utility in globals.css to sync the UTILITY_CONTRACT:
Let me read the FAMILY_STEPS map at the top of the test to check the blue steps coverage:
The `sf-pill-blue` utility rides `blue-100`/`blue-700` steps which may not be pinned in `@theme`. Let me verify:
`blue-100`/`blue-700` are already pinned in `@theme` (BU8 did this). Now I sync the hue-tokens contract — three coherent edits:
Also fix the now-stale `sf-pill-yellow` comment in globals.css (exams no longer rides it):
Now the full unit suite:
**Unit GREEN: 1025/1025 (35 files)** — baseline 990 + 35 new pins. Now the canonical build (globals.css changed) + standalone headers verification:
Build compiled clean (the ADR-020 warning is the documented known posture). Since BU22e removed `ignoreBuildErrors`, this build now runs the type gate — let me confirm exit code, then smoke the standalone server with headers:
The standalone server needs AUTH_SECRET (production mode refuses absent secrets). Let me restart with env passed explicitly:
`.env` carries the documented empty `AUTH_SECRET=""` (dev posture). The standalone production server correctly refuses it — that's the hardening working as designed. Let me check the env-check logic, then smoke with a generated secret:
`.env.example` is complete and matches the codebase contract. Now the standalone smoke with a proper secret:
**BU16 verified live**: all three security headers on the standalone production server, and the boot-time AUTH_SECRET enforcement works (refuses empty, boots with real). Let me verify an API route + login flow works on standalone too:
Todos 1+3 verified — headers on every route, auth+validation live on standalone. Now the full e2e cert (488 + new pins):
The cert script is understood. Before launching, let me establish the new expected census by counting the e2e pin additions from the diff:
Net +9 (10 added, 1 AC7 re-anchored in place) → expected e2e census: 488 + 9 = **497**. Launching the full cert as a background daemon (the standing recipe):
Cert running. While it runs, let me handle parallel work — find the register tripwire procedure and start the dev server for parity verification:
Now I can run the instrument-identical register re-derivation. Expectation stated BEFORE the measurement: **249/130 + this cycle's riders** (my session added no new playwright scripts, so expect an exact 249/130/0/119 hold — the 21st... wait, the s119 record said 21st already; this would be the 22nd):
**Register tripwire: 249/130/0-stale/119 — exact hold**, as stated before the measurement. Now let me check cert progress and start the dev server for the parity phase:
Dev server up. Now the live parity re-verification — loading the agent-browser skill:
Now the live clone battery. Let me check the seed account and log in to the clone:
Logged in. Now the mobile navigation battery (the user's particular focus) — 390×844:
The clone hamburger carries `aria-label="Open navigation menu"`. Let me check the canonical mobile-nav spec to see what's pinned (labeled vs unlabeled — superset posture):
The labeled hamburger is the documented a11y superset (spec pins it by accessible name). Now the drawer interaction battery:
Let me measure the actual drawer panel precisely (288px pin):
Panel width 288px ✓ (S3-F pin). Let me verify drawer navigation works (tap a link → navigates + drawer closes):
Mobile drawer navigation GREEN. Now the F1/BU1 fix verification — first check the fix, then reproduce the original bug scenario live:
BU1 fix in place (key-remount). Now the live bug-scenario reproduction — create Alpha, create Beta, rename Alpha (pre-fix this showed the stale "Beta"):
Now the critical moment — rename Alpha-PT (the pre-fix bug showed "Beta-PT" here, the stale previous-session value):
**BU1/F1 FIXED — verified live**: Rename Alpha-PT prefills "Alpha-PT" (pre-fix showed the stale "Beta-PT"). Cross-check with the reverse order (rename Beta-PT):
Both directions correct. Cleaning up the probe folders, then BU8/BU9 verification:
Cleanup done. Now BU8 — the exams-view blue badge:
**BU8 verified live**: far exams (2/3/11 days) render the blue family (#dbeafe/#1d4ed8) — matching the reference drift measurement, with the AA-superset text step. Now BU9 — Cancel buttons:
BU9 verified — all three dialogs carry Cancel (reference matrix parity). Let me check cert progress and verify scroll persistence:
Chunk 1 has 1 failure (a red-badge pin in parity-session8) and my scroll measurement used full page loads instead of SPA navigation. Let me diagnose the e2e failure first:
The failing pin expects the dashboard's first exam badge to be red-100. My BU7 change (dashboard far-exam badge family) likely interacts. Let me check the BU7 diff:
The old pin (line 121) asserts the stale pre-BU7 reality — every dashboard badge red. Two staleness modes: the `Today!` label no longer matches the filter regex, and far badges are now slate (per the reference measurement). Let me check the new BU7 pin for the coherent re-anchor:
The BU7 pin is coherent. Now I re-anchor the stale old pin (same class as the AC7 re-anchor). First — what does the e2e seed put in the dashboard's first row?
First seeded exam is +1 day ("Tomorrow" → slate under BU7). The old pin asserts red-100 — stale. Let me check for any other stale red-badge assertions on the dashboard:
Only the exam-row badge pin is stale (the other two are tasks-due-pill and overdue-banner — unaffected). Re-anchoring it to the BU7 measured reality:
Let me verify the BU7 plan record covers the Tomorrow case on the dashboard (my re-anchor asserts slate for Tomorrow):
The re-anchor matches the executed BU7 decision ("every other distance renders the neutral slate pill"). The cert is in chunk 4 — I'll re-run chunk 1 after it finishes. Meanwhile, the scroll-persistence check with proper SPA navigation:
Scroll persistence GREEN (590 carried through SPA nav). Now the screenshots — let me check the existing conventions in docs/screenshots/:
Convention: `<session>-clone-<view>.png`. Capturing the S120 evidence set — dashboard, mobile drawer (user's focus), the BU8 badges, BU1 rename fix, BU9 cancel:
Wrong filename — let me fix that (delete, recapture correctly):
All 7 shots non-empty. Quick pixel sanity check, then visual spot-check of the two key frames:
The pixel distributions match expectations (dialogs dimmed 83-93%, views on white 5-9%, drawer 33%). Content was verified live via the battery. Let me check the cert:
Cert DONE: 494/497 — census arithmetic exact (497 = 488+9), but 3 failures to resolve: (1) the stale BU7 pin [already re-anchored], (2) a Lighthouse WCAG red-700 contrast failure, (3) an auth-flows reset test. Let me diagnose 2 and 3:
Let me run both failing tests individually for the real errors:
The pin finds zero `sf-pill-red` on the seeded dashboard — stale pre-BU7 reality. Let me check what sf-pill-red surfaces remain in dashboard-view:
The dashboard's only remaining `sf-pill-red` is the today-exam badge, which the seed never produces. The pin's intent (red family text = red-700 AA) re-anchors to the self-owning-data doctrine — same mechanism as the BU7 pin:
Let me verify the BU7 pin's cleanup API shape matches mine:
Cleanup shape matches. Now the third failure — the auth-flows S15 reset test:
The BU17d change (reset-success via status channel, not alert) broke the old pin's `getByRole('alert')` locator. Let me confirm the login-surface change:
Re-anchoring the pin to the status channel (the BU17d contract):
Let me check for other stale alert-role assertions on the reset-success across all specs:
Other alert pins are genuine errors (correctly on alert channel). Now re-run all three re-anchored tests:
All three re-anchors GREEN. Launching the final full re-cert on the final tree, then docs work in parallel:
The pattern is clear: record = `docs/session_111.md` titled "Session 121 — Batch BU (Cycle 70)". First, let me verify the BU21 (SEED_DEMO) implementation state — the `.env.example` I read earlier lacked the note:
BU21 appears unimplemented. Let me enumerate the full BU table and check each item's actual state:
BU2/3/5/6 all implemented. Only BU21 missed. Let me check the BU22 smalls too:
BU22d (z-index doc) and BU21 (SEED_DEMO) are the two missed items. Implementing BU21 now — first the seed gate:
No seed test. Per the env-flag pattern, the gate belongs in env-check.ts (where DISABLE_IN_APP_* live). Let me check the env-check structure and its test:
The seam follows the delivery-gate pattern. TDD — RED pin first:
RED confirmed (5/5 fail). GREEN — the seam in env-check.ts:
Now wire the gate into seed.ts:
I introduced invalid syntax (`!r`). Fixing the log line:
Live-verify the gate against a scratch db:
Gate works. Verify the default direction (unset → seeds) too:
Both directions verified. Now the BU21 docs — DEPLOYMENT.md and .env.example:
Let me verify my doc claim about the delete-account flow (cascade behavior):
Cascade confirmed. Now the `.env.example` note:
BU21 done. Let me also check whether TRUSTED_PROXY_HOPS (BU3) is documented for operators:
Adding the operator-facing TRUSTED_PROXY_HOPS docs (same one-liner pattern):
BU21 complete. Now BU22d — the z-index scale doc. First census the actual z-index values in the codebase:
The scale is coherent. Now find the AGENTS.md conventions section to document it:
BU22d done. Check cert progress and run the updated unit census:
Chunk 1 re-anchored GREEN (135), unit **1030/1030** (36 files). While chunks 4-5 run, the docs chain. First the remaining doc surfaces:
Now the CLAUDE.md Unit-line update (990→1030 + the S120/BU tail):
Quoting issue — writing it as a script file instead:
Now the vitest.config.ts header:
Let me get the exact append counts for the header (no "+N" placeholders):
Fixing the header counts (client-ip is 14, and the exact appends):
Now the README census lines:
The README updates — badge 1478→1527 (1030+497), census lines, then the Session-120 row:
Chunk 4 GREEN (90). Updating AGENTS command table:
Now the S120 lessons section (after S119 lessons, before Testing quirks):
Now the remediation plan status + execution record. First check cert and the master plan header:
**FINAL CERT: 497/497 (135+145+61+90+66) — ALL GREEN, census exact.** Now the cert script re-tag (safe — cert is DONE):
Let me verify the exact chunk placement of each new pin (my re-tag comment must be accurate):
My re-tag comment misplaced the pins. Correcting it with the exact mapping:
Now the master plan header re-anchor:
Master plan header done (matches the BT pattern). Now the session-120 plan's status + execution record:
Appending the execution record to the plan (status flip + the full record):
There's a duplicated status line at 195 (my record began with it). Let me inspect and fix:
Now the PAD (v1.3.28 + §6.4 rows). Let me check its current version and §6.4:
Now the PAD v1.3.28 — title, revision block, and §6.4 row updates:
Now the SKILL doc census re-anchor. Check its current state:
The SKILL doc's §18 is stale vs the measured tree (z-30 not 40; missing 60/70/100 layers). Updating it + the census lines + the AP lessons:
The string matches the pristine file — the script's copy must differ. Let me diff the script's embedded string:
The script's table separator had a typo (2 cols vs 3). Fixing:
SKILL doc done. Now the README Session-120 row — check the table order first:
Now the session record `docs/session_111.md`. Check the BT record's structure first:
Now the worklog entry:
All docs landed. Now the final gates — lint, tsc, unit re-run, secret sweep:
Tree clean, no key material, gitignore covers everything. Quick Mode-C self-check on the schema diff before committing:
Schema diff exact. Now the commit — first close the browser/dev server, then set up the SSH push infrastructure:
The procedure is clear. Now materialize the key and verify:
No ssh binary — the doc's Appendix A paramiko shim is needed. Let me read it:
paramiko available. Setting up the shim (outside the repo) + materializing the key:
Key verified. Dry-run the wrapper:
Dry-run green (auth works, remote at `da5942d` = local HEAD). Now the commit:
Committed `92600b0` (76 files, +1967/−175). Now the real push:
**Push successful** — remote verified at `92600b0`. Shred the operator key:
The **Session-120 / Batch BU cycle is complete and pushed**. Resuming exactly where the interrupted session stopped (post-build, pre-verification), everything closed out:

## Verification (final tree, all green)
- **Unit: 1030/1030** (36 files, was 990) — after syncing the hue-tokens census with the new `sf-pill-blue` family
- **E2e: 497/497** (135+145+61+90+66, was 488) — cold 5-chunk cert, every chunk first-pass
- **Build EXIT 0** with `ignoreBuildErrors` removed — the build is now the type gate; **security headers live-verified** on the standalone server (page + API), AUTH_SECRET boot enforcement confirmed
- **Register tripwire: 249/130/0/119** — exact hold, expectation stated before measurement

## Issues found & fixed during verification
1. **3 stale e2e pins** (exposed by the first cert, re-anchored to the measured contracts): the exam-row red badge → slate far family, the overdue-badge census → self-owned-data shape, the reset-success `alert` → `status` channel
2. **BU21 was missed** by the interrupted session — implemented the SEED_DEMO fail-safe gate TDD-style (RED 5 → GREEN), live-verified both directions (skip with `SEED_DEMO=0`, default unchanged)

## Parity & evidence
- Live battery: mobile drawer 288px + navigation + auto-close, **F1 rename fix verified both directions**, BU8 blue badges, BU9 Cancel ×3, scroll persistence — 21st consecutive mobile-nav/Tailwind-v4 confirmation
- 7 evidence frames in `docs/screenshots/120-clone-*.png`

## Delivered
- Full docs chain updated (12 surfaces: plan record, AGENTS + S120 lessons, CLAUDE, PAD v1.3.28, README, SKILL doc, cert-script census, DEPLOYMENT, `.env.example` with the new env vars, `session_111.md`, `worklog.md`)
- **Commit `92600b0`** (76 files, +1967/−175) on main only, pushed via the SSH wrapper — remote verified `refs/heads/main == HEAD`, key shredded

**Standing debt: ZERO.** The clone remains a production-ready functional superset with measured visual parity.

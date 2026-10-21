The local workspace has been reset (only a scaffold repo with no remote). I'll clone the omni-study1 repository fresh.
Repo cloned successfully on `main` branch. This is a large, actively-maintained codebase with extensive session history. Let me set up a structured task plan.
The doc files are very large (70-165KB each). Let me survey the docs folder and read strategically — first the structure, then delegate deep summarization to parallel Explore agents.
该仓库包含 330 张截图和一个成熟的测试配置。现在，让我分派并行探索 Agent 对海量文档（每个文档 70-165KB）进行深度阅读，同时我亲自阅读关键的结构文件。
All four exploration agents have returned comprehensive summaries. I now have a clear picture:

**Current state (post Session-75, HEAD `77a4326`):**
- Baselines: **844/844 Vitest unit + 389/389 Playwright e2e**, lint/tsc clean
- **Batch AC is MEASURED & PENDING** — 8 drift items (AC1–AC8) awaiting TDD implementation, exactly what `docs/session_21.md` directs for this cycle (Session 76)
- AC5 is the headline: `Exam.location` schema→dialog→card end-to-end gap
- AC6/AC8 need one more reference measurement before pinning
- Batch R (RSC perf) stays deferred with strengthened evidence

Let me now validate my understanding against the actual codebase, then provision the environment.
Tooling is ready (bun 1.3.14, node 24). The `.env.example` matches the documented conventions. Now let me provision the environment per the documented Session-76 workflow.
Database provisioned at `db/custom.db` with seeded demo data. Now installing Playwright chromium (documented: browser cache doesn't survive workspace resets) and running baseline gates.
Baseline so far: lint ✓, typecheck ✓, unit **844/844** ✓ (matches documented baseline). Now the build, then a cold e2e run.
377 passed but exit code 1 — 12 tests short of the 389 baseline. Let me capture the full failure details.
Failure analysis needed — two families visible: `register failed: 429` (rate-limiter budget) and one skip-link timeout. Let me check for a stale server on :3100 (the documented poison) and count the failures.
9 failures in run 2, no stale server — so the 429s come from the suite's own registration budget within a single run. The docs say specs use distinct RFC 5737 TEST-NET IPs via `x-forwarded-for`. Let me inspect how registrations are budgeted.
The register limiter is in-memory, keyed `register:${ip}` with max 10 per 15-min window. The suite was certified in **chunks** (fresh server per chunk = fresh limiter). Let me count total "local"-IP registrations across the full suite to see whether a single-process full run exceeds the 10 budget.
auth-flows registers 3 users via the UI. Let me count actual invocation counts of each register helper across the whole suite.
17 total "local"-IP registrations vs a 10/15-min budget — that explains the 429s. Let me pinpoint the exact first failure and ordering in the run-2 log.
auth.setup only logs in. Let me count actual register POSTs in the server log and find parity-session9's results.
parity-session9's 2 registrations passed. Count before s17 = 9, yet the 10th still 429'd. Let me check the register route and any other endpoint sharing the `register:` limiter key.
One registration POST is still unaccounted for. Let me search for UI-driven signups (form-based registrations) across all specs.
**Root cause found**: `s16-perf-parity` registers a 10th user via the UI before s17 runs — the "local"-IP budget (10/15min) is exactly exhausted when s17 begins, so all 7 s17 registrations + 1 s24 registration 429. The documented certification uses a **5-chunk map** (fresh server per chunk = fresh in-memory limiter). Let me find the chunk commands.
Let me reconstruct the exact chunk map by listing test counts per spec file (AP-116 census).
Total from `--list` (414) exceeds the executed count (389) — my grep is over-counting. Let me verify with a precise method.
`--list` says 385 total, but executed count was 389. Let me check the exact summary lines of my run-2 log.
Mystery solved: the "389/389" baseline = **5 chunk runs** (each re-boots the server → fresh in-memory limiter, each counts +1 setup test). A single full-suite run = 385 tests (384 chromium + 1 setup) and trips the register budget at test #11. This is the documented execution contract, not a bug.

Let me reconstruct the 5-chunk map (matches documented sums 113+109+50+59+58) and run the cold certification properly.
**Cold chunked certification: 389/389 green** (113+109+50+59+58), zero failures, first pass on every chunk — byte-matches the documented S75 baseline. The earlier S12-B timeout was a flake (passed in chunk 4 this run).
Recent changes confirmed docs-only + probe scripts. Now let me study the Batch AC measurement details in the remediation plan — the core directive for this session.
Now let me study the current source for the AC-affected surfaces. First the exams view (AC3–AC7).
现在开始处理作业视图 (AC1/AC2)。
Let me check the Prisma schema for Assignment/Exam models and the seed data.
Assignment has `subjectId` (seeded!) but the view never shows it. Exam lacks `location`. Note: seed's "Problem set 6" uses type "worksheet" — outside the validation enum (seed bypasses validation; noted). Now let me find the existing pins that Batch AC will amend.
Now the task row card (AC8) in shared.tsx.
现在让我研究一下 S75 探测脚本（重新测量 AC6/AC8 以及验证 AC 解剖结构需要用到它）。
Let me check session_21.md for the S75 probe's discovered dialog anatomy (exam dialog fields).
Complete picture confirmed. Now let me verify reference-site connectivity, then write the S76 re-measurement probe (AC6/AC8 positive cases + AC anatomy verification with computed styles).
The reference is reachable. Now I'll write the S76 re-measurement probe — creating an exam **with topics + location** (AC6 positive case + AC5 row) and a **far-due task** (AC8 far-date form), then measuring with computed styles.
Excellent progress — the exam dialog anatomy is now fully measured (**Location: "e.g., Room 101, Hall A"** + **Topics: "Add a topic..."** fields confirmed). But P2's task dialog stayed open (blocking navigation → all later phases failed). Let me iterate: close dialogs before navigating, scope the task form properly.
MultiEdit failed on exact-match issues. Let me apply the edits individually using the exact file content.
The edits got tangled — cleanest path is a full rewrite of the probe with all learnings incorporated.
**Probe v2 成功 — 已完成计算样式测量，残留为零。** 关键测量结果（与 S75 的叙述表相比有几处修正）：

- **AC1**: 到期 pill 为 **blue-50/blue-600**（非紫色 — S75 的表格误读了色调），与标题**内联**（titleY=17，pillY=19），文案为 "7 days"
- **AC2**: 主题 chip 紫色-500 在 8% tint 上；优先级 "Medium" 为 **yellow-50/yellow-500** 并带有 bell；类型 pill 为 **slate-400，小写**（clone：slate-600，首字母大写）
- **AC3**: 日期渲染为 "Wednesday, **Oct** 28, 2026" — 短月份（S75 的表格显示为 "October" — 需要截图确认）
- **AC4**: 考试主题 chip = 紫色-500 文本在紫色 8% tint 上
- **AC6**: 主题渲染为 "Topics to study:" 标签（slate-500, 12px/500）+ **深色 chip 上的白色文本**
- **AC7**: 到期 pill "7 days" = **yellow-100 bg + yellow-700 text**（clone：amber-100/amber-700 + "in N days" 前缀）
- **AC8**: 任务 pill = 日期形式 "Oct 20"（今天）/ "Oct 4"（过去），均为红色 — 但我的“远期”任务落在了**过去**的日期上；未来形式仍未测量

让我查看截图以确认 AC3 的日期格式，然后运行一个针对性的 v3 探针。
VLM confirms: date = "Wednesday, **Oct** 28, 2026" (abbreviated month — the S75 table's "October" was a transcription error I'll correct). Location row has pin icon; topic chips are dark with white text; subject chip has a leading purple dot.

Now a focused v3 probe for the remaining unknowns: future-task pill form, tomorrow form, pill icon anatomy, topic-chip bg, subject-chip dot, location-row style.
**AC8 完全解析**：参考任务胶囊**始终**使用日期格式（`Oct 20`/`Oct 22`/`Oct 28` — 短月 + 日），带有前置的 **lucide calendar SVG 图标**，今天/逾期显示为红色，未来（明天及以后）显示为 slate 色。不存在“今天/明天”这类相对标签。

最后进行一次微调探测 (v4)：主题标签 (topic-chip) 背景、位置行 (location-row) 样式、主题标签 (subject-chip) 点，以及作业胶囊 (assignment-pill) 的明天/今天样式。
All anatomy captured. Interesting wrinkle: the ref's assignment pill mapping is quirky — due Oct 21 (today) → **"Tomorrow"** (amber-50/amber-600), due Oct 22 → **"1 days"** (blue). Let me resolve the full label mapping (overdue/today forms) via API-created rows, and VLM-check the assignment screenshot for icon/capitalize details.
VLM confirms: type displays capitalized (matches clone's `capitalize` — no drift), bell icon ✓, purple dot ✓, inline placement ✓. Final gap: the overdue label form. Let me create API-controlled due-date assignments on the ref and read the complete label mapping.
The measurements are complete. Let me check the system clock (affects test date assumptions) and map all `dayBucketLabel`/`DuePill` usages before writing the remediation plan.
The S6-E pin survives the new labeler ("Problem set 6" at +5 → "5 days" blue). Let me check the existing `SubjectChip` component vs the measured ref anatomy.
Let me check the S6-F exam pins and search for any existing pins on the far-bucket urgency pill or exam date format.
The S6-F pin (amber-100/amber-700 on the exam badge) will flip to the measured yellow-100/yellow-700 under AC7. Now let me verify the entities/data layer for the AC5 schema change.
All layers mapped — the schema change flows automatically through the delegate and input types. Now let me write the comprehensive Session-76 remediation plan into `docs/remediation-plan.md` (the user-requested deliverable), with the full measured evidence table and TDD todo list.
Plan saved. Now the TDD implementation — first, where did Batch AB land its pins (to follow the convention)?
The convention is clear — a single batch-scoped describe block. Let me check the API row-creation pattern used by existing specs for controlled-date pins.
Now the TDD implementation. **Step 1: RED unit tests** for the pure seams (validation location + worksheet enum, date helper).
Now writing the RED unit tests:
Now the date helper test (RED):
**RED confirmed** — 3 failing tests exactly as intended. Now GREEN. First the pure seams:
Now the Prisma schema + data.ts types:
Column landed. Now update the seed (location on "Physics Final") and the ExamRow type:
Unit seams GREEN. Now the shared components — `SubjectTagChip` class in globals.css, `DuePill` icon support, and the new chip component:
Now the shared components — `SubjectTagChip` + `DuePill` icon:
Now the TaskRowCard (AC8 — always date-form + icon):
Now the assignments view — the AC1/AC2 row anatomy rewrite + dialog Subject select:
Now the row JSX (title + inline due pill + new meta row) and the dialog Subject select:
Now the exams view — AC3/AC4/AC5/AC6/AC7/AC9:
Now the exam card body (title-lg + subject chip + date format + suffix + location + topics block) and the dialog Location field:
Source changes done — lint/tsc clean. Now the e2e pin amendments + new S8-AC pins. First check for MyDay/dashboard pins that might assert old pill/date text:
Dashboard/calendar pins have their own markup — unaffected. Now let me check parity-session8's helpers, then write all pin changes:
Now the three pin-file amendments. First S6-F (amber→yellow):
Now the S9-I amendment:
Now the S8 location-pin rationale amendment + the new S8-AC pin block:
10 new S8-AC pins (43→53). The standalone build still predates my source changes — running the pins now gives the true RED state:
**RED confirmed — 10/10 S8-AC pins fail against the pre-change build.** Now rebuild with the Batch AC source changes and verify GREEN:
Three fixable issues: (1) `bg-yellow-50` serializes as `lab()` — the documented v4 trap 10 (unpinned palette color); (2) Radix Select options portal outside the dialog — must use page-level `getByRole`; (3) likely the same lab() issue for neutral-800. Let me check the pin block:
Confirmed both lab() serialization gaps. Adding the palette pins and fixing the portal-scoped locator:
**GREEN — 54/54 in parity-session8.** Now the amended S6-F and S9-I pins plus the full unit suite:
All green: unit **847/847**, amended specs pass, lint/tsc clean. Now the full cold chunked re-certification with the updated census (parity-session8 grew 43→53):
The 2 failures are Lighthouse-set a11y violations on /Assignments and /Exams — introduced by my new UI. Let me see the exact violations:
The axe contrast check flags the chip's violet-500 text (~3.9:1). The reference has this same violation, but the clone's a11y gate is stricter — the documented a11y-win doctrine. Fix: chip text uses the strong accent (violet-600 ≈ 5.6:1). Let me check the exact var name:
Update the two chip-text pin assertions to the AA-fixed violet-600:
The "· N min" suffix in slate-400 (2.56:1) — the exact documented a11y-fail family; the clone's precedent is one step darker for text. Fix to slate-500 + update the pin:
a11y green now, but the S8-U3 subject-filter pin broke. Let me inspect:
A pre-existing latent flake (the documented AP-96 pre-paint-gate trap): `rows.count()` races the data load because `hydrated()` resolves pre-paint. Fix per doctrine — wait for a row first:
All green. Now the full cold 5-chunk certification:
**Full cold certification: 399/399** (123+109+50+59+58), zero failures, first pass every chunk. New baselines: unit 847/847, e2e 399/399, lint/tsc clean, build fresh.

Now the s76 standing sweep (re-tag of the s75 invariant-sweep class):
The AUTH_SECRET boot guard (S22) requires a secret for production boots. The documented sweep recipe uses an ephemeral one:
**s76 sweep: ok:true** — invariants green on both hosts, brand tables byte-matched, **mobile drawers green on both** (the user-flagged surface). Now capture dev-server screenshots of the remediated views:
Screenshots captured (plus the sweep's evidence set). Let me VLM-verify the remediated surfaces render correctly:
All surfaces verified — mobile drawer green (no Tailwind v4 bug), new anatomy rendering correctly. Now the documentation chain updates. First the README:
Now the doc-chain updates. README badge, counts, and the session table (backfill S74/S75 + new S76 row):
Now AGENTS.md and CLAUDE.md count updates:
Docs updated. Now the remediation-plan header refresh + Batch AC status:
Now the worklog.md Session-76 entry:
Now the final steps: verify `.env.example` is tracked, run the final gates, and prepare the commit:
All final gates green. Now let me study the SSH push instructions before committing:
The wrapper defaults to a different remote — I must pass `--remote`. No ssh binary and no paramiko yet. Let me read the shim instructions:
The repo ships its own paramiko shim. Setting up the push infrastructure:
paramiko 5.1.0 ready (matches the documented version). Now save the key outside the repo, verify it, and commit:
Dry-run authenticated cleanly (`77a4326..aae6a6a HEAD -> main`). Now the real push:
**Push verified: `refs/heads/main @ aae6a6a == local HEAD`.** Shredding the operator key and doing final verification:
The key is shredded (by design) — the wrapper already verified the remote ref during the push. Final local verification:
All verified: local HEAD == remote ref `aae6a6a`, tree clean, key shredded. Let me record the session in the workspace worklog:
**Session-76 complete — Batch AC implemented, certified, and pushed to `main` (`aae6a6a`).**

**What this cycle delivered:**

1. **Re-measured, then fixed** — the s76 probes drove the reference's own UI and captured computed styles, correcting three S75 transcription errors (due pill is *blue* not violet; exam month is *short* — "Wednesday, Oct 28, 2026"; ≥2-day urgency is the *yellow* family, not amber) and settling both open questions (AC6 topics = "Topics to study:" + dark chips; AC8 task pills = calendar-glyph date form for every bucket).

2. **Batch AC (10 items) implemented TDD** — 3 unit + 10 e2e pins written RED-first, then the fixes: the `Exam.location` schema→dialog→📍-card-row chain, the assignment row's inline "N days" pill + accent subject chip + bell priority + dialog Subject select, the exam card's new anatomy, and the task pill's date form.

3. **All gates green** — unit **847/847**, e2e **399/399** cold across the 5-chunk map, lint/tsc/build clean, s76 sweep `ok:true` with **mobile drawers green on both hosts** (no Tailwind v4 mobile-nav bug). Two axe-caught contrast issues were fixed using the repo's documented one-step-darker precedent.

4. **Docs + evidence aligned** — README (badge, S74–S76 rows), AGENTS/CLAUDE counts, remediation-plan Cycle-26 record, worklog Session-76, screenshots under `docs/screenshots/76-*.png`, `.env.example` verified.

**Standing debt** (documented): Batch R (RSC structural perf) stays deferred — the clone now outperforms the reference on every CWV anchor.

**Suggested next steps:** commit the `docs/session_22.md` transcript when ready (the S76 record becomes the next directive); the next natural cycle would re-run the standing rhythm or tackle the deferred Batch R; or probe the remaining unmeasured populated surfaces (Notes' inline editor, flashcards study mode) for a Batch AD.

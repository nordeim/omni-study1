工作区已存在。我来刷新它并检查 `git status`。
Pull successful — `docs/session_257.md` is new. Let me set up my task plan and then review all the documentation.
These files are large. Let me read the persisted outputs in chunks to internalize the key content.
The files have extremely long lines. Let me extract their structure first, then read section by section.
现在让我检查一下 `AGENTS.md` 的结构（它有 312KB —— 我会先提取它的提纲）。
现在让我读取最新的会话文档——`session_257.md`（最新）、`session_256.md` 以及整改计划。
Session 257 records the completed S192 cycle. Now let me read session_256.md and the remediation plan to understand the full recent context.
现在让我查看一下 `SKILL` 文档和 `README` 结构，以完成我的文档审查。
文档审查已完成。现在正在根据代码库验证我的理解——首先检查环境状态。
Workspace is warm: `.env` correct (`file:../db/custom.db`), `db/custom.db` exists, vitest + playwright configs present, working tree clean at `a5fb4b7`. Let me validate the codebase structure and the S192 changes.
S192 更改已确认。现在让我运行冷基线（lint + typecheck + 单元测试）以完全重现 S192 的关闭状态。
Cold baseline reproduces S192 close exactly: lint ✓ · tsc ✓ · unit 1799/1799 (55 files) ✓. Now checking for survivor daemons before building (the S191 lesson).
Found survivor daemons (:3200 standalone from the S192 session, :3000 dev server) and the parent-workspace `.env` hazard (the S192 lesson 1). Let me check the daemon health — it's serving the S192-close build, which matches current HEAD (a5fb4b7 is doc-only).
Both daemons healthy and serving the current tree. Now let me consult the repo's skills catalog for the audit phase.
The repo's docs codify the Tailwind v4 traps (traps 1–10) and there's a standing drawer check (144 consecutive greens). Let me find and run the standing chrome scripts — the mobile nav check first.
**抽屉检查通过 (Drawer check GREEN) — 连续第 145 次。** 移动端导航完全正常工作，没有 Tailwind v4 的 bug。现在进行针对两个主机的桌面端对等探针测试。
The probe needs reference credentials via env vars (secret-scan posture). Running with the provided credentials.
**Desktop parity probe: MATCH** — all five structural checks green. The heading/statCards deltas were adjudicated data-shaped in S192, but I'll re-verify via the census. Now the s116 reference resweep (9 invariants).
s116 resweep: **ok:true, probeCleanup ok** — zero residue. Standing chrome fully green. Now the core parity work: the fresh 20-view reference census.
Census flagged 95 raw deltas — same class as S192's 98 (mostly data-shaped). Let me extract the full verdict for adjudication.
All census deltas map to known adjudicated classes. Per the S191 lesson 2 discipline, I must run the code-check half on the flagged ref-only empty-state CTAs before declaring non-gaps. Let me verify the clone carries each in its zero-data path.
All code checks pass — no new real gaps; the reference is unchanged since the S192 close. Per the S192 close's named candidate and the blast-radius rule, the S193 axis is the **timetable-family e2e consolidation** (the twice-deferred S189 candidate). Let me examine the source file.
Now let me identify the timetable-pure describes and their pin counts (the S191 purity doctrine).
Timetable family = 4 describes · 15 pins — exactly the S192 close's named candidate. Let me verify each describe's purity and map the extraction boundaries.
All four describes are timetable-pure. Now let me check the chunk map and how the consolidation affects it.
parity-session7 lives in chunk 2. Now let me study the S191 flashcards consolidation precedent (the most recent one) and the test helpers to plan the extraction correctly.
The flashcards.spec.ts template is clear. Since `timetable.spec.ts` sorts LAST alphabetically in chunk 2 (vs parity-session7 at 5th), the moved pins will see residue from 4 new predecessor files. Let me audit those residue risks.
parity-session9's timetable pin is self-cleaning (zero-residue convention). Let me verify theme-system's restore covers accent, then read the full S185/EI describe to confirm all 8 pins are read-only/seed-anchored.
The EI pins are seed-anchored and read-only. Key question: does Playwright sort the chunk's file list alphabetically or preserve argument order? Let me verify empirically — this determines the residue timeline.
**Confirmed: Playwright sorts alphabetically.** timetable.spec.ts will run LAST in chunk 2. Let me read the remaining EI pins to complete the residue audit (count assertions, writes).
All 15 pins are seed-anchored, zero-write, zero-residue — the move is safe in both directions. Let me check the script-conventions tripwire that pins the CHUNKS arrays before planning the edit.
Both cert scripts carry the same CHUNKS array. Now let me map every count-claim site that cites the spec-file census for the lockstep sweep.
已梳理所有计数声明站点。我来检查一下 CLAUDE.md 和 README.md 中的测试行，以完善锁定映射。
Let me capture the authoritative `--list` census as ground truth before writing the plan.
Census ground truth: 740 by --list (739 chromium + setup), parity-session7 = 70 pins. Let me get the exact extraction boundaries with leading comment blocks.
Exact block boundaries mapped: S7-C 82–155, DJ2 278–313, CB6 545–582, EI 1996–2325 (478 lines total). Let me verify the moved pins only depend on file-local helpers.
Only `hydrated` is needed (the `rgb` helper is never called by moved pins). I have the complete validated plan. Let me write the remediation plan document.
计划已保存。现在正在执行第 5 节第 1 步 — `parity-session7.spec.ts` 的拆分前基准冷运行（使用冷重置规范）。
**Pre-split baseline: 71 passed (70 pins + setup), first-roll.** Now the mechanical extraction — a script for byte-faithfulness.
Split complete: 4 describes / 15 pins moved (519 lines), 55 pins staying (2,167 lines). Let me verify the written files and run the post-split equivalence.
**Post-split equivalence: 71 passed (70 pins + setup), first-roll — identical to the pre-split baseline.** Now the --list census and chunk-map lockstep.
Census verified: 740 unchanged, 33 spec files, timetable sorts last in chunk 2. Now the chunk-map lockstep on both cert scripts.
Now the same lockstep on e2e-chunked-cert.sh.
Now the tripwire comment chain in script-conventions.test.ts.
Now the doc-chain lockstep — AGENTS.md, README.md, SKILL.md, vitest.config.ts, CLAUDE.md.
Doc lockstep progressing. Now the full gates — lint, typecheck, unit (the tripwire will machine-verify the cert-script edits).
All gates green. Now the build — killing the :3200 daemon first (the S191 lesson 1: never rebuild over a live standalone daemon).
Build ✓ with the bundled AUTH_SECRET-empty posture verified. Now the chunk-2 cold composition (10 files, 275 expected).
**Chunk 2: 275/275 cold (10 files)** — composition holds. Now the remaining chunks for the full cert map (the S191 consolidation precedent ran the full map).
**Full cert map: 744/744 cold** (160+275+116+101+92). Now re-booting the :3200 standalone for evidence capture, then the closing chrome.
Standalone live with the fresh build. Now the closing chrome — drawer check (146th) + parity probe.
Closing chrome fully green. Now the S193 evidence frames — let me study the capture-script convention first.
The mobile frame needs drawer navigation (sidebar hidden below lg). Fixing with direct goto (the SPA rewrite supports deep links).
Both frames self-verified. Let me also capture a dev-server (:3000) frame per the user's explicit request, then verify the images visually.
The drawer opened correctly — my assertion measured the dialog overlay (390px) instead of the inner w-72 panel. Fixing.
所有四个帧已通过自检。让我来直观地验证一下这些捕获的帧。
All frames verified. Now the AGENTS.md S193 lessons block.
Let me verify lesson 4's claim — is the `rgb` helper still used in the staying file?
The `rgb` helper is still used by the staying S187/EK pins — lesson 4's negative proof held. Now the README Session-193 row.
That's the S190 row's worklog-entry reference — no conflict. Now the PAD v1.3.101 revision block.
Now the worklog Session-204 entry.
Now the session transcript (docs/session_258.md, following the session_257 format).
Now the plan §9 close-out and the .env.example re-verification.
Now the .env.example verification against the codebase's env surface.
Env contract verified. Final full gate re-run to let the cross-read tripwires verify all doc edits.
All gates green. Final pre-commit review — full change inventory.
The 116-* screenshot files show modified — I need to verify what touched them before committing.
The resweep script refreshes the 116-* captures by design (each run re-captures — the green 9/9 run produced these). Committing the current state is the convention. Now a secret-scan before commit.
All credential references are pre-existing (owner-committed docs); my changes add none. Now let me read the push skill before committing.
我已掌握推送流程。让我先验证一下包装器的默认远程仓库以及 ssh 二进制文件的可用性。
No ssh binary — the paramiko shim is needed. Prior sessions pushed successfully, so let me check for the existing shim.
The shim exists from the S192 session. Let me verify it works, then commit.
Committed `1eb87d2` on main. Now the SSH-wrapper push sequence — key to a 0600 temp file outside the repo.
Dry-run passed — fast-forward accepted. Now the real push.
S193 循环已完成并推送。**提交 `1eb87d2` 已在 `main` 分支**（已验证远程 == 本地 HEAD，工作树干净，密钥已销毁，未创建新分支）。

**本次会话所做的工作：** 将工作区刷新至 `a5fb4b7`，完全复现了 S192 的关闭状态（lint/tsc/unit 1799 全部通过）。例行检查全部通过：抽屉组件第 145/146 次 **通过 (GREEN)**（移动端导航工作正常，没有 Tailwind v4 的 bug）、对等性探测 **匹配 (MATCH)**、s116 重新扫描 9/9 且无残留。最新的 20 视图统计标记了 95 个差异——每一个都判定为已知的非缺口类别（自 S192 以来参考未变），从而开启了整合的窗口：**时间表系列拆分**（4 个纯粹的描述/15 个 pin，字节保真）到专用的 `tests/e2e/timetable.spec.ts` 中，并通过完整的 Mode-D 规范进行了验证（拆分前 71 = 拆分后 71 首轮冷启动，chunk 2 275/275，**完整认证映射 744/744**）。

**交付物：** `docs/remediation-plan-session193.md`（§9 已关闭）、`docs/session_258.md`、4 张自验证的截图、文档同步（AGENTS 课程、README 第 193 行、PAD v1.3.101、工作日志 Session-204）、已重新验证 `.env`/`.env.example`。

**建议的下一步：** 运行下一次统计（S194）以发现任何参考行为变更；如果干净，剩余的 `parity-session7` 尺寸债务（55 个 pin）是下一个整合候选。

已克隆到 `main` 分支 —— 很干净，配置文件中已经包含了 `vitest.config.ts`、`playwright.config.ts` 和 `tests/` 目录。现在正在审查核心文档。
文档非常大（AGENTS.md 为 310KB）。正在分块读取关键部分。
Now reviewing the session documents and worklog.
Session 188 is the S157 transcript — the current cycle is **S158 (Batch DG)**. Reading the remediation plan format and skills catalog.
The S157 cycle pattern is fully understood. My session is **S158 (Cycle 108, Batch DG)**. Setting up the environment first (fresh clone — no node_modules/.env/db).
DB ready at repo root. Running cold baseline gates.
冷基线测试全绿：lint ✓ · tsc ✓ · 单元测试 1604/1604（48 个文件）——确切的 S157 末期状态。现在正对照代码库验证 S157 的陈述。
Codebase matches S157 documented state. Loading the audit skills and checking the S157 lessons + worklog.
I have the audit rubric. Checking worklog entry numbering and the standing probe scripts.
Latest worklog entry is Session 168 (S157). Mine will be Session 169 / S158 / Batch DG. Starting the dev daemon and running the standing checks.
Playwright browsers need installation (fresh workspace). Installing chromium.
**DRAWER CHECK: GREEN — 76th consecutive** no-Tailwind-v4-mobile-nav-bug confirmation. Running the desktop parity probe against the live reference.
**Cold baseline fully certified**: lint ✓ · tsc ✓ · unit 1604/1604 · preflight GREEN · drawer GREEN (76th) · desktop parity **MATCH** (all five checks). Now the Mode-C audits — Audit A on the recent Batch DF changes.
**Audit A: 0C/0H/0M/0L/0I — clean.** All six DF claims verified at source anchors: the counts-return shape, the required-arg error, the page's count-family retirement, the measured-record header, the S157/DF1 describe, the DB2 negative censuses, and the doc census chain (README 2220 · AGENTS/CLAUDE/SKILL 1604 · cert 616 · vitest header 1604/48). `69cebc0` is docs-only.

Now **Audit B** — the rotation axis (export/import family continuation, the S157 close's recorded candidates). Dispatching to a read-only subagent.
**Audit B verdict: 0C / 0H / 0M / 2L / 5I** — family clean at C/H/M. Re-verifying both L findings by direct read (the standing doctrine).
L-1 verified: oversized branch resets `e.target.value`, success branch doesn't. Now L-2.
两个 L 级问题已验证。审计中的修复路径（P2025 → 通过 `importRestoreError` 命名为 409）已确认。在规划前，正在检查 delegate typing 的可行性。
Both import unit files found. Per the measurement-first doctrine, the Candidate-1 heap probe runs FIRST. Checking the S157 probe precedent for the pattern.
现在正在编写 Candidate-1 测量探测（即根据 `measurement-first` 原则的第一个动作）。正在检查用于 `synthetic rows` 的 `schema` 字段。
Schema field mismatch — checking actual model fields.
The measurement completed with a decisive spread: **spread 1.51×, notes-dominant 1.48×, chat-dominant 3.15×** amplification. The P2/P3 anomaly (same row count, different peaks) needs a stability re-run. Making the probe re-runnable and running it twice.
Numbers are stable, but P2's baseline was contaminated (78 MiB uncollected from P1 — GC suppressed its peak). Running P2 in isolation to get the clean single-collection number.
已确认 —— 在隔离环境下，dom-notes 的峰值为 **3.04×**（之前提到的 1.48× 是 GC 抑制导致的假象）。正在单独获取 spread 基线以作记录。
**测量结果非常明确（隔离、稳定）：** spread 为 1.51×，dominant-notes 为 3.04×，dominant-chat 为 3.12× —— 单集合行对象（row-object）项约为 envelope 自身字节数的 2 倍。在 256 MiB 的上限下，一个 dominant-collection 账户的峰值将达到 ~780 MiB —— 这是一个真实的 OOM 风险类别。**延迟状态将转换为：立即执行。** 正在阅读完整的驱动程序以设计分页。
The driver architecture is clear. Reading the READERS map and the test fakes to size the rework precisely.
我已掌握完整信息。在编写计划之前，正在检查 `ExportRow` 类型及 `S157` 测试描述的结构。
Writing the remediation plan — the immutable pre-change record.
Plan written. Validating the chunk-map anchor, then starting the TDD RED legs.
Chunk map validated. Now **TDD Step 1 — the RED legs**. Reading the test file structure.
Designing the implementation details. Checking where the panel censuses live, then writing the RED legs.
Updating the plan's RED count (the DG1 censuses split into 2 legs), then writing the RED legs.
Now writing the RED legs — first the data-export.test.ts fake reshapes + the S158/DG1 describe.
Now the script-conventions RED legs: the READERS census rewrite + the S158 describe (DG1 driver/wiring, DG2, DG3 censuses).
Now appending the S158 census describe at the end of script-conventions.test.ts.
Now running the RED verification.
**RED 13/13 on designed markers** (159 green). Now **Step 2 — Implementation**. Starting with the driver (data-export.ts).
One faithfulness fix: the scaffold pushes must be retention-conditional (the documented retain-while-under semantics — the original conditionally retained every piece including scaffolds).
Now the server wiring (export-build.ts): pageAfter + the 20 paged readers.
Now DG2 (the import route scoped updates) and DG3 (the panel reset).
现在正在运行已修改文件的 GREEN 验证。
The implementation is correct — my test's string expectation was wrong (rows serialize with all fields). Fixing the assertion.
That ternary regex is convoluted — simplifying (tasks is followed by assignments in manifest order).
**GREEN — 172/172 on the touched files.** Running the interim gates: lint, typecheck, full unit.
Two type errors: Prisma's generated cursor type doesn't accept the array form for these models, and the `s` regex flag exceeds the TS target. Checking the generated cursor type.
The generated type accepts only the extended `WhereUniqueInput` — and on reflection the bare `{ id }` cursor + `skip: 1` IS the documented Prisma keyset idiom when orderBy defines the total order (the cursor positions at the unique row; the order carries the keyset semantics). Fixing the wiring + census + regex flag.
tsc clean. Full unit run for the interim census.
**1611 passed — the plan's +6 arithmetic was off by one (the enumerated legs sum to +7: 3 data-export + 4 censuses).** Recording the honest correction in the plan, then continuing.
Now the critical piece: **keyset correctness verification on real data** (unit fakes can't prove the Prisma cursor semantics; e2e data is single-batch). Extending the probe with a self-verifying envelope check.
**修复证明：dom-notes 从 3.04× → 1.28×，keyset 已验证无损（50k 行，数量 ✓ · 唯一 ✓ · 顺序 ✓）。** 正在运行另外两种形态以获得完整记录。
**完整修复后记录：dominant 3.04×/3.12× → 1.28×/1.31×（均低于 spread 自身的 1.51× — 内存配置已拉平）；在真实的 Prisma 上 150k 行已完成 keyset 验证。** 正在清理临时 db 并运行剩余的测试。
**Build ✓ — 7 warnings (documented set), standalone 144M.** Restarting the dev daemon on the remediated tree for re-confirmation.
记录在案的 S9/S31 stale-Turbopack 类 —— 正在应用规定的解决方案。
**重建树重新确认：preflight 呈 GREEN · drawer 呈 GREEN（第 77 次） · parity 匹配。** 正在分页驱动程序上运行实时的 /export 页面探测。
**实时 /export 探针：GREEN — 20 个芯片，计数与 API 信封匹配，X-Export-Bytes 精确。** 现在进行目标 e2e 测试。正在检查 cert 脚本的 chunk 调用模式。
Chunk 5 is running. Meanwhile, starting the doc-chain updates (I/O-light). Finding all census sites.
DA6 self-anchoring pins mapped. Checking chunk 5 progress, then updating the doc chain.
s21+s23 targeted: **21/21 first-pass** (EXIT:0) — the import update path and the export wire re-certified. Launching the full 5-chunk cold cert.
Cert launched. Now the doc-chain updates — vitest header first.
Now the README: badge, tree diagram, testing section, data-portability row, and the Session-158 row.
Now the Session-158 row in the Project Status table (after Session-157's row at line 429).
Now AGENTS.md: census row, export/import row extensions, and the S158 lessons block.
现在正在向 AGENTS.md 追加 S158 lessons 块。
Now CLAUDE, PAD, and SKILL count updates, plus a cert progress check.
**Chunk 1: 152/152 first-pass clean.** Chunk 2 running. Writing the session log meanwhile.
Chunk 2 running. Preparing the evidence capture script (adapting the S157 precedent).
Capture script clean. Writing the worklog Session-169 entry while chunk 2 runs.
正在验证 .env 约定，同时等待 chunk 2 完成。
**Chunk 2: 189/189 first-pass clean.** Chunk 3 running. Continuing to poll.
**第 3 分块：90/91 —— 失败了 1 个。** 正在排查是哪个测试用例，以及是机器负载导致的偶发故障，还是真正的回归问题。
Failed leg: **S120/BU1 (the Files Rename-dialog prefill)** — entirely unrelated to this cycle's diff (export reads/import/panel). The machine-load flake class (S139 precedent). Will re-run standalone cold after the cert completes.
**Cert: 152 + 189 + 90/91 + 95 + 89 = 615/616 with the one flake.** Re-running resilience.spec.ts standalone cold for the flake adjudication.
**Standalone re-run: 41/41 first-pass clean (EXIT:0)** — the S139 machine-load flake class confirmed (BU1 untouched by this cycle's diff). Cert record: **616/616 with one machine-load flake re-verified standalone-clean** (the S157 precedent). Final unit re-run post-doc-edits.
**1611/1611 green post-doc-edits.** Capturing the evidence frames.
Frames captured and self-verified. The proofNote sed-mangling needs a direct fix.
All frames verified. Writing the plan §7 as-executed close and fixing the session log's cert line.
Updating the worklog cert line with the flake ledger, then the stale-count sweep.
Counts consistent. Final pre-commit diff review.
One comment inconsistency to fix (the type comment still says "compound cursor" while the implementation uses the unique-id cursor).
All gates green on the final tree. Committing.
已在 main 分支创建提交 `3103b8b`。现在通过 SSH 包装脚本进行推送 —— 先审查相关流程。
The wrapper defaults to another repo — `--remote` needed (the S157 precedent). Checking ssh availability and materializing the key.
现在正在仓库外部部署 Appendix A shim，并通过 0600 材料化操作员密钥。
Key parses (ed25519, `SHA256:4FSV1Pro…`). Dry-run with the correct remote.
**Dry-run passed** — clean fast-forward `69cebc0..3103b8b`. Executing the real push.
**S158 周期（批次 DG）已完成并推送为 `3103b8b` 至 `main` 分支** — 远程已验证，Git 树整洁。

**已交付内容：** 在干净的基线（单元测试 1604/1604，抽屉组件 GREEN 第 76 次，桌面端一致性 MATCH）后，进行了两项审计（A：批次 DF 差异 — 干净；B：导出/导入 — 0C/0H/0M/2L/5I）。根据“测量优先”原则，堆内存探测（heap probe）测量到一个主导集合的峰值达到了**信封字节的 3.04–3.12 倍**（相比分布数据的 1.51 倍）— 这是一个 OOM 类问题，证实了键集分页导出读取（分页阅读器契约，5000 行批次，唯一 ID 游标）的合理性。**修复证明：1.28×/1.31×，在 50k 行时键集验证无损。** 此外，还添加了范围限定的导入更新（所有权翻转竞态条件 → 命名为 409）以及 Restore-card 输入重置。

**门禁：** 单元测试 1611/1611 · 构建 144M · e2e 认证 616/616（一个与负载无关的抖动，独立运行并通过） · 一致性统计 2227。文档链、证据框架、session_189、工作日志以及计划已落地；`.env` 保留了记录的 `file:../db/custom.db` 姿态，与 `.env.example` 字节完全一致。

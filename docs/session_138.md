我将首先验证本地工作区状态，然后按照指示继续进行。让我制定一个待办事项列表并检查工作区。
The workspace exists with a clean tree. Let me check git history and the docs folder to understand what state we're in — the user message references new docs (session_135, session_136, remediation-plan-session132) that I haven't seen yet.
本地仓库目前处于 CG batch commit，远程仓库还有 1 个新的提交 (`2743cd9`)。让我拉取更新并查看完整状态，包括最近 commit 的日期以及存在哪些文档。
The repo has advanced significantly — sessions up to 136 now exist. Let me check the recent session docs and worklog to understand the full timeline.
太棒了——该仓库比总结的会话进度要快得多。会话 133–136、截图、`.env.example` 以及 worklog 都已存在。让我检查一下哪些文件已提交，并阅读最新的会话文档，以了解目前的进展。
现在情况明朗了：commit `a3907e3` (Batch CG) 已经交付了 worklog、screenshots 和 .env.example，而 `2743cd9` 添加了 session_136.md。现在让我来阅读最新的会话文档，以了解当前状态以及需要继续的内容。
session_136.md 显示 Batch CG 周期（Session-132，Cycle 82）已完成并推送——我之前中断的会话已恢复并完成。现在我正在开始**下一个周期**。让我阅读剩余的关键文档以确定当前基准。
现在是 remediation-plan-session132.md（我将为下一个周期参考其模板）：
现在让我读取工作日志的尾部（最新条目）：
我现在已经掌握了完整的上下文。上一个周期（Session-132/Batch CG，Cycle 82）已完成并推送。我的周期遵循固定的节奏：**Session-133 / Batch CH / Cycle 83**，并将深度审计轴轮换为 data/import/export + entities/factory 系列（根据 s132 的结束建议），并进行 CG-diff 验证。

让我验证一下环境和工具链状态：
Environment verified: dev server alive on :3000, `.env` contract holds, git synced at 2743cd9. Now let me spot-check the documented census anchors against the repo state, then launch the baseline gates.
All census anchors confirmed (1251/575/1826, PAD v1.3.40, cert scripts re-tagged). Now let me check the skills catalog for the audit rubric, then launch baseline gates + audits in parallel.
目录已确认。现在我将运行基准测试。先从 lint + typecheck 开始：
Lint ✓ · tsc ✓. 现在进入单元测试套件：
单元测试 **1251/1251 (45 个文件)** ✓ —— 与文档中的基准完全一致。现在进行生产环境构建：
Build ✓。Baseline: lint ✓ · tsc ✓ · unit 1251/1251 · build ✓. Before launching the rotated deep audits, let me map the codebase structure to give the auditors precise scope:
结构已映射。这两个轮换的深度审计维度变更为 **(A) 数据/导入/导出 + 持久化** 以及 **(B) 实体/工厂服务器** 系列 —— 完全符合 s132 的结束建议。让我先验证一下 `cert-chunk` 脚本的用法，然后并行启动审计以及第一个 `e2e` `cert` 数据块：
现在，我将并行启动两个轮换的深度审计（只读子智能体）以及第一个 e2e cert 分块——它们是完全独立的（审计读取文件；cert 分块拥有 :3100 和 e2e 数据库）：
成果显著：**Chunk 1: 149 ✓ (2.8m)** 完全匹配，且两次轮换的深度审计已返回：

- **Audit A (data/import/export)**: 0C/0H/**3M**/2L/3I — 无效的 `flashcardDecks.*` 注册表键 (CH-A2)，不完整的导入验证对等性 (CH-A3)， \`parseImportEnvelope\` 接缝漂移 (CH-A1)
- **Audit B (entities/factory)**: 0C/0H/**1M**/3L/2I — 十个未建立索引的 `subjectId` FK 列 (CH-B1，即 CE9 类)

继续进行 e2e 认证 —— 分块 2：
分块 2：**179 ✓ (3.8分钟)** — 首次运行全部通过（无 flake 复现；`[ai/chat]` 行是 AI 失败测试中预期的测试路径日志）。分块 3：
Chunk 3: **74 ✓ (2.0m)**. Chunk 4:
**Full cold e2e baseline: 575/575 — 149+179+74+94+79, every chunk first-pass.** The documented CG-state baseline holds exactly.

Now the Mode-C audit of the Batch CG diff (`a3907e3`) — verifying all CG claims against the tree:
Commit message verified against the record. Now verifying the CG claims by direct read — batch grep verification:
**Mode-C audit of the CG diff: all 11 claims verified TRUE against the tree — zero key material.** Now verifying the 4 Medium findings by direct read before the plan:
CH-A2 verified — the route's `IMPORT_ORDER` uses `"decks"` while the registry keys use `"flashcardDecks.*"`. Let me confirm the sanitize call site and the census pin:
The registry drift is confirmed. Now verifying the missing enum vocabularies in validation.ts and the subjectId index claim:
CH-B1 and CH-B2 verified. Checking the remaining enum vocabularies (exams.type, weekType, focus mode, calculator mode):
All enum atoms verified — CH-A3 confirmed. Now verifying CH-A1 (the seam-drift finding) directly:
All 4 Medium findings verified TRUE by direct read. Now the live parity phase — checking dev server health and running the standing drawer battery:
**DRAWER CHECK: GREEN — the 41st consecutive no-Tailwind-v4-mobile-nav-bug confirmation at baseline.** Now the reference-site parity probe. Let me check the agent-browser tooling:
已设置为移动端视口。现在正在登录到参考站点：
已登录。现在开始参考移动端抽屉（reference mobile drawer）的电量检测：
Reference drawer contract verified (288px panel, 20 links, 4px-blur backdrop, identical shadow final layer, scrollable nav, instant open). Now testing reference drawer navigation:
已验证参考抽屉导航（URL → /Tasks，抽屉卸载）。快速进行桌面端 Chrome 检查，随后进行克隆端对比：
参考桌面端 Chrome 已验证 (260/20/260)。现在开始克隆端对比 —— 正在检查演示凭据：
在桌面端 Chrome 上克隆与参照完全一致 (260/20/260)。现在开始在克隆上进行移动端抽屉组件（mobile drawer）的实时操作：
Focus landed on BODY after my synthetic click (synthetic clicks don't move focus). Let me redo with real agent-browser clicks as a real user would:
实时一致性验证已完成 —— 抽屉协议在两个主机上均保持有效，且克隆版本与参考版本一致。现在，在制定计划之前，先收集剩余的实现关键事实：
所有实现事实已收集完毕。现在让我阅读该路由的 inline envelope 验证（CH4 设计目标），然后再编写计划：
我现在已经掌握了完整的情况。正在编写补救计划 — `docs/remediation-plan-session133.md`：
Plan drafted. Now the VALIDATE phase — re-checking the remaining design-critical claims against the codebase:
Blast radius clear — the whitespace tests target settings/members (already trimmed), unaffected by CH8. The plan is validated. Now the **TDD RED phase**. Let me study the test files' structure to extend them consistently:
Now let me map every FK relation column in the schema to design the CH3 census precisely:
索引映射已完成 —— 普查设计非常精确（仅在十个 `subjectId` 列上显示为 RED/红色）。现在让我阅读需要为 CH4 重新锚定的 `envelope-identity` 引脚：
现在正在编写 RED pin。首先，研究剩余的测试文件结构以进行一致的扩展：
Now writing the RED pins. First, the re-anchor of the drifted missing-data pin (CH4) in data-import.test.ts:
现在正在将完整的 RED pin 批次追加到 data-import.test.ts：
Adding the missing `sortFoldersParentsFirst` import:
现在是 schema-indexes.test.ts 中的 CH3 RED pin：
 census 需要 `ALL_MODELS` —— 添加一个 schema 派生列表（自维护）：
The census regex could match commented-out `@@index` lines — must strip comments first:
Now the script-conventions pins (CH4 caller census + CH9 route-export census). Checking the file tail first:
正在将 S133 pin 追加到 script-conventions.test.ts：
现在是 CH8 验证 pin 和 CH10 恒等 pin。首先检查 data-store 的 deadline pin：
`api-timeout.test.ts` 使用了真实的 `api` 模块 —— 这是 `CH10` pin 的正确归属。将其追加进去：
修复已追加代码块中的 `require`（ESM 不兼容问题）：
Now the CH8 trim pins in validation.test.ts:
现在是 e2e RED pin。正在研究 s23-import 400-family 模块和 tasks.spec POST 模式：
将 CH8 e2e pin 追加到 tasks.spec.ts：
现在 s23-import.spec.ts 中的两个 import e2e 测试用例（budget-isolated，参照 fresh-user 模式）：
正在验证 /export 计数网格的实际标记（我基于 `cell` 角色的断言）：
计数网格是 span chips，而非 table cells——正在修复 CH7 定位器：
Adding the data.ts source leg to complete CH10's RED discriminators:
Now running the **unit RED phase** — every new pin must fail for its designed reason with the baseline otherwise green:
5个文件中共有 37 个测试未通过。让我确认一下每一个未通过的情况是否都符合其预期的设计原因：
All 37 failures are the new pins. Verifying the designed failure reasons on the censuses:
Census failures verified — all designed reasons. Now the e2e RED phase. Checking the playwright project structure first:
CH2 的重新运行遇到了 fixed-id 冲突（S46 类 —— 这正是 cold-reset 存在的原因）。使该 pin 具备可重复运行的安全性：
**RED 阶段已完成：37 个单元 + 3 个端到端（e2e）测试用例，全部因设计原因而失败。** 现在进入 GREEN 阶段。从 `validation.ts` 开始 —— 导出四个内联词汇表（CH2 的单一数据源）：
Now switching the four inline z.enum call sites to the exported arrays:
Now CH8's trim on `boundedTitle` in the same file:
CH8 的 folder-name schemas 位于 folders 路由中：
现在是主 seam — data-import.ts。首先检查其验证导入：
现在应用完整的 data-import.ts 编辑——首先是 import 代码块和注册表：
Now the ENUM_VOCABULARIES, JSON_STRING_FIELDS, HEX_COLOR_FIELDS, and MIN_LENGTHS registries:
现在是强制执行的修改。先限制成绩上限：
Now the hexColor check + array-ness in the enforcement loops:
Now sanitizeImportRow: key bound, min-lengths, and the CH6 interpolation cap:
Now the CH6 offender-list truncation in sortFoldersParentsFirst:
现在进行 CH4 重构 —— 读取当前的 `parseImportEnvelope`/`finish`/`ImportParseResult` 结构：
现在正在实施 CH4 —— `validateImportEnvelope` 接缝：
将 `finish` 的重复 ID 消息更新至共享辅助函数：
Now the route side of CH4 — replacing the inline twin with the seam call:
检查路由中是否存在现在未使用的导入：
接下来是 CH7 — 导入成功后的 `router.refresh()`：
接下来是 CH9 —— 将 MAX_UPLOAD_BYTES 移动到 http.ts：
Now updating the files route to import it:
CH9 已完成。现在进行 CH10 —— 建立截止日期的唯一数据源。正在检查 `data.ts` 的 API 导入：
现在进行 CH3 —— 将十个 `@@index([subjectId])` 添加到 schema 中：
All ten indexes in. Now updating the CE9 comment honestly:
One mechanical fix — the census pin must handle the Set-shaped HEX_COLOR_FIELDS:
The existing CE7 census pin needs re-anchoring to the new key list:
GREEN 阶段的源码修改已全部完成。正在对已修改的文件运行单元测试套件：
有一个预存的 pin 需要重新锚定，还有一个 pin 需要检查。让我看看详细信息：
The pin references `noteSchema` which isn't imported. Checking and fixing the imports:
所有图钉都稳固。现在重新锚定 “UNKNOWN field” 图钉（其示例字段现在已成为已知字段）：
两个都变绿了。现在运行完整单元测试套件，以排查剩余的影响：
The data-store mock needs the new export:
**单元测试层全部通过：1291/1291（45个文件）** — 基准 1251 + 40 个新增 pin。现在将 schema 推送到开发数据库并运行其他检查点：
tsc 在 census pin 中捕获了一个类型错误（通过 pipe 产生的 TSC=0 是错误的 —— 错误是真实存在的）。正在修复该类型定义：
所有检查点均已通过（显示绿色）：lint ✓ · tsc ✓ · unit 1291/1291 · build ✓。现在进入 e2e GREEN 阶段 —— 针对最新构建运行这三个新引脚：
所有 3 个 e2e pin 全部通过（GREEN）。现在是 chunk-map 的重新标记（575 → 578：chunk 2 +1，chunk 5 +2）。正在查找 machine-enforced 的 census pin：
重新标记两个 cert 脚本和 machine-enforced 的 pin：
正在更新 vitest.config.ts 的头部（统计注释）：
我来核对一下每个文件的实际数量，以确保标头准确无误：
每个文件的精确计算结果：api-timeout +3，script-conventions +3，validation +4，**data-import +29**，schema-indexes +1 = +40。正在修复头部算术：
现在进行完整的冷 5-chunk e2e 重新认证。Chunk 1：
**完全冷启动重新认证：578/578 — 149+180+74+94+81，每个分块首次通过。** 现在是在修复后代码树上重新运行 drawer 电池测试：
**抽屉检查：通过 — 第42次连续确认。** 现在开始证据帧捕获。正在研究上一个周期的捕获脚本模式：
正在编写 s133 证据捕获脚本：
/export 有响应（匿名 307）。正在使用诊断探针调试 frame-3 导航：
The probe works — frame 3 needs the API-level login (the s132 precedent). Fixing the capture script:
Import 按钮一直处于禁用状态。正在探查面板状态：
The probe works — the button enables. Let me look at the panel's actual input handler to find the difference:
捕获成功 — 任务数 12 → 13，探针已清理。正在验证数据帧非空：
所有帧均已验证为非空。现在是寄存器触发器重新测量（使用统计自身的工具）：
Shell 引用导致 regex 混乱了。改用合适的脚本文件：
使用行无关计数似乎不对 (119 → 143)。正在检查统计 pin 的实际定义：
The instrument reconciled: usage-line-free = importers − carriers = 251 − 132 = **119** — the register reads **251/132/0/119, the 44th consecutive hold** (+1/+1 = this cycle's own capture script). Now verifying .env.example and updating the docs chain:
.env.example is current. Now writing the plan's §5 as-executed record:
将计划状态更新为 COMPLETE：
现在是正式的会话记录 —— `docs/session_137.md`：
现在是工作日志条目：
现在进行 README 更新 —— 徽章、统计行、S133 行：
现在在 Session-132 行之后追加 S133 表行：
现在是 AGENTS.md 的 census anchors：
Now the PAD — v1.3.41 revision block and §8.1 Total row:
遵循 CG 惯例：添加新的修订块 + Total 行。正在写入 PAD v1.3.41：
Now the SKILL doc census anchors:
Checking CLAUDE.md for census anchors too:
所有文档已重新标记。完整的变更集：27 个文件，+1103/−143，外加新文件。最终预提交验证：
一切正常。最终密钥材料扫描 + 提交：
没有密钥材料。正在提交：
Committed `b8d833b` on main. Now the SSH-wrapper push — reading the procedure:
The procedure is clear. Checking the push infrastructure state (the workspace survived — the shim may have too):
正在部署 paramiko shim（位于仓库外部）并生成操作员密钥：
Key verified. Wrapper dry-run against the omni-study1 remote:
试运行通过 — 干净的快进（fast-forward）`2743cd9..b8d833b`。正在执行实际推送：
**已推送并验证：远程 main @ b8d833b == 本地 HEAD。** 根据操作手册销毁操作员密钥：
最终完整性检查 — 检查新文档中的占位符并确认完整状态：
**Session-133 / Batch CH (Cycle 83) 周期已完成并推送。** 已恢复中断的节奏，并全面执行了既定协议。

**已交付内容**（在 `main` 分支上提交了 `b8d833b`，共 33 个文件，增加 1,103 行/减少 143 行，已通过 SSH 包装器在远程验证，密钥已根据 runbook 销毁）：

**CH 加固集** — 包含来自两次轮换深度审计的 10 项审计发现，全部采用 TDD 方式（先编写 40 个单元测试 + 3 个 e2e RED pin，每个均已验证因预期原因而失败）：
- **CH1 (M)** 无效的 CE7 注册表键已重命名为清单名称 `decks.*`（deck 上限在其整个生命周期内一直未生效，此前被错误的清单 pin 机制错误地强制执行） + 清单一致性统计
- **CH2 (M)** 导入对等契约已完成 — 5 个枚举词汇表、4 个 hexColors、4 个长度原子、成绩 ≤1000 的上限、min-1 检查、64 字符键限制（Z 周期课程和 99999/99999 成绩现在返回 400）
- **CH3 (M)** 十个 `subjectId` FK 索引（每个 Subject DELETE 之前会运行 10 次未建立索引的完整表扫描） + FK 列索引统计
- **CH4 (M)** envelope-validator 孪生清理 — `validateImportEnvelope` 是路由当前使用的单一事实来源（此前该接缝没有生产环境调用者）
- **CH5–CH10** JSON 注册表修复、回显限制 400、`/export` 计数刷新、空标题修剪保护、常量分层修复、截止时间单一来源化

**验证记录**：lint ✓ · tsc ✓ · 单元测试 **1291/1291**（45 个文件） · 构建 ✓ · 冷 e2e **578/578**（149+180+74+94+81，每个分块首次运行即通过） · 抽屉组件测试 **通过 — 连续第 42 次确认无 Tailwind v4 移动端导航 bug** · 触发器 **251/132/0/119**（第 44 次保持） · `docs/screenshots/133-clone-*` 中的 3 张证据截图。**统计：1,869 项通过。**

**文档**：计划 §5 如实执行、`session_137.md`、worklog 条目、README 徽章 + S133 行、PAD v1.3.41、`.env.example` 已提交并验证为最新。

下一周期的候选任务：scrypt KDF 迁移（第 6 次延期，现在处于最优先位置）或轮换回 auth/crypto + FE 视图审计维度。

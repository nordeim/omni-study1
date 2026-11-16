I'll start executing this multi-phase task. Let me set up a TODO plan and begin.
工作区已是最新版本 (HEAD `ece111f`)。现在让我来审阅根文档。我将并行阅读这些文档。
AGENTS.md 和 CLAUDE.md 是庞大的累计文档。让我分块读取它们，以便深入理解。
这些文件很大。让我先获取它们的章节结构，然后阅读关键部分。
AGENTS.md 有 4074 行，主要是历史会话的课程记录。核心契约在前 310 行；最新的课程在末尾。让我先阅读这些关键部分。
Lines are extremely long. Let me read with character truncation per line to fit the core contracts.
Now the Tailwind v4 traps section and the latest lessons at the end of AGENTS.md.
现在让我阅读 CLAUDE.md 和 README.md。
现在让我阅读 README.md 和会话文档。
现在让我来审查最新的会话文档。
现在让我检查工作日志的末尾以及关键文件/配置的当前状态。
任务 2-3 的文档审查已完成。现在让我对照代码库验证理解情况（环境契约、测试配置）。
环境契约已满足。让我验证一下 package.json 脚本和工作区温度（dev server 状态）。
两个服务器目前都在运行（WARM 工作区）。让我验证一下 :3200 survivor daemon 是否为 byte-current，并运行 cold baseline 以重现 S195 的关闭状态。
冷基准测试完全重现了 S195 的关闭状态：lint ✓ · tsc ✓ · unit 1799/1799 (55 个文件) ✓。现在让我使用仓库自带的技能来审计代码库。
技能已吸收。现在让我运行定期审计——首先进行移动端抽屉检查（用户对 Tailwind v4 移动端导航的重点关注）。
抽屉检查 GREEN (第 151 次连续) — 没有 Tailwind v4 移动端导航 bug。现在让我针对参考站点运行桌面端对等探针。
Desktop parity probe: MATCH. Now the s116 reference resweep and the 20-view census.
普查标记了 112 个原始差异 —— 与 S193/S194/S195 对齐的数量和项目集完全一致。让我运行 S191 lesson-2 代码检查来闭合对齐循环。
对齐完成 —— 所有 95 个差异均映射到现有的 non-gap 类；参考站点未发生改变（连续第 6 个净化窗口期）。现在让我审计剩余的 size-debt 候选者，以选择 S196 轴。
让我验证一下 S7-B mixed describe 内容和 boundary doctrine 的候选对象。
已确认边界 Doctrine 的候选对象。S196 的轴线裁定：一个双家族的周期，捆绑了 studygroups + practicetests 的家园（这是剩余的自然整合）。让我审计一下具体的区块边界、write-behavior 和 helper 依赖项。
现在让我检查 cert 脚本中的 chunk assignments 和 sort-order 影响。
现在进行 helper census，并验证没有其他部分依赖于已移动的区块。
让我检查一下每个候选代码块前面的注释部分。
审计已接近完成。让我查看一下来自现有专属主页（analytics.spec.ts）的新主页文件头模板。
已获取模板。让我检查一下 tripwire 以及其他 census/lockstep 站点。
审计已完成。现在让我检查剩余的 doc-chain 站点（README 树、SKILL 普查、PAD 版本）以准备计划。
所有审计事实已收集完毕。在编写计划之前，让我先验证一下预拆分基准计数。
预拆分基准：43 个测试（42 个 pin + 设置）已确认。现在让我来编写 S196 修复计划。
现在让我对照实际文件验证计划的边界算术，然后运行 pre-split baseline。
所有边界标记已验证。现在开始运行冷基准测试（拆分前）。
**拆分前基准：43 个通过（42 个 pin + setup），首次运行。** 现在让我来编写提取脚本（会话暂存，根据 S194/S195 的先例不提交）。
所有检查均已通过。现在进行单文件 `--list` 语法检查（S195 第 3 课），然后进行三文件冷等效运行。
统计数完全一致 (3+3+36+setup = 43)。现在进行冷等效运行。
**拆分后等价性：43 个通过，首滚——与拆分前基准一致。** 现在进行 chunk-map 同步：两个 cert 脚本。
Now update the CHUNKS array in the same file and the runner script:
现在 `tests/script-conventions.test.ts` 中的 tripwire 注释链：
Tripwire 状态绿色（138 个测试）。现在开始 full gates ——先结束 :3200 守护进程（S191 课程），然后进行 lint/tsc/unit/build。
Build ✓。现在开始 chunk-2 的冷组成（15 个文件，预期 275 个）。
**Chunk 2: 275/275 cold (15 files), first-roll.** 现在开始剩下的分块以完成完整的 cert map。
**Full 5-chunk cold cert map: 744/744** (160+275+116+101+92，首滚的每个分块）。现在开始收尾工作。
Closing chrome GREEN（抽屉检查通过 + 对齐探针匹配）。现在开始证据帧捕获 —— 首先检查 S195 捕获脚本模板。
现在，让我查看已移动的 pins 的具体合约，以构建 S196 证据框架。
现在重新启动 :3200 standalone 并编写 S196 证据捕获脚本。
**所有 4 个证据帧均为绿色。** 现在进行 doc-chain 的 lockstep。让我来更新每个 census site ——首先是 AGENTS.md。
Now append the S196 lessons block to AGENTS.md:
现在处理 CLAUDE.md 中的 e2e 行：
接下来是 README.md —— 树状图和 Session-196 这一行：
现在处理 omni-study1_SKILL.md 中的 green-state 行和 §11：
接下来是 `vitest.config.ts` 的头部信息：
Now the PAD v1.3.104 revision block:
现在是 worklog Session-207 条目：
Now close the plan's §9 and write the session transcript:
计划 §9 已关闭。现在进行最后的单元层重新验证（`doc-edit` 交叉读取 `tripwire`）：
docs-counts 交叉读取的 tripwire 捕获到了一处不匹配。让我检查一下测试的预期结果。
测试的正则表达式要求严格的 `(N green)` 格式。我刚才在括号中插入的内容破坏了这一点。让我来修复：
所有检查已通过。现在开始会话记录：
现在进行预提交检查：密钥扫描、skills/ 排除情况、git 状态：
已确认先例：116 个刷新的帧 + 捕获脚本已提交；拆分脚本保持暂存状态。现在我来阅读推送技能文档以了解 SSH 包装步骤。
未找到 `ssh` 二进制文件（需要 `paramiko` shim），且 wrapper 的默认远程仓库有误（必须传入 `--remote`，即 S260 课程）。让我来阅读附录 A 以了解该 shim。
我已经有了完整的 shim。让我来部署它并准备密钥（在仓库外部，权限为 0600）：
密钥已验证 (ed25519)。现在提交 S196 周期（排除会话暂存的拆分脚本）：
已创建 Commit `8b3ea2c`。现在通过 SSH wrapper 进行 dry-run（带有明确的 `--remote` 参数，符合 S260 教训）：
由于我的 awk 提取操作，shim 丢失了 shebang。让我来修复它：
Dry-run 已通过 (fast-forward ece111f..8b3ea2c)。现在开始正式推送：
S196 周期已完成并推送。**提交 `8b3ea2c` 已在 `main` 分支**（wrapper SSH 验证：remote ref == 本地 HEAD，fast-forward ece111f..8b3ea2c，密钥已销毁，未创建新分支，`skills/` 保持排除在 lint/tsc/build 之外）。

**本周期工作**：工作区刷新至 `ece111f` 并完全复现 S195 关闭状态（lint/tsc/单元 1799 全绿）。Standing chrome 全 GREEN：移动端抽屉检查连续第 **151/152** 次通过（**无 Tailwind v4 移动端导航 bug**：backdrop oklab + blur(4px)、288px 面板、20 链接、Escape/自动关闭）、桌面 parity 探测 **MATCH**、s116 重扫描零残留。最新 20 视图 census 标记 112 差异——全部裁定为已知非差距类别（**参考站点连续第 6 个干净窗口**）。据此执行了 S195 关闭时指定的下一候选：**studygroups + practicetests 双家族 e2e 整合**（第二个双家族周期）——S7-P + S130/CE2 + S172/DV2 拆入 `tests/e2e/practicetests.spec.ts`，S171/DU2 + S176/DZ2 拆入 `tests/e2e/studygroups.spec.ts`（第 8/9 个视图专属 home），parity-session7 缩至 36 pin / 11 describe / 1,302 行。Mode-D 表征纪律全程：拆分前基准 43 首跑 = 拆分后三文件 43 首跑，chunk-2 冷启动 275/275（15 文件），**完整认证图 744/744**。

**交付物**：`docs/remediation-plan-session196.md`（§9 已闭合）、`docs/session_264.md`、4 张自验证截图（196-studygroups-dialog / 196-practicetests-dialog + 2 张开发服务器帧）、文档链同步（AGENTS S196 课程 ×4、README、CLAUDE、SKILL、PAD v1.3.104、worklog Session-207）、`.env`/`.env.example` 复验无变更。

**一处偏差记录**：SKILL §11 绿态行的首次编辑把 spec-file 普查数写进了 `(2543 green)` 括号内，触发 doc-counts 交叉读取 tripwire（1798/1799）——修复后全套 1799 全绿（tripwire 精确履行了它的职责）。

**建议下一步**：等待参考站点行为变更轴；或下一自然整合是**对话框追赶家族**（S174/DX4 + S175/DY1 + S176/DZ1/DZ3）或**跨视图家族**（S184/EH + S186/EJ + S187/EK）——均为轴线 home 而非视图 home。

我将开始执行这项多阶段任务。首先制定任务清单，然后刷新工作区。
`git pull` 成功（fb156be → dbf8673）。现在研读根文档：
文档很大（AGENTS.md 313KB，CLAUDE.md 106KB）。我分段读取关键部分：
AGENTS.md 行极长。改用截断方式读取结构：
根文档已理解。现在读取会话文档（任务 3）：
现在读取 worklog.md 最新条目（尾部）：
现在对照代码库验证理解。检查环境配置、测试配置与关键代码：
环境契约已满足（`.env`、`db/`、vitest/playwright 均就位）。检查工作区温度与测试配置：
工作区为 WARM（:3000 开发服务器与 :3200 standalone 幸存者均在运行）。按 S193 lesson-1 程序验证 :3200 守护进程是否字节最新，并运行冷基准：
冷基准完全复现 S194 关闭状态（lint ✓ · tsc ✓ · 单元 1799/1799）。现在查看 skills 目录进行审计（任务 4）：
已掌握相关技能。现在运行 standing chrome 检测——首先验证移动端抽屉（用户特别关注点）：
抽屉检查 GREEN（连续第 149 次，无 Tailwind v4 移动端导航 bug）。现在运行桌面 parity 探测与参考站点普查：
需要提供参考站点凭据（REF_PROBE_* 环境变量）：
桌面 parity 探测 **MATCH**（两主机五项结构检查全过）。运行 s116 参考重扫描与 20 视图 census：
s116 重扫描 GREEN（ok:true、9/9 不变量双主机、probeCleanup ok、零残留）。现在运行 20 视图参考 census——S195 周期的轴线发现工具：
Census 标记 112 个原始差异（17 data-shaped + 95 需裁定）——与 S193/S194 完全一致的计数。现在验证每个 flagged 差异是否映射到已知的非差距类别：
每个差异需按 S194 台账裁定类别验证。运行 S191 lesson-2 代码检查（克隆零数据路径中的 CTA 存在性）：
裁定完成：95 个差异全部映射到已知非差距类别（代码检查通过，EP2/EP4 pin 在位）。**参考站点自 S194 关闭以来未变更——连续第 5 个干净窗口**。

现在审计近期代码变更（S194 提交）并测量规模债务以确定 S195 轴线：
S194 变更为纯测试组织重构（已审计）。现在枚举整个套件中 Analytics/GradeTracker 相关 pin，评估 S195 轴线的家族范围：
现在检查 cert 脚本的 chunk 分配，完成轴线决策分析：
分析移动 pin 的写入行为（残留分析）：
4 个候选 describe 全部为只读/零残留 pin。现在完成移动块的 helper 依赖普查：
文件头确认家族台账。现在精确定位 4 个移动块的边界（含前导注释）：
边界映射完成。查看既有 view-dedicated home 的文件头模板以遵循先例：
现在精确定位所有块边界（消除歧义）并完成计划前验证：
边界全部确认。所有审计前提就绪，现在撰写 S195 综合修复计划（存至 `docs/`）：
计划已保存。现在对照代码库验证计划对齐性（describe/pin/行数算术 + 混合 describe 留守确认）：
算术完全对齐（20/48/1724 → 移动 4/6/169 → 留 16/42/~1555）。开始执行 §5 步骤 1——拆分前基准冷运行：
`--list` 确认 49 项（48 pin + setup）。运行拆分前基准冷运行：
**拆分前基准：49 passed（48 pin + setup），首跑全绿。** 现在研究 S194 拆分脚本模板并编写 S195 版本：
确认拆分脚本为会话暂存工具（不提交）。验证空行分隔符约定后编写拆分脚本：
浮动注释确认（S82 孤儿注释不动——外科手术式变更）。现在编写 S195 拆分脚本：
拆分完成，全部机器检查通过。现在运行 `--list` 普查与三文件冷等价性验证：
`--list` 返回 0 个测试——检查新文件是否有语法问题：
发现问题：Python 模板未加 `f` 前缀导致双花括号残留。修复生成文件中的花括号：
计数等价确认（49 = 42+4+2+setup）。运行三文件冷等价性验证：
**拆分后等价性：49 passed，首跑——与拆分前基准完全一致。** 现在同步 chunk-map（两个 cert 脚本 + tripwire）：
Now update run-cert-chunk.sh:
现在更新 tripwire 注释链（tests/script-conventions.test.ts）：
Tripwire 已更新。运行全套门禁（lint · tsc · unit）：
单元 1799/1799（tripwire 138 项验证了 cert 脚本编辑）。现在按 S191 课程先按端口关闭 ：3200 守护进程，再运行构建：
构建 ✓（AUTH_SECRET="" 契约验证）。运行 chunk-2 冷组合（13 文件，预期 275）：
**Chunk 2：275/275 冷启动（13 文件）首跑全绿。** 运行其余区块完成完整认证图：
**完整 5-chunk 冷认证图：744/744**（160+275+116+101+92，每块首跑）。运行收尾 chrome 检测：
收尾 chrome 全 GREEN（抽屉第 150 次 + parity MATCH）。现在重启 ：3200 standalone 并捕获证据帧：
编写 S195 证据捕获脚本（4 帧：2 个 :3200 家族表面 + 2 个开发服务器帧）：
**所有帧状态正常。** 按惯例目视抽查两个家族表面帧：
4 帧全部像素验证通过。现在执行 doc-chain 同步。先更新 AGENTS.md（census 行 + S195 课程块）：
Now append the S195 lessons block at the end of AGENTS.md:
AGENTS.md 完成。更新 CLAUDE.md（e2e 行的 session-7 引用）：
Now README.md (tree diagram + Session-195 row):
Now the SKILL census sites and vitest.config.ts header:
Now the PAD v1.3.103 revision block:
Now the worklog Session-206 entry and the plan §9 close-out:
Now close the plan's §9 and write the session transcript:
Doc-chain 同步完成。现在运行最终验证（单元层复验 doc 编辑的 cross-read tripwire）并检查 git 状态：
单元 1799/1799 全绿（cross-read tripwire 验证了文档编辑）。运行密钥扫描与 skills/ 排除合规检查：
密钥扫描通过（匹配项均为既有的所有者提交的历史记录文本，非凭据）。检查 skills/ 排除合规：
skills/ 排除合规确认。现在研读 push 技能文档并准备提交：
paramiko 可用但先前 shim 已被回收。读取完整附录 A 并重建 shim：
Shim 已部署。写入密钥到 /tmp（0600，绝不进仓库）并验证解析：
密钥解析成功（ed25519）。现在暂存并提交（排除暂存拆分脚本，遵循 S194 先例）：
提交 `e827270` 完成。检查 wrapper 的 remote 参数（S260 教训：需显式 `--remote`）并 dry-run：
试运行通过（fast-forward dbf8673..e827270）。执行正式推送：
推送已被 wrapper 端到端验证。用 GitHub API 独立确认并销毁密钥副本：
推送验证链完整（wrapper SSH 验证 remote@e827270 == HEAD、tracking ref 同步、密钥已销毁）。完成所有任务：
S195 周期已完成并推送。**提交 `e827270` 已在 `main` 分支**（wrapper SSH 验证：remote ref == 本地 HEAD，fast-forward dbf8673..e827270，工作树干净，密钥已销毁，未创建新分支，`skills/` 保持排除在 lint/tsc/build 之外）。

**本周期工作**：工作区刷新至 `dbf8673` 并完全复现 S194 关闭状态（lint/tsc/单元 1799 全绿）。Standing chrome 全 GREEN：移动端抽屉检查连续第 **149/150** 次通过（**无 Tailwind v4 移动端导航 bug**：backdrop oklab + blur(4px)、288px 面板、20 链接、Escape/自动关闭）、桌面 parity 探测 **MATCH**、s116 重扫描 9/9 双主机零残留。最新 20 视图 census 标记 112 差异——全部裁定为已知非差距类别（**参考站点连续第 5 个干净窗口**）。据此执行了 S194 关闭时指定的下一候选：**analytics + gradetracker 双家族 e2e 整合**（首个双家族周期）——S7-D + S127/CB13 拆入 `tests/e2e/analytics.spec.ts`，S7-E + S173/DW2 拆入 `tests/e2e/gradetracker.spec.ts`（第 6/7 个视图专属 home），四个 describe 全部只读零写入。Mode-D 表征纪律全程：拆分前基准 49 首跑 = 拆分后三文件 49 首跑，chunk-2 冷启动 275/275（13 文件），**完整认证图 744/744**。

**交付物**：`docs/remediation-plan-session195.md`（§9 已闭合）、`docs/session_262.md`、4 张自验证截图（195-analytics-desktop / 195-gradetracker-dialog + 2 张开发服务器帧）、文档链同步（AGENTS S195 课程 ×4、README、CLAUDE、SKILL、PAD v1.3.103、worklog Session-206）、`.env`/`.env.example` 复验无变更。

**一处偏差记录**：生成文件的 f-string 花括号转义缺陷（`{{ }}` 残留导致 Playwright 报 "0 tests"）——单文件 `--list` 定位后修复并重新验证字节保真性，已写入 S195 课程 3。

**建议下一步**：S7 时代基础台账已关闭；下一自然整合是 studygroups home（S171/DU2 + S176/DZ2）或 practicetests home（S7-P + S130/CE2 + S172/DV2），或等待参考站点行为变更轴。

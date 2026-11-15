我将开始执行这项完整的工作流任务。首先检查当前工作区状态，然后克隆/刷新仓库。
仓库已存在。现在拉取最新代码并检查状态。
工作区已就绪，`db/` 和 `.env` 配置已存在。现在创建任务计划并开始阅读核心文档。
S190 周期已完成并推送（`fbe9130`），session_253 是操作者的记录提交。现在我需要执行 **S191 周期**。让我阅读核心文档以掌握规范。
文档非常庞大。让我策略性地提取关键规范部分。
现在检查环境状态并启动冷基线（S190 收敛状态复现）。
环境就绪。现在运行冷基线检查（lint → tsc → unit）。
单元测试 1799/1799 与 S190 收敛完全一致。现在运行生产构建（使用 reaper-proof 方案）。
冷基线完整复现 S190 收敛（lint ✓ · tsc ✓ · 单元 1799/1799 · 构建 ✓）。现在启动开发服务器（reaper-proof 方式）并运行固定检测。
理解了规范。现在启动开发服务器（双 fork reaper-proof 方式）并运行 preflight。
两个端口都有存活守护进程。按规范先运行 dev-server preflight 诊断。
Preflight GREEN。现在运行标准检测 —— 抽屉检查（drawer check，第 141 次）与桌面一致性检测（desktop parity probe）。
Drawer check GREEN — 第 141 次连续通过，无 Tailwind v4 mobile-nav bug。现在运行桌面 parity probe。
Parity probe 匹配 —— 五项结构检查全部一致。现在运行参考站 resweep（s116）与新鲜的 20 视图 census（s190 脚本）。
S190 的探针脚本在上次会话的暂存目录（`/home/z/my-project/scripts/`）中。仓库内最新的 census 是 s185。让我确认。
运行 s116 resweep（需要参考站凭证）。
Resweep 超时。让我诊断 —— 检查参考站可达性与 standalone 健康。
Parity probe 刚用同样凭证成功登录过，可能是瞬态故障。重试一次。
持续失败。让我制作带步骤追踪的副本来定位超时点。
补丁破坏了语法。让我直接在原始脚本上用环境变量方式追踪。
导入路径是相对的。修正为绝对路径后重跑。
定位到失败点：`registerClone` 在 `page.goto(/)` 后等待 `<main>` 超时。让我直接复现注册流程并转储页面状态。
找到根因：我的 `bun run build` 覆盖了 `.next/standalone`，而 :3200 守护进程仍在运行 —— 它内存中的旧 manifest 引用的 chunk 已被替换，客户端 JS 404 → 空白 body。修复：用新构建重启 standalone。
端口已释放。现在用新构建以 reaper-proof 方式重启 standalone。
新 standalone 已启动。重跑 resweep 验证修复。
Resweep GREEN：9/9 不变量双主机通过、零残留。现在运行新鲜的 20 视图参考站 census（S191 周期的轴线发现工具）。
Census 显示 7 个视图有差异 —— 让我核实它们是否全部属于已知的数据状态类（参考账号零数据 vs 克隆种子账号）。先检查 census 脚本如何登录克隆。
Census 对比的是参考站零数据账号 vs 克隆 demo 种子账号。让我验证克隆代码在空状态路径中携带所有这些按钮（数据形态类核验）。
全部 7 个差异均属于数据状态类 —— 克隆代码携带所有空状态 CTA。**参考站自 S190 以来无变化。** S191 周期轴线确认为：flashcards 家族 e2e 整合（S189/S190 收敛点指定的候选）。

现在检查 e2e spec 结构与 flashcards 引脚分布。
现在研究 S189 notes 整合（模板模式）与 S189 收敛点对 S191 候选的确切描述。
S191 轴线已确认。现在完整阅读 S189 整合计划作为模板，并精确普查 flashcards 家族。
模板已掌握。现在用权威的 `--list` 工具普查 flashcards 家族（S189 教训 2：绝不靠 grep 计数）。
让我精确普查 flashcards 家族的边界 —— 检查 parity-session8/9 中的候选 describes 的纯度。
S189 先例边界清晰：整合范围 = parity-session7 内的家族（session8/9 的散留 describes 留在原处 —— S189 留下了 9 个 notes 散留引脚）。现在绘制 parity-session7 的 describe 线图。
让我检查 S89/AP 与 S78/AE 的实际内容以确定家族边界，并读取文件头部与共享 helpers。
**S89/AP 也是纯 flashcards 引脚**（学习会话越过剩余卡牌死亡）。移动集共 11 describes / 18 pins。让我验证 describe 块边界与共享 helper 使用情况。
注释块明确归属于其后随的 describe（随块移动）。检查移动集中的 `beforeEach` 导入方式。
`test.beforeEach` 无需额外导入。现在检查 cert 脚本的 chunk 组成。
Tripwire 理解完毕。现在定位所有需要 lockstep 的 census 站点。
现在运行 Mode-D 纪律要求的拆分前特征化（parity-session7 冷运行基线）。先检查冷重置脚本。
运行拆分前特征化：parity-session7 冷运行（88 pins + setup）。
特征化基线：**89 passed 首轮全绿**（88 chromium + setup），与 S190 收敛完全一致。现在检查移动引脚依赖的种子 fixture，然后写计划。
所有分析完成。现在编写 S191 修复计划。
计划已保存。现在研究 notes.spec.ts 头部作为新文件模板，然后编写机器验证的提取脚本。
三项机器验证全部通过。现在验证新文件头部与 tsc/lint。
Census 确认：731 tests / 33 files（计数不变），flashcards 18 + parity-session7 70 = 88。现在运行双文件冷组合等价性证明。
双文件冷组合：**89 passed 首轮全绿** —— 与拆分前基线完全一致。现在执行 chunk-map lockstep。
现在更新配对 runner（run-cert-chunk.sh）—— CHUNKS 数组必须与 cert 脚本字节一致。
修复 runner 注释链的拼接（保持历史记录连贯）。
现在更新 tripwire 注释链（script-conventions.test.ts）。
现在执行 doc-chain lockstep。先更新 AGENTS.md 的 census 行。
更新 CLAUDE.md 的 e2e 描述（flashcards-home 引用，S189 模式）。
现在更新 PAD 版本块（v1.3.98 → v1.3.99）。
现在追加 AGENTS.md 的 S191 教训块。
现在追加 README Session-191 行。
锚点不唯一。使用 Session-190 行的独特尾部。
现在运行单元门禁验证 tripwire 与 cross-read 引脚（会捕获任何遗漏的 lockstep 站点）。
单元 1799/1799 全绿 —— tripwire 与 cross-read 全部通过。现在运行 chunk-2 组合证明（275/275，9 文件冷启动）。
Chunk-2 组合：**275 passed 首轮全绿**（9 文件）。现在以 reaper-proof 方式启动完整 5-chunk 冷 cert map，同时并行推进文档工作。
Cert map 已启动（chunk 1 运行中）。并行推进文档工作 —— 先看 worklog 的 Session-201 条目格式。
Cert map 运行中。现在并行编写 worklog Session-202 条目。
现在编写 docs/session_254.md 会话记录（session_252 结构化风格）。
现在更新计划的 §5 清单与 §9 收束，然后检查 cert map 进度。
Cert map 正常运行中（chunk 1）。现在准备证据帧捕获脚本（在 cert map 完成后运行）。先参考 S189 的 census-proof 模式。
现在编写 S191 证据捕获脚本（cert map 完成后运行）。
Chunk 1: **159 passed 首轮通过**。Chunk 2 运行中。并行核验 .env.example 与残留 census 站点。
所有残留站点均为历史记录（§6.6 正当）。检查 cert map 进度与变更集。
Chunk 2: **275 passed**（cert map 中再次证明）。等待剩余 chunks 时，先研究 SSH wrapper 推送流程。
SSH wrapper 流程已掌握。检查 shim 是否已部署，并继续监控 cert map。
Shim 已就绪。等待 cert map 完成（chunks 3-5）。
**完整 5-chunk 冷 cert map：735/735 全绿**（159+275+108+101+92，每个 chunk 首轮通过）。现在捕获证据帧。
证据帧已捕获并自验证。现在运行收尾检测（抽屉检查第 142 次 + 桌面一致性检测）。
收尾检测全绿（drawer 142nd + MATCH）。现在收束计划 §9、清理暂存文件并准备提交。
收束计划 §9 并整理暂存文件。
变更集完整。现在配置提交并执行 git commit。
提交 `da40be2` 已创建。现在执行 SSH-wrapper 推送流程：密钥 → 0600 临时文件 → 指纹校验 → 试运行 → 正式推送。
Dry-run 通过（fast-forward 接受）。执行正式推送。
**S191 周期完成并交付 —— 提交 `da40be2` 已推送到 `main`（远端验证 == 本地 HEAD，操作者密钥已粉碎，工作树干净，无新建分支）。**

本周期执行了 S189 收敛点指定的候选：**flashcards 家族 e2e 整合**。冷基线精确复现 S190 收敛（lint ✓ · tsc ✓ · 单元 1799/1799 · 构建 ✓），固定检测全绿（drawer 第 141/142 次连续 —— 无 Tailwind v4 移动端导航 bug；parity probe 五项 MATCH；resweep 9/9 双主机零残留），新鲜 20 视图参考站 census 的全部 7 个差异均核验为数据形态类 —— **参考站自 S190 以来无变化，S190 三家族移植保持有效**。

整合本身：11 个纯 flashcards describes / 18 个引脚从 parity-session7（88 → 70 引脚）逐字节迁入新家 `tests/e2e/flashcards.spec.ts`，三项机器验证（块字节一致、标题多重集 88==88、describe 算术）全过；Mode-D 等价性证明链完整（拆分前后冷运行同为 89 passed 首轮零抖动、chunk-2 组合 275/275 两次、**完整 5-chunk 冷 cert map 735/735 每个 chunk 首轮**）。

周期内还根因了一个运维隐患（重建覆盖存活 standalone 守护进程导致 chunk 失配 —— 已记为 S191 教训 1 并清除 ：3200 隐患），全链路文档 lockstep 完成（AGENTS 教训、README、CLAUDE、SKILL、PAD v1.3.99、worklog Session-202、双证据截图）。`.env`/`.env.example` 核验无变化。下周期候选：timetable 家族。

我将按照标准 15 步工作流继续执行本窗口任务。锚点已更新为 `docs/session_42.md` 与 `docs/session_43.md`，所有继承状态须以 git pull 后仓库实际内容为准。先建立 TODO 清单，然后刷新工作区。
工作区已被重置，本地无 omni-study1 仓库，需要重新 clone：
仓库已克隆，工作区干净，位于 main 分支。最新提交已推进至 **Batch AM（s86 cycle）**——远超摘要继承的 Batch AH/Cycle 31，印证了“须重建基准事实”的判断。现在精读核心文档：
文档较大，读取持久化输出的关键部分：
AGENTS.md 行极长导致输出被持久化。改用分段读取持久化文件：
输出持续持久化，改用小分段策略。先读最关键的锚点文档 session_42/43（重建基准事实）：
基准事实已重建：**Session-86/Batch AM（Cycle 36）已完成并推送**（`75d5af6` + 日志提交 `0493503`）。本窗口周期为 **Session-87 / Batch AN（Cycle 37）**，transcript → `docs/session_44.md`。已知常设债务：Batch R、study zombie、~27 hue consumers、I2 text token。

现在读 remediation plan 头尾与 worklog 尾部：
基准事实重建完成。检查供应状态（全新克隆，需完整配置）：
全新克隆状态：需完整供应（.env、db、依赖、构建、chromium-1243）。先读 .env.example 与 package.json：
开始供应。第一步 `bun install`（后台执行，耗时较长）：
在安装依赖的同时，让我并行阅读关键技能文件并检查审计差异范围：
依赖安装完成（497 包，7 秒）。读取本轮点名的审计技能 web-app-foundation：
技能已吸收。继续供应流程——创建 .env、推送数据库、播种：
chromium-1243 后台下载中。同时运行快速门禁（lint + tsc + unit）：
快速门禁全绿：lint ✓ tsc ✓ unit **905/905** ✓（与文档基线完全一致）。现在运行生产构建：
构建绿、chromium-1243 就绪。查看 e2e 分块认证脚本结构：
启动冷认证（按 S32 子壳配方后台运行），并同时启动 Batch AM 差异的 Mode-C 审计子代理。先确认审计范围：
范围确认。启动冷认证（S32 子壳配方）并并行启动 Mode-C 审计子代理：
审计返回：**0 Critical / 0 High / 0 Medium / 2 Low / 5 Info**，AM1–AM6 全部验证通过。发现项构成 Batch AN 候选（L1 记录准确性、L2 新 pin 缺 try/finally 清理、I3 四对历史重复截图等）。

检查冷认证进度：
认证似乎已完成。查看完整结果：
**冷认证 468/468 全绿**（131+138+57+84+58，每块首过，零 flake；chunk 2 的 AI 失败注入为预期行为）。基线完全重建。

更新进度，准备 s87 resweep（从 s86 重标记）：
重标记 s87 resweep 脚本：
启动 ：3200 standalone 并运行 s87 resweep（按 S86 教训：同一调用内完成）：
需要 AUTH_SECRET。生成随机密钥重启（本地验证服务器）：
**s87 resweep: ok:true** — 双端 9/9 不变量、品牌表字节匹配、移动端 drawer/bar/brand 正常、probeCleanup ok、18 张截图。

现在进行 agent-browser 移动导航双端验证（用户重点点名面）。加载 agent-browser 技能：
localStorage 中 `sidebarOpen:"false"`（agent-browser 持久配置残留，S52 共享状态契约）。设置为 true 重验展开态：
**参考站抽屉展开态：24 个带标签链接** ✓。验证导航行为：
参考站移动导航完全验证。截图存档并恢复展开态：
参考站验证完毕（24 标签展开/20 仅图标折叠零可访问名/导航正常/416 自有溢出）。现在验证克隆端：
**克隆抽屉：26 个带标签链接**（超集 skip-link + 20 nav + 5 content）✓。验证导航：
克隆导航验证通过（/Notes、抽屉关闭、scrollWidth 390 无溢出）。验证折叠态（克隆自身键 `sf-sidebar-collapsed`）：
双端移动导航验证完成。**无 Tailwind v4 移动导航 bug**（s87 再次确认）。所有证据层就绪，现在检查 AN 候选目标文件后写入 Cycle-37 计划：
验证 I3 的四对历史重复截图（blob 哈希）：
四对全部字节相同（I3 验证）。检查这些文件名是否被引用（删除前必要步骤）：
常设捕获脚本不涉及会话编号命名——删除重复安全。查看 L1 记录修正目标行：
查看补救计划尾部结构以确定追加位置：
读取现有 group-members 测试以规划 AN4 的 TDD pins：
写入 Cycle-37（Batch AN）计划——源码变更之前（纪律）：
计划已写入。开始 TDD 阶段——**AN4 先行**（pins RED → fix → GREEN）：
**AN4 两个 pin 在设计断言处 RED** ✓（7 个原 pin 保持绿）。GREEN 阶段——seam 修复：
AN4 GREEN（9/9）。现在 **AN1**——检查 API 响应形状以正确取 id：
响应形状确认（POST→201+row JSON、DELETE→ok:true）。实施 AN1：
AN1 完成。现在 **AN2**——三处记录准确性修正：
AN2 完成。**AN3**——先在本周期内重新验证 md5，再删除重复帧：
AN3 完成（698 帧保留）。**AN5**——标注计划中 L2 插例的 zod4 无效邮箱：
AN5 完成（AN6 已在计划中记录接受）。运行快速门禁验证 AN4/AN1 改动：
重新构建并验证 AM1 e2e pin 家族（含 AN1 修改）：
AM1 pin（含 AN1 卫生改进）绿，parity-session8 58/58。启动完整冷再认证（预期 468/468）：
认证运行中（约 10 分钟）。同时准备 s87 证据捕获脚本（互驱式 + AN4 可见面）：
创建 s87 捕获脚本前检查 StudyGroup.members 存储形式：
检查 Study Groups 编辑对话框如何呈现成员（AN4 真实可见面——input 值保留空格）：
`initialFor` 内部已 trim——AN4 无视觉判别面（与已接受的 I2 姿态一致：捕获可见面、单元 pin 承载证明）。编写 s87 捕获脚本（Prisma 直插遗留 padded 行模拟）：
Chunk 1 运行中。同时准备文档链——检查 README 徽章与计数：
现在向 AGENTS.md 添加 S87 经验教训节。先看 S86 节格式：
更新 e2e 认证脚本头与 remediation-plan 状态行：
**最终冷再认证 468/468**（每块首过，零 flake）。现在运行常设审计。查找 standing-suite 编排器：
按 S86 节奏运行常规审计族。S32 配方启动 dev server：
"AI-route limiter shape wrong (cutoffAt=1)" —— 已知的 S84 排序伪象（我连续跑了 3 次 security 耗尽了 demo 用户 AI 预算）。按手册处置：杀进程→全新启动→单次重跑：
Security 清零（S84 伪象按手册清除）。第二批：print + focus-order + data-volume：
第二批判绿（print 0/0、focus-order 0、data-volume 0）。第三批 AI 预算审计（每个前全新启动）：
全部常设审计绿。启动 ：3200 并运行 s87 证据捕获（互驱式 + AN4 面）：
三帧全部不同 md5（互驱式惯例保持）。验证捕获与探测行清理：
捕获与清理验证完成。完成文档链——README Session-87 行：
CLAUDE e2e 计数保持 468 正确。写入 README Session-87 行：
写入 remediation-plan 的 Cycle-37 执行记录与 DONE 标记：
写入 worklog Session-87 条目：
写入会话转录 docs/session_44.md：
转录完成。验证 .env.example 一致性并审查 git 变更集：
变更集干净（.env/db/dev.log 均被忽略）。清理服务器并做最终门禁：
提交完成（`db9acb4`）。现在按技能文档进行 SSH wrapper 推送：
按技能部署。检查 ssh 二进制、paramiko 与 wrapper 的 remote 处理：
paramiko 5.1.0 就绪。部署 shim 并物化操作员密钥：
试运行（Dry-run）通过（fast-forward `0493503..db9acb4`）。执行真实推送：
**推送验证：remote `main @ db9acb4` == 本地 HEAD，密钥已销毁。** 更新共享 worklog（系统级）：
本窗口任务全部完成。**Session-87 / Batch AN（Cycle 37）已交付并推送**：

## 周期总结

**基线重建**（第 29 次工作区重置后全新克隆）：lint ✓ tsc ✓ unit 905/905 ✓ 冷 e2e 468/468 ✓（S32 子壳配方使分离认证全程存活）

**三层证据**：AM 差异 Mode-C 审计（0 Critical/High/Medium、2 Low、5 Info，六项声明全验证）· s87 resweep ok:true（双端 9/9、品牌表字节匹配）· agent-browser 双端移动导航验证（参考站 24 标签展开/20 仅图标零可访问名；克隆 26 标签/20 仅图标全带 title+aria；**无 Tailwind v4 移动导航 bug**）

**TDD 修复**（计划先行写入）：AN1 pin 自清理闭环 · AN2 三处“全 RED-first”过度声明修正 · AN3 四对历史字节相同截图清除 · AN4 读侧 trim 对称（2 pin RED→GREEN）· AN5 插图注释 · AN6 接受并记录

**最终基线**：unit **907/907** · e2e **468/468** · 全部常设审计绿（security 首项发现为 S84 排序伪象，按手册清除）· 互驱式三帧证据全部不同 md5

**推送已验证**：`main @ db9acb4`（远端==本地），操作员密钥已销毁

## 建议下一步
- 在 GitHub 上核验推送与 Session-87 文档链
- Session-88 候选债务（文档已记录）：Batch R（RSC 结构性能）、study zombie、~27 个 hue 消费者、I2 文本 token
- 可考虑轮换参考站凭据（AN6 记录的残留风险）

本地仓库位于 Batch CE (s130 周期)，工作区干净，远程仓库领先一个提交。让我拉取更新并查看会话文档。
已拉取 — 操作员刚刚添加了 `docs/session_132.md`（323 行）。让我仔细阅读所有关键文档。
`docs/session_132.md` 确认 Batch CE (s130) 已在 `7288769` 处完成并推送。下一个周期应为 **Session-131 / Batch CF (Cycle 81)**，并轮换回 shell/auth-screens 轴。让我来制定任务计划并审查核心文档。
Environment is intact (`.env` contract ✓, db ✓, chromium-1243 ✓, agent-browser ✓). Now the docs chain review.
`.env.example` ✓ 匹配。现在正分批并行审查五个核心文档。
Session-131 记录已内化。现在正在检查补救计划和关键统计锚点。
所有锚点已对齐（1217 单元 / 567 e2e / 1784 绿色）。文档审查完成。现在开始进行冷基准测试 —— 先进行 lint + tsc + unit。
单元测试 **1217/1217 (45 个文件)** — 完全匹配。现在开始在后台进行规范构建。
Build green (REAL_EXIT=0). Now the register tripwire — reading the calibrated instrument first, then measuring.
仪器已校准。在测量**之前**陈述预期：**249 个导入器 / 130 个 Usage-line 载体 / 0 个过期 / 119 个无 Usage-line**（第 40 次连续保持）。
**Tripwire: 249/130/0/119 — 精确保持（连续第 40 次）。** 现在进行 cold 5-chunk e2e 认证。先检查 cert chunk 脚本的用法。
Chunk 1: **146 ✓**. Chunk 2 next (expect 179).
**冷基线已完成：567/567 e2e (146+179+72+93+77，全部首过)。** 现在进行 Batch CE diff 的 Mode-C 审计 (`7288769`)。
Diff 中没有关键素材。现在正在对照代码树验证所有 9 项 CE 声明。
**Mode-C 审计：已根据代码树重新验证全部 9 项 CE 声明均为 TRUE。** 净剩余的 `#8b5cf6` 站点均为选择器调色板/验证默认值/固定的 v3 token —— 属于数据，而非图表样式。现在进行实时对等一致性测试（live parity battery）：在全新 `reseed` 后启动克隆守护进程（clone daemon）。
守护进程状态正常。正在加载 agent-browser 技能以进行实时测试。
Reference logged in. Running the standing battery — hamburger measurement first.
Hamburger: **unlabeled, 36×36 @ [17,14]** ✓. Opening the drawer.
这获取到了桌面侧边栏。正确定位到移动端抽屉。
Drawer: **no role=dialog, 288px panel, blur(4px)+rgba(0,0,0,0.2), 20 links** ✓. Now this cycle's NEW probe — the drawer EXIT animation family (a never-live-measured surface, fitting the shell-axis rotation).
The reference drawer computes `animation: none` at exit — plain unmount, no exit family. Let me verify the ENTER side too (open sampling).
**探测结果：参考的移动端抽屉在进入和退出时均没有动画** —— 采用普通的条件渲染挂载/卸载，没有 `data-state`，`transition: 0s`。让我检查一下克隆的抽屉实现期望什么。
The clone's drawer is a plain conditional mount (S118/Q1 — instant, matching the reference) — **no parity delta on the drawer animation surface; the probe closes clean on both hosts.** Now the reference landscape leg.
Reference landscape: **992 > 290, overflow auto** ✓. Reference battery complete. Switching to the clone at :3000.
Clone hamburger: **已标记, 36×36 @ [16,14]** ✓. 抽屉测量 + 退出动画探针（新探针的克隆侧）。
Clone drawer: **288px, 20 links, oklab+blur(4px), animation: none — matches the reference's instant mount exactly.** Now the auto-close + clean-page + scroll persistence + landscape legs.
**克隆测试套件全绿 —— 无 Tailwind v4 移动端导航 Bug，这是第 37 次连续现场确认。** 新的探测在两侧主机上都完美结束（抽屉动画系列：两者均为无）。正在收集两个轮换深度审计的文件列表（shell/auth-screens + crypto/auth/infra —— 这两个最久未被覆盖的轴，深度覆盖可追溯至 CD）。
Launching both rotated deep audits in parallel with fresh eyes.
两项审计已完成：**A: 0C/0H/1M/5L/4I · B: 0C/0H/1M/8L/6I**。根据 Mode-C 准则，在制定计划前，我将通过直接阅读来验证每一项 M 发现。
M 级发现已验证。在 `sed` 输出中发现了一个异常 —— 让我直接检查那一行（`hopsops` 会导致 `tsc` 报错，所以很可能是显示问题，但我必须确认一下）。
Line 264 is correct (`hops[hops.length - trustedHops]`) — terminal artifact. Now verifying the L findings I plan to fix.
所有 M 级和关键 L 级发现已直接读取验证，确认为 TRUE。在制定计划前，有两项实时检查事项：L-A3 参考暗色发际线探测，以及 CF1/CF7 的范围界定侦察。
参考线的发丝在暗色模式下保持明亮（slate-200/300）——但让我确认一下暗色模拟是否确实生效了（卡片背景），然后再结束 L-A3。
The reference's login page is **light-only** (bodyBg white under dark OS) — its hairline never renders dark, so L-A3 is a clone-side dark-correctness item (the clone's dark-OS login pin makes the surface exist), not a parity constraint. Now the scoping recon for the CF set.
侦查已完成。在撰写计划之前，让我先核对一下 `auth-budget` 的 `chunk-5` 使用量（我的 `e2e` 测试环节绝对不能超出有限的按 `IP` 限额预算）。
16 registers in chunk 5 vs a per-IP budget of 10 — yet the chunk passes. My limiter model must be wrong. Reading `checkRateLimit` directly.
e2e 规范在需要新预算时已经通过唯一的 `x-forwarded-for` 进行传递 —— 我的测试环节可以进行相同的操作，且不会产生交互。最后重新检查一下：CF2 的 env-check 结构。
所有结构已理清。正在编写补救计划 —— `docs/remediation-plan-session131.md`。
计划已保存。现在正根据代码库进行执行前验证。
Spec tails clear; auth-flows has zero existing resend legs (my CF8 leg is safe). One plan correction — `tests/site.test.ts` already exists (no new file; census stays 45 files).
Plan validated and corrected. Now the **RED phase** — reading the existing pin conventions to write consistent new ones.
正在写入单元 RED pin。首先是 `script-conventions` 追加块 (CF1/CF4/CF5/CF6/CF7 普查)。
One pin shape needs correcting — register mints via a `tokenData` spread (the shorthand lives outside the create block). Rewriting that pin to the file-level digest-mint census.
现在进行 env-check (CF2)、site (CF10) 和 auth (CF7 行为) 的追加。
Shell quoting glitch (unclosed quote). Retrying.
Now the site.test.ts (CF10) and auth.test.ts (CF7 behavior) appends.
已确认 normalize pin 的结构。现在进行 e2e RED 测试阶段 —— 检查 spec 约定。
All pins written. Verifying unit RED state.
**Unit RED verified: 15 pins failing for the right reasons** (CF1 ×3, CF7 census ×3, CF4/5 ×2, CF6 ×1, CF2 ×4, CF10 ×2; the identical-chunks guard + CF7 behavior pins hold green by design). Now e2e RED against the pre-fix build.
追加内容导致了括号不平衡。正在检查文件结构。
经典的括号计算失误 —— 我的追加内容需要一个 `describe` 包裹层（该文件的约定）。正在修复这两个 spec。
`auth-flows` 存在同样的不平衡。正在检查并修复。
The env-check import error is the intended RED (seam doesn't exist yet). But auth.test.ts:379 is a real pin bug — `normalizeVerificationCode` returns `string | null`. Fixing the pin shape.
现在正针对修复前的构建验证这三个 e2e RED 状态。
All 3 e2e legs RED — verifying each fails for the RIGHT reason.
CF8 和 CF11 因正确的原因失败。CF9 因错误的原因失败 —— 我在 `describe` 之外的测试从未进行导航（`BY10` 前例对此已有明确警告）。正在添加导航。
**CF9 RED 因正确原因 — 焦点落在 `<body>` 上。RED 阶段完成：15 个 unit + 3 个 e2e，全部因正确原因。** 现在进入 GREEN 阶段。CF1 — 逐邮箱预算。
Duplicate already resolved. Now CF1+CF7 for the resend route.
Resend done. Now CF7 in register (tokenData digest) + verify-email (timing-safe).
我引用了一个 `timingSafeEqualBuffer` 导出 —— 正在检查 `auth.ts` 中实际存在的内容（secret-compare 惯用法）。
No exported helper exists — each site dances inline. Adding the `timingSafeEqualBuffer` seam to auth.ts (next to `hashResetToken`).
CF7 接口已添加。接下来处理 schema 注释 + CF2 接口 + instrumentation 警告。
Now CF2 — the env-check seam + instrumentation warning.
CF2 已完成。现在进行 CF3 —— 重置 destructive-footgun 防护。
现在进行 CF4 + CF5 — playwright config env 锁定 + global-setup always-cold。
现在进行 CF5 — 带有端口防护和临时数据库重置的 global-setup。
CF6 — run-cert-chunk.sh 的 exit-code 严谨性检查。
CF6 已完成。现在处理 FE 集 —— CF8/CF10/CF11 在 login-surface 中。
接下来是 CF11 —— 登录卡片中的 hairline class 对。
CF9 —— drawer focus-restore 可见性防护。
CF10 — 检查 `#main-content` 的可聚焦性，然后取消导出登录常量 + `siteUrl` 防护。
所有 CF 源码修复已应用。正在运行 lint + tsc + unit。
代码检查的回溯窗口未能触达行内注释（它确实在列的那一行）。正在将代码检查范围重新限定到该行本身。
**单元测试通过：1236/1236（45 个文件）。** 接下来进行构建 + e2e 绿色验证。
Setup 失败 —— 正在进行详细输出调查。
目前 3100 端口上没有任何内容——webServer 已挂掉。正在使用确切的 webServer 环境手动启动它以查看错误。
**已找到根本原因**：Playwright 会在 `globalSetup` **之前**启动 `webServer`——我的 `port-guard` 杀掉了测试套件自身的 `server`。`cold reset` 必须移至 `pre-runner` 脚本（唯一在 `pre-boot` 阶段可用的切入点）。正在重构 CF5。
将 CF4/CF5 普查指标 (census pin) 调整为修正后的设计。
现在正通过 `npm script` 验证这三个 e2e 测试项是否均已通过。
All 3 e2e legs GREEN. Sanity-checking the register→verify journey with the digest at rest (the round-trip proof).
往返验证正常（BV11a 并发重放 + BR2 限制测试通过）。现在重新标记 census：代码检查 CC2 的 pin 约束了 cert-script 的 header。
现在查看 `vitest` 的 header 重新锚定。
现在处理 AGENTS.md 的锚点。
正在所有文档中重新标记每一个 anchor (1236 unit / 570 e2e / 1806 green)。
CLAUDE.md 是干净的。正在添加 README S131 行。
现在进行 PAD v1.3.39 — 修订块 + §8.1 行。
正在测量精确的文件级计数，以更新 §8.1。
Row labels 包含完整的文件名。正在修复正则表达式。
现在处理 .env.example + DEPLOYMENT.md 的备注，然后进行冷重新认证。
Docs noted. Now the cold re-cert — final gates.
**冷重新认证：570/570 — 147+179+72+94+78，全部首过通过。** Tripwire 重新推导（预期：249/130/0/119 — 第 41 次连续）。
**Tripwire：249/130/0/119 —— 精确保持（连续第 41 次）。所有检查点均通过。** 现在进行 live battery 测试 —— 使用修复后的代码 + 最新的 reseed 重启 daemon。
**Clone 电池测试全绿 —— 第 38 次连续无 Tailwind-v4-bug 确认。** 现已支持 CF9/CF11/CF7 的实时验证。
CF9 实时检查显示焦点在 body 上 —— e2e pin 在构建版本上通过了，所以让我排查一下（重新加载 + 干净的序列）。
Sidebar 链接存在且可见，但焦点停留在了 body 上。正在使用精确的 e2e 时序进行复现（立即评估），以查看恢复是瞬态的。
`focus` 日志显示 `sidebar` 的 `focus()` 从未触发。我正在重新读取实际的效果结构——我对 `cleanup` 路径的假设一定是错的。
已提供新代码。正在测试 Escape-close 路径（同一清理，opener 可见）以定位问题。
e2e pin 在构建版本上确定性地通过了（两次）；agent-browser 探针受 viewport-race 噪声影响。让我通过一个快速的 headless 脚本，使用一个确定性的 instrument 来解决此问题。
新的上下文 = 未认证 → /Dashboard 重定向。在脚本中添加演示登录。
**CF9 LIVE ✓ — 焦点落在 "Dashboard" 侧边栏链接上。** 现在处理 CF11（暗色细线）+ CF7（静态摘要，实时）。
仿真（Emulation）在页面加载后才生效——主题启动脚本（theme boot script）在首次绘制（first paint）时读取操作系统（OS）偏好设置。正在重新加载。
**CF11 实时 ✓** — 深色停止点已渲染。接下来是 CF7：注册 → 数据库摘要检查 → 验证登录。
清理浏览器会话，为 agent-browser 守护进程腾出空间。
`clone4` 已卡住 —— 正在切换至确定性 `playwright` 脚本，以执行 CF7 实时旅程。
**CF7 LIVE ✓ — digest at rest, round-trip sign-in.** All three CF live verifications green. Now the evidence frames.
全部三个帧均已验证为非空白。现在开始执行计划 §5 执行记录。
现在来处理工作日志条目和会话记录。
已编写会话记录。对最终目录树进行最终验证。
已清理。进行占位符扫描，然后提交。
已提交 `56f80e8`。现在进行 SSH 包装推送——先阅读包装技能。
paramiko shim 位于工作区 bin 目录中 — 正在将其添加到 PATH。
Dry-run clean (remote at `14510d3`, fast-forwards to `56f80e8`). Executing the real push.
**Session-131 / Batch CF (Cycle 81) 完成并已推送** — `56f80e8` 到 `main`（远程 ref 已验证相等，密钥已销毁，未建新分支）。

**本周期成果：**
- **冷基线**：lint ✓ · tsc ✓ · unit 1217/1217 · build ✓ · 冷 5-chunk e2e 567/567 · tripwire 249/130/0/119（第 40 次保持）；Batch CE diff 全部 9 项声明复审 TRUE
- **活体对等**：双主机电池全绿 — **第 38 次连续无 Tailwind v4 移动导航 bug**；新探针（抽屉动画族）双向 NONE，干净收口
- **轮换双审计**（shell/auth 轴 + crypto/infra 轴，均 CD 后两周期未深审）：0C/0H/2M/13L/10I，每个 M 级直接读验证
- **CF1–CF11 修复集（TDD）**：每邮箱注册/重发预算、共享桶启动警告、OTP 静态摘要 + 时序安全比较、resend 429 诚实文案、断点焦点恢复、siteUrl 自愈、暗色发丝线等
- **诚实纠错**：CF5 设计修正（Playwright 先启动 webServer 再跑 globalSetup — 冷重置移至预启动链式脚本）
- **重认证**：unit **1236/1236** · e2e **570/570**（147+179+72+94+78）· tripwire 第 41 次保持 · **1806 green** · 3 张证据截图 + CF7/CF9/CF11 活体验证
- **文档链**：完整更新（PAD v1.3.39、计划 §5、worklog、`docs/session_133.md`）

**下周期建议**（已记录）：scrypt KDF 参数/版本迁移（需单独测量周期）或轮换回 FE views 轴。

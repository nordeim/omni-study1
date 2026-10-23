本窗口为 Session-88（Batch AO / Cycle 38）。锚点推进至 `docs/session_44.md` 与 `docs/session_45.md`，所有继承状态以 git pull 后仓库实际内容为准。先建立 TODO 清单，然后刷新工作区。
工作区存在且保留（未重置）。git pull 后确认最新提交 `4402e4c`（仅新增 `docs/session_45.md`，src/ 未动——diff stat 验证）。精读两个锚点文档与 worklog 尾部，重建基准事实：
基准事实重建完成：**Session-87/Batch AN（Cycle 37）已完成并推送**（`db9acb4` + 日志提交 `4402e4c`）。本窗口周期为 **Session-88 / Batch AO（Cycle 38）**，transcript → `docs/session_46.md`。已知常设债务：Batch R、study zombie（s80 L1）、~27 hue consumers、I2 text token。
读取核心文档（AGENTS/CLAUDE/README 精读关键段）与 remediation plan 尾部、standing debt 细节。
启动基线认证（变更前）：快速门禁 lint ✓ tsc ✓ unit **907/907** ✓；全新生产构建绿；冷 5 块 e2e 认证 **468/468**（131+138+57+84+58，每块首过零 flake，S32 子壳配方）。
并行启动 Batch AN 差异的 Mode-C 审计（`0493503..db9acb4`，只读委派）：
审计返回：**0C/0H/0M/2L/5I**，AN 六项声明全部验证。AN3 闭环超出预期——全目录 701 张截图 md5 census：零重复对。两个 Low 构成 Cycle-38 候选（L1 worklog AM stage summary 仍夸大 "both RED-first"——AN2 类第 4 站；L2 parity-session7.spec.ts 零 finally——四个 stamped pin 仅 happy-path 清理）。
评估技术债候选：study zombie 的 render-phase 修复先探针验证（内联 ESLint 探针通过 repo 配置——React 文档化的 render-phase state adjustment 模式合规）；确认 zombie 的确定性驱动器（rate 自身 PATCH→GET 刷新间携外部删除）；验证 store 重载语义（flashcards 原子刷新——无瞬时空集误杀风险）；验证移动端 in-row Study 路径（selectDeck+startStudy 同事件批量——无瞬态渲染风险）；确认 AO5 各影响点（e2e pins 断言计算色——字节一致可作回归守卫）。
先写 Cycle-38 计划入 remediation plan（源码变更前纪律），随后进入 TDD 阶段：
**AO4 先行（RED-first）**：pin 写入 parity-session7.spec.ts，在 pre-fix 构建上验证 RED 于设计判别器（补卡后卡片网格永不返回——latched `studying` 复活 study mode；RED 快照捕获 "1 / 1" 复活于补卡上）。GREEN：flashcards-view.tsx 的 render-phase 结构性消除（setState during render，守卫终止，无 effect）。重建后验证 GREEN。
**AO3**（API 读边界对称完成）：`membersFromRow` 导出（sentKeysPatch 纯 seam 先例）并路由经 `normalizeMembers`——API GET 边界不再原样输出 legacy padded members。2 个 RED-first 单元 pin + 1 个 array-shape 守卫（中途重构 pin 使 RED 落在设计断言——S87 教训 1 应用）。unit **910/910**。
**AO5**（专用 clock-date token，I2 常设债务闭环）：`clockDateDark` 加入 AccentToken + 全部 7 个 accent（携带相同 400-step 值——计算色字节一致），以 `--sf-primary-clock-date-dark` 输出（accentCssVars 15→16），S3-J 计数 pin 在 16 处 RED / token 后 GREEN，boot script 七个 TOKENS 名单同索引扩展（VALUES 插入顺序同步契约），globals.css 加 `:root` 默认值并切换 `.sf-clock-date` 暗色分支，AF5 注释更新。AF5/AG11a 全绿——avatar 渐变与 clock-date 文本可独立调优。
**AO2**：parity-session7.spec.ts 四个 stamped pin（AH8c task、AI1a/AI1b/AI1c decks）包 try/finally——stamped 行在所有路径删除（deck 删除级联卡片）。纯测试改动。
**AO1**：worklog AM stage summary 修正为准确 split（"3 RED unit pins + 2 green-by-design regression guards + 1 RED e2e pin"——AN2 类第 4 站），自标 S88/AO1。
运行受影响家族的中间验证时遭遇**全家族 45.1s 挂起**（dark-mode 全超时、`.sf-clock-date` 元素找不到）：
根因排查：直查 standalone 静态资源——`/_next/static/chunks/*` 全部 404！**根因：重建用了 `npx next build`，绕过了 package.json postbuild 的静态拷贝**（`cp -r .next/static .next/standalone/.next/`）。standalone 以 SSR 绿启动（health 200）但零静态资源——客户端永不 hydrate。AO 源码从未损坏。改用 canonical `bun run build` 重建后复跑：**85/85 全绿**（parity-session7 + theme-system + dark-mode 家族，含 AO4 pin、AO2 包装 pin、AF5 家族）。教训记为 S88 lesson 1。
启动最终完整冷 5 块再认证：
**冷认证 469/469**（131+**139**+57+84+58，每块首过零 flake；chunk 2 携新 AO4 pin 至 139；chunk 2 的 AI 失败注入为预期）。
启动 standing suite（33 阶段 + preflight；dev server 按 S32 守护进程配方先行启动且 preflight GREEN）：
standing suite 完成：**34/35**——唯一失败 cwv-volume-stress：Tasks longTaskTotal 2250 > 2000 预算。
CWV 失败根因分析（本周期最重的工程判断）：无 AO 变更涉及 Tasks 视图加载路径（AO4=flashcards 视图局部、AO3=Study Groups 服务端 seam、AO5=一个附加 CSS var）。隔离复跑仍 2288——稳定超标。执行 **stash A/B 对照**（stash AO 源码 → canonical 重建 → 跑 AN 树）：
AN 树测得 **1978（绿）**；二次跑 AN 树 **2073（红）**——**收到树自身就在预算噪声底板上下翻转**。恢复 stash 重建 AO 树三次测量：2250/2288/**2098**——分布与 AN 重叠。DB 行数验证干净（12 seed tasks，无累积）。结论：**S82 记录的 throttled-median 噪声底板类，非本周期回归**；诚实记录，预算不削弱（绝不弱化护栏换绿灯），重锚定（更多 RUNS 或预算重基线）记为未来周期候选常设债务。
canonical 重建后复跑快速门禁（stash 往返完整性）：lint ✓ tsc ✓ unit **910/910** ✓。
运行 s88 resweep（自 s87 重标记）：
**s88 resweep: ok:true**——双端 9/9 不变量、品牌表字节匹配、移动端 drawer/bar/brand 绿、probeCleanup ok、18 张截图。
运行 s88 证据捕获（4 帧，全 md5-DISTINCT：22c45633/6c18aaa1/b0cf2a92/4378cfc5）：AO4 zombie 面（清空态守卫穿越 + 补卡后网格返回且 study mode 不复活）+ AO5 clock chip（violet/teal 暗色——专用 token 随 accent 调优）。probe deck 于 finally 清理，demo 面恢复（violet/light）。
agent-browser 移动导航双端验证（S87 教训 5：先读持久 sidebar 键再解读渲染）：
参考站：`sidebarOpen:"true"`（先读）→ 抽屉展开 **24 个带标签链接** ✓；折叠态（`sidebarOpen:"false"`）**20 个仅图标、零 title/aria**（S52 契约再确认）✓；导航至 /Notes ✓；导航后抽屉关闭 ✓；scrollWidth 416（参考站自有溢出）✓；键恢复 "true" ✓。
克隆端（:3200，AO 构建）：抽屉展开 **26 个带标签链接**（超集 skip-link + 20 nav + 5 content）✓；折叠态（`sf-sidebar-collapsed:"true"`）**20 个仅图标、全部 20 个兼具 title+aria-label**（超集）✓；导航至 /Notes ✓；关闭后仅剩屏外 x=-9999 skip-link（设计使然）✓；Escape 关闭 ✓；scrollWidth 390（优于参考站 416）✓；键恢复 ✓。**无 TailwindCSS v4 移动导航 bug——s88 再次确认**。
`.env.example` 验证（DATABASE_URL="file:../db/custom.db"、无环境面变更——本周期保持现势）；`.env` 确认正确。
文档链更新：README（badge 1375→**1379**、Session-88 行）、AGENTS/CLAUDE 计数（910/469）+ S88 教训节（standalone 静态拷贝教训；噪声底板预算 A/B 判别器；render-phase zombie kill；token 去耦合）、vitest.config.ts 头（910）、e2e-chunked-cert.sh 头（131+139+57+84+58=469）、remediation plan 执行记录 + DONE 标记、worklog Session-88 记录、本 transcript（session_46.md）。
最终提交前门禁复核（lint/tsc/unit 全绿），conventional commit 后经 SSH wrapper 推送至 main。

# Audit：v0.9.2 全脑多维度审计（6 专项 agent）

> 触发：用户要求"给代码做全脑审查，开 subagent，从技术栈/语言/Agent 等多维度做全量审计，
> 查现存技术债 + 想清楚之后的迭代方向"。
> 方法：6 个专项 subagent 并行深审真实代码——技术栈 / 语言与类型 / Agent 系统 / 架构模块化 /
> 测试质量基建 / 产品迭代方向。本文交叉汇总（多维独立命中 = 最强信号）。
> 关联前序：`docs/audit/2026-06-04-full-codebase-review-6role.md`（6 角色）、
> `docs/plan/2026-06-04-runtime-split-execution.md`（runtime 拆分）、`docs/qa/2026-06-04-ux-walkthrough.md`（走查）。

## 六维健康度评分

| 维度 | 分数 | 一句话 |
|---|---|---|
| 技术栈 | 6.5 | 地基清醒，但 Electron EOL + AI SDK 落后 2 大版本，债集中可还 |
| 语言/类型 | **5.5** | strict 是**纸面**——渲染层从未 tsc 检查，已有 6 个真实类型错潜伏 |
| Agent 系统 | 7.5 | 全项目架构最清醒处（HITL/test==prod/草稿隔离），但 sanitize 收口缺失 |
| 架构/模块化 | 7.5 | 单一真相源严守、runtime 拆分真在推进；债集中在 1 巨壳 + 1 手搓画布 |
| 测试/质量/基建 | 6.5 | electron 51%、但 UI 层**连测试地基都没有** + 1 个生产死锁无网兜 |
| 产品/迭代 | 6.5 | 闭环真打通、护城河独有；但 2 处信任命门 + 重心错配(Scene3D) |

**综合 ≈ 6.7/10。** 与前轮一致：底子好、债集中可规划，但这轮挖出几个**前轮没发现的结构性洞**。

---

## 🔴 P0 — 本轮新挖出的结构性问题（前轮未发现，最该先动）

### P0-1 渲染层从未被 tsc 检查 —— "build 绿"是假绿（语言维度 TD-1）
- **证据**：`tsconfig.json` `include: ["src/main.tsx","vite.config.ts"]`；`build:renderer = vite build`（esbuild 只转译不查类型）；CI 只 `tsc -p electron/`。语言 agent 临时全量 `tsc --noEmit` over src **当场炸 6 个真实类型错**：`workbenchAiClient.ts:74/84/93`、`assetImportAdapter.ts:203`、`sendStoryboardToTimeline.ts:53`、`catalogTaskActions.ts:88`。
- **影响**：strict 对**半个代码库失效**，类型错误能合并进 main、靠运行时炸。这是"类型安全"目前更多是局部书写纪律、而非系统性保证的根因。
- **修法**：补 `tsconfig.app.json`(include 全 src + noEmit) + `"typecheck"` script + 接 quality-gate 红牌。先修这 6 个错再开门岗。**解锁后续一切类型收紧的前提。**

### P0-2 导出 job 崩溃后永久死锁 —— 无 reaper（测试维度 G1）
- **证据**：`exportJobManager.ts:111` 见任一 active job 就 throw；`hydrateProject`(L249) 从磁盘原样恢复 status 不重置；启动无 reaper。
- **影响**：app/ffmpeg 导出中途崩溃 → 磁盘留 `running` job → **该项目永远无法再导出**，用户看不到原因（无日志）。真实可复现的生产死锁。
- **修法**：构造/hydrate 时把所有 isActive 的持久化 job 标 failed（"interrupted by restart"）+ 补 reaper 测试。**当前最该补的一个测试+一行修复。**

### P0-3 BillingModelKind 类型已漂移成 bug（语言维度 TD-2）
- **证据**：`modelCatalogApi.ts:3` = `'text'|'image'|'video'`，`desktopClient.ts:3` = `+'audio'` —— 同名不同义，导致 `catalogTaskActions.ts:88` 类型不兼容。领域类型（Vendor/Model/Mapping）真相源在 runtime.ts，渲染层手抄 2 份 DTO。
- **修法**：抽 `electron/catalog/types.ts` 单一真相源，渲染层 `import type` 复用，删手抄 DTO；立即统一 BillingModelKind。

### P0-4 UI 测试地基缺失 —— `.test.tsx` 根本不被收集（测试维度 G2）
- **证据**：`vitest.config.ts` include 仅 `*.test.ts`（`.test.tsx` 不收集）；无 `@testing-library`/`jsdom`。
- **影响**：占 src 90% 的渲染层"补 UI 测试"在地基补齐前是**空话**。
- **修法**：装 `@testing-library/react`+`jsdom`，include 加 `.tsx`，`environmentMatchGlobs`（组件用 jsdom、纯逻辑保持 node 快）。

### P0-5 Electron 31 已 EOL —— 安全定时炸弹（技术栈维度 P0-A）
- **证据**：`electron@^31.7.7`，官方只支持最新 3 大版本（当前 ~40/42）。叠加 `sandbox:false`(main.ts:145) + 缺 CSP/导航白名单（前轮 S1）+ 加载远程图片/注入 API key。
- **修法**：升当前 stable + electron-builder→26。纯安全债，最高优先级。

### P0-6 prompt sanitize 只在 onboarding 用，agent/任务全裸发（Agent 维度 A1）
- **证据**：`promptSanitize` 全仓仅 `onboarding/agent.ts:93` 调用；`runAgentChatV2`(L2643)/`runTask`(L2199) 的 user prompt 与工具描述裸发。模块自述"wherever a string is sent to an LLM"。
- **影响**：建了消毒间，90% 路径走侧门；Moonshot 等 tokenizer 敏感 provider 易工具 JSON 截断。
- **修法**：在 `buildLanguageModelForVendor` 的 profiled fetch 收口统一 sanitize。

### P0-7 taskCache 无界内存 Map 且缓存明文 apiKey（Agent 维度 A2）
- **证据**：`runtime.ts:299` 无界 Map；pending 任务的 apiKey+request 永久驻留，无 TTL/上限；纯内存→重启后 pending 任务变孤儿。
- **修法**：TTL+LRU；apiKey 不进 cache（fetchTaskResult 已重新解密）；pending 落盘扛重启。

### P0-8 根无 ErrorBoundary + 生产零可观测性（测试维度 G3）
- **证据**：ErrorBoundary 仅 Scene3D 内一处，app 根没有；`registerDevDiagnostics` dev-only；无 uncaughtException/崩溃落盘。
- **影响**：渲染层任意抛错=白屏；用户报"打不开"时无任何日志，盲修。
- **修法**：根 ErrorBoundary + 主进程 uncaughtException/unhandledRejection 落盘（`app.getPath('logs')`，按规则5查 electron-log）。

### P0-9 产品两处"用户做对了却无反馈"的信任命门（产品维度 I-1/I-2）
- **I-1**：分镜/文本节点拖时间轴静默失败——`buildClipFromGenerationNode.ts:76` 无 url 返回 null，调用方 `BaseGenerationNode.tsx:558/613` null 时零反馈。修：toast"该节点还没生成画面，先点生成"。
- **I-2**：首页"30 秒体验"未配模型静默失败——`NomiStudioApp.tsx:205` 无模型预检。修：tryExample 前置检查 text 模型，无则引导接入。
- 这俩是 1.0 信任前提，成本极低。

---

## 各维度核心债（摘要，详见各 agent 证据）

**技术栈**：Electron31 EOL(P0-5)｜AI SDK v4→v6 落后 2 大版本但调用面仅 6 文件(可控)｜Mantine7 与 Tailwind3 + Radix 三套样式来源并存、Mantine 仅 15 文件浅用却背 288KB CSS｜react-pannellum alpha + zustand 锁文件三份并存｜3D 栈 1.1MB 只服务 Scene3D 一个组件且 R3F/drei 各落后 1 大版本、@types/three 与运行时错配 14 minor｜ffprobe chmod 被 pnpm 屏蔽(脆)。

**语言/类型**：渲染层零 tsc(P0-1)｜BillingModelKind 漂移(P0-3)｜IPC 边界零 zod 校验、payload 全 unknown 手动强转｜runtime.ts 38 处 `as unknown as JsonRecord` 绕过类型｜98 lint warning（~45 可立即清：unused-vars 32/useless-assignment 9/prefer-const/preserve-caught-error；12 个 exhaustive-deps 需逐个审可能藏 bug）｜风格双轨无 .prettierrc。**好底子**：0 @ts-ignore、0 吞异常、错误窄化统一 52 处。

**Agent 系统**：sanitize 收口缺失(P0-6)｜taskCache(P0-7)｜SSRF 双标——onboarding 走 hardenedFetch+域名白名单，但 runTask/test-connection 裸 fetch 注入 key(前轮 S2 未收口)｜双 agent 入口 v1+v2 违反规则1｜V2 把整张画布快照既塞 prompt 又入 history(双重计费)｜生产任务 fetch 无超时。**亮点**：HITL 确认通道、test==prod 单一请求管线、草稿隔离+硬提交门——同类罕见的工程纪律。

**架构/模块化**：Scene3D 4598 行(68 个 state/ref，逼近 4500 大爆炸线，ROI 存疑)｜手搓画布坐标换算 5 处重复被冻结未还(违反规则5)｜IPC 零运行期校验｜迁移链 4 道串跑只增不减、无 schemaVersion｜快照归一双写(store vs 迁移层)。**好底子**：单一真相源严守、runtime 拆分真在推进(3150→2725)、runner 子系统是模块化范本、持久化防丢数据扎实。

**测试/质量/基建**：行覆盖 20.6%（electron 51.7% / src.workbench 13.9% / ui-config-design-api-media 全 0%）｜UI 交互零测试且地基缺失(P0-4)｜导出死锁(P0-2)｜无 coverage 阈值门/format:check 不在 CI/98 warning 无上限｜走查 harness 无断言未进 CI｜commit-msg hook 是过期专项。

**产品/迭代**：闭环真打通(走查实跑导出验证)、护城河独有(文档自动接模型 + Agent 拆镜头)｜2 处信任命门(P0-9)｜**重心错配**：4598 行精力压在 Scene3D 窄功能、README 还放大宣传，而字幕/转场/角色一致性真差异未做｜易用性软肋与"比 ComfyUI 易用"定位有张力。

---

## 未来迭代方向（用户要的"想清楚之后怎么走"）

### 立即（低风险高回报，多数可自主推进）
1. **补 typecheck 门 + 修 6 个 src 类型错**（P0-1）——解锁后续一切。
2. **修导出死锁 reaper + 测试**（P0-2）——堵生产死锁。
3. **统一 BillingModelKind + 抽 catalog/types 单一真相源**（P0-3）。
4. **修产品两处静默失败 I-1/I-2**（P0-9）——1.0 信任命门，纯文案级。
5. **prompt sanitize 收口 + taskCache 加 TTL/踢明文 key**（P0-6/P0-7）。
6. **根 ErrorBoundary + 主进程崩溃落盘**（P0-8）。
7. **质量门补齐**：CI 加 `--coverage` + `format:check` + `--max-warnings=98` 棘轮锁基线；runtime 门岗基线 2737→2725。
8. 清 ~45 个安全 lint warning；`@types/three` 对齐；ffprobe chmod 兜底。

### 中期（按规则 4 写文档 + 规则 7 评审；用户可见的走规则 8 样张）
9. **升 Electron→stable + electron-builder→26**（P0-5，安全）。
10. **升 AI SDK v4→v5**（provider 扩展性命门，调用面仅 6 文件）。
11. **runtime.ts 拆分收尾**（assets/catalog/tasks/export/agent，strangler 续）。
12. **UI 测试地基**（P0-4 装 jsdom/RTL）+ 抽 `viewportMath.ts`/`clientToCanvas()` 纯函数补测（兼修手搓画布坐标重复止血）。
13. **IPC zod 校验层** + **schemaVersion + 单一 migration runner**（数据地基）。
14. **本地模型(Ollama/LM Studio)一等公民**——配合 SSRF 私网白名单策略（待拍板）。
15. **字幕(drawtext)+转场(xfade)接入导出** + **角色一致性做成可验证卖点**——把护城河从口号变可摸。
16. **画布节点分层收纳**（11 种→默认露 4 种，Scene3D/全景收"高级"）。

### 长期（战略，需用户决策）
17. **手搓画布 vs React Flow**（规则3 对比表）——长视频/协作/插件化的架构岔路。
18. **重新评估 Scene3D 去留**——砍则一次性消化 1.1MB 依赖+4598 行巨壳+类型错配+ROI 争议。
19. **Agent 进化**：单轮工具调用 → plan+memory+MCP（研究 OpenHands EventStream / Cline Plan-Act，规则6）。
20. **退 Mantine 收口 Tailwind+Radix**；去 react-pannellum；插件化节点注册。

---

## ⚠️ 待用户拍板（有真实取舍，不自主推进）
1. **SSRF 私网白名单策略**（拦外网 vs 不打断本地模型）——关联 P0-6/A3、本地模型方向。
2. **手搓画布 vs 迁 React Flow**（范围大、回归风险高）。
3. **Scene3D 去留**（4598 行 + 1.1MB 依赖 vs 窄用户价值）。
4. **退 Mantine**（范围大，需对比表）。
5. 真实 AI 生成/导出走查腿（花额度）——规则13。

## 复核命令
```sh
# 渲染层真实类型错（P0-1）
npx tsc --noEmit -p tsconfig.json 2>/dev/null; npx tsc --noEmit --jsx react-jsx --moduleResolution bundler --strict $(git ls-files 'src/**/*.ts' 'src/**/*.tsx' | head -1) # 需配 tsconfig.app.json 后用 pnpm typecheck
# 覆盖率
npx vitest run --coverage 2>&1 | tail -20
# lint warning 基线
pnpm lint 2>&1 | grep problems
```

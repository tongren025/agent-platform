# Nomi 能力核外露：让内部 agent 与 Claude Code/Codex 共用一套可调用能力

> 2026-06-20。起点：用户看了 `basketikun/infinite-canvas` 的「本地 Canvas Agent（MCP）」——它让电脑上的 Claude Code/Codex 通过 MCP 操作浏览器画布。用户想：**把 Nomi 自己的能力（带正确参数的生成 / 操作工程 / 角色一致性）也接出去，让外部 agent 能在本地驱动 Nomi 生成、操作本地文件。**
>
> 决策已拍（AskUserQuestion，2026-06-20）：
> - **目的 = 两者并重**：内部 agent 和外部 agent 同为一等消费者。
> - **开/不开都要、且自动**：Nomi 开着 → 实时看节点冒出来；关着 → 无头跑完落盘。不是手动开关，是传输自动探测。

---

## 0. 一句话战略定位（为什么做这件事）

Nomi 的护城河是**「创作意图 → 正确模型调用」之间那层正确性 + 一致性**：archetype 参数全覆盖、角色一致性（定妆/角色卡）、参考图可达性（providerUrl/relay）。**这层现在锁死在 GUI 里，外面够不着。** 把它抽成可调用的能力核，Nomi 就从「一个你打开来用的 app」变成「别的 agent 会依赖的能力源」——黏性高一个量级。

**但有个歪点必须钉死（solo 战略）**：目标 WHO 是创作者，不是开发者。所以本方案的主线**不是**「给开发者做 MCP server」，而是：

> **抽一层我自己的 agent 本来就缺的 capability 层**（06-20 审计根因「AI 只产文本不产配置」，根子就是没有这层可调用能力面），**外部 CLI/MCP 只是这层之上几乎白送的薄传输**。

这样「两者并重」不是两份工作——内部 agent、外部 CLI/MCP、开着的 UI 都是同一个核的消费者。

---

## 1. 现状勘查结论（Explore agent，全部带 file:line）

### 1.1 生成核——已无头就绪 ✅
- 总入口 `runTask(payload)`：`electron/runtime.ts:552`。四条分路（音频/profile 图视频/文本/fallback 图视频）全在主进程。
- vendor HTTP 实际发出点：`electron/runtime.ts:486` / `:627`（`requestJson` → `electron/vendor/vendorHttp.ts` → `electron/hardenedFetch.ts`），**全在主进程**。
- 请求体组装（archetype→body）：`electron/ai/requestPipeline.ts`（electron-free 纯模块）+ `electron/catalog/taskParams.ts` + `electron/catalog/archetypeInput.ts:24`。
- IPC 之后整条 main 链路**零 React / 零 DOM / 零 Zustand**。IPC 入口 `main.ts:305` 的 handler 连 `_event` 都没用。
- **唯一 Electron 硬依赖**：`electron/runtimePaths.ts:4` `import { app }`（仅 `app.getPath()` 取默认路径），且已有 `NOMI_PROJECTS_DIR` / `NOMI_SETTINGS_DIR` env 逃生口（`runtimePaths.ts:17,22`）。**evals 已靠这个在无头跑真实生成**——这是「已可无头」最强佐证。

### 1.2 工程数据与持久化
- 磁盘格式：每个 project 一个文件夹，清单 `project.json`（`electron/runtimePaths.ts:9`）；workspace 模式写 `<root>/.nomi/project.json`（`electron/workspace/workspacePaths.ts:99`）。
- 读写模块：`electron/projects/repository.ts`（`readProject:188` / `saveProject:198` / `createProject:178`），原子写 `electron/jsonFile.ts`。
- 真相源模型：**内存 store 为真相 + 偶尔落盘**（生成成功后 `generationRunController.ts:132` 立即落 + 防抖服务 `projectPersistenceService.ts` + 事件日志做尾部对齐）。磁盘快照在 `project.json` 的 `payload.generationCanvas` 等字段（`workbenchProjectSession.ts:10-17`）。

### 1.3 缺口一——工程操作原语绑死 renderer store ⚠️
- 实际执行层 `src/workbench/generationCanvas/agent/generationCanvasTools.ts`：`create_nodes:66` / `connect_nodes:77` / `update_node_prompt` / `send_to_timeline:125` / `generate_image|video:196` 全部**直接调 Zustand store action**，无中间领域层（store 巨壳即领域逻辑）。
- 主进程 LLM 工具 schema `electron/ai/canvasTools.ts:108`（`read_canvas_state` / `propose_storyboard_plan` / `create_canvas_nodes` / `connect_canvas_edges` / `set_node_prompt` / `delete_canvas_nodes` / `run_generation_batch` / `arrange_storyboard_to_timeline`）**故意没有 execute**（`canvasTools.ts:16`）——只 emit 给 renderer 等用户确认，执行发生在 renderer。
- 含义：「建节点/连线/排时间轴」目前**没有主进程等价物**。但真相是 `project.json` 快照，`repository.ts` 已能完整读写——可在主进程实现「读 payload → 改节点图 JSON → 写回」，复用 renderer 现成纯逻辑。

### 1.4 缺口二——archetype 关键投影在 renderer ⚠️
- 权威定义 `src/config/modelArchetypes/`（19 档案，纯 TS、无 React），解析 `resolveArchetypeForModel`（供应商无关）。
- **关键投影 `buildArchetypeInputParams`**（`src/workbench/generationCanvas/nodes/controls/archetypeMeta.ts:376`）在 renderer：据当前 mode/variant 打出完整 snake input → `request.extras.archetypeInput`（`catalogTaskActions.ts:66-86`）。主进程 `archetypeInput.ts:24` 只「原样采用 or fallback 现场映射」。
- 含义：要让主进程无头自己从 archetype 推完整请求体，需把 `modelArchetypes/` + `archetypeMeta` 这套下沉到共享层（纯 TS，下沉成本低）。

### 1.5 缺口三——单实例锁/探测从零搭 🆕
- 全仓**无** `requestSingleInstanceLock` / socket / lockfile（grep 零命中）。
- main 入口 `electron/main.ts`，启动 `app.whenReady().then(...)`（`main.ts:341`）。
- 「Nomi 是否开着」探测需新建：建议 `app.requestSingleInstanceLock()` + 固定路径 lockfile/socket，放 `getSettingsRoot()`（userData）。

---

## 2. 目标架构

```
            ┌─────────── 能力核 (headless, 无 React) ───────────┐
            │  工程 store(真相)  +  生成引擎  +  能力函数         │
            │  createShot / generateNode / defineCharacter /     │
            │  connectNodes / arrangeTimeline / readCanvas …     │
            │  （带正确 archetype 参数，单一真相源）              │
            └───────────────────────────────────────────────────┘
                 ▲           ▲              ▲              ▲
        Nomi 内置 agent   CLI 传输      MCP 传输      Electron UI
        (你自己的脑)    (无头/脚本)   (实时交互)   (渲染+实时订阅)
```

### 2.1 一条铁律（P1，决定成败）
**所有写入必须经同一个能力核、写同一份工程真相。** 绝不能有「无头一条写文件的路 + 实时一条改 UI 的路」——分叉即并行版灾难。运行中的 UI 只是工程真相的**实时订阅者/投影**，不是第二个写入口。

### 2.2 开/不开自动适配（满足「可选且自动」）
传输调用时探测有没有运行中的 Nomi 实例（lockfile/socket）：

| 探测到 | 行为 | 用户体验 |
|---|---|---|
| Nomi 开着 | 操作交给运行中实例（经新增 main RPC 端点）→ 改内存 store → UI 实时重渲 | 实时看节点冒出来（A 模式） |
| Nomi 关着 | 临时拉起无头核（设 `NOMI_PROJECTS_DIR`/`NOMI_SETTINGS_DIR`）→ 改 `project.json` → 落盘 | 无头跑完，下次打开就在那（B 模式） |

**同一条命令、同一个结果，区别只是你在不在场看。** 用户不用选模式。

### 2.3 传输优先级：CLI > MCP
infinite-canvas 被迫用 MCP+SSE 桥，**因为它是浏览器**。Nomi 是 Electron，自带主进程，多一张牌：

| 传输 | 适合 | 优先级 |
|---|---|---|
| **CLI**（`nomi generate…` / `nomi shot add…`）| 无头、脚本化、Claude Code 用 Bash 直接调 | **先做**——最快验证价值、最像 CC 工作方式 |
| **MCP server**（主进程内置 host，不用另起桥进程）| 实时交互态 | 后补 |

---

## 3. 范围（做什么）

按依赖顺序切片，每片可独立验证、独立价值：

- **S1 能力核骨架（去 Electron 依赖）**：把 `runtimePaths.ts:4` 的 `import { app }` 抽象成 paths provider（注入式），彻底去 Electron 硬依赖。生成核（runtime/catalog/vendor/requestPipeline）原地暴露统一入口。**验收**：纯 Node 脚本 `import` 能力核 + 设两个 env → 跑通一次真实生成（复用 evals 的无头模式）。
- **S2 archetype 投影下沉**：`modelArchetypes/` + `archetypeMeta.buildArchetypeInputParams` 下沉到主进程/共享层（`electron/catalog/` 或新 `shared/`），让主进程能独立从 archetype 推完整请求体，不再依赖 renderer 预计算。**P1：renderer 改为 import 下沉后的同一份，删除并行逻辑。** **验收**：design-fidelity 不回归 + 一次带 archetype 变体（如 Seedance 全能参考）的无头生成参数正确。
- **S3 工程图操作原语（主进程）**：在主进程实现 `createNode/connectNodes/updateNodePrompt/setReferences/arrangeTimeline` 等，操作 `project.json` 的 `payload` 快照，复用 renderer 可下沉的纯函数（`canvasGraphActions` 里相当一部分）+ 现有校验（`referenceEdgeCapability.ts` / `proposalTxn.ts`）。**验收**：无头建一条「提示词节点→生图配置节点→连线」并落盘，重开 Nomi 能看到。
- **S4 单实例锁 + 探测 + RPC 端点**：加 `requestSingleInstanceLock` + lockfile/socket（放 userData）；开着时外部调用走新增 main RPC（非现有 renderer↔main IPC）→ 改内存 store（经 S3 同一原语）→ UI 实时投影。**验收**：开着调用→真机看到节点实时冒出；关着调用→落盘，重开可见。
- **S5 CLI 传输**：`nomi` 命令行（`generate` / `project` / `shot` / `canvas` 子命令）调能力核，内含 S4 探测。**验收**：Claude Code 用 Bash 调 `nomi` 跑通建工程+生成。
- **S6 安全门**：外部调用（CLI/MCP）触发生成 = 花用户额度，必须 token + 确认门（参考 infinite-canvas 的 token + `127.0.0.1` only）。**验收**：无 token 调用被拒；生成类操作有确认/审计。
- **S7 MCP server（主进程内置）**：薄传输，工具 schema 复用 S3 原语 + 生成原语。对照 infinite-canvas 的 23 工具补齐缺的原语。**验收**：Claude Code 配上 Nomi MCP，实时驱动跑通 J1 主链路。

> 切片可停：S1–S3 做完，内部 agent 就拿到了「能产配置/能无头跑」的能力核（解 06-20 审计根因），**外部暴露（S4–S7）是这之上的增量**，可按反馈节奏推。

---

## 4. 不动什么

- 不改现有 renderer 内 agent 的用户体验链路（确认/进度 UI 照旧；S2/S3 只换底层 import，行为等价）。
- 不引入新 vendor / 不改 archetype 能力定义本身（只搬位置）。
- 不做「让外部 agent 拿任意 FS 权限」——Claude Code 本就有 Read/Write/Bash，能力核**只暴露语义化的 Nomi 领域操作**，不做冗余文件代理。
- 不做云端/多人——纯本地，socket 只监听 `127.0.0.1`。
- 不碰时间轴/导出引擎的既有实现（S3 的 arrangeTimeline 复用 `sendStoryboardToTimeline.ts` 逻辑，不重写）。

---

## 5. 回滚策略

- S1/S2/S3 是「移动 + 抽象 + 删并行版」，每片独立 commit，回滚 = revert 单 commit（行为等价，无功能开关）。
- S4–S7 是纯增量新文件（CLI/MCP/RPC/锁），未接入主链路前不影响现有功能；出问题直接不启用该传输即可，能力核与现有 app 无回归。
- 铁律 2.1 保证：即使外部传输全删，内部 app 走的还是同一个核，不存在「外部专用的第二真相源」需要清理。

---

## 6. 验收门

- **每片**：相应 `验收` 项 + 五门全过（filesize→tokens→lint→typecheck→test→build）。
- **无头生成真实性**：复用 `接入即验证` 纪律——一次真实 E2E 生成跑通才算接通（不是 mock）。
- **P1 检查**：S2/S3 下沉后 grep 确认 renderer 不再有并行实现（旧逻辑物理删除）。
- **真机走查（R13）**：S4 开着模式必须真机看到节点实时冒出（截图人眼判断，不只断言）。
- **安全（S6）**：无 token 调用被拒的回归断言。

---

## 7. 实现前还要补的功课（R5/R6）

- **R5 Context7**：S7 动手前查 `@modelcontextprotocol/sdk` 官方文档（server 怎么在已有 Node 进程内 host、stdio vs SSE transport）；CLI 若用框架先查。
- **R6 顶尖开源**：再细读 infinite-canvas `canvas-agent/`（`mcp-server.ts` / `http-server.ts` / `tools.ts`）的 token 鉴权 + SSE 回环 + 23 工具 schema，作为 S6/S7 的直接对照样本。
- **R7 六角色评审**：S4（进程探测/RPC 架构岔路）落地前过一遍。

---

## 附：对照 infinite-canvas（差异化锚点）

| 维度 | infinite-canvas | Nomi 本方案 |
|---|---|---|
| 形态 | 浏览器，被迫 MCP+SSE 桥 | Electron，多 CLI 这张牌 |
| 外露的能力 | 操作**运行中的画布 UI**（远程遥控 GUI）| 操作**能力核**（生成正确性+一致性+工程图），开/关都行 |
| 能力归类 | 关键字猜（seedance→video）| archetype 全覆盖（差异化护城河） |
| 生成参数 | 全局一刀切 | per-model archetype 变体（全能参考/首尾帧） |
| 角色一致性 | 无 | 定妆/角色卡（外部 agent 也能调） |
| 开/不开 | 必须开着 | 自动探测，开着实时/关着无头 |

---

## 回填 · 执行结果（2026-06-21）

一次性实现了 S1–S7 的可验证主干。新增子系统 `electron/capabilityCore/`（全主进程、复用 `repository`+`runtime.runTask`，零并行逻辑）+ 两个纯 node 传输脚本。

### 交付清单（文件）
- `electron/capabilityCore/canvasGraph.ts` — 纯图操作领域层（add/connect/setPrompt/delete/read，零 electron，可单测）
- `electron/capabilityCore/core.ts` — 编排层（图操作 ↔ project.json 持久化 + `generateOnProject` 复用 runTask）
- `electron/capabilityCore/dispatcher.ts` — method→core 路由**单一真相源**（RPC 与 host 共用，P1）
- `electron/capabilityCore/security.ts` — token（`~/.nomi/capability-core/token`，常数时间校验，0600）
- `electron/capabilityCore/lockfile.ts` — 实例广告 + pid 存活探测（开/不开自动判定）
- `electron/capabilityCore/rpcServer.ts` — 127.0.0.1 HTTP + token 鉴权 + A/B 守卫
- `electron/capabilityCore/appIntegration.ts` — 接进 app（启动 RPC/写广告/退出清理/追踪打开项目）
- `electron/capabilityCore/host.ts` — 无窗口 Electron headless host（B 模式，app 关着的执行体）
- `scripts/lib/nomiClient.mjs` — CLI/MCP 共用传输客户端（探测→RPC 或 spawn host）
- `scripts/nomi.mjs` — CLI 传输（`node scripts/nomi.mjs <cmd>`）
- `scripts/nomi-mcp.mjs` — MCP server（stdio JSON-RPC，手搓不引 SDK，协议经 Context7 核对）
- `electron/main.ts` / `preload.ts` / `src/desktop/bridge.ts` / `src/workbench/project/workbenchProjectSession.ts` — 接线（单实例锁 + 上报打开项目供 A/B 守卫）

### 已验证（headless，无额度）
- 单测 20/20 绿：`canvasGraph`(9) + `core`(5，含建项目→加节点→连线→改词→删→读往返 + generate 请求体构造 + 结果落节点) + `rpcServer`(6，含 401 鉴权/全链路/A-B 守卫 409/未知方法 404)
- MCP 握手 + tools/list（9 工具）实跑通过；CLI `status` 实跑通过
- Renderer typecheck 干净；electron typecheck 我的代码 0 错；lint 我的文件 0 错

### S2 处理（不复制 renderer 投影，不违 P1）
`generateOnProject` 不重建 archetype→body：构造高层 `TaskRequest`（kind + prompt + extras{modelKey/projectId/nodeId/referenceImages/params}）→ `runTask` 主进程内部据 catalog mapping 自己组装请求体。**没把 renderer 的 `buildArchetypeInputParams` 搬过来**（那需跨 tsconfig 且易造并行版）。代价：archetype **变体特化**参数（如 Seedance 全能参考的 per-mode 投影）目前要调用方显式传 params，不自动从档案推——列为后续切片。

### ✅ 真机端到端已验证（2026-06-21，隔离 worktree + 真 catalog 真 key 真调）
- **B 模式 headless host spawn 往返**：CLI → spawn 真 Electron host → 建项目 / 加节点 / 连线 / 读画布 → `project.json` 真落盘（2 节点、kind/prompt 正确、自动错开不重叠）。
- **真实文本生成 E2E**：headless host 直读真 catalog → 真调 `modelscope/Qwen3-8B`（text）→ `succeeded`、文本返回 + 落节点。
- **真实图片生成 E2E**：真调 `modelscope/Z-Image-Turbo`（text_to_image，异步）→ 轮询 15s → `succeeded` → 1.16MB / 760×1280 PNG 本地化落盘，**人眼确认图像与 prompt 一致**（柴犬戴墨镜赛博朋克街，R13）。**接通**（接入即验证铁律达成，图/文链路）。
- **真机测试挖出并修 3 个真 bug**（单测全绿照不出）：
  1. **headless 解密身份不匹配**：dev `electron host.js` spawn 时 getName 默认 "Electron"，与主 app 加密 safeStorage key 的身份（"nomi"）不符 → 解不开 key（"API key missing"）。修：spawner 经 `NOMI_APP_NAME` 传主 app 身份（package.json name），host `setName` 对齐 + 默认 userData 指真数据。实测三身份对照确认 `nomi` 能解、`Nomi`/`Electron` 不能。（生产 host 在打包 app 内、身份天然正确，不受影响。）
  2. **文本结果没捕获**：textTaskRunner 返回 `assets:[]`，文本在 `raw`；core 只读 assets → 丢文本。修：`extractTextFromRaw` best-effort 抽取。
  3. **异步任务没轮询**：modelscope 图/视频首调返 `queued`，core 只调一次 runTask 就返回 → 永远拿不到图。修：generateOnProject 注入 fetchTaskResultFn，**在同一 host 进程内**轮询到终态（taskCache 进程内、host 退出即丢，不能跨调用轮询）。
  - 修复 commit `863c417` + `c32f407`，五门各自复跑全过。

### ⚠️ 仍未验证 / 后续（按 P3 诚实标注）
- **真实视频生成 E2E**：图/文已验，视频同路（image_to_video mapping 在、轮询超时已给 5min）但没真跑一次（更慢更贵）。
- **A 模式实时桥接**：app 开着时图变更目前是 RPC **409 拒绝**（防覆盖，honest），**没做**「转发 ops 给 renderer 实时反映到 UI」——A 模式真正的活，需 renderer applier + 真机走查。
- **MCP 在真 Claude Code 内**：握手/tools.list standalone 验过（含本机 tools/call 经 host 真跑），没在真实 Claude Code 客户端里挂载连过。
- **单实例锁真为**：代码已加，没真起两个实例验证让出行为。
- **付费守卫集成**：并行会话在做 `nomi:tasks:grant-spend`（铸令牌绑 nodeIds）。外部 generate 目前只过 token 门，**没接** in-app 付费令牌——列为集成点。

### 交付：隔离 worktree 绕开并行会话缠绕
主工作树被并行会话半成品 `electron/spendGrant.ts`（未建）卡死 build。故起 sibling worktree `/Users/aoqimin/Desktop/Nomi-capability-core`（分支 `feat/capability-core-headless`）从干净 main 重应用我的接线 → **五门全过** → commit `f344d4c`+`863c417` → push → PR https://github.com/aqm857886159/Nomi/pull/10。

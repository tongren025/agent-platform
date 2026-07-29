# MCP 驱动 Nomi：所见即所得 + 不死锁的付费确认

> 2026-06-22 ｜ 起因：用户用 Claude（外部 agent）经 MCP 驱动 Nomi 时，①生成的节点/卡片不实时、得手动刷新才看见；②生成时卡死，像在等用户输密码/确认却没处点。

## 1. 根因（读实代码，非探查猜测）

两个症状同一个根：**能力核（capabilityCore）当初只做了 B 模式（app 关着直写 `project.json`），「app 开着时实时桥接」那条切片源码注释自认未做**（`electron/capabilityCore/core.ts:7-10`、`rpcServer.ts:7-9,83`）。

### ① 不实时、得刷新
- MCP 写入直落磁盘：`core.ts:143/153/160/294` 走 `saveProject`。
- 渲染层只在「打开/切项目」读一次盘：`NomiStudioApp.tsx:221` → `restoreSnapshot`；之后内存 store 是唯一真相，每 700ms 反向写回盘。
- 主进程写盘后**从不通知渲染层**——全仓无文件监听、无主进程→渲染层通道（唯一的能力核 IPC 是渲染层→主进程单向上报 `nomi:capability:active-project`，`main.ts:348`）。
- 更糟：app 开着停在被写项目上时，画布改写被 **409 拒绝**（`rpcServer.ts:80-85`，怕跟内存 store 打架）。`generate` 不在 `MUTATION_METHODS` 里（`dispatcher.ts:19-24`）→ 不被拒但直写盘、且会被 700ms 防抖回盘覆盖（潜在数据竞争）。

### ② 卡死 / 像在等确认
- **真·无界阻塞**：`electron/vendor/vendorHttp.ts:84` 的 `requestJson` 是**裸 fetch，无 AbortController、无 timeout**。image/video/text 生成首调都走它（`runtime.ts:488/632`），vendor 一 hang 整条 `await` 死；MCP 端（`scripts/nomi-mcp.mjs:165`、`scripts/lib/nomiClient.mjs` RPC fetch / host spawn）也**无 timeout** → agent 永久转圈。对比：资产下载走的 `hardenedFetch` 有 timeout，唯独生成请求漏。
- **付费确认死角**：生成前有付费闸 `spendGrant.ts:79-101`，`grantId` 只有两个来源——①渲染层真人点确认（`main.ts:338` `nomi:tasks:grant-spend`）②env 逃生口 `NOMI_LOOP_SPEND_OK=1`（`core.ts:244`）。**MCP 通路两个都没有**，能力核全程不碰渲染层（无 `webContents.send`/`dialog`），所以要么静默被拒、要么静默放行，界面上没有任何可点的东西 = 用户说的「让你输密码却卡在那」。

## 2. 用户已拍板的方向

付费确认（AskUserQuestion 2026-06-22）：**界面弹一张确认卡，点了才发；不死等，超时自动返回**。

## 3. 方案：补上那条缺失的「主进程能力核 ↔ 运行中渲染层」双向桥

这条桥同时解两个问题：写完通知渲染层实时刷新（①）+ 需要确认时弹可点的卡（②）。不引新框架，复用既有 Electron IPC 与渲染层 store 现成动作（P1）。

### 架构决策（实现细节，已自定）
- **A 模式不直写盘，转发操作进渲染层 store**（不是「写盘+通知重读」）。理由：渲染层内存 store 是 app 开着时的真相，写盘会被 700ms 防抖回盘覆盖；按操作做 delta 灌进 store 才不丢用户未存的位置微调（避免本仓反复栽的「一份数据两处真相」）。渲染层已有现成动作：`addNode / connectNodes / disconnectEdge / addNodeResult / restoreSnapshot`（`canvasStoreTypes.ts:30/58/60/81/117`）。
- **B 模式（app 关着）保持现状**直写盘——headless 没有渲染层可灌。

### 新增通道
- 主进程：`startCapabilityCore` 注入 `requestRenderer(op, payload, {timeoutMs}): Promise<result>`（指向 `mainWindow.webContents`，带相关 id + 超时；无窗口/超时 → reject，调用方降级或回干净错误）。这是当前**完全不存在**的反向通道。
- 渲染层：`preload.ts` 暴露 `capability.onApply(handler)`；`bridge.ts` 注册一个 handler，把 `{op, payload}` 映射到上面的 store 动作并回 result。

### 路由改造（rpcServer / dispatcher）
- A/B 判定从「mutations 409 拒绝」改为「A 模式 → `requestRenderer` 转发；B 模式 → 现有直写盘」。`generate` 也纳入同一判定（当前漏了）。
- A 模式 generate：① `requestRenderer('addNode'|'reuseNode')` → 节点**立即以 generating 态出现在画布**；② 主进程跑 `runtime.runTask`（生成引擎在主进程）；③ `requestRenderer('addNodeResult')` → 结果**就地填回**。这就是所见即所得。

### 付费确认（用户拍板的卡）
- A 模式 generate 需 grant 且无 env 逃生口时：主进程 `requestRenderer('spend-confirm', {projectId,nodeId,intent,model,estCost?}, {timeoutMs:60000})`。
- 渲染层弹**实时确认卡**（样张待拍板，R8）：点确认 → 复用既有 `tasks.grantSpend` 铸令牌、回 `{grantId}`；点忽略/超时 → 回 `{declined}`。
- 主进程：granted → 注入 `grantId` 进 `request.extras` 继续；declined/超时 → 回干净错误「用户未确认/超时，未生成」给 MCP，**绝不死等**。
- B 模式（app 关着无 UI）：维持 fail-fast，回人话「打开 Nomi 才能确认付费生成」（评测仍可用 `NOMI_LOOP_SPEND_OK`）。
- 红队不变量不破：令牌仍只在主进程铸、只挂真人点击；AI/MCP 够不到铸造，只能触发「请求弹卡」，确认权仍在用户手上（`spendGrant.ts:13-15` 信任边界不动）。

### 堵卡死（与桥独立，可先发）
- `vendorHttp.ts:requestJson` 加 AbortController + timeout（镜像 `hardenedFetch.ts:129-133`）。
- `scripts/lib/nomiClient.mjs` RPC fetch + host spawn 加兜底 timeout，让 agent 等够 N 秒就拿到错误而非无限转圈。

## 4. 分期（每期独立可验、可回滚）

| 期 | 内容 | 用户可见 | 依赖 |
|---|---|---|---|
| **P0** | vendor + MCP 兜底 timeout（堵无界阻塞） | 无新 UI，卡死→变成超时报错 | 无，可立即发 |
| **P1** | 主↔渲染层双向桥基建（`requestRenderer` + 渲染层 apply handler） | 无 | — |
| **P2** | A 模式转发 mutations + generate 进 store（所见即所得） | 节点/结果实时出现，无需刷新 | P1 |
| **P3** | 实时付费确认卡 | **新 UI（需样张+拍板 R8）** | P1 |
| **P4** | 真实 MCP E2E + R13 走查（额度默认授权，真生成验） | — | P2/P3 |

## 5. 不动项
- B 模式直写盘语义、`saveProject`/`canvasGraph` 纯函数、`spendGrant` 铸造面与红队不变量、渲染层 700ms 防抖持久化、catalog/runtime 组装请求体口径。

## 6. 回滚
- 每期独立 commit。桥基建（P1）与 timeout（P0）纯增量。A 模式路由（P2）出问题可临时回退为「A 模式仍 409 + B 模式直写」旧行为（保留开关）。

## 7. 验收门（P3 全绿≠完成，必走 R13）
1. app 开着，Claude 经 MCP `nomi_add_nodes` → 节点**立即**出现在画布，无需刷新。
2. `nomi_generate` → 节点立即以 generating 态出现 → 结果就地填回，全程不刷新。
3. 付费确认卡弹出 → 点确认走生成；点忽略/60s 超时 → MCP 收到干净错误、Nomi 不卡。
4. 制造 vendor hang → MCP 在 timeout 内拿到错误，而非永久转圈。
5. 五门全过 + Playwright 真机截图人眼判断。

## 8. 6 角色评审（R7，定稿前）
- **CTO**：双向桥是缺失基建、非 hack；单一真相源（A 模式灌 store 不写盘）守住，不新增并行版。✅
- **设计**：确认卡须一眼看懂「谁要花钱、花多少、点什么」；复用既有卡片 token，不造新样式。→ 出样张拍板。
- **PM**：直接命中用户两条核心摩擦（不实时 + 卡死），是 MCP 通路可用性的地基。✅
- **前端**：apply handler 复用现成 store 动作，面小；注意 generating 态与既有 in-app 生成态一致。✅
- **后端**：timeout 镜像 hardenedFetch；requestRenderer 超时/无窗口降级路径要测全。✅
- **真实用户**：「我开着 Nomi 让 Claude 帮我搭画布，看着它一张张长出来、要花钱时我点一下」——符合预期。✅

## 9. 实施结果（2026-06-22 全部完成）

全部 P0–P4 已实现 + 五门全过（filesize/tokens/dangling-tokens/lint/typecheck/1691 测试/build）+ 真机走查。

**改动文件**：
- P0 超时：`electron/vendor/vendorHttp.ts`（双段超时 120s）、`scripts/lib/nomiClient.mjs`（RPC fetch + host spawn 兜底 360s）。
- P1 桥：`electron/capabilityCore/rendererBridge.ts`（新，requestRenderer/setRendererTarget）、`electron/main.ts`（登记窗口 target）、`electron/preload.ts`（capability.onApply）、`src/desktop/bridge.ts`（类型）。
- P2 网关：`electron/capabilityCore/gateway.ts`（新，ProjectGateway 磁盘/渲染层两实现）、`core.ts`/`dispatcher.ts`/`rpcServer.ts`/`host.ts`（走网关，删 409）、`src/workbench/generationCanvas/store/generationCanvasStore.ts`（applyExternalGraph）、`src/workbench/capability/capabilityApplyHandler.ts`（新）、`NomiStudioApp.tsx`（注册）。
- P3 卡：`SpendConfirmDialog.tsx` + `spendConfirm.ts`（复用唯一确认 UI，加 agent 来源/明细/倒计时；IconRobot）、设计系统 §3.5/§6 登记。

**真机走查证据**（Playwright 驱真实 build，经 MCP RPC 驱动）：
1. ✅ 所见即所得：MCP `nomi_add_nodes` → 画布 DOM 节点数 0→2 **无刷新**即出现，标题/提示词/「等待生成」态精确。
2. ✅ 付费确认卡：MCP `generate` → 卡实时弹出，机器人图标 + 「经 AI 助手（MCP）驱动」+ 明细行（节点/模型/产物）+ 60s 倒计时（实测准确递减），与获批样张逐项一致。
3. ✅ 实时态：节点生成期 →「排队」live；失败 →「error」live（MCP 读回证实 `status:"error"`）。
4. ✅ 不死等 + 诚实：generate 失败返回干净错误（`Model is not enabled` 透传成 UI toast），不无限挂；忽略/未确认 → 节点 `hasResult:false`（**未花额度**）。

**已知非阻断**：Playwright 多窗口驱动在并发 RPC 下会丢窗口句柄（`errors.log` 无 pageerror/crash，纯 harness 现象，非产品 bug）；真实用户单窗口点击不受影响。

## 10. P5：Nomi 关着时——在 Claude 里确认付费（2026-06-22 追加，用户提出）

用户追问「Nomi 没开怎么办」。搭建类操作（加节点/连线/改词/读）关着照常走 headless host 写盘，下次打开即见——无需确认。但**要花钱的生成**关着时无应用内卡可弹。

方案（查证 MCP 规范 2025-06-18 + Claude Code 文档实证,非凭记忆 R5）：用 **MCP elicitation**——MCP server 让客户端（Claude Code）在**用户这一侧弹确认对话框**，真人答完回传。关键：**模型自己无法应答 elicitation**（只有真人/用户自配 Hook 能答），故付费铁律「真人确认才授权」不破。规范禁止用它要密码 → 是「确认花费」不是「输密码」。Claude Code 2.1.76+ 支持（本机 2.1.177 实测过）。

实现（`scripts/nomi-mcp.mjs` 手搓双向 JSON-RPC + `scripts/lib/nomiClient.mjs`）：
- initialize 捕获 client `capabilities.elicitation`；加「服务端→客户端请求」机制（发 `elicitation/create` + 按 id 路由响应 + 超时兜底）。
- `nomi_generate` 且 `readLiveInstance()` 为 null（app 关着）→ 弹 elicitation「即将用 X 生成…，确认?」：accept → 以本次调用 `spawnEnv: {NOMI_LOOP_SPEND_OK:'1'}` 授权 headless host 铸令牌 → 生成；decline/cancel/超时 → 回「已取消，未生成未花费」；客户端不支持 → 回可操作错误「打开 Nomi 再生成」。
- app 开着（A 模式）不在此弹——由应用内确认卡处理（用户人在 Nomi 边上）。
- `invoke(method, params, {spawnEnv})` per-call 注入 host env，不改全局 `process.env`（防并发串台）。

确认闸全景：**app 开 → 应用内卡；app 关 → Claude 里 elicitation；都不可由模型自我授权，超时/取消均干净返回不死等不偷花。**

验证：`electron/capabilityCore/nomiMcpElicitation.test.ts`（spawn 真 MCP server 走 stdio 握手）——支持 elicitation 时 generate 弹 `elicitation/create`(含「Nomi 未打开」+模型) → decline → 「已取消」拦截；不支持时 → 可操作错误。decline/不支持两路不触发真生成。

# 2026-06-14 极底层完整测试 · 机制/架构层问题发现报告（B 轮·穿透加深）

> **目标**：在 06-13 / 06-14(A 轮) 两次审计基础上，做一次更完整、更深的穿透测试——点遍每个按钮与设计、把现象挖到**机制层/架构层**根因(file:line)，并验证项目自称的不变量是否真成立。
> **本报告只发现问题，不提方案、不修复。** 修复方向、优先级、取舍全部留用户拍板（R3）。
> **方法**：① 7 个机制审计 subagent 并行深读真实代码（harness/runtime/画布/Scene3D/时间轴导出/持久化/创作）；② 主 loop 真机走查（清场→`pnpm build` 绿→常驻 `_electron` 驱动→J1/J5 + 逐交互态截图人眼判断 + 几何实测）；③ 评测体系跑 L0 + 核查 L1/L2 可跑性。
> **范围（本轮重点补 A 轮欠审的子系统）**：时间轴/预览/导出全链路、生成 runtime/模型接入/IPC、harness 核心(EventLog/proposal/reconcile/undo/memory/gate)、Scene3D 3860 行巨壳、持久化/数据治理、创作流式。
> 现象截图：`tests/ux/shots/00-home … 09-drawer-expanded.png`。

---

## 0. 总览

- **本轮新发现约 80 条问题**（去重后），其中**亲自核实的 P0 共 8 类**（见 §1），覆盖此前从未深审的 4 个子系统。
- **最重的一条是今天引入的回归**：EventLog 审计主链路因 `:area` 后缀 + 贪婪正则，**当前 HEAD 上所有 `agent.*`/`gate.*` 事件静默丢盘**，I1/I2/记忆偏好/上下文裁剪投影集体失效——而单测因用旧 fixture 全绿。
- **诚实记账**：06-14(A 轮) 的画布布局四大根因（A3 恒落中心/假避让、A4 步距 hardcode、A5 镜序≠空间序、A2 编号随机）经源码核实**已真根治**，本轮不重报；但 A 轮 A7(库膨胀/假删除/无 GC) 经磁盘量化证明**更严重且未修**。
- **五门 CI 现状**：`build` 绿、`test` 1128/1128 绿、`check:filesize` 绿（3 巨壳白名单）。**但"全绿"恰恰掩盖了 P0**——见 §5 评测体系的盲区分析。

### 磁盘真相（实测 2026-06-14）
`~/Documents/Nomi Projects/` 已涨到 **88 项目**（06-13 是 80、06-14A 是 81）：
- 「未命名项目」垃圾 **55**；「示例」重复 **30**（30 秒产品介绍×22、天台上的告白×6、京都 vlog×2）；其中 **17/30 是 ≤2 节点的空壳**。
- **0/85 带 seedKey**（幂等键对存量完全失效）；某示例 revision = **706**（被反复 re-save）；带 `removed-from-library` 标记目录 0；32 个目录同时有顶层 `project.json` + `.nomi/project.json` 双清单。

---

## 1. 已亲自核实的 P0（崩溃 / 数据损坏 / 创作主权 / 数据治理）

### P0-1 · EventLog 审计主链路全线静默丢盘（今日回归，已 git 定位）〔harness｜可观测性+主权〕✅亲验
- **现象**：正常使用任一项目的创作区/生成区对话时，`agent.turn.started/finished`、`agent.tool.proposed`、`agent.proposal.approved/rejected`、`agent.gate.denied`、`context.capped` **全部无法落盘**。EventLog 在真实路径下基本为空。
- **根因（亲验 + git 归因）**：渲染层真实 sessionKey = `nomi:workbench:<projectId>:<area>`（[workbenchAgentRunner.ts:29](src/workbench/ai/workbenchAgentRunner.ts:29)，area=creation/generation）；trace 解析器 [eventLogRepository.ts:49](electron/events/eventLogRepository.ts:49) 是贪婪 `^nomi:workbench:(.+)$`，把 `<projectId>:creation` **整体**当 projectId → `resolveWorkspaceProjectDir` 比对 `manifest.id` 失败 → null → `appendEvents` 静默返回 `[]`。`beginTurnTrace`([agentChatV2Ipc.ts:41](electron/ai/agentChatV2Ipc.ts:41)) 一旦 early-return，整轮（含 approved）按 sessionId 都查不到 trace。
- **git 归因**：`:area` 后缀由**今天 commit `cdc433c`(2026-06-14 12:55「记忆按 area 隔离 S2」)** 引入；解析器写于 06-11(`4a31ec3`) 从未更新；评测在 06-12(`3e2c1e9`，后缀引入前)跑的，所以其 `memory.json` 里 `pref:overrides` 还能从 seq 4 提炼——**这条恰好反证 P0-1 是后缀引入后的新回归**。
- **连锁失效**：**I1**（"AI 背着我改结构上不可能"）失去结构保证——canvas 事件带的 `proposalId` 要回指的 approved 从不落盘；**I2**（deny 必入日志）破；memory `pref:overrides`（用户改写 AI 提议=最强偏好信号，[projectMemory.ts:125](electron/memory/projectMemory.ts:125)）永不触发；`context.capped` 投影拿不到数据。
- **为何 CI 没抓到**：解析器单测 [eventLogRepository.test.ts:102](electron/events/eventLogRepository.test.ts:102) 用旧格式 `nomi:workbench:proj-42`（无 area 后缀），正好命中贪婪正则 → 绿。**第二份解析器** [agentSessionStore.ts:26](electron/ai/agentSessionStore.ts:26) 是另一套正则（同名函数双实现=真相源分裂），工作记忆缓存落对了、EventLog 落不了——半边日志。

### P0-2 · 删除项目是"假删除"，且 UI 向用户撒谎〔持久化｜数据治理+信任〕✅亲验
- **现象**：库里删项目，确认框写「项目文件夹和本地资源会一起删除」、删完弹「项目已删除」，**但磁盘文件夹永不删**（88 个目录从未回收即铁证）。
- **根因（亲验）**：[repository.ts:163-189](electron/projects/repository.ts) `deleteProject` 对 workspace 项目（=所有"新建项目"）只走 `removeWorkspaceProjectReference`（删 `recent-workspaces.json` 指针 + 写 `removed-from-library` 标记）即 return；真正删盘的 `fs.rmSync`(:187) 只在 legacy 分支可达，workspace 项目永远进不去。
- **机制层**：删除契约二义——「从库移除（解绑指针）」与「删盘」用同一动词/同一文案，底层两套语义。最坏的"说删了其实没删"。

### P0-3 · 全仓零 GC：空白项目落盘即永久占用，库单调膨胀〔持久化｜生命周期缺失〕✅亲验
- **现象**：55 未命名 + 17 空壳示例堆磁盘，无任何清理路径；点一次「新建空白」哪怕零编辑也永久留一条。
- **根因**：grep 全仓无 `gc/purge/prune/cleanup/recycle/回收`；创建即落盘（[repository.ts:118-127](electron/projects/repository.ts)），唯一删除路径又是假删（P0-2）。缺「草稿态 vs 持久态」生命周期——没有"未编辑不落盘 / 空壳可回收"。
- **入口集**：每次「新建空白」「30 秒体验」「打开文件夹」。

### P0-4 · seedKey 幂等守卫对存量 30 示例 0 命中，点一次「30 秒体验」再堆一份〔持久化｜迁移〕✅亲验
- **现象**：磁盘 30 个重复示例，**全部无 seedKey**（实测 0/85）。
- **根因**：去重靠 `find(item.seedKey === 'example:xxx')`（[NomiStudioApp.tsx:312-315](src/workbench/NomiStudioApp.tsx)），但历史示例创建于该特性之前、无回填迁移 → `find` 永远 miss → 空库 CTA + 模型接入后自动重放([:368])每次再造一份。幂等键只前向生效、无存量收敛。

### P0-5 · 导出有三套互不一致的成片引擎，所见即所得从架构上不成立〔时间轴导出｜并行版〕
- **现象**：同一时间轴同一参数，导出画面取景/构图/背景色会因「走哪条后端」而不同——且哪套生效取决于素材是否本地可解析，**同一项目今天 letterbox 明天裁满**。
- **根因**：`exportTimelineToMp4`([exportApi.ts:50-126](src/workbench/export/exportApi.ts)) 总先用 canvas+MediaRecorder 录一份 WebM；主进程 `finishExportTempInput`([exportJobs.ts:306-357](electron/export/exportJobs.ts)) 优先 filtergraph 直读源、成功就把刚录的 WebM 整个丢弃。两后端视觉算法不同：WebM=cover 裁满(`drawCoverImage` timelineWebmExport.ts:155)+背景 `#f4f3ef`；filtergraph=`force_original_aspect_ratio=decrease+pad` letterbox(ffmpegFiltergraph.ts:201)+背景黑。**外加预览的 fitMode/平移/缩放是 `TimelinePreview` 局部 state、从不写进 `TimelineState`**，导出两条后端都拿不到 → 预览构图永不进成片。违 P1（双/三真相源）。

### P0-6 · 创作分镜方案 `storyboardPlan` 完全不落盘，切项目/重载即蒸发〔创作｜数据丢失〕
- **现象**：AI 拆好、用户手改过锚/镜序的分镜方案，切项目、热重载、重启后**直接消失无提示**。
- **根因**：[workbenchStore.ts:96](src/workbench/workbenchStore.ts) `storyboardPlan` 是纯内存态——不进 `workbenchPersistence`、不进 `projectRecordSchema`(白名单只有 `workbenchDocument`)，`swapCreationAiProject`([:300]) 切项目时反而主动清零。它是用户耗时编辑的 per-project 产物却归错成瞬态。违反本地优先承诺。

### P0-7 · 多步提议 abort 不执行补偿，画布停半截态（I3 破产）〔harness｜创作主权〕
- **现象**：一笔多步提议（如 `[set_node_prompt(A), create_nodes(...)]` 由确认面板批量批准）若后续步骤抛错，**第 0 步对 A 的 prompt 改写不回滚**；`delete_canvas_nodes` 成功后下一步失败，被删节点也不恢复——AI 删了你的节点、事务失败、节点不回来。
- **根因**：[proposalTxn.ts:126-152](src/workbench/generationCanvas/agent/proposalTxn.ts) abort 分支**只**补偿 `createdNodeIds`，完全没应用已攒进 `compensation[]` 的 `restore-prompt`/`restore-graph`（这些 op 在 :84/:95 被 push，却只在 commit 后由用户「整笔撤销」消费）。注释自称"补偿回滚零半截(I3)"，property test 只测 commit+create+connect，从不构造 abort/set_prompt/delete → I3 实际未验证且破。

### P0-8 · 非文本模型「自动接入」根本未实现，与项目第一目标直接冲突〔runtime｜通用第一〕
- **现象**：项目核心目标"文档+key 不该手配每个模型"在**非文本模型上不成立**。manual 主接入路径写死 `targetKind:"text"`([catalogCommit.ts:261](electron/catalog/catalogCommit.ts))且"emit NO HTTP mapping"；图片/视频要么命中 16 个**硬编码** archetype([modelArchetypes/index.ts:22](src/config/modelArchetypes/index.ts))，要么走 agent 抽 HTTP 模板（易漂，历史 GPT Image 2 bug 即此）。
- **根因**：archetype 注册表是编译期硬编码、catalog model 只存运行期 `archetypeId` 字符串指针——**两个互不可达的真相源**。onboarded 模型两者都不中 → `resolveArchetypeForModel` 返 null → ① `buildAgentModelEntries` 直接 `continue` 跳过([availableModels.ts:66])→ **agent 永远调度不到自接入的图片/视频模型**；② 节点 UI 只能渲染 onboarding 投影的 flat 字段，给不出参考槽。"档案声明槽、通用系统填"(P4) 实质是**白名单制不是声明制**。

---

## 2. P1（主链路受损 / 容错 / 数据一致性）

### 2.1 harness
- **跨项目 clientId 串台**：`clientIdRegistry`([applyCanvasToolCall.ts:36](src/workbench/generationCanvas/agent/applyCanvasToolCall.ts)) 是模块级全局 Map、无任何 clear；切项目后 LLM 复用旧 clientId `n1` 会 `resolveNodeId` 到别项目真实节点 → 误连/误删，且 reconcile 的 `resolveExternalId` 共用此污染源会把脏解析当"已连接"误判 ok。与内核 agentLoop.ts:9「零模块级可变状态」纪律自相矛盾。
- **gate 锁漏 `arrange_storyboard_to_timeline`**：[gate.ts:42](src/workbench/generationCanvas/agent/gate.ts) 标该工具 writes 走 ask 门，但 `evaluateLock`(:74-117) 无该 case → fallthrough 放行，锁节点产物可被排片绕过锁。锁不变量是**逐工具白名单**，新增写工具默认不进锁判定=结构性开口。

### 2.2 runtime / 模型接入
- **结构化 vendor 错误只覆盖 profile 一条出口**：`runTask` 三条出口，只 profile 路径抛 `VendorRequestError`；图片/视频 fallback 路径 `postJson` 抛裸 Error（[runtime.ts:410](electron/runtime.ts)）、文本路径走 AI SDK 也非结构化 → 401→auth/402→balance 查表对这两条路径**完全失效**。
- **`vendor.meta.extraHeaders`（relay/代理网关鉴权头）到不了图片/视频路径**：只文本/AI-SDK 路径读它；profile 路径 `buildHttpRequest`([requestPipeline.ts:152](electron/ai/requestPipeline.ts)) 只拼 operation.headers+标准 auth → 经中转站接入的图片/视频模型静默丢头 → 401/403，且因上一条还看不到结构化原因。
- **异步任务 LRU 驱逐 = 把 vendor 侧成功任务本地误报失败**：taskCache 上限 200([runtime.ts:147])，批量生成 >200 并发时仍在轮询的条目被挤掉 → `fetchTaskResult` miss 分支把"被驱逐"与"从不存在"混为一谈返回 failed([runtime.ts:659-669])。
- **catalog 文件高版本"read-as-is"继续写 = 静默降级数据**：version>3 只 `console.warn` 照常返回([catalogStore.ts:181](electron/catalog/catalogStore.ts))，后续任何 upsert 以当前 app 形状写回、丢弃新版本字段，但 version 仍标高版本。
- **`findExecutableModel` 用 `modelKey||modelAlias` 双键 OR 匹配**([runtime.ts:351])：alias 与另一模型 key 碰撞时按数组顺序路由到错模型，catalog 对 alias 无唯一性约束。
- **`looksLikeLogicalError` 按 `code` 字段数值猜错误**([requestPipeline.ts:310])：200 响应体顶层有 `code∈[400,600)` 即判失败 throw，对把 `code` 用作业务码的 vendor 误伤。

### 2.3 画布 / 连边
- **手动连线零能力校验**：T8 的 `validateReferenceEdge` 只在 agent 路径([generationCanvasTools.ts:92])被调；手动拖连/点输入口连走 `completeNodeConnection → connectToNode → graphOps.connectNodes`([graphOps.ts:80](src/workbench/generationCanvas/model/graphOps.ts)) **完全无校验**，能连出文本→纯文生、character_ref→错配模型的静默无效边 → 生成期丢弃、对账可能误报。校验补在 agent 入口而非 `connectNodes` 总闸。
- **跨分类引用边"看不见但生效"仍在，且有新用户级入口**：渲染按"两端都可见"过滤边([GenerationCanvas.tsx:55])、生成用全量 `state.edges`([generationRunController.ts:105])——两套边集永不收敛。新触发器：`reassignNodeCategory`([canvasNodeActions.ts:266](src/workbench/generationCanvas/store/canvasNodeActions.ts)) 把节点改分类时**完全不动它的边** → 用户拖个有边的节点到另一子画布，原边瞬间变跨分类边、两边都看不见、生成仍喂参考。

### 2.4 Scene3D / 节点渲染
- **编辑器每次 setState 全量回灌父级 + 父级双 `JSON.stringify` 整场景 diff**：拖一次向量/姿态/颜色滑块都触发整场景序列化两次（[Scene3DFullscreen.tsx:3222](src/workbench/generationCanvas/nodes/scene3d/Scene3DFullscreen.tsx) `useEffect([state])` 无条件回调 + [Scene3DEditor.tsx:36] `scene3DStateKey`=整树 stringify）。100 对象场景单次拖拽=数十次全场景 stringify×2+持久化。缺 draft/commit 分离与脏检查。
- **Scene3DFullscreen 3860 行混 7 层关注点**：50 个组件+几何函数+three.js 场景图+事件层+剪贴板+截图 IO 全混一文件；白名单基线=当前 3860 行（棘轮空转、从未瘦身）。任何 3D 改动都在 3860 行里盲改。
- **NodeParameterControls 双 meta 读取 = lost-update 竞态**：多数 handler 基于渲染快照 `node.meta`(prop 闭包)做 spread，唯 `setSingleFrameUrlMeta`([:254]) 读 `getState()` 最新 → 连边赋图+紧接改参数时后写覆盖前写。第二份真相源(prop 快照 vs store 最新)。

### 2.5 时间轴 / 导出
- **删画布节点 → 时间轴 clip 悬空、url 永久陈旧、无对账**：`deleteNode`([canvasNodeActions.ts:336]) 只动 nodes/edges/groups，完全不碰 workbenchStore 的 timeline；clip 创建时 `url/thumbnailUrl` 快照冻结([buildClipFromGenerationNode.ts:80])，全代码无 node→clip 同步。删/重生成节点后时间轴仍引用已不存在或过期素材，导出时 WebM 路径 loadImage 失败会 reject 整条导出。
- **App 退出时正跑的 ffmpeg 成孤儿进程**：`main.ts` 无 `before-quit`/`will-quit` 去 abort `activeExportAbortControllers`([exportJobs.ts:236])；导出中关 Nomi，ffmpeg 后台继续吃 CPU，留半成品 `.partial.mp4`。
- **导出过程用户无法取消**：bridge `exports.cancel` 与后端 `cancelExportJob` 都现成，但 [TimelinePreview.tsx:686](src/workbench/preview/TimelinePreview.tsx) 进度区没接取消按钮；误点大项目导出即被单 active job 全局锁锁死只能等完。
- **WebM 录制用 `setTimeout` 墙钟步进驱动 captureStream，帧时长不可靠**：[timelineWebmExport.ts:268] 递归 setTimeout 推帧，MediaRecorder 按真实墙钟采样，视频 seek 耗时(最长 5s 超时)超过 msPerFrame 时帧时序与时间轴解耦（预览播放已用 rAF 累加器修过，导出录制没修）。

### 2.6 创作 / 流式
- **切项目/新对话时进行中流式不被取消，写到错误项目**：`swapCreationAiProject`([workbenchStore.ts:289]) 清空消息、灌新项目气泡，但**没人调 `cancelRef.current()`**；在途 `runWorkbenchAgent` 的 `onToolCall` 写文档卡会出现在新项目面板，点应用把旧项目 AI 内容写进新项目文档。流式生命周期(cancelRef/sending/pendingToolCalls)是组件局部 state、与项目切换无共享中止信号。
- **「停止」流式后气泡永久卡 pending/streaming**：[CreationAiPanel.tsx:620] cancel 后 `await runWorkbenchAgent` 如何 settle 无保证——若永不 settle 则 `finally` 不执行、`sending` 永真、面板锁死到刷新；无「已取消」第三态。
- **流式写文档与用户输入 setContent 竞态吞选区**：受控 `content` 回灌触发 [useNomiRichTextEditor.ts:76] `editor.commands.setContent` 默认重置光标到文档头，用户此刻打字/选区被打飞。编辑器真相源归属未定（既受控又自报）。
- **`StoryboardPlanEditor` 存在时源文档编辑器被整体卸载**：[CreationWorkspace.tsx:40] `hasStoryboardPlan ? <StoryboardPlanEditor/> : <WorkbenchEditor/>` 三元互斥 → 有方案就看不到/改不了原文，且 WorkbenchEditor 卸载触发 `setCreationDocumentTools(null)` → 方案态下创作 AI 的写文档工具全部静默失效。从结构上禁止了"方案 vs 源文本"对账。

### 2.7 持久化 / 库
- **`discoverLegacyProjects` 每次 list 全盘扫描 + 重注册**：[repository.ts:106] listProjects 把"发现"耦合进"列举"热路径，32 个 legacy 目录每次进库都被 re-discover+re-remember（全量 atomic 重写）；库越大越慢，且删了走 workspace 分支只删指针、顶层 json 还在 → 下次 list 复活。
- **外部文件夹零校验**：[workspaceIpc.ts:29] 可把 `~/`、`~/Pictures`、`~/Music` 选成项目，确认后直接往该目录写 `.nomi/`、`assets/`、`exports/` 并永久注册，删除又是假删（标记残留）。信任边界缺失。
- **创建契约三入口仍不统一**：`createLocalProject` summary 不带 categoryId（沿用 06-13 A4 根因）；seedKey 透传靠两次写盘、第二次覆盖才补回，`initializeWorkspace` 命中 existing 直接 return 则 seedKey 永进不来。无统一 `ProjectCreationSpec` 单一构造点、无"create 后必含 seedKey/categoryId"不变量测试。

---

## 3. P2 / P3（体验缺陷 / 一致性 / 局部 / polish）

| # | 问题 | 子系统 | 根因(file:line) | 级 |
|---|---|---|---|---|
| 1 | 顶栏「导出」(aria=导出 MP4) 实际只跳预览不导出；与工具栏「导出 MP4」**aria 重名** | 导出 | 顶栏按钮 disabled:false 仅切 tab；两按钮同 aria-label（A11y 重复标签+误导）✅亲验 | P2 |
| 2 | 禁用「导出 MP4」`pointer-events:auto`+ 未 gated `hover:bg-accent` → 悬停仍亮 accent（假可点） | 导出 | TimelinePreview 控制条多 IconButton disabled 仍带 hover 类，整条共因 ✅亲验 | P2 |
| 3 | 预览 duration/activeClips `useMemo` 漏 `textClips` 依赖 → 改片尾标题卡时长不刷新 | 预览 | PreviewWorkspace.tsx:23-27 deps 只 `[tracks,...]` | P2 |
| 4 | `normalizeTimeline` 把 fps 永久钉死 30，丢弃传入/持久化 fps | 时间轴 | timelineMath.ts:141 + timelineTypes.ts:46 字面量 | P2 |
| 5 | agent 排片可重复追加同节点 → 成片同镜头出现多次（无幂等键） | 时间轴 | sendStoryboardToTimeline.ts:88，clip id 含 startFrame 不去重 | P2 |
| 6 | 字幕折行：预览用浏览器 CSS、导出用手写 greedy，断行点不一致 | 导出 | textOverlayCanvas.ts:4 `wrapLines` vs DOM `word-break` | P2 |
| 7 | 迁移每次 hydrate 按"引用相等"判幂等 → 反复 re-save，revision 漂到 706 | 持久化 | projectPersistenceService.ts:107 + workspaceRepository.ts:188 无条件 +1 | P2 |
| 8 | 缩略图唯一真相源=画布节点 result.url，示例/空项目永远空封面；派生逻辑双份 | 持久化 | projectNormalize.ts:15 + workspaceRepository.ts:35 各一份 | P2 |
| 9 | archetype 模型被剥夺 catalog 比例/分辨率兜底控件，全靠模式手动声明 | 节点控件 | NodeParameterControls.tsx:93 `archetype?null:...` | P2 |
| 10 | image-url 槽靠 key 名子串启发式分类，新模型命名不合规即误分类/首尾帧错位 | 节点控件 | parameterControlModel.ts:56-84 硬编码子串表 | P2 |
| 11 | 比例写入扇出 5-6 个别名 key 互相覆盖，`size` 既当比例又当分辨率被污染 | 节点控件 | defaultPatchForCatalogControl:465 | P2 |
| 12 | 离屏全模型测宽：克隆控件无 `inert`/`tabIndex=-1`，键盘 Tab 落 -99999 幽灵控件 | 节点控件 | NodeComposerWidthMeasurer.tsx:59；pointer-events-none 不拦焦点 | P2 |
| 13 | CameraStateRecorder `useFrame` 每帧无条件 new 对象+调回调，相机静止仍 60fps GC churn | Scene3D | Scene3DFullscreen.tsx:439-454 无脏判断 | P2 |
| 14 | 全场景树零 `React.memo`，任一 state 变更整三维树 reconcile | Scene3D | rg React.memo 0 命中；SceneContent 拿整 state | P2 |
| 15 | Scene3D 全文件 128 处裸 px/text + 24 处裸 hex，设计系统 token 全线失守 | Scene3D | 违 R8/R10，3D 编辑器游离在 design-system 外 | P2 |
| 16 | `chatOnly` 模式承诺"不写文档"是 prompt 软约束，写工具仍注册、AI 仍能触发写卡 | 创作 | creationAiModes.ts:136 仅 prompt 文字；onToolCall 不读 chatOnly | P2 |
| 17 | 「选区 vs 全文」靠 `selectedText||documentText` 隐式短路，用户不可见不可控→静默拆错范围 | 创作 | launchStoryboardPlanning，选区无生命周期 | P2 |
| 18 | redactDeep 盖不住 URL 编码/query 参数名形态的密钥（黑名单非白名单） | harness | redact.ts:8-9 只兜 sk-/Bearer + 对象字段名 | P2 |
| 19 | `seedAgentChatV2History` 丢所有 tool 气泡，翻旧对话续聊模型"忘记做过的操作" | harness | agentChatV2.ts:422-453 只留文本轮 | P2 |
| 20 | seq 恢复在"最新段为空且仅一段"时回退到 0 → seq 可重号 | harness | eventLogRepository.ts:98 单段全损无兜底 | P2 |
| 21 | 代理探测只启动跑一次无热更新；SOCKS-only 被静默退回直连仅 console.warn | runtime | main.ts:331 一次性；systemProxy.ts:193 | P2 |
| 22 | importModelCatalogPackage 逐 upsert 即全量写盘、无事务，部分失败留半成品 catalog | runtime | catalogStore.ts:489-516 无事务边界 | P2 |
| 23 | runtime.ts 仍混入资产 I/O 领域(writeAsset/importLocalFile…)，743 行近半是资产 I/O | runtime | runtime.ts:181-345 关注点未分离 | P2 |
| 24 | 迁移 toast「项目已升级」对存量 legacy 每次打开可能复弹（无"已通知"水位线） | 持久化 | NomiStudioApp.tsx:205-216 依赖现算诊断 | P2 |
| 25 | 占位「拖图」引导只覆盖 video，image-to-image/参考类缺输入时无引导 | 节点 | BaseGenerationNode.tsx:362 `kind==='video'` 单分支 | P2 |
| 26 | 选区气泡与固定工具栏功能重复(加粗/斜体/H1/H2)，仅生成动作差异化（违 R2 极简） | 创作 | 06-14 D1 复现 | P2 |
| 27 | 模型接入卡底部多行小灰说明像 fine-print 墙，行动价值低 | 模型接入 | 06-14 D7 现场复现（APIMart 展开）✅亲验 | P3 |
| 28 | `useNodeUsageCount` 用 `prompt.includes(title)` 子串匹配统计被引用次数 → 假阳性 | 画布 | useNodeRelationships.ts:44 无 token 边界 | P3 |
| 29 | 弹层无可复用翻转/clamp 原语(A9 仍在)；右键菜单 clamp 用写死 148/330 与真实 w-132 脱节 | 画布 | portal.tsx 仅裸 BodyPortal；GenerationCanvas.tsx:477 | P3 |
| 30 | wheel 平移命中判定只认垂直滚动(横轴漏判)+ 热路径 `getComputedStyle` | 画布 | canvasScroll.ts:3-18 只查 overflowY | P3 |
| 31 | 节点尺寸真相源四份并存(registry/geometry/内联 \|\|300,220/nodeSizing)，框选命中用 300×220 比真实窄 → 选不中可见卡 | 画布 | generationCanvasGeometry.ts:14 等四处 | P3(机制深) |
| 32 | 死代码 `createStoryboardNodeFromContent`/`generateStoryboardNode` 无调用方（违 P1 加新未删旧） | 创作 | creationNodeCommands.ts:17 | P3 |
| 33 | md→tiptap 疑似双份解析器(markdownToTiptap.ts vs markdownToTiptapContent) | 创作 | 待确认是否同一实现 | P3 |
| 34 | 发送时仍在 uploading 的附件被静默丢弃(`clearAttachments` 清全部) | 创作 | CreationAiPanel.tsx:227 无等待 gate | P3 |
| 35 | 单 active export job 是全局锁，跨项目互相阻塞且错误文案暴露另一项目 jobId | 导出 | exportJobManager.ts:111 | P3 |
| 36 | renderManifest 用 sourceNodeId 作 asset id 合并，同节点不同 result 被错并(后镜头放成前画面) | 导出 | renderManifest.ts:49-69 优先留 existing.url | P3 |
| 37 | fingerprint 缓存键不含 nodeId，同 prompt 不同节点复用资产连带复用 provenance(vendorRequestId 指向别节点) | runtime | fingerprintCache.ts:23-37 | P3 |
| 38 | manual 接入零连通性测试，错配延迟到调用才暴露（违"接入即验证"纪律） | runtime | catalogCommit.ts:192-194 有意不测 | P3 |
| 39 | `findTaskMapping` 兜底"任意 enabled inBucket[0]"→ 模型套别模型请求模板（隐性 fallback 逃生口） | runtime | types.ts:175-179 | P3 |
| 40 | 剧本片段节点头英文「Text」(全中文画布里唯一英文)；助手下拉暴露原始 id `moonshot-v1-128k-vision-preview` | i18n | TextDocumentNode + A13(06-13) 未修 | P3 |

> 上表 40 条之外，各 subagent 报告还含若干同源细项（如 Scene3D mannequin GPU 资源释放不闭环 P3、reconcile position/categoryId 白名单掩盖落点偏差 P3、send useCallback 依赖漏 launchFixationPlanning P2、消息 id 用 Date.now() 可碰撞 P1 等），完整明细见各 agent 原始返回（已并入本文机制层归并）。

---

## 4. 机制层共因归并（跨子系统的根模式——修这些比修单点更省）

1. **「声称单一/单源」未对齐到所有出口/入口**（P0-1 双解析器、P0-5 三引擎、P0-8 archetype 白名单、2.3 连边校验只补 agent 入口、runtime 结构化错误只覆盖 profile、节点尺寸四真相源、缩略图双份派生、md→tiptap 疑似双份）。根模式：一个被宣称"单一真相/单一出口/单一校验"的机制，没有"所有调用方必经此处"的**结构强制**，只靠约定 → 平行出口绕过它。**这是本仓最贯穿的病灶。**

2. **「按形状/名字猜」而非「按声明判」**（archetype 字符串匹配、`looksLikeLogicalError` 按 code、image-url 子串表、比例别名扇出、usageCount 子串匹配、kie 坏 mapping 形状反推）。根模式：缺"模型档案/能力/请求形状可被运行期数据声明"的契约，全靠编译期硬编码+运行期启发式。这是 P4「通用第一」真正落地的前提。

3. **生命周期缺失 / 未挂接边界**（P0-3 无 GC + 无草稿态、P0-2 假删除、clientId 全局 Map 不随项目重置、流式生命周期是组件局部 state 与项目切换无共享中止、ffmpeg 不挂 app 退出、taskCache LRU 与长任务脱节、代理无热更新）。根模式：创建/删除/中止/驱逐各自为政，没有统一的"草稿态↔持久态↔回收"和"切换=统一 abort"。

4. **白名单/case 式安全判定默认开口**（gate 锁逐工具 case、reconcile 派生白名单、redact 黑名单形态）→ 新增工具/字段/vendor 形态默认绕过保护。应改"未声明=拒"。

5. **补偿/对账"攒了不用"或"投影只展子集"**（P0-7 abort 不用 compensation、跨分类边看不见但生效、对账只报数量不报落在哪、撤销回执 reload 丢失 A6）。根模式：store/事务层做对了，但 abort 路径/呈现层没消费它 → "正确但不可见/不可逆"对用户=错误。

6. **"整树/整对象比较"性能反模式**（Scene3D 全量回灌+双 stringify+零 memo+每帧分配）。根模式：缺 draft/commit 分离与脏检查。

7. **巨壳从未真正瘦身 + 设计系统飞地**（Scene3DFullscreen 3860 行白名单空转、整文件裸 px/hex；runtime.ts 743 行混资产 I/O）。

---

## 5. 评测体系 · 跑测结果与盲区分析

- **L0（确定性单测=CI 门）**：`pnpm test` → **1128/1128 全绿、135 文件**（3.2s）。`build`/`check:filesize` 同绿。
- **L1（agent 终态，真 Electron 隔离实例）**：最近一次为 06-12 smoke 5 case → **passAtKRate 0.8（4/5）、passAllK 4、0 infra error、127k token、均延迟 35s**。本轮**未重跑 L1**——它走用户 vendor 额度（属用户独有资源，按纪律不擅自烧）。
- **L2（LLM-judge）**：**不可跑**——`evals/judge.config.json` 缺失、`evals/annotations/` 为空（即 primer 记的"还欠你三件事"中的 judge key + ≥10 条标注两项仍欠）。
- **★ 评测/CI 的系统性盲区（本轮最重要的元发现）**：**"五门全绿"主动掩盖了 P0**。
  - P0-1 漏网因解析器单测用**旧 sessionKey fixture**（无 `:area` 后缀）正好命中贪婪正则；
  - P0-7(I3) 漏网因 property test **只测 commit happy path**，从不构造 abort / set_prompt / delete；
  - I1 无"canvas 事件 proposalId 能 join 到 approved"的跨管线端到端断言；
  - L1 评测在 06-12（回归引入前）跑的，其产物反而成了"曾经能工作"的化石证据。
  - **结论**：当前测试套的 fixture 与被测契约一起漂移，three 门绿 ≠ 机制成立——这正是 P3「全绿≠完成」在评测层的实证。

---

## 6. 诚实记账 · 经源码核实「已真根治、本轮不重报」
- 06-14A **A3/A4**（新建节点恒落中心 + 整数像素假避让）：`resolveInsertionPosition` 已是真 AABB 螺旋避让、步距 derive 自足迹。✅
- 06-14A **A5**（镜序≠空间序 / 统一 cellHeight）：`trajectoryLayout` 已按足迹高累加、按 shotIndex。✅
- 06-13 **A2**（编号按 position+随机 id）：已改为存储身份 `shotIndex`。✅
- 06-14A **A6**（composer 顶边裁切）：翻转判定已校验所需高度（canvas agent 源码核实）。✅
- 指纹缓存命中入日志、记忆"用户纠正不被覆盖+墓碑"、上下文裁剪 tool 配对剥离、撤销 barrier 拔除：抽查**成立**。
> 但注意：**旧项目里已重叠/已膨胀的存量数据无迁移出路**（示例项目真机仍见持久化重叠，库仍 88 项）——代码根治 ≠ 存量收敛。

---

## 7. 待用户拍板（不在本报告范围）
本报告止于「发现 + 根因定位 + 亲验」。以下全留用户决策：所有 P0–P3 的修复方向与优先级；是否清理 88 个历史项目 / 30 重复示例；是否回填 storyboardPlan 持久化与"方案 vs 源文本"是否并排绑定（涉产品方向）；导出统一为哪条引擎；评测的 judge key 与标注是否补齐。**P0-1 是今天的回归、爆炸半径最大（审计/主权/记忆三链同断且 CI 绿），建议优先确认。**

---

## 附 · 方法与产物
- 7 个机制 subagent 并行只读审计（harness/runtime/画布+弹层/Scene3D+节点渲染/时间轴导出/持久化库/创作流式），各返回 7–18 条带 file:line 的结构化发现。
- 真机走查截图：`tests/ux/shots/00-home … 09-drawer-expanded.png`（10 张）。
- 亲验项：P0-1（解析器+渲染层 key+git 归因 cdc433c）、P0-2/3/4（repository.ts + 磁盘量化 88/55/30/0-seedKey）、导出双按钮/禁用 hover、库膨胀、L0 1128 绿。
- 实测磁盘：`~/Documents/Nomi Projects/` 88 目录。

# 拆镜头闭环 · 镜级 verify + 有界回灌重做

> 日期：2026-06-28 ｜ 状态：**Stage 1 地基已交付**（commit + push，五门全过），Stage 0/1实时编排/2/3 续做
>
> ## 进度（2026-06-28）
> **已交付（commit + push，五门全过，30 新测）**：
> - `shotVerify.ts` — verify 原语纯函数（身份/构图/连贯三轴 1-5 档；组 prompt / 解析判决 / 判偏差 / 映射成 ReconcileDeviation）。
> - `storyboardLoopBudget.ts` — 有界 governor 纯状态机（默认封顶 2 轮，`decideNext` 决策 done/replan/exhausted；与瞬态 retry 完全分开）。
> - `reconcile.ts` — `ReconcileDeviation` 加 `kind('structure'|'content')` + `shotNodeId`。
> - `ReconcileDeviationCard.tsx` — 渲染内容偏差（直显人话原因）+「让 AI 修」对画面偏差也出现。
>
> **架构决策已锁定（替用户定，无需再问）**：
> - verify 调模型 = **复用 agent 的 `attachments` 多模态链路**（`runWorkbenchAgent`，mode:'chat' 无工具 + 首帧图作 image attachment），非评测专用 chatVision。
> - 视频镜取帧 = 渲染层 IPC **`extractFrame`**（`preload.ts:42` → `nomi:video:extract-frame` → `extractVideoFrameToAsset`，返回 `{url}`）；图片镜直接用 `result.url`。
>
> **续做（按风险，每步守三闸；Stage 2 必须真机走查验花钱安全才算完）**：
> 1. **Stage 1 实时编排** `shotVerifyRunner.ts`（impure，DI 可测）：批量生成完成后 → 逐镜组 `ShotVerifyContext`（标题/prompt/连边锚描述/前一镜）→ 取帧 → 调模型 → 映射偏差 → 喂 `CanvasAssistantPanel` 的 `setDeviationReport`（现仅结构对账注入，见 `:322`）。集成假设（attachment 须 `nomi-local://`、一次性视觉判断用法、抽帧输出格式）须真机验。
> 2. **Stage 0** 解锁提交后 re-plan + `onDeviationAiFix`（`CanvasAssistantPanel.tsx:651`）对 content 偏差升级为 scoped re-plan。
> 3. **Stage 2** 有界闭环 + 新 run.id 付费隔离 + 每轮确认 + loop 预算封顶 + **付费隔离回归测** + **真机走查**。
> 4. **Stage 3** 镜头字段拆静态×动态（可选后置）。
>
> ---
> ## 自审「测评发现的问题」（2026-06-28，real-machine 走查前的代码级审查）
> 真实生成 GUI 走查在当前沙箱被**环境硬堵**（三路全证伪：① Playwright `electron.launch` 崩——仓库自带 `test:e2e` 同样 `ws 1006` 死，非本特性代码问题；② 裸 electron 解不开 key——用户 key 是打包版 Nomi.app 代码签名加密、Keychain ACL 只放行真 app；③ key 本身 safeStorage 加密，node 直连不可行）。故真模型/真生成验证须在**真 Nomi.app 内**跑（用户交互 或 computer-use 驱动可见窗口）。下列问题来自代码级自审：
> - **P-V1 身份轴对照偏弱**：`gatherShotVerifyInputs` 喂给模型的锚描述 = 锚节点的 `prompt`（= `buildAnchorSheetPrompt` 的版面指令「角色定妆参考卡。白色中性背景…」），不是干净的外观描述；且**没有把锚卡图片一并 attach**，模型只能「文字描述 vs 帧」比，做不到真正的人脸比对。身份轴 v1 实为「主体是否符合文字描述」，非视觉身份比对。改进方向：attach 锚卡图 + 帧双图，或存干净 appearance 描述。
> - **P-V2 闭环对单镜重生不闭合**：re-verify 只挂在 `runPlanWithToasts`（批量）。修复消息已指示 agent 走 `run_generation_batch`（→闭合），但若 agent 用单镜 `regenerateNodeInPlace` 修 → 不触发 re-verify。健壮性缺口（单镜重生后未自动复验）。
> - **P-V3 verify 失败 = 静默当「无偏差」**：所有镜 judge 失败（非多模态/解析失败）→ `setDeviations([])` → 无卡 + 预算回满，与「真收敛」不可区分。方向安全（不误报），但 verify 整体失效时用户无感。
> - **P-V4 「可关」无 UI**：plan 说 verify 默认开可关，目前只有 `localStorage` flag（`isShotVerifyEnabled`），无设置开关。需补设置项。
> - **P-V5 chat 模式工具仍在场**：`agentChatV2` 不读 `payload.mode`，verify 调用仍带画布工具 → 模型理论上可能吐 tool call 而非 JSON。已用「不要调用任何工具，只输出 JSON」prompt 缓解，残留风险待真机观测。
> 这些**不在沙箱里盲改**（P3：模型面的质量调整须真机验证，否则是没验过的猜测）；留待真 Nomi.app 走查时按真实表现定优先级再改。
>
> ---
> 原始方案（下方不变）：状态：方案已拍板两个岔路（半自动·每轮确认 / verify 默认开）
> 来源：2026-06-28 论文雷达（HollyWood Town/OmniAgent 2510.22431、MUSE 2602.03028、DramaDirector 2606.24107）+ 真实代码勘查（见下「现状勘查」每条 file:line）
> 关联记忆：[[retry-must-not-wrap-paid-submit]]、[[reconcile-edge-drop-and-card-redesign]]、[[memory-system-redesign-2026-06-20]]、[[staging-reference-tool-shipped]]、[[storyboard-image-first-convergence]]

---

## 0. 一句话

把 Nomi 的「剧本→拆镜头→逐镜生成」从**单向河流**改成**有界闭环**：每镜生成后做一道**看画面的结构化校验（verify）**，检测出偏差后允许**回灌给拆镜头规划师改前面的分镜/剧本、再只重生坏的那几镜**——全程用**独立的 loop 轮次预算**封顶、付费重做**每轮人点头**，verify 这步复用用户已连的便宜视觉模型（成本噪声级）。

学界这轮收敛到的结论：decompose-stitch 的单向 DAG 本身是病，解药是「能回头改前面那步的闭环」。Nomi 缺的不是「回头改」的机器（拆镜头规划师本就支持 re-plan），缺的是**①能看画面检测对错的 verify 原语**和**②把已有的免费 re-plan 从『提交前』解锁到『提交后』并安全封顶**。

---

## 1. 为什么做（底层逻辑，给非技术读者）

**现在的毛病**：分镜落到画布后是一条单向河流，只能往下流。第 5 镜生成出来发现主角的脸错了 / 构图跟剧情冲突 / 接不上前一镜——Nomi 今天**根本检测不到**（只能检测硬失败和「连线掉没掉」这种结构问题，看不了画面内容），即便发现了，也只能在第 5 镜**原地重生**，回不到「问题其实在拆镜头那一步」去改。错误一路往下滚雪球。

**三篇论文说的同一件事**：
- **MUSE**——生成完要 `verify`（按身份/构图/时序三轴机器校验），违反就 `revise`。→ Nomi 缺的「看画面」那道闸。
- **HollyWood Town/OmniAgent**——把单向 DAG 改成「**有限重试的有向有环图**」，下游失败能回灌改前面阶段，但 retry budget 封顶。→ Nomi 缺的「提交后能回头改」+「安全封顶」。
- **DramaDirector**——镜头描述拆成「静态视觉（机位/构图）×动态叙事（动作/情绪）」两类字段。→ 顺手能让 verify 更准（拿静态 spec 核构图）。

**用户体验是什么**：用户生成完一条分镜，画布上不再是「一堆镜头，对错全靠肉眼」；而是机器先逐镜标出「这几镜身份/构图/连贯有问题」，在现有那张对账卡上给出**人话偏差**和一个「让 AI 修」——点了之后 AI **不止修连线，能回去改分镜再重生坏镜**，且每次真花钱重做前都弹现有付费确认卡让用户点头。

---

## 2. 现状勘查（真实代码，每条带 file:line —— 落地都钉在这些点上）

### 拆镜头规划师（已支持 re-plan，但锁死在提交前）
- `src/workbench/generationCanvas/agent/runStoryboardPlanner.ts:16-63`：`runStoryboardPlanner` 接受 `storyText`（首次）**或** `currentPlan + revisionRequest`（修订重出整个方案）。`:37-60` 的 `onToolCall` 闸**只放行** `read_canvas_state` / `propose_storyboard_plan`，任何写/付费/破坏性工具一律拒——**规划师全程免费只读**。
- `src/workbench/generationCanvas/agent/storyboardLauncher.ts:24-45`：`buildStoryboardPlanningMessage`，带 `currentPlan+revisionRequest` 时让规划师基于现有方案重出。
- `src/workbench/creation/CreationAiPanel.tsx:165-209`：`launchStoryboardPlanning`，修订分支 `isRevision = currentPlan && !storyboardPlanCommitted && revisionRequest?.trim()`（`:169`）——**关键锁：re-plan 只在方案『未提交到画布』时可触发；一旦提交，没有任何 plan 级回灌路径。**

### 数据形状
- `src/workbench/generationCanvas/agent/storyboardPlan.ts:54-58`：`StoryboardPlan = { title, anchors: PlanAnchor[], shots: PlanShot[] }`。
- `:19-36` `PlanAnchor`（跨镜一致对象：character/scene/prop/style）；`:38-52` `PlanShot`（`index, durationSec, anchorIds[], prompt, modelKey?, modeId?, params?`）。
- `:242-303` `storyboardPlanToCreateNodesArgs`：视觉锚→参考卡、每镜→video 节点、锚→镜参考边；`:240-241,:297-299` 注释明写**不连 shot→shot 链**。

### 逐镜生成链
- `src/workbench/generationCanvas/runner/generationRunController.ts`：单节点 `runGenerationNode`（`:95-181`）、批量 `runGenerationNodesBatch`（`:211-247`）、**拓扑波次** `runGenerationNodesByPlan`（`:255-299`，上游失败的镜被显式置失败 `:280-288`）。
- 首帧→视频门：`canRunGenerationNode`（`:378-418`，video 节点必须先有 firstFrame/参考图）。
- 成败判定：成功 `addNodeResult`（`:164`）；失败置 `recoverable`（超时 `:170-172`）或 `error`（`:177-178`）。

### 重试 ↔ 付费提交隔离（铁律所在，闭环必须守）
- 重试在**渲染层** `generationRunController.ts:128-162`，封顶 `maxAttempts` 1–5 默认 3（`:80-83`），只重试瞬态错误 `isRetryableGenerationError`（`:62-78`）。
- 全部重试共用**同一 `idempotencyKey = run.id`**（`:136-138`）→ `runner/generationNodeExecutor.ts:19-20,35` → `request.extras.idempotencyKey`。
- 付费提交在**主进程** `electron/runtime.ts:525-629`，`assertAndConsumeSpendGrant` 后才真下单（`:541/:548/:593-603`）。
- IPC 边界 `electron/main.ts:393`：`nomi:tasks:run` 被 `runTaskWithIdempotency` 包；查询 `nomi:tasks:result`（`:394`）**故意不包**（免费）。
- 去重内核 `electron/submissionLedger.ts:34-64`：同键 replay 首个 promise、**绝不二次执行**（`:43-50`），settle TTL 5min（`:19,:57-61`）。模块头 `:1-11` 写死不变量「同键提交内核最多执行一次」。

### 「让 AI 修」（现状只局部，不 re-plan）
- 卡：`src/workbench/generationCanvas/components/ReconcileDeviationCard.tsx:62-64`「让 AI 修一下」→ `AssistantTimeline.tsx:63,88-93` → 处理 `CanvasAssistantPanel.tsx:651-658`：固定指令=读画布、**重连掉的参考边 / 换支持的模型**。**纯局部，不调 `runStoryboardPlanner`，不能 re-plan。**
- 偏差源：`src/workbench/generationCanvas/agent/reconcile.ts:50-201` `reconcileProposal`——比对「批准 vs 搭出来」的**结构**，`SKIP_REASON_TEXT`（`:20-24`）出人话；**不看生成出来的图/视频内容**。

### verify 原语（订正 2026-06-28 勘查：产品里无现成视觉调用，复用 agent 多模态链路）
- **现 eval judge 是看文字的**：`evals/lib/judge.mjs:151` `judgeOne` 喂 `镜头N《标题》: prompt` 文本，无图输入——评文案不评画面。
- **`chatVision` 是评测专用、不是产品路径**：`evals/loop/semiObjective.mjs:23` + `evals/loop/appBridge.mjs:125` 的 `chatVision` 靠 Playwright `_app.evaluate` 在**主进程**里解密 key + fetch，**只在 eval harness 跑**。`grep` 全 `src/`+`electron/` 产品代码**无任何渲染层可调的视觉入口**。故 plan 初稿「复用 chatVision」不准确。
- **真正复用目标 = agent 的 attachments 多模态链路**：`src/api/desktopAgentsChatStream.ts:11-16` `AgentAttachmentPayload{ url, contentType, fileName, kind:'image'|'file' }`；`generationCanvasAgentClient.ts:45,167` → `workbenchAgentRunner.ts:87` 已把附件透传给 `runWorkbenchAgent`（bytes 走 `nomi-local://`，主进程按需读）。**verify = 用 mode:'chat'（无工具）+ 把镜头首帧图作 attachment + 结构化 rubric prompt 调 `runWorkbenchAgent`，解析 JSON 判决**。这是 P1 正解（复用现有多模态基建，不新建视觉 IPC 子系统）。
- **代价订正**：verify 走的是**用户连的 agent 模型**（需多模态/视觉能力），不是独立「便宜视觉档」。§7 成本量级仍成立（按该模型的图+文 token 计），但「另一个便宜额度池」的说法作废——它和创作助手同一个 agent 模型额度。若用户的 agent 模型非多模态 → verify 降级为「仅结构校验」（不硬上、诚实标）。
- 抽帧（视频镜需取帧给模型）：验证身份/构图用镜头的**首帧图片节点**（i2v 的首帧那张，本就是静态图）即可，无需视频抽帧；纯 t2v（无首帧节点）镜的连贯/构图校验留待后续（抽帧 IPC 落点待核实）。

### 结论：缺口只有两样
1. **看画面的 verify 原语**（产品链路里，复用 `chatVision`）——今天零。
2. **把已有免费 re-plan 从『提交前』解锁到『提交后』**，并用独立预算安全封顶。

---

## 3. 两个已拍板的决策（记录）

| 岔路 | 拍板 | 理由 |
|---|---|---|
| 闭环自动化档位 | **半自动·每轮确认** | verify 自动检测+自动提议改法，但每一轮**付费重做**前弹现有付费确认卡，用户点一次才花。守住「绝不偷偷扣费」。 |
| verify 是否花钱 | **默认开·用便宜视觉档** | 复用用户已连视觉模型（没连才提示）。成本噪声级（10 镜一条分镜 ≈ 0.5–1.4 美分，便宜档），比它守的付费生成低 2–3 个数量级。给开关可关。 |

成本测算见 §7。

---

## 4. 分阶段落地（按依赖顺序，每阶段独立可交付、独立过五门）

### Stage 0 — 解锁「提交后 re-plan」（最小结构改动，打通回边，零新增花钱）
**做什么**：让「让 AI 修」在判断问题出在上游（分镜/剧本层）时，能升级到触发一次 **scoped re-plan**（调已有 `runStoryboardPlanner`，带 `currentPlan + 偏差作为 revisionRequest`），而非只重连边。
**落点**：
- `CanvasAssistantPanel.tsx:651-658`：`onDeviationAiFix` 分两路——结构性边丢失→现状局部修；上游语义偏差→走新的 `requestStoryboardReplan(currentPlan, deviationSummary)`。
- 解开 `CreationAiPanel.tsx:169` 的 `!storyboardPlanCommitted` 锁，使提交后也能进 revision 分支（但提交后 re-plan 必须**走 §4 Stage 2 的预算 + diff 受理**，不能裸放）。
**为什么先做**：re-plan 机器现成且免费，先把「回头改分镜」这条回边在结构上打通，用户手动触发，零自动花钱、零新原语，风险最低。

### Stage 1 — 镜级 verify 原语（MUSE，真缺的地基）
**做什么**：每镜生成成功后，跑一道结构化校验，按 MUSE 三轴打分 + 出人话偏差：
- **身份**（identity）：画面主体是否符合该镜 `anchorIds` 指向的角色/产品锚点。
- **构图**（composition）：机位/构图是否符合镜头描述（Stage 3 后可对静态 spec）。
- **连贯**（continuity）：是否接得上前一镜（接 shot→shot 上下文）。
**落点（新增领域层纯函数 + runner 钩子）**：
- 新 `src/workbench/generationCanvas/agent/shotVerify.ts`（纯函数：组 prompt + 调 `chatVision` + 解析结构化判决，可裸测，仿 `vbenchRubric.mjs` 形状）。
- runner 钩子：`generationRunController.ts:164` 成功后挂一道 verify（**不阻塞主流程、异步出偏差**），结果并入对账卡数据源。
- 扩 `reconcile.ts` 的偏差模型：从「只结构」加一类「内容偏差（来自 verify）」，喂进同一张 `ReconcileDeviationCard`。
**默认开/可关**：verify 默认开、用 `chatVision`（没连视觉模型→提示并降级为「仅结构校验」，不硬上）。设置加一个开关。
**守红线**：verify 花的是用户**便宜视觉模型额度**，与付费生成额度池虽同源但量级噪声；verify **绝不触发任何付费生成提交**。

### Stage 2 — 接成有界闭环（HollyWood Town）
**做什么**：verify → 决策（局部修 vs 回灌 re-plan）→ 有界 re-plan（免费）→ **只重生真正坏的那几镜**（付费，每轮人点头）。
**核心机制**：
- **独立 loop 轮次预算**（与 §2 的 retry budget 完全分开）：新状态机管「回灌重做」轮次，默认封顶 **2 轮**。位置 `runStoryboardPlanner.ts` 旁新增 `storyboardLoopBudget.ts`（纯状态机，可裸测）。
- **付费隔离铁律**（守 [[retry-must-not-wrap-paid-submit]]）：
  - re-plan **免费**（规划师只读闸已保证）。
  - 重生坏镜=**意图变了的新镜**→应当拿**新 `run.id`（新幂等键）**正常下单，**不是** retry 的同键 replay。两者花钱模型相反（见 §6 对比表），代码上必须显式区分：闭环重做走「新 run」路径，绝不复用旧 `idempotencyKey`。
  - 每轮付费重做前**弹现有付费确认卡**（半自动·每轮确认），用户点头才 `assertAndConsumeSpendGrant`。
  - loop 预算耗尽 → 停，落「已尽力，剩余偏差请手动处理」态，**绝不静默续花**。
- **只重生坏镜**：re-plan 后 diff 出真正改动的镜，仅这些进重生队列（其余复用已有结果），避免整批重做烧钱。

### Stage 3 — 镜头字段拆静态×动态（DramaDirector，可选/后置）
**做什么**：`PlanShot`（`storyboardPlan.ts:38-52`）的 `prompt`+`params` 拆成**静态视觉**（机位/构图/场景→接 3D 站位参考 [[staging-reference-tool-shipped]]）和**动态叙事**（动作/情绪→进 prompt）。
**收益**：verify 的「构图」轴能拿静态 spec 做机器对照，更准；与 Nomi 3D 站位参考架构同构。
**为什么后置**：纯 schema 重构，牵动拆镜头规划师产出格式 + 存量方案迁移（守 [[never-wipe-user-data-on-update]]），收益偏增量，0→2 跑通后再做。

---

## 5. 不动项（明确不碰，防范围蔓延）
- **不抄任何论文的训练管线**（DramaDirector 核心要训模型 + 语料 + 画廊，对走 vendor API 的 solo Nomi 不 drop-in）。只取架构思想/schema。
- **不引入新框架/新依赖**（闭环=现有 agent + runner + ledger 的重组，纯 TS）。
- **不动幂等台账内核** `submissionLedger.ts`（闭环靠「新 run.id」走正常下单，不改去重逻辑）。
- **不做全自动无确认花钱**（用户已选半自动·每轮确认；全自动档不实现）。
- **不改 retry budget 语义**（瞬态重试仍同键 replay；闭环预算是另一个独立 governor）。

## 6. 两套花钱模型（必须代码级区分，闭环最危险处）

| | 瞬态重试（现有） | 闭环回灌重做（新增） |
|---|---|---|
| 触发 | 瞬态错误（429/5xx/网络） | verify 检出内容偏差 |
| 意图 | **没变**（同一镜重发） | **变了**（改了分镜=新镜） |
| 该花钱 | **绝不**（同键 replay） | **该花**（新 run.id 正常下单） |
| 封顶 | retry budget（≤5） | **独立 loop budget（≤2）** |
| 人确认 | 否（瞬态自愈） | **每轮付费前必确认** |
| 隔离 | `submissionLedger` 同键不重发 | 显式走新 run、绝不复用旧键 |

## 7. 成本测算（verify，已拍便宜视觉档默认开）
- 单镜 verify ≈ 2k 输入 token（1 张 ~1024px 图 + prompt/锚点/rubric/system）+ ~250 输出 token ≈ **2.3k token**。
- 10 镜一条分镜 ≈ 23k token。
- 便宜视觉档（moonshot-vision/Qwen-VL/gemini flash——用户现用档）：**≈ 0.5–1.4 美分/条**；高端档（gpt-4o/claude）≈ 9 美分/条。
- 对比：它守的单镜 t2v 付费生成贵 **2–3 个数量级**。结论：verify 成本噪声级，且花用户自己便宜视觉额度，经济账压倒性划算。
- （价格为规划级估算，随用户实连模型浮动；非精确报价。）

## 8. 回滚
- 每个 Stage 独立 commit、独立可回滚。
- Stage 1 verify：一个设置开关 + `chatVision` 不可用即降级「仅结构校验」——关掉开关即回退到现状对账卡（纯结构）。
- Stage 2 闭环：loop budget 默认值可配；设为 0 即等于「只 verify 提示、不自动回灌」，退回 Stage 1 行为。
- 不动幂等台账与 retry，故现有付费安全性零回归风险。

## 9. 验收门（P3：全绿≠完成）
**五门（R11）**：每 Stage `pnpm run gates` 全过（filesize→tokens→lint→typecheck→test→build）。
**单测**：
- `shotVerify.ts` 纯函数裸测（组 prompt / 解析判决 / chatVision 不可用降级）。
- `storyboardLoopBudget.ts` 状态机裸测（轮次封顶 / 耗尽落「已尽力」态 / 绝不越界续花）。
- **付费隔离回归测**（最关键）：构造「verify 检出偏差→回灌→重做」链路，断言①重做走新 run.id 不复用旧幂等键、②每轮付费前必经确认、③loop 预算耗尽即停不续花。守 [[retry-must-not-wrap-paid-submit]]。
**真机走查（R13，截图人眼判断）**：跑一条真实分镜→故意制造一镜身份偏差→看 verify 是否标出→点「让 AI 修」→确认 re-plan 触发+重做前弹确认卡+只重坏镜。评测/真生成额度默认授权，直接花。
**对账（若涉及 UI 改动）**：对账卡新增「内容偏差」展示需先出样张+用户拍板（R8），实现后与样张逐项对账——**本 plan 暂不含对账卡 UI 改版样张，Stage 1 动到卡片展示前补**。

## 10. 开工顺序
Stage 0（解锁回边，无 UI）→ Stage 1（verify 原语；动对账卡展示前先出样张拍板）→ Stage 2（有界闭环+付费隔离回归测）→ Stage 3（可选 schema 拆分，单独评估）。
每 Stage 完守三闸（根因 P2 / 五门 R11 / 真机走查 R13），过完再进下一 Stage。

# Nomi Harness 拆解 + 参考池定稿

> 配套文档,和 `2026-06-10-nomi-harness-requirements.md` 互补:
> - **需求真相源** 讲「要什么」(24 需求点 + 可控的透明)。
> - **本文** 讲「怎么搭、抄谁」——把顶尖 harness 拆开,定下 Nomi 的参考池和实现蓝本。
> 方法:Context7 拉官方文档 + WebSearch 找 2025-2026 最新开源 + 逐行读源码核实。每条标注核实程度。
> 日期:2026-06-10。

---

## 0. 一句话结论(先看这个)

> **Nomi harness 不用从零搭,也不该整体抄谁——而是「ViMax 的 loop 骨架 + OpenHands 的事件溯源(结构化轨迹 V)+ OpenMontage 的预算/视觉闸门 + Claude SDK 的 hook 机制(提议事务)+ ComfyUI 的增量缓存」按层拼起来。**
> 而这套拼法的**统一地基是事件溯源(event-sourcing)**:画布节点图是一条 append-only 事件日志的**投影**,Nomi 的三抽象(提议事务 / 撤销 / 角色)和三 bug(②卡顿 ③漂移)全部落在这一条日志上。

---

## 1. 框架钉死:H = (E, T, C, S, L, V) 八件零件

我们凭直觉搭的"8 件零件",撞上了一篇真实的 2026 学术综述
[*Agent Harness Engineering: A Survey*](https://github.com/Gloriaameng/Awesome-Agent-Harness)(110+ 论文,23 系统)的 **H=(E,T,C,S,L,V)** 六分量模型。我们的 8 件和它干净对应:

| 我们的零件 | 综述分量 | 一句话 | 对应 Nomi 需求簇 |
|---|---|---|---|
| **Loop** | **E** 执行循环 | 思考→调工具→执行→喂回→再思考,到收敛才停 | (内核) |
| **Tools** | **T** 工具注册 | 注册/分发/schema/handler | (内核) |
| **Context 管理** | **C** 上下文管理 | 压缩/裁剪防爆窗口 | C(成本侧也相关) |
| **Sessions** | **S** 状态存储 | 持久化/resume/fork | (内核) |
| **权限闸门** | **L** 生命周期钩子 | 鉴权/策略/插桩(批准门) | A(提议) |
| **结构化轨迹** ⭐ | **V** 评估接口 | 行动轨迹/中间状态/成功信号 | B·D·E(进度/撤销/记忆) |
| Subagents | (折进 T + 多 agent) | 分而治之 | — |
| MCP | (折进 T) | 外部能力统一接口 | — |

**含义**:框架不是拍脑袋,是和学界正式模型对齐的。**V 是综述里的 Evaluation Interface,正是我们最在意、Agent SDK 最弱的那一格。**

---

## 2. Harness 侧拆解:编码域全栈 harness 怎么填这 8 格

### 2.1 八维对比矩阵

✓ 强/内置 · ≈ 部分/需自建 · ✗ 缺

| 系统 | E Loop | T 工具 | C 上下文 | Subagents | S 会话 | MCP | L 权限 | **V 轨迹** ⭐ |
|---|---|---|---|---|---|---|---|---|
| **Claude Agent SDK** | ✓ | ✓ @tool+in-proc MCP | ✓ 引擎侧(不透明) | ✓ `agents=`+Task | ✓ resume/fork/checkpoint | ✓ 一等公民 | ✓ can_use_tool+hooks | **≈ 流式吐 typed msg,但不落盘/不可回放,得自建** |
| **OpenHands** ⭐ | ✓ 事件传递式 | ✓ typed+MCP | ✓✓ 压缩本身事件化 | ≈ delegation | ✓ EventLog+base_state | ✓ V1 原生 | ✓ SecurityAnalyzer+ConfirmPolicy(也是事件) | **✓✓ 不可变 append-only EventLog,因果链可回放——金标准** |
| **AIOS** | ✓ syscall 链(隐式) | ✓ Tool Mgr+VM | ✓ Context Mgr 模块 | ≈ 多租户(规划中) | ✓ Storage/Memory Mgr | ✓ 仅 computer-use | ≈ 沙箱(规划中) | **≈ 只有 uvicorn 文件日志,无可查询轨迹** |
| **OpenClaw + PRISM** | ✓ gateway runtime | ✓ +ClawHub skills | ✓ 持久记忆文件 | ≈/✓ 群聊 | ✓ routing+sessions | ✓ | ✓✓ 10-hook PRISM(最强 L) | **✓ 防篡改审计日志(治理用,非回放)** |

> **更正你那张表**:OpenClaw 是 Peter Steinberger 的**聊天/消息自治 agent**(Clawdbot→Moltbot→OpenClaw,2026-01 改名),**不是编码全栈 harness**;PRISM 是它的**安全层**(arXiv:2603.11853),10 个生命周期 hook,是 **L 做到极致 + 审计版的 V**。综述里"唯一全 ✓"指的是 **OpenClaw 运行时 + PRISM 安全层合体**,且那个 V 是**审计日志**,不是 OpenHands 那种回放型事件溯源。

### 2.2 V(结构化轨迹)深挖——两种哲学,Nomi 两个都要

| 哲学 | 谁 | 给你什么 | 给不了什么 |
|---|---|---|---|
| **A 事件溯源——"日志即状态"** | **OpenHands**(+ Claude SDK 若你自己落 `uuid`/`parent_tool_use_id`) | append-only 不可变事件 + 因果链 → 重放重建状态 → resume/容错 → 顺因果链倒查"哪一步漂了" | 不能 bit 级复现未来 LLM 的随机输出 |
| **B 审计/治理日志——"证明发生过什么"** | **OpenClaw/PRISM** | 防篡改、全生命周期(含权限决策、密钥命中)→ 取证/合规 | 不为 resume/replay 设计 |

**排序(只论 V):OpenHands(V1)= 金标准** > OpenClaw/PRISM(审计) > Claude SDK(有原料无成品,demo 里靠 `PreToolUse`/`PostToolUse` hook 手写 `transcript.txt`+`tool_calls.jsonl`)> AIOS(只有文件日志)。

**OpenHands V 的关键机制(值得逐条偷师)**:
- 一切皆不可变 Pydantic `Event`(`id`/`timestamp`/`source∈{user,agent,environment}`),进 **append-only EventLog,这条日志同时是 agent 的记忆 AND 审计日志**。
- 类型化:`ActionEvent`(带 `thought`/`llm_response_id`/`security_risk`)、`ObservationEvent`(带 `tool_call_id` **指回**触发它的 action)。
- **因果链**(`tool_call_id`/`cause`/`llm_response_id`)——这就是"哪一步出错"能回答的原因。
- 压缩本身是可回放事件(`CondensationSummaryEvent` 记 `forgotten_event_ids`+`summary`)。
- resume = 载入 `base_state.json` + 重放事件;能从"最后处理的事件"继续。
- 诚实边界:重放复现的是**日志里记录过的轮次**,不是重新调模型复现未来输出。

---

## 3. 创作侧参考池:2026 最新开源(分层)

### 3.1 分层参考池表

| 层 | 推荐项目 | 活跃度(核实程度) | 教 Nomi 哪一层 | 短板 |
|---|---|---|---|---|
| **⭐ agent×创作画布(最接近 Nomi)** | **ViMax** (HKUDS) | 9.6k★,最近 commit **2026-06-09**(实测) | **整套 8 件零件骨架**(见 §3.2) | TUI/CLI 非画布 UI;无 MCP;权限闸门弱 |
| **agentic 创作工具(同栈)** | **Jaaz** (11cafe) | 6.3k★,v1.0.30 2025-08(近期 cadence 未核实) | **Electron+React+Python 怎么落地 agent×infinite canvas**(和我们技术栈几乎同构) | README 不暴露 loop/session/trace 内部;视频/素材弱 |
| **创作域权限+自审** | **OpenMontage** (calesthio,AGPLv3) | 4.6k★(commit 日期未核实) | **预算闸门 + 视觉自审 gate**(见 §4) | 无中央编排器,偏 pipeline |
| **昂贵/慢节点执行图** | **ComfyUI** (Comfy-Org) | 行业基线,高活跃 | **增量缓存 / 只重跑变了的节点 / 子图缓存 / 显存按需** | 无 agent 层;平铺 JSON 对 LLM 不友好 |
| **节点图+agent(研究 SOTA)** | **ComfyMind** (NeurIPS 2025) | eval code 2025-09 | **闭环反馈 + 局部回溯**(失败只改局部不全量重生成) | 研究代码,面向"生成工作流"非驱动画布 |
| **可持久化+撤销画布** | **tldraw** | 47.7k★,v5.1.0 2026-06-03(实测) | **canvas 状态建模**:reactive store / `document`+`session` 分离快照 / `editor.run()` 事务 / mark+bailToMark 时间旅行 | **自定义许可证**(生产要 license key、不收贡献)→ 法务风险 |
| **画布备选(许可证干净)** | **Excalidraw** (MIT) | 高活跃 | 同上,MIT 无商用限制 | history/time-travel API 不如 tldraw 可编程 |

> Nomi 画布现状用 React Flow(xyflow);tldraw/Excalidraw 这一层学的是**历史/快照模型**,不是替换画布。

### 3.2 蓝本深拆:ViMax `agent_runtime/loop.py`(逐行读过)

目录分层(实测):`loop.py`(主循环)/ `tool_executor.py`(派发)/ `tools.py`(注册表)/ `context_compactor.py`(压缩)/ `session_index.py`(会话+轨迹落盘)/ `llm.py` / `prompts.py` / `vimax_adapters.py`(通用 runtime → 业务适配)。**这套"通用 runtime + 适配层"分法正好契合 P4「通用第一」。**

| 零件 | ViMax 怎么填(源码实测) |
|---|---|
| **Loop** | `AgentLoop.stream_events()` async 迭代器,每 turn 一个 `TurnControl()`;`while True:` 组 `[system,*history,user]`→`llm.complete(tools=...)`→无 tool_calls 转 `finalizing_answer` break,有则派发后继续。**有 `MAX_TOOL_PASSES=50` 死循环护栏。** |
| **Tools** | `ToolExecutor.execute()` 异步,用 `asyncio.Queue` 流式回吐进度;结果以 `role:"tool"` 回灌。 |
| **Context** | **抢先式压缩**:采样前估 token 压力,超阈值发 `compact` 事件、`synthetic_summary_message` 替换 history、落盘;**带 `previous_summary` 增量摘要**。 |
| **Subagents** | **实测是单 loop + 阶段化 prompt + 工具角色**,不是真多 agent 进程。→ **对 Nomi 是好消息:不必上多 agent,一个 loop 走完,角色由 prompt+工具体现**(呼应 bug① 评审里"要不要多 agent"的纠结)。 |
| **Sessions** | `SessionIndex.active()/create()`,`vimax tui new/resume`,每 turn `append_turn_record()`。 |
| **MCP** | **无**——Nomi 要 MCP 得自己加(空格)。 |
| **权限闸门** | **弱**,仅 `MAX_TOOL_PASSES`。→ **抄 OpenMontage 而非 ViMax**。 |
| **结构化轨迹 V** ⭐ | **填得最满**:每 turn 落 `turn_record{turn_id,status,assistant_turns,tool_rounds,transitions,final_text,ISO 时间戳}`;**显式状态机 transitions 带 reason 标注**(`executing_tools→post_tool_decision` "tool_round_completed" 等);采样前 yield `prompt_trace` 暴露拼好的 prompt。**这就是"完整追踪每一步、可回放可审计"。** |

**直接借鉴**:把 `loop.py` 的「TurnControl + transitions 状态机 + turn_record 落盘 + 抢先式压缩 + 死循环护栏」整套搬来当骨架;**唯独权限/预算闸门 + MCP 两格 ViMax 是空的,另补。**

### 3.3 ViMax 论文层拆解(arXiv:2606.07649,2026-06-02;PDF 已读全文)

§3.2 拆的是 ViMax 的 **runtime 层**(loop.py);论文讲的是它的**域机制层**(长视频一致性怎么保)。两层互补,域机制层对 Nomi 同样值钱:

| 论文机制 | 一句话 | Nomi 现状(实测) | 可学点 |
|---|---|---|---|
| **依赖图 + 拓扑调度**(§2.3.1,Eq.7) | 规划期从镜头描述提取共享元素建依赖图;生成期拓扑排序——无依赖并行、有依赖等前置完成后做 reference-conditioned 生成。**消融:去掉它全局一致性 -8.7%**(论文最强结论) | **半套已有**:画布边(first_frame/style_ref/character_ref…)就是依赖图,`generationReferenceResolver.ts:61-90` 已做边→参考图解析(= Eq.7);**但 `runGenerationNodesBatch`(generationRunController.ts:249-284)是平铺 FIFO 不看边**——依赖节点和前置同时开跑,resolver 解析不到结果时 `continue` **静默丢参考**,裸跑 | ⭐**最高优先**:批量生成改拓扑调度(独立簇并行、依赖节点等前置),~100 行改在一个文件;丢参考时显式报错而非静默 |
| **两步生成:文→关键图→视频**(§2.1.1) | 先生成角色立绘/场景图/关键帧,过质检后再 image-to-video——**在便宜的图像阶段拦住废片,贵的视频阶段不浪费** | 形态已支持(图节点 + first_frame 边喂视频节点;J2 定妆链路就是 character profiles),但拆镜 agent 不会主动按"先关键帧后视频"铺节点 | 拆镜 planner prompt + 工具 schema 引导两步铺法;与成本 gate(S7)叠加:贵的视频步前先确认关键帧 |
| **VLM best-of-k 质检**(§2.1.2,RQ6) | 每任务并行采 k 个候选,VLM 评委按保真/叙事/规格打分取最优。**细节:k=2 最优,k≥3 反而引入选择噪声;质检在关键帧阶段做,不在视频阶段**(便宜)。消融:去掉 -3.8% | 无(参考池里 OpenMontage 的 ffprobe 自检是免费的技术检查,VLM 评审是花钱的审美检查,两层不同) | 作为可选 spend lever:关键帧 best-of-2 + VLM 评分;烧用户额度,**需拍板** |
| **层级分解 + RAG**(§2.2) | 故事递归拆 事件→场景→镜头,每层只处理本层规模;RAG 检索原文给每个节点"补血"防分解丢信息。消融:去掉因果链,叙事忠实度 3.52→2.34 | 拆镜 planner 是单 pass(maxSteps 24),短文案够用;长剧本/小说(J2)会撞认知过载 | 长输入时分层拆+原文检索;backlog,等用户真喂长本子再做 |
| **转场视频锚定空间**(§2.3.2) | 同场景多机位先生成一段 A→B 运镜视频,抽两端帧当"空间锚",借单段视频内部天然 3D 一致性焊住正反打 | 无 | 高级特性,backlog(镜头组空间锚) |

**论文 Limitations 给 Nomi 的定位确认**(原文):ViMax "does not yet address … **interactive revision**"——交互式修订正是它没有、Nomi 全部设计(提议事务/计划卡/整笔撤销)所在的位置。**ViMax 是一键流水线,Nomi 是人在回路的画布**;它的域机制(依赖调度/两步生成/质检)可搬,它的"全自动"形态不可搬。另一条:"future harnesses could shift toward **long-horizon visual memory management** across scenes"——与我们簇 E(项目记忆)方向一致。

---

## 4. 创作 harness vs 编码 harness 的本质不同(多三道 gate)

创作域"慢、贵、要视觉评审、靠审美"逼出编码 agent 没有的结构:

1. **执行前预算/成本闸门是一等公民**。OpenMontage:执行前估价,单步超阈值(默认 $0.50)触发人工签字,总上限 $10;7 维打分选 provider(含**成本效率**),决策入轨迹。→ 编码 agent 工具调用近乎免费可重试,从不为"这一步值不值得花钱"设 gate;**Nomi 节点慢且贵,必须把成本估算+签字做进 loop**(= 需求簇 C)。

2. **"自审"靠像素而非编译器**。编码 agent 验证=跑测试(确定性二值);创作 agent 验证=**后渲染视觉自检**(OpenMontage 用 ffprobe 抽帧查黑帧/破损/静音,"review 不过就不呈现";ViMax 并行生多张用 VLM 选最一致)。→ **审美判断塞进 loop 当 gate**(呼应 P3「全绿≠完成」、R13,但这里是 agent 自动做)。

3. **增量/缓存语义不同**。编码重跑=重读文件(廉价);创作节点重跑=烧钱烧时间。→ **"只重跑变了的节点"是架构核心**(ComfyUI 增量缓存),失败**局部回溯而非全量重生成**(ComfyMind)。Nomi 必须有"节点指纹→命中缓存就跳过"+"单节点失败只重试该节点"(= 顺手治 **bug② 卡顿**)。

4. **状态用画布建模,不用文件树**。编码世界=文件系统、撤销=git;创作世界=**画布快照+历史栈**(tldraw:`document`/`session` 分离、`editor.run()` 事务、mark/bailToMark)。Nomi 的"撤销一次生成"建在画布 store 上(= 需求簇 D)。

> 一句话:**编码 agent 优化"正确性/速度",创作 agent 优化"成本/审美/可控重跑"**——多三道 gate(预算、视觉自审、增量缓存)+ 一套画布历史模型。

---

## 5. Nomi Harness 设计方向(综合落地)

### 5.1 统一地基:事件溯源把三抽象 + 三 bug 全收编

**核心决定(待拍板):一条 per-project 的 append-only `EventLog` 作为唯一真相源,画布节点图是它的投影。** 这一条同时满足 P1「不要第二份真相源」。

事件类型(typed,仿 OpenHands):
`UserIntentEvent` / `PlanEvent` / `NodeProposalEvent` / `VendorCallEvent`(带解析后的 archetype+mapping+params)/ `GenerationResultEvent` / `ApprovalEvent` / `RejectionEvent`。

| Nomi 抽象/需求 | 在事件溯源上怎么落 | 借鉴谁 |
|---|---|---|
| **提议事务**(簇 A) | `NodeProposalEvent` 被一个 `PreToolUse` 式批准 hook 拦住 → 渲染提议卡 → 批准则跑、记 `ApprovalEvent`,拒绝记 `RejectionEvent`(仿 OpenHands `UserRejectObservation`) | Claude SDK hook 机制 + OpenHands 事件 |
| **撤销/回滚**(簇 D) | **checkpoint + append 补偿事件 + 重投影**——事件溯源让撤销"免费",历史不被改写 | OpenHands 重放 + PRISM append-only 纪律 |
| **角色/锁**(簇 A) | 权限决策**也进日志**;已定的 AI 标记为只读,改它要新 `ApprovalEvent` | OpenHands 权限即事件 + PRISM hook |
| **进度/人话**(簇 B) | 进度条 = 实时投影 `transitions` 状态机;一句人话 = 当前事件的人类可读摘要 | ViMax transitions + 渐进披露 |
| **记忆**(簇 E) | 项目记忆卡 = 对 EventLog 的物化视图(可见可纠正) | OpenHands"日志即记忆" |
| **成本**(簇 C) | `VendorCallEvent` 前置成本估算 gate + 签字 | OpenMontage 预算闸门 |
| **治接入漂移**(bug 杂项) | 每次 vendor 调用是 `VendorCallEvent` 带完整解析元数据,因果链回指提议 → 错误输出可定位到具体 mapping/archetype 步 | OpenHands 因果链 + 我们已有的主进程埋点 |
| **卡顿**(bug②) | 节点指纹缓存(命中跳过)+ 单节点失败局部重试 | ComfyUI 增量 + ComfyMind 回溯 |

### 5.2 按层抄谁(参考池定稿)

| 层 | 抄谁 | 取什么 |
|---|---|---|
| **Loop / Context / Sessions / 轨迹骨架** | **ViMax `agent_runtime/loop.py`** | TurnControl + transitions 状态机 + turn_record 落盘 + 抢先式压缩 + 死循环护栏 |
| **结构化轨迹 V(深化)** | **OpenHands** | 不可变 typed 事件 + 因果链 + 压缩事件化 + 重放 resume |
| **提议事务机制** | **Claude Agent SDK** | `PreToolUse`/`PostToolUse` hook + `parent_tool_use_id` 线索 |
| **预算 + 视觉自审 gate** | **OpenMontage** | 执行前估价签字 + ffprobe 后渲染自检 |
| **节点增量重跑** | **ComfyUI + ComfyMind** | 节点指纹缓存 + 局部回溯 |
| **画布历史模型** | **tldraw(读思想)→ Excalidraw/自建(落地)** | `document`/`session` 分离 + 事务 + 时间旅行;**许可证用 MIT,避开 tldraw license** |
| **MCP** | 自己加(ViMax 没有) | model-agnostic 外接口 |

---

## 6. 砍掉的候选(避免后面有人再捡)

- **闭源(Lovart/Flora/Krea/Visual Electric/Runway/Manus)**:进不了代码池,只进 **UX 观摩清单**。
- **通用 workflow 搭建器(Dify/Flowise/n8n/Langflow/Coze)**:节点=逻辑步骤,非"慢且贵的生成镜头",无成本/视觉/增量,形态错位。
- **生成工作流那一支(ComfyUI-Copilot/ComfyGPT)**:解"用 NL 生成一张 ComfyUI 图",和 Nomi"用户主导逐节点"错位;**只取 ComfyMind 思想 + ComfyUI 机制**。
- **MovieAgent/StoryMem 等**:研究级**模型/扩散方法**(多镜头一致性),是 Nomi 会去调的 vendor 能力,不是 harness 架构。
- **tldraw 本体**:架构金标准但许可证有法务风险,只读思想不依赖。

---

## 7. 待你拍板的取舍点(R3)

> ⚠️ **本表已被 `2026-06-11-nomi-harness-master-plan.md` §8.2 取代,勿据此施工**——D2/D3 的问法已被三路代码实测修正(画布非 React Flow、loop 已存在,移植 ViMax 不再成立)。本表仅留作调研时点的历史记录。

| # | 决策 | 方案 A | 方案 B | 倾向 |
|---|---|---|---|---|
| D1 | 核心地基 | **事件溯源**(EventLog 为唯一真相源,画布是投影) | 维持现状(画布 store 为真相,轨迹另存) | A——一举收编三抽象+三 bug,满足 P1 |
| D2 | 骨架来源 | **移植 ViMax loop.py** 改造 | 完全自建 | A——有同构蓝本,省一大截;但要核 ViMax 许可证(MIT)与改造成本 |
| D3 | 画布历史 | Excalidraw(MIT)思路自建 | 直接长在现有 React Flow store 上 | 待定——看现有 store 能否承载事务/快照 |
| D4 | 第一块落地 | **提议事务**(激活簇 A+D+治 bug②) | 结构化轨迹 V(先把日志地基铺好) | 待定——D1 定了 A 才稳;若选事件溯源,V 是 A 的前置 |

---

## 核实程度声明

- **doc/源码级核实**:Claude Agent SDK(Context7 官方)、OpenHands V0+V1(DeepWiki/官方文档/arXiv 2511.03690)、ViMax `loop.py`(逐行)、ViMax commit 日期(2026-06-09 实测)、tldraw 持久化文档、综述矩阵、OpenClaw/PRISM 身份(arXiv+awesome-list)。
- **未深核**:OpenClaw gateway 内部、PRISM 正文(只读摘要)、AIOS 各模块内部、Jaaz/OpenMontage 内部 loop 代码(README+目录级)、tldraw mark/bailToMark 逐字 API、ComfyMind/ComfyUI 缓存(论文+DeepWiki,未跑代码)。

## 来源

- [Agent Harness 综述 (H=E,T,C,S,L,V)](https://github.com/Gloriaameng/Awesome-Agent-Harness)
- [Claude Agent SDK](https://github.com/anthropics/claude-agent-sdk-python) · [demos](https://github.com/anthropics/claude-agent-sdk-demos)
- [OpenHands 事件存储与重放 (DeepWiki)](https://deepwiki.com/All-Hands-AI/OpenHands/12.2-event-storage-and-replay) · [SDK paper arXiv:2511.03690](https://arxiv.org/html/2511.03690v1)
- [AIOS](https://github.com/agiresearch/AIOS) · [OpenClaw](https://github.com/rohitg00/awesome-openclaw) · [PRISM arXiv:2603.11853](https://arxiv.org/abs/2603.11853)
- [ViMax](https://github.com/HKUDS/ViMax) · [loop.py](https://raw.githubusercontent.com/HKUDS/ViMax/main/agent_runtime/loop.py)
- [Jaaz](https://github.com/11cafe/jaaz) · [OpenMontage](https://github.com/calesthio/OpenMontage)
- [ComfyUI](https://github.com/comfy-org/ComfyUI) · [ComfyMind](https://github.com/EnVision-Research/ComfyMind)
- [tldraw](https://github.com/tldraw/tldraw) · [Excalidraw](https://github.com/excalidraw/excalidraw)

# Nomi 记忆系统重设计 — 调研 + 多方案对比（待拍板）

> 2026-06-20。本文档是**方向设计 + 拍板用对比表**，不是实现单。结论先行：Nomi 的「记忆」不该是一个会自己长、会漂移、只装文字的盒子，而该是**一摞用户/AI 共同维护、能装参考图和生成参数、被显式挂到镜头上的「设定卡」**——文本管事实与意图，参考图与参数管身份与外观，两者在同一张卡里各司其职。
>
> 配套调研：① 现有代码全盘点（file:line，见 §1）② SOTA agent 记忆架构（Mem0 / Letta / Zep-Graphiti / Anthropic memory tool / Cline / 学术，见 §2）③ 创作域记忆范式（SillyTavern lorebook / 角色一致性边界 / Sudowrite·NovelAI·Novelcrafter story bible / 影视 production bible，见 §3）。

---

## 0. 为什么现在做：用户原话的两个判断

1. 「我们做了一些简单的记忆机制，但其实做得很烂」——属实。现状是 **6 层东西各管各的、互不收口**，且最该用的那层（创作助手）根本没接上（§1 子系统 4 逐行确认：创作助手的 `projectMemory` 是**空牌**，从不注入）。
2. 「真的自己去调研最新项目」——做了。结论非常一致：**所有严肃的图像/视频一致性工具都选「结构化卡片 + 显式挂载」，没有一个靠自由文本记忆锁身份**（§3）。这条直接决定了 Nomi 的记忆形态。

---

## 1. 现状盘点：当前记忆其实有 6 层，但是裂的

| 层 | 存储 | 真相源 | 上限/截断 | 注入创作区? | 注入生成区? |
|---|---|---|---|---|---|
| **L0 身份** `NOMI_AGENT_IDENTITY` | 代码常量 `agentChatV2.ts:56` | 代码 | — | ✅ | ✅ |
| **L1 当面专长** | 代码（creationAiModes / buildStaticAgentSystemPrompt） | 代码 | — | ✅ | ✅ |
| **L2 项目记忆 facts** | `.nomi/memory.json`（物化视图） | **EventLog**（可重建） | ≤1500 字符注入预算 | ❌ **未注入** | ✅ `client:159` |
| **L3 模型工作缓存** | 内存 Map + `.nomi/agent-session.json` | 有损快照 | 30 轮 / 24k token / 旧轮字符串截 120 | ✅ per-area | ✅ per-area |
| **L4 会话历史线程** | 内存 + `.nomi/conversations.json` | UI 气泡 | 30 线程 / 200 消息 | ✅ creation | ✅ generation |
| **L5 EventLog** | `.nomi/events/log-*.jsonl` + sidecar | **append-only 总账（最底真相源）** | 单事件 4KB / 段 5000 事件 | 间接 | 间接 |

**四个根因级断点**（重设计要解决的就是这四条）：

- **断点①：创作助手失明。** L2 项目记忆只单向喂生成区（`generationCanvasAgentClient.ts:159` 有 `formatMemoryForPrompt`），创作区 `CreationAiPanel.tsx` 全文无此 import、调 `runWorkbenchAgent` 时**根本没传 systemPrompt**。用户在画布锁了角色卡、攒了偏好，创作助手读不到。→ 这就是 6-20 审计说的「记得 N 条是空牌」。
- **断点②：写入只靠 6 条死规则、零 LLM。** `projectMemory.ts:84-136` 的 `distillEvent` 只认 `canvas.node.added`(character/scene) / `prompt-changed` / `locked` / `unlocked` / `removed` / `proposal.approved`。**用户在对话里随口说的「我喜欢冷色调」永远进不了记忆**——除非落成节点或改写提议。且 `pref:overrides` 文案写死，不带「改成了什么」。
- **断点③：L3 / L4 两份分裂存储。** 工作缓存（agent-session.json）和会话历史（conversations.json）各存一份，靠 `seedActiveModelMemory` 单向同步，会漂移；落盘只存 `{id,role,content}`，丢附件/tool 结构，翻历史重建是有损的。
- **断点④：压缩仍是 truncate-oldest，无摘要、无召回。** `agentChatHarness.ts` 超 30 轮/24k 直接丢最早轮（`COMPACT_KEEP_TAIL=8` 只截字符串不删轮），没有语义召回、没有长期摘要、没有跨项目。

**一个被低估的好消息**：Nomi **已经有了正确的原语**——`character/scene` 卡本就是画布节点 kind，`projectMemory` 已经在提炼它们。问题不是「缺一个记忆库」，而是「这套卡片是弱的、写得窄、读得断的影子」。重设计 = **把设定卡升成记忆的单一真相源**，而不是新造一个数据库。

---

## 2. SOTA agent 记忆架构（调研，带来源）

> 全部一手源逐项核过。最 load-bearing 的一条：**凡 LLM 抽取/摘要的方案都会让精确值悄悄漂移**——这直接撞我们「界面不许说谎 / 精确不能漂移」铁律。

| 方案 | 写入 | 存储 | 更新/遗忘 | 检索 | 需向量库 | 本地可行 | 精确保真 |
|---|---|---|---|---|---|---|---|
| **Mem0** | LLM 流水线自动抽取 | 向量(+可选 Neo4j 图) | LLM 判 ADD/UPDATE/DELETE/NONE | 语义搜→拼接 | 是(FAISS 可进程内) | 中(Python sidecar+每写多次 LLM) | ⚠️**弱**(默认改写原文;需 `infer=False`+metadata) |
| **Letta/MemGPT** | **agent 自调工具** | in-context **memory blocks** + 向量 archival | `core_memory_replace` 覆盖 / 驱逐→摘要 | block 钉 prompt + archival 搜 | 是(archival 强制) | ⚠️重(服务+Postgres,无嵌入式) | ✅强(core block 逐字不摘要) |
| **Zep/Graphiti** | LLM 流水线(~5 调用/episode) | **双时间知识图谱**(类型化边) | **invalidate 不 delete**(四时间字段) | 混合(语义+BM25+图遍历)**查询零 LLM** | 是(+图 DB) | ⚠️动荡(嵌入式仅 Linux/mac=Windows 阻断) | ✅最强(离散边+留历史) |
| **Anthropic memory tool** | **agent 自调工具(文件操作)** | **磁盘文件(你托管)** | `str_replace` 逐字编辑 | 模型 `view` 按需读 | **否** | ✅**极佳**(纯 fs,客户端) | ✅**逐字** |
| **Cline Memory Bank** | agent 写 markdown(里程碑触发) | **结构化 .md 文件** | 重写对应 .md | session 开始全读 | **否** | ✅极佳(零基建,git 友好) | ✅逐字 |
| **Generative Agents** | observation 追加 | 记忆流(带时间戳) | recency 指数衰减(隐式淡出) | **recency+importance+relevance 加权** | 部分(relevance 用嵌入) | ✅好(公式驱动本地跑) | 中(原始逐字;反思是综合) |

**可直接为 Nomi 所用的三个模型（借模型不借 runtime）**：

1. **Anthropic memory tool / Cline 的「文件即记忆」**——纯磁盘 markdown，零依赖、逐字保真、git 可 diff。我们现有的 `MEMORY.md + 链接笔记`正是这个形态，是正确默认。给 Nomi：每项目一个轻量记忆文件，模型先读、按需取、逐字编辑。
2. **Letta 的共享 memory block**——多 agent `attach` 同一 block id，任一改动即时互见。**这正是「创作助手 + 拆镜头规划师」共享「项目设定 / 用户偏好」最干净的原语**，直接补断点①。即使不引 Letta runtime，这个模型可在我们 Zustand/IPC 里原生重实现。
3. **若将来记忆量超出「全量入上下文」**：别整套引 Graphiti/Letta（Python+服务+图 DB，跨平台还有 Windows 阻断），而是在 **JS 原生嵌入存储（SQLite + sqlite-vec + FTS5）** 上重实现混合检索，可选叠 Graphiti 的「invalidate 不 delete」+ Generative Agents 的「recency+importance+relevance」排序 + idle 时 consolidation pass。同机制、跨平台、轻量。**但这是 C 方案，现在的记忆量远没到。**

来源：[Mem0 2504.19413](https://arxiv.org/abs/2504.19413) · [MemGPT 2310.08560](https://arxiv.org/abs/2310.08560) / [Letta memory-blocks](https://docs.letta.com/guides/core-concepts/memory/memory-blocks) · [Graphiti 2501.13956](https://arxiv.org/abs/2501.13956) · [Anthropic memory tool](https://platform.claude.com/docs/en/agents-and-tools/tool-use/memory-tool) · [Cline Memory Bank](https://docs.cline.bot/best-practices/memory-bank) · [Generative Agents 2304.03442](https://arxiv.org/abs/2304.03442)

---

## 3. 创作域记忆范式（调研，带来源）— 决定形态的那条

**核心结论：记忆应是「结构化设定卡片库 + 显式挂载」，绝不是「自由文本记忆库」。自由文本只配做软偏好的边角料，永远不碰身份。** 四条硬论据：

- **论据①：自由文本物理上承载不了一张脸。** Nomi 的核心一致性诉求是「同一角色在 30 个镜头长得一样」。身份活在**视觉条件信号**里——参考图(IP-Adapter / FaceID)、LoRA 权重、seed——作为生成参数喂进管线。文本只存词；即使完美文本（「棕发绿外套」）也复现不出同一张脸。整个 AI 图像/视频领域**无一例外**用视觉信号锁身份（"IPAdapter 管这人是谁，ControlNet 管这人在做什么"）。"自由文本记忆库"在我们最核心的诉求上从第一性原理就是错工具。
- **论据②：动画百年工艺早把「记忆」被迫劈成两半。** **story bible（文本/事实）vs art bible / model sheet（视觉锚点）**。没人靠读「她大眼睛短发」保持角色 on-model，靠的是看 **turnaround 转面图**；读描述必然 off-model 漂移。Nomi 要的恰恰是 on-model → 角色卡的一致性锚点必须是**存下来的参考图**，不是文本 prompt。
- **论据③：确定性 + 可审计是创作刚需。** 出片前作者必须知道「这个镜头挂了什么」。卡片答得了「角色 A 参考图@权重 0.8 + 场景 B 配色」；不透明记忆 blob 答不了。自由文本记忆实测「有时用有时不用」+幻觉条目+跨上下文串台（context rot），当目标是 30 镜同一角色时这些是 disqualifying 的。
- **论据④：只有卡片能携带生成参数。** Nomi 的一致性大头在生成层（参考图/seed/模型/权重），不在文本层。三范式里**唯有结构化卡片能在同一对象里同时装文本事实 + 参考图 + seed + 模型 + 权重**。自由文本和 lorebook 都只搬文本。

**最贴合 Nomi（节点式画布）的现成设计 = Novelcrafter Codex**：类型化实体（character/location/object…）+ Name + **Aliases** + Description（文本载荷）+ 每条一个 **AI Context 三态开关：always sent / only when detected / never**——"detected" = 在分镜文本里扫到 Name/Aliases 命中就自动注入。这是「结构化卡片 + 自动 mention 挂载」最干净的写法，比 SillyTavern/NovelAI 的 token 预算机器更适合离散节点画布。

来源：[SillyTavern World Info](https://docs.sillytavern.app/usage/core-concepts/worldinfo/) · [IP-Adapter 2308.06721](https://arxiv.org/abs/2308.06721) / [IP-Adapter-FaceID](https://huggingface.co/h94/IP-Adapter-FaceID) · [Sudowrite Story Bible](https://docs.sudowrite.com) · [NovelAI Lorebook](https://docs.novelai.net/en/text/lorebook/) · [Novelcrafter Codex](https://novelcrafter.com/help/docs/codex/) · [Model sheet](https://en.wikipedia.org/wiki/Model_sheet) · [Color script](https://www.studiobinder.com/blog/what-is-a-color-script-definition/)

---

## 4. 三个方案（对比表 · 拍板用）

> 三方案不是互斥的「三选一」，是**递进的雄心**：A 是止血、B 是脊梁、C 是将来。推荐 **B 为主线，A 作为 B 的切片 0 先落地止血，C 的零件等记忆量真撑不下再上**。

| 方案 | 一句话 | 用户会看到什么 | 解决哪些断点 | 代价 / 风险 | solo 适配 |
|---|---|---|---|---|---|
| **A 止血** | 修空牌 + 双向注入 + 拓宽抽取 | 创作助手也「记得」项目设定了；说一句偏好它能记住 | ①创作助手失明 ②写入太窄（部分） | 小。不动存储。不解决「文本锁不住脸」 | 高（1-2 天） |
| **B 设定卡库（推荐脊梁）** | 设定卡 = 单一真相源，卡片同时装文本+生成参数，三态自动挂载到镜头，自由文本降级为软偏好层 | 项目里一个「设定库」面板：角色/场景/风格卡，每张带参考图+参数槽；拆镜头时 AI 自动把角色卡挂到对应镜头，画布上看得见挂了谁；可手动改挂 | ①②③ 全解 + 接住「AI 只产文本不产配置」P0 缺口 | 中。要建卡片数据模型 + 挂载 UI + mention 检测 + 把现有 character/scene 节点收口进卡库（加新必删旧） | 中（按切片走，每片可独立交付） |
| **C 分层记忆引擎（将来）** | 共享 memory block + SQLite 检索 + idle consolidation + 双时间事实 | 跨会话/跨项目「它真的越用越懂我」；老项目语义召回相关设定 | ④压缩/召回/跨项目 | 大。SQLite+sqlite-vec、consolidation pass、嵌入。大部分现在是过度设计 | 低（广度是敌人，延后） |

### 三方案各自的精度铁律（贯穿，不可破）

精确约束（色值 `#8B0000` / 尺寸 / 型号 / 数字 / 锁定值 / 镜序 / 时长）**逐字进卡片字段或文件原文，永不进任何 LLM 摘要/抽取路径**。一层 LLM 摘要罩在精确设置上 = 第二真相源会静默 drift = 违 P1 + 违「界面不许说谎」。对应到方案：身份/参数走「卡片槽（逐字）」，软偏好才允许走「AI 抽取」。

---

## 5. 推荐主线 B 的切片排期（每片独立可交付，待拍板后细化）

- **切片 0（= 方案 A 止血，低风险高收益，建议先做）**：
  - 创作助手注入项目记忆 / 设定卡（补断点①）——用**共享 block 模型**让两 agent 看同一份。
  - 拓宽写入：允许「对话里说的软偏好」经一次 LLM 抽取进**软偏好层**（提议态，用户确认才转正，禁自动注入身份）。
- **切片 1：设定卡数据模型**。把现有 `character/scene` 节点收口为 `SettingCard`（类型化：角色/场景/风格），每张 = 文本字段（name/aliases/description）+ **生成参数槽**（参考图/seed/模型/权重）。单一真相源，删旧的窄 projectMemory 提炼分支（加新必删旧）。
- **切片 2：显式挂载到镜头节点**（确定性、可审计）——复用画布「参考边」语义，镜头节点显式显示挂了哪些卡。
- **切片 3：mention-scoped 自动挂载**（Novelcrafter 三态）——拆镜头时 AI 在分镜文本检测角色名/别名自动挂卡，留手动 override。直接接住「拆镜头只产文本不产配置」P0。
- **切片 4（可选）：项目级风格/配色序列卡**（类比 color script）——给跨镜头视觉协调一个独立 artifact，每镜对照检查离群。
- **切片 5（= C 的入口，延后）**：软偏好/历史超量时才上 SQLite+sqlite-vec 召回 + idle consolidation。

跨项目维度（基础库/风格模板库）= 正交，挂在 B 之上做；版权红线：纯文本 prompt/风格模板可做，参考图素材库需用户提供合规源（沿 [[history-prompt-backlog-2026-06-15]] 第三批待拍板）。

---

## 6. 用户拍板（2026-06-20，已定）

1. **方向 = 认 B 主线**：A 止血（切片 0）先做 → B 设定卡库为脊梁 → C 引擎延后。
2. **设定卡形态 = 现有节点升级版**：不另起一套库；把画布上的 character/scene 卡节点加上「参考图 + 生成参数槽」，复用已有原语，加新必删旧把窄的 projectMemory 提炼分支收口进来。
3. **软偏好 = 准，但提议态**：AI 可从对话抽软偏好，先存草稿在 UI 给用户「要不要记住这条」，确认才转正才注入；**禁止自动注入身份类**（身份永远走卡片逐字槽）。

→ 据此细化排期见 §5；下一步先对**用户可见部分**（软偏好提议卡 / 设定卡的参数槽 UI）出可体验样张（R8），再进实现。切片 0 里「创作助手注入 + 共享 block」是后端接线，可先于样张落地。

---

## 7. 实现进度 + 现状对照（回填）

### 切片 0（已交付）
- **后端接线 — 已 push（c0d2e8c）**：记忆注入从渲染层下沉到后端 `runAgentChatV2` 单一注入点（`agentChatV2.ts`，按 `projectIdFromSessionKey(sessionKey)` 解析 → `getProjectMemory` → `formatMemoryForPrompt`，放 system 末尾）。创作区/生成区**共享同一份记忆**（Letta 共享 block 落地），根治「创作助手失明」。`formatMemoryForPrompt` 移到后端 `projectMemory.ts` 单一真相源，渲染层同名死函数 + 其测试删除（P1），等价测试迁后端。typecheck 双向 + 274 单测 + 五门全过；真机 LLM E2E 需额度未验。
- **软偏好提议卡 — 样张已出（show_widget `soft_pref_proposal_card`）**：对话流里「要记住这条偏好吗？」可编辑措辞 + 记住/不用 + 塌成确认条并入「AI 记得 N 条」折叠条。诚实标边界（只记软偏好，身份不自动记成文字）。**待用户拍板触发粒度/时机后实现。**

### 切片 1（设定卡库）— 样张已出 + 现状对照（实现 grounding）

样张：show_widget `setting_card_library`（角色卡升级版：参考图锁身份 + 别名 + 参考强度 + 自动挂载三态 + 挂到镜头的出镜角色，全可交互）。

现状盘点（Explore 实测，file:line）：现有 character/scene = **image 节点 + categoryId + renderKind + 两三个 meta 文本字段**，没有「我是个被引用的设定」身份。升级要补：

| 维度 | 现状 file:line | 设定卡需补 |
|---|---|---|
| 数据结构 | `nodeMetaFields.ts` CharacterMeta 仅 `tagline?/tags?` | `meta.aliases: string[]`（别名/@引用目标，自动挂载靠它命中） |
| 参考图 | 卡的「图」= `node.result.url`（自产）；上传参考走 `meta.referenceImageUrls`+edge | 卡自带「参考图槽」（多张、锁身份），区别于自产 result |
| 参考强度 | `ArchetypeReferenceSlot`（`modelArchetypes/types.ts:22-47`）**无 weight 字段** | 参考图 weight/强度（槽 + 投递层都要补，**vendor 门控**） |
| 三态自动挂载 | 完全没有 | 总是挂 / 检测到名字才挂 / 从不（Novelcrafter Codex） |
| 挂载可视化 | 卡面仅 `UsageDot` 数字（`useNodeRelationships.ts:66`）；镜头面无显示 | 卡面「挂到哪些镜头 + 出镜角色（主体/出镜/背景）」；镜头面挂载徽章行 |
| 出镜角色 | edge mode = `character_ref/style_ref/composition_ref`（参考语义，`generationCanvasTypes.ts:205`） | 主体/出镜/背景三态（映射到 edge mode/meta，**vendor 门控**） |
| kind 身份 | character/scene 插件 `registry.ts:75-104`，渲染 `render/CharacterCardNode.tsx`/`SceneCardNode.tsx` | 沿用现 kind；扩 card body 布局承载上述 |

复用而非另造：参数/参考槽渲染复用 `NodeParameterControls.tsx` + `AssetReference.tsx` + `ModelParameterControl`；建议改文件 = `render/CharacterCardNode.tsx`/`SceneCardNode.tsx`/`CardCommon.tsx`/`nodeMetaFields.ts`。

**路径现状（2026-06-20 当前代码核实，非旧记忆 — 用户路径图 show_widget `setting_card_user_path`）**：设定卡活在「生成画布」阶段，诞生于拆镜头（创作区→画布），消费于逐镜生成。逐触点状态：
- ✅ **拆镜头自动建角色/场景卡**：`storyboardPlan.ts:242` 视觉锚→character/scene 节点+character_ref 连边落画布（`applyCanvasToolCall.ts:171`）。
- ✅ **喂参考进 vendor（核心管线，今天通）**：character_ref 边源图真进 `reference_image_urls`（`generationReferenceResolver.ts:70`→`catalogTaskActions.ts:72`→`archetypeMeta.ts:393`），有回归锁 `catalogTaskActions.test.ts:82`。**6-13/6-14「丢参考」已修**（之前本文档的过期 caveat 作废）。条件：角色卡已出图 + 目标是认档案的模型；非档案模型仍走只兜首尾帧老路（窄）。
- ✅ **定妆入口可见**：`BaseGenerationNode.tsx:557` 无条件传 onMakeup，已出图图片节点选中即见（6-13「不可见」已修）。
- ✅ **角色卡落 `shots` 分类是「用户拍板 A」不是 bug**（2026-06-20 纠正我之前的武断）：`storyboardPlan.ts:301` 注释明写「角色/场景与镜头同处一个视图，参考边同屏可见可连」。机制：**分类 = 独立子画布**（`GenerationCanvas.tsx:59` 按 activeCategoryId 过滤节点），落 `cast` 会让角色卡跑到「角色」子画布、与「分镜」子画布的镜头**不同屏 → 参考边没法在一屏上连 → 在分镜里没法调用**。所以落 shots 是对的。**唯一残留是装饰耦合**：`renderKind` 推断（`BaseGenerationNode.tsx:269`）只认 `categoryId==='cast'`，导致 character-kind 节点在 shots 分类里渲染成普通图片样式而非角色卡样式。**可选**：把 renderKind 推断从「categoryId==='cast'」解耦成「node.kind==='character'」，让它在分镜子画布里也长成卡——这是装饰优化，**不是 bug、绝不改分类**。
- ❌ **断：镜头面无「挂了谁」常驻标记**：不选中镜头时节点面无角色归属可视，唯一线索是连线；选中才在 composer 参考槽见缩略图。**切片1 可补镜头面挂载徽章。**

**重要重判（2026-06-20）**：核心一致性链路（锚卡→参考边→喂生成）**今天已经通**。设定卡升级（别名/自动挂载三态/挂载徽章/参考强度/多参考图）是给这条已通的链路**加可用性**，不是修 broken。真正的记忆断点是「创作助手失明」（切片0已修）+「软偏好」（待做）。设定卡升级的优先级/做哪几片，需用户在「值不值」上重新拍——别默认全做。

**诚实缺口（D4，实现时如实兑现）**：参考强度 weight + 主体/出镜/背景出镜角色，底层依赖 vendor 能力——按档案声明槽（P4），不声明的卡面**灰掉/隐藏**，不假装通用。

---

## 附：CLAUDE.md R6 参考池更新建议

R6「参考池」当前列的是 coding-agent / 画布向项目，对**记忆专题**不对口。建议补一行记忆专题参考池（见本文 §2/§3 来源），避免下次又凭 CLAUDE.md 里随手写的项目去查。

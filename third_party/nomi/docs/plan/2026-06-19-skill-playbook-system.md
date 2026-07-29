# Agent 创作技能 · Skill / Playbook 系统（#4-c · B 方向）— 完整实现方案

> 2026-06-19 · 状态：方案待实现（交给下一个 AI）。方向用户已拍板：**B = Agent 创作标准技能**（Flova 式）。
> 本文件 = 实现规范。先读它 + Explore 盘点（见 §2 的 file:line）+ `CLAUDE.md`（纪律最高真相源）。
> 注：A 方向「画布操作技能」（抠图/扩图/放大）见 `docs/plan/2026-06-19-skill-framework.md`，是**互补的另一条线、本轮不做**。

## 0. 一句话 + 最重要的结论

**Skill(Playbook) = 用户可写/可导入的结构化创作 SOP**：阶段 + 依赖 + 暂停点 → 路由到 Nomi 现有 agent 工具 → 模型偏好 → 提示词标准 → 安全规则 → 剪辑规则。Agent 读「当前 active skill」按它执行（规划→调工具→关键阶段暂停让用户确认）。可跨项目复用、**可导入**。

> 🔑 **Nomi 已有 ~90% 基建。本方案 = 把现有「单段 skill pack」扩成「多段 playbook」+ 补编排器/管理 UI/导入导出，绝不另起一套（P1）。** 对标 PRD 未实现的「Nomi Workflow Recipe」占位（`docs/archive/2026-05-shipped/nomi-differentiation-prd-2026-05-23.md:371`）。

---

## 0.5 调研结论 + 设计锁定（2026-06-19 更新 · 优先级高于下文任何冲突处）

> 本节是 2026-06-19 做完「现状代码盘点（3 探子）+ 顶尖实现调研 R6（ComfyUI / Dify / Coze / Anthropic Skills / Claude Code / GPTs / Cline-Continue / Flova / n8n）」后的收敛结论。**与下文 §3/§3.2/§6/§7 冲突的，以本节为准**（下文保留原文以便对照演进）。

### 0.5.a 一个必须先知道的现状修正
**manifest 的 `tools[]` / `requiredProviders[]` 当前是死代码**——全仓除 `skillManifestSchema.ts` 自身和其单测外无任何消费者。今天 skill = 纯 markdown 注入（`agentChatV2.ts:142-161` `buildSkillSystemPrompt` 只读 `skill.body`，从不读 skill.json）。
→ 含义：S1 不只是「加 stages 字段」，而是**第一次给 manifest 接消费者**。这既是新工作量，也正是「掉模型/掉工具兜底」的着力点（接线 `requiredProviders`/`tools`）。

### 0.5.b 用户已拍板的三条决策（锁定）
1. **缺能力兜底 = 中档**：接线 `requiredProviders` × `deriveModelCatalogStatus`（`modelCatalogStatus.ts:42-82` 已能判某模态空）；选中/导入 skill 时出「能力清单：文本 ✅ / 视频 ⚠️」，缺的给「去接入」入口；运行时仍有 gate（`gate.ts:51-53`）兜底。
2. **模型偏好引用粒度 = 只引 `kind`+可选 `family`，禁 vendor 专属 archetype id**（schema 校验从源头防绑死）。**追加**（借 Dify）：参数合法区间交模型档案给，**不写进 skill**，换模型 skill 不崩。绑死的唯一根因在 `availableModels.ts:60-66`（无 archetype 即剔除）+ family 兜底 `usableVendorModel.ts:101`。
3. **skill 选择 = 自动路由 + 手动锁定**：Agent 默认按 skill 的 `description`（写成触发条件）自动选最匹配的（同 Flova Planner / Anthropic）；UI 再给「手动锁定某 skill」覆盖入口。

### 0.5.c 调研逼出的方案修正（R6 收敛，带依据）
| 下文原说法 | 修正 | 依据（顶尖实现） |
|---|---|---|
| §3.2 加硬命名字段 `invocationRule`（调用规则） | 改为**自由文本 `description`/适用场景**，写成「何时该调我」喂 Planner 自动路由 | Flova 实测**没有**「调用规则」字段，是 Planner 按 description 自动选（`flova.ai/docs/.../How_to_Write_Skill`）；Anthropic Skills / CC subagent 全系一致：`description`=路由真相源 |
| §3 `stage.modelPrefs` 引用 archetypeId | 只引 `kind`+`family`；参数范围交档案不写进 skill | Dify 模型引用 = `{provider+name+completion_params}`，`parameter_rules` 住 provider 插件（`app_dsl_service.py` / Create Model Providers docs） |
| §3.1 SKILL.md 6 分区一次性注入 | 加**三级渐进披露**：L1 元数据（name+description）常驻、L2 正文（选中触发才喂）、L3 资源（按需读） | Anthropic Agent Skills 核心机制；本地优先磁盘文件零 context 成本 |
| §6 导入「复用 catalog importPackage」 | 升级为 **Dify 三态导入 + 显式 dependencies 段 + n8n 二分缺失 + 导出脱敏**（见 0.5.d） | Dify `app_dsl_service.py` 源码 + n8n 缺凭证/缺节点二分 |

### 0.5.d 导入 / 缺能力兜底的目标设计（抄成熟实现）
- **skill 文件带显式 `dependencies` 段**（导出时遍历各 stage 自动抽取：用到的 archetype / 模型能力 kind / 内置工具 / 素材类型）。让导入时「秒级 diff 缺啥」成立的根（Dify `get_leaked_dependencies` = set 求差）。
- **导出即脱敏**：剥 key / 中转配置 / 本地素材绝对路径 / 项目私有 id；素材只带引用不打二进制（Dify pop `credential_id`、加密 dataset id 同构）。
- **三态导入、非阻断**（Dify）：`COMPLETED / PENDING / FAILED`，**缺依赖 ≠ FAILED**。先把 skill 建进来（草稿/未激活态）→ 再跑依赖体检 → 列清单。版本不兼容走 PENDING 让用户确认。
- **n8n 二分缺失**：① 缺模型能力（≈缺节点）→ 占位 + 一键接入入口（复用 Issue#8 中转接入 / #9 缺脑恢复卡，完全同构）；② 缺 key/额度（≈缺凭证）→ 导入照样成功、标记待配，运行那刻再拦引导配 key。
- **ComfyUI 两条交互**：① 缺能力做成「购物清单」逐项列（不是泛红字）；② **先加载再标红**——缺一环 playbook 照样能打开看全，别锁死（吸收 ComfyUI Issue #6844 死锁血泪）。
- **`requires`（依赖下限，缺了告警）vs `allowed-tools`（权限上限，限制能用啥）是两件事**（Anthropic 只有后者，我们要补前者）。

### 0.5.e 三个反面教材（别踩）
- ComfyUI 把 workflow 嵌进 PNG metadata → 脆（压缩/截图就丢）。用**独立 JSON 文件**分享。
- ComfyUI-Manager「检测 DB vs 实际加载状态」两份真相源 → 撞我们 P1。能力契约 / 已接入模型清单 / skill 校验必须收口同一真相源。
- Coze「平台内私有复制」→ 不可移植、看不到配置。要 Dify 式「可移植自描述文件」。

## 1. 概念（对标 Flova，用户拍板的「B」）

Flova 的 Skill（其官方 docs + 用户给的真实 MV skill 例子）= 一份**多阶段创作 playbook**，编码了：① 流程（阶段+依赖+何时暂停确认）② 每阶段路由到哪个工具/子能力 ③ 模型偏好（哪个模型/分辨率）④ 提示词写法标准 ⑤ 安全合规策略 ⑥ 剪辑规则。Agent 照它执行，**创作决策仍归用户**（每关键阶段暂停审阅）。

Nomi 现状对应：Agent（agentChatV2）+ 单段 skill pack（方法论）+ Project Memory（偏好）+ 工具（拆镜/生成/时间轴）都有，**差的就是「把整条流程写成一份多阶段 playbook 让 agent 串起来执行」**。

## 2. 现状基建（复用，别重造 —— Explore 实测 file:line）

| 现有积木 | 位置 | 对 Playbook 的用处 |
|---|---|---|
| **Skill Pack v2 manifest** | `electron/skills/skillManifestSchema.ts`（`skillManifestSchema` + `parseSkillManifest()`，字段 name/version/tools[]/permissions[]/requiredProviders[]/inputs[]/examples[]）| **扩展它加 stages[]** = playbook 骨架；permissions[]（read-only\|create\|delete\|export）已是工具白名单/安全雏形 |
| **SKILL.md 方法论正文** | `skills/<name>/SKILL.md` + `skill.json` | 「提示词标准/审美/方法论」天然落点 |
| **3 层 system prompt 注入** | `agentChatV2.ts:518` `[NOMI_AGENT_IDENTITY, payload.systemPrompt, skillSystemPrompt]`；加载 `:64 readSkillRecords()`、注入 `:142 buildSkillSystemPrompt()` | playbook 读出后注入第 3 层，**引擎零改** |
| **用户目录加载** | `getSkillsRoots()`（`electron/runtimePaths.ts`，多根=内置+用户）| **用户自定义/导入的 skill 已能落地** |
| **8 画布工具 + 5 文档工具** | 定义 `electron/ai/canvasTools.ts` / `documentTools.ts`；注册 `agentChatV2.ts:287-373`；执行 `applyCanvasToolCall.ts` | playbook 的「积木」全集 |
| → 关键工具 | `propose_storyboard_plan`(暂停审阅,`:293`)、`create_canvas_nodes`(`:298`)、`run_generation_batch`(花钱闸,`:333`)、`arrange_storyboard_to_timeline`(`:340`) | 阶段动作 |
| **暂停/确认机制** | gate `src/workbench/generationCanvas/agent/gate.ts`（allow/deny/confirm）+ `makeAgentTool`(`agentChatV2.ts:243` 每调用 emit 卡片等确认) | **playbook 的「暂停点」语义已有现成实现** |
| **planner skill 范式** | `STORYBOARD_PLANNER_SKILL`(`storyboardLauncher.ts:9`)、`FIXATION_PLANNER_SKILL`(`fixationLauncher.ts:21`)；步数分档 `maxStepsForSkill()`(`agentChatHarness.ts:88`) | **「一个阶段 = 受限工具白名单 + 一份方法论」的单段原型** —— 多段 playbook 就是把这些串起来 |
| **modelArchetypes** | `src/config/modelArchetypes/`（30+ 档案）+ 参数派生 `archetypeInput.ts:25` | 「模型偏好/参数标准」现成数据源，playbook 引用 archetypeId + params 键 |
| **Project Memory** | `electron/memory/projectMemory.ts`（`MemoryFact.kind: preference\|constraint\|style\|character`）+ 注入 `generationCanvasAgentClient.ts:159` | 「习惯/审美/约束」的隐式持久层（与 playbook 显式流程互补） |
| **导入导出范式** | `electron/catalog/catalogStore.ts` `exportPackage/importPackage`（模型目录用）| skill/playbook 的「可导入/跨项目复用」直接借这条路 |

**仓里还没有（要新建）**：① 多阶段+依赖图的 playbook 数据结构 ② playbook 编排器（agent 按 stage 串执行+阶段间暂停）③ skills 管理/导入导出 UI（含设置面板，当前无四 tab 设置弹层）④ 音频分析/唇形同步等 Flova 例子用到但 Nomi 没有的能力（playbook 可声明，需对应模型/工具补齐）。

## 3. Skill / Playbook 格式（扩展现有 manifest，向后兼容）

在 `skillManifestSchema` 上**加可选 `stages` 字段**（无 stages = 现有单段包，照常 work）：

```ts
// 扩展 skillManifestSchema（electron/skills/skillManifestSchema.ts）
stages?: Array<{
  id: string                       // 'resource_analyze' | 'storyboard' | 'media' | 'assemble'
  goal: string                     // 这阶段要达成什么（人话，进 agent 规划上下文）
  tools: string[]                  // 本阶段允许的工具白名单（复用 permissions 思路）
  dependsOn?: string[]             // 依赖哪些阶段（DAG；编排器据此定序）
  pause?: boolean                  // 完成后是否暂停让用户确认（默认 true，对齐 Flova「何时暂停」）
  modelPrefs?: Record<string,{ modelHint?: string; archetypeId?: string; params?: Record<string,unknown> }>
                                   // ⚠️ 已被 §0.5.b/0.5.c 修正：只引 kind+family，禁 vendor 专属 archetypeId；params 不写进 skill，交模型档案给
}>
// 提示词标准/安全规则/剪辑规则 → 写进 SKILL.md 正文（现成）；不强结构化，agent 读正文执行。
inputs?: [...]                     // 已有：声明这 skill 要什么输入（脚本/音频/参考图）
```

设计原则：
- **DAG + 暂停** = Flova「依赖关系 + 何时暂停」的直接落地。编排器拓扑排序，每 stage 完成（尤其 pause=true）走 gate 让用户确认。
- **工具白名单 per stage** = 现有 gate 机制按阶段收紧（规划阶段只给 propose_*，生成阶段才给 run_generation_batch）。

### 3.1 SKILL.md 正文 = Flova 的「6 段固定分区」（用户给的真实编辑器证实）

Flova Skill 编辑器把方法论正文拆成**固定命名分区**（不是自由散文）。Nomi 的 SKILL.md 正文采用**同一套标准分区**（agent 注入后按填了的段执行，空段跳过）：

| 分区 | 写什么（agent 按此执行） |
|---|---|
| **流程规划** | 按什么顺序推进、步骤依赖、怎么和用户交互（= §3 的 stages 的人话版，机读结构在 manifest.stages，人话在这）|
| **素材分析** | 看完上传素材产出什么（提取分镜/整理人物/截帧等）|
| **故事板设计** | 怎么写故事板：含哪些元素、怎么设计镜头、怎么描述画面+镜头语言 |
| **媒体生成** | 怎么生成图/视频/音频：用哪个模型、参考哪些素材、输出设置 |
| **提示词写法** | 图片/视频提示词怎么写 + 提效技巧 |
| **视频剪辑** | 怎么裁剪、怎么对齐音视频、怎么保证连贯 |

> 这 6 段是**视频创作的标准骨架**（Nomi 也是视频工具，契合）。SKILL.md 用这套小标题，编辑器按段渲染表单（见 §7）。

### 3.2 manifest 关键新增字段（除 stages 外）

- **`description`（适用场景 / 何时该调我，≤1024 字）** —— ⚠️ §0.5.c 修正：原写「硬命名 invocationRule」，但 Flova 实测无此字段、是 Planner 按 description 自动路由；Anthropic 同理。改为**自由文本 description 写成触发条件**，喂 Planner 自动选 active skill（+ UI 手动锁定覆盖）。
- **`modelsUsed: string[]`**（卡片展示用，如 ["Seedance 2.0","OmniHuman 1.5"]）— 从 stages.modelPrefs 派生或显式声明。
- **`author` / `version`**（已有 version；加 author）— 市场/卡片展示。
- **`enabled`**（用户侧开关，非 manifest 内）— 哪些 skill 当前启用（存用户配置，不改包）。

## 4. Playbook 编排器（核心新增）

`runPlaybook(skill, project)`：复用 agentChatV2 引擎，**不新造 agent**。
1. 读 active skill 的 stages，拓扑排序（按 dependsOn）。
2. 逐 stage：把 `goal + 本阶段 SKILL.md 段 + 工具白名单`注入 → 跑 agentLoop（步数走 `maxStepsForSkill`）→ stage 内只放白名单工具（gate 拒其余）。
3. stage 完成 + `pause` → 走现有确认通道（卡片/reply）让用户审阅；用户确认后进下一 stage。
4. 全部 stage 完 → 引导导出。
- **复用**：planner skill 范式（单段）→ 多段就是「for stage of stages: 跑一段受限 planner」。暂停=gate+makeAgentTool 现成。

## 5. Flova MV 例子 → Nomi 映射（证明可落地 + 暴露能力缺口）

| Flova 阶段（子能力）| Nomi 对应 | 缺口 |
|---|---|---|
| resource_prepare_and_analyze（音频 BPM/歌词时间戳）| —— | ❌ Nomi 无音频分析；需补工具/模型 |
| text_editor（写 Final_Video_Spec）| 文档工具（insert/replace…）| ✅ 有 |
| storyboard_designer（关键元素+镜头+音频层）| `propose_storyboard_plan`（anchors+shots）| ✅ 基本有；音频层/歌词时间戳绑定要补 |
| media_generator（元素图/关键帧/镜头视频）| `create_canvas_nodes` + `run_generation_batch`（按波次）| ✅ 有；唇形同步 ImageToVideoByAudio(OmniHuman) Nomi 无,需接模型 |
| auditory_designer（缺音频时补）| —— | ❌ 需音频生成 |
| video_assembler（按时间戳合成）| `arrange_storyboard_to_timeline` | ✅ 有；±1s 缓冲/歌词单元对齐要补 |
| 暂停确认（每阶段）| gate + 确认卡 | ✅ 有 |
| 模型偏好（Nano Banana/Seedance/OmniHuman + 分辨率）| modelArchetypes 引用 | ✅ 已接的引用 archetypeId；未接的(OmniHuman)要先接模型 |

→ **结论**：playbook 的「编排骨架」Nomi 现成能跑；**Flova 那个 MV skill 落 Nomi 缺的是几个具体能力**（音频分析、唇形同步模型、音频生成）——playbook 能声明它们，但需按「接入即验证」补对应模型/工具。**所以先用 Nomi 已有能力能跑通的 playbook（如「品牌宣传片」纯图生视频）验证框架，再补音频/唇形同步扩 MV 类。**

## 6. 导入（用户拍板要）

- 用户贴/选一个 skill 包（`SKILL.md` + `skill.json`）→ 落用户 skills 目录（`getSkillsRoots` 多根已支持）→ `parseSkillManifest` 校验 → 注入。复用 catalog `importPackage` 范式。
- **安全**：导入的 skill **只能声明**（阶段/工具白名单/模型偏好/方法论正文），**不跑外部代码**（无 run 函数，区别于 A 方向本地算子技能）。permissions/工具白名单是硬约束，gate 兜底。这让「贴一份 skill JSON 就接入」既像 Flova 分享、又守住安全。

## 7. UI（用户可见 → 实现前先读设计系统 + 出样张 R8）

对齐 Flova 的真实 UI（用户给的截图），三块：

**(a) Skill 市场/库**（列表页）：分 `精选 / 我的创建 / 我的保存 / 草稿`。每个 **skill 卡片**显示：模型徽章（modelsUsed，如 Seedance 2.0 / OmniHuman 1.5）+ 作者(@) + 名称 + 版本(V17) + 描述 + **启用开关（已启用）**。「我的保存」= 从别人/精选保存来的（= 导入/分享落地）。

**(b) Skill 编辑器**（按 §3 的字段渲染表单）：
- `名称` + **`调用规则`**(0/200，多 skill 时何时调) +
- 六段折叠表单：**流程规划 / 素材分析 / 故事板设计 / 媒体生成 / 提示词写法 / 视频剪辑**（每段一个 textarea）+
- **Markdown / 预览**切换（结构化表单 ↔ SKILL.md 源码，双向）+
- **Skill优化助手**（侧栏 AI：帮用户写/润色各段 —— 复用 Nomi 现有 agent，给它「写 skill」的元任务）。

**(c) 创作时选 active skill**：像选模式（`creationAiModes` 旁）挂当前 playbook；agent 按它分阶段跑，**阶段进度可见**（第 N/总 + 每阶段暂停审阅卡，复用 gate 确认卡）。

- 三块都要 token-only + 先出可体验样张（show_widget），让用户感受「选 skill → 分阶段跑 → 暂停审阅」+「表单/Markdown 双向编辑」的手感。
- Skill优化助手是亮点：**用 AI 写 AI 的工作标准**（沉淀品味/习惯）——对齐 Flova「Skill 沉淀你的品味和习惯」。

## 8. 分阶段实现（每阶段真机验，接入即验证）

- **S1 schema 扩展**：`skillManifestSchema` 加可选 `stages`（向后兼容，现有 5 包不受影响）+ 校验 + 单测。
- **S2 编排器**：`runPlaybook` 串多段（复用 agentChatV2/gate/maxStepsForSkill）。用一个**现成能力能跑通的 playbook**（如「品牌宣传片」：拆镜→落画布→生成→时间轴，全 Nomi 已有工具）端到端跑通 + 真机走查（R13）。
- **S3 管理 UI + 导入导出**：Skills 面板 + 选 active + import（复用 catalog import 范式）。R8 样张先行。
- **S4 写 1-2 个完整内置 playbook**（品牌宣传片 / 漫画短片）真机出片验证；MV 类待补音频/唇形同步能力后再加。

## 9. 不动什么
- 不新造 agent / 引擎（复用 agentChatV2 + agentLoop + 三层 prompt）。
- 不另起 skill 系统（扩现有 skill pack manifest，P1）。
- 不为 playbook 单独接模型（引用 modelArchetypes/catalog，P4）。
- 不把方法论/提示词标准强行结构化（留 SKILL.md 正文）。

## 10. 验收门
1. 五门全过；schema/编排器纯逻辑单测（拓扑排序/阶段白名单/暂停语义）。
2. 现有 5 个单段 skill pack 行为不变（向后兼容回归）。
3. S2/S4：一个完整 playbook **真机端到端跑通**（选 skill→分阶段执行→每阶段暂停审阅→出片），截图人眼判断（R13）。
4. 导入：贴一个外部 skill 包→落地→agent 按它走，真机验。
5. 安全：导入的 skill 不能越权（工具白名单/permissions/gate 拦住），单测锁。

## 11. 开放问题（实现前拍板）
- 第一个内置 playbook 选「品牌宣传片」（全现成能力，验框架最稳）还是别的？
- Skills 管理面板放**新建设置弹层**（顺带把模型接入/Agent 也收进去）还是**独立面板**？
- 提示词标准/安全规则：先全留 SKILL.md 正文（轻），还是要结构化几个关键字段（重）？建议先正文。
- MV 类要的音频分析/唇形同步(OmniHuman)/音频生成——**先不做，等 playbook 框架稳 + 这些模型接入后再扩**（别让框架等能力）。

---

## 12. 执行序列（2026-06-20 · 资源少版定稿 · 本节 = 施工真相源）

> 用户拍板：落地 skill 方案 + 基础协作（异步文件分享），持续做到最终结果 + 完整测试。资源少打法下**砍掉 S3 市场/编辑器/AI优化助手**（团队尺寸 + 网络效应对 solo 弱），只做执行体验 + 最小管理面 + 异步分享（skill 与项目共用同一套「打包 + 导入 + projectId 接缝」）。详见记忆 `nomi-solo-founder-strategy`。

### 范围
**做（IN）**
- S1 manifest 扩 `stages` + **第一次给 skill.json 接消费者**（现为死代码）+ 能力校验 + 单测。
- S2 `runPlaybook` 编排器（复用 agentChatV2 / gate / maxStepsForSkill，多段 + 段间暂停）+ 单测。
- 异步分享：项目打包/导入 + skill 打包/导入（共用接缝：打包 + 导入 + projectId 重映射/落地目录）+ 可写用户 skills 目录 + 公网回链剥离决策 + 单测。
- S4 一个内置 playbook「品牌宣传片」（全现成工具）。
- 最小 UI：active skill 选择（自动路由 + 手动锁定 chip）+ 能力清单（缺啥去接入）+ 导入按钮。先出样张 → 用户确认 → 实现 → 真机走查（R8/R13）。

**不做（OUT · 资源少）**：S3 Skills 市场 / 4 分类库 / 6 分区编辑器 / Markdown 双向 / AI 优化助手；实时多人协作 / 云端 / 账号（地基无后端，确认禁区，见 §9 + 实勘）。

### 切片与验收（每片：五门绿 + 单测；若 UI 则加真机走查；过了再 commit）
- **切片 A（S1·后端）**：schema 扩 `stages`（向后兼容）+ `skillStore` 收口加载（skill.json 不再死代码）+ 能力校验函数 + 单测；现有 5 包行为不变（回归）。
- **切片 B（S2·后端）**：`runPlaybook` 多段串执行 + 段间暂停（gate）+ 工具白名单按 stage 收紧 + 单测。
- **切片 C（分享地基·后端）**：项目/skill 打包 + 导入（projectId 重映射、可写 skills 目录、回链剥离）+ 单测（mock 跨机：导出 → 换 id → 导入 → 素材可达）。
- **切片 D（内置 playbook·内容）**：品牌宣传片 `SKILL.md`（6 分区）+ `skill.json`（stages）。
- **切片 E（最小 UI·用户可见）**：样张先行 → 确认 → 实现 active-skill chip / 能力清单 / 导入 → design-fidelity 断言 → 真机走查。
- **切片 F（端到端验）**：一个完整 playbook 真机跑通（选 → 分段执行 → 段间暂停 → 出片）+ 一次真实分享回路（导出 → 导入 → 能跑）。

### 不变量（P1/P4）
- 不另起 skill 系统 / agent / 引擎；skill.json 单一加载真相源（`skillStore`）。
- `stage.modelPrefs` 只 `kind`+`family`，禁 vendor 专属 archetypeId；参数交模型档案。
- 分享只文件交换，无后端。

### 完成回填（2026-06-20）
- **切片 A–E 全部实现 + 五门全过 + 已推送 main**（8c04257 / 5e03ff1 / 26c2af6 / 89efa20 / 074bee0）。后端单测 62（skills 50 + 编排/分享/能力/内置包）。
- **关键修正落地**：manifest 的 `tools`/`requiredProviders` 从死代码接成消费者（`skillStore` 第一次读 skill.json）；`modelPrefs` `.strict()` 结构上禁 archetypeId/params（单测锁）；内置 `brand.promo` 4 段 playbook。
- **真机走查（R13）通过**：创作助手 header 的 active-skill chip 渲染正确（自动「通用助手」↔ 锁定「品牌宣传片」）；picker popover 几何实测 `inViewport:true` 不遮挡，列「自动 / playbook·4段 / 文本图像视频能力 / 导入」；手动锁定切换实时生效。截图 `tests/ux/shots/skill-*.png`。
- **未做 / 待用户**：① 完整 playbook 真机**出片**（选→分段→生成→时间轴）—— 机制已通（选 brand.promo → skillKey 注入 → SKILL.md 方法论），但真实生成跑通受**额度 + 长 agentic 回合**约束，留用户在专门会话跑；② skill 分享回路的 UI 导入用原生文件对话框（驱动测不到，需 electronApp stub）——但打包/导入**核心逻辑已单测往返**；③ 缺能力 ⚠️/「去接入」视觉路径：本机三类模型齐全是 satisfied 态，⚠️ 态由单测 + 对称渲染覆盖，未在缺模型实例上目视；④ 项目整包分享（C2）、自动路由、阶段硬驱动（按 P2 证据触发再加）。

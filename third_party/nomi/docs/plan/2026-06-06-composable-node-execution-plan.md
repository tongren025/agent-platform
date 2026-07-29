# 执行计划：生成节点 → 「档案声明 + 通用原语组装」（待 6 角色评审）

> Rule 4 执行计划。背景三文档：`composable-node-roadmap.md`（路线图+现状盘点+用户旅途）、
> `reference-at-and-sources.md`（素材原语）、样张 `2026-06-06-reference-at-v4.html`。本文 = 可落地的分块计划，
> 评审后定稿再执行。

## 0. 压缩上下文（当前基线，一页看懂）

**已落地（C0–C4 + 保真 + 命名 + Fast，全部 push、CI 五门绿、598 测试）**：
- 内置「模型档案」层（供应商无关，按模型身份认）：Seedance 2.0（首帧/首尾帧/全能参考）+ Seedance 2.0 Fast +
  HappyHorse（文生/图生/角色参考/视频编辑 4 模式合 1，per-mode enum 覆盖）。
- 传输单源（M1/M2/M3）：renderer `buildArchetypeInputParams` 据当前模式产 snake input（含 enum），互斥在投影发生；
  kie 专属尾随空格键单源在 mapping body。`transportTaskKind` 显式声明 mapping 桶（修了 omni 误路由）。
- 节点 composer 已对齐样张 v3：模式条 + 模型芯片(模板/通用徽标) + 设置弹层(带标签悬浮卡) + 参考槽(48px tile/角色徽标/源视频槽)。
  命名用 **vendor 真名**（用户拍板，非意图词）；全程设计 token、Tabler 图标、密度收紧。
- `controls/` 已有四原语雏形：`ModeBar / ReferenceSlots / SettingsPopover / archetypeMeta`（纯展示、档案驱动）。

**已定方向（用户拍板）**：
- 参考区重做 = tile（形态自明）+ @ 内联引用（点 tile/打@ → 缩略图进句子，发送前才转 character1，用户不可见）+
  三来源统一选择器（画布/项目素材[搜+最近+全部]/上传/拖入/连线）+ 规模化（弹层快速取、面板全量浏览）。
- **通用第一（交互层）**：素材引用是通用系统（AssetTile/AssetPicker/AssetMention），住共享模块，谁用谁声明槽。
- **完整用户旅途**：接入(放文档+API)→识别分层(一切皆档案：认得用精修档案/认不出用文档**派生**档案，永不裸奔)→统一使用。
- flat 启发式从「渲染兜底」翻转成「**接入时派生引擎**」→ UI 端永远只认档案。

**纪律（本会话固化进 CLAUDE.md）**：全绿≠完成（样张逐项对账 + 真体感走查）；设计工作自跑设计师+用户 agent；
好产品不靠解释；歧义/矛盾必停上报；词汇=模型真名。

## 1. 目标 + 不做什么

**做**：把生成节点重构成薄壳——档案声明 modes/slots/params，通用原语（ModelPicker/ModeBar/AssetReference/
SettingsPopover）组装。收编散落的 bespoke/并行/白名单。建通用素材引用系统。

**本轮不做**：3D 自成体系（仅模型/参数原语适用，素材不归一）；结果操作（裁剪/旋转/送时间轴）；接入页 OnboardingWizard
本身的体验重做（配套但独立）；真实生成花额度（KIE_API_KEY 门控、先问用户）。

## 2. 分阶段执行（每阶段独立可发：CI 五门 + Rule 11 自提交；用户可见 → Rule 8 样张对账 + Rule 13 走查 + 自跑评审）

### P0 通用素材原语（新模块 `src/workbench/assets/`）
- P0.1 `assetPool.ts`：一处真相源（画布产出 + 上传 + 项目文件 `useWorkspaceFiles`）→ 统一 `AssetRef{id,url,kind,name,thumb,source}`。
- P0.2 `AssetTile.tsx`：形态自明块（图缩略图 / 视频缩略图+播放三角+暗蒙 / 音频波形）；编号/删除/类型，全 token。
- P0.3 `AssetPicker.tsx`：统一选择器（搜索 + 画布行 + 项目素材最近网格[可滚]+浏览全部→面板 + 上传 + 拖入）。
- P0.4 节点级 onDrop（BaseGenerationNode）：拖文件/素材到节点 → 加为参考（不再新建画布卡）。
- DoD：原语单测 + 零额度走查（picker 三来源各走一遍）；样张对账 picker。

### P1 参考槽归一（生成参考作第一个消费方）
- P1.1 `AssetReference.tsx`：吃档案 slots（单/数组），用 AssetTile + AssetPicker；单槽支持跨节点边连。
- P1.2 接生成节点：删 NodeParameterControls 内联 frame 菜单(104 行) + 源视频(30 行) + 合并 ReferenceSlots → 一套。**净删重复**。
- P1.3 连线→参考管道：`connectToNode` 命中有参考槽的目标 → 加 meta（数组不持久画线）。
- P1.4 panorama 上传也并进来（为 P5 铺路）。
- DoD：样张 v4 对账 + 走查（三来源 + 边连）+ 测试；NodeParameterControls 净减。

### P2 模型切换原语
- P2.1 `ModelPicker.tsx`：模型芯片 + 选择器（最近/搜索/全部 + 模板/通用徽标），复用 useModelOptions。
- P2.2 `applyModelSelection(meta, option)` 纯函数；双轨 meta（imageModel/videoModel）收单轨（modelKey/modelAlias），runtime 读取处同步。
- P2.3 删 modelOptionsAdapter ~10 死 API。
- DoD：测试（meta 投影快照）+ 走查（切模型不丢状态）。

### P3 文本节点档案化
- P3.1 text archetype：modes=[续写/改写/重写]，slots=[选中文本]，params=文本模型参数。
- P3.2 文本节点改用 ModeBar；删 composer 的 TEXT_GEN_MODES bespoke。
- DoD：测试 + 走查（文本三模式 + 生成不回归）。

### P4 onboarding→档案桥（= 旅途入口「放文档→出模板」）
- P4.1 `deriveArchetypeFromCatalogMeta(model)`：flat 解析（parameterControlModel 启发式）从「渲染兜底」迁成「派生引擎」，产 archetype。
- P4.2 onboarding 落库时派生并存档案（或运行时按需派生 + 缓存）。
- P4.3 `resolveArchetypeForModel` 永远返回档案（精修 or 派生）；删 `resolveRenderedControls` 的「档案 vs flat」UI 分叉。
- DoD：**用真实 onboarding fixture 跑零回归**；测试 + 走查。**最高风险**。

### P5 节点壳收编 + 巨壳净减
- P5.1 panorama 档案（source_image 槽）；替换 BaseGenerationNode L1028/L1213 bespoke `<input>`。
- P5.2 「有档案就组装 composer」替换 `kind==='asset'/'text'/'panorama'` 白名单分支。
- P5.3 BaseGenerationNode（1406 巨壳）净减；filesize 基线棘轮下调。
- DoD：测试 + 走查（各 kind 不回归）；巨壳净减。

**依赖**：P0→P1；P2/P3 可并行；P4 是 P5「有档案就组装」的前置（让所有模型都有档案）。
**建议起点**：P0+P1（最具体、风险最低、还重复债）；P4 在 tile/picker 跑通后再碰。

## 3. 验收 / 风险 / 回滚
- 每阶段：CI 五门绿 + Rule 11 自 commit/push；用户可见 → Rule 8 样张逐项对账（真渲染并排）+ Rule 13 零额度走查 + 自跑设计师/用户 agent。
- 回滚：先加新原语旁路 → 走查通过 → 切换 → 删旧；旧路保留到验证通过。
- 最高风险 P4：onboarding 模型量大形态杂，桥要兼容全形态（含 legacy sizes/ratios/durs）；真实 fixture 回归。
- Rule 12：本轮净减 NodeParameterControls(649) + BaseGenerationNode(1406)，基线只减不增。
- 真实生成花额度仍门控、先问用户。

## 4. 6 角色评审回填（2026-06-06）—— 全员 GO-WITH-CHANGES

**多角色交叉命中（最强信号）= 必改：**

- **🔴 R1 `nomi-local://` 素材 vendor 取不到（后端，新发现，会让真实生成直接失败）**：上传/项目文件素材的 URL 是
  `nomi-local://`，runtime 把参考 URL 原样模板进 vendor body、**全程无 local→remote 上传**。统一素材池一旦把上传/文件树
  素材当一等参考，就会把 `nomi-local://` 送进 vendor body → fetch 失败。**P0/P1 定契约时必须解决**：`AssetRef` 区分
  「本地渲染 URL」vs「传输 URL」；**发送前在 runtime 侧**把 `nomi-local://` 上传成 vendor 可达 URL 再替换（走已有
  `hardenedFetch` 私网拦截 + 200MB 上限，别开不设防通道）。这是当前计划最大盲点。
- **🔴 R2 P4 拆分 + 「派生 vs 落库」定调（CTO+前端+后端）**：P4 = 双真相源活体期，回滚防不住数据漂移。
  **决议（后端北极星论证：派生是计算不是数据，落库=陈旧档案债=第二真相源）→ 按需派生纯函数 + 进程缓存，不落库**
  （`meta.archetypeId` 已够做锚点，不加新字段；仅「用户对文档的手工修正」才落已有字段）。硬门 = **逐键等价快照测试**
  （派生档案产出的 `archetypeInput`/slots/params 必须和旧 flat 路径 byte/键级相等），尤其删 `buildReferenceExtras`
  flat else 兜底前——否则老模型首尾帧**静默丢传**（比 sizes/ratios 丢默认值更要命）。把 P4 拆 P4a（纯函数+快照零 diff）/ P4b（缓存）。
- **🔴 R3 缺样张（设计师，会重演「两头不靠」）**：现仅参考区有样张。**必补**：P5 满配节点合成（四原语同屏垂直节奏=验收合同）、
  P4 派生档案（真实「认不出模型」渲染，证明不是 snake_case Swagger）、P2 ModelPicker、P3 文本节点。**P4/P5 最关键。**
- **🔴 R4 派生档案会「丑/乱」（设计师+真实用户）**：「不裸奔」只解决有没有结构，没解决好不好看。派生档案 = snake_case
  英文 + N 参数平铺 = 调试面板。**派生引擎带视觉兜底规范**：参数 >N 折叠进「高级」、snake_case 展示层美化（title-case，
  真名留传输层）、出样张审。用户原话「我会怪那个模型怎么这么丑」。
- **🟠 R5 AssetReference 必须声明式 slot 描述符驱动（前端+设计师）**：三套 handler 不是「几乎相同」——单图走边 vs 数组
  meta-only、单 vs 数组、形态 tile vs textRef（文本节点的「选中文本」不是缩略图块）。slot 声明 `{cardinality:single|array,
  persistAsEdge, form: tile|textRef|singleImage}`，原语按它分叉渲染。**数组绝不变边**（崩 `(target,mode)` 唯一性、回归 omni）。
- **🟠 R6 @ 编号 ↔ characterIndexed 单一真相源（前端+后端）**：@ 投影（prompt 文本）和参考槽有序 URL 数组**在同一个纯函数
  一次产出**，否则「句中 chip 顺序」和「reference_image 数组顺序」两套编号漂移。Tiptap **能做、不要 spike**（官方一等公民
  inline atom node + ReactNodeViewRenderer + Mention/suggestion，且已是在用依赖）。
- **🟢 R7 P2 最安全（前端+后端）**：只删**写侧**双轨，**读侧保留 `||imageModel/videoModel` 兜底 + legacy backfill**，0 migration；
  `modelOptionsAdapter` 实测 **13 个**死导出可删。

**产品定调（范围/优先级）**：别把 6 阶段当不可分割大项目。**第一批先发 = P0+P1**（唯一用户可感知 + 风险最低 + 还最重重复债，
有获批样张）；**P4 降级缓做**（高风险×窄受众，但解锁 P5+消灭 UI 分叉）；P2/P3 见缝插针（用户基本无感）；不一次承诺全部。

**🔴 旅途盲点（真实用户最痛，独立并行轨）**：整条路最容易**劝退**的是**第一步「贴接入文档 URL」**——非技术创作者做不到，进门
就走。「认不出模型」那档体面度是第二痛。用户要：**模型列表直接点（别贴 URL）/ 最多填 key（配截图）/ 先空手玩起来尝到甜头**。
→ 接入页（OnboardingWizard）体验是**比节点重构更前置的留存命门**，建议作为并行轨先评估（不在本节点重构范围，但优先级更高）。
徽标统一：模板/通用/角色/vendor 真名多套身份标记 → design system 登记一套 pattern；**精修档案不打标（默认即最好）、只克制标派生**，
别逼用户理解内部两档。MOCKUP-v4 顶部说明文字是评审注释、0 进产品。「浏览全部→面板」用户怕找不回 → 原地展开/选完明确返回。

**修订后顺序**：P0(含 R1 URL 契约 + assetPool 派生非新 store + 性能) → P1(R5 声明式 slot + R6 编号单源 + Tiptap @) →【先发、走查、收反馈】→ 再分批 P2(R7 读侧兜底) / P3 / **P4a 派生纯函数+逐键等价快照（R2/R4 视觉兜底+样张）** / P4b 缓存 / P5(R3 满配样张)。**接入页留存轨并行、优先评估。**

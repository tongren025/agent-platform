# 交接文档 · 连线/参考系统重构 + 跨分类边可见性（给下一个 AI）

日期：2026-06-15
作者：上一轮 AI（连续大会话）
状态：连线/参考 5 切片已落 main；跨分类边只出样张未实现。

> 冷启动先读：本文件 + `docs/plan/2026-06-14-connection-reference-capability-model.md`（方案 v2，含切片定义/对抗评审修正）+ memory `connection-reference-bugs-2026-06-14`（根因地图，真机钉死）+ `ultra-deep-audit-2026-06-14B`（🥇 跨分类边的来龙去脉）。
> 工作纪律以 `CLAUDE.md` 为最高真相源（P1–P5 / R1–R14）。用户拍板的核心原则：**所有决策按长期价值、不止血、不留并行版（P1）。**

---

## 0. 本会话干了两件事

**A. 连线/参考系统重构**（用户报「图生成后连线没用 / 有些线连不上 / 整套喂参考问题多」）—— 已根治两个症状并落 main，见 §1–§3。

**B. 跨分类边可见性**（2026-06-14 极底层审计剩余 🥇 大件）—— 只出 R8 样张 + 拍板，**未实现**，见 §4。

---

## 1. 连线/参考：根因（已真机钉死，零额度复现）

完整根因地图见 memory `connection-reference-bugs-2026-06-14`。一句话：

- **「图生成后连线没用」= UI 显示骗局，不是生成真失败**。手动 image→video(i2v) 边 mode=`first_frame`；生成期**实际有喂**（边→`resolveGenerationReferences`→`buildArchetypeInputParams` 合并进 `image_urls`）；但 UI 参考槽**显示读 meta**（边从不写 meta）→ 槽恒空「+」→ 用户合理判定"没用"。**真相源分裂：显示读 meta、生成读边。**
- **「有些线连不上」**：① 命中盒用名义尺寸 ≠ 真实渲染高（生成后/卡片类更高）→ 松手落卡片下半区 miss、静默取消（R1）；② 去重键只看 (source,target) 忽略 mode → 同两点连不了第二种参考（R2）。
- **机制根**：连边→校验→对账→生成 四段口径不收敛；3 条连边入口只 2 条有校验；`relayFromVideoUrl`（视频接首帧）是零消费者死代码。

复现方法（下个 AI 可复跑，零额度）：常驻 UI 驱动（`tests/ux/ui-driver.mjs` + `ui.mjs`，CLAUDE.md 有用法）打开示例项目「交易体系搭建」，`gen-v2-image-1`(已生成图)→`gen-v2-video-mpyb7zg5-rmhu`(sora i2v) 连边，eval 看 `resolveReferenceSlots`/截图看槽。

---

## 2. 连线/参考：已做（5 切片，全在 main，最新 commit `babf9c9`）

每片逐次 fetch 对账（并行会话多次抢推 origin/main、零冲突）、五门全过、push。

| 切片 | commit | 内容 | 验证 |
|---|---|---|---|
| **S1** | `15207e4` | 建唯一读 `resolveReferenceSlots(target,nodes,edges)` → `src/workbench/generationCanvas/runner/referenceSlots.ts`。能力驱动（边按「源资产∩槽 accept」一对一落槽）+ 有序 fills（Kling image_ref[0]=首帧[1]=尾帧）+ pending 态（pending-generation/pending-extraction）+ origin 判别（边/上传）+ 旧 mode 迁移（first_frame→image_ref[0]）。抽 `referenceUrl.ts` 两处共用（P1）。 | 10 单测 |
| **S4** | `6364341` | `NodeParameterControls` 档案参考槽显示改用 `resolveReferenceSlots`（边+上传单源）→ **「连线没用」根治** | ✅ 真机（image→sora i2v 槽现显示缩略图，此前恒空） |
| **S7** | `703e3c9` | `graphOps.connectNodes` 去重键 (source,target)→(source,target,**mode**) → **「连不了第二种参考」修复** | 3 单测 |
| **S6a** | `678b58f` | `useDragToConnect` 松手命中改用 `document.elementFromPoint`→真实节点 DOM(`[data-node-id]`)，不再名义尺寸算 AABB → **「线连不上」R1 根治**。删 nodesRef/getNodeSize 命中依赖。 | ✅ 真机（节点真实高 227，85% 处旧 AABB miss、新命中 match:true） |
| **S2a** | `babf9c9` | `handleSlotAssignment` 连接分支删冗余快照 meta（firstFrameUrl/firstFrameRef/referenceImages…）→ 边即真相源、**灭 lost-update 竞态**。完整枚举所有读取方全边优先、快照纯 fallback+本函数必建边 → 行为保持（非用户可见变更）。 | 读取方枚举 + 1374 单测 |

**结论：用户报的两个症状都根治+验证+在 main；连接路径的隐性 lost-update 竞态也清了。**

---

## 3. 连线/参考：剩余（按约束分层，方案 §3 切片号）

### ⚠️ 硬卡在用户 vendor 额度（真·待办）
按项目铁律「接入即验证」必须真实生成 E2E 才算完成，要烧用户额度（用户独有资源、需点头）：

- **S3 生成单源**：把 `buildArchetypeInputParams` + `buildReferenceExtras`（`catalogTaskActions.ts:42-98`）改用 `resolveReferenceSlots`，**删** resolver 双投递（`generationReferenceResolver.ts` first_frame 同时 push referenceImages）+ 6 级 fallback（:99-141）+ 下游二次并集。**注意**：`resolveReferenceSlots` 已迁移感知，所以 S3 不依赖写收口先行（评审原担心的 S2→S3 顺序坑已被 S1 的迁移逻辑化解）。验证可先用单测断言「vendor params 对既有 case 不变」（param 等价），再真实生成 E2E。
- **S8 视频抽帧 relay 真实现**：`relayFromVideoUrl`（`generationReferenceResolver.ts:80`）零消费者、零抽帧 IPC——视频源接下一镜首帧产出被吞。不止血=真做主进程抽帧 IPC，接 `resolveReferenceSlots` 的 pending-extraction → 真实帧。需真实生成 E2E。

### 低优先 / 无 live bug（hygiene，可不急）
- **S2 余下**：`setSingleFrameUrlMeta`/`handleArray*`/`handleSourceVideoUpload` 统一到单一 `writeReferenceSlot`。这些是**上传路径**，本就该写 meta、`resolveReferenceSlots` 也读它，**非 live bug**（连接路径的竞态已被 S2a 灭）。
- **S5 对账/canGenerate 口径**：查清后**当前无 live bug**（`canRunGenerationNode` 已经 resolver 边优先看得到边）。纯 consolidation。

### 独立小项
- **S6b 框选矩形命中**：`selectNodesInRect`(`canvasNodeActions.ts:206`) 仍用名义 `getNodeSize` → 框选漏选高节点下半区（与 S6a 同族、但 rect∩ 不能用 elementFromPoint，需 `node.size` 回写真实渲染高=布局连带风险，慎做）。
- **S4b pending 占位态**：连了边但源未生成时槽显示「已连接·待生成」（`resolveReferenceSlots` 已返回 pending fills，S4a 先只显示 resolved）。是新视觉态 → **按 R8 先出 mockup 拍板**再实现。

---

## 4. 跨分类边可见性（只出样张 + 拍板，未实现）

**背景**：画布节点按分类分子画布视图（镜头→shots/角色→cast/场景→scene）。角色定妆卡被某镜头引用时，那条参考边两端跨分类 → 当前渲染按「两端都可见才画」过滤（`GenerationCanvas.tsx:55` 附近）→ 任一视图都看不见，但生成照常生效。做多镜头角色一致性时用户误删/漏挂。新触发器：`reassignNodeCategory`(`canvasNodeActions.ts:266`) 改分类不动边。

**已做**：3 个 token-only HTML 样张在 `docs/design/reviews/2026-06-14-cross-category-edge-{a-node-badge,b-reference-panel,c-cross-view-stub}.html`（commit `631caeb`）。设计师 agent 推 A、真实用户 agent 推 C。

**用户拍板**：
- **可视化 = A 节点徽标**（卡角「用于 3 镜头」徽标，复用结构化 `useNodeUsageCount`；反向「引用了 X」需补 `edge.source===nodeId` 小遍历）。
- **同期做删除确认守卫**：删被引用卡弹「主角·艾拉 正被 3 个镜头当角色参考用，删了脸会变，确定？」（复用 `confirmDialog`）——两位 agent 都强调这才是按住手滑的真正刹车。
- **硬约束**：表面文案一律人话，**禁「跨分类/引用/存根」黑话**（违 R2）。
- 落点：`BaseGenerationNode.tsx:593` header 区（注意与 §4.3 独立副本角标同抢右上角，设计师建议收口成统一 header 关系 rail）。

**下一步**：按 R4 写 `docs/plan` 再实现（多文件）。memory `ultra-deep-audit-2026-06-14B` 有这件事全部来龙去脉。

---

## 5. 关键文件锚点（连线/参考）

- 唯一读：`src/workbench/generationCanvas/runner/referenceSlots.ts`（`resolveReferenceSlots` + 类型）
- URL 助手共用：`src/workbench/generationCanvas/runner/referenceUrl.ts`
- 生成期老 resolver（S3 待收口）：`src/workbench/generationCanvas/runner/generationReferenceResolver.ts`
- 档案槽模型：`src/workbench/generationCanvas/nodes/controls/archetypeMeta.ts`（`currentArchetypeMode`/`buildArchetypeInputParams`/`referenceSlotStorage`/`ARRAY_SLOT_ROUTE`/`SINGLE_SLOT_META_KEY`）
- 档案类型：`src/config/modelArchetypes/types.ts`（`ArchetypeReferenceSlot`/`ArchetypeMode`）；注册表 `index.ts`
- 能力校验：`src/workbench/generationCanvas/agent/referenceEdgeCapability.ts`（`validateReferenceEdge`/`SLOT_ACCEPTS`/`archetypeForNode`/`referenceAssetKindForNode`）
- 参考槽 UI：`src/workbench/generationCanvas/nodes/NodeParameterControls.tsx`（6 个写入函数 + 槽值派生）
- 连边入口：`store/canvasGraphActions.ts`（connectToNode/connectNodes/mode 推断）、`model/graphOps.ts`（connectNodes 纯函数）、`nodes/completeNodeConnection.ts`、`components/useDragToConnect.ts`
- 生成提交：`runner/generationRunController.ts`（canRunGenerationNode:378）、`runner/catalogTaskActions.ts`（buildReferenceExtras:42）

## 6. 工作纪律提醒（别踩坑）
- **每片独立过五门**（check:filesize → lint:ci(≤98 warn) → typecheck → test → build）才 commit。BaseGenerationNode.tsx 是白名单巨壳（基线 935 行，只减不增——加一行要在别处省一行或同行合并）。
- **并行会话抢 main**：push 前必 `git -C <主工作树> fetch origin` 对账；只 `git add` 指名文件，别 `-A`。主工作树 `/Users/aoqimin/Desktop/Nomi` 在 main；并行 agent 在各自 worktree 推 origin/main。
- **真机验证**用常驻 UI 驱动；清场（quit Nomi + 杀 Electron/驱动）→ build → 起驱动。诊断埋点（暴露 store 等）用完**必还原、禁提交**（P1）。
- 用户可见改动先 mockup 拍板（R8）；架构改动先对抗评审（R7）。

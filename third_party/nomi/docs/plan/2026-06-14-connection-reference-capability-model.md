# 连线/参考系统重构 · 能力驱动的单一真相源

日期：2026-06-14
状态：方案 v2（已过对抗评审，含修正）→ 执行中
触发：用户报「图生成后连线没用 / 有些线连不上 / 整套喂参考问题多」，systematic-debugging Phase1 + 真机零额度复现钉死（见 memory `connection-reference-bugs-2026-06-14`）。

## 0. 核心原则（用户拍板）

**所有决策按长期价值，不做止血、不留并行版（P1）。** 不接受"让两份真相源凑得像"的补丁，只接受"塌成一份"的根治。

借鉴（R6）：ComfyUI 的 typed sockets / links——连线只表示"A 接到 B 的某个输入口"，口的类型/角色由节点声明、连线必须匹配。**我们对齐这个范式，但多一个 ComfyUI 没有的维度：节点输入口可以"无源上传"（拖文件进槽）。** 故统一在"读 + 写"两侧，而非只读侧。

## 1. 根因复述（真机实证 + 对抗评审补全）

现状不是"两套真相源"，是**多套写入 + 三种存储形态 + 多条读取口径**（对抗评审盘点）：
- **写入散**：`NodeParameterControls.tsx` 6 个写入函数（handleSlotAssignment/setSingleFrameUrlMeta/数组增删/上传/源视频），每个手工写 `slot.key + firstFrameUrl + firstFrameRef` 三键同步（:251-253/:264-266）→ lost-update 竞态。
- **存储散**：frame 槽 flat 键（firstFrameUrl/firstFrameRef）、array 槽数组键（referenceImageUrls）、snake 变体（first_frame_url）、第二 ref 别名（firstFrameReference）、`node.references[]`、`meta.upstreamResultUrls`、画布边、`collectNodeContext` 隐式注入的上游 result。
- **读取散**：`getSlotNodeRef`/`getSlotThumbUrl`（显示）、resolver 的 6 级 fallback（generationReferenceResolver.ts:126-141）、`buildReferenceExtras` 在 resolver **下游二次合并**（catalogTaskActions.ts:42-98）、`hasArchetypeArrayReferences`→canGenerate（generationRunController.ts:389-403）是**第二个"有没有参考"判定口径**。
- **显示/生成分裂**（真机实证）：frame 槽走边、array 槽 meta-only（archetypeMeta.ts:37/44），生成期被补丁合并边（:266），显示没跟上 → sora i2v 的 image_ref 数组槽显示恒空、生成实际有喂。

## 2. 目标架构（END STATE）

**一对读写函数 = 唯一真相源**，配对收口：

### 2.1 单一读：`resolveReferenceSlots(targetNode, nodes, edges)`
返回目标**当前模式每个声明槽**的解析结果，槽内**按位置有序**（保 Kling 首/尾帧语义）：
```
ResolvedSlot = {
  slotKind, label, accept, min, max, numbered,
  fills: Array<Fill>          // 定长 = slot.max，按位置；空位为 null
}
Fill = {
  position: number,
  url: string | null,
  status: 'resolved' | 'pending-generation' | 'pending-extraction',
  origin: { type: 'edge', sourceNodeId, semantic? } | { type: 'upload' },
}
```
- **status 必有**：连了边但源还没生成 = `pending-generation`（显示"已连接·待生成"占位，**不再显示为空 → 不再"连线没用"**）；视频源待抽帧 = `pending-extraction`（承载原 relayFromVideoUrl 语义）。扁平 `{url}` 不够，**必须 discriminated union**。
- **origin 判别**：边 vs 上传明确区分（S3 显示两种态）；`semantic` 承载 character/style/composition 这类**语义标签**（仅 agent/显示用，物理落同一 image 槽）。

### 2.2 单一写：`writeReferenceSlot(node, slotKind, position, value)` / `clearReferenceSlot(...)`
所有"挂参考"（连边 / 上传 / 改派 / 移除）经此一处，按 origin 路由到正确存储（边 or meta），**物理删除 6 个散写入函数各写三键的旧逻辑**（P1）。和 2.1 配对——只统一读不统一写 = 半个真相源（评审硬伤 B）。

### 2.3 四处共用 2.1
显示（NodeParameterControls）、生成（buildArchetypeInputParams + **buildReferenceExtras 一并收口**）、校验（连边总闸）、对账（reconcile **+ canGenerate 一并收口**）。删 resolver 6 级 fallback、`getEdgeSourceForSlot` 旧显示路径、双投递、`buildReferenceExtras` 二次并集。

### 2.4 边模型 + 迁移
`edge.mode` → `edge.slot`（= 目标声明的某槽 + 可选 position + 可选 semantic 标签）。**迁移用显式一对一映射表**（不是复用 `EDGE_MODE_SLOTS`——那是一对多 OR 校验语义，评审硬伤）：
- `first_frame`→首帧槽 / `last_frame`→尾帧槽 / `style_ref|character_ref|composition_ref`→image 槽（保 semantic 标签）。
- `reference`（通用，存量占比最高且最歧义）→**保守策略**：目标只有一个 accept 匹配槽则落它；多于一个则落"声明顺序第一个未满匹配槽"，不猜语义。
- 迁移在 2.1 读时惰性完成（不批量改盘），存量项目真机验证。

## 3. 切片（顺序已按评审修正：先正写入再删生成兜底，杜绝中间态破 i2v）

| # | 切片 | 不留并行版要点 | 验收 |
|---|---|---|---|
| **S1** | 单一读 `resolveReferenceSlots`（纯函数）+ **完整来源盘点冻结**（列 meta 允许键白名单）+ 一对一迁移表。先建、单测，暂不接线 | 建新真相源定义 | 单测覆盖 frame/array/多源有序/pending 两态/旧 6 mode 迁移/无源上传/隐式上游 result |
| **S2** | 单一写 `writeReferenceSlot` + 连边总闸下沉校验 + 按能力分配 slot/position；**物理删** 4 处 raw `connectNodes` 旁路 + 6 散写入 + image→video 写死 first_frame | 删 raw 旁路 + 6 散写入 | 单测：每入口过校验；多源/满槽行为（见 §4 拍板）；连不上有反馈 |
| **S3** | 生成期改用 S1：`buildArchetypeInputParams` + **`buildReferenceExtras`** 重写为 S1 适配器；**删**双投递（resolver:84-106）+ 下游二次并集 + 6 级 fallback | 删生成期所有兜底 | 既有 case 生成输出等价/更优；快照测；**此时存量 i2v 不断**（S2 已正写入） |
| **S4** | 显示改用 S1：frame+array 统一渲染，边/上传/pending 都看得见；**删** `getEdgeSourceForSlot` + archetypeModeArraySlots 的 meta-only 显示 | 删两套显示路径 | **R8**：复用既有 slot 缩略图=非新视觉(§9 Step2)；"已连接·待生成"占位态若属新视觉则出 mockup；design-fidelity + 真机「连了线槽里看得见」 |
| **S5** | 对账 + canGenerate 对齐 S1：判"生效/可生成"= 解析到槽且 url 可取或 pending | 删两个旧"有没有参考"口径 | 单测：源无产物/目标无槽的边报未生效 |
| **S6** | 节点尺寸单一真相源 + 连线命中用真实尺寸 | 删四份尺寸源 + 名义尺寸命中 | 真机：连线落卡片下半区能命中 |
| **S7** | 去重带 slot + 连不上反馈 | 去重键含 slot；命中失败/拒绝 toast | 同两点可连第二槽；连不上有提示 |
| **S8** | 视频抽帧 relay 真正实现（不止血）：主进程抽帧 IPC，接 pending-extraction → 真实帧 | 删死代码占位、接真实抽帧 | 真实生成 E2E（**烧额度，需用户放行**）|

## 4. 拍板项（按"长期价值"原则已定，可否决）

| # | 取舍 | 定（长期价值原则）| 理由 |
|---|---|---|---|
| D1 | max=N 槽满了再连 | **拒绝 + toast「该槽已满（最多 N），先移除一个」**；统一掉现 frame 槽的"静默自动替换"为这一种行为 | 可预测、不静默替换/截断（Design「creator control explicit / no silent drop」）；P1 一种行为不留两套 |
| D2 | 有序槽（Kling 首/尾帧 max=2）| **fills 定长位置数组**，保位置语义 | 无序集会丢首/尾帧确定性 = 功能回归 |
| D3 | style/character/composition 三类边 | **物理落同一 image 槽（无损）**，边保 semantic 标签供 agent/显示 | grep 实证：无 vendor mapping 单独消费这三类；character 编号是 slot.numbered 标志、非这三数组 |
| D4 | 切片顺序 | **S1→S2(写)→S3(生成)→S4(显示)→S5** | 评审硬伤：先删生成兜底(原 S2)再装正写入会在 main 上中途断 i2v |
| D5 | 无源上传 vs 边 | **存储仍两形态（边/meta），读写各收口一处**，fills 用 origin 判别 | 强建"半边"会让源节点不存在、删除级联/撤销补偿等不变量全破 |

## 5. 不动什么
- 不动 vendor mapping body（kie/apimart snake 键，档案供应商无关边界）。
- 不动节点卡片视觉、TitlePill、组框等无关 UI。
- 不动跨分类边可见性（另一条线，已出样张）——S1 为其"节点徽标"统计留接口。
- 不动 Scene3D / 导出 / 创作流式。

## 6. 回滚
每切片独立 commit、独立 revert。S1 纯新增（零风险，不接线）。S2-S5 是"改用新函数 + 删旧路径"，回归则 revert 该片。S6/S7/S8 独立。S8 最后、可单独不做。

## 7. 验收门
- 每片五门全过（filesize→lint→typecheck→test→build）。
- UI 片（S4/S6/S7）：design-fidelity 断言 + 真机截图人眼判断（R13）。
- 收尾：真机 J1（图→镜头连参考）+ J2（定妆链路多镜头引用）确认"连了看得见、生成真用到、连得上"。
- S8：真实生成 E2E（视频→下一镜首帧），需用户放行额度。

## 8. 评审遗留硬约束（必须执行时盯）
- S1 验收必须列"meta 允许参考键白名单"并在 S2/S3 物理删所有旧读写路径——否则 resolveReferenceSlots 沦为第 N 套（评审硬伤 A/B）。
- fills 必含 status（pending 两态），否则"连了线源没生成"又显示空。
- canGenerate（generationRunController.ts:402）与 buildReferenceExtras（catalogTaskActions.ts:42）必须随 S3/S5 一起收口，别漏。

# 2026-06-14 机制根因落地修复 · 执行文档

> 承接 `docs/audit/2026-06-14-deep-bottom-layer-test.md`。用户拍板：范围=机制根因+明显 bug（不含 A2 流程改造）；历史数据全保留、不防新增；五门过后 commit+push（不发版）。

## 0. 关键诚实结论：读真实代码后，8 项里 5 项不是「干净 bug」

落地前逐项读源码核对，发现原审计多为**一次性穿透的现象**，深入代码后多数已被处理或属有意设计——**只有 2 项是当前代码里真实存在、且为干净 bug 的**。不修「假 bug」，避免制造 churn（P1/P2 原则）。

| 审计项 | 读码结论 | 处置 |
|---|---|---|
| A1 离屏全模型测宽 A11y | 容器 `visibility:hidden`（规范：排除出 Tab 序、不可聚焦）+ `aria-hidden`（移出 AX 树）。无真实聚焦/读屏风险；DOM 量是有意设计且只挂在**当前选中的单节点**上。`NodeComposerWidthMeasurer.tsx:62-64` | **不改**（无 live 缺陷）|
| A3 镜号跳跃 | `shotNumbering.ts` 是**刻意契约**「编号=身份、删除留空号（如章节号）」，被 `projectCategoryMigration.test` 钉死。改它=违背有意设计+破测试。 | **不改**（by-design）|
| A5 分镜布局重叠/镜序 | `trajectoryLayout.ts` 已修（A3 根治：格高=批内最大节点高，**当前代码无批内重叠**）。我走查看到的重叠是**老项目的冻结旧数据**（用户选择不迁移）。当前生成路径正常。 | **仅评估防御性 sort**（见 §1.3）|
| A6 composer 顶裁 | 翻转启发式已取「空间更大的一侧」=最小化裁切；只有 composer 比上下两侧都高（低缩放/小窗）才裁，此时翻上本就是更优解。真修=视口 clamp 卡高，属调优组件重构、回归风险高。 | **暂缓**（非干净修）|
| D1 气泡格式钮重复 | 是合理的选区工具条（格式+生成，同 Notion/Medium）。删格式钮=砍掉有用的选区内格式化。「与固定栏重叠」仅选区贴编辑器顶时的边缘情形。 | **不改**（合理设计）|
| P2 导出禁用态光标 | `TimelinePreview.tsx:481` **已有** `disabled:cursor-not-allowed disabled:hover:...`，禁用态正确。Playwright 报错只是把 base+disabled 两套 class 都列了出来。 | **不改**（已正确）|
| **A4 新节点恒叠** | **真·live bug**：`getToolbarInsertionPosition`(`GenerationCanvas.tsx:664`) 用整数点等值「假避让」，几乎总返回中心点 basePosition→压住中心已有节点。手动建节点(生成图片/添加3D/图片/视频…)全中招，真机复现 3 次。 | **修**（§1.1）|
| **P1 "Text" 英文标签** | **真·cosmetic bug**：`TextDocumentNode.tsx:148` 全中文画布里硬编码英文 `Text` 作拖拽手柄标题。 | **修**（§1.2）|

## 1. 改动清单

### 1.1 A4 · 新节点落点真碰撞避让（核心）
- **根因**：`GenerationCanvas.tsx:664-671` 的 `occupied` 是「四舍五入整数点等值」集合，只在新点与某节点原点像素级相同才判冲突；错开 1px 或包围盒重叠都检测不到 → 几乎总返回中心 basePosition。
- **改法**：抽纯函数 `resolveInsertionPosition.ts`（新文件，可单测）——用**真实 AABB 包围盒**（节点 `size` 或 `DEFAULT_NODE_SIZE[kind]`）检测重叠，从 basePosition 起做**螺旋/向下步进找空位**（步距 derive 自节点尺寸，不 hardcode）。`GenerationCanvas.tsx` 仅瘦身为调用该 helper（净行数下降→同步下调 check-file-sizes 基线，锁瘦身战果 R12）。
- **不动**：viewport anchor (0.38×0.42) 起点策略、agent 批量路径（`trajectoryLayout` 已自管避让）。

### 1.2 P1 · 文本节点拖拽手柄标题 `Text` → `文本`
- `TextDocumentNode.tsx:148` 单行字面量替换。

### 1.3 A5 · 防御性按 shot.index 排序（仅当 test-safe）
- 实现时核对 `storyboardPlan.test.ts`：若加 `plan.shots` 排序不破现有断言、且属「防整类不复发」的廉价保险，则在 `storyboardPlanToCreateNodesArgs` 布局前 `sort((a,b)=>a.index-b.index)`；若改变既有期望或证明当前已有序，则放弃（不为假问题改）。

## 2. 不动什么
- 不碰项目库/创建逻辑（用户：历史全留、不防新增）。
- 不改 A2 创作→剧本片段流程（与已排期分镜方案重叠）。
- 不改 shotNumbering 契约、不改 composer 翻转启发式、不删气泡格式钮。

## 3. 回滚策略
- 全部为局部改动 + 1 个新纯函数文件；回滚 = `git revert` 单 commit。无数据迁移、无 schema 改动、无破坏性操作。

## 4. 验收门
1. 新增 `resolveInsertionPosition.test.ts` 覆盖：空画布、单节点正下方有占用、密集占用螺旋找空位、异尺寸节点 AABB。
2. 五门全过：`check:filesize`→`lint:ci`→`typecheck`→`test`→`build`。
3. R13 真机走查：连续添加 3 个节点，截图人眼确认**互不重叠**（A4 验收合同）；文本节点头显示「文本」（P1）。
4. 现象对账：与审计 F10 并排，确认新建节点不再压旧节点。

## 5. 执行结果（回填）
- **A4 落点避让**：抽出 `resolveInsertionPosition.ts`（纯函数，7 个单测）+ `GenerationCanvas.tsx`/`CanvasToolbar.tsx` 接线传 kind。复测踩到自身坑：名义高(image 280)<渲染高(340) → 残 12px 重叠；定位根因后给碰撞足迹统一外扩 `RENDER_SAFETY=64` 吸收增量。真机连加 4 节点（图片/视频/图片/3D）实测 **0 重叠**（之前恒叠中心）。GenerationCanvas 926→924 行，基线已下调。
- **P1 标签**：`TextDocumentNode.tsx` 头部 `Text`→`文本`，真机确认。
- **A5 防御排序**：`storyboardPlan.ts` 建节点前按 `shot.index` 排序，+1 单测（乱序入→镜序出）。
- **五门**：filesize ✓ / lint:ci exit0（85≤98，无新增）/ typecheck ✓ / test 1063 ✓ / build ✓。
- **未做（读码后判定非干净 bug，见 §0）**：A1/A3/A6/D1/P2。
- 已 commit+push（不发版，按用户拍板）。

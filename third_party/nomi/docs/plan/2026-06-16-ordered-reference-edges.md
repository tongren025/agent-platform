# 连线/边收口：有序参考边（order 字段）实现计划

> 主 spec：`docs/audit/2026-06-16-reference-split-and-apimart-params.md` §1a/§1d/「地基修法」。
> 隔离 worktree 实现，**不 push、不合并**。

**Goal：** 让数组参考（image_ref，characterIndexed，按序 character1..N）用**有序的画布边**表达，治三件事：①拖线到数组槽不画线（用户困惑）②显示(resolveReferenceSlots)与生成(buildArchetypeInputParams)真相源分裂 ③#4 整类不复发。

**根因（已钉死）：** `GenerationCanvasEdge` 无 order 字段 → N 条数组参考边无序 → 丢「谁是 character1」→ 历史只能存 meta（不画线）。

## 范围 / 不动项

**动：**
1. `GenerationCanvasEdge` 加 `order?: number`。
2. `connectNodes`(graphOps) 建边时赋递增 order（按该 target 现有边数）。
3. `completeNodeConnection` 删 meta-only 早退分支 + 权宜 toast，改建有序边。
4. `resolveReferenceSlots` / `resolveGenerationReferences` 落边前**按 order 排序** → 显示/生成顺序一致且稳定。
5. 旧项目 `meta.referenceImageUrls`（有序）→ 加载时按序建有序边（URL 反查得到源节点的才建，查不到保留 meta 兼容）。
6. `reconcile.ts` 断言「显示出的每个 edge-origin 数组参考都有对应已提交边」。

**不动：**
- 首/尾帧单帧槽边语义（已建边、已有位置偏好，order 只是额外稳定排序键，不改其 position 逻辑）。
- combineSlotsInto（首尾帧 image_with_roles）、各 vendor mapping body。
- `createEdgeId`（仍 `edge-source-target`；本改动只新增不同源→同 target 的边，id 天然不撞；同源同 target 不同 mode 的 id 撞是既有 latent 问题，不在本范围扩大）。
- archetypeMeta 供应商无关性：buildArchetypeInputParams **不**直接吃 nodes/edges，仍只吃 references.referenceImages（已被上游按 order 排好）。

## 回滚

单 commit 即可 `git revert`。order 是 optional 字段，旧快照/旧测试无 order 仍合法（排序退化为稳定保持原数组序 = 现行为）。

## 验收门

五门全过：filesize / tokens / lint:ci / typecheck / test / build。
新增单测：①数组槽连 N 图→image_urls 按 order ②拖线到数组槽→建边带 order、不写 meta-only、不弹 toast ③旧 meta 迁移成有序边 ④order 递增/去重。

## ★最高风险铁律

**绝不弄坏现有数组参考生成**：Seedance omni(reference_image_urls)、可灵 i2v(image_urls)、Seedance i2v 必须照样按序塞 image_urls。`catalogTaskActions.test.ts` 的「接入即验证」遍历全档案×全模式，是结构防线——必须保持全绿。

## 实现单元（一个连贯 commit）

### T1 — 边加 order 字段 + connectNodes 赋值
- Modify `model/generationCanvasTypes.ts`：`GenerationCanvasEdge` 加 `order?: number`。
- Modify `model/graphOps.ts connectNodes`：建新边时 `order = edges.filter(e => e.target === target).length`（该 target 已有边数 = 下一个序号；保住放入顺序）。
- 单测 `graphOps.connectDedup.test.ts` 补：连两不同源→同 target → order 0,1。

### T2 — resolveReferenceSlots / resolveGenerationReferences 按 order 排序
- Modify `referenceSlots.ts`：遍历 edges 前 `const ordered = [...edges].sort(byTargetOrder)`；落槽用 ordered。
- Modify `generationReferenceResolver.ts`：同样按 order 遍历。
- 共享排序助手放 graphOps（`sortEdgesByOrder`），单源。
- 现有测试不传 order → 排序稳定（undefined order 视作大值或保持原序），断言不变。

### T3 — completeNodeConnection 改建有序边
- Modify `completeNodeConnection.ts`：删数组槽 meta-only 分支（含 toast「已作为参考图添加」）；直接走 `connectToNode`。
- Modify 测试 `completeNodeConnection.test.ts`：omni target 改断言「建边带 order、不写 referenceImageUrls」。

### T4 — 迁移旧 meta.referenceImageUrls → 有序边
- Modify `projectV51ToV60Migration.ts`：对每个有 `meta.referenceImageUrls` 的节点，按序对每个 URL 反查 source 节点（按 result URL 匹配）；查到 → 建 character_ref 边（order 递增）+ 从 meta 删该 URL；查不到 → 留 meta。
- 单测：源在画布 → 建边按序 + meta 清；源不在 → 留 meta。

### T5 — reconcile 断言 edge-origin 有真实边
- Modify `reconcile.ts`：新增「displayed array refs 的 edge-origin 必有对应边」检查（可选入参，避免破坏纯函数签名）。
- 单测：有 edge-origin fill 但无边 → deviation。

### T6 — 五门 + 报告

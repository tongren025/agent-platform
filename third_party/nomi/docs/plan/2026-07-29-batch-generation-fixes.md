# 批量生成体检 → 三件修复 — 方案（2026-07-29）

## 体检结论（实测证据）

批量机制本身完好：多选浮条「生成 N 个」→ 一次轻确认 → 依赖波次 + 波内并发 6 → 失败隔离。
换健康模型后 3 节点 8 秒 3/3 出图（`scripts/batch-generate-walkthrough.mjs`，截图 `.batch-walk/`）。

用户体感「不能批量产出」的三层原因：
1. **真雷（根因层）**：新建节点默认模型 = 目录第一个带档案的文生模型（`nodeModelArchetype.chooseDefaultModelOption`），无健康信号。当前该位是 apimart Imagen 4，其上游 Google 404（直连探针实证：提交成功→9 秒 task_failed，同 key z-image 6 秒出图）→ 不手动换模型则单发/批量 100% 死。
2. **善后缺口**：批量失败只有逐卡重试，无「失败的全部重试」。
3. **入口缺口**：拆镜头落完 N 个分镜无「全部生成」指引（唯一入口=手动框选）。
另：无「同镜 ×N 变体挑一张」（用户拍板：要，先样张）。

## 拍板（2026-07-29 AskUser）

A=失败记忆自动避让（根治）；B=失败批量重试 + 拆镜头后全部生成；C=变体×N（先样张再实现）。B/C 属用户可见 → R8 样张拍板后动工；A 无新 UI 直接做。

## A：失败记忆自动避让（本文档先做这件）

**机制**：`src/workbench/generationCanvas/runner/modelHealthMemory.ts`
- localStorage `nomi:model-health:v1`：`{ [modelKey]: { fails, lastFailAt } }`。
- `recordModelFailure/ recordModelSuccess`（成功清零）挂在唯一提交咽喉 `runGenerationNode` 的结果分叉（可找回超时不算失败——上游可能仍出片）。
- `isModelRecentlyAiling(modelKey)`：连败 ≥ 2 且 24h 内。
- `chooseDefaultModelOption` 只在**自动选默认**时跳过 ailing 模型；全 ailing → 回退原序（绝不空选）；**用户手动选择永不拦、不弹警告**（选择权完整）。
- 衰减：24h 后视为过期不再避让（上游修好自然回流，无需手动洗白）。

**不动项**：mapping/catalog/主进程零改动；ModeBar/参数面板 UI 零改动。
**回滚**：revert 即回原行为；localStorage 键残留无害。
**验收**：单测（记账/清零/过期/跳过/全病回退）+ 五门 + 批量走查复跑（不停用 imagen，两次失败后新节点默认应自动落到健康模型）。

## B/C：样张拍板后另行实现（本文档只记范围）

- B1 失败汇总 toast 追加动作「重试失败的 N 个」：复用 buildDependencyWaves(failureIds) → confirmAndRunPlan（新确认新令牌，不绕付费闸）。
- B2 拆镜头落画布完成 → 自动 selectNodes(落地镜头) → 既有浮条自然浮现（零新组件）。
- C composer 生成钮挂 ×1/×2/×4：N 次同参提交（一次确认 N 张成本口径），产物走既有节点堆叠。

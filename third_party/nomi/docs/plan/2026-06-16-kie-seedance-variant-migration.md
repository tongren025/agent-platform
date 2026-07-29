# KIE Seedance 标准/Fast → 变体轴（消并行版 P1）

> 2026-06-16。把 KIE Seedance 内部「标准 + Fast」两份独立 archetype/catalog 行，收成 1 份 archetype + `variants` 轴 + 1 catalog 行——与 apimart Seedance（已做，5a110b1 前）+ 本轮 Sora/Veo/Hailuo/Qwen 同一套机制。**不跨 vendor 合并**（KIE Seedance 与 apimart Seedance 仍是两份独立档案）。

## 现状（并行版）

| 层 | 标准 | Fast |
|---|---|---|
| archetype | `SEEDANCE_2_ARCHETYPE` | `SEEDANCE_2_FAST_ARCHETYPE` = `{...标准}` 整份复制，只 480/720 |
| catalog 行 | `SEEDANCE_2_MODEL_SEED` | `SEEDANCE_2_FAST_MODEL_SEED` |
| body model | `{{model.modelKey}}` | 同左（共用 1 条 mapping）|

痛点：加 Seedance 能力要改两处，漏一处即漂（P1 并行版）。

## 范围（改 4 文件 + 测试）

1. **`src/config/modelArchetypes/seedance.ts`**：删 `SEEDANCE_2_FAST_ARCHETYPE`；`withFastResolution`/`FAST_RES` 从档案级复制改成变体级 `FAST_OVERRIDES`（按 modeId 收窄 resolution→480/720，仿 seedanceApimart）。给 `SEEDANCE_2_ARCHETYPE` 加 `variants:[标准, 快速]` + `defaultVariantId:"standard"`；`identifierPatterns` 补 fast 全形（旧 fast 节点要能解析到本档案才触发迁移）。
2. **`src/config/modelArchetypes/index.ts`**：删 `SEEDANCE_2_FAST_ARCHETYPE` 的 import + `MODEL_ARCHETYPES` 数组项。
3. **`electron/catalog/kieSeedance.ts`**：删 `SEEDANCE_2_FAST_MODEL_SEED`；`SEEDANCE_2_CREATE_OP` body `model:"{{model.modelKey}}"` → `"{{request.params.model}}"`（读档案当前变体 modelKey）。
4. **`electron/catalog/seedBuiltins.ts`**：删 `SEEDANCE_2_FAST_MODEL_SEED` import + KIE_CURATED_MODELS 那行；加 `RETIRED_KIE_VIDEO_MODEL_KEYS=["bytedance/seedance-2-fast"]` + prune（老装机孤儿 catalog 行删掉，picker 收成 1 项）。**无孤儿 mapping**（标准/fast 共用 SEEDANCE_MAPPING_ID，body 改动由 reconcileMappings 的 create drift 自愈）。
5. **测试**：index.test.ts / catalogTaskActions.test.ts / seedBuiltins.test.ts 里断言「两份 archetype / seedance-2-fast 行」的，改成「1 份 + 2 变体」。

## 不动什么

- KIE Seedance 的 modes（first/firstlast/omni）、参考槽、mapping 数量、轮询/状态——全不变。
- apimart Seedance（另一份档案）不碰。

## 迁移层（不让老项目坏）

旧节点 `meta.modelKey="bytedance/seedance-2-fast"` → `resolveArchetypeForModel` 命中 base（靠补的 identifierPatterns）→ `normalizeArchetypeVariantMeta` 按 `variant.modelKey` 匹配 → 折叠成 `modelKey="bytedance/seedance-2"` + `variantId="fast"`。标准节点 modelKey=base → no-op（variantId 默认 standard）。机制现成，apimart 迁移已验证。

## 验收门

- 五门绿；新增/改单测：迁移幂等（standard no-op / fast 归一）+ 变体 model 串（标准发 bytedance/seedance-2、快速发 -fast）。
- 真机：打开旧 Fast 项目模型不丢、落到「快速」变体；picker Seedance 只 1 项 + 底栏变体下拉。
- 可选真实 E2E：apimart-params.e2e 加 kie 一条（fast 出片）。

## 回滚

单 commit，`git revert` 即回到两份并行（迁移层 normalizeArchetypeVariantMeta 对无 variants 档案 no-op，回滚安全）。

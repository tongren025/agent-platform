# 执行计划：增量拆分 `electron/runtime.ts`（strangler，非大爆炸）

> 触发：v0.9.1 全量体检把 runtime.ts(3150 行) 列为 P0 巨壳（CTO+后端命中）；用户拍板"启动"。
> 关联：`docs/audit/2026-05-30-B1-decision-runtime-split.md`（B1 决策）、
> `docs/audit/2026-06-04-full-codebase-review-6role.md`（体检）。

## 0. 先正视 B1 决策文档的结论（不绕过）

2026-05-30 的 B1 决策文档（runtime.ts 当时 2687 行）明确：**完整大爆炸式拆分（方案 D）
是过早优化，不做**，除非满足触发条件之一：① 2+ 贡献者；② **突破 4500 行**；③ 出现因文件
太大才没发现的真实 bug。它推荐方案 C（只拆 catalog）/ B（strangler，改到哪拆哪）/ F（导航注释）。
最大风险点：**无单元测试，回归只能靠跑 App 发现。**

现状：runtime.ts = 3150 行，**仍未到 4500**。所以本计划**不做大爆炸 D**。

### 为什么现在仍然启动（与 B1 不矛盾）
1. **方法是 B1 推荐的 strangler（方案 B）**，不是它反对的 D。每步一个高内聚单元，独立 commit、可 bisect。
2. **新增了文件体积棘轮门岗（规则 12）**：runtime.ts 是头号债，门岗保证它**只减不增**；每拆一刀就把基线下调锁定，方向单调。
3. **把"无测试"这个最大风险反向解决**：strangler 的每一步都是"抽出纯逻辑 → 补 characterization 测试 → 验证"。拆到哪，测试覆盖到哪。这正是 B1 列为好处的"每个模块可单独写单测"。

## 1. 目标模块图（runtime.ts 现状 → 目标）

runtime.ts 的 8 个领域（按现有行号聚类）：

| 领域 | 现行号 | 目标文件 | 风险 | 测试价值 |
|---|---|---|---|---|
| 纯工具（trim/firstString/isJsonRecord/readNestedRecord/nowIso） | 散落 | `electron/jsonUtils.ts` | 极低 | 中 |
| 厂商响应解析（pathValues/firstMappedString/collectAssetUrls/taskStatusFromResponse…） | 2418-2523 | `electron/tasks/responseParsing.ts` | 低（纯函数） | **高**（解析任意厂商 JSON，最易出 bug） |
| 资产路径/MIME 纯helper（extension*/contentType*/assetKind/stableAssetId/localAssetUrl） | 1939-2008 | `electron/assets/assetPaths.ts` | 低 | 中 |
| catalog 加密（safeStorage/makeApiKeyRecord/decrypt） | 1226-1262 | `electron/catalog/secrets.ts` | 中 | 中 |
| catalog 读写+迁移 | 1029-1216 | `electron/catalog/store.ts` + `migrate.ts` | 中 | 中-高 |
| catalog CRUD + 导入导出 + 文档抓取 | 1286-1937 | `electron/catalog/repository.ts` + `portable.ts` | 中-高（中心、被 main.ts 大量引用） | 中 |
| 资产 IO（writeAsset/import*/listProjectAssets） | 2009-2160 | `electron/assets/repository.ts` | 中 | 中 |
| 任务执行编排（runTask/fetchTaskResult/provider 调用） | 2161-2758 | `electron/tasks/runner.ts` | 高（含网络副作用、S2 裸 fetch） | 中 |
| projects 存储 | 489-640 | `electron/projects/repository.ts` | 中 | 中 |
| export 编排 | 641-1027 | `electron/export/orchestrator.ts` | 中-高 | 中 |
| agent chat | 2759-3150 | `electron/agent/chat.ts` | 高（session 状态） | 低 |

runtime.ts 最终退化为薄装配/re-export 层，main.ts 的 import 列表自然瘦身。

## 2. 提取顺序（最安全、最可测的先；中心/有副作用的后）

1. **jsonUtils**（纯工具，地基）← 本次起步
2. **tasks/responseParsing**（纯函数，最高测试价值，建立在 jsonUtils 上）
3. **assets/assetPaths**（纯 helper）
4. **catalog/secrets**（加密，自包含，便于安全审计）
5. catalog/store + migrate
6. catalog/repository + portable（中心，谨慎；到此可对 main.ts 引用面做一次确认）
7. assets/repository
8. projects/repository、export/orchestrator
9. tasks/runner（含 S2 裸 fetch —— 提取时一并评估收口，但 SSRF 策略仍需用户拍板，见体检文档）
10. agent/chat（最后，session 状态最绕）

> 顺序可随过程调整；每到"中心/有副作用"模块前，重新评估、必要时拉角色 agent（规则 9）。

## 3. 每步执行协议（铁律）

1. 新建目标文件，移入该单元的函数 + 其专属类型。
2. runtime.ts 改为 `import` 回这些符号（保留所有内部调用者可用），删除原定义——**净减行数**。
3. 对外公共导出（main.ts 消费的）签名**不变**；必要时 runtime.ts re-export 维持兼容。
4. **补 characterization 测试**：覆盖该单元的关键分支（尤其解析/迁移/边界）。
5. 过验证门：`pnpm run check:filesize`（runtime.ts 必须变小）+ `pnpm run lint`（0 error）+ `pnpm build`（vite+tsc）+ `npx vitest run`（不回归）。
6. **把 `scripts/check-file-sizes.mjs` 里 runtime.ts 的基线下调到新行数**，锁定战果（规则 12）。
7. 一个模块一个 commit，message 写清搬了什么 + 验证结果。

## 4. 不动什么
- 任何对外行为 / IPC 通道签名 / main.ts 消费的导出签名。
- catalog 数据格式与迁移逻辑（只搬位置，不改语义）。
- tasks/runner 的网络行为（S2 SSRF 收口策略需用户拍板，提取时不顺手改行为）。

## 5. 回滚策略
每步独立 commit，验证门全绿才提交。任一步出问题 → `git revert` 该 commit，不影响其它步。无大爆炸 PR，天然可 bisect。

## 6. 验收门（每步 + 总）
- 每步：filesize（runtime 变小）、lint 0 error、build 绿、test 不回归、新模块有测试。
- 总目标：runtime.ts 退出文件体积白名单（< 800 行）或显著下降；catalog/tasks/assets 子系统与 `ai/onboarding`、`export/`、`workspace/` 的模块化风格对齐。

## 7. 进度
| 步 | 模块 | 状态 | commit | runtime.ts |
|---|---|---|---|---|
| 1 | jsonUtils（trim/firstString/isJsonRecord/readNestedRecord/nowIso + JsonRecord） | ✅ | `3fbd258` | 3150 → 3125 |
| 2 | tasks/responseParsing（pathValues/collectAssetUrls/taskStatusFromResponse 等 8 个） | ✅ | `1cb9e28` | 3125 → 3030 |
| 3 | assets/assetPaths（extensionFromMime/contentTypeFromPath/stableAssetId 等 7 个纯 helper） | ✅ | `d71c088` | 3030 → 2984 |
| 4 | catalog/secrets（ApiKeyRecord + safeStorage 加密/解密） | ✅ | 见下 | 2984 → 2933 |

| 5 | runtimePaths（基础设施地基：路径/目录/JSON 读 + getWorkspaceRepositoryDeps；并消除 writeJson 并行实现，改用 jsonFile.writeJsonFileAtomic） | ✅ | 见下 | 2933 → 2891 |
| 6 | projects/repository（项目存储 CRUD + ProjectRecord；删死代码 uniqueDir/toSummary；公共 API 从 runtime re-export 保持 main.ts 不变） | ✅ | 见下 | 2891 → 2737 |
| 7 | assets/repository（资产写盘/导入/列表，有 runtime.assets 测试网）→ 接下来 | — | — | — |

**进度：runtime.ts 3150 → 2737（-413 行，-13%）。** 第 5 步"基础设施层"解开了循环依赖，第 6 步 projects
顺势抽出（依赖 runtimePaths/workspace，不反向依赖 runtime）。projects 公共 API（main.ts 消费的 6 个）
从 runtime re-export，main.ts 零改动；现有 runtime.workspace-projects 测试经 re-export 仍覆盖（安全网）。
继续按依赖序：assets → catalog → tasks → export → agent。

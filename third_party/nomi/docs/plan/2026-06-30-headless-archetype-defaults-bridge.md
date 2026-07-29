# 计划：把档案默认参数桥接到 electron（根治 headless/MCP 缺参类）

状态：**已实现并真机验证（2026-06-30）**。采用方案 A（codegen），但比原设计多一层 **vendor 分桶**（vendorParams 覆盖：apimart Kling duration=number vs kie=string，不串台）。生成文件按 `{archetypeId:{taskKind:{"*"|vendorKey:{param:default}}}}`，runtime 取 `perKind[vendorKey] ?? perKind["*"]`。真机验证：sora/veo/seedance/hailuo/wan/omni/kling 视频 + 火山 seedream size + 豆包 voice + apimart audio model 全部不再缺参 400（kling 推进到 queued=不再 400、仅渲染慢；火山 seedance/豆包语音推进到「账号未开通/凭证格式」= 用户配置项，非代码）。删除本轮手写的 3 个 defaultParams（已被生成覆盖，回到单一真相源）。同步门 check:archetype-defaults 进 gates。
关联：`docs/audit/2026-06-30-onboarding-sweep.md`（接入测试扫描，挖出此类）。

## 1. 问题（一句话+底层逻辑）

**用户那一刻卡在哪**：用 Claude Code / MCP 驱动 Nomi 生成**视频**时，vendor 直接拒（apimart「Model name is required」、火山「missing model」、duration「string≠int」）。

**底层逻辑**：参数有两套来源——
- **UI 路**：`NodeGenerationComposer` 读档案（`src/config/modelArchetypes`）的 `param.defaultValue`，填进 `request.params`（model 变体 / duration / 清晰度 / 比例…）。
- **headless/MCP 路**：`generate` 不经 UI，`nomi_generate` 也不暴露 params → `request.params` 是空的 → 缺必填参 vendor 拒。

本轮已用「mapping 逐 op `defaultParams`」修了 image/audio 三个点（火山 size / apimart model / 豆包 voice），但**视频铺得太广**：每个视频档案各有 model 变体 + duration + 清晰度，逐 op 复刻=复制档案值=两份真相源、易漂移（违 P1）。**根因是「档案默认参数 electron 读不到」**，该一次性桥接，而非逐 op 打补丁。

**为什么 electron 读不到**：`electron/tsconfig.json` `rootDir: "."`（electron/），import `../src/config/*` 会「不在 rootDir 下」编译失败；改 rootDir 会动 `dist-electron/` 产物路径、连带 host.js 路径，风险大。

## 2. 不动项（non-goals）
- **UI 路零改动**：UI 已填好参数，桥接只在 headless（`request.params` 缺值时）兜底，既有值优先。
- 不碰付费闸 / 不碰档案的 UI 控件渲染 / 不改 vendor wire 契约。
- 不解决「用户配置缺口」（kie/runninghub key、火山开通、即梦 VIP）——那批用户已拍「留着别动」。

## 3. 方案对比（取舍点：单一真相源 vs 改动面）

| 方案 | 做法 | 用户/系统看到 | 代价 |
|---|---|---|---|
| **A 代码生成（推荐）** | 一个脚本（tsx，跑在 electron 编译外、可 import src/config）从 `MODEL_ARCHETYPES` 抽 `{modelKey→{taskKind→{param:defaultValue}}}` 写成 `electron/catalog/archetypeWireDefaults.generated.ts`；electron import 它，runtime 按 (modelKey, taskKind) 取默认并入 `request.extras` 之下（复用已写的 `applyWireDefaults`）。加 `check:archetype-defaults` 门：重生成+diff，不同步即红 | headless 视频/图/音频全部能成；档案改默认→重生成→headless 自动跟上 | 多一个 codegen 脚本 + 生成文件 + 一道同步门 |
| B 共享编译 | 改 electron tsconfig 把纯档案子树纳入编译（project reference / 调 rootDir） | 直接 import，永远同步 | 动 `dist-electron/` 产物路径→host.js 路径连带改；把 renderer 文件拉进 electron 编译，transitive 纯度要守 |
| C 档案搬到 shared/ | 把 archetypes 挪到顶层 shared 目录两边都 import | 单一家最干净 | 大搬迁，renderer 侧海量 import 路径改，回归面大 |

**推荐 A**：blast radius 最小、electron 保持隔离、单一真相源（档案）由同步门强制。生成文件是纯数据，runtime 合并复用现成 `applyWireDefaults`（已单测）。

## 4. A 方案设计细节

1. **抽取脚本** `scripts/gen-archetype-wire-defaults.ts`：import `MODEL_ARCHETYPES` + 种子模型清单 → 对每个模型 `resolveArchetypeForModel` → 对每个 mode 收 `params` 里有 `defaultValue` 的 → emit `{ [modelKey]: { [taskKind]: { [paramKey]: defaultValue } } }`。**值保留原始类型**（duration 是 number → 见下）。
2. **生成文件** `electron/catalog/archetypeWireDefaults.generated.ts`：`export const ARCHETYPE_WIRE_DEFAULTS: Record<string, Record<string, Record<string, unknown>>> = {…}`。落在 electron/ 下（不破 rootDir）。
3. **runtime 应用**：`runTask` 解析出 modelKey+kind 后，`request.extras = applyWireDefaults(request.extras, ARCHETYPE_WIRE_DEFAULTS[modelKey]?.[kind])`。**替换**本轮手加的 3 个 op `defaultParams`（它们改由生成数据覆盖→删手写=回到单一真相源）。
4. **duration=int 顺带解决**：档案 duration `defaultValue: 5`（number）；`renderTemplateString` 对纯 `"{{request.params.duration}}"` 占位**返回原始类型**（requestPipeline.ts:43/83 实查）→ body 得 int，apimart 不再 unmarshal 报错。无需单独处理类型。
5. **同步门** `scripts/check-archetype-defaults.mjs`：重跑抽取→与已提交生成文件 diff，不一致即红（仿现有 codegen 门）。进 `gates`。

## 5. 影响文件
- 新增：`scripts/gen-archetype-wire-defaults.ts`、`electron/catalog/archetypeWireDefaults.generated.ts`、`scripts/check-archetype-defaults.mjs`
- 改：`electron/runtime.ts`（一行换数据源，净零行——替换现有 defaultParams 取值）、`package.json`（gen + check 脚本）、`electron/catalog/{volcengineImages,apimartAudios,volcengineAudios}.ts`（删手写 defaultParams，改由生成覆盖）

## 6. 回滚
生成文件 + runtime 一行是闭环；回滚=删生成文件 import、恢复 3 个手写 `defaultParams`。无数据迁移、无 vendor 契约改动。

## 7. 验收门（P3：全绿≠完成）
1. 五门全过 + 新同步门绿。
2. **live 真跑**（app 关闭 headless）：Pass 2 的 8 个已接入视频（apimart sora/veo/kling/seedance/wan/hailuo/omni + 火山 seedance）逐个**真出视频**（花额度，已授权）；逐项贴结果。
3. 回归：image/audio 三修仍成（防 defaultParams 数据源切换回归）。

## 8. 六角色速审（R7）
- **CTO**：单一真相源 + 隔离不破 + 同步门防漂移，符合 P1/P4。✅
- **前端**：UI 路零触碰（既有值优先），无回归面。✅
- **后端/runtime**：runtime 净零行、复用 applyWireDefaults，巨壳门不破。✅
- **PM**：修的是 MCP 视频这条真实但小众的路；UI 视频本就正常，优先级中。可接受先做（根治成本不高）。✅
- **设计**：不涉 UI。—
- **真实用户（MCP 驱动者）**：「我没填参数它也能生成视频」= effect-first，符合 D1。✅

## 9. 待确认
- 默认变体取值：VARIANT_MODEL_REF 模型（sora/veo/seedance/hailuo）取档案**默认 mode 的默认变体 modelKey**。需确认「headless 不选变体时用默认变体」可接受（应可——同 UI 初始态）。

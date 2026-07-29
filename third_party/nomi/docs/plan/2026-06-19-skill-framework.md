# 技能库通用接入框架（#4-c）

> 2026-06-19 · 状态：设计待拍板（R6 摸了 Nomi 现有技能 + 对标模型接入范式）
> 用户拍板方向：别抄 Nody 技能清单，做「**技能通用接入框架**」——加技能 = 加声明,不写 UI（P4）。

## 0. 现状（R6）

Nomi 现有画布技能在 [NodeImageEditToolbar.tsx](src/workbench/generationCanvas/nodes/NodeImageEditToolbar.tsx)：**定妆 / 裁剪 / 切图(2×2·3×3) / 变换(旋转·翻转) / 下载**。
两个问题：
1. **硬编码**——每个技能一个 bespoke 按钮 + handler（[useNodeImageEditing.ts](src/workbench/generationCanvas/nodes/useNodeImageEditing.ts)）。加技能 = 改工具条代码。
2. **只有本地算子**（crop/slice/transform 在浏览器 canvas 跑），**没有模型类技能**（抠图/扩图/局部重绘/放大,要调模型）。

## 1. 核心洞察：技能 = 模型接入的「另一半」

Nomi 已经有三块**各自分开**的能力,技能框架把它们**统一**起来：
| 已有 | 在哪 |
|---|---|
| 本地图像算子（裁剪/切图/变换）| useNodeImageEditing |
| 模型生成（文生图/改图…）| catalog/mapping（apimart/kie/魔搭/火山）|
| 参数 UI 派生 | parameterControlModel / archetype（分镜参数刚复用过）|

**技能 = 把「输入(节点/选区/图) → 操作(本地算子 或 调模型) → 参数 → 输出(新节点/替换)」声明成一份描述符**,通用系统负责渲染 + 执行。和「模型接入 = 加映射」完全同构。

## 2. 抽象：技能描述符（声明式，单一真相源）

```ts
type SkillDescriptor = {
  id: string                          // 'crop' | 'slice' | 'remove-bg' | 'upscale' | ...
  label: string; icon: IconName       // 工具条展示
  group: 'edit' | 'generate' | 'export'
  input: SkillInput                   // 'image' | 'image+region' | 'image+mask' | 'multi-image'
  params?: ModelParameterControl[]    // 复用现有控件派生（分镜参数同一套）
  operation:
    | { kind: 'local'; run: (input, params) => Promise<Output> }      // 浏览器 canvas 算子
    | { kind: 'model'; taskKind: ProfileKind; modelHint?: string }    // 调 catalog（复用映射系统）
  output: 'new-node' | 'replace' | 'grid'  // 落画布方式
}
```

- **本地技能**（裁剪/切图/变换/下载）：`operation.kind='local'`,run 跑现有 canvas 逻辑。
- **模型技能**（抠图/扩图/局部重绘/放大）：`operation.kind='model'`,通用 runner 把输入图 + 参数喂给 catalog 的对应 taskKind mapping（复用 apimart/魔搭/火山… 任意已接模型,**不为技能单独接模型** P4）。
- 参数 UI：从 `params` derive（**复用 parameterControlModel**,和分镜参数同一套,不另写）。

## 3. 框架三件

1. **技能注册表** `skillRegistry`：所有 SkillDescriptor 单源（像 MODEL_ARCHETYPES）。
2. **通用工具条** `NodeSkillToolbar`：从 registry 渲染（替换硬编码 NodeImageEditToolbar；旧的删 P1）。按 input 适配性过滤（图片节点显图片技能）。
3. **通用 runner** `runSkill(descriptor, node, params)`：收集输入(节点图/选区/mask) → local 直跑 / model 走 catalog → 输出落画布(复用 canvasNodeActions 的 addNode/replace)。

## 4. 落地分批（每批真机验，接入即验证）

- **S1 框架 + 现有技能迁移**：建 descriptor 类型 + registry + 通用工具条 + runner;把现有 5 个技能改成 descriptor（**行为不变**,纯重构,旧硬编码删）。门槛：现有技能真机走查一字不差。
- **S2 第一个模型技能**：接 1 个高价值模型技能验证「model 类技能」通路——**抠图(remove-bg)** 或 **放大(upscale)**（看哪个有现成模型/能力）。真实出图验证。
- **S3 扩**：局部重绘(需 mask 输入)/扩图(outpaint) 等,按需加 descriptor。

## 4'. 技能可分享/导入（Flova/MiniMax 信号 → 强化设计）

业界（Flova 分享技能 / MiniMax Hub / Nody）的"技能"都是**声明式、可分享的单元**,不是写死的功能。因
SkillDescriptor = **纯数据**（本地算子的 run 是少数例外,见下），它天然可**导出/导入/分享** —— 完全复用
Nomi 模型目录已有的 `exportPackage/importPackage` 范式（catalogStore）。

- **模型类技能**（descriptor 全是数据:input/params/taskKind/output）→ 直接可分享,粘一份 JSON 就接入。
- **本地算子技能**（裁剪/切图含 `run` 函数）→ 内置那批不分享;用户/社区分享的技能**限定为 model 类 + 声明式参数**（安全:不执行外部代码,只声明"调哪个 taskKind + 什么参数 + 怎么落画布"）。
- 这条让"加技能=加一份声明"升级成"**贴一份技能 JSON 就接入**",对齐 Flova 的分享心智,也守住安全（不跑外部代码）。

> ⚠️ 协同提醒：用户提到「另一个 Claude(萌萌)正在做技能」。**本框架是技能的架构骨架** —— 任何在做的技能都应
> 落成 SkillDescriptor 插进这套 registry/runner,**别另起一套并行的技能系统**(P1)。两边先对齐这份方案。

## 5. 不动什么
- 不为技能单独接模型（复用 catalog,P1/P4）；不另写参数 UI（复用 parameterControlModel）；不动 canvas 节点/边系统（复用 addNode）。
- 本地算子逻辑（cropImageRegion 等）保留,只是从硬编码 handler 挪进 descriptor.run。

## 6. 回滚
S1 是重构（旧工具条 → registry 驱动），行为等价可回退；S2+ 是增量描述符,删 descriptor 即回退。

## 7. 验收门
1. 五门全过。
2. S1：现有技能（定妆/裁剪/切图/变换/下载）真机逐个走查**行为一字不差**（纯重构不许回归）。
3. S2：模型技能真实出图/出图验证（接入即验证铁律）。
4. descriptor 纯函数单测（input 适配过滤 / 参数 derive）。

## 8. 开放问题（拍板）
- 第一个模型技能选**抠图**还是**放大**？（看哪个有现成模型能力 + 你最想要）
- 局部重绘要 mask 输入（画蒙版）——交互更重,放 S3 还是更后？
- 工具条迁移成 registry 驱动后,分组（编辑/生成/导出）保持现有「定妆｜裁剪·切图·变换｜下载」还是重排？

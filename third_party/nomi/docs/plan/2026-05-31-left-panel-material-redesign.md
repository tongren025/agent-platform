# 左侧面板重做：分类 / 素材 双 Tab（修复「两套分类 + 看不懂的文件树」）

> 状态：待用户拍板
> 触发：workspace 合并后，生成区左侧出现两套「分类」+ 一棵看不懂的原始文件树（cache/.nomi/project.json/hash .bin）。用户要：保留左侧 Tab 形态（分类/文件），把「文件」内容换成对创作者有意义的展现，支持「拿本地素材进画布 / 把成品放进项目」。

## 1. 用户价值（为什么这么做）

创作者关于「文件」的真实需求，按行动价值：
1. ⭐⭐⭐ 把自己的图拿进来当输入（参考图/产品图/logo）
2. ⭐⭐⭐ 拿到成品（生成的图/视频）去用
3. ⭐⭐ 项目数据归我、找得到（已由「项目=文件夹」+「打开文件夹」满足）
4. ⭐⭐ 在项目内组织节点（逻辑分类，≠ 文件）

当前「原始文件树」服务的是开发者视角（文件系统目录），对 1/2 都不加分（不能拖进画布、看成品不如画布），所以用户「看不懂、用不上」。重做目标：把左侧「文件」区变成**创作者视角的「素材库」**——所见即所得、能拖、能导入。

## 2. 现状的两处冗余（规则1：删旧留新）

- **两套分类**：
  - 生成区 `CategorySidebar`（要留）：分类→节点→子组、右键菜单、跨分类拖拽带撤销、点节点定位画布。**功能完整。**
  - `ProjectExplorerSidebar` 的「分类」tab（要删）：只有扁平分类+计数，无节点/子组/右键，「+新分类」禁用。**stale 分支造的简陋复制品。**
- **看不懂的文件树**：`WorkspaceFileExplorerPanel` + `FileTreeNode` 直接吐 `workspace.listFiles` 的原始目录（含 cache/.nomi/project.json/hash 命名 .bin）。

## 3. 目标架构

左侧只保留**一个**带 Tab 的 `<aside>`（沿用 `ProjectExplorerSidebar` 的折叠 + Tab 外壳）：

- **「分类」Tab** = 完整分类导航（复用 `CategorySidebar` 的富内容，不是简陋版）。
- **「文件」Tab** = **修好的真实文件夹折叠树**（数据源仍是 `workspace.listFiles`，因为用户要的就是"显示文件夹里的真实内容"，不是另起一套）。

生成区 `GenerationWorkspace` 内不再单独挂 `CategorySidebar`（下沉进 Tab）。

### 存储事实（用户问过：导入 vs 生成存在哪？）
**同一个地方 = 项目文件夹**，无第二份内存副本，列表实时扫文件夹：
```
项目文件夹/
  ├─ assets/imported/{日期}/   ← 导入的素材（保留原始文件名）
  ├─ assets/generated/{日期}/  ← 生成的成品（当前是 hash 名 → 见命名策略）
  ├─ exports/                  ← 导出
  └─ .nomi/project.json        ← 内部清单（隐藏）
```
画布节点引用这些文件的本地 URL，指向同一份文件。

### 「文件」Tab 设计（真实文件夹折叠树）
保留并修 `FileTreeNode`（本来就支持点击折叠/展开，默认不全摊开）。
- **显示真实文件夹结构**（`assets/` 下 imported/generated/日期/文件），所见即所得；不做「导入的/生成的」人为分组。
- **过滤噪音**：隐藏 `.nomi`、`project.json`、`cache`、以及顶层迁移残留的空壳目录。保留 `assets/`、`exports/` 等用户有意义的目录。
- 交互：
  - **拖到画布** → 给文件节点加 draggable，dataTransfer 带文件的本地 URL；扩展画布 drop 处理：识别该 URL → 创建图片节点（复用现有 importRemoteUrl / 图片节点）。
  - **双击** → 在 Finder 打开（已有 `workspace.revealFile`）。
  - 顶部 **「+ 导入本地文件」** → 文件选择器 → `assets.importFile`，文件落到 `assets/imported/`，刷新即现。

### 命名策略（成品 hash 名 → 可读，方案 A）
- 导入文件已保留原始名，不动。
- **生成成品在写盘时（electron 侧 `writeAsset`/生成管线）用生成它的节点标题/提示词命名**（meta 里有 ownerNodeId，节点有 title/prompt）。注意：`listProjectAssets` 是扫盘、不持久化 meta，所以命名必须在**写入时**定，事后无 file→node 链接。
- 这是独立于 UI 的电改，放 Phase 2，避免阻塞 UI 修复。

## 4. 不动什么（底层全保留）

- 项目=真实文件夹、打开文件夹、生成存盘、旧项目迁移 → **一个都不动**。
- 顶部「素材库」按钮、Finder「打开文件夹」、导出 → 不动。
- 画布的 OS 文件拖入（`handleStageDrop`）→ 不动（只扩展，不替换）。
- 改的只是**左侧那块视图的展现 + 去重 + 交互增强**。

## 5. 改动清单（分两阶段）

### Phase 1 — UI 修复（核心，先做）
新增：
- `CategoryTree`（从 `CategorySidebar` 抽出的可嵌入富内容：nav + 右键菜单 + 节点/子组，去掉 aside/折叠/标题外壳）。

改：
- `ProjectExplorerSidebar`：「分类」tab 渲染 `CategoryTree`；「文件」tab 渲染修好的 `WorkspaceFileExplorerPanel`；删掉内部简陋 CategoryItem 列表 + 禁用的「+新分类」。
- `GenerationWorkspace`：移除单独的 `<CategorySidebar />` 挂载。
- `CategorySidebar`：拆成「外壳」+ `CategoryTree`；外壳若无其它引用 → 删文件。
- `WorkspaceFileExplorerPanel`：加噪音过滤 + 顶部「+导入本地文件」。
- `FileTreeNode`：加 draggable（拖到画布）。
- `GenerationCanvas.handleStageDrop`：扩展识别应用内拖入的本地文件 URL。

不删 `workspace.listFiles`/`FileTreeNode`/`useWorkspaceFiles`（修订：它们是文件树的正确基础，保留并修，不是删）。

### Phase 2 — 成品命名（独立，后做）
- electron 生成管线：写盘时用节点 title/prompt 给 `assets/generated/` 文件命名。
- 配 vitest 覆盖命名规整（去非法字符、重名加序号）。

## 6. 回滚
- 全程在 `main`（本地领先 origin）上做；每步独立 commit，失败 `git reset` 到本节点。
- 起点：`b3690ed`（V2 读修复后）。

## 7. 验收门
1. 左侧只剩一个 Tab 面板；「分类」tab 有完整节点/子组/右键/拖拽折叠；不再有第二列分类。
2. 「文件」tab 是可折叠真实文件夹树，默认不全摊开；无 `.nomi`/`project.json`/`cache`/空壳目录露出。
3. 能把文件拖进画布生成图片节点；双击在 Finder 打开；「+导入本地文件」可把外部文件拷进项目并刷新出现。
4. （Phase 2）新生成的成品文件名来自节点标题/提示词，可读。
5. `pnpm exec tsc -p electron/tsconfig.json` 0 错；`pnpm build` 过；`pnpm test` 全绿。
6. grep 无对已删组件的残留引用。

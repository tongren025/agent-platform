# 2026-06-13 穿透式全界面走查审计（只查不修）

> 方法：R13 标准流程——清场 → 全新构建 → 常驻驱动真机逐界面点按（snap→判断→click/fill→shot 人眼判断）→ 几何实测（getBoundingClientRect / elementFromPoint / store↔DOM 对账）→ Explore agent 挖根因到 file:line。
> 范围：起始页全部入口、模型接入、创作工作台 + AI 面板、拆镜头真实链路（GPT-5.5 实跑，19 节点计划确认落画布）、画布节点/边/分类/工具栏、时间轴、预览、导出、素材库、错误边界。
> 本文**只记录问题与根因，不含修复方案**。问题按「症状 → 根因(file:line) → 机制层归类（这类问题还会从哪复发）」组织。
>
> **审计期间干扰声明**：并行 Claude 会话在同一工作树持续 commit+重建 dist（f8dc403 → f703ece → a0e4611/T4），导致 app 两次踩 stale-chunk 崩溃（这是已知环境坑，不计入产品问题，但它意外暴露了真问题 A5）。其中 T4「轨迹分层布局+避让」与本文 A3 直接相关：A3 的实测数据采自 T2 版本，**T4 后需复验**。

---

## 分级总表

| # | 问题 | 层级 | 严重度 |
|---|---|---|---|
| A1 | 计划确认后定妆节点「消失」：跨分类静默归档 + 跨分类引用边在任何视图都不可见 | 信息架构 | P0 |
| A2 | 镜头编号 badge 不稳定：同行乱序、加无关节点会改写既有编号 | 数据真相源 | P0 |
| A3 | 批量布局节点必然重叠且遮挡交互（步距 hardcode < 节点尺寸；不避让已有节点）| 算法机制 | P0（T4 后待复验）|
| A4 | 全新空白项目走 legacy 迁移：弹「已升级」toast + 静默删除默认 text 节点 | schema 契约 | P0 |
| A5 | 任一懒加载 chunk 失败 = 整 app 崩到根错误边界；含 3D 节点的项目期间完全打不开 | 架构（容错粒度）| P1 |
| A6 | 「已应用/查看步骤/整笔撤销」回执不持久化，reload 后撤销入口永久消失 | 持久化契约 | P1 |
| A7 | 删除项目用原生 window.confirm：绕设计系统、E2E 不可测、Electron 焦点风险 | 原语缺失 | P1 |
| A8 | 示例项目播种不幂等：项目库 80 项，几十个重名示例 | 创建路径契约 | P1 |
| A9 | 模型设置弹层 1366px 溢出 837px 视口，「其他模型/添加模型」不可达；弹层定位 4+ 套手写 | 原语缺失 | P1 |
| A10 | 项目库「搜索×tab」组合空白无空态 | 渲染分支缺失 | P2 |
| A11 | 「新建空白项目」落地视图不确定（不设 workspaceMode，继承残留）；文案与落地不符 | 创建路径契约 | P2 |
| A12 | 「全部生成」三处语义互相矛盾（全部 vs 选中），零选中仍 enabled | 文案/契约 | P2 |
| A13 | 助手模型下拉直接暴露原始 id `moonshot-v1-128k-vision-preview` | 显示映射缺失 | P2 |
| A14 | 入口叫「Nomi 创作/Nomi 生成」、面板标题叫「助手」 | 命名一致性 | P2 |
| A15 | 视频节点已挂 first_frame 边仍显示「把图片节点拖过来作为首帧」占位 | 状态呈现 | P2 |
| A16 | 「查看步骤」明细只是同一句话重复，无逐节点信息 | 可观测性 | P2 |
| A17 | 项目库缩略图大面积空占位（与 A8 重复播种相关）| 待深挖 | P2 |
| A18 | AI 产出的镜头 prompt 全英文，中文用户无法校对 | 产品取舍（上报）| 待拍板 |

---

## A1 计划确认后定妆节点「消失」（P0 · 信息架构）

**症状**：拆镜头 → 计划卡「确认全部 (19 节点)」→ toast 报「创建 19 个节点：2 角色/产品 + 1 场景定妆 + 8 镜」。但画布上数不出定妆节点：store 23 节点，分镜视图 DOM 只渲染 20；store 25 条边，DOM 只渲染 10。用户视角 = 确认过的定妆凭空消失。

**真相**：定妆节点没丢——`getDefaultCategoryForNodeKind`（[generationNodeKinds.ts:84-95](src/workbench/generationCanvas/model/generationNodeKinds.ts)）把 character→`cast`、scene→`scene` 分类，画布按「当前分类」单视图渲染。确认计划后用户停在「分镜」视图，3 个定妆节点被静默归档进**默认折叠**的分类面板；15 条 `character_ref`/`style_ref` 引用边因两端跨分类，**在任何分类视图下都看不到**。

**机制层归类（系统性）**：
1. 画布是单分类视口，但 agent 的产物天然跨分类——「创建结果落在你看不见的地方」会随任何跨分类工具调用复发（立角色卡、建场景、未来道具/声音）。
2. 跨分类关系（引用边）没有任何呈现层：用户永远无法从界面得知「镜头 1 引用了主人公定妆」，但生成时这些边参与对账与参数注入（store 中 mode 已落）。「看不见但生效」是对账原则的反面。
3. 对账文案只报数量，不报「落在哪」：toast 与回执都没有提示 3 个节点在其他分类。

## A2 镜头编号 badge 不稳定（P0 · 数据真相源）

**症状**：badge「镜头 6」的卡片内容是「镜头 3 上班路上喝咖啡」；原有空节点被编为「镜头 3」。随后仅添加 1 个文本节点 + 1 个全景图节点，已有节点的 badge 从「镜头 9」变成「镜头 10」——**加无关节点会改写既有镜头编号**。

**根因**：[useNodeRelationships.ts:103-118](src/workbench/generationCanvas/hooks/useNodeRelationships.ts) `buildShotIndexMap`：
- 只按 `position.y` 排序，**x 不参与**；网格布局下同一行 y 全相等，落入 `a.id.localeCompare(b.id)`——id 含随机后缀（`gen-v2-image-mqb5m0m5-d3yk`），**同行编号实质随机**。
- `categoryId === 'shots'` 的节点全部参与编号，而 text/panorama/scene3d 默认也归 'shots'（generationNodeKinds.ts 注释自承「其余 → shots」）——非镜头节点挤进编号序列，插入位置靠前就把所有镜头顺延。

**机制层归类（系统性）**：镜头编号是「空间位置 + 随机 id」的衍生量，不是稳定身份；而 AI 计划的标题里写死了「镜头 N」。两份编号没有对账，任何移动节点、添加节点、布局变更都会让 badge 与标题进一步漂移。J1 旅程里用户对「第 N 镜」的心智模型直接被打碎。

## A3 批量布局必然重叠且遮挡交互（P0 · T4 后待复验）

**症状（T2 版实测）**：确认 19 节点后，相邻视频节点互相重叠（DOM 实测 27-28×110px），原有「关键画面」节点被新节点压住 121×89px。重叠不只难看——**Playwright 点击节点标题被相邻节点 preview 拦截**（`intercepts pointer events`），真实用户同样点不到被压住的标题区。

**根因（store 数据直读）**：布局网格步距 hardcode 列 360 / 行 260（x: 160,520,880,1240,1600；y: 160,420,680,940），但图片节点 340×280（行高差 -20px）、视频节点 420×340（列宽差 **-60px**、行高差 **-80px**）——**步距 < 节点尺寸，重叠是数学必然**，与避让逻辑无关。同时布局对画布上已有节点（440,380）零感知。

**机制层归类**：违反「随输入变的东西必须 derive」——节点尺寸是按 kind 变化的输入，步距却是常数。并行会话 a0e4611（T4「分层布局 + 避让已有节点」）正面处理了此问题，**需要在 T4 上复跑本测试确认两件事**：① 步距是否改为按节点尺寸 derive（避让已有节点 ≠ 修复步距）；② 旧项目里已重叠的节点是否有出路。

## A4 全新空白项目走 legacy 迁移（P0 · schema 契约）

**症状**：点「新建空白项目」→ 弹 toast「项目已升级到目录树：1 个节点已归类」；且默认画布本应有 text + image 两个节点，打开后 store 里只剩 image——**默认 text 节点被静默删除**（本次真机实证：store 首查无 text 节点）。

**根因**（Explore agent 定位，关键行已核）：
- 创建侧：[generationCanvasDefaults.ts:3-34](src/workbench/generationCanvas/store/generationCanvasDefaults.ts) 默认节点**不带 categoryId**。
- 迁移侧：[projectCategoryMigration.ts:61-73](src/workbench/project/projectCategoryMigration.ts) 把「无 categoryId」判为 legacy：image 推断归 shots（`migratedNodes+1`），text 兜底 `return null` → **进 removed 被删**。
- 触发面：[projectPersistenceService.ts:83-90](src/workbench/project/projectPersistenceService.ts) 对每个打开的项目无条件跑迁移；toast 在 [NomiStudioApp.tsx:200-211](src/workbench/NomiStudioApp.tsx)。

**机制层归类（系统性）**：创建路径与迁移路径对「节点初始形态」的契约相反——创建不盖 categoryId，迁移把无 categoryId 当 legacy。任何新增的创建/导入路径只要少写 categoryId 就会再次触发「升级 + 删节点」。缺一条结构保证：「createDefault* 产出的 payload 必须通过 migrate 的 already-migrated 判定」式不变量测试。

## A5 chunk 失败 = 整 app 崩溃（P1 · 容错架构）

**症状**：点「添加 3D 场景节点」→ `Scene3DEditor-*.js` 动态 import 失败 → **整个 app** 落入根错误边界；由于 3D 节点已持久化，此后每次打开该项目都直接崩——项目变成打不开的状态，直到 chunk 恢复一致。

**根因**：错误边界只有根级一层 [ErrorBoundary.tsx:10](src/ui/ErrorBoundary.tsx)；懒加载点位（CreationWorkspace / GenerationCanvas / Scene3DEditor / Scene3DFullscreen…）没有各自的 Suspense 错误域，也没有 chunk 加载失败的重试/降级。

**机制层归类**：本次触发器是并行构建竞态（环境坑），但同一故障在生产可由 asar 损坏、增量更新中途、磁盘错误触发。架构问题是**爆炸半径**：一个可选功能（3D 编辑器）的资源失败，把整个工作台（包括与 3D 无关的创作/导出）全部拖死。「重新加载」按钮（`location.reload`）在 chunk 持续不一致时也无法自愈，用户无任何出路。

## A6 撤销回执不持久化（P1 · 持久化契约）

**症状**：确认计划后助手消息含「✓ 已应用…查看步骤 / 整笔撤销」。app 重启后对话历史还在（用户消息 + 计划文本 + 记忆卡），**唯独回执消息消失**——「整笔撤销」入口随一次 reload 永久蒸发。

**机制层归类**：conversations.json 的持久化只覆盖部分消息类型，「事务回执」这种带操作入口的消息被排除。撤销窗口的生命周期被持久化策略隐式决定（=会话内存级），与 S6 事务/撤销机制的设计预期（整笔可回滚）不一致。同类复发：任何带行动按钮的系统消息（未来的失败重试、成本确认）都会同样丢失。

## A7 删除项目走 window.confirm（P1 · 原语缺失）

**症状**：项目卡删除按钮点击后无任何应用内反馈；自动化测试中 Playwright 静默 dismiss，人工使用中弹的是浏览器原生 confirm。

**根因**：[NomiStudioApp.tsx:379](src/workbench/NomiStudioApp.tsx) `window.confirm(...)`。

**机制层归类**：项目缺「破坏性操作确认」的设计系统原语，谁写删除谁自己选实现。后果三连：① 视觉完全脱离设计系统；② E2E 永远测不到删除链路（驱动自动 dismiss——本次走查两次点删除「没反应」就是它）；③ Electron 下原生 confirm 在 macOS 有焦点丢失史。同类复发：任何新增的不可逆操作（清空画布、删分类）都会面对同样的选择题。

## A8 示例项目播种不幂等（P1 · 创建路径契约）

**症状**：项目库 80 个项目，几十个重名「示例：30 秒产品介绍」「示例：天台上的告白」，时间分散多天；绝大多数缩略图空占位。

**根因**（Explore agent）：`tryExample`（[NomiStudioApp.tsx:285-325](src/workbench/NomiStudioApp.tsx)）每次无条件 `createLocalProject(example.projectName)`；id 永远新 mint（[projectRepository.ts:42-44](src/workbench/project/projectRepository.ts)），名字不是身份，**全链路无幂等键**。放大器：`nomi-model-catalog-changed` 监听（NomiStudioApp.tsx:328-353）会在接好模型后自动重放挂起的 tryExample，再播一份。

**机制层归类（系统性）**：`createLocalProject` 的契约是「无条件新建」，所有把名字当语义身份的调用方都会堆重复。入口集：空库 CTA 反复触发、模型接入自动续跑、未来任何「一键示例」入口。

## A9 模型设置弹层溢出 + 弹层原语缺失（P1）

**症状（几何实测）**：APIMart + KIE.AI 同时展开后弹层总高 1366px > 视口 837px，底部越界 593px，命中节点 `overflow-y: visible` 不可滚——「其他模型」「添加模型」完全不可达。

**根因**（Explore agent）：内层 [OnboardingDrawer.tsx:102-148](src/ui/onboarding/OnboardingDrawer.tsx) 根 div 无 max-height/overflow；外层 [OnboardingFloatingPanel.tsx:75-92](src/ui/onboarding/OnboardingFloatingPanel.tsx) 用 `100vh` 估算 clamp——clamp 与内容分属两层、用估算值，实测未生效。

**机制层归类（系统性）**：[portal.tsx](src/design/portal.tsx) 只导出裸 `BodyPortal`，**翻转/clamp/视口测量没有可复用原语**——NodeGenerationComposer、AssetPickerPopover、SelectionGeneratePopover、OnboardingFloatingPanel 各自手写一套。画布弹层遮挡上周刚修过（canvas-fixes 2026-06-12），同类问题立刻在另一个组件复发，正是「修在症状层」的证据：每新增一个弹层都要重新发明边界处理，漏一处复发一处。

## A10 项目库过滤空态缺失（P2）

**症状**：搜「京都」且当前 tab 是「外部文件夹 0」→ 列表纯空白，无「无结果」提示，不自动切 tab。
**根因**：[ProjectLibraryPage.tsx:73-86](src/workbench/library/ProjectLibraryPage.tsx) 过滤管线 + :262 起直接 `filteredProjects.map`，唯一空态判的是 `projects.length === 0`（整库空），「库非空但过滤后为空」的所有组合（搜索无命中 × 任意 tab、零计数 tab）都落进空 grid。

## A11 「新建空白项目」落地视图不确定（P2）

**症状**：CTA 文案「从一段文字或想法开始」，实际落在生成画布。
**根因**：`newProject`（[NomiStudioApp.tsx:263-275](src/workbench/NomiStudioApp.tsx)）不设 workspaceMode；对比 `openProject:227` 显式 `'generation'`、`tryExample:319` 显式 `'creation'`。落地视图 = store 默认值或**上一个项目的残留 mode**。
**机制层**：三条创建路径各自手设/漏设 mode，缺「创建入口必须声明落地视图」的统一契约；新增入口会继续漂。

## A12 「全部生成」语义矛盾（P2 · 未实测点击）

按钮文字「全部生成」/ aria「批量生成所有**选中**节点」/ title「全部生成（限并发 2，失败自动重试）」三处互相矛盾；且零选中时 enabled。**为避免烧真实额度未点击验证**：到底生成「全部」还是「选中」、一键全量是否有成本确认，待低成本环境复验。若无确认且语义为「全部」，23 节点项目一次误点 = 16+ 笔付费生成。

## A13–A17（P2 简记）

- **A13** 助手模型下拉出现原始 id `moonshot-v1-128k-vision-preview`——自定义接入模型无 displayName 映射，违反「词汇 = 模型真名」的可读版本（真名≠原始 id 串）。
- **A14** 同一个面板，入口按钮叫「Nomi 创作/Nomi 生成」，面板标题叫「助手」。
- **A15** 视频节点已有 first_frame 入边（连着关键帧）仍显示「把图片节点拖过来作为首帧」占位——空状态没有区分「未连接」vs「已连接、上游未生成」。
- **A16** 「查看步骤」展开后只是把对账句子原样重复一遍，无逐节点/逐步骤明细，对账可观测性形同虚设。
- **A17** 项目库缩略图大面积空占位。与 A8 强相关（示例项目无资产），独立成因未深挖，列为待查。

## A18 prompt 语言（待拍板，不是 bug）

拆镜头产出的节点 prompt 全英文（视频模型吃英文是合理取舍），但中文用户在计划卡和节点上**无法校对自己批准的内容**。属产品取舍，按 R3 留用户拍板，不擅自定方向。

---

## 横切观察（机制层共因）

把 18 项归并，根子上是 5 类机制缺口：

1. **契约不同步**（A4/A8/A11）：创建路径、迁移路径、入口文案各自演化，没有不变量测试钉住彼此的约定。
2. **衍生量冒充身份**（A2/A3）：编号从位置衍生、布局从常数出发——凡是「随输入变的量」被钉死或被随机量污染，都会以视觉错乱形式浮出。
3. **原语缺失，各自手写**（A7/A9）：确认框、弹层边界没有设计系统级原语，每个调用点重新发明，修复不沉淀。
4. **看得见的 ≠ 存在的**（A1/A6/A16）：store/事务层做对了（节点都在、边都在、对账都报了），呈现层只展示子集且不提示残缺——「正确但不可见」对用户等于错误。
5. **容错粒度过粗**（A5）：单点资源失败提升为全局崩溃，可选功能拖死核心链路。

## 疑点（未决，后续验证）

- canvas 节点层 hardcode `w-[4000px] h-[3000px]`（generation-canvas-v2__nodes）——节点超界时行为未测。
- A3 在 T4（a0e4611）后的真实状态——本文数据采自 T2。
- 「外部文件夹」tab 里出现用户 `~/Music`、`~/Pictures` 整目录作为项目——是历史测试残留还是导入流程允许任意系统目录，未查。
- J3「30 秒体验」CTA 仅空库可见，本机 80 项目无法真机走查（逻辑已由 Explore 静态确认）。

## 附录

- 截图：`tests/ux/shots/audit-00` ~ `audit-45`（45 张，按编号对应走查步骤）。
- 实测项目：`~/Documents/Nomi Projects/未命名项目 06_13 00_35-mqb5elvv-f1fd1431`（store↔DOM 对账原始数据来源，含 23 节点/25 边的 project.json）。
- 真实 AI 调用：1 次拆镜头（GPT-5.5，~13.4k tokens）；未触发任何图片/视频付费生成。

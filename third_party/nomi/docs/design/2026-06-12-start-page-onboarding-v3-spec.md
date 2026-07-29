# 起始页 + Onboarding v3 实现规范

日期：2026-06-12
样张（验收合同）：`docs/design/mockups/2026-06-12-start-page-onboarding-v3.html`
布局选项板（已拍板 O2）：`docs/design/mockups/2026-06-12-start-page-layout-options-v4.html`
截图：`docs/design/reviews/2026-06-12-start-v3-{a,a2,b,c,d}-*.png`、`2026-06-12-start-v4-o{1,2,3}-*.png`
状态：A 屏布局已拍板 O2 动作卡片；整体方案待用户最终确认后进入实现（R8 步骤 4）

## 1. 背景与 v2 的洞

用户诉求：① 首页 Onboarding 大块冗余、不能常驻；② 按钮全部同大小，分不清主次；③ 自己画的 v2「考虑不完整」。

v2 经评审发现的洞（本版逐条修复）：

| # | v2 的洞 | v3 解法 |
|---|---|---|
| 1 | A 屏「模型接入」按钮 + 状态面板双入口 | 缺模型时弱按钮隐藏、状态条升权为实心主按钮（单一入口） |
| 2 | B 屏左侧说「先建项目」、右侧 checklist 说「先接模型」，两条主线打架 | 合并为一条主线：「30 秒体验」自动按序经过 模型→项目→引导 |
| 3 | 「开始引导」按下去发生什么没定义（空项目 tour 没内容可讲） | 引导 = 30 秒体验：建**示例项目**（复用 Try Now 基建），tour 锚定真实内容 |
| 4 | C 屏解剖错位：说「创作区」画的是生成画布；空白画布无锚点 | C 画真实创作工作台（编辑器 + 创作助手），spotlight 真实「拆成分镜」按钮 |
| 5 | 筛选「新建项目」与按钮「新建空白项目」动词撞车；解释性 micro-note | 筛选改名词「本地新建 / 外部文件夹」；micro-note 删除 |

## 2. 状态机（谁决定页面长什么样）

| 状态 | 判定（运行时实查，无需新标记） | 表现 |
|---|---|---|
| 空库 | `projects.length === 0` | B 屏：hero「30 秒体验」主 CTA。库非空即永久回 A——「引导首次有、之后不常驻」由空/非空自然决定 |
| 有项目 | `projects.length > 0` | A 屏标准库 |
| 缺文本模型 | `listWorkbenchModelCatalogModels({kind:'text', enabled:true}).length === 0` | A：状态条升权（实心钮）+ 右上弱钮隐藏；B：hero 下提示行 + 右上弱钮隐藏 |
| tour 未完成 | `localStorage['nomi:tour:v1']` 不存在（**新引入**，现仓无任何首启标记） | 首次进入示例项目时自动开 tour |
| tour 完成/跳过 | 标记 = `'done' \| 'skipped'` | 不再出现；重看入口 = 工作台 appbar「?」（开放项 ③） |

30 秒体验完整链：点击 → 文本模型预检（复用 `NomiStudioApp.tsx:275-287`）→ 缺则打开 OnboardingWizard（带上下文条，保存成功**自动继续**，取消则留在 B）→ `createLocalProject` + 灌示例故事（复用 `tryExample` `NomiStudioApp.tsx:271-312`）→ 落创作区 + tour 第 1 步。

## 3. 四屏规范要点

### A 项目库（常态）—— 布局拍板：O2 动作卡片（2026-06-12，v4 选项板三选一）
- **主入口 = 动作卡片**（剪映/CapCut/Resolve 起始页惯例），不再是一排同尺寸 pill：
  - 主卡「新建空白项目」：280×88，`bg-nomi-ink text-nomi-paper rounded-nomi shadow-nomi-sm`，左 40px 圆形图标位（IconPlus），标题 14px/700 + 用途行「从一段文字或想法开始」（12px，paper 72% 派生色，封 token）
  - 次卡「打开已有文件夹」：同尺寸，`bg-nomi-paper border-nomi-line`，IconFolderOpen + 用途行「把素材文件夹变成项目」
  - **ActionCard 为新组件**：按设计系统 §9 协议登记后实现（通用 → `src/design/`）
- 模型接入降为页头右上 28px 无边框弱文字钮（`text-nomi-ink-60`），与动作卡尺寸/形态/位置三重区隔
- 搜索框右移，与「最近项目 + 筛选」同一行（左 section-head / 右 280px 搜索），纵向密度优于现状
- 删除：Try Now hero（`ProjectLibraryPage.tsx:98-148`）、副标题、micro-note（`:192-195`）
- 筛选 segmented 文案：`全部 N` / `本地新建 N` / `外部文件夹 N`（数据已有 `source: 'native'|'folder'`）
- 主卡/次卡/项目卡 reveal 钮三处图标互不相同（IconPlus / IconFolderOpen / 另选 reveal 图标），项目卡图标钮 hover 才显
- 缺模型态：弱钮隐藏，状态条插在**动作卡下方**（PanelCard 形态）：「文本模型未接入」+「写故事、拆镜头都需要它；图片 / 视频模型可以等到生成前再接。」+ 实心「接入文本模型」——与动作卡形态尺度不同，无双主钮竞争（原开放项 ① 已随 O2 拍板消解）

### B 空库首启
- hero 直接坐在 `--nomi-bg` 上，**无容器边框**（dashed 框 = 拖放区暗示，误导）
- 结构：display 字体标题「把一段文字，变成可生成的分镜」→ 一行价值句 → 实心大 CTA「▶ 30 秒体验」（h-9）→ 缺模型提示行（人话 + 成本交代：「需要先连接一个 AI 服务（用你自己的 API Key，Nomi 不另收费）——点击体验时会带你完成。」）→「或」分隔 → 描边次选「新建空白项目」「打开已有文件夹」→ 安心句（项目保存在本地）
- 缺模型时右上「模型接入」弱钮隐藏（全页单一模型入口 = 主 CTA 自动带入）；有模型后提示行消失、弱钮恢复

### C 工作台引导（3 步 tour）
- 新组件 `WorkbenchTour`（BodyPortal 锚定，仿 SettingsPopover 不裁剪层），**不做 scrim 压暗**（避免「让用户看的内容反而变暗/被挡」+挖洞工程）；焦点区 accent 描边 + 真实按钮 spotlight（accent outline offset）
- callout 不复制动作按钮，只含步骤号、标题、一句话、「跳过引导」subtle；**几何上不得遮挡故事文字与焦点按钮**（落 design-fidelity 断言）
- 步骤：1/3 创作「先有故事」（推进 = 点真实「拆成分镜」）→ 2/3 生成「每个镜头是一张卡片」→ 3/3 预览「连起来看」（完成写标记）
- 第 1 步是真实 LLM 调用，必须有：**调用中**（callout 变「正在拆分镜…」）、**失败**（callout 给「重试 / 跳过本步」），不许 tour 卡死
- 从 B 点「新建空白项目」进来的缺模型用户：创作助手面板内显示与 A2 同款状态条（路径不悬空）

### D 模型接入衔接
- 完全沿用现有 `OnboardingWizard`（类型切换 / 接入地址 / 拉取模型 / 读文档分支全保留），增量只有四处：
  1. 顶部上下文条（仅体验流程出现）：「▶ 30 秒体验 · 先连接一个 AI 服务，完成后自动继续」（accent-soft）
  2. 体验流程中类型锁「文本模型」
  3. 每个供应商带「去哪拿 Key」指引行（`providerPresets.ts` 增 `keyHelpUrl` / `keyHelpNote` 字段，含「几分钟，有免费额度」类提示）——真实用户评审定位的**最大流失点补桥**
  4. 左下「稍后再说，先逛逛」退路（关闭回库页，不堵死）
- 主按钮体验流程中为「保存并继续体验」，平时「保存」；选供应商后预填推荐模型 id
- 供应商单选 chip 选中态 accent-soft：实现时优先复用 `DesignSegmentedControl`，否则按 §9 登记 chip 选中态

## 4. 实现映射（现仓锚点）

| 改动 | 位置 |
|---|---|
| 库页重排 + 空态分支 | `src/workbench/library/ProjectLibraryPage.tsx`（hero L98-148 删、action row L150-191 重排、筛选 L218-241 改名） |
| 30 秒体验链路 | `src/workbench/NomiStudioApp.tsx:271-312` `tryExample`（已有预检/建项目/灌故事/落创作区），增「wizard 保存成功后自动续跑」状态 |
| 模型状态查询 | `src/workbench/api/modelCatalogApi.ts` `listWorkbenchModelCatalogModels` / `getWorkbenchModelCatalogHealth` |
| Wizard 衔接 | `src/ui/onboarding/OnboardingWizard.tsx` + `src/ui/onboarding/providerPresets.ts`（增 keyHelp 字段） |
| Tour（新） | `src/workbench/onboarding/WorkbenchTour.tsx` + 标记 `localStorage['nomi:tour:v1']` |
| 示例数据 | `src/workbench/library/tryNowExamples.ts`（沿用，默认 product-demo） |

## 5. 验收门

1. 五门全过（filesize / lint:ci / typecheck / test / build）
2. `tests/ux/design-fidelity.e2e.mjs` 新增：按钮三档 computed-style、状态条单入口互斥、tour callout 不遮挡焦点元素（getBoundingClientRect）
3. R13 J3 真机走查：冷启动 → 30 秒体验 → 3 步 tour 走通，逐步截图人眼判断
4. 与本样张逐项并排对账

## 6. 开放项（实现前可不阻塞，列给用户知情）

1. ~~A2 同屏两颗实心钮的取舍~~ —— 已随 O2 动作卡片拍板消解（主入口为卡片形态，状态条按钮不构成同形态竞争）
2. tour 重看入口：appbar 常驻「?」 vs 并入设置（评审认为常驻 chrome 服务一次性功能偏重）
3. 供应商 Key 指引文案的数据维护（各家免费额度会变，文案别写死具体额度数字）
4. mockup 中 650/750 字重、28px 品牌字号等沿用现有页面实况；实现时以现有 `ProjectLibraryPage` 实际 token 为准，不新增非 token 值

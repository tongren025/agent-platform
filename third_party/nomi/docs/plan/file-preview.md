# 本地文件预览 / 可读（画布旁点开就能看）

> 用户痛点：导入的 txt/MD/PDF 等点了打不开、看不了，只能"在 Finder 打开"。
> 在画布里干活时想瞄一眼文件内容，没法看。

## 用户流程（模拟）
导入本地文件 → 文件树里看到它 → **想看看里面是啥** → 现在：单击只选中、双击只在 Finder 打开 → **应用内读不了，断流**。
价值点：创作时**不离开画布**就能快速读到脚本/分镜/参考文档（txt/md/pdf）的内容。

## 底层现状（已查证，关键结论）
- **文件分类已就绪**：`workspaceFileIndex.ts` 已按扩展名给出 `kind`+`contentType`（md/txt/json/csv→text、png/jpg…→image、mp4…→video、mp3/wav→audio、pdf→document）。
- **内容获取零成本**：`nomi-local://asset/{projectId}/{relativePath}` 协议已注册 `supportFetchAPI + stream + corsEnabled`（main.ts:52）。所以渲染层可直接：
  - text/md/json/csv → `fetch(url).then(r=>r.text())`
  - image → `<img src>`；video → `<video>`；audio → `<audio>`
  - pdf → `<iframe src>`（Chromium 内置 PDF 阅读器，无需 pdf.js）
- **不需要新增任何 Electron IPC**。纯前端：一个 `FilePreview` 组件 + 接上点击。
- 现状交互：`FileTreeNode` 单击=选中/展开、双击=`revealFile`(Finder)。无应用内预览。

## 支持格式（v1）
图片 / 视频 / 音频（直接元素）；文本 txt/json/csv（`<pre>`）；Markdown（`react-markdown`，已是依赖，按规则5用 Context7 核对安全渲染）；PDF（`<iframe>`）。未知类型 → "无法预览，在 Finder 打开" 兜底。

## 设计抉择：预览放哪（待评审 + 用户定）
| 方案 | 用户体验 | 代价 |
|---|---|---|
| **A 点击弹预览浮层/Modal**（推荐 v1）| 单击文件→中央/侧浮层显示内容，Esc 关。最快覆盖"点一下能读" | 单组件，低 |
| B 资源管理器内嵌预览窗格 | 文件树下方常驻一块预览区 | 占侧栏高度，违反"信息区别永远占高" |
| C 画布"文档节点" | 拖文档到画布变成一个可读节点，真正"在画布里看" | 新节点类型，较大（P2）|

倾向 **A 做 v1**（点击即读，最直接），**C 作为 P2**（"在画布里看"的完全体）。交互：**单击文件→打开预览**（文件选中本身无其它用途）；目录单击仍展开；reveal-in-Finder 降为预览里的次要动作。

## 不动什么
- 拖拽到画布（workspaceFileDrag）、reveal-in-Finder、文件树分类逻辑、底层 IPC/协议 —— 不动。

## 规则 6 / Context7
- 主要库 `react-markdown`：实现时用 Context7 查官方推荐（remark/rehype、是否需 sanitize）。
- PDF 用 Chromium 原生（iframe），不引 pdf.js（无必要）。
- 同类参考：VS Code / Finder 快速预览（单击/空格即看）、Obsidian 的 md 预览。

## 回滚 / 验收
- 新增组件 + 改 FileTreeNode 点击；revert 即回。
- `pnpm build` 绿；目测：点 txt/md/pdf/图片/视频都能看；未知类型有兜底。

## 评审（规则 7：设计师 + 真实用户）→ 方案已据此修正

**两点关键否定 + 采纳：**
- ❌ 中央 Modal（两评审都反对：盖画布、破"瞄一眼不出戏"）→ ✅ **右侧面板**。
- ❌ 单击=预览（真实用户：单击=选中是肌肉记忆，每点必弹=打断）→ ✅ **空格预览（QuickLook）+ 双击也开；单击仍只选中**；reveal-in-Finder 降为预览头里的按钮。
- 形态归属：DesignDrawer 是 Mantine 系（§3.1 Design*=设置 / Workbench*=画布），文件树在 workbench 区且无 WorkbenchDrawer → **用 workbench 原生右侧面板**（Portal + fixed + token，仿 `OnboardingFloatingPanel`），绕开归属冲突、不引焦点陷阱盖画布。

**格式优先级（真实用户）**：txt/md 脚本 > 图片 > pdf > 视频。预览里**文字可选中复制**（脚本要贴进节点）。

**设计师挖出的系统缺口（落地必处理）：**
- 补 **`--nomi-font-mono`** token（§2.6 只有 sans/display；代码块/`<pre>` 需等宽）→ 加进 nomi-tokens.css + tailwind。
- **react-markdown 必须用 `components` 逐标签映射 token**（h1→h1/h2→h2/p→body/code→mono+ink-05 底/a→accent…），否则默认裸样式破系统。实现前读 `node_modules/react-markdown` 真实 API（本会话 Context7 MCP 下会话才生效，故读真实源替代）。
- 面板宽度定值（≈440px），不写随手百分比。

## 最终设计（v1）
- **右侧预览面板**（单例）：Portal + `fixed right-0`，宽 ~440px，`bg-nomi-paper` `shadow-nomi-lg`，贴边不盖画布；Esc/点外部/X 关；换文件直接替换内容不反复开关。
- **触发**：单击=选中（不变）；**空格=预览选中文件**；**双击=预览**；面板头放文件名 + `在 Finder 打开` + 关闭。
- **按类型渲染**：image `<img object-contain>`；video/audio 原生元素；text(txt/json/csv) `<pre>` mono；md `react-markdown` + token 映射；pdf `<iframe>` 撑满；未知 → §5.3 空状态"无法预览 + 在 Finder 打开"。
- 文字原生可选中复制；图片拖进画布沿用现有文件树拖拽（不重复造）。
- **P2（不在本轮）**：画布"文档节点"、预览内拖拽、放大。

## 执行结果（回填 2026-06-03）

实现（纯前端 + 一个 token，零新 IPC）：
- **`--nomi-font-mono` token**（nomi-tokens.css + tailwind `font-nomi-mono`）——补设计师指出的 §2.6 缺口。
- **`NomiMarkdown`**（`src/workbench/common/`）：token 类逐标签映射 react-markdown（读真实 readme 确认 `components` API）。
- **`useFilePreviewStore`**（zustand 单例）：避免在递归文件树里层层传 prop。
- **`FilePreviewPanel`**（`src/workbench/explorer/`）：右侧 440px 面板（Portal+fixed，不盖画布）；按 kind 渲染——image/video/audio 原生元素、text→`<pre font-nomi-mono>`、md→`NomiMarkdown`、pdf→`<iframe>`(Chromium 原生)、未知→兜底 CTA；text 经 `fetch(nomi-local://…)` 取（协议已 supportFetchAPI）；Esc/点外/X 关。
- **`FileTreeNode`**：单击=选中（不变）；**双击 / 空格=预览**；reveal-in-Finder 移到面板头按钮。
- 挂载：`NomiStudioApp` 渲染一次 `<FilePreviewPanel/>`。
- 验收：`pnpm build` 绿 / `vitest` 48 文件 416 过 / 本地重建重启。

**rule-1 债已记**：CreationAiPanel 仍有旧内联 markdown 映射，已 spawn 独立任务合并到 NomiMarkdown（本轮不动聊天面板避免回归）。
**P2 未做**：画布"文档节点"、预览内拖拽、放大。

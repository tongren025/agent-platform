# PR #27 重做：顶栏/窗口刷新（侧栏图标 Tab + Windows 自绘标题栏 + 画布导航重排 + AI 面板停靠动画）

> 2026-06-30。pr-27（外部贡献者 `feature/header-layout`）研究后**不整体合**：它没过编译（S1 dup-const）、macOS 路径做坏（M1-M3）、掺大量格式 churn + 第二套图标库 lucide。
> 决策（用户拍板）：**我把好部分在隔离工作树从 main 干净重做再合**。本文件 = 范围/不动项/回滚/验收门。

## 隔离方式（避并行 session 冲突）
- 工作树 `/Users/aoqimin/Desktop/Nomi-header`，分支 `feat/header-window-refresh`（从 main `5a418bc7` 起）。
- `node_modules` symlink 复用主 checkout（**依赖零新增** → 合法）。
- 共享主工作树有并行 session 在改 `main.ts`（archetype-bridge）+ 未提交工作，**全程不碰**。

## 三条关键决策（与 pr-27 的差异）
1. **macOS 保持原生窗口**（不做 frameless）。pr-27 在 mac 上 `titleBarStyle:'hidden'` 但拖拽区/红绿灯内缩/OnboardingChecklist 都没收尾 → mac（用户平台）被做坏。我方：mac `frame:true`（原生），Windows `frame:false`（自绘）。`frame: process.platform !== 'win32'`。mac UI 仅受跨平台改动影响，窗口 chrome 零回归。
2. **图标统一 tabler**（drop lucide-react）。pr-27 侧栏/画布引入第二套 lucide，违 P1。WindowControls 本就用 tabler。侧栏/画布的 lucide 全映射回 `@tabler/icons-react`。
3. **依赖零新增**：drop `lucide-react`、drop `overlayscrollbars`（用 tailwind.config 已有滚动条样式）；`framer-motion`（main 已有 ^12.39.0）照用做 AI 面板停靠动画。

## 范围（要做）
| 文件 | 改动 | 守的纪律 |
|---|---|---|
| `electron/main.ts` | `frame: platform!=='win32'`（mac原生/win自绘）；窗口控制 IPC（min/max/close）**注册一次**于 registerIpc、用 `BrowserWindow.fromWebContents(e.sender)`（修 S2 重复注册崩窗）；devtools opt-in。**不碰 CSP 块**（避 S1+避撞并行） | P1/P2/R12(≤800) |
| `electron/preload.ts` | 暴露 `nomiDesktop.window.{minimize,maximize,close,onMaximized}` | — |
| `src/desktop/bridge.ts` | `DesktopBridge.window?` 类型 | — |
| `src/ui/app-shell/WindowControls.tsx` | 新增（win32 自绘按钮，tabler 图标）。`hover:!bg-red-500` → 语义 token（修 token 门） | token-only |
| `src/ui/app-shell/NomiAppBar.tsx` | win32 时把品牌/控制让位给 windowbar；**保留 OnboardingChecklist**（mac 不丢，修 M3） | P1 |
| `src/workbench/WorkbenchShell.tsx` | grid→flex-col；win32 时渲染自绘 windowbar（含 app-drag/品牌/checklist/WindowControls） | — |
| `src/workbench/explorer/ProjectExplorerSidebar.tsx` | 激活 Tab 只显 icon（非激活 icon+文字）+ title 兜底；图标 tabler | R2 |
| `src/workbench/generation/GenerationWorkspace.tsx` | framer-motion 停靠动画（CSS 变量列宽，尊重 reduced-motion） | — |
| `src/workbench/generationCanvas/components/GenerationCanvas.tsx` | 导航栏右下重排 + minimap 显隐开关；图标 tabler；**抽 navigation-stack 子组件压回 ≤800 行** | R9/R12 |
| `…/components/CanvasAssistantPanel.tsx` | 固定目标宽配合动画 | — |
| `…/components/CanvasMinimap.tsx` | 定位交给容器（relative） | — |
| `src/workbench/library/ProjectLibraryPage.tsx` | win32 自绘 windowbar + 顶部操作抽取（非 win32 原位保留） | — |
| `src/workbench/onboarding/OnboardingChecklist.tsx` | 适配新标题栏（高度/z-index） | — |
| `src/workbench/NomiStudioApp.tsx` | `generationAiCollapsed` 提升到画布 store 单一真相源 | P1 |
| `tailwind.config.ts` | `.app-drag/.app-no-drag` addUtilities + token 派生滚动条（照搬，clean） | R10(不进 src/styles) |
| `vite.config.ts` | COOP/COEP 收进 `NOMI_DEV_CROSS_ORIGIN_ISOLATION` 开关（照搬，是修复） | — |
| `tests/ux/window-drag.e2e.mjs` | 新增，但 **platform-guard**（非 win32 跳过，不在 mac 红） | — |

## 不动项
- `src/styles/globals.css` / `index.css` / `vendor-overrides.css`：**不增**（pr-27 在这违 R10，我方只用 tailwind.config）。
- `public/tailwind.generated.css`：不手改，build 时 `--minify` 重新生成。
- `src/main.tsx`：不加 overlayscrollbars import（drop 该依赖）。
- 主工作树 + 并行 session 的未提交工作：不碰。
- main.ts 的 CSP/COOP 块：不碰（并行 session 在改）。

## 验收门
1. 五门：`pnpm run gates`（filesize→tokens→lint→typecheck→test→build）全过。`electron/main.ts`≤800、`GenerationCanvas.tsx`≤800。
2. 无新依赖（`git diff main -- package.json` 无新增 dependencies）。
3. Mac 真机走查（R13）：窗口正常（原生 chrome 在）、侧栏激活 Tab 只显 icon、画布 minimap 右下+显隐开关、AI 面板停靠动画、OnboardingChecklist 在。截图人眼判断。
4. Windows 自绘标题栏：**无法在 mac 走查**，诚实标注「Windows 路径已实现 + typecheck 过，待 Windows 真机验」（D4）。

## 回滚
- 整条在 `feat/header-window-refresh` 分支，合并前 main 不受影响。出问题弃分支即可。

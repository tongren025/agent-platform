# 版本号 + 检查更新 + 一键更新（功能需求 1/2/3）

> 2026-06-19 · 状态：方案待拍板（含可体验样张）
> 决策依据：用户确认 Nomi 安装包发布在 **GitHub Releases**（package.json 已配 `publish: { provider: "github" }`），故可做**真·应用内一键更新**。

## 1. 范围

一个工作流覆盖用户三条需求：

| 需求 | 落点 | 能做到 |
|---|---|---|
| 功能1 查看版本号 | 设置 → 关于 Nomi | 显示当前版本（`app.getVersion()` = 0.10.13）、平台/架构 |
| 功能2 检查是否最新 | 同上「检查更新」按钮 | 向 GitHub Releases 拉最新 tag 对比，给出「已是最新 / 有新版 vX.Y.Z」|
| 功能3 一键更新 | 同上更新流程 | 后台下载新安装包 → 校验 → 「重启并安装」一键完成 |

## 2. 技术方案

### 2.1 主进程：electron-updater + GitHub provider
- 新增依赖 `electron-updater`（electron-builder 官方配套，与现有 `publish: github` 直接对接，零额外服务器）。
- 新建 `electron/update/autoUpdater.ts`：封装 `autoUpdater.checkForUpdates()` / `downloadUpdate()` / `quitAndInstall()`，**关闭自动下载**（`autoUpdater.autoDownload = false`）——下载必须用户点，符合 P2「用户掌控」。
- 事件转发：`checking-for-update` / `update-available` / `update-not-available` / `download-progress` / `update-downloaded` / `error` 通过既有 IPC 广播桥（main.ts:174 的 `forward` 模式）推给渲染层。
- **Context7 强制**（R5）：动手前查 electron-updater 官方文档（GitHub provider 配置、`autoDownload`、`quitAndInstall` 参数、代码签名要求）。

### 2.2 IPC（沿用 main.ts 既有 `ipcMain.handle` 模式）
| channel | 方向 | 作用 |
|---|---|---|
| `nomi:app:version` | invoke | 返回 `{ version, platform, arch }` |
| `nomi:update:check` | invoke | 触发检查，返回 `{ status, latestVersion?, notes? }` |
| `nomi:update:download` | invoke | 开始下载（仅在 available 后可调用）|
| `nomi:update:install` | invoke | `quitAndInstall()` |
| `nomi:update:event` | on（主→渲染）| 进度/状态广播 |

preload.ts 暴露 `window.nomi.update.*`（沿用现有 bridge 形态 `src/desktop/bridge.ts`）。

### 2.3 渲染层状态机（单一真相源）
一个 `useUpdaterStore`（或并入 workbenchStore 的子 slice），状态枚举：
`idle → checking → (upToDate | available) → downloading(progress%) → downloaded → installing | error`
UI 纯 derive 自该状态，不 hardcode 文案分支。

### 2.4 平台差异（诚实边界）
- **Windows（用户当前系统）+ macOS**：NSIS / dmg 均被 electron-updater 支持，全流程可用。
- **代码签名**：未签名安装包在 Win 上可更新但有 SmartScreen 提示；mac 需公证才能静默替换。现状 `mac.identity: null`（未签名）→ mac 上「一键更新」会被 Gatekeeper 拦，需降级为「下载好了，请手动打开安装」。**Win 优先全流程，mac 视签名情况降级**——此点实现时实测，不在文档里假设成功。

## 3. UI（设置 → 关于 Nomi）

> 注：截图里的「设置 → Recipes」弹层在当前 committed 源码中未找到对应字符串，实现时先定位真实设置宿主；若无独立设置弹层，则在 AppBar 菜单加「关于 Nomi」轻量弹层。UI 形态见同目录可体验样张。

**一张卡片，渐进展开，避免一次堆参数**（R2 极简）：
- 默认态：`Nomi 0.10.13` + 「检查更新」按钮（次级）。
- 点检查 → 按钮变 spinner「检查中…」。
- 已最新 → ✓「已是最新版本」3 秒后回落。
- 有新版 → 展开一行：`发现新版 0.11.0` +（可选）更新说明折叠 + 「下载更新」主按钮。
- 下载中 → 进度条 + 百分比 + 「后台下载，可继续创作」。
- 下载完 → 「重启并安装」主按钮 + 「稍后」。

## 4. 不动什么
- 不碰生成 / 画布 / 时间轴 / 导出。
- 不引入自动静默更新（不打扰创作，必须用户点）。
- 不改 electron-builder 的 `publish` 配置（已正确）。

## 5. 回滚策略
纯增量：新增 `electron/update/` + 设置卡片 + IPC channel。回滚 = 摘掉「关于」卡片入口 + 还原 main.ts/preload 的 update 注册块，不影响任何现有链路。

## 6. 验收门
1. 五门全过（filesize→tokens→lint→typecheck→test→build）。
2. `electron/update/autoUpdater.ts` 状态机单测（mock autoUpdater 事件 → store 状态迁移）。
3. 真机：打一个 +1 patch 的测试 release 到 GitHub → 旧版 app 检查 → 看到新版 → 下载 → 进度 → 安装（Win 全程；mac 记录降级实况）。
4. 与获批样张逐项对账（R8）。

## 7. 开放问题（实现前确认）
- 设置宿主：截图的 Recipes 弹层不在源码 → 用独立「关于」弹层还是并入某设置面板？（实现时先 Explore 定位，找不到就加轻量「关于 Nomi」）
- mac 签名：是否计划公证？不签则 mac 降级为「下载→手动安装」，需用户知晓。

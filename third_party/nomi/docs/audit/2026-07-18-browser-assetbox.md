# 浏览器 × 素材盒 bug 修复与真机走查

> 日期：2026-07-18
> 版本：v0.16.8
> 结论：用户复现链已在 macOS 原生输入、受保护本地资源和 Dribbble 真实网页三层通过。

## 根因与修复

| 原始摩擦 | 根因 | 结构性修复 |
|---|---|---|
| 并排后网页中间不能点 / 不能拖，点一下素材盒消失 | macOS 不支持 `BrowserWindow.setShape()`，旧代码仍让覆盖网页区的透明窗口接收鼠标 | 只有 Win/Linux 且 shape 真成功才使用裁形命中；macOS 由主进程 hover、drag 和按下态分别控制穿透 |
| 拖图后统一“下载失败” | 下载后又换无页面 Session 的网络栈重抓 URL，丢 Cookie/Referer；真实原因被卡片覆盖 | http(s) 只走源 WebContents 的 Session.fetch；blob 只在源页面下载；无来源会话直接给可行动错误 |
| 参考视频/海报类型错、错误卡还能拖 | bridge 和 HTML parser 把 poster 标成 video；卡片状态与拖拽入口各自判断 | poster 统一为 image；ready 判断成为拖拽唯一门；loading/error/prompt error 均禁拖 |
| 大素材可能卡死 / 撑爆 Electron 主进程 | 先 `arrayBuffer()` 再同步写盘；提示词图再整体转巨型 base64 | 网络响应逐块计数、异步流式落盘，200 MB 硬上限；提示词参考图 base64 另限 16 MB |
| 图片扩展名与真实内容不一致 | 旧实现信 URL/标题后缀；服务器 MIME 也可能撒谎 | 魔数嗅探决定 MIME；统一复用 `captureFileName` 和媒体注册表派生扩展名 |
| 标签/截图原生菜单打开或 Escape 不稳定 | 编译后 preload 相对路径错一层，内联脚本又被 CSP 拦 | 修正编译目录路径；行为脚本在 did-finish-load 后注入；菜单自身处理 Escape |

## 原生用户旅程

使用 CoreGraphics 产生真实系统鼠标事件，不是 renderer 合成 `DataTransfer`：

1. 网页 `<img draggable>` → 素材盒切到右侧并排 → 原生拖入 → `native-ref.png` 落库。
2. 恢复浮动 → 第二张网页图原生拖入 → `native-ref-two.png` 落库。
3. 原生点击素材盒外的网页按钮 → 网页点击计数 `+1`，素材盒仍保持打开。

该旅程在修复过程中真实抓到过一次 `pointerInteractive` 在 drop 后被 pointerup 重新置回 true 的遗漏；继续下钻后将 pointer 状态收敛为“只表示按下期”，最终整条通过。

## 按钮级走查

| 区域 | 已执行动作 | 结果 |
|---|---|---|
| 浏览器外壳 | 新建/关闭标签、后退、前进、刷新、书签 | PASS |
| 浏览器菜单 | 标签右键菜单、素材网站、截图提取菜单、Escape 分层 | PASS |
| 素材盒头部 | 捕捞开/关、设置、并排、恢复、收起、重开 | PASS |
| 素材工具栏 | 搜索、上传、新建/进入/返回文件夹、网格/列表、最新/最早、筛选 | PASS |
| 素材区 | 单选、卡片右键、空白右键、失败卡不可拖 | PASS |
| 下载链 | Cookie、Referer、302、HTTP 错误、HTML 伪媒体、真实 Dribbble CDN | PASS |
| 稳定性 | 关闭/重开完整可见、全部可见控件落在命中区、控制台异常 | PASS，0 error |

## 截图证据

- `tests/ux/shots/browser-overlay/05-docked-right.png`：右侧并排状态。
- `tests/ux/shots/reference-capture/08-native-dock-restore-drag-click.png`：两次原生拖入与网页点击后的素材盒。
- `tests/ux/shots/reference-capture/10-actionable-download-error.png`：非媒体响应的具体错误。
- `tests/ux/shots/reference-capture/11-live-site-drag-result.png`：Dribbble 真实网页素材落库（现场联网走查生成）。

## 自动化证据

- 定向单测：页面 Session、流式限额、伪 MIME、命名、平台 shape、drag 结束状态、失败卡、poster、Chrome menu。
- `browser-overlay-interaction.walk.mjs`：素材盒全部可见控件和状态切换。
- `reference-capture.walk.mjs`：按钮、受保护资源、原生 macOS 输入、错误恢复、素材回流；可用 `NOMI_LIVE_BROWSER_SITE_URL=https://dribbble.com/` 加跑真实站。
- 最终交付前执行项目全门 `pnpm run gates`。

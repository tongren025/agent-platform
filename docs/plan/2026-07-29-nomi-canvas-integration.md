# Nomi 短剧画布迁入计划

## 范围

- 以 Apache-2.0 的 Nomi v0.17.0（commit `4afb06452064b483a9cd2fb7b82523500b03c0a5`）为上游基线，完整保留源码和许可证。
- 将 Nomi renderer 构建产物作为 Agent Platform 的同源静态应用发布，并从现有“画布”菜单直接进入。
- 在浏览器环境把 Nomi 的模型目录、图片任务、视频任务及视频轮询接到 Agent Platform 现有 OpenRouter 媒体服务。
- 保留原 ReactFlow 画布作为带查询参数的兼容入口，避免已有画布数据突然不可访问。

## 不动项

- 不改 Nomi Electron 桌面端的 IPC 路径；桌面构建仍使用原生 bridge。
- 不复制 Nomi 的密钥、数据库、缓存、构建依赖和发布包。
- 不改变 Agent Platform 既有媒体模型配置入口和鉴权方式。

## 回滚

- 恢复 `web/src/pages/CanvasHub.tsx` 的旧画布默认入口。
- 删除 `web/public/nomi` 与 `third_party/nomi`，并移除 `/canvas/nomi/*` 适配 API。
- 该变更不含数据库迁移，回滚无需处理数据表。

## 验收门

- Nomi renderer 构建、类型检查、Lint、单测和上游静态门禁通过。
- Agent Platform 前端构建及 Nomi 适配 API 定向测试通过。
- 浏览器真实走查：进入项目库、新建项目、新建画面、打开时间轴，并确认模型目录不再提示 Electron 限制。
- 上游许可证、来源说明、README 与 CHANGELOG 齐全。

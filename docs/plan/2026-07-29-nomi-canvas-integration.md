# Nomi 短剧画布迁入计划

## 范围

- 以 Apache-2.0 的 Nomi v0.17.0（commit `4afb06452064b483a9cd2fb7b82523500b03c0a5`）为上游基线，完整保留源码和许可证。
- 将 Nomi renderer 改造成可挂载的 ES 模块，在 Agent Platform 主站 DOM、路由布局和登录态内从“画布”菜单直接进入，不使用 iframe 或独立 HTML。
- 在浏览器环境把 Nomi 的数字员工、模型目录、项目持久化、图片任务、视频任务及视频轮询接到 Agent Platform 现有服务。
- 移除产品界面的上游品牌、官网、更新器和供应商密钥设置；保留内部兼容符号、Apache-2.0 许可证和上游归属。

## 不动项

- 不改 Nomi Electron 桌面端的 IPC 路径；桌面构建仍使用原生 bridge。
- 不复制 Nomi 的密钥、数据库和桌面发布包；浏览器模型配置只读取平台现有员工和媒体模型。
- 不改变 Agent Platform 既有媒体模型配置入口和鉴权方式。

## 回滚

- 恢复 `web/src/pages/CanvasHub.tsx` 的旧平台画布入口。
- 删除 `web/public/agent-canvas` 构建产物与源码挂载入口，并移除 `/canvas/workbench/*` 适配 API。
- 该变更不含数据库迁移，回滚无需处理数据表。

## 验收门

- 源码模块构建和 Agent Platform 主站前端构建通过。
- 工作台项目、媒体目录、图片与视频任务适配 API 定向测试及全量后端测试通过。
- 浏览器真实走查：进入项目库、新建项目、新建画面、打开时间轴，并确认员工/模型目录来自平台且不再提示 Electron 限制。
- 上游许可证、来源说明、README 与 CHANGELOG 齐全。

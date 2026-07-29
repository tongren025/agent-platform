# 画布上游源码镜像

这里保存本机浅克隆的上游源码，供调试、审计和二次开发使用。目录被忽略，不随
agent-platform 仓库提交；业务构建使用 `web/package.json` 中的正式 npm 版本。

| 目录 | 上游 | 用途 | 许可证边界 |
|---|---|---|---|
| `xyflow/` | https://github.com/xyflow/xyflow | 现有生产画布参考实现 | MIT |
| `excalidraw/` | https://github.com/excalidraw/excalidraw | 自由白板 | MIT |
| `fabricjs/` | https://github.com/fabricjs/fabric.js | 视觉排版 | MIT |
| `rete/` | https://github.com/retejs/rete | 可执行节点编辑器 | MIT |
| `affine/` | https://github.com/toeverything/AFFiNE | 自托管知识画布 | Community Edition 为 MIT |
| `tldraw/` | https://github.com/tldraw/tldraw | 无限画布 SDK | 自定义许可证；生产使用需要密钥 |

更新单个镜像：

```powershell
git -C vendor/canvas-sources/<目录> pull --ff-only
```

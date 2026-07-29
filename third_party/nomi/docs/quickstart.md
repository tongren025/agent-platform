# 快速启动

> 官网图文版新手指南已上线到：<https://nomiaqm.com/quickstart.html>

## 方式一：桌面版（推荐，双击即用）

从 [GitHub Releases](https://github.com/aqm857886159/Nomi/releases/latest) 下载安装包：

| 系统 | 适用机型 | 下载 |
|------|---------|------|
| 🍎 macOS | Apple Silicon（M1/M2/M3/M4） | Nomi-mac-arm64.dmg |
| 🍎 macOS | Intel 芯片 | Nomi-mac-intel.dmg |
| 🪟 Windows | Win 10 / 11 | Nomi-windows-setup.exe |

无需 Docker，无需数据库，无需命令行。项目文件全部保存在本地 `文档/Nomi Projects` 目录。

### macOS 首次打开提示「已损坏」？

```bash
xattr -cr /Applications/Nomi.app
```

然后再双击打开即可。

---

## 方式二：源码启动（开发者）

### 环境要求

- Node.js 20+
- pnpm 10+（`corepack enable` 自动安装）

### 启动

```bash
git clone https://github.com/aqm857886159/Nomi.git
cd Nomi
corepack enable
pnpm install
pnpm dev
```

启动后会自动打开 Electron 窗口。无需任何额外服务。

### 打包成安装包

```bash
pnpm build   # 编译前端 + Electron 主进程
pnpm dist    # 打包成 DMG / EXE
```

---

## 启动后第一步：配模型

顶部工具栏 → **模型接入** → 添加供应商。

推荐起步组合：

- **DeepSeek**（文本 AI，用来写脚本、拆镜头）：[platform.deepseek.com](https://platform.deepseek.com)
- **即梦**（文生图）：[volcengine.com/product/jimeng](https://www.volcengine.com/product/jimeng)
- **可灵 / Runway**（文生视频 / 图生视频）

详细接入步骤：[provider-integration.md](provider-integration.md)

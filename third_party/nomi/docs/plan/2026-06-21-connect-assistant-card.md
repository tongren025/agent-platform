# 接入 AI 编程助手卡：一键把 Nomi 接进 Claude Code（UI）

> 2026-06-21。用户要：界面上有个东西让用户知道怎么用能力核，**最好一键、什么都不管、最小 effort**。
> 样张已出（show_widget 可体验）+ 用户拍板：**写全局 `~/.claude.json`（自动备份 + 可撤销）+ 按样张实现**。

## 目标（D1 effect-first）
用户不用读配置、不用找路径、不用学命令。点一个按钮 → Nomi 自己把 MCP 配置写进 Claude Code → 给一句「现在可以对它说……」。兜底：复制配置（给 Codex/Cursor/手动）+ 看用法（跳用户指南）。

## 落点（勘查带 file:line）
- 挂进现有「模型设置」面板 `src/ui/onboarding/OnboardingDrawer.tsx`（顶栏插头图标 `NomiAppBar.tsx:218` 打开的浮卡 `OnboardingFloatingPanel`）新增一个分组，**不新开界面**。
- 卡片照抄 `VendorOnboardCard` / `FoldableModelCard` 结构（token-only，真品牌色），新组件 `src/ui/onboarding/ConnectAssistantCard.tsx`。
- 复制走 `navigator.clipboard.writeText`（抄 `ProvenancePanel.tsx:23`）+ `toast`。

## 新增 3 个 IPC（主进程，受限、非任意路径写）
1. **`nomi:capability:mcp-info`**（读）→ `{ tokenReady, rpcRunning, installed, configPath, snippet, server:{command,args} }`。
   - `server.args` = `node` + `scripts/nomi-mcp.mjs` 绝对路径（`app.getAppPath()` 推）。
   - `installed` = `~/.claude.json` 的 `mcpServers.nomi` 已存在。
2. **`nomi:capability:install-mcp`**（写）→ 读 `~/.claude.json`（缺则 `{}`）→ **先备份**到 `~/.claude.json.nomi-backup` → **合并**进 `mcpServers.nomi`（**保留已有 `cocos-creator` 等其它 server**，绝不覆盖整个文件）→ 原子写回 → 返回 `{ ok, configPath, backupPath }`。
3. **`nomi:capability:uninstall-mcp`**（撤销）→ 删 `mcpServers.nomi`，写回 → `{ ok }`。

安全：只写固定 `~/.claude.json`（`os.homedir()/.claude.json`），不做通用任意路径写（勘查警告）。备份让用户可回退。

## 卡片状态机
- **加载中** → 读 mcp-info。
- **就绪·未接入**（tokenReady && !installed）→ 主按钮「一键接入 Claude Code」+ 复制 + 看用法。
- **已接入**（installed）→ ✓ 已写入·重启后生效 + 「现在可以对它说……」示例 + 撤销接入。
- **token 未就绪**（!tokenReady，理论上启动即生成，兜底）→ 提示「重启 Nomi 一次」。

## 不动什么
- 不碰能力核已有逻辑（token/RPC/lockfile/CLI/MCP server 都不改）。
- 不做任意路径写；只 `~/.claude.json` 一个固定目标。
- 不改顶栏 `NomiAppBar`（只在面板内加卡）。

## 回滚
- 纯增量：3 个新 IPC + 1 个新组件 + OnboardingDrawer/preload/bridge 各加几行。出问题摘掉卡组即可。
- 用户侧回滚：卡片自带「撤销接入」+ 写盘前自动备份 `~/.claude.json.nomi-backup`。

## 验收门
- 五门全过。
- **与样张逐项对账**（R8：截图并排）。
- **真机走查（R13）**：开面板 → 看到卡 → 点开 → 一键接入 → 真机确认 `~/.claude.json` 真写进 `mcpServers.nomi` 且 `cocos-creator` 还在、备份生成 → 撤销 → 确认删干净。
- design-fidelity 不回归。

## 已知边界
- MCP 配置里的 `nomi-mcp.mjs` 路径在 dev = repo；打包安装版的脚本路径/内置 node 是后续切片（与 CLI 打包入口同批）。

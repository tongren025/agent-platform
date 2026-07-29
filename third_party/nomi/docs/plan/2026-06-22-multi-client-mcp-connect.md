# 一键接入多 MCP 客户端（Claude Code / Codex / Cursor）

> 2026-06-22 ｜ 用户：「codex 以及其他的可以打通吧，但 UI 设计上不能冗余」。拍板：一键支持 Claude Code + Codex + Cursor，其余走「复制配置」。

## 现状
`ConnectAssistantCard` + `mcpConfig.ts` 只一键写 Claude Code（`~/.claude.json` 的 `mcpServers.nomi`）。Codex/Cursor 只能「复制配置」手动粘。

## 方案（不冗余：一张卡 + 分段切目标，不堆卡/不堆按钮）
- **UI**：单卡内加一行 `DesignSegmentedControl`（Claude Code / Codex / Cursor，复用现成组件 §3.4）。选哪个 → 同一个「一键接入 [目标]」按钮 + 状态 + 撤销随之变（参数化，不重复）。默认选已检测到 installed 的那个，否则 Claude Code。其余助手（Cline/Windsurf…）走「复制配置」一行兜底。已用样张拍板。
- **后端 `mcpConfig.ts` 泛化**按客户端写：
  - Claude Code：`~/.claude.json`，JSON，`mcpServers.nomi`（现状）。
  - Cursor：`~/.cursor/mcp.json`，JSON，`mcpServers.nomi`（同形状，复用 JSON 合并，换路径 + mkdir）。
  - Codex：`~/.codex/config.toml`，TOML，`[mcp_servers.nomi]`。**块级文本合并**（按 `[表头]` 边界只替换我们自己的块），**不引 TOML 依赖**（沿用 nomi-mcp 不引 SDK 的极简纪律 P1）。
  - 安全口径不变：写前备份、合并不覆盖别人的 server、原子写（tmp→rename）、可撤销。
- **接口**：`readMcpInfo(rpcPort)` 返回 `{tokenReady, rpcRunning, server, clients:{claude,codex,cursor}}`，每 client 带 `{installed, configPath, snippet}`；`installMcp(client)` / `uninstallMcp(client)` 参数化（默认 claude 保旧测试）。IPC/preload/bridge 透传 client 参数。

## 不动项
单实例锁、token/rpc、A 模式实时桥、付费确认、nomi-mcp.mjs 协议层。只动「写哪个配置文件」。

## 验收
- 三客户端各：一键接入 → 对应配置文件出现 `nomi` 条目（合并不覆盖）；撤销 → 只删 nomi。
- 切分段 → 状态/按钮/文案正确随之变。
- 复制配置 → 对应格式（claude/cursor=JSON，codex=TOML）。
- 五门 + 单测（mcpConfig.test.ts 扩 codex/cursor 用例）+ 真机走查（卡片切换 + 真写入临时配置核验）。

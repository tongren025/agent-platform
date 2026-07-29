# Nomi v0.7.6 — 外部 review 安全加固（SSRF 防护 + 保存失败通知）

发布日期：2026-05-27
依据：外部代码 review 提出的 5 项问题中的 "明显该改" 子集

## 修了什么（2 项）

### 1. 远程 URL 拉取加固（SSRF / DoS / 假内容）
新增 `electron/hardenedFetch.ts`，替换 `runtime.ts` 中两处直接 `fetch`：
- `fetchModelCatalogDocs`（模型接入 Agent 抓文档）
- `importRemoteAsset`（资产下载到项目）

防护层：
- **私网拦截**：localhost / 127.0.0.0/8 / 10.0.0.0/8 / 172.16-31.0.0/12 / 192.168.0.0/16 / 169.254.0.0/16（含 AWS metadata 169.254.169.254）/ ::1 / fe80::/10 / fc00::/7 / `.local` 全部直接拒绝。重定向终点也走同一套检查。
- **超时**：默认 20s（资产下载放宽到 60s），AbortController 触发。
- **大小限制**：文档 5MB、资产 200MB；提前查 content-length，流式累计超限即中断 reader。
- **MIME 限制**：资产仅接受 `image/*` `video/*` `audio/*` `application/octet-stream`。
- **协议限制**：仅 http(s)；data / nomi-local 走单独分支不经 hardenedFetch。

不破坏现有行为：合法 HTTPS 图片/视频下载完全无感。

### 2. 本地保存失败的静默丢失
`projectRepository.ts` 的 `writeJson` 之前在 localStorage 配额耗尽（驱逐 backup 重试也失败）后是 `/* give up silently */`。创作工具里"保存失败但用户不知道"是高风险体验问题。

现在：抛 `ProjectStorageQuotaError`，沿 `saveProject` → `saveQueue.catch` → `onSaveError` → `toast('项目保存失败，请检查本地磁盘权限', 'error')` 一路冒泡。用户立刻看到提示。

## 外部 review 中**待讨论**的 3 项（没擅自改）

1. **API Key 明文存储 (`model-catalog.json`)** —— 应该改用 Electron `safeStorage`（macOS Keychain / Windows DPAPI）。涉及现有数据迁移 + headless 测试降级，需要先约定迁移策略。
2. **同步 IPC（`sendSync` 在 preload）** —— 项目列表 / 模型目录 IPC 都走 sync，理论上大项目会阻塞 renderer。改 async 是大改造，会牵动 zustand store 的 hydration 流程。
3. **`runtime.ts` 2432 行单文件** —— 拆成 projectService / assetService / modelCatalogService / taskRuntime / agentRuntime 是长期方向，但拆分本身的风险也不小。

请告知优先级。

## 升级

v0.7.5 → v0.7.6 数据兼容。第一次保存项目体积超 localStorage 配额时会弹 toast（之前是静默）。

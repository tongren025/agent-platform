# 主进程 fetch 走代理（Phase 1：自动探测，零界面）

> 日期：2026-06-06 ｜ 状态：✅ 已完成（全套 CI 门绿 + 真端到端验证通过）
> 背景见会话：用户的中转站 `api.apimart.ai`（境外 IP）只能走本机代理（Clash `127.0.0.1:7897`），
> 但 Electron 主进程的全局 `fetch`（undici）默认不读系统代理 → 直连超时 → UI 报笼统的 `fetch failed`。
> 这不是配置填错，是 Nomi 缺主进程代理支持，**所有需要科学上网到中转站/官方 API 的用户都会卡死**。

## 调研定论（规则 5/6）

- undici 官方：`setGlobalDispatcher(dispatcher)` 的 dispatcher **被 Node 内置 `fetch` 共享**
  （镜像到 `Symbol.for('undici.globalDispatcher.1')`）。→ 装 `undici` 包后 `setGlobalDispatcher(new ProxyAgent(url))`
  即可让主进程全局 `fetch` 走代理。
- `session.setProxy()` **只管 Chromium 渲染层，救不了主进程 fetch**（这是病根）。
- 顶尖开源（Cherry Studio `nodeProxy.ts`）做法 = `undici.setGlobalDispatcher` + 自定义
  `SelectiveDispatcher`（按 origin 决定走代理还是直连，避免代理掉本地/私网）。本方案抄这套的精简版。
- 系统代理地址来源：① 环境变量 `HTTPS_PROXY/HTTP_PROXY/ALL_PROXY`；② Electron `session.resolveProxy()`
  读系统网络设置/PAC（macOS GUI 从 Finder 启动拿不到 env 时的兜底，最稳）。

## 范围（Phase 1，用户已拍板）

**做**：
1. 新增依赖 `undici`（与 Electron 31 内置 Node 的 undici 主版本对齐，装 `undici@^6`）。
2. 新模块 `electron/systemProxy.ts`：
   - `resolveProxyUrl()`：env 优先，否则 `session.defaultSession.resolveProxy(probe)` 解析；只认 HTTP(S) 代理。
   - `SelectiveProxyDispatcher`：origin 命中 `isPrivateHost` → 走原始直连 dispatcher；否则走 `ProxyAgent`。
   - `applySystemProxy()`：探测 → 命中则 `setGlobalDispatcher(selective)`，并 `console.log` 探测结果；没探到则不动。
   - `describeNetworkError(error)`：把 undici 的 `fetch failed` 按 `cause.code`（ETIMEDOUT/ENOTFOUND/ECONNREFUSED…）
     翻成人话，供两个 IPC handler 的 catch 用（顺带把那个没用的报错改成能区分超时/DNS/拒绝）。
3. `electron/hardenedFetch.ts`：把 `isPrivateHost` 改为 `export`（复用，规则 1，不另写私网判断）。
4. `electron/main.ts`：`app.whenReady()` 内、`createWindow()` 前 `await applySystemProxy()`；
   两个 handler 的 catch 用 `describeNetworkError`。
5. 单测 `electron/systemProxy.test.ts`：覆盖 resolveProxy 字符串解析、isPrivateHost 绕过判定、错误翻译。

**不做（留 Phase 2，另起任务 + 走样张评审）**：
- 设置界面（系统/自定义/关闭三态、手填代理地址）。
- SOCKS 代理（undici ProxyAgent 不支持，需 `fetch-socks`）。
- 系统代理热更新（60s 轮询）。
- 渲染层 `session.setProxy`（当前 UI 无 webview 出网需求）。

以上不做项，启动日志里若探到 SOCKS-only 系统代理，明确 `log` 告知"暂不支持 SOCKS，请用 HTTP 代理端口"，不静默吞。

## 不动什么

- `hardenedFetch` 的 SSRF 逻辑（只把 `isPrivateHost` 导出，行为不变）。
- 现有 IPC 契约 / 渲染层 / 模型档案。
- 全局 dispatcher 只在探到代理时替换；没代理时保持 Electron 默认，零行为变化。

## 回滚策略

- 单 commit。回滚 = `git revert`。
- 运行期安全网：`applySystemProxy()` 整体 try/catch，任何异常只 `console.error` 不抛——
  探测失败绝不能拖垮启动（最坏退化回今天的"直连"，不会更糟）。

## 验收门

- `pnpm run check:filesize` + `lint:ci`（含 max-warnings 棘轮）+ `typecheck` + `vitest run` + `build` 全绿。
- 真实验证（规则 13）：起 Electron，确认 `applySystemProxy` 探到 `127.0.0.1:7897`；
  对 `api.apimart.ai/v1/models` 发请求拿到 **HTTP 401**（=穿过代理到达服务器，对照直连的 12s 超时）。
- 本地模型不被误代理：对 `127.0.0.1` 的请求走直连（isPrivateHost 绕过）。

## 执行结果（2026-06-06 回填）

- CI 五门全绿：filesize ✓ ／ lint:ci ✓（95<98 棘轮，新文件零问题）／ typecheck ✓ ／ vitest 639 ✓ ／ build ✓。
- 真端到端（Electron Node，undici 6.19.8）：
  - **装代理**：探到 `http://127.0.0.1:7897`（env）→ `api.apimart.ai/v1/models` 返回 **HTTP 401，0.53s**（穿透到达服务器）。
  - **直连对照**：同地址 `fetch failed`，**10s 超时**（复现用户原 bug）。
  - 错误翻译：真 `UND_ERR_CONNECT_TIMEOUT` → "连接超时：网络不通，或该地址需要代理才能访问（当前未启用代理；请开启系统代理后重启应用）"。
- 新单测 `systemProxy.test.ts` 17 例：env/system 解析、私网绕过路由、错误翻译。

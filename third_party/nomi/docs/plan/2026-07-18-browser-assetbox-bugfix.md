# 浏览器 × 素材盒 P0 修复与完整走查

> 日期：2026-07-18
> 状态：已完成——保持现有视觉与“浮动 / 并排”产品方向，行为 bug、同类入口、按钮走查、macOS 原生旅程和发布门禁均已通过。

## 用户摩擦与根因

1. **并排后网页不能点、不能拖，点一下素材盒消失**
   macOS 不支持 `BrowserWindow.setShape()`，但 dock 状态无条件把覆盖整个网页区的透明 overlay 设为接收鼠标，网页事件被吞。透明区的点击又触发素材盒外部点击关闭。
2. **网页图片拖入后只显示“下载失败”**
   页面会话下载依赖 `will-download` 与 URL 匹配；重定向、站点会话和防盗链使链路脆弱。兜底又换成丢失页面会话的主进程网络栈。错误层算出的真实原因还被素材卡固定文案覆盖。
3. **失败卡看似能拖，拖到画布却无反应**
   loading/error 素材仍标记为 draggable，画布 drop 最后因无有效 URL 静默丢弃。
4. **现有测试假绿**
   走查直接调用捕捞 IPC，只测 DOM/几何，没有覆盖网页真实拖拽、dock/恢复、macOS OS 级点击命中、失败卡和连续操作。

## 设计定案

- 保留现有浏览器和素材盒视觉，不做大改版。
- 保留“浮动 / 右侧并排”；两个状态共享同一交互不变量：素材盒矩形外的网页始终可点击、可发起拖拽。
- 浏览器会话内的 http(s) 资源只走**页面所属 Session 的统一抓取通道**；不再失败后换成无页面会话的第二套网络栈。
- `blob:` 是协议特例，继续在源 WebContents 中取资源；不是同一 URL 的 fallback。
- 失败卡显示真实可行动原因；首版至少保证可读和可删除，不再伪装成可拖素材。重试复用原输入，不复制下载实现。
- 素材盒名称统一，收起动作不再叫“最小化资产包”。

## 实施范围

### P0

- 把 overlay shape 能力改成平台显式能力；macOS dock 继续按 `popoverRect` 动态鼠标穿透。
- native contained 素材盒不因透明背景点击自行关闭；只由明确收起、Escape、浏览器关闭收起。
- http(s) 下载改为源 `Session.fetch`，携带页面 Referer、会话 Cookie、正确 Accept，自动跟随重定向；限制 200 MiB。
- 严格拒绝 HTML/文本错误页冒充图片或视频；保留真实 HTTP、超时、类型、blob 错误。
- 移除 native overlay 的“会话下载失败 → 无会话直连再抓”并行 fallback。
- error/loading 卡禁拖；拖拽入口复用唯一可导入判断。

### P1

- 网页 drag bridge 对复杂卡片中的图片、picture/source、视频海报做稳定 URL 提取；任何页面 dragstart 都能及时开启跨窗口接力，dragend/drop 后及时复位。
- drop 接受条件与实际解析能力一致；无法解析时不显示虚假“可保存”状态。
- 错误副标题不被 tile 二次覆盖；统一“素材盒 / 收起素材盒 / 并排显示 / 恢复浮动”。
- Escape 先关闭素材盒内的筛选/更多菜单，再关闭素材盒。

### P2（本轮一起完成的低风险同类项）

- 补 dock/恢复、菜单、搜索、上传、文件夹、布局、排序、筛选、卡片交互的按钮级回归走查。
- 补下载内容类型、重定向/HTTP 错误、平台点击能力、失败卡不可拖的单测。
- 把真实旅程截图扩到浮动、并排、恢复、下载中/成功/失败、关闭重开。
- 版本升为下一个 patch，构建并安装给用户试用。

## 明确不动

- 不取消浮动模式，不把素材盒改成固定侧栏。
- 不重做浏览器视觉、不新增顶层入口。
- 不改模型调用、生成画布节点协议或素材隐私不变量；`browser-capture` 的 `originalUrl` 仍恒为 `null`。
- 不用 Dribbble 域名特判；修通用 Session / 重定向 / 内容校验。

## 结构保证与测试

1. 纯函数测试：平台是否支持 shape；Darwin dock 不得令整窗持续 interactive。
2. 下载测试：同一 Session、Referer/Accept、redirect follow、credentials include、大小上限、HTTP 错误、HTML 拒绝、媒体类型。
3. 组件测试：错误原因可见；loading/error 不可拖；ready 可拖。
4. Electron 走查：
   - 浮动 → 网页图片拖入 → 成功落库；
   - 右侧并排 → 网页中部仍可点/拖 → 拖入；
   - 恢复浮动 → 再拖入 → 点击网页不关闭素材盒；
   - 关闭/重开无幽灵透明层；
   - 每个按钮/图标至少执行一次，并截图人工检查。
5. 全量门禁：`pnpm run gates`。

## 参考依据

- Electron 官方 `webContents.downloadURL`：触发 Session 的 `will-download`，可附加 headers。
- Electron 官方 `Session.fetch`：使用 Chromium 网络栈，并可从现有 WebContents 的 Session 发起请求。
- Electron 31 类型声明：`BrowserWindow.setShape` 仅支持 Windows / Linux。

## 回滚

- 单 commit 交付；回滚该 commit 即恢复旧行为。
- 不改素材存储格式，不需要数据迁移。

## 完成标准

- 用户原复现路径在 macOS 真机连续执行两轮不再失败。
- 已知普通 URL、重定向 URL、拒绝访问、blob、图片、视频均得到正确成功或可行动错误。
- 所有按钮/图标逐项走查有 PASS/FAIL 记录和截图证据。
- 全门通过，提交并推送 `main`，安装新构建供用户直接试用。

# 接模型「失焦自动拉取」+ ByteString 人话修复

> 日期：2026-06-27 ｜ 触发：用户截图——老师填完 BaseURL+Key 没点「拉取可用模型」→ 保存永久置灰，且撞上原始 `Cannot convert argument to a ByteString` 报错。
> 用户/设计两 agent 一致结论 + 样张已拍板（方向A 自动拉取）。

## 根因（两件正交的事）

1. **工作流卡死（主）**：中转站卖点是「填完地址+key 一把拉全」，但 UI 把拉取做成右上角低权重文字链接，老师没注意到 → 没 model id → `hasModelId=false` → 保存永久灰，且不说差什么。根因 = effect-first 没贯彻：把「App 本该自动做的事」做成了「用户必须主动发现并点击、还要懂 model id」的手动关卡。
2. **ByteString 误报（附带）**：`testConnection` / `listModels` 两条 handler 各有裸 `fetch`（onboardingIpc.ts:55 / :215），**绕过**了 commit 2477fd6 的发送闸（只长在 vendorHttp.requestJson）。脏 key（含中文/全角）拼进 header → fetch 同步抛原始 ByteString → 经 describeNetworkError 兜底分支原样回传 → 前端显示「连不上：Cannot convert…」。

## 范围（改这些）

### A. UI — 失焦自动拉取（`src/ui/onboarding/OnboardingWizard.tsx`）
- 新增 `autoFetchSigRef`：记录已自动拉过的 `baseUrl\0apiKey\0providerKind` 签名，去重。
- 新增 `maybeAutoFetchModels()`：`canTest && !fetchingModels && apiKey 非空 && models.length===0 && sig≠上次` → 置 ref + `handleFetchModels()`。不覆盖手填/已拉。
- BaseURL（DesignTextInput）与 Key（PasswordInput）加 `onBlur={maybeAutoFetchModels}`。
- 切预设 `handlePickPreset` 里重置 `autoFetchSigRef`（换端点要能重拉）。
- 模型区改造（P1 删旧）：
  - 「拉取可用模型」subtle 链接 → 重定义为「重新拉取」（IconRefresh），语义=补充/重试，不再是唯一主动作。
  - 加载态：`fetchingModels && models.length===0` → 渲染 Loader + 「正在拉取这个地址开放的模型…」框（替代空 TagsInput）。
  - placeholder 删「或先拉取可用模型」→「模型会自动拉取；也可手动输入 id 回车补充」。
  - 失败/空态：`fetchModelsMsg` 文案改人话「这个地址没自动列出模型，可手动输入模型 id，或重新拉取」，配 IconAlertTriangle 内联提示；手填 TagsInput 就地可用（无缝退化）。
  - 未识别折叠文案：「其余 N 个未识别模型（多为中转杂牌）」→「另有 N 个 Nomi 暂不认识的模型，可展开手动添加」（把不确定归给 Nomi，不让用户觉得填错）。
  - 已拉到时加轻量绿色「已添加 N 个」计数（样张拍板的安心反馈）。

### B. ByteString 人话下沉成共享单源（`electron/jsonUtils.ts`）
- 把 `findIllegalHeader`（现 vendorHttp 私有）**上移到 jsonUtils 并导出**，与 `findNonHeaderSafeChar` 同处。
- 新增 `describeIllegalHeader(problem) → { isAuth, message }`：单一人话措辞（auth 头 → 「API 密钥含非法字符（…）—— 请重新粘贴密钥」；非 auth → 「请求头 X …：含非法字符」）。三处共用，防漂移。

### C. 两条 handler 接入发送闸（`electron/ai/onboarding/onboardingIpc.ts`）
- `test-connection`：进探测循环前，`findNonHeaderSafeChar(apiKey)` + `findIllegalHeader(extraHeaders)`，命中即 `return { ok:false, error: describeIllegalHeader(...).message }`，不发 fetch。
- `list-models`：拼 headers 后、fetch 循环前，同样预检。

### D. vendorHttp 改用共享单源（`electron/vendor/vendorHttp.ts`）
- 删本地私有 `findIllegalHeader`，改 import jsonUtils 的；`requestJson` 守卫改用 `describeIllegalHeader`（保留 category=isAuth?auth:input、upstreamMsg=message）。措辞含「API 密钥含非法字符」前缀 → 现有 vendorHttp.test 断言不破。

## 不动项
- `onboardingSaveGate.ts`（自动填上 id 后 hasModelId 自然 true，置灰随之解除——根因在「没人帮他填」，不在门槛逻辑）。
- 「测试连接非阻断 / 仍要保存二次确认」那条已拍板设计（不合并测试与拉取，方向C 被否）。
- `handleFetchModels` 识别/分类/guessKinds 核心逻辑全复用，只换触发器。

## 回滚
单 commit，`git revert` 即回。UI 与 electron 改动独立，互不依赖。

## 验收门（报完成前）
1. 五门：`pnpm run gates` 全过。
2. 新增/更新单测：jsonUtils 的 `findIllegalHeader`/`describeIllegalHeader`；onboardingIpc 两 handler 脏 key 返人话（mock fetch 不被调用）。
3. R13 真机走查：打开「添加 AI 模型」→ 选 new-api → 填地址+Key 失焦 → 自动拉取转圈→列表出现→保存可点（截图人眼判断）；粘带全角字符的 key → 测试连接显示人话而非原始 ByteString。

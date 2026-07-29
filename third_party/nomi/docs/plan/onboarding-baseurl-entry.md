# 模型接入：手填供应商为主，读文档（加图片/视频）为辅

> 用户拍板：方案 **B**。手填供应商（BaseURL + key + 模型）做**主路径**（通用、破自举死锁、本地/文本可加）；保留"贴文档让 AI 读"作为**次要路径**，其本质就是**给"加图片/视频模型"用的**（那套读文档自己需要一个已配置的文本模型才能跑）。
>
> **两条路径按"目的"分，不按机制分**（更贴用户心智）：
> - 主：**添加模型 / 接入点**（手填，万能，能加你的第一个文本模型 → 破死锁）
> - 次：**添加图片 / 视频模型**（读文档自动配置；前置=已有一个文本模型，由主路径提供）
>
> 一个 modal，手填默认主路径，读文档降级为次要分支——不是平级两 tab（守规则1，不搞两套混杂）。

## 参考实现（已读真实源码）

`anomalyco/opencode`(生产级)的自定义供应商录入：`packages/app/src/components/dialog-custom-provider-form.ts` + `dialog-custom-provider.tsx`。结论照搬：
- **字段** = 供应商名 + BaseURL(`https?://`) + API Key + **模型列表**(每行 id+显示名,可加可删,默认一行) + 可选自定义请求头(key/value)。
- 产物 = `@ai-sdk/openai-compatible` 形状:`{ baseURL, headers?, models:{[id]:{name}} }`,key 单独存。
- **录入流里不强制联通性测试**:存完即用,错误真正调用时才暴露(本地/自定义端点对测试请求容忍度差异大)。Nomi 据此把"测过才落库"改为**可选「测试连接」按钮 + 不阻塞保存**(见 §1)。
- 一个供应商挂多个模型(Nomi vendor↔model 分离天然支持)。

## 0. 病因（为什么必须做）

现状 `OnboardingWizard` 唯一入口是"文档地址"——AI 爬官方文档页、抠 curl/参数、自动配置。三个硬伤：

1. **自举死锁**：读文档的 onboarding agent 自己需要一个已配置的文本模型（`chooseTextModel`，否则报"还没有配置用来阅读文档的 AI"）。→ **用户的第一个文本模型永远没法用这个 wizard 加**。
2. **本地模型加不上**：Ollama/vLLM/ComfyUI 的 `http://localhost:port` 返回 JSON/API，不是含 curl 示例的 HTML 文档页 → `fetch_raw_docs` 抠不到东西，后续全断。
3. **通用性反了**：绝大多数 agent 类工具接入模型填的是 BaseURL；现在把"读文档"这个取巧窄路径做成了唯一入口。

**关键事实**：对标准 OpenAI-compatible / 本地 text-chat 模型，整条 catalog 配置（providerKind=`openai-compatible`、auth=`bearer`、mapping=`POST /chat/completions` 标准体）**全是已知的、确定的**，根本不需要 AI 读文档。读文档的真实价值只在**非标准图片/视频 vendor**（奇怪自定义 API）——那条保留。

## 1. 范围（动什么）

### 后端
- 新增主进程 IPC `nomi:onboarding:manual-commit`（preload 暴露 `bridge.onboarding.manualCommit`）：
  - 入参（对齐 opencode 形状）：`{ vendorName, baseUrl, apiKey, models: Array<{ id: string; displayName?: string }> }`。
  - 行为：对每个 model **确定性**拼一个最小 `outcome.draft`（targetKind=`text`、providerKind=`openai-compatible`、auth `bearer`、`mappingCreate` = 标准 `POST /chat/completions`），调**现有** `commitOnboardedModelToCatalog({ outcome, userApiKey: apiKey })` 落库。N 个模型 = 同一 vendor + N 次 model upsert（复用单一落库函数，**不另开写库路径**，规则1）。
  - **不在落库流里强制测试**（对齐 opencode：本地/自定义端点对测试请求容忍度差异大，强测反而挡住合法模型）。保存即写入。
- 可选 IPC `nomi:onboarding:test-connection`：`POST {baseUrl}/chat/completions` 最小请求（`messages:[{role:'user',content:'ping'}], max_tokens:1`），返回结构化 ok/错误，**仅供前端「测试连接」按钮调用，不阻塞保存**（诚实呈现结果，不假成功）。
- vendorKey 由 baseUrl host 推导 + 去重；modelKey = 用户填的模型 id。
- （可选增强，标二期）`nomi:onboarding:list-models`：`GET {baseUrl}/v1/models` 拉可用模型列表填进模型行，失败则回退手填。

### 前端 `OnboardingWizard.tsx`
- `input` 阶段重构为**主手填表单**（字段对齐 opencode）：
  - `供应商名称` + `接入地址(BaseURL)` + `API Key` + **模型列表**（每行 `模型 id` + 可选`显示名`，`+ 添加模型`可加多行、可删，默认一行）。
  - 可选 `自定义请求头`（key/value 列表）——**首版可省**，标二期（Nomi vendor schema 目前只有 authHeader/authQueryParam，不支持任意 header，需扩 schema，超本次范围）。
  - 一个 `测试连接` 次要按钮（调 `test-connection`，显示真实结果，**不阻塞保存**）。
  - 主按钮 `保存` → 调 `manualCommit`（不强测）→ success（"已添加 N 个模型"）/error。
- **次要分支**（克制，非平级 tab）：表单下方一行安静链接——
  "要加**图片 / 视频模型**？→ 让 AI 读文档自动配置"
  点击切到**现有**文档地址表单（即当前那套 + agent loop，原样保留）。该路径前置=已有文本模型，由主路径提供 → 死锁解除。
- success/error 复用现有组件与文案风格。
- 文案与 token：全部 token-only，复用 `DesignModal`/`DesignTextInput`/`PasswordInput`/`DesignButton`/`DesignIconButton(trash)`；模型行的"加/删行"用现有按钮，不新增组件（§9 不触发；若模型行抽成可复用 `ModelRow` 再按 §9 登记）。

## 2. 不动什么
- **不动读文档 agent 内部**（`electron/ai/onboarding/agent.ts` / `tools.ts` / `specExtractors.ts` / `curlBlueprint.ts` / `docExtractors.ts` / `systemPrompt.ts`）——只是从"唯一入口"降级为"次要入口"，逻辑零改。
- 不动 catalog 持久化格式 / schema；不动 `commitOnboardedModelToCatalog` 内部（只新增调用方）。
- 不动 `requestPipeline` / 模型目录格式 / 供应商接入。
- 不动 `agent-foundation.md` 那条线（独立工作流）。
- 手填路径**首版只做 text/chat openai-compatible**；本地图片/视频走读文档，留二期。

## 3. 回滚策略
- 单 commit。出问题 `git revert` 即回到"只有文档地址"。
- 后端为纯新增 IPC + 复用现有落库函数；前端 input 阶段改动集中在一个文件，易回退。

## 4. 验收门
1. `tsc -p electron/tsconfig.json` + `pnpm build` + `pnpm test` 全绿。
2. **破自举死锁（肉眼）**：在**零文本模型**的干净状态下，用手填成功加一个文本模型（如本地 Ollama `http://localhost:11434/v1` 或任一 openai-compatible 端点）→ 该模型出现在目录、可被节点选中；之后"加图片/视频模型"的读文档路径能跑起来（前置文本模型已就位）。
3. **多模型一次加**：一个供应商下填多行模型 id → 一次保存全部落库。
4. **读文档路径仍可用**：次要分支切过去，原文档地址流程不回归。
5. **测试不阻塞、不撒谎**：`测试连接`按钮显示真实 ok/失败；保存不被测试结果阻塞（对齐 opencode）。
6. **设计纪律**：token-only（grep 无新 hex / 随意 px / 非 Tabler 图标）；复用现有 `src/design` 组件；无新组件需 §9 登记。
7. **规则1**：无并行死代码；读文档路径是被显式保留的次要分支，不是被替代的旧物。

## 5. 风险与取舍
- **连通性测试的最小请求体** → 不同 openai-compatible 端点对 `max_tokens`/`stream` 容忍度不一；用最保守的最小体（`messages:[{role:'user',content:'ping'}], max_tokens:1`），失败信息透传给用户。
- **GET /v1/models 不通用** → 列为可选增强，主路径用手填模型名，不阻塞首版。
- **vendorKey 去重** → host 相同但 key/模型不同的情况，沿用现有 vendor + 追加 model（复用 upsert 的 upsert 语义）。

## 6. 执行结果（回填 2026-06-02）

已实现并通过验收门 1（`tsc -p electron/tsconfig.json` + `pnpm build` + `pnpm test` 全绿，404 测试通过）。

**后端**
- `electron/runtime.ts`：
  - `commitOnboardedModelToCatalog` 加可选 `addedVia?: "agent" | "manual"`（默认 `agent`），手填路径传 `manual`，provenance 诚实记录。
  - 新增 `deriveVendorKeyFromBaseUrl(baseUrl)`：从 host 推导 vendorKey；`localhost/127.0.0.1/0.0.0.0` 带端口（`local-11434`）避免多个本地端点撞成一个 vendor。
  - 新增 `commitManualOpenAiCompatibleModels({ vendorName, baseUrl, apiKey, models[] })`：去重模型 id、逐个拼确定性 `outcome.draft`（targetKind=text、openai-compatible、bearer）、复用单一落库函数 `commitOnboardedModelToCatalog`。**关键修正**：文本/chat 模型走 **直连 AI SDK 路径**（`buildAiSdkModel`→`createOpenAICompatible`），不经 catalog HTTP mapping，故**不再伪造 `/chat/completions` mapping**（那会是永不被消费的死数据，违反规则2）。落库实体 = vendor + apiKey + model(kind=text)，足以破死锁（`resolveOnboardingAgentFromCatalog` 只需这些）。
- `electron/main.ts`：注册 `nomi:onboarding:manual-commit`（调上面函数，返回 `{ok, vendorKey, committed[]}`）+ `nomi:onboarding:test-connection`（`POST {baseUrl}/chat/completions` 最小体 `max_tokens:1`，12s 超时，**仅诚实返回 ok/错误，不阻塞保存**）。

**前端**
- `electron/preload.ts` + `src/desktop/bridge.ts`：暴露 `bridge.onboarding.manualCommit` + `testConnection`（带完整类型）。
- `src/ui/onboarding/OnboardingWizard.tsx`：`input` 阶段分 `inputMode: 'manual' | 'docs'`。
  - **主**（manual，默认）：供应商名 + 接入地址(BaseURL，带 `https?://` 校验) + API Key + 模型行（id + 可选显示名，`添加模型`/`删除行`，默认一行）+ `测试连接`（非阻塞，显真实结果）+ `保存`→`manualCommit`→success（"N 个模型已添加"）。
  - **次**（docs，安静链接"要加图片/视频模型？让 AI 读文档自动配置 →"切入）：**原文档地址流程原样保留**（`handleStart`/`onboarding.start`/milestone 流零改），加一行返回链接 + 前置说明。
  - 复用 `DesignModal`/`DesignTextInput`/`PasswordInput`/`DesignButton` + Mantine `ActionIcon` + Tabler `IconPlus`/`IconTrash`（对齐 OnboardingDrawer 既有用法），无新组件。

**设计纪律**：grep 确认无新 hex、颜色全 token（`var(--nomi-*)`）、图标全 Tabler。
**规则1**：读文档路径是显式保留的次要分支（`inputMode==='docs'` 可达），非死代码；旧单一文档入口已被完全替换。

**与计划的偏差（有据）**：§1 原写"mappingCreate = 标准 POST /chat/completions"。落地时核对真实架构发现文本模型不经 mapping 消费，故省略该 mapping——否则是不被消费的死数据。其余按计划。

**仍待**：①「测试连接」用了 `gpt-3.5-turbo` 作默认 modelId（当首行模型 id 为空时）——本地端点可能不识别，但 12s 超时 + 诚实报错可接受，二期可改为必填首个模型 id 再测。②首次进入的"零文本模型门控"（一打开/点项目即引导加文本模型）——本次只解了死锁的**能力**前提（手填可加第一个文本模型），**引导时机**的 UX 设计未做，留下一步。③可选 `list-models`（GET /v1/models）—— 标二期未做。

## 7. 兼容扩展（方案 A，2026-06-02 第二轮）

> 用户指出端点形状不止一种（原生 Claude 的 `/v1/messages` 与 OpenAI 系 `/chat/completions` 不同；部分中转要自定义认证头）。核对真实代码：Nomi 底层 `buildAiSdkModel` **本就支持 `openai-compatible` 与 `anthropic` 两种线形**，只是手填表单没暴露。opencode 的自定义表单靠「openai-compatible + 自定义 headers」当逃生口，但它其实搞不定原生 Claude（Anthropic 在 opencode 是内置供应商）。Nomi 比它更有优势——把已有的 anthropic 线接到表单即可。

**做什么（两块）**
1. **供应商类型选择**：表单加「OpenAI 兼容（默认）/ Anthropic 原生」。原生 Claude → `providerKind=anthropic`、`auth=x-api-key`、baseUrl 留空默认 `https://api.anthropic.com`。底层 `buildAiSdkModel` 的 anthropic 分支已就绪，零新增线形代码。
2. **自定义请求头**：表单加可选 header 列表（key/value，可加可删）。存进 `vendor.meta.extraHeaders`（**不迁移 schema**，meta 字段本就是 `unknown` 且已持久化）。

**关键：header 必须在"真正用模型"那条路生效**，否则填了没用。`buildAiSdkModel` 新增可选 `headers`，透传给 `createOpenAICompatible({headers})` / `createAnthropic({headers})`。runtime 抽出单一 `buildLanguageModelForVendor(vendor, model, apiKey)`，读 `vendor.meta.extraHeaders` 并替换原本重复在 `runAgentChat` / `runAgentChatV2` 两处的 vendor→input 逻辑（消重，规则1）。读文档 agent 经 `resolveOnboardingAgentFromCatalog` 也带上 extraHeaders。

**测试连接随类型变**：anthropic → `POST {baseUrl}/v1/messages`（`x-api-key` + `anthropic-version: 2023-06-01` + 最小 messages 体）；openai → 原 `/chat/completions`。两者都叠加自定义 header。仍非阻塞。

**改动文件**：`buildAiSdkModel.ts`（headers 参数）、`runtime.ts`（helper + 两处调用收敛 + commit 透传 vendorMeta + commitManual 收 providerKind/headers/anthropic 默认 + resolveOnboardingAgent 带 extraHeaders）、`main.ts`（manual-commit 收 providerKind/headers；test-connection 按类型分支）、`preload.ts`+`bridge.ts`（类型）、`onboarding/agent.ts`（透传 headers）、`OnboardingWizard.tsx`（类型 Select + header 行）、`runtime.manual-onboarding.test.ts`（补 anthropic + headers 落 meta 的断言）。

### 执行结果（回填 2026-06-02 第二轮）

全部落地，验收门全绿：

- **`buildAiSdkModel.ts`**：`BuildAiSdkModelInput` 加可选 `headers`；新增 `sanitizeHeaders`（trim + 丢空）后透传给 `createOpenAICompatible({headers})` / `createAnthropic({headers})`。
- **`runtime.ts`**：新增导出 `extractVendorExtraHeaders(vendor)`（读 `vendor.meta.extraHeaders`）；新增 `buildLanguageModelForVendor(vendor, model, apiKey)` 单一构造路径，**`runAgentChat`+`runAgentChatV2` 两处重复的 vendor→input 块已物理删除并收敛到此**（规则 1）。`commitOnboardedModelToCatalog` 透传 `draft.vendorMeta`。`commitManualOpenAiCompatibleModels` 收 `providerKind`/`headers`：anthropic 空 BaseURL 自动填 `https://api.anthropic.com`（保证 vendor 始终有具体 baseUrlHint，commit + 读文档路径都要求非空）、auth 落 `x-api-key`、headers 清洗后落 `vendorMeta.extraHeaders`。`resolveOnboardingAgentFromCatalog` 返回值带 `extraHeaders`。
- **`main.ts`**：manual-commit 透传 providerKind/headers；test-connection 按类型分支（anthropic → `POST {baseUrl}/v1/messages` + `x-api-key` + `anthropic-version: 2023-06-01`，模型默认 `claude-3-5-haiku-latest`；openai → 原 `/chat/completions`），两路都叠加自定义 header，仍非阻塞。onboarding:start 把 `fromCatalog.extraHeaders` 接进 agent。
- **`agent.ts`**：`agent` 入参加可选 `extraHeaders`，透传给 `buildAiSdkModel`。
- **`bridge.ts`**：manualCommit/testConnection 类型加 `providerKind?` + `headers?`。`preload.ts` 因 payload 为 `unknown` 无需改（一度误加重复 testConnection，已删回）。
- **`OnboardingWizard.tsx`**：加「OpenAI 兼容 / Anthropic 原生」`SegmentedControl`；BaseURL 文案/校验随类型变（anthropic 允许留空）；自定义请求头按需出现（默认 0 行 +「添加请求头（可选）」按钮，不污染常见路径，符合规则 2）；providerKind/headers 透传给两个 bridge 调用。
- **测试**：`runtime.manual-onboarding.test.ts` 补 anthropic（空 BaseURL→官方 host、authType=x-api-key、agent 带 anthropic kind）与 headers 落 `vendor.meta.extraHeaders` + agent 带 extraHeaders 两条；`buildAiSdkModel.test.ts` 补 headers 不破坏构造一条。

**验收门**：`npx tsc -p electron/tsconfig.json --noEmit` 0 错；`pnpm build`（vite + electron tsc）绿；`npx vitest run electron/` **34 文件 / 316 测试全过 + 1 todo**。

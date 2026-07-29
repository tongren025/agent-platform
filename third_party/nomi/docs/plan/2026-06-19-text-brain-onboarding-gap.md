# 文本大脑接入断层修复（Issue #9）

> 状态：方案已拍板，待实现。
> 关联 issue：[#9 我已经接入了模型，但无法使用](https://github.com/<repo>/issues/9)（与 #8「中转站加绘图/视频没文档不能接入」同主题两面）。
> 拍板：方案 C（默认播 + 一键兜底）；默认大脑 = `deepseek-v4-pro`（APIMart 真实 id）。

## 1. 问题 & 根因

**现象**：用户接好 APIMart（面板显示「已连通，14 个模型可用」），在创作助手点「梳理成分镜脚本」，报错：

> 拆镜头失败：No local text model is configured. Open model settings and add an API key.

**根因（分两层，P2 两层一起堵才算根治）**：

1. **缺大脑**：创作助手 / 拆镜头是 agent，主控需要一个 `kind === "text"` 的 LLM（[electron/ai/agentChatV2.ts:174-191](../../electron/ai/agentChatV2.ts) `chooseTextModel` 在 catalog 里找不到任何 enabled 的 text 模型就抛错）。而 APIMart 预置种子（[electron/catalog/seedBuiltins.ts:87-90](../../electron/catalog/seedBuiltins.ts) `APIMART_CURATED_MODELS`）**只播图片6/视频7/音频1，没有一个文本模型**——这是 2026-06-07 apimart 接入时刻意「不做文本模型」的决定（[docs/plan/2026-06-07-apimart-curated-onboarding.md:126](2026-06-07-apimart-curated-onboarding.md)）。

2. **死胡同报错**：报错是一句英文字符串塞进对话气泡（[src/workbench/creation/CreationAiPanel.tsx:182](../../src/workbench/creation/CreationAiPanel.tsx)），没有可恢复动作。面板上写着「已连通 14 个模型」，又说「没有文本模型」，自相矛盾，用户不知道还要去「添加模型」手填一个文本 LLM。

**关键事实（已核 R5）**：APIMart 本身提供 OpenAI 兼容的 chat（`https://api.apimart.ai/v1/chat/completions`，[docs.apimart.ai chat-completions](https://docs.apimart.ai/en/api-reference/texts/general/chat-completions)），真实 chat id 含 `gpt-5`/`gpt-5.1`/`gpt-5-mini`/`deepseek-v4-pro`/`deepseek-v3.2`/`claude-opus-4-8` 等。**用户手里那把 key 本就能驱动文本大脑**，Nomi 只是没把它接出来。代码侧已验证链路通：apimart vendor 默认 `providerKind=openai-compatible`（[electron/catalog/catalogStore.ts:238](../../electron/catalog/catalogStore.ts)），文本模型走 [electron/ai/vendorLanguageModel.ts](../../electron/ai/vendorLanguageModel.ts) `buildLanguageModelForVendor` 直连 `/v1/chat/completions`，**不需要 mapping**。

## 2. 方案（C = A + B）

### Part A — 给 APIMart 预置默认文本大脑（一个 key 全通，P4）

- 在 [electron/catalog/seedBuiltins.ts](../../electron/catalog/seedBuiltins.ts) 的 `APIMART_CURATED_MODELS` 追加一条：
  - `{ modelKey: "deepseek-v4-pro", labelZh: "DeepSeek V4 Pro", kind: "text" }`（**无 archetypeId**：text 模型不需要档案/mapping）。
  - 单源放在 apimart 种子文件里（新建 `electron/catalog/apimartTexts.ts` 或就近放常量），与图片/视频/音频同构，不另起并行版（P1）。
- `reconcileModels`（[seedBuiltins.ts:178](../../electron/catalog/seedBuiltins.ts)）以 `enabled: true` 插入；**幂等 + 漂移自愈** → 已接 APIMart 的用户（含本上报者）下次启动 app 自动补上大脑，无需重新接入。
- 选定模型 `deepseek-v4-pro`：APIMart 真实 id、便宜、中文好。模型 id 即 `model.modelAlias || model.modelKey`，此处 modelKey 直接是 API id，无需 alias。
- `chooseTextModel` 的降权正则 `AUTO_TEXT_MODEL_DEPRIORITIZE`（vision/preview/audio/…）不命中 deepseek，会被正常选中。
- **面板零改动**：[src/ui/onboarding/ModelChipGroups.tsx:16-17](../../src/ui/onboarding/ModelChipGroups.tsx) `KIND_ORDER` 已含 `text`（排第一），新增后面板自动多一行「文本 1」，「14」→「15」。

### Part B — 一键兜底报错卡（替掉死胡同英文串，覆盖一切入口）

替掉「No local text model is configured」英文串，让任何「连了供应商但没文本模型」的入口都有救（A 没覆盖到的：用户禁用了大脑 / 只接了纯生成的 vendor / 只填了图片 key 的自定义中转）。

1. **机器可识别的错误码（P2 不靠字符串匹配）**：`chooseTextModel` 抛带稳定码的错误，定义共享常量 `NO_TEXT_MODEL`（如 `throw new NoTextModelError()`，或 `Error("NO_TEXT_MODEL: …")` 前缀）。两条入口路径都带上：
   - storyboard 路径（thrown error，[CreationAiPanel.tsx:177-185](../../src/workbench/creation/CreationAiPanel.tsx)）
   - 通用对话路径（agent event `{ type: "error" }`，[agentChatV2.ts:217](../../electron/ai/agentChatV2.ts) 扩 optional `code`）
2. **可点卡片**（替代纯 error 气泡）：识别到 `NO_TEXT_MODEL` 码时渲染一张卡，而非把英文塞进 `AssistantMessageView`。卡片内容：
   - 标题：**创作助手还缺一个文本大脑**
   - 人话：你接的是图片 / 视频生成模型，负责出画面；而拆镜头、对话、写文案需要一个**文本对话模型**当大脑。
   - 主动作 `[一键添加 DeepSeek V4 Pro]`：当存在已连通、可供 chat 的 vendor（如 apimart）时 → 调 catalog 写入/启用其文本种子并重试；否则隐藏。
   - 次动作 `[去模型设置]`：打开 onboarding 面板。
3. 卡片是**用户可见 UI** → 按 R8：先读设计系统 + 出可体验样张 + 用户拍板，再实现；实现后与样张逐项对账。

## 3. 不动什么

- 不动图片/视频/音频种子与 mapping 机制（只在 `APIMART_CURATED_MODELS` 加一行 text）。
- 不动 `chooseTextModel` 的选择/降权算法（只把抛错改成带码）。
- 不给 kie 播文本（kie.ai 以生成为主，未核实其 chat 供给）——只 apimart。
- 不改 OnboardingWizard 的手填文本模型入口（保留，仍是高级/其他供应商路径）。
- 不引入「免费内置大脑」（无 key 的全新用户仍需接 key，属更大 onboarding 议题，本轮不涉）。

## 4. 回滚策略

- Part A：移除 `APIMART_CURATED_MODELS` 里那一行 text 即回滚；种子幂等，回滚后老用户那条 enabled text 记录会残留（用户可手动删，或 reconcile 不主动删用户启用记录——可接受，无害）。
- Part B：错误码 + 卡片组件是新增；回退到原 `setError`/纯气泡渲染即可，互不耦合。

## 5. 验收门

- [x] **真实 E2E（接入即验证）✅ 已过**：`APIMART_E2E=1 node tests/ux/apimart-text-brain.e2e.mjs`（app 已配 key 自解密，驱动真实 chatV2 拆镜头）实测 `deepseek-v4-pro` 在 APIMart **chat=✓ tool_use=✓ 双通**（2026-06-19）。默认大脑选型坐实，无需退回 gpt-5。注：测试环境 GPU 崩 → launch 加 `--disable-gpu`（R13 已知坑）。
- [ ] 五门全过：`pnpm run gates`（filesize→tokens→lint→typecheck→test→build）。
- [ ] 单测：seedBuiltins 幂等/自愈测加「apimart 含 1 个 text 模型且 enabled」断言；老装机（无 text）reconcile 后补上 text 的回归。
- [ ] 真机走查（R13）：① 全新接 APIMart → 面板显示「文本 1」→ 创作助手「梳理成分镜脚本」直接跑通（不再报错）；② 模拟「禁用大脑」→ 出 Part B 卡片 → 点「一键添加」→ 重试成功；截图人眼判断。
- [ ] Part B 卡片与获批样张逐项对账（R8）。

## 6. 实现切片

| # | 切片 | 文件 | 验证 |
|---|---|---|---|
| S1 | Part A 种子 + 单测 | `electron/catalog/apimartTexts.ts`（新）、`seedBuiltins.ts`、`seedBuiltins.test.ts` | vitest 幂等/自愈 |
| S2 | 真实 E2E 验 deepseek-v4-pro tool_use | `tests/transport-spike/` | `APIMART_E2E=1` 跑通 |
| S3 | Part B 触发判定（改用真实目录状态，非错误码字符串匹配）| `CreationAiPanel.tsx`(useHasTextModel) | typecheck |
| S4 | Part B 卡片样张 → 拍板 → 实现 | `NoTextModelRecoveryCard.tsx`、`CreationAiPanel.tsx` | ✅ R8 对账 + R13 走查 |

S1+S2 可先落（纯后端，直接修复上报者的案例）；S3+S4 是体验加固，紧随其后。

## 7. 实现回填（2026-06-19）

- **S1+S2 ✅ 已并 main（commit d9b7ef0）**：apimart 种子加 deepseek-v4-pro 文本大脑 + 真实 E2E 验 chat/tool_use 双通 + 五门绿。
- **S3 触发判定调整（比原方案更稳，P2）**：不引入跨进程错误码，改由 `useHasTextModel` 查**真实目录状态**——`message.status==='error' && hasTextModel===false` 即「无大脑」，渲染恢复卡。不靠匹配英文报错串。
- **S4 卡片 ✅ 已实现 + 真机走查**：
  - 新组件 `src/workbench/ai/NoTextModelRecoveryCard.tsx`：身份行复用 `NomiIdentityRow`（统一 logo+「Nomi」字样，export 出来单一真相源 P1，不手搓）。
  - **一键启用是派生的，不 hardcode 模型描述符（P1）**：从目录找「供应商已配 key 但被禁用」的文本模型 → 一键启用它（读它自己 labelZh，如「启用 DeepSeek V4 Pro」）；找不到 → 只给「去模型设置」。比原样张「一键添加 DeepSeek V4 Pro」更稳（派生 vs 硬编码）。
  - 「黏住」收尾：一键启用后 `hasTextModel` 翻 true，用 `recoveryShownIds` 让卡片不被卸载、展示自己的「大脑已就位」done 态，不露旧报错文本。
  - 窄面板按钮竖排全宽不换行（真机实测主按钮原会换行 → 改 flex-col w-full whitespace-nowrap）。
  - **R13 走查**：禁用全部文本模型造无大脑态 → 创作助手发消息 → 恢复卡正确出现（截图 rc2-crop）→ 点「启用 DeepSeek V4 Pro」→ deepseek 真启用 + done 态（截图 rc-done-crop）。

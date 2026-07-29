// apimart 文本模型（创作助手 / 拆镜头的「大脑」）的 curated 种子。
//
// 为什么需要它（Issue #9 根因）：创作助手是 agent，主控需要一个 kind="text" 的 LLM
// （electron/ai/agentChatV2.ts:chooseTextModel）。apimart 早期接入只播了图片/视频/音频生成
// 模型，没播文本模型，于是用户「接好 apimart、显示已连通」却在拆镜头时撞
// 「No local text model is configured」。修复 = 把 apimart 本就提供的 chat 大脑接出来。
//
// apimart 本身是 OpenAI 兼容 chat（R5 已核：https://docs.apimart.ai/en/api-reference/texts/general/chat-completions）：
//   POST /v1/chat/completions  { model, messages, ... }   ——同步、标准形状。
// 故文本模型**不需要 create/query mapping**：agent 走 electron/ai/vendorLanguageModel.ts 的
// buildLanguageModelForVendor（apimart 默认 providerKind=openai-compatible → baseURL=/v1 → AI SDK
// 自动补 /chat/completions）。catalog 只需一条 kind="text" 的 Model 记录，modelKey 即 chat model id。
//
// 默认大脑 = deepseek-v4-pro：apimart 真实 id、便宜、中文好、tool_use 可用（接入即验证见
// docs/plan/2026-06-19-text-brain-onboarding-gap.md 验收门 S2）。用户可在「模型设置」自行加别的
// 文本模型（gpt-5 / claude-opus-4-8 等），chooseTextModel 会把用户启用的一并纳入选择池。

/** 一个 apimart 文本模型的 curated 定义（无 archetype / 无 mapping；modelKey = chat model id）。 */
export type ApimartTextModel = {
  modelKey: string;
  labelZh: string;
};

/** apimart 的 curated 文本模型（单源）。当前只播一个默认大脑；多模型由用户在设置里自助添加。 */
export const APIMART_TEXT_MODELS: ApimartTextModel[] = [
  { modelKey: "deepseek-v4-pro", labelZh: "DeepSeek V4 Pro" },
];

import type { ModelParameterControl } from "../modelCatalogMeta";
import type { ModelArchetype } from "./types";

// 声音档案（合 1 个 catalog 条目 + 2 模式，仿 HappyHorse：per-mode modelEnum 区分真实模型）。
// 用户在节点上用 ModeBar 切「配音生成 / 转写音频」——一个声音节点两用，无需选两个不同模型。
// 契约见 docs.apimart.ai/en/api-reference/audios/{tts,whisper-1}.md（R5）。
//   配音生成 speech    → 真模型 gpt-4o-mini-tts，POST /v1/audio/speech（文→音，二进制）
//   转写音频 transcribe → 真模型 whisper-1，      POST /v1/audio/transcriptions（音→文，multipart）

// 音色用 vendor 真名为主（P4），括注特征助选。
const VOICE_OPTIONS: ModelParameterControl["options"] = [
  { value: "alloy", label: "alloy · 中性" },
  { value: "echo", label: "echo · 男声·沉稳" },
  { value: "fable", label: "fable · 英伦·叙事" },
  { value: "onyx", label: "onyx · 男声·浑厚" },
  { value: "nova", label: "nova · 女声·活力" },
  { value: "shimmer", label: "shimmer · 女声·轻柔" },
];

const LANGUAGE_OPTIONS: ModelParameterControl["options"] = [
  { value: "", label: "自动检测" },
  { value: "zh", label: "中文" },
  { value: "en", label: "英文" },
  { value: "ja", label: "日文" },
  { value: "ko", label: "韩文" },
];

const SPEECH_PARAMS: ModelParameterControl[] = [
  { key: "voice", label: "音色", type: "select", options: VOICE_OPTIONS, defaultValue: "alloy" },
  { key: "speed", label: "语速", type: "number", options: [], min: 0.25, max: 4, defaultValue: 1 },
];

const TRANSCRIBE_PARAMS: ModelParameterControl[] = [
  { key: "language", label: "语言", type: "select", options: LANGUAGE_OPTIONS, defaultValue: "" },
];

export const AUDIO_ARCHETYPE: ModelArchetype = {
  id: "nomi-audio",
  family: "nomi-audio",
  label: "声音",
  kind: "audio",
  defaultModeId: "speech",
  transportTaskKind: "text_to_audio",
  identifierPatterns: ["nomi-audio"],
  modes: [
    {
      id: "speech",
      intent: "text",
      vendorTerm: "配音生成",
      hint: "文字转语音（最多 4096 字）",
      promptRequired: true,
      transportTaskKind: "text_to_audio",
      modelEnum: "gpt-4o-mini-tts",
      slots: [],
      params: SPEECH_PARAMS,
    },
    {
      id: "transcribe",
      intent: "single",
      vendorTerm: "转写音频",
      hint: "音频转文字（≤25MB）",
      promptRequired: false,
      transportTaskKind: "transcribe",
      modelEnum: "whisper-1",
      // audio_ref 用默认数组槽（asArray，paramKey reference_audio_urls）→ 渲染为可上传/拖入的参考块；
      // max 1（whisper 单文件）。runner 取 reference_audio_urls[0] 作 multipart 的 file。
      slots: [{ kind: "audio_ref", label: "音频", min: 1, max: 1 }],
      params: TRANSCRIBE_PARAMS,
    },
  ],
};

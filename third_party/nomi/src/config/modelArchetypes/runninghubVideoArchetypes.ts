import type { ModelParameterControl } from "../modelCatalogMeta";
import type { ModelArchetype, ArchetypeMode } from "./types";

// RunningHub 视频模型档案（apimart 兼容集：Veo3.1 / Kling3.0 / Wan2.7 / Hailuo2.3 / Sora2）。
// 均为 RunningHub 专属档案（按端点路由，不复用 kie/apimart 的变体轴档案）；参数+options 逐字照官方
// 注册表 models_registry.json。i2v 图字段名各模型不同 → 各槽 inputKey 对齐其 API 字段（不脑补）。
const opt = (values: string[]): ModelParameterControl["options"] => values.map((value) => ({ value, label: value }));
const bool = (key: string, label: string, defaultValue = true): ModelParameterControl => ({ key, label, type: "boolean", options: [], defaultValue });
const sel = (key: string, label: string, values: string[], defaultValue: string): ModelParameterControl => ({ key, label, type: "select", options: opt(values), defaultValue });

const textMode = (params: ModelParameterControl[]): ArchetypeMode => ({
  id: "text", intent: "text", vendorTerm: "文生视频", hint: "文字描述生成视频", promptRequired: true, slots: [], params, transportTaskKind: "text_to_video",
});
// 单帧（仅首帧）或首尾帧 i2v 模式。firstKey/lastKey = 各模型 API 图字段名。
const imageMode = (params: ModelParameterControl[], firstKey: string, lastKey?: string): ArchetypeMode => ({
  id: "image", intent: lastKey ? "firstlast" : "single", vendorTerm: "图生视频", hint: lastKey ? "首帧（可选尾帧）生成视频" : "首帧生成视频", promptRequired: false,
  slots: lastKey
    ? [{ kind: "first_frame", label: "首帧", min: 1, max: 1, inputKey: firstKey }, { kind: "last_frame", label: "尾帧", min: 0, max: 1, inputKey: lastKey }]
    : [{ kind: "first_frame", label: "首帧", min: 1, max: 1, inputKey: firstKey }],
  params, transportTaskKind: "image_to_video",
});

// Veo 3.1（官方稳定版）
const VEO_PARAMS = [sel("resolution", "清晰度", ["720p", "1080p", "4k"], "720p"), sel("duration", "时长", ["4", "6", "8"], "8"), sel("aspectRatio", "比例", ["16:9", "9:16"], "16:9"), bool("generateAudio", "生成音频")];
export const RH_VEO_3_1_ARCHETYPE: ModelArchetype = {
  id: "rh-veo-3.1", family: "veo", label: "Veo 3.1 (RunningHub)", kind: "video", defaultModeId: "text", transportTaskKind: "text_to_video",
  identifierPatterns: ["rhart-video-v3.1-pro-official", "veo3.1-rh"],
  modes: [textMode(VEO_PARAMS), imageMode(VEO_PARAMS, "imageUrl", "lastImageUrl")],
};

// Kling V3.0 pro
// i2v 无 aspectRatio（比例由图决定）→ 图生模式独立参数集，对齐 create op body（不变量看门狗：声明=发送）。
const KLING_T_PARAMS = [sel("duration", "时长", ["3", "4", "5", "6", "8", "10"], "5"), sel("aspectRatio", "比例", ["1:1", "16:9", "9:16"], "16:9"), bool("sound", "生成音效")];
const KLING_I_PARAMS = [sel("duration", "时长", ["3", "4", "5", "6", "8", "10"], "5"), bool("sound", "生成音效")];
export const RH_KLING_3_ARCHETYPE: ModelArchetype = {
  id: "rh-kling-3.0", family: "kling", label: "可灵 3.0 (RunningHub)", kind: "video", defaultModeId: "text", transportTaskKind: "text_to_video",
  identifierPatterns: ["kling-v3.0-pro", "kling-v3.0-rh"],
  modes: [textMode(KLING_T_PARAMS), imageMode(KLING_I_PARAMS, "firstImageUrl", "lastImageUrl")],
};

// Wan 2.7
// i2v 无 aspectRatio → 图生模式独立参数集（不变量看门狗：声明=发送）。
const WAN_T_PARAMS = [sel("resolution", "清晰度", ["720P", "1080P"], "720P"), sel("duration", "时长", ["2", "3", "4", "5", "6", "8", "10"], "5"), sel("aspectRatio", "比例", ["16:9", "9:16", "1:1", "4:3", "3:4"], "16:9"), bool("promptExtend", "提示词扩写")];
const WAN_I_PARAMS = [sel("resolution", "清晰度", ["720P", "1080P"], "720P"), sel("duration", "时长", ["2", "3", "4", "5", "6", "8", "10"], "5"), bool("promptExtend", "提示词扩写")];
export const RH_WAN_2_7_ARCHETYPE: ModelArchetype = {
  id: "rh-wan-2.7", family: "wan", label: "Wan 2.7 (RunningHub)", kind: "video", defaultModeId: "text", transportTaskKind: "text_to_video",
  identifierPatterns: ["rh-wan-2.7"], // 唯一 id：避与旧 apimart wan-2.7 档案末段撞（modelKey 内部用，端点在 create path）
  modes: [textMode(WAN_T_PARAMS), imageMode(WAN_I_PARAMS, "firstImageUrl", "lastImageUrl")],
};

// Hailuo 2.3 standard
const HAILUO_PARAMS = [sel("duration", "时长", ["6", "10"], "6"), bool("enablePromptExpansion", "提示词扩写")];
export const RH_HAILUO_2_3_ARCHETYPE: ModelArchetype = {
  id: "rh-hailuo-2.3", family: "hailuo", label: "海螺 2.3 (RunningHub)", kind: "video", defaultModeId: "text", transportTaskKind: "text_to_video",
  identifierPatterns: ["rh-hailuo-2.3"], // 唯一 id：避与旧 apimart hailuo-2.3 档案末段撞
  modes: [textMode(HAILUO_PARAMS), imageMode(HAILUO_PARAMS, "imageUrl")],
};

// Sora 2（全能视频S 官方稳定版）。t2v 有 size，i2v 无 size（仅 duration）→ 两模式参数不同。
const SORA_T_PARAMS = [sel("size", "尺寸", ["720x1280", "1280x720"], "720x1280"), sel("duration", "时长", ["4", "8", "12"], "4")];
const SORA_I_PARAMS = [sel("duration", "时长", ["4", "8", "12"], "4")];
export const RH_SORA_2_ARCHETYPE: ModelArchetype = {
  id: "rh-sora-2", family: "sora", label: "Sora 2 (RunningHub)", kind: "video", defaultModeId: "text", transportTaskKind: "text_to_video",
  identifierPatterns: ["rhart-video-s-official", "sora-2-rh"],
  modes: [textMode(SORA_T_PARAMS), imageMode(SORA_I_PARAMS, "imageUrl")],
};

export const RUNNINGHUB_VIDEO_ARCHETYPES = [RH_VEO_3_1_ARCHETYPE, RH_KLING_3_ARCHETYPE, RH_WAN_2_7_ARCHETYPE, RH_HAILUO_2_3_ARCHETYPE, RH_SORA_2_ARCHETYPE];

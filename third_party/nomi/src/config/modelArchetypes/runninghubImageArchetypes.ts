import type { ModelParameterControl } from "../modelCatalogMeta";
import type { ModelArchetype, ArchetypeMode } from "./types";

// RunningHub 图片模型档案（apimart 兼容集：Seedream4.5 / NanoBanana / GPT Image2 / Qwen-Image2.0）。
// RunningHub 专属档案；参数+options 逐字照官方注册表。改图(image_edit)源图字段统一 imageUrls（数组），
// 用 image_ref 槽 + inputKey=imageUrls（本地图经 ANON_UPLOAD 自动传公网）。
const opt = (values: string[]): ModelParameterControl["options"] => values.map((value) => ({ value, label: value }));
const sel = (key: string, label: string, values: string[], defaultValue: string): ModelParameterControl => ({ key, label, type: "select", options: opt(values), defaultValue });
const bool = (key: string, label: string, defaultValue = true): ModelParameterControl => ({ key, label, type: "boolean", options: [], defaultValue });

const t2iMode = (params: ModelParameterControl[]): ArchetypeMode => ({
  id: "text", intent: "text", vendorTerm: "文生图", hint: "文字描述生成图片", promptRequired: true, slots: [], params, transportTaskKind: "text_to_image",
});
// maxImages：改图参考图上限。默认 1（保守，RunningHub 各端点上限多数 SPA 文档抓不到、未验证）；
// 仅对 firsthand 拿到契约的端点放宽（Qwen-Image edit = 1–3 图，api-448184489 逐字验过）。
const editMode = (params: ModelParameterControl[], maxImages = 1): ArchetypeMode => ({
  id: "edit", intent: "edit", vendorTerm: "改图", hint: maxImages > 1 ? "上传/连接图编辑（多图主体融合）" : "上传/连接一张图编辑", promptRequired: true,
  slots: [{ kind: "image_ref", label: "原图", min: 1, max: maxImages, inputKey: "imageUrls" }], params, transportTaskKind: "image_edit",
});

const SEEDREAM_PARAMS = [sel("resolution", "清晰度", ["2k", "4k"], "2k")];
export const RH_SEEDREAM_ARCHETYPE: ModelArchetype = {
  id: "rh-seedream-4.5", family: "seedream", label: "Seedream 4.5 (RunningHub)", kind: "image", defaultModeId: "text", transportTaskKind: "text_to_image",
  identifierPatterns: ["seedream-v4.5", "seedream-4.5-rh"],
  modes: [t2iMode(SEEDREAM_PARAMS), editMode(SEEDREAM_PARAMS)],
};

const NANO_PARAMS = [sel("aspectRatio", "比例", ["auto", "1:1", "16:9", "9:16", "4:3", "3:4", "3:2", "2:3", "21:9"], "1:1")];
export const RH_NANO_BANANA_ARCHETYPE: ModelArchetype = {
  id: "rh-nano-banana", family: "nano-banana", label: "Nano Banana (RunningHub)", kind: "image", defaultModeId: "text", transportTaskKind: "text_to_image",
  identifierPatterns: ["rhart-image-v1", "nano-banana-rh"],
  modes: [t2iMode(NANO_PARAMS), editMode(NANO_PARAMS)],
};

const GPT_PARAMS = [sel("resolution", "清晰度", ["1k", "2k", "4k"], "2k"), sel("quality", "质量", ["low", "medium", "high"], "medium"), sel("aspectRatio", "比例", ["1:1", "3:2", "2:3", "3:4", "4:3", "16:9", "9:16"], "16:9")];
export const RH_GPT_IMAGE_2_ARCHETYPE: ModelArchetype = {
  id: "rh-gpt-image-2", family: "gpt-image", label: "GPT Image 2 (RunningHub)", kind: "image", defaultModeId: "text", transportTaskKind: "text_to_image",
  identifierPatterns: ["rhart-image-g-2-official", "gpt-image-2-rh"],
  modes: [t2iMode(GPT_PARAMS), editMode(GPT_PARAMS)],
};

// 改图无 promptExtend → 改图模式独立参数集（不变量看门狗：声明=发送）。
const QWEN_T_PARAMS = [sel("size", "尺寸", ["1024*1024", "1536*1536", "768*1152", "1152*768", "1280*720", "720*1280"], "1024*1024"), bool("promptExtend", "提示词扩写")];
const QWEN_E_PARAMS = [sel("size", "尺寸", ["1024*1024", "1536*1536", "768*1152", "1152*768", "1280*720", "720*1280"], "1024*1024")];
export const RH_QWEN_IMAGE_ARCHETYPE: ModelArchetype = {
  id: "rh-qwen-image-2.0", family: "qwen-image", label: "Qwen-Image 2.0 (RunningHub)", kind: "image", defaultModeId: "text", transportTaskKind: "text_to_image",
  identifierPatterns: ["rh-qwen-image-2.0"], // 唯一 id：避与旧 apimart qwen-image-2.0 档案末段撞
  modes: [t2iMode(QWEN_T_PARAMS), editMode(QWEN_E_PARAMS, 3)], // edit 1–3 图（firsthand api-448184489 验证）
};

export const RUNNINGHUB_IMAGE_ARCHETYPES = [RH_SEEDREAM_ARCHETYPE, RH_NANO_BANANA_ARCHETYPE, RH_GPT_IMAGE_2_ARCHETYPE, RH_QWEN_IMAGE_ARCHETYPE];

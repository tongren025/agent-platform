// RunningHub 视频模型（apimart 兼容集）：Seedance2.0 / Veo3.1 / 可灵3.0 / Wan2.7 / 海螺2.3 / Sora2。
// 端点 + body 参数逐字照官方注册表 models_registry.json；i2v 图字段名各模型不同（注释标）。
// 轮询/状态映射复用 runninghub3d 单源（P1）。本地图经通用 ANON_UPLOAD_CHAIN 自动传公网。
import type { HttpOperation, ProfileKind } from "./types";
import { RUNNINGHUB_VENDOR_SEED, RUNNINGHUB_QUERY_OP, RUNNINGHUB_STATUS_MAPPING, RUNNINGHUB_HDR } from "./runninghub3d";

const P = (s: string) => `{{request.params.${s}}}`;
const PROMPT = "{{request.prompt}}";
const op = (path: string, body: Record<string, unknown>): HttpOperation => ({ method: "POST", path, headers: RUNNINGHUB_HDR, body });

// 各模型 create ops（t2v / i2v）。i2v body 只发该端点接受的字段（注册表实证），不多塞。
const SEEDANCE_T2V = op("/bytedance/seedance-2.0-global/text-to-video", { prompt: PROMPT, resolution: P("resolution"), duration: P("duration"), ratio: P("ratio"), generateAudio: P("generateAudio") });
const SEEDANCE_I2V = op("/bytedance/seedance-2.0-global/image-to-video", { prompt: PROMPT, resolution: P("resolution"), duration: P("duration"), ratio: P("ratio"), generateAudio: P("generateAudio"), firstFrameUrl: P("firstFrameUrl"), lastFrameUrl: P("lastFrameUrl") });

const VEO_T2V = op("/rhart-video-v3.1-pro-official/text-to-video", { prompt: PROMPT, resolution: P("resolution"), duration: P("duration"), aspectRatio: P("aspectRatio"), generateAudio: P("generateAudio") });
const VEO_I2V = op("/rhart-video-v3.1-pro-official/image-to-video", { prompt: PROMPT, resolution: P("resolution"), duration: P("duration"), aspectRatio: P("aspectRatio"), generateAudio: P("generateAudio"), imageUrl: P("imageUrl"), lastImageUrl: P("lastImageUrl") });

const KLING_T2V = op("/kling-v3.0-pro/text-to-video", { prompt: PROMPT, duration: P("duration"), aspectRatio: P("aspectRatio"), sound: P("sound") });
const KLING_I2V = op("/kling-v3.0-pro/image-to-video", { prompt: PROMPT, duration: P("duration"), sound: P("sound"), firstImageUrl: P("firstImageUrl"), lastImageUrl: P("lastImageUrl") });

const WAN_T2V = op("/alibaba/wan-2.7/text-to-video", { prompt: PROMPT, resolution: P("resolution"), duration: P("duration"), aspectRatio: P("aspectRatio"), promptExtend: P("promptExtend") });
const WAN_I2V = op("/alibaba/wan-2.7/image-to-video", { prompt: PROMPT, resolution: P("resolution"), duration: P("duration"), promptExtend: P("promptExtend"), firstImageUrl: P("firstImageUrl"), lastImageUrl: P("lastImageUrl") });

const HAILUO_T2V = op("/minimax/hailuo-2.3/t2v-standard", { prompt: PROMPT, duration: P("duration"), enablePromptExpansion: P("enablePromptExpansion") });
const HAILUO_I2V = op("/minimax/hailuo-2.3/i2v-standard", { prompt: PROMPT, duration: P("duration"), enablePromptExpansion: P("enablePromptExpansion"), imageUrl: P("imageUrl") });

const SORA_T2V = op("/rhart-video-s-official/text-to-video", { prompt: PROMPT, size: P("size"), duration: P("duration") });
const SORA_I2V = op("/rhart-video-s-official/image-to-video", { prompt: PROMPT, duration: P("duration"), imageUrl: P("imageUrl") });

// labelZh 与现有 apimart/kie 同模型**精确一致**（不加「(RunningHub)」后缀）→ 模型选择器按规范化 label
// 去重合并成一条「N 家」，选中后用供应商下拉锁 RunningHub（治「一大堆/重复」，见 modelIdentity 去重）。
export const RUNNINGHUB_VIDEO_CURATED_MODELS = [
  { modelKey: "bytedance/seedance-2.0-global", labelZh: "Seedance 2.0", kind: "video" as const, archetypeId: "runninghub-seedance" },
  { modelKey: "rhart-video-v3.1-pro-official", labelZh: "Veo 3.1", kind: "video" as const, archetypeId: "rh-veo-3.1" },
  { modelKey: "kling-v3.0-pro", labelZh: "可灵 3.0", kind: "video" as const, archetypeId: "rh-kling-3.0" },
  { modelKey: "rh-wan-2.7", labelZh: "Wan 2.7", kind: "video" as const, archetypeId: "rh-wan-2.7" },
  { modelKey: "rh-hailuo-2.3", labelZh: "Hailuo 2.3", kind: "video" as const, archetypeId: "rh-hailuo-2.3" },
  { modelKey: "rhart-video-s-official", labelZh: "Sora 2", kind: "video" as const, archetypeId: "rh-sora-2" },
];

const mk = (id: string, taskKind: ProfileKind, modelKey: string, name: string, create: HttpOperation) => ({
  id, vendorKey: RUNNINGHUB_VENDOR_SEED.key, taskKind, modelKey, name, create, query: RUNNINGHUB_QUERY_OP, statusMapping: RUNNINGHUB_STATUS_MAPPING,
});

export const RUNNINGHUB_VIDEO_CURATED_MAPPINGS = [
  mk("seed-rh-seedance-global-t2v", "text_to_video", "bytedance/seedance-2.0-global", "Seedance 2.0 · 文生视频", SEEDANCE_T2V),
  mk("seed-rh-seedance-global-i2v", "image_to_video", "bytedance/seedance-2.0-global", "Seedance 2.0 · 图生视频", SEEDANCE_I2V),
  mk("seed-rh-veo31-t2v", "text_to_video", "rhart-video-v3.1-pro-official", "Veo 3.1 · 文生视频", VEO_T2V),
  mk("seed-rh-veo31-i2v", "image_to_video", "rhart-video-v3.1-pro-official", "Veo 3.1 · 图生视频", VEO_I2V),
  mk("seed-rh-kling3-t2v", "text_to_video", "kling-v3.0-pro", "可灵 3.0 · 文生视频", KLING_T2V),
  mk("seed-rh-kling3-i2v", "image_to_video", "kling-v3.0-pro", "可灵 3.0 · 图生视频", KLING_I2V),
  mk("seed-rh-wan27-t2v", "text_to_video", "rh-wan-2.7", "Wan 2.7 · 文生视频", WAN_T2V),
  mk("seed-rh-wan27-i2v", "image_to_video", "rh-wan-2.7", "Wan 2.7 · 图生视频", WAN_I2V),
  mk("seed-rh-hailuo23-t2v", "text_to_video", "rh-hailuo-2.3", "海螺 2.3 · 文生视频", HAILUO_T2V),
  mk("seed-rh-hailuo23-i2v", "image_to_video", "rh-hailuo-2.3", "海螺 2.3 · 图生视频", HAILUO_I2V),
  mk("seed-rh-sora2-t2v", "text_to_video", "rhart-video-s-official", "Sora 2 · 文生视频", SORA_T2V),
  mk("seed-rh-sora2-i2v", "image_to_video", "rhart-video-s-official", "Sora 2 · 图生视频", SORA_I2V),
];

// RunningHub 图片模型（apimart 兼容集）：Seedream4.5 / NanoBanana / GPT Image2 / Qwen-Image2.0。
// 端点 + body 参数逐字照官方注册表；改图源图字段统一 imageUrls（数组，image_ref 槽 inputKey=imageUrls）。
// 轮询/状态映射复用 runninghub3d 单源。图片结果走现有 image runner 路径（wantedKind=image）。
import type { HttpOperation, ProfileKind } from "./types";
import { RUNNINGHUB_VENDOR_SEED, RUNNINGHUB_QUERY_OP, RUNNINGHUB_STATUS_MAPPING, RUNNINGHUB_HDR } from "./runninghub3d";

const P = (s: string) => `{{request.params.${s}}}`;
const PROMPT = "{{request.prompt}}";
const op = (path: string, body: Record<string, unknown>): HttpOperation => ({ method: "POST", path, headers: RUNNINGHUB_HDR, body });

const SEEDREAM_T2I = op("/seedream-v4.5/text-to-image", { prompt: PROMPT, resolution: P("resolution") });
const SEEDREAM_I2I = op("/seedream-v4.5/image-to-image", { prompt: PROMPT, resolution: P("resolution"), imageUrls: P("imageUrls") });

const NANO_T2I = op("/rhart-image-v1/text-to-image", { prompt: PROMPT, aspectRatio: P("aspectRatio") });
const NANO_EDIT = op("/rhart-image-v1/edit", { prompt: PROMPT, aspectRatio: P("aspectRatio"), imageUrls: P("imageUrls") });

const GPT_T2I = op("/rhart-image-g-2-official/text-to-image", { prompt: PROMPT, aspectRatio: P("aspectRatio"), resolution: P("resolution"), quality: P("quality") });
const GPT_I2I = op("/rhart-image-g-2-official/image-to-image", { prompt: PROMPT, aspectRatio: P("aspectRatio"), resolution: P("resolution"), quality: P("quality"), imageUrls: P("imageUrls") });

const QWEN_T2I = op("/alibaba/qwen-image-2.0/text-to-image", { prompt: PROMPT, size: P("size"), promptExtend: P("promptExtend") });
const QWEN_EDIT = op("/alibaba/qwen-image-2.0/image-edit", { prompt: PROMPT, size: P("size"), imageUrls: P("imageUrls") });

// labelZh 与现有 apimart/kie 同模型**精确一致**（不加后缀）→ 选择器去重合并成「N 家」一条，供应商下拉锁家。
export const RUNNINGHUB_IMAGE_CURATED_MODELS = [
  { modelKey: "seedream-v4.5", labelZh: "Seedream 4.5", kind: "image" as const, archetypeId: "rh-seedream-4.5" },
  { modelKey: "rhart-image-v1", labelZh: "Nano Banana", kind: "image" as const, archetypeId: "rh-nano-banana" },
  { modelKey: "rhart-image-g-2-official", labelZh: "GPT Image 2", kind: "image" as const, archetypeId: "rh-gpt-image-2" },
  { modelKey: "rh-qwen-image-2.0", labelZh: "Qwen-Image 2.0", kind: "image" as const, archetypeId: "rh-qwen-image-2.0" },
];

const mk = (id: string, taskKind: ProfileKind, modelKey: string, name: string, create: HttpOperation) => ({
  id, vendorKey: RUNNINGHUB_VENDOR_SEED.key, taskKind, modelKey, name, create, query: RUNNINGHUB_QUERY_OP, statusMapping: RUNNINGHUB_STATUS_MAPPING,
});

export const RUNNINGHUB_IMAGE_CURATED_MAPPINGS = [
  mk("seed-rh-seedream45-t2i", "text_to_image", "seedream-v4.5", "Seedream 4.5 · 文生图", SEEDREAM_T2I),
  mk("seed-rh-seedream45-i2i", "image_edit", "seedream-v4.5", "Seedream 4.5 · 改图", SEEDREAM_I2I),
  mk("seed-rh-nano-t2i", "text_to_image", "rhart-image-v1", "Nano Banana · 文生图", NANO_T2I),
  mk("seed-rh-nano-edit", "image_edit", "rhart-image-v1", "Nano Banana · 改图", NANO_EDIT),
  mk("seed-rh-gpt2-t2i", "text_to_image", "rhart-image-g-2-official", "GPT Image 2 · 文生图", GPT_T2I),
  mk("seed-rh-gpt2-i2i", "image_edit", "rhart-image-g-2-official", "GPT Image 2 · 改图", GPT_I2I),
  mk("seed-rh-qwen2-t2i", "text_to_image", "rh-qwen-image-2.0", "Qwen-Image 2.0 · 文生图", QWEN_T2I),
  mk("seed-rh-qwen2-edit", "image_edit", "rh-qwen-image-2.0", "Qwen-Image 2.0 · 改图", QWEN_EDIT),
];

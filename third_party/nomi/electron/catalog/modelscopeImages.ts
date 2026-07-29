import type { HttpOperation, ProfileKind } from "./types";
import { MODELSCOPE_IMAGE_QUERY_OP, MODELSCOPE_STATUS_MAPPING } from "./modelscopeVendor";

// 魔搭图片模型的 curated 传输配方（单源）。形状 100% 来自真实 API 验证（见 modelscopeVendor.ts 注释）。
// 提交 op 只取 task_id（顶层）→ 进 poll 循环；poll/status 共用 modelscopeVendor 的 QUERY_OP + STATUS_MAPPING。

const CREATE_HEADERS = {
  Authorization: "Bearer {{user_api_key}}",
  "Content-Type": "application/json",
  "X-ModelScope-Async-Mode": "true",
};

/** 异步提交 op：model + prompt 固定，extraBody 补 size 等（undefined 键模板引擎丢弃）。 */
function imageCreateOp(extraBody: Record<string, unknown> = {}): HttpOperation {
  return {
    method: "POST",
    path: "/v1/images/generations",
    headers: CREATE_HEADERS,
    body: { model: "{{model.modelKey}}", prompt: "{{request.prompt}}", ...extraBody },
    response_mapping: { task_id: "task_id" },
    provider_meta_mapping: { task_id: "task_id" },
  };
}

/** 改图 op：输入图走 image_url（vendor inline-base64 把 nomi-local 转成 data URL 数组再铺进 body）。
 *  输出尺寸跟随输入图，故不带 size。真实 E2E 验证（Qwen-Image-Edit-2511，2026-06-19）。 */
function imageEditOp(): HttpOperation {
  return {
    method: "POST",
    path: "/v1/images/generations",
    headers: CREATE_HEADERS,
    body: { model: "{{model.modelKey}}", prompt: "{{request.prompt}}", image_url: "{{request.params.image_url}}" },
    response_mapping: { task_id: "task_id" },
    provider_meta_mapping: { task_id: "task_id" },
  };
}

const SIZE = "{{request.params.size}}"; // 像素 WxH，由档案 size 枚举给

/** 一个魔搭图片模型的 curated 定义（catalog 行 + 档案指针 + mapping）。 */
export type ModelscopeImageModel = {
  modelKey: string;
  labelZh: string;
  archetypeId: string;
  mappings: { id: string; taskKind: ProfileKind; name: string; create: HttpOperation }[];
};

// 全部 modelKey 经真实 API 逐个验证出图（2026-06-19）。文生图共用 modelscope-image 档案（像素 size），
// 改图用 modelscope-image-edit 档案（image_url data URL）。FLUX.1-dev 实测 40212 不可用，已剔除。
function t2iModel(modelKey: string, labelZh: string, slug: string): ModelscopeImageModel {
  return {
    modelKey,
    labelZh,
    archetypeId: "modelscope-image",
    mappings: [{
      id: `seed-modelscope-${slug}-text_to_image`,
      taskKind: "text_to_image",
      name: `${labelZh} · 文生图`,
      create: imageCreateOp({ size: SIZE }),
    }],
  };
}

export const MODELSCOPE_IMAGE_MODELS: ModelscopeImageModel[] = [
  t2iModel("Tongyi-MAI/Z-Image-Turbo", "Z-Image Turbo", "z-image-turbo"),
  t2iModel("Tongyi-MAI/Z-Image", "Z-Image", "z-image"),
  t2iModel("Qwen/Qwen-Image-2512", "Qwen-Image", "qwen-image"),
  t2iModel("black-forest-labs/FLUX.2-klein-9B", "FLUX.2 Klein", "flux2-klein"),
  t2iModel("black-forest-labs/FLUX.1-Krea-dev", "FLUX.1 Krea", "flux1-krea"),
  t2iModel("MAILAND/majicflus_v1", "majicFlus 写实", "majicflus"),
  {
    modelKey: "Qwen/Qwen-Image-Edit-2511",
    labelZh: "Qwen-Image 改图",
    archetypeId: "modelscope-image-edit",
    mappings: [{
      id: "seed-modelscope-qwen-image-edit-image_edit",
      taskKind: "image_edit",
      name: "Qwen-Image · 改图",
      create: imageEditOp(),
    }],
  },
];

export const MODELSCOPE_IMAGE_QUERY = MODELSCOPE_IMAGE_QUERY_OP;
export const MODELSCOPE_IMAGE_STATUS = MODELSCOPE_STATUS_MAPPING;

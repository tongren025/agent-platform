import type { HttpOperation } from "./types";

// 魔搭社区 ModelScope（api-inference）供应商种子。
// 真实 E2E 验证（2026-06-19，用户 key，Z-Image-Turbo / Qwen-Image-2512 出图）：
//   提交  POST /v1/images/generations  + header X-ModelScope-Async-Mode:true
//         → { "task_id": "...", "task_status": "SUCCEED"(=提交成功，非生成完成), "request_id": ... }
//   轮询  GET  /v1/tasks/{task_id}      + header X-ModelScope-Task-Type:image_generation
//         进行中 { "task_status":"RUNNING", "outputs":{} }
//         成功   { "task_status":"SUCCEED", "output_images":["https://...png"] }   ← 扁平字符串数组
//         失败   { "errors":{ "message":"..." } }
//   size 必须像素 "WxH"（"16:9" 会被拒）。
// baseUrl 裸（不带 /v1），path 自带 /v1（与 apimart 同约定，避 joinUrl 双前缀）。
export const MODELSCOPE_VENDOR_SEED = {
  key: "modelscope",
  name: "魔搭社区",
  baseUrl: "https://api-inference.modelscope.cn",
  authType: "bearer" as const,
  authHeader: "Authorization",
} as const;

// 状态归一：taskStatusFromResponse 读到 task_status 后 toLowerCase 再匹配（responseParsing.ts:87），
// 故这里写小写；魔搭返回大写 SUCCEED/RUNNING。"succeed"（无 d）不在通用词表里，必须显式声明。
export const MODELSCOPE_STATUS_MAPPING: Record<string, string[]> = {
  queued: ["pending", "queued"],
  running: ["running", "processing"],
  succeeded: ["succeed", "succeeded", "success"],
  failed: ["failed", "fail", "error", "canceled", "cancelled", "timeout", "revoked"],
};

// 图片轮询 op（所有魔搭图片模型共用）。task_id 走路径参数；图片在 output_images[0]（扁平 URL）。
export const MODELSCOPE_IMAGE_QUERY_OP: HttpOperation = {
  method: "GET",
  path: "/v1/tasks/{{providerMeta.task_id}}",
  headers: {
    Authorization: "Bearer {{user_api_key}}",
    "X-ModelScope-Task-Type": "image_generation",
  },
  response_mapping: {
    status: "task_status",
    image_url: "output_images.0",
    error_message: "errors.message",
  },
};

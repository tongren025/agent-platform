import { describe, expect, it } from "vitest";
import { MODELSCOPE_VENDOR_SEED, MODELSCOPE_IMAGE_QUERY_OP, MODELSCOPE_STATUS_MAPPING } from "./modelscopeVendor";
import { MODELSCOPE_IMAGE_MODELS } from "./modelscopeImages";
import { taskStatusFromResponse } from "../tasks/responseParsing";

// 形状锁：全部来自 2026-06-19 真实 API 验证（用户 key，Z-Image-Turbo / Qwen-Image 出图）。
// 真实抓到的响应样本——任何漂移都被这里钉住。
const POLL_RUNNING = { request_id: "", task_id: "t1", task_status: "RUNNING", outputs: {} };
const POLL_SUCCEED = { output_images: ["https://oss/x.png"], request_id: "r", task_id: "t1", task_status: "SUCCEED", time_taken: null };
const POLL_FAILED = { task_id: "t1", task_status: "FAILED", errors: { message: "boom" } };

describe("ModelScope 接入（真实 API 形状锁）", () => {
  it("vendor 种子：裸 baseUrl + bearer", () => {
    expect(MODELSCOPE_VENDOR_SEED.key).toBe("modelscope");
    expect(MODELSCOPE_VENDOR_SEED.baseUrl).toBe("https://api-inference.modelscope.cn");
    expect(MODELSCOPE_VENDOR_SEED.authType).toBe("bearer");
  });

  it("全部 curated 模型：异步提交头 + 顶层 task_id；文生图挂 image 档案、改图挂 edit 档案", () => {
    expect(MODELSCOPE_IMAGE_MODELS).toHaveLength(7);
    for (const model of MODELSCOPE_IMAGE_MODELS) {
      const create = model.mappings[0].create;
      expect(create.path).toBe("/v1/images/generations");
      expect(create.headers?.["X-ModelScope-Async-Mode"]).toBe("true");
      // 提交只取顶层 task_id → 进 poll；不在 create 里抽图。
      expect(create.response_mapping?.task_id).toBe("task_id");
      expect(create.provider_meta_mapping?.task_id).toBe("task_id");
    }
    const t2i = MODELSCOPE_IMAGE_MODELS.filter((m) => m.mappings[0].taskKind === "text_to_image");
    const edit = MODELSCOPE_IMAGE_MODELS.filter((m) => m.mappings[0].taskKind === "image_edit");
    expect(t2i).toHaveLength(6);
    expect(edit).toHaveLength(1);
    for (const m of t2i) expect(m.archetypeId).toBe("modelscope-image");
    // 改图：挂 edit 档案，body 带 image_url（参考图入参），无 size。
    expect(edit[0].archetypeId).toBe("modelscope-image-edit");
    const editBody = edit[0].mappings[0].create.body as Record<string, unknown>;
    expect(editBody.image_url).toBe("{{request.params.image_url}}");
    expect(editBody.size).toBeUndefined();
  });

  it("轮询 op：task_id 走路径 + image_generation 头 + output_images.0", () => {
    expect(MODELSCOPE_IMAGE_QUERY_OP.path).toBe("/v1/tasks/{{providerMeta.task_id}}");
    expect(MODELSCOPE_IMAGE_QUERY_OP.headers?.["X-ModelScope-Task-Type"]).toBe("image_generation");
    expect(MODELSCOPE_IMAGE_QUERY_OP.response_mapping?.status).toBe("task_status");
    expect(MODELSCOPE_IMAGE_QUERY_OP.response_mapping?.image_url).toBe("output_images.0");
  });

  it("真实响应经 runtime 解析器归一正确（不靠 asset 兜底）", () => {
    const rm = MODELSCOPE_IMAGE_QUERY_OP.response_mapping as Record<string, unknown>;
    // assetUrls 传 [] —— 证明是 STATUS_MAPPING 把大写 SUCCEED 归到 succeeded，而非 line99 的兜底。
    expect(taskStatusFromResponse(POLL_SUCCEED, rm, MODELSCOPE_STATUS_MAPPING, [])).toBe("succeeded");
    expect(taskStatusFromResponse(POLL_RUNNING, rm, MODELSCOPE_STATUS_MAPPING, [])).toBe("running");
    expect(taskStatusFromResponse(POLL_FAILED, rm, MODELSCOPE_STATUS_MAPPING, [])).toBe("failed");
  });
});

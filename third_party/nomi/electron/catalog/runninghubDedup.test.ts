// RunningHub 模型选择器去重不变量（治「一大堆/重复」根因，2026-06-27 用户点出）。
// 节点模型选择器按规范化 label 去重（modelIdentity.dedupeModelOptions）：同模型多家 → 1 条「N 家」。
// RunningHub 模型 label 若带「(RunningHub)」供应商后缀 → 规范化后与现有 apimart/kie 不匹配 → 不去重 →
// picker 出「可灵3.0」和「可灵3.0(RunningHub)」两条重复。本测试钉死:① RH label 不带供应商后缀；
// ② 同名模型与 apimart 规范化一致 → 真去重合并。任何人再加后缀即红。
import { describe, it, expect } from "vitest";
import { RUNNINGHUB_VIDEO_CURATED_MODELS } from "./runninghubVideos";
import { RUNNINGHUB_IMAGE_CURATED_MODELS } from "./runninghubImages";
import { dedupeModelOptions, normalizeModelLabel } from "../../src/config/modelIdentity";
import type { ModelOption } from "../../src/config/models";

const RH_MODELS = [...RUNNINGHUB_VIDEO_CURATED_MODELS, ...RUNNINGHUB_IMAGE_CURATED_MODELS];

describe("RunningHub 模型 label 去重不变量", () => {
  it("RH 模型 label 不带供应商后缀（否则破坏跨家去重 → picker 出重复条）", () => {
    for (const m of RH_MODELS) {
      expect(m.labelZh.toLowerCase()).not.toContain("runninghub");
      expect(m.labelZh).not.toContain("(");
    }
  });

  it("同名模型(RH + apimart)规范化 label 一致 → dedupeModelOptions 合并成 1 条 2 家", () => {
    // 取一个有 apimart 对应的代表：可灵 3.0。构造两家的 option，验去重。
    const mk = (vendor: string, modelKey: string, label: string): ModelOption => ({
      value: `${vendor}:${modelKey}`, label, modelKey, vendor,
      meta: { archetypeId: vendor === "runninghub" ? "rh-kling-3.0" : "kling-3.0" },
    } as unknown as ModelOption);
    const apimart = mk("apimart", "kling-v3", "可灵 3.0");
    const rh = RH_MODELS.find((m) => m.labelZh === "可灵 3.0")!;
    const rhOption = mk("runninghub", rh.modelKey, rh.labelZh);

    expect(normalizeModelLabel(apimart.label)).toBe(normalizeModelLabel(rhOption.label));
    const deduped = dedupeModelOptions([apimart, rhOption]);
    expect(deduped).toHaveLength(1); // 不是两条重复
    expect(deduped[0].providers.length).toBe(2); // 合并成「2 家」
  });
});

import type { ModelParameterControl } from "../modelCatalogMeta";
import type { ModelArchetype } from "./types";

// HappyHorse 1.1（apimart，阿里淘天 2026-06-23 发布）——照 docs.apimart.ai/en/api-reference/videos/happyhorse-1.1/generation.md 对账。
// 单一 model id `happyhorse-1.1`，上游按字段自动路由模式（first_frame_image → 图生 / image_urls 1–9 →
// 角色参考 / 仅 prompt → 文生），两媒体字段互斥——M2 按当前模式投影天然满足（非当前模式的键不进 body）。
// 与 kie 的 happyhorse(1.0) 档案分开：那套是 4 个 model enum 的老契约（happyhorse/text-to-video 等），
// 且 1.0 的 @image1…@image9 编号语法在 1.1 已不适用（官方明示 prompt「no special tokens」→ 不开
// characterIndexed，不做 @ 编号投影）。分辨率字段大写（720P/1080P），比例字段名是 size。

const opt = (values: string[]): ModelParameterControl["options"] => values.map((value) => ({ value, label: value }));

const RES: ModelParameterControl = { key: "resolution", label: "清晰度", type: "select", options: opt(["720P", "1080P"]), defaultValue: "1080P" };
const SIZE: ModelParameterControl = { key: "size", label: "比例", type: "select", options: opt(["16:9", "9:16", "1:1", "4:3", "3:4"]), defaultValue: "16:9" };
const DURATION: ModelParameterControl = { key: "duration", label: "时长(秒)", type: "number", options: [], min: 3, max: 15, defaultValue: 5 };
const SEED: ModelParameterControl = { key: "seed", label: "种子", type: "number", options: [], placeholder: "随机" };

export const HAPPYHORSE_1_1_ARCHETYPE: ModelArchetype = {
  id: "happyhorse-1.1",
  family: "happyhorse",
  label: "HappyHorse 1.1",
  kind: "video",
  defaultModeId: "t2v",
  transportTaskKind: "text_to_video",
  identifierPatterns: ["happyhorse-1.1", "happyhorse-1-1"],
  modes: [
    {
      id: "t2v",
      intent: "text",
      vendorTerm: "文生视频",
      hint: "纯文字生成视频",
      promptRequired: true,
      transportTaskKind: "text_to_video",
      slots: [],
      params: [RES, SIZE, DURATION, SEED],
    },
    {
      id: "i2v",
      intent: "single",
      vendorTerm: "图生视频",
      hint: "单张首帧图（无尾帧、无比例）",
      promptRequired: true,
      transportTaskKind: "image_to_video",
      slots: [{ kind: "first_frame", label: "首帧", min: 1, max: 1, inputKey: "first_frame_image" }],
      params: [RES, DURATION, SEED],
    },
    {
      id: "ref",
      intent: "character",
      vendorTerm: "角色参考",
      hint: "1–9 张参考图（人物/场景），模型自动融合",
      promptRequired: true,
      transportTaskKind: "image_to_video",
      slots: [{ kind: "image_ref", label: "参考图", min: 1, max: 9, inputKey: "image_urls" }],
      params: [RES, SIZE, DURATION, SEED],
    },
  ],
};

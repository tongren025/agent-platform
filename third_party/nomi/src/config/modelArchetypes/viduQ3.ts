import type { ModelParameterControl } from "../modelCatalogMeta";
import type { ModelArchetype } from "./types";

// Vidu Q3（apimart 独占）参考生视频档案（2026-07-29 照 docs.apimart.ai/en/api-reference/videos/vidu-q3/generation.md 对账）。
// 只有「参考生」一种模式：1–7 张参考图必填、外观由图决定（提示词写动作/运镜），**无纯文生模式**——
// 档案级 transportTaskKind 就是 image_to_video，catalog 只种一条 i2v mapping。
// 变体：标准 viduq3（时长 3–16s，540p/720p/1080p）/ Mix viduq3-mix（时长 1–16s、无 540p，1–2s 动作质量最佳）。
// SuperClue 参考生双榜第一（2026-04），正打跨镜身份一致性。

const opt = (values: string[]): ModelParameterControl["options"] => values.map((value) => ({ value, label: value }));

const PARAMS: ModelParameterControl[] = [
  { key: "duration", label: "时长(秒)", type: "number", options: [], min: 3, max: 16, defaultValue: 5 },
  { key: "resolution", label: "清晰度", type: "select", options: opt(["540p", "720p", "1080p"]), defaultValue: "720p" },
  { key: "aspect_ratio", label: "比例", type: "select", options: opt(["16:9", "9:16", "4:3", "3:4", "1:1"]), defaultValue: "16:9" },
  { key: "seed", label: "种子", type: "number", options: [], placeholder: "随机" },
];

// Mix 变体收窄/放宽（官方约束）：时长下限放宽到 1s；清晰度去掉 540p（Mix 不支持）。
// select 越界值由 applyArchetypeVariantSwitch 夹回默认（540p → 720p）。
const MIX_PARAM_OVERRIDES = {
  ref: (params: ModelParameterControl[]): ModelParameterControl[] =>
    params.map((p) => {
      if (p.key === "duration") return { ...p, min: 1 };
      if (p.key === "resolution") return { ...p, options: opt(["720p", "1080p"]) };
      return p;
    }),
};

export const VIDU_Q3_ARCHETYPE: ModelArchetype = {
  id: "vidu-q3",
  family: "vidu",
  label: "Vidu Q3",
  kind: "video",
  defaultModeId: "ref",
  transportTaskKind: "image_to_video",
  identifierPatterns: ["viduq3", "viduq3-mix", "vidu-q3"],
  modes: [
    {
      id: "ref",
      intent: "character",
      vendorTerm: "参考生视频",
      hint: "1–7 张参考图，主体一致性直出；外观由图决定，提示词写动作/运镜",
      promptRequired: true,
      transportTaskKind: "image_to_video",
      slots: [{ kind: "image_ref", label: "参考图", min: 1, max: 7, inputKey: "image_urls" }],
      params: PARAMS,
    },
  ],
  variants: [
    { id: "standard", label: "标准", modelKey: "viduq3" },
    { id: "mix", label: "Mix", modelKey: "viduq3-mix", identifierPatterns: ["viduq3-mix"], paramOverrides: MIX_PARAM_OVERRIDES },
  ],
  defaultVariantId: "standard",
};

import type { ModelParameterControl } from "../modelCatalogMeta";
import type { ModelArchetype } from "./types";

// 可灵 3.0 Turbo（apimart，快手 2026-06-17 发布）——照 docs.apimart.ai/en/api-reference/videos/kling-3.0-turbo/generation.md 对账。
// 与「可灵 3.0」主档案（kling.ts）分开建：Turbo 契约不同——无 mode 画质档（改 resolution 720p/1080p）、
// 无声效/负向提示，图生视频是**单张 first_frame_image 字符串**（无尾帧），模式由字段有无自动判定。
// 定位：快 + 便宜（¥0.8/秒），分镜草稿快速出片档。watermark 字段不发 = 默认无水印。

const opt = (values: string[]): ModelParameterControl["options"] => values.map((value) => ({ value, label: value }));

const T2V_PARAMS: ModelParameterControl[] = [
  { key: "aspect_ratio", label: "比例", type: "select", options: opt(["16:9", "9:16", "1:1"]), defaultValue: "16:9" },
  { key: "resolution", label: "清晰度", type: "select", options: opt(["720p", "1080p"]), defaultValue: "720p" },
  { key: "duration", label: "时长(秒)", type: "number", options: [], min: 3, max: 15, defaultValue: 5 },
];

// 图生视频：比例随首帧图自动决定（官方：aspect_ratio 被忽略）→ 不声明该参数（诚实 UI，不显示发不出去的控件）。
const I2V_PARAMS: ModelParameterControl[] = T2V_PARAMS.filter((p) => p.key !== "aspect_ratio");

export const KLING_3_TURBO_ARCHETYPE: ModelArchetype = {
  id: "kling-3.0-turbo",
  family: "kling",
  label: "可灵 3.0 Turbo",
  kind: "video",
  defaultModeId: "t2v",
  transportTaskKind: "text_to_video",
  identifierPatterns: ["kling-3.0-turbo", "kling-3-0-turbo", "kling3.0-turbo"],
  modes: [
    {
      id: "t2v",
      intent: "text",
      vendorTerm: "文生视频",
      hint: "纯文字生成视频",
      promptRequired: true,
      transportTaskKind: "text_to_video",
      slots: [],
      params: T2V_PARAMS,
    },
    {
      id: "i2v",
      intent: "single",
      vendorTerm: "图生视频",
      hint: "单张首帧图驱动（提示词可留空）",
      promptRequired: false,
      transportTaskKind: "image_to_video",
      slots: [{ kind: "first_frame", label: "首帧", min: 1, max: 1, inputKey: "first_frame_image" }],
      params: I2V_PARAMS,
    },
  ],
};

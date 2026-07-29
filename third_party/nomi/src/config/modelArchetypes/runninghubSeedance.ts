import type { ModelParameterControl } from "../modelCatalogMeta";
import type { ModelArchetype } from "./types";

// Seedance 2.0 经 RunningHub（标准版 global）。**RunningHub 专属档案**——不复用 kie/apimart 的 seedance-2
// 档案：那套按 body model-string + 变体轴（标准/fast）设计，而 RunningHub 的 fast 是另一个端点
// （seedance-2.0-global-fast），变体轴不适用 → 给 RunningHub 单独的无变体档案，参数+options 逐字照官方注册表。
const toOptions = (values: string[]): ModelParameterControl["options"] => values.map((value) => ({ value, label: value }));

const SEEDANCE_GLOBAL_PARAMS: ModelParameterControl[] = [
  { key: "resolution", label: "清晰度", type: "select", options: toOptions(["480p", "720p", "1080p", "2k", "4k"]), defaultValue: "720p" },
  { key: "duration", label: "时长", type: "select", options: toOptions(["4", "5", "6", "8", "10", "12"]), defaultValue: "5" },
  { key: "ratio", label: "比例", type: "select", options: toOptions(["adaptive", "16:9", "4:3", "1:1", "3:4", "9:16", "21:9"]), defaultValue: "adaptive" },
  { key: "generateAudio", label: "生成音频", type: "boolean", options: [], defaultValue: true },
];

export const RUNNINGHUB_SEEDANCE_ARCHETYPE: ModelArchetype = {
  id: "runninghub-seedance",
  family: "seedance",
  label: "Seedance 2.0 (RunningHub)",
  kind: "video",
  defaultModeId: "text",
  transportTaskKind: "text_to_video",
  identifierPatterns: ["bytedance/seedance-2.0-global", "seedance-2.0-global"],
  modes: [
    {
      id: "text",
      intent: "text",
      vendorTerm: "文生视频",
      hint: "文字描述生成视频",
      promptRequired: true,
      slots: [],
      params: SEEDANCE_GLOBAL_PARAMS,
      transportTaskKind: "text_to_video",
    },
    {
      id: "image",
      intent: "firstlast",
      vendorTerm: "图生视频",
      hint: "首帧（可选尾帧）生成视频",
      promptRequired: false,
      slots: [
        { kind: "first_frame", label: "首帧", min: 1, max: 1, inputKey: "firstFrameUrl" },
        { kind: "last_frame", label: "尾帧", min: 0, max: 1, inputKey: "lastFrameUrl" },
      ],
      params: SEEDANCE_GLOBAL_PARAMS,
      transportTaskKind: "image_to_video",
    },
  ],
};

import crypto from "node:crypto";
import { isJsonRecord, nowIso } from "../jsonUtils";
import { newapiImageEditProfileForModel } from "./newapiTransport";
import type { CatalogState } from "./types";

// 由内置 seed/repair 自己维护传输协议；relay catalog 迁移不得覆盖这些策展 vendor。
export const BUILTIN_VENDOR_KEYS = new Set(["kie", "apimart", "modelscope", "volcengine", "volcengine-speech", "runninghub"]);

/**
 * v5 → v6：把存量中转的改图协议从 vendor 级 generic mapping 拆成模型级精确 mapping。
 * v5 为所有图片模型统一补了 chat/completions；但同一中转里的 Grok Imagine 官方只接受 JSON
 * /v1/images/edits。这里保留 generic chat 给 Nano Banana 等模型，同时给已知不同协议的模型补
 * modelKey 精确项（selectTaskMapping 精确项优先）。只碰有 OpenAI images/generations 证据的自建中转。
 */
export function migrateRelayImageEditProtocols(state: CatalogState): { state: CatalogState; changed: boolean } {
  let changed = false;
  const models = [...state.models];
  const mappings = [...state.mappings];
  const t = nowIso();
  for (let i = 0; i < models.length; i += 1) {
    const model = models[i];
    if (model.kind !== "image" || BUILTIN_VENDOR_KEYS.has(model.vendorKey)) continue;
    const hasOpenAiImageShape = mappings.some(
      (mapping) => mapping.vendorKey === model.vendorKey && mapping.taskKind === "text_to_image" && /\/images\/generations$/.test(String(mapping.create?.path || "")),
    );
    if (!hasOpenAiImageShape) continue;
    const profile = newapiImageEditProfileForModel(model.modelKey, model.modelAlias);
    if (profile.protocol === "chat-completions-image-url") continue;

    const exactIndex = mappings.findIndex(
      (mapping) => mapping.vendorKey === model.vendorKey && mapping.taskKind === "image_edit" && mapping.modelKey === model.modelKey,
    );
    if (exactIndex < 0) {
      mappings.push({
        id: `mapping-${crypto.randomUUID()}`,
        vendorKey: model.vendorKey,
        taskKind: "image_edit",
        modelKey: model.modelKey,
        name: `${model.labelZh || model.modelKey} · 改图`,
        enabled: true,
        create: profile.operation,
        createdAt: t,
        updatedAt: t,
      });
      changed = true;
    } else if (JSON.stringify(mappings[exactIndex].create) !== JSON.stringify(profile.operation)) {
      mappings[exactIndex] = { ...mappings[exactIndex], create: profile.operation, enabled: true, updatedAt: t };
      changed = true;
    }

    const meta = isJsonRecord(model.meta) ? model.meta : {};
    const imageOptions = isJsonRecord(meta.imageOptions) ? meta.imageOptions : {};
    if (imageOptions.supportsReferenceImages !== true || imageOptions.imageEditProtocol !== profile.protocol) {
      models[i] = {
        ...model,
        meta: { ...meta, imageOptions: { ...imageOptions, supportsReferenceImages: true, imageEditProtocol: profile.protocol } },
        updatedAt: t,
      };
      changed = true;
    }
  }
  return { state: changed ? { ...state, models, mappings } : state, changed };
}

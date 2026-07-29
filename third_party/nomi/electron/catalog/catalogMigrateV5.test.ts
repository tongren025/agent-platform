// v4 → v5 迁移：存量中转 image 条目补图生图能力（image_edit mapping + supportsReferenceImages +
// 老标准参数升级成 比例/清晰度）。根治「8c711f0c 之前接入的中转模型必须删了重加」。
import { describe, expect, it } from "vitest";
import { migrateRelayImageEditCapability } from "./catalogStore";
import { NEWAPI_IMAGE_EDIT_OP } from "./newapiTransport";
import { type CatalogState, type Mapping, type Model, type Vendor } from "./types";

const NOW = "2026-07-06T00:00:00.000Z";

const mkVendor = (key: string, over: Partial<Vendor> = {}): Vendor => ({
  key, name: key, enabled: true, hasApiKey: true, baseUrlHint: `https://${key}.example`,
  authType: "bearer", authHeader: null, authQueryParam: null, providerKind: "openai-compatible",
  createdAt: NOW, updatedAt: NOW, ...over,
});

const LEGACY_PARAMS = [
  { key: "size", label: "尺寸", type: "select", options: [{ value: "1024x1024", label: "1024x1024" }] },
  { key: "quality", label: "质量", type: "select", options: [{ value: "standard", label: "standard" }] },
  { key: "n", label: "张数", type: "number" },
];

const mkModel = (vendorKey: string, over: Partial<Model> = {}): Model => ({
  modelKey: "gpt-image-2", vendorKey, modelAlias: "gpt-image-2", labelZh: "GPT Image 2",
  kind: "image", enabled: true, meta: { parameters: LEGACY_PARAMS },
  createdAt: NOW, updatedAt: NOW, ...over,
});

const mkT2iMapping = (vendorKey: string, over: Partial<Mapping> = {}): Mapping => ({
  id: `m-${vendorKey}`, vendorKey, taskKind: "text_to_image", name: "文生图", enabled: true,
  create: { method: "POST", path: "/v1/images/generations", body: { model: "{{model.modelKey}}", size: "{{request.params.size}}" } },
  createdAt: NOW, updatedAt: NOW, ...over,
});

const mkState = (vendors: Vendor[], models: Model[], mappings: Mapping[]): CatalogState => ({
  version: 4 as CatalogState["version"], vendors, models, mappings, apiKeysByVendor: {},
});

describe("migrateRelayImageEditCapability（v4→v5）", () => {
  it("存量中转 image 条目：补 image_edit mapping + supportsReferenceImages + 参数升级成 比例/清晰度", () => {
    const { state, changed } = migrateRelayImageEditCapability(
      mkState([mkVendor("yunwu-ai")], [mkModel("yunwu-ai")], [mkT2iMapping("yunwu-ai")]),
    );
    expect(changed).toBe(true);
    const edit = state.mappings.find((m) => m.vendorKey === "yunwu-ai" && m.taskKind === "image_edit");
    expect(edit?.create).toEqual(NEWAPI_IMAGE_EDIT_OP);
    expect(edit?.enabled).toBe(true);
    const meta = state.models[0].meta as { parameters: Array<{ key: string }>; imageOptions?: { supportsReferenceImages?: boolean } };
    expect(meta.imageOptions?.supportsReferenceImages).toBe(true);
    const keys = meta.parameters.map((p) => p.key);
    expect(keys).toContain("aspect_ratio");
    expect(keys).toContain("resolution"); // 治「只能出 1K」：升级后 UI 能选 1K/2K/4K
    expect(keys).not.toContain("size");
  });

  it("幂等：迁移过一次再跑 changed=false，不重复补 mapping", () => {
    const first = migrateRelayImageEditCapability(
      mkState([mkVendor("yunwu-ai")], [mkModel("yunwu-ai")], [mkT2iMapping("yunwu-ai")]),
    );
    const second = migrateRelayImageEditCapability(first.state);
    expect(second.changed).toBe(false);
    expect(second.state.mappings.filter((m) => m.taskKind === "image_edit")).toHaveLength(1);
  });

  it("内置 vendor（kie）不碰——curated 种子/repair 自己管", () => {
    const { changed } = migrateRelayImageEditCapability(
      mkState([mkVendor("kie")], [mkModel("kie")], [mkT2iMapping("kie")]),
    );
    expect(changed).toBe(false);
  });

  it("非 OpenAI 兼容形状（无 /images/generations op）→ 不猜、不动", () => {
    const { changed } = migrateRelayImageEditCapability(
      mkState(
        [mkVendor("weird-api")],
        [mkModel("weird-api")],
        [mkT2iMapping("weird-api", { create: { method: "POST", path: "/api/v1/jobs/createTask", body: {} } })],
      ),
    );
    expect(changed).toBe(false);
  });

  it("doc 派生的自定义参数不动（只补 flag + mapping）", () => {
    const customParams = [{ key: "image_size", label: "Image Size", type: "select", options: [{ value: "512", label: "512" }] }];
    const { state, changed } = migrateRelayImageEditCapability(
      mkState([mkVendor("doc-vendor")], [mkModel("doc-vendor", { meta: { parameters: customParams } })], [mkT2iMapping("doc-vendor")]),
    );
    expect(changed).toBe(true);
    const meta = state.models[0].meta as { parameters: unknown; imageOptions?: { supportsReferenceImages?: boolean } };
    expect(meta.parameters).toEqual(customParams);
    expect(meta.imageOptions?.supportsReferenceImages).toBe(true);
  });

  it("该 vendor 已有 image_edit mapping → 不重复补（只按需补模型 flag）", () => {
    const existingEdit: Mapping = { ...mkT2iMapping("has-edit"), id: "edit-1", taskKind: "image_edit", create: NEWAPI_IMAGE_EDIT_OP };
    const { state } = migrateRelayImageEditCapability(
      mkState([mkVendor("has-edit")], [mkModel("has-edit")], [mkT2iMapping("has-edit"), existingEdit]),
    );
    expect(state.mappings.filter((m) => m.vendorKey === "has-edit" && m.taskKind === "image_edit")).toHaveLength(1);
  });

});

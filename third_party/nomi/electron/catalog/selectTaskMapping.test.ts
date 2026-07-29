import { describe, it, expect } from "vitest";
import { selectTaskMapping, type Mapping } from "./types";

// 路由根因回归：同 (vendor, taskKind) 下两个模型请求形状不同时，靠 modelKey 精确路由，
// 不再「第一个 enabled 赢、另一个模型静默套错模板」（实测：HappyHorse 撞 Kling 的 text_to_video）。

function mp(id: string, over: Partial<Mapping> = {}): Mapping {
  return {
    id, vendorKey: "kie", taskKind: "text_to_video", name: id, enabled: true,
    create: { method: "POST", path: "/x", headers: {}, body: { tag: id } },
    createdAt: "t", updatedAt: "t", ...over,
  } as Mapping;
}

describe("selectTaskMapping — 优先级：精确 modelKey > generic > 任意", () => {
  const kling = mp("kling", {}); // generic（无 modelKey）
  const happy = mp("happy", { modelKey: "happyhorse" }); // 绑 HappyHorse
  const all = [kling, happy];

  it("传 happyhorse → 命中 HappyHorse 自己的 mapping（不被 Kling 抢）", () => {
    expect(selectTaskMapping(all, "kie", "text_to_video", "happyhorse")?.id).toBe("happy");
  });
  it("传别的/不传 modelKey → 落 generic（Kling）", () => {
    expect(selectTaskMapping(all, "kie", "text_to_video", "kling-2")?.id).toBe("kling");
    expect(selectTaskMapping(all, "kie", "text_to_video")?.id).toBe("kling");
  });
  it("只有 generic 时，任何 modelKey 都落它（向后兼容老数据：Seedance 无 modelKey 仍可用）", () => {
    expect(selectTaskMapping([kling], "kie", "text_to_video", "anything")?.id).toBe("kling");
  });
  it("没有 generic、只有别的模型绑定、且 modelKey 不匹配 → 返回 null（P3:不静默套别的模型模板）", () => {
    // 旧行为是兜底 inBucket[0]，会把「other」静默套上 happyhorse 的请求模板。
    // 根因修复：无精确绑定 + 无 generic → null，让调用方走通用回退而非错模板。
    expect(selectTaskMapping([happy], "kie", "text_to_video", "other")).toBeNull();
  });
  it("没有 generic、不传 modelKey、桶里只有带 modelKey 的绑定 → 仍返回 null（不靠数组序乱选）", () => {
    expect(selectTaskMapping([happy], "kie", "text_to_video")).toBeNull();
  });
  it("禁用的不选；空桶返回 null", () => {
    expect(selectTaskMapping([mp("off", { enabled: false })], "kie", "text_to_video")).toBeNull();
    expect(selectTaskMapping([], "kie", "text_to_video")).toBeNull();
  });
});

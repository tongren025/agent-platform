import { describe, expect, it } from "vitest";
import { resolveNodeRenderKind, isCardRenderKind } from "./resolveRenderKind";

const node = (over: { kind: string; renderKind?: string; categoryId?: string }) =>
  over as Parameters<typeof resolveNodeRenderKind>[0];

describe("resolveNodeRenderKind — 渲染分发优先级（kind > categoryId）", () => {
  it("角色/场景卡落 shots 分类（拆镜头拍板 A）仍长成卡，不退化成普通图", () => {
    expect(resolveNodeRenderKind(node({ kind: "character", categoryId: "shots" }))).toBe("character-card");
    expect(resolveNodeRenderKind(node({ kind: "scene", categoryId: "shots" }))).toBe("scene-card");
  });

  it("声音节点任意分类都按 kind → audio-strip", () => {
    expect(resolveNodeRenderKind(node({ kind: "audio", categoryId: "shots" }))).toBe("audio-strip");
  });

  it("素材节点永远纯图片预览（即便落 cast/scene 分类）", () => {
    expect(resolveNodeRenderKind(node({ kind: "asset", categoryId: "cast" }))).toBeUndefined();
  });

  it("显式 node.renderKind 覆盖一切", () => {
    expect(resolveNodeRenderKind(node({ kind: "character", renderKind: "shot-frame" }))).toBe("shot-frame");
  });

  it("无 kind 信号时按 categoryId 兜底（prop 分类的 image → prop-card）", () => {
    expect(resolveNodeRenderKind(node({ kind: "image", categoryId: "prop" }))).toBe("prop-card");
    expect(resolveNodeRenderKind(node({ kind: "image", categoryId: "cast" }))).toBe("character-card");
  });

  it("普通镜头（image/video 在 shots）不走卡片", () => {
    expect(resolveNodeRenderKind(node({ kind: "image", categoryId: "shots" }))).toBeUndefined();
    expect(isCardRenderKind(resolveNodeRenderKind(node({ kind: "video", categoryId: "shots" })))).toBe(false);
  });
});

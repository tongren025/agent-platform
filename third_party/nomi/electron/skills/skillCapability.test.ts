import { describe, expect, it } from "vitest";

import { deriveSkillNeeds, reportSkillCapability } from "./skillCapability";
import type { SkillManifest } from "./skillManifestSchema";

function manifest(partial: Partial<SkillManifest>): SkillManifest {
  return {
    name: "test.skill",
    version: "1.0.0",
    description: "d",
    tools: [],
    requiredProviders: [],
    permissions: ["create"],
    ...partial,
  } as SkillManifest;
}

describe("deriveSkillNeeds", () => {
  it("unions requiredProviders with stage modelPref kinds, and tools with stage tools", () => {
    const needs = deriveSkillNeeds(
      manifest({
        requiredProviders: ["text"],
        tools: ["propose_storyboard_plan"],
        stages: [
          { id: "s1", goal: "g", tools: ["create_canvas_nodes"], modelPrefs: [{ kind: "image" }] },
          {
            id: "s2",
            goal: "g",
            tools: ["run_generation_batch"],
            modelPrefs: [{ kind: "video", family: "seedance" }],
          },
        ],
      }),
    );
    expect(needs.providers.sort()).toEqual(["image", "text", "video"]);
    expect(needs.tools.sort()).toEqual([
      "create_canvas_nodes",
      "propose_storyboard_plan",
      "run_generation_batch",
    ]);
    expect(needs.families).toEqual(["seedance"]);
  });

  it("dedupes providers and tools across stages", () => {
    const needs = deriveSkillNeeds(
      manifest({
        requiredProviders: ["image"],
        tools: ["create_canvas_nodes"],
        stages: [
          { id: "s1", goal: "g", tools: ["create_canvas_nodes"], modelPrefs: [{ kind: "image" }] },
        ],
      }),
    );
    expect(needs.providers).toEqual(["image"]);
    expect(needs.tools).toEqual(["create_canvas_nodes"]);
  });
});

describe("reportSkillCapability", () => {
  const skill = manifest({
    requiredProviders: ["text", "image", "video"],
    tools: ["propose_storyboard_plan", "run_generation_batch"],
  });

  it("flags missing providers and tools when the instance lacks them", () => {
    const report = reportSkillCapability(
      skill,
      new Set(["text", "image"]), // 缺 video（没接视频模型）
      new Set(["propose_storyboard_plan"]), // 缺 run_generation_batch
    );
    expect(report.missingProviders).toEqual(["video"]);
    expect(report.missingTools).toEqual(["run_generation_batch"]);
    expect(report.satisfied).toBe(false);
  });

  it("reports satisfied when every need is available", () => {
    const report = reportSkillCapability(
      skill,
      new Set(["text", "image", "video"]),
      new Set(["propose_storyboard_plan", "run_generation_batch"]),
    );
    expect(report.missingProviders).toEqual([]);
    expect(report.missingTools).toEqual([]);
    expect(report.satisfied).toBe(true);
  });
});

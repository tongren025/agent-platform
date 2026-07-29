import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("electron", () => ({
  app: { getPath: () => os.tmpdir(), getAppPath: () => process.cwd() },
}));

import {
  readCachedTaskResult,
  recipeFingerprint,
  rememberTaskResult,
  resetFingerprintCacheForTests,
} from "./fingerprintCache";
import { buildNormalizedRecipe } from "./provenance";
import {
  readEvents,
  resetEventLogStateForTests,
  setEventLogProjectDirResolverForTests,
} from "../events/eventLogRepository";
import type { Model, Vendor } from "../catalog/types";

const vendor = { key: "kie" } as Vendor;
const model = { modelKey: "seedream-4", modelAlias: null } as unknown as Model;

const request = (over: Partial<{ prompt: string; seed: number; extras: Record<string, unknown> }> = {}) => ({
  kind: "text_to_image",
  prompt: over.prompt ?? "落日下的京都街道",
  ...(over.seed !== undefined ? { seed: over.seed } : {}),
  width: 1024,
  height: 576,
  extras: { projectId: "p1", nodeId: "n1", aspect_ratio: "16:9", ...(over.extras || {}) },
});

const result = (id = "task-1") => ({
  id,
  kind: "text_to_image",
  status: "succeeded",
  assets: [{ type: "image", url: "file:///p1/a.png" }],
});

let tmpRoot = "";

beforeEach(() => {
  tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), "nomi-fpc-"));
  setEventLogProjectDirResolverForTests((projectId) => path.join(tmpRoot, projectId));
  fs.mkdirSync(path.join(tmpRoot, "p1"), { recursive: true });
  resetFingerprintCacheForTests();
});

afterEach(() => {
  resetEventLogStateForTests();
  fs.rmSync(tmpRoot, { recursive: true, force: true });
});

describe("fingerprintCache — S8 指纹缓存", () => {
  it("同配方恒同指纹;改任一参数指纹变(验收:改参数正常重跑)", () => {
    const base = recipeFingerprint(buildNormalizedRecipe({ vendor, model, request: request() }))
    expect(recipeFingerprint(buildNormalizedRecipe({ vendor, model, request: request() }))).toBe(base)
    expect(recipeFingerprint(buildNormalizedRecipe({ vendor, model, request: request({ prompt: "改了" }) }))).not.toBe(base)
    expect(recipeFingerprint(buildNormalizedRecipe({ vendor, model, request: request({ seed: 7 }) }))).not.toBe(base)
    expect(recipeFingerprint(buildNormalizedRecipe({ vendor, model, request: request({ extras: { aspect_ratio: "9:16" } }) }))).not.toBe(base)
  });

  it("路由旗标(projectId/nodeId/forceRerun)不进指纹", () => {
    const base = recipeFingerprint(buildNormalizedRecipe({ vendor, model, request: request() }))
    const flagged = recipeFingerprint(
      buildNormalizedRecipe({ vendor, model, request: request({ extras: { forceRerun: true, nodeId: "n99" } }) }),
    )
    expect(flagged).toBe(base)
  });

  it("终态成功入缓存 → 同键命中秒回深拷贝 + vendor.call.cached 入日志", () => {
    const fp = "fp-abc";
    rememberTaskResult("p1", fp, result());
    const hit = readCachedTaskResult({ projectId: "p1", fingerprint: fp, nodeId: "n1" });
    expect(hit?.id).toBe("task-1");
    expect(hit).not.toBe(result()); // 深拷贝,不共享引用
    const cachedEvents = readEvents("p1").filter((event) => event.type === "vendor.call.cached");
    expect(cachedEvents).toHaveLength(1);
    expect(cachedEvents[0].payload.fingerprint).toBe(fp);
  });

  it("强制重跑(extras.forceRerun)绕过读取(验收:真要重抽走强制重跑)", () => {
    rememberTaskResult("p1", "fp-abc", result());
    expect(readCachedTaskResult({ projectId: "p1", fingerprint: "fp-abc", extras: { forceRerun: true } })).toBeNull();
    // 重跑后的新结果覆盖旧缓存
    rememberTaskResult("p1", "fp-abc", result("task-2"));
    expect(readCachedTaskResult({ projectId: "p1", fingerprint: "fp-abc" })?.id).toBe("task-2");
  });

  it("跨节点命中复用资产，但不连带泄漏别节点的 vendorRequestId（标注 fromCache + 留源 runId）", () => {
    // 节点 A 真调 vendor，产物带它自己的 vendorRequestId。
    const fromNodeA = {
      ...result("task-A"),
      provenance: { provider: "kie", vendorRequestId: "vendor-req-A", timestamp: 1 },
    };
    rememberTaskResult("p1", "fp-shared", fromNodeA);
    // 节点 B 同配方 → 命中 A 的资产（零 vendor 调用，这是缓存的价值，要保留）。
    const hitForB = readCachedTaskResult({ projectId: "p1", fingerprint: "fp-shared", nodeId: "nB" });
    expect(hitForB?.assets).toHaveLength(1); // 资产照样复用
    const prov = hitForB?.provenance as Record<string, unknown> | undefined;
    // 关键：B 的 provenance 不能再声称自己发过 vendor-req-A（那是 A 的请求）。
    expect(prov?.vendorRequestId).toBeUndefined();
    expect(prov?.fromCache).toBe(true);
    // 审计仍可追到原始来源（诚实：复用自哪次成功 run），但不冒充本节点的 vendor 请求。
    expect(prov?.cacheSourceRunId).toBe("task-A");
    // 缓存里的原始记录不被命中读取就地改坏（深拷贝隔离）。
    const prov2 = readCachedTaskResult({ projectId: "p1", fingerprint: "fp-shared", nodeId: "nC" })?.provenance as Record<string, unknown> | undefined;
    expect(prov2?.fromCache).toBe(true);
    expect(prov2?.vendorRequestId).toBeUndefined();
  });

  it("命中结果无 provenance 时不凭空造（只在有 provenance 时标注 fromCache）", () => {
    rememberTaskResult("p1", "fp-noprov", result("task-NP"));
    const hit = readCachedTaskResult({ projectId: "p1", fingerprint: "fp-noprov", nodeId: "nX" });
    expect(hit?.assets).toHaveLength(1);
    expect(hit?.provenance).toBeUndefined();
  });

  it("失败/无产物/无 projectId 不入不读(跨项目命中会引用别人项目的文件)", () => {
    rememberTaskResult("p1", "fp-1", { ...result(), status: "failed" });
    rememberTaskResult("p1", "fp-2", { ...result(), assets: [] });
    rememberTaskResult("", "fp-3", result());
    expect(readCachedTaskResult({ projectId: "p1", fingerprint: "fp-1" })).toBeNull();
    expect(readCachedTaskResult({ projectId: "p1", fingerprint: "fp-2" })).toBeNull();
    expect(readCachedTaskResult({ projectId: "", fingerprint: "fp-3" })).toBeNull();
    // 同指纹不同项目不串
    rememberTaskResult("p1", "fp-x", result());
    expect(readCachedTaskResult({ projectId: "p2", fingerprint: "fp-x" })).toBeNull();
  });
});

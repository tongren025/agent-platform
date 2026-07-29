// 真 ffmpeg/ffprobe 集成：导入归一化 + 懒自愈全链路（不 mock mediaProbe——就是要证明
// 打包随附的二进制真能探测/真能转码，libx264 缺失这类打包事故在这里当场爆）。
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { createRequire } from "node:module";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

import { createProject } from "../runtime";
import { ensurePlayableAsset, importLocalFile } from "./localFileImport";
import { probeMediaMetadata } from "../export/mediaProbe";

const tempRoots: string[] = [];
let mockedDocumentsRoot = "";
let mockedUserDataRoot = "";

vi.mock("electron", () => ({
  app: {
    getPath: (name: string) => {
      if (name === "documents") return mockedDocumentsRoot;
      if (name === "userData") return mockedUserDataRoot;
      return mockedUserDataRoot;
    },
    getAppPath: () => process.cwd(),
  },
}));

function makeTempDir(name: string): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), name));
  tempRoots.push(dir);
  return dir;
}

type AssetRecord = { data: { url: string; absolutePath: string; contentType: string; playbackNormalizedFrom?: string } };

const require = createRequire(import.meta.url);
let workspaceId = "";
let aviBytes: Buffer;
let mp4Bytes: Buffer;

beforeAll(() => {
  mockedDocumentsRoot = makeTempDir("nomi-video-norm-documents-");
  mockedUserDataRoot = makeTempDir("nomi-video-norm-user-data-");
  const rootPath = makeTempDir("nomi-video-norm-project-");
  workspaceId = (createProject({ rootPath, name: "Video Normalize", payload: {} }) as { id: string }).id;

  // 夹具：mpeg4-in-AVI（Chromium 铁定播不了）+ h264 MP4（可播对照）。testsrc 1 秒极小片。
  const ffmpegPath = (require("@ffmpeg-installer/ffmpeg") as { path: string }).path;
  const fixtureDir = makeTempDir("nomi-video-norm-fixtures-");
  const aviPath = path.join(fixtureDir, "legacy.avi");
  const mp4Path = path.join(fixtureDir, "modern.mp4");
  const base = ["-f", "lavfi", "-i", "testsrc=duration=1:size=192x108:rate=12", "-y"];
  const encodeAvi = spawnSync(ffmpegPath, [...base, "-c:v", "mpeg4", aviPath], { timeout: 60_000 });
  const encodeMp4 = spawnSync(ffmpegPath, [...base, "-c:v", "libx264", "-pix_fmt", "yuv420p", mp4Path], { timeout: 60_000 });
  if (encodeAvi.status !== 0 || encodeMp4.status !== 0) {
    throw new Error(`fixture encode failed: avi=${encodeAvi.status} mp4=${encodeMp4.status}`);
  }
  aviBytes = fs.readFileSync(aviPath);
  mp4Bytes = fs.readFileSync(mp4Path);
}, 120_000);

afterAll(() => {
  for (const root of tempRoots.splice(0)) fs.rmSync(root, { recursive: true, force: true });
});

describe("导入归一化（importLocalFile）", () => {
  it("mpeg4 AVI 导入 → 落盘即 h264 MP4，可播（群反馈根治主路径）", async () => {
    const asset = (await importLocalFile({
      projectId: workspaceId,
      bytes: aviBytes,
      contentType: "video/x-msvideo",
      fileName: "clip.avi",
    })) as AssetRecord;
    expect(asset.data.absolutePath.endsWith("clip.mp4")).toBe(true);
    expect(asset.data.contentType).toBe("video/mp4");
    expect(asset.data.playbackNormalizedFrom).toBe("container:avi");
    const probe = await probeMediaMetadata(asset.data.absolutePath);
    expect(probe.videoCodec).toBe("h264");
  }, 60_000);

  it("h264 MP4 导入 → 原样直落，不白转", async () => {
    const asset = (await importLocalFile({
      projectId: workspaceId,
      bytes: mp4Bytes,
      contentType: "video/mp4",
      fileName: "modern.mp4",
    })) as AssetRecord;
    expect(asset.data.playbackNormalizedFrom).toBeUndefined();
    expect(fs.readFileSync(asset.data.absolutePath).length).toBe(mp4Bytes.length);
  }, 60_000);

  it("损坏字节标视频导入 → 回退原样不挡导入（渲染侧守卫兜底报错）", async () => {
    const garbage = Buffer.from("not a real video at all — corrupted payload");
    const asset = (await importLocalFile({
      projectId: workspaceId,
      bytes: garbage,
      contentType: "video/mp4",
      fileName: "broken.mp4",
    })) as AssetRecord;
    expect(asset.data.playbackNormalizedFrom).toBeUndefined();
    expect(fs.readFileSync(asset.data.absolutePath).equals(garbage)).toBe(true);
  }, 60_000);
});

describe("懒自愈（ensurePlayableAsset）", () => {
  it("存量播不了的资产 → 转码出新 MP4 资产；已可播 → null（一次收敛）", async () => {
    // 用 octet-stream 绕过导入归一化，模拟「归一化上线前落盘的 HEVC/AVI 存量」。
    const planted = (await importLocalFile({
      projectId: workspaceId,
      bytes: aviBytes,
      contentType: "application/octet-stream",
      fileName: "stale.avi",
    })) as AssetRecord;
    expect(planted.data.absolutePath.endsWith("stale.avi")).toBe(true);

    const healed = (await ensurePlayableAsset({ url: planted.data.url })) as AssetRecord | null;
    expect(healed).not.toBeNull();
    expect(healed!.data.absolutePath.endsWith(".mp4")).toBe(true);
    expect(healed!.data.playbackNormalizedFrom).toBe("container:avi");
    const probe = await probeMediaMetadata(healed!.data.absolutePath);
    expect(probe.videoCodec).toBe("h264");
    // 原文件保留（导出/上游引用不受影响）
    expect(fs.existsSync(planted.data.absolutePath)).toBe(true);

    // 新资产已可播 → 再自愈返回 null（渲染侧一次性防环之外的第二道收敛保证）
    expect(await ensurePlayableAsset({ url: healed!.data.url })).toBeNull();
  }, 60_000)

  it("非 nomi-local / 不存在的 URL → null", async () => {
    expect(await ensurePlayableAsset({ url: "https://cdn.example.com/x.mp4" })).toBeNull();
    expect(await ensurePlayableAsset({ url: "nomi-local://asset/no-such-project/assets/x.mp4" })).toBeNull();
  });
});

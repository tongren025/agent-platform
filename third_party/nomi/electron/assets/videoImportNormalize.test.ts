import { describe, expect, it } from "vitest";
import {
  playableMp4FileName,
  transcodeArgsForPlayableMp4,
  videoNeedsPlayabilityTranscode,
} from "./videoImportNormalize";
import type { MediaProbeMetadata } from "../export/mediaProbe";

function probe(overrides: Partial<MediaProbeMetadata>): MediaProbeMetadata {
  return { kind: "video", hasAudio: false, ...overrides };
}

describe("videoNeedsPlayabilityTranscode — Chromium 可播判定（导入归一化 + 懒自愈共用）", () => {
  it("h264 mp4（手机/供应商主流产物）→ 可播，不转", () => {
    expect(videoNeedsPlayabilityTranscode("clip.mp4", probe({ videoCodec: "h264" }))).toBeNull()
    expect(
      videoNeedsPlayabilityTranscode("clip.mov", probe({ videoCodec: "h264", hasAudio: true, audioCodec: "aac" })),
    ).toBeNull()
  })

  it("vp9 webm / av1 mp4 → 可播，不转", () => {
    expect(videoNeedsPlayabilityTranscode("clip.webm", probe({ videoCodec: "vp9", hasAudio: true, audioCodec: "opus" }))).toBeNull()
    expect(videoNeedsPlayabilityTranscode("clip.mp4", probe({ videoCodec: "av1" }))).toBeNull()
  })

  it("HEVC（iPhone 默认录制）→ 要转（群反馈根因：Windows Chromium 解不了，节点灰壳 0:00）", () => {
    expect(videoNeedsPlayabilityTranscode("IMG_0001.mov", probe({ videoCodec: "hevc" }))).toBe("codec:hevc")
    expect(videoNeedsPlayabilityTranscode("clip.mp4", probe({ videoCodec: "hevc" }))).toBe("codec:hevc")
  })

  it("AVI/MKV 等容器 → 要转（<video> 不认这些容器，哪怕内层是 h264）", () => {
    expect(videoNeedsPlayabilityTranscode("old.avi", probe({ videoCodec: "h264" }))).toBe("container:avi")
    expect(videoNeedsPlayabilityTranscode("rip.mkv", probe({ videoCodec: "h264" }))).toBe("container:mkv")
  })

  it("音轨编码不受支持（如 ac3）→ 要转（画面能播但没声，同样是静默残缺）", () => {
    expect(
      videoNeedsPlayabilityTranscode("tv.mp4", probe({ videoCodec: "h264", hasAudio: true, audioCodec: "ac3" })),
    ).toBe("audio:ac3")
  })

  it("无音轨不因音频误伤；未知视频编码按不可播处理", () => {
    expect(videoNeedsPlayabilityTranscode("clip.mp4", probe({ videoCodec: "h264", hasAudio: false }))).toBeNull()
    expect(videoNeedsPlayabilityTranscode("clip.mp4", probe({}))).toBe("codec:unknown")
  })
})

describe("transcodeArgsForPlayableMp4 — 转码参数", () => {
  it("H.264+AAC、faststart、偶数边夹取、覆盖输出", () => {
    const args = transcodeArgsForPlayableMp4("/tmp/in.mov", "/tmp/out.mp4")
    expect(args[0]).toBe("-y")
    expect(args).toContain("libx264")
    expect(args).toContain("aac")
    expect(args).toContain("+faststart")
    expect(args.join(" ")).toContain("scale=trunc(iw/2)*2:trunc(ih/2)*2")
    expect(args[args.length - 1]).toBe("/tmp/out.mp4")
  })
})

describe("playableMp4FileName", () => {
  it("换扩展名为 .mp4，空名兜底", () => {
    expect(playableMp4FileName("IMG_0001.MOV")).toBe("IMG_0001.mp4")
    expect(playableMp4FileName("")).toBe("video.mp4")
  })
})

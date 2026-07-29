import { describe, expect, it } from "vitest";
import { EXPORT_JOB_STATUSES, EXPORT_PRESETS, EXPORT_STAGES, isMp4ExportProfile } from "./exportTypes";

describe("export domain types", () => {
  it("enumerates production export presets including the legacy webm bridge preset", () => {
    expect(EXPORT_PRESETS).toEqual(["publish", "edit", "share", "webm"]);
  });

  it("enumerates export job statuses and active stages separately", () => {
    expect(EXPORT_JOB_STATUSES).toEqual([
      "queued",
      "preparing",
      "planning",
      "rendering",
      "encoding",
      "muxing",
      "finalizing",
      "succeeded",
      "failed",
      "cancelled",
    ]);
    expect(EXPORT_STAGES).toEqual(["preparing", "planning", "rendering", "encoding", "muxing", "finalizing"]);
  });

  it("accepts production MP4 H.264/AAC export profiles", () => {
    expect(isMp4ExportProfile({
      preset: "publish",
      container: "mp4",
      videoCodec: "h264",
      audioCodec: "aac",
      audioMode: "preserve-source",
      audioBitrateKbps: 192,
      width: 1920,
      height: 1080,
      fps: 30,
      pixelFormat: "yuv420p",
      quality: "standard",
    })).toBe(true);
  });

  it("rejects legacy webm and malformed profile-shaped values", () => {
    expect(isMp4ExportProfile({
      preset: "webm",
      container: "webm",
      videoCodec: "vp9",
      audioCodec: "none",
      audioMode: "mute",
      width: 1920,
      height: 1080,
      fps: 30,
      pixelFormat: "yuv420p",
      quality: "standard",
    })).toBe(false);

    expect(isMp4ExportProfile({
      preset: "edit",
      container: "mp4",
      videoCodec: "h264",
      audioCodec: "aac",
      audioMode: "preserve-source",
      width: 0,
      height: 1080,
      fps: 30,
      pixelFormat: "yuv420p",
      quality: "standard",
    })).toBe(false);
  });

  it("validates audioMode and positive optional audioBitrateKbps", () => {
    const baseProfile = {
      preset: "publish",
      container: "mp4",
      videoCodec: "h264",
      audioCodec: "none",
      audioMode: "mute",
      width: 1920,
      height: 1080,
      fps: 30,
      pixelFormat: "yuv420p",
      quality: "standard",
    };

    expect(isMp4ExportProfile(baseProfile)).toBe(true);
    expect(isMp4ExportProfile({ ...baseProfile, audioMode: "preserve-source", audioCodec: "aac", audioBitrateKbps: 192 })).toBe(true);
    expect(isMp4ExportProfile({ ...baseProfile, audioMode: "mixdown", audioCodec: "aac", audioBitrateKbps: 256 })).toBe(true);
    expect(isMp4ExportProfile({ ...baseProfile, audioMode: "silent" })).toBe(false);
    expect(isMp4ExportProfile({ ...baseProfile, audioMode: "preserve-source", audioCodec: "none" })).toBe(false);
    expect(isMp4ExportProfile({ ...baseProfile, audioMode: "mixdown", audioCodec: "none" })).toBe(false);
    expect(isMp4ExportProfile({ ...baseProfile, audioMode: "preserve-source", audioCodec: "aac", audioBitrateKbps: 0 })).toBe(false);
  });
});

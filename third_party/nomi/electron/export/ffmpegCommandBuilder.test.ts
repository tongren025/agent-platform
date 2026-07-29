import { describe, expect, it } from "vitest";
import type { ExportProfile } from "./exportTypes";
import { buildWebmToMp4Args } from "./ffmpegCommandBuilder";

const standardProfile: ExportProfile = {
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

function build(overrides: Partial<ExportProfile> = {}, noAudio = false, reportProgress = false): string[] {
  return buildWebmToMp4Args({
    inputPath: "/tmp/input.webm",
    outputPath: "/tmp/output.partial.mp4",
    profile: { ...standardProfile, ...overrides },
    noAudio,
    reportProgress,
  });
}

describe("buildWebmToMp4Args", () => {
  it("includes expected standard MP4 transcode args with input and partial output paths", () => {
    expect(build()).toEqual([
      "-y",
      "-i", "/tmp/input.webm",
      "-an",
      "-vf", "scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2:color=black,format=yuv420p",
      "-r", "30",
      "-c:v", "libx264",
      "-preset", "medium",
      "-crf", "23",
      "-movflags", "+faststart",
      "/tmp/output.partial.mp4",
    ]);
  });

  it("emits -an when audioMode is mute, audioCodec is none, or noAudio is true", () => {
    expect(build({ audioMode: "mute", audioCodec: "none" })).toContain("-an");
    expect(build({ audioMode: "mute", audioCodec: "aac" })).toContain("-an");
    expect(build({ audioMode: "preserve-source", audioCodec: "aac" }, true)).toContain("-an");
  });

  it("emits AAC args for preserve-source when source audio metadata proves audio is available", () => {
    const args = buildWebmToMp4Args({
      inputPath: "/tmp/input.webm",
      outputPath: "/tmp/output.partial.mp4",
      profile: { ...standardProfile, audioMode: "preserve-source", audioCodec: "aac", audioBitrateKbps: 192 },
      noAudio: false,
      sourceAudio: { hasAudio: true, audioCodec: "opus", durationSeconds: 3 },
    });

    expect(args).not.toContain("-an");
    expect(args.slice(args.indexOf("-c:a"), args.indexOf("-c:a") + 4)).toEqual(["-c:a", "aac", "-b:a", "192k"]);
  });

  it("fails clearly for preserve-source without source audio metadata", () => {
    expect(() => build({ audioMode: "preserve-source", audioCodec: "aac" })).toThrow(/source audio metadata/i);
    expect(() => buildWebmToMp4Args({
      inputPath: "/tmp/input.webm",
      outputPath: "/tmp/output.partial.mp4",
      profile: { ...standardProfile, audioMode: "preserve-source", audioCodec: "aac" },
      noAudio: false,
      sourceAudio: { hasAudio: false, audioCodec: "opus", durationSeconds: 3 },
    })).toThrow(/source audio metadata/i);
  });

  it("does not emit FFmpeg progress args by default", () => {
    expect(build()).not.toContain("-progress");
    expect(build()).not.toContain("-nostats");
  });

  it("emits FFmpeg progress args when reportProgress is true", () => {
    const args = build({}, false, true);

    expect(args.slice(args.indexOf("-progress"), args.indexOf("-progress") + 3)).toEqual(["-progress", "pipe:2", "-nostats"]);
    expect(args.indexOf("-progress")).toBeGreaterThanOrEqual(0);
    expect(args.indexOf("-progress")).toBeLessThan(args.length - 1);
  });

  it("uses profile width, height, fps, and pixelFormat instead of legacy defaults", () => {
    const args = build({ width: 720, height: 900, fps: 24, pixelFormat: "yuv420p" });

    expect(args).toContain("scale=720:900:force_original_aspect_ratio=decrease,pad=720:900:(ow-iw)/2:(oh-ih)/2:color=black,format=yuv420p");
    expect(args.slice(args.indexOf("-r"), args.indexOf("-r") + 2)).toEqual(["-r", "24"]);
  });

  it("changes CRF by quality", () => {
    expect(build({ quality: "small" }).slice(-5, -3)).toEqual(["-crf", "28"]);
    expect(build({ quality: "standard" }).slice(-5, -3)).toEqual(["-crf", "23"]);
    expect(build({ quality: "high" }).slice(-5, -3)).toEqual(["-crf", "18"]);
  });

  it("uses filter_complex and explicit maps when a filtergraph plan is provided", () => {
    const args = buildWebmToMp4Args({
      inputPath: "/tmp/legacy-input.webm",
      outputPath: "/tmp/output.partial.mp4",
      profile: { ...standardProfile, audioCodec: "aac", audioMode: "mixdown", audioBitrateKbps: 192 },
      noAudio: false,
      filtergraph: {
        inputs: [
          { assetId: "still", path: "/media/still.png", kind: "image", inputArgs: ["-loop", "1", "-t", "5"] },
          { assetId: "voice", path: "/media/voice.wav", kind: "audio", inputArgs: [] },
        ],
        filterComplex: "color=black:size=1920x1080:rate=30:duration=5[base];[base]format=yuv420p[vout];[1:a]adelay=1000|1000[aout]",
        videoOutputLabel: "[vout]",
        audioOutputLabel: "[aout]",
        warnings: [],
      },
    });

    expect(args.slice(0, 8)).toEqual(["-y", "-loop", "1", "-t", "5", "-i", "/media/still.png", "-i"]);
    expect(args).toContain("/media/voice.wav");
    expect(args).toContain("-filter_complex");
    expect(args).toContain("color=black:size=1920x1080:rate=30:duration=5[base];[base]format=yuv420p[vout];[1:a]adelay=1000|1000[aout]");
    expect(args).toContain("-map");
    expect(args.slice(args.indexOf("-filter_complex") + 2, args.indexOf("-filter_complex") + 6)).toEqual(["-map", "[vout]", "-map", "[aout]"]);
    expect(args.slice(args.indexOf("-c:a"), args.indexOf("-c:a") + 4)).toEqual(["-c:a", "aac", "-b:a", "192k"]);
    expect(args).not.toContain("-vf");
    expect(args).not.toContain("/tmp/legacy-input.webm");
  });

  it("fails clearly when mixdown is requested without a filtergraph audio output label", () => {
    expect(() => buildWebmToMp4Args({
      inputPath: "/tmp/legacy-input.webm",
      outputPath: "/tmp/output.partial.mp4",
      profile: { ...standardProfile, audioCodec: "aac", audioMode: "mixdown" },
      noAudio: false,
      filtergraph: {
        inputs: [{ assetId: "still", path: "/media/still.png", kind: "image", inputArgs: ["-loop", "1", "-t", "5"] }],
        filterComplex: "color=black:size=1920x1080:rate=30:duration=5[base];[base]format=yuv420p[vout]",
        videoOutputLabel: "[vout]",
        warnings: [],
      },
    })).toThrow(/mixdown.*audio/i);
  });
});

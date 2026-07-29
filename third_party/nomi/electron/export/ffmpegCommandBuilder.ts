import type { ExportProfile, ExportQuality } from "./exportTypes";
import type { FfmpegFiltergraphPlan } from "./ffmpegFiltergraph";

export type FfmpegTranscodePlan = {
  inputPath: string;
  outputPath: string;
  profile: ExportProfile;
  noAudio: boolean;
  sourceAudio?: { hasAudio: boolean; audioCodec?: string; durationSeconds?: number; sampleRate?: number; channels?: number };
  filtergraph?: FfmpegFiltergraphPlan;
  reportProgress?: boolean;
};

const QUALITY_CRF: Record<ExportQuality, string> = {
  small: "28",
  standard: "23",
  high: "18",
};

function assertPositiveFiniteInteger(value: number, name: string): void {
  if (!Number.isFinite(value) || value <= 0 || Math.floor(value) !== value) {
    throw new Error(`Invalid FFmpeg ${name}: ${value}`);
  }
}

function assertPositiveFiniteNumber(value: number, name: string): void {
  if (!Number.isFinite(value) || value <= 0) {
    throw new Error(`Invalid FFmpeg ${name}: ${value}`);
  }
}

function audioBitrateArg(profile: ExportProfile): string {
  return `${profile.audioBitrateKbps ?? 192}k`;
}

function shouldMuteAudio(plan: FfmpegTranscodePlan): boolean {
  return plan.noAudio || plan.profile.audioMode === "mute" || plan.profile.audioCodec === "none";
}

function assertSourceAudioMetadata(plan: FfmpegTranscodePlan): void {
  const { sourceAudio } = plan;
  if (sourceAudio?.hasAudio !== true || sourceAudio.audioCodec === undefined || sourceAudio.durationSeconds === undefined) {
    throw new Error("preserve-source audio mode requires source audio metadata with hasAudio, audioCodec, and durationSeconds");
  }
}

function pushAacArgs(args: string[], profile: ExportProfile): void {
  if (profile.audioCodec !== "aac") {
    throw new Error(`Unsupported FFmpeg audio codec for audio output: ${profile.audioCodec}`);
  }
  args.push("-c:a", "aac", "-b:a", audioBitrateArg(profile));
}

export function buildWebmToMp4Args(plan: FfmpegTranscodePlan): string[] {
  const { inputPath, outputPath, profile } = plan;
  if (!inputPath && plan.filtergraph === undefined) throw new Error("Invalid FFmpeg inputPath");
  if (!outputPath) throw new Error("Invalid FFmpeg outputPath");
  if (profile.container !== "mp4") throw new Error(`Unsupported FFmpeg container: ${profile.container}`);
  if (profile.videoCodec !== "h264") throw new Error(`Unsupported FFmpeg video codec: ${profile.videoCodec}`);
  if (profile.pixelFormat !== "yuv420p") throw new Error(`Unsupported FFmpeg pixel format: ${profile.pixelFormat}`);
  assertPositiveFiniteInteger(profile.width, "width");
  assertPositiveFiniteInteger(profile.height, "height");
  assertPositiveFiniteNumber(profile.fps, "fps");

  const vf = `scale=${profile.width}:${profile.height}:force_original_aspect_ratio=decrease,pad=${profile.width}:${profile.height}:(ow-iw)/2:(oh-ih)/2:color=black,format=${profile.pixelFormat}`;
  const args = ["-y"];

  if (plan.reportProgress === true) {
    args.push("-progress", "pipe:2", "-nostats");
  }

  if (plan.filtergraph !== undefined) {
    for (const input of plan.filtergraph.inputs) {
      args.push(...input.inputArgs, "-i", input.path);
    }

    args.push("-filter_complex", plan.filtergraph.filterComplex, "-map", plan.filtergraph.videoOutputLabel);
    const muteAudio = shouldMuteAudio(plan);
    const audioOutputLabel = plan.filtergraph.audioOutputLabel;
    const hasAudioOutputLabel = audioOutputLabel !== undefined;
    if (profile.audioMode === "mixdown" && !muteAudio && !hasAudioOutputLabel) {
      throw new Error("mixdown audio mode requires a filtergraph audio output label");
    }
    if (profile.audioMode === "preserve-source" && !muteAudio) {
      throw new Error("preserve-source audio mode is unsupported with filtergraph plans; use mixdown audio output label");
    }
    if (audioOutputLabel !== undefined && !muteAudio) {
      args.push("-map", audioOutputLabel as string);
    } else {
      args.push("-an");
    }

    args.push(
      "-r", String(profile.fps),
      "-c:v", "libx264",
      "-preset", "medium",
      "-crf", QUALITY_CRF[profile.quality],
    );
    if (hasAudioOutputLabel && !muteAudio) {
      pushAacArgs(args, profile);
    }
    args.push(
      "-movflags", "+faststart",
      outputPath,
    );

    return args;
  }

  args.push("-i", inputPath);

  const muteAudio = shouldMuteAudio(plan);
  if (muteAudio) {
    args.push("-an");
  } else if (profile.audioMode === "preserve-source") {
    assertSourceAudioMetadata(plan);
  } else if (profile.audioMode === "mixdown") {
    throw new Error("mixdown audio mode requires a filtergraph audio output label");
  }

  args.push(
    "-vf", vf,
    "-r", String(profile.fps),
    "-c:v", "libx264",
    "-preset", "medium",
    "-crf", QUALITY_CRF[profile.quality],
  );
  if (!muteAudio) {
    pushAacArgs(args, profile);
  }
  args.push(
    "-movflags", "+faststart",
    outputPath,
  );

  return args;
}

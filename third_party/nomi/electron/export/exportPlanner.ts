import { assertValidManifest, type NomiRenderAsset, type NomiRenderClip, type NomiRenderManifestV1, type NomiRenderTrack } from "./exportManifest";

export type ExportBackend =
  | "ffmpeg-webm-transcode"
  | "ffmpeg-direct"
  | "ffmpeg-filtergraph"
  | "remotion-frame-render"
  | "webm-fallback";

export type ExportPlanCapabilities = {
  directCopy?: boolean;
  filtergraph?: boolean;
  frameRendering?: boolean;
  webmTransition?: boolean;
  fallback?: boolean;
};

export type ExportPlan = {
  backend: ExportBackend;
  reason: string;
  manifest: NomiRenderManifestV1;
  capabilities?: ExportPlanCapabilities;
};

type PlannedClip = {
  track: NomiRenderTrack;
  clip: NomiRenderClip;
  asset?: NomiRenderAsset;
};

const REACT_RENDERED_TRACK_KINDS = new Set(["text", "effect", "overlay", "react", "remotion"]);
const BASIC_VISUAL_TRACK_KINDS = new Set(["video", "image", "visual", "media"]);

export function planExport(manifest: NomiRenderManifestV1): ExportPlan {
  assertValidManifest(manifest);

  if (isEmptyCurrentWebmTransitionManifest(manifest)) {
    return {
      backend: "ffmpeg-webm-transcode",
      reason: "Empty tracks/assets manifest uses the current WebM transition transcode backend.",
      manifest,
      capabilities: { webmTransition: true },
    };
  }

  if (requiresReactRendering(manifest)) {
    return {
      backend: "remotion-frame-render",
      reason: "Text, overlay, effect, or React-specific timeline content requires frame rendering.",
      manifest,
      capabilities: { frameRendering: true },
    };
  }

  if (hasExplicitWebmTransitionWarning(manifest)) {
    return {
      backend: "ffmpeg-webm-transcode",
      reason: "Manifest diagnostics indicate the current WebM transition renderer path.",
      manifest,
      capabilities: { webmTransition: true },
    };
  }

  const clips = collectPlannedClips(manifest);

  if (isSimpleVideoCutsOnly(clips)) {
    return {
      backend: "ffmpeg-direct",
      reason: "Simple video-only cuts with no overlaps can use the FFmpeg direct placeholder.",
      manifest,
      capabilities: { directCopy: true },
    };
  }

  if (isBasicImageVideoComposition(manifest, clips)) {
    return {
      backend: "ffmpeg-filtergraph",
      reason: "Basic image/video visual composition can use the FFmpeg filtergraph placeholder.",
      manifest,
      capabilities: { filtergraph: true },
    };
  }

  return {
    backend: "webm-fallback",
    reason: "Manifest is valid but does not match an initial planner backend capability.",
    manifest,
    capabilities: { fallback: true },
  };
}

function isEmptyCurrentWebmTransitionManifest(manifest: NomiRenderManifestV1): boolean {
  return manifest.timeline.tracks.length === 0 && Object.keys(manifest.assets).length === 0;
}

function hasExplicitWebmTransitionWarning(manifest: NomiRenderManifestV1): boolean {
  return manifest.diagnostics?.warnings.some((warning) => /webm|capture|renderer|unresolved/i.test(warning)) ?? false;
}

function requiresReactRendering(manifest: NomiRenderManifestV1): boolean {
  return manifest.timeline.tracks.some((track) => {
    if (trackKindRequiresReact(track.kind) || trackKindRequiresReact(track.type)) {
      return true;
    }

    return track.clips.some((clip) => clipRequiresReact(clip));
  });
}

function trackKindRequiresReact(value: string | undefined): boolean {
  return value !== undefined && REACT_RENDERED_TRACK_KINDS.has(value.toLowerCase());
}

function clipRequiresReact(clip: NomiRenderClip): boolean {
  if (clip.text !== undefined) {
    return true;
  }

  const extensionFields = clip as NomiRenderClip & Record<string, unknown>;
  if (isRendererSpecificValue(extensionFields.renderer) || isRendererSpecificValue(extensionFields.renderWith)) {
    return true;
  }

  if (isRecord(extensionFields.effect) || isRecord(extensionFields.effects) || Array.isArray(extensionFields.effect) || Array.isArray(extensionFields.effects)) {
    return true;
  }

  if (clip.transform !== undefined) {
    const renderer = clip.transform.renderer ?? clip.transform.renderWith;
    return isRendererSpecificValue(renderer);
  }

  return false;
}

function isRendererSpecificValue(value: unknown): boolean {
  return typeof value === "string" && /react|remotion|frame/i.test(value);
}

function collectPlannedClips(manifest: NomiRenderManifestV1): PlannedClip[] {
  return manifest.timeline.tracks.flatMap((track) =>
    track.clips.map((clip) => ({
      track,
      clip,
      asset: clip.assetId === undefined ? undefined : manifest.assets[clip.assetId],
    })),
  );
}

function isSimpleVideoCutsOnly(clips: PlannedClip[]): boolean {
  return (
    clips.length > 0 &&
    clips.every(({ track, clip, asset }) =>
      asset?.kind === "video" &&
      isBasicVisualTrack(track) &&
      clip.assetId !== undefined &&
      clip.transform === undefined &&
      clip.text === undefined,
    ) &&
    !hasTimelineOverlaps(clips.map(({ clip }) => clip))
  );
}

function isBasicImageVideoComposition(manifest: NomiRenderManifestV1, clips: PlannedClip[]): boolean {
  return (
    clips.length > 0 &&
    manifest.timeline.tracks.every(isBasicVisualTrack) &&
    clips.every(({ clip, asset }) => clip.assetId !== undefined && (asset?.kind === "image" || asset?.kind === "video"))
  );
}

function isBasicVisualTrack(track: NomiRenderTrack): boolean {
  const kind = (track.kind ?? track.type)?.toLowerCase();
  return kind !== undefined && BASIC_VISUAL_TRACK_KINDS.has(kind);
}

function hasTimelineOverlaps(clips: NomiRenderClip[]): boolean {
  const sortedClips = [...clips].sort((left, right) => left.startFrame - right.startFrame || left.endFrame - right.endFrame || left.id.localeCompare(right.id));

  for (let index = 1; index < sortedClips.length; index += 1) {
    if (sortedClips[index].startFrame < sortedClips[index - 1].endFrame) {
      return true;
    }
  }

  return false;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

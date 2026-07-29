import { probeMediaMetadata } from "../export/mediaProbe";

// localizeTaskAsset 落地产物的命名 / 时长探测纯助手。从 runtime giant shell 抽出（规则 9/12 减负）。
export type LocalizedAssetType = "image" | "video" | "audio" | "model3d";

const DEFAULT_ASSET_EXTENSIONS: Record<LocalizedAssetType, string> = {
  image: "png",
  video: "mp4",
  audio: "mp3",
  model3d: "glb",
};

// ComfyUI 等 vendor 产物 URL 常带 ?filename=xxx.webm；保留真实扩展名，避免 webm/mov 落成 .mp4 → contentType 错 → 播放失败。
function extensionFromAssetUrl(assetUrl: string): string {
  const pick = (source: string) => /\.([a-z0-9]{1,8})(?:$|[?#])/i.exec(source)?.[1]?.toLowerCase() || "";
  try {
    const parsed = new URL(assetUrl);
    return pick(parsed.searchParams.get("filename") || parsed.pathname);
  } catch {
    return pick(assetUrl);
  }
}

export function localizedTaskAssetFileName(type: LocalizedAssetType, assetUrl: string, now = Date.now()): string {
  return `${type}-${now}.${extensionFromAssetUrl(assetUrl) || DEFAULT_ASSET_EXTENSIONS[type]}`;
}

// 视频/音频落地后探测真实时长；失败不影响生成成功（renderer 回退到参数时长 / 默认时长）。
export async function probeLocalizedDurationSeconds(
  type: LocalizedAssetType,
  absolutePath: string | undefined,
): Promise<number | undefined> {
  if ((type !== "video" && type !== "audio") || !absolutePath) return undefined;
  try {
    return (await probeMediaMetadata(absolutePath)).durationSeconds;
  } catch {
    return undefined;
  }
}

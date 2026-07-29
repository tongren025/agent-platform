// 本地文件 → 项目素材的导入（从 runtime.ts 抽出：它是素材 IO，不是任务执行，放这更内聚，
// 也给 runtime 这个已知巨壳腾出空间）。writeAsset 仍在 runtime（单向依赖，无循环）。
import fs from "node:fs";
import path from "node:path";

import { writeAsset } from "../runtime";
import { extensionFromMime } from "./assetPaths";
import { parseLocalAssetUrl } from "../protocol/localProtocol";
import {
  ensurePlayableVideoBytes,
  playableMp4FileName,
  transcodeFileToPlayableMp4IfNeeded,
} from "./videoImportNormalize";
import type { JsonRecord } from "../jsonUtils";

function bytesFromPayload(value: unknown): Buffer {
  if (value instanceof ArrayBuffer) return Buffer.from(value);
  if (ArrayBuffer.isView(value)) return Buffer.from(value.buffer, value.byteOffset, value.byteLength);
  if (Array.isArray(value)) return Buffer.from(value);
  throw new Error("bytes must be an ArrayBuffer");
}

export async function importLocalFile(payload: unknown): Promise<unknown> {
  const raw = payload as JsonRecord;
  const projectId = String(raw.projectId || "").trim();
  if (!projectId) throw new Error("projectId is required");
  const bytes = bytesFromPayload(raw.bytes);
  const contentType = String(raw.contentType || "application/octet-stream");
  const ext = extensionFromMime(contentType, "bin");
  const fileName = String(raw.fileName || `asset-${Date.now()}.${ext}`);
  // 视频先过可播放归一化（HEVC/AVI 等 Chromium 解不了的转 H.264 MP4；失败回退原字节不挡导入）。
  const normalized = contentType.startsWith("video/")
    ? await ensurePlayableVideoBytes(bytes, fileName, contentType)
    : null;
  return writeAsset(
    projectId,
    normalized?.bytes ?? bytes,
    normalized?.fileName ?? fileName,
    normalized?.contentType ?? contentType,
    {
      kind: raw.kind || "upload",
      originalName: raw.fileName || null,
      ...(normalized?.playbackNormalizedFrom ? { playbackNormalizedFrom: normalized.playbackNormalizedFrom } : {}),
    },
  );
}

/**
 * 懒自愈（渲染侧 NodeVideoPlaybackGuard 在 decode 失败时调，一节点一次）：已落盘的 nomi-local 视频
 * 资产播不了 → 就地探测 + 转码成新 MP4 资产，返回新资产 DTO；本就可播/无法处理 → null。
 * 覆盖两类存量：① 归一化上线前导入的 HEVC ② 供应商直接回 HEVC 的生成产物（生成落地不做前置转码，
 * 不为没坏的 4K 输出白付转码——坏了才修）。原文件保留（导出/上游引用不受影响）。
 */
export async function ensurePlayableAsset(payload: unknown): Promise<unknown> {
  const raw = payload as JsonRecord;
  const parsed = parseLocalAssetUrl(String(raw.url || "").trim());
  if (!parsed) return null;
  const { projectId, filePath } = parsed;
  if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) return null;
  const sourceName = path.basename(filePath);
  const transcoded = await transcodeFileToPlayableMp4IfNeeded(filePath, sourceName);
  if (!transcoded) return null;
  try {
    const outputBytes = fs.readFileSync(transcoded.outputPath);
    return writeAsset(projectId, outputBytes, playableMp4FileName(sourceName), "video/mp4", {
      kind: "upload",
      originalName: sourceName,
      playbackNormalizedFrom: transcoded.reason,
    });
  } finally {
    fs.rmSync(transcoded.outputPath, { force: true });
  }
}

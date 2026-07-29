// 媒体类型单一真相源 —— 「扩展名 ↔ contentType ↔ kind」唯一一张表。
//
// 为什么存在:这套映射从前散在 5 处各自维护、已漂移的表(AssetLibraryPanel.UPLOAD_ACCEPT /
// importAudioToLibrary.AUDIO_EXTENSIONS / workspaceFileIndex.CONTENT_TYPES /
// assetPaths.contentTypeFromPath / assetPaths.extensionFromMime),最窄的那处悄悄决定一个上传的
// 音频能否进库——导致 .m4a/.aac/.ogg/.flac「上传成功却静默蒸发」。这里收口成一张表,各消费者派生。
//
// 纯模块:只做字符串运算,不碰 node:fs / node:path,因此 renderer(src/)也能直接 import
// (已有 src→electron 值导入先例:export/exportTypes、catalog/*Vendor)。

export type MediaKind = 'image' | 'video' | 'audio' | 'model3d' | 'document' | 'text'

export type MediaTypeEntry = {
  /** 带前导点、小写,如 ".mp3"。 */
  ext: string
  contentType: string
  kind: MediaKind
}

/** 唯一真相源。新增格式只改这里。 */
export const MEDIA_TYPES: readonly MediaTypeEntry[] = [
  // text
  { ext: '.md', contentType: 'text/markdown', kind: 'text' },
  { ext: '.markdown', contentType: 'text/markdown', kind: 'text' },
  { ext: '.txt', contentType: 'text/plain', kind: 'text' },
  { ext: '.json', contentType: 'application/json', kind: 'text' },
  { ext: '.csv', contentType: 'text/csv', kind: 'text' },
  // image
  { ext: '.png', contentType: 'image/png', kind: 'image' },
  { ext: '.jpg', contentType: 'image/jpeg', kind: 'image' },
  { ext: '.jpeg', contentType: 'image/jpeg', kind: 'image' },
  { ext: '.webp', contentType: 'image/webp', kind: 'image' },
  { ext: '.gif', contentType: 'image/gif', kind: 'image' },
  { ext: '.avif', contentType: 'image/avif', kind: 'image' },
  { ext: '.svg', contentType: 'image/svg+xml', kind: 'image' },
  { ext: '.bmp', contentType: 'image/bmp', kind: 'image' },
  { ext: '.ico', contentType: 'image/x-icon', kind: 'image' },
  { ext: '.tiff', contentType: 'image/tiff', kind: 'image' },
  { ext: '.heic', contentType: 'image/heic', kind: 'image' },
  // video
  { ext: '.mp4', contentType: 'video/mp4', kind: 'video' },
  { ext: '.webm', contentType: 'video/webm', kind: 'video' },
  { ext: '.mov', contentType: 'video/quicktime', kind: 'video' },
  { ext: '.m4v', contentType: 'video/x-m4v', kind: 'video' },
  { ext: '.ogv', contentType: 'video/ogg', kind: 'video' },
  { ext: '.avi', contentType: 'video/x-msvideo', kind: 'video' },
  { ext: '.mpeg', contentType: 'video/mpeg', kind: 'video' },
  // audio
  { ext: '.mp3', contentType: 'audio/mpeg', kind: 'audio' },
  { ext: '.wav', contentType: 'audio/wav', kind: 'audio' },
  { ext: '.m4a', contentType: 'audio/mp4', kind: 'audio' },
  { ext: '.aac', contentType: 'audio/aac', kind: 'audio' },
  { ext: '.ogg', contentType: 'audio/ogg', kind: 'audio' },
  { ext: '.oga', contentType: 'audio/ogg', kind: 'audio' },
  { ext: '.flac', contentType: 'audio/flac', kind: 'audio' },
  { ext: '.opus', contentType: 'audio/opus', kind: 'audio' },
  { ext: '.weba', contentType: 'audio/webm', kind: 'audio' },
  // model3d
  { ext: '.glb', contentType: 'model/gltf-binary', kind: 'model3d' },
  // document
  { ext: '.pdf', contentType: 'application/pdf', kind: 'document' },
  { ext: '.docx', contentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', kind: 'document' },
  { ext: '.xlsx', contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', kind: 'document' },
]

// 派生索引(模块加载一次,O(1) 查)。
const BY_EXT = new Map<string, MediaTypeEntry>(MEDIA_TYPES.map((e) => [e.ext, e]))
// 反查:同一 contentType 可能多扩展名(jpg/jpeg),取表中第一条作规范扩展名。
const BY_CONTENT_TYPE = new Map<string, MediaTypeEntry>()
for (const entry of MEDIA_TYPES) {
  if (!BY_CONTENT_TYPE.has(entry.contentType)) BY_CONTENT_TYPE.set(entry.contentType, entry)
}

/** 规范化为带前导点的小写扩展名。接受 ".MP3" / "mp3" / "song.MP3" / "/a/b.flac" 等。 */
export function normalizeExtension(input: string): string {
  const raw = String(input || '').trim().toLowerCase()
  if (!raw) return ''
  const lastDot = raw.lastIndexOf('.')
  // 无点 → 视为纯扩展名(补点);有点 → 取最后一段(兼容文件名/路径)。
  const ext = lastDot >= 0 ? raw.slice(lastDot) : `.${raw}`
  return ext
}

/** 扩展名/文件名/路径 → kind;未知返回 null。 */
export function mediaKindFromExtension(input: string): MediaKind | null {
  return BY_EXT.get(normalizeExtension(input))?.kind ?? null
}

/** 扩展名/文件名/路径 → contentType;未知返回 null。 */
export function contentTypeFromExtension(input: string): string | null {
  return BY_EXT.get(normalizeExtension(input))?.contentType ?? null
}

/** contentType → 规范扩展名(不含点,如 "mp3");未知返回 null。带 charset 参数也能认。 */
export function extensionFromContentType(contentType: string): string | null {
  const type = String(contentType || '').split(';')[0]?.trim().toLowerCase()
  if (!type) return null
  return BY_CONTENT_TYPE.get(type)?.ext.replace(/^\./, '') ?? null
}

/** 某 kind 的全部扩展名(不含点),如 audio → ['mp3','wav',...]。 */
export function extensionsForKind(kind: MediaKind): string[] {
  return MEDIA_TYPES.filter((e) => e.kind === kind).map((e) => e.ext.replace(/^\./, ''))
}

/**
 * 为 <input accept> 生成属性值。
 * macOS/Chromium 对纯 `image/*`/`video/*`/`audio/*` 通配常因 MIME 映射不到而把文件灰掉,
 * MDN 推荐通配 + 显式扩展名一起列。这里据传入 kind 自动两者都给。
 */
export function acceptAttrForKinds(kinds: MediaKind[]): string {
  const wildcards = kinds
    .filter((k) => k === 'image' || k === 'video' || k === 'audio')
    .map((k) => `${k}/*`)
  const exts = MEDIA_TYPES.filter((e) => kinds.includes(e.kind)).map((e) => e.ext)
  return [...wildcards, ...exts].join(',')
}

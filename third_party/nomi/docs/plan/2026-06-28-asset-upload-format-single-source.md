# 素材库上传格式 —— 单一真相源治本

> 2026-06-28。起因:研究素材库上传各文件格式,发现「接受了却静默蒸发」的真 bug。

## 根因(P2)

「文件扩展名 ↔ kind ↔ contentType」的映射散在 **5 处各自维护、已漂移的表**,且最窄的那处(workspaceFileIndex.CONTENT_TYPES)才是音频能否进库的真闸门:

| 处 | 文件 | 知道的格式 | 问题 |
|---|---|---|---|
| ① 选择器 accept | `AssetLibraryPanel.UPLOAD_ACCEPT` | 最全(含 m4a/aac/ogg/flac/m4v) | 放行了下游接不住的格式 |
| ② 音频判定 | `importAudioToLibrary.AUDIO_EXTENSIONS` | mp3/wav/m4a/aac/ogg/oga/flac/opus/weba | 与③不一致 |
| ③ 项目文件分类(真闸门) | `workspaceFileIndex.CONTENT_TYPES` | **音频只认 mp3/wav** | m4a/aac/ogg/flac→"file"→被池过滤→**永不出现** |
| ④ 路径→contentType | `assetPaths.contentTypeFromPath` | **完全没有音频** | listProjectAssets 也认不出音频 |
| ⑤ MIME→扩展名 | `assetPaths.extensionFromMime` | 无音频/无 mov | 生成/下载音频落 .bin |

外加 `assetKindFromContentType` 无 audio 分支 → 音频 contentType 落 "file"。

**净 bug**:用户传 `.flac/.m4a/.aac` → accept 放行 → 上传落盘成功(扩展名保留) → ③ 认不出 → 素材池丢弃 → **静默蒸发,零报错**。

## 修法 = 立单一真相源

新建 `electron/assets/mediaTypes.ts`(纯模块,无 node 内建,renderer 可 import —— 已有 src→electron 值导入先例 exportTypes/knownVendors):一张 `MEDIA_TYPES` 表(ext, contentType, kind),所有消费者从它派生(P1 删旧表,无并行版)。

派生改造:
1. `workspaceFileIndex.classify` ← 派生(kind 映射到 WorkspaceFileKind;model3d→file 保持 glb 现状)
2. `assetPaths.contentTypeFromPath` / `extensionFromMime` ← 派生(补齐音频+mov)
3. `assetPaths.assetKindFromContentType` ← 加 audio 分支(最小,保留 startsWith 健壮性)
4. `importAudioToLibrary.AUDIO_EXTENSIONS` ← 从 mediaTypes 派生
5. `AssetLibraryPanel.UPLOAD_ACCEPT` ← 从 mediaTypes 派生

附带两个同根缺口:
- **Gap B**:`handleUploadFiles` 媒体分支只看 MIME,空 MIME 的图/视频静默丢 → 加扩展名兜底(用 mediaTypes 的 `mediaKindFromExtension`),与音频分支对称。
- **Gap C**:两个 import 函数返回的计数(超大/重复/超上限/失败)被 panel 丢弃 → 接住后 `toast` 反馈(D4 诚实交付)。

## 不动项
- WorkspaceFileKind 枚举不加 model3d(保持 glb 在文件树为 "file")。
- 画布素材节点导入路径(image/video 经 canvas node,不查 workspaceFileIndex)逻辑不变,只加扩展名兜底。
- 不改 UI 布局,只加上传结果 toast。

## 验收门
- 单测:mediaTypes(往返一致+音频全覆盖)、workspaceFileIndex(m4a/flac→audio)、assetPaths(音频 contentType/ext)、importAudioToLibrary(扩展名同源)、AssetLibraryPanel handleUploadFiles 分流(空 MIME 兜底 + 计数反馈)。
- 五门 `pnpm run gates` 全过。
- 真机走查:传 .flac/.m4a → 进音频 tab;空 MIME 图片 → 进画布;超大 → toast 提示。

## 回滚
单一 commit;回退即恢复 5 处旧表(但旧表本就有 bug,不建议)。

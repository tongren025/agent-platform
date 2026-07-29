import type { PreviewAspectRatio } from '../workbenchTypes'

export function buildMp4ExportButtonTitle(params: {
  aspectRatio: PreviewAspectRatio
  isEmpty?: boolean
  isConverting?: boolean
  isRecording?: boolean
  progressPercent?: number
}): string {
  if (params.isEmpty) return '时间轴为空，先添加素材'
  if (params.isConverting) return '正在转码 MP4'
  if (params.isRecording) return `导出中 ${Math.max(0, Math.min(100, Math.round(params.progressPercent ?? 0)))}%`
  return ['导出 MP4：1080p', params.aspectRatio, '标准发布', '保存到项目 exports 文件夹'].join(' · ')
}

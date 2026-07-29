import { describe, expect, it } from 'vitest'
import { buildMp4ExportButtonTitle } from './exportCopy'

describe('MP4 export copy', () => {
  it('explains the default export settings and destination before the user clicks', () => {
    expect(buildMp4ExportButtonTitle({ aspectRatio: '9:16' })).toBe(
      '导出 MP4：1080p · 9:16 · 标准发布 · 保存到项目 exports 文件夹',
    )
  })

  it('sets the right empty-state reason', () => {
    expect(buildMp4ExportButtonTitle({ aspectRatio: '16:9', isEmpty: true })).toBe(
      '时间轴为空，先添加素材',
    )
  })
})

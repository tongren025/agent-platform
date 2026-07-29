import { describe, expect, it } from 'vitest'
import { describeVideoPlaybackFailure, type VideoPlaybackFailureDiagnostics } from './videoPlaybackDiagnostics'

function diag(partial: Partial<VideoPlaybackFailureDiagnostics>): VideoPlaybackFailureDiagnostics {
  return {
    rawVideoUrl: 'https://example.com/x.mp4',
    playbackUrl: 'https://example.com/x.mp4',
    mediaErrorCode: null,
    mediaErrorMessage: '',
    probeMessage: '',
    ...partial,
  }
}

describe('describeVideoPlaybackFailure', () => {
  it('探针报错时直接用探针消息（地址根本读不到）', () => {
    expect(describeVideoPlaybackFailure(diag({ probeMessage: '视频代理返回 404：not found' })))
      .toBe('视频代理返回 404：not found')
  })

  it('探针成功但解码失败 → 说人话，绝不甩锅代理', () => {
    const msg = describeVideoPlaybackFailure(diag({ probeMessage: '', mediaErrorCode: 3 }))
    expect(msg).toContain('解码')
    expect(msg).not.toContain('代理')
  })

  it('探针成功 + 格式不支持(code 4) → 不再说「代理无法读取该视频地址」', () => {
    // 修复回归点：旧实现此情形硬写「代理无法读取该视频地址」，而探针刚证明地址可读，自相矛盾。
    const msg = describeVideoPlaybackFailure(diag({ probeMessage: '', mediaErrorCode: 4 }))
    expect(msg).not.toBe('代理无法读取该视频地址')
    expect(msg).not.toContain('代理')
  })

  it('无 code 时退回 MediaError 原文', () => {
    expect(describeVideoPlaybackFailure(diag({ mediaErrorMessage: 'SOME_RAW_ERROR' })))
      .toBe('SOME_RAW_ERROR')
  })

  it('什么都没有时给兜底，不崩、不甩锅代理', () => {
    const msg = describeVideoPlaybackFailure(diag({}))
    expect(msg).toBe('视频无法播放（原因未知）')
  })
})

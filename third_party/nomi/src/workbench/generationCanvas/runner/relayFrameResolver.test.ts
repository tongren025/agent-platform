import { beforeEach, describe, expect, it, vi } from 'vitest'
import { applyRelayFirstFrame } from './relayFrameResolver'
import type { ResolvedGenerationReferences } from './generationReferenceResolver'
import { getDesktopBridge } from '../../../desktop/bridge'
import { getActiveWorkbenchProjectId } from '../../project/workbenchProjectSession'

vi.mock('../../../desktop/bridge', () => ({ getDesktopBridge: vi.fn() }))
vi.mock('../../project/workbenchProjectSession', () => ({ getActiveWorkbenchProjectId: vi.fn() }))

const mockedBridge = vi.mocked(getDesktopBridge)
const mockedProjectId = vi.mocked(getActiveWorkbenchProjectId)

function refs(partial: Partial<ResolvedGenerationReferences>): ResolvedGenerationReferences {
  return {
    referenceImages: [],
    styleReferenceImages: [],
    characterReferenceImages: [],
    compositionReferenceImages: [],
    ...partial,
  }
}

function bridgeWithExtract(extractFrame: ReturnType<typeof vi.fn>) {
  return { video: { extractFrame } } as unknown as ReturnType<typeof getDesktopBridge>
}

describe('applyRelayFirstFrame — 视频接力帧（唯一消费 relayFromVideoUrl）', () => {
  beforeEach(() => {
    mockedBridge.mockReset()
    mockedProjectId.mockReset()
  })

  it('无 relay → 不动（noop，不调抽帧）', async () => {
    const extractFrame = vi.fn()
    mockedBridge.mockReturnValue(bridgeWithExtract(extractFrame))
    const r = refs({ firstFrameUrl: 'https://x/img.png' })
    await applyRelayFirstFrame(r)
    expect(extractFrame).not.toHaveBeenCalled()
    expect(r.firstFrameUrl).toBe('https://x/img.png')
  })

  it('relay 但已有 firstFrameUrl → 不覆盖、不抽帧', async () => {
    const extractFrame = vi.fn()
    mockedBridge.mockReturnValue(bridgeWithExtract(extractFrame))
    const r = refs({ relayFromVideoUrl: 'nomi-local://asset/p/v.mp4', firstFrameUrl: 'keep.png' })
    await applyRelayFirstFrame(r)
    expect(extractFrame).not.toHaveBeenCalled()
    expect(r.firstFrameUrl).toBe('keep.png')
  })

  it('① 已有 lastFrameUrl（return_last_frame 链）→ 直接复用当首帧，省抽帧', async () => {
    const extractFrame = vi.fn()
    mockedBridge.mockReturnValue(bridgeWithExtract(extractFrame))
    const r = refs({ relayFromVideoUrl: 'nomi-local://asset/p/v.mp4', lastFrameUrl: 'tail.png' })
    await applyRelayFirstFrame(r)
    expect(extractFrame).not.toHaveBeenCalled()
    expect(r.firstFrameUrl).toBe('tail.png')
    expect(r.relayFromVideoUrl).toBeUndefined()
  })

  it('② 无现成尾帧 → 抽源视频尾帧填首帧，清掉 relay 标记', async () => {
    const extractFrame = vi.fn().mockResolvedValue({ url: 'nomi-local://asset/p/frame-last.png' })
    mockedBridge.mockReturnValue(bridgeWithExtract(extractFrame))
    mockedProjectId.mockReturnValue('p')
    const r = refs({ relayFromVideoUrl: 'nomi-local://asset/p/v.mp4' })
    await applyRelayFirstFrame(r)
    expect(extractFrame).toHaveBeenCalledWith({ videoUrl: 'nomi-local://asset/p/v.mp4', which: 'last', projectId: 'p' })
    expect(r.firstFrameUrl).toBe('nomi-local://asset/p/frame-last.png')
    expect(r.relayFromVideoUrl).toBeUndefined()
  })

  it('③ 抽帧抛错 → 透传人话错误，绝不冒充（firstFrameUrl 仍空）', async () => {
    const extractFrame = vi.fn().mockRejectedValue(new Error('ffmpeg 抽帧失败'))
    mockedBridge.mockReturnValue(bridgeWithExtract(extractFrame))
    mockedProjectId.mockReturnValue('p')
    const r = refs({ relayFromVideoUrl: 'nomi-local://asset/p/v.mp4' })
    await expect(applyRelayFirstFrame(r)).rejects.toThrow(/视频接力抽帧失败/)
    expect(r.firstFrameUrl).toBeUndefined()
  })

  it('③ 抽帧返回空 url → 抛错，不冒充', async () => {
    const extractFrame = vi.fn().mockResolvedValue({ url: '' })
    mockedBridge.mockReturnValue(bridgeWithExtract(extractFrame))
    mockedProjectId.mockReturnValue('p')
    const r = refs({ relayFromVideoUrl: 'nomi-local://asset/p/v.mp4' })
    await expect(applyRelayFirstFrame(r)).rejects.toThrow(/未能从源视频取到尾帧/)
    expect(r.firstFrameUrl).toBeUndefined()
  })

  it('无当前项目 → 抛人话错误（抽帧需 projectId 落素材）', async () => {
    const extractFrame = vi.fn()
    mockedBridge.mockReturnValue(bridgeWithExtract(extractFrame))
    mockedProjectId.mockReturnValue(null)
    const r = refs({ relayFromVideoUrl: 'nomi-local://asset/p/v.mp4' })
    await expect(applyRelayFirstFrame(r)).rejects.toThrow(/找不到当前项目/)
    expect(extractFrame).not.toHaveBeenCalled()
  })
})

import { describe, expect, it, vi } from 'vitest'
import type { GenerationCanvasNode } from '../generationCanvas/model/generationCanvasTypes'
import type { GuidedProductionStageId } from './guidedProductionFlow'
import {
  appendGuidedReviewVideos,
  dispatchGuidedProductionPrimaryAction,
  startGuidedStageGeneration,
  type GuidedPrimaryActionContext,
  type GuidedPrimaryActionPorts,
} from './guidedProductionPrimaryAction'

function ports(): GuidedPrimaryActionPorts & Record<string, ReturnType<typeof vi.fn>> {
  return {
    setWorkspaceMode: vi.fn(),
    openCreationAssistant: vi.fn(),
    focusSourceEditor: vi.fn(),
    openCanvasAssistant: vi.fn(),
    openStoryboardEditor: vi.fn(),
    ensureNarrativeNodes: vi.fn(),
    requestCreation: vi.fn(),
    requestCanvas: vi.fn(),
    startGeneration: vi.fn(),
    review: vi.fn(),
  }
}

function context(
  currentStageId: GuidedProductionStageId,
  patch: Partial<GuidedPrimaryActionContext> = {},
): GuidedPrimaryActionContext {
  return {
    currentStageId,
    allComplete: false,
    currentNeedsGeneration: false,
    generationBlocked: false,
    storyboardPlanExists: false,
    storyboardPlanCommitted: false,
    documentText: '# 剧本\n△ 雨夜，人物推门。',
    translate: (key) => key,
    ...patch,
  }
}

function node(
  id: string,
  kind: GenerationCanvasNode['kind'],
  patch: Partial<GenerationCanvasNode> = {},
): GenerationCanvasNode {
  return {
    id,
    kind,
    title: id,
    prompt: `生成 ${id}`,
    position: { x: 0, y: 0 },
    ...patch,
  }
}

describe('GuidedProductionBar 顶部主按钮逐阶段点击', () => {
  it('idea：打开创作区并聚焦原稿，不触发 AI 请求或生成', () => {
    const p = ports()
    expect(dispatchGuidedProductionPrimaryAction(context('idea'), p)).toBe('idea')
    expect(p.setWorkspaceMode).toHaveBeenCalledWith('creation')
    expect(p.openCreationAssistant).toHaveBeenCalledOnce()
    expect(p.focusSourceEditor).toHaveBeenCalledOnce()
    expect(p.requestCreation).not.toHaveBeenCalled()
    expect(p.requestCanvas).not.toHaveBeenCalled()
    expect(p.startGeneration).not.toHaveBeenCalled()
  })

  it('script：一次点击只派发编剧请求', () => {
    const p = ports()
    expect(dispatchGuidedProductionPrimaryAction(context('script'), p)).toBe('script')
    expect(p.requestCreation).toHaveBeenCalledOnce()
    expect(p.focusSourceEditor).not.toHaveBeenCalled()
    expect(p.requestCreation.mock.calls[0][0]).toMatchObject({ action: 'send', requiredTool: 'append_to_end' })
    expect(p.requestCanvas).not.toHaveBeenCalled()
    expect(p.startGeneration).not.toHaveBeenCalled()
  })

  it.each(['style', 'character', 'scene', 'motion', 'keyframe', 'video'] as const)(
    '%s 未规划：只派发当前阶段建节点请求，零授权零执行',
    (stageId) => {
      const p = ports()
      expect(dispatchGuidedProductionPrimaryAction(context(stageId), p)).toBe('plan-canvas')
      expect(p.requestCanvas).toHaveBeenCalledOnce()
      expect(p.openCanvasAssistant).toHaveBeenCalledOnce()
      expect(p.openCanvasAssistant.mock.invocationCallOrder[0]).toBeLessThan(
        p.requestCanvas.mock.invocationCallOrder[0],
      )
      expect(p.requestCanvas.mock.calls[0][0]).toMatchObject({ requiredTool: 'create_canvas_nodes' })
      expect(p.startGeneration).not.toHaveBeenCalled()
      expect(p.requestCreation).not.toHaveBeenCalled()
      expect(p.ensureNarrativeNodes).toHaveBeenCalledTimes(stageId === 'style' ? 1 : 0)
    },
  )

  it.each(['style', 'character', 'scene', 'storyboard', 'keyframe', 'video'] as const)(
    '%s 已规划待生成：一次点击只直接启动本阶段，不再请求 AI',
    (stageId) => {
      const p = ports()
      expect(dispatchGuidedProductionPrimaryAction(
        context(stageId, { currentNeedsGeneration: true }),
        p,
      )).toBe('start-generation')
      expect(p.startGeneration).toHaveBeenCalledOnce()
      expect(p.startGeneration).toHaveBeenCalledWith(stageId)
      expect(p.requestCanvas).not.toHaveBeenCalled()
      expect(p.requestCreation).not.toHaveBeenCalled()
    },
  )

  it('storyboard 未规划：只派发分镜方案请求', () => {
    const p = ports()
    expect(dispatchGuidedProductionPrimaryAction(context('storyboard'), p)).toBe('plan-storyboard')
    expect(p.requestCreation.mock.calls[0][0]).toMatchObject({
      action: 'storyboard',
      requiredTool: 'propose_storyboard_plan',
    })
    expect(p.startGeneration).not.toHaveBeenCalled()
  })

  it('storyboard 待审核：只打开编辑器，不重新规划或生成', () => {
    const p = ports()
    expect(dispatchGuidedProductionPrimaryAction(context('storyboard', {
      storyboardPlanExists: true,
      storyboardPlanCommitted: false,
    }), p)).toBe('review-storyboard')
    expect(p.openStoryboardEditor).toHaveBeenCalledOnce()
    expect(p.requestCreation).not.toHaveBeenCalled()
    expect(p.startGeneration).not.toHaveBeenCalled()
  })

  it('生成中再次点击：不重复派发启动动作', () => {
    const p = ports()
    expect(dispatchGuidedProductionPrimaryAction(context('scene', {
      currentNeedsGeneration: true,
      generationBlocked: true,
    }), p)).toBe('blocked')
    expect(p.startGeneration).not.toHaveBeenCalled()
    expect(p.requestCanvas).not.toHaveBeenCalled()
  })

  it('review：只执行审片入轨动作', () => {
    const p = ports()
    expect(dispatchGuidedProductionPrimaryAction(context('review'), p)).toBe('review')
    expect(p.review).toHaveBeenCalledOnce()
    expect(p.requestCreation).not.toHaveBeenCalled()
    expect(p.requestCanvas).not.toHaveBeenCalled()
    expect(p.startGeneration).not.toHaveBeenCalled()
  })
})

describe('顶部直接生成与审片副作用', () => {
  it('连续点击同一已规划阶段只授权并执行一次', async () => {
    let resolveGrant!: (grantId: string) => void
    const grant = new Promise<string>((resolve) => { resolveGrant = resolve })
    const mintGrant = vi.fn(() => grant)
    const runPlan = vi.fn(async () => undefined)
    const setStarting = vi.fn()
    const lock = { current: false }
    const nodes = [
      node('style', 'image', { meta: { workflowStage: 'style' } }),
      node('character', 'character', { meta: { workflowStage: 'character' } }),
    ]
    const actionPorts = { mintGrant, runPlan, setStarting, authorizationFailed: vi.fn() }

    const first = startGuidedStageGeneration({ stageId: 'style', nodes, edges: [], lock }, actionPorts)
    const second = startGuidedStageGeneration({ stageId: 'style', nodes, edges: [], lock }, actionPorts)
    expect(lock.current).toBe(true)
    expect(mintGrant).toHaveBeenCalledOnce()
    await expect(second).resolves.toBe(false)
    resolveGrant('grant-1')
    await expect(first).resolves.toBe(true)

    expect(mintGrant).toHaveBeenCalledWith(['style'])
    expect(runPlan).toHaveBeenCalledOnce()
    expect(runPlan.mock.calls[0][1]).toBe('grant-1')
    expect(setStarting.mock.calls).toEqual([[true], [false]])
  })

  it('授权失败释放点击锁，下一次点击可以重试', async () => {
    const mintGrant = vi.fn()
      .mockRejectedValueOnce(new Error('授权失败'))
      .mockResolvedValueOnce('grant-2')
    const runPlan = vi.fn(async () => undefined)
    const authorizationFailed = vi.fn()
    const lock = { current: false }
    const input = {
      stageId: 'scene' as const,
      nodes: [node('scene', 'scene', { meta: { workflowStage: 'scene' } })],
      edges: [],
      lock,
    }
    const actionPorts = { mintGrant, runPlan, setStarting: vi.fn(), authorizationFailed }

    await expect(startGuidedStageGeneration(input, actionPorts)).resolves.toBe(false)
    expect(lock.current).toBe(false)
    await expect(startGuidedStageGeneration(input, actionPorts)).resolves.toBe(true)
    expect(mintGrant).toHaveBeenCalledTimes(2)
    expect(runPlan).toHaveBeenCalledOnce()
    expect(authorizationFailed).toHaveBeenCalledOnce()
  })

  it('review 按镜号把成功且未入轨的视频依次追加，失败和重复素材不入轨', () => {
    const send = vi.fn((nodeId: string, startFrame: number) => ({
      ok: true,
      endFrame: startFrame + (nodeId === 'video-1' ? 24 : 48),
    }))
    const nodes = [
      node('video-2', 'video', { status: 'success', shotIndex: 2, result: { id: 'r2', type: 'video', url: '2.mp4', createdAt: 1 } }),
      node('video-1', 'video', { status: 'success', shotIndex: 1, result: { id: 'r1', type: 'video', url: '1.mp4', createdAt: 1 } }),
      node('video-old', 'video', { status: 'success', shotIndex: 3, result: { id: 'r3', type: 'video', url: '3.mp4', createdAt: 1 } }),
      node('video-error', 'video', { status: 'error', shotIndex: 4 }),
    ]

    expect(appendGuidedReviewVideos({
      nodes,
      existingSourceIds: new Set(['video-old']),
      initialFrame: 100,
    }, send)).toBe(2)
    expect(send.mock.calls).toEqual([
      ['video-1', 100],
      ['video-2', 124],
    ])
  })
})

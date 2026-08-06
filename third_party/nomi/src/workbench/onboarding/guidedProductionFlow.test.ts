import { describe, expect, it } from 'vitest'
import type { GenerationCanvasNode } from '../generationCanvas/model/generationCanvasTypes'
import {
  deriveGuidedProductionProgress,
  isNodeReadyForGuidedGeneratedStage,
  selectPendingGuidedGenerationNodes,
} from './guidedProductionFlow'

function node(
  id: string,
  kind: GenerationCanvasNode['kind'],
  title: string,
  patch: Partial<GenerationCanvasNode> = {},
): GenerationCanvasNode {
  return {
    id,
    kind,
    title,
    prompt: '',
    position: { x: 0, y: 0 },
    ...patch,
  }
}

function progress(patch: Partial<Parameters<typeof deriveGuidedProductionProgress>[0]> = {}) {
  return deriveGuidedProductionProgress({
    documentText: '',
    nodes: [],
    storyboardPlanExists: false,
    storyboardPlanCommitted: false,
    timelineSourceNodeIds: [],
    ...patch,
  })
}

function generatedImage(id: string) {
  return {
    status: 'success' as const,
    result: { id: `${id}-result`, type: 'image' as const, createdAt: 1, url: `${id}.png` },
  }
}

describe('deriveGuidedProductionProgress', () => {
  it('空白项目只要求用户写一句话', () => {
    const result = progress()
    expect(result.current.id).toBe('idea')
    expect(result.completedCount).toBe(0)
  })

  it('一句创意之后只给生成剧本这一个下一步', () => {
    const result = progress({ documentText: '一个失忆剑客发现追杀自己的人是未来的自己。' })
    expect(result.current.id).toBe('script')
    expect(result.completedCount).toBe(1)
  })

  it('按真实资产依次推进到人物、场景和分镜', () => {
    const script = '# 剧本\n△ 雨夜，少年推开门。\n少年：谁在那里？'
    const style = node('style', 'image', '视觉风格母版图', {
      ...generatedImage('style'),
      meta: { referenceSheet: true },
    })
    const character = node('char', 'character', 'R01｜少年｜人物三视图·表情·服装', generatedImage('char'))
    expect(progress({ documentText: script, nodes: [style] }).current.id).toBe('character')
    expect(progress({ documentText: script, nodes: [style, character] }).current.id).toBe('scene')
    const scene = node('scene', 'scene', 'SCENE01｜雨巷｜场景设定·道具', generatedImage('scene'))
    expect(progress({ documentText: script, nodes: [style, character, scene] }).current.id).toBe('storyboard')
  })

  it('视觉节点只规划未出图时仍停留当前阶段', () => {
    const documentText = '# 剧本\n△ 室内，人物转身。'
    const style = node('style', 'image', '视觉风格母版图', {
      prompt: '冷色雨夜电影风格',
      meta: { referenceSheet: true },
    })
    const result = progress({ documentText, nodes: [style] })
    expect(result.current.id).toBe('style')
    expect(result.plannedByStage.style).toBe(true)
    expect(result.generatedCountByStage.style).toBe(0)
  })

  it('参考母版不被误判为分镜，真正镜头才完成分镜阶段', () => {
    const baseNodes = [
      node('style', 'image', '视觉风格母版图', { ...generatedImage('style'), meta: { referenceSheet: true } }),
      node('char', 'character', '人物三视图', generatedImage('char')),
      node('scene', 'scene', '场景母版', generatedImage('scene')),
    ]
    const documentText = '# 剧本\n△ 室内，人物转身。'
    expect(progress({ documentText, nodes: baseNodes }).current.id).toBe('storyboard')
    const shot = node('shot', 'image', '镜头 1', { ...generatedImage('shot'), shotIndex: 1 })
    expect(progress({ documentText, nodes: [...baseNodes, shot] }).current.id).toBe('motion')
  })

  it('动态、关键帧、视频与时间线都必须覆盖每一个镜头', () => {
    const nodes = [
      node('style', 'image', '视觉风格母版图', generatedImage('style')),
      node('char', 'character', '人物三视图', generatedImage('char')),
      node('scene', 'scene', '场景设定', generatedImage('scene')),
      node('shot-1', 'image', '镜头 1', { ...generatedImage('shot-1'), shotIndex: 1 }),
      node('shot-2', 'image', '镜头 2', { ...generatedImage('shot-2'), shotIndex: 2 }),
      node('motion-1', 'text', '镜头动态设计｜镜头1'),
      node('motion-2', 'text', '镜头动态设计｜镜头2'),
      node('keyframe-1', 'keyframe', '镜头1｜首帧关键帧', generatedImage('keyframe-1')),
      node('keyframe-2', 'keyframe', '镜头2｜首帧关键帧', generatedImage('keyframe-2')),
      node('video', 'video', '镜头1｜视频', { prompt: '人物向前走，镜头跟拍' }),
    ]
    const documentText = '# 剧本\n△ 人物向前走。'
    const beforeRun = progress({ documentText, nodes })
    expect(beforeRun.current.id).toBe('video')
    expect(beforeRun.hasVideoNodes).toBe(true)
    expect(beforeRun.hasGeneratedVideo).toBe(false)

    const generated = nodes.map((item) =>
      item.id === 'video'
        ? {
            ...item,
            status: 'success' as const,
            result: { id: 'result', type: 'video' as const, createdAt: 1, url: 'asset.mp4' },
          }
        : item,
    )
    expect(progress({ documentText, nodes: generated }).current.id).toBe('video')

    const allGenerated = [
      ...generated,
      node('video-2', 'video', '镜头2｜视频', {
        status: 'success',
        result: { id: 'video-2-result', type: 'video', createdAt: 1, url: 'asset-2.mp4' },
      }),
    ]
    expect(progress({ documentText, nodes: allGenerated }).current.id).toBe('review')
    expect(progress({
      documentText,
      nodes: allGenerated,
      timelineSourceNodeIds: ['text-node', 'audio-node'],
    }).completedCount).toBe(9)
    expect(progress({
      documentText,
      nodes: allGenerated,
      timelineSourceNodeIds: ['video', 'video'],
    }).completedCount).toBe(9)
    expect(progress({
      documentText,
      nodes: allGenerated,
      timelineSourceNodeIds: ['video', 'video-2'],
    }).completedCount).toBe(10)
  })
})

describe('selectPendingGuidedGenerationNodes', () => {
  it('scene 只选本阶段尚未生成的节点，不串入其他阶段或已有结果', () => {
    const pendingScene = node('scene-pending', 'scene', '雨巷场景设定', { prompt: '雨夜湿润石板路' })
    const generatedScene = node('scene-done', 'scene', '客栈场景设定', generatedImage('scene-done'))
    const character = node('character', 'character', '少年人物三视图', { prompt: '少年角色设定' })
    const storyboard = node('shot', 'image', '镜头 1', { prompt: '少年走入雨巷', shotIndex: 1 })

    expect(selectPendingGuidedGenerationNodes(
      'scene',
      [pendingScene, generatedScene, character, storyboard],
    ).map((item) => item.id)).toEqual(['scene-pending'])
  })

  it('排除 queued/running，保留 idle/error/recoverable 供失败后重试', () => {
    const nodes = [
      node('idle', 'scene', '场景设定 A', { prompt: 'A', status: 'idle' }),
      node('queued', 'scene', '场景设定 B', { prompt: 'B', status: 'queued' }),
      node('running', 'scene', '场景设定 C', { prompt: 'C', status: 'running' }),
      node('error', 'scene', '场景设定 D', { prompt: 'D', status: 'error' }),
      node('recoverable', 'scene', '场景设定 E', { prompt: 'E', status: 'recoverable' }),
    ]

    expect(selectPendingGuidedGenerationNodes('scene', nodes).map((item) => item.id)).toEqual([
      'idle',
      'error',
      'recoverable',
    ])
  })

  it('关键帧和视频按媒体阶段隔离', () => {
    const keyframe = node('keyframe', 'keyframe', '镜头1｜首帧关键帧', { prompt: '首帧构图' })
    const video = node('video', 'video', '镜头1｜视频', { prompt: '人物向前走' })
    expect(selectPendingGuidedGenerationNodes('keyframe', [keyframe, video]).map((item) => item.id)).toEqual(['keyframe'])
    expect(selectPendingGuidedGenerationNodes('video', [keyframe, video]).map((item) => item.id)).toEqual(['video'])
  })

  it('空 prompt 的 generic image + shotIndex 不是有效分镜，也不会进入待生成队列', () => {
    const emptyShot = node('empty-shot', 'image', '图片', { shotIndex: 1, prompt: '   ' })
    const queuedEmpty = node('queued-empty', 'image', '图片', { shotIndex: 2, prompt: '', status: 'queued' })
    const result = progress({ nodes: [emptyShot] })
    expect(result.plannedByStage.storyboard).toBe(false)
    expect(isNodeReadyForGuidedGeneratedStage(emptyShot, 'storyboard')).toBe(false)
    expect(isNodeReadyForGuidedGeneratedStage(queuedEmpty, 'storyboard')).toBe(false)
    expect(selectPendingGuidedGenerationNodes('storyboard', [emptyShot])).toEqual([])
  })

  it('非空真实镜头可规划待生成；已有结果即使 prompt 丢失仍计入完成', () => {
    const pendingShot = node('pending-shot', 'image', '镜头 1', { shotIndex: 1, prompt: '人物推门进入' })
    expect(progress({ nodes: [pendingShot] }).plannedByStage.storyboard).toBe(true)
    expect(selectPendingGuidedGenerationNodes('storyboard', [pendingShot]).map((item) => item.id)).toEqual(['pending-shot'])

    const generatedWithoutPrompt = node('done-shot', 'image', '镜头 1', {
      ...generatedImage('done-shot'),
      shotIndex: 1,
      prompt: '',
    })
    const generatedProgress = progress({ nodes: [generatedWithoutPrompt] })
    expect(generatedProgress.plannedByStage.storyboard).toBe(true)
    expect(generatedProgress.generatedCountByStage.storyboard).toBe(1)
    expect(generatedProgress.stages.find((stage) => stage.id === 'storyboard')?.complete).toBe(true)
  })
})

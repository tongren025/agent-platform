import { describe, expect, it } from 'vitest'
import type { GenerationCanvasNode } from '../generationCanvas/model/generationCanvasTypes'
import { deriveGuidedProductionProgress } from './guidedProductionFlow'

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
    timelineClipCount: 0,
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
    const style = node('style', 'image', '视觉风格母版图', { meta: { referenceSheet: true } })
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
      node('video', 'video', '镜头1｜视频'),
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
    expect(progress({ documentText, nodes: allGenerated, timelineClipCount: 1 }).current.id).toBe('review')
    expect(progress({ documentText, nodes: allGenerated, timelineClipCount: 2 }).completedCount).toBe(10)
  })
})

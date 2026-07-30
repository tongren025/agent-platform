import { describe, expect, it } from 'vitest'
import type {
  GenerationCanvasEdge,
  GenerationCanvasNode,
} from '../generationCanvas/model/generationCanvasTypes'
import {
  buildMissingGuidedProductionEdges,
  buildMissingNarrativeNodes,
} from './guidedProductionGraph'

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

describe('guidedProductionGraph', () => {
  it('从文稿建立故事设定与剧本两个源节点且不重复', () => {
    const documentText = '# 故事设定\n架空海港，姐妹因旧案反目。\n# 剧本\n△ 夜，姐姐推开仓库门。'
    const missing = buildMissingNarrativeNodes(documentText, [])
    expect(missing.map((item) => item.meta.workflowStage)).toEqual(['story', 'script'])
    expect(missing[0]?.prompt).toContain('架空海港')
    expect(missing[1]?.prompt).toContain('姐姐推开仓库门')

    const existing = node('story', 'text', '故事设定｜项目背景')
    expect(buildMissingNarrativeNodes(documentText, [existing])).toHaveLength(1)
  })

  it('补齐故事到剧本、剧本到资产、三类视觉参考到关键帧再到视频的生产关系', () => {
    const nodes = [
      node('story', 'text', '故事设定｜项目背景'),
      node('script', 'text', '剧本｜制作稿'),
      node('style-text', 'text', '视觉风格母版'),
      node('style', 'image', '视觉风格母版图'),
      node('char', 'character', 'R01｜姐姐｜人物三视图·表情·服装'),
      node('scene', 'scene', 'SCENE01｜仓库｜场景设定·道具'),
      node('shot', 'image', '镜头1｜分镜图', { shotIndex: 1 }),
      node('motion', 'text', '镜头动态设计｜镜头1'),
      node('first', 'keyframe', '镜头1｜首帧关键帧'),
      node('last', 'keyframe', '镜头1｜尾帧关键帧'),
      node('video', 'video', '镜头1｜视频'),
    ]
    const edges = buildMissingGuidedProductionEdges(nodes, [])
    const keys = edges.map((edge) => `${edge.source}>${edge.target}:${edge.mode}`)
    expect(keys).toContain('story>script:reference')
    expect(keys).toContain('script>char:reference')
    expect(keys).toContain('script>scene:reference')
    expect(keys).toContain('script>shot:reference')
    expect(keys).toContain('style-text>style:reference')
    expect(keys).toContain('style>first:style_ref')
    expect(keys).toContain('char>first:character_ref')
    expect(keys).toContain('scene>first:composition_ref')
    expect(keys).toContain('shot>first:composition_ref')
    expect(keys).toContain('first>video:first_frame')
    expect(keys).toContain('last>video:last_frame')
    expect(keys).toContain('motion>video:reference')
  })

  it('已有边不重复返回', () => {
    const nodes = [
      node('story', 'text', '故事设定'),
      node('script', 'text', '剧本'),
    ]
    const existing: GenerationCanvasEdge[] = [{
      id: 'edge',
      source: 'story',
      target: 'script',
      mode: 'reference',
    }]
    expect(buildMissingGuidedProductionEdges(nodes, existing)).toEqual([])
  })
})

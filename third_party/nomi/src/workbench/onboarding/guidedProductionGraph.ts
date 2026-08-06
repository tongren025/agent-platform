import type {
  GenerationCanvasEdge,
  GenerationCanvasEdgeMode,
  GenerationCanvasNode,
} from '../generationCanvas/model/generationCanvasTypes'
import { isNodeReadyForGuidedGeneratedStage } from './guidedProductionFlow'

export type GuidedProductionEdge = Pick<
  GenerationCanvasEdge,
  'source' | 'target' | 'mode'
>

export type GuidedNarrativeNode = {
  kind: 'text'
  title: string
  prompt: string
  position: { x: number; y: number }
  meta: Record<string, unknown>
}

function titleText(node: GenerationCanvasNode): string {
  return String(node.title || '').toLocaleLowerCase()
}

function fullText(node: GenerationCanvasNode): string {
  return `${node.title || ''}\n${node.prompt || ''}`.toLocaleLowerCase()
}

function matchesTitle(node: GenerationCanvasNode, pattern: RegExp): boolean {
  return pattern.test(titleText(node))
}

function workflowStage(node: GenerationCanvasNode): string {
  return String(node.meta?.workflowStage || '').toLocaleLowerCase()
}

function isStoryNode(node: GenerationCanvasNode): boolean {
  return workflowStage(node) === 'story' || matchesTitle(node, /故事设定|故事背景|世界观|story\s*(world|setting)/)
}

function isScriptNode(node: GenerationCanvasNode): boolean {
  return workflowStage(node) === 'script' || matchesTitle(node, /剧本|分场|script|screenplay/)
}

function isStyleNode(node: GenerationCanvasNode): boolean {
  return workflowStage(node) === 'style' || matchesTitle(node, /视觉风格母版|风格母版|美术母版|style\s*bible|look\s*dev/)
}

function isCharacterNode(node: GenerationCanvasNode): boolean {
  return node.kind === 'character' || workflowStage(node) === 'character' || matchesTitle(node, /人物三视图|角色三视图|character\s*(sheet|turnaround)/)
}

function isSceneNode(node: GenerationCanvasNode): boolean {
  return node.kind === 'scene' || workflowStage(node) === 'scene' || matchesTitle(node, /场景设定|场景母版|scene\s*(sheet|bible)/)
}

function isKeyframeNode(node: GenerationCanvasNode): boolean {
  return node.kind === 'keyframe' || workflowStage(node) === 'keyframe' || node.meta?.storyboardKeyframe === true || matchesTitle(node, /首帧|尾帧|关键帧|first\s*frame|last\s*frame|keyframe/)
}

function isVideoNode(node: GenerationCanvasNode): boolean {
  return node.kind === 'video' && (workflowStage(node) === 'video' || matchesTitle(node, /镜头|shot|视频/))
}

function isMotionNode(node: GenerationCanvasNode): boolean {
  return workflowStage(node) === 'motion' || matchesTitle(node, /镜头动态设计|镜头运动设计|运镜设计|motion\s*design/)
}

function isStoryboardNode(node: GenerationCanvasNode): boolean {
  return isNodeReadyForGuidedGeneratedStage(node, 'storyboard')
}

function extractShotNumber(node: GenerationCanvasNode): number | null {
  const match = fullText(node).match(/(?:镜头|shot)\s*[-_#：:]?\s*(\d+)/i)
  if (match?.[1]) return Number(match[1])
  return typeof node.shotIndex === 'number' ? node.shotIndex : null
}

function sortByShot(nodes: GenerationCanvasNode[]): GenerationCanvasNode[] {
  return [...nodes].sort((left, right) => {
    const leftShot = extractShotNumber(left) ?? Number.MAX_SAFE_INTEGER
    const rightShot = extractShotNumber(right) ?? Number.MAX_SAFE_INTEGER
    if (leftShot !== rightShot) return leftShot - rightShot
    if (left.position.y !== right.position.y) return left.position.y - right.position.y
    return left.position.x - right.position.x
  })
}

function matchingShot(
  sources: GenerationCanvasNode[],
  target: GenerationCanvasNode,
  targetIndex: number,
): GenerationCanvasNode[] {
  const targetShot = extractShotNumber(target)
  if (targetShot !== null) {
    const exact = sources.filter((source) => extractShotNumber(source) === targetShot)
    if (exact.length) return exact
  }
  return sources[targetIndex] ? [sources[targetIndex]] : []
}

function relevantAssets(
  sources: GenerationCanvasNode[],
  target: GenerationCanvasNode,
): GenerationCanvasNode[] {
  if (sources.length <= 1) return sources
  const targetText = fullText(target)
  const matches = sources.filter((source) => {
    const tokens = source.title
      .split(/[｜|·：:\s]/)
      .map((token) => token.trim())
      .filter((token) => token.length >= 2 && !/^(人物|角色|场景|设定|三视图|表情|服装|scene|character)$/i.test(token))
    return tokens.some((token) => targetText.includes(token.toLocaleLowerCase()))
  })
  return matches.length ? matches : sources
}

function section(documentText: string, heading: string, nextHeading?: string): string {
  const escaped = heading.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const next = nextHeading
    ? `(?=\\n\\s*#{1,3}\\s*${nextHeading.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?:\\s|$))`
    : '(?=\\n\\s*#{1,3}\\s|$)'
  const match = documentText.match(new RegExp(`(?:^|\\n)\\s*#{1,3}\\s*${escaped}\\s*\\n([\\s\\S]*?)${next}`, 'i'))
  return match?.[1]?.trim() || ''
}

/**
 * 把创作文稿中的故事设定与剧本映射成画布的两个生产源节点。
 * 只返回缺少的节点，调用方写入后由自动连线补上“故事设定 → 剧本”。
 */
export function buildMissingNarrativeNodes(
  documentText: string,
  nodes: readonly GenerationCanvasNode[],
): GuidedNarrativeNode[] {
  const result: GuidedNarrativeNode[] = []
  if (!nodes.some(isStoryNode)) {
    const story = section(documentText, '故事设定', '剧本')
    if (story) {
      result.push({
        kind: 'text',
        title: '故事设定｜项目背景',
        prompt: story,
        position: { x: 40, y: 40 },
        meta: { workflowStage: 'story' },
      })
    }
  }
  if (!nodes.some(isScriptNode)) {
    const script = section(documentText, '剧本')
    if (script) {
      result.push({
        kind: 'text',
        title: '剧本｜制作稿',
        prompt: script,
        position: { x: 420, y: 40 },
        meta: { workflowStage: 'script' },
      })
    }
  }
  return result
}

/**
 * 根据专业制作语义补出缺失的引用关系。只返回尚不存在的边，组件可幂等地写入 store。
 */
export function buildMissingGuidedProductionEdges(
  nodes: readonly GenerationCanvasNode[],
  edges: readonly GenerationCanvasEdge[],
): GuidedProductionEdge[] {
  const stories = nodes.filter(isStoryNode)
  const scripts = nodes.filter(isScriptNode)
  const styles = nodes.filter(isStyleNode)
  const styleVisuals = styles.filter((node) => node.kind !== 'text')
  const characters = nodes.filter(isCharacterNode)
  const scenes = nodes.filter(isSceneNode)
  const storyboards = sortByShot(nodes.filter(isStoryboardNode))
  const motions = sortByShot(nodes.filter(isMotionNode))
  const keyframes = sortByShot(nodes.filter(isKeyframeNode))
  const videos = sortByShot(nodes.filter(isVideoNode))
  const specs: GuidedProductionEdge[] = []
  const known = new Set(edges.map((edge) => `${edge.source}:${edge.target}:${edge.mode || 'reference'}`))

  const add = (
    source: GenerationCanvasNode | undefined,
    target: GenerationCanvasNode | undefined,
    mode: GenerationCanvasEdgeMode = 'reference',
  ) => {
    if (!source || !target || source.id === target.id) return
    const key = `${source.id}:${target.id}:${mode}`
    if (known.has(key)) return
    known.add(key)
    specs.push({ source: source.id, target: target.id, mode })
  }

  stories.forEach((story) => scripts.forEach((script) => add(story, script)))
  scripts.forEach((script) => {
    characters.forEach((character) => add(script, character))
    scenes.forEach((scene) => add(script, scene))
    storyboards.forEach((shot) => add(script, shot))
  })
  styles.filter((node) => node.kind === 'text').forEach((styleText) => {
    styleVisuals.forEach((styleVisual) => add(styleText, styleVisual))
  })
  const styleSource = styleVisuals[0]
  if (styleSource) {
    characters.forEach((character) => add(styleSource, character, 'style_ref'))
    scenes.forEach((scene) => add(styleSource, scene, 'style_ref'))
    keyframes.forEach((keyframe) => add(styleSource, keyframe, 'style_ref'))
  }

  keyframes.forEach((keyframe, index) => {
    relevantAssets(characters, keyframe).forEach((character) => add(character, keyframe, 'character_ref'))
    relevantAssets(scenes, keyframe).forEach((scene) => add(scene, keyframe, 'composition_ref'))
    matchingShot(storyboards, keyframe, index).forEach((shot) => add(shot, keyframe, 'composition_ref'))
  })

  videos.forEach((video, index) => {
    const matchingKeyframes = matchingShot(keyframes, video, index)
    const firstFrame = matchingKeyframes.find((node) => !matchesTitle(node, /尾帧|last\s*frame/)) || matchingKeyframes[0]
    const lastFrame = matchingKeyframes.find((node) => matchesTitle(node, /尾帧|last\s*frame/))
    add(firstFrame, video, 'first_frame')
    add(lastFrame, video, 'last_frame')
    matchingShot(motions, video, index).forEach((motion) => add(motion, video))
  })

  return specs
}

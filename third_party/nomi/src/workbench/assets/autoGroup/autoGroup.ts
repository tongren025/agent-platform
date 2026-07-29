/**
 * 「找素材」自动分组 —— 领域层（纯函数，可单测，不碰 store/IO）。
 *
 * 设计见 docs/plan/2026-06-28-canvas-auto-grouping-and-find.md。一句话：
 * 像相册一样——看懂每张图大概是什么 → 把内容相近的归一堆 → 起大白话名。
 * 这里只做"可确定"的部分（按用途切分/变体叠摞/解析+闸住分组结果）；
 * "看懂内容并聚成命名堆"那一步由文本大脑产出 JSON，本层负责解析 + 防错闸。
 *
 * 防错铁律：分错比不分糟。低置信 / 单张的，一律落"未分组"墙，绝不硬塞进组。
 */
import type { GenerationCanvasNode, GenerationCanvasEdge } from '../../generationCanvas/model/generationCanvasTypes'
import { listMountedCards, type MountedCard } from '../../generationCanvas/hooks/useNodeRelationships'

export type FindZone = 'film' | 'reference'

/** 找素材网格里的一项（从画布节点投影出的、面向"找"的轻视图）。 */
export type FindItem = {
  nodeId: string
  title: string
  prompt?: string
  thumbUrl?: string
  zone: FindZone
  createdAt: number
  /** 用户自打标记（主镜/备选/废 等），来自 node.meta.mark；空=未标。 */
  mark?: string
  /** 挂载的角色/场景卡（=谁/在哪），喂给文本大脑做"看懂内容"，也用于命名。 */
  mounted: MountedCard[]
  /** 变体叠摞用：变体链的根 id（无派生则=自身）。同根的算一摞。 */
  variantRootId: string
  categoryId: string
  /** 文本大脑读提示词归出的组名（写在 node.meta.autoGroup）；没连卡的镜头靠它归组。 */
  autoGroupName?: string
}

const CARD_KINDS = new Set(['character', 'scene', 'prop']) // 设定卡=配料，不进"找素材"网格（它们在制作结构视图 + 充当 who/where 标签）

const IMPORT_META_SOURCES = new Set(['upload', 'clipboard-url', 'drop'])

/** 导入素材(参考) vs 生成成片：导入=参考库，生成=成片。 */
export function classifyZone(node: GenerationCanvasNode): FindZone {
  if (node.kind === 'asset') return 'reference'
  const source = typeof node.meta?.source === 'string' ? node.meta.source : undefined
  if (source && IMPORT_META_SOURCES.has(source)) return 'reference'
  return 'film'
}

function thumbOf(node: GenerationCanvasNode): string | undefined {
  const r = node.result
  return r?.thumbnailUrl || r?.url || r?.providerUrl || undefined
}

function createdAtOf(node: GenerationCanvasNode): number {
  const ts = node.result?.provenance?.timestamp
  if (typeof ts === 'number') return ts
  const metaTs = node.meta?.createdAt
  return typeof metaTs === 'number' ? metaTs : 0
}

/** 顺着 derivedFrom/regeneratedFrom 找到变体链根 id（带环保护）。 */
export function resolveVariantRoot(
  node: GenerationCanvasNode,
  byId: ReadonlyMap<string, GenerationCanvasNode>,
): string {
  let current = node
  const seen = new Set<string>([current.id])
  for (;;) {
    const parentId = current.derivedFrom || current.regeneratedFrom
    if (!parentId || seen.has(parentId)) break
    const parent = byId.get(parentId)
    if (!parent) break
    seen.add(parentId)
    current = parent
  }
  return current.id
}

/**
 * 把画布节点投影成"找素材"项：剔配料卡 + 无缩略图的空节点，区分成片/参考，
 * 带上挂载卡(who/where)、变体根、用户标记、时间。
 */
export function toFindItems(
  nodes: readonly GenerationCanvasNode[],
  edges: readonly GenerationCanvasEdge[],
): FindItem[] {
  const byId = new Map(nodes.map((n) => [n.id, n]))
  const items: FindItem[] = []
  for (const node of nodes) {
    if (CARD_KINDS.has(node.kind)) continue
    const thumbUrl = thumbOf(node)
    if (!thumbUrl) continue // 还没出图的空节点不进"找"网格
    const mark = typeof node.meta?.mark === 'string' ? node.meta.mark : undefined
    const autoGroupName = typeof node.meta?.autoGroup === 'string' ? node.meta.autoGroup : undefined
    items.push({
      nodeId: node.id,
      title: node.title || node.prompt?.slice(0, 24) || '未命名',
      prompt: node.prompt,
      thumbUrl,
      zone: classifyZone(node),
      createdAt: createdAtOf(node),
      mark,
      mounted: listMountedCards(node.id, nodes, edges),
      variantRootId: resolveVariantRoot(node, byId),
      categoryId: node.categoryId || 'shots',
      autoGroupName,
    })
  }
  return items
}

/** 一摞变体：root 项 + 同根其余项（按时间倒序，最新在前作封面）。 */
export type VariantStack = {
  rootId: string
  cover: FindItem
  items: FindItem[] // 含 cover，≥1
}

/** 把同一变体根的项收成一摞（同场戏多版不再糊满屏）。 */
export function stackVariants(items: readonly FindItem[]): VariantStack[] {
  const groups = new Map<string, FindItem[]>()
  for (const it of items) {
    const list = groups.get(it.variantRootId)
    if (list) list.push(it)
    else groups.set(it.variantRootId, [it])
  }
  const stacks: VariantStack[] = []
  for (const [rootId, list] of groups) {
    const sorted = [...list].sort((a, b) => b.createdAt - a.createdAt)
    stacks.push({ rootId, cover: sorted[0], items: sorted })
  }
  return stacks
}

// ── 确定性分组（零模型）：按连线挂载的角色/场景卡归命名合集 ──────────────────
// 一条镜头连了「林夏」卡+「雪地」卡 → 它就属于"雪地·林夏"，是结构化事实不是猜。
// 没挂卡的镜头(谁/在哪未知)落"未分组"墙——交给以后的文本大脑层读提示词补。

export type FindGroup = { key: string; name: string; stacks: VariantStack[] }

/** 从挂载卡派生大白话组名（场景·角色），如 "雪地 · 林夏"、"咖啡馆 · 林夏+陈默"、"林夏"。 */
export function deriveGroupName(cards: readonly MountedCard[]): string {
  const scenes = cards.filter((c) => c.kind === 'scene').map((c) => c.title).filter(Boolean)
  const chars = cards.filter((c) => c.kind === 'character').map((c) => c.title).filter(Boolean)
  return [scenes.join('+'), chars.join('+')].filter(Boolean).join(' · ') || '未命名'
}

/**
 * 成片按"挂了哪些卡"确定性归组（零模型）。≥minSize 的同组合才成组(防错)，
 * 没挂卡的、或不够人数的，落"未分组"。组按张数降序、未分组按最近降序。
 */
export function groupFilmStacksByCards(
  stacks: readonly VariantStack[],
  minSize: number = MIN_GROUP_SIZE,
): { groups: FindGroup[]; ungrouped: VariantStack[] } {
  const buckets = new Map<string, FindGroup>()
  const ungrouped: VariantStack[] = []
  for (const st of stacks) {
    const cards = st.cover.mounted
    let key: string
    let name: string
    if (cards.length > 0) {
      // 连了卡 → 确定性归组（最可靠，优先）
      key = `card:${cards.map((c) => c.id).sort().join('|')}`
      name = deriveGroupName(cards)
    } else if (st.cover.autoGroupName) {
      // 没连卡但文本大脑读提示词归过组 → 用 AI 组名
      key = `ai:${st.cover.autoGroupName}`
      name = st.cover.autoGroupName
    } else {
      ungrouped.push(st)
      continue
    }
    const bucket = buckets.get(key)
    if (bucket) bucket.stacks.push(st)
    else buckets.set(key, { key, name, stacks: [st] })
  }
  const groups: FindGroup[] = []
  for (const bucket of buckets.values()) {
    if (bucket.stacks.length >= minSize) groups.push(bucket)
    else ungrouped.push(...bucket.stacks)
  }
  groups.sort((a, b) => b.stacks.length - a.stacks.length)
  ungrouped.sort((a, b) => b.cover.createdAt - a.cover.createdAt)
  return { groups, ungrouped }
}

// ── 文本大脑分组结果的解析 + 防错闸 ────────────────────────────────────────

export type ContentGroup = { name: string; nodeIds: string[] }
export type GroupingResult = { groups: ContentGroup[]; ungroupedIds: string[] }

/** 默认置信度闸（实测 TinyCLIP 零样本≥0.70→精度95%；文本大脑同理保守取 0.7）。 */
export const DEFAULT_CONFIDENCE = 0.7
/** 成组最小张数（单张不成组，落墙）。 */
export const MIN_GROUP_SIZE = 2

/** 给文本大脑的归组指令：读每条镜头的提示词 → 把画面相近的归命名堆，严格只输出 JSON。 */
export function buildGroupingPrompt(items: ReadonlyArray<{ nodeId: string; prompt?: string; title?: string }>): string {
  const lines = items.map((it) => `- id=${it.nodeId}: ${(it.prompt || it.title || '').replace(/\s+/g, ' ').slice(0, 120)}`)
  return [
    '你是素材整理助手。下面是一批视频镜头，每条有 id 和它的画面描述。',
    '请把"画面内容相近"的归成几堆，每堆起一个简短大白话名字（像相册："雪地里的林夏"、"雨夜街头"）。',
    '规则：① 只把确实相近的（≥2 条）归一堆；② 拿不准的别硬归，留着不分；③ 名字用中文、≤8 字，点出 场景/谁/在干嘛；④ 严格只输出下面格式的 JSON，不要任何解释。',
    '镜头：',
    ...lines,
    '只输出这个 JSON（confidence 0~1，表示这堆归得有多准）：',
    '{"groups":[{"name":"雪地里的林夏","nodeIds":["id1","id2"],"confidence":0.9}]}',
  ].join('\n')
}

type RawGroup = { name?: unknown; nodeIds?: unknown; confidence?: unknown }

/** 从可能带```json围栏/前后废话的文本里抠出第一个 JSON 对象。 */
export function extractJsonObject(text: string): unknown {
  if (!text) return null
  const start = text.indexOf('{')
  const end = text.lastIndexOf('}')
  if (start < 0 || end <= start) return null
  try {
    return JSON.parse(text.slice(start, end + 1))
  } catch {
    return null
  }
}

/**
 * 解析文本大脑的分组 JSON（形如 {"groups":[{"name","nodeIds","confidence"}]}），
 * 并施加防错闸：① 只认在 validIds 里的 nodeId；② 置信度<闸 或 成组<MIN 的，成员落"未分组"。
 * 任何解析失败 → 全部落未分组（绝不假装分好）。
 */
export function parseGroupingResult(
  rawText: string,
  validIds: readonly string[],
  options?: { confidence?: number; minGroupSize?: number },
): GroupingResult {
  const minConf = options?.confidence ?? DEFAULT_CONFIDENCE
  const minSize = options?.minGroupSize ?? MIN_GROUP_SIZE
  const valid = new Set(validIds)
  const assigned = new Set<string>()
  const groups: ContentGroup[] = []

  const parsed = extractJsonObject(rawText) as { groups?: unknown } | null
  const rawGroups = Array.isArray(parsed?.groups) ? (parsed!.groups as RawGroup[]) : []
  for (const g of rawGroups) {
    const name = typeof g?.name === 'string' ? g.name.trim() : ''
    const conf = typeof g?.confidence === 'number' ? g.confidence : 1 // 没给置信度=视为通过(由 LLM 只产有把握的组)
    const ids = Array.isArray(g?.nodeIds) ? (g.nodeIds as unknown[]) : []
    if (!name || conf < minConf) continue
    const members = ids
      .filter((id): id is string => typeof id === 'string' && valid.has(id) && !assigned.has(id))
    if (members.length < minSize) continue
    members.forEach((id) => assigned.add(id))
    groups.push({ name, nodeIds: members })
  }
  const ungroupedIds = validIds.filter((id) => !assigned.has(id))
  return { groups, ungroupedIds }
}

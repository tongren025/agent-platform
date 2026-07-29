// 能力核 · 纯图操作领域层（见 docs/plan/2026-06-20-capability-core-headless-exposure.md）。
//
// 这是「外部 agent / CLI / MCP 驱动 Nomi 画布」的最底层：把对画布工程的语义操作
// （建节点 / 连线 / 改提示词 / 删节点 / 读画布）实现成**纯函数**——输入一份
// GenerationCanvasSnapshot（即 project.json 的 payload.generationCanvas，纯 JSON），
// 输出新的 snapshot + 受影响的 id。零 electron、零 store、零副作用，故可在纯 Node 单测。
//
// 真相源铁律（P1）：节点/边的形状以 renderer 的 generationCanvasTypes 为准；这里**不复制
// 任何业务逻辑**，只按那份形状增删改 JSON。建出的节点是「最小合法节点」——renderer 载入时
// 走既有 normalize（categoryMigration / getNodeSize 等）补全，不在这里抢着算。
import { randomUUID } from 'node:crypto'

/** 画布快照（project.json payload.generationCanvas 的纯 JSON 形状）。 */
export type CanvasSnapshot = {
  nodes: CanvasNode[]
  edges: CanvasEdge[]
  groups?: unknown[]
  selectedNodeIds?: string[]
}

export type CanvasNode = {
  id: string
  kind: string
  title: string
  position: { x: number; y: number }
  size?: { width: number; height: number }
  prompt?: string
  references?: string[]
  status?: string
  categoryId?: string
  meta?: Record<string, unknown>
  [key: string]: unknown
}

export type CanvasEdge = {
  id: string
  source: string
  target: string
  mode?: string
  order?: number
}

/** 建节点入参——只收语义字段，几何缺省由这里补最小值（renderer 会再归一）。 */
export type NodeSpec = {
  kind?: string
  title?: string
  prompt?: string
  x?: number
  y?: number
  references?: string[]
}

export type ConnectionSpec = {
  source: string
  target: string
  mode?: string
}

// 最小默认尺寸：仅供 headless 建节点占位，renderer 的 registry.defaultSize 是权威，
// 节点带 size 时各几何子系统用 node.size（getNodeSize 单一真相源），缺省才回退。
// 这里给一个保守通用值，不按 kind 细分——避免在主进程复制 registry（那才是并行版）。
const DEFAULT_NODE_SIZE = { width: 340, height: 280 }

const VALID_EDGE_MODES = new Set([
  'reference',
  'first_frame',
  'last_frame',
  'style_ref',
  'character_ref',
  'composition_ref',
])

let idCounter = 0

/**
 * 生成稳定且不撞的 id。不可用 Date.now()/Math.random() 之外的来源——这里用
 * crypto.randomUUID 保证跨进程唯一（撞 id 是「文字 clip 撞 id」那类 P0 的根因，见
 * clip-timeline-walkthrough 记忆），prefix 标明类型便于排错。
 */
function genId(prefix: string): string {
  idCounter += 1
  return `${prefix}-${randomUUID().slice(0, 8)}-${idCounter.toString(36)}`
}

function cloneSnapshot(snapshot: CanvasSnapshot): CanvasSnapshot {
  return {
    nodes: snapshot.nodes.map((node) => ({ ...node })),
    edges: snapshot.edges.map((edge) => ({ ...edge })),
    ...(snapshot.groups ? { groups: snapshot.groups } : {}),
    ...(snapshot.selectedNodeIds ? { selectedNodeIds: [...snapshot.selectedNodeIds] } : {}),
  }
}

/** 空快照（新工程 / payload 缺 generationCanvas 时的兜底）。 */
export function emptyCanvasSnapshot(): CanvasSnapshot {
  return { nodes: [], edges: [], groups: [], selectedNodeIds: [] }
}

/** 把任意 unknown（来自 project.json）规整成可操作的 CanvasSnapshot，坏数据降级为空。 */
export function normalizeSnapshot(value: unknown): CanvasSnapshot {
  if (!value || typeof value !== 'object') return emptyCanvasSnapshot()
  const raw = value as Record<string, unknown>
  const nodes = Array.isArray(raw.nodes) ? (raw.nodes as CanvasNode[]) : []
  const edges = Array.isArray(raw.edges) ? (raw.edges as CanvasEdge[]) : []
  return {
    nodes: nodes.filter((node) => node && typeof node.id === 'string'),
    edges: edges.filter((edge) => edge && typeof edge.id === 'string' && typeof edge.source === 'string' && typeof edge.target === 'string'),
    groups: Array.isArray(raw.groups) ? (raw.groups as unknown[]) : [],
    selectedNodeIds: Array.isArray(raw.selectedNodeIds) ? (raw.selectedNodeIds as string[]) : [],
  }
}

/** 读画布：返回精简到「外部 agent 需要据此决策」的字段，不灌完整 raw（R2 极简）。 */
export function readCanvas(snapshot: CanvasSnapshot): {
  nodes: Array<{ id: string; kind: string; title: string; prompt: string; status: string; position: { x: number; y: number }; hasResult: boolean }>
  edges: Array<{ id: string; source: string; target: string; mode: string }>
} {
  return {
    nodes: snapshot.nodes.map((node) => ({
      id: node.id,
      kind: node.kind,
      title: node.title || '',
      prompt: typeof node.prompt === 'string' ? node.prompt : '',
      status: typeof node.status === 'string' ? node.status : 'idle',
      position: node.position || { x: 0, y: 0 },
      hasResult: Boolean(node.result),
    })),
    edges: snapshot.edges.map((edge) => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      mode: edge.mode || 'reference',
    })),
  }
}

/**
 * 批量建节点。缺省纵向自动排布（避免外部调用方不给坐标时全堆原点重叠——那是
 * 「布局无避让」类问题的入口）。返回新快照 + 新建 id（按入参顺序，供后续连线引用）。
 */
export function addNodes(
  snapshot: CanvasSnapshot,
  specs: NodeSpec[],
): { snapshot: CanvasSnapshot; ids: string[] } {
  const next = cloneSnapshot(snapshot)
  const ids: string[] = []
  // 起始落点：现有节点最大 y 之下，避免叠在已有内容上。
  const baseY = next.nodes.reduce((max, node) => Math.max(max, (node.position?.y ?? 0) + (node.size?.height ?? DEFAULT_NODE_SIZE.height)), 0)
  specs.forEach((spec, index) => {
    const id = genId('node')
    ids.push(id)
    const kind = (spec.kind && spec.kind.trim()) || 'text'
    next.nodes.push({
      id,
      kind,
      title: (spec.title && spec.title.trim()) || '',
      position: {
        x: typeof spec.x === 'number' ? spec.x : 0,
        y: typeof spec.y === 'number' ? spec.y : baseY + 40 + index * (DEFAULT_NODE_SIZE.height + 40),
      },
      size: { ...DEFAULT_NODE_SIZE },
      ...(spec.prompt ? { prompt: spec.prompt } : {}),
      ...(spec.references && spec.references.length ? { references: [...spec.references] } : {}),
      status: 'idle',
    })
  })
  return { snapshot: next, ids }
}

/**
 * 批量连线。order 按「该 target 现有入边数」递增赋值（全模式单调、全局插入序）——
 * 与 renderer connectNodes 同一口径（generationCanvasTypes 注释），保住「谁是 character1」。
 * 跳过：端点不存在 / 自环 / 重复（同 source→target 同 mode）。返回新快照 + 新建边 id。
 */
export function connectNodes(
  snapshot: CanvasSnapshot,
  connections: ConnectionSpec[],
): { snapshot: CanvasSnapshot; edgeIds: string[]; skipped: Array<{ connection: ConnectionSpec; reason: string }> } {
  const next = cloneSnapshot(snapshot)
  const nodeIds = new Set(next.nodes.map((node) => node.id))
  const edgeIds: string[] = []
  const skipped: Array<{ connection: ConnectionSpec; reason: string }> = []
  for (const connection of connections) {
    const mode = connection.mode && VALID_EDGE_MODES.has(connection.mode) ? connection.mode : 'reference'
    if (!nodeIds.has(connection.source) || !nodeIds.has(connection.target)) {
      skipped.push({ connection, reason: '端点节点不存在' })
      continue
    }
    if (connection.source === connection.target) {
      skipped.push({ connection, reason: '不能自连' })
      continue
    }
    const duplicate = next.edges.some(
      (edge) => edge.source === connection.source && edge.target === connection.target && (edge.mode || 'reference') === mode,
    )
    if (duplicate) {
      skipped.push({ connection, reason: '重复连线' })
      continue
    }
    const order = next.edges.filter((edge) => edge.target === connection.target).length
    const id = genId('edge')
    edgeIds.push(id)
    next.edges.push({ id, source: connection.source, target: connection.target, mode, order })
  }
  return { snapshot: next, edgeIds, skipped }
}

/** 改节点提示词（可选改标题）。节点不存在则原样返回（changed=false）。 */
export function setNodePrompt(
  snapshot: CanvasSnapshot,
  nodeId: string,
  prompt: string,
  title?: string,
): { snapshot: CanvasSnapshot; changed: boolean } {
  const index = snapshot.nodes.findIndex((node) => node.id === nodeId)
  if (index < 0) return { snapshot, changed: false }
  const next = cloneSnapshot(snapshot)
  next.nodes[index] = {
    ...next.nodes[index],
    prompt,
    ...(typeof title === 'string' && title.trim() ? { title: title.trim() } : {}),
  }
  return { snapshot: next, changed: true }
}

/** 删节点 + 其关联边（入边出边都删，避免悬挂边）。返回新快照 + 实删 id。 */
export function deleteNodes(
  snapshot: CanvasSnapshot,
  nodeIds: string[],
): { snapshot: CanvasSnapshot; deleted: string[] } {
  const targetSet = new Set(nodeIds)
  const deleted = snapshot.nodes.filter((node) => targetSet.has(node.id)).map((node) => node.id)
  if (!deleted.length) return { snapshot, deleted: [] }
  const next = cloneSnapshot(snapshot)
  next.nodes = next.nodes.filter((node) => !targetSet.has(node.id))
  next.edges = next.edges.filter((edge) => !targetSet.has(edge.source) && !targetSet.has(edge.target))
  if (next.selectedNodeIds) next.selectedNodeIds = next.selectedNodeIds.filter((id) => !targetSet.has(id))
  return { snapshot: next, deleted }
}

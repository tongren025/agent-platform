// 参考 URL 解析的**唯一**底层助手：从节点 result 取可用 URL、按白名单校验、按 `nodeId[:resultId]`
// 引用定位。generationReferenceResolver（生成期）与 referenceSlots（能力驱动槽解析）共用这一份，
// 不再各写一套（P1 单一真相源）。
import type { GenerationCanvasNode, GenerationNodeResult } from '../model/generationCanvasTypes'

/** 只放行能直接喂给 vendor / 本地化的 URL 形态；其余（自定义 scheme、空串）一律视为无 URL。 */
export function asUrl(value: unknown): string {
  if (typeof value !== 'string') return ''
  const trimmed = value.trim()
  // nomi-local:// 是项目内素材协议（抽帧 IPC 的返回值就是它）——必须放行，
  // 否则尾帧接力抽出的帧 URL 进解析即被丢弃。
  return /^https?:\/\//i.test(trimmed) || trimmed.startsWith('/') || trimmed.startsWith('blob:') || trimmed.startsWith('nomi-local://') ? trimmed : ''
}

/** 从一条 result 取可用 URL：**优先本地持久文件**（nomi-local://）——chip 预览永不腐烂；发送前由
 *  localizeAssetsForVendor 换成 vendor 可达值（sidecar originalUrl 新鲜则零成本直用，过期则用本地字节
 *  重新上传换新链）。providerUrl 只在无本地拷贝时兜底（#4「providerUrl-only 被生成侧丢」仍覆盖）。
 *  旧口径 providerUrl 优先，是「过期临时链发给服务商→报错/无视原图 + chip 加载失败」整类问题的根因
 *  （2026-07-06 根治，docs/plan/2026-07-06-i2i-reference-reliability.md L2）。 */
export function resultUrl(result: GenerationNodeResult | undefined): string {
  return asUrl(result?.url) || asUrl(result?.providerUrl) || asUrl(result?.thumbnailUrl)
}

/** 按 `nodeId` 或 `nodeId:resultId` 引用定位一条 result 的 URL；定位不到 → ''。 */
export function findNodeResultUrl(nodesById: Map<string, GenerationCanvasNode>, reference: string): string {
  const [nodeId, resultId] = reference.split(':')
  const node = nodesById.get(nodeId)
  if (!node) return ''
  if (resultId) {
    const result = node.history?.find((entry) => entry.id === resultId)
    return resultUrl(result)
  }
  return resultUrl(node.result) || resultUrl(node.history?.[0])
}

/** 把一个「可能是直接 URL、可能是节点引用」的值解析成 URL。 */
export function resolveReferenceUrl(nodesById: Map<string, GenerationCanvasNode>, reference: unknown): string {
  const directUrl = asUrl(reference)
  if (directUrl) return directUrl
  if (typeof reference !== 'string') return ''
  return findNodeResultUrl(nodesById, reference)
}

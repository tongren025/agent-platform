// 「元素拆解」结果 → 白板态（纯函数，可裸测）。
// Replicate 返回 N 张同尺寸全幅 RGBA 图层（index0=背景，下→上）。这里把每张做成一个铺满画布的
// CanvasAsset + 一个 LayerItem，复用白板现成的「子元素独立选中/拖动/翻转/删除」交互（不造新拖拽，守 P1）。
// 写进 node.meta.whiteboardState 后，用 WhiteboardModal(sourceKind:'image') 打开即得可摆弄的图层；
// 关闭时白板现成的「截图合成回主图」完成闭环（saveImageWhiteboardSnapshot）。
import type { WhiteboardState } from '../whiteboard/whiteboardTypes'
import { createDefaultWhiteboardState, createWhiteboardId } from '../whiteboard/whiteboardState'
import { getCanvasDimensions, type AspectRatioKey } from '../whiteboard/lib/canvas'

/** 把 N 张图层 URL（index0=背景）组装成一份白板态：每张铺满画布、各自独立图层。 */
export function buildLayerWhiteboardState(layerUrls: string[], ratio: AspectRatioKey): WhiteboardState {
  const state = createDefaultWhiteboardState(ratio)
  const dims = getCanvasDimensions(ratio, 1280)
  // 数组序 = z 序（首=背景在底，依次叠上）。每张全幅铺满，用户再拖开。
  layerUrls.forEach((url, index) => {
    if (!url) return
    const layerId = createWhiteboardId('decompose-layer')
    state.layers.push({
      id: layerId,
      name: index === 0 ? '背景' : `元素 ${index}`,
      visible: true,
      locked: false,
      opacity: 1,
      kind: 'asset',
      thumbnail: 'image',
    })
    state.canvasAssets.push({
      id: createWhiteboardId('decompose-asset'),
      layerId,
      name: index === 0 ? '背景' : `元素 ${index}`,
      url,
      source: 'generated',
      x: 0,
      y: 0,
      width: dims.width,
      height: dims.height,
    })
  })
  // 活动图层切到最上层元素（不是锁定的默认背景），方便用户上手就能选中拖。
  const topAsset = state.layers.filter((l) => l.kind === 'asset').pop()
  if (topAsset) state.activeLayerId = topAsset.id
  return state
}

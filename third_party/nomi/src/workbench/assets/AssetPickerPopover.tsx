import React from 'react'
import { BodyPortal } from '../../design'

// 把 AssetPicker 渲染到 body(BodyPortal),用 fixed 定位贴锚点 —— 逃出 composer 卡的 overflow-auto 裁剪
// (规范 §5:选择器绝不能被裁;之前 absolute 在卡内被切掉一大半、上传按钮看不见)。
// 下方空间不够则向上翻转;左右 clamp 进视口;外部点击 / Esc 关闭。

const MARGIN = 8
const GAP = 4

export default function AssetPickerPopover({ onClose, children }: { onClose: () => void; children: React.ReactNode }): JSX.Element {
  const anchorRef = React.useRef<HTMLSpanElement>(null)
  const popRef = React.useRef<HTMLDivElement>(null)
  const [pos, setPos] = React.useState<{ top: number; left: number } | null>(null)

  // 测锚点 + 弹层实际尺寸 → 决定向下/向上 + clamp。两段式:先放到锚点下,渲染后按实测高度修正。
  React.useLayoutEffect(() => {
    const anchor = anchorRef.current
    const pop = popRef.current
    if (!anchor) return
    const a = anchor.getBoundingClientRect()
    const h = pop ? pop.offsetHeight : 360
    const w = pop ? pop.offsetWidth : 300
    let top = a.bottom + GAP
    if (top + h > window.innerHeight - MARGIN) {
      // 下方放不下 → 向上翻转(贴锚点上方);仍放不下则顶到视口上边。
      top = Math.max(MARGIN, a.top - GAP - h)
    }
    let left = a.left
    if (left + w > window.innerWidth - MARGIN) left = window.innerWidth - MARGIN - w
    left = Math.max(MARGIN, left)
    setPos({ top, left })
  }, [])

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node
      if (popRef.current?.contains(t) || anchorRef.current?.contains(t)) return
      onClose()
    }
    document.addEventListener('keydown', onKey)
    document.addEventListener('mousedown', onDown)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('mousedown', onDown)
    }
  }, [onClose])

  return (
    <>
      {/* 0 尺寸锚点,留在原位用于定位计算 */}
      <span ref={anchorRef} className="inline-block w-0 h-0 align-bottom" aria-hidden />
      <BodyPortal>
        <div
          ref={popRef}
          style={{ position: 'fixed', top: pos?.top ?? -9999, left: pos?.left ?? -9999, zIndex: 60, visibility: pos ? 'visible' : 'hidden' }}
          onPointerDown={(e) => e.stopPropagation()}
        >
          {children}
        </div>
      </BodyPortal>
    </>
  )
}

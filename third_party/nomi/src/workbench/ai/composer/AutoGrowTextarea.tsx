import React from 'react'
import { cn } from '../../../utils/cn'

type AutoGrowTextareaProps = Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'style'> & {
  /** 自增高上限（px），超过后内部滚动。默认 160。 */
  maxHeight?: number
}

// 随内容自增高的 textarea：min-h 由 className 决定（如 min-h-14=56），到 maxHeight 封顶后内部滚动。
export function AutoGrowTextarea({ maxHeight = 160, className, value, onChange, ...rest }: AutoGrowTextareaProps): JSX.Element {
  const ref = React.useRef<HTMLTextAreaElement>(null)

  const resize = React.useCallback(() => {
    const el = ref.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, maxHeight)}px`
  }, [maxHeight])

  React.useLayoutEffect(() => {
    resize()
  }, [resize, value])

  return (
    <textarea
      ref={ref}
      value={value}
      onChange={(event) => {
        onChange?.(event)
        resize()
      }}
      style={{ maxHeight }}
      className={cn('workbench-autogrow', 'w-full resize-none overflow-y-auto border-0 bg-transparent font-inherit outline-none focus:shadow-none', className)}
      {...rest}
    />
  )
}

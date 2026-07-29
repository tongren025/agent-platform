import { cn } from '../../../utils/cn'

// 生成钮（底栏深色圆形主行动钮）的样式。放独立非组件模块：不触发 react-refresh 警告。
export const GENERATE_BUTTON_CLASS = cn(
  'inline-flex items-center justify-center shrink-0 w-[30px] h-[30px] p-0',
  'border-0 rounded-full bg-nomi-ink text-nomi-paper text-body leading-none cursor-pointer',
  'transition-colors hover:enabled:bg-nomi-accent',
  'disabled:bg-nomi-ink-20 disabled:text-nomi-ink-40 disabled:cursor-not-allowed',
)

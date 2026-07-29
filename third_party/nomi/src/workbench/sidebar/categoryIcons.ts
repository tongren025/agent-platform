/**
 * Tabler 图标名 → React 组件映射。
 *
 * 设计原因（spec §6.5）：
 * - `ProjectCategory.iconName` 持久化的是字符串，便于 zod 解析与跨进程传输；
 * - 实际渲染时通过本映射表查到对应 Tabler 组件，由 React 渲染 SVG。
 *
 * 5 个图标对应 Mura 设计原稿（spec §2 Tabler 图标分配）：
 * - IconLayoutRows: 分镜（3 条横向胶片格）
 * - IconUser:       角色（单人轮廓）
 * - IconPhoto:      场景（相框 + 山景）
 * - IconBox:        道具（3D 等距立方体）
 * - IconChartBar:   声音（短竖线柱状波形）
 */
import {
  IconLayoutRows,
  IconUser,
  IconPhoto,
  IconBox,
  IconChartBar,
  IconTag,
  type Icon as TablerIconComponent,
} from '@tabler/icons-react'

import type { TablerIconName } from '../project/projectCategories'

export const categoryIcons: Record<TablerIconName, TablerIconComponent> = {
  IconLayoutRows,
  IconUser,
  IconPhoto,
  IconBox,
  IconChartBar,
  IconTag, // 自定义顶层分类的通用图标
}

// 兜底到通用图标：自定义分类或旧数据带未知图标名时也不会渲染出 undefined 组件而崩。
export function getCategoryIcon(iconName: TablerIconName): TablerIconComponent {
  return categoryIcons[iconName] ?? IconTag
}

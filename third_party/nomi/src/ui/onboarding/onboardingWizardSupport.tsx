/**
 * OnboardingWizard 的支撑模块：无状态展示子组件（R9 防巨壳，不含 wizard state）。
 *
 * 注：Issue #8 删掉「AI 读文档抠参数」子系统时，配套的 milestone 数据 / 纯函数 / MilestoneRow
 * 一并删除（曾遗留为死代码，违 P1 加新必删旧）；当前只剩仍在用的 Field。
 */
import React from 'react'
import { Stack, Text } from '@mantine/core'

export function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }): JSX.Element {
  return (
    <Stack gap={4}>
      <Text size="sm" c="var(--nomi-ink)">{label}</Text>
      {children}
      {hint && <Text size="xs" c="var(--nomi-ink-60)">{hint}</Text>}
    </Stack>
  )
}

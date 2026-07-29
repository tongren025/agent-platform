// 渲染层调 skill IPC 的唯一入口（镜像 modelCatalogApi 的 requireDesktopRuntime 范式）。
// 能力派生的「权威逻辑」在 electron（deriveSkillNeeds 算 neededProviders 进 DTO）；这里只做
// 「needs − available」的平凡差集，不重复派生逻辑（P1）。
import { getDesktopBridge } from '../../desktop/bridge'
import { getWorkbenchModelCatalogHealth } from './modelCatalogApi'

export type SkillProviderKind = 'text' | 'image' | 'video'

export type SkillListItemDto = {
  directoryName: string
  name: string
  label: string
  description: string | null
  author: string | null
  stageLabels: string[]
  isPlaybook: boolean
  neededProviders: SkillProviderKind[]
  manifestError: string | null
  /** 'user'=可写用户目录（可删/可导出）；'builtin'=安装随附（只读、禁删）。 */
  origin: 'builtin' | 'user'
}

export type SkillImportResultDto = {
  ok: boolean
  dirName?: string
  skillName?: string
  error?: string
}

export type SkillDeleteResultDto = {
  ok: boolean
  dirName?: string
  error?: string
}

type PlatformEnvelope<T> = { code?: number; data?: T; message?: string }

function isPlatformWebRuntime(): boolean {
  return typeof window !== 'undefined' && typeof document !== 'undefined'
}

async function platformSkillRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const token = window.localStorage.getItem('user_token')
  const response = await fetch(`/api/v1/agentapp/registry/skills${path}`, {
    ...init,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init?.headers || {}),
    },
  })
  const envelope = await response.json() as PlatformEnvelope<T>
  if (!response.ok || envelope.code !== 200 || envelope.data === undefined) {
    throw new Error(envelope.message || `平台技能请求失败（${response.status}）`)
  }
  return envelope.data
}

function mapPlatformSkill(raw: Record<string, unknown>): SkillListItemDto | null {
  const code = String(raw.code || raw.bindingCode || '').trim()
  if (!code) return null
  const sourceType = String(raw.sourceType || raw.source_type || 'json')
  const dependencies = [
    ...(Array.isArray(raw.skillDependencies) ? raw.skillDependencies : []),
    ...(Array.isArray(raw.toolDependencies) ? raw.toolDependencies : []),
    ...(Array.isArray(raw.mcpDependencies) ? raw.mcpDependencies : []),
  ].map(String)
  return {
    directoryName: code,
    name: code,
    label: String(raw.name || code),
    description: String(raw.description || raw.summary || '') || null,
    author: 'Agent Studio',
    stageLabels: dependencies,
    isPlaybook: Boolean(raw.isTree || raw.is_tree),
    neededProviders: ['text'],
    manifestError: null,
    origin: sourceType === 'skill-md' ? 'builtin' : 'user',
  }
}

export async function listWorkbenchSkills(): Promise<SkillListItemDto[]> {
  const desktop = getDesktopBridge()
  if (desktop) return desktop.skill.list() as SkillListItemDto[]
  if (!isPlatformWebRuntime()) throw new Error('skill library requires a browser or Electron runtime')
  const rows = await platformSkillRequest<Array<Record<string, unknown>>>('')
  return rows.map(mapPlatformSkill).filter((item): item is SkillListItemDto => item !== null)
}

export async function exportWorkbenchSkill(dirName: string): Promise<unknown> {
  const desktop = getDesktopBridge()
  if (desktop) return desktop.skill.exportPackage(dirName)
  if (!isPlatformWebRuntime()) throw new Error('skill export requires a browser or Electron runtime')
  const skill = await platformSkillRequest<Record<string, unknown>>(`/${encodeURIComponent(dirName)}`)
  return { format: 'agent-studio-skill', version: 1, skill }
}

export async function importWorkbenchSkill(payload: unknown): Promise<SkillImportResultDto> {
  const desktop = getDesktopBridge()
  if (desktop) return desktop.skill.importPackage(payload) as SkillImportResultDto
  if (!isPlatformWebRuntime()) throw new Error('skill import requires a browser or Electron runtime')
  const wrapper = payload && typeof payload === 'object' ? payload as Record<string, unknown> : {}
  const candidate = (
    wrapper.skill && typeof wrapper.skill === 'object'
      ? wrapper.skill
      : wrapper
  ) as Record<string, unknown>
  const code = String(candidate.code || candidate.bindingCode || candidate.name || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/^-+|-+$/g, '')
  if (!code) return { ok: false, error: '技能包缺少可用的 code/name' }
  const skill = await platformSkillRequest<Record<string, unknown>>('', {
    method: 'POST',
    body: JSON.stringify({
      ...candidate,
      code,
      name: String(candidate.name || code),
      sourceType: 'json',
    }),
  })
  return { ok: true, dirName: code, skillName: String(skill.name || code) }
}

/** 删除一个用户技能（内置只读、删不掉，后端会拒）。 */
export async function deleteWorkbenchSkill(dirName: string): Promise<SkillDeleteResultDto> {
  const desktop = getDesktopBridge()
  if (desktop) return desktop.skill.deleteByDir(dirName) as SkillDeleteResultDto
  if (!isPlatformWebRuntime()) throw new Error('skill delete requires a browser or Electron runtime')
  await platformSkillRequest<boolean>(`/${encodeURIComponent(dirName)}`, { method: 'DELETE' })
  return { ok: true, dirName }
}

/** 当前已接入且 enabled 的模型模态集合（text/image/video；过滤掉 audio——skill 不声明 audio）。 */
export async function getAvailableSkillProviders(): Promise<Set<SkillProviderKind>> {
  const health = await getWorkbenchModelCatalogHealth()
  const set = new Set<SkillProviderKind>()
  for (const k of health.byKind) {
    if (k.enabledModels > 0 && (k.kind === 'text' || k.kind === 'image' || k.kind === 'video')) {
      set.add(k.kind)
    }
  }
  return set
}

export type SkillCapability = {
  needs: SkillProviderKind[]
  missing: SkillProviderKind[]
  satisfied: boolean
}

/** 平凡差集：skill 声明需要的模态里，当前实例缺哪些 → 缺啥清单（缺 = ⚠️ 去接入）。 */
export function skillCapabilityFor(
  item: Pick<SkillListItemDto, 'neededProviders'>,
  available: ReadonlySet<SkillProviderKind>,
): SkillCapability {
  const missing = item.neededProviders.filter((p) => !available.has(p))
  return { needs: item.neededProviders, missing, satisfied: missing.length === 0 }
}

const PROVIDER_LABEL: Record<SkillProviderKind, string> = { text: '文本', image: '图像', video: '视频' }
export function providerLabel(kind: SkillProviderKind): string {
  return PROVIDER_LABEL[kind] ?? kind
}

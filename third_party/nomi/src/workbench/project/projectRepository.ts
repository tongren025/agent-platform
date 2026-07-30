import type { TimelineState } from '../timeline/timelineTypes'
import {
  workbenchProjectRecordSchema,
  type WorkbenchProjectRecordV1,
  type WorkbenchProjectSummary,
} from './projectRecordSchema'
import type { GenerationCanvasSnapshot } from '../generationCanvas/model/generationCanvasTypes'
import type { WorkbenchDocument } from '../workbenchTypes'
import { assertWorkbenchProjectMediaUrlsPersistable } from './projectMediaMigration'
import { getDesktopBridge } from '../../desktop/bridge'
import { buildTemplateCategories, getProjectTemplate } from '../library/projectTemplates'
import { createDefaultWorkbenchDocument } from '../workbenchTypes'
import {
  PROJECT_BACKUP_INDEX_PREFIX,
  PROJECT_BACKUP_PREFIX,
  PROJECT_INDEX_KEY,
  PROJECT_RECORD_PREFIX,
  projectBackupIndexKey,
  projectBackupKey,
  projectRecordKey,
  projectRevisionBackupKey,
  readJson,
  readStorageKeys,
  removeStorageKey,
  writeJson,
} from './projectStorage'
import { readBackupIndex, rememberProjectBackup } from './projectBackup'
import {
  createProjectRecord,
  extractCanvasThumbnailUrls,
  extractThumbnailUrlsFromRaw,
  normalizePayload,
  normalizeRecord,
  normalizeSummary,
  seedDocFromMarkdown,
} from './projectNormalize'
import i18n, { getAppLocale } from '../../i18n'

type PlatformEnvelope<T> = { code?: number; data?: T; message?: string }

function isPlatformRuntime(): boolean {
  return typeof window !== 'undefined' && !getDesktopBridge()
}

async function platformProjectRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const token = window.localStorage.getItem('user_token')
  const response = await fetch(`/api/v1/agentapp/canvas/workbench/projects${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init?.headers || {}),
    },
  })
  const envelope = await response.json() as PlatformEnvelope<T>
  if (!response.ok || envelope.code !== 200 || envelope.data === undefined) {
    throw new Error(envelope.message || `工作台项目请求失败（${response.status}）`)
  }
  return envelope.data
}

export async function syncPlatformProjectIndex(): Promise<WorkbenchProjectSummary[]> {
  if (!isPlatformRuntime()) return listLocalProjects()
  const summaries = await platformProjectRequest<WorkbenchProjectSummary[]>('')
  writeIndex(summaries)
  return summaries
}

function mirrorProject(record: WorkbenchProjectRecordV1): void {
  if (!isPlatformRuntime()) return
  void platformProjectRequest(`/${encodeURIComponent(record.id)}`, {
    method: 'PUT',
    body: JSON.stringify(record),
  }).catch((error) => console.error('平台画布项目保存失败', error))
}

// 重导出：实现已拆到 projectStorage（localStorage 原语 + 配额错误），
// 但 projectRepository 对外公共导出面保持不变。
export { ProjectStorageQuotaError } from './projectStorage'

function createProjectId(): string {
  return `project-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

function formatDefaultProjectName(): string {
  const time = new Date().toLocaleString(getAppLocale(), {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
  return i18n.t('runtime.project.untitledWithTime', { time })
}

function readIndex(): WorkbenchProjectSummary[] {
  const raw = readJson(PROJECT_INDEX_KEY)
  if (!Array.isArray(raw)) return []
  return raw
    .flatMap((item): WorkbenchProjectSummary[] => {
      const summary = normalizeSummary(item)
      return summary ? [summary] : []
    })
    .sort((a, b) => b.updatedAt - a.updatedAt)
}

function readRecordSummaries(): WorkbenchProjectSummary[] {
  return readStorageKeys()
    .filter((key) => key.startsWith(PROJECT_RECORD_PREFIX))
    .flatMap((key): WorkbenchProjectSummary[] => {
      const raw = readJson(key)
      const summary = normalizeSummary(raw)
      return summary ? [summary] : []
    })
    .sort((a, b) => b.updatedAt - a.updatedAt)
}

function readMergedProjectSummaries(): WorkbenchProjectSummary[] {
  const byId = new Map<string, WorkbenchProjectSummary>()
  for (const summary of readRecordSummaries()) byId.set(summary.id, summary)
  for (const summary of readIndex()) byId.set(summary.id, summary)
  return Array.from(byId.values()).sort((a, b) => b.updatedAt - a.updatedAt)
}

function writeIndex(items: readonly WorkbenchProjectSummary[]): void {
  writeJson(PROJECT_INDEX_KEY, items)
}

export function listLocalProjects(): WorkbenchProjectSummary[] {
  const desktop = getDesktopBridge()
  if (desktop) {
    return (desktop.projects.list() as WorkbenchProjectSummary[]).sort((a, b) => b.updatedAt - a.updatedAt)
  }
  return readMergedProjectSummaries().map((summary) => {
    if (summary.thumbnailUrls?.length) return summary
    try {
      const raw = readJson(projectRecordKey(summary.id))
      const thumbnailUrls = extractThumbnailUrlsFromRaw(raw)
      if (thumbnailUrls.length)
        return {
          ...summary,
          thumbnailUrls,
          thumbnail: thumbnailUrls[0],
        }
    } catch {
      // ignore
    }
    return summary
  })
}

export function createLocalProject(
  name?: string,
  templateId?: string,
  options: { rootPath?: string; seedKey?: string } = {},
): WorkbenchProjectRecordV1 {
  const now = Date.now()
  const template = getProjectTemplate(templateId || null)
  // 草稿态：用户手动「新建空白」（无 seedKey 播种、无 rootPath 外部绑定）零编辑会被启动 GC 回收。
  // example（seedKey）/打开文件夹（rootPath）不打标记，永不被回收。
  const isDraft = !options.seedKey?.trim() && !options.rootPath?.trim()
  const summary: WorkbenchProjectSummary = {
    id: createProjectId(),
    name: typeof name === 'string' && name.trim() ? name.trim() : formatDefaultProjectName(),
    createdAt: now,
    updatedAt: now,
    revision: 0,
    savedAt: now,
    ...(options.seedKey?.trim() ? { seedKey: options.seedKey.trim() } : {}),
    ...(isDraft ? { draft: true } : {}),
  }
  const docDefaults = createDefaultWorkbenchDocument()
  const seededDocument = template.seedDocument
    ? {
        ...docDefaults,
        contentJson: seedDocFromMarkdown(template.seedDocument),
        updatedAt: now,
      }
    : docDefaults
  const record = createProjectRecord(summary, {
    workbenchDocument: seededDocument,
    categories: buildTemplateCategories(template),
  })
  const desktop = getDesktopBridge()
  if (desktop) {
    return desktop.projects.create(record) as WorkbenchProjectRecordV1
  }
  writeJson(projectRecordKey(summary.id), record)
  writeIndex([summary, ...readMergedProjectSummaries().filter((item) => item.id !== summary.id)])
  mirrorProject(record)
  return record
}

export function readLocalProject(projectId: string): WorkbenchProjectRecordV1 | null {
  const id = String(projectId || '').trim()
  if (!id) return null
  const desktop = getDesktopBridge()
  if (desktop) {
    const record = desktop.projects.read(id)
    return record ? normalizeRecord(normalizeSummary(record) || (record as WorkbenchProjectSummary), record) : null
  }
  const summary = readMergedProjectSummaries().find((item) => item.id === id)
  if (!summary) return null
  const raw = readJson(projectRecordKey(id))
  if (!raw) {
    throw new Error(i18n.t('runtime.project.recordMissing', { id }))
  }
  return normalizeRecord(summary, raw)
}

export async function readLocalProjectAsync(projectId: string): Promise<WorkbenchProjectRecordV1 | null> {
  const id = String(projectId || '').trim()
  if (!id) return null
  const desktop = getDesktopBridge()
  if (desktop?.projects.readAsync) {
    const record = await desktop.projects.readAsync(id)
    return record ? normalizeRecord(normalizeSummary(record) || (record as WorkbenchProjectSummary), record) : null
  }
  if (isPlatformRuntime()) {
    try {
      const record = await platformProjectRequest<WorkbenchProjectRecordV1>(`/${encodeURIComponent(id)}`)
      // 平台生产项目可能含数千张卡片，完整画布快照会超过浏览器 localStorage 配额。
      // 服务端才是平台运行时真相源；本地缓存失败不能反过来让“打开已有项目”失败。
      try {
        writeJson(projectRecordKey(id), record)
      } catch (error) {
        console.warn('平台画布项目较大，跳过浏览器快照缓存', error)
      }
      const summary = normalizeSummary(record)
      return summary ? normalizeRecord(summary, record) : record
    } catch {
      // 服务端不存在时回退本地缓存，兼容首次迁移前的浏览器项目。
    }
  }
  return readLocalProject(id)
}

export function saveLocalProject(
  projectId: string,
  state: {
    workbenchDocument: WorkbenchDocument
    timeline: TimelineState
    generationCanvas: GenerationCanvasSnapshot
  },
  name?: string,
): WorkbenchProjectRecordV1 {
  const id = String(projectId || '').trim()
  if (!id) throw new Error('projectId is required')
  const desktop = getDesktopBridge()
  const now = Date.now()
  const existingRecord = desktop ? desktop.projects.read(id) : readJson(projectRecordKey(id))
  const existing = desktop
    ? normalizeSummary(existingRecord)
    : readMergedProjectSummaries().find((item) => item.id === id)
  const existingRevision = (() => {
    const parsed = workbenchProjectRecordSchema.safeParse(existingRecord)
    if (parsed.success && typeof parsed.data.revision === 'number') return parsed.data.revision
    return existing?.revision ?? 0
  })()
  const thumbnailUrls = extractCanvasThumbnailUrls(state.generationCanvas.nodes)
  const thumbnail = thumbnailUrls[0] || existing?.thumbnail
  const summary: WorkbenchProjectSummary = {
    id,
    name: typeof name === 'string' && name.trim() ? name.trim() : existing?.name || i18n.t('runtime.project.untitled'),
    createdAt: existing?.createdAt || now,
    updatedAt: now,
    revision: existingRevision + 1,
    savedAt: now,
    ...(existing?.thumbStyle ? { thumbStyle: existing.thumbStyle } : {}),
    ...(existing?.seedKey ? { seedKey: existing.seedKey } : {}),
    ...(thumbnail ? { thumbnail } : {}),
    ...(thumbnailUrls.length
      ? { thumbnailUrls }
      : existing?.thumbnailUrls?.length
        ? { thumbnailUrls: existing.thumbnailUrls }
        : {}),
  }
  const payload = normalizePayload(state)
  const record: WorkbenchProjectRecordV1 = {
    ...summary,
    version: 1,
    payload,
  }
  assertWorkbenchProjectMediaUrlsPersistable(record)
  if (desktop) {
    return desktop.projects.save(id, record) as WorkbenchProjectRecordV1
  }
  if (existingRecord) {
    try {
      rememberProjectBackup(id, existingRecord)
    } catch (error) {
      if (!isPlatformRuntime()) throw error
      console.warn('平台画布项目较大，跳过浏览器备份缓存', error)
    }
  }
  const nextIndex = [summary, ...readMergedProjectSummaries().filter((item) => item.id !== id)]
  try {
    writeJson(projectRecordKey(id), record)
  } catch (error) {
    if (!isPlatformRuntime()) throw error
    console.warn('平台画布项目较大，改由服务端持久化', error)
  }
  writeIndex(nextIndex)
  mirrorProject(record)
  return record
}

export function deleteLocalProject(projectId: string): void {
  const id = String(projectId || '').trim()
  if (!id) throw new Error('projectId is required')
  const desktop = getDesktopBridge()
  if (desktop) {
    desktop.projects.delete(id)
  }
  removeStorageKey(projectRecordKey(id))
  removeStorageKey(projectBackupKey(id))
  for (const revision of readBackupIndex(id)) {
    removeStorageKey(projectRevisionBackupKey(id, revision))
  }
  removeStorageKey(projectBackupIndexKey(id))
  for (const key of readStorageKeys()) {
    if (key.startsWith(`${PROJECT_BACKUP_PREFIX}${id}:`) || key.startsWith(`${PROJECT_BACKUP_INDEX_PREFIX}${id}`)) {
      removeStorageKey(key)
    }
  }
  writeIndex(readMergedProjectSummaries().filter((item) => item.id !== id))
  if (isPlatformRuntime()) {
    void platformProjectRequest(`/${encodeURIComponent(id)}`, { method: 'DELETE' })
      .catch((error) => console.error('平台画布项目删除失败', error))
  }
}

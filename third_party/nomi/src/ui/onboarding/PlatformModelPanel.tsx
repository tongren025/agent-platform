import React from 'react'
import { Portal } from '@mantine/core'
import { NomiLogoMark, WorkbenchButton } from '../../design'
import {
  listModelCatalogModels,
  type BillingModelKind,
  type ModelCatalogModelDto,
} from '../../api/desktopClient'
import { setAssistantModelPref } from '../../workbench/ai/assistantModelPref'

type Props = {
  opened: boolean
  onClose: () => void
}

type CatalogState = {
  text: ModelCatalogModelDto[]
  image: ModelCatalogModelDto[]
  video: ModelCatalogModelDto[]
}

const EMPTY: CatalogState = { text: [], image: [], video: [] }

async function loadKind(kind: BillingModelKind): Promise<ModelCatalogModelDto[]> {
  return listModelCatalogModels({ kind, enabled: true })
}

export function PlatformModelPanel({ opened, onClose }: Props): JSX.Element | null {
  const panelRef = React.useRef<HTMLDivElement>(null)
  const [catalog, setCatalog] = React.useState<CatalogState>(EMPTY)
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState('')
  const [employeeKey, setEmployeeKey] = React.useState(
    () => window.localStorage.getItem('canvas.employee') || '',
  )

  React.useEffect(() => {
    if (!opened) return
    let alive = true
    setLoading(true)
    setError('')
    Promise.all([loadKind('text'), loadKind('image'), loadKind('video')])
      .then(([text, image, video]) => {
        if (!alive) return
        setCatalog({ text, image, video })
        const selected = employeeKey || text[0]?.modelKey || ''
        if (selected) {
          setEmployeeKey(selected)
          window.localStorage.setItem('canvas.employee', selected)
          setAssistantModelPref({ vendorKey: 'platform-employee', modelKey: selected })
        }
      })
      .catch((cause: unknown) => {
        if (alive) setError(cause instanceof Error ? cause.message : String(cause))
      })
      .finally(() => {
        if (alive) setLoading(false)
      })
    return () => {
      alive = false
    }
  }, [opened])

  React.useEffect(() => {
    if (!opened) return
    const keyHandler = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    const clickHandler = (event: MouseEvent) => {
      const target = event.target as Node | null
      if (target && panelRef.current && !panelRef.current.contains(target)) onClose()
    }
    window.addEventListener('keydown', keyHandler)
    const frame = window.requestAnimationFrame(() => window.addEventListener('mousedown', clickHandler))
    return () => {
      window.cancelAnimationFrame(frame)
      window.removeEventListener('keydown', keyHandler)
      window.removeEventListener('mousedown', clickHandler)
    }
  }, [opened, onClose])

  if (!opened) return null

  const selectEmployee = (model: ModelCatalogModelDto) => {
    setEmployeeKey(model.modelKey)
    window.localStorage.setItem('canvas.employee', model.modelKey)
    setAssistantModelPref({ vendorKey: model.vendorKey, modelKey: model.modelKey })
  }

  return (
    <Portal>
      <div
        ref={panelRef}
        role="dialog"
        aria-label="平台模型与数字员工"
        className="fixed right-3 top-16 z-[4000] flex max-h-[calc(100vh-80px)] w-[360px] flex-col overflow-hidden rounded-nomi-lg border border-nomi-line bg-nomi-paper shadow-nomi-lg"
      >
        <header className="flex items-center gap-3 border-b border-nomi-line-soft px-4 py-3">
          <NomiLogoMark size={30} />
          <div className="min-w-0 flex-1">
            <div className="text-body font-semibold text-nomi-ink">平台模型与数字员工</div>
            <div className="text-micro text-nomi-ink-40">直接使用 Agent Studio 已配置的能力</div>
          </div>
          <button
            type="button"
            className="border-0 bg-transparent text-body-sm text-nomi-ink-60 cursor-pointer"
            onClick={onClose}
          >
            关闭
          </button>
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto p-4">
          {loading ? <p className="text-body-sm text-nomi-ink-60">正在读取平台能力…</p> : null}
          {error ? (
            <div className="rounded-nomi-sm bg-red-50 px-3 py-2 text-body-sm text-red-700">{error}</div>
          ) : null}
          {!loading && !error ? (
            <>
              <section>
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="m-0 text-body-sm font-semibold text-nomi-ink">画布助手员工</h3>
                  <span className="text-micro text-nomi-ink-40">{catalog.text.length} 个</span>
                </div>
                <div className="grid gap-2">
                  {catalog.text.map((model) => {
                    const active = model.modelKey === employeeKey
                    return (
                      <button
                        key={model.modelKey}
                        type="button"
                        className={[
                          'flex w-full items-center justify-between rounded-nomi-sm border px-3 py-2 text-left cursor-pointer',
                          active
                            ? 'border-nomi-accent bg-nomi-accent-soft text-nomi-ink'
                            : 'border-nomi-line-soft bg-nomi-paper text-nomi-ink hover:bg-nomi-ink-05',
                        ].join(' ')}
                        onClick={() => selectEmployee(model)}
                      >
                        <span className="truncate text-body-sm">{model.labelZh || model.modelKey}</span>
                        <span className="text-micro text-nomi-ink-40">{active ? '当前使用' : '选择'}</span>
                      </button>
                    )
                  })}
                  {catalog.text.length === 0 ? (
                    <p className="m-0 text-body-sm text-nomi-ink-40">还没有可用数字员工。</p>
                  ) : null}
                </div>
              </section>

              <CatalogSection title="图片模型" rows={catalog.image} />
              <CatalogSection title="视频模型" rows={catalog.video} />
            </>
          ) : null}
        </div>
        <footer className="flex gap-2 border-t border-nomi-line-soft px-4 py-3">
          <WorkbenchButton variant="default" onClick={() => window.location.assign('/employees')}>
            管理数字员工
          </WorkbenchButton>
          <WorkbenchButton variant="primary" onClick={() => window.location.assign('/models')}>
            管理媒体模型
          </WorkbenchButton>
        </footer>
      </div>
    </Portal>
  )
}

function CatalogSection({ title, rows }: { title: string; rows: ModelCatalogModelDto[] }): JSX.Element {
  return (
    <section className="mt-5">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="m-0 text-body-sm font-semibold text-nomi-ink">{title}</h3>
        <span className="text-micro text-nomi-ink-40">{rows.length} 个</span>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {rows.slice(0, 12).map((model) => (
          <span
            key={`${model.vendorKey}:${model.modelKey}`}
            className="max-w-full truncate rounded-pill bg-nomi-ink-05 px-2.5 py-1 text-micro text-nomi-ink-60"
            title={model.modelKey}
          >
            {model.labelZh || model.modelKey}
          </span>
        ))}
        {rows.length === 0 ? <span className="text-body-sm text-nomi-ink-40">暂无可用模型</span> : null}
        {rows.length > 12 ? <span className="text-micro text-nomi-ink-40">另有 {rows.length - 12} 个</span> : null}
      </div>
    </section>
  )
}

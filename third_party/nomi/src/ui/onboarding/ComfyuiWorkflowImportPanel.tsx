/**
 * 本地 ComfyUI「导入自定义工作流」面板（S4）。plan: docs/plan/2026-07-15-comfyui-custom-workflow.md
 *
 * 用户在 ComfyUI 里跑通一条工作流 → 菜单 Workflow → Export (API) → 把 workflow_api.json 贴进来。
 * 「分析」调后端 analyzeComfyWorkflow 自动识别可绑定节点（提示词/首帧/输出/数值），列出建议绑定供用户确认/微调，
 * 「导入」调 importComfyWorkflow 落成用户自有 model+mapping（之后在生成画布直接选用）。
 * 纯解析/识别/落库都在后端（electron/catalog/comfyuiWorkflowImport*，可测）；本组件只做「贴→看→改→导」的壳。
 */
import React from 'react'
import { useTranslation } from 'react-i18next'
import { IconFileImport, IconWand, IconAlertTriangle, IconMovie, IconPhoto, IconPlus, IconTrash, IconX } from '@tabler/icons-react'
import { cn } from '../../utils/cn'
import { NomiSelect } from '../../design'
import { getDesktopBridge } from '../../desktop/bridge'
import { toast } from '../toast'

type Candidate = { nodeId: string; inputKey: string; classType: string; title?: string; value: string | number | boolean }
type OutputCand = { nodeId: string; classType: string; kind: 'image' | 'video' }
type NumericParam = { nodeId: string; inputKey: string; paramKey: string; label: string; default: number }
type WorkflowParamType = 'number' | 'text' | 'boolean'
type WorkflowParam = { nodeId: string; inputKey: string; paramKey: string; label: string; type: WorkflowParamType; default: string | number | boolean }
type ParamPresetKey = 'width' | 'height' | 'seconds' | 'fps'
type ParamPreset = { key: ParamPresetKey; labelKey: string; paramKey: string; match: (candidate: Candidate) => boolean }
type Binding = {
  promptNodeId?: string; promptInputKey?: string
  firstFrameNodeId?: string; firstFrameInputKey?: string
  lastFrameNodeId?: string; lastFrameInputKey?: string
  outputNodeId?: string; outputKind?: 'image' | 'video'
  numeric?: NumericParam[]
  params?: WorkflowParam[]
}
type Analysis = {
  textInputs: Candidate[]; imageInputs: Candidate[]; outputNodes: OutputCand[]; numericInputs: Candidate[]; widgetInputs?: Candidate[]
  suggested: Binding
}
type WorkflowEditInitial = { modelKey: string; labelZh: string; text: string; binding?: Binding }
type ComfyuiWorkflowImportPanelProps = {
  onImported: () => void
  initial?: WorkflowEditInitial
  onCancel?: () => void
}

const NONE = '__none__'
const nodeValue = (nodeId: string, inputKey: string) => `${encodeURIComponent(nodeId)}|${encodeURIComponent(inputKey)}`
const parseNodeValue = (raw: string): { nodeId: string; inputKey: string } | null => {
  try {
    const [nodeId, inputKey] = raw.split('|')
    if (nodeId && inputKey) return { nodeId: decodeURIComponent(nodeId), inputKey: decodeURIComponent(inputKey) }
  } catch {
    return null
  }
  return null
}
const nodeOpt = (c: Candidate) => ({ value: nodeValue(c.nodeId, c.inputKey), label: `#${c.nodeId} ${c.classType}` })
const preview = (v: string | number | boolean) => {
  if (typeof v === 'string' && v) return `「${v.slice(0, 18)}${v.length > 18 ? '…' : ''}」`
  if (typeof v === 'number' || typeof v === 'boolean') return String(v)
  return ''
}
const nodeSelectOptions = (candidates: Candidate[]) => candidates.map((t) => ({ ...nodeOpt(t), trailing: preview(t.value) || undefined }))
const PARAM_KEY_RE = /^[A-Za-z0-9_]+$/

const inferParamType = (value: Candidate['value']): WorkflowParamType => {
  if (typeof value === 'number') return 'number'
  if (typeof value === 'boolean') return 'boolean'
  return 'text'
}

const sanitizeParamKey = (raw: string, fallback: string): string => {
  const cleaned = raw.trim().replace(/[^A-Za-z0-9_]+/g, '_').replace(/^_+|_+$/g, '')
  return cleaned || fallback
}

const fallbackParamLabel = (candidate: Pick<Candidate, 'title' | 'inputKey' | 'nodeId'>): string =>
  candidate.title?.trim() || `${candidate.inputKey} #${candidate.nodeId}`

const paramFromCandidate = (candidate: Candidate, existing: WorkflowParam[] = []): WorkflowParam => {
  const label = fallbackParamLabel(candidate)
  const baseKey = sanitizeParamKey(label.toLowerCase(), `comfy_${candidate.inputKey}`)
  let paramKey = baseKey
  let i = 2
  while (existing.some((p) => p.paramKey === paramKey)) {
    paramKey = `${baseKey}_${i}`
    i += 1
  }
  return {
    nodeId: candidate.nodeId,
    inputKey: candidate.inputKey,
    paramKey,
    label,
    type: inferParamType(candidate.value),
    default: candidate.value,
  }
}

const normalizeBinding = (binding: Binding): Binding => ({
  ...binding,
  numeric: binding.numeric ?? [],
  params: binding.params ?? (binding.numeric ?? []).map((n) => ({ ...n, type: 'number' as const })),
})

const candidateSearchText = (candidate: Candidate): string =>
  `${candidate.nodeId} ${candidate.inputKey} ${candidate.classType} ${candidate.title ?? ''}`.toLowerCase()

const PARAM_PRESETS: ParamPreset[] = [
  {
    key: 'width',
    labelKey: 'onboardingProviders.comfyWorkflow.presetWidth',
    paramKey: 'comfy_width',
    match: (candidate) => /width|宽度/i.test(candidateSearchText(candidate)),
  },
  {
    key: 'height',
    labelKey: 'onboardingProviders.comfyWorkflow.presetHeight',
    paramKey: 'comfy_height',
    match: (candidate) => /height|高度/i.test(candidateSearchText(candidate)),
  },
  {
    key: 'seconds',
    labelKey: 'onboardingProviders.comfyWorkflow.presetSeconds',
    paramKey: 'comfy_seconds',
    match: (candidate) => /(seconds?|duration|时长|秒数)/i.test(candidateSearchText(candidate)),
  },
  {
    key: 'fps',
    labelKey: 'onboardingProviders.comfyWorkflow.presetFps',
    paramKey: 'comfy_fps',
    match: (candidate) => /\b(fps|frame_rate|帧率)\b/i.test(candidateSearchText(candidate)),
  },
]

export function ComfyuiWorkflowImportPanel({ onImported, initial, onCancel }: ComfyuiWorkflowImportPanelProps): JSX.Element {
  const { t } = useTranslation()
  const catalog = getDesktopBridge()?.modelCatalog
  const editMode = Boolean(initial)
  const [open, setOpen] = React.useState(editMode)
  const [text, setText] = React.useState(initial?.text ?? '')
  const [analysis, setAnalysis] = React.useState<Analysis | null>(null)
  const [binding, setBinding] = React.useState<Binding | null>(initial?.binding ? normalizeBinding(initial.binding) : null)
  const [labelZh, setLabelZh] = React.useState(initial?.labelZh ?? '')
  const [error, setError] = React.useState('')
  const [busy, setBusy] = React.useState(false)

  const reset = React.useCallback(() => {
    setText(''); setAnalysis(null); setBinding(null); setLabelZh(''); setError('')
  }, [])

  const initialModelKey = initial?.modelKey
  React.useEffect(() => {
    if (!initial) return
    setOpen(true)
    setText(initial.text)
    setLabelZh(initial.labelZh)
    setBinding(initial.binding ? normalizeBinding(initial.binding) : null)
    setError('')
    const r = catalog?.analyzeComfyWorkflow?.(initial.text)
    if (!r) { setError(t('onboardingProviders.comfyWorkflow.unsupportedEdit')); setAnalysis(null); return }
    if (!r.ok) { setError(r.error); setAnalysis(null); return }
    const a = r.analysis as Analysis
    setAnalysis(a)
    setBinding(normalizeBinding(initial.binding ?? a.suggested))
  // 只在切换编辑对象时重置表单；父级 hover/focus 状态重渲染不能覆盖用户正在编辑的内容。
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [catalog, initialModelKey])

  const analyze = React.useCallback(() => {
    setError('')
    const r = catalog?.analyzeComfyWorkflow?.(text)
    if (!r) { setError(t('onboardingProviders.comfyWorkflow.unsupported')); return }
    if (!r.ok) { setError(r.error); setAnalysis(null); setBinding(null); return }
    const a = r.analysis as Analysis
    setAnalysis(a)
    setBinding(normalizeBinding(a.suggested))
  }, [catalog, text, t])

  const paramKeyError = React.useMemo(() => {
    const params = binding?.params ?? []
    const seen = new Set<string>()
    for (const param of params) {
      if (!param.paramKey.trim() || !PARAM_KEY_RE.test(param.paramKey)) return t('onboardingProviders.comfyWorkflow.paramKeyInvalid')
      if (seen.has(param.paramKey)) return t('onboardingProviders.comfyWorkflow.paramKeyDuplicate')
      seen.add(param.paramKey)
    }
    return ''
  }, [binding?.params, t])

  const doImport = React.useCallback(() => {
    if (!binding || !catalog?.importComfyWorkflow) return
    if (paramKeyError) { setError(paramKeyError); return }
    setBusy(true)
    try {
      const name = labelZh.trim() || t('onboardingProviders.comfyWorkflow.defaultName')
      const r = editMode && initial
        ? catalog.updateComfyWorkflow?.({ modelKey: initial.modelKey, text, binding, labelZh: name }) ?? { ok: false as const, error: t('onboardingProviders.comfyWorkflow.unsupportedEdit') }
        : catalog.importComfyWorkflow({ text, binding, labelZh: name })
      if (!r.ok) { setError(r.error); return }
      const kindLabel = r.kind === 'video' ? t('onboardingProviders.comfyWorkflow.video') : t('onboardingProviders.comfyWorkflow.image')
      toast(t(editMode ? 'onboardingProviders.comfyWorkflow.saved' : 'onboardingProviders.comfyWorkflow.imported', { name, kind: kindLabel }), 'success')
      if (editMode) onCancel?.()
      else { reset(); setOpen(false) }
      onImported()
    } finally { setBusy(false) }
  }, [binding, catalog, editMode, initial, text, labelZh, onCancel, reset, onImported, paramKeyError, t])

  if (!open && !editMode) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn('self-start inline-flex items-center gap-1.5 h-8 px-3 rounded-nomi-sm border border-nomi-line',
          'text-caption text-nomi-ink-60 hover:text-nomi-accent hover:border-nomi-accent')}
      >
        <IconFileImport size={14} stroke={1.7} />{t('onboardingProviders.comfyWorkflow.importCustom')}
      </button>
    )
  }

  const setRole = (role: 'prompt' | 'firstFrame' | 'lastFrame', raw: string) => {
    setBinding((b) => {
      if (!b) return b
      if (raw === NONE) {
        if (role === 'firstFrame') return { ...b, firstFrameNodeId: undefined, firstFrameInputKey: undefined }
        if (role === 'lastFrame') return { ...b, lastFrameNodeId: undefined, lastFrameInputKey: undefined }
        return { ...b, promptNodeId: undefined, promptInputKey: undefined }
      }
      const parsed = parseNodeValue(raw)
      if (!parsed) return b
      const { nodeId, inputKey } = parsed
      if (role === 'prompt') return { ...b, promptNodeId: nodeId, promptInputKey: inputKey }
      return role === 'firstFrame'
        ? { ...b, firstFrameNodeId: nodeId, firstFrameInputKey: inputKey }
        : { ...b, lastFrameNodeId: nodeId, lastFrameInputKey: inputKey }
    })
  }
  const setOutput = (nodeId: string) => {
    setBinding((b) => {
      if (!b || !analysis) return b
      const out = analysis.outputNodes.find((o) => o.nodeId === nodeId)
      return { ...b, outputNodeId: nodeId, outputKind: out?.kind }
    })
  }
  const widgetCandidates = analysis?.widgetInputs?.length ? analysis.widgetInputs : analysis?.numericInputs ?? []
  const paramTypeOptions = [
    { value: 'number', label: t('onboardingProviders.comfyWorkflow.paramTypeNumber') },
    { value: 'text', label: t('onboardingProviders.comfyWorkflow.paramTypeText') },
    { value: 'boolean', label: t('onboardingProviders.comfyWorkflow.paramTypeBoolean') },
  ]
  const presetOptions = PARAM_PRESETS.map((preset) => {
    const candidate = widgetCandidates.find((c) => typeof c.value === 'number' && preset.match(c))
    const added = Boolean(candidate && (binding?.params ?? []).some((p) =>
      (p.nodeId === candidate.nodeId && p.inputKey === candidate.inputKey) || p.paramKey === preset.paramKey,
    ))
    return { preset, candidate, added }
  })
  const addParam = () => {
    if (!widgetCandidates.length) return
    setBinding((b) => {
      if (!b) return b
      const params = b.params ?? []
      const candidate = widgetCandidates.find((c) => !params.some((p) => p.nodeId === c.nodeId && p.inputKey === c.inputKey)) ?? widgetCandidates[0]
      return { ...b, params: [...params, paramFromCandidate(candidate, params)] }
    })
  }
  const addPresetParam = (preset: ParamPreset, candidate: Candidate) => {
    setBinding((b) => {
      if (!b) return b
      const params = b.params ?? []
      if (params.some((p) => (p.nodeId === candidate.nodeId && p.inputKey === candidate.inputKey) || p.paramKey === preset.paramKey)) return b
      return {
        ...b,
        params: [
          ...params,
          {
            nodeId: candidate.nodeId,
            inputKey: candidate.inputKey,
            paramKey: preset.paramKey,
            label: t(preset.labelKey),
            type: 'number',
            default: candidate.value,
          },
        ],
      }
    })
  }
  const updateParam = (index: number, patch: Partial<WorkflowParam>) => {
    setBinding((b) => {
      if (!b) return b
      const params = [...(b.params ?? [])]
      const current = params[index]
      if (!current) return b
      params[index] = { ...current, ...patch }
      return { ...b, params }
    })
  }
  const setParamCandidate = (index: number, raw: string) => {
    const parsed = parseNodeValue(raw)
    if (!parsed) return
    const candidate = widgetCandidates.find((c) => c.nodeId === parsed.nodeId && c.inputKey === parsed.inputKey)
    if (!candidate) return
    setBinding((b) => {
      if (!b) return b
      const params = [...(b.params ?? [])]
      const current = params[index]
      if (!current) return b
      const next = paramFromCandidate(candidate, params.filter((_, i) => i !== index))
      params[index] = { ...next, paramKey: current.paramKey || next.paramKey, label: current.label || next.label }
      return { ...b, params }
    })
  }
  const removeParam = (index: number) => {
    setBinding((b) => b ? { ...b, params: (b.params ?? []).filter((_, i) => i !== index) } : b)
  }

  const frameKindLabel = binding?.firstFrameNodeId && binding.lastFrameNodeId
    ? t('onboardingProviders.comfyWorkflow.frameKindBoth')
    : binding?.firstFrameNodeId
      ? t('onboardingProviders.comfyWorkflow.frameKindFirst')
      : binding?.lastFrameNodeId
        ? t('onboardingProviders.comfyWorkflow.frameKindLast')
        : t('onboardingProviders.comfyWorkflow.frameKindNone')

  return (
    <div className="flex flex-col gap-2.5 rounded-nomi-sm border border-nomi-line bg-nomi-paper p-3">
      <div className="flex items-center gap-2">
        <IconFileImport size={15} stroke={1.7} className="text-nomi-ink-60" />
        <span className="text-body-sm font-semibold text-nomi-ink flex-1">{editMode ? t('onboardingProviders.comfyWorkflow.editTitle') : t('onboardingProviders.comfyWorkflow.title')}</span>
        <button
          type="button"
          onClick={() => {
            if (editMode) onCancel?.()
            else { reset(); setOpen(false) }
          }}
          className="h-6 w-6 grid place-items-center rounded-nomi-sm text-nomi-ink-40 hover:bg-nomi-ink-05"
          aria-label={editMode ? t('onboardingProviders.comfyWorkflow.cancelEdit') : t('onboardingProviders.comfyWorkflow.collapse')}
        >
          <IconX size={14} stroke={1.8} />
        </button>
      </div>
      <div className="text-caption text-nomi-ink-60 leading-relaxed">
        {t('onboardingProviders.comfyWorkflow.instructionsBefore')} <code className="font-mono text-nomi-ink">{t('onboardingProviders.comfyWorkflow.exportCommand')}</code> {t('onboardingProviders.comfyWorkflow.instructionsMiddle')} <code className="font-mono text-nomi-ink">{t('onboardingProviders.comfyWorkflow.fileName')}</code> {t('onboardingProviders.comfyWorkflow.instructionsAfter')}
      </div>
      <textarea
        value={text}
        onChange={(e) => { setText(e.target.value); setAnalysis(null); setBinding(null); setError('') }}
        spellCheck={false}
        aria-label={t('onboardingProviders.comfyWorkflow.pasteArea')}
        placeholder={t('onboardingProviders.comfyWorkflow.jsonPlaceholder')}
        className={cn('w-full min-h-[110px] max-h-[220px] rounded-nomi-sm border border-nomi-line bg-nomi-paper px-2.5 py-2',
          'font-mono text-caption text-nomi-ink placeholder:text-nomi-ink-30 focus:border-nomi-accent outline-none resize-y')}
      />

      {error ? (
        <div className="flex items-start gap-2 rounded-nomi-sm bg-[var(--workbench-danger-soft)] px-2.5 py-2">
          <IconAlertTriangle size={15} className="shrink-0 mt-0.5 text-workbench-danger" />
          <span className="text-caption text-nomi-ink leading-relaxed">{error}</span>
        </div>
      ) : null}

      {!analysis ? (
        <button
          type="button" onClick={analyze} disabled={!text.trim()}
          className={cn('self-start inline-flex items-center gap-1.5 h-8 px-3 rounded-nomi-sm bg-nomi-ink text-nomi-paper',
            'text-caption font-medium hover:bg-nomi-accent disabled:opacity-45')}
        >
          <IconWand size={14} stroke={1.8} />{t('onboardingProviders.comfyWorkflow.analyze')}
        </button>
      ) : binding ? (
        <div className="flex flex-col gap-2.5">
          {/* 自动识别结果 + 可改绑定 */}
          <div className="flex items-center gap-1.5 text-caption text-nomi-ink-60">
            {binding.outputKind === 'video' ? <IconMovie size={14} className="text-nomi-accent" /> : <IconPhoto size={14} className="text-nomi-accent" />}
            {t('onboardingProviders.comfyWorkflow.detectedBefore')}<b className="text-nomi-ink font-semibold">{binding.outputKind === 'video' ? t('onboardingProviders.comfyWorkflow.video') : t('onboardingProviders.comfyWorkflow.image')}</b>{t('onboardingProviders.comfyWorkflow.detectedAfter')}{frameKindLabel}{t('onboardingProviders.comfyWorkflow.confirmBindings')}
          </div>

          <BindRow label={t('onboardingProviders.comfyWorkflow.promptNode')}>
            <NomiSelect
              ariaLabel={t('onboardingProviders.comfyWorkflow.promptNodeAria')} size="sm"
              value={binding.promptNodeId && binding.promptInputKey ? nodeValue(binding.promptNodeId, binding.promptInputKey) : NONE}
              options={nodeSelectOptions(analysis.textInputs)}
              onChange={(v) => setRole('prompt', v)}
              triggerMaxWidth={160}
              className="w-full max-w-full justify-between"
            />
          </BindRow>
          {analysis.imageInputs.length > 0 ? (
            <BindRow label={t('onboardingProviders.comfyWorkflow.firstFrameNode')}>
              <NomiSelect
                ariaLabel={t('onboardingProviders.comfyWorkflow.firstFrameNodeAria')} size="sm"
                value={binding.firstFrameNodeId && binding.firstFrameInputKey ? nodeValue(binding.firstFrameNodeId, binding.firstFrameInputKey) : NONE}
                options={[{ value: NONE, label: t('onboardingProviders.comfyWorkflow.noFirstFrame') }, ...nodeSelectOptions(analysis.imageInputs)]}
                onChange={(v) => setRole('firstFrame', v)}
                triggerMaxWidth={160}
                className="w-full max-w-full justify-between"
              />
            </BindRow>
          ) : null}
          {analysis.imageInputs.length > 1 ? (
            <BindRow label={t('onboardingProviders.comfyWorkflow.lastFrameNode')}>
              <NomiSelect
                ariaLabel={t('onboardingProviders.comfyWorkflow.lastFrameNodeAria')} size="sm"
                value={binding.lastFrameNodeId && binding.lastFrameInputKey ? nodeValue(binding.lastFrameNodeId, binding.lastFrameInputKey) : NONE}
                options={[{ value: NONE, label: t('onboardingProviders.comfyWorkflow.noLastFrame') }, ...nodeSelectOptions(analysis.imageInputs)]}
                onChange={(v) => setRole('lastFrame', v)}
                triggerMaxWidth={160}
                className="w-full max-w-full justify-between"
              />
            </BindRow>
          ) : null}
          <BindRow label={t('onboardingProviders.comfyWorkflow.outputNode')}>
            <NomiSelect
              ariaLabel={t('onboardingProviders.comfyWorkflow.outputNodeAria')} size="sm"
              value={binding.outputNodeId ?? ''}
              options={analysis.outputNodes.map((o) => ({ value: o.nodeId, label: `#${o.nodeId} ${o.classType}（${o.kind === 'video' ? t('onboardingProviders.comfyWorkflow.video') : t('onboardingProviders.comfyWorkflow.image')}）` }))}
              onChange={setOutput}
              triggerMaxWidth={160}
              className="w-full max-w-full justify-between"
            />
          </BindRow>
          <div className="flex flex-col gap-2 rounded-nomi-sm border border-nomi-line-soft bg-nomi-ink-05 p-2">
            <div className="flex items-center gap-2">
              <span className="text-caption font-semibold text-nomi-ink flex-1">{t('onboardingProviders.comfyWorkflow.customParamsTitle')}</span>
              <button
                type="button"
                onClick={addParam}
                disabled={!widgetCandidates.length}
                className={cn('inline-flex items-center gap-1 h-7 px-2 rounded-nomi-sm border border-nomi-line bg-nomi-paper',
                  'text-caption text-nomi-ink-80 hover:border-nomi-accent disabled:opacity-45')}
              >
                <IconPlus size={13} stroke={1.8} />{t('onboardingProviders.comfyWorkflow.addParam')}
              </button>
            </div>
            <div className="text-micro text-nomi-ink-40 leading-relaxed">{t('onboardingProviders.comfyWorkflow.customParamsHint')}</div>
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-micro text-nomi-ink-40">{t('onboardingProviders.comfyWorkflow.commonParams')}</span>
              {presetOptions.map(({ preset, candidate, added }) => (
                <button
                  key={preset.key}
                  type="button"
                  onClick={() => candidate ? addPresetParam(preset, candidate) : undefined}
                  disabled={!candidate || added}
                  title={candidate ? `#${candidate.nodeId}.${candidate.inputKey}` : undefined}
                  className={cn('inline-flex items-center h-6 px-2 rounded-nomi-sm border border-nomi-line bg-nomi-paper',
                    'text-micro text-nomi-ink-80 hover:border-nomi-accent disabled:opacity-45 disabled:hover:border-nomi-line')}
                >
                  {t(preset.labelKey)}
                </button>
              ))}
            </div>
            {(binding.params ?? []).length > 0 ? (
              <div className="flex flex-col gap-1.5">
                {(binding.params ?? []).map((param, index) => (
                  <div key={`${param.nodeId}:${param.inputKey}:${index}`} className="flex flex-col gap-1.5 rounded-nomi-sm border border-nomi-line bg-nomi-paper p-1.5">
                    <div className="flex items-center gap-1.5">
                      <div className="min-w-0 flex-1">
                        <NomiSelect
                          ariaLabel={t('onboardingProviders.comfyWorkflow.paramNodeAria')} size="xs"
                          value={nodeValue(param.nodeId, param.inputKey)}
                          options={nodeSelectOptions(widgetCandidates)}
                          onChange={(v) => setParamCandidate(index, v)}
                          triggerMaxWidth={190}
                          className="w-full max-w-full justify-between bg-nomi-paper"
                        />
                      </div>
                      <NomiSelect
                        ariaLabel={t('onboardingProviders.comfyWorkflow.paramTypeAria')} size="xs"
                        value={param.type}
                        options={paramTypeOptions}
                        onChange={(v) => updateParam(index, { type: v as WorkflowParamType })}
                        triggerMaxWidth={64}
                        className="shrink-0 bg-nomi-paper"
                      />
                      <button
                        type="button"
                        onClick={() => removeParam(index)}
                        aria-label={t('onboardingProviders.comfyWorkflow.removeParam')}
                        className="h-6 w-6 shrink-0 grid place-items-center rounded-nomi-sm text-nomi-ink-40 hover:bg-nomi-ink-05 hover:text-workbench-danger"
                      >
                        <IconTrash size={13} stroke={1.7} />
                      </button>
                    </div>
                    <div className="grid grid-cols-1 gap-1.5">
                      <input
                        value={param.label}
                        onChange={(e) => updateParam(index, { label: e.target.value })}
                        aria-label={t('onboardingProviders.comfyWorkflow.paramLabelAria')}
                        placeholder={t('onboardingProviders.comfyWorkflow.paramLabelPlaceholder')}
                        className="h-7 min-w-0 px-2 rounded-nomi-sm border border-nomi-line bg-nomi-paper text-caption text-nomi-ink placeholder:text-nomi-ink-30 focus:border-nomi-accent outline-none"
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-micro text-nomi-ink-40">{t('onboardingProviders.comfyWorkflow.noCustomParams')}</div>
            )}
            {paramKeyError ? <div className="text-micro text-workbench-danger">{paramKeyError}</div> : null}
          </div>

          <div className="flex items-center gap-2 pt-0.5">
            <input
              value={labelZh} onChange={(e) => setLabelZh(e.target.value)}
              placeholder={t('onboardingProviders.comfyWorkflow.namePlaceholder')}
              className="flex-1 h-8 px-2.5 rounded-nomi-sm border border-nomi-line bg-nomi-paper text-caption text-nomi-ink placeholder:text-nomi-ink-30 focus:border-nomi-accent outline-none"
            />
            <button
              type="button" onClick={doImport} disabled={busy || !binding.outputNodeId}
              className={cn('inline-flex items-center gap-1.5 h-8 px-3.5 rounded-nomi-sm bg-nomi-ink text-nomi-paper',
                'text-caption font-medium hover:bg-nomi-accent disabled:opacity-45')}
            >
              <IconFileImport size={14} stroke={1.8} />{busy ? (editMode ? t('onboardingProviders.comfyWorkflow.saving') : t('onboardingProviders.comfyWorkflow.importing')) : (editMode ? t('onboardingProviders.comfyWorkflow.save') : t('onboardingProviders.comfyWorkflow.import'))}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  )
}

function BindRow({ label, children }: { label: string; children: React.ReactNode }): JSX.Element {
  return (
    <div className="flex items-center gap-2">
      <span className="text-caption text-nomi-ink-60 w-24 shrink-0">{label}</span>
      <div className="flex-1 min-w-0 overflow-hidden">{children}</div>
    </div>
  )
}

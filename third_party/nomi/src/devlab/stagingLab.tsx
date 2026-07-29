// Staging Lab —— 仅 dev：验 create_staging_reference 的核心管线（语义 spec → buildStagingScene →
// 真 Scene3DAutoCapture 离屏出图）。直接看 AI 会产出的「站位参考图」长什么样。不进 prod 构建。
import React from 'react'
import { createRoot } from 'react-dom/client'
import { buildStagingScene, type StagingSpec } from '../workbench/generationCanvas/nodes/scene3d/stagingBuilder'
import { Scene3DAutoCapture } from '../workbench/generationCanvas/nodes/scene3d/Scene3DAutoCapture'

const SPECS: Array<{ label: string; spec: StagingSpec }> = [
  {
    label: '求婚：A 单膝跪面向 B · 三分之四仰拍中景',
    spec: {
      characters: [
        { name: 'A', pose: 'single-knee', facing: 'toward' },
        { name: 'B', pose: 'standing', facing: 'toward' },
      ],
      layout: 'facing',
      camera: { angle: 'three-quarter', height: 'low', shot: 'medium' },
    },
  },
  {
    label: '三人并排 · 正面全景',
    spec: {
      characters: [{ pose: 'standing' }, { pose: 'hands-on-hips' }, { pose: 'standing' }],
      layout: 'side-by-side',
      camera: { angle: 'front', height: 'eye', shot: 'wide' },
    },
  },
  {
    label: '单人指向 · 侧面中景',
    spec: {
      characters: [{ pose: 'point' }],
      camera: { angle: 'side', height: 'eye', shot: 'medium' },
    },
  },
  {
    label: '对峙：两人面对面 · 俯拍',
    spec: {
      characters: [{ pose: 'hands-on-hips' }, { pose: 'hands-on-hips' }],
      layout: 'facing',
      camera: { angle: 'front', height: 'high', shot: 'medium' },
    },
  },
  {
    label: '欢呼 + 背景人群 · 正面全景',
    spec: {
      characters: [{ pose: 'cheer' }],
      camera: { angle: 'front', height: 'eye', shot: 'wide' },
      crowd: { rows: 2, columns: 5 },
    },
  },
  {
    label: '蹲下检视 · 三分之四中景',
    spec: {
      characters: [{ pose: 'squat' }],
      camera: { angle: 'three-quarter', height: 'eye', shot: 'medium' },
    },
  },
]

function Cell({ label, spec, onReady }: { label: string; spec: StagingSpec; onReady: () => void }): JSX.Element {
  const state = React.useMemo(() => buildStagingScene(spec), [spec])
  const [url, setUrl] = React.useState<string | null>(null)
  return (
    <div style={{ width: 360, padding: 8 }}>
      <div style={{ fontSize: 13, fontWeight: 600, color: '#1f2937', marginBottom: 6 }}>{label}</div>
      <div style={{ width: 344, height: 194, border: '1px solid #d8d2c8', borderRadius: 6, overflow: 'hidden', background: '#fff' }}>
        {url ? (
          url === 'FAIL' ? (
            <div style={{ padding: 12, color: '#b91c1c', fontSize: 12 }}>出图失败</div>
          ) : (
            <img src={url} alt={label} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          )
        ) : (
          <Scene3DAutoCapture
            state={state}
            onResult={(result) => {
              setUrl(result?.dataUrl ?? 'FAIL')
              onReady()
            }}
          />
        )}
      </div>
    </div>
  )
}

function StagingLab(): JSX.Element {
  const readyRef = React.useRef(0)
  const handleReady = React.useCallback(() => {
    readyRef.current += 1
    if (readyRef.current >= SPECS.length) {
      ;(window as unknown as { __stagingReady?: boolean }).__stagingReady = true
    }
  }, [])
  return (
    <div style={{ padding: 16 }}>
      <h2 style={{ fontSize: 16, color: '#111827' }}>站位参考出图（buildStagingScene → Scene3DAutoCapture）</h2>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {SPECS.map((item) => (
          <Cell key={item.label} label={item.label} spec={item.spec} onReady={handleReady} />
        ))}
      </div>
    </div>
  )
}

createRoot(document.getElementById('staging-lab-root') as HTMLElement).render(<StagingLab />)

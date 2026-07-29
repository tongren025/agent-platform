// 单 spec 渲染（dev）：?spec=<base64(JSON StagingSpec)> → buildStagingScene → Scene3DAutoCapture →
// window.__oneDataUrl = 出图 dataURL。供 staging-ab A/B 编排按任意场景取 staging 图。
import React from 'react'
import { createRoot } from 'react-dom/client'
import { buildStagingScene, type StagingSpec } from '../workbench/generationCanvas/nodes/scene3d/stagingBuilder'
import { Scene3DAutoCapture } from '../workbench/generationCanvas/nodes/scene3d/Scene3DAutoCapture'

const raw = new URLSearchParams(window.location.search).get('spec')
let spec: StagingSpec = { characters: [{ pose: 'standing' }] }
try { if (raw) spec = JSON.parse(decodeURIComponent(escape(atob(raw)))) } catch { /* fallback */ }

function One(): JSX.Element {
  const state = React.useMemo(() => buildStagingScene(spec), [])
  const [url, setUrl] = React.useState<string | null>(null)
  React.useEffect(() => { if (url) (window as unknown as { __oneDataUrl?: string }).__oneDataUrl = url }, [url])
  return (
    <div style={{ width: 480, height: 270 }}>
      {url ? <img src={url} alt="" style={{ width: '100%' }} /> : <Scene3DAutoCapture state={state} onResult={(r) => setUrl(r?.dataUrl ?? 'FAIL')} />}
    </div>
  )
}
createRoot(document.getElementById('root') as HTMLElement).render(<One />)

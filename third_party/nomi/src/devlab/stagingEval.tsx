// Staging Eval（用户旅途级评测·A 层 builder/渲染覆盖）——仅 dev。
// 24 个覆盖矩阵的 spec（1–5 人 × layout × 朝向 × 机位 × 动作）→ 真 Scene3DAutoCapture 出图 →
// 逐张人眼判断「角色数/动作/朝向/机位/可读性」对不对，找系统性问题。?page=0..3（每页 6）。
import React from 'react'
import { createRoot } from 'react-dom/client'
import { buildStagingScene, type StagingSpec } from '../workbench/generationCanvas/nodes/scene3d/stagingBuilder'
import { Scene3DAutoCapture } from '../workbench/generationCanvas/nodes/scene3d/Scene3DAutoCapture'

type Case = { id: string; expect: string; spec: StagingSpec }

const CASES: Case[] = [
  { id: '01 单人·站立·正面', expect: '1 人面向镜头', spec: { characters: [{ pose: 'standing' }], camera: { angle: 'front', height: 'eye', shot: 'medium' } } },
  { id: '02 单人·指向·侧面', expect: '1 人侧身手平伸', spec: { characters: [{ pose: 'point' }], camera: { angle: 'side', height: 'eye', shot: 'medium' } } },
  { id: '03 双人·求婚·仰拍', expect: '左跪面向右站', spec: { characters: [{ name: 'A', pose: 'single-knee', facing: 'toward' }, { name: 'B', pose: 'standing', facing: 'toward' }], layout: 'facing', camera: { angle: 'three-quarter', height: 'low', shot: 'medium' } } },
  { id: '04 双人·对峙·平视', expect: '两人面对面叉腰', spec: { characters: [{ pose: 'hands-on-hips' }, { pose: 'hands-on-hips' }], layout: 'facing', camera: { angle: 'front', height: 'eye', shot: 'medium' } } },
  { id: '05 双人·并排·全景', expect: '两人并排朝镜头', spec: { characters: [{ pose: 'standing' }, { pose: 'standing' }], layout: 'side-by-side', camera: { angle: 'front', height: 'eye', shot: 'wide' } } },
  { id: '06 双人·一前一后(默认机位)', expect: '一前一后有纵深', spec: { characters: [{ pose: 'standing' }, { pose: 'standing' }], layout: 'behind', camera: { shot: 'medium' } } },
  { id: '07 双人·访谈·坐站', expect: '一坐一站面对', spec: { characters: [{ pose: 'sit', facing: 'toward' }, { pose: 'standing', facing: 'toward' }], layout: 'facing', camera: { angle: 'three-quarter', height: 'eye', shot: 'medium' } } },
  { id: '08 双人·一指一站(facing)', expect: 'A 指向 B', spec: { characters: [{ pose: 'point', facing: 'toward' }, { pose: 'standing', facing: 'toward' }], layout: 'facing', camera: { angle: 'three-quarter', height: 'eye', shot: 'medium' } } },
  { id: '09 三人·并排·全景', expect: '三人一排', spec: { characters: [{ pose: 'standing' }, { pose: 'hands-on-hips' }, { pose: 'standing' }], layout: 'side-by-side', camera: { angle: 'front', height: 'eye', shot: 'wide' } } },
  { id: '10 三人·纵队(默认机位)', expect: '一列纵深', spec: { characters: [{ pose: 'standing' }, { pose: 'standing' }, { pose: 'standing' }], layout: 'line', camera: { shot: 'wide' } } },
  { id: '11 三人·环绕(默认机位)', expect: '围成圈朝心', spec: { characters: [{ pose: 'standing' }, { pose: 'standing' }, { pose: 'standing' }], layout: 'circle', camera: { shot: 'wide' } } },
  { id: '12 三人·环绕·顶视', expect: '顶视三角站位', spec: { characters: [{ pose: 'standing' }, { pose: 'standing' }, { pose: 'standing' }], layout: 'circle', camera: { angle: 'front', height: 'overhead', shot: 'wide' } } },
  { id: '13 四人·环绕(默认机位)', expect: '四人围圈', spec: { characters: [{ pose: 'standing' }, { pose: 'standing' }, { pose: 'standing' }, { pose: 'standing' }], layout: 'circle', camera: { shot: 'wide' } } },
  { id: '14 四人·并排·全景', expect: '四人一排', spec: { characters: [{ pose: 'standing' }, { pose: 'standing' }, { pose: 'standing' }, { pose: 'standing' }], layout: 'side-by-side', camera: { angle: 'front', height: 'eye', shot: 'wide' } } },
  { id: '15 五人·纵队·俯拍', expect: '五人列队俯视', spec: { characters: Array.from({ length: 5 }, () => ({ pose: 'standing' })), layout: 'line', camera: { angle: 'three-quarter', height: 'high', shot: 'wide' } } },
  { id: '16 五人·并排·全景', expect: '五人一排', spec: { characters: Array.from({ length: 5 }, () => ({ pose: 'standing' })), layout: 'side-by-side', camera: { angle: 'front', height: 'eye', shot: 'wide' } } },
  { id: '17 三人·混合朝向', expect: 'A朝镜头 B背对 C朝左', spec: { characters: [{ facing: 'camera' }, { facing: 'away' }, { facing: 'left' }], layout: 'side-by-side', camera: { angle: 'front', height: 'eye', shot: 'wide' } } },
  { id: '18 双人·背面机位', expect: '看到两人背面', spec: { characters: [{ pose: 'standing' }, { pose: 'standing' }], layout: 'side-by-side', camera: { angle: 'back', height: 'eye', shot: 'medium' } } },
  { id: '19 单人·欢呼+人群', expect: '主角举手+背景人群', spec: { characters: [{ pose: 'cheer' }], camera: { angle: 'front', height: 'eye', shot: 'wide' }, crowd: { rows: 2, columns: 5 } } },
  { id: '20 双人·蹲+站·斜', expect: '一蹲一站', spec: { characters: [{ pose: 'squat' }, { pose: 'standing' }], layout: 'facing', camera: { angle: 'three-quarter', height: 'eye', shot: 'medium' } } },
  { id: '21 双人·亲密·近景', expect: '两人面对面近景', spec: { characters: [{ pose: 'standing', facing: 'toward' }, { pose: 'standing', facing: 'toward' }], layout: 'facing', camera: { angle: 'front', height: 'eye', shot: 'close' } } },
  { id: '22 三人·混合动作', expect: '指/叉腰/举手', spec: { characters: [{ pose: 'point' }, { pose: 'hands-on-hips' }, { pose: 'wave' }], layout: 'side-by-side', camera: { angle: 'front', height: 'eye', shot: 'wide' } } },
  { id: '23 四人·环绕·顶视', expect: '顶视四人方位', spec: { characters: Array.from({ length: 4 }, () => ({ pose: 'standing' })), layout: 'circle', camera: { angle: 'front', height: 'overhead', shot: 'medium' } } },
  { id: '24 三人·一前两后·俯', expect: '纵深+俯角', spec: { characters: [{ pose: 'standing' }, { pose: 'standing' }, { pose: 'standing' }], layout: 'behind', camera: { angle: 'three-quarter', height: 'high', shot: 'wide' } } },
]

const PAGE_SIZE = 6
const page = Number.parseInt(new URLSearchParams(window.location.search).get('page') ?? '0', 10) || 0

function Cell({ item, onReady }: { item: Case; onReady: () => void }): JSX.Element {
  const state = React.useMemo(() => buildStagingScene(item.spec), [item])
  const [url, setUrl] = React.useState<string | null>(null)
  return (
    <div style={{ width: 380, padding: 8 }}>
      <div style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>{item.id}</div>
      <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 4 }}>期望：{item.expect}</div>
      <div style={{ width: 364, height: 205, border: '1px solid #d8d2c8', borderRadius: 6, overflow: 'hidden', background: '#fff' }}>
        {url ? (
          <img src={url === 'FAIL' ? '' : url} alt={item.id} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
        ) : (
          <Scene3DAutoCapture state={state} onResult={(r) => { setUrl(r?.dataUrl ?? 'FAIL'); onReady() }} />
        )}
      </div>
    </div>
  )
}

function StagingEval(): JSX.Element {
  const items = CASES.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE)
  const readyRef = React.useRef(0)
  const onReady = React.useCallback(() => {
    readyRef.current += 1
    if (readyRef.current >= items.length) (window as unknown as { __evalReady?: boolean }).__evalReady = true
  }, [items.length])
  return (
    <div style={{ padding: 14 }}>
      <h3 style={{ color: '#111827', fontSize: 15 }}>站位评测 · 第 {page + 1} 页（{CASES.length} 例）</h3>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {items.map((item) => (<Cell key={item.id} item={item} onReady={onReady} />))}
      </div>
    </div>
  )
}

createRoot(document.getElementById('staging-eval-root') as HTMLElement).render(<StagingEval />)

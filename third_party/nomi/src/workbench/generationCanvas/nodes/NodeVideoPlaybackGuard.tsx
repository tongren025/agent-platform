import React from 'react'
import { useTranslation } from 'react-i18next'
import { cn } from '../../../utils/cn'
import { getDesktopBridge } from '../../../desktop/bridge'
import {
  describeVideoPlaybackFailure,
  diagnoseVideoPlaybackFailure,
  logVideoPlaybackFailure,
} from '../../../media/videoPlaybackDiagnostics'
import { useGenerationCanvasStore } from '../store/generationCanvasStore'
import { DeferredNodeVideo, type DeferredNodeVideoProps } from './DeferredNodeMedia'

// 视频节点播放守卫（2026-07-28 群反馈根治「参考视频灰壳/0:00/播放键失灵」的渲染侧半边）：
// ① decode 类失败（MediaError 3/4）且是 nomi-local 资产 → 调主进程懒自愈一次（探测+转码出可播 MP4），
//    成功换 result.url 重载——覆盖导入归一化上线前的存量坏节点、以及供应商直接回 HEVC 的生成产物。
// ② 自愈不了/不适用 → 在视频区盖一层人话原因（describeVideoPlaybackFailure 单一真相源），
//    终结「无声灰壳」：此前 onError 只打 console，用户面前什么都不发生。
type Props = DeferredNodeVideoProps & {
  nodeId: string
  /** 节点 result.url 原值（诊断探针与自愈都要原始 URL，不要 buildVideoPlaybackUrl 之后的）。 */
  rawUrl: string
}

export function NodeVideoPlaybackGuard({ nodeId, rawUrl, onError, onLoadedMetadata, ...rest }: Props): JSX.Element {
  const { t } = useTranslation()
  const [failureText, setFailureText] = React.useState('')
  const [healing, setHealing] = React.useState(false)
  const healAttemptedRef = React.useRef(false)

  const handleError: React.ReactEventHandler<HTMLVideoElement> = (event) => {
    onError?.(event)
    const mediaError = event.currentTarget.error
    void diagnoseVideoPlaybackFailure(rawUrl, mediaError).then(async (diagnostics) => {
      logVideoPlaybackFailure(diagnostics)
      const decodeFailure = diagnostics.mediaErrorCode === 3 || diagnostics.mediaErrorCode === 4
      const ensurePlayable = getDesktopBridge()?.assets?.ensurePlayable
      if (decodeFailure && !healAttemptedRef.current && rawUrl.startsWith('nomi-local://') && ensurePlayable) {
        healAttemptedRef.current = true
        setHealing(true)
        try {
          const healed = await ensurePlayable({ url: rawUrl })
          const healedUrl = typeof healed?.data?.url === 'string' ? healed.data.url.trim() : ''
          if (healedUrl && healedUrl !== rawUrl) {
            const state = useGenerationCanvasStore.getState()
            const node = state.nodes.find((candidate) => candidate.id === nodeId)
            if (node?.result) {
              // src 变化 → DeferredNodeVideo 重挂载重载；loadedmetadata 会回填时长/尺寸并清掉失败层。
              state.updateNode(nodeId, { result: { ...node.result, url: healedUrl } })
              setHealing(false)
              setFailureText('')
              return
            }
          }
        } catch {
          // 自愈失败 → 落到下面的诚实报错。
        }
        setHealing(false)
      }
      setFailureText(describeVideoPlaybackFailure(diagnostics))
    })
  }

  const handleLoadedMetadata: React.ReactEventHandler<HTMLVideoElement> = (event) => {
    setFailureText('')
    onLoadedMetadata?.(event)
  }

  return (
    <div className={cn('relative h-full w-full min-h-0')}>
      <DeferredNodeVideo {...rest} onError={handleError} onLoadedMetadata={handleLoadedMetadata} />
      {healing || failureText ? (
        <div
          className={cn(
            'absolute inset-0 z-[2] flex items-center justify-center p-3',
            'pointer-events-none bg-nomi-ink-05',
          )}
        >
          <span className={cn('max-w-full text-center text-caption leading-snug text-nomi-ink-60')}>
            {healing ? t('generationCommon.node.videoRepairing') : failureText}
          </span>
        </div>
      ) : null}
    </div>
  )
}

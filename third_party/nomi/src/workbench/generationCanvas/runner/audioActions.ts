import type { GenerationCanvasNode, GenerationNodeResult } from '../model/generationCanvasTypes'
import { runCatalogGenerationTask, type CatalogTaskActionOptions } from './catalogTaskActions'

export type GenerateAudioOptions = CatalogTaskActionOptions

// 声音生成（配音 TTS / 转写 Whisper）与图像/视频同走 catalog 任务流：
// resolveExecutableNodeFromCatalog → buildCatalogTaskRequest（kind=text_to_audio/transcribe，由
// resolveTaskKind 据当前模式 transportTaskKind 给出）→ runWorkbenchTask（IPC → runtime 第四路
// runAudioTask）→ normalizeCatalogTaskResult（audio 资产 / transcribe 文本）。
export async function generateAudio(
  node: GenerationCanvasNode,
  options: GenerateAudioOptions = {},
): Promise<GenerationNodeResult> {
  return runCatalogGenerationTask(node, options)
}

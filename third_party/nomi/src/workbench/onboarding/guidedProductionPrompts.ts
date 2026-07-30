import type { GuidedProductionStageId } from './guidedProductionFlow'

function storyContext(documentText: string): string {
  const text = documentText.trim()
  if (!text) return '（当前文稿为空）'
  return text.length <= 16000 ? text : `${text.slice(0, 16000)}\n（文稿过长，已截取前 16000 字）`
}

export function buildGuidedScriptPrompt(): string {
  return [
    '用户已经点击“生成剧本”，这就是对本次写入的明确授权。',
    '先调用 read_full_text 读取当前文稿里的一句话创意，再扩写成能直接生产的短剧剧本。',
    '必须调用 append_to_end 把最终剧本写回文稿，不要只在聊天里解释。',
    '写入内容必须先写“# 故事设定”，包含世界观、时代与地点、人物关系、剧情脉络和核心冲突；再写“# 剧本”，包含场次、逐镜可见动作、对白/旁白、情绪、声音、镜头时长和结尾钩子。',
    '每个连续生成镜头控制在 2-6 秒；镜头运动与人物动作分开写；缺少的非关键设定直接做合理假设，不反问新手。',
  ].join('\n')
}

export function buildGuidedCanvasPrompt(stage: Exclude<GuidedProductionStageId, 'idea' | 'script' | 'storyboard' | 'review'>, documentText: string): string {
  const context = storyContext(documentText)
  const header = [
    '这是“新手一步一步做漫剧”向导发出的任务。用户已点击当前步骤，安全的建节点/连线操作可直接执行。',
    '先读取当前画布，复用已有资产，不重复创建同名卡。不要要求用户选择员工、模型或节点类型；使用当前已配置且适合的模型。',
    '',
    '当前故事/剧本：',
    context,
    '',
  ]
  const prompts: Record<typeof stage, string[]> = {
    style: [
      '当前唯一任务：建立视觉风格母版。',
      '一次 create_canvas_nodes 创建两张参考卡：',
      '1）text 节点，标题必须含“视觉风格母版”，prompt 写清画幅、媒介/画风、时代地域、线条材质、色彩系统、主辅光、镜头质感、细节密度、全项目一致性规则；',
      '2）image 节点，标题必须含“视觉风格母版图”，prompt 是可直接生图的无具体剧情风格样张，referenceSheet=true。',
      '同一次调用中把文字母版连到母版图。只建母版，不生成角色、场景或分镜。',
    ],
    character: [
      '当前唯一任务：建立主要人物的身份资产。',
      '按剧本识别所有主要角色，每个角色只建一个 character 参考卡，referenceSheet=true。',
      '每张卡的标题使用“R编号｜角色名｜人物三视图·表情·服装”。',
      'prompt 必须包含：纯净中性背景、统一比例、正面/侧面/背面三视图、头身比与骨相、发型肤色、标志物、至少 6 种表情、基础服装与剧情所需服装变体、材质配色、不可漂移的身份特征。',
      '继承已有视觉风格母版。只建人物卡，不建场景和镜头。',
    ],
    scene: [
      '当前唯一任务：建立场景与关键道具资产。',
      '按剧本出现地点，每个主要场景建一个 scene 参考卡，referenceSheet=true；关键剧情道具可建 image 参考卡。',
      '场景标题使用“SCENE编号｜场景名｜场景设定·道具”。',
      'prompt 必须包含：无人物空间母版、空间尺度与布局、入口出口、前中后景、2-3 个永久地标、行动区、关键道具、主辅光方向与色温、日夜变体、分镜可复用角度；继承视觉风格母版。',
      '只建场景/道具卡，不拆分镜头。',
    ],
    motion: [
      '当前唯一任务：为现有每一个分镜做“镜头动态设计”。即使是固定镜头，也必须有一张对应设计卡。',
      '逐镜创建 text 节点，标题必须使用“镜头动态设计｜镜头N”。',
      'prompt 写清镜头时长、人物起点/终点、身体部位动作、屏幕方向、物体运动、速度与节奏、摄影机起点/终点、唯一运镜、焦距/焦点变化、剪辑点、上一镜与下一镜的姿态承接。',
      '有明确推拉摇移、环绕、升降或跟拍的镜头，调用 create_camera_move 把运镜参考连接到对应视频镜头；固定镜头只写静止机位，不强加运动。',
      '不要生成关键帧或最终视频。',
    ],
    keyframe: [
      '当前唯一任务：建立每镜首帧/关键帧，必要时建立尾帧。',
      '读取已有分镜、人物、场景和运动设计。每个镜头创建 keyframe 节点，标题必须使用“镜头N｜首帧关键帧”；大幅位移、变装或明确首尾帧控制的镜头，再加“镜头N｜尾帧关键帧”。',
      'prompt 必须写清角色版本、表情姿态、画面位置、景别机位、前中后景、光线、动作瞬间，并继承人物/场景/风格参考。',
      '用 character_ref、style_ref、composition_ref 或 first_frame/last_frame 等当前模型支持的引用边正确连接。不要默认九宫格，不要启动付费生成。',
    ],
    video: [
      '当前唯一任务：把已批准的分镜、运动设计和关键帧转成视频生成节点。',
      '每个 2-6 秒镜头建立一个 video 节点，标题使用“镜头N｜视频”。',
      'prompt 分开写：素材引用、首帧承接、人物身体动作、唯一运镜、场景光影、对白/音效、末帧姿态；不得把多个镜头塞进一个节点。',
      '把对应首帧以 first_frame、可选尾帧以 last_frame 连接到视频节点，并复用已配置的可用视频模型。',
      '本步骤只建立视频任务，不调用 run_generation_batch，不消耗额度。',
    ],
  }
  return [...header, ...prompts[stage]].join('\n')
}

export function buildGuidedVideoRunPrompt(): string {
  return buildGuidedMediaRunPrompt('video')
}

export function buildGuidedMediaRunPrompt(
  stage: 'style' | 'character' | 'scene' | 'storyboard' | 'keyframe' | 'video',
): string {
  const stageRules: Record<typeof stage, string> = {
    style: '只处理标题含“视觉风格母版”的尚未成功图片节点',
    character: '只处理人物三视图、表情、服装参考卡中尚未成功的图片节点',
    scene: '只处理场景设定、场景母版和关键道具中尚未成功的图片节点',
    storyboard: '只处理逐镜分镜图中尚未成功的图片节点，不要处理人物、场景或关键帧参考卡',
    keyframe: '只处理每镜首帧、关键帧和可选尾帧中尚未成功的图片节点',
    video: '只处理标题含“镜头”且尚未成功的视频节点',
  }
  const checks: Record<typeof stage, string> = {
    style: '检查画幅、画风、色彩、光线、材质和时代基调是否齐全',
    character: '检查正面/侧面/背面、脸部、表情、服装与不可漂移身份特征是否齐全',
    scene: '检查空间布局、永久地标、日夜灯光、关键道具和可复用角度是否齐全',
    storyboard: '检查每个镜头的构图、景别、人物位置、动作瞬间与连续性是否齐全',
    keyframe: '检查每镜首帧都已连接人物、场景、风格和分镜构图参考；尾帧只按需',
    video: '检查每个节点已有首帧/可选尾帧、2-6 秒动作和唯一运镜',
  }
  const mediaLabel = stage === 'video' ? '视频' : '图片'
  return [
    `读取当前画布，${stageRules[stage]}。`,
    `先${checks[stage]}。`,
    `然后调用一次 run_generation_batch 启动这些${mediaLabel}节点的真实生成。这个调用会花费额度，必须让用户看到并确认额度操作；不要创建重复节点，也不要生成其他阶段的资产。`,
  ].join('\n')
}

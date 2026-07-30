/**
 * 新手上手手册的唯一内容源（纯数据 + 文案，无 React、无样式）。
 *
 * 两处出口共用这一份：
 *   ① App 内 `HandbookPanel.tsx`（React overlay，把 iconKey 映射成已登记的 tabler 组件）
 *   ② `scripts/build-handbook-html.mjs`（渲成独立 marketing/handbook.html，发群 + 挂官网）
 * 改文案只改这里，两处自动同步。iconKey = tabler 图标名去掉 `Icon` 前缀的 kebab（如 `pencil`）：
 * html 渲 `ti ti-<iconKey>`；React panel 用 HANDBOOK_ICON map（key→vendor 组件，都已登记，build 安全）。
 */

export type HandbookPipelineStep = { iconKey: string; label: string; accent?: boolean }
export type HandbookFirstWinStep = { n: number; title: string; body: string }
export type HandbookIntentRoute = {
  iconKey: string
  title: string
  body: string
  /** 标新能力（0.16）。 */
  badge?: string
  /** 缺口诚实标——渲成 warning 配色。 */
  warn?: boolean
}
export type HandbookGotcha = { iconKey: string; title: string; body: string }

/** 专业漫剧生产线：从一句话到成片，和工作台常驻制作向导保持同一顺序。 */
export const HANDBOOK_PIPELINE: HandbookPipelineStep[] = [
  { iconKey: 'pencil', label: '一句创意' },
  { iconKey: 'scissors', label: '剧本' },
  { iconKey: 'wand', label: '风格母版' },
  { iconKey: 'user-check', label: '人物三视图/服装' },
  { iconKey: 'box', label: '场景/道具' },
  { iconKey: 'layout-grid', label: '逐镜分镜' },
  { iconKey: 'device-gamepad-2', label: '镜头动态设计' },
  { iconKey: 'photo', label: '首尾关键帧' },
  { iconKey: 'movie', label: '逐镜视频' },
  { iconKey: 'timeline', label: '审片/剪辑/声音', accent: true },
]

/** 新手只需要做四件事，其余由常驻制作向导按顺序调度。 */
export const HANDBOOK_FIRST_WIN: HandbookFirstWinStep[] = [
  { n: 1, title: '只写一句话', body: '在创作区写一句你想看的故事，不必先学剧本、提示词或节点。' },
  { n: 2, title: '只点“下一步”', body: '顶部制作导演条会自动派编剧、视觉导演、人物、场景、分镜、运镜和关键帧岗位。' },
  {
    n: 3,
    title: '确认付费生成',
    body: '建稿、建卡和连线自动完成；真正生图/生视频前会显示所用模型与额度确认。',
  },
  { n: 4, title: '审片并导出', body: '成功镜头会按顺序加入时间轴；再补字幕、对白、音效、音乐并导出 MP4。' },
]

/** 「我想做 X → 走这条路」：能做的指清楚路径，做不到的当场标 ⚠️。 */
export const HANDBOOK_INTENT_ROUTES: HandbookIntentRoute[] = [
  {
    iconKey: 'user-check',
    title: '让同一个人每个镜头长一样',
    body: '用身份卡锁脸 → 连到每个镜头当参考，保持角色一致。',
  },
  {
    iconKey: 'box',
    title: '控制谁站哪、朝哪',
    body: '用 3D 站位图摆一下 → AI 照着画。',
  },
  {
    iconKey: 'device-gamepad-2',
    title: '让角色走起来、做动作、要运镜',
    body: '游戏式 3D 操控：WASD 走位 + 动作库 + 摆相机，录一段 take 导出成参考视频喂生成。',
    badge: '0.16 新',
  },
  {
    iconKey: 'gift',
    title: '想用我在平台配置的全部模型',
    body: '向导读取 Agent Studio 的模型目录，按文本、图片、视频能力自动选择；不会调用外部画布作者的账号。',
  },
  {
    iconKey: 'typography',
    title: '加字幕、标题卡',
    body: '进时间轴预览区，节奏你说了算。',
  },
  {
    iconKey: 'alert-triangle',
    title: '想要精确对口型 / 唇形同步',
    body: '暂不支持，这段先跳过——不藏不糊弄。',
    warn: true,
  },
]

/** 卡住了看这里：四个真实坑（都在反馈雷达 / changelog 里真出现过）。 */
export const HANDBOOK_GOTCHAS: HandbookGotcha[] = [
  {
    iconKey: 'plug-connected-x',
    title: '接了模型却不能生成',
    body: '多半缺「文本大脑」。模型设置里加一个文本模型，拆镜 / 对话才转得起来。',
  },
  {
    iconKey: 'mood-confuzed',
    title: '每个镜头脸都不一样',
    body: '把身份卡连到镜头当参考——没连，模型就分不清谁是谁。',
  },
  {
    iconKey: 'alert-circle',
    title: '模型「连了用不了」',
    body: '看报错提示：多半是账号档位（要会员 / 企业 Key / 网页授权），按提示开通即可。',
  },
  {
    iconKey: 'volume-off',
    title: '导出后没声音',
    body: '确认音频已在时间轴的音频轨上；最新版导出混音已修。',
  },
]

export const HANDBOOK_TITLE = 'Agent Studio 画布一页上手'
export const HANDBOOK_SUBTITLE = '本地优先的 AI 视频创作台 · 从一句话到一条成片'

const EN_HANDBOOK_PIPELINE: HandbookPipelineStep[] = [
  { iconKey: 'pencil', label: 'One-line idea' },
  { iconKey: 'scissors', label: 'Script' },
  { iconKey: 'wand', label: 'Style bible' },
  { iconKey: 'user-check', label: 'Character sheets' },
  { iconKey: 'box', label: 'Scenes / props' },
  { iconKey: 'layout-grid', label: 'Storyboard' },
  { iconKey: 'device-gamepad-2', label: 'Actor / camera motion' },
  { iconKey: 'photo', label: 'Keyframes' },
  { iconKey: 'movie', label: 'Shot videos' },
  { iconKey: 'timeline', label: 'Review / edit / sound', accent: true },
]

const EN_HANDBOOK_FIRST_WIN: HandbookFirstWinStep[] = [
  {
    n: 1,
    title: 'Write only one sentence',
    body: 'Describe the story you want in Creation. You do not need to learn scripts, prompts, or node types first.',
  },
  {
    n: 2,
    title: 'Click only “Next”',
    body: 'The production director bar dispatches the writer, visual director, character, scene, storyboard, motion, and keyframe roles.',
  },
  {
    n: 3,
    title: 'Confirm paid generation',
    body: 'Writing, asset planning, and connections run automatically. Real image and video generation still shows the selected model and credit confirmation.',
  },
  {
    n: 4,
    title: 'Review and export',
    body: 'Successful shots are added to the timeline in order. Add captions, dialogue, effects, and music, then export MP4.',
  },
]

const EN_HANDBOOK_INTENT_ROUTES: HandbookIntentRoute[] = [
  {
    iconKey: 'user-check',
    title: 'Keep the same person consistent across shots',
    body: 'Use an identity card to lock the face, then connect it to every shot as a reference.',
  },
  {
    iconKey: 'box',
    title: 'Control where people stand and face',
    body: 'Create a 3D staging image and let the model follow that layout.',
  },
  {
    iconKey: 'device-gamepad-2',
    title: 'Move characters, direct actions, and add camera movement',
    body: 'Use game-style 3D controls: WASD movement, action presets, and camera placement. Record a take and use the resulting reference video for generation.',
    badge: 'New in 0.16',
  },
  {
    iconKey: 'gift',
    title: 'Use every model configured in my platform',
    body: 'The guide reads the Agent Studio model catalog and routes by text, image, and video capability. It never uses the upstream canvas author’s account.',
  },
  {
    iconKey: 'typography',
    title: 'Add subtitles and title cards',
    body: 'Use the timeline preview workspace to control timing and presentation.',
  },
  {
    iconKey: 'alert-triangle',
    title: 'Need precise lip sync',
    body: 'Not supported yet. Skip this step for now—the platform will not pretend otherwise.',
    warn: true,
  },
]

const EN_HANDBOOK_GOTCHAS: HandbookGotcha[] = [
  {
    iconKey: 'plug-connected-x',
    title: 'Models are connected but generation does not work',
    body: 'A text model is usually missing. Add one in Model setup so shot planning and chat can run.',
  },
  {
    iconKey: 'mood-confuzed',
    title: 'The face changes in every shot',
    body: 'Connect the identity card to each shot as a reference. Without it, the model cannot reliably identify the character.',
  },
  {
    iconKey: 'alert-circle',
    title: 'A connected model is unavailable',
    body: 'Read the error message. The provider may require a paid tier, enterprise key, or one-time web authorization.',
  },
  {
    iconKey: 'volume-off',
    title: 'The exported video has no sound',
    body: 'Make sure audio clips are placed on an audio track in the timeline.',
  },
]

export function handbookContentForLocale(locale: string) {
  if (locale !== 'en') {
    return {
      title: HANDBOOK_TITLE,
      subtitle: HANDBOOK_SUBTITLE,
      pipeline: HANDBOOK_PIPELINE,
      firstWin: HANDBOOK_FIRST_WIN,
      intentRoutes: HANDBOOK_INTENT_ROUTES,
      gotchas: HANDBOOK_GOTCHAS,
    }
  }
  return {
    title: 'Agent Studio canvas quick-start guide',
    subtitle: 'A local-first AI video studio · From one sentence to a finished video',
    pipeline: EN_HANDBOOK_PIPELINE,
    firstWin: EN_HANDBOOK_FIRST_WIN,
    intentRoutes: EN_HANDBOOK_INTENT_ROUTES,
    gotchas: EN_HANDBOOK_GOTCHAS,
  }
}

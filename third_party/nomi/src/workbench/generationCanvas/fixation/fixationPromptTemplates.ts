// 「定妆 / 定景」提示词写作模块——这是定妆功能的**核心壁垒**（工具调用已备，见 generationCanvasTools）。
//
// 纯函数、零 UI / store 依赖 → 可单测、可被 Tier1（浮条基础）与 Tier2（剧本驱动）**共用**：
//   - Tier1：用 buildBasicCharacterFixation / buildBasicSceneFixation 的基础默认（最基础那一档，谁都能用）。
//   - Tier2：调 buildFixationPrompt，喂**从剧本反推**的 expressions/outfits/props/palette 等贴合清单。
//
// 规律来源（实测固化，改这里前必读）：
//   docs/design/2026-06-06-character-scene-fixation-design.md §5.7（出图好的 10 条）+ §5.7.1（两条订正）。
//   订正1：每个标签必须**逐字列出**，不能让模型自由发挥（否则出光秃秃没字的图）。
//   订正2：内容必须**剧本驱动**，通用清单覆盖不到具体剧本（实测 v2 ≫ v1）。
// 模板结构对标已验证出图质量的 tests/ux/kie-direct-image2-v2.mjs。

export type FixationSubject = 'character' | 'scene'

export type FixationStyle = 'cinematic' | 'anime' | 'painterly' | 'cyber'

/** 风格行（规律7：用摄影/画风语言，不用 stunning/masterpiece 空词）。 */
export const FIXATION_STYLE_ROW: Record<FixationStyle, string> = {
  cinematic: '干净的电影感艺术书插画，35mm 柔光 + bounce，真实材质细节（布料褶皱、金属反光、做旧磨损）',
  anime: '日系设定集画风，干净线稿，cel shading，高可读性',
  painterly: '半写实概念设定厚涂，painterly 渲染，强材质表现',
  cyber: 'techwear 设定页，UI 式排版，schematic 标注，金属/工业质感',
}

export type FixationIdBlock = {
  code?: string
  role?: string
  age?: string
  personality?: string[]
  signature?: string
  quote?: string
}

export type FixationContext = {
  subject: FixationSubject
  /** 角色名 / 场景名（放 prompt 前段当身份标签，规律4：首 10 词锁身份）。 */
  name: string
  style: FixationStyle
  /** 画面比例，缺省 16:9（实测身份板最佳）。 */
  aspectRatio?: string
  /** ID 信息块（规律9：简洁、逐行）。 */
  idBlock?: FixationIdBlock
  // —— 角色区块（剧本反推填，Tier1 用基础默认）——
  turnaround?: boolean // 三视图（正/侧/背）
  /** 表情清单：**逐字**列出（订正1）。如 ['冷峻警戒','罕见温柔']。 */
  expressions?: string[]
  /** 服装变体：逐字。如 ['雪地战斗服','日常休闲装']。 */
  outfits?: string[]
  /** 道具/装备：逐字 + 部位（用于引出线）。如 ['磁吸冲击护臂（左前臂）']。 */
  props?: string[]
  /** 剪影研究数量（0 = 不要）。 */
  silhouettes?: number
  // —— 场景区块 ——
  /** 时段：逐字。如 ['白天','黑夜','黄昏','雨']。 */
  times?: string[]
  /** 机位：逐字。如 ['广角','俯视','过肩']。 */
  angles?: string[]
  // —— 通用 ——
  /** 色板：hex + 中文角色（规律5）。 */
  palette?: { hex: string; role: string }[]
}

function joinList(items: readonly string[]): string {
  return items.filter((s) => s && s.trim()).map((s) => s.trim()).join(' / ')
}

/**
 * 拼出「定妆/定景」身份板 prompt。始终注入 10 条规律的脚手架；按 ctx 勾选的区块逐字列标签。
 * 这是 Tier1/Tier2 唯一的 prompt 真相源。
 */
export function buildFixationPrompt(ctx: FixationContext): string {
  const aspect = ctx.aspectRatio || '16:9'
  const isScene = ctx.subject === 'scene'
  const lines: string[] = []

  // [规律1] 人设打底
  lines.push(
    isScene
      ? '你是顶尖游戏/影视概念美术大师，擅长详尽的场景设定板（scene design board）。'
      : '你是顶尖游戏/动漫概念美术大师，擅长详尽的角色身份板（character identity board）。',
  )

  // [规律4] 身份标签放前段
  const idTagBits = [ctx.name, ctx.idBlock?.role, ctx.idBlock?.signature].filter(Boolean) as string[]
  if (idTagBits.length) lines.push(`【主体】${idTagBits.join(' ｜ ')}`)

  // 任务 + [规律2] 布局：中心锚点 + 不对称环绕，绝不网格
  lines.push(
    `【任务】基于参考图，制作一张 ${aspect} ${isScene ? '场景设定板' : '角色身份板'}。柔和米白色纸质背景，` +
      `电影感艺术书式**不对称**布局，**绝不用网格**——${isScene ? '主图（环境广角）略偏中心作视觉锚点' : '英雄全身立绘略偏中心作视觉锚点'}，` +
      '周围以干净间距环绕排列各区块，细灰引导线连接，每块独立清晰、有呼吸空间、不堆叠、不裁切、不合并。',
  )

  // 强制逐字标注（订正1）
  lines.push('【强制中文标注 — 缺任何一项视为失败】每个分组写中文章节大标题；每个子图下方写中文小标签，逐字如下：')

  if (!isScene) {
    if (ctx.turnaround) lines.push('· 「三视图」：正面 / 侧面 / 背面')
    if (ctx.expressions?.length) lines.push(`· 「表情研究」：${joinList(ctx.expressions)}`)
    if (ctx.outfits?.length) lines.push(`· 「服装变体」：${joinList(ctx.outfits)}（各一张全身小图）`)
    if (ctx.props?.length) lines.push(`· 「道具与材质」：${joinList(ctx.props)}（部位特写，用引出线连到中心人物对应部位）`)
    if (ctx.silhouettes && ctx.silhouettes > 0) lines.push(`· 「剪影研究」：${ctx.silhouettes} 个黑色侧影`)
  } else {
    if (ctx.times?.length) lines.push(`· 「时段」：${joinList(ctx.times)}（**保持建筑结构/布局/机位完全相同，只改光照与天气**）`)
    if (ctx.angles?.length) lines.push(`· 「机位」：${joinList(ctx.angles)}（保持场景所有元素/材质/配色完全相同，只改机位）`)
  }

  // 色板（规律5）
  if (ctx.palette?.length) {
    lines.push(`· 「色板」：${ctx.palette.map((p) => `${p.hex} ${p.role}`).join(' / ')}（色块横排，块下写 hex + 中文角色）`)
  }

  // ID 信息块（规律9）
  if (ctx.idBlock) {
    const id = ctx.idBlock
    const idLines = [
      `名称：${ctx.name}`,
      id.code ? `代号：${id.code}` : '',
      id.role ? `身份：${id.role}` : '',
      id.age ? `年龄：${id.age}` : '',
      id.personality?.length ? `性格：${id.personality.join('、')}` : '',
      id.signature ? `标志：${id.signature}` : '',
    ].filter(Boolean)
    lines.push(`· 「ID 信息」（左上角，简洁无衬线，每行短句）：${idLines.join('；')}`)
    if (id.quote) lines.push(`· 右下角手写体引文：「${id.quote}」`)
  }

  // [规律3] 身份锁定 7 连（场景换成结构锁定）
  lines.push(
    isScene
      ? '【结构锁定】所有视图保持相同建筑结构、相同布局、相同材质、相同视觉风格——同一个场景；比例一致，避免夸张透视。'
      : '【身份锁定】所有视角保持**相同面部 / 相同面部比例 / 相同发型 / 相同服装版型 / 相同身体比例 / 相同姿势语言 / 相同视觉个性**——同一个人；比例一致，避免夸张透视。',
  )

  // [规律7/8] 风格 + 材质
  lines.push(`【风格】${FIXATION_STYLE_ROW[ctx.style]}。中文文字干净可读，章节标题与正文小字层次清楚。`)

  // [规律10] 负向约束
  lines.push('【负向】不合并视角、不堆叠、不裁切肢体、不用网格；除标注文字外画面无其它文字、无水印。')

  return lines.join('\n')
}

// —— Tier1 基础默认（最基础那一档：通用、谁都能用，但只到基础） ——

const BASIC_EXPRESSIONS = ['平静', '微笑', '愤怒', '惊讶']
const BASIC_TIMES = ['白天', '黑夜', '黄昏']
const BASIC_ANGLES = ['广角', '俯视']

/** Tier1 角色基础定妆：三视图 + 4 基础表情 + 剪影 + ID 块。只需名字（+ 可选一句设定）。 */
export function buildBasicCharacterFixation(name: string, opts: { tagline?: string; style?: FixationStyle } = {}): string {
  return buildFixationPrompt({
    subject: 'character',
    name,
    style: opts.style || 'cinematic',
    turnaround: true,
    expressions: BASIC_EXPRESSIONS,
    silhouettes: 3,
    idBlock: { role: opts.tagline },
  })
}

/** Tier1 场景基础定景：3 时段 + 2 机位。 */
export function buildBasicSceneFixation(name: string, opts: { tagline?: string; style?: FixationStyle } = {}): string {
  return buildFixationPrompt({
    subject: 'scene',
    name,
    style: opts.style || 'cinematic',
    times: BASIC_TIMES,
    angles: BASIC_ANGLES,
    idBlock: opts.tagline ? { role: opts.tagline } : undefined,
  })
}

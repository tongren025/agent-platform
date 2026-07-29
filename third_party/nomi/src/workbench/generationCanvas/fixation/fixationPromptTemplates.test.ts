import { describe, it, expect } from 'vitest'
import {
  buildBasicCharacterFixation,
  buildBasicSceneFixation,
  buildFixationPrompt,
} from './fixationPromptTemplates'

describe('buildFixationPrompt · 角色（§5.7 十条规律锁回归）', () => {
  const prompt = buildFixationPrompt({
    subject: 'character',
    name: '小苏',
    style: 'cinematic',
    turnaround: true,
    expressions: ['冷峻警戒', '罕见温柔'],
    outfits: ['雪地战斗服'],
    props: ['磁吸冲击护臂（左前臂）'],
    silhouettes: 3,
    palette: [{ hex: '#1C1F26', role: '主色' }],
    idBlock: { code: 'ASHRAIL', role: '反派少年', age: '14 岁', personality: ['克制'], signature: '左眉疤', quote: '平安回家。' },
  })

  it('规律1 人设打底', () => expect(prompt).toContain('概念美术大师'))
  it('规律2 不对称布局、绝不网格、有锚点', () => {
    expect(prompt).toContain('不对称')
    expect(prompt).toContain('绝不用网格')
    expect(prompt).toContain('视觉锚点')
  })
  it('规律3 身份锁定 7 连（含保命「相同面部 / 比例 / 同一个人」）', () => {
    expect(prompt).toContain('相同面部')
    expect(prompt).toContain('相同面部比例')
    expect(prompt).toContain('同一个人')
    expect(prompt).toContain('避免夸张透视')
  })
  it('订正1 标签逐字列出（不是「N 个表情」而是真名）', () => {
    expect(prompt).toContain('冷峻警戒')
    expect(prompt).toContain('罕见温柔')
    expect(prompt).toContain('正面 / 侧面 / 背面')
    expect(prompt).toContain('雪地战斗服')
    expect(prompt).toContain('磁吸冲击护臂')
  })
  it('规律5 色板带 hex + 中文角色', () => expect(prompt).toContain('#1C1F26 主色'))
  it('规律9 ID 块逐行 + 引文', () => {
    expect(prompt).toContain('代号：ASHRAIL')
    expect(prompt).toContain('标志：左眉疤')
    expect(prompt).toContain('平安回家。')
  })
  it('规律10 负向约束（不合并/不网格/无多余文字）', () => {
    expect(prompt).toContain('不合并视角')
    expect(prompt).toContain('无水印')
  })
  it('默认 16:9', () => expect(prompt).toContain('16:9'))
})

describe('buildFixationPrompt · 场景（结构锁定 + 时段「保持结构只改光照」）', () => {
  const prompt = buildFixationPrompt({
    subject: 'scene',
    name: '旧教室',
    style: 'cinematic',
    times: ['白天', '黑夜', '雨'],
    angles: ['广角', '俯视'],
  })
  it('结构锁定，不是身份锁定', () => {
    expect(prompt).toContain('相同建筑结构')
    expect(prompt).not.toContain('相同面部')
  })
  it('时段核心句式「保持结构只改光照与天气」', () => {
    expect(prompt).toContain('白天 / 黑夜 / 雨')
    expect(prompt).toContain('保持建筑结构')
    expect(prompt).toContain('只改光照')
  })
  it('机位「保持元素只改机位」', () => expect(prompt).toContain('广角 / 俯视'))
})

describe('Tier1 基础默认', () => {
  it('角色基础：三视图 + 基础表情 + 剪影，只需名字', () => {
    const p = buildBasicCharacterFixation('阿樱', { tagline: '配角少女' })
    expect(p).toContain('正面 / 侧面 / 背面')
    expect(p).toContain('平静 / 微笑 / 愤怒 / 惊讶')
    expect(p).toContain('阿樱')
    expect(p).toContain('相同面部')
  })
  it('场景基础：多时段 + 机位', () => {
    const p = buildBasicSceneFixation('天台')
    expect(p).toContain('白天 / 黑夜 / 黄昏')
    expect(p).toContain('相同建筑结构')
  })
})

describe('区块未勾选则不出现（卡随内容长）', () => {
  it('没给 outfits/props/palette → prompt 里无对应章节', () => {
    const p = buildFixationPrompt({ subject: 'character', name: 'x', style: 'anime', turnaround: true })
    expect(p).not.toContain('服装变体')
    expect(p).not.toContain('道具与材质')
    expect(p).not.toContain('色板')
  })
})

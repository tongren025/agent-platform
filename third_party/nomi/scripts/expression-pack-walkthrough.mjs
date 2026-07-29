// R13 真机走查（内置「表情预设」包）：
// 真旅程 = 新建空白项目 → 打开提示词库 → 表情预设 25 张卡带图排最前（file:// 相对路径
// 是关键验证面：预设图打包在 dist/prompt-media/，走 `electron .` 即生产同路径）→
// 搜「愤怒」命中 5 条 → 点开「怒目而视」预览 → 送上画布 → 画布节点带完整提示词。
// 截图进 .expr-walk/ 人眼判断。用法：pnpm build 后 node scripts/expression-pack-walkthrough.mjs
import { _electron as electron } from 'playwright'
import { createRequire } from 'node:module'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { mkdirSync } from 'node:fs'
import os from 'node:os'

const require = createRequire(import.meta.url)
const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const outDir = path.join(repoRoot, '.expr-walk')
mkdirSync(outDir, { recursive: true })
const shot = async (win, name) => { await win.screenshot({ path: path.join(outDir, name) }); console.log('  📸 ' + name) }

// 隔离档案：临时 settings + 项目根（无提示词库磁盘缓存 → 真实冷启动路径；垃圾项目不进用户库）
const isolatedSettings = path.join(os.tmpdir(), 'nomi-expr-walk-settings')
const isolatedProjects = path.join(os.tmpdir(), 'nomi-expr-walk-projects')
mkdirSync(isolatedSettings, { recursive: true })
mkdirSync(isolatedProjects, { recursive: true })

const app = await electron.launch({
  executablePath: require('electron'),
  args: ['.'],
  cwd: repoRoot,
  env: {
    ...process.env,
    NOMI_E2E: '1',
    NOMI_E2E_ALLOW_MULTI_INSTANCE: '1',
    NOMI_SETTINGS_DIR: isolatedSettings,
    NOMI_PROJECTS_DIR: isolatedProjects,
  },
})
const errors = []
let failed = false
try {
  const win = await app.firstWindow()
  const bw = await app.browserWindow(win)
  await bw.evaluate((w) => w.setBounds({ x: 0, y: 0, width: 1680, height: 1020 })).catch(() => {})
  win.on('pageerror', (e) => errors.push(String(e)))
  win.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()) })
  await win.waitForLoadState('domcontentloaded')
  await win.waitForTimeout(1800)

  await win.getByText('新建空白项目', { exact: false }).first().click()
  await win.waitForTimeout(2500)

  // 打开提示词库（顶栏入口派发的同一事件）
  await win.evaluate(() => window.dispatchEvent(new Event('nomi-open-prompt-library')))
  await win.waitForTimeout(1200)

  // 冷启动会先等外部源拉取（有代理→成功；断网→seed 地板），内置包两种结局都必须在最前
  const firstCard = win.getByText('表情预设').first()
  await firstCard.waitFor({ timeout: 90000 })
  await win.waitForTimeout(1500) // 等图片解码
  await shot(win, '01-library-top-expressions-first.png') // 验：25 张表情卡排画廊最前 + 封面真图

  // 硬断言①：内置预设图（相对路径 → file://dist/prompt-media/…）真实解码成功
  const media = await win.evaluate(() => {
    const imgs = Array.from(document.querySelectorAll('img[src*="prompt-media/expressions"]'))
    return {
      total: imgs.length,
      loaded: imgs.filter((img) => img.complete && img.naturalWidth > 0).length,
      firstSrc: imgs[0]?.src || '(无)',
      chips: Array.from(document.querySelectorAll('button')).filter((b) => (b.textContent || '').includes('表情预设')).length,
    }
  })
  console.log('  媒体审计: ' + JSON.stringify(media))
  if (media.loaded < 5) { console.log('  ✗ 表情预设封面图没有真实解码（相对路径在当前协议下失效？）'); failed = true }
  else console.log(`  ✓ ${media.loaded}/${media.total} 张预设封面已解码，src 形如 ${media.firstSrc}`)

  // 搜索「愤怒」→ 应命中愤怒族 5 档
  const search = win.locator('[aria-label="搜索提示词"]')
  await search.first().fill('愤怒')
  await win.waitForTimeout(900)
  const angerCount = await win.evaluate(() => document.body.textContent.match(/愤怒 \d\/5/g)?.length || 0)
  console.log(`  搜索命中: 愤怒 x/5 标题出现 ${angerCount} 次`)
  if (angerCount < 5) { console.log('  ✗ 搜索「愤怒」没有命中全部 5 档'); failed = true }
  await shot(win, '02-search-anger-5-levels.png') // 验：愤怒 1/5…5/5 五张卡

  // 点开 4/5 预览
  await win.getByText('怒目而视', { exact: false }).first().click()
  await win.waitForTimeout(900)
  await shot(win, '03-preview-anger4.png') // 验：大图预览 + 完整提示词 + 「送上画布」

  // 送上画布
  await win.getByText('送上画布', { exact: true }).first().click()
  await win.waitForTimeout(900)
  await win.keyboard.press('Escape').catch(() => {}) // 关预览
  await win.waitForTimeout(400)
  await win.keyboard.press('Escape').catch(() => {}) // 关库面板
  await win.waitForTimeout(600)
  // 新建空白项目默认落创作区；节点进的是画布 store → 切到生成区让画布 DOM 挂载（用户同款路径）
  await win.locator('[aria-label="工作区切换"]').getByText('生成', { exact: true }).click()
  await win.waitForTimeout(1500)
  await shot(win, '04-canvas-node-landed.png') // 验：画布出现图片节点，composer 带表情提示词

  // 硬断言②：画布出节点 + 提示词正文真的落进 composer（DOM=用户所见）。
  // 注意搜「提示词正文」特征段（愤怒 4/5 的正文），标题「怒目而视」不在正文里；
  // composer 是节点旁的锚定浮层，不嵌在 [data-node-id] 内 → 查全文档。
  const canvas = await win.evaluate(() => {
    const nodes = document.querySelectorAll('[data-node-id]').length
    const text = document.body.textContent || ''
    return {
      nodes,
      hasPrompt: text.includes('双眉猛压成倒八字') && text.includes('仅将面部表情改为'),
    }
  })
  console.log('  画布审计: ' + JSON.stringify(canvas))
  if (canvas.nodes < 1 || !canvas.hasPrompt) { console.log('  ✗ 画布没出节点或提示词没落进 composer'); failed = true }
  else console.log('  ✓ 画布出「镜头 1」节点，composer 带完整愤怒 4/5 提示词')

  console.log('\n=== 页面错误(' + errors.length + ') ===')
  for (const e of errors.slice(0, 8)) console.log('  ✗ ' + e.slice(0, 200))
} finally {
  await app.close().catch(() => {})
}
if (failed) { console.log('WALKTHROUGH: FAIL'); process.exit(1) }
console.log('WALKTHROUGH: PASS')

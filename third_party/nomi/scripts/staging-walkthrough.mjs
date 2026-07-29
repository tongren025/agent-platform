// 真实用户走查：打包 App 里在生成助手对话发一个需要锁站位的镜头请求 → 批准 →
// 看画布是否出现 站位参考(scene3d) 节点 + 自动截的参考图 + composition_ref 边。
// 需 apimart 文本 key（用 app 已配的）。用法：pnpm run build && APIMART_E2E=1 node scripts/staging-walkthrough.mjs
import { _electron as electron } from 'playwright'
import { createRequire } from 'node:module'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { mkdirSync } from 'node:fs'

const require = createRequire(import.meta.url)
const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const outDir = path.join(repoRoot, '.pose-lab')
mkdirSync(outDir, { recursive: true })

const PROMPT = '在画布上做一个镜头：男主角单膝跪地向女主角求婚，女主角站在他正前方，低机位仰拍中景。请把两人的站位、动作和机位锁定好。'

const app = await electron.launch({ executablePath: require('electron'), args: ['.'], cwd: repoRoot, env: { ...process.env } })
const errors = []
try {
  const win = await app.firstWindow()
  const bw = await app.browserWindow(win)
  await bw.evaluate((w) => w.setBounds({ x: 0, y: 0, width: 1680, height: 1020 })).catch(() => {})
  await win.waitForTimeout(500)
  win.on('console', (m) => {
    if (m.type() === 'error') errors.push(m.text())
    const t = m.text()
    if (t.includes('[staging')) console.log('  · ' + t)
  })
  win.on('pageerror', (e) => errors.push(String(e)))
  await win.waitForLoadState('domcontentloaded')
  await win.waitForTimeout(1500)

  // 始终新建空白项目，避免复用已有项目累积的残留节点污染判定。
  await win.getByText('新建空白项目', { exact: false }).first().click()
  await win.waitForTimeout(2500)
  await win.getByRole('button', { name: '生成', exact: false }).first().click()
  await win.waitForTimeout(1200)

  // 展开生成助手
  const launcher = win.locator('[aria-label="生成区 AI 启动器"]')
  if ((await launcher.count()) > 0) { await launcher.first().click(); await win.waitForTimeout(800) }
  const input = win.locator('[aria-label="给生成助手发送消息"]')
  await input.first().waitFor({ timeout: 8000 })
  await input.first().fill(PROMPT)
  await win.locator('[aria-label="生成 AI 发送"]').first().click()
  console.log('  ✓ 已发送请求，等待 agent 规划 + 批准…')

  // 轮询：点所有「确认/批准/执行/采纳」按钮，直到画布出现站位节点或超时。
  const deadline = Date.now() + 150000
  let shot = 0
  while (Date.now() < deadline) {
    for (const label of ['确认全部', '确认创建', '确认', '批准', '执行', '采纳']) {
      const btn = win.getByRole('button', { name: label, exact: true })
      const n = await btn.count().catch(() => 0)
      for (let i = 0; i < n; i += 1) {
        await btn.nth(i).click({ timeout: 1500 }).catch(() => {})
      }
    }
    if (shot % 3 === 0) await win.screenshot({ path: path.join(outDir, `walk-${String(shot).padStart(2, '0')}.png`) })
    shot += 1
    // 站位参考节点出现 → 标题含「站位参考」
    const staged = await win.getByText('站位参考', { exact: false }).count().catch(() => 0)
    if (staged > 0) {
      await win.waitForTimeout(6000) // 等离屏出图 + 连边
      await win.screenshot({ path: path.join(outDir, 'walk-final.png') })
      console.log('  ✓ 画布出现「站位参考」节点')
      break
    }
    await win.waitForTimeout(4000)
  }
  // 收尾：适应视图把所有节点纳入 + 等离屏出图 + 高清最终截图。
  await win.locator('[aria-label="适应视图"]').first().click({ timeout: 2000 }).catch(() => {})
  await win.waitForTimeout(7000)
  await win.locator('[aria-label="适应视图"]').first().click({ timeout: 2000 }).catch(() => {})
  await win.waitForTimeout(1000)
  const staged = await win.getByText('站位参考', { exact: false }).count().catch(() => 0)
  console.log(`  画布「站位参考」节点：${staged}`)
  await win.screenshot({ path: path.join(outDir, 'walk-end.png') })
  // 放大画布看清站位参考缩略图（Ctrl+滚轮在画布中心放大）。
  await win.mouse.move(700, 480)
  await win.keyboard.down('Control')
  for (let i = 0; i < 6; i += 1) { await win.mouse.wheel(0, -240); await win.waitForTimeout(120) }
  await win.keyboard.up('Control')
  await win.waitForTimeout(800)
  await win.screenshot({ path: path.join(outDir, 'walk-zoom.png') })
  // 直接截「站位参考」节点卡元素（含自动截的参考图缩略图）。
  const card = win.getByText('站位参考', { exact: false }).first()
  await card.screenshot({ path: path.join(outDir, 'walk-card.png') }).catch(() => {})
  console.log(errors.length ? `console errors:\n  ${errors.slice(0, 8).join('\n  ')}` : 'no console errors')
} catch (error) {
  console.error(`FAIL: ${error?.message || error}`)
  try { const win = await app.firstWindow(); await win.screenshot({ path: path.join(outDir, 'walk-FAIL.png') }) } catch {}
} finally {
  await app.close().catch(() => undefined)
}

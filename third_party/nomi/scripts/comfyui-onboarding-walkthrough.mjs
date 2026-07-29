// R13 真机走查：本地 ComfyUI 接入卡。可接入「有本地 ComfyUI？」→ 展开卡（未启用）→ 点「启用本地 ComfyUI」
// → 探测 mock /system_stats → 卡上到「已接入 · 运行中」→ 停用回落。截图人眼判断。
// 用法：node scripts/comfyui-onboarding-walkthrough.mjs
import { _electron as electron } from 'playwright'
import { createRequire } from 'node:module'
import http from 'node:http'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { mkdirSync, mkdtempSync } from 'node:fs'
import os from 'node:os'

const require = createRequire(import.meta.url)
const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const outDir = path.join(repoRoot, '.comfyui-onboarding-walk')
mkdirSync(outDir, { recursive: true })
// 每次跑用全新 settings 目录 → 种子重跑 comfyui-local enabled:false（否则上次启用会持久到下次，卡永远在「已接入」）。
const settingsDir = mkdtempSync(path.join(os.tmpdir(), 'comfyui-walk-'))
const shot = async (win, name) => { await win.screenshot({ path: path.join(outDir, name) }); console.log('  📸 ' + name) }

// 假 ComfyUI：只要 /system_stats（探测卡走这条）。绑 8188 = 种子 baseUrl。
let statsHits = 0
const mock = http.createServer((req, res) => {
  if ((req.url || '').startsWith('/system_stats')) {
    statsHits += 1
    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({
      system: { os: 'posix', python_version: '3.11.9 (main)', comfyui_version: '0.3.30' },
      devices: [{ name: 'cuda:0 NVIDIA GeForce RTX 4090', type: 'cuda', vram_total: 25757220864 }],
    }))
    return
  }
  res.writeHead(404); res.end()
})
await new Promise((r) => mock.listen(8188, '127.0.0.1', r))
console.log('  🟢 mock ComfyUI on 127.0.0.1:8188')

const app = await electron.launch({
  executablePath: require('electron'),
  args: ['.'],
  cwd: repoRoot,
  env: {
    ...process.env,
    NOMI_E2E: '1',
    NOMI_E2E_ALLOW_MULTI_INSTANCE: '1',
    NOMI_RENDERER_URL: 'file://' + path.join(repoRoot, 'dist', 'index.html'),
    NOMI_SETTINGS_DIR: settingsDir,
  },
})
const errors = []
try {
  const win = await app.firstWindow()
  const bw = await app.browserWindow(win)
  await bw.evaluate((w) => w.setBounds({ x: 0, y: 0, width: 1440, height: 1000 })).catch(() => {})
  win.on('pageerror', (e) => errors.push(String(e)))
  win.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()) })
  await win.waitForLoadState('domcontentloaded')
  await win.waitForTimeout(1800)

  // 打开模型接入面板（库页顶部「模型接入」）。
  await win.getByRole('button', { name: '模型接入', exact: false }).first().click()
  await win.waitForTimeout(1200)
  await shot(win, '01-drawer-open.png') // 验：模型设置 drawer

  // 可接入分组「有本地 ComfyUI？」展开
  const group = win.getByText('有本地 ComfyUI', { exact: false }).first()
  await group.waitFor({ timeout: 8000 })
  await group.click()
  await win.waitForTimeout(600)
  // 卡「本地 ComfyUI」展开
  const cardHeader = win.getByText('本地 ComfyUI', { exact: true }).first()
  await cardHeader.waitFor({ timeout: 6000 })
  await cardHeader.click()
  await win.waitForTimeout(500)
  await shot(win, '02-card-disabled.png') // 验：未启用 + 接入地址 + 「启用本地 ComfyUI」按钮

  // 点启用 → 探测 mock → 卡上到「已接入」（折叠）。
  await win.getByRole('button', { name: '启用本地 ComfyUI', exact: false }).first().click()
  console.log('  ⏳ 探测 /system_stats…')
  await win.waitForTimeout(2500)
  // 已接入卡默认折叠 → 展开看运行中态
  await win.getByText('本地 ComfyUI', { exact: true }).first().click()
  await win.waitForTimeout(700)
  await shot(win, '03-card-enabled-running.png') // 验：已接入 · 运行中 · 显示 Python/显卡摘要 + 模型行

  const runningVisible = await win.getByText('已连上 ComfyUI', { exact: false }).count()
  const modelVisible = await win.getByText('本地 · 文生图', { exact: false }).count()
  console.log(`  system_stats 命中=${statsHits}  运行中文案=${runningVisible}  模型行=${modelVisible}`)

  // 停用 → 回落可接入
  const disableBtn = win.getByRole('button', { name: '停用', exact: true })
  if ((await disableBtn.count()) > 0) {
    await disableBtn.first().click()
    await win.waitForTimeout(1000)
    await shot(win, '04-card-disabled-again.png') // 验：回到未启用
  }

  console.log(errors.length ? ('  ⚠️ console/page errors:\n' + errors.slice(0, 8).join('\n')) : '  ✅ 无 console/page error')
  console.log(`  ✅ 走查结束：探测命中 ${statsHits} 次`)
} catch (e) {
  console.error('  ❌ 走查失败：', e)
  try { const w = await app.firstWindow(); await shot(w, 'ERROR.png') } catch { /* noop */ }
  process.exitCode = 1
} finally {
  await app.close()
  mock.close()
}

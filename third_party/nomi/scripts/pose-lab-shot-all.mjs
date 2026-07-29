// 一次性截全部姿势预设 × 多视角。用法：node scripts/pose-lab-shot-all.mjs <port>
import { chromium } from 'playwright'
import { mkdirSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const port = process.argv[2] || '5274'
const outDir = path.join(repoRoot, '.pose-lab')
const batchSize = 4
mkdirSync(outDir, { recursive: true })

function readPresetIds() {
  const constantsPath = path.join(repoRoot, 'src/workbench/generationCanvas/nodes/scene3d/scene3dConstants.ts')
  const source = readFileSync(constantsPath, 'utf8')
  const match = source.match(/export const MANNEQUIN_POSE_PRESETS[\s\S]*?\n\]/)
  if (!match) throw new Error('MANNEQUIN_POSE_PRESETS block not found')
  return [...match[0].matchAll(/id:\s*'([^']+)'/g)].map((item) => item[1])
}

const browser = await chromium.launch()
const context = await browser.newContext({ viewport: { width: 1800, height: 700 }, deviceScaleFactor: 2 })

async function shoot(view, from, tag) {
  const page = await context.newPage()
  const errors = []
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()) })
  page.on('pageerror', (e) => errors.push(String(e)))
  await page.goto(`http://127.0.0.1:${port}/pose-lab.html?view=${view}&from=${from}&count=${batchSize}&zoom=150`, { waitUntil: 'networkidle' })
  await page.waitForFunction(() => window.__poseLabReady === true, { timeout: 15000 }).catch(() => {})
  await page.waitForTimeout(1200)
  const file = path.join(outDir, `pose-${view}-${tag}.png`)
  await page.screenshot({ path: file })
  console.log(`  ✓ ${view} ${tag} → ${file}`)
  if (errors.length) console.log(`  ⚠ ${view} ${tag}: ` + errors.slice(0, 4).join(' | '))
  await page.close()
}

const views = (process.argv[3] || 'front,side,q3').split(',')
const presetIds = readPresetIds()
try {
  for (const view of views) {
    for (let from = 0; from < presetIds.length; from += batchSize) {
      const tag = String.fromCharCode(97 + from / batchSize)
      const names = presetIds.slice(from, from + batchSize).join(',')
      await shoot(view, from, tag)
      console.log(`    ${tag}: ${names}`)
    }
  }
} finally {
  await browser.close()
}

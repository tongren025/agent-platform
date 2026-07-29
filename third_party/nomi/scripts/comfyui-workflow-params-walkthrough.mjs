// R13 真机走查：PR#55 ComfyUI 自定义工作流「生成时可调参数」。
// 路径：模型接入 → 本地 ComfyUI（mock 探测）→ 导入自定义工作流 → 贴 LTX 常量节点形态 JSON →
// 分析 → 参数区（空态+常用 chips）→ 一键加 宽/高/秒/帧率 → 添加参数/删除参数 → 导入 →
// 铅笔重开编辑验参数持久化。截图人眼判断。
// 用法：node scripts/comfyui-workflow-params-walkthrough.mjs
import { _electron as electron } from 'playwright'
import { createRequire } from 'node:module'
import http from 'node:http'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { mkdirSync, mkdtempSync } from 'node:fs'
import os from 'node:os'

const require = createRequire(import.meta.url)
const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const outDir = path.join(repoRoot, '.comfyui-workflow-params-walk')
mkdirSync(outDir, { recursive: true })
const settingsDir = mkdtempSync(path.join(os.tmpdir(), 'comfyui-params-walk-'))
const shot = async (win, name) => { await win.screenshot({ path: path.join(outDir, name) }); console.log('  📸 ' + name) }

// LTX 2.3 常量节点形态（同 comfyuiWorkflowImport.test.ts 固件）：宽高/秒数/帧率藏在常量节点 value。
const LTX_GRAPH = JSON.stringify({
  108: { class_type: 'LTXVImgToVideo', inputs: { width: ['292', 0], height: ['293', 0], length: ['287', 0], positive: ['110', 0], image: ['200', 0] } },
  110: { class_type: 'CLIPTextEncode', inputs: { text: 'default prompt', clip: ['111', 0] } },
  111: { class_type: 'CLIPLoader', inputs: { clip_name: 't5xxl_fp16.safetensors' } },
  200: { class_type: 'LoadImage', inputs: { image: 'start.png' } },
  285: { class_type: 'PrimitiveFloat', _meta: { title: 'FPS' }, inputs: { value: 24 } },
  287: { class_type: 'SimpleCalculatorKJ', inputs: { a: ['291', 0], b: ['285', 0], operation: 'multiply' } },
  291: { class_type: 'INTConstant', _meta: { title: 'LENGTH (in seconds)' }, inputs: { value: 5 } },
  292: { class_type: 'INTConstant', _meta: { title: 'WIDTH' }, inputs: { value: 960 } },
  293: { class_type: 'INTConstant', _meta: { title: 'HEIGHT' }, inputs: { value: 544 } },
  300: { class_type: 'SaveVideo', inputs: { video: ['108', 0], filename_prefix: 'ltx' } },
})

const mock = http.createServer((req, res) => {
  if ((req.url || '').startsWith('/system_stats')) {
    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ system: { os: 'posix', python_version: '3.11.9', comfyui_version: '0.3.30' }, devices: [{ name: 'cuda:0', type: 'cuda', vram_total: 1 }] }))
    return
  }
  res.writeHead(404); res.end()
})
await new Promise((r) => mock.listen(8188, '127.0.0.1', r))

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
    NOMI_PROJECTS_DIR: mkdtempSync(path.join(os.tmpdir(), 'comfyui-params-proj-')),
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

  await win.getByRole('button', { name: '接入模型', exact: false }).first().click()
  await win.waitForTimeout(1000)
  await win.getByText('有本地 ComfyUI', { exact: false }).first().click()
  await win.waitForTimeout(500)
  await win.getByText('ComfyUI · 本地', { exact: false }).first().click()
  await win.waitForTimeout(400)
  await win.getByRole('button', { name: '启用 ComfyUI', exact: false }).first().click()
  await win.waitForTimeout(2200)
  await win.getByText('ComfyUI · 本地', { exact: false }).first().click()
  await win.waitForTimeout(600)

  // 导入自定义工作流 → 贴 JSON → 分析
  await win.getByRole('button', { name: '导入自定义工作流', exact: false }).first().click()
  await win.waitForTimeout(400)
  await win.getByRole('textbox', { name: 'workflow_api.json 粘贴框' }).fill(LTX_GRAPH)
  await win.getByRole('button', { name: '分析工作流', exact: true }).click()
  await win.waitForTimeout(700)
  await win.getByText('生成时可调参数', { exact: true }).scrollIntoViewIfNeeded()
  await shot(win, '01-params-empty-with-presets.png') // 验：参数区空态提示 + 常用 chips（宽/高/秒/帧率可点）

  // 一键加四个常用参数
  for (const label of ['宽度', '高度', '秒数', '帧率']) {
    await win.getByRole('button', { name: label, exact: true }).click()
    await win.waitForTimeout(150)
  }
  await win.getByText('生成时可调参数', { exact: true }).scrollIntoViewIfNeeded()
  await shot(win, '02-four-preset-params.png') // 验：4 行参数（节点选择器/类型/显示名/删除钮），chips 变灰

  // 添加参数（自动挑第一个未用候选）→ 再删掉
  await win.getByRole('button', { name: '添加参数', exact: true }).click()
  await win.waitForTimeout(300)
  await shot(win, '03-add-free-param.png') // 验：第 5 行出现（任意标量候选）
  const removeButtons = win.getByRole('button', { name: '删除参数', exact: true })
  await removeButtons.last().click()
  await win.waitForTimeout(300)

  // 命名 + 导入
  await win.getByPlaceholder('给它起个名', { exact: false }).fill('LTX 常量参数走查')
  await win.getByRole('button', { name: '导入', exact: true }).click()
  await win.waitForTimeout(1200)
  await shot(win, '04-imported-model-row.png') // 验：模型行出现 + 成功 toast

  // 铅笔重开编辑（hover 才显形）：先等成功 toast 消退——toast 文本含模型名，会抢走 getByText.first()
  await win.waitForTimeout(3500)
  await win.getByText('LTX 常量参数走查', { exact: false }).first().hover()
  await win.waitForTimeout(300)
  await win.getByRole('button', { name: '编辑工作流 LTX 常量参数走查', exact: false }).first().click()
  await win.waitForTimeout(700)
  await win.getByText('生成时可调参数', { exact: true }).scrollIntoViewIfNeeded()
  await shot(win, '05-edit-mode-params-persisted.png') // 验：编辑态 4 行参数原样回来（宽/高/秒/帧率）

  console.log(errors.length ? ('  ⚠️ console/page errors:\n' + errors.slice(0, 8).join('\n')) : '  ✅ 无 console/page error')
} catch (e) {
  console.error('  ❌ 走查失败：', e)
  try { const w = await app.firstWindow(); await shot(w, 'ERROR.png') } catch { /* noop */ }
  process.exitCode = 1
} finally {
  await app.close()
  mock.close()
}

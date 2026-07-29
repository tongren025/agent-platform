import { chromium } from 'playwright'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createServer } from 'node:http'
import { createReadStream, existsSync, mkdirSync } from 'node:fs'

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
const marketingRoot = path.join(repoRoot, 'marketing')
const shotsDir = path.join(repoRoot, 'tests/ux/_marketing')
mkdirSync(shotsDir, { recursive: true })

function assert(condition, label) {
  if (!condition) throw new Error(`MARKETING QUICKSTART FAIL: ${label}`)
  console.log(`  ✓ ${label}`)
}

const contentTypes = new Map([
  ['.html', 'text/html; charset=utf-8'],
  ['.svg', 'image/svg+xml'],
  ['.png', 'image/png'],
  ['.jpg', 'image/jpeg'],
  ['.jpeg', 'image/jpeg'],
  ['.gif', 'image/gif'],
  ['.mp4', 'video/mp4'],
])

const server = createServer((req, res) => {
  const url = new URL(req.url || '/', 'http://127.0.0.1')
  const safePath = path.normalize(decodeURIComponent(url.pathname)).replace(/^(\.\.[/\\])+/, '')
  const filePath = path.join(marketingRoot, safePath === '/' ? 'index.html' : safePath)
  if (!filePath.startsWith(marketingRoot) || !existsSync(filePath)) {
    res.writeHead(404)
    res.end('not found')
    return
  }
  res.writeHead(200, { 'content-type': contentTypes.get(path.extname(filePath)) || 'application/octet-stream' })
  createReadStream(filePath).pipe(res)
})

await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve))
const { port } = server.address()
const quickstartUrl = `http://127.0.0.1:${port}/quickstart.html`

async function auditViewport(browser, name, viewport) {
  const page = await browser.newPage({ viewport })
  await page.goto(quickstartUrl)
  await page.waitForLoadState('networkidle')
  await page.screenshot({ path: path.join(shotsDir, `quickstart-${name}.png`), fullPage: true })

  const result = await page.evaluate(() => {
    const overflow = document.documentElement.scrollWidth - document.documentElement.clientWidth
    const headings = Array.from(document.querySelectorAll('h1,h2,h3')).map((el) => el.textContent.trim()).filter(Boolean)
    const links = Array.from(document.querySelectorAll('a[href]')).map((el) => el.getAttribute('href'))
    const images = Array.from(document.querySelectorAll('img')).map((img) => ({
      src: img.getAttribute('src'),
      alt: img.getAttribute('alt') || '',
      width: img.naturalWidth,
      height: img.naturalHeight,
    }))
    const blankImages = images.filter((img) => img.width < 10 || img.height < 10)
    const missingAlt = images.filter((img) => img.alt.trim().length === 0 && !/nomi-logo/.test(img.src || ''))
    return { title: document.title, overflow, headings, links, images, blankImages, missingAlt }
  })

  assert(result.title.includes('Nomi 新手指南'), `${name}: title 正确`)
  assert(result.overflow <= 1, `${name}: 无横向溢出`)
  assert(result.headings.includes('第一次打开 Nomi，就这样做。'), `${name}: hero H1 可见`)
  assert(result.headings.some((h) => h.includes('Image-to-Video')), `${name}: Image-to-Video 章节可见`)
  assert(result.links.includes('https://github.com/aqm857886159/Nomi/releases/latest/download/Nomi-mac-arm64.dmg'), `${name}: Mac arm64 下载链接在位`)
  assert(result.links.includes('https://github.com/aqm857886159/Nomi/releases/latest/download/Nomi-windows-setup.exe'), `${name}: Windows 下载链接在位`)
  assert(result.images.length >= 5, `${name}: 示意图资源已嵌入`)
  assert(result.blankImages.length === 0, `${name}: 图片非空渲染`)
  assert(result.missingAlt.length === 0, `${name}: 图片 alt 完整`)
  await page.close()
}

const browser = await chromium.launch()
try {
  await auditViewport(browser, 'desktop', { width: 1440, height: 1200 })
  await auditViewport(browser, 'mobile', { width: 390, height: 844 })
  console.log('\nMARKETING QUICKSTART PASS')
} finally {
  await browser.close()
  await new Promise((resolve) => server.close(resolve))
}

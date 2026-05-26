import { chromium } from 'playwright'
import { mkdir } from 'node:fs/promises'
import { resolve } from 'node:path'

const BASE = 'https://quiz.zxbdwy.online'
const OUT = resolve(process.cwd(), 'docs/screenshots')

const pages = [
  { name: '01-home', path: '/' },
  { name: '02-chapters', path: '/chapters' },
  { name: '03-practice-sequential', path: '/practice/sequential?ch=ch_一' },
  { name: '04-practice-random', path: '/practice/random' },
  { name: '05-kp-index', path: '/kp' },
  { name: '06-kp-detail', path: '/kp/ch_一' },
  { name: '07-wrong', path: '/wrong' },
  { name: '08-stats', path: '/stats' },
  { name: '09-login', path: '/login' },
  { name: '10-signup', path: '/signup' },
]

await mkdir(OUT, { recursive: true })

const browser = await chromium.launch()
const ctx = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 2,
  colorScheme: 'light',
  locale: 'zh-CN',
})

for (const p of pages) {
  const page = await ctx.newPage()
  const url = BASE + p.path
  console.log('→', url)
  try {
    await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 })
    await page.waitForTimeout(800)
    const file = `${OUT}/${p.name}.png`
    await page.screenshot({ path: file, fullPage: true })
    console.log('   saved', file)
  } catch (e) {
    console.log('   FAILED', e.message)
  }
  await page.close()
}

await browser.close()
console.log('done')

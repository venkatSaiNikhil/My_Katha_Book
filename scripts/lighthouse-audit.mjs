import { chromium } from '@playwright/test'
import lighthouse from 'lighthouse'
import { writeFileSync } from 'node:fs'

const url = process.argv[2] ?? 'http://localhost:4173/'
const skipLogin = process.argv.includes('--skip-login')
const DEBUG_PORT = 9223

const browser = await chromium.launch({
  headless: true,
  args: [`--remote-debugging-port=${DEBUG_PORT}`, '--no-sandbox'],
})

try {
  if (skipLogin) {
    const page = await browser.newPage()
    await page.goto(url)
    await page.evaluate(() => localStorage.setItem('khata_v1_login_dismissed', 'true'))
    await page.close()
  }

  const result = await lighthouse(
    url,
    { port: DEBUG_PORT, output: 'json', logLevel: 'error' },
    {
      extends: 'lighthouse:default',
      settings: {
        formFactor: 'mobile',
        screenEmulation: { mobile: true, width: 375, height: 812, deviceScaleFactor: 2, disabled: false },
        throttlingMethod: 'simulate',
      },
    },
  )

  writeFileSync('./lighthouse-report.json', result.report)

  const categories = result.lhr.categories
  const scores = Object.fromEntries(
    Object.entries(categories).map(([key, cat]) => [key, Math.round((cat.score ?? 0) * 100)]),
  )

  console.log(JSON.stringify(scores, null, 2))
  if (result.lhr.runtimeError) {
    console.error('runtimeError:', JSON.stringify(result.lhr.runtimeError, null, 2))
  }
} finally {
  await browser.close()
}

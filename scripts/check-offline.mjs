import { chromium } from '@playwright/test'

const url = process.argv[2] ?? 'http://localhost:5173/'

const browser = await chromium.launch({ headless: true })
const context = await browser.newContext()
const page = await context.newPage()

await page.addInitScript(() => {
  localStorage.clear()
  localStorage.setItem('khata_v1_login_dismissed', 'true')
})
await page.goto(url)

console.log('Going offline...')
await context.setOffline(true)

// Add a transaction while fully offline.
await page.getByRole('button', { name: '＋ Add transaction' }).click()
const sheet = page.locator('.animate-slide-up')
await page.getByLabel('Amount').fill('99')
await sheet.getByText('Groceries', { exact: true }).click()
await sheet.getByText('Milk & Dairy', { exact: true }).click()
await sheet.getByText('Cash', { exact: true }).click()
await sheet.getByRole('button', { name: 'Save & sync' }).click()

const row = page.locator('li', { hasText: 'Milk & Dairy' })
const visible = await row.isVisible().catch(() => false)
console.log('Transaction saved while offline:', visible)

const stored = await page.evaluate(() => localStorage.getItem('khata_v1_txns'))
console.log('Persisted to localStorage:', !!stored && JSON.parse(stored).length > 0)

console.log('Going back online...')
await context.setOffline(false)
await page.waitForTimeout(500)
const stillThere = await row.isVisible().catch(() => false)
console.log('Still visible after reconnect:', stillThere)

await browser.close()

import { expect, test, type Page } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.clear()
    localStorage.setItem('khata_v1_login_dismissed', 'true')
  })
  await page.goto('/')
})

function sheet(page: Page) {
  return page.locator('.animate-slide-up')
}

async function openAddTransactionSheet(page: Page) {
  await page.getByRole('button', { name: '＋ Add transaction' }).click()
}

async function addExpense(
  page: Page,
  opts: { category: string; subcategory: string; method: string; amount: string; note?: string },
) {
  await openAddTransactionSheet(page)
  const s = sheet(page)
  await page.getByLabel('Amount').fill(opts.amount)
  await s.getByText(opts.category, { exact: true }).click()
  await s.getByText(opts.subcategory, { exact: true }).click()
  await s.getByText(opts.method, { exact: true }).click()
  if (opts.note) {
    await page.getByLabel('Note').fill(opts.note)
  }
  await s.getByRole('button', { name: 'Save & sync' }).click()
}

async function addIncome(page: Page, opts: { source: string; amount: string }) {
  await openAddTransactionSheet(page)
  const s = sheet(page)
  await s.getByRole('button', { name: 'Income', exact: true }).click()
  await page.getByLabel('Amount').fill(opts.amount)
  await page.getByLabel('Income source').fill(opts.source)
  await s.getByRole('button', { name: 'Save & sync' }).click()
}

async function goToTab(page: Page, name: 'Today' | 'Analytics' | 'Wealth' | 'Save' | 'Categories') {
  await page.locator('nav').getByRole('button', { name, exact: true }).click()
}

test('add expense transaction', async ({ page }) => {
  await addExpense(page, {
    category: 'Food & Dining',
    subcategory: 'Zomato/Swiggy',
    method: 'UPI',
    amount: '250',
  })

  const row = page.locator('li', { hasText: 'Zomato/Swiggy' })
  await expect(row).toBeVisible()
  await expect(row).toContainText('−₹250')
  await expect(row).toContainText('UPI')

  await expect(page.getByText('₹250', { exact: true })).toBeVisible()
})

test('add income', async ({ page }) => {
  // Self-contained: add the expense first so the Net assertion below matches the guide's
  // Income ₹50,000 / Net ₹49,750 example without depending on state from another test.
  await addExpense(page, {
    category: 'Food & Dining',
    subcategory: 'Zomato/Swiggy',
    method: 'UPI',
    amount: '250',
  })

  await addIncome(page, { source: 'Salary', amount: '50000' })

  const summary = page.locator('.grid-cols-3')
  await expect(summary).toContainText('₹50,000') // Income
  await expect(summary).toContainText('₹49,750') // Net
})

test('delete transaction with undo', async ({ page }) => {
  await addExpense(page, {
    category: 'Groceries',
    subcategory: 'Milk & Dairy',
    method: 'Cash',
    amount: '80',
  })

  await expect(page.getByText('Milk & Dairy', { exact: true })).toBeVisible()

  await page.getByRole('button', { name: 'Delete Milk & Dairy' }).click()
  await expect(page.getByText('Milk & Dairy', { exact: true })).not.toBeVisible()
  await expect(page.getByText('Transaction deleted')).toBeVisible()

  await page.getByRole('button', { name: 'Undo' }).click()
  await expect(page.getByText('Milk & Dairy', { exact: true })).toBeVisible()
})

test('analytics shows correct breakdown', async ({ page }) => {
  await addExpense(page, {
    category: 'Groceries',
    subcategory: 'Milk & Dairy',
    method: 'Cash',
    amount: '400',
  })
  await addExpense(page, {
    category: 'Groceries',
    subcategory: 'Vegetables & Fruits',
    method: 'UPI',
    amount: '200',
  })
  await addExpense(page, {
    category: 'Food & Dining',
    subcategory: 'Zomato/Swiggy',
    method: 'UPI',
    amount: '400',
  })

  await goToTab(page, 'Analytics')

  const groceriesRow = page.locator('li', { hasText: 'Groceries' }).first()
  await expect(groceriesRow).toContainText('₹600')
  await expect(groceriesRow).toContainText('60%')

  const foodRow = page.locator('li', { hasText: 'Food & Dining' }).first()
  await expect(foodRow).toContainText('₹400')
  await expect(foodRow).toContainText('40%')
})

test('custom category', async ({ page }) => {
  await goToTab(page, 'Categories')

  await page.getByRole('button', { name: '＋ Add custom category' }).click()
  const s = sheet(page)
  await page.getByLabel('Category name').fill('Pets')
  await page.getByLabel('Emoji').fill('🐾')
  await page.getByLabel('Sub-categories').fill('Vet visit\nPet food')
  await s.getByRole('button', { name: 'Save category' }).click()

  await expect(page.getByText('Pets', { exact: true })).toBeVisible()

  await goToTab(page, 'Today')
  await openAddTransactionSheet(page)
  await expect(sheet(page).getByText('Pets', { exact: true })).toBeVisible()
})

test('wealth net worth', async ({ page }) => {
  await goToTab(page, 'Wealth')

  await page.getByRole('button', { name: '＋ Add account / investment / loan' }).click()
  let s = sheet(page)
  await page.getByLabel('Name', { exact: true }).fill('HDFC Savings')
  await page.getByLabel('Value').fill('50000')
  await s.getByRole('button', { name: 'Save', exact: true }).click()

  await page.getByRole('button', { name: '＋ Add account / investment / loan' }).click()
  s = sheet(page)
  await s.getByRole('button', { name: /Credit Card/ }).click()
  await page.getByLabel('Name', { exact: true }).fill('HDFC Card')
  await page.getByLabel('Value').fill('15000')
  await s.getByRole('button', { name: 'Save', exact: true }).click()

  await expect(page.getByTestId('net-worth')).toHaveText('₹35,000')
})

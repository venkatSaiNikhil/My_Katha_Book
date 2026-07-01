import type { Category, CategoryColor, Transaction } from '../data/types'

export type Period = 'week' | 'month' | 'all'

function parseDateOnly(iso: string): Date {
  const [y, m, d] = iso.slice(0, 10).split('-').map(Number)
  return new Date(y, m - 1, d)
}

function startOfWeek(date: Date): Date {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  const day = d.getDay()
  const diff = (day + 6) % 7 // days since Monday
  d.setDate(d.getDate() - diff)
  return d
}

function endOfWeek(date: Date): Date {
  const start = startOfWeek(date)
  return new Date(start.getFullYear(), start.getMonth(), start.getDate() + 6, 23, 59, 59, 999)
}

export function filterByPeriod(
  transactions: Transaction[],
  period: Period,
  referenceDate: Date = new Date(),
): Transaction[] {
  if (period === 'all') return transactions

  if (period === 'week') {
    const start = startOfWeek(referenceDate)
    const end = endOfWeek(referenceDate)
    return transactions.filter((t) => {
      const d = parseDateOnly(t.date)
      return d >= start && d <= end
    })
  }

  return transactions.filter((t) => {
    const d = parseDateOnly(t.date)
    return d.getFullYear() === referenceDate.getFullYear() && d.getMonth() === referenceDate.getMonth()
  })
}

export interface CategoryBreakdown {
  categoryId: string
  label: string
  icon: string
  color: CategoryColor
  amountPaise: number
  percent: number
}

export function groupByCategory(transactions: Transaction[], categories: Category[]): CategoryBreakdown[] {
  const expenses = transactions.filter((t) => t.type === 'expense')
  const total = expenses.reduce((sum, t) => sum + t.amountPaise, 0)

  const totals = new Map<string, number>()
  for (const txn of expenses) {
    totals.set(txn.categoryId, (totals.get(txn.categoryId) ?? 0) + txn.amountPaise)
  }

  const breakdown: CategoryBreakdown[] = []
  for (const [categoryId, amountPaise] of totals) {
    const cat = categories.find((c) => c.id === categoryId)
    breakdown.push({
      categoryId,
      label: cat?.label ?? 'Other',
      icon: cat?.icon ?? '🪙',
      color: cat?.color ?? 'slate',
      amountPaise,
      percent: total > 0 ? (amountPaise / total) * 100 : 0,
    })
  }

  return breakdown.sort((a, b) => b.amountPaise - a.amountPaise)
}

export interface SubcategoryBreakdown {
  subcategory: string
  amountPaise: number
  percent: number
  count: number
}

export function topSubcategories(transactions: Transaction[], limit = 6): SubcategoryBreakdown[] {
  const expenses = transactions.filter((t) => t.type === 'expense')
  const total = expenses.reduce((sum, t) => sum + t.amountPaise, 0)

  const totals = new Map<string, { amountPaise: number; count: number }>()
  for (const txn of expenses) {
    const entry = totals.get(txn.subcategory) ?? { amountPaise: 0, count: 0 }
    entry.amountPaise += txn.amountPaise
    entry.count += 1
    totals.set(txn.subcategory, entry)
  }

  return [...totals.entries()]
    .map(([subcategory, { amountPaise, count }]) => ({
      subcategory,
      amountPaise,
      count,
      percent: total > 0 ? (amountPaise / total) * 100 : 0,
    }))
    .sort((a, b) => b.amountPaise - a.amountPaise)
    .slice(0, limit)
}

export interface MethodBreakdown {
  method: string
  amountPaise: number
  percent: number
}

export function groupByMethod(transactions: Transaction[]): MethodBreakdown[] {
  const expenses = transactions.filter((t) => t.type === 'expense')
  const total = expenses.reduce((sum, t) => sum + t.amountPaise, 0)

  const totals = new Map<string, number>()
  for (const txn of expenses) {
    totals.set(txn.method, (totals.get(txn.method) ?? 0) + txn.amountPaise)
  }

  return [...totals.entries()]
    .map(([method, amountPaise]) => ({
      method,
      amountPaise,
      percent: total > 0 ? (amountPaise / total) * 100 : 0,
    }))
    .sort((a, b) => b.amountPaise - a.amountPaise)
}

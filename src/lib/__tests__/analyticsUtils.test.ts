import { describe, expect, it } from 'vitest'
import { DEFAULT_CATEGORIES } from '../../data/categories'
import type { Transaction } from '../../data/types'
import { filterByPeriod, groupByCategory, topSubcategories } from '../analyticsUtils'

function makeTxn(overrides: Partial<Transaction>): Transaction {
  return {
    id: 'txn',
    date: '2025-06-15',
    type: 'expense',
    categoryId: 'groceries',
    subcategory: 'Milk & Dairy',
    method: 'Cash',
    amountPaise: 10000,
    note: '',
    createdAt: '2025-06-15',
    ...overrides,
  }
}

describe('filterByPeriod', () => {
  const reference = new Date(2025, 5, 15) // Sunday 15 June 2025

  it('filters to the calendar month containing the reference date', () => {
    const txns = [
      makeTxn({ id: 't1', date: '2025-06-01' }),
      makeTxn({ id: 't2', date: '2025-06-30' }),
      makeTxn({ id: 't3', date: '2025-07-01' }),
      makeTxn({ id: 't4', date: '2025-05-31' }),
    ]
    const result = filterByPeriod(txns, 'month', reference)
    expect(result.map((t) => t.id)).toEqual(['t1', 't2'])
  })

  it('filters to the calendar week (Mon-Sun) containing the reference date', () => {
    const txns = [
      makeTxn({ id: 't1', date: '2025-06-09' }), // Monday, in range
      makeTxn({ id: 't2', date: '2025-06-15' }), // Sunday, in range
      makeTxn({ id: 't3', date: '2025-06-08' }), // previous Sunday, out of range
      makeTxn({ id: 't4', date: '2025-06-16' }), // next Monday, out of range
    ]
    const result = filterByPeriod(txns, 'week', reference)
    expect(result.map((t) => t.id)).toEqual(['t1', 't2'])
  })

  it('returns everything for "all"', () => {
    const txns = [makeTxn({ id: 't1', date: '2020-01-01' }), makeTxn({ id: 't2', date: '2030-01-01' })]
    expect(filterByPeriod(txns, 'all', reference)).toHaveLength(2)
  })
})

describe('groupByCategory', () => {
  it('sums expense amounts per category, sorted descending, with correct percentages', () => {
    const txns = [
      makeTxn({ id: 't1', categoryId: 'groceries', amountPaise: 40000 }),
      makeTxn({ id: 't2', categoryId: 'groceries', amountPaise: 20000 }),
      makeTxn({ id: 't3', categoryId: 'food-dining', amountPaise: 40000 }),
      makeTxn({ id: 't4', type: 'income', categoryId: 'income', amountPaise: 100000 }),
    ]
    const result = groupByCategory(txns, DEFAULT_CATEGORIES)

    expect(result).toHaveLength(2)
    expect(result[0]).toMatchObject({ categoryId: 'groceries', amountPaise: 60000, percent: 60 })
    expect(result[1]).toMatchObject({ categoryId: 'food-dining', amountPaise: 40000, percent: 40 })
  })
})

describe('topSubcategories', () => {
  it('returns the top N sub-categories by spend', () => {
    const txns = [
      makeTxn({ id: 't1', subcategory: 'Milk & Dairy', amountPaise: 10000 }),
      makeTxn({ id: 't2', subcategory: 'Milk & Dairy', amountPaise: 15000 }),
      makeTxn({ id: 't3', subcategory: 'Vegetables & Fruits', amountPaise: 5000 }),
    ]
    const result = topSubcategories(txns, 1)
    expect(result).toHaveLength(1)
    expect(result[0]).toMatchObject({ subcategory: 'Milk & Dairy', amountPaise: 25000, count: 2 })
  })
})

import { describe, expect, it } from 'vitest'
import { DEFAULT_CATEGORIES } from '../categories'
import { csvToTransactions, transactionsToCSV } from '../csv'
import type { Transaction } from '../types'

const sampleTxns: Transaction[] = [
  {
    id: 'txn-1',
    date: '2025-06-12',
    type: 'expense',
    categoryId: 'food-dining',
    subcategory: 'Zomato/Swiggy',
    method: 'UPI',
    amountPaise: 25000,
    note: 'Dinner order',
    createdAt: '2025-06-12',
  },
  {
    id: 'txn-2',
    date: '2025-06-01',
    type: 'income',
    categoryId: 'other',
    subcategory: 'Miscellaneous',
    method: 'Net banking',
    amountPaise: 5000000,
    note: 'Salary, June',
    createdAt: '2025-06-01',
  },
]

describe('csv round-trip', () => {
  it('round-trips transactions through CSV without loss', () => {
    const csv = transactionsToCSV(sampleTxns, DEFAULT_CATEGORIES)
    const parsed = csvToTransactions(csv, DEFAULT_CATEGORIES)
    expect(parsed).toEqual(sampleTxns)
  })

  it('writes the expected header', () => {
    const csv = transactionsToCSV(sampleTxns, DEFAULT_CATEGORIES)
    expect(csv.split('\n')[0]).toBe('ID,Date,Type,Category,Subcategory,Method,Amount,Note')
  })

  it('handles empty input', () => {
    expect(csvToTransactions('ID,Date,Type,Category,Subcategory,Method,Amount,Note')).toEqual([])
  })

  it('quotes fields containing commas', () => {
    const csv = transactionsToCSV(
      [{ ...sampleTxns[0], note: 'Dinner, with friends' }],
      DEFAULT_CATEGORIES,
    )
    expect(csv).toContain('"Dinner, with friends"')
  })
})

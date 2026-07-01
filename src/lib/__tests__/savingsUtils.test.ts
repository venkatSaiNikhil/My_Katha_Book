import { describe, expect, it } from 'vitest'
import type { Transaction } from '../../data/types'
import { calculateSuggestion } from '../savingsUtils'

function makeTxn(overrides: Partial<Transaction>): Transaction {
  return {
    id: 'txn',
    date: '2025-06-15',
    type: 'expense',
    categoryId: 'entertainment',
    subcategory: 'OTT subscriptions',
    method: 'UPI',
    amountPaise: 10000,
    note: '',
    createdAt: '2025-06-15',
    ...overrides,
  }
}

describe('calculateSuggestion', () => {
  it('sums discretionary spend across entertainment, shopping and food-dining', () => {
    const txns = [
      makeTxn({ id: 't1', categoryId: 'entertainment', amountPaise: 50000 }),
      makeTxn({ id: 't2', categoryId: 'shopping', amountPaise: 30000 }),
      makeTxn({ id: 't3', categoryId: 'food-dining', amountPaise: 20000 }),
      makeTxn({ id: 't4', categoryId: 'groceries', amountPaise: 100000 }), // not discretionary
    ]
    const result = calculateSuggestion(txns)
    expect(result.discretionaryPaise).toBe(100000)
  })

  it('rounds the suggested cut to the nearest ₹100', () => {
    // discretionary = ₹1,000 -> 30% = ₹300 exactly (already a multiple of 100)
    const txns = [makeTxn({ amountPaise: 100000 })]
    const result = calculateSuggestion(txns)
    expect(result.suggestedCutPaise).toBe(30000) // ₹300
    expect(result.potentialMonthlySavingPaise).toBe(30000)
    expect(result.potentialYearlySavingPaise).toBe(360000) // ₹3,600
  })

  it('rounds a non-round 30% cut to the nearest ₹100', () => {
    // discretionary = ₹1,234 -> 30% = ₹370.20 -> rounds to ₹400
    const txns = [makeTxn({ amountPaise: 123400 })]
    const result = calculateSuggestion(txns)
    expect(result.suggestedCutPaise).toBe(40000) // ₹400
  })

  it('returns the top 3 offending sub-categories by spend', () => {
    const txns = [
      makeTxn({ id: 't1', subcategory: 'OTT subscriptions', amountPaise: 50000 }),
      makeTxn({ id: 't2', subcategory: 'Movie tickets', amountPaise: 40000 }),
      makeTxn({ id: 't3', subcategory: 'Gaming', amountPaise: 30000 }),
      makeTxn({ id: 't4', subcategory: 'Events & Concerts', amountPaise: 20000 }),
    ]
    const result = calculateSuggestion(txns)
    expect(result.topOffenders).toHaveLength(3)
    expect(result.topOffenders.map((o) => o.subcategory)).toEqual([
      'OTT subscriptions',
      'Movie tickets',
      'Gaming',
    ])
  })
})

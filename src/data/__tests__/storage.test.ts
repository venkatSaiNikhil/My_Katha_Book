import { beforeEach, describe, expect, it } from 'vitest'
import { DEFAULT_CATEGORIES } from '../categories'
import { useStorage } from '../storage'
import type { AppState } from '../types'

describe('storage', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('load() returns default state when nothing is stored', () => {
    const { load } = useStorage()
    const state = load()

    expect(state.transactions).toEqual([])
    expect(state.categories).toEqual(DEFAULT_CATEGORIES)
    expect(state.wealth).toEqual([])
    expect(state.user).toBeNull()
    expect(state.driveFileIds).toEqual({ txn: null, wealth: null })
  })

  it('save() then load() round-trips full app state', () => {
    const { save, load } = useStorage()

    const state: AppState = {
      transactions: [
        {
          id: 'txn-1',
          date: '2025-06-12',
          type: 'expense',
          categoryId: 'groceries',
          subcategory: 'Milk & Dairy',
          method: 'Cash',
          amountPaise: 8000,
          note: '',
          createdAt: '2025-06-12',
        },
      ],
      categories: DEFAULT_CATEGORIES,
      wealth: [
        {
          id: 'wealth-1',
          type: 'bank',
          name: 'HDFC Savings',
          valuePaise: 5000000,
          bank: 'HDFC',
          createdAt: '2025-06-01',
        },
      ],
      user: { name: 'Nikhil', email: 'nikhil@example.com', clientId: 'test-client-id' },
      driveFileIds: { txn: 'file-1', wealth: 'file-2' },
    }

    save(state)
    expect(load()).toEqual(state)
  })

  it('clear() removes all stored state', () => {
    const { save, load, clear } = useStorage()

    save({
      transactions: [],
      categories: DEFAULT_CATEGORIES,
      wealth: [],
      user: null,
      driveFileIds: { txn: null, wealth: null },
    })

    clear()
    const state = load()
    expect(state.transactions).toEqual([])
    expect(state.user).toBeNull()
  })
})

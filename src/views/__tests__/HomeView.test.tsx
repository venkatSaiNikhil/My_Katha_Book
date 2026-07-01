import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { DEFAULT_CATEGORIES } from '../../data/categories'
import type { Transaction } from '../../data/types'
import { HomeView } from '../HomeView'

function makeTxn(overrides: Partial<Transaction>): Transaction {
  const today = new Date().toISOString().slice(0, 10)
  return {
    id: 'txn-1',
    date: today,
    type: 'expense',
    categoryId: 'groceries',
    subcategory: 'Milk & Dairy',
    method: 'Cash',
    amountPaise: 10000,
    note: '',
    createdAt: today,
    ...overrides,
  }
}

describe('HomeView', () => {
  it('renders summary strip with correct totals', () => {
    const transactions = [
      makeTxn({
        id: 't1',
        type: 'income',
        categoryId: 'income',
        subcategory: 'Salary',
        amountPaise: 5000000,
      }),
      makeTxn({ id: 't2', type: 'expense', amountPaise: 200000 }),
      makeTxn({ id: 't3', type: 'expense', amountPaise: 50000 }),
    ]

    render(
      <HomeView transactions={transactions} categories={DEFAULT_CATEGORIES} onDelete={vi.fn()} />,
    )

    expect(screen.getByText('₹50,000')).toBeInTheDocument()
    expect(screen.getByText('₹2,500')).toBeInTheDocument()
    expect(screen.getByText('₹47,500')).toBeInTheDocument()
  })

  it('shows the empty state when there are no transactions', () => {
    render(<HomeView transactions={[]} categories={DEFAULT_CATEGORIES} onDelete={vi.fn()} />)
    expect(screen.getByText('Tap ＋ to log your first transaction')).toBeInTheDocument()
  })

  it('removes a transaction on delete, shows an undo toast, and restores it on undo', () => {
    const transactions = [makeTxn({ id: 't1' })]
    const onDelete = vi.fn()

    render(
      <HomeView transactions={transactions} categories={DEFAULT_CATEGORIES} onDelete={onDelete} />,
    )

    expect(screen.getByText('Milk & Dairy')).toBeInTheDocument()

    fireEvent.click(screen.getByLabelText('Delete Milk & Dairy'))

    expect(screen.queryByText('Milk & Dairy')).not.toBeInTheDocument()
    expect(screen.getByText('Transaction deleted')).toBeInTheDocument()

    fireEvent.click(screen.getByText('Undo'))

    expect(screen.getByText('Milk & Dairy')).toBeInTheDocument()
    expect(onDelete).not.toHaveBeenCalled()
  })
})

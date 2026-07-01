import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import type { WealthEntry } from '../../data/types'
import { WealthView } from '../WealthView'

function makeEntry(overrides: Partial<WealthEntry>): WealthEntry {
  return {
    id: 'w1',
    type: 'bank',
    name: 'HDFC Savings',
    valuePaise: 5000000,
    createdAt: '2025-06-01',
    ...overrides,
  }
}

describe('WealthView', () => {
  it('shows net worth as assets minus debts', () => {
    const wealth = [
      makeEntry({ id: 'w1', type: 'bank', name: 'HDFC Savings', valuePaise: 5000000 }),
      makeEntry({ id: 'w2', type: 'gold', name: 'Gold jewellery', valuePaise: 2000000 }),
      makeEntry({ id: 'w3', type: 'cc', name: 'HDFC Card', valuePaise: 1500000 }),
    ]

    render(<WealthView wealth={wealth} onAdd={vi.fn()} onDelete={vi.fn()} />)

    // assets = ₹50,000 + ₹20,000 = ₹70,000; debts = ₹15,000; net worth = ₹55,000
    expect(screen.getByTestId('net-worth')).toHaveTextContent('₹55,000')
    expect(screen.getByTestId('total-assets')).toHaveTextContent('₹70,000')
    expect(screen.getByTestId('total-debts')).toHaveTextContent('₹15,000')
  })

  it('only shows account groups that have entries', () => {
    const wealth = [makeEntry({ id: 'w1', type: 'bank', name: 'HDFC Savings' })]
    render(<WealthView wealth={wealth} onAdd={vi.fn()} onDelete={vi.fn()} />)

    expect(screen.getByText('Bank Accounts')).toBeInTheDocument()
    expect(screen.queryByText('Fixed Deposits')).not.toBeInTheDocument()
  })
})

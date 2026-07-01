import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { DEFAULT_CATEGORIES } from '../../data/categories'
import { AddTransactionSheet } from '../AddTransactionSheet'

describe('AddTransactionSheet', () => {
  it('updates sub-category chips when a category is selected', () => {
    render(
      <AddTransactionSheet categories={DEFAULT_CATEGORIES} onSave={vi.fn()} onClose={vi.fn()} />,
    )

    expect(screen.queryByText('Vegetables & Fruits')).not.toBeInTheDocument()

    fireEvent.click(screen.getByText('Groceries'))

    expect(screen.getByText('Vegetables & Fruits')).toBeInTheDocument()
  })

  it('calls onSave with the correct Transaction object on submit', () => {
    const onSave = vi.fn()
    const onClose = vi.fn()

    render(
      <AddTransactionSheet categories={DEFAULT_CATEGORIES} onSave={onSave} onClose={onClose} />,
    )

    fireEvent.change(screen.getByLabelText('Amount'), { target: { value: '250' } })
    fireEvent.click(screen.getByText('Groceries'))
    fireEvent.click(screen.getByText('Vegetables & Fruits'))
    fireEvent.click(screen.getByText('UPI'))

    fireEvent.click(screen.getByText('Save & sync'))

    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'expense',
        categoryId: 'groceries',
        subcategory: 'Vegetables & Fruits',
        method: 'UPI',
        amountPaise: 25000,
      }),
    )
    expect(onClose).toHaveBeenCalled()
  })

  it('builds an income transaction from the source field', () => {
    const onSave = vi.fn()

    render(
      <AddTransactionSheet categories={DEFAULT_CATEGORIES} onSave={onSave} onClose={vi.fn()} />,
    )

    fireEvent.click(screen.getByText('Income'))
    fireEvent.change(screen.getByLabelText('Amount'), { target: { value: '50000' } })
    fireEvent.change(screen.getByLabelText('Income source'), { target: { value: 'Salary' } })
    fireEvent.click(screen.getByText('Save & sync'))

    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'income',
        subcategory: 'Salary',
        amountPaise: 5000000,
      }),
    )
  })

  it('disables Save & sync until the expense form is complete', () => {
    render(
      <AddTransactionSheet categories={DEFAULT_CATEGORIES} onSave={vi.fn()} onClose={vi.fn()} />,
    )

    expect(screen.getByText('Save & sync')).toBeDisabled()
  })
})

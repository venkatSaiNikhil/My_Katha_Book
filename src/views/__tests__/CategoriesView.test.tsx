import { fireEvent, render, screen, within } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { DEFAULT_CATEGORIES } from '../../data/categories'
import { CategoriesView } from '../CategoriesView'

describe('CategoriesView', () => {
  it('adding a sub-category appends it to the correct category', () => {
    const onAddSubcategory = vi.fn()

    render(
      <CategoriesView
        categories={DEFAULT_CATEGORIES}
        onAddCategory={vi.fn()}
        onDeleteCategory={vi.fn()}
        onAddSubcategory={onAddSubcategory}
        onRemoveSubcategory={vi.fn()}
      />,
    )

    const groceriesRow = screen.getByText('Groceries').closest('li') as HTMLElement

    fireEvent.click(within(groceriesRow).getByText('＋ add sub'))
    fireEvent.change(
      within(groceriesRow).getByLabelText('New sub-category for Groceries'),
      { target: { value: 'Farmers market' } },
    )
    fireEvent.click(within(groceriesRow).getByText('Add'))

    expect(onAddSubcategory).toHaveBeenCalledWith('groceries', 'Farmers market')
    expect(onAddSubcategory).toHaveBeenCalledTimes(1)
  })

  it('does not show a Delete button for default (non-custom) categories', () => {
    render(
      <CategoriesView
        categories={DEFAULT_CATEGORIES}
        onAddCategory={vi.fn()}
        onDeleteCategory={vi.fn()}
        onAddSubcategory={vi.fn()}
        onRemoveSubcategory={vi.fn()}
      />,
    )

    expect(screen.queryByText('Delete')).not.toBeInTheDocument()
  })
})

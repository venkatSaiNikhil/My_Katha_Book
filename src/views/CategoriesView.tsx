import { useState } from 'react'
import { AddCategorySheet } from '../components/AddCategorySheet'
import { BottomSheet } from '../components/BottomSheet'
import type { Category } from '../data/types'

interface CategoriesViewProps {
  categories: Category[]
  onAddCategory: (category: Category) => void
  onDeleteCategory: (categoryId: string) => void
  onAddSubcategory: (categoryId: string, subcategory: string) => void
  onRemoveSubcategory: (categoryId: string, subcategory: string) => void
}

export function CategoriesView({
  categories,
  onAddCategory,
  onDeleteCategory,
  onAddSubcategory,
  onRemoveSubcategory,
}: CategoriesViewProps) {
  const [isSheetOpen, setSheetOpen] = useState(false)
  const [addingSubFor, setAddingSubFor] = useState<string | null>(null)
  const [newSub, setNewSub] = useState('')

  const handleAddSub = (categoryId: string) => {
    const trimmed = newSub.trim()
    if (!trimmed) return
    onAddSubcategory(categoryId, trimmed)
    setNewSub('')
    setAddingSubFor(null)
  }

  return (
    <div className="px-4 py-4">
      <ul className="space-y-3">
        {categories.map((cat) => (
          <li key={cat.id} className="rounded-xl bg-card p-3 shadow-sm">
            <div className="mb-2 flex items-center justify-between">
              <span className="flex items-center gap-2 font-medium text-ink">
                <span className="text-lg">{cat.icon}</span>
                <span>{cat.label}</span>
              </span>
              {cat.isCustom && (
                <button
                  type="button"
                  onClick={() => onDeleteCategory(cat.id)}
                  className="text-xs text-rust"
                >
                  Delete
                </button>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {cat.subcategories.map((sub) => (
                <span
                  key={sub}
                  className="flex items-center gap-1 rounded-full bg-ink/5 px-2.5 py-1 text-xs text-ink/70"
                >
                  {sub}
                  <button
                    type="button"
                    aria-label={`Remove ${sub}`}
                    onClick={() => onRemoveSubcategory(cat.id, sub)}
                    className="text-ink/40 hover:text-rust"
                  >
                    ×
                  </button>
                </span>
              ))}
              {addingSubFor === cat.id ? (
                <span className="flex items-center gap-1">
                  <input
                    autoFocus
                    type="text"
                    value={newSub}
                    onChange={(e) => setNewSub(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddSub(cat.id)}
                    aria-label={`New sub-category for ${cat.label}`}
                    className="w-28 rounded-full border border-ink/10 px-2 py-1 text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => handleAddSub(cat.id)}
                    className="text-xs font-medium text-teal"
                  >
                    Add
                  </button>
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => setAddingSubFor(cat.id)}
                  className="rounded-full bg-ink/5 px-2.5 py-1 text-xs text-ink/50"
                >
                  ＋ add sub
                </button>
              )}
            </div>
          </li>
        ))}
      </ul>

      <button
        type="button"
        onClick={() => setSheetOpen(true)}
        className="mt-4 w-full rounded-full bg-ink py-3 font-medium text-card"
      >
        ＋ Add custom category
      </button>

      <BottomSheet isOpen={isSheetOpen} onClose={() => setSheetOpen(false)}>
        <AddCategorySheet
          existingLabels={categories.map((c) => c.label)}
          onSave={(category) => {
            onAddCategory(category)
            setSheetOpen(false)
          }}
          onClose={() => setSheetOpen(false)}
        />
      </BottomSheet>
    </div>
  )
}

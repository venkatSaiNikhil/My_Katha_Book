import { useState } from 'react'
import type { Category, CategoryColor } from '../data/types'

const COLORS: CategoryColor[] = ['rust', 'teal', 'amber', 'plum', 'slate']

const COLOR_SWATCH: Record<CategoryColor, string> = {
  rust: 'bg-rust',
  teal: 'bg-teal',
  amber: 'bg-amber',
  plum: 'bg-plum',
  slate: 'bg-slate',
}

interface AddCategorySheetProps {
  existingLabels: string[]
  onSave: (category: Category) => void
  onClose: () => void
}

function slugify(label: string): string {
  return label
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export function AddCategorySheet({ existingLabels, onSave, onClose }: AddCategorySheetProps) {
  const [label, setLabel] = useState('')
  const [icon, setIcon] = useState('')
  const [color, setColor] = useState<CategoryColor>('rust')
  const [subsText, setSubsText] = useState('')
  const [error, setError] = useState<string | null>(null)

  const handleSave = () => {
    const trimmedLabel = label.trim()
    if (!trimmedLabel) {
      setError('Name is required')
      return
    }

    const isDuplicate = existingLabels.some((l) => l.toLowerCase() === trimmedLabel.toLowerCase())
    if (isDuplicate) {
      setError('A category with this name already exists')
      return
    }

    const subcategories = subsText
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean)

    const category: Category = {
      id: slugify(trimmedLabel) || crypto.randomUUID(),
      label: trimmedLabel,
      icon: icon.trim() || '🏷️',
      color,
      subcategories,
      isCustom: true,
    }

    onSave(category)
  }

  return (
    <div className="flex flex-col gap-4">
      <input
        type="text"
        placeholder="Category name"
        value={label}
        onChange={(e) => setLabel(e.target.value)}
        aria-label="Category name"
        className="rounded-lg border border-ink/10 px-3 py-2"
      />

      <input
        type="text"
        placeholder="Emoji (e.g. 🐾)"
        value={icon}
        onChange={(e) => setIcon(e.target.value)}
        aria-label="Emoji"
        className="rounded-lg border border-ink/10 px-3 py-2"
      />

      <div className="flex gap-2">
        {COLORS.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setColor(c)}
            aria-label={`Color ${c}`}
            className="flex h-11 w-11 items-center justify-center"
          >
            <span
              className={`h-8 w-8 rounded-full ${COLOR_SWATCH[c]} ${
                color === c ? 'ring-2 ring-ink ring-offset-2' : ''
              }`}
            />
          </button>
        ))}
      </div>

      <textarea
        placeholder="Sub-categories, one per line"
        value={subsText}
        onChange={(e) => setSubsText(e.target.value)}
        aria-label="Sub-categories"
        rows={4}
        className="rounded-lg border border-ink/10 px-3 py-2"
      />

      {error && <p className="text-xs text-rust">{error}</p>}

      <button
        type="button"
        onClick={handleSave}
        className="rounded-full bg-ink py-3 font-medium text-card"
      >
        Save category
      </button>

      <button type="button" onClick={onClose} className="text-center text-sm text-ink/40">
        Cancel
      </button>
    </div>
  )
}

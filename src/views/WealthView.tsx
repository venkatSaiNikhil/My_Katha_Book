import { useState } from 'react'
import { AddWealthSheet } from '../components/AddWealthSheet'
import { BottomSheet } from '../components/BottomSheet'
import { formatRupee } from '../data/formatters'
import { ASSET_TYPES, DEBT_TYPES, WEALTH_TYPE_META } from '../data/wealthTypes'
import type { WealthEntry, WealthType } from '../data/types'

interface WealthViewProps {
  wealth: WealthEntry[]
  onAdd: (entry: WealthEntry) => void
  onDelete: (id: string) => void
}

export function WealthView({ wealth, onAdd, onDelete }: WealthViewProps) {
  const [isSheetOpen, setSheetOpen] = useState(false)

  const totalAssets = wealth
    .filter((w) => ASSET_TYPES.includes(w.type))
    .reduce((sum, w) => sum + w.valuePaise, 0)
  const totalDebts = wealth
    .filter((w) => DEBT_TYPES.includes(w.type))
    .reduce((sum, w) => sum + w.valuePaise, 0)
  const netWorth = totalAssets - totalDebts

  return (
    <div className="px-4 py-4">
      <div className="mb-4 rounded-xl bg-ink p-5 text-card">
        <p className="text-xs text-card/60">Total Net Worth</p>
        <p className="mt-1 text-2xl font-semibold" data-testid="net-worth">
          {formatRupee(netWorth)}
        </p>
        <div className="mt-4 flex gap-6">
          <div>
            <p className="text-xs text-card/50">Assets</p>
            <p className="font-medium text-teal" data-testid="total-assets">
              {formatRupee(totalAssets)}
            </p>
          </div>
          <div>
            <p className="text-xs text-card/50">Debt</p>
            <p className="font-medium text-rust" data-testid="total-debts">
              {formatRupee(totalDebts)}
            </p>
          </div>
        </div>
      </div>

      {ASSET_TYPES.map((type) => (
        <WealthGroup
          key={type}
          type={type}
          entries={wealth.filter((w) => w.type === type)}
          tone="teal"
          onDelete={onDelete}
        />
      ))}
      {DEBT_TYPES.map((type) => (
        <WealthGroup
          key={type}
          type={type}
          entries={wealth.filter((w) => w.type === type)}
          tone="rust"
          onDelete={onDelete}
        />
      ))}

      <button
        type="button"
        onClick={() => setSheetOpen(true)}
        className="mt-2 w-full rounded-full bg-ink py-3 font-medium text-card"
      >
        ＋ Add account / investment / loan
      </button>

      <BottomSheet isOpen={isSheetOpen} onClose={() => setSheetOpen(false)}>
        <AddWealthSheet
          onSave={(entry) => {
            onAdd(entry)
            setSheetOpen(false)
          }}
          onClose={() => setSheetOpen(false)}
        />
      </BottomSheet>
    </div>
  )
}

function WealthGroup({
  type,
  entries,
  tone,
  onDelete,
}: {
  type: WealthType
  entries: WealthEntry[]
  tone: 'teal' | 'rust'
  onDelete: (id: string) => void
}) {
  if (entries.length === 0) return null
  const meta = WEALTH_TYPE_META[type]
  const total = entries.reduce((sum, e) => sum + e.valuePaise, 0)

  return (
    <div className="mb-4">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-ink/70">{meta.label}</h3>
        <span className={`text-sm font-medium ${tone === 'teal' ? 'text-teal' : 'text-rust'}`}>
          {formatRupee(total)}
        </span>
      </div>
      <ul className="space-y-2">
        {entries.map((entry) => (
          <li key={entry.id} className="flex items-center gap-3 rounded-xl bg-card p-3 shadow-sm">
            <span
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-lg ${
                tone === 'teal' ? 'bg-teal/15 text-teal' : 'bg-rust/15 text-rust'
              }`}
            >
              {meta.icon}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium text-ink">{entry.name}</p>
              <p className="truncate text-xs text-ink/70">
                {[entry.bank, entry.interestRate ? `${entry.interestRate}%` : null, entry.maturityDate]
                  .filter(Boolean)
                  .join(' · ')}
              </p>
            </div>
            <span className={`font-semibold ${tone === 'teal' ? 'text-teal' : 'text-rust'}`}>
              {formatRupee(entry.valuePaise)}
            </span>
            <button
              type="button"
              aria-label={`Delete ${entry.name}`}
              onClick={() => onDelete(entry.id)}
              className="inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center text-ink/30 hover:text-rust"
            >
              ×
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

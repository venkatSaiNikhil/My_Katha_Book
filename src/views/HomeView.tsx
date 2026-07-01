import { useMemo, useRef, useState } from 'react'
import { formatDate, formatRupee } from '../data/formatters'
import type { Category, CategoryColor, Transaction } from '../data/types'

interface HomeViewProps {
  transactions: Transaction[]
  categories: Category[]
  onDelete: (id: string) => void
}

const COLOR_CLASSES: Record<CategoryColor, string> = {
  rust: 'bg-rust/15 text-rust',
  teal: 'bg-teal/15 text-teal',
  amber: 'bg-amber/15 text-amber',
  plum: 'bg-plum/15 text-plum',
  slate: 'bg-slate/15 text-slate',
}

function isoDateOnly(iso: string): string {
  return iso.slice(0, 10)
}

function isSameMonth(iso: string, ref: Date): boolean {
  const d = new Date(iso)
  return d.getFullYear() === ref.getFullYear() && d.getMonth() === ref.getMonth()
}

function getCategoryDisplay(txn: Transaction, categories: Category[]) {
  if (txn.type === 'income') {
    return { icon: '💰', label: 'Income', color: 'teal' as CategoryColor }
  }
  const cat = categories.find((c) => c.id === txn.categoryId)
  return {
    icon: cat?.icon ?? '🪙',
    label: cat?.label ?? 'Other',
    color: cat?.color ?? ('slate' as CategoryColor),
  }
}

export function HomeView({ transactions, categories, onDelete }: HomeViewProps) {
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null)
  const [pendingDeleteTxn, setPendingDeleteTxn] = useState<Transaction | null>(null)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const today = new Date()

  const { income, spent } = useMemo(() => {
    return transactions.reduce(
      (acc, txn) => {
        if (!isSameMonth(txn.date, today)) return acc
        if (txn.type === 'income') acc.income += txn.amountPaise
        else acc.spent += txn.amountPaise
        return acc
      },
      { income: 0, spent: 0 },
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transactions])

  const net = income - spent

  const visibleTransactions = transactions.filter((t) => t.id !== pendingDeleteId)
  const sorted = [...visibleTransactions].sort((a, b) => (a.date < b.date ? 1 : -1))

  const todayKey = isoDateOnly(today.toISOString())
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  const yesterdayKey = isoDateOnly(yesterday.toISOString())

  const groups: { key: string; label: string; items: Transaction[] }[] = []
  for (const txn of sorted) {
    const key = isoDateOnly(txn.date)
    let group = groups.find((g) => g.key === key)
    if (!group) {
      const label =
        key === todayKey ? 'Today' : key === yesterdayKey ? 'Yesterday' : formatDate(txn.date)
      group = { key, label, items: [] }
      groups.push(group)
    }
    group.items.push(txn)
  }

  const handleDelete = (txn: Transaction) => {
    setPendingDeleteId(txn.id)
    setPendingDeleteTxn(txn)
    timeoutRef.current = setTimeout(() => {
      onDelete(txn.id)
      setPendingDeleteId(null)
      setPendingDeleteTxn(null)
    }, 3000)
  }

  const handleUndo = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    setPendingDeleteId(null)
    setPendingDeleteTxn(null)
  }

  return (
    <div className="px-4 py-4">
      <div className="mb-4 grid grid-cols-3 gap-2 rounded-xl bg-card p-3 shadow-sm">
        <SummaryCell label="Income" value={income} tone="teal" />
        <SummaryCell label="Spent" value={spent} tone="rust" />
        <SummaryCell label="Net" value={net} tone={net >= 0 ? 'teal' : 'rust'} />
      </div>

      {sorted.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-16 text-center text-ink/70">
          <span className="text-4xl">🧾</span>
          <p>Tap ＋ to log your first transaction</p>
        </div>
      ) : (
        <div className="space-y-6">
          {groups.map((group) => (
            <div key={group.key}>
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink/70">
                {group.label}
              </h3>
              <ul className="space-y-2">
                {group.items.map((txn) => {
                  const display = getCategoryDisplay(txn, categories)
                  const secondary = [display.label, txn.method, txn.note]
                    .filter(Boolean)
                    .join(' · ')
                  return (
                    <li
                      key={txn.id}
                      className="flex items-center gap-3 rounded-xl bg-card p-3 shadow-sm"
                    >
                      <span
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-lg ${COLOR_CLASSES[display.color]}`}
                      >
                        {display.icon}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium text-ink">{txn.subcategory}</p>
                        <p className="truncate text-xs text-ink/70">{secondary}</p>
                      </div>
                      <span
                        className={`font-semibold ${txn.type === 'income' ? 'text-teal' : 'text-rust'}`}
                      >
                        {txn.type === 'income' ? '+' : '−'}
                        {formatRupee(txn.amountPaise)}
                      </span>
                      <button
                        type="button"
                        aria-label={`Delete ${txn.subcategory}`}
                        onClick={() => handleDelete(txn)}
                        className="inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center text-ink/30 hover:text-rust"
                      >
                        ×
                      </button>
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
        </div>
      )}

      {pendingDeleteTxn && (
        <div className="fixed bottom-24 left-1/2 z-50 flex -translate-x-1/2 items-center gap-3 rounded-full bg-ink px-4 py-2 text-sm text-card shadow-lg">
          <span>Transaction deleted</span>
          <button
            type="button"
            onClick={handleUndo}
            className="inline-flex min-h-11 items-center px-1 font-semibold underline"
          >
            Undo
          </button>
        </div>
      )}
    </div>
  )
}

function SummaryCell({
  label,
  value,
  tone,
}: {
  label: string
  value: number
  tone: 'teal' | 'rust'
}) {
  return (
    <div className="text-center">
      <p className="text-xs text-ink/70">{label}</p>
      <p className={`text-sm font-semibold ${tone === 'teal' ? 'text-teal' : 'text-rust'}`}>
        {formatRupee(value)}
      </p>
    </div>
  )
}

import { useMemo } from 'react'
import { formatRupee } from '../data/formatters'
import type { Transaction } from '../data/types'
import { filterByPeriod, topSubcategories } from '../lib/analyticsUtils'
import { calculateSuggestion } from '../lib/savingsUtils'

interface SavingsViewProps {
  transactions: Transaction[]
}

const DISCRETIONARY_CATEGORY_IDS = ['entertainment', 'shopping', 'food-dining']

export function SavingsView({ transactions }: SavingsViewProps) {
  const thisMonth = useMemo(() => filterByPeriod(transactions, 'month'), [transactions])
  const expenseCount = thisMonth.filter((t) => t.type === 'expense').length
  const hasIncome = thisMonth.some((t) => t.type === 'income')

  const income = thisMonth.filter((t) => t.type === 'income').reduce((sum, t) => sum + t.amountPaise, 0)
  const spent = thisMonth.filter((t) => t.type === 'expense').reduce((sum, t) => sum + t.amountPaise, 0)
  const net = income - spent

  const discretionaryTxns = useMemo(
    () => thisMonth.filter((t) => t.type === 'expense' && DISCRETIONARY_CATEGORY_IDS.includes(t.categoryId)),
    [thisMonth],
  )
  const topDiscretionarySubs = useMemo(() => topSubcategories(discretionaryTxns, 5), [discretionaryTxns])
  const suggestion = useMemo(() => calculateSuggestion(thisMonth), [thisMonth])

  if (!hasIncome || expenseCount < 5) {
    return (
      <div className="px-4 py-16 text-center text-ink/70">
        <p className="text-4xl">📊</p>
        <p className="mt-2">
          Log a bit more data — add your income and at least 5 expenses this month to see savings
          suggestions.
        </p>
      </div>
    )
  }

  return (
    <div className="px-4 py-4">
      <div className="mb-4 grid grid-cols-3 gap-2 rounded-xl bg-card p-3 shadow-sm">
        <SummaryCell label="Income" value={income} tone="teal" />
        <SummaryCell label="Spent" value={spent} tone="rust" />
        <SummaryCell label="Net" value={net} tone={net >= 0 ? 'teal' : 'rust'} />
      </div>

      {suggestion.discretionaryPaise === 0 ? (
        <div className="rounded-lg bg-teal/10 px-3 py-2 text-sm text-teal">
          ✅ On track — no discretionary overspend this month
        </div>
      ) : (
        <>
          <div className="mb-4 rounded-xl bg-card p-3 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-ink/70">Discretionary spend</h3>
              <span className="text-sm font-semibold text-rust">
                {formatRupee(suggestion.discretionaryPaise)}
              </span>
            </div>
            <ul className="space-y-2">
              {topDiscretionarySubs.map((s) => (
                <li key={s.subcategory}>
                  <div className="mb-1 flex items-center justify-between text-xs text-ink/70">
                    <span className="truncate">
                      {s.subcategory} <span className="text-ink/70">×{s.count}</span>
                    </span>
                    <span>{formatRupee(s.amountPaise)}</span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-ink/5">
                    <div
                      className="h-full rounded-full bg-amber"
                      style={{ width: `${Math.min(s.percent, 100)}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-xl bg-card p-4 shadow-sm">
            <p className="text-sm text-ink/70">
              Your top spends are{' '}
              {suggestion.topOffenders.map((o) => `${o.subcategory} (${formatRupee(o.amountPaise)})`).join(', ')}.
              Cutting back 30% here is realistic.
            </p>
            <div className="mt-3 rounded-lg bg-teal/10 p-3">
              <p className="text-xs text-ink/70">Potential monthly saving</p>
              <p className="text-xl font-semibold text-teal">
                {formatRupee(suggestion.potentialMonthlySavingPaise)}
              </p>
              <p className="text-xs text-ink/70">
                ≈ {formatRupee(suggestion.potentialYearlySavingPaise)} / year
              </p>
            </div>
            <p className="mt-2 text-xs text-ink/70">Redirect this to an FD or SIP to put it to work.</p>
          </div>
        </>
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

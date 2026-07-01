import { useMemo, useState } from 'react'
import { formatRupee } from '../data/formatters'
import type { Category, Transaction } from '../data/types'
import {
  filterByPeriod,
  groupByCategory,
  groupByMethod,
  topSubcategories,
  type Period,
} from '../lib/analyticsUtils'

interface AnalyticsViewProps {
  transactions: Transaction[]
  categories: Category[]
}

const PERIODS: { id: Period; label: string }[] = [
  { id: 'week', label: 'This week' },
  { id: 'month', label: 'This month' },
  { id: 'all', label: 'All time' },
]

const COLOR_BAR: Record<string, string> = {
  rust: 'bg-rust',
  teal: 'bg-teal',
  amber: 'bg-amber',
  plum: 'bg-plum',
  slate: 'bg-slate',
}

export function AnalyticsView({ transactions, categories }: AnalyticsViewProps) {
  const [period, setPeriod] = useState<Period>('month')

  const filtered = useMemo(() => filterByPeriod(transactions, period), [transactions, period])
  const categoryBreakdown = useMemo(() => groupByCategory(filtered, categories), [filtered, categories])
  const subcategoryBreakdown = useMemo(() => topSubcategories(filtered, 6), [filtered])
  const methodBreakdown = useMemo(() => groupByMethod(filtered), [filtered])

  const thisMonth = useMemo(() => filterByPeriod(transactions, 'month'), [transactions])
  const thisMonthExpenses = thisMonth.filter((t) => t.type === 'expense')
  const topCategoryThisMonth = useMemo(
    () => groupByCategory(thisMonth, categories)[0],
    [thisMonth, categories],
  )
  const entertainmentTxns = thisMonthExpenses.filter((t) => t.categoryId === 'entertainment')
  const cashTxns = thisMonthExpenses.filter((t) => t.categoryId === 'cash-atm')
  const cashTotal = cashTxns.reduce((sum, t) => sum + t.amountPaise, 0)
  const hasWarning = entertainmentTxns.length >= 3 || cashTxns.length >= 1

  return (
    <div className="px-4 py-4">
      <div className="mb-4 flex gap-2">
        {PERIODS.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => setPeriod(p.id)}
            className={`min-h-11 flex-1 rounded-full py-2 text-sm font-medium ${
              period === p.id ? 'bg-ink text-card' : 'bg-ink/5 text-ink/70'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      <BreakdownCard
        title="Category breakdown"
        rows={categoryBreakdown.map((c) => ({
          key: c.categoryId,
          label: `${c.icon} ${c.label}`,
          amountPaise: c.amountPaise,
          percent: c.percent,
          barClass: COLOR_BAR[c.color],
        }))}
      />

      <BreakdownCard
        title="Top sub-categories"
        rows={subcategoryBreakdown.map((s) => ({
          key: s.subcategory,
          label: s.subcategory,
          amountPaise: s.amountPaise,
          percent: s.percent,
          barClass: 'bg-amber',
        }))}
      />

      <BreakdownCard
        title="Payment methods"
        rows={methodBreakdown.map((m) => ({
          key: m.method,
          label: m.method,
          amountPaise: m.amountPaise,
          percent: m.percent,
          barClass: 'bg-ink',
        }))}
      />

      <div className="space-y-2">
        {topCategoryThisMonth && (
          <InsightBanner
            text={`${topCategoryThisMonth.icon} ${topCategoryThisMonth.label} is your biggest spend — ${formatRupee(
              topCategoryThisMonth.amountPaise,
            )} (${Math.round(topCategoryThisMonth.percent)}%)`}
          />
        )}
        {entertainmentTxns.length >= 3 && (
          <InsightBanner
            text={`⚠️ ${entertainmentTxns.length} entertainment transactions totalling ${formatRupee(
              entertainmentTxns.reduce((sum, t) => sum + t.amountPaise, 0),
            )}`}
          />
        )}
        {cashTxns.length >= 1 && (
          <InsightBanner
            text={`💵 ${formatRupee(cashTotal)} in ATM/cash — log where it went for better tracking`}
          />
        )}
        {!hasWarning && <InsightBanner text="✅ No major overspend this month" />}
      </div>
    </div>
  )
}

function BreakdownCard({
  title,
  rows,
}: {
  title: string
  rows: { key: string; label: string; amountPaise: number; percent: number; barClass: string }[]
}) {
  if (rows.length === 0) return null

  return (
    <div className="mb-4 rounded-xl bg-card p-3 shadow-sm">
      <h3 className="mb-3 text-sm font-semibold text-ink/70">{title}</h3>
      <ul className="space-y-2">
        {rows.map((row) => (
          <li key={row.key}>
            <div className="mb-1 flex items-center justify-between text-xs text-ink/70">
              <span className="truncate">{row.label}</span>
              <span>
                {formatRupee(row.amountPaise)} · {Math.round(row.percent)}%
              </span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-ink/5">
              <div
                className={`h-full rounded-full ${row.barClass}`}
                style={{ width: `${Math.min(row.percent, 100)}%` }}
              />
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

function InsightBanner({ text }: { text: string }) {
  return <div className="mb-2 rounded-lg bg-ink/5 px-3 py-2 text-sm text-ink/80">{text}</div>
}

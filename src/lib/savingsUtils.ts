import type { Transaction } from '../data/types'

const DISCRETIONARY_CATEGORY_IDS = ['entertainment', 'shopping', 'food-dining']

function roundToNearestHundredRupees(paise: number): number {
  return Math.round(paise / 10000) * 10000
}

export interface TopOffender {
  subcategory: string
  amountPaise: number
}

export interface SavingsSuggestion {
  discretionaryPaise: number
  topOffenders: TopOffender[]
  suggestedCutPaise: number
  potentialMonthlySavingPaise: number
  potentialYearlySavingPaise: number
}

export function calculateSuggestion(transactions: Transaction[]): SavingsSuggestion {
  const discretionary = transactions.filter(
    (t) => t.type === 'expense' && DISCRETIONARY_CATEGORY_IDS.includes(t.categoryId),
  )

  const discretionaryPaise = discretionary.reduce((sum, t) => sum + t.amountPaise, 0)

  const bySubcategory = new Map<string, number>()
  for (const txn of discretionary) {
    bySubcategory.set(txn.subcategory, (bySubcategory.get(txn.subcategory) ?? 0) + txn.amountPaise)
  }

  const topOffenders = [...bySubcategory.entries()]
    .map(([subcategory, amountPaise]) => ({ subcategory, amountPaise }))
    .sort((a, b) => b.amountPaise - a.amountPaise)
    .slice(0, 3)

  const suggestedCutPaise = roundToNearestHundredRupees(discretionaryPaise * 0.3)

  return {
    discretionaryPaise,
    topOffenders,
    suggestedCutPaise,
    potentialMonthlySavingPaise: suggestedCutPaise,
    potentialYearlySavingPaise: suggestedCutPaise * 12,
  }
}

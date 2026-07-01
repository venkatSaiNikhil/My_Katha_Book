import { useCallback, useEffect, useState } from 'react'
import { useStorage } from '../data/storage'
import type { AppState, Category, Transaction, WealthEntry } from '../data/types'

export function useAppState() {
  const { load, save } = useStorage()
  const [state, setState] = useState<AppState>(() => load())

  useEffect(() => {
    save(state)
  }, [state, save])

  const addTransaction = useCallback((txn: Transaction) => {
    setState((prev) => ({ ...prev, transactions: [txn, ...prev.transactions] }))
  }, [])

  const deleteTransaction = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      transactions: prev.transactions.filter((t) => t.id !== id),
    }))
  }, [])

  const addWealth = useCallback((entry: WealthEntry) => {
    setState((prev) => ({ ...prev, wealth: [entry, ...prev.wealth] }))
  }, [])

  const deleteWealth = useCallback((id: string) => {
    setState((prev) => ({ ...prev, wealth: prev.wealth.filter((w) => w.id !== id) }))
  }, [])

  const addCategory = useCallback((category: Category) => {
    setState((prev) => ({ ...prev, categories: [...prev.categories, category] }))
  }, [])

  const deleteCategory = useCallback((categoryId: string) => {
    setState((prev) => ({
      ...prev,
      categories: prev.categories.filter((c) => c.id !== categoryId),
    }))
  }, [])

  const addSubcategory = useCallback((categoryId: string, subcategory: string) => {
    setState((prev) => ({
      ...prev,
      categories: prev.categories.map((c) =>
        c.id === categoryId && !c.subcategories.includes(subcategory)
          ? { ...c, subcategories: [...c.subcategories, subcategory] }
          : c,
      ),
    }))
  }, [])

  const removeSubcategory = useCallback((categoryId: string, subcategory: string) => {
    setState((prev) => ({
      ...prev,
      categories: prev.categories.map((c) =>
        c.id === categoryId
          ? { ...c, subcategories: c.subcategories.filter((s) => s !== subcategory) }
          : c,
      ),
    }))
  }, [])

  return {
    state,
    addTransaction,
    deleteTransaction,
    addWealth,
    deleteWealth,
    addCategory,
    deleteCategory,
    addSubcategory,
    removeSubcategory,
  }
}

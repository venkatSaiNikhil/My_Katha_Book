import { useCallback, useEffect, useState } from 'react'
import { useStorage } from '../data/storage'
import type { AppState, Transaction } from '../data/types'

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

  return { state, addTransaction, deleteTransaction }
}

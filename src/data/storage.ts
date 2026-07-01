import { DEFAULT_CATEGORIES } from './categories'
import type { AppState, Category, Transaction, User, WealthEntry } from './types'

export const SCHEMA_VERSION = 1

export const STORAGE_KEYS = {
  version: 'khata_v1_version',
  txns: 'khata_v1_txns',
  cats: 'khata_v1_cats',
  wealth: 'khata_v1_wealth',
  user: 'khata_v1_user',
  drive: 'khata_v1_drive',
} as const

function migrate(storedVersion: number): void {
  // No migrations exist yet — schema version 1 is the baseline.
  if (storedVersion === SCHEMA_VERSION) return
}

function readJSON<T>(key: string, fallback: T): T {
  const raw = localStorage.getItem(key)
  if (!raw) return fallback
  try {
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

function load(): AppState {
  const storedVersion = Number(localStorage.getItem(STORAGE_KEYS.version) ?? SCHEMA_VERSION)
  if (storedVersion !== SCHEMA_VERSION) {
    migrate(storedVersion)
  }

  const transactions = readJSON<Transaction[]>(STORAGE_KEYS.txns, [])
  const categories = readJSON<Category[]>(STORAGE_KEYS.cats, DEFAULT_CATEGORIES)
  const wealth = readJSON<WealthEntry[]>(STORAGE_KEYS.wealth, [])
  const user = readJSON<User | null>(STORAGE_KEYS.user, null)
  const driveFileIds = readJSON<AppState['driveFileIds']>(STORAGE_KEYS.drive, {
    txn: null,
    wealth: null,
  })

  return { transactions, categories, wealth, user, driveFileIds }
}

function save(state: AppState): void {
  localStorage.setItem(STORAGE_KEYS.version, String(SCHEMA_VERSION))
  localStorage.setItem(STORAGE_KEYS.txns, JSON.stringify(state.transactions))
  localStorage.setItem(STORAGE_KEYS.cats, JSON.stringify(state.categories))
  localStorage.setItem(STORAGE_KEYS.wealth, JSON.stringify(state.wealth))
  localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(state.user))
  localStorage.setItem(STORAGE_KEYS.drive, JSON.stringify(state.driveFileIds))
}

function clear(): void {
  Object.values(STORAGE_KEYS).forEach((key) => localStorage.removeItem(key))
}

export function useStorage() {
  return { load, save, clear }
}

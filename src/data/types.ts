export type TransactionType = 'expense' | 'income'

export type PaymentMethod =
  | 'UPI'
  | 'Cash'
  | 'Credit card'
  | 'Debit card'
  | 'Net banking'
  | 'Cheque'

export interface Transaction {
  id: string
  date: string
  type: TransactionType
  categoryId: string
  subcategory: string
  method: PaymentMethod
  amountPaise: number
  note: string
  createdAt: string
}

export type CategoryColor = 'rust' | 'teal' | 'amber' | 'plum' | 'slate'

export interface Category {
  id: string
  label: string
  icon: string
  color: CategoryColor
  subcategories: string[]
  isCustom?: boolean
}

export type WealthType =
  | 'bank'
  | 'fd'
  | 'ppf'
  | 'epf'
  | 'mf'
  | 'stocks'
  | 'gold'
  | 'property'
  | 'crypto'
  | 'cash'
  | 'nsc'
  | 'other_asset'
  | 'home_loan'
  | 'car_loan'
  | 'personal_loan'
  | 'edu_loan'
  | 'cc'
  | 'bnpl'
  | 'other_debt'

export interface WealthEntry {
  id: string
  type: WealthType
  name: string
  valuePaise: number
  bank?: string
  interestRate?: number
  emi?: number
  maturityDate?: string
  dueDate?: string
  creditLimit?: number
  grams?: number
  uanNumber?: string
  createdAt: string
}

export interface User {
  name: string
  email: string
  picture?: string
  clientId: string
}

export interface AppState {
  transactions: Transaction[]
  categories: Category[]
  wealth: WealthEntry[]
  user: User | null
  driveFileIds: {
    txn: string | null
    wealth: string | null
  }
}

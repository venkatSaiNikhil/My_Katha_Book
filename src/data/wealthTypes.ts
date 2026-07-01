import type { WealthType } from './types'

export interface WealthTypeMeta {
  label: string
  icon: string
  group: 'asset' | 'debt'
}

export const ASSET_TYPES: WealthType[] = [
  'bank',
  'fd',
  'ppf',
  'epf',
  'mf',
  'stocks',
  'gold',
  'property',
  'crypto',
  'cash',
  'nsc',
  'other_asset',
]

export const DEBT_TYPES: WealthType[] = [
  'home_loan',
  'car_loan',
  'personal_loan',
  'edu_loan',
  'cc',
  'bnpl',
  'other_debt',
]

export const WEALTH_TYPE_META: Record<WealthType, WealthTypeMeta> = {
  bank: { label: 'Bank Accounts', icon: '🏦', group: 'asset' },
  fd: { label: 'Fixed Deposits', icon: '💰', group: 'asset' },
  ppf: { label: 'PPF', icon: '🏛️', group: 'asset' },
  epf: { label: 'EPF', icon: '🏢', group: 'asset' },
  mf: { label: 'Mutual Funds', icon: '📈', group: 'asset' },
  stocks: { label: 'Stocks', icon: '📊', group: 'asset' },
  gold: { label: 'Gold', icon: '🪙', group: 'asset' },
  property: { label: 'Property', icon: '🏡', group: 'asset' },
  crypto: { label: 'Crypto', icon: '₿', group: 'asset' },
  cash: { label: 'Cash', icon: '💵', group: 'asset' },
  nsc: { label: 'NSC', icon: '📜', group: 'asset' },
  other_asset: { label: 'Other Assets', icon: '🪙', group: 'asset' },
  home_loan: { label: 'Home Loan', icon: '🏠', group: 'debt' },
  car_loan: { label: 'Vehicle Loan', icon: '🚗', group: 'debt' },
  personal_loan: { label: 'Personal Loan', icon: '💳', group: 'debt' },
  edu_loan: { label: 'Education Loan', icon: '🎓', group: 'debt' },
  cc: { label: 'Credit Card', icon: '💳', group: 'debt' },
  bnpl: { label: 'Buy Now Pay Later', icon: '🛍️', group: 'debt' },
  other_debt: { label: 'Other Debt', icon: '📉', group: 'debt' },
}

import { useState } from 'react'
import { ASSET_TYPES, DEBT_TYPES, WEALTH_TYPE_META } from '../data/wealthTypes'
import type { WealthEntry, WealthType } from '../data/types'

const PLACEHOLDER: Record<WealthType, string> = {
  bank: 'HDFC Savings',
  fd: 'SBI FD - 1yr',
  ppf: 'PPF Account',
  epf: 'EPF Account',
  mf: 'Axis Bluechip Fund',
  stocks: 'Zerodha Demat',
  gold: 'Gold jewellery',
  property: 'Flat in Hyderabad',
  crypto: 'Bitcoin wallet',
  cash: 'Cash at home',
  nsc: 'NSC Certificate',
  other_asset: 'Other asset',
  home_loan: 'Home loan - HDFC',
  car_loan: 'Car loan',
  personal_loan: 'Personal loan',
  edu_loan: 'Education loan',
  cc: 'HDFC Credit Card',
  bnpl: 'Simpl / LazyPay',
  other_debt: 'Other debt',
}

const INSTITUTION_LABEL: Partial<Record<WealthType, string>> = {
  bank: 'Bank name',
  fd: 'Bank name',
  ppf: 'Bank / Post office',
  nsc: 'Bank / Post office',
  mf: 'Fund house',
  stocks: 'Broker name',
  cc: 'Bank name',
  home_loan: 'Bank name',
  car_loan: 'Bank name',
  personal_loan: 'Bank name',
  edu_loan: 'Bank name',
}

interface AddWealthSheetProps {
  onSave: (entry: WealthEntry) => void
  onClose: () => void
}

export function AddWealthSheet({ onSave, onClose }: AddWealthSheetProps) {
  const [type, setType] = useState<WealthType>('bank')
  const [name, setName] = useState('')
  const [value, setValue] = useState('')
  const [institution, setInstitution] = useState('')
  const [interestRate, setInterestRate] = useState('')
  const [maturityDate, setMaturityDate] = useState('')
  const [uanNumber, setUanNumber] = useState('')
  const [emi, setEmi] = useState('')
  const [creditLimit, setCreditLimit] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [grams, setGrams] = useState('')

  const isLoan = type.endsWith('_loan')
  const isValid = name.trim().length > 0 && Number(value) > 0

  const handleSave = () => {
    if (!isValid) return

    const entry: WealthEntry = {
      id: crypto.randomUUID(),
      type,
      name: name.trim(),
      valuePaise: Math.round(Number(value) * 100),
      createdAt: new Date().toISOString(),
      ...(institution ? { bank: institution } : {}),
      ...(interestRate ? { interestRate: Number(interestRate) } : {}),
      ...(maturityDate ? { maturityDate } : {}),
      ...(uanNumber ? { uanNumber } : {}),
      ...(emi ? { emi: Math.round(Number(emi) * 100) } : {}),
      ...(creditLimit ? { creditLimit: Math.round(Number(creditLimit) * 100) } : {}),
      ...(dueDate ? { dueDate } : {}),
      ...(grams ? { grams: Number(grams) } : {}),
    }

    onSave(entry)
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-ink/70">Assets</p>
        <div className="flex flex-wrap gap-2">
          {ASSET_TYPES.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setType(t)}
              className={`inline-flex min-h-11 items-center rounded-full px-3 text-sm ${
                type === t ? 'bg-teal text-card' : 'bg-ink/5 text-ink/70'
              }`}
            >
              {WEALTH_TYPE_META[t].icon} {WEALTH_TYPE_META[t].label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-ink/70">Debt</p>
        <div className="flex flex-wrap gap-2">
          {DEBT_TYPES.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setType(t)}
              className={`inline-flex min-h-11 items-center rounded-full px-3 text-sm ${
                type === t ? 'bg-rust text-card' : 'bg-ink/5 text-ink/70'
              }`}
            >
              {WEALTH_TYPE_META[t].icon} {WEALTH_TYPE_META[t].label}
            </button>
          ))}
        </div>
      </div>

      <input
        type="text"
        placeholder={PLACEHOLDER[type]}
        value={name}
        onChange={(e) => setName(e.target.value)}
        aria-label="Name"
        className="rounded-lg border border-ink/10 px-3 py-2"
      />

      <label className="flex items-center gap-2 rounded-lg border border-ink/10 px-3 py-2">
        <span className="text-ink/70">₹</span>
        <input
          type="text"
          inputMode="decimal"
          placeholder={isLoan || type === 'cc' || type === 'bnpl' ? 'Outstanding amount' : 'Balance'}
          value={value}
          onChange={(e) => setValue(e.target.value.replace(/[^0-9.]/g, ''))}
          aria-label="Value"
          className="w-full bg-transparent outline-none"
        />
      </label>

      {INSTITUTION_LABEL[type] && (
        <input
          type="text"
          placeholder={INSTITUTION_LABEL[type]}
          value={institution}
          onChange={(e) => setInstitution(e.target.value)}
          aria-label={INSTITUTION_LABEL[type]}
          className="rounded-lg border border-ink/10 px-3 py-2"
        />
      )}

      {(type === 'fd' || type === 'ppf' || type === 'nsc' || isLoan) && (
        <input
          type="text"
          inputMode="decimal"
          placeholder="Interest rate %"
          value={interestRate}
          onChange={(e) => setInterestRate(e.target.value)}
          aria-label="Interest rate"
          className="rounded-lg border border-ink/10 px-3 py-2"
        />
      )}

      {(type === 'fd' || type === 'ppf' || type === 'nsc') && (
        <input
          type="date"
          value={maturityDate}
          onChange={(e) => setMaturityDate(e.target.value)}
          aria-label="Maturity date"
          className="rounded-lg border border-ink/10 px-3 py-2"
        />
      )}

      {type === 'epf' && (
        <input
          type="text"
          placeholder="UAN number"
          value={uanNumber}
          onChange={(e) => setUanNumber(e.target.value)}
          aria-label="UAN number"
          className="rounded-lg border border-ink/10 px-3 py-2"
        />
      )}

      {type === 'gold' && (
        <input
          type="text"
          inputMode="decimal"
          placeholder="Weight (grams)"
          value={grams}
          onChange={(e) => setGrams(e.target.value)}
          aria-label="Weight in grams"
          className="rounded-lg border border-ink/10 px-3 py-2"
        />
      )}

      {isLoan && (
        <input
          type="text"
          inputMode="decimal"
          placeholder="EMI amount"
          value={emi}
          onChange={(e) => setEmi(e.target.value)}
          aria-label="EMI amount"
          className="rounded-lg border border-ink/10 px-3 py-2"
        />
      )}

      {type === 'cc' && (
        <>
          <input
            type="text"
            inputMode="decimal"
            placeholder="Credit limit"
            value={creditLimit}
            onChange={(e) => setCreditLimit(e.target.value)}
            aria-label="Credit limit"
            className="rounded-lg border border-ink/10 px-3 py-2"
          />
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            aria-label="Due date"
            className="rounded-lg border border-ink/10 px-3 py-2"
          />
        </>
      )}

      {type === 'bnpl' && (
        <input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          aria-label="Due date"
          className="rounded-lg border border-ink/10 px-3 py-2"
        />
      )}

      <button
        type="button"
        onClick={handleSave}
        disabled={!isValid}
        className="rounded-full bg-ink py-3 font-medium text-card disabled:opacity-40"
      >
        Save
      </button>

      <button type="button" onClick={onClose} className="text-center text-sm text-ink/70">
        Cancel
      </button>
    </div>
  )
}

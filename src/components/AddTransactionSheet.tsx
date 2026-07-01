import { useMemo, useState } from 'react'
import type { Category, PaymentMethod, Transaction, TransactionType } from '../data/types'

const PAYMENT_METHODS: PaymentMethod[] = [
  'UPI',
  'Cash',
  'Credit card',
  'Debit card',
  'Net banking',
  'Cheque',
]

interface AddTransactionSheetProps {
  categories: Category[]
  onSave: (txn: Transaction) => void
  onClose: () => void
}

function todayISO(): string {
  return new Date().toISOString().slice(0, 10)
}

export function AddTransactionSheet({ categories, onSave, onClose }: AddTransactionSheetProps) {
  const [type, setType] = useState<TransactionType>('expense')
  const [amount, setAmount] = useState('')
  const [categoryId, setCategoryId] = useState<string | null>(null)
  const [subcategory, setSubcategory] = useState<string | null>(null)
  const [method, setMethod] = useState<PaymentMethod | null>(null)
  const [source, setSource] = useState('')
  const [date, setDate] = useState(todayISO())
  const [note, setNote] = useState('')

  const selectedCategory = useMemo(
    () => categories.find((c) => c.id === categoryId) ?? null,
    [categories, categoryId],
  )

  const handleSelectCategory = (cat: Category) => {
    setCategoryId(cat.id)
    setSubcategory(null)
  }

  const isValid =
    Number(amount) > 0 &&
    (type === 'income' ? source.trim().length > 0 : Boolean(categoryId && subcategory && method))

  const handleSave = () => {
    if (!isValid) return

    const amountPaise = Math.round(Number(amount) * 100)

    const txn: Transaction = {
      id: crypto.randomUUID(),
      date,
      type,
      categoryId: type === 'income' ? 'income' : (categoryId as string),
      subcategory: type === 'income' ? source.trim() : (subcategory as string),
      method: type === 'income' ? 'Net banking' : (method as PaymentMethod),
      amountPaise,
      note,
      createdAt: new Date().toISOString(),
    }

    onSave(txn)
    onClose()
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => setType('expense')}
          className={`min-h-11 rounded-lg py-2 font-medium ${
            type === 'expense' ? 'bg-rust text-card' : 'bg-ink/5 text-ink/60'
          }`}
        >
          Expense
        </button>
        <button
          type="button"
          onClick={() => setType('income')}
          className={`min-h-11 rounded-lg py-2 font-medium ${
            type === 'income' ? 'bg-teal text-card' : 'bg-ink/5 text-ink/60'
          }`}
        >
          Income
        </button>
      </div>

      <label className="flex items-center gap-2 rounded-lg border border-ink/10 px-3 py-2">
        <span className="text-xl text-ink/40">₹</span>
        <input
          type="text"
          inputMode="decimal"
          placeholder="0"
          value={amount}
          onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ''))}
          className="w-full bg-transparent text-2xl font-semibold outline-none"
          aria-label="Amount"
        />
      </label>

      {type === 'expense' ? (
        <>
          <div className="grid grid-cols-3 gap-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => handleSelectCategory(cat)}
                className={`flex flex-col items-center gap-1 rounded-lg p-2 text-xs ${
                  categoryId === cat.id
                    ? 'bg-rust/15 text-rust ring-1 ring-rust'
                    : 'bg-ink/5 text-ink/70'
                }`}
              >
                <span className="text-xl">{cat.icon}</span>
                <span className="text-center leading-tight">{cat.label}</span>
              </button>
            ))}
          </div>

          {selectedCategory && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {selectedCategory.subcategories.map((sub) => (
                <button
                  key={sub}
                  type="button"
                  onClick={() => setSubcategory(sub)}
                  className={`inline-flex min-h-11 shrink-0 items-center rounded-full px-3 text-sm ${
                    subcategory === sub
                      ? 'bg-amber/20 text-amber ring-1 ring-amber'
                      : 'bg-ink/5 text-ink/70'
                  }`}
                >
                  {sub}
                </button>
              ))}
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            {PAYMENT_METHODS.map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMethod(m)}
                className={`inline-flex min-h-11 items-center rounded-full px-3 text-sm ${
                  method === m ? 'bg-ink text-card' : 'bg-ink/5 text-ink/70'
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </>
      ) : (
        <input
          type="text"
          placeholder="Salary, Freelance…"
          value={source}
          onChange={(e) => setSource(e.target.value)}
          className="rounded-lg border border-ink/10 px-3 py-2"
          aria-label="Income source"
        />
      )}

      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        className="rounded-lg border border-ink/10 px-3 py-2"
        aria-label="Date"
      />

      <input
        type="text"
        placeholder="Note (optional)"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        className="rounded-lg border border-ink/10 px-3 py-2"
        aria-label="Note"
      />

      <button
        type="button"
        onClick={handleSave}
        disabled={!isValid}
        className="rounded-full bg-ink py-3 font-medium text-card disabled:opacity-40"
      >
        Save & sync
      </button>
    </div>
  )
}

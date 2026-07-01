import { DEFAULT_CATEGORIES } from './categories'
import type { Category, PaymentMethod, Transaction, TransactionType } from './types'

const HEADER = 'ID,Date,Type,Category,Subcategory,Method,Amount,Note'

function escapeField(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

function parseCSVLine(line: string): string[] {
  const fields: string[] = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const char = line[i]

    if (inQuotes) {
      if (char === '"') {
        if (line[i + 1] === '"') {
          current += '"'
          i++
        } else {
          inQuotes = false
        }
      } else {
        current += char
      }
    } else if (char === '"') {
      inQuotes = true
    } else if (char === ',') {
      fields.push(current)
      current = ''
    } else {
      current += char
    }
  }
  fields.push(current)
  return fields
}

export function transactionsToCSV(txns: Transaction[], cats: Category[]): string {
  const catLabelById = new Map(cats.map((c) => [c.id, c.label]))

  const rows = txns.map((txn) => {
    const categoryLabel = catLabelById.get(txn.categoryId) ?? txn.categoryId
    return [
      txn.id,
      txn.date,
      txn.type,
      categoryLabel,
      txn.subcategory,
      txn.method,
      String(txn.amountPaise),
      txn.note,
    ]
      .map((field) => escapeField(field))
      .join(',')
  })

  return [HEADER, ...rows].join('\n')
}

export function csvToTransactions(csv: string, cats: Category[] = DEFAULT_CATEGORIES): Transaction[] {
  const lines = csv.split(/\r?\n/).filter((line) => line.length > 0)
  if (lines.length === 0) return []

  const [, ...dataLines] = lines
  const catIdByLabel = new Map(cats.map((c) => [c.label, c.id]))

  return dataLines.map((line) => {
    const [id, date, type, category, subcategory, method, amount, note] = parseCSVLine(line)

    const txn: Transaction = {
      id,
      date,
      type: type as TransactionType,
      categoryId: catIdByLabel.get(category) ?? category,
      subcategory,
      method: method as PaymentMethod,
      amountPaise: Number(amount),
      note: note ?? '',
      createdAt: date,
    }

    return txn
  })
}

const rupeeFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
})

export function paiToRupee(paise: number): number {
  return paise / 100
}

export function rupeeToPaise(rupees: number): number {
  return Math.round(rupees * 100)
}

export function formatRupee(paise: number): string {
  return rupeeFormatter.format(paiToRupee(paise))
}

export function formatRupeeCompact(paise: number): string {
  const rupees = paiToRupee(paise)
  const abs = Math.abs(rupees)
  const sign = rupees < 0 ? '-' : ''

  if (abs >= 10000000) {
    return `${sign}₹${trimZero(abs / 10000000)}Cr`
  }
  if (abs >= 100000) {
    return `${sign}₹${trimZero(abs / 100000)}L`
  }
  if (abs >= 1000) {
    return `${sign}₹${trimZero(abs / 1000)}K`
  }
  return `${sign}₹${Math.round(abs)}`
}

function trimZero(value: number): string {
  return value.toFixed(1).replace(/\.0$/, '')
}

export function formatDate(iso: string): string {
  const date = new Date(iso)
  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export function relativeDate(iso: string): string {
  const date = new Date(iso)
  const today = new Date()

  const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate())

  const diffDays = Math.round(
    (startOfDay(today).getTime() - startOfDay(date).getTime()) / (1000 * 60 * 60 * 24),
  )

  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays > 1 && diffDays < 7) return `${diffDays} days ago`
  return formatDate(iso)
}

import type { ReactNode } from 'react'

interface BottomSheetProps {
  isOpen: boolean
  onClose: () => void
  children: ReactNode
}

export function BottomSheet({ isOpen, onClose, children }: BottomSheetProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div className="absolute inset-0 bg-ink/40" onClick={onClose} aria-hidden="true" />
      <div className="relative max-h-[90vh] w-full max-w-[560px] animate-slide-up overflow-y-auto rounded-t-2xl bg-card p-4 pb-8">
        <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-ink/20" />
        {children}
      </div>
    </div>
  )
}

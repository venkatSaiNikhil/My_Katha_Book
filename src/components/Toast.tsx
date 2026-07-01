interface ToastProps {
  message: string
  actionLabel?: string
  onAction?: () => void
}

export function Toast({ message, actionLabel, onAction }: ToastProps) {
  return (
    <div className="fixed bottom-24 left-1/2 z-50 flex -translate-x-1/2 items-center gap-3 rounded-full bg-ink px-4 py-2 text-sm text-card shadow-lg">
      <span>{message}</span>
      {actionLabel && onAction && (
        <button type="button" onClick={onAction} className="font-semibold underline">
          {actionLabel}
        </button>
      )}
    </div>
  )
}

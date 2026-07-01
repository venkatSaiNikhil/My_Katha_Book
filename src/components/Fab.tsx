interface FabProps {
  onClick: () => void
}

export function Fab({ onClick }: FabProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="fixed bottom-6 left-1/2 z-40 flex -translate-x-1/2 items-center gap-2 rounded-full bg-ink px-6 py-3 text-card shadow-lg"
    >
      <span className="text-lg leading-none">＋</span>
      <span className="font-medium">Add transaction</span>
    </button>
  )
}

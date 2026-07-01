import type { User } from '../data/types'

interface TopBarProps {
  user: User | null
}

export function TopBar({ user }: TopBarProps) {
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between border-b border-ink/10 bg-card px-4 py-3">
      <div className="text-lg font-semibold text-ink">
        Khata<span className="text-rust">.</span>
      </div>
      <div className="flex items-center gap-3">
        <span className="flex items-center gap-1.5 rounded-full bg-ink/5 px-2.5 py-1 text-xs text-ink/60">
          <span className="h-1.5 w-1.5 rounded-full bg-ink/30" />
          Not synced
        </span>
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-ink/10 text-sm">
          {user ? user.name.charAt(0).toUpperCase() : '👤'}
        </div>
      </div>
    </header>
  )
}

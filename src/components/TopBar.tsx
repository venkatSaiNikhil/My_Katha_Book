import type { User } from '../data/types'
import { SyncStatus, type SyncStatusState } from './SyncStatus'

interface TopBarProps {
  user: User | null
  syncStatus: SyncStatusState
  onSyncClick: () => void
  onSignOut?: () => void
}

export function TopBar({ user, syncStatus, onSyncClick, onSignOut }: TopBarProps) {
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between border-b border-ink/10 bg-card px-4 py-3">
      <div className="text-lg font-semibold text-ink">
        Khata<span className="text-rust">.</span>
      </div>
      <div className="flex items-center gap-3">
        <SyncStatus status={syncStatus} onClick={onSyncClick} />
        {user ? (
          <button
            type="button"
            onClick={onSignOut}
            aria-label="Sign out"
            title={user.email}
            className="flex h-11 w-11 items-center justify-center"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-ink/10 text-sm font-medium text-ink/70">
              {user.name.charAt(0).toUpperCase()}
            </span>
          </button>
        ) : (
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-ink/10 text-sm">👤</div>
        )}
      </div>
    </header>
  )
}

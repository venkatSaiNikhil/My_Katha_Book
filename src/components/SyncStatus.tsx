export type SyncStatusState = 'idle' | 'syncing' | 'ok' | 'error'

const CONFIG: Record<SyncStatusState, { label: string; dot: string; pulse?: boolean }> = {
  idle: { label: 'Not synced', dot: 'bg-ink/30' },
  syncing: { label: 'Syncing…', dot: 'bg-amber', pulse: true },
  ok: { label: 'Drive synced', dot: 'bg-teal' },
  error: { label: 'Sync failed', dot: 'bg-rust' },
}

interface SyncStatusProps {
  status: SyncStatusState
  onClick?: () => void
}

export function SyncStatus({ status, onClick }: SyncStatusProps) {
  const config = CONFIG[status]

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-1.5 rounded-full bg-ink/5 px-2.5 py-1 text-xs text-ink/60"
    >
      <span className={`h-1.5 w-1.5 rounded-full ${config.dot} ${config.pulse ? 'animate-pulse' : ''}`} />
      {config.label}
    </button>
  )
}

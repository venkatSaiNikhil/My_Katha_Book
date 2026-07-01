import { useEffect, useState } from 'react'
import type { User } from '../data/types'
import { initAuth } from '../lib/googleAuth'

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID

interface LoginViewProps {
  onSignedIn: (user: User) => void
  onTokenReady: () => void
  onSkip: () => void
}

export function LoginView({ onSignedIn, onTokenReady, onSkip }: LoginViewProps) {
  const [error, setError] = useState<string | null>(null)
  const [isConnecting, setConnecting] = useState(false)

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return

    setConnecting(true)
    initAuth(GOOGLE_CLIENT_ID, {
      onUser: (user) => onSignedIn({ ...user, clientId: GOOGLE_CLIENT_ID }),
      onTokenReady,
    })
      .catch(() => setError('Could not load Google Sign-In. Check your connection and try again.'))
      .finally(() => setConnecting(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-paper px-6 py-10">
      <div className="mb-8 text-center">
        <p className="text-4xl">📒</p>
        <h1 className="mt-2 text-2xl font-semibold text-ink">
          Khata<span className="text-rust">.</span>
        </h1>
        <p className="mt-1 text-sm text-ink/50">
          Your personal finance ledger. Private, offline-first.
        </p>
      </div>

      <div className="w-full max-w-sm rounded-2xl bg-card p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-ink">Sign in to continue</h2>
        <p className="mt-1 text-sm text-ink/50">
          Your data lives in your own Google Drive — not our servers.
        </p>

        {GOOGLE_CLIENT_ID ? (
          <>
            <div id="gsi-btn" className="mt-5 flex justify-center" />
            {isConnecting && <p className="mt-2 text-center text-xs text-ink/40">Connecting…</p>}
            {error && <p className="mt-2 text-center text-xs text-rust">{error}</p>}
          </>
        ) : (
          <p className="mt-5 rounded-lg bg-rust/10 px-3 py-2 text-xs text-rust">
            Google Sign-In isn't configured for this deployment yet. Set VITE_GOOGLE_CLIENT_ID and
            rebuild — see the README for setup steps.
          </p>
        )}

        <button type="button" onClick={onSkip} className="mt-4 w-full text-center text-xs text-ink/40">
          Skip for now — use offline
        </button>
      </div>
    </div>
  )
}

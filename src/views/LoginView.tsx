import { useEffect, useState } from 'react'
import type { User } from '../data/types'
import { initAuth } from '../lib/googleAuth'

const CLIENT_ID_KEY = 'khata_v1_client_id'

interface LoginViewProps {
  onSignedIn: (user: User) => void
  onTokenReady: () => void
  onSkip: () => void
}

export function LoginView({ onSignedIn, onTokenReady, onSkip }: LoginViewProps) {
  const [clientId, setClientId] = useState(() => localStorage.getItem(CLIENT_ID_KEY) ?? '')
  const [isGuideOpen, setGuideOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isConnecting, setConnecting] = useState(false)

  const handleContinue = async (idToUse: string = clientId) => {
    const trimmed = idToUse.trim()
    if (!trimmed) {
      setError('Enter your Google Client ID to continue')
      return
    }

    setConnecting(true)
    setError(null)

    try {
      await initAuth(trimmed, {
        onUser: (user) => {
          localStorage.setItem(CLIENT_ID_KEY, trimmed)
          onSignedIn({ ...user, clientId: trimmed })
        },
        onTokenReady,
      })
    } catch {
      setError('Could not load Google Sign-In. Check your connection and try again.')
    } finally {
      setConnecting(false)
    }
  }

  useEffect(() => {
    const saved = localStorage.getItem(CLIENT_ID_KEY)
    if (saved) void handleContinue(saved)
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

        <div id="gsi-btn" className="mt-4 flex justify-center" />

        <div className="my-4 flex items-center gap-2 text-xs text-ink/40">
          <div className="h-px flex-1 bg-ink/10" />
          or enter Client ID manually
          <div className="h-px flex-1 bg-ink/10" />
        </div>

        <input
          type="text"
          placeholder="xxxx.apps.googleusercontent.com"
          value={clientId}
          onChange={(e) => setClientId(e.target.value)}
          aria-label="Google Client ID"
          className="w-full rounded-lg border border-ink/10 px-3 py-2 text-sm"
        />

        {error && <p className="mt-2 text-xs text-rust">{error}</p>}

        <button
          type="button"
          onClick={() => handleContinue()}
          disabled={isConnecting}
          className="mt-3 w-full rounded-full bg-ink py-3 font-medium text-card disabled:opacity-40"
        >
          {isConnecting ? 'Connecting…' : 'Continue'}
        </button>

        <button type="button" onClick={onSkip} className="mt-2 w-full text-center text-xs text-ink/40">
          Skip for now — use offline
        </button>

        <button
          type="button"
          onClick={() => setGuideOpen((v) => !v)}
          className="mt-4 w-full text-left text-xs font-medium text-ink/50"
        >
          {isGuideOpen ? '▾' : '▸'} 5-minute setup guide
        </button>

        {isGuideOpen && (
          <ol className="mt-2 list-decimal space-y-1 pl-5 text-xs text-ink/60">
            <li>Create or select a project in Google Cloud Console</li>
            <li>Enable the Google Drive API</li>
            <li>Create an OAuth 2.0 Client ID (Web application)</li>
            <li>Add your app URL under Authorized JavaScript origins</li>
            <li>Add the drive.file scope on the OAuth consent screen, and add your account as a test user</li>
          </ol>
        )}
      </div>
    </div>
  )
}

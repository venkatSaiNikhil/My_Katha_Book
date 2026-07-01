const GIS_SRC = 'https://accounts.google.com/gsi/client'
const DRIVE_SCOPE = 'https://www.googleapis.com/auth/drive.file openid email profile'
const SESSION_TOKEN_KEY = 'khata_v1_access_token'

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: { client_id: string; callback: (response: { credential: string }) => void }) => void
          renderButton: (parent: HTMLElement, options: Record<string, unknown>) => void
          prompt: () => void
          disableAutoSelect: () => void
        }
        oauth2: {
          initTokenClient: (config: {
            client_id: string
            scope: string
            callback: (response: { access_token: string }) => void
          }) => { requestAccessToken: (options: { prompt: string }) => void }
        }
      }
    }
  }
}

let tokenClient: { requestAccessToken: (options: { prompt: string }) => void } | null = null
let initializedClientId: string | null = null
let initPromise: Promise<void> | null = null

export function loadGoogleScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.google?.accounts) {
      resolve()
      return
    }

    if (!document.querySelector(`script[src="${GIS_SRC}"]`)) {
      const script = document.createElement('script')
      script.src = GIS_SRC
      script.async = true
      script.defer = true
      document.head.appendChild(script)
    }

    let tries = 0
    const interval = setInterval(() => {
      tries += 1
      if (window.google?.accounts) {
        clearInterval(interval)
        resolve()
      } else if (tries >= 50) {
        clearInterval(interval)
        reject(new Error('Failed to load Google Identity Services'))
      }
    }, 200)
  })
}

export interface DecodedIdToken {
  name: string
  email: string
  picture?: string
}

export function decodeIdToken(idToken: string): DecodedIdToken {
  const payload = idToken.split('.')[1]
  const normalized = payload.replace(/-/g, '+').replace(/_/g, '/')
  const decoded = JSON.parse(atob(normalized))
  return { name: decoded.name, email: decoded.email, picture: decoded.picture }
}

interface InitAuthOptions {
  onUser: (user: DecodedIdToken) => void
  onTokenReady: () => void
}

function renderButton() {
  const target = document.getElementById('gsi-btn')
  if (target && window.google) {
    window.google.accounts.id.renderButton(target, { theme: 'outline', size: 'large', width: 300 })
  }
}

export async function initAuth(clientId: string, options: InitAuthOptions): Promise<void> {
  // React StrictMode (and other double-mount scenarios) can invoke this twice in the same
  // session. GIS logs warnings on repeat initialize() calls and its one-tap prompt() outright
  // rejects concurrent calls, so only the first call per Client ID does real initialization —
  // later calls just re-render the button into whatever DOM node currently hosts it.
  if (initializedClientId === clientId && initPromise) {
    await initPromise
    renderButton()
    return
  }

  initializedClientId = clientId
  initPromise = (async () => {
    await loadGoogleScript()
    const google = window.google
    if (!google) throw new Error('Google Identity Services failed to load')

    google.accounts.id.initialize({
      client_id: clientId,
      callback: (response) => {
        const user = decodeIdToken(response.credential)
        options.onUser(user)
        tokenClient?.requestAccessToken({ prompt: '' })
      },
    })

    tokenClient = google.accounts.oauth2.initTokenClient({
      client_id: clientId,
      scope: DRIVE_SCOPE,
      callback: (response) => {
        sessionStorage.setItem(SESSION_TOKEN_KEY, response.access_token)
        options.onTokenReady()
      },
    })

    renderButton()
    google.accounts.id.prompt()
  })()

  await initPromise
}

export function getAccessToken(): string | null {
  return sessionStorage.getItem(SESSION_TOKEN_KEY)
}

export function signOut(): void {
  window.google?.accounts.id.disableAutoSelect()
  sessionStorage.removeItem(SESSION_TOKEN_KEY)
  tokenClient = null
  initializedClientId = null
  initPromise = null
}

import { useEffect, useRef, useState } from 'react'
import { AddTransactionSheet } from './components/AddTransactionSheet'
import { BottomSheet } from './components/BottomSheet'
import { Fab } from './components/Fab'
import { type SyncStatusState } from './components/SyncStatus'
import { TabBar, type TabId } from './components/TabBar'
import { Toast } from './components/Toast'
import { TopBar } from './components/TopBar'
import type { AppState, Transaction, WealthEntry } from './data/types'
import { useAppState } from './hooks/useAppState'
import { loadFromDrive, syncAll } from './lib/driveService'
import { getAccessToken, signOut } from './lib/googleAuth'
import { AnalyticsView } from './views/AnalyticsView'
import { CategoriesView } from './views/CategoriesView'
import { HomeView } from './views/HomeView'
import { LoginView } from './views/LoginView'
import { SavingsView } from './views/SavingsView'
import { WealthView } from './views/WealthView'

const LOGIN_DISMISSED_KEY = 'khata_v1_login_dismissed'

function App() {
  const {
    state,
    addTransaction,
    deleteTransaction,
    addWealth,
    deleteWealth,
    addCategory,
    deleteCategory,
    addSubcategory,
    removeSubcategory,
    setUser,
    setDriveFileIds,
    mergeFromDrive,
  } = useAppState()

  const [activeTab, setActiveTab] = useState<TabId>('today')
  const [isSheetOpen, setSheetOpen] = useState(false)
  const [showSavedToast, setShowSavedToast] = useState(false)
  const [syncStatus, setSyncStatus] = useState<SyncStatusState>('idle')
  const [syncErrorToast, setSyncErrorToast] = useState(false)
  const [loginVisible, setLoginVisible] = useState(() => {
    if (state.user) return false
    return localStorage.getItem(LOGIN_DISMISSED_KEY) !== 'true'
  })

  const stateRef = useRef(state)
  stateRef.current = state
  const syncTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const runSync = async () => {
    if (!stateRef.current.user) return
    if (!getAccessToken()) {
      // Signed in but no Drive access token yet — e.g. the consent popup hasn't completed, was
      // dismissed, or the token expired. Surface this instead of silently doing nothing so the
      // sync pill is actionable (clicking it reopens sign-in to (re)request Drive access).
      console.error('[khata sync] No Drive access token available')
      setSyncStatus('error')
      return
    }
    setSyncStatus('syncing')
    try {
      const result = await syncAll(stateRef.current)
      setDriveFileIds({ txn: result.txnFileId, wealth: result.wealthFileId })
      setSyncStatus('ok')
    } catch (err) {
      console.error('[khata sync] syncAll failed:', err)
      setSyncStatus('error')
      setSyncErrorToast(true)
      setTimeout(() => setSyncErrorToast(false), 3000)
    }
  }

  const scheduleSync = () => {
    if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current)
    syncTimeoutRef.current = setTimeout(runSync, 1000)
  }

  useEffect(() => {
    if (state.user && getAccessToken()) {
      setSyncStatus('syncing')
      loadFromDrive(state)
        .then((partial: Partial<AppState>) => {
          mergeFromDrive(partial)
          setSyncStatus('ok')
        })
        .catch((err) => {
          console.error('[khata sync] loadFromDrive failed:', err)
          setSyncStatus('error')
        })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleSaveTransaction = (txn: Transaction) => {
    addTransaction(txn)
    setShowSavedToast(true)
    setTimeout(() => setShowSavedToast(false), 2000)
    scheduleSync()
  }

  const handleDeleteTransaction = (id: string) => {
    deleteTransaction(id)
    scheduleSync()
  }

  const handleAddWealth = (entry: WealthEntry) => {
    addWealth(entry)
    scheduleSync()
  }

  const handleDeleteWealth = (id: string) => {
    deleteWealth(id)
    scheduleSync()
  }

  const handleSyncClick = () => {
    if (!stateRef.current.user || !getAccessToken()) {
      setLoginVisible(true)
      return
    }
    runSync()
  }

  const handleSignOut = () => {
    signOut()
    setUser(null)
    setSyncStatus('idle')
  }

  if (loginVisible) {
    return (
      <LoginView
        onSignedIn={(user) => {
          setUser(user)
          setLoginVisible(false)
        }}
        onTokenReady={scheduleSync}
        onSkip={() => {
          localStorage.setItem(LOGIN_DISMISSED_KEY, 'true')
          setLoginVisible(false)
        }}
      />
    )
  }

  return (
    <div className="mx-auto min-h-screen max-w-[560px] bg-paper pb-20">
      <TopBar
        user={state.user}
        syncStatus={syncStatus}
        onSyncClick={handleSyncClick}
        onSignOut={handleSignOut}
      />
      <TabBar active={activeTab} onChange={setActiveTab} />

      <main>
        {activeTab === 'today' && (
          <HomeView
            transactions={state.transactions}
            categories={state.categories}
            onDelete={handleDeleteTransaction}
          />
        )}
        {activeTab === 'analytics' && (
          <AnalyticsView transactions={state.transactions} categories={state.categories} />
        )}
        {activeTab === 'wealth' && (
          <WealthView wealth={state.wealth} onAdd={handleAddWealth} onDelete={handleDeleteWealth} />
        )}
        {activeTab === 'save' && <SavingsView transactions={state.transactions} />}
        {activeTab === 'categories' && (
          <CategoriesView
            categories={state.categories}
            onAddCategory={addCategory}
            onDeleteCategory={deleteCategory}
            onAddSubcategory={addSubcategory}
            onRemoveSubcategory={removeSubcategory}
          />
        )}
      </main>

      <Fab onClick={() => setSheetOpen(true)} />

      <BottomSheet isOpen={isSheetOpen} onClose={() => setSheetOpen(false)}>
        <AddTransactionSheet
          categories={state.categories}
          onSave={handleSaveTransaction}
          onClose={() => setSheetOpen(false)}
        />
      </BottomSheet>

      {showSavedToast && <Toast message="Transaction saved" />}
      {syncErrorToast && <Toast message="Sync failed — your data is still saved locally" />}
    </div>
  )
}

export default App

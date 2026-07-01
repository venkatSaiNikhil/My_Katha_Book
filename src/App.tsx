import { useState } from 'react'
import { AddTransactionSheet } from './components/AddTransactionSheet'
import { BottomSheet } from './components/BottomSheet'
import { Fab } from './components/Fab'
import { TabBar, type TabId } from './components/TabBar'
import { Toast } from './components/Toast'
import { TopBar } from './components/TopBar'
import type { Transaction } from './data/types'
import { useAppState } from './hooks/useAppState'
import { AnalyticsView } from './views/AnalyticsView'
import { CategoriesView } from './views/CategoriesView'
import { HomeView } from './views/HomeView'
import { SavingsView } from './views/SavingsView'
import { WealthView } from './views/WealthView'

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
  } = useAppState()
  const [activeTab, setActiveTab] = useState<TabId>('today')
  const [isSheetOpen, setSheetOpen] = useState(false)
  const [showSavedToast, setShowSavedToast] = useState(false)

  const handleSave = (txn: Transaction) => {
    addTransaction(txn)
    setShowSavedToast(true)
    setTimeout(() => setShowSavedToast(false), 2000)
  }

  return (
    <div className="mx-auto min-h-screen max-w-[560px] bg-paper pb-20">
      <TopBar user={state.user} />
      <TabBar active={activeTab} onChange={setActiveTab} />

      {activeTab === 'today' && (
        <HomeView
          transactions={state.transactions}
          categories={state.categories}
          onDelete={deleteTransaction}
        />
      )}
      {activeTab === 'analytics' && (
        <AnalyticsView transactions={state.transactions} categories={state.categories} />
      )}
      {activeTab === 'wealth' && (
        <WealthView wealth={state.wealth} onAdd={addWealth} onDelete={deleteWealth} />
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

      <Fab onClick={() => setSheetOpen(true)} />

      <BottomSheet isOpen={isSheetOpen} onClose={() => setSheetOpen(false)}>
        <AddTransactionSheet
          categories={state.categories}
          onSave={handleSave}
          onClose={() => setSheetOpen(false)}
        />
      </BottomSheet>

      {showSavedToast && <Toast message="Transaction saved" />}
    </div>
  )
}

export default App

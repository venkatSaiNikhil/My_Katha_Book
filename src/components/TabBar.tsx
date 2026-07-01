export type TabId = 'today' | 'analytics' | 'wealth' | 'save' | 'categories'

const TABS: { id: TabId; label: string }[] = [
  { id: 'today', label: 'Today' },
  { id: 'analytics', label: 'Analytics' },
  { id: 'wealth', label: 'Wealth' },
  { id: 'save', label: 'Save' },
  { id: 'categories', label: 'Categories' },
]

interface TabBarProps {
  active: TabId
  onChange: (tab: TabId) => void
}

export function TabBar({ active, onChange }: TabBarProps) {
  return (
    <nav className="flex border-b border-ink/10 bg-card">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onChange(tab.id)}
          className={`flex-1 py-3 text-sm font-medium ${
            active === tab.id ? 'border-b-2 border-rust text-rust' : 'text-ink/60'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </nav>
  )
}

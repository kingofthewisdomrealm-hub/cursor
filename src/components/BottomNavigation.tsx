import type { ViewId } from '../types/game'
import { Store, Trophy, Swords, BookOpen, Settings } from 'lucide-react'

interface BottomNavigationProps {
  currentView: ViewId | 'settings'
  onNavigate: (view: ViewId | 'settings') => void
}

const NAV_ITEMS: { id: ViewId | 'settings'; label: string; icon: typeof Store }[] = [
  { id: 'play', label: 'Build', icon: Store },
  { id: 'boss', label: 'Boss', icon: Swords },
  { id: 'collection', label: 'Cards', icon: BookOpen },
  { id: 'achievements', label: 'Awards', icon: Trophy },
  { id: 'settings', label: 'Settings', icon: Settings },
]

export function BottomNavigation({ currentView, onNavigate }: BottomNavigationProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 bg-white/90 backdrop-blur-md border-t border-slate-200/60">
      <div className="max-w-md mx-auto flex justify-around py-2 px-2">
        {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
          const active = currentView === id
          return (
            <button
              key={id}
              type="button"
              onClick={() => onNavigate(id)}
              className={`
                flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-colors
                ${active ? 'text-emerald-600' : 'text-slate-400 hover:text-slate-600'}
              `}
            >
              <Icon size={20} strokeWidth={active ? 2.5 : 2} />
              <span className="text-[10px] font-medium">{label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}

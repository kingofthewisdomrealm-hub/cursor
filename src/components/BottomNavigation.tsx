import { Gamepad2, BookOpen, Trophy, Settings } from 'lucide-react'
import type { ViewId } from '../types/game'

interface BottomNavigationProps {
  currentView: ViewId
  onNavigate: (view: ViewId) => void
}

const NAV_ITEMS: { id: ViewId; label: string; icon: typeof Gamepad2 }[] = [
  { id: 'game', label: 'Play', icon: Gamepad2 },
  { id: 'collection', label: 'Collection', icon: BookOpen },
  { id: 'challenges', label: 'Challenges', icon: Trophy },
  { id: 'settings', label: 'Settings', icon: Settings },
]

export function BottomNavigation({ currentView, onNavigate }: BottomNavigationProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur border-t border-slate-200 z-30">
      <div className="game-container">
        <div className="flex justify-around py-2">
          {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => onNavigate(id)}
              className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-colors ${
                currentView === id ? 'text-indigo-600' : 'text-slate-400'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{label}</span>
            </button>
          ))}
        </div>
      </div>
    </nav>
  )
}

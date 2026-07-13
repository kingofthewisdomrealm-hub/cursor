import { Map, Bookmark, Filter } from 'lucide-react'
import { NavLink } from 'react-router-dom'

export function AppNavigation() {
  return (
    <nav className="flex shrink-0 border-t border-slate-700/60 bg-slate-900/95 backdrop-blur-sm safe-bottom">
      <NavLink
        to="/"
        end
        className={({ isActive }) =>
          `flex flex-1 flex-col items-center gap-0.5 py-2.5 text-xs font-medium transition ${
            isActive ? 'text-sky-400' : 'text-slate-500 hover:text-slate-300'
          }`
        }
      >
        <Map className="h-5 w-5" />
        Map
      </NavLink>
      <NavLink
        to="/saved"
        className={({ isActive }) =>
          `flex flex-1 flex-col items-center gap-0.5 py-2.5 text-xs font-medium transition ${
            isActive ? 'text-sky-400' : 'text-slate-500 hover:text-slate-300'
          }`
        }
      >
        <Bookmark className="h-5 w-5" />
        Saved
      </NavLink>
    </nav>
  )
}

export function FilterButton({ onClick, activeCount }: { onClick: () => void; activeCount: number }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-2 rounded-lg bg-slate-800/90 px-3 py-2 text-sm font-medium text-slate-200 shadow-lg backdrop-blur-sm transition hover:bg-slate-700"
    >
      <Filter className="h-4 w-4 text-sky-400" />
      Filters
      {activeCount > 0 && (
        <span className="rounded-full bg-sky-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
          {activeCount}
        </span>
      )}
    </button>
  )
}

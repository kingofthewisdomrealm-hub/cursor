import { Bookmark, Trash2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useSavedStorms } from '../hooks/useSavedStorms'
import { formatDate, formatSavedDate, getEventIcon } from '../lib/format'
import { AppNavigation } from '../components/AppNavigation'
import { SEVERITY_COLORS, SEVERITY_LABELS, STORM_EVENT_LABELS } from '../types/storm'

export function SavedStormsPage() {
  const { savedStorms, removeStorm } = useSavedStorms()
  const navigate = useNavigate()

  return (
    <div className="flex h-full flex-col bg-slate-950">
      <header className="shrink-0 border-b border-slate-700/60 bg-slate-900 px-4 py-4">
        <div className="flex items-center gap-2">
          <Bookmark className="h-6 w-6 text-sky-400" />
          <div>
            <h1 className="text-lg font-bold text-slate-100">Saved Storms</h1>
            <p className="text-xs text-slate-500">
              {savedStorms.length} storm{savedStorms.length !== 1 ? 's' : ''} saved locally
            </p>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4">
        {savedStorms.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Bookmark className="mb-3 h-12 w-12 text-slate-700" />
            <p className="font-medium text-slate-400">No saved storms yet</p>
            <p className="mt-1 max-w-xs text-sm text-slate-600">
              Tap a storm marker on the map and use the bookmark icon to save storms for later
              review.
            </p>
            <button
              type="button"
              onClick={() => navigate('/')}
              className="mt-4 rounded-lg bg-sky-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-sky-400"
            >
              View Storm Map
            </button>
          </div>
        ) : (
          <ul className="space-y-3">
            {savedStorms.map((storm) => (
              <li
                key={storm.id}
                className="rounded-xl border border-slate-700/50 bg-slate-800/60 p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="rounded-lg bg-slate-700/80 p-2 text-sky-400">
                      {getEventIcon(storm.eventType, 'h-5 w-5')}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="font-semibold text-slate-100">
                          {STORM_EVENT_LABELS[storm.eventType]}
                        </h2>
                        <span
                          className="h-2 w-2 rounded-full"
                          style={{ backgroundColor: SEVERITY_COLORS[storm.severity] }}
                        />
                        <span className="text-xs text-slate-500">
                          {SEVERITY_LABELS[storm.severity]}
                        </span>
                      </div>
                      <p className="text-sm text-slate-300">{storm.city}</p>
                      <p className="mt-1 text-xs text-slate-500">
                        Event: {formatDate(storm.date)} · Saved: {formatSavedDate(storm.savedAt)}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeStorm(storm.id)}
                    className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-700 hover:text-red-400"
                    aria-label="Remove saved storm"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </main>

      <AppNavigation />
    </div>
  )
}

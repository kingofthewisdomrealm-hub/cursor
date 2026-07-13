import { X } from 'lucide-react'

interface SettingsModalProps {
  open: boolean
  soundEnabled: boolean
  animationsEnabled: boolean
  onClose: () => void
  onToggleSound: () => void
  onToggleAnimations: () => void
  onReset: () => void
}

export function SettingsModal({
  open,
  soundEnabled,
  animationsEnabled,
  onClose,
  onToggleSound,
  onToggleAnimations,
  onReset,
}: SettingsModalProps) {
  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm bg-white rounded-2xl p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-slate-800">Settings</h2>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          <label className="flex items-center justify-between">
            <span className="text-sm text-slate-700">Sound Effects</span>
            <button
              type="button"
              onClick={onToggleSound}
              className={`w-12 h-7 rounded-full transition-colors ${soundEnabled ? 'bg-emerald-500' : 'bg-slate-300'}`}
            >
              <div
                className={`w-5 h-5 bg-white rounded-full shadow transition-transform mx-1 ${soundEnabled ? 'translate-x-5' : ''}`}
              />
            </button>
          </label>

          <label className="flex items-center justify-between">
            <span className="text-sm text-slate-700">Animations</span>
            <button
              type="button"
              onClick={onToggleAnimations}
              className={`w-12 h-7 rounded-full transition-colors ${animationsEnabled ? 'bg-emerald-500' : 'bg-slate-300'}`}
            >
              <div
                className={`w-5 h-5 bg-white rounded-full shadow transition-transform mx-1 ${animationsEnabled ? 'translate-x-5' : ''}`}
              />
            </button>
          </label>
        </div>

        <button
          type="button"
          onClick={() => {
            if (confirm('Reset all progress? This cannot be undone.')) onReset()
          }}
          className="mt-6 w-full py-2.5 text-red-500 text-sm font-medium border border-red-200 rounded-xl hover:bg-red-50 transition-colors"
        >
          Reset Progress
        </button>
      </div>
    </div>
  )
}

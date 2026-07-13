import { motion, AnimatePresence } from 'framer-motion'
import { Volume2, VolumeX, Sparkles, Trash2 } from 'lucide-react'
import { useState } from 'react'

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
  const [confirmReset, setConfirmReset] = useState(false)

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-40 bg-black/40 flex items-end sm:items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl w-full max-w-sm p-6 shadow-2xl"
          >
            <h2 className="text-xl font-bold text-slate-800 mb-4">Settings</h2>
            <button
              type="button"
              onClick={onToggleSound}
              className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 mb-2"
            >
              <span className="flex items-center gap-2 text-sm font-medium">
                {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                Sound Effects
              </span>
              <span className={`text-xs font-bold ${soundEnabled ? 'text-green-600' : 'text-slate-400'}`}>
                {soundEnabled ? 'ON' : 'OFF'}
              </span>
            </button>
            <button
              type="button"
              onClick={onToggleAnimations}
              className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 mb-4"
            >
              <span className="flex items-center gap-2 text-sm font-medium">
                <Sparkles className="w-4 h-4" />
                Animations
              </span>
              <span className={`text-xs font-bold ${animationsEnabled ? 'text-green-600' : 'text-slate-400'}`}>
                {animationsEnabled ? 'ON' : 'OFF'}
              </span>
            </button>
            {!confirmReset ? (
              <button
                type="button"
                onClick={() => setConfirmReset(true)}
                className="w-full flex items-center justify-center gap-2 p-3 rounded-xl bg-red-50 text-red-600 font-medium text-sm"
              >
                <Trash2 className="w-4 h-4" />
                Reset Progress
              </button>
            ) : (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200">
                <p className="text-sm text-red-700 font-medium text-center mb-3">
                  Delete all saved progress?
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setConfirmReset(false)}
                    className="flex-1 py-2 rounded-lg bg-white text-slate-600 text-sm font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onReset()
                      setConfirmReset(false)
                      onClose()
                    }}
                    className="flex-1 py-2 rounded-lg bg-red-500 text-white text-sm font-medium"
                  >
                    Reset
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { getTile } from '../config/tiles'
import type { TileId } from '../types/game'

interface LearningCardModalProps {
  tileId: TileId | null
  completed: boolean
  onClose: () => void
  onComplete: (tileId: TileId) => void
}

export function LearningCardModal({ tileId, completed, onClose, onComplete }: LearningCardModalProps) {
  if (!tileId) return null
  const tile = getTile(tileId)

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-40 bg-black/40 flex items-end sm:items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-3xl w-full max-w-sm p-6 shadow-2xl max-h-[85vh] overflow-y-auto"
        >
          <div className="flex justify-between items-start mb-4">
            <div
              className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${tile.bgClass} flex items-center justify-center text-3xl shadow-md`}
            >
              {tile.icon}
            </div>
            <button type="button" onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600">
              <X className="w-5 h-5" />
            </button>
          </div>
          <h2 className="text-xl font-bold text-slate-800">{tile.name}</h2>
          <p className="text-sm text-slate-600 mt-2">{tile.description}</p>
          <div className="mt-4 p-3 bg-indigo-50 rounded-xl">
            <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wide">Principle</p>
            <p className="text-sm text-slate-700 mt-1">{tile.principle}</p>
          </div>
          <div className="mt-3 p-3 bg-amber-50 rounded-xl">
            <p className="text-xs font-semibold text-amber-600 uppercase tracking-wide">Mini Challenge</p>
            <p className="text-sm text-slate-700 mt-1">{tile.challenge}</p>
          </div>
          <button
            type="button"
            disabled={completed}
            onClick={() => onComplete(tileId)}
            className={`
              mt-5 w-full py-3 rounded-xl font-semibold text-white
              ${completed ? 'bg-slate-300' : 'bg-gradient-to-r from-indigo-500 to-purple-500'}
            `}
          >
            {completed ? 'Challenge Completed ✓' : 'Complete Challenge (+50 pts)'}
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

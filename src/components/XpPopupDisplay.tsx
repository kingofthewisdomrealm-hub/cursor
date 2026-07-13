import { motion, AnimatePresence } from 'framer-motion'
import type { XpPopup } from '../types/game'

interface XpPopupDisplayProps {
  popups: XpPopup[]
}

export function XpPopupDisplay({ popups }: XpPopupDisplayProps) {
  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-40 pointer-events-none flex flex-col items-center gap-2">
      <AnimatePresence>
        {popups.map((popup) => (
          <motion.div
            key={popup.id}
            initial={{ opacity: 0, y: 20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -30 }}
            className={`
              px-4 py-2 rounded-full font-bold text-sm shadow-lg
              ${popup.positive ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'}
            `}
          >
            {popup.positive ? '+' : '-'}
            {popup.amount} {popup.label}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}

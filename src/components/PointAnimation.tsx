import { motion, AnimatePresence } from 'framer-motion'

interface PointAnimationProps {
  popups: Array<{ id: string; amount: number; label: string }>
}

export function PointAnimation({ popups }: PointAnimationProps) {
  return (
    <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
      <AnimatePresence>
        {popups.map((popup) => (
          <motion.div
            key={popup.id}
            initial={{ opacity: 0, y: 20, scale: 0.8 }}
            animate={{ opacity: 1, y: -40, scale: 1 }}
            exit={{ opacity: 0, y: -80 }}
            transition={{ duration: 0.6 }}
            className="absolute bg-white/95 backdrop-blur px-4 py-2 rounded-2xl shadow-lg border border-indigo-100"
          >
            <p className="text-lg font-bold text-indigo-600">+{popup.amount}</p>
            <p className="text-xs text-slate-500 text-center">{popup.label}</p>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}

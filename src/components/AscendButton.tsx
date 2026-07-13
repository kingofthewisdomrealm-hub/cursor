import { motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'

interface AscendButtonProps {
  onAscend: () => void
  compact?: boolean
}

export function AscendButton({ onAscend, compact }: AscendButtonProps) {
  return (
    <motion.button
      type="button"
      onClick={onAscend}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: [1, 1.05, 1], opacity: 1 }}
      transition={{ scale: { repeat: Infinity, duration: 1.5 } }}
      className={`
        font-bold text-white bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500
        shadow-md shadow-amber-300/50 border border-yellow-200
        flex items-center justify-center gap-1.5 shrink-0
        ${compact ? 'px-3 py-2 rounded-lg text-sm' : 'w-full py-4 rounded-2xl text-lg'}
      `}
    >
      <Sparkles className={compact ? 'w-4 h-4' : 'w-6 h-6'} />
      ASCEND
      {!compact && <Sparkles className="w-6 h-6" />}
    </motion.button>
  )
}

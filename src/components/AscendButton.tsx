import { motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'

interface AscendButtonProps {
  onAscend: () => void
}

export function AscendButton({ onAscend }: AscendButtonProps) {
  return (
    <motion.button
      type="button"
      onClick={onAscend}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: [1, 1.05, 1], opacity: 1 }}
      transition={{ scale: { repeat: Infinity, duration: 1.5 } }}
      className="w-full py-4 rounded-2xl font-bold text-lg text-white
        bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500
        shadow-lg shadow-amber-300/50 border-2 border-yellow-200
        flex items-center justify-center gap-2"
    >
      <Sparkles className="w-6 h-6" />
      ASCEND
      <Sparkles className="w-6 h-6" />
    </motion.button>
  )
}

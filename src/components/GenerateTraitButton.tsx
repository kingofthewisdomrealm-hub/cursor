import { motion } from 'framer-motion'
import { Plus } from 'lucide-react'

interface GenerateTraitButtonProps {
  onGenerate: () => void
  disabled: boolean
  boardFull: boolean
  cooldown: boolean
}

export function GenerateTraitButton({ onGenerate, disabled, boardFull, cooldown }: GenerateTraitButtonProps) {
  return (
    <div className="px-4 py-2">
      <motion.button
        type="button"
        onClick={onGenerate}
        disabled={disabled}
        whileTap={{ scale: disabled ? 1 : 0.95 }}
        className={`
          w-full py-3 rounded-xl font-semibold text-white flex items-center justify-center gap-2
          shadow-md transition-opacity
          ${disabled ? 'bg-slate-300 cursor-not-allowed' : 'bg-gradient-to-r from-indigo-500 to-purple-500'}
        `}
      >
        <Plus className="w-5 h-5" />
        Generate Trait
      </motion.button>
      {boardFull && (
        <p className="text-xs text-center text-slate-500 mt-2">
          Board full. Merge or move tiles to continue.
        </p>
      )}
      {cooldown && !boardFull && (
        <p className="text-xs text-center text-slate-400 mt-1">Cooldown...</p>
      )}
    </div>
  )
}

import { motion } from 'framer-motion'
import { Plus } from 'lucide-react'

interface GenerateTraitButtonProps {
  onGenerate: () => void
  disabled: boolean
  boardFull: boolean
  compact?: boolean
}

export function GenerateTraitButton({ onGenerate, disabled, boardFull, compact }: GenerateTraitButtonProps) {
  return (
    <div className={compact ? 'flex-1 min-w-0' : 'px-4 py-2'}>
      <motion.button
        type="button"
        onClick={onGenerate}
        disabled={disabled}
        whileTap={{ scale: disabled ? 1 : 0.95 }}
        className={`
          w-full rounded-lg font-semibold text-white flex items-center justify-center gap-1.5
          shadow-sm transition-opacity text-sm
          ${compact ? 'py-2' : 'py-3 rounded-xl'}
          ${disabled ? 'bg-slate-300 cursor-not-allowed' : 'bg-gradient-to-r from-indigo-500 to-purple-500'}
        `}
      >
        <Plus className="w-4 h-4" />
        Generate Trait
      </motion.button>
      {boardFull && !compact && (
        <p className="text-xs text-center text-slate-500 mt-1">
          Board full. Merge or move tiles to continue.
        </p>
      )}
    </div>
  )
}

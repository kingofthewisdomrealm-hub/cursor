import { motion } from 'framer-motion'
import { Rocket } from 'lucide-react'

interface RunSimulationButtonProps {
  disabled: boolean
  onRun: () => void
  bossActive?: boolean
}

export function RunSimulationButton({ disabled, onRun, bossActive }: RunSimulationButtonProps) {
  return (
    <motion.button
      type="button"
      onClick={onRun}
      disabled={disabled}
      whileTap={disabled ? {} : { scale: 0.97 }}
      className={`
        w-full py-4 rounded-2xl font-bold text-white flex items-center justify-center gap-2
        transition-all shadow-lg
        ${disabled ? 'bg-slate-300 cursor-not-allowed shadow-none' : ''}
        ${!disabled && !bossActive ? 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 shadow-emerald-200' : ''}
        ${!disabled && bossActive ? 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 shadow-orange-200' : ''}
      `}
    >
      <Rocket size={20} />
      {bossActive ? 'Launch Under Fire!' : 'Launch Business'}
    </motion.button>
  )
}

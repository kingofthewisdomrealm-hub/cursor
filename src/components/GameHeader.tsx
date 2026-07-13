import { motion } from 'framer-motion'
import { getRankProgress } from '../config/ranks'

interface GameHeaderProps {
  points: number
  rankName: string
  nextRankName?: string
  progressPercent: number
}

export function GameHeader({ points, rankName, nextRankName, progressPercent }: GameHeaderProps) {
  const pct = progressPercent ?? getRankProgress(points)

  return (
    <header className="px-3 pt-2 pb-1.5 shrink-0">
      <h1 className="text-sm font-bold text-slate-800 text-center tracking-tight">
        Communicator Merge
      </h1>
      <div className="mt-1 flex items-center justify-between gap-2 text-xs">
        <div>
          <span className="text-slate-500">Points </span>
          <span className="font-bold text-indigo-600 tabular-nums">{points.toLocaleString()}</span>
        </div>
        <div className="text-right">
          <span className="text-slate-500">Rank </span>
          <span className="font-bold text-slate-800">{rankName}</span>
        </div>
      </div>
      <div className="mt-1 flex items-center gap-2">
        <div className="flex-1 h-1.5 bg-white/60 rounded-full overflow-hidden shadow-inner">
          <motion.div
            className="h-full bg-gradient-to-r from-indigo-400 to-purple-500 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
        {nextRankName && (
          <span className="text-[9px] text-slate-400 shrink-0 max-w-[5rem] truncate">{nextRankName}</span>
        )}
      </div>
    </header>
  )
}

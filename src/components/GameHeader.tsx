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
    <header className="px-4 pt-4 pb-2 shrink-0">
      <h1 className="text-xl font-bold text-slate-800 text-center tracking-tight">
        Communicator Merge
      </h1>
      <div className="mt-3 flex items-center justify-between gap-3">
        <div className="flex-1">
          <p className="text-xs text-slate-500 font-medium">Communication Points</p>
          <p className="text-2xl font-bold text-indigo-600 tabular-nums">{points.toLocaleString()}</p>
        </div>
        <div className="flex-1 text-right">
          <p className="text-xs text-slate-500 font-medium">Rank</p>
          <p className="text-sm font-bold text-slate-800">{rankName}</p>
        </div>
      </div>
      <div className="mt-2">
        <div className="h-2 bg-white/60 rounded-full overflow-hidden shadow-inner">
          <motion.div
            className="h-full bg-gradient-to-r from-indigo-400 to-purple-500 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
        {nextRankName && (
          <p className="text-[10px] text-slate-400 mt-1 text-center">Next: {nextRankName}</p>
        )}
      </div>
    </header>
  )
}

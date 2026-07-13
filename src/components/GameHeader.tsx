import { motion } from 'framer-motion'
import { getRankProgress } from '../config/ranks'
import { getCurrentStageNumber } from '../config/stages'

interface GameHeaderProps {
  points: number
  rankName: string
  zoneName: string
  nextRankName?: string
  progressPercent: number
  clearedStages: number[]
}

export function GameHeader({
  points,
  rankName,
  zoneName,
  nextRankName,
  progressPercent,
  clearedStages,
}: GameHeaderProps) {
  const pct = progressPercent ?? getRankProgress(points)
  const stageNum = getCurrentStageNumber(clearedStages)

  return (
    <header className="px-3 pt-2 pb-1.5 shrink-0">
      <div className="flex items-center justify-between">
        <h1 className="text-sm font-black text-amber-300 tracking-tight">Speaker Merge</h1>
        <span className="text-[10px] font-bold bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/40">
          Stage {Math.min(stageNum, 6)}
        </span>
      </div>
      <p className="text-[9px] text-slate-400 text-center -mt-0.5">{zoneName}</p>
      <div className="mt-1 flex items-center justify-between gap-2 text-xs">
        <div>
          <span className="text-slate-500">Power </span>
          <span className="font-bold text-amber-400 tabular-nums">{points.toLocaleString()}</span>
        </div>
        <div className="text-right">
          <span className="text-slate-500">Rank </span>
          <span className="font-bold text-white">{rankName}</span>
        </div>
      </div>
      <div className="mt-1 flex items-center gap-2">
        <div className="flex-1 h-1.5 bg-slate-700 rounded-full overflow-hidden border border-slate-600">
          <motion.div
            className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
        {nextRankName && (
          <span className="text-[9px] text-slate-500 shrink-0 max-w-[5rem] truncate">{nextRankName}</span>
        )}
      </div>
    </header>
  )
}

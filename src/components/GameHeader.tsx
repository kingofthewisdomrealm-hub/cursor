import { getLevelProgress } from '../config/levels'

interface GameHeaderProps {
  xp: number
  levelName: string
  nextLevelName?: string
  streak: number
}

export function GameHeader({ xp, levelName, nextLevelName, streak }: GameHeaderProps) {
  const progress = getLevelProgress(xp)

  return (
    <header className="px-4 pt-4 pb-3 bg-white/60 backdrop-blur-sm border-b border-slate-200/60 sticky top-0 z-20">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-lg font-bold text-slate-800 tracking-tight">Commerce Architect</h1>
          <p className="text-xs text-emerald-600 font-medium">{levelName}</p>
        </div>
        <div className="flex items-center gap-3">
          {streak > 0 && (
            <div className="flex items-center gap-1 bg-orange-100 text-orange-600 px-2 py-1 rounded-full text-xs font-semibold">
              <span>🔥</span>
              <span>{streak}</span>
            </div>
          )}
          <div className="text-right">
            <p className="text-xs text-slate-500">XP</p>
            <p className="text-sm font-bold text-emerald-600">{xp.toLocaleString()}</p>
          </div>
        </div>
      </div>
      {nextLevelName && (
        <div className="mt-1">
          <div className="flex justify-between text-[10px] text-slate-500 mb-1">
            <span>Next: {nextLevelName}</span>
            <span>{progress}%</span>
          </div>
          <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}
    </header>
  )
}

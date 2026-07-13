import { ACHIEVEMENTS } from '../lib/achievements'

interface AchievementsScreenProps {
  unlockedIds: string[]
  stats: {
    roundsPlayed: number
    totalRevenue: number
    bestConversion: number
    perfectRounds: number
    bossBattlesWon: number
  }
  bestStreak: number
  onBack: () => void
}

export function AchievementsScreen({
  unlockedIds,
  stats,
  bestStreak,
  onBack,
}: AchievementsScreenProps) {
  return (
    <div className="flex-1 overflow-y-auto px-4 pb-32 pt-4">
      <button
        type="button"
        onClick={onBack}
        className="text-sm text-emerald-600 font-medium mb-4"
      >
        ← Back to Build
      </button>

      <h2 className="text-xl font-bold text-slate-800 mb-1">Achievements</h2>
      <p className="text-sm text-slate-500 mb-4">
        {unlockedIds.length}/{ACHIEVEMENTS.length} unlocked
      </p>

      <div className="grid grid-cols-2 gap-2 mb-6">
        <div className="bg-white rounded-xl p-3 border border-slate-200 text-center">
          <p className="text-lg font-bold text-slate-800">{stats.roundsPlayed}</p>
          <p className="text-[10px] text-slate-500">Rounds Played</p>
        </div>
        <div className="bg-white rounded-xl p-3 border border-slate-200 text-center">
          <p className="text-lg font-bold text-emerald-600">${stats.totalRevenue.toLocaleString()}</p>
          <p className="text-[10px] text-slate-500">Total Revenue</p>
        </div>
        <div className="bg-white rounded-xl p-3 border border-slate-200 text-center">
          <p className="text-lg font-bold text-blue-600">{stats.bestConversion}%</p>
          <p className="text-[10px] text-slate-500">Best Conversion</p>
        </div>
        <div className="bg-white rounded-xl p-3 border border-slate-200 text-center">
          <p className="text-lg font-bold text-orange-600">🔥 {bestStreak}</p>
          <p className="text-[10px] text-slate-500">Best Streak</p>
        </div>
      </div>

      <div className="space-y-2">
        {ACHIEVEMENTS.map((ach) => {
          const unlocked = unlockedIds.includes(ach.id)
          return (
            <div
              key={ach.id}
              className={`
                flex items-center gap-3 p-3 rounded-xl border
                ${unlocked ? 'bg-amber-50 border-amber-200' : 'bg-slate-50 border-slate-200 opacity-60'}
              `}
            >
              <span className="text-2xl">{unlocked ? ach.emoji : '🔒'}</span>
              <div className="flex-1">
                <p className="text-sm font-bold text-slate-800">{ach.name}</p>
                <p className="text-xs text-slate-500">{ach.description}</p>
              </div>
              <span className="text-xs font-semibold text-emerald-600">+{ach.xpReward}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

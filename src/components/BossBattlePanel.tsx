import type { BossBattleId } from '../types/game'
import { BOSS_BATTLES } from '../config/bossBattles'

interface BossBattlePanelProps {
  playerLevel: number
  completedBosses: BossBattleId[]
  activeBoss: BossBattleId | null
  onStart: (id: BossBattleId) => void
  onBack: () => void
}

export function BossBattlePanel({
  playerLevel,
  completedBosses,
  activeBoss,
  onStart,
  onBack,
}: BossBattlePanelProps) {
  return (
    <div className="flex-1 overflow-y-auto px-4 pb-32 pt-4">
      <button
        type="button"
        onClick={onBack}
        className="text-sm text-emerald-600 font-medium mb-4"
      >
        ← Back to Build
      </button>

      <h2 className="text-xl font-bold text-slate-800 mb-1">Boss Battles</h2>
      <p className="text-sm text-slate-500 mb-6">
        Face real e-commerce crises. Build a business that survives.
      </p>

      <div className="space-y-4">
        {BOSS_BATTLES.map((boss) => {
          const locked = playerLevel < boss.minLevel
          const completed = completedBosses.includes(boss.id)
          const isActive = activeBoss === boss.id

          return (
            <div
              key={boss.id}
              className={`
                rounded-2xl p-4 border-2 transition-all
                ${locked ? 'opacity-50 border-slate-200 bg-slate-50' : ''}
                ${completed ? 'border-emerald-300 bg-emerald-50/50' : 'border-slate-200 bg-white'}
                ${isActive ? 'ring-2 ring-orange-400' : ''}
              `}
            >
              <div className="flex items-start gap-3">
                <span className="text-3xl">{boss.emoji}</span>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-slate-800">{boss.name}</h3>
                    {completed && <span className="text-xs text-emerald-600 font-semibold">✓ Cleared</span>}
                    {locked && <span className="text-xs text-slate-400">🔒 Level {boss.minLevel}+</span>}
                  </div>
                  <p className="text-sm text-slate-600 mt-1">{boss.description}</p>
                  <p className="text-xs text-orange-600 font-medium mt-2">⚡ {boss.challenge}</p>
                  <p className="text-xs text-slate-400 mt-1">Reward: {boss.xpReward} XP</p>
                </div>
              </div>
              {!locked && !completed && (
                <button
                  type="button"
                  onClick={() => onStart(boss.id)}
                  className="mt-3 w-full py-2.5 bg-orange-500 text-white font-semibold rounded-xl hover:bg-orange-600 transition-colors text-sm"
                >
                  {isActive ? 'Battle Active — Go Build!' : 'Start Battle'}
                </button>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

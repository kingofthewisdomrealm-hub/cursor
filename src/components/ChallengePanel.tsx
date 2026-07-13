import { CHALLENGES } from '../config/challenges'
import { getChallengeProgress } from '../lib/challengeLogic'
import type { GameState } from '../types/game'
import { CheckCircle2, Circle } from 'lucide-react'

interface ChallengePanelProps {
  state: GameState
  onBack: () => void
}

export function ChallengePanel({ state, onBack }: ChallengePanelProps) {
  return (
    <div className="flex-1 overflow-y-auto px-4 pb-24">
      <div className="flex items-center justify-between py-3">
        <button type="button" onClick={onBack} className="text-indigo-600 font-medium text-sm">
          ← Back
        </button>
        <h2 className="text-lg font-bold text-slate-800">Challenges</h2>
        <div className="w-12" />
      </div>
      <div className="space-y-3">
        {CHALLENGES.map((challenge) => {
          const { current, completed } = getChallengeProgress(
            challenge.id,
            state,
            state.discoveredTiles,
          )
          return (
            <div
              key={challenge.id}
              className={`p-4 rounded-2xl border ${
                completed ? 'bg-green-50 border-green-200' : 'bg-white/70 border-slate-200'
              }`}
            >
              <div className="flex items-start gap-3">
                {completed ? (
                  <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                ) : (
                  <Circle className="w-5 h-5 text-slate-300 shrink-0 mt-0.5" />
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-slate-800 text-sm">{challenge.title}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">{challenge.instruction}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs font-medium text-indigo-600">
                      {Math.min(current, challenge.target)} / {challenge.target}
                    </span>
                    <span className="text-xs font-bold text-amber-600">+{challenge.reward} pts</span>
                  </div>
                  <div className="h-1.5 bg-slate-200 rounded-full mt-1.5 overflow-hidden">
                    <div
                      className="h-full bg-indigo-500 rounded-full transition-all"
                      style={{ width: `${(current / challenge.target) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

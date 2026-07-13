import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { Swords, Trophy } from 'lucide-react'
import type { Board } from '../types/game'
import { getTile } from '../config/tiles'
import { calculateSpeakerPower, getStage, getStrongestSpeaker } from '../config/stages'
import { TraitTile } from './TraitTile'

interface StageBattleModalProps {
  stageId: number | null
  board: Board
  points: number
  onComplete: (stageId: number, reward: number) => void
}

export function StageBattleModal({ stageId, board, points, onComplete }: StageBattleModalProps) {
  const [phase, setPhase] = useState<'ready' | 'fighting' | 'won'>('ready')
  const stage = stageId ? getStage(stageId) : null

  if (!stage || !stageId) return null

  const fighterId = getStrongestSpeaker(board)
  const fighter = getTile(fighterId)
  const playerPower = calculateSpeakerPower(board, points)
  const willWin = playerPower >= stage.opponentPower * 0.85

  const startBattle = () => {
    setPhase('fighting')
    setTimeout(() => {
      setPhase('won')
      setTimeout(() => {
        onComplete(stageId, stage.reward)
        setPhase('ready')
      }, 1800)
    }, 2200)
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-slate-950/95 flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          className="w-full max-w-sm rounded-2xl border-2 border-amber-500/50 bg-gradient-to-b from-slate-800 to-slate-900 shadow-2xl overflow-hidden"
        >
          <div className="bg-gradient-to-r from-amber-600 to-yellow-500 px-4 py-2 text-center">
            <p className="text-[10px] font-bold text-amber-100 uppercase tracking-widest">Stage Battle</p>
            <h2 className="text-lg font-black text-white">{stage.name} — {stage.venue}</h2>
          </div>

          <div className="p-4">
            <p className="text-xs text-slate-300 text-center mb-4">{stage.briefing}</p>

            <div className="flex items-center justify-between gap-2 mb-4">
              <div className="flex-1 text-center">
                <div className="w-16 h-16 mx-auto mb-1">
                  <TraitTile tileId={fighterId} compact showLogo />
                </div>
                <p className="text-[10px] font-bold text-amber-300">{fighter.logo}</p>
                <p className="text-[9px] text-slate-400 truncate">{fighter.name}</p>
                <p className="text-xs font-bold text-emerald-400 mt-1">⚡ {playerPower}</p>
              </div>

              <div className="shrink-0">
                {phase === 'fighting' ? (
                  <motion.div
                    animate={{ scale: [1, 1.3, 1], rotate: [0, 10, -10, 0] }}
                    transition={{ repeat: Infinity, duration: 0.4 }}
                    className="text-2xl font-black text-red-500"
                  >
                    VS
                  </motion.div>
                ) : (
                  <span className="text-xl font-black text-red-500">VS</span>
                )}
              </div>

              <div className="flex-1 text-center">
                <div className="w-16 h-16 mx-auto rounded-xl bg-gradient-to-br from-red-900 to-slate-900 border-2 border-red-500/60 flex items-center justify-center mb-1">
                  <span className="text-lg font-black text-red-200">{stage.opponentLogo}</span>
                </div>
                <p className="text-[10px] font-bold text-red-300">{stage.opponentLogo}</p>
                <p className="text-[9px] text-slate-400 truncate">{stage.opponent}</p>
                <p className="text-xs font-bold text-red-400 mt-1">⚡ {stage.opponentPower}</p>
              </div>
            </div>

            {phase === 'fighting' && (
              <div className="h-2 bg-slate-700 rounded-full overflow-hidden mb-4">
                <motion.div
                  className="h-full bg-gradient-to-r from-amber-400 to-yellow-300"
                  initial={{ width: '10%' }}
                  animate={{ width: willWin ? '100%' : '70%' }}
                  transition={{ duration: 2 }}
                />
              </div>
            )}

            {phase === 'won' && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="text-center mb-4"
              >
                <Trophy className="w-10 h-10 text-amber-400 mx-auto mb-1" />
                <p className="text-lg font-black text-amber-300">STAGE CLEARED!</p>
                <p className="text-sm text-emerald-400">+{stage.reward} Points</p>
              </motion.div>
            )}

            {phase === 'ready' && (
              <button
                type="button"
                onClick={startBattle}
                className="w-full py-3 rounded-xl font-bold text-white bg-gradient-to-r from-red-600 to-orange-500 flex items-center justify-center gap-2 shadow-lg border border-red-400/50"
              >
                <Swords className="w-5 h-5" />
                Take the Stage
              </button>
            )}

            {phase === 'fighting' && (
              <p className="text-center text-xs text-amber-300 animate-pulse">Battle in progress...</p>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

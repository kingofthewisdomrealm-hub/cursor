import { useCallback, useMemo, useState } from 'react'
import type { GameState, PointPopup, TileId } from '../types/game'
import { getRankForPoints, getNextRank } from '../config/ranks'
import { getChallengeReward, getNewlyCompletedChallenges } from '../lib/challengeLogic'
import { loadGameState, resetGameState, saveGameState } from '../lib/storage'
import { usePersistedState } from './useLocalStorage'

export function useGameProgress() {
  const [state, setState] = usePersistedState(loadGameState, saveGameState)
  const [popups, setPopups] = useState<PointPopup[]>([])
  const [lastRankId, setLastRankId] = useState(() => getRankForPoints(state.points).id)

  const rank = useMemo(() => getRankForPoints(state.points), [state.points])
  const nextRank = useMemo(() => getNextRank(state.points), [state.points])

  const addPopup = useCallback((amount: number, label = 'Communication Points') => {
    const popup: PointPopup = { id: `popup-${Date.now()}-${Math.random()}`, amount, label }
    setPopups((prev) => [...prev, popup])
    setTimeout(() => {
      setPopups((prev) => prev.filter((p) => p.id !== popup.id))
    }, 1800)
  }, [])

  const addPoints = useCallback(
    (amount: number, label?: string) => {
      if (amount <= 0) return
      setState((prev) => {
        const newPoints = prev.points + amount
        const newRank = getRankForPoints(newPoints)
        if (newRank.id > lastRankId) {
          setLastRankId(newRank.id)
        }
        return { ...prev, points: newPoints }
      })
      addPopup(amount, label)
    },
    [addPopup, lastRankId, setState],
  )

  const discoverTile = useCallback(
    (tileId: TileId) => {
      setState((prev) => {
        if (prev.discoveredTiles.includes(tileId)) return prev
        return { ...prev, discoveredTiles: [...prev.discoveredTiles, tileId] }
      })
    },
    [setState],
  )

  const completeChallenges = useCallback(
    (gameState: GameState) => {
      const newlyCompleted = getNewlyCompletedChallenges(gameState, gameState.discoveredTiles)
      if (newlyCompleted.length === 0) return { reward: 0, ids: [] as string[] }

      let totalReward = 0
      for (const id of newlyCompleted) {
        totalReward += getChallengeReward(id)
      }

      setState((prev) => ({
        ...prev,
        completedChallenges: [...prev.completedChallenges, ...newlyCompleted],
        points: prev.points + totalReward,
      }))

      for (const id of newlyCompleted) {
        addPopup(getChallengeReward(id), 'Challenge Complete')
      }

      return { reward: totalReward, ids: newlyCompleted }
    },
    [addPopup, setState],
  )

  const completeLearningChallenge = useCallback(
    (tileId: TileId) => {
      setState((prev) => {
        if (prev.completedLearningChallenges.includes(tileId)) return prev
        const next: GameState = {
          ...prev,
          completedLearningChallenges: [...prev.completedLearningChallenges, tileId],
          stats: {
            ...prev.stats,
            learningChallengesCompleted: prev.stats.learningChallengesCompleted + 1,
          },
        }
        return next
      })
      addPoints(50, 'Challenge Complete')
    },
    [addPoints, setState],
  )

  const updateSettings = useCallback(
    (settings: Partial<GameState['settings']>) => {
      setState((prev) => ({ ...prev, settings: { ...prev.settings, ...settings } }))
    },
    [setState],
  )

  const resetProgress = useCallback(() => {
    const fresh = resetGameState()
    setState(fresh)
    setLastRankId(1)
  }, [setState])

  const completeStage = useCallback(
    (stageId: number, reward: number) => {
      setState((prev) => {
        if (prev.clearedStages.includes(stageId)) return prev
        return {
          ...prev,
          clearedStages: [...prev.clearedStages, stageId],
          points: prev.points + reward,
        }
      })
      addPopup(reward, 'Stage Cleared')
    },
    [addPopup, setState],
  )

  return {
    state,
    setState,
    rank,
    nextRank,
    popups,
    addPoints,
    addPopup,
    discoverTile,
    completeChallenges,
    completeLearningChallenge,
    updateSettings,
    resetProgress,
    completeStage,
    lastRankId,
    setLastRankId,
  }
}

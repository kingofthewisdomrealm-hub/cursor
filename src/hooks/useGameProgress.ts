import { useCallback, useMemo, useState } from 'react'
import type { BossBattleId, Card, FilledSlots, SimulationResult, SlotType, XpPopup } from '../types/game'
import { EMPTY_SLOTS } from '../types/game'
import { getLevelForXp, getNextLevel, getActiveSlotsForLevel } from '../config/levels'
import { getAvailableCards } from '../config/cards'
import { checkNewAchievements, calculateNetXp } from '../lib/achievements'
import { runSimulation } from '../lib/simulation'
import { loadGameState, resetGameState, saveGameState } from '../lib/storage'
import { usePersistedState } from './useLocalStorage'
import { getBossBattle } from '../config/bossBattles'

export function useGameProgress() {
  const [state, setState] = usePersistedState(loadGameState, saveGameState)
  const [popups, setPopups] = useState<XpPopup[]>([])
  const [slots, setSlots] = useState<FilledSlots>({ ...EMPTY_SLOTS })
  const [selectedCard, setSelectedCard] = useState<Card | null>(null)
  const [lastResult, setLastResult] = useState<SimulationResult | null>(null)
  const [activeBoss, setActiveBoss] = useState<BossBattleId | null>(null)
  const [showResults, setShowResults] = useState(false)

  const level = useMemo(() => getLevelForXp(state.xp), [state.xp])
  const nextLevel = useMemo(() => getNextLevel(state.xp), [state.xp])
  const activeSlotTypes = useMemo(() => getActiveSlotsForLevel(level.id), [level.id])
  const availableCards = useMemo(
    () => getAvailableCards(level.id, state.unlockedCards),
    [level.id, state.unlockedCards],
  )

  const addPopup = useCallback((amount: number, label: string, positive = true) => {
    const popup: XpPopup = {
      id: `popup-${Date.now()}-${Math.random()}`,
      amount,
      label,
      positive,
    }
    setPopups((prev) => [...prev, popup])
    setTimeout(() => {
      setPopups((prev) => prev.filter((p) => p.id !== popup.id))
    }, 2000)
  }, [])

  const allSlotsFilled = useMemo(() => {
    return activeSlotTypes.every((slot) => slots[slot] !== null)
  }, [activeSlotTypes, slots])

  const placeCard = useCallback(
    (slotType: SlotType, card: Card | null) => {
      if (card && card.slotType !== slotType) return
      setSlots((prev) => {
        const next = { ...prev, [slotType]: card }
        return next
      })
      setSelectedCard(null)
    },
    [],
  )

  const handleSlotTap = useCallback(
    (slotType: SlotType) => {
      if (selectedCard) {
        placeCard(slotType, selectedCard)
      } else if (slots[slotType]) {
        setSlots((prev) => ({ ...prev, [slotType]: null }))
      }
    },
    [selectedCard, slots, placeCard],
  )

  const handleCardSelect = useCallback((card: Card) => {
    setSelectedCard((prev) => (prev?.id === card.id ? null : card))
  }, [])

  const clearBoard = useCallback(() => {
    setSlots({ ...EMPTY_SLOTS })
    setSelectedCard(null)
    setLastResult(null)
    setShowResults(false)
  }, [])

  const runBusinessSimulation = useCallback(() => {
    if (!allSlotsFilled) return

    const boss = activeBoss ? getBossBattle(activeBoss) : null
    const result = runSimulation(slots, {
      activeSlots: activeSlotTypes,
      bossBattle: boss ?? null,
    })

    const netXp = calculateNetXp(result)
    const newAchievements = checkNewAchievements(state, result)
    const achievementXp = newAchievements.reduce((s, a) => s + a.xpReward, 0)
    const totalXpGain = netXp + achievementXp

    const today = new Date().toISOString().slice(0, 10)
    const isStreakDay = state.lastPlayedDate === today || state.lastPlayedDate === null
    const newStreak = result.isSuccess
      ? isStreakDay
        ? state.streak + 1
        : 1
      : 0

    const usedCardIds = activeSlotTypes.map((s) => slots[s]?.id).filter(Boolean) as string[]
    const newUnlocks = usedCardIds.filter((id) => !state.unlockedCards.includes(id))

    setState((prev) => ({
      ...prev,
      xp: Math.max(0, prev.xp + totalXpGain),
      streak: newStreak,
      bestStreak: Math.max(prev.bestStreak, newStreak),
      unlockedCards: [...new Set([...prev.unlockedCards, ...newUnlocks])],
      unlockedAchievements: [
        ...prev.unlockedAchievements,
        ...newAchievements.map((a) => a.id),
      ],
      completedBossBattles:
        boss && result.isSuccess
          ? [...new Set([...prev.completedBossBattles, boss.id])]
          : prev.completedBossBattles,
      stats: {
        ...prev.stats,
        roundsPlayed: prev.stats.roundsPlayed + 1,
        totalRevenue: prev.stats.totalRevenue + result.revenue,
        bestConversion: Math.max(prev.stats.bestConversion, result.conversionRate),
        bossBattlesWon:
          boss && result.isSuccess
            ? prev.stats.bossBattlesWon + 1
            : prev.stats.bossBattlesWon,
        perfectRounds:
          result.overallFit >= 90
            ? prev.stats.perfectRounds + 1
            : prev.stats.perfectRounds,
      },
      lastPlayedDate: today,
    }))

    if (netXp > 0) addPopup(netXp, 'XP Earned')
    if (result.xpLost > 0) addPopup(result.xpLost, 'XP Lost', false)
    for (const ach of newAchievements) {
      addPopup(ach.xpReward, ach.name)
    }

    setLastResult(result)
    setShowResults(true)
  }, [activeBoss, activeSlotTypes, allSlotsFilled, addPopup, setState, slots, state])

  const startBossBattle = useCallback((bossId: BossBattleId) => {
    setActiveBoss(bossId)
    clearBoard()
  }, [clearBoard])

  const endBossBattle = useCallback(() => {
    setActiveBoss(null)
    clearBoard()
  }, [clearBoard])

  const updateSettings = useCallback(
    (settings: Partial<typeof state.settings>) => {
      setState((prev) => ({ ...prev, settings: { ...prev.settings, ...settings } }))
    },
    [setState],
  )

  const resetProgress = useCallback(() => {
    const fresh = resetGameState()
    setState(fresh)
    clearBoard()
    setActiveBoss(null)
  }, [clearBoard, setState])

  return {
    state,
    level,
    nextLevel,
    activeSlotTypes,
    availableCards,
    slots,
    selectedCard,
    lastResult,
    showResults,
    allSlotsFilled,
    activeBoss,
    popups,
    placeCard,
    handleSlotTap,
    handleCardSelect,
    clearBoard,
    runBusinessSimulation,
    startBossBattle,
    endBossBattle,
    setShowResults,
    updateSettings,
    resetProgress,
  }
}

import type { GameState } from '../types/game'
import { STARTER_CARD_IDS } from '../config/cards'

const STORAGE_KEY = 'commerce-architect-save-v1'

export const DEFAULT_GAME_STATE: GameState = {
  xp: 0,
  playerLevel: 1,
  streak: 0,
  bestStreak: 0,
  unlockedCards: [...STARTER_CARD_IDS],
  unlockedAchievements: [],
  completedBossBattles: [],
  stats: {
    roundsPlayed: 0,
    totalRevenue: 0,
    bestConversion: 0,
    bossBattlesWon: 0,
    perfectRounds: 0,
  },
  settings: {
    soundEnabled: true,
    animationsEnabled: true,
  },
  lastPlayedDate: null,
}

export function loadGameState(): GameState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { ...DEFAULT_GAME_STATE }
    const parsed = JSON.parse(raw) as GameState
    return { ...DEFAULT_GAME_STATE, ...parsed, settings: { ...DEFAULT_GAME_STATE.settings, ...parsed.settings } }
  } catch {
    return { ...DEFAULT_GAME_STATE }
  }
}

export function saveGameState(state: GameState): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

export function resetGameState(): GameState {
  localStorage.removeItem(STORAGE_KEY)
  return { ...DEFAULT_GAME_STATE }
}

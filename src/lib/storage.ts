import type { GameState } from '../types/game'
import { createInitialState } from './boardLogic'

const STORAGE_KEY = 'communicator-merge-save'

export function loadGameState(): GameState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return createInitialState()
    const parsed = JSON.parse(raw) as GameState
    return {
      ...createInitialState(),
      ...parsed,
      settings: { ...createInitialState().settings, ...parsed.settings },
      stats: { ...createInitialState().stats, ...parsed.stats },
    }
  } catch {
    return createInitialState()
  }
}

export function saveGameState(state: GameState): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

export function resetGameState(): GameState {
  localStorage.removeItem(STORAGE_KEY)
  return createInitialState()
}

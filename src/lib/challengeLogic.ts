import { CHALLENGES } from '../config/challenges'
import type { GameState, TileId } from '../types/game'

export function getChallengeProgress(
  challengeId: string,
  state: GameState,
  discoveredTiles: TileId[],
): { current: number; completed: boolean } {
  const def = CHALLENGES.find((c) => c.id === challengeId)
  if (!def) return { current: 0, completed: false }
  if (state.completedChallenges.includes(challengeId)) {
    return { current: def.target, completed: true }
  }

  let current = 0
  switch (def.statKey) {
    case 'totalMerges':
      current = state.stats.totalMerges
      break
    case 'sharpnessMerges':
      current = state.stats.sharpnessMerges
      break
    case 'learningChallengesCompleted':
      current = state.stats.learningChallengesCompleted
      break
    case 'crossMerges':
      current = state.stats.crossMerges
      break
    case 'points':
      current = state.points
      break
    case 'hasStrategist':
      current = discoveredTiles.includes('strategist') ? 1 : 0
      break
    case 'hasCatalyst':
      current = discoveredTiles.includes('catalyst') ? 1 : 0
      break
    case 'hasLegendary':
      current = state.hasLegendary ? 1 : 0
      break
  }

  return { current: Math.min(current, def.target), completed: current >= def.target }
}

export function getNewlyCompletedChallenges(state: GameState, discoveredTiles: TileId[]): string[] {
  return CHALLENGES.filter((c) => {
    if (state.completedChallenges.includes(c.id)) return false
    const { completed } = getChallengeProgress(c.id, state, discoveredTiles)
    return completed
  }).map((c) => c.id)
}

export function getChallengeReward(challengeId: string): number {
  return CHALLENGES.find((c) => c.id === challengeId)?.reward ?? 0
}

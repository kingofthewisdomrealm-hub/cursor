import type { GameState, SimulationResult } from '../types/game'
import type { Achievement } from '../types/game'

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first-sale',
    name: 'First Sale',
    description: 'Generate any revenue in a simulation',
    emoji: '💰',
    xpReward: 50,
    check: (_state, result) => (result?.revenue ?? 0) > 0,
  },
  {
    id: 'product-market-pro',
    name: 'Product-Market Pro',
    description: 'Score 80%+ product-market fit',
    emoji: '🎯',
    xpReward: 75,
    check: (_state, result) => (result?.breakdown.productMarket ?? 0) >= 80,
  },
  {
    id: 'conversion-king',
    name: 'Conversion King',
    description: 'Hit 5%+ conversion rate',
    emoji: '📈',
    xpReward: 100,
    check: (_state, result) => (result?.conversionRate ?? 0) >= 5,
  },
  {
    id: 'five-streak',
    name: 'Hot Streak',
    description: 'Win 5 rounds in a row',
    emoji: '🔥',
    xpReward: 150,
    check: (state) => state.streak >= 5,
  },
  {
    id: 'ten-streak',
    name: 'Unstoppable',
    description: 'Win 10 rounds in a row',
    emoji: '⚡',
    xpReward: 300,
    check: (state) => state.streak >= 10,
  },
  {
    id: 'perfect-round',
    name: 'Perfect Round',
    description: 'Score 90%+ overall fit',
    emoji: '⭐',
    xpReward: 200,
    check: (_state, result) => (result?.overallFit ?? 0) >= 90,
  },
  {
    id: 'big-revenue',
    name: 'Six Figures',
    description: 'Generate $10,000+ revenue in one round',
    emoji: '🏆',
    xpReward: 250,
    check: (_state, result) => (result?.revenue ?? 0) >= 10000,
  },
  {
    id: 'loyal-customers',
    name: 'Loyal Following',
    description: 'Get 50+ repeat customers',
    emoji: '❤️',
    xpReward: 125,
    check: (_state, result) => (result?.repeatCustomers ?? 0) >= 50,
  },
  {
    id: 'veteran',
    name: 'Veteran Architect',
    description: 'Play 25 rounds',
    emoji: '🏗️',
    xpReward: 200,
    check: (state) => state.stats.roundsPlayed >= 25,
  },
  {
    id: 'boss-slayer',
    name: 'Boss Slayer',
    description: 'Complete all boss battles',
    emoji: '👑',
    xpReward: 500,
    check: (state) => state.completedBossBattles.length >= 3,
  },
]

export function checkNewAchievements(
  state: GameState,
  result?: SimulationResult,
): Achievement[] {
  return ACHIEVEMENTS.filter(
    (a) => !state.unlockedAchievements.includes(a.id) && a.check(state, result),
  )
}

export function calculateNetXp(result: SimulationResult): number {
  return Math.max(0, result.xpGained - result.xpLost)
}

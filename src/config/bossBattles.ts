import type { BossBattle } from '../types/game'

export const BOSS_BATTLES: BossBattle[] = [
  {
    id: 'black-friday',
    name: 'Black Friday',
    description: 'Massive traffic floods your store. Can your funnel handle the surge?',
    emoji: '🛍️',
    challenge: 'Traffic is 5× normal. Conversion must stay above 2% to survive.',
    modifiers: {
      trafficMultiplier: 5,
      conversionPenalty: 0.15,
    },
    xpReward: 300,
    minLevel: 4,
  },
  {
    id: 'competitor-attack',
    name: 'Competitor Attack',
    description: 'A rival launches a better offer. Adapt or lose market share.',
    emoji: '⚔️',
    challenge: 'Competitor offers 40% off. Your offer must counter or pivot.',
    modifiers: {
      competitorOfferBonus: 40,
      conversionPenalty: 0.25,
    },
    xpReward: 350,
    minLevel: 5,
  },
  {
    id: 'ad-ban',
    name: 'Ad Ban',
    description: 'Your primary traffic source disappears overnight.',
    emoji: '🚫',
    challenge: 'Social media ads are banned. Find another channel that works.',
    modifiers: {
      blockedAdTags: ['social', 'video', 'viral'],
      trafficMultiplier: 0.3,
    },
    xpReward: 400,
    minLevel: 5,
  },
]

export function getBossBattle(id: string) {
  return BOSS_BATTLES.find((b) => b.id === id)
}

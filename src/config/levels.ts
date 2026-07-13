import type { LevelConfig, SlotType } from '../types/game'

export const LEVELS: LevelConfig[] = [
  {
    id: 1,
    name: 'Product-Market Fit',
    subtitle: 'Match products to the right audience',
    activeSlots: ['product', 'market'],
    xpToUnlock: 0,
  },
  {
    id: 2,
    name: 'Problem Match',
    subtitle: 'Identify real customer pain points',
    activeSlots: ['product', 'market', 'problem'],
    xpToUnlock: 150,
  },
  {
    id: 3,
    name: 'Messaging',
    subtitle: 'Craft hooks that resonate',
    activeSlots: ['product', 'market', 'problem', 'hook'],
    xpToUnlock: 400,
  },
  {
    id: 4,
    name: 'Offer Design',
    subtitle: 'Build irresistible deals',
    activeSlots: ['product', 'market', 'problem', 'hook', 'offer'],
    xpToUnlock: 800,
  },
  {
    id: 5,
    name: 'Traffic Sources',
    subtitle: 'Drive the right visitors',
    activeSlots: ['product', 'market', 'problem', 'hook', 'offer', 'ad'],
    xpToUnlock: 1400,
  },
  {
    id: 6,
    name: 'Funnel Architecture',
    subtitle: 'Optimize the full customer journey',
    activeSlots: ['product', 'market', 'problem', 'hook', 'offer', 'ad', 'landing'],
    xpToUnlock: 2200,
  },
]

export function getLevelForXp(xp: number): LevelConfig {
  let current = LEVELS[0]
  for (const level of LEVELS) {
    if (xp >= level.xpToUnlock) current = level
    else break
  }
  return current
}

export function getNextLevel(xp: number): LevelConfig | null {
  const current = getLevelForXp(xp)
  return LEVELS.find((l) => l.id === current.id + 1) ?? null
}

export function getLevelProgress(xp: number): number {
  const current = getLevelForXp(xp)
  const next = getNextLevel(xp)
  if (!next) return 100
  const range = next.xpToUnlock - current.xpToUnlock
  const progress = xp - current.xpToUnlock
  return Math.min(100, Math.round((progress / range) * 100))
}

export function getActiveSlotsForLevel(levelId: number): SlotType[] {
  return LEVELS.find((l) => l.id === levelId)?.activeSlots ?? LEVELS[0].activeSlots
}

export const SLOT_LABELS: Record<SlotType, string> = {
  product: 'Product',
  market: 'Market',
  problem: 'Problem',
  hook: 'Hook',
  offer: 'Offer',
  ad: 'Ad',
  landing: 'Landing Page',
}

export const SLOT_EMOJIS: Record<SlotType, string> = {
  product: '📦',
  market: '👥',
  problem: '🎯',
  hook: '💬',
  offer: '🏷️',
  ad: '📣',
  landing: '🌐',
}

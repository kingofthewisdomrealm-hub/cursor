export type SlotType =
  | 'product'
  | 'market'
  | 'problem'
  | 'hook'
  | 'offer'
  | 'ad'
  | 'landing'

export type ViewId = 'play' | 'collection' | 'achievements' | 'boss'

export type BossBattleId = 'black-friday' | 'competitor-attack' | 'ad-ban'

export interface Card {
  id: string
  name: string
  description: string
  slotType: SlotType
  tags: string[]
  strength: number
  /** Bonus when paired with cards that have these tags */
  affinities: Record<string, number>
  unlockLevel: number
  emoji: string
}

export interface LevelConfig {
  id: number
  name: string
  subtitle: string
  activeSlots: SlotType[]
  xpToUnlock: number
}

export interface FilledSlots {
  product: Card | null
  market: Card | null
  problem: Card | null
  hook: Card | null
  offer: Card | null
  ad: Card | null
  landing: Card | null
}

export interface FitBreakdown {
  productMarket: number
  problemMatch: number
  messaging: number
  offer: number
  traffic: number
  funnel: number
}

export interface SimulationResult {
  revenue: number
  profit: number
  conversionRate: number
  customerSatisfaction: number
  overallFit: number
  breakdown: FitBreakdown
  feedback: string[]
  xpGained: number
  xpLost: number
  isSuccess: boolean
  repeatCustomers: number
}

export interface BossBattle {
  id: BossBattleId
  name: string
  description: string
  emoji: string
  challenge: string
  modifiers: {
    trafficMultiplier?: number
    conversionPenalty?: number
    blockedAdTags?: string[]
    competitorOfferBonus?: number
  }
  xpReward: number
  minLevel: number
}

export interface Achievement {
  id: string
  name: string
  description: string
  emoji: string
  xpReward: number
  check: (state: GameState, result?: SimulationResult) => boolean
}

export interface GameSettings {
  soundEnabled: boolean
  animationsEnabled: boolean
}

export interface GameStats {
  roundsPlayed: number
  totalRevenue: number
  bestConversion: number
  bossBattlesWon: number
  perfectRounds: number
}

export interface XpPopup {
  id: string
  amount: number
  label: string
  positive: boolean
}

export interface GameState {
  xp: number
  playerLevel: number
  streak: number
  bestStreak: number
  unlockedCards: string[]
  unlockedAchievements: string[]
  completedBossBattles: BossBattleId[]
  stats: GameStats
  settings: GameSettings
  lastPlayedDate: string | null
}

export const ALL_SLOTS: SlotType[] = [
  'product',
  'market',
  'problem',
  'hook',
  'offer',
  'ad',
  'landing',
]

export const EMPTY_SLOTS: FilledSlots = {
  product: null,
  market: null,
  problem: null,
  hook: null,
  offer: null,
  ad: null,
  landing: null,
}

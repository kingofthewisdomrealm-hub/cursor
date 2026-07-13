export type TileCategory =
  | 'sharpness'
  | 'enthusiasm'
  | 'authority'
  | 'cross'
  | 'legendary'

export type AnimationType =
  | 'standard'
  | 'cross-glow'
  | 'spotlight'
  | 'idea-particles'
  | 'legendary'

export type TileId =
  | 'sharpness'
  | 'analyst'
  | 'strategist'
  | 'visionary'
  | 'enthusiasm'
  | 'motivator'
  | 'influencer'
  | 'catalyst'
  | 'authority'
  | 'professional'
  | 'expert'
  | 'master'
  | 'inspirational_leader'
  | 'industry_icon'
  | 'thought_leader'
  | 'legendary_communicator'

export interface TileConfig {
  id: TileId
  name: string
  icon: string
  category: TileCategory
  tier: number
  color: string
  bgClass: string
  borderClass: string
  description: string
  principle: string
  challenge: string
  pointsValue: number
  mergeResult?: TileId
  crossMergeRecipes?: Array<{ pair: [TileId, TileId]; result: TileId }>
  animationType: AnimationType
}

export interface TileInstance {
  instanceId: string
  tileId: TileId
}

export type Board = (TileInstance | null)[]

export interface PointPopup {
  id: string
  amount: number
  label: string
}

export interface GameSettings {
  soundEnabled: boolean
  animationsEnabled: boolean
}

export interface ChallengeProgress {
  id: string
  current: number
  completed: boolean
}

export interface GameState {
  board: Board
  points: number
  discoveredTiles: TileId[]
  completedChallenges: string[]
  completedLearningChallenges: TileId[]
  hasLegendary: boolean
  settings: GameSettings
  stats: {
    totalMerges: number
    sharpnessMerges: number
    learningChallengesCompleted: number
    crossMerges: number
  }
}

export type ViewId = 'game' | 'collection' | 'challenges' | 'settings'

export interface MergeResult {
  success: boolean
  newTile?: TileInstance
  pointsEarned: number
  discoveryBonus: number
  isCrossMerge: boolean
  isAscensionTier: boolean
  mergedTileId?: TileId
}

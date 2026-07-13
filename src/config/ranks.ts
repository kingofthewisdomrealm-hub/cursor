export interface Rank {
  id: number
  name: string
  minPoints: number
  unlock: string
}

export const RANKS: Rank[] = [
  { id: 1, name: 'Beginner', minPoints: 0, unlock: 'Starting board theme' },
  { id: 2, name: 'Clear Speaker', minPoints: 100, unlock: 'Soft blue board background' },
  { id: 3, name: 'Persuasive Communicator', minPoints: 500, unlock: 'Tile glow effects' },
  { id: 4, name: 'Influential Leader', minPoints: 1500, unlock: 'Warm gradient board theme' },
  { id: 5, name: 'Communication Architect', minPoints: 3500, unlock: 'Premium tile borders' },
  { id: 6, name: 'Master Communicator', minPoints: 7000, unlock: 'Faster trait generation' },
  { id: 7, name: 'Legendary Communicator', minPoints: 15000, unlock: 'Golden board aura' },
]

export function getRankForPoints(points: number): Rank {
  let current = RANKS[0]
  for (const rank of RANKS) {
    if (points >= rank.minPoints) current = rank
  }
  return current
}

export function getNextRank(points: number): Rank | null {
  const current = getRankForPoints(points)
  return RANKS.find((r) => r.id === current.id + 1) ?? null
}

export function getRankProgress(points: number): number {
  const current = getRankForPoints(points)
  const next = getNextRank(points)
  if (!next) return 100
  const range = next.minPoints - current.minPoints
  const progress = points - current.minPoints
  return Math.min(100, Math.round((progress / range) * 100))
}

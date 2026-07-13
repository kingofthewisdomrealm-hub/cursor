export interface Rank {
  id: number
  name: string
  minPoints: number
  unlock: string
  zone: string
}

export const RANKS: Rank[] = [
  { id: 1, name: 'Recruit Speaker', minPoints: 0, unlock: 'Deploy basic speakers', zone: 'Training Camp' },
  { id: 2, name: 'Clear Voice', minPoints: 100, unlock: 'Stage 1 unlocked', zone: 'Open Mic Alley' },
  { id: 3, name: 'Crowd Charmer', minPoints: 500, unlock: 'Speaker glow effects', zone: 'Town Hall' },
  { id: 4, name: 'Stage Captain', minPoints: 1500, unlock: 'Elite speaker borders', zone: 'Conference Hall' },
  { id: 5, name: 'Summit Commander', minPoints: 3500, unlock: 'Premium stage theme', zone: 'Summit Stage' },
  { id: 6, name: 'Arena Master', minPoints: 7000, unlock: 'Faster deployments', zone: 'Global Arena' },
  { id: 7, name: 'Legendary Orator', minPoints: 15000, unlock: 'Golden stage aura', zone: 'Legendary Podium' },
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

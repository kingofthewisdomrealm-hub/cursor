import type { Board, TileId } from '../types/game'
import { getTile } from '../config/tiles'

export interface Stage {
  id: number
  rankUnlocked: number
  name: string
  venue: string
  opponent: string
  opponentLogo: string
  opponentPower: number
  reward: number
  briefing: string
}

export const STAGES: Stage[] = [
  {
    id: 1,
    rankUnlocked: 2,
    name: 'Stage 1',
    venue: 'Open Mic Alley',
    opponent: 'Nervous Host',
    opponentLogo: 'NH',
    opponentPower: 20,
    reward: 75,
    briefing: 'Face the host and claim your first spotlight.',
  },
  {
    id: 2,
    rankUnlocked: 3,
    name: 'Stage 2',
    venue: 'Town Hall Steps',
    opponent: 'Skeptical Crowd',
    opponentLogo: 'SK',
    opponentPower: 45,
    reward: 100,
    briefing: 'Convince a doubtful audience to listen.',
  },
  {
    id: 3,
    rankUnlocked: 4,
    name: 'Stage 3',
    venue: 'Conference Hall B',
    opponent: 'Panel Moderator',
    opponentLogo: 'PM',
    opponentPower: 80,
    reward: 150,
    briefing: 'Outshine the moderator under bright lights.',
  },
  {
    id: 4,
    rankUnlocked: 5,
    name: 'Stage 4',
    venue: 'Summit Main Stage',
    opponent: 'Rival Keynoter',
    opponentLogo: 'RK',
    opponentPower: 130,
    reward: 200,
    briefing: 'Win the headline slot against a seasoned rival.',
  },
  {
    id: 5,
    rankUnlocked: 6,
    name: 'Stage 5',
    venue: 'Global Arena',
    opponent: 'Media Titan',
    opponentLogo: 'MT',
    opponentPower: 200,
    reward: 300,
    briefing: 'Command the arena before millions watching.',
  },
  {
    id: 6,
    rankUnlocked: 7,
    name: 'Stage 6',
    venue: 'Legendary Podium',
    opponent: 'The Silence',
    opponentLogo: '??',
    opponentPower: 300,
    reward: 500,
    briefing: 'The final stage. Make the world remember your voice.',
  },
]

export function getStage(id: number): Stage | undefined {
  return STAGES.find((s) => s.id === id)
}

export function getCurrentStageNumber(clearedStages: number[]): number {
  return clearedStages.length + 1
}

export function calculateSpeakerPower(board: Board, points: number): number {
  let power = 0
  for (const cell of board) {
    if (cell) {
      const tile = getTile(cell.tileId)
      power += tile.tier * 18
    }
  }
  power += Math.floor(points / 40)
  return Math.max(power, 10)
}

export function getStrongestSpeaker(board: Board): TileId {
  let best: { id: TileId; tier: number } | null = null
  for (const cell of board) {
    if (!cell) continue
    const tile = getTile(cell.tileId)
    if (!best || tile.tier > best.tier) {
      best = { id: cell.tileId, tier: tile.tier }
    }
  }
  return best?.id ?? 'sharpness'
}

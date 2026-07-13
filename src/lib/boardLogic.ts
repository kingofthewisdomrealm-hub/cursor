import type { Board, GameState, MergeResult, TileId, TileInstance } from '../types/game'
import { BASIC_TILE_IDS, getTile } from '../config/tiles'

export const BOARD_COLS = 5
export const BOARD_ROWS = 7
export const BOARD_SIZE = BOARD_COLS * BOARD_ROWS

export function createEmptyBoard(): Board {
  return Array.from({ length: BOARD_SIZE }, () => null)
}

export function indexToPosition(index: number): { row: number; col: number } {
  return { row: Math.floor(index / BOARD_COLS), col: index % BOARD_COLS }
}

export function positionToIndex(row: number, col: number): number {
  return row * BOARD_COLS + col
}

export function createTileInstance(tileId: TileId): TileInstance {
  return {
    instanceId: `${tileId}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    tileId,
  }
}

export function findEmptyCells(board: Board): number[] {
  return board.reduce<number[]>((acc, cell, i) => {
    if (!cell) acc.push(i)
    return acc
  }, [])
}

export function isBoardFull(board: Board): boolean {
  return board.every((cell) => cell !== null)
}

export function getRandomBasicTile(): TileId {
  return BASIC_TILE_IDS[Math.floor(Math.random() * BASIC_TILE_IDS.length)]
}

function recipeMatches(a: TileId, b: TileId, pair: [TileId, TileId]): boolean {
  const [x, y] = pair
  return (a === x && b === y) || (a === y && b === x)
}

export function getCrossMergeResult(a: TileId, b: TileId): TileId | null {
  const tileA = getTile(a)
  const recipes = tileA.crossMergeRecipes ?? []
  for (const recipe of recipes) {
    if (recipeMatches(a, b, recipe.pair)) return recipe.result
  }
  const tileB = getTile(b)
  const recipesB = tileB.crossMergeRecipes ?? []
  for (const recipe of recipesB) {
    if (recipeMatches(a, b, recipe.pair)) return recipe.result
  }
  return null
}

export function canMergeTiles(a: TileId, b: TileId): boolean {
  if (a === b) {
    const tile = getTile(a)
    return Boolean(tile.mergeResult)
  }
  return getCrossMergeResult(a, b) !== null
}

export function getMergeOutput(a: TileId, b: TileId): TileId | null {
  if (a === b) {
    return getTile(a).mergeResult ?? null
  }
  return getCrossMergeResult(a, b)
}

export function getMergePoints(resultId: TileId, isCrossMerge: boolean): number {
  const tile = getTile(resultId)
  if (tile.category === 'legendary') return 1000
  if (isCrossMerge) return 250
  switch (tile.tier) {
    case 2:
      return 10
    case 3:
      return 25
    case 4:
      return 50
    default:
      return 10
  }
}

export function moveTile(board: Board, fromIndex: number, toIndex: number): Board {
  if (fromIndex === toIndex || board[fromIndex] === null || board[toIndex] !== null) {
    return board
  }
  const next = [...board]
  next[toIndex] = next[fromIndex]
  next[fromIndex] = null
  return next
}

export function swapTiles(board: Board, indexA: number, indexB: number): Board {
  const next = [...board]
  ;[next[indexA], next[indexB]] = [next[indexB], next[indexA]]
  return next
}

export function mergeTiles(
  board: Board,
  indexA: number,
  indexB: number,
  discoveredTiles: TileId[],
): { board: Board; result: MergeResult } {
  const tileA = board[indexA]
  const tileB = board[indexB]
  if (!tileA || !tileB) {
    return { board, result: { success: false, pointsEarned: 0, discoveryBonus: 0, isCrossMerge: false, isAscensionTier: false } }
  }

  const outputId = getMergeOutput(tileA.tileId, tileB.tileId)
  if (!outputId) {
    return { board, result: { success: false, pointsEarned: 0, discoveryBonus: 0, isCrossMerge: false, isAscensionTier: false } }
  }

  const isCrossMerge = tileA.tileId !== tileB.tileId
  const newTile = createTileInstance(outputId)
  const next = [...board]
  next[indexA] = null
  next[indexB] = newTile

  const isNewDiscovery = !discoveredTiles.includes(outputId)
  const pointsEarned = getMergePoints(outputId, isCrossMerge)
  const discoveryBonus = isNewDiscovery ? 100 : 0

  return {
    board: next,
    result: {
      success: true,
      newTile,
      pointsEarned,
      discoveryBonus,
      isCrossMerge,
      isAscensionTier: outputId === 'legendary_communicator',
      mergedTileId: outputId,
    },
  }
}

export function canAscend(board: Board): boolean {
  const required: TileId[] = ['inspirational_leader', 'industry_icon', 'thought_leader']
  const present = new Set(board.filter(Boolean).map((t) => t!.tileId))
  return required.every((id) => present.has(id))
}

export function performAscension(board: Board): { board: Board; centerIndex: number } | null {
  if (!canAscend(board)) return null

  const required: TileId[] = ['inspirational_leader', 'industry_icon', 'thought_leader']
  const indices: number[] = []
  const next = [...board]

  for (const id of required) {
    const idx = next.findIndex((cell) => cell?.tileId === id)
    if (idx === -1) return null
    indices.push(idx)
    next[idx] = null
  }

  const centerIndex = Math.floor(BOARD_SIZE / 2)
  next[centerIndex] = createTileInstance('legendary_communicator')

  return { board: next, centerIndex }
}

export function createInitialState(): GameState {
  return {
    board: createEmptyBoard(),
    points: 0,
    discoveredTiles: [...BASIC_TILE_IDS],
    completedChallenges: [],
    completedLearningChallenges: [],
    hasLegendary: false,
    settings: { soundEnabled: true, animationsEnabled: true },
    stats: {
      totalMerges: 0,
      sharpnessMerges: 0,
      learningChallengesCompleted: 0,
      crossMerges: 0,
    },
  }
}

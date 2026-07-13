import { useCallback, useRef, useState } from 'react'
import type { TileId } from '../types/game'
import {
  BOARD_SIZE,
  canMergeTiles,
  createTileInstance,
  findEmptyCells,
  getRandomBasicTile,
  isBoardFull,
  mergeTiles,
  moveTile,
  performAscension,
  swapTiles,
} from '../lib/boardLogic'
import { getTile } from '../config/tiles'
import type { useGameProgress } from './useGameProgress'

import type { SoundType } from './useSound'

const GENERATE_ANIMATION_MS = 300

type ProgressApi = ReturnType<typeof useGameProgress>

export function useGameBoard(progress: ProgressApi, playSound: (type: SoundType) => void) {
  const { state, setState, addPoints, discoverTile, completeChallenges } = progress
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const [mergingIndices, setMergingIndices] = useState<number[]>([])
  const [generatingIndex, setGeneratingIndex] = useState<number | null>(null)
  const [showAscension, setShowAscension] = useState(false)
  const lastTapRef = useRef<{ index: number; time: number } | null>(null)

  const handleCellTap = useCallback(
    (index: number, onDoubleTap?: (tileId: TileId) => void) => {
      const board = state.board
      const cell = board[index]
      const now = Date.now()

      if (
        lastTapRef.current &&
        lastTapRef.current.index === index &&
        now - lastTapRef.current.time < 350 &&
        cell
      ) {
        onDoubleTap?.(cell.tileId)
        lastTapRef.current = null
        return
      }
      lastTapRef.current = { index, time: now }

      if (selectedIndex === null) {
        if (cell) {
          setSelectedIndex(index)
          playSound('select')
        }
        return
      }

      if (selectedIndex === index) {
        setSelectedIndex(null)
        return
      }

      const selected = board[selectedIndex]
      if (!selected) {
        setSelectedIndex(cell ? index : null)
        return
      }

      if (!cell) {
        const nextBoard = moveTile(board, selectedIndex, index)
        setState((prev) => ({ ...prev, board: nextBoard }))
        setSelectedIndex(index)
        playSound('move')
        return
      }

      if (canMergeTiles(selected.tileId, cell.tileId)) {
        setMergingIndices([selectedIndex, index])
        setTimeout(() => {
          const { board: mergedBoard, result } = mergeTiles(board, selectedIndex, index, state.discoveredTiles)
          if (!result.success || !result.mergedTileId) {
            setMergingIndices([])
            return
          }

          const isSharpness =
            getTile(selected.tileId).category === 'sharpness' &&
            getTile(cell.tileId).category === 'sharpness'

          setState((prev) => {
            const updated: typeof prev = {
              ...prev,
              board: mergedBoard,
              stats: {
                ...prev.stats,
                totalMerges: prev.stats.totalMerges + 1,
                sharpnessMerges: isSharpness ? prev.stats.sharpnessMerges + 1 : prev.stats.sharpnessMerges,
                crossMerges: result.isCrossMerge ? prev.stats.crossMerges + 1 : prev.stats.crossMerges,
              },
            }
            if (!prev.discoveredTiles.includes(result.mergedTileId!)) {
              updated.discoveredTiles = [...prev.discoveredTiles, result.mergedTileId!]
            }
            updated.points = prev.points + result.pointsEarned + result.discoveryBonus
            return updated
          })

          if (result.pointsEarned > 0) {
            progress.addPopup(result.pointsEarned, 'Communication Points')
          }
          if (result.discoveryBonus > 0) {
            setTimeout(() => progress.addPopup(result.discoveryBonus, 'New Discovery'), 400)
          }

          playSound(result.isCrossMerge ? 'crossMerge' : 'merge')
          discoverTile(result.mergedTileId)
          completeChallenges({
            ...state,
            board: mergedBoard,
            points: state.points + result.pointsEarned + result.discoveryBonus,
            stats: {
              ...state.stats,
              totalMerges: state.stats.totalMerges + 1,
              sharpnessMerges: isSharpness ? state.stats.sharpnessMerges + 1 : state.stats.sharpnessMerges,
              crossMerges: result.isCrossMerge ? state.stats.crossMerges + 1 : state.stats.crossMerges,
            },
            discoveredTiles: state.discoveredTiles.includes(result.mergedTileId)
              ? state.discoveredTiles
              : [...state.discoveredTiles, result.mergedTileId],
          })

          setMergingIndices([])
          setSelectedIndex(index)
        }, 300)
        return
      }

      const nextBoard = swapTiles(board, selectedIndex, index)
      setState((prev) => ({ ...prev, board: nextBoard }))
      setSelectedIndex(index)
      playSound('move')
    },
    [selectedIndex, state, setState, playSound, addPoints, discoverTile, completeChallenges, progress],
  )

  const generateTrait = useCallback(() => {
    if (isBoardFull(state.board)) return
    const empty = findEmptyCells(state.board)
    if (empty.length === 0) return

    const index = empty[Math.floor(Math.random() * empty.length)]
    const tileId = getRandomBasicTile()
    const instance = createTileInstance(tileId)

    setGeneratingIndex(index)
    setState((prev) => {
      const board = [...prev.board]
      board[index] = instance
      const discovered = prev.discoveredTiles.includes(tileId)
        ? prev.discoveredTiles
        : [...prev.discoveredTiles, tileId]
      return { ...prev, board, discoveredTiles: discovered }
    })

    playSound('generate')
    setTimeout(() => setGeneratingIndex(null), GENERATE_ANIMATION_MS)
  }, [state.board, setState, playSound])

  const handleDrop = useCallback(
    (fromIndex: number, toIndex: number) => {
      if (fromIndex === toIndex) return
      const board = state.board
      const from = board[fromIndex]
      const to = board[toIndex]

      if (!from) return

      if (!to) {
        const nextBoard = moveTile(board, fromIndex, toIndex)
        setState((prev) => ({ ...prev, board: nextBoard }))
        setSelectedIndex(toIndex)
        playSound('move')
        return
      }

      if (canMergeTiles(from.tileId, to.tileId)) {
        handleCellTap(fromIndex)
        setTimeout(() => handleCellTap(toIndex), 50)
        return
      }

      const nextBoard = swapTiles(board, fromIndex, toIndex)
      setState((prev) => ({ ...prev, board: nextBoard }))
      setSelectedIndex(toIndex)
      playSound('move')
    },
    [state.board, setState, playSound, handleCellTap],
  )

  const ascend = useCallback(() => {
    const result = performAscension(state.board)
    if (!result) return

    setShowAscension(true)
    setTimeout(() => {
      setState((prev) => ({
        ...prev,
        board: result.board,
        hasLegendary: true,
        discoveredTiles: prev.discoveredTiles.includes('legendary_communicator')
          ? prev.discoveredTiles
          : [...prev.discoveredTiles, 'legendary_communicator'],
      }))
      addPoints(1000, 'Legendary Ascension')
      playSound('ascension')
      completeChallenges({
        ...state,
        board: result.board,
        hasLegendary: true,
        discoveredTiles: state.discoveredTiles.includes('legendary_communicator')
          ? state.discoveredTiles
          : [...state.discoveredTiles, 'legendary_communicator'],
      })
      setTimeout(() => setShowAscension(false), 3500)
    }, 1500)
  }, [state, setState, addPoints, playSound, completeChallenges])

  const boardFull = isBoardFull(state.board)

  return {
    selectedIndex,
    setSelectedIndex,
    mergingIndices,
    generatingIndex,
    boardFull,
    showAscension,
    handleCellTap,
    handleDrop,
    generateTrait,
    ascend,
    boardSize: BOARD_SIZE,
  }
}

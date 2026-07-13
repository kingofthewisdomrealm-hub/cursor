import { BOARD_COLS } from '../lib/boardLogic'
import { BoardCell } from './BoardCell'
import type { Board, TileId } from '../types/game'

interface CommunicationBoardProps {
  board: Board
  selectedIndex: number | null
  mergingIndices: number[]
  generatingIndex: number | null
  onCellTap: (index: number, onDoubleTap?: (tileId: TileId) => void) => void
  onDrop: (from: number, to: number) => void
  onDoubleTapTile: (tileId: TileId) => void
}

export function CommunicationBoard({
  board,
  selectedIndex,
  mergingIndices,
  generatingIndex,
  onCellTap,
  onDrop,
  onDoubleTapTile,
}: CommunicationBoardProps) {
  return (
    <div
      className="grid gap-1.5 p-3 bg-white/50 backdrop-blur rounded-2xl shadow-lg border border-white/80"
      style={{ gridTemplateColumns: `repeat(${BOARD_COLS}, 1fr)` }}
    >
      {board.map((cell, index) => (
        <BoardCell
          key={index}
          index={index}
          tile={cell}
          selected={selectedIndex === index}
          merging={mergingIndices.includes(index)}
          entering={generatingIndex === index}
          onTap={() => onCellTap(index, onDoubleTapTile)}
          onDrop={(from) => onDrop(from, index)}
        />
      ))}
    </div>
  )
}

import { useState } from 'react'
import { TraitTile } from './TraitTile'
import type { Board } from '../types/game'

interface BoardCellProps {
  index: number
  tile: Board[number]
  selected: boolean
  merging: boolean
  entering: boolean
  onTap: () => void
  onDrop: (fromIndex: number) => void
}

export function BoardCell({ index, tile, selected, merging, entering, onTap, onDrop }: BoardCellProps) {
  const [dragOver, setDragOver] = useState(false)

  return (
    <div
      className={`
        h-full min-h-0 rounded-md border border-dashed transition-colors
        ${tile ? 'border-transparent bg-transparent' : 'border-slate-200/70 bg-white/30'}
        ${dragOver && !tile ? 'border-indigo-400 bg-indigo-50/50' : ''}
      `}
      onClick={onTap}
      onDragOver={(e) => {
        e.preventDefault()
        setDragOver(true)
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        e.preventDefault()
        setDragOver(false)
        const from = Number(e.dataTransfer.getData('text/plain'))
        if (!Number.isNaN(from)) onDrop(from)
      }}
    >
      {tile && (
        <div
          draggable
          onDragStart={(e) => {
            e.dataTransfer.setData('text/plain', String(index))
            e.dataTransfer.effectAllowed = 'move'
          }}
          className="w-full h-full"
        >
          <TraitTile
            tileId={tile.tileId}
            selected={selected}
            merging={merging}
            entering={entering}
          />
        </div>
      )}
    </div>
  )
}

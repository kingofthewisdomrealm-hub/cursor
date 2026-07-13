import { motion } from 'framer-motion'
import { getTile } from '../config/tiles'
import type { TileId } from '../types/game'

interface TraitTileProps {
  tileId: TileId
  selected?: boolean
  merging?: boolean
  entering?: boolean
  compact?: boolean
}

export function TraitTile({
  tileId,
  selected,
  merging,
  entering,
  compact,
}: TraitTileProps) {
  const tile = getTile(tileId)
  const isLegendary = tile.category === 'legendary'
  const isCross = tile.category === 'cross'

  return (
    <motion.div
      layout
      initial={entering ? { scale: 0, opacity: 0 } : false}
      animate={
        merging
          ? { scale: [1, 1.3, 0], opacity: [1, 1, 0] }
          : selected
            ? { scale: [1, 1.05, 1] }
            : { scale: 1, opacity: 1 }
      }
      transition={
        merging
          ? { duration: 0.4 }
          : selected
            ? { repeat: Infinity, duration: 1.2 }
            : entering
              ? { type: 'spring', stiffness: 400, damping: 20 }
              : {}
      }
      className={`
        relative w-full aspect-square rounded-xl flex flex-col items-center justify-center
        bg-gradient-to-br ${tile.bgClass} shadow-md border-2
        ${tile.borderClass}
        ${selected ? 'ring-4 ring-white ring-offset-2 ring-offset-indigo-300 shadow-xl z-10' : ''}
        ${isLegendary ? 'legendary-tile' : ''}
        ${isCross ? 'cross-tile' : ''}
        select-none touch-none
      `}
      style={{ color: 'white' }}
    >
      {isLegendary && (
        <>
          <div className="absolute inset-0 rounded-xl shimmer opacity-40 pointer-events-none" />
          <motion.div
            className="absolute inset-[-4px] rounded-2xl border-2 border-yellow-300/60 pointer-events-none"
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 8, ease: 'linear' }}
          />
        </>
      )}
      {isCross && (
        <motion.div
          className="absolute inset-0 rounded-xl pointer-events-none"
          animate={{ opacity: [0.3, 0.7, 0.3] }}
          transition={{ repeat: Infinity, duration: 2 }}
          style={{ boxShadow: `0 0 20px ${tile.color}` }}
        />
      )}
      <span className={`${compact ? 'text-lg' : 'text-2xl'} drop-shadow-sm`}>{tile.icon}</span>
      {!compact && (
        <span className="text-[9px] font-bold text-center leading-tight mt-0.5 px-0.5 drop-shadow-sm">
          {tile.name}
        </span>
      )}
      {merging && (
        <motion.div
          className="absolute inset-0 pointer-events-none"
          initial={{ scale: 0 }}
          animate={{ scale: [0, 2], opacity: [1, 0] }}
          transition={{ duration: 0.5 }}
        >
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-white rounded-full top-1/2 left-1/2"
              animate={{
                x: Math.cos((i / 6) * Math.PI * 2) * 40,
                y: Math.sin((i / 6) * Math.PI * 2) * 40,
                opacity: [1, 0],
              }}
              transition={{ duration: 0.5 }}
            />
          ))}
        </motion.div>
      )}
    </motion.div>
  )
}

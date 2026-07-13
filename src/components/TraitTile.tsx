import { motion } from 'framer-motion'
import { getTile } from '../config/tiles'
import type { TileId } from '../types/game'

interface TraitTileProps {
  tileId: TileId
  selected?: boolean
  merging?: boolean
  entering?: boolean
  compact?: boolean
  showLogo?: boolean
}

export function TraitTile({
  tileId,
  selected,
  merging,
  entering,
  compact,
  showLogo,
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
        relative w-full h-full rounded-md flex flex-col items-center justify-center
        bg-gradient-to-br ${tile.bgClass} shadow-md border-2
        ${tile.borderClass}
        ${selected ? 'ring-2 ring-amber-300 ring-offset-1 ring-offset-slate-900 shadow-lg z-10' : ''}
        ${isLegendary ? 'legendary-tile' : ''}
        ${isCross ? 'cross-tile' : ''}
        select-none touch-none overflow-hidden
      `}
    >
      <span className="absolute top-0.5 right-0.5 text-[6px] font-black bg-black/40 px-1 rounded text-amber-200">
        Lv.{tile.tier}
      </span>

      {isLegendary && (
        <>
          <div className="absolute inset-0 shimmer opacity-30 pointer-events-none" />
          <motion.div
            className="absolute inset-[-2px] rounded-lg border border-yellow-300/60 pointer-events-none"
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 8, ease: 'linear' }}
          />
        </>
      )}
      {isCross && (
        <motion.div
          className="absolute inset-0 pointer-events-none"
          animate={{ opacity: [0.3, 0.7, 0.3] }}
          transition={{ repeat: Infinity, duration: 2 }}
          style={{ boxShadow: `0 0 12px ${tile.color}` }}
        />
      )}

      <span className="absolute text-2xl opacity-15 pointer-events-none">{tile.icon}</span>

      <div
        className={`
          relative rounded-full bg-white/95 flex items-center justify-center shadow-inner border-2 border-white/80
          ${compact || showLogo ? 'w-8 h-8' : 'w-9 h-9 sm:w-10 sm:h-10'}
        `}
      >
        <span
          className={`font-black text-slate-800 leading-none ${compact || showLogo ? 'text-[9px]' : 'text-[10px] sm:text-xs'}`}
        >
          {tile.logo}
        </span>
      </div>

      {!compact && !showLogo && (
        <span className="text-[6px] sm:text-[7px] font-bold text-center leading-none mt-0.5 px-0.5 text-amber-100 drop-shadow line-clamp-1">
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
              className="absolute w-1.5 h-1.5 bg-amber-300 rounded-full top-1/2 left-1/2"
              animate={{
                x: Math.cos((i / 6) * Math.PI * 2) * 24,
                y: Math.sin((i / 6) * Math.PI * 2) * 24,
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

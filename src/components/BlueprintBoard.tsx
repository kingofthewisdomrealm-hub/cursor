import { motion } from 'framer-motion'
import type { Card, SlotType } from '../types/game'
import { SLOT_EMOJIS, SLOT_LABELS } from '../config/levels'

interface BlueprintSlotProps {
  slotType: SlotType
  card: Card | null
  isActive: boolean
  isSelected: boolean
  onTap: () => void
  onDrop: (card: Card) => void
  dragCard: Card | null
}

function BlueprintSlot({
  slotType,
  card,
  isActive,
  onTap,
  onDrop,
  dragCard,
}: BlueprintSlotProps) {
  const canDrop = dragCard?.slotType === slotType

  return (
    <motion.button
      type="button"
      onClick={onTap}
      onDragOver={(e) => {
        if (canDrop) e.preventDefault()
      }}
      onDrop={(e) => {
        e.preventDefault()
        if (dragCard && canDrop) onDrop(dragCard)
      }}
      animate={canDrop ? { scale: 1.02 } : { scale: 1 }}
      className={`
        relative w-full p-3 rounded-xl border-2 border-dashed transition-all text-left
        ${!isActive ? 'opacity-40 border-slate-200 bg-slate-50' : ''}
        ${isActive && !card ? 'border-emerald-300 bg-emerald-50/50 hover:border-emerald-400' : ''}
        ${isActive && card ? 'border-solid border-emerald-400 bg-white shadow-sm' : ''}
        ${canDrop ? 'border-emerald-500 bg-emerald-100/50 ring-2 ring-emerald-300' : ''}
      `}
      disabled={!isActive}
    >
      <div className="flex items-center gap-2">
        <span className="text-lg">{SLOT_EMOJIS[slotType]}</span>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">
            {SLOT_LABELS[slotType]}
          </p>
          {card ? (
            <p className="text-sm font-semibold text-slate-800 truncate">
              {card.emoji} {card.name}
            </p>
          ) : (
            <p className="text-xs text-slate-400">Drop card here</p>
          )}
        </div>
      </div>
    </motion.button>
  )
}

interface BlueprintBoardProps {
  slots: Record<SlotType, Card | null>
  activeSlots: SlotType[]
  selectedCard: Card | null
  onSlotTap: (slot: SlotType) => void
  onDrop: (slot: SlotType, card: Card) => void
}

export function BlueprintBoard({
  slots,
  activeSlots,
  selectedCard,
  onSlotTap,
  onDrop,
}: BlueprintBoardProps) {
  const allSlots: SlotType[] = [
    'product',
    'market',
    'problem',
    'hook',
    'offer',
    'ad',
    'landing',
  ]

  return (
    <div className="bg-white/80 backdrop-blur rounded-2xl p-4 shadow-sm border border-slate-200/60">
      <h2 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
        <span>📋</span> Business Blueprint
      </h2>
      <div className="grid gap-2">
        {allSlots.map((slotType) => (
          <BlueprintSlot
            key={slotType}
            slotType={slotType}
            card={slots[slotType]}
            isActive={activeSlots.includes(slotType)}
            isSelected={selectedCard?.slotType === slotType}
            onTap={() => onSlotTap(slotType)}
            onDrop={(card) => onDrop(slotType, card)}
            dragCard={selectedCard}
          />
        ))}
      </div>
    </div>
  )
}

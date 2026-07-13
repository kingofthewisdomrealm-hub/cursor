import { motion } from 'framer-motion'
import type { Card, SlotType } from '../types/game'

interface CardItemProps {
  card: Card
  selected: boolean
  inSlot?: boolean
  onSelect: () => void
}

export function CardItem({ card, selected, inSlot, onSelect }: CardItemProps) {
  return (
    <motion.button
      type="button"
      draggable={!inSlot}
      onDragStart={(e) => {
        const event = e as unknown as DragEvent
        event.dataTransfer?.setData('cardId', card.id)
        onSelect()
      }}
      onClick={onSelect}
      whileTap={{ scale: 0.95 }}
      className={`
        flex-shrink-0 w-28 p-2.5 rounded-xl border-2 text-left transition-all
        ${selected ? 'border-emerald-500 bg-emerald-50 shadow-md ring-2 ring-emerald-200' : 'border-slate-200 bg-white hover:border-emerald-300'}
        ${inSlot ? 'w-full' : ''}
      `}
    >
      <div className="text-2xl mb-1">{card.emoji}</div>
      <p className="text-xs font-bold text-slate-800 leading-tight line-clamp-2">{card.name}</p>
      <p className="text-[10px] text-slate-400 mt-0.5 capitalize">{card.slotType}</p>
    </motion.button>
  )
}

interface CardDeckProps {
  cards: Card[]
  activeSlots: SlotType[]
  selectedCard: Card | null
  filledCardIds: string[]
  onSelect: (card: Card) => void
}

export function CardDeck({
  cards,
  activeSlots,
  selectedCard,
  filledCardIds,
  onSelect,
}: CardDeckProps) {
  const deckCards = cards.filter(
    (c) => activeSlots.includes(c.slotType) && !filledCardIds.includes(c.id),
  )

  const grouped = activeSlots.reduce(
    (acc, slot) => {
      acc[slot] = deckCards.filter((c) => c.slotType === slot)
      return acc
    },
    {} as Record<SlotType, Card[]>,
  )

  return (
    <div className="space-y-3">
      <h2 className="text-sm font-bold text-slate-700 flex items-center gap-2 px-1">
        <span>🃏</span> Card Deck
        {selectedCard && (
          <span className="text-xs font-normal text-emerald-600 ml-auto">
            Tap a slot to place
          </span>
        )}
      </h2>
      {activeSlots.map((slot) => {
        const slotCards = grouped[slot]
        if (!slotCards?.length) return null
        return (
          <div key={slot}>
            <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold mb-1.5 px-1 capitalize">
              {slot}
            </p>
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
              {slotCards.map((card) => (
                <CardItem
                  key={card.id}
                  card={card}
                  selected={selectedCard?.id === card.id}
                  onSelect={() => onSelect(card)}
                />
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}

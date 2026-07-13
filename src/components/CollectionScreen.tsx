import { CARDS } from '../config/cards'
import { SLOT_LABELS } from '../config/levels'

interface CollectionScreenProps {
  unlockedCardIds: string[]
  playerLevel: number
  onBack: () => void
}

export function CollectionScreen({
  unlockedCardIds,
  playerLevel,
  onBack,
}: CollectionScreenProps) {
  const unlocked = new Set(unlockedCardIds)
  const grouped = CARDS.reduce(
    (acc, card) => {
      if (!acc[card.slotType]) acc[card.slotType] = []
      acc[card.slotType].push(card)
      return acc
    },
    {} as Record<string, typeof CARDS>,
  )

  return (
    <div className="flex-1 overflow-y-auto px-4 pb-32 pt-4">
      <button
        type="button"
        onClick={onBack}
        className="text-sm text-emerald-600 font-medium mb-4"
      >
        ← Back to Build
      </button>

      <h2 className="text-xl font-bold text-slate-800 mb-1">Card Collection</h2>
      <p className="text-sm text-slate-500 mb-6">
        {unlockedCardIds.length}/{CARDS.length} cards discovered
      </p>

      {Object.entries(grouped).map(([slotType, cards]) => (
        <div key={slotType} className="mb-6">
          <h3 className="text-xs uppercase tracking-wider text-slate-400 font-semibold mb-2">
            {SLOT_LABELS[slotType as keyof typeof SLOT_LABELS] ?? slotType}
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {cards.map((card) => {
              const isUnlocked = unlocked.has(card.id)
              const isLocked = card.unlockLevel > playerLevel
              return (
                <div
                  key={card.id}
                  className={`
                    p-3 rounded-xl border text-left
                    ${isUnlocked ? 'bg-white border-slate-200' : 'bg-slate-50 border-slate-100 opacity-50'}
                  `}
                >
                  <div className="text-2xl mb-1">{isUnlocked ? card.emoji : '❓'}</div>
                  <p className="text-xs font-bold text-slate-800">
                    {isUnlocked ? card.name : '???'}
                  </p>
                  {isUnlocked && (
                    <p className="text-[10px] text-slate-400 mt-1 line-clamp-2">{card.description}</p>
                  )}
                  {isLocked && !isUnlocked && (
                    <p className="text-[10px] text-slate-400 mt-1">Level {card.unlockLevel}</p>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}

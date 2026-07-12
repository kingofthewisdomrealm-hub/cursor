import { motion } from 'framer-motion';
import type { CardType } from '../types';
import { CARD_TYPE_LABELS, CARD_TYPE_COLORS } from '../types';
import { ALL_CARDS } from '../data/cards';
import { useGameStore } from '../store/gameStore';
import { ComedyCardComponent } from './ComedyCard';

interface CardDeckProps {
  type: CardType;
}

export function CardDeck({ type }: CardDeckProps) {
  const isCardUnlocked = useGameStore((s) => s.isCardUnlocked);
  const laughPoints = useGameStore((s) => s.laughPoints);
  const setStageSlot = useGameStore((s) => s.setStageSlot);
  const cards = ALL_CARDS.filter((c) => c.type === type);
  const typeColor = CARD_TYPE_COLORS[type];

  return (
    <div className="flex flex-col">
      <div className={`mb-2 flex items-center justify-between rounded-lg px-3 py-1.5 ${typeColor}`}>
        <h3 className="font-display text-sm tracking-wider text-white">
          {CARD_TYPE_LABELS[type]}
        </h3>
        <span className="text-xs text-white/70">
          {cards.filter((c) => isCardUnlocked(c.id)).length}/{cards.length}
        </span>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
        {cards.map((card, i) => {
          const unlocked = isCardUnlocked(card.id);
          return (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="w-[160px] shrink-0"
            >
              <ComedyCardComponent
                card={card}
                isLocked={!unlocked}
                onClickPlace={() => setStageSlot(type, card.id)}
              />
              {!unlocked && laughPoints < card.unlockCost && (
                <p className="mt-1 text-center text-[10px] text-slate-500">
                  Need {card.unlockCost - laughPoints} more LP
                </p>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

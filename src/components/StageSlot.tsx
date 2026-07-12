import { useDroppable } from '@dnd-kit/core';
import { motion, AnimatePresence } from 'framer-motion';
import type { CardType } from '../types';
import { CARD_TYPE_LABELS, CARD_TYPE_COLORS } from '../types';
import { getCardById } from '../data/cards';
import { useGameStore } from '../store/gameStore';
import { ComedyCardComponent } from './ComedyCard';

interface StageSlotProps {
  slotType: CardType;
  cardId: string | null;
  isOver: boolean;
}

export function StageSlot({ slotType, cardId, isOver }: StageSlotProps) {
  const setStageSlot = useGameStore((s) => s.setStageSlot);
  const { setNodeRef, isOver: isDroppableOver } = useDroppable({
    id: `slot-${slotType}`,
    data: { slotType },
  });

  const card = cardId ? getCardById(cardId) : null;
  const active = isOver || isDroppableOver;
  const typeColor = CARD_TYPE_COLORS[slotType];

  return (
    <div
      ref={setNodeRef}
      className={`
        relative flex min-h-[100px] flex-1 flex-col rounded-xl border-2 border-dashed
        transition-all duration-200
        ${active ? 'border-white/60 bg-white/10 scale-[1.02]' : 'border-white/20 bg-black/30'}
      `}
    >
      <div className={`rounded-t-lg px-3 py-1.5 text-center ${typeColor}`}>
        <span className="font-display text-sm tracking-wider text-white">
          {CARD_TYPE_LABELS[slotType]}
        </span>
      </div>

      <div className="flex flex-1 items-center justify-center p-2">
        <AnimatePresence mode="wait">
          {card ? (
            <motion.div
              key={card.id}
              initial={{ scale: 0.5, opacity: 0, rotateY: 90 }}
              animate={{ scale: 1, opacity: 1, rotateY: 0 }}
              exit={{ scale: 0.5, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              className="w-full"
            >
              <ComedyCardComponent
                card={card}
                isOnStage
                onClickRemove={() => setStageSlot(slotType, null)}
              />
            </motion.div>
          ) : (
            <motion.p
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center text-xs text-white/40"
            >
              Drop {CARD_TYPE_LABELS[slotType]} here
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

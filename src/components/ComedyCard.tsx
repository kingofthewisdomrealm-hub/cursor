import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { motion } from 'framer-motion';
import type { ComedyCard } from '../types';
import { CARD_TYPE_COLORS } from '../types';
import { useGameStore } from '../store/gameStore';

interface ComedyCardProps {
  card: ComedyCard;
  isOnStage?: boolean;
  isLocked?: boolean;
  onClickPlace?: () => void;
  onClickRemove?: () => void;
}

export function ComedyCardComponent({
  card,
  isOnStage = false,
  isLocked = false,
  onClickPlace,
  onClickRemove,
}: ComedyCardProps) {
  const stage = useGameStore((s) => s.stage);
  const isPlaced = Object.values(stage).includes(card.id);

  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: card.id,
    data: { card, type: card.type },
    disabled: isLocked || (isPlaced && !isOnStage),
  });

  const style = {
    transform: CSS.Translate.toString(transform),
  };

  const typeColor = CARD_TYPE_COLORS[card.type];

  if (isLocked) {
    return (
      <div className="relative rounded-xl border-2 border-dashed border-slate-600 bg-slate-800/50 p-3 opacity-60">
        <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-black/40">
          <span className="text-xs font-semibold text-slate-400">
            🔒 {card.unlockCost} LP
          </span>
        </div>
        <p className="text-sm text-slate-500 line-clamp-3">{card.text}</p>
      </div>
    );
  }

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      layout
      onClick={() => {
        if (isOnStage && onClickRemove) onClickRemove();
        else if (!isPlaced && onClickPlace) onClickPlace();
      }}
      whileHover={!isDragging ? { scale: 1.03, y: -2 } : undefined}
      whileTap={{ scale: 0.97 }}
      className={`
        relative cursor-grab touch-none rounded-xl border-2 p-3 shadow-lg
        transition-shadow active:cursor-grabbing
        ${typeColor} border-white/20
        ${isDragging ? 'z-50 opacity-90 shadow-2xl ring-2 ring-white/50' : 'hover:shadow-xl'}
        ${isPlaced && !isOnStage ? 'opacity-40 pointer-events-none' : ''}
        ${isOnStage ? 'text-sm' : ''}
      `}
    >
      <span className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-white/70">
        {card.type}
      </span>
      <p className={`font-medium leading-snug text-white ${isOnStage ? 'text-xs' : 'text-sm'}`}>
        {card.text}
      </p>
    </motion.div>
  );
}

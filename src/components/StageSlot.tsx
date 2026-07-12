import { useDroppable } from '@dnd-kit/core';
import { motion, AnimatePresence } from 'framer-motion';
import type { CardType } from '../types';
import { CARD_TYPE_LABELS, CARD_TYPE_COLORS } from '../types';
import { getCardById } from '../data/cards';
import { parseTechniqueCard } from '../utils/aiTechnique';
import { useGameStore } from '../store/gameStore';
import { ComedyCardComponent } from './ComedyCard';

interface StageSlotProps {
  slotType: CardType;
  cardId: string | null;
  isOver: boolean;
}

function TechniqueGenerating({ techniqueText }: { techniqueText: string }) {
  const { name, instruction } = parseTechniqueCard(techniqueText);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center gap-2 px-2 py-3"
    >
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
        className="text-2xl"
      >
        ✨
      </motion.div>
      <p className="text-center text-xs font-medium text-white/70">AI writing your technique...</p>
      <p className="text-center text-[10px] leading-snug text-white/50">
        <span className="font-semibold text-card-tech">{name}:</span> {instruction}
      </p>
      <div className="h-1 w-full overflow-hidden rounded-full bg-white/10">
        <motion.div
          className="h-full bg-card-tech"
          animate={{ x: ['-100%', '100%'] }}
          transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
          style={{ width: '50%' }}
        />
      </div>
    </motion.div>
  );
}

function TechniqueGenerated({
  techniqueName,
  generatedText,
  onRegenerate,
  onRemove,
}: {
  techniqueName: string;
  generatedText: string;
  onRegenerate: () => void;
  onRemove: () => void;
}) {
  return (
    <motion.div
      initial={{ scale: 0.5, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="w-full cursor-pointer rounded-xl border-2 border-white/20 bg-card-tech p-3 shadow-lg"
      onClick={onRemove}
    >
      <div className="mb-1 flex items-center justify-between">
        <span className="text-[10px] font-bold uppercase tracking-wider text-white/70">
          ✨ AI Generated
        </span>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRegenerate();
          }}
          className="rounded px-1.5 py-0.5 text-[10px] text-white/60 hover:bg-white/10 hover:text-white"
          title="Regenerate"
        >
          🔄
        </button>
      </div>
      <p className="text-xs font-medium leading-snug text-white">{generatedText}</p>
      <p className="mt-1.5 text-[10px] text-white/40 italic">{techniqueName}</p>
    </motion.div>
  );
}

export function StageSlot({ slotType, cardId, isOver }: StageSlotProps) {
  const setStageSlot = useGameStore((s) => s.setStageSlot);
  const generatedTechnique = useGameStore((s) => s.generatedTechnique);
  const isGeneratingTechnique = useGameStore((s) => s.isGeneratingTechnique);
  const techniqueError = useGameStore((s) => s.techniqueError);
  const regenerateTechnique = useGameStore((s) => s.regenerateTechnique);
  const stage = useGameStore((s) => s.stage);

  const { setNodeRef, isOver: isDroppableOver } = useDroppable({
    id: `slot-${slotType}`,
    data: { slotType },
  });

  const card = cardId ? getCardById(cardId) : null;
  const active = isOver || isDroppableOver;
  const typeColor = CARD_TYPE_COLORS[slotType];
  const isTechnique = slotType === 'technique';
  const hasObservation = !!stage.observation;
  const showTechniqueGenerate = isTechnique && card && hasObservation;

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
          {card && showTechniqueGenerate && isGeneratingTechnique ? (
            <TechniqueGenerating key="generating" techniqueText={card.text} />
          ) : card && showTechniqueGenerate && techniqueError ? (
            <motion.div
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center"
            >
              <p className="text-xs text-red-400">{techniqueError}</p>
              <button
                type="button"
                onClick={() => regenerateTechnique()}
                className="mt-2 text-xs text-white/60 underline hover:text-white"
              >
                Retry
              </button>
            </motion.div>
          ) : card && showTechniqueGenerate && generatedTechnique ? (
            <TechniqueGenerated
              key="generated"
              techniqueName={card.text}
              generatedText={generatedTechnique}
              onRegenerate={() => regenerateTechnique()}
              onRemove={() => setStageSlot(slotType, null)}
            />
          ) : card ? (
            <motion.div
              key={card.id}
              initial={{ scale: 0.5, opacity: 0, rotateY: 90 }}
              animate={{ scale: 1, opacity: 1, rotateY: 0 }}
              exit={{ scale: 0.5, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              className="w-full"
            >
              {isTechnique && !hasObservation ? (
                <div className="rounded-xl border-2 border-dashed border-card-tech/50 bg-card-tech/30 p-3">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-white/50">Will AI-generate:</p>
                  <p className="mt-1 text-xs font-medium text-white">{card.text}</p>
                  <p className="mt-1 text-[10px] text-white/50">Drop an observation first</p>
                </div>
              ) : (
                <ComedyCardComponent
                  card={card}
                  isOnStage
                  onClickRemove={() => setStageSlot(slotType, null)}
                />
              )}
            </motion.div>
          ) : (
            <motion.p
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center text-xs text-white/40"
            >
              {isTechnique ? 'Drop Technique — AI will write the bridge' : `Drop ${CARD_TYPE_LABELS[slotType]} here`}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

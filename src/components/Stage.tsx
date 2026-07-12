import { motion } from 'framer-motion';
import { useGameStore } from '../store/gameStore';
import { getCardById } from '../data/cards';
import { StageSlot } from './StageSlot';
import type { CardType } from '../types';

interface StageProps {
  activeSlot: CardType | null;
}

export function Stage({ activeSlot }: StageProps) {
  const stage = useGameStore((s) => s.stage);
  const submitJoke = useGameStore((s) => s.submitJoke);
  const clearStage = useGameStore((s) => s.clearStage);

  const isComplete = stage.observation && stage.technique && stage.punchline;

  const obs = stage.observation ? getCardById(stage.observation) : null;
  const tech = stage.technique ? getCardById(stage.technique) : null;
  const punch = stage.punchline ? getCardById(stage.punchline) : null;

  const handleSubmit = () => {
    if (isComplete) submitJoke();
  };

  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-stage-red/20 via-stage-dark to-stage-dark shadow-2xl">
      {/* Spotlight */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-stage-spotlight/15 to-transparent animate-spotlight" />

      {/* Curtains */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-stage-red/40 to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-stage-red/40 to-transparent" />

      <div className="relative p-4">
        <div className="mb-3 text-center">
          <h2 className="font-display text-2xl tracking-widest text-stage-spotlight">
            THE STAGE
          </h2>
          <p className="text-xs text-white/50">Drop your cards to build a joke</p>
        </div>

        {/* Joke preview */}
        {isComplete && obs && tech && punch && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 rounded-xl bg-black/40 p-4 ring-1 ring-white/10"
          >
            <p className="text-center text-sm leading-relaxed text-white/90">
              {obs.text}{' '}
              <span className="text-card-tech/80 italic">[{tech.text}]</span>{' '}
              {punch.text}
            </p>
          </motion.div>
        )}

        {/* Drop slots */}
        <div className="mb-4 flex flex-col gap-2 sm:flex-row">
          <StageSlot
            slotType="observation"
            cardId={stage.observation}
            isOver={activeSlot === 'observation'}
          />
          <StageSlot
            slotType="technique"
            cardId={stage.technique}
            isOver={activeSlot === 'technique'}
          />
          <StageSlot
            slotType="punchline"
            cardId={stage.punchline}
            isOver={activeSlot === 'punchline'}
          />
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSubmit}
            disabled={!isComplete}
            className={`
              flex-1 rounded-xl py-3 font-display text-lg tracking-wider
              transition-all
              ${isComplete
                ? 'bg-gold text-stage-dark shadow-lg shadow-gold/30 hover:bg-yellow-300'
                : 'cursor-not-allowed bg-white/10 text-white/30'
              }
            `}
          >
            {isComplete ? '🎤 Perform Joke!' : 'Fill All Slots'}
          </motion.button>

          {(stage.observation || stage.technique || stage.punchline) && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={clearStage}
              className="rounded-xl border border-white/20 px-4 py-3 text-sm text-white/60 hover:bg-white/10"
            >
              Clear
            </motion.button>
          )}
        </div>
      </div>

      {/* Audience silhouettes */}
      <div className="flex justify-center gap-1 border-t border-white/5 bg-black/40 py-2">
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            className="h-4 w-3 rounded-t-full bg-white/10"
            style={{ height: `${12 + (i % 3) * 4}px` }}
          />
        ))}
      </div>
    </div>
  );
}

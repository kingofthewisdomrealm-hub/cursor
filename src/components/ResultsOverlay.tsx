import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../store/gameStore';
import { getCardById } from '../data/cards';
import { ScoreMeter } from './ScoreMeter';
import { AudienceReactionDisplay } from './AudienceReaction';

export function ResultsOverlay() {
  const showResults = useGameStore((s) => s.showResults);
  const lastResult = useGameStore((s) => s.lastResult);
  const stage = useGameStore((s) => s.stage);
  const dismissResults = useGameStore((s) => s.dismissResults);
  const newlyUnlockedIds = useGameStore((s) => s.newlyUnlockedIds);
  const clearNewlyUnlocked = useGameStore((s) => s.clearNewlyUnlocked);

  if (!lastResult) return null;

  const obs = stage.observation ? getCardById(stage.observation) : null;
  const tech = stage.technique ? getCardById(stage.technique) : null;
  const punch = stage.punchline ? getCardById(stage.punchline) : null;

  const handleDismiss = () => {
    clearNewlyUnlocked();
    dismissResults();
  };

  return (
    <AnimatePresence>
      {showResults && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
          onClick={handleDismiss}
        >
          <motion.div
            initial={{ scale: 0.8, y: 40 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.8, y: 40 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            onClick={(e) => e.stopPropagation()}
            className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-white/10 bg-stage-dark p-6 shadow-2xl"
          >
            <h2 className="mb-4 text-center font-display text-3xl tracking-wide text-white">
              Set Complete!
            </h2>

            {obs && tech && punch && (
              <div className="mb-6 rounded-xl bg-white/5 p-4 text-sm leading-relaxed text-white/80">
                <p>
                  <span className="text-card-obs font-semibold">Obs:</span> {obs.text}
                </p>
                <p className="mt-2">
                  <span className="text-card-tech font-semibold">Tech:</span> {tech.text}
                </p>
                <p className="mt-2">
                  <span className="text-card-punch font-semibold">Punch:</span> {punch.text}
                </p>
              </div>
            )}

            <div className="mb-6">
              <AudienceReactionDisplay reaction={lastResult.reaction} />
            </div>

            <div className="mb-4 space-y-4">
              <ScoreMeter
                label="Laugh Score"
                value={lastResult.laughScore}
                color="bg-gradient-to-r from-green-500 to-emerald-400"
                icon="😂"
                delay={0.2}
              />
              <ScoreMeter
                label="Kill Tony Score"
                value={lastResult.killTonyScore}
                color="bg-gradient-to-r from-stage-red to-orange-500"
                icon="☠️"
                delay={0.4}
              />
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="mb-4 text-center"
            >
              <span className="text-sm text-white/60">Laugh Points Earned</span>
              <p className="font-display text-3xl text-neon">+{lastResult.laughPointsEarned}</p>
            </motion.div>

            {newlyUnlockedIds.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2 }}
                className="mb-4 rounded-xl border border-gold/30 bg-gold/10 p-3 text-center"
              >
                <p className="text-sm font-bold text-gold">🎉 New Cards Unlocked!</p>
                <p className="mt-1 text-xs text-gold/80">
                  {newlyUnlockedIds.length} new card{newlyUnlockedIds.length > 1 ? 's' : ''} added to your deck
                </p>
              </motion.div>
            )}

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleDismiss}
              className="w-full rounded-xl bg-stage-red py-3 font-display text-lg tracking-wider text-white shadow-lg hover:bg-red-600"
            >
              Build Another Joke
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

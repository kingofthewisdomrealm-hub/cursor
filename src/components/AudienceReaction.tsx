import { motion } from 'framer-motion';
import type { AudienceReaction } from '../types';
import { REACTION_CONFIG } from '../types';

interface AudienceReactionProps {
  reaction: AudienceReaction;
}

const CROWD_EMOJIS = ['👤', '👥', '🧑', '👩', '🧔', '👱', '🧑‍🦱', '👩‍🦰'];

export function AudienceReactionDisplay({ reaction }: AudienceReactionProps) {
  const config = REACTION_CONFIG[reaction];
  const intensity =
    reaction === 'kill' ? 1 : reaction === 'roar' ? 0.8 : reaction === 'laugh' ? 0.6 : reaction === 'chuckle' ? 0.3 : 0.1;

  return (
    <div className="flex flex-col items-center gap-3">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 12, delay: 0.3 }}
        className="text-6xl"
      >
        {config.emoji}
      </motion.div>

      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className={`font-display text-2xl tracking-wide ${config.color}`}
      >
        {config.label}
      </motion.p>

      <div className="flex flex-wrap justify-center gap-1 px-4">
        {CROWD_EMOJIS.map((emoji, i) => (
          <motion.span
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{
              opacity: intensity,
              y: 0,
            }}
            transition={{ delay: 0.6 + i * 0.05 }}
            className={intensity > 0.5 ? 'animate-crowd' : ''}
            style={{ animationDelay: `${i * 0.1}s` }}
          >
            {reaction === 'crickets' ? '🪑' : emoji}
          </motion.span>
        ))}
      </div>

      {reaction === 'kill' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.8, type: 'spring' }}
          className="mt-2 rounded-full bg-gold/20 px-4 py-1 text-sm font-bold text-gold ring-1 ring-gold/50"
        >
          ☠️ KILL TONY WORTHY ☠️
        </motion.div>
      )}
    </div>
  );
}

import { motion } from 'framer-motion';
import { useGameStore } from '../store/gameStore';

export function Header() {
  const laughPoints = useGameStore((s) => s.laughPoints);
  const jokesPerformed = useGameStore((s) => s.jokesPerformed);
  const bestLaughScore = useGameStore((s) => s.bestLaughScore);
  const bestKillTonyScore = useGameStore((s) => s.bestKillTonyScore);
  const unlockedCount = useGameStore((s) => s.unlockedCardIds.length);

  return (
    <header className="mb-4">
      <div className="mb-3 text-center">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-display text-4xl tracking-widest text-white sm:text-5xl"
        >
          KILL TONY BUILDER
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mt-1 text-sm text-white/50"
        >
          Drag. Drop. Kill. Repeat.
        </motion.p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="grid grid-cols-2 gap-2 sm:grid-cols-5"
      >
        <StatBox label="Laugh Points" value={laughPoints} icon="⭐" highlight />
        <StatBox label="Jokes" value={jokesPerformed} icon="🎤" />
        <StatBox label="Best Laugh" value={bestLaughScore} icon="😂" />
        <StatBox label="Best Kill" value={bestKillTonyScore} icon="☠️" />
        <StatBox label="Cards" value={unlockedCount} icon="🃏" />
      </motion.div>
    </header>
  );
}

function StatBox({
  label,
  value,
  icon,
  highlight = false,
}: {
  label: string;
  value: number;
  icon: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`
        rounded-xl border px-3 py-2 text-center
        ${highlight ? 'border-neon/30 bg-neon/10' : 'border-white/10 bg-white/5'}
      `}
    >
      <span className="text-xs text-white/50">{icon} {label}</span>
      <p className={`font-display text-xl ${highlight ? 'text-neon' : 'text-white'}`}>
        {value}
      </p>
    </div>
  );
}

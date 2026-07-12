import { getResultMessage } from '../data/situations';

interface ResultsScreenProps {
  correct: number;
  total: number;
  bestStreak: number;
  onPlayAgain: () => void;
}

export default function ResultsScreen({
  correct,
  total,
  bestStreak,
  onPlayAgain,
}: ResultsScreenProps) {
  const pct = total > 0 ? Math.round((correct / total) * 100) : 0;

  return (
    <div className="relative z-10 flex min-h-dvh flex-col items-center justify-center px-6 py-10 animate-pop-in">
      <div className="w-full max-w-sm rounded-3xl border-2 border-[var(--color-purple)]/50 bg-gradient-to-b from-[#2d1b69]/90 to-[#0f0720]/90 p-8 text-center shadow-2xl shadow-purple-500/20 backdrop-blur-lg">
        <div className="text-5xl">
          {pct === 100 ? '🏆' : pct >= 80 ? '🌟' : pct >= 60 ? '👍' : '💪'}
        </div>

        <h2 className="mt-4 bg-gradient-to-r from-orange-400 via-pink-500 to-violet-500 bg-clip-text text-3xl font-extrabold text-transparent">
          Round Complete!
        </h2>

        <p className="mt-4 text-lg text-cyan-300">
          You got{' '}
          <span className="text-2xl font-bold text-[var(--color-yes)]">{correct}</span>{' '}
          out of{' '}
          <span className="font-bold">{total}</span> right
        </p>

        <div className="mt-5 flex justify-center gap-6">
          <div>
            <p className="text-xs uppercase tracking-wider text-white/50">Score</p>
            <p className="text-3xl font-bold text-[var(--color-yellow)]">{pct}%</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider text-white/50">Best Streak</p>
            <p className="text-3xl font-bold text-[var(--color-cyan)]">{bestStreak}</p>
          </div>
        </div>

        <p className="mt-5 text-sm text-white/70">{getResultMessage(pct)}</p>

        <button
          type="button"
          onClick={onPlayAgain}
          className="mt-8 w-full rounded-full bg-gradient-to-r from-[var(--color-yes)] to-[var(--color-cyan)] px-8 py-4 text-lg font-bold text-[#0f0720] shadow-lg transition-transform active:scale-95 hover:scale-[1.02] animate-pulse-glow"
        >
          Play Again
        </button>
      </div>
    </div>
  );
}

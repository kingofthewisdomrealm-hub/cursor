import { useEffect } from 'react';
import type { GameState } from '../hooks/useGame';
import SituationCard from './SituationCard';
import DropZone from './DropZone';
import Scoreboard from './Scoreboard';
import ProgressBar from './ProgressBar';

interface GameScreenProps {
  game: GameState;
  onFinish: () => void;
}

export default function GameScreen({ game, onFinish }: GameScreenProps) {
  useEffect(() => {
    if (game.total > 0 && game.remaining === 0 && !game.current) {
      const timer = setTimeout(onFinish, 300);
      return () => clearTimeout(timer);
    }
  }, [game.remaining, game.current, game.total, onFinish]);

  if (!game.current) {
    return (
      <div className="relative z-10 flex min-h-dvh items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-white/20 border-t-cyan-400" />
      </div>
    );
  }

  return (
    <div className="relative z-10 flex min-h-dvh flex-col px-4 pb-6 pt-5">
      <header className="text-center">
        <h1 className="bg-gradient-to-r from-orange-400 via-pink-500 to-violet-500 bg-clip-text text-2xl font-bold text-transparent">
          Yes or No?
        </h1>
        <p className="mt-0.5 text-sm text-cyan-300/70">Drag or tap your answer</p>
      </header>

      <div className="mt-4">
        <ProgressBar current={game.answered} total={game.total} />
      </div>

      <div className="mt-4">
        <Scoreboard
          correct={game.correct}
          streak={game.streak}
          remaining={game.remaining}
        />
      </div>

      <div className="mt-5 flex flex-1 flex-col gap-4">
        <SituationCard
          situation={game.current}
          anim={game.cardAnim}
          locked={game.locked}
          onAnswer={game.answer}
        />

        <div className="grid flex-1 grid-cols-2 gap-3">
          <DropZone
            type="yes"
            active={!game.locked}
            onDrop={() => game.answer('yes')}
          />
          <DropZone
            type="no"
            active={!game.locked}
            onDrop={() => game.answer('no')}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            disabled={game.locked}
            onClick={() => game.answer('yes')}
            className="rounded-2xl bg-[var(--color-yes)] py-3.5 text-sm font-bold text-[#0f0720] transition-transform active:scale-95 disabled:opacity-50"
          >
            ✓ Say Yes
          </button>
          <button
            type="button"
            disabled={game.locked}
            onClick={() => game.answer('no')}
            className="rounded-2xl bg-[var(--color-no)] py-3.5 text-sm font-bold text-white transition-transform active:scale-95 disabled:opacity-50"
          >
            ✗ Say No
          </button>
        </div>
      </div>

      {game.feedback && (
        <div
          className={`fixed bottom-8 left-1/2 z-50 -translate-x-1/2 rounded-full px-6 py-3 text-sm font-semibold shadow-xl animate-pop-in ${
            game.feedback.type === 'correct'
              ? 'bg-[var(--color-yes)] text-[#0f0720]'
              : 'bg-[var(--color-yellow)] text-[#0f0720]'
          }`}
        >
          {game.feedback.message}
        </div>
      )}
    </div>
  );
}

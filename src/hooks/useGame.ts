import { useCallback, useState } from 'react';
import { type Answer, type Situation, SITUATIONS, shuffle } from '../data/situations';

export interface GameState {
  deck: Situation[];
  correct: number;
  streak: number;
  bestStreak: number;
  total: number;
  current: Situation | null;
  remaining: number;
  answered: number;
  feedback: { message: string; type: 'correct' | 'wrong' } | null;
  cardAnim: 'idle' | 'fly-off' | 'shake';
  locked: boolean;
  start: () => void;
  answer: (choice: Answer) => void;
}

export function useGame(): GameState {
  const [deck, setDeck] = useState<Situation[]>([]);
  const [correct, setCorrect] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [total, setTotal] = useState(0);
  const [feedback, setFeedback] = useState<GameState['feedback']>(null);
  const [cardAnim, setCardAnim] = useState<GameState['cardAnim']>('idle');
  const [locked, setLocked] = useState(false);

  const start = useCallback(() => {
    setDeck(shuffle(SITUATIONS));
    setCorrect(0);
    setStreak(0);
    setBestStreak(0);
    setTotal(SITUATIONS.length);
    setFeedback(null);
    setCardAnim('idle');
    setLocked(false);
  }, []);

  const answer = useCallback(
    (choice: Answer) => {
      if (locked || deck.length === 0) return;

      const current = deck[0];
      const isCorrect = current.answer === choice;
      setLocked(true);

      if (isCorrect) {
        setCorrect((c) => c + 1);
        setStreak((s) => {
          const next = s + 1;
          setBestStreak((b) => Math.max(b, next));
          return next;
        });
        setCardAnim('fly-off');
        setFeedback({
          message: ['Nice!', 'You got it!', 'Spot on!', 'Great call!'][
            Math.floor(Math.random() * 4)
          ],
          type: 'correct',
        });
      } else {
        setStreak(0);
        setCardAnim('shake');
        setFeedback({
          message:
            current.answer === 'yes'
              ? 'Yes was the better call here.'
              : 'No was the better call here.',
          type: 'wrong',
        });
      }

      setTimeout(
        () => {
          setDeck((d) => d.slice(1));
          setCardAnim('idle');
          setFeedback(null);
          setLocked(false);
        },
        isCorrect ? 450 : 600,
      );
    },
    [deck, locked],
  );

  return {
    deck,
    correct,
    streak,
    bestStreak,
    total,
    current: deck[0] ?? null,
    remaining: deck.length,
    answered: total - deck.length,
    feedback,
    cardAnim,
    locked,
    start,
    answer,
  };
}

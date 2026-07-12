import { useState } from 'react';
import WelcomeScreen from './components/WelcomeScreen';
import GameScreen from './components/GameScreen';
import ResultsScreen from './components/ResultsScreen';
import { useGame } from './hooks/useGame';

type Screen = 'welcome' | 'playing' | 'results';

export default function App() {
  const [screen, setScreen] = useState<Screen>('welcome');
  const game = useGame();

  const startGame = () => {
    game.start();
    setScreen('playing');
  };

  const handleFinish = () => setScreen('results');

  const playAgain = () => {
    game.start();
    setScreen('playing');
  };

  return (
    <div className="app-shell">
      <div className="bg-orb bg-orb-1" />
      <div className="bg-orb bg-orb-2" />
      <div className="bg-orb bg-orb-3" />

      {screen === 'welcome' && <WelcomeScreen onStart={startGame} />}
      {screen === 'playing' && (
        <GameScreen game={game} onFinish={handleFinish} />
      )}
      {screen === 'results' && (
        <ResultsScreen
          correct={game.correct}
          total={game.total}
          bestStreak={game.bestStreak}
          onPlayAgain={playAgain}
        />
      )}
    </div>
  );
}

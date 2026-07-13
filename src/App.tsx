import { useState, useEffect, useRef } from 'react'
import { GameHeader } from './components/GameHeader'
import { CommunicationBoard } from './components/CommunicationBoard'
import { GenerateTraitButton } from './components/GenerateTraitButton'
import { AscendButton } from './components/AscendButton'
import { LearningCardModal } from './components/LearningCardModal'
import { CollectionScreen } from './components/CollectionScreen'
import { ChallengePanel } from './components/ChallengePanel'
import { SettingsModal } from './components/SettingsModal'
import { BottomNavigation } from './components/BottomNavigation'
import { PointAnimation } from './components/PointAnimation'
import { AscensionCelebration } from './components/AscensionCelebration'
import { useGameProgress } from './hooks/useGameProgress'
import { useGameBoard } from './hooks/useGameBoard'
import { useSound } from './hooks/useSound'
import { canAscend } from './lib/boardLogic'
import { getRankProgress } from './config/ranks'
import type { TileId, ViewId } from './types/game'

function App() {
  const progress = useGameProgress()
  const { state, rank, nextRank, popups, completeLearningChallenge, updateSettings, resetProgress } =
    progress
  const { play } = useSound(state.settings.soundEnabled)
  const board = useGameBoard(progress, play)

  const [view, setView] = useState<ViewId>('game')
  const [learningTile, setLearningTile] = useState<TileId | null>(null)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const prevRankRef = useRef(rank.id)

  const showAscend = canAscend(state.board) && !state.hasLegendary

  useEffect(() => {
    if (rank.id > prevRankRef.current) {
      play('rankUp')
      prevRankRef.current = rank.id
    }
  }, [rank.id, play])

  useEffect(() => {
    document.body.style.overflow = view === 'game' ? 'hidden' : 'auto'
  }, [view])

  const handleDoubleTap = (tileId: TileId) => {
    setLearningTile(tileId)
  }

  return (
    <div className="game-container relative">
      {view === 'game' && (
        <>
          <GameHeader
            points={state.points}
            rankName={rank.name}
            nextRankName={nextRank?.name}
            progressPercent={getRankProgress(state.points)}
          />
          <div className="flex-1 overflow-y-auto px-3 pb-32">
            <CommunicationBoard
              board={state.board}
              selectedIndex={board.selectedIndex}
              mergingIndices={board.mergingIndices}
              generatingIndex={board.generatingIndex}
              onCellTap={board.handleCellTap}
              onDrop={board.handleDrop}
              onDoubleTapTile={handleDoubleTap}
            />
            <GenerateTraitButton
              onGenerate={board.generateTrait}
              disabled={board.boardFull || board.cooldown}
              boardFull={board.boardFull}
              cooldown={board.cooldown}
            />
            {showAscend && (
              <div className="px-4 mt-2">
                <AscendButton onAscend={board.ascend} />
              </div>
            )}
          </div>
        </>
      )}

      {view === 'collection' && (
        <CollectionScreen
          discoveredTiles={state.discoveredTiles}
          onSelectTile={(id) => setLearningTile(id)}
          onBack={() => setView('game')}
        />
      )}

      {view === 'challenges' && (
        <ChallengePanel state={state} onBack={() => setView('game')} />
      )}

      <BottomNavigation
        currentView={view === 'settings' ? 'settings' : view}
        onNavigate={(v) => {
          if (v === 'settings') setSettingsOpen(true)
          else setView(v)
        }}
      />

      <LearningCardModal
        tileId={learningTile}
        completed={learningTile ? state.completedLearningChallenges.includes(learningTile) : false}
        onClose={() => setLearningTile(null)}
        onComplete={(id) => {
          completeLearningChallenge(id)
          play('challenge')
        }}
      />

      <SettingsModal
        open={settingsOpen || view === 'settings'}
        soundEnabled={state.settings.soundEnabled}
        animationsEnabled={state.settings.animationsEnabled}
        onClose={() => {
          setSettingsOpen(false)
          if (view === 'settings') setView('game')
        }}
        onToggleSound={() => updateSettings({ soundEnabled: !state.settings.soundEnabled })}
        onToggleAnimations={() =>
          updateSettings({ animationsEnabled: !state.settings.animationsEnabled })
        }
        onReset={resetProgress}
      />

      <PointAnimation popups={popups} />
      <AscensionCelebration show={board.showAscension} />
    </div>
  )
}

export default App

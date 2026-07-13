import { useState, useEffect, useRef, useCallback } from 'react'
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
import { StageBattleModal } from './components/StageBattleModal'
import { useGameProgress } from './hooks/useGameProgress'
import { useGameBoard } from './hooks/useGameBoard'
import { useSound } from './hooks/useSound'
import { canAscend } from './lib/boardLogic'
import { getRankProgress } from './config/ranks'
import { getStage } from './config/stages'
import type { TileId, ViewId } from './types/game'

function App() {
  const progress = useGameProgress()
  const {
    state,
    rank,
    nextRank,
    popups,
    completeLearningChallenge,
    updateSettings,
    resetProgress,
    completeStage,
  } = progress
  const { play } = useSound(state.settings.soundEnabled)
  const board = useGameBoard(progress, play)

  const [view, setView] = useState<ViewId>('game')
  const [learningTile, setLearningTile] = useState<TileId | null>(null)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [activeStage, setActiveStage] = useState<number | null>(null)
  const prevRankRef = useRef(rank.id)

  const showAscend = canAscend(state.board) && !state.hasLegendary

  useEffect(() => {
    if (rank.id > prevRankRef.current) {
      play('rankUp')
      const stageId = rank.id - 1
      const stage = getStage(stageId)
      if (stage && !state.clearedStages.includes(stageId)) {
        setActiveStage(stageId)
      }
      prevRankRef.current = rank.id
    }
  }, [rank.id, play, state.clearedStages])

  useEffect(() => {
    document.body.style.overflow = view === 'game' ? 'hidden' : 'auto'
  }, [view])

  const handleDoubleTap = (tileId: TileId) => {
    setLearningTile(tileId)
  }

  const handleStageComplete = useCallback(
    (stageId: number, reward: number) => {
      completeStage(stageId, reward)
      play('challenge')
      setActiveStage(null)
    },
    [completeStage, play],
  )

  const handleReset = useCallback(() => {
    resetProgress()
    prevRankRef.current = 1
    setActiveStage(null)
  }, [resetProgress])

  return (
    <div className="game-container relative">
      {view === 'game' && (
        <div className="game-screen">
          <GameHeader
            points={state.points}
            rankName={rank.name}
            zoneName={rank.zone}
            nextRankName={nextRank?.name}
            progressPercent={getRankProgress(state.points)}
            clearedStages={state.clearedStages}
          />
          <div className="game-board-area">
            <CommunicationBoard
              board={state.board}
              selectedIndex={board.selectedIndex}
              mergingIndices={board.mergingIndices}
              generatingIndex={board.generatingIndex}
              onCellTap={board.handleCellTap}
              onDrop={board.handleDrop}
              onDoubleTapTile={handleDoubleTap}
            />
          </div>
          <div className="game-actions">
            <GenerateTraitButton
              onGenerate={board.generateTrait}
              disabled={board.boardFull}
              boardFull={board.boardFull}
              compact
            />
            {showAscend && <AscendButton onAscend={board.ascend} compact />}
          </div>
          {board.boardFull && (
            <p className="text-[10px] text-center text-slate-500 px-3 pb-0.5 shrink-0">
              Board full — fuse or reposition speakers
            </p>
          )}
        </div>
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

      <StageBattleModal
        stageId={activeStage}
        board={state.board}
        points={state.points}
        onComplete={handleStageComplete}
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
        onReset={handleReset}
      />

      <PointAnimation popups={popups} />
      <AscensionCelebration show={board.showAscension} />
    </div>
  )
}

export default App
